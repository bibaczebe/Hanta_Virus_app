import { Router } from 'express';
import { getStocks } from '../services/stockService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const tickers = typeof req.query.tickers === 'string'
      ? req.query.tickers.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)
      : null;
    const data = await getStocks(tickers);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
