import React from 'react';
import { hash, workerPose, fallK, Label, EmptyState } from '../shared.jsx';
import { Backdrop } from './backdrop.jsx';
import { Astronaut, Controller } from './figures.jsx';

const W = 1000, H = 560;
const PATH_FROM = 235, PATH_TO = 600;

export default function SpaceScene({ state, now }) {
  const controllers = state.workers.filter((w) => w.role === 'orchestrator')
    .sort((a, b) => a.startedAt - b.startedAt);

  const figures = state.workers.map((w) => {
    const fall = fallK(w, now);
    if (w.role === 'orchestrator') {
      const i = controllers.indexOf(w);
      const x = PATH_FROM + 40 + ((i + 0.5) / controllers.length) * (PATH_TO - PATH_FROM - 80);
      const y = 452 - (i % 2) * 8;
      return { w, x, y, fall, top: -86, el: <Controller x={x} y={y} dir={i % 2 ? -1 : 1} t={now} phase={hash(w.name) % 7} fall={fall} /> };
    }
    // a closed worker freezes where it was when it collapsed
    const pose = workerPose(w, w.status === 'done' ? w.updatedAt : now);
    return { w, ...pose, fall, top: -80, el: <Astronaut {...pose} carry={pose.carry && fall === 0} t={now + hash(w.name)} fall={fall} /> };
  }).sort((a, b) => a.y - b.y);

  return (
    <svg className="scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
      aria-label={`Base di lancio: ${state.workers.length} astronauti, razzo assemblato al ${Math.round(state.progress * 100)}%`}>
      <Backdrop progress={state.progress} />
      {figures.map((f) => <g key={`${f.w.name}:${f.w.role}`}>{f.el}</g>)}
      {figures.map((f) => <Label key={`${f.w.name}:${f.w.role}`} w={f.w} x={f.x} y={f.y} now={now} top={f.top * (1 - 0.7 * f.fall)} />)}
      {state.workers.length === 0 && (
        <EmptyState y={250} title="Base di lancio in silenzio radio" hint="Nessun astronauta alla base di lancio. Avvia Claude con la skill ai-workers."
          bg="#0b1624" border="#e8742a" ink="#eef1f5" sub="#9fb0c4" font="ui-monospace, 'Cascadia Mono', Consolas, monospace" />
      )}
    </svg>
  );
}
