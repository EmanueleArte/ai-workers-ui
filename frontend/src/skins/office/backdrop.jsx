import React from 'react';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 7, FOLDER_W = 26, FOLDER_H = 9;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const RACK_X = 790, RACK_W = 110, UNIT_H = 24, UNITS = 12;

// backlog: stacks of folders on a desk, shrinking with progress
function Backlog({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const deskY = BASE_Y - 38;
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count && n < remaining; i++, n++) {
      out.push(<rect key={n} x={PILE_X - 20 - (count * FOLDER_W) / 2 + i * FOLDER_W} y={deskY - (r + 1) * FOLDER_H}
        width={FOLDER_W - 2} height={FOLDER_H - 1} rx="1" fill={['#f4d35e', '#ee964b', '#7fb8e6'][n % 3]} stroke="#6b5b3a" strokeWidth="0.6" />);
    }
  }
  return (
    <g>
      <rect x={PILE_X - 110} y={deskY} width="220" height="8" fill="#8d6e53" stroke="#5c4433" />
      <rect x={PILE_X - 100} y={deskY + 8} width="8" height="30" fill="#5c4433" />
      <rect x={PILE_X + 92} y={deskY + 8} width="8" height="30" fill="#5c4433" />
      <rect x={PILE_X + 60} y={deskY - 34} width="40" height="28" rx="2" fill="#1f2937" stroke="#4b5563" />
      <rect x={PILE_X + 64} y={deskY - 30} width="32" height="20" fill="#38bdf8" opacity="0.7" />
      <rect x={PILE_X + 76} y={deskY - 6} width="8" height="6" fill="#4b5563" />
      {out}
    </g>
  );
}

// server rack: one unit is installed per step of progress
function Rack({ progress }) {
  const placed = Math.round(progress * UNITS);
  const x0 = RACK_X - RACK_W / 2, top = BASE_Y - UNITS * UNIT_H - 16;
  const units = [];
  for (let i = 0; i < UNITS; i++) {
    const y = BASE_Y - 8 - (i + 1) * UNIT_H;
    units.push(i < placed ? (
      <g key={i}>
        <rect x={x0 + 8} y={y + 1} width={RACK_W - 16} height={UNIT_H - 3} rx="2" fill="#374151" stroke="#030712" />
        {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={x0 + 16 + k * 9} y={y + 8} width="6" height="7" fill="#1f2937" />)}
        <circle cx={x0 + RACK_W - 22} cy={y + 11} r="2.5" fill="#4ade80" />
        <circle cx={x0 + RACK_W - 14} cy={y + 11} r="2.5" fill={i % 3 ? '#4ade80' : '#facc15'} />
      </g>
    ) : (
      <rect key={i} x={x0 + 8} y={y + 1} width={RACK_W - 16} height={UNIT_H - 3} fill="none" stroke="#9ca3af" strokeDasharray="4 3" opacity="0.6" />
    ));
  }
  return (
    <g>
      <rect x={x0} y={top} width={RACK_W} height={BASE_Y - top} rx="4" fill="#111827" stroke="#030712" strokeWidth="2" />
      <text x={RACK_X} y={top - 8} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">PROD</text>
      {units}
    </g>
  );
}

export function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="of-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8edf2" />
          <stop offset="1" stopColor="#cfd8e0" />
        </linearGradient>
        <linearGradient id="of-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4f0" />
          <stop offset="1" stopColor="#d4ecfa" />
        </linearGradient>
        <linearGradient id="of-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa5b1" />
          <stop offset="1" stopColor="#6b7785" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#of-wall)" />
      {/* windows with skyline */}
      {[40, 260, 480].map((x) => (
        <g key={x}>
          <rect x={x} y="40" width="190" height="210" fill="url(#of-glass)" stroke="#64748b" strokeWidth="4" />
          <path d={`M${x + 4},248 v-70 h30 v-40 h25 v60 h30 v-90 h28 v100 h22 v-50 h35 v90 Z`} fill="#94a3b8" opacity="0.7" />
          <line x1={x + 95} y1="40" x2={x + 95} y2="250" stroke="#64748b" strokeWidth="3" />
        </g>
      ))}
      {/* company sign */}
      <rect x="700" y="36" width="250" height="64" rx="8" fill="#0f172a" />
      <text x="825" y="76" textAnchor="middle" fill="#38bdf8" fontSize="30" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="2">Maidaive</text>
      <text x="825" y="92" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="system-ui, sans-serif">SOFTWARE &amp; IT SOLUTIONS</text>
      {/* plant */}
      <rect x="640" y={BASE_Y - 34} width="24" height="30" fill="#b45309" />
      <path d={`M652,${BASE_Y - 34} q-24,-30 -6,-56 M652,${BASE_Y - 34} q20,-26 10,-60 M652,${BASE_Y - 34} q-4,-40 2,-70`}
        stroke="#16a34a" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* floor */}
      <rect y={BASE_Y - 10} width={W} height={H - BASE_Y + 10} fill="url(#of-floor)" />
      <rect y={BASE_Y - 10} width={W} height="4" fill="#475569" />
      <Rack progress={progress} />
      <Backlog progress={progress} />
    </g>
  );
}
