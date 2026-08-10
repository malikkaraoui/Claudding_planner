import type { TripParams, TripState } from '../types';

// Migration douce des trip.json existants (schemaVersion 2 → 3) : on complète
// les champs manquants sans toucher au reste. Utilisée côté serveur (GET, avec
// persistance) et côté front (ceinture de sécurité).

export function defaultParams(): TripParams {
  return {
    arrival: {
      mode: 'avion',
      place: 'Aéroport de Londres-Gatwick (LGW)',
      lat: 51.1537,
      lng: -0.1821,
      date: '2026-08-26',
      time: '07:35',
    },
    departure: {
      mode: 'avion',
      place: 'Aéroport de Londres-Gatwick (LGW)',
      lat: 51.1537,
      lng: -0.1821,
      date: '2026-08-29',
      time: '17:40',
    },
    travelers: 4,
    travelersNote: '2 adultes, 2 enfants (moins de 10 ans)',
    purpose: 'Vacances en famille — rythme adapté aux enfants',
    transport: {
      modes: { taxi: false, bus: true, uber: true, metro: true, walk: true },
      walkMaxKm: 3,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateTrip(raw: any): { trip: TripState; changed: boolean } {
  if (!raw || typeof raw !== 'object') throw new Error('TripState invalide');
  if (raw.schemaVersion === 3 && raw.params?.arrival && raw.params?.departure && raw.params?.transport) {
    return { trip: raw as TripState, changed: false };
  }
  const d = defaultParams();
  const p = raw.params ?? {};
  const trip: TripState = {
    ...raw,
    schemaVersion: 3,
    params: {
      ...d,
      ...p,
      arrival: { ...d.arrival, ...(p.arrival ?? {}) },
      departure: { ...d.departure, ...(p.departure ?? {}) },
      transport: {
        ...d.transport,
        ...(p.transport ?? {}),
        modes: { ...d.transport.modes, ...(p.transport?.modes ?? {}) },
      },
    },
  };
  return { trip, changed: true };
}
