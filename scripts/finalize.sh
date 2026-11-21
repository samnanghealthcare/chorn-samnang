#!/usr/bin/env bash
# Mix voice-over + ducked music + SFX, then mux with the Remotion render into output/final_video.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/make_audio.py
ffmpeg -loglevel error -y -i public/voiceover.wav -i output/music.wav -i output/sfx.wav -filter_complex "
  [0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=142.5[v];
  [v]asplit=2[vo][key];
  [1:a]volume=0.30[m];
  [m][key]sidechaincompress=threshold=0.02:ratio=8:attack=25:release=450:makeup=1[md];
  [2:a]volume=0.55[s];
  [vo][md][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.93[out]" \
  -map "[out]" -t 142.5 -c:a pcm_s16le output/mix.wav
ffmpeg -loglevel error -y -i output/render_raw.mp4 -i output/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest output/final_video.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact output/final_video.mp4
