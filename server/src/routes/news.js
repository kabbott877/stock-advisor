import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCompanyNews,
  getMarketNews,
  getAnalystRecommendations,
  getPriceTarget
} from '../services/news.js';

const router = express.Router();

// All news routes require authentication
router.use(authenticateToken);

/**
 * GET /api/news/company/:ticker - Get company news
 *
 * Query params:
 *   - daysBack (number, default 7): Days to look back
 */
router.get('/company/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const daysBack = Math.min(parseInt(req.query.daysBack) || 7, 30);

    const news = await getCompanyNews(ticker.toUpperCase(), daysBack);
    res.json({ success: true, ticker: ticker.toUpperCase(), count: news.length, news });
  } catch (err) {
    console.error(`[News] Company news error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch company news', details: err.message });
  }
});

/**
 * GET /api/news/market - Get market news
 *
 * Query params:
 *   - category (string, default 'general'): general, forex, crypto, merger
 */
router.get('/market', async (req, res) => {
  try {
    const category = req.query.category || 'general';
    const news = await getMarketNews(category);
    res.json({ success: true, category, count: news.length, news });
  } catch (err) {
    console.error('[News] Market news error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market news', details: err.message });
  }
});

/**
 * GET /api/news/analysts/:ticker - Get analyst recommendations
 */
router.get('/analysts/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const recommendations = await getAnalystRecommendations(ticker.toUpperCase());
    res.json({ success: true, ticker: ticker.toUpperCase(), count: recommendations.length, recommendations });
  } catch (err) {
    console.error('[News] Analyst recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analyst recommendations', details: err.message });
  }
});

/**
 * GET /api/news/price-target/:ticker - Get price target
 */
router.get('/price-target/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const target = await getPriceTarget(ticker.toUpperCase());
    res.json({ success: true, ticker: ticker.toUpperCase(), target });
  } catch (err) {
    console.error('[News] Price target error:', err.message);
    res.status(500).json({ error: 'Failed to fetch price target', details: err.message });
  }
});

export default router;
