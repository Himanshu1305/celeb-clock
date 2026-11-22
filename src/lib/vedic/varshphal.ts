/**
 * Varshphal (Tajik annual chart / yearly horoscope) — B18, Nov 2026.
 *
 * Pure computation (no network): Node, the Cloudflare Worker and vitest all run it.
 * Every position is sidereal Lahiri with the NATAL convention (true Lahiri, Swiss
 * SIDM_LAHIRI incl. nutation = AstroSage; see getNatalAyanamsa), because the annual
 * chart is a return of the NATAL Sun and AstroSage computes it that way.
 *
 * Classical rules used (cited; none are invented here):
 *  [AIFAS]  Dr. S.P. Gour, "Varshaphal (Annual Prediction)", All India Federation of
 *           Astrologers' Societies — https://ia800104.us.archive.org/22/items/AIFASBooks/Varshphal%20Eng%20AIFAS.pdf
 *           (Pancha-adhikaris + Varshesh rule, Tri-rashi table, Dina-Ratri pati, Muntha,
 *           Mudda dasha, Sahams + the add-one-sign rule, Harsha bala, Pancha-vargiya point
 *           values, Tajik aspects, Deeptamsha orbs, Ithasala/Ishrafa/Nakta/Yamaya/Kamboola).
 *  [HR]     Balabhadra, Hayanaratna (tr. M. Gansten, "The Jewel of Annual Astrology",
 *           Brill 2020, CC BY) — https://library.oapen.org/bitstream/20.500.12657/42540/1/9789004433717.pdf
 *           (Tajika terms/hadda table, Graeco-Arabic decan lords, five-dignity values 30/20/15/10/5,
 *           aspect-based friendship 3-5-9-11 / 1-4-7-10 / 2-6-8-12).
 *  [API]    astrologyapi.com varshaphal_mudda_dasha reference response — https://astrologyapi.com/docs/api-ref/84/varshaphal_mudda_dasha
 *           (Mudda dasha = 360 nominal days spread over the real year, Sun 18 … Venus 60).
 *
 * Validated against an independent pyswisseph implementation (scripts/varshphal/varshphal_ref.py
 * → src/lib/vedic/__tests__/fixtures/varshphalSwiss.json) and against the published
 * AIFAS worked examples (src/lib/vedic/__tests__/varshphal.test.ts).
 */
import * as Astronomy from 'astronomy-engine';
import {
  calculateLagna, getNavamsaSign, getSiderealLongitude, getNatalAyanamsa, normalize360, RASHI_NAMES, NAKSHATRA_NAMES,
} from './engine/vedicEngine';
import { preciseSunGeoVector } from './engine/vsop87Earth';
import { offsetSecondsAt, formatUtcOffset } from '../timezone/birthTimezone';

export const SIGN_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'] as const;
export const SEVEN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type Planet7 = typeof SEVEN[number];
const ALL_POINTS = [...SEVEN, 'Rahu', 'Ketu'] as const;

const DAY_MS = 86400000;
const sgn = (lon: number) => Math.floor(normalize360(lon) / 30);
const houseFrom = (fromSign: number, sign: number) => ((sign - fromSign + 12) % 12) + 1;
const wrap180 = (d: number) => ((d % 360) + 540) % 360 - 180;

// ── Tajik constants ─────────────────────────────────────────────────────────
/** Deeptamsha (orbs) [AIFAS]: Sun 15, Moon 12, Mars 8, Mercury 7, Venus 7, Jupiter 9, Saturn 9. */
export const DEEPTAMSHA: Record<Planet7, number> = { Sun: 15, Moon: 12, Mars: 8, Mercury: 7, Jupiter: 9, Venus: 7, Saturn: 9 };
/** Natural speed order, fastest first [AIFAS: Moon > Sun > Mars > Jupiter; Mercury/Venus between Moon and Sun]. */
export const SPEED_ORDER: Planet7[] = ['Moon', 'Mercury', 'Venus', 'Sun', 'Mars', 'Jupiter', 'Saturn'];
const faster = (a: Planet7, b: Planet7) => SPEED_ORDER.indexOf(a) < SPEED_ORDER.indexOf(b);

/** Tajik aspect by house distance [AIFAS]. 2/12 and 6/8 = no aspect. */
export type TajikAspectKind = 'open-friendly' | 'secret-friendly' | 'open-inimical' | 'secret-inimical' | 'none';
export function tajikAspect(houseDistance: number): TajikAspectKind {
  if (houseDistance === 5 || houseDistance === 9) return 'open-friendly';
  if (houseDistance === 3 || houseDistance === 11) return 'secret-friendly';
  if (houseDistance === 1 || houseDistance === 7) return 'open-inimical';
  if (houseDistance === 4 || houseDistance === 10) return 'secret-inimical';
  return 'none';
}
/** "Beneficence" of an aspect to the Lagna, as printed in AIFAS (only used to break ties). */
const ASPECT_BENEFICENCE: Record<number, number> = { 5: 75, 9: 75, 3: 65, 11: 35, 4: 25, 10: 25, 1: 10, 7: 10 };

/** Tri-rashi pati by Varsha Lagna sign (0 = Aries) for day / night [AIFAS table]. */
export const TRI_RASHI_DAY: Planet7[] = ['Sun', 'Venus', 'Saturn', 'Venus', 'Jupiter', 'Moon', 'Mercury', 'Mars', 'Saturn', 'Mars', 'Jupiter', 'Moon'];
export const TRI_RASHI_NIGHT: Planet7[] = ['Jupiter', 'Moon', 'Mercury', 'Mars', 'Sun', 'Venus', 'Saturn', 'Venus', 'Saturn', 'Mars', 'Jupiter', 'Moon'];

/** Tajika terms (hadda) [HR]: [lord, degrees] in order for each sign. Sun/Moon never rule a term. */
export const HADDA: Array<Array<[Planet7, number]>> = [
  [['Jupiter', 6], ['Venus', 6], ['Mercury', 8], ['Mars', 5], ['Saturn', 5]],
  [['Venus', 8], ['Mercury', 6], ['Jupiter', 8], ['Saturn', 5], ['Mars', 3]],
  [['Mercury', 6], ['Venus', 6], ['Jupiter', 5], ['Mars', 7], ['Saturn', 6]],
  [['Mars', 7], ['Venus', 6], ['Mercury', 6], ['Jupiter', 7], ['Saturn', 4]],
  [['Jupiter', 6], ['Venus', 5], ['Saturn', 7], ['Mercury', 6], ['Mars', 6]],
  [['Mercury', 7], ['Venus', 10], ['Jupiter', 4], ['Mars', 7], ['Saturn', 2]],
  [['Saturn', 6], ['Mercury', 8], ['Jupiter', 7], ['Venus', 7], ['Mars', 2]],
  [['Mars', 7], ['Venus', 4], ['Mercury', 8], ['Jupiter', 5], ['Saturn', 6]],
  [['Jupiter', 12], ['Venus', 5], ['Mercury', 4], ['Mars', 5], ['Saturn', 4]],
  [['Mercury', 7], ['Jupiter', 7], ['Venus', 8], ['Saturn', 4], ['Mars', 4]],
  [['Mercury', 7], ['Venus', 6], ['Jupiter', 7], ['Mars', 5], ['Saturn', 5]],
  [['Venus', 12], ['Jupiter', 4], ['Mercury', 3], ['Mars', 9], ['Saturn', 2]],
];
/** Graeco-Arabic decan lords [HR] (Chaldean order, Mars-Sun-Venus for Aries …). */
const CHALDEAN: Planet7[] = ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'];
export function decanLord(lon: number): Planet7 {
  const idx = Math.floor(normalize360(lon) / 10); // 0..35
  return CHALDEAN[idx % 7];
}
export function haddaLord(lon: number): Planet7 {
  const s = sgn(lon); const d = normalize360(lon) - s * 30;
  let acc = 0;
  for (const [lord, span] of HADDA[s]) { acc += span; if (d < acc) return lord; }
  return HADDA[s][4][0];
}

const OWN_SIGNS: Record<Planet7, number[]> = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
const EXALT_SIGN: Record<Planet7, number> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
/** Deep exaltation points (BPHS); debilitation = +180°. */
const EXALT_DEG: Record<Planet7, number> = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };

// ── Strength ────────────────────────────────────────────────────────────────
/** Harsha bala [AIFAS]: four tests × 5 units (max 20). */
const HARSHA_HOUSE: Record<Planet7, number> = { Sun: 9, Moon: 3, Mars: 6, Mercury: 1, Jupiter: 11, Venus: 5, Saturn: 12 };
const MALE: Planet7[] = ['Sun', 'Mars', 'Jupiter'];
export interface HarshaBala { sthana: number; uchcha: number; striPurusha: number; divaRatri: number; total: number }
export function harshaBala(p: Planet7, sign: number, house: number, isDay: boolean): HarshaBala {
  const sthana = HARSHA_HOUSE[p] === house ? 5 : 0;
  const uchcha = OWN_SIGNS[p].includes(sign) || EXALT_SIGN[p] === sign ? 5 : 0;
  const maleHouse = [1, 2, 3, 7, 8, 9].includes(house);
  const male = MALE.includes(p);
  // "A planet in a house of the opposite sex gets the bala" [AIFAS].
  const striPurusha = male !== maleHouse ? 5 : 0;
  const divaRatri = (male && isDay) || (!male && !isDay) ? 5 : 0;
  return { sthana, uchcha, striPurusha, divaRatri, total: sthana + uchcha + striPurusha + divaRatri };
}

type Rel = 'own' | 'friend' | 'neutral' | 'enemy';
/** Tajik (aspect-based) friendship [HR scheme 1 / AIFAS]: where the dignity lord sits, counted from the planet. */
function relation(p: Planet7, lord: Planet7, signOf: Record<string, number>): Rel {
  if (p === lord) return 'own';
  const h = houseFrom(signOf[p], signOf[lord]);
  if ([3, 5, 9, 11].includes(h)) return 'friend';
  if ([1, 4, 7, 10].includes(h)) return 'enemy';
  return 'neutral';
}
const REL_FRAC: Record<Rel, number> = { own: 1, friend: 0.75, neutral: 0.5, enemy: 0.25 };

export interface PanchaVargiya { kshetra: number; uchcha: number; hadda: number; drekkana: number; navamsa: number; total80: number; vimshopaka: number }
/** Pancha-vargiya bala [AIFAS values; HR dignities]: house 30, exaltation 20, term 15, decan 10, navamsa 5; ÷4. */
export function panchaVargiya(p: Planet7, lon: number, signOf: Record<string, number>): PanchaVargiya {
  const s = sgn(lon);
  const kshetra = 30 * REL_FRAC[relation(p, SIGN_LORDS[s] as Planet7, signOf)];
  const uchcha = Math.abs(wrap180(lon - (EXALT_DEG[p] + 180))) / 9;
  const hadda = 15 * REL_FRAC[relation(p, haddaLord(lon), signOf)];
  const drekkana = 10 * REL_FRAC[relation(p, decanLord(lon), signOf)];
  const nav = getNavamsaSign(normalize360(lon)).navamsaSignIndex;
  const navamsa = 5 * REL_FRAC[relation(p, SIGN_LORDS[nav] as Planet7, signOf)];
  const total80 = kshetra + uchcha + hadda + drekkana + navamsa;
  return { kshetra, uchcha: +uchcha.toFixed(3), hadda, drekkana, navamsa, total80: +total80.toFixed(3), vimshopaka: +(total80 / 4).toFixed(3) };
}

// ── ΔT ──────────────────────────────────────────────────────────────────────
/**
 * astronomy-engine extrapolates ΔT (TT − UT) with the Espenak–Meeus polynomial, which runs
 * ahead of the Earth's real rotation after ~2005 (+6.2 s in 2026). A 6 s error in TT moves the
 * Sun by ~0.25″ — i.e. the Varsha Pravesh by ~6 s. Here every POSITION is evaluated at the TT
 * implied by Swiss Ephemeris 2.10.03 `swe_deltat` (IERS-observed values, then Swiss's own
 * extrapolation), tabulated for 1 Jan 2005…2036; before 2005 the two models agree to < 0.1 s
 * and no correction is applied. Sidereal time (Lagna) still uses the true UT.
 */
const SWISS_DT_2005: number[] = [64.69, 64.85, 65.15, 65.46, 65.78, 66.07, 66.32, 66.6, 66.91, 67.28, 67.64, 68.1, 68.59, 68.97, 69.22, 69.36, 69.36, 69.29, 69.18, 69.1, 69.0, 68.9, 68.8, 68.8, 69.04, 69.28, 69.52, 69.76, 70.01, 70.26, 70.51, 70.76];
function deltaTCorrectionMs(d: Date): number {
  const y = d.getUTCFullYear() + (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / (365.25 * DAY_MS);
  if (y < 2005) return 0;
  const i = Math.min(Math.floor(y - 2005), SWISS_DT_2005.length - 2);
  const f = Math.min(y - 2005 - i, 1);
  const swiss = SWISS_DT_2005[i] + f * (SWISS_DT_2005[i + 1] - SWISS_DT_2005[i]);
  const t = Astronomy.MakeTime(d);
  const ae = (t.tt - t.ut) * 86400;
  // Past 2036 keep the 2036 offset (both models are extrapolations there).
  return (swiss - ae) * 1000;
}
/** The UT instant at which astronomy-engine's TT equals the Swiss-ΔT TT of `d`. */
const ttFix = (d: Date) => new Date(d.getTime() + deltaTCorrectionMs(d));

// ── Sun return ──────────────────────────────────────────────────────────────
/** Sidereal Sun (true Lahiri) from the fuller VSOP87B Earth series — the return moment
 *  depends on the Sun to the arc-second (see ./engine/vsop87Earth). */
export function sunSid(utc: Date): number {
  const d = ttFix(utc);
  return normalize360(Astronomy.Ecliptic(preciseSunGeoVector(Astronomy.MakeTime(d))).elon - getNatalAyanamsa(d));
}
/** Any other point (natal-convention sidereal longitude) at the Swiss-ΔT TT of `utc`. */
const posSid = (p: string, utc: Date) => (p === 'Sun' ? sunSid(utc) : getSiderealLongitude(p, ttFix(utc), 'natal'));

/** Exact instant (UTC) the sidereal Sun returns to `natalSun` nearest to `guess`. Secant-refined to < 0.1 s. */
export function solveSunReturn(natalSun: number, guess: Date): Date {
  let t = guess.getTime();
  for (let i = 0; i < 8; i++) {
    const f = wrap180(sunSid(new Date(t)) - natalSun);
    const f2 = wrap180(sunSid(new Date(t + 3600000)) - natalSun);
    const rate = (f2 - f) / 3600000; // deg per ms
    const step = -f / rate;
    t += step;
    if (Math.abs(step) < 50) break;
  }
  return new Date(Math.round(t));
}

/** Varsha Pravesh for the return that completes `completedYears` years of life. */
export function varshaPravesh(birthUTC: Date, natalSun: number, completedYears: number): Date {
  // Sidereal year ≈ 365.2564 days: the anniversary in the Sun's sidereal frame.
  const guess = new Date(birthUTC.getTime() + completedYears * 365.25636 * DAY_MS);
  return solveSunReturn(natalSun, guess);
}

/** Day birth of the year: is the Sun above the horizon at Varsha Pravesh (standard sunrise/sunset)? */
export function isDayAt(utc: Date, lat: number, lon: number): boolean {
  const obs = new Astronomy.Observer(lat, lon, 0);
  try {
    const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, utc, 1.2);
    const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, utc, 1.2);
    if (set && rise) return set.date.getTime() < rise.date.getTime();
  } catch { /* fall through */ }
  const eq = Astronomy.Equator(Astronomy.Body.Sun, utc, obs, true, true);
  return Astronomy.Horizon(utc, obs, eq.ra, eq.dec, 'normal').altitude > -0.2667;
}

// ── Sahams ──────────────────────────────────────────────────────────────────
/** Saham = A − B + C; one sign (30°) is added when C does not fall between B and A
 *  (counted zodiacally from B to A) [AIFAS: "add one rashi"]. */
export function saham(A: number, B: number, C: number): number {
  let s = normalize360(A - B + C);
  const span = normalize360(A - B);
  const posC = normalize360(C - B);
  if (!(posC > 0 && posC < span)) s = normalize360(s + 30);
  return s;
}

export type SahamKey = 'punya' | 'vidya' | 'yasha' | 'mitra' | 'mahatmya' | 'vivaha' | 'karyasiddhi';
export interface SahamResult { key: SahamKey; longitude: number; sign: number; house: number; lord: Planet7; formula: string }

export function computeSahams(L: Record<string, number>, asc: number, isDay: boolean, lagnaSign: number): SahamResult[] {
  const day = isDay;
  const out: SahamResult[] = [];
  const add = (key: SahamKey, A: number, B: number, C: number, formula: string) => {
    const lon = saham(A, B, C);
    out.push({ key, longitude: +lon.toFixed(4), sign: sgn(lon), house: houseFrom(lagnaSign, sgn(lon)), lord: SIGN_LORDS[sgn(lon)] as Planet7, formula });
  };
  // Day formula; reversed (A↔B) at night, except Vivaha [AIFAS].
  const punya = day ? saham(L.Moon, L.Sun, asc) : saham(L.Sun, L.Moon, asc);
  add('punya', day ? L.Moon : L.Sun, day ? L.Sun : L.Moon, asc, day ? 'Moon − Sun + Lagna' : 'Sun − Moon + Lagna');
  add('vidya', day ? L.Sun : L.Moon, day ? L.Moon : L.Sun, asc, day ? 'Sun − Moon + Lagna' : 'Moon − Sun + Lagna');
  add('yasha', day ? L.Jupiter : punya, day ? punya : L.Jupiter, asc, day ? 'Jupiter − Punya + Lagna' : 'Punya − Jupiter + Lagna');
  add('mitra', day ? L.Jupiter : punya, day ? punya : L.Jupiter, L.Venus, day ? 'Jupiter − Punya + Venus' : 'Punya − Jupiter + Venus');
  add('mahatmya', day ? punya : L.Mars, day ? L.Mars : punya, asc, day ? 'Punya − Mars + Lagna' : 'Mars − Punya + Lagna');
  add('vivaha', L.Venus, L.Saturn, asc, 'Venus − Saturn + Lagna');
  const sunLord = SIGN_LORDS[sgn(L.Sun)], moonLord = SIGN_LORDS[sgn(L.Moon)];
  add('karyasiddhi', L.Saturn, day ? L.Sun : L.Moon, day ? L[sunLord] : L[moonLord],
    day ? `Saturn − Sun + ${sunLord} (lord of the Sun’s sign)` : `Saturn − Moon + ${moonLord} (lord of the Moon’s sign)`);
  return out;
}

// ── Mudda dasha ─────────────────────────────────────────────────────────────
/** Vimshottari order counted from the Sun, with Mudda days (3 days per Vimshottari year; total 360) [AIFAS]. */
export const MUDDA_ORDER = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'] as const;
export const MUDDA_DAYS: Record<string, number> = { Sun: 18, Moon: 30, Mars: 21, Rahu: 54, Jupiter: 48, Saturn: 57, Mercury: 51, Ketu: 21, Venus: 60 };
export interface MuddaPeriod { lord: string; start: string; end: string; partial?: 'start' | 'end' }

/** Starting lord: (completed years + janma nakshatra − 2) mod 9, counted from the Sun [AIFAS]. */
export function muddaStartIndex(completedYears: number, nakshatraNumber: number): number {
  const r = ((completedYears + nakshatraNumber - 2) % 9 + 9) % 9; // 1 = Sun … 0 = 9th = Venus
  return (r + 8) % 9;
}

/**
 * Mudda dasha across [vpStart, vpNext): 360 nominal days spread over the real year [API],
 * the first lord running only its natal balance (the Moon's unelapsed part of the birth
 * nakshatra) and its elapsed part closing the year [AIFAS: balance at the start, elapsed at
 * the end]. AIFAS's Indira Gandhi example (Rahu from 14.10.1984 to the next return) follows
 * exactly this. Main periods only: AIFAS gives two competing sub-period methods.
 */
export function muddaDasha(vpStart: Date, vpNext: Date, completedYears: number, nakshatraNumber: number, fractionElapsed: number): MuddaPeriod[] {
  const unit = (vpNext.getTime() - vpStart.getTime()) / 360;
  const i0 = muddaStartIndex(completedYears, nakshatraNumber);
  let cursor = vpStart.getTime() - fractionElapsed * MUDDA_DAYS[MUDDA_ORDER[i0]] * unit;
  const s0 = vpStart.getTime(), end = vpNext.getTime();
  const out: MuddaPeriod[] = [];
  for (let k = 0; k < 10 && cursor < end - 1000; k++) {
    const lord = MUDDA_ORDER[(i0 + k) % 9];
    const s = cursor, e = cursor + MUDDA_DAYS[lord] * unit;
    const rec: MuddaPeriod = { lord, start: new Date(Math.max(s, s0)).toISOString(), end: new Date(Math.min(e, end)).toISOString() };
    if (s < s0 - 1000) rec.partial = 'start';
    else if (e > end + 1000) rec.partial = 'end';
    out.push(rec);
    cursor = e;
  }
  return out;
}

// ── Tajik yogas ─────────────────────────────────────────────────────────────
export type TajikYogaKind = 'ithasala' | 'ishrafa' | 'nakta' | 'yamaya' | 'kamboola';
export interface TajikYoga {
  kind: TajikYogaKind; planets: Planet7[]; via?: Planet7;
  /** Degree gap within the sign (slower − faster) for Ithasala/Ishrafa. */
  gap?: number; orb?: number; poorna?: boolean; aspect?: TajikAspectKind;
}
const degIn = (lon: number) => normalize360(lon) % 30;

/** Ithasala / Ishrafa between two planets [AIFAS]: mutual Tajik aspect, |Δdeg| within the mean
 *  Deeptamsha; faster BEHIND the slower = Ithasala (applying), faster AHEAD = Ishrafa (separating). */
export function pairYoga(a: Planet7, b: Planet7, L: Record<string, number>): TajikYoga | null {
  const [f, s] = faster(a, b) ? [a, b] : [b, a];
  const asp = tajikAspect(houseFrom(sgn(L[f]), sgn(L[s])));
  if (asp === 'none') return null;
  const orb = (DEEPTAMSHA[f] + DEEPTAMSHA[s]) / 2;
  const gap = degIn(L[s]) - degIn(L[f]);
  if (Math.abs(gap) > orb) return null;
  const kind: TajikYogaKind = gap >= 0 ? 'ithasala' : 'ishrafa';
  return { kind, planets: [f, s], gap: +gap.toFixed(2), orb, poorna: kind === 'ithasala' && gap <= 1, aspect: asp };
}

export function tajikYogas(L: Record<string, number>): TajikYoga[] {
  const out: TajikYoga[] = [];
  const pairs: Array<[Planet7, Planet7]> = [];
  for (let i = 0; i < SEVEN.length; i++) for (let j = i + 1; j < SEVEN.length; j++) pairs.push([SEVEN[i], SEVEN[j]]);
  const ith = new Map<string, TajikYoga>();
  for (const [a, b] of pairs) {
    const y = pairYoga(a, b, L);
    if (y) { out.push(y); if (y.kind === 'ithasala') ith.set([a, b].sort().join('|'), y); }
  }
  const hasIth = (x: Planet7, y: Planet7) => ith.has([x, y].sort().join('|'));
  // Nakta / Yamaya [AIFAS]: A and B have NO mutual aspect; a third planet in Ithasala with both
  // transfers the light — faster than both = Nakta, slower than both = Yamaya.
  for (const [a, b] of pairs) {
    if (tajikAspect(houseFrom(sgn(L[a]), sgn(L[b]))) !== 'none') continue;
    for (const c of SEVEN) {
      if (c === a || c === b || !hasIth(a, c) || !hasIth(b, c)) continue;
      if (faster(c, a) && faster(c, b)) out.push({ kind: 'nakta', planets: [a, b], via: c });
      else if (faster(a, c) && faster(b, c)) out.push({ kind: 'yamaya', planets: [a, b], via: c });
    }
  }
  // Kamboola [AIFAS]: two planets in Ithasala and the Moon in Ithasala with one of them.
  for (const y of out.filter(x => x.kind === 'ithasala')) {
    if (y.planets.includes('Moon')) continue;
    const [p, q] = y.planets;
    if (hasIth('Moon', p) || hasIth('Moon', q)) out.push({ kind: 'kamboola', planets: [p, q], via: 'Moon' });
  }
  return out;
}

// ── Main ────────────────────────────────────────────────────────────────────
export interface VarshphalPlanet { name: string; longitude: number; sign: number; degree: number; house: number; retrograde: boolean; nakshatra: string }
export interface Adhikari { role: 'muntha' | 'janmaLagna' | 'varshaLagna' | 'triRashi' | 'dinRatri'; planet: Planet7 }
export interface Candidate { planet: Planet7; roles: Adhikari['role'][]; aspectsLagna: boolean; houseFromLagna: number; vimshopaka: number }
export interface VarshphalInput {
  birthUTC: Date;
  /** Natal chart location (Lagna). */
  birthLat: number; birthLon: number;
  /** Place the Varshphal is cast for (birth place by default, or current residence). */
  lat: number; lon: number; timezone: string;
  year: number;
}
export interface VarshphalResult {
  year: number; completedYears: number;
  varshaPravesh: { utc: string; local: string; localDate: string; localTime: string; weekday: string; offset: string; timezone: string; isDay: boolean };
  nextVarshaPravesh: string;
  natal: { sunLongitude: number; lagnaSign: number; lagnaLongitude: number; moonNakshatra: string; nakshatraNumber: number; fractionElapsed: number };
  lagna: { longitude: number; sign: number; degree: number; lord: Planet7 };
  planets: VarshphalPlanet[];
  muntha: { sign: number; house: number; lord: Planet7; degree: number };
  adhikaris: Adhikari[];
  candidates: Candidate[];
  varshesh: { planet: Planet7; rule: 'strongest-aspecting' | 'muntha-lord-fallback' };
  harsha: Record<Planet7, HarshaBala>;
  panchaVargiya: Record<Planet7, PanchaVargiya>;
  sahams: SahamResult[];
  yogas: TajikYoga[];
  mudda: MuddaPeriod[];
}

function localParts(utcMs: number, tz: string) {
  const off = offsetSecondsAt(tz, utcMs);
  const w = new Date(utcMs + off * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const localDate = `${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}`;
  const localTime = `${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}:${pad(w.getUTCSeconds())}`;
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][w.getUTCDay()];
  return { localDate, localTime, weekday, offset: formatUtcOffset(off / 3600) };
}

export function computeVarshphal(inp: VarshphalInput): VarshphalResult {
  const birthYear = inp.birthUTC.getUTCFullYear();
  const completedYears = inp.year - birthYear;
  if (completedYears < 1 || completedYears > 120) throw new RangeError('Year must be after the birth year (1 to 120 years of age).');
  const natalSun = sunSid(inp.birthUTC);
  const natalAsc = calculateLagna(inp.birthUTC, inp.birthLat, inp.birthLon).ascSidereal;
  const natalLagnaSign = sgn(natalAsc);
  const natalMoon = posSid('Moon', inp.birthUTC);
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(natalMoon / nakSpan);
  const fractionElapsed = (natalMoon - nakIdx * nakSpan) / nakSpan;

  const vp = varshaPravesh(inp.birthUTC, natalSun, completedYears);
  const vpNext = varshaPravesh(inp.birthUTC, natalSun, completedYears + 1);
  const isDay = isDayAt(vp, inp.lat, inp.lon);

  const asc = calculateLagna(vp, inp.lat, inp.lon).ascSidereal;
  const lagnaSign = sgn(asc);
  const L: Record<string, number> = {};
  const planets: VarshphalPlanet[] = [];
  for (const p of ALL_POINTS) {
    const lon = posSid(p, vp);
    L[p] = lon;
    let retro = p === 'Rahu' || p === 'Ketu';
    if (p !== 'Sun' && p !== 'Moon' && !retro) {
      const a = posSid(p, new Date(vp.getTime() - 3 * 3600000));
      const b = posSid(p, new Date(vp.getTime() + 3 * 3600000));
      retro = wrap180(b - a) < 0;
    }
    planets.push({ name: p, longitude: +lon.toFixed(4), sign: sgn(lon), degree: +(lon % 30).toFixed(4), house: houseFrom(lagnaSign, sgn(lon)), retrograde: retro, nakshatra: NAKSHATRA_NAMES[Math.floor(lon / nakSpan)] });
  }
  const signOf: Record<string, number> = Object.fromEntries(planets.map(p => [p.name, p.sign]));

  const harsha = {} as Record<Planet7, HarshaBala>;
  const pvb = {} as Record<Planet7, PanchaVargiya>;
  for (const p of SEVEN) {
    harsha[p] = harshaBala(p, signOf[p], houseFrom(lagnaSign, signOf[p]), isDay);
    pvb[p] = panchaVargiya(p, L[p], signOf);
  }

  // Muntha [AIFAS]: (completed years + janma Lagna rashi) — one sign per year from the natal Lagna.
  const munthaSign = (natalLagnaSign + completedYears) % 12;
  const muntha = { sign: munthaSign, house: houseFrom(lagnaSign, munthaSign), lord: SIGN_LORDS[munthaSign] as Planet7, degree: +(natalAsc % 30).toFixed(4) };

  // Pancha-adhikaris [AIFAS].
  const adhikaris: Adhikari[] = [
    { role: 'muntha', planet: muntha.lord },
    { role: 'janmaLagna', planet: SIGN_LORDS[natalLagnaSign] as Planet7 },
    { role: 'varshaLagna', planet: SIGN_LORDS[lagnaSign] as Planet7 },
    { role: 'triRashi', planet: (isDay ? TRI_RASHI_DAY : TRI_RASHI_NIGHT)[lagnaSign] },
    { role: 'dinRatri', planet: SIGN_LORDS[isDay ? signOf.Sun : signOf.Moon] as Planet7 },
  ];
  // Moon rule [AIFAS]: the Moon stands only when in her own/exaltation sign or with/aspected
  // by Jupiter; otherwise the lord of the Moon's sign takes her place.
  const moonOk = OWN_SIGNS.Moon.includes(signOf.Moon) || EXALT_SIGN.Moon === signOf.Moon
    || ['open-friendly', 'secret-friendly', 'open-inimical', 'secret-inimical'].includes(tajikAspect(houseFrom(signOf.Moon, signOf.Jupiter)));
  const byPlanet = new Map<Planet7, Candidate>();
  for (const a of adhikaris) {
    let p = a.planet;
    if (p === 'Moon' && !moonOk) p = SIGN_LORDS[signOf.Moon] as Planet7; // never the Moon: she rules only Cancer, where she is "own"
    const h = houseFrom(lagnaSign, signOf[p]);
    const c = byPlanet.get(p) ?? { planet: p, roles: [], aspectsLagna: tajikAspect(h) !== 'none', houseFromLagna: h, vimshopaka: pvb[p].vimshopaka };
    c.roles.push(a.role);
    byPlanet.set(p, c);
  }
  const candidates = [...byPlanet.values()];
  const aspecting = candidates.filter(c => c.aspectsLagna);
  let varshesh: VarshphalResult['varshesh'];
  if (aspecting.length === 0) varshesh = { planet: muntha.lord, rule: 'muntha-lord-fallback' };
  else {
    aspecting.sort((x, y) => (y.vimshopaka - x.vimshopaka) || (y.roles.length - x.roles.length)
      || (ASPECT_BENEFICENCE[y.houseFromLagna] - ASPECT_BENEFICENCE[x.houseFromLagna]));
    varshesh = { planet: aspecting[0].planet, rule: 'strongest-aspecting' };
  }

  const loc = localParts(vp.getTime(), inp.timezone);
  return {
    year: inp.year, completedYears,
    varshaPravesh: { utc: vp.toISOString(), local: `${loc.localDate} ${loc.localTime}`, ...loc, timezone: inp.timezone, isDay },
    nextVarshaPravesh: vpNext.toISOString(),
    natal: { sunLongitude: +natalSun.toFixed(5), lagnaSign: natalLagnaSign, lagnaLongitude: +natalAsc.toFixed(4), moonNakshatra: NAKSHATRA_NAMES[nakIdx], nakshatraNumber: nakIdx + 1, fractionElapsed: +fractionElapsed.toFixed(6) },
    lagna: { longitude: +asc.toFixed(4), sign: lagnaSign, degree: +(asc % 30).toFixed(4), lord: SIGN_LORDS[lagnaSign] as Planet7 },
    planets, muntha, adhikaris, candidates, varshesh, harsha, panchaVargiya: pvb,
    sahams: computeSahams(L, asc, isDay, lagnaSign),
    yogas: tajikYogas(L),
    mudda: muddaDasha(vp, vpNext, completedYears, nakIdx + 1, fractionElapsed),
  };
}

export { RASHI_NAMES, NAKSHATRA_NAMES };
