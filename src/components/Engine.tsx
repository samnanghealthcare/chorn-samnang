/**
 * Generic two-spool high-bypass turbofan, X-ray / exploded educational visualization.
 * Illustrative only - not to scale and not the engineering geometry of any specific engine model.
 */
import React from "react";
import { C } from "../styles/theme";

const stage = (x: number, r0: number, r1: number, color: string, w = 7) => (
  <g key={x}>
    <rect x={x - w / 2} y={-r1} width={w} height={r1 - r0} rx={2} fill={color} opacity={0.85} />
    <rect x={x - w / 2} y={r0} width={w} height={r1 - r0} rx={2} fill={color} opacity={0.85} />
  </g>
);

export const Turbofan: React.FC<{ spin: number; explode: number; xray: number; glow?: number }> = ({ spin, explode, xray, glow = 1 }) => {
  const cy = C.cyan;
  const off = (k: number) => explode * k;
  // fan disc seen in 3/4 perspective (ellipse) - rotating blades
  const blades = new Array(22).fill(0).map((_, i) => {
    const a = spin + (i / 22) * Math.PI * 2;
    const x = Math.sin(a) * 26, y = Math.cos(a) * 205;
    const xi = Math.sin(a) * 6, yi = Math.cos(a) * 40;
    const front = Math.cos(a - Math.PI / 2) > 0;
    return <line key={i} x1={xi} y1={yi} x2={x} y2={y} stroke={cy} strokeWidth={front ? 5 : 3} opacity={front ? 0.95 : 0.35} strokeLinecap="round" />;
  });
  return (
    <g style={{ filter: `drop-shadow(0 0 ${8 * glow}px rgba(56,225,255,0.65))` }}>
      {/* nacelle (semi-transparent casing) */}
      <g transform={`translate(0, ${-off(70)})`} opacity={1 - explode * 0.7}>
        <path d="M -30,-235 C 60,-250 500,-240 640,-205 L 640,-188 C 500,-215 80,-222 -10,-212 Z" fill={`rgba(140,200,255,${0.18 * xray})`} stroke="rgba(170,215,255,0.9)" strokeWidth={2} />
      </g>
      <g transform={`translate(0, ${off(70)})`} opacity={1 - explode * 0.7}>
        <path d="M -30,235 C 60,250 500,240 640,205 L 640,188 C 500,215 80,222 -10,212 Z" fill={`rgba(140,200,255,${0.18 * xray})`} stroke="rgba(170,215,255,0.9)" strokeWidth={2} />
      </g>
      {/* spinner + fan */}
      <g transform={`translate(${-off(160)},0)`}>
        <path d="M 40,-40 C 0,-36 -20,-10 -24,0 C -20,10 0,36 40,40 Z" fill="rgba(200,230,255,0.25)" stroke={cy} strokeWidth={2} />
        <g transform="translate(95,0)">
          <ellipse cx={0} cy={0} rx={28} ry={208} fill="none" stroke="rgba(170,215,255,0.5)" strokeWidth={1.5} />
          {blades}
        </g>
      </g>
      {/* core casing */}
      <g opacity={1 - explode * 0.4}>
        <path d="M 140,-132 C 300,-128 470,-112 600,-112 C 700,-114 790,-150 850,-162 L 850,162 C 790,150 700,114 600,112 C 470,112 300,128 140,132 Z"
          fill={`rgba(60,140,220,${0.14 * xray})`} stroke="rgba(170,215,255,0.65)" strokeWidth={1.5} strokeDasharray="10 6" />
      </g>
      {/* LP compressor (booster) */}
      <g transform={`translate(${-off(90)},0)`}>{[160, 185, 210, 235].map((x) => stage(x, 38, 118, cy))}</g>
      {/* HP compressor */}
      <g transform={`translate(${-off(30)},0)`}>{new Array(10).fill(0).map((_, i) => stage(270 + i * 21, 40, 100 - i * 4.2, cy, 6))}</g>
      {/* combustion chamber */}
      <g transform={`translate(${off(40)},0)`}>
        {[-1, 1].map((s) => (
          <path key={s} d={`M 495,${s * 62} C 520,${s * 50} 575,${s * 52} 590,${s * 66} L 590,${s * 104} C 560,${s * 112} 520,${s * 112} 495,${s * 100} Z`}
            fill="rgba(255,150,60,0.55)" stroke={C.amber} strokeWidth={2} style={{ filter: `drop-shadow(0 0 ${14 * glow}px rgba(255,150,60,0.9))` }} />
        ))}
      </g>
      {/* HP turbine */}
      <g transform={`translate(${off(110)},0)`}>{[612, 640].map((x) => stage(x, 48, 104, "#ffd27a", 8))}</g>
      {/* LP turbine */}
      <g transform={`translate(${off(180)},0)`}>{new Array(5).fill(0).map((_, i) => stage(690 + i * 30, 52, 112 + i * 10, "#9fe8ff", 8))}</g>
      {/* exhaust cone + nozzle */}
      <g transform={`translate(${off(260)},0)`}>
        <path d="M 850,-58 L 990,0 L 850,58 Z" fill="rgba(200,230,255,0.18)" stroke={cy} strokeWidth={2} />
        <path d="M 850,-165 L 960,-140 M 850,165 L 960,140" stroke="rgba(170,215,255,0.8)" strokeWidth={2} />
      </g>
      {/* shaft */}
      <line x1={40} y1={0} x2={860} y2={0} stroke="rgba(255,255,255,0.9)" strokeWidth={5} opacity={1 - explode * 0.6} />
      <line x1={40} y1={0} x2={860} y2={0} stroke={cy} strokeWidth={10} opacity={0.25 * (1 - explode)} />
    </g>
  );
};

/** Hex bolt + nut tightened by a click-type torque wrench (top view). */
export const TorqueWrench: React.FC<{ turn: number; click: number }> = ({ turn, click }) => {
  const ang = -38 + turn * 52;
  const hex = (r: number) => new Array(6).fill(0).map((_, i) => `${r * Math.cos((i * Math.PI) / 3)},${r * Math.sin((i * Math.PI) / 3)}`).join(" ");
  return (
    <g>
      {/* plate + other fasteners */}
      <rect x={-330} y={-200} width={660} height={400} rx={18} fill="rgba(120,170,220,0.10)" stroke="rgba(170,215,255,0.5)" strokeWidth={2} />
      {[-250, 250].map((x) => [-130, 130].map((y) => (
        <g key={`${x}${y}`}><circle cx={x} cy={y} r={16} fill="none" stroke="rgba(170,215,255,0.7)" strokeWidth={2} /><circle cx={x} cy={y} r={5} fill="rgba(170,215,255,0.7)" /></g>
      )))}
      {/* washer + nut */}
      <circle r={66} fill="rgba(200,220,240,0.12)" stroke="rgba(200,225,255,0.8)" strokeWidth={2} />
      <g transform={`rotate(${ang})`}>
        <polygon points={hex(50)} fill="rgba(170,200,230,0.35)" stroke={C.white} strokeWidth={3} />
        <circle r={22} fill="none" stroke={C.white} strokeWidth={2} />
        {/* wrench */}
        <g>
          <circle r={64} fill="none" stroke={C.cyan} strokeWidth={14} opacity={0.9} />
          <rect x={56} y={-20} width={520} height={40} rx={20} fill="rgba(56,225,255,0.18)" stroke={C.cyan} strokeWidth={3} />
          <rect x={430} y={-26} width={160} height={52} rx={22} fill="rgba(56,225,255,0.35)" stroke={C.cyan} strokeWidth={3} />
          {new Array(9).fill(0).map((_, i) => <line key={i} x1={200 + i * 22} y1={-12} x2={200 + i * 22} y2={i % 2 ? 0 : 6} stroke={C.white} strokeWidth={2} />)}
        </g>
      </g>
      {/* click flash */}
      <circle r={90 + click * 120} fill="none" stroke={C.green} strokeWidth={4} opacity={click > 0 ? 1 - click : 0} />
    </g>
  );
};
