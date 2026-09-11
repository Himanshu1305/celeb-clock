import { describe, it, expect } from 'vitest';
import { buildMatchSynthesis, verifyMatchSynthesis } from '../matchSynthesis';
import type { GunaMilanResult, KootaDetail, DoshaDetail } from '../matchmaking';

const koota = (key: string, label: string, score: number, max: number, heavy = false): KootaDetail =>
  ({ key, label, score, max, heavy, explanation: '' });

function make(kootas: KootaDetail[], doshas: DoshaDetail[]): GunaMilanResult {
  const total = kootas.reduce((s, k) => s + k.score, 0);
  const compatibility = total >= 28 ? 'Excellent' : total >= 24 ? 'Good' : total >= 18 ? 'Acceptable' : 'Challenging';
  return { kootas, total, max: 36, compatibility, doshas, methodology: '', a: {} as any, b: {} as any };
}
const noDosha: DoshaDetail[] = [
  { name: 'Nadi Dosha', present: false, cancelled: false, reason: 'Different Nadi — no dosha.' },
  { name: 'Gana Dosha', present: false, cancelled: false, reason: 'no dosha' },
];

// A genuinely strong pairing: both heavy Kootas full, no dosha, total 26 (Good).
const STRONG = make([
  koota('varna', 'Varna', 1, 1), koota('vashya', 'Vashya', 2, 2), koota('tara', 'Tara', 1.5, 3),
  koota('yoni', 'Yoni', 2, 4), koota('graha_maitri', 'Graha Maitri', 4, 5), koota('gana', 'Gana', 0.5, 6),
  koota('bhakoot', 'Bhakoot', 7, 7, true), koota('nadi', 'Nadi', 8, 8, true),
], noDosha);

// A mixed pairing: uncancelled Nadi + Gana dosha, low total (Challenging).
const MIXED = make([
  koota('varna', 'Varna', 1, 1), koota('vashya', 'Vashya', 1, 2), koota('tara', 'Tara', 0, 3),
  koota('yoni', 'Yoni', 2, 4), koota('graha_maitri', 'Graha Maitri', 1, 5), koota('gana', 'Gana', 0, 6),
  koota('bhakoot', 'Bhakoot', 7, 7, true), koota('nadi', 'Nadi', 0, 8, true),
], [
  { name: 'Nadi Dosha', present: true, cancelled: false, reason: 'Present and not cancelled by the standard exceptions — treat as significant.' },
  { name: 'Gana Dosha', present: true, cancelled: false, reason: 'Present (Manushya–Rakshasa) and not cancelled — a genuine temperament gap.' },
]);

// A cancelled-Nadi pairing that is still Good (25) — must NOT be demoted below "strong".
const STRONG_CANCELLED = make([
  koota('varna', 'Varna', 1, 1), koota('vashya', 'Vashya', 2, 2), koota('tara', 'Tara', 3, 3),
  koota('yoni', 'Yoni', 2, 4), koota('graha_maitri', 'Graha Maitri', 5, 5), koota('gana', 'Gana', 5, 6),
  koota('bhakoot', 'Bhakoot', 7, 7, true), koota('nadi', 'Nadi', 0, 8, true),
], [
  { name: 'Nadi Dosha', present: true, cancelled: true, reason: 'Present, but classically cancelled: friendly sign-lords.' },
  { name: 'Gana Dosha', present: false, cancelled: false, reason: 'no dosha' },
]);

const overlaps = [{ range: 'March 2026 to July 2027' }];

describe('buildMatchSynthesis — calibrated, chart-specific narrative', () => {
  it('STRONG: confident verdict, both heavyweights named, cites timing', () => {
    const s = buildMatchSynthesis({ gunaMilan: STRONG, overlaps });
    expect(s.verdict).toMatch(/strong match/i);
    expect(s.verdict).toContain('26/36');
    expect(s.paragraphs[0]).toMatch(/Nadi \(8 points/);
    expect(s.paragraphs[0]).toMatch(/Bhakoot \(7 points/);
    expect(s.paragraphs[2]).toContain('March 2026 to July 2027');
    // decisive-but-not-guaranteed boundary
    expect(s.paragraphs[2]).toMatch(/not a prediction/i);
  });

  it('MIXED: honest verdict, surfaces uncancelled doshas with non-fear framing', () => {
    const s = buildMatchSynthesis({ gunaMilan: MIXED, overlaps });
    expect(s.verdict).toMatch(/mixed but honest/i);
    expect(s.verdict).toContain('Nadi Dosha');
    expect(s.verdict).toContain('Gana Dosha');
    const all = [s.verdict, ...s.paragraphs].join(' ');
    expect(all).toMatch(/mindful|conscious attention|work with honestly/i);
    // never fear-based
    expect(all).not.toMatch(/doomed|curse|disaster|dangerous/i);
    // plural grammar
    expect(s.paragraphs[2]).toMatch(/are the specific things/);
  });

  it('STRONG_CANCELLED: a cancelled Nadi dosha does NOT demote a 25/36 below "strong"', () => {
    const s = buildMatchSynthesis({ gunaMilan: STRONG_CANCELLED, overlaps });
    expect(s.verdict).toMatch(/strong match/i);
    expect(s.paragraphs[2]).toMatch(/classically cancelled/);
  });

  it('EDGE: total exactly 18 reads "workable/above the line", not overconfident', () => {
    const edge = make([
      koota('varna', 'Varna', 1, 1), koota('vashya', 'Vashya', 0, 2), koota('tara', 'Tara', 1.5, 3),
      koota('yoni', 'Yoni', 0, 4), koota('graha_maitri', 'Graha Maitri', 0.5, 5), koota('gana', 'Gana', 0, 6),
      koota('bhakoot', 'Bhakoot', 7, 7, true), koota('nadi', 'Nadi', 8, 8, true),
    ], noDosha);
    expect(edge.total).toBe(18);
    const s = buildMatchSynthesis({ gunaMilan: edge, overlaps });
    expect(s.verdict).toMatch(/workable match/i);
    expect(s.verdict).toMatch(/above the classical 18-point line/);
    expect(s.verdict).not.toMatch(/strong match/i);
  });

  it('narratives genuinely differ between pairings (not a reworded template)', () => {
    const a = buildMatchSynthesis({ gunaMilan: STRONG, overlaps }).paragraphs.join(' ');
    const b = buildMatchSynthesis({ gunaMilan: MIXED, overlaps }).paragraphs.join(' ');
    expect(a).not.toBe(b);
  });

  it('no timing overlap → states that plainly, no invented window', () => {
    const s = buildMatchSynthesis({ gunaMilan: STRONG, overlaps: [] });
    expect(s.paragraphs[2]).toMatch(/no overlapping favourable window/);
  });
});

describe('verifyMatchSynthesis — independent accuracy checker', () => {
  it('passes clean synthesis at 100%', () => {
    for (const g of [STRONG, MIXED, STRONG_CANCELLED]) {
      const s = buildMatchSynthesis({ gunaMilan: g, overlaps });
      const c = verifyMatchSynthesis(s, g, overlaps);
      expect(c.correct).toBe(c.checked);
      expect(c.checked).toBeGreaterThan(3);
    }
  });

  it('catches a tampered total', () => {
    const s = buildMatchSynthesis({ gunaMilan: STRONG, overlaps });
    s.paragraphs[0] = s.paragraphs[0] + ' (overall 99/36).';
    const c = verifyMatchSynthesis(s, STRONG, overlaps);
    expect(c.correct).toBeLessThan(c.checked);
    expect(c.failures.join(' ')).toMatch(/99\/36/);
  });

  it('catches an invented timing window', () => {
    const s = buildMatchSynthesis({ gunaMilan: STRONG, overlaps });
    // claims a joint window but real overlaps is empty
    const c = verifyMatchSynthesis(s, STRONG, []);
    expect(c.correct).toBeLessThan(c.checked);
  });
});
