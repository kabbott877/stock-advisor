# Stock Advisor — Checkpoint

## Current State

- **Phase:** 1.1 Earnings Calendar ✅
- **Next:** 1.2 Price Data (Polygon.io aggregate bars)
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
- [x] Phase 2: Scan feature (mock data → now uses real earnings data)
- [x] Phase 3: Research detail view (mock data)
- [x] CORS configured (localhost, LAN, Tailscale)
- [x] Repo pushed to GitHub, public

## What's Next

1. **Phase 1.2:** Price data from Polygon.io (aggregate bars)
2. **Phase 1.3:** ATR calculation (30-day trailing)
3. **Phase 1.4:** Fundamentals (earnings actual vs estimate)
4. Wire price + ATR into scan to filter overreaction (>1.5x ATR)

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
/data/projects/stock-advisor/
├── checkpoint.md               # This file
├── docs/
│   ├── devspec.md              # Full specification
│   └── worklist.md             # Phased work plan (Phase 1.2 = CURRENT)
└── src/
    ├── package.json
    ├── README.md
    ├── .gitignore
    ├── client/                 # React + Vite
    │   ├── .env                # VITE_API_URL=http://100.73.91.28:3001
    │   └── src/
    │       ├── App.jsx
    │       ├── App.css
    │       ├── pages/          # Dashboard, Login, Register
    │       └── components/     # ScanResults, SymbolDetail
    └── server/                 # Express API
        ├── .env                # PORT, JWT_SECRET, CLIENT_URL, POLYGON_API_KEY
        └── src/
            ├── index.js
            ├── middleware/auth.js
            ├── services/       # Data layer
            │   └── earningsCalendar.js  # SEC EDGAR earnings calendar
            └── routes/         # auth, earnings, scan, research
```

## Team

- **Kevin:** Project owner, infrastructure
- **Roger:** Developer, StratusVue background
- **Whit:** Developer, new collaborator
- **Kono:** Agent, code implementation

## Notes

- In-memory user store — resets on server restart
- Earnings calendar uses SEC EDGAR (free, no API key needed)
- Scan route returns real earnings data; move% and ATR pending Phase 1.2+
- CORS allows localhost, 192.168.1.189, 100.73.91.28
