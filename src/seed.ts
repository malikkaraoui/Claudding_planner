import type { Activity, TripState } from './types';

// ⚠️ Coordonnées fournies de mémoire (cf. cahier des charges §8) — à valider à l'usage.
const catalog: Omit<Activity, 'source'>[] = [
  { id: 'releve',      title: 'Relève de la garde (Buckingham)',    lat: 51.5014, lng: -0.1419, durationMin: 75,  category: 'monument', notes: '11h les 26 et 28/08 — arriver 10h30' },
  { id: 'stjames',     title: "St James's Park",                    lat: 51.5027, lng: -0.1344, durationMin: 45,  category: 'parc' },
  { id: 'bigben',      title: 'Big Ben / Westminster Bridge',       lat: 51.5007, lng: -0.1246, durationMin: 30,  category: 'monument' },
  { id: 'trafalgar',   title: 'Trafalgar Sq / National Gallery',    lat: 51.5080, lng: -0.1281, durationMin: 60,  category: 'musee' },
  { id: 'covent',      title: 'Covent Garden',                      lat: 51.5117, lng: -0.1226, durationMin: 60,  category: 'marche' },
  { id: 'lego',        title: 'LEGO Store Leicester Square',        lat: 51.5103, lng: -0.1305, durationMin: 40,  category: 'shopping' },
  { id: 'hamleys',     title: 'Hamleys (Regent Street)',            lat: 51.5128, lng: -0.1394, durationMin: 45,  category: 'shopping' },
  { id: 'tower',       title: 'Tower of London',                    lat: 51.5081, lng: -0.0759, durationMin: 180, category: 'monument', notes: "Réserver en ligne, arriver à l'ouverture" },
  { id: 'towerbridge', title: 'Tower Bridge (passerelle vitrée)',   lat: 51.5055, lng: -0.0754, durationMin: 60,  category: 'monument' },
  { id: 'borough',     title: 'Borough Market',                     lat: 51.5055, lng: -0.0910, durationMin: 60,  category: 'marche' },
  { id: 'eye',         title: 'London Eye',                         lat: 51.5033, lng: -0.1196, durationMin: 60,  category: 'panorama' },
  { id: 'nhm',         title: 'Natural History Museum',             lat: 51.4967, lng: -0.1764, durationMin: 120, category: 'musee', notes: 'Créneau gratuit à réserver' },
  { id: 'science',     title: 'Science Museum',                     lat: 51.4978, lng: -0.1745, durationMin: 90,  category: 'musee', notes: 'Créneau gratuit à réserver' },
  { id: 'diana',       title: 'Diana Memorial Playground',          lat: 51.5060, lng: -0.1876, durationMin: 60,  category: 'parc' },
  { id: 'britmus',     title: 'British Museum',                     lat: 51.5194, lng: -0.1270, durationMin: 120, category: 'musee' },
  { id: 'kingscross',  title: "Platform 9¾ (King's Cross)",         lat: 51.5322, lng: -0.1240, durationMin: 30,  category: 'autre' },
  { id: 'skygarden',   title: 'Sky Garden (gratuit, réserver)',     lat: 51.5112, lng: -0.0836, durationMin: 60,  category: 'panorama' },
  { id: 'boat',        title: 'Uber Boat Westminster → Greenwich',  lat: 51.5019, lng: -0.1201, durationMin: 60,  category: 'transport' },
  { id: 'cuttysark',   title: 'Cutty Sark',                         lat: 51.4826, lng: -0.0096, durationMin: 60,  category: 'monument' },
  { id: 'observatory', title: 'Royal Observatory (méridien)',       lat: 51.4769, lng: -0.0005, durationMin: 75,  category: 'musee' },
];

export const defaultAssignment: Record<string, string[]> = {
  j1: ['releve', 'stjames', 'bigben', 'covent'],
  j2: ['tower', 'towerbridge', 'borough', 'eye'],
  j3: ['nhm', 'science', 'diana'],
  j4: ['boat', 'cuttysark', 'observatory'],
};

export function buildSeedTrip(): TripState {
  const activities: TripState['activities'] = {};
  for (const a of catalog) activities[a.id] = { ...a, source: 'catalog' };
  return {
    schemaVersion: 2,
    title: 'Londres 26–29 août',
    hotel: { title: 'Park Plaza London Waterloo', lat: 51.4986, lng: -0.1128 },
    settings: {
      timezone: 'Europe/London',
      walkDetourFactor: 1.3,
      walkMinPerKm: 13,
      metroThresholdKm: 2.5,
      metroBaseMin: 15,
      metroMinPerKm: 3,
    },
    activities,
    days: [
      { id: 'j1', date: '2026-08-26', label: 'Mer 26 août', windowStart: '10:00', windowEnd: '20:00', budgetMin: 360, itemIds: [...defaultAssignment.j1], note: 'Arrivée Gatwick 07h35 — check-in 14h' },
      { id: 'j2', date: '2026-08-27', label: 'Jeu 27 août', windowStart: '09:00', windowEnd: '20:00', budgetMin: 480, itemIds: [...defaultAssignment.j2] },
      { id: 'j3', date: '2026-08-28', label: 'Ven 28 août', windowStart: '09:00', windowEnd: '20:00', budgetMin: 480, itemIds: [...defaultAssignment.j3] },
      { id: 'j4', date: '2026-08-29', label: 'Sam 29 août', windowStart: '09:00', windowEnd: '14:30', budgetMin: 240, itemIds: [...defaultAssignment.j4], note: '⚠️ Départ hôtel 14h30 MAX — vol 17h40' },
    ],
  };
}
