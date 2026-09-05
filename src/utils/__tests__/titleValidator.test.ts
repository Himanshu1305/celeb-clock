import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const titlesContent = readFileSync('scripts/prerender-titles.mjs', 'utf8');

// Robust matcher: handles single, double, and backtick-quoted title values,
// including internal apostrophes and ${...} template expressions.
const titleValues = [...titlesContent.matchAll(/title:\s*(['"`])((?:\\.|(?!\1).)*)\1/g)]
  .map(m => m[2])
  // Expand template placeholders to their longest realistic expansion so the
  // char-count assertion reflects the worst case that ships to users.
  .map(t => t
    .replace(/\$\{monthName\}/g, 'September')
    .replace(/\$\{[^}]+\}/g, 'September'));

describe('Page Title Validation — TC-TITLE', () => {
  it('TC-TITLE-P-01: all titles ≤ 70 chars', () => {
    const long = titleValues.filter(t => t.length > 70);
    if (long.length > 0) {
      console.log('Too long:', long.map(t => `${t.length}c: ${t.slice(0, 60)}`));
    }
    expect(long.length, `${long.length} titles exceed 70 chars`).toBe(0);
  });
  it('TC-TITLE-P-02: no empty titles', () => {
    const empty = titleValues.filter(t => !t.trim());
    expect(empty.length).toBe(0);
  });
  it('TC-TITLE-P-03: all titles contain BornClock', () => {
    const noBrand = titleValues.filter(t => !t.includes('BornClock'));
    expect(noBrand.length, `Missing brand: ${noBrand.join(' | ')}`).toBe(0);
  });
  it('TC-TITLE-N-01: no title is just "BornClock"', () => {
    const justBrand = titleValues.filter(t => t.trim() === 'BornClock');
    expect(justBrand).toHaveLength(0);
  });
  it('TC-TITLE-EDGE-01: born-on titles ≤ 70', () => {
    const bornOnTitles = titleValues.filter(t => t.toLowerCase().includes('born on'));
    bornOnTitles.forEach(t => expect(t.length, t).toBeLessThanOrEqual(70));
  });
});
