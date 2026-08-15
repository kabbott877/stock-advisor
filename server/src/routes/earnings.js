import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecentEarnings } from '../services/earningsCalendar.js';

const router = express.Router();

// All earnings routes require authentication
router.use(authenticateToken);

/**
 * GET /api/earnings
 * Query params:
 *   - daysBack (number, default 2): How many days to look back
 *
 * Returns a normalized earnings calendar from SEC EDGAR 8-K filings.
 */
router.get('/', async (req, res) => {
  try {
    const daysBack = Math.min(parseInt(req.query.daysBack) || 2, 7);

    const earnings = await getRecentEarnings(daysBack);

    res.json({
      success: true,
      count: earnings.length,
      daysBack,
      results: earnings
    });
  } catch (err) {
    console.error('[Earnings API]', err.message);
    res.status(500).json({
      error: 'Failed to fetch earnings calendar',
      details: err.message
    });
  }
});

export default router;
