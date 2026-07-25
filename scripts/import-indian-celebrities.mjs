#!/usr/bin/env node
/**
 * scripts/import-indian-celebrities.mjs
 * Discover Indian humans (Wikidata P27 = Q668) with sitelinks >= 15 and a known
 * birth date, dedupe against existing celebrity_sitelinks rows, and (on --execute)
 * insert the NEW ones. DRY-RUN by default: writes candidates to CSV, no DB writes.
 *
 * Runner: node --env-file=.env.local scripts/import-indian-celebrities.mjs [--execute]
 *
 * Table fields populated: name, known_for (en description), birth_date, birth_month_day,
 * death_date, sitelinks, wikidata_id, nationality_code='IN'.
 * Dedupe: by wikidata_id (QID); fallback lower(name)+birth_date when a DB row has no QID.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, appendFileSync } from 'node:fs';

const EXECUTE = process.argv.includes('--execute');
const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) { console.error('missing env'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY);
console.log(`MODE: ${EXECUTE ? 'EXECUTE (DB WRITES)' : 'DRY-RUN (no DB writes)'}`);

// ── 1. SPARQL: Indian humans, sitelinks >= 15, with birth date ─────────────────
// Birth date is taken from the STATEMENT VALUE NODE so we can read its
// wikibase:timePrecision and require day precision (>= 11). This excludes
// year-only (prec 9) and month-only (prec 10) P569 values that would otherwise
// serialize as YYYY-01-01 and pollute birth_month_day with fake Jan-1 birthdays.
const SPARQL = `
SELECT ?item ?itemLabel ?desc ?birth ?prec ?death ?sitelinks WHERE {
  ?item wdt:P31 wd:Q5 ;
        wdt:P27 wd:Q668 ;
        wikibase:sitelinks ?sitelinks ;
        p:P569/psv:P569 ?birthNode ;
        rdfs:label ?itemLabel .
  ?birthNode wikibase:timeValue ?birth ;
             wikibase:timePrecision ?prec .
  FILTER(?prec >= 11)
  FILTER(LANG(?itemLabel) = "en")
  FILTER(?sitelinks >= 15)
  OPTIONAL { ?item wdt:P570 ?death . }
  OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "en") }
}`;

async function runSparql(q) {
  const url = 'https://query.wikidata.org/sparql';
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'BornClock-indian-import/1.0 (hello@bornclock.com)',
        },
        body: 'query=' + encodeURIComponent(q),
      });
      if (res.status === 429 || res.status >= 500) { await new Promise(r=>setTimeout(r,2000*(attempt+1))); continue; }
      if (!res.ok) { console.error('SPARQL HTTP', res.status, (await res.text()).slice(0,300)); return null; }
      return await res.json();
    } catch (e) { console.error('SPARQL err', e.message); await new Promise(r=>setTimeout(r,2000*(attempt+1))); }
  }
  return null;
}

console.log('Querying Wikidata SPARQL (P27=Q668, sitelinks>=15, has P569)…');
const json = await runSparql(SPARQL);
if (!json) { console.error('SPARQL failed'); process.exit(1); }
const rows = json.results.bindings;
console.log('Raw SPARQL rows:', rows.length);

// ── 2. Normalize + dedupe by QID (one candidate per item) ──────────────────────
const byQid = new Map();
for (const b of rows) {
  const qid = b.item.value.split('/').pop();          // Q12345
  const birth = (b.birth?.value || '').slice(0, 10);   // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) continue;
  const death = b.death?.value ? b.death.value.slice(0, 10) : null;
  const cand = {
    qid,
    name: b.itemLabel.value,
    desc: b.desc?.value || null,
    birth_date: birth,
    birth_month_day: birth.slice(5),                   // MM-DD
    death_date: death && /^\d{4}-\d{2}-\d{2}$/.test(death) ? death : null,
    sitelinks: parseInt(b.sitelinks.value, 10),
  };
  const prev = byQid.get(qid);
  if (!prev || cand.sitelinks > prev.sitelinks) byQid.set(qid, cand);
}
const candidates = [...byQid.values()];
console.log('Distinct candidate people:', candidates.length);

// ── 3. Load existing DB rows for dedupe (QID + name|birth) ──────────────────────
console.log('Loading existing celebrity_sitelinks for dedupe…');
const existingQids = new Set();
const existingNameBirth = new Set();
let from = 0, page = 1000;
for (;;) {
  const { data, error } = await supabase
    .from('celebrity_sitelinks').select('name,birth_date,wikidata_id')
    .order('id', { ascending: true }).range(from, from + page - 1);
  if (error) { console.error('load error', error); process.exit(1); }
  if (!data.length) break;
  for (const r of data) {
    if (r.wikidata_id) existingQids.add(r.wikidata_id);
    if (r.name && r.birth_date) existingNameBirth.add(`${r.name.toLowerCase()}|${r.birth_date}`);
  }
  if (data.length < page) break;
  from += page;
}
console.log('Existing QIDs:', existingQids.size, ' existing name|birth keys:', existingNameBirth.size);

// ── 4. Classify new vs present ─────────────────────────────────────────────────
for (const c of candidates) {
  c.present = existingQids.has(c.qid) || existingNameBirth.has(`${c.name.toLowerCase()}|${c.birth_date}`);
}
const newOnes = candidates.filter(c => !c.present).sort((a,b)=>b.sitelinks-a.sitelinks);
const present = candidates.filter(c => c.present);

// ── 5. Write CSV (all candidates) ──────────────────────────────────────────────
const csvPath = EXECUTE ? 'backups/indian_import_executed.csv' : 'backups/indian_import_dryrun.csv';
writeFileSync(csvPath, 'qid,name,birth_date,death_date,sitelinks,status,description\n');
for (const c of candidates.sort((a,b)=>b.sitelinks-a.sitelinks)) {
  appendFileSync(csvPath, `${c.qid},${JSON.stringify(c.name)},${c.birth_date},${c.death_date ?? ''},${c.sitelinks},${c.present?'PRESENT':'NEW'},${JSON.stringify(c.desc ?? '')}\n`);
}

// ── 6. Summary ─────────────────────────────────────────────────────────────────
console.log('\n=== SUMMARY ===');
console.log('total candidates:      ', candidates.length);
console.log('already present in DB:  ', present.length);
console.log('NEW (not in DB):        ', newOnes.length);
console.log('CSV:                    ', csvPath);

console.log('\n=== TOP 25 NEW candidates by sitelinks ===');
newOnes.slice(0, 25).forEach((c,i) =>
  console.log(`${String(i+1).padStart(2)}. sl=${String(c.sitelinks).padStart(3)}  ${c.qid}  ${c.birth_date}${c.death_date?(' d.'+c.death_date):''}  ${c.name}  — ${c.desc ?? ''}`)
);

const sk = candidates.filter(c => c.name.toLowerCase().includes('sanjeev kumar'));
console.log('\n=== Sanjeev Kumar check ===');
if (sk.length) sk.forEach(c => console.log(`FOUND: ${c.qid}  ${c.name}  birth=${c.birth_date} death=${c.death_date} sitelinks=${c.sitelinks} status=${c.present?'PRESENT':'NEW'}  desc="${c.desc}"`));
else console.log('NOT in candidate list');

// ── 7. Execute (only with --execute; gated on human go) ─────────────────────────
if (EXECUTE) {
  console.log('\nInserting NEW rows…');
  let inserted = 0;
  for (let i = 0; i < newOnes.length; i += 200) {
    const chunk = newOnes.slice(i, i + 200).map(c => ({
      name: c.name, known_for: c.desc, birth_date: c.birth_date,
      birth_month_day: c.birth_month_day, death_date: c.death_date,
      sitelinks: c.sitelinks, wikidata_id: c.qid,
      nationality_code: 'IN', nationality: 'Indian',
    }));
    const { error, count } = await supabase.from('celebrity_sitelinks').insert(chunk, { count: 'exact' });
    if (error) { console.error('insert error at chunk', i, error.message); break; }
    inserted += count ?? chunk.length;
    console.log(`  inserted ${inserted}/${newOnes.length}`);
  }
  console.log('TOTAL INSERTED:', inserted);
}
