#!/usr/bin/env node
/**
 * scripts/backfill-nationality.mjs
 * Backfill celebrity_sitelinks.nationality_code (ISO 3166-1 alpha-2) for rows
 * where it IS NULL, by resolving Wikidata P27 (country of citizenship) from the
 * row's wikidata_id (QID) via the wbgetentities API.
 *
 * Runner: node --env-file=.env.local scripts/backfill-nationality.mjs [flags]
 * Flags:
 *   --dry-run   (DEFAULT) resolve + write proposed updates to CSV, NO DB writes
 *   --execute   perform DB writes (ONLY after explicit human go)
 *   --backup    also export id,name,nationality_code for ALL rows to a backup CSV
 *   --limit=N   cap number of NULL-nationality rows processed (default: 50 dry / all execute)
 *
 * Safety:
 *   - Target set is strictly nationality_code IS NULL AND wikidata_id IS NOT NULL.
 *   - Never overwrites a non-NULL nationality_code (WHERE asserts IS NULL on write).
 *   - Batches of 50 QIDs per API call, polite delay between batches, retry w/ backoff.
 *   - Resume support: progress + already-resolved ids persisted to scripts/output.
 *   - Multiple P27 citizenships: take the FIRST that has an ISO mapping.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync, appendFileSync } from 'node:fs';

const args = process.argv.slice(2);
const EXECUTE = args.includes('--execute');
const DO_BACKUP = args.includes('--backup');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : (EXECUTE ? Infinity : 50);

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) { console.error('missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY);

console.log(`MODE: ${EXECUTE ? 'EXECUTE (DB WRITES)' : 'DRY-RUN (no DB writes)'}  limit=${LIMIT}`);

// ── Wikidata P27 country QID → ISO 3166-1 alpha-2 ──────────────────────────────
// Only confident modern-state mappings are included. Unmapped/historical states
// leave the row unresolved (reported, never guessed).
const Q2ISO = {
  Q668:'IN', Q30:'US', Q145:'GB', Q142:'FR', Q183:'DE', Q38:'IT', Q29:'ES',
  Q408:'AU', Q16:'CA', Q17:'JP', Q148:'CN', Q884:'KR', Q159:'RU', Q155:'BR',
  Q96:'MX', Q414:'AR', Q39:'CH', Q55:'NL', Q31:'BE', Q34:'SE', Q35:'DK',
  Q20:'NO', Q33:'FI', Q45:'PT', Q40:'AT', Q28:'HU', Q36:'PL', Q213:'CZ',
  Q214:'SK', Q219:'BG', Q218:'RO', Q41:'GR', Q229:'CY', Q27:'IE', Q211:'LV',
  Q37:'LT', Q191:'EE', Q189:'IS', Q32:'LU', Q403:'RS', Q224:'HR', Q215:'SI',
  Q225:'BA', Q221:'MK', Q222:'AL', Q236:'ME', Q212:'UA', Q184:'BY', Q77:'UY',
  Q298:'CL', Q739:'CO', Q419:'PE', Q717:'VE', Q736:'EC', Q750:'BO', Q733:'PY',
  Q794:'IR', Q796:'IQ', Q801:'IL', Q810:'JO', Q817:'KW', Q822:'LB', Q878:'AE',
  Q851:'SA', Q846:'QA', Q398:'BH', Q842:'OM', Q43:'TR', Q79:'EG', Q1028:'MA',
  Q948:'TN', Q262:'DZ', Q1033:'NG', Q117:'GH', Q114:'KE', Q258:'ZA', Q954:'ZW',
  Q1036:'UG', Q924:'TZ', Q1041:'SN', Q974:'CD', Q971:'CG', Q902:'BD', Q843:'PK',
  Q854:'LK', Q837:'NP', Q881:'VN', Q869:'TH', Q928:'PH', Q252:'ID', Q833:'MY',
  Q334:'SG', Q836:'MM', Q424:'KH', Q819:'LA', Q664:'NZ', Q691:'PG', Q712:'FJ',
  Q790:'HT', Q786:'DO', Q241:'CU', Q774:'GT', Q783:'HN', Q811:'NI', Q800:'CR',
  Q804:'PA', Q792:'SV', Q233:'MT', Q1049:'SD', Q1032:'NE', Q1008:'CI',
  // A few historical states with unambiguous modern successors:
  Q15180:'RU', // Soviet Union → RU (best-effort successor)
  Q174193:'GB', // UK of GB & Ireland → GB
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchP27(qids) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids.join('|')}&props=claims&format=json&origin=*`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BornClock-nationality-backfill/1.0 (hello@bornclock.com)' } });
      if (res.status === 429 || res.status >= 500) { await sleep(1000 * (attempt + 1)); continue; }
      const json = await res.json();
      return json.entities || {};
    } catch (e) {
      await sleep(1000 * (attempt + 1));
    }
  }
  return {};
}

function resolveCode(entity) {
  const claims = entity?.claims?.P27;
  if (!claims || !claims.length) return { code: null, qids: [] };
  const qids = [];
  for (const c of claims) {
    const q = c?.mainsnak?.datavalue?.value?.id;
    if (q) qids.push(q);
  }
  for (const q of qids) { if (Q2ISO[q]) return { code: Q2ISO[q], qids }; }
  return { code: null, qids };
}

// ── Optional full backup ───────────────────────────────────────────────────────
if (DO_BACKUP) {
  console.log('\nExporting full backup (id,name,nationality_code)…');
  const backupPath = 'backups/celebrity_sitelinks_pre_backfill.csv';
  writeFileSync(backupPath, 'id,name,nationality_code\n');
  let from = 0, page = 1000, rows = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('celebrity_sitelinks').select('id,name,nationality_code')
      .order('id', { ascending: true }).range(from, from + page - 1);
    if (error) { console.error('backup error', error); break; }
    if (!data.length) break;
    const csv = data.map(r => `${r.id},${JSON.stringify(r.name ?? '')},${r.nationality_code ?? ''}`).join('\n') + '\n';
    appendFileSync(backupPath, csv);
    rows += data.length;
    if (data.length < page) break;
    from += page;
  }
  console.log(`Backup written: ${backupPath}  rows=${rows}`);
}

// ── Load target rows: nationality_code NULL AND wikidata_id NOT NULL ────────────
const progressPath = 'scripts/output/backfill-progress.json';
let progress = existsSync(progressPath) ? JSON.parse(readFileSync(progressPath, 'utf8')) : { doneIds: [] };
const doneSet = new Set(progress.doneIds);

console.log('\nLoading target rows (nationality_code IS NULL, wikidata_id NOT NULL)…');
const target = [];
let from = 0, page = 1000;
while (target.length < LIMIT) {
  const { data, error } = await supabase
    .from('celebrity_sitelinks')
    .select('id,name,wikidata_id,nationality_code')
    .is('nationality_code', null).not('wikidata_id', 'is', null)
    .order('id', { ascending: true }).range(from, from + page - 1);
  if (error) { console.error('load error', error); process.exit(1); }
  if (!data.length) break;
  for (const r of data) { if (!doneSet.has(r.id) && target.length < LIMIT) target.push(r); }
  if (data.length < page) break;
  from += page;
}
console.log(`Target rows this run: ${target.length}`);

// ── Resolve in batches of 50 ───────────────────────────────────────────────────
const csvPath = EXECUTE ? 'backups/nationality_backfill_executed.csv' : 'backups/nationality_backfill_dryrun.csv';
writeFileSync(csvPath, 'id,name,wikidata_id,current_nationality_code,proposed_code,p27_qids,status\n');

let processed = 0, resolved = 0, unresolved = 0, written = 0;
const samples = [];

for (let i = 0; i < target.length; i += 50) {
  const batch = target.slice(i, i + 50);
  const entities = await fetchP27(batch.map(r => r.wikidata_id));
  for (const row of batch) {
    processed++;
    const { code, qids } = resolveCode(entities[row.wikidata_id]);
    const status = code ? 'RESOLVED' : (qids.length ? 'NO_MAPPING' : 'NO_P27');
    if (code) resolved++; else unresolved++;
    const line = `${row.id},${JSON.stringify(row.name ?? '')},${row.wikidata_id},,${code ?? ''},${qids.join('|')},${status}`;
    appendFileSync(csvPath, line + '\n');
    if (samples.length < 15) samples.push(`${row.name}  |  NULL  ->  ${code ?? '(unresolved:' + status + ')'}`);

    if (EXECUTE && code) {
      const { error, count } = await supabase
        .from('celebrity_sitelinks')
        .update({ nationality_code: code }, { count: 'exact' })
        .eq('id', row.id).is('nationality_code', null);
      if (!error) { written += count ?? 0; doneSet.add(row.id); }
      else console.error(`write fail id=${row.id}`, error.message);
    }
  }
  await sleep(300); // rate limit between batches
  console.log(`  …processed ${processed}/${target.length}`);
}

if (EXECUTE) {
  progress.doneIds = [...doneSet];
  writeFileSync(progressPath, JSON.stringify(progress));
}

console.log('\n=== SUMMARY ===');
console.log('mode:              ', EXECUTE ? 'EXECUTE' : 'DRY-RUN');
console.log('rows processed:    ', processed);
console.log('resolved:          ', resolved);
console.log('unresolved:        ', unresolved);
if (EXECUTE) console.log('DB rows written:   ', written);
console.log('CSV:               ', csvPath);
console.log('\n=== 15 sample lines (name | current | proposed) ===');
samples.forEach(s => console.log('  ' + s));
