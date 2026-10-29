// Batch 10: the new pages' prerender titles equal the titles the pages set themselves
// (static titles on the three daily pages — the Worker swaps in the dated one), every new
// route is prerendered, and the duplicate-intent pages keep distinct titles.
import { describe, it, expect } from 'vitest';
import { PANCHANG_CALENDAR_STATIC } from '../../daily/kinds/panchangMonthTemplate';
import { PLANETS_TODAY_STATIC, MOON_PHASE_STATIC } from '../../daily/kinds/skyTemplate';
import { eclipsesMeta } from '../../vedic/eclipses';

const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');
const routes: string[] = await getAllRoutes();

describe('Batch 10 pages: prerender titles = live titles', () => {
  const cases: Array<[string, { title: string; description: string }]> = [
    ['/panchang-calendar', PANCHANG_CALENDAR_STATIC],
    ['/planets-today', PLANETS_TODAY_STATIC],
    ['/moon-phase', MOON_PHASE_STATIC],
    ['/eclipses', eclipsesMeta()],
    ...[2026, 2027, 2028, 2029, 2030].map(y => [`/eclipses/${y}`, eclipsesMeta(y)] as [string, { title: string; description: string }]),
  ];
  for (const [route, meta] of cases) {
    it(route, () => {
      expect(routes).toContain(route);
      const t = getTitleForRoute(route) as { title: string; description: string };
      expect(t.title).toBe(meta.title);
      expect(t.description).toBe(meta.description);
      expect(t.title.length).toBeLessThanOrEqual(70);
    });
  }
  it('no /eclipses year outside 2026–2030 is listed', () => {
    expect(routes.filter(r => r.startsWith('/eclipses/'))).toEqual(['/eclipses/2026', '/eclipses/2027', '/eclipses/2028', '/eclipses/2029', '/eclipses/2030']);
  });
});
