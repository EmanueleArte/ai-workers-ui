import React from 'react';
import { BLEED } from '../shared.jsx';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 8, STONE_W = 24, STONE_H = 13;
const PYR_X = 790, PYR_ROWS = 12, PYR_W = 340, PYR_ROW_H = 18;
const PATH_FROM = 235, PATH_TO = 600;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const PYR_TOTAL = PYR_ROWS * (PYR_ROWS + 1);

// palette: dusk over the desert, one warm light from the low sun on the left
const STONE_LIT = '#e6c48c', STONE_SHADE = '#b98d57', STONE_EDGE = '#7a5630';

function Stones({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count; i++, n++) {
      if (n >= remaining) break;
      out.push(<rect key={n} x={PILE_X - (count * STONE_W) / 2 + i * STONE_W} y={BASE_Y - (r + 1) * STONE_H}
        width={STONE_W - 1} height={STONE_H - 1} rx="1.5" fill={(n * 7) % 5 ? 'url(#eg-block)' : STONE_SHADE} stroke={STONE_EDGE} strokeWidth="0.8" />);
    }
  }
  return (
    <g>
      {remaining > 0 && <ellipse cx={PILE_X + 14} cy={BASE_Y + 2} rx={PILE_ROWS * STONE_W * 0.62} ry="7" fill="#5a3a1a" opacity="0.22" />}
      {out}
    </g>
  );
}

function Pyramid({ progress }) {
  const placed = Math.round(progress * PYR_TOTAL);
  const bw = PYR_W / (PYR_ROWS * 2);
  const out = [];
  let n = 0;
  for (let r = 0; r < PYR_ROWS; r++) {
    const count = 2 * (PYR_ROWS - r);
    const x0 = PYR_X - (count * bw) / 2;
    for (let i = 0; i < count; i++, n++) {
      if (n >= placed) break;
      const cap = r === PYR_ROWS - 1;
      const lit = i < count / 2; // sun on the left: the west face catches the light
      out.push(<rect key={n} x={x0 + i * bw} y={BASE_Y - (r + 1) * PYR_ROW_H} width={bw - 0.8} height={PYR_ROW_H - 0.8}
        fill={cap ? (lit ? '#f6d36b' : '#d4a535') : lit ? STONE_LIT : STONE_SHADE}
        stroke={cap ? '#a8780f' : STONE_EDGE} strokeWidth="0.6" strokeOpacity="0.7" />);
    }
  }
  const top = BASE_Y - PYR_ROWS * PYR_ROW_H;
  return (
    <g>
      {placed > 0 && <path d={`M${PYR_X},${BASE_Y} L${PYR_X + PYR_W / 2},${BASE_Y} L${PYR_X + PYR_W / 2 + 60},${BASE_Y + 22} L${PYR_X + 20},${BASE_Y + 22} Z`}
        fill="#5a3a1a" opacity={0.18 * Math.min(1, progress * 2)} />}
      <polygon points={`${PYR_X - PYR_W / 2},${BASE_Y} ${PYR_X + PYR_W / 2},${BASE_Y} ${PYR_X},${top}`}
        fill="#fff3d6" fillOpacity="0.08" stroke="#7a5630" strokeWidth="1" strokeDasharray="4 5" strokeOpacity="0.45" />
      {out}
    </g>
  );
}

// Defs here (eg-block, eg-collar, nemes) are also used by the figures.
export const Backdrop = React.memo(function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          <stop offset="0" stopColor="#2c4a5c" />
          <stop offset="0.45" stopColor="#b7774a" />
          <stop offset="0.8" stopColor="#f0b673" />
          <stop offset="1" stopColor="#f8dcaa" />
        </linearGradient>
        <radialGradient id="eg-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.18" stopColor="#ffe3a3" />
          <stop offset="0.4" stopColor="#ffd08a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffc879" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sand" gradientUnits="userSpaceOnUse" x1="0" y1={BASE_Y - 10} x2="0" y2={H}>
          <stop offset="0" stopColor="#dfae6b" />
          <stop offset="1" stopColor="#a8723f" />
        </linearGradient>
        <linearGradient id="eg-dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecc185" />
          <stop offset="1" stopColor="#d49d5d" />
        </linearGradient>
        <linearGradient id="eg-block" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efd09d" />
          <stop offset="1" stopColor="#cfa46a" />
        </linearGradient>
        <linearGradient id="eg-collar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a6aa8" />
          <stop offset="0.5" stopColor="#3fa0a0" />
          <stop offset="1" stopColor="#2a6aa8" />
        </linearGradient>
        <pattern id="nemes" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="#e0a63a" />
          <rect y="2" width="4" height="2" fill="#24599a" />
        </pattern>
      </defs>
      <rect x={-BLEED} y={-BLEED} width={W + 2 * BLEED} height={H + 2 * BLEED} fill="url(#sky)" />
      <circle cx="430" cy="250" r="190" fill="url(#eg-sun)" />
      <circle cx="430" cy="250" r="30" fill="#fff4d6" opacity="0.95" />
      {/* distant pyramids in the haze */}
      <g fill="#c48a5c" opacity="0.55">
        <polygon points="70,410 150,340 230,410" />
        <polygon points="190,412 245,365 300,412" />
        <polygon points="560,405 640,322 720,405" />
      </g>
      <g fill="#a46e47" opacity="0.4">
        <polygon points="150,340 230,410 170,410" />
        <polygon points="640,322 720,405 660,405" />
      </g>
      <path d={`M${-BLEED},${BASE_Y - 52} H0 Q180,${BASE_Y - 92} 400,${BASE_Y - 50} T1000,${BASE_Y - 62} H${W + BLEED} V${H} H${-BLEED} Z`} fill="url(#eg-dune)" opacity="0.9" />
      <path d={`M${-BLEED},${BASE_Y - 22} H0 Q260,${BASE_Y - 48} 520,${BASE_Y - 20} T1000,${BASE_Y - 26} H${W + BLEED} V${H} H${-BLEED} Z`} fill="#dcaa68" />
      <rect x={-BLEED} y={BASE_Y - 10} width={W + 2 * BLEED} height={H - BASE_Y + 10 + BLEED} fill="url(#sand)" />
      {/* trodden track between quarry and pyramid */}
      <path d={`M${PATH_FROM - 20},486 Q${(PATH_FROM + PATH_TO) / 2},478 ${PATH_TO + 30},486 L${PATH_TO + 40},545 Q${(PATH_FROM + PATH_TO) / 2},552 ${PATH_FROM - 30},545 Z`} fill="#8f5f31" opacity="0.14" />
      <g stroke="#8f5f31" strokeWidth="1" opacity="0.25" fill="none" strokeLinecap="round">
        <path d="M40,520 q30,-4 60,0" /><path d="M660,512 q40,-5 80,0" /><path d="M880,540 q30,-4 60,0" /><path d="M420,553 q30,-3 60,0" />
      </g>
      <Pyramid progress={progress} />
      <Stones progress={progress} />
    </g>
  );
});
