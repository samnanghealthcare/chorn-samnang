import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {A} from '../data/assets';
import {BlueprintGrid, Credit, KenBurns, LightSweep, NavyBg, VideoBg} from '../components/Base';
import {Counter, Headline, LetterReveal, Tag, TechLabel, WordReveal} from '../components/Text';
import {SectionTitle} from '../components/SectionTitle';
import {A320Side} from '../graphics/Aircraft';
import {Turbofan} from '../graphics/Turbofan';
import {CycleDiagram, Iceberg, PurposeCards, RecapTimeline, TowChainDiagram} from '../graphics/Diagrams';
import {IconHangar, IconParking, IconPushback, IconReposition, IconWrench} from '../graphics/Icons';
import {AircraftMover, AirportMap, Marker, RouteLine} from '../maps/AirportMap';
import {C, FONT, FPS} from '../utils/theme';
import {easeInOut, easeOut, prog} from '../utils/anim';

export type Enter = 'fade' | 'zoom' | 'wipe' | 'blur' | 'iris' | 'slide' | 'grid' | 'none';
export type Shot = {from: number; to: number; enter: Enter; el: (dur: number) => React.ReactNode};

/* ---------------- shot-local helpers ---------------- */
const useT = () => useCurrentFrame() / FPS;

/** Map shot with an aircraft moving along a route between two local times */
const Move: React.FC<{k: string; s: number; e: number; from?: number; to?: number; reverse?: boolean; tug?: boolean; draw?: [number, number]; color?: string}> = ({k, s, e, from = 0, to = 1, reverse, tug = true, draw, color}) => {
  const frame = useCurrentFrame();
  const t = interpolate(prog(frame, s, e - s, easeInOut), [0, 1], [from, to]);
  const dp = draw ? prog(frame, draw[0], draw[1] - draw[0], easeOut) : 0;
  return (
    <>
      {draw && <RouteLine k={k} p={dp} color={color} />}
      <AircraftMover route={k} t={t} reverse={reverse} tug={tug} />
    </>
  );
};

const MapCaption: React.FC<{atS: number; title: string; kh?: string; color?: string; left?: boolean}> = ({atS, title, kh, color = C.gold, left}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.5, easeOut);
  return (
    <div style={{position: 'absolute', ...(left ? {left: 70, top: 120, textAlign: 'left'} : {right: 70, top: 120, textAlign: 'right'}), background: 'rgba(4,15,31,0.78)', padding: '14px 22px', border: '1px solid rgba(53,212,232,0.35)', opacity: p, transform: `translateY(${(1 - p) * -20}px)`}}>
      <div style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 5, color: C.cyan}}>/ ROADMAP</div>
      <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 52, color: C.white, letterSpacing: 2}}>{title}</div>
      {kh && <div style={{fontFamily: FONT.khmer, fontSize: 26, color, lineHeight: 1.6}}>{kh}</div>}
    </div>
  );
};

const BigArrowLabel: React.FC<{atS: number; outS?: number; text: string; x: number; y: number; color?: string; rot?: number}> = ({atS, outS, text, x, y, color = C.gold, rot = 0}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = prog(frame, atS, 0.5, easeOut) * (outS ? 1 - prog(frame, outS, 0.4) : 1);
  const bob = Math.sin(t * 5) * 8;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * p})`, display: 'flex', alignItems: 'center', gap: 16}}>
      <svg width={90} height={90} viewBox="-45 -45 90 90" style={{transform: `rotate(${rot}deg) translateY(${bob}px)`}}>
        <path d="M0,-38 L30,0 L12,0 L12,38 L-12,38 L-12,0 L-30,0 Z" fill={color} stroke={C.navy} strokeWidth={3} />
      </svg>
      <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 58, color, letterSpacing: 4, textShadow: '0 4px 18px rgba(0,0,0,0.7)'}}>{text}</div>
    </div>
  );
};

const CheckList: React.FC<{items: {t: string; at: number}[]; x?: number; y?: number; size?: number}> = ({items, x = 90, y = 250, size = 40}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', gap: 22}}>
      {items.map((it) => {
        const p = prog(frame, it.at, 0.45, easeOut);
        return (
          <div key={it.t} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
            <svg width={size} height={size} viewBox="0 0 40 40">
              <rect x={2} y={2} width={36} height={36} fill="rgba(7,27,51,0.7)" stroke={C.cyan} strokeWidth={2.5} />
              <path d="M9,21 L17,29 L32,11" fill="none" stroke={C.gold} strokeWidth={4.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(frame, it.at + 0.2, 0.35)} />
            </svg>
            <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: size * 1.05, color: C.white, letterSpacing: 2, textShadow: '0 3px 14px rgba(0,0,0,0.8)'}}>{it.t}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ===================== SCENE 01: INTRODUCTION ===================== */
const S01_Hook: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const q = prog(frame, 2.6, 0.6, easeOut);
  return (
    <AbsoluteFill>
      <VideoBg src={A.vidPushback1} trimS={2} durS={dur} zoom={[1.12, 1.02]} dark={0.5} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${interpolate(frame, [0, 24], [1, 0], {extrapolateRight: 'clamp'})})`}} />
      <div style={{position: 'absolute', left: 110, top: 300}}>
        <Tag text="AIRCRAFT GENERAL PRACTICES" atS={0.4} x={0} y={-90} color={C.cyan} />
        <WordReveal text="HOW DOES A LARGE AIRCRAFT" atS={0.6} size={84} stagger={0.13} />
        <WordReveal text="MOVE ON THE GROUND?" atS={1.5} size={84} stagger={0.15} highlight={['GROUND?']} />
      </div>
      <div style={{position: 'absolute', right: 150, top: 200, fontFamily: FONT.title, fontWeight: 900, fontSize: 420, color: 'transparent', WebkitTextStroke: `4px rgba(245,184,46,${0.75 * q})`, transform: `scale(${0.85 + 0.15 * q}) rotate(${(1 - q) * -8}deg)`}}>?</div>
      <Credit text="Video: NutzerAusBerlin, CC0 · Wikimedia Commons" />
    </AbsoluteFill>
  );
};

const S01_Title: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const line = prog(frame, 0.1, 0.9, easeOut);
  const kh = prog(frame, 0.8, 0.6, easeOut);
  const zoom = interpolate(frame, [0, dur * FPS], [1.0, 1.05]);
  return (
    <AbsoluteFill>
      <VideoBg src={A.vidPushback1} trimS={9} durS={dur} zoom={[1.15, 1.2]} dark={0.78} />
      <BlueprintGrid opacity={0.45} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 14, color: C.cyan, opacity: line, marginBottom: 18}}>AIRCRAFT GENERAL PRACTICES</div>
        <div style={{height: 4, width: 1100 * line, background: `linear-gradient(90deg, rgba(245,184,46,0), ${C.gold}, rgba(245,184,46,0))`, marginBottom: 26}} />
        <LetterReveal text="AIRCRAFT TOWING" atS={0.05} size={168} spacing={8} stagger={0.04} style={{textShadow: '0 8px 40px rgba(0,0,0,0.6)'}} />
        <div style={{fontFamily: FONT.khmer, fontWeight: 700, fontSize: 56, color: C.gold, marginTop: 24, opacity: kh, transform: `translateY(${(1 - kh) * 20}px)`, lineHeight: 1.6}}>ការអូសទាញយន្តហោះ</div>
      </AbsoluteFill>
      <LightSweep atS={0.2} durS={1.3} opacity={0.6} />
    </AbsoluteFill>
  );
};

const S01_Blueprint: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0.1, 2.6, easeInOut);
  const dim = prog(frame, 2.4, 0.6);
  const pan = interpolate(frame, [0, dur * FPS], [20, -20]);
  return (
    <NavyBg>
      <Tag text="/ BLUEPRINT · AIRBUS A320" atS={0.2} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${pan}px) translateY(-40px)`}}>
        <A320Side progress={p} dimProgress={dim} width={1560} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 90, top: 210, fontFamily: FONT.title, fontWeight: 900, fontSize: 46, color: C.white, letterSpacing: 3, opacity: prog(frame, 0.8, 0.5)}}>AVIATION <span style={{color: C.gold}}>GROUND OPERATIONS</span></div>
      <Credit text="Schematic drawing · dimensions: Airbus A320 Aircraft Characteristics (AC)" />
    </NavyBg>
  );
};

/* ===================== SCENE 02: WHAT IS AIRCRAFT TOWING ===================== */
const S02_Tug: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <KenBurns src={A.imgTug} durS={dur} kb={{s0: 1.05, s1: 1.16, x0: 30, x1: -30}} dark={0.3} />
    <Headline atS={0.4} title="AIRCRAFT TOWING" kh="ដំណើរការប្រើរថយន្តពិសេស" y={170} size={70} />
    <TechLabel x={760} y={720} dx={140} dy={-110} atS={2.9} title="AIRCRAFT TUG" sub="រថយន្តអូសទាញយន្តហោះ" size={30} />
    <Credit text="Photo: JULIANISME, CC BY-SA 4.0 · Wikimedia Commons" />
  </AbsoluteFill>
);

const S02_Chain: React.FC<{dur: number}> = () => (
  <NavyBg>
    <Tag text="/ DIAGRAM · TOWING CONNECTION" atS={0.1} />
    <AbsoluteFill style={{transform: 'translateY(-80px)'}}>
      <TowChainDiagram tugS={0.2} barS={1.2} nlgS={2.0} arrowS={2.5} />
      <TechLabel x={480} y={700} dx={-60} dy={-150} atS={0.3} title="AIRCRAFT TUG" />
      <TechLabel x={960} y={828} dx={40} dy={-200} atS={1.3} title="TOWBAR" color={C.gold} />
      <TechLabel x={1279} y={740} dx={160} dy={-90} atS={2.05} title="NOSE LANDING GEAR" />
    </AbsoluteFill>
    <div style={{position: 'absolute', left: 90, top: 210, display: 'flex', gap: 18, alignItems: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.white}}>
      {['AIRCRAFT TUG', '→', 'TOWBAR', '→', 'NOSE LANDING GEAR'].map((w, i) => (
        <span key={i} style={{opacity: 1, color: w === '→' ? C.gold : C.white}}>{w}</span>
      ))}
    </div>
    <Credit text="Schematic illustration · conventional towbar towing" />
  </NavyBg>
);

const S02_Engine: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  const xr = prog(frame, 0.1, 0.8);
  const ex = prog(frame, 0.9, 1.5, easeInOut);
  const lb = prog(frame, 1.8, 0.5);
  const off = prog(frame, 1.3, 0.4, easeOut);
  return (
    <NavyBg>
      <Tag text="/ X-RAY · EXPLODED VIEW" atS={0.1} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: 'translateY(20px)'}}>
        <Turbofan explode={ex} xray={xr} labels={lb} rotY={interpolate(frame, [0, 100], [-30, -18])} />
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 90, top: 190, textAlign: 'right', opacity: off, transform: `scale(${0.9 + 0.1 * off})`}}>
        <div style={{display: 'inline-block', fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: C.navy, background: C.gold, padding: '8px 20px', letterSpacing: 3}}>ENGINE THRUST: NOT USED</div>
        <div style={{fontFamily: FONT.khmer, fontSize: 28, color: C.white, marginTop: 10, lineHeight: 1.6}}>មិនប្រើកម្លាំងរុញពីម៉ាស៊ីនយន្តហោះ</div>
      </div>
      <Credit text="Illustration · generic high-bypass turbofan (not a specific engine model)" />
    </NavyBg>
  );
};

const S02_Five: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  return (
    <NavyBg>
      <div style={{position: 'absolute', left: 110, top: 170, display: 'flex', alignItems: 'flex-end', gap: 30}}>
        <Counter from={0} to={5} atS={0.2} durS={1.0} size={200} pad={1} />
        <div style={{paddingBottom: 34}}>
          <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: 6, color: C.cyan, opacity: prog(frame, 0.4, 0.5)}}>/ DECISION MATRIX</div>
          <WordReveal text="PURPOSES OF AIRCRAFT TOWING" atS={0.5} size={60} stagger={0.1} />
        </div>
      </div>
      <PurposeCards atS={0.9} stagger={0.55} showWhere />
    </NavyBg>
  );
};

/* ===================== SCENE 03: HANGAR TOWING ===================== */
const S03_Hangar: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <KenBurns src={A.imgHangar} durS={dur} kb={{s0: 1.04, s1: 1.15, y0: 10, y1: -10}} dark={0.4} />
    <CheckList items={[{t: 'INSPECTION', at: 0.4}, {t: 'REPAIR', at: 1.3}, {t: 'MAINTENANCE', at: 2.2}]} x={110} y={240} />
    <Credit text="Photo: see ASSET_SOURCES.txt" />
  </AbsoluteFill>
);

const S03_Map: React.FC<{dur: number}> = () => (
  <AirportMap cam={{s0: 1.0, s1: 1.42, cx0: 960, cy0: 540, cx1: 1440, cy1: 430, atS: 0.2, durS: 2.5}} highlight={['HANGAR']} hlAtS={2.0} tilt={30}
    overlay={
      <>
        <MapCaption atS={0.3} title="HANGAR TOWING" kh="អូសចូល និងចេញពីរោងជាង" left />
        <BigArrowLabel atS={0.9} outS={4.3} text="IN" x={1060} y={560} rot={0} />
        <BigArrowLabel atS={4.8} text="OUT" x={1060} y={560} rot={180} color={C.cyan} />
      </>
    }>
    <HangarMove />
  </AirportMap>
);
// towed IN (nose first), then towed OUT again after maintenance (reverse along the same route)
const HangarMove: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = prog(frame, 0.6, 3.6, easeInOut);
  const outP = prog(frame, 4.9, 4.3, easeInOut);
  return (
    <>
      <RouteLine k="hangarIn" p={prog(frame, 0.3, 1.3, easeOut)} />
      <AircraftMover route="hangarIn" t={inP - outP} />
    </>
  );
};

const S03_Maint: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <VideoBg src={A.vidMaint} trimS={6} durS={dur} zoom={[1.04, 1.12]} dark={0.35} />
    <Headline atS={0.3} title="AIRCRAFT MAINTENANCE" kh="គាំទ្រការថែទាំ និងជួសជុលយន្តហោះ" y={640} size={72} />
    <Credit text="Video: U.S. Air Force, public domain · Wikimedia Commons" />
  </AbsoluteFill>
);

/* ===================== SCENE 04: MAINTENANCE TOWING ===================== */
const S04_NotAlways: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <KenBurns src={A.imgApron} durS={dur} kb={{s0: 1.15, s1: 1.04, x0: -40, x1: 20}} dark={0.35} />
    <Headline atS={0.4} title="NOT EVERY TASK" kh="មិនមែនគ្រប់ការងារថែទាំ ត្រូវការរោងជាងទេ" y={600} size={74} />
    <div style={{position: 'absolute', left: 1360, top: 220}}>
      <NoHangar atS={0.9} />
    </div>
    <Credit text="Photo: see ASSET_SOURCES.txt" />
  </AbsoluteFill>
);
const NoHangar: React.FC<{atS: number}> = ({atS}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.5, easeOut);
  const x = prog(frame, atS + 0.5, 0.4);
  return (
    <div style={{opacity: p, transform: `scale(${0.8 + 0.2 * p})`, background: 'rgba(7,27,51,0.75)', border: `2px solid ${C.cyan}`, padding: 26, position: 'relative'}}>
      <IconHangar size={220} color={C.white} />
      <svg width={220} height={220} style={{position: 'absolute', left: 26, top: 26}} viewBox="0 0 100 100">
        <path d="M14,14 L86,86 M86,14 L14,86" stroke={C.gold} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - x} />
      </svg>
    </div>
  );
};

const S04_Map: React.FC<{dur: number}> = () => (
  <AirportMap cam={{s0: 1.25, s1: 1.1, cx0: 900, cy0: 700, cx1: 960, cy1: 620, atS: 0, durS: 5}} highlight={['INSPECT', 'P1']} hlAtS={2.4} tilt={26}
    overlay={<MapCaption atS={0.3} title="MAINTENANCE TOWING" kh="ទៅកាន់តំបន់ត្រួតពិនិត្យ" />}>
    <Move k="maintenance" s={0.8} e={5.3} draw={[0.5, 2.2]} />
    <Marker x={1380} y={700} label="INSPECTION AREA" atS={2.4} color={C.cyan} />
    <Marker x={360} y={700} label="START" atS={0.6} />
  </AirportMap>
);

const S04_Tech: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <VideoBg src={A.vidMaint} trimS={30} durS={dur} zoom={[1.08, 1.0]} dark={0.35} />
    <TechLabel x={1200} y={790} dx={160} dy={-170} atS={0.5} title="TECHNICIANS" sub="អ្នកបច្ចេកទេស" size={28} />
    <Tag text="TECHNICAL SERVICE" atS={0.3} />
    <Credit text="Video: U.S. Air Force, public domain · Wikimedia Commons" />
  </AbsoluteFill>
);

const S04_Cycle: React.FC<{dur: number}> = () => (
  <NavyBg>
    <Tag text="/ CYCLE · TYPICAL TOWING TASK (ILLUSTRATIVE)" atS={0.1} />
    <AbsoluteFill style={{transform: 'translateY(30px)'}}>
      <CycleDiagram atS={0.4} stepS={0.8} />
    </AbsoluteFill>
  </NavyBg>
);

/* ===================== SCENE 05: PARKING TOWING ===================== */
const S05_Tug: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <KenBurns src={A.imgTug2} durS={dur} kb={{s0: 1.04, s1: 1.14, x0: 20, x1: -30}} dark={0.3} />
    <TechLabel x={700} y={760} dx={150} dy={-160} atS={0.8} title="AIRCRAFT TUG" size={30} />
    <Tag text="CREW + AIRCRAFT TUG" atS={0.3} />
    <Credit text="Photo: Kolforn, CC BY-SA 4.0 · Wikimedia Commons" />
  </AbsoluteFill>
);

const S05_Map: React.FC<{dur: number}> = () => (
  <AirportMap cam={{s0: 1.0, s1: 1.35, cx0: 960, cy0: 560, cx1: 640, cy1: 690, atS: 0.2, durS: 4.5}} highlight={['P3']} hlAtS={3.3} tilt={28}
    overlay={<MapCaption atS={0.2} title="PARKING TOWING" kh="ទៅកាន់ Parking Stand" />}>
    <Move k="parking" s={0.4} e={4.4} draw={[0.2, 1.8]} />
    <Marker x={760} y={700} label="PARKING STAND" atS={3.3} />
  </AirportMap>
);

const S05_Parked: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <KenBurns src={A.imgParked} durS={dur} kb={{s0: 1.02, s1: 1.14, x0: -30, x1: 30}} dark={0.38} />
    <CheckList items={[{t: 'CORRECT POSITION', at: 0.6}, {t: 'AIRPORT OPERATIONS', at: 4.4}]} x={110} y={230} size={42} />
    <Credit text="Photo: see ASSET_SOURCES.txt" />
  </AbsoluteFill>
);

/* ===================== SCENE 06: REPOSITIONING ===================== */
const S06_Map: React.FC<{dur: number}> = () => (
  <AirportMap cam={{s0: 1.12, s1: 1.2, cx0: 960, cy0: 560, cx1: 1150, cy1: 600, atS: 0.5, durS: 9}} highlight={['P4', 'B']} hlAtS={5.0} tilt={32}
    overlay={
      <>
        <MapCaption atS={0.2} title="REPOSITIONING TOWING" kh="ពី Position A ទៅ Position B" />
        <RouteBadge atS={6.0} />
      </>
    }>
    <Move k="reposition" s={1.6} e={9.4} draw={[1.0, 3.4]} color={C.gold} />
    <Marker x={960} y={700} label="POSITION A" atS={0.5} color={C.cyan} />
    <Marker x={1380} y={320} label="POSITION B" atS={5.0} />
  </AirportMap>
);
const RouteBadge: React.FC<{atS: number}> = ({atS}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.5, easeOut);
  return (
    <div style={{position: 'absolute', left: 90, top: 200, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: C.white, background: 'rgba(7,27,51,0.85)', border: `1.5px solid ${C.gold}`, padding: '10px 18px', letterSpacing: 2}}>
      PARKING STAND <span style={{color: C.gold}}>→</span> NEW POSITION
    </div>
  );
};

const S06_Flex: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <VideoBg src={A.vidPushback2} trimS={40} durS={dur} zoom={[1.02, 1.1]} dark={0.4} />
    <Headline atS={0.4} title="FLEXIBLE GROUND TRAFFIC" kh="ចរាចរណ៍យន្តហោះនៅលើដី កាន់តែបត់បែន" y={600} size={68} />
    <Credit text="Video: NutzerAusBerlin, CC0 · Wikimedia Commons" />
  </AbsoluteFill>
);

/* ===================== SCENE 07: PUSHBACK ===================== */
const S07_Gate: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <KenBurns src={A.imgGate} durS={dur} kb={{s0: 1.03, s1: 1.13, x0: 25, x1: -25}} dark={0.32} />
    <Tag text="BEFORE TAXI" atS={0.3} />
    <TechLabel x={200} y={520} dx={140} dy={-150} atS={1.6} title="TERMINAL" size={28} />
    <Credit text="Photo: see ASSET_SOURCES.txt" />
  </AbsoluteFill>
);

const S07_MapPush: React.FC<{dur: number}> = () => (
  <AirportMap cam={{s0: 1.0, s1: 1.55, cx0: 960, cy0: 540, cx1: 700, cy1: 450, atS: 0.1, durS: 2.6}} highlight={['G2']} hlAtS={2.8} tilt={30}
    overlay={
      <>
        <MapCaption atS={0.3} title="PUSHBACK" kh="រុញថយក្រោយចេញពី Aircraft Gate" />
        <BigArrowLabel atS={3.6} text="REARWARD" x={1060} y={640} rot={180} />
      </>
    }>
    <Move k="pushback" s={3.6} e={6.4} from={0} to={0.62} reverse draw={[3.3, 4.6]} color={C.gold} />
    <Marker x={660} y={226} label="AIRCRAFT GATE" atS={2.8} />
  </AirportMap>
);

const S07_Video: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <VideoBg src={A.vidPushback1} trimS={20} durS={dur} zoom={[1.02, 1.1]} dark={0.28} />
    <Tag text="PUSHBACK OPERATION" atS={0.2} />
    <TechLabel x={300} y={790} dx={60} dy={-200} atS={0.8} title="AIRCRAFT TUG" size={28} />
    <BigArrowLabel atS={2.3} text="REARWARD" x={1450} y={300} rot={90} />
    <TechLabel x={1150} y={760} dx={140} dy={-60} atS={5.0} title="GROUND CREW COORDINATION" size={26} color={C.gold} />
    <Credit text="Video: NutzerAusBerlin, CC0 · Wikimedia Commons" />
  </AbsoluteFill>
);

const S07_MapTaxi: React.FC<{dur: number}> = () => {
  const t = useT();
  return (
    <AirportMap cam={{s0: 1.55, s1: 1.0, cx0: 700, cy0: 450, cx1: 960, cy1: 560, atS: 2.6, durS: 2.4}} highlight={['G2']} hlAtS={0}
      overlay={
        <>
          <MapCaption atS={0.1} title="READY FOR TAXI" kh="ត្រៀមចាប់ផ្តើម Taxi ទៅកាន់ផ្លូវរត់" />
          <Clearance atS={1.3} />
        </>
      }>
      <RouteLine k="pushback" p={1} color={C.gold} />
      {t < 2.0 ? <Move k="pushback" s={0} e={1.4} from={0.62} to={1} reverse /> : null}
      {t >= 2.0 && <TugAway />}
      {t >= 2.0 && <Move k="taxi" s={3.4} e={6.8} tug={false} draw={[2.6, 4.0]} color={C.cyan} />}
    </AirportMap>
  );
};
const TugAway: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 2.0, 1.4, easeInOut);
  return (
    <g transform={`translate(${860 + 20 + p * 60},${622 - p * 120}) rotate(${-90 + p * 60})`} opacity={1 - prog(frame, 3.0, 0.6)}>
      <rect x={-10} y={-14} width={20} height={28} rx={3} fill={C.gold} />
    </g>
  );
};
const Clearance: React.FC<{atS: number}> = ({atS}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, atS, 0.4, easeOut);
  return (
    <div style={{position: 'absolute', left: 90, top: 190, opacity: p, transform: `scale(${0.9 + 0.1 * p})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: C.white, background: 'rgba(7,27,51,0.85)', border: `2px solid ${C.cyan}`, padding: '10px 20px', letterSpacing: 2}}>
      <span style={{color: C.cyan, fontSize: 36}}>✓</span> PUSHBACK COMPLETE · CLEARANCE RECEIVED
    </div>
  );
};

const S07_Before: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <VideoBg src={A.vidPushback2} trimS={70} durS={dur} zoom={[1.0, 1.08]} dark={0.35} />
    <Headline atS={0.3} title="BEFORE FLIGHT" kh="ដំណាក់កាលដ៏សំខាន់ មុនការហោះហើរ" y={620} size={80} />
    <Credit text="Video: NutzerAusBerlin, CC0 · Wikimedia Commons" />
  </AbsoluteFill>
);

/* ===================== SCENE 08: RECAP ===================== */
const S08_Recap: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  return (
    <NavyBg>
      <div style={{position: 'absolute', left: 110, top: 118, display: 'flex', alignItems: 'center', gap: 26}}>
        <Counter from={0} to={5} atS={0.2} durS={1.0} size={96} pad={1} />
        <div>
          <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.cyan, opacity: prog(frame, 0.3, 0.5)}}>/ TIMELINE · RECAP</div>
          <WordReveal text="PURPOSES OF AIRCRAFT TOWING" atS={0.4} size={46} stagger={0.1} />
        </div>
      </div>
      <AbsoluteFill>
        <RecapTimeline nodeS={[3.87, 8.43, 14.7, 20.14, 24.73]} />
      </AbsoluteFill>
    </NavyBg>
  );
};

/* ===================== SCENE 09: CONCLUSION ===================== */
const S09_Iceberg: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Iceberg atS={0.2} belowS={6.4} />
      <div style={{position: 'absolute', left: 110, top: 128, opacity: prog(frame, 0.2, 0.5)}}>
        <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.cyan}}>/ ICEBERG</div>
        <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 50, color: C.white, letterSpacing: 2}}>MORE THAN MOVING AN AIRCRAFT</div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 262, display: 'flex', gap: 14}}>
        {['PRECISION', 'COORDINATION', 'SAFETY'].map((w, i) => {
          const p = prog(frame, [3.9, 6.6, 7.6][i], 0.4, easeOut);
          return <div key={w} style={{opacity: p, transform: `translateY(${(1 - p) * -14}px)`, fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, color: C.navy, background: i === 2 ? C.gold : C.cyan, padding: '6px 14px', letterSpacing: 2}}>{w}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const S09_Manual: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const bp = prog(frame, 0.2, 0.7, easeOut);
  return (
    <AbsoluteFill>
      <KenBurns src={A.imgTowbar} durS={dur} kb={{s0: 1.1, s1: 1.18}} dark={0.7} blur={2} />
      <BlueprintGrid opacity={0.4} />
      <div style={{position: 'absolute', left: 1180, top: 210, width: 560, height: 640, opacity: bp, transform: `perspective(1400px) rotateY(${-18 * (1 - bp) - 10}deg) translateY(${(1 - bp) * 40}px)`, background: 'linear-gradient(160deg, #10355E, #071B33)', border: `2px solid ${C.cyan}`, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', padding: 40, boxSizing: 'border-box'}}>
        <div style={{fontFamily: FONT.mono, fontSize: 20, color: C.cyan, letterSpacing: 4}}>AIRCRAFT DOCUMENTATION</div>
        <div style={{height: 3, background: C.gold, width: 160, margin: '18px 0 26px'}} />
        <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 46, color: C.white, lineHeight: 1.1}}>AIRCRAFT MAINTENANCE MANUAL</div>
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: C.gold, marginTop: 30}}>ATA 09</div>
        <div style={{fontFamily: FONT.mono, fontSize: 26, color: C.white, marginTop: 6}}>TOWING &amp; TAXIING</div>
        <div style={{fontFamily: FONT.khmer, fontSize: 26, color: 'rgba(255,255,255,0.85)', marginTop: 40, lineHeight: 1.7}}>សៀវភៅណែនាំរបស់យន្តហោះនីមួយៗ</div>
      </div>
      <CheckList items={[{t: 'FOLLOW PROCEDURES', at: 0.5}, {t: 'USE AIRCRAFT MANUALS', at: 2.0}, {t: 'CREW COORDINATION', at: 3.2}]} x={110} y={300} size={40} />
      <Credit text="Photo: U.S. Marine Corps, public domain · ATA chapter 09 = Towing & Taxiing" />
    </AbsoluteFill>
  );
};

const S09_Final: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const a = prog(frame, 0.2, 0.7, easeOut);
  const b = prog(frame, 0.6, 0.8, easeOut);
  const c = prog(frame, 1.4, 0.6, easeOut);
  const out = interpolate(frame / FPS, [dur - 0.75, dur - 0.05], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <KenBurns src={A.imgSunset} durS={dur} kb={{s0: 1.02, s1: 1.1}} dark={0.35} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.22 * a, transform: 'translateY(40px)'}}>
        <A320Side progress={1} showDims={false} width={1700} color={C.cyan} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: 'translateY(-60px)'}}>
        <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 12, color: C.cyan, opacity: a}}>AIRCRAFT GENERAL PRACTICES</div>
        <div style={{height: 4, width: 900 * a, background: `linear-gradient(90deg, rgba(245,184,46,0), ${C.gold}, rgba(245,184,46,0))`, margin: '20px 0'}} />
        <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 140, color: C.white, letterSpacing: 8, opacity: b, transform: `scale(${0.94 + 0.06 * b})`, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>AIRCRAFT TOWING</div>
        <div style={{marginTop: 26, opacity: c, transform: `translateY(${(1 - c) * 20}px)`, fontFamily: FONT.title, fontWeight: 900, fontSize: 62, color: C.navy, background: C.gold, padding: '8px 34px', letterSpacing: 10}}>SAFETY FIRST</div>
      </AbsoluteFill>
      <LightSweep atS={0.8} durS={1.6} opacity={0.4} />
      <AbsoluteFill style={{background: '#000', opacity: out}} />
    </AbsoluteFill>
  );
};

/* ===================== SHOT LIST (times in seconds, synced to narration) ===================== */
export const SHOTS: Shot[] = [
  {from: 0.0, to: 5.83, enter: 'none', el: (d) => <S01_Hook dur={d} />},
  {from: 5.83, to: 8.54, enter: 'zoom', el: (d) => <S01_Title dur={d} />},
  {from: 8.54, to: 12.71, enter: 'grid', el: (d) => <S01_Blueprint dur={d} />},
  {from: 12.71, to: 16.31, enter: 'wipe', el: (d) => <S02_Tug dur={d} />},
  {from: 16.31, to: 20.3, enter: 'grid', el: (d) => <S02_Chain dur={d} />},
  {from: 20.3, to: 23.45, enter: 'blur', el: (d) => <S02_Engine dur={d} />},
  {from: 23.45, to: 29.53, enter: 'slide', el: (d) => <S02_Five dur={d} />},
  {from: 29.53, to: 32.43, enter: 'zoom', el: (d) => <SectionTitle num={1} title="HANGAR TOWING" kh="គោលបំណងទី ១" bg={A.imgHangar} durS={d} icon={<IconHangar size={230} />} />},
  {from: 32.43, to: 36.01, enter: 'fade', el: (d) => <S03_Hangar dur={d} />},
  {from: 36.01, to: 46.15, enter: 'iris', el: (d) => <S03_Map dur={d} />},
  {from: 46.15, to: 51.03, enter: 'wipe', el: (d) => <S03_Maint dur={d} />},
  {from: 51.03, to: 53.86, enter: 'zoom', el: (d) => <SectionTitle num={2} title="MAINTENANCE TOWING" kh="គោលបំណងទី ២" bg={A.imgEngine} durS={d} icon={<IconWrench size={230} />} />},
  {from: 53.86, to: 58.85, enter: 'fade', el: (d) => <S04_NotAlways dur={d} />},
  {from: 58.85, to: 64.5, enter: 'iris', el: (d) => <S04_Map dur={d} />},
  {from: 64.5, to: 68.88, enter: 'slide', el: (d) => <S04_Tech dur={d} />},
  {from: 68.88, to: 74.62, enter: 'grid', el: (d) => <S04_Cycle dur={d} />},
  {from: 74.62, to: 77.34, enter: 'zoom', el: (d) => <SectionTitle num={3} title="PARKING TOWING" kh="គោលបំណងទី ៣" bg={A.imgParked} durS={d} icon={<IconParking size={230} />} />},
  {from: 77.34, to: 81.57, enter: 'fade', el: (d) => <S05_Tug dur={d} />},
  {from: 81.57, to: 87.31, enter: 'iris', el: (d) => <S05_Map dur={d} />},
  {from: 87.31, to: 95.2, enter: 'wipe', el: (d) => <S05_Parked dur={d} />},
  {from: 95.2, to: 98.22, enter: 'zoom', el: (d) => <SectionTitle num={4} title="REPOSITIONING TOWING" kh="គោលបំណងទី ៤" bg={A.imgApron} durS={d} icon={<IconReposition size={230} />} />},
  {from: 98.22, to: 110.56, enter: 'iris', el: (d) => <S06_Map dur={d} />},
  {from: 110.56, to: 116.73, enter: 'blur', el: (d) => <S06_Flex dur={d} />},
  {from: 116.73, to: 122.59, enter: 'zoom', el: (d) => <SectionTitle num={5} title="PUSHBACK" kh="គោលបំណងទី ៥" bg={A.imgGate} durS={d} icon={<IconPushback size={230} />} />},
  {from: 122.59, to: 126.58, enter: 'fade', el: (d) => <S07_Gate dur={d} />},
  {from: 126.58, to: 132.97, enter: 'iris', el: (d) => <S07_MapPush dur={d} />},
  {from: 132.97, to: 141.48, enter: 'wipe', el: (d) => <S07_Video dur={d} />},
  {from: 141.48, to: 148.69, enter: 'grid', el: (d) => <S07_MapTaxi dur={d} />},
  {from: 148.69, to: 153.65, enter: 'blur', el: (d) => <S07_Before dur={d} />},
  {from: 153.65, to: 184.25, enter: 'zoom', el: (d) => <S08_Recap dur={d} />},
  {from: 184.25, to: 195.93, enter: 'slide', el: (d) => <S09_Iceberg dur={d} />},
  {from: 195.93, to: 200.99, enter: 'wipe', el: (d) => <S09_Manual dur={d} />},
  {from: 200.99, to: 205.12, enter: 'fade', el: (d) => <S09_Final dur={d} />},
];
