#!/usr/bin/env node
/**
 * scripts/migrate-indian-celebs.mjs
 * Enriches the 598 Indian celebrity rows in celebrity_sitelinks with
 * nationality, nationality_code, known_for, tier, and occupation (if null).
 *
 * Runner: node_modules/.bin/tsx scripts/migrate-indian-celebs.mjs
 * Requires: SUPABASE_URL  SUPABASE_SERVICE_ROLE_KEY  (service role for RLS bypass)
 *
 * Safety rules:
 *   - Never deletes rows
 *   - Only updates rows matched by lower(name) + birth_month_day
 *   - Preserves existing Wikidata occupation and death_date (COALESCE logic)
 *   - Prints every multi-match, insert, and error — swallows nothing
 */

import { createClient } from '@supabase/supabase-js';
import { INDIAN_CELEBRITIES } from '../src/data/indianCelebrities.ts';

// ── Env validation ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  console.error('Get the service_role key from: Supabase Studio → Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Preflight: verify known_for column exists ──────────────────────────────────
console.log('Preflight: checking known_for column…');
try {
  const { error } = await supabase
    .from('celebrity_sitelinks')
    .select('known_for, tier')
    .limit(1);
  if (error) throw error;
  console.log('Preflight passed — known_for and tier columns present.\n');
} catch (err) {
  console.error('Preflight FAILED — run this in Supabase Studio first:');
  console.error('  ALTER TABLE celebrity_sitelinks');
  console.error('    ADD COLUMN IF NOT EXISTS known_for TEXT,');
  console.error('    ADD COLUMN IF NOT EXISTS tier TEXT;');
  console.error('\nOriginal error:', err.message);
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const monthDay = (bd) => {
  const parts = bd.split('-');
  return `${parts[1]}-${parts[2]}`;          // "MM-DD"
};

// ── Migration loop ─────────────────────────────────────────────────────────────
let updated   = 0;
const multiMatch = [];
const inserted   = [];
const errors     = [];

console.log(`Processing ${INDIAN_CELEBRITIES.length} entries…\n`);

for (const entry of INDIAN_CELEBRITIES) {
  const bmd = monthDay(entry.birth_date);

  try {
    // Fetch all matching rows by case-insensitive name + exact birth_month_day
    const { data: rows, error: fetchErr } = await supabase
      .from('celebrity_sitelinks')
      .select('id, name, occupation, death_date')
      .ilike('name', entry.name)
      .eq('birth_month_day', bmd);

    if (fetchErr) throw fetchErr;

    if (!rows || rows.length === 0) {
      // ── No match → INSERT fresh row ──────────────────────────────────────────
      const { error: insertErr } = await supabase
        .from('celebrity_sitelinks')
        .insert({
          name:             entry.name,
          birth_date:       entry.birth_date,
          birth_month_day:  bmd,
          nationality:      'Indian',
          nationality_code: 'IN',
          occupation:       entry.category,
          known_for:        entry.known_for,
          tier:             entry.tier,
          death_date:       entry.death_year ? `${entry.death_year}-01-01` : null,
        });

      if (insertErr) throw insertErr;
      inserted.push(entry.name);
      continue;
    }

    if (rows.length > 1) {
      multiMatch.push(`${entry.name} (${rows.length} rows — ids: ${rows.map(r => r.id).join(', ')})`);
    }

    // ── UPDATE every matched row ──────────────────────────────────────────────
    for (const row of rows) {
      const payload = {
        nationality:      'Indian',
        nationality_code: 'IN',
        known_for:        entry.known_for,
        tier:             entry.tier,
      };

      // Preserve existing Wikidata occupation if present
      if (!row.occupation || row.occupation.trim() === '') {
        payload.occupation = entry.category;
      }

      // Preserve existing Wikidata death_date; fill from death_year only if null
      if (!row.death_date && entry.death_year) {
        payload.death_date = `${entry.death_year}-01-01`;
      }

      const { error: updateErr } = await supabase
        .from('celebrity_sitelinks')
        .update(payload)
        .eq('id', row.id);

      if (updateErr) throw updateErr;
    }

    updated++;

  } catch (err) {
    errors.push({ name: entry.name, reason: err.message ?? String(err) });
  }
}

// ── Summary ────────────────────────────────────────────────────────────────────
const bar = '═'.repeat(50);
console.log(`\n${bar}`);
console.log('  Indian Celebrity Migration — Complete');
console.log(bar);
console.log(`  Updated:              ${updated}`);
console.log(`  Multi-match (review): ${multiMatch.length}`);
if (multiMatch.length) multiMatch.forEach(m => console.log(`    · ${m}`));
console.log(`  Inserted fresh:       ${inserted.length}`);
if (inserted.length) inserted.forEach(n => console.log(`    · ${n}`));
console.log(`  Errors:               ${errors.length}`);
if (errors.length) errors.forEach(e => console.log(`    · ${e.name}: ${e.reason}`));
console.log(bar);

if (errors.length > 0) process.exit(1);
