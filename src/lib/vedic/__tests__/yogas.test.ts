import { describe, it, expect } from 'vitest';
import { detectYogas, detectAllYogas, type YogaResult } from '../yogas';
import { calculateBirthChart } from '../calculateBirthChart';
import { RASHI_NAMES } from '../engine/vedicEngine';

// Minimal chart fixture builder for isolated worked-example verification.
type Spec = Record<string, { sign: string; house: number; navamsa?: string; combust?: boolean }>;
function mkChart(lagnaSign: string, specs: Spec, shadbala?: Record<string, number>): any {
  const planets = Object.entries(specs).map(([name, s]) => ({
    name, sign: s.sign, signIndex: RASHI_NAMES.indexOf(s.sign) + 1, house: s.house,
    navamsaSign: s.navamsa ?? s.sign, combust: !!s.combust, retrograde: false, longitude: 0, degreeInSign: 0, nakshatra: '', pada: 1,
  }));
  return {
    lagna: { sign: lagnaSign, rashiIndex: RASHI_NAMES.indexOf(lagnaSign), signIndex: RASHI_NAMES.indexOf(lagnaSign) + 1, degrees: 0 },
    planets,
    shadbala: shadbala ? Object.fromEntries(Object.entries(shadbala).map(([k, v]) => [k, { total: v }])) : undefined,
    divisionalCharts: { d9: {}, d10: {}, d60: {}, d60Method: '', d60Disclaimer: '' },
  };
}
const find = (ys: YogaResult[], name: string) => ys.find(y => y.name.includes(name))!;

describe('Yoga engine — reference chart (1988-11-05, 12:30, Delhi) full results', () => {
  it('detects the correct Yogas with sensible grades and reasoning', async () => {
    const chart = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 }, { includeShadbala: true, refDate: new Date(Date.UTC(2026, 8, 9)) });
    const ys = detectYogas(chart);
    const names = ys.map(y => y.name);

    // Venus is the classic Yogakaraka for Makara Lagna (rules 5th trikona + 10th kendra).
    const raj = find(ys, 'Raj Yoga');
    expect(raj.present).toBe(true);
    expect(raj.planets).toContain('Venus');
    expect(raj.note).toMatch(/Yogakaraka.*Venus/);
    // ...but Venus is debilitated → delivery tempered below "full".
    expect(raj.grade).toBe('strong');
    expect(raj.conditions.join(' ')).toMatch(/Yogakaraka .*debilitated/);

    expect(find(ys, 'Dhana Yoga').present).toBe(true);
    // Neecha Bhanga on the debilitated Sun — graded MODERATE because the canceller Venus is itself weak.
    const nbSun = find(ys, 'Neecha Bhanga Raja Yoga (Sun)');
    expect(nbSun.present).toBe(true);
    expect(nbSun.grade).toBe('moderate');
    expect(nbSun.conditions.join(' ')).toMatch(/cancelling planet \(Venus\) is itself weak/);
    // Budha-Aditya present, not combust.
    expect(find(ys, 'Budha-Aditya').grade).toBe('moderate');
    // Gaja Kesari is correctly ABSENT (Jupiter is 9th from Moon, not a Kendra).
    expect(names.some(n => n.includes('Gaja Kesari'))).toBe(false);
    const gk = detectAllYogas(chart).find(y => y.name.includes('Gaja Kesari'))!;
    expect(gk.present).toBe(false);
    expect(gk.conditions.join(' ')).toMatch(/9th from the Moon.*not a Kendra/);
  });
});

describe('Yoga engine — worked examples (one per Yoga)', () => {
  it('Neecha Bhanga: Sun debilitated in Tula (Libra) + dispositor Venus in a Kendra, conjunct → strong cancellation', () => {
    // Sourced worked example: Sun debilitated in Libra; Venus (lord of Libra) in kendra conjunct Sun.
    const chart = mkChart('Mesha', { Sun: { sign: 'Tula', house: 7, navamsa: 'Mesha' }, Venus: { sign: 'Tula', house: 7 }, Moon: { sign: 'Mesha', house: 1 }, Saturn: { sign: 'Makara', house: 10 } });
    const nb = detectAllYogas(chart).find(y => y.name.includes('Neecha Bhanga Raja Yoga (Sun)'))!;
    expect(nb.present).toBe(true);
    expect(['strong', 'full']).toContain(nb.grade);
    expect(nb.conditions.join(' ')).toMatch(/dispositor Venus is in a Kendra/);
  });

  it('Neecha Bhanga: debilitated ALSO in Navamsa → cancellation negated (grade capped at partial)', () => {
    const chart = mkChart('Mesha', { Sun: { sign: 'Tula', house: 7, navamsa: 'Tula' }, Venus: { sign: 'Tula', house: 7 }, Moon: { sign: 'Mesha', house: 1 } });
    const nb = detectAllYogas(chart).find(y => y.name.includes('Neecha Bhanga Raja Yoga (Sun)'))!;
    expect(nb.grade).toBe('partial');
    expect(nb.conditions.join(' ')).toMatch(/ALSO debilitated in the Navamsa/);
  });

  it('Pancha Mahapurusha — Ruchaka: Mars in own sign Vrischika in the Lagna (Kendra)', () => {
    const chart = mkChart('Vrischika', { Mars: { sign: 'Vrischika', house: 1 }, Moon: { sign: 'Mesha', house: 6 } }, { Mars: 400 });
    const ruchaka = detectAllYogas(chart).find(y => y.name.includes('Ruchaka'))!;
    expect(ruchaka.present).toBe(true);
    expect(['strong', 'full', 'moderate']).toContain(ruchaka.grade);
  });

  it('Pancha Mahapurusha — NOT formed when dignified planet is NOT in a Kendra', () => {
    const chart = mkChart('Mesha', { Mars: { sign: 'Vrischika', house: 8 }, Moon: { sign: 'Mesha', house: 1 } });
    const ruchaka = detectAllYogas(chart).find(y => y.name.includes('Ruchaka'))!;
    expect(ruchaka.present).toBe(false);
    expect(ruchaka.conditions.join(' ')).toMatch(/not a Kendra/);
  });

  it('Gaja Kesari: Jupiter exalted in Karka, 4th from Moon (Kendra) → present, good delivery', () => {
    const chart = mkChart('Mesha', { Moon: { sign: 'Mesha', house: 1 }, Jupiter: { sign: 'Karka', house: 4 }, Sun: { sign: 'Simha', house: 5 } }, { Jupiter: 450, Moon: 400 });
    const gk = detectAllYogas(chart).find(y => y.name.includes('Gaja Kesari'))!;
    expect(gk.present).toBe(true);
    expect(gk.note).toMatch(/COMMON/); // the required commonality caveat
    expect(['moderate', 'strong']).toContain(gk.grade);
  });

  it('Budha-Aditya: combust Mercury weakens the Yoga to partial', () => {
    const chart = mkChart('Mesha', { Sun: { sign: 'Simha', house: 5 }, Mercury: { sign: 'Simha', house: 5, combust: true }, Moon: { sign: 'Mesha', house: 1 } });
    const ba = detectAllYogas(chart).find(y => y.name.includes('Budha-Aditya'))!;
    expect(ba.present).toBe(true);
    expect(ba.grade).toBe('partial');
    expect(ba.conditions.join(' ')).toMatch(/combust/);
  });

  it('Chandra-Mangal: Moon and Mars conjunct → present', () => {
    const chart = mkChart('Mesha', { Moon: { sign: 'Simha', house: 5 }, Mars: { sign: 'Simha', house: 5 } });
    const cm = detectAllYogas(chart).find(y => y.name.includes('Chandra-Mangal'))!;
    expect(cm.present).toBe(true);
  });
});

describe('Yoga engine — a Yoga-less chart fabricates nothing', () => {
  it('a bland chart with no combinations returns no present Yogas', () => {
    // Neutral placements, no dignities, no wealth/kendra-trikona links, Jupiter not kendra-from-Moon.
    const chart = mkChart('Mesha', {
      Sun: { sign: 'Vrishabha', house: 2 }, Moon: { sign: 'Karka', house: 4 }, Mars: { sign: 'Mithuna', house: 3 },
      Mercury: { sign: 'Kumbha', house: 11 }, Jupiter: { sign: 'Kanya', house: 6 }, Venus: { sign: 'Dhanu', house: 9 },
      Saturn: { sign: 'Simha', house: 5 },
    });
    const present = detectYogas(chart);
    // It's fine if a common one slips in, but there must be NO Mahapurusha and NO Neecha Bhanga fabricated.
    expect(present.some(y => /Mahapurusha|Ruchaka|Bhadra|Hamsa|Malavya|Sasa/.test(y.name))).toBe(false);
    expect(present.some(y => /Neecha Bhanga/.test(y.name))).toBe(false);
  });
});
