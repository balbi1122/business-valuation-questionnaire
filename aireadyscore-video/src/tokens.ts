// Every value below is taken from aireadyscore.com (CSS and logo SVG).
export const C = {
  ink: '#102747',
  primary: '#16877C',
  accent: '#C69423',
  logoTint: '#3FB3A7',
  surface: '#F5F8FA',
  teal: '#357D7A',
  needle: '#2D6570',
  muted: '#4A5D77',
  white: '#FFFFFF',
  border: '#DDE4EA',
} as const;
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const OVERLAP = 6; // frames each scene starts early and ends late, for crossfades
export const SCENES = {
  s1: {start: 0, len: 240},
  s2: {start: 240, len: 180},
  s3: {start: 420, len: 210},
  s4: {start: 630, len: 360},
  s5: {start: 990, len: 180},
  s6: {start: 1170, len: 180},
} as const;
export const TOTAL = 1350;
export const SLOW = 1.1; // scenes 3 and 4 play 10% slower
