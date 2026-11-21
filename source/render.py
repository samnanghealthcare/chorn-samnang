"""Frame compositor + parallel renderer.

  python3 source/render.py stills 3.5 18.2 ...      -> PNGs in output/stills/
  python3 source/render.py video [--workers 4] [--scale 1.0] [--chunks 4,5,11]
        -> output/video_silent.mp4 (then run source/audio_design.py + source/main.py)
"""
import os, sys, time, subprocess, multiprocessing as mp
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import *
from gfx import *
import scenes

XFADE = 0.40   # seconds of cross-dissolve at each scene boundary

def scene_at(t):
    for sid, a, b, name in SCENES:
        if a <= t < b: return sid, a, b, name
    return SCENES[-1]

def compose(t):
    sid, a, b, name = scene_at(t)
    fr = scenes.RENDERERS[name](t)
    # dissolve from the previous scene, with a slight scale push on the outgoing frame
    if sid > 1 and t < a + XFADE / 2:
        prev = SCENES[sid - 2]
        k = ease(prog(t, a - XFADE / 2, a + XFADE / 2))
        pf = scenes.RENDERERS[prev[3]](t)
        out = pf.copy(); put(out, fr, W / 2, H / 2, k); fr = out
    elif sid < len(SCENES) and t >= b - XFADE / 2:
        nxt = SCENES[sid]
        k = ease(prog(t, b - XFADE / 2, b + XFADE / 2))
        nf = scenes.RENDERERS[nxt[3]](t)
        put(fr, nf, W / 2, H / 2, k)
    fr.alpha_composite(vignette())
    fr.alpha_composite(grain(int(t * FPS) % 6))
    hud(fr, t, idx=sid, opacity=1 - ease(prog(t, 110.2, 110.8)))
    caption(fr, t)
    # global fade-in from black at the very start
    if t < 0.35: put(fr, Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - t / 0.35)))), W / 2, H / 2)
    return fr

def render_chunk(args):
    i0, i1, path, scale = args
    w, h = int(W * scale) // 2 * 2, int(H * scale) // 2 * 2
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t0 = time.time()
    for i in range(i0, i1):
        fr = compose(i / FPS).convert("RGB")
        if scale != 1.0: fr = fr.resize((w, h), Image.BILINEAR)
        p.stdin.write(fr.tobytes())
        if (i - i0) % 150 == 0: print(f"  chunk {os.path.basename(path)} frame {i}/{i1} ({time.time() - t0:.0f}s)", flush=True)
    p.stdin.close(); p.wait()
    return path

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "video"
    if mode == "stills":
        os.makedirs(A("output/stills"), exist_ok=True)
        for s in sys.argv[2:]:
            t = float(s); compose(t).convert("RGB").save(A("output/stills", f"t{t:07.2f}.jpg"), quality=88)
            print("still", t)
        return
    workers = int(sys.argv[sys.argv.index("--workers") + 1]) if "--workers" in sys.argv else 4
    scale = float(sys.argv[sys.argv.index("--scale") + 1]) if "--scale" in sys.argv else 1.0
    out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else A("output/video_silent.mp4")
    n = int(round(DURATION * FPS))
    os.makedirs(A("output/chunks"), exist_ok=True)
    nchunks = 12                     # fixed, so --chunks indices always mean the same time ranges
    bounds = [round(n * i / nchunks) for i in range(nchunks + 1)]
    jobs = [(bounds[i], bounds[i + 1], A("output/chunks", f"c{i:02d}.mp4"), scale) for i in range(nchunks)]
    all_parts = [j[2] for j in jobs]
    if "--chunks" in sys.argv:      # re-render only some chunks, reuse the rest from a previous run
        keep = {int(x) for x in sys.argv[sys.argv.index("--chunks") + 1].split(",")}
        jobs = [j for i, j in enumerate(jobs) if i in keep]
        print("re-rendering chunks", sorted(keep), [f"{j[0] / FPS:.1f}-{j[1] / FPS:.1f}s" for j in jobs])
    t0 = time.time()
    with mp.Pool(workers) as pool:
        pool.map(render_chunk, jobs, chunksize=1)
    parts = all_parts
    lst = A("output/chunks/list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out], check=True)
    print(f"rendered {n} frames in {time.time() - t0:.0f}s -> {out}")

if __name__ == "__main__":
    main()
