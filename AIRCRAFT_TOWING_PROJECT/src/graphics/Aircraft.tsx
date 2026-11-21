import React from 'react';
import {C} from '../utils/theme';

/*
 * Airbus A320 side-view technical line drawing (schematic, not a certified drawing).
 * Proportions follow published overall length 37.57 m and height 11.76 m
 * (Airbus "A320 Aircraft Characteristics – Airport and Maintenance Planning").
 * Scale: ~27.2 drawing units per metre. Nose at left, ground at y = 350.
 */
const SIDE_PATHS: {d: string; w?: number; c?: string; fill?: string}[] = [
  // fuselage outline
  {d: 'M40,222 C42,196 70,166 118,154 L150,150 L980,152 C1020,154 1050,162 1062,174 L1062,186 L1050,190 C960,214 860,248 790,254 L170,254 C100,254 50,240 40,222 Z', w: 3},
  // cockpit windows
  {d: 'M92,176 L104,164 L140,160 L142,172 Z', w: 2},
  // vertical stabilizer + rudder hinge
  {d: 'M860,152 L1002,30 L1050,30 L1046,152', w: 3},
  {d: 'M1024,34 L1022,150', w: 1.5, c: C.cyan},
  // horizontal stabilizer
  {d: 'M950,172 L1050,160 L1064,165 L962,178 Z', w: 2},
  // wing (root fairing) + sharklet
  {d: 'M380,246 C420,234 520,234 590,248 L560,253', w: 2.5},
  {d: 'M590,228 L601,194 L611,194 L605,230 Z', w: 2},
  // engine pylon + nacelle + exhaust
  {d: 'M380,244 L402,236 L470,240 L452,250', w: 2},
  {d: 'M330,256 C330,246 340,244 350,244 L430,248 C440,250 446,262 446,272 C446,284 440,296 430,298 L350,300 C340,300 330,298 330,288 Z', w: 2.5},
  {d: 'M446,262 L464,272 L446,282', w: 2},
  {d: 'M338,252 L338,292', w: 1.5, c: C.cyan},
  // doors
  {d: 'M160,166 L178,166 L178,214 L160,214 Z', w: 1.5, c: C.cyan},
  {d: 'M766,166 L784,166 L784,212 L766,212 Z', w: 1.5, c: C.cyan},
  {d: 'M470,178 L482,178 L482,200 L470,200 Z', w: 1.5, c: C.cyan},
  // nose landing gear (strut + wheel)
  {d: 'M172,254 L172,318', w: 3},
  {d: 'M172,318 m-16,16 a16,16 0 1,0 32,0 a16,16 0 1,0 -32,0', w: 2.5},
  // main landing gear
  {d: 'M505,254 L505,312', w: 4},
  {d: 'M505,310 m-20,20 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0', w: 2.5},
  // ground line
  {d: 'M0,350 L1100,350', w: 1, c: 'rgba(53,212,232,0.5)'},
];

export const A320Side: React.FC<{progress: number; color?: string; showDims?: boolean; dimProgress?: number; width?: number; glow?: boolean; highlightNLG?: number; children?: React.ReactNode; bodyFill?: string}> = ({progress, color = C.white, showDims = true, dimProgress = 1, width = 1500, glow = true, highlightNLG = 0, children, bodyFill}) => {
  const windows = [];
  for (let x = 196; x < 760; x += 15.2) {
    if (Math.abs(x - 476) < 14) continue;
    windows.push(x);
  }
  return (
    <svg viewBox="-10 0 1130 400" width={width} style={{overflow: 'visible', filter: glow ? 'drop-shadow(0 0 6px rgba(53,212,232,0.55))' : undefined}}>
      {bodyFill && <path d={SIDE_PATHS[0].d} fill={bodyFill} />}
      {bodyFill && <path d={SIDE_PATHS[2].d + ' Z'} fill={bodyFill} />}
      {children}
      {SIDE_PATHS.map((p, i) => {
        const local = Math.max(0, Math.min(1, progress * 1.6 - i * 0.03));
        return (
          <path key={i} d={p.d} pathLength={1} fill="none" stroke={p.c ?? color} strokeWidth={p.w ?? 2} strokeDasharray={1} strokeDashoffset={1 - local} strokeLinejoin="round" strokeLinecap="round" />
        );
      })}
      {windows.map((x, i) => (
        <rect key={i} x={x} y={177} width={6} height={9} rx={2.5} fill="none" stroke={C.cyan} strokeWidth={1.2} opacity={Math.max(0, Math.min(1, progress * 2 - 0.9 - i * 0.008))} />
      ))}
      {highlightNLG > 0 && (
        <g opacity={highlightNLG}>
          <circle cx={172} cy={300} r={58} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="8 6" />
        </g>
      )}
      {showDims && (
        <g opacity={dimProgress} fontFamily="JetBrains Mono" fontSize={15} fill={C.cyan}>
          <path d="M40,378 L1062,378 M40,370 L40,386 M1062,370 L1062,386 M52,372 L40,378 L52,384 M1050,372 L1062,378 L1050,384" stroke={C.cyan} strokeWidth={1.4} fill="none" />
          <rect x={480} y={366} width={150} height={24} fill={C.navy} />
          <text x={555} y={384} textAnchor="middle">37.57 m</text>
          <path d="M1092,30 L1092,350 M1084,30 L1100,30 M1084,350 L1100,350 M1086,42 L1092,30 L1098,42 M1086,338 L1092,350 L1098,338" stroke={C.cyan} strokeWidth={1.4} fill="none" />
          <text x={1104} y={196} textAnchor="start">11.76 m</text>
        </g>
      )}
    </svg>
  );
};

/* Top-view aircraft icon (generic narrow-body, centred on 0,0, nose up) */
export const PlaneTop: React.FC<{size?: number; color?: string; stroke?: string}> = ({size = 1, color = '#E8F6FF', stroke = C.cyan}) => (
  <g transform={`scale(${size})`}>
    <path d="M5,-10 L60,12 L60,18 L5,7 Z M-5,-10 L-60,12 L-60,18 L-5,7 Z" fill={color} stroke={stroke} strokeWidth={1.2} />
    <path d="M4,44 L23,53 L23,57 L4,54 Z M-4,44 L-23,53 L-23,57 L-4,54 Z" fill={color} stroke={stroke} strokeWidth={1.2} />
    <rect x={17} y={-8} width={7} height={15} rx={2.5} fill="#9FB8CC" stroke={stroke} strokeWidth={1} />
    <rect x={-24} y={-8} width={7} height={15} rx={2.5} fill="#9FB8CC" stroke={stroke} strokeWidth={1} />
    <path d="M0,-62 C4,-60 5.5,-52 5.5,-44 L5.5,48 C5.5,54 3,60 0,62 C-3,60 -5.5,54 -5.5,48 L-5.5,-44 C-5.5,-52 -4,-60 0,-62 Z" fill={color} stroke={stroke} strokeWidth={1.4} />
    <path d="M-3,-52 L3,-52" stroke="#0B2A4D" strokeWidth={2} />
  </g>
);

/* Top-view tug + towbar (tug sits ahead of the nose) */
export const TugTop: React.FC<{color?: string}> = ({color = C.gold}) => (
  <g>
    <line x1={0} y1={0} x2={0} y2={-24} stroke="#D7E3EE" strokeWidth={2.5} />
    <rect x={-10} y={-50} width={20} height={28} rx={3} fill={color} stroke="#3A2A00" strokeWidth={1.2} />
    <rect x={-7} y={-46} width={14} height={8} rx={1.5} fill="#0B2A4D" />
  </g>
);

/* Side-view conventional aircraft tug (schematic) */
export const TugSide: React.FC<{progress?: number; color?: string; fill?: string}> = ({progress = 1, color = C.white, fill = 'rgba(245,184,46,0.12)'}) => {
  const paths = [
    'M0,70 L0,30 L30,10 L300,10 L330,30 L330,70 Z',
    'M40,10 L50,-38 L130,-38 L140,10',
    'M58,-30 L66,4 L124,4 L128,-30 Z',
    'M330,48 L352,48',
    'M70,92 m-28,0 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0',
    'M260,92 m-28,0 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0',
    'M160,24 L300,24 M160,40 L300,40 M160,56 L300,56',
  ];
  return (
    <g>
      <path d={paths[0]} fill={fill} stroke="none" opacity={progress} />
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, progress * 1.5 - i * 0.07))} fill="none" stroke={i >= 4 && i <= 5 ? C.cyan : color} strokeWidth={i === 6 ? 1.5 : 3} strokeLinejoin="round" />
      ))}
    </g>
  );
};
