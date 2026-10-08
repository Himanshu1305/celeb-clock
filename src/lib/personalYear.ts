/**
 * Personal Year Number (Pythagorean numerology).
 *
 * Date-dependent by design: the personal year is a function of the CURRENT
 * calendar year, so it MUST be computed in the visitor's browser at view time,
 * never baked in at build/prerender (see Backlog-1 Rule 13). The page prerenders
 * the static explanation; `computePersonalYear` fills the live number after load.
 *
 * Method (standard forecasting convention): reduce the birth MONTH and birth DAY
 * to single digits, add the reduced CURRENT YEAR, then reduce the total to a
 * single digit 1–9. Personal-year forecasting uses the nine-year cycle (1–9), so
 * — unlike the Life Path number — master numbers are NOT preserved here; this is
 * the common and internally-consistent choice, and the page states it plainly.
 */

/** Reduce a non-negative integer to a single digit 1–9 by summing digits. */
export function reduceToSingleDigit(n: number): number {
  let x = Math.abs(Math.trunc(n));
  while (x > 9) {
    x = String(x).split('').reduce((s, d) => s + Number(d), 0);
  }
  return x;
}

export interface PersonalYearResult {
  /** The personal year number for `year` (1–9). */
  number: number;
  /** The year this number applies to. */
  year: number;
  /** Universal year number for `year` (reduced current year), shown for context. */
  universalYear: number;
}

/**
 * Compute the personal year number.
 * @param birthMonth 1–12
 * @param birthDay   1–31
 * @param year       the calendar year to compute for (default: current year)
 */
export function computePersonalYear(birthMonth: number, birthDay: number, year: number): PersonalYearResult {
  const m = reduceToSingleDigit(birthMonth);
  const d = reduceToSingleDigit(birthDay);
  const universalYear = reduceToSingleDigit(year);
  const number = reduceToSingleDigit(m + d + universalYear);
  return { number, year, universalYear };
}

export interface PersonalYearMeaning {
  title: string;
  essence: string;
  focus: string;
}

/**
 * Honest, reflection-first themes for each personal year in the nine-year cycle.
 * Numerology is a symbolic tradition, not a predictive science — these are prompts
 * for reflection, not forecasts of events.
 */
export const PERSONAL_YEAR_MEANINGS: Record<number, PersonalYearMeaning> = {
  1: { title: 'Beginnings', essence: 'The start of a fresh nine-year cycle — a year that traditionally favours initiative, new directions and planting seeds.', focus: 'Starting things; independence; deciding what you actually want.' },
  2: { title: 'Patience & Partnership', essence: 'A slower, more relational year in the tradition — cooperation and letting things develop rather than forcing them.', focus: 'Relationships, patience, quiet progress and careful groundwork.' },
  3: { title: 'Expression & Creativity', essence: 'Associated with communication, creativity and social life — a lighter, more expressive chapter.', focus: 'Creativity, friendships, communication and enjoying the work.' },
  4: { title: 'Foundations & Work', essence: 'A building year in the tradition — structure, effort and steady, practical progress.', focus: 'Discipline, systems, finishing what you started, health routines.' },
  5: { title: 'Change & Freedom', essence: 'Linked with movement, variety and change — a year that often feels less predictable.', focus: 'Flexibility, travel, trying new things without over-committing.' },
  6: { title: 'Home & Responsibility', essence: 'A home- and people-centred year in the tradition — care, duty and relationships close to you.', focus: 'Family, home, commitments and looking after yourself too.' },
  7: { title: 'Reflection & Depth', essence: 'An inward, reflective year — study, rest and understanding rather than outward push.', focus: 'Learning, solitude, inner work and quality over quantity.' },
  8: { title: 'Ambition & Results', essence: 'Associated with effort meeting reward — a year the tradition links with work, responsibility and tangible goals.', focus: 'Goals, responsibility, finances and standing in your own authority.' },
  9: { title: 'Completion & Release', essence: 'The close of the nine-year cycle — finishing, letting go and making room for the next Year 1.', focus: 'Completion, forgiveness, decluttering and gentle endings.' },
};

export function getPersonalYearMeaning(n: number): PersonalYearMeaning {
  return PERSONAL_YEAR_MEANINGS[n] ?? PERSONAL_YEAR_MEANINGS[1];
}
