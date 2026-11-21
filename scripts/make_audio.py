"""Procedural, licence-free sound design (numpy only):
  output/music.wav  - cinematic ambient documentary bed (pads, sub drone, soft pulse, shimmer)
  output/sfx.wav    - SFX placed at cue times from src/audio/sfx_cues.json
Then scripts/finalize.sh mixes them under the voice-over with FFmpeg (ducking + loudness)."""
import json, wave
import numpy as np
SR = 48000
DUR = 142.5
rng = np.random.default_rng(7)
N = int(DUR * SR)
t_all = np.arange(N) / SR

def write(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x[0], x[1]], 1) if x.ndim == 2 else np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))

def env(n, a, r):
    e = np.ones(n); ai = int(a * SR); ri = int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e

# ---------------- MUSIC ----------------
def note(f): return 440 * 2 ** ((f - 69) / 12)
chords = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67]]  # Dm Bb F C
bar = 8.0
music = np.zeros((2, N))
for i in range(int(DUR / bar) + 1):
    s0 = int(i * bar * SR); n = min(int((bar + 2) * SR), N - s0)
    if n <= 0: break
    tt = np.arange(n) / SR
    pad = np.zeros((2, n))
    for k, m in enumerate(chords[i % 4]):
        for d, ch in ((-0.08, 0), (0.08, 1)):
            f = note(m) * 2 ** (d / 12)
            ph = rng.uniform(0, 6.28)
            w = np.sin(2 * np.pi * f * tt + ph) + 0.35 * np.sin(4 * np.pi * f * tt + ph) + 0.12 * np.sin(6 * np.pi * f * tt)
            pad[ch] += w * (0.9 if k else 1.2)
    e = env(n, 2.5, 3.0)
    music[:, s0:s0 + n] += pad * e * 0.035
# sub drone on D
music += (np.sin(2 * np.pi * note(38) * t_all) * 0.10 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.05 * t_all)))[None]
# soft pulse (90 bpm) that starts after the hook, eases out for the ending
beat = 60 / 90
pulse = np.zeros(N)
for b in np.arange(12.0, 136.0, beat):
    s = int(b * SR); L = int(0.35 * SR)
    tt = np.arange(L) / SR
    pulse[s:s + L] += np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9) * 0.22
music += pulse[None]
# shimmer arpeggio (high, very soft)
arp = np.zeros(N)
for j, b in enumerate(np.arange(12.0, 138.0, beat / 2)):
    ch = chords[int(b / bar) % 4]; m = ch[j % len(ch)] + 24
    s = int(b * SR); L = int(0.9 * SR); tt = np.arange(L) / SR
    seg = np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 4) * 0.025
    arp[s:s + L] += seg[: max(0, min(L, N - s))]
music[0] += arp; music[1] += np.roll(arp, int(0.18 * SR))  # stereo echo
music = np.stack([fft_filter(music[0], hi=6000), fft_filter(music[1], hi=6000)])
music *= env(N, 3.0, 3.5)[None]
music /= np.max(np.abs(music)) / 0.6
write("output/music.wav", music)

# ---------------- SFX ----------------
def noise(n): return rng.standard_normal(n)
def sweep_noise(d, f0, f1, amp):
    n = int(d * SR); x = noise(n); out = np.zeros(n); seg = int(0.05 * SR)
    for s in range(0, n, seg):
        c = f0 + (f1 - f0) * (s / n)
        out[s:s + seg] = fft_filter(x[s:s + seg + 0], lo=c * 0.6, hi=c * 1.6)[: len(out[s:s + seg])]
    return out * amp
def g_transition():
    d = 0.9; n = int(d * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return fft_filter(noise(n), lo=300, hi=4500) * e * 0.35
def g_textwhoosh():
    d = 0.6; n = int(d * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 3
    return fft_filter(noise(n), lo=1500, hi=9000) * e * 0.18
def g_jet():
    d = 6.0; n = int(d * SR); x = np.cumsum(noise(n)); x -= np.convolve(x, np.ones(2000) / 2000, "same")
    x = fft_filter(x, lo=40, hi=900); x /= np.max(np.abs(x))
    whine = np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 2600, n)) / SR) * 0.05
    return (x * 0.45 + whine) * np.sin(np.linspace(0, np.pi, n)) ** 1.5
def g_impact():
    d = 1.6; n = int(d * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (45 + 60 * np.exp(-tt * 12)) * tt) * np.exp(-tt * 3.0)
    return boom * 0.7 + fft_filter(noise(n), hi=2500) * np.exp(-tt * 18) * 0.25
def g_pop():
    d = 0.12; n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (900 * np.exp(-tt * 25) + 250) * tt) * np.exp(-tt * 40) * 0.35
def g_click():
    d = 0.06; n = int(d * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 3200 * tt) * 0.25 + noise(n) * 0.08) * np.exp(-tt * 120)
def g_scan():
    d = 1.4; n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (900 + 500 * tt) * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * tt)) * np.sin(np.pi * tt / d) * 0.07
def g_sweep():
    d = 1.6; n = int(d * SR); tt = np.arange(n) / SR
    tone = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (tt * 3)) / SR) * 0.06
    return (tone + fft_filter(noise(n), lo=2000, hi=8000) * 0.05) * np.sin(np.pi * tt / d) ** 2
def g_mech():
    out = np.zeros(int(0.6 * SR))
    for k in range(5):
        s = int(k * 0.07 * SR); c = g_click() * 1.6; out[s:s + len(c)] += c
    tt = np.arange(len(out)) / SR
    return out + np.sin(2 * np.pi * 120 * tt) * np.exp(-tt * 10) * 0.25
def g_ping():
    d = 1.2; n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 1500 * tt) * np.exp(-tt * 5) * 0.18
GEN = {"transition": g_transition, "textwhoosh": g_textwhoosh, "jet": g_jet, "impact": g_impact, "pop": g_pop, "click": g_click,
       "scan": g_scan, "sweep": g_sweep, "mech": g_mech, "ping": g_ping}
cues = json.load(open("src/audio/sfx_cues.json"))
sfx = np.zeros((2, N))
for k, times in cues.items():
    if k.startswith("_"): continue
    for i, at in enumerate(times):
        x = GEN[k](); s = int(at * SR); L = min(len(x), N - s)
        pan = 0.5 + 0.3 * np.sin(i * 1.7)  # gentle stereo movement
        sfx[0, s:s + L] += x[:L] * (1 - pan) * 1.4
        sfx[1, s:s + L] += x[:L] * pan * 1.4
sfx /= max(1.0, np.max(np.abs(sfx)) / 0.9)
write("output/sfx.wav", sfx)
print("music + sfx written")
