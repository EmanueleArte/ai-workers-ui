import React, { useEffect, useRef, useState } from 'react';

// Helpers shared by every skin: walk path, fall animation, labels and empty state.
const W = 1000, H = 560;
// How far backdrops paint outside the 1000x560 box, so a widened/tallened viewBox never shows bare edges.
export const BLEED = 4000;
const PATH_FROM = 235, PATH_TO = 600;
const TRIP_MS = 9000;          // full trip pile -> build site -> pile
const BUBBLE_MS = 10000;       // how long a new message stays visible
const FALL_MS = 900;

// Animation clock: re-renders only the scene (~60/s), not the whole app. skew = client - server clock.
export function useNow(skew) {
  const [t, setT] = useState(Date.now());
  useEffect(() => {
    let raf;
    const tick = () => { setT(Date.now()); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t - skew;
}

// Clickable, keyboard-focusable figure.
export function Figure({ w, name, onSelect, children }) {
  return (
    <g className="figure" tabIndex={0} role="button" aria-label={`${name}, ${w.status === 'done' ? 'chiuso' : 'attivo'}`}
      onClick={() => onSelect?.(w)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(w); }
      }}>
      {children}
    </g>
  );
}

// viewBox that keeps the whole 1000x560 content visible and centred, grown along one axis
// to match the element's aspect so the scene fills its box with no letterbox bands.
export function useFillViewBox() {
  const ref = useRef(null);
  const [box, setBox] = useState(`0 0 ${W} ${H}`);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width < 1 || height < 1) return; // hidden or not laid out yet
      const vw = Math.max(W, (H * width) / height), vh = Math.max(H, (W * height) / width);
      setBox(`${((W - vw) / 2).toFixed(1)} ${((H - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box];
}

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

export function Label({ w, name, x, y, now, top }) {
  const showBubble = w.message && now - w.updatedAt < BUBBLE_MS;
  return (
    <g>
      <text x={x} y={y + top} textAnchor="middle" className={`name${w.status === 'done' ? ' done' : ''}`}>
        {w.status === 'done' ? `† ${name}` : name}
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
