/**
 * GOLDEN CHARTS — the accuracy safeguard that runs before every production deploy.
 *
 * Runs BornClock's own API handlers (/api/kundali, /api/sade-sati, /api/kundali-match — the same
 * code the live site serves) on 20 births + the 7 AstroSage couples and compares every answer
 * with the stored reference in ./golden/goldenCharts.json.
 *
 * Where the reference values come from (full details in the fixture's "sources" block):
 *  - Planet / Lagna / Moon signs, nakshatra + pada, D9, Dasha, Manglik, Kaal Sarp, Sade Sati:
 *    Swiss Ephemeris (pyswisseph 2.10.03, Lahiri mean + 24.4″ — the Drik calibration in
 *    ayanamsaDrik.test.ts), with the published rules applied in scripts/golden/generate_golden.py.
 *    Never computed with BornClock code.
 *  - Guna Milan totals and Manglik levels: entered by hand on astrosage.com, 17 Oct 2026 (Round 2 audit).
 *  - Panchang / festival dates vs Drik Panchang: the suites listed in goldenCharts.json
 *    "panchangReferences" (they run in the same `npx vitest run`).
 *
 * A failure reads like: "P3 Moon nakshatra changed: expected Purva Phalguni 2, got Magha 4".
 * If a change is intentional (a convention the founder changed), regenerate the fixture with the
 * generator and explain why in the commit — never edit expected values by hand.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { GET as kundaliGET } from '../../../../api/kundali';
import { GET as sadeSatiGET } from '../../../../api/sade-sati';
import { GET as matchGET } from '../../../../api/kundali-match';
import {
  GOLDEN, REF_DATE, compareKundali, compareSadeSati, compareMatch, birthQuery, matchQuery, expectedSadeSati,
  splitKnown, KNOWN_ISSUES,
} from '../../../../scripts/golden/compareGolden';

const call = async (handler: (r: Request, env?: unknown) => Promise<Response>, path: string, q: Record<string, string>) =>
  (await handler(new Request(`http://localhost${path}?${new URLSearchParams(q)}`))).json();

beforeAll(() => {
  // Pin "now" so current Dasha / Sade Sati are compared at the fixture's reference date.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(REF_DATE);
  // Never read or write the production chart cache from a test run.
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
});
afterAll(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('golden fixture is self-consistent', () => {
  it('has the 20 charts and 7 couples the safeguard promises', () => {
    expect(GOLDEN.charts).toHaveLength(20);
    expect(GOLDEN.couples).toHaveLength(7);
  });
  it('every expected field names its source', () => {
    for (const c of GOLDEN.charts) {
      for (const k of Object.keys(c.expected)) expect(c.refs, `${c.id}.${k}`).toHaveProperty(k);
      for (const src of Object.values(c.refs)) for (const s of String(src).split('+')) expect(GOLDEN.sources, `${c.id} source ${s}`).toHaveProperty(s);
    }
  });
  it('AstroSage Manglik levels agree with the stated rule applied to Swiss positions', () => {
    expect(GOLDEN.astrosageManglikDisagreesWithRule).toEqual([]);
  });
  it('the Sade Sati status at the reference date agrees with the stored cycles', () => {
    for (const c of GOLDEN.charts) {
      expect(expectedSadeSati(c.expected.moonSign, REF_DATE).active, c.id).toBe(c.expected.sadeSatiAtRef.active);
    }
  });
});

const knownSeen = new Set<string>();
describe('golden charts: /api/kundali matches the reference', () => {
  for (const g of GOLDEN.charts) {
    it(`${g.id} ${g.label} — ${g.birth.place} ${g.birth.local} (${g.birth.tz})`, async () => {
      const k = await call(kundaliGET, '/api/kundali', birthQuery(g));
      const { drift, known } = splitKnown(compareKundali(g, k, REF_DATE));
      known.forEach(d => knownSeen.add(`${d.id}:${d.field}`));
      expect(drift.map(d => d.message), `${g.id}: ${drift.length} difference(s) from the reference`).toEqual([]);
    }, 30_000);
  }
  it('every KNOWN_ISSUES entry still reproduces (remove an entry once the engine is fixed)', () => {
    const fixed = KNOWN_ISSUES.filter(k => !knownSeen.has(`${k.id}:${k.field}`)).map(k => `${k.id} ${k.field} now matches the reference — delete it from KNOWN_ISSUES in scripts/golden/compareGolden.ts`);
    expect(fixed).toEqual([]);
  });
});

describe('golden charts: /api/sade-sati matches the reference', () => {
  for (const g of GOLDEN.charts) {
    it(`${g.id} Sade Sati (${g.expected.moonSign} Moon)`, async () => {
      const s = await call(sadeSatiGET, '/api/sade-sati', birthQuery(g));
      const diffs = compareSadeSati(g, s, REF_DATE);
      expect(diffs.map(d => d.message), `${g.id}: ${diffs.length} difference(s) from the reference`).toEqual([]);
    }, 30_000);
  }
});

describe('golden couples: /api/kundali-match equals AstroSage', () => {
  for (const c of GOLDEN.couples) {
    it(`${c.boy} (boy) × ${c.girl} (girl) = ${c.astrosageTotal}`, async () => {
      const m = await call(matchGET, '/api/kundali-match', matchQuery(c));
      const diffs = compareMatch(c, m);
      expect(diffs.map(d => d.message)).toEqual([]);
    }, 30_000);
  }
});
