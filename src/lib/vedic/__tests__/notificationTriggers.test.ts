import { describe, it, expect } from 'vitest';
import { detectChartEvents, filterDueEvents, type ChartEvent } from '../notificationTriggers';
import { calculateBirthChart } from '../calculateBirthChart';

const NOW = new Date('2026-09-13T00:00:00Z');
const inDays = (n: number) => new Date(NOW.getTime() + n * 86400000).toISOString();

describe('detectChartEvents — deterministic trigger detection', () => {
  it('POSITIVE: antardasha ending within horizon is detected', () => {
    const ev = detectChartEvents({ now: NOW, currentDasha: { mahadasha: 'Venus', mahadasha_end: inDays(900), antardasha: 'Saturn', antardasha_end: inDays(20) } });
    const a = ev.find(e => e.type === 'dasha-antar');
    expect(a).toBeTruthy();
    expect(a!.title).toMatch(/Saturn sub-period/);
    expect(a!.key).toContain('dasha-antar:Saturn');
  });

  it('POSITIVE: mahadasha ending soon detected; antardasha on the SAME date not duplicated', () => {
    const end = inDays(10);
    const ev = detectChartEvents({ now: NOW, currentDasha: { mahadasha: 'Venus', mahadasha_end: end, antardasha: 'Venus', antardasha_end: end } });
    expect(ev.filter(e => e.type === 'dasha-maha')).toHaveLength(1);
    expect(ev.filter(e => e.type === 'dasha-antar')).toHaveLength(0); // same date → no dup
  });

  it('POSITIVE: active Sade Sati produces a calm awareness event', () => {
    const ev = detectChartEvents({ now: NOW, sadeSati: { active: true, phase: 'Peak (on Moon sign)' }, sadeSatiCycleEnd: inDays(400) });
    const s = ev.find(e => e.type === 'sade-sati')!;
    expect(s).toBeTruthy();
    expect(s.body).toMatch(/not a verdict/);        // non-fear framing
    expect(s.body).not.toMatch(/doom|danger|curse/i);
  });

  it('POSITIVE: upcoming favourable window starting soon detected', () => {
    const ev = detectChartEvents({ now: NOW, upcomingWindows: [{ label: 'Career', planet: 'Jupiter', start: inDays(30), end: inDays(400) }] });
    const w = ev.find(e => e.type === 'favorable-window')!;
    expect(w.title).toMatch(/favourable Career window/);
  });

  it('EDGE: events beyond the horizon or in the past are NOT detected', () => {
    const far = detectChartEvents({ now: NOW, currentDasha: { mahadasha: 'Venus', mahadasha_end: inDays(900), antardasha: 'Saturn', antardasha_end: inDays(400) } });
    expect(far.filter(e => e.type === 'dasha-antar')).toHaveLength(0);
    const past = detectChartEvents({ now: NOW, currentDasha: { mahadasha: 'Venus', mahadasha_end: inDays(900), antardasha: 'Saturn', antardasha_end: inDays(-5) } });
    expect(past.filter(e => e.type === 'dasha-antar')).toHaveLength(0);
  });

  it('NEGATIVE: empty input → no events', () => {
    expect(detectChartEvents({ now: NOW })).toHaveLength(0);
  });
});

describe('filterDueEvents — frequency/retention bound (cooldown)', () => {
  const ev: ChartEvent[] = [{ type: 'dasha-antar', key: 'k1', title: 't', body: 'b', whenISO: inDays(10) }];
  it('a never-shown event is due', () => {
    expect(filterDueEvents(ev, {}, NOW)).toHaveLength(1);
  });
  it('an event shown within the cooldown is suppressed', () => {
    expect(filterDueEvents(ev, { k1: inDays(-5) }, NOW, 30)).toHaveLength(0);
  });
  it('the same event is due again after the cooldown passes', () => {
    expect(filterDueEvents(ev, { k1: inDays(-40) }, NOW, 30)).toHaveLength(1);
  });
});

describe('detectChartEvents — against a REAL computed chart', () => {
  it('assembles from calculateBirthChart output and returns valid, dated events (no crash)', async () => {
    const chart: any = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 14, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 }, { refDate: NOW });
    const cd = chart.currentDasha;
    const events = detectChartEvents({
      now: NOW,
      currentDasha: cd ? { mahadasha: cd.mahadasha, mahadasha_end: cd.mahadasha_end, antardasha: cd.antardasha, antardasha_end: cd.antardasha_end } : null,
      sadeSati: chart.doshas?.sadeSati ? { active: chart.doshas.sadeSati.active, phase: chart.doshas.sadeSati.phase } : null,
      horizonDays: 3660, // wide horizon so this real chart deterministically yields the next Dasha change
    });
    // every event must be well-formed and dated in a sane range
    for (const e of events) {
      expect(e.key).toBeTruthy();
      expect(e.title.length).toBeGreaterThan(5);
      expect(Number.isFinite(new Date(e.whenISO).getTime())).toBe(true);
    }
    // with a multi-year horizon, a real chart must surface at least the next Dasha change
    expect(events.some(e => e.type === 'dasha-antar' || e.type === 'dasha-maha')).toBe(true);
  });
});
