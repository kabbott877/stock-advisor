/**
 * SEC EDGAR Earnings Calendar Service
 *
 * Uses EDGAR's full-text search (EFTS) to find recent 8-K filings
 * with Item 2.02 (Results of Operations and Financial Condition) —
 * the standard earnings announcement filing.
 *
 * Free, reliable, no API key required.
 */

const EDGAR_EFTS_BASE = 'https://efts.sec.gov/LATEST/search-index';
const EDGAR_TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';

const USER_AGENT = 'StockAdvisor/1.0 (contact@stock-advisor.dev)';
const REQUEST_DELAY_MS = 100; // SEC EDGAR rate limit: 10 req/sec

let tickerCache = null;
let tickerCacheTime = 0;
const TICKER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch the SEC EDGAR company tickers mapping (CIK → ticker symbol).
 * Cached for 24 hours.
 */
async function fetchTickerMap() {
  const now = Date.now();
  if (tickerCache && (now - tickerCacheTime) < TICKER_CACHE_TTL) {
    return tickerCache;
  }

  const res = await fetch(EDGAR_TICKERS_URL, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch EDGAR ticker map: ${res.status}`);
  }

  const data = await res.json();
  // Convert from object {0: {cik_str, ticker, title}, ...} to Map<CIK, ticker>
  const map = new Map();
  for (const key of Object.keys(data)) {
    const entry = data[key];
    if (entry.cik_str && entry.ticker) {
      const cik = entry.cik_str.toString().padStart(10, '0');
      map.set(cik, entry.ticker);
    }
  }

  tickerCache = map;
  tickerCacheTime = now;
  return map;
}

/**
 * Search SEC EDGAR EFTS for recent 8-K filings with Item 2.02 (earnings).
 *
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {number} limit - Max results (default 100)
 * @returns {Promise<Array>} Array of earnings announcement objects
 */
async function fetchRecentEarnings(startDate, endDate, limit = 100) {
  const params = new URLSearchParams({
    q: '"item 2.02"',
    forms: '8-K',
    dateRange: 'custom',
    startdt: startDate,
    enddt: endDate,
    _source: 'ciks,display_names,file_date,adsh,form',
    size: limit.toString()
  });

  const url = `${EDGAR_EFTS_BASE}?${params}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (!res.ok) {
    throw new Error(`EDGAR EFTS request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const hits = data?.hits?.hits || [];

  return hits.map(hit => {
    const source = hit._source || {};
    const displayNames = source.display_names || [];
    const ciks = source.ciks || [];

    // Parse ticker from display name: "Company Name (TICKER, ...) (CIK ...)"
    let ticker = null;
    for (const name of displayNames) {
      const match = name.match(/\(([A-Z]{1,5})(?:,|\))/);
      if (match) {
        ticker = match[1];
        break;
      }
    }

    // Fallback: use CIK-to-ticker map
    if (!ticker && ciks.length > 0) {
      ticker = ciks[0]; // Will be resolved later if needed
    }

    return {
      ticker,
      cik: ciks[0] || null,
      companyName: displayNames[0]?.split('(')[0]?.trim() || null,
      earningsDate: source.file_date || null,
      filingAccession: source.adsh || null,
      source: 'SEC EDGAR'
    };
  }).filter(item => item.ticker && item.earningsDate);
}

/**
 * Resolve CIK values to ticker symbols using the cached ticker map.
 * Only applies to entries where ticker is still a CIK value.
 */
async function resolveTickers(earnings) {
  const tickerMap = await fetchTickerMap();

  return earnings.map(item => {
    if (item.ticker && /^\d+$/.test(item.ticker)) {
      // It's a CIK, resolve to ticker
      const resolved = tickerMap.get(item.ticker);
      if (resolved) {
        return { ...item, ticker: resolved };
      }
    }
    return item;
  });
}

/**
 * Get recent earnings announcements (last N days).
 *
 * @param {number} daysBack - How many days to look back (default 2)
 * @returns {Promise<Array>} Normalized earnings calendar
 */
async function getRecentEarnings(daysBack = 2) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - daysBack);

  const startDate = start.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  console.log(`[EarningsCalendar] Fetching earnings from ${startDate} to ${endDate}`);

  let earnings = await fetchRecentEarnings(startDate, endDate, 200);

  // Resolve any CIK-only tickers
  earnings = await resolveTickers(earnings);

  // Deduplicate by ticker (keep most recent per ticker)
  const byTicker = new Map();
  for (const item of earnings) {
    const existing = byTicker.get(item.ticker);
    if (!existing || item.earningsDate > existing.earningsDate) {
      byTicker.set(item.ticker, item);
    }
  }

  const results = Array.from(byTicker.values())
    .sort((a, b) => b.earningsDate.localeCompare(a.earningsDate));

  console.log(`[EarningsCalendar] Found ${results.length} unique tickers with recent earnings`);

  return results;
}

export {
  getRecentEarnings,
  fetchRecentEarnings,
  fetchTickerMap
};
