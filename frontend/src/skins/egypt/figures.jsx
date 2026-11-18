import React from 'react';

const SKIN = '#b5743d', SKIN_DARK = '#8a5228';
const STONE_SHADE = '#b98d57', STONE_EDGE = '#7a5630';
const LINEN = '#f1e8d4', LINEN_EDGE = '#b9a988', INK = '#22160b';

export function Worker({ x, y, dir, carry, t, fall }) {
  const walking = fall === 0;
  const swing = walking ? Math.sin(t / 140) * 28 : 0;
  const bob = walking ? Math.abs(Math.sin(t / 140)) * 2 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <ellipse cx={-fall * 26 + 3} cy="2" rx={10 + fall * 22} ry="3" fill="#3b2410" opacity="0.28" />
      <g transform={`rotate(${-90 * fall}) translate(0,${-bob})`}>
        <line x1="0" y1="-24" x2="0" y2="0" stroke={SKIN_DARK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${swing},0,-24)`} />
        <line x1="0" y1="-24" x2="0" y2="0" stroke={SKIN} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-swing},0,-24)`} />
        <path d="M-5,-45 Q0,-47 5,-45 L5,-27 Q0,-25 -5,-27 Z" fill={SKIN} />
        <path d="M1,-45 Q4,-45 5,-44 L5,-28 Q3,-27 1,-27 Z" fill={SKIN_DARK} opacity="0.55" />
        <path d="M-7,-30 L7,-30 L9.5,-16 L-9.5,-16 Z" fill={LINEN} stroke={LINEN_EDGE} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M-7,-30 L7,-30 L7.4,-28 L-7.4,-28 Z" fill="#c98a3a" />
        {carry ? (
          <g>
            <line x1="0" y1="-42" x2="-5" y2="-60" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="-42" x2="6" y2="-60" stroke={SKIN_DARK} strokeWidth="4" strokeLinecap="round" />
            <rect x="-12" y="-71" width="24" height="12" rx="1.5" fill="url(#eg-block)" stroke={STONE_EDGE} strokeWidth="0.8" />
            <rect x="-12" y="-62" width="24" height="3" rx="1" fill={STONE_SHADE} />
          </g>
        ) : (
          <line x1="0" y1="-42" x2="0" y2="-26" stroke={SKIN} strokeWidth="4" strokeLinecap="round" transform={`rotate(${-swing},0,-42)`} />
        )}
        <circle cx="1" cy="-51" r="7" fill={SKIN} />
        <path d="M-6.5,-51 A7.2,7.2 0 0 1 8.2,-53 L6,-55 Q0,-58 -5,-55 L-7,-46 Z" fill={INK} />
        <circle cx="4.2" cy="-51" r="0.9" fill={INK} />
      </g>
    </g>
  );
}

export function Overseer({ x, y, dir, t, phase, fall }) {
  const active = fall === 0;
  const s = Math.sin(t / 260 + phase);
  const arm = active ? -70 + 45 * s : 20;          // arm angle in degrees
  const lag = active ? arm + 70 * Math.sin(t / 260 + phase - 1.1) : arm + 60;
  const rad = (d) => (d * Math.PI) / 180;
  const hx = 18 * Math.cos(rad(arm)), hy = -46 + 18 * Math.sin(rad(arm));
  const cx = hx + 28 * Math.cos(rad(arm + 20)), cy = hy + 28 * Math.sin(rad(arm + 20));
  const tx = hx + 50 * Math.cos(rad(lag)), ty = hy + 50 * Math.sin(rad(lag));
  const crack = active && s > 0.93;
  return (
    <g transform={`translate(${x},${y}) scale(${dir * 1.15},1.15)`}>
      <ellipse cx={-fall * 28 + 3} cy="2" rx={11 + fall * 22} ry="3" fill="#3b2410" opacity="0.28" />
      <g transform={`rotate(${-90 * fall})`}>
        <line x1="-3" y1="-24" x2="-4" y2="0" stroke={SKIN_DARK} strokeWidth="5" strokeLinecap="round" />
        <line x1="3" y1="-24" x2="5" y2="0" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        <path d="M-5.5,-47 Q0,-49 5.5,-47 L5.5,-27 Q0,-25 -5.5,-27 Z" fill={SKIN} />
        <path d="M-8,-31 L8,-31 L12,-12 L-12,-12 Z" fill={LINEN} stroke={LINEN_EDGE} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M0,-31 L3,-12 L-3,-12 Z" fill="#e2d6b8" />
        <rect x="-8" y="-33" width="16" height="4" rx="1" fill="#d39b2f" stroke="#9a6a14" strokeWidth="0.5" />
        <path d="M-7,-45 Q0,-38 7,-45 L7,-40 Q0,-33 -7,-40 Z" fill="url(#eg-collar)" />
        <line x1="0" y1="-44" x2="-7" y2="-30" stroke={SKIN_DARK} strokeWidth="4" strokeLinecap="round" />
        <path d={`M${hx},${hy} Q${cx},${cy} ${tx},${ty}`} stroke="#4a2e14" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {crack && <path d={`M${tx - 5},${ty} l10,0 M${tx},${ty - 5} l0,10 M${tx - 4},${ty - 4} l8,8`} stroke="#fff3b0" strokeWidth="1.5" strokeLinecap="round" />}
        <line x1="0" y1="-44" x2={hx} y2={hy} stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
        <path d="M-9,-52 L9,-52 L11,-38 L-11,-38 Z" fill="url(#nemes)" />
        <circle cx="1" cy="-53" r="7.5" fill={SKIN} />
        <path d="M-8,-54 Q1,-64 10,-54 L9,-52 L-8,-52 Z" fill="url(#nemes)" />
        <path d="M-8,-54 Q1,-64 10,-54" fill="none" stroke="#9a6a14" strokeWidth="0.6" />
        <circle cx="4.5" cy="-53" r="1" fill={INK} />
        <path d="M3,-54.5 h4" stroke={INK} strokeWidth="0.7" />
      </g>
    </g>
  );
}
