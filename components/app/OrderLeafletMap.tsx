"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Real-geography detail map for an order: OSM tiles via Leaflet (no API key).
// Client-only — Leaflet touches window at import time, so we import it inside
// the effect rather than at module scope.

export type LeafletJourney = {
  origin: { lat: number; lng: number; label: string };       // origin airport
  destination: { lat: number; lng: number; label: string };  // destination airport
  hub?: { lat: number; lng: number; label: string };         // our hub (dest city)
  dropoff?: { lat: number; lng: number; label: string };     // buyer address (synthetic offset)
  flightLabel?: string;   // "EK 202 · Airbus A380"
  courierLabel?: string;  // "Dunzo Local · CB-XYZ123"
};

// Leaflet's bindPopup(string) renders HTML — escape every interpolated value
// (labels include buyer-entered addresses) to keep stored XSS out of the map.
function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export default function OrderLeafletMap({ journey }: { journey: LeafletJourney }) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;

      map = L.map(elRef.current, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const mk = (p: { lat: number; lng: number }, color: string) =>
        L.circleMarker([p.lat, p.lng], { radius: 8, color, weight: 3, fillColor: "#FDFCFC", fillOpacity: 1 });

      const pts: Array<[number, number]> = [];
      const o = journey.origin, d = journey.destination;

      mk(o, "#192227").addTo(map).bindPopup(`<b>${esc(o.label)}</b><br/>Departure${journey.flightLabel ? `<br/>${esc(journey.flightLabel)}` : ""}`);
      mk(d, "#F9A600").addTo(map).bindPopup(`<b>${esc(d.label)}</b><br/>Arrival${journey.flightLabel ? `<br/>${esc(journey.flightLabel)}` : ""}`);
      pts.push([o.lat, o.lng], [d.lat, d.lng]);

      // flight arc: sampled quadratic between the airports (visual, not geodesic-exact)
      const midLat = (o.lat + d.lat) / 2 + Math.min(18, Math.abs(o.lng - d.lng) * 0.14 + 4);
      const midLng = (o.lng + d.lng) / 2;
      const arc: Array<[number, number]> = [];
      for (let t = 0; t <= 1; t += 1 / 48) {
        const lat = (1 - t) * (1 - t) * o.lat + 2 * (1 - t) * t * midLat + t * t * d.lat;
        const lng = (1 - t) * (1 - t) * o.lng + 2 * (1 - t) * t * midLng + t * t * d.lng;
        arc.push([lat, lng]);
      }
      L.polyline(arc, { color: "#F9A600", weight: 3, opacity: 0.9 }).addTo(map);

      if (journey.hub) {
        mk(journey.hub, "#B08CE1").addTo(map).bindPopup(`<b>${esc(journey.hub.label)}</b><br/>Runway hub`);
        pts.push([journey.hub.lat, journey.hub.lng]);
      }
      if (journey.dropoff) {
        mk(journey.dropoff, "#ADE988").addTo(map)
          .bindPopup(`<b>${esc(journey.dropoff.label)}</b>${journey.courierLabel ? `<br/>${esc(journey.courierLabel)}` : ""}`);
        pts.push([journey.dropoff.lat, journey.dropoff.lng]);
        const start = journey.hub ?? d;
        L.polyline([[start.lat, start.lng], [journey.dropoff.lat, journey.dropoff.lng]],
          { color: "#192227", weight: 3, dashArray: "6 8", opacity: 0.85 }).addTo(map);
      }

      map.fitBounds(L.latLngBounds(pts), { padding: [36, 36] });
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [journey]);

  return <div className="cb-leaflet" ref={elRef} />;
}
