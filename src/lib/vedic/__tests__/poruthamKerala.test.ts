/**
 * B20 — Kerala porutham vs ProKerala's Kerala calculator.
 * K1: the 12 real couples (prokeralaKerala.json) · sweep: 223 mapped pairs (prokeralaKeralaSweep.json)
 * K2–K5: rule and shape checks · K6: Papasamyam rows · K7: the Tamil engine is unchanged.
 */
import { describe, it, expect } from 'vitest';
import COUPLES from './golden/prokeralaKerala.json';
import SWEEP from './golden/prokeralaKeralaSweep.json';
import TAMIL from './golden/prokeralaPorutham.json';
import { calculateBirthChart } from '../calculateBirthChart';
import { calculatePoruthamKerala, type KeralaPerson } from '../poruthamKerala';
import { calculatePorutham } from '../porutham';
import { papaInputFromChart, houseFrom, calculatePapasamyam } from '../papasamyam';
import { RASHI_NAMES } from '../engine/vedicEngine';
import { COUNTS } from '../../accuracy/evidence';

const ORDER = ['dina', 'gana', 'mahendra', 'stree-deergha', 'yoni', 'vedha', 'rajju', 'rasi', 'rasyadhipathi', 'vasya'];
const KEYMAP: Record<string, string> = { Dina: 'dina', Gana: 'gana', Mahendra: 'mahendra', 'Stree Deergha': 'stree-deergha', Yoni: 'yoni', Veda: 'vedha', Rajju: 'rajju', Rasi: 'rasi', Rasiyathipathi: 'rasyadhipathi', Vasya: 'vasya' };
const h24 = (h: string | number, ap: string) => (Number(h) % 12) + (ap === 'pm' ? 12 : 0);
const cache = new Map<string, Promise<Awaited<ReturnType<typeof calculateBirthChart>>>>();
const chart = (a: Array<string | number>) => {
  const k = a.join(',');
  if (!cache.has(k)) cache.set(k, calculateBirthChart({ year: +a[0], month: +a[1], day: +a[2], hour: h24(a[3], String(a[5])), minute: +a[4], latitude: 23.1765, longitude: 75.7885, timezoneOffset: 5.5 }, { refDate: new Date('2026-11-23T00:00:00Z') }));
  return cache.get(k)!;
};
const person = async (a: Array<string | number>): Promise<KeralaPerson> => {
  const c = await chart(a);
  return { nakshatra: c.nakshatra.nakshatra, rashiIndex: Math.max(0, RASHI_NAMES.indexOf(c.rashi)) };
};
const scoreOf = (r: ReturnType<typeof calculatePoruthamKerala>, key: string) => r.poruthams.find(p => p.key === key)!.score;

describe('Kerala porutham vs ProKerala', () => {
  it('K1 — 12 real couples × 10 poruthams', async () => {
    let checks = 0, agree = 0;
    const diffs: string[] = [];
    for (const [i, c] of (COUPLES as Array<{ g: string[]; b: string[]; por: Record<string, number> }>).entries()) {
      const r = calculatePoruthamKerala(await person(c.g), await person(c.b));
      for (const [k, v] of Object.entries(c.por)) {
        checks++;
        if (scoreOf(r, KEYMAP[k]) === v) agree++; else diffs.push(`couple ${i} ${k}: ours ${scoreOf(r, KEYMAP[k])} vs ${v}`);
      }
    }
    expect(diffs).toEqual([]);
    expect([checks, agree]).toEqual([COUNTS.keralaChecks, COUNTS.keralaAgree]);
  }, 120_000);

  it('sweep — 223 mapped pairs × 10 poruthams', async () => {
    let checks = 0, agree = 0;
    const diffs: string[] = [];
    for (const p of SWEEP.pairs) {
      const r = calculatePoruthamKerala(await person(p.girl), await person(p.boy));
      p.score.forEach((v, j) => { checks++; if (scoreOf(r, ORDER[j]) === v) agree++; else diffs.push(`${p.girl.join(',')} / ${p.boy.join(',')} ${ORDER[j]}: ours ${scoreOf(r, ORDER[j])} vs ${v}`); });
    }
    expect(diffs.slice(0, 20)).toEqual([]);
    expect([checks, agree]).toEqual([COUNTS.keralaSweepChecks, COUNTS.keralaSweepAgree]);
  }, 300_000);

  it('K2 — every porutham shows each score it can take', () => {
    const seen: Record<string, Set<number>> = Object.fromEntries(ORDER.map(k => [k, new Set<number>()]));
    for (const p of SWEEP.pairs) p.score.forEach((v, j) => seen[ORDER[j]].add(v));
    for (const k of ['gana', 'stree-deergha', 'yoni', 'rajju', 'rasi']) expect([...seen[k]].sort()).toEqual([0, 0.5, 1]);
    for (const k of ['dina', 'mahendra', 'vedha', 'rasyadhipathi', 'vasya']) expect([...seen[k]].sort()).toEqual([0, 1]);
  });

  it('K3 — same star: Dina agrees; Rajju is 0 in Kati, 0.5 in Pada/Nabhi; Vedha clear', () => {
    const chitra = calculatePoruthamKerala({ nakshatra: 'Chitra', rashiIndex: 5 }, { nakshatra: 'Chitra', rashiIndex: 6 });
    expect([scoreOf(chitra, 'dina'), scoreOf(chitra, 'rajju'), scoreOf(chitra, 'vedha')]).toEqual([1, 0, 1]);
    const ashwini = calculatePoruthamKerala({ nakshatra: 'Ashwini', rashiIndex: 0 }, { nakshatra: 'Ashwini', rashiIndex: 0 });
    expect(scoreOf(ashwini, 'rajju')).toBe(0.5);
    const rohini = calculatePoruthamKerala({ nakshatra: 'Rohini', rashiIndex: 1 }, { nakshatra: 'Rohini', rashiIndex: 1 });
    expect(scoreOf(rohini, 'rajju')).toBe(0.5);
  });

  it('K4 — swapping girl and boy changes only the direction-sensitive poruthams', () => {
    const a = { nakshatra: 'Bharani', rashiIndex: 0 }, b = { nakshatra: 'Chitra', rashiIndex: 5 };
    const ab = calculatePoruthamKerala(a, b), ba = calculatePoruthamKerala(b, a);
    for (const k of ['vedha', 'rajju', 'rasyadhipathi']) expect(scoreOf(ab, k)).toBe(scoreOf(ba, k));
    // From the sweep: Bharani girl/Chitra boy vs the reverse differ on Dina, Gana, Yoni and Rasi.
    expect([scoreOf(ab, 'dina'), scoreOf(ba, 'dina')]).toEqual([1, 0]);
    expect([scoreOf(ab, 'gana'), scoreOf(ba, 'gana')]).toEqual([0.5, 0]);
    expect([scoreOf(ab, 'yoni'), scoreOf(ba, 'yoni')]).toEqual([0, 1]);
  });

  it('K5 — totals are 0–10 in half steps for every star and sign pair', () => {
    const NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
    for (const g of NAK) for (const b of NAK) for (const rs of [0, 5, 11]) {
      const t = calculatePoruthamKerala({ nakshatra: g, rashiIndex: rs }, { nakshatra: b, rashiIndex: (rs + 7) % 12 }).total;
      expect(Number.isFinite(t) && t >= 0 && t <= 10 && t * 2 === Math.round(t * 2)).toBe(true);
    }
    expect(() => calculatePoruthamKerala({ nakshatra: 'Nope', rashiIndex: 0 }, { nakshatra: 'Ashwini', rashiIndex: 0 })).toThrow();
  });

  it('K6 — Papasamyam matches the Kerala calculator rows for all 12 couples', async () => {
    let positions = 0, agree = 0, verdicts = 0;
    for (const c of COUPLES as Array<{ g: string[]; b: string[]; papa: string[]; pv: string }>) {
      const gi = papaInputFromChart(await chart(c.g)), bi = papaInputFromChart(await chart(c.b));
      const rows = c.papa.map(r => r.split(','));
      const check = (inp: typeof gi, r: string[]) => [inp.lagnaSign, inp.moonSign, inp.venusSign].forEach((ref, i) => { positions++; if (houseFrom(ref, inp.signs[r[0] as 'Mars']) === +r[1 + 2 * i]) agree++; });
      rows.slice(0, 4).forEach(r => check(gi, r)); rows.slice(4).forEach(r => check(bi, r));
      if (calculatePapasamyam(gi, bi).balanced === (c.pv === 'Boy')) verdicts++;
    }
    expect([positions, agree, verdicts]).toEqual([COUNTS.papaPositions, COUNTS.papaPositions, 12]);
  }, 120_000);

  it('K7 — the Tamil engine still gives its published results', async () => {
    let agree = 0;
    for (const c of TAMIL.couples) {
      const g = await person(c.girl), b = await person(c.boy);
      const por = calculatePorutham(g, b);
      for (const [k, v] of Object.entries(c.tamil)) if (por.poruthams.find(p => p.key === KEYMAP[k])!.met === (v as number) > 0) agree++;
    }
    expect(agree).toBe(COUNTS.poruthamAgree);
  }, 120_000);
});
