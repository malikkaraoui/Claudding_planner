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

// --- Paramétrage du séjour (contexte destiné au LLM) ---

export type TravelMode = 'avion' | 'train' | 'bus' | 'voiture' | 'bateau' | 'autre';

export interface TripEndpoint {
  mode: TravelMode;
  place: string;              // ex : "Aéroport de Londres-Gatwick (LGW)"
  lat: number | null;         // déduits du géocodage du lieu
  lng: number | null;
  date: string;               // ISO "2026-08-26"
  time: string;               // "07:35"
}

export type TransportPref = 'taxi' | 'bus' | 'uber' | 'metro' | 'walk';

export interface TripParams {
  arrival: TripEndpoint;
  departure: TripEndpoint;
  travelers: number;          // nombre de personnes dans le séjour
  travelersNote?: string;     // ex : "2 adultes, 2 enfants (6 et 9 ans)"
  purpose?: string;           // but du séjour — oriente les propositions du LLM
  transport: {
    modes: Record<TransportPref, boolean>;
    walkMaxKm: number;        // marche acceptée seulement sous ce seuil (défaut 3 km)
  };
}

export interface TripState {
  schemaVersion: 3;
  title: string;
  hotel: { title: string; address?: string; lat: number; lng: number };
  settings: Settings;
  params: TripParams;
  activities: Record<string, Activity>;
  days: DayPlan[];
}

export interface LatLng { lat: number; lng: number }
