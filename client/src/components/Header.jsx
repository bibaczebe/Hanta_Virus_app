import { useEffect, useState } from 'react';
import { Activity, Globe2, RefreshCw } from 'lucide-react';
import { fmtNum, fmtRelative } from '../utils/format.js';

export default function Header({ totals, generatedAt, onRefresh, isRefreshing }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(i);
  }, []);
  const updatedLabel = (
    <>
      <Activity className="w-3 h-3 text-virus-safe" />
      <span>Updated {fmtRelative(generatedAt)}</span>
      {onRefresh && (
        <RefreshCw
          className={`w-3 h-3 opacity-50 group-hover:opacity-100 transition ${isRefreshing ? 'animate-spin opacity-100' : ''}`}
        />
      )}
    </>
  );

  return (
    <header className="backdrop-blur bg-financial-navy/85 border-b border-financial-slate/20">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full border border-financial-gold flex items-center justify-center shrink-0">
            <Globe2 className="w-4 h-4 text-financial-gold" />
          </div>
          <div className="leading-tight min-w-0">
            <h1 className="font-display text-base text-financial-text tracking-tight truncate">HantaTracker</h1>
            <p className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-financial-muted">
              Global Hantavirus Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 text-xs text-financial-muted shrink-0">
          <div className="hidden md:flex items-center gap-6">
            <Stat label="Cases" value={fmtNum(totals?.cases)} accent="text-financial-text" />
            <Stat label="Deaths" value={fmtNum(totals?.deaths)} accent="text-virus-red" />
            <Stat label="New (24h)" value={fmtNum(totals?.newCases)} accent="text-financial-gold" />
          </div>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Auto-refreshes (globe 6h · stocks 4h · news 30m). Click to refetch now."
              className="group flex items-center gap-1.5 text-xs text-financial-muted hover:text-financial-gold disabled:opacity-60 disabled:cursor-wait transition"
            >
              {updatedLabel}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">{updatedLabel}</div>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, accent = 'text-financial-text' }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] uppercase tracking-wider text-financial-muted">{label}</span>
      <span className={`tabular text-sm ${accent}`}>{value}</span>
    </div>
  );
}
