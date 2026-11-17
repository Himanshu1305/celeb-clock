import { describe, it, expect } from 'vitest';
import { GUIDE_META } from '../guideMeta.js';
import { getTitleForRoute } from '../../../../scripts/prerender-titles.mjs';

describe('B14 guide meta', () => {
  for (const [route, m] of Object.entries(GUIDE_META)) {
    it(`${route}: title ≤ 60, description ≤ 155`, () => {
      expect(Array.from(m.title).length, m.title).toBeLessThanOrEqual(60);
      expect(Array.from(m.description).length, m.description).toBeLessThanOrEqual(155);
      expect(m.h1.length).toBeGreaterThan(0);
    });
    it(`${route}: prerendered title/description equal the live ones`, () => {
      const t = getTitleForRoute(route);
      expect(t?.title).toBe(m.title);
      expect(t?.description).toBe(m.description);
    });
  }
});
