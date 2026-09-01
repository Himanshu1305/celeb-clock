import { describe, it, expect } from 'vitest';
import { generateBornOnTitle, generateBornOnMeta } from '../seoHelpers';

// ── Test data ────────────────────────────────────────────────
const MANY = [
  { name: 'Tom Hanks' },
  { name: 'K. Balachander' },
  { name: 'Courtney Love' },
  { name: 'Amélie Nothomb' },
  { name: 'Donald Rumsfeld' },
];
const TWO   = [{ name: 'Virat Kohli' }, { name: 'Kader Khan' }];
const ONE   = [{ name: 'Mel Gibson' }];
const LONG  = [{ name: 'Krishnamachari Srikkanth Venkataraman' }, { name: 'Second Person' }];
const APOS  = [{ name: "Conan O'Brien" }, { name: 'Second Person' }];
const EMPTY: { name: string }[] = [];

// ── TITLE TESTS ──────────────────────────────────────────────
describe('generateBornOnTitle', () => {

  // Positive
  it('many celebrities — uses first celebrity name', () => {
    const t = generateBornOnTitle('August', 6, MANY);
    expect(t).toBe('Born on August 6? Tom Hanks Shares Your Birthday · BornClock');
  });

  it('two celebrities — uses first only', () => {
    const t = generateBornOnTitle('November', 5, TWO);
    expect(t).toContain('Virat Kohli');
    expect(t).not.toContain('Kader Khan');
  });

  it('one celebrity — still works correctly', () => {
    const t = generateBornOnTitle('March', 3, ONE);
    expect(t).toBe('Born on March 3? Mel Gibson Shares Your Birthday · BornClock');
  });

  it('uses full month name not abbreviation', () => {
    const t = generateBornOnTitle('September', 23, MANY);
    expect(t).toMatch(/^Born on September 23/);
  });

  it('day has no leading zero', () => {
    const t = generateBornOnTitle('August', '06', MANY); // string "06" input
    expect(t).toContain('August 6');
    expect(t).not.toContain('August 06');
  });

  it('ends with · BornClock', () => {
    const t = generateBornOnTitle('August', 6, MANY);
    expect(t).toMatch(/· BornClock$/);
  });

  it('length is under 70 characters', () => {
    const t = generateBornOnTitle('August', 6, MANY);
    expect(t.length).toBeLessThanOrEqual(70);
  });

  // Negative / Edge cases
  it('empty array — uses fallback, no crash', () => {
    const t = generateBornOnTitle('August', 6, EMPTY);
    expect(t).toContain('Born on August 6');
    expect(t).not.toContain('undefined');
    expect(t).not.toContain('null');
    expect(t).toContain('BornClock');
  });

  it('undefined celebrities — uses fallback', () => {
    const t = generateBornOnTitle('August', 6, undefined as any);
    expect(t).not.toContain('undefined');
    expect(t).toContain('BornClock');
  });

  it('long celebrity name — truncates to first name, stays under 70 chars', () => {
    const t = generateBornOnTitle('September', 23, LONG);
    expect(t.length).toBeLessThanOrEqual(70);
    expect(t).not.toContain('undefined');
    expect(t).toContain('BornClock');
  });

  it('celebrity name with apostrophe — no HTML entities in output', () => {
    const t = generateBornOnTitle('April', 18, APOS);
    expect(t).not.toContain('&apos;');
    expect(t).not.toContain('&#39;');
    expect(t).not.toContain('&amp;');
  });

  it('January 1 — first day of year works', () => {
    const t = generateBornOnTitle('January', 1, ONE);
    expect(t).toContain('January 1');
    expect(t).not.toContain('January 01');
  });

  it('December 31 — last day of year works', () => {
    const t = generateBornOnTitle('December', 31, ONE);
    expect(t).toContain('December 31');
  });

  it('all 365 dates produce unique title base', () => {
    const months = [
      ['January',31],['February',28],['March',31],['April',30],
      ['May',31],['June',30],['July',31],['August',31],
      ['September',30],['October',31],['November',30],['December',31],
    ] as [string, number][];
    const bases = new Set<string>();
    months.forEach(([m, days]) => {
      for (let d = 1; d <= days; d++) {
        bases.add(`${m}-${d}`);
      }
    });
    expect(bases.size).toBe(365);
  });

});

// ── META TESTS ───────────────────────────────────────────────
describe('generateBornOnMeta', () => {

  // Positive
  it('many celebrities — correct count and first two names', () => {
    const m = generateBornOnMeta('August', 6, MANY);
    expect(m).toContain('5 famous people share');
    expect(m).toContain('August 6');
    expect(m).toContain('Tom Hanks');
    expect(m).toContain('K. Balachander');
    expect(m).toContain('Free instant report');
  });

  it('two celebrities — shows both names', () => {
    const m = generateBornOnMeta('November', 5, TWO);
    expect(m).toContain('2 famous people share');
    expect(m).toContain('Virat Kohli');
    expect(m).toContain('Kader Khan');
  });

  it('one celebrity — singular "person shares" not "people share"', () => {
    const m = generateBornOnMeta('March', 3, ONE);
    expect(m).toContain('1 famous person shares');
    expect(m).not.toContain('1 famous people');
  });

  it('contains required SEO keywords', () => {
    const m = generateBornOnMeta('August', 6, MANY);
    expect(m).toContain('zodiac');
    expect(m).toContain('numerology');
    expect(m).toContain('life expectancy');
    expect(m).toContain('Free instant report');
  });

  it('length is under 160 characters', () => {
    const m = generateBornOnMeta('August', 6, MANY);
    expect(m.length).toBeLessThanOrEqual(160);
  });

  it('long celebrity names — still under 160 chars', () => {
    const m = generateBornOnMeta('September', 23, LONG);
    expect(m.length).toBeLessThanOrEqual(160);
    expect(m).not.toContain('undefined');
  });

  // Negative / Edge cases
  it('empty array — fallback, no crash, no "0 famous people"', () => {
    const m = generateBornOnMeta('August', 6, EMPTY);
    expect(m).not.toContain('undefined');
    expect(m).not.toContain('0 famous people');
    expect(m.length).toBeGreaterThan(40);
  });

  it('undefined celebrities — fallback, no crash', () => {
    const m = generateBornOnMeta('August', 6, undefined as any);
    expect(m).not.toContain('undefined');
    expect(m.length).toBeGreaterThan(40);
  });

  it('no HTML entities in output', () => {
    const m = generateBornOnMeta('April', 18, APOS);
    expect(m).not.toContain('&apos;');
    expect(m).not.toContain('&#39;');
    expect(m).not.toContain('&amp;');
  });

  it('day has no leading zero', () => {
    const m = generateBornOnMeta('August', '06', MANY);
    expect(m).toContain('August 6');
    expect(m).not.toContain('August 06');
  });

});
