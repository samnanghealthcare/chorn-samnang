# Aviation Motion Graphics — ATA 20 & ATA 06 (Khmer)

Educational documentary-style motion-graphics video:
**AIRCRAFT GENERAL PRACTICES (ATA 20 – Standard Practices – Airframe)** and **DIMENSIONS AND AREAS (ATA 06)**.
Khmer narration, English technical terms.

| Output | |
|---|---|
| `output/final_video.mp4` | 1920×1080, 16:9, 30 fps, H.264 + AAC 320 kbps, 2:22.5 |
| `storyboard.txt` | Scene breakdown: timing, voice-over, visuals, motion, text, SFX, transitions |
| `voiceover_transcript.txt` | Khmer narration transcribed from `audio.mp3`, timed per phrase |
| `assets_sources.txt` | Author, licence and source URL for every photo, drawing and video clip |

## Project layout

```
script.txt / audio.mp3        inputs (audio.mp3 = narration; public/voiceover.wav = the lossless original)
assets/                       downloaded media library (images, videos, engine, blueprint, illustrations)
src/
  Video.tsx, Root.tsx         Remotion composition (15 scenes + subtitles + progress bar)
  scenes/S01…S15_*.tsx        one file per scene
  components/                 camera moves, HUD/grid/particles, typography, A320 outlines, turbofan x-ray, torque wrench
  animations/anim.ts          easing + absolute-time helpers (cues are written in narration seconds)
  data/narration.ts           timed Khmer phrases (drives subtitles)
  data/timeline.ts            scene boundaries
  audio/sfx_cues.json         sound-effect cue times
scripts/
  transcribe_khmer.py         pause-aligned Khmer transcription (Whisper Khmer fine-tune, CTranslate2)
  commons_search.py           search Wikimedia Commons with licence info
  fetch_assets.py             download assets + write assets_sources.txt (manifest: assets_manifest.json)
  fetch_video_source.py       download a Commons video transcode for clip selection
  make_audio.py               procedural music bed + SFX (licence-free, numpy)
  finalize.sh                 voice loudness-normalisation, music ducking, SFX mix, mux to MP4
  stills.mjs                  render preview frames
```

## Requirements

Node 18+ and FFmpeg, plus Python 3 with numpy (and `faster-whisper` only if you re-transcribe).
Remotion needs a Chromium build. This project points at the pre-installed headless shell; change
`--browser-executable` in `package.json` or remove it to let Remotion download its own.

## Commands

```bash
npm install
```

```bash
npm run studio          # live preview / edit in Remotion Studio
```

```bash
npm run build           # render video (output/render_raw.mp4) + mix audio + mux → output/final_video.mp4
```

Only the audio changed (SFX timing or music):

```bash
bash scripts/finalize.sh
```

Preview stills, e.g. at 12.5 s and 80 s:

```bash
node scripts/stills.mjs /tmp/stills 12.5 80
```

## How the timing works

1. FFmpeg `silencedetect` splits `audio.mp3` into the real spoken phrases (exact start/end).
2. Each phrase is transcribed with a Khmer fine-tuned Whisper model and then proof-read (`src/data/narration.ts`).
3. Scenes cut in the natural pauses; on-screen keywords are cued at the second they are spoken.
4. The narration is used as-is: not sped up, trimmed or replaced.

## Accuracy notes

- ATA 06 = DIMENSIONS AND AREAS; ATA 20 = STANDARD PRACTICES – AIRFRAME.
- The A320-200 overall dimensions (37.57 m length, 34.10 m span with wingtip fences, 11.76 m height) are from the Airbus
  *A320 Aircraft Characteristics – Airport and Maintenance Planning* document. They match the dimensions printed on the
  Commons three-view drawing.
- The major zones 100–800 use the standard ATA iSpec 2200 numbering. No specific station or zone sub-numbers are shown.
- Simplified drawings (aircraft outlines, generic turbofan, torque wrench, access panel) are tagged **"Illustrative"**.
  The real IAE V2500 photos are labelled as the V2500. The generic engine is not presented as any specific model.
- This is training and awareness material. Always work to the approved maintenance documentation (AMM, SRM, etc.).
