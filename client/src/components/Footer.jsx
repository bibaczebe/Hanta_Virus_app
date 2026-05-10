import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="max-w-screen-2xl mx-auto px-6 py-6 border-t border-financial-slate/20 text-[11px] text-financial-muted">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="space-y-1 max-w-3xl">
          <p>
            <strong className="text-financial-text">© 2026 HantaTracker.</strong> Educational use only. Not medical, clinical, or investment advice.
          </p>
          <p>
            Epidemiological case counts, demographics, mortality rates, and per-country trends are{' '}
            <span className="text-amber-200">DEMO data</span> generated for layout review. Stocks (Alpha Vantage) and news + sentiment (NewsAPI.org) are{' '}
            <span className="text-emerald-200">live</span>. Real epidemiological feeds (WHO, CDC, PAHO, Argentina BEN) are being integrated — see{' '}
            <Link to="/methodology" className="underline decoration-financial-slate hover:text-financial-text">methodology</Link>.
          </p>
        </div>
        <span className="font-mono shrink-0">v0.2.0-dev</span>
      </div>
    </footer>
  );
}
