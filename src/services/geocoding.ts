/**
 * Geocoding for birth-city input. 24+ Indian cities are cached for instant,
 * offline-safe resolution; anything else falls back to OpenStreetMap Nominatim
 * (best-effort, never throws — returns [] on failure).
 */
export interface GeoResult {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffset: number;
}

const IST = { timezone: 'Asia/Kolkata', utcOffset: 5.5, country: 'India' };

interface CityDef { name: string; state: string; lat: number; lon: number; aliases?: string[]; }

const CITIES: CityDef[] = [
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, aliases: ['new delhi'] },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, aliases: ['bombay'] },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, aliases: ['bangalore'] },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, aliases: ['madras'] },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, aliases: ['calcutta'] },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, aliases: ['cochin'] },
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lon: 77.0266, aliases: ['gurugram'] },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
  { name: 'Vadnagar', state: 'Gujarat', lat: 23.7867, lon: 72.6367 },
  { name: 'Allahabad', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, aliases: ['prayagraj'] },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
];

// Build a lookup: canonical name + aliases → def.
const LOOKUP = new Map<string, CityDef>();
for (const c of CITIES) {
  LOOKUP.set(c.name.toLowerCase(), c);
  (c.aliases || []).forEach(a => LOOKUP.set(a.toLowerCase(), c));
}
// Explicit alias for "New Delhi" (space) and "Prayagraj" resolve above; ensure
// "prayagraj" maps to Allahabad's coords (same city).

const toResult = (c: CityDef): GeoResult => ({
  name: c.name, state: c.state, ...IST, lat: c.lat, lon: c.lon,
});

async function nominatim(query: string): Promise<GeoResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { headers: { 'User-Agent': 'BornClock/1.0' }, signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    return rows.map(r => ({
      name: (r.display_name || query).split(',')[0].trim(),
      country: (r.display_name || '').split(',').pop()?.trim() || 'Unknown',
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      // Assume IST for Indian results; consumers can override for non-India.
      timezone: 'Asia/Kolkata',
      utcOffset: 5.5,
    })).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lon));
  } catch {
    return [];
  }
}

export async function geocodeCity(query: string): Promise<GeoResult[]> {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const cached = LOOKUP.get(q);
  if (cached) return [toResult(cached)];
  // Partial prefix match against cached cities before hitting the network.
  const prefix = CITIES.find(c => c.name.toLowerCase().startsWith(q) || (c.aliases || []).some(a => a.startsWith(q)));
  if (prefix && q.length >= 3) return [toResult(prefix)];
  return nominatim(query);
}
