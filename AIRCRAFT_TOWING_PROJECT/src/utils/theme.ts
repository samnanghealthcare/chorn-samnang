// Shared design tokens (colour palette from the production brief)
export const C = {
  navy: '#071B33',
  navyDeep: '#040F1F',
  blue: '#168BCE',
  cyan: '#35D4E8',
  gold: '#F5B82E',
  white: '#FFFFFF',
  line: 'rgba(53,212,232,0.55)',
  grid: 'rgba(22,139,206,0.16)',
  gridMajor: 'rgba(22,139,206,0.30)',
};

export const FONT = {
  khmer: '"Kantumruy Pro", "Noto Sans Khmer", sans-serif',
  title: 'Inter, "Kantumruy Pro", sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** seconds -> frames */
export const f = (s: number) => Math.round(s * FPS);
