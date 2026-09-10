import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildGemstoneReport } from '../gemstones';

const chart = (i: any) => calculateBirthChart(i, { includeShadbala: true });

describe('Gemstone suggestions (Part I.11) — cautious', () => {
  it('recommends the Lagna lord’s stone via the standard Navaratna mapping', async () => {
    // Makara (Capricorn) Lagna → lord Saturn → Blue Sapphire, with the trial caution.
    const g = buildGemstoneReport(await chart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 }));
    expect(g.primary?.planet).toBe('Saturn');
    expect(g.primary?.gem).toBe('Blue Sapphire');
    expect(g.primary?.hindi).toBe('Neelam');
    expect(g.primary?.trialCaution).toBe(true); // powerful stone → trial first
  });

  it('a different Lagna maps to a different stone (Vrishabha → Venus → Diamond)', async () => {
    const g = buildGemstoneReport(await chart({ year: 1990, month: 4, day: 20, hour: 9, minute: 15, latitude: 19.07, longitude: 72.88, timezoneOffset: 5.5 }));
    expect(g.primary?.planet).toBe('Venus');
    expect(g.primary?.gem).toBe('Diamond');
    expect(g.primary?.trialCaution).toBe(false);
  });

  it('carries the non-medical / no-sales disclaimer + discloses the selection-method variance', async () => {
    const g = buildGemstoneReport(await chart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 }));
    expect(g.disclaimer).toMatch(/not medical|traditional|sells nothing/i);
    expect(g.disclaimer).toMatch(/consult a qualified astrologer/i);
    expect(g.methodology).toMatch(/variance|flagged|one classical view/i);
  });

  it('never suggests a stone for a natural malefic as "supportive" (only weak favourable benefics)', async () => {
    const g = buildGemstoneReport(await chart({ year: 1990, month: 4, day: 20, hour: 9, minute: 15, latitude: 19.07, longitude: 72.88, timezoneOffset: 5.5 }));
    for (const s of g.supportive) expect(['Jupiter', 'Venus', 'Mercury', 'Moon']).toContain(s.planet);
  });
});
