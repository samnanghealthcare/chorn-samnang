import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../styles/theme";
import { easeInOut, inOut, prog, useT } from "../animations/anim";
import { KenBurns } from "../components/Camera";
import { BlueprintGrid, Fill, Gradient, HUD, LightSweep, ScanLine, Vignette } from "../components/Atmos";
import { Turbofan } from "../components/Engine";
import { Credit, IllustrativeTag, TechLabel } from "../components/Type";

const Chip: React.FC<{ at: number; en: string; kh: string; x: number; color?: string }> = ({ at, en, kh, x, color = C.cyan }) => {
  const t = useT();
  const p = prog(t, at, 0.5);
  return (
    <div style={{ position: "absolute", top: 120, left: x, opacity: p, transform: `translateY(${(1 - p) * -20}px)`, padding: "10px 20px", borderRadius: 10,
      border: `1.5px solid ${color}`, background: "rgba(4,16,31,0.8)" }}>
      <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: 2 }}>{en}</div>
      <div style={{ fontFamily: F.kh, fontSize: 24, color: C.dim }}>{kh}</div>
    </div>
  );
};

export const S08_Drawings: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const xr = prog(t, 69.3, 0.9, easeInOut);
  const explode = prog(t, 72.4, 1.2, easeInOut);
  const ox = 450, oy = 560;
  const lbl = (at: number) => ({ at, out: 72.45 });
  return (
    <>
      <Fill />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - xr }}>
        <KenBurns src="assets/engine/v2500_on_a320.jpg" a={66.4} b={70.2} s0={1.05} s1={1.25} x0={0} x1={-80} filter="brightness(0.75) saturate(0.9)" />
        <Gradient />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: xr }}>
        <BlueprintGrid o={1} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${ox},${oy}) scale(0.98)`}>
            <Turbofan spin={frame * 0.09} explode={explode} xray={1} />
          </g>
        </svg>
        <TechLabel {...lbl(70.2)} x={ox + 95} y={oy - 150} dx={-150} dy={-70} text="FAN" />
        <TechLabel {...lbl(70.6)} x={ox + 330} y={oy - 70} dx={-60} dy={-210} text="COMPRESSOR" />
        <TechLabel {...lbl(71.0)} x={ox + 540} y={oy - 85} dx={60} dy={-200} text="COMBUSTION CHAMBER" color={C.amber} />
        <TechLabel {...lbl(71.4)} x={ox + 720} y={oy - 110} dx={120} dy={-140} text="TURBINE" />
        <TechLabel {...lbl(71.8)} x={ox + 930} y={oy + 20} dx={70} dy={120} text="EXHAUST" />
        <TechLabel {...lbl(71.6)} x={ox + 300} y={oy} dx={-60} dy={250} text="SHAFT" />
        <div style={{ position: "absolute", left: 70, bottom: 230, width: 330, height: 220, borderRadius: 12, overflow: "hidden", border: `1.5px solid ${C.cyan}`, opacity: inOut(t, 70.0, 74.9, 0.5, 0.4) }}>
          <KenBurns src="assets/engine/v2500_cutaway.jpg" a={70} b={75} s0={1.1} s1={1.3} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "4px 10px", background: "rgba(4,16,31,0.8)", fontFamily: F.mono, fontSize: 15, color: C.white }}>REAL CUTAWAY · IAE V2500</div>
        </div>
        <div style={{ position: "absolute", right: 90, top: 250, fontFamily: F.mono, fontSize: 26, color: C.amber, letterSpacing: 4, opacity: prog(t, 72.6, 0.5) }}>EXPLODED VIEW · COMPONENT LOCATION</div>
        <IllustrativeTag text="Illustrative Visualization · generic turbofan, not to scale" />
      </div>
      <ScanLine at={69.3} dur={1.2} />
      <Chip at={67.8} en="TECHNICAL DRAWING" kh="គំនូរបច្ចេកទេស" x={120} />
      <Chip at={69.9} en="DIAGRAM" kh="ដ្យាក្រាម" x={560} />
      <Chip at={71.1} en="WORK AREA" kh="តំបន់ការងារ" x={870} color={C.amber} />
      <Chip at={72.5} en="COMPONENT LOCATION" kh="ទីតាំងគ្រឿងបន្លាស់" x={1230} color={C.amber} />
      <LightSweep at={69.4} />
      <Vignette strength={0.55} />
      <HUD tag="ATA 06 · LOCATE" sub="DRAWINGS & DIAGRAMS" />
      <Credit text="Photos: O. Cleynen (CC BY 4.0), Morio (CC BY-SA 3.0) / Wikimedia Commons" o={1 - xr * 0.3} />
    </>
  );
};
