export const fmtNum = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US').format(n);
};

export const fmtPct = (n, digits = 2) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
};

export const fmtCurrency = (n, ccy = 'USD') => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(n);
};

export const fmtRelative = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

// Sentiment trend → severity color (red is worse for cases)
export const severityColor = (rate) => {
  if (rate >= 0.75) return '#e63946'; // red
  if (rate >= 0.5) return '#ff8c00'; // orange
  if (rate >= 0.25) return '#ffd60a'; // yellow
  return '#06d6a0'; // green
};

export const trendArrow = (n) => (n > 0 ? '↑' : n < 0 ? '↓' : '→');
export const trendColor = (n, invert = false) => {
  if (n === 0) return 'text-financial-muted';
  const negative = invert ? n > 0 : n < 0;
  return negative ? 'text-virus-red' : 'text-virus-safe';
};
