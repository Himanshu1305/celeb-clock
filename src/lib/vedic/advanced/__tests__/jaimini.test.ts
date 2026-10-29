/**
 * Batch 10 — Jaimini: Chara Karakas, Karakamsha and Chara Dasha (K.N. Rao).
 *
 * Karakas / Karakamsha reference: golden/swissRef.json — Swiss Ephemeris (SIDM_LAHIRI)
 * longitudes of Sun…Saturn sorted by degree within sign in Python (7-karaka scheme, no Rahu);
 * Karakamsha = Navamsa sign of the Atmakaraka. Charts P1, P2, P3, P9 and CH.
 *
 * Chara Dasha references:
 *  (1) PyJHora 4.8.7 DOCUMENTED test output — jhora/tests/pvr_tests.py, chara_dhasa_test(),
 *      "KN Rao Method": dob 1996-12-07 10:34, Chennai 13.0878 N 80.2785 E, +5:30 →
 *      exp = [(9,'1996-12-07 10:34:00 AM',10),(8,'2006-12-08 00:05:38 AM',12),(7,…,4),(6,…,12),
 *             (5,…,9),(4,…,9),(3,…,9),(2,…,6),(1,…,5),(0,…,4),(11,…,3),(10,…,11)]  (sign 0 = Aries).
 *  (2) PyJHora 4.8.7 run (golden/pyjhoraChara.json, golden/pyjhora_chara_kn_rao.py) for the
 *      panel charts, Lahiri + mean nodes. All match except P3, a recorded deliberate difference.
 */
import { describe, it, expect } from 'vitest';
import ref from './golden/swissRef.json';
import pj from './golden/pyjhoraChara.json';
import { computeJaimini, charaKarakas, rashiAspects, charaDashaSequence } from '../jaimini';
import { jaiminiHeadline, karakamshaLine, currentCharaPeriod } from '../advancedText';
import { PANEL } from './panel';

const R = ref as unknown as Record<string, { jaimini: { karakas: Record<string, string>; karakamshaSign: number } }>;
const PJ = (pj as unknown as { charts: Record<string, Array<[number, number, string]>> }).charts;

describe('Chara karakas (7-karaka, Rahu excluded) vs Swiss Ephemeris — 5 charts', () => {
  for (const id of ['P1', 'P2', 'P3', 'P9', 'CH']) {
    it(`${id}: AK…DK and Karakamsha`, () => {
      const { t, lat, lon } = PANEL[id];
      const j = computeJaimini(t, lat, lon);
      expect(Object.fromEntries(j.karakas.map(k => [k.code, k.planet]))).toEqual(R[id].jaimini.karakas);
      expect(j.karakamshaSignIndex).toBe(R[id].jaimini.karakamshaSign);
    });
  }
  it('Rahu is never a karaka; ranking is by degree within the sign', () => {
    const k = charaKarakas({ Sun: 12 + 30, Moon: 29.5, Mars: 3 + 90, Mercury: 18 + 30, Jupiter: 25 + 300, Venus: 7, Saturn: 1 + 210, Rahu: 29.9 });
    expect(k.map(x => x.planet)).toEqual(['Moon', 'Jupiter', 'Mercury', 'Sun', 'Venus', 'Mars', 'Saturn']);
  });
  it('P1 copy: soul planet, career and partner planets in plain words', () => {
    const j = computeJaimini(PANEL.P1.t, PANEL.P1.lat, PANEL.P1.lon);
    expect(jaiminiHeadline(j)).toBe('Your Atmakaraka (soul planet) is Venus: Jaimini astrology reads love, beauty and harmony as the thread running through your life. The Moon as Amatyakaraka colours your work, and Mars as Darakaraka describes what you seek in a partner.');
    expect(karakamshaLine(j)).toMatch(/^Your Karakamsha is Gemini \(Mithuna\)/);
  });
});

describe('Chara Dasha — K.N. Rao method', () => {
  it('matches PyJHora’s documented K.N. Rao example (Chennai 1996-12-07 10:34) sign by sign', () => {
    const { t, lat, lon } = PANEL.CH;
    const j = computeJaimini(t, lat, lon);
    const exp = [[9, 10], [8, 12], [7, 4], [6, 12], [5, 9], [4, 9], [3, 9], [2, 6], [1, 5], [0, 4], [11, 3], [10, 11]];
    expect(j.charaDasha.map(p => [p.signIndex, p.years])).toEqual(exp);
    // Documented 2nd-period start: 2006-12-08 00:05:38 IST = 2006-12-07T18:35:38Z (sidereal years).
    expect(Math.abs(Date.parse(j.charaDasha[1].start) - Date.parse('2006-12-07T18:35:38Z'))).toBeLessThan(60_000);
    // Documented 7th-period start: 2052-12-07 19:07:12 IST.
    expect(Math.abs(Date.parse(j.charaDasha[6].start) - Date.parse('2052-12-07T13:37:12Z'))).toBeLessThan(120_000);
    expect(j.charaForward).toBe(false); // Capricorn Lagna, 9th = Virgo (even-footed) → backwards
  });

  for (const id of ['P1', 'P2', 'P9', 'P10']) {
    it(`${id}: same signs and years as PyJHora (K.N. Rao, Lahiri, mean nodes)`, () => {
      const { t, lat, lon } = PANEL[id];
      expect(computeJaimini(t, lat, lon).charaDasha.map(p => [p.signIndex, p.years])).toEqual(PJ[id].map(r => [r[0], r[1]]));
    });
  }

  it('P3: the one recorded difference — Aquarius lord chosen by planets only (PyJHora also counts the Lagna)', () => {
    // Saturn (Sagittarius, with Mercury + the Lagna) vs Rahu (Capricorn, with Sun + Venus).
    // Planets only: Rahu 2 > Saturn 1 → Rahu → Aquarius 1 year. PyJHora: 2 = 2 → … → Saturn → 2 years.
    const j = computeJaimini(PANEL.P3.t, PANEL.P3.lat, PANEL.P3.lon);
    const ours = j.charaDasha.map(p => [p.signIndex, p.years]);
    const theirs = PJ.P3.map(r => [r[0], r[1]]);
    expect(ours.filter((r, i) => r[1] !== theirs[i][1])).toEqual([[10, 1]]);
    expect(theirs.find(r => r[0] === 10)).toEqual([10, 2]);
    expect(j.charaDasha.find(p => p.signIndex === 10)!.lord).toBe('Rahu');
  });

  it('direction rule and Jaimini sign aspects', () => {
    expect(charaDashaSequence(0).slice(0, 3)).toEqual([0, 1, 2]);   // Aries: 9th Sagittarius odd-footed → forwards
    expect(charaDashaSequence(1).slice(0, 3)).toEqual([1, 0, 11]);  // Taurus: 9th Capricorn even-footed → backwards
    expect(rashiAspects(0, 4)).toBe(true);  expect(rashiAspects(0, 1)).toBe(false); // movable → fixed, not the adjacent
    expect(rashiAspects(1, 3)).toBe(true);  expect(rashiAspects(1, 0)).toBe(false); // fixed → movable, not the adjacent
    expect(rashiAspects(2, 5)).toBe(true);  expect(rashiAspects(2, 3)).toBe(false); // dual → dual
  });

  it('currentCharaPeriod finds the running sign', () => {
    const j = computeJaimini(PANEL.CH.t, PANEL.CH.lat, PANEL.CH.lon);
    expect(currentCharaPeriod(j, new Date('2026-10-29T00:00:00Z'))!.signIndex).toBe(6); // Libra 2022–2034
  });
});
