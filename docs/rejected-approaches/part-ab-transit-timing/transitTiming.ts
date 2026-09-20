// Rejected — see part-ab-touchpoints.md. Do not import.
/**
 * Transit-based marriage-timing engine — PROOF OF CONCEPT (Part AB).
 *
 * NOT user-facing and NOT imported anywhere yet. Pure computation, validated against
 * real charts before any decision to productionise. Implements the classical
 * Jupiter/Saturn transit rules professional Vedic astrologers use for marriage timing,
 * exactly as specified in docs/BornClock_PartAB_TransitTiming.md — grading definitions
 * are fixed and must NOT be relaxed to produce better-looking results.
 *
 * "Signifies / conjunct / aspects" use the same whole-sign convention as the rest of the
 * project. Transit positions come from the existing ephemeris (calculateBirthChart for
 * the transit date); this module only interprets positions, it computes no astronomy.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';

// Whole-sign graha-drishti aspect offsets (1-indexed houses from the planet).
const JUPITER_ASPECTS = [5, 7, 9];   // Jupiter: 5th, 7th, 9th
const SATURN_ASPECTS = [3, 7, 10];   // Saturn: 3rd, 7th, 10th

/** Houses (1-12) a planet at `fromHouse` aspects, given its special-aspect offsets. */
function aspectedHouses(fromHouse: number, offsets: number[]): number[] {
  return offsets.map(o => ((fromHouse - 1 + o - 1) % 12) + 1);
}

/** The fixed natal reference points a transit is tested against. */
export interface NatalMarriagePoints {
  lagnaIdx: number;            // 0-based sign of the 1st house
  seventhHouse: number;        // always 7 (whole-sign)
  seventhLord: string;         // planet ruling the 7th
  seventhLordHouse: number;    // natal house the 7th lord occupies
  seventhLordSignIdx: number;  // 0-based sign the 7th lord occupies
  venusHouse: number;          // natal house Venus occupies
}

export function natalMarriagePoints(natal: BirthChartResult): NatalMarriagePoints {
  const lagnaIdx = natal.lagna.rashiIndex;
  const seventhSignIdx = (lagnaIdx + 6) % 12;
  const seventhLord = SIGN_LORDS[seventhSignIdx];
  const byName: Record<string, BirthChartResult['planets'][number]> = {};
  for (const p of natal.planets) byName[p.name] = p;
  const sl = byName[seventhLord], v = byName['Venus'];
  return {
    lagnaIdx,
    seventhHouse: 7,
    seventhLord,
    seventhLordHouse: sl.house,
    seventhLordSignIdx: sl.signIndex - 1,
    venusHouse: v.house,
  };
}

/** Whole-sign natal house occupied by a body currently in sign `transitSignIdx` (0-based). */
function natalHouseOf(transitSignIdx: number, lagnaIdx: number): number {
  return ((transitSignIdx - lagnaIdx + 12) % 12) + 1;
}

export type Grade = 'STRONG' | 'MODERATE' | 'WEAK';

export interface MonthEval {
  hit: boolean;
  grade: Grade | null;
  jupiterDirect: boolean;
  jupiterHits: string[];
  saturnActivates: boolean;
  saturnHits: string[];
}

/**
 * Evaluate one instant's transit against the natal marriage points.
 * jupTransitSignIdx / satTransitSignIdx are 0-based signs of transit Jupiter / Saturn.
 */
export function evaluateTransit(pts: NatalMarriagePoints, jupTransitSignIdx: number, satTransitSignIdx: number): MonthEval {
  const jH = natalHouseOf(jupTransitSignIdx, pts.lagnaIdx);
  const sH = natalHouseOf(satTransitSignIdx, pts.lagnaIdx);
  const jAsp = aspectedHouses(jH, JUPITER_ASPECTS);
  const sAsp = aspectedHouses(sH, SATURN_ASPECTS);

  // ── Jupiter rules (1-5) ──
  const jupiterHits: string[] = [];
  const inSeventh = jH === pts.seventhHouse;                         // rule 1 (direct)
  const inLordSign = jupTransitSignIdx === pts.seventhLordSignIdx;   // rule 2 (in the 7th-lord's sign)
  const aspSeventh = jAsp.includes(pts.seventhHouse);               // rule 3 (aspect 7th house)
  const conjLord = jH === pts.seventhLordHouse;                      // rule 4 (conjunct 7th lord)
  const aspLord = jAsp.includes(pts.seventhLordHouse);              // rule 4 (aspect 7th lord)
  const conjVenus = jH === pts.venusHouse;                           // rule 5 (conjunct Venus)
  const aspVenus = jAsp.includes(pts.venusHouse);                   // rule 5 (aspect Venus)
  if (inSeventh) jupiterHits.push('Jupiter in natal 7th house');
  if (inLordSign) jupiterHits.push(`Jupiter in the 7th-lord's sign`);
  if (aspSeventh) jupiterHits.push('Jupiter aspects natal 7th house');
  if (conjLord) jupiterHits.push(`Jupiter conjunct 7th lord (${pts.seventhLord})`);
  else if (aspLord) jupiterHits.push(`Jupiter aspects 7th lord (${pts.seventhLord})`);
  if (conjVenus) jupiterHits.push('Jupiter conjunct Venus');
  else if (aspVenus) jupiterHits.push('Jupiter aspects Venus');

  // "Direct" = Jupiter transiting the 7th house OR conjunct the 7th lord/Venus (spec).
  const jupiterDirect = inSeventh || conjLord || conjVenus;
  const jupiterAny = jupiterHits.length > 0;

  // ── Saturn (secondary confirming indicator; activates any of the same points) ──
  const saturnHits: string[] = [];
  if (sH === pts.seventhHouse) saturnHits.push('Saturn in natal 7th house');
  if (satTransitSignIdx === pts.seventhLordSignIdx) saturnHits.push(`Saturn in the 7th-lord's sign`);
  if (sAsp.includes(pts.seventhHouse)) saturnHits.push('Saturn aspects natal 7th house');
  if (sH === pts.seventhLordHouse) saturnHits.push(`Saturn conjunct 7th lord`);
  else if (sAsp.includes(pts.seventhLordHouse)) saturnHits.push(`Saturn aspects 7th lord`);
  if (sH === pts.venusHouse) saturnHits.push('Saturn conjunct Venus');
  else if (sAsp.includes(pts.venusHouse)) saturnHits.push('Saturn aspects Venus');
  const saturnActivates = saturnHits.length > 0;

  if (!jupiterAny) return { hit: false, grade: null, jupiterDirect, jupiterHits, saturnActivates, saturnHits };

  // ── Grading (FIXED per spec — do not relax) ──
  let grade: Grade;
  if (jupiterDirect && saturnActivates) grade = 'STRONG';           // double transit, Jupiter direct
  else if (jupiterDirect || jupiterAny) grade = 'MODERATE';         // Jupiter direct w/o Saturn, or via aspect
  else grade = 'WEAK';                                              // (unreachable given jupiterAny, kept for completeness)
  return { hit: true, grade, jupiterDirect, jupiterHits, saturnActivates, saturnHits };
}

export interface CandidateWindow {
  start: string;      // YYYY-MM
  end: string;        // YYYY-MM (inclusive last hit month)
  grade: Grade;       // best (max) grade across the window
  months: number;
  sampleReasons: string[];
}

const GRADE_RANK: Record<Grade, number> = { WEAK: 0, MODERATE: 1, STRONG: 2 };

/**
 * Scan a month-by-month series of (Jupiter sign, Saturn sign) evals and merge
 * consecutive hit-months into candidate windows. `series` is chronological.
 */
export function mergeWindows(series: Array<{ ym: string; ev: MonthEval }>): CandidateWindow[] {
  const windows: CandidateWindow[] = [];
  let cur: { start: string; end: string; grade: Grade; months: number; reasons: Set<string> } | null = null;
  for (const { ym, ev } of series) {
    if (ev.hit) {
      if (!cur) cur = { start: ym, end: ym, grade: ev.grade!, months: 1, reasons: new Set() };
      else { cur.end = ym; cur.months++; if (GRADE_RANK[ev.grade!] > GRADE_RANK[cur.grade]) cur.grade = ev.grade!; }
      ev.jupiterHits.forEach(r => cur!.reasons.add(r));
      ev.saturnHits.forEach(r => cur!.reasons.add(r));
    } else if (cur) {
      windows.push({ start: cur.start, end: cur.end, grade: cur.grade, months: cur.months, sampleReasons: [...cur.reasons] });
      cur = null;
    }
  }
  if (cur) windows.push({ start: cur.start, end: cur.end, grade: cur.grade, months: cur.months, sampleReasons: [...cur.reasons] });
  return windows;
}
