import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import OverviewMetrics from '../components/OverviewMetrics.jsx';
import Globe from '../components/Globe.jsx';
import AnalyticsTabs from '../components/AnalyticsTabs.jsx';
import DataBadge from '../components/DataBadge.jsx';
import Layout from '../components/Layout.jsx';
import { fetchGlobe, fetchStocks, fetchNews } from '../api.js';

export default function Dashboard() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const countryParam = searchParams.get('country')?.toUpperCase() || null;

  const globeQ = useQuery({
    queryKey: ['globe'],
    queryFn: fetchGlobe,
    refetchInterval: 6 * 60 * 60 * 1000,
    staleTime: 6 * 60 * 60 * 1000,
  });
  const stocksQ = useQuery({
    queryKey: ['stocks'],
    queryFn: () => fetchStocks(),
    refetchInterval: 4 * 60 * 60 * 1000,
    staleTime: 4 * 60 * 60 * 1000,
  });
  const newsQ = useQuery({
    queryKey: ['news'],
    queryFn: () => fetchNews({ limit: 16 }),
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
  });

  const selected = useMemo(() => {
    if (!countryParam || !globeQ.data?.countries) return null;
    return globeQ.data.countries.find((c) => c.code === countryParam) ?? null;
  }, [countryParam, globeQ.data]);

  const setSelected = (country) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!country || country.code === countryParam) {
          next.delete('country');
        } else {
          next.set('country', country.code);
        }
        return next;
      },
      { replace: true },
    );
  };

  const clearSelected = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('country');
        return next;
      },
      { replace: true },
    );
  };

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
            {selected ? (
              <>
                Selected: <span className="text-financial-gold">{selected.name}</span> —{' '}
                <button onClick={clearSelected} className="underline hover:text-financial-text">
                  clear
                </button>
              </>
            ) : (
              'Drag to rotate · scroll to zoom · hover for stats'
            )}
          </span>
        </div>
        <Globe
          countries={globeQ.data?.countries || []}
          selected={selected}
          onSelect={setSelected}
        />
      </section>

      <AnalyticsTabs
        globe={globeQ.data}
        stocks={stocksQ.data}
        news={newsQ.data}
        selected={selected}
        onSelect={setSelected}
        onClear={clearSelected}
      />
    </Layout>
  );
}
