import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-amber-500/15 border-b border-amber-300/40 backdrop-blur">
      <div className="max-w-screen-2xl mx-auto px-6 py-1.5 flex items-start gap-2 text-[11px] leading-snug text-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px text-amber-300" />
        <p className="flex-1">
          <strong className="font-semibold text-amber-100">Epidemiological data shown is DEMO / illustrative.</strong>{' '}
          Not for clinical, business, or investment decisions. News and biotech market data are real.{' '}
          <a href="/methodology" className="underline decoration-amber-300/60 hover:text-amber-100 hover:decoration-amber-100">
            Read methodology →
          </a>
        </p>
      </div>
    </div>
  );
}
