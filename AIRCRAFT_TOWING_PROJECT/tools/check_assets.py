"""List media slots that hold a real downloaded file (placeholders listed in .placeholders are excluded)."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slots = re.findall(r"'(assets/[^']+)'", open(os.path.join(ROOT, "src/data/assets.ts")).read())
ph_file = os.path.join(ROOT, ".placeholders")
ph = set(open(ph_file).read().split()) if os.path.exists(ph_file) else set()
avail = [s for s in slots if os.path.exists(os.path.join(ROOT, "public", s)) and s not in ph and not s.endswith(".mp4") or (s.endswith(".mp4") and os.path.exists(os.path.join(ROOT, "public", s)) and os.path.exists(os.path.join(ROOT, "public", s) + ".real"))]
json.dump(sorted(set(avail)), open(os.path.join(ROOT, "src/data/available.json"), "w"), indent=1)
print("available:", avail)
