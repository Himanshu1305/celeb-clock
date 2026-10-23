/**
 * Manglik (Mangal Dosha) — ONE shared assessment used by the /manglik page, the
 * Kundali chart response and the Kundali-match warning, so they can never disagree.
 *
 * Convention (founder decision, Oct 2026 — AstroSage style):
 *   • Mars is checked from the Lagna AND from the Moon (whole-sign houses).
 *   • Dosha houses are 1, 4, 7, 8 and 12. The 2nd house is NOT counted.
 *   • Level: both checks positive → "High"; one check positive → "Low"; none → "None".
 *     This reproduces the AstroSage Manglik column for all 10 people in the
 *     17 Oct 2026 audit (round2.txt) — see manglik.test.ts.
 *
 * Classical cancellations (the same list shown on /manglik) are evaluated and
 * reported separately. AstroSage's level does NOT drop for them (Sukriti, Mars
 * exalted in Capricorn, is still "High" there), so `level` is left as computed and
 * `cancelled` tells the match page whether to treat the dosha as neutralised.
 */

export const MANGLIK_HOUSES = [1, 4, 7, 8, 12] as const;
export const MANGLIK_CONVENTION =
  'Mars is checked from the Lagna (Ascendant) and from the Moon, in the 1st, 4th, 7th, 8th and 12th houses (the 2nd house is not counted). Positive from both = High; from one = Low.';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export interface ManglikInput {
  lagnaSignIndex: number; // 0 = Aries
  moonSignIndex: number;
  marsSignIndex: number;
  jupiterSignIndex?: number;
  venusSignIndex?: number;
}
export interface ManglikCheck { from: 'Lagna' | 'Moon'; house: number; present: boolean }
export interface ManglikAssessment {
  /** Dosha present by the convention (before cancellations). */
  hasDosha: boolean;
  level: 'None' | 'Low' | 'High';
  fromLagna: ManglikCheck;
  fromMoon: ManglikCheck;
  /** Classical cancellations that apply to this chart (plain-language). */
  cancellations: string[];
  /** True when the dosha is present and at least one classical cancellation applies. */
  cancelled: boolean;
  marsSign: string;
}

const houseFrom = (fromSign: number, sign: number) => ((sign - fromSign + 12) % 12) + 1;

export function assessManglik(i: ManglikInput): ManglikAssessment {
  const hL = houseFrom(i.lagnaSignIndex, i.marsSignIndex);
  const hM = houseFrom(i.moonSignIndex, i.marsSignIndex);
  const fromLagna: ManglikCheck = { from: 'Lagna', house: hL, present: (MANGLIK_HOUSES as readonly number[]).includes(hL) };
  const fromMoon: ManglikCheck = { from: 'Moon', house: hM, present: (MANGLIK_HOUSES as readonly number[]).includes(hM) };
  const count = Number(fromLagna.present) + Number(fromMoon.present);
  const hasDosha = count > 0;
  const level = count === 2 ? 'High' : count === 1 ? 'Low' : 'None';

  const cancellations: string[] = [];
  const marsSign = SIGNS[i.marsSignIndex] ?? '';
  // Mars in its own sign (Aries, Scorpio) or exaltation (Capricorn).
  if (i.marsSignIndex === 0 || i.marsSignIndex === 7) cancellations.push(`Mars is in its own sign (${marsSign})`);
  if (i.marsSignIndex === 9) cancellations.push('Mars is exalted (Capricorn)');
  // Benefic aspect on Mars: Jupiter aspects the 5th, 7th and 9th signs from itself; Venus the 7th.
  if (typeof i.jupiterSignIndex === 'number') {
    const h = houseFrom(i.jupiterSignIndex, i.marsSignIndex);
    if (h === 5 || h === 7 || h === 9) cancellations.push('Jupiter aspects Mars');
  }
  if (typeof i.venusSignIndex === 'number' && houseFrom(i.venusSignIndex, i.marsSignIndex) === 7) {
    cancellations.push('Venus aspects Mars');
  }
  return { hasDosha, level, fromLagna, fromMoon, cancellations, cancelled: hasDosha && cancellations.length > 0, marsSign };
}

const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
/** One-line plain description of a single check, e.g. "From the Moon: Mars in the 4th house — Manglik". */
export function describeCheck(c: ManglikCheck): string {
  return `From the ${c.from === 'Lagna' ? 'Lagna (Ascendant)' : 'Moon'}: Mars in the ${ord(c.house)} house — ${c.present ? 'counts for Manglik' : 'does not count'}`;
}
