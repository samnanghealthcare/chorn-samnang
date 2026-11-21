import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { easeInOut, prog, SceneStart, useT } from "../animations/anim";
import { sec } from "../styles/theme";

const XF = 0.5; // cross-dissolve length (s)

/** Cinematic in/out transition: dissolve + zoom + motion-blur style blur. */
const Transition: React.FC<{ a: number; b: number; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ a, b, first, last, children }) => {
  const t = useT();
  const pin = first ? 1 : prog(t, a - XF, XF + 0.25, easeInOut);
  const pout = last ? 0 : prog(t, b - 0.05, XF, easeInOut);
  const scale = (1 + (1 - pin) * 0.06) * (1 + pout * 0.05);
  const blur = (1 - pin) * 10 + pout * 12;
  return (
    <AbsoluteFill style={{ opacity: pin * (1 - pout), transform: `scale(${scale})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

/** Places a scene on the master timeline (absolute seconds) with a short overlap for dissolves. */
export const Scene: React.FC<{ a: number; b: number; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ a, b, first, last, children }) => {
  const from = first ? 0 : a - XF;
  const to = last ? b : b + XF;
  return (
    <Sequence from={sec(from)} durationInFrames={sec(to - from)} layout="none">
      <SceneStart.Provider value={from}>
        <Transition a={a} b={b} first={first} last={last}>{children}</Transition>
      </SceneStart.Provider>
    </Sequence>
  );
};
