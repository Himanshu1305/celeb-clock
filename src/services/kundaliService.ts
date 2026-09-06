/**
 * Client-side Kundali service. The heavy sidereal computation runs server-side
 * (`/api/kundali`, Node + Swiss Ephemeris); this wrapper fetches it and builds a
 * plain-language interpretation. ProKerala is optional (boundary refinement only).
 */
export interface KundaliPlanet { name: string; sign: string; signIndex: number; house: number; longitude: number; retrograde: boolean }
export interface KundaliData {
  lagna: { sign: string; signIndex: number; degrees: number };
  planets: KundaliPlanet[];
  nakshatra: { nakshatra: string; nakshatra_devanagari: string; pada: number; confidence: string; is_boundary: boolean };
  rashi: string | null;
  rashi_devanagari: string | null;
  dasha: { mahadasha: string; antardasha: string } | null;
  requires_birth_time: boolean;
}

export const hasProkeralaKey = (): boolean =>
  !!(import.meta as any)?.env?.VITE_PROKERALA_CLIENT_ID && !!(import.meta as any)?.env?.VITE_PROKERALA_CLIENT_SECRET;

export async function fetchKundali(
  dob: string, time: string, loc: { lat: number; lon: number; tz: number }
): Promise<KundaliData> {
  const [y, m, d] = dob.split('-');
  const [h, min] = time.split(':');
  const params = new URLSearchParams({ y, m, d, h, min, lat: String(loc.lat), lon: String(loc.lon), tz: String(loc.tz) });
  const res = await fetch(`/api/kundali?${params.toString()}`);
  if (!res.ok) throw new Error('Kundali service unavailable');
  const data = await res.json();
  if (!data?.lagna?.sign) throw new Error('Incomplete Kundali data');
  return data as KundaliData;
}

export function buildInterpretation(k: KundaliData): string {
  const moon = k.planets.find(p => p.name === 'Moon');
  const sun = k.planets.find(p => p.name === 'Sun');
  const parts: string[] = [];
  parts.push(`With ${k.lagna.sign} rising (Lagna), your outward personality and life approach are coloured by ${k.lagna.sign}'s qualities.`);
  if (k.rashi) parts.push(`Your Moon sits in ${k.rashi} Rashi${k.nakshatra?.nakshatra ? ` (${k.nakshatra.nakshatra} Nakshatra, pada ${k.nakshatra.pada})` : ''}, shaping your emotional nature and instincts.`);
  if (sun) parts.push(`The Sun in house ${sun.house} points to where your core identity and vitality express most strongly.`);
  if (moon) parts.push(`The Moon in house ${moon.house} indicates the areas of life you are most emotionally invested in.`);
  if (k.dasha) parts.push(`You are currently in your ${k.dasha.mahadasha} Mahadasha / ${k.dasha.antardasha} Antardasha — the planetary period steering this chapter of your life.`);
  parts.push('This is a computed sidereal (Lahiri) reading; a full consultation would weigh aspects, yogas and divisional charts.');
  return parts.join(' ');
}
