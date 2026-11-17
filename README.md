# AI Workers UI

Dashboard animata che mostra cosa stanno facendo le istanze di Claude (worker e orchestratori).
Ogni istanza si registra con un nome di persona univoco e invia aggiornamenti a `http://localhost:8765`.

Skin disponibile: **Egitto**
- i **worker** sono operai che portano pietre dalla pila alla piramide;
- gli **orchestratori** sono supervisori con la frusta;
- la **pila di pietre** sono i token rimasti: più token si usano, più la pila cala e la piramide cresce (100% = budget esaurito, la cima diventa d'oro);
- quando un worker si chiude, il suo omino **crolla a terra** (nome con `†`);
- ogni nuovo messaggio appare in un **fumetto** per 30 secondi.

## 1. Avvio della dashboard

Serve Docker. Dalla cartella del progetto:

```bash
docker compose up -d --build
```

Apri http://localhost:8765. Per fermarla: `docker compose down`.

Il budget token di default è 1.000.000; si cambia in `docker-compose.yml` (`TOKEN_BUDGET`) oppure inviando `tokenLimit` in un report.
Il pulsante **Reset sessione** cancella tutti i worker (lo stato è in memoria: si azzera anche al riavvio del container).

## 2. Installazione della skill

Copia la cartella `skill/ai-workers` nella cartella skill di Claude Code.

Per tutti i progetti (utente):

```bash
# macOS / Linux / Git Bash
mkdir -p ~/.claude/skills && cp -r skill/ai-workers ~/.claude/skills/
```

```powershell
# Windows PowerShell
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Copy-Item -Recurse -Force skill\ai-workers "$HOME\.claude\skills\"
```

Solo per un progetto: copiala in `<progetto>/.claude/skills/ai-workers`.

Riavvia Claude Code; la skill compare tra quelle disponibili (`/ai-workers`).

## 3. Uso

- Lancia la skill a inizio lavoro: `/ai-workers` oppure scrivi "usa ai-workers e poi ...".
- Per averla sempre attiva, aggiungi al `CLAUDE.md` (utente o progetto):

  ```markdown
  All'inizio di ogni task usa la skill ai-workers e passala a ogni subagent.
  ```

Cosa fa Claude con la skill:
1. sceglie un nome di persona e si registra (`POST /api/register`); se il nome è già preso ne sceglie un altro;
2. a ogni passo significativo invia un messaggio e la stima dei token usati (`POST /api/report`);
3. a fine lavoro si chiude (`status: "done"`) e il suo omino crolla.

Gli orchestratori inseriscono le istruzioni nei prompt dei subagent, che compaiono come operai.
Se la dashboard è spenta, Claude salta il reporting senza bloccare il lavoro.

> Nota: Claude non conosce con precisione i propri token consumati; `tokensUsed` è una stima.

## API

| Metodo | Path | Body | Risposte |
|---|---|---|---|
| POST | `/api/register` | `{ name, role: "worker"\|"orchestrator" }` | 201, 400, 409 nome già usato |
| POST | `/api/report` | `{ name, message?, tokensUsed?, tokenLimit?, status?: "working"\|"done" }` | 200, 400, 404 non registrato, 409 già chiuso |
| GET | `/api/state` | – | `{ workers, tokensUsed, tokenLimit, progress, serverTime }` |
| DELETE | `/api/state` | – | reset |

Prova manuale:

```bash
curl -X POST localhost:8765/api/register -H 'Content-Type: application/json' -d '{"name":"Khufu","role":"orchestrator"}'
curl -X POST localhost:8765/api/register -H 'Content-Type: application/json' -d '{"name":"Tiye"}'
curl -X POST localhost:8765/api/report -H 'Content-Type: application/json' -d '{"name":"Tiye","message":"Scrivo i test","tokensUsed":300000}'
curl -X POST localhost:8765/api/report -H 'Content-Type: application/json' -d '{"name":"Tiye","status":"done"}'
```

## Sviluppo

```bash
cd backend && npm install && npm test && npm start   # API su :8765
cd frontend && npm install && npm run dev            # UI con hot reload, proxy /api -> :8765
```

Nuova skin: crea un componente in `frontend/src/skins/` che riceve `{ state, now }` e registralo in `frontend/src/skins/index.js`.

## Struttura

```
backend/            Express: API + file statici del frontend
frontend/           React + Vite, skin in src/skins/
skill/ai-workers/   la skill da copiare in ~/.claude/skills
Dockerfile, docker-compose.yml
```
