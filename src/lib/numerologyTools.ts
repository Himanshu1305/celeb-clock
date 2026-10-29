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
import { lifePathNumber } from './lifePath';
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
export const NUMBER_KEYWORD: Record<number, string> = {
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
// Traditional meanings of the two-digit "compound" numbers 10–52 from Cheiro,
// "Cheiro's Book of Numbers" (London: Herbert Jenkins, 1926; public domain), chapter
// on the symbolism of the compound numbers (pp. 126–133 of the 1935 English edition).
// Paraphrased, not copied. Batch 9 added the entries that were missing (39, 42,
// 48, 49, 50, 51). The primary scan is archive.org item in.ernet.dli.2015.70770
// (Cheiros Book Of Numbers, Herbert Jenkins — item page opened 29 Oct 2026; the
// full-text file itself was not reachable from the build environment), so the
// wording of each entry was checked against two pages that quote that chapter,
// opened 29 Oct 2026:
//   bostjanlovrat.com/2024/08/21/classical-cheiros-descriptions-of-compound-numbers/
//     (quotes the 1935 Herbert Jenkins edition, pp. 126–133) — e.g. 39 "Has the same
//     meaning as the number 30, which is the next to it in its own series of compound
//     numbers"; 42 "Has the same meaning as the number 24"; 48 = 30; 49 = 31; 50 = 32;
//     51 "a very powerful potency of its own. It represents the nature of the warrior".
//   astronumero.org/compound-numbers/ — same equivalences (39 ≈ 30, 42 ≈ 24, 48 ≈ 30,
//     49 ≈ 31, 50 ≈ 32, 51 the warrior number).
// Tone rule (Batch 7 standing rule 7): Cheiro's darker wording (accidents, violent
// ends) is paraphrased as care and caution — never as a prediction.
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
  20: { name: 'The Awakening', text: 'A call to action for a purpose; new plans and ambitions. Cheiro calls it a spiritual rather than a material number, so it is uncertain for purely worldly success.', tone: 'mixed' },
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
  39: { name: 'Like 30', text: 'Cheiro gives it the meaning of 30 — thoughtful deduction; neither lucky nor unlucky in itself, it depends on how the mind is used.', tone: 'mixed' },
  40: { name: 'Like 31', text: 'Carries the meaning of 31 — the self-contained thinker.', tone: 'mixed' },
  41: { name: 'Like 32', text: 'Carries the meaning of 32 — fortunate if self-directed.', tone: 'favourable' },
  42: { name: 'Like 24', text: 'Cheiro gives it the meaning of 24 — help and backing from people in position, and gain through love and partnership.', tone: 'favourable' },
  43: { name: 'Revolution and upheaval', text: 'An unfortunate number associated with upheaval and conflict; counsels steadiness.', tone: 'caution' },
  44: { name: 'Like 26', text: 'Carries the cautionary meaning of 26.', tone: 'caution' },
  45: { name: 'Like 27', text: 'Carries the fortunate meaning of 27.', tone: 'favourable' },
  46: { name: 'Like 37', text: 'Carries the fortunate meaning of 37 — good partnerships.', tone: 'favourable' },
  47: { name: 'Like 29', text: 'Carries the cautionary meaning of 29.', tone: 'caution' },
  48: { name: 'Like 30', text: 'Cheiro gives it the meaning of 30 — a number of the thinking mind; the outcome depends on the person\'s own choices.', tone: 'mixed' },
  49: { name: 'Like 31', text: 'Cheiro gives it the meaning of 31 — self-contained and independent; Cheiro did not count it as a worldly-success number.', tone: 'mixed' },
  50: { name: 'Like 32', text: 'Cheiro gives it the meaning of 32 — fortunate when the person trusts their own judgement rather than others\' advice.', tone: 'favourable' },
  51: { name: 'The Warrior', text: 'A number with strong potency of its own: the nature of the warrior, and sudden advancement in whatever is undertaken — favoured for leaders of a cause. Cheiro also counsels staying alert to rivals and opposition.', tone: 'mixed' },
  52: { name: 'Like 43', text: 'Carries the cautionary meaning of 43 — upheaval.', tone: 'caution' },
};

/** Cheiro's own listed meaning for a compound number 10–52, or null if he lists none. */
export function compoundMeaning(compound: number) {
  return COMPOUND_MEANINGS[compound] || null;
}

/**
 * The highest compound Cheiro gives a meaning for. His list in the Book of Numbers
 * stops at 52; per the quoting pages above, the book itself gives NO separate rule for
 * totals above 52 (bostjanlovrat.com/2024/09/05/extended-cheiros-rule-for-numbers-above-52/
 * — "he described a system up to 52"). What the book does state is the SERIES rule
 * used inside 10–52: a number with no potency of its own "has the same meaning as the
 * number … next to it in its own series of compound numbers", the series stepping by 9
 * (33 = 24, 34 = 25, … 42 = 24, 48 = 30, 52 = 43). For totals above 52 we apply that
 * same series rule — subtract 9 until the number is 52 or less — which is also the rule
 * astronumero.org/compound-numbers/ gives ("reduce the number by 9 till you reach 52 (or
 * less)"; it attributes it to Cheiro's "Book of Palmistry, Numerology and Astrology").
 * The UI labels such a reading as this extension, never as Cheiro's own listed meaning.
 * Subtracting 9 never changes the final 1–9 root, so the name number itself is unaffected.
 */
export const CHEIRO_COMPOUND_MAX = 52;

export interface CompoundReading {
  /** The raw letter total. */
  total: number;
  /** The compound whose meaning is shown (= total when 10–52; series-reduced when > 52). */
  lookup: number;
  meaning: { name: string; text: string; tone: 'favourable' | 'mixed' | 'caution' };
  /** 'cheiro' = Cheiro lists this total; 'series' = above 52, read via the series rule. */
  basis: 'cheiro' | 'series';
}

/**
 * Traditional reading for a name total. Returns null for totals 1–9 (no compound — the
 * single number itself is the reading) and for 0.
 */
export function compoundReading(total: number): CompoundReading | null {
  const t = Math.abs(Math.trunc(total));
  if (t < 10) return null;
  let lookup = t;
  while (lookup > CHEIRO_COMPOUND_MAX) lookup -= 9;
  const meaning = COMPOUND_MEANINGS[lookup];
  if (!meaning) return null; // every value 10–52 is listed; kept for safety
  return { total: t, lookup, meaning, basis: lookup === t ? 'cheiro' : 'series' };
}

/** One plain sentence explaining where a compound reading comes from (for the UI). */
export function compoundBasisNote(r: CompoundReading, lang: 'en' | 'hi' = 'en'): string {
  if (lang === 'hi') {
    return r.basis === 'cheiro'
      ? `कीरो की "Book of Numbers" (1926) में ${r.total} का अर्थ 10–52 के संयुक्त अंकों में दिया गया है।`
      : `कीरो की सूची 52 पर रुकती है और ${r.total} का अपना अर्थ नहीं देती। उनके "एक ही श्रृंखला" नियम (52 या कम होने तक 9 घटाएँ) से ${r.total} को ${r.lookup} की तरह पढ़ा गया है — यह उनकी पद्धति का विस्तार है, उनका लिखा अर्थ नहीं।`;
  }
  return r.basis === 'cheiro'
    ? `Cheiro's Book of Numbers (1926) lists ${r.total} among the compound numbers 10–52.`
    : `Cheiro's list stops at 52 and gives no meaning for ${r.total} itself. Following his "same series" rule (subtract 9 until the number is 52 or less), ${r.total} is read as ${r.lookup}. This is an extension of his method, not a meaning he wrote for ${r.total}.`;
}

// ── Name correction ──────────────────────────────────────────────────────────
export interface NameCorrectionResult {
  name: string;
  chaldean: NameNumberResult;
  pythagorean: NameNumberResult;
  compound: number;
  compoundMeaning: ReturnType<typeof compoundMeaning>;
  /** Batch 9: the reading actually shown (handles totals above 52 via the series rule). */
  compoundReading: CompoundReading | null;
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

/** Life Path — the ONE shared sitewide function (src/lib/lifePath.ts, audit N1). */
export function lifePathFromDob(year: number, month: number, day: number): number {
  return lifePathNumber(day, month, year);
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
    compoundMeaning: compoundReading(chaldean.compound)?.meaning ?? null,
    compoundReading: compoundReading(chaldean.compound),
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
  compoundReading: CompoundReading | null;
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
    compound: chaldean.compound, compoundMeaning: compoundReading(chaldean.compound)?.meaning ?? null,
    compoundReading: compoundReading(chaldean.compound),
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

/**
 * Mobile number → digits that are actually "the number" (audit N9): the India country
 * code (+91 / 0091 / a leading 91 on a 12-digit number) and a leading trunk 0 on an
 * 11-digit number are not part of the subscriber number, so they are not counted.
 */
export function mobileSubscriberDigits(input: string): string {
  const raw = input.trim();
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+91') || digits.startsWith('0091')) digits = digits.replace(/^(00)?91/, '');
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

/** Mobile-number reduction — country code / trunk prefix excluded. */
export function sumMobileDigits(input: string): DigitStringResult {
  return { ...sumDigitsOf(mobileSubscriberDigits(input)), input: input.trim() };
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

// ── Vehicle number (Batch 10, /vehicle-number-numerology) ─────────────────────
// Same digit-sum pattern as the mobile number. Three methods are in common use, so all
// three are shown, each labelled (sources opened 29 Oct 2026):
//   • All digits — "Add all the digits present on the number plate of your vehicle and
//     reduce it to a single digit" (astroyogi.com/blog/lucky-vehicle-number-numerology.aspx);
//     garwarehitechfilms.com (lucky car number as per numerology in India) also notes
//     "Most people only calculate the digits in the registration number". → our main number.
//   • Last four digits — the registration number proper (the final block of an Indian
//     plate); astroyogi's own worked example sums only that block (DL-12-XY-1234 → 1).
//   • Full plate, Chaldean — letters take their Chaldean values (1–8, no 9) and are added
//     to the digits, state code included (astromitra.com lucky vehicle number calculator:
//     "MH 12 PK 4521" → M4 H5 P8 K2 + 1,2,4,5,2,1 = 34 → 7).
export interface VehicleNumberResult {
  plate: string;
  allDigits: DigitStringResult;
  /** The last run of digits on the plate (usually 4), when the plate has one. */
  lastBlock: DigitStringResult | null;
  /** Letters (Chaldean values) + digits. */
  fullPlate: { total: number; root: number; letters: Array<{ ch: string; value: number }>; digits: number[] };
}

export function vehicleNumber(plate: string): VehicleNumberResult {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const allDigits = { ...sumDigitsOf(clean), input: plate.trim() };
  const blocks = clean.match(/\d+/g) ?? [];
  const last = blocks.length ? blocks[blocks.length - 1] : '';
  const lastBlock = last ? sumDigitsOf(last) : null;
  const letters = chaldeanName(clean.replace(/\d/g, '')).letters.map(l => ({ ch: l.ch.toUpperCase(), value: l.value }));
  const digits = clean.replace(/\D/g, '').split('').map(Number);
  const total = letters.reduce((s, l) => s + l.value, 0) + digits.reduce((s, d) => s + d, 0);
  return { plate: plate.trim(), allDigits, lastBlock, fullPlate: { total, root: total === 0 ? 0 : reduceToSingleDigit(total), letters, digits } };
}

/** How a vehicle's number sits with the owner's Mulank (birth day number), by the
 *  same friendly-number table the name-correction tool uses (areNumbersHarmonious). */
export function vehicleOwnerHarmony(vehicleRoot: number, mulankNumber: number): 'same' | 'harmonious' | 'neutral' {
  if (vehicleRoot === mulankNumber) return 'same';
  return areNumbersHarmonious(vehicleRoot, mulankNumber) ? 'harmonious' : 'neutral';
}

export const VEHICLE_MEANINGS: Record<number, string> = {
  1: 'Read as a self-directed, “first off the line” number — suits a vehicle you drive yourself to work and new ventures.',
  2: 'Read as gentle and companionable — a calm, shared-use family number.',
  3: 'Read as cheerful and sociable — trips with friends, outings and travel for learning.',
  4: 'Read as steady but demanding — the tradition asks for regular servicing and careful, rule-following driving.',
  5: 'Read as the travel and movement number — quick, flexible and always on the go.',
  6: 'Read as the comfortable family number — care, home and pleasant journeys together.',
  7: 'Read as quiet and reflective — long solo drives and journeys with a purpose.',
  8: 'Read as hard-working and disciplined — the tradition links it to Saturn and asks for patience on the road.',
  9: 'Read as energetic and bold — the tradition asks you to keep that energy for the destination, not the speed.',
};
