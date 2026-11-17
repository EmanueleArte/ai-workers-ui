import React from 'react';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 6, CRATE_W = 28, CRATE_H = 18;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const RKT_X = 790, RKT_W = 64, MOD_H = 28, MODS = 11, NOSE_H = 72; // top at 470-308-72 = 90
const RKT_TOTAL = MODS + 1; // body modules + nose cone

// deterministic star field (LCG), computed once
const STARS = [];
for (let i = 0, s = 7; i < 90; i++) {
  s = (s * 1103515245 + 12345) % 2147483648;
  const x = s % W;
  s = (s * 1103515245 + 12345) % 2147483648;
  STARS.push({ x, y: s % 400, r: 0.5 + (s % 3) * 0.5 });
}

function Cargo({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count && n < remaining; i++, n++) {
      const x = PILE_X - (count * CRATE_W) / 2 + i * CRATE_W, y = BASE_Y - (r + 1) * CRATE_H;
      out.push(<g key={n}>
        <rect x={x} y={y} width={CRATE_W - 1} height={CRATE_H - 1} rx="2" fill="#c9ccd3" stroke="#6b7280" />
        <rect x={x + 4} y={y + 6} width={CRATE_W - 9} height="4" fill="#e4572e" />
      </g>);
    }
  }
  return <g>{out}</g>;
}

function Rocket({ progress }) {
  const placed = Math.round(progress * RKT_TOTAL);
  const x0 = RKT_X - RKT_W / 2, topY = BASE_Y - MODS * MOD_H;
  const nose = `${x0},${topY} ${x0 + RKT_W},${topY} ${RKT_X},${topY - NOSE_H}`;
  const mods = [];
  for (let i = 0; i < Math.min(placed, MODS); i++) {
    const y = BASE_Y - (i + 1) * MOD_H;
    mods.push(<g key={i}>
      <rect x={x0} y={y} width={RKT_W} height={MOD_H - 1} fill="url(#sp-hull)" stroke="#5b6475" />
      {i === 0 && <path d={`M${x0},${y} l-20,${MOD_H} h20 Z M${x0 + RKT_W},${y} l20,${MOD_H} h-20 Z`} fill="#c0392b" stroke="#7f1d1d" />}
      {i === 7 && <circle cx={RKT_X} cy={y + MOD_H / 2} r="8" fill="#7dd3fc" stroke="#334155" strokeWidth="2" />}
      {i % 4 === 2 && <rect x={x0} y={y + 10} width={RKT_W} height="6" fill="#1f2937" opacity="0.5" />}
    </g>);
  }
  return (
    <g>
      {/* launch tower */}
      <g stroke="#9aa3b2" strokeWidth="2" fill="none">
        <line x1="866" y1={BASE_Y} x2="866" y2="130" /><line x1="890" y1={BASE_Y} x2="890" y2="130" />
        {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M866,${BASE_Y - i * 20} L890,${BASE_Y - (i + 1) * 20} M866,${BASE_Y - i * 20} H890`} />)}
        <line x1="866" y1="200" x2={RKT_X + RKT_W / 2} y2="200" strokeWidth="3" />
      </g>
      <circle cx="878" cy="126" r="4" fill="#ef4444" />
      <rect x="690" y={BASE_Y - 6} width="210" height="10" fill="#4b5563" stroke="#1f2937" />
      <path d={`M${x0},${BASE_Y} V${topY} L${RKT_X},${topY - NOSE_H} L${x0 + RKT_W},${topY} V${BASE_Y}`}
        fill="none" stroke="#cbd5e1" strokeDasharray="5 4" opacity="0.5" />
      {mods}
      {placed >= RKT_TOTAL && <polygon points={nose} fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />}
    </g>
  );
}

export function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="sp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05060f" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="sp-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b6f7a" />
          <stop offset="1" stopColor="#3a3d46" />
        </linearGradient>
        <linearGradient id="sp-hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9ca3af" />
          <stop offset="0.4" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#8b93a1" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sp-sky)" />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.5 + (i % 5) * 0.1} />)}
      <circle cx="420" cy="110" r="58" fill="#3b82f6" />
      <path d="M380,80 q30,-10 50,10 t40,20 M372,130 q25,10 45,0" stroke="#22c55e" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.8" />
      <circle cx="440" cy="100" r="58" fill="#05060f" opacity="0.35" />
      <path d={`M0,${BASE_Y - 20} Q160,${BASE_Y - 55} 360,${BASE_Y - 22} T1000,${BASE_Y - 30} V${H} H0 Z`} fill="#4b4f5a" />
      <rect y={BASE_Y - 10} width={W} height={H - BASE_Y + 10} fill="url(#sp-ground)" />
      <ellipse cx="660" cy="530" rx="26" ry="6" fill="#2f323a" />
      <ellipse cx="90" cy="520" rx="34" ry="7" fill="#2f323a" />
      <Rocket progress={progress} />
      <Cargo progress={progress} />
    </g>
  );
}
