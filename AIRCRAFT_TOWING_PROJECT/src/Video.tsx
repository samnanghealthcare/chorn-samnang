import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SHOTS} from './scenes/Shots';
import {EnterWrap} from './animations/Transition';
import {Subtitles} from './subtitles/Subtitles';
import {Hud} from './components/Hud';
import {Grain, Vignette} from './components/Base';
import {C, FPS} from './utils/theme';

const OVERLAP = 0.7; // seconds each shot stays under the next shot's entrance

export const Documentary: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      {SHOTS.map((s, i) => {
        const from = Math.round(s.from * FPS);
        const last = i === SHOTS.length - 1;
        const end = Math.round((last ? s.to : s.to + OVERLAP) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={end - from} name={`shot ${i + 1}`} premountFor={30}>
            <EnterWrap type={s.enter}>{s.el(s.to - s.from)}</EnterWrap>
          </Sequence>
        );
      })}
      <Vignette strength={0.55} />
      <Grain />
      <Hud />
      <Subtitles />
      {/* narration + ducked score + SFX, pre-mixed by tools/generate_audio.py */}
      <Audio src={staticFile('audio/final_mix.wav')} />
    </AbsoluteFill>
  );
};
