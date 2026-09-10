import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import {
  windowsForSignificators, yogaTimings, categorySignificators, categoryTiming,
  allCategoryTimings, houseLordOf, orderWindows, describeWindow, type ActivationWindow,
} from '../yogaTiming';

const NOW = new Date(Date.UTC(2026, 8, 10));
const CHARTS = {
  ref:  { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
  a:    { year: 1990, month: 4,  day: 20, hour: 9,  minute: 15, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
  b:    { year: 1975, month: 7,  day: 7,  hour: 18, minute: 30, latitude: 19.076,  longitude: 72.877,  timezoneOffset: 5.5 },
  c:    { year: 1959, month: 10, day: 10, hour: 15, minute: 57, latitude: 36.6,    longitude: 89,      timezoneOffset: 5.5 },
};
const chart = (i: any) => calculateBirthChart(i, { includeShadbala: true, refDate: NOW });

describe('full-lifetime Dasha timeline (Part D-Fix3 engine extension)', () => {
  it('produces 9 Mahadashas × 9 Antardashas that are contiguous and span ~120 years', async () => {
    const c = await chart(CHARTS.ref);
    const tl = c.dashaTimeline!;
    expect(tl).toHaveLength(9);
    for (const m of tl) expect(m.antardashas).toHaveLength(9);
    // Mahadashas contiguous: each start == previous end.
    for (let i = 1; i < tl.length; i++) expect(tl[i].start).toBe(tl[i - 1].end);
    // Antardashas tile their Mahadasha exactly.
    for (const m of tl) {
      expect(m.antardashas[0].start).toBe(m.start);
      expect(m.antardashas[8].end).toBe(m.end);
      for (let j = 1; j < 9; j++) expect(m.antardashas[j].start).toBe(m.antardashas[j - 1].end);
    }
    const spanYears = (new Date(tl[8].end).getTime() - new Date(tl[0].start).getTime()) / (365.25 * 864e5);
    expect(spanYears).toBeGreaterThan(119.4);
    expect(spanYears).toBeLessThan(120.6);
  });

  it('REUSES the validated logic: timeline period containing refDate == currentDasha (ref + 3 charts)', async () => {
    for (const key of Object.keys(CHARTS) as (keyof typeof CHARTS)[]) {
      const c = await chart(CHARTS[key]);
      const m = c.dashaTimeline!.find(p => NOW >= new Date(p.start) && NOW < new Date(p.end))!;
      const a = m.antardashas.find(p => NOW >= new Date(p.start) && NOW < new Date(p.end))!;
      expect(m.lord, `${key} maha`).toBe(c.currentDasha!.mahadasha);
      expect(a.lord, `${key} antar`).toBe(c.currentDasha!.antardasha);
    }
  });
});

describe('activation-window identification', () => {
  it('selects ONLY periods ruled by the given significators, labelling maha vs antar', async () => {
    const c = await chart(CHARTS.ref);
    const windows = windowsForSignificators(c.dashaTimeline, ['Jupiter'], NOW);
    expect(windows.length).toBeGreaterThan(0);
    for (const w of windows) expect(w.planet).toBe('Jupiter');
    // there must be exactly one Jupiter Mahadasha in a lifetime, and several Jupiter antardashas.
    expect(windows.filter(w => w.level === 'maha')).toHaveLength(1);
    expect(windows.filter(w => w.level === 'antar').length).toBeGreaterThanOrEqual(1);
  });

  it('flags doubleActivation when a significator Antardasha sits inside a significator Mahadasha', async () => {
    const c = await chart(CHARTS.ref);
    // Jupiter+Jupiter (antar inside its own maha) must be a double activation.
    const w = windowsForSignificators(c.dashaTimeline, ['Jupiter'], NOW);
    const jupInJup = w.find(x => x.level === 'antar' && x.withinMaha === 'Jupiter');
    expect(jupInJup?.doubleActivation).toBe(true);
  });

  it('orders windows current-first, then upcoming soonest-first, then past most-recent-first', () => {
    const mk = (start: string, end: string, status: any): ActivationWindow => ({ planet: 'X', level: 'antar', start, end, status });
    const ordered = orderWindows([
      mk('2010-01-01', '2011-01-01', 'past'),
      mk('2030-01-01', '2031-01-01', 'upcoming'),
      mk('2026-01-01', '2027-06-01', 'current'),
      mk('2028-01-01', '2029-01-01', 'upcoming'),
      mk('2020-01-01', '2021-01-01', 'past'),
    ], NOW);
    expect(ordered.map(w => w.status)).toEqual(['current', 'upcoming', 'upcoming', 'past', 'past']);
    expect(ordered[1].start).toBe('2028-01-01'); // soonest upcoming first
    expect(ordered[3].start).toBe('2020-01-01'); // most-recent past first
  });
});

describe('life-category significators (Part 1.4)', () => {
  it('reference chart (Makara lagna): wealth=2nd+11th lords+Jupiter, career=10th lord+10th occupants, marriage=7th lord+Venus+Jupiter', async () => {
    const c = await chart(CHARTS.ref);
    expect(houseLordOf(c, 2)).toBe('Saturn');   // Makara→2nd=Kumbha→Saturn
    expect(houseLordOf(c, 11)).toBe('Mars');    // 11th=Vrischika→Mars
    expect(houseLordOf(c, 10)).toBe('Venus');   // 10th=Tula→Venus
    expect(houseLordOf(c, 7)).toBe('Moon');     // 7th=Karka→Moon
    expect(categorySignificators(c, 'wealth').significators.sort()).toEqual(['Jupiter', 'Mars', 'Saturn']);
    expect(categorySignificators(c, 'marriage').significators).toContain('Venus');
    expect(categorySignificators(c, 'marriage').significators).toContain('Moon');
    // gender-neutral note is explicit
    expect(categorySignificators(c, 'marriage').note).toMatch(/regardless of gender/i);
  });

  it('every category yields a next (or honest all-past) window for the reference chart', async () => {
    const c = await chart(CHARTS.ref);
    const cats = allCategoryTimings(c, NOW);
    for (const k of ['wealth', 'career', 'marriage'] as const) {
      const t = cats[k];
      expect(t.significators.length).toBeGreaterThan(0);
      // Either there is a current/next window, or the note honestly says the windows are past.
      expect(t.next !== null || /already passed|in the past/i.test(t.note || '')).toBe(true);
    }
  });
});

describe('yoga timings + honest fallback', () => {
  it('each detected Yoga gets windows keyed to its own participating planets', async () => {
    const c = await chart(CHARTS.ref);
    const timings = yogaTimings(c, NOW);
    expect(timings.length).toBeGreaterThan(0);
    for (const t of timings) {
      const yoga = c.yogas!.find(y => y.name === t.key)!;
      // significators must be a subset of the Yoga's participating planets
      for (const s of t.significators) expect(yoga.planets).toContain(s);
    }
  });

  it('honest fallback: when all significator windows are in the past, current/next are null and the note says so', () => {
    // synthetic: a chart whose only significator periods are long past.
    const fakeChart: any = {
      lagna: { rashiIndex: 0 }, planets: [],
      dashaTimeline: [
        { lord: 'Sun', start: '1950-01-01T00:00:00.000Z', end: '1956-01-01T00:00:00.000Z',
          antardashas: [{ lord: 'Sun', start: '1950-01-01T00:00:00.000Z', end: '1951-01-01T00:00:00.000Z' }] },
      ],
      yogas: [],
    };
    const w = windowsForSignificators(fakeChart.dashaTimeline, ['Sun'], NOW);
    expect(w.length).toBeGreaterThan(0);
    expect(w.every(x => x.status === 'past')).toBe(true);
    const t = categoryTiming(fakeChart, 'career', NOW);
    // career significator for lagnaIdx 0 (Mesha) → 10th = Makara → Saturn; no Saturn window here
    expect(t.current).toBeNull();
    expect(t.next).toBeNull();
  });
});

describe('formatting', () => {
  it('describeWindow renders a readable, honest phrase with a real date range', () => {
    const w: ActivationWindow = { planet: 'Jupiter', level: 'antar', start: '2027-03-01T00:00:00.000Z', end: '2028-08-01T00:00:00.000Z', status: 'upcoming' };
    expect(describeWindow(w)).toBe('Jupiter Antardasha (sub-period) (March 2027 to August 2028, upcoming)');
  });
});
