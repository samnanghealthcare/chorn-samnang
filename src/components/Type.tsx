import React from "react";
import { interpolate } from "remotion";
import { C, F } from "../styles/theme";
import { easeInOut, inOut, prog, useT } from "../animations/anim";

/** Mask-reveal kinetic title: each word slides up from behind a mask, staggered. */
export const KineticTitle: React.FC<{
  text: string; at: number; out?: number; size?: number; color?: string; font?: string; weight?: number;
  stagger?: number; tracking?: number; align?: "left" | "center"; style?: React.CSSProperties;
}> = ({ text, at, out = 9999, size = 96, color = C.white, font = F.en, weight = 900, stagger = 0.09, tracking = 2, align = "center", style }) => {
  const t = useT();
  const words = text.split(" ");
  const fade = 1 - prog(t, out - 0.45, 0.45, easeInOut);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", gap: `0 ${size * 0.28}px`, opacity: fade, ...style }}>
      {words.map((w, i) => {
        const p = prog(t, at + i * stagger, 0.7);
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: size * 0.12 }}>
            <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: tracking, lineHeight: 1.15,
              transform: `translateY(${(1 - p) * 110}%)`, filter: `blur(${(1 - p) * 6}px)` }}>{w}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Typewriter effect for monospaced technical text. */
export const Typewriter: React.FC<{ text: string; at: number; cps?: number; size?: number; color?: string; style?: React.CSSProperties }> = ({
  text, at, cps = 28, size = 28, color = C.cyan, style,
}) => {
  const t = useT();
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  if (t < at) return null;
  const caret = Math.floor(t * 2.5) % 2 === 0 && n < text.length + 8;
  return (
    <div style={{ fontFamily: F.mono, fontSize: size, color, letterSpacing: 2, whiteSpace: "pre", ...style }}>
      {text.slice(0, n)}<span style={{ opacity: caret ? 1 : 0 }}>▍</span>
    </div>
  );
};

/** Big chapter badge with counting number, e.g. ATA 20 */
export const ChapterBadge: React.FC<{ at: number; num: number; title: string; sub: string; out?: number; accent?: string; x?: number; y?: number; scale?: number }> = ({
  at, num, title, sub, out = 9999, accent = C.cyan, x = 960, y = 540, scale = 1,
}) => {
  const t = useT();
  const o = inOut(t, at, out, 0.5, 0.5);
  const c = Math.round(interpolate(prog(t, at, 1.0), [0, 1], [0, num]));
  const line = prog(t, at + 0.3, 0.8);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale * (0.92 + 0.08 * prog(t, at, 0.8))})`, opacity: o, textAlign: "center" }}>
      <div style={{ fontFamily: F.mono, fontSize: 30, color: accent, letterSpacing: 12 }}>ATA CHAPTER</div>
      <div style={{ fontFamily: F.en, fontWeight: 900, fontSize: 230, color: C.white, lineHeight: 1, textShadow: `0 0 50px ${accent}66` }}>
        {String(c).padStart(2, "0")}
      </div>
      <div style={{ height: 3, width: 700 * line, background: accent, margin: "12px auto 22px", boxShadow: `0 0 18px ${accent}` }} />
      <div style={{ fontFamily: F.en, fontWeight: 800, fontSize: 54, color: C.white, letterSpacing: 6, opacity: prog(t, at + 0.6, 0.6) }}>{title}</div>
      <div style={{ fontFamily: F.kh, fontWeight: 500, fontSize: 40, color: C.dim, marginTop: 10, opacity: prog(t, at + 0.9, 0.6) }}>{sub}</div>
    </div>
  );
};

/** Animated technical callout: pulsing dot + leader line + label box. */
export const TechLabel: React.FC<{
  at: number; out?: number; x: number; y: number; dx?: number; dy?: number; text: string; sub?: string; color?: string; size?: number;
}> = ({ at, out = 9999, x, y, dx = 140, dy = -90, text, sub, color = C.cyan, size = 26 }) => {
  const t = useT();
  const o = inOut(t, at, out, 0.3, 0.4);
  if (o <= 0) return null;
  const pDot = prog(t, at, 0.35);
  const pLine = prog(t, at + 0.15, 0.45);
  const pBox = prog(t, at + 0.45, 0.45);
  const pulse = 1 + 0.5 * ((t * 1.6) % 1);
  const ex = x + dx * pLine, ey = y + dy * pLine;
  const left = dx >= 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <circle cx={x} cy={y} r={9 * pDot} fill={color} />
        <circle cx={x} cy={y} r={9 * pulse * pDot} fill="none" stroke={color} strokeWidth={2} opacity={2 - pulse * 1.3} />
        <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", top: y + dy - 30, left: left ? x + dx + 10 : undefined, right: left ? undefined : 1920 - (x + dx) + 10,
        opacity: pBox, transform: `translateX(${(1 - pBox) * (left ? -20 : 20)}px)`,
        background: "rgba(4,16,31,0.82)", border: `1.5px solid ${color}`, borderRadius: 6, padding: "8px 16px", backdropFilter: "blur(6px)" }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: size, color: C.white, letterSpacing: 2, whiteSpace: "nowrap" }}>{text}</div>
        {sub ? <div style={{ fontFamily: F.kh, fontSize: size * 0.8, color: C.dim, whiteSpace: "nowrap" }}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** Small disclaimer tag for representative visuals. */
export const IllustrativeTag: React.FC<{ text?: string; o?: number }> = ({ text = "Illustrative Visualization", o = 1 }) => (
  <div style={{ position: "absolute", right: 70, bottom: 196, fontFamily: F.mono, fontSize: 17, color: "rgba(200,225,255,0.7)", letterSpacing: 2,
    border: "1px solid rgba(200,225,255,0.35)", padding: "4px 12px", borderRadius: 4, opacity: o, background: "rgba(4,16,31,0.5)" }}>{text}</div>
);

/** Small source credit for real photos/footage. */
export const Credit: React.FC<{ text: string; o?: number }> = ({ text, o = 1 }) => (
  <div style={{ position: "absolute", left: 70, bottom: 196, fontFamily: F.mono, fontSize: 15, color: "rgba(220,235,255,0.6)", letterSpacing: 1, opacity: o }}>{text}</div>
);
