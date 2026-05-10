export const MOCK_COUNTRIES = [
  { name: 'United States', code: 'US', lat: 39.8283, lng: -98.5795, cases: 850, newCases: 12, deaths: 312, newDeaths: 1, casesPer100k: 0.26, trend7day: -3, trend30day: 8, spreadRate: 0.42, controlIndex: 0.78 },
  { name: 'Argentina', code: 'AR', lat: -38.4161, lng: -63.6167, cases: 2340, newCases: 28, deaths: 410, newDeaths: 4, casesPer100k: 5.18, trend7day: 12, trend30day: 22, spreadRate: 0.81, controlIndex: 0.45 },
  { name: 'Chile', code: 'CL', lat: -35.6751, lng: -71.5430, cases: 1180, newCases: 9, deaths: 380, newDeaths: 1, casesPer100k: 6.13, trend7day: -5, trend30day: -2, spreadRate: 0.58, controlIndex: 0.62 },
  { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253, cases: 1620, newCases: 22, deaths: 670, newDeaths: 5, casesPer100k: 0.76, trend7day: 8, trend30day: 18, spreadRate: 0.71, controlIndex: 0.51 },
  { name: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188, cases: 4220, newCases: 45, deaths: 124, newDeaths: 2, casesPer100k: 2.92, trend7day: 6, trend30day: 14, spreadRate: 0.66, controlIndex: 0.58 },
  { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954, cases: 3890, newCases: 31, deaths: 89, newDeaths: 1, casesPer100k: 0.27, trend7day: -2, trend30day: 4, spreadRate: 0.38, controlIndex: 0.83 },
  { name: 'South Korea', code: 'KR', lat: 35.9078, lng: 127.7669, cases: 410, newCases: 3, deaths: 11, newDeaths: 0, casesPer100k: 0.79, trend7day: 1, trend30day: -3, spreadRate: 0.22, controlIndex: 0.91 },
  { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515, cases: 320, newCases: 4, deaths: 6, newDeaths: 0, casesPer100k: 0.38, trend7day: 0, trend30day: 2, spreadRate: 0.18, controlIndex: 0.88 },
  { name: 'Finland', code: 'FI', lat: 61.9241, lng: 25.7482, cases: 1280, newCases: 14, deaths: 19, newDeaths: 0, casesPer100k: 23.10, trend7day: 5, trend30day: 11, spreadRate: 0.55, controlIndex: 0.69 },
  { name: 'Sweden', code: 'SE', lat: 60.1282, lng: 18.6435, cases: 540, newCases: 6, deaths: 8, newDeaths: 0, casesPer100k: 5.17, trend7day: 2, trend30day: 6, spreadRate: 0.36, controlIndex: 0.79 },
  { name: 'Poland', code: 'PL', lat: 51.9194, lng: 19.1451, cases: 145, newCases: 2, deaths: 3, newDeaths: 0, casesPer100k: 0.38, trend7day: -1, trend30day: 3, spreadRate: 0.21, controlIndex: 0.86 },
  { name: 'Canada', code: 'CA', lat: 56.1304, lng: -106.3468, cases: 220, newCases: 2, deaths: 78, newDeaths: 0, casesPer100k: 0.58, trend7day: -2, trend30day: 1, spreadRate: 0.28, controlIndex: 0.84 },
  { name: 'Panama', code: 'PA', lat: 8.5380, lng: -80.7821, cases: 380, newCases: 5, deaths: 65, newDeaths: 1, casesPer100k: 8.60, trend7day: 7, trend30day: 16, spreadRate: 0.62, controlIndex: 0.55 },
  { name: 'Bolivia', code: 'BO', lat: -16.2902, lng: -63.5887, cases: 290, newCases: 4, deaths: 78, newDeaths: 1, casesPer100k: 2.41, trend7day: 4, trend30day: 9, spreadRate: 0.51, controlIndex: 0.61 },
  { name: 'Paraguay', code: 'PY', lat: -23.4425, lng: -58.4438, cases: 210, newCases: 3, deaths: 42, newDeaths: 0, casesPer100k: 2.85, trend7day: 3, trend30day: 7, spreadRate: 0.48, controlIndex: 0.65 },
];

export function buildTimeline(country, days = 30) {
  const today = new Date();
  const baseline = Math.max(1, Math.round(country.cases / days / 1.5));
  const drift = country.trend30day / 100;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const noise = 0.7 + Math.random() * 0.6;
    const trendFactor = 1 + drift * ((days - i) / days);
    const cases = Math.max(0, Math.round(baseline * noise * trendFactor));
    const deaths = Math.max(0, Math.round(cases * (country.deaths / Math.max(1, country.cases))));
    result.push({ date: date.toISOString().slice(0, 10), cases, deaths });
  }
  return result;
}

export function buildDemographics(country) {
  return {
    ageGroups: [
      { range: '0-17', pct: 8 },
      { range: '18-34', pct: 22 },
      { range: '35-54', pct: 41 },
      { range: '55-74', pct: 24 },
      { range: '75+', pct: 5 },
    ],
    gender: { male: 62, female: 38 },
    occupations: [
      { label: 'Agriculture / forestry', pct: 38 },
      { label: 'Construction', pct: 14 },
      { label: 'Military', pct: 9 },
      { label: 'Outdoor recreation', pct: 12 },
      { label: 'Other / unknown', pct: 27 },
    ],
  };
}
