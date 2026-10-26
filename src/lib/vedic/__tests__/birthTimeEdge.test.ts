/**
 * Batch 8 (bug 3): Lagna / Moon birth-time edge notes.
 *
 * Reference: Swiss Ephemeris (pyswisseph, SIDM_LAHIRI, Placidus Ascendant, audit venv,
 * script scratchpad/b8/edges.py). Sign-change instants found by bisection to 0.1 s:
 *   Lucknow 26.8467N 80.9462E  — Ascendant Vrischika → Dhanu at 1996-08-31 08:20:25.7 UTC
 *   London 51.5074N 0.1278W    — Ascendant Kanya → Tula      at 1992-06-10 14:58:43.8 UTC
 *   Sydney 33.8688S 151.2093E  — Ascendant Makara → Kumbha   at 2001-12-24 22:48:35.3 UTC
 *   Moon (sidereal) Ashwini → Bharani at 1996-09-02 01:01:16.0 UTC (no sign change: 13°20′ Mesha)
 *   Moon (sidereal) Mesha → Vrisha   at 1996-09-03 07:30:35.2 UTC (no nakshatra change: inside Krittika)
 * Our engine's Lagna crossings agree with these to within 4 s; its Moon crossings are about
 * 40 s later (≈20″ in the Moon), so the Moon test times below are chosen so the whole-minute
 * answer is the same under both (the expected minute is the Swiss Ephemeris one).
 */
import { describe, it, expect } from 'vitest';
import { buildBirthTimeEdges, birthTimeEdgeNote } from '../engine/birthTimeEdge';
import { calculateLagna, getSiderealLongitude } from '../engine/vedicEngine';
import { calculateBirthChart } from '../calculateBirthChart';
import { toKundaliLegacy } from '../legacyAdapters';
import { chartBasisFromResult } from '../chartBasis';

const LKO = { lat: 26.8467, lon: 80.9462 };
const LON = { lat: 51.5074, lon: -0.1278 };
const SYD = { lat: -33.8688, lon: 151.2093 };
const LKO_CROSS = Date.parse('1996-08-31T08:20:25.744Z');
const LON_CROSS = Date.parse('1992-06-10T14:58:43.788Z');
const SYD_CROSS = Date.parse('2001-12-24T22:48:35.331Z');
const NAK_CROSS = Date.parse('1996-09-02T01:01:16.008Z');
const RASHI_CROSS = Date.parse('1996-09-03T07:30:35.222Z');

const edgesAt = (ms: number, p: { lat: number; lon: number }) => {
  const d = new Date(ms);
  return buildBirthTimeEdges(d, p.lat, p.lon, {
    Lagna: calculateLagna(d, p.lat, p.lon).ascSidereal,
    Moon: getSiderealLongitude('Moon', d),
  });
};
const lagnaEdge = (ms: number, p: { lat: number; lon: number }) => edgesAt(ms, p).find(e => e.point === 'Lagna');
const m = (min: number, s = 0) => (min * 60 + s) * 1000;

describe('Lagna edge (Swiss Ephemeris reference crossings)', () => {
  it('3m30s before the Lucknow change → within ±5 min, could be Dhanu', () => {
    expect(lagnaEdge(LKO_CROSS - m(3, 30), LKO)).toEqual({
      point: 'Lagna', current: 'Vrischika (Scorpio)', alternative: 'Dhanu (Sagittarius)', minutes: 4, window: 5,
    });
  });
  it('2m30s after it → Dhanu now, a slightly earlier time gives Vrischika', () => {
    expect(lagnaEdge(LKO_CROSS + m(2, 30), LKO)).toMatchObject({ current: 'Dhanu (Sagittarius)', alternative: 'Vrischika (Scorpio)', minutes: -3, window: 5 });
  });
  it('10m30s before → the softer ±15-minute note', () => {
    expect(lagnaEdge(LKO_CROSS - m(10, 30), LKO)).toMatchObject({ alternative: 'Dhanu (Sagittarius)', minutes: 11, window: 15 });
  });
  it('30 minutes before → no Lagna note', () => {
    expect(lagnaEdge(LKO_CROSS - m(30), LKO)).toBeUndefined();
  });
  it('London (high latitude) 4m30s before Kanya → Tula', () => {
    expect(lagnaEdge(LON_CROSS - m(4, 30), LON)).toMatchObject({ current: 'Kanya (Virgo)', alternative: 'Tula (Libra)', minutes: 5, window: 5 });
  });
  it('Sydney (southern hemisphere) 12m30s after Makara → Kumbha', () => {
    expect(lagnaEdge(SYD_CROSS + m(12, 30), SYD)).toMatchObject({ current: 'Kumbha (Aquarius)', alternative: 'Makara (Capricorn)', minutes: -13, window: 15 });
  });
});

describe('Moon edges (±5 minutes)', () => {
  it('nakshatra only: 1m50s after Ashwini → Bharani', () => {
    const e = edgesAt(NAK_CROSS + m(1, 50), LKO).filter(x => x.point !== 'Lagna');
    expect(e).toEqual([{ point: 'MoonNakshatra', current: 'Bharani', alternative: 'Ashwini', minutes: -2, window: 5 }]);
  });
  it('rashi only: 2m10s before Mesha → Vrisha', () => {
    const e = edgesAt(RASHI_CROSS - m(2, 10), LKO).filter(x => x.point !== 'Lagna');
    expect(e).toEqual([{ point: 'MoonRashi', current: 'Mesha (Aries)', alternative: 'Vrisha (Taurus)', minutes: 3, window: 5 }]);
  });
  it('no Moon note 20 minutes away from a change', () => {
    expect(edgesAt(RASHI_CROSS - m(20), LKO).filter(x => x.point !== 'Lagna')).toEqual([]);
  });
});

describe('note wording', () => {
  it('±5 minutes uses the calm founder wording', () => {
    const n = birthTimeEdgeNote({ point: 'Lagna', current: 'Vrischika (Scorpio)', alternative: 'Dhanu (Sagittarius)', minutes: 4, window: 5 });
    expect(n).toContain('Your rising sign (Lagna) is close to the edge between Vrischika (Scorpio) and Dhanu (Sagittarius) — if your birth time is off by a few minutes, it could be Dhanu (Sagittarius). Check your birth certificate time.');
    expect(n).toContain('about 4 minutes later');
  });
  it('±15 minutes is the softer note', () => {
    const n = birthTimeEdgeNote({ point: 'Lagna', current: 'Kumbha (Aquarius)', alternative: 'Makara (Capricorn)', minutes: -13, window: 15 });
    expect(n).toMatch(/fairly near the edge between Kumbha \(Aquarius\) and Makara \(Capricorn\)/);
    expect(n).toContain('about 13 minutes earlier');
  });
});

describe('wired into the chart, Kundali JSON and "Birth data used"', () => {
  // 13:47 IST = 08:17 UTC, 3m25.7s before the Lucknow change.
  const input = { year: 1996, month: 8, day: 31, hour: 13, minute: 47, latitude: LKO.lat, longitude: LKO.lon, timezoneOffset: 5.5 };
  it('chart result, legacy /api/kundali shape and chart basis all carry it', async () => {
    const r = await calculateBirthChart(input, { refDate: new Date('2026-10-26T00:00:00Z') });
    expect(r.lagna.sign).toBe('Vrischika');
    expect(r.birthTimeEdges).toEqual([{ point: 'Lagna', current: 'Vrischika (Scorpio)', alternative: 'Dhanu (Sagittarius)', minutes: 4, window: 5 }]);
    expect(toKundaliLegacy(r).birthTimeEdges).toEqual(r.birthTimeEdges);
    const tz = { timezone: 'Asia/Kolkata', utcOffsetHours: 5.5, utcOffsetLabel: 'UTC+05:30', utcISO: '1996-08-31T08:17:00.000Z', source: 'coordinates' as const, note: null };
    const notes = chartBasisFromResult(r, tz as any).notes;
    expect(notes.some(n => n.startsWith('Your rising sign (Lagna) is close to the edge'))).toBe(true);
    // the generic degree-based Lagna note is replaced, not shown twice
    expect(notes.some(n => n.startsWith('Lagna is near a sign boundary'))).toBe(false);
  });
  it('a time far from any edge gives no notes (P1 panel birth 13:04 IST)', async () => {
    const r = await calculateBirthChart({ ...input, minute: 4 }, { refDate: new Date('2026-10-26T00:00:00Z') });
    expect(r.birthTimeEdges).toEqual([]);
  });
});
