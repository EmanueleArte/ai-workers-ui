import React from 'react';

const SKIN = '#f1c7a0', SKIN_DARK = '#d9a77c';
const PANTS = '#334155', PANTS_DARK = '#1e293b';

export function Developer({ x, y, dir, carry, t, fall, shirt }) {
  const walking = fall === 0;
  const swing = walking ? Math.sin(t / 140) * 28 : 0;
  const bob = walking ? Math.abs(Math.sin(t / 140)) * 2 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <ellipse cx={-fall * 26} cy="2" rx={10 + fall * 22} ry="3" fill="#1e293b" opacity="0.3" />
      <g transform={`rotate(${-90 * fall}) translate(0,${-bob})`}>
        <line x1="0" y1="-24" x2="0" y2="0" stroke={PANTS_DARK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${swing},0,-24)`} />
        <line x1="0" y1="-24" x2="0" y2="0" stroke={PANTS} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-swing},0,-24)`} />
        <rect x="-7" y="-46" width="14" height="24" rx="4" fill={shirt} />
        <path d="M2,-46 Q7,-46 7,-41 L7,-26 Q7,-22 3,-22 Z" fill="#000" opacity="0.18" />
        <path d="M-3,-46 Q1,-42 5,-46" stroke="#fff" strokeWidth="1" fill="none" opacity="0.45" />
        {carry ? (
          <g>
            {/* server blade carried to the rack */}
            <line x1="0" y1="-42" x2="-5" y2="-62" stroke={shirt} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="-42" x2="6" y2="-62" stroke={shirt} strokeWidth="4" strokeLinecap="round" />
            <rect x="-14" y="-73" width="28" height="11" rx="2" fill="#334155" stroke="#020617" strokeWidth="0.8" />
            <path d="M-11,-69 h12 M-11,-66 h12" stroke="#0b1220" strokeWidth="1.5" />
            <circle cx="9" cy="-67.5" r="1.8" fill="#4ade80" />
          </g>
        ) : (
          <line x1="0" y1="-42" x2="0" y2="-26" stroke={shirt} strokeWidth="4" strokeLinecap="round" transform={`rotate(${-swing},0,-42)`} />
        )}
        <circle cx="1" cy="-53" r="7" fill={SKIN} />
        <path d="M-6,-55 Q1,-63 8,-55 L8,-57 Q1,-64 -7,-56 Z" fill="#3f2a1c" />
        <circle cx="4" cy="-53" r="1" fill="#1b130b" />
        {/* headphones */}
        <path d="M-6,-55 A7,7 0 0 1 8,-56" stroke="#111" strokeWidth="1.5" fill="none" />
        <rect x="-8" y="-56" width="3" height="5" rx="1" fill="#111" />
      </g>
    </g>
  );
}

export function Manager({ x, y, dir, t, phase, fall }) {
  const active = fall === 0;
  const s = Math.sin(t / 260 + phase);
  const arm = active ? -60 + 35 * s : 20; // pointing arm angle in degrees
  const rad = (arm * Math.PI) / 180;
  const hx = 18 * Math.cos(rad), hy = -44 + 18 * Math.sin(rad);
  return (
    <g transform={`translate(${x},${y}) scale(${dir * 1.15},1.15)`}>
      <ellipse cx={-fall * 28} cy="2" rx={11 + fall * 22} ry="3" fill="#1e293b" opacity="0.3" />
      <g transform={`rotate(${-90 * fall})`}>
        <line x1="-3" y1="-24" x2="-4" y2="0" stroke={PANTS_DARK} strokeWidth="5" strokeLinecap="round" />
        <line x1="3" y1="-24" x2="5" y2="0" stroke={PANTS} strokeWidth="5" strokeLinecap="round" />
        <rect x="-8" y="-47" width="16" height="25" rx="4" fill="#1e3a5f" />
        <path d="M3,-47 Q8,-47 8,-42 L8,-26 Q8,-22 4,-22 Z" fill="#0f172a" opacity="0.35" />
        <path d="M-2,-47 L2,-47 L1,-34 L0,-32 L-1,-34 Z" fill="#fff" />
        <path d="M-1,-44 L1,-44 L1.5,-36 L0,-34 L-1.5,-36 Z" fill="#f97316" />
        {/* tablet */}
        <line x1="0" y1="-44" x2="-6" y2="-32" stroke="#1e3a5f" strokeWidth="4" strokeLinecap="round" />
        <rect x="-12" y="-38" width="10" height="13" rx="1.5" fill="#111827" />
        <rect x="-11" y="-37" width="8" height="10" fill={active && s > 0.5 ? '#4ade80' : '#38bdf8'} />
        <line x1="0" y1="-44" x2={hx} y2={hy} stroke="#1e3a5f" strokeWidth="4" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r="2.2" fill={SKIN_DARK} />
        <circle cx="1" cy="-54" r="7.5" fill={SKIN} />
        <path d="M-7,-56 Q1,-65 9,-56 L8,-59 Q1,-64 -6,-59 Z" fill="#9ca3af" />
        <circle cx="4.5" cy="-54" r="1" fill="#1b130b" />
      </g>
    </g>
  );
}
