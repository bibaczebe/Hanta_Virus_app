import cache from '../lib/cache.js';
import { MOCK_COUNTRIES, buildTimeline, buildDemographics } from '../data/mockGlobe.js';

const TTL = Number(process.env.CACHE_GLOBE_TTL || 21600);
const CACHE_KEY = 'globe:all';

export async function getGlobeSnapshot() {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;

  const countries = MOCK_COUNTRIES.map((c) => ({ ...c, lastUpdate: new Date().toISOString() }));
  const totals = countries.reduce(
    (acc, c) => {
      acc.cases += c.cases;
      acc.newCases += c.newCases;
      acc.deaths += c.deaths;
      acc.newDeaths += c.newDeaths;
      return acc;
    },
    { cases: 0, newCases: 0, deaths: 0, newDeaths: 0 },
  );
  totals.mortalityRate = totals.cases ? Number(((totals.deaths / totals.cases) * 100).toFixed(2)) : 0;
  totals.mostAffected = [...countries].sort((a, b) => b.cases - a.cases)[0]?.name ?? null;

  const payload = { countries, totals, generatedAt: new Date().toISOString(), source: 'mock' };
  cache.set(CACHE_KEY, payload, TTL);
  return payload;
}

export async function getCountryDetail(code) {
  const upper = code.toUpperCase();
  const country = MOCK_COUNTRIES.find((c) => c.code === upper);
  if (!country) return null;
  return {
    ...country,
    timeline: buildTimeline(country, 30),
    demographics: buildDemographics(country),
    lastUpdate: new Date().toISOString(),
  };
}

export function invalidateGlobeCache() {
  cache.del(CACHE_KEY);
}
