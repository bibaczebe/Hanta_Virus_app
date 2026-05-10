import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Layout from '../components/Layout.jsx';

const REAL_SOURCES = [
  {
    name: 'Biotech & pharma equities',
    api: 'Alpha Vantage',
    fields: 'price, daily change, volume, last trade timestamp, gainers/losers split',
    cadence: 'Cached 4h server-side; free tier capped at 25 requests/day',
    notes:
      'Used for the Stocks tab and the Biotech Trend / Tracked Markets KPIs in Overview. External chart links open TradingView. Not investment advice.',
  },
  {
    name: 'News articles & sentiment',
    api: 'NewsAPI.org',
    fields: 'article title, excerpt, source, publishedAt, URL — sentiment scored locally via keyword heuristic',
    cadence: 'Cached 1h server-side; free tier capped at 100 requests/day',
    notes:
      'Used for the News & Sentiment tab and the News Sentiment KPI. The positive/neutral/negative split is computed from a small keyword list, not a trained classifier — treat the magnitudes directionally, not absolutely.',
  },
];

const DEMO_SECTIONS = [
  'Header KPIs: Total Cases, Total Deaths, New (24h)',
  'Overview cards: Total Cases, Total Deaths, Most Affected',
  'Live Spread Map (globe markers, particle swarms, severity colours)',
  'Top 10 by Total Cases / by Cases per 100k charts',
  'Mortality Rate by Country grid',
  'Demographics tab: age groups, gender split, occupation risk, 30-day timeline',
  'Global Summary block (snapshot totals)',
];

const ROADMAP = [
  {
    when: 'Sprint S5 (next epi-source)',
    what: 'Argentina Boletín Epidemiológico Nacional (BEN)',
    detail:
      'Weekly PDF parser (cron Mondays 10:00 UTC) → per-province cases / deaths / acumulado año. First REAL epidemiological feed; Argentina chosen because the current Andes hantavirus outbreak is the highest-news-value region.',
    status: 'In progress',
  },
  {
    when: 'Sprint S6+',
    what: 'WHO Disease Outbreak News',
    detail:
      'Global outbreak alerts (HFRS in Eurasia, HPS in the Americas). Replaces the Live Spread Map mock once parser is validated against historical bulletins.',
    status: 'Planned',
  },
  {
    when: 'Sprint S6+',
    what: 'CDC HantaCases (US) & PAHO PLISA (Americas)',
    detail:
      'Per-state and per-country case counts. Will retire DEMO badges from US, Chile, Brazil, Bolivia, Paraguay, Panama mortality cards.',
    status: 'Planned',
  },
  {
    when: 'Sprint S6+',
    what: 'European ECDC Atlas (HFRS)',
    detail:
      'Annual surveillance for Finland, Russia, Germany, Sweden, Poland. Lower update frequency; will read from ECDC Atlas API.',
    status: 'Planned',
  },
];

export default function MethodologyPage() {
  return (
    <Layout>
      <main className="max-w-screen-md mx-auto px-6 py-8 space-y-10 text-sm leading-relaxed text-financial-text">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-financial-muted hover:text-financial-gold transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </Link>
          <h1 className="font-display text-3xl text-financial-text">Methodology &amp; Data Sources</h1>
          <p className="text-financial-muted text-sm mt-2">
            What this dashboard shows, where each number comes from, and what is still mock pending real-source integration.
          </p>
        </div>

        <section className="space-y-3">
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-300/30 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="font-display text-lg text-amber-100">Important: epidemiological data is illustrative</h2>
              <p className="text-amber-100/90">
                A real hantavirus outbreak is currently active in parts of South America. Case counts, mortality rates,
                demographics, and trend lines shown on the dashboard are <strong>placeholder figures</strong> generated to
                evaluate visual layout — they are <em>not</em> a real-world surveillance feed and must not be used for
                clinical, public-health, business, or investment decisions.
              </p>
              <p className="text-amber-100/80 text-xs">
                Mock data is sourced from <code className="font-mono">server/data/mockGlobe.js</code> and tagged
                <code className="font-mono"> source: "mock"</code> in the API response.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-financial-text flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            Live data sources
          </h2>
          <p className="text-financial-muted">
            These integrations call real APIs. Their values are also marked with a green <strong>REAL</strong> badge in the UI.
          </p>
          <div className="space-y-3">
            {REAL_SOURCES.map((s) => (
              <article key={s.name} className="bg-financial-card rounded-lg p-4 hairline">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-base text-financial-text">{s.name}</h3>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-300">{s.api}</span>
                </div>
                <dl className="mt-3 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-xs">
                  <dt className="text-financial-muted">Fields</dt>
                  <dd className="text-financial-text">{s.fields}</dd>
                  <dt className="text-financial-muted">Cadence</dt>
                  <dd className="text-financial-text">{s.cadence}</dd>
                  <dt className="text-financial-muted">Notes</dt>
                  <dd className="text-financial-text">{s.notes}</dd>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-financial-text flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            Sections currently using DEMO data
          </h2>
          <p className="text-financial-muted">Every section listed below is tagged with an amber <strong>DEMO</strong> badge in the UI.</p>
          <ul className="space-y-2">
            {DEMO_SECTIONS.map((d) => (
              <li key={d} className="flex items-start gap-2 text-financial-text">
                <span className="text-amber-300 mt-1">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-financial-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-financial-gold" />
            Planned real-source integrations
          </h2>
          <p className="text-financial-muted">
            Each item below replaces a DEMO section with live data. As parsers ship, the corresponding badges will flip from amber to emerald.
          </p>
          <div className="space-y-3">
            {ROADMAP.map((r) => (
              <article key={r.what} className="bg-financial-card rounded-lg p-4 hairline">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-base text-financial-text">{r.what}</h3>
                  <span className="text-[11px] uppercase tracking-wider text-financial-gold">{r.status}</span>
                </div>
                <p className="text-[11px] text-financial-muted mt-1">{r.when}</p>
                <p className="text-financial-text mt-2 text-sm">{r.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-2 text-xs text-financial-muted border-t border-financial-slate/20 pt-6">
          <p>
            <strong className="text-financial-text">Versioning.</strong> This page reflects the data wiring in the current build. The <code className="font-mono">v0.2.0-dev</code> footer
            label indicates the demo + paid-news/stocks tier; epidemiological feeds are added incrementally in subsequent sprints (S5 onward).
          </p>
          <p>
            <strong className="text-financial-text">Caching.</strong> Globe payloads are cached server-side for 6 hours; stock summaries 4 hours; news headlines 1 hour. The client refetches automatically — no Refresh button.
          </p>
          <p>
            <strong className="text-financial-text">Reporting issues.</strong> If a data source returns an unexpected value or the DEMO/REAL labelling looks wrong, please report it before drawing conclusions from the dashboard.
          </p>
        </section>
      </main>
    </Layout>
  );
}
