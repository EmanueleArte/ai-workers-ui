import React from 'react';
import { hash, workerPose, fallK, Label, EmptyState } from '../shared.jsx';
import { Backdrop } from './backdrop.jsx';
import { Developer, Manager } from './figures.jsx';

const W = 1000, H = 560;
const PATH_FROM = 235, PATH_TO = 600;
const SHIRTS = ['#2563eb', '#16a34a', '#9333ea', '#e11d48', '#0891b2', '#ca8a04', '#475569'];

// In this skin every worker is shown under one of these names only.
export const NAMES = [
  'Alessandro Barducci', 'Alessandro Boschetti', 'Giacomo Dradi', 'Andrea Procucci', 'Alessandro Di Roma',
  'Andrea Latino', 'Emanuele Pancisi', 'Enrico Valentini', 'Giacomo Tontini', 'Giacomo Venturi',
  'Giorgia Mossette', 'Giovanna Messa Chiarion', 'Leonardo Roselli', 'Linda Vitali', 'Lorenzo Domenico Magnani',
  'Manuele Bagnolini', 'Marco Esopi', 'Marco Raggini', 'Marco Treossi', 'Matteo Venditto',
  'Raffaele Balzani', 'Sebastiano Gaudeano', 'Emanuele Artegiani', 'Pablo Vargas', 'Sebastian Grateron',
  'Pedro Vergas', 'Jacopo Gambi', 'Alessandro Maretti',
];

// Name picked by hash; earlier workers keep theirs, later ones probe to the next free name.
// shortcut: names repeat once there are more workers than NAMES.
export function assignNames(workers) {
  const used = new Set(), out = new Map();
  for (const w of [...workers].sort((a, b) => a.startedAt - b.startedAt)) {
    let i = hash(`${w.name}:${w.role}`) % NAMES.length;
    for (let k = 0; k < NAMES.length && used.has(i); k++) i = (i + 1) % NAMES.length;
    used.add(i);
    out.set(w, NAMES[i]);
  }
  return out;
}

export default function OfficeScene({ state, now }) {
  const managers = state.workers.filter((w) => w.role === 'orchestrator')
    .sort((a, b) => a.startedAt - b.startedAt);
  const names = assignNames(state.workers);

  const figures = state.workers.map((w) => {
    const fall = fallK(w, now);
    const shown = { ...w, name: names.get(w) };
    if (w.role === 'orchestrator') {
      const i = managers.indexOf(w);
      const x = PATH_FROM + 40 + ((i + 0.5) / managers.length) * (PATH_TO - PATH_FROM - 80);
      const y = 452 - (i % 2) * 8;
      return { w, shown, x, y, fall, top: -86, el: <Manager x={x} y={y} dir={i % 2 ? -1 : 1} t={now} phase={hash(w.name) % 7} fall={fall} /> };
    }
    // a closed worker freezes where it was when it collapsed
    const pose = workerPose(w, w.status === 'done' ? w.updatedAt : now);
    return { w, shown, ...pose, fall, top: -80, el: <Developer {...pose} carry={pose.carry && fall === 0} t={now + hash(w.name)} fall={fall} shirt={SHIRTS[hash(w.name) % SHIRTS.length]} /> };
  }).sort((a, b) => a.y - b.y);

  return (
    <svg className="scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
      aria-label={`Ufficio Maidaive: ${state.workers.length} dipendenti, rack di produzione al ${Math.round(state.progress * 100)}%`}>
      <Backdrop progress={state.progress} />
      {figures.map((f) => <g key={`${f.w.name}:${f.w.role}`}>{f.el}</g>)}
      {figures.map((f) => <Label key={`${f.w.name}:${f.w.role}`} w={f.shown} x={f.x} y={f.y} now={now} top={f.top * (1 - 0.7 * f.fall)} />)}
      {state.workers.length === 0 && (
        <EmptyState y={300} title="Ufficio vuoto" hint="Nessun dipendente in ufficio. Avvia Claude con la skill ai-workers."
          bg="#ffffff" border="#f97316" ink="#0f172a" sub="#475569" font="system-ui, 'Segoe UI', sans-serif" />
      )}
    </svg>
  );
}
