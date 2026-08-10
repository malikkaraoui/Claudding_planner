# Cahier des charges — Planificateur de séjour Londres (V1)

> Document destiné à Claude Code. Objectif : app web **locale** (`npm run dev` → localhost), livrable en une session. Aucune clé API requise.

---

## 1. Contexte & problème

Séjour famille à Londres (2 adultes, 2 enfants), du **mercredi 26/08/2026** (arrivée Gatwick 07h35, vol EZS8486) au **samedi 29/08/2026** (départ Gatwick 17h40, vol EZY8495). Hôtel : **Park Plaza London Waterloo, 6 Hercules Road, SE1 7DP** — point de départ et de retour de chaque journée.

Problème : composer 4 journées d'activités sans outil qui montre **sur une carte** l'enchaînement des lieux, les temps de marche, et qui **alerte quand une journée est trop chargée**.

## 2. Objectifs V1

1. Une vue par jour : **carte (gauche) + volet latéral (droite)**, navigation entre les jours par onglets en **barre supérieure, à droite**.
2. Sur la carte : marqueurs numérotés dans l'ordre de visite, tracé hôtel → act. 1 → … → hôtel, **temps de marche par segment** et totaux.
3. Composer chaque journée : ajouter depuis un **catalogue d'activités** ou via un **ajout manuel** (titre, lieu, durée estimée).
4. Flux d'ajout : choix du jour dans une modale avec **jauge de remplissage par jour** + **avertissement de surcharge** ("Le jour 2 est déjà à X h / Y h — ajouter quand même ?").
5. Journées **pré-remplies avec la proposition par défaut** (§8), avec boutons "Vider la journée" et "Restaurer la proposition".
6. Persistance **localStorage** (l'app tourne en local, pas de backend).

## 3. Non-objectifs V1 (ne pas implémenter)

- Itinéraires transports en commun réels (TfL) — heuristique seulement, cf. §5.
- Horaires d'ouverture, billetterie, prix.
- Backend, comptes, multi-utilisateur, temps réel.
- Drag & drop inter-jours (V1 : retirer puis réajouter).
- App mobile native / PWA offline.

## 4. Règles métier — budgets temps par jour

Le budget = temps d'activités + temps de marche cumulés. Valeurs stockées dans un fichier de config (`config.ts`), modifiables.

| Jour | Date | Fenêtre | Budget | Raison |
|---|---|---|---|---|
| J1 | mer 26/08 | 10:00 – 20:00 | **6 h** | Arrivée vol 07h35, nuit courte, check-in 14h |
| J2 | jeu 27/08 | 09:00 – 20:00 | **8 h** | Journée pleine |
| J3 | ven 28/08 | 09:00 – 20:00 | **8 h** | Journée pleine |
| J4 | sam 29/08 | 09:00 – **14:30 STRICT** | **4 h** | Vol 17h40 → départ hôtel 14h30 max |

Seuils d'alerte sur (activités + marche) / budget :
- **< 85 %** : jauge verte.
- **85 – 100 %** : jauge orange + badge "journée chargée".
- **> 100 %** : jauge rouge ; tout nouvel ajout déclenche une **modale de confirmation bloquante** ("Le jour X est déjà à Yh / Zh. Ajouter quand même ?" → Confirmer / Annuler).

## 5. Stack & choix techniques

- **React 18 + Vite** (TypeScript recommandé). Pas d'autre framework.
- **Cartes : Leaflet + react-leaflet**, tuiles OpenStreetMap. *Justification : zéro clé API, zéro coût, parfait en localhost.*
- **Geocoding (ajout manuel)** : API Nominatim (`https://nominatim.openstreetmap.org/search?format=json&q=…`), max 1 req/s, header `User-Agent` custom obligatoire. **Fallback** : champs lat/lng manuels si la recherche échoue.
- **Temps de marche V1 : heuristique**, pas d'API de routing :
  - distance haversine entre deux points × détour urbain **1,3** ;
  - vitesse de marche famille : **13 min/km** ;
  - si distance (après détour) **> 2,5 km** → afficher "🚇 métro conseillé" avec temps forfaitaire `15 min + 3 min/km`.
  - `// À VÉRIFIER : coefficients à ajuster à l'usage — les exposer dans config.ts`
- **État** : `useReducer` + persistance `localStorage` (clé `london-trip-v1`, versionnée `{ schemaVersion: 1, … }`).
- **Styles** : Tailwind. Direction **liquid glass** : fond sombre, panneaux translucides `backdrop-blur`, bordures fines semi-transparentes, un accent coloré par jour (J1–J4). Sobre et orienté usage, pas décoratif.
- Aucune dépendance supplémentaire sans justification écrite en commentaire.

## 6. Modèle de données

```ts
type Category = 'monument' | 'musee' | 'parc' | 'marche' | 'shopping' | 'panorama' | 'transport' | 'autre';

interface Activity {
  id: string;
  title: string;
  lat: number;
  lng: number;
  durationMin: number;        // temps sur place estimé
  category: Category;
  notes?: string;
  source: 'catalog' | 'manual';
}

interface DayPlan {
  id: 'j1' | 'j2' | 'j3' | 'j4';
  date: string;               // ISO
  label: string;              // "Mer 26 août"
  windowStart: string;        // "10:00"
  windowEnd: string;          // "20:00"
  budgetMin: number;          // cf. §4
  itemIds: string[];          // ordre de visite
}

interface TripState {
  schemaVersion: 1;
  hotel: { title: string; lat: number; lng: number };
  activities: Record<string, Activity>;   // catalogue + manuelles
  days: DayPlan[];
}
```

Calculs dérivés (non stockés) : temps de marche par segment (hôtel → item1 → … → hôtel), total marche, total activités, % de budget.

## 7. UI / Layout

### Barre supérieure
- Gauche : titre "Londres 26–29 août".
- **Droite : 4 onglets J1 → J4**, chacun avec la date courte + mini-jauge de remplissage colorée. L'onglet actif porte l'accent couleur du jour.

### Corps (≥ 1024 px)
- **Carte ~65 % à gauche** : marqueur hôtel distinct (icône lit), marqueurs numérotés 1…n, polyline dans l'ordre, tooltip sur chaque segment = temps de marche, popup marqueur = titre + durée + bouton "Retirer du jour". Fit bounds automatique sur les points du jour.
- **Volet ~35 % à droite**, deux sections empilées :
  1. **Itinéraire du jour** : départ hôtel → liste ordonnée (n°, titre, durée, marche depuis le point précédent, boutons ↑ ↓ 🗑) → retour hôtel. En bas : totaux "Activités X h + Marche Y h = Z h / budget" + barre de progression (couleurs §4) + boutons "Vider" / "Restaurer la proposition".
  2. **Ajouter une activité** :
     - catalogue filtrable par catégorie (cartes compactes : titre, durée, catégorie, bouton **+**) ;
     - formulaire manuel : titre, lieu (recherche Nominatim avec liste de résultats, ou lat/lng), durée en minutes → bouton "Ajouter".

### Modale de choix du jour (au clic sur +)
- 4 boutons J1–J4, chacun avec sa jauge actuelle.
- Si l'ajout dépasse le budget du jour choisi → message de confirmation (§4).
- Une activité ne peut appartenir qu'à un seul jour (V1).

### Responsive
- < 1024 px : volet en drawer coulissant par-dessus la carte. Pas d'optimisation mobile poussée en V1.

## 8. Données seed

`seed.ts` : hôtel + catalogue + affectation par défaut.

> ⚠️ **Coordonnées approximatives, fournies de mémoire.** Au premier lancement (ou en script one-shot), les valider/corriger via Nominatim et figer le résultat dans le seed.

```json
{
  "hotel": { "title": "Park Plaza London Waterloo", "lat": 51.4986, "lng": -0.1128 },
  "catalog": [
    { "id": "releve",      "title": "Relève de la garde (Buckingham)", "lat": 51.5014, "lng": -0.1419, "durationMin": 75,  "category": "monument", "notes": "11h les 26 et 28/08 — arriver 10h30" },
    { "id": "stjames",     "title": "St James's Park",                 "lat": 51.5027, "lng": -0.1344, "durationMin": 45,  "category": "parc" },
    { "id": "bigben",      "title": "Big Ben / Westminster Bridge",    "lat": 51.5007, "lng": -0.1246, "durationMin": 30,  "category": "monument" },
    { "id": "trafalgar",   "title": "Trafalgar Sq / National Gallery", "lat": 51.5080, "lng": -0.1281, "durationMin": 60,  "category": "musee" },
    { "id": "covent",      "title": "Covent Garden",                   "lat": 51.5117, "lng": -0.1226, "durationMin": 60,  "category": "marche" },
    { "id": "lego",        "title": "LEGO Store Leicester Square",     "lat": 51.5103, "lng": -0.1305, "durationMin": 40,  "category": "shopping" },
    { "id": "hamleys",     "title": "Hamleys (Regent Street)",         "lat": 51.5128, "lng": -0.1394, "durationMin": 45,  "category": "shopping" },
    { "id": "tower",       "title": "Tower of London",                 "lat": 51.5081, "lng": -0.0759, "durationMin": 180, "category": "monument", "notes": "Réserver en ligne, arriver à l'ouverture" },
    { "id": "towerbridge", "title": "Tower Bridge (passerelle vitrée)","lat": 51.5055, "lng": -0.0754, "durationMin": 60,  "category": "monument" },
    { "id": "borough",     "title": "Borough Market",                  "lat": 51.5055, "lng": -0.0910, "durationMin": 60,  "category": "marche" },
    { "id": "eye",         "title": "London Eye",                      "lat": 51.5033, "lng": -0.1196, "durationMin": 60,  "category": "panorama" },
    { "id": "nhm",         "title": "Natural History Museum",          "lat": 51.4967, "lng": -0.1764, "durationMin": 120, "category": "musee", "notes": "Créneau gratuit à réserver" },
    { "id": "science",     "title": "Science Museum",                  "lat": 51.4978, "lng": -0.1745, "durationMin": 90,  "category": "musee", "notes": "Créneau gratuit à réserver" },
    { "id": "diana",       "title": "Diana Memorial Playground",       "lat": 51.5060, "lng": -0.1876, "durationMin": 60,  "category": "parc" },
    { "id": "britmus",     "title": "British Museum",                  "lat": 51.5194, "lng": -0.1270, "durationMin": 120, "category": "musee" },
    { "id": "kingscross",  "title": "Platform 9¾ (King's Cross)",      "lat": 51.5322, "lng": -0.1240, "durationMin": 30,  "category": "autre" },
    { "id": "skygarden",   "title": "Sky Garden (gratuit, réserver)",  "lat": 51.5112, "lng": -0.0836, "durationMin": 60,  "category": "panorama" },
    { "id": "boat",        "title": "Uber Boat Westminster → Greenwich","lat": 51.5019, "lng": -0.1201, "durationMin": 60, "category": "transport" },
    { "id": "cuttysark",   "title": "Cutty Sark",                      "lat": 51.4826, "lng": -0.0096, "durationMin": 60,  "category": "monument" },
    { "id": "observatory", "title": "Royal Observatory (méridien)",    "lat": 51.4769, "lng": -0.0005, "durationMin": 75,  "category": "musee" }
  ],
  "defaultAssignment": {
    "j1": ["releve", "stjames", "bigben", "covent"],
    "j2": ["tower", "towerbridge", "borough", "eye"],
    "j3": ["nhm", "science", "diana"],
    "j4": ["boat", "cuttysark", "observatory"]
  }
}
```

## 9. Exigences

### P0 (bloquant)
- 4 vues jour avec carte + volet, onglets en barre supérieure droite.
- Tracé + temps de marche par segment + totaux + jauge par jour.
- Ajout depuis catalogue et ajout manuel (Nominatim + fallback lat/lng).
- Modale de choix du jour avec jauges + avertissement de surcharge (§4).
- Réordonner / retirer les items d'un jour, recalcul immédiat.
- Seed pré-rempli + "Vider" / "Restaurer la proposition".
- Persistance localStorage, survit au refresh.

### P1
- Filtre du catalogue par catégorie ; masquer les activités déjà planifiées.
- Badge "🚇 métro conseillé" sur segments > 2,5 km.
- Cutoff J4 visible en permanence ("Départ hôtel 14h30 max").

### P2 (parking lot — ne pas coder, ne pas bloquer l'archi)
- Routing piéton réel (OSRM public), transports TfL, drag & drop inter-jours, export PDF de l'itinéraire, partage par lien.

## 10. Comportements & cas limites

- Réordonner recalcule tous les segments du jour.
- Retirer une activité `catalog` → elle redevient disponible dans le catalogue ; une `manual` → rejoint une liste "Non planifiées" dans le catalogue.
- Nominatim en échec (réseau, 0 résultat, rate limit) → message clair + bascule sur saisie lat/lng. Jamais de crash.
- localStorage corrompu ou `schemaVersion` inconnu → proposer un reset sur le seed (confirmation) plutôt que planter.
- Durée manuelle : entier 5–600 min, validation d'input.
- Jour vide : carte centrée sur l'hôtel, message "Ajoute une première activité".

## 11. Critères d'acceptation

- [ ] `npm install && npm run dev` → app fonctionnelle sur localhost, **sans clé API ni variable d'env**.
- [ ] Les 4 onglets affichent chacun leur carte, leur itinéraire et leur jauge.
- [ ] Ajouter "British Museum" depuis le catalogue → modale jours → choisir J3 déjà plein → l'avertissement de surcharge s'affiche, "Annuler" n'ajoute rien, "Confirmer" ajoute.
- [ ] Ajout manuel "Pizzeria près de Waterloo, 60 min" via recherche Nominatim → marqueur correct sur la carte du jour choisi.
- [ ] Réordonner deux items → segments et totaux mis à jour instantanément.
- [ ] Refresh navigateur → état conservé.
- [ ] J4 : ajouter au-delà de 4 h déclenche l'avertissement ; le cutoff 14h30 est affiché.
- [ ] UI liquid glass cohérente (panneaux translucides, accent par jour), lisible sur écran ≥ 1024 px.

## 12. Questions ouvertes (non bloquantes)

- Faut-il un "point déjeuner" générique par jour (item 45 min sans lieu fixe) ? → à trancher à l'usage.
- Heuristique marche 13 min/km : à recalibrer après le premier test terrain (exposée en config).
