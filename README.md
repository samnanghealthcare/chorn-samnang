# Aircraft General Practices: Jacking (Khmer motion-graphics video)

A 1 min 51 s educational motion-graphics video, narrated in Khmer, that explains **aircraft jacking**:
what it is, why it's done, jacking points, pre-jacking checks, wheel chocks and safety, and leveling and weighing (weight and CG).

| | |
|---|---|
| Final video | `output/AIRCRAFT_JACKING_MOTION_GRAPHICS.mp4` |
| Preview | `output/preview.mp4` (960×540) |
| Format | MP4, H.264 High, 1920×1080, 30 fps, AAC 256 kb/s 48 kHz stereo |
| Duration | 111.04 s (the same length as the narration) |
| Loudness | −16 LUFS integrated, true peak ≤ −1.4 dBTP |
| Storyboard | `storyboard.txt` (18 scenes, generated from the real audio timings) |
| Media and licences | `media_sources.txt` |

> The video files are not committed to git (see `.gitignore`). Rebuild them with the command below.

## Rebuild

Requirements: Python 3.10+, `ffmpeg`, plus `pip install pillow numpy`. Pillow must be built with **libraqm**, which shapes the Khmer text.
Check it with `python3 -c "from PIL import features; print(features.check('raqm'))"`.

```bash
python3 source/main.py --workers 4
```

That runs four steps:
1. `source/audio_design.py` synthesises the score and sound effects, ducks them under `audio.wav` and loudness-normalises the mix.
2. `source/storyboard.py` writes `storyboard.txt`.
3. `source/render.py video` renders 3,331 frames in parallel chunks (about 4 minutes on 4 CPU cores).
4. ffmpeg muxes the final MP4 and the preview.

To check single frames without rendering everything:

```bash
python3 source/render.py stills 16.9 51.5 94.5
```

The frames are written to `output/stills/`.

## How it is built

| File | Role |
|---|---|
| `source/config.py` | Canvas, colours, fonts, the **Khmer transcript with measured timings**, the scene list and the keyword cue points |
| `source/gfx.py` | Drawing primitives: Khmer text (raqm), easing, Ken Burns, glow, blueprint grid, HUD, captions, line-art aircraft and jacks |
| `source/scenes.py` | The 18 scene renderers |
| `source/render.py` | Compositor (dissolves, vignette, grain, HUD, captions) and the parallel renderer |
| `source/audio_design.py` | Synthesised music and sound effects, sidechain ducking, two-pass loudnorm |
| `source/fetch_media.py` | Wikimedia Commons downloader that logs each source URL and licence to `media_sources.jsonl` |

### How the timings were measured
1. `ffmpeg silencedetect` (−35 dB, 0.35 s) finds the 20 natural pauses, which give the sentence boundaries.
2. The Khmer-tuned Whisper model `sokhapen/whisper-small-khmer-v6-ct2` transcribes each chunk. The stock `large-v3` model produced unusable Khmer.
3. RMS dips inside long sentences locate individual keywords, for example "Aircraft Jack" at 16.17 s and "Wheel Chock" at 68.43 s.
4. The recogniser output was corrected by hand and stored in `config.CAPTIONS`, and every on-screen label is keyed to `config.CUE`.

### Accuracy notes
* The aircraft outlines are a **generic narrow-body**, labelled "illustrative / not to scale". They are not a certified drawing of any one type.
* Jacking points are shown as nose plus left and right wing, as the narration says. Exact positions, loads and procedures come from the manufacturer's **AMM, ATA 07 (Lifting & Shoring)**.
* The weighing scene shows the standard weight and balance relationship (W = ΣWᵢ, CG = Σ(W·arm)/W) with symbols only. No numbers were invented.
* The exploded view shows a generic hydraulic tripod jack: pad, screw extension and lock nut, ram, cylinder, legs.

## Project layout
```
audio.wav  script.txt
assets/  images/ videos/ fonts/ music/ sound_effects/
source/  config.py gfx.py scenes.py render.py audio_design.py storyboard.py main.py fetch_media.py
output/  AIRCRAFT_JACKING_MOTION_GRAPHICS.mp4  preview.mp4  (generated)
storyboard.txt  media_sources.txt  media_sources.jsonl
```
