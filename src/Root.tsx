import React from "react";
import { Composition } from "remotion";
import { AviationDoc } from "./Video";
import { END } from "./data/timeline";
import { FPS } from "./styles/theme";

export const Root: React.FC = () => (
  <Composition id="AviationDoc" component={AviationDoc} durationInFrames={Math.round(END * FPS)} fps={FPS} width={1920} height={1080} />
);
