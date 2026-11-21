"""Scene renderers. Each function takes the global time t (seconds on the audio
timeline) and returns an RGBA frame. Scene windows and cue points come from
config.py, which is derived from the real narration audio."""
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from config import *
from gfx import *

S = {sid: (a, b) for sid, a, b, _ in SCENES}

def base_photo(name, t, sid, z0=1.0, z1=1.12, p0=(.5, .5), p1=(.5, .5), dark=0.35):
    a, b = S[sid]
    f = kenburns(name, t, a, b, z0, z1, p0, p1)
    return darken(f, dark) if dark else f

def blueprint_frame(t, sid, drift=True):
    """Blueprint grid with a very slow drift to keep the background alive."""
    a, b = S[sid]
    bg = blueprint_bg()
    if not drift: return bg.copy()
    k = prog(t, a, b); dx = int(k * 40)
    f = Image.new("RGBA", (W, H)); f.paste(bg.crop((dx, 0, W, H)), (0, 0)); f.paste(bg.crop((0, 0, dx, H)), (W - dx, 0))
    return f

def title_block(frame, en, kh, x, y, k, size=64, kh_size=40, color=CYAN, anchor="lm"):
    """English technical title + Khmer subtitle with a mask wipe and underline."""
    if k <= 0: return
    reveal_text(frame, en, x, y, size, k, "Black", WHITE, anchor, FONT_EN, 3)
    im = text_img(en, size, "Black", WHITE, FONT_EN, 3)
    x0 = x - (im.width / 2 if anchor[0] == "m" else 0)
    d = ImageDraw.Draw(frame)
    d.line([(x0 + 8, y + im.height / 2 - 4), (x0 + 8 + (im.width - 16) * ease_out(prog(k, .3, 1)), y + im.height / 2 - 4)],
           fill=color + (255,), width=4)
    if kh: text(frame, kh, x0 + 8, y + im.height / 2 + kh_size * 0.95, kh_size, "SemiBold", SILVER, ease(prog(k, .4, 1)), "lm")

def aircraft_px(polys, ox, oy, sc, rot=0.0, cx=50, cy=0):
    return [xf(p, sc, sc, ox, oy, rot, cx, cy) for p in polys]

# ================================================================== 1 HOOK
def hook(t):
    sid = 1; a, b = S[sid]
    f = base_photo("a320_hangar", t, sid, 1.18, 1.02, (.45, .42), (.5, .5), dark=0.45)
    put(f, gradient_mask(W, H, "left", 0.95), W / 2, H / 2)
    k1 = prog(t, 0.25, 1.2)
    text(f, "AIRCRAFT GENERAL PRACTICES", 150, 300, 26, "SemiBold", CYAN, ease(k1), "lm", tracking=6)
    reveal_text(f, "តើយន្តហោះដ៏ធំមួយ", 150, 400, 86, prog(t, 1.75, 2.6), "Bold", WHITE, "lm")
    reveal_text(f, "លើកផុតពីដីដោយរបៀបណា?", 150, 520, 86, prog(t, 3.2, 4.2), "Bold", GOLD, "lm")
    # rising arrow hint at the landing gear
    k = ease_out(prog(t, 4.0, 5.0))
    if k > 0:
        d = ImageDraw.Draw(f); x = 1330; y = lerp(880, 820, k)
        for i in range(3):
            yy = y - i * 26; al = int(255 * k * (1 - i * 0.28))
            d.line([(x - 30, yy + 18), (x, yy), (x + 30, yy + 18)], fill=CYAN + (al,), width=5)
    credit(f, "a320_hangar", fade(t, a, b))
    return f

# ================================================================== 2 WEIGHT QUESTION
def weight_question(t):
    sid = 2; a, b = S[sid]
    f = blueprint_frame(t, sid)
    layer = Image.new("RGBA", (W, H))
    sc = 13.0; ox = W / 2 - 50 * sc; oy = 560
    draw_polys(layer, aircraft_px(side_aircraft(), ox, oy, sc), CYAN, 3, prog(t, a, a + 2.2))
    gp, wh = side_gear()
    draw_polys(layer, aircraft_px(gp, ox, oy, sc), CYAN, 3, prog(t, a + 0.8, a + 2.4))
    for (x, y, r) in wh:
        draw_polys(layer, [xf(p, 1, 1, 0, 0) for p in wheel_shape(ox + x * sc, oy + y * sc, r * sc)], CYAN, 3, prog(t, a + 1.2, a + 2.4))
    gy = oy + 13.2 * sc
    ImageDraw.Draw(layer).line([(140, gy), (W - 140, gy)], fill=SILVER + (200,), width=2)
    f.alpha_composite(glow_layer(layer, 10, 1.4))
    # WEIGHT arrow pressing down
    k = back_out(prog(t, 6.6, 7.4))
    if k > 0:
        d = ImageDraw.Draw(f); x = W / 2; y0 = 150; y1 = lerp(150, 330, k)
        d.line([(x, y0), (x, y1)], fill=GOLD + (255,), width=10)
        d.polygon([(x - 34, y1 - 6), (x + 34, y1 - 6), (x, y1 + 40)], fill=GOLD + (255,))
        text(f, "WEIGHT", x + 50, 220, 44, "Black", GOLD, clamp(k), "lm", tracking=6)
        text(f, "ទម្ងន់", x + 54, 275, 34, "SemiBold", SILVER, clamp(k), "lm")
    # question marks under the wheels (what can hold it?)
    for i, (x, y, r) in enumerate(wh):
        kk = back_out(prog(t, 7.9 + i * 0.25, 8.5 + i * 0.25))
        if kk > 0: text(f, "?", ox + x * sc, gy + 70, 70, "Black", CYAN, clamp(kk), "mm", scale=max(0.2, kk), glow=6)
    text(f, "ILLUSTRATIVE NARROW-BODY PROFILE · NOT TO SCALE", 140, gy + 40, 15, "Medium", SILVER, 0.7 * fade(t, a + 1, b), "lm", tracking=2)
    return f

# ================================================================== 3 TITLE
def title_jacking(t):
    sid = 3; a, b = S[sid]
    f = blueprint_frame(t, sid, drift=False)
    put(f, Image.new("RGBA", (W, H), NAVY + (150,)), W / 2, H / 2)
    k = prog(t, CUE["jacking_word"] - 0.05, CUE["jacking_word"] + 0.45)
    sc = lerp(1.35, 1.0, ease_out(k))
    text(f, "JACKING", W / 2, 470, 190, "Black", WHITE, ease(k), "mm", FONT_EN, 14, scale=sc)
    # light sweep across the title
    sw = prog(t, CUE["jacking_word"] + 0.4, CUE["jacking_word"] + 1.3)
    if 0 < sw < 1:
        im = text_img("JACKING", 190, "Black", WHITE, FONT_EN, 14)
        band = Image.new("L", im.size, 0); d = ImageDraw.Draw(band); bx = lerp(-200, im.width + 200, sw)
        d.polygon([(bx, 0), (bx + 90, 0), (bx - 30, im.height), (bx - 120, im.height)], fill=180)
        band = band.filter(ImageFilter.GaussianBlur(18))
        hl = Image.new("RGBA", im.size, CYAN + (0,)); hl.putalpha(Image.fromarray(np.minimum(np.asarray(band), np.asarray(im.getchannel("A")))))
        put(f, hl, W / 2, 470)
    text(f, "ការលើកយន្តហោះ", W / 2, 620, 54, "Bold", GOLD, ease(prog(t, 10.4, 10.9)))
    text(f, "ATA 07  ·  LIFTING & SHORING", W / 2, 710, 24, "SemiBold", CYAN, ease(prog(t, 10.7, 11.2)), tracking=6)
    return f

# ================================================================== 4 AIRCRAFT JACK (photo + exploded view)
JACK_PARTS = [  # (label EN, label KH, polyline factory offset order top->bottom)
    ("JACK PAD / ADAPTER", "ក្បាលទ្រ"),
    ("SCREW EXTENSION & LOCK NUT", "វីសពន្លូត និងគ្រាប់ចាក់សោ"),
    ("HYDRAULIC RAM", "ដងរុញអ៊ីដ្រូលិក"),
    ("CYLINDER", "ស៊ីឡាំង"),
    ("TRIPOD LEGS", "ជើងបីទ្រ"),
]

def jack_parts(cx, ground, s, gap):
    """Tripod jack split into 5 groups, separated vertically by `gap` px."""
    top = ground - 120 * s
    legs = [[(cx - 70 * s, ground), (cx - 12 * s, top + 40 * s)], [(cx + 70 * s, ground), (cx + 12 * s, top + 40 * s)],
            [(cx, ground - 6 * s), (cx, top + 46 * s)], [(cx - 46 * s, ground - 40 * s), (cx + 46 * s, ground - 40 * s)],
            [(cx - 82 * s, ground), (cx - 58 * s, ground)], [(cx + 58 * s, ground), (cx + 82 * s, ground)]]
    cyl = [[(cx - 13 * s, top + 44 * s), (cx - 13 * s, top - 10 * s), (cx + 13 * s, top - 10 * s), (cx + 13 * s, top + 44 * s), (cx - 13 * s, top + 44 * s)]]
    rt = top - 10 * s - 40 * s
    ram = [[(cx - 8 * s, top - 10 * s), (cx - 8 * s, rt), (cx + 8 * s, rt), (cx + 8 * s, top - 10 * s), (cx - 8 * s, top - 10 * s)]]
    st = rt - 30 * s
    screw = [[(cx - 4 * s, rt), (cx - 4 * s, st), (cx + 4 * s, st), (cx + 4 * s, rt)],
             [(cx - 12 * s, rt - 4 * s), (cx + 12 * s, rt - 4 * s), (cx + 12 * s, rt - 12 * s), (cx - 12 * s, rt - 12 * s), (cx - 12 * s, rt - 4 * s)]]
    pad = [ellipse_pts(cx, st - 6 * s, 10 * s, 7 * s, 20, math.pi, 2 * math.pi) + [(cx - 10 * s, st - 6 * s)]]
    groups = [pad, screw, ram, cyl, legs]
    out = []
    for i, g in enumerate(groups):
        dy = -(4 - i) * gap
        out.append(([[(x, y + dy) for (x, y) in p] for p in g], st - 10 * s + dy if i == 0 else (rt - 8 * s + dy if i == 1 else (lerp(top - 10 * s, rt, .5) + dy if i == 2 else (top + 17 * s + dy if i == 3 else ground - 40 * s + dy)))))
    return out

def aircraft_jack(t):
    sid = 4; a, b = S[sid]
    f = blueprint_frame(t, sid)
    # left: real photo panel of a tripod jack under a wing
    pw, ph = 900, 640
    panel = kenburns("jack_lancaster_2", t, a, b, 1.05, 1.2, (.42, .62), (.38, .68), size=(pw, ph))
    k = ease_out(prog(t, a, a + 0.6))
    put(f, panel, 120 + pw / 2 - (1 - k) * 80, 520, k)
    d = ImageDraw.Draw(f); d.rectangle([120, 520 - ph / 2, 120 + pw, 520 + ph / 2], outline=CYAN + (int(200 * k),), width=2)
    text(f, CREDITS["jack_lancaster_2"], 130, 520 + ph / 2 + 22, 15, "Medium", SILVER, 0.7 * k, "lm")
    # right: exploded view collapsing into an assembled jack
    asm = ease_in_out(prog(t, 14.3, 15.9))
    gap = lerp(62, 0, asm)
    layer = Image.new("RGBA", (W, H))
    cx, ground, s = 1420, 900, 2.3
    parts = jack_parts(cx, ground - 30, s, gap)
    for i, (polys, ly) in enumerate(parts):
        kk = prog(t, a + 0.4 + i * 0.35, a + 1.2 + i * 0.35)
        draw_polys(layer, polys, CYAN, 3, kk)
    f.alpha_composite(glow_layer(layer, 8, 1.3))
    for i, (polys, ly) in enumerate(parts):
        kk = prog(t, a + 0.9 + i * 0.35, a + 1.6 + i * 0.35) * (1 - prog(t, 14.0, 14.5))
        if kk > 0:
            leader(f, cx + 40, ly, cx + 120, ly, kk, SILVER, True, 2)
            text(f, JACK_PARTS[i][0], cx + 130, ly - 12, 18, "Bold", WHITE, kk, "lm", tracking=1)
            text(f, JACK_PARTS[i][1], cx + 130, ly + 14, 18, "Medium", SILVER, kk, "lm")
    text(f, "EXPLODED VIEW · TYPICAL TRIPOD JACK (GENERIC)", 1130, 210, 17, "SemiBold", CYAN, fade(t, a + .5, 15.0), "lm", tracking=2)
    # AIRCRAFT JACK callout when the word is spoken
    kc = prog(t, CUE["aircraft_jack"], CUE["aircraft_jack"] + 0.5)
    chip(f, "AIRCRAFT JACK", 1170, 240, kc, GOLD, 40, "ឧបករណ៍លើកយន្តហោះ")
    return f

# ================================================================== 5 LIFT ANIMATION
def lift_animation(t):
    sid = 5; a, b = S[sid]
    f = blueprint_frame(t, sid)
    sc = 13.5; gy = 820
    # phases: jacks rise to contact (17.8-19.2), lift (19.6-22.0) -> wheels leave ground at lift_off
    contact = ease_in_out(prog(t, 17.9, 19.2))
    lift = ease_in_out(prog(t, 19.6, CUE["lift_off"] + 0.9))
    strut = 0.9 * ease(prog(t, 19.6, 20.8))                  # oleo extends before wheels leave
    rise_px = lift * 86 - strut * sc * 0.0
    oy = gy - 13.2 * sc - rise_px + strut * sc * 0          # aircraft body rises
    ox = W / 2 - 50 * sc
    layer = Image.new("RGBA", (W, H))
    # wheels stay on ground until the strut is fully extended
    wheel_rise = max(0.0, rise_px - strut * sc)
    draw_polys(layer, aircraft_px(side_aircraft(), ox, oy, sc), CYAN, 3)
    gp, wh = side_gear(strut)
    draw_polys(layer, aircraft_px(gp, ox, oy + (0 if wheel_rise > 0 else 0), sc), CYAN, 3)
    wheel_pts = []
    for (x, y, r) in wh:
        wx, wy = ox + x * sc, gy - r * sc - wheel_rise
        wy = min(wy, oy + y * sc)
        wheel_pts.append((wx, wy, r * sc))
        draw_polys(layer, wheel_shape(wx, wy, r * sc), CYAN, 3)
    # jacks under nose (x=8.5) and wing (x=46.5 drawn slightly behind main gear: x=40)
    for jx in (8.0, 40.5):
        px = ox + jx * sc
        body_y = oy + (4.45 if jx < 20 else 3.4) * sc       # underside contact point
        full = gy - body_y
        ram = max(0, lerp(full - 190, full - 168, 1) * contact) if t < 19.6 else (full - 168)
        jp, top = tripod_jack(px, gy, 1.0, ram=max(0, ram - 18), screw=0)
        draw_polys(layer, jp, GOLD, 3, prog(t, a, a + 0.6))
    ImageDraw.Draw(layer).line([(100, gy), (W - 100, gy)], fill=SILVER + (220,), width=3)
    # hatching under ground line
    d = ImageDraw.Draw(layer)
    for x in range(100, W - 100, 26): d.line([(x, gy + 2), (x - 14, gy + 16)], fill=SILVER + (90,), width=1)
    f.alpha_composite(glow_layer(layer, 10, 1.3))
    # clearance dimension under main wheel
    if wheel_rise > 3:
        wx, wy, r = wheel_pts[1]
        y0, y1 = wy + r, gy
        d = ImageDraw.Draw(f)
        d.line([(wx + r + 30, y0), (wx + r + 30, y1)], fill=GOLD + (255,), width=2)
        for yy in (y0, y1): d.line([(wx + r + 18, yy), (wx + r + 42, yy)], fill=GOLD + (255,), width=2)
        text(f, "CLEARANCE", wx + r + 54, (y0 + y1) / 2, 20, "Bold", GOLD, ease(prog(wheel_rise, 3, 20)), "lm", tracking=2)
    # labels
    kc = prog(t, CUE["gear_wheels"], CUE["gear_wheels"] + 0.5)
    wx, wy, r = wheel_pts[1]
    leader(f, wx, wy, wx + 300, wy - 20, kc, CYAN)
    chip(f, "LANDING GEAR WHEELS", wx + 300, wy - 20, prog(t, CUE["gear_wheels"] + 0.2, CUE["gear_wheels"] + 0.7), CYAN, 30, "កង់យន្តហោះ")
    kj = prog(t, a + 0.4, a + 1.0)
    chip(f, "AIRCRAFT JACK", ox + 8.0 * sc - 60, 330, kj * (1 - prog(t, 22.6, 23.0)), GOLD, 24)
    leader(f, ox + 8.0 * sc, gy - 120, ox + 8.0 * sc - 20, 360, kj * (1 - prog(t, 22.6, 23.0)), GOLD, False)
    # purpose cards after lift-off
    for i, (en, kh) in enumerate([("INSPECTION", "ត្រួតពិនិត្យ"), ("MAINTENANCE", "ថែទាំ")]):
        k = prog(t, 23.0 + i * 0.6, 23.5 + i * 0.6)
        chip(f, en, 1330 + i * 0 , 250 + i * 95, k, CYAN, 30, kh)
    text(f, "WHEELS OFF THE GROUND", 140, 240, 40, "Black", WHITE, ease(prog(t, CUE["lift_off"] + 0.2, CUE["lift_off"] + 0.8)), "lm", tracking=3)
    text(f, "កង់ផុតពីផ្ទៃដី", 140, 296, 34, "SemiBold", GOLD, ease(prog(t, CUE["lift_off"] + 0.4, CUE["lift_off"] + 1.0)), "lm")
    return f

# ================================================================== 6 WHY
def why(t):
    sid = 6; a, b = S[sid]
    f = base_photo("jack_c130", t, sid, 1.05, 1.15, (.5, .5), (.5, .45), dark=0.55)
    k = back_out(prog(t, 25.45, 25.95))
    text(f, "WHY?", W / 2, 440, 200, "Black", WHITE, clamp(k), scale=lerp(0.6, 1, clamp(k)), glow=4)
    text(f, "ហេតុអ្វីត្រូវលើកយន្តហោះ?", W / 2, 610, 56, "Bold", GOLD, ease(prog(t, 25.9, 26.4)))
    credit(f, "jack_c130", fade(t, a, b))
    return f

# ================================================================== 7 MAINTENANCE TASKS (infographic)
TASKS = [("gear", "LANDING GEAR INSPECTION", "ត្រួតពិនិត្យជើងទម្រ", "task1"),
         ("wheel", "WHEEL & TIRE CHANGE", "ដោះប្ដូរកង់ និងសំបកកង់", "task2"),
         ("brake", "BRAKE SYSTEM CHECK", "ត្រួតពិនិត្យប្រព័ន្ធហ្វ្រាំង", "task3"),
         ("retract", "GEAR RETRACTION TEST", "សាកល្បងបត់-លាតជើងទម្រ", "task4")]

def maintenance_tasks(t):
    sid = 7; a, b = S[sid]
    f = base_photo("jack_a10_operator", t, sid, 1.0, 1.1, (.4, .5), (.45, .5), dark=0.62)
    f = Image.alpha_composite(f, Image.new("RGBA", (W, H), DEEP + (70,)))
    title_block(f, "MAINTENANCE TASKS", "ការងារថែទាំសំខាន់ៗ", 150, 200, prog(t, 28.0, 29.0), 58, 34)
    cw, ch = 760, 230
    for i, (ic, en, kh, cue) in enumerate(TASKS):
        t0 = CUE[cue]; k = ease_out(prog(t, t0, t0 + 0.55))
        if k <= 0: continue
        col, row = i % 2, i // 2
        x = 150 + col * (cw + 60); y = 330 + row * (ch + 40) + (1 - k) * 60
        card = Image.new("RGBA", (cw, ch), (7, 20, 38, 215))
        d = ImageDraw.Draw(card)
        active = t0 <= t < (CUE[TASKS[i + 1][3]] if i < 3 else b)
        d.rectangle([0, 0, cw - 1, ch - 1], outline=(GOLD if active else CYAN) + (255,), width=3 if active else 2)
        d.rectangle([0, 0, 8, ch - 1], fill=(GOLD if active else CYAN) + (255,))
        icon(card, ic, 120, ch / 2, 1.5, GOLD if active else CYAN, prog(t, t0 + 0.1, t0 + 1.0))
        card.alpha_composite(text_img(en, 30, "ExtraBold", WHITE, FONT_EN, 1), (230, 50))
        card.alpha_composite(text_img(kh, 30, "SemiBold", SILVER), (232, 112))
        card.alpha_composite(text_img(f"0{i + 1}", 20, "Bold", GOLD if active else CYAN, FONT_EN, 3), (cw - 60, 18))
        put(f, card, x, y, k, "lt")
    credit(f, "jack_a10_operator", fade(t, a, b))
    return f

# ================================================================== 8 JACKING POINTS (top-view blueprint)
def jacking_points(t):
    sid = 8; a, b = S[sid]
    f = blueprint_frame(t, sid)
    z = lerp(1.0, 1.06, ease_in_out(prog(t, a, b)))
    sc = 7.7 * z; ox = W / 2 - 50 * sc + 60; oy = 565
    # rotate so the nose points left (plan view): model x along screen x, y along screen y
    layer = Image.new("RGBA", (W, H))
    draw_polys(layer, aircraft_px(top_aircraft(), ox, oy, sc), CYAN, 3, prog(t, a, a + 2.5))
    # centreline and station ticks
    d = ImageDraw.Draw(layer)
    for i in range(0, 101, 10):
        x = ox + i * sc; d.line([(x, oy - 5), (x, oy + 5)], fill=SILVER + (120,), width=1)
    d.line([(ox - 30, oy), (ox + 104 * sc, oy)], fill=SILVER + (90,), width=1)
    f.alpha_composite(glow_layer(layer, 10, 1.3))
    text(f, "PLAN VIEW · ILLUSTRATIVE · EXACT LOCATIONS: AMM ATA 07", 140, 300, 15, "Medium", SILVER, 0.75 * fade(t, a + 1, b), "lm", tracking=2)
    title_block(f, "JACKING POINTS", "ចំណុចដាក់ Jack", 140, 175, prog(t, CUE["jp_title"], CUE["jp_title"] + 0.9), 60, 34, GOLD)
    for key, cue, en, kh, dx, dy in [("nose", "jp_nose", "FWD (NOSE)", "ផ្នែកច្រមុះ", -40, -140),
                                       ("left", "jp_left", "LEFT WING", "ស្លាបឆ្វេង", 150, -40),
                                       ("right", "jp_right", "RIGHT WING", "ស្លាបស្តាំ", 150, 40)]:
        mx, my = TOP_JACK_POINTS[key]; px, py = ox + mx * sc, oy + my * sc
        pulse_ring(f, px, py, t, CUE[cue], GOLD)
        k = prog(t, CUE[cue] + 0.15, CUE[cue] + 0.6)
        leader(f, px, py, px + dx, py + dy, k, GOLD, False)
        chip(f, en, px + dx, py + dy, prog(t, CUE[cue] + 0.3, CUE[cue] + 0.8), GOLD, 22, kh, "rm" if dx < 0 else "lm")
    # count badge
    n = sum(1 for c in ("jp_nose", "jp_left", "jp_right") if t >= CUE[c])
    if n:
        text(f, f"{n}", W - 230, 200, 120, "Black", GOLD, 1, "mm", FONT_EN, glow=6)
        text(f, "POINT" if n == 1 else "POINTS", W - 230, 285, 22, "Bold", SILVER, 1, "mm", tracking=4)
    return f

# ================================================================== 9 LOAD PATH
def load_path(t):
    sid = 9; a, b = S[sid]
    f = blueprint_frame(t, sid)
    pw, ph = 820, 620
    panel = kenburns("jack_p3_operator", t, a, b, 1.0, 1.15, (.6, .45), (.62, .4), size=(pw, ph))
    k = ease_out(prog(t, a, a + .5))
    put(f, panel, 110 + pw / 2, 540, k)
    ImageDraw.Draw(f).rectangle([110, 540 - ph / 2, 110 + pw, 540 + ph / 2], outline=CYAN + (200,), width=2)
    text(f, CREDITS["jack_p3_operator"], 120, 540 + ph / 2 + 22, 15, "Medium", SILVER, 0.7 * k, "lm")
    # cross-section: structure + jacking pad adapter + jack head, with load arrows
    layer = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(layer)
    cx, sy = 1400, 420
    k1 = prog(t, a + 0.3, a + 1.6)
    draw_polys(layer, [[(1080, sy - 80), (1720, sy - 80)], [(1080, sy), (1300, sy), (1300, sy + 40), (1500, sy + 40), (1500, sy), (1720, sy)],
                       [(1340, sy + 40), (1340, sy + 70), (1460, sy + 70), (1460, sy + 40)]], SILVER, 3, k1)
    for x in range(1090, 1720, 22): d.line([(x, sy - 78), (x + 18, sy - 4)], fill=SILVER + (int(60 * k1),), width=1)
    up = ease_out(prog(t, a + 1.2, a + 2.4))
    jy = lerp(sy + 260, sy + 72, up)
    draw_polys(layer, [ellipse_pts(cx, jy + 12, 46, 18, 30, math.pi, 2 * math.pi) + [(cx - 46, jy + 12)],
                       [(cx - 18, jy + 12), (cx - 18, jy + 300), (cx + 18, jy + 300), (cx + 18, jy + 12)]], GOLD, 3, prog(t, a + 0.8, a + 1.6))
    f.alpha_composite(glow_layer(layer, 8, 1.3))
    labels_k = prog(t, a + 1.0, a + 1.6)
    text(f, "AIRFRAME STRUCTURE", 1300, sy - 110, 18, "Bold", SILVER, labels_k, "lm", tracking=2)
    text(f, "JACKING PAD", 1520, sy + 56, 18, "Bold", CYAN, labels_k, "lm", tracking=2)
    text(f, "JACK HEAD", 1450, jy + 120, 18, "Bold", GOLD, prog(t, a + 1.6, a + 2.0), "lm", tracking=2)
    # load arrows: weight down, reaction up
    ka = ease_out(prog(t, CUE["load"] + 2.4, CUE["load"] + 3.1))
    if ka > 0:
        dd = ImageDraw.Draw(f)
        for x in (1110, 1690):
            y0, y1 = sy - 205, lerp(sy - 205, sy - 100, ka)
            dd.line([(x, y0), (x, y1)], fill=RED + (255,), width=6); dd.polygon([(x - 16, y1 - 4), (x + 16, y1 - 4), (x, y1 + 20)], fill=RED + (255,))
        y0, y1 = sy + 480, lerp(sy + 480, sy + 380, ka)
        dd.line([(cx + 120, y0), (cx + 120, y1)], fill=GOLD + (255,), width=6); dd.polygon([(cx + 104, y1 + 4), (cx + 136, y1 + 4), (cx + 120, y1 - 20)], fill=GOLD + (255,))
        text(f, "LOAD", 1135, sy - 185, 22, "Black", RED, ka, "lm", tracking=3)
        text(f, "SUPPORT", cx + 145, sy + 440, 22, "Black", GOLD, ka, "lm", tracking=3)
    chip(f, "DESIGNED TO TAKE THE LOAD", 1060, 140, prog(t, CUE["load"] + 1.8, CUE["load"] + 2.4), GOLD, 28, "រចនាឡើងដើម្បីទទួលបន្ទុក")
    return f

# ================================================================== 10 NOT JUST LIFT
def not_just_lift(t):
    sid = 10; a, b = S[sid]
    f = base_photo("jack_f16_team", t, sid, 1.12, 1.0, (.5, .55), (.5, .5), dark=0.55)
    put(f, gradient_mask(W, H, "left", 1.0), W / 2, H / 2)
    k = prog(t, CUE["not_just"] + 0.6, CUE["not_just"] + 1.3)
    text(f, "PLACE JACK  →  LIFT", 150, 420, 72, "Black", SILVER, ease(k), "lm", FONT_EN, 2)
    ks = ease_out(prog(t, 59.0, 59.5))
    if ks > 0:
        w = text_img("PLACE JACK  →  LIFT", 72, "Black", SILVER, FONT_EN, 2).width
        ImageDraw.Draw(f).line([(150, 422), (150 + (w - 10) * ks, 422)], fill=RED + (255,), width=10)
    kp = prog(t, CUE["prepare"], CUE["prepare"] + 0.7)
    reveal_text(f, "PREPARE FIRST", 150, 560, 96, kp, "Black", GOLD, "lm", FONT_EN, 4)
    text(f, "ត្រៀមខ្លួនជាមុនសិន", 156, 660, 46, "Bold", WHITE, ease(prog(t, CUE["prepare"] + 0.3, CUE["prepare"] + 0.9)), "lm")
    credit(f, "jack_f16_team", fade(t, a, b))
    return f

# ================================================================== 11 CHECKLIST
CHECKS = [("weight", "AIRCRAFT WEIGHT", "ទម្ងន់យន្តហោះ", "chk_weight"),
          ("jack", "JACK CAPACITY", "សមត្ថភាពរបស់ Jack", "chk_capacity"),
          ("wind", "WIND CONDITIONS", "លក្ខខណ្ឌខ្យល់", "chk_wind"),
          ("ground", "GROUND CONDITION", "ស្ថានភាពផ្ទៃដី", "chk_ground")]

def checklist(t):
    sid = 11; a, b = S[sid]
    f = blueprint_frame(t, sid)
    pw, ph = 700, 660
    panel = kenburns("jack_e2c_lifted", t, a, b, 1.0, 1.12, (.45, .5), (.5, .45), size=(pw, ph))
    put(f, panel, W - 120 - pw / 2, 530, ease(prog(t, a, a + .5)))
    ImageDraw.Draw(f).rectangle([W - 120 - pw, 530 - ph / 2, W - 120, 530 + ph / 2], outline=CYAN + (200,), width=2)
    text(f, CREDITS["jack_e2c_lifted"], W - 120, 530 + ph / 2 + 22, 15, "Medium", SILVER, 0.7, "rm")
    title_block(f, "PRE-JACKING CHECKS", "ពិនិត្យមុនពេលលើក", 140, 190, prog(t, a, a + .8), 54, 32, GOLD)
    for i, (ic, en, kh, cue) in enumerate(CHECKS):
        t0 = CUE[cue]; k = ease_out(prog(t, t0, t0 + .45))
        y = 320 + i * 140
        if k <= 0: continue
        row = Image.new("RGBA", (920, 120), (7, 20, 38, 200))
        d = ImageDraw.Draw(row); d.rectangle([0, 0, 919, 119], outline=CYAN + (180,), width=2)
        icon(row, ic, 70, 60, 0.9, CYAN, prog(t, t0, t0 + .8))
        row.alpha_composite(text_img(en, 30, "ExtraBold", WHITE, FONT_EN, 2), (140, 10))
        row.alpha_composite(text_img(kh, 27, "SemiBold", SILVER), (142, 60))
        # check box + tick
        d.rectangle([830, 32, 886, 88], outline=GOLD + (255,), width=3)
        icon(row, "check", 858, 60, 1.4, GOLD, prog(t, t0 + .5, t0 + .9))
        put(f, row, 140 + (1 - k) * -60, y, k, "lt")
    return f

# ================================================================== 12 WHEEL CHOCKS + EQUIPMENT
def chocks_equipment(t):
    sid = 12; a, b = S[sid]
    f = blueprint_frame(t, sid)
    layer = Image.new("RGBA", (W, H))
    cx, gy, r = 520, 760, 150
    draw_polys(layer, wheel_shape(cx, gy - r, r), CYAN, 4, prog(t, a, a + .8))
    d = ImageDraw.Draw(layer); d.line([(140, gy), (900, gy)], fill=SILVER + (220,), width=3)
    kc = ease_out(prog(t, CUE["chock"], CUE["chock"] + .6))
    for sgn in (-1, 1):
        x0 = cx + sgn * lerp(420, r * 0.86, kc)
        poly = [(x0, gy), (x0 + sgn * 110, gy), (x0 + sgn * 110, gy - 40), (x0, gy - 95)]
        d.polygon(poly, fill=GOLD + (int(200 * clamp(kc * 2)),), outline=GOLD + (255,))
    f.alpha_composite(glow_layer(layer, 8, 1.2))
    chip(f, "WHEEL CHOCKS", 230, 330, prog(t, CUE["chock"] + .2, CUE["chock"] + .7), GOLD, 40, "ឧបករណ៍ទប់កង់")
    # equipment check: photo of a jack being load tested
    pw, ph = 760, 640
    ke = ease_out(prog(t, CUE["equipment"] - 0.2, CUE["equipment"] + .4))
    panel = kenburns("jack_loadtest", t, a, b, 1.0, 1.1, (.5, .42), (.5, .38), size=(pw, ph))
    put(f, panel, 1360 + (1 - ke) * 200, 560, ke)
    if ke > 0:
        ImageDraw.Draw(f).rectangle([1360 - pw / 2, 560 - ph / 2, 1360 + pw / 2, 560 + ph / 2], outline=CYAN + (int(200 * ke),), width=2)
        text(f, CREDITS["jack_loadtest"], 1360 + pw / 2, 560 + ph / 2 + 22, 15, "Medium", SILVER, 0.7 * ke, "rm")
    chip(f, "EQUIPMENT CHECK", 990, 180, prog(t, CUE["equipment"] + .1, CUE["equipment"] + .6), CYAN, 34, "ពិនិត្យស្ថានភាពឧបករណ៍")
    return f

# ================================================================== 13 SAFETY FIRST
def safety_first(t):
    sid = 13; a, b = S[sid]
    f = base_photo("jack_maintaining", t, sid, 1.0, 1.14, (.62, .62), (.66, .66), dark=0.42)
    put(f, gradient_mask(W, H, "left", 1.0), W / 2, H / 2)
    k = back_out(prog(t, CUE["safety"], CUE["safety"] + .45))
    text(f, "សុវត្ថិភាព", 150, 420, 130, "Bold", WHITE, clamp(k), "lm", FONT_KH2, glow=3)
    text(f, "SAFETY", 156, 290, 40, "Black", RED, ease(prog(t, CUE["safety"], CUE["safety"] + .4)), "lm", tracking=10)
    kp = prog(t, CUE["priority"], CUE["priority"] + .6)
    reveal_text(f, "PRIORITY #1", 150, 590, 84, kp, "Black", GOLD, "lm", FONT_EN, 4)
    text(f, "អាទិភាពទីមួយ", 156, 685, 44, "SemiBold", SILVER, ease(prog(t, CUE["priority"] + .3, CUE["priority"] + .8)), "lm")
    # hazard stripe bar
    hk = ease_out(prog(t, a, a + .5))
    bar = Image.new("RGBA", (int(700 * hk) + 1, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(bar)
    for x in range(-20, bar.width, 32): d.polygon([(x, 16), (x + 16, 0), (x + 32, 0), (x + 16, 16)], fill=GOLD + (230,))
    put(f, bar, 150, 210, 1, "lt")
    credit(f, "jack_maintaining", fade(t, a, b))
    return f

# ================================================================== 14 LEVELING & WEIGHING title
def level_weigh_title(t):
    sid = 14; a, b = S[sid]
    f = base_photo("jack_lancaster_1", t, sid, 1.0, 1.1, (.5, .55), (.55, .55), dark=0.55)
    put(f, gradient_mask(W, H, "bottom", 1.0), W / 2, H / 2)
    text(f, "AFTER JACKING", W / 2, 330, 28, "Bold", CYAN, ease(prog(t, a + .2, a + .8)), tracking=8)
    k1 = back_out(prog(t, CUE["leveling_word"], CUE["leveling_word"] + .5))
    k2 = back_out(prog(t, CUE["weighing_word"], CUE["weighing_word"] + .5))
    text(f, "LEVELING", W / 2 - 330, 480, 92, "Black", WHITE, clamp(k1), "mm", FONT_EN, 4, scale=lerp(.7, 1, clamp(k1)))
    text(f, "&", W / 2, 480, 70, "Bold", GOLD, clamp(k2))
    text(f, "WEIGHING", W / 2 + 350, 480, 92, "Black", WHITE, clamp(k2), "mm", FONT_EN, 4, scale=lerp(.7, 1, clamp(k2)))
    text(f, "ការធ្វើឱ្យស្មើ", W / 2 - 330, 585, 40, "SemiBold", SILVER, ease(prog(t, CUE["leveling_word"] + .3, CUE["leveling_word"] + .8)))
    text(f, "ការថ្លឹងទម្ងន់", W / 2 + 350, 585, 40, "SemiBold", SILVER, ease(prog(t, CUE["weighing_word"] + .3, CUE["weighing_word"] + .8)))
    credit(f, "jack_lancaster_1", fade(t, a, b))
    return f

# ================================================================== 15 LEVELING
def leveling(t):
    sid = 15; a, b = S[sid]
    f = blueprint_frame(t, sid)
    tilt = math.radians(lerp(3.2, 0.0, ease_in_out(prog(t, 81.9, 84.3))))
    sc = 12.5; ox = W / 2 - 50 * sc; oy = 520
    layer = Image.new("RGBA", (W, H))
    draw_polys(layer, aircraft_px(side_aircraft(), ox, oy, sc, tilt, 47, 0), CYAN, 3, prog(t, a, a + 1.4))
    gp, wh = side_gear(0.9)
    draw_polys(layer, aircraft_px(gp, ox, oy, sc, tilt, 47, 0), CYAN, 3, prog(t, a + .4, a + 1.6))
    d = ImageDraw.Draw(layer)
    # reference level line (dashed)
    for x in range(160, W - 160, 36): d.line([(x, oy), (x + 20, oy)], fill=GOLD + (230,), width=2)
    # aircraft longitudinal datum line (rotates with aircraft)
    p = aircraft_px([[(-6, 0), (106, 0)]], ox, oy, sc, tilt, 47, 0)[0]
    d.line(p, fill=WHITE + (220,), width=2)
    f.alpha_composite(glow_layer(layer, 9, 1.3))
    text(f, "REFERENCE LEVEL", W - 170, oy + 30, 20, "Bold", GOLD, fade(t, a + .6, b), "rm", tracking=3)
    # angle readout -> 0.0°
    ang = math.degrees(tilt)
    text(f, f"{ang:0.1f}°", 140, 340, 72, "Black", GOLD if ang > 0.05 else CYAN, ease(prog(t, a + .5, a + 1)), "lm", FONT_EN)
    text(f, "PITCH (ILLUSTRATIVE)", 142, 398, 18, "SemiBold", SILVER, ease(prog(t, a + .5, a + 1)), "lm", tracking=2)
    # spirit level vial
    vx, vy = W / 2, 815; vw = 520
    dd = ImageDraw.Draw(f)
    dd.rounded_rectangle([vx - vw / 2, vy - 34, vx + vw / 2, vy + 34], 34, outline=CYAN + (255,), width=3, fill=(10, 40, 60, 230))
    for m in (-40, 40): dd.line([(vx + m, vy - 34), (vx + m, vy + 34)], fill=SILVER + (200,), width=2)
    bx = vx + ang / 3.2 * 200
    dd.ellipse([bx - 34, vy - 22, bx + 34, vy + 22], fill=(GOLD if ang > 0.05 else CYAN) + (230,))
    if ang <= 0.05: chip(f, "LEVEL", vx + vw / 2 + 30, vy, prog(t, 84.3, 84.8), CYAN, 30, "ស្មើ")
    title_block(f, "LEVELING", "កម្រិតយោងដែលក្រុមហ៊ុនផលិតកំណត់", 140, 180, prog(t, CUE["leveling"], CUE["leveling"] + .8), 60, 30)
    return f

# ================================================================== 16 WEIGHING (weight & CG)
def weighing(t):
    sid = 16; a, b = S[sid]
    f = blueprint_frame(t, sid)
    sc = 12.5; gy = 760; ox = W / 2 - 50 * sc; oy = gy - 13.2 * sc - 34
    layer = Image.new("RGBA", (W, H))
    draw_polys(layer, aircraft_px(side_aircraft(), ox, oy, sc), CYAN, 3, prog(t, a, a + 1.4))
    gp, wh = side_gear()
    draw_polys(layer, aircraft_px(gp, ox, oy, sc), CYAN, 3, prog(t, a + .4, a + 1.6))
    d = ImageDraw.Draw(layer)
    scales = []
    for i, (x, y, r) in enumerate(wh):
        wx, wy = ox + x * sc, oy + y * sc
        draw_polys(layer, wheel_shape(wx, wy, r * sc), CYAN, 3, prog(t, a + .6, a + 1.6))
        top = wy + r * sc
        d.rectangle([wx - 70, top, wx + 70, top + 30], outline=GOLD + (255,), width=3)
        scales.append((wx, top))
    d.line([(140, scales[0][1] + 30), (W - 140, scales[0][1] + 30)], fill=SILVER + (200,), width=2)
    # datum line at the nose
    dx = ox - 3 * sc
    for y in range(int(oy - 200), int(gy + 40), 26): d.line([(dx, y), (dx, y + 14)], fill=SILVER + (200,), width=2)
    f.alpha_composite(glow_layer(layer, 9, 1.3))
    text(f, "DATUM", dx, oy - 218, 18, "Bold", SILVER, fade(t, a + .8, b), tracking=3)
    # readouts (symbolic, no invented numbers)
    labels = [("W₁", "NOSE"), ("W₂ + W₃", "MAIN (L + R)")]
    for i, (wx, top) in enumerate(scales):
        k = prog(t, CUE["weighing"] + 1.2 + i * .4, CUE["weighing"] + 1.8 + i * .4)
        bar_h = 60 * ease_out(k)
        dd = ImageDraw.Draw(f)
        dd.rectangle([wx - 50, top + 90, wx + 50, top + 104], outline=GOLD + (int(255 * k),), width=2)
        dd.rectangle([wx - 50, top + 90, wx - 50 + 100 * ease_out(k), top + 104], fill=GOLD + (int(255 * k),))
        text(f, labels[i][0], wx, top + 60, 30, "Bold", GOLD, k, path=FONT_MATH)
        text(f, labels[i][1], wx, top + 128, 16, "Bold", SILVER, k, tracking=2)
        # arms from datum
        ka = prog(t, CUE["cg"] + .2 + i * .3, CUE["cg"] + .8 + i * .3)
        if ka > 0:
            yy = oy - 150 - i * 40
            dd.line([(dx, yy), (lerp(dx, wx, ease_out(ka)), yy)], fill=CYAN + (230,), width=2)
            dd.line([(wx, yy - 10), (wx, yy + 10)], fill=CYAN + (int(230 * ka),), width=2)
            text(f, f"arm {i + 1}", lerp(dx, wx, .5), yy - 18, 16, "SemiBold", CYAN, ka, tracking=1)
    # formulas
    kw = prog(t, CUE["weight_cg"], CUE["weight_cg"] + .6)
    reveal_text(f, "W = W₁ + W₂ + W₃", 140, 160, 42, kw, "Bold", WHITE, "lm", FONT_MATH)
    kg = prog(t, CUE["cg"], CUE["cg"] + .7)
    reveal_text(f, "CG = Σ (W × arm) ÷ W", 140, 232, 42, kg, "Bold", GOLD, "lm", FONT_MATH)
    # CG symbol drops onto the fuselage between the gears
    kc = ease_out(prog(t, CUE["cg"] + 1.4, CUE["cg"] + 2.2))
    if kc > 0:
        cgx = ox + 40 * sc; cgy = lerp(oy - 200, oy, kc)
        dd = ImageDraw.Draw(f); rr = 26
        dd.ellipse([cgx - rr, cgy - rr, cgx + rr, cgy + rr], outline=WHITE + (255,), width=3, fill=(7, 20, 38, 255))
        dd.pieslice([cgx - rr, cgy - rr, cgx + rr, cgy + rr], 0, 90, fill=WHITE + (255,))
        dd.pieslice([cgx - rr, cgy - rr, cgx + rr, cgy + rr], 180, 270, fill=WHITE + (255,))
        chip(f, "CENTER OF GRAVITY", cgx + 50, cgy - 80, prog(t, CUE["cg"] + 2.0, CUE["cg"] + 2.5), GOLD, 26, "ចំណុចទំនាញ (CG)")
    title_block(f, "WEIGHING", "ការថ្លឹងទម្ងន់យន្តហោះ", W - 640, 190, prog(t, CUE["weighing"], CUE["weighing"] + .8), 60, 30, GOLD)
    text(f, "SIMPLIFIED WEIGHT & BALANCE PRINCIPLE", W - 140, 322, 15, "Medium", SILVER, 0.75 * fade(t, a + 1, b), "rm", tracking=2)
    return f

# ================================================================== 17 RECAP
def recap(t):
    sid = 17; a, b = S[sid]
    shots = [("jack_a10_wide", a, 100.0), ("jack_c130", 100.0, 103.4), ("a320_hangar", 103.4, b)]
    f = None
    for i, (name, s0, s1) in enumerate(shots):
        if s0 - 0.5 <= t <= s1 + 0.5:
            im = darken(kenburns(name, t, s0 - .5, s1 + .5, 1.0, 1.1, (.5, .5), (.52 if i % 2 else .48, .5)), 0.5)
            op = ease(prog(t, s0 - .5, s0 + .5)) if i else 1.0
            if f is None: f = im
            else: put(f, im, W / 2, H / 2, op)
            cur = name
    put(f, gradient_mask(W, H, "bottom", 0.9), W / 2, H / 2)
    k = prog(t, 96.7, 97.5)
    text(f, "MORE THAN JUST LIFTING", W / 2, 260, 64, "Black", WHITE, ease(k), "mm", FONT_EN, 3, glow=2)
    km = prog(t, CUE["maint"], CUE["maint"] + .7)
    reveal_text(f, "AIRCRAFT MAINTENANCE", W / 2, 370, 50, km, "ExtraBold", CYAN, "mm", FONT_EN, 6)
    for i, (en, kh, cue, col) in enumerate([("KNOWLEDGE", "ចំណេះដឹង", "knowledge", CYAN), ("PRECISION", "ភាពម៉ត់ចត់", "precision", CYAN),
                                             ("SAFETY", "ការគោរពសុវត្ថិភាព", "safety2", GOLD)]):
        kk = back_out(prog(t, CUE[cue], CUE[cue] + .45))
        if kk <= 0: continue
        x = W / 2 + (i - 1) * 470; y = 560
        card = Image.new("RGBA", (420, 170), (7, 20, 38, 215)); d = ImageDraw.Draw(card)
        d.rectangle([0, 0, 419, 169], outline=col + (255,), width=3)
        put(card, text_img(en, 40, "Black", WHITE, FONT_EN, 3), 210, 60, 1)
        put(card, text_img(kh, 34, "SemiBold", col), 210, 120, 1)
        put(f, card, x, y, clamp(kk), "mm", lerp(.7, 1, clamp(kk)))
    for name, s0, s1 in shots:
        if s0 <= t < s1: credit(f, name)
    return f

# ================================================================== 18 OUTRO (real footage)
_VID = {}
def video_frame(t_src):
    """Frame from the A220 takeoff clip (CC0), decoded once at 30 fps and cached."""
    if "frames" not in _VID:
        src = A("assets/videos/a220_takeoff.webm")
        # 14.2 s .. 21.0 s of the clip: aircraft accelerating along the runway. Crop/zoom toward it.
        cmd = ["ffmpeg", "-v", "error", "-ss", "14.2", "-t", "6.0", "-i", src, "-vf",
               "fps=30,crop=1240:698:300:200,scale=1920:1080:flags=lanczos,eq=saturation=0.85:contrast=1.05",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
        raw = subprocess.run(cmd, capture_output=True).stdout
        n = len(raw) // (W * H * 3)
        _VID["frames"] = np.frombuffer(raw, np.uint8)[: n * W * H * 3].reshape(n, H, W, 3)
    fr = _VID["frames"]; i = min(len(fr) - 1, int(t_src * 30))
    return Image.fromarray(fr[i]).convert("RGBA")

def outro(t):
    sid = 18; a, b = S[sid]
    f = darken(video_frame(t - a), 0.30)
    put(f, gradient_mask(W, H, "bottom", 1.0), W / 2, H / 2)
    # outro lines clear first, then the end slate appears (no overlapping text)
    out_op = 1 - ease(prog(t, 110.05, 110.45))
    k1 = prog(t, CUE["outro"] + 0.1, CUE["outro"] + 0.9)
    if out_op > 0:
        tmp = Image.new("RGBA", (W, H))
        reveal_text(tmp, "សុវត្ថិភាពនៃការហោះហើរ", W / 2, 300, 72, k1, "Bold", WHITE, "mm")
        reveal_text(tmp, "ចាប់ផ្តើមពីការថែទាំដ៏ត្រឹមត្រូវ", W / 2, 400, 72, prog(t, 108.5, 109.3), "Bold", GOLD, "mm")
        text(tmp, "FLIGHT SAFETY STARTS WITH PROPER MAINTENANCE", W / 2, 490, 24, "Bold", CYAN, ease(prog(t, 109.0, 109.6)), tracking=5)
        put(f, tmp, W / 2, H / 2, out_op)
    ke = ease(prog(t, 110.1, 110.6))
    if ke > 0:
        put(f, Image.new("RGBA", (W, H), NAVY + (int(240 * ke),)), W / 2, H / 2)
        ks = ease_out(prog(t, 110.4, 110.85))
        text(f, "AIRCRAFT GENERAL PRACTICES", W / 2, 470, 34, "Bold", CYAN, ks, tracking=8)
        text(f, "JACKING", W / 2, 560, 110, "Black", WHITE, ks, "mm", FONT_EN, 10, scale=lerp(1.08, 1.0, ks))
    credit(f, "a220_takeoff", fade(t, a, b) * (1 - ke))
    return f

RENDERERS = {n: globals()[n] for _, _, _, n in SCENES}
