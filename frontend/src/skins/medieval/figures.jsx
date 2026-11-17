import React from 'react';

const SKIN = '#e6c9a0', SKIN_DARK = '#b8926a', LINE = '#4a3520';
const TUNIC = '#7a5a34', TUNIC_DARK = '#5a4024', HOOD = '#5e7a3a', HOSE = '#4b5a3a';
const ROBE = '#3f5f3a', ROBE_DARK = '#2c4428', HAT = '#6b2f2a', STONE = '#9a9a92', STONE_DARK = '#6d6d66';
const PARCH = '#efe2bf';

function Head({ cy, hood }) {
  return (
    <g>
      {hood && <path d={`M-9,${cy + 6} Q-10,${cy - 11} 1,${cy - 11} Q11,${cy - 10} 9,${cy + 2} Z`} fill={HOOD} stroke={LINE} strokeWidth="0.8" />}
      <circle cx="2" cy={cy} r="6.5" fill={SKIN} stroke={SKIN_DARK} strokeWidth="0.8" />
      <circle cx="5" cy={cy - 1} r="1" fill={LINE} />
    </g>
  );
}

export function Peasant({ x, y, dir, carry, t, fall }) {
  const walking = fall === 0;
  const swing = walking ? Math.sin(t / 140) * 28 : 0;
  const bob = walking ? Math.abs(Math.sin(t / 140)) * 2 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <ellipse cx={-fall * 26} cy="2" rx={10 + fall * 22} ry="3" fill="#000" opacity="0.2" />
      <g transform={`rotate(${-90 * fall}) translate(0,${-bob})`}>
        <line x1="0" y1="-20" x2="0" y2="-2" stroke={TUNIC_DARK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${swing},0,-20)`} />
        <line x1="0" y1="-20" x2="0" y2="-2" stroke={HOSE} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-swing},0,-20)`} />
        <path d="M-7,-40 L7,-40 L10,-18 L-10,-18 Z" fill={TUNIC} stroke={LINE} strokeWidth="0.8" />
        <line x1="-9" y1="-25" x2="9" y2="-25" stroke={TUNIC_DARK} strokeWidth="2" />
        {carry ? (
          <g>
            <line x1="0" y1="-37" x2="-4" y2="-48" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
            <rect x="-14" y="-58" width="20" height="12" rx="1.5" fill={STONE} stroke={STONE_DARK} strokeWidth="1" />
            <path d="M-10,-54 L-6,-52 M0,-55 L3,-50" stroke={STONE_DARK} strokeWidth="0.8" />
          </g>
        ) : (
          <line x1="0" y1="-37" x2="0" y2="-24" stroke={SKIN} strokeWidth="4" strokeLinecap="round" transform={`rotate(${-swing},0,-37)`} />
        )}
        <Head cy={-46} hood />
      </g>
    </g>
  );
}

export function MasterBuilder({ x, y, dir, t, phase, fall }) {
  const active = fall === 0;
  const s = Math.sin(t / 260 + phase);
  const arm = active ? -60 + 35 * s : 20; // pointing arm angle in degrees
  const rad = (arm * Math.PI) / 180;
  const hx = 18 * Math.cos(rad), hy = -44 + 18 * Math.sin(rad);
  return (
    <g transform={`translate(${x},${y}) scale(${dir * 1.15},1.15)`}>
      <ellipse cx={-fall * 28} cy="2" rx={11 + fall * 22} ry="3" fill="#000" opacity="0.2" />
      <g transform={`rotate(${-90 * fall})`}>
        <path d="M-6,-48 L8,-48 L13,0 L-12,0 Z" fill={ROBE} stroke={ROBE_DARK} strokeWidth="1" />
        <line x1="-8" y1="-28" x2="10" y2="-28" stroke={HAT} strokeWidth="2" />
        {/* scroll held in the off hand */}
        <line x1="0" y1="-44" x2="-6" y2="-30" stroke={ROBE} strokeWidth="5" strokeLinecap="round" />
        <rect x="-11" y="-36" width="8" height="14" rx="1" fill={PARCH} stroke={LINE} strokeWidth="0.6" />
        <line x1="-10" y1="-31" x2="-4" y2="-31" stroke={LINE} strokeWidth="0.5" />
        <line x1="-10" y1="-28" x2="-4" y2="-28" stroke={LINE} strokeWidth="0.5" />
        <line x1="0" y1="-44" x2={hx} y2={hy} stroke={ROBE} strokeWidth="5" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r="2.5" fill={SKIN} />
        <Head cy={-56} />
        <path d="M-2,-52 Q2,-46 7,-52" fill="#d8d0c0" />
        <ellipse cx="1" cy="-61" rx="11" ry="2.5" fill={HAT} />
        <path d="M-5,-62 Q-4,-72 2,-72 Q8,-72 7,-62 Z" fill={HAT} stroke={LINE} strokeWidth="0.6" />
      </g>
    </g>
  );
}
