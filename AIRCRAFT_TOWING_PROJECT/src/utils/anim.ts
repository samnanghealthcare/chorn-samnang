import {Easing, interpolate} from 'remotion';
import {FPS} from './theme';

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0..1 progress between two times (seconds) for the given local frame. */
export const prog = (frame: number, startS: number, durS: number, ease = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(frame / FPS, [startS, startS + durS], [0, 1], {...clampOpts, easing: ease});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** fade in at start, optional fade out at end (seconds, local) */
export const fadeInOut = (frame: number, inS: number, inDur: number, outS?: number, outDur = 0.4) => {
  const t = frame / FPS;
  let o = interpolate(t, [inS, inS + inDur], [0, 1], clampOpts);
  if (outS !== undefined) o *= interpolate(t, [outS, outS + outDur], [1, 0], clampOpts);
  return o;
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
