import { useState } from 'react';
import { Activity, PieChart, LineChart, Newspaper } from 'lucide-react';
import EpidemiologyPanel from './panels/EpidemiologyPanel.jsx';
import DemographicsPanel from './panels/DemographicsPanel.jsx';
import StocksPanel from './panels/StocksPanel.jsx';
import SentimentPanel from './panels/SentimentPanel.jsx';

const TABS = [
  { id: 'epi', label: 'Epidemiology', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'demo', label: 'Demographics', icon: <PieChart className="w-3.5 h-3.5" /> },
  { id: 'stocks', label: 'Stocks', icon: <LineChart className="w-3.5 h-3.5" /> },
  { id: 'sentiment', label: 'News & Sentiment', icon: <Newspaper className="w-3.5 h-3.5" /> },
];

export default function AnalyticsTabs({ globe, stocks, news, selected }) {
  const [active, setActive] = useState('epi');

  return (
    <section className="max-w-screen-2xl mx-auto px-6 pt-8 pb-12">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.25em] text-financial-muted">Analytics</h2>
        {selected && (
          <span className="text-xs text-financial-gold">Filtered: {selected.name}</span>
        )}
      </div>
      <div className="bg-financial-card rounded-xl hairline shadow-card overflow-hidden">
        <div className="flex items-center gap-1 border-b border-financial-slate/30 px-3 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              role="tab"
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-t-md transition ${
                active === t.id
                  ? 'bg-financial-navy text-financial-gold border-t border-l border-r border-financial-gold/30'
                  : 'text-financial-muted hover:text-financial-text'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {active === 'epi' && <EpidemiologyPanel countries={globe?.countries || []} totals={globe?.totals} />}
          {active === 'demo' && <DemographicsPanel countries={globe?.countries || []} selected={selected} />}
          {active === 'stocks' && <StocksPanel data={stocks} />}
          {active === 'sentiment' && <SentimentPanel data={news} />}
        </div>
      </div>
    </section>
  );
}
