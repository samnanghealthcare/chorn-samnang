"""Original score + sound effects, synthesised with numpy (no third-party audio,
so no licensing questions), then mixed under the original narration.

Outputs
  assets/music/bg_music.wav            cinematic ambient score (D minor), 48 kHz stereo
  assets/sound_effects/*.wav           individual synthesised SFX
  output/sfx_track.wav                 SFX placed on the cue timeline
  output/mix.wav                       final mix: voice + ducked music + SFX,
                                       loudness-normalised to -16 LUFS, TP <= -1.5 dBTP
"""
import os, sys, json, subprocess, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import *

SR = 48000
N = int(DURATION * SR) + SR // 2
rng = np.random.default_rng(7)

def write(path, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())

def lp(x, fc):
    """One-pole low-pass (fc may be an array for sweeps)."""
    a = np.exp(-2 * np.pi * np.asarray(fc, dtype=float) / SR) * np.ones_like(x)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):          # numba-free but fine for short SFX
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y

def lp_fast(x, fc):
    """Fixed-cutoff low-pass via FFT (for long music stems)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

def env(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    ia, ir = int(a * SR), int(r * SR)
    if ia: e[:ia] = np.linspace(0, sustain, ia)
    if ir: e[-ir:] *= np.linspace(1, 0, ir) ** 2
    return e

def note(f): return 440.0 * 2 ** ((f - 69) / 12)

# ------------------------------------------------------------------ SFX
def sfx_whoosh(d=0.7):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.normal(0, 1, n)
    fc = 300 + 5000 * np.sin(np.pi * t / d) ** 2
    y = lp(x, fc) - lp(x, fc * 0.25)
    return y * np.sin(np.pi * t / d) ** 1.5 * 0.9

def sfx_impact(d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    f = 55 * np.exp(-t * 3) + 32
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    noise = lp(rng.normal(0, 1, n), 900) * np.exp(-t * 18) * 2.5
    return np.tanh((body + noise) * 1.4) * 0.9

def sfx_click(): t = np.arange(int(.03 * SR)) / SR; return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 260) * 0.8

def sfx_beep():
    t = np.arange(int(.09 * SR)) / SR; b = np.sin(2 * np.pi * 1320 * t) * env(len(t), .004, .03)
    return np.concatenate([b, np.zeros(int(.05 * SR)), b * 0.8]) * 0.45

def sfx_pop():
    t = np.arange(int(.12 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(700 * np.exp(-t * 25) + 260) / SR) * np.exp(-t * 32) * 0.8

def sfx_hydraulic(d=3.2):
    """Jack lifting: pump strokes + hiss + low motor hum."""
    n = int(d * SR); t = np.arange(n) / SR
    hum = (np.sin(2 * np.pi * 48 * t) + 0.5 * np.sin(2 * np.pi * 96 * t)) * 0.25
    hiss = lp(rng.normal(0, 1, n), 2500) * 0.18
    strokes = (0.5 + 0.5 * np.sin(2 * np.pi * 1.6 * t)) ** 6
    knock = np.zeros(n)
    for k in np.arange(0.2, d, 1 / 1.6):
        i = int(k * SR); m = min(n - i, int(.08 * SR)); tt = np.arange(m) / SR
        knock[i:i + m] += np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 60) * 0.5
    return (hum + hiss * strokes + knock) * env(n, .3, .6)

def sfx_draw(d=1.6):
    """Pencil / technical-pen scratch for blueprint draw-on."""
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.normal(0, 1, n); y = x - lp(x, 2500)
    am = 0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 5.3 * t + np.sin(2 * np.pi * 1.1 * t)))
    return y * am * env(n, .1, .4) * 0.22

def sfx_riser(d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.normal(0, 1, n); fc = 200 + 7000 * (t / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * (t / d) ** 2) / SR) * 0.15
    return (lp(x, fc) * 0.8 + tone) * (t / d) ** 2

def sfx_mech(d=1.0):
    """Mechanical clunk + short whir (exploded view assembly / lock)."""
    n = int(d * SR); t = np.arange(n) / SR
    whir = np.sin(2 * np.pi * np.cumsum(300 + 500 * t / d) / SR) * 0.12 * env(n, .05, .3)
    clunk = np.zeros(n); i = int(.75 * d * SR); m = n - i; tt = np.arange(m) / SR
    clunk[i:] = (np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 25) + lp(rng.normal(0, 1, m), 1500) * np.exp(-tt * 40)) * 0.8
    return whir + clunk

SFX = dict(whoosh=sfx_whoosh, impact=sfx_impact, click=sfx_click, beep=sfx_beep, pop=sfx_pop,
           hydraulic=sfx_hydraulic, draw=sfx_draw, riser=sfx_riser, mech=sfx_mech)

def sfx_events():
    """(time, sfx, gain_dB) — every SFX is tied to an on-screen event."""
    C = CUE; ev = []
    for sid, a, b, _ in SCENES[1:]:
        ev.append((a - 0.35, "whoosh", -20))                     # scene transitions
    ev += [(5.75, "draw", -20), (6.6, "impact", -16), (8.0, "pop", -22), (8.25, "pop", -22),
           (8.6, "riser", -21), (C["jacking_word"] - 0.05, "impact", -11),
           (12.2, "draw", -22), (14.3, "mech", -16), (C["aircraft_jack"], "beep", -18),
           (17.9, "hydraulic", -17), (19.6, "hydraulic", -15), (C["gear_wheels"], "beep", -19),
           (25.45, "impact", -15)]
    ev += [(C[k], "click", -16) for k in ("task1", "task2", "task3", "task4")]
    ev += [(40.2, "draw", -20), (C["jp_title"], "click", -16)]
    ev += [(C[k], "pop", -16) for k in ("jp_nose", "jp_left", "jp_right")]
    ev += [(52.3, "draw", -22), (53.2, "hydraulic", -20), (54.5, "impact", -20), (C["load"] + 1.8, "beep", -20),
           (59.0, "click", -14), (C["prepare"], "impact", -16)]
    ev += [(C[k] + 0.5, "beep", -20) for k in ("chk_weight", "chk_capacity", "chk_wind", "chk_ground")]
    ev += [(C["chock"], "mech", -14), (C["equipment"], "click", -16),
           (C["safety"], "impact", -12), (C["priority"], "click", -14),
           (C["leveling_word"], "pop", -16), (C["weighing_word"], "pop", -16),
           (80.4, "draw", -21), (84.3, "beep", -19), (85.8, "draw", -21),
           (C["weight_cg"], "click", -16), (C["cg"], "click", -16), (C["cg"] + 1.6, "pop", -15),
           (C["knowledge"], "pop", -17), (C["precision"], "pop", -17), (C["safety2"], "impact", -16),
           (105.0, "riser", -24), (C["outro"], "whoosh", -16)]
    return ev

def build_sfx():
    out = np.zeros((N, 2)); rendered = {}
    os.makedirs(A("assets/sound_effects"), exist_ok=True)
    for t, name, gdb in sfx_events():
        if name not in rendered:
            rendered[name] = SFX[name]()
            write(A("assets/sound_effects", name + ".wav"), rendered[name] * 0.9)
        x = rendered[name] * 10 ** (gdb / 20) * 4.0
        i = int(max(0, t) * SR); m = min(len(x), N - i)
        pan = 0.5 + 0.12 * np.sin(t * 1.7)                       # slight stereo movement
        out[i:i + m, 0] += x[:m] * np.sqrt(1 - pan); out[i:i + m, 1] += x[:m] * np.sqrt(pan)
    return out

# ------------------------------------------------------------------ music
def build_music():
    t = np.arange(N) / SR
    L = np.zeros(N); R = np.zeros(N)
    # D minor: i - VI - III - VII  (Dm, Bb, F, C), one chord per 5.6 s
    chords = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 53, 57, 60], [48, 55, 60, 64]]
    seg = 5.6
    nseg = int(np.ceil(DURATION / seg)) + 1
    for k in range(nseg):
        ch = chords[k % 4] if k * seg < 106 else chords[0]
        i0 = int(k * seg * SR); i1 = min(N, int((k + 1) * seg * SR + 1.2 * SR))
        n = i1 - i0
        if n <= 0: continue
        tt = np.arange(n) / SR
        e = env(n, 1.6, 1.8)
        for j, m in enumerate(ch):
            f = note(m + 12)
            for det, side in ((-0.06, 0), (0.06, 1)):       # detuned pair -> stereo width
                ph = 2 * np.pi * f * (1 + det / 100) * tt + j
                saw = 2 * ((f * (1 + det / 100) * tt + j * 0.13) % 1) - 1
                v = (0.55 * np.sin(ph) + 0.22 * saw) * e * 0.05
                (L if side == 0 else R)[i0:i1] += v
        # sub bass on the root
        bass = np.sin(2 * np.pi * note(ch[0] - 12) * tt) * env(n, .4, 1.0) * 0.10
        L[i0:i1] += bass; R[i0:i1] += bass
    L = lp_fast(L, 1800); R = lp_fast(R, 1800)
    # soft arpeggio pulse (16th = 84 bpm) from the title until the final line
    bpm = 84; step = 60 / bpm / 2
    arp = np.zeros(N)
    for i, st in enumerate(np.arange(10.0, 106.3, step)):
        ch = chords[int(st // seg) % 4]
        m = ch[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 24
        n = int(0.35 * SR); a0 = int(st * SR)
        if a0 + n >= N: break
        tt = np.arange(n) / SR
        arp[a0:a0 + n] += (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 9) * 0.035
    arp = lp_fast(arp, 3500)
    # gentle low pulse on beats in the "process" section (27 s .. 96 s)
    pulse = np.zeros(N)
    for st in np.arange(27.0, 96.0, 60 / bpm):
        n = int(.25 * SR); a0 = int(st * SR); tt = np.arange(n) / SR
        pulse[a0:a0 + n] += np.sin(2 * np.pi * (60 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14) * 0.09
    # air / shimmer bed
    air = lp_fast(rng.normal(0, 1, N), 6000) - lp_fast(rng.normal(0, 1, N), 1500)
    air *= 0.006
    mus = np.stack([L + arp * 1.0 + pulse + air, R + arp * 0.85 + pulse + air], 1)
    # global envelope: fade in, lift at title, settle at the end
    g = np.ones(N)
    g *= np.clip(t / 2.5, 0, 1)
    g *= np.where(t > DURATION - 2.2, np.clip((DURATION + 0.3 - t) / 2.5, 0, 1), 1)
    mus *= g[:, None]
    mus /= np.max(np.abs(mus)) + 1e-9
    return mus * 0.8

def run(cmd): subprocess.run(cmd, check=True)

def main():
    os.makedirs(A("output"), exist_ok=True)
    write(A("assets/music/bg_music.wav"), build_music())
    write(A("output/sfx_track.wav"), build_sfx())
    voice = A("output/voice_48k.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", AUDIO, "-af", "highpass=f=70,aresample=48000", "-ac", "2", voice])
    # music ducked by the voice (sidechain), SFX under voice, then combined
    fc = ("[1:a]volume=0.095[m];"
          "[m][0:a]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=500:makeup=1[md];"
          "[2:a]volume=0.5[s];"
          "[0:a][md][s]amix=inputs=3:duration=first:normalize=0[mix]")
    pre = A("output/mix_pre.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-i", A("assets/music/bg_music.wav"), "-i", A("output/sfx_track.wav"),
         "-filter_complex", fc, "-map", "[mix]", "-ar", "48000", pre])
    # two-pass loudnorm to -16 LUFS / -1.5 dBTP
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    js = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", ln + ",alimiter=limit=0.84:level=disabled", "-ar", "48000", A("output/mix.wav")])
    print("audio done")

if __name__ == "__main__":
    main()
