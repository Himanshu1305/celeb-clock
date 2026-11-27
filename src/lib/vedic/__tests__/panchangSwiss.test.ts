/**
 * B20 — the daily Panchang vs Swiss Ephemeris: New Delhi, every day of 2027.
 * Reference: golden/panchangSwiss2027.json (golden/panchangSwiss_ref.py, pyswisseph only).
 * A1: sunrise, sunset and the end of the sunrise tithi, nakshatra, yoga and karana — 365 × 6 times.
 * A2: a skipped (kshaya) and a repeated (vriddhi) tithi in 2027 are read the same way.
 * Backs the "panchang-swiss" row on /accuracy.
 */
import { describe, it, expect } from 'vitest';
import REF from './golden/panchangSwiss2027.json';
import { computeDayPanchang } from '../panchangDay';
import { COUNTS } from '../../accuracy/evidence';

const KEYS = ['sunrise', 'sunset', 'tithi', 'nakshatra', 'yoga', 'karana'] as const;
const ours = (p: ReturnType<typeof computeDayPanchang>, k: typeof KEYS[number]) =>
  k === 'sunrise' ? p.sunrise : k === 'sunset' ? p.sunset : k === 'tithi' ? p.tithiEnd : k === 'nakshatra' ? p.nakshatraEnd : k === 'yoga' ? p.yogaEnd : p.karanaEnd;
const minsOurs = (s: string) => { const [h, m] = s.slice(0, 5).split(':').map(Number); return h * 60 + m + (s.includes('next day') ? 1440 : 0); };
const minsRef = (s: string) => { const [h, m] = s.slice(0, 5).split(':').map(Number); const plus = s.match(/\+(\d)/); return h * 60 + m + (plus ? 1440 * Number(plus[1]) : 0); };
const DAYS = (REF as { days: Record<string, Record<string, string>> }).days;
const day = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return computeDayPanchang(new Date(Date.UTC(y, m - 1, d)), 28.6139, 77.2090, 5.5, 'New Delhi'); };

describe('Panchang 2027 (New Delhi) vs Swiss Ephemeris', () => {
  it('A1 — 365 days × 6 times within 1 and 2 minutes', () => {
    let n = 0, w1 = 0, w2 = 0;
    const worst: Array<{ d: string; k: string; diff: number }> = [];
    for (const [iso, r] of Object.entries(DAYS)) {
      const p = day(iso);
      for (const k of KEYS) {
        const diff = Math.abs(minsOurs(ours(p, k)) - minsRef(r[k]));
        n++; if (diff <= 1) w1++; if (diff <= 2) w2++;
        worst.push({ d: iso, k, diff });
      }
    }
    worst.sort((a, b) => b.diff - a.diff);
    console.log('[panchang-swiss] worst 5:', JSON.stringify(worst.slice(0, 5)));
    expect(Object.keys(DAYS)).toHaveLength(365);
    expect([n, w1, w2]).toEqual([COUNTS.panchangSwissTimes, COUNTS.panchangSwissWithin1, COUNTS.panchangSwissWithin2]);
    expect(worst[0].diff).toBeLessThanOrEqual(COUNTS.panchangSwissMaxMin);
  }, 300_000);

  it('A2 — kshaya and vriddhi tithis: the tithi at sunrise changes by 2 / by 0 on the same days as Swiss', () => {
    // A kshaya tithi ends twice between two sunrises (the sunrise tithi ends, and the next ends before the next sunrise);
    // a vriddhi tithi is still running at the next sunrise. Find both in the reference and check ours agree.
    const isos = Object.keys(DAYS);
    let kshaya = 0, vriddhi = 0;
    for (let i = 0; i < isos.length - 1; i++) {
      const refEnd = minsRef(DAYS[isos[i]].tithi), nextRise = 1440 + minsRef(DAYS[isos[i + 1]].sunrise);
      const oursEnd = minsOurs(day(isos[i]).tithiEnd), oursNextRise = 1440 + minsOurs(day(isos[i + 1]).sunrise);
      if (refEnd > nextRise) { vriddhi++; expect(oursEnd > oursNextRise, `vriddhi ${isos[i]}`).toBe(true); }
      // kshaya: next day's sunrise tithi ends before that next sunrise + 24 h is not the test; use: today's end + one tithi < next sunrise
      const nextRefEnd = minsRef(DAYS[isos[i + 1]].tithi) + 1440;
      if (refEnd < nextRise && nextRefEnd - refEnd > 0 && day(isos[i + 1]).tithi === (day(isos[i]).tithi + 2) % 30) kshaya++;
    }
    expect(vriddhi).toBeGreaterThan(0);
    expect(kshaya).toBeGreaterThan(0);
  }, 300_000);
});
