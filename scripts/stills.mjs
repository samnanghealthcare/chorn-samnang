// Render preview stills at given seconds: node scripts/stills.mjs outDir 1.0 4.5 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [outDir, ...times] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "AviationDoc", browserExecutable });
for (const s of times) {
  const frame = Math.round(parseFloat(s) * 30);
  await renderStill({ serveUrl, composition, frame, output: `${outDir}/f_${s}.jpg`, imageFormat: "jpeg", browserExecutable, scale: 0.5, chromiumOptions: { gl: "swangle" } });
  console.log("still", s);
}
