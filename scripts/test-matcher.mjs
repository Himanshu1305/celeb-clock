#!/usr/bin/env node
/**
 * scripts/test-matcher.mjs
 *
 * Live harness for the wikidata-match lib — 8 hardcoded cases hit Wikidata directly.
 * No database credentials required.
 *
 * Usage:  node scripts/test-matcher.mjs
 *
 * Cases cover:
 *  1. Tom Cruise — global (no IN filter), exact date Stage A
 *  2. Karisma Kapoor — IN filter Stage A
 *  3. Ameesha Patel (stored as "Amisha Patel") — spelling variant, Stage B
 *  4. Chanakya — ancient figure, birth precision < 11 → EXCEPTION
 *  5. Deliberate wrong year — Stage A/A2 no match, Stage B/B2 no match → EXCEPTION
 *  6. Diljit Dosanjh — P27=Q30 (not IN on Wikidata), Stage A2 (no P27 filter)
 *  7. AR Rahman — IN, Stage A
 *  8. E. Sridharan — abbreviated name + transliteration, Stage B2
 */

import {
  buildStageASparql,
  buildStageA2Sparql,
  runSparql,
  runStageB,
  fetchEntityFull,
  extractEnrichmentData,
  transliterationVariants,
} from './lib/wikidata-match.mjs';

const CASES = [
  {
    id: 1,
    label: 'Tom Cruise (global, exact date)',
    name: 'Tom Cruise',
    birth_date: '1962-07-03',
    nationality_code: null,
    expect: 'MATCH',
    expectStage: 'A',
    expectQid: 'Q37079',
  },
  {
    id: 2,
    label: 'Karisma Kapoor (IN filter, exact date)',
    name: 'Karisma Kapoor',
    birth_date: '1974-06-25',
    nationality_code: 'IN',
    expect: 'MATCH',
    expectStage: 'A',
    expectQid: 'Q464578',
  },
  {
    id: 3,
    label: 'Ameesha Patel (stored as "Amisha Patel", Stage B spelling variant)',
    name: 'Amisha Patel',
    birth_date: '1975-06-09',
    nationality_code: 'IN',
    expect: 'MATCH',
    expectStage: 'B',
    expectQid: 'Q263819',
  },
  {
    id: 4,
    label: 'Chanakya (ancient figure, birth precision < 11 → EXCEPTION)',
    name: 'Chanakya',
    birth_date: '0350-01-01',
    nationality_code: 'IN',
    expect: 'EXCEPTION',
  },
  {
    id: 5,
    label: 'Deliberate wrong year (Tom Cruise, 1960 — 2 yrs off, outside B2 ±1 → EXCEPTION)',
    name: 'Tom Cruise',
    birth_date: '1960-07-03',
    nationality_code: null,
    expect: 'EXCEPTION',
  },
  {
    id: 6,
    label: 'Diljit Dosanjh (P27=Q30 in Wikidata, Stage A2 catches him)',
    name: 'Diljit Dosanjh',
    birth_date: '1984-01-06',
    nationality_code: 'IN',
    expect: 'MATCH',
    expectStage: 'A2',
    expectQid: 'Q5276830',
  },
  {
    id: 7,
    label: 'AR Rahman (IN, exact date, Stage A)',
    name: 'A. R. Rahman',
    birth_date: '1967-01-06',
    nationality_code: 'IN',
    expect: 'MATCH',
    expectStage: 'A',
    expectQid: 'Q108560',
  },
  {
    id: 8,
    label: 'E. Sridharan (abbreviated name + Sridharan→Sreedharan transliteration, Stage B2)',
    name: 'E. Sridharan',
    birth_date: '1932-06-12',
    nationality_code: 'IN',
    expect: 'MATCH',
    expectStage: 'B2',
    expectQid: 'Q1273577',
  },
];

// ── Result helpers ────────────────────────────────────────────────────────────
const results = [];
function PASS(msg) { results.push({ ok: true, msg }); console.log(`  ✅ PASS  ${msg}`); }
function FAIL(msg) { results.push({ ok: false, msg }); console.error(`  ❌ FAIL  ${msg}`); }
function INFO(msg) { console.log(`       ${msg}`); }

function dedup(candidates) {
  const seen = new Set();
  return candidates.filter(c => { if (seen.has(c.qid)) return false; seen.add(c.qid); return true; });
}

// ── Run one case through the full A → A2 → B → B2 pipeline ──────────────────
async function runCase(tc) {
  const { name, birth_date, nationality_code } = tc;
  const withIndia = nationality_code === 'IN';
  const birthYear = birth_date.slice(0, 4);

  let candidates = [];
  let stage = 'A';

  // Stage A: SPARQL exact full date
  try {
    candidates = dedup(await runSparql(buildStageASparql(name, birth_date, withIndia)));
    INFO(`Stage A: ${candidates.length} candidate(s) [${candidates.map(c => `${c.qid} ${c.wdDate}`).join(', ') || 'none'}]`);
  } catch (err) {
    INFO(`Stage A error: ${err.message}`);
    return { verdict: 'EXCEPTION', stage: 'A', reason: err.message };
  }

  // Stage A2: SPARQL year-only, NO P27 filter (handles Wikidata citizenship mismatches)
  if (candidates.length === 0) {
    stage = 'A2';
    try {
      candidates = dedup(await runSparql(buildStageA2Sparql(name, birthYear, false)));
      INFO(`Stage A2: ${candidates.length} candidate(s) [${candidates.map(c => `${c.qid} ${c.wdDate}`).join(', ') || 'none'}]`);
    } catch (err) {
      INFO(`Stage A2 error: ${err.message}`);
      return { verdict: 'EXCEPTION', stage: 'A2', reason: err.message };
    }
  }

  // Stage B: name search, exact date
  if (candidates.length === 0) {
    stage = 'B';
    try {
      candidates = dedup(await runStageB(name, birth_date, withIndia, 0));
      INFO(`Stage B: ${candidates.length} candidate(s) [${candidates.map(c => `${c.qid} ${c.wdDate}`).join(', ') || 'none'}]`);
    } catch (err) {
      INFO(`Stage B error: ${err.message}`);
      return { verdict: 'EXCEPTION', stage: 'B', reason: err.message };
    }
  }

  // Stage B2: name search, year ±1 + transliteration variants
  if (candidates.length === 0) {
    stage = 'B2';
    const searchNames = [name, ...transliterationVariants(name)];
    for (const searchName of searchNames) {
      try {
        const hits = dedup(await runStageB(searchName, birth_date, withIndia, 1));
        INFO(`Stage B2 (${searchName}): ${hits.length} candidate(s) [${hits.map(c => `${c.qid} ${c.wdDate}`).join(', ') || 'none'}]`);
        if (hits.length > 0) { candidates = hits; break; }
      } catch (err) {
        INFO(`Stage B2 error (${searchName}): ${err.message}`);
      }
    }
  }

  if (candidates.length === 0) return { verdict: 'EXCEPTION', stage, reason: '0 candidates found' };
  if (candidates.length > 1)  return { verdict: 'EXCEPTION', stage, reason: `${candidates.length} candidates` };

  const { qid, wdDate } = candidates[0];

  // Fetch enrichment data to show description + URL
  let description = null;
  let wikipediaUrl = null;
  try {
    const entity = await fetchEntityFull(qid);
    ({ description, wikipediaUrl } = extractEnrichmentData(entity));
  } catch (err) {
    INFO(`Enrichment fetch error: ${err.message}`);
  }

  return { verdict: 'MATCH', qid, wdDate, stage, description, wikipediaUrl };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  Wikidata Matcher Harness — 8 live cases');
  console.log('══════════════════════════════════════════════════════════\n');

  const table = [];

  for (const tc of CASES) {
    console.log(`\n── Case ${tc.id}: ${tc.label}`);
    console.log(`   Input: name="${tc.name}" birth_date="${tc.birth_date}" nationality_code=${tc.nationality_code ?? 'null'}`);

    const result = await runCase(tc);

    if (tc.expect === 'EXCEPTION') {
      if (result.verdict === 'EXCEPTION') {
        PASS(`Expected EXCEPTION — got EXCEPTION (stage=${result.stage}: ${result.reason})`);
      } else {
        FAIL(`Expected EXCEPTION — got ${result.verdict} (qid=${result.qid}, stage=${result.stage})`);
      }
    } else {
      if (result.verdict !== 'MATCH') {
        FAIL(`Expected MATCH (stage=${tc.expectStage} qid=${tc.expectQid}) — got ${result.verdict}: ${result.reason}`);
      } else {
        const stageOk = !tc.expectStage || result.stage === tc.expectStage;
        const qidOk   = !tc.expectQid  || result.qid  === tc.expectQid;
        if (stageOk && qidOk) {
          PASS(`MATCH qid=${result.qid} stage=${result.stage} wdDate=${result.wdDate}`);
          if (result.description) INFO(`description: "${result.description}"`);
          if (result.wikipediaUrl) INFO(`wikipedia_url: ${result.wikipediaUrl}`);
        } else {
          FAIL(`MATCH but qid=${result.qid} (expected ${tc.expectQid}), stage=${result.stage} (expected ${tc.expectStage})`);
        }
      }
    }

    table.push({
      case: tc.id,
      name: tc.name,
      expect: tc.expect,
      verdict: result.verdict,
      stage: result.stage ?? '—',
      qid: result.qid ?? '—',
      wdDate: result.wdDate ?? '—',
      ok: result.verdict === tc.expect,
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  RESULTS TABLE');
  console.log('══════════════════════════════════════════════════════════');
  const hdr = `${'#'.padEnd(2)} ${'Name'.padEnd(20)} ${'Expect'.padEnd(9)} ${'Got'.padEnd(9)} ${'Stage'.padEnd(6)} ${'QID'.padEnd(12)} ${'WD date'.padEnd(12)} OK?`;
  console.log(hdr);
  console.log('─'.repeat(hdr.length));
  for (const r of table) {
    console.log(
      `${String(r.case).padEnd(2)} ${r.name.padEnd(20)} ${r.expect.padEnd(9)} ${r.verdict.padEnd(9)} ` +
      `${r.stage.padEnd(6)} ${r.qid.padEnd(12)} ${r.wdDate.padEnd(12)} ${r.ok ? '✅' : '❌'}`
    );
  }
  console.log('\n══════════════════════════════════════════════════════════');
  console.log(`  ${passed}/${passed + failed} cases passed`);
  if (failed > 0) console.log('  ❌  SOME CASES FAILED — investigate above');
  else            console.log('  ✅  ALL CASES PASSED');
  console.log('══════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error('\nFatal error:', e.message);
  process.exit(1);
});
