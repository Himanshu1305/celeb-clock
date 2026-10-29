/**
 * Batch 9 — Indian numerology (Mulank, Bhagyank, Chaldean name number) and Cheiro's
 * compound numbers. Reference values come from public calculators opened with WebFetch
 * on 29 Oct 2026 (quoted in src/lib/numerologyExtra.ts and src/lib/numerologyTools.ts):
 *   [ISH-B] ishvaram.com/bhagyank-calculator       [ISH-M] ishvaram.com/mulank-calculator
 *   [PB]    panchangbodh.com/mulank-bhagyank-calculator
 *   [AT]    astrotalk.com/mulank-calculator
 *   [AM]    astromedha.in/insights/numerology/name-number-calculator (Chaldean)
 *   [AS]    astrosight.ai/numerology/chaldean-numerology-name-calculator (Chaldean)
 * Values marked "method" are not printed on those pages; they follow the method the
 * pages state and are hand-checked in the comment.
 */
import { describe, it, expect } from 'vitest';
import { mulank, bhagyank, chaldeanName, pythagoreanName } from '../numerologyExtra';
import { lifePathNumber } from '../lifePath';
import {
  compoundReading, compoundMeaning, COMPOUND_MEANINGS, CHEIRO_COMPOUND_MAX,
  analyseNameCorrection, analyseBusinessName,
} from '../numerologyTools';
import { calculateAllNameNumbers } from '@/data/nameNumerologyData';

describe('Mulank and Bhagyank — six dates vs Indian calculators', () => {
  const cases: Array<[string, number, number, number, number, string]> = [
    // label, day, month, year, [mulank, bhagyank] in the next two slots
    ['9 Nov 1988', 9, 11, 1988, 9, '[ISH-B] Bhagyank 1 (9+1+1+1+9+8+8 = 37 → 10 → 1); Mulank 9 = day 9'],
    ['15 Aug 1990', 15, 8, 1990, 6, '[ISH-B] Bhagyank 6 (… = 33 → 6, no master kept); Mulank 1+5 = 6'],
    ['23 Aug 1990', 23, 8, 1990, 5, '[PB] Bhagyank 5 (… = 32 → 5); [PB][ISH-M] Mulank 2+3 = 5'],
    ['15 Mar 1990', 15, 3, 1990, 6, '[AT] Mulank 6; Bhagyank method 1+5+3+1+9+9+0 = 28 → 10 → 1'],
    ['29 Jan 1985', 29, 1, 1985, 2, '[AT][PB] Mulank 2+9 = 11 → 2; Bhagyank method 2+9+1+1+9+8+5 = 35 → 8'],
    ['28 Mar 1973', 28, 3, 1973, 1, '[ISH-M] Mulank 2+8 = 10 → 1; Bhagyank method 2+8+3+1+9+7+3 = 33 → 6'],
  ];
  const bhagyankExpected: Record<string, number> = {
    '9 Nov 1988': 1, '15 Aug 1990': 6, '23 Aug 1990': 5, '15 Mar 1990': 1, '29 Jan 1985': 8, '28 Mar 1973': 6,
  };
  it.each(cases)('%s', (label, d, m, y, mul) => {
    expect(mulank(d).number).toBe(mul);
    expect(bhagyank(d, m, y).number).toBe(bhagyankExpected[label]);
  });

  it('Mulank and Bhagyank are always 1–9 (Indian calculators keep no master number)', () => {
    for (let d = 1; d <= 31; d++) expect(mulank(d).number).toBeGreaterThanOrEqual(1);
    for (let d = 1; d <= 31; d++) expect(mulank(d).number).toBeLessThanOrEqual(9);
    expect(mulank(29).number).toBe(2);   // 29 → 11 → 2, not 11
    expect(mulank(29).working).toBe('29 → 2 + 9 = 11 → 1 + 1 = 2');
    expect(bhagyank(9, 11, 1988).working).toBe('9 + 1 + 1 + 1 + 9 + 8 + 8 = 37 → 10 → 1');
  });

  it('Bhagyank always has the same final digit as the Western Life Path', () => {
    for (let y = 1940; y <= 2010; y += 7) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d += 3) {
      const lp = lifePathNumber(d, m, y);
      const b = bhagyank(d, m, y);
      expect(b.number).toBe(lp === 11 ? 2 : lp === 22 ? 4 : lp === 33 ? 6 : lp);
    }
  });
});

describe('master-number labelling', () => {
  it('22 Jun 1949: Bhagyank 6, Western master number 33 (Western Life Path)', () => {
    const b = bhagyank(22, 6, 1949);
    expect(b.number).toBe(6);
    expect(b.westernLifePath).toBe(33);
    expect(b.westernMaster).toBe(33);
  });
  it('15 Aug 1990: all-digit sum is 33 but the Western Life Path is 6 → NO master label', () => {
    const b = bhagyank(15, 8, 1990);
    expect(b.digitSum).toBe(33);
    expect(b.number).toBe(6);
    expect(b.westernLifePath).toBe(6);
    expect(b.westernMaster).toBeNull();
  });
  it('name totals through 11/22/33 carry a separate Western master number; the name number stays 1–9', () => {
    const ds = chaldeanName('David Smith'); // [AS] 16 + 17 = 33 → 6; [AM] keeps 33 as a master
    expect(ds.total).toBe(33);
    expect(ds.root).toBe(6);
    expect(ds.master).toBe(33);
    expect(chaldeanName('Shah Rukh Khan').master).toBeNull();
  });
});

describe('Chaldean name numbers — five names', () => {
  // Hand check against the chart (A I J Q Y=1 · B K R=2 · C G L S=3 · D M T=4 · E H N X=5 ·
  // U V W=6 · O Z=7 · F P=8):
  it.each([
    ['Shah Rukh Khan', 42, 6], // S3 H5 A1 H5 = 14 · R2 U6 K2 H5 = 15 · K2 H5 A1 N5 = 13 → 42 → 6
    ['Rahul', 17, 8],          // [AM] "2+1+5+6+3 = 17, and 1+7 = 8"
    ['Sarah', 12, 3],          // [AS] "3 + 1 + 2 + 1 + 5 = 12 → 1 + 2 = 3"
    ['David Smith', 33, 6],    // [AS] "16 + 17 = 33 → 3 + 3 = 6"
    ['Ryan', 9, 9],            // [AS] "2 + 1 + 1 + 5 = 9"
  ])('%s → total %i → name number %i', (name, total, root) => {
    const r = chaldeanName(name);
    expect(r.total).toBe(total);
    expect(r.compound).toBe(total);
    expect(r.root).toBe(root);
  });
});

describe("Cheiro's compound numbers", () => {
  it('every total from 10 to 60 has a reading; 1–9 have none (the single number is the reading)', () => {
    for (let t = 1; t <= 9; t++) expect(compoundReading(t)).toBeNull();
    for (let t = 10; t <= 60; t++) {
      const r = compoundReading(t);
      expect(r, `total ${t}`).not.toBeNull();
      expect(r!.meaning.text.length).toBeGreaterThan(10);
    }
  });
  it('10–52 are Cheiro\'s own listed meanings, including the previously missing 39, 42, 48–51', () => {
    for (let t = 10; t <= CHEIRO_COMPOUND_MAX; t++) {
      expect(COMPOUND_MEANINGS[t], `missing ${t}`).toBeTruthy();
      expect(compoundReading(t)!.basis).toBe('cheiro');
    }
    // Cheiro's equivalences (quoted in numerologyTools.ts): 39 = 30, 42 = 24, 48 = 30, 49 = 31, 50 = 32.
    expect(COMPOUND_MEANINGS[39].tone).toBe(COMPOUND_MEANINGS[30].tone);
    expect(COMPOUND_MEANINGS[42].tone).toBe(COMPOUND_MEANINGS[24].tone);
    expect(COMPOUND_MEANINGS[48].tone).toBe(COMPOUND_MEANINGS[30].tone);
    expect(COMPOUND_MEANINGS[49].tone).toBe(COMPOUND_MEANINGS[31].tone);
    expect(COMPOUND_MEANINGS[50].tone).toBe(COMPOUND_MEANINGS[32].tone);
    expect(COMPOUND_MEANINGS[51].name).toMatch(/Warrior/);
  });
  it('above 52: the series rule (subtract 9 until ≤ 52), labelled as such', () => {
    expect(compoundReading(53)).toMatchObject({ lookup: 44, basis: 'series' });
    expect(compoundReading(61)).toMatchObject({ lookup: 52, basis: 'series' });
    expect(compoundReading(98)).toMatchObject({ lookup: 44, basis: 'series' }); // astronumero.org example: 98 → 44
    // the root never changes under the rule
    for (let t = 53; t <= 300; t++) {
      const r = compoundReading(t)!;
      expect(r.lookup).toBeLessThanOrEqual(52);
      expect(r.lookup).toBeGreaterThan(43);
      expect(((r.lookup - 1) % 9) + 1).toBe(((t - 1) % 9) + 1);
    }
    expect(compoundMeaning(999)).toBeNull(); // Cheiro lists nothing for 999 itself
  });
  it('totals of 100+ no longer collapse: the compound stays the real total', () => {
    const long = 'Venkata Satya Narayana Murthy Subrahmanyam'; // a long name, total > 100
    const r = chaldeanName(long);
    expect(r.total).toBeGreaterThan(99);
    expect(r.compound).toBe(r.total);
    const reading = compoundReading(r.total)!;
    expect(reading.basis).toBe('series');
    expect(((reading.lookup - 1) % 9) + 1).toBe(r.root);
    expect(analyseNameCorrection(long).compoundReading?.lookup).toBe(reading.lookup);
    expect(analyseBusinessName(long).compoundReading?.lookup).toBe(reading.lookup);
  });
});

describe('one Western name number: /name-numerology and /name-correction agree', () => {
  it.each(['Shah Rukh Khan', 'Priya Sharma', 'John Smith', 'Mary Lynn', 'Narendra Damodardas Modi', 'Kaye Murray', 'Aishwarya Rai'])('%s', (name) => {
    const fromNamePage = calculateAllNameNumbers(name).expression;
    const shared = pythagoreanName(name);
    expect(fromNamePage).toBe(shared.number);
    expect(analyseNameCorrection(name).pythagorean.number).toBe(fromNamePage);
  });
  it('a master Expression number is kept as a labelled master in both places', () => {
    // find a name whose Pythagorean total reduces through 11
    const name = 'Ab Ii'; // a1 b2 i9 i9 = 21 → 3 (control)
    expect(pythagoreanName(name).master).toBeNull();
    const m = pythagoreanName('Bi'); // b2 + i9 = 11
    expect(m.total).toBe(11);
    expect(m.master).toBe(11);
    expect(m.root).toBe(2);
    expect(calculateAllNameNumbers('Bi').expression).toBe(11);
  });
});
