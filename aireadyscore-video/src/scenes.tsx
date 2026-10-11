import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, OVERLAP, SLOW} from './tokens';
import {Card, Chip, Lockup, Mark, Touch, Words, body, clamp, ease, heading, prog} from './ui';

// ---- shared shell: crossfade + push/pull camera. `n` is nominal scene time (frames), slowed if `slow`.
const Shell: React.FC<{len: number; first?: boolean; last?: boolean; z0: number; z1: number; slow?: number; origin?: string;
  children: (n: number) => React.ReactNode}> = ({len, first, last, z0, z1, slow = 1, origin = '50% 50%', children}) => {
  const f = useCurrentFrame();
  const off = first ? 0 : OVERLAP;
  const total = len + off + OVERLAP;
  const inT = first ? 1 : prog(f, 0, 12);
  const outT = last ? 0 : prog(f, total - 12, total);
  const z = interpolate(f, [0, total], [z0, z1]) * (0.94 + 0.06 * inT) * (1 + 0.12 * outT);
  const n = (f - off) / slow;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inT * (1 - outT), filter: `blur(${(1 - inT) * 8 + outT * 10}px)`, transform: `scale(${z})`, transformOrigin: origin}}>
      {children(n)}
    </div>
  );
};

const needleAt = (n: number, start: number, fps: number, from = -200) =>
  n < start ? from : from * (1 - spring({frame: n - start, fps, config: {damping: 9, stiffness: 55}}));

const DIMS: [string, string][] = [
  ['Digital Foundation', 'How digitised and integrated are your core business systems?'],
  ['AI Awareness & Adoption', "Have you explored AI tools and do you understand what's possible?"],
  ['AI Vulnerability & Disruption', 'How exposed is your business to AI-driven competitors?'],
  ['AI Opportunity & Value', 'Where can AI create the most value in your business?'],
  ['Team & Culture Readiness', 'Is your team ready to embrace AI-powered ways of working?'],
  ['Data & Infrastructure', 'Is your data clean, structured, and ready for AI to use?'],
  ['Governance, Risk & Compliance', 'Do you have the policies and controls for responsible AI use?'],
  ['Strategy & Investment Readiness', 'Do you have a plan and budget for AI adoption?'],
];

// ---------- 1. Cold open (8s)
export const Scene1: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <Shell len={240} first z0={1.06} z1={1}>
      {(n) => {
        const dots = n < 22 ? 1 : 0;
        const pop = spring({frame: n - 20, fps, config: {damping: 11, stiffness: 120}});
        const bob = Math.sin(n / 18) * 10;
        const pull = prog(n, 100, 175);
        const bubbleScale = (n < 20 ? 0 : pop) * (1 - pull * 0.5);
        const gaugeIn = prog(n, 105, 140);
        let needle = needleAt(n, 118, fps, -170);
        needle += prog(n, 175, 200) * Math.sin((n - 175) / 9) * 9;
        return (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', opacity: dots * (1 - prog(n, 20, 24))}}>
              <div style={{background: C.ink, borderRadius: 60, padding: '26px 40px', display: 'flex', gap: 14}}>
                {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: C.white, opacity: 0.4 + 0.6 * Math.abs(Math.sin((n + i * 5) / 5))}} />)}
              </div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1080, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
              transformOrigin: '50% 0', transform: `translateY(${440 + bob - pull * 400}px) scale(${bubbleScale})`, opacity: 1 - prog(n, 120, 165)}}>
              <div style={{position: 'relative', background: C.ink, borderRadius: 120, padding: '58px 90px', boxShadow: '0 40px 90px rgba(16,39,71,0.25)'}}>
                <Words text="Is my business ready for AI?" f={n} start={24} step={5} size={92} weight={700} color={C.white} />
                <div style={{position: 'absolute', left: 90, bottom: -22, width: 60, height: 60, background: C.ink, borderRadius: 8, transform: 'rotate(45deg)', zIndex: -1}} />
              </div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center', opacity: gaugeIn, transform: `scale(${0.8 + 0.2 * gaugeIn})`}}>
              <Mark size={420} needleDeg={needle} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 715, display: 'flex', justifyContent: 'center'}}>
              <Words text="Eight dimensions. 29 quick questions." f={n} start={140} step={6} size={58} weight={700} color={C.ink} />
            </div>
            <div style={{position: 'absolute', left: 100, right: 100, top: 815, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
              {DIMS.map(([name], i) => {
                const t = spring({frame: n - (165 + i * 4), fps, config: {damping: 13, stiffness: 140}});
                return (
                  <div key={name} style={{background: C.surface, border: `2px solid ${C.border}`, borderRadius: 18, padding: '14px 12px', textAlign: 'center',
                    fontFamily: heading, fontWeight: 700, fontSize: 30, lineHeight: 1.15, color: C.ink, transform: `scale(${n < 165 + i * 4 ? 0 : t})`, opacity: Math.min(1, t)}}>{name}</div>
                );
              })}
            </div>
          </>
        );
      }}
    </Shell>
  );
};

// ---------- 2. Introducing (6s)
export const Scene2: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <Shell len={180} z0={1} z1={1.06}>
      {(n) => {
        const drop = n < 18 ? -900 : -900 * (1 - spring({frame: n - 18, fps, config: {damping: 13, stiffness: 90}}));
        const sy = interpolate(n, [30, 34, 40, 50], [1, 0.8, 1.07, 1], clamp);
        const sx = 2 - sy;
        const needle = needleAt(n, 36, fps, -190);
        const shift = prog(n, 100, 125);
        return (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 150 - shift * 40, display: 'flex', justifyContent: 'center', opacity: 1 - shift * 0.55}}>
              <Words text="Introducing" f={n} start={0} step={6} size={64} weight={600} color={C.muted} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 290 - shift * 120, display: 'flex', justifyContent: 'center'}}>
              <Lockup markSize={220} fontSize={132} gap={44} needleDeg={needle} slide={prog(n, 60, 92)} w1={prog(n, 66, 82)} w2={prog(n, 74, 90)}
                markStyle={{transform: `translateY(${drop}px) scale(${sx}, ${sy})`, transformOrigin: '50% 100%'}} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
              <Words text="Know where you stand" f={n} start={110} step={7} size={108} shimmerFrom={1} />
            </div>
          </>
        );
      }}
    </Shell>
  );
};

// ---------- 3. Scores your readiness (7s, slowed 10%)
const REPORT: [string, number][] = [
  ['AI Opportunity & Value', 7.2],
  ['Governance, Risk & Compliance', 4.5],
  ['Data & Infrastructure', 5.8],
  ['AI Vulnerability & Disruption', 4.1],
  ['Team & Culture Readiness', 6.3],
];
export const Scene3: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <Shell len={210} z0={0.95} z1={1.05} slow={SLOW}>
      {(n) => {
        const rise = spring({frame: n - 14, fps, config: {damping: 16, stiffness: 80}});
        const gapOn = prog(n, 128, 150);
        return (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center'}}>
              <Words text="Scores your readiness" f={n} start={0} step={6} size={84} />
            </div>
            <div style={{position: 'absolute', left: 290, top: 175, width: 1340, transform: `translateY(${(1 - (n < 14 ? 0 : rise)) * 500}px)`, opacity: n < 14 ? 0 : 1}}>
              <Card style={{padding: '32px 56px 26px'}}>
                <div style={{fontFamily: heading, fontWeight: 800, fontSize: 28, letterSpacing: '0.2em', color: C.primary}}>AI READY SCORE</div>
                <div style={{fontFamily: heading, fontWeight: 800, fontSize: 58, color: C.ink, marginBottom: 10}}>Diagnostic Report</div>
                {REPORT.map(([name, v], i) => {
                  const p = prog(n, 40 + i * 12, 78 + i * 12);
                  const isGap = i === 3;
                  const col = isGap ? C.accent : C.primary;
                  return (
                    <div key={name} style={{height: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10}}>
                        <span style={{fontFamily: heading, fontWeight: 700, fontSize: 38, color: C.ink}}>{name}</span>
                        <span style={{fontFamily: heading, fontWeight: 800, fontSize: 46, color: isGap && gapOn > 0.5 ? C.accent : C.ink}}>{(v * p).toFixed(1)}<span style={{fontSize: 30, color: C.muted, fontWeight: 600}}>/10</span></span>
                      </div>
                      <div style={{height: 16, borderRadius: 8, background: C.surface}}>
                        <div style={{height: 16, borderRadius: 8, width: `${(v / 10) * 100 * p}%`, background: col}} />
                      </div>
                    </div>
                  );
                })}
                <div style={{marginTop: 14, borderRadius: 18, border: `2px solid ${C.accent}`, background: `${C.accent}1F`, padding: '16px 28px', opacity: gapOn, transform: `translateY(${(1 - gapOn) * 20}px)`}}>
                  <span style={{fontFamily: heading, fontWeight: 800, fontSize: 34, color: C.accent}}>Biggest Gap  </span>
                  <span style={{fontFamily: body, fontSize: 34, color: C.ink}}>AI Vulnerability &amp; Disruption: exposure to AI-driven competitors needs attention.</span>
                </div>
                <div style={{marginTop: 12, fontFamily: body, fontStyle: 'italic', fontSize: 26, color: C.muted, opacity: prog(n, 60, 80)}}>Illustrative example. Scores shown are not real results.</div>
              </Card>
            </div>
          </>
        );
      }}
    </Shell>
  );
};

// ---------- 4. Shows what to fix first (12s, slowed 10%)
export const Scene4: React.FC = () => {
  const {fps} = useVideoConfig();
  const GX = 64, GY = 215, CW = 430, CH = 310, GAP = 24;
  const TX = GX + 2 * (CW + GAP) + CW / 2, TY = GY + CH / 2;
  return (
    <Shell len={360} z0={1} z1={1.03} slow={SLOW}>
      {(n) => {
        const zoom = prog(n, 108, 140) * (1 - prog(n, 215, 245));
        const z = 1 + 1.05 * zoom;
        const panel = prog(n, 160, 182);
        const gridOut = 1 - prog(n, 225, 250);
        const dim = 1 - zoom * 0.97;
        const tiers = prog(n, 238, 262);
        const roadmap = prog(n, 292, 316);
        return (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', opacity: 1 - zoom}}>
              <Words text="Shows what to fix first" f={n} start={0} step={6} size={84} />
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: gridOut, transformOrigin: `${TX}px ${TY}px`,
              transform: `translate(${(960 - TX) * zoom}px, ${(430 - TY) * zoom}px) scale(${z})`}}>
              {DIMS.map(([name, q], i) => {
                const col = i % 4, row = Math.floor(i / 4);
                const x = GX + col * (CW + GAP), y = GY + row * (CH + GAP);
                const s = spring({frame: n - (22 + i * 4), fps, config: {damping: 12, stiffness: 110}});
                const from = {x: 960 - CW / 2, y: 520 - CH / 2};
                const gx = n < 22 + i * 4 ? from.x : from.x + (x - from.x) * Math.min(s, 1.06);
                const gy = n < 22 + i * 4 ? from.y : from.y + (y - from.y) * Math.min(s, 1.06);
                const isGap = i === 2;
                return (
                  <div key={name} style={{position: 'absolute', left: gx, top: gy, width: CW, height: CH, opacity: (n < 22 + i * 4 ? 0 : 1) * (isGap ? 1 : dim), transform: `scale(${n < 22 + i * 4 ? 0.2 : 0.3 + 0.7 * s})`}}>
                    <Card style={{width: CW, height: CH, padding: 28, boxSizing: 'border-box', borderColor: isGap && zoom > 0 ? C.accent : C.border}}>
                      <div style={{fontFamily: heading, fontWeight: 800, fontSize: 28, color: C.primary, letterSpacing: '0.1em'}}>{String(i + 1).padStart(2, '0')}</div>
                      <div style={{fontFamily: heading, fontWeight: 800, fontSize: 38, color: C.ink, lineHeight: 1.1, margin: '8px 0 12px'}}>{name}</div>
                      <div style={{fontFamily: body, fontSize: 27, color: C.muted, lineHeight: 1.28}}>{q}</div>
                    </Card>
                    {isGap && <Chip label="Biggest Gap" color={C.accent} style={{position: 'absolute', right: 18, top: -16, opacity: prog(n, 90, 104)}} />}
                    {isGap && (
                      <div style={{position: 'absolute', left: 0, top: CH + 14, width: CW, borderRadius: 18, border: `2px solid ${C.accent}`, background: C.white,
                        padding: '16px 22px', boxSizing: 'border-box', opacity: panel * (1 - prog(n, 205, 225)), transform: `translateY(${(1 - panel) * -14}px)`, boxShadow: '0 20px 40px rgba(16,39,71,0.14)'}}>
                        <div style={{fontFamily: body, fontSize: 29, color: C.ink, lineHeight: 1.3}}>Exposure to AI-driven competitors needs attention.</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: tiers, transform: `translateY(${(1 - tiers) * 60}px)`}}>
              {[
                {x: 100, tag: 'Free', tagCol: C.primary, title: 'Quick Assessment', stat: '29', desc: 'An overall score, a dimension score profile and immediate next steps for each dimension.'},
                {x: 1000, tag: 'Full', tagCol: C.ink, title: 'Full Assessment', stat: '77', desc: 'Detailed dimension findings, risk analysis, cost of inaction, a buyer perspective and a sequenced roadmap.'},
              ].map((t, i) => (
                <div key={t.title} style={{position: 'absolute', left: t.x, top: 190, width: 820}}>
                  <Card style={{padding: 48, minHeight: i === 1 ? 740 : 620, boxSizing: 'border-box', borderColor: i === 1 && roadmap > 0 ? C.accent : C.border}}>
                    <Chip label={t.tag} color={t.tagCol} />
                    <div style={{fontFamily: heading, fontWeight: 800, fontSize: 58, color: C.ink, marginTop: 18}}>{t.title}</div>
                    <div style={{display: 'flex', alignItems: 'baseline', gap: 16, margin: '8px 0 12px'}}>
                      <span style={{fontFamily: heading, fontWeight: 800, fontSize: 150, color: C.primary, lineHeight: 1}}>{t.stat}</span>
                      <span style={{fontFamily: heading, fontWeight: 700, fontSize: 48, color: C.muted}}>questions</span>
                    </div>
                    <div style={{fontFamily: body, fontSize: 35, color: C.ink, lineHeight: 1.32}}>{t.desc}</div>
                    {i === 1 && (
                      <div style={{marginTop: 26, borderRadius: 18, border: `2px solid ${C.accent}`, background: `${C.accent}1F`, padding: '16px 26px', opacity: roadmap, transform: `translateY(${(1 - roadmap) * 18}px)`}}>
                        <span style={{fontFamily: heading, fontWeight: 800, fontSize: 34, color: C.accent}}>Roadmap  </span>
                        <span style={{fontFamily: body, fontSize: 34, color: C.ink}}>What to do, why, and in what order.</span>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
            <Touch x={1090} y={440} f={n} tapAt={160} show={prog(n, 140, 150) * (1 - prog(n, 196, 206))} />
            <Touch x={1560} y={700} f={n} tapAt={290} show={prog(n, 272, 282) * (1 - prog(n, 330, 340))} />
          </>
        );
      }}
    </Shell>
  );
};

// ---------- 5. Built for SMEs and their advisers (6s)
export const Scene5: React.FC = () => {
  const {fps} = useVideoConfig();
  const CARDS = [
    {x: 100, tag: 'Business Owners', text: 'Understand where your business stands on AI and what deserves attention first.'},
    {x: 990, tag: 'Advisers', text: 'Diagnose the client, prepare the conversation and create a useful next step.'},
    {x: 2020, tag: '01  Assess', text: "AI Ready Score establishes the business's current position."},
    {x: 2620, tag: '02  Prepare', text: 'Meeting Prep turns client context and researched intelligence into a focused brief.'},
    {x: 3220, tag: '03  Act', text: 'The owner and adviser decide what to address, test or investigate next.'},
  ];
  return (
    <Shell len={180} z0={1.04} z1={1}>
      {(n) => {
        const pan = prog(n, 70, 150) * 1940;
        return (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
              <Words text="Built for SMEs and their advisers" f={n} start={0} step={6} size={84} />
            </div>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${-pan}px)`}}>
              {CARDS.map((c, i) => {
                const t = spring({frame: n - (22 + (i < 2 ? i * 10 : 40 + i * 3)), fps, config: {damping: 14, stiffness: 100}});
                const bob = Math.sin((n + i * 20) / 20) * 8;
                const w = i < 2 ? 830 : 560;
                return (
                  <div key={c.tag} style={{position: 'absolute', left: c.x, top: 330 + bob, width: w, transform: `translateY(${(1 - Math.min(t, 1)) * 80}px) scale(${0.85 + 0.15 * Math.min(t, 1)})`, opacity: Math.min(1, t * 1.2)}}>
                    <Card style={{padding: 48, minHeight: 460, boxSizing: 'border-box'}}>
                      <div style={{fontFamily: heading, fontWeight: 800, fontSize: i < 2 ? 60 : 52, color: i < 2 ? C.primary : C.ink}}>{c.tag}</div>
                      <div style={{fontFamily: body, fontSize: 38, color: C.ink, lineHeight: 1.34, marginTop: 20}}>{c.text}</div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </>
        );
      }}
    </Shell>
  );
};

// ---------- 6. End card (6s)
export const Scene6: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <Shell len={180} last z0={0.94} z1={1.02}>
      {(n) => {
        const drop = n < 6 ? -300 : -300 * (1 - spring({frame: n - 6, fps, config: {damping: 12, stiffness: 80}}));
        const sy = interpolate(n, [20, 24, 30, 40], [1, 0.86, 1.05, 1], clamp);
        const needle = needleAt(n, 24, fps, -160);
        const w1 = prog(n, 40, 58), w2 = prog(n, 48, 66);
        const fade = 1 - prog(n, 164, 180);
        return (
          <div style={{position: 'absolute', inset: 0, opacity: fade}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center'}}>
              <Lockup markSize={280} fontSize={170} gap={56} needleDeg={needle} slide={prog(n, 36, 66)} w1={w1} w2={w2}
                markStyle={{transform: `translateY(${drop}px) scale(${2 - sy}, ${sy})`, transformOrigin: '50% 100%'}} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center'}}>
              <Words text="Know how AI-ready your business really is." f={n} start={70} step={5} size={68} weight={700} color={C.ink} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 810, textAlign: 'center', fontFamily: heading, fontWeight: 700, fontSize: 56, color: C.primary, opacity: prog(n, 104, 124)}}>aireadyscore.com</div>
          </div>
        );
      }}
    </Shell>
  );
};
