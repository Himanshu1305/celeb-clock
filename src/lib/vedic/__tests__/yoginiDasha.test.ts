/**
 * Batch 10 — Yogini Dasha vs three independent references.
 *
 * 1. golden/dashaAvSwiss.json — produced by golden/dashaAvSwiss_ref.py: Swiss Ephemeris (pyswisseph,
 *    engine-audit venv, SIDM_LAHIRI) Moon + an INDEPENDENT Python implementation of the classical rule
 *    in BornClock's Drik convention (apparent longitude − SE mean Lahiri − 24.4″, see ayanamsaDrik.test.ts),
 *    ((nakshatra + 3) mod 8, 0 → Sankata; balance from the Moon's place in its nakshatra; Antardasha =
 *    maha × antar / 36 from the maha's own Yogini; 365.25-day year). Panel = round2/CONTEXT.md P1–P10.
 * 2. golden/pyjhoraPanel.json — PyJHora (github.com/naturalstupid/PyJHora, open-source JHora port),
 *    yogini.get_dhasa_bhukthi with LAHIRI and its mean sidereal year (365.256364 d); start dates in
 *    local time. Its true-Lahiri Moon differs from our Drik-convention Moon by ~40″ → we allow 3 days.
 * 3. Published worked examples — pdfcoffee.com "An Introduction to the Yogini Dasha" (opened 29 Oct 2026):
 *    Moon 7s10°00′ (Anuradha) → Bhramari with 24 months to run; Chart 1 (24 Apr 1985 17:39 IST,
 *    28°N39′ 77°E13′) had an event on 1 Oct 1989 "in Sankata–Siddha"; Chart 3 (5 Aug 1981 07:20 IST)
 *    an event in Nov 1988 "during Dhanya–Ulka".
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { toKundaliLegacy } from '../legacyAdapters';
import { withLiveKundaliFields } from '../liveTimeFields';
import {
  YOGINIS, YOGINI_YEAR_DAYS, buildYoginiDasha, yoginiAntardashas, yoginiIndexForNakshatra, currentYoginiPeriod,
} from '../engine/yoginiDasha';
import ref from './golden/dashaAvSwiss.json';
import pj from './golden/pyjhoraPanel.json';
import { PANEL } from './fixtures/panelBirths';

const REF_DATE = new Date('2026-10-29T00:00:00Z');
const DAY = 86400000;
const pyIso = (s: string) => Date.parse(s.replace(/Z$/, ':00Z'));

type RefYogini = { nakshatra: number; start: string; part: number; balanceYears: number;
  mahas: Array<{ yogini: string; start: string; end: string; antar?: Array<[string, string, string]> }> };
type RefRec = { id: string; moon: number; yogini: RefYogini };

describe('Yogini Dasha — classical start rule', () => {
  it('(n + 3) mod 8 over all 27 nakshatras matches the PyJHora map (Mangala: Ardra, Chitra, Shravana …)', () => {
    // PyJHora yogini.py dhasa_adhipathi_dict: lord → nakshatra numbers.
    const pyjhora: Record<string, number[]> = {
      Mangala: [6, 14, 22], Pingala: [7, 15, 23], Dhanya: [8, 16, 24], Bhramari: [1, 9, 17, 25],
      Bhadrika: [2, 10, 18, 26], Ulka: [3, 11, 19, 27], Siddha: [4, 12, 20], Sankata: [5, 13, 21],
    };
    for (const [name, naks] of Object.entries(pyjhora)) {
      for (const n of naks) expect(YOGINIS[yoginiIndexForNakshatra(n)].name, `nakshatra ${n}`).toBe(name);
    }
    expect(YOGINIS.reduce((s, y) => s + y.years, 0)).toBe(36);
  });

  it('published example: Moon 7s10°00′ (Anuradha) → Bhramari, 24 months still to run', () => {
    const d = buildYoginiDasha(new Date('2000-01-01T00:00:00Z'), 7 * 30 + 10);
    expect(d.nakshatraNumber).toBe(17);
    expect(d.startYogini).toBe('Bhramari');
    expect(d.balanceYears).toBeCloseTo(2, 9);
  });

  it('published examples: Chart 1 event (1 Oct 1989) in Sankata–Siddha; Chart 3 event (Nov 1988) in Dhanya–Ulka', async () => {
    const delhi = { latitude: 28 + 39 / 60, longitude: 77 + 13 / 60, timezoneOffset: 5.5 };
    const c1 = await calculateBirthChart({ year: 1985, month: 4, day: 24, hour: 17, minute: 39, ...delhi }, { refDate: REF_DATE });
    const p1 = currentYoginiPeriod(c1.yoginiDasha!, new Date('1989-10-01T06:00:00Z'))!;
    expect(`${p1.maha.yogini}–${p1.antar!.yogini}`).toBe('Sankata–Siddha');
    // The Moon's position depends only on the instant; the source gives no place for Chart 3.
    const c3 = await calculateBirthChart({ year: 1981, month: 8, day: 5, hour: 7, minute: 20, ...delhi }, { refDate: REF_DATE });
    const p3 = currentYoginiPeriod(c3.yoginiDasha!, new Date('1988-11-15T06:00:00Z'))!;
    expect(`${p3.maha.yogini}–${p3.antar!.yogini}`).toBe('Dhanya–Ulka');
  });
});

describe('Yogini Dasha — year length (365.25 days, same as our Vimshottari)', () => {
  it('every Mahadasha lasts years × 365.25 days; Antardashas fill their parent exactly', () => {
    const d = buildYoginiDasha(new Date('1990-01-15T01:00:00Z'), 133.7);
    expect(d.yearDays).toBe(YOGINI_YEAR_DAYS);
    expect(YOGINI_YEAR_DAYS).toBe(365.25);
    for (const m of d.mahadashas) {
      expect((Date.parse(m.end) - Date.parse(m.start)) / DAY).toBeCloseTo(m.years * 365.25, 3);
      const a = yoginiAntardashas(m);
      expect(a).toHaveLength(8);
      expect(a[0].yogini).toBe(m.yogini);
      expect(a[0].start).toBe(m.start);
      expect(a[7].end).toBe(m.end);
      expect(a.reduce((s, x) => s + x.years, 0)).toBeCloseTo(m.years, 9);
      for (let i = 1; i < 8; i++) expect(a[i].start).toBe(a[i - 1].end);
    }
    // One full cycle of 8 = 36 × 365.25 = 13 149 days.
    expect((Date.parse(d.mahadashas[8].start) - Date.parse(d.mahadashas[0].start)) / DAY).toBeCloseTo(13149, 3);
    // Covers at least 120 years after birth, starting before birth.
    expect(Date.parse(d.mahadashas[0].start)).toBeLessThanOrEqual(Date.parse('1990-01-15T01:00:00Z'));
    expect(Date.parse(d.mahadashas.at(-1)!.end) - Date.parse('1990-01-15T01:00:00Z')).toBeGreaterThanOrEqual(120 * 365.25 * DAY);
  });

  it('matches the Vimshottari convention in the same chart: both start-offsets use 365.25-day years', async () => {
    const c = await calculateBirthChart(PANEL.P3, { refDate: REF_DATE });
    const birth = Date.UTC(1990, 0, 15, 1, 0);
    const y = c.yoginiDasha!;
    const elapsedDays = (birth - Date.parse(y.mahadashas[0].start)) / DAY;
    expect(elapsedDays).toBeCloseTo(y.fractionElapsed * YOGINIS.find(x => x.name === y.startYogini)!.years * 365.25, 3);
    const v = c.dashaTimeline![0];
    const vYears = (Date.parse(v.end) - Date.parse(v.start)) / DAY / 365.25;
    expect(Number.isInteger(Math.round(vYears * 1e6) / 1e6)).toBe(true); // Vimshottari maha = whole years × 365.25 d
  });
});

describe('Yogini Dasha — panel vs Swiss Ephemeris reference and PyJHora', () => {
  for (const r of ref as RefRec[]) {
    it(`${r.id}: start Yogini, balance, Maha + Antar dates`, async () => {
      const c = await calculateBirthChart(PANEL[r.id], { refDate: REF_DATE });
      const y = c.yoginiDasha!;
      const moon = c.planets.find(p => p.name === 'Moon')!.longitude;
      expect(Math.abs(moon - r.moon), 'Moon vs Swiss Ephemeris').toBeLessThan(0.01);
      expect(y.nakshatraNumber).toBe(r.yogini.nakshatra);
      expect(y.startYogini).toBe(r.yogini.start);
      expect(Math.abs(y.balanceYears - r.yogini.balanceYears), 'balance (years)').toBeLessThan(0.002); // < 1 day
      expect(y.mahadashas.map(m => m.yogini)).toEqual(r.yogini.mahas.map(m => m.yogini));
      y.mahadashas.forEach((m, i) => {
        expect(Math.abs(Date.parse(m.start) - pyIso(r.yogini.mahas[i].start)) / DAY, `${m.yogini} start`).toBeLessThan(1);
        const antRef = r.yogini.mahas[i].antar;
        if (!antRef) return;
        yoginiAntardashas(m).forEach((a, k) => {
          expect(a.yogini).toBe(antRef[k][0]);
          expect(Math.abs(Date.parse(a.start) - pyIso(antRef[k][1])) / DAY, `${m.yogini}/${a.yogini} start`).toBeLessThan(1);
        });
      });
      // PyJHora: same first Yogini and sequence; first start within 3 days. PyJHora uses Swiss Ephemeris'
      // TRUE Lahiri (with nutation) and a 365.256-day year; we follow Drik's mean Lahiri + 24.4″
      // (ayanamsaDrik.test.ts). That ~40″ Moon difference moves an 8-year Yogini's start by up to ~2.6 days.
      const p = (pj as Record<string, { firstYogini: string; firstStartLocal: string; mahaStarts: [string, string][] }>)[r.id];
      expect(y.startYogini).toBe(p.firstYogini);
      const [date, hrs] = p.firstStartLocal.split(' ');
      const pjUtc = Date.parse(`${date}T00:00:00Z`) + parseFloat(hrs) * 3600000 - PANEL[r.id].timezoneOffset * 3600000;
      expect(Math.abs(Date.parse(y.mahadashas[0].start) - pjUtc) / DAY, 'vs PyJHora').toBeLessThan(3);
      p.mahaStarts.forEach(([name], i) => expect(y.mahadashas[i].yogini).toBe(name));
    });
  }

  it('the period running "now" is the one whose dates contain now (P9 on 29 Oct 2026)', async () => {
    const c = await calculateBirthChart(PANEL.P9, { refDate: REF_DATE });
    const cur = currentYoginiPeriod(c.yoginiDasha!, REF_DATE)!;
    const r = (ref as RefRec[]).find(x => x.id === 'P9')!;
    const t = REF_DATE.getTime();
    const m = r.yogini.mahas.find(x => pyIso(x.start) <= t && t < pyIso(x.end))!;
    expect(cur.maha.yogini).toBe(m.yogini);
    expect(Date.parse(cur.antar!.start)).toBeLessThanOrEqual(t);
    expect(Date.parse(cur.antar!.end)).toBeGreaterThan(t);
  });
});

describe('Yogini Dasha — API shape', () => {
  it('is in the /api/kundali response and survives the cache-hit path', async () => {
    const c = await calculateBirthChart(PANEL.P1, { refDate: REF_DATE });
    const legacy = toKundaliLegacy(c);
    expect(legacy.yoginiDasha?.startYogini).toBe('Ulka');
    expect(legacy.ashtakavarga?.sav.reduce((s, x) => s + x, 0)).toBe(337);
    // A chart cached before batch 10 has neither field; the live overlay adds both.
    const { yoginiDasha: _y, ashtakavarga: _a, ...old } = legacy;
    const live = await withLiveKundaliFields(old as Record<string, unknown>, PANEL.P1, REF_DATE);
    expect((live as any).yoginiDasha.mahadashas).toEqual(legacy.yoginiDasha!.mahadashas);
    expect((live as any).ashtakavarga).toEqual(legacy.ashtakavarga);
  });
});
