/**
 * Audit N1 / N3 / N8 — ONE Life Path method sitewide, and famous lists generated from it.
 *
 * Founder decision (23 Oct 2026): reduce day, month and year SEPARATELY (keeping
 * 11/22/33 at each step), add, reduce again keeping 11/22/33.
 *
 * Reference values — public calculators / guides, fetched 23 Oct 2026 (WebFetch):
 *  [NC]  numerology.com, "Life Path Number" article
 *        https://www.numerology.com/articles/your-numerology-chart/life-path-number/
 *        method: "reduce each of the three parts of your birthday to a single digit or
 *        Master Number" — "you can't simply add up the whole string"; worked example
 *        10-22-1980 → 1 + 22 + 9 = 32 → 5.
 *  [101] 101planners.com Life Path calculator
 *        https://www.101planners.com/numerology/life-path-number-calculator/
 *        same method (11/22 kept at the component step); worked example
 *        28 Dec 1965 → 1 + 3 + 3 = 7.
 *  [DN]  datenumerology.onrender.com Life Path calculator
 *        https://datenumerology.onrender.com/life-path-number-calculator
 *        worked examples: 22 Jul 1990 → 3; 6 May 1984 → year 1984 = 22 kept → 5 + 6 + 22 = 33.
 *  [MW]  miniwebtool.com Life Path calculator
 *        https://miniwebtool.com/life-path-number-calculator/
 *        worked example 15 May 1990: year 1990 → 19 → 10 → 1, day 15 → 6, 1 + 5 + 6 = 12 → 3.
 *  15 Aug 1990 is not a published worked example on any of these pages; by the
 *  component reductions [MW] shows for 1990 (→ 1) and day 15 (→ 6), and the method
 *  of [NC]/[101]/[DN], it is 6 + 8 + 1 = 15 → 6 (the old /numerology page said 33).
 */
import { describe, it, expect } from 'vitest';
import { lifePathNumber, lifePathWorking, lifePathFromIso, lifePathFromDate } from '@/lib/lifePath';
import { calculateLifePathNumber } from '@/utils/celebrityCalculations';
import { lifePathFromDob } from '@/lib/numerologyTools';
import { lifePath as homepageLifePath } from '@/utils/homepageDecode';
import { NUMEROLOGY_DATA } from '@/data/numerologyData';
import { famousForLifePath, FAMOUS_PEOPLE } from '@/data/famousLifePaths';
import { NAME_NUMBER_MEANINGS, calculateAllNameNumbers } from '@/data/nameNumerologyData';

describe('Life Path — reference values from public calculators', () => {
  const cases: Array<[string, number, number, number, number]> = [
    ['[NC] 22 Oct 1980', 22, 10, 1980, 5],
    ['[101] 28 Dec 1965', 28, 12, 1965, 7],
    ['[DN] 22 Jul 1990', 22, 7, 1990, 3],
    ['[DN] 6 May 1984 (master 22 in the year → 33)', 6, 5, 1984, 33],
    ['[MW] 15 May 1990', 15, 5, 1990, 3],
    ['[NC]/[MW] method: 15 Aug 1990', 15, 8, 1990, 6],
  ];
  for (const [label, d, m, y, want] of cases) {
    it(`${label} → ${want}`, () => {
      expect(lifePathNumber(d, m, y)).toBe(want);
    });
  }

  it('keeps master numbers at the component step (Nov = 11, day 29 → 11)', () => {
    const w = lifePathWorking(29, 11, 1990);
    expect(w.dayReduced).toBe(11);
    expect(w.monthReduced).toBe(11);
    expect(w.yearReduced).toBe(1);
    expect(w.number).toBe(5); // 11 + 11 + 1 = 23 → 5
  });

  it('master-number results: 11 / 22 / 33', () => {
    expect(lifePathNumber(4, 8, 1961)).toBe(2);   // 4 + 8 + 8 = 20 → 2 (Obama; full-string gives 11)
    expect(lifePathNumber(2, 1, 1979)).toBe(11);  // 2 + 1 + 8 = 11
    expect(lifePathNumber(4, 9, 1989)).toBe(22);  // 4 + 9 + 9 = 22
    expect(lifePathNumber(11, 11, 2009)).toBe(33); // 11 + 11 + 11 = 33
  });

  it('shows its working', () => {
    expect(lifePathWorking(15, 8, 1990).steps).toBe('Day 15 → 6 · Month 8 · Year 1990 → 19 → 10 → 1 · 6 + 8 + 1 = 15 → 6');
  });

  it('ISO / Date helpers agree', () => {
    expect(lifePathFromIso('1990-08-15')).toBe(6);
    expect(lifePathFromDate(new Date(1990, 7, 15, 12))).toBe(6);
  });
});

describe('Life Path — every implementation on the site agrees (1900–2025, every day)', () => {
  it('celebrityCalculations, numerologyTools and the homepage decode all equal the shared function', () => {
    let checked = 0;
    for (let t = Date.UTC(1900, 0, 1); t <= Date.UTC(2025, 11, 31); t += 86_400_000) {
      const dt = new Date(t);
      const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
      const want = lifePathNumber(d, m, y);
      if (calculateLifePathNumber(d, m, y) !== want || lifePathFromDob(y, m, d) !== want || homepageLifePath(d, m, y) !== want) {
        throw new Error(`disagreement on ${y}-${m}-${d}`);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(45_000);
  });
});

describe('Famous Life Path lists are generated from the shared function (audit N3)', () => {
  it('every person shown under /numerology/:n computes to n, and nobody appears under two numbers', () => {
    const seen = new Map<string, number>();
    for (const entry of NUMEROLOGY_DATA) {
      for (const p of entry.famousPeople) {
        expect(p.result).toBe(entry.number);
        const iso = FAMOUS_PEOPLE.find(f => f.name === p.name)!.dob;
        expect(lifePathFromIso(iso)).toBe(entry.number);
        expect(seen.has(p.name)).toBe(false);
        seen.set(p.name, entry.number);
      }
    }
  });
  it('audit examples: Obama is 2 (not 2 AND 11); Gates is 4 (not 22)', () => {
    expect(famousForLifePath(2).map(e => e.name)).toContain('Barack Obama');
    expect(famousForLifePath(11).map(e => e.name)).not.toContain('Barack Obama');
    expect(famousForLifePath(4).map(e => e.name)).toContain('Bill Gates');
    expect(famousForLifePath(22).map(e => e.name)).not.toContain('Bill Gates');
  });
});

describe('Name-numerology famous lists compute (audit N8)', () => {
  it('every famous name computes to the Expression number it is listed under, and appears once', () => {
    const seen = new Set<string>();
    for (const [num, meaning] of Object.entries(NAME_NUMBER_MEANINGS)) {
      for (const n of meaning.famousNames) {
        expect(calculateAllNameNumbers(n).expression).toBe(Number(num));
        expect(seen.has(n)).toBe(false);
        seen.add(n);
      }
    }
    // audit example: "Elon Musk" computes 11 (was listed under 1 and 22)
    expect(NAME_NUMBER_MEANINGS[11].famousNames).toContain('Elon Musk');
  });
});
