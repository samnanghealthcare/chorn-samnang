import React from 'react';
import {C} from '../utils/theme';

type P = {size?: number; color?: string; sw?: number};
const S: React.FC<P & {children: React.ReactNode}> = ({size = 120, color = C.cyan, sw = 4, children}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconHangar: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M8,82 L8,44 C8,24 30,12 50,12 C70,12 92,24 92,44 L92,82" />
    <path d="M22,82 L22,48 L78,48 L78,82" />
    <path d="M30,66 L50,58 L70,66 M50,58 L50,80" />
    <path d="M4,82 L96,82" />
  </S>
);
export const IconWrench: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M62,14 C52,12 42,20 42,32 C42,35 43,38 44,40 L14,70 C10,74 10,80 14,84 C18,88 24,88 28,84 L58,54 C60,55 63,56 66,56 C78,56 86,46 84,36 L74,46 L64,44 L62,34 L72,24 Z" />
  </S>
);
export const IconParking: React.FC<P> = (p) => (
  <S {...p}>
    <rect x={14} y={14} width={72} height={72} rx={10} />
    <path d="M38,72 L38,30 L54,30 C64,30 68,36 68,43 C68,50 64,56 54,56 L38,56" />
  </S>
);
export const IconReposition: React.FC<P> = (p) => (
  <S {...p}>
    <circle cx={22} cy={70} r={10} />
    <circle cx={78} cy={30} r={10} />
    <path d="M32,70 C56,70 46,30 66,30" strokeDasharray="6 6" />
    <path d="M58,22 L67,30 L58,38" />
    <text x={18} y={76} fontSize={14} fill={p.color ?? C.cyan} stroke="none" fontFamily="JetBrains Mono" fontWeight={700}>A</text>
    <text x={74} y={36} fontSize={14} fill={p.color ?? C.cyan} stroke="none" fontFamily="JetBrains Mono" fontWeight={700}>B</text>
  </S>
);
export const IconPushback: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M10,22 L90,22" />
    <path d="M50,30 L50,44 M30,48 L70,48 M50,44 L50,70 M40,66 L60,66" />
    <path d="M50,78 L50,94 M40,86 L50,96 L60,86" />
  </S>
);
export const IconTug: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M8,66 L8,48 L18,40 L82,40 L92,48 L92,66 Z" />
    <path d="M22,40 L26,24 L48,24 L52,40" />
    <circle cx={26} cy={72} r={8} />
    <circle cx={74} cy={72} r={8} />
  </S>
);
export const ICONS = [IconHangar, IconWrench, IconParking, IconReposition, IconPushback];
