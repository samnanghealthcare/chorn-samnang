import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, FPS} from '../utils/theme';
import {easeOut, prog} from '../utils/anim';

/** letter-by-letter reveal (English titles) */
export const LetterReveal: React.FC<{text: string; atS: number; size: number; color?: string; weight?: number; spacing?: number; stagger?: number; style?: React.CSSProperties}> = ({text, atS, size, color = C.white, weight = 900, spacing = 4, stagger = 0.035, style}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{fontFamily: FONT.title, fontWeight: weight, fontSize: size, letterSpacing: spacing, color, whiteSpace: 'pre', lineHeight: 1.05, ...style}}>
      {text.split('').map((ch, i) => {
        const p = prog(frame, atS + i * stagger, 0.5, easeOut);
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 8}px)`}}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** word-by-word kinetic line */
export const WordReveal: React.FC<{text: string; atS: number; size: number; color?: string; weight?: number; stagger?: number; highlight?: string[]; font?: string; style?: React.CSSProperties}> = ({text, atS, size, color = C.white, weight = 800, stagger = 0.12, highlight = [], font = FONT.title, style}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{fontFamily: font, fontWeight: weight, fontSize: size, color, lineHeight: 1.15, ...style}}>
      {text.split(' ').map((w, i) => {
        const p = prog(frame, atS + i * stagger, 0.45, easeOut);
        const hl = highlight.includes(w.replace(/[^A-Za-z?]/g, ''));
        return (
          <span key={i} style={{display: 'inline-block', marginRight: size * 0.28, opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${0.96 + 0.04 * p})`, color: hl ? C.gold : undefined}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** technical callout: dot + leader line + label box */
export const TechLabel: React.FC<{x: number; y: number; dx?: number; dy?: number; atS: number; title: string; sub?: string; color?: string; size?: number; align?: 'left' | 'right'}> = ({x, y, dx = 120, dy = -80, atS, title, sub, color = C.cyan, size = 26, align}) => {
  const frame = useCurrentFrame();
  const p1 = prog(frame, atS, 0.35);
  const p2 = prog(frame, atS + 0.25, 0.4);
  const p3 = prog(frame, atS + 0.45, 0.45, easeOut);
  if (p1 <= 0) return null;
  const ex = x + dx * p2;
  const ey = y + dy * p2;
  const right = align ? align === 'right' : dx >= 0;
  const pulse = 1 + 0.25 * Math.sin((frame / FPS) * 5);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <circle cx={x} cy={y} r={7 * p1} fill={color} />
        <circle cx={x} cy={y} r={16 * p1 * pulse} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
        <polyline points={`${x},${y} ${ex},${ey} ${ex + (right ? 1 : -1) * 40 * p2},${ey}`} fill="none" stroke={color} strokeWidth={2.5} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: right ? ex + 48 : undefined,
          right: right ? undefined : 1920 - (ex - 48),
          top: ey - size * 0.95,
          opacity: p3,
          transform: `translateX(${(1 - p3) * (right ? -20 : 20)}px)`,
          textAlign: right ? 'left' : 'right',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{display: 'inline-block', fontFamily: FONT.mono, fontWeight: 600, fontSize: size, color: C.white, letterSpacing: 1.5, padding: '6px 14px', background: 'rgba(7,27,51,0.82)', border: `1.5px solid ${color}`, borderLeft: right ? `6px solid ${color}` : undefined, borderRight: right ? undefined : `6px solid ${color}`}}>
          {title}
        </div>
        {sub && <div style={{fontFamily: FONT.khmer, fontSize: size * 0.8, color: 'rgba(255,255,255,0.85)', marginTop: 6, textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{sub}</div>}
      </div>
    </>
  );
};

/** small tag (top-left of shot) */
export const Tag: React.FC<{text: string; atS?: number; x?: number; y?: number; color?: string}> = ({text, atS = 0.2, x = 90, y = 150, color = C.gold}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.5, easeOut);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 10, height: 34, background: color}} />
      <div style={{fontFamily: FONT.mono, fontSize: 24, fontWeight: 600, letterSpacing: 3, color: C.white, textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{text}</div>
    </div>
  );
};

/** big lower-left headline used over photography */
export const Headline: React.FC<{atS: number; title: string; kh?: string; x?: number; y?: number; size?: number; color?: string}> = ({atS, title, kh, x = 90, y = 640, size = 78, color = C.white}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.6, easeOut);
  const bar = prog(frame, atS, 0.5);
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <div style={{width: 160 * bar, height: 6, background: C.gold, marginBottom: 18}} />
      <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: size, color, letterSpacing: 2, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>{title}</div>
      {kh && <div style={{fontFamily: FONT.khmer, fontWeight: 500, fontSize: size * 0.42, color: C.cyan, marginTop: 10, opacity: prog(frame, atS + 0.3, 0.5), lineHeight: 1.6}}>{kh}</div>}
    </div>
  );
};

/** animated number counter */
export const Counter: React.FC<{from: number; to: number; atS: number; durS: number; size: number; color?: string; pad?: number}> = ({from, to, atS, durS, size, color = C.gold, pad = 2}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(prog(frame, atS, durS, easeOut), [0, 1], [from, to]));
  return <span style={{fontFamily: FONT.title, fontWeight: 900, fontSize: size, color, fontVariantNumeric: 'tabular-nums'}}>{String(v).padStart(pad, '0')}</span>;
};

export const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...style}}>{children}</AbsoluteFill>
);
