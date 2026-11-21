import React from "react";
import { Img, staticFile } from "remotion";
import { C } from "../styles/theme";
import { easeInOut, lerp, prog, useT } from "../animations/anim";
import { BlueprintGrid, Fill, HUD, LightSweep, ScanLine, Vignette } from "../components/Atmos";
import { ChapterBadge, Credit, TechLabel } from "../components/Type";

/** Real A320-200 three-view drawing (Wikimedia Commons) rendered as a white-on-navy blueprint. */
export const S06_Ata06: React.FC = () => {
  const t = useT();
  const reveal = prog(t, 50.9, 1.8, easeInOut);
  const cam = prog(t, 50.2, 10.8, easeInOut);
  const badgeMove = prog(t, 55.3, 0.9, easeInOut);
  const dim = 0.35 + 0.65 * badgeMove;
  return (
    <>
      <Fill />
      <BlueprintGrid o={1} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1.0, 1.06, cam)}) translate(${lerp(10, -10, cam)}px, 0)`, opacity: dim,
        clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}>
        <Img src={staticFile("assets/blueprint/a320_three_view.png")} style={{ position: "absolute", left: 99, top: 0, width: 1722, height: 1080,
          filter: "invert(1) sepia(1) hue-rotate(160deg) saturate(2.2) brightness(1.15) drop-shadow(0 0 6px rgba(56,225,255,0.55))" }} />
      </div>
      <ScanLine at={50.9} dur={1.8} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(4,16,31,${0.55 * (1 - badgeMove)})` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - badgeMove, transform: `scale(${lerp(1, 1.15, badgeMove)})` }}>
        <ChapterBadge at={51.3} num={6} title="DIMENSIONS AND AREAS" sub="វិមាត្រ ទីតាំង និងតំបន់" accent={C.cyan} y={520} />
      </div>
      <TechLabel at={56.6} x={521} y={318} dx={60} dy={-150} text="DIMENSIONS" sub="វិមាត្រ" color={C.amber} />
      <TechLabel at={58.4} x={505} y={455} dx={260} dy={60} text="LOCATIONS" sub="ទីតាំងផ្នែកផ្សេងៗ" color={C.cyan} />
      <LightSweep at={53.8} />
      <Vignette strength={0.6} />
      <HUD tag="ATA 06 · DIMENSIONS AND AREAS" sub="A320-200 · THREE-VIEW" />
      <Credit text="Drawing: Julien.scavini / Wikimedia Commons (CC BY-SA 3.0) · values in cm" o={reveal} />
    </>
  );
};
