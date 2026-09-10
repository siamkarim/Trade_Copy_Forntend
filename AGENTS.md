# Frontend agent memory

Read this instead of the long backend docs. Copy-trading invariants live in the backend `AGENTS.md`.

## This repo

Next.js UI only. No broker sockets, no lot math, no terminal provisioning.

## Never

- Call MT5 / IB from the browser.
- Place or cancel orders from a click handler. Flatten and kill-switch are API flags; the engine acts.
- Auto-enable a symbol map. Show suggestions; require an explicit confirm.
- Store MT5/IB passwords in localStorage. Send them once over HTTPS; the backend vaults them.
- Add `Co-authored-by` to commits.

## API base

`NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Bearer JWT from `/api/auth/login`.

## Screens to keep consistent

Accounts list → add master (IB **or** MT5) → add MT5 slaves → copy rule per slave → live drift/health.

Slave form fields: display name, login, password, server. Optional: investor flag (reject for slaves — they must trade).

Warn in copy: some brokers kick the older session if the user also opens MT5 at home.

## Backend pairing

https://github.com/siamkarim/trade_Copy_Backend
