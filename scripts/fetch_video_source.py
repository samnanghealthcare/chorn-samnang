"""Download a Commons video's 1080p (or 720p) WebM transcode into a scratch folder for clip selection.
Usage: python3 scripts/fetch_video_source.py "File:Name.webm" outdir"""
import json, subprocess, sys, time, urllib.parse, urllib.request
UA = "EduVideoBuilder/1.0 (educational motion graphics)"
title, outdir = sys.argv[1], sys.argv[2]
import hashlib
fname = title.split(":", 1)[1].replace(" ", "_")
md5 = hashlib.md5(fname.encode()).hexdigest()  # Commons upload path = /x/xy/ from md5 of the file name
name = urllib.parse.quote(fname)
head = f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}"
base = head.replace("/commons/", "/commons/transcoded/") + f"/{name}/{name}"
for suffix in [".1080p.vp9.webm", ".720p.vp9.webm", ".1080p.webm", ".720p.webm"]:
    for a in range(4):
        out = f"{outdir}/{name}{suffix}"
        code = subprocess.run(["curl", "-s", "-L", "-A", UA, "-o", out, "-w", "%{http_code}", base + suffix], capture_output=True, text=True).stdout
        if code == "200": print(out); sys.exit(0)
        if code != "429": break
        time.sleep(10 * (a + 1))
print("FAILED", title); sys.exit(1)
