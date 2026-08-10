import { useMemo, useState } from 'react';
import type { Activity, Category, TripState } from '../types';
import { formatDuration } from '../lib/geo';
import { ManualAdd } from './ManualAdd';
import { DayPickerModal } from './DayPickerModal';

const CATEGORIES: { id: Category | 'tous'; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'monument', label: 'Monuments' },
  { id: 'musee', label: 'Musées' },
  { id: 'parc', label: 'Parcs' },
  { id: 'marche', label: 'Marchés' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'panorama', label: 'Panoramas' },
  { id: 'transport', label: 'Transport' },
  { id: 'autre', label: 'Autres' },
];

const CAT_EMOJI: Record<Category, string> = {
  monument: '🏛️', musee: '🖼️', parc: '🌳', marche: '🍴',
  shopping: '🛍️', panorama: '🎡', transport: '⛴️', autre: '✨',
};

export function Catalog({ trip }: { trip: TripState }) {
  const [filter, setFilter] = useState<Category | 'tous'>('tous');
  const [pending, setPending] = useState<Activity | null>(null);

  const plannedIds = useMemo(
    () => new Set(trip.days.flatMap((d) => d.itemIds)),
    [trip.days]
  );

  const available = Object.values(trip.activities)
    .filter((a) => !plannedIds.has(a.id))
    .filter((a) => filter === 'tous' || a.category === filter)
    .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

  return (
    <section className="glass rounded-xl p-3">
      <h2 className="font-semibold mb-2">Ajouter une activité</h2>

      <div className="flex flex-wrap gap-1 mb-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              filter === c.id
                ? 'bg-white/15 border-white/30'
                : 'border-white/10 text-white/60 hover:bg-white/5'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {available.map((a) => (
          <li key={a.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-sm">
            <span>{CAT_EMOJI[a.category]}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate">{a.title}</div>
              <div className="text-xs text-white/45">
                {formatDuration(a.durationMin)}
                {a.source === 'manual' && ' · non planifiée'}
                {a.notes && ` · ${a.notes}`}
              </div>
            </div>
            <button onClick={() => setPending(a)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 font-bold shrink-0"
              title="Ajouter à un jour">+</button>
          </li>
        ))}
        {available.length === 0 && (
          <li className="text-white/40 italic text-sm py-2">
            Tout le catalogue de cette catégorie est déjà planifié.
          </li>
        )}
      </ul>

      <ManualAdd onReady={(a) => setPending(a)} />

      {pending && (
        <DayPickerModal trip={trip} activity={pending} onDone={() => setPending(null)} />
      )}
    </section>
  );
}
