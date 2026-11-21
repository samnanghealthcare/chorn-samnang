import React, { useContext } from "react";
import { Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { easeInOut, lerp, prog, SceneStart, useT } from "../animations/anim";
import { sec } from "../styles/theme";

type Move = { s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number; r0?: number; r1?: number };

/** Cinematic camera move (zoom / pan / tilt) applied to a photo between absolute times a..b. */
export const KenBurns: React.FC<
  Move & { src: string; a: number; b: number; filter?: string; style?: React.CSSProperties; fit?: "cover" | "contain"; pos?: string }
> = ({ src, a, b, s0 = 1.05, s1 = 1.18, x0 = 0, x1 = 0, y0 = 0, y1 = 0, r0 = 0, r1 = 0, filter, style, fit = "cover", pos = "center" }) => {
  const t = useT();
  const p = prog(t, a, b - a, easeInOut);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%", objectFit: fit, objectPosition: pos, filter,
          transform: `translate(${lerp(x0, x1, p)}px, ${lerp(y0, y1, p)}px) scale(${lerp(s0, s1, p)}) rotate(${lerp(r0, r1, p)}deg)`,
        }}
      />
    </div>
  );
};

/** Real footage background with a slow push-in. */
export const Footage: React.FC<Move & { src: string; a: number; b: number; startFrom?: number; filter?: string; rate?: number }> = ({
  src, a, b, s0 = 1.02, s1 = 1.1, x0 = 0, x1 = 0, y0 = 0, y1 = 0, startFrom = 0, filter, rate = 1,
}) => {
  const t = useT();
  const start = useContext(SceneStart);
  const p = prog(t, a, b - a, easeInOut);
  // the clip starts playing at absolute time `a`, not when the parent scene starts
  return (
    <Sequence from={Math.max(0, sec(a - start))} layout="none">
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        startFrom={startFrom}
        playbackRate={rate}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter, transform: `translate(${lerp(x0, x1, p)}px, ${lerp(y0, y1, p)}px) scale(${lerp(s0, s1, p)})` }}
      />
    </div>
    </Sequence>
  );
};
