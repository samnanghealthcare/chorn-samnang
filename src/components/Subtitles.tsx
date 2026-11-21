import React from "react";
import { useCurrentFrame } from "remotion";
import { PHRASES } from "../data/narration";
import { C, F, FPS } from "../styles/theme";
import { prog } from "../animations/anim";

/** Khmer subtitles synced to the exact phrase timings of the voice-over. */
export const Subtitles: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ph = PHRASES.find((p) => t >= p.a - 0.1 && t <= p.b + 0.35);
  if (!ph) return null;
  const o = Math.min(prog(t, ph.a - 0.1, 0.2), 1 - prog(t, ph.b + 0.15, 0.2));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 62, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ maxWidth: 1560, padding: "12px 34px 16px", borderRadius: 14, background: "rgba(3,10,22,0.62)", backdropFilter: "blur(6px)",
        border: "1px solid rgba(140,200,255,0.18)", fontFamily: F.kh, fontWeight: 500, fontSize: 38, lineHeight: 1.6, color: C.white, textAlign: "center",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)", transform: `translateY(${(1 - o) * 8}px)` }}>
        {ph.kh}
      </div>
    </div>
  );
};

/** Thin progress bar showing the two-chapter journey. */
export const ProgressBar: React.FC<{ end: number }> = ({ end }) => {
  const t = useCurrentFrame() / FPS;
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${(t / end) * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.amber})`, opacity: 0.85 }} />
  );
};
