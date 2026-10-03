#!/usr/bin/env node
/* Part AO — shade-aware de-purple codemod.
 * Maps the old purple family (purple/indigo/violet/fuchsia) Tailwind utilities to the
 * new design tokens: navy #0E2238 for solid/interactive fills, refined amethyst #6E5AA6
 * for text / light tints / gradient stops / accents. Opacity suffixes are preserved.
 * Scope: src/pages + src/components (excluding src/components/ui, already token-based).
 * Also rewrites the two legacy brand hex literals (#8B5CF6, #6366F1) to #6E5AA6.
 * One isolated, revertable pass. Run: node scripts/ao-depurple.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NAVY = '#0E2238';
const AM = '#6E5AA6';
const FAM = 'purple|indigo|violet|fuchsia';
const UTIL = 'bg|text|border|ring-offset|ring|from|via|to|fill|stroke|shadow|divide|outline|caret|accent|decoration|placeholder';

// token: optional variant prefixes (hover:, dark:, md:, group-hover: ...) + util-fam-shade(/op)?
const re = new RegExp(
  `((?:[a-z][a-z0-9-]*:)*)(${UTIL})-(${FAM})-(\\d{2,3})(\\/\\d{1,3})?`,
  'g'
);

function mapToken(prefix, util, _fam, shade, opacity) {
  const op = opacity || '';
  const opNum = opacity ? Number(opacity.slice(1)) : null;
  const light = Number(shade) <= 200;
  const translucent = opNum !== null && opNum <= 40;
  let out;
  switch (util) {
    case 'bg':
      out = (light || translucent) ? `bg-[${AM}]${op || '/10'}` : `bg-[${NAVY}]${op}`;
      break;
    case 'text': out = `text-[${AM}]${op}`; break;
    case 'border': out = `border-[${AM}]${op || '/30'}`; break;
    case 'ring': out = `ring-[${NAVY}]${op}`; break;
    case 'ring-offset': out = `ring-offset-[${NAVY}]${op}`; break;
    case 'from': out = `from-[${AM}]${op}`; break;
    case 'via': out = `via-[${AM}]${op}`; break;
    case 'to': out = `to-[${AM}]${op}`; break;
    case 'fill': out = `fill-[${AM}]${op}`; break;
    case 'stroke': out = `stroke-[${AM}]${op}`; break;
    case 'shadow': out = `shadow-[${AM}]${op || '/20'}`; break;
    case 'divide': out = `divide-[${AM}]${op || '/20'}`; break;
    case 'outline': out = `outline-[${NAVY}]${op}`; break;
    case 'caret': out = `caret-[${NAVY}]${op}`; break;
    case 'accent': out = `accent-[${NAVY}]${op}`; break;
    case 'decoration': out = `decoration-[${AM}]${op}`; break;
    case 'placeholder': out = `placeholder-[${AM}]${op}`; break;
    default: return null;
  }
  return `${prefix}${out}`;
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (p.includes('src/components/ui')) continue;
      walk(p, acc);
    } else if (/\.(tsx|ts)$/.test(name)) {
      acc.push(p);
    }
  }
  return acc;
}

const roots = ['src/pages', 'src/components'];
const files = roots.flatMap((r) => walk(r));
let changed = 0;
let tokenCount = 0;

for (const f of files) {
  let txt = readFileSync(f, 'utf8');
  const before = txt;
  txt = txt.replace(re, (m, prefix, util, fam, shade, opacity) => {
    const mapped = mapToken(prefix || '', util, fam, shade, opacity);
    if (mapped) { tokenCount++; return mapped; }
    return m;
  });
  // legacy brand hex literals
  txt = txt.replace(/#8[Bb]5[Cc][Ff]6/g, AM).replace(/#6366[Ff]1/g, AM);
  if (txt !== before) { writeFileSync(f, txt); changed++; }
}

console.log(`de-purple: ${changed} files changed, ${tokenCount} class tokens remapped`);
