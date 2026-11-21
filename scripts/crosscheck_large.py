"""Cross-check: decode each pause-aligned phrase with a second Khmer model via faster-whisper."""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
wav, mdir, phrases, out = sys.argv[1:5]
pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
m = WhisperModel(mdir, device="cpu", compute_type="int8", cpu_threads=4)
res = []
for p in json.load(open(phrases))["phrases"]:
    chunk = audio[int(max(0, p["start"] - 0.1) * 16000): int((p["end"] + 0.1) * 16000)]
    segs, _ = m.transcribe(chunk, language="km", beam_size=5, without_timestamps=True)
    t = " ".join(s.text.strip() for s in segs)
    res.append({**p, "text2": t}); print(f"[{p['start']:7.2f}] {t}", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
