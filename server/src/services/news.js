/**
 * Finnhub News & Analyst Service
 *
 * Provides:
 * - Company news (earnings, press releases)
 * - Market news (general market events)
 * - Analyst recommendations (upgrades/downgrades)
 * - Price targets
 *
 * API: https://finnhub.io/docs/api
 * Free tier: 60 calls/min
 */

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const REQUEST_DELAY_MS = 1100; // ~55 calls/min to stay under 60/min limit

let lastRequestTime = 0;

/**
 * Rate-limited fetch wrapper.
 */
async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Get company news for a ticker.
 *
 * @param {string} ticker - Stock symbol
 * @param {number} daysBack - Days to look back (default 7)
 * @returns {Promise<Array>} Array of news items
 */
async function getCompanyNews(ticker, daysBack = 7) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY not set in environment');
  }

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack);

  const from = start.toISOString().split('T')[0];
  const to = end.toISOString().split('T')[0];

  const url = `${FINNHUB_BASE}/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${apiKey}`;
  const data = await rateLimitedFetch(url);

  return (data || []).map(item => ({
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    image: item.image,
    datetime: new Date(item.datetime * 1000).toISOString(),
    category: item.category
  }));
}

/**
 * Get general market news.
 *
 * @param {string} category - Category: general, forex, crypto, merger
 * @param {number} minId - Minimum news ID for pagination (optional)
 * @returns {Promise<Array>} Array of news items
 */
async function getMarketNews(category = 'general', minId = null) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY not set in environment');
  }

  let url = `${FINNHUB_BASE}/news?category=${category}&token=${apiKey}`;
  if (minId) {
    url += `&minId=${minId}`;
  }

  const data = await rateLimitedFetch(url);

  return (data || []).map(item => ({
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    image: item.image,
    datetime: new Date(item.datetime * 1000).toISOString(),
    category: item.category
  }));
}

/**
 * Get analyst recommendations for a ticker.
 *
 * @param {string} ticker - Stock symbol
 * @returns {Promise<Array>} Array of recommendation items
 */
async function getAnalystRecommendations(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY not set in environment');
  }

  const url = `${FINNHUB_BASE}/stock/recommendation?symbol=${ticker}&token=${apiKey}`;
  const data = await rateLimitedFetch(url);

  return (data || []).map(item => ({
    period: item.period,
    strongBuy: item.strongBuy,
    buy: item.buy,
    hold: item.hold,
    sell: item.sell,
    strongSell: item.strongSell,
    source: item.source
  }));
}

/**
 * Get price target for a ticker.
 *
 * @param {string} ticker - Stock symbol
 * @returns {Promise<Object|null>} Price target data
 */
async function getPriceTarget(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY not set in environment');
  }

  const url = `${FINNHUB_BASE}/stock/price-target?symbol=${ticker}&token=${apiKey}`;
  const data = await rateLimitedFetch(url);

  if (!data || data.error) {
    return null;
  }

  return {
    targetHigh: data.targetHigh,
    targetLow: data.targetLow,
    targetMean: data.targetMean,
    targetMedian: data.targetMedian,
    lastUpdated: data.lastUpdated
  };
}

/**
 * Batch fetch company news for multiple tickers.
 *
 * @param {Array<string>} tickers - Array of stock symbols
 * @param {number} daysBack - Days to look back (default 7)
 * @returns {Promise<Map>} Map of ticker -> news array
 */
async function batchCompanyNews(tickers, daysBack = 7) {
  const results = new Map();

  for (const ticker of tickers) {
    try {
      const news = await getCompanyNews(ticker, daysBack);
      results.set(ticker, news);
    } catch (err) {
      console.error(`[Finnhub] News error for ${ticker}:`, err.message);
    }
  }

  return results;
}

export {
  getCompanyNews,
  getMarketNews,
  getAnalystRecommendations,
  getPriceTarget,
  batchCompanyNews
};
