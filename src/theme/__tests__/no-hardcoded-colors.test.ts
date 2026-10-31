/**
 * B13 guardrail — colours are managed centrally (src/index.css --brand-* → Tailwind brand-*,
 * src/theme/palette.ts). This fails when new code hard-codes a hex colour where a token
 * should be used:
 *
 *  1. Tailwind arbitrary colour classes   text-[#6E5AA6], bg-[#0E2238]/10 …  → text-brand-purple
 *  2. Hex inside a JSX `style={…}` or `className=…` value                 → brandVar.* / ui.*
 *  3. Hex in JSX colour attributes (fill/stroke/stopColor/color/…)        → palette.* / ui.*
 *  4. A BRAND colour's hex typed out anywhere (any string, any file incl. CSS) instead of
 *     coming from palette.ts / var(--brand-*)                              → palette.* / brand var
 *
 * Legitimate exceptions (email HTML, standalone PDF HTML, canvas share cards, the shadcn chart
 * selectors) are listed with a reason in src/theme/hex-allowlist.json; they are exempt from
 * rules 1–3 but must still take BRAND colours from palette.ts (rule 4).
 * Off-palette colours in data tables (gem / planet / zodiac / chart-series colours) are content,
 * not UI chrome, and are not checked.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { palette } from '../palette';

const ROOT = path.resolve(__dirname, '../../..');
const SRC = path.join(ROOT, 'src');
const allow = JSON.parse(readFileSync(path.join(SRC, 'theme/hex-allowlist.json'), 'utf8')) as { files: { path: string; reason: string }[] };
const ALLOW = new Set(allow.files.map(f => f.path));

const HEX = /#[0-9a-fA-F]{3,8}(?![\w-])/g;
const ARBITRARY = /\b[a-z][a-z0-9-]*-\[#[0-9a-fA-F]{3,8}\](?:\/[\w.[\]]+)?/g;
const COLOR_ATTRS = new Set(['style', 'className', 'class', 'fill', 'stroke', 'stopColor', 'color', 'floodColor', 'lightingColor', 'bgcolor', 'background']);
const BRAND_HEX = new Set(Object.values(palette).map(h => h.toUpperCase()).filter(h => h !== '#FFFFFF'));

function walk(dir: string, exts: RegExp, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== '__tests__' && f !== 'node_modules') walk(p, exts, out); }
    else if (exts.test(f) && !/\.test\.tsx?$/.test(f)) out.push(p);
  }
  return out;
}
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');
const line = (text: string, pos: number) => text.slice(0, pos).split('\n').length;

const codeFiles = walk(SRC, /\.(ts|tsx)$/).filter(f => rel(f) !== 'src/theme/palette.ts');

/** [file:line, snippet] for every hex inside a string/template literal, with its JSX attribute (if any). */
function literals(file: string): { where: string; hex: string; attr: string | null }[] {
  const text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: { where: string; hex: string; attr: string | null }[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const src = node.getText(sf);
      const hexes = src.match(HEX);
      if (hexes) {
        let attr: string | null = null;
        for (let n: ts.Node | undefined = node.parent; n; n = n.parent) if (ts.isJsxAttribute(n)) { attr = n.name.getText(sf); break; }
        for (const hex of hexes) out.push({ where: `${rel(file)}:${line(text, node.getStart(sf))}`, hex, attr });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

describe('no hard-coded colours (use src/theme/palette.ts / Tailwind brand-* tokens)', () => {
  it('allowlist entries exist and give a reason', () => {
    for (const f of allow.files) {
      expect(existsSync(path.join(ROOT, f.path)), `${f.path} is allowlisted but does not exist`).toBe(true);
      expect(f.reason?.length ?? 0, `${f.path} needs a reason`).toBeGreaterThan(10);
    }
  });

  it('no Tailwind arbitrary hex colour classes (text-[#…], bg-[#…], …)', () => {
    const bad: string[] = [];
    for (const f of codeFiles) {
      if (ALLOW.has(rel(f))) continue;
      const text = readFileSync(f, 'utf8');
      for (const m of text.matchAll(ARBITRARY)) bad.push(`${rel(f)}:${line(text, m.index!)}  ${m[0]}`);
    }
    expect(bad, 'use a brand-* token (tailwind.config.ts) instead, e.g. text-brand-purple').toEqual([]);
  });

  it('no hex colours in JSX style / className / SVG colour attributes', () => {
    const bad: string[] = [];
    for (const f of codeFiles) {
      if (ALLOW.has(rel(f))) continue;
      for (const l of literals(f)) if (l.attr && COLOR_ATTRS.has(l.attr)) bad.push(`${l.where}  ${l.attr}: ${l.hex}`);
    }
    expect(bad, 'use brandVar.* / palette.* / ui.* from src/theme/palette.ts').toEqual([]);
  });

  it('brand colours are never typed out as hex outside palette.ts / index.css', () => {
    const bad: string[] = [];
    for (const f of codeFiles) {
      for (const l of literals(f)) if (BRAND_HEX.has(l.hex.toUpperCase())) bad.push(`${l.where}  ${l.hex}`);
    }
    for (const f of walk(SRC, /\.css$/)) {
      const text = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/#/g, ' '));
      for (const m of text.matchAll(/#[0-9a-fA-F]{6}(?![\w-])/g)) {
        if (BRAND_HEX.has(m[0].toUpperCase())) bad.push(`${rel(f)}:${line(text, m.index!)}  ${m[0]}`);
      }
    }
    expect(bad, 'use palette.* (TS) or rgb(var(--brand-*)) (CSS)').toEqual([]);
  });
});
