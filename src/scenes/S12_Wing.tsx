import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, inOut, lerp, prog, useT } from "../animations/anim";
import { Footage } from "../components/Camera";
import { BlueprintGrid, Fill, Gradient, HUD, LightSweep, Vignette } from "../components/Atmos";
import { TOP, TopView } from "../components/Aircraft";
import { Credit, IllustrativeTag, KineticTitle } from "../components/Type";

const STEPS = [
  { at: 103.6, en: "ZONE", kh: "តំបន់ (Zone 500 · Left Wing)" },
  { at: 104.6, en: "STATION", kh: "ទីតាំងតាមបន្ទាត់យោង" },
  { at: 105.7, en: "ACCESS PANEL", kh: "បន្ទះចូលដល់គ្រឿង" },
];

export const S12_Wing: React.FC = () => {
  const t = useT();
  const bp = prog(t, 100.2, 0.7, easeInOut);
  const zoom = prog(t, 100.6, 2.4, easeInOut);
  const zone = prog(t, 103.6, 0.5);
  const st = prog(t, 104.6, 0.6);
  const ap = prog(t, 105.7, 0.5);
  const blink = 0.55 + 0.45 * Math.sin(t * 9);
  const s = lerp(0.82, 1.9, zoom), tx = lerp(170, -112, zoom), ty = lerp(560, 995, zoom);
  return (
    <>
      <Fill />
      {/* real footage: technicians working on the wing */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - bp }}>
        <Footage src="assets/videos/maint_topwing.mp4" a={96.9} b={101} rate={0.75} s0={1.05} s1={1.15} filter="brightness(0.65)" />
        <Gradient />
        <div style={{ position: "absolute", left: 120, top: 140 }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, letterSpacing: 8, opacity: prog(t, 97.8, 0.5) }}>EXAMPLE</div>
          <KineticTitle text="WING INSPECTION" at={97.9} size={96} align="left" />
          <div style={{ fontFamily: F.kh, fontSize: 40, color: C.white, opacity: prog(t, 98.6, 0.5) }}>ការត្រួតពិនិត្យស្លាបយន្តហោះ</div>
        </div>
        <Credit text="Footage: U.S. Air Force / Wikimedia Commons (Public domain)" />
      </div>
      {/* blueprint: zone -> station -> access panel */}
      <div style={{ position: "absolute", inset: 0, opacity: bp }}>
        <BlueprintGrid o={1} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 6px rgba(56,225,255,0.5))" }}>
          <g transform={`translate(${tx},${ty}) scale(${s})`}>
            <path d={TOP.wingL} fill="#3ddc97" fillOpacity={0.3 * zone} stroke="#3ddc97" strokeWidth={3 / s * 1.6} strokeOpacity={zone} />
            <TopView stroke="#e6f6ff" sw={2.4 / s * 1.4} />
            <g opacity={st}>
              <line x1={lerp(452, 400, st)} y1={-230} x2={lerp(452, 504, st)} y2={-230} stroke={C.cyan} strokeWidth={3} strokeDasharray="6 4" />
              <text x={508} y={-236} fill={C.cyan} fontFamily="JetBrains Mono" fontWeight={700} fontSize={14}>STATION</text>
            </g>
            <g opacity={ap}>
              <rect x={438} y={-237} width={28} height={14} rx={2} fill={C.amber} fillOpacity={0.45 * blink} stroke={C.amber} strokeWidth={2} />
              <circle cx={452} cy={-230} r={14 + 26 * ((t * 1.3) % 1)} fill="none" stroke={C.amber} strokeWidth={1.5} opacity={1 - ((t * 1.3) % 1)} />
            </g>
            <text x={455} y={-300} fill="#3ddc97" fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} opacity={zone}>ZONE 500</text>
          </g>
        </svg>
        <div style={{ position: "absolute", left: 100, top: 110, opacity: prog(t, 100.8, 0.5) }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.cyan, letterSpacing: 6 }}>USING ATA CHAPTER 06</div>
          <div style={{ fontFamily: F.kh, fontWeight: 700, fontSize: 46, color: C.white }}>ស្វែងរកទីតាំងដែលត្រឹមត្រូវ</div>
        </div>
        <div style={{ position: "absolute", left: 1290, top: 260, width: 560 }}>
          {STEPS.map((st2, i) => {
            const p = prog(t, st2.at, 0.5);
            return (
              <div key={st2.en} style={{ display: "flex", alignItems: "center", marginBottom: 36, opacity: 0.2 + 0.8 * p, transform: `translateX(${(1 - p) * 30}px)` }}>
                <div style={{ width: 56, height: 56, borderRadius: 56, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 26,
                  background: p > 0.5 ? C.green : "rgba(18,58,102,0.9)", color: C.navy, border: `2px solid ${C.green}` }}>{p > 0.5 ? "✓" : i + 1}</div>
                <div style={{ marginLeft: 22 }}>
                  <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 38, color: C.white, letterSpacing: 2 }}>{st2.en}</div>
                  <div style={{ fontFamily: F.kh, fontSize: 26, color: C.dim }}>{st2.kh}</div>
                </div>
              </div>
            );
          })}
          <div style={{ width: 440, height: 250, borderRadius: 12, overflow: "hidden", border: `1.5px solid ${C.amber}`, opacity: inOut(t, 106.3, 108.9, 0.5, 0.4), position: "relative" }}>
            <Footage src="assets/videos/access_panel.mp4" a={106.3} b={108.9} startFrom={0} s0={1.1} s1={1.2} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "4px 10px", background: "rgba(4,16,31,0.8)", fontFamily: F.mono, fontSize: 15, color: C.white }}>WORK THROUGH AN ACCESS OPENING</div>
          </div>
        </div>
        <IllustrativeTag text="Illustrative · panel/station positions not to scale" />
      </div>
      <LightSweep at={100.3} />
      <Vignette strength={0.55} />
      <HUD tag="EXAMPLE · WING" sub="ZONE ▸ STATION ▸ ACCESS PANEL" />
    </>
  );
};
