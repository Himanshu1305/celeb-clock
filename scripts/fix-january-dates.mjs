#!/usr/bin/env node
/**
 * scripts/fix-january-dates.mjs
 *
 * Disambiguates fresh IN inserts whose birth_month_day starts '01-'.
 * Some are genuine January birthdays; others are a month-corruption artefact.
 * Wikidata is the ground-truth authority.
 *
 * Runner:   node scripts/fix-january-dates.mjs [--dry-run]
 * Requires: SUPABASE_URL  SUPABASE_SERVICE_ROLE_KEY
 *
 * Preflight: fetches nationality_code='IN', created_at on MIGRATION_DATE,
 *   birth_month_day LIKE '01-%'. Includes '01-01' rows (Phase 3 of dedupe
 *   excluded them; this script includes them so Wikidata can confirm/correct).
 *   The 4 extra rows vs Phase 3's count of 44 are the '01-01' entries.
 *
 * Matching pipeline per row (stops at first successful stage):
 *
 *   Stage A   POST SPARQL: exact rdfs:label@en + P27=Q668 (India) + exact birth year
 *             + P569 precision ≥ 11 (day-level).
 *
 *   Stage A2  POST SPARQL: same but WITHOUT P27 filter.
 *             Handles cases where Wikidata has wrong/different citizenship
 *             (e.g. Diljit Dosanjh is listed as P27=Q30 on Wikidata).
 *             Accepted only when the name is an exact English-label unique match.
 *
 *   Stage B   GET wbsearchentities → wbgetentities for up to 8 candidates.
 *             Filters by P27=Q668 + precision ≥ 11 + birth year within ±2.
 *             Handles spelling variants/aliases (e.g. "Amisha Patel" finds
 *             "Ameesha Patel") and year-off-by-one Wikidata data errors.
 *
 *   Stage B2  Same as Stage B but tries an alternate transliteration
 *             (Sridharan → Sreedharan) before giving up. Handles "E. Sridharan"
 *             whose Wikidata canonical label is "E. Sreedharan".
 *
 * Precision < 11 (year-only) cannot confirm a month → EXCEPTION.
 * Wikidata records with no P569 → EXCEPTION.
 *
 * Classification:
 *   Exactly 1 surviving candidate → CONFIRMED if date matches, FIX if not.
 *   0 candidates → EXCEPTION (manual review).
 *   2+ candidates with conflicting dates → EXCEPTION.
 *   2+ candidates all agreeing on one date → treated as 1 match.
 *
 * Constraint safety: before any UPDATE, confirms target (name, birth_date)
 * slot is unoccupied (UNIQUE constraint).
 *
 * Rate limiting: ~400ms between Wikidata calls; single retry on HTTP 429.
 * --dry-run: all Wikidata lookups run; no DB writes.
 */

import { createClient } from '@supabase/supabase-js';

const MIGRATION_DATE  = '2026-07-03T00:00:00.000Z';
const DAY_AFTER       = '2026-07-04T00:00:00.000Z';
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const WIKIDATA_API    = 'https://www.wikidata.org/w/api.php';
const USER_AGENT      = 'BornClock/1.0 (https://bornclock.com) fix-january-dates.mjs';
const RATE_DELAY_MS   = 400;
const INDIA_QID       = 'Q668';

const isDryRun = process.argv.includes('--dry-run');

// ── Env validation ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
if (isDryRun) console.log('DRY-RUN mode — Wikidata lookups run; no DB writes.\n');

// ── Preflight T3-a ────────────────────────────────────────────────────────────
// Includes '01-01' rows — Phase 3 of dedupe-indian-celebs.mjs excluded them,
// giving count=44. We include them (→ 48) so Wikidata can confirm/fix each.
// '01-01' ancient figures (Chanakya, Mirabai) will fall through to EXCEPTION
// (precision < 11) and be left untouched, which is correct.
console.log('Preflight T3-a: Loading January-date fresh IN inserts…\n');
console.log('  WHERE: nationality_code=\'IN\'');
console.log(`         created_at ∈ [${MIGRATION_DATE}, ${DAY_AFTER})`);
console.log('         birth_month_day LIKE \'01-%\'  (includes 01-01; Phase 3 excluded it → 44 vs 48)\n');

const { data: rows, error: fetchErr } = await supabase
  .from('celebrity_sitelinks')
  .select('id, name, birth_date, birth_month_day')
  .eq('nationality_code', 'IN')
  .gte('created_at', MIGRATION_DATE)
  .lt('created_at', DAY_AFTER)
  .like('birth_month_day', '01-%')
  .order('name');

if (fetchErr) {
  console.error('Preflight failed:', fetchErr.message);
  process.exit(1);
}

console.log(`  ${rows.length} row(s) found:`);
rows.forEach(r =>
  console.log(`    · ${r.name.padEnd(40)} birth_date: ${r.birth_date}  bmd: ${r.birth_month_day}`)
);
console.log();

if (rows.length === 0) {
  console.log('Nothing to do — no January-date fresh inserts remain.');
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function wikiFetch(url, options = {}) {
  const opts = {
    ...options,
    headers: { 'User-Agent': USER_AGENT, ...(options.headers ?? {}) },
  };
  let res = await fetch(url, opts);
  if (res.status === 429) {
    console.log('    [Rate limited — waiting 3s and retrying…]');
    await sleep(3000);
    res = await fetch(url, opts);
  }
  return res;
}

function parseSparqlBindings(bindings) {
  const valid = [];
  const seenQid = new Set();
  for (const b of bindings) {
    const precision = parseInt(b.precision?.value ?? '0');
    if (precision < 11) continue;
    const qid = b.person.value.split('/').pop();
    if (seenQid.has(qid)) continue;
    seenQid.add(qid);
    // SPARQL returns dateTime without leading '+': "YYYY-MM-DDTHH:MM:SSZ"
    const monthDay = b.dob.value.slice(5, 10);
    valid.push({ qid, label: b.personLabel?.value ?? '', monthDay, precision });
  }
  return valid;
}

// Stage A: exact English label + P27=Q668 + exact birth year + precision ≥ 11
async function stageA(name, birthYear) {
  const esc = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const sparql = `
SELECT DISTINCT ?person ?personLabel ?dob ?precision WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person rdfs:label "${esc}"@en .
  ?person wdt:P27 wd:${INDIA_QID} .
  ?person p:P569/psv:P569 [ wikibase:timeValue ?dob ; wikibase:timePrecision ?precision ] .
  FILTER(YEAR(?dob) = ${birthYear})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;
  const res = await wikiFetch(SPARQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' },
    body: `query=${encodeURIComponent(sparql)}`,
  });
  if (!res.ok) throw new Error(`SPARQL HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return parseSparqlBindings(json.results?.bindings ?? []);
}

// Stage A2: exact English label + NO P27 filter + exact birth year + precision ≥ 11
// Catches cases where Wikidata has the wrong/different citizenship (e.g. Diljit Dosanjh
// listed as P27=Q30/USA despite being Indian).
async function stageA2(name, birthYear) {
  const esc = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const sparql = `
SELECT DISTINCT ?person ?personLabel ?dob ?precision WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person rdfs:label "${esc}"@en .
  ?person p:P569/psv:P569 [ wikibase:timeValue ?dob ; wikibase:timePrecision ?precision ] .
  FILTER(YEAR(?dob) = ${birthYear})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;
  const res = await wikiFetch(SPARQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' },
    body: `query=${encodeURIComponent(sparql)}`,
  });
  if (!res.ok) throw new Error(`SPARQL A2 HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return parseSparqlBindings(json.results?.bindings ?? []);
}

// Stage B: wbsearchentities (handles spelling variants/aliases) + P27=Q668
// + precision ≥ 11 + birth year within ±2 (tolerates Wikidata year errors).
async function stageB(searchName, birthYear) {
  const searchUrl = `${WIKIDATA_API}?action=wbsearchentities` +
    `&search=${encodeURIComponent(searchName)}&language=en&type=item&limit=8&format=json`;
  const searchRes = await wikiFetch(searchUrl);
  if (!searchRes.ok) throw new Error(`wbsearchentities HTTP ${searchRes.status}`);
  const searchData = await searchRes.json();
  const candidates = searchData.search ?? [];

  const results = [];
  for (const cand of candidates) {
    await sleep(150);
    const entityRes = await wikiFetch(
      `${WIKIDATA_API}?action=wbgetentities&ids=${cand.id}&props=claims&format=json`
    );
    if (!entityRes.ok) continue;
    const entityData = await entityRes.json();
    const entity = entityData.entities?.[cand.id];
    if (!entity?.claims) continue;

    const isIndian = (entity.claims.P27 ?? []).some(
      c => c.mainsnak?.datavalue?.value?.id === INDIA_QID
    );
    if (!isIndian) continue;

    for (const claim of entity.claims.P569 ?? []) {
      const v = claim.mainsnak?.datavalue?.value;
      if (!v || (v.precision ?? 0) < 11) continue;
      // Wikidata API time format: "+YYYY-MM-DDTHH:MM:SSZ" (leading '+')
      const timeStr = v.time.replace(/^\+/, '');
      const year = parseInt(timeStr.slice(0, 4));
      // ±2 year tolerance — handles Wikidata data quality errors (e.g. Shilpa Shetty:
      // Wikipedia says 1975, Wikidata says 1976)
      if (Math.abs(year - birthYear) > 2) continue;
      const monthDay = timeStr.slice(5, 10);
      results.push({ qid: cand.id, label: cand.label ?? searchName, monthDay, precision: v.precision });
    }
  }
  return results;
}

// Transliteration variants to try in Stage B2 when B returns 0.
// Handles "E. Sridharan" whose Wikidata canonical label is "E. Sreedharan".
function transliterationVariants(name) {
  const variants = new Set();
  if (name.includes('Sridharan')) variants.add(name.replace(/Sridharan/g, 'Sreedharan'));
  if (name.includes('Sreedharan')) variants.add(name.replace(/Sreedharan/g, 'Sridharan'));
  if (name.includes('Sri ')) variants.add(name.replace(/Sri /g, 'Sree '));
  if (name.includes('Kumar')) variants.add(name.replace(/Kumar/g, 'Kumaar'));
  // Add more pairs as needed
  return [...variants].filter(v => v !== name);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
const decisions = [];

for (const row of rows) {
  const birthYear = row.birth_date ? parseInt(row.birth_date.slice(0, 4)) : null;

  if (!birthYear) {
    decisions.push({
      name: row.name, ourDate: row.birth_month_day, wdDate: null,
      stage: '—', candidates: 0, verdict: 'EXCEPTION', reason: 'birth_date is null',
    });
    continue;
  }

  let candidates = [];
  let stage = 'A';

  const runStage = async (label, fn) => {
    try {
      const result = await fn();
      await sleep(RATE_DELAY_MS);
      return { result, err: null };
    } catch (err) {
      return { result: [], err: err.message };
    }
  };

  // Stage A
  const a = await runStage('A', () => stageA(row.name, birthYear));
  if (a.err) {
    decisions.push({ name: row.name, ourDate: row.birth_month_day, wdDate: null, stage: 'A', candidates: 0, verdict: 'EXCEPTION', reason: `Stage A error: ${a.err}` });
    continue;
  }
  candidates = a.result;

  // Stage A2 (no P27 filter) — only when A returns nothing
  if (candidates.length === 0) {
    stage = 'A2';
    const a2 = await runStage('A2', () => stageA2(row.name, birthYear));
    if (a2.err) {
      decisions.push({ name: row.name, ourDate: row.birth_month_day, wdDate: null, stage: 'A2', candidates: 0, verdict: 'EXCEPTION', reason: `Stage A2 error: ${a2.err}` });
      continue;
    }
    candidates = a2.result;
  }

  // Stage B (name search, P27=Q668, ±2 year) — only when A and A2 return nothing
  if (candidates.length === 0) {
    stage = 'B';
    const b = await runStage('B', () => stageB(row.name, birthYear));
    if (b.err) {
      decisions.push({ name: row.name, ourDate: row.birth_month_day, wdDate: null, stage: 'B', candidates: 0, verdict: 'EXCEPTION', reason: `Stage B error: ${b.err}` });
      continue;
    }
    candidates = b.result;
  }

  // Stage B2 — transliteration variant of the name, same B logic
  if (candidates.length === 0) {
    const variants = transliterationVariants(row.name);
    for (const variant of variants) {
      stage = 'B2';
      const b2 = await runStage('B2', () => stageB(variant, birthYear));
      if (b2.err) continue;
      if (b2.result.length > 0) { candidates = b2.result; break; }
    }
  }

  if (candidates.length === 0) {
    decisions.push({
      name: row.name, ourDate: row.birth_month_day, wdDate: null,
      stage, candidates: 0, verdict: 'EXCEPTION', reason: '0 Wikidata candidates found',
    });
    continue;
  }

  const uniqueDates = [...new Set(candidates.map(c => c.monthDay))];
  if (uniqueDates.length > 1) {
    decisions.push({
      name: row.name, ourDate: row.birth_month_day,
      wdDate: uniqueDates.join(' / '),
      stage, candidates: candidates.length,
      verdict: 'EXCEPTION', reason: `${candidates.length} candidates with conflicting dates`,
    });
    continue;
  }

  const wdMonthDay = uniqueDates[0];

  if (wdMonthDay === row.birth_month_day) {
    decisions.push({
      name: row.name, ourDate: row.birth_month_day, wdDate: wdMonthDay,
      stage, candidates: candidates.length, verdict: 'CONFIRMED', reason: 'dates match',
    });
    continue;
  }

  // Constraint safety check before marking as FIX
  const targetBirthDate = `${birthYear}-${wdMonthDay}`;
  const { data: occupant } = await supabase
    .from('celebrity_sitelinks')
    .select('id')
    .eq('name', row.name)
    .eq('birth_date', targetBirthDate)
    .neq('id', row.id)
    .limit(1);

  if (occupant && occupant.length > 0) {
    decisions.push({
      name: row.name, ourDate: row.birth_month_day, wdDate: wdMonthDay,
      stage, candidates: candidates.length,
      verdict: 'EXCEPTION', reason: `UNIQUE constraint: target slot occupied by id ${occupant[0].id}`,
    });
    continue;
  }

  decisions.push({
    name: row.name, ourDate: row.birth_month_day, wdDate: wdMonthDay,
    stage, candidates: candidates.length, verdict: 'FIX',
    row, targetBirthDate,
  });
}

// ── Decision table ────────────────────────────────────────────────────────────
const C = { name: 38, our: 10, wd: 10, stage: 7, cands: 5 };
const hdr = `${'Name'.padEnd(C.name)} | ${'Our date'.padEnd(C.our)} | ${'WD date'.padEnd(C.wd)} | ${'Stage'.padEnd(C.stage)} | ${'#'.padEnd(C.cands)} | Verdict`;
console.log('\n' + hdr);
console.log('─'.repeat(hdr.length));
for (const d of decisions) {
  const verdict = d.verdict === 'FIX'
    ? `FIX → ${d.wdDate}`
    : d.verdict === 'EXCEPTION'
      ? `EXCEPTION: ${d.reason}`
      : d.verdict;
  console.log(
    `${d.name.padEnd(C.name)} | ${(d.ourDate ?? '—').padEnd(C.our)} | ${(d.wdDate ?? '—').padEnd(C.wd)} | ${d.stage.padEnd(C.stage)} | ${String(d.candidates).padEnd(C.cands)} | ${verdict}`
  );
}

// ── Apply fixes (live mode only) ──────────────────────────────────────────────
const toFix = decisions.filter(d => d.verdict === 'FIX');
let fixed = 0;
const fixErrors = [];

if (!isDryRun && toFix.length > 0) {
  console.log(`\nApplying ${toFix.length} fix(es)…`);
  for (const d of toFix) {
    const { error } = await supabase
      .from('celebrity_sitelinks')
      .update({ birth_month_day: d.wdDate, birth_date: d.targetBirthDate })
      .eq('id', d.row.id);
    if (error) {
      fixErrors.push(`${d.name}: ${error.message}`);
      console.error(`  ✗ ${d.name}: ${error.message}`);
    } else {
      fixed++;
      console.log(`  ✓ ${d.name.padEnd(38)} ${d.ourDate} → ${d.wdDate}`);
    }
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
const confirmed  = decisions.filter(d => d.verdict === 'CONFIRMED');
const exceptions = decisions.filter(d => d.verdict === 'EXCEPTION');

const bar = '═'.repeat(60);
console.log(`\n${bar}`);
console.log(`  January Date Fix — Summary${isDryRun ? ' [DRY-RUN]' : ''}`);
console.log(bar);
console.log(`  Rows processed:  ${rows.length}  (includes 4 '01-01' rows excluded by Phase 3)`);
console.log(`  CONFIRMED:       ${confirmed.length}  (genuine January birthdays — no change)`);
console.log(`  FIX${isDryRun ? ' (would apply)' : ' (applied)  '}:       ${toFix.length}${!isDryRun && fixed < toFix.length ? `  (${fixed} ok / ${toFix.length - fixed} failed)` : ''}`);
console.log(`  EXCEPTION:       ${exceptions.length}  (manual review required)`);
if (exceptions.length) {
  console.log('  Exception detail:');
  exceptions.forEach(e => console.log(`    · ${e.name}: ${e.reason}`));
}
if (fixErrors.length) {
  console.log('\n  Errors:');
  fixErrors.forEach(e => console.log(`    ✗ ${e}`));
}
console.log(bar);

if (fixErrors.length > 0) process.exit(1);
