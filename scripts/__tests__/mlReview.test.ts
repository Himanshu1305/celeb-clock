/** B20 — Malayalam review sheet: M1 coverage, M2 completeness, M3 import round-trip. */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rows } from '../export-ml-review.mts';
import { mlStrings } from '../lib-ml-strings.mts';
import ml from '../../src/lib/lang/copy/ml';
import vocab from '../../src/lib/lang/vocab/ml.js';

const leafCount = (v: unknown): number => typeof v === 'string' ? (/[ഀ-ൿ]/.test(v) ? 1 : 0)
  : Array.isArray(v) ? v.reduce((s: number, x) => s + leafCount(x), 0)
    : v && typeof v === 'object' ? Object.values(v as object).reduce((s: number, x) => s + leafCount(x), 0) : 0;

describe('Malayalam review sheet', () => {
  it('M1 — every Malayalam string in copy/ml.ts and vocab/ml.js has a row', () => {
    const r = rows();
    const plain = r.filter(x => !x.ID.endsWith('()')).length;
    expect(plain).toBe(leafCount(ml) + leafCount(vocab));
    expect(r.length).toBe(mlStrings().length);
  });
  it('M2 — no empty Malayalam or English meaning, IDs unique', () => {
    const r = rows();
    expect(r.filter(x => !x.Malayalam.trim() || !x.English.trim()).map(x => x.ID)).toEqual([]);
    expect(new Set(r.map(x => x.ID)).size).toBe(r.length);
  });
  it.skipIf(!existsSync('docs/review/malayalam-review.xlsx'))('M3 — importing the untouched workbook reports 0 changes', () => {
    const out = execFileSync('python3', ['scripts/import-ml-review.py', 'docs/review/malayalam-review.xlsx'], { encoding: 'utf8' });
    expect(out.trim().split('\n').pop()).toBe('0 change(s) suggested.');
  });
});
