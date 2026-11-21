import React from "react";
import { C, F } from "../styles/theme";
import { inOut, prog, useT } from "../animations/anim";
import { Footage } from "../components/Camera";
import { BlueprintGrid, Fill, Gradient, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { Credit, KineticTitle } from "../components/Type";

const Word: React.FC<{ at: number; en: string; kh: string; color: string; x: number }> = ({ at, en, kh, color, x }) => {
  const t = useT();
  const p = prog(t, at, 0.6);
  return (
    <div style={{ position: "absolute", left: x, top: 330, width: 520, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})` }}>
      <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 108, color, letterSpacing: 4, textShadow: `0 0 40px ${color}88` }}>{en}</div>
      <div style={{ height: 4, width: 300 * prog(t, at + 0.2, 0.6), background: color, margin: "6px auto 14px" }} />
      <div style={{ fontFamily: F.kh, fontWeight: 700, fontSize: 46, color: C.white }}>{kh}</div>
    </div>
  );
};

export const S01_Hook: React.FC = () => {
  const t = useT();
  const strike = prog(t, 5.0, 0.5);
  return (
    <>
      <Fill />
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, 1.5, 1.0) }}>
        <Footage src="assets/videos/a320_gate.mp4" a={1.5} b={12.1} s0={1.25} s1={1.05} x0={-60} x1={40} filter="saturate(0.85) contrast(1.08) brightness(0.8)" />
        <Gradient />
        <Fill c={C.navy} o={0.25 + 0.3 * prog(t, 6.0, 0.8)} />
      </div>
      <BlueprintGrid o={0.25} />
      <Particles n={36} seed="hook" />
      {/* 0.3 s - the question */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: inOut(t, 0.25, 1.9, 0.3, 0.4) }}>
        <div style={{ fontFamily: F.mono, fontSize: 30, color: C.cyan, letterSpacing: 14, marginBottom: 10 }}>DID YOU KNOW?</div>
        <KineticTitle text="តើអ្នកដឹងទេ?" at={0.3} size={120} font={F.kh} weight={700} />
      </div>
      {/* 1.7 s - maintenance is not only repair */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: inOut(t, 2.0, 6.2, 0.5, 0.5) }}>
        <div style={{ fontFamily: F.mono, fontSize: 28, color: C.cyan, letterSpacing: 10 }}>AIRCRAFT MAINTENANCE</div>
        <div style={{ position: "relative", display: "inline-block", marginTop: 14 }}>
          <KineticTitle text="NOT ONLY “HOW TO REPAIR”" at={3.4} size={88} />
          <div style={{ position: "absolute", left: 0, top: "48%", height: 8, width: `${strike * 100}%`, background: C.red, boxShadow: `0 0 16px ${C.red}` }} />
        </div>
      </div>
      {/* 6.1 s - where / how / safely */}
      <Word at={7.3} en="WHERE?" kh="នៅកន្លែងណា?" color={C.cyan} x={120} />
      <Word at={8.9} en="HOW?" kh="ធ្វើយ៉ាងដូចម្ដេច?" color={C.amber} x={700} />
      <Word at={10.1} en="SAFELY" kh="សុវត្ថិភាព" color={C.green} x={1280} />
      <LightSweep at={7.2} />
      <Vignette />
      <HUD tag="AVIATION MAINTENANCE // BRIEFING" sub="A320 FAMILY" o={prog(t, 1.8, 0.8)} />
      <Credit text="Footage: Wikimedia Commons (CC0)" o={prog(t, 2, 1) * 0.9} />
    </>
  );
};
