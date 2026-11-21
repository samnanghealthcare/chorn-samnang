import React from "react";
import { C, F } from "../styles/theme";
import { easeInOut, lerp, prog, useT } from "../animations/anim";
import { BlueprintGrid, Fill, HUD, Particles, Vignette } from "../components/Atmos";
import { TopView } from "../components/Aircraft";
import { IllustrativeTag, KineticTitle, Typewriter } from "../components/Type";

/** Map-style animation: the station grid acts like coordinates to pin-point a location. */
export const S11_Locate: React.FC = () => {
  const t = useT();
  const cam = prog(t, 89.6, 7.8, easeInOut);
  const r1 = prog(t, 90.8, 1.2, easeInOut); // travel along FS
  const r2 = prog(t, 92.0, 1.0, easeInOut); // then across BL
  const pin = prog(t, 93.1, 0.5);
  const T = { x: 520, y: -235 }; // target point (illustrative)
  const cx = lerp(-40, T.x, r1), cy = lerp(0, T.y, r2);
  const pulse = (t * 1.4) % 1;
  return (
    <>
      <Fill />
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 60%",
          transform: `rotateX(${lerp(46, 30, cam)}deg) rotateZ(${lerp(-14, -4, cam)}deg) scale(${lerp(0.95, 1.35, cam)}) translate(${lerp(0, 40, cam)}px, ${lerp(0, 120, cam)}px)` }}>
          <BlueprintGrid o={1} size={48} drift={18} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 6px rgba(56,225,255,0.5))" }}>
            <g transform="translate(560,600) scale(0.78)">
              {new Array(14).fill(0).map((_, i) => <line key={i} x1={i * 70} y1={-460} x2={i * 70} y2={460} stroke="rgba(56,225,255,0.25)" strokeWidth={1.5} />)}
              {new Array(13).fill(0).map((_, i) => <line key={i} x1={-60} y1={-420 + i * 70} x2={960} y2={-420 + i * 70} stroke="rgba(61,220,151,0.2)" strokeWidth={1.5} />)}
              <TopView stroke="#e6f6ff" sw={2.4} />
              {/* route */}
              <line x1={-40} y1={0} x2={cx} y2={0} stroke={C.cyan} strokeWidth={5} strokeDasharray="14 8" strokeDashoffset={-t * 60} />
              {r2 > 0 && <line x1={T.x} y1={0} x2={T.x} y2={cy} stroke={C.green} strokeWidth={5} strokeDasharray="14 8" strokeDashoffset={-t * 60} />}
              <circle cx={r2 > 0 ? T.x : cx} cy={cy} r={12} fill={C.white} />
              {[0.33, 0.66].map((k) => <circle key={k} cx={lerp(-40, cx, k)} cy={0} r={6} fill={C.cyan} opacity={r1} />)}
              {/* pin */}
              <g opacity={pin} transform={`translate(${T.x},${T.y})`}>
                <circle r={40 + pulse * 70} fill="none" stroke={C.amber} strokeWidth={4} opacity={1 - pulse} />
                <circle r={22} fill={C.amber} />
                <path d="M -60,0 L -30,0 M 30,0 L 60,0 M 0,-60 L 0,-30 M 0,30 L 0,60" stroke={C.amber} strokeWidth={4} />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <Particles n={20} seed="loc" />
      <div style={{ position: "absolute", left: 100, top: 110, width: 900 }}>
        <Typewriter text="FS ▸ BL ▸ WL  =  LOCATION" at={90.6} size={34} />
        <KineticTitle text="កំណត់ទីតាំងរចនាសម្ព័ន្ធ" at={92.6} size={58} font={F.kh} weight={700} align="left" style={{ marginTop: 14 }} />
      </div>
      <div style={{ position: "absolute", right: 110, top: 150, textAlign: "right", opacity: prog(t, 94.6, 0.5) }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.amber, letterSpacing: 6 }}>TARGET LOCATED</div>
        <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 58, color: C.white }}>WORK AREA</div>
        <div style={{ fontFamily: F.kh, fontSize: 32, color: C.dim }}>កន្លែងដែលត្រូវធ្វើការ</div>
      </div>
      <IllustrativeTag text="Illustrative map animation · no real station values" />
      <Vignette strength={0.6} />
      <HUD tag="ATA 06 · LOCATION MAPPING" sub="TRACKING…" />
    </>
  );
};
