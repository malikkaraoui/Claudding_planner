import type { DayPlan, LatLng, Settings, TripState } from '../types';

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Segment {
  from: LatLng & { title: string };
  to: LatLng & { title: string };
  km: number;            // distance après détour urbain
  walkMin: number;
  metroAdvised: boolean;
  metroMin: number;
  usedMin: number;       // temps retenu (métro si conseillé, sinon marche)
}

export function computeSegment(
  from: LatLng & { title: string },
  to: LatLng & { title: string },
  s: Settings
): Segment {
  // Heuristique CDC §5 : haversine × détour urbain, 13 min/km,
  // métro conseillé au-delà du seuil (15 min + 3 min/km).
  const km = haversineKm(from, to) * s.walkDetourFactor;
  const walkMin = Math.round(km * s.walkMinPerKm);
  const metroAdvised = km > s.metroThresholdKm;
  const metroMin = Math.round(s.metroBaseMin + km * s.metroMinPerKm);
  return { from, to, km, walkMin, metroAdvised, metroMin, usedMin: metroAdvised ? metroMin : walkMin };
}

export interface StopTiming {
  activityId: string;
  arriveMin: number;   // minutes depuis minuit
  departMin: number;
}

export interface DayComputation {
  segments: Segment[];       // hôtel → 1 → … → n → hôtel
  stops: StopTiming[];
  totalWalkMin: number;      // somme des usedMin
  totalActivityMin: number;
  totalMin: number;
  budgetPct: number;         // (total / budget) × 100
  startMin: number;
  endMin: number;            // heure estimée de retour à l'hôtel
  windowEndMin: number;
  overWindow: boolean;
}

export function parseHM(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatHM(min: number): string {
  const m = Math.round(min);
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function formatDuration(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}

export function computeDay(trip: TripState, day: DayPlan): DayComputation {
  const s = trip.settings;
  const hotel = { ...trip.hotel };
  const items = day.itemIds
    .map((id) => trip.activities[id])
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const points = [hotel, ...items, hotel];
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push(computeSegment(points[i], points[i + 1], s));
  }
  if (items.length === 0) segments.length = 0;

  const startMin = parseHM(day.windowStart);
  const windowEndMin = parseHM(day.windowEnd);
  const stops: StopTiming[] = [];
  let t = startMin;
  items.forEach((a, i) => {
    t += segments[i]?.usedMin ?? 0;
    const arriveMin = t;
    t += a.durationMin;
    stops.push({ activityId: a.id, arriveMin, departMin: t });
  });
  const endMin = items.length ? t + (segments[segments.length - 1]?.usedMin ?? 0) : startMin;

  const totalWalkMin = segments.reduce((acc, sg) => acc + sg.usedMin, 0);
  const totalActivityMin = items.reduce((acc, a) => acc + a.durationMin, 0);
  const totalMin = totalWalkMin + totalActivityMin;
  return {
    segments,
    stops,
    totalWalkMin,
    totalActivityMin,
    totalMin,
    budgetPct: day.budgetMin > 0 ? (totalMin / day.budgetMin) * 100 : 0,
    startMin,
    endMin,
    windowEndMin,
    overWindow: endMin > windowEndMin,
  };
}

/** Couleur de jauge selon les seuils du CDC §4. */
export function gaugeColor(pct: number): string {
  if (pct > 100) return '#f87171';   // rouge
  if (pct >= 85) return '#fbbf24';   // orange
  return '#4ade80';                  // vert
}
