import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, FPS} from '../utils/theme';
import {BlueprintGrid} from '../components/Base';
import {A320Side, TugSide} from './Aircraft';
import {Turbofan} from './Turbofan';

/*
 * Illustrated (non-photographic) backgrounds used when a licensed photo / video
 * is not available locally. Schematic technical illustrations in the house style.
 */
export type Subject = 'tug' | 'hangar' | 'aircraft' | 'gate' | 'sunset' | 'engine' | 'pushback' | 'maintenance';

// A320Side drawing units: NLG at x=172, ground y=350. Tug drawn at 0.59 scale (≈ 7 m long).
const TugAtNose: React.FC<{gap?: number}> = ({gap = 40}) => {
  const k = 0.59;
  const tx = 172 - 16 - gap - 352 * k;
  return (
    <g>
      <line x1={tx + 352 * k} y1={350 - 120 * k + 48 * k} x2={162} y2={334} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
      <g transform={`translate(${tx},${350 - 120 * k}) scale(${k})`}>
        <TugSide progress={1} color="#E8F6FF" />
      </g>
    </g>
  );
};

const Apron: React.FC<{y: number}> = ({y}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <linearGradient id="apr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0E2B4A" />
        <stop offset="1" stopColor="#040F1F" />
      </linearGradient>
    </defs>
    <rect x={0} y={y} width={1920} height={1080 - y} fill="url(#apr)" />
    <line x1={0} y1={y} x2={1920} y2={y} stroke="rgba(53,212,232,0.5)" strokeWidth={2} />
    {Array.from({length: 12}).map((_, i) => (
      <line key={i} x1={960 + (i - 6) * 60} y1={y} x2={960 + (i - 6) * 420} y2={1080} stroke="rgba(53,212,232,0.12)" strokeWidth={1.5} />
    ))}
    <line x1={0} y1={y + 70} x2={1920} y2={y + 70} stroke="rgba(245,184,46,0.6)" strokeWidth={4} strokeDasharray="40 26" />
  </svg>
);

/** aircraft side view placed so its ground line sits at screen y=groundY */
const Plane: React.FC<{width: number; x: number; groundY: number; children?: React.ReactNode; color?: string; bodyFill?: string; glow?: boolean}> = ({width, x, groundY, children, color, bodyFill, glow}) => {
  const k = width / 1130;
  return (
    <div style={{position: 'absolute', left: x, top: groundY - 350 * k}}>
      <A320Side progress={1} showDims={false} width={width} color={color} bodyFill={bodyFill ?? 'rgba(11,42,77,0.85)'} glow={glow}>
        {children}
      </A320Side>
    </div>
  );
};

export const Illustrated: React.FC<{subject: Subject; durS: number; dark?: number}> = ({subject, durS, dark = 0.35}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = Math.min(1, t / Math.max(1, durS + 0.6));
  const zoom = interpolate(p, [0, 1], [1.0, 1.07]);
  let body: React.ReactNode = null;

  switch (subject) {
    case 'tug':
      body = (
        <>
          <Apron y={860} />
          <Plane width={2900} x={interpolate(p, [0, 1], [560, 520])} groundY={860}>
            <TugAtNose gap={36} />
          </Plane>
        </>
      );
      break;
    case 'pushback': {
      const move = interpolate(p, [0, 1], [-160, 220]);
      body = (
        <>
          <Apron y={840} />
          <Plane width={1900} x={260 + move} groundY={840}>
            <TugAtNose gap={30} />
          </Plane>
          <div style={{position: 'absolute', left: 260 + move + 380, top: 905, fontFamily: FONT.mono, fontSize: 22, color: 'rgba(255,255,255,0.55)', letterSpacing: 4}}>◀ NOSE · ▶ MOVING TAIL-FIRST</div>
        </>
      );
      break;
    }
    case 'hangar':
    case 'maintenance': {
      const scan = (t * 0.25) % 1;
      body = (
        <>
          <Apron y={880} />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M120,880 L120,420 Q960,60 1800,420 L1800,880" fill="rgba(22,139,206,0.06)" stroke="#BFE9F5" strokeWidth={4} />
            {Array.from({length: 9}).map((_, i) => {
              const x = 220 + i * 185;
              return <line key={i} x1={x} y1={880} x2={x} y2={300 - Math.sin((i / 8) * Math.PI) * 120 + 120} stroke="rgba(53,212,232,0.18)" strokeWidth={2} />;
            })}
            {Array.from({length: 6}).map((_, i) => (
              <circle key={i} cx={420 + i * 216} cy={330 - Math.sin(((i + 0.5) / 6) * Math.PI) * 70} r={9} fill={C.gold} opacity={0.85} />
            ))}
            {subject === 'maintenance' && <rect x={120 + scan * 1680} y={300} width={6} height={580} fill={C.cyan} opacity={0.5} />}
          </svg>
          <Plane width={1500} x={200} groundY={880} />
          {subject === 'maintenance' &&
            [600, 1180, 1420].map((x, i) => (
              <svg key={i} width={40} height={110} style={{position: 'absolute', left: x, top: 770}} viewBox="0 0 40 110">
                <circle cx={20} cy={12} r={10} fill={C.gold} />
                <path d="M8,30 L32,30 L30,70 L10,70 Z M10,70 L8,108 M30,70 L32,108" stroke={C.gold} strokeWidth={6} fill={C.gold} />
              </svg>
            ))}
        </>
      );
      break;
    }
    case 'aircraft':
      body = (
        <>
          <Apron y={840} />
          <Plane width={1750} x={interpolate(p, [0, 1], [120, 60])} groundY={840} />
        </>
      );
      break;
    case 'gate':
      body = (
        <>
          <Apron y={840} />
          <div style={{position: 'absolute', left: 0, top: 260, width: 360, height: 580, background: 'linear-gradient(90deg,#123A63,#0B2A4D)', borderRight: `3px solid ${C.cyan}`}}>
            <div style={{fontFamily: FONT.mono, fontSize: 26, color: C.white, letterSpacing: 8, padding: 30}}>TERMINAL</div>
          </div>
          <div style={{position: 'absolute', left: 360, top: 430, width: 300, height: 60, background: 'rgba(42,93,140,0.9)', border: `2px solid ${C.cyan}`}} />
          <Plane width={1700} x={540} groundY={840} />
        </>
      );
      break;
    case 'sunset':
      body = (
        <>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #0B1E3A 0%, #3B2A55 38%, #C46A3A 66%, #F5B82E 78%, #1A1420 79%, #040F1F 100%)'}} />
          <div style={{position: 'absolute', left: 1240, top: 610, width: 240, height: 240, borderRadius: 120, background: 'radial-gradient(circle, #FFE7A8 0%, #F5B82E 45%, rgba(245,184,46,0) 72%)'}} />
          <Plane width={1500} x={interpolate(p, [0, 1], [180, 140])} groundY={860} color="#1A2233" bodyFill="#0A0E18" glow={false} />
        </>
      );
      break;
    case 'engine':
      body = (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <Turbofan explode={0} xray={0.8} labels={0} rotY={-30 + p * 20} />
        </AbsoluteFill>
      );
      break;
  }

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0B2A4D 0%, ${C.navy} 55%, ${C.navyDeep} 100%)`, overflow: 'hidden'}}>
      {subject !== 'sunset' && <BlueprintGrid opacity={0.7} />}
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>{body}</AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,15,31,0.25) 0%, rgba(4,15,31,0) 40%, rgba(4,15,31,0.35) 100%)'}} />
      <AbsoluteFill style={{background: `rgba(4,15,31,${Math.max(0, Math.min(0.75, (dark - 0.25) * 1.25))})`}} />
      <div style={{position: 'absolute', left: 56, bottom: 150, fontFamily: FONT.mono, fontSize: 15, color: 'rgba(255,255,255,0.5)', letterSpacing: 1}}>ILLUSTRATION · SCHEMATIC</div>
    </AbsoluteFill>
  );
};
