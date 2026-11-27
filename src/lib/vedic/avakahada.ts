/**
 * B21 — Avkahada Chakra and Ghatak (Ghata) Chakra: the "birth summary" table that every
 * printed Indian Kundli carries, computed from the sidereal Sun, Moon and Lagna.
 *
 * Avkahada fields and rules
 *  - Varna, Vashya, Yoni, Gana, Nadi: the same tables as Guna Milan (nakshatraAttributes.ts),
 *    so a person's Kundli and their match report can never disagree.
 *  - Nakshatra lord: Vimshottari lord. Tithi, Yoga, Karana: from the Sun and Moon at birth.
 *  - Name alphabet: the syllable of the Moon's pada (src/data/nakshatraAksharas.ts).
 *  - Varga: the letter group of that syllable (Devanagari): vowels Garuda, क-varga Marjar (cat),
 *    च-varga Simha, ट-varga Shwan (dog), त-varga Sarpa, प-varga Mooshak (rat), य र ल व Mriga (deer),
 *    श ष स ह Mesha (ram).
 *  - Hansak (Tatva): element of the Moon sign — Agni (fire), Bhoomi (earth), Vayu (air), Jal (water).
 *  - Yunja: the Moon's nakshatra block — Purva (Revati … Mrigashira), Madhya (Ardra … Anuradha),
 *    Antya (Jyeshtha … Uttara Bhadrapada).
 *  - Paya by Moon house from Lagna: 1/6/11 Gold, 2/5/9 Silver, 3/7/10 Copper, 4/8/12 Iron.
 *  - Paya by nakshatra (FuturePoint / Leostar convention): Revati … Mrigashira Gold, Ardra … Swati
 *    Silver, Vishakha … Shatabhisha Copper, Purva and Uttara Bhadrapada Iron. (Some published tables
 *    use another grouping — e.g. astroshree.in puts Krittika–Mrigashira under Iron — so this one label
 *    varies between almanacs; we follow the convention behind the reference charts below.)
 *  Sources: astroshree.in and ved-arth.com (Paya by house); every field checked against FuturePoint's
 *  published Avkahada tables for 150+ charts (__tests__/golden/avakahadaFuturePoint.json,
 *  avakahada.test.ts).
 *
 * Ghatak Chakra (by Moon sign): month, tithi group, weekday, nakshatra, yoga, karana, prahar and
 * the Moon's ghatak sign for a man and for a woman. Two independent tabulations agree on every
 * cell we show — Antim Parichay (Sharatchandra Chattopadhyay, after Shreedhara Shivalal) as
 * compiled at sanjayprabhakaran.blogspot.com (Oct 2013), and astrovachmi.com's Ghat Chakra table.
 * The Prahar differs between them for Cancer, Leo and Virgo (1 vs 5) — shown as "1 or 5".
 */
import { GANA, NADI, YONI, VARNA_LEVEL, VARNA_NAME, nakLord, NAK_ORDER } from './nakshatraAttributes';
import { vashyaGroup } from './matchmaking';
import { PANCHANG_TABLES, karanaName } from './panchang';
import { NAKSHATRA_PADA_AKSHARAS } from '../../data/nakshatraAksharas';

export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const norm = (x: number) => ((x % 360) + 360) % 360;

export type Paya = 'Gold' | 'Silver' | 'Copper' | 'Iron';
export const PAYA_BY_HOUSE: Record<number, Paya> = { 1: 'Gold', 6: 'Gold', 11: 'Gold', 2: 'Silver', 5: 'Silver', 9: 'Silver', 3: 'Copper', 7: 'Copper', 10: 'Copper', 4: 'Iron', 8: 'Iron', 12: 'Iron' };
/** Paya by nakshatra index (0 = Ashwini). */
export function payaByNakshatra(i: number): Paya {
  if (i === 26 || i <= 4) return 'Gold';
  if (i <= 14) return 'Silver';
  if (i <= 23) return 'Copper';
  return 'Iron';
}
export type Yunja = 'Purva' | 'Madhya' | 'Antya';
export function yunja(i: number): Yunja {
  if (i === 26 || i <= 4) return 'Purva';
  if (i <= 16) return 'Madhya';
  return 'Antya';
}
export const HANSAK = ['Agni', 'Bhoomi', 'Vayu', 'Jal'] as const; // fire, earth, air, water
export const hansak = (signIndex: number) => HANSAK[signIndex % 4];

const VARGA_GROUPS: Array<[string, string]> = [
  ['अआइईउऊऋएऐओऔ', 'Garuda'], ['कखगघङ', 'Marjar'], ['चछजझञ', 'Simha'], ['टठडढण', 'Shwan'],
  ['तथदधन', 'Sarpa'], ['पफबभम', 'Mooshak'], ['यरलव', 'Mriga'], ['शषसह', 'Mesha'],
];
export function vargaOf(devanagari: string): string {
  const first = devanagari.trim()[0] ?? '';
  return VARGA_GROUPS.find(([letters]) => letters.includes(first))?.[1] ?? '—';
}

export interface AvakahadaInput {
  /** Sidereal longitudes (degrees). */
  sun: number; moon: number;
  /** 0-based Lagna sign (0 = Aries). */
  lagnaSignIndex: number;
}

export interface Avakahada {
  lagna: string; lagnaLord: string;
  rashi: string; rashiLord: string;
  nakshatra: string; pada: number; nakshatraLord: string;
  tithi: string; paksha: 'Shukla' | 'Krishna'; yoga: string; karana: string;
  varna: string; vashya: string; yoni: string; gana: string; nadi: string;
  varga: string; yunja: Yunja; hansak: string;
  nameAlphabet: { en: string; hi: string };
  payaRashi: Paya; payaNakshatra: Paya; moonHouse: number;
}

export function computeAvakahada({ sun, moon, lagnaSignIndex }: AvakahadaInput): Avakahada {
  const m = norm(moon), s = norm(sun);
  const rashi = Math.floor(m / 30);
  const nakIdx = Math.floor(m / (360 / 27));
  const pada = Math.floor((m % (360 / 27)) / (360 / 108)) + 1;
  const nakshatra = NAK_ORDER[nakIdx];
  const elong = norm(m - s);
  const tithiNum = Math.floor(elong / 12) + 1; // 1..30
  const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';
  const T = PANCHANG_TABLES.TITHI_NAMES;
  const tithi = tithiNum === 15 ? 'Purnima' : tithiNum === 30 ? 'Amavasya' : T[(tithiNum - 1) % 15];
  const yoga = PANCHANG_TABLES.YOGAS[Math.floor(norm(m + s) / (360 / 27))];
  const karana = karanaName(Math.floor(elong / 6) + 1).replace(' (Bhadra)', '');
  const akshara = NAKSHATRA_PADA_AKSHARAS[nakshatra][pada - 1];
  const moonHouse = ((rashi - lagnaSignIndex + 12) % 12) + 1;
  return {
    lagna: SIGN_EN[lagnaSignIndex], lagnaLord: SIGN_LORD[lagnaSignIndex],
    rashi: SIGN_EN[rashi], rashiLord: SIGN_LORD[rashi],
    nakshatra, pada, nakshatraLord: nakLord(nakIdx),
    tithi, paksha, yoga, karana,
    varna: VARNA_NAME[VARNA_LEVEL[rashi]], vashya: vashyaGroup(m), yoni: YONI[nakshatra], gana: GANA[nakshatra], nadi: NADI[nakshatra],
    varga: vargaOf(akshara.hi), yunja: yunja(nakIdx), hansak: hansak(rashi),
    nameAlphabet: akshara,
    payaRashi: PAYA_BY_HOUSE[moonHouse], payaNakshatra: payaByNakshatra(nakIdx), moonHouse,
  };
}

/* ── Ghatak Chakra ─────────────────────────────────────────────────────────── */

export interface Ghatak {
  month: string; tithiGroup: string; tithis: number[]; day: string; nakshatra: string;
  yoga: string; karana: string; prahar: string;
  /** The Moon's ghatak sign for a man / for a woman (transit Moon in this sign = take care). */
  moonMale: string; moonFemale: string;
}
// [month, group, tithis, day, nakshatra, yoga, karana, prahar, male +n, female +n]  (+n = nth sign from the Moon sign)
const G: Array<[string, string, number[], string, string, string, string, string, number, number]> = [
  ['Kartika', 'Nanda', [1, 6, 11], 'Sunday', 'Magha', 'Vishkambha', 'Bava', '1', 1, 1],
  ['Margashirsha', 'Purna', [5, 10, 15], 'Saturday', 'Hasta', 'Shukla', 'Shakuni', '4', 5, 8],
  ['Ashadha', 'Bhadra', [2, 7, 12], 'Monday', 'Swati', 'Parigha', 'Kaulava', '3', 9, 7],
  ['Pausha', 'Bhadra', [2, 7, 12], 'Wednesday', 'Anuradha', 'Vyaghata', 'Naga', '1 or 5', 2, 9],
  ['Jyeshtha', 'Jaya', [3, 8, 13], 'Saturday', 'Mula', 'Dhriti', 'Bava', '1 or 5', 6, 4],
  ['Bhadrapada', 'Purna', [5, 10, 15], 'Saturday', 'Shravana', 'Shukla', 'Kaulava', '1 or 5', 10, 3],
  ['Magha', 'Rikta', [4, 9, 14], 'Thursday', 'Shatabhisha', 'Shukla', 'Taitila', '4', 3, 6],
  ['Ashwin', 'Nanda', [1, 6, 11], 'Friday', 'Revati', 'Vyatipata', 'Gara', '1', 7, 2],
  ['Shravana', 'Jaya', [3, 8, 13], 'Friday', 'Bharani', 'Vajra', 'Taitila', '1', 4, 10],
  ['Vaishakha', 'Rikta', [4, 9, 14], 'Tuesday', 'Rohini', 'Vaidhriti', 'Shakuni', '4', 8, 11],
  ['Chaitra', 'Jaya', [3, 8, 13], 'Thursday', 'Ardra', 'Ganda', 'Kimstughna', '3', 11, 5],
  ['Phalguna', 'Purna', [5, 10, 15], 'Friday', 'Ashlesha', 'Vajra', 'Chatushpada', '4', 12, 12],
];
export function computeGhatak(moonSignIndex: number): Ghatak {
  const [month, tithiGroup, tithis, day, nakshatra, yoga, karana, prahar, mm, mf] = G[moonSignIndex];
  const nth = (n: number) => SIGN_EN[(moonSignIndex + n - 1) % 12];
  return { month, tithiGroup, tithis, day, nakshatra, yoga, karana, prahar, moonMale: nth(mm), moonFemale: nth(mf) };
}

/** Plain-language meaning of each Avkahada field — shown beside the value. */
export const AVAKAHADA_HELP: Record<string, string> = {
  varna: 'Temperament class from the Moon sign (used in matching).',
  vashya: 'The kind of influence you respond to (used in matching).',
  yoni: 'The animal symbol of your birth star — instinct and intimacy in matching.',
  gana: 'Nature: Deva (gentle), Manushya (practical), Rakshasa (intense).',
  nadi: 'Constitution — the 8-point factor in Guna Milan.',
  varga: 'Letter group of your name syllable; used to check name and business-partner harmony.',
  yunja: 'Which part of the Moon’s cycle your star falls in — beginning, middle or end.',
  hansak: 'The element of your Moon sign: fire, earth, air or water.',
  paya: 'The “foot” you were born on — gold, silver, copper or iron. Read only as a traditional label, not a verdict.',
  nameAlphabet: 'The traditional first syllable for a name, from your Moon’s pada.',
};
