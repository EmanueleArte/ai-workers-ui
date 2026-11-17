import React from 'react';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 6, BLK_W = 28, BLK_H = 18;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const TWR_X = 790, TWR_W = 90, COURSE_H = 28, COURSES = 11; // top at 470-308 = 162
const TWR_TOTAL = COURSES + 1; // stone courses + battlements/flag

function Quarry({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count && n < remaining; i++, n++) {
      const x = PILE_X - (count * BLK_W) / 2 + i * BLK_W, y = BASE_Y - (r + 1) * BLK_H;
      out.push(<rect key={n} x={x} y={y} width={BLK_W - 1} height={BLK_H - 1} rx="1.5"
        fill={n % 3 ? '#a8a29e' : '#9ca3af'} stroke="#57534e" />);
    }
  }
  return <g>{out}</g>;
}

function Tower({ progress }) {
  const placed = Math.round(progress * TWR_TOTAL);
  const x0 = TWR_X - TWR_W / 2, topY = BASE_Y - COURSES * COURSE_H;
  const courses = [];
  for (let i = 0; i < Math.min(placed, COURSES); i++) {
    const y = BASE_Y - (i + 1) * COURSE_H;
    courses.push(<g key={i}>
      <rect x={x0} y={y} width={TWR_W} height={COURSE_H} fill="url(#md-stone)" stroke="#57534e" />
      <path d={`M${x0},${y + COURSE_H / 2} H${x0 + TWR_W}` +
        [0, 1, 2].map(k => ` M${x0 + 15 + k * 30},${y} v${COURSE_H / 2} M${x0 + 30 + k * 30},${y + COURSE_H / 2} v${COURSE_H / 2}`).join('')}
        stroke="#78716c" strokeWidth="1" />
      {i === 0 && <path d={`M${TWR_X - 14},${BASE_Y} v-18 a14,14 0 0 1 28,0 v18 Z`} fill="#5b3a1e" stroke="#3b2412" />}
      {(i === 5 || i === 9) && <rect x={TWR_X - 4} y={y + 5} width="8" height="18" rx="4" fill="#1c1917" />}
    </g>);
  }
  const merlons = Array.from({ length: 5 }, (_, k) => <rect key={k} x={x0 - 4 + k * 21} y={topY - 18} width="14" height="18" fill="url(#md-stone)" stroke="#57534e" />);
  return (
    <g>
      {/* wooden scaffolding */}
      <g stroke="#8b5a2b" strokeWidth="3" fill="none">
        <line x1={x0 - 22} y1={BASE_Y} x2={x0 - 22} y2="150" /><line x1={x0 + TWR_W + 22} y1={BASE_Y} x2={x0 + TWR_W + 22} y2="150" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${x0 - 22},${BASE_Y - 40 - i * 40} H${x0} M${x0 + TWR_W},${BASE_Y - 40 - i * 40} H${x0 + TWR_W + 22}`} />)}
        {Array.from({ length: 4 }, (_, i) => <path key={'d' + i} d={`M${x0 - 22},${BASE_Y - i * 80} L${x0},${BASE_Y - 80 - i * 80}`} strokeWidth="2" />)}
      </g>
      <rect x={x0} y={topY - 18} width={TWR_W} height={BASE_Y - topY + 18} fill="none" stroke="#e7e5e4" strokeDasharray="5 4" opacity="0.6" />
      {courses}
      {placed >= TWR_TOTAL && <g>
        {merlons}
        <line x1={TWR_X} y1={topY - 18} x2={TWR_X} y2={topY - 70} stroke="#3b2412" strokeWidth="3" />
        <path d={`M${TWR_X},${topY - 70} l34,9 l-34,9 Z`} fill="#b91c1c" stroke="#7f1d1d" />
      </g>}
    </g>
  );
}

export function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="md-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4f2" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="md-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#65a30d" />
          <stop offset="1" stopColor="#3f6212" />
        </linearGradient>
        <linearGradient id="md-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8a29e" />
          <stop offset="0.5" stopColor="#d6d3d1" />
          <stop offset="1" stopColor="#8f8a86" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#md-sky)" />
      <circle cx="120" cy="80" r="34" fill="#fde047" opacity="0.9" />
      <g fill="#fff" opacity="0.85">
        <ellipse cx="360" cy="90" rx="50" ry="16" /><ellipse cx="395" cy="78" rx="30" ry="14" />
        <ellipse cx="620" cy="60" rx="42" ry="13" /><ellipse cx="650" cy="52" rx="24" ry="11" />
      </g>
      <path d={`M0,${BASE_Y - 40} Q140,${BASE_Y - 130} 300,${BASE_Y - 50} T620,${BASE_Y - 60} T1000,${BASE_Y - 70} V${H} H0 Z`} fill="#86a873" />
      <path d={`M0,${BASE_Y - 15} Q200,${BASE_Y - 60} 420,${BASE_Y - 20} T1000,${BASE_Y - 25} V${H} H0 Z`} fill="#6b8f4e" />
      <rect y={BASE_Y - 10} width={W} height={H - BASE_Y + 10} fill="url(#md-grass)" />
      <path d={`M225,${BASE_Y - 4} H610 Q620,${BASE_Y + 6} 610,${BASE_Y + 16} H225 Q215,${BASE_Y + 6} 225,${BASE_Y - 4} Z`} fill="#a16207" opacity="0.75" />
      {[260, 330, 410, 480, 560].map((x, i) => <ellipse key={i} cx={x} cy={BASE_Y + 6 + (i % 2) * 4} rx="4" ry="2" fill="#78350f" opacity="0.6" />)}
      <Tower progress={progress} />
      <Quarry progress={progress} />
    </g>
  );
}
