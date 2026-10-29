/**
 * Batch 10 — Bhava Chalit (Sripati) vs Swiss Ephemeris.
 * Reference: golden/swissRef.json, produced by golden/swiss_chalit_kp_jaimini_ref.py with
 * pyswisseph 2.10.03 — swe.houses_ex(jd, lat, lon, b'O', FLG_SIDEREAL) for the bhava madhya
 * (Porphyry) and b'S' (Swiss "Sripati" = midpoints of the Porphyry cusps) for the sandhis,
 * SIDM_LAHIRI; planet bhava = the sandhi-to-sandhi span the Swiss longitude falls in.
 * Charts: round-2 panel P1, P2, P5, P9, P10 (scratchpad round2/CONTEXT.md), birth instants in UTC.
 */
import { describe, it, expect } from 'vitest';
import ref from './golden/swissRef.json';
import { computeBhavaChalit, sripatiMadhya, sripatiSandhi } from '../bhavaChalit';
import { chalitSummary } from '../advancedText';
import { PANEL } from './panel';

const arcmin = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) * 60;
const R = ref as unknown as Record<string, { chalit: { madhya: number[]; sandhi: number[]; bhava: Record<string, number> } }>;

describe('Bhava Chalit (Sripati) — Swiss Ephemeris, 5 panel charts', () => {
  for (const id of ['P1', 'P2', 'P5', 'P9', 'P10']) {
    it(`${id}: every bhava madhya and sandhi within 1′, every planet in the same bhava`, () => {
      const { t, lat, lon } = PANEL[id];
      const c = computeBhavaChalit(t, lat, lon);
      c.bhavas.forEach((b, i) => {
        expect(arcmin(b.madhya, R[id].chalit.madhya[i]), `${id} madhya ${i + 1}`).toBeLessThan(1);
        expect(arcmin(b.start, R[id].chalit.sandhi[i]), `${id} sandhi ${i + 1}`).toBeLessThan(1);
      });
      for (const p of c.planets) expect(p.bhava, `${id} ${p.name}`).toBe(R[id].chalit.bhava[p.name]);
    });
  }

  it('P1 (Lucknow 1996): Mars 9→8, Mercury 11→10, Saturn 5→4 shift house (Swiss bhava vs whole-sign house)', () => {
    const c = computeBhavaChalit(PANEL.P1.t, PANEL.P1.lat, PANEL.P1.lon);
    const moved = c.planets.filter(p => p.shifted).map(p => [p.name, p.rashiHouse, p.bhava]);
    expect(moved).toEqual([['Mars', 9, 8], ['Mercury', 11, 10], ['Saturn', 5, 4]]);
    // Saturn sits close to a sandhi: ±5 minutes of birth time changes its Chalit house.
    expect(c.planets.find(p => p.name === 'Saturn')!.timeSensitive).toBe(true);
    expect(c.planets.find(p => p.name === 'Mars')!.timeSensitive).toBe(false);
  });

  it('plain-language lines name the sign-house and the working house', () => {
    const s = chalitSummary(computeBhavaChalit(PANEL.P1.t, PANEL.P1.lat, PANEL.P1.lon));
    expect(s.headline).toMatch(/^3 planets work through a different house/);
    expect(s.lines[0]).toBe('Mars sits in the 9th sign from your Lagna but works through your 8th house — read its results mainly for shared money, research and life changes, rather than luck, teachers, faith and long journeys.');
    expect(s.lines[2]).toMatch(/5 minutes either way would change it/);
  });

  it('Sripati geometry: Lagna/MC are madhya 1/10; sandhis halve each gap', () => {
    const m = sripatiMadhya(100, 10);
    expect(m[0]).toBe(100); expect(m[9]).toBe(10); expect(m[3]).toBe(190); expect(m[6]).toBe(280);
    expect(m[1]).toBeCloseTo(130, 9); expect(m[2]).toBeCloseTo(160, 9); // 100→190 split in thirds
    const s = sripatiSandhi(m);
    expect(s[1]).toBeCloseTo(115, 9);
    expect(s[0]).toBeCloseTo((m[11] + ((100 - m[11] + 360) % 360) / 2) % 360, 9);
  });
});
