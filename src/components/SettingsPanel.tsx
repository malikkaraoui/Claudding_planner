import { useState } from 'react';
import { useTrip } from '../state';
import type { TransportPref, TravelMode, TripEndpoint, TripParams } from '../types';
import { PlaceSearch } from './PlaceSearch';

const MODES: { value: TravelMode; label: string }[] = [
  { value: 'avion',   label: '✈️ Avion' },
  { value: 'train',   label: '🚆 Train' },
  { value: 'bus',     label: '🚌 Bus / car' },
  { value: 'voiture', label: '🚗 Voiture' },
  { value: 'bateau',  label: '⛴️ Bateau / ferry' },
  { value: 'autre',   label: '❔ Autre' },
];

const TRANSPORT_PREFS: { key: TransportPref; label: string }[] = [
  { key: 'walk',  label: '🚶 À pied' },
  { key: 'metro', label: '🚇 Métro' },
  { key: 'bus',   label: '🚌 Bus' },
  { key: 'taxi',  label: '🚕 Taxi' },
  { key: 'uber',  label: '🚙 Uber / VTC' },
];

const PURPOSE_PRESETS = [
  'Repos / déconnexion',
  'Vacances en famille — rythme adapté aux enfants',
  'Culture et musées',
  'Découverte intensive de la ville',
  'Séjour romantique',
  'Shopping',
];

const input = 'bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full';
const label = 'text-[11px] uppercase tracking-wide text-white/40';

function EndpointForm({ title, endpoint, onChange }: {
  title: string;
  endpoint: TripEndpoint;
  onChange: (e: TripEndpoint) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold mb-1">{title}</legend>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className={label}>Mode</span>
          <select className={input} value={endpoint.mode}
            onChange={(e) => onChange({ ...endpoint, mode: e.target.value as TravelMode })}>
            {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={label}>Date</span>
            <input type="date" className={input} value={endpoint.date}
              onChange={(e) => onChange({ ...endpoint, date: e.target.value })} />
          </div>
          <div>
            <span className={label}>Heure</span>
            <input type="time" className={input} value={endpoint.time}
              onChange={(e) => onChange({ ...endpoint, time: e.target.value })} />
          </div>
        </div>
      </div>
      <div>
        <span className={label}>Lieu (aéroport, gare, port…)</span>
        <PlaceSearch
          value={endpoint.place}
          located={endpoint.lat != null && endpoint.lng != null}
          onChangeText={(place) => onChange({ ...endpoint, place, lat: null, lng: null })}
          onSelect={(p) => onChange({ ...endpoint, place: p.title, lat: p.lat, lng: p.lng })}
        />
      </div>
    </fieldset>
  );
}

// Volet Réglages : phase de paramétrage du séjour. Ces champs servent avant
// tout de contexte à un LLM (pertinence des propositions : but du séjour,
// enfants, modes de transport acceptés, seuil de marche…).
export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { trip, update } = useTrip();
  // Adresse retapée sans sélection dans la liste → position pas encore recalée
  const [addressDirty, setAddressDirty] = useState(false);
  if (!trip) return null;
  const p = trip.params;

  const setParams = (fn: (p: TripParams) => TripParams) =>
    update((t) => ({ ...t, params: fn(t.params) }));

  return (
    <div className="absolute inset-y-0 right-0 w-[420px] max-w-full z-[900] glass overflow-y-auto p-4 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">⚙️ Réglages du séjour</h2>
        <button onClick={onClose} className="px-2 py-1 rounded hover:bg-white/10 text-white/60" title="Fermer">✕</button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold mb-1">🛏️ Hôtel</legend>
        <div>
          <span className={label}>Nom</span>
          <input className={input} placeholder="ex : Park Plaza London Waterloo"
            value={trip.hotel.title}
            onChange={(e) => update((t) => ({ ...t, hotel: { ...t.hotel, title: e.target.value } }))} />
        </div>
        <div>
          <span className={label}>Adresse (la carte suit)</span>
          <PlaceSearch
            value={trip.hotel.address ?? ''}
            located={!addressDirty}
            placeholder="Adresse ou nom de l'hôtel…"
            onChangeText={(address) => {
              setAddressDirty(true);
              update((t) => ({ ...t, hotel: { ...t.hotel, address: address || undefined } }));
            }}
            onSelect={(pl) => {
              setAddressDirty(false);
              update((t) => ({ ...t, hotel: { ...t.hotel, address: pl.title, lat: pl.lat, lng: pl.lng } }));
            }}
          />
        </div>
      </fieldset>

      <EndpointForm title="🛬 Arrivée" endpoint={p.arrival}
        onChange={(arrival) => setParams((pp) => ({ ...pp, arrival }))} />

      <EndpointForm title="🛫 Départ" endpoint={p.departure}
        onChange={(departure) => setParams((pp) => ({ ...pp, departure }))} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold mb-1">👥 Voyageurs</legend>
        <div className="grid grid-cols-[90px_1fr] gap-2">
          <div>
            <span className={label}>Nombre</span>
            <input type="number" min={1} max={30} className={input} value={p.travelers}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n) && n >= 1) setParams((pp) => ({ ...pp, travelers: n }));
              }} />
          </div>
          <div>
            <span className={label}>Composition (contexte LLM)</span>
            <input className={input} placeholder="ex : 2 adultes, 2 enfants (6 et 9 ans)"
              value={p.travelersNote ?? ''}
              onChange={(e) => setParams((pp) => ({ ...pp, travelersNote: e.target.value || undefined }))} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-1">
        <legend className="text-sm font-semibold mb-1">🎯 But du séjour <span className="text-white/40 font-normal">(optionnel)</span></legend>
        <input className={input} list="purpose-presets"
          placeholder="ex : repos, culture, famille…"
          value={p.purpose ?? ''}
          onChange={(e) => setParams((pp) => ({ ...pp, purpose: e.target.value || undefined }))} />
        <datalist id="purpose-presets">
          {PURPOSE_PRESETS.map((s) => <option key={s} value={s} />)}
        </datalist>
        <p className="text-xs text-white/40">Oriente les choix de visite que le LLM peut proposer.</p>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold mb-1">🚦 Transports acceptés sur place</legend>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_PREFS.map((t) => {
            const on = p.transport.modes[t.key];
            return (
              <button key={t.key}
                onClick={() => setParams((pp) => ({
                  ...pp,
                  transport: { ...pp.transport, modes: { ...pp.transport.modes, [t.key]: !on } },
                }))}
                className={`px-2.5 py-1 rounded-lg text-sm border transition-colors ${
                  on ? 'border-emerald-400/50 bg-emerald-400/15' : 'border-white/10 text-white/40 hover:bg-white/5'
                }`}>
                {t.label}
              </button>
            );
          })}
        </div>
        {p.transport.modes.walk && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60">🚶 seulement sous</span>
            <input type="number" min={0.5} max={20} step={0.5}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-20"
              value={p.transport.walkMaxKm}
              onChange={(e) => {
                const km = parseFloat(e.target.value);
                if (Number.isFinite(km) && km > 0) {
                  setParams((pp) => ({ ...pp, transport: { ...pp.transport, walkMaxKm: km } }));
                }
              }} />
            <span className="text-white/60">km</span>
          </div>
        )}
      </fieldset>

      <p className="text-xs text-white/35">
        Ces paramètres (avec le budget cible à venir) donnent du contexte au LLM
        pour proposer des visites pertinentes. Éditables aussi dans
        <code className="mx-1 text-white/50">data/trip.json → params</code>.
      </p>
    </div>
  );
}
