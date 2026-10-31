/**
 * B12 regression guard — dark text on dark backgrounds.
 *
 * part-aj.css used to colour bare elements with `.paj h2{color:var(--navy)}` (specificity
 * 0,1,1), which beat Tailwind utilities such as `text-white` (0,1,0). Every legacy dark
 * section rendered inside a PajPage shell then showed navy headings on navy (~1.1:1).
 * Element-level COLOUR rules must stay at `:where(.paj) <el>` (0,0,1) so any class wins.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');
const CSS_PATH = path.join(ROOT, 'src/styles/part-aj.css');
const css = readFileSync(CSS_PATH, 'utf8');

/** Flat list of [selectorList, declarations] for every style rule (media blocks unwrapped). */
function rules(src: string): Array<[string, string]> {
  const s = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: Array<[string, string]> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const sel = m[1].trim().replace(/^@[^{]*\{\s*/, '');
    if (sel.startsWith('@') || /^(from|to|\d+%)$/.test(sel)) continue;
    out.push([sel, m[2]]);
  }
  return out;
}

const ELEMENT_ONLY = /^\.paj(?:\.[a-z-]+)? [a-z][a-z0-9]*(?:\s*>\s*[a-z][a-z0-9]*)*(?::{1,2}(?:before|after))?$/;

describe('part-aj.css element colour rules never beat utility classes', () => {
  it('no element-only `.paj <el>` selector sets a colour', () => {
    const offenders = rules(css)
      .filter(([sel, decls]) => /(^|;)\s*color\s*:/.test(decls) && sel.split(',').some(p => ELEMENT_ONLY.test(p.trim())))
      .map(([sel]) => sel);
    expect(offenders).toEqual([]);
  });

  it('unstyled paj headings are still navy, via a zero-specificity scope', () => {
    expect(css).toContain(':where(.paj) h1,:where(.paj) h2,:where(.paj) h3,:where(.paj) h4{color:var(--navy)}');
    expect(css).toContain(':where(.paj) a{color:inherit}');
    expect(css).toContain(':where(.paj) button{color:inherit}');
    expect(css).toContain(':where(.paj) em{color:var(--accent-text)}');
  });

  it('bare headings inside a light-text wrapper (legacy dark bands) inherit instead of turning navy', () => {
    const rule = rules(css).find(([sel]) => sel.includes(':where(.text-white'));
    expect(rule).toBeDefined();
    expect(rule![0]).toMatch(/^:where\(\.paj\) :where\([^)]*\) :is\(h1,h2,h3,h4,em\)$/);
    expect(rule![1]).toContain('color:inherit');
    // it must come AFTER the navy default (same specificity — source order decides)
    expect(css.indexOf(rule![0])).toBeGreaterThan(css.indexOf(':where(.paj) h1,:where(.paj) h2'));
  });

  it('paj typography (non-colour) rules keep their original selectors', () => {
    expect(css).toMatch(/\.paj h2\{font-size:clamp\(28px,2\.7vw,41px\)/);
    expect(css).toContain('.paj em{font-style:normal}');
  });

  it('scripts/build-paj-css.mjs regenerates the committed stylesheet byte-for-byte', () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'paj-css-'));
    try {
      mkdirSync(path.join(tmp, 'src/styles'), { recursive: true });
      symlinkSync(path.join(ROOT, 'docs'), path.join(tmp, 'docs'));
      execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-paj-css.mjs')], { cwd: tmp, stdio: 'pipe' });
      expect(readFileSync(path.join(tmp, 'src/styles/part-aj.css'), 'utf8')).toBe(css);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
