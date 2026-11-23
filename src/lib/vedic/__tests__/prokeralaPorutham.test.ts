/**
 * B19 — 10 Porutham and Papasamyam vs ProKerala's calculators (12 couples, 23 Nov 2026).
 * Backs the "porutham" and "papasamyam" rows on /accuracy (src/lib/accuracy/evidence.ts).
 * ProKerala scores some poruthams 0 / 0.5 / 1; anything above 0 counts as "agrees" here.
 */
import { describe, it, expect } from 'vitest';
import REF from './golden/prokeralaPorutham.json';
import { calculateBirthChart } from '../calculateBirthChart';
import { calculatePorutham } from '../porutham';
import { calculatePapasamyam, papaInputFromChart, houseFrom } from '../papasamyam';
import { RASHI_NAMES } from '../engine/vedicEngine';
import { COUNTS } from '../../accuracy/evidence';

const KEY: Record<string, string> = { Dina: 'dina', Gana: 'gana', Mahendra: 'mahendra', 'Stree Deergha': 'stree-deergha', Yoni: 'yoni', Veda: 'vedha', Rajju: 'rajju', Rasi: 'rasi', Rasiyathipathi: 'rasyadhipathi', Vasya: 'vasya' };
const h24 = (h: string, ap: string) => (Number(h) % 12) + (ap === 'pm' ? 12 : 0);
const chart = (a: string[]) => calculateBirthChart({ year: +a[0], month: +a[1], day: +a[2], hour: h24(a[3], a[5]), minute: +a[4], latitude: 23.1765, longitude: 75.7885, timezoneOffset: 5.5 }, { refDate: new Date('2026-11-23T00:00:00Z') });

describe('10 Porutham + Papasamyam vs ProKerala', () => {
  it('matches the counts stated on /accuracy', async () => {
    let checks = 0, agree = 0, positions = 0, posAgree = 0, verdicts = 0;
    const diffs: Record<string, number> = {};
    for (const c of REF.couples) {
      const [g, b] = [await chart(c.girl), await chart(c.boy)];
      const pi = (x: Awaited<ReturnType<typeof chart>>) => ({ nakshatra: x.nakshatra.nakshatra, rashiIndex: Math.max(0, RASHI_NAMES.indexOf(x.rashi)) });
      const por = calculatePorutham(pi(g), pi(b));
      for (const [k, v] of Object.entries(c.tamil)) {
        checks++;
        const ours = por.poruthams.find(p => p.key === KEY[k])!.met;
        if (ours === (v as number) > 0) agree++; else diffs[k] = (diffs[k] ?? 0) + 1;
      }
      const gi = papaInputFromChart(g), bi = papaInputFromChart(b);
      const rows = c.papa.map(r => r.split(','));
      const pos = (inp: ReturnType<typeof papaInputFromChart>, r: string[]) => {
        const s = inp.signs[r[0] as 'Mars'];
        [inp.lagnaSign, inp.moonSign, inp.venusSign].forEach((ref, i) => { positions++; if (houseFrom(ref, s) === +r[1 + 2 * i]) posAgree++; });
      };
      rows.slice(0, 4).forEach(r => pos(gi, r)); rows.slice(4).forEach(r => pos(bi, r));
      if (calculatePapasamyam(gi, bi).balanced === (c.papaMore === 'Boy')) verdicts++;
    }
    expect(REF.couples.length).toBe(COUNTS.poruthamCouples);
    expect(checks).toBe(COUNTS.poruthamChecks);
    expect(agree).toBe(COUNTS.poruthamAgree);
    expect(diffs).toEqual(COUNTS.poruthamDiffs);
    expect([positions, posAgree]).toEqual([COUNTS.papaPositions, COUNTS.papaPositions]);
    expect(verdicts).toBe(COUNTS.poruthamCouples);
  }, 60_000);
});
