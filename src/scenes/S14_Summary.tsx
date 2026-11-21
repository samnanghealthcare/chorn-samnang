import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, lerp, prog, useT } from "../animations/anim";
import { KenBurns } from "../components/Camera";
import { BlueprintGrid, Fill, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { KineticTitle } from "../components/Type";

const Check: React.FC<{ p: number; color: string }> = ({ p, color }) => (
  <svg width={90} height={90} viewBox="-45 -45 90 90">
    <circle r={38} fill={`${color}22`} stroke={color} strokeWidth={4} opacity={p} />
    <path d="M -18,0 L -5,14 L 20,-14" stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

export const S14_Summary: React.FC = () => {
  const t = useT();
  const c06 = prog(t, 121.8, 0.6);
  const c20 = prog(t, 127.8, 0.6);
  const out = prog(t, 130.5, 0.7, easeInOut);
  const cell = (hi: number, color: string): React.CSSProperties => ({
    width: 520, height: 150, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14,
    background: hi > 0 ? `rgba(${color === C.cyan ? "56,225,255" : "255,181,71"},${0.18 * hi})` : "rgba(18,58,102,0.45)",
    border: `2px solid ${hi > 0 ? color : "rgba(140,200,255,0.25)"}`, boxShadow: hi > 0 ? `0 0 ${30 * hi}px ${color}55` : undefined,
  });
  const takeaways = [
    { at: 131.0, n: "01", en: "KNOW THE LOCATION", kh: "ស្គាល់ទីតាំងឲ្យច្បាស់", color: C.cyan },
    { at: 132.5, n: "02", en: "FOLLOW THE STANDARD", kh: "អនុវត្តតាមស្តង់ដារ", color: C.amber },
    { at: 133.9, n: "03", en: "SAFETY FIRST", kh: "សុវត្ថិភាពជាអាទិភាព", color: C.green },
  ];
  return (
    <>
      <KenBurns src="assets/images/a320_lufthansa.jpg" a={119} b={136.3} s0={1.1} s1={1.25} x0={30} x1={-50} filter="blur(8px) brightness(0.3) saturate(0.7)" />
      <Fill c={C.navy} o={0.45} />
      <BlueprintGrid o={0.5} />
      <Particles n={30} seed="sum" />
      {/* decision matrix */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${lerp(0, -60, out)}px) scale(${lerp(1, 0.94, out)})` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 100, textAlign: "center" }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.cyan, letterSpacing: 10, opacity: prog(t, 119.8, 0.4) }}>SUMMARY</div>
          <KineticTitle text="សរុបមក" at={119.8} size={70} font={F.kh} weight={700} />
        </div>
        <div style={{ position: "absolute", left: 180, top: 330, display: "grid", gridTemplateColumns: "460px 520px 520px", gap: 18, alignItems: "center",
          opacity: prog(t, 120.2, 0.6) }}>
          <div />
          <div style={{ textAlign: "center", fontFamily: F.en, fontWeight: 900, fontSize: 40, color: C.white }}>ATA 06<div style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 20, color: C.cyan, letterSpacing: 2 }}>DIMENSIONS AND AREAS</div></div>
          <div style={{ textAlign: "center", fontFamily: F.en, fontWeight: 900, fontSize: 40, color: C.white }}>ATA 20<div style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 20, color: C.amber, letterSpacing: 2 }}>STANDARD PRACTICES – AIRFRAME</div></div>
          <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 42, color: C.white }}>WHERE?<div style={{ fontFamily: F.kh, fontWeight: 500, fontSize: 28, color: C.dim }}>ត្រូវធ្វើការនៅកន្លែងណា</div></div>
          <div style={cell(c06, C.cyan)}><Check p={c06} color={C.cyan} /></div>
          <div style={cell(0, C.amber)} />
          <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 42, color: C.white }}>HOW?<div style={{ fontFamily: F.kh, fontWeight: 500, fontSize: 28, color: C.dim }}>គោលការណ៍ និងវិធីសាស្ត្រ</div></div>
          <div style={cell(0, C.cyan)} />
          <div style={cell(c20, C.amber)}><Check p={c20} color={C.amber} /></div>
        </div>
      </div>
      {/* three takeaways */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center", gap: 40, opacity: out }}>
        {takeaways.map((k) => {
          const p = prog(t, k.at, 0.6);
          return (
            <div key={k.n} style={{ width: 500, height: 520, borderRadius: 24, padding: 40, boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 60}px)`,
              background: "linear-gradient(170deg, rgba(18,58,102,0.9), rgba(4,16,31,0.92))", border: `2px solid ${k.color}`, boxShadow: `0 0 50px ${k.color}33` }}>
              <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 120, color: k.color, lineHeight: 1 }}>{k.n}</div>
              <div style={{ height: 3, width: 200 * p, background: k.color, margin: "22px 0" }} />
              <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: 1 }}>{k.en}</div>
              <div style={{ fontFamily: F.kh, fontWeight: 700, fontSize: 38, color: C.white, marginTop: 16 }}>{k.kh}</div>
            </div>
          );
        })}
      </div>
      <LightSweep at={121.8} />
      <LightSweep at={127.8} />
      <Vignette />
      <HUD tag="DECISION MATRIX" sub="ATA 06 × ATA 20" />
    </>
  );
};
