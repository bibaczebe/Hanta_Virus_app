import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { fetchCountry } from '../../api.js';
import { fmtNum } from '../../utils/format.js';

const COLORS = ['#d4af37', '#06d6a0', '#00b4d8', '#ff8c00', '#e63946'];
const tooltipStyle = {
  background: '#0a0e27',
  border: '1px solid rgba(192,192,192,0.15)',
  borderRadius: 6,
  fontSize: 12,
};

export default function DemographicsPanel({ countries, selected }) {
  const target = selected || countries[0];
  const { data, isLoading } = useQuery({
    queryKey: ['country', target?.code],
    queryFn: () => fetchCountry(target.code),
    enabled: Boolean(target?.code),
  });

  if (!target) return <div className="text-financial-muted text-sm">No data.</div>;
  if (isLoading) return <div className="text-financial-muted text-sm">Loading {target.name}...</div>;
  if (!data) return <div className="text-financial-muted text-sm">No detail available.</div>;

  const { demographics, timeline } = data;

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="font-display text-lg text-financial-text">{data.name}</h3>
          <p className="text-xs text-financial-muted">
            {fmtNum(data.cases)} cases · {fmtNum(data.deaths)} deaths · {data.casesPer100k} per 100k
          </p>
        </div>
        <span className="text-[10px] text-financial-muted">
          {selected ? 'Drill-down view' : 'Default view (top affected)'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Block title="Age Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demographics.ageGroups}>
              <CartesianGrid strokeDasharray="2 4" stroke="#4a5568" opacity={0.25} />
              <XAxis dataKey="range" tick={{ fill: '#a0aec0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#a0aec0', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Bar dataKey="pct" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Block>

        <Block title="Gender Split">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Male', value: demographics.gender.male },
                  { name: 'Female', value: demographics.gender.female },
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
              >
                <Cell fill="#00b4d8" />
                <Cell fill="#d4af37" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Block>

        <Block title="Occupation Risk">
          <div className="space-y-2 mt-2">
            {demographics.occupations.map((o, i) => (
              <div key={o.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-financial-muted">{o.label}</span>
                  <span className="tabular text-financial-text">{o.pct}%</span>
                </div>
                <div className="h-1.5 bg-financial-navy rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <Block title="30-Day Case Timeline">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="2 4" stroke="#4a5568" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fill: '#a0aec0', fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: '#a0aec0', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="cases" stroke="#d4af37" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="deaths" stroke="#e63946" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Block>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="bg-financial-navy rounded-lg p-4 hairline">
      <h4 className="text-sm text-financial-text mb-2">{title}</h4>
      {children}
    </div>
  );
}
