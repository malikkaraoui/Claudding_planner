import { useTrip } from '../state';
import { computeDay } from '../lib/geo';
import { Gauge } from './Gauge';
import { DAY_COLORS } from '../dayColors';

interface Props {
  activeDayId: string;
  onSelectDay: (id: string) => void;
  onAddDay: () => void;
}

export function TopBar({ activeDayId, onSelectDay, onAddDay }: Props) {
  const { trip } = useTrip();
  if (!trip) return null;

  return (
    <header className="glass flex items-center justify-between px-4 py-2 z-[1000] relative">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold tracking-tight">{trip.title}</h1>
        <span className="text-xs text-white/50">
          {trip.hotel.title} · fuseau {trip.settings.timezone}
        </span>
      </div>
      <nav className="flex items-center gap-2">
        {trip.days.map((day, i) => {
          const c = computeDay(trip, day);
          const accent = DAY_COLORS[i % DAY_COLORS.length];
          const active = day.id === activeDayId;
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                active
                  ? 'border-white/30 bg-white/10'
                  : 'border-transparent hover:bg-white/5 text-white/70'
              }`}
              style={active ? { boxShadow: `inset 0 -2px 0 ${accent}` } : undefined}
            >
              <span className="font-medium" style={{ color: active ? accent : undefined }}>
                {day.label}
              </span>
              <Gauge pct={c.budgetPct} className="mt-1 w-16" />
            </button>
          );
        })}
        <button
          onClick={onAddDay}
          title="Ajouter un jour"
          className="px-2.5 py-1.5 rounded-lg text-white/60 hover:bg-white/10 border border-white/10 text-sm"
        >
          +
        </button>
      </nav>
    </header>
  );
}
