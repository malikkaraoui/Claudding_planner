# Log — Claudding Planner

## 2026-08-10 — V1 livrée
Carte par jour + volet activités, état `data/trip.json` + mini-API Vite, geocode Nominatim, heuristique marche/métro. Vérifiée : typecheck, API curl, synchro terminal→navigateur (screenshot headless).

## 2026-08-10 — Publication GitHub + vault complété
`git init` local rattaché à `malikkaraoui/Claudding_planner` (main). `.gitignore` (node_modules, data/trip.json, .gstack). Vault : brief mis à jour, ajout roadmap.md et log.md.

## 2026-08-10 — V2 : phase de paramétrage (arrivée/départ, voyageurs, but, transports)
Schéma v3 : ajout `params` (arrival/departure {mode, lieu géocodé, date, heure}, travelers, purpose, transportPrefs avec seuil marche). Volet Réglages dans l'UI, autocomplétion de lieux via `/api/geocode` (portée élargie hors Londres pour les aéroports/gares/ports). Migration douce des trip.json v2 existants.

## 2026-08-10 — Bouton − dans la barre du haut
Suppression du jour actif directement depuis la TopBar (à côté du +), avec confirmation, sans passer par l'éditeur de jour. Désactivé s'il ne reste qu'un jour. Vérifié en headless : ajout Jour 5 → suppression → retour à 4 jours.

## 2026-08-10 — Hôtel éditable (nom + adresse géocodée)
Section 🛏️ Hôtel dans le volet Réglages : nom libre + adresse avec autocomplétion Nominatim ; la sélection d'un résultat recale lat/lng (le marqueur carte suit). Champ `hotel.address` optionnel — pas de migration nécessaire. Vérifié en headless : nom + « citizenM Tower of London » → coords 51.510/-0.076 persistées.
