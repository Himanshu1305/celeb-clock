/**
 * Adapters mapping the engine-agnostic BirthChartResult onto the EXACT legacy
 * JSON shapes that /api/kundali and /api/vedic-profile have always returned.
 *
 * This is what lets the local engine slot under the existing API contract
 * without touching any of the ~15 downstream consumers (KundaliPage,
 * KundaliChart, BirthTimeVedicSection, KundaliMatchPage, BabyNamesPage,
 * AccuracyDashboard, birthday-report flow) or breaking the shared
 * vedic_chart_cache — cached ProKerala entries and freshly-computed local
 * entries have identical shapes.
 */
import type { BirthChartResult } from './calculateBirthChart';

// Short-form Rashi names, matching the convention already used by api/kundali.ts
// and api/vedic-profile.ts (note "Vrisha", not the engine's "Vrishabha").
const RASHI_SHORT = ['Mesha','Vrisha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];

const NK_DEV: Record<string, string> = {'Ashwini':'अश्विनी','Bharani':'भरणी','Krittika':'कृत्तिका','Rohini':'रोहिणी','Mrigashira':'मृगशिरा','Ardra':'आर्द्रा','Punarvasu':'पुनर्वसु','Pushya':'पुष्य','Ashlesha':'आश्लेषा','Magha':'मघा','Purva Phalguni':'पूर्वाफाल्गुनी','Uttara Phalguni':'उत्तराफाल्गुनी','Hasta':'हस्त','Chitra':'चित्रा','Swati':'स्वाती','Vishakha':'विशाखा','Anuradha':'अनुराधा','Jyeshtha':'ज्येष्ठा','Mula':'मूल','Purva Ashadha':'पूर्वाषाढ़ा','Uttara Ashadha':'उत्तराषाढ़ा','Shravana':'श्रवण','Dhanishtha':'धनिष्ठा','Shatabhisha':'शतभिषा','Purva Bhadrapada':'पूर्वाभाद्रपदा','Uttara Bhadrapada':'उत्तराभाद्रपदा','Revati':'रेवती'};
const RASHI_DEV: Record<string, string> = {'Mesha':'मेष','Vrisha':'वृष','Mithuna':'मिथुन','Karka':'कर्क','Simha':'सिंह','Kanya':'कन्या','Tula':'तुला','Vrischika':'वृश्चिक','Dhanu':'धनु','Makara':'मकर','Kumbha':'कुम्भ','Meena':'मीन'};

function round2(n: number): number { return Math.round(n * 100) / 100; }
function shortSign(signIndex1Based: number): string { return RASHI_SHORT[signIndex1Based - 1] || 'Unknown'; }

/** Map BirthChartResult → the /api/kundali response shape. */
export function toKundaliLegacy(r: BirthChartResult) {
  const moonSign = shortSign(r.planets.find(p => p.name === 'Moon')!.signIndex);
  return {
    lagna: {
      sign: shortSign(r.lagna.signIndex),
      signIndex: r.lagna.signIndex,
      degrees: round2(r.lagna.rashiIndex * 30 + r.lagna.degrees),
    },
    planets: r.planets.map(p => ({
      name: p.name,
      sign: shortSign(p.signIndex),
      signIndex: p.signIndex,
      house: p.house,
      longitude: round2(p.longitude),
      retrograde: p.retrograde,
    })),
    nakshatra: {
      nakshatra: r.nakshatra.nakshatra,
      nakshatra_devanagari: NK_DEV[r.nakshatra.nakshatra] || r.nakshatra.nakshatra,
      pada: r.nakshatra.pada,
      confidence: 'high',
      is_boundary: false,
    },
    rashi: moonSign,
    rashi_devanagari: RASHI_DEV[moonSign] || null,
    dasha: r.currentDasha,
    requires_birth_time: false,
    // Warnings (e.g. POLAR_LATITUDE) are passed through so the UI can surface a
    // banner. Empty array for normal charts — additive, does not break consumers.
    warnings: r.warnings,
    source: r.source,
  };
}

/** Map BirthChartResult → the /api/vedic-profile response shape. */
export function toVedicProfileLegacy(r: BirthChartResult, hasBirthTime: boolean) {
  const moonSign = shortSign(r.planets.find(p => p.name === 'Moon')!.signIndex);
  return {
    nakshatra: {
      nakshatra: r.nakshatra.nakshatra,
      nakshatra_devanagari: NK_DEV[r.nakshatra.nakshatra] || r.nakshatra.nakshatra,
      pada: r.nakshatra.pada,
      lord: r.nakshatra.lord,
      confidence: hasBirthTime ? 'high' : 'low',
      is_boundary: false,
      calculation_method: 'local-engine',
    },
    rashi: moonSign,
    rashi_devanagari: RASHI_DEV[moonSign] || moonSign,
    // Legacy returned lagna:null for date-only; with birth time we can now
    // supply it locally (a strict, non-breaking improvement).
    lagna: hasBirthTime ? { sign: shortSign(r.lagna.signIndex), signIndex: r.lagna.signIndex, degrees: round2(r.lagna.rashiIndex * 30 + r.lagna.degrees) } : null,
    dasha: hasBirthTime ? r.currentDasha : null,
    requires_birth_time: !hasBirthTime,
    input_summary: hasBirthTime ? 'Calculated with birth time (local engine)' : 'Date-only approximation (local engine)',
    warnings: r.warnings,
    source: r.source,
  };
}
