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

Tout est modifiable dans le JSON : jours (ajout/suppression, `date`, `label`, `windowStart`, `windowEnd`, `budgetMin`, `note`), activités (`lat`/`lng`, `durationMin`, `notes`), hôtel, `settings` (fuseau `timezone`, coefficients de marche `walkDetourFactor`, `walkMinPerKm`, seuil métro…), et `params` (paramétrage du séjour, voir ci-dessous).

## Phase de paramétrage (`params`) — volet ⚙️ Réglages

Le bouton ⚙️ de la barre du haut ouvre le volet Réglages. Ces champs servent avant tout de **contexte à un LLM** pour rendre ses propositions pertinentes (ex. : pas de visite à 7 km à pied si le but est le repos avec des enfants < 10 ans) :

- **Hôtel** : nom et adresse éditables (autocomplétion — le marqueur carte et les temps de trajet suivent la nouvelle position).
- **Arrivée / Départ** : mode (✈️ avion, 🚆 train, 🚌 bus, 🚗 voiture, ⛴️ bateau), **lieu** (aéroport, gare, port… champ avec autocomplétion — la localisation `lat`/`lng` est déduite automatiquement via Nominatim), date et heure.
- **Voyageurs** : nombre de personnes + composition en texte libre (ex. « 2 adultes, 2 enfants de 6 et 9 ans »).
- **But du séjour** (optionnel) : repos, culture, famille… — oriente les choix de visite que le LLM peut proposer.
- **Transports acceptés sur place** : 🚶 à pied (seulement sous un seuil, défaut 3 km), 🚇 métro, 🚌 bus, 🚕 taxi, 🚙 Uber/VTC.
- À venir : budget cible.

Côté API : `GET /api/geocode?q=…` cherche dans Londres ; ajouter `&scope=global` pour une recherche mondiale (aéroports/gares hors de la ville). Les `trip.json` v2 existants sont **migrés automatiquement** (schéma v3, valeurs par défaut du séjour) au premier `GET /api/trip`.

## Jours

- **+** dans la barre du haut : ajoute un jour à la suite du dernier.
- **−** : supprime le jour actif (confirmation demandée, les activités redeviennent disponibles ; désactivé s'il ne reste qu'un jour).
- « ⚙️ Modifier le jour » dans l'itinéraire : nom, date, fenêtre horaire, budget, note.

## Heuristique temps de parcours (cf. cahier des charges §5)

Distance haversine × 1,3 (détour urbain), marche 13 min/km ; au-delà de 2,5 km → « 🚇 métro conseillé » (15 min + 3 min/km), segment en pointillés sur la carte. Coefficients ajustables dans `settings`.

Le pied de l'itinéraire affiche le résumé de la journée : temps d'activités + temps de trajets, **distance totale de la boucle** hôtel → activités → hôtel (📏, détour urbain inclus) avec la part faite à pied (🚶), et la jauge de budget temps.

## Documentation projet

- `cahier-des-charges-planificateur-londres.md` — spec V1.
- `vault/` — brief, roadmap, log et leçons du projet (maintenu au fil du travail).
