import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import timeline from '../data/timeline.json';
import {C, FONT, FPS} from '../utils/theme';

const PURPOSE_SCENES: Record<string, number> = {S03: 1, S04: 2, S05: 3, S06: 4, S07: 5};

/** persistent documentary HUD: series label (top-left) + purpose chip (top-right) + progress */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const scene = timeline.scenes.find((s) => t >= s.start && t < s.end) ?? timeline.scenes[timeline.scenes.length - 1];
  const show = interpolate(t, [7.2, 8.2, 203.6, 204.4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const purpose = PURPOSE_SCENES[scene.id];
  const chipIn = purpose ? interpolate(t, [scene.start + 2.6, scene.start + 3.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const total = timeline.duration;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: show}}>
      <div style={{position: 'absolute', left: 56, top: 44, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 4, height: 40, background: C.cyan}} />
        <div>
          <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: 4, color: 'rgba(255,255,255,0.7)'}}>AIRCRAFT GENERAL PRACTICES</div>
          <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 21, letterSpacing: 3, color: C.white}}>AIRCRAFT TOWING</div>
        </div>
      </div>
      {purpose && (
        <div style={{position: 'absolute', right: 56, top: 44, opacity: chipIn, display: 'flex', alignItems: 'center', gap: 14, transform: `translateY(${(1 - chipIn) * -12}px)`}}>
          <div style={{display: 'flex', gap: 6}}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{width: 26, height: 6, background: i === purpose ? C.gold : i < purpose ? C.cyan : 'rgba(255,255,255,0.25)'}} />
            ))}
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 18, fontWeight: 600, color: C.white, letterSpacing: 2, padding: '5px 12px', border: `1.5px solid ${C.gold}`, background: 'rgba(7,27,51,0.7)'}}>
            PURPOSE {String(purpose).padStart(2, '0')}/05
          </div>
        </div>
      )}
      {/* thin progress line */}
      <div style={{position: 'absolute', left: 0, top: 0, height: 3, width: `${(t / total) * 100}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, opacity: 0.8}} />
    </AbsoluteFill>
  );
};
