import { continueRender, delayRender, staticFile } from "remotion";

const faces: [string, string, string][] = [
  ["Kantumruy Pro", "kantumruy-pro-khmer-400-normal.woff2", "400"],
  ["Kantumruy Pro", "kantumruy-pro-khmer-500-normal.woff2", "500"],
  ["Kantumruy Pro", "kantumruy-pro-khmer-700-normal.woff2", "700"],
  ["Inter", "inter-latin-400-normal.woff2", "400"],
  ["Inter", "inter-latin-600-normal.woff2", "600"],
  ["Inter", "inter-latin-800-normal.woff2", "800"],
  ["Inter", "inter-latin-900-normal.woff2", "900"],
  ["JetBrains Mono", "jetbrains-mono-latin-400-normal.woff2", "400"],
  ["JetBrains Mono", "jetbrains-mono-latin-700-normal.woff2", "700"],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  Promise.all(
    faces.map(([family, file, weight]) => {
      const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight });
      document.fonts.add(f);
      return f.load();
    })
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
