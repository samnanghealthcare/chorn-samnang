import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PlaneTop, TugTop} from '../graphics/Aircraft';
import {C, FONT, FPS} from '../utils/theme';
import {buildRoute, pointAt, Pt, Route} from '../utils/path';
import {easeInOut, prog} from '../utils/anim';
import {BlueprintGrid} from '../components/Base';

/*
 * Schematic airport layout (top-down). This is a generic illustrative layout,
 * NOT the map of any real airport.
 */
export const GATES = [420, 660, 900, 1140].map((x, i) => ({id: `G${i + 1}`, x, y: 318}));
export const STANDS = [360, 560, 760, 960].map((x, i) => ({id: `P${i + 1}`, x, y: 790}));
export const TAXI_Y = 622;
export const HANGAR = {x: 1590, y: 110, w: 280, h: 360};
export const INSPECT = {x: 1240, y: 700, w: 280, h: 170};

export const ROUTES: Record<string, Pt[]> = {
  hangarIn: [{x: 1100, y: TAXI_Y}, {x: 1730, y: TAXI_Y}, {x: 1730, y: 290}],
  maintenance: [{x: 360, y: 790}, {x: 360, y: TAXI_Y}, {x: 1380, y: TAXI_Y}, {x: 1380, y: 790}],
  parking: [{x: 120, y: TAXI_Y}, {x: 760, y: TAXI_Y}, {x: 760, y: 790}],
  reposition: [{x: 960, y: 790}, {x: 960, y: TAXI_Y}, {x: 1380, y: TAXI_Y}, {x: 1380, y: 410}],
  pushback: [{x: 660, y: 318}, {x: 660, y: 540}, {x: 760, y: TAXI_Y}, {x: 860, y: TAXI_Y}],
  taxi: [{x: 860, y: TAXI_Y}, {x: 150, y: TAXI_Y}, {x: 150, y: 950}],
};

const routeCache: Record<string, Route> = {};
export const route = (k: string) => (routeCache[k] ??= buildRoute(ROUTES[k], 70));

export type Mover = {
  route: string; // key of ROUTES
  t: number; // 0..1 along route
  reverse?: boolean; // aircraft moves tail-first (pushback)
  tug?: boolean;
  color?: string;
};

const Layout: React.FC<{highlight?: string[]; hl: number}> = ({highlight = [], hl}) => {
  const frame = useCurrentFrame();
  const glow = 0.55 + 0.45 * Math.sin((frame / FPS) * 4);
  const isHl = (id: string) => highlight.includes(id);
  return (
    <g fontFamily={FONT.mono}>
      {/* runway */}
      <rect x={60} y={900} width={1800} height={100} fill="#0A1626" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      {Array.from({length: 26}).map((_, i) => (
        <rect key={i} x={140 + i * 64} y={947} width={36} height={6} fill="rgba(255,255,255,0.55)" />
      ))}
      <text x={1700} y={985} fill="rgba(255,255,255,0.6)" fontSize={20} letterSpacing={6}>RUNWAY</text>
      {/* aprons */}
      <rect x={220} y={200} width={1300} height={360} fill="rgba(22,139,206,0.10)" stroke="rgba(53,212,232,0.35)" strokeWidth={1.5} />
      <text x={240} y={545} fill="rgba(53,212,232,0.7)" fontSize={18} letterSpacing={4}>AIRPORT APRON</text>
      <rect x={240} y={690} width={860} height={190} fill="rgba(22,139,206,0.08)" stroke="rgba(53,212,232,0.3)" strokeWidth={1.5} />
      {/* taxiway */}
      <rect x={60} y={TAXI_Y - 34} width={1800} height={68} fill="#0C1C30" stroke="rgba(255,255,255,0.18)" />
      <line x1={60} y1={TAXI_Y} x2={1860} y2={TAXI_Y} stroke={C.gold} strokeWidth={3} strokeDasharray="22 14" opacity={0.85} />
      <rect x={116} y={TAXI_Y} width={68} height={300} fill="#0C1C30" />
      <line x1={150} y1={TAXI_Y} x2={150} y2={900} stroke={C.gold} strokeWidth={3} strokeDasharray="22 14" opacity={0.85} />
      <text x={70} y={TAXI_Y - 46} fill="rgba(245,184,46,0.9)" fontSize={18} letterSpacing={4}>TAXIWAY</text>
      {/* terminal + jet bridges */}
      <rect x={260} y={70} width={1150} height={120} rx={6} fill="#123A63" stroke={C.cyan} strokeWidth={2} />
      <text x={835} y={140} textAnchor="middle" fill={C.white} fontSize={30} fontWeight={600} letterSpacing={10}>TERMINAL</text>
      {GATES.map((g) => (
        <g key={g.id}>
          <rect x={g.x - 8} y={190} width={16} height={58} fill="#2A5D8C" stroke={isHl(g.id) ? C.gold : C.cyan} strokeWidth={isHl(g.id) ? 3 : 1.2} />
          <line x1={g.x} y1={250} x2={g.x} y2={TAXI_Y - 34} stroke="rgba(245,184,46,0.5)" strokeWidth={2} strokeDasharray="10 8" />
          <text x={g.x + 18} y={232} fill={isHl(g.id) ? C.gold : 'rgba(255,255,255,0.75)'} fontSize={20} fontWeight={600}>{g.id}</text>
          {isHl(g.id) && <circle cx={g.x} cy={318} r={86} fill="none" stroke={C.gold} strokeWidth={3} opacity={hl * glow} />}
        </g>
      ))}
      {/* remote parking stands */}
      {STANDS.map((s) => (
        <g key={s.id}>
          <rect x={s.x - 70} y={s.y - 78} width={140} height={156} fill={isHl(s.id) ? `rgba(245,184,46,${0.15 * hl})` : 'none'} stroke={isHl(s.id) ? C.gold : 'rgba(255,255,255,0.35)'} strokeWidth={isHl(s.id) ? 3 : 1.5} strokeDasharray={isHl(s.id) ? undefined : '8 6'} opacity={isHl(s.id) ? 0.6 + 0.4 * glow * hl : 1} />
          <line x1={s.x} y1={s.y - 78} x2={s.x} y2={s.y + 60} stroke="rgba(245,184,46,0.5)" strokeWidth={2} strokeDasharray="10 8" />
          <text x={s.x - 60} y={s.y + 66} fill={isHl(s.id) ? C.gold : 'rgba(255,255,255,0.7)'} fontSize={18} fontWeight={600}>{s.id}</text>
        </g>
      ))}
      <text x={260} y={874} fill="rgba(53,212,232,0.7)" fontSize={18} letterSpacing={4}>PARKING STANDS</text>
      {/* maintenance hangar */}
      <g>
        <rect x={HANGAR.x} y={HANGAR.y} width={HANGAR.w} height={HANGAR.h} rx={4} fill={isHl('HANGAR') ? 'rgba(245,184,46,0.16)' : '#10304F'} stroke={isHl('HANGAR') ? C.gold : C.cyan} strokeWidth={isHl('HANGAR') ? 3.5 : 2} />
        {Array.from({length: 7}).map((_, i) => (
          <line key={i} x1={HANGAR.x + 20} y1={HANGAR.y + 30 + i * 40} x2={HANGAR.x + HANGAR.w - 20} y2={HANGAR.y + 30 + i * 40} stroke="rgba(53,212,232,0.18)" />
        ))}
        <rect x={HANGAR.x + 40} y={HANGAR.y + HANGAR.h - 6} width={HANGAR.w - 80} height={12} fill={C.gold} opacity={0.8} />
        <text x={HANGAR.x + HANGAR.w / 2} y={HANGAR.y - 16} textAnchor="middle" fill={isHl('HANGAR') ? C.gold : C.white} fontSize={20} fontWeight={600} letterSpacing={2}>MAINTENANCE HANGAR</text>
        <line x1={1730} y1={HANGAR.y + HANGAR.h} x2={1730} y2={TAXI_Y - 34} stroke="rgba(245,184,46,0.5)" strokeWidth={2} strokeDasharray="10 8" />
      </g>
      {/* inspection area */}
      <g>
        <rect x={INSPECT.x} y={INSPECT.y} width={INSPECT.w} height={INSPECT.h} fill={isHl('INSPECT') ? `rgba(53,212,232,${0.16 * hl})` : 'rgba(22,139,206,0.07)'} stroke={isHl('INSPECT') ? C.cyan : 'rgba(53,212,232,0.4)'} strokeWidth={isHl('INSPECT') ? 3 : 1.5} strokeDasharray="12 8" />
        <text x={INSPECT.x + INSPECT.w / 2} y={INSPECT.y + INSPECT.h + 26} textAnchor="middle" fill={isHl('INSPECT') ? C.cyan : 'rgba(255,255,255,0.7)'} fontSize={18} fontWeight={600} letterSpacing={2}>INSPECTION AREA</text>
      </g>
      {/* remote apron stand B for repositioning */}
      <rect x={1310} y={330} width={140} height={156} fill={isHl('B') ? `rgba(245,184,46,${0.15 * hl})` : 'none'} stroke={isHl('B') ? C.gold : 'rgba(255,255,255,0.35)'} strokeWidth={isHl('B') ? 3 : 1.5} strokeDasharray={isHl('B') ? undefined : '8 6'} />
      <text x={1320} y={506} fill="rgba(255,255,255,0.7)" fontSize={18} fontWeight={600}>P7</text>
    </g>
  );
};

/** draws the route with a glowing, animated dash */
export const RouteLine: React.FC<{k: string; p: number; color?: string}> = ({k, p, color = C.cyan}) => {
  const frame = useCurrentFrame();
  const r = route(k);
  if (p <= 0) return null;
  return (
    <g>
      <path d={r.d} fill="none" stroke={color} strokeWidth={14} opacity={0.18} strokeDasharray={`${r.length * p} ${r.length}`} strokeLinecap="round" />
      <path d={r.d} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${r.length * p} ${r.length}`} strokeLinecap="round" />
      <path d={r.d} fill="none" stroke="white" strokeWidth={4} strokeDasharray="6 30" strokeDashoffset={-frame * 2} opacity={0.6 * Math.min(1, p * 3)} style={{clipPath: 'none'}} mask={undefined} />
      {/* arrow heads along route */}
      {[0.3, 0.6, 0.9].filter((a) => a < p).map((a) => {
        const q = pointAt(r, a);
        return <path key={a} d="M-11,8 L0,-10 L11,8" transform={`translate(${q.x},${q.y}) rotate(${q.angle})`} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" />;
      })}
    </g>
  );
};

export const AircraftMover: React.FC<Mover> = ({route: k, t, reverse, tug = true}) => {
  const q = pointAt(route(k), t);
  const heading = q.angle + (reverse ? 180 : 0);
  return (
    <g transform={`translate(${q.x},${q.y}) rotate(${heading})`} style={{filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.6))'}}>
      {tug && <g transform="translate(0,-62)"><TugTop /></g>}
      <PlaneTop size={0.95} />
    </g>
  );
};

export const Marker: React.FC<{x: number; y: number; label: string; atS: number; color?: string}> = ({x, y, label, atS, color = C.gold}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.5);
  if (p <= 0) return null;
  const pulse = ((frame / FPS) * 1.2) % 1;
  return (
    <g transform={`translate(${x},${y})`} opacity={p}>
      <circle r={20 + pulse * 50} fill="none" stroke={color} strokeWidth={2} opacity={1 - pulse} />
      <path d="M0,0 C-18,-20 -18,-46 0,-50 C18,-46 18,-20 0,0 Z" transform={`translate(0,${-6 - (1 - p) * 20})`} fill={color} stroke={C.navy} strokeWidth={2} />
      <text y={-62 - (1 - p) * 20} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.white} stroke={C.navy} strokeWidth={5} paintOrder="stroke">{label}</text>
    </g>
  );
};

/** full map with camera (zoom/pan) */
export const AirportMap: React.FC<{
  cam?: {s0: number; s1: number; cx0: number; cy0: number; cx1: number; cy1: number; atS?: number; durS?: number};
  highlight?: string[];
  hlAtS?: number;
  children?: React.ReactNode;
  overlay?: React.ReactNode;
  revealS?: number;
  tilt?: number; // initial 3D camera tilt (deg) that flattens to top-down
}> = ({cam = {s0: 1, s1: 1, cx0: 960, cy0: 540, cx1: 960, cy1: 540}, highlight, hlAtS = 0, children, overlay, revealS = 0, tilt = 0}) => {
  const frame = useCurrentFrame();
  const cp = prog(frame, cam.atS ?? 0, cam.durS ?? 3, easeInOut);
  const s = interpolate(cp, [0, 1], [cam.s0, cam.s1]);
  const cx = interpolate(cp, [0, 1], [cam.cx0, cam.cx1]);
  const cy = interpolate(cp, [0, 1], [cam.cy0, cam.cy1]);
  const hl = prog(frame, hlAtS, 0.6);
  const reveal = prog(frame, revealS, 0.9);
  const tp = prog(frame, revealS, 1.8, easeInOut);
  const rx = tilt * (1 - tp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #0B2A4D 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`, perspective: 1800}}>
      <BlueprintGrid opacity={0.6} />
      <AbsoluteFill style={{transform: `rotateX(${rx}deg) scale(${1 + rx / 120})`, transformOrigin: '50% 60%'}}>
      <AbsoluteFill style={{transform: `translate(${960 - cx * s}px, ${540 - cy * s}px) scale(${s})`, transformOrigin: '0 0', opacity: reveal}}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{overflow: 'visible'}}>
          <Layout highlight={highlight} hl={hl} />
          {children}
        </svg>
      </AbsoluteFill>
      </AbsoluteFill>
      {overlay}
      <div style={{position: 'absolute', left: 56, bottom: 150, fontFamily: FONT.mono, fontSize: 15, color: 'rgba(255,255,255,0.55)', letterSpacing: 1}}>SCHEMATIC AIRPORT LAYOUT · ILLUSTRATION ONLY</div>
    </AbsoluteFill>
  );
};
