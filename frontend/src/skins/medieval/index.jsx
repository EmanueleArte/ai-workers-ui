import React from 'react';
import { useFillViewBox, hash, workerPose, fallK, Label, EmptyState } from '../shared.jsx';
import { Backdrop } from './backdrop.jsx';
import { Peasant, MasterBuilder } from './figures.jsx';

const PATH_FROM = 235, PATH_TO = 600;

export default function MedievalScene({ state, now, onSelect }) {
  const controllers = state.workers.filter((w) => w.role === 'orchestrator')
    .sort((a, b) => a.startedAt - b.startedAt);

  const figures = state.workers.map((w) => {
    const fall = fallK(w, now);
    if (w.role === 'orchestrator') {
      const i = controllers.indexOf(w);
      const x = PATH_FROM + 40 + ((i + 0.5) / controllers.length) * (PATH_TO - PATH_FROM - 80);
      const y = 452 - (i % 2) * 8;
      return { w, x, y, fall, top: -86, el: <MasterBuilder x={x} y={y} dir={i % 2 ? -1 : 1} t={now} phase={hash(w.name) % 7} fall={fall} /> };
    }
    // a closed worker freezes where it was when it collapsed
    const pose = workerPose(w, w.status === 'done' ? w.updatedAt : now);
    return { w, ...pose, fall, top: -80, el: <Peasant {...pose} carry={pose.carry && fall === 0} t={now + hash(w.name)} fall={fall} /> };
  }).sort((a, b) => a.y - b.y);

  const [ref, viewBox] = useFillViewBox();

  return (
    <svg ref={ref} className="scene" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img"
      aria-label={`Cantiere del castello: ${state.workers.length} contadini, torre costruita al ${Math.round(state.progress * 100)}%`}>
      <Backdrop progress={state.progress} />
      {figures.map((f) => <g key={`${f.w.name}:${f.w.role}`} className="figure" onClick={() => onSelect?.(f.w)}>{f.el}</g>)}
      {figures.map((f) => <Label key={`${f.w.name}:${f.w.role}`} w={f.w} x={f.x} y={f.y} now={now} top={f.top * (1 - 0.7 * f.fall)} />)}
      {state.workers.length === 0 && (
        <EmptyState y={200} title="Il cantiere attende braccia" hint="Nessun contadino al cantiere. Avvia Claude con la skill ai-workers."
          bg="#f3e6c4" border="#7a4a22" ink="#3a2614" sub="#6b4a2a" font="Georgia, 'Palatino Linotype', serif" />
      )}
    </svg>
  );
}
