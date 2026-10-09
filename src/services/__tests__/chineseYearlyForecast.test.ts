import { describe, it, expect } from 'vitest';
import {
  getRelationship,
  getYearForecast,
  getYearElement,
  currentAndNextYear,
} from '@/services/chineseYearlyForecast';

describe('P4-CZ-YEARLY forecast engine', () => {
  it('TC-CZY-01: year animal & element are correct (2026 = Fire Horse)', () => {
    const f = getYearForecast('Horse', 2026);
    expect(f.yearAnimal).toBe('Horse');
    expect(f.yearElement).toBe('Fire');
    // Horse in the Horse year = own zodiac year
    expect(f.relationship).toBe('own-year');
  });

  it('TC-CZY-02: clash is the opposite sign (Rat vs Horse year)', () => {
    expect(getRelationship('Rat', 2026)).toBe('clash'); // 2026 = Horse
  });

  it('TC-CZY-03: allies are the San He trine (Tiger & Dog with Horse year)', () => {
    expect(getRelationship('Tiger', 2026)).toBe('allies');
    expect(getRelationship('Dog', 2026)).toBe('allies');
  });

  it('TC-CZY-04: secret friend (Goat with Horse year = Liu He)', () => {
    expect(getRelationship('Goat', 2026)).toBe('secret-friend');
  });

  it('TC-CZY-05: every area has a valid grade and non-empty text', () => {
    const f = getYearForecast('Dragon', 2027);
    for (const area of [f.career, f.finance, f.love, f.health]) {
      expect(['strong', 'moderate', 'mild']).toContain(area.grade);
      expect(area.text.length).toBeGreaterThan(20);
    }
    expect(f.overall).toContain('2027');
    expect(f.advice.length).toBeGreaterThan(10);
  });

  it('TC-CZY-06: forecasts differ by relationship (allies stronger career than clash)', () => {
    const allies = getYearForecast('Tiger', 2026); // allies
    const clash = getYearForecast('Rat', 2026); // clash
    expect(allies.career.grade).toBe('strong');
    expect(clash.finance.grade).toBe('mild');
    expect(allies.overall).not.toBe(clash.overall);
  });

  it('TC-CZY-07: no fear-based or dated language (Rule 7/8)', () => {
    for (const animal of ['Rat', 'Ox', 'Tiger', 'Snake']) {
      const f = getYearForecast(animal, 2026);
      const all = [f.overall, f.career.text, f.finance.text, f.love.text, f.health.text, f.advice].join(' ');
      expect(/\bwill die\b|disease|guaranteed|on (January|February|March)/i.test(all)).toBe(false);
    }
  });

  it('TC-CZY-08: element cycles correctly', () => {
    expect(getYearElement(2024)).toBe('Wood');
    expect(getYearElement(2026)).toBe('Fire');
    expect(getYearElement(2028)).toBe('Earth');
    const [a, b] = currentAndNextYear(new Date(2026, 5, 1));
    expect([a, b]).toEqual([2026, 2027]);
  });
});
