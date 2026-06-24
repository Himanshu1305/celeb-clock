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
    description: 'Mesha natives carry the fire of pure beginning — they are the pioneers, the initiators, the ones who move while others still deliberate. Ruled by Mars, they possess extraordinary raw courage and an instinct for action that is genuinely rare. They do not wait for permission. Their challenge is converting this magnificent energy from impulse into sustained direction. When a Mesha native commits their fire to a worthy cause, they become unstoppable — the kind of person others later say they knew before they were famous.',
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
    description: 'Vrishabha natives are the earth made conscious — steady, sensory, and deeply connected to the material world in the most beautiful sense. Ruled by Venus, they have a natural eye for beauty, an instinct for quality, and a capacity for loyalty that borders on the extraordinary. They are not slow — they are deliberate. Once a Vrishabha commits, they commit completely. Their love is the kind that endures decades. Their challenge is knowing when to release what no longer serves, since their strength can become their prison when applied to the wrong things.',
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
    description: 'Mithuna natives are perhaps the most intellectually alive of all the rashis — curious, quick, and endlessly interested in the texture of ideas. Ruled by Mercury, the planet of communication and commerce, they think fast, speak well, and make connections between seemingly unrelated things that others simply cannot see. They are the networkers, the synthesisers, the people who know everyone and somehow keep track of it all. Their challenge is depth over breadth — learning to stay with one idea, one relationship, one path long enough to discover what lies beneath the surface. When they do, their brilliance becomes wisdom.',
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
    description: 'Karka natives feel the world more intensely than they ever reveal — their emotional landscape is vast, complex, and deeply connected to the people they love. Ruled by the Moon, they are attuned to cycles, to the unspoken, to the emotional weather in any room. They are the ones who remember. Who notice. Who show up with exactly what you needed before you asked. This intuitive care is one of the most powerful gifts in the zodiac. Their challenge is protecting this gift — learning to set boundaries that preserve their emotional energy for those who genuinely deserve it.',
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
    description: "Simha natives are born carrying the Sun's instruction: to shine. Ruled by Surya, they have a natural magnetism, a generous heart, and a theatrical instinct that makes ordinary moments feel significant. They are not just entertaining — they are enlivening. People feel more alive in their presence. Their gift is warmth without condition, leadership without domination. Their challenge is distinguishing between the ego's need for applause and the soul's deeper calling to illuminate. The most evolved Simha natives discover that their true power lies not in being seen, but in helping others discover their own light.",
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
    description: 'Kanya natives possess one of the rarest gifts in the zodiac: the ability to see exactly what is wrong and exactly how to fix it. Ruled by Mercury in its analytical dimension, they are precise, dedicated, and quietly extraordinary in their capacity for detailed work. Do not mistake their modesty for lack of ambition — they simply prefer the quality of the result to the applause for the effort. Their challenge is the inner critic, which turns the discernment that makes them exceptional into a harsh voice that holds them back. The integrated Kanya discovers that the same standards they apply to the world can be applied to themselves with compassion rather than judgment.',
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
    description: "Tula natives are the zodiac's great harmonisers — they feel imbalance in a room the way a musician hears a flat note. Ruled by Venus in her intellectual aspect, they seek beauty, fairness, and genuine connection with an almost painful sincerity. They are the ones who will stay in a difficult conversation until both sides feel heard. Their natural charm is not performance — it is their authentic way of navigating a world they genuinely want to improve. Their challenge is the weight of constant weighing: learning to make decisions without needing perfect information, and to trust themselves when the scales remain imperfect.",
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
    description: "Vrishchika natives carry a depth that is genuinely uncommon — they do not skim the surface of experience, they go to the bottom of it. Ruled by Mars and the transformative forces of Pluto, they are drawn to what is hidden, what is real, what is stripped of pretense. They are loyal beyond reason and perceptive beyond comfort — they will see through you, and then choose you anyway if they find you worth knowing. Their challenge is the shadow of their power: the capacity for intensity that can become control, and the gift of perception that can become paranoia. The evolved Vrishchika learns that true power is in transformation — theirs and others' — not in control.",
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
    description: "Dhanu natives are the seekers — they carry a restless philosophical fire that propels them toward the horizon of meaning. Ruled by Jupiter, the planet of expansion and wisdom, they are optimistic not from naivety but from a genuine experience of abundance. They have seen enough of life to know that more is possible. Their generosity is real, their enthusiasm contagious, and their instinct for the larger pattern unusually developed. Their challenge is completion: the archer who loves the journey can sometimes forget to plant their arrow. The evolved Dhanu discovers that the deepest adventure is not always the one requiring a passport — wisdom is also a destination.",
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
    description: 'Makara natives understand something that most people only grasp at fifty: that lasting achievement is built, not found. Ruled by Saturn, the planet of structure, time, and consequence, they have an extraordinary capacity for disciplined effort and strategic patience. They are the long game incarnate. What looks like caution from the outside is actually precision — they choose carefully, build deliberately, and rarely need to rebuild. Their challenge is the weight of their own standards: the Saturn influence that makes them exceptional can also make them unnecessarily severe with themselves. The integrated Makara discovers that rest is not weakness — it is the foundation that makes the climb possible.',
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
    description: "Kumbha natives carry a vision of the world as it could be that is so clear and compelling that ordinary reality frequently disappoints them. Ruled by Saturn and the forces of Uranus, they are simultaneously structured and revolutionary — they can see the system's flaws and design the alternative. They are the reformers, the visionaries, the people who were right about things fifteen years before everyone else caught up. Their challenge is the distance this creates: the very clarity that makes them ahead of their time can make them feel perpetually out of step. The evolved Kumbha learns that the future they see so clearly needs their presence in the present to arrive.",
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
    description: 'Meena natives live at the intersection of the visible world and something deeper — they are the most permeable of all the rashis, absorbing the emotional and spiritual atmosphere around them with a sensitivity that is both gift and vulnerability. Ruled by Jupiter and the dissolving forces of Neptune, they are imaginative, compassionate, and connected to dimensions of experience that more earthbound signs simply cannot access. Their intuition is so developed it borders on the prophetic. Their challenge is boundaries — learning to be fully present in the world without being consumed by it. The evolved Meena discovers that their porousness, properly managed, is not a weakness but a superpower: the capacity for empathy so complete that it becomes healing.',
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
