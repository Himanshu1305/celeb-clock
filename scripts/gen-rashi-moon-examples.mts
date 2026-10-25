// Generates src/data/rashiMoonExamples.json — real examples of people per Moon sign
// (Rashi), for the "Famous … natives" lists on /vedic-zodiac/:rashi and the Moon-sign
// article (Batch 6). Those lists used to be picked by SUN sign renamed as Rashi.
// Only people whose Moon stayed in ONE sidereal sign for their whole birth date
// (src/lib/vedic/dateOnlyMoonSign.ts, chart engine, Lahiri) are used, so the example
// does not depend on an unknown birth time. Re-run: npx tsx scripts/gen-rashi-moon-examples.mts
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { parseCelebrityDOB } from '../src/utils/celebrityUtils';
import { calculateDateOnlyRashi } from '../src/utils/celebrityCalculations';
import { applyCelebRecordFixes, isBlockedCelebrity, CELEB_ERA_OVERRIDES } from '../src/lib/celebrityFacts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const all = (require('../src/data/celebrities.json').celebrities as Record<string, unknown>[]).map(applyCelebRecordFixes);

type Ex = { name: string; slug: string; born: number };
const out: Record<string, { global: Ex[]; indian: Ex[] }> = {};
const scored = all
  .filter(c => !CELEB_ERA_OVERRIDES[String(c.slug)] && !isBlockedCelebrity(String(c.name), String(c.known_for || c.category || '')))
  .map((c, i) => {
    const dob = parseCelebrityDOB(c);
    if (!dob?.isFullDate) return null;
    const r = calculateDateOnlyRashi(dob.day, dob.month, dob.year, (c.nationality_code as string) ?? null);
    if (!r || !r.isCertain) return null;
    return { c, i, rashi: r.rashis[0], born: dob.year, sl: Number(c.sitelinks ?? 0), indian: String(c.nationality_code || '').toUpperCase() === 'IN' };
  })
  .filter(Boolean) as { c: Record<string, unknown>; i: number; rashi: string; born: number; sl: number; indian: boolean }[];

for (const s of scored) out[s.rashi] ??= { global: [], indian: [] };
const ex = (s: typeof scored[number]): Ex => ({ name: String(s.c.name), slug: String(s.c.slug), born: s.born });
for (const rashi of Object.keys(out)) {
  const mine = scored.filter(s => s.rashi === rashi);
  out[rashi].global = [...mine].sort((a, b) => b.sl - a.sl || a.i - b.i).slice(0, 5).map(ex);
  // Indian: curated static list first (file order = prominence), then by sitelinks.
  out[rashi].indian = mine.filter(s => s.indian)
    .sort((a, b) => (String(a.c.source) === 'static' ? 0 : 1) - (String(b.c.source) === 'static' ? 0 : 1) || b.sl - a.sl || a.i - b.i)
    .slice(0, 2).map(ex);
}
writeFileSync(resolve(__dirname, '../src/data/rashiMoonExamples.json'), JSON.stringify(out, null, 1) + '\n');
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, `${v.global.map(e => e.name).join(', ')} | IN: ${v.indian.map(e => e.name).join(', ')}`])));
