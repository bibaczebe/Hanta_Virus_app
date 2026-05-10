import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { fmtNum } from '../../utils/format.js';
import DataBadge from '../DataBadge.jsx';
import CountryFlag from '../CountryFlag.jsx';

function makeCountryTick(rows) {
  return function CountryTick({ x, y, payload }) {
    const row = rows.find((r) => r.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        {row && (
          <image
            href={`https://flagcdn.com/${row.code.toLowerCase()}.svg`}
            x={-118}
            y={-8}
            width={18}
            height={13}
            preserveAspectRatio="xMidYMid slice"
          />
        )}
        <text x={-94} y={4} textAnchor="start" fill="#a0aec0" fontSize="11">
          {payload.value}
        </text>
      </g>
    );
  };
}

const barColor = (c, selectedCode) => {
  if (selectedCode && c.code !== selectedCode) return '#4a556880';
  if (c.trend7day > 0) return '#e63946';
  if (c.trend7day < 0) return '#06d6a0';
  return '#d4af37';
};

const cardClasses = (isSelected) =>
  `bg-financial-navy rounded-md p-3 hairline transition text-left w-full ${
    isSelected
      ? 'border-financial-gold/60 ring-1 ring-financial-gold/40'
      : 'hover:border-financial-gold/30'
  }`;

export default function EpidemiologyPanel({ countries, totals, selected, onSelect }) {
  const selectedCode = selected?.code ?? null;
  const top10 = [...countries].sort((a, b) => b.cases - a.cases).slice(0, 10);
  const perCapita = [...countries].sort((a, b) => b.casesPer100k - a.casesPer100k).slice(0, 10);

  const summary = selected
    ? {
        cases: selected.cases,
        deaths: selected.deaths,
        newCases: selected.newCases,
        mortalityRate: selected.cases
          ? Number(((selected.deaths / selected.cases) * 100).toFixed(2))
          : null,
        label: selected.name,
      }
    : {
        cases: totals?.cases,
        deaths: totals?.deaths,
        newCases: totals?.newCases,
        mortalityRate: totals?.mortalityRate ?? null,
        label: 'Global',
      };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Block title="Top 10 by Total Cases" subtitle="Absolute case counts (current snapshot) · click a bar to filter" badge="demo">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top10} layout="vertical" margin={{ left: 30, right: 16 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#4a5568" opacity={0.25} />
            <XAxis type="number" tick={{ fill: '#a0aec0', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={makeCountryTick(top10)} width={130} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtNum(v)} />
            <Bar
              dataKey="cases"
              radius={[0, 4, 4, 0]}
              cursor={onSelect ? 'pointer' : undefined}
              onClick={(d) => onSelect?.(d.payload ?? d)}
            >
              {top10.map((c, i) => (
                <Cell key={i} fill={barColor(c, selectedCode)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Block>

      <Block title="Top 10 by Cases per 100k" subtitle="Normalized for population (fairer comparison) · click a bar to filter" badge="demo">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={perCapita} layout="vertical" margin={{ left: 30, right: 16 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#4a5568" opacity={0.25} />
            <XAxis type="number" tick={{ fill: '#a0aec0', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={makeCountryTick(perCapita)} width={130} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="casesPer100k"
              radius={[0, 4, 4, 0]}
              cursor={onSelect ? 'pointer' : undefined}
              onClick={(d) => onSelect?.(d.payload ?? d)}
            >
              {perCapita.map((c, i) => (
                <Cell
                  key={i}
                  fill={selectedCode && c.code !== selectedCode ? '#4a556880' : '#d4af37'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Block>

      <Block title="Mortality Rate by Country" subtitle="Deaths / cases ratio · click a card to filter" badge="demo" full>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {countries.map((c) => {
            const rate = c.cases ? ((c.deaths / c.cases) * 100).toFixed(1) : '—';
            const isSelected = c.code === selectedCode;
            const Tag = onSelect ? 'button' : 'div';
            return (
              <Tag
                key={c.code}
                type={onSelect ? 'button' : undefined}
                onClick={onSelect ? () => onSelect(c) : undefined}
                className={cardClasses(isSelected)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CountryFlag code={c.code} name={c.name} size="sm" />
                    <span className={`truncate ${isSelected ? 'text-financial-gold' : 'text-financial-muted'}`}>{c.name}</span>
                  </div>
                  <span className="tabular text-virus-red shrink-0">{rate}%</span>
                </div>
                <div className="text-[10px] text-financial-muted mt-1">
                  {fmtNum(c.deaths)} / {fmtNum(c.cases)}
                </div>
              </Tag>
            );
          })}
        </div>
      </Block>

      <Block
        title={`${summary.label} Summary`}
        subtitle={selected ? `Snapshot totals — country filter active` : 'Snapshot totals'}
        badge="demo"
        full
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Total Cases" value={fmtNum(summary.cases)} accent="text-financial-text" />
          <Stat label="Total Deaths" value={fmtNum(summary.deaths)} accent="text-virus-red" />
          <Stat label="New (24h)" value={fmtNum(summary.newCases)} accent="text-financial-gold" />
          <Stat
            label="Mortality"
            value={summary.mortalityRate !== null && summary.mortalityRate !== undefined ? `${summary.mortalityRate}%` : '—'}
            accent="text-virus-orange"
          />
        </div>
      </Block>
    </div>
  );
}

function Block({ title, subtitle, children, full, badge }) {
  return (
    <div className={`${full ? 'lg:col-span-2' : ''} relative bg-financial-navy rounded-lg p-4 hairline`}>
      {badge && (
        <div className="absolute top-3 right-3">
          <DataBadge variant={badge} />
        </div>
      )}
      <div className="mb-3 pr-16">
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
