# Roadmap — Claudding Planner

## Fait
- **V1 (2026-08-10)** : carte Leaflet par jour, itinéraire ordonné, heuristique marche/métro, jauges de budget temps, catalogue + ajout manuel avec geocode Nominatim, état dans `data/trip.json` pilotable front + terminal.
- **Publication GitHub** (2026-08-10) : repo `malikkaraoui/Claudding_planner`, branche `main`.

## En cours — V2 : phase de paramétrage du séjour
But : donner du **contexte au LLM** pour des propositions pertinentes.
- Arrivée : mode (avion, train, bus, voiture, bateau), lieu (aéroport, gare, port… autocomplétion geocode → lat/lng déduits), date, heure.
- Départ : idem.
- Nombre de personnes dans le séjour + note voyageurs (ex. « 2 adultes, 2 enfants de 6 et 9 ans »).
- But du séjour (optionnel) : repos, culture, famille, romantique… — oriente les choix de visite du LLM.
- Préférences de transport : taxi, bus, uber, métro, à pied (sous un seuil km, défaut 3 km).
- UI : volet « Réglages » accessible depuis la barre du haut.

## Plus tard
- Budget cible (global et/ou par jour) intégré au paramétrage.
- Génération/re-génération du plan par LLM à partir des paramètres.
- Ancrer les jours 1 et N sur les heures d'arrivée/départ (fenêtres auto).
- Recalibrage terrain des coefficients de trajet (`settings`).
