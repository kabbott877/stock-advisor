/**
 * Polygon.io Price Data Service
 *
 * Fetches OHLC (Open, High, Low, Close) data from Polygon.io
 * (now Massive) aggregate bars API.
 *
 * Free tier: delayed data, 5 calls/min.
 */

const POLYGON_BASE = 'https://api.massive.com';
const REQUEST_DELAY_MS = 13000; // 5 calls/min = ~13s between requests on free tier

let lastRequestTime = 0;

/**
 * Rate-limit wrapper: ensures at least REQUEST_DELAY_MS between requests.
 * Retries on 429 with exponential backoff.
 */
async function rateLimitedFetch(url, retries = 2) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }

  lastRequestTime = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'StockAdvisor/1.0' }
    });

    if (res.status === 429 && attempt < retries) {
      const wait = (attempt + 2) * 15000; // 30s, 45s backoff
      console.log(`[PriceData] 429 rate limited, waiting ${wait / 1000}s before retry...`);
      await new Promise(r => setTimeout(r, wait));
      lastRequestTime = Date.now();
      continue;
    }

    if (!res.ok) {
      throw new Error(`Polygon API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }
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
 * Calculate 30-day trailing Average True Range (ATR).
 *
 * True Range = max(high - low, |high - prevClose|, |low - prevClose|)
 * ATR = Simple Moving Average of True Range over 30 trading days
 *
 * @param {Array} bars - Array of daily bars (sorted asc by date)
 * @param {number} period - ATR period (default 30)
 * @returns {number|null} ATR value, or null if insufficient data
 */
function calculateATR(bars, period = 30) {
  if (!bars || bars.length < period + 1) {
    // Need period+1 bars: period True Ranges + 1 prevClose for first TR
    return null;
  }

  const trueRanges = [];

  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  // Use last `period` True Ranges for the ATR
  const recentTR = trueRanges.slice(-period);
  const atr = recentTR.reduce((sum, tr) => sum + tr, 0) / recentTR.length;

  return Math.round(atr * 100) / 100;
}

/**
 * Get the ATR ratio for a stock's earnings day move.
 * Ratio = earnings day range / 30-day ATR
 *
 * A ratio > 1.5 suggests the move exceeded normal volatility —
 * a potential overreaction candidate.
 *
 * @param {string} ticker - Stock symbol
 * @param {string} earningsDate - YYYY-MM-DD
 * @returns {Promise<Object|null>} { atr, atrRatio, flagged } or null
 */
async function getATRRatio(ticker, earningsDate) {
  try {
    // Fetch 30-day history ending on earnings date
    const bars = await getATRHistory(ticker, earningsDate);
    if (!bars || bars.length < 31) {
      console.log(`[ATR] Insufficient data for ${ticker}: got ${bars?.length || 0} bars, need 31`);
      return null;
    }

    // Calculate 30-day ATR
    const atr = calculateATR(bars, 30);
    if (!atr || atr === 0) {
      return null;
    }

    // Get earnings day bar (last bar in the range)
    const earningsBar = bars[bars.length - 1];
    const earningsDayRange = earningsBar.high - earningsBar.low;

    // Calculate ratio
    const atrRatio = Math.round((earningsDayRange / atr) * 100) / 100;
    const flagged = atrRatio > 1.5;

    return { atr, atrRatio, flagged };
  } catch (err) {
    console.error(`[ATR] Error for ${ticker}:`, err.message);
    return null;
  }
}

/**
 * Batch fetch ATR ratios for multiple tickers.
 * Respects rate limits by sequential fetching.
 *
 * @param {Array} earnings - Array of { ticker, earningsDate }
 * @returns {Promise<Map>} Map of ticker -> { atr, atrRatio, flagged }
 */
async function batchATRRatios(earnings) {
  const results = new Map();

  for (const item of earnings) {
    const atrData = await getATRRatio(item.ticker, item.earningsDate);
    if (atrData) {
      results.set(item.ticker, atrData);
    }
  }

  return results;
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
  calculateATR,
  getATRRatio,
  batchATRRatios,
  batchEarningsDayMoves
};
