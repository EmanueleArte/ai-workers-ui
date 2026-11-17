---
name: ai-workers
description: Report what this Claude instance is doing to the AI Workers dashboard on http://localhost:8765, so every worker and orchestrator appears as an animated character. Use at the start of any task when the user asks to "report to ai-workers", "show me on the pyramid", "use ai-workers", or when a CLAUDE.md asks for it; also pass it on to every subagent you spawn.
---

# AI Workers reporter

You publish your progress to a local dashboard at `http://localhost:8765`. Each Claude instance is one character, identified by a **unique person name** it keeps for its whole life.

## 1. At the very start: pick a name and register

- Pick a person's first name (ancient Egyptian names fit the default skin: Ahmose, Nefertari, Khufu, Meritamun, Senenmut, Tiye, Imhotep, Hatshepsut...). If you were given a name by your orchestrator, use that.
- Role: `orchestrator` if you coordinate/spawn subagents, otherwise `worker`.
- Register:

```bash
curl -s -w ' %{http_code}\n' -X POST http://localhost:8765/api/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ahmose","role":"worker"}'
```

- `201` → registered. `409` → name taken: choose another name and retry.
- Connection refused / no answer → the dashboard is off: **skip all reporting for the rest of the task** and do not mention it again. Reporting must never block or slow the real work.

**Keep the name until you are definitively closed.** Never re-register under a different name, also after context compaction (write the name in your notes/summary: `ai-workers name: Ahmose`).

## 2. While working: report every meaningful step

Send a report when you start a new step, finish one, or hit a problem (not for every single tool call):

```bash
curl -s -X POST http://localhost:8765/api/report \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ahmose","message":"Reading auth module to find token bug","tokensUsed":42000}'
```

- `message`: one short sentence (max ~150 chars), in the user's language, what you are doing *now*. It appears in a speech bubble for ~30 s.
- `tokensUsed`: your best estimate of the tokens you have consumed so far (cumulative, for you only). The dashboard sums all workers to build the pyramid.
- `tokenLimit` (optional, send it once, typically the orchestrator): the token budget of the whole session, e.g. `"tokenLimit":1000000`.
- Do not put secrets, credentials, or personal data in `message`.

## 3. At the end: close yourself

Only when your work is definitively finished (you will do nothing else):

```bash
curl -s -X POST http://localhost:8765/api/report \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ahmose","status":"done","message":"Fixed the bug, tests green","tokensUsed":81000}'
```

After `done` the name is retired: the character collapses and further reports are rejected.

## 4. Orchestrators: propagate to subagents

Subagents do not load this skill automatically. When you spawn one, add to its prompt:

> Report to the AI Workers dashboard: register with `POST http://localhost:8765/api/register` body `{"name":"<a unique person name>","role":"worker"}` (409 = taken, pick another; connection error = skip reporting). Then send `POST /api/report` with `{"name","message","tokensUsed"}` at each step, and `{"name","status":"done","message"}` when finished. Keep the same name until the end.

You can pre-assign names (e.g. "your name is Tiye") to avoid collisions.

## Windows PowerShell (if no bash/curl)

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8765/api/report -ContentType 'application/json' `
  -Body (@{ name = 'Ahmose'; message = 'Running tests'; tokensUsed = 50000 } | ConvertTo-Json)
```
