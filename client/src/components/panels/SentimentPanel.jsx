import { ExternalLink } from 'lucide-react';
import { fmtRelative } from '../../utils/format.js';
import DataBadge from '../DataBadge.jsx';

const SENTIMENT_COLOR = {
  positive: 'text-virus-safe bg-virus-safe/10 border-virus-safe/30',
  negative: 'text-virus-red bg-virus-red/10 border-virus-red/30',
  neutral: 'text-financial-muted bg-financial-slate/10 border-financial-slate/30',
};

export default function SentimentPanel({ data }) {
  if (!data?.articles?.length) return <div className="text-financial-muted text-sm">No news data.</div>;

  const { articles, sentimentSummary, totalResults } = data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs uppercase tracking-[0.2em] text-financial-muted">News & Sentiment</h3>
        <DataBadge variant="real" source="NewsAPI" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SentimentBar label="Positive" pct={sentimentSummary.positivePct} color="#06d6a0" />
        <SentimentBar label="Neutral" pct={sentimentSummary.neutralPct} color="#c0c0c0" />
        <SentimentBar label="Negative" pct={sentimentSummary.negativePct} color="#e63946" />
      </div>

      <div className="text-[11px] text-financial-muted">
        Showing {articles.length} of {totalResults?.toLocaleString() || '—'} matching articles · sentiment scored locally via keyword heuristic
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {articles.map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-financial-navy rounded-lg p-4 hairline hover:border-financial-gold/40 transition flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${SENTIMENT_COLOR[a.sentiment]}`}>
                {a.sentiment}
              </span>
              <span className="text-[10px] text-financial-muted">{a.source}</span>
              <span className="text-[10px] text-financial-muted ml-auto">{fmtRelative(a.publishedAt)}</span>
            </div>
            <h4 className="text-sm text-financial-text leading-snug group-hover:text-financial-gold transition mb-1">
              {a.title}
            </h4>
            <p className="text-xs text-financial-muted line-clamp-3 flex-1">{a.excerpt}</p>
            <div className="text-[10px] text-financial-gold mt-2 flex items-center gap-1">
              Read source <ExternalLink className="w-3 h-3" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function SentimentBar({ label, pct, color }) {
  return (
    <div className="bg-financial-navy rounded-lg p-4 hairline">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-financial-muted">{label}</span>
        <span className="tabular text-lg" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-financial-card rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
