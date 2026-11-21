import React from "react";
import { C, F } from "../styles/theme";
import { prog, useT } from "../animations/anim";
import { Footage } from "../components/Camera";
import { BlueprintGrid, Fill, Gradient, HUD, LightSweep, Vignette } from "../components/Atmos";
import { Credit, KineticTitle } from "../components/Type";

const Book: React.FC<{ p: number }> = ({ p }) => (
  <svg width={260} height={200} viewBox="-130 -100 260 200">
    <g stroke={C.cyan} strokeWidth={4} fill="rgba(56,225,255,0.12)" strokeLinejoin="round">
      <path d={`M 0,-70 C -40,-85 -90,-85 -120,-70 L -120,80 C -90,65 -40,65 0,80 Z`} transform={`scale(${0.6 + 0.4 * p},1)`} />
      <path d={`M 0,-70 C 40,-85 90,-85 120,-70 L 120,80 C 90,65 40,65 0,80 Z`} transform={`scale(${0.6 + 0.4 * p},1)`} />
      {[-40, -10, 20, 50].map((y) => <line key={y} x1={20} y1={y - 20} x2={100 * p} y2={y - 26} strokeWidth={3} opacity={p} />)}
    </g>
  </svg>
);
const Shield: React.FC<{ p: number }> = ({ p }) => (
  <svg width={220} height={240} viewBox="-110 -120 220 240">
    <path d="M 0,-100 L 90,-65 C 90,20 60,80 0,110 C -60,80 -90,20 -90,-65 Z" stroke={C.green} strokeWidth={5} fill="rgba(61,220,151,0.14)" />
    <path d="M -40,0 L -10,32 L 48,-34" stroke={C.green} strokeWidth={12} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

export const S05_Manual: React.FC = () => {
  const t = useT();
  const b = prog(t, 46.8, 0.8);
  const s = prog(t, 48.5, 0.8);
  return (
    <>
      <Footage src="assets/videos/maint_gear.mp4" a={44.35} b={51.1} rate={0.72} s0={1.06} s1={1.18} filter="brightness(0.5) saturate(0.85)" />
      <Gradient />
      <Fill c={C.navy} o={0.3} />
      <BlueprintGrid o={0.2} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, letterSpacing: 10, opacity: prog(t, 45.2, 0.5) }}>MOST IMPORTANT</div>
        <KineticTitle text="ចំណុចសំខាន់បំផុត" at={45.25} size={64} font={F.kh} weight={700} />
      </div>
      <div style={{ position: "absolute", left: 250, top: 400, width: 640, textAlign: "center", opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        <Book p={b} />
        <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 52, color: C.white, letterSpacing: 3, marginTop: 10 }}>MAINTENANCE MANUAL</div>
        <div style={{ fontFamily: F.kh, fontSize: 32, color: C.dim }}>អនុវត្តតាមសៀវភៅណែនាំ</div>
      </div>
      <div style={{ position: "absolute", left: 1030, top: 390, width: 640, textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
        <Shield p={s} />
        <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 52, color: C.white, letterSpacing: 3, marginTop: 6 }}>SAFETY · ALWAYS</div>
        <div style={{ fontFamily: F.kh, fontSize: 32, color: C.dim }}>គោលការណ៍សុវត្ថិភាពជានិច្ច</div>
      </div>
      <div style={{ position: "absolute", left: 958, top: 420, width: 4, height: 300 * Math.min(b, 1), background: "rgba(140,200,255,0.35)" }} />
      <LightSweep at={46.9} />
      <Vignette />
      <HUD tag="ATA 20 · PRINCIPLE" sub="FOLLOW THE MANUAL" />
      <Credit text="Footage: U.S. Air Force / Wikimedia Commons (Public domain)" />
    </>
  );
};
