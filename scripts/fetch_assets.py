"""Download Wikimedia Commons assets listed in scripts/assets_manifest.json and write attribution
to assets_sources.txt. Images are fetched as 2560px renditions; videos are trimmed with ffmpeg."""
import json, os, re, subprocess, time, html, urllib.parse, urllib.request, urllib.error
UA = {"User-Agent": "EduVideoBuilder/1.0 (educational motion graphics)"}
def api(title, width):
    q = {"action": "query", "format": "json", "titles": title, "prop": "imageinfo",
         "iiprop": "url|size|extmetadata|mime", "iiurlwidth": str(width)}
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(q)
    for a in range(6):
        try: return next(iter(json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))["query"]["pages"].values()))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(5 * (a + 1))
def get(url, dest):
    for a in range(10):
        code = subprocess.run(["curl", "-s", "-L", "-A", UA["User-Agent"], "-o", dest, "-w", "%{http_code}", url],
                              capture_output=True, text=True).stdout
        if code == "200": return
        time.sleep(15 * (a + 1))
    raise RuntimeError(f"download failed {code} {url}")
strip = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()
man = json.load(open("scripts/assets_manifest.json"))
lines = ["ASSET SOURCES & ATTRIBUTION", "All media below were downloaded from Wikimedia Commons under the licence shown.",
         "Usage in this educational video complies with each licence (attribution given; CC BY-SA items are shared alike).", ""]
for item in man:
    p = api(item["title"], item.get("width", 2560)); ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
    dest = item["dest"]; os.makedirs(os.path.dirname(dest), exist_ok=True)
    if not os.path.exists(dest):
        if item.get("video"):
            src = item.get("src") or ii["url"]
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(item.get("ss", 0)), "-i", src, "-t", str(item.get("t", 15)),
                            "-an", "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30",
                            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", dest], check=True)
        else:
            orig = ii["url"].split("?")[0]
            if ii["width"] > 1920 or orig.endswith(".svg"):
                head, name = orig.rsplit("/", 1)
                thumb = head.replace("/commons/", "/commons/thumb/") + f"/{name}/1920px-{name}" + (".png" if name.endswith(".svg") else "")
            else:
                thumb = orig
            get(thumb, dest)
        time.sleep(2)
    lines += [f"- {dest}", f"    Title:   {p['title']}", f"    Author:  {strip(m.get('Artist', {}).get('value'))}",
              f"    Licence: {strip(m.get('LicenseShortName', {}).get('value'))}  {m.get('LicenseUrl', {}).get('value', '')}",
              f"    Source:  {ii['descriptionurl']}", f"    Used for: {item['use']}", ""]
    print("ok", dest, flush=True)
open("assets_sources.txt", "w").write("\n".join(lines) + "\n")
