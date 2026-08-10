import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildSeedTrip } from '../src/seed';
import { migrateTrip } from '../src/lib/migrate';

// API locale : data/trip.json est la source de vérité, éditable depuis le
// front (PUT /api/trip), depuis le terminal (édition directe du fichier ou
// curl), le front détecte tout changement via le champ `rev` (mtime).

const DATA_FILE = path.resolve(__dirname, '../data/trip.json');

function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(buildSeedTrip(), null, 2));
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export function apiPlugin(): Plugin {
  return {
    name: 'london-trip-api',
    configureServer(server) {
      ensureFile();
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');

        if (url.pathname === '/api/trip') {
          try {
            if (req.method === 'GET') {
              ensureFile();
              const raw = fs.readFileSync(DATA_FILE, 'utf-8');
              const rev = fs.statSync(DATA_FILE).mtimeMs;
              let trip;
              try {
                trip = JSON.parse(raw);
              } catch {
                return json(res, 500, { error: 'trip.json invalide (JSON corrompu)' });
              }
              // Migration douce v2 → v3 (ajout de `params`), persistée sur disque
              const migrated = migrateTrip(trip);
              if (migrated.changed) {
                fs.writeFileSync(DATA_FILE, JSON.stringify(migrated.trip, null, 2));
                return json(res, 200, { rev: fs.statSync(DATA_FILE).mtimeMs, trip: migrated.trip });
              }
              return json(res, 200, { rev, trip });
            }
            if (req.method === 'PUT') {
              const body = await readBody(req);
              const parsed = JSON.parse(body);
              const trip = parsed.trip ?? parsed;
              if (!trip || !Array.isArray(trip.days) || typeof trip.activities !== 'object') {
                return json(res, 400, { error: 'Structure TripState invalide' });
              }
              fs.writeFileSync(DATA_FILE, JSON.stringify(trip, null, 2));
              return json(res, 200, { rev: fs.statSync(DATA_FILE).mtimeMs });
            }
            if (req.method === 'DELETE') {
              // Reset sur le seed (utilisé si fichier corrompu)
              fs.writeFileSync(DATA_FILE, JSON.stringify(buildSeedTrip(), null, 2));
              return json(res, 200, { rev: fs.statSync(DATA_FILE).mtimeMs });
            }
            return json(res, 405, { error: 'Méthode non supportée' });
          } catch (e) {
            return json(res, 500, { error: String(e) });
          }
        }

        if (url.pathname === '/api/geocode') {
          // Proxy Nominatim : User-Agent custom obligatoire, max 1 req/s côté usage.
          const q = url.searchParams.get('q');
          if (!q) return json(res, 400, { error: 'Paramètre q manquant' });
          // scope=global : pas de suffixe ", London" (aéroports, gares, ports…
          // potentiellement hors de la ville pour les points d'arrivée/départ)
          const globalScope = url.searchParams.get('scope') === 'global';
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(globalScope ? q : q + ', London')}`,
              { headers: { 'User-Agent': 'london-trip-planner-local/1.0 (usage personnel)' } }
            );
            if (!r.ok) return json(res, 502, { error: `Nominatim ${r.status}` });
            return json(res, 200, await r.json());
          } catch (e) {
            return json(res, 502, { error: String(e) });
          }
        }

        next();
      });
    },
  };
}
