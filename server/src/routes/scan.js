import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecentEarnings } from '../services/earningsCalendar.js';

const router = express.Router();

// All scan routes require authentication
router.use(authenticateToken);

/**
 * GET /api/scan - Run earnings overreaction scan
 *
 * Phase 1.1: Returns recent earnings announcements from SEC EDGAR.
 * Future phases will add price data, ATR calculation, and filtering.
 *
 * Query params:
 *   - daysBack (number, default 2): How many days to look back
 */
router.get('/', async (req, res) => {
  try {
    const daysBack = Math.min(parseInt(req.query.daysBack) || 2, 7);

    console.log(`[Scan] Running earnings scan (${daysBack} days back)`);

    // Step 1: Fetch recent earnings calendar from SEC EDGAR
    const earnings = await getRecentEarnings(daysBack);

    // Phase 1.2+ will add:
    // - Price data from Polygon.io
    // - ATR calculation
    // - Overreaction filtering (>1.5x ATR)
    // - Fundamental change detection

    // For now, return earnings calendar data in the expected format
    const results = earnings.map(item => ({
      symbol: item.ticker,
      earningsDate: item.earningsDate,
      companyName: item.companyName,
      movePercent: null,       // Phase 1.2: from Polygon.io price data
      atrRatio: null,          // Phase 1.3: from ATR calculation
      fundamentalChange: false, // Phase 1.4: from fundamentals analysis
      source: item.source,
      filingAccession: item.filingAccession
    }));

    res.json({
      success: true,
      count: results.length,
      daysBack,
      phase: '1.1',
      note: 'Move% and ATR ratio will be populated in Phase 1.2+',
      results
    });
  } catch (err) {
    console.error('[Scan]', err.message);
    res.status(500).json({ error: 'Scan failed', details: err.message });
  }
});

export default router;
