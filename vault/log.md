# Log — Claudding Planner

## 2026-08-10 — V1 livrée
Carte par jour + volet activités, état `data/trip.json` + mini-API Vite, geocode Nominatim, heuristique marche/métro. Vérifiée : typecheck, API curl, synchro terminal→navigateur (screenshot headless).

## 2026-08-10 — Publication GitHub + vault complété
`git init` local rattaché à `malikkaraoui/Claudding_planner` (main). `.gitignore` (node_modules, data/trip.json, .gstack). Vault : brief mis à jour, ajout roadmap.md et log.md.

## 2026-08-10 — V2 : phase de paramétrage (arrivée/départ, voyageurs, but, transports)
Schéma v3 : ajout `params` (arrival/departure {mode, lieu géocodé, date, heure}, travelers, purpose, transportPrefs avec seuil marche). Volet Réglages dans l'UI, autocomplétion de lieux via `/api/geocode` (portée élargie hors Londres pour les aéroports/gares/ports). Migration douce des trip.json v2 existants.
