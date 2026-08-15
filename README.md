# Stock Advisor

A web application that identifies stocks exhibiting earnings-day overreaction patterns and provides research tools to evaluate mean reversion opportunities.

## Strategy

Detect stocks with oversized moves (>1.5x 30-day ATR) on earnings day, then help users determine if the move is fundamental or noise — signaling a fade opportunity.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Auth:** JWT-based authentication
- **Data:** Polygon.io API, Finviz, News APIs

## Project Structure

```
stock-advisor/
├── checkpoint.md          # Continuity across resets
├── docs/
│   ├── devspec.md         # Development specification
│   └── worklist.md        # Phased work plan
└── src/                   # Application code
    ├── client/            # React frontend
    └── server/            # Express backend
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Polygon.io API key (for earnings/price data)

### Installation

```bash
# Install all dependencies
npm run install:all

# Copy environment variables
cp server/.env.example server/.env

# Edit server/.env with your API keys
```

### Development

```bash
# Start both client and server
npm run dev

# Or start individually:
npm run dev:server    # API on port 3001
npm run dev:client    # UI on port 5173
```

### Authentication

1. Register a new account at `/register`
2. Login at `/login`
3. JWT token is stored in localStorage
4. All API requests require `Authorization: Bearer <token>` header

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Scan
- `GET /api/scan` - Run earnings overreaction scan (requires auth)

### Research
- `GET /api/research/:symbol` - Get detailed analysis (requires auth)

## Environment Variables

See `server/.env.example` for required configuration:

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `POLYGON_API_KEY` - Polygon.io API key

## License

MIT
