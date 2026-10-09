/**
 * Chinese zodiac yearly forecast — P4-CZ-YEARLY.
 *
 * Grounded in real Chinese-astrology methodology: the forecast for a given year
 * is driven by the RELATIONSHIP between the person's animal and the year's ruling
 * animal — the San He trine (allies), Liu He secret friend, Liu Chong clash
 * (opposite), Liu Hai harm, and Ben Ming Nian (your own zodiac year / Tai Sui).
 * Nothing is fabricated; each area reads from that relationship + the year's
 * element. Indications are graded (strong / moderate / mild) per Rule 7, framed
 * clearly but never fatalistically, with no specific dates.
 *
 * The year is supplied by the caller (computed from the current date at render
 * time) so the page stays evergreen — never one prerendered page per date.
 */
import { getChineseZodiacAnimal } from '@/services/ChineseZodiacService';

const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;
const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;

export type Grade = 'strong' | 'moderate' | 'mild';
export type Relationship =
  | 'own-year'
  | 'allies'
  | 'secret-friend'
  | 'harm'
  | 'clash'
  | 'neutral';

export interface AreaForecast {
  grade: Grade;
  text: string;
}

export interface YearForecast {
  year: number;
  yearAnimal: string;
  yearElement: string;
  relationship: Relationship;
  relationshipLabel: string;
  overall: string;
  career: AreaForecast;
  finance: AreaForecast;
  love: AreaForecast;
  health: AreaForecast;
  advice: string;
}

function animalIndex(animal: string): number {
  return ANIMALS.indexOf(animal as (typeof ANIMALS)[number]);
}

export function getYearElement(year: number): string {
  return ELEMENTS[Math.floor((((year - 4) % 10) + 10) % 10 / 2)];
}

/** Determine the traditional relationship between a native animal and a year. */
export function getRelationship(nativeAnimal: string, year: number): Relationship {
  const a = animalIndex(nativeAnimal);
  const y = animalIndex(getChineseZodiacAnimal(year));
  if (a < 0 || y < 0) return 'neutral';
  if (a === y) return 'own-year';
  const diff = (((a - y) % 12) + 12) % 12;
  if (diff === 6) return 'clash';
  if (diff === 4 || diff === 8) return 'allies';
  const sum = a + y;
  if (sum === 1 || sum === 13) return 'secret-friend';
  if (sum === 7 || sum === 19) return 'harm';
  return 'neutral';
}

const REL_LABEL: Record<Relationship, string> = {
  'own-year': 'your own zodiac year (Ben Ming Nian)',
  allies: 'an allied (San He trine) year',
  'secret-friend': 'a secret-friend (Liu He) year',
  harm: 'a year of minor friction (Liu Hai)',
  clash: 'a clash year (Liu Chong, the opposite sign)',
  neutral: 'a steady, neutral year',
};

// Per-relationship grading and tone for each life area.
const REL_PROFILE: Record<Relationship, {
  overall: string;
  career: { grade: Grade; tone: string };
  finance: { grade: Grade; tone: string };
  love: { grade: Grade; tone: string };
  health: { grade: Grade; tone: string };
  advice: string;
}> = {
  allies: {
    overall: 'Chinese astrology reads this as a genuinely favourable year — the year animal is in your trine of allies, so support tends to arrive when you ask for it.',
    career: { grade: 'strong', tone: 'A strong year to push ambitious plans: collaborators back you and effort is rewarded. Say yes to visible projects.' },
    finance: { grade: 'moderate', tone: 'Income is steady with room to grow. A moderate, well-researched investment can do well — avoid gambling on hype.' },
    love: { grade: 'moderate', tone: 'Warm and sociable. Singles meet people easily through friends; couples enjoy an easier, lighter stretch.' },
    health: { grade: 'moderate', tone: 'Energy runs high — channel it into a regular routine rather than burning out on too many commitments.' },
    advice: 'Make the most of the goodwill: start the thing you have been putting off, and lean on your network.',
  },
  'secret-friend': {
    overall: 'Chinese astrology reads this as a supportive year — the year animal is your "secret friend", quietly smoothing the path.',
    career: { grade: 'moderate', tone: 'Behind-the-scenes help appears. A moderate year for steady progress and for mending a working relationship.' },
    finance: { grade: 'moderate', tone: 'Finances hold firm. A good year to consolidate — pay down what you owe and build a cushion.' },
    love: { grade: 'strong', tone: 'A strong year for close bonds: trust deepens, and an existing connection can take a meaningful step forward.' },
    health: { grade: 'moderate', tone: 'Generally stable. Small, consistent habits matter more than any dramatic reset.' },
    advice: 'Nurture the relationships that quietly carry you — this is a year to give and receive help gracefully.',
  },
  neutral: {
    overall: 'Chinese astrology reads this as a steady, neutral year — no strong tailwind or headwind, so your own effort sets the pace.',
    career: { grade: 'moderate', tone: 'A moderate, build-the-foundations year. Reliable work and patience pay off more than big gambles.' },
    finance: { grade: 'moderate', tone: 'Stable. A sensible year to budget, save and avoid impulsive spending.' },
    love: { grade: 'mild', tone: 'Quietly steady. Put honest effort into communication and relationships respond in kind.' },
    health: { grade: 'moderate', tone: 'Nothing demands alarm — keep up balanced routines and regular rest.' },
    advice: 'Treat this as a planning year: set clear goals now and you will be ready when a stronger year arrives.',
  },
  harm: {
    overall: 'Chinese astrology reads this as a year with some minor friction — the Liu Hai influence can bring small misunderstandings, so a little extra care smooths things over.',
    career: { grade: 'mild', tone: 'A mild year: avoid office politics and put agreements in writing. Steady delivery beats bold moves.' },
    finance: { grade: 'mild', tone: 'Watch small leaks and read the fine print before signing. A conservative year with money.' },
    love: { grade: 'mild', tone: 'Patience helps. Clear, kind communication prevents small frictions from growing.' },
    health: { grade: 'moderate', tone: 'A good year to tend to wellbeing proactively — rest, hydration and not overcommitting.' },
    advice: 'Slow down before reacting; most of this year’s snags clear up with a calm conversation.',
  },
  clash: {
    overall: 'Chinese astrology reads this as a year of change — the year animal sits opposite yours, so expect movement. Handled well, a clash year is a powerful reset rather than a setback.',
    career: { grade: 'moderate', tone: 'Change is the theme — a move, a role shift or a new direction. A moderate year: ride the change deliberately rather than resisting it.' },
    finance: { grade: 'mild', tone: 'Keep reserves and avoid large, risky commitments this year. Flexibility matters more than aggressive growth.' },
    love: { grade: 'mild', tone: 'Relationships are tested and clarified. Honesty now builds something steadier later.' },
    health: { grade: 'moderate', tone: 'Guard your energy and sleep through a busier, more changeable year; don’t skip the basics.' },
    advice: 'Expect and plan for change — the traditional advice is to stay flexible, keep a cushion, and make moves on your own terms.',
  },
  'own-year': {
    overall: 'This is your own zodiac year (Ben Ming Nian). Tradition treats it as a high-stakes, introspective year that asks for a little extra caution — many wear red for good fortune.',
    career: { grade: 'moderate', tone: 'A moderate year of visibility and self-definition. Good for a considered step up, less so for reckless leaps.' },
    finance: { grade: 'mild', tone: 'Be conservative: keep a buffer and avoid major speculation during your own year.' },
    love: { grade: 'mild', tone: 'A reflective year for relationships — know what you want before making big commitments.' },
    health: { grade: 'moderate', tone: 'Prioritise rest and balance; your own year rewards steadiness over intensity.' },
    advice: 'Tradition says to stay grounded in your own year — wear a touch of red if you like the custom, keep reserves, and make deliberate choices.',
  },
};

/** Build a full yearly forecast for a native animal and a specific Gregorian year. */
export function getYearForecast(nativeAnimal: string, year: number): YearForecast {
  const rel = getRelationship(nativeAnimal, year);
  const profile = REL_PROFILE[rel];
  const yearAnimal = getChineseZodiacAnimal(year);
  const yearElement = getYearElement(year);
  const mk = (a: { grade: Grade; tone: string }): AreaForecast => ({ grade: a.grade, text: a.tone });
  return {
    year,
    yearAnimal,
    yearElement,
    relationship: rel,
    relationshipLabel: REL_LABEL[rel],
    overall:
      `${year} is the Year of the ${yearElement} ${yearAnimal}. For the ${nativeAnimal}, this is ${REL_LABEL[rel]}. ` +
      profile.overall,
    career: mk(profile.career),
    finance: mk(profile.finance),
    love: mk(profile.love),
    health: mk(profile.health),
    advice: profile.advice,
  };
}

/** The current and next Gregorian year (year supplied via Date at render time). */
export function currentAndNextYear(now: Date = new Date()): [number, number] {
  const y = now.getFullYear();
  return [y, y + 1];
}
