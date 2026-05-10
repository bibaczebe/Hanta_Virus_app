import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const STYLES = {
  demo: 'bg-amber-500/15 border-amber-400/40 text-amber-200',
  real: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200',
};

export default function DataBadge({ variant = 'demo', source, title }) {
  const cls = STYLES[variant] ?? STYLES.demo;
  const Icon = variant === 'real' ? CheckCircle2 : AlertTriangle;
  const label = variant === 'real' ? (source ? `Real · ${source}` : 'Real') : 'Demo';
  const tooltip =
    title ??
    (variant === 'real'
      ? `Live data from ${source ?? 'an external API'}`
      : 'Illustrative / placeholder data — not a real-world measurement');

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider border ${cls}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
