import { useEffect, useRef, useState } from 'react';

interface GeoResult { display_name: string; lat: string; lon: string }

interface Props {
  value: string;
  located: boolean;                // lat/lng déjà déduits pour ce libellé
  placeholder?: string;
  onSelect: (place: { title: string; lat: number; lng: number }) => void;
  onChangeText: (text: string) => void;
}

// Recherche de lieu avec autocomplétion (aéroport, gare, port, adresse…).
// Portée globale (scope=global) : les points d'arrivée/départ sont souvent
// hors de Londres. Debounce 600 ms pour respecter Nominatim (1 req/s max).
export function PlaceSearch({ value, located, placeholder, onSelect, onChangeText }: Props) {
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNext = useRef(false);  // pas de recherche après une sélection

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleChange = (text: string) => {
    onChangeText(text);
    setError(null);
    if (timer.current) clearTimeout(timer.current);
    if (skipNext.current) { skipNext.current = false; return; }
    if (text.trim().length < 3) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/geocode?scope=global&q=${encodeURIComponent(text.trim())}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? r.statusText);
        setResults(data);
        if (data.length === 0) setError('Aucun résultat.');
      } catch (e) {
        setError(`Recherche indisponible (${String(e)})`);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 600);
  };

  const pick = (r: GeoResult) => {
    skipNext.current = true;
    setResults([]);
    setError(null);
    onSelect({ title: r.display_name.split(',').slice(0, 2).join(','), lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <input
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full"
          placeholder={placeholder ?? 'Aéroport, gare, port, adresse…'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
        <span className="shrink-0 text-xs w-5 text-center" title={located ? 'Lieu géolocalisé' : 'Lieu non géolocalisé — choisis un résultat'}>
          {searching ? '…' : located ? '📍' : '❓'}
        </span>
      </div>
      {results.length > 0 && (
        <ul className="absolute left-0 right-5 mt-1 z-20 glass rounded-lg max-h-40 overflow-y-auto p-1 space-y-0.5">
          {results.map((r, i) => (
            <li key={i}>
              <button onClick={() => pick(r)}
                className="text-xs text-left w-full px-2 py-1 rounded hover:bg-white/15 truncate block">
                📍 {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-amber-300 mt-0.5">{error}</p>}
    </div>
  );
}
