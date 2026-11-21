// Local asset slots (all files live in /public; see ASSET_SOURCES.txt for origin + licence)
export const A = {
  vidPushback1: 'assets/videos/ber_pushback_01.mp4',
  vidPushback2: 'assets/videos/ber_pushback_02.mp4',
  vidMaint: 'assets/videos/maint_100mxs.mp4',
  imgTug: 'assets/images/tug_gameco.jpg',
  imgTug2: 'assets/images/tug_norwich.jpg',
  imgTowbar: 'assets/images/towbar_marine.jpg',
  imgHangar: 'assets/images/hangar.jpg',
  imgApron: 'assets/aircraft/a320_apron.jpg',
  imgGate: 'assets/images/gate.jpg',
  imgParked: 'assets/images/apron_parked.jpg',
  imgSunset: 'assets/backgrounds/sunset.jpg',
  imgEngine: 'assets/engines/engine.jpg',
  imgNlg: 'assets/aircraft/nlg.jpg',
};

// Which real media files are present locally (written by tools/check_assets.py).
import available from './available.json';
export const AVAILABLE = new Set<string>(available as string[]);

// Illustrated fallback subject for each slot (used when the real file is not available)
export const SUBJECT: Record<string, 'tug' | 'hangar' | 'aircraft' | 'gate' | 'sunset' | 'engine' | 'pushback' | 'maintenance'> = {
  [A.vidPushback1]: 'pushback',
  [A.vidPushback2]: 'aircraft',
  [A.vidMaint]: 'maintenance',
  [A.imgTug]: 'tug',
  [A.imgTug2]: 'tug',
  [A.imgTowbar]: 'tug',
  [A.imgHangar]: 'hangar',
  [A.imgApron]: 'aircraft',
  [A.imgGate]: 'gate',
  [A.imgParked]: 'aircraft',
  [A.imgSunset]: 'sunset',
  [A.imgEngine]: 'engine',
  [A.imgNlg]: 'tug',
};
