# Claudding Planner — Planificateur de séjour Londres

App web locale : carte par jour + volet activités, tout paramétrable depuis le front **ou** depuis le terminal (pensée pour être pilotée par un agent type Claude Code).

Repo : https://github.com/malikkaraoui/Claudding_planner

## Lancer

```bash
npm install   # une seule fois
npm run dev   # → http://localhost:5173
```

Aucune clé API, aucune variable d'environnement.

## Architecture

- **Source de vérité : `data/trip.json`** (créé depuis le seed au premier lancement).
- Le serveur Vite embarque une mini-API (`server/apiPlugin.ts`) :
  - `GET /api/trip` → `{ rev, trip }` (rev = mtime du fichier)
  - `PUT /api/trip` → remplace tout l'état (body `{ trip }` ou l'état nu)
  - `DELETE /api/trip` → reset sur le seed
  - `GET /api/geocode?q=…` → proxy Nominatim (User-Agent conforme)
- Le front poll toutes les 2 s : **toute modification du fichier apparaît seule dans le navigateur**.

## Piloter depuis le terminal

Éditer directement `data/trip.json` (le plus simple), ou via l'API :

```bash
# Lire l'état
curl -s localhost:5173/api/trip | jq .trip.days

# Exemple : ajouter une activité du catalogue au jour j2
jq '(.days[] | select(.id=="j2").itemIds) += ["britmus"]' data/trip.json > /tmp/t.json && mv /tmp/t.json data/trip.json

# Reset complet sur la proposition par défaut
curl -X DELETE localhost:5173/api/trip
```

Tout est modifiable dans le JSON : jours (ajout/suppression, `date`, `label`, `windowStart`, `windowEnd`, `budgetMin`, `note`), activités (`lat`/`lng`, `durationMin`, `notes`), hôtel, `settings` (fuseau `timezone`, coefficients de marche `walkDetourFactor`, `walkMinPerKm`, seuil métro…).

## Heuristique temps de parcours (cf. cahier des charges §5)

Distance haversine × 1,3 (détour urbain), marche 13 min/km ; au-delà de 2,5 km → « 🚇 métro conseillé » (15 min + 3 min/km), segment en pointillés sur la carte. Coefficients ajustables dans `settings`.

## Documentation projet

- `cahier-des-charges-planificateur-londres.md` — spec V1.
- `vault/` — brief, roadmap, log et leçons du projet (maintenu au fil du travail).
