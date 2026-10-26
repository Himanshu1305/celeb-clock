/**
 * Batch 7 W3 — all sixteen divisional charts (Shodashvarga) vs Swiss Ephemeris.
 *
 * Reference: golden/shodashvargaSwiss.json, produced by golden/shodashvargaSwiss_ref.py with
 * pyswisseph (engine-audit venv, SIDM_LAHIRI, mean node, ascendant from houses_ex) and an
 * INDEPENDENT Python re-implementation of the BPHS ch. 6 varga rules (archive.org text of
 * BPHS, "The Sixteen Divisions of a Rasi", vv. 5–41). Births are the round2/CONTEXT.md
 * panel: P1 Lucknow, P3 New Delhi, P5 London, P6 Sydney, P9 Jammu.
 *
 * A point lying within 0.01° (36″) of a varga boundary is skipped: there the sign depends
 * on sub-arcminute differences between ephemerides, not on the varga rule being tested.
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart, type BirthChartInput } from '../calculateBirthChart';
import { toKundaliLegacy } from '../legacyAdapters';
import { RASHI_NAMES } from '../engine/vedicEngine';
import { VARGA_KEYS, buildShodashvarga, pointLongitudes } from '../engine/shodashvarga';
import ref from './golden/shodashvargaSwiss.json';

const PANEL: Record<string, BirthChartInput> = {
  P1: { year: 1996, month: 8, day: 31, hour: 13, minute: 4, latitude: 26.8467, longitude: 80.9462, timezoneOffset: 5.5 },
  P3: { year: 1990, month: 1, day: 15, hour: 6, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
  P5: { year: 1992, month: 6, day: 10, hour: 14, minute: 20, latitude: 51.5074, longitude: -0.1278, timezoneOffset: 1 },
  P6: { year: 2001, month: 12, day: 25, hour: 8, minute: 0, latitude: -33.8688, longitude: 151.2093, timezoneOffset: 11 },
  P9: { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.8570, timezoneOffset: 5.5 },
};
const MARGIN = 0.01;

type RefRec = { id: string; lons: Record<string, number>; vargas: Record<string, Record<string, { sign: string; marginDeg: number }>> };

describe('Shodashvarga — 16 vargas match Swiss Ephemeris + BPHS ch. 6', () => {
  for (const r of ref as RefRec[]) {
    it(`${r.id}: every varga sign of Lagna + 9 grahas matches`, async () => {
      const res = await calculateBirthChart(PANEL[r.id], { refDate: new Date('2026-10-17T00:00:00Z') });
      // The longitudes themselves agree with Swiss Ephemeris (sanity check on the inputs).
      const lons: Record<string, number> = { Lagna: res.lagna.rashiIndex * 30 + res.lagna.degrees, ...Object.fromEntries(res.planets.map(p => [p.name, p.longitude])) };
      for (const [p, se] of Object.entries(r.lons)) {
        const d = Math.abs(((lons[p] - se + 540) % 360) - 180);
        expect(d, `${r.id} ${p} longitude vs Swiss Ephemeris`).toBeLessThan(0.02);
      }
      const charts = res.shodashvarga!;
      expect(charts.map(c => c.key)).toEqual(VARGA_KEYS);
      let compared = 0;
      for (const c of charts) {
        const expected = r.vargas[c.key];
        const got: Record<string, number> = { Lagna: c.lagnaSignIndex, ...Object.fromEntries(c.planets.map(p => [p.name, p.signIndex])) };
        for (const [point, e] of Object.entries(expected)) {
          if (e.marginDeg < MARGIN) continue;
          expect(`${c.key} ${point} ${RASHI_NAMES[got[point] - 1]}`).toBe(`${c.key} ${point} ${e.sign}`);
          compared++;
        }
      }
      expect(compared).toBeGreaterThanOrEqual(140); // 160 = 16 vargas × 10 points, minus boundary skips (max 14, P5 Rahu/Ketu)
    });
  }

  it('D1, D9 and D10 in the 16-chart set agree with the D9/D10 charts already shown', async () => {
    const res = await calculateBirthChart(PANEL.P1, { refDate: new Date('2026-10-17T00:00:00Z') });
    const legacy = toKundaliLegacy(res);
    const by = Object.fromEntries(legacy.shodashvarga!.map(c => [c.key, c]));
    expect(by.D1.lagnaSignIndex).toBe(legacy.lagna.signIndex);
    for (const p of legacy.planets) expect(by.D1.planets.find(x => x.name === p.name)!.signIndex).toBe(p.signIndex);
    expect(by.D9.lagnaSignIndex).toBe(legacy.divisionalCharts.d9!.lagnaSignIndex);
    expect(by.D10.planets).toEqual(legacy.divisionalCharts.d10!.planets);
    expect(by.D9.planets).toEqual(legacy.divisionalCharts.d9!.planets);
  });

  it('flags time sensitivity: a Lagna 0.2° from a D60 boundary is flagged, D1 is not', () => {
    // P1 birth instant; Lagna moves ~1° per 4 min, so ±5 min sweeps ~±1.25°.
    const utc = new Date(Date.UTC(1996, 7, 31, 7, 34));
    const lons = pointLongitudes(utc, 26.8467, 80.9462);
    const charts = buildShodashvarga(utc, 26.8467, 80.9462, lons);
    const d60 = charts.find(c => c.key === 'D60')!;
    const d1 = charts.find(c => c.key === 'D1')!;
    expect(d60.timeSensitive).toContain('Lagna'); // 0.5° parts — always within reach of ±1.25°
    expect(d1.timeSensitive).not.toContain('Lagna'); // Lagna at 19.7° Scorpio — far from a sign edge
    // Slow planets never flip in 10 minutes unless sitting on an edge.
    expect(d1.timeSensitive).not.toContain('Saturn');
  });

  it('a Moon near a D1 sign edge is flagged as time-sensitive', () => {
    // Find a real instant where the sidereal Moon is within ~0.02° of 0° Aries (just
    // after an ingress): the ±5-minute window (Moon ≈ 0.04°) must flag D1 Moon.
    let t = new Date(Date.UTC(2024, 0, 1)).getTime();
    const step = 3600 * 1000;
    let prev = pointLongitudes(new Date(t), 0, 0).Moon;
    for (let i = 0; i < 24 * 30; i++) {
      t += step;
      const cur = pointLongitudes(new Date(t), 0, 0).Moon;
      if (Math.floor(cur / 30) !== Math.floor(prev / 30)) break;
      prev = cur;
    }
    // Bisect to the ingress, then sit 1 minute after it.
    let lo = t - step, hi = t;
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      const m = pointLongitudes(new Date(mid), 0, 0).Moon;
      if (Math.floor(m / 30) === Math.floor(prev / 30)) lo = mid; else hi = mid;
    }
    const at = new Date(hi + 60 * 1000);
    const charts = buildShodashvarga(at, 0, 0, pointLongitudes(at, 0, 0));
    expect(charts.find(c => c.key === 'D1')!.timeSensitive).toContain('Moon');
  });
});
