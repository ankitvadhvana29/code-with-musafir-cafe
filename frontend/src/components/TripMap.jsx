import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITY_COORDS = {
  paris: [48.8566, 2.3522],
  tokyo: [35.6762, 139.6503],
  bali: [-8.3405, 115.0920],
  rome: [41.9028, 12.4964],
  'new york': [40.7128, -74.0060],
  'cape town': [-33.9249, 18.4241],
  ahmedabad: [23.0225, 72.5714],
  goa: [15.2993, 74.1240],
  london: [51.5072, -0.1276],
  dubai: [25.2048, 55.2708],
  bangkok: [13.7563, 100.5018],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  barcelona: [41.3874, 2.1686],
  amsterdam: [52.3676, 4.9041],
  istanbul: [41.0082, 28.9784],
  bangalore: [12.9716, 77.5946],
  jaipur: [26.9124, 75.7873],
};

function getCoords(cityName) {
  const key = (cityName || '').trim().toLowerCase();
  return CITY_COORDS[key] || null;
}

const pinIcon = L.divIcon({
  className: 'trip-map-pin',
  html: '<div style="background:#E8794A;width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 16],
});

export default function TripMap({ cities }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const points = (cities || [])
      .map((c) => ({ ...c, coords: getCoords(c.city_name) }))
      .filter((c) => c.coords);

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) return;
      map.removeLayer(layer);
    });

    if (points.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    const latlngs = points.map((p) => p.coords);
    points.forEach((p) => {
      L.marker(p.coords, { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${p.city_name}</b>${p.country ? `, ${p.country}` : ''}`);
    });

    if (latlngs.length > 1) {
      L.polyline(latlngs, { color: '#16405C', weight: 3, dashArray: '6 8', opacity: 0.7 }).addTo(map);
    }

    if (latlngs.length === 1) map.setView(latlngs[0], 6);
    else map.fitBounds(latlngs, { padding: [40, 40] });

    setTimeout(() => map.invalidateSize(), 100);
  }, [cities]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 320,
        borderRadius: 14,
        marginBottom: 24,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      }}
    />
  );
}