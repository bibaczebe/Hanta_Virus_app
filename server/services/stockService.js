import axios from 'axios';
import cache from '../lib/cache.js';

const TTL = Number(process.env.CACHE_STOCKS_TTL || 14400);
const CACHE_PREFIX = 'stocks:';
const ALPHA_BASE = 'https://www.alphavantage.co/query';
const RATE_DELAY_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TICKER_NAMES = {
  MRNA: 'Moderna Inc.',
  INO: 'Inovio Pharmaceuticals',
  GRFS: 'Grifols S.A.',
  REGN: 'Regeneron Pharmaceuticals',
  XBI: 'SPDR S&P Biotech ETF',
  PFE: 'Pfizer Inc.',
  BNTX: 'BioNTech SE',
};

async function fetchQuote(ticker) {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) throw new Error('ALPHA_VANTAGE_KEY missing');

  const { data } = await axios.get(ALPHA_BASE, {
    params: { function: 'GLOBAL_QUOTE', symbol: ticker, apikey: key },
    timeout: 10000,
  });

  const q = data?.['Global Quote'];
  if (!q || !q['05. price']) {
    return {
      ticker,
      name: TICKER_NAMES[ticker] || ticker,
      price: null,
      change: null,
      changePercent: null,
      volume: null,
      lastUpdate: null,
      error: data?.Note || data?.Information || 'No data returned',
    };
  }

  return {
    ticker,
    name: TICKER_NAMES[ticker] || ticker,
    price: Number(q['05. price']),
    change: Number(q['09. change']),
    changePercent: Number(String(q['10. change percent']).replace('%', '')),
    volume: Number(q['06. volume']),
    lastUpdate: q['07. latest trading day'],
  };
}

export async function getStocks(tickers) {
  const list = tickers && tickers.length
    ? tickers
    : (process.env.STOCK_TICKERS || 'MRNA,INO,GRFS,REGN,XBI').split(',').map((t) => t.trim()).filter(Boolean);

  const results = [];
  let networkCalls = 0;
  for (const ticker of list) {
    const cacheKey = `${CACHE_PREFIX}${ticker}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      results.push(cached);
      continue;
    }
    if (networkCalls > 0) await sleep(RATE_DELAY_MS);
    try {
      const quote = await fetchQuote(ticker);
      networkCalls++;
      cache.set(cacheKey, quote, TTL);
      results.push(quote);
    } catch (err) {
      networkCalls++;
      results.push({
        ticker,
        name: TICKER_NAMES[ticker] || ticker,
        price: null,
        error: err.message,
      });
    }
  }

  const valid = results.filter((r) => typeof r.changePercent === 'number');
  const summary = {
    avgChangePercent: valid.length
      ? Number((valid.reduce((s, r) => s + r.changePercent, 0) / valid.length).toFixed(2))
      : null,
    gainers: valid.filter((r) => r.changePercent > 0).length,
    losers: valid.filter((r) => r.changePercent < 0).length,
  };

  return { stocks: results, summary, generatedAt: new Date().toISOString() };
}

export function invalidateStockCache() {
  for (const k of cache.stats().keys) {
    if (k.startsWith(CACHE_PREFIX)) cache.del(k);
  }
}
