import axios from 'axios';
import cache from '../lib/cache.js';

const TTL = Number(process.env.CACHE_NEWS_TTL || 3600);
const CACHE_PREFIX = 'news:';
const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';

const POSITIVE_WORDS = ['vaccine', 'cure', 'breakthrough', 'recovery', 'effective', 'success', 'approved', 'progress', 'decline', 'controlled'];
const NEGATIVE_WORDS = ['outbreak', 'death', 'fatal', 'spread', 'rising', 'surge', 'crisis', 'epidemic', 'warning', 'alert'];

function scoreSentiment(text = '') {
  const t = text.toLowerCase();
  const pos = POSITIVE_WORDS.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  const neg = NEGATIVE_WORDS.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  if (pos === 0 && neg === 0) return 'neutral';
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
}

export async function getNews({ limit = 20, region = 'global' } = {}) {
  const cacheKey = `${CACHE_PREFIX}${region}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const key = process.env.NEWSAPI_ORG_KEY;
  if (!key) throw new Error('NEWSAPI_ORG_KEY missing');

  const query = region === 'global'
    ? 'hantavirus OR "hemorrhagic fever" OR "viral outbreak"'
    : `hantavirus AND ${region}`;

  const { data } = await axios.get(NEWSAPI_BASE, {
    params: {
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: Math.min(limit, 100),
      apiKey: key,
    },
    timeout: 10000,
  });

  const articles = (data.articles || []).map((a) => ({
    title: a.title,
    excerpt: a.description,
    url: a.url,
    source: a.source?.name,
    publishedAt: a.publishedAt,
    imageUrl: a.urlToImage,
    sentiment: scoreSentiment(`${a.title} ${a.description || ''}`),
  }));

  const sentimentTotals = articles.reduce(
    (acc, a) => {
      acc[a.sentiment] = (acc[a.sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 },
  );
  const total = articles.length || 1;
  const sentimentSummary = {
    positivePct: Math.round((sentimentTotals.positive / total) * 100),
    negativePct: Math.round((sentimentTotals.negative / total) * 100),
    neutralPct: Math.round((sentimentTotals.neutral / total) * 100),
  };

  const payload = {
    articles,
    sentimentSummary,
    totalResults: data.totalResults || articles.length,
    generatedAt: new Date().toISOString(),
  };
  cache.set(cacheKey, payload, TTL);
  return payload;
}

export function invalidateNewsCache() {
  for (const k of cache.stats().keys) {
    if (k.startsWith(CACHE_PREFIX)) cache.del(k);
  }
}
