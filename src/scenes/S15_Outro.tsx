import React from "react";
import { C, F } from "../styles/theme";
import { prog, useT } from "../animations/anim";
import { Footage } from "../components/Camera";
import { Fill, Gradient, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { KineticTitle } from "../components/Type";

export const S15_Outro: React.FC = () => {
  const t = useT();
  const end = prog(t, 140.3, 0.8);
  const black = prog(t, 141.7, 0.8);
  return (
    <>
      <Footage src="assets/videos/a320_approach.mp4" a={135.3} b={142.5} s0={1.15} s1={1.0} filter="brightness(0.8) contrast(1.05)" />
      <Gradient />
      <Particles n={24} seed="out" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", opacity: 1 - end * 0.85 }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: C.cyan, letterSpacing: 10, opacity: prog(t, 136.2, 0.5) }}>THE FOUNDATION OF</div>
        <KineticTitle text="PROFESSIONAL AIRCRAFT MAINTENANCE" at={136.4} size={70} />
        <KineticTitle text="ការថែទាំយន្តហោះប្រកបដោយវិជ្ជាជីវៈ" at={137.6} size={50} font={F.kh} weight={700} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(4,16,31,${0.75 * end})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 60, opacity: end }}>
        {[["06", "DIMENSIONS AND AREAS", C.cyan], ["20", "STANDARD PRACTICES – AIRFRAME", C.amber]].map(([n, s, c]) => (
          <div key={n} style={{ textAlign: "center", padding: "30px 50px", borderRadius: 18, border: `2px solid ${c}`, background: "rgba(4,16,31,0.7)" }}>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: c, letterSpacing: 8 }}>ATA CHAPTER</div>
            <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 120, color: C.white, lineHeight: 1.05 }}>{n}</div>
            <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 30, color: C.white }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: F.mono, fontSize: 18, color: C.dim, opacity: end, lineHeight: 1.7 }}>
        Media: Wikimedia Commons contributors (CC0 / CC BY / CC BY-SA / Public domain) — full list in assets_sources.txt<br />
        Technical drawings marked “Illustrative” are simplified for education — always refer to the approved maintenance documentation
      </div>
      <LightSweep at={140.3} />
      <Vignette />
      <HUD tag="END OF BRIEFING" sub="ATA 06 · ATA 20" o={1 - black} />
      <Fill c="#000" o={black} />
    </>
  );
};
