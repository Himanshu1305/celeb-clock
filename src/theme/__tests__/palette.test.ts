/**
 * B13 — the brand palette has ONE source of truth: the `--brand-*` variables in src/index.css.
 * src/theme/palette.ts mirrors them as hex (for canvas / SVG / email / PDF output) and the
 * Tailwind `brand-*` colours + part-aj.css `.paj` variables reference them. These tests fail
 * if any of the copies drift apart.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { palette, brandVar, tokenSlug } from '../palette';

const ROOT = path.resolve(__dirname, '../../..');
const indexCss = readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');
const pajCss = readFileSync(path.join(ROOT, 'src/styles/part-aj.css'), 'utf8');

function cssBrandVars(): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of indexCss.matchAll(/--brand-([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) {
    const hex = '#' + [m[2], m[3], m[4]].map(n => (+n).toString(16).padStart(2, '0')).join('').toUpperCase();
    expect(out.has(m[1]), `--brand-${m[1]} is defined twice in src/index.css`).toBe(false);
    out.set(m[1], hex);
  }
  return out;
}

describe('brand palette — src/theme/palette.ts ⇄ src/index.css', () => {
  const vars = cssBrandVars();

  it('every palette.ts token has a --brand-* variable with the same value', () => {
    const mismatches = Object.entries(palette)
      .map(([k, hex]) => ({ k, css: `--brand-${tokenSlug(k)}`, hex: hex.toUpperCase(), cssHex: vars.get(tokenSlug(k)) }))
      .filter(r => r.cssHex !== r.hex)
      .map(r => `${r.css}: index.css=${r.cssHex ?? 'MISSING'} palette.ts=${r.hex}`);
    expect(mismatches).toEqual([]);
  });

  it('every --brand-* variable in index.css exists in palette.ts', () => {
    const slugs = new Set(Object.keys(palette).map(tokenSlug));
    expect([...vars.keys()].filter(k => !slugs.has(k))).toEqual([]);
  });

  it('palette hex values are unique (one name per colour)', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const [k, v] of Object.entries(palette)) {
      const h = v.toUpperCase();
      if (seen.has(h)) dupes.push(`${k} = ${seen.get(h)} (${h})`);
      seen.set(h, k);
    }
    expect(dupes).toEqual([]);
  });

  it('brandVar.* are CSS-variable references to the same tokens', () => {
    for (const k of Object.keys(palette) as (keyof typeof palette)[]) {
      expect(brandVar[k]).toBe(`rgb(var(--brand-${tokenSlug(k)}))`);
    }
  });

  it('part-aj.css .paj variables reference the brand variables (no duplicated hex)', () => {
    const root = pajCss.match(/^\.paj\{(--[^}]*)\}$/m)?.[1] ?? '';
    for (const [v, tok] of [['--bg', 'ivory'], ['--paper', 'paper'], ['--navy', 'navy'], ['--ink', 'ink'], ['--muted', 'muted'], ['--line', 'line'], ['--accent', 'gold'], ['--accent-text', 'gold-ink'], ['--green', 'gold']]) {
      expect(root).toContain(`${v}:rgb(var(--brand-${tok}))`);
    }
    // any brand-valued hex left in the generated sheet means the generator missed it
    const brandHex = new Set([...vars.values()].filter(h => h !== '#FFFFFF'));
    const left = (pajCss.replace(/\/\*[\s\S]*?\*\//g, '').match(/#[0-9A-Fa-f]{6}(?![0-9A-Fa-f\w-])/g) ?? []).filter(h => brandHex.has(h.toUpperCase()));
    expect(left).toEqual([]);
  });
});
