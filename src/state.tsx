import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import type { TripState } from './types';

// L'état vit dans data/trip.json côté serveur. Le front le charge, pousse ses
// modifications (PUT débouncé) et détecte les modifications externes
// (édition du fichier depuis le terminal) en comparant `rev` toutes les 2 s.

interface TripContextValue {
  trip: TripState | null;
  error: string | null;
  update: (fn: (t: TripState) => TripState) => void;
  resetToSeed: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip hors TripProvider');
  return ctx;
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<TripState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revRef = useRef<number>(0);
  const dirtyRef = useRef(false);          // modif locale en attente de PUT
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tripRef = useRef<TripState | null>(null);
  tripRef.current = trip;

  const fetchTrip = useCallback(async () => {
    try {
      const r = await fetch('/api/trip');
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? r.statusText);
      if (data.rev !== revRef.current && !dirtyRef.current) {
        revRef.current = data.rev;
        setTrip(data.trip);
      }
      setError(null);
    } catch (e) {
      setError(`Serveur injoignable ou données invalides : ${String(e)}`);
    }
  }, []);

  useEffect(() => {
    fetchTrip();
    const id = setInterval(fetchTrip, 2000);
    return () => clearInterval(id);
  }, [fetchTrip]);

  const push = useCallback(async () => {
    const t = tripRef.current;
    if (!t) return;
    try {
      const r = await fetch('/api/trip', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip: t }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? r.statusText);
      revRef.current = data.rev;
      dirtyRef.current = false;
      setError(null);
    } catch (e) {
      setError(`Sauvegarde échouée : ${String(e)}`);
    }
  }, []);

  const update = useCallback((fn: (t: TripState) => TripState) => {
    setTrip((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      dirtyRef.current = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(push, 400);
      return next;
    });
  }, [push]);

  const resetToSeed = useCallback(async () => {
    const r = await fetch('/api/trip', { method: 'DELETE' });
    const data = await r.json();
    revRef.current = data.rev ?? 0;
    dirtyRef.current = false;
    revRef.current = 0; // force le rechargement au prochain poll
    await fetchTrip();
  }, [fetchTrip]);

  return (
    <TripContext.Provider value={{ trip, error, update, resetToSeed }}>
      {children}
    </TripContext.Provider>
  );
}
