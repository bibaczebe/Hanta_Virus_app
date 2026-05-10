import { fmtNum } from '../utils/format.js';

const defaultValueFormatter = (value) => {
  if (typeof value !== 'number') return value;
  return fmtNum(value);
};

const percentFormatter = (value) => {
  if (typeof value !== 'number') return value;
  return `${value.toFixed(1)}%`;
};

export const tooltipFormatters = {
  number: defaultValueFormatter,
  percent: percentFormatter,
};

export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  unit,
}) {
  if (!active || !payload?.length) return null;
  const formatValue = valueFormatter ?? defaultValueFormatter;

  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-3 text-sm font-sans min-w-[160px]">
      {label !== undefined && label !== null && label !== '' && (
        <div className="text-financial-muted text-xs mb-1.5 font-medium uppercase tracking-wider">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              style={{ background: p.color || p.fill }}
              className="w-2 h-2 rounded-full shrink-0"
            />
            {p.name && <span className="text-financial-muted text-xs">{p.name}</span>}
            <span className="tabular text-financial-text font-semibold ml-auto">
              {formatValue(p.value, p)}
              {unit ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
