# Roadmap — Claudding Planner

## Fait
- **V1 (2026-08-10)** : carte Leaflet par jour, itinéraire ordonné, heuristique marche/métro, jauges de budget temps, catalogue + ajout manuel avec geocode Nominatim, état dans `data/trip.json` pilotable front + terminal.
- **Publication GitHub** (2026-08-10) : repo `malikkaraoui/Claudding_planner`, branche `main`.
- **V2 — phase de paramétrage (2026-08-10)** : schéma v3 avec `params` (arrivée/départ {mode, lieu géocodé scope=global, date, heure}, voyageurs + composition, but du séjour, transports acceptés avec seuil marche 3 km), volet ⚙️ Réglages, migration douce v2→v3 persistée au GET.
- **Hôtel éditable (2026-08-10)** : nom + adresse avec autocomplétion, lat/lng recalés (carte et trajets suivent).
- **Bouton − (2026-08-10)** : suppression du jour actif depuis la barre du haut, avec confirmation.
- **Distance par journée (2026-08-10)** : 📏 km total de la boucle + part 🚶 à pied dans le pied de l'itinéraire.

## Plus tard
- Budget cible (global et/ou par jour) intégré au paramétrage.
- Génération/re-génération du plan par LLM à partir des paramètres.
- Ancrer les jours 1 et N sur les heures d'arrivée/départ (fenêtres auto).
- Recalibrage terrain des coefficients de trajet (`settings`).
