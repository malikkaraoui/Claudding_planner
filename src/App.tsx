import { useEffect, useState } from 'react';
import { useTrip } from './state';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { Itinerary } from './components/Itinerary';
import { Catalog } from './components/Catalog';
import { SettingsPanel } from './components/SettingsPanel';
import { DAY_COLORS } from './dayColors';

export default function App() {
  const { trip, error, update, resetToSeed } = useTrip();
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Jour actif par défaut / si le jour actif a été supprimé (même depuis le terminal)
  useEffect(() => {
    if (trip && (!activeDayId || !trip.days.some((d) => d.id === activeDayId))) {
      setActiveDayId(trip.days[0]?.id ?? null);
    }
  }, [trip, activeDayId]);

  if (error && !trip) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-300">{error}</p>
        <button onClick={resetToSeed} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
          Réinitialiser sur la proposition par défaut
        </button>
      </div>
    );
  }
  if (!trip) return <div className="h-full flex items-center justify-center text-white/50">Chargement…</div>;

  const dayIndex = trip.days.findIndex((d) => d.id === activeDayId);
  const day = trip.days[dayIndex] ?? trip.days[0];
  if (!day) return <div className="h-full flex items-center justify-center text-white/50">Aucun jour — ajoute-en un.</div>;
  const accent = DAY_COLORS[(dayIndex < 0 ? 0 : dayIndex) % DAY_COLORS.length];

  const addDay = () => {
    update((t) => {
      const n = t.days.length + 1;
      const last = t.days[t.days.length - 1];
      const nextDate = last
        ? new Date(new Date(last.date + 'T12:00:00').getTime() + 86400000).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      const id = `j${n}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        ...t,
        days: [...t.days, {
          id,
          date: nextDate,
          label: `Jour ${n}`,
          windowStart: '09:00',
          windowEnd: '20:00',
          budgetMin: 480,
          itemIds: [],
        }],
      };
    });
  };

  const removeDay = () => {
    if (trip.days.length <= 1) return;
    if (!window.confirm(`Supprimer ${day.label} ? Les activités redeviennent disponibles.`)) return;
    update((t) => ({ ...t, days: t.days.filter((d) => d.id !== day.id) }));
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar activeDayId={day.id} onSelectDay={setActiveDayId} onAddDay={addDay}
        onRemoveDay={removeDay} onOpenSettings={() => setShowSettings(true)} />
      {error && (
        <div className="bg-red-500/20 text-red-200 text-xs px-4 py-1">{error}</div>
      )}
      <main className="flex-1 flex min-h-0 relative">
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        <div className="flex-[13] min-w-0 relative">
          <MapView trip={trip} day={day} accent={accent} />
        </div>
        <aside className="flex-[7] min-w-[340px] max-w-[480px] overflow-y-auto p-3 space-y-3 z-[500]">
          <Itinerary trip={trip} day={day} accent={accent} />
          <Catalog trip={trip} />
        </aside>
      </main>
    </div>
  );
}
