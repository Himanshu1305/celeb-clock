import { describe, it, expect } from 'vitest';
import { computeDayPanchang, sunriseSunset, PANCHANG_CITIES } from '../panchangDay';

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

  it('has 10 built-in cities with unique slugs', () => {
    expect(PANCHANG_CITIES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(PANCHANG_CITIES.map(c => c.slug)).size).toBe(PANCHANG_CITIES.length);
  });
});
