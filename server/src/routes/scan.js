import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All scan routes require authentication
router.use(authenticateToken);

// GET /api/scan - Run earnings overreaction scan
router.get('/', async (req, res) => {
  try {
    // TODO: Integrate with Polygon.io / Finviz APIs
    // Placeholder response
    const mockResults = [
      {
        symbol: 'AAPL',
        earningsDate: '2026-01-28',
        movePercent: -8.5,
        atrRatio: 2.1,
        fundamentalChange: false
      },
      {
        symbol: 'MSFT',
        earningsDate: '2026-01-29',
        movePercent: 12.3,
        atrRatio: 1.8,
        fundamentalChange: false
      },
      {
        symbol: 'TSLA',
        earningsDate: '2026-01-30',
        movePercent: -15.2,
        atrRatio: 2.5,
        fundamentalChange: true
      }
    ];

    res.json({
      success: true,
      count: mockResults.length,
      results: mockResults
    });
  } catch (err) {
    res.status(500).json({ error: 'Scan failed', details: err.message });
  }
});

export default router;
