import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, FPS} from '../utils/theme';
import {easeInOut, easeOut, prog} from '../utils/anim';
import {TugSide} from './Aircraft';
import {ICONS} from './Icons';

/* =====================================================================
 * TOWING CHAIN DIAGRAM:  AIRCRAFT TUG -> TOWBAR -> NOSE LANDING GEAR
 * Generic conventional (towbar) towing, side view, schematic.
 * ===================================================================== */
export const TowChainDiagram: React.FC<{tugS: number; barS: number; nlgS: number; arrowS: number}> = ({tugS, barS, nlgS, arrowS}) => {
  const frame = useCurrentFrame();
  const pt = prog(frame, tugS - 0.3, 1.0);
  const pb = prog(frame, barS - 0.2, 0.7);
  const pn = prog(frame, 0, 1.4);
  const xr = prog(frame, nlgS - 0.2, 0.6);
  const ar = prog(frame, arrowS, 0.6, easeOut);
  const lock = prog(frame, barS + 0.35, 0.15);
  // tug slides in to couple
  const tugX = interpolate(prog(frame, 0, 1.1, easeOut), [0, 1], [-120, 0]);
  const t = frame / FPS;
  const move = ar > 0 ? Math.sin((t - arrowS) * 1.6) * 18 * ar : 0;
  const draw = (p: number, i: number) => Math.max(0, Math.min(1, p * 1.4 - i * 0.08));
  const nose = [
    'M1080,600 C1092,520 1150,456 1260,430 L1920,410',
    'M1080,600 C1090,640 1140,664 1210,670 L1920,670',
    'M1130,520 L1160,486 L1238,470 L1242,500 Z',
  ];
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={C.gold} />
        </marker>
      </defs>
      {/* ground */}
      <line x1={0} y1={882} x2={1920} y2={882} stroke="rgba(53,212,232,0.5)" strokeWidth={2} />
      <g transform={`translate(${move},0)`}>
        {/* aircraft nose section (x-ray, partial) */}
        <g opacity={0.95}>
          <path d="M1080,600 C1092,520 1150,456 1260,430 L1920,410 L1920,670 L1210,670 C1140,664 1090,640 1080,600 Z" fill="rgba(53,212,232,0.06)" />
          {nose.map((d, i) => (
            <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(pn, i)} fill="none" stroke="#E8F6FF" strokeWidth={3} />
          ))}
          <text x={1360} y={560} fill="rgba(255,255,255,0.45)" fontFamily={FONT.mono} fontSize={22} letterSpacing={6} opacity={pn}>AIRBUS A320 · NOSE SECTION</text>
        </g>
        {/* nose landing gear: strut, torque link, twin wheels, towing attachment */}
        <g opacity={Math.max(0.35, xr)} filter={xr > 0 ? 'drop-shadow(0 0 8px rgba(53,212,232,0.8))' : undefined}>
          <rect x={1268} y={668} width={22} height={150} fill="rgba(53,212,232,0.25)" stroke={C.cyan} strokeWidth={3} />
          <rect x={1272} y={760} width={14} height={70} fill="rgba(255,255,255,0.3)" stroke="#E8F6FF" strokeWidth={2} />
          <path d="M1290,700 L1318,740 L1290,780" fill="none" stroke={C.cyan} strokeWidth={3} />
          <circle cx={1279} cy={842} r={40} fill="rgba(7,27,51,0.9)" stroke="#E8F6FF" strokeWidth={4} />
          <circle cx={1279} cy={842} r={16} fill="none" stroke={C.cyan} strokeWidth={3} />
          <circle cx={1279} cy={842} r={5} fill={C.gold} />
        </g>
        {/* towbar */}
        <g>
          <path d="M640,812 L1236,842" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pb} stroke={C.gold} strokeWidth={10} strokeLinecap="round" />
          <path d="M1236,826 L1262,842 L1236,858" fill="none" stroke={C.gold} strokeWidth={6} opacity={pb} />
          <circle cx={780} cy={846} r={18} fill="none" stroke="#E8F6FF" strokeWidth={3} opacity={pb} />
          <line x1={780} y1={818} x2={780} y2={828} stroke="#E8F6FF" strokeWidth={3} opacity={pb} />
          {/* coupling flash */}
          {lock > 0 && lock < 1 && <circle cx={1262} cy={842} r={30 + lock * 40} fill="none" stroke={C.gold} strokeWidth={4} opacity={1 - lock} />}
        </g>
      </g>
      {/* tug */}
      <g transform={`translate(${310 + tugX + move},718) scale(1.0)`}>
        <TugSide progress={pt} />
      </g>
      {/* direction arrows */}
      <g opacity={ar}>
        <line x1={760} y1={960} x2={1160} y2={960} stroke={C.gold} strokeWidth={5} markerStart="url(#ah)" markerEnd="url(#ah)" />
        <text x={720} y={968} textAnchor="end" fill={C.white} fontFamily={FONT.mono} fontWeight={700} fontSize={26} letterSpacing={3}>TOW</text>
        <text x={1200} y={968} textAnchor="start" fill={C.white} fontFamily={FONT.mono} fontWeight={700} fontSize={26} letterSpacing={3}>PUSH</text>
      </g>
    </svg>
  );
};

/* =====================================================================
 * PROCESS CYCLE (illustrative sequence of a towing task)
 * ===================================================================== */
const CYCLE = ['AIRCRAFT PREPARATION', 'TOWING CONNECTION', 'AIRCRAFT MOVEMENT', 'AIRCRAFT PARKING', 'FINAL INSPECTION'];
export const CycleDiagram: React.FC<{atS: number; stepS: number}> = ({atS, stepS}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const R = 300;
  const cx = 960;
  const cy = 520;
  const arcP = interpolate(t, [atS, atS + stepS * 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(53,212,232,0.18)" strokeWidth={14} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.cyan} strokeWidth={6} strokeDasharray={`${circ * arcP} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
        {CYCLE.map((_, i) => {
          const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
          const p = prog(frame, atS + i * stepS, 0.45, easeOut);
          const active = t >= atS + i * stepS && t < atS + (i + 1) * stepS + 0.5;
          return (
            <g key={i} transform={`translate(${cx + Math.cos(a) * R},${cy + Math.sin(a) * R}) scale(${0.6 + 0.4 * p})`} opacity={p}>
              <circle r={46} fill={active ? C.gold : C.navy} stroke={active ? C.gold : C.cyan} strokeWidth={4} />
              <text y={14} textAnchor="middle" fontFamily={FONT.title} fontWeight={900} fontSize={38} fill={active ? C.navy : C.white}>{i + 1}</text>
            </g>
          );
        })}
      </svg>
      {CYCLE.map((label, i) => {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        const p = prog(frame, atS + i * stepS + 0.15, 0.45, easeOut);
        const x = cx + Math.cos(a) * (R + 80);
        const y = cy + Math.sin(a) * (R + 80);
        const right = Math.cos(a) > 0.2;
        const left = Math.cos(a) < -0.2;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y - 18, transform: i === 0 ? 'translate(64px, 62px)' : `translateX(${right ? '0' : left ? '-100%' : '-50%'})`, opacity: p, fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, color: C.white, letterSpacing: 1.5, whiteSpace: 'nowrap', background: 'rgba(7,27,51,0.8)', padding: '6px 14px', borderLeft: `5px solid ${C.cyan}`}}>
            {label}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx - 160, top: cy - 50, width: 320, textAlign: 'center', fontFamily: FONT.title, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: 2, lineHeight: 1.3}}>
        MAINTENANCE
        <br />
        <span style={{color: C.gold}}>TOWING</span>
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================
 * ICEBERG: visible operation vs. work behind the operation
 * ===================================================================== */
export const Iceberg: React.FC<{atS: number; belowS: number}> = ({atS, belowS}) => {
  const frame = useCurrentFrame();
  const cam = prog(frame, belowS - 0.4, 1.6, easeInOut);
  const camY = interpolate(cam, [0, 1], [0, -40]);
  const top = ['AIRCRAFT TUG', 'AIRCRAFT MOVEMENT', 'PUSHBACK'];
  const bottom = ['COMMUNICATION', 'SAFETY INSPECTION', 'AIRCRAFT CLEARANCE', 'GROUND CREW COORDINATION'];
  const wave = Math.sin((frame / FPS) * 1.4) * 4;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #0B2A4D 0%, ${C.navy} 45%, #031022 100%)`}}>
      <AbsoluteFill style={{transform: `translateY(${camY}px)`}}>
        <svg width={1920} height={1400} style={{position: 'absolute', top: 0}}>
          <defs>
            <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E8F6FF" stopOpacity="0.95" />
              <stop offset="1" stopColor="#7FD8EA" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="iceU" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#35D4E8" stopOpacity="0.45" />
              <stop offset="1" stopColor="#168BCE" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d={`M760,440 L880,${290 + wave} L940,330 L1000,250 L1090,350 L1180,440 Z`} fill="url(#ice)" opacity={prog(frame, atS, 0.8)} />
          <path d="M760,440 L1180,440 L1400,620 L1350,860 L1080,960 L780,930 L560,800 L590,600 Z" fill="url(#iceU)" stroke="rgba(53,212,232,0.6)" strokeWidth={2} opacity={prog(frame, atS + 0.3, 1.0)} />
          <rect x={0} y={440 + wave} width={1920} height={960} fill="rgba(22,139,206,0.16)" />
          <line x1={0} y1={440 + wave} x2={1920} y2={440 + wave} stroke={C.cyan} strokeWidth={3} />
        </svg>
        <div style={{position: 'absolute', left: 110, top: 370, fontFamily: FONT.mono, fontSize: 26, letterSpacing: 6, color: C.gold, opacity: prog(frame, atS + 0.2, 0.5)}}>VISIBLE</div>
        <div style={{position: 'absolute', left: 110, top: 480, fontFamily: FONT.mono, fontSize: 26, letterSpacing: 6, color: C.cyan, opacity: prog(frame, belowS, 0.5)}}>BEHIND THE OPERATION</div>
        {top.map((l, i) => {
          const p = prog(frame, atS + 0.5 + i * 0.35, 0.45, easeOut);
          return (
            <div key={l} style={{position: 'absolute', left: 1260, top: 250 + i * 62, opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: C.white, letterSpacing: 2, padding: '6px 16px', background: 'rgba(7,27,51,0.75)', borderLeft: `6px solid ${C.gold}`}}>
              {l}
            </div>
          );
        })}
        {bottom.map((l, i) => {
          const p = prog(frame, belowS + 0.4 + i * 0.45, 0.45, easeOut);
          return (
            <div key={l} style={{position: 'absolute', left: i % 2 ? 1010 : 640, top: 560 + Math.floor(i / 2) * 130 + (i % 2) * 54, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, fontFamily: FONT.mono, fontWeight: 700, fontSize: 27, color: C.white, letterSpacing: 2, padding: '8px 16px', background: 'rgba(4,15,31,0.75)', border: `1.5px solid ${C.cyan}`}}>
              {l}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =====================================================================
 * FIVE PURPOSES – overview cards (decision-matrix style)
 * ===================================================================== */
export const PURPOSES = [
  {en: 'HANGAR TOWING', kh: 'អូសចូល ឬចេញពីរោងជាង', where: 'MAINTENANCE HANGAR'},
  {en: 'MAINTENANCE TOWING', kh: 'ទៅតំបន់ត្រួតពិនិត្យ និងថែទាំ', where: 'INSPECTION AREA'},
  {en: 'PARKING TOWING', kh: 'ទៅទីតាំងចតដែលបានកំណត់', where: 'PARKING STAND'},
  {en: 'REPOSITIONING TOWING', kh: 'ផ្លាស់ប្ដូរទីតាំងយន្តហោះ', where: 'POSITION A → B'},
  {en: 'PUSHBACK', kh: 'រុញថយក្រោយចេញពី Gate', where: 'AIRCRAFT GATE'},
];

export const PurposeCards: React.FC<{atS: number; stagger: number; showWhere?: boolean}> = ({atS, stagger, showWhere = false}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top: 420, display: 'flex', gap: 28}}>
      {PURPOSES.map((p, i) => {
        const Icon = ICONS[i];
        const a = prog(frame, atS + i * stagger, 0.55, easeOut);
        return (
          <div key={p.en} style={{flex: 1, height: 400, opacity: a, transform: `translateY(${(1 - a) * 60}px)`, background: 'linear-gradient(180deg, rgba(22,139,206,0.22), rgba(7,27,51,0.85))', border: '1.5px solid rgba(53,212,232,0.55)', borderTop: `6px solid ${C.gold}`, padding: '26px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
            <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 44, color: C.gold}}>{String(i + 1).padStart(2, '0')}</div>
            <Icon size={104} />
            <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 27, color: C.white, letterSpacing: 1, lineHeight: 1.15}}>{p.en}</div>
            {showWhere && <div style={{fontFamily: FONT.mono, fontSize: 18, color: C.cyan, marginTop: 'auto'}}>{p.where}</div>}
          </div>
        );
      })}
    </div>
  );
};

/* =====================================================================
 * RECAP TIMELINE – five nodes activated in sync with the narration
 * ===================================================================== */
export const RecapTimeline: React.FC<{nodeS: number[]}> = ({nodeS}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const x0 = 200;
  const x1 = 1720;
  const y = 600;
  const lineP = prog(frame, 0.6, 1.6, easeInOut);
  const active = nodeS.reduce((acc, s, i) => (t >= s - 0.1 ? i : acc), -1);
  const fill = active < 0 ? 0 : interpolate(t, [nodeS[active], nodeS[active] + 0.8], [Math.max(0, active - 1) / 4, active / 4], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * lineP} y2={y} stroke="rgba(53,212,232,0.35)" strokeWidth={6} />
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * fill} y2={y} stroke={C.gold} strokeWidth={6} />
      </svg>
      {PURPOSES.map((p, i) => {
        const x = x0 + ((x1 - x0) * i) / 4;
        const appear = prog(frame, 0.9 + i * 0.25, 0.5, easeOut);
        const on = prog(frame, nodeS[i] - 0.1, 0.5, easeOut);
        const isActive = active === i;
        const Icon = ICONS[i];
        const up = i % 2 === 0;
        return (
          <React.Fragment key={p.en}>
            <div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 34, opacity: appear, transform: `scale(${(0.7 + 0.3 * appear) * (isActive ? 1.15 : 1)})`, background: on > 0.5 ? C.gold : C.navy, border: `4px solid ${on > 0.5 ? C.gold : C.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.title, fontWeight: 900, fontSize: 30, color: on > 0.5 ? C.navy : C.white, boxShadow: isActive ? '0 0 30px rgba(245,184,46,0.8)' : 'none'}}>
              {i + 1}
            </div>
            <div style={{position: 'absolute', left: x - 165, top: up ? y - 304 : y + 54, width: 330, height: 250, opacity: appear * (0.35 + 0.65 * on), transform: `translateY(${(1 - on) * (up ? 16 : -16)}px) scale(${isActive ? 1.04 : 1})`, background: isActive ? 'rgba(245,184,46,0.12)' : 'rgba(7,27,51,0.8)', border: `1.5px solid ${isActive ? C.gold : 'rgba(53,212,232,0.5)'}`, padding: '14px 16px', boxSizing: 'border-box', textAlign: 'center'}}>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <Icon size={54} color={isActive ? C.gold : C.cyan} />
              </div>
              <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 25, color: C.white, letterSpacing: 1, marginTop: 6}}>{p.en}</div>
              <div style={{fontFamily: FONT.khmer, fontSize: 21, color: 'rgba(255,255,255,0.88)', marginTop: 6, lineHeight: 1.6}}>{p.kh}</div>
              <div style={{fontFamily: FONT.mono, fontSize: 16, color: C.cyan, marginTop: 8, letterSpacing: 1}}>WHERE: {p.where}</div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
