/**
 * Batch 10 — /eclipses pages. References (opened 29 Oct 2026, copied into ../eclipses.ts):
 *   NASA decade tables (Espenak): eclipse.gsfc.nasa.gov/SEdecade/SEdecade2021.html and
 *   LEdecade/LEdecade2021.html — greatest eclipse in TD, type, durations.
 *   timeanddate.com "Next Eclipses in India" / "in Delhi" — visibility.
 * Greatest eclipse: NASA TD − ΔT (≈ 69–72 s for 2026–2030) = UT; ours must be within 1 minute.
 */
import { describe, it, expect } from 'vitest';
import { eclipsesOfYear, NASA_LUNAR, NASA_SOLAR, VISIBLE_FROM_DELHI, VISIBLE_FROM_INDIA, ECLIPSE_YEARS_LIST } from '../eclipses';
import { computeEclipses } from '../festivals';

const all = ECLIPSE_YEARS_LIST.flatMap(eclipsesOfYear);
const hm = (s: string) => { const m = s.match(/^(\d+)h(\d+)m$/)!; return Number(m[1]) * 60 + Number(m[2]); };

describe('eclipses 2026–2030 vs NASA', () => {
  it('24 eclipses, one per NASA row, same type', () => {
    expect(all).toHaveLength(24);
    for (const n of [...NASA_SOLAR, ...NASA_LUNAR]) {
      const e = all.find(x => x.date === n.date);
      expect(e, n.date).toBeTruthy();
      expect(e!.type, n.date).toBe(n.type);
    }
  }, 60_000);

  it('greatest eclipse within 1 minute of NASA (TD − ΔT)', () => {
    for (const e of all) {
      const ut = Date.parse(`${e.nasa.date}T${e.nasa.td}Z`) - 70_000;
      expect(Math.abs(e.peak.getTime() - ut) / 60000, `${e.date} ${e.name}`).toBeLessThan(1);
    }
  });

  it('lunar partial / total phase lengths within 3 minutes of NASA', () => {
    for (const e of all.filter(x => x.body === 'lunar')) {
      if (e.nasa.partial) expect(Math.abs(e.partialMin! - hm(e.nasa.partial)), `${e.date} partial`).toBeLessThanOrEqual(3);
      if (e.nasa.total) expect(Math.abs(e.totalMin! - hm(e.nasa.total)), `${e.date} total`).toBeLessThanOrEqual(3);
      if (!e.nasa.total) expect(e.totalMin, e.date).toBe(0);
    }
  });

  it('IST dates match the festival calendar (same engine)', () => {
    for (const y of ECLIPSE_YEARS_LIST) {
      const f = computeEclipses(y).map(x => `${x.dateISO} ${x.name}`).sort();
      expect(eclipsesOfYear(y).map(x => `${x.istDate} ${x.name}`).sort(), String(y)).toEqual(f);
    }
  }, 60_000);
});

describe('visibility is only what timeanddate.com lists', () => {
  it('12 visible from India, 9 of them from Delhi; every Delhi one is an India one', () => {
    expect(all.filter(e => e.india)).toHaveLength(12);
    expect(all.filter(e => e.delhi)).toHaveLength(9);
    for (const d of VISIBLE_FROM_DELHI) expect(VISIBLE_FROM_INDIA.has(d), d).toBe(true);
    for (const d of VISIBLE_FROM_INDIA) expect(all.some(e => e.date === d), d).toBe(true);
  }, 60_000);

  it('our own computed New Delhi visibility (festival notes) agrees, except one very shallow penumbral eclipse', () => {
    // 18 Jul 2027 penumbral (NASA umbral magnitude −1.068): our horizon check says the Moon
    // is up in Delhi during the faint penumbral phase; timeanddate does not list it. The
    // page states timeanddate's list only.
    const notes = ECLIPSE_YEARS_LIST.flatMap(computeEclipses);
    const diff = all.filter(e => {
      const n = notes.find(x => x.dateISO === e.istDate && x.name === e.name)!;
      return /^Visible/.test(n.note ?? '') !== e.delhi;
    }).map(e => e.date);
    expect(diff).toEqual(['2027-07-18']);
  }, 60_000);
});
