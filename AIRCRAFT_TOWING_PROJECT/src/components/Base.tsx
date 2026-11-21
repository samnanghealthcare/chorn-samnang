import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../utils/theme';
import {easeInOut, prog} from '../utils/anim';

/* ---------- technical grid background ---------- */
export const BlueprintGrid: React.FC<{opacity?: number; drift?: boolean; color?: string}> = ({opacity = 1, drift = true, color}) => {
  const frame = useCurrentFrame();
  const off = drift ? (frame * 0.4) % 120 : 0;
  const minor = color ?? C.grid;
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `linear-gradient(${C.gridMajor} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.gridMajor} 1.5px, transparent 1.5px), linear-gradient(${minor} 1px, transparent 1px), linear-gradient(90deg, ${minor} 1px, transparent 1px)`,
        backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
        backgroundPosition: `${off}px ${off * 0.5}px`,
      }}
    />
  );
};

export const NavyBg: React.FC<{children?: React.ReactNode; grid?: boolean}> = ({children, grid = true}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0B2A4D 0%, ${C.navy} 55%, ${C.navyDeep} 100%)`}}>
    {grid && <BlueprintGrid />}
    {children}
  </AbsoluteFill>
);

/* ---------- cinematic finishing layers ---------- */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(2,8,18,${strength}) 100%)`}} />
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = (frame * 137) % 512;
  const y = (frame * 251) % 512;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.07,
        mixBlendMode: 'overlay',
        backgroundImage: `url(${staticFile('graphics/grain.png')})`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
};

/** navy/teal colour grade over photography so everything matches the palette */
export const Grade: React.FC<{dark?: number; bottom?: boolean}> = ({dark = 0.35, bottom = true}) => (
  <>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,27,51,${dark * 0.6}) 0%, rgba(7,27,51,${dark * 0.2}) 40%, rgba(4,15,31,${bottom ? dark + 0.35 : dark}) 100%)`}} />
    <AbsoluteFill style={{background: 'rgba(22,139,206,0.08)', mixBlendMode: 'color'}} />
  </>
);

/* ---------- Ken Burns photo ---------- */
export type KB = {s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number};
export const KenBurns: React.FC<{src: string; durS: number; kb?: KB; dark?: number; blur?: number; position?: string}> = ({src, durS, kb = {}, dark = 0.35, blur = 0, position = 'center'}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, durS + 0.6, easeInOut);
  const s = interpolate(p, [0, 1], [kb.s0 ?? 1.04, kb.s1 ?? 1.14]);
  const x = interpolate(p, [0, 1], [kb.x0 ?? 0, kb.x1 ?? 0]);
  const y = interpolate(p, [0, 1], [kb.y0 ?? 0, kb.y1 ?? 0]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.navyDeep}}>
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `translate(${x}px, ${y}px) scale(${s})`, filter: `saturate(0.85) contrast(1.06) ${blur ? `blur(${blur}px)` : ''}`}}
      />
      <Grade dark={dark} />
    </AbsoluteFill>
  );
};

/* ---------- real video background ---------- */
export const VideoBg: React.FC<{src: string; trimS?: number; durS: number; rate?: number; zoom?: [number, number]; dark?: number; position?: string}> = ({src, trimS = 0, durS, rate = 1, zoom = [1.02, 1.1], dark = 0.3, position = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = interpolate(frame / fps, [0, durS + 0.6], zoom, {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.navyDeep}}>
      <OffthreadVideo
        src={staticFile(src)}
        trimBefore={Math.round(trimS * fps)}
        playbackRate={rate}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${s})`, filter: 'saturate(0.85) contrast(1.05)'}}
      />
      <Grade dark={dark} />
    </AbsoluteFill>
  );
};

/* ---------- light sweep ---------- */
export const LightSweep: React.FC<{atS: number; durS?: number; angle?: number; opacity?: number}> = ({atS, durS = 1.1, angle = 20, opacity = 0.5}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, durS, easeInOut);
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', mixBlendMode: 'screen'}}>
      <div
        style={{
          position: 'absolute', top: -400, left: interpolate(p, [0, 1], [-900, 2300]), width: 380, height: 1900,
          transform: `rotate(${angle}deg)`, opacity,
          background: 'linear-gradient(90deg, rgba(53,212,232,0) 0%, rgba(160,240,255,0.55) 50%, rgba(53,212,232,0) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- small caption: source / illustration disclaimer ---------- */
export const Credit: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', right: 40, top: 104, maxWidth: 760, textAlign: 'right', fontFamily: FONT.mono, fontSize: 14, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4, textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>{text}</div>
);
