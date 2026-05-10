import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import globeRouter from './routes/globe.js';
import stocksRouter from './routes/stocks.js';
import newsRouter from './routes/news.js';
import healthRouter from './routes/health.js';
import { startScheduler } from './lib/scheduler.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    name: 'HantaTracker API',
    version: '0.1.0',
    endpoints: ['/api/globe', '/api/globe/:code', '/api/stocks', '/api/news', '/api/health'],
  });
});

app.use('/api/globe', globeRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/news', newsRouter);
app.use('/api/health', healthRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`HantaTracker API listening on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'test') startScheduler();
});
