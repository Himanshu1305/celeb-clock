/**
 * Year muhurat lists (batch 9b): criteria unit tests, Asta calibration and the
 * comparison with Drik Panchang's published 2026 lists.
 *
 * Reference values:
 *  • fixtures/drikMuhurat2026.json — Drik Panchang's 2026 marriage and vehicle lists for
 *    New Delhi and Griha Pravesh list (served for Dubai), opened with WebFetch on
 *    29 Oct 2026; only the part of each page the site returned is recorded.
 *  • Drik Panchang Asta pages, New Delhi (opened 29 Oct 2026):
 *    drikpanchang.com/planet/asta/shukra-asta-date-time.html — Shukra Asta
 *    11 Dec 2025 06:35 → 1 Feb 2026 18:27 and 12 Oct 2026 18:19 → 29 Oct 2026 06:00;
 *    …/guru-asta-date-time.html — Guru Asta 15 Jul 2026 19:59 → 12 Aug 2026 05:03.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { buildYearMuhurat, panchangTimeline, astaPeriods, yearMuhuratFile, OCCASION_RULES, NAKSHATRA_NAMES, type Seg } from '../muhuratYear';
import { windowsForPlace, clock, type YearMuhuratData, type MuhuratWindow } from '../muhuratYearDays';
import { sunriseSunset } from '../panchangDay';
import fix from './fixtures/drikMuhurat2026.json';

const H = 3600000, D = 86400000;
const ist = (s: string) => Date.parse(s + ':00+05:30');

describe('windowsForPlace — the city step', () => {
  // A synthetic place: sunrise 06:00, sunset 18:00 UTC every day, tz 0.
  const sun = (iso: string) => { const t = Date.parse(iso + 'T00:00:00Z'); return { rise: t + 6 * H, set: t + 18 * H, nextRise: t + D + 6 * H }; };
  const day = (iso: string, h: number) => Date.parse(iso + 'T00:00:00Z') + h * H;
  const base = (over: Partial<YearMuhuratData> = {}): YearMuhuratData => ({
    type: 'marriage', year: 2027, pieces: [], blocks: [], rules: { avoidWeekdays: [], minMinutes: 5 }, ...over,
  });

  it('clips to the sunrise-to-sunrise day and merges touching pieces', () => {
    // 2027-03-02 is a Tuesday. One stretch 10:00→ next day 08:00 made of two pieces.
    const w = windowsForPlace(base({ pieces: [[day('2027-03-02', 10), day('2027-03-02', 20), 3, 1], [day('2027-03-02', 20), day('2027-03-03', 8), 4, 2]] }), sun, 0);
    expect(w).toHaveLength(2);
    expect(w[0]).toMatchObject({ date: '2027-03-02', weekday: 2, start: day('2027-03-02', 10), end: day('2027-03-03', 6), nakshatras: [3, 4], tithis: [1, 2] });
    expect(w[1]).toMatchObject({ date: '2027-03-03', start: day('2027-03-03', 6), end: day('2027-03-03', 8) });
  });

  it('drops avoided weekdays, short windows and any day a block touches', () => {
    const pieces: YearMuhuratData['pieces'] = [
      [day('2027-03-02', 10), day('2027-03-02', 12), 3, 1], // Tuesday
      [day('2027-03-04', 10), day('2027-03-04', 10) + 4 * 60000, 3, 1], // 4 minutes
      [day('2027-03-05', 10), day('2027-03-05', 12), 3, 1], // blocked by a period ending 06:30 that day
      [day('2027-03-06', 10), day('2027-03-06', 12), 3, 1],
    ];
    const w = windowsForPlace(base({ pieces, blocks: [[day('2027-03-04', 20), day('2027-03-05', 6.5), 'adhik']], rules: { avoidWeekdays: [2], minMinutes: 5 } }), sun, 0);
    expect(w.map(x => x.date)).toEqual(['2027-03-06']);
  });

  it('applies the daylight fraction and the "too late in the night" rule', () => {
    const p: YearMuhuratData['pieces'] = [[day('2027-03-06', 8), day('2027-03-07', 5), 3, 1], [day('2027-03-08', 21.5), day('2027-03-09', 2), 3, 1]];
    const fore = windowsForPlace(base({ pieces: p, rules: { avoidWeekdays: [], minMinutes: 5, dayFraction: 0.5 } }), sun, 0);
    expect(fore.map(x => [x.start, x.end])).toEqual([[day('2027-03-06', 8), day('2027-03-06', 12)]]);
    // Night 18:00→06:00 = 12 h; first fifth ends 20:24, so a 21:30 start is too late.
    const late = windowsForPlace(base({ pieces: p, rules: { avoidWeekdays: [], minMinutes: 5, latestStartNightFraction: 0.2 } }), sun, 0);
    expect(late.map(x => x.date)).toEqual(['2027-03-06']);
  });

  it('formats local clock times and flags times after midnight', () => {
    expect(clock(ist('2026-11-22T00:13'), '2026-11-21', 5.5)).toEqual({ hhmm: '00:13', nextDay: true });
    expect(clock(ist('2026-11-21T06:48'), '2026-11-21', 5.5)).toEqual({ hhmm: '06:48', nextDay: false });
  });
});

describe('occasion rules', () => {
  it('marriage uses the 11 Vivah Nakshatras and no tithi filter (Drik shows no "Prohibited Tithi")', () => {
    expect(OCCASION_RULES.marriage.nakshatras.map(i => NAKSHATRA_NAMES[i])).toEqual(['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati']);
    expect(OCCASION_RULES.marriage.tithis).toBeUndefined();
    expect(OCCASION_RULES.marriage.avoidSolarSigns).toEqual([5, 8, 11]);
  });
  it('vehicle allows Krishna but not Shukla Pratipada, and never Amavasya', () => {
    const t = OCCASION_RULES.vehicle.tithis!;
    expect(t).toContain(15); expect(t).not.toContain(0); expect(t).not.toContain(29); expect(t).toContain(14);
    expect(OCCASION_RULES.vehicle.day.avoidWeekdays).toEqual([2, 6]);
  });
  it('mundan is daytime-only in Makara, Kumbha, Mesha, Vrishabha, Mithuna; naamkaran is forenoon-only', () => {
    const ok = [0, 1, 2, 9, 10];
    for (let s = 0; s < 12; s++) expect(OCCASION_RULES.mundan.avoidSolarSigns!.includes(s)).toBe(!ok.includes(s));
    expect(OCCASION_RULES.mundan.day.dayFraction).toBe(1);
    expect(OCCASION_RULES.naamkaran.day.dayFraction).toBe(0.5);
    expect(OCCASION_RULES.naamkaran.avoidAsta).toBe(false);
  });
});

describe('Guru / Shukra Asta — calibrated to Drik Panchang (New Delhi)', () => {
  const near = (a: number, b: number, mins: number) => expect(Math.abs(a - b) / 60000).toBeLessThan(mins);
  it('Venus: Dec 2025–Feb 2026 and Oct 2026', () => {
    const v = astaPeriods('Venus', Date.UTC(2026, 0, 1), Date.UTC(2026, 11, 31));
    expect(v).toHaveLength(2);
    near(v[0].start, ist('2025-12-11T06:35'), 30); near(v[0].end, ist('2026-02-01T18:27'), 30);
    near(v[1].start, ist('2026-10-12T18:19'), 30); near(v[1].end, ist('2026-10-29T06:00'), 30);
  });
  it('Jupiter: Jul–Aug 2026', () => {
    const j = astaPeriods('Jupiter', Date.UTC(2026, 0, 1), Date.UTC(2026, 11, 31));
    expect(j).toHaveLength(1);
    near(j[0].start, ist('2026-07-15T19:59'), 30); near(j[0].end, ist('2026-08-12T05:03'), 30);
  });
});

// ── Comparison with Drik Panchang's published 2026 lists ────────────────────────
type FixType = 'marriage' | 'vehicle' | 'griha-pravesh';
interface FixEntry { date: string; start: string; startNextDay: boolean; end: string; endNextDay: boolean }
interface FixList { lat: number; lon: number; tz: number; coveredFrom: string; coveredTo: string; entries: FixEntry[] }

let timeline: Seg[];
beforeAll(() => { timeline = panchangTimeline(Date.UTC(2026, 0, 1) - 2 * D, Date.UTC(2027, 0, 1) + 2 * D); }, 60000);

function compare(type: FixType) {
  const F = (fix as unknown as Record<FixType, FixList>)[type];
  const b = buildYearMuhurat(type, 2026, timeline);
  const sun = (iso: string) => { const r = sunriseSunset(new Date(iso + 'T12:00:00Z'), F.lat, F.lon, F.tz); return { rise: r.rise.getTime(), set: r.set.getTime(), nextRise: r.nextRise.getTime() }; };
  const ours = windowsForPlace(b, sun, F.tz).filter(w => w.date >= F.coveredFrom && w.date <= F.coveredTo);
  const drikDays = new Set(F.entries.map(e => e.date)), ourDays = new Set(ours.map(w => w.date));
  const mins = (hhmm: string, next: boolean) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3)) + (next ? 1440 : 0);
  let timeOk = 0, timeTotal = 0;
  for (const e of F.entries) {
    const mine = ours.filter((w: MuhuratWindow) => w.date === e.date);
    if (mine.length === 0) continue;
    timeTotal++;
    const best = Math.min(...mine.map(w => {
      const s = clock(w.start, w.date, F.tz), en = clock(w.end, w.date, F.tz);
      return Math.max(Math.abs(mins(s.hhmm, s.nextDay) - mins(e.start, e.startNextDay)), Math.abs(mins(en.hhmm, en.nextDay) - mins(e.end, e.endNextDay)));
    }));
    if (best <= 5) timeOk++;
  }
  return {
    drik: drikDays.size, ours: ourDays.size,
    common: [...drikDays].filter(d => ourDays.has(d)).length,
    extra: [...ourDays].filter(d => !drikDays.has(d)),
    timeOk, timeTotal,
  };
}

describe('match with Drik Panchang 2026 (recorded values)', () => {
  it('marriage, New Delhi, 1 Jan – 18 Jul: 47 of 48 days, 1 extra; all 49 windows on shared days within 5 min', () => {
    const r = compare('marriage');
    // Drik-only: 24 Feb (04:26–06:50 pre-dawn, in Vishkambha Yoga); ours-only: 19 Apr (04:36–05:51 pre-dawn).
    expect(r).toMatchObject({ drik: 48, common: 47, timeOk: 49, timeTotal: 49 });
    expect(r.extra).toEqual(['2026-04-19']);
  });
  it('vehicle, New Delhi, 1 Jan – 2 Aug: 52 of 52 days, 1 extra; all windows within 5 min', () => {
    const r = compare('vehicle');
    expect(r).toMatchObject({ drik: 52, common: 52, timeOk: 52, timeTotal: 52 });
    expect(r.extra).toEqual(['2026-04-23']);
  });
  it('Griha Pravesh, Dubai, 1 Jan – 31 Jul: 22 of 22 days, 1 extra; all windows within 5 min', () => {
    const r = compare('griha-pravesh');
    expect(r).toMatchObject({ drik: 22, common: 22, timeOk: 22, timeTotal: 22 });
    expect(r.extra).toEqual(['2026-04-20']);
  });
});

describe('static files', () => {
  it('season gaps for 2026 marriage: Chaturmas from the festival engine, Kharmas, Adhik Jyeshtha', () => {
    const f = JSON.parse(readFileSync('src/data/muhuratYears/marriage-2026.json', 'utf8'));
    const k = (kind: string) => f.seasons.filter((s: { kind: string }) => s.kind === kind);
    expect(k('chaturmas')).toEqual([{ kind: 'chaturmas', label: expect.stringContaining('Devshayani'), from: '2026-07-25', to: '2026-11-20' }]);
    expect(k('adhik')[0]).toMatchObject({ label: 'Adhik Jyeshtha (leap month)', from: '2026-05-17', to: '2026-06-15' });
    expect(k('kharmas').map((s: { from: string }) => s.from)).toEqual(['2025-12-16', '2026-03-15', '2026-12-16']);
  });
  it('the committed marriage-2026 file is up to date (re-run scripts/gen-muhurat-years.mts if not)', () => {
    const delhiSun = (iso: string) => { const r = sunriseSunset(new Date(iso + 'T12:00:00Z'), 28.6139, 77.2090, 5.5); return { rise: r.rise.getTime(), set: r.set.getTime(), nextRise: r.nextRise.getTime() }; };
    const fresh = JSON.parse(JSON.stringify(yearMuhuratFile('marriage', 2026, timeline, delhiSun)));
    const committed = JSON.parse(readFileSync('src/data/muhuratYears/marriage-2026.json', 'utf8'));
    expect(fresh).toEqual(committed);
  }, 60000);
});
