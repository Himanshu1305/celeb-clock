/**
 * Batch 10 — Ashtakavarga (Bhinnashtakavarga + Sarvashtakavarga) vs three references.
 *
 * 1. golden/dashaAvSwiss.json (golden/dashaAvSwiss_ref.py) — Swiss Ephemeris signs (SIDM_LAHIRI,
 *    ascendant from houses_ex) and an INDEPENDENT Python implementation of the BPHS ch. 66 bindu tables
 *    (tempora.ltd/findings/*-ashtakavarga, astrobix.com "361 rules of Ashtakavarga", opened 29 Oct 2026).
 * 2. golden/pyjhoraPanel.json (golden/pyjhoraPanel_ref.py) — PyJHora's ashtakavarga.get_ashtaka_varga on
 *    the same signs with its six "Parashara–Varahamihira discrepancy" switches OFF (= Parashara).
 * 3. Published book tables — P.V.R. Narasimha Rao, "Vedic Astrology: An Integrated Approach", ch. 12
 *    Exercises 19–22 (Charts 6, 7, 12), as recorded in PyJHora's tests/pvr_tests.py. The book uses the
 *    Varahamihira readings for the Moon's and Venus's tables; with those readings our code reproduces
 *    the book exactly, and with BPHS readings the five unaffected planets still match the book exactly.
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import {
  AV_PLANETS, AV_CONTRIBUTORS, BPHS_ASHTAKAVARGA, BAV_TOTALS, SAV_TOTAL, computeAshtakavarga, byHouse,
  type AvTable, type AvContributor,
} from '../engine/ashtakavarga';
import ref from './golden/dashaAvSwiss.json';
import pj from './golden/pyjhoraPanel.json';
import { PANEL } from './fixtures/panelBirths';

type RefRec = { id: string; signs: Record<AvContributor, number>; signMarginDeg: Record<AvContributor, number>; bav: Record<string, number[]>; sav: number[] };
const REF_DATE = new Date('2026-10-29T00:00:00Z');

describe('Ashtakavarga — BPHS tables', () => {
  it('table sizes give the fixed totals (Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39; SAV 337)', () => {
    for (const p of AV_PLANETS) {
      expect(AV_CONTRIBUTORS.reduce((s, c) => s + BPHS_ASHTAKAVARGA[p][c].length, 0), p).toBe(BAV_TOTALS[p]);
    }
    expect(Object.values(BAV_TOTALS).reduce((s, x) => s + x, 0)).toBe(SAV_TOTAL);
  });

  it('every one of 3 000 random charts keeps the fixed BAV totals and SAV 337', () => {
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor((seed / 2147483648) * 12); };
    for (let i = 0; i < 3000; i++) {
      const signs = Object.fromEntries(AV_CONTRIBUTORS.map(c => [c, rnd()])) as Record<AvContributor, number>;
      const r = computeAshtakavarga(signs);
      for (const p of AV_PLANETS) expect(r.bav[p].reduce((s, x) => s + x, 0)).toBe(BAV_TOTALS[p]);
      expect(r.sav.reduce((s, x) => s + x, 0)).toBe(337);
      for (const v of r.sav) expect(v).toBeLessThanOrEqual(56);
    }
  });

  it('byHouse reads a sign array from the Lagna (house 1 = Lagna sign)', () => {
    const perSign = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    expect(byHouse(perSign, 10, 1)).toBe(10);
    expect(byHouse(perSign, 10, 3)).toBe(0);
  });
});

describe('Ashtakavarga — P1–P10 vs Swiss Ephemeris reference and PyJHora (Parashara)', () => {
  for (const r of ref as RefRec[]) {
    it(`${r.id}: full BAV (7 planets × 12 signs) and SAV`, async () => {
      const c = await calculateBirthChart(PANEL[r.id], { refDate: REF_DATE });
      const av = c.ashtakavarga!;
      for (const p of AV_PLANETS) expect(av.bav[p].reduce((s, x) => s + x, 0), `${r.id} ${p} total`).toBe(BAV_TOTALS[p]);
      expect(av.sav.reduce((s, x) => s + x, 0)).toBe(337);
      // Signs agree with Swiss Ephemeris (no contributor sits within 0.01° of a sign edge in this panel).
      for (const k of AV_CONTRIBUTORS) expect(r.signMarginDeg[k], `${r.id} ${k} margin`).toBeGreaterThan(0.01);
      expect(av.lagnaSignIndex).toBe(r.signs.Lagna);
      for (const p of AV_PLANETS) expect(av.bav[p], `${r.id} ${p} BAV`).toEqual(r.bav[p]);
      expect(av.sav).toEqual(r.sav);
      const pjr = (pj as Record<string, { bavParashara: Record<string, number[]>; savParashara: number[] }>)[r.id];
      for (const p of AV_PLANETS) expect(av.bav[p], `${r.id} ${p} vs PyJHora`).toEqual(pjr.bavParashara[p]);
      expect(av.sav).toEqual(pjr.savParashara);
    });
  }
});

describe('Ashtakavarga — published book example (PVR, Charts 6, 7, 12)', () => {
  // Book chart notation (Aries … Pisces): 0 Sun, 1 Moon, 2 Mars, 3 Mercury, 4 Jupiter, 5 Venus, 6 Saturn,
  // 7 Rahu, 8 Ketu, L Lagna.
  const IDS: Record<string, AvContributor> = { 0: 'Sun', 1: 'Moon', 2: 'Mars', 3: 'Mercury', 4: 'Jupiter', 5: 'Venus', 6: 'Saturn', L: 'Lagna' };
  function signsOf(chart: string[]): Record<AvContributor, number> {
    const out = {} as Record<AvContributor, number>;
    chart.forEach((cell, sign) => cell.split('/').filter(Boolean).forEach(t => { if (IDS[t]) out[IDS[t]] = sign; }));
    return out;
  }
  // Varahamihira readings used by the book (PyJHora p_v_* switches on).
  const VARIANT: AvTable = {
    ...BPHS_ASHTAKAVARGA,
    Moon: { ...BPHS_ASHTAKAVARGA.Moon, Moon: [1, 3, 6, 7, 9, 10, 11], Mars: [2, 3, 5, 6, 10, 11], Jupiter: [1, 2, 4, 7, 8, 10, 11] },
    Venus: { ...BPHS_ASHTAKAVARGA.Venus, Mars: [3, 4, 6, 9, 11, 12] },
  };
  const chart6 = ['8/5', '', '2/0/3', '', '6/4', 'L', '7', '', '', '', '', '1'];
  const chart7 = ['6/1/7', '', '', '', '', '', '8/4', 'L', '3/2', '0', '5', ''];
  const chart12 = ['8', '5', '', '', '', 'L', '7', '2/4', '0/3', '1', '', '6'];
  const book6 = [[5, 3, 5, 3, 4, 4, 2, 3, 5, 4, 5, 5], [3, 2, 5, 3, 6, 3, 4, 5, 5, 5, 3, 5], [4, 3, 4, 3, 4, 3, 2, 5, 1, 3, 3, 4],
    [7, 4, 7, 4, 4, 3, 4, 4, 4, 3, 6, 4], [4, 3, 5, 6, 3, 7, 4, 3, 5, 6, 5, 5], [8, 7, 4, 3, 3, 2, 4, 6, 4, 4, 4, 3], [3, 3, 4, 3, 2, 3, 2, 3, 4, 5, 3, 4]];
  const book6Sav = [34, 25, 34, 25, 26, 25, 22, 29, 28, 30, 29, 30];
  const book7 = [[4, 2, 3, 4, 6, 5, 5, 3, 2, 6, 6, 2], [6, 3, 5, 3, 5, 5, 6, 3, 3, 4, 4, 2], [3, 2, 3, 4, 2, 5, 4, 3, 3, 4, 3, 3],
    [4, 6, 4, 3, 4, 7, 4, 5, 6, 3, 5, 3], [4, 4, 3, 5, 6, 5, 6, 4, 6, 4, 3, 6], [3, 5, 5, 4, 6, 2, 3, 6, 5, 2, 7, 4], [3, 2, 2, 3, 5, 6, 3, 4, 1, 3, 6, 1]];
  const book7Sav = [27, 24, 25, 26, 34, 35, 31, 28, 26, 26, 34, 21];
  const book12Sav = [24, 25, 31, 28, 27, 39, 33, 29, 26, 22, 28, 25];

  it('with the book\'s readings: Chart 6 and Chart 7 BAV + SAV and Chart 12 SAV reproduce the book exactly', () => {
    const r6 = computeAshtakavarga(signsOf(chart6), VARIANT);
    AV_PLANETS.forEach((p, i) => expect(r6.bav[p], `Chart 6 ${p}`).toEqual(book6[i]));
    expect(r6.sav).toEqual(book6Sav);
    const r7 = computeAshtakavarga(signsOf(chart7), VARIANT);
    AV_PLANETS.forEach((p, i) => expect(r7.bav[p], `Chart 7 ${p}`).toEqual(book7[i]));
    expect(r7.sav).toEqual(book7Sav);
    expect(computeAshtakavarga(signsOf(chart12), VARIANT).sav).toEqual(book12Sav);
  });

  it('with BPHS readings (what BornClock shows): Sun, Mars, Mercury, Jupiter, Saturn still equal the book; Moon/Venus keep their totals', () => {
    for (const [chart, book] of [[chart6, book6], [chart7, book7]] as const) {
      const r = computeAshtakavarga(signsOf(chart as unknown as string[]));
      AV_PLANETS.forEach((p, i) => {
        if (p === 'Moon' || p === 'Venus') expect(r.bav[p].reduce((s, x) => s + x, 0)).toBe(BAV_TOTALS[p]);
        else expect(r.bav[p], p).toEqual(book[i]);
      });
    }
  });
});
