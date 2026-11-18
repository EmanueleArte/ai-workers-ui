import React, { memo, useEffect, useRef } from 'react';

const time = (at) => new Date(at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

const RunningIcon = () => (
  <svg className="act-icon act-running" viewBox="0 0 12 12" width="12" height="12" role="img" aria-label="in corso">
    <title>in corso</title>
    <circle cx="6" cy="6" r="3.5" />
  </svg>
);

const DoneIcon = () => (
  <svg className="act-icon act-done" viewBox="0 0 12 12" width="12" height="12" role="img" aria-label="completata">
    <title>completata</title>
    <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default memo(function AgentsPanel({ id, open, onClose, workers, tokensUsed, selected, nameOf }) {
  const closeRef = useRef(null);
  const mounted = useRef(false);
  const rowRefs = useRef(new Map());

  useEffect(() => {
    // panel restored open on page load: don't steal focus, only on user toggle
    const userOpened = mounted.current;
    mounted.current = true;
    if (!open) return;
    if (userOpened) closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // agent clicked in the scene: expand its row, bring it into view, focus it (runs after the open effect)
  useEffect(() => {
    const el = selected?.key && rowRefs.current.get(selected.key);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    el.querySelector('summary')?.focus({ preventScroll: true });
  }, [selected?.n]);

  const rows = [...workers].sort((a, b) =>
    (a.role === 'orchestrator' ? 0 : 1) - (b.role === 'orchestrator' ? 0 : 1) || a.startedAt - b.startedAt);
  const total = Math.max(tokensUsed, 1);

  return (
    <aside id={id} className="agents" aria-labelledby={`${id}-title`} hidden={!open}>
      <div className="agents-head">
        <h2 id={`${id}-title`}>Agenti <span className="num">{rows.length}</span></h2>
        <button ref={closeRef} type="button" className="btn-icon" onClick={onClose} aria-label="Chiudi pannello agenti">
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="m3 3 6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="agents-empty">Nessun agente registrato.</p>
      ) : (
        <ul className="agents-list">
          {rows.map((w) => {
            const acts = [...(w.activities ?? [])].reverse();
            const share = Math.round((w.tokensUsed / total) * 100);
            const key = `${w.name}:${w.role}`;
            return (
              <li key={key}>
                <details
                  className={`agent${selected?.key === key ? ' is-selected' : ''}`}
                  ref={(el) => (el ? rowRefs.current.set(key, el) : rowRefs.current.delete(key))}
                >
                  <summary>
                    <span className="agent-name">{nameOf(w)}</span>
                    <span className={`tag tag-${w.role}`}>{w.role}</span>
                    <span className={`tag tag-${w.status}`}>{w.status === 'working' ? 'al lavoro' : 'finito'}</span>
                    <span className="agent-tokens num">{w.tokensUsed.toLocaleString()} <b>{share}%</b></span>
                  </summary>
                  {acts.length === 0 ? (
                    <p className="agents-empty">Nessuna attività.</p>
                  ) : (
                    <ol className="acts">
                      {acts.map((a, i) => (
                        <li key={`${a.at}:${i}`}>
                          {i === 0 && w.status === 'working' ? <RunningIcon /> : <DoneIcon />}
                          <time className="num" dateTime={new Date(a.at).toISOString()}>{time(a.at)}</time>
                          <span>{a.message}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
});
