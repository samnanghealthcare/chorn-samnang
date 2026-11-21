import React from "react";
import { C, F } from "../styles/theme";
import { inOut, prog, useT } from "../animations/anim";
import { BlueprintGrid, Fill, HUD, Vignette } from "../components/Atmos";
import { SideView, TopView } from "../components/Aircraft";
import { IllustrativeTag, KineticTitle } from "../components/Type";

const Ref: React.FC<{ at: number; en: string; ab: string; kh: string; color: string; x: number }> = ({ at, en, ab, kh, color, x }) => {
  const t = useT();
  const p = prog(t, at, 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: 735, width: 520, opacity: 0.25 + 0.75 * p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 44, color }}>{ab}</span>
        <span style={{ fontFamily: F.en, fontWeight: 800, fontSize: 30, color: C.white }}>{en}</span>
      </div>
      <div style={{ fontFamily: F.kh, fontSize: 26, color: C.dim }}>{kh}</div>
    </div>
  );
};

export const S10_Stations: React.FC = () => {
  const t = useT();
  const fs = prog(t, 82.6, 2.4);
  const fsHi = inOut(t, 86.8, 90.4, 0.4, 0.4);
  const bl = prog(t, 87.9, 0.8);
  const wl = prog(t, 88.8, 0.8);
  const FSX = new Array(13).fill(0).map((_, i) => 20 + i * 72);
  return (
    <>
      <Fill />
      <BlueprintGrid o={1} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 5px rgba(56,225,255,0.45))" }}>
        {/* Side view: FS (vertical) and WL (horizontal) reference lines */}
        <g transform="translate(110,500)">
          {FSX.map((x, i) => (
            <line key={x} x1={x} y1={-220} x2={x} y2={120} stroke={fsHi > 0 ? C.cyan : "rgba(140,200,255,0.55)"} strokeWidth={fsHi > 0 ? 2.5 : 1.5}
              opacity={prog(t, 82.6 + i * 0.16, 0.3)} strokeDasharray="8 6" />
          ))}
          <g opacity={fs}>
            <line x1={-30} y1={150} x2={950} y2={150} stroke={C.cyan} strokeWidth={3} />
            <path d="M 950,150 l -18,-10 M 950,150 l -18,10" stroke={C.cyan} strokeWidth={3} />
            <text x={960} y={158} fill={C.cyan} fontFamily="JetBrains Mono" fontSize={30} fontWeight={700}>FS</text>
          </g>
          {[-160, -110, -60, -10, 40, 90].map((y, i) => (
            <line key={y} x1={-30} y1={y} x2={940} y2={y} stroke={C.amber} strokeWidth={2} strokeDasharray="4 6" opacity={wl * (0.4 + 0.1 * i)} />
          ))}
          <g opacity={wl}>
            <line x1={-40} y1={110} x2={-40} y2={-220} stroke={C.amber} strokeWidth={3} />
            <path d="M -40,-220 l -10,18 M -40,-220 l 10,18" stroke={C.amber} strokeWidth={3} />
            <text x={-58} y={-236} fill={C.amber} fontFamily="JetBrains Mono" fontSize={30} fontWeight={700}>WL</text>
          </g>
          <SideView stroke="#e6f6ff" sw={2.4} />
        </g>
        {/* Top view: BL lines parallel to the centreline */}
        <g transform="translate(1180,470) scale(0.6)">
          {[-300, -200, -100, 100, 200, 300].map((y) => (
            <line key={y} x1={-40} y1={y} x2={960} y2={y} stroke={C.green} strokeWidth={3} strokeDasharray="10 8" opacity={bl * 0.8} />
          ))}
          <line x1={-60} y1={0} x2={980} y2={0} stroke={C.green} strokeWidth={5} opacity={bl} />
          <TopView stroke="#e6f6ff" sw={3} />
          <text x={-40} y={-30} fill={C.green} fontFamily="JetBrains Mono" fontSize={44} fontWeight={700} opacity={bl}>BL 0 · CENTERLINE</text>
          <path d="M 960,-300 L 960,300" stroke={C.green} strokeWidth={4} opacity={bl} />
          <path d="M 960,-300 l -12,20 M 960,-300 l 12,20 M 960,300 l -12,-20 M 960,300 l 12,-20" stroke={C.green} strokeWidth={4} opacity={bl} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 110, top: 110 }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.cyan, letterSpacing: 6 }}>REFERENCE LINES</div>
        <KineticTitle text="STATIONS" at={82.3} size={80} align="left" />
      </div>
      <Ref at={86.8} ab="FS" en="FUSELAGE STATION" kh="ទីតាំងតាមបណ្តោយតួ (មុខ–ក្រោយ)" color={C.cyan} x={110} />
      <Ref at={87.9} ab="BL" en="BUTTOCK LINE" kh="ទីតាំងឆ្វេង–ស្តាំ ពីបន្ទាត់កណ្តាល" color={C.green} x={720} />
      <Ref at={88.8} ab="WL" en="WATER LINE" kh="ទីតាំងតាមកម្ពស់ (លើ–ក្រោម)" color={C.amber} x={1330} />
      <IllustrativeTag text="Illustrative · no station values shown" />
      <Vignette strength={0.5} />
      <HUD tag="ATA 06 · STATIONS" sub="FS · BL · WL" />
    </>
  );
};
