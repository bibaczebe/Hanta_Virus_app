import { TrendingUp, TrendingDown, ExternalLink, AlertCircle } from 'lucide-react';
import { fmtCurrency, fmtNum, fmtPct, trendColor } from '../../utils/format.js';

export default function StocksPanel({ data }) {
  if (!data?.stocks?.length) return <div className="text-financial-muted text-sm">No stock data.</div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard label="Avg Change" value={data.summary.avgChangePercent !== null ? fmtPct(data.summary.avgChangePercent) : '—'}
          accent={data.summary.avgChangePercent >= 0 ? 'text-virus-safe' : 'text-virus-red'} />
        <SummaryCard label="Gainers" value={data.summary.gainers} accent="text-virus-safe" />
        <SummaryCard label="Losers" value={data.summary.losers} accent="text-virus-red" />
      </div>

      <div className="bg-financial-navy rounded-lg hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-financial-muted">
            <tr className="border-b border-financial-slate/30">
              <th className="text-left p-3">Ticker</th>
              <th className="text-left p-3">Name</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Change</th>
              <th className="text-right p-3">Change %</th>
              <th className="text-right p-3">Volume</th>
              <th className="text-right p-3">Last</th>
              <th className="text-right p-3">Trade</th>
            </tr>
          </thead>
          <tbody>
            {data.stocks.map((s) => (
              <tr key={s.ticker} className="border-b border-financial-slate/15 hover:bg-financial-card/50 transition">
                <td className="p-3 tabular text-financial-gold">{s.ticker}</td>
                <td className="p-3 text-financial-text">{s.name}</td>
                {s.price === null ? (
                  <>
                    <td colSpan={5} className="p-3 text-xs text-financial-muted">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-virus-orange" />
                        Rate-limited or unavailable — refreshes on next cycle
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-right tabular">{fmtCurrency(s.price)}</td>
                    <td className={`p-3 text-right tabular ${trendColor(s.change)}`}>
                      {s.change > 0 ? '+' : ''}{s.change?.toFixed(2)}
                    </td>
                    <td className={`p-3 text-right tabular ${trendColor(s.changePercent)} flex items-center justify-end gap-1`}>
                      {s.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {fmtPct(s.changePercent)}
                    </td>
                    <td className="p-3 text-right tabular text-financial-muted">{fmtNum(s.volume)}</td>
                    <td className="p-3 text-right text-xs text-financial-muted">{s.lastUpdate}</td>
                  </>
                )}
                <td className="p-3 text-right">
                  <a
                    href={`https://www.tradingview.com/symbols/${s.ticker}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-financial-gold hover:underline"
                  >
                    Chart <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-financial-muted">
        Data: Alpha Vantage (free tier, 25 req/day cap). Cached 4h. External chart links open TradingView.
        Not investment advice — educational use only.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="bg-financial-navy rounded-lg p-4 hairline">
      <div className="text-[10px] uppercase tracking-wider text-financial-muted">{label}</div>
      <div className={`tabular text-2xl mt-1 ${accent}`}>{value}</div>
    </div>
  );
}
