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

  return (
    <div className="app">
      <header className="hud">
        <h1>AI Workers</h1>
        <span>Token: {state.tokensUsed.toLocaleString()} / {state.tokenLimit.toLocaleString()} ({Math.round(state.progress * 100)}%)</span>
        <span>Attivi: {active} · Chiusi: {state.workers.length - active}</span>
        {offline && <span className="offline">backend non raggiungibile</span>}
        <label>
          Skin{' '}
          <select value={skin.id} onChange={(e) => changeSkin(e.target.value)}>
            {skins.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <button onClick={reset}>Reset sessione</button>
      </header>
      <Scene state={state} now={now - clockSkew} />
    </div>
  );
}
