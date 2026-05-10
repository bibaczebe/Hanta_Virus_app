import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

export async function fetchGlobe() {
  const { data } = await api.get('/api/globe');
  return data;
}

export async function fetchCountry(code) {
  const { data } = await api.get(`/api/globe/${code}`);
  return data;
}

export async function fetchStocks(tickers) {
  const params = tickers ? { tickers: tickers.join(',') } : {};
  const { data } = await api.get('/api/stocks', { params });
  return data;
}

export async function fetchNews({ limit = 20, region = 'global' } = {}) {
  const { data } = await api.get('/api/news', { params: { limit, region } });
  return data;
}

export async function fetchHealth() {
  const { data } = await api.get('/api/health');
  return data;
}
