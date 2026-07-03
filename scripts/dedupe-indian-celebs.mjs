#!/usr/bin/env node
/**
 * scripts/dedupe-indian-celebs.mjs
 * Resolves duplicate Indian celebrity rows created when migrate-indian-celebs.mjs
 * inserted 381 fresh rows for TS entries that didn't match existing Wikidata rows
 * on lower(name) + birth_month_day — because the dates differed.
 *
 * Runner: node_modules/.bin/tsx scripts/dedupe-indian-celebs.mjs
 * Requires: SUPABASE_URL  SUPABASE_SERVICE_ROLE_KEY  (service role for RLS bypass)
 *
 * Date-resolution rule (user-approved):
 *   Wikidata wins, EXCEPT when the Wikidata birth_month_day is '01-01'
 *   (Wikidata's unknown-day placeholder) — then the curated TS date wins.
 *
 * Safety rules:
 *   - Never deletes a row without first successfully updating the surviving twin
 *   - DELETE is triple-asserted: nationality_code='IN', wikidata_id IS NULL,
 *     created_at date = today — all must hold or the row is skipped to manual review
 *   - >2 rows per name → skipped to manual review, never auto-resolved
 *   - Phase 3 January sweep is read-only (prints, never writes)
 *   - Swallows nothing — every skip, multi-match, and error is printed
 */

import { createClient } from '@supabase/supabase-js';

// ── Env validation ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  console.error('Get the service_role key from: Supabase Studio → Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD" in local time

// ── Phase 1 — Load all IN rows and find duplicate pairs ────────────────────────
console.log('Phase 1: Loading all nationality_code=IN rows…');

const { data: allInRows, error: loadErr } = await supabase
  .from('celebrity_sitelinks')
  .select('id, name, birth_date, birth_month_day, nationality_code, occupation, known_for, tier, wikidata_id, sitelinks, created_at')
  .eq('nationality_code', 'IN');

if (loadErr) {
  console.error('Failed to load IN rows:', loadErr.message);
  process.exit(1);
}

console.log(`  Loaded ${allInRows.length} IN rows.\n`);

// Group by normalised name
const groups = new Map();
for (const row of allInRows) {
  const key = row.name.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const pairs          = [];   // clean {fresh, original} pairs
const skippedManual  = [];   // names we can't auto-resolve

for (const [, rows] of groups) {
  if (rows.length === 1) continue;  // no duplicate — skip

  if (rows.length > 2) {
    skippedManual.push(`${rows[0].name} (${rows.length} rows — ids: ${rows.map(r => r.id).join(', ')})`);
    continue;
  }

  // Exactly 2 rows — classify fresh vs original
  const fresh    = rows.find(r => r.wikidata_id === null);
  const original = rows.find(r => r.wikidata_id !== null);

  if (!fresh || !original) {
    // Both have wikidata_id, or both lack it — can't auto-classify
    skippedManual.push(
      `${rows[0].name} — can't classify (wikidata_ids: ${rows.map(r => r.wikidata_id ?? 'NULL').join(', ')})`
    );
    continue;
  }

  pairs.push({ fresh, original });
}

console.log(`Phase 1 complete: ${pairs.length} duplicate pairs found, ${skippedManual.length} sent to manual review.\n`);

// ── Phase 2 — Resolve each pair ───────────────────────────────────────────────
console.log('Phase 2: Resolving pairs (UPDATE original, DELETE fresh)…\n');

let resolvedWikidata = 0;
let resolvedTS       = 0;
const errors         = [];

for (const { fresh, original } of pairs) {
  const displayName = original.name;

  try {
    // ── Triple assertion on the fresh row before we touch anything ─────────────
    const freshCreatedDate = fresh.created_at ? fresh.created_at.split('T')[0] : null;
    const assertionFails = [];
    if (fresh.nationality_code !== 'IN')  assertionFails.push('nationality_code !== IN');
    if (fresh.wikidata_id !== null)        assertionFails.push('wikidata_id is not null');
    if (freshCreatedDate !== today)        assertionFails.push(`created_at date ${freshCreatedDate} !== today ${today}`);

    if (assertionFails.length > 0) {
      skippedManual.push(`${displayName}: fresh-row assertion failed — ${assertionFails.join('; ')}`);
      continue;
    }

    // ── Date resolution ────────────────────────────────────────────────────────
    const wikidataBmd  = original.birth_month_day;
    const tsBmd        = fresh.birth_month_day;
    const useWikidata  = wikidataBmd !== '01-01';
    const winningBmd   = useWikidata ? wikidataBmd : tsBmd;
    const dateSource   = useWikidata ? 'Wikidata' : 'TS (Wikidata was 01-01)';

    // ── Build UPDATE payload for the original (surviving) row ─────────────────
    const payload = {
      nationality:      'Indian',
      nationality_code: 'IN',
      known_for:        fresh.known_for,
      tier:             fresh.tier,
      birth_month_day:  winningBmd,
    };

    // Preserve existing Wikidata occupation if non-empty
    if (!original.occupation || original.occupation.trim() === '') {
      payload.occupation = fresh.occupation;
    }

    // If TS date wins, update birth_date too (original may have YYYY-01-01 placeholder)
    if (!useWikidata && fresh.birth_date) {
      payload.birth_date = fresh.birth_date;
    }

    // ── UPDATE the original row ────────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from('celebrity_sitelinks')
      .update(payload)
      .eq('id', original.id);

    if (updateErr) throw new Error(`UPDATE failed: ${updateErr.message}`);

    // ── DELETE the fresh row (triple-asserted in the WHERE clause) ─────────────
    const { error: deleteErr, count: deleteCount } = await supabase
      .from('celebrity_sitelinks')
      .delete({ count: 'exact' })
      .eq('id', fresh.id)
      .eq('nationality_code', 'IN')
      .is('wikidata_id', null);

    if (deleteErr) throw new Error(`DELETE failed: ${deleteErr.message}`);
    if (deleteCount === 0) throw new Error('DELETE matched 0 rows — assertions may have blocked it');

    // ── Log ───────────────────────────────────────────────────────────────────
    console.log(
      `  ✓ ${displayName.padEnd(36)} | kept ${original.id} | date: ${winningBmd} (${dateSource}) | deleted ${fresh.id}`
    );

    if (useWikidata) resolvedWikidata++;
    else             resolvedTS++;

  } catch (err) {
    errors.push({ name: displayName, reason: err.message });
    console.error(`  ✗ ${displayName}: ${err.message}`);
  }
}

// ── Phase 3 — January-date sweep on remaining fresh inserts ───────────────────
console.log('\nPhase 3: Sweeping fresh inserts for suspicious 01-* birth_month_day…\n');

const janReviewList = allInRows.filter(r =>
  r.wikidata_id === null &&
  r.birth_month_day?.startsWith('01-') &&
  r.birth_month_day !== '01-01' &&       // 01-01 placeholder already handled by Phase 2
  r.created_at?.split('T')[0] === today
);

if (janReviewList.length === 0) {
  console.log('  None — no suspicious January dates in fresh inserts.');
} else {
  console.log(`  ${janReviewList.length} fresh insert(s) with 01-* birth_month_day (review manually):`);
  for (const r of janReviewList) {
    console.log(`    · ${r.name.padEnd(36)} | birth_month_day: ${r.birth_month_day} | id: ${r.id}`);
  }
}

// ── Phase 4 — Summary ─────────────────────────────────────────────────────────
const bar = '═'.repeat(54);
console.log(`\n${bar}`);
console.log('  Indian Celebrity Dedupe — Summary');
console.log(bar);
console.log(`  Pairs found:                      ${pairs.length}`);
console.log(`  Resolved (Wikidata date):         ${resolvedWikidata}`);
console.log(`  Resolved (TS date, WD was 01-01): ${resolvedTS}`);
console.log(`  Skipped (manual review):          ${skippedManual.length}`);
if (skippedManual.length) skippedManual.forEach(s => console.log(`    · ${s}`));
console.log(`  January-date review list:         ${janReviewList.length} names printed above`);
console.log(`  Errors:                           ${errors.length}`);
if (errors.length) errors.forEach(e => console.log(`    · ${e.name}: ${e.reason}`));
console.log(bar);

if (errors.length > 0) process.exit(1);
