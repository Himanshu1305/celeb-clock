// @vitest-environment jsdom
/**
 * Audit K1 regression: What's Ahead must use the chart's REAL house lords. KundaliData
 * carries the Lagna as a 1-based sign number; passing it straight into the 0-based
 * houseLord() shifted every lord one sign forward for every user.
 *
 * Reference values:
 *  - P9 (13 May 1978 19:30 IST, Jammu) = Vrischika Lagna. round2.txt (audit K1) records the
 *    correct lords: career (10th = Simha) → Sun, home (4th = Kumbha) → Saturn.
 *  - P3 (15 Jan 1990 06:30 IST, New Delhi) = Dhanu Lagna (Lagna for the whole test panel
 *    matched Swiss Ephemeris in the round-2 audit). Classical sign lords: 10th = Kanya →
 *    Mercury, 4th = Meena → Jupiter, 7th = Mithuna → Mercury.
 */
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAhead } from '../WhatsAhead';
import { calculateBirthChart } from '@/lib/vedic/calculateBirthChart';
import { toKundaliLegacy } from '@/lib/vedic/legacyAdapters';

afterEach(cleanup);

async function legacy(input: { year: number; month: number; day: number; hour: number; minute: number; latitude: number; longitude: number }) {
  const chart = await calculateBirthChart({ ...input, timezoneOffset: 5.5 }, { refDate: new Date(Date.UTC(2026, 9, 17)) });
  return toKundaliLegacy(chart as never) as unknown as {
    lagna: { sign: string; signIndex: number };
    planets: Array<{ name: string; house: number }>;
    dashaTimeline: Array<{ lord: string; start: string; end: string }>;
  };
}

function sigs(key: string): string[] {
  return (screen.getByTestId(`whatsahead-area-${key}`).getAttribute('data-significators') || '').split(',');
}

async function renderFor(input: Parameters<typeof legacy>[0]) {
  const data = await legacy(input);
  render(
    <MemoryRouter>
      <WhatsAhead lagnaSignIndex={data.lagna.signIndex} planets={data.planets} dashaTimeline={data.dashaTimeline} free />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId('whats-ahead-toggle'));
  return data;
}

describe("What's Ahead uses the real house lords (audit K1)", () => {
  it('P9 Vrischika Lagna: career lord Sun (not Mercury), home lord Saturn (not Jupiter)', async () => {
    const data = await renderFor({ year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.857 });
    expect(data.lagna.signIndex).toBe(8); // 1-based: Vrischika
    expect(sigs('career')[0]).toBe('Sun');
    expect(sigs('career')).not.toContain('Mercury');
    expect(sigs('home')[0]).toBe('Saturn');
    expect(sigs('home')).not.toContain('Jupiter');
    expect(sigs('relationships')[0]).toBe('Venus'); // 7th = Vrishabha
    expect(sigs('health').slice(0, 2)).toEqual(['Mars', 'Sun']); // 1st Vrischika → Mars, 6th Mesha → Mars, + Sun karaka
  }, 30000);

  it('P3 Dhanu Lagna: career Mercury, home Jupiter, 7th lord Mercury', async () => {
    const data = await renderFor({ year: 1990, month: 1, day: 15, hour: 6, minute: 30, latitude: 28.6139, longitude: 77.209 });
    expect(data.lagna.signIndex).toBe(9); // 1-based: Dhanu
    expect(sigs('career')[0]).toBe('Mercury');
    expect(sigs('home')[0]).toBe('Jupiter');
    expect(sigs('relationships')[0]).toBe('Mercury');
  }, 30000);
});
