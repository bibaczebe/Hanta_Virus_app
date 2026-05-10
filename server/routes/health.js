import { Router } from 'express';
import cache from '../lib/cache.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cache: cache.stats(),
    env: process.env.NODE_ENV,
  });
});

export default router;
