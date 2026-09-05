import { describe, it, expect } from 'vitest';
import { nameToSlug, uniqueSlug, BLOCKED_IDS } from '../add-celebrity-slugs';

describe('Slug Migration Validation — TC-SLUG', () => {
  it('TC-SLUG-P-01: Virat Kohli slug = "virat-kohli" (exact)', () => {
    expect(nameToSlug('Virat Kohli')).toBe('virat-kohli');
  });
  it('TC-SLUG-P-02: A.R. Rahman → "ar-rahman" (dots removed)', () => {
    expect(nameToSlug('A.R. Rahman')).toBe('ar-rahman');
  });
  it('TC-SLUG-P-03: Shah Rukh Khan → "shah-rukh-khan"', () => {
    expect(nameToSlug('Shah Rukh Khan')).toBe('shah-rukh-khan');
  });
  it('TC-SLUG-N-01: blocklist contains Hitler ID 3503 and Stalin 3522', () => {
    expect(BLOCKED_IDS.has(3503)).toBe(true);
    expect(BLOCKED_IDS.has(3522)).toBe(true);
    expect(BLOCKED_IDS.has(3567)).toBe(true);
    expect(BLOCKED_IDS.has(3690)).toBe(true);
  });
  it('TC-SLUG-EDGE-01: Y.S. Jagan Mohan Reddy → URL-safe, no dots', () => {
    const slug = nameToSlug('Y.S. Jagan Mohan Reddy');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug).not.toContain('.');
  });
  it('TC-SLUG-EDGE-02: apostrophe in name → removed from slug', () => {
    const slug = nameToSlug("O'Brien");
    expect(slug).not.toContain("'");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-EDGE-03: non-ASCII Éder → ASCII slug', () => {
    const slug = nameToSlug('Éder');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-EDGE-04: duplicate names get unique slugs', () => {
    const used = new Set<string>();
    const s1 = uniqueSlug('Mammootty', 1951, used); used.add(s1);
    const s2 = uniqueSlug('Mammootty', 1980, used); used.add(s2);
    expect(s1).toBe('mammootty');
    expect(s2).not.toBe(s1);
    expect(new Set([s1, s2]).size).toBe(2);
  });
});
