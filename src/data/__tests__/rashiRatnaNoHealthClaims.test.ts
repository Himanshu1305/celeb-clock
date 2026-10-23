import { describe, it, expect } from 'vitest';
import { RASHI_RATNA_DATA } from '../rashiRatnaData';

// D9 (audit round 2): Rashi Ratna pages must not make health claims.
const HEALTH = /\b(health|heart|illness|recovery|longevity|disease|cure|nervous system|blood)\b/i;

describe('Rashi Ratna — no health claims (D9)', () => {
  it('benefits and descriptions contain no health wording', () => {
    const bad: string[] = [];
    for (const r of RASHI_RATNA_DATA as Array<Record<string, unknown>>) {
      for (const b of (r.benefits as string[]) ?? []) if (HEALTH.test(b)) bad.push(`${r.rashi}: ${b}`);
      if (typeof r.description === 'string' && HEALTH.test(r.description)) bad.push(`${r.rashi}: description`);
    }
    expect(bad).toEqual([]);
  });
});
