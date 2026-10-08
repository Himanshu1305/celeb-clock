/**
 * Numerology correction tools — Growth P2 (P2-8, improvements GP2 numerology
 * whitespace). Name-correction, business-name, mobile-number and house-number
 * analysers, built on the existing Chaldean/Pythagorean engine in
 * numerologyExtra.ts (no new letter maps — reuse the classical ones).
 *
 * Honesty (Rule 8): numerology is a symbolic tradition, NOT predictive science.
 * Nothing here promises that changing a name, number or house will change an
 * outcome. The tools compute the traditional numbers, show the classical
 * Chaldean compound meanings (from the Cheiro/Chaldean tradition, cited on the
 * page without invented figures), and frame everything as a prompt for
 * reflection and comparison — never a guarantee, never a paid "fix" pushed
 * through fear (Rule 7).
 */
import { reduceToSingleDigit } from './personalYear';
import {
  chaldeanName, pythagoreanName, reduceKeepingMaster,
  type NameNumberResult,
} from './numerologyExtra';

export { chaldeanName, pythagoreanName };

// ── Planetary rulership of 1–9 (classical Chaldean) ──────────────────────────
export const NUMBER_PLANET: Record<number, string> = {
  1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu (Uranus)', 5: 'Mercury',
  6: 'Venus', 7: 'Ketu (Neptune)', 8: 'Saturn', 9: 'Mars',
};

// Single-digit "vibration" keywords, reused across contexts.
const NUMBER_KEYWORD: Record<number, string> = {
  1: 'leadership, independence, a fresh start',
  2: 'partnership, sensitivity, cooperation',
  3: 'expression, optimism, creativity',
  4: 'structure, discipline, hard work',
  5: 'change, movement, communication',
  6: 'care, home, harmony and service',
  7: 'reflection, research, the inner life',
  8: 'ambition, authority, the material world',
  9: 'completion, idealism, broad humanity',
};

/** Friendly / neutral planetary groupings used to judge number "harmony". */
const FRIENDLY: Record<number, number[]> = {
  1: [1, 2, 3, 5, 9],
  2: [1, 2, 3, 5],
  3: [1, 2, 3, 6, 9],
  4: [1, 5, 6, 7],
  5: [1, 3, 5, 6],
  6: [3, 5, 6, 9],
  7: [1, 4, 5, 7],
  8: [4, 5, 6],       // 8 is cautious; works best with steadying numbers
  9: [1, 3, 6, 9],
};

export function areNumbersHarmonious(a: number, b: number): boolean {
  const ra = reduceToSingleDigit(a);
  const rb = reduceToSingleDigit(b);
  return (FRIENDLY[ra] || []).includes(rb) || (FRIENDLY[rb] || []).includes(ra);
}

// ── Classical Chaldean compound-number meanings (Cheiro tradition) ────────────
// These are the traditional meanings for the two-digit "compound" numbers from
// the Chaldean (Cheiro) system. They are a documented tradition, cited as such
// on the page — not invented. Only the widely-published set (10–52) is included;
// a compound outside it reduces to its root meaning.
export const COMPOUND_MEANINGS: Record<number, { name: string; text: string; tone: 'favourable' | 'mixed' | 'caution' }> = {
  10: { name: 'The Wheel of Fortune', text: 'Rising and falling fortune; honour and faith rewarded, but the outcome swings — a number of change.', tone: 'mixed' },
  11: { name: 'A Clenched Hand / Lion Muzzled', text: 'Hidden dangers and trials from others; warns to be forearmed. Treated as a karmic test, not a verdict.', tone: 'caution' },
  12: { name: 'The Sacrifice / The Victim', text: 'Suffering for the plans of others; a warning to be wary of being used — and to think independently.', tone: 'caution' },
  13: { name: 'Upheaval and Change', text: 'Often wrongly feared: it signals change and the breaking of old ground. Power, if used selflessly.', tone: 'mixed' },
  14: { name: 'Movement and Risk', text: 'Fortunate dealings with money, but a warning against speculation and over-confidence. A number of movement.', tone: 'mixed' },
  15: { name: 'The Magician', text: 'Personal magnetism, grace and the gift of persuasion; good for the arts and for drawing help from others.', tone: 'favourable' },
  16: { name: 'The Shattered Citadel', text: 'A warning of accident and defeat of plans; counsels care and humility. A karmic-caution number.', tone: 'caution' },
  17: { name: 'The Star of the Magi', text: 'A highly spiritual number of rising above trials; peace and lasting name after difficulty.', tone: 'favourable' },
  18: { name: 'Materialism tearing down the spiritual', text: 'A difficult number of conflict and material entanglement; counsels integrity. A karmic-caution number.', tone: 'caution' },
  19: { name: 'The Prince of Heaven', text: 'One of the most fortunate: success, honour and happiness after effort.', tone: 'favourable' },
  20: { name: 'The Awakening', text: 'A call to action for a purpose; new plans and ambitions. Judgement and resolve.', tone: 'favourable' },
  21: { name: 'The Crown of the Magi', text: 'Advancement, honour and success after a hard climb; victory after struggle.', tone: 'favourable' },
  22: { name: 'Caution and Illusion', text: 'A warning of good nature being taken advantage of; beware false friends. A karmic-caution number.', tone: 'caution' },
  23: { name: 'The Royal Star of the Lion', text: 'A promise of success, help from superiors and protection. Among the most fortunate.', tone: 'favourable' },
  24: { name: 'Fortunate in love and gain', text: 'Help from those in position; good for relationships and material success.', tone: 'favourable' },
  25: { name: 'Strength gained through experience', text: 'Success after trials and tests; favourable, but earned through hard lessons.', tone: 'mixed' },
  26: { name: 'Grave warnings for the future', text: 'Associations and partnerships bring disappointment if not watched; counsels prudence. Karmic-caution.', tone: 'caution' },
  27: { name: 'The Sceptre', text: 'A good number of authority, command and reward from one\'s own intellect and effort.', tone: 'favourable' },
  28: { name: 'Trust and loss', text: 'Promise undone by misplaced trust and losses through law or opposition; counsels provision for the future.', tone: 'caution' },
  29: { name: 'Uncertainty and deception', text: 'Trials and treachery from others; counsels discernment in whom to trust. Karmic-caution.', tone: 'caution' },
  30: { name: 'Thoughtful deduction', text: 'A number of retrospection and the mind over the material; neither fortunate nor unfortunate — it depends on choice.', tone: 'mixed' },
  31: { name: 'The Recluse', text: 'Like 30 but more self-contained; happiest standing apart from the crowd.', tone: 'mixed' },
  32: { name: 'Magic power of 23 (communal)', text: 'Fortunate like 23 if the person keeps to their own judgement against the advice of others.', tone: 'favourable' },
  33: { name: 'Like 24 (favourable)', text: 'Carries the fortunate meaning of 24 — help and gain through others.', tone: 'favourable' },
  34: { name: 'Like 25', text: 'Carries the meaning of 25 — strength earned through experience.', tone: 'mixed' },
  35: { name: 'Like 26', text: 'Carries the cautionary meaning of 26 — watch partnerships.', tone: 'caution' },
  36: { name: 'Like 27', text: 'Carries the fortunate meaning of 27 — reward from one\'s own intellect.', tone: 'favourable' },
  37: { name: 'Good friendships and partnerships', text: 'A fortunate number for relationships and collaborations of all kinds.', tone: 'favourable' },
  38: { name: 'Like 29', text: 'Carries the cautionary meaning of 29 — discernment in trust.', tone: 'caution' },
  40: { name: 'Like 31', text: 'Carries the meaning of 31 — the self-contained thinker.', tone: 'mixed' },
  41: { name: 'Like 32', text: 'Carries the meaning of 32 — fortunate if self-directed.', tone: 'favourable' },
  43: { name: 'Revolution and upheaval', text: 'An unfortunate number associated with upheaval and conflict; counsels steadiness.', tone: 'caution' },
  44: { name: 'Like 26', text: 'Carries the cautionary meaning of 26.', tone: 'caution' },
  45: { name: 'Like 27', text: 'Carries the fortunate meaning of 27.', tone: 'favourable' },
  46: { name: 'Like 37', text: 'Carries the fortunate meaning of 37 — good partnerships.', tone: 'favourable' },
  47: { name: 'Like 29', text: 'Carries the cautionary meaning of 29.', tone: 'caution' },
  52: { name: 'Like 43', text: 'Carries the cautionary meaning of 43 — upheaval.', tone: 'caution' },
};

export function compoundMeaning(compound: number) {
  return COMPOUND_MEANINGS[compound] || null;
}

// ── Name correction ──────────────────────────────────────────────────────────
export interface NameCorrectionResult {
  name: string;
  chaldean: NameNumberResult;
  pythagorean: NameNumberResult;
  compound: number;
  compoundMeaning: ReturnType<typeof compoundMeaning>;
  rootKeyword: string;
  rootPlanet: string;
  /** Harmony vs the person's birth numbers, only when a DOB is supplied. */
  harmony?: {
    lifePath: number;
    birthday: number;
    nameMatchesLifePath: boolean;
    nameMatchesBirthday: boolean;
    note: string;
  };
}

/** Life Path = reduce(day) + reduce(month) + reduce(year), master kept. */
export function lifePathFromDob(year: number, month: number, day: number): number {
  const d = reduceToSingleDigit(day);
  const m = reduceToSingleDigit(month);
  const y = reduceToSingleDigit(year);
  return reduceKeepingMaster(d + m + y);
}

export function analyseNameCorrection(name: string, dob?: { year: number; month: number; day: number }): NameCorrectionResult {
  const chaldean = chaldeanName(name);
  const pythagorean = pythagoreanName(name);
  const root = chaldean.root;
  const result: NameCorrectionResult = {
    name: name.trim(),
    chaldean,
    pythagorean,
    compound: chaldean.compound,
    compoundMeaning: compoundMeaning(chaldean.compound),
    rootKeyword: NUMBER_KEYWORD[root] || '',
    rootPlanet: NUMBER_PLANET[root] || '',
  };
  if (dob) {
    const lifePath = lifePathFromDob(dob.year, dob.month, dob.day);
    const birthday = reduceKeepingMaster(dob.day);
    const nameMatchesLifePath = areNumbersHarmonious(root, lifePath);
    const nameMatchesBirthday = areNumbersHarmonious(root, birthday);
    result.harmony = {
      lifePath, birthday, nameMatchesLifePath, nameMatchesBirthday,
      note: nameMatchesLifePath
        ? `Your Chaldean name number (${root}) sits comfortably with your Life Path (${lifePath}) — the tradition reads this as an easy, supportive fit.`
        : `Your Chaldean name number (${root}) and Life Path (${lifePath}) pull in different directions in the tradition — neither "good" nor "bad", just a contrast some people find worth reflecting on.`,
    };
  }
  return result;
}

// ── Business name ─────────────────────────────────────────────────────────────
// Traditionally the numbers most cited as supportive for enterprise are 1
// (leadership), 3 (growth/expansion), 5 (trade/communication), 6 (customer
// goodwill) and 9 (reach); 8 (Saturn) is said to demand caution and patience.
const BUSINESS_FAVOURABLE = new Set([1, 3, 5, 6, 9]);
const BUSINESS_CAUTION = new Set([4, 8]);

export interface BusinessNameResult {
  name: string;
  chaldean: NameNumberResult;
  root: number;
  rootPlanet: string;
  compound: number;
  compoundMeaning: ReturnType<typeof compoundMeaning>;
  verdict: 'favourable' | 'neutral' | 'caution';
  note: string;
}

export function analyseBusinessName(name: string): BusinessNameResult {
  const chaldean = chaldeanName(name);
  const root = chaldean.root;
  const verdict: BusinessNameResult['verdict'] =
    BUSINESS_FAVOURABLE.has(root) ? 'favourable' : BUSINESS_CAUTION.has(root) ? 'caution' : 'neutral';
  const note =
    verdict === 'favourable'
      ? `In the Chaldean business tradition, ${root} (${NUMBER_PLANET[root]}) is counted among the supportive numbers for enterprise — associated with ${NUMBER_KEYWORD[root]}.`
      : verdict === 'caution'
        ? `${root} (${NUMBER_PLANET[root]}) is a number the tradition asks you to approach with patience — associated with ${NUMBER_KEYWORD[root]}. Many successful businesses carry it; treat this as a note, not a warning.`
        : `${root} (${NUMBER_PLANET[root]}) is a steady, neutral number for business in the tradition — associated with ${NUMBER_KEYWORD[root]}.`;
  return {
    name: name.trim(), chaldean, root, rootPlanet: NUMBER_PLANET[root],
    compound: chaldean.compound, compoundMeaning: compoundMeaning(chaldean.compound),
    verdict, note,
  };
}

// ── Mobile number ─────────────────────────────────────────────────────────────
export interface DigitStringResult {
  input: string;
  digits: number[];
  sum: number;
  root: number;
  rootPlanet: string;
  keyword: string;
}

/** Sum every digit in a string (ignoring non-digits) and reduce to 1–9. */
export function sumDigitsOf(input: string): DigitStringResult {
  const digits = input.replace(/\D/g, '').split('').map(Number);
  const sum = digits.reduce((s, d) => s + d, 0);
  const root = sum === 0 ? 0 : reduceToSingleDigit(sum);
  return { input: input.trim(), digits, sum, root, rootPlanet: NUMBER_PLANET[root] || '—', keyword: NUMBER_KEYWORD[root] || '' };
}

export const MOBILE_MEANINGS: Record<number, string> = {
  1: 'A number that leans towards initiative and standing out — people reading it as self-directed and forward-moving.',
  2: 'A gentle, relationship-friendly vibration — read as cooperative and approachable.',
  3: 'Expressive and sociable — traditionally linked to communication and optimism (fitting for a phone!).',
  4: 'Grounded and practical — a steady, work-oriented number; the tradition asks for patience with it.',
  5: 'The classic "communication" number — restless, quick, change-friendly; many find it an easy fit for a phone.',
  6: 'Warm and people-centred — read as caring and harmonious.',
  7: 'Reflective and private — read as a more inward, thoughtful number.',
  8: 'Ambitious and material — the tradition links it to Saturn and asks for patience and discipline.',
  9: 'Broad, energetic and outward — read as humanitarian and wide-reaching.',
};

export const HOUSE_MEANINGS: Record<number, string> = {
  1: 'A 1 home is read as a place for new beginnings and independence — good for someone building something of their own.',
  2: 'A 2 home is read as nurturing and partnership-friendly — a gentle, settled feel for couples and families.',
  3: 'A 3 home is read as lively and social — a place that fills with conversation, guests and creativity.',
  4: 'A 4 home is read as stable and orderly — a grounded base that rewards routine and care of the property.',
  5: 'A 5 home is read as busy and ever-changing — suits people who travel, entertain and dislike standing still.',
  6: 'A 6 home is read as the classic family home — warm, caring and welcoming; the number most associated with domestic harmony.',
  7: 'A 7 home is read as quiet and restorative — a retreat that suits study, rest and the inner life.',
  8: 'An 8 home is read as a place of ambition and material focus — the tradition asks for balance so work does not crowd out rest.',
  9: 'A 9 home is read as open and generous — a place that welcomes many people and a broad, humane atmosphere.',
};
