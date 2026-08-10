# Brief — Planificateur séjour Londres (Claudding Planner)

**Objectif** : app web localhost pour organiser 4 jours à Londres (26–29/08/2026, famille, hôtel Park Plaza Waterloo) — carte par jour, temps de parcours estimés, jauges de budget temps, catalogue d'activités.

**Contrainte clé demandée par Malik** : tout doit être pilotable depuis le front **et** depuis le terminal (Claude Code). → La persistance localStorage du cahier des charges a été remplacée par `data/trip.json` + mini-API dans le serveur Vite ; le front poll le fichier toutes les 2 s.

**Vision** : au-delà du plan de visite, l'app doit porter une **phase de paramétrage** du séjour (arrivée/départ, nombre de voyageurs, but du séjour, préférences de transport, plus tard budget cible) dont la fonction première est de **donner du contexte à un LLM** pour rendre ses propositions pertinentes (ex. : pas de visite à 7 km à pied si le but est le repos avec des enfants < 10 ans).

**Repo GitHub** : https://github.com/malikkaraoui/Claudding_planner (branche `main`).

**Docs faisant foi** : `cahier-des-charges-planificateur-londres.md` (spec V1), `README.md` (usage + pilotage terminal), `vault/roadmap.md` (suite).

**État (2026-08-10)** : V1 livrée et testée (typecheck, API, geocode Nominatim, modale de surcharge, synchro terminal→navigateur vérifiée par screenshot headless). Publication GitHub + phase de paramétrage en cours (voir roadmap et log).
