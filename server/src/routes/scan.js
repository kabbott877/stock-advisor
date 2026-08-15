import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecentEarnings } from '../services/earningsCalendar.js';
import { batchEarningsDayMoves, batchATRRatios } from '../services/priceData.js';
import { batchFundamentals } from '../services/fundamentals.js';

const router = express.Router();

// All scan routes require authentication
router.use(authenticateToken);

/**
 * GET /api/scan - Run earnings overreaction scan
 *
 * Fetches recent earnings from SEC EDGAR, then gets price data
 * from Polygon.io to calculate earnings day moves and ATR ratios.
 *
 * Query params:
 *   - daysBack (number, default 2): How many days to look back
 *   - limit (number, default 2): Max tickers to fetch data for
 */
router.get('/', async (req, res) => {
  try {
    const daysBack = Math.min(parseInt(req.query.daysBack) || 2, 7);
    const limit = Math.min(parseInt(req.query.limit) || 2, 50);

    console.log(`[Scan] Running earnings scan (${daysBack} days back, limit ${limit})`);

    // Step 1: Fetch recent earnings calendar from SEC EDGAR
    const earnings = await getRecentEarnings(daysBack);
    console.log(`[Scan] Found ${earnings.length} earnings announcements`);

    // Step 2: Limit to top N tickers (sorted by date, most recent first)
    const toFetch = earnings.slice(0, limit);
    console.log(`[Scan] Fetching price data for ${toFetch.length} tickers...`);

    // Step 3: Fetch earnings day price data from Polygon.io
    const priceData = await batchEarningsDayMoves(toFetch);
    console.log(`[Scan] Got price data for ${priceData.size} tickers`);

    // Step 4: Calculate ATR ratios (30-day trailing)
    const atrData = await batchATRRatios(toFetch);
    console.log(`[Scan] Got ATR data for ${atrData.size} tickers`);

    // Step 5: Fetch fundamentals from 8-K filings
    const fundamentals = await batchFundamentals(toFetch);
    console.log(`[Scan] Got fundamentals for ${fundamentals.size} tickers`);

    // Step 6: Merge all data
    const results = earnings.map(item => {
      const prices = priceData.get(item.ticker);
      const atr = atrData.get(item.ticker);
      const fund = fundamentals.get(item.ticker);

      // Determine if fundamental change warrants skipping the fade
      // Material change = guidance down OR multiple one-time items
      const fundamentalChange = fund
        ? (fund.guidanceChange === 'down' || fund.oneTimeItems.length >= 2)
        : false;

      return {
        symbol: item.ticker,
        earningsDate: item.earningsDate,
        companyName: item.companyName,
        movePercent: prices?.movePercent ?? null,
        rangePercent: prices?.rangePercent ?? null,
        open: prices?.open ?? null,
        close: prices?.close ?? null,
        high: prices?.high ?? null,
        low: prices?.low ?? null,
        volume: prices?.volume ?? null,
        atr: atr?.atr ?? null,
        atrRatio: atr?.atrRatio ?? null,
        flagged: atr?.flagged ?? false,
        fundamentalChange,
        guidanceChange: fund?.guidanceChange ?? 'unknown',
        oneTimeItems: fund?.oneTimeItems ?? [],
        source: item.source,
        filingAccession: item.filingAccession
      };
    });

    // Sort: flagged (>1.5x ATR) first, then by ATR ratio descending
    results.sort((a, b) => {
      if (a.flagged && !b.flagged) return -1;
      if (!a.flagged && b.flagged) return 1;
      if (a.atrRatio === null) return 1;
      if (b.atrRatio === null) return -1;
      return b.atrRatio - a.atrRatio;
    });

    res.json({
      success: true,
      count: results.length,
      withPriceData: priceData.size,
      withFundamentals: fundamentals.size,
      daysBack,
      limit,
      results
    });
  } catch (err) {
    console.error('[Scan]', err.message);
    res.status(500).json({ error: 'Scan failed', details: err.message });
  }
});

export default router;
