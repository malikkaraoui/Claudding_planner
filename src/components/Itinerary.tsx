import { useState } from 'react';
import type { DayPlan, TripState } from '../types';
import { computeDay, formatDuration, formatHM, gaugeColor } from '../lib/geo';
import { useTrip } from '../state';
import { defaultAssignment } from '../seed';
import { Gauge } from './Gauge';
import { DayEditor } from './DayEditor';

export function Itinerary({ trip, day, accent }: { trip: TripState; day: DayPlan; accent: string }) {
  const { update } = useTrip();
  const [editing, setEditing] = useState(false);
  const c = computeDay(trip, day);
  const items = day.itemIds.map((id) => trip.activities[id]).filter(Boolean);

  const setItems = (itemIds: string[]) =>
    update((t) => ({
      ...t,
      days: t.days.map((d) => (d.id === day.id ? { ...d, itemIds } : d)),
    }));

  const move = (i: number, dir: -1 | 1) => {
    const ids = [...day.itemIds];
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setItems(ids);
  };

  const restore = () => {
    const def = defaultAssignment[day.id];
    if (def) setItems([...def]);
  };

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold" style={{ color: accent }}>
          Itinéraire — {day.label}
        </h2>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs text-white/60 hover:text-white px-2 py-1 rounded hover:bg-white/10"
        >
          ⚙️ {editing ? 'Fermer' : 'Modifier le jour'}
        </button>
      </div>

      {editing && <DayEditor day={day} onClose={() => setEditing(false)} />}

      {day.note && (
        <p className="text-xs text-amber-300/90 mb-2 bg-amber-500/10 rounded px-2 py-1">{day.note}</p>
      )}

      <ol className="space-y-1 text-sm">
        <li className="text-white/60 flex gap-2">
          <span className="w-11 text-right tabular-nums shrink-0">{day.windowStart}</span>
          <span>🛏️ Départ de l'hôtel</span>
        </li>
        {items.map((a, i) => {
          const sg = c.segments[i];
          const st = c.stops[i];
          return (
            <li key={a.id}>
              {sg && (
                <div className="text-xs text-white/45 pl-13 py-0.5 flex gap-2">
                  <span className="w-11 shrink-0" />
                  <span>
                    {sg.metroAdvised
                      ? `🚇 métro conseillé ~${sg.metroMin} min`
                      : `🚶 ${sg.walkMin} min`}{' '}
                    · {sg.km.toFixed(1)} km
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-white/5 group">
                <span className="w-11 text-right tabular-nums text-white/60 text-xs shrink-0">
                  {st ? formatHM(st.arriveMin) : ''}
                </span>
                <span
                  className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
                  style={{ background: accent, color: '#0b0f1a' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate">{a.title}</div>
                  <div className="text-xs text-white/45">
                    {formatDuration(a.durationMin)} sur place
                    {st && <> · départ {formatHM(st.departMin)}</>}
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="px-1 rounded hover:bg-white/10 disabled:opacity-20">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                    className="px-1 rounded hover:bg-white/10 disabled:opacity-20">↓</button>
                  <button onClick={() => setItems(day.itemIds.filter((id) => id !== a.id))}
                    className="px-1 rounded hover:bg-red-500/20">🗑</button>
                </div>
              </div>
            </li>
          );
        })}
        {items.length > 0 && (
          <li className="text-white/60 flex gap-2">
            <span className={`w-11 text-right tabular-nums shrink-0 ${c.overWindow ? 'text-red-400 font-semibold' : ''}`}>
              {formatHM(c.endMin)}
            </span>
            <span>
              🛏️ Retour hôtel
              {c.overWindow && <span className="text-red-400"> — dépasse la fin de journée ({day.windowEnd}) !</span>}
            </span>
          </li>
        )}
        {items.length === 0 && (
          <li className="text-white/40 italic py-2">Journée vide — ajoute une première activité ↓</li>
        )}
      </ol>

      <div className="mt-3 pt-2 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>
            Activités {formatDuration(c.totalActivityMin)} + trajets {formatDuration(c.totalWalkMin)}
            {c.totalKm > 0 && (
              <span className="text-white/50">
                {' '}· 📏 {c.totalKm.toFixed(1)} km
                {c.walkKm < c.totalKm - 0.05 && <> (dont 🚶 {c.walkKm.toFixed(1)} km)</>}
              </span>
            )}
          </span>
          <span style={{ color: gaugeColor(c.budgetPct) }} className="font-semibold">
            {formatDuration(c.totalMin)} / {formatDuration(day.budgetMin)}
            {c.budgetPct >= 85 && c.budgetPct <= 100 && ' · journée chargée'}
            {c.budgetPct > 100 && ' · surchargée !'}
          </span>
        </div>
        <Gauge pct={c.budgetPct} />
        <div className="flex gap-2 mt-2">
          <button onClick={() => setItems([])}
            className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70">
            Vider la journée
          </button>
          {defaultAssignment[day.id] && (
            <button onClick={restore}
              className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70">
              Restaurer la proposition
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
