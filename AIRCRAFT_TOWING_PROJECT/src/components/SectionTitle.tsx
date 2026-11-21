import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../utils/theme';
import {easeOut, prog} from '../utils/anim';
import {BlueprintGrid, KenBurns, LightSweep} from './Base';
import {LetterReveal} from './Text';

/** chapter card for each towing purpose: big outlined number + title reveal */
export const SectionTitle: React.FC<{num: number; title: string; kh: string; bg: string; durS: number; icon?: React.ReactNode}> = ({num, title, kh, bg, durS, icon}) => {
  const frame = useCurrentFrame();
  const pNum = prog(frame, 0.0, 0.7, easeOut);
  const line = prog(frame, 0.25, 0.8, easeOut);
  const kp = prog(frame, 0.7, 0.5, easeOut);
  const zoom = interpolate(frame, [0, durS * 30], [1, 1.06]);
  return (
    <AbsoluteFill>
      <KenBurns src={bg} durS={durS} kb={{s0: 1.12, s1: 1.2}} dark={0.75} blur={3} />
      <BlueprintGrid opacity={0.5} />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <div style={{position: 'absolute', left: 150, top: 250, opacity: pNum, transform: `translateX(${(1 - pNum) * -60}px)`}}>
          <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 360, lineHeight: 1, color: 'transparent', WebkitTextStroke: `4px ${C.gold}`, letterSpacing: -6}}>
            {String(num).padStart(2, '0')}
          </div>
        </div>
        <div style={{position: 'absolute', left: 620, top: 330}}>
          <div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 8, color: C.cyan, opacity: line}}>PURPOSE {String(num).padStart(2, '0')} / 05</div>
          <div style={{height: 4, width: 980 * line, background: `linear-gradient(90deg, ${C.gold}, rgba(245,184,46,0))`, margin: '16px 0 26px'}} />
          <LetterReveal text={title} atS={0.35} size={112} spacing={3} stagger={0.03} />
          <div style={{fontFamily: FONT.khmer, fontWeight: 700, fontSize: 50, color: C.white, marginTop: 22, opacity: kp, transform: `translateY(${(1 - kp) * 20}px)`, lineHeight: 1.6}}>{kh}</div>
        </div>
        {icon && (
          <div style={{position: 'absolute', right: 150, top: 300, opacity: kp, transform: `scale(${0.8 + 0.2 * kp})`}}>{icon}</div>
        )}
      </AbsoluteFill>
      <LightSweep atS={0.4} durS={1.3} opacity={0.35} />
    </AbsoluteFill>
  );
};
