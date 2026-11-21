"""Generate storyboard.txt from the same timings the renderer uses (config.py)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import *

# per scene: main visual | background | technical illustration | text animation | camera | SFX | transition
NOTES = {
 1: ("Hook question over a real A320 in a maintenance hangar", "Photo a320_hangar (FlightReal, CC BY 2.0)", "-",
     "Mask-wipe Khmer headline in 2 lines (white / gold); rising chevrons toward the gear", "Slow pull-out 1.18x -> 1.02x", "Music fade-in", "Cut-in from black"),
 2: ("'What can hold this weight?'", "Blueprint grid (navy #071426, cyan lines)", "Side-view blueprint of a generic narrow-body, draw-on; WEIGHT arrow; '?' under each wheel",
     "WEIGHT / ទម្ងន់ slide; '?' pop", "Grid drift", "Pencil draw, impact on arrow, 2 pops, riser", "Dissolve 0.4 s + whoosh"),
 3: ("Title reveal: JACKING", "Blueprint grid dimmed", "-", "Scale-in title + cyan light sweep; Khmer + 'ATA 07 · LIFTING & SHORING'", "Static", "Big impact on the spoken word 'Jacking'", "Dissolve + whoosh"),
 4: ("What an Aircraft Jack is", "Photo jack_lancaster_2 (tripod jacks under a wing, UK MOD, OGL)", "Exploded view of a generic tripod jack (pad, screw & lock nut, ram, cylinder, legs) collapsing into assembly",
     "Part labels with leader lines; AIRCRAFT JACK chip exactly at 16.17 s", "Ken Burns on photo; parts slide together", "Pencil draw, mechanical clunk, beep on label", "Dissolve + whoosh"),
 5: ("Jacks lift the aircraft; wheels leave the ground", "Blueprint grid", "Side view: jacks extend, oleo struts extend first, then wheels lift; CLEARANCE dimension",
     "LANDING GEAR WHEELS chip at 19.44 s; 'WHEELS OFF THE GROUND'; INSPECTION / MAINTENANCE chips", "Static camera, animated geometry", "Hydraulic pump x2, beep", "Dissolve + whoosh"),
 6: ("'Why lift the aircraft?'", "Photo jack_c130 (C-130J on jacks, USAF, PD)", "-", "WHY? back-out scale; Khmer question", "Slow push-in", "Impact", "Dissolve + whoosh"),
 7: ("Four maintenance tasks", "Photo jack_a10_operator, darkened", "Line icons: gear, wheel, brake disc, retraction arc (draw-on)",
     "2x2 cards slide up as each task is spoken; active card highlighted gold", "Slow push", "Click per card", "Dissolve + whoosh"),
 8: ("Jacking points: nose + left/right wing", "Blueprint grid", "Plan-view blueprint (illustrative), station ticks; pulsing gold points; '3 POINTS' counter",
     "JACKING POINTS title at 43.36 s; FWD/LEFT/RIGHT chips as spoken", "Slow zoom 1.0 -> 1.06", "Pencil draw, click, pop per point", "Dissolve + whoosh"),
 9: ("Points are designed to take the load", "Blueprint + photo jack_p3_operator (US Navy, PD)", "Cross-section: airframe, jacking pad, jack head rising; LOAD (red) and SUPPORT (gold) arrows",
     "DESIGNED TO TAKE THE LOAD chip", "Ken Burns on photo", "Draw, hydraulic, impact, beep", "Dissolve + whoosh"),
 10: ("Not just 'place jack -> lift'", "Photo jack_f16_team (USAF, PD)", "-", "Kinetic strike-through in red, then PREPARE FIRST wipe in gold", "Pull-out", "Click on strike, impact", "Dissolve + whoosh"),
 11: ("Pre-jacking checks", "Blueprint + photo jack_e2c_lifted (US Navy, PD)", "Icons: weight, jack, wind, ground",
     "Rows slide in on each spoken item (61.4 / 62.8 / 64.45 / 65.6 s) and tick", "Ken Burns on photo", "Digital beep per tick", "Dissolve + whoosh"),
 12: ("Wheel chocks + equipment check", "Blueprint + photo jack_loadtest (12-ton jack load test, US Navy, PD)", "Wheel with two chocks sliding in",
     "WHEEL CHOCKS chip at 68.43 s; EQUIPMENT CHECK at 69.7 s", "Photo slides in", "Mechanical clunk, click", "Dissolve + whoosh"),
 13: ("Safety is priority #1", "Photo jack_maintaining ('ACFT ON JACKS' cone, USAF, PD)", "Hazard stripe bar", "សុវត្ថិភាព impact; PRIORITY #1 wipe", "Push-in on cone", "Impact + click", "Dissolve + whoosh"),
 14: ("Introduce Leveling & Weighing", "Photo jack_lancaster_1 (Lancaster on jacks, UK MOD, OGL)", "-", "Two words pop in as spoken", "Slow push", "Pop x2", "Dissolve + whoosh"),
 15: ("Leveling to the manufacturer's reference", "Blueprint grid", "Side view rotates from 3.2° to 0.0°; dashed reference line; spirit-level vial (bubble centres)",
     "Angle read-out counts to 0.0°; LEVEL chip", "Static", "Pencil draw, beep at level", "Dissolve + whoosh"),
 16: ("Weighing -> Weight and Center of Gravity", "Blueprint grid", "Aircraft on nose + main scales; datum line; arms; CG symbol drops in",
     "Formulas W = W₁+W₂+W₃ and CG = Σ(W×arm)÷W wipe in as spoken (symbolic, no invented numbers)", "Static", "Draw, clicks, pop on CG", "Dissolve + whoosh"),
 17: ("Recap: knowledge, precision, safety", "Photo montage: jack_a10_wide -> jack_c130 -> a320_hangar", "-",
     "MORE THAN JUST LIFTING; AIRCRAFT MAINTENANCE; three value cards pop on each spoken word", "Ken Burns + cross-dissolves", "Pops + impact, riser", "Dissolve + whoosh"),
 18: ("Closing line over real takeoff footage", "Video: Swiss Airbus A220-100 takeoff, London City (TheFrog001, CC0)", "-",
     "Two Khmer lines wipe in; English tagline; end slate 'AIRCRAFT GENERAL PRACTICES · JACKING'", "Cropped zoom on the moving aircraft", "Whoosh, music resolves", "Fade to navy end slate"),
}

def main():
    out = []
    out.append("STORYBOARD — AIRCRAFT GENERAL PRACTICES: JACKING  (Khmer narration, 1920x1080, 30 fps)")
    out.append(f"Audio: original narration ({DURATION:.2f} s). All times measured from the audio, not estimated.")
    out.append("Music (all scenes): original synthesised cinematic-ambient score in D minor (i-VI-III-VII), "
               "sidechain-ducked ~20 dB under the voice, rising in pauses.")
    out.append("Captions: Khmer subtitles for every narrated line (lower third), timed to the sentence boundaries.")
    out.append("=" * 100)
    for sid, a, b, name in SCENES:
        mv, bg, ill, txt, cam, sfx, tr = NOTES[sid]
        vo = [s for (ca, cb, s) in CAPTIONS if ca < b and cb > a and (min(cb, b) - max(ca, a)) > 0.4]
        out.append(f"SCENE {sid:02d}  [{a:6.2f} s -> {b:6.2f} s]  ({b - a:4.2f} s)  renderer: {name}")
        out.append(f"  Voice-over       : " + ("\n                     ".join(vo) if vo else "-"))
        out.append(f"  Main visual      : {mv}")
        out.append(f"  Background       : {bg}")
        out.append(f"  Technical illus. : {ill}")
        out.append(f"  Text animation   : {txt}")
        out.append(f"  Camera           : {cam}")
        out.append(f"  Sound effects    : {sfx}")
        out.append(f"  Background music : score continues (ducked under voice)")
        out.append(f"  Transition out   : {tr}")
        out.append("-" * 100)
    out.append("KEYWORD CUES (s): " + ", ".join(f"{k}={v}" for k, v in CUE.items()))
    open(A("storyboard.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("storyboard.txt written")

if __name__ == "__main__":
    main()
