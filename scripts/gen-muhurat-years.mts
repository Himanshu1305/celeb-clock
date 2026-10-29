/**
 * Batch 9b — precompute the year muhurat lists (/muhurat/:type/:year).
 * Writes src/data/muhuratYears/<type>-<year>.json: the location-independent qualifying
 * stretches + prohibited periods (used by the page's city picker in the browser) and
 * the New Delhi list (prerendered). Deterministic; re-run after changing
 * src/lib/vedic/muhuratYear.ts. A vitest drift check compares one file.
 *   npx tsx scripts/gen-muhurat-years.mts
 */
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { panchangTimeline, yearMuhuratFile, YEAR_MUHURAT_TYPES, YEAR_MUHURAT_YEARS } from '../src/lib/vedic/muhuratYear';
import { sunriseSunset } from '../src/lib/vedic/panchangDay';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/muhuratYears');
mkdirSync(out, { recursive: true });
const delhiSun = (iso: string) => {
  const r = sunriseSunset(new Date(iso + 'T12:00:00Z'), 28.6139, 77.2090, 5.5);
  return { rise: r.rise.getTime(), set: r.set.getTime(), nextRise: r.nextRise.getTime() };
};
for (const year of YEAR_MUHURAT_YEARS) {
  const tl = panchangTimeline(Date.UTC(year, 0, 1) - 2 * 86400000, Date.UTC(year + 1, 0, 1) + 2 * 86400000);
  for (const type of YEAR_MUHURAT_TYPES) {
    const f = yearMuhuratFile(type, year, tl, delhiSun);
    writeFileSync(resolve(out, `${type}-${year}.json`), JSON.stringify(f) + '\n');
    console.log(`${type}-${year}: ${f.delhi.length} New Delhi windows, ${f.pieces.length} pieces`);
  }
}
