import { Activity, Globe2, RefreshCw } from 'lucide-react';
import { fmtNum, fmtRelative } from '../utils/format.js';

export default function Header({ totals, generatedAt, onRefresh, isRefreshing }) {
  return (
    <header className="backdrop-blur bg-financial-navy/85 hairline-t" style={{ borderBottom: '1px solid rgba(192,192,192,0.08)' }}>
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-financial-gold flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-financial-gold" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-base text-financial-text tracking-tight">HantaTracker</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-financial-muted">Global Hantavirus Intelligence</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-financial-muted">
          <Stat label="Cases" value={fmtNum(totals?.cases)} accent="text-financial-text" />
          <Stat label="Deaths" value={fmtNum(totals?.deaths)} accent="text-virus-red" />
          <Stat label="New (24h)" value={fmtNum(totals?.newCases)} accent="text-financial-gold" />
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-virus-safe" />
            <span>Updated {fmtRelative(generatedAt)}</span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hairline text-xs text-financial-text hover:border-financial-gold/40 hover:text-financial-gold transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
