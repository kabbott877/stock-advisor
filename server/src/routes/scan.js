import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecentEarnings } from '../services/earningsCalendar.js';
import { batchEarningsDayMoves } from '../services/priceData.js';

const router = express.Router();

// All scan routes require authentication
router.use(authenticateToken);

/**
 * GET /api/scan - Run earnings overreaction scan
 *
 * Fetches recent earnings from SEC EDGAR, then gets price data
 * from Polygon.io to calculate earnings day moves.
 *
 * Query params:
 *   - daysBack (number, default 2): How many days to look back
 *   - limit (number, default 20): Max tickers to fetch price data for
 *                                 (Polygon free tier: 5 calls/min)
 */
router.get('/', async (req, res) => {
  try {
    const daysBack = Math.min(parseInt(req.query.daysBack) || 2, 7);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

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

    // Step 4: Merge earnings calendar with price data
    const results = earnings.map(item => {
      const prices = priceData.get(item.ticker);
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
        atrRatio: null,          // Phase 1.3: from ATR calculation
        fundamentalChange: false, // Phase 1.4: from fundamentals analysis
        source: item.source,
        filingAccession: item.filingAccession
      };
    });

    // Sort by absolute movePercent descending (biggest movers first)
    results.sort((a, b) => {
      if (a.movePercent === null) return 1;
      if (b.movePercent === null) return -1;
      return Math.abs(b.movePercent) - Math.abs(a.movePercent);
    });

    res.json({
      success: true,
      count: results.length,
      withPriceData: priceData.size,
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
