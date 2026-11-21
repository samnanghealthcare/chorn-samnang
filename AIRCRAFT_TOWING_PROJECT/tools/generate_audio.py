"""
Procedural sound design for AIRCRAFT TOWING documentary.

Generates (all original, synthesised with numpy, no third-party samples):
  public/audio/background_music/score.wav   cinematic documentary score (48 kHz stereo)
  public/audio/sound_effects/<type>.wav     one file per SFX type
  public/audio/final_mix.wav                narration + ducked score + SFX (48 kHz stereo)

The narration (audio.source.wav) is only resampled to 48 kHz; it is NOT edited, cut or
processed. Music is ducked automatically under the voice (sidechain from the narration).

Usage:  python3 tools/generate_audio.py
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(7)
TL = json.load(open(os.path.join(ROOT, "src/data/timeline.json")))
DUR = TL["duration"]
N = int(round(DUR * SR))


# ---------------------------------------------------------------- helpers
def db(x):
    return 10 ** (x / 20)


def write_wav(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def read_narration():
    src = os.path.join(ROOT, "audio.source.wav")
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR),
                          "-af", "aresample=resampler=soxr", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    v = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]
    return out


def fft_conv(x, h):
    n = len(x) + len(h) - 1; L = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(h, L), L)[:n]


def reverb_ir(seconds=2.6, decay=3.2, seed=0):
    r = np.random.default_rng(seed)
    t = np.arange(int(seconds * SR)) / SR
    ir = r.standard_normal((len(t), 2)) * np.exp(-decay * t)[:, None]
    # darken tail
    for c in range(2):
        ir[:, c] = onepole(ir[:, c], 3500)
    ir[0] = 0
    return ir / np.sqrt((ir ** 2).sum(0))


def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    # vectorised IIR via lfilter-free approach: use FFT approximation of one-pole low-pass
    L = 1 << (len(x) - 1).bit_length()
    f = np.fft.rfftfreq(L, 1 / SR)
    H = (1 - a) / (1 - a * np.exp(-2j * np.pi * f / SR))
    return np.fft.irfft(np.fft.rfft(x, L) * H, L)[:len(x)]


def bandpass_fft(x, lo, hi):
    L = 1 << (len(x) - 1).bit_length()
    f = np.fft.rfftfreq(L, 1 / SR)
    X = np.fft.rfft(x, L)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, L)[:len(x)]


def env_adsr(n, a, r, sustain_len=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    rel_start = n / SR - r
    e *= np.clip((n / SR - t) / max(r, 1e-4), 0, 1) if r > 0 else 1
    return e


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- music
def pad_note(f, n, bright=1.0, detunes=(-0.09, 0.0, 0.11), nh=9):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in detunes:
        ff = f * 2 ** (d / 12)
        ph = rng.uniform(0, 2 * np.pi)
        for k in range(1, nh + 1):
            if ff * k > 6000: break
            out += np.sin(2 * np.pi * ff * k * t + ph * k) / (k ** (1.7 - 0.5 * bright))
    return out / len(detunes)


def chord_track(prog, bar, start, end, bright=1.0, level=1.0, octave_shift=0):
    n = int((end - start) * SR)
    out = np.zeros(n)
    t0 = 0
    i = 0
    while t0 < n:
        notes = prog[i % len(prog)]
        L = min(int(bar * SR), n - t0)
        seg = np.zeros(L)
        for m in notes:
            seg += pad_note(midi(m + octave_shift), L, bright)
        # crossfade-friendly envelope
        a = min(0.6, bar * 0.3); r = min(0.8, bar * 0.35)
        tt = np.arange(L) / SR
        e = np.minimum(1, tt / a) * np.clip((L / SR - tt) / r + 0.25, 0, 1)
        out[t0:t0 + L] += seg * e * level
        t0 += L; i += 1
    return out


def arp_track(prog, bar, start, end, level=1.0, steps=8, octave=12):
    n = int((end - start) * SR)
    out = np.zeros(n)
    step = bar / steps
    nstep = int((end - start) / step)
    for s in range(nstep):
        notes = prog[int(s // steps) % len(prog)]
        m = sorted(notes)[1:] + [sorted(notes)[1] + 12]
        f = midi(m[s % len(m)] + octave)
        L = int(min(0.9, step * 3) * SR)
        tt = np.arange(L) / SR
        tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) + 0.1 * np.sin(6 * np.pi * f * tt))
        tone *= np.exp(-tt * 5.5) * np.minimum(1, tt / 0.004)
        i0 = int(s * step * SR)
        L2 = min(L, n - i0)
        if L2 > 0:
            out[i0:i0 + L2] += tone[:L2] * level * (0.8 if s % 2 else 1.0)
    return out


def perc_track(bar, start, end, level=1.0):
    n = int((end - start) * SR)
    out = np.zeros(n)
    beat = bar / 4
    # soft kick on 1 & 3, closed hat on 8ths, rim tick on 4
    kickL = int(0.35 * SR); tk = np.arange(kickL) / SR
    kick = np.sin(2 * np.pi * (45 + 60 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 9)
    hatL = int(0.06 * SR); hat = bandpass_fft(rng.standard_normal(hatL), 6000, 14000) * np.exp(-np.arange(hatL) / SR * 60)
    hat /= np.abs(hat).max() + 1e-9
    for b in range(int((end - start) / beat * 2)):
        i0 = int(b * beat / 2 * SR)
        if i0 >= n: break
        if b % 4 == 0:
            L = min(kickL, n - i0); out[i0:i0 + L] += kick[:L] * 0.9
        L = min(hatL, n - i0); out[i0:i0 + L] += hat[:L] * (0.22 if b % 2 else 0.12)
    # fade edges
    f = int(1.0 * SR)
    out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    return out * level


def build_score():
    BPM = 84; bar = 4 * 60 / BPM
    music = np.zeros(N)
    def put(x, start):
        i0 = int(start * SR); L = min(len(x), N - i0); music[i0:i0 + L] += x[:L]

    # A minor documentary palette
    AM, F, C, G, DM, EM = [45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62], [50, 57, 62, 65], [40, 55, 59, 64]
    sec = {m["name"]: m for m in TL["music"]}

    # INTRO: dramatic drone + swell into title impact
    s, e = sec["intro"]["start"], sec["intro"]["end"]
    n = int((e - s) * SR); t = np.arange(n) / SR
    drone = (np.sin(2 * np.pi * 55 * t) * 0.6 + np.sin(2 * np.pi * 27.5 * t) * 0.5 + pad_note(110, n, 0.6) * 0.5)
    drone *= np.minimum(1, t / 3.0)
    swell = chord_track([AM], 12.71, s, e, bright=0.8, level=0.6)
    swell *= np.clip((t - 5.6) / 0.4, 0, 1)
    put((drone * 0.5 + swell) * np.clip((e - s - t) / 1.2 + 0.4, 0.4, 1), s)

    # MAIN: modern documentary bed
    s, e = sec["main"]["start"], sec["main"]["end"]
    put(chord_track([AM, F, C, G], bar * 2, s - 0.4, e + 1.0, bright=0.9, level=0.55), s - 0.4)
    arp = arp_track([AM, F, C, G], bar * 2, s, e, level=0.16, steps=16)
    tt = np.arange(len(arp)) / SR
    arp *= np.minimum(1, tt / 4)
    put(arp, s)
    for (a, b) in TL["rhythm"]:
        put(perc_track(bar, a, b, level=0.32), a)

    # RECAP: brighter, octave arpeggio
    s, e = sec["recap"]["start"], sec["recap"]["end"]
    put(chord_track([F, C, G, AM], bar * 2, s, e + 1.0, bright=1.1, level=0.55), s)
    put(arp_track([F, C, G, AM], bar * 2, s, e, level=0.2, steps=16, octave=24), s)
    put(perc_track(bar, s + 3.8, e - 0.5, level=0.22), s + 3.8)

    # OUTRO: inspirational lift, long final chord, fade out
    s, e = sec["outro"]["start"], sec["outro"]["end"]
    n = int((e - s) * SR); t = np.arange(n) / SR
    out = chord_track([F, G, AM, C, F, G], bar * 1.25, s, e - 4.2, bright=1.2, level=0.6)
    out = np.concatenate([out, np.zeros(n - len(out))])
    fin = chord_track([[48, 60, 64, 67, 72]], 6.0, 0, 6.0, bright=1.3, level=0.7)
    i0 = n - int(4.2 * SR); L = min(len(fin), n - i0); out[i0:i0 + L] += fin[:L]
    out += arp_track([F, G, AM, C], bar * 1.25, s, e, level=0.15, steps=8, octave=24)[:n]
    out *= np.clip((e - s - t) / 3.0, 0, 1) ** 1.5
    put(out, s)

    # stereo widen + reverb
    st = np.stack([music, np.roll(music, int(0.011 * SR))], 1)
    ir = reverb_ir(2.8, 2.6, 1)
    wet = np.stack([fft_conv(st[:, 0], ir[:, 0])[:N], fft_conv(st[:, 1], ir[:, 1])[:N]], 1)
    mix = st * 0.7 + wet * 0.9
    mix /= np.abs(mix).max() + 1e-9
    return mix * db(-3)


# ---------------------------------------------------------------- SFX
def sfx(kind, dur=None):
    if kind == "impact":
        L = int(4.0 * SR); t = np.arange(L) / SR
        boom = np.sin(2 * np.pi * (32 + 70 * np.exp(-t * 12)) * t) * np.exp(-t * 1.6)
        hit = bandpass_fft(rng.standard_normal(L), 80, 4000) * np.exp(-t * 18)
        x = boom * 1.0 + hit * 0.35
        x = x + fft_conv(x, reverb_ir(3.0, 1.8, 3)[:, 0])[:L] * 0.25
    elif kind == "impact_soft":
        L = int(2.5 * SR); t = np.arange(L) / SR
        x = np.sin(2 * np.pi * (40 + 50 * np.exp(-t * 14)) * t) * np.exp(-t * 2.5)
        x += bandpass_fft(rng.standard_normal(L), 300, 6000) * np.exp(-t * 25) * 0.15
        x += fft_conv(x, reverb_ir(2.0, 2.5, 4)[:, 0])[:L] * 0.2
    elif kind == "riser":
        L = int((dur or 2.5) * SR); t = np.arange(L) / SR; p = t / t[-1]
        x = bandpass_fft(rng.standard_normal(L), 400, 9000) * p ** 2.2
        x += np.sin(2 * np.pi * np.cumsum(200 + 900 * p ** 2) / SR) * p ** 3 * 0.25
    elif kind == "whoosh":
        L = int(1.1 * SR); t = np.arange(L) / SR
        nz = rng.standard_normal(L)
        # moving band: crossfade between filtered versions
        lo = bandpass_fft(nz, 200, 1200); hi = bandpass_fft(nz, 1500, 7000)
        p = t / t[-1]
        x = (lo * (1 - p) + hi * p) * np.sin(np.pi * p) ** 2
    elif kind == "click":
        L = int(0.6 * SR); t = np.arange(L) / SR
        x = np.zeros(L)
        for off, g in [(0.0, 1.0), (0.085, 0.7)]:
            i = int(off * SR); tt = t[: L - i]
            c = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2100, 60), (3400, 80), (5200, 110), (900, 40)])
            c += rng.standard_normal(len(tt)) * np.exp(-tt * 300) * 1.5
            x[i:] += c * g
    elif kind == "hydraulic":
        L = int(1.8 * SR); t = np.arange(L) / SR; p = t / t[-1]
        x = bandpass_fft(rng.standard_normal(L), 1500, 9000) * np.sin(np.pi * p) ** 0.7
        x += np.sin(2 * np.pi * np.cumsum(90 + 40 * p) / SR) * 0.3 * np.sin(np.pi * p)
    elif kind == "tug_engine":
        L = int((dur or 3.0) * SR); t = np.arange(L) / SR
        fire = 26 + 3 * np.sin(2 * np.pi * 0.3 * t)
        ph = 2 * np.pi * np.cumsum(fire) / SR
        x = sum(np.sin(k * ph) / k ** 0.9 for k in range(1, 14))
        x *= 1 + 0.35 * np.sin(ph)  # cylinder pulse
        x += bandpass_fft(rng.standard_normal(L), 60, 900) * 0.5
        x = bandpass_fft(x, 30, 1400)
        x *= np.minimum(1, t / 0.6) * np.clip((t[-1] - t) / 0.9, 0, 1)
    elif kind == "ui":
        L = int(0.35 * SR); t = np.arange(L) / SR
        x = (np.sin(2 * np.pi * 1320 * t) + 0.5 * np.sin(2 * np.pi * 1980 * t)) * np.exp(-t * 22) * np.minimum(1, t / 0.002)
    elif kind == "map_beep":
        L = int(0.7 * SR); t = np.arange(L) / SR; x = np.zeros(L)
        for off, f in [(0, 880), (0.14, 1320)]:
            i = int(off * SR); tt = t[: L - i]
            x[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14) * np.minimum(1, tt / 0.003)
    elif kind == "radar":
        L = int(2.2 * SR); t = np.arange(L) / SR; x = np.zeros(L)
        for k in range(3):
            i = int(k * 0.55 * SR); tt = t[: L - i]
            x[i:] += np.sin(2 * np.pi * 1050 * tt) * np.exp(-tt * 9) * (0.6 ** k)
        x += fft_conv(x, reverb_ir(1.5, 3, 5)[:, 0])[:L] * 0.3
    elif kind == "sweep":
        L = int(1.2 * SR); t = np.arange(L) / SR; p = t / t[-1]
        f = 300 * (12 ** p)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * p) ** 2 * 0.6
        x += bandpass_fft(rng.standard_normal(L), 3000, 12000) * np.sin(np.pi * p) ** 4 * 0.3
    elif kind == "ambience":
        L = int((dur or 10) * SR); t = np.arange(L) / SR
        jet = bandpass_fft(rng.standard_normal(L), 150, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
        whine = np.sin(2 * np.pi * np.cumsum(3100 + 20 * np.sin(2 * np.pi * 0.2 * t)) / SR) * 0.03
        x = jet + whine
        x *= np.minimum(1, t / 1.5) * np.clip((t[-1] - t) / 1.5, 0, 1)
    else:
        raise ValueError(kind)
    x = np.asarray(x, dtype=np.float64)
    return x / (np.abs(x).max() + 1e-9)


# ---------------------------------------------------------------- mix
def main():
    voice = read_narration()
    print("narration samples", len(voice), "peak", np.abs(voice).max())

    score = build_score()
    write_wav(os.path.join(ROOT, "public/audio/background_music/score.wav"), score)

    # sidechain ducking from the narration envelope
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, "same"))
    speaking = (env > db(-38)).astype(np.float64)
    # attack 60 ms, release 450 ms (asymmetric smoothing)
    g = np.zeros(N); a_att = np.exp(-1 / (0.06 * SR / 64)); a_rel = np.exp(-1 / (0.45 * SR / 64))
    ds = speaking[::64]; sm = np.zeros(len(ds)); v = 0.0
    for i, s in enumerate(ds):
        a = a_att if s > v else a_rel
        v = a * v + (1 - a) * s; sm[i] = v
    duck = np.interp(np.arange(N), np.arange(len(ds)) * 64, sm)
    music_gain = db(-17) * (1 - duck) + db(-29) * duck
    # global fades
    fi = int(0.8 * SR); music_gain[:fi] *= np.linspace(0, 1, fi)

    mix = np.zeros((N, 2))
    mix += score * music_gain[:, None]

    fx_dir = os.path.join(ROOT, "public/audio/sound_effects")
    cache = {}
    for c in TL["sfx"]:
        key = (c["type"], c.get("dur"))
        if key not in cache:
            cache[key] = sfx(c["type"], c.get("dur"))
            name = c["type"] + (f"_{c['dur']}s" if c.get("dur") else "") + ".wav"
            write_wav(os.path.join(fx_dir, name), cache[key] * 0.9)
        x = cache[key] * db(c["gain"])
        i0 = int(c["t"] * SR); L = min(len(x), N - i0)
        # pan slightly for width
        pan = 0.5 + 0.15 * np.sin(c["t"])
        mix[i0:i0 + L, 0] += x[:L] * np.sqrt(1 - pan) * 1.41
        mix[i0:i0 + L, 1] += x[:L] * np.sqrt(pan) * 1.41

    mix += voice[:, None]  # narration untouched, centred
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
        print("normalised whole mix by", 0.98 / peak)
    write_wav(os.path.join(ROOT, "public/audio/final_mix.wav"), mix)
    print("done: final_mix.wav", mix.shape[0] / SR, "s; peak", np.abs(mix).max())


if __name__ == "__main__":
    main()
