/**
 * Lo Shu grid from a date of birth (Batch 10) — /lo-shu-grid-calculator.
 *
 * Method (astromedha.in/insights/lo-shu/grid and astromedha.in/free-tools/lo-shu-grid,
 * both opened 29 Oct 2026): write the full date of birth (day, month, year), "strike out
 * every zero", count how often each digit 1–9 appears and place each count in that
 * digit's fixed cell of the Lo Shu magic square
 *
 *     4 9 2
 *     3 5 7
 *     8 1 6        ("Every row, column, and diagonal sums to 15.")
 *
 * Planes — rows, columns (astromedha, same pages):
 *   Mind 4-9-2 (top row): intellect, memory, planning
 *   Emotional 3-5-7 (middle row): feeling, intuition, inner life
 *   Practical 8-1-6 (bottom row): money, action, material life
 *   Thought 4-3-8 (left column): generating and processing thought
 *   Will 9-5-1 (centre column): willpower, direction, inner fire
 *   Action 2-7-6 (right column): execution, completion, results
 * Diagonals — astroarunpandit.org/lo-shu-grid-planes-numerology/ (opened 29 Oct 2026):
 *   4-5-6 "Golden Yog" (linked to name, fame and money), 2-5-8 "Silver Yog" (property).
 *
 * Missing numbers: "a pointer, not a curse" — the number's quality "is not automatic in
 * your life" and needs deliberate cultivation (astromedha). Repeated numbers: the sources
 * we opened do not agree on what 2, 3 or 4 repeats mean, so we show the counts only and
 * do not invent meanings. Calm, reflective framing (Batch 7 rule 7); numerology is a
 * symbolic tradition, not a prediction.
 */
import { NUMBER_KEYWORD, NUMBER_PLANET } from './numerologyTools';

export const LO_SHU_LAYOUT: number[][] = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

export interface LoShuPlaneDef {
  id: string;
  name: string;
  numbers: [number, number, number];
  kind: 'row' | 'column' | 'diagonal';
  /** What the plane stands for (sourced, see file header). */
  about: string;
}

export const LO_SHU_PLANES: LoShuPlaneDef[] = [
  { id: 'mind', name: 'Mind plane', numbers: [4, 9, 2], kind: 'row', about: 'intellect, memory and planning' },
  { id: 'emotional', name: 'Emotional plane', numbers: [3, 5, 7], kind: 'row', about: 'feeling, intuition and your inner life' },
  { id: 'practical', name: 'Practical plane', numbers: [8, 1, 6], kind: 'row', about: 'money, action and the material side of life' },
  { id: 'thought', name: 'Thought plane', numbers: [4, 3, 8], kind: 'column', about: 'generating and processing ideas' },
  { id: 'will', name: 'Will plane', numbers: [9, 5, 1], kind: 'column', about: 'willpower, direction and inner drive' },
  { id: 'action', name: 'Action plane', numbers: [2, 7, 6], kind: 'column', about: 'execution, completion and results' },
  { id: 'golden', name: 'Golden Yog (4-5-6)', numbers: [4, 5, 6], kind: 'diagonal', about: 'traditionally linked with name, recognition and money' },
  { id: 'silver', name: 'Silver Yog (2-5-8)', numbers: [2, 5, 8], kind: 'diagonal', about: 'traditionally linked with property' },
];

export type PlaneStatus = 'complete' | 'partial' | 'empty';

export interface LoShuPlane extends LoShuPlaneDef {
  status: PlaneStatus;
  present: number[];
  missing: number[];
  /** One plain line on what this means for you. */
  reading: string;
}

export interface LoShuResult {
  dob: string;
  /** Digits used (zeros struck out), in date order (day, month, year). */
  digits: number[];
  counts: Record<number, number>;
  present: number[];
  missing: number[];
  repeated: Array<{ n: number; count: number }>;
  planes: LoShuPlane[];
  completePlanes: LoShuPlane[];
}

function planeReading(p: LoShuPlaneDef, status: PlaneStatus, missing: number[]): string {
  if (status === 'complete') return `Complete — all of ${p.numbers.join(', ')} are in your date. This line (${p.about}) is read as a natural strength to lean on.`;
  if (status === 'empty') return `Empty — none of ${p.numbers.join(', ')} are in your date. The tradition reads this line (${p.about}) as something to build on purpose rather than something that runs on autopilot.`;
  return `Partly filled (missing ${missing.join(' and ')}). This line (${p.about}) is there, with room to grow through practice.`;
}

/** Lo Shu grid for a YYYY-MM-DD date of birth. */
export function loShuGrid(dob: string): LoShuResult {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) throw new Error('date must be YYYY-MM-DD');
  const [, y, mo, d] = m;
  // Day, month, year as written (DD MM YYYY); zeros are struck out.
  const digits = `${d}${mo}${y}`.split('').map(Number).filter(n => n !== 0);
  const counts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) counts[n] = 0;
  for (const n of digits) counts[n]++;
  const present = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => counts[n] > 0);
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => counts[n] === 0);
  const repeated = present.filter(n => counts[n] > 1).map(n => ({ n, count: counts[n] }));
  const planes: LoShuPlane[] = LO_SHU_PLANES.map(p => {
    const pres = p.numbers.filter(n => counts[n] > 0);
    const miss = p.numbers.filter(n => counts[n] === 0);
    const status: PlaneStatus = pres.length === 3 ? 'complete' : pres.length === 0 ? 'empty' : 'partial';
    return { ...p, status, present: pres, missing: miss, reading: planeReading(p, status, miss) };
  });
  return { dob, digits, counts, present, missing, repeated, planes, completePlanes: planes.filter(p => p.status === 'complete') };
}

/** Plain line for a missing number: its keyword and ruling planet (same table as the other numerology tools). */
export function missingNumberNote(n: number): string {
  return `${n} (${NUMBER_PLANET[n]}) — ${NUMBER_KEYWORD[n]}: not automatic for you; it grows with conscious practice.`;
}
