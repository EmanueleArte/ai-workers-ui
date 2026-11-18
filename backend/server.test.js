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
    await post('/report', { name: 'Nefi', message: 'reading files', tokensUsed: 300 });
    await post('/report', { name: 'Ahmose', tokensUsed: 200, tokenLimit: 1000 });

    let s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.tokensUsed, 500);
    assert.strictEqual(s.progress, 0.5);
    assert.strictEqual(s.workers.find((w) => w.name === 'Nefi').message, 'reading files');

    await post('/report', { name: 'Nefi', status: 'done' });
    assert.strictEqual((await post('/report', { name: 'Nefi', message: 'again' })).status, 409);
    s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.workers.find((w) => w.name === 'Nefi').status, 'done');

    assert.strictEqual((await post('/register', { name: 'Tiye' })).status, 201);
    await post('/report', { name: 'Tiye', tokensUsed: 100 });
    assert.strictEqual((await post('/report', { name: 'Tiye', role: 'orchestrator', tokensUsed: 150 })).status, 200);
    s = await (await fetch(base + '/state')).json();
    const tiyes = s.workers.filter((w) => w.name === 'Tiye');
    assert.deepStrictEqual(tiyes.map((w) => `${w.role}:${w.status}`).sort(), ['orchestrator:working', 'worker:done']);
    assert.strictEqual(s.tokensUsed, 650, 'promotion does not double count tokens');
    assert.strictEqual((await post('/report', { name: 'Tiye', role: 'worker' })).status, 400, 'no demotion');

    assert.strictEqual((await post('/register', { name: 'Tiye#worker' })).status, 400, '# reserved');
    await post('/report', { name: 'Tiye', tokensUsed: 1e308 });
    s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.tokensUsed, 650, 'huge tokensUsed ignored, total stays a number');

    await fetch(base + '/state', { method: 'DELETE' });
    s = await (await fetch(base + '/state')).json();
    assert.strictEqual(s.workers.length, 0);
  } finally {
    server.close();
  }
});

async function withServer(opts, fn) {
  const server = createApp(opts).listen(0);
  const base = `http://localhost:${server.address().port}/api`;
  const post = (p, body) => fetch(base + p, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const state = async () => (await fetch(base + '/state')).json();
  try { await fn({ post, state }); } finally { server.close(); }
}

test('errors are JSON without stack traces', () => withServer({}, async ({ post }) => {
  let r = await post('/register', '{bad json');
  assert.strictEqual(r.status, 400);
  assert.ok(typeof (await r.json()).error === 'string');
  r = await post('/register', { name: 'x'.repeat(40 * 1024) });
  assert.strictEqual(r.status, 413);
  assert.ok(!(await r.text()).includes(' at '), 'no stack trace');
}));

test('worker cap returns 429', () => withServer({ maxWorkers: 3 }, async ({ post }) => {
  for (const n of ['A', 'B', 'C']) assert.strictEqual((await post('/register', { name: n })).status, 201);
  const r = await post('/register', { name: 'D' });
  assert.strictEqual(r.status, 429);
  assert.ok((await r.json()).error);
}));

test('only an orchestrator sets tokenLimit', () => withServer({}, async ({ post, state }) => {
  await post('/register', { name: 'Nefi' });
  await post('/report', { name: 'Nefi', tokenLimit: 1000 });
  assert.strictEqual((await state()).tokenLimit, 1_000_000);
  await post('/report', { name: 'Nefi', role: 'orchestrator', tokenLimit: 2000 });
  assert.strictEqual((await state()).tokenLimit, 2000, 'promotion in the same request counts');
}));

test('activities history', () => withServer({}, async ({ post, state }) => {
  await post('/register', { name: 'Tiye' });
  assert.deepStrictEqual((await state()).workers[0].activities, []);
  await post('/report', { name: 'Tiye', message: 'one' });
  await post('/report', { name: 'Tiye', message: '' });
  await post('/report', { name: 'Tiye', tokensUsed: 5 });
  await post('/report', { name: 'Tiye', message: 'two' });
  let w = (await state()).workers[0];
  assert.deepStrictEqual(w.activities.map((a) => a.message), ['one', 'two']);
  assert.ok(Number.isFinite(w.activities[1].at) && w.activities[1].at >= w.activities[0].at);

  await post('/report', { name: 'Tiye', role: 'orchestrator', message: 'three' });
  const s = await state();
  const retired = s.workers.find((x) => x.role === 'worker');
  const orch = s.workers.find((x) => x.role === 'orchestrator');
  assert.deepStrictEqual(retired.activities.map((a) => a.message), ['one', 'two'], 'copy is independent');
  assert.deepStrictEqual(orch.activities.map((a) => a.message), ['one', 'two', 'three']);

  for (let i = 0; i < 120; i++) await post('/report', { name: 'Tiye', message: `m${i}` });
  w = (await state()).workers.find((x) => x.role === 'orchestrator');
  assert.strictEqual(w.activities.length, 100);
  assert.strictEqual(w.activities[99].message, 'm119');
  assert.strictEqual(w.message, 'm119');
}));
