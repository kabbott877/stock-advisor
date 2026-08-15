import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All research routes require authentication
router.use(authenticateToken);

// GET /api/research/:symbol - Get detailed research for a symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // TODO: Integrate with Polygon.io, Finviz, News APIs
    // Placeholder response
    const research = {
      symbol: symbol.toUpperCase(),
      overview: {
        currentPrice: 178.50,
        atr30Day: 4.25,
        earningsMove: -8.5,
        moveVsATR: 2.1
      },
      earnings: {
        actualEPS: 2.18,
        estimatedEPS: 2.10,
        guidanceChanged: false,
        oneTimeItems: ['Legal settlement - $0.15/share']
      },
      fundamentals: {
        revenueBreakdown: { products: 65, services: 35 },
        tam: 'Cloud computing market',
        churnRate: 2.1,
        growthRate: 15.3
      },
      signal: {
        type: 'Entry window',
        confidence: 0.78,
        reasoning: 'Earnings beat driven by one-time legal settlement, guidance maintained'
      },
      news: [
        { headline: 'Beat on EPS but guidance steady', time: '2h ago' },
        { headline: 'Legal settlement impacts Q4 results', time: '4h ago' }
      ],
      risk: {
        suggestedPositionSize: '2% of portfolio',
        suggestedStop: '-12%',
        tailRiskWarning: 'High - market conditions volatile'
      }
    };

    res.json({ success: true, research });
  } catch (err) {
    res.status(500).json({ error: 'Research fetch failed', details: err.message });
  }
});

export default router;
