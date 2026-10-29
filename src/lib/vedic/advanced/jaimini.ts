/**
 * Batch 10 — Jaimini: Chara Karakas, Karakamsha and Chara Dasha.
 *
 * Chara Karakas — the 7-karaka scheme (Sun … Saturn; Rahu NOT included), ranked by how far
 * each planet has travelled inside its sign (degrees within the sign, sidereal Lahiri).
 * Highest = Atmakaraka (AK), then Amatyakaraka (AmK), Bhratrikaraka (BK), Matrikaraka (MK),
 * Putrakaraka (PK), Gnatikaraka (GK); lowest = Darakaraka (DK). The 7-karaka list is the
 * one used by K.N. Rao's school; BPHS also describes an 8-karaka variant that adds Rahu
 * (counted backwards) and a Pitrikaraka — not used here.
 *
 * Karakamsha — the Navamsa (D9) sign of the Atmakaraka (engine getNavamsaSign).
 *
 * Chara Dasha — K.N. Rao's method ("Predicting through Jaimini's Chara Dasha"), as
 * implemented and documented in PyJHora 4.8.7 (jhora/horoscope/dhasa/raasi/chara.py,
 * CHARA_TYPE.KN_RAO, and its documented test chara_dhasa_test in jhora/tests/pvr_tests.py):
 *  - the first period is the Lagna sign;
 *  - order: if the 9th sign from the Lagna is even-footed (Cancer, Leo, Virgo, Capricorn,
 *    Aquarius, Pisces) the signs run backwards, otherwise forwards;
 *  - length of a sign's period: count from the sign to its lord — forwards for the
 *    odd-footed signs (Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius), backwards for
 *    the even-footed ones — minus one; lord in its own sign = 12 years; +1 year if the lord
 *    is exalted, −1 if debilitated (sign-level exaltation; Rahu exalted in Taurus/Gemini and
 *    debilitated in Scorpio/Sagittarius, Ketu the reverse — PyJHora's table);
 *  - Scorpio (Mars/Ketu) and Aquarius (Saturn/Rahu) take the stronger co-lord: if one co-lord
 *    sits in the sign, the other one is used; otherwise (1) more planets with it, (2) more of
 *    Jupiter, Mercury and its dispositor with it or aspecting it by sign (rashi drishti),
 *    (3) exalted, (4) in a dual > fixed > movable sign, (5) further advanced in its sign.
 *  - one cycle of 12 signs; years are sidereal years of 365.256364 days (JHora's value).
 * Differences from PyJHora, deliberate: Rule 1 counts planets only (PyJHora also counts the
 * Lagna), and Rule 2 compares the dispositor's SIGN (PyJHora compares a planet id to a sign
 * index there). Both only matter when the earlier rules tie; tests record where they differ.
 */
import { getNavamsaSign, getSiderealLongitude, calculateLagna } from '../engine/vedicEngine';
import { PLANETS_9, SIGN_LORD, type PlanetName } from './angles';

export const KARAKA_ORDER = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'] as const;
export type KarakaCode = typeof KARAKA_ORDER[number];
const SEVEN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

export interface CharaKaraka { code: KarakaCode; planet: string; degreeInSign: number }
export interface JaiminiResult {
  karakas: CharaKaraka[];
  /** Karaka codes whose planet would change if the birth time were 5 minutes earlier or later. */
  timeSensitive: KarakaCode[];
  /** 0-based Navamsa sign of the Atmakaraka. */
  karakamshaSignIndex: number;
  charaDasha: CharaDashaPeriod[];
  /** True when the Chara Dasha runs forwards through the zodiac (9th from Lagna odd-footed). */
  charaForward: boolean;
}
export interface CharaDashaPeriod { signIndex: number; years: number; start: string; end: string; lord: string; note?: string }

export function charaKarakas(lon: Record<string, number>): CharaKaraka[] {
  const order = [...SEVEN].sort((a, b) => (lon[b] % 30) - (lon[a] % 30));
  return order.map((p, i) => ({ code: KARAKA_ORDER[i], planet: p, degreeInSign: lon[p] % 30 }));
}

// ── Chara Dasha (K.N. Rao) ────────────────────────────────────────────────────────────
const EVEN_FOOTED = new Set([3, 4, 5, 9, 10, 11]);
const MOVABLE = new Set([0, 3, 6, 9]), FIXED = new Set([1, 4, 7, 10]);
/** Sign-level exaltation / debilitation (0-based signs). PyJHora const.house_strengths_of_planets. */
const EXALT: Record<string, number[]> = { Sun: [0], Moon: [1], Mars: [9], Mercury: [], Jupiter: [3], Venus: [11], Saturn: [6], Rahu: [1, 2], Ketu: [7, 8] };
const DEBIL: Record<string, number[]> = { Sun: [6], Moon: [7], Mars: [3], Mercury: [11], Jupiter: [9], Venus: [5], Saturn: [0], Rahu: [7, 8], Ketu: [1, 2] };
export const SIDEREAL_YEAR_DAYS = 365.256364;

/** Jaimini rashi drishti: movable ↔ fixed (except the adjacent sign), dual ↔ dual. */
export function rashiAspects(from: number, to: number): boolean {
  if (from === to) return false;
  if (MOVABLE.has(from)) return FIXED.has(to) && to !== (from + 1) % 12;
  if (FIXED.has(from)) return MOVABLE.has(to) && to !== (from + 11) % 12;
  return !MOVABLE.has(to) && !FIXED.has(to);
}

function modalityRank(s: number) { return MOVABLE.has(s) ? 1 : FIXED.has(s) ? 2 : 3; }

/** Stronger of the two co-lords of Scorpio (Mars/Ketu) or Aquarius (Saturn/Rahu). */
export function strongerCoLord(own: string, node: string, sign: number, signOf: Record<string, number>, deg: Record<string, number>): string {
  const a = signOf[own], b = signOf[node];
  if (a === sign && b !== sign) return node;
  if (b === sign && a !== sign) return own;
  const others = (p: string) => PLANETS_9.filter(q => q !== p && signOf[q] === signOf[p]).length;
  if (others(own) !== others(node)) return others(own) > others(node) ? own : node;
  const support = (p: string) => {
    const s = signOf[p];
    const dispositor = s === 7 ? 'Mars' : s === 10 ? 'Saturn' : SIGN_LORD[s];
    return ['Jupiter', 'Mercury', dispositor].filter(q => q !== p && (signOf[q] === s || rashiAspects(signOf[q], s))).length;
  };
  if (support(own) !== support(node)) return support(own) > support(node) ? own : node;
  const ex = (p: string) => EXALT[p].includes(signOf[p]);
  if (ex(own) !== ex(node)) return ex(own) ? own : node;
  if (modalityRank(a) !== modalityRank(b)) return modalityRank(a) > modalityRank(b) ? own : node;
  return deg[own] >= deg[node] ? own : node;
}

export function charaDashaYears(sign: number, signOf: Record<string, number>, deg: Record<string, number>): { years: number; lord: string } {
  const lord = sign === 7 ? strongerCoLord('Mars', 'Ketu', 7, signOf, deg)
    : sign === 10 ? strongerCoLord('Saturn', 'Rahu', 10, signOf, deg)
    : SIGN_LORD[sign];
  const ls = signOf[lord];
  let years = (EVEN_FOOTED.has(sign) ? (sign - ls + 12) % 12 : (ls - sign + 12) % 12); // count − 1
  if (years <= 0) years = 12;
  if (EXALT[lord].includes(ls)) years += 1;
  else if (DEBIL[lord].includes(ls)) years -= 1;
  return { years, lord };
}

export function charaDashaSequence(lagnaSign: number): number[] {
  const backwards = EVEN_FOOTED.has((lagnaSign + 8) % 12);
  return Array.from({ length: 12 }, (_, i) => (backwards ? (lagnaSign - i + 12) % 12 : (lagnaSign + i) % 12));
}

export function computeCharaDasha(birthUTC: Date, lagnaSign: number, signOf: Record<string, number>, deg: Record<string, number>): CharaDashaPeriod[] {
  let t = birthUTC.getTime();
  return charaDashaSequence(lagnaSign).map(s => {
    const { years, lord } = charaDashaYears(s, signOf, deg);
    const end = t + years * SIDEREAL_YEAR_DAYS * 86400000;
    const p = { signIndex: s, years, lord, start: new Date(t).toISOString(), end: new Date(end).toISOString() };
    t = end;
    return p;
  });
}

function karakasAt(d: Date) {
  const lon = Object.fromEntries(PLANETS_9.map(p => [p, getSiderealLongitude(p, d)])) as Record<PlanetName, number>;
  return { lon, karakas: charaKarakas(lon) };
}

export function computeJaimini(birthUTC: Date, latitude: number, longitude: number): JaiminiResult {
  const { lon, karakas } = karakasAt(birthUTC);
  const FIVE_MIN = 5 * 60 * 1000;
  const alt = [karakasAt(new Date(birthUTC.getTime() - FIVE_MIN)).karakas, karakasAt(new Date(birthUTC.getTime() + FIVE_MIN)).karakas];
  const timeSensitive = karakas.filter((k, i) => alt.some(a => a[i].planet !== k.planet)).map(k => k.code);
  const ak = karakas[0];
  const karakamshaSignIndex = getNavamsaSign(lon[ak.planet as PlanetName]).navamsaSignIndex;
  const signOf = Object.fromEntries(PLANETS_9.map(p => [p, Math.floor(lon[p] / 30)])) as Record<string, number>;
  const deg = Object.fromEntries(PLANETS_9.map(p => [p, lon[p] % 30])) as Record<string, number>;
  const lagnaSign = Math.floor(calculateLagna(birthUTC, latitude, longitude).ascSidereal / 30);
  return {
    karakas, timeSensitive, karakamshaSignIndex,
    charaDasha: computeCharaDasha(birthUTC, lagnaSign, signOf, deg),
    charaForward: !EVEN_FOOTED.has((lagnaSign + 8) % 12),
  };
}
