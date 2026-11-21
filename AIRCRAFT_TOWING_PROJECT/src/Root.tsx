import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Documentary} from './Video';
import timeline from './data/timeline.json';
import {FPS, H, W} from './utils/theme';

// Load the font files shipped in /public/assets/fonts before any frame renders
const FONTS: [string, string, string][] = [
  ['Kantumruy Pro', 'kantumruy-pro-khmer-400-normal.woff2', '400'],
  ['Kantumruy Pro', 'kantumruy-pro-khmer-500-normal.woff2', '500'],
  ['Kantumruy Pro', 'kantumruy-pro-khmer-700-normal.woff2', '700'],
  ['Kantumruy Pro', 'kantumruy-pro-latin-400-normal.woff2', '400'],
  ['Kantumruy Pro', 'kantumruy-pro-latin-700-normal.woff2', '700'],
  ['Inter', 'inter-latin-400-normal.woff2', '400'],
  ['Inter', 'inter-latin-600-normal.woff2', '600'],
  ['Inter', 'inter-latin-800-normal.woff2', '800'],
  ['Inter', 'inter-latin-900-normal.woff2', '900'],
  ['JetBrains Mono', 'jetbrains-mono-latin-400-normal.woff2', '400'],
  ['JetBrains Mono', 'jetbrains-mono-latin-600-normal.woff2', '600'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(
    FONTS.map(([family, file, weight]) => {
      const ff = new FontFace(family, `url(${staticFile(`assets/fonts/${file}`)}) format('woff2')`, {weight, unicodeRange: file.includes('khmer') ? 'U+1780-17FF, U+19E0-19FF, U+200B-200D, U+25CC' : undefined});
      return ff.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const Root: React.FC = () => (
  <Composition id="AircraftTowing" component={Documentary} durationInFrames={Math.round(timeline.duration * FPS)} fps={FPS} width={W} height={H} />
);
