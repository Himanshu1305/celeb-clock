import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildTimingFacts } from '../yogaTiming';

const NOW = new Date(Date.UTC(2026, 8, 14));
const mk = (i: any) => calculateBirthChart(i, { includeShadbala: true, refDate: NOW });

// Chennai 1978-03-22 — has a full Kaal Sarp (structural dosha) per the before-reading.
const CH2 = { year: 1978, month: 3, day: 22, hour: 21, minute: 0, latitude: 13.08, longitude: 80.27, timezoneOffset: 5.5 };

describe('Part S — reading timing facts (dosha + divisional + family)', () => {
  it('adds a Family category to the timing facts (Dasha angle for the Family section)', async () => {
    const tf = buildTimingFacts(await mk(CH2), NOW);
    const fam = tf.categories.find(c => c.key === 'family');
    expect(fam, 'family category present').toBeTruthy();
    expect(fam!.label).toBe('Family');
    expect(fam!.significators.length).toBeGreaterThan(0); // 4th + 9th lords
  });

  it('surfaces dosha timing, marking a structural dosha as permanent (no invented window)', async () => {
    const chart = await mk(CH2);
    const tf = buildTimingFacts(chart, NOW);
    // Only present doshas appear.
    if (chart.doshas.kaalSarp.present) {
      const ks = tf.doshaTiming.find(d => d.name === 'Kaal Sarp');
      expect(ks, 'Kaal Sarp timing present').toBeTruthy();
      expect(ks!.structural).toBe(true);
      expect(ks!.significators).toEqual(['Rahu', 'Ketu']);
      expect(ks!.note.toLowerCase()).toMatch(/permanent|structural|no phase/);
    }
    if (chart.doshas.mangalDosha.hasDosha) {
      const mg = tf.doshaTiming.find(d => d.name === 'Mangal Dosha');
      expect(mg!.structural).toBe(false);
      expect(mg!.significators).toEqual(['Mars']);
    }
    // A chart free of a given dosha does not get a timing entry for it (no forcing).
    const names = tf.doshaTiming.map(d => d.name);
    if (!chart.doshas.mangalDosha.hasDosha) expect(names).not.toContain('Mangal Dosha');
  });

  it('connects divisional placements (D10 Sun, D9 Moon) to their ruling planet periods', async () => {
    const chart = await mk(CH2);
    const tf = buildTimingFacts(chart, NOW);
    const d10 = tf.divisionalTiming.find(d => d.varga.includes('D10'));
    const d9 = tf.divisionalTiming.find(d => d.varga.includes('D9'));
    expect(d10, 'D10 timing present').toBeTruthy();
    expect(d9, 'D9 timing present').toBeTruthy();
    expect(d10!.ruler).toBeTruthy();
    expect(d10!.placement).toContain('Sun in');
    expect(d9!.placement).toContain('Moon in');
    expect(d10!.note.toLowerCase()).toMatch(/most likely to express during/);
  });

  it('ACCURACY: every dosha/divisional window date is in the checker valid-date set', async () => {
    const tf = buildTimingFacts(await mk(CH2), NOW);
    const valid = new Set(tf.validRanges);
    for (const d of tf.doshaTiming) for (const w of d.windows) expect(valid.has(w.range), `dosha ${d.name} ${w.range}`).toBe(true);
    for (const dv of tf.divisionalTiming) for (const w of dv.windows) expect(valid.has(w.range), `div ${dv.varga} ${w.range}`).toBe(true);
  });
});
