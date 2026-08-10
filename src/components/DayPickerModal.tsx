import { useState } from 'react';
import type { Activity, TripState } from '../types';
import { computeDay, formatDuration } from '../lib/geo';
import { useTrip } from '../state';
import { Gauge } from './Gauge';
import { DAY_COLORS } from '../dayColors';

interface Props {
  trip: TripState;
  activity: Activity;
  onDone: (addedDayId: string | null) => void;
}

// Modale de choix du jour (CDC §7) : jauges par jour + avertissement de
// surcharge bloquant si l'ajout fait dépasser 100 % du budget.
export function DayPickerModal({ trip, activity, onDone }: Props) {
  const { update } = useTrip();
  const [confirmDayId, setConfirmDayId] = useState<string | null>(null);

  const addTo = (dayId: string) => {
    update((t) => ({
      ...t,
      activities: { ...t.activities, [activity.id]: activity },
      days: t.days.map((d) =>
        d.id === dayId ? { ...d, itemIds: [...d.itemIds, activity.id] } : d
      ),
    }));
    onDone(dayId);
  };

  const pick = (dayId: string) => {
    const day = trip.days.find((d) => d.id === dayId)!;
    // Projection grossière : total actuel + durée de l'activité (la marche
    // supplémentaire sera recalculée après ajout).
    const c = computeDay(trip, day);
    const projected = ((c.totalMin + activity.durationMin) / day.budgetMin) * 100;
    if (projected > 100) setConfirmDayId(dayId);
    else addTo(dayId);
  };

  const confirmDay = confirmDayId ? trip.days.find((d) => d.id === confirmDayId) : null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60"
      onClick={() => onDone(null)}>
      <div className="glass rounded-2xl p-4 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {!confirmDay ? (
          <>
            <h3 className="font-semibold mb-1">Ajouter « {activity.title} »</h3>
            <p className="text-xs text-white/50 mb-3">{formatDuration(activity.durationMin)} sur place — choisis le jour :</p>
            <div className="space-y-2">
              {trip.days.map((day, i) => {
                const c = computeDay(trip, day);
                return (
                  <button key={day.id} onClick={() => pick(day.id)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: DAY_COLORS[i % DAY_COLORS.length] }} className="font-medium">
                        {day.label}
                      </span>
                      <span className="text-white/50 text-xs">
                        {formatDuration(c.totalMin)} / {formatDuration(day.budgetMin)}
                      </span>
                    </div>
                    <Gauge pct={c.budgetPct} className="mt-1.5" />
                  </button>
                );
              })}
            </div>
            <button onClick={() => onDone(null)}
              className="mt-3 text-xs text-white/50 hover:text-white">Annuler</button>
          </>
        ) : (
          <>
            <h3 className="font-semibold mb-2 text-amber-300">⚠️ Journée surchargée</h3>
            <p className="text-sm text-white/80 mb-4">
              {confirmDay.label} est déjà à{' '}
              {formatDuration(computeDay(trip, confirmDay).totalMin)} /{' '}
              {formatDuration(confirmDay.budgetMin)}. Ajouter quand même ?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDayId(null)}
                className="text-sm px-3 py-1.5 rounded hover:bg-white/10">Annuler</button>
              <button onClick={() => addTo(confirmDay.id)}
                className="text-sm px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-medium">
                Confirmer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
