# Stock Advisor — Worklist

## Phase 0: Project Setup ✅

- [x] Finalize tech stack (React + Vite, Node/Express)
- [x] Initialize Git repo in `/data/projects/stock-advisor/src/`
- [x] Set up project structure (client/, server/)
- [x] Configure basic project config (.gitignore, README)
- [x] Document env setup (.env.example)
- [x] Configure CORS for multi-origin (localhost, LAN, Tailscale)
- [x] Add request logging middleware

---

## Phase 1: Data Layer

### 1.1 Earnings Calendar (CURRENT)
- [ ] Integrate Polygon.io earnings calendar API
- [ ] Fetch upcoming/recent earnings (last 1-2 days)
- [ ] Normalize response to standard format (ticker, date, time)

### 1.2 Price Data
- [ ] Integrate Polygon.io price data API
- [ ] Fetch intraday OHLC for earnings day
- [ ] Fetch 30-day historical for ATR baseline

### 1.3 ATR Calculation
- [ ] Implement 30-day trailing ATR
- [ ] Calculate earnings day range vs ATR ratio
- [ ] Flag stocks exceeding threshold (>1.5x ATR)

### 1.4 Fundamentals
- [ ] Fetch earnings release data (actual vs estimate)
- [ ] Extract guidance changes
- [ ] Flag one-time items (restructuring, legal, FX)

---

## Phase 2: Scan Feature ✅

### 2.1 Backend Scan ✅
- [x] Create `/api/scan` endpoint
- [x] Orchestrate: calendar → prices → ATR → fundamentals (mock)
- [x] Return ranked list of flagged symbols
- [ ] Replace mock data with real Polygon.io integration

### 2.2 Frontend Scan ✅
- [x] Build "Run Scan" button component
- [x] Build results table (symbol, date, move%, ATR ratio, change flag)
- [x] Add sorting/filtering

### 2.3 Scan State ✅
- [x] Handle loading state
- [x] Handle empty results
- [ ] Cache recent scan (avoid duplicate API calls)

---

## Phase 3: Research Detail View ✅

### 3.1 Detail Layout ✅
- [x] Build detail view container (expands from selected row)
- [x] Tab navigation component (6 tabs)

### 3.2 Overview Tab ✅
- [x] Price chart placeholder
- [x] Current price display
- [x] ATR visualization

### 3.3 Earnings Tab ✅
- [x] Actual vs estimate comparison
- [x] Guidance change indicator
- [x] One-time item callouts

### 3.4 Fundamentals Tab ✅
- [x] Revenue breakdown
- [x] TAM summary
- [x] Key metrics (churn, growth)

### 3.5 Signal Tab ✅
- [x] Mean reversion indicator logic
- [x] "Entry window" vs "Material change — skip" display
- [x] Confidence score

### 3.6 News Tab ✅
- [ ] Integrate news API (Finviz / NewsAPI / similar)
- [x] Display headlines with timestamps
- [ ] Filter by relevance

### 3.7 Risk Tab ✅
- [x] Position sizing calculator
- [x] Suggested stop loss
- [x] Tail risk warning display

---

## Phase 4: Polish & Ship

- [ ] UI refinement (responsive)
- [ ] Error handling (API failures, rate limits)
- [ ] Loading states and empty states
- [ ] Basic analytics / usage tracking
- [ ] Deploy to hosting (Vercel, Railway, etc.)

---

## Phase 5: Production Readiness

- [ ] Database for user persistence (replace in-memory store)
- [ ] Refresh token flow
- [ ] Rate limiting per user
- [ ] Input validation (zod/joi)
- [ ] API error logging
- [ ] Health check endpoint refinement

---

## Open Questions

- [ ] Which database? (SQLite, PostgreSQL, MongoDB)
- [ ] Polygon.io free tier sufficient? Or paid?
- [ ] Deployment target? (Vercel, Railway, self-hosted)
