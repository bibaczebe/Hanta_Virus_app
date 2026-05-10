import { Router } from 'express';
import { getNews } from '../services/newsService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const region = (req.query.region || 'global').toString();
    const data = await getNews({ limit, region });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
