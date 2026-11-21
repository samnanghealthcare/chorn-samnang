import React from "react";
import { random, useCurrentFrame } from "remotion";
import { C, F } from "../styles/theme";
import { prog, useT } from "../animations/anim";

export const Fill: React.FC<{ c?: string; o?: number }> = ({ c = C.navy, o = 1 }) => (
  <div style={{ position: "absolute", inset: 0, background: c, opacity: o }} />
);

export const Gradient: React.FC<{ o?: number; from?: string }> = ({ o = 1, from = "rgba(4,16,31,0.0)" }) => (
  <div style={{ position: "absolute", inset: 0, opacity: o, background: `linear-gradient(180deg, ${from} 0%, rgba(4,16,31,0.25) 55%, rgba(4,16,31,0.92) 100%)` }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)` }} />
);

/** Animated engineering grid that slowly drifts (blueprint paper). */
export const BlueprintGrid: React.FC<{ o?: number; size?: number; drift?: number }> = ({ o = 1, size = 60, drift = 12 }) => {
  const frame = useCurrentFrame();
  const off = (frame * drift) / 30;
  return (
    <div
      style={{
        position: "absolute", inset: -size * 2, opacity: o,
        backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px),
          linear-gradient(rgba(90,160,230,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(90,160,230,0.06) 1px, transparent 1px)`,
        backgroundSize: `${size * 5}px ${size * 5}px, ${size * 5}px ${size * 5}px, ${size}px ${size}px, ${size}px ${size}px`,
        transform: `translate(${off % size}px, ${(off * 0.6) % size}px)`,
      }}
    />
  );
};

/** Floating dust / particles for depth. */
export const Particles: React.FC<{ n?: number; color?: string; seed?: string; o?: number }> = ({ n = 40, color = "rgba(160,220,255,0.6)", seed = "p", o = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1920;
        const y = random(`${seed}y${i}`) * 1080;
        const sp = 0.2 + random(`${seed}s${i}`) * 0.8;
        const r = 1 + random(`${seed}r${i}`) * 2.5;
        const yy = (y - frame * sp + 1200) % 1200 - 60;
        const xx = x + Math.sin((frame + i * 20) / 60) * 18;
        return <div key={i} style={{ position: "absolute", left: xx, top: yy, width: r, height: r, borderRadius: r, background: color, opacity: 0.3 + 0.5 * random(`${seed}o${i}`), boxShadow: `0 0 ${r * 4}px ${color}` }} />;
      })}
    </div>
  );
};

/** Diagonal light sweep across the frame at absolute time `at`. */
export const LightSweep: React.FC<{ at: number; dur?: number }> = ({ at, dur = 1.2 }) => {
  const t = useT();
  const p = prog(t, at, dur);
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", top: -400, bottom: -400, width: 380, left: -600 + p * 3000, transform: "rotate(18deg)",
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(160,230,255,0.28) 50%, rgba(255,255,255,0) 100%)" }} />
    </div>
  );
};

/** Moving scanline used in technical / x-ray scenes. */
export const ScanLine: React.FC<{ at: number; dur?: number; vertical?: boolean; color?: string }> = ({ at, dur = 1.6, vertical, color = C.cyan }) => {
  const t = useT();
  const p = prog(t, at, dur);
  if (p <= 0 || p >= 1) return null;
  const pos = p * (vertical ? 1080 : 1920);
  return vertical ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: pos, height: 2, background: color, boxShadow: `0 0 24px 6px ${color}` }} />
  ) : (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: pos, width: 2, background: color, boxShadow: `0 0 24px 6px ${color}` }} />
  );
};

/** Corner brackets + small technical readouts, documentary HUD style. */
export const HUD: React.FC<{ tag: string; sub?: string; o?: number }> = ({ tag, sub, o = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const L = 46;
  const corner = (s: React.CSSProperties) => <div style={{ position: "absolute", width: L, height: L, borderColor: "rgba(160,220,255,0.7)", borderStyle: "solid", borderWidth: 0, ...s }} />;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      {corner({ left: 40, top: 40, borderLeftWidth: 2, borderTopWidth: 2 })}
      {corner({ right: 40, top: 40, borderRightWidth: 2, borderTopWidth: 2 })}
      {corner({ left: 40, bottom: 40, borderLeftWidth: 2, borderBottomWidth: 2 })}
      {corner({ right: 40, bottom: 40, borderRightWidth: 2, borderBottomWidth: 2 })}
      <div style={{ position: "absolute", left: 64, top: 56, fontFamily: F.mono, fontSize: 20, color: C.cyan, letterSpacing: 3 }}>
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 10, background: C.cyan, marginRight: 12, opacity: Math.floor(t * 2) % 2 ? 1 : 0.3 }} />
        {tag}
      </div>
      {sub ? <div style={{ position: "absolute", right: 64, top: 56, fontFamily: F.mono, fontSize: 18, color: C.dim, letterSpacing: 2 }}>{sub}</div> : null}
    </div>
  );
};

export const Grain: React.FC<{ o?: number }> = ({ o = 0.06 }) => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none", mixBlendMode: "overlay" }} width={1920} height={1080}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};
