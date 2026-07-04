#!/usr/bin/env node
/**
 * scripts/enrich-celebrities.mjs  —  Stage 2 Wikidata enrichment
 *
 * Enriches celebrity_sitelinks rows with:
 *   wikidata_id     — Wikidata QID (e.g. "Q37079")
 *   occupation      — Wikidata English short description (e.g. "American actor")
 *   wikipedia_url   — English Wikipedia URL
 *
 * SAFETY RULES:
 *   • Only writes fields that are currently NULL — never overwrites existing values.
 *   • Never modifies birth_date / birth_month_day — use scripts/fix-january-dates.mjs.
 *   • Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars.
 *   • --dry-run: all Wikidata lookups run; no DB writes.
 *
 * MATCHING PIPELINE per row (stops at first confirmed match):
 *
 *   Stage A   SPARQL: exact rdfs:label@en + SUBSTR full date match + precision ≥ 11
 *             + P27=Q668 if nationality_code='IN' (India filter only for Indian rows)
 *
 *   Stage A2  SPARQL: same but year-only FILTER (handles stored date off by month,
 *             or Wikidata month/day data quality). Falls through from A.
 *
 *   Stage B   wbsearchentities + wbgetentities: handles spelling variants/aliases.
 *             Exact full date match + P27=Q668 if IN + precision ≥ 11.
 *
 *   Stage B2  Same as B but year ±1 tolerance (handles Wikidata year off-by-one).
 *             Also tries transliteration variants (Sridharan → Sreedharan etc.).
 *
 * CONFIDENCE POLICY:
 *   A / B with exactly 1 candidate → HIGH → auto-enrich.
 *   A2 / B2 with exactly 1 candidate → MEDIUM → auto-enrich (logged as A2/B2).
 *   Any stage with 0 candidates → try next stage.
 *   Any stage with >1 candidates after dedup → EXCEPTION (skip this row).
 *
 * DATE MISMATCH POLICY (for 26K scale):
 *   If Wikidata birth date ≠ stored birth_date, enrich descriptor/url/QID ANYWAY
 *   (identity confirmed by name match), but write to scripts/output/date-review.csv
 *   for manual review. Never auto-correct dates in this script.
 *
 * FLAGS:
 *   --dry-run          log only, no DB writes
 *   --sample=N         stop after N rows (for testing)
 *   --limit=N          alias for --sample
 *   --only-in          only process rows with nationality_code='IN'
 *   --start-after=<id> skip rows with id ≤ this value (for resuming)
 *   --rebuild          unused here (see verify-print.mjs)
 *
 * RESUMABILITY:
 *   The script always queries WHERE wikidata_id IS NULL, so re-running after a partial
 *   run automatically skips already-enriched rows.
 *   For mid-batch resume, pass --start-after=<last_processed_id>.
 *
 * OUTPUT:
 *   scripts/output/enrich-log.jsonl   one JSON line per row decision
 *   scripts/output/date-review.csv    rows where WD date ≠ stored date
 *
 * RATE LIMIT: ≤1 req/sec sustained via lib/wikidata-match.mjs rate limiter.
 * PROGRESS:   logged every 100 rows with ETA.
 * BATCH SIZE: 500 rows per Supabase read, ordered by sitelinks DESC.
 *
 * RUN COMMANDS (copy-ready — never executed during build):
 *   Dry-run, first 20 rows:
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/enrich-celebrities.mjs --dry-run --sample=20
 *
 *   Indian rows only:
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/enrich-celebrities.mjs --only-in
 *
 *   Full run:
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/enrich-celebrities.mjs
 *
 *   Resume after row ID 12345:
 *     SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/enrich-celebrities.mjs --start-after=12345
 */

import { createClient }    from '@supabase/supabase-js';
import { appendFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath }   from 'url';
import {
  buildStageASparql,
  buildStageA2Sparql,
  runSparql,
  runStageB,
  fetchEntityFull,
  extractEnrichmentData,
  transliterationVariants,
} from './lib/wikidata-match.mjs';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const LOG_PATH    = resolve(__dirname, 'output/enrich-log.jsonl');
const REVIEW_PATH = resolve(__dirname, 'output/date-review.csv');
const BATCH_SIZE  = 500;

// ── Flag parsing ──────────────────────────────────────────────────────────────
const argv      = process.argv.slice(2);
const isDryRun  = argv.includes('--dry-run');
const onlyIn    = argv.includes('--only-in');

const sampleArg = argv.find(a => a.startsWith('--sample=') || a.startsWith('--limit='));
const maxRows   = sampleArg ? parseInt(sampleArg.split('=')[1]) : Infinity;

const startAfterArg = argv.find(a => a.startsWith('--start-after='));
const startAfterId  = startAfterArg ? parseInt(startAfterArg.split('=')[1]) : null;

// ── Env validation ─────────────────────────────────────────────────────────────
const SUPABASE_URL             = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Output file init ──────────────────────────────────────────────────────────
if (!existsSync(REVIEW_PATH)) {
  writeFileSync(REVIEW_PATH, 'name,our_birth_date,wd_birth_date,stage,qid\n');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function logDecision(entry) {
  appendFileSync(LOG_PATH, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

function logDateReview(name, ourDate, wdDate, stage, qid) {
  const escape = s => (s ?? '').includes(',') ? `"${s}"` : (s ?? '');
  appendFileSync(REVIEW_PATH, `${escape(name)},${ourDate ?? ''},${wdDate},${stage},${qid}\n`);
}

function dedup(candidates) {
  const seen = new Set();
  return candidates.filter(c => {
    if (seen.has(c.qid)) return false;
    seen.add(c.qid);
    return true;
  });
}

// Filter relaxed-stage (A2/B2) candidates whose WD month-day conflicts with our stored
// month-day. Each discarded candidate is logged as STAGE_CONFLICT_DISCARDED so the
// decision trail is complete. The caller sees an empty (or trimmed) list and the
// pipeline continues to the next stage rather than EXCEPTIONing immediately.
// 01-01 rows are never filtered — any WD date is acceptable for a placeholder.
function applyRelaxedConflictGuard(hits, birth_date, stage, id, name) {
  const ourMonthDay = birth_date.slice(5, 10);
  if (ourMonthDay === '01-01') return hits;
  const clean = [];
  for (const c of hits) {
    const wdMonthDay = c.wdDate.slice(5, 10);
    if (wdMonthDay !== ourMonthDay) {
      logDecision({
        id, name, birth_date, wdDate: c.wdDate, qid: c.qid, stage,
        verdict: 'STAGE_CONFLICT_DISCARDED',
        reason: `relaxed-stage date conflict (continuing to next stage): our ${ourMonthDay} ≠ WD ${wdMonthDay}`,
      });
    } else {
      clean.push(c);
    }
  }
  return clean;
}

// ── Core matcher ──────────────────────────────────────────────────────────────
// Returns { qid, wdDate, stage, confidence: 'HIGH'|'MEDIUM' } or null (EXCEPTION).
// Side-effect: logs the decision.
async function matchRow(row) {
  const { id, name, birth_date, nationality_code } = row;
  if (!birth_date) {
    logDecision({ id, name, verdict: 'EXCEPTION', reason: 'birth_date is null', stage: '—' });
    return null;
  }

  const withIndia = nationality_code === 'IN';
  const birthYear = birth_date.slice(0, 4);

  // Stage A: SPARQL exact full date
  let candidates = [];
  let stage = 'A';
  try {
    candidates = dedup(await runSparql(buildStageASparql(name, birth_date, withIndia)));
  } catch (err) {
    logDecision({ id, name, verdict: 'EXCEPTION', stage: 'A', reason: `Stage A error: ${err.message}` });
    return null;
  }

  // Stage A2: SPARQL year-only, NO P27 filter — handles wrong/missing citizenship
  // (e.g. Diljit Dosanjh: our DB says IN, Wikidata has P27=Q30).
  // Conflict guard: if a candidate's WD month-day ≠ our stored month-day it is
  // discarded (logged as STAGE_CONFLICT_DISCARDED) and Stage B runs instead.
  if (candidates.length === 0) {
    stage = 'A2';
    try {
      const raw = dedup(await runSparql(buildStageA2Sparql(name, birthYear, false)));
      candidates = applyRelaxedConflictGuard(raw, birth_date, 'A2', id, name);
    } catch (err) {
      logDecision({ id, name, verdict: 'EXCEPTION', stage: 'A2', reason: `Stage A2 error: ${err.message}` });
      return null;
    }
  }

  // Stage B: name search, exact date
  if (candidates.length === 0) {
    stage = 'B';
    try {
      candidates = dedup(await runStageB(name, birth_date, withIndia, 0));
    } catch (err) {
      logDecision({ id, name, verdict: 'EXCEPTION', stage: 'B', reason: `Stage B error: ${err.message}` });
      return null;
    }
  }

  // Stage B2: name search, year ±1 — also tries transliteration variants.
  // Same conflict guard: discard candidates whose WD month-day conflicts.
  // B2 is the last stage so a conflict here → 0 candidates → EXCEPTION below.
  if (candidates.length === 0) {
    stage = 'B2';
    const searchNames = [name, ...transliterationVariants(name)];
    for (const searchName of searchNames) {
      try {
        const raw = dedup(await runStageB(searchName, birth_date, withIndia, 1));
        const filtered = applyRelaxedConflictGuard(raw, birth_date, 'B2', id, name);
        if (filtered.length > 0) { candidates = filtered; break; }
      } catch (err) {
        logDecision({ id, name, verdict: 'EXCEPTION', stage: 'B2', reason: `Stage B2 error (${searchName}): ${err.message}` });
        return null;
      }
    }
  }

  // No candidates at all
  if (candidates.length === 0) {
    logDecision({ id, name, birth_date, verdict: 'EXCEPTION', stage, reason: '0 candidates found' });
    return null;
  }

  // Multiple candidates with conflicting QIDs after all stages
  if (candidates.length > 1) {
    logDecision({
      id, name, birth_date, verdict: 'EXCEPTION', stage,
      reason: `${candidates.length} candidates found (${candidates.map(c => c.qid).join(', ')})`,
    });
    return null;
  }

  const { qid, wdDate } = candidates[0];
  const confidence = (stage === 'A' || stage === 'B') ? 'HIGH' : 'MEDIUM';
  logDecision({ id, name, birth_date, wdDate, qid, stage, confidence, verdict: 'MATCH' });
  return { qid, wdDate, stage, confidence };
}

// ── Enrich a matched row ──────────────────────────────────────────────────────
// Fetches entity data, resolves which fields to write, optionally writes to DB.
async function enrichRow(row, match) {
  const { id, name, birth_date, occupation, wikipedia_url, wikidata_id } = row;
  const { qid, wdDate, stage } = match;

  // Date mismatch check (only reachable here if A/B mismatch, or A2/B2 with 01-01 placeholder)
  if (wdDate !== birth_date) {
    const isPlaceholder = birth_date.slice(5, 10) === '01-01';
    const note = isPlaceholder
      ? 'our date is 01-01 placeholder — enriching; fix-candidate in date-review.csv'
      : 'enriching anyway (identity confirmed); see date-review.csv';
    logDateReview(name, birth_date, wdDate, stage, qid);
    logDecision({ id, name, birth_date, wdDate, qid, verdict: 'DATE_MISMATCH', stage, note });
  }

  // Fetch enrichment data only if any field is still null
  const needsEnrichment = !wikidata_id || !occupation || !wikipedia_url;
  if (!needsEnrichment) {
    logDecision({ id, name, verdict: 'SKIP_ALREADY_ENRICHED', qid });
    return;
  }

  let description = null;
  let resolvedWikipediaUrl = null;

  try {
    const entity = await fetchEntityFull(qid);
    ({ description, wikipediaUrl: resolvedWikipediaUrl } = extractEnrichmentData(entity));
  } catch (err) {
    logDecision({ id, name, verdict: 'ENRICH_FETCH_ERROR', qid, reason: err.message });
    return;
  }

  // Build update: only include fields that are currently null
  const update = {};
  if (!wikidata_id)    update.wikidata_id    = qid;
  if (!wikipedia_url && resolvedWikipediaUrl) update.wikipedia_url = resolvedWikipediaUrl;
  if (!occupation && description)             update.occupation    = description;

  if (Object.keys(update).length === 0) {
    logDecision({ id, name, verdict: 'SKIP_NO_NEW_DATA', qid });
    return;
  }

  if (isDryRun) {
    logDecision({ id, name, verdict: 'DRY_RUN', qid, willWrite: update });
    return;
  }

  const { error } = await supabase
    .from('celebrity_sitelinks')
    .update(update)
    .eq('id', id);

  if (error) {
    logDecision({ id, name, verdict: 'DB_ERROR', qid, reason: error.message });
    console.error(`  ✗ DB write failed for ${name}: ${error.message}`);
  } else {
    logDecision({ id, name, verdict: 'ENRICHED', qid, wrote: Object.keys(update) });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  Celebrity Enrichment — Stage 2 Wikidata');
  if (isDryRun)   console.log('  MODE: DRY-RUN (no DB writes)');
  if (onlyIn)     console.log('  FILTER: nationality_code = IN');
  if (maxRows < Infinity) console.log(`  SAMPLE: ${maxRows} rows`);
  if (startAfterId)       console.log(`  START-AFTER: id > ${startAfterId}`);
  console.log('══════════════════════════════════════════════════════════\n');

  let processed = 0;
  let matched   = 0;
  let excepted  = 0;
  let enriched  = 0;
  let lastId    = startAfterId ?? 0;
  const startTime = Date.now();
  let batchNum  = 0;

  while (processed < maxRows) {
    // ── Fetch next batch ─────────────────────────────────────────────────────
    batchNum++;
    let query = supabase
      .from('celebrity_sitelinks')
      .select('id, name, birth_date, nationality_code, occupation, wikipedia_url, wikidata_id, sitelinks')
      .is('wikidata_id', null)
      .gt('id', lastId)
      .order('sitelinks', { ascending: false })
      .limit(BATCH_SIZE);

    if (onlyIn) query = query.eq('nationality_code', 'IN');

    const { data: rows, error: fetchErr } = await query;
    if (fetchErr) {
      console.error(`Batch ${batchNum} fetch error: ${fetchErr.message}`);
      process.exit(1);
    }
    if (!rows || rows.length === 0) {
      console.log('No more rows — done.');
      break;
    }

    console.log(`Batch ${batchNum}: ${rows.length} rows (last id so far: ${lastId})`);

    for (const row of rows) {
      if (processed >= maxRows) break;
      processed++;

      const match = await matchRow(row);
      if (!match) {
        excepted++;
      } else {
        matched++;
        await enrichRow(row, match);
        if (match && !isDryRun) enriched++;
      }

      lastId = row.id;

      // Progress every 100 rows
      if (processed % 100 === 0) {
        const elapsedSec = (Date.now() - startTime) / 1000;
        const rps = processed / elapsedSec;
        const remaining = maxRows === Infinity
          ? '?' : Math.max(0, maxRows - processed);
        const etaSec = rps > 0 && maxRows < Infinity
          ? Math.round(remaining / rps)
          : null;
        const eta = etaSec !== null ? ` ETA ${Math.ceil(etaSec / 60)}m` : '';
        console.log(
          `  [${processed}] matched=${matched} excepted=${excepted} enriched=${enriched}` +
          ` (${rps.toFixed(1)} rows/s${eta})`
        );
      }
    }

    // If batch was smaller than BATCH_SIZE, no more rows
    if (rows.length < BATCH_SIZE) break;
  }

  // ── Final summary ─────────────────────────────────────────────────────────
  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n══════════════════════════════════════════════════════════');
  console.log(`  Stage 2 Enrichment — ${isDryRun ? 'DRY-RUN ' : ''}Complete`);
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Rows processed : ${processed}`);
  console.log(`  Matched        : ${matched}`);
  console.log(`  Excepted       : ${excepted}`);
  console.log(`  Enriched (DB)  : ${isDryRun ? 'n/a (dry-run)' : enriched}`);
  console.log(`  Elapsed        : ${totalSec}s`);
  console.log(`  Log            : scripts/output/enrich-log.jsonl`);
  console.log(`  Date review    : scripts/output/date-review.csv`);
  console.log('══════════════════════════════════════════════════════════\n');
}

main().catch(e => {
  console.error('\nFatal error:', e.message);
  process.exit(1);
});
