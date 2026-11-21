import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../utils/theme';
import {easeInOut, easeOut} from '../utils/anim';
import type {Enter} from '../scenes/Shots';

const D = 16; // transition length in frames

/** Wraps a shot and animates its entrance over the previous (still visible) shot */
export const EnterWrap: React.FC<{type: Enter; children: React.ReactNode}> = ({type, children}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, D], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
  const po = interpolate(frame, [0, D], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
  let style: React.CSSProperties = {};
  let edge: React.ReactNode = null;
  switch (type) {
    case 'none':
      break;
    case 'fade':
      style = {opacity: p};
      break;
    case 'zoom':
      style = {opacity: p, transform: `scale(${1.12 - 0.12 * po})`, filter: `blur(${(1 - po) * 10}px)`};
      break;
    case 'blur':
      style = {opacity: p, filter: `blur(${(1 - p) * 24}px) brightness(${1 + (1 - p) * 0.6})`};
      break;
    case 'wipe': {
      const r = (1 - p) * 100;
      style = {clipPath: `inset(0 ${r}% 0 0)`};
      edge = p > 0 && p < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${100 - r}%`, width: 6, marginLeft: -3, background: C.gold, boxShadow: `0 0 30px ${C.gold}`}} /> : null;
      break;
    }
    case 'iris':
      style = {clipPath: `circle(${p * 120}% at 50% 50%)`};
      break;
    case 'slide':
      style = {transform: `translateX(${(1 - po) * 100}%)`, filter: `blur(${(1 - po) * 6}px)`};
      break;
    case 'grid': {
      // technical grid reveal: horizontal blueprint bands
      const bands = 6;
      const polys: string[] = [];
      for (let i = 0; i < bands; i++) {
        const local = Math.max(0, Math.min(1, p * 1.6 - i * 0.12));
        const y0 = (i / bands) * 100;
        const y1 = y0 + (100 / bands) * local;
        polys.push(`0% ${y0}%, 100% ${y0}%, 100% ${y1}%, 0% ${y1}%, 0% ${y0}%`);
      }
      style = p >= 1 ? {} : {clipPath: `polygon(evenodd, ${polys.join(', ')})`};
      break;
    }
  }
  return (
    <AbsoluteFill style={style}>
      {children}
      {edge}
    </AbsoluteFill>
  );
};
