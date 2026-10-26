/**
 * Batch 8 — keeps /accuracy truthful. Every number the page shows (src/lib/accuracy/evidence.ts)
 * is re-derived here from the reference fixtures and the reference test files, so a change
 * to the engine, the fixtures or the data that would make the page wrong fails this test.
 *
 * References (see evidence.ts for full provenance):
 *  - Swiss Ephemeris values: src/lib/vedic/__tests__/golden/goldenCharts.json (pyswisseph 2.10.03)
 *  - AstroSage values (17 Oct 2026): the same fixture's couples[].astrosageTotal and
 *    manglik.astrosageLevel
 *  - Drik Panchang / NASA values: the tables inside panchangDrik.test.ts, ayanamsaDrik.test.ts
 *    and festivals.test.ts (counted here; the comparisons themselves run in those files)
 *  - Shodashvarga: golden/shodashvargaSwiss.json
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GET as kundaliGET } from '../../../../api/kundali';
import { GOLDEN, birthQuery } from '../../../../scripts/golden/compareGolden';
import { computeEclipses, computeFestivalCalendar } from '../../vedic/festivals';
import varga from '../../vedic/__tests__/golden/shodashvargaSwiss.json';
import celebrities from '../../../data/celebrities.json';
import { COUNTS, EVIDENCE, ACCURACY_FAQ } from '../evidence';

const TESTS = resolve(__dirname, '../../vedic/__tests__');
const src = (f: string) => readFileSync(resolve(TESTS, f), 'utf8');
const arcsec = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) * 3600;

beforeAll(() => {
  // Never touch the production chart cache from a test run.
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
});
afterAll(() => { vi.unstubAllEnvs(); });

describe('/accuracy Kundali numbers vs Swiss Ephemeris (live /api/kundali code)', () => {
  const births = [...GOLDEN.charts, ...GOLDEN.coupleBirths];

  it('uses the stated number of births', () => {
    expect(GOLDEN.charts.length).toBe(COUNTS.goldenBirths);
    expect(births.length).toBe(COUNTS.kundaliBirths);
  });

  it(`every Lagna and planet position is within 1 arc-minute (largest ≤ ${COUNTS.kundaliMaxArcsec}″), with the same Nakshatra + pada`, async () => {
    let positions = 0; let worst = 0;
    for (const g of births) {
      const k = await (await kundaliGET(new Request(`http://localhost/api/kundali?${new URLSearchParams(birthQuery(g))}`))).json();
      const asc = arcsec(k.lagna.degrees, g.swiss.ascendant);
      positions++; worst = Math.max(worst, asc);
      expect(asc, `${g.id} Lagna`).toBeLessThan(60);
      for (const [name, ref] of Object.entries(g.swiss.longitudes)) {
        const p = k.planets.find((x: { name: string }) => x.name === name);
        const d = arcsec(p.longitude, ref as number);
        positions++; worst = Math.max(worst, d);
        expect(d, `${g.id} ${name}`).toBeLessThan(60);
      }
      expect([k.nakshatra.nakshatra, k.nakshatra.pada], `${g.id} nakshatra`).toEqual([g.expected.nakshatra, g.expected.pada]);
    }
    expect(positions).toBe(COUNTS.kundaliPositions);
    expect(Math.round(worst)).toBeLessThanOrEqual(COUNTS.kundaliMaxArcsec);
  }, 120_000);
});

describe('/accuracy AstroSage numbers', () => {
  it('7 couples and 10 Manglik levels were recorded from AstroSage', () => {
    expect(GOLDEN.couples.filter(c => typeof c.astrosageTotal === 'number').length).toBe(COUNTS.couples);
    const levels = [...GOLDEN.charts, ...GOLDEN.coupleBirths].filter(c => (c.expected.manglik as { astrosageLevel?: string }).astrosageLevel);
    expect(levels.length).toBe(COUNTS.manglikCharts);
  });
});

describe('/accuracy Drik Panchang / NASA counts match the reference tables', () => {
  it('Panchang: 19 city-days in 5 cities, 16 with Tithi + Nakshatra names (32 names)', () => {
    const s = src('panchangDrik.test.ts');
    const rows = s.match(/\{ city: '(\w+)', date: '\d{4}-\d\d-\d\d'/g) ?? [];
    expect(rows.length).toBe(COUNTS.panchangCityDays);
    expect(new Set(rows.map(r => r.split("'")[1])).size).toBe(COUNTS.panchangCities);
    expect((s.match(/tithi: \['/g) ?? []).length * 2).toBe(COUNTS.panchangNames);
  });

  it('ingress moments: 19 Drik events', () => {
    const s = src('ayanamsaDrik.test.ts');
    const block = s.slice(s.indexOf('const DRIK_EVENTS'), s.indexOf('];', s.indexOf('const DRIK_EVENTS')));
    expect((block.match(/^\s+\['(Sun|Rahu|Jupiter|Saturn)'/gm) ?? []).length).toBe(COUNTS.ingressEvents);
  });

  it('festivals: 33 named festivals in 2026 and in 2027; Ekadashi counts', () => {
    const s = src('festivals.test.ts');
    const drik = s.slice(s.indexOf('const DRIK: '));
    const year = (y: number) => {
      const start = drik.indexOf(`\n  ${y}: {`);
      const body = drik.slice(start, drik.indexOf('\n  },', start));
      return (body.match(/'[^']+': '\d{4}-\d\d-\d\d'/g) ?? []).length;
    };
    expect(year(2026)).toBe(COUNTS.festivals2026);
    expect(year(2027)).toBe(COUNTS.festivals2027);
    const ek = (y: number) => computeFestivalCalendar(y).festivals.filter(f => f.type === 'ekadashi').length;
    expect(ek(2026)).toBe(COUNTS.ekadashi2026);
    expect(ek(2027)).toBe(COUNTS.ekadashi2027);
  }, 60_000);

  it('eclipses 2026–2030: 24', () => {
    expect([2026, 2027, 2028, 2029, 2030].flatMap(computeEclipses).length).toBe(COUNTS.eclipses);
  }, 60_000);
});

describe('/accuracy divisional charts and Moon-sign counts', () => {
  it('16 vargas × 10 points on 5 charts; 772 compared, 28 boundary points skipped (as in shodashvarga.test.ts)', () => {
    type R = { vargas: Record<string, Record<string, { marginDeg: number }>> };
    const recs = varga as R[];
    expect(recs.length).toBe(COUNTS.vargaCharts);
    const all = recs.flatMap(r => Object.values(r.vargas).flatMap(v => Object.values(v)));
    expect(Object.keys(recs[0].vargas).length).toBe(COUNTS.vargas);
    expect(all.filter(x => x.marginDeg >= 0.01).length).toBe(COUNTS.vargaPlacements);
    expect(all.filter(x => x.marginDeg < 0.01).length).toBe(COUNTS.vargaSkipped);
  });

  it('the dated celebrity Moon-sign count is not larger than the data set', () => {
    // The page states a DATED result (26 Oct 2026: 3,044 people = every celebrity with a full
    // birth date then). The nightly data refresh may add people later; that keeps the dated
    // claim true, so this only guards against the page claiming MORE than exist. When you
    // re-run the Swiss Ephemeris check (evidence.ts, DATE-ONLY MOON SIGN), update the count
    // and the date together.
    const list = (celebrities as { celebrities: Array<{ birth_date?: string }> }).celebrities;
    expect(COUNTS.celebrities).toBeLessThanOrEqual(list.filter(c => /^\d{4}-\d{2}-\d{2}$/.test(c.birth_date || '')).length);
  });
});

describe('/accuracy wording guardrails (ASCI)', () => {
  const text = JSON.stringify({ EVIDENCE, ACCURACY_FAQ });
  it('no absolute or comparative claims', () => {
    expect(text).not.toMatch(/100\s*%|most accurate|more accurate|better than|best\b|guarantee|perfect/i);
  });
  it('no claim that another site is wrong', () => {
    expect(text).not.toMatch(/(AstroSage|Drik)[^."]*\b(wrong|error|mistake|incorrect|inaccurate)/i);
  });
  it('every row carries a date', () => {
    for (const r of EVIDENCE) expect(r.date, r.id).toMatch(/2026/);
  });
});
