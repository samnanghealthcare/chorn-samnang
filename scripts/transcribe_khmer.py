"""Khmer transcription aligned to the real pauses of the voice-over.
1) ffmpeg silencedetect splits the narration into phrases (exact start/end times).
2) Each phrase is decoded with a Khmer fine-tuned Whisper (CTranslate2) - decoded directly,
   because faster-whisper's text assembly drops this fine-tune's Khmer tokens.
Usage: python3 scripts/transcribe_khmer.py public/voiceover.wav <ct2_model_dir> src/audio/phrases.json"""
import json, re, subprocess, sys
import numpy as np, ctranslate2
from tokenizers import Tokenizer
from faster_whisper.feature_extractor import FeatureExtractor
wav, mdir, out = sys.argv[1:4]
SR = 16000
pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
dur = len(audio) / SR
log = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=noise=-35dB:d=0.30", "-f", "null", "-"], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
# speech regions = gaps between silences
regions, cur = [], 0.0
for s, e in zip(starts, ends):
    if s - cur > 0.15: regions.append([cur, s])
    cur = e
if dur - cur > 0.15: regions.append([cur, dur])
tok = Tokenizer.from_file(f"{mdir}/tokenizer.json")
model = ctranslate2.models.Whisper(mdir, device="cpu", compute_type="int8", intra_threads=4)
fe = FeatureExtractor(feature_size=model.n_mels)
prompt = [tok.token_to_id(t) for t in ["<|startoftranscript|>", "<|km|>", "<|transcribe|>", "<|notimestamps|>"]]
special = re.compile(r"<\|[^|]*\|>")
res = []
for a, b in regions:
    chunk = audio[int(max(0, a - 0.1) * SR): int(min(dur, b + 0.1) * SR)]
    feats = fe(chunk)[:, :3000]
    if feats.shape[1] < 3000: feats = np.pad(feats, ((0, 0), (0, 3000 - feats.shape[1])))
    r = model.generate(ctranslate2.StorageView.from_array(feats[None].astype(np.float32)), [prompt], beam_size=5, max_length=220)
    ids = r[0].sequences_ids[0]
    text = special.sub("", tok.decode(ids, skip_special_tokens=False)).strip()
    res.append({"start": round(a, 2), "end": round(b, 2), "text": text})
    print(f"[{a:7.2f} -> {b:7.2f}] {text}", flush=True)
json.dump({"duration": dur, "phrases": res}, open(out, "w"), ensure_ascii=False, indent=1)
