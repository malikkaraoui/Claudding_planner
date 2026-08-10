# Leçons — Planificateur Londres

## 2026-08-10 — Fichier JSON + polling > localStorage pour le pilotage agent

Quand l'utilisateur veut qu'un agent terminal puisse modifier l'état d'une app front locale, stocker l'état dans un **fichier disque servi par le dev-server** (mtime = numéro de révision, polling côté front) est radicalement plus simple qu'un backend ou que localStorage : l'agent édite le fichier avec ses outils natifs, zéro protocole à apprendre, et le front se met à jour seul. Candidate à remontée globale (transverse : tout projet "app locale pilotable par Claude").

## 2026-08-10 — Le watcher Vite recharge la page sur des fichiers écrits par l'outillage

Symptôme : les clics semblaient « ne rien faire » dans l'app (modale qui se ferme seule). Cause réelle : l'outil de test navigateur (gstack browse) écrit `.gstack/browse-audit.jsonl` dans le cwd du projet → Vite full-reload à chaque commande de test → l'état React était perdu avant chaque vérification. Leçon (transverse, candidate à remontée globale) : sur tout projet Vite testé avec gstack browse, exclure du watcher (`server.watch.ignored`) les fichiers écrits par l'outillage ET les fichiers de données pilotés hors module graph (`.gstack/**`, `data/**`, `*.md`). Illustre R2 : suspecter l'environnement avant le code — l'app n'avait aucun bug.

## 2026-08-10 — Heuristique de trajet : la valeur seed peut déjà dépasser le budget

Le J4 seed (Greenwich) sort à 5 h 14 pour un budget de 4 h dès le premier rendu — l'heuristique métro (15 min + 3 min/km) pèse lourd sur les segments longs. Ce n'est pas un bug : la jauge rouge fait exactement son travail d'alerte. À recalibrer sur le terrain via `settings`.
