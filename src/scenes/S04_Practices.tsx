import React from "react";
import { C, F } from "../styles/theme";
import { inOut, prog, useT } from "../animations/anim";
import { Footage, KenBurns } from "../components/Camera";
import { BlueprintGrid, Fill, HUD, Particles, ScanLine, Vignette } from "../components/Atmos";
import { TorqueWrench } from "../components/Engine";
import { IllustrativeTag } from "../components/Type";

const STEPS = [
  { at: 36.35, en: "TOOLS", kh: "ប្រើប្រាស់ឧបករណ៍ឲ្យត្រឹមត្រូវ" },
  { at: 38.3, en: "BOLT & NUT", kh: "ការរឹតបន្តឹង Bolt និង Nut" },
  { at: 40.45, en: "TORQUE WRENCH", kh: "ការប្រើ Torque Wrench" },
  { at: 42.25, en: "FASTENERS", kh: "ការដំឡើង Fasteners" },
  { at: 43.3, en: "CORROSION PROTECTION", kh: "ការការពារច្រេះ" },
];

const Panel: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const t = useT();
  const o = inOut(t, a, b, 0.35, 0.35);
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o, transform: `scale(${1.03 - 0.03 * o})` }}>{children}</div>;
};

export const S04_Practices: React.FC = () => {
  const t = useT();
  const turn = prog(t, 38.6, 2.4);
  const click = prog(t, 41.1, 0.7);
  const lineP = prog(t, 36.2, 7.6);
  return (
    <>
      <Fill />
      <BlueprintGrid o={0.9} />
      <Particles n={20} seed="pr" />
      {/* Left visual stage */}
      <div style={{ position: "absolute", left: 90, top: 140, width: 960, height: 700, borderRadius: 24, overflow: "hidden", border: "1.5px solid rgba(140,200,255,0.4)", background: "rgba(4,16,31,0.7)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <Panel a={34.7} b={38.4}>
          <KenBurns src="assets/images/structural_repair.jpg" a={34.7} b={38.6} s0={1.05} s1={1.2} x0={20} x1={-20} />
        </Panel>
        <Panel a={38.2} b={42.3}>
          <BlueprintGrid o={0.6} size={40} />
          <svg width={960} height={700} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(380,350) scale(1.25)"><TorqueWrench turn={turn} click={click} /></g>
          </svg>
          <div style={{ position: "absolute", right: 30, top: 30, fontFamily: F.mono, fontSize: 26, color: click > 0 ? C.green : C.cyan, letterSpacing: 3,
            border: `1.5px solid ${click > 0 ? C.green : C.cyan}`, padding: "8px 16px", borderRadius: 8, background: "rgba(4,16,31,0.8)" }}>
            {click > 0 ? "✓ TORQUE REACHED · CLICK" : `TIGHTENING ${Math.round(turn * 100)}%`}
          </div>
          <div style={{ position: "absolute", left: 30, bottom: 26, width: 300, height: 170, borderRadius: 12, overflow: "hidden", border: `1.5px solid ${C.cyan}`, opacity: prog(t, 40.5, 0.5) }}>
            <KenBurns src="assets/images/torque_wrench.jpg" a={40.5} b={42.5} s0={1.1} s1={1.25} />
          </div>
          <div style={{ position: "absolute", left: 30, top: 30, fontFamily: "JetBrains Mono", fontSize: 16, color: "rgba(200,225,255,0.7)", letterSpacing: 2 }}>Illustrative Visualization</div>
        </Panel>
        <Panel a={42.15} b={43.45}>
          <Footage src="assets/videos/rivet_work.mp4" a={42} b={43.6} startFrom={30} s0={1.05} s1={1.12} />
        </Panel>
        <Panel a={43.25} b={45.4}>
          <KenBurns src="assets/images/corrosion_control.jpg" a={43.2} b={45.4} s0={1.05} s1={1.18} y0={10} y1={-20} />
        </Panel>
        <ScanLine at={38.2} dur={1.4} />
      </div>
      {/* Right roadmap */}
      <div style={{ position: "absolute", left: 1130, top: 140, width: 700 }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.amber, letterSpacing: 8, opacity: prog(t, 35.3, 0.5) }}>ATA 20 · KEY PRACTICES</div>
        <div style={{ position: "relative", marginTop: 26 }}>
          <div style={{ position: "absolute", left: 27, top: 30, width: 3, height: 520 * lineP, background: `linear-gradient(${C.amber}, ${C.cyan})` }} />
          {STEPS.map((s, i) => {
            const p = prog(t, s.at, 0.55);
            const active = t >= s.at && (i === STEPS.length - 1 || t < STEPS[i + 1].at);
            return (
              <div key={s.en} style={{ display: "flex", alignItems: "center", height: 130, opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 40}px)` }}>
                <div style={{ width: 58, height: 58, borderRadius: 58, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 26,
                  color: active ? C.navy : C.white, background: active ? C.amber : "rgba(18,58,102,0.9)", border: `2px solid ${C.amber}`, boxShadow: active ? `0 0 26px ${C.amber}` : undefined }}>{i + 1}</div>
                <div style={{ marginLeft: 26 }}>
                  <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: active ? 44 : 38, color: C.white, letterSpacing: 2 }}>{s.en}</div>
                  <div style={{ fontFamily: F.kh, fontSize: 28, color: C.dim }}>{s.kh}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Vignette strength={0.6} />
      <HUD tag="ATA 20 · GENERAL PRACTICES" sub="TOOLS · TORQUE · FASTENERS · CORROSION" />
    </>
  );
};
