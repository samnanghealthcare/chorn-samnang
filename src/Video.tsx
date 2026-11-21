import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./styles/theme";
import { loadFonts } from "./styles/fonts";
import { Scene } from "./components/SceneWrap";
import { ProgressBar, Subtitles } from "./components/Subtitles";
import { Grain } from "./components/Atmos";
import { END, SCENES as S } from "./data/timeline";
import { S01_Hook } from "./scenes/S01_Hook";
import { S02_AtaSystem } from "./scenes/S02_AtaSystem";
import { S03_Ata20 } from "./scenes/S03_Ata20";
import { S04_Practices } from "./scenes/S04_Practices";
import { S05_Manual } from "./scenes/S05_Manual";
import { S06_Ata06 } from "./scenes/S06_Ata06";
import { S07_Dimensions } from "./scenes/S07_Dimensions";
import { S08_Drawings } from "./scenes/S08_Drawings";
import { S09_Zones } from "./scenes/S09_Zones";
import { S10_Stations } from "./scenes/S10_Stations";
import { S11_Locate } from "./scenes/S11_Locate";
import { S12_Wing } from "./scenes/S12_Wing";
import { S13_Apply } from "./scenes/S13_Apply";
import { S14_Summary } from "./scenes/S14_Summary";
import { S15_Outro } from "./scenes/S15_Outro";

loadFonts();

/** Video only - the voice-over, music and SFX are mixed by scripts/mix_audio.py + FFmpeg. */
export const AviationDoc: React.FC<{ withAudio?: boolean }> = () => (
  <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
    <Scene a={S.hook[0]} b={S.hook[1]} first><S01_Hook /></Scene>
    <Scene a={S.ataSystem[0]} b={S.ataSystem[1]}><S02_AtaSystem /></Scene>
    <Scene a={S.ata20[0]} b={S.ata20[1]}><S03_Ata20 /></Scene>
    <Scene a={S.practices[0]} b={S.practices[1]}><S04_Practices /></Scene>
    <Scene a={S.manual[0]} b={S.manual[1]}><S05_Manual /></Scene>
    <Scene a={S.ata06[0]} b={S.ata06[1]}><S06_Ata06 /></Scene>
    <Scene a={S.dims[0]} b={S.dims[1]}><S07_Dimensions /></Scene>
    <Scene a={S.drawings[0]} b={S.drawings[1]}><S08_Drawings /></Scene>
    <Scene a={S.zones[0]} b={S.zones[1]}><S09_Zones /></Scene>
    <Scene a={S.stations[0]} b={S.stations[1]}><S10_Stations /></Scene>
    <Scene a={S.locate[0]} b={S.locate[1]}><S11_Locate /></Scene>
    <Scene a={S.wing[0]} b={S.wing[1]}><S12_Wing /></Scene>
    <Scene a={S.apply[0]} b={S.apply[1]}><S13_Apply /></Scene>
    <Scene a={S.summary[0]} b={S.summary[1]}><S14_Summary /></Scene>
    <Scene a={S.outro[0]} b={END} last><S15_Outro /></Scene>
    <Grain o={0.05} />
    <Subtitles />
    <ProgressBar end={END} />
  </AbsoluteFill>
);
