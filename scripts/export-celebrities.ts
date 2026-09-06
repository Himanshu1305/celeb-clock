/**
 * Task 6 — Build-time celebrity export.
 *
 * Produces src/data/celebrities.json — the unified celebrity dataset used by
 * CelebrityPage, prerender-routes and prerender-titles. Merges:
 *   1. The 598 canonical static Indian celebrities (src/data/indianCelebrities.ts),
 *      whose slugs are PRESERVED EXACTLY (reserved first, in array order — the
 *      same order generateAllSlugs() uses on the live site).
 *   2. All Indian (nationality_code='IN') celebrity_sitelinks rows from Supabase,
 *      minus the blocklist, deduped by base slug so no person appears twice.
 *
 * Slugs are computed here (the DB slug column is optional). Run:
 *   npx tsx scripts/export-celebrities.ts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';
import { nameToSlug, BLOCKED_IDS } from './add-celebrity-slugs';
import { INDIAN_CELEBRITIES } from '../src/data/indianCelebrities';

dotenv.config({ path: '.env.local' });

interface UnifiedCelebrity {
  id?: number;
  name: string;
  slug: string;
  birth_date: string | null;
  birth_month_day: string | null;
  birth_year: number | null;
  death_year: number | null;
  category: string;
  known_for: string;
  occupation?: string | null;
  nationality_code: string;
  sitelinks?: number | null;
  source: 'static' | 'db';
}

const monthDay = (d: string | null): string | null => {
  if (!d) return null;
  const m = /^\d{4}-(\d{2}-\d{2})/.exec(d);
  return m ? m[1] : null;
};

async function main() {
  const used = new Set<string>();
  const out: UnifiedCelebrity[] = [];

  // 1. Static Indian celebrities first — preserve slugs exactly.
  for (const c of INDIAN_CELEBRITIES as any[]) {
    const base = nameToSlug(c.name) || `celebrity-${c.birth_year ?? 'unknown'}`;
    let slug = base;
    if (used.has(slug)) slug = c.birth_year ? `${base}-${c.birth_year}` : `${base}-2`;
    let n = 2;
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
    out.push({
      name: c.name,
      slug,
      birth_date: c.birth_date ?? null,
      birth_month_day: monthDay(c.birth_date ?? null),
      birth_year: c.birth_year ?? (c.birth_date ? Number(String(c.birth_date).slice(0, 4)) : null),
      death_year: c.death_year ?? null,
      category: c.category ?? 'Celebrity',
      known_for: c.known_for ?? '',
      nationality_code: 'IN',
      source: 'static',
    });
  }
  const staticCount = out.length;
  console.log(`Reserved ${staticCount} static Indian celebrities.`);

  // 2. Supabase Indian celebrities.
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('❌ Missing Supabase credentials — writing static-only export.');
  } else {
    const sb = createClient(url, key);
    const PAGE = 1000;
    let added = 0, dupSkipped = 0, blocked = 0;

    const processRow = (row: any): boolean => {
      if (BLOCKED_IDS.has(row.id)) { blocked++; return false; }
      const base = nameToSlug(row.name);
      if (!base) return false;
      if (used.has(base)) { dupSkipped++; return false; }
      used.add(base);
      const by = row.birth_date ? Number(String(row.birth_date).slice(0, 4)) : null;
      const dy = row.death_date ? Number(String(row.death_date).slice(0, 4)) : null;
      out.push({
        id: row.id, name: row.name, slug: base,
        birth_date: row.birth_date ?? null,
        birth_month_day: row.birth_month_day ?? monthDay(row.birth_date ?? null),
        birth_year: by, death_year: dy,
        category: row.occupation || 'Celebrity',
        known_for: row.known_for || '',
        occupation: row.occupation ?? null,
        nationality_code: row.nationality_code || 'IN',
        sitelinks: row.sitelinks ?? null,
        source: 'db',
      });
      added++;
      return true;
    };

    const SEL = 'id, name, birth_date, birth_month_day, death_date, sitelinks, occupation, known_for, nationality_code';

    // Pass 1 — ALL Indian celebrities with a birth date.
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb.from('celebrity_sitelinks').select(SEL)
        .eq('nationality_code', 'IN').not('birth_date', 'is', null)
        .order('sitelinks', { ascending: false }).range(from, from + PAGE - 1);
      if (error) { console.log('❌ IN fetch error:', error.message); break; }
      if (!data || data.length === 0) break;
      data.forEach(processRow);
    }

    // Pass 2 — top-tier INTERNATIONAL celebrities (present on ≥100 Wikipedia
    // language editions, incl. Obama at 326), capped to keep celebrities.json
    // lean and the prerender/bundle bounded. The long tail stays Indian-focused.
    const INTL_CAP = 800;
    let intlAdded = 0;
    for (let from = 0; intlAdded < INTL_CAP; from += PAGE) {
      const { data, error } = await sb.from('celebrity_sitelinks').select(SEL)
        .neq('nationality_code', 'IN').not('birth_date', 'is', null)
        .gte('sitelinks', 100)
        .order('sitelinks', { ascending: false }).range(from, from + PAGE - 1);
      if (error) { console.log('❌ INTL fetch error:', error.message); break; }
      if (!data || data.length === 0) break;
      for (const row of data) { if (processRow(row)) intlAdded++; if (intlAdded >= INTL_CAP) break; }
    }

    console.log(`Added ${added} DB celebrities (${intlAdded} international, ${dupSkipped} dedup-skipped, ${blocked} blocked).`);
  }

  const indianCount = out.filter(c => c.nationality_code === 'IN').length;
  const payload = {
    generated_at: '__STAMP__',
    total: out.length,
    indian_count: indianCount,
    celebrities: out,
  };
  // Stamp without Date (deterministic-friendly): use env or leave marker replaced by shell.
  payload.generated_at = process.env.EXPORT_STAMP || new Date().toISOString();
  writeFileSync('src/data/celebrities.json', JSON.stringify(payload, null, 2));
  console.log(`\n✅ Wrote src/data/celebrities.json — total ${payload.total}, indian ${indianCount}.`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
