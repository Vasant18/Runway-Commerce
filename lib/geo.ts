// Synthetic geo reference data: major airports/cities used across trips, requests,
// and the journey maps. Coordinates are real; everything else in the demo is synthetic.

export type Airport = {
  iata: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
};

export const AIRPORTS: Airport[] = [
  { iata: "JFK", city: "New York", country: "USA", lat: 40.6413, lng: -73.7781 },
  { iata: "SFO", city: "San Francisco", country: "USA", lat: 37.6213, lng: -122.379 },
  { iata: "LHR", city: "London", country: "UK", lat: 51.47, lng: -0.4543 },
  { iata: "CDG", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479 },
  { iata: "FRA", city: "Frankfurt", country: "Germany", lat: 50.0379, lng: 8.5622 },
  { iata: "AMS", city: "Amsterdam", country: "Netherlands", lat: 52.3105, lng: 4.7683 },
  { iata: "DXB", city: "Dubai", country: "UAE", lat: 25.2532, lng: 55.3657 },
  { iata: "SIN", city: "Singapore", country: "Singapore", lat: 1.3644, lng: 103.9915 },
  { iata: "NRT", city: "Tokyo", country: "Japan", lat: 35.7719, lng: 140.3929 },
  { iata: "ICN", city: "Seoul", country: "South Korea", lat: 37.4602, lng: 126.4407 },
  { iata: "SYD", city: "Sydney", country: "Australia", lat: -33.9399, lng: 151.1753 },
  { iata: "BLR", city: "Bengaluru", country: "India", lat: 13.1986, lng: 77.7066 },
  { iata: "BOM", city: "Mumbai", country: "India", lat: 19.0896, lng: 72.8656 },
  { iata: "DEL", city: "Delhi", country: "India", lat: 28.5562, lng: 77.1 },
  { iata: "GRU", city: "São Paulo", country: "Brazil", lat: -23.4356, lng: -46.4731 },
  { iata: "YYZ", city: "Toronto", country: "Canada", lat: 43.6777, lng: -79.6248 },
];

export function airportByIata(iata: string | null | undefined): Airport | null {
  if (!iata) return null;
  return AIRPORTS.find(a => a.iata === iata.trim().toUpperCase()) ?? null;
}

// Equirectangular projection into an SVG viewBox of W×H.
// lng -180..180 → x 0..W ; lat 90..-90 → y 0..H
export function projectToSvg(lat: number, lng: number, w: number, h: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}
