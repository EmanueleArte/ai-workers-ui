import React from 'react';

// Helpers shared by every skin: walk path, fall animation, labels and empty state.
const W = 1000;
const PATH_FROM = 235, PATH_TO = 600;
const TRIP_MS = 9000;          // full trip pile -> build site -> pile
const BUBBLE_MS = 10000;       // how long a new message stays visible
const FALL_MS = 900;

export function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

export function workerPose(w, t) {
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

export function fallK(w, now) {
  if (w.status !== 'done') return 0;
  const k = Math.min(1, Math.max(0, (now - w.updatedAt) / FALL_MS));
  return k * k; // accelerate like gravity
}

// Shared empty-state plaque; each skin passes its own palette and typeface.
export function EmptyState({ title, hint, y = 200, bg, border, ink, sub, font }) {
  return (
    <g pointerEvents="none">
      <rect x={W / 2 - 320} y={y - 42} width="640" height="84" rx="14" fill={bg} stroke={border} strokeWidth="1.2" />
      <line x1={W / 2 - 36} y1={y + 2} x2={W / 2 + 36} y2={y + 2} stroke={border} strokeWidth="1.2" />
      <text x={W / 2} y={y - 12} textAnchor="middle" fill={ink} fontSize="22" fontWeight="600" fontFamily={font} letterSpacing="0.5">{title}</text>
      <text x={W / 2} y={y + 24} textAnchor="middle" fill={sub} fontSize="13" fontFamily={font}>{hint}</text>
    </g>
  );
}

export function Label({ w, x, y, now, top }) {
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
