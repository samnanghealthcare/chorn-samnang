import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, lerp, prog, useT } from "../animations/anim";
import { BlueprintGrid, Fill, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { TOP, TopView } from "../components/Aircraft";
import { IllustrativeTag, KineticTitle } from "../components/Type";

/** Major zones - standard ATA iSpec 2200 numbering used by Airbus for the A320 family. */
export const ZONES = [
  { at: 78.0, n: "100 / 200", en: "FUSELAGE (LOWER / UPPER)", color: "#38e1ff" },
  { at: 78.45, n: "300", en: "EMPENNAGE", color: "#a78bfa" },
  { at: 78.9, n: "400", en: "POWER PLANTS & PYLONS", color: "#ffb547" },
  { at: 79.35, n: "500", en: "LEFT WING", color: "#3ddc97" },
  { at: 79.8, n: "600", en: "RIGHT WING", color: "#5eead4" },
  { at: 80.25, n: "700", en: "LANDING GEAR & DOORS", color: "#ff7a8a" },
  { at: 80.7, n: "800", en: "DOORS", color: "#f9e04b" },
];

export const ZoneShapes: React.FC<{ t: number; only?: string; fillO?: number }> = ({ t, only, fillO = 0.38 }) => {
  const z = (i: number) => (only && ZONES[i].n !== only ? 0 : prog(t, ZONES[i].at, 0.45));
  const f = (i: number) => ({ fill: ZONES[i].color, fillOpacity: fillO * z(i), stroke: ZONES[i].color, strokeWidth: 3, strokeOpacity: z(i) });
  return (
    <g>
      <defs>
        <clipPath id="fwd"><rect x={170} y={-60} width={800} height={120} /></clipPath>
        <clipPath id="aft"><rect x={-20} y={-200} width={190} height={400} /></clipPath>
      </defs>
      <path d={TOP.fuselage} clipPath="url(#fwd)" {...f(0)} />
      <g clipPath="url(#aft)"><path d={TOP.fuselage} {...f(1)} /></g>
      <path d={TOP.stabL} {...f(1)} /><path d={TOP.stabR} {...f(1)} /><path d={TOP.fin} {...f(1)} />
      <path d={TOP.engL} {...f(2)} /><path d={TOP.engR} {...f(2)} />
      <path d={TOP.wingL} {...f(3)} />
      <path d={TOP.wingR} {...f(4)} />
      {[[432, -91], [432, 91], [810, 0]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={16 * (0.5 + 0.5 * z(5))} fill={ZONES[5].color} fillOpacity={0.6 * z(5)} stroke={ZONES[5].color} strokeWidth={3} strokeOpacity={z(5)} />
      ))}
      {[[828, -47], [828, 47], [520, -47], [520, 47], [205, -45], [205, 45]].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x - 12} y={y - 5} width={24} height={10} rx={3} fill={ZONES[6].color} opacity={z(6)} />
      ))}
    </g>
  );
};

export const S09_Zones: React.FC = () => {
  const t = useT();
  const tilt = prog(t, 74.0, 7.6, easeInOut);
  const warn = prog(t, 75.3, 0.4) * (1 - prog(t, 77.2, 0.5));
  return (
    <>
      <Fill />
      <BlueprintGrid o={1} />
      <Particles n={16} seed="zn" />
      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "40% 55%", transform: `rotateX(${lerp(28, 8, tilt)}deg) rotateZ(${lerp(-6, 0, tilt)}deg) scale(${lerp(0.92, 1.02, tilt)})` }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 6px rgba(56,225,255,0.45))" }}>
            <g transform="translate(120,520) scale(0.82)">
              <ZoneShapes t={t} />
              <TopView stroke="#d9f3ff" sw={2.2} />
              <g opacity={warn}>
                <line x1={-40} y1={-409} x2={-40} y2={409} stroke={C.red} strokeWidth={4} strokeDasharray="10 8" />
                <line x1={0} y1={460} x2={902} y2={460} stroke={C.red} strokeWidth={4} strokeDasharray="10 8" />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1080, top: 120, width: 780 }}>
        <div style={{ opacity: 1 - prog(t, 77.4, 0.4), position: "absolute", top: 0 }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.red, letterSpacing: 6, opacity: warn > 0 ? 1 : prog(t, 74.8, 0.4) }}>SIZE ALONE IS NOT ENOUGH</div>
          <KineticTitle text="ការស្គាល់ទំហំ មិនទាន់គ្រប់គ្រាន់ទេ" at={74.8} size={52} font={F.kh} weight={700} align="left" />
        </div>
        <div style={{ position: "absolute", top: 0, opacity: prog(t, 77.6, 0.5) }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.cyan, letterSpacing: 6 }}>MAP · MAJOR ZONES</div>
          <KineticTitle text="AIRCRAFT ZONES" at={77.7} size={78} align="left" />
          <div style={{ marginTop: 16 }}>
            {ZONES.map((z) => {
              const p = prog(t, z.at, 0.4);
              return (
                <div key={z.n} style={{ display: "flex", alignItems: "center", height: 64, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                  <div style={{ width: 150, fontFamily: F.mono, fontWeight: 700, fontSize: 32, color: z.color }}>{z.n}</div>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: z.color, marginRight: 18 }} />
                  <div style={{ fontFamily: F.en, fontWeight: 600, fontSize: 28, color: C.white }}>{z.en}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <LightSweep at={77.8} />
      <IllustrativeTag text="Major zones · ATA iSpec 2200 numbering · illustrative outline" />
      <Vignette strength={0.55} />
      <HUD tag="ATA 06 · AIRCRAFT ZONING" sub="TOP VIEW · NOSE RIGHT" />
    </>
  );
};
