/**
 * B21 — Avkahada Chakra and Ghatak Chakra.
 * AV1: every Avkahada field vs FuturePoint's published tables for 80 charts
 *      (golden/avakahadaFuturePoint.json). Our Sun, Moon and Lagna come from the engine.
 * AV2: Ghatak table — both sources agree, Moon ghatak signs, every Moon sign covered.
 */
import { describe, it, expect } from 'vitest';
import ref from './golden/avakahadaFuturePoint.json';
import { computeAvakahada, computeGhatak, payaByNakshatra, yunja, vargaOf, SIGN_EN } from '../avakahada';
import { getSiderealLongitude, calculateLagna } from '../engine/vedicEngine';
import { COUNTS } from '../../accuracy/evidence';

type Fp = typeof ref.charts[number];
const FIELDS = ['nakshatra', 'pada', 'yoga', 'karana', 'gana', 'yoni', 'nadi', 'varna', 'vashya', 'varga', 'yunja', 'hansak', 'payaRashi', 'payaNakshatra'] as const;

function ours(c: Fp) {
  const [d, t] = c.local.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, mi, s] = t.split(':').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, day, h, mi, s) - c.tzHours * 3_600_000);
  const lagna = calculateLagna(utc, c.lat, c.lon).ascSidereal;
  return computeAvakahada({ sun: getSiderealLongitude('Sun', utc, 'natal'), moon: getSiderealLongitude('Moon', utc, 'natal'), lagnaSignIndex: Math.floor(lagna / 30) });
}

describe('Avkahada Chakra vs FuturePoint', () => {
  it(`AV1 — ${COUNTS.avakahadaCharts} charts × ${FIELDS.length} fields`, () => {
    let checks = 0, same = 0;
    const misses: string[] = [];
    for (const c of ref.charts) {
      const a = ours(c);
      expect(a.lagna, `${c.id} lagna`).toBe(c.fp.lagna);
      for (const f of FIELDS) {
        checks++;
        const v = (a as unknown as Record<string, unknown>)[f];
        if (v === (c.fp as Record<string, unknown>)[f]) same++; else misses.push(`${c.id}.${f}: ours ${v} / FP ${(c.fp as Record<string, unknown>)[f]}`);
      }
    }
    // eslint-disable-next-line no-console
    if (misses.length) console.log('[avakahada] differences:\n' + misses.join('\n'));
    expect(ref.charts.length).toBe(COUNTS.avakahadaCharts);
    expect(checks).toBe(COUNTS.avakahadaChecks);
    expect(same).toBe(COUNTS.avakahadaSame);
    // Every difference is the documented Vashya split (Sagittarius 15–30°, Capricorn 0–15°).
    expect(misses.every(m => m.includes('.vashya:'))).toBe(true);
    expect(misses).toHaveLength(COUNTS.avakahadaVashyaSplit);
  });

  it('rules: Paya and Yunja cover all 27 stars; Varga groups', () => {
    const p = Array.from({ length: 27 }, (_, i) => payaByNakshatra(i));
    expect(p.filter(x => x === 'Gold')).toHaveLength(6);
    expect(p.filter(x => x === 'Silver')).toHaveLength(10);
    expect(p.filter(x => x === 'Copper')).toHaveLength(9);
    expect(p.filter(x => x === 'Iron')).toHaveLength(2);
    const y = Array.from({ length: 27 }, (_, i) => yunja(i));
    expect([y.filter(x => x === 'Purva').length, y.filter(x => x === 'Madhya').length, y.filter(x => x === 'Antya').length]).toEqual([6, 12, 9]);
    expect([vargaOf('ची'), vargaOf('मी'), vargaOf('डी'), vargaOf('दो'), vargaOf('सी'), vargaOf('ई'), vargaOf('लू'), vargaOf('खो')])
      .toEqual(['Simha', 'Mooshak', 'Shwan', 'Sarpa', 'Mesha', 'Garuda', 'Mriga', 'Marjar']);
  });
});

describe('Ghatak Chakra', () => {
  it('AV2 — Moon ghatak signs match Antim Parichay (man and woman) for all 12 Moon signs', () => {
    // Antim Parichay (via sanjayprabhakaran.blogspot.com, Oct 2013): Purusha / Stri ghata-chandra.
    const male = ['Aries', 'Virgo', 'Aquarius', 'Leo', 'Capricorn', 'Gemini', 'Sagittarius', 'Taurus', 'Pisces', 'Leo', 'Sagittarius', 'Aquarius'];
    const female = ['Aries', 'Sagittarius', 'Sagittarius', 'Pisces', 'Scorpio', 'Scorpio', 'Pisces', 'Sagittarius', 'Virgo', 'Scorpio', 'Gemini', 'Aquarius'];
    SIGN_EN.forEach((_, i) => {
      const g = computeGhatak(i);
      expect([g.moonMale, g.moonFemale], SIGN_EN[i]).toEqual([male[i], female[i]]);
      expect(g.tithis).toHaveLength(3);
    });
    expect(computeGhatak(0)).toMatchObject({ month: 'Kartika', day: 'Sunday', nakshatra: 'Magha', yoga: 'Vishkambha', karana: 'Bava', prahar: '1' });
    expect(computeGhatak(11)).toMatchObject({ month: 'Phalguna', day: 'Friday', nakshatra: 'Ashlesha', yoga: 'Vajra', karana: 'Chatushpada' });
  });
});
