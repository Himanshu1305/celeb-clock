/**
 * Audit K3 / K4 / K5 regressions.
 *
 * Reference data: the round-2 panel (scratchpad/round2/CONTEXT.md) — P10 is a child born
 * 10 Mar 2024 09:15 IST, Bengaluru; P9 born 13 May 1978 19:30 IST, Jammu. Their charts'
 * planet signs/houses and Vimshottari lords matched Swiss Ephemeris in the round-2 audit.
 * Expected behaviour (no numeric reference needed): round2.txt K3/K4/K5 fixes —
 * no marriage/career timing under 18; child favourable periods only before age 18;
 * Rahu/Ketu period text uses the node's house and sign lord, never "matters of general".
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { buildTimingFacts, ageInYears } from '../yogaTiming';
import { extractReadingFacts, buildReadingUserPrompt } from '../readingPrompts';
import { deterministicTimingReply } from '../chatGuardrails';
import { buildChildKundli } from '../childKundli';
import { toKundaliLegacy } from '../legacyAdapters';
import { buildPeriodForecast } from '../periodForecast';

const NOW = new Date('2026-10-17T06:00:00Z');
const P10 = { year: 2024, month: 3, day: 10, hour: 9, minute: 15, latitude: 12.9716, longitude: 77.5946, timezoneOffset: 5.5 };
const P10_BIRTH = new Date('2024-03-10T03:45:00Z');
const P9 = { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.857, timezoneOffset: 5.5 };

describe('K3: no marriage or career timing for under-18s', () => {
  it('P10 (age 2): marriage and career categories carry no windows; wealth still does', async () => {
    const chart = await calculateBirthChart(P10, { refDate: NOW });
    const age = ageInYears(P10_BIRTH, NOW);
    expect(age).toBe(2);
    const t = buildTimingFacts(chart, NOW, { ageYears: age });
    for (const k of ['marriage', 'career']) {
      const c = t.categories.find(x => x.key === k)!;
      expect(c.suppressedForMinor).toBe(true);
      expect(c.upcoming).toHaveLength(0);
      expect(c.past).toHaveLength(0);
      expect(c.next).toBeNull();
    }
    const prompt = buildReadingUserPrompt(extractReadingFacts(chart, NOW, { ageYears: age }));
    expect(prompt).toMatch(/Marriage[^\n]*NOT APPLICABLE/);
    expect(prompt).not.toMatch(/Marriage \(driven by/);
    expect(deterministicTimingReply(t, 'marriage')).toMatch(/under 18/);
  });

  it('an adult (P9) still gets marriage windows', async () => {
    const chart = await calculateBirthChart(P9, { refDate: NOW });
    const t = buildTimingFacts(chart, NOW, { ageYears: 48 });
    const m = t.categories.find(x => x.key === 'marriage')!;
    expect(m.suppressedForMinor).toBeUndefined();
    expect(m.upcoming.length + m.past.length).toBeGreaterThan(0);
  });
});

describe('K4: Child Kundli favourable periods stay inside childhood', () => {
  it('P10: only periods before the 18th birthday (Mar 2042), never Mercury 2055 / Venus 2079', async () => {
    const chart = await calculateBirthChart(P10, { refDate: NOW });
    const c = buildChildKundli(toKundaliLegacy(chart as never) as never, '2024-03-10')!;
    const body = c.favourablePeriods.body;
    expect(body).toContain('Jupiter period (from birth');
    expect(body).not.toMatch(/Mercury period|Venus period/);
    for (const y of body.match(/\b(20\d\d)\b/g) ?? []) expect(Number(y)).toBeLessThanOrEqual(2042);
  });
});

describe('K5: Rahu/Ketu periods read through the node placement', () => {
  it('a Rahu sub-period names Rahu\'s house and sign lord, never "matters of general"', async () => {
    const chart: any = await calculateBirthChart(P9, { refDate: NOW });
    const rahu = chart.planets.find((p: any) => p.name === 'Rahu');
    const nodes = { Rahu: { signIndex: rahu.signIndex - 1, house: rahu.house } };
    // A synthetic timeline whose running sub-period is Rahu, so the text exercises the node branch.
    const timeline = [{ lord: 'Venus', start: '2020-01-01T00:00:00Z', end: '2040-01-01T00:00:00Z',
      antardashas: [{ lord: 'Rahu', start: '2025-01-01T00:00:00Z', end: '2029-01-01T00:00:00Z' }] }];
    const f = buildPeriodForecast(timeline, chart.lagna.rashiIndex, NOW.getTime(), nodes);
    const y = f.yearly[0];
    expect(y.reason).not.toMatch(/matters of general/);
    expect(y.lead).not.toMatch(/most active in general/);
    expect(y.reason).toContain(`sits in your ${rahu.house}`);
    // P9: Vrischika Lagna, Rahu in the 11th = Kanya → dispositor Mercury.
    expect(rahu.house).toBe(11);
    expect(y.reason).toContain('Kanya');
    expect(y.reason).toContain('Mercury');
  });

  it('without placement data it still never says "matters of general"', () => {
    const timeline = [{ lord: 'Ketu', start: '2020-01-01T00:00:00Z', end: '2030-01-01T00:00:00Z', antardashas: [] }];
    const f = buildPeriodForecast(timeline, 0, NOW.getTime());
    expect(f.yearly[0].reason).not.toMatch(/matters of general/);
  });
});
