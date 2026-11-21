import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, inOut, lerp, prog, useT } from "../animations/anim";
import { KenBurns } from "../components/Camera";
import { BlueprintGrid, Fill, HUD, LightSweep, Particles, Vignette } from "../components/Atmos";
import { KineticTitle, Typewriter } from "../components/Type";

// Selected ATA iSpec 2200 chapter numbers (airframe + powerplant)
const CH = ["05","06","07","08","09","10","11","12","18","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","38","45","46","49","51","52","53","54","55","56","57","61","70","71","72","73","74","75","76","77","78","79","80"];

const Card: React.FC<{ at: number; num: string; title: string; kh: string; color: string; x: number }> = ({ at, num, title, kh, color, x }) => {
  const t = useT();
  const p = prog(t, at, 0.8);
  return (
    <div style={{ position: "absolute", left: x, top: 250, width: 720, height: 470, opacity: p, transform: `translateY(${(1 - p) * 60}px) rotateY(${(1 - p) * 25}deg)`,
      background: "linear-gradient(160deg, rgba(18,58,102,0.85), rgba(4,16,31,0.9))", border: `2px solid ${color}`, borderRadius: 22,
      boxShadow: `0 0 60px ${color}44, inset 0 0 40px rgba(0,0,0,0.4)`, padding: 44, boxSizing: "border-box" }}>
      <div style={{ fontFamily: F.mono, fontSize: 28, color, letterSpacing: 10 }}>ATA CHAPTER</div>
      <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 170, color: C.white, lineHeight: 1.05 }}>{num}</div>
      <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: 2 }}>{title}</div>
      <div style={{ fontFamily: F.kh, fontSize: 32, color: C.dim, marginTop: 10 }}>{kh}</div>
    </div>
  );
};

export const S02_AtaSystem: React.FC = () => {
  const t = useT();
  const gridOut = prog(t, 22.0, 0.6, easeInOut);
  const focus = prog(t, 19.8, 0.8);
  return (
    <>
      <KenBurns src="assets/images/hangar_maintenance.jpg" a={11.1} b={27} s0={1.15} s1={1.3} x0={40} x1={-60} filter="blur(7px) brightness(0.35) saturate(0.6)" />
      <Fill c={C.navy} o={0.45} />
      <BlueprintGrid o={0.6} />
      <Particles n={30} seed="ata" />
      {/* Title */}
      <div style={{ position: "absolute", left: 120, top: 110, opacity: inOut(t, 12.2, 22.2, 0.5, 0.5) }}>
        <Typewriter text="STANDARD // TECHNICAL DOCUMENTATION" at={12.3} size={26} />
        <KineticTitle text="ATA CHAPTER SYSTEM" at={15.4} size={66} align="left" style={{ marginTop: 8 }} />
        <div style={{ fontFamily: F.kh, fontSize: 34, color: C.dim, opacity: prog(t, 17.2, 0.6) }}>ប្រព័ន្ធលេខជំពូកសម្រាប់ឯកសារបច្ចេកទេស</div>
      </div>
      {/* Chapter tile grid */}
      <div style={{ position: "absolute", left: 1090, top: 150, width: 760, display: "flex", flexWrap: "wrap", gap: 12, opacity: 1 - gridOut,
        transform: `scale(${lerp(1, 0.9, gridOut)})` }}>
        {CH.map((n, i) => {
          const p = prog(t, 13.0 + i * 0.045, 0.5);
          const key = n === "06" || n === "20";
          const dim = key ? 1 : lerp(1, 0.22, focus);
          const color = n === "20" ? C.amber : C.cyan;
          return (
            <div key={n} style={{ width: 96, height: 74, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.mono, fontWeight: 700, fontSize: 32, color: key && focus > 0 ? C.white : C.dim,
              background: key ? `rgba(${n === "20" ? "255,181,71" : "56,225,255"},${0.1 + 0.35 * focus})` : "rgba(18,58,102,0.55)",
              border: `1.5px solid ${key && focus > 0 ? color : "rgba(140,200,255,0.35)"}`, boxShadow: key ? `0 0 ${30 * focus}px ${color}` : undefined,
              opacity: p * dim, transform: `scale(${(0.6 + 0.4 * p) * (key ? 1 + 0.12 * focus : 1)})` }}>{n}</div>
          );
        })}
        <div style={{ width: "100%", fontFamily: F.mono, fontSize: 18, color: C.dim, marginTop: 8, letterSpacing: 2 }}>SELECTED CHAPTERS · ATA iSpec 2200 NUMBERING</div>
      </div>
      {/* Two key chapters */}
      <div style={{ opacity: 1 - prog(t, 26.6, 0.4) }}>
        <Card at={22.5} num="20" title="STANDARD PRACTICES – AIRFRAME" kh="គោលការណ៍ និងវិធីសាស្ត្រថែទាំទូទៅ" color={C.amber} x={180} />
        <Card at={24.3} num="06" title="DIMENSIONS AND AREAS" kh="វិមាត្រ ទីតាំង និងតំបន់" color={C.cyan} x={1020} />
      </div>
      <LightSweep at={22.6} />
      <Vignette />
      <HUD tag="ATA iSpec 2200" sub="CHAPTER INDEX" />
    </>
  );
};
