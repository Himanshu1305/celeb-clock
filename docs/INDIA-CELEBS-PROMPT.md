# Indian Celebrity Coverage — Diagnose & Fix (v2)
# Save as docs/INDIA-CELEBS-PROMPT.md, then: "Read docs/INDIA-CELEBS-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/INDIA-CELEBS-REPORT.md.

CONTEXT: /born-on/january-1 shows only 2 Indian celebrities. Benchmark:
bornglorious.com/india/birthday/?pd=0101 lists 389 Indians (Wikidata-sourced,
sitelink-ranked, very low bar). Our 28K-row DB came from the same source (QIDs,
nationality backfill), so this is a threshold problem, a query problem, or both.
We do NOT want their 389-deep long tail — we want the top of it.

## TARGETS (definition of done)
1. Every /born-on/{date} India section and /india subpage shows 12-15 ranked
   Indians wherever the data supports it.
2. NAMED ACCEPTANCE (Jan 1): the India list must include at least 6 of:
   Vidya Balan, Nana Patekar, Sonali Bendre, Asrani, Satyendra Nath Bose,
   Jyotiraditya Scindia, Anand Kumar, Aasif Sheikh. Any of these missing from
   the DB entirely = proof of a data gap = enrichment must run.
3. ORDERING SANITY (Jan 1): the top 10 must be ordered recognisably — Vidya
   Balan / Nana Patekar class above minor politicians. If new-import ranks and
   the existing fame metric use different scales, NORMALISE (recompute both on
   the same basis, e.g. sitelink count) rather than interleaving raw values.
   Paste the final Jan 1 top-15 in the report as evidence.

HARD RULES: frozen payment files untouched. DDL → NOTES-*.sql. Global-list-is-
identical policy stands — India depth lives ONLY in CountryExtrasSection and the
/india subpages; do not alter global list composition. Wikidata/Wikipedia API
etiquette (batched, user-agent, backoff). DB writes via the established import
pathway (read the previous 1,841-Indian import scripts in scripts/ first).

## STEP 1 — DIAGNOSE (30 min cap, then act)
1. Read BornOnDay.tsx, CountryExtrasSection, and the date-fetch service: fetch
   size, sort, caps, and EVERY representation "Indian" takes in the data
   (nationality strings, country codes, QID refs — enumerate what the column
   actually contains).
2. Via the PostgREST service-role pattern: Jan 1 total count, Jan 1 Indian
   count (testing all representations), top 30 by the fame column. Same for
   Aug 15, Oct 2, Jun 1, Dec 25, Feb 29 (systemic check).
3. Check the named-acceptance list against the DB (any birthdate — they may
   exist with a wrong/missing date, which is its own finding).
4. Classify: (A) data exists, display/filter drops it. (B) data gap. (C) both.

## STEP 2A — DISPLAY/QUERY FIX (if A or C)
- Nationality matching covers every representation found.
- CountryExtrasSection + /india pages: cap 12-15, ranked among Indians by the
  normalised fame metric (not global rank, which buries them).
- Global list untouched.

## STEP 2B — BOUNDED ENRICHMENT (if B or C)
- Country-PARAMETERISED script (default country=India / P27=Q668) so the same
  run works for other countries later. Per date: humans, citizenship match,
  birth date match, ranked by sitelink count, **TAKE TOP 30 PER DATE ONLY**
  (hard cap — bounds total growth to ≤ ~11K rows; we are not importing
  bornglorious's long tail of 134 politicians per date).
- Pull: name, QID, description, sitelink count, Wikimedia image URL if the
  previous enrichment stored images (read how; match it). Cards must render
  cleanly with NO image — verify no broken-avatar state.
- DEDUPE: primary by QID; secondary by (normalised name + birth date) because
  ~1.7K existing rows lack QIDs. Report how many dupes each key caught.
- Nationality written in the canonical representation from Step 1.
- Rank: recompute/normalise per Target 3.
- Scope all 366 dates, rate-limited. If the session cannot finish: complete
  Jan + Aug + Oct fully, commit a RESUMABLE script with exact run instructions,
  and say plainly which dates remain. Never a silent partial.

## STEP 3 — VERIFY
- Jan 1: named acceptance + ordering sanity (paste top 15).
- The 5 sample dates re-checked with counts before/after.
- growth-pages test additions: India section renders ≥N for a seeded date; a
  genuinely-thin date renders without an empty shell; a no-image celebrity
  card renders cleanly.
- Prerender the affected /india pages (full build acceptable; note the
  /todays-birthdays transient-timeout history — retry once before treating a
  failure as real).

## GATE
tsc 45 baseline 0 new · build 1331 ok 0 failed · test:prelaunch green (never
weaken) · frozen files untouched · invoice_counters untouched (paste) · rows
added total + per-date table in the report · one deploy · live sentinel OK.

## REPORT
Classification with Step-1 numbers first · what changed · dedupe stats · the
Jan 1 top-15 as shipped · dates remaining if partial, with resume command ·
founder spot-check list (Jan 1, Aug 15, one random date).
