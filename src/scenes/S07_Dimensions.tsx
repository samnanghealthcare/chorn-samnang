import React from "react";
import { C, F } from "../styles/theme";
import { prog, useT } from "../animations/anim";
import { BlueprintGrid, Fill, HUD, Particles, Vignette } from "../components/Atmos";
import { DimLine, SideView, TopView } from "../components/Aircraft";
import { IllustrativeTag, KineticTitle, TechLabel } from "../components/Type";

/**
 * Overall dimensions of the A320-200 (A320ceo with wingtip fences):
 * length 37.57 m, span 34.10 m, height 11.76 m - Airbus "A320 Aircraft Characteristics -
 * Airport and Maintenance Planning", matching the Commons three-view used in scene 6.
 */
export const S07_Dimensions: React.FC = () => {
  const t = useT();
  const draw = prog(t, 60.0, 1.3);
  return (
    <>
      <Fill />
      <BlueprintGrid o={1} />
      <Particles n={18} seed="dim" />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 5px rgba(56,225,255,0.5))" }}>
        <g transform="translate(150,520) scale(0.86)">
          <TopView draw={draw} stroke="#d9f3ff" sw={2.2} />
          <DimLine x1={-60} y1={-409} x2={-60} y2={409} label="34.10 m" vertical p={prog(t, 62.6, 0.9)} />
          <line x1={-80} y1={-409} x2={405} y2={-409} stroke={C.amber} strokeDasharray="6 6" opacity={prog(t, 62.6, 0.4) * 0.6} />
          <line x1={-80} y1={409} x2={405} y2={409} stroke={C.amber} strokeDasharray="6 6" opacity={prog(t, 62.6, 0.4) * 0.6} />
        </g>
        <g transform="translate(1000,470) scale(0.86)">
          <SideView draw={draw} stroke="#d9f3ff" sw={2.2} />
          <line x1={-80} y1={95} x2={980} y2={95} stroke="rgba(170,215,255,0.6)" strokeWidth={2} opacity={draw} />
          <DimLine x1={0} y1={150} x2={902} y2={150} label="37.57 m" p={prog(t, 60.7, 0.9)} />
          <DimLine x1={-50} y1={95} x2={-50} y2={-187} label="11.76 m" vertical p={prog(t, 63.6, 0.9)} />
          <line x1={-70} y1={-187} x2={72} y2={-187} stroke={C.amber} strokeDasharray="6 6" opacity={prog(t, 63.6, 0.4) * 0.6} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 1010, top: 140, width: 820 }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.cyan, letterSpacing: 8 }}>ATA 06 · OVERALL DIMENSIONS</div>
        <div style={{ display: "flex", gap: 34, marginTop: 18 }}>
          {[
            { at: 60.7, en: "LENGTH", kh: "ប្រវែងតួ" },
            { at: 62.6, en: "WINGSPAN", kh: "ទំហំស្លាប" },
            { at: 63.6, en: "HEIGHT", kh: "កម្ពស់" },
          ].map((d) => {
            const p = prog(t, d.at, 0.5);
            return (
              <div key={d.en} style={{ opacity: 0.2 + 0.8 * p, transform: `translateY(${(1 - p) * 20}px)`, borderLeft: `3px solid ${C.amber}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 34, color: C.white }}>{d.en}</div>
                <div style={{ fontFamily: F.kh, fontSize: 28, color: C.dim }}>{d.kh}</div>
              </div>
            );
          })}
        </div>
      </div>
      <TechLabel at={64.7} x={150 + 0.86 * 700} y={520} dx={120} dy={180} text="FUSELAGE" color={C.cyan} />
      <TechLabel at={65.1} x={150 + 0.86 * 480} y={520 - 0.86 * 260} dx={190} dy={-60} text="WING" color={C.cyan} />
      <TechLabel at={65.5} x={150 + 0.86 * 80} y={520 - 0.86 * 100} dx={-0.01} dy={-150} text="EMPENNAGE" color={C.cyan} />
      <div style={{ position: "absolute", left: 1010, top: 760, width: 820, opacity: prog(t, 64.4, 0.5) }}>
        <KineticTitle text="ទីតាំងរចនាសម្ព័ន្ធសំខាន់ៗ" at={64.4} size={40} font={F.kh} weight={700} align="left" />
      </div>
      <div style={{ position: "absolute", right: 70, top: 116, fontFamily: F.mono, fontSize: 16, color: C.dim, textAlign: "right", opacity: prog(t, 61, 0.6) }}>
        A320-200 (wingtip fences) · Source: Airbus A320 Aircraft Characteristics
      </div>
      <IllustrativeTag text="Illustrative outline · overall dimensions per Airbus" />
      <Vignette strength={0.55} />
      <HUD tag="ATA 06 · DIMENSIONS" sub="LENGTH · SPAN · HEIGHT" />
    </>
  );
};
