import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildCareerReport } from '../careerReport';
import { computeSadeSati } from '../sadeSati';
import { getSaturnSignIndex, RASHI_NAMES } from '../engine/vedicEngine';
import { muhuratMethodology } from '../panchang';

const NOW = new Date(Date.UTC(2026, 8, 11));
const chart = (i: any) => calculateBirthChart(i, { includeShadbala: true, refDate: NOW });
const A = { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 };  // Makara
const B = { year: 1992, month: 1, day: 15, hour: 6, minute: 0, latitude: 13.08, longitude: 80.27, timezoneOffset: 5.5 };  // Dhanu

describe('Item 2 — Career methodology note (accuracy-checked, 2 charts)', () => {
  for (const [name, input] of [['Makara', A], ['Dhanu', B]] as const) {
    it(`states the real 10th-house factors for the ${name} chart`, async () => {
      const r = buildCareerReport(await chart(input), NOW);
      expect(r.methodology).toContain(r.tenthHouse.sign);   // real 10th sign
      expect(r.methodology).toContain(r.tenthHouse.lord);    // real 10th lord
      expect(r.methodology).toMatch(/Dasamsa|D10/);          // the career varga
      for (const y of r.yogas) expect(r.methodology).toContain(y.name); // every cited yoga is real
      // no generic template tell-tale
      expect(r.methodology).not.toMatch(/\[X\]|\[Y\]|lorem/i);
    });
  }
});

describe('Item 2 — Sade Sati methodology note (accuracy-checked, active + inactive)', () => {
  for (const [name, input] of [['Makara', A], ['Dhanu', B]] as const) {
    it(`names the real Moon sign + Saturn transit and matches active state for the ${name} chart`, async () => {
      const c = await chart(input);
      const moonIdx = RASHI_NAMES.indexOf(c.rashi);
      const r = computeSadeSati(moonIdx, NOW, getSaturnSignIndex);
      expect(r.methodology).toContain(c.rashi);                       // real Moon sign
      expect(r.methodology).toContain(RASHI_NAMES[getSaturnSignIndex(NOW)]); // real Saturn transit sign
      // the note's active/inactive wording matches the computed active flag
      if (r.active) expect(r.methodology).toMatch(/it is active for you/i);
      else expect(r.methodology).toMatch(/not active right now/i);
    });
  }
});

describe('Item 2 — Muhurat methodology note names the Panchang limbs checked', () => {
  it('mentions Tithi, Nakshatra, Yoga, weekday and Rahu Kalam', () => {
    const m = muhuratMethodology('business');
    for (const limb of ['Tithi', 'Nakshatra', 'Yoga', 'weekday', 'Rahu Kalam']) expect(m).toContain(limb);
    // purpose-specific framing
    expect(muhuratMethodology('travel')).toMatch(/travel/i);
  });
});
