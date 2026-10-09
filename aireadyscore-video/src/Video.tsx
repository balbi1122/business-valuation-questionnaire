import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, delayRender, continueRender} from 'remotion';
import {C, OVERLAP, SCENES} from './tokens';
import {Scene1, Scene2, Scene3, Scene4, Scene5, Scene6} from './scenes';

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const faces = [
      new FontFace('Manrope Variable', `url(${staticFile('fonts/manrope.woff2')})`, {weight: '200 800'}),
      new FontFace('Roboto Variable', `url(${staticFile('fonts/roboto.woff2')})`, {weight: '100 900'}),
    ];
    Promise.all(faces.map((f) => f.load())).then((l) => { l.forEach((f) => document.fonts.add(f)); continueRender(h); });
  }, [h]);
};

export const Main: React.FC = () => {
  useFonts();
  const S = SCENES;
  const seq = (k: keyof typeof S, el: React.ReactNode, first = false, last = false) => (
    <Sequence from={first ? 0 : S[k].start - OVERLAP} durationInFrames={S[k].len + (first ? 0 : OVERLAP) + (last ? 0 : OVERLAP)}>{el}</Sequence>
  );
  return (
    <AbsoluteFill style={{background: C.white}}>
      {seq('s1', <Scene1 />, true)}
      {seq('s2', <Scene2 />)}
      {seq('s3', <Scene3 />)}
      {seq('s4', <Scene4 />)}
      {seq('s5', <Scene5 />)}
      {seq('s6', <Scene6 />, false, true)}
      <Audio src={staticFile('sfx.wav')} />
    </AbsoluteFill>
  );
};
