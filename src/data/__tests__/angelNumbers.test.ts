import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import {
  ANGEL_NUMBERS, ANGEL_SEQUENCES, ANGEL_SEO, angelNumerology, angelTitle, numerologyText,
} from '../angelNumbers';
import { reduceKeepingMaster, lifePathNumber } from '@/lib/lifePath';
import { duplicateRedirect } from '@/lib/seo/duplicateRedirects';

const { getAllRoutes } = await import('../../../scripts/prerender-routes.mjs');
const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');
const routes: string[] = await getAllRoutes();

const EXPECTED = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999', '1010', '1111', '1212', '1234', '2222'];

describe('angel numbers — data', () => {
  it('has exactly the 15 sequences in scope, once each', () => {
    expect([...ANGEL_SEQUENCES].sort()).toEqual([...EXPECTED].sort());
    expect(new Set(ANGEL_SEQUENCES).size).toBe(ANGEL_SEQUENCES.length);
  });

  it('SEO JSON (read by the prerender + sitemap scripts) has the same keys', () => {
    expect(Object.keys(ANGEL_SEO).sort()).toEqual([...EXPECTED].sort());
  });

  it('Worker real-404 allow-list matches the data', () => {
    const w = readFileSync('functions/_worker.ts', 'utf8');
    const m = w.match(/const ANG = new Set\(\[([^\]]+)\]\)/);
    expect(m).toBeTruthy();
    const ids = m![1].split(',').map(s => s.trim().replace(/'/g, ''));
    expect(ids.sort()).toEqual([...EXPECTED].sort());
  });

  it('every page has all sections, distinct text, and real https sources', () => {
    const answers = new Set<string>();
    for (const a of ANGEL_NUMBERS) {
      for (const k of ['theme', 'answer', 'meaning', 'love', 'career', 'twinFlame'] as const) {
        expect(a[k].length, `${a.sequence}.${k}`).toBeGreaterThan(k === 'theme' ? 3 : 40);
      }
      expect(a.whatToDo.length, a.sequence).toBeGreaterThanOrEqual(3);
      expect(a.sources.length, a.sequence).toBeGreaterThanOrEqual(2);
      for (const s of a.sources) expect(s.url).toMatch(/^https:\/\//);
      answers.add(a.answer);
      for (const r of a.related) {
        expect(EXPECTED, `${a.sequence} related ${r}`).toContain(r);
        expect(r).not.toBe(a.sequence);
      }
    }
    expect(answers.size).toBe(ANGEL_NUMBERS.length);
  });

  it('answer-first: 2–3 sentences, and framed as belief, not prediction', () => {
    for (const a of ANGEL_NUMBERS) {
      const sentences = a.answer.split(/(?<=[.!?])\s+(?=[A-Z0-9"])/).filter(Boolean);
      expect(sentences.length, a.sequence).toBeGreaterThanOrEqual(2);
      expect(sentences.length, a.sequence).toBeLessThanOrEqual(3);
      expect(a.answer, a.sequence).toMatch(/belief|best-known angel number/i);
    }
  });

  it('no statistics, no fear language, no certainty claims', () => {
    const fear = /\b(death|die|dies|doom(ed)?|cursed|danger(ous)?|terrible|fatal|evil omen|will definitely|guaranteed to)\b/i;
    for (const a of ANGEL_NUMBERS) {
      const all = [a.answer, a.meaning, a.love, a.career, a.twinFlame, ...a.whatToDo, a.extra?.text ?? ''].join(' ');
      expect(all, a.sequence).not.toMatch(/%|per ?cent|\bmillions?\b|\bsurvey\b/i);
      expect(fear.test(all), `${a.sequence}: ${all.match(fear)?.[0]}`).toBe(false);
    }
  });
});

describe('angel numbers — numerology uses the one sitewide reduction', () => {
  // Expected values are plain digit arithmetic, reduced with the founder-decided rule
  // (keep 11/22/33) — src/lib/lifePath.ts.
  it.each([
    ['000', 0, 0], ['111', 3, 3], ['222', 6, 6], ['333', 9, 9], ['444', 12, 3],
    ['555', 15, 6], ['666', 18, 9], ['777', 21, 3], ['888', 24, 6], ['999', 27, 9],
    ['1010', 2, 2], ['1111', 4, 4], ['1212', 6, 6], ['1234', 10, 1], ['2222', 8, 8],
  ])('%s → sum %i → %i', (seq, sum, root) => {
    const n = angelNumerology(seq);
    expect(n.sum).toBe(sum);
    expect(n.root).toBe(root);
    expect(n.root).toBe(reduceKeepingMaster(sum));
  });

  it('shows the working and flags master-number repeats', () => {
    expect(angelNumerology('1234').working).toBe('1 + 2 + 3 + 4 = 10 → 1');
    expect(angelNumerology('444').working).toBe('4 + 4 + 4 = 12 → 3');
    expect(angelNumerology('1111').containsMaster).toEqual([11]);
    expect(angelNumerology('2222').containsMaster).toEqual([22]);
    expect(angelNumerology('1212').containsMaster).toEqual([]);
    expect(angelNumerology('000').isLifePathNumber).toBe(false);
  });

  it('numerology text names the Life Path theme it shares', () => {
    const a1234 = ANGEL_NUMBERS.find(a => a.sequence === '1234')!;
    expect(numerologyText(a1234)).toMatch(/add up to 10, which reduces to 1.*Life Path 1/);
    const a000 = ANGEL_NUMBERS.find(a => a.sequence === '000')!;
    expect(numerologyText(a000)).toMatch(/not one of the numerology Life Path numbers/);
  });

  it('the Life Path checker module is the shared one (15 Aug 1990 → 6, as in lifePath.ts)', () => {
    expect(lifePathNumber(15, 8, 1990)).toBe(6);
  });
});

describe('angel numbers — routes, titles, sitemap', () => {
  it('index + every number page is in the prerender list (= sitemap source)', () => {
    expect(routes).toContain('/angel-numbers');
    for (const s of EXPECTED) expect(routes).toContain(`/angel-numbers/${s}`);
    expect(routes.filter(r => r.startsWith('/angel-numbers/'))).toHaveLength(EXPECTED.length);
  });

  it('no angel route is a redirect source', () => {
    for (const r of routes.filter(r => r.startsWith('/angel-numbers'))) expect(duplicateRedirect(r)).toBeNull();
  });

  it('prerender title/description match the page and stay within limits', () => {
    for (const s of EXPECTED) {
      const meta = getTitleForRoute(`/angel-numbers/${s}`);
      expect(meta.title).toBe(angelTitle(s));
      expect(meta.title.length).toBeLessThanOrEqual(70);
      expect(meta.description).toBe(ANGEL_SEO[s]);
      expect(meta.description.length).toBeLessThanOrEqual(170);
    }
  });

  it('no angel-number title is shared with any other sitemap URL', () => {
    const byTitle = new Map<string, string[]>();
    for (const r of routes) {
      const t = getTitleForRoute(r)?.title;
      if (t) byTitle.set(t, [...(byTitle.get(t) ?? []), r]);
    }
    for (const r of routes.filter(r => r.startsWith('/angel-numbers'))) {
      const t = getTitleForRoute(r)!.title;
      expect(byTitle.get(t), t).toEqual([r]);
    }
  });
});
