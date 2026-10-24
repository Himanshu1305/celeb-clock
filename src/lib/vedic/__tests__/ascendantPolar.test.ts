import { describe, it, expect } from 'vitest';
import { calculateLagna } from '../engine/vedicEngine';
import { calculateBirthChart } from '../calculateBirthChart';
import grid from './golden/ascendantSwissGrid.json';

// Audit B7 — Ascendant at high latitudes. Reference: Swiss Ephemeris (see grid.source):
// latitudes −66.5..+72 (8 random instants each below the polar circle, 40 each above).
const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe('Ascendant matches Swiss Ephemeris (incl. polar latitudes, audit B7)', () => {
  it(`all ${grid.rows.length} grid points within 0.01°`, () => {
    const bad: string[] = [];
    for (const [jd, lat, lon, asc] of grid.rows as number[][]) {
      const { ascTropical } = calculateLagna(new Date((jd - 2440587.5) * 86400000), lat, lon);
      const d = diff(ascTropical, asc);
      if (d > 0.01) bad.push(`jd ${jd} lat ${lat} lon ${lon}: engine ${ascTropical.toFixed(3)}° vs Swiss ${asc}° (off ${d.toFixed(3)}°)`);
    }
    expect(bad).toEqual([]);
  });

  it('Tromsø 1999-12-15 12:00 CET → Meena Lagna (Swiss Ephemeris; golden G15)', async () => {
    const r = await calculateBirthChart({ year: 1999, month: 12, day: 15, hour: 12, minute: 0, latitude: 69.6492, longitude: 18.9553, timezoneOffset: 1 });
    expect(r.lagna.sign).toBe('Meena');
    expect(r.warnings.map(w => w.code)).toContain('POLAR_LATITUDE');
  });
});
