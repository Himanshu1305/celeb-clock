import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildCareerReport } from '../careerReport';
import { categoryTiming } from '../yogaTiming';

const NOW = new Date(Date.UTC(2026, 8, 11));
const ref = () => calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 }, { includeShadbala: true, refDate: NOW });

describe('Career report (Part I.12) — deterministic accuracy', () => {
  it('identifies the correct 10th house + lord for the reference chart (Makara Lagna → Tula/Venus)', async () => {
    const r = buildCareerReport(await ref(), NOW);
    expect(r.tenthHouse.sign).toBe('Tula');
    expect(r.tenthHouse.lord).toBe('Venus');
    expect(r.tenthHouse.analysis).toMatch(/10th house/);
  });

  it('only cites career-relevant Yogas that are actually present', async () => {
    const c = await ref();
    const r = buildCareerReport(c, NOW);
    const present = (c.yogas || []).map(y => y.name);
    for (const y of r.yogas) expect(present).toContain(y.name);
    // reference chart has a Raj Yoga
    expect(r.yogas.some(y => y.name.includes('Raj Yoga'))).toBe(true);
  });

  it('career timing matches the engine and cites a real upcoming window', async () => {
    const c = await ref();
    const r = buildCareerReport(c, NOW);
    const t = categoryTiming(c, 'career', NOW);
    expect(r.timing.significators).toEqual(t.significators);
    if (t.next) expect(r.timing.next).toContain(t.next.planet);
  });

  it('verdict is decisive-but-bounded: names real placements, no absolute guarantee', async () => {
    const r = buildCareerReport(await ref(), NOW);
    expect(r.verdict.length).toBeGreaterThan(80);
    expect(r.verdict).not.toMatch(/\byou will\b|guaranteed|definitely/i);
    expect(r.disclaimer).toMatch(/not a guarantee/i);
  });

  it('D10 (Dasamsa) layer is included with the 10th lord + Sun placements', async () => {
    const r = buildCareerReport(await ref(), NOW);
    expect(r.dasamsa.analysis).toMatch(/Dasamsa|D10/);
    expect(r.dasamsa.tenthLordD10).toBeTruthy();
    expect(r.dasamsa.sunD10).toBeTruthy();
  });
});
