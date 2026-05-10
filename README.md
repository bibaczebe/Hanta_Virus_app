# HantaTracker

Real-time global hantavirus monitoring dashboard — Express API + React/Vite frontend.

## Structure

- [server/](server/) — Express.js API (port 3001)
- [client/](client/) — React + Vite + Three.js dashboard (port 5173)

## Quick start

**Terminal 1 — backend:**
```powershell
cd server
npm install
npm run dev
```

**Terminal 2 — frontend:**
```powershell
cd client
npm install
npm run dev
```

Then open: http://localhost:5173

## Endpoints

| Method | Path | Source |
|--------|------|--------|
| GET | `/api/globe` | Mock (15 countries with hantavirus data) |
| GET | `/api/globe/:code` | Mock (timeline + demographics for one country) |
| GET | `/api/stocks?tickers=MRNA,INO` | Alpha Vantage (real) |
| GET | `/api/news?limit=20&region=global` | NewsAPI.org (real) |
| GET | `/api/health` | Cache stats + uptime |

## Environment

Copy `server/.env.example` to `server/.env` and fill in:

- `ALPHA_VANTAGE_KEY` — https://alphavantage.co (5 req/min free tier)
- `NEWSAPI_ORG_KEY` — https://newsapi.org (100 req/day free tier)

## Caching

- Globe data: 6h TTL
- Stocks: 30min TTL
- News: 1h TTL

Scheduler refreshes caches in the background.
