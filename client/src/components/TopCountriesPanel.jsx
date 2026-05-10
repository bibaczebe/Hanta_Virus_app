import { fmtNum } from '../utils/format.js';
import CountryFlag from './CountryFlag.jsx';

const STATUS_LEVELS = [
  { min: 0.75, label: 'Outbreak', color: '#e63946' },
  { min: 0.5, label: 'Spreading', color: '#ff8c00' },
  { min: 0.25, label: 'Slowing', color: '#ffd60a' },
  { min: 0, label: 'Controlled', color: '#00b4d8' },
];

function severityFromCountry(c) {
  const base = (c.spreadRate ?? 0.4) * 0.5 + (1 - (c.controlIndex ?? 0.7)) * 0.4;
  const trend = Math.max(-1, Math.min(1, (c.trend7day ?? 0) / 30));
  return Math.max(0, Math.min(1, base + trend * 0.1));
}

function statusFor(country) {
  const severity = severityFromCountry(country);
  return STATUS_LEVELS.find((s) => severity >= s.min) ?? STATUS_LEVELS[STATUS_LEVELS.length - 1];
}

export default function TopCountriesPanel({ countries = [], selected, onSelect }) {
  const top5 = [...countries].sort((a, b) => b.cases - a.cases).slice(0, 5);
  if (!top5.length) return null;
  const selectedCode = selected?.code ?? null;

  return (
    <section className="bg-financial-card rounded-lg hairline overflow-hidden">
      <header className="px-4 py-2 border-b border-financial-slate/20 flex items-center justify-between gap-3">
        <h3 className="text-xs uppercase tracking-[0.2em] text-financial-muted">
          Top 5 Active Outbreaks
        </h3>
        <span className="text-[10px] text-financial-muted hidden sm:block">
          Click to filter dashboard + rotate globe
        </span>
      </header>
      <ul className="divide-y divide-financial-slate/15">
        {top5.map((c) => {
          const status = statusFor(c);
          const isSelected = selectedCode === c.code;
          const delta = c.newCases ?? 0;
          const deltaColor =
            delta > 0 ? 'text-virus-red' : delta < 0 ? 'text-virus-safe' : 'text-financial-muted';
          return (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => onSelect?.(c)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                  isSelected ? 'bg-financial-gold/5' : 'hover:bg-financial-slate/10'
                }`}
              >
                <CountryFlag code={c.code} name={c.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium truncate ${
                      isSelected ? 'text-financial-gold' : 'text-financial-text'
                    }`}
                  >
                    {c.name}
                  </div>
                  <div className="text-[11px] text-financial-muted flex items-center gap-1.5">
                    <span
                      style={{ background: status.color }}
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                    />
                    {status.label}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="tabular text-sm text-financial-text">{fmtNum(c.cases)}</div>
                  <div className={`text-[11px] tabular ${deltaColor}`}>
                    {delta > 0 ? '+' : ''}
                    {delta} (24h)
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
