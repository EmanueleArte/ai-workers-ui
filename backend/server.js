const express = require('express');
const path = require('path');

const PORT = Number(process.env.PORT) || 8765;
const TOKEN_BUDGET = Number(process.env.TOKEN_BUDGET) || 1_000_000;
const ROLES = ['worker', 'orchestrator'];
const STATUSES = ['working', 'done'];

function createApp() {
  // shortcut: state is in memory, lost on restart; add a store if history must survive.
  const workers = new Map(); // lowercased name -> worker
  let tokenLimit = TOKEN_BUDGET;

  const app = express();
  app.use(express.json({ limit: '32kb' }));

  const cleanName = (n) => (typeof n === 'string' ? n.trim() : '');

  app.post('/api/register', (req, res) => {
    const name = cleanName(req.body?.name);
    const role = req.body?.role ?? 'worker';
    if (!name || name.length > 40) return res.status(400).json({ error: 'name required, max 40 chars' });
    if (!ROLES.includes(role)) return res.status(400).json({ error: `role must be one of ${ROLES}` });
    if (workers.has(name.toLowerCase())) return res.status(409).json({ error: 'name already taken, choose another' });
    const now = Date.now();
    workers.set(name.toLowerCase(), {
      name, role, status: 'working', message: '', tokensUsed: 0, startedAt: now, updatedAt: now,
    });
    res.status(201).json({ ok: true, name });
  });

  app.post('/api/report', (req, res) => {
    const name = cleanName(req.body?.name);
    const w = workers.get(name.toLowerCase());
    if (!w) return res.status(404).json({ error: 'unknown name, register first' });
    if (w.status === 'done') return res.status(409).json({ error: 'worker already closed' });
    const { message, tokensUsed, tokenLimit: lim, status = 'working' } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of ${STATUSES}` });
    if (message !== undefined) w.message = String(message).slice(0, 500);
    if (Number.isFinite(tokensUsed) && tokensUsed >= 0) w.tokensUsed = tokensUsed;
    if (Number.isFinite(lim) && lim > 0) tokenLimit = lim;
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
  return app;
}

if (require.main === module) {
  createApp().listen(PORT, () => console.log(`ai-workers-ui on http://localhost:${PORT}`));
}

module.exports = { createApp };
