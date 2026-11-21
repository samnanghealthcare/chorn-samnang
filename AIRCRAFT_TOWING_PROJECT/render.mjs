// Render script.
//   node render.mjs                       -> output/AIRCRAFT_TOWING_DOCUMENTARY.mp4 (full quality)
//   node render.mjs --preview             -> output/AIRCRAFT_TOWING_PREVIEW.mp4 (960x540)
//   node render.mjs --stills 300,1200 dir -> JPEG stills of the given frames (QC)
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const root = path.dirname(new URL(import.meta.url).pathname);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const args = process.argv.slice(2);

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: 'AircraftTowing', browserExecutable});

if (args[0] === '--stills') {
  const frames = args[1].split(',').map(Number);
  const dir = args[2] ?? path.join(root, 'output/stills');
  fs.mkdirSync(dir, {recursive: true});
  for (const frame of frames) {
    const output = path.join(dir, `f${String(frame).padStart(5, '0')}.jpg`);
    await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 85, scale: Number(process.env.SCALE ?? 0.5), browserExecutable});
    console.log('still', output);
  }
  process.exit(0);
}

const preview = args.includes('--preview');
const outName = preview ? 'AIRCRAFT_TOWING_PREVIEW.mp4' : 'AIRCRAFT_TOWING_DOCUMENTARY.mp4';
const outputLocation = path.join(root, 'output', outName);
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: 'h264',
  audioCodec: 'aac',
  audioBitrate: '256k',
  crf: preview ? 26 : 19,
  x264Preset: preview ? 'veryfast' : 'medium',
  pixelFormat: 'yuv420p',
  scale: preview ? 0.5 : 1,
  imageFormat: 'jpeg',
  jpegQuality: preview ? 80 : 94,
  concurrency: Number(process.env.CONC ?? Math.max(1, os.cpus().length)),
  outputLocation,
  browserExecutable,
  chromiumOptions: {gl: 'swiftshader'},
  onProgress: ({progress, renderedFrames, encodedFrames}) => {
    const pct = Math.floor(progress * 100);
    if (pct !== last) {
      last = pct;
      console.log(`${pct}%  rendered ${renderedFrames}  encoded ${encodedFrames}`);
    }
  },
});
console.log('DONE', outputLocation);
