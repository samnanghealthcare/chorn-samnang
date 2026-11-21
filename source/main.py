"""One-command build:  python3 source/main.py  [--skip-render] [--workers 4]

1. audio_design.py  -> output/mix.wav (voice + ducked score + SFX, -16 LUFS)
2. storyboard.py    -> storyboard.txt
3. render.py video  -> output/video_silent.mp4 (1920x1080, 30 fps)
4. mux              -> output/AIRCRAFT_JACKING_MOTION_GRAPHICS.mp4 (H.264 + AAC)
5. preview          -> output/preview.mp4 (960x540, lower bitrate)
"""
import os, sys, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import A

FINAL = A("output/AIRCRAFT_JACKING_MOTION_GRAPHICS.mp4")
PREVIEW = A("output/preview.mp4")

def run(*cmd): print("+", " ".join(cmd)); subprocess.run(cmd, check=True)

def main():
    py = sys.executable
    run(py, os.path.join(HERE, "audio_design.py"))
    run(py, os.path.join(HERE, "storyboard.py"))
    if "--skip-render" not in sys.argv:
        w = sys.argv[sys.argv.index("--workers") + 1] if "--workers" in sys.argv else "4"
        run(py, os.path.join(HERE, "render.py"), "video", "--workers", w)
    run("ffmpeg", "-v", "error", "-y", "-i", A("output/video_silent.mp4"), "-i", A("output/mix.wav"),
        "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
        "-shortest", "-movflags", "+faststart",
        "-metadata", "title=Aircraft General Practices: Jacking", "-metadata", "language=khm", FINAL)
    run("ffmpeg", "-v", "error", "-y", "-i", FINAL, "-vf", "scale=960:540", "-c:v", "libx264", "-crf", "26",
        "-preset", "fast", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", PREVIEW)
    print("final  :", FINAL); print("preview:", PREVIEW)

if __name__ == "__main__":
    main()
