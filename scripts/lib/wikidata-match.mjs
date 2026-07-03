/**
 * scripts/lib/wikidata-match.mjs
 *
 * Shared Wikidata matching utilities for BornClock enrichment scripts.
 * Extracted from fix-january-dates.mjs patterns; extended for global 26K enrichment.
 *
 * Rate limit: ≤1 req/sec (MIN_INTERVAL_MS). Module-level state — one limiter
 * across the entire process regardless of how many callers import this module.
 *
 * Error handling: exponential backoff (2 → 4 → 8 → 16s) on 429/5xx;
 * hard-fail after MAX_CONSECUTIVE_ERRORS consecutive failures.
 */

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const WIKIDATA_API    = 'https://www.wikidata.org/w/api.php';
export const INDIA_QID       = 'Q668';
export const USER_AGENT      = 'BornClock/1.0 (https://bornclock.com) enrich-celebrities.mjs';

const MIN_INTERVAL_MS       = 1000;
const MAX_CONSECUTIVE_ERRORS = 5;

// Module-level rate limiter state — shared across all callers
let lastRequestMs       = 0;
let consecutiveErrors   = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function enforceRateLimit() {
  const gap = MIN_INTERVAL_MS - (Date.now() - lastRequestMs);
  if (gap > 0) await sleep(gap);
  lastRequestMs = Date.now();
}

// Fetch with rate limiting + exponential backoff on 429/5xx.
// Throws on hard-fail (5 consecutive errors) or unrecoverable HTTP error.
export async function wikiFetch(url, options = {}) {
  const opts = {
    ...options,
    headers: { 'User-Agent': USER_AGENT, ...(options.headers ?? {}) },
  };
  const backoffs = [2000, 4000, 8000, 16000];

  for (let attempt = 0; ; attempt++) {
    await enforceRateLimit();

    let res;
    try {
      res = await fetch(url, opts);
    } catch (networkErr) {
      consecutiveErrors++;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS)
        throw new Error(`Hard-fail: ${MAX_CONSECUTIVE_ERRORS} consecutive network errors: ${networkErr.message}`);
      if (attempt >= backoffs.length) throw networkErr;
      console.warn(`  [wikiFetch] network error — backoff ${backoffs[attempt]}ms`);
      await sleep(backoffs[attempt]);
      lastRequestMs = Date.now();
      continue;
    }

    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      consecutiveErrors++;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS)
        throw new Error(`Hard-fail: ${MAX_CONSECUTIVE_ERRORS} consecutive errors (last HTTP ${res.status})`);
      if (attempt >= backoffs.length)
        throw new Error(`HTTP ${res.status} after ${attempt + 1} attempts`);
      console.warn(`  [wikiFetch] HTTP ${res.status} — backoff ${backoffs[attempt]}ms (attempt ${attempt + 1})`);
      await sleep(backoffs[attempt]);
      lastRequestMs = Date.now();
      continue;
    }

    consecutiveErrors = 0;
    return res;
  }
}

// Parse SPARQL bindings into candidates. Filters precision < 11 (year-only cannot
// confirm month-day). Returns { qid, label, wdDate: "YYYY-MM-DD", precision }.
// SPARQL dateTime format: "YYYY-MM-DDTHH:MM:SSZ" (no leading '+').
export function parseSparqlCandidates(bindings) {
  const seen    = new Set();
  const results = [];
  for (const b of bindings) {
    const precision = parseInt(b.precision?.value ?? '0');
    if (precision < 11) continue;
    const qid = b.person.value.split('/').pop();
    if (seen.has(qid)) continue;
    seen.add(qid);
    const wdDate = b.dob.value.slice(0, 10); // "YYYY-MM-DD"
    results.push({ qid, label: b.personLabel?.value ?? '', wdDate, precision });
  }
  return results;
}

// POST SPARQL query and return parsed candidates.
export async function runSparql(sparql) {
  const res = await wikiFetch(SPARQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/sparql-results+json',
    },
    body: `query=${encodeURIComponent(sparql)}`,
  });
  if (!res.ok) throw new Error(`SPARQL HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return parseSparqlCandidates(json.results?.bindings ?? []);
}

// Build Stage A SPARQL: exact English label + full date SUBSTR match + precision ≥ 11.
// withIndia=true adds P27=Q668 filter (only for nationality_code='IN' rows).
export function buildStageASparql(name, birthDate, withIndia = false) {
  const esc = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const indiaLine = withIndia ? `  ?person wdt:P27 wd:${INDIA_QID} .\n` : '';
  return `SELECT DISTINCT ?person ?personLabel ?dob ?precision WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person rdfs:label "${esc}"@en .
${indiaLine}  ?person p:P569/psv:P569 [ wikibase:timeValue ?dob ; wikibase:timePrecision ?precision ] .
  FILTER(SUBSTR(STR(?dob), 1, 10) = "${birthDate}")
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;
}

// Build Stage A2 SPARQL: exact English label + year-only filter (handles stored date
// off by month, or Wikidata month/day data quality issues).
export function buildStageA2Sparql(name, birthYear, withIndia = false) {
  const esc       = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const indiaLine = withIndia ? `  ?person wdt:P27 wd:${INDIA_QID} .\n` : '';
  return `SELECT DISTINCT ?person ?personLabel ?dob ?precision WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person rdfs:label "${esc}"@en .
${indiaLine}  ?person p:P569/psv:P569 [ wikibase:timeValue ?dob ; wikibase:timePrecision ?precision ] .
  FILTER(YEAR(?dob) = ${parseInt(birthYear)})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;
}

// Search by name via wbsearchentities. Returns raw search hits (id, label, description).
export async function searchByName(name, limit = 8) {
  const url = `${WIKIDATA_API}?action=wbsearchentities` +
    `&search=${encodeURIComponent(name)}&language=en&type=item&limit=${limit}&format=json`;
  const res = await wikiFetch(url);
  if (!res.ok) throw new Error(`wbsearchentities HTTP ${res.status}`);
  const json = await res.json();
  return json.search ?? [];
}

// Fetch full entity data (claims + descriptions + enwiki sitelink) for a QID.
export async function fetchEntityFull(qid) {
  const url = `${WIKIDATA_API}?action=wbgetentities&ids=${qid}` +
    `&props=claims%7Cdescriptions%7Csitelinks&sitefilter=enwiki&format=json`;
  const res = await wikiFetch(url);
  if (!res.ok) throw new Error(`wbgetentities HTTP ${res.status}`);
  const json = await res.json();
  return json.entities?.[qid] ?? null;
}

// Extract description + wikipedia_url from a fetched entity object.
// Returns { description: string|null, wikipediaUrl: string|null }.
export function extractEnrichmentData(entity) {
  if (!entity) return { description: null, wikipediaUrl: null };
  const description = entity.descriptions?.en?.value ?? null;
  const sitelink    = entity.sitelinks?.enwiki;
  const wikipediaUrl = sitelink
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(sitelink.title.replace(/ /g, '_'))}`
    : null;
  return { description, wikipediaUrl };
}

// Stage B: wbsearchentities → wbgetentities for each candidate.
// Filters by P27=Q668 if withIndia, exact birthDate if yearTolerance=0 (Stage B),
// or year within ±yearTolerance (Stage B2).
// Returns { qid, label, wdDate: "YYYY-MM-DD", precision }[].
export async function runStageB(searchName, birthDate, withIndia = false, yearTolerance = 0) {
  const birthYear  = parseInt(birthDate.slice(0, 4));
  const hits       = await searchByName(searchName);
  const results    = [];

  for (const hit of hits) {
    const entity = await fetchEntityFull(hit.id);
    if (!entity?.claims) continue;

    if (withIndia) {
      const isIndian = (entity.claims.P27 ?? []).some(
        c => c.mainsnak?.datavalue?.value?.id === INDIA_QID
      );
      if (!isIndian) continue;
    }

    for (const claim of entity.claims.P569 ?? []) {
      const v = claim.mainsnak?.datavalue?.value;
      if (!v || (v.precision ?? 0) < 11) continue;
      // Wikidata API time: "+YYYY-MM-DDTHH:MM:SSZ" (leading '+')
      const wdDate = v.time.replace(/^\+/, '').slice(0, 10); // "YYYY-MM-DD"
      const wdYear = parseInt(wdDate.slice(0, 4));

      if (yearTolerance === 0) {
        if (wdDate !== birthDate) continue;
      } else {
        if (Math.abs(wdYear - birthYear) > yearTolerance) continue;
      }

      results.push({ qid: hit.id, label: hit.label ?? searchName, wdDate, precision: v.precision });
      break; // first qualifying P569 per entity suffices
    }
  }

  return results;
}

// Transliteration variants to try in Stage B2 when all name forms fail.
// Handles "E. Sridharan" → Wikidata canonical "E. Sreedharan", and similar.
export function transliterationVariants(name) {
  const variants = new Set();
  if (name.includes('Sridharan'))  variants.add(name.replace(/Sridharan/g, 'Sreedharan'));
  if (name.includes('Sreedharan')) variants.add(name.replace(/Sreedharan/g, 'Sridharan'));
  if (name.includes('Sri '))       variants.add(name.replace(/Sri /g, 'Sree '));
  if (name.includes('Kumar'))      variants.add(name.replace(/Kumar/g, 'Kumaar'));
  return [...variants].filter(v => v !== name);
}
