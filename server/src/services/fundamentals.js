/**
 * Fundamentals Service
 *
 * Parses SEC EDGAR 8-K filings for:
 * - Actual earnings data (revenue, EPS)
 * - Guidance changes (up/down/maintained)
 * - One-time items (restructuring, legal, FX, etc.)
 *
 * Note: Analyst estimates are not freely available via EDGAR.
 * We'll flag "actual vs estimate" as pending a paid data source.
 */

const EDGAR_BASE = 'https://www.sec.gov';

/**
 * Fetch 8-K filing content from EDGAR.
 *
 * @param {string} accessionNumber - Filing accession number (with dashes)
 * @returns {Promise<string>} Filing HTML content
 */
async function fetchFilingContent(accessionNumber) {
  const cleanAccession = accessionNumber.replace(/-/g, '');
  const url = `${EDGAR_BASE}/Archives/edgar/data/${cleanAccession}/${accessionNumber}-index.htm`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'StockAdvisor/1.0 (contact@example.com)' }
  });

  if (!res.ok) {
    throw new Error(`EDGAR error: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

/**
 * Parse 8-K filing for earnings-related content.
 * Extracts key financial metrics and flags material items.
 *
 * @param {string} html - Filing HTML content
 * @param {string} ticker - Stock symbol for context
 * @returns {Object} Parsed fundamentals data
 */
function parseFilingContent(html, ticker) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // Look for guidance keywords
  const guidanceUp = /(?:raise|increase|increase|boost|improve|higher).*guidance/i;
  const guidanceDown = /(?:lower|reduce|cut|decrease|reduce|miss).*guidance/i;
  const guidanceMaintained = /(?:maintain|reaffirm|confirm|stand|unchanged).*guidance/i;

  let guidanceChange = 'unknown';
  if (guidanceUp.test(text)) guidanceChange = 'up';
  else if (guidanceDown.test(text)) guidanceChange = 'down';
  else if (guidanceMaintained.test(text)) guidanceChange = 'maintained';

  // Flag one-time items
  const oneTimePatterns = [
    /restructur/i,
    /litigation|legal\s+settlement/i,
    /foreign\s+exchange|fx\s+(?:gain|loss)/i,
    /impair/i,
    /goodwill/i,
    /discontinued\s+operation/i,
    /acquisition|merger/i,
    /restructur/i
  ];

  const oneTimeFlags = [];
  for (const pattern of oneTimePatterns) {
    const match = text.match(pattern);
    if (match) {
      oneTimeFlags.push(match[0].toLowerCase());
    }
  }

  // Try to extract revenue figure (approximate pattern matching)
  let revenue = null;
  const revenueMatch = text.match(/(?:total\s+)?revenue[s]?\s*(?:of|was|were|:)?\s*\$?\s*([\d,.]+)\s*(million|billion|m|b)/i);
  if (revenueMatch) {
    const num = parseFloat(revenueMatch[1].replace(/,/g, ''));
    const scale = revenueMatch[2].toLowerCase().startsWith('b') ? 1e9 : 1e6;
    revenue = num * scale;
  }

  // Try to extract EPS
  let eps = null;
  const epsMatch = text.match(/(?:diluted\s+)?(?:earnings|eps|income\s+per\s+share)[^$]*\$\s*([+-]?[\d.]+)/i);
  if (epsMatch) {
    eps = parseFloat(epsMatch[1]);
  }

  return {
    ticker,
    guidanceChange,
    oneTimeItems: [...new Set(oneTimeFlags)], // dedupe
    revenue,
    eps,
    hasGuidanceLanguage: guidanceChange !== 'unknown',
    hasOneTimeItems: oneTimeFlags.length > 0
  };
}

/**
 * Get fundamentals for a single ticker from its 8-K filing.
 *
 * @param {string} ticker - Stock symbol
 * @param {string} accessionNumber - EDGAR accession number
 * @returns {Promise<Object|null>} Fundamentals data or null
 */
async function getTickerFundamentals(ticker, accessionNumber) {
  try {
    const html = await fetchFilingContent(accessionNumber);
    return parseFilingContent(html, ticker);
  } catch (err) {
    console.error(`[Fundamentals] Error for ${ticker}:`, err.message);
    return null;
  }
}

/**
 * Batch fetch fundamentals for multiple tickers.
 *
 * @param {Array} earnings - Array of { ticker, filingAccession }
 * @returns {Promise<Map>} Map of ticker -> fundamentals data
 */
async function batchFundamentals(earnings) {
  const results = new Map();

  for (const item of earnings) {
    if (!item.filingAccession) continue;
    const data = await getTickerFundamentals(item.ticker, item.filingAccession);
    if (data) {
      results.set(item.ticker, data);
    }
  }

  return results;
}

export {
  fetchFilingContent,
  parseFilingContent,
  getTickerFundamentals,
  batchFundamentals
};
