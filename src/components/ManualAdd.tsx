import { useState } from 'react';
import type { Activity } from '../types';

interface GeoResult { display_name: string; lat: string; lon: string }

// Ajout manuel : recherche Nominatim (proxyfiée par /api/geocode) avec
// fallback lat/lng si la recherche échoue (CDC §5).
export function ManualAdd({ onReady }: { onReady: (a: Activity) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [duration, setDuration] = useState('60');

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? r.statusText);
      setResults(data);
      if (data.length === 0) setError('Aucun résultat — saisis lat/lng à la main.');
    } catch (e) {
      setError(`Recherche indisponible (${String(e)}) — saisis lat/lng à la main.`);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const submit = () => {
    const d = parseInt(duration, 10);
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (!title.trim()) return setError('Titre requis.');
    if (!Number.isFinite(d) || d < 5 || d > 600) return setError('Durée : entier entre 5 et 600 min.');
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return setError('Position manquante : recherche un lieu ou saisis lat/lng.');
    onReady({
      id: `manual-${Date.now().toString(36)}`,
      title: title.trim(),
      lat: la,
      lng: ln,
      durationMin: d,
      category: 'autre',
      source: 'manual',
    });
    setTitle(''); setQuery(''); setResults([]); setLat(''); setLng(''); setDuration('60'); setError(null);
    setOpen(false);
  };

  const input = 'bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full';

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="mt-2 text-xs text-white/60 hover:text-white px-2 py-1 rounded hover:bg-white/10 w-full text-left">
        ＋ Ajout manuel (restaurant, lieu hors catalogue…)
      </button>
    );
  }

  return (
    <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10 space-y-2 text-sm">
      <input className={input} placeholder="Titre (ex : Pizzeria près de Waterloo)"
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="flex gap-1">
        <input className={input} placeholder="Recherche du lieu (Nominatim)"
          value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()} />
        <button onClick={search} disabled={searching}
          className="px-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 shrink-0">
          {searching ? '…' : '🔍'}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="max-h-28 overflow-y-auto space-y-1">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => { setLat(r.lat); setLng(r.lon); setResults([]); }}
                className="text-xs text-left w-full px-2 py-1 rounded bg-white/5 hover:bg-white/15 truncate">
                📍 {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-3 gap-1">
        <input className={input} placeholder="lat" value={lat} onChange={(e) => setLat(e.target.value)} />
        <input className={input} placeholder="lng" value={lng} onChange={(e) => setLng(e.target.value)} />
        <input className={input} type="number" min="5" max="600" placeholder="min"
          value={duration} onChange={(e) => setDuration(e.target.value)} title="Durée en minutes" />
      </div>
      {error && <p className="text-xs text-amber-300">{error}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded hover:bg-white/10">Annuler</button>
        <button onClick={submit} className="text-xs px-3 py-1 rounded bg-white/15 hover:bg-white/25 font-medium">
          Ajouter
        </button>
      </div>
    </div>
  );
}
