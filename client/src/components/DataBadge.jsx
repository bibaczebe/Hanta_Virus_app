import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const STYLES = {
  demo: 'bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/25 hover:border-amber-300',
  real: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200',
};

export default function DataBadge({ variant = 'demo', source, title }) {
  const cls = STYLES[variant] ?? STYLES.demo;
  const Icon = variant === 'real' ? CheckCircle2 : AlertTriangle;
  const tooltip =
    title ??
    (variant === 'real'
      ? `Live data from ${source ?? 'an external API'}`
      : 'Illustrative / placeholder data — click for methodology');

  const baseCls = `inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider border transition ${cls}`;
  const labelInner = (
    <>
      <Icon className="w-2.5 h-2.5" />
      {variant === 'real' ? (
        <>
          Real
          {source && <span className="hidden md:inline ml-1">· {source}</span>}
        </>
      ) : (
        'Demo'
      )}
    </>
  );

  if (variant === 'demo') {
    return (
      <Link to="/methodology" title={tooltip} className={baseCls}>
        {labelInner}
      </Link>
    );
  }

  return (
    <span title={tooltip} className={baseCls}>
      {labelInner}
    </span>
  );
}
