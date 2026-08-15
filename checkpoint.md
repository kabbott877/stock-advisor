# Stock Advisor — Checkpoint

## Current State

- **Phase:** 1.1 Earnings Calendar (IN PROGRESS)
- **Blocked on:** Polygon.io API key needed
- **Servers:** Running on MUTHUR (UI :5173, API :3001)
- **Repo:** https://github.com/kabbott877/stock-advisor (public)

## Tech Stack

- **Frontend:** React + Vite (port 5173)
- **Backend:** Node.js + Express (port 3001)
- **Auth:** Multi-user with JWT (in-memory store)
- **Data:** Polygon.io (pending API key)

## What's Done

- [x] Phase 0: Project setup
- [x] Phase 2: Scan feature (mock data)
- [x] Phase 3: Research detail view (mock data)
- [x] CORS configured (localhost, LAN, Tailscale)
- [x] Repo pushed to GitHub, public

## What's Next

1. **Get Polygon.io API key** (free tier OK for dev)
2. Add key to `server/.env` as `POLYGON_API_KEY`
3. Implement earnings calendar integration (Phase 1.1)
4. Then: price data (1.2), ATR (1.3), fundamentals (1.4)

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
│   └── worklist.md             # Phased work plan (Phase 1.1 = CURRENT)
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
            └── routes/         # auth, scan, research
```

## Team

- **Kevin:** Project owner, infrastructure
- **Roger:** Developer, StratusVue background
- **Whit:** Developer, new collaborator
- **Kono:** Agent, code implementation

## Notes

- In-memory user store — resets on server restart
- Scan/research routes return mock data — awaiting Polygon.io integration
- CORS allows localhost, 192.168.1.189, 100.73.91.28
