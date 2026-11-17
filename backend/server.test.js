const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('./server');

test('register, report, done lifecycle', async () => {
  const server = createApp().listen(0);
  const base = `http://localhost:${server.address().port}/api`;
  const post = (p, body) => fetch(base + p, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    assert.strictEqual((await post('/register', { name: 'Ahmose', role: 'orchestrator' })).status, 201);
    assert.strictEqual((await post('/register', { name: 'ahmose' })).status, 409, 'names unique, case-insensitive');
    assert.strictEqual((await post('/register', { name: 'Nefi', role: 'king' })).status, 400);
    assert.strictEqual((await post('/report', { name: 'Ghost', message: 'x' })).status, 404);

    assert.strictEqual((await post('/register', { name: 'Nefi' })).status, 201);
    await post('/report', { name: 'Nefi', message: 'reading files', tokensUsed: 300, tokenLimit: 1000 });
    await post('/report', { name: 'Ahmose', tokensUsed: 200 });

    let s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.tokensUsed, 500);
    assert.strictEqual(s.progress, 0.5);
    assert.strictEqual(s.workers.find((w) => w.name === 'Nefi').message, 'reading files');

    await post('/report', { name: 'Nefi', status: 'done' });
    assert.strictEqual((await post('/report', { name: 'Nefi', message: 'again' })).status, 409);
    s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.workers.find((w) => w.name === 'Nefi').status, 'done');

    await fetch(base + '/state', { method: 'DELETE' });
    s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.workers.length, 0);
  } finally {
    server.close();
  }
});
