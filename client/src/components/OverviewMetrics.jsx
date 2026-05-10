import { TrendingUp, TrendingDown, Skull, Users, AlertTriangle, BarChart3, Newspaper, Building2 } from 'lucide-react';
import { fmtNum, fmtPct, trendArrow, trendColor } from '../utils/format.js';
import DataBadge from './DataBadge.jsx';

export default function OverviewMetrics({ globe, stocks, news }) {
  const totals = globe?.totals;
  const stocksAvg = stocks?.summary?.avgChangePercent;
  const positivePct = news?.sentimentSummary?.positivePct ?? 0;
  const negativePct = news?.sentimentSummary?.negativePct ?? 0;
  const sentimentNet = positivePct - negativePct;

  const cards = [
    {
      label: 'Total Cases',
      value: fmtNum(totals?.cases),
      sub: `${trendArrow(totals?.newCases || 0)} ${fmtNum(totals?.newCases)} new (24h)`,
      icon: <Users className="w-4 h-4" />,
      accent: 'text-financial-text',
      badge: { variant: 'demo' },
    },
    {
      label: 'Total Deaths',
      value: fmtNum(totals?.deaths),
      sub: `Mortality ${totals?.mortalityRate ?? '—'}%`,
      icon: <Skull className="w-4 h-4" />,
      accent: 'text-virus-red',
      badge: { variant: 'demo' },
    },
    {
      label: 'Most Affected',
      value: totals?.mostAffected || '—',
      sub: 'Highest active case load',
      icon: <AlertTriangle className="w-4 h-4" />,
      accent: 'text-virus-orange',
      badge: { variant: 'demo' },
    },
    {
      label: 'Biotech Trend',
      value: stocksAvg !== null && stocksAvg !== undefined ? fmtPct(stocksAvg) : '—',
      sub: `${stocks?.summary?.gainers ?? 0} up · ${stocks?.summary?.losers ?? 0} down`,
      icon: stocksAvg >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
      accent: stocksAvg >= 0 ? 'text-virus-safe' : 'text-virus-red',
      badge: { variant: 'real', source: 'Alpha Vantage' },
    },
    {
      label: 'News Sentiment',
      value: `${positivePct}% / ${negativePct}%`,
      sub: `Net ${sentimentNet > 0 ? '+' : ''}${sentimentNet}pp pos vs neg`,
      icon: <Newspaper className="w-4 h-4" />,
      accent: trendColor(sentimentNet),
      badge: { variant: 'real', source: 'NewsAPI' },
    },
    {
      label: 'Tracked Markets',
      value: fmtNum(stocks?.stocks?.length),
      sub: 'Biotech / pharma equities',
      icon: <Building2 className="w-4 h-4" />,
      accent: 'text-financial-gold',
      badge: { variant: 'real', source: 'Alpha Vantage' },
    },
  ];

  return (
    <section className="max-w-screen-2xl mx-auto px-6 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.25em] text-financial-muted flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" /> Overview
        </h2>
        <span className="text-[10px] text-financial-muted">Auto-refreshes: globe 6h · stocks 4h · news 30m</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <article key={c.label} className="relative bg-financial-card rounded-lg p-4 hairline shadow-card hover:border-financial-gold/30 transition">
            <div className="absolute top-2 right-2">
              {c.badge && <DataBadge variant={c.badge.variant} source={c.badge.source} />}
            </div>
            <div className="flex items-center gap-2 mb-3 pr-16">
              <span className={c.accent}>{c.icon}</span>
              <span className="text-[10px] uppercase tracking-wider text-financial-muted">{c.label}</span>
            </div>
            <div className={`tabular text-2xl font-semibold ${c.accent}`}>{c.value}</div>
            <div className="text-[11px] text-financial-muted mt-1">{c.sub}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
