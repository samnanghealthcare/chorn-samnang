"""Drawing primitives for the motion-graphics renderer (Pillow + numpy).

Everything is drawn on an RGBA 1920x1080 frame. Text is shaped with libraqm so
Khmer subscripts/vowels render correctly. Heavy objects (text bitmaps, resized
photos, blurred glows) are cached, so per-frame cost stays low.
"""
import math, random
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance
from config import *

# ------------------------------------------------------------------ timing helpers
def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def prog(t, a, b): return clamp((t - a) / (b - a)) if b != a else float(t >= a)
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)                       # smoothstep
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_in_out(x): x = clamp(x); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def back_out(x, s=1.6): x = clamp(x); x -= 1; return x * x * ((s + 1) * x + s) + 1
def lerp(a, b, k): return a + (b - a) * k
def fade(t, a, b, fi=0.35, fo=0.35):
    """Opacity envelope: fade in from a, fade out ending at b."""
    return ease(prog(t, a, a + fi)) * (1 - ease(prog(t, b - fo, b)))

# ------------------------------------------------------------------ fonts & text
@lru_cache(maxsize=None)
def font(path, size, weight="Regular"):
    f = ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.RAQM)
    if path == FONT_MATH: return f                      # static font, no variations
    names = [n.decode() if isinstance(n, bytes) else n for n in f.get_variation_names()]
    # fall back to the heaviest available weight (Kantumruy stops at Bold)
    f.set_variation_by_name(weight if weight in names else "Bold")
    return f

@lru_cache(maxsize=2048)
def text_img(text, size, weight="Bold", fill=WHITE, path=None, tracking=0, glow=0):
    """Render text to a tight RGBA bitmap. tracking = extra px between letters
    (Latin only). glow = blur radius of a soft halo in the same colour."""
    path = path or (FONT_EN if text.isascii() else FONT_KH)
    f = font(path, size, weight)
    if tracking and text.isascii():
        widths = [f.getlength(c) + tracking for c in text]
        w = int(sum(widths)) + 4
    else:
        w = int(f.getlength(text)) + 4
    asc, desc = f.getmetrics()
    pad = 2 * glow + 6
    h = int((asc + desc) * 1.25)
    im = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if tracking and text.isascii():
        x = pad
        for c, cw in zip(text, widths):
            d.text((x, pad + int((asc + desc) * 0.1)), c, font=f, fill=fill); x += cw
    else:
        d.text((pad, pad + int((asc + desc) * 0.1)), text, font=f, fill=fill)
    if glow:
        halo = im.filter(ImageFilter.GaussianBlur(glow))
        im = Image.alpha_composite(halo, im)
    return im

def wrap_lines(text, size, weight, max_w, path=None):
    """Greedy wrap on spaces (Khmer uses spaces between phrases)."""
    f = font(path or FONT_KH, size, weight)
    words, lines, cur = text.split(" "), [], ""
    for w_ in words:
        trial = (cur + " " + w_).strip()
        if f.getlength(trial) <= max_w or not cur: cur = trial
        else: lines.append(cur); cur = w_
    if cur: lines.append(cur)
    return lines

def put(frame, im, x, y, opacity=1.0, anchor="mm", scale=1.0):
    """Alpha-composite im onto frame at (x, y) with anchor ('mm','lm','rm','lt',...)."""
    if opacity <= 0.003 or im is None: return
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
    ax, ay = anchor[0], anchor[1]
    x0 = x - (im.width / 2 if ax == "m" else im.width if ax == "r" else 0)
    y0 = y - (im.height / 2 if ay == "m" else im.height if ay == "b" else 0)
    x0, y0 = int(round(x0)), int(round(y0))
    if opacity < 0.999:
        im = im.copy(); a = im.getchannel("A").point(lambda v: int(v * opacity)); im.putalpha(a)
    # clip to frame
    l, t = max(0, x0), max(0, y0)
    r, b = min(frame.width, x0 + im.width), min(frame.height, y0 + im.height)
    if r <= l or b <= t: return
    if (l, t, r, b) != (x0, y0, x0 + im.width, y0 + im.height):
        im = im.crop((l - x0, t - y0, r - x0, b - y0))
    frame.alpha_composite(im, (l, t))

def text(frame, s, x, y, size, weight="Bold", fill=WHITE, opacity=1, anchor="mm", path=None,
         tracking=0, glow=0, scale=1.0):
    im = text_img(s, size, weight, fill, path, tracking, glow)
    put(frame, im, x, y, opacity, anchor, scale)
    return im.size

def reveal_text(frame, s, x, y, size, k, weight="Bold", fill=WHITE, anchor="lm", path=None, tracking=0, glow=0):
    """Left-to-right mask wipe of a text line (k = 0..1)."""
    if k <= 0: return
    im = text_img(s, size, weight, fill, path, tracking, glow)
    w = int(im.width * ease_out(k))
    if w <= 0: return
    put(frame, im.crop((0, 0, w, im.height)),
        x - (im.width / 2 if anchor[0] == "m" else 0), y, 1.0, "l" + anchor[1])

# ------------------------------------------------------------------ photos
@lru_cache(maxsize=64)
def photo(name, grade="doc", w=2304):
    """Load and colour-grade a photo to width w (cover-fit for 16:9 at up to 1.2x zoom)."""
    p = A("assets/images", name + ".jpg")
    im = Image.open(p).convert("RGB")
    if name == "a320neo_frontier":                       # crop out photographer's signature
        im = im.crop((int(im.width * 0.12), 0, im.width, int(im.height * 0.86)))
    h = int(w * 9 / 16)
    im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, 0.5))
    if grade == "doc":      # cool, slightly desaturated documentary grade
        im = ImageEnhance.Color(im).enhance(0.82)
        im = ImageEnhance.Contrast(im).enhance(1.08)
        arr = np.asarray(im).astype(np.float32)
        arr = arr * np.array([0.94, 0.99, 1.06]) + np.array([0, 2, 8])
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return im.convert("RGBA")

def kenburns(name, t, t0, t1, z0=1.0, z1=1.12, p0=(0.5, 0.5), p1=(0.5, 0.5), size=(W, H), grade="doc"):
    """Smooth zoom/pan crop of a photo for the window [t0, t1]."""
    im = photo(name, grade)
    k = ease_in_out(prog(t, t0, t1))
    z = lerp(z0, z1, k); cx = lerp(p0[0], p1[0], k); cy = lerp(p0[1], p1[1], k)
    sw, sh = size
    cw = im.width / z * min(1.0, (sw / sh) / (im.width / im.height))
    ch = cw * sh / sw
    if ch > im.height: ch = im.height; cw = ch * sw / sh
    x0 = clamp(cx * im.width - cw / 2, 0, im.width - cw)
    y0 = clamp(cy * im.height - ch / 2, 0, im.height - ch)
    return im.transform(size, Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BILINEAR)

def darken(im, amount):
    """Overlay navy at given opacity."""
    ov = Image.new("RGBA", im.size, NAVY + (int(255 * amount),))
    return Image.alpha_composite(im, ov)

@lru_cache(maxsize=8)
def gradient_mask(w, h, direction="left", strength=1.0):
    """Navy gradient overlay used to make text readable over photos."""
    if direction in ("left", "right"):
        g = np.linspace(1, 0, w) if direction == "left" else np.linspace(0, 1, w)
        g = np.tile(np.clip(g * 1.6 - 0.15, 0, 1) ** 1.2, (h, 1))
    else:
        g = np.linspace(0, 1, h) if direction == "bottom" else np.linspace(1, 0, h)
        g = np.tile((np.clip(g * 1.6 - 0.3, 0, 1) ** 1.3)[:, None], (1, w))
    a = (g * 255 * strength).astype(np.uint8)
    im = Image.new("RGBA", (w, h), NAVY + (0,)); im.putalpha(Image.fromarray(a)); return im

# ------------------------------------------------------------------ backgrounds & overlays
@lru_cache(maxsize=4)
def blueprint_bg(variant=0):
    """Dark navy engineering grid with fine and major lines and a soft centre glow."""
    im = Image.new("RGBA", (W, H), NAVY + (255,))
    arr = np.asarray(im).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
    glow = np.clip(1 - r * 1.6, 0, 1)[..., None] * np.array([6, 18, 36, 0])
    im = Image.fromarray(np.clip(arr + glow, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    for x in range(0, W, 40): d.line([(x, 0), (x, H)], fill=(26, 58, 96, 255) if x % 200 else (40, 86, 140, 255), width=1)
    for y in range(0, H, 40): d.line([(0, y), (W, y)], fill=(26, 58, 96, 255) if y % 200 else (40, 86, 140, 255), width=1)
    return im

@lru_cache(maxsize=1)
def vignette():
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    a = (np.clip((r - 0.65) / 0.75, 0, 1) ** 1.6 * 170).astype(np.uint8)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); im.putalpha(Image.fromarray(a)); return im

@lru_cache(maxsize=6)
def grain(i):
    rng = np.random.default_rng(i)
    n = rng.integers(0, 255, (H // 2, W // 2), dtype=np.uint8)
    a = Image.fromarray((np.abs(n.astype(int) - 128) // 9).astype(np.uint8)).resize((W, H))
    im = Image.new("RGBA", (W, H), (255, 255, 255, 0)); im.putalpha(a); return im

def glow_layer(layer, radius=8, strength=1.6):
    """Bloom: blur a line-art layer at half resolution and add it underneath."""
    small = layer.resize((layer.width // 2, layer.height // 2), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius / 2))
    g = small.resize(layer.size, Image.BILINEAR)
    if strength != 1:
        a = g.getchannel("A").point(lambda v: min(255, int(v * strength))); g.putalpha(a)
    return Image.alpha_composite(g, layer)

def hud(frame, t, label="AIRCRAFT GENERAL PRACTICES", sub="JACKING", idx=None, opacity=0.9):
    """Corner brackets + series tag; keeps a consistent identity across scenes."""
    d = ImageDraw.Draw(frame)
    c = CYAN + (int(150 * opacity),); m, L = 46, 38
    for (x, y, sx, sy) in [(m, m, 1, 1), (W - m, m, -1, 1), (m, H - m, 1, -1), (W - m, H - m, -1, -1)]:
        d.line([(x, y), (x + L * sx, y)], fill=c, width=2); d.line([(x, y), (x, y + L * sy)], fill=c, width=2)
    text(frame, label, 70, 66, 17, "SemiBold", SILVER, 0.85 * opacity, "lm", tracking=3)
    text(frame, "|  " + sub, 70 + text_img(label, 17, "SemiBold", SILVER, None, 3).width - 4, 66, 17, "Bold", CYAN,
         0.95 * opacity, "lm", tracking=3)
    if idx is not None:
        text(frame, f"{idx:02d} / {len(SCENES):02d}", W - 70, 66, 17, "SemiBold", SILVER, 0.8 * opacity, "rm", tracking=3)
    # blinking record dot
    if int(t * 2) % 2 == 0: d.ellipse([W - 220, 60, W - 208, 72], fill=RED + (int(200 * opacity),))

def credit(frame, name, opacity=1.0):
    if name in CREDITS:
        text(frame, CREDITS[name], W - 70, H - 60, 15, "Medium", SILVER, 0.75 * opacity, "rm")

def caption(frame, t):
    """Khmer subtitle synced to the narration (lower third, max 2 lines)."""
    for (a, b, s) in CAPTIONS:
        if a - 0.12 <= t <= b + 0.12:
            op = fade(t, a - 0.12, b + 0.12, 0.18, 0.18)
            lines = wrap_lines(s, 38, "Medium", 1480)
            lh = 62; total = lh * len(lines)
            y0 = H - 118 - total
            maxw = max(text_img(l, 38, "Medium").width for l in lines)
            band = Image.new("RGBA", (maxw + 60, total + 26), (4, 12, 26, int(170 * op)))
            put(frame, band, W / 2, y0 + total / 2 + 4, 1.0)
            ImageDraw.Draw(frame).line([(W / 2 - maxw / 2 - 30, y0 - 9), (W / 2 - maxw / 2 + 50, y0 - 9)],
                                      fill=CYAN + (int(220 * op),), width=3)
            for i, l in enumerate(lines):
                text(frame, l, W / 2, y0 + lh * i + lh / 2, 38, "Medium", WHITE, op)
            return

def chip(frame, label, x, y, k, color=CYAN, size=26, sub=None, anchor="lm"):
    """Animated technical label: line draws, then text slides in, with a small
    bracket box. Used for callouts like AIRCRAFT JACK."""
    if k <= 0: return
    im = text_img(label, size, "ExtraBold", WHITE, FONT_EN, 2)
    w = im.width + 36; h = im.height + (34 if sub else 10)
    box = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(box)
    d.rectangle([0, 0, w - 1, h - 1], fill=(7, 20, 38, 205), outline=color + (255,), width=2)
    d.rectangle([0, 0, 7, h - 1], fill=color + (255,))
    box.alpha_composite(im, (22, 4))
    if sub:
        s = text_img(sub, 22, "Medium", SILVER, FONT_KH)
        box.alpha_composite(s, (22, im.height - 4))
    kk = ease_out(k)
    cw = max(1, int(w * kk))
    put(frame, box.crop((0, 0, cw, h)), x if anchor[0] == "l" else x - w, y, 1.0, "lm")

def leader(frame, x0, y0, x1, y1, k, color=CYAN, dot=True, width=2):
    """Callout leader line drawn progressively from (x0,y0) to (x1,y1)."""
    if k <= 0: return
    d = ImageDraw.Draw(frame)
    kk = ease_out(k)
    xm, ym = lerp(x0, x1, kk), lerp(y0, y1, kk)
    d.line([(x0, y0), (xm, ym)], fill=color + (255,), width=width)
    if dot:
        r = 7
        d.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], outline=color + (255,), width=2)
        d.ellipse([x0 - 3, y0 - 3, x0 + 3, y0 + 3], fill=color + (255,))

def pulse_ring(frame, x, y, t, t0, color=GOLD, r0=10, r1=46):
    """Expanding ripple rings from a point, starting at t0."""
    if t < t0: return
    d = ImageDraw.Draw(frame)
    for k in range(2):
        ph = ((t - t0) * 0.9 + k * 0.5) % 1.0
        r = lerp(r0, r1, ph); a = int(230 * (1 - ph))
        d.ellipse([x - r, y - r, x + r, y + r], outline=color + (a,), width=3)
    s = ease_out(prog(t, t0, t0 + 0.35)) * 11
    d.ellipse([x - s, y - s, x + s, y + s], fill=color + (255,))

# ------------------------------------------------------------------ polyline art
def path_len(pts): return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))

def partial(pts, k):
    """First k (0..1) of a polyline by arc length -> 'drawing on' effect."""
    if k >= 1: return pts
    if k <= 0 or len(pts) < 2: return pts[:1]
    total = path_len(pts); target = total * k; out = [pts[0]]; acc = 0
    for i in range(len(pts) - 1):
        seg = math.dist(pts[i], pts[i + 1])
        if acc + seg >= target:
            f = (target - acc) / seg if seg else 0
            out.append((lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f))); return out
        out.append(pts[i + 1]); acc += seg
    return out

def xf(pts, sx, sy, ox, oy, rot=0.0, cx=0.0, cy=0.0):
    """Scale/translate (and rotate about (cx,cy) in model space) a polyline."""
    out = []
    c, s = math.cos(rot), math.sin(rot)
    for (x, y) in pts:
        if rot:
            x, y = x - cx, y - cy; x, y = x * c - y * s + cx, x * s + y * c + cy
        out.append((ox + x * sx, oy + y * sy))
    return out

def ellipse_pts(cx, cy, rx, ry, n=48, a0=0, a1=2 * math.pi):
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

# ---- generic narrow-body twinjet, SIDE view. Model units: nose at x=0, tail at x=100,
#      y down, fuselage centreline y=0. Illustrative proportions only (not to scale).
def side_aircraft():
    P = []
    # fuselage outline (top then bottom)
    top = [(0, 1.2), (0.8, -1.4), (2.5, -3.0), (5, -3.9), (9, -4.3), (14, -4.45), (78, -4.45), (86, -4.1), (93, -3.0), (100, -1.2)]
    bot = [(100, -0.2), (94, 1.0), (86, 2.6), (78, 3.9), (60, 4.45), (14, 4.45), (6, 4.0), (2.5, 3.0), (0, 1.2)]
    P.append(top + bot)
    # cockpit windows
    P.append([(3.0, -2.2), (5.2, -3.15), (7.4, -3.35), (7.2, -2.1), (3.0, -2.2)])
    # vertical fin
    P.append([(80, -4.4), (89, -16.5), (94.5, -16.5), (97.5, -2.0)])
    # horizontal stabiliser (edge-on)
    P.append([(88, -1.6), (101.5, -2.0), (101.5, -1.2), (88, -0.8)])
    # wing (edge-on root, slightly drooped)
    P.append([(33, 2.6), (52, 3.4), (56, 3.2), (34, 1.9), (33, 2.6)])
    # engine nacelle + pylon
    P.append(ellipse_pts(36.5, 6.3, 6.3, 2.4, 40))
    P.append([(38, 3.9), (40, 2.6), (45, 2.8), (43, 4.4)])
    P.append([(30.2, 4.6), (30.2, 8.0)])          # intake lip
    # door lines
    for x in (11, 69, 84): P.append([(x, -2.9), (x, 2.4)])
    # cabin windows (dashes)
    for i in range(22): P.append([(16 + i * 2.6, -1.6), (17.2 + i * 2.6, -1.6)])
    return P

def side_gear(strut_ext=0.0):
    """Landing gear polylines + wheel centres (model units). strut_ext extends oleo."""
    P = []; wheels = []
    # nose gear at x=11
    P.append([(11, 4.4), (11, 9.2 + strut_ext)]); wheels.append((11, 10.4 + strut_ext, 1.25))
    # main gear at x=47
    P.append([(46, 3.8), (47, 9.4 + strut_ext)]); P.append([(44.5, 4.4), (47, 7.2 + strut_ext * 0.5)])
    wheels.append((47, 11.0 + strut_ext, 2.0))
    return P, wheels

# ---- TOP view (plan). Model units: nose x=0 ... tail x=100, centreline y=0, span +/-56
def top_aircraft():
    P = []
    half = [(0, 0), (1, -1.8), (3.5, -3.3), (8, -4.2), (14, -4.45), (78, -4.45), (88, -3.6), (96, -2.0), (100, 0)]
    P.append(half + [(x, -y) for (x, y) in reversed(half)])
    for s in (-1, 1):
        P.append([(34, 4.4 * s), (46, 54 * s), (50.5, 55.5 * s), (52.5, 53.5 * s), (52, 4.4 * s)])      # wing
        P.append([(84, 3.6 * s), (93, 20 * s), (96.5, 20 * s), (97.5, 2.6 * s)])                        # h-stab
        P.append([(26.5, 13.2 * s), (37.5, 13.2 * s), (37.5, 19.6 * s), (26.5, 19.6 * s), (26.5, 13.2 * s)])  # nacelle
    P.append([(80, 0), (98, 0)])                                                                         # fin (plan)
    return P

TOP_JACK_POINTS = {"nose": (8.5, 0.0), "left": (46.5, -24.5), "right": (46.5, 24.5)}  # illustrative

def draw_polys(layer, polys, color=CYAN, width=3, k=1.0):
    """Draw a list of polylines; k animates 'draw-on' across the whole set."""
    d = ImageDraw.Draw(layer)
    n = len(polys)
    for i, p in enumerate(polys):
        kk = clamp(k * n - i * 0.6) if k < 1 else 1
        if kk <= 0: continue
        q = partial(p, kk)
        if len(q) >= 2: d.line(q, fill=color + (255,), width=width, joint="curve")

# ---- tripod aircraft jack (side view). Returns polylines in pixel space.
def tripod_jack(x, ground, scale=1.0, ram=0.0, screw=0.0):
    """x = centre, ground = floor y, ram/screw = extension in px. Height ~ 160*scale."""
    s = scale; P = []
    top = ground - 120 * s
    P.append([(x - 70 * s, ground), (x - 12 * s, top + 40 * s)])               # legs
    P.append([(x + 70 * s, ground), (x + 12 * s, top + 40 * s)])
    P.append([(x, ground - 6 * s), (x, top + 46 * s)])
    P.append([(x - 46 * s, ground - 40 * s), (x + 46 * s, ground - 40 * s)])    # brace
    for xx in (x - 70 * s, x + 70 * s): P.append([(xx - 12 * s, ground), (xx + 12 * s, ground)])  # feet
    # cylinder
    P.append([(x - 13 * s, top + 44 * s), (x - 13 * s, top - 10 * s), (x + 13 * s, top - 10 * s), (x + 13 * s, top + 44 * s), (x - 13 * s, top + 44 * s)])
    # ram
    rt = top - 10 * s - ram
    P.append([(x - 8 * s, top - 10 * s), (x - 8 * s, rt), (x + 8 * s, rt), (x + 8 * s, top - 10 * s)])
    # screw extension + lock nut + pad
    st = rt - 18 * s - screw
    P.append([(x - 4 * s, rt), (x - 4 * s, st), (x + 4 * s, st), (x + 4 * s, rt)])
    P.append([(x - 12 * s, rt - 4 * s), (x + 12 * s, rt - 4 * s), (x + 12 * s, rt - 12 * s), (x - 12 * s, rt - 12 * s), (x - 12 * s, rt - 4 * s)])
    P.append(ellipse_pts(x, st - 6 * s, 9 * s, 6 * s, 20, math.pi, 2 * math.pi) + [(x - 9 * s, st - 6 * s)])
    return P, (x, st - 12 * s)   # second value = top of jack pad (contact point)

def wheel_shape(cx, cy, r):
    return [ellipse_pts(cx, cy, r, r, 40), ellipse_pts(cx, cy, r * 0.55, r * 0.55, 30), ellipse_pts(cx, cy, r * 0.18, r * 0.18, 14)]

# ------------------------------------------------------------------ icons (line style)
def icon(layer, kind, cx, cy, s=1.0, color=CYAN, k=1.0):
    d = ImageDraw.Draw(layer); c = color + (255,); w = max(2, int(3 * s))
    polys = []
    if kind == "gear":         # strut + wheel
        polys += [[(cx - 4 * s, cy - 40 * s), (cx + 4 * s, cy + 10 * s)], [(cx - 22 * s, cy - 36 * s), (cx, cy - 8 * s)]]
        polys += wheel_shape(cx + 4 * s, cy + 22 * s, 18 * s)
    elif kind == "wheel":
        polys += wheel_shape(cx, cy, 34 * s)
        polys += [[(cx + 34 * s * math.cos(a), cy + 34 * s * math.sin(a)), (cx + 40 * s * math.cos(a), cy + 40 * s * math.sin(a))] for a in [i * math.pi / 6 for i in range(12)]]
    elif kind == "brake":       # disc with caliper
        polys += [ellipse_pts(cx, cy, 34 * s, 34 * s, 40), ellipse_pts(cx, cy, 12 * s, 12 * s, 20)]
        polys += [[(cx + 8 * s, cy - 44 * s), (cx + 30 * s, cy - 44 * s), (cx + 30 * s, cy - 14 * s), (cx + 8 * s, cy - 14 * s), (cx + 8 * s, cy - 44 * s)]]
        polys += [[(cx + 22 * s * math.cos(a), cy + 22 * s * math.sin(a)), (cx + 26 * s * math.cos(a), cy + 26 * s * math.sin(a))] for a in [i * math.pi / 4 for i in range(8)]]
    elif kind == "retract":     # strut folding with curved arrow
        polys += [[(cx - 30 * s, cy - 30 * s), (cx - 30 * s, cy + 20 * s)], ellipse_pts(cx - 30 * s, cy + 30 * s, 10 * s, 10 * s, 20)]
        arc = ellipse_pts(cx - 30 * s, cy - 30 * s, 50 * s, 50 * s, 24, math.pi / 2, 0.05)
        polys += [arc, [(arc[-1][0] - 10 * s, arc[-1][1] + 8 * s), arc[-1], (arc[-1][0] + 8 * s, arc[-1][1] + 10 * s)]]
    elif kind == "weight":
        polys += [[(cx - 30 * s, cy + 30 * s), (cx - 22 * s, cy - 12 * s), (cx + 22 * s, cy - 12 * s), (cx + 30 * s, cy + 30 * s), (cx - 30 * s, cy + 30 * s)],
                  ellipse_pts(cx, cy - 22 * s, 11 * s, 11 * s, 20)]
    elif kind == "jack":
        polys += tripod_jack(cx, cy + 34 * s, 0.42 * s)[0]
    elif kind == "wind":
        for i, yy in enumerate((-18, 0, 18)):
            L = (52, 70, 44)[i] * s
            polys.append([(cx - 36 * s, cy + yy * s), (cx - 36 * s + L, cy + yy * s)] +
                         ellipse_pts(cx - 36 * s + L, cy + yy * s - 7 * s, 7 * s, 7 * s, 12, math.pi / 2, -math.pi))
    elif kind == "ground":
        polys += [[(cx - 40 * s, cy), (cx + 40 * s, cy)]]
        polys += [[(cx - 36 * s + i * 14 * s, cy + 2), (cx - 46 * s + i * 14 * s, cy + 16 * s)] for i in range(6)]
        polys += [[(cx - 20 * s, cy - 6), (cx - 20 * s, cy - 30 * s), (cx + 20 * s, cy - 30 * s), (cx + 20 * s, cy - 6)]]
    elif kind == "check":
        polys += [[(cx - 14 * s, cy), (cx - 4 * s, cy + 11 * s), (cx + 16 * s, cy - 12 * s)]]
    draw_polys(layer, polys, color, w, k)
