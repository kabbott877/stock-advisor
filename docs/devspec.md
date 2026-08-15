# Stock Advisor — Development Specification

## Overview

A web application that identifies stocks exhibiting earnings-day overreaction patterns and provides research tools to evaluate mean reversion opportunities.

**Core Strategy:** Detect stocks with oversized moves (>1.5x 30-day ATR) on earnings day, then help users determine if the move is fundamental or noise — signaling a fade opportunity.

## Interface Pitch

### Dashboard (Home)
- Clean, dark theme
- Prominent **"Run Scan"** button in the top bar
- Below: table of scan results, sortable/filterable

### Scan Phase
- User clicks **Run Scan**
- App pulls earnings calendar (Polygon.io / Finviz) + real-time price data
- Filters for stocks with earnings in the last 1-2 days
- Flags those with oversized intraday moves (>1.5x 30-day ATR)
- Returns a ranked list: symbol, earnings date, move %, ATR ratio, fundamental change flag (Yes/No)

### Research Phase (Drill-Down)
- User clicks a symbol → expands into a detail view with tabs:
  - **Overview** — Price chart, current price, ATR context, move visualization
  - **Earnings** — Actual vs estimate, guidance change (yes/no), one-time items flagged
  - **Fundamentals** — Revenue mix, TAM, churn, competitive position summary
  - **Signal** — Mean reversion indicator: "Entry window" vs "Material change — skip"
  - **News** — Live feed of headlines related to the ticker
  - **Risk** — Position sizing calculator, suggested stop, tail risk warning

### Visual Flow
```
[Run Scan] → [List of flagged symbols] → [Select one] → [Detail view with tabs]
```

---

## User Flow

```
[Run Scan] → [List of flagged symbols] → [Select one] → [Detail view with tabs]
```

### Phase 1: Scan

- User clicks **Run Scan** button
- App pulls earnings calendar (Polygon.io / Finviz) + real-time price data
- Filters for stocks with earnings in the last 1-2 days
- Flags those with oversized intraday moves (>1.5x 30-day ATR)
- Returns a ranked list:
  - Symbol
  - Earnings date
  - Move %
  - ATR ratio
  - Fundamental change flag (Yes/No)

### Phase 2: Research (Drill-Down)

- User clicks a symbol → expands into a detail view with tabs:
  - **Overview** — Price chart, current price, ATR context, move visualization
  - **Earnings** — Actual vs estimate, guidance change (yes/no), one-time items flagged
  - **Fundamentals** — Revenue mix, TAM, churn, competitive position summary
  - **Signal** — Mean reversion indicator: "Entry window" vs "Material change — skip"
  - **News** — Live feed of headlines related to the ticker
  - **Risk** — Position sizing calculator, suggested stop, tail risk warning

---

## Strategy Factors

### What Drives the Overreaction

- Algorithmic trading bots front-running earnings and dumping on headlines
- Options market makers hedging delta, unwinding post-announcement
- Retail panic/greed on headline miss/beat without reading actual numbers
- Liquidity gaps after hours and at open — thin books amplify moves

### When the Fade Works

- Move is >2σ from stock's normal daily range
- Revenue/earnings miss or beat driven by one-time items (restructuring, legal, FX)
- Guidance maintained or only slightly adjusted
- No material change to TAM, competitive position, or management

### When the Fade Doesn't Work

- Guidance materially revised (up or down)
- Revenue model fundamentally shifts (churn acceleration, contract loss)
- Insider selling/buying patterns support the move
- Move accompanied by unusual volume persisting beyond day 1

---

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Earnings calendar | Polygon.io / Finviz / SEC EDGAR | Tickers and dates |
| Price data | Polygon.io / Finviz | Intraday and historical |
| ATR calculation | 30-day trailing ATR | Compare to earnings day range |
| Fundamentals | SEC filings, earnings releases | Revenue, guidance, one-time items |
| News | News API / Finviz | Headlines for context |

---

## Tech Stack (TBD)

- Frontend: TBD (React, Svelte, or similar)
- Backend: TBD (Python/FastAPI, Node, etc.)
- Data APIs: Polygon.io (primary), Finviz (secondary)

---

## Project Structure

```
/data/projects/stock-advisor/
├── checkpoint.md          # Continuity across resets
├── docs/
│   ├── devspec.md         # This file
│   └── worklist.md        # Phased work plan
└── src/                   # Application scaffold
```

---

## Status

- [ ] Spec reviewed and approved
- [ ] Tech stack decided
- [ ] Worklist created
- [ ] Implementation started
