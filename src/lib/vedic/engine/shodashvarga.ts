/**
 * Shodashvarga — all sixteen Parashari divisional charts (Batch 7, W3).
 *
 * Source for every rule: Brihat Parashara Hora Shastra (BPHS), ch. 6 "The Sixteen
 * Divisions of a Rasi" (vv. 5–41), as opened on 25 Oct 2026 at
 * https://archive.org/stream/ParasharaHoraSastra/BrihatParasharaHoraSastraVedicAstrologyEbook_djvu.txt
 * (cross-checked for D16/D20 against the Sanskrit of BPHS 6.16–6.17 at
 * enjoylearningsanskrit.com). Each varga below reuses the engine's existing,
 * BPHS-checked sign function — no new formula is introduced here:
 *
 *   D1  Rashi            the sign itself
 *   D2  Hora             PARASHARI: odd sign 0–15° Sun (Leo), 15–30° Moon (Cancer); even reversed
 *                        (BPHS 6.5–6.6). Not the "continuous"/Kashinatha hora some software offers.
 *   D3  Drekkana         PARASHARI: 1st, 5th, 9th from the sign (BPHS 6.7–6.8). Not Jagannatha/Somnath.
 *   D4  Chaturthamsha    1st, 4th, 7th, 10th from the sign (BPHS 6.9)
 *   D7  Saptamsha        odd: from the sign; even: from the 7th (BPHS 6.10–6.11)
 *   D9  Navamsha         movable: itself; fixed: 9th; dual: 5th (BPHS 6.12)
 *   D10 Dashamsha        odd: from the sign; even: from the 9th (BPHS 6.13–6.14)
 *   D12 Dwadashamsha     from the sign itself (BPHS 6.15)
 *   D16 Shodashamsha     movable: Aries; fixed: Leo; dual: Sagittarius (BPHS 6.16)
 *   D20 Vimshamsha       movable: Aries; fixed: Sagittarius; dual: Leo (BPHS 6.17–6.21)
 *   D24 Chaturvimshamsha odd: Leo; even: Cancer (BPHS 6.22–6.23)
 *   D27 Saptavimshamsha  fire: Aries; earth: Cancer; air: Libra; water: Capricorn (BPHS 6.24–6.26)
 *   D30 Trimshamsha      odd: Mars 5°, Saturn 5°, Jupiter 8°, Mercury 7°, Venus 5° (Aries, Aquarius,
 *                        Sagittarius, Gemini, Libra); even reversed (Taurus, Virgo, Pisces, Capricorn,
 *                        Scorpio) (BPHS 6.27–6.28)
 *   D40 Khavedamsha      odd: Aries; even: Libra (BPHS 6.29–6.30)
 *   D45 Akshavedamsha    movable: Aries; fixed: Leo; dual: Sagittarius (BPHS 6.31–6.32)
 *   D60 Shashtyamsha     degrees in sign × 2, integer part mod 12, + 1, counted from the sign itself
 *                        (BPHS 6.33–6.41). Other schools differ — the UI carries a disclaimer.
 *
 * Birth-time sensitivity: the chart is recomputed at birth − 5 min and birth + 5 min; any
 * point (Lagna or planet) whose sign in a varga differs at either end is flagged for
 * that varga, so the UI can say "this chart could change within ±5 minutes".
 */
import {
  calculateLagna, getSiderealLongitude, getHoraSign, getDrekkanaSign, getChaturthamsaSign,
  getSaptamsaSign, getNavamsaSign, getDasamsaSign, getDwadasamsaSign, getShodasamsaSign,
  getVimsamsaSign, getChaturvimsamsaSign, getSaptavimsamsaSign, getTrimsamsaSign,
  getKhavedamsaSign, getAkshavedamsaSign, getShastiamsaSign, RASHI_NAMES,
} from './vedicEngine';

export type VargaKey =
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12'
  | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';

const idx = (name: string) => RASHI_NAMES.indexOf(name);

/** 0-based varga sign index for a sidereal longitude, per varga. */
export const VARGA_SIGN_FN: Record<VargaKey, (lon: number) => number> = {
  D1: (l) => Math.floor((((l % 360) + 360) % 360) / 30),
  D2: (l) => getHoraSign(l).horaSignIndex,
  D3: (l) => getDrekkanaSign(l).drekkanaSignIndex,
  D4: (l) => getChaturthamsaSign(l).chaturthamsaSignIndex,
  D7: (l) => getSaptamsaSign(l).saptamsaSignIndex,
  D9: (l) => getNavamsaSign(l).navamsaSignIndex,
  D10: (l) => getDasamsaSign(l).dasamsaSignIndex,
  D12: (l) => getDwadasamsaSign(l).dwadasamsaSignIndex,
  D16: (l) => getShodasamsaSign(l).shodasamsaSignIndex,
  D20: (l) => getVimsamsaSign(l).vimsamsaSignIndex,
  D24: (l) => getChaturvimsamsaSign(l).chaturvimsamsaSignIndex,
  D27: (l) => getSaptavimsamsaSign(l).saptavimsamsaSignIndex,
  D30: (l) => idx(getTrimsamsaSign(l).trimsamsaSign),
  D40: (l) => getKhavedamsaSign(l).khavedamsaSignIndex,
  D45: (l) => getAkshavedamsaSign(l).akshavedamsaSignIndex,
  D60: (l) => getShastiamsaSign(l).shastiamsaSignIndex,
};

export const VARGA_KEYS: VargaKey[] = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

export const SHODASHVARGA_POINTS = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
const GRAHAS = SHODASHVARGA_POINTS.filter(p => p !== 'Lagna');

/** One divisional chart, in the same shape the D1 chart component draws (1-based signs). */
export interface ShodashvargaChart {
  key: VargaKey;
  division: number;
  lagnaSignIndex: number;
  planets: Array<{ name: string; signIndex: number; house: number }>;
  /** Points whose sign in THIS varga changes if birth is 5 minutes earlier or later. */
  timeSensitive: string[];
}

/** Sidereal longitudes of Lagna + 9 grahas at an instant (same engine path as the chart). */
export function pointLongitudes(dateUTC: Date, latitude: number, longitude: number): Record<string, number> {
  const out: Record<string, number> = { Lagna: calculateLagna(dateUTC, latitude, longitude).ascSidereal };
  for (const g of GRAHAS) out[g] = getSiderealLongitude(g, dateUTC);
  return out;
}

/** Build one varga chart from point longitudes. */
export function buildVargaChart(key: VargaKey, lons: Record<string, number>, timeSensitive: string[] = []): ShodashvargaChart {
  const fn = VARGA_SIGN_FN[key];
  const lagnaSignIndex = fn(lons.Lagna) + 1;
  const planets = GRAHAS.filter(g => Number.isFinite(lons[g])).map(g => {
    const signIndex = fn(lons[g]) + 1;
    return { name: g, signIndex, house: ((signIndex - lagnaSignIndex + 12) % 12) + 1 };
  });
  return { key, division: Number(key.slice(1)), lagnaSignIndex, planets, timeSensitive };
}

const FIVE_MIN_MS = 5 * 60 * 1000;

/**
 * All sixteen vargas for a birth. `lons` are the chart's own longitudes (so every varga
 * agrees exactly with the D1/D9/D10 already shown); the ±5-minute charts are only used
 * to decide the time-sensitivity flags.
 */
export function buildShodashvarga(
  birthDateUTC: Date, latitude: number, longitude: number, lons: Record<string, number>,
): ShodashvargaChart[] {
  let early: Record<string, number> | null = null;
  let late: Record<string, number> | null = null;
  try {
    early = pointLongitudes(new Date(birthDateUTC.getTime() - FIVE_MIN_MS), latitude, longitude);
    late = pointLongitudes(new Date(birthDateUTC.getTime() + FIVE_MIN_MS), latitude, longitude);
  } catch { /* sensitivity is a nicety — never fail the chart over it */ }
  return VARGA_KEYS.map(key => {
    const fn = VARGA_SIGN_FN[key];
    const sensitive: string[] = [];
    if (early && late) {
      for (const p of SHODASHVARGA_POINTS) {
        const now = fn(lons[p]);
        if (fn(early[p]) !== now || fn(late[p]) !== now) sensitive.push(p);
      }
    }
    return buildVargaChart(key, lons, sensitive);
  });
}
