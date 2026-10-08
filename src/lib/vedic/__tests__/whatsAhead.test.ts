import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { windowsForSignificators, houseLordOf, categorySignificators } from '../yogaTiming';
import { SIGN_LORDS as ENGINE_SIGN_LORDS } from '../engine/sthanaBala';
import { windowsFor, houseLord, lifeAreas, timeHorizons, activeChainAt, SIGN_LORDS } from '../whatsAhead';

const NOW = new Date(Date.UTC(2026, 0, 1));
const CHARTS = [
  { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },
  { year: 1992, month: 1, day: 15, hour: 6, minute: 0, latitude: 13.08, longitude: 80.27, timezoneOffset: 5.5 },
];

describe('whatsAhead — parity with the validated engine', () => {
  it('SIGN_LORDS mirrors the engine exactly', () => {
    expect([...SIGN_LORDS]).toEqual([...ENGINE_SIGN_LORDS]);
  });

  it('houseLord matches engine houseLordOf for every house, both charts', async () => {
    for (const input of CHARTS) {
      const chart: any = await calculateBirthChart(input, { refDate: NOW });
      for (let h = 1; h <= 12; h++) {
        expect(houseLord(chart.lagna.rashiIndex, h)).toBe(houseLordOf(chart, h));
      }
    }
  });

  it('windowsFor reproduces engine windowsForSignificators (career + marriage), both charts', async () => {
    for (const input of CHARTS) {
      const chart: any = await calculateBirthChart(input, { refDate: NOW });
      for (const cat of ['career', 'marriage'] as const) {
        const { significators } = categorySignificators(chart, cat);
        const mine = windowsFor(chart.dashaTimeline, significators, NOW.getTime());
        const eng = windowsForSignificators(chart.dashaTimeline, significators, NOW);
        expect(mine.map(w => `${w.planet}:${w.level}:${w.start}`)).toEqual(eng.map(w => `${w.planet}:${w.level}:${w.start}`));
        for (let i = 0; i < mine.length; i++) expect(mine[i].status).toBe(eng[i].status);
      }
    }
  });
});

describe('whatsAhead — life areas & horizons', () => {
  it('produces all five life areas with non-empty significators', async () => {
    const chart: any = await calculateBirthChart(CHARTS[0], { refDate: NOW });
    const areas = lifeAreas(chart.lagna.rashiIndex, (h) => chart.planets.filter((p: any) => p.house === h).map((p: any) => p.name));
    expect(areas.map(a => a.key)).toEqual(['career', 'relationships', 'home', 'health', 'travel']);
    for (const a of areas) expect(a.significators.length).toBeGreaterThan(0);
  });

  it('relationships significators are the gender-neutral set (never gendered)', async () => {
    const chart: any = await calculateBirthChart(CHARTS[0], { refDate: NOW });
    const areas = lifeAreas(chart.lagna.rashiIndex, () => []);
    const rel = areas.find(a => a.key === 'relationships')!;
    expect(rel.significators).toContain('Venus');
    expect(rel.significators).toContain('Jupiter');
  });

  it('activeChainAt returns a consistent nested chain (now is inside the whole timeline)', async () => {
    const chart: any = await calculateBirthChart(CHARTS[0], { refDate: NOW });
    const chain = activeChainAt(chart.dashaTimeline, NOW.getTime());
    expect(chain.maha).toBeTruthy();
    expect(chain.antar).toBeTruthy();
  });

  it('timeHorizons gives four forward horizons + the lifetime Maha list', async () => {
    const chart: any = await calculateBirthChart(CHARTS[0], { refDate: NOW });
    const { horizons, lifetime } = timeHorizons(chart.dashaTimeline, NOW.getTime());
    expect(horizons.map(h => h.label)).toEqual(['Right now', 'In 1 month', 'In 6 months', 'In 1 year']);
    expect(lifetime.length).toBeGreaterThan(0);
  });
});
