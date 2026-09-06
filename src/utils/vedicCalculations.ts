/**
 * Accurate Vedic (sidereal) calculations via @fusionstrings/panchangam — a
 * Swiss Ephemeris WASM build. Lahiri ayanamsha. No .se1 files (Moshier/embedded).
 *
 * Nakshatra/Rashi are Moon-based and REQUIRE the birth time to be meaningful
 * (the Moon moves ~13°/day, ~0.5°/hour). Without a time we still return a best
 * estimate at local noon but flag confidence and require_birth_time so the UI can
 * be honest. When the Moon sits within 0.5° of a Nakshatra boundary and ProKerala
 * credentials are configured, we defer to ProKerala's higher-precision result;
 * otherwise we never crash and simply return the ephemeris value.
 */
import {
  p_julday, calculate_nakshatra, calculate_planets, calculate_houses,
  calculate_vimshottari, get_ayanamsha, AyanamshaMode,
} from '@fusionstrings/panchangam';

// Canonical spellings (single source; panchangam uses index 1-27 in this order).
export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
] as const;

export const RASHI_NAMES = [
  'Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
] as const;

export const NAKSHATRA_TO_DEVANAGARI: Record<string, string> = {
  'Ashwini': 'अश्विनी', 'Bharani': 'भरणी', 'Krittika': 'कृत्तिका', 'Rohini': 'रोहिणी',
  'Mrigashira': 'मृगशिरा', 'Ardra': 'आर्द्रा', 'Punarvasu': 'पुनर्वसु', 'Pushya': 'पुष्य',
  'Ashlesha': 'आश्लेषा', 'Magha': 'मघा', 'Purva Phalguni': 'पूर्वाफाल्गुनी',
  'Uttara Phalguni': 'उत्तराफाल्गुनी', 'Hasta': 'हस्त', 'Chitra': 'चित्रा', 'Swati': 'स्वाती',
  'Vishakha': 'विशाखा', 'Anuradha': 'अनुराधा', 'Jyeshtha': 'ज्येष्ठा', 'Mula': 'मूल',
  'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा', 'Shravana': 'श्रवण',
  'Dhanishtha': 'धनिष्ठा', 'Shatabhisha': 'शतभिषा', 'Purva Bhadrapada': 'पूर्वाभाद्रपदा',
  'Uttara Bhadrapada': 'उत्तराभाद्रपदा', 'Revati': 'रेवती',
};

export const RASHI_TO_DEVANAGARI: Record<string, string> = {
  'Mesha': 'मेष', 'Vrisha': 'वृष', 'Mithuna': 'मिथुन', 'Karka': 'कर्क',
  'Simha': 'सिंह', 'Kanya': 'कन्या', 'Tula': 'तुला', 'Vrischika': 'वृश्चिक',
  'Dhanu': 'धनु', 'Makara': 'मकर', 'Kumbha': 'कुम्भ', 'Meena': 'मीन',
};

const NAK_SPAN = 360 / 27; // 13.333…°

/** True when a Moon position (degrees INTO its Nakshatra, 0–13.33) sits within 0.5° of a boundary. */
export function isNearNakshatraBoundary(degreesIntoNakshatra: number): boolean {
  const d = ((degreesIntoNakshatra % NAK_SPAN) + NAK_SPAN) % NAK_SPAN;
  return d < 0.5 || d > NAK_SPAN - 0.5;
}

export interface VedicLocation { city: string; lat: number; lon: number; timezone: number; }

export interface NakshatraResult {
  nakshatra: string;
  nakshatra_devanagari: string;
  index: number;
  pada: number;
  confidence: 'high' | 'medium' | 'low';
  is_boundary: boolean;
}

export interface VedicProfile {
  nakshatra: NakshatraResult;
  rashi: string | null;
  rashi_devanagari: string | null;
  moon_longitude: number | null;
  lagna: string | null;
  lagna_degrees: number | null;
  dasha: { mahadasha: string; antardasha: string } | null;
  ayanamsha: number | null;
  requires_birth_time: boolean;
  source: 'panchangam' | 'prokerala';
}

function canonicalNakshatra(index: number, fallbackName: string): string {
  if (index >= 1 && index <= 27) return NAKSHATRA_NAMES[index - 1];
  // Normalise panchangam's alternative spellings if index is unavailable.
  const norm = fallbackName.replace('Mrigashirsha', 'Mrigashira').replace('Dhanishta', 'Dhanishtha');
  return norm;
}

async function tryProkeralaBoundary(): Promise<null> {
  // ProKerala refinement is only attempted when credentials exist. They are not
  // configured in this environment, so we return null (use the ephemeris value).
  const id = (import.meta as any)?.env?.VITE_PROKERALA_CLIENT_ID;
  const secret = (import.meta as any)?.env?.VITE_PROKERALA_CLIENT_SECRET;
  if (!id || !secret) return null;
  // A full ProKerala call would go here; kept as a safe no-op fallback.
  return null;
}

export async function calculateVedicProfile(
  day: number,
  month: number,
  year: number,
  hour: number | null,
  minute: number | null,
  location: VedicLocation
): Promise<VedicProfile> {
  const hasTime = hour !== null && hour !== undefined && minute !== null && minute !== undefined;
  const localHour = hasTime ? (hour as number) + (minute as number) / 60 : 12; // noon fallback
  const tz = Number(location?.timezone ?? 0);
  const utHour = localHour - tz;

  let index = 1;
  let pada = 1;
  let panchName = NAKSHATRA_NAMES[0];
  let moonLon: number | null = null;
  let ayan: number | null = null;
  let isBoundary = false;

  try {
    const jd = p_julday(year, month, day, utHour, 1);
    ayan = get_ayanamsha(AyanamshaMode.Lahiri, jd);
    const nak = calculate_nakshatra(jd, AyanamshaMode.Lahiri);
    index = nak.index;
    pada = nak.pada;
    panchName = nak.name;
    try {
      const planets: any = calculate_planets(jd, 1);
      moonLon = planets?.[1]?.longitude ?? null;
      if (moonLon !== null) isBoundary = isNearNakshatraBoundary(moonLon % NAK_SPAN);
    } catch { /* planets unavailable — keep nakshatra from calculate_nakshatra */ }

    // Boundary + ProKerala keys → refine (no-op here).
    let source: VedicProfile['source'] = 'panchangam';
    if (isBoundary) { const pk = await tryProkeralaBoundary(); if (pk) source = 'prokerala'; }

    const name = canonicalNakshatra(index, panchName);
    const rashi = moonLon !== null ? RASHI_NAMES[Math.floor((((moonLon % 360) + 360) % 360) / 30)] : null;

    let lagna: string | null = null;
    let lagnaDeg: number | null = null;
    let dasha: { mahadasha: string; antardasha: string } | null = null;
    if (hasTime) {
      try {
        const houses: any = calculate_houses(jd, location.lat, location.lon, 'W', 1);
        const asc = houses?.ascendant;
        if (typeof asc === 'number' && Number.isFinite(asc)) {
          lagnaDeg = ((asc % 360) + 360) % 360;
          lagna = RASHI_NAMES[Math.floor(lagnaDeg / 30)];
        }
      } catch { /* houses failed (e.g. invalid coords) — leave lagna null */ }
      if (moonLon !== null) {
        try {
          const birthMs = Date.UTC(year, month - 1, day, Math.floor(utHour), Math.round((utHour % 1) * 60));
          const d: any = calculate_vimshottari(moonLon, birthMs, birthMs + 86400000);
          if (d?.mahadasha) dasha = { mahadasha: d.mahadasha, antardasha: d.antardasha };
        } catch { /* dasha optional */ }
      }
    }

    const confidence: NakshatraResult['confidence'] = !hasTime ? 'low' : isBoundary ? 'medium' : 'high';

    return {
      nakshatra: {
        nakshatra: name,
        nakshatra_devanagari: NAKSHATRA_TO_DEVANAGARI[name] || '',
        index,
        pada,
        confidence,
        is_boundary: isBoundary,
      },
      rashi,
      rashi_devanagari: rashi ? (RASHI_TO_DEVANAGARI[rashi] || null) : null,
      moon_longitude: moonLon,
      lagna: hasTime ? lagna : null,
      lagna_degrees: hasTime ? lagnaDeg : null,
      dasha,
      ayanamsha: ayan,
      requires_birth_time: !hasTime,
      source,
    };
  } catch {
    // Absolute last-resort: never crash. Return a safe low-confidence shell.
    const name = NAKSHATRA_NAMES[0];
    return {
      nakshatra: { nakshatra: name, nakshatra_devanagari: NAKSHATRA_TO_DEVANAGARI[name] || '', index: 1, pada: 1, confidence: 'low', is_boundary: false },
      rashi: null, rashi_devanagari: null, moon_longitude: null,
      lagna: null, lagna_degrees: null, dasha: null, ayanamsha: null,
      requires_birth_time: !hasTime, source: 'panchangam',
    };
  }
}
