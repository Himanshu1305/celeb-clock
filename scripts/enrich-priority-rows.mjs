#!/usr/bin/env node
/**
 * scripts/enrich-priority-rows.mjs
 *
 * Targeted enrichment for 12 migration-inserted cultural icons that have
 * wikidata_id=NULL and sitelinks=0 because the Stage 2 enrichment pipeline's
 * precision-≥11 gate filtered them out — not because they are obscure.
 *
 * Rows: Chanakya, Guru Nanak Dev, Shivaji Maharaj, Mirabai, Kabir Das,
 *       Tulsidas, Bankim Chandra Chattopadhyay, Ramakrishna Paramahamsa,
 *       Tantia Tope, Maharana Pratap, Prithviraj Chauhan, Amir Khusrau.
 *
 * Matching strategy — NAME_ONLY (no date gate, no precision filter):
 *   For every target row: wbsearchentities(name) → wbgetentities on each hit →
 *   accept the first result that is P31=Q5 (human). Date checking is omitted
 *   because (a) pre-1900 Wikidata records commonly store only decade/century
 *   precision which the standard precision-≥11 guard rejects, and (b) these
 *   names are unambiguous top-hits in Wikidata — there is no other Chanakya or
 *   Mirabai to confuse with. The --dry-run table prints the WD description for
 *   human confirmation before any write is applied.
 *
 *   Some DB names differ from Wikidata's canonical label (e.g. "Chhatrapati
 *   Shivaji Maharaj" vs Wikidata "Shivaji"). FALLBACK_NAMES provides alternate
 *   search terms tried when the primary name finds no human entity.
 *
 * Write rules:
 *   • wikidata_id    — written only if currently NULL
 *   • wikipedia_url  — written only if currently NULL
 *   • occupation     — NEVER written (curated values preserved)
 *   • sitelinks      — ALWAYS updated (fixes ranking; was 0 for all 12)
 *
 *   Sitelinks count: Wikipedia language editions only (* wiki keys, excluding
 *   commonswiki / specieswiki / wikidatawiki and other project namespaces).
 *
 * FLAGS:
 *   --dry-run   print decision table without writing to DB
 *
 * RUN:
 *   node --env-file=.env.local scripts/enrich-priority-rows.mjs --dry-run
 *   node --env-file=.env.local scripts/enrich-priority-rows.mjs
 */

import { createClient } from '@supabase/supabase-js';
import {
  searchByName,
  fetchEntityFull,
  extractEnrichmentData,
  wikiFetch,
} from './lib/wikidata-match.mjs';

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

const TARGET_IDS = [
  27433, 27441, 27444, 27445, 27446, 27447,
  27453, 27539, 27582, 27590, 27683, 27791,
];

// Alternate search terms when the DB name doesn't surface the right Wikidata entity.
// Tried in order after the primary name fails.
const FALLBACK_NAMES = {
  27683: ['Shivaji', 'Chhatrapati Shivaji'],               // Chhatrapati Shivaji Maharaj
  27444: ['Guru Nanak', 'Nanak'],                           // Guru Nanak Dev
  27453: ['Ramakrishna', 'Sri Ramakrishna'],                // Ramakrishna Paramahamsa
  27441: ['Bankim Chandra Chatterjee', 'Bankimchandra'],    // Bankim Chandra Chattopadhyay
};

// Non-Wikipedia project sitelinks — excluded from the language-edition count.
const SITELINK_EXCLUDE = new Set([
  'commonswiki', 'specieswiki', 'wikidatawiki', 'metawiki',
  'foundationwiki', 'mediawikiwiki', 'outreachwiki',
]);

const isDryRun = process.argv.includes('--dry-run');

const SUPABASE_URL             = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fetch count of Wikipedia language-edition sitelinks for a QID.
// Uses a separate props=sitelinks call (not sitefilter=enwiki) to get all editions.
async function fetchWikipediaSitelinkCount(qid) {
  const url = `${WIKIDATA_API}?action=wbgetentities&ids=${qid}&props=sitelinks&format=json`;
  const res = await wikiFetch(url);
  if (!res.ok) return 0;
  const json = await res.json();
  const entity = json.entities?.[qid];
  if (!entity?.sitelinks) return 0;
  return Object.keys(entity.sitelinks)
    .filter(k => k.endsWith('wiki') && !SITELINK_EXCLUDE.has(k))
    .length;
}

// Search by name and return the first result that is P31=Q5 (human).
// Returns { qid, label, description, wikipediaUrl } or null.
async function matchHumanByName(searchName) {
  const hits = await searchByName(searchName, 8);
  for (const hit of hits) {
    const entity = await fetchEntityFull(hit.id);
    if (!entity?.claims) continue;
    const isHuman = (entity.claims.P31 ?? []).some(
      c => c.mainsnak?.datavalue?.value?.id === 'Q5'
    );
    if (!isHuman) continue;
    const { description, wikipediaUrl } = extractEnrichmentData(entity);
    return { qid: hit.id, label: hit.label ?? searchName, description, wikipediaUrl };
  }
  return null;
}

// Try primary name then fallbacks until a human match is found.
async function matchWithFallbacks(id, primaryName) {
  const searchNames = [primaryName, ...(FALLBACK_NAMES[id] ?? [])];
  for (const name of searchNames) {
    process.stdout.write(`  search: "${name}" ... `);
    const match = await matchHumanByName(name);
    if (match) {
      console.log(`→ ${match.qid} "${match.label}"`);
      return match;
    }
    console.log('no human hit');
  }
  return null;
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  Priority Enrichment — 12 Cultural Icons');
  console.log(isDryRun ? '  MODE: DRY-RUN (no DB writes)' : '  MODE: LIVE WRITE');
  console.log('══════════════════════════════════════════════════════════\n');

  // Fetch all 12 rows in one query
  const { data: rows, error: fetchErr } = await supabase
    .from('celebrity_sitelinks')
    .select('id, name, birth_date, occupation, wikipedia_url, wikidata_id, sitelinks')
    .in('id', TARGET_IDS);

  if (fetchErr) {
    console.error('DB fetch error:', fetchErr.message);
    process.exit(1);
  }

  const rowMap = Object.fromEntries((rows ?? []).map(r => [r.id, r]));

  const decisions = [];

  for (const id of TARGET_IDS) {
    const row = rowMap[id];
    if (!row) {
      console.warn(`[${id}] NOT FOUND in DB — skipping`);
      decisions.push({ id, name: '(not found)', status: 'MISSING' });
      continue;
    }

    const { name, birth_date, occupation, wikipedia_url, wikidata_id, sitelinks } = row;
    console.log(`\n[${id}] ${name}  birth_date=${birth_date ?? 'null'}  occupation="${occupation ?? 'null'}"`);

    const match = await matchWithFallbacks(id, name);

    if (!match) {
      console.log(`  → NO MATCH`);
      decisions.push({ id, name, status: 'NO_MATCH', sitelinksOld: sitelinks ?? 0 });
      continue;
    }

    // Fetch real sitelinks count (separate call — fetchEntityFull uses sitefilter=enwiki)
    process.stdout.write(`  sitelinks for ${match.qid} ... `);
    let sitelinkCount = 0;
    try {
      sitelinkCount = await fetchWikipediaSitelinkCount(match.qid);
      console.log(`${sitelinkCount}`);
    } catch (err) {
      console.log(`error: ${err.message}`);
    }

    // Build update — only include fields currently null (occupation always excluded)
    const update = { sitelinks: sitelinkCount };   // always update sitelinks
    const willWrite = ['sitelinks'];
    if (!wikidata_id) {
      update.wikidata_id = match.qid;
      willWrite.push('wikidata_id');
    }
    if (!wikipedia_url && match.wikipediaUrl) {
      update.wikipedia_url = match.wikipediaUrl;
      willWrite.push('wikipedia_url');
    }
    // occupation intentionally omitted — curated value preserved

    decisions.push({
      id, name, status: 'MATCH',
      qid: match.qid,
      wdLabel: match.label,
      wdDescription: match.description ?? '',
      sitelinksOld: sitelinks ?? 0,
      sitelinksNew: sitelinkCount,
      willWrite,
      update,
    });
  }

  // ── Decision table ────────────────────────────────────────────────────────

  const W = { id: 8, name: 32, qid: 12, sl: 12, writes: 38, desc: 50 };
  const line = '─'.repeat(W.id + W.name + W.qid + W.sl + W.writes + W.desc + 4);

  console.log('\n\n' + '═'.repeat(line.length));
  console.log('  DECISION TABLE' + (isDryRun ? '  [DRY-RUN — no writes applied]' : ''));
  console.log('═'.repeat(line.length));
  console.log(
    'ID'.padEnd(W.id) + 'Name'.padEnd(W.name) + 'QID'.padEnd(W.qid) +
    'Sitelinks'.padEnd(W.sl) + 'Writes'.padEnd(W.writes) + 'WD Description'
  );
  console.log(line);

  for (const d of decisions) {
    if (d.status === 'MISSING' || d.status === 'NO_MATCH') {
      console.log(
        String(d.id).padEnd(W.id) + d.name.padEnd(W.name) +
        '—'.padEnd(W.qid) + '—'.padEnd(W.sl) +
        d.status.padEnd(W.writes)
      );
      continue;
    }
    console.log(
      String(d.id).padEnd(W.id) +
      d.name.slice(0, W.name - 1).padEnd(W.name) +
      d.qid.padEnd(W.qid) +
      (`${d.sitelinksOld} → ${d.sitelinksNew}`).padEnd(W.sl) +
      d.willWrite.join(', ').padEnd(W.writes) +
      d.wdDescription.slice(0, W.desc)
    );
  }
  console.log(line);

  const matched = decisions.filter(d => d.status === 'MATCH').length;
  const skipped = decisions.length - matched;
  console.log(`  ${matched} matched, ${skipped} skipped`);

  if (isDryRun) {
    console.log('\n  DRY-RUN complete — verify the table above.');
    console.log('  Re-run without --dry-run to apply writes.\n');
    return;
  }

  // ── Apply writes ──────────────────────────────────────────────────────────

  console.log('\nApplying writes...');
  let written = 0;
  let errors  = 0;

  for (const d of decisions) {
    if (d.status !== 'MATCH') continue;

    const { error } = await supabase
      .from('celebrity_sitelinks')
      .update(d.update)
      .eq('id', d.id);

    if (error) {
      console.error(`  ✗ [${d.id}] ${d.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✓ [${d.id}] ${d.name} → ${d.qid}  sitelinks=${d.sitelinksNew}  wrote: ${d.willWrite.join(', ')}`);
      written++;
    }
  }

  console.log(`\nDone: ${written} written, ${errors} errors.\n`);
}

main().catch(e => {
  console.error('\nFatal error:', e.message);
  process.exit(1);
});
