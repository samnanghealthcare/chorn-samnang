import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, inOut, prog, useT } from "../animations/anim";
import { KenBurns } from "../components/Camera";
import { BlueprintGrid, Fill, Gradient, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { Credit, KineticTitle } from "../components/Type";

const STEPS = [
  { at: 111.5, en: "PREPARE TOOLS", kh: "រៀបចំឧបករណ៍" },
  { at: 112.9, en: "PERFORM WORK", kh: "អនុវត្តការងារ" },
  { at: 114.2, en: "SAFETY CHECK", kh: "ត្រួតពិនិត្យសុវត្ថិភាព" },
];

const Cycle: React.FC = () => {
  const t = useT();
  const p = prog(t, 115.7, 0.8);
  const rot = (t - 115.7) * 70;
  const node = (x: number, title: string, sub: string, kh: string, color: string, at: number) => {
    const q = prog(t, at, 0.6);
    return (
      <div style={{ position: "absolute", left: x - 190, top: 540 - 190, width: 380, height: 380, borderRadius: 380, opacity: q, transform: `scale(${0.8 + 0.2 * q})`,
        background: "radial-gradient(circle, rgba(18,58,102,0.95), rgba(4,16,31,0.95))", border: `3px solid ${color}`, boxShadow: `0 0 60px ${color}55`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, color, letterSpacing: 6 }}>{title}</div>
        <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 74, color: C.white }}>{sub}</div>
        <div style={{ fontFamily: F.kh, fontSize: 30, color: C.dim }}>{kh}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: p }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960,540) rotate(${rot})`}>
          {[0, 180].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path d="M -330,-60 A 340 340 0 0 1 330,-60" fill="none" stroke={a ? C.amber : C.cyan} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
              <path d="M 330,-60 l -34,-6 M 330,-60 l 6,-34" stroke={a ? C.amber : C.cyan} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
        </g>
      </svg>
      {node(560, "ATA 06", "WHERE", "កន្លែងណា", C.cyan, 115.9)}
      {node(1360, "ATA 20", "HOW", "យ៉ាងដូចម្ដេច", C.amber, 116.3)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center" }}>
        <KineticTitle text="WORKING TOGETHER" at={116.6} size={64} />
        <div style={{ fontFamily: F.kh, fontSize: 36, color: C.dim, opacity: prog(t, 117.2, 0.5) }}>ចំណេះដឹងទាំងពីរ ធ្វើការរួមគ្នា</div>
      </div>
    </div>
  );
};

export const S13_Apply: React.FC = () => {
  const t = useT();
  const bpIn = prog(t, 115.3, 0.6, easeInOut);
  const lineP = prog(t, 111.3, 3.3);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - bpIn }}>
        <KenBurns src="assets/images/technician.jpg" a={107.8} b={116} s0={1.25} s1={1.1} y0={-40} y1={20} pos="center 40%" filter="brightness(0.5) saturate(0.85)" />
        <Gradient />
        <Fill c={C.navy} o={0.3} />
        <div style={{ position: "absolute", left: 120, top: 140 }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, letterSpacing: 8, opacity: prog(t, 108.1, 0.4) }}>THEN</div>
          <KineticTitle text="APPLY ATA CHAPTER 20" at={109.3} size={84} align="left" />
        </div>
        {/* timeline */}
        <div style={{ position: "absolute", left: 160, right: 160, top: 610 }}>
          <div style={{ position: "absolute", left: 40, top: 38, height: 4, width: `${lineP * 90}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.green})`, boxShadow: `0 0 14px ${C.amber}` }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {STEPS.map((s, i) => {
              const p = prog(t, s.at, 0.5);
              return (
                <div key={s.en} style={{ width: 420, opacity: 0.25 + 0.75 * p, transform: `translateY(${(1 - p) * 26}px)` }}>
                  <div style={{ width: 80, height: 80, borderRadius: 80, background: p > 0.5 ? C.amber : "rgba(18,58,102,0.95)", border: `3px solid ${C.amber}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: p > 0.5 ? C.navy : C.white,
                    boxShadow: p > 0.5 ? `0 0 30px ${C.amber}` : undefined }}>{i + 1}</div>
                  <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 40, color: C.white, marginTop: 16, letterSpacing: 2 }}>{s.en}</div>
                  <div style={{ fontFamily: F.kh, fontSize: 30, color: C.dim }}>{s.kh}</div>
                </div>
              );
            })}
          </div>
        </div>
        <Credit text="Photo: U.S. Air Force / Wikimedia Commons (Public domain)" o={inOut(t, 108.4, 115.3)} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: bpIn }}>
        <Fill />
        <BlueprintGrid o={1} />
        <Particles n={24} seed="cy" />
        <Cycle />
      </div>
      <LightSweep at={115.6} />
      <Vignette strength={0.6} />
      <HUD tag="WORKFLOW · ATA 06 + ATA 20" sub="PREPARE ▸ PERFORM ▸ INSPECT" />
    </>
  );
};
