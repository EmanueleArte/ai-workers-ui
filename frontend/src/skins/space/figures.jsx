import React from 'react';

const SUIT = '#eef1f5', SUIT_DARK = '#b9c1cc', TRIM = '#7d8796', VISOR = '#2b4a7a';
const ORANGE = '#e8742a', ORANGE_DARK = '#b5531a';

function Helmet({ cy }) {
  return (
    <g>
      <circle cx="1" cy={cy} r="9" fill={SUIT} stroke={TRIM} strokeWidth="1" />
      <path d={`M-1,${cy - 5} Q9,${cy - 5} 9,${cy} Q9,${cy + 5} -1,${cy + 5} Q2,${cy} -1,${cy - 5} Z`} fill={VISOR} />
      <path d={`M3,${cy - 3} Q6,${cy - 3} 7,${cy - 1}`} stroke="#fff" strokeWidth="1" fill="none" opacity="0.7" />
    </g>
  );
}

export function Astronaut({ x, y, dir, carry, t, fall }) {
  const walking = fall === 0;
  const swing = walking ? Math.sin(t / 140) * 28 : 0;
  const bob = walking ? Math.abs(Math.sin(t / 140)) * 2 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <ellipse cx={-fall * 26} cy="2" rx={10 + fall * 22} ry="3" fill="#000" opacity="0.2" />
      <g transform={`rotate(${-90 * fall}) translate(0,${-bob})`}>
        <line x1="0" y1="-24" x2="0" y2="-2" stroke={SUIT_DARK} strokeWidth="7" strokeLinecap="round" transform={`rotate(${swing},0,-24)`} />
        <line x1="0" y1="-24" x2="0" y2="-2" stroke={SUIT} strokeWidth="7" strokeLinecap="round" transform={`rotate(${-swing},0,-24)`} />
        <rect x="-11" y="-46" width="7" height="18" rx="2" fill={SUIT_DARK} stroke={TRIM} strokeWidth="0.8" />
        <rect x="-6" y="-48" width="13" height="24" rx="5" fill={SUIT} stroke={TRIM} strokeWidth="0.8" />
        <rect x="-2" y="-40" width="6" height="5" rx="1" fill={ORANGE} />
        {carry ? (
          <g>
            <line x1="0" y1="-44" x2="-5" y2="-64" stroke={SUIT} strokeWidth="5" strokeLinecap="round" />
            <line x1="0" y1="-44" x2="6" y2="-64" stroke={SUIT} strokeWidth="5" strokeLinecap="round" />
            <rect x="-13" y="-79" width="26" height="14" rx="3" fill="#c9ced6" stroke={TRIM} />
            <line x1="-13" y1="-72" x2="13" y2="-72" stroke="#d6453a" strokeWidth="2" />
          </g>
        ) : (
          <line x1="0" y1="-44" x2="0" y2="-28" stroke={SUIT} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-swing},0,-44)`} />
        )}
        <Helmet cy={-56} />
      </g>
    </g>
  );
}

export function Controller({ x, y, dir, t, phase, fall }) {
  const active = fall === 0;
  const s = Math.sin(t / 260 + phase);
  const arm = active ? -70 + 45 * s : 20; // baton arm angle in degrees
  const rad = (arm * Math.PI) / 180;
  const hx = 18 * Math.cos(rad), hy = -44 + 18 * Math.sin(rad);
  const bx = hx + 14 * Math.cos(rad - 0.4), by = hy + 14 * Math.sin(rad - 0.4);
  const blink = active && s > 0.6;
  return (
    <g transform={`translate(${x},${y}) scale(${dir * 1.15},1.15)`}>
      <ellipse cx={-fall * 28} cy="2" rx={11 + fall * 22} ry="3" fill="#000" opacity="0.2" />
      <g transform={`rotate(${-90 * fall})`}>
        <line x1="-3" y1="-24" x2="-4" y2="-2" stroke={ORANGE_DARK} strokeWidth="7" strokeLinecap="round" />
        <line x1="3" y1="-24" x2="5" y2="-2" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" />
        <rect x="-11" y="-46" width="7" height="18" rx="2" fill={ORANGE_DARK} />
        <rect x="-6" y="-48" width="13" height="24" rx="5" fill={ORANGE} stroke={ORANGE_DARK} strokeWidth="0.8" />
        <rect x="-4" y="-33" width="10" height="7" rx="1" fill="#1d2633" stroke={TRIM} strokeWidth="0.6" />
        <line x1="0" y1="-44" x2="-6" y2="-30" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
        <line x1="0" y1="-44" x2={hx} y2={hy} stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
        <line x1={hx} y1={hy} x2={bx} y2={by} stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={bx} cy={by} r="2.5" fill={blink ? '#7cff6b' : '#3a7d34'} />
        <Helmet cy={-56} />
        <line x1="-6" y1="-62" x2="-10" y2="-74" stroke={TRIM} strokeWidth="1.2" />
        <circle cx="-10" cy="-75" r="2" fill={blink ? '#ff4d3d' : '#8a2a22'} />
        <path d="M-8,-58 Q-10,-50 -2,-49" stroke="#333" strokeWidth="1.2" fill="none" />
      </g>
    </g>
  );
}
