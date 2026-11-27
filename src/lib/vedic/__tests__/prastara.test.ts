/** B21 — Prastarashtakavarga vs PyJHora (golden/prastaraJHora.json, 10 panel charts × 7 planets × 8 contributors × 12 signs). */
import { describe, it, expect } from 'vitest';
import ref from './golden/prastaraJHora.json';
import { AV_PLANETS, AV_CONTRIBUTORS, computePrastara, computeAshtakavarga, type AvContributor } from '../engine/ashtakavarga';
import { COUNTS } from '../../accuracy/evidence';

describe('Prastarashtakavarga', () => {
  it('PR1 — every cell equals PyJHora’s', () => {
    let cells = 0;
    for (const c of ref.charts) {
      const ours = computePrastara(c.signs as Record<AvContributor, number>);
      for (const p of AV_PLANETS) for (const k of AV_CONTRIBUTORS) {
        expect(ours[p][k], `${c.id} ${p} from ${k}`).toEqual((c.prastara as Record<string, Record<string, number[]>>)[p][k]);
        cells += 12;
      }
    }
    expect(cells).toBe(COUNTS.prastaraCells);
  });
  it('PR2 — column sums give the Bhinnashtakavarga', () => {
    for (const c of ref.charts) {
      const s = c.signs as Record<AvContributor, number>;
      const pr = computePrastara(s), av = computeAshtakavarga(s);
      for (const p of AV_PLANETS) {
        const sums = Array.from({ length: 12 }, (_, i) => AV_CONTRIBUTORS.reduce((t, k) => t + pr[p][k][i], 0));
        expect(sums).toEqual(av.bav[p]);
      }
    }
  });
});
