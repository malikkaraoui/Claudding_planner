import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { DayPlan, TripState } from '../types';
import { computeDay, formatDuration } from '../lib/geo';
import { useTrip } from '../state';

function numIcon(n: number, color: string) {
  return L.divIcon({
    className: '',
    html: `<div class="num-marker" style="background:${color}">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

const hotelIcon = L.divIcon({
  className: '',
  html: '<div class="hotel-marker">🛏️</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, JSON.stringify(points)]);
  return null;
}

export function MapView({ trip, day, accent }: { trip: TripState; day: DayPlan; accent: string }) {
  const { update } = useTrip();
  const c = computeDay(trip, day);
  const items = day.itemIds.map((id) => trip.activities[id]).filter(Boolean);
  const points: [number, number][] = [
    [trip.hotel.lat, trip.hotel.lng],
    ...items.map((a) => [a.lat, a.lng] as [number, number]),
  ];

  const removeFromDay = (activityId: string) => {
    update((t) => ({
      ...t,
      days: t.days.map((d) =>
        d.id === day.id ? { ...d, itemIds: d.itemIds.filter((i) => i !== activityId) } : d
      ),
    }));
  };

  return (
    <MapContainer
      center={[trip.hotel.lat, trip.hotel.lng]}
      zoom={13}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      <Marker position={[trip.hotel.lat, trip.hotel.lng]} icon={hotelIcon}>
        <Popup>
          <strong>{trip.hotel.title}</strong>
          <br />Départ {day.windowStart} — retour estimé {c.segments.length ? formatDuration(c.endMin - c.startMin) : '—'} plus tard
        </Popup>
      </Marker>

      {items.map((a, i) => (
        <Marker key={a.id} position={[a.lat, a.lng]} icon={numIcon(i + 1, accent)}>
          <Popup>
            <strong>{i + 1}. {a.title}</strong>
            <br />Durée sur place : {formatDuration(a.durationMin)}
            {a.notes && <><br /><em>{a.notes}</em></>}
            <br />
            <button
              onClick={() => removeFromDay(a.id)}
              style={{ marginTop: 6, color: '#f87171', cursor: 'pointer' }}
            >
              Retirer du jour
            </button>
          </Popup>
        </Marker>
      ))}

      {c.segments.map((sg, i) => (
        <Polyline
          key={i}
          positions={[[sg.from.lat, sg.from.lng], [sg.to.lat, sg.to.lng]]}
          pathOptions={{
            color: accent,
            weight: 3,
            opacity: 0.85,
            dashArray: sg.metroAdvised ? '8 8' : undefined,
          }}
        >
          <Tooltip sticky className="segment-tooltip">
            {sg.metroAdvised
              ? `🚇 métro conseillé ~${sg.metroMin} min (${sg.km.toFixed(1)} km — à pied ${sg.walkMin} min)`
              : `🚶 ${sg.walkMin} min (${sg.km.toFixed(1)} km)`}
          </Tooltip>
        </Polyline>
      ))}
    </MapContainer>
  );
}
