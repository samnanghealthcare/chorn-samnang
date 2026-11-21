/**
 * Simplified, illustrative A320-family outlines (nose pointing right).
 * Proportions follow the published A320ceo overall dimensions (length 37.57 m, span 34.10 m,
 * height 11.76 m) at 24 px per metre; detail shapes are illustrative, NOT engineering data.
 */
import React from "react";
import { C } from "../styles/theme";

export const PX_PER_M = 24;
export const TOP = {
  fuselage: "M 0,-8 L 120,-46 L 770,-47 C 850,-47 902,-24 902,0 C 902,24 850,47 770,47 L 120,46 L 0,8 Z",
  wingL: "M 590,-46 L 405,-409 L 369,-409 L 420,-170 L 432,-46 Z",
  wingR: "M 590,46 L 405,409 L 369,409 L 420,170 L 432,46 Z",
  stabL: "M 132,-30 L 46,-149 L 16,-149 L 58,-30 Z",
  stabR: "M 132,30 L 46,149 L 16,149 L 58,30 Z",
  fin: "M 18,-5 L 150,-5 L 150,5 L 18,5 Z",
  engL: "M 512,-166 L 628,-166 C 640,-166 640,-110 628,-110 L 512,-110 Z",
  engR: "M 512,110 L 628,110 C 640,110 640,166 628,166 L 512,166 Z",
};
export const SIDE = {
  fuselage: "M 8,-26 L 140,-50 L 790,-50 C 862,-50 902,-16 902,6 C 902,30 868,50 818,50 L 300,50 C 220,50 120,34 8,-6 Z",
  fin: "M 205,-48 L 72,-187 L 22,-187 L 40,-34 Z",
  stab: "M 14,-28 L 132,-28 L 132,-22 L 14,-22 Z",
  wing: "M 369,30 L 590,30 L 590,38 L 369,38 Z",
  eng: "M 512,32 L 628,32 C 642,32 642,88 628,88 L 512,88 Z",
};

type P = { stroke?: string; fill?: string; sw?: number; dash?: number; draw?: number };
/** `draw` 0..1 animates the line-art being drawn (stroke-dash reveal). */
const Path: React.FC<P & { d: string }> = ({ d, stroke = C.white, fill = "none", sw = 2, draw = 1 }) => (
  <path d={d} stroke={stroke} fill={fill} strokeWidth={sw} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} strokeLinejoin="round" />
);

export const TopView: React.FC<P & { windows?: boolean }> = (p) => (
  <g>
    {[TOP.wingL, TOP.wingR, TOP.stabL, TOP.stabR, TOP.fuselage, TOP.fin, TOP.engL, TOP.engR].map((d, i) => (
      <Path key={i} d={d} {...p} />
    ))}
    {/* flight-deck windows */}
    <path d="M 860,-14 L 878,-10 L 878,10 L 860,14" stroke={p.stroke ?? C.white} strokeWidth={1.4} fill="none" opacity={p.draw ?? 1} />
  </g>
);

export const SideView: React.FC<P> = (p) => {
  const o = p.draw ?? 1;
  return (
    <g>
      {[SIDE.fin, SIDE.stab, SIDE.fuselage, SIDE.wing, SIDE.eng].map((d, i) => <Path key={i} d={d} {...p} />)}
      {/* cabin windows */}
      <line x1={200} y1={-20} x2={780} y2={-20} stroke={p.stroke ?? C.white} strokeWidth={4} strokeDasharray="3 9" opacity={0.6 * o} />
      <path d="M 850,-26 L 878,-14" stroke={p.stroke ?? C.white} strokeWidth={3} opacity={o} />
      {/* landing gear */}
      <g opacity={o} stroke={p.stroke ?? C.white} strokeWidth={2} fill="none">
        <line x1={432} y1={50} x2={432} y2={84} /> <circle cx={432} cy={86} r={9} />
        <line x1={810} y1={45} x2={810} y2={84} /> <circle cx={810} cy={87} r={8} />
      </g>
    </g>
  );
};

/** Engineering dimension line with arrow heads, extension lines and a centred label. */
export const DimLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; label: string; p: number; color?: string; vertical?: boolean; fontSize?: number }> = ({
  x1, y1, x2, y2, label, p, color = C.amber, vertical, fontSize = 30,
}) => {
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const sx = mx - (mx - x1) * p, sy = my - (my - y1) * p;
  const tx = mx + (x2 - mx) * p, ty = my + (y2 - my) * p;
  void ex; void ey;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ah = (x: number, y: number, dir: number) => {
    const a = ang + (dir > 0 ? 0 : Math.PI);
    return `M ${x},${y} L ${x - 16 * Math.cos(a - 0.35)},${y - 16 * Math.sin(a - 0.35)} M ${x},${y} L ${x - 16 * Math.cos(a + 0.35)},${y - 16 * Math.sin(a + 0.35)}`;
  };
  return (
    <g>
      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={color} strokeWidth={2.5} />
      <path d={ah(sx, sy, -1) + " " + ah(tx, ty, 1)} stroke={color} strokeWidth={2.5} fill="none" />
      <g opacity={Math.max(0, (p - 0.6) / 0.4)} transform={`translate(${mx},${my}) ${vertical ? "rotate(-90)" : ""}`}>
        <rect x={-label.length * fontSize * 0.33 - 14} y={-fontSize * 0.85} width={label.length * fontSize * 0.66 + 28} height={fontSize * 1.4} rx={6} fill={C.navy} stroke={color} strokeWidth={1.5} />
        <text x={0} y={fontSize * 0.32} textAnchor="middle" fill={C.white} fontFamily="JetBrains Mono" fontWeight={700} fontSize={fontSize}>{label}</text>
      </g>
    </g>
  );
};
