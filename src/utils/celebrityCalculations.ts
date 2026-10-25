import { ORBITAL_PERIOD_DAYS, OTHER_PLANETS, orbitalPeriodYears } from '@/lib/orbitalPeriods';
import { CelebrityDOB } from './celebrityUtils';
import { lifePathNumber } from '@/lib/lifePath';
import { getChineseYear } from '@/services/ChineseZodiacService';
import {
  moonSignsForDate, birthDayWindowForNationality, describeAlternatives, joinAlternatives,
  type DateOnlyMoonSigns,
} from '@/lib/vedic/dateOnlyMoonSign';

export function calculateAge(day: number, month: number, year: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  return Math.max(0, age);
}

export function calculateDaysLived(day: number, month: number, year: number): number {
  return Math.floor((Date.now() - new Date(year, month - 1, day).getTime()) / 86400000);
}

export function calculateDaysUntilBirthday(day: number, month: number): number {
  const today = new Date();
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next <= today) next = new Date(today.getFullYear() + 1, month - 1, day);
  return Math.ceil((next.getTime() - today.getTime()) / 86400000);
}

/** Life Path — delegates to the ONE shared sitewide function (src/lib/lifePath.ts, audit N1). */
export function calculateLifePathNumber(day: number, month: number, year: number): number {
  return lifePathNumber(day, month, year);
}

export const LIFE_PATH_TRAITS: Record<number, { title: string; traits: string }> = {
  1:  { title: 'The Leader',               traits: 'Independent, ambitious, pioneering, and self-reliant. Natural leaders who forge their own path.' },
  2:  { title: 'The Diplomat',             traits: 'Cooperative, sensitive, peaceful, and empathetic. Excellent mediators who thrive through collaboration.' },
  3:  { title: 'The Creative',             traits: 'Expressive, optimistic, social, and artistic. Natural communicators with a gift for inspiring.' },
  4:  { title: 'The Builder',              traits: 'Practical, disciplined, hardworking, and reliable. Methodical achievers who build lasting foundations.' },
  5:  { title: 'The Adventurer',           traits: 'Free-spirited, versatile, curious, and adaptable. Seekers who embrace change and freedom.' },
  6:  { title: 'The Nurturer',             traits: 'Responsible, caring, family-oriented, and harmonious. Natural caregivers devoted to community.' },
  7:  { title: 'The Seeker',               traits: 'Analytical, introspective, spiritual, and perceptive. Deep thinkers who pursue wisdom.' },
  8:  { title: 'The Achiever',             traits: 'Powerful, authoritative, business-minded, and goal-oriented. Natural executives who manifest success.' },
  9:  { title: 'The Humanitarian',         traits: 'Compassionate, idealistic, generous, and wise. Visionaries dedicated to the greater good.' },
  11: { title: 'The Visionary (Master 11)', traits: 'Highly intuitive, inspirational, and spiritually aware. Master number with heightened sensitivity.' },
  22: { title: 'The Master Builder (22)',  traits: 'Exceptionally capable and visionary. Potential for large-scale achievement.' },
  33: { title: 'The Master Teacher (33)',  traits: 'Deeply compassionate and uplifting. The rarest master number, dedicated to selfless service.' },
};

export interface ZodiacInfo {
  sign: string; symbol: string; element: string;
  ruling_planet: string; traits: string; date_range: string;
  endMonth: number; endDay: number;
}

const ZODIAC_DATA: ZodiacInfo[] = [
  { sign: 'Capricorn',   symbol: '♑', element: 'Earth', ruling_planet: 'Saturn',  traits: 'Ambitious, disciplined, practical, and patient.',        date_range: 'Dec 22 – Jan 19', endMonth: 1,  endDay: 19 },
  { sign: 'Aquarius',    symbol: '♒', element: 'Air',   ruling_planet: 'Uranus',  traits: 'Innovative, humanitarian, independent, intellectual.',    date_range: 'Jan 20 – Feb 18', endMonth: 2,  endDay: 18 },
  { sign: 'Pisces',      symbol: '♓', element: 'Water', ruling_planet: 'Neptune', traits: 'Empathetic, artistic, intuitive, and compassionate.',     date_range: 'Feb 19 – Mar 20', endMonth: 3,  endDay: 20 },
  { sign: 'Aries',       symbol: '♈', element: 'Fire',  ruling_planet: 'Mars',    traits: 'Courageous, energetic, enthusiastic, and confident.',     date_range: 'Mar 21 – Apr 19', endMonth: 4,  endDay: 19 },
  { sign: 'Taurus',      symbol: '♉', element: 'Earth', ruling_planet: 'Venus',   traits: 'Reliable, patient, practical, and devoted.',             date_range: 'Apr 20 – May 20', endMonth: 5,  endDay: 20 },
  { sign: 'Gemini',      symbol: '♊', element: 'Air',   ruling_planet: 'Mercury', traits: 'Versatile, curious, witty, and communicative.',          date_range: 'May 21 – Jun 20', endMonth: 6,  endDay: 20 },
  { sign: 'Cancer',      symbol: '♋', element: 'Water', ruling_planet: 'Moon',    traits: 'Nurturing, intuitive, protective, and loyal.',           date_range: 'Jun 21 – Jul 22', endMonth: 7,  endDay: 22 },
  { sign: 'Leo',         symbol: '♌', element: 'Fire',  ruling_planet: 'Sun',     traits: 'Generous, creative, confident, and dramatic.',           date_range: 'Jul 23 – Aug 22', endMonth: 8,  endDay: 22 },
  { sign: 'Virgo',       symbol: '♍', element: 'Earth', ruling_planet: 'Mercury', traits: 'Analytical, meticulous, helpful, and reliable.',         date_range: 'Aug 23 – Sep 22', endMonth: 9,  endDay: 22 },
  { sign: 'Libra',       symbol: '♎', element: 'Air',   ruling_planet: 'Venus',   traits: 'Diplomatic, fair, social, and idealistic.',             date_range: 'Sep 23 – Oct 22', endMonth: 10, endDay: 22 },
  { sign: 'Scorpio',     symbol: '♏', element: 'Water', ruling_planet: 'Pluto',   traits: 'Intense, passionate, determined, and perceptive.',       date_range: 'Oct 23 – Nov 21', endMonth: 11, endDay: 21 },
  { sign: 'Sagittarius', symbol: '♐', element: 'Fire',  ruling_planet: 'Jupiter', traits: 'Adventurous, optimistic, philosophical, and free.',      date_range: 'Nov 22 – Dec 21', endMonth: 12, endDay: 21 },
];

export function calculateWesternZodiac(day: number, month: number): ZodiacInfo {
  // ZODIAC_DATA is ordered by end date. A date belongs to the first sign whose
  // (endMonth, endDay) is >= the date. Dec 22–31 falls through to Capricorn (wrap).
  for (let i = 0; i < ZODIAC_DATA.length; i++) {
    const z = ZODIAC_DATA[i];
    if (month < z.endMonth || (month === z.endMonth && day <= z.endDay)) return z;
  }
  return ZODIAC_DATA[0]; // Dec 22-31 → Capricorn
}

export interface ChineseZodiacInfo {
  animal: string; emoji: string; element: string; traits: string;
}

/**
 * Chinese zodiac. Pass month + day whenever the full date is known: the sign changes
 * at Lunar New Year (late Jan / Feb), not on 1 January (audit N11) — the lunar year
 * comes from the same function the paid report uses (ChineseZodiacService).
 */
export function calculateChineseZodiac(gregorianYear: number, month?: number, day?: number): ChineseZodiacInfo {
  const year = month && day ? getChineseYear(new Date(gregorianYear, month - 1, day, 12)) : gregorianYear;
  const ANIMALS = [
    { animal: 'Rat',     emoji: '🐀', traits: 'Intelligent, adaptable, quick-witted.' },
    { animal: 'Ox',      emoji: '🐂', traits: 'Diligent, dependable, strong, determined.' },
    { animal: 'Tiger',   emoji: '🐅', traits: 'Brave, confident, competitive.' },
    { animal: 'Rabbit',  emoji: '🐇', traits: 'Quiet, elegant, kind, responsible.' },
    { animal: 'Dragon',  emoji: '🐉', traits: 'Confident, intelligent, charismatic.' },
    { animal: 'Snake',   emoji: '🐍', traits: 'Enigmatic, intuitive, refined.' },
    { animal: 'Horse',   emoji: '🐎', traits: 'Animated, active, energetic.' },
    { animal: 'Goat',    emoji: '🐐', traits: 'Mild-mannered, kind, creative.' },
    { animal: 'Monkey',  emoji: '🐒', traits: 'Sharp, smart, curious, mischievous.' },
    { animal: 'Rooster', emoji: '🐓', traits: 'Observant, hardworking, courageous.' },
    { animal: 'Dog',     emoji: '🐕', traits: 'Loyal, honest, amiable, kind.' },
    { animal: 'Pig',     emoji: '🐖', traits: 'Compassionate, generous, diligent.' },
  ];
  const ELEMENTS = ['Metal','Metal','Water','Water','Wood','Wood','Fire','Fire','Earth','Earth'];
  const animalIdx = ((year - 1900) % 12 + 12) % 12;
  const elementIdx = ((year - 1900) % 10 + 10) % 10;
  return { ...ANIMALS[animalIdx], element: ELEMENTS[elementIdx] };
}

/**
 * Vedic Rashi = the sidereal sign of the MOON at birth (Batch 6). The old
 * `calculateVedicRashi(day, month)` renamed the Western Sun sign (Libra → "Tula")
 * and `calculateNakshatra(day, month)` used a day-of-year fraction; both were wrong
 * for most dates and have been removed. With a birth DATE only, this returns every
 * Moon sign / Nakshatra possible between 00:00 and 23:59 local time that day
 * (IST unless a nationality window applies) — see src/lib/vedic/dateOnlyMoonSign.ts.
 */
export interface DateOnlyRashi {
  /** Rashi names possible that day (1 = certain, 2 = changed during the day). */
  rashis: string[];
  nakshatras: string[];
  /** "Tula" or "Tula or Vrischika (depends on birth time)". */
  rashiText: string;
  /** "Tula" or "Tula or Vrischika" (for short snippets). */
  rashiShort: string;
  nakshatraText: string;
  isCertain: boolean;
  details: DateOnlyMoonSigns;
}

export function calculateDateOnlyRashi(
  day: number, month: number, year: number, nationalityCode?: string | null,
): DateOnlyRashi | null {
  const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const details = moonSignsForDate(iso, birthDayWindowForNationality(nationalityCode));
  if (!details) return null;
  return {
    rashis: details.signNames,
    nakshatras: details.nakshatraNames,
    rashiText: describeAlternatives(details.signNames),
    rashiShort: joinAlternatives(details.signNames),
    nakshatraText: describeAlternatives(details.nakshatraNames),
    isCertain: details.signNames.length === 1,
    details,
  };
}

export interface PlanetaryAge {
  planet: string; emoji: string; age: number; orbit_years: number;
}

export function calculatePlanetaryAges(dob: CelebrityDOB): PlanetaryAge[] {
  if (!dob.isFullDate) return []; // Never calculate for year-only DOB
  const daysLived = calculateDaysLived(dob.day, dob.month, dob.year);
  // N13: one shared NASA orbital-period table (src/lib/orbitalPeriods.ts).
  const EMOJI: Record<string, string> = { Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆' };
  return OTHER_PLANETS.map(planet => ({
    planet,
    emoji: EMOJI[planet],
    age: Math.floor(daysLived / ORBITAL_PERIOD_DAYS[planet]),
    orbit_years: Math.round(orbitalPeriodYears(planet) * 10) / 10,
  }));
}
