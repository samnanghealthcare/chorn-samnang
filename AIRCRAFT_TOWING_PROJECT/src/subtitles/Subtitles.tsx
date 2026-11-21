import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CUES} from '../data/subtitles';
import {C, FONT, FPS} from '../utils/theme';

const LATIN = /([A-Za-z]+(?:[ -][A-Za-z]+)*)/g;

/** Khmer subtitle with English technical terms highlighted */
const Line: React.FC<{text: string}> = ({text}) => {
  const parts = text.split(LATIN);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{fontFamily: FONT.title, fontWeight: 700, color: C.cyan, letterSpacing: 0.3}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cue = CUES.find((c) => t >= c.start - 0.05 && t < c.end + 0.25);
  // band opacity: visible while any cue is near
  const band = CUES.some((c) => t >= c.start - 0.3 && t < c.end + 0.6) ? 1 : 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{opacity: band * 0.9, background: 'linear-gradient(180deg, rgba(4,15,31,0) 72%, rgba(4,15,31,0.55) 86%, rgba(4,15,31,0.8) 100%)'}} />
      {cue && (
        <div
          style={{
            position: 'absolute', left: 160, right: 160, bottom: 46, textAlign: 'center',
            opacity: interpolate(t, [cue.start - 0.05, cue.start + 0.12, cue.end + 0.1, cue.end + 0.25], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            transform: `translateY(${interpolate(t, [cue.start - 0.05, cue.start + 0.2], [10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT.khmer, fontWeight: 500, fontSize: 42, lineHeight: 1.75, color: C.white,
              textShadow: '0 2px 3px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.6)',
            }}
          >
            <Line text={cue.text} />
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
