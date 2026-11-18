import React from 'react';
import { useFillViewBox, hash, workerPose, fallK, useNow, Label, Figure, EmptyState } from '../shared.jsx';
import { Backdrop } from './backdrop.jsx';
import { Developer, Manager } from './figures.jsx';

const PATH_FROM = 235, PATH_TO = 600;
const SHIRTS = ['#2563eb', '#16a34a', '#9333ea', '#e11d48', '#0891b2', '#ca8a04', '#475569'];

export default function OfficeScene({ state, clockSkew, nameOf, onSelect }) {
  const now = useNow(clockSkew);
  const managers = state.workers.filter((w) => w.role === 'orchestrator')
    .sort((a, b) => a.startedAt - b.startedAt);

  const figures = state.workers.map((w) => {
    const fall = fallK(w, now);
    if (w.role === 'orchestrator') {
      const i = managers.indexOf(w);
      const x = PATH_FROM + 40 + ((i + 0.5) / managers.length) * (PATH_TO - PATH_FROM - 80);
      const y = 452 - (i % 2) * 8;
      return { w, x, y, fall, top: -86, el: <Manager x={x} y={y} dir={i % 2 ? -1 : 1} t={now} phase={hash(w.name) % 7} fall={fall} /> };
    }
    // a closed worker freezes where it was when it collapsed
    const pose = workerPose(w, w.status === 'done' ? w.updatedAt : now);
    return { w, ...pose, fall, top: -80, el: <Developer {...pose} carry={pose.carry && fall === 0} t={now + hash(w.name)} fall={fall} shirt={SHIRTS[hash(w.name) % SHIRTS.length]} /> };
  }).sort((a, b) => a.y - b.y);

  const [ref, viewBox] = useFillViewBox();

  return (
    <svg ref={ref} className="scene" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="group"
      aria-label={`Ufficio Maidaive: ${state.workers.length} dipendenti, rack di produzione al ${Math.round(state.progress * 100)}%`}>
      <Backdrop progress={state.progress} />
      {figures.map((f) => <Figure key={`${f.w.name}:${f.w.role}`} w={f.w} name={nameOf(f.w)} onSelect={onSelect}>{f.el}</Figure>)}
      {figures.map((f) => <Label key={`${f.w.name}:${f.w.role}`} w={f.w} name={nameOf(f.w)} x={f.x} y={f.y} now={now} top={f.top * (1 - 0.7 * f.fall)} />)}
      {state.workers.length === 0 && (
        <EmptyState y={300} title="Ufficio vuoto" hint="Nessun dipendente in ufficio. Avvia Claude con la skill ai-workers."
          bg="#ffffff" border="#f97316" ink="#0f172a" sub="#475569" font="system-ui, 'Segoe UI', sans-serif" />
      )}
    </svg>
  );
}
