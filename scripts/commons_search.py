"""Search Wikimedia Commons and print license metadata. Usage: python3 scripts/commons_search.py "query" [filetype] [n]"""
import json, sys, urllib.parse, urllib.request, urllib.error
q = sys.argv[1]; ft = sys.argv[2] if len(sys.argv) > 2 else "bitmap"; n = sys.argv[3] if len(sys.argv) > 3 else "8"
params = {"action": "query", "format": "json", "generator": "search", "gsrnamespace": "6",
          "gsrsearch": f"{q} filetype:{ft}", "gsrlimit": n, "prop": "imageinfo",
          "iiprop": "url|size|extmetadata|mime", "iiurlwidth": "1920"}
url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
req = urllib.request.Request(url, headers={"User-Agent": "EduVideoBuilder/1.0 (educational motion graphics)"})
import time
for attempt in range(6):
    try:
        data = json.load(urllib.request.urlopen(req, timeout=30)); break
    except urllib.error.HTTPError as e:
        if e.code != 429: raise
        time.sleep(5 * (attempt + 1))
for p in (data.get("query", {}).get("pages", {}) or {}).values():
    ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
    lic = m.get("LicenseShortName", {}).get("value", "?")
    print(f"{p['title']} | {ii['width']}x{ii['height']} | {lic} | {ii.get('duration','')}")
