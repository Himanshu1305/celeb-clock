/**
 * Extra numerology numbers — Growth P1 (P1-ATTITUDE-NUM, P1-CHALDEAN).
 *
 * Birthday & Attitude numbers extend the existing Pythagorean engine from the
 * date of birth; Chaldean is a distinct, older letter-to-number system (whitespace
 * vs the Western competitors). All are symbolic traditions, not predictive science
 * — meanings are reflection-first and the pages say so (honesty rule).
 *
 * Digit reduction reuses the same convention as personalYear.ts.
 */
import { reduceToSingleDigit } from './personalYear';
import { lifePathNumber, MASTER_NUMBERS } from './lifePath';

export { reduceToSingleDigit };

/** Reduce but preserve the master numbers 11/22/33 (as Life Path / Birthday do). */
export function reduceKeepingMaster(n: number): number {
  let x = Math.abs(Math.trunc(n));
  while (x > 9 && x !== 11 && x !== 22 && x !== 33) {
    x = String(x).split('').reduce((s, d) => s + Number(d), 0);
  }
  return x;
}

export interface BirthdayNumberResult {
  day: number;        // 1–31 as born
  number: number;     // the Birthday number (day reduced, master kept)
  isMaster: boolean;
}

/** Birthday number = the day of the month, reduced (master numbers kept). */
export function birthdayNumber(day: number): BirthdayNumberResult {
  const number = reduceKeepingMaster(day);
  return { day, number, isMaster: number === 11 || number === 22 || number === 33 };
}

export interface AttitudeNumberResult {
  number: number;     // 1–9
  day: number;
  month: number;
  working: string;    // shown worked example
}

/**
 * Attitude (a.k.a. Sun) number = reduce(birth day + birth month) to 1–9.
 * It describes the "first impression" reflex — how you react before you think.
 */
export function attitudeNumber(day: number, month: number): AttitudeNumberResult {
  const d = reduceToSingleDigit(day);
  const m = reduceToSingleDigit(month);
  const number = reduceToSingleDigit(day + month);
  return { number, day, month, working: `${day} (day) + ${month} (month) → ${d} + ${m} = ${reduceToSingleDigit(d + m)}` };
}

// ── Chaldean numerology ──────────────────────────────────────────────────────
// Classical Chaldean letter values (1–8; 9 is never assigned to a letter).
const CHALDEAN_MAP: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
};

// Pythagorean (for comparison): A=1…I=9, J=1…R=9, S=1…Z=8.
const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

export interface NameNumberResult {
  system: 'Chaldean' | 'Pythagorean';
  /** Raw sum of the letter values. */
  total: number;
  /**
   * The "compound" number = the raw total itself whenever it has two or more digits
   * (Batch 9: totals of 100+ are no longer collapsed — 104 stays 104; its traditional
   * meaning is looked up with compoundReading() in numerologyTools.ts).
   */
  compound: number;
  /** Final single digit 1–9 (the Indian / Chaldean "name number"). */
  root: number;
  /** 11, 22 or 33 when the total reduces through a master number (Western convention), else null. */
  master: number | null;
  /** Western display number: the master number if there is one, otherwise the root. */
  number: number;
  letters: Array<{ ch: string; value: number }>;
}

function sumName(name: string, map: Record<string, number>): { total: number; letters: Array<{ ch: string; value: number }> } {
  const letters: Array<{ ch: string; value: number }> = [];
  let total = 0;
  for (const raw of name.toLowerCase()) {
    const v = map[raw];
    if (v != null) {
      letters.push({ ch: raw, value: v });
      total += v;
    }
  }
  return { total, letters };
}

function nameResult(system: NameNumberResult['system'], name: string, map: Record<string, number>): NameNumberResult {
  const { total, letters } = sumName(name, map);
  const root = reduceToSingleDigit(total);
  const m = reduceKeepingMaster(total);
  const master = m === 11 || m === 22 || m === 33 ? m : null;
  return { system, total, compound: total, root, master, number: master ?? root, letters };
}

/**
 * THE Chaldean name number (one function sitewide — /name-numerology, /name-correction,
 * business-name, the Hindi calculator and the /numerology name field all call this).
 * Indian method: reduce to 1–9 (`root`); `master` is shown separately, labelled Western.
 */
export function chaldeanName(name: string): NameNumberResult {
  return nameResult('Chaldean', name, CHALDEAN_MAP);
}

/**
 * THE Pythagorean name total (Expression / Destiny number). Batch 9: /name-numerology
 * (src/data/nameNumerologyData.ts) and the /name-correction comparison both use this, so
 * the same name can no longer show two different Western numbers. `number` keeps
 * 11/22/33 (the Western Expression convention); `root` is the 1–9 reduction.
 */
export function pythagoreanName(name: string): NameNumberResult {
  return nameResult('Pythagorean', name, PYTHAGOREAN_MAP);
}

/** Pythagorean value of one letter (0 for non-letters). Shared with nameNumerologyData.ts. */
export function pythagoreanLetterValue(ch: string): number {
  return PYTHAGOREAN_MAP[ch.toLowerCase()] ?? 0;
}

// ── Mulank & Bhagyank (Indian method) ───────────────────────────────────────
// Founder decision (Batch 9): show BOTH systems, clearly labelled.
//   Mulank   = the birth DAY, digits added until one digit 1–9 remains.
//   Bhagyank = EVERY digit of the full birth date added, reduced to 1–9.
//   Where the Western Life Path (src/lib/lifePath.ts — the one sitewide method) is a
//   master number 11/22/33, it is shown next to the Bhagyank as "Western master number".
// Verified against Indian calculators opened 29 Oct 2026:
//   ishvaram.com/bhagyank-calculator — "For 9 November 1988: 9+1+1+1+9+8+8 = 37 → 10 → 1,
//     so the Bhagyank is 1"; "15 August 1990: 1+5+0+8+1+9+9+0 = 33 → 6" (no master kept).
//   panchangbodh.com/mulank-bhagyank-calculator — "23-08-1990 → … = 32 → 5" (Bhagyank);
//     "Born on 23rd → 2+3 = 5"; "29th: 2+9 = 11, then 1+1 = 2" (Mulank).
//   astrotalk.com/mulank-calculator — "15th March 1990 … mulank is 6"; "29th January 1985
//     … 2+9 = 11 → 1+1 = 2".
//   ishvaram.com/mulank-calculator — "Born on the 28th? 2+8 = 10, then 1+0 = 1".
// None of these Indian calculators keeps 11/22/33 for Mulank or Bhagyank.

/** Show a digit-sum reduction chain, e.g. 37 → "37 → 10 → 1". */
function reductionText(n: number): string {
  const parts = [String(n)];
  let x = n;
  while (x > 9) { x = String(x).split('').reduce((s, d) => s + Number(d), 0); parts.push(String(x)); }
  return parts.join(' → ');
}

export interface MulankResult {
  day: number;
  /** 1–9. */
  number: number;
  /** e.g. "28 → 2 + 8 = 10 → 1 + 0 = 1". */
  working: string;
}

/** THE Mulank (मूलांक): the birth day reduced to 1–9. */
export function mulank(day: number): MulankResult {
  const number = reduceToSingleDigit(day);
  const steps: string[] = [];
  let x = Math.abs(Math.trunc(day));
  while (x > 9) {
    const digits = String(x).split('');
    x = digits.reduce((s, d) => s + Number(d), 0);
    steps.push(`${digits.join(' + ')} = ${x}`);
  }
  return { day, number, working: steps.length ? `${day} → ${steps.join(' → ')}` : `${day}` };
}

export interface BhagyankResult {
  day: number; month: number; year: number;
  digits: number[];
  /** Sum of every digit of the date before reduction. */
  digitSum: number;
  /** 1–9 — the Indian Bhagyank. */
  number: number;
  /** e.g. "9 + 1 + 1 + 1 + 9 + 8 + 8 = 37 → 10 → 1". */
  working: string;
  /** The sitewide Western Life Path for the same date (src/lib/lifePath.ts). */
  westernLifePath: number;
  /** 11/22/33 when the Western Life Path is a master number, else null. */
  westernMaster: number | null;
}

/** THE Bhagyank (भाग्यांक): every digit of the full date of birth, reduced to 1–9. */
export function bhagyank(day: number, month: number, year: number): BhagyankResult {
  const digits = `${day}${month}${year}`.split('').map(Number);
  const digitSum = digits.reduce((s, d) => s + d, 0);
  const number = reduceToSingleDigit(digitSum);
  const westernLifePath = lifePathNumber(day, month, year);
  const westernMaster = MASTER_NUMBERS.includes(westernLifePath) ? westernLifePath : null;
  return {
    day, month, year, digits, digitSum, number,
    working: `${digits.join(' + ')} = ${reductionText(digitSum)}`,
    westernLifePath, westernMaster,
  };
}

export const CHALDEAN_LETTER_TABLE: Array<{ value: number; letters: string }> = [
  { value: 1, letters: 'A, I, J, Q, Y' },
  { value: 2, letters: 'B, K, R' },
  { value: 3, letters: 'C, G, L, S' },
  { value: 4, letters: 'D, M, T' },
  { value: 5, letters: 'E, H, N, X' },
  { value: 6, letters: 'U, V, W' },
  { value: 7, letters: 'O, Z' },
  { value: 8, letters: 'F, P' },
];

// ── Meanings (reflection-first, honest) ──────────────────────────────────────
export interface NumMeaning { title: string; text: string; }

export const BIRTHDAY_MEANINGS: Record<number, NumMeaning> = {
  1: { title: 'The Independent', text: 'A natural starter — self-reliant, direct and happiest leading your own effort rather than following a script.' },
  2: { title: 'The Diplomat', text: 'Sensitive and cooperative — you read people well and work best in partnership, as the one who smooths and connects.' },
  3: { title: 'The Communicator', text: 'Expressive, social and creative — you lift a room, and words, art or performance come naturally.' },
  4: { title: 'The Builder', text: 'Practical, steady and dependable — you create security through patient, methodical work.' },
  5: { title: 'The Free Spirit', text: 'Curious and adaptable — you crave variety, travel and change, and chafe against rigid routine.' },
  6: { title: 'The Nurturer', text: 'Responsible and caring — home, family and service matter deeply, and people lean on you.' },
  7: { title: 'The Seeker', text: 'Analytical and introspective — you want depth and meaning, and need solitude to think.' },
  8: { title: 'The Achiever', text: 'Ambitious and capable with material things — you are built for responsibility, organisation and long-game goals.' },
  9: { title: 'The Humanitarian', text: 'Idealistic and broad-hearted — you are moved by causes bigger than yourself and give generously.' },
  11: { title: 'The Intuitive (Master 11)', text: 'Heightened sensitivity and inspiration — a 2 raised to a higher key; powerful instincts that need grounding.' },
  22: { title: 'The Master Builder (22)', text: 'Big-picture vision with the patience to build it in the real world — a 4 at a higher octave.' },
  33: { title: 'The Master Teacher (33)', text: 'Service through uplift and care — a rare, demanding vibration of compassionate responsibility.' },
};

export const ATTITUDE_MEANINGS: Record<number, NumMeaning> = {
  1: { title: 'Self-starting', text: 'Your first reflex is to take charge and act — decisive, sometimes before consulting others.' },
  2: { title: 'Accommodating', text: 'You instinctively consider others and seek harmony before pushing your own view.' },
  3: { title: 'Light & expressive', text: 'You react with words, humour and warmth — people find you easy to approach.' },
  4: { title: 'Measured & practical', text: 'Your reflex is to assess and organise — you want the plan before the leap.' },
  5: { title: 'Quick & flexible', text: 'You respond fast and adapt on the fly, happiest when not boxed in.' },
  6: { title: 'Caring & responsible', text: 'Your first instinct is to help and take responsibility for the people around you.' },
  7: { title: 'Reserved & analytical', text: 'You hold back, observe and think before you reveal what you feel.' },
  8: { title: 'Commanding', text: 'You project competence and authority — people expect you to handle things.' },
  9: { title: 'Generous & principled', text: 'Your reflex is compassion and fairness — you react to the bigger human picture.' },
};
