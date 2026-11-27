/**
 * Deep Vimshottari Dasha (levels 3–5: Pratyantar, Sookshma, Prana) vs PyJHora.
 * Reference: golden/dashaDeepJHora.json, made by golden/dashaDeepJHora_ref.py (PyJHora 5.0.6, Lahiri).
 *
 * D1 — the rules: given PyJHora's Mahadasha, our subPeriods() gives the same 9 children at every
 *      level down to Prana (lord, start, end) for all 22 golden births → 792 periods.
 * D2 — the whole chain: our engine's own Mahadasha (from /api/kundali) subdivided by subPeriods()
 *      gives the same Maha → Antar → Pratyantar → Sookshma → Prana lords at the reference date,
 *      with every period start within the stated hours of PyJHora's.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import ref from './golden/dashaDeepJHora.json';
import { subPeriods } from '../dashaDeep';
import { GET as kundaliGET } from '../../../../api/kundali';
import { GOLDEN, REF_DATE, birthQuery } from '../../../../scripts/golden/compareGolden';
import { COUNTS } from '../../accuracy/evidence';

type Row = [string, string, string];
const sec = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / 1000;

describe('Deep Dasha vs PyJHora (22 golden births)', () => {
  it('D1 — the same 9 sub-periods at levels 2–5, every period within 1 second', () => {
    let periods = 0, worst = 0;
    for (const b of ref.births) {
      let parent = b.path[0];
      b.levels.forEach((rows, i) => {
        const ours = subPeriods(parent.lord, parent.start, parent.end);
        expect(ours.map(p => p.lord), `${b.id} level ${i + 2}`).toEqual((rows as Row[]).map(r => r[0]));
        ours.forEach((p, j) => { worst = Math.max(worst, sec(p.start, (rows as Row[])[j][1]), sec(p.end, (rows as Row[])[j][2])); periods++; });
        parent = b.path[i + 1];
      });
    }
    expect(periods).toBe(COUNTS.dashaDeepPeriods);
    expect(worst).toBeLessThanOrEqual(1);
  });

  describe('D2 — our engine, all five levels at the reference date', () => {
    beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(REF_DATE); });
    afterAll(() => { vi.useRealTimers(); });

    it('same lords at every level; period starts within the stated hours', async () => {
      const births = [...GOLDEN.charts, ...GOLDEN.coupleBirths];
      const t = REF_DATE.getTime();
      let same = 0, worstH = 0;
      const sameByLevel = [0, 0, 0, 0, 0];
      for (const g of births) {
        const r = ref.births.find(x => x.id === g.id)!;
        const k = await (await kundaliGET(new Request(`http://localhost/api/kundali?${new URLSearchParams(birthQuery(g))}`))).json();
        let p = { lord: k.dasha.mahadasha as string, start: k.dasha.mahadasha_start as string, end: k.dasha.mahadasha_end as string };
        const chain = [p];
        for (let l = 1; l < 5; l++) {
          p = subPeriods(p.lord, p.start, p.end).find(c => t >= Date.parse(c.start) && t < Date.parse(c.end))!;
          chain.push(p);
        }
        let all = true;
        chain.forEach((c, l) => {
          if (c.lord === r.path[l].lord) { sameByLevel[l]++; worstH = Math.max(worstH, sec(c.start, r.path[l].start) / 3600); } else all = false;
        });
        if (all) same++;
      }
      // eslint-disable-next-line no-console
      console.log(`[deep dasha] same chain ${same}/${births.length}; by level ${sameByLevel.join('/')}; worst start ${worstH.toFixed(2)} h`);
      expect(sameByLevel).toEqual([births.length, births.length, births.length, COUNTS.dashaDeepSookshmaSame, COUNTS.dashaDeepPranaSame]);
      expect(same).toBe(COUNTS.dashaDeepChainSame);
      expect(worstH).toBeLessThanOrEqual(COUNTS.dashaDeepMaxHours);
    }, 120_000);
  });
});
