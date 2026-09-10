# TradeCopy Frontend

Web app for **TradeCopy**: register, sign in, add an IB or MT5 master, add multiple MT5 slaves, and watch copied positions.

This repo is the Next.js UI. The API, copy engine, and Windows MT5 terminal agent live in [`trade_Copy_Backend`](https://github.com/siamkarim/trade_Copy_Backend). Planning analysis is in [`tradedocs`](https://github.com/siamkarim/tradedocs).

## What the user does here

1. Create an account and sign in.
2. Add a **master** — Interactive Brokers (user / password / host / port) **or** MT5 (login / password / server).
3. Add one or more **MT5 slaves** with login, password, server, and a display name.
4. Attach a **copy rule** per slave: sizing mode, max lot, daily-loss cap, symbol whitelist, reverse copy, below-minimum policy.
5. Confirm **symbol maps** the backend suggests. Maps do not go live until a human confirms them.
6. Watch live status: terminal health, desired vs actual lots (drift), copy history, kill switch.

When a user saves an MT5 account, the backend asks the Windows VPS to open a portable MetaTrader 5 terminal for that login so master → slave copy can run.

## Status

The backend already has the copy-decision core, auth/account APIs, and the terminal-farm agent. This frontend repo is being built against that API:

| Screen | API |
|---|---|
| Register / login | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Accounts | `GET /api/accounts`, `POST /api/accounts/mt5`, `POST /api/accounts/ib` |
| Copy rules | `GET /api/copy-rules`, `POST /api/copy-rules` |

## Stack

Next.js (App Router) + TypeScript. Talks to the FastAPI backend; never talks to MT5 or IB directly.

## Local run

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API must be running from the backend repo (`tradecopy serve` after Postgres/Redis).

## Out of scope

Placing orders from the browser. Flatten / kill-switch only write desired state; the copy engine is the only process that talks to brokers.

## License

Proprietary. All rights reserved.
