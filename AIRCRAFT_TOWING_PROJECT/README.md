# AIRCRAFT GENERAL PRACTICES – AIRCRAFT TOWING

Khmer aviation educational documentary (motion graphics), built with Remotion + React.

- Output: `output/AIRCRAFT_TOWING_DOCUMENTARY.mp4`. 1920×1080, 30 fps, H.264 + AAC 48 kHz, 3:25 (205.12 s, the exact length of the narration).
- Narration: `audio.source.wav` (original, not edited).
- Script: `script.txt` (the original brief). The recorded Khmer voice-over was transcribed and timed into `src/data/subtitles.ts`.

## Structure

| Path | Contents |
|---|---|
| `src/data/subtitles.ts` | 46 Khmer subtitle cues timed to the audio |
| `src/data/timeline.json` | scene list, music sections, SFX cue list (shared by video + audio) |
| `src/scenes/Shots.tsx` | all 33 shots of the 9 scenes, with their timings |
| `src/maps/AirportMap.tsx` | schematic top-down airport map + route/aircraft animation |
| `src/graphics/` | A320 blueprint, tug, towbar diagram, turbofan X-ray/exploded view, iceberg, cycle, timeline, icons, illustrated backgrounds |
| `src/subtitles/Subtitles.tsx` | Khmer subtitles (English terms highlighted) |
| `tools/generate_audio.py` | procedural music + SFX, ducking, final mix → `public/audio/final_mix.wav` |
| `tools/check_assets.py` | registers which real photos/videos exist in `public/` |
| `tools/cad/turbofan_educational_freecad.py` | educational parametric turbofan (FreeCAD) |
| `ASSET_SOURCES.txt` | sources and licences |

## Build

```bash
npm install
python3 tools/generate_audio.py      # music + SFX + narration mix
python3 tools/check_assets.py        # which real media files are present
node render.mjs                      # full HD render
node render.mjs --preview            # 960×540 preview
npx remotion studio src/index.ts     # interactive editor
```

To add real photos or videos, put them at the paths listed in `src/data/assets.ts`, run `tools/check_assets.py` and render again. Any slot without a file falls back to a schematic illustration.
