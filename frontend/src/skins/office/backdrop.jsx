import React from 'react';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 7, FOLDER_W = 26, FOLDER_H = 9;
const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const RACK_X = 790, RACK_W = 110, UNIT_H = 24, UNITS = 12;

// palette: warm grey studio, oak desk, navy hardware, one Maidaive orange
const ORANGE = '#f97316', NAVY = '#0f172a', OAK = '#a67c52', OAK_DARK = '#6b4a2e';
const FOLDERS = ['#f4c95d', '#f08a4b', '#8fb8d8'];

// backlog: stacks of folders on a desk, shrinking with progress
function Backlog({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const deskY = BASE_Y - 38;
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count && n < remaining; i++, n++) {
      const x = PILE_X - 20 - (count * FOLDER_W) / 2 + i * FOLDER_W, y = deskY - (r + 1) * FOLDER_H;
      out.push(<g key={n}>
        <rect x={x} y={y} width={FOLDER_W - 2} height={FOLDER_H - 1} rx="1" fill={FOLDERS[n % 3]} stroke="#5c4a30" strokeWidth="0.6" />
        <rect x={x + 2} y={y + FOLDER_H - 3} width={FOLDER_W - 6} height="1" fill="#fff" opacity="0.5" />
      </g>);
    }
  }
  return (
    <g>
      <ellipse cx={PILE_X} cy={BASE_Y + 1} rx="120" ry="7" fill="#1e293b" opacity="0.18" />
      <rect x={PILE_X - 110} y={deskY} width="220" height="8" rx="1.5" fill="url(#of-oak)" stroke={OAK_DARK} strokeWidth="0.8" />
      <rect x={PILE_X - 100} y={deskY + 8} width="6" height="30" fill="#334155" />
      <rect x={PILE_X + 94} y={deskY + 8} width="6" height="30" fill="#334155" />
      {/* monitor with a soft screen glow */}
      <ellipse cx={PILE_X + 80} cy={deskY - 20} rx="34" ry="24" fill="#38bdf8" opacity="0.12" />
      <rect x={PILE_X + 60} y={deskY - 34} width="40" height="28" rx="2.5" fill={NAVY} stroke="#334155" strokeWidth="0.8" />
      <rect x={PILE_X + 63} y={deskY - 31} width="34" height="20" rx="1" fill="url(#of-screen)" />
      <path d={`M${PILE_X + 66},${deskY - 26} h14 M${PILE_X + 66},${deskY - 22} h22 M${PILE_X + 66},${deskY - 18} h10`} stroke="#e2f2ff" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
      <rect x={PILE_X + 77} y={deskY - 6} width="6" height="6" fill="#334155" />
      <rect x={PILE_X + 70} y={deskY - 1.5} width="20" height="2" rx="1" fill="#334155" />
      <rect x={PILE_X + 30} y={deskY - 12} width="9" height="12" rx="1.5" fill="#fff" stroke="#cbd5e1" strokeWidth="0.6" />
      <rect x={PILE_X + 30} y={deskY - 12} width="9" height="3" fill={ORANGE} />
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
        <rect x={x0 + 8} y={y + 1} width={RACK_W - 16} height={UNIT_H - 3} rx="2" fill="url(#of-unit)" stroke="#020617" strokeWidth="0.8" />
        {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={x0 + 16 + k * 9} y={y + 8} width="6" height="7" rx="0.5" fill="#0b1220" />)}
        <circle cx={x0 + RACK_W - 22} cy={y + 11} r="2.5" fill="#4ade80" />
        <circle cx={x0 + RACK_W - 14} cy={y + 11} r="2.5" fill={i % 3 ? '#4ade80' : ORANGE} />
      </g>
    ) : (
      <rect key={i} x={x0 + 8} y={y + 1} width={RACK_W - 16} height={UNIT_H - 3} rx="2" fill="none" stroke="#64748b" strokeDasharray="4 3" opacity="0.6" />
    ));
  }
  return (
    <g>
      <ellipse cx={RACK_X + 8} cy={BASE_Y + 2} rx="80" ry="8" fill="#1e293b" opacity="0.25" />
      <rect x={x0} y={top} width={RACK_W} height={BASE_Y - top} rx="4" fill="#111827" stroke="#020617" strokeWidth="1.5" />
      <rect x={x0 + 2} y={top + 2} width="3" height={BASE_Y - top - 4} rx="1.5" fill="#475569" opacity="0.6" />
      <rect x={RACK_X - 24} y={top - 24} width="48" height="16" rx="3" fill={NAVY} />
      <text x={RACK_X} y={top - 12} textAnchor="middle" fill={ORANGE} fontSize="11" fontWeight="700" letterSpacing="2" fontFamily="ui-monospace, Consolas, monospace">PROD</text>
      {units}
    </g>
  );
}

export function Backdrop({ progress }) {
  return (
    <g>
      <defs>
        <linearGradient id="of-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eeebe6" />
          <stop offset="1" stopColor="#d9d4cc" />
        </linearGradient>
        <linearGradient id="of-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f8fb8" />
          <stop offset="0.7" stopColor="#c3d9ea" />
          <stop offset="1" stopColor="#f6dcc0" />
        </linearGradient>
        <linearGradient id="of-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9b2a6" />
          <stop offset="1" stopColor="#8b8478" />
        </linearGradient>
        <linearGradient id="of-oak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c49a6c" />
          <stop offset="1" stopColor={OAK} />
        </linearGradient>
        <linearGradient id="of-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e3a5f" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="of-unit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f4b5e" />
          <stop offset="1" stopColor="#273142" />
        </linearGradient>
        <linearGradient id="of-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7e8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff7e8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#of-wall)" />
      {/* windows with skyline */}
      {[40, 260, 480].map((x) => (
        <g key={x}>
          <rect x={x} y="40" width="190" height="210" fill="url(#of-glass)" />
          <path d={`M${x + 4},250 v-70 h30 v-40 h25 v60 h30 v-90 h28 v100 h22 v-50 h35 v90 Z`} fill="#6f86a0" opacity="0.55" />
          <path d={`M${x + 4},250 v-40 h40 v-20 h30 v35 h45 v-50 h30 v40 h37 v35 Z`} fill="#4f647d" opacity="0.5" />
          <rect x={x} y="40" width="190" height="210" fill="none" stroke="#475569" strokeWidth="4" />
          <line x1={x + 95} y1="40" x2={x + 95} y2="250" stroke="#475569" strokeWidth="3" />
          <rect x={x - 6} y="250" width="202" height="6" rx="1" fill="#cfc8bc" />
          {/* light falling into the room */}
          <path d={`M${x},256 L${x + 190},256 L${x + 240},${BASE_Y - 10} L${x + 30},${BASE_Y - 10} Z`} fill="url(#of-sun)" />
        </g>
      ))}
      {/* company sign */}
      <rect x="700" y="36" width="250" height="64" rx="10" fill={NAVY} />
      <text x="825" y="74" textAnchor="middle" fill={ORANGE} fontSize="30" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="2">Maidaive</text>
      <text x="825" y="89" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="system-ui, sans-serif" letterSpacing="1.5">SOFTWARE &amp; IT SOLUTIONS</text>
      {/* plant */}
      <ellipse cx="652" cy={BASE_Y - 4} rx="20" ry="4" fill="#1e293b" opacity="0.2" />
      <path d={`M640,${BASE_Y - 34} h24 l-3,30 h-18 Z`} fill="#e5ded3" stroke="#a89f90" strokeWidth="0.8" />
      <path d={`M652,${BASE_Y - 34} q-24,-30 -6,-56 M652,${BASE_Y - 34} q20,-26 10,-60 M652,${BASE_Y - 34} q-4,-40 2,-70`}
        stroke="#3f7d4e" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M652,${BASE_Y - 34} q-24,-30 -6,-56 M652,${BASE_Y - 34} q-4,-40 2,-70`}
        stroke="#5fa06a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* floor */}
      <rect y={BASE_Y - 10} width={W} height={H - BASE_Y + 10} fill="url(#of-floor)" />
      <rect y={BASE_Y - 10} width={W} height="4" fill="#57534e" />
      <g stroke="#7c766b" strokeWidth="1" opacity="0.35">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <line key={i} x1={i * 110 - 40} y1={H} x2={i * 100 + 10} y2={BASE_Y - 6} />)}
      </g>
      <Rack progress={progress} />
      <Backlog progress={progress} />
    </g>
  );
}
