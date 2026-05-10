import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { fmtNum } from '../../utils/format.js';

const tooltipStyle = {
  background: '#0a0e27',
  border: '1px solid rgba(192,192,192,0.15)',
  borderRadius: 6,
  fontSize: 12,
};

export default function EpidemiologyPanel({ countries, totals }) {
  const top10 = [...countries].sort((a, b) => b.cases - a.cases).slice(0, 10);
  const perCapita = [...countries].sort((a, b) => b.casesPer100k - a.casesPer100k).slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Block title="Top 10 by Total Cases" subtitle="Absolute case counts (current snapshot)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top10} layout="vertical" margin={{ left: 20, right: 16 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#4a5568" opacity={0.25} />
            <XAxis type="number" tick={{ fill: '#a0aec0', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#a0aec0', fontSize: 11 }} width={100} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtNum(v)} />
            <Bar dataKey="cases" radius={[0, 4, 4, 0]}>
              {top10.map((c, i) => (
                <Cell key={i} fill={c.trend7day > 0 ? '#e63946' : c.trend7day < 0 ? '#06d6a0' : '#d4af37'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Block>

      <Block title="Top 10 by Cases per 100k" subtitle="Normalized for population (fairer comparison)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={perCapita} layout="vertical" margin={{ left: 20, right: 16 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#4a5568" opacity={0.25} />
            <XAxis type="number" tick={{ fill: '#a0aec0', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#a0aec0', fontSize: 11 }} width={100} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="casesPer100k" fill="#d4af37" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Block>

      <Block title="Mortality Rate by Country" subtitle="Deaths / cases ratio" full>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {countries.map((c) => {
            const rate = c.cases ? ((c.deaths / c.cases) * 100).toFixed(1) : '—';
            return (
              <div key={c.code} className="bg-financial-navy rounded-md p-3 hairline">
                <div className="flex items-center justify-between">
                  <span className="text-financial-muted">{c.name}</span>
                  <span className="tabular text-virus-red">{rate}%</span>
                </div>
                <div className="text-[10px] text-financial-muted mt-1">
                  {fmtNum(c.deaths)} / {fmtNum(c.cases)}
                </div>
              </div>
            );
          })}
        </div>
      </Block>

      <Block title="Global Summary" subtitle="Snapshot totals" full>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Total Cases" value={fmtNum(totals?.cases)} accent="text-financial-text" />
          <Stat label="Total Deaths" value={fmtNum(totals?.deaths)} accent="text-virus-red" />
          <Stat label="New (24h)" value={fmtNum(totals?.newCases)} accent="text-financial-gold" />
          <Stat label="Mortality" value={`${totals?.mortalityRate ?? '—'}%`} accent="text-virus-orange" />
        </div>
      </Block>
    </div>
  );
}

function Block({ title, subtitle, children, full }) {
  return (
    <div className={`${full ? 'lg:col-span-2' : ''} bg-financial-navy rounded-lg p-4 hairline`}>
      <div className="mb-3">
        <h3 className="text-sm text-financial-text">{title}</h3>
        {subtitle && <p className="text-[11px] text-financial-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-financial-card rounded-md p-3 hairline">
      <div className="text-[10px] uppercase tracking-wider text-financial-muted">{label}</div>
      <div className={`tabular text-xl ${accent}`}>{value}</div>
    </div>
  );
}
