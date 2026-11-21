"""
EDUCATIONAL VISUALISATION ONLY — NOT AN ENGINEERING-CERTIFIED MODEL.

Illustrative parametric model of a generic high-bypass turbofan for FreeCAD (0.21+ / 1.x).
It is not based on any specific engine type and must not be used for engineering,
maintenance or certification work. All values below are relative, illustrative
proportions (units: mm in the CAD document) chosen for a clear exploded view;
they are NOT published or certified dimensions of any engine.

Run inside FreeCAD:  Macro > Macros... > (select this file) > Execute
or from the FreeCAD Python console:  exec(open('turbofan_educational_freecad.py').read())
"""
import FreeCAD as App
import Part

# ----------------------------------------------------------------- parameters
P = {
    "fan_radius": 1000.0,        # fan tip radius (illustrative)
    "fan_blades": 22,            # number of fan blades
    "fan_chord": 160.0,
    "lpc_stages": 3,             # low-pressure compressor (booster) stages
    "lpc_radius": 560.0,
    "hpc_stages": 9,             # high-pressure compressor stages
    "hpc_r_in": 470.0,           # first HPC stage radius
    "hpc_r_out": 320.0,          # last HPC stage radius
    "stage_len": 90.0,           # axial length per compressor/turbine stage
    "comb_len": 450.0,           # combustion chamber length
    "comb_r_out": 430.0,
    "comb_r_in": 250.0,
    "hpt_stages": 2,
    "hpt_radius": 380.0,
    "lpt_stages": 5,
    "lpt_r_in": 440.0,
    "lpt_r_out": 560.0,
    "shaft_radius": 45.0,
    "explode": 1.0,              # 0 = assembled, 1 = exploded along the X axis
    "explode_gap": 350.0,        # axial gap between modules when exploded
}

doc = App.newDocument("Turbofan_Educational")


def disc(radius, length, x, hub=0.25):
    """a bladed stage simplified as a thin disc with a hub hole"""
    outer = Part.makeCylinder(radius, length, App.Vector(x, 0, 0), App.Vector(1, 0, 0))
    inner = Part.makeCylinder(radius * hub, length, App.Vector(x, 0, 0), App.Vector(1, 0, 0))
    return outer.cut(inner)


def group(name, shapes, offset_x):
    """put shapes in their own group and shift the group for the exploded view"""
    grp = doc.addObject("App::DocumentObjectGroup", name)
    for i, s in enumerate(shapes):
        s.translate(App.Vector(offset_x, 0, 0))
        obj = doc.addObject("Part::Feature", f"{name}_{i:02d}")
        obj.Shape = s
        grp.addObject(obj)
    return grp


x = 0.0
gap = P["explode_gap"] * P["explode"]
module_index = 0

# 1. FAN (simplified blades as thin boxes around a hub + spinner)
fan = [Part.makeCylinder(P["fan_radius"] * 0.28, P["fan_chord"], App.Vector(x, 0, 0), App.Vector(1, 0, 0))]
for b in range(P["fan_blades"]):
    blade = Part.makeBox(P["fan_chord"], 18.0, P["fan_radius"] * 0.72, App.Vector(x, -9.0, P["fan_radius"] * 0.28))
    blade.rotate(App.Vector(x, 0, 0), App.Vector(1, 0, 0), 360.0 * b / P["fan_blades"])
    fan.append(blade)
fan.append(Part.makeCone(P["fan_radius"] * 0.28, 0, 300.0, App.Vector(x, 0, 0), App.Vector(-1, 0, 0)))
group("FAN", fan, -gap * 2.0)
x += P["fan_chord"] + 120.0

# 2. LOW-PRESSURE COMPRESSOR (booster)
lpc = []
for s in range(P["lpc_stages"]):
    lpc.append(disc(P["lpc_radius"], P["stage_len"] * 0.6, x))
    x += P["stage_len"]
group("LOW_PRESSURE_COMPRESSOR", lpc, -gap * 1.0)

# 3. HIGH-PRESSURE COMPRESSOR (radius tapers stage by stage)
hpc = []
for s in range(P["hpc_stages"]):
    t = s / max(1, P["hpc_stages"] - 1)
    r = P["hpc_r_in"] + (P["hpc_r_out"] - P["hpc_r_in"]) * t
    hpc.append(disc(r, P["stage_len"] * 0.6, x))
    x += P["stage_len"]
group("HIGH_PRESSURE_COMPRESSOR", hpc, 0.0)

# 4. COMBUSTION CHAMBER (annular)
cc_outer = Part.makeCylinder(P["comb_r_out"], P["comb_len"], App.Vector(x, 0, 0), App.Vector(1, 0, 0))
cc_inner = Part.makeCylinder(P["comb_r_in"], P["comb_len"], App.Vector(x, 0, 0), App.Vector(1, 0, 0))
group("COMBUSTION_CHAMBER", [cc_outer.cut(cc_inner)], gap * 1.0)
x += P["comb_len"] + 40.0

# 5. HIGH-PRESSURE TURBINE
hpt = []
for s in range(P["hpt_stages"]):
    hpt.append(disc(P["hpt_radius"], P["stage_len"] * 0.6, x))
    x += P["stage_len"]
group("HIGH_PRESSURE_TURBINE", hpt, gap * 2.0)

# 6. LOW-PRESSURE TURBINE (radius grows stage by stage)
lpt = []
for s in range(P["lpt_stages"]):
    t = s / max(1, P["lpt_stages"] - 1)
    r = P["lpt_r_in"] + (P["lpt_r_out"] - P["lpt_r_in"]) * t
    lpt.append(disc(r, P["stage_len"] * 0.6, x))
    x += P["stage_len"]
group("LOW_PRESSURE_TURBINE", lpt, gap * 3.0)

# 7. SHAFT (spans the whole engine; stays on the axis)
shaft = Part.makeCylinder(P["shaft_radius"], x + 400.0, App.Vector(-200.0, 0, 0), App.Vector(1, 0, 0))
group("SHAFT", [shaft], 0.0)

# 8. OUTER CASING / NACELLE (thin shell; lifted away when exploded)
case_len = x + 200.0
outer = Part.makeCylinder(P["fan_radius"] * 1.06, case_len, App.Vector(-100.0, 0, 0), App.Vector(1, 0, 0))
inner = Part.makeCylinder(P["fan_radius"] * 1.02, case_len, App.Vector(-100.0, 0, 0), App.Vector(1, 0, 0))
casing = outer.cut(inner)
casing.translate(App.Vector(0, 0, P["fan_radius"] * 1.6 * P["explode"]))
obj = doc.addObject("Part::Feature", "OUTER_CASING")
obj.Shape = casing

doc.recompute()
try:
    import FreeCADGui as Gui
    Gui.SendMsgToActiveView("ViewFit")
    Gui.activeDocument().activeView().viewIsometric()
except Exception:
    pass
print("Educational turbofan illustration created (not an engineering model).")
