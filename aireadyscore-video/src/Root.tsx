import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Video';
import {FPS, H, TOTAL, W} from './tokens';

export const Root: React.FC = () => <Composition id="Main" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />;
