import { describe, it, expect } from 'vitest';
import { computePanchang, findMuhurats, scoreMuhurat, lunarMonthAt, type SunMoonFn } from '../panchang';
import { getSiderealLongitude } from '../engine/vedicEngine';

// Synthetic Sun/Moon so limb derivation is deterministic without the ephemeris.
const sm = (sun: number, moon: number): SunMoonFn => () => ({ sun, moon });

describe('Panchang limb derivation (Part I.9)', () => {
  it('Tithi: Moon 12° ahead of Sun = Dwitiya (Shukla)', () => {
    const p = computePanchang(new Date('2026-06-03T00:30:00Z'), sm(100, 112));
    expect(p.tithi).toBe(2); expect(p.tithiName).toBe('Dwitiya'); expect(p.paksha).toBe('Shukla');
  });
  it('Tithi: Moon ~180° ahead = Purnima; ~0° = Amavasya (Krishna)', () => {
    expect(computePanchang(new Date('2026-06-03T00:30:00Z'), sm(0, 175)).tithiName).toBe('Purnima');
    expect(computePanchang(new Date('2026-06-03T00:30:00Z'), sm(0, 355)).tithiName).toBe('Amavasya');
  });
  it('Nakshatra: Moon at 8° = Ashwini; at 100° = Pushya (8th, ~93.3-106.6°)', () => {
    expect(computePanchang(new Date('2026-06-03T00:30:00Z'), sm(0, 8)).nakshatra).toBe('Ashwini');
    expect(computePanchang(new Date('2026-06-03T00:30:00Z'), sm(0, 100)).nakshatra).toBe('Pushya');
  });
  it('Rahu Kalam differs by weekday (Friday = 10:30–12:00)', () => {
    // 2026-06-05 is a Friday
    const p = computePanchang(new Date('2026-06-05T00:30:00Z'), sm(0, 0));
    expect(p.weekday).toBe('Friday');
    expect(p.rahuKalam).toEqual({ start: '10:30', end: '12:00' });
  });
});

describe('Muhurat scoring & finder', () => {
  it('Pushya scores highest; Amavasya + Rikta tithi penalised', () => {
    const good = scoreMuhurat({ nakshatra: 'Pushya', tithi: 5, tithiName: 'Panchami', weekday: 'Wednesday', yoga: 'Siddhi' } as any, 'business');
    const bad = scoreMuhurat({ nakshatra: 'Ashlesha', tithi: 4, tithiName: 'Chaturthi', weekday: 'Tuesday', yoga: 'Vyatipata' } as any, 'business');
    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.reasons.join(' ')).toMatch(/Pushya/);
    expect(bad.reasons.join(' ')).toMatch(/Rikta|inauspicious/i);
  });

  it('Guru-Pushya (Pushya on Thursday) gets the special bonus', () => {
    const s = scoreMuhurat({ nakshatra: 'Pushya', tithi: 5, tithiName: 'Panchami', weekday: 'Thursday', yoga: 'Siddhi' } as any, 'business');
    expect(s.reasons.join(' ')).toMatch(/Guru-Pushya/);
  });

  it('findMuhurats returns one entry per day, each scored, some auspicious', () => {
    // synthetic Moon advances 13°/day so nakshatra/tithi vary across the range
    const base = Date.UTC(2026, 5, 1);
    const sunMoon: SunMoonFn = (d) => { const days = Math.round((d.getTime() - base) / 864e5); return { sun: (days * 1) % 360, moon: (days * 13.2) % 360 }; };
    const res = findMuhurats('general', new Date('2026-06-01T00:00:00Z'), 27, sunMoon);
    expect(res).toHaveLength(27);
    for (const r of res) { expect(typeof r.score).toBe('number'); expect(r.reasons.length).toBeGreaterThan(0); }
    expect(res.some(r => r.auspicious)).toBe(true);
  });
});

// ── Round-2 audit T4: Vivah exclusions ───────────────────────────────────────
// Window boundaries from Drik Panchang (New Delhi) calendar pages: Dhanu
// Sankranti 16 Dec 2026, Makara Sankranti 15 Jan 2027; Devshayani Ekadashi
// 14 Jul 2027, Devutthana Ekadashi 10 Nov 2027; Jyeshtha Adhika month 2026
// (Adhika Purnima 31 May 2026).

describe('Marriage Muhurat exclusions (round-2 T4)', () => {
  const real: SunMoonFn = d => ({ sun: getSiderealLongitude('Sun', d), moon: getSiderealLongitude('Moon', d) });

  it('Pushya is not favoured for marriage (but still is for business)', () => {
    const day = { nakshatra: 'Pushya', tithi: 5, tithiName: 'Panchami', paksha: 'Shukla', weekday: 'Friday', yoga: 'Siddhi' } as unknown as Parameters<typeof scoreMuhurat>[0];
    expect(scoreMuhurat(day, 'marriage').score).toBeLessThan(3);
    expect(scoreMuhurat(day, 'marriage').reasons.join(' ')).toMatch(/avoided for marriage/);
    expect(scoreMuhurat(day, 'business').score).toBeGreaterThanOrEqual(3);
  });

  it('no auspicious wedding dates in Kharmas or Chaturmas; 19 Feb 2027 (Pushya) is not offered', () => {
    const a = findMuhurats('marriage', new Date('2026-11-01T00:00:00Z'), 180, real).filter(d => d.auspicious).map(d => d.date);
    const b = findMuhurats('marriage', new Date('2027-07-01T00:00:00Z'), 180, real).filter(d => d.auspicious).map(d => d.date);
    expect(a.length).toBeGreaterThan(5);
    expect(a.filter(d => d >= '2026-12-16' && d < '2027-01-15')).toEqual([]);
    expect(a).not.toContain('2027-02-19');
    expect(b.filter(d => d >= '2027-07-14' && d <= '2027-11-10')).toEqual([]);
    expect(b.some(d => d > '2027-11-10')).toBe(true);
  }, 60000);

  it('identifies the 2026 Adhik Jyeshtha month', () => {
    const m = lunarMonthAt(new Date('2026-05-31T00:30:00Z'), real);
    expect(m.adhik).toBe(true); expect(m.name).toBe('Jyeshtha');
    expect(lunarMonthAt(new Date('2026-06-29T00:30:00Z'), real).adhik).toBe(false);
  });
});
