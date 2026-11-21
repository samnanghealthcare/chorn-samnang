import React, { createContext, useContext } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "../styles/theme";

/** Each scene publishes its absolute start time so cues can be written in narration seconds. */
export const SceneStart = createContext(0);
export const useT = () => {
  const frame = useCurrentFrame();
  const start = useContext(SceneStart);
  return start + frame / FPS;
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0..1 progress of an animation that starts at absolute time `at` and lasts `dur` seconds. */
export const prog = (t: number, at: number, dur = 0.6, easing = easeOut) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Fade in at `a`, fade out ending at `b`. */
export const inOut = (t: number, a: number, b: number, fi = 0.5, fo = 0.5) =>
  Math.min(prog(t, a, fi), 1 - prog(t, b - fo, fo, easeInOut));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const h = React.createElement;
