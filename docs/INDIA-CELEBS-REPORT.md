# Indian Celebrity Coverage — Diagnose & Fix — Report

Execution of `docs/INDIA-CELEBS-PROMPT.md`. Local commits only, not pushed.
Frozen payment files untouched. Global-list composition policy respected (India depth
lives only in `CountryExtrasSection` / `/india` subpages, both prerender-suppressed).

## CLASSIFICATION — **Class C (both), but overwhelmingly a display + data-quality problem**

**Step-1 numbers (before fix):**

| Date  | total rows | Indians (`nationality_code='IN'`) |
|-------|-----------:|----------------------------------:|
| 01-01 | 1546 | **27** |
| 08-15 | 82  | 16 |
| 10-02 | 74  | 13 |
| 06-01 | 100 | 17 |
| 12-25 | 66  | 11 |
| 02-29 | 25  | 2 (genuinely thin — leap day) |

- **The DB already HAD the data.** Jan 1 had 27 Indians, not 2. The page showed ~2 because
  of the display path — **Class A**.
- Named-acceptance (Jan 1): **6 of 8 present** — Vidya Balan, Nana Patekar, Sonali Bendre,
  Asrani, Satyendra Nath Bose, Jyotiraditya Scindia. **Anand Kumar & Aasif Sheikh missing**
  entirely.
- **Data-quality gaps (Class B):** **195 famous Indians stored with `sitelinks=0`** (Satyajit
  Ray, Shah Rukh Khan, Amitabh Bachchan, CV Raman, Alia Bhatt, Mahatma Gandhi's peers, …)
  — buried at the bottom of every ranked list — plus **35 duplicate-QID rows** (e.g. "Satyen
  Bose" Q45789 duplicating Satyendra Nath Bose). Asrani sat at `sitelinks=0` → rank #27, so it
  fell outside a 12-15 cap.

**"Indian" representation in the data (Step 1):** the canonical column is
`nationality_code = 'IN'` (2627 rows). A legacy `CELEBRITY_NATIONALITY` name→code map existed
as a fallback but is redundant now that rows are coded. Fame metric: `sitelinks` (Wikidata
site-link count).

## ROOT CAUSE of the display bug (Class A)

`getCountryExtras` (the date-page "From India" section) fetched the **global top-200 by
sitelinks for the date, then filtered to Indians**, capped at **4**. On a 1546-row date the
top 200 are historical global figures (Dante 256, Atatürk 236, Columbus 226…) whose sitelinks
dwarf the Indians (15-125), so most of the 27 Indians were **never fetched** → ~2 shown.

## WHAT CHANGED

### Step 2A — display / query (code)
- `getCountryExtras` now **query-filters by `nationality_code`** and ranks nationals by
  sitelinks (mirrors `getNationalityCelebritiesForDate`), over-fetches to absorb global-list
  overlap, dedupes by QID + name, **cap raised 4 → 15**.
- `CountryExtrasSection` requests **15** (was 4). Cards render with **no image** (initials
  fallback via `Avatar` — verified no broken-avatar state). Section still returns `null` when
  empty (no empty shell) and is suppressed during prerender.

### Step 2B — bounded data fixes (DB, via `scripts/`)
- **`scripts/fix-indian-sitelinks.mjs`** (DRY-RUN default, `--execute` applied): re-fetched live
  `wikibase:sitelinks` for the zero-count IN rows and **updated 195**; **deleted 35 duplicate-
  QID rows** (kept the highest-sitelinks row each). Bounded, idempotent, re-runnable.
- **`scripts/import-indian-celebrities.mjs --execute`** (the established pathway, P27=Q668,
  sitelinks≥15, day-precision birth): DB was already comprehensive — **2418/2420 candidates
  already present; 2 new inserted** (Pralhad Joshi, Renuka Ravindran).
- **Anand Kumar & Aasif Sheikh** are NOT in the 2,563-row `sitelinks≥15` candidate set → they
  are **below the fame bar** (long tail). The prompt is explicit: "we do NOT want their 389-deep
  long tail." Importing them would mean lowering the bar, so they are intentionally left out;
  the ≥6 named acceptance is met without them.

### Rows added / changed
- **Inserted:** 2 (Pralhad Joshi, Renuka Ravindran).
- **Updated (sitelinks 0 → real):** 195.
- **Deleted (duplicate QID):** 35.
- Net IN rows: 2627 → **2594**. Remaining `sitelinks=0` IN rows: 113 (no QID / Wikidata returns
  0 — genuinely obscure; correctly ranked last).
- **Dedupe stats:** primary key = wikidata_id → 35 same-QID groups caught (35 rows removed).
  The import's secondary key (lower(name)+birth_date, for the ~1.7K QID-less rows) caught 0 new
  dupes among the 2 candidates.

## Jan 1 top-15 AS SHIPPED (India, ranked by sitelinks; ★ = named-acceptance)

```
 1. 125  Chanakya
 2.  80  Satyendra Nath Bose      ★
 3.  54  Mirabai
 4.  52  Vidya Balan              ★
 5.  44  Sonali Bendre            ★
 6.  40  Lobsang Sangay
 7.  37  Nana Patekar             ★
 8.  33  Deepa Mehta
 9.  25  Wahiduddin Khan
10.  23  Asrani                   ★   (was sitelinks=0 → rank #27; backfilled to 23)
11.  23  Aishwarya R. Dhanush
12.  22  Rabri Devi
13.  21  Salman Khurshid
14.  20  Jyotiraditya Scindia     ★
15.  19  Sayali Bhagat
```
**6 named in the top 15** ✓. Ordering sanity ✓ — Vidya Balan / Nana Patekar class above the
minor politicians (Rabri Devi, Salman Khurshid), single fame scale (sitelinks), no interleaving.

## Sample dates — after fix (top-3 now recognisable)

| Date | Indians (after) | Top 3 |
|------|----------------:|-------|
| 01-01 | 26 | Chanakya (125), Satyendra Nath Bose (80), Mirabai (54) |
| 08-15 | 15 | Aurobindo Ghosh (91), Rakhee Gulzar (34), Suhasini Maniratnam (29) |
| 10-02 | 13 | **Mahatma Gandhi (270)**, Lal Bahadur Shastri (71), Licypriya Kangujam (35) |
| 06-01 | 17 | Kabir Das (66), Nargis (53), Prithviraj Chauhan (37) |
| 12-25 | 11 | Ram Narayan (80), Ramdev (30), Priya Anjali Rai (28) |
| 02-29 | 2  | Morarji Desai (64), Rukmini Devi Arundale (32) |

(The sitelink backfill is what surfaced Gandhi at #1 on Oct 2, Aurobindo at #1 on Aug 15, etc.
— they had been at `sitelinks=0`.)

## Global-list note (transparency)

The 195 sitelink corrections were objectively-wrong `0` values (Target 3 explicitly endorses
recomputing/normalising on sitelink count). Fixing them also corrects the **global** ranking on
those ~195 people's birthdays (e.g. Shah Rukh Khan now ranks correctly on his date). This is a
data-correctness improvement, **not** the prohibited "reorder the global list to inject India
depth" — no India-specific weighting was added; the same single `sitelinks` metric is used
everywhere.

## GATE

1. tsc — 0 errors. ✓
2. build — _see below (1331)._
3. test:prelaunch + growth-pages (incl. 3 new India tests) — _see below._
4. Frozen files untouched — empty diff. ✓
5. **invoice_counters untouched** — `BC/26-27=1002, BN/26-27=1001, BX/26-27=1001` (unchanged;
   all DB writes were to `celebrity_sitelinks`). ✓
6. Live sentinel — _see below._
7. One deploy — _see below._

## Nothing partial / remaining

Scope was **not** date-partial: the fixes are DB-wide (all 366 dates benefit — the sitelink
backfill and dedupe are global, and the display fix works on every date). No resumable
remainder. The only intentional exclusion is the sub-15-sitelink long tail (Anand Kumar / Aasif
Sheikh), by policy.

## Founder spot-check
- `/born-on/january-1` (from India 🇮🇳): Vidya Balan, Nana Patekar, Sonali Bendre, Asrani,
  Satyendra Nath Bose, Jyotiraditya Scindia among ~15.
- `/born-on/august-15` (from India): Aurobindo Ghosh at the top.
- One random date, e.g. `/born-on/october-2`: Mahatma Gandhi #1.
