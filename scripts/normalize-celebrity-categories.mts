/**
 * B24 — give every generic "Celebrity" profile in src/data/celebrities.json a real category from its
 * Wikidata description (src/lib/celebrityCategory.ts). Idempotent; curated (static) records untouched.
 * Run: npx tsx scripts/normalize-celebrity-categories.mts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { deriveCategory, isGenericCategory } from '../src/lib/celebrityCategory';

const path = 'src/data/celebrities.json';
const data = JSON.parse(readFileSync(path, 'utf8')) as { celebrities: Array<Record<string, unknown>> } & Record<string, unknown>;
let changed = 0; const left: string[] = [];
for (const c of data.celebrities) {
  if (c.source === 'static' || !isGenericCategory(c.category as string)) continue;
  const cat = deriveCategory(c.known_for as string, c.occupation as string, c.category as string);
  if (cat !== c.category) { c.category = cat; changed++; }
  if (cat === 'Celebrity') left.push(`${c.name}: ${c.known_for}`);
}
writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log(`[categories] ${changed} profiles re-categorised; ${left.length} still "Celebrity"`);
if (process.env.SHOW_LEFT) console.log(left.slice(0, 80).join('\n'));
