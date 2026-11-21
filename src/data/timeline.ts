/** Scene boundaries in seconds of the voice-over. Cut points sit in the natural pauses of the narration. */
export const END = 142.5; // 140.2 s narration + outro tail
export const SCENES = {
  hook: [0, 11.6],
  ataSystem: [11.6, 26.5],
  ata20: [26.5, 35.2],
  practices: [35.2, 44.85],
  manual: [44.85, 50.62],
  ata06: [50.62, 60.4],
  dims: [60.4, 66.95],
  drawings: [66.95, 74.35],
  zones: [74.35, 81.7],
  stations: [81.7, 89.9],
  locate: [89.9, 97.42],
  wing: [97.42, 108.35],
  apply: [108.35, 119.45],
  summary: [119.45, 135.8],
  outro: [135.8, END],
} as const;
export type SceneKey = keyof typeof SCENES;
