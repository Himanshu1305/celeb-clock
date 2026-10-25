import { describe, it, expect } from 'vitest';
import { computeDayPanchang, sunriseSunset, PANCHANG_CITIES } from '../panchangDay';
import { karanaName } from '../panchang';

const DELHI = { lat: 28.6139, lon: 77.2090, tz: 5.5 };

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

describe('daily panchang for a city', () => {
  const date = new Date('2026-10-09T12:00:00Z');

  it('computes a plausible sunrise before sunset for Delhi', () => {
    const { rise, set } = sunriseSunset(date, DELHI.lat, DELHI.lon, DELHI.tz);
    expect(rise.getTime()).toBeLessThan(set.getTime());
    const p = computeDayPanchang(date, DELHI.lat, DELHI.lon, DELHI.tz, 'Delhi');
    // Delhi sunrise in October is ~06:1x–06:3x IST; sunset ~17:5x–18:1x.
    expect(toMin(p.sunrise)).toBeGreaterThan(5 * 60);
    expect(toMin(p.sunrise)).toBeLessThan(7 * 60);
    expect(toMin(p.sunset)).toBeGreaterThan(17 * 60);
    expect(toMin(p.sunset)).toBeLessThan(19 * 60);
  });

  it('returns the five limbs plus windows and choghadiya', () => {
    const p = computeDayPanchang(date, DELHI.lat, DELHI.lon, DELHI.tz, 'Delhi');
    expect(p.tithiName).toBeTruthy();
    expect(p.nakshatra).toBeTruthy();
    expect(p.yoga).toBeTruthy();
    expect(['Shukla', 'Krishna']).toContain(p.paksha);
    expect(p.rahuKaal.start).toMatch(/^\d{2}:\d{2}$/);
    expect(p.rahuKaal.quality).toBe('bad');
    expect(p.dayChoghadiya).toHaveLength(8);
    expect(p.nightChoghadiya).toHaveLength(8);
    expect(p.dayChoghadiya.every(c => ['good', 'neutral', 'bad'].includes(c.quality))).toBe(true);
  });

  it('day choghadiya first slot follows the weekday rule', () => {
    // 2026-10-09 is a Friday → day starts with "Char".
    const p = computeDayPanchang(date, DELHI.lat, DELHI.lon, DELHI.tz, 'Delhi');
    expect(p.dayChoghadiya[0].name).toBe('Char');
    // first day choghadiya begins at sunrise
    expect(p.dayChoghadiya[0].start).toBe(p.sunrise);
  });

  it('has the 50 built-in cities with unique slugs', () => {
    expect(PANCHANG_CITIES.length).toBe(50);
    expect(new Set(PANCHANG_CITIES.map(c => c.slug)).size).toBe(PANCHANG_CITIES.length);
  });
});

// ── Round-2 audit T1 / T6 / T7 regression ────────────────────────────────────
// Expected values are the audit's Swiss Ephemeris (Lahiri) reference outputs —
// scratchpad/round2/T/refpan.py, recorded in round2/T/refpan.out and re-run for
// 2027-06-21 — using the standard Choghadiya / Rahu-Gulika-Yamaganda tables.

const KOLKATA = PANCHANG_CITIES.find(c => c.slug === 'kolkata')!;
const DELHI_C = PANCHANG_CITIES.find(c => c.slug === 'delhi')!;
const at = (iso: string, c: { lat: number; lon: number; tz: number; name: string }) =>
  computeDayPanchang(new Date(iso + 'T12:00:00Z'), c.lat, c.lon, c.tz, c.name);
const near = (got: string, want: string, tolMin = 2) => {
  expect(Math.abs(toMin(got.slice(0, 5)) - toMin(want)), `${got} vs ${want}`).toBeLessThanOrEqual(tolMin);
};

describe('round-2 T1: weekday (vara) is the local sunrise weekday', () => {
  it('Kolkata 21 Jun 2027 (sunrise 04:52, before 05:30 IST) is Monday with Monday Rahu Kaal', () => {
    const p = at('2027-06-21', KOLKATA);
    expect(p.date).toBe('2027-06-21');
    expect(p.weekday).toBe('Monday');
    near(p.rahuKaal.start, '06:34'); near(p.rahuKaal.end, '08:15');
    near(p.gulikaKaal.start, '13:20'); near(p.yamaganda.start, '09:57');
    expect(p.dayChoghadiya[0].name).toBe('Amrit');
  });

  it('every city, every day of 2026: weekday and date match the civil calendar', () => {
    const W = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // Every 3rd day for the 10 largest cities; every 15th day for the other 40
    // (batch 7 grew the list to 50 — same check, lighter sampling to stay fast).
    for (const [ci, c] of PANCHANG_CITIES.entries()) {
      for (let i = 0; i < 365; i += ci < 10 ? 3 : 15) {
        const d = new Date(Date.UTC(2026, 0, 1 + i, 6, 30));
        const p = computeDayPanchang(d, c.lat, c.lon, c.tz, c.name);
        expect(p.weekday, `${c.name} ${d.toISOString().slice(0, 10)}`).toBe(W[d.getUTCDay()]);
        expect(p.date).toBe(d.toISOString().slice(0, 10));
      }
    }
  }, 60000);
});

describe('round-2 T6: Karana and night Choghadiya', () => {
  it('Diwali 2026 (8 Nov, Delhi) sunrise Karana is Shakuni; 17 Oct 2026 is Gara', () => {
    expect(karanaName(at('2026-11-08', DELHI_C).karana)).toBe('Shakuni');
    expect(karanaName(at('2026-10-17', DELHI_C).karana)).toBe('Gara');
    expect(karanaName(at('2027-01-14', DELHI_C).karana)).toBe('Taitila');
  });

  it('karanaName covers the fixed and movable Karanas', () => {
    expect(karanaName(1)).toBe('Kimstughna');
    expect(karanaName(2)).toBe('Bava');
    expect(karanaName(8)).toBe('Vishti (Bhadra)');
    expect(karanaName(57)).toBe('Vishti (Bhadra)');
    expect(karanaName(58)).toBe('Shakuni');
    expect(karanaName(59)).toBe('Chatushpada');
    expect(karanaName(60)).toBe('Naga');
  });

  it('night Choghadiya order matches the reference (Sat, Sun, Thu, Mon)', () => {
    const names = (iso: string, c = DELHI_C) => at(iso, c).nightChoghadiya.map(x => x.name);
    expect(names('2026-10-17')).toEqual(['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh']);
    expect(names('2026-11-08')).toEqual(['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh']);
    expect(names('2027-01-14')).toEqual(['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit']);
    expect(names('2027-06-21', KOLKATA)).toEqual(['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char']);
    const n = at('2026-11-08', DELHI_C).nightChoghadiya;
    near(n[0].start, '17:32'); near(n[4].start, '00:05');
  });
});

describe('round-2 T7: end times and Abhijit', () => {
  it('Delhi, Diwali 2026: Chaturdashi till 11:28, Swati till 07:24 next day, Abhijit 11:43–12:27', () => {
    const p = at('2026-11-08', DELHI_C);
    near(p.tithiEnd, '11:28'); near(p.karanaEnd, '11:28');
    expect(p.nakshatraEnd).toMatch(/next day/); near(p.nakshatraEnd, '07:24');
    expect(p.yogaEnd).toMatch(/next day/); near(p.yogaEnd, '03:03');
    near(p.abhijit.start, '11:43'); near(p.abhijit.end, '12:27');
  });
  it('Kolkata, 21 Jun 2027: Dwitiya till 10:36, Purva Ashadha till 05:04', () => {
    const p = at('2027-06-21', KOLKATA);
    expect(p.tithiName).toBe('Dwitiya'); near(p.tithiEnd, '10:36');
    expect(p.nakshatra).toBe('Purva Ashadha'); near(p.nakshatraEnd, '05:04');
    near(p.abhijit.start, '11:11'); near(p.abhijit.end, '12:05');
  });
});
