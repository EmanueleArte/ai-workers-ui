import React from 'react';
import { BLEED } from '../shared.jsx';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 6, BLK_W = 28, BLK_H = 18;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const TWR_X = 790, TWR_W = 90, COURSE_H = 28, COURSES = 11; // top at 470-308 = 162
const TWR_TOTAL = COURSES + 1; // stone courses + battlements/flag

// palette: late afternoon in the valley, warm limestone, sage hills, oak timber
const MORTAR = '#6f665b', TIMBER = '#7a4f2a', TIMBER_DARK = '#4a2f18', BANNER = '#9e2a22';

function Quarry({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count && n < remaining; i++, n++) {
      const x = PILE_X - (count * BLK_W) / 2 + i * BLK_W, y = BASE_Y - (r + 1) * BLK_H;
      out.push(<g key={n}>
        <rect x={x} y={y} width={BLK_W - 1} height={BLK_H - 1} rx="1.5"
          fill={n % 3 ? 'url(#md-block)' : '#b3a994'} stroke={MORTAR} strokeWidth="0.8" />
        <path d={`M${x + 1},${y + 2} h${BLK_W - 4}`} stroke="#f3ead6" strokeWidth="1" opacity="0.5" />
      </g>);
    }
  }
  return (
    <g>
      {remaining > 0 && <ellipse cx={PILE_X + 12} cy={BASE_Y + 2} rx={PILE_ROWS * BLK_W * 0.6} ry="7" fill="#1f2a12" opacity="0.3" />}
      {out}
    </g>
  );
}

function Tower({ progress }) {
  const placed = Math.round(progress * TWR_TOTAL);
  const x0 = TWR_X - TWR_W / 2, topY = BASE_Y - COURSES * COURSE_H;
  const courses = [];
  for (let i = 0; i < Math.min(placed, COURSES); i++) {
    const y = BASE_Y - (i + 1) * COURSE_H;
    courses.push(<g key={i}>
      <rect x={x0} y={y} width={TWR_W} height={COURSE_H} fill="url(#md-stone)" stroke={MORTAR} strokeWidth="0.8" />
      <path d={`M${x0},${y + COURSE_H / 2} H${x0 + TWR_W}` +
        [0, 1, 2].map(k => ` M${x0 + 15 + k * 30},${y} v${COURSE_H / 2} M${x0 + 30 + k * 30},${y + COURSE_H / 2} v${COURSE_H / 2}`).join('')}
        stroke={MORTAR} strokeWidth="0.8" opacity="0.7" />
      {i === 0 && <g>
        <path d={`M${TWR_X - 14},${BASE_Y} v-18 a14,14 0 0 1 28,0 v18 Z`} fill="#4a2f18" stroke="#2a1a0c" strokeWidth="1" />
        <path d={`M${TWR_X},${BASE_Y} v-32 M${TWR_X - 14},${BASE_Y - 9} h28`} stroke="#2a1a0c" strokeWidth="0.8" />
      </g>}
      {(i === 5 || i === 9) && <g>
        <rect x={TWR_X - 4} y={y + 5} width="8" height="18" rx="4" fill="#1c1712" />
        {i === 5 && <rect x={TWR_X - 2.5} y={y + 9} width="5" height="12" rx="2.5" fill="#f2b552" opacity="0.8" />}
      </g>}
    </g>);
  }
  const merlons = Array.from({ length: 5 }, (_, k) => <rect key={k} x={x0 - 4 + k * 21} y={topY - 18} width="14" height="18" fill="url(#md-stone)" stroke={MORTAR} strokeWidth="0.8" />);
  return (
    <g>
      {placed > 0 && <path d={`M${x0},${BASE_Y} H${x0 + TWR_W} l70,18 H${x0 + 40} Z`} fill="#1f2a12" opacity="0.25" />}
      {/* wooden scaffolding */}
      <g stroke={TIMBER} strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1={x0 - 22} y1={BASE_Y} x2={x0 - 22} y2="150" /><line x1={x0 + TWR_W + 22} y1={BASE_Y} x2={x0 + TWR_W + 22} y2="150" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${x0 - 22},${BASE_Y - 40 - i * 40} H${x0} M${x0 + TWR_W},${BASE_Y - 40 - i * 40} H${x0 + TWR_W + 22}`} stroke={TIMBER_DARK} />)}
        {Array.from({ length: 4 }, (_, i) => <path key={'d' + i} d={`M${x0 - 22},${BASE_Y - i * 80} L${x0},${BASE_Y - 80 - i * 80}`} strokeWidth="2" />)}
      </g>
      <rect x={x0} y={topY - 18} width={TWR_W} height={BASE_Y - topY + 18} fill="#fff8e6" fillOpacity="0.06" stroke="#f6efe0" strokeDasharray="5 4" opacity="0.6" />
      {courses}
      {placed >= TWR_TOTAL && <g>
        {merlons}
        <line x1={TWR_X} y1={topY - 18} x2={TWR_X} y2={topY - 70} stroke={TIMBER_DARK} strokeWidth="3" strokeLinecap="round" />
        <path d={`M${TWR_X},${topY - 70} q17,2 34,9 q-17,7 -34,9 Z`} fill={BANNER} stroke="#5e1611" strokeWidth="1" />
        <circle cx={TWR_X + 12} cy={topY - 61} r="3" fill="#e6b84a" />
      </g>}
    </g>
  );
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="-2" y="-14" width="4" height="14" fill="#4a3320" />
      <ellipse cx="0" cy="-26" rx="13" ry="17" fill="#55703d" />
      <ellipse cx="-4" cy="-30" rx="7" ry="9" fill="#6f8d4c" />
    </g>
  );
}

export const Backdrop = React.memo(function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="md-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          <stop offset="0" stopColor="#6c9cc4" />
          <stop offset="0.6" stopColor="#c9d9dc" />
          <stop offset="1" stopColor="#f2e3c0" />
        </linearGradient>
        <radialGradient id="md-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.25" stopColor="#ffe9a8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="md-grass" gradientUnits="userSpaceOnUse" x1="0" y1={BASE_Y - 10} x2="0" y2={H}>
          <stop offset="0" stopColor="#7a9446" />
          <stop offset="1" stopColor="#3f5426" />
        </linearGradient>
        <linearGradient id="md-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e3d8c0" />
          <stop offset="0.45" stopColor="#d2c5a8" />
          <stop offset="1" stopColor="#9d917a" />
        </linearGradient>
        <linearGradient id="md-block" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9cdb2" />
          <stop offset="1" stopColor="#a99c82" />
        </linearGradient>
      </defs>
      <rect x={-BLEED} y={-BLEED} width={W + 2 * BLEED} height={H + 2 * BLEED} fill="url(#md-sky)" />
      <circle cx="140" cy="110" r="120" fill="url(#md-sun)" />
      <circle cx="140" cy="110" r="26" fill="#fff4d0" />
      <g fill="#fbf6ec" opacity="0.8">
        <path d="M300,98 q10,-22 36,-16 q14,-18 38,-6 q26,-4 30,18 Z" />
        <path d="M570,66 q8,-16 28,-12 q12,-14 30,-4 q20,-2 22,14 Z" />
      </g>
      {/* far hills with a distant keep */}
      <path d={`M${-BLEED},${BASE_Y - 60} H-700 Q-560,${BASE_Y - 130} -380,${BASE_Y - 80} Q-120,${BASE_Y - 30} 0,${BASE_Y - 60} Q140,${BASE_Y - 140} 300,${BASE_Y - 70} T620,${BASE_Y - 80} T1000,${BASE_Y - 90} T1350,${BASE_Y - 70} T1700,${BASE_Y - 60} H${W + BLEED} V${H} H${-BLEED} Z`} fill="#9fb08e" />
      <g fill="#8a9a7d">
        <rect x="470" y={BASE_Y - 128} width="26" height="40" />
        <rect x="496" y={BASE_Y - 110} width="40" height="24" />
        <path d={`M470,${BASE_Y - 128} h4 v-5 h5 v5 h5 v-5 h5 v5 h7 v-5 h0`} />
        {/* side bleed: sparse far silhouettes so wide screens don't show flat bands */}
        <rect x="-428" y={BASE_Y - 130} width="18" height="48" />
        <path d={`M-428,${BASE_Y - 130} v-5 h5 v5 h3 v-5 h4 v5 h3 v-5 h3 v5 Z`} />
        <path d={`M1470,${BASE_Y - 80} v-24 h22 v24 Z M1468,${BASE_Y - 104} l13,-14 l13,14 Z`} />
      </g>
      <path d={`M${-BLEED},${BASE_Y - 15} H-700 Q-520,${BASE_Y - 55} -330,${BASE_Y - 25} T0,${BASE_Y - 15} Q200,${BASE_Y - 60} 420,${BASE_Y - 20} T1000,${BASE_Y - 25} Q1180,${BASE_Y - 60} 1360,${BASE_Y - 30} T1700,${BASE_Y - 15} H${W + BLEED} V${H} H${-BLEED} Z`} fill="#6f8a47" />
      <Tree x={40} y={BASE_Y - 22} s={0.9} /><Tree x={66} y={BASE_Y - 18} s={0.7} />
      <Tree x={640} y={BASE_Y - 22} s={0.8} /><Tree x={960} y={BASE_Y - 24} s={1} />
      <Tree x={-260} y={BASE_Y - 20} s={0.8} /><Tree x={1230} y={BASE_Y - 34} s={0.7} /><Tree x={1252} y={BASE_Y - 32} s={0.55} />
      <rect x={-BLEED} y={BASE_Y - 10} width={W + 2 * BLEED} height={H - BASE_Y + 10 + BLEED} fill="url(#md-grass)" />
      {/* dirt road between quarry and tower */}
      <path d={`M210,${BASE_Y + 12} Q420,${BASE_Y + 2} 640,${BASE_Y + 12} L660,548 Q420,556 190,548 Z`} fill="#9a7444" opacity="0.5" />
      {[260, 330, 410, 480, 560, 300, 520].map((x, i) => <ellipse key={i} cx={x} cy={BASE_Y + 22 + (i % 3) * 18} rx="4" ry="2" fill="#5e4220" opacity="0.5" />)}
      <g stroke="#2f4020" strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
        {[30, 120, 700, 860, 930, 180, -150, -520, 1150, 1450].map((x, i) => <path key={i} d={`M${x},${500 + (i % 3) * 18} l-2,-6 M${x + 3},${500 + (i % 3) * 18} l1,-7 M${x + 6},${500 + (i % 3) * 18} l3,-5`} />)}
      </g>
      <Tower progress={progress} />
      <Quarry progress={progress} />
    </g>
  );
});
