import React from 'react';
import {C, FONT} from '../utils/theme';

/*
 * Generic high-bypass turbofan – educational ILLUSTRATION (no specific engine model).
 * Modules are drawn as stacks of discs (ellipses) so the CSS 3D camera reads them as volumes.
 * explode: 0 = assembled, 1 = fully exploded along the engine axis.
 */
type Module = {key: string; label: string; x0: number; x1: number; r0: number; r1: number; n: number; color: string; shift: number; fill?: string};

const MODULES: Module[] = [
  {key: 'fan', label: 'FAN', x0: -430, x1: -400, r0: 230, r1: 230, n: 3, color: C.cyan, shift: -330},
  {key: 'lpc', label: 'LOW-PRESSURE COMPRESSOR', x0: -360, x1: -280, r0: 128, r1: 118, n: 4, color: C.cyan, shift: -200},
  {key: 'hpc', label: 'HIGH-PRESSURE COMPRESSOR', x0: -250, x1: -60, r0: 108, r1: 74, n: 9, color: '#7FE3F0', shift: -80},
  {key: 'cc', label: 'COMBUSTION CHAMBER', x0: -40, x1: 60, r0: 96, r1: 96, n: 5, color: C.gold, shift: 40, fill: 'rgba(245,140,46,0.18)'},
  {key: 'hpt', label: 'HIGH-PRESSURE TURBINE', x0: 80, x1: 120, r0: 84, r1: 90, n: 2, color: '#FFD27A', shift: 150},
  {key: 'lpt', label: 'LOW-PRESSURE TURBINE', x0: 140, x1: 260, r0: 100, r1: 128, n: 5, color: '#FFB547', shift: 260},
];

const Disc: React.FC<{x: number; r: number; color: string; fill?: string; blades?: boolean}> = ({x, r, color, fill, blades}) => (
  <g>
    <ellipse cx={x} cy={0} rx={r * 0.2} ry={r} fill={fill ?? 'rgba(53,212,232,0.06)'} stroke={color} strokeWidth={2} />
    {blades &&
      Array.from({length: 22}).map((_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return <line key={i} x1={x} y1={0} x2={x + Math.cos(a) * r * 0.2} y2={Math.sin(a) * r} stroke={color} strokeWidth={1} opacity={0.7} />;
      })}
  </g>
);

export const Turbofan: React.FC<{explode: number; xray: number; labels: number; rotY?: number}> = ({explode, xray, labels, rotY = -24}) => {
  return (
    <div style={{width: 1600, height: 700, perspective: 1800}}>
      <div style={{position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${rotY}deg) rotateX(6deg)`}}>
        <svg viewBox="-800 -350 1600 700" width={1600} height={700} style={{overflow: 'visible'}}>
          <defs>
            <linearGradient id="casing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(160,220,255,0.35)" />
              <stop offset="0.5" stopColor="rgba(160,220,255,0.05)" />
              <stop offset="1" stopColor="rgba(160,220,255,0.3)" />
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {/* nacelle / outer casing (fades as x-ray reveals internals, and slides away when exploded) */}
          <g opacity={(1 - explode) * (0.35 + 0.65 * (1 - xray))} transform={`translate(0, ${-explode * 120})`}>
            <path d="M-470,-250 C-470,-262 -440,-268 -380,-262 L120,-200 L300,-150 L300,150 L120,200 L-380,262 C-440,268 -470,262 -470,250 Z" fill="url(#casing)" stroke="#BFE9F5" strokeWidth={2.5} />
            <ellipse cx={-468} cy={0} rx={50} ry={252} fill="none" stroke="#BFE9F5" strokeWidth={3} />
          </g>
          {/* shaft */}
          <g transform={`translate(0, ${explode * 0})`}>
            <rect x={-420 - explode * 300} y={-9} width={720 + explode * 640} height={18} rx={6} fill="rgba(200,215,230,0.25)" stroke="#C9D6E2" strokeWidth={1.5} opacity={0.9} />
          </g>
          {/* spinner */}
          <path transform={`translate(${-explode * 380},0)`} d="M-500,0 C-500,-30 -470,-58 -432,-62 L-432,62 C-470,58 -500,30 -500,0 Z" fill="rgba(200,230,245,0.35)" stroke="#E8F6FF" strokeWidth={2} />
          {MODULES.map((m) => {
            const tx = m.shift * explode * 1.0;
            const discs = [];
            for (let i = 0; i < m.n; i++) {
              const t = m.n === 1 ? 0 : i / (m.n - 1);
              discs.push(<Disc key={i} x={m.x0 + (m.x1 - m.x0) * t} r={m.r0 + (m.r1 - m.r0) * t} color={m.color} fill={m.fill} blades={m.key === 'fan' || m.key.endsWith('pt') || m.key.endsWith('pc')} />);
            }
            return (
              <g key={m.key} transform={`translate(${tx},0)`} filter="url(#glow)">
                {m.key === 'cc' && <rect x={m.x0} y={-96} width={m.x1 - m.x0} height={192} fill="rgba(245,140,46,0.12)" stroke={C.gold} strokeWidth={1.5} />}
                {discs}
                <g opacity={labels}>
                  <line x1={(m.x0 + m.x1) / 2} y1={-(m.r0 + 8)} x2={(m.x0 + m.x1) / 2} y2={m.key === 'fan' ? -300 : m.key === 'hpc' || m.key === 'hpt' ? -250 : -210} stroke={m.color} strokeWidth={1.5} strokeDasharray="4 4" />
                </g>
              </g>
            );
          })}
          {/* exhaust cone + nozzle */}
          <g transform={`translate(${explode * 360},0)`} filter="url(#glow)">
            <path d="M280,-130 L360,-112 L360,112 L280,130 Z" fill="rgba(160,220,255,0.06)" stroke="#BFE9F5" strokeWidth={2} />
            <path d="M270,-60 L400,0 L270,60 Z" fill="rgba(200,215,230,0.2)" stroke="#E8F6FF" strokeWidth={2} />
          </g>
        </svg>
        {/* labels as HTML for crisp text */}
        {MODULES.map((m) => {
          const cx = (m.x0 + m.x1) / 2 + m.shift * explode + 800;
          const y = (m.key === 'fan' ? -300 : m.key === 'hpc' || m.key === 'hpt' ? -250 : -210) + 350;
          return (
            <div key={m.key} style={{position: 'absolute', left: cx, top: y - 44, transform: 'translateX(-50%)', opacity: labels, whiteSpace: 'nowrap', fontFamily: FONT.mono, fontWeight: 600, fontSize: 19, color: C.white, background: 'rgba(7,27,51,0.85)', border: `1px solid ${m.color}`, padding: '3px 10px', letterSpacing: 1}}>
              {m.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
