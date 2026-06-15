// Ayanamsa offset (degrees) to convert tropical to sidereal
const AYANAMSA_DEGREES = 23.85;

export const VEDIC_SIGNS = [
  {
    name: 'Mesha',
    english: 'Aries',
    symbol: '♈',
    emoji: '🐏',
    ruling_planet: 'Mars',
    element: 'Fire',
    quality: 'Cardinal',
    traits: ['Courageous', 'Enthusiastic', 'Impulsive', 'Dynamic'],
    description: 'Mesha (Aries) natives are natural leaders with great courage and enthusiasm. They are independent, pioneering, and full of vitality.',
    start_degree: 0,
  },
  {
    name: 'Vrishabha',
    english: 'Taurus',
    symbol: '♉',
    emoji: '🐂',
    ruling_planet: 'Venus',
    element: 'Earth',
    quality: 'Fixed',
    traits: ['Patient', 'Reliable', 'Determined', 'Sensual'],
    description: 'Vrishabha (Taurus) natives are patient, practical, and love comfort. They are loyal friends and have a deep appreciation for beauty.',
    start_degree: 30,
  },
  {
    name: 'Mithuna',
    english: 'Gemini',
    symbol: '♊',
    emoji: '👯',
    ruling_planet: 'Mercury',
    element: 'Air',
    quality: 'Mutable',
    traits: ['Versatile', 'Communicative', 'Curious', 'Witty'],
    description: 'Mithuna (Gemini) natives are quick thinkers and great communicators. They are curious, adaptable, and always eager to learn.',
    start_degree: 60,
  },
  {
    name: 'Karka',
    english: 'Cancer',
    symbol: '♋',
    emoji: '🦀',
    ruling_planet: 'Moon',
    element: 'Water',
    quality: 'Cardinal',
    traits: ['Nurturing', 'Emotional', 'Intuitive', 'Protective'],
    description: 'Karka (Cancer) natives are deeply emotional and intuitive. They are caring, protective, and strongly connected to home and family.',
    start_degree: 90,
  },
  {
    name: 'Simha',
    english: 'Leo',
    symbol: '♌',
    emoji: '🦁',
    ruling_planet: 'Sun',
    element: 'Fire',
    quality: 'Fixed',
    traits: ['Generous', 'Loyal', 'Creative', 'Confident'],
    description: 'Simha (Leo) natives are charismatic and warm-hearted leaders. They are generous, dramatic, and have a natural flair for performance.',
    start_degree: 120,
  },
  {
    name: 'Kanya',
    english: 'Virgo',
    symbol: '♍',
    emoji: '👩‍🌾',
    ruling_planet: 'Mercury',
    element: 'Earth',
    quality: 'Mutable',
    traits: ['Analytical', 'Meticulous', 'Service-oriented', 'Practical'],
    description: 'Kanya (Virgo) natives are highly analytical and detail-oriented. They excel at service, are deeply observant, and seek perfection.',
    start_degree: 150,
  },
  {
    name: 'Tula',
    english: 'Libra',
    symbol: '♎',
    emoji: '⚖️',
    ruling_planet: 'Venus',
    element: 'Air',
    quality: 'Cardinal',
    traits: ['Diplomatic', 'Charming', 'Fair-minded', 'Idealistic'],
    description: 'Tula (Libra) natives seek harmony and balance in all things. They are charming diplomats with a refined aesthetic sense.',
    start_degree: 180,
  },
  {
    name: 'Vrishchika',
    english: 'Scorpio',
    symbol: '♏',
    emoji: '🦂',
    ruling_planet: 'Mars',
    element: 'Water',
    quality: 'Fixed',
    traits: ['Intense', 'Passionate', 'Perceptive', 'Transformative'],
    description: 'Vrishchika (Scorpio) natives are intense and passionate. They have penetrating insight and an ability to transform both themselves and others.',
    start_degree: 210,
  },
  {
    name: 'Dhanu',
    english: 'Sagittarius',
    symbol: '♐',
    emoji: '🏹',
    ruling_planet: 'Jupiter',
    element: 'Fire',
    quality: 'Mutable',
    traits: ['Optimistic', 'Philosophical', 'Adventurous', 'Freedom-loving'],
    description: 'Dhanu (Sagittarius) natives are optimistic philosophers who love freedom and adventure. They seek wisdom through travel and experience.',
    start_degree: 240,
  },
  {
    name: 'Makara',
    english: 'Capricorn',
    symbol: '♑',
    emoji: '🐐',
    ruling_planet: 'Saturn',
    element: 'Earth',
    quality: 'Cardinal',
    traits: ['Disciplined', 'Ambitious', 'Responsible', 'Persistent'],
    description: 'Makara (Capricorn) natives are disciplined and ambitious achievers. They are patient builders who work methodically toward their goals.',
    start_degree: 270,
  },
  {
    name: 'Kumbha',
    english: 'Aquarius',
    symbol: '♒',
    emoji: '🏺',
    ruling_planet: 'Saturn',
    element: 'Air',
    quality: 'Fixed',
    traits: ['Humanitarian', 'Original', 'Progressive', 'Independent'],
    description: 'Kumbha (Aquarius) natives are visionary humanitarians. They are independent thinkers who champion progressive ideas and social causes.',
    start_degree: 300,
  },
  {
    name: 'Meena',
    english: 'Pisces',
    symbol: '♓',
    emoji: '🐟',
    ruling_planet: 'Jupiter',
    element: 'Water',
    quality: 'Mutable',
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Spiritual'],
    description: 'Meena (Pisces) natives are deeply compassionate and spiritually attuned. They are imaginative, empathetic, and highly creative.',
    start_degree: 330,
  },
] as const;

function getJulianDay(dob: Date): number {
  const y = dob.getUTCFullYear();
  const m = dob.getUTCMonth() + 1;
  const d = dob.getUTCDate();
  const A = Math.floor((14 - m) / 12);
  const Y = y + 4800 - A;
  const M = m + 12 * A - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}

function getSunDegreeTropical(dob: Date): number {
  const jd = getJulianDay(dob);
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const lambda = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return ((lambda % 360) + 360) % 360;
}

export function getVedicRashi(dob: Date): typeof VEDIC_SIGNS[number] {
  const tropical = getSunDegreeTropical(dob);
  const sidereal = ((tropical - AYANAMSA_DEGREES) % 360 + 360) % 360;
  const signIndex = Math.floor(sidereal / 30);
  return VEDIC_SIGNS[signIndex];
}

export function getWesternSign(dob: Date): string {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

export function compareZodiacs(dob: Date): {
  westernSign: string;
  vedicRashi: typeof VEDIC_SIGNS[number];
  isSame: boolean;
  note: string;
} {
  const westernSign = getWesternSign(dob);
  const vedicRashi = getVedicRashi(dob);
  const isSame = westernSign === vedicRashi.english;
  const note = isSame
    ? 'Your Western and Vedic signs are the same — you were born in the sweet spot of the zodiac calendar.'
    : `Your Vedic sign (${vedicRashi.name}/${vedicRashi.english}) differs from your Western sign (${westernSign}) due to the ~24° ayanamsa offset between the sidereal and tropical zodiac systems.`;
  return { westernSign, vedicRashi, isSame, note };
}
