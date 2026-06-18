// Birthday Personality Data Engine
// Provides zodiac, numerology, traits, compatibility and date facts for every calendar date.

export interface BirthdayPersonality {
  month: number;
  day: number;
  zodiacSign: string;
  zodiacSymbol: string;
  element: string;
  rulingPlanet: string;
  lifePathNumber: number;
  coreTraits: string[];
  strengths: string[];
  challenges: string[];
  luckyDay: string;
  luckyColor: string;
  luckyNumber: number;
  compatibleSigns: string[];
  dateFact: string;
  personalityBlurb: string;
}

// ── Zodiac data ────────────────────────────────────────────────────────────────

interface ZodiacInfo {
  sign: string;
  symbol: string;
  element: string;
  planet: string;
  color: string;
  compatible: string[];
  strengths: string[];
  challenges: string[];
}

const ZODIAC_DATA: ZodiacInfo[] = [
  {
    sign: 'Capricorn', symbol: '♑', element: 'Earth', planet: 'Saturn', color: 'Dark Brown',
    compatible: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    strengths: ['disciplined', 'responsible', 'ambitious'],
    challenges: ['overly cautious', 'pessimistic at times'],
  },
  {
    sign: 'Aquarius', symbol: '♒', element: 'Air', planet: 'Uranus', color: 'Electric Blue',
    compatible: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    strengths: ['original', 'humanitarian', 'visionary'],
    challenges: ['detached', 'unpredictable in emotion'],
  },
  {
    sign: 'Pisces', symbol: '♓', element: 'Water', planet: 'Neptune', color: 'Sea Green',
    compatible: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    strengths: ['empathetic', 'imaginative', 'compassionate'],
    challenges: ['overly idealistic', 'prone to escapism'],
  },
  {
    sign: 'Aries', symbol: '♈', element: 'Fire', planet: 'Mars', color: 'Red',
    compatible: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    strengths: ['courageous', 'energetic', 'pioneering'],
    challenges: ['impulsive', 'impatient under pressure'],
  },
  {
    sign: 'Taurus', symbol: '♉', element: 'Earth', planet: 'Venus', color: 'Emerald Green',
    compatible: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    strengths: ['dependable', 'persistent', 'sensual'],
    challenges: ['stubborn', 'resistant to change'],
  },
  {
    sign: 'Gemini', symbol: '♊', element: 'Air', planet: 'Mercury', color: 'Yellow',
    compatible: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    strengths: ['adaptable', 'curious', 'articulate'],
    challenges: ['inconsistent', 'scattered focus'],
  },
  {
    sign: 'Cancer', symbol: '♋', element: 'Water', planet: 'Moon', color: 'Silver',
    compatible: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    strengths: ['nurturing', 'loyal', 'intuitive'],
    challenges: ['moody', 'overly sensitive'],
  },
  {
    sign: 'Leo', symbol: '♌', element: 'Fire', planet: 'Sun', color: 'Gold',
    compatible: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    strengths: ['generous', 'confident', 'warm-hearted'],
    challenges: ['prideful', 'craves validation'],
  },
  {
    sign: 'Virgo', symbol: '♍', element: 'Earth', planet: 'Mercury', color: 'Forest Green',
    compatible: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    strengths: ['analytical', 'hardworking', 'practical'],
    challenges: ['overly critical', 'worries excessively'],
  },
  {
    sign: 'Libra', symbol: '♎', element: 'Air', planet: 'Venus', color: 'Pink',
    compatible: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    strengths: ['fair-minded', 'diplomatic', 'charming'],
    challenges: ['indecisive', 'avoids conflict to a fault'],
  },
  {
    sign: 'Scorpio', symbol: '♏', element: 'Water', planet: 'Pluto', color: 'Deep Red',
    compatible: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    strengths: ['resourceful', 'intense', 'perceptive'],
    challenges: ['jealous', 'secretive at times'],
  },
  {
    sign: 'Sagittarius', symbol: '♐', element: 'Fire', planet: 'Jupiter', color: 'Purple',
    compatible: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    strengths: ['optimistic', 'adventurous', 'philosophical'],
    challenges: ['impatient', 'overly blunt'],
  },
];

// ── Life path modifiers ────────────────────────────────────────────────────────

interface LifePathData {
  traits: string[];
  luckyDay: string;
  description: string;
}

const LIFE_PATH_DATA: Record<number, LifePathData> = {
  1: { traits: ['natural leader', 'self-reliant', 'driven by originality'], luckyDay: 'Sunday', description: 'the path of the pioneer' },
  2: { traits: ['deeply cooperative', 'intuitive', 'seeks harmony'], luckyDay: 'Monday', description: 'the path of the peacemaker' },
  3: { traits: ['creative communicator', 'expressive', 'playfully optimistic'], luckyDay: 'Wednesday', description: 'the path of the artist' },
  4: { traits: ['methodical', 'dependable', 'values structure'], luckyDay: 'Saturday', description: 'the path of the builder' },
  5: { traits: ['freedom-loving', 'adaptable', 'craves new experiences'], luckyDay: 'Wednesday', description: 'the path of the explorer' },
  6: { traits: ['nurturing', 'responsible', 'driven by service'], luckyDay: 'Friday', description: 'the path of the healer' },
  7: { traits: ['analytical', 'introspective', 'philosophical'], luckyDay: 'Thursday', description: 'the path of the seeker' },
  8: { traits: ['ambitious', 'executive ability', 'material mastery'], luckyDay: 'Saturday', description: 'the path of the achiever' },
  9: { traits: ['compassionate', 'globally aware', 'old-soul wisdom'], luckyDay: 'Tuesday', description: 'the path of the humanitarian' },
};

// ── Sign × Life-path trait matrix (12 × 9 = 108 combinations) ────────────────
// Format: [4 core traits for this exact combination]

const TRAIT_MATRIX: Record<string, Record<number, string[]>> = {
  Aries: {
    1: ['fearless trailblazer', 'fiercely independent', 'bold decision-maker', 'inspires action in others'],
    2: ['competitive but considerate', 'leads through partnership', 'passionate negotiator', 'bridges courage and empathy'],
    3: ['charismatic performer', 'spontaneously creative', 'energetic storyteller', 'turns ideas into excitement'],
    4: ['disciplined pioneer', 'builds lasting systems', 'methodical risk-taker', 'strategy behind the bravado'],
    5: ['restless adventurer', 'seeks constant stimulus', 'magnetic free spirit', 'thrives on the cutting edge'],
    6: ['protects loved ones fiercely', 'leads with heart', 'passionate caretaker', 'merges strength with warmth'],
    7: ['philosophical warrior', 'questions before acting', 'introspective leader', 'fire fueled by insight'],
    8: ['born executive', 'ambitious with authority', 'commands resources', 'turns ambition into empire'],
    9: ['crusader for justice', 'fights for the underdog', 'selfless competitor', 'worldly and courageous'],
  },
  Taurus: {
    1: ['original craftsperson', 'independent in taste', 'sets their own standards', 'combines beauty with boldness'],
    2: ['devoted partner', 'deeply loyal friend', 'values quiet harmony', 'patient and steady in relationships'],
    3: ['artistic sensualist', 'creates beauty through words', 'expressive and earthy', 'finds joy in simple pleasures'],
    4: ['master of craft', 'builds with patience', 'reliable architect', 'excellence through persistence'],
    5: ['unexpectedly adventurous', 'seeks sensory variety', 'flexible within structure', 'earthy wanderer'],
    6: ['natural provider', 'home is sacred', 'generous caretaker', 'grounds others with warmth'],
    7: ['deeply contemplative', 'earthy philosopher', 'values solitude for growth', 'wisdom through patience'],
    8: ['material mastery', 'financial acumen', 'builds lasting wealth', 'combines taste with ambition'],
    9: ['generous spirit', 'shares abundance freely', 'earthy humanitarian', 'blends practicality with compassion'],
  },
  Gemini: {
    1: ['pioneering communicator', 'original thinker', 'leading with language', 'ideas that spark movements'],
    2: ['gifted listener', 'connects people', 'bridges perspectives', 'social harmony through conversation'],
    3: ['ultimate creative', 'witty and expressive', 'life of the party', 'storyteller extraordinaire'],
    4: ['structured intellectual', 'organizes information masterfully', 'disciplined writer', 'ideas with lasting impact'],
    5: ['curious explorer', 'thrives on novelty', 'jack of many trades', 'mind that never stops'],
    6: ['communicates with care', 'teacher and nurturer', 'connects through service', 'words that heal'],
    7: ['deep thinker', 'philosophical conversationalist', 'connects dots others miss', 'mind meets intuition'],
    8: ['strategic communicator', 'influential voice', 'leverages intelligence', 'ideas become power'],
    9: ['worldly speaker', 'advocates through storytelling', 'teaches with compassion', 'mind with a mission'],
  },
  Cancer: {
    1: ['emotionally self-sufficient', 'leads through intuition', 'original in nurturing', 'pioneering caretaker'],
    2: ['deeply empathetic partner', 'reads emotions perfectly', 'creates safe spaces', 'soul-level connection'],
    3: ['creative nurturer', 'artistic homemaker', 'expressive with feelings', 'turns emotion into art'],
    4: ['builds stable homes', 'steady protector', 'reliable emotional anchor', 'consistency is love'],
    5: ['emotionally adventurous', 'breaks family patterns', 'explores new ways to nurture', 'free-spirited care'],
    6: ['ultimate caregiver', 'sacrifices for loved ones', 'healer at heart', 'home is their kingdom'],
    7: ['deeply intuitive', 'psychic empathy', 'emotional philosopher', 'feels what others miss'],
    8: ['emotionally powerful', 'builds family legacy', 'protects through success', 'strength through vulnerability'],
    9: ['mother of the world', 'universal empathy', 'cosmic caretaker', 'compassion without borders'],
  },
  Leo: {
    1: ['born ruler', 'original creative force', 'commands any room', 'the star of their own story'],
    2: ['generous partner', 'lights up relationships', 'diplomatic leader', 'heart of gold with diplomacy'],
    3: ['performing arts genius', 'entertaining brilliance', 'natural on stage', 'joy embodied'],
    4: ['reliable leader', 'builds with heart', 'structured generosity', 'loyalty over glamour'],
    5: ['adventurous star', 'seeks new stages', 'freedom feeds the fire', 'thrives on variety'],
    6: ['generous ruler', 'protects kingdom fiercely', 'leads through love', 'warmth as superpower'],
    7: ['philosopher king/queen', 'regal introspection', 'seeks meaning behind fame', 'wisdom through solitude'],
    8: ['powerful executive', 'born for leadership', 'combines fame with fortune', 'legacy-builder'],
    9: ['humanitarian star', 'uses platform for good', 'generous with the world', 'leads with compassion'],
  },
  Virgo: {
    1: ['self-made perfectionist', 'original analyst', 'forges their own methods', 'leads through detail'],
    2: ['cooperative helper', 'team player in service', 'builds systems with others', 'precision and partnership'],
    3: ['creative analyst', 'articulate and witty', 'expresses through precision', 'writing with beauty'],
    4: ['master craftsperson', 'perfection through practice', 'disciplined and dedicated', 'builds excellence'],
    5: ['analytical adventurer', 'explores through research', 'curious problem-solver', 'practical explorer'],
    6: ['devoted servant', 'healer through service', 'reliable caregiver', 'perfection as love'],
    7: ['deep researcher', 'philosophical analyst', 'seeks truth obsessively', 'mind of extraordinary depth'],
    8: ['strategic achiever', 'detail drives success', 'builds through precision', 'analytical powerhouse'],
    9: ['serves humanity', 'compassionate analyst', 'improves the world', 'wisdom through service'],
  },
  Libra: {
    1: ['independent diplomat', 'original sense of justice', 'pioneer of fairness', 'leads through balance'],
    2: ['natural partner', 'thrives in relationship', 'harmony is their art', 'intuitive balance'],
    3: ['charming creative', 'aesthetic genius', 'art and beauty in everything', 'social butterfly'],
    4: ['builds fair systems', 'structured harmony', 'reliable mediator', 'creates lasting peace'],
    5: ['freedom-loving diplomat', 'explores many perspectives', 'variety in relationships', 'social adventurer'],
    6: ['devoted to fairness', 'serves through beauty', 'harmonizes families', 'loves with grace'],
    7: ['philosophical seeker', 'explores ethics deeply', 'contemplative idealist', 'wisdom through reflection'],
    8: ['powerful negotiator', 'justice with authority', 'business diplomat', 'balances power gracefully'],
    9: ['universal harmonizer', 'seeks world peace', 'bridges cultures', 'fairness as a calling'],
  },
  Scorpio: {
    1: ['solo transformer', 'independent investigator', 'original power', 'penetrates surface alone'],
    2: ['depth in partnership', 'soul-level bonds', 'intense but cooperative', 'sees through to the truth'],
    3: ['creative investigator', 'expresses hidden truths', 'artistic depth', 'stories that cut deep'],
    4: ['builds through intensity', 'structured transformation', 'methodical power', 'lasting change architect'],
    5: ['explores the shadow', 'restless intensity', 'seeks hidden freedom', 'transformation through adventure'],
    6: ['fierce protector', 'loves with totality', 'heals through depth', 'intensity as care'],
    7: ['master researcher', 'occult philosopher', 'penetrating wisdom', 'dives into the unknown'],
    8: ['power and mastery', 'financial investigator', 'transforms resources', 'material alchemy'],
    9: ['transforms the world', 'deep humanitarian', 'wisdom from the abyss', 'uses darkness for light'],
  },
  Sagittarius: {
    1: ['original adventurer', 'pioneering philosopher', 'forges their own path', 'bold explorer of ideas'],
    2: ['partner in adventure', 'seeks harmony abroad', 'diplomatic traveler', 'spiritual companions'],
    3: ['infectious optimist', 'philosophical storyteller', 'humor meets wisdom', 'the traveling teacher'],
    4: ['disciplined explorer', 'builds on philosophy', 'structure for the journey', 'systematic seeker'],
    5: ['ultimate freedom seeker', 'restless and alive', 'thrives on pure adventure', 'never fences in'],
    6: ['guides through wisdom', 'nurtures through travel', 'philosophical caretaker', 'teaches with joy'],
    7: ['philosophical sage', 'deep spiritual seeker', 'contemplative wanderer', 'wisdom on the road'],
    8: ['abundant achiever', 'turns vision into wealth', 'expansive business mind', 'philosophy to fortune'],
    9: ['universal teacher', 'humanity is the horizon', 'altruistic wanderer', 'wisdom shared freely'],
  },
  Capricorn: {
    1: ['self-made achiever', 'solo builder', 'original in ambition', 'the one who climbs alone'],
    2: ['cooperative builder', 'builds dynasties with partners', 'diplomatic ambition', 'steady team player'],
    3: ['creative executive', 'communicates authority', 'artistic discipline', 'expresses through achievement'],
    4: ['master architect', 'discipline upon discipline', 'builds the unshakeable', 'total reliability'],
    5: ['adaptable achiever', 'breaks career molds', 'innovative traditionalist', 'climbs unexpected paths'],
    6: ['family legacy builder', 'provides through love', 'responsible caretaker', 'ambition for loved ones'],
    7: ['philosophical achiever', 'contemplative master', 'wisdom in silence', 'depth behind success'],
    8: ['financial titan', 'material mastery supreme', 'born for business', 'empire through discipline'],
    9: ['universal builder', 'applies discipline to compassion', 'leaves lasting legacy', 'builds for all'],
  },
  Aquarius: {
    1: ['revolutionary leader', 'original visionary', 'changes systems alone', 'leads the revolution'],
    2: ['cooperative innovator', 'builds movements with others', 'unity for change', 'bridges and innovates'],
    3: ['creative revolutionary', 'art that changes culture', 'original expression', 'imagination as activism'],
    4: ['systematic reformer', 'builds new structures', 'disciplined rebel', 'change through method'],
    5: ['ultimate free spirit', 'reinvents constantly', 'refuses all limitations', 'future in every step'],
    6: ['humanitarian heart', 'serves through innovation', 'loving rebel', 'technology for healing'],
    7: ['visionary philosopher', 'sees futures others miss', 'brilliant eccentric', 'lonely genius'],
    8: ['powerful innovator', 'turns vision into empire', 'disrupts with authority', 'humanitarian wealth'],
    9: ['universal visionary', 'creates for all of humanity', 'future belongs to them', 'enlightened rebel'],
  },
  Pisces: {
    1: ['spiritual pioneer', 'forges their own mystical path', 'leads through empathy', 'original dreamer'],
    2: ['soul-level partner', 'mystical connection', 'feels everything together', 'psychic bonding'],
    3: ['creative mystic', 'art from the unconscious', 'dreamy expressionist', 'magic through creation'],
    4: ['grounded mystic', 'brings dreams to reality', 'structures the intangible', 'practical spiritual'],
    5: ['spiritual wanderer', 'seeks transcendence everywhere', 'fluid and free', 'mystical adventurer'],
    6: ['unconditional love', 'selfless to a beautiful fault', 'healer of hearts', 'divine caretaker'],
    7: ['the mystic', 'meditates reality', 'psychic philosopher', 'deep oceanic wisdom'],
    8: ['powerful manifestor', 'turns vision into wealth', 'material spirituality', 'abundance from within'],
    9: ['cosmic teacher', 'embodies universal love', 'ancient wisdom', 'born to transcend and inspire'],
  },
};

// ── Date facts for notable dates ──────────────────────────────────────────────

const DATE_FACTS: Record<string, string> = {
  '1-1': 'New Year\'s Day is shared with world leaders, artists, and visionaries — a date symbolizing fresh starts.',
  '1-15': 'Martin Luther King Jr. was born on January 15, 1929, making this a day associated with justice and courage.',
  '2-14': 'Valentine\'s Day — those born today carry the planet Venus energy and a deep gift for love.',
  '3-14': 'Pi Day (3.14) — born alongside the mathematical constant, this date carries genius-level analytical potential.',
  '4-1': 'April Fools\' Day births bring wit, humor, and the rare gift of never taking life too seriously.',
  '4-22': 'Earth Day — those born today are natural environmentalists with a deep bond to the living world.',
  '5-4': 'Star Wars Day (May the Fourth) — this date carries themes of adventure, myth, and heroic purpose.',
  '6-21': 'The Summer Solstice — the longest day of the year, giving those born today extraordinary vitality.',
  '7-4': 'US Independence Day — a date carrying strong energy of freedom, courage, and self-determination.',
  '8-26': 'Women\'s Equality Day, honoring the 19th Amendment — those born today are natural advocates.',
  '9-21': 'International Day of Peace — born advocates for harmony with a rare gift for conflict resolution.',
  '10-31': 'Halloween — those born today possess unusual depth, an eye for the hidden, and magnetic mystery.',
  '11-11': '11/11 is a numerologically powerful date — doubles the master number energy of intuition.',
  '12-21': 'The Winter Solstice — the longest night, giving those born today an affinity with depth and rebirth.',
  '12-25': 'Christmas Day — those born today often carry extraordinary warmth, generosity, and universal love.',
  '2-29': 'Leap Day — born once every four years, February 29 births carry rare uniqueness and unconventional spirit.',
};

// ── Helper functions ───────────────────────────────────────────────────────────

export function getZodiacSign(month: number, day: number): ZodiacInfo {
  const cases: Array<{ m: number; d: number; sign: string }> = [
    { m: 1,  d: 20, sign: 'Capricorn' },
    { m: 2,  d: 19, sign: 'Aquarius' },
    { m: 3,  d: 21, sign: 'Pisces' },
    { m: 4,  d: 20, sign: 'Aries' },
    { m: 5,  d: 21, sign: 'Taurus' },
    { m: 6,  d: 21, sign: 'Gemini' },
    { m: 7,  d: 23, sign: 'Cancer' },
    { m: 8,  d: 23, sign: 'Leo' },
    { m: 9,  d: 23, sign: 'Virgo' },
    { m: 10, d: 23, sign: 'Libra' },
    { m: 11, d: 22, sign: 'Scorpio' },
    { m: 12, d: 22, sign: 'Sagittarius' },
  ];

  let signName = 'Capricorn';
  for (const c of cases) {
    if (month < c.m || (month === c.m && day < c.d)) {
      signName = c.sign;
      break;
    }
  }

  return ZODIAC_DATA.find(z => z.sign === signName) || ZODIAC_DATA[0];
}

export function calculateLifePath(day: number): number {
  // Master numbers 11 and 22 are sometimes kept — here we reduce to single digit
  let n = day;
  while (n > 9) {
    n = Math.floor(n / 10) + (n % 10);
  }
  return n === 0 ? 9 : n;
}

export function getCoreTraits(sign: string, lifePathNum: number): string[] {
  return TRAIT_MATRIX[sign]?.[lifePathNum] ?? ['thoughtful', 'authentic', 'purposeful', 'perceptive'];
}

export function getStrengths(sign: string): string[] {
  return ZODIAC_DATA.find(z => z.sign === sign)?.strengths ?? ['adaptable', 'creative', 'resilient'];
}

export function getChallenges(sign: string): string[] {
  return ZODIAC_DATA.find(z => z.sign === sign)?.challenges ?? ['self-doubting', 'overthinks'];
}

export function getLuckyDay(lifePathNum: number): string {
  return LIFE_PATH_DATA[lifePathNum]?.luckyDay ?? 'Sunday';
}

export function getLuckyColor(sign: string): string {
  return ZODIAC_DATA.find(z => z.sign === sign)?.color ?? 'Indigo';
}

export function getCompatibleSigns(sign: string): string[] {
  return ZODIAC_DATA.find(z => z.sign === sign)?.compatible ?? ['Aries', 'Leo', 'Sagittarius'];
}

export function getDateFact(month: number, day: number): string {
  return DATE_FACTS[`${month}-${day}`] ?? `${MONTH_NAMES[month]} ${day} birthdays belong to a select group of individuals who share your unique zodiac energy and life path number — a rare combination that shapes your perspective on the world.`;
}

// ── Month names ────────────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ── Main export ────────────────────────────────────────────────────────────────

export function getBirthdayPersonality(month: number, day: number): BirthdayPersonality {
  const zodiac = getZodiacSign(month, day);
  const lp = calculateLifePath(day);
  const lpData = LIFE_PATH_DATA[lp] ?? LIFE_PATH_DATA[1];
  const coreTraits = getCoreTraits(zodiac.sign, lp);
  const strengths = [...zodiac.strengths, lpData.traits[0]];
  const challenges = zodiac.challenges;
  const monthName = MONTH_NAMES[month];

  const personalityBlurb = `People born on ${monthName} ${day} are ${zodiac.sign}s walking ${lpData.description}. Your ${zodiac.element} element brings ${zodiac.strengths[0]} energy, while Life Path ${lp} adds ${lpData.traits[0]} qualities that set you apart from others of your sign. You are ${coreTraits[0]} and ${coreTraits[1]}, driven by an inner compass that is distinctly your own.`;

  return {
    month,
    day,
    zodiacSign: zodiac.sign,
    zodiacSymbol: zodiac.symbol,
    element: zodiac.element,
    rulingPlanet: zodiac.planet,
    lifePathNumber: lp,
    coreTraits,
    strengths,
    challenges,
    luckyDay: getLuckyDay(lp),
    luckyColor: getLuckyColor(zodiac.sign),
    luckyNumber: lp,
    compatibleSigns: zodiac.compatible,
    dateFact: getDateFact(month, day),
    personalityBlurb,
  };
}
