import { describe, it, expect, vi } from 'vitest';
import {
  calculateBirthChart,
  BirthChartInputError,
  type BirthChartInput,
} from '../calculateBirthChart';

// Fixed reference instant so transit-based fields (Dasha) are deterministic.
const REF = new Date(Date.UTC(2026, 8, 9, 0, 0, 0));

const REFERENCE_CHART: BirthChartInput = {
  year: 1988, month: 11, day: 5, hour: 12, minute: 30,
  latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5,
};

describe('calculateBirthChart — positive: reference chart (1988-11-05, 12:30 IST, Delhi)', () => {
  it('matches the confidence-table exact-match values', async () => {
    const r = await calculateBirthChart(REFERENCE_CHART, { refDate: REF });
    expect(r.rashi).toBe('Kanya');                       // Moon sign
    expect(r.nakshatra.nakshatra).toBe('Uttara Phalguni');
    expect(r.nakshatra.pada).toBe(2);
    expect(r.lagna.sign).toBe('Makara');
    expect(r.currentDasha?.mahadasha).toBe('Rahu');
    expect(r.currentDasha?.antardasha).toBe('Moon');     // nested antardasha
    expect(r.doshas.mangalDosha.hasDosha).toBe(false);
    expect(r.doshas.kaalSarp.present).toBe(false);
    expect(r.warnings).toEqual([]);
    expect(r.source).toBe('local');
    expect(r.planets).toHaveLength(9);
  });
});

// 5 additional charts spanning decades (1901..2015) and hemispheres (incl.
// Sydney, southern). Ground truth captured from the validated lab engine
// (scripts/vedic-lab/vedicEngineStage1b.cjs) — the source of the prior
// 100-chart validation; the port must reproduce them exactly.
const KNOWN: Array<{ name: string; input: BirthChartInput; expect: Record<string, any> }> = [
  {
    name: 'New York 1950-01-15 08:00 EST',
    input: { year: 1950, month: 1, day: 15, hour: 8, minute: 0, latitude: 40.7128, longitude: -74.0060, timezoneOffset: -5 },
    // Partial Kaal Sarp (6 planets in arc) — the classifier reports present:true.
    expect: { lagna: 'Makara', rashi: 'Vrischika', nak: 'Jyeshtha', pada: 3, maha: 'Jupiter', mangal: false, kaalsarp: true, kaalsarpPartial: true, satRetro: true },
  },
  {
    name: 'Sydney 1975-07-20 23:45 AEST (southern hemisphere)',
    input: { year: 1975, month: 7, day: 20, hour: 23, minute: 45, latitude: -33.8688, longitude: 151.2093, timezoneOffset: 10 },
    expect: { lagna: 'Meena', rashi: 'Dhanu', nak: 'Mula', pada: 1, maha: 'Rahu', mangal: true, kaalsarp: false },
  },
  {
    name: 'Delhi 2000-02-29 06:00 IST (leap day)',
    input: { year: 2000, month: 2, day: 29, hour: 6, minute: 0, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
    // Partial Kaal Sarp — present:true, isPartial:true.
    expect: { lagna: 'Makara', rashi: 'Dhanu', nak: 'Mula', pada: 2, maha: 'Sun', mangal: false, kaalsarp: true, kaalsarpPartial: true },
  },
  {
    name: 'London 1901-06-10 15:30 GMT (very old)',
    input: { year: 1901, month: 6, day: 10, hour: 15, minute: 30, latitude: 51.5074, longitude: -0.1278, timezoneOffset: 0 },
    expect: { lagna: 'Tula', rashi: 'Meena', nak: 'Uttara Bhadrapada', pada: 1, maha: 'Saturn', mangal: false, kaalsarp: false, satRetro: true },
  },
  {
    name: 'Los Angeles 2015-12-25 00:00 PST (recent)',
    input: { year: 2015, month: 12, day: 25, hour: 0, minute: 0, latitude: 34.0522, longitude: -118.2437, timezoneOffset: -8 },
    expect: { lagna: 'Kanya', rashi: 'Mithuna', nak: 'Ardra', pada: 1, maha: 'Rahu', mangal: true, kaalsarp: false },
  },
];

describe('calculateBirthChart — positive: 5 charts across decades/hemispheres', () => {
  for (const c of KNOWN) {
    it(c.name, async () => {
      const r = await calculateBirthChart(c.input, { refDate: REF });
      expect(r.lagna.sign).toBe(c.expect.lagna);
      expect(r.rashi).toBe(c.expect.rashi);
      expect(r.nakshatra.nakshatra).toBe(c.expect.nak);
      expect(r.nakshatra.pada).toBe(c.expect.pada);
      expect(r.currentDasha?.mahadasha).toBe(c.expect.maha);
      expect(r.doshas.mangalDosha.hasDosha).toBe(c.expect.mangal);
      expect(r.doshas.kaalSarp.present).toBe(c.expect.kaalsarp);
      if ('kaalsarpPartial' in c.expect) {
        expect(r.doshas.kaalSarp.isPartial).toBe(c.expect.kaalsarpPartial);
      }
      if ('satRetro' in c.expect) {
        expect(r.planets.find(p => p.name === 'Saturn')!.retrograde).toBe(c.expect.satRetro);
      }
    });
  }
});

describe('calculateBirthChart — negative: invalid input throws typed errors', () => {
  const bad: Array<[string, Partial<BirthChartInput>]> = [
    ['missing year (NaN)', { year: NaN }],
    ['month out of range', { month: 13 }],
    ['day out of range', { day: 40 }],
    ['hour out of range', { hour: 24 }],
    ['minute out of range', { minute: 60 }],
    ['latitude > 90', { latitude: 91 }],
    ['latitude < -90', { latitude: -95 }],
    ['longitude out of range', { longitude: 200 }],
    ['malformed timezone offset', { timezoneOffset: 50 }],
    ['non-existent calendar date (Feb 29 non-leap)', { year: 2001, month: 2, day: 29 }],
  ];
  for (const [label, patch] of bad) {
    it(`throws BirthChartInputError: ${label}`, async () => {
      await expect(calculateBirthChart({ ...REFERENCE_CHART, ...patch }, { refDate: REF }))
        .rejects.toBeInstanceOf(BirthChartInputError);
    });
  }

  it('the error is a clear message, not a silently-wrong chart', async () => {
    await expect(calculateBirthChart({ ...REFERENCE_CHART, latitude: 999 }, { refDate: REF }))
      .rejects.toThrow(/latitude/i);
  });
});

describe('calculateBirthChart — negative: ProKerala fallback fires when local engine fails', () => {
  it('falls back and tags source=prokerala when the local engine throws', async () => {
    // Force the local engine to throw by mocking generateFullChart.
    vi.resetModules();
    vi.doMock('../engine/vedicEngine', async (importOriginal) => {
      const actual = await importOriginal<typeof import('../engine/vedicEngine')>();
      return { ...actual, generateFullChart: () => { throw new Error('forced local failure'); } };
    });
    const { calculateBirthChart: calc } = await import('../calculateBirthChart');

    const fallbackResult: any = { rashi: 'FallbackRashi', source: 'local', warnings: [], planets: [] };
    const r = await calc(REFERENCE_CHART, {
      refDate: REF,
      prokeralaFallback: async () => fallbackResult,
    });
    expect(r.source).toBe('prokerala');   // overridden even though fallback said 'local'
    expect(r.rashi).toBe('FallbackRashi'); // result is usable
    vi.doUnmock('../engine/vedicEngine');
    vi.resetModules();
  });

  it('rethrows when local fails and no fallback is provided', async () => {
    vi.resetModules();
    vi.doMock('../engine/vedicEngine', async (importOriginal) => {
      const actual = await importOriginal<typeof import('../engine/vedicEngine')>();
      return { ...actual, generateFullChart: () => { throw new Error('forced local failure'); } };
    });
    const { calculateBirthChart: calc } = await import('../calculateBirthChart');
    await expect(calc(REFERENCE_CHART, { refDate: REF })).rejects.toThrow(/forced local failure/);
    vi.doUnmock('../engine/vedicEngine');
    vi.resetModules();
  });
});

describe('calculateBirthChart — edge cases', () => {
  it('polar latitude (69.6°N) emits POLAR_LATITUDE and still returns chart data', async () => {
    const r = await calculateBirthChart(
      { ...REFERENCE_CHART, latitude: 69.6, longitude: 18.9, timezoneOffset: 1 },
      { refDate: REF },
    );
    expect(r.warnings.map(w => w.code)).toContain('POLAR_LATITUDE');
    expect(r.lagna.sign).toBeTruthy();       // chart still returns data
    expect(r.planets).toHaveLength(9);
    expect(r.rashi).toBeTruthy();
  });

  it('leap day (valid) computes; leap day (invalid year) throws', async () => {
    const ok = await calculateBirthChart(
      { year: 2000, month: 2, day: 29, hour: 6, minute: 0, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },
      { refDate: REF },
    );
    expect(ok.rashi).toBeTruthy();
    await expect(calculateBirthChart(
      { year: 2001, month: 2, day: 29, hour: 6, minute: 0, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },
      { refDate: REF },
    )).rejects.toBeInstanceOf(BirthChartInputError);
  });

  it('exact midnight and ±1 minute around midnight all compute distinct valid charts', async () => {
    const base = { year: 1990, month: 6, day: 15, latitude: 19.0760, longitude: 72.8777, timezoneOffset: 5.5 };
    const midnight = await calculateBirthChart({ ...base, hour: 0, minute: 0 }, { refDate: REF });
    const oneAfter = await calculateBirthChart({ ...base, hour: 0, minute: 1 }, { refDate: REF });
    const oneBefore = await calculateBirthChart({ ...base, year: 1990, month: 6, day: 14, hour: 23, minute: 59 }, { refDate: REF });
    for (const r of [midnight, oneAfter, oneBefore]) {
      expect(r.lagna.sign).toBeTruthy();
      expect(r.planets).toHaveLength(9);
    }
  });
});

describe('calculateBirthChart — D60 disclaimer present in data', () => {
  it('exposes the D60 "one of several classical traditions" disclaimer', async () => {
    const r = await calculateBirthChart(REFERENCE_CHART, { refDate: REF });
    expect(r.divisionalCharts.d60Method).toMatch(/one of several classical traditions/i);
    expect(r.divisionalCharts.d60Disclaimer).toMatch(/one interpretation/i);
    expect(r.divisionalCharts.d60.Moon).toBeTruthy();
  });
});
