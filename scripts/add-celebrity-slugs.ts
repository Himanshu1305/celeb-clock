/**
 * Task 5 — Supabase slug migration.
 *
 * Adds a URL-safe `slug` to every celebrity_sitelinks row so that celebrity
 * pages can be routed by slug. The existing 598 static slugs from
 * src/data/indianCelebrities.ts are preserved EXACTLY: those names are slugged
 * first and their slugs are reserved before any DB row is processed, so a DB
 * duplicate never steals a canonical slug.
 *
 * PREREQUISITE (manual, one-time — DDL cannot be issued via PostgREST):
 *   ALTER TABLE celebrity_sitelinks ADD COLUMN IF NOT EXISTS slug TEXT;
 *   CREATE UNIQUE INDEX IF NOT EXISTS celebrity_sitelinks_slug_idx
 *     ON celebrity_sitelinks (slug);
 *
 * Run:  npx tsx scripts/add-celebrity-slugs.ts
 * If the slug column is missing, the script prints the SQL and exits cleanly.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Blocked wikidata/internal IDs — never publish pages for these.
export const BLOCKED_IDS = new Set([3503, 3522, 3567, 3690]);

/** Canonical slug base — mirrors generateCelebritySlug() in src/utils/celebrityUtils.ts. */
export const nameToSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/['’‘`´]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/** Assign a unique slug given a set of already-used slugs. */
export function uniqueSlug(name: string, birthYear: number | undefined, used: Set<string>): string {
  const base = nameToSlug(name) || `celebrity-${birthYear ?? 'unknown'}`;
  if (!used.has(base)) return base;
  const withYear = birthYear ? `${base}-${birthYear}` : `${base}-2`;
  if (!used.has(withYear)) return withYear;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Extract the static Indian celebrity names in file order (slug-preservation source). */
export function staticCelebrityNames(): { name: string; birthYear?: number }[] {
  const src = readFileSync('src/data/indianCelebrities.ts', 'utf8');
  const names = [...src.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const years = [...src.matchAll(/birth_year:\s*(\d+)/g)].map(m => Number(m[1]));
  return names.map((name, i) => ({ name, birthYear: years[i] }));
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('❌ Missing Supabase credentials in .env.local — nothing to do.');
    return;
  }
  const sb = createClient(url, key);

  // Reserve the canonical static slugs first.
  const used = new Set<string>();
  for (const { name, birthYear } of staticCelebrityNames()) {
    used.add(uniqueSlug(name, birthYear, used));
  }
  console.log(`Reserved ${used.size} canonical static slugs.`);

  // Probe the slug column.
  const probe = await sb.from('celebrity_sitelinks').select('id, slug').limit(1);
  if (probe.error && /column .*slug.* does not exist/i.test(probe.error.message)) {
    console.log('\n⚠️  slug column missing. Run this once in the Supabase SQL editor:\n');
    console.log('    ALTER TABLE celebrity_sitelinks ADD COLUMN IF NOT EXISTS slug TEXT;');
    console.log('    CREATE UNIQUE INDEX IF NOT EXISTS celebrity_sitelinks_slug_idx ON celebrity_sitelinks (slug);\n');
    console.log('Then re-run: npx tsx scripts/add-celebrity-slugs.ts');
    return;
  }
  if (probe.error) { console.log('❌ DB error:', probe.error.message); return; }

  // Page through all rows and assign slugs.
  const PAGE = 1000;
  let from = 0, updated = 0, skippedBlocked = 0;
  for (;;) {
    const { data, error } = await sb
      .from('celebrity_sitelinks')
      .select('id, name, birth_date')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) { console.log('❌ fetch error:', error.message); return; }
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (BLOCKED_IDS.has(row.id)) { skippedBlocked++; continue; }
      const by = row.birth_date ? Number(String(row.birth_date).slice(0, 4)) : undefined;
      const slug = uniqueSlug(row.name, by, used);
      used.add(slug);
      const { error: upErr } = await sb.from('celebrity_sitelinks').update({ slug }).eq('id', row.id);
      if (!upErr) updated++;
    }
    from += PAGE;
    console.log(`  …${updated} slugs written`);
  }
  console.log(`\n✅ Migration complete: ${updated} slugs written, ${skippedBlocked} blocked rows skipped.`);
}

// Only run when invoked directly (not when imported by tests).
if (process.argv[1] && process.argv[1].includes('add-celebrity-slugs')) {
  main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
}
