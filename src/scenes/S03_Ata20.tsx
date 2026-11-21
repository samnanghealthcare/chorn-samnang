import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, lerp, prog, useT } from "../animations/anim";
import { Footage } from "../components/Camera";
import { BlueprintGrid, Fill, Gradient, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { ChapterBadge, Credit, KineticTitle } from "../components/Type";

export const S03_Ata20: React.FC = () => {
  const t = useT();
  const move = prog(t, 31.2, 0.9, easeInOut);
  return (
    <>
      <Footage src="assets/videos/maint_hands.mp4" a={26} b={35.7} rate={0.47} s0={1.08} s1={1.22} x0={30} x1={-30} filter="brightness(0.55) saturate(0.8) contrast(1.1)" />
      <Gradient />
      <Fill c={C.navy} o={0.35} />
      <BlueprintGrid o={0.25} />
      <Particles n={26} seed="a20" color="rgba(255,200,120,0.6)" />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${lerp(0, -520, move)}px, ${lerp(0, -40, move)}px) scale(${lerp(1, 0.72, move)})` }}>
        <ChapterBadge at={27.4} num={20} title="STANDARD PRACTICES – AIRFRAME" sub="ស្តង់ដារការអនុវត្តការងារ" accent={C.amber} y={500} />
      </div>
      <div style={{ position: "absolute", left: 960, top: 330, width: 860, opacity: prog(t, 31.5, 0.6) }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, letterSpacing: 8, marginBottom: 12 }}>WHAT IT COVERS</div>
        <KineticTitle text="វាជាគោលការណ៍ និងវិធីសាស្ត្រ" at={31.6} size={60} font={F.kh} weight={700} align="left" />
        <div style={{ height: 3, width: 600 * prog(t, 32.4, 0.8), background: C.amber, margin: "8px 0 18px" }} />
        <KineticTitle text="GENERAL MAINTENANCE PRACTICES" at={33.0} size={44} align="left" color={C.white} weight={800} />
      </div>
      <LightSweep at={27.6} />
      <Vignette />
      <HUD tag="CHAPTER 20" sub="STANDARD PRACTICES – AIRFRAME" />
      <Credit text="Footage: U.S. Air Force / Wikimedia Commons (Public domain)" />
    </>
  );
};
