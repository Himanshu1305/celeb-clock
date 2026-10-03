#!/usr/bin/env node
/* Part AO — give non-paj pages the navy header bar (match the homepage/paj reference).
 * Converts the two dominant page-header wrapper patterns to a navy, white-text bar.
 * Navigation's ghost buttons + AuthNav already render on navy (the homepage & paj pages
 * prove it). Reversible single pass. Run: node scripts/ao-navy-headers.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NAVY = '#0E2238';
let changed = 0, hits = 0;

// Pattern A — full-width sticky white header → navy full-width bar.
const A = [
  [/bg-white border-b border-gray-100 sticky top-0 z-50/g,
   `bg-[${NAVY}] text-white border-b border-[${NAVY}] sticky top-0 z-50`],
  [/bg-white border-b border-gray-200 sticky top-0 z-50/g,
   `bg-[${NAVY}] text-white border-b border-[${NAVY}] sticky top-0 z-50`],
];

// Pattern B — bare container header → full-bleed navy bar (breaks out of container px-4,
// pulls up over the container pt-8). Keeps the flex row + adds wrap for mobile.
const NAVY_HEADER = `<header className="flex justify-between items-center gap-3 flex-wrap -mx-4 -mt-8 mb-8 px-4 md:px-6 py-3 bg-[${NAVY}] text-white sticky top-0 z-50">`;
const B = [
  [/<header className="flex justify-between items-center mb-12">/g, NAVY_HEADER],
  [/<header className="flex justify-between items-center mb-8">/g, NAVY_HEADER],
  [/<header className="flex justify-between items-center mb-6">/g, NAVY_HEADER],
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (/\.tsx$/.test(name)) acc.push(p);
  }
  return acc;
}

for (const f of walk('src/pages')) {
  let txt = readFileSync(f, 'utf8');
  const before = txt;
  for (const [re, to] of [...A, ...B]) {
    txt = txt.replace(re, (m) => { hits++; return to; });
  }
  if (txt !== before) { writeFileSync(f, txt); changed++; }
}
console.log(`navy-headers: ${changed} files, ${hits} headers converted`);
