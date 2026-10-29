/**
 * Batch 10 — Janma Tithi (Hindu birthday) engine, src/lib/vedic/janmaTithi.ts.
 *
 * References:
 *  A. Swiss Ephemeris 2.10.03 (pyswisseph, Lahiri, swe.rise_trans sunrise at New Delhi) —
 *     an independent re-implementation of the same stated rules (scratchpad script
 *     b10t/janma_se.py, run 29 Oct 2026); its output is pasted below verbatim. Drik
 *     Panchang's birthday calculator could not be fetched from the build environment.
 *  B. Drik Panchang New Delhi Purnima dates for 2026, 2027 and 2037 (the same lists as
 *     src/lib/vedic/__tests__/festivals.test.ts, copied from drikpanchang.com Hindu calendar
 *     pages) — a Purnima birth's tithi birthday must land on Drik's Purnima date of that
 *     lunar month, including Drik's kshaya and vriddhi Purnimas.
 *  C. Drik Panchang Smarta Ekadashi 2026 (same source): Kartika Shukla Ekadashi = 20 Nov
 *     2026, a skipped (kshaya) Ekadashi — our kshaya rule gives the same day.
 */
import { describe, it, expect } from 'vitest';
import { computeJanmaTithi, lunationAt, type Place } from '../janmaTithi';
import { amantaMonths } from '../festivals';

const DELHI: Place = { lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata', name: 'New Delhi' };
const ist = (d: string, t: string) => Date.parse(`${d}T${t}:00+05:30`);

// A. Swiss Ephemeris reference output (janma_se.py), New Delhi, listed from 2026-01-01.
const SWISS: Array<{ dob: string; time: string; idx: number; month: string; dates: string[] }> = [
  { dob: '2025-11-01', time: '10:00', idx: 10, month: 'Kartika',
    dates: ['2026-11-20(kshaya)', '2027-11-10', '2028-10-28', '2029-11-16', '2030-11-05', '2031-11-24', '2032-11-13', '2033-11-03', '2034-11-22', '2035-11-11'] },
  { dob: '1990-08-15', time: '06:30', idx: 24, month: 'Shravana',
    dates: ['2026-09-06', '2027-08-27', '2028-08-15', '2029-09-03', '2030-08-23', '2031-08-12', '2032-08-30', '2033-08-19', '2034-09-07', '2035-08-28'] },
  { dob: '2000-01-01', time: '00:10', idx: 24, month: 'Margashirsha',
    dates: ['2027-01-02', '2027-12-22', '2028-12-11', '2029-12-30', '2030-12-20', '2032-01-08', '2032-12-27', '2033-12-16', '2035-01-03(vriddhi)', '2035-12-24'] },
  { dob: '1985-03-12', time: '14:45', idx: 21, month: 'Phalguna',
    dates: ['2026-03-10', '2027-03-29', '2028-03-17', '2029-03-06', '2030-03-25', '2031-03-15', '2032-04-02', '2033-03-23', '2034-03-12', '2035-03-31'] },
];

describe('Janma Tithi = Swiss Ephemeris reference (birth tithi, month, next 10 birthdays)', () => {
  for (const c of SWISS) {
    it(`${c.dob} ${c.time} IST New Delhi`, () => {
      const r = computeJanmaTithi({ dob: c.dob, birthUtcMs: ist(c.dob, c.time), birthPlace: DELHI, from: '2026-01-01', count: 10 });
      expect(r.tithi.index).toBe(c.idx);
      expect(r.amantaMonth).toBe(c.month);
      expect(r.basis).toBe('birth-moment');
      expect(r.birthdays.map(b => b.date + (b.rule === 'sunrise' ? '' : `(${b.rule})`))).toEqual(c.dates);
    }, 60_000);
  }
  it('labels both month systems: Krishna paksha purnimanta = next month', () => {
    const r = computeJanmaTithi({ dob: '1990-08-15', birthUtcMs: ist('1990-08-15', '06:30'), birthPlace: DELHI, from: '2026-01-01', count: 1 });
    expect(r.tithi).toMatchObject({ paksha: 'Krishna', number: 10, name: 'Dashami' });
    expect(r.amantaMonth).toBe('Shravana');
    expect(r.purnimantaMonth).toBe('Bhadrapada');
  });
});

// B. Drik Panchang Purnima dates (New Delhi).
const DRIK_PURNIMA: Record<number, string[]> = {
  2026: ['01-03', '02-01', '03-03', '04-02', '05-01', '05-31', '06-29', '07-29', '08-28', '09-26', '10-26', '11-24', '12-23'],
  2027: ['01-22', '02-20', '03-22', '04-20', '05-20', '06-18', '07-18', '08-17', '09-15', '10-15', '11-14', '12-13'],
  2037: ['01-02', '01-31', '03-01', '03-31', '04-29', '05-29', '06-27', '07-27', '08-25', '09-24', '10-24', '11-22', '12-22'],
};

describe('Purnima births land on Drik Panchang’s Purnima dates (sunrise rule, kshaya, vriddhi)', () => {
  it('every 2027 and 2037 tithi birthday of a 2026 Purnima birth is a Drik Purnima date', () => {
    let checked = 0;
    const seen = new Set<string>();
    for (const md of DRIK_PURNIMA[2026]) {
      // Born at sunrise on Drik's Purnima day; a day whose Purnima is kshaya (Drik 23 Dec
      // 2026 — the tithi starts after that sunrise) has a different sunrise tithi, so skip it.
      const r = computeJanmaTithi({ dob: `2026-${md}`, birthUtcMs: null, birthPlace: DELHI, from: '2027-01-01', count: 12 });
      if (r.tithi.name !== 'Purnima') { expect(md).toBe('12-23'); continue; }
      for (const b of r.birthdays) {
        if (!DRIK_PURNIMA[b.year]) continue;
        expect(DRIK_PURNIMA[b.year], `${md} → ${b.date}`).toContain(b.date.slice(5));
        seen.add(`${b.date}:${b.rule}`);
        checked++;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(20);
    // The special cases are covered by Drik-listed dates:
    expect(seen.has('2027-02-20:kshaya')).toBe(true);   // Magha Purnima 2027, skipped at sunrise
    expect(seen.has('2037-03-01:kshaya')).toBe(true);
    expect(seen.has('2027-06-18:vriddhi')).toBe(true);  // Jyeshtha Purnima 2027 at two sunrises → first
  }, 120_000);

  it('Margashirsha Purnima 2026 is kshaya and kept on Drik’s 23 Dec', () => {
    const r = computeJanmaTithi({ dob: '2025-12-04', birthUtcMs: ist('2025-12-04', '20:00'), birthPlace: DELHI, from: '2026-12-01', count: 1 });
    expect(r.tithi.name).toBe('Purnima');
    expect(r.amantaMonth).toBe('Margashirsha');
    expect(r.birthdays[0]).toMatchObject({ date: '2026-12-23', rule: 'kshaya' });
  }, 60_000);
});

describe('C. kshaya Ekadashi = Drik Smarta date', () => {
  it('Kartika Shukla Ekadashi 2026 → 20 Nov (Drik), listed as kshaya', () => {
    const r = computeJanmaTithi({ dob: '2025-11-01', birthUtcMs: ist('2025-11-01', '10:00'), birthPlace: DELHI, from: '2026-11-01', count: 1 });
    expect(r.birthdays[0]).toMatchObject({ date: '2026-11-20', rule: 'kshaya' });
  }, 60_000);
});

describe('Adhik Maas handling', () => {
  it('2026 has Adhik Jyeshtha: the birthday is in nija Jyeshtha and the Adhik date is a note', () => {
    const r = computeJanmaTithi({ dob: '2024-06-17', birthUtcMs: null, birthPlace: DELHI, from: '2026-01-01', count: 2 });
    expect(r.amantaMonth).toBe('Jyeshtha');
    const b = r.birthdays[0];
    expect(b.date).toBe('2026-06-25');               // nija Jyeshtha 15 Jun – 14 Jul 2026
    expect(b.adhikMonth).toBe('Adhik Jyeshtha');
    expect(b.adhikDate! < '2026-06-15').toBe(true);  // Adhik Jyeshtha 16 May – 15 Jun 2026
    expect(r.birthdays[1].adhikDate).toBeUndefined();
  }, 60_000);
  it('born in Adhik Jyeshtha → kept in the regular Jyeshtha', () => {
    const r = computeJanmaTithi({ dob: '2026-05-27', birthUtcMs: ist('2026-05-27', '09:00'), birthPlace: DELHI, from: '2026-06-01', count: 2 });
    expect(r.bornInAdhik).toBe(true);
    expect(r.birthMonth).toBe('Adhik Jyeshtha');
    expect(r.amantaMonth).toBe('Jyeshtha');
    const d = r.birthdays[0].date;
    expect(d >= '2026-06-15' && d <= '2026-07-14', d).toBe(true);   // nija Jyeshtha 2026
    expect(r.birthdays[0].adhikDate! < '2026-06-15').toBe(true);
    expect(r.birthdays[1].date.startsWith('2027-06')).toBe(true);
  }, 60_000);
});

describe('engine consistency', () => {
  it('lunations and their names equal the festival calendar’s amantaMonths() 2026–2028', () => {
    for (const m of [2026, 2027, 2028].flatMap(y => amantaMonths(y))) {
      const l = lunationAt(m.start.getTime() + 5 * 86400000);
      expect(l.name).toBe(m.name);
      expect(Math.abs(l.start.getTime() - m.start.getTime())).toBeLessThan(120_000);
    }
  }, 120_000);
  it('without a birth time the sunrise tithi is used, and said so', () => {
    const r = computeJanmaTithi({ dob: '1990-08-15', birthUtcMs: null, birthPlace: DELHI, from: '2026-01-01', count: 1 });
    expect(r.basis).toBe('sunrise');
    expect(r.tithi.index).toBe(r.sunriseTithi.index);
  }, 60_000);
  it('the celebration place decides the day by its own sunrise (runs for a far-west city)', () => {
    const ny: Place = { lat: 40.7128, lon: -74.006, timezone: 'America/New_York' };
    const r = computeJanmaTithi({ dob: '1990-08-15', birthUtcMs: ist('1990-08-15', '06:30'), birthPlace: DELHI, celebratePlace: ny, from: '2026-01-01', count: 10 });
    expect(r.birthdays).toHaveLength(10);
    for (const b of r.birthdays) expect(b.amantaMonth).toBe('Shravana');
  }, 60_000);
});
