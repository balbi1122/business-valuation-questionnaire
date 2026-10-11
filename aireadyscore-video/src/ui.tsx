import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender} from 'remotion';
import {LOGO_PATHS, NEEDLE, HUB} from './logoPaths';
import {C} from './tokens';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

export const heading = '"Manrope Variable", ui-sans-serif, system-ui, sans-serif';
export const body = '"Roboto Variable", ui-sans-serif, system-ui, sans-serif';

// Word-by-word blur-in headline. `shimmerFrom` makes words from that index shimmer in the brand gradient.
export const Words: React.FC<{
  text: string; f: number; start: number; step?: number; size: number; weight?: number;
  color?: string; shimmerFrom?: number; align?: 'center' | 'left'; maxWidth?: number; lh?: number;
}> = ({text, f, start, step = 5, size, weight = 800, color = C.ink, shimmerFrom, align = 'center', maxWidth, lh = 1.1}) => {
  const words = text.split(' ');
  return (
    <div style={{fontFamily: heading, fontSize: size, fontWeight: weight, letterSpacing: '-0.025em', lineHeight: lh,
      textAlign: align, maxWidth, color, display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.26}px`}}>
      {words.map((w, i) => {
        const t = prog(f, start + i * step, start + i * step + 16);
        const sh = shimmerFrom !== undefined && i >= shimmerFrom;
        const pos = 200 - ((f * 3) % 400);
        return (
          <span key={i} style={{
            display: 'inline-block', opacity: t, transform: `translateY(${(1 - t) * 18}px)`, filter: `blur(${(1 - t) * 14}px)`,
            ...(sh ? {backgroundImage: `linear-gradient(100deg, ${C.primary} 0%, ${C.primary} 35%, ${C.accent} 50%, ${C.primary} 65%, ${C.primary} 100%)`,
              backgroundSize: '200% 100%', backgroundPosition: `${pos / 2 + 50}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent'} : {}),
          }}>{w}</span>
        );
      })}
    </div>
  );
};

// The real logo mark. `needleDeg` rotates only the needle (0 = rest position in the logo).
export const Mark: React.FC<{size: number; needleDeg?: number; segFill?: string; style?: React.CSSProperties}> = ({size, needleDeg = 0, segFill = C.ink, style}) => (
  <svg width={size} height={size} viewBox="0 0 1200 1200" style={{display: 'block', overflow: 'visible', ...style}}>
    {LOGO_PATHS.map((p, i) => <path key={i} d={p.d} fill={p.seg ? segFill : p.fill} />)}
    <g transform={`rotate(${needleDeg} 600 600)`}>
      <polygon points={NEEDLE.points} fill={NEEDLE.fill} />
    </g>
    <circle cx={HUB.cx} cy={HUB.cy} r={HUB.r} fill={HUB.fill} />
  </svg>
);

export const Wordmark: React.FC<{size: number; opacity?: number}> = ({size, opacity = 1}) => (
  <span style={{fontFamily: heading, fontWeight: 800, letterSpacing: '-0.02em', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', opacity}}>
    <span style={{color: C.ink}}>AI Ready</span> <span style={{color: C.primary}}>Score</span>
  </span>
);

// Needle sweep with a slight overshoot.
export const useNeedle = (start: number, from = -200) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - start, fps, config: {damping: 9, stiffness: 55, mass: 1}});
  return f < start ? from : from * (1 - s);
};

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: C.white, border: `2px solid ${C.border}`, borderRadius: 28, boxShadow: '0 30px 70px rgba(16,39,71,0.12), 0 6px 16px rgba(16,39,71,0.06)', ...style}}>{children}</div>
);

export const Chip: React.FC<{label: string; color: string; style?: React.CSSProperties}> = ({label, color, style}) => (
  <div style={{display: 'inline-block', background: color, color: C.white, fontFamily: heading, fontWeight: 800, fontSize: 22, padding: '8px 18px', borderRadius: 999, letterSpacing: '0.02em', ...style}}>{label}</div>
);

// Soft touch indicator with a tap ripple.
export const Touch: React.FC<{x: number; y: number; f: number; tapAt: number; show: number}> = ({x, y, f, tapAt, show}) => {
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [1, 0.82, 1], clamp);
  const r = prog(f, tapAt, tapAt + 18);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: show}}>
      <div style={{position: 'absolute', left: -60, top: -60, width: 120, height: 120, borderRadius: 60, border: `4px solid ${C.primary}`, opacity: f >= tapAt ? (1 - r) * 0.8 : 0, transform: `scale(${0.4 + r * 1.2})`}} />
      <div style={{position: 'absolute', left: -32, top: -32, width: 64, height: 64, borderRadius: 32, background: 'rgba(16,39,71,0.28)', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(16,39,71,0.3)', transform: `scale(${press})`}} />
    </div>
  );
};

// Logo lockup: the mark lands centered, then slides left as the wordmark fades in, so it is never off-center.
export const Lockup: React.FC<{markSize: number; fontSize: number; gap: number; markStyle: React.CSSProperties; needleDeg: number;
  slide: number; w1: number; w2: number}> = ({markSize, fontSize, gap, markStyle, needleDeg, slide, w1, w2}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ww, setWw] = React.useState(fontSize * 5.3);
  const [handle] = React.useState(() => delayRender('lockup-measure'));
  React.useLayoutEffect(() => {
    document.fonts.ready.then(() => {
      if (ref.current) setWw(ref.current.offsetWidth);
      continueRender(handle);
    });
  }, [handle]);
  const word = (p: number): React.CSSProperties => ({opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 16}px)`});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap}}>
      <div style={{transform: `translateX(${(1 - slide) * (ww + gap) / 2}px)`}}>
        <div style={markStyle}><Mark size={markSize} needleDeg={needleDeg} /></div>
      </div>
      <div ref={ref} style={{fontFamily: heading, fontWeight: 800, letterSpacing: '-0.02em', fontSize, lineHeight: 1, whiteSpace: 'nowrap', display: 'flex', gap: fontSize * 0.26}}>
        <span style={{color: C.ink, ...word(w1)}}>AI Ready</span>
        <span style={{color: C.primary, ...word(w2)}}>Score</span>
      </div>
    </div>
  );
};
