#!/usr/bin/env node
/**
 * scripts/fix-indian-sitelinks.mjs
 * Two bounded data-quality fixes for Indian rows in celebrity_sitelinks, both
 * keyed on the wikidata_id already stored (no re-discovery):
 *   1. BACKFILL sitelinks for IN rows where sitelinks = 0 — re-fetch the live
 *      wikibase:sitelinks count from Wikidata and UPDATE. (343 rows bury famous
 *      people like Asrani at the bottom of the ranked India list.)
 *   2. DEDUPE rows that share a wikidata_id — keep the highest-sitelinks row,
 *      delete the rest (e.g. "Satyen Bose" Q45789 duplicating Satyendra Nath Bose).
 *
 * DRY-RUN by default (no DB writes). Run: node --env-file=.env.local scripts/fix-indian-sitelinks.mjs [--execute]
 * Idempotent and re-runnable. Nationality/global-list composition are untouched.
 */
import { createClient } from '@supabase/supabase-js';

const EXECUTE = process.argv.includes('--execute');
const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) { console.error('missing env (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY);
console.log(`MODE: ${EXECUTE ? 'EXECUTE (DB WRITES)' : 'DRY-RUN (no DB writes)'}`);

const UA = 'BornClock-india-sitelink-fix/1.0 (hello@bornclock.com)';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runSparql(q) {
  const url = 'https://query.wikidata.org/sparql';
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/sparql-results+json',
          'User-Agent': UA,
        },
        body: 'query=' + encodeURIComponent(q),
      });
      if (res.status === 429 || res.status >= 500) { await sleep(2000 * (attempt + 1)); continue; }
      if (!res.ok) { console.error('SPARQL HTTP', res.status, (await res.text()).slice(0, 200)); return null; }
      return await res.json();
    } catch (e) { console.error('SPARQL err', e.message); await sleep(2000 * (attempt + 1)); }
  }
  return null;
}

// Load ALL IN rows (id, name, qid, sitelinks) — paginated.
async function loadInRows() {
  const rows = [];
  let from = 0; const page = 1000;
  for (;;) {
    const { data, error } = await supabase
      .from('celebrity_sitelinks')
      .select('id, name, wikidata_id, sitelinks, birth_date')
      .eq('nationality_code', 'IN')
      .order('id', { ascending: true })
      .range(from, from + page - 1);
    if (error) { console.error('load error', error); process.exit(1); }
    if (!data.length) break;
    rows.push(...data);
    if (data.length < page) break;
    from += page;
  }
  return rows;
}

// Fetch live sitelink counts for a set of QIDs via SPARQL VALUES, batched.
async function fetchSitelinks(qids) {
  const out = new Map();
  const BATCH = 200;
  for (let i = 0; i < qids.length; i += BATCH) {
    const chunk = qids.slice(i, i + BATCH);
    const values = chunk.map(q => `wd:${q}`).join(' ');
    const q = `SELECT ?item ?sitelinks WHERE { VALUES ?item { ${values} } ?item wikibase:sitelinks ?sitelinks . }`;
    const json = await runSparql(q);
    if (json) for (const b of json.results.bindings) {
      out.set(b.item.value.split('/').pop(), parseInt(b.sitelinks.value, 10));
    }
    console.log(`  sitelinks fetched ${Math.min(i + BATCH, qids.length)}/${qids.length}`);
    await sleep(600); // etiquette
  }
  return out;
}

const all = await loadInRows();
console.log(`Loaded ${all.length} IN rows.`);

// ── 1. DEDUPE by QID: keep highest sitelinks, mark the rest for deletion ────────
const byQid = new Map();
for (const r of all) {
  if (!r.wikidata_id) continue;
  const arr = byQid.get(r.wikidata_id) || [];
  arr.push(r); byQid.set(r.wikidata_id, arr);
}
const toDelete = [];
for (const [qid, arr] of byQid) {
  if (arr.length < 2) continue;
  arr.sort((a, b) => (b.sitelinks ?? 0) - (a.sitelinks ?? 0)); // keep [0]
  for (const dup of arr.slice(1)) toDelete.push(dup);
}
console.log(`\nDUPLICATE-QID groups: ${[...byQid.values()].filter(a => a.length > 1).length}  → rows to delete: ${toDelete.length}`);
for (const d of toDelete.slice(0, 15)) console.log(`   delete id=${d.id} "${d.name}" (${d.wikidata_id}, sl=${d.sitelinks})`);

// ── 2. BACKFILL sitelinks for rows with sitelinks=0 (excluding those being deleted)
const delIds = new Set(toDelete.map(d => d.id));
const zeroRows = all.filter(r => (r.sitelinks ?? 0) === 0 && r.wikidata_id && !delIds.has(r.id));
const zeroQids = [...new Set(zeroRows.map(r => r.wikidata_id))];
console.log(`\nZERO-sitelink IN rows with a QID: ${zeroRows.length} (distinct QIDs ${zeroQids.length})`);

const live = zeroQids.length ? await fetchSitelinks(zeroQids) : new Map();
const updates = [];
for (const r of zeroRows) {
  const sl = live.get(r.wikidata_id);
  if (typeof sl === 'number' && sl > 0) updates.push({ id: r.id, name: r.name, sitelinks: sl });
}
updates.sort((a, b) => b.sitelinks - a.sitelinks);
console.log(`Rows that will get a non-zero sitelink count: ${updates.length}`);
for (const u of updates.slice(0, 15)) console.log(`   id=${u.id} "${u.name}" → sitelinks=${u.sitelinks}`);

if (!EXECUTE) {
  console.log('\nDRY-RUN complete. Re-run with --execute to apply.');
  process.exit(0);
}

// ── APPLY ───────────────────────────────────────────────────────────────────────
let del = 0;
for (const d of toDelete) {
  const { error } = await supabase.from('celebrity_sitelinks').delete().eq('id', d.id);
  if (error) console.error('delete error', d.id, error.message); else del++;
}
let upd = 0;
for (const u of updates) {
  const { error } = await supabase.from('celebrity_sitelinks').update({ sitelinks: u.sitelinks }).eq('id', u.id);
  if (error) console.error('update error', u.id, error.message); else upd++;
}
console.log(`\nAPPLIED: deleted ${del} duplicate rows, updated ${upd} sitelink counts.`);
