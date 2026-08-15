/**
 * Polygon.io Price Data Service
 *
 * Fetches OHLC (Open, High, Low, Close) data from Polygon.io
 * (now Massive) aggregate bars API.
 *
 * Free tier: delayed data, 5 calls/min.
 */

const POLYGON_BASE = 'https://api.massive.com';
const REQUEST_DELAY_MS = 12000; // 5 calls/min = 1 per 12s on free tier

let lastRequestTime = 0;

/**
 * Rate-limit wrapper: ensures at least REQUEST_DELAY_MS between requests.
 */
async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }

  lastRequestTime = Date.now();

  const res = await fetch(url, {
    headers: { 'User-Agent': 'StockAdvisor/1.0' }
  });

  if (!res.ok) {
    throw new Error(`Polygon API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch daily OHLC bars for a ticker over a date range.
 *
 * @param {string} ticker - Stock symbol (e.g., "AAPL")
 * @param {string} from - Start date YYYY-MM-DD
 * @param {string} to - End date YYYY-MM-DD
 * @returns {Promise<Array>} Array of { date, open, high, low, close, volume, vwap }
 */
async function getDailyBars(ticker, from, to) {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    throw new Error('POLYGON_API_KEY not set in environment');
  }

  const url = `${POLYGON_BASE}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?apiKey=${apiKey}&adjusted=true&sort=asc`;

  const data = await rateLimitedFetch(url);

  if (data.status === 'ERROR' || data.error) {
    throw new Error(`Polygon error for ${ticker}: ${data.error || data.message}`);
  }

  return (data.results || []).map(bar => ({
    date: new Date(bar.t).toISOString().split('T')[0],
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
    vwap: bar.vw,
    trades: bar.n
  }));
}

/**
 * Calculate the earnings day move percentage.
 * Move = ((close - open) / open) * 100
 *
 * @param {string} ticker - Stock symbol
 * @param {string} earningsDate - YYYY-MM-DD
 * @returns {Promise<Object|null>} { movePercent, open, close, high, low, range } or null if no data
 */
async function getEarningsDayMove(ticker, earningsDate) {
  try {
    const bars = await getDailyBars(ticker, earningsDate, earningsDate);

    if (!bars || bars.length === 0) {
      console.log(`[PriceData] No bars for ${ticker} on ${earningsDate}`);
      return null;
    }

    const bar = bars[0];
    const movePercent = ((bar.close - bar.open) / bar.open) * 100;
    const range = bar.high - bar.low;
    const rangePercent = (range / bar.open) * 100;

    return {
      movePercent: Math.round(movePercent * 100) / 100,
      rangePercent: Math.round(rangePercent * 100) / 100,
      open: bar.open,
      close: bar.close,
      high: bar.high,
      low: bar.low,
      volume: bar.volume,
      vwap: bar.vwap
    };
  } catch (err) {
    console.error(`[PriceData] Error fetching ${ticker}:`, err.message);
    return null;
  }
}

/**
 * Fetch 30-day historical bars for ATR baseline calculation.
 *
 * @param {string} ticker - Stock symbol
 * @param {string} endDate - YYYY-MM-DD (end of the 30-day window)
 * @returns {Promise<Array>} Array of daily bars
 */
async function getATRHistory(ticker, endDate) {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - 35); // extra days to ensure 30 trading days

  const from = start.toISOString().split('T')[0];
  const to = endDate;

  return getDailyBars(ticker, from, to);
}

/**
 * Batch fetch earnings day moves for multiple tickers.
 * Respects rate limits by sequential fetching.
 *
 * @param {Array} earnings - Array of { ticker, earningsDate }
 * @returns {Promise<Map>} Map of ticker -> { movePercent, open, close, ... }
 */
async function batchEarningsDayMoves(earnings) {
  const results = new Map();

  for (const item of earnings) {
    const move = await getEarningsDayMove(item.ticker, item.earningsDate);
    if (move) {
      results.set(item.ticker, move);
    }
  }

  return results;
}

export {
  getDailyBars,
  getEarningsDayMove,
  getATRHistory,
  batchEarningsDayMoves
};
