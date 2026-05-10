import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from './components/Header.jsx';
import OverviewMetrics from './components/OverviewMetrics.jsx';
import Globe from './components/Globe.jsx';
import AnalyticsTabs from './components/AnalyticsTabs.jsx';
import { fetchGlobe, fetchStocks, fetchNews } from './api.js';

export default function App() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);

  const globeQ = useQuery({ queryKey: ['globe'], queryFn: fetchGlobe });
  const stocksQ = useQuery({ queryKey: ['stocks'], queryFn: () => fetchStocks() });
  const newsQ = useQuery({ queryKey: ['news'], queryFn: () => fetchNews({ limit: 16 }) });

  const isRefreshing = globeQ.isFetching || stocksQ.isFetching || newsQ.isFetching;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['globe'] });
    qc.invalidateQueries({ queryKey: ['stocks'] });
    qc.invalidateQueries({ queryKey: ['news'] });
  };

  const errored = globeQ.isError || stocksQ.isError || newsQ.isError;

  return (
    <div className="min-h-screen bg-financial-navy text-financial-text font-sans">
      <Header
        totals={globeQ.data?.totals}
        generatedAt={globeQ.data?.generatedAt}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />

      {errored && (
        <div className="max-w-screen-2xl mx-auto px-6 pt-4">
          <div className="bg-virus-red/10 border border-virus-red/30 text-virus-red text-xs rounded p-3">
            Some endpoints failed. Check that the backend is running on{' '}
            <code className="font-mono">{import.meta.env.VITE_API_URL || 'http://localhost:3001'}</code>.
          </div>
        </div>
      )}

      {globeQ.isLoading && (
        <div className="max-w-screen-2xl mx-auto px-6 pt-10 text-center text-financial-muted text-sm">
          Loading global snapshot…
        </div>
      )}

      <OverviewMetrics
        globe={globeQ.data}
        stocks={stocksQ.data}
        news={newsQ.data}
      />

      <section className="max-w-screen-2xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-[0.25em] text-financial-muted">
            Live Spread Map
          </h2>
          <span className="text-[10px] text-financial-muted">
            {selected ? `Selected: ${selected.name} — click again to clear` : 'Drag to rotate · scroll to zoom · hover for stats'}
          </span>
        </div>
        <Globe
          countries={globeQ.data?.countries || []}
          onSelect={(c) => setSelected((cur) => (cur?.code === c.code ? null : c))}
        />
      </section>

      <AnalyticsTabs
        globe={globeQ.data}
        stocks={stocksQ.data}
        news={newsQ.data}
        selected={selected}
      />

      <footer className="max-w-screen-2xl mx-auto px-6 py-6 border-t border-financial-slate/20 text-[11px] text-financial-muted flex items-center justify-between">
        <span>© 2026 HantaTracker · Educational use only · Not medical or investment advice</span>
        <span className="font-mono">v0.1.0</span>
      </footer>
    </div>
  );
}
