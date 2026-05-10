import schedule from 'node-schedule';
import { invalidateGlobeCache, getGlobeSnapshot } from '../services/globeService.js';
import { invalidateStockCache, getStocks } from '../services/stockService.js';
import { invalidateNewsCache, getNews } from '../services/newsService.js';

export function startScheduler() {
  // Globe — every 6 hours
  schedule.scheduleJob('0 */6 * * *', async () => {
    console.log('[scheduler] refresh globe');
    invalidateGlobeCache();
    try { await getGlobeSnapshot(); } catch (e) { console.error('[scheduler] globe failed:', e.message); }
  });

  // Stocks — every 4 hours (Alpha Vantage free tier: 25 req/day cap)
  schedule.scheduleJob('0 */4 * * *', async () => {
    console.log('[scheduler] refresh stocks');
    invalidateStockCache();
    try { await getStocks(); } catch (e) { console.error('[scheduler] stocks failed:', e.message); }
  });

  // News — every hour
  schedule.scheduleJob('0 * * * *', async () => {
    console.log('[scheduler] refresh news');
    invalidateNewsCache();
    try { await getNews({ limit: 20 }); } catch (e) { console.error('[scheduler] news failed:', e.message); }
  });

  console.log('[scheduler] started — globe(6h) stocks(4h) news(1h)');
}
