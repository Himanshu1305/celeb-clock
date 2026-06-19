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

// ── Rich content functions for BirthdayDatePage ───────────────────────────────

const PERSONALITY_PARAGRAPHS: Record<string, Record<number, string>> = {
  Aries: {
    1: 'Those born under Aries with Life Path 1 are the archetypal trailblazers — individuals who not only envision bold new directions but possess the raw drive to pursue them alone. Their energy is kinetic, restless, and magnetic. They rarely wait for permission or consensus; instead, they act first and course-correct as needed. This combination produces leaders who leave permanent marks on whatever field they enter.',
    2: 'Aries energy combined with Life Path 2 creates a rare paradox: a warrior with the soul of a diplomat. These individuals lead with fire but negotiate with finesse, capable of commanding teams while remaining sensitive to each member\'s needs. They win not just through force of will but through genuine connection — a skill most competitors lack.',
    3: 'The Aries-3 combination generates some of the most charismatic personalities in the zodiac. Where pure Aries can be blunt and direct, the Life Path 3 tempers that fire with wit, creative flair, and an extraordinary gift for communication. They don\'t just start things — they inspire others to join them, using story and humor as their most powerful tools.',
    4: 'Aries with Life Path 4 is discipline wearing courage\'s armor. The natural Aries impatience is tempered here by a deep appreciation for craft, systems, and results that last. These individuals build things — companies, movements, institutions — and they build them to endure. They are the generals behind the charge, not just the ones holding the sword.',
    5: 'Freedom is the oxygen for Aries-5 individuals. Their appetite for new experiences, challenges, and environments is essentially unlimited. What makes them extraordinary is that they bring genuine courage to their adventures — they don\'t just seek novelty; they seek growth through risk. Each new territory they explore leaves them sharper, more capable, and more alive.',
    6: 'Aries with Life Path 6 wraps fierce ambition in genuine care for others. These are the warrior-protectors: individuals who fight hardest not for personal glory but for those they love. They lead from the heart, build strong family units, and often find their greatest fulfillment in roles where strength serves others rather than conquering them.',
    7: 'The Aries-7 combination produces philosophical warriors who refuse surface-level answers. Before they charge forward, they study — strategy, psychology, history, motive. This creates leaders of unusual depth: they possess the Aries boldness, but back it with insight most competitors never bother to develop. They think before they act, and when they act, they rarely miss.',
    8: 'Aries-8 is the CEO archetype at its most powerful. These individuals are driven by a hunger for achievement that transcends money — though money follows. They combine natural leadership presence with executive discipline, building structures that produce wealth and influence. The combination of Aries fire and the 8\'s material mastery creates individuals born to run empires.',
    9: 'The Aries-9 combination produces fearless advocates — individuals who fight not for personal gain but for causes larger than themselves. Their Aries courage finds its highest expression in standing up for those who cannot stand up for themselves. They are activists, defenders, and moral compasses who refuse to look away from injustice.',
  },
  Taurus: {
    1: 'Taurus with Life Path 1 creates individuals of extraordinary self-determination. Where most Taureans build patiently within established paths, the Life Path 1 energy pushes them to forge entirely new ones. They combine sensory sophistication with true originality — they don\'t just produce beautiful work; they produce work that has never existed before.',
    2: 'Taurus-2 individuals are the finest partners in the zodiac. Patient by nature and deeply cooperative by life path, they create relationships of extraordinary stability and warmth. They have a gift for making everyone around them feel safe, seen, and valued. Their loyalty is total and their commitment unwavering — traits that make them irreplaceable in both personal and professional partnerships.',
    3: 'The Taurus-3 combination connects earth to art in the most beautiful way. These individuals have an exceptional aesthetic eye — for music, visual art, food, fashion, and the design of everyday life. They express themselves through the senses, creating experiences that others find deeply pleasurable. Their creativity is grounded and accessible, never abstract or inaccessible.',
    4: 'Taurus-4 is the master of craft par excellence. Two of the most patient and methodical energies in numerology and astrology combine to create individuals of extraordinary skill and reliability. Whatever they dedicate themselves to mastering, they master completely. They don\'t cut corners, rush timelines, or accept mediocre results — and this makes everything they produce genuinely excellent.',
    5: 'Taurus-5 is one of the most interesting combinations in the system — the fixed earth sign meets the explorer\'s life path. These individuals carry a constant tension between the desire for security and the pull toward adventure. When they resolve this tension, they create lives of extraordinary richness: stable enough to feel safe, varied enough to feel alive.',
    6: 'Taurus-6 is the born provider and homemaker at their finest. Their Taurus love of stability and beauty combines with the Life Path 6\'s deep calling toward care and service to create individuals who build the most nurturing environments imaginable. Their homes are sanctuaries, their relationships foundations, and their generosity legendary.',
    7: 'The Taurus-7 combination creates earthy philosophers who need long periods of quiet to process the deep truths they perceive. They are patient thinkers who don\'t rush to conclusions — preferring to sit with a question for months until the answer reveals itself naturally. This patience makes their insights unusually reliable and profound.',
    8: 'Taurus-8 is a wealth-building machine. Combining Taurus\'s patience and persistence with the Life Path 8\'s material mastery and executive ability, these individuals build financial and material success over time with remarkable consistency. They don\'t chase get-rich-quick schemes; they build slowly, steadily, and with an eye toward lasting value.',
    9: 'Taurus-9 individuals share their abundance with unusual generosity. While their Taurus nature values security and material comfort, their Life Path 9 pushes them toward using those resources in service of the greater good. They are philanthropists at heart — people who build wealth not to hoard it but to deploy it meaningfully.',
  },
  Gemini: {
    1: 'Gemini-1 produces the most original communicators of the zodiac. These individuals don\'t just share ideas — they pioneer new ways of thinking and expressing. They are the thought leaders, the maverick writers, the speakers who articulate what others haven\'t yet found words for. Their minds move at extraordinary speed, always ten steps ahead of the conversation.',
    2: 'Gemini-2 creates the finest conversationalists and connectors in the zodiac. They have an instinctive gift for finding common ground between opposing perspectives — drawing out the shy, translating between the misunderstood, and building bridges where others see walls. They lead through relationship, not authority.',
    3: 'The Gemini-3 combination is the ultimate creative and expressive personality. Gemini\'s native gift for language meets the Life Path 3\'s calling toward artistic expression to produce individuals of extraordinary wit, charm, and creative output. They make everything they touch more interesting — conversation, writing, comedy, music, performance.',
    4: 'Gemini-4 takes the brilliant, scattered Gemini mind and gives it structure and staying power. Where unmodified Gemini might start ten projects and finish none, the Life Path 4 provides the discipline to see ideas through to completion. These individuals produce intellectual work of extraordinary depth and lasting value.',
    5: 'The Gemini-5 combination is the most intellectually restless personality imaginable. Their curiosity has no off switch — they explore ideas, cultures, languages, and disciplines with the enthusiasm of someone perpetually at the beginning of something wonderful. They are the jacks of all trades who actually master most of them.',
    6: 'Gemini-6 communicates with unusual warmth and care. Where pure Gemini can seem detached or purely intellectual, the Life Path 6 adds genuine emotional investment in others\' wellbeing. These individuals use their communication gifts to teach, support, and uplift — they are the mentors, teachers, and advisors others seek out in moments of need.',
    7: 'Gemini-7 is the philosopher-communicator — someone who doesn\'t just gather information but synthesizes it into meaning. These individuals are drawn to the deep questions: consciousness, purpose, existence, ethics. Their conversations leave others genuinely changed. They connect dots across disciplines in ways that reveal truths no single field could capture alone.',
    8: 'Gemini-8 turns intelligence into influence and influence into power. These are the strategic communicators — people who understand that language is leverage and use it accordingly. They are natural persuaders, negotiators, and authority figures who rise through the force of their ideas combined with executive presence.',
    9: 'Gemini-9 uses language in service of humanity. These individuals have a calling to communicate on behalf of those who cannot speak for themselves — through writing, journalism, advocacy, teaching, or public service. They carry the world\'s stories inside them and feel compelled to share them widely.',
  },
  Cancer: {
    1: 'Cancer-1 individuals are emotionally self-sufficient pioneers — people who learned early to trust their own feelings as data rather than weakness. They lead through intuition, making decisions that seem instinctive but are actually deeply informed by emotional intelligence developed over years of careful attention to human behavior.',
    2: 'Cancer-2 is the deepest empath in the zodiac — capable of psychic-level connection with those they love. They read rooms, feel moods before they\'re expressed, and create emotional environments of extraordinary safety. Their gift for deep partnership makes them irreplaceable in relationships, and their loyalty is total and unconditional.',
    3: 'Cancer-3 turns emotion into art with unusual beauty. These individuals process their rich inner lives through creative expression — writing, music, visual art, or storytelling — and produce work that resonates universally because it comes from places of genuine feeling rather than intellectual calculation.',
    4: 'Cancer-4 builds emotional security into permanent structures. They are the ones who create stable homes, reliable emotional anchors, and lasting family traditions. Their steadiness doesn\'t come from suppressing emotion — it comes from having done the inner work to understand and integrate their feelings at a deep level.',
    5: 'Cancer-5 breaks emotional patterns courageously. Where many Cancers cling to familiar emotional territory, the Life Path 5 pushes these individuals to explore new relational landscapes, heal inherited family dynamics, and nurture in ways that are fresh and free rather than conditioned or obligatory.',
    6: 'Cancer-6 is the ultimate caregiver — someone whose entire life organizing principle is the love and protection of those in their care. They give with such totality that they must be deliberate about self-replenishment. At their best, they create healing environments that transform everyone who passes through them.',
    7: 'Cancer-7 experiences the world primarily through feeling and intuition. They have access to subtle levels of emotional and psychic perception that most people never develop. Their challenge is to trust these gifts rather than dismiss them as mere imagination — because what they sense is usually correct.',
    8: 'Cancer-8 builds family legacy with fierce intentionality. They combine emotional depth with executive capability, creating both loving relationships and material success. They protect their loved ones through achievement, building the kind of security that transforms family trajectories across generations.',
    9: 'Cancer-9 loves without borders. Their empathy extends beyond personal relationships to encompass humanity itself — they feel the world\'s suffering genuinely and are compelled to respond. They make extraordinary caregivers, humanitarians, and healers who pour themselves into service without reservation.',
  },
  Leo: {
    1: 'Leo-1 is the born ruler — someone who commands any room they enter not through arrogance but through the sheer radiance of their authentic self-expression. They are the original creative force, the star of their own story who simultaneously makes everyone around them feel like co-stars. They don\'t take up space; they create space for others to shine within their orbit.',
    2: 'Leo-2 is the warmest combination in the zodiac. Their natural Leo generosity and radiance are deepened by the Life Path 2\'s genuine interest in partnership and cooperation. They light up relationships with unusual grace — giving others the spotlight as often as they claim it themselves, which paradoxically makes them even more beloved.',
    3: 'The Leo-3 combination is pure performing arts genius. Both Leo and Life Path 3 carry enormous creative and expressive energy — together they produce individuals who are naturally entertaining, charismatic, and gifted with an extraordinary ability to move audiences. They don\'t just perform; they transform.',
    4: 'Leo-4 adds backbone to brilliance. Where pure Leo energy can sometimes chase spotlight over substance, the Life Path 4 grounds these individuals in craft, discipline, and a genuine commitment to building something lasting. They have the stage presence to captivate any audience and the work ethic to deserve it.',
    5: 'Leo-5 brings adventure to center stage. These individuals need new audiences, new stages, and new creative challenges to feel fully alive. Their restlessness isn\'t instability — it\'s the hunger of a truly creative spirit that refuses to repeat itself. Each new territory they explore reveals new dimensions of their considerable gifts.',
    6: 'Leo-6 leads through love. The Leo warmth and generosity are channeled here into protective, nurturing roles — they are the leaders who care deeply about the wellbeing of those they serve. Their kingdom is built on loyalty given freely because those under their care feel genuinely seen and valued.',
    7: 'Leo-7 is the philosopher king or queen — someone who needs solitude and reflection to understand the deeper meaning behind their experiences in the spotlight. They question what fame and recognition are actually for, seeking significance rather than mere celebrity. Their insights, when shared, carry unusual authority.',
    8: 'Leo-8 combines fame with fortune in the most natural way possible. These individuals have the personal magnetism of Leo and the executive capability of the 8, making them extraordinarily effective in positions of power and influence. They build empires and legacies simultaneously, leaving marks that outlast them.',
    9: 'Leo-9 uses their platform for planetary good. Their natural visibility is not wasted on personal indulgence — they use it to advocate, inspire, and create change. They are the humanitarians who happen to be stars, celebrities who remember that influence is ultimately a form of responsibility.',
  },
  Virgo: {
    1: 'Virgo-1 forges their own methods with extraordinary precision. They don\'t accept established systems at face value — they analyze, improve, and often replace them with something demonstrably better. These individuals are the quiet innovators who produce breakthrough work not through flash but through superior understanding of how things actually function.',
    2: 'Virgo-2 brings analytical gifts into the service of partnership and collaboration. They build systems that help teams function better, communicate more clearly, and achieve results that no individual could produce alone. Their attention to detail prevents the small errors that derail collective efforts, making them invaluable team members and collaborators.',
    3: 'Virgo-3 combines analytical precision with genuine creative expression. These individuals write with clarity and beauty simultaneously, design with both aesthetic sensibility and functional intelligence, and communicate in ways that are not just accurate but genuinely engaging. They are the editors who improve without diminishing, the critics who build rather than merely judge.',
    4: 'Virgo-4 is the master craftsperson at their most dedicated. The already methodical Virgo nature is amplified by the Life Path 4\'s commitment to structure and excellence, producing individuals who achieve genuine mastery in whatever discipline they commit to. They are the professionals others come to when precision and reliability are non-negotiable.',
    5: 'Virgo-5 explores through research and analysis rather than physical adventure. Their curiosity drives them to investigate diverse subjects with unusual depth — they are the polymaths who actually understand everything they study. Their analytical framework helps them extract meaning from varied experiences that others might find overwhelming.',
    6: 'Virgo-6 serves through precision. They understand that care without competence is often ineffective, and so they develop genuine expertise in the fields where they choose to help. They are the healthcare professionals, educators, and counselors who are not just emotionally present but technically excellent — a rare and invaluable combination.',
    7: 'Virgo-7 pursues truth with relentless obsessive focus. They are the researchers who won\'t accept a finding until they\'ve tested it from every conceivable angle, the analysts who trace problems back to their deepest roots. Their intellectual depth is genuinely extraordinary, and the insights they produce are proportionally valuable.',
    8: 'Virgo-8 builds success through mastery of detail. Where others achieve through vision or charisma, these individuals win through superior preparation, execution, and quality control. They know that the difference between good and excellent lies in precisely the details that others overlook, and they use this knowledge to consistently outperform.',
    9: 'Virgo-9 applies analytical precision to the task of improving the world. They don\'t just care about helping — they develop genuine expertise in the most effective ways to create lasting positive change. Their humanitarian work is unusually impactful because it\'s based on evidence rather than mere good intentions.',
  },
  Libra: {
    1: 'Libra-1 is the independent diplomat — someone who pioneers new frameworks for fairness and justice rather than working within existing ones. They bring fresh perspectives to age-old questions of balance and equity, and they do so with the Libra grace that makes their innovations accessible and attractive rather than threatening.',
    2: 'Libra-2 is the natural partner in its most perfect expression. Both Libra and Life Path 2 are fundamentally relational energies — together they create individuals who flourish in deep one-on-one connection and have an almost supernatural ability to create harmony between conflicting parties. They are the mediators, counselors, and partners others need when relationships become difficult.',
    3: 'Libra-3 channels aesthetic genius into creative expression. These individuals have an extraordinary eye for beauty — in design, music, fashion, and the visual arts — combined with the Life Path 3\'s gift for sharing that beauty through creative work. They make the world more beautiful simply by existing in it.',
    4: 'Libra-4 builds fair systems that last. Where Libra can be idealistic about justice, the Life Path 4 adds the practical discipline to actually create lasting institutions, legal frameworks, and organizational structures that embody fairness rather than merely aspiring to it. They are the architects of equity.',
    5: 'Libra-5 explores balance through variety. They discover what fairness means by experiencing many different cultures, relationships, and perspectives — and then synthesizing these experiences into wisdom that is both universal and personally embodied. They are diplomatic explorers whose understanding of human nature is unusually broad.',
    6: 'Libra-6 serves through beauty and harmony. They create environments — homes, workplaces, communities — that reflect their deep commitment to both aesthetic excellence and relational health. For them, beauty and care are not separate values but two expressions of the same underlying intention: to make the world better.',
    7: 'Libra-7 contemplates the deep philosophical questions of justice, ethics, and the good life. They are the idealists with unusual intellectual depth — not content to simply wish for a better world but determined to understand what a better world would actually require. Their reflections often produce insights of genuine philosophical value.',
    8: 'Libra-8 is the powerful negotiator — someone who combines the Libra gift for fairness with the Life Path 8\'s executive authority to create business and legal frameworks that both achieve results and maintain integrity. They are extraordinarily effective in environments where winning requires being right as much as being strong.',
    9: 'Libra-9 embodies fairness as a calling. Their deep commitment to justice extends beyond personal relationships to encompass all of humanity — they are the advocates, the peacemakers, the bridge-builders who work tirelessly to reduce conflict and increase understanding between groups that have historically been in opposition.',
  },
  Scorpio: {
    1: 'Scorpio-1 investigates reality alone and penetrates to its deepest levels. These individuals have an extraordinary capacity for independent research into hidden truths — psychological, financial, scientific, or occult. They trust their own perceptions over collective opinion, which often allows them to discover what others miss entirely.',
    2: 'Scorpio-2 forms bonds at the soul level. Their intense Scorpionic perceptiveness is deployed in service of deep partnership, creating connections of unusual intimacy and trust. They see through to the truth of the people they love and commit to those truths completely — which makes them the most loyal partners imaginable, once trust is established.',
    3: 'Scorpio-3 gives voice to hidden truths through creative expression. Their art — whether writing, music, visual, or performance — draws from the deep psychological and emotional material that most people prefer to avoid. This gives their work unusual power: it touches audiences in places they didn\'t know needed touching.',
    4: 'Scorpio-4 architects lasting transformation. They don\'t just create change — they build the structures that make change irreversible. Their approach is methodical, patient, and thorough, which is why the transformations they initiate tend to take root in ways that more impulsive change-agents\' efforts don\'t.',
    5: 'Scorpio-5 explores the shadowed territories of experience that others fear to enter. They are drawn to the transgressive, the taboo, and the extremity of human experience — not out of destructive impulse but out of a genuine belief that the full range of existence deserves to be understood and integrated.',
    6: 'Scorpio-6 protects with fierce totality. When they love, they love completely — and they defend what they love with an intensity that can be overwhelming but is always genuine. They are the partners, parents, and friends who will go to any length to protect those in their care.',
    7: 'Scorpio-7 is the master researcher and occult philosopher. They dive into the deep water of consciousness, psychology, spirituality, and hidden knowledge with a hunger that never diminishes. What they bring back from these depths — in the form of insight, creative work, or simply lived wisdom — is genuinely extraordinary.',
    8: 'Scorpio-8 transforms material reality through sheer force of concentrated will. They combine Scorpio\'s penetrating intelligence with the Life Path 8\'s material mastery to create financial and institutional power of unusual magnitude. They are the turnaround artists, the crisis managers, the alchemists of resources.',
    9: 'Scorpio-9 uses the knowledge gained through deep descent to serve humanity\'s healing. They understand suffering at a level most never reach, and this understanding makes them extraordinarily effective at supporting others through their darkest moments. They are the wounded healers who have transformed personal pain into universal wisdom.',
  },
  Sagittarius: {
    1: 'Sagittarius-1 pioneers intellectual and philosophical territory that has never been explored. They forge genuinely original paths in philosophy, spirituality, education, or travel — not following maps but making them. Their boldness and optimism combine to give them the courage to venture where others only theorize about going.',
    2: 'Sagittarius-2 seeks adventure through partnership. They are the philosophical companions — individuals who need a fellow traveler for both physical journeys and intellectual exploration. They make extraordinary friends and partners because they bring both genuine curiosity about others and a natural gift for creating harmonious shared experiences.',
    3: 'Sagittarius-3 is the philosophical storyteller at their most brilliant. They combine the Sagittarian love of wisdom and travel with the Life Path 3\'s gift for making complex ideas accessible and entertaining. Their stories educate without feeling like lectures — they are the teachers who make learning feel like privilege.',
    4: 'Sagittarius-4 builds philosophical structures that last. Where pure Sagittarius can be a perpetual student who never synthesizes their learning into lasting work, the Life Path 4 provides the discipline to write the book, build the institution, or create the curriculum that passes their philosophical insights to future generations.',
    5: 'Sagittarius-5 is adventure itself made human. The Sagittarian hunger for expansion meets the Life Path 5\'s love of freedom and variety to create someone who cannot be contained by any convention, border, or limitation. They are the pure explorers who never stop discovering new frontiers of experience and understanding.',
    6: 'Sagittarius-6 nurtures through wisdom. They are the philosophical guides — the teachers, mentors, and spiritual directors who take genuine responsibility for the growth and wellbeing of those in their care. They lead others not to dependence but toward the kind of expanded awareness that produces authentic independence.',
    7: 'Sagittarius-7 is the philosophical sage who contemplates the deepest questions in the quietest places. They need solitude to process what their vast experience of the world has shown them, turning observation into wisdom through periods of extended reflection. What emerges from these retreats is guidance of unusual depth and authenticity.',
    8: 'Sagittarius-8 turns philosophical vision into material abundance. They combine expansive thinking with executive capability to build enterprises, empires, and institutions of remarkable scale. Their optimism serves them here — they genuinely believe in the scale of what they\'re building, which attracts others to participate.',
    9: 'Sagittarius-9 is the universal teacher — someone whose wisdom is genuinely planetary in scope and whose commitment to sharing it knows no borders. They are the philosophers who feel personally responsible for humanity\'s elevation, and they pour their enormous energy and optimism into this calling without reservation.',
  },
  Capricorn: {
    1: 'Capricorn-1 is the self-made achiever who climbs alone. They combine Capricorn\'s patient ambition with Life Path 1\'s need for independence to create extraordinary careers built entirely on personal merit, original thinking, and relentless effort. They are not natural collaborators, but they don\'t need to be — their solo output is remarkable enough.',
    2: 'Capricorn-2 builds dynasties with partners. The Capricorn drive for achievement is here channeled through deep collaborative relationships — business partnerships, marriages, professional alliances — that multiply individual capability many times over. They are the ones who understand that the right partnership is itself the most powerful form of ambition.',
    3: 'Capricorn-3 communicates authority with unusual grace. They have the executive presence and credibility of the senior Capricorn combined with the Life Path 3\'s gift for accessible, engaging communication. They can make strategy feel inspiring rather than merely logical, which makes them unusually effective leaders and public figures.',
    4: 'Capricorn-4 is the master architect of lasting achievement. Two of the most disciplined and methodical energies in astrology and numerology combine here to produce individuals who build with a permanence that defies changing conditions. Whatever they create — institutions, businesses, families, careers — is built to last centuries, not just years.',
    5: 'Capricorn-5 innovates within tradition in surprising ways. Their Capricorn respect for what works is combined with the Life Path 5\'s appetite for freedom and novelty to create individuals who can reform established systems from within — keeping what\'s valuable while shedding what no longer serves. They are the unexpected revolutionaries in conservative institutions.',
    6: 'Capricorn-6 builds family legacy with loving purpose. Their ambition is not abstract or ego-driven — it is powered by deep care for those who depend on them. They build careers and wealth not as ends in themselves but as the means to create security, opportunity, and abundance for the people they love most.',
    7: 'Capricorn-7 achieves through contemplation. Behind their considerable external success lies an extensive inner life of reflection, analysis, and philosophical inquiry. They rarely share this inner world freely, but it is the source of the strategic intelligence that makes their public accomplishments possible.',
    8: 'Capricorn-8 is the financial titan — the most natural wealth-builder in the entire system. Capricorn\'s discipline and patience combined with the Life Path 8\'s material mastery and executive authority create individuals who accumulate resources, authority, and legacy with seemingly effortless persistence. They are born for empire.',
    9: 'Capricorn-9 applies discipline to compassion with unusual effectiveness. They don\'t just care about the world — they build institutions, foundations, and structures that create lasting positive change. Their humanitarian work has the Capricorn quality of endurance: it persists long after the immediate crisis has passed.',
  },
  Aquarius: {
    1: 'Aquarius-1 leads the revolution alone. These individuals identify broken systems and create new ones through sheer force of original vision and personal courage. They don\'t wait for consensus — they act on their perception of what humanity needs next, often decades before the world is ready to understand what they\'re building.',
    2: 'Aquarius-2 builds movements through cooperation. Their revolutionary instincts are here channeled through partnership and community-building rather than solo action. They understand that lasting change requires consensus, coalition, and the patient work of bringing diverse people together around shared vision — and they are extraordinary at this work.',
    3: 'Aquarius-3 creates cultural change through art and expression. Their innovations don\'t come primarily through technology or politics but through music, visual art, writing, and performance that shifts how people feel about the future. They are the cultural revolutionaries who make the new world feel not just possible but desirable.',
    4: 'Aquarius-4 builds new structures systematically. Where pure Aquarius can be all vision and no execution, the Life Path 4 provides the methodical discipline to actually design and build the systems of the future. They create the institutions that will outlast current paradigms, the organizational structures that make revolutionary ideas scalable.',
    5: 'Aquarius-5 refuses all limitation with extraordinary freedom. They are the ultimate free spirits — individuals for whom conformity to any convention is not just uncomfortable but genuinely impossible. They live ahead of their time, exploring territories of human possibility that others won\'t discover for years.',
    6: 'Aquarius-6 serves humanity through innovation. They are the social entrepreneurs, the humanitarian technologists, the change-makers who identify where the most good can be done and apply their considerable ingenuity to doing it. For them, helping is not charity — it is the most creative work imaginable.',
    7: 'Aquarius-7 is the visionary philosopher — the lonely genius who perceives futures that others cannot yet imagine. They need extended solitude to develop the ideas that will later change the world, and they often feel profoundly out of place in their own time. History vindicates them consistently.',
    8: 'Aquarius-8 turns innovative vision into institutional power. They have the Aquarian capacity to imagine radically better systems and the Life Path 8\'s executive capability to build them at scale. They are the disruptors who don\'t just challenge existing power structures — they replace them with something demonstrably better.',
    9: 'Aquarius-9 creates for all of humanity with unusual selflessness. Their vision extends to the entire species and beyond — they feel personally responsible for the future of human civilization and spend their considerable energy working toward collective flourishing rather than personal advancement.',
  },
  Pisces: {
    1: 'Pisces-1 is the spiritual pioneer who forges entirely original paths through consciousness. They combine the Piscean capacity for mystical perception with the Life Path 1\'s need to act on their individual vision, creating spiritual explorers who don\'t follow traditions but create new ones from direct experience.',
    2: 'Pisces-2 experiences love at the deepest possible level. Their empathy is so developed that the boundary between self and other sometimes blurs completely, creating both the capacity for profound mystical union and the need for careful self-protection. When they find their true partner, the connection they create is unlike anything most people experience.',
    3: 'Pisces-3 channels the unconscious into art with extraordinary power. Their creative work comes from places most people cannot consciously access — dream states, intuitive flashes, emotional depths — and this gives it a resonance that technically superior but emotionally shallower work cannot match.',
    4: 'Pisces-4 brings dreams into reality with practical grace. Their Piscean capacity for vision is combined with the Life Path 4\'s ability to build — the result is individuals who create the conditions for their spiritual insights to manifest in the physical world. They are the mystics who get things done.',
    5: 'Pisces-5 is the spiritual wanderer who seeks transcendence in every experience. They bring the Piscean sensitivity to the explorer\'s restless curiosity, creating individuals who find meaning and mystical significance everywhere they look. Their spiritual life is not confined to practice — it is lived continuously.',
    6: 'Pisces-6 loves with the totality of unconditional devotion. The Piscean capacity for compassion and the Life Path 6\'s calling toward care combine to create the most selfless caregivers in the zodiac. Their challenge is learning that sustainable service requires boundaries — that they cannot pour from an empty vessel.',
    7: 'Pisces-7 is the pure mystic — the individual whose primary relationship is with the invisible dimensions of reality. They meditate, contemplate, and perceive truths that conventional reality denies. Their challenge is translating these perceptions into forms that serve others rather than becoming lost in the depth of their own inner world.',
    8: 'Pisces-8 manifests spiritual vision into material abundance with unusual power. They combine the Piscean gift for attracting what they focus on with the Life Path 8\'s understanding of material reality to create genuine wealth from vision. They are the artists who also know how to run a business, the mystics who build empires.',
    9: 'Pisces-9 is the cosmic teacher in their highest expression — an individual who embodies universal love so completely that their very presence is healing. They have lived through many experiences, integrated deep wisdom, and arrived at a place of compassion that transforms everyone they meet. They are the old souls who came to remind the world of what it has forgotten.',
  },
};

const SECOND_PERSONALITY_PARAGRAPHS: Record<string, string> = {
  Fire: 'As a Fire sign, the flame of inspiration and initiative burns constantly in your character. You are drawn to action over contemplation, leadership over followership, and possibility over limitation. Your energy is contagious — people around you naturally feel more motivated and alive in your presence. The challenge of the Fire nature is learning to listen as actively as you lead, and to channel your considerable energy into focused streams rather than dispersing it across too many directions at once.',
  Earth: 'As an Earth sign, your greatest gifts are reliability, patience, and the capacity to build things that last. You understand that true achievement requires time, that quality cannot be rushed, and that the foundation matters as much as the structure built upon it. Others trust you instinctively because you mean what you say and follow through on what you promise. Your challenge is resisting the pull toward excessive caution — sometimes the best foundations are those built under dynamic conditions rather than perfectly stable ones.',
  Air: 'As an Air sign, your mind is your most powerful instrument. You process experience primarily through thought, language, and communication — you understand the world by describing it, debating it, and sharing it with others. Your gift for seeing connections between disparate ideas is genuinely extraordinary. Your challenge lies in grounding these insights in embodied experience rather than remaining perpetually in the realm of concept and possibility.',
  Water: 'As a Water sign, your emotional intelligence operates at a level most people never reach. You read rooms, sense undercurrents, and perceive the emotional truth beneath what\'s being said with an accuracy that sometimes feels supernatural. This depth of perception is a genuine superpower, but it requires care — the same sensitivity that allows you to connect so deeply also makes you vulnerable to being overwhelmed by environments and relationships that aren\'t in alignment with your nature.',
};

const NUMEROLOGY_DESCRIPTIONS: Record<number, string> = {
  1: 'Life Path 1 — The Pioneer',
  2: 'Life Path 2 — The Peacemaker',
  3: 'Life Path 3 — The Creative',
  4: 'Life Path 4 — The Builder',
  5: 'Life Path 5 — The Explorer',
  6: 'Life Path 6 — The Nurturer',
  7: 'Life Path 7 — The Seeker',
  8: 'Life Path 8 — The Achiever',
  9: 'Life Path 9 — The Humanitarian',
};

const NUMEROLOGY_DETAIL_PARAGRAPHS: Record<number, string> = {
  1: 'Your Life Path number is 1 — the number of the self, the originator, and the individual who initiates change. In Pythagorean numerology, the number 1 carries the energy of the Sun: light, authority, creative force, and the courage to stand apart from the crowd. Those walking Life Path 1 are here to develop independence, originality, and leadership — not as abstract qualities but as lived practices that require constant courage and self-trust. The lesson of the 1 is learning that authentic leadership emerges not from dominating others but from fully becoming yourself.',
  2: 'Your Life Path number is 2 — the number of relationship, cooperation, and the profound intelligence that arises between people rather than within individuals alone. In Pythagorean numerology, the number 2 carries the energy of the Moon: receptivity, intuition, and the power of reflection. Those walking Life Path 2 are here to develop the art of partnership, the wisdom of listening, and the strength that comes from genuine collaboration. The lesson of the 2 is discovering that sensitivity is not weakness but one of the most sophisticated forms of intelligence.',
  3: 'Your Life Path number is 3 — the number of creative expression, communication, and the joy that flows when inner life finds outer form. In Pythagorean numerology, the number 3 carries the energy of Jupiter: expansion, generosity, and the celebratory quality of existence. Those walking Life Path 3 are here to develop their unique creative voice, share it generously, and inspire others through the beauty and wit of their expression. The lesson of the 3 is learning that authentic joy is itself a gift to the world — that you don\'t need to earn your space through suffering.',
  4: 'Your Life Path number is 4 — the number of structure, discipline, and the patient work of building things that matter. In Pythagorean numerology, the number 4 carries the energy of Saturn: form, limitation (as teacher), and the rewards of consistent effort applied over time. Those walking Life Path 4 are here to develop mastery through dedicated practice, create systems that serve others, and demonstrate that lasting achievement is always the product of sustained commitment rather than brilliant shortcuts. The lesson of the 4 is that constraints are often the very conditions that produce excellence.',
  5: 'Your Life Path number is 5 — the number of freedom, adventure, and the expansive experience of a life fully lived. In Pythagorean numerology, the number 5 carries the energy of Mercury in motion: quick, curious, adaptable, and perpetually drawn toward the new. Those walking Life Path 5 are here to experience the full range of human possibility, to gather wisdom from diverse encounters, and to model the kind of alive, engaged, curious existence that inspires others to let go of unnecessary limitation. The lesson of the 5 is discovering that true freedom requires occasional roots — that the explorer needs a home to return to.',
  6: 'Your Life Path number is 6 — the number of responsibility, care, and the deep fulfillment that comes from genuine service to others. In Pythagorean numerology, the number 6 carries the energy of Venus: beauty, harmony, love, and the healing power of genuine nurturing. Those walking Life Path 6 are here to develop the art of care — for family, community, and the world — while learning that sustainable giving requires self-replenishment. The lesson of the 6 is that taking care of yourself is not selfish but the very foundation of your capacity to take care of others.',
  7: 'Your Life Path number is 7 — the number of analysis, spirituality, and the deep pursuit of truth beneath surface appearances. In Pythagorean numerology, the number 7 carries the energy of Neptune: mystery, depth, the unseen, and the profound intelligence that arises from honest inquiry. Those walking Life Path 7 are here to develop genuine wisdom through study, reflection, and the courage to follow questions wherever they lead. The lesson of the 7 is learning that the answers they seek cannot be found in the outer world alone — the deepest truths require inner cultivation.',
  8: 'Your Life Path number is 8 — the number of power, material mastery, and the capacity to build institutions and resources that serve large numbers of people. In Pythagorean numerology, the number 8 carries the energy of Saturn at its most executive: authority, accountability, and the understanding that power is not a destination but a responsibility. Those walking Life Path 8 are here to develop genuine competence in the material world, to lead with integrity, and to demonstrate that abundance can be created ethically and shared generously. The lesson of the 8 is that true power serves rather than controls.',
  9: 'Your Life Path number is 9 — the number of completion, compassion, and the wisdom that comes from having learned what the previous eight numbers have to teach. In Pythagorean numerology, the number 9 carries the energy of Mars elevated to purpose: the courage of the 1, refined by all subsequent lessons, directed entirely toward collective wellbeing. Those walking Life Path 9 are here to develop universal compassion, release personal attachment to outcomes, and contribute their considerable gifts to the healing of the world. The lesson of the 9 is that true giving means releasing control over what you give — trusting that the good you do will find its way.',
};

const ZODIAC_CONTEXT_PARAGRAPHS: Record<string, string> = {
  Aries: 'Aries is the first sign of the zodiac — the beginning of the astrological year and the sign that carries the energy of pure initiation. Ruled by Mars, the planet of action, desire, and the warrior spirit, Aries embodies the archetype of the Pioneer: the individual who goes first, who acts before all the information is in, who trusts the forward momentum of their own desire. Aries energy is fundamentally springlike — explosive with new growth after a period of gestation, unstoppable in its push toward expression. The Aries individual at their best demonstrates that courage is not the absence of uncertainty but the choice to move forward in spite of it.',
  Taurus: 'Taurus is the second sign of the zodiac — the sign of consolidation that follows Aries\' initiation. Ruled by Venus, the planet of beauty, love, and material pleasure, Taurus embodies the archetype of the Cultivator: the individual who takes what has been started and tends it with patient, sensory-engaged devotion. Taurus energy is fundamentally springtime at its fullest — the earth warm and fertile, filled with the unhurried abundance of things that grow when given what they need. The Taurus individual at their best demonstrates that slowing down to fully inhabit the present is not laziness but the highest form of attentiveness.',
  Gemini: 'Gemini is the third sign of the zodiac — the sign of the mind that connects, collects, and communicates. Ruled by Mercury, the planet of thought, language, and exchange, Gemini embodies the archetype of the Communicator: the individual who moves between worlds, bridges perspectives, and gives language to ideas still forming at the edge of articulation. Gemini energy is fundamentally the energy of late spring — the world full of possibilities, the air buzzing with potential and conversation. The Gemini individual at their best demonstrates that the mind, fully exercised, is one of the most extraordinary instruments of perception ever developed.',
  Cancer: 'Cancer is the fourth sign of the zodiac — the sign of the hearth, the home, and the emotional intelligence that sustains life. Ruled by the Moon, the celestial body most closely connected to feeling, memory, and the rhythms of growth and rest, Cancer embodies the archetype of the Guardian: the individual who creates safety, maintains continuity, and loves with a depth that transforms those who receive it. Cancer energy is fundamentally the energy of midsummer — the world at peak warmth, the light long and generous. The Cancer individual at their best demonstrates that emotional depth is not fragility but one of the most powerful forces in existence.',
  Leo: 'Leo is the fifth sign of the zodiac — the sign of the self in full expression, the heart of summer, the creative principle made personal. Ruled by the Sun, the source of all light and life, Leo embodies the archetype of the Creator: the individual who radiates original energy, who makes the world more vivid simply through their presence, who understands that authentic self-expression is itself a form of generosity. Leo energy is fundamentally midsummer heat — expansive, warm, life-giving, impossible to ignore. The Leo individual at their best demonstrates that there is nothing more generous than showing up fully, authentically, and without apology.',
  Virgo: 'Virgo is the sixth sign of the zodiac — the sign of discernment, craft, and the sacred act of serving well. Ruled by Mercury in its most analytical expression, Virgo embodies the archetype of the Craftsperson: the individual who perfects, refines, and serves through the excellence of their work. Virgo energy is fundamentally late summer into early autumn — the harvest being assessed, quality separated from mediocrity, everything prepared for what comes next. The Virgo individual at their best demonstrates that attention to detail is not pedantry but reverence — a form of care so deep it extends even to the smallest particulars.',
  Libra: 'Libra is the seventh sign of the zodiac — the sign of balance, relationship, and the pursuit of justice in both personal and social dimensions. Ruled by Venus in her most socially engaged expression, Libra embodies the archetype of the Diplomat: the individual who seeks the harmonious resolution of conflict, who perceives beauty in proportion and fairness, who understands that the quality of our relationships is the quality of our lives. Libra energy is fundamentally early autumn — the equilibrium of the equinox, the world in perfect balance between growth and release. The Libra individual at their best demonstrates that harmony is not compromise but the most sophisticated and challenging achievement.',
  Scorpio: 'Scorpio is the eighth sign of the zodiac — the sign of transformation, depth, and the unflinching capacity to face what others prefer to leave hidden. Ruled by Pluto, the planet of the underworld, death, and rebirth, Scorpio embodies the archetype of the Transformer: the individual who descends into darkness not to be consumed by it but to retrieve the wisdom that lives there. Scorpio energy is fundamentally deep autumn — the leaves falling, the world preparing for its necessary death and regeneration. The Scorpio individual at their best demonstrates that true power comes not from controlling the surface of things but from understanding what moves beneath it.',
  Sagittarius: 'Sagittarius is the ninth sign of the zodiac — the sign of philosophy, adventure, and the perpetual search for the meaning that makes the journey worthwhile. Ruled by Jupiter, the planet of expansion, abundance, and higher learning, Sagittarius embodies the archetype of the Philosopher-Explorer: the individual who must continually expand their horizon, whether through physical travel or the equally demanding voyage of ideas. Sagittarius energy is fundamentally early winter — the world stripped down to essence, the landscape clarified, truth more visible than it was when everything was in full leaf. The Sagittarius individual at their best demonstrates that optimism is not naivety but wisdom\'s natural expression in a being who has learned to trust the journey.',
  Capricorn: 'Capricorn is the tenth sign of the zodiac — the sign of ambition, discipline, and the achievement that comes to those patient enough to build their mountain one stone at a time. Ruled by Saturn, the planet of time, structure, and the rewards that come with consistent effort, Capricorn embodies the archetype of the Master Builder: the individual who commits to the long view, who sacrifices short-term pleasure for long-term excellence, who earns authority through demonstrated competence rather than inherited position. Capricorn energy is fundamentally midwinter — austere, clear, demanding, and filled with the particular beauty of things that endure. The Capricorn individual at their best demonstrates that the mountain is always worth climbing, even knowing what the journey costs.',
  Aquarius: 'Aquarius is the eleventh sign of the zodiac — the sign of innovation, humanitarian vision, and the capacity to perceive the future before it arrives. Ruled by Uranus, the planet of revolution, original thought, and the unexpected breakthrough, Aquarius embodies the archetype of the Visionary: the individual who sees what humanity could become and dedicates themselves to creating the conditions that make that becoming possible. Aquarius energy is fundamentally late winter — everything poised at the edge of renewal, the old paradigm crumbling, the new not yet visible but unmistakably present. The Aquarius individual at their best demonstrates that the most radical act is often simply seeing clearly what is and imagining honestly what could be.',
  Pisces: 'Pisces is the twelfth and final sign of the zodiac — the sign of dissolution, transcendence, and the compassionate wisdom of a soul that has walked every path the zodiac contains. Ruled by Neptune, the planet of the ocean, the invisible, and the mystical, Pisces embodies the archetype of the Mystic: the individual who feels the interconnectedness of all things not as a concept but as a direct perception. Pisces energy is fundamentally late winter into earliest spring — the world between seasons, the membrane between states of being thin and permeable. The Pisces individual at their best demonstrates that empathy, fully developed, is not mere sentiment but one of the deepest forms of intelligence the human heart can cultivate.',
};

const LIFE_PATH_PARAGRAPHS: Record<number, string> = {
  1: 'Walking Life Path 1, your core purpose is the development and expression of authentic individuality. You are here to discover who you uniquely are — not who others need you to be, not who your background shaped you to become, but who you choose to be when you are most fully alive. This sounds simple but is in practice one of the most demanding journeys a person can undertake. The world exerts constant pressure toward conformity, and resisting that pressure while maintaining genuine connection to others is the specific work of the 1. Your greatest contribution to the people around you is modeling what it looks like to live from your own center — because when they see someone doing this authentically, it gives them permission to attempt the same.',
  2: 'Walking Life Path 2, your core purpose is the cultivation of genuine partnership and the development of the cooperative intelligence that arises between people. You are here to learn the extraordinary art of deep listening — not as a passive activity but as a creative act that calls forth the best in others. In a world that consistently rewards individual achievement over collaborative wisdom, the 2 carries a quietly radical vision: that the most important work is almost always done between people rather than by individuals alone. Your gift is making others feel genuinely seen and heard, and the environments you create through this gift become unusually productive, creative, and warm.',
  3: 'Walking Life Path 3, your core purpose is the development and generous sharing of your unique creative voice. You are here to express — through whatever medium calls you most strongly — the particular combination of joy, insight, and beauty that only you can offer. The 3 carries a specific responsibility: to resist the pull toward entertaining performance at the expense of authentic expression. Your deepest creative work will not always be your most immediately popular work, but it will be the work that matters most over time. Trust the voice that speaks in your most private creative moments — it knows things your public self has yet to discover.',
  4: 'Walking Life Path 4, your core purpose is the mastery of craft and the creation of structures that make meaningful things possible. You are here to build — systems, institutions, skills, families, businesses — with the kind of patience and thoroughness that produces results that genuinely endure. The 4 carries a specific invitation: to find the intersection between what is most needed and what you can do better than anyone else, and then to dedicate yourself to that intersection completely. Your greatest fulfillment comes not from recognition but from the knowledge that what you built is still working long after you\'ve moved on to the next challenge.',
  5: 'Walking Life Path 5, your core purpose is the exploration of the full range of human experience and the development of the wisdom that comes from genuine encounter with diversity. You are here to live more broadly than most — to say yes to opportunities that seem risky, to change direction when the current path has yielded all it can, to model the freedom that comes when you trust your own instincts more than convention. The 5 carries a specific paradox: the freedom you seek is discovered not by avoiding commitment but by committing fully to whatever is in front of you and then releasing it cleanly when its season ends.',
  6: 'Walking Life Path 6, your core purpose is the development of genuine love as an active, responsible, and sustaining force. You are here not just to feel love but to practice it — in the demanding, unglamorous, day-by-day forms that constitute real care rather than romantic projection. The 6 carries a specific challenge: to give without becoming depleted, to care without becoming controlling, to hold others without preventing them from growing. Your greatest fulfillment comes from creating environments — families, teams, communities, organizations — where people feel safe enough to become more fully themselves.',
  7: 'Walking Life Path 7, your core purpose is the development of genuine wisdom through honest inquiry, sustained study, and the courage to sit with uncertainty until real understanding emerges. You are here to know things — not to accumulate information but to achieve the kind of comprehension that can only come from long, patient engagement with difficult questions. The 7 carries a specific tension: you need solitude to develop your gifts, but those gifts are most fully expressed in service to others. Your challenge is building enough connection to ensure your wisdom finds its recipients, without compromising the solitude that makes that wisdom possible.',
  8: 'Walking Life Path 8, your core purpose is the development of authentic power — the kind that serves rather than dominates, builds rather than extracts, and creates genuine value rather than merely capturing it. You are here to engage with the material world not as an end in itself but as the arena where character is tested and genuine leadership emerges. The 8 carries a specific responsibility: to use the considerable influence you accumulate in ways that improve conditions for those who cannot match your resources or position. The measure of your Life Path 8 is not what you build but whether what you build serves purposes beyond your own advancement.',
  9: 'Walking Life Path 9, your core purpose is the development and sharing of the wisdom you have accumulated across a lifetime of experience, failure, and hard-won understanding. You are here not primarily for your own development — the 9 is the number of completion, and at some level you arrived with more understanding than you realize — but for the contribution of that understanding to others. The 9 carries a specific release: you must let go of the outcomes of your giving. Your compassion will not always be received as you intend it. Your wisdom will not always be recognized in the moment of its sharing. This is not failure — it is simply the nature of the 9 path, and accepting it is one of its deepest teachings.',
};

const LIFE_PATH_CHALLENGE_PARAGRAPHS: Record<number, string> = {
  1: 'The growth edge for Life Path 1 is learning to receive as generously as you give — to allow others to lead, to support, and to offer their perspective without experiencing this as diminishment of your own individuality. The pioneer who can never become the follower is limited to the territories they can reach alone, which is always less than what cooperative effort makes possible. Independence becomes its highest form when it includes the freedom to choose interdependence.',
  2: 'The growth edge for Life Path 2 is learning to value your own perceptions and needs as highly as you value others\'. The gift for deep empathy that makes 2s so extraordinary in relationship can, if uncultivated, become a tendency to lose yourself in others\' worlds while your own goes unattended. The deepest partnerships you seek are only available to individuals who bring a fully inhabited self to the connection — not to those who dissolve.',
  3: 'The growth edge for Life Path 3 is learning to complete rather than merely begin. The creative energy of the 3 is so generative that new ideas arrive faster than old ones can be finished, leading to a life full of brilliant starts and few fully realized achievements. The creative discipline of seeing one project through to its true conclusion — not its technically finished state but its fullest possible expression — is the specific work of the 3\'s maturation.',
  4: 'The growth edge for Life Path 4 is learning to release control and accept the unexpected gifts that come from plans going differently than intended. The 4\'s love of structure and predictability is a strength when building, but a limitation when life offers something better than what was planned for. The most extraordinary achievements of the mature 4 often emerge precisely from the chaos they least wanted.',
  5: 'The growth edge for Life Path 5 is learning to stay when staying has more to offer than leaving. The 5\'s love of freedom and novelty can create a pattern of perpetual motion that prevents the depth of experience that comes only from long-term commitment — to a place, a relationship, a practice, or a creative project. The freedom you seek is also available, paradoxically, inside sustained engagement.',
  6: 'The growth edge for Life Path 6 is learning to love without conditions or expectation of reciprocal care. The 6\'s deep sense of responsibility for others can curdle into resentment when the care given is not matched in return — but this expectation is itself a form of control. True service, at its most evolved, gives freely knowing that the return may come through unexpected channels, in unexpected forms, at unexpected times.',
  7: 'The growth edge for Life Path 7 is learning to trust perception and share what is known without waiting for absolute certainty. The 7\'s commitment to thoroughness and accuracy is admirable, but the standard of certainty required to speak can become so high that the wisdom developed through years of inquiry remains unshared. The world needs your understanding — and good-enough-to-be-helpful is a very high standard, even if it falls short of perfect.',
  8: 'The growth edge for Life Path 8 is learning that true authority requires vulnerability, not invulnerability. The 8\'s instinct to project strength and capability at all times creates distance from the authentic human connection that makes leadership genuinely inspiring rather than merely effective. The leaders others follow most devotedly are not the ones who never show uncertainty — they are the ones who are honest about it while remaining committed to moving forward anyway.',
  9: 'The growth edge for Life Path 9 is learning to receive care, recognition, and appreciation without deflecting it back outward. The 9\'s natural orientation toward giving can create a blind spot around their own needs — they may unconsciously resist being the recipient of the care they give so freely to others. The fully mature 9 understands that allowing others to give to you is itself a gift: it acknowledges their ability to contribute and meets the deep human need to matter.',
};

export function getPersonalityParagraph(sign: string, lifePathNum: number): string {
  return PERSONALITY_PARAGRAPHS[sign]?.[lifePathNum] ??
    `Those born as ${sign} with Life Path ${lifePathNum} combine the elemental energy of ${sign} with the numerological qualities of the ${lifePathNum} — creating a personality of unusual depth, authenticity, and purpose that expresses itself in distinctive and memorable ways.`;
}

export function getSecondPersonalityParagraph(element: string): string {
  return SECOND_PERSONALITY_PARAGRAPHS[element] ??
    'Your elemental nature shapes not just your personality but your fundamental approach to existence — the lens through which all experience is filtered and the energy that underlies your most authentic self-expression.';
}

export function getNumerologyDescription(lifePathNum: number): string {
  return NUMEROLOGY_DESCRIPTIONS[lifePathNum] ?? `Life Path ${lifePathNum}`;
}

export function getNumerologyDetailParagraph(lifePathNum: number): string {
  return NUMEROLOGY_DETAIL_PARAGRAPHS[lifePathNum] ??
    `Your Life Path number ${lifePathNum} shapes the underlying purpose and direction of your journey, adding a distinct numerological dimension to the zodiac traits you carry.`;
}

export function getZodiacContextParagraph(sign: string): string {
  return ZODIAC_CONTEXT_PARAGRAPHS[sign] ??
    `${sign} is a rich and complex zodiac sign with a long history of interpretation across cultures and traditions, carrying elemental and planetary energies that shape the character in distinctive and recognizable ways.`;
}

export function getLifePathParagraph(lifePathNum: number): string {
  return LIFE_PATH_PARAGRAPHS[lifePathNum] ??
    `Walking Life Path ${lifePathNum}, your core purpose involves the development of specific qualities and contributions that are uniquely yours to offer to the world.`;
}

export function getLifePathChallengeParagraph(lifePathNum: number): string {
  return LIFE_PATH_CHALLENGE_PARAGRAPHS[lifePathNum] ??
    `The growth edge for Life Path ${lifePathNum} involves learning to integrate the shadow side of your natural strengths into a more complete and effective expression of your full potential.`;
}

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
