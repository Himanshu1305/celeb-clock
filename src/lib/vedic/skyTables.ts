/**
 * Batch 10 — pure tables and arithmetic for the sky pages (Planets today, Moon phase):
 * no engine imports, so the daily templates (Worker + browser) can use them. The engine
 * side is ./sky.ts; the combustion-orb sources are cited there.
 */
const norm = (x: number) => ((x % 360) + 360) % 360;

export const GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
export type Graha = typeof GRAHAS[number];
export const GRAHA_HI: Record<Graha, string> = { Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangal', Mercury: 'Budh', Jupiter: 'Guru', Venus: 'Shukra', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu' };
export const RASHI_EN = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
export const SIGN_WESTERN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const NAKSHATRA_EN = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

/** Surya Siddhanta combustion orbs (degrees from the Sun) — sources cited in ./sky.ts: [direct, retrograde]. */
export const COMBUST_ORBS: Partial<Record<Graha, [number, number]>> = {
  Mars: [17, 17], Mercury: [14, 12], Jupiter: [11, 11], Venus: [10, 8], Saturn: [15, 15],
};
export const COMBUST_SOURCE = 'Surya Siddhanta distances as quoted by Drik Panchang';

/** Signed distance (−180..180] from the Sun in longitude. */
export function fromSun(lon: number, sunLon: number): number {
  return ((lon - sunLon + 540) % 360) - 180;
}

/** Combust per the orbs above (false for Sun, Moon, Rahu, Ketu). */
export function isCombust(p: Graha, lon: number, sunLon: number, speed: number): boolean {
  const orb = COMBUST_ORBS[p];
  if (!orb) return false;
  return Math.abs(fromSun(lon, sunLon)) < (speed < 0 ? orb[1] : orb[0]);
}

/** Sign, Nakshatra and pada of a sidereal longitude. */
export function placeOf(lon: number): { sign: number; deg: number; nakshatra: number; pada: number } {
  const L = norm(lon);
  const span = 360 / 27;
  return { sign: Math.floor(L / 30), deg: L % 30, nakshatra: Math.floor(L / span) % 27, pada: Math.floor((L % span) / (span / 4)) + 1 };
}


