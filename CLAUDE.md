# Claudding Planner — instructions projet

Planificateur de séjour Londres (React + Vite + Leaflet + Tailwind). Repo GitHub :
`malikkaraoui/Claudding_planner`, travail directement sur `main`.

## Commandes

```bash
npm run dev      # http://localhost:5173 (mini-API incluse dans le serveur Vite)
npx tsc -b       # typecheck (obligatoire avant tout commit)
npm run build    # build de prod
```

## Architecture — l'essentiel

- **Source de vérité : `data/trip.json`** (gitignoré, régénéré depuis `src/seed.ts` s'il
  manque). Le front poll `GET /api/trip` toutes les 2 s ; toute écriture du fichier
  (terminal, agent) apparaît seule dans le navigateur. Écritures front : PUT débouncé 400 ms.
- Mini-API dans `server/apiPlugin.ts` : `GET/PUT/DELETE /api/trip`,
  `GET /api/geocode?q=…` (proxy Nominatim, recherche dans Londres ; `&scope=global`
  pour aéroports/gares/ports hors de la ville).
- **Schéma v3** (`src/types.ts`) : `params` = paramétrage du séjour (arrivée/départ
  géocodés, voyageurs, but, transports acceptés + seuil marche). Rôle : contexte pour
  un LLM. Migration douce v2→v3 dans `src/lib/migrate.ts`, appliquée et persistée au GET.
- Heuristique trajets dans `src/lib/geo.ts` (`computeDay`) : coefficients dans
  `trip.settings`, jamais en dur ailleurs.

## Règles de travail validées avec Malik

- Boucle : livrer → **vérifier en headless** (gstack `/browse`) → commit + push `main` →
  mettre à jour `vault/log.md`. Preuve avant affirmation (sortie de commande, screenshot).
- La persistance se vérifie dans `data/trip.json` (pas seulement à l'écran). Après un
  test UI qui modifie les données, **restaurer les valeurs d'origine** dans le fichier.
- Les dialogues natifs (`window.confirm`) se testent avec `$B dialog-accept` avant le clic.
- UX : les actions fréquentes restent accessibles sans ouvrir un panneau (ex. bouton −
  de suppression du jour dans la barre du haut, pas caché dans un éditeur).
- Le watcher Vite ignore `data/**`, `.gstack/**`, `vault/**`, `*.md`
  (`vite.config.ts`) — ne pas retirer ces exclusions, sinon full-reload parasites
  pendant les tests outillés.
- Interface et documentation en français (accents corrects) ; identifiants de code en anglais.

## Documentation

- `README.md` — usage + pilotage terminal (à tenir à jour à chaque feature visible).
- `cahier-des-charges-planificateur-londres.md` — spec V1.
- `vault/` — brief, roadmap, log, leçons ; remontée via
  `"/Users/malik/Malik VAULT/sync-vaults.sh"` en fin de travail notable.
