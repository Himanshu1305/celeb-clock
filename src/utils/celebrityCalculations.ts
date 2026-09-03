import { CelebrityDOB } from './celebrityUtils';

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

function reduceToSingle(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduceToSingle(String(n).split('').reduce((a, d) => a + Number(d), 0));
}

export function calculateLifePathNumber(day: number, month: number, year: number): number {
  const d = reduceToSingle(day);
  const m = reduceToSingle(month);
  const y = reduceToSingle(String(year).split('').reduce((a, c) => a + Number(c), 0));
  return reduceToSingle(d + m + y);
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
  for (let i = 0; i < ZODIAC_DATA.length; i++) {
    const z = ZODIAC_DATA[i];
    if (month === z.endMonth && day <= z.endDay) return z;
    if (month < z.endMonth) return ZODIAC_DATA[i === 0 ? 11 : i - 1];
  }
  return ZODIAC_DATA[0]; // Dec 22-31 → Capricorn
}

export interface ChineseZodiacInfo {
  animal: string; emoji: string; element: string; traits: string;
}

export function calculateChineseZodiac(year: number): ChineseZodiacInfo {
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

export interface RashiInfo {
  rashi: string; lord: string; element: string;
  traits: string; western_equivalent: string;
}

export function calculateVedicRashi(day: number, month: number): RashiInfo {
  const RASHIS: RashiInfo[] = [
    { rashi: 'Makara',    lord: 'Shani',  element: 'Earth', traits: 'Disciplined, ambitious, practical.', western_equivalent: 'Capricorn' },
    { rashi: 'Kumbha',    lord: 'Shani',  element: 'Air',   traits: 'Innovative, humanitarian, independent.', western_equivalent: 'Aquarius' },
    { rashi: 'Meena',     lord: 'Guru',   element: 'Water', traits: 'Compassionate, intuitive, spiritual.', western_equivalent: 'Pisces' },
    { rashi: 'Mesha',     lord: 'Mangal', element: 'Fire',  traits: 'Courageous, energetic, pioneering.', western_equivalent: 'Aries' },
    { rashi: 'Vrishabha', lord: 'Shukra', element: 'Earth', traits: 'Reliable, patient, sensual.', western_equivalent: 'Taurus' },
    { rashi: 'Mithuna',   lord: 'Budha',  element: 'Air',   traits: 'Versatile, curious, communicative.', western_equivalent: 'Gemini' },
    { rashi: 'Karka',     lord: 'Chandra',element: 'Water', traits: 'Nurturing, intuitive, protective.', western_equivalent: 'Cancer' },
    { rashi: 'Simha',     lord: 'Surya',  element: 'Fire',  traits: 'Generous, creative, charismatic.', western_equivalent: 'Leo' },
    { rashi: 'Kanya',     lord: 'Budha',  element: 'Earth', traits: 'Analytical, meticulous, practical.', western_equivalent: 'Virgo' },
    { rashi: 'Tula',      lord: 'Shukra', element: 'Air',   traits: 'Diplomatic, fair, idealistic.', western_equivalent: 'Libra' },
    { rashi: 'Vrischika', lord: 'Mangal', element: 'Water', traits: 'Intense, passionate, perceptive.', western_equivalent: 'Scorpio' },
    { rashi: 'Dhanu',     lord: 'Guru',   element: 'Fire',  traits: 'Adventurous, optimistic, philosophical.', western_equivalent: 'Sagittarius' },
  ];
  const zodiac = calculateWesternZodiac(day, month);
  const map: Record<string, number> = {
    Capricorn:0, Aquarius:1, Pisces:2, Aries:3, Taurus:4, Gemini:5,
    Cancer:6, Leo:7, Virgo:8, Libra:9, Scorpio:10, Sagittarius:11,
  };
  return RASHIS[map[zodiac.sign] ?? 0];
}

export interface NakshatraInfo {
  nakshatra: string; number: number; lord: string; symbol: string; quality: string;
}

export function calculateNakshatra(day: number, month: number): NakshatraInfo {
  const NAKSHATRAS: NakshatraInfo[] = [
    { nakshatra: 'Ashwini',           number: 1,  lord: 'Ketu',   symbol: 'Horse head',     quality: 'Swift, healing, pioneering' },
    { nakshatra: 'Bharani',           number: 2,  lord: 'Shukra', symbol: 'Yoni',            quality: 'Creative, transformative' },
    { nakshatra: 'Krittika',          number: 3,  lord: 'Surya',  symbol: 'Razor',           quality: 'Purifying, sharp, determined' },
    { nakshatra: 'Rohini',            number: 4,  lord: 'Chandra',symbol: 'Chariot',         quality: 'Fertile, nurturing, growth' },
    { nakshatra: 'Mrigashira',        number: 5,  lord: 'Mangal', symbol: 'Deer head',       quality: 'Gentle, searching, curious' },
    { nakshatra: 'Ardra',             number: 6,  lord: 'Rahu',   symbol: 'Teardrop',        quality: 'Stormy, transformative' },
    { nakshatra: 'Punarvasu',         number: 7,  lord: 'Guru',   symbol: 'Quiver',          quality: 'Restoring, optimistic' },
    { nakshatra: 'Pushya',            number: 8,  lord: 'Shani',  symbol: 'Flower',          quality: 'Nourishing, protective' },
    { nakshatra: 'Ashlesha',          number: 9,  lord: 'Budha',  symbol: 'Serpent',         quality: 'Mystical, sharp, perceptive' },
    { nakshatra: 'Magha',             number: 10, lord: 'Ketu',   symbol: 'Royal throne',    quality: 'Regal, ancestral, powerful' },
    { nakshatra: 'Purva Phalguni',    number: 11, lord: 'Shukra', symbol: 'Hammock',         quality: 'Creative, joyful' },
    { nakshatra: 'Uttara Phalguni',   number: 12, lord: 'Surya',  symbol: 'Bed',             quality: 'Service-oriented, committed' },
    { nakshatra: 'Hasta',             number: 13, lord: 'Chandra',symbol: 'Hand',            quality: 'Skilled, resourceful, witty' },
    { nakshatra: 'Chitra',            number: 14, lord: 'Mangal', symbol: 'Pearl',           quality: 'Artistic, beautiful' },
    { nakshatra: 'Swati',             number: 15, lord: 'Rahu',   symbol: 'Sword',           quality: 'Independent, flexible' },
    { nakshatra: 'Vishakha',          number: 16, lord: 'Guru',   symbol: 'Triumphal arch',  quality: 'Purposeful, ambitious' },
    { nakshatra: 'Anuradha',          number: 17, lord: 'Shani',  symbol: 'Lotus',           quality: 'Devoted, friendly' },
    { nakshatra: 'Jyeshtha',          number: 18, lord: 'Budha',  symbol: 'Umbrella',        quality: 'Protective, responsible' },
    { nakshatra: 'Mula',              number: 19, lord: 'Ketu',   symbol: 'Tied roots',      quality: 'Investigative, transformative' },
    { nakshatra: 'Purva Ashadha',     number: 20, lord: 'Shukra', symbol: 'Fan',             quality: 'Invincible, purifying' },
    { nakshatra: 'Uttara Ashadha',    number: 21, lord: 'Surya',  symbol: 'Elephant tusk',   quality: 'Victorious, ethical' },
    { nakshatra: 'Shravana',          number: 22, lord: 'Chandra',symbol: 'Three footprints', quality: 'Listening, connecting' },
    { nakshatra: 'Dhanishtha',        number: 23, lord: 'Mangal', symbol: 'Drum',            quality: 'Wealthy, musical, social' },
    { nakshatra: 'Shatabhisha',       number: 24, lord: 'Rahu',   symbol: '100 stars',       quality: 'Healing, independent' },
    { nakshatra: 'Purva Bhadrapada',  number: 25, lord: 'Guru',   symbol: 'Sword',           quality: 'Fiery, transformative' },
    { nakshatra: 'Uttara Bhadrapada', number: 26, lord: 'Shani',  symbol: 'Twins',           quality: 'Deep, wise, restrained' },
    { nakshatra: 'Revati',            number: 27, lord: 'Budha',  symbol: 'Fish',            quality: 'Nourishing, wealthy, completion' },
  ];
  const dayOfYear = Math.floor(
    (new Date(2000, month - 1, day).getTime() - new Date(2000, 0, 1).getTime()) / 86400000
  );
  return NAKSHATRAS[Math.floor((dayOfYear / 365) * 27) % 27];
}

export interface PlanetaryAge {
  planet: string; emoji: string; age: number; orbit_years: number;
}

export function calculatePlanetaryAges(dob: CelebrityDOB): PlanetaryAge[] {
  if (!dob.isFullDate) return []; // Never calculate for year-only DOB
  const daysLived = calculateDaysLived(dob.day, dob.month, dob.year);
  return [
    { planet: 'Mercury', emoji: '☿', age: Math.floor(daysLived / 88),    orbit_years: 0.2 },
    { planet: 'Venus',   emoji: '♀', age: Math.floor(daysLived / 225),   orbit_years: 0.6 },
    { planet: 'Mars',    emoji: '♂', age: Math.floor(daysLived / 687),   orbit_years: 1.9 },
    { planet: 'Jupiter', emoji: '♃', age: Math.floor(daysLived / 4333),  orbit_years: 11.9 },
    { planet: 'Saturn',  emoji: '♄', age: Math.floor(daysLived / 10759), orbit_years: 29.5 },
    { planet: 'Uranus',  emoji: '♅', age: Math.floor(daysLived / 30687), orbit_years: 84.0 },
    { planet: 'Neptune', emoji: '♆', age: Math.floor(daysLived / 60190), orbit_years: 164.8 },
  ];
}
