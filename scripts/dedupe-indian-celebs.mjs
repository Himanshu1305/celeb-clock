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
 *   - fresh  = nationality_code='IN' AND created_at on MIGRATION_DATE (UTC day)
 *   - original = any other row older than MIGRATION_DATE matched by name
 *   - wikidata_id is NOT used — it is NULL for all rows table-wide (never seeded)
 *   - Phase 1 searches the ENTIRE table for name-twins of fresh inserts;
 *     originals are untagged (no nationality_code) because the migration UPDATE
 *     didn't reach them — different birth_month_day was the root cause
 *   - Never deletes a row without first successfully updating the surviving twin
 *   - DELETE is double-asserted in the WHERE clause: nationality_code='IN' AND
 *     created_at on MIGRATION_DATE — if assertions fail the delete matches 0 rows
 *   - >1 potential original per fresh row → skipped to manual review
 *   - Phase 3 January sweep is read-only (prints, never writes)
 *   - Idempotent: deleted fresh rows are gone; 0 pairs found on rerun
 */

import { createClient } from '@supabase/supabase-js';

// Hardcoded migration date — do NOT use 'today'.
// The 381 fresh inserts all have created_at on this UTC day.
const MIGRATION_DATE = '2026-07-03T00:00:00.000Z';
const DAY_AFTER      = '2026-07-04T00:00:00.000Z';

const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) console.log('DRY-RUN mode — Phase 1 runs normally; Phase 2 prints decisions only, no writes.\n');

// ── Env validation ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  console.error('Get the service_role key from: Supabase Studio → Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Phase 1 — Find duplicate pairs ────────────────────────────────────────────
// Load all fresh inserts: nationality_code='IN' rows created on the migration day.
// For each, search the ENTIRE table for any older row with the same name.
// Originals are often untagged (nationality_code NULL) because the migration UPDATE
// couldn't match them — different birth_month_day was the root cause.
console.log('Phase 1: Loading fresh inserts (nationality_code=IN, created on 2026-07-03)…');

const { data: freshInserts, error: freshErr } = await supabase
  .from('celebrity_sitelinks')
  .select('id, name, birth_date, birth_month_day, nationality_code, occupation, known_for, tier, created_at')
  .eq('nationality_code', 'IN')
  .gte('created_at', MIGRATION_DATE)
  .lt('created_at', DAY_AFTER);

if (freshErr) {
  console.error('Failed to load fresh inserts:', freshErr.message);
  process.exit(1);
}

console.log(`  Found ${freshInserts.length} fresh inserts to check.\n`);

const pairs         = [];
const skippedManual = [];

for (const fresh of freshInserts) {
  // Search the ENTIRE table for any other row with the same name
  const { data: nameMatches, error: matchErr } = await supabase
    .from('celebrity_sitelinks')
    .select('id, name, birth_date, birth_month_day, nationality_code, occupation, sitelinks, created_at')
    .ilike('name', fresh.name)
    .neq('id', fresh.id);

  if (matchErr) {
    skippedManual.push(`${fresh.name}: name-search failed — ${matchErr.message}`);
    continue;
  }

  // Originals are rows that pre-date the migration (created before MIGRATION_DATE)
  const originals = (nameMatches ?? []).filter(
    r => new Date(r.created_at) < new Date(MIGRATION_DATE)
  );

  if (originals.length === 0) continue; // genuinely fresh, no pre-existing twin

  if (originals.length > 1) {
    skippedManual.push(
      `${fresh.name} — ${originals.length} potential originals (ids: ${originals.map(r => r.id).join(', ')})`
    );
    continue;
  }

  pairs.push({ fresh, original: originals[0] });
}

console.log(`Phase 1 complete: ${pairs.length} duplicate pairs found, ${skippedManual.length} sent to manual review.\n`);

// ── Phase 2 — Resolve each pair ───────────────────────────────────────────────
console.log(`Phase 2: ${isDryRun ? 'DRY-RUN — would-be decisions (no writes)' : 'Resolving pairs (UPDATE original, DELETE fresh)'}…\n`);

let resolvedWikidata = 0;
let resolvedTS       = 0;
const errors         = [];

for (const { fresh, original } of pairs) {
  const displayName = original.name;

  try {
    // ── Assertions on the fresh row ────────────────────────────────────────────
    const assertionFails = [];
    if (fresh.nationality_code !== 'IN') {
      assertionFails.push('nationality_code !== IN');
    }
    const freshDate = new Date(fresh.created_at);
    if (freshDate < new Date(MIGRATION_DATE) || freshDate >= new Date(DAY_AFTER)) {
      assertionFails.push(`created_at (${fresh.created_at}) not on 2026-07-03 UTC`);
    }

    if (assertionFails.length > 0) {
      skippedManual.push(`${displayName}: fresh-row assertion failed — ${assertionFails.join('; ')}`);
      continue;
    }

    // ── Date resolution (Wikidata wins unless its date is 01-01 placeholder) ──
    const wikidataBmd = original.birth_month_day;
    const tsBmd       = fresh.birth_month_day;
    const useWikidata = wikidataBmd !== '01-01';
    const winningBmd  = useWikidata ? wikidataBmd : tsBmd;
    const dateSource  = useWikidata ? 'Wikidata' : 'TS (Wikidata was 01-01)';

    // ── Build UPDATE payload for the surviving original row ───────────────────
    // Always sets nationality + nationality_code — originals are untagged until now.
    const payload = {
      nationality:      'Indian',
      nationality_code: 'IN',
      known_for:        fresh.known_for,
      tier:             fresh.tier,
      birth_month_day:  winningBmd,
    };

    // Preserve existing occupation if present
    if (!original.occupation || original.occupation.trim() === '') {
      payload.occupation = fresh.occupation;
    }

    // If TS date wins, also update birth_date (original may have YYYY-01-01)
    if (!useWikidata && fresh.birth_date) {
      payload.birth_date = fresh.birth_date;
    }

    if (isDryRun) {
      // Print the would-be action — no DB writes
      const payloadStr = Object.entries(payload)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ');
      console.log(`  [DRY] ${displayName.padEnd(36)} | WOULD keep ${original.id} (${winningBmd}, ${dateSource})`);
      console.log(`        UPDATE ${original.id}: ${payloadStr}`);
      console.log(`        DELETE ${fresh.id} (nationality_code=IN, created 2026-07-03)`);
      if (useWikidata) resolvedWikidata++;
      else             resolvedTS++;
      continue;
    }

    // ── UPDATE the original row ────────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from('celebrity_sitelinks')
      .update(payload)
      .eq('id', original.id);

    if (updateErr) throw new Error(`UPDATE failed: ${updateErr.message}`);

    // ── DELETE the fresh row (double-asserted: nationality + migration date) ───
    const { error: deleteErr, count: deleteCount } = await supabase
      .from('celebrity_sitelinks')
      .delete({ count: 'exact' })
      .eq('id', fresh.id)
      .eq('nationality_code', 'IN')
      .gte('created_at', MIGRATION_DATE)
      .lt('created_at', DAY_AFTER);

    if (deleteErr) throw new Error(`DELETE failed: ${deleteErr.message}`);
    if (deleteCount === 0) throw new Error('DELETE matched 0 rows — WHERE assertions blocked it');

    console.log(
      `  ✓ ${displayName.padEnd(36)} | kept ${original.id} | ${winningBmd} (${dateSource}) | deleted ${fresh.id}`
    );

    if (useWikidata) resolvedWikidata++;
    else             resolvedTS++;

  } catch (err) {
    errors.push({ name: displayName, reason: err.message });
    console.error(`  ✗ ${displayName}: ${err.message}`);
  }
}

// ── Phase 3 — January-date sweep on remaining fresh inserts ───────────────────
// Checks whether any unresolved fresh inserts have a 01-* birth_month_day that
// might be a TS month-bug (June→January corruption). Read-only — prints only.
// Re-fetches so the count reflects Phase 2 deletes (skipped in dry-run).
console.log(`\nPhase 3: Sweeping ${isDryRun ? 'all' : 'remaining'} fresh inserts for suspicious 01-* birth_month_day…\n`);

const { data: remainingFresh } = await supabase
  .from('celebrity_sitelinks')
  .select('id, name, birth_month_day')
  .eq('nationality_code', 'IN')
  .gte('created_at', MIGRATION_DATE)
  .lt('created_at', DAY_AFTER)
  .like('birth_month_day', '01-%')
  .neq('birth_month_day', '01-01');

const janReviewList = remainingFresh ?? [];

if (janReviewList.length === 0) {
  console.log('  None — no suspicious January dates in remaining fresh inserts.');
} else {
  console.log(`  ${janReviewList.length} fresh insert(s) with 01-* birth_month_day (review manually — may be June→January bug):`);
  for (const r of janReviewList) {
    console.log(`    · ${r.name.padEnd(36)} | birth_month_day: ${r.birth_month_day} | id: ${r.id}`);
  }
}

// ── Phase 4 — Summary ─────────────────────────────────────────────────────────
const bar = '═'.repeat(54);
console.log(`\n${bar}`);
console.log(`  Indian Celebrity Dedupe — Summary${isDryRun ? ' [DRY-RUN, no writes]' : ''}`);
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
