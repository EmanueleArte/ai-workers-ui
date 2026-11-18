const express = require('express');
const { randomInt } = require('crypto');
const path = require('path');

const PORT = Number(process.env.PORT) || 8765;
const TOKEN_BUDGET = Math.max(1, Number(process.env.TOKEN_BUDGET) || 1_000_000);
const ROLES = ['worker', 'orchestrator'];
const STATUSES = ['working', 'done'];
const MAX_WORKERS = 500;
const MAX_ACTIVITIES = 100;
const ALIASES = [
  'Alessandro Barducci', 'Alessandro Boschetti', 'Giacomo Dradi', 'Andrea Procucci', 'Alessandro Di Roma',
  'Andrea Latino', 'Emanuele Pancisi', 'Enrico Valentini', 'Giacomo Tontini', 'Giacomo Venturi',
  'Giorgia Mossette', 'Giovanna Messa Chiarion', 'Leonardo Roselli', 'Linda Vitali', 'Lorenzo Domenico Magnani',
  'Manuele Bagnolini', 'Marco Esopi', 'Marco Raggini', 'Marco Treossi', 'Matteo Venditto',
  'Raffaele Balzani', 'Sebastiano Gaudeano', 'Emanuele Artegiani', 'Pablo Vargas', 'Sebastian Grateron',
  'Pedro Vergas', 'Jacopo Gambi', 'Alessandro Maretti',
];

function createApp({ maxWorkers = MAX_WORKERS } = {}) {
  // shortcut: state is in memory, lost on restart; add a store if history must survive.
  const workers = new Map(); // lowercased name -> worker
  let tokenLimit = TOKEN_BUDGET;

  const app = express();
  app.use(express.json({ limit: '32kb' }));

  const cleanName = (n) => (typeof n === 'string' ? n.trim() : '');

  app.post('/api/register', (req, res) => {
    const name = cleanName(req.body?.name);
    const role = req.body?.role ?? 'worker';
    // '#' is reserved for the retired copy key of a promoted worker
    if (!name || name.length > 40 || name.includes('#')) return res.status(400).json({ error: 'name required, max 40 chars, no #' });
    if (!ROLES.includes(role)) return res.status(400).json({ error: `role must be one of ${ROLES}` });
    if (workers.has(name.toLowerCase())) return res.status(409).json({ error: 'name already taken, choose another' });
    if (workers.size >= maxWorkers) return res.status(429).json({ error: `too many workers (max ${maxWorkers}), reset the state` });
    const now = Date.now();
    const taken = new Set([...workers.values()].map((w) => w.alias.toLowerCase()));
    const free = ALIASES.filter((a) => !taken.has(a.toLowerCase()));
    let alias = free.length ? free[randomInt(free.length)] : ALIASES[randomInt(ALIASES.length)];
    // shortcut: pool exhausted -> random alias plus the smallest free numeric suffix; O(n) scan, fine under the worker cap.
    if (!free.length) {
      const base = alias;
      for (let k = 2; taken.has(alias.toLowerCase()); k++) alias = `${base} ${k}`;
    }
    workers.set(name.toLowerCase(), {
      name, alias, role, status: 'working', message: '', activities: [], tokensUsed: 0, startedAt: now, updatedAt: now,
    });
    res.status(201).json({ ok: true, name, alias });
  });

  app.post('/api/report', (req, res) => {
    const name = cleanName(req.body?.name);
    const w = workers.get(name.toLowerCase());
    if (!w) return res.status(404).json({ error: 'unknown name, register first' });
    if (w.status === 'done') return res.status(409).json({ error: 'worker already closed' });
    const { message, tokensUsed, tokenLimit: lim, status = 'working', role = w.role } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of ${STATUSES}` });
    if (role !== w.role && !(w.role === 'worker' && role === 'orchestrator')) {
      return res.status(400).json({ error: 'role can only change from worker to orchestrator' });
    }
    if (role !== w.role) {
      // promotion: the worker collapses as a retired copy, the same name respawns as orchestrator.
      // The copy drops its tokens: reports are cumulative, so the orchestrator carries them on.
      const now = Date.now();
      workers.set(`${name.toLowerCase()}#worker`, { ...w, activities: [...w.activities], status: 'done', tokensUsed: 0, updatedAt: now });
      Object.assign(w, { role, startedAt: now });
    }
    if (message !== undefined) w.message = String(message).slice(0, 500);
    if (typeof message === 'string' && w.message) {
      w.activities.push({ message: w.message, at: Date.now() });
      // shortcut: keeps only the latest MAX_ACTIVITIES per worker; persist elsewhere if full history is needed.
      if (w.activities.length > MAX_ACTIVITIES) w.activities.shift();
    }
    // capped so the sum over workers stays finite (Infinity would serialize as null)
    if (Number.isFinite(tokensUsed) && tokensUsed >= 0 && tokensUsed <= Number.MAX_SAFE_INTEGER) w.tokensUsed = tokensUsed;
    // only the orchestrator sets the budget; silently ignored from workers
    if (w.role === 'orchestrator' && Number.isFinite(lim) && lim > 0 && lim <= Number.MAX_SAFE_INTEGER) tokenLimit = lim;
    w.status = status;
    w.updatedAt = Date.now();
    res.json({ ok: true });
  });

  app.get('/api/state', (_req, res) => {
    const list = [...workers.values()];
    const tokensUsed = list.reduce((s, w) => s + w.tokensUsed, 0);
    res.json({
      workers: list, tokensUsed, tokenLimit,
      progress: Math.min(1, tokensUsed / tokenLimit),
      serverTime: Date.now(),
    });
  });

  app.delete('/api/state', (_req, res) => {
    workers.clear();
    tokenLimit = TOKEN_BUDGET;
    res.json({ ok: true });
  });

  app.use(express.static(path.join(__dirname, 'public')));
  // JSON errors (malformed body 400, too large 413), never a stack trace
  app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.status ? err.message : 'internal error' }));
  return app;
}

if (require.main === module) {
  // localhost by default: the API has no auth. Docker sets HOST=0.0.0.0.
  createApp().listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`ai-workers-ui on http://localhost:${PORT}`));
}

module.exports = { createApp, ALIASES };
