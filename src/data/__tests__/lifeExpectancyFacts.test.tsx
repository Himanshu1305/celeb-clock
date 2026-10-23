// @vitest-environment jsdom
/**
 * Audit S13 — one sourced life-expectancy table sitewide.
 *
 * Reference values: UN World Population Prospects 2024, period life expectancy at birth,
 * estimate for 2023, fetched 23 Oct 2026 via Our World in Data (which republishes WPP 2024):
 *   https://ourworldindata.org/grapher/life-expectancy.csv?country=IND~USA~BRA&time=2023
 *     → India 72.0026, United States 79.3043, Brazil 75.8482, World 73.1694
 *   https://ourworldindata.org/grapher/female-and-male-life-expectancy-at-birth-in-years.csv?time=2023
 *     → India M 70.522 / F 73.598; USA M 76.864 / F 81.849; Brazil M 72.76 / F 78.983
 * (The audit's own note also records "UN WPP 2024 says 72.0" for India.)
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { WPP2024_LIFE_EXPECTANCY, le, leYears, INDIA_LIFE_EXPECTANCY, LE_CITATION } from '../lifeExpectancyFacts';
import { BIRTH_BASELINES } from '@/services/LongevityCalculationService';
import LifeExpectancyIndia from '@/pages/LifeExpectancyIndia';
import LifeExpectancyUSA from '@/pages/LifeExpectancyUSA';
import LifeExpectancyBrazil from '@/pages/LifeExpectancyBrazil';
import { getTitleForRoute } from '../../../scripts/prerender-titles.mjs';

afterEach(cleanup);

const REF = {
  India: { both: '72.0', male: '70.5', female: '73.6' },
  'United States': { both: '79.3', male: '76.9', female: '81.8' },
  Brazil: { both: '75.8', male: '72.8', female: '79.0' },
} as const;

describe('S13: WPP 2024 table', () => {
  it('India, USA, Brazil match the UN WPP 2024 (2023) reference values', () => {
    for (const [c, r] of Object.entries(REF)) {
      expect(leYears(c), c).toBe(r.both);
      expect(leYears(c, 'male'), c).toBe(r.male);
      expect(leYears(c, 'female'), c).toBe(r.female);
    }
    expect(leYears('World')).toBe('73.2');
    expect(LE_CITATION).toBe('UN World Population Prospects 2024, estimate for 2023');
  });

  it('every row is internally consistent (male ≤ both ≤ female, plausible range)', () => {
    for (const [c, r] of Object.entries(WPP2024_LIFE_EXPECTANCY)) {
      expect(r.both, c).toBeGreaterThanOrEqual(Math.min(r.male, r.female));
      expect(r.both, c).toBeLessThanOrEqual(Math.max(r.male, r.female));
      expect(r.both, c).toBeGreaterThan(50);
      expect(r.both, c).toBeLessThan(90);
    }
  });

  it('calculator birth baselines and the India headline read the same table', () => {
    for (const [c, b] of Object.entries(BIRTH_BASELINES)) {
      expect(b.male, c).toBe(le(c).male);
      expect(b.female, c).toBe(le(c).female);
    }
    expect(INDIA_LIFE_EXPECTANCY.overallPrecise).toBe(72.0);
  });
});

const renderPage = (C: () => JSX.Element) =>
  render(<HelmetProvider><MemoryRouter><C /></MemoryRouter></HelmetProvider>);

describe('S13: country pages show the table figures, not the old ones', () => {
  it('India page: 72.0 / 70.5 / 73.6, no 70.9 / 72.2', () => {
    renderPage(LifeExpectancyIndia);
    const t = document.body.textContent || '';
    expect(t).toContain('72.0');
    expect(t).toContain('70.5');
    expect(t).toContain('73.6');
    expect(t).not.toContain('70.9');
    expect(t).not.toContain('72.2');
    expect(t).toContain('UN World Population Prospects 2024, estimate for 2023');
  });
  it('USA page: 79.3, not 77.5', () => {
    renderPage(LifeExpectancyUSA);
    const t = document.body.textContent || '';
    expect(t).toContain('79.3');
    expect(t).not.toContain('77.5');
  });
  it('Brazil page: 75.8, not 74.6', () => {
    renderPage(LifeExpectancyBrazil);
    const t = document.body.textContent || '';
    expect(t).toContain('75.8');
    expect(t).not.toContain('74.6');
  });
  it('prerendered meta descriptions use the same table', () => {
    expect(getTitleForRoute('/life-expectancy-india').description).toContain('72.0');
    expect(getTitleForRoute('/life-expectancy-usa').description).toContain('79.3');
    expect(getTitleForRoute('/life-expectancy-brazil').description).toContain('75.8');
  });
});
