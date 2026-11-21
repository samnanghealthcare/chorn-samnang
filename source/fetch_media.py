"""Download Wikimedia Commons files without calling the (rate-limited) API.
Commons stores files at upload.wikimedia.org/wikipedia/commons/<h0>/<h0h1>/<Name>,
where h = md5(Name with spaces->underscores). Thumbnails add /thumb/ and <W>px-.
Usage: python3 -I source/fetch_media.py <outdir> "<File title>=><local name>|<license>" ...
Each download is appended to media_sources.jsonl (URL, page, license)."""
import sys, json, time, hashlib, os, subprocess, urllib.parse
UA = {"User-Agent": "AviationEduVideo/1.0 (educational motion-graphics project)"}
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "media_sources.jsonl")

def urls(title, width=1920):
    n = title.replace("File:", "", 1).replace(" ", "_")
    h = hashlib.md5(n.encode()).hexdigest(); q = urllib.parse.quote(n)
    orig = f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{q}"
    thumb = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}"
    return n, orig, thumb

outdir = sys.argv[1]; os.makedirs(outdir, exist_ok=True)
for spec in sys.argv[2:]:
    title, _, rest = spec.partition("=>"); local, _, lic = rest.partition("|")
    n, orig, thumb = urls(title.strip())
    ext = os.path.splitext(n)[1].lower()
    path = os.path.join(outdir, local.strip() + ext)
    if os.path.exists(path): print("SKIP", path); continue
    data = None
    cands = [orig] if ext in (".webm", ".ogv", ".mp4") else [thumb, thumb.replace("/1920px-", "/1280px-"), orig]
    for u in cands:
        tmp = path + ".part"
        r = subprocess.run(["curl", "-s", "-L", "-m", "150", "-A", UA["User-Agent"], "-o", tmp,
                            "-w", "%{http_code}", u], capture_output=True, text=True)
        if r.stdout.strip() == "200" and os.path.getsize(tmp) > 20000:
            data = open(tmp, "rb").read(); os.remove(tmp); src = u; break
        if os.path.exists(tmp): os.remove(tmp)
        time.sleep(3)
    if not data: print("FAIL", title); continue
    open(path, "wb").write(data)
    rec = {"file": os.path.relpath(path), "title": "File:" + n.replace("_", " "),
           "page": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(n),
           "download_url": src, "license": lic.strip() or "see page", "bytes": len(data)}
    open(LOG, "a").write(json.dumps(rec, ensure_ascii=False) + "\n")
    print("OK", path, len(data)); time.sleep(2)
