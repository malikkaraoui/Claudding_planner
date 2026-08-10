import { useState } from 'react';
import type { DayPlan } from '../types';
import { useTrip } from '../state';

// Édition des paramètres du jour : label, date, fenêtre horaire, budget, note.
export function DayEditor({ day, onClose }: { day: DayPlan; onClose: () => void }) {
  const { trip, update } = useTrip();
  const [form, setForm] = useState({
    label: day.label,
    date: day.date,
    windowStart: day.windowStart,
    windowEnd: day.windowEnd,
    budgetH: String(day.budgetMin / 60),
    note: day.note ?? '',
  });

  const save = () => {
    const budgetMin = Math.round(parseFloat(form.budgetH.replace(',', '.')) * 60);
    if (!Number.isFinite(budgetMin) || budgetMin <= 0) return;
    update((t) => ({
      ...t,
      days: t.days.map((d) =>
        d.id === day.id
          ? {
              ...d,
              label: form.label.trim() || d.label,
              date: form.date,
              windowStart: form.windowStart,
              windowEnd: form.windowEnd,
              budgetMin,
              note: form.note.trim() || undefined,
            }
          : d
      ),
    }));
    onClose();
  };

  const removeDay = () => {
    if (!trip || trip.days.length <= 1) return;
    if (!window.confirm(`Supprimer ${day.label} ? Les activités redeviennent disponibles.`)) return;
    update((t) => ({ ...t, days: t.days.filter((d) => d.id !== day.id) }));
    onClose();
  };

  const input = 'bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full';
  return (
    <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10 space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-white/60">Nom
          <input className={input} value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </label>
        <label className="text-xs text-white/60">Date
          <input className={input} type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label className="text-xs text-white/60">Départ
          <input className={input} type="time" value={form.windowStart}
            onChange={(e) => setForm({ ...form, windowStart: e.target.value })} />
        </label>
        <label className="text-xs text-white/60">Fin de journée
          <input className={input} type="time" value={form.windowEnd}
            onChange={(e) => setForm({ ...form, windowEnd: e.target.value })} />
        </label>
        <label className="text-xs text-white/60">Budget (heures)
          <input className={input} type="number" min="1" max="16" step="0.5" value={form.budgetH}
            onChange={(e) => setForm({ ...form, budgetH: e.target.value })} />
        </label>
        <label className="text-xs text-white/60">Note
          <input className={input} value={form.note} placeholder="ex : départ 14h30 max"
            onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
      </div>
      <div className="flex justify-between">
        <button onClick={removeDay} className="text-xs text-red-400/80 hover:text-red-400">
          Supprimer ce jour
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} className="text-xs px-2 py-1 rounded hover:bg-white/10">Annuler</button>
          <button onClick={save} className="text-xs px-3 py-1 rounded bg-white/15 hover:bg-white/25 font-medium">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
