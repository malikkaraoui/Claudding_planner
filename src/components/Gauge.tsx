import { gaugeColor } from '../lib/geo';

export function Gauge({ pct, className = '' }: { pct: number; className?: string }) {
  const color = gaugeColor(pct);
  return (
    <div className={`h-1.5 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}
