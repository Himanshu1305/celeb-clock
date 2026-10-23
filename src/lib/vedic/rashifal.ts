/**
 * Computed Rashifal (horoscope by Moon sign) — Growth P1 traffic engine.
 *
 * This is NOT a hand-written, date-less template. It is a deterministic *gochar*
 * (transit) reading: for a given Rashi (Moon sign) and period, it computes where
 * each planet actually sits today (sidereal / Lahiri, via the validated engine)
 * and reads each transit by the classical "house from the Moon" method — exactly
 * how a Vedic astrologer derives a rashifal:
 *
 *   house from Moon = ((transit sign − Moon sign + 12) mod 12) + 1
 *
 * Each (planet, house, tone) is turned into a graded (strong / moderate / mild),
 * reasoned reading that attributes the view to the tradition and passes the
 * "so what?" test (what it is · what it means · what to do). Because the planet
 * positions change with the date and the house differs per Rashi, the output
 * genuinely differs by date AND by sign — no hardcoded "today" string.
 *
 * All positions come from `getSiderealLongitude` (pure, browser + edge). The page
 * calls this at request time with `new Date()`, so URLs stay evergreen.
 */
import { getSiderealLongitude } from './engine/vedicEngine';

export type Grade = 'strong' | 'moderate' | 'mild';
export type Tone = 'favourable' | 'mixed' | 'challenging';
export type RashifalPeriod = 'today' | 'week' | 'month' | 'year';

export const RASHIFAL_PERIODS: RashifalPeriod[] = ['today', 'week', 'month', 'year'];

export interface RashiMeta {
  slug: string;        // worker-validated slug (mesh, vrishabh, …)
  english: string;     // Aries
  sanskrit: string;    // Mesha
  hindi: string;       // मेष
  lord: string;        // ruling planet (English)
  lordHindi: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  luckyColor: string;
  luckyColorHindi: string;
  luckyNumbers: number[];
}

/** Index 0..11 == sidereal sign index (Mesha=0 … Meena=11). Slugs match the
 *  worker's rashi set so /rashifal/:rashi validates like /vedic-zodiac/:rashi. */
export const RASHIS: RashiMeta[] = [
  { slug: 'mesh',      english: 'Aries',       sanskrit: 'Mesha',     hindi: 'मेष',    lord: 'Mars',    lordHindi: 'मंगल',  element: 'Fire',  luckyColor: 'Red',          luckyColorHindi: 'लाल',       luckyNumbers: [9, 18] },
  { slug: 'vrishabh',  english: 'Taurus',      sanskrit: 'Vrishabha', hindi: 'वृषभ',   lord: 'Venus',   lordHindi: 'शुक्र',  element: 'Earth', luckyColor: 'White',        luckyColorHindi: 'सफ़ेद',     luckyNumbers: [6, 15] },
  { slug: 'mithun',    english: 'Gemini',      sanskrit: 'Mithuna',   hindi: 'मिथुन',  lord: 'Mercury', lordHindi: 'बुध',   element: 'Air',   luckyColor: 'Green',        luckyColorHindi: 'हरा',       luckyNumbers: [5, 14] },
  { slug: 'kark',      english: 'Cancer',      sanskrit: 'Karka',     hindi: 'कर्क',    lord: 'Moon',    lordHindi: 'चंद्र',  element: 'Water', luckyColor: 'Silver-white', luckyColorHindi: 'श्वेत',     luckyNumbers: [2, 11] },
  { slug: 'simha',     english: 'Leo',         sanskrit: 'Simha',     hindi: 'सिंह',    lord: 'Sun',     lordHindi: 'सूर्य',  element: 'Fire',  luckyColor: 'Gold',         luckyColorHindi: 'सुनहरा',    luckyNumbers: [1, 10] },
  { slug: 'kanya',     english: 'Virgo',       sanskrit: 'Kanya',     hindi: 'कन्या',   lord: 'Mercury', lordHindi: 'बुध',   element: 'Earth', luckyColor: 'Green',        luckyColorHindi: 'हरा',       luckyNumbers: [5, 23] },
  { slug: 'tula',      english: 'Libra',       sanskrit: 'Tula',      hindi: 'तुला',    lord: 'Venus',   lordHindi: 'शुक्र',  element: 'Air',   luckyColor: 'White',        luckyColorHindi: 'सफ़ेद',     luckyNumbers: [6, 15] },
  { slug: 'vrishchik', english: 'Scorpio',     sanskrit: 'Vrishchika',hindi: 'वृश्चिक', lord: 'Mars',    lordHindi: 'मंगल',  element: 'Water', luckyColor: 'Red',          luckyColorHindi: 'लाल',       luckyNumbers: [9, 18] },
  { slug: 'dhanu',     english: 'Sagittarius', sanskrit: 'Dhanu',     hindi: 'धनु',     lord: 'Jupiter', lordHindi: 'गुरु',  element: 'Fire',  luckyColor: 'Yellow',       luckyColorHindi: 'पीला',      luckyNumbers: [3, 12] },
  { slug: 'makar',     english: 'Capricorn',   sanskrit: 'Makara',    hindi: 'मकर',     lord: 'Saturn',  lordHindi: 'शनि',   element: 'Earth', luckyColor: 'Blue',         luckyColorHindi: 'नीला',      luckyNumbers: [8, 17] },
  { slug: 'kumbh',     english: 'Aquarius',    sanskrit: 'Kumbha',    hindi: 'कुंभ',    lord: 'Saturn',  lordHindi: 'शनि',   element: 'Air',   luckyColor: 'Blue',         luckyColorHindi: 'नीला',      luckyNumbers: [8, 17] },
  { slug: 'meen',      english: 'Pisces',      sanskrit: 'Meena',     hindi: 'मीन',     lord: 'Jupiter', lordHindi: 'गुरु',  element: 'Water', luckyColor: 'Yellow',       luckyColorHindi: 'पीला',      luckyNumbers: [3, 12] },
];

export function rashiBySlug(slug: string): RashiMeta | undefined {
  return RASHIS.find(r => r.slug === slug);
}

type PlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

/** Classical gochar — houses (from the Moon) where each planet is auspicious. */
const GOCHAR_GOOD: Record<PlanetName, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 10, 11],
  Ketu: [3, 6, 11],
};

/** The classically difficult houses per planet (the rest read as mixed/neutral). */
const GOCHAR_HARD: Record<PlanetName, number[]> = {
  Sun: [1, 2, 4, 5, 7, 8, 12],
  Moon: [4, 8, 12],
  Mars: [1, 2, 4, 7, 8, 12],
  Mercury: [1, 3, 5, 7, 9, 12],
  Jupiter: [3, 6, 8, 12],
  Venus: [6, 7, 10],
  Saturn: [1, 2, 4, 5, 7, 8, 12], // 1/2/12 = Sade Sati, 4/8 = Dhaiya
  Rahu: [1, 2, 5, 7, 8, 9, 12],
  Ketu: [1, 2, 4, 5, 7, 8, 9, 12],
};

const PLANET_LABEL_HI: Record<PlanetName, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

/** Planet lens: how the planet colours whatever house it sits in, by tone. */
const PLANET_LENS: Record<PlanetName, { pos: string; neg: string; mix: string }> = {
  Sun: {
    pos: 'confidence, recognition and the backing of people in authority',
    neg: 'bruised ego, friction with authority and a pull to overwork',
    mix: 'a spotlight that rewards honest effort but punishes pretence',
  },
  Moon: {
    pos: 'emotional ease, warm connections and a settled mind',
    neg: 'mood swings, restlessness and a need to protect your peace',
    mix: 'shifting feelings — good days and flat days in quick succession',
  },
  Mars: {
    pos: 'drive, courage and the energy to push a stalled thing forward',
    neg: 'short temper, haste and avoidable arguments or minor injury',
    mix: 'high energy that helps if channelled and hurts if left raw',
  },
  Mercury: {
    pos: 'clear thinking, good conversations and smooth paperwork or trade',
    neg: 'miscommunication, scattered focus and errors in the fine print',
    mix: 'a busy, talkative phase — double-check details before you commit',
  },
  Jupiter: {
    pos: 'growth, good counsel, opportunity and a sense of things expanding',
    neg: 'over-optimism, over-commitment and loose spending',
    mix: 'doors opening slowly — real growth, but not overnight',
  },
  Venus: {
    pos: 'warmth in relationships, comfort, beauty and small luxuries',
    neg: 'indulgence, relationship friction and overspending on pleasure',
    mix: 'pleasant but distracting — enjoy it without losing the thread',
  },
  Saturn: {
    pos: 'discipline paying off, steady progress and well-earned respect',
    neg: 'delay, heavier responsibility and a test of patience and stamina',
    mix: 'slow, serious work — results come to those who stay the course',
  },
  Rahu: {
    pos: 'ambition, unconventional opportunity and sudden, useful openings',
    neg: 'confusion, over-reach and chasing things that glitter but mislead',
    mix: 'unusual turns — exciting, but keep both feet on the ground',
  },
  Ketu: {
    pos: 'clarity through letting go, intuition and quiet, inward progress',
    neg: 'detachment, loose ends and a feeling of things dissolving',
    mix: 'a reflective, low-key phase — good for release, poor for launches',
  },
};

/** House-from-Moon: life area + a short, practical "do" for the reader. */
const HOUSE_AREA: Record<number, { area: string; areaHi: string; doTip: string }> = {
  1: { area: 'self, body and the way you come across', areaHi: 'स्वयं, शरीर व व्यक्तित्व', doTip: 'Lead with your own health and tone first.' },
  2: { area: 'money, family, speech and what you value', areaHi: 'धन, परिवार व वाणी', doTip: 'Watch spending and choose your words with care.' },
  3: { area: 'courage, effort, siblings and short trips', areaHi: 'साहस, प्रयास व भाई-बहन', doTip: 'Back your own initiative — bold, honest effort is favoured.' },
  4: { area: 'home, mother, inner peace and property', areaHi: 'घर, माता व मन की शांति', doTip: 'Tend your home base and protect your rest.' },
  5: { area: 'children, romance, creativity and studies', areaHi: 'संतान, प्रेम व रचनात्मकता', doTip: 'Make room for play, love and learning.' },
  6: { area: 'work, daily routine, health and rivals', areaHi: 'कार्य, दिनचर्या व स्वास्थ्य', doTip: 'This is a good window to out-work competition and fix habits.' },
  7: { area: 'partnership, marriage and deals with others', areaHi: 'साझेदारी व विवाह', doTip: 'Handle one-to-one relationships and agreements consciously.' },
  8: { area: 'change, shared money, research and the hidden', areaHi: 'परिवर्तन व गुप्त मामले', doTip: 'Expect shifts — go slow on joint finances and big risks.' },
  9: { area: 'fortune, higher learning, travel and belief', areaHi: 'भाग्य, उच्च शिक्षा व यात्रा', doTip: 'Say yes to learning, mentors and well-planned journeys.' },
  10: { area: 'career, status and reputation', areaHi: 'करियर, पद व प्रतिष्ठा', doTip: 'Put your best work where it will be seen.' },
  11: { area: 'gains, income, friends and fulfilled wishes', areaHi: 'लाभ, आय व मित्र', doTip: 'Follow up on income, networks and long-held goals.' },
  12: { area: 'expenses, rest, foreign matters and letting go', areaHi: 'व्यय, विश्राम व विदेश', doTip: 'Budget for outflows and guard your sleep and quiet time.' },
};

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export interface TransitReading {
  planet: PlanetName;
  planetHindi: string;
  signIndex: number;
  house: number;       // 1..12 from the native's Moon sign
  tone: Tone;
  grade: Grade;
  text: string;        // English, graded, reasoned reading
  textHi: string;      // short Hindi line
  sadeSati?: boolean;  // Saturn in 12/1/2 from Moon
  dhaiya?: boolean;    // Saturn in 4/8 from Moon (Kantaka/Ashtama Shani)
  /** Year readings only: the part of the period this reading covers (IST calendar dates) when the planet changes sign during it. */
  fromISO?: string;
  toISO?: string;
  /** Fraction (0..1] of the period this reading covers — weights the overall tone. */
  share?: number;
}

export interface RashifalSection {
  key: 'overview' | 'love' | 'career' | 'money' | 'health';
  title: string;
  titleHi: string;
  grade: Grade;
  tone: Tone;
  text: string;
  textHi: string;
}

export interface Rashifal {
  rashi: RashiMeta;
  period: RashifalPeriod;
  periodLabel: string;      // e.g. "Today", "This week", "October 2026", "2027"
  dateRange: { startISO: string; endISO: string };
  computedForISO: string;   // the representative instant used
  overallTone: Tone;
  overallGrade: Grade;
  transits: TransitReading[];
  sections: RashifalSection[];
  ingress: string[];        // real planet ingress notes for the period (slow planets)
  lucky: { color: string; colorHindi: string; numbers: number[] };
}

const PLANETS_ALL: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const SLOW: PlanetName[] = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];

function signIndexOf(planet: PlanetName, at: Date): number {
  const lon = getSiderealLongitude(planet, at);
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

function houseFromMoon(transitSign: number, moonSign: number): number {
  return (((transitSign - moonSign) % 12) + 12) % 12 + 1;
}

function toneFor(planet: PlanetName, house: number): Tone {
  if (GOCHAR_GOOD[planet].includes(house)) return 'favourable';
  if (GOCHAR_HARD[planet].includes(house)) return 'challenging';
  return 'mixed';
}

function gradeFor(planet: PlanetName, tone: Tone): Grade {
  const strongPlanet = SLOW.includes(planet);
  if (tone === 'mixed') return strongPlanet ? 'moderate' : 'mild';
  // favourable or challenging
  return strongPlanet ? 'strong' : 'moderate';
}

function lensFor(planet: PlanetName, tone: Tone): string {
  const L = PLANET_LENS[planet];
  return tone === 'favourable' ? L.pos : tone === 'challenging' ? L.neg : L.mix;
}

const TONE_FRAME: Record<Tone, string> = {
  favourable: 'Vedic astrology reads this as a supportive placement',
  challenging: 'Vedic astrology treats this as a placement to handle with care',
  mixed: 'Vedic astrology reads this as a mixed placement',
};

function buildTransit(planet: PlanetName, moonSign: number, at: Date): TransitReading {
  const signIndex = signIndexOf(planet, at);
  const house = houseFromMoon(signIndex, moonSign);
  const tone = toneFor(planet, house);
  const grade = gradeFor(planet, tone);
  const area = HOUSE_AREA[house];
  const lens = lensFor(planet, tone);
  const frame = TONE_FRAME[tone];
  const text =
    `${planet} is transiting your ${ORDINAL[house]} house — ${area.area}. ` +
    `${frame}: a ${grade} influence bringing ${lens}. ${area.doTip}`;
  const textHi = `${PLANET_LABEL_HI[planet]} आपके ${house}वें भाव (${area.areaHi}) में — ` +
    `${tone === 'favourable' ? 'शुभ' : tone === 'challenging' ? 'सावधानी का' : 'मिश्रित'} प्रभाव।`;
  const r: TransitReading = { planet, planetHindi: PLANET_LABEL_HI[planet], signIndex, house, tone, grade, text, textHi };
  if (planet === 'Saturn') {
    if ([12, 1, 2].includes(house)) r.sadeSati = true;
    if ([4, 8].includes(house)) r.dhaiya = true;
  }
  return r;
}

/** Which planets headline each period (fast movers only matter for short periods). */
function featuredPlanets(period: RashifalPeriod): PlanetName[] {
  switch (period) {
    case 'today': return ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
    case 'week': return ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
    case 'month': return ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
    case 'year': return ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];
  }
}

function periodRange(period: RashifalPeriod, ref: Date): { start: Date; end: Date; rep: Date; label: string } {
  const y = ref.getUTCFullYear();
  const startOfDay = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate(), 6, 0, 0));
  if (period === 'today') {
    return { start: startOfDay, end: startOfDay, rep: startOfDay, label: 'Today' };
  }
  if (period === 'week') {
    const end = new Date(startOfDay); end.setUTCDate(end.getUTCDate() + 6);
    const rep = new Date(startOfDay); rep.setUTCDate(rep.getUTCDate() + 3);
    return { start: startOfDay, end, rep, label: 'This week' };
  }
  if (period === 'month') {
    const start = new Date(Date.UTC(y, ref.getUTCMonth(), 1, 6, 0, 0));
    const end = new Date(Date.UTC(y, ref.getUTCMonth() + 1, 0, 6, 0, 0));
    const rep = new Date(Date.UTC(y, ref.getUTCMonth(), 15, 6, 0, 0));
    const label = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return { start, end, rep, label };
  }
  // year
  const start = new Date(Date.UTC(y, 0, 1, 6, 0, 0));
  const end = new Date(Date.UTC(y, 11, 31, 6, 0, 0));
  const rep = new Date(Date.UTC(y, 5, 30, 6, 0, 0));
  return { start, end, rep, label: String(y) };
}

const HOUR_MS = 3600 * 1000;
const DAY_MS = 24 * HOUR_MS;
const IST_OFFSET_MS = 5.5 * HOUR_MS;

/** Calendar date (YYYY-MM-DD) of an instant in Indian Standard Time — the convention
 *  Indian almanacs (e.g. Drik Panchang) use for ingress dates. */
export function istDateISO(at: Date): string {
  return new Date(at.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Refine a sign change between two instants to ~1 hour; returns the first instant in the new sign. */
function refineIngress(planet: PlanetName, loMs: number, hiMs: number): number {
  const before = signIndexOf(planet, new Date(loMs));
  let a = loMs, b = hiMs;
  while (b - a > HOUR_MS) {
    const mid = (a + b) / 2;
    if (signIndexOf(planet, new Date(mid)) === before) a = mid; else b = mid;
  }
  return b;
}

export interface SignSegment {
  signIndex: number;
  startMs: number;      // instant the planet is in this sign from (period start or ingress)
  endMs: number;        // instant it leaves (next ingress or period end)
  fromISO: string;      // IST calendar date of startMs
  toISO: string;        // IST calendar date of endMs
}

/**
 * Split [start, end] at every real sign change of a planet (1-day sampling refined to
 * ~1 hour), so a reading for a whole period never assumes one sign (audit K2).
 * Saturn's shortest retrograde stay in a sign (1900–2100) is 9.5 days, far above the step.
 */
export function signSegments(planet: PlanetName, start: Date, end: Date): SignSegment[] {
  const segs: SignSegment[] = [];
  let segStart = start.getTime();
  let sign = signIndexOf(planet, start);
  let prev = segStart;
  for (let t = segStart + DAY_MS; ; t += DAY_MS) {
    const tt = Math.min(t, end.getTime());
    const s = signIndexOf(planet, new Date(tt));
    if (s !== sign) {
      const at = refineIngress(planet, prev, tt);
      segs.push({ signIndex: sign, startMs: segStart, endMs: at, fromISO: istDateISO(new Date(segStart)), toISO: istDateISO(new Date(at)) });
      segStart = at; sign = s;
    }
    prev = tt;
    if (tt >= end.getTime()) break;
  }
  segs.push({ signIndex: sign, startMs: segStart, endMs: end.getTime(), fromISO: istDateISO(new Date(segStart)), toISO: istDateISO(end) });
  return segs;
}

/** Find the date (IST) a slow planet next changes sign within the period. */
function ingressWithin(planet: PlanetName, start: Date, end: Date): { signIndex: number; dateISO: string } | null {
  const segs = signSegments(planet, start, end);
  if (segs.length < 2) return null;
  return { signIndex: segs[1].signIndex, dateISO: istDateISO(new Date(segs[1].startMs)) };
}

const SECTION_TITLES: Record<RashifalSection['key'], { en: string; hi: string }> = {
  overview: { en: 'Overview', hi: 'सारांश' },
  love: { en: 'Love & relationships', hi: 'प्रेम व संबंध' },
  career: { en: 'Career & work', hi: 'करियर व कार्य' },
  money: { en: 'Money & finance', hi: 'धन व वित्त' },
  health: { en: 'Health & energy', hi: 'स्वास्थ्य व ऊर्जा' },
};

/** Life area → the houses and planets that most inform it. */
const SECTION_HOUSES: Record<Exclude<RashifalSection['key'], 'overview'>, number[]> = {
  love: [5, 7],
  career: [10, 6, 1],
  money: [2, 11],
  health: [1, 6, 8],
};

function combineTone(transits: TransitReading[]): { tone: Tone; grade: Grade } {
  if (!transits.length) return { tone: 'mixed', grade: 'mild' };
  let score = 0;
  let weight = 0;
  for (const t of transits) {
    const w = (SLOW.includes(t.planet) ? 2 : 1) * (t.share ?? 1);
    weight += w;
    score += (t.tone === 'favourable' ? 1 : t.tone === 'challenging' ? -1 : 0) * w;
  }
  const norm = score / Math.max(1, weight);
  const tone: Tone = norm > 0.2 ? 'favourable' : norm < -0.2 ? 'challenging' : 'mixed';
  const grade: Grade = Math.abs(norm) > 0.5 ? 'strong' : Math.abs(norm) > 0.2 ? 'moderate' : 'mild';
  return { tone, grade };
}

function sectionText(key: Exclude<RashifalSection['key'], 'overview'>, relevant: TransitReading[]): { en: string; hi: string } {
  const titles = SECTION_TITLES[key];
  if (!relevant.length) {
    const en = `No major planet is touching the houses of ${key} right now — a quiet, steady stretch here. Keep doing the ordinary things well.`;
    return { en, hi: `${titles.hi}: इस समय कोई बड़ा ग्रह-प्रभाव नहीं — स्थिर व सामान्य समय।` };
  }
  const lead = relevant[0];
  const extra = relevant.slice(1, 2).map(t => `${t.planet} in your ${ORDINAL[t.house]} adds ${lensFor(t.planet, t.tone)}.`).join(' ');
  const en = `${lead.text}${extra ? ' ' + extra : ''}`;
  const hi = relevant.map(t => t.textHi).slice(0, 2).join(' ');
  return { en, hi };
}

/**
 * Compute a full rashifal for a Moon sign and period at a reference instant.
 * Pure + deterministic given (signIndex, period, ref).
 */
export function computeRashifal(signIndex: number, period: RashifalPeriod, ref: Date): Rashifal {
  const rashi = RASHIS[signIndex];
  const { start, end, rep, label } = periodRange(period, ref);
  const featured = featuredPlanets(period);
  // A year is NOT read from one date: each slow planet's year is split at its real sign
  // changes and every stretch is read on its own, weighted by how long it lasts (audit K2).
  const segmentsByPlanet = new Map<PlanetName, SignSegment[]>();
  const transits: TransitReading[] = period === 'year'
    ? featured.flatMap(p => {
        const segs = signSegments(p, start, end);
        segmentsByPlanet.set(p, segs);
        if (segs.length === 1) return [buildTransit(p, signIndex, rep)];
        const total = end.getTime() - start.getTime();
        return segs.map(sg => {
          const r = buildTransit(p, signIndex, new Date((sg.startMs + sg.endMs) / 2));
          return { ...r, text: `${rangeLabel(sg.fromISO, sg.toISO)}: ${r.text}`, fromISO: sg.fromISO, toISO: sg.toISO, share: (sg.endMs - sg.startMs) / total };
        });
      })
    : featured.map(p => buildTransit(p, signIndex, rep));

  // Overview = the strongest-signal transits (slow planets + the day's Moon).
  const overviewPicks = transits
    .filter(t => SLOW.includes(t.planet) || (period !== 'year' && (t.planet === 'Moon' || t.planet === 'Sun')))
    .sort(byWeight);
  const overall = combineTone(transits);
  const sadeSatiParts = transits.filter(t => t.sadeSati);
  const sadeSati = sadeSatiParts[0];
  // Sade Sati colours a whole year: a year with any Sade Sati stretch is never headlined
  // as "broadly supportive" (audit K2 — Kumbha 2027).
  if (period === 'year' && sadeSati && overall.tone === 'favourable') { overall.tone = 'mixed'; overall.grade = 'moderate'; }
  const overviewLead = overviewPicks[0] || transits[0];
  const sadeSatiWhen = sadeSatiParts.some(t => t.fromISO)
    ? ` (${sadeSatiParts.map(t => rangeLabel(t.fromISO!, t.toISO!)).join(' and ')})`
    : '';
  const overviewEn =
    `${periodHeadline(period, rashi, overall.tone)} ${overviewLead.text}` +
    (sadeSati ? ` Saturn is in your ${ORDINAL[sadeSati.house]} from the Moon${sadeSatiWhen}, so you are in a Sade Sati phase — a demanding but maturing period; steady, honest effort is rewarded and shortcuts are not.` : '');
  const overviewHi = `${rashi.hindi} राशि — ${label}. ` + overviewPicks.slice(0, 2).map(t => t.textHi).join(' ');

  const sections: RashifalSection[] = [
    {
      key: 'overview',
      title: SECTION_TITLES.overview.en,
      titleHi: SECTION_TITLES.overview.hi,
      grade: overall.grade,
      tone: overall.tone,
      text: overviewEn,
      textHi: overviewHi,
    },
  ];

  (['love', 'career', 'money', 'health'] as const).forEach(key => {
    const houses = SECTION_HOUSES[key];
    const relevant = transits
      .filter(t => houses.includes(t.house))
      .sort(byWeight);
    const st = combineTone(relevant);
    const txt = sectionText(key, relevant);
    sections.push({
      key, title: SECTION_TITLES[key].en, titleHi: SECTION_TITLES[key].hi,
      grade: st.grade, tone: st.tone, text: txt.en, textHi: txt.hi,
    });
  });

  // Real ingress notes for the period (slow planets only; cheap day-precision scan).
  const ingress: string[] = [];
  if (period === 'month' || period === 'year') {
    for (const p of SLOW) {
      // Every sign change in the period, not just the first (a retrograde return counts too).
      const segs = segmentsByPlanet.get(p) ?? signSegments(p, start, end);
      for (const sg of segs.slice(1)) {
        const d = new Date(sg.fromISO + 'T00:00:00Z');
        const when = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        const newHouse = houseFromMoon(sg.signIndex, signIndex);
        ingress.push(`${p} enters ${RASHIS[sg.signIndex].sanskrit} (${RASHIS[sg.signIndex].english}) on ${when} — your ${ORDINAL[newHouse]} house from the Moon.`);
      }
    }
  }

  return {
    rashi,
    period,
    periodLabel: label,
    dateRange: { startISO: start.toISOString().slice(0, 10), endISO: end.toISOString().slice(0, 10) },
    computedForISO: rep.toISOString(),
    overallTone: overall.tone,
    overallGrade: overall.grade,
    transits,
    sections,
    ingress,
    lucky: { color: rashi.luckyColor, colorHindi: rashi.luckyColorHindi, numbers: rashi.luckyNumbers },
  };
}

// ── Exports reused by the transit-by-year pages ──────────────────────────────
export type { PlanetName };

/** Read one planet's transit for a given Moon sign at an instant (gochar). */
export function readPlanetTransit(planet: PlanetName, moonSignIndex: number, at: Date): TransitReading {
  return buildTransit(planet, moonSignIndex, at);
}

/** Sidereal sign index (0..11) of a planet at an instant. */
export function transitSignIndex(planet: PlanetName, at: Date): number {
  return signIndexOf(planet, at);
}

/** Next sign-change (ingress) of a planet within [start, end], day precision. */
export function findIngress(planet: PlanetName, start: Date, end: Date): { signIndex: number; dateISO: string } | null {
  return ingressWithin(planet, start, end);
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "3 Jun – 20 Oct 2027" from two YYYY-MM-DD dates. */
export function rangeLabel(fromISO: string, toISO: string): string {
  const f = (iso: string, withYear: boolean) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${SHORT_MONTHS[m - 1]}${withYear ? ` ${y}` : ''}`;
  };
  const sameYear = fromISO.slice(0, 4) === toISO.slice(0, 4);
  return `${f(fromISO, !sameYear)} – ${f(toISO, true)}`;
}

/** Stronger grade first; within a grade, the reading covering more of the period first. */
function byWeight(a: TransitReading, b: TransitReading): number {
  return gradeRank(b.grade) - gradeRank(a.grade) || (b.share ?? 1) - (a.share ?? 1);
}

function gradeRank(g: Grade): number {
  return g === 'strong' ? 3 : g === 'moderate' ? 2 : 1;
}

function periodHeadline(period: RashifalPeriod, rashi: RashiMeta, tone: Tone): string {
  const t = tone === 'favourable' ? 'broadly supportive' : tone === 'challenging' ? 'demanding but workable' : 'mixed';
  const when = period === 'today' ? 'Today' : period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'This year';
  return `${when} reads as ${t} for ${rashi.sanskrit} (${rashi.english}).`;
}
