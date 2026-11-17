import React from 'react';

const W = 1000, H = 560, BASE_Y = 470;
const PILE_X = 130, PILE_ROWS = 8, STONE_W = 24, STONE_H = 13;
const PYR_X = 790, PYR_ROWS = 12, PYR_W = 340, PYR_ROW_H = 18;
const PATH_FROM = 235, PATH_TO = 600;
const TRIP_MS = 9000;          // full trip pile -> pyramid -> pile
const BUBBLE_MS = 30000;       // how long a new message stays visible
const FALL_MS = 900;

const PILE_TOTAL = (PILE_ROWS * (PILE_ROWS + 1)) / 2;
const PYR_TOTAL = PYR_ROWS * (PYR_ROWS + 1);
const SKIN = '#b5743d', SKIN_DARK = '#8a5228';

function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

function workerPose(w, t) {
  const h = hash(w.name);
  const p = (t / TRIP_MS + (h % 1000) / 1000) % 1;
  const going = p < 0.5;
  const k = going ? p * 2 : (1 - p) * 2; // 0 = at pile, 1 = at pyramid
  return {
    x: PATH_FROM + k * (PATH_TO - PATH_FROM),
    y: 488 + ((h >>> 10) % 5) * 12,
    dir: going ? 1 : -1,
    carry: going,
  };
}

function fallK(w, now) {
  if (w.status !== 'done') return 0;
  const k = Math.min(1, Math.max(0, (now - w.updatedAt) / FALL_MS));
  return k * k; // accelerate like gravity
}

function Stones({ progress }) {
  const remaining = Math.round((1 - progress) * PILE_TOTAL);
  const out = [];
  let n = 0;
  for (let r = 0; r < PILE_ROWS; r++) {
    const count = PILE_ROWS - r;
    for (let i = 0; i < count; i++, n++) {
      if (n >= remaining) break;
      out.push(<rect key={n} x={PILE_X - (count * STONE_W) / 2 + i * STONE_W} y={BASE_Y - (r + 1) * STONE_H}
        width={STONE_W - 1} height={STONE_H - 1} rx="2" fill="#d9b277" stroke="#9c7442" />);
    }
  }
  return <g>{out}</g>;
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
      out.push(<rect key={n} x={x0 + i * bw} y={BASE_Y - (r + 1) * PYR_ROW_H} width={bw - 0.8} height={PYR_ROW_H - 0.8}
        fill={cap ? '#f2c94c' : '#d6ab6c'} stroke={cap ? '#b8860b' : '#a07a45'} strokeWidth="0.8" />);
    }
  }
  return (
    <g>
      <polygon points={`${PYR_X - PYR_W / 2},${BASE_Y} ${PYR_X + PYR_W / 2},${BASE_Y} ${PYR_X},${BASE_Y - PYR_ROWS * PYR_ROW_H}`}
        fill="none" stroke="#8a6a3c" strokeDasharray="4 4" opacity="0.6" />
      {out}
    </g>
  );
}

function Worker({ x, y, dir, carry, t, fall }) {
  const walking = fall === 0;
  const swing = walking ? Math.sin(t / 140) * 28 : 0;
  const bob = walking ? Math.abs(Math.sin(t / 140)) * 2 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <ellipse cx={-fall * 26} cy="2" rx={10 + fall * 22} ry="3" fill="#000" opacity="0.2" />
      <g transform={`rotate(${-90 * fall}) translate(0,${-bob})`}>
        <line x1="0" y1="-24" x2="0" y2="0" stroke={SKIN_DARK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${swing},0,-24)`} />
        <line x1="0" y1="-24" x2="0" y2="0" stroke={SKIN} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-swing},0,-24)`} />
        <line x1="0" y1="-26" x2="0" y2="-44" stroke={SKIN} strokeWidth="10" strokeLinecap="round" />
        <path d="M-7,-30 L7,-30 L9,-17 L-9,-17 Z" fill="#f4efe2" stroke="#c9bfa6" />
        {carry ? (
          <g>
            <line x1="0" y1="-42" x2="-5" y2="-60" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="-42" x2="6" y2="-60" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
            <rect x="-12" y="-71" width="24" height="12" rx="2" fill="#d9b277" stroke="#9c7442" />
          </g>
        ) : (
          <g>
            <line x1="0" y1="-42" x2="0" y2="-26" stroke={SKIN} strokeWidth="4" strokeLinecap="round" transform={`rotate(${-swing},0,-42)`} />
          </g>
        )}
        <circle cx="1" cy="-51" r="7" fill={SKIN} />
        <path d="M-6,-52 A7,7 0 0 1 8,-53 L5,-55 Q0,-57 -5,-54 Z" fill="#1b130b" />
        <circle cx="4" cy="-51" r="1" fill="#1b130b" />
      </g>
    </g>
  );
}

function Overseer({ x, y, dir, t, phase, fall }) {
  const active = fall === 0;
  const s = Math.sin(t / 260 + phase);
  const arm = active ? -70 + 45 * s : 20;          // arm angle in degrees
  const lag = active ? arm + 70 * Math.sin(t / 260 + phase - 1.1) : arm + 60;
  const rad = (d) => (d * Math.PI) / 180;
  const hx = 18 * Math.cos(rad(arm)), hy = -46 + 18 * Math.sin(rad(arm));
  const cx = hx + 28 * Math.cos(rad(arm + 20)), cy = hy + 28 * Math.sin(rad(arm + 20));
  const tx = hx + 50 * Math.cos(rad(lag)), ty = hy + 50 * Math.sin(rad(lag));
  const crack = active && s > 0.93;
  return (
    <g transform={`translate(${x},${y}) scale(${dir * 1.15},1.15)`}>
      <ellipse cx={-fall * 28} cy="2" rx={11 + fall * 22} ry="3" fill="#000" opacity="0.2" />
      <g transform={`rotate(${-90 * fall})`}>
        <line x1="-3" y1="-24" x2="-4" y2="0" stroke={SKIN_DARK} strokeWidth="5" strokeLinecap="round" />
        <line x1="3" y1="-24" x2="5" y2="0" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        <line x1="0" y1="-26" x2="0" y2="-46" stroke={SKIN} strokeWidth="11" strokeLinecap="round" />
        <path d="M-6,-44 Q0,-38 6,-44 L6,-40 Q0,-34 -6,-40 Z" fill="#2f6fb5" />
        <path d="M-8,-31 L8,-31 L11,-14 L-11,-14 Z" fill="#f4efe2" stroke="#c9bfa6" />
        <rect x="-8" y="-33" width="16" height="4" fill="#e0a63a" />
        <line x1="0" y1="-44" x2="-7" y2="-30" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
        <path d={`M${hx},${hy} Q${cx},${cy} ${tx},${ty}`} stroke="#5a3a1a" strokeWidth="1.6" fill="none" />
        {crack && <path d={`M${tx - 5},${ty} l10,0 M${tx},${ty - 5} l0,10 M${tx - 4},${ty - 4} l8,8`} stroke="#fff3b0" strokeWidth="1.5" />}
        <line x1="0" y1="-44" x2={hx} y2={hy} stroke={SKIN} strokeWidth="4" strokeLinecap="round" />
        <path d="M-9,-52 L9,-52 L11,-38 L-11,-38 Z" fill="url(#nemes)" />
        <circle cx="1" cy="-53" r="7.5" fill={SKIN} />
        <path d="M-8,-54 Q1,-64 10,-54 L9,-52 L-8,-52 Z" fill="url(#nemes)" />
        <circle cx="4.5" cy="-53" r="1" fill="#1b130b" />
      </g>
    </g>
  );
}

function Label({ w, x, y, now, top }) {
  const showBubble = w.message && now - w.updatedAt < BUBBLE_MS;
  return (
    <g>
      <text x={x} y={y + top} textAnchor="middle" className={`name${w.status === 'done' ? ' done' : ''}`}>
        {w.status === 'done' ? `† ${w.name}` : w.name}
      </text>
      {showBubble && (
        <foreignObject x={x - 90} y={y + top - 76} width="180" height="64">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div className="bubble">{w.message}</div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export default function EgyptScene({ state, now }) {
  const overseers = state.workers.filter((w) => w.role === 'orchestrator')
    .sort((a, b) => a.startedAt - b.startedAt);

  const figures = state.workers.map((w) => {
    const fall = fallK(w, now);
    if (w.role === 'orchestrator') {
      const i = overseers.indexOf(w);
      const x = PATH_FROM + 40 + ((i + 0.5) / overseers.length) * (PATH_TO - PATH_FROM - 80);
      const y = 452 - (i % 2) * 8;
      return { w, x, y, fall, top: -86, el: <Overseer x={x} y={y} dir={i % 2 ? -1 : 1} t={now} phase={hash(w.name) % 7} fall={fall} /> };
    }
    // a closed worker freezes where it was when it collapsed
    const pose = workerPose(w, w.status === 'done' ? w.updatedAt : now);
    return { w, ...pose, fall, top: -80, el: <Worker {...pose} carry={pose.carry && fall === 0} t={now + hash(w.name)} fall={fall} /> };
  }).sort((a, b) => a.y - b.y);

  return (
    <svg className="scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
      aria-label={`Cantiere della piramide: ${state.workers.length} lavoratori, piramide al ${Math.round(state.progress * 100)}%`}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7b267" />
          <stop offset="1" stopColor="#fde4b2" />
        </linearGradient>
        <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2b673" />
          <stop offset="1" stopColor="#c8955a" />
        </linearGradient>
        <pattern id="nemes" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="#e0a63a" />
          <rect y="2" width="4" height="2" fill="#2f6fb5" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      <circle cx="880" cy="90" r="46" fill="#fff4d0" opacity="0.9" />
      <path d={`M0,${BASE_Y - 40} Q200,${BASE_Y - 90} 420,${BASE_Y - 45} T1000,${BASE_Y - 60} V${H} H0 Z`} fill="#e9c58d" />
      <rect y={BASE_Y - 10} width={W} height={H - BASE_Y + 10} fill="url(#sand)" />
      <Pyramid progress={state.progress} />
      <Stones progress={state.progress} />
      {figures.map((f) => <g key={f.w.name}>{f.el}</g>)}
      {figures.map((f) => <Label key={f.w.name} w={f.w} x={f.x} y={f.y} now={now} top={f.top * (1 - 0.7 * f.fall)} />)}
      {state.workers.length === 0 && (
        <text x={W / 2} y={200} textAnchor="middle" fill="#5a3d1c" fontSize="18">
          Nessun lavoratore al cantiere. Avvia Claude con la skill ai-workers.
        </text>
      )}
    </svg>
  );
}
