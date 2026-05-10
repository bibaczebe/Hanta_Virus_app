import { Router } from 'express';
import { getGlobeSnapshot, getCountryDetail } from '../services/globeService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getGlobeSnapshot();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const detail = await getCountryDetail(req.params.code);
    if (!detail) return res.status(404).json({ error: 'Country not found' });
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

export default router;
