import React, { useEffect, useState } from 'react';
import { skins } from './skins/index.js';

const EMPTY = { workers: [], tokensUsed: 0, tokenLimit: 1, progress: 0, serverTime: Date.now() };

function readSkin() {
  try { return localStorage.getItem('skin') || skins[0].id; } catch { return skins[0].id; }
}

export default function App() {
  const [state, setState] = useState(EMPTY);
  const [offline, setOffline] = useState(false);
  const [skinId, setSkinId] = useState(readSkin);
  const [clockSkew, setClockSkew] = useState(0);
  const [now, setNow] = useState(Date.now());

  // poll backend
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const s = await (await fetch('/api/state')).json();
        if (!alive) return;
        setState(s);
        setClockSkew(Date.now() - s.serverTime);
        setOffline(false);
      } catch {
        if (alive) setOffline(true);
      }
    };
    load();
    const id = setInterval(load, 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // animation clock
  useEffect(() => {
    let raf;
    const tick = () => { setNow(Date.now()); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const changeSkin = (id) => {
    setSkinId(id);
    try { localStorage.setItem('skin', id); } catch { /* storage blocked: keep in memory */ }
  };

  const reset = async () => {
    if (confirm('Cancellare tutti i worker e ricominciare la sessione?')) {
      await fetch('/api/state', { method: 'DELETE' });
    }
  };

  const skin = skins.find((s) => s.id === skinId) || skins[0];
  const active = state.workers.filter((w) => w.status !== 'done').length;
  const Scene = skin.Scene;
  const pct = Math.round(state.progress * 100);

  return (
    <div className="app">
      <header className="hud">
        <h1 className="hud-title">AI Workers</h1>
        <div className="hud-tokens">
          <div className="hud-tokens-label">
            <span id="token-label">Token</span>
            <span className="num">
              {state.tokensUsed.toLocaleString()} / {state.tokenLimit.toLocaleString()}
              <b> {pct}%</b>
            </span>
          </div>
          <div
            className={`meter${pct >= 90 ? ' is-high' : ''}`}
            role="progressbar"
            aria-labelledby="token-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
        <div className="hud-stats">
          <span className="chip"><i className="dot dot-live" aria-hidden="true" />Attivi <b className="num">{active}</b></span>
          <span className="chip"><i className="dot" aria-hidden="true" />Chiusi <b className="num">{state.workers.length - active}</b></span>
          {offline && <span className="chip chip-offline" role="status">Backend non raggiungibile</span>}
        </div>
        <div className="hud-actions">
          <label className="field">
            <span>Skin</span>
            <select value={skin.id} onChange={(e) => changeSkin(e.target.value)}>
              {skins.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <button type="button" className="btn-danger" onClick={reset}>Reset sessione</button>
        </div>
      </header>
      <Scene state={state} now={now - clockSkew} />
    </div>
  );
}
