import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  accent?: 'signal' | 'amber' | 'danger';
}

export function KpiCard({ label, value, change, positive = true, accent = 'signal' }: KpiCardProps) {
  const accentMap = {
    signal: 'from-signal/20 to-signal/5 text-signal',
    amber: 'from-amber/20 to-amber/5 text-amber',
    danger: 'from-danger/20 to-danger/5 text-danger'
  };

  return (
    <div className={`rounded-[24px] border border-white/10 bg-gradient-to-br p-5 shadow-panel ${accentMap[accent]}`}>
      <p className="text-sm text-mist/65">{label}</p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-white">{value}</p>
          <div className={`mt-3 inline-flex items-center gap-1 text-sm ${positive ? 'text-signal' : 'text-danger'}`}>
            {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change}
          </div>
        </div>
      </div>
    </div>
  );
}
