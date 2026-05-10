import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OverviewMetrics from '../components/OverviewMetrics.jsx';
import Globe from '../components/Globe.jsx';
import AnalyticsTabs from '../components/AnalyticsTabs.jsx';
import DataBadge from '../components/DataBadge.jsx';
import Layout from '../components/Layout.jsx';
import { fetchGlobe, fetchStocks, fetchNews } from '../api.js';

export default function Dashboard() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);

  const globeQ = useQuery({ queryKey: ['globe'], queryFn: fetchGlobe });
  const stocksQ = useQuery({ queryKey: ['stocks'], queryFn: () => fetchStocks() });
  const newsQ = useQuery({ queryKey: ['news'], queryFn: () => fetchNews({ limit: 16 }) });

  const isRefreshing = globeQ.isFetching || stocksQ.isFetching || newsQ.isFetching;
  const errored = globeQ.isError || stocksQ.isError || newsQ.isError;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['globe'] });
    qc.invalidateQueries({ queryKey: ['stocks'] });
    qc.invalidateQueries({ queryKey: ['news'] });
  };

  return (
    <Layout
      headerProps={{
        totals: globeQ.data?.totals,
        generatedAt: globeQ.data?.generatedAt,
        onRefresh: refresh,
        isRefreshing,
      }}
    >
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

      <OverviewMetrics globe={globeQ.data} stocks={stocksQ.data} news={newsQ.data} />

      <section className="max-w-screen-2xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs uppercase tracking-[0.25em] text-financial-muted truncate">
              Live Spread Map
            </h2>
            <DataBadge
              variant="demo"
              title={`Source field from API: "${globeQ.data?.source ?? 'mock'}". Replace with WHO/CDC/PAHO + Argentina BEN feeds in upcoming sprints.`}
            />
          </div>
          <span className="text-[10px] text-financial-muted text-right">
            {selected
              ? `Selected: ${selected.name} — click again to clear`
              : 'Drag to rotate · scroll to zoom · hover for stats'}
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
    </Layout>
  );
}
