import { describe, it, expect } from 'vitest';
import { buildCTAHeading, buildDobParam } from '../seoHelpers';

// ── Test data ────────────────────────────────────────────────
const MANY = [
  { name: 'Chanakya' },
  { name: 'Satyendra Nath Bose' },
  { name: 'Vidya Balan' },
  { name: 'Amitabh Bachchan' },
];
const THREE     = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
const TWO       = [{ name: 'Virat Kohli' }, { name: 'Kader Khan' }];
const ONE       = [{ name: 'Mel Gibson' }];
const LONG_NAME = [{ name: 'Krishnamachari Srikkanth Venkataraman' }, { name: 'Second' }];
const APOS      = [{ name: "Conan O'Brien" }, { name: 'Second' }];
const ACCENT    = [{ name: 'Amélie Nothomb' }, { name: 'Second' }];
const EMPTY: { name: string }[] = [];

// ════════════════════════════════════════════════════════════
// buildCTAHeading — POSITIVE TESTS
// ════════════════════════════════════════════════════════════
describe('buildCTAHeading — Positive', () => {

  it('TC-H-01: many celebrities → "[First] and N others"', () => {
    const h = buildCTAHeading(MANY, 'January', 1);
    expect(h).toBe('You share a birthday with Chanakya and 3 others');
  });

  it('TC-H-02: exactly 3 celebrities → "[First] and 2 others"', () => {
    const h = buildCTAHeading(THREE, 'August', 6);
    expect(h).toBe('You share a birthday with A and 2 others');
  });

  it('TC-H-03: exactly 2 celebrities → "[First] and [Second]", no "others"', () => {
    const h = buildCTAHeading(TWO, 'November', 5);
    expect(h).toBe('You share a birthday with Virat Kohli and Kader Khan');
    expect(h).not.toContain('others');
  });

  it('TC-H-04: exactly 1 celebrity → "You share a birthday with [Name]"', () => {
    const h = buildCTAHeading(ONE, 'March', 3);
    expect(h).toBe('You share a birthday with Mel Gibson');
    expect(h).not.toContain('others');
    expect(h).not.toContain('and');
  });

  it('TC-H-05: "others" count is N-1, not N', () => {
    // 4 celebrities → "and 3 others" not "and 4 others"
    const h = buildCTAHeading(MANY, 'August', 6);
    expect(h).toContain('3 others');
    expect(h).not.toContain('4 others');
  });

  it('TC-H-06: day appears without leading zero (number 6, not 06)', () => {
    const h = buildCTAHeading(EMPTY, 'August', '06'); // string input
    expect(h).toContain('August 6');
    expect(h).not.toContain('August 06');
  });

  it('TC-H-07: long celebrity name — no truncation, full name in output', () => {
    const h = buildCTAHeading(LONG_NAME, 'January', 1);
    expect(h).toContain('Krishnamachari Srikkanth Venkataraman');
  });

  it('TC-H-08: celebrity name with apostrophe — clean output', () => {
    const h = buildCTAHeading(APOS, 'April', 18);
    expect(h).toContain("Conan O'Brien");
    expect(h).not.toContain('&apos;');
    expect(h).not.toContain('&#39;');
  });

  it('TC-H-09: celebrity name with accent character — clean output', () => {
    const h = buildCTAHeading(ACCENT, 'June', 12);
    expect(h).toContain('Amélie Nothomb');
  });

  it('TC-H-10: output never contains "undefined" or "null"', () => {
    [MANY, TWO, ONE, EMPTY].forEach(celeb => {
      const h = buildCTAHeading(celeb, 'August', 6);
      expect(h).not.toContain('undefined');
      expect(h).not.toContain('null');
    });
  });

});

// ════════════════════════════════════════════════════════════
// buildCTAHeading — NEGATIVE / EDGE CASES
// ════════════════════════════════════════════════════════════
describe('buildCTAHeading — Negative/Edge', () => {

  it('TC-H-11: empty array → fallback heading, no crash', () => {
    expect(() => buildCTAHeading(EMPTY, 'August', 6)).not.toThrow();
    const h = buildCTAHeading(EMPTY, 'August', 6);
    expect(h).toContain('August 6');
    expect(h.length).toBeGreaterThan(10);
  });

  it('TC-H-12: undefined celebrities → fallback, no crash', () => {
    expect(() => buildCTAHeading(undefined as any, 'August', 6)).not.toThrow();
    const h = buildCTAHeading(undefined as any, 'August', 6);
    expect(h).not.toContain('undefined');
  });

  it('TC-H-13: null celebrities → fallback, no crash', () => {
    expect(() => buildCTAHeading(null as any, 'August', 6)).not.toThrow();
    const h = buildCTAHeading(null as any, 'August', 6);
    expect(h).not.toContain('null');
  });

  it('TC-H-14: celebrity with empty name string → fallback, no crash', () => {
    const h = buildCTAHeading([{ name: '' }], 'August', 6);
    expect(h).not.toContain('undefined');
    expect(h.length).toBeGreaterThan(10);
  });

  it('TC-H-15: celebrity with whitespace name → trimmed, no crash', () => {
    const h = buildCTAHeading([{ name: '  Chanakya  ' }, { name: 'B' }], 'August', 6);
    expect(h).toContain('Chanakya');
    expect(h).not.toContain('  Chanakya  ');
  });

  it('TC-H-16: string day "06" → shows as 6 not 06 in fallback', () => {
    const h = buildCTAHeading(EMPTY, 'August', '06');
    expect(h).toContain('6');
    expect(h).not.toMatch(/August 06/);
  });

  it('TC-H-17: January 1 renders correctly (first day of year)', () => {
    // 1-celeb headings are name-only by design (see TC-H-04 / the CTA mockup), so
    // the edge-date check asserts the name renders cleanly — not a month substring,
    // which only appears in the 0-celeb fallback heading.
    const h = buildCTAHeading(ONE, 'January', 1);
    expect(h).toContain('Mel Gibson');
    expect(h).not.toContain('undefined');
  });

  it('TC-H-18: December 31 renders correctly (last day of year)', () => {
    const h = buildCTAHeading(ONE, 'December', 31);
    expect(h).toContain('Mel Gibson');
    expect(h).not.toContain('undefined');
  });

});

// ════════════════════════════════════════════════════════════
// buildDobParam — TESTS
// ════════════════════════════════════════════════════════════
describe('buildDobParam', () => {

  it('TC-D-01: August 6 → contains month 08 and day 06', () => {
    const d = buildDobParam('August', 6);
    expect(d).toContain('08');
    expect(d).toContain('06');
  });

  it('TC-D-02: January 1 → contains month 01 and day 01', () => {
    const d = buildDobParam('January', 1);
    expect(d).toContain('01');
  });

  it('TC-D-03: December 31 → contains month 12 and day 31', () => {
    const d = buildDobParam('December', 31);
    expect(d).toContain('12');
    expect(d).toContain('31');
  });

  it('TC-D-04: string input "6" produces same as number 6', () => {
    expect(buildDobParam('August', '6')).toBe(buildDobParam('August', 6));
  });

  it('TC-D-05: output never contains undefined, null, or NaN', () => {
    const months = ['January','February','March','September','December'];
    months.forEach(m => {
      const d = buildDobParam(m, 15);
      expect(d).not.toContain('undefined');
      expect(d).not.toContain('null');
      expect(d).not.toContain('NaN');
    });
  });

  it('TC-D-06: all 12 months produce valid non-empty output', () => {
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    months.forEach(m => {
      const d = buildDobParam(m, 15);
      expect(d.length).toBeGreaterThan(5);
      expect(d).not.toContain('undefined');
    });
  });

  it('TC-D-07: output is URL-safe (no spaces or reserved chars)', () => {
    const d = buildDobParam('August', 6);
    // Should not contain spaces or chars that need URL encoding
    expect(d).not.toContain(' ');
    expect(d).not.toContain('#');
    expect(d).not.toContain('?');
    expect(d).not.toContain('&');
  });

});
