export type Category =
  | 'monument' | 'musee' | 'parc' | 'marche' | 'shopping'
  | 'panorama' | 'transport' | 'autre';

export interface Activity {
  id: string;
  title: string;
  lat: number;
  lng: number;
  durationMin: number;        // temps sur place estimé
  category: Category;
  notes?: string;
  source: 'catalog' | 'manual';
}

export interface DayPlan {
  id: string;
  date: string;               // ISO "2026-08-26"
  label: string;              // "Mer 26 août"
  windowStart: string;        // "10:00"
  windowEnd: string;          // "20:00"
  budgetMin: number;
  itemIds: string[];          // ordre de visite
  note?: string;              // ex : "Départ hôtel 14h30 max"
}

export interface Settings {
  timezone: string;           // "Europe/London"
  walkDetourFactor: number;   // détour urbain (1.3)
  walkMinPerKm: number;       // 13 min/km famille
  metroThresholdKm: number;   // > 2.5 km → métro conseillé
  metroBaseMin: number;       // 15 min forfait
  metroMinPerKm: number;      // + 3 min/km
}

export interface TripState {
  schemaVersion: 2;
  title: string;
  hotel: { title: string; lat: number; lng: number };
  settings: Settings;
  activities: Record<string, Activity>;
  days: DayPlan[];
}

export interface LatLng { lat: number; lng: number }
