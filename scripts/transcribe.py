"""Transcribe the Khmer voice-over with faster-whisper to get segment/word timing.
Usage: python3 scripts/transcribe.py public/voiceover.wav src/audio/transcript.json [model]"""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "large-v3"
model = WhisperModel(model_name, device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
segs, info = model.transcribe(audio, language="km", word_timestamps=True, vad_filter=True, beam_size=5)
res = []
for s in segs:
    res.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                "words": [{"s": round(w.start, 2), "e": round(w.end, 2), "w": w.word} for w in (s.words or [])]})
    print(f"[{s.start:7.2f} -> {s.end:7.2f}] {s.text.strip()}", flush=True)
json.dump({"duration": info.duration, "segments": res}, open(out, "w"), ensure_ascii=False, indent=1)
