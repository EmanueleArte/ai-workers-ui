import React from 'react';

const SUIT = '#eef1f5', SUIT_DARK = '#aeb7c3', TRIM = '#5d6878', VISOR = '#1d3557', VISOR_GLOW = '#e8a15a';
const ORANGE = '#e8742a', ORANGE_DARK = '#9c4313';

function Helmet({ cy }) {
  return (
    <g>
      <circle cx="1" cy={cy} r="9" fill={SUIT} stroke={TRIM} strokeWidth="0.8" />
      <path d={`M-7,${cy + 4} A9,9 0 0 0 9,${cy + 4}`} fill="none" stroke={SUIT_DARK} strokeWidth="2" opacity="0.7" />
      <path d={`M-1,${cy - 5} Q9,${cy - 5} 9,${cy} Q9,${cy + 5} -1,${cy + 5} Q2,${cy} -1,${cy - 5} Z`} fill={VISOR} />
      <path d={`M1,${cy + 3} Q6,${cy + 4} 8.4,${cy + 1}`} stroke={VISOR_GLOW} strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d={`M3,${cy - 3} Q6,${cy - 3} 7,${cy - 1}`} stroke="#fff" strokeWidth="1" fill="none" opacity="0.75" strokeLinecap="round" />
    </g>
  );
}

export function Astronaut({ x, y, dir, carry, t, fall }) {
  const walking = fall === 0;
  const swing = walking ? Math.sin(t / 140) * 28 : 0;
  const bob = walking ? Math.abs(Math.sin(t / 140)) * 2 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <ellipse cx={-fall * 26 + 2} cy="2" rx={10 + fall * 22} ry="3" fill="#000" opacity="0.4" />
      <g transform={`rotate(${-90 * fall}) translate(0,${-bob})`}>
        <line x1="0" y1="-24" x2="0" y2="-2" stroke={SUIT_DARK} strokeWidth="7" strokeLinecap="round" transform={`rotate(${swing},0,-24)`} />
        <line x1="0" y1="-24" x2="0" y2="-2" stroke={SUIT} strokeWidth="7" strokeLinecap="round" transform={`rotate(${-swing},0,-24)`} />
        <rect x="-12" y="-47" width="8" height="20" rx="2" fill={SUIT_DARK} stroke={TRIM} strokeWidth="0.8" />
        <rect x="-11" y="-43" width="2" height="8" rx="1" fill={ORANGE} />
        <rect x="-6" y="-48" width="13" height="24" rx="5" fill={SUIT} stroke={TRIM} strokeWidth="0.8" />
        <path d="M2,-47 Q7,-46 7,-40 L7,-29 Q7,-25 3,-25 Z" fill={SUIT_DARK} opacity="0.45" />
        <rect x="-2" y="-40" width="6" height="5" rx="1" fill={ORANGE} />
        <line x1="-6" y1="-30" x2="7" y2="-30" stroke={TRIM} strokeWidth="1" opacity="0.6" />
        {carry ? (
          <g>
            <line x1="0" y1="-44" x2="-5" y2="-64" stroke={SUIT} strokeWidth="5" strokeLinecap="round" />
            <line x1="0" y1="-44" x2="6" y2="-64" stroke={SUIT_DARK} strokeWidth="5" strokeLinecap="round" />
            <rect x="-13" y="-79" width="26" height="14" rx="2" fill="url(#sp-crate)" stroke={TRIM} strokeWidth="0.8" />
            <rect x="-10" y="-74" width="20" height="3" fill={ORANGE} />
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
      <ellipse cx={-fall * 28 + 2} cy="2" rx={11 + fall * 22} ry="3" fill="#000" opacity="0.4" />
      <g transform={`rotate(${-90 * fall})`}>
        <line x1="-3" y1="-24" x2="-4" y2="-2" stroke={ORANGE_DARK} strokeWidth="7" strokeLinecap="round" />
        <line x1="3" y1="-24" x2="5" y2="-2" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" />
        <rect x="-12" y="-47" width="8" height="20" rx="2" fill={ORANGE_DARK} stroke="#5e280b" strokeWidth="0.8" />
        <rect x="-6" y="-48" width="13" height="24" rx="5" fill={ORANGE} stroke={ORANGE_DARK} strokeWidth="0.8" />
        <path d="M2,-47 Q7,-46 7,-40 L7,-29 Q7,-25 3,-25 Z" fill={ORANGE_DARK} opacity="0.35" />
        <rect x="-4" y="-33" width="10" height="7" rx="1" fill="#141a22" stroke={TRIM} strokeWidth="0.6" />
        <rect x="-3" y="-32" width="4" height="2" fill={blink ? '#7cff6b' : '#2f5f2b'} />
        <line x1="0" y1="-44" x2="-6" y2="-30" stroke={ORANGE_DARK} strokeWidth="5" strokeLinecap="round" />
        <line x1="0" y1="-44" x2={hx} y2={hy} stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
        <line x1={hx} y1={hy} x2={bx} y2={by} stroke="#20262e" strokeWidth="2.5" strokeLinecap="round" />
        {blink && <circle cx={bx} cy={by} r="5" fill="#7cff6b" opacity="0.3" />}
        <circle cx={bx} cy={by} r="2.5" fill={blink ? '#7cff6b' : '#2f5f2b'} />
        <Helmet cy={-56} />
        <line x1="-6" y1="-62" x2="-10" y2="-74" stroke={TRIM} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="-10" cy="-75" r="2" fill={blink ? '#ff5a3d' : '#7a2418'} />
        <path d="M-8,-58 Q-10,-50 -2,-49" stroke="#20262e" strokeWidth="1.2" fill="none" />
      </g>
    </g>
  );
}
