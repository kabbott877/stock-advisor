# Stock Advisor — Checkpoint

## Current State

- **Phase:** Phase 4 Complete
- **Next:** Phase 5 Production Readiness or deploy
- **Servers:** Running on MUTHUR (UI :5173, API :3001)
- **Repo:** https://github.com/kabbott877/stock-advisor (public)

## Tech Stack

- **Frontend:** React + Vite (port 5173)
- **Backend:** Node.js + Express (port 3001)
- **Auth:** Multi-user with JWT (in-memory store)
- **Data:** SEC EDGAR (earnings), Polygon.io (prices, key in .env)

## What's Done

- [x] Phase 0: Project setup
- [x] Phase 1.1: Earnings calendar (SEC EDGAR 8-K Item 2.02)
- [x] Phase 1.2: Price data (Polygon.io aggregate bars, movePercent)
- [x] Phase 1.3: ATR calculation (30-day trailing, >1.5x flag)
- [x] Phase 1.4: Fundamentals (guidance, one-time items from 8-K)
- [x] Phase 2: Scan feature (real earnings, price, ATR, fundamentals)
- [x] Phase 3: Research detail view (mock data)
- [x] Phase 4: Polish (responsive UI, error handling, loading states)
- [x] SQLite database (users, scan_results)
- [x] Finnhub news service (company news, market news, analysts, price targets)
- [x] CORS configured (localhost, LAN, Tailscale)
- [x] Repo pushed to GitHub, public

## What's Next

1. **Phase 2.3:** Cache scan results (avoid duplicate API calls)
2. **Phase 3.6:** News API integration (Finviz / NewsAPI)
3. **Phase 4:** Polish — responsive UI, error handling, loading states
4. **Phase 5:** Production readiness (database, auth refresh, rate limiting)

## Key Commands

```bash
cd /data/projects/stock-advisor/src
npm run dev            # Start client + server
```

## Access URLs

- **UI:** http://100.73.91.28:5173
- **API:** http://100.73.91.28:3001

## File Map

```
/data/projects/stock-advisor/src/
├── checkpoint.md               # This file
├── docs/
│   ├── devspec.md              # Full specification
│   └── worklist.md             # Phased work plan
├── client/                     # React + Vite
│   ├── .env                    # VITE_API_URL=http://100.73.91.28:3001
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── pages/              # Dashboard, Login, Register
│       └── components/         # ScanResults, SymbolDetail
└── server/                     # Express API
    ├── .env                    # PORT, JWT_SECRET, CLIENT_URL, POLYGON_API_KEY, FINNHUB_API_KEY
    ├── data/                   # SQLite database (gitignored)
    └── src/
        ├── index.js
        ├── database.js         # SQLite initialization
        ├── middleware/auth.js
        ├── services/           # Data layer
        │   ├── earningsCalendar.js  # SEC EDGAR earnings calendar
        │   ├── priceData.js         # Polygon.io OHLC, move calc, ATR calc
        │   ├── fundamentals.js      # SEC EDGAR 8-K parsing (guidance, one-time)
        │   └── news.js              # Finnhub news, analysts, price targets
        └── routes/             # auth, earnings, scan, research, news
```

## Team

- **Kevin:** Project owner, infrastructure
- **Roger:** Developer, StratusVue background
- **Whit:** Developer, new collaborator
- **Kono:** Agent, code implementation

## Notes

- SQLite database for user persistence and scan caching
- Earnings calendar uses SEC EDGAR (free, no API key needed)
- Price data uses Polygon.io free tier (5 calls/min, delayed data)
- News and analyst data uses Finnhub (60 calls/min)
- Scan defaults to 2 tickers with price data (use ?limit=N to adjust)
- Results sorted by ATR ratio (flagged >1.5x first)
- CORS allows localhost, 192.168.1.189, 100.73.91.28
