/**
 * Audit K2 regressions: a year is split at the planet's REAL sign changes, not read
 * from a single date (30 June).
 *
 * Reference: Swiss Ephemeris (pyswisseph, SIDM_LAHIRI, audit venv) sidereal ingresses,
 * converted to IST calendar dates (the Drik Panchang convention):
 *   Saturn  Meena → Mesha 3 Jun 2027 (05:29 IST), Mesha → Meena 20 Oct 2027 (07:13 IST)
 *   Jupiter Simha → Karka 25 Jan 2027, Karka → Simha 26 Jun 2027, Simha → Kanya 26 Nov 2027
 */
import { describe, it, expect } from 'vitest';
import { computeYearTransit } from '../transits';
import { computeRashifal } from '../rashifal';

describe('/transit/<planet>/<year> splits the year at real sign changes (audit K2)', () => {
  it('Saturn 2027: Meena → Mesha → Meena with the Swiss Ephemeris dates', () => {
    const t = computeYearTransit('saturn', 2027);
    expect(t.signs.map(s => s.sign)).toEqual(['Meena', 'Mesha', 'Meena']);
    expect(t.ingress.map(({ date, sign }) => ({ date, sign }))).toEqual([{ date: '2027-06-03', sign: 'Mesha' }, { date: '2027-10-20', sign: 'Meena' }]);
  });

  it('Saturn 2027 for Kumbha Moon: Sade Sati (2nd house) dominates; Mesha stretch read separately', () => {
    const k = computeYearTransit('saturn', 2027).perSign.find(s => s.moonSign === 'Kumbha')!;
    expect(k.house).toBe(2);
    expect(k.sadeSati).toBe(true);
    expect(k.phases.map(p => p.house)).toEqual([2, 3, 2]);
    expect(k.phases[1].fromISO).toBe('2027-06-03');
    expect(k.phases[1].toISO).toBe('2027-10-20');
  });

  it('Jupiter 2027 ingress dates match Swiss Ephemeris (IST)', () => {
    const t = computeYearTransit('jupiter', 2027);
    expect(t.ingress.map(({ date, sign }) => ({ date, sign }))).toEqual([
      { date: '2027-01-25', sign: 'Karka' },
      { date: '2027-06-26', sign: 'Simha' },
      { date: '2027-11-26', sign: 'Kanya' },
    ]);
  });

  it('a year with no sign change keeps a single stretch (Saturn 2026 in Meena)', () => {
    const t = computeYearTransit('saturn', 2026);
    expect(t.signs).toHaveLength(1);
    expect(t.perSign.every(s => s.phases.length === 1)).toBe(true);
  });
});

describe('Yearly Rashifal splits the year at real sign changes (audit K2)', () => {
  const REF = new Date('2027-03-01T00:00:00Z');

  it('Kumbha 2027 is not "broadly supportive" while in Sade Sati, and names the Sade Sati stretches', () => {
    const r = computeRashifal(10, 'year', REF);
    expect(r.overallTone).not.toBe('favourable');
    const overview = r.sections[0].text;
    expect(overview).not.toContain('broadly supportive');
    expect(overview).toContain('Sade Sati');
    expect(overview).toContain('1 Jan – 3 Jun 2027');
    expect(overview).toContain('20 Oct – 31 Dec 2027');
  });

  it('lists every slow-planet sign change in the year, incl. the retrograde return', () => {
    const r = computeRashifal(10, 'year', REF);
    const all = r.ingress.join(' | ');
    expect(all).toContain('Saturn enters Mesha (Aries) on 3 June 2027');
    expect(all).toContain('Saturn enters Meena (Pisces) on 20 October 2027');
    expect(all).toContain('Jupiter enters Karka (Cancer) on 25 January 2027');
  });

  it('Saturn readings carry their own date ranges and cover the whole year', () => {
    const r = computeRashifal(10, 'year', REF);
    const sat = r.transits.filter(t => t.planet === 'Saturn');
    expect(sat.map(t => t.house)).toEqual([2, 3, 2]);
    const share = sat.reduce((a, t) => a + (t.share ?? 0), 0);
    expect(share).toBeGreaterThan(0.99);
    expect(share).toBeLessThan(1.01);
  });
});
