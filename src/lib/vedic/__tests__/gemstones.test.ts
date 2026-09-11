import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildGemstoneReport, verifyGemstoneReport } from '../gemstones';

const NOW = new Date(Date.UTC(2026, 8, 11));
const chart = (i: any) => calculateBirthChart(i, { includeShadbala: true, refDate: NOW });
const CHARTS = {
  makara: { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },   // Capricorn → Venus YK
  vrishabha: { year: 1990, month: 4, day: 20, hour: 9, minute: 15, latitude: 19.07, longitude: 72.88, timezoneOffset: 5.5 }, // Taurus → Saturn YK
  dhanu: { year: 1992, month: 1, day: 15, hour: 6, minute: 0, latitude: 13.08, longitude: 80.27, timezoneOffset: 5.5 },      // Sagittarius → no YK
  simha: { year: 2000, month: 8, day: 20, hour: 12, minute: 0, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },
};

describe('Gemstone rebuild (Part J) — Lagna-based hierarchy', () => {
  it('POSITIVE: Yogakaraka Lagnas recommend the Yogakaraka stone (Capricorn→Venus, Taurus→Saturn)', async () => {
    const cap = buildGemstoneReport(await chart(CHARTS.makara));
    expect(cap.methodology.yogakaraka).toBe('Venus');
    expect(cap.primary?.planet).toBe('Venus');
    expect(cap.primary?.gem).toBe('Diamond');
    expect(cap.primary?.role).toBe('Yogakaraka');

    const tau = buildGemstoneReport(await chart(CHARTS.vrishabha));
    expect(tau.methodology.yogakaraka).toBe('Saturn');
    expect(tau.primary?.planet).toBe('Saturn');
    expect(tau.primary?.trialCaution).toBe(true); // Blue Sapphire → trial first
  });

  it('POSITIVE: a no-Yogakaraka Lagna falls back to the Ascendant lord (Sagittarius→Jupiter)', async () => {
    const r = buildGemstoneReport(await chart(CHARTS.dhanu));
    expect(r.methodology.yogakaraka).toBeNull();
    expect(r.primary?.planet).toBe('Jupiter');
    expect(r.primary?.role).toBe('Ascendant lord');
  });

  it('POSITIVE: recommendation is Lagna-based, and the methodology note says so (not Rashi-only)', async () => {
    const r = buildGemstoneReport(await chart(CHARTS.makara));
    expect(r.methodology.text).toMatch(/Ascendant \(Lagna\)/);
    expect(r.methodology.text).toMatch(/not your Moon sign \(Rashi\) alone/i);
    // methodology critique is aimed at the METHOD, not any competitor/seller
    expect(r.methodology.text).not.toMatch(/other apps|sellers|competitor|scam|untrustworthy/i);
  });

  it('flags functional malefics to AVOID (never recommends their stone)', async () => {
    const r = buildGemstoneReport(await chart(CHARTS.makara)); // Capricorn: Sun(8th) + Jupiter(3rd/12th) malefic
    const avoided = r.avoid.map(a => a.planet);
    expect(avoided).toContain('Sun');
    expect(avoided).toContain('Jupiter');
    // an avoided planet is never the primary or an additional suggestion
    const recommended = [r.primary?.planet, ...r.additional.map(a => a.planet)];
    for (const a of avoided) expect(recommended).not.toContain(a);
  });

  it('NEGATIVE: when no functional benefic is currently weak, it says so honestly (no forced extra)', async () => {
    // find a chart whose additional weak-benefic list is empty
    const r = buildGemstoneReport(await chart(CHARTS.dhanu));
    if (r.additional.every(a => a.role !== 'weak functional benefic')) {
      expect(r.additionalNote).toMatch(/no functional benefic is currently weak|no extra stone is forced/i);
    }
    expect(r.primary).not.toBeNull(); // the lifelong primary is always given
  });

  it('EDGE: discloses that functional-malefic classification varies by tradition (not silently resolved)', async () => {
    const r = buildGemstoneReport(await chart(CHARTS.makara));
    expect(r.classificationNote).toMatch(/traditions differ|kendradhipati|conservative/i);
  });

  it('ACCURACY (zero tolerance): the methodology note matches the real computed chart on all Lagnas', async () => {
    for (const key of Object.keys(CHARTS) as (keyof typeof CHARTS)[]) {
      const c = await chart(CHARTS[key]);
      const v = verifyGemstoneReport(buildGemstoneReport(c), c);
      expect(v.wrong, `${key}: ${JSON.stringify(v.wrong)}`).toHaveLength(0);
      expect(v.correct).toBe(v.checked);
    }
  });

  it('keeps the cautious framing (no sales, non-medical) intact', async () => {
    const r = buildGemstoneReport(await chart(CHARTS.makara));
    expect(r.disclaimer).toMatch(/not medical|sells nothing|no seller/i);
    expect(r.disclaimer).toMatch(/trial/i);
  });
});
