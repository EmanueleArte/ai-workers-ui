import React from 'react';
import { BLEED } from '../shared.jsx';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 6, CRATE_W = 28, CRATE_H = 18;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const RKT_X = 790, RKT_W = 64, MOD_H = 28, MODS = 11, NOSE_H = 72; // top at 470-308-72 = 90
const RKT_TOTAL = MODS + 1; // body modules + nose cone

// palette: cold lunar night, steel greys, one signal orange
const STEEL = '#5d6878', STEEL_DARK = '#2a313c', ORANGE = '#e8742a', ORANGE_DARK = '#9c4313';

// deterministic star field (LCG), computed once
const STARS = [];
for (let i = 0, s = 7; i < 110; i++) {
  s = (s * 1103515245 + 12345) % 2147483648;
  const x = s % W;
  s = (s * 1103515245 + 12345) % 2147483648;
  STARS.push({ x, y: s % 400, r: 0.4 + (s % 3) * 0.45 });
}

// shortcut: tiles cover the bleed up to 3 screens sideways and 4 star bands up; beyond that the sky is plain.
const STAR_TILES = [];
for (let i = -3; i <= 3; i++) for (let j = 0; j <= 4; j++) if (i || j) STAR_TILES.push([i * W, -j * 400]);

function Cargo({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count && n < remaining; i++, n++) {
      const x = PILE_X - (count * CRATE_W) / 2 + i * CRATE_W, y = BASE_Y - (r + 1) * CRATE_H;
      out.push(<g key={n}>
        <rect x={x} y={y} width={CRATE_W - 1} height={CRATE_H - 1} rx="2" fill="url(#sp-crate)" stroke={STEEL_DARK} strokeWidth="0.8" />
        <rect x={x + 3} y={y + 6} width={CRATE_W - 7} height="4" fill={n % 4 ? ORANGE : '#d9dde3'} />
        <rect x={x + 1} y={y + CRATE_H - 4} width={CRATE_W - 3} height="2" fill={STEEL_DARK} opacity="0.35" />
      </g>);
    }
  }
  return (
    <g>
      {remaining > 0 && <ellipse cx={PILE_X + 10} cy={BASE_Y + 2} rx={PILE_ROWS * CRATE_W * 0.6} ry="7" fill="#000" opacity="0.35" />}
      {out}
    </g>
  );
}

function Rocket({ progress }) {
  const placed = Math.round(progress * RKT_TOTAL);
  const x0 = RKT_X - RKT_W / 2, topY = BASE_Y - MODS * MOD_H;
  const nose = `M${x0},${topY} C${x0},${topY - 30} ${RKT_X - 14},${topY - NOSE_H + 8} ${RKT_X},${topY - NOSE_H} C${RKT_X + 14},${topY - NOSE_H + 8} ${x0 + RKT_W},${topY - 30} ${x0 + RKT_W},${topY} Z`;
  const mods = [];
  for (let i = 0; i < Math.min(placed, MODS); i++) {
    const y = BASE_Y - (i + 1) * MOD_H;
    mods.push(<g key={i}>
      <rect x={x0} y={y} width={RKT_W} height={MOD_H - 1} fill="url(#sp-hull)" stroke="#3b4452" strokeWidth="0.8" />
      {i === 0 && <path d={`M${x0},${y} l-20,${MOD_H} h20 Z M${x0 + RKT_W},${y} l20,${MOD_H} h-20 Z`} fill={ORANGE} stroke={ORANGE_DARK} strokeWidth="1" strokeLinejoin="round" />}
      {i === 7 && <g><circle cx={RKT_X} cy={y + MOD_H / 2} r="8" fill="url(#sp-port)" stroke="#2a313c" strokeWidth="2" /><path d={`M${RKT_X - 4},${y + MOD_H / 2 - 3} q3,-3 6,-1`} stroke="#fff" strokeWidth="1" fill="none" opacity="0.7" /></g>}
      {i % 4 === 2 && <rect x={x0} y={y + 10} width={RKT_W} height="6" fill={STEEL_DARK} opacity="0.55" />}
      {i === 4 && <text x={RKT_X} y={y + 19} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2a313c" fontFamily="ui-monospace, Consolas, monospace" letterSpacing="2">AW-1</text>}
    </g>);
  }
  return (
    <g>
      {/* floodlight cone from the tower */}
      <path d={`M890,140 L${x0 - 30},${BASE_Y} L${x0 + RKT_W + 60},${BASE_Y} Z`} fill="url(#sp-beam)" />
      {/* launch tower */}
      <g stroke={STEEL} strokeWidth="2" fill="none">
        <line x1="866" y1={BASE_Y} x2="866" y2="130" /><line x1="890" y1={BASE_Y} x2="890" y2="130" />
        {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M866,${BASE_Y - i * 20} L890,${BASE_Y - (i + 1) * 20} M866,${BASE_Y - i * 20} H890`} strokeWidth="1.2" />)}
        <line x1="866" y1="200" x2={RKT_X + RKT_W / 2} y2="200" strokeWidth="3" stroke="#7a8596" />
      </g>
      <rect x="860" y="122" width="36" height="8" rx="1" fill={STEEL_DARK} />
      <circle cx="878" cy="116" r="7" fill="#ff5a3d" opacity="0.25" />
      <circle cx="878" cy="116" r="3" fill="#ff5a3d" />
      <ellipse cx={RKT_X + 10} cy={BASE_Y + 6} rx="150" ry="10" fill="#000" opacity="0.3" />
      <rect x="690" y={BASE_Y - 6} width="210" height="10" rx="1" fill="#3a424e" stroke="#1c2129" />
      <path d={`M690,${BASE_Y - 6} h210`} stroke="#8a95a6" strokeWidth="1" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={696 + i * 21} y={BASE_Y - 1} width="10" height="3" fill={i % 2 ? ORANGE : '#1c2129'} opacity="0.8" />)}
      <path d={`M${x0},${BASE_Y} V${topY} C${x0},${topY - 30} ${RKT_X - 14},${topY - NOSE_H + 8} ${RKT_X},${topY - NOSE_H} C${RKT_X + 14},${topY - NOSE_H + 8} ${x0 + RKT_W},${topY - 30} ${x0 + RKT_W},${topY} V${BASE_Y}`}
        fill="#cfe3ff" fillOpacity="0.04" stroke="#a9c3e6" strokeDasharray="5 4" opacity="0.45" />
      {mods}
      {placed >= RKT_TOTAL && <path d={nose} fill="url(#sp-nose)" stroke={ORANGE_DARK} strokeWidth="1.2" />}
    </g>
  );
}

export const Backdrop = React.memo(function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="sp-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          <stop offset="0" stopColor="#03060d" />
          <stop offset="0.65" stopColor="#0b1a2c" />
          <stop offset="1" stopColor="#1a3048" />
        </linearGradient>
        <radialGradient id="sp-earth" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#5ea8e0" />
          <stop offset="0.55" stopColor="#2a62a3" />
          <stop offset="1" stopColor="#0d2240" />
        </radialGradient>
        <radialGradient id="sp-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.78" stopColor="#7cc4ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7cc4ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sp-ground" gradientUnits="userSpaceOnUse" x1="0" y1={BASE_Y - 10} x2="0" y2={H}>
          <stop offset="0" stopColor="#7b808a" />
          <stop offset="1" stopColor="#2e323a" />
        </linearGradient>
        <linearGradient id="sp-ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f5663" />
          <stop offset="1" stopColor="#3a404b" />
        </linearGradient>
        <linearGradient id="sp-hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8892a1" />
          <stop offset="0.35" stopColor="#f4f7fa" />
          <stop offset="0.6" stopColor="#d9dee5" />
          <stop offset="1" stopColor="#6e7888" />
        </linearGradient>
        <linearGradient id="sp-nose" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c2581c" />
          <stop offset="0.4" stopColor="#f59a52" />
          <stop offset="1" stopColor="#a8481a" />
        </linearGradient>
        <linearGradient id="sp-crate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7ccd4" />
          <stop offset="1" stopColor="#9199a5" />
        </linearGradient>
        <radialGradient id="sp-port" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#b8e6ff" />
          <stop offset="1" stopColor="#1f4f7a" />
        </radialGradient>
        <linearGradient id="sp-beam" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3d6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff3d6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={-BLEED} y={-BLEED} width={W + 2 * BLEED} height={H + 2 * BLEED} fill="url(#sp-sky)" />
      <g id="sp-stars">
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i % 7 ? '#fff' : '#ffd9b0'} opacity={0.35 + (i % 5) * 0.12} />)}
      </g>
      {/* repeat the star field into the sky revealed by a wider or taller viewport */}
      {STAR_TILES.map(([dx, dy]) => <use key={`${dx},${dy}`} href="#sp-stars" x={dx} y={dy} />)}
      {/* earthrise */}
      <circle cx="420" cy="110" r="72" fill="url(#sp-halo)" />
      <circle cx="420" cy="110" r="58" fill="url(#sp-earth)" />
      <path d="M382,82 q26,-12 48,6 t38,18 M372,128 q24,10 44,0 M430,150 q14,-6 26,-2" stroke="#4f9a6a" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M370,100 q30,-8 70,2 M400,140 q20,-4 40,0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d="M420,52 A58,58 0 0 1 420,168 A44,58 0 0 0 420,52 Z" fill="#03060d" opacity="0.55" />
      {/* distant ridge and ground */}
      <path d={`M${-BLEED},${BASE_Y - 40} H0 L80,${BASE_Y - 62} L150,${BASE_Y - 48} L260,${BASE_Y - 80} L340,${BASE_Y - 52} L470,${BASE_Y - 66} L600,${BASE_Y - 44} L700,${BASE_Y - 70} L820,${BASE_Y - 50} L1000,${BASE_Y - 64} H${W + BLEED} V${H} H${-BLEED} Z`} fill="url(#sp-ridge)" />
      <path d={`M${-BLEED},${BASE_Y - 20} H0 Q160,${BASE_Y - 45} 360,${BASE_Y - 20} T1000,${BASE_Y - 28} H${W + BLEED} V${H} H${-BLEED} Z`} fill="#5a606b" />
      <rect x={-BLEED} y={BASE_Y - 10} width={W + 2 * BLEED} height={H - BASE_Y + 10 + BLEED} fill="url(#sp-ground)" />
      {[[660, 530, 26], [90, 522, 34], [470, 548, 20], [930, 505, 18]].map(([cx, cy, rx], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.22} fill="#24282f" />
          <path d={`M${cx - rx},${cy} A${rx},${rx * 0.22} 0 0 0 ${cx + rx},${cy}`} stroke="#9aa1ad" strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      ))}
      <Rocket progress={progress} />
      <Cargo progress={progress} />
    </g>
  );
});
