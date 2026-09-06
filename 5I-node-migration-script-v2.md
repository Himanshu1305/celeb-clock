# Prompt 5-I (regenerated) — Run the Indian celebrity migration via a Node script
DO NOT ask for approval.

## Context — read carefully, this corrects an earlier false premise
The Indian celebrity migration was NEVER executed. Earlier claims that it succeeded were wrong: staging's rich Indian cards came from the old client-side merge (mergeWithIndianCelebrities) running on a STALE build. The database is unenriched: occupation / wikipedia_url / nationality / nationality_code are NULL for essentially all 25,952 rows in celebrity_sitelinks.

Current true state:
- The user has JUST run this in Supabase Studio (verified — both columns exist now):
  ALTER TABLE celebrity_sitelinks ADD COLUMN IF NOT EXISTS known_for TEXT, ADD COLUMN IF NOT EXISTS tier TEXT;
- The code at HEAD (a75dff3 + 5d789f5 + 565d827) already SELECTs known_for and sorts by nationality_code — it is correct for an enriched DB, which does not exist yet. Until the migration runs, Indian celebrities have no rich data anywhere, and develop MUST NOT be deployed.
- The 8,559-line SQL file approach failed (Supabase Studio silently rolls back large pastes). This script replaces it.

## Step 1 — Check how the repo connects to Supabase

```bash
grep -rn "createClient\|SUPABASE_URL\|VITE_SUPABASE" src/integrations/supabase/ .env* 2>/dev/null | head -10
```

Identify the project URL. The script must read URL + key from env vars at runtime (the service-role key is needed because RLS likely blocks anon writes):

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Step 2 — Write scripts/migrate-indian-celebs.mjs

A standalone Node script (NOT part of the app bundle) that:

1. **Loads the 598 entries from src/data/indianCelebrities.ts.** It's TypeScript — prefer `npx tsx` as the runner so it imports the .ts directly (check `npx tsx --version`; tsx or ts-node may already be available). If neither is available, parse the file with the same extraction approach the earlier SQL generator used. Do NOT install new packages (package.json must stay untouched).

2. Creates the client:
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

3. **Preflight:** verify known_for exists by selecting it from one row inside try/catch. It now exists, so this should pass — but keep the check; exit with clear instructions if it ever fails.

4. **For each of the 598 entries:**
   - SELECT the matching row(s): `.ilike('name', entry.name).eq('birth_month_day', entry.birthMonthDay)` selecting `id, occupation, death_date`.
   - Build the update payload: always set `nationality: 'Indian'`, `nationality_code: 'IN'`, `known_for`, `tier`; include `occupation` ONLY if the fetched value is null/empty (preserve any existing Wikidata value); same preservation rule for `death_date` if the TS data carries one.
   - UPDATE by id(s).
   - Track: **updated** (1 match) / **multi-match** (>1 — update all, log names) / **unmatched** (0 — collect).

5. **Unmatched entries:** INSERT fresh with all fields + nationality set.

6. **Final summary** printed:
```
Updated: N
Multi-match (review): N — [names]
Inserted fresh: N — [names]
Errors: N — [name: reason]
```

7. Sequential awaits (no Promise.all storm). ~1,200 requests total; under 2 minutes; no delay needed.

Safety rules: NEVER delete rows; NEVER update rows not matched by name + birth_month_day; print every multi-match and error, never swallow.

## Step 3 — Hand the user the run command

Print, with the REAL project URL filled in from Step 1:

```bash
SUPABASE_URL="https://<real-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<paste service_role key from Studio → Settings → API>" \
npx tsx scripts/migrate-indian-celebs.mjs
```

(adjust runner to whatever Step 2 settled on). Then STOP — the user runs it and pastes the summary back. Do not proceed past this point until they do.

## Step 4 — After the user confirms the summary (in their next message)

1. **Frozen-blob investigation:** ReportView has a live-fetch useEffect with a frozen-blob fallback. Determine whether recent verify-print runs were validating frozen-blob celebrity data because the live fetch was failing (it SELECTed known_for before the column existed). Read the fetch + fallback code, check for error swallowing, and report: (a) the fallback trigger conditions, (b) whether a failed fetch is silent, (c) whether verify-print can currently distinguish live data from fallback data. Recommend (don't yet implement) a guard if warranted.

2. **Doc correction:** fix docs/ARCHITECTURE-DECISIONS.md §5 and §9:
   - §5: replace the false migration story with the truth — the SQL paste rolled back; the Node script (this one) was designed but not executed; a stale staging deploy showing old-merge cards was misread as migration success; Part C removed the merge on that false premise; the ALTER + this script executed on 2026-07-03 completed the actual migration.
   - §9: the runbook's bulk-data pattern now points at a real file (scripts/migrate-indian-celebs.mjs).
   - Add to §2 meta-lessons: "A stale deploy can make removed code look like working data — verify against the DB, not a rendered page."
   - Update §8: the four June-25 non-Indian occupations (George Michael, Bourdain, Abrikosov, Jensen) are confirmed still NULL — remains open until Stage 2 or manual UPDATEs.

3. **Verify:** `npm run build` clean; `node scripts/verify-print.mjs` — confirm Twins section renders Karisma Kapoor + Madan Mohan and note whether the data now demonstrably comes from the live fetch.

## Step 5 — Commits (after Step 4)
- Commit 1: `chore(data): Node migration script for Indian celebrities` — scripts/migrate-indian-celebs.mjs only.
- Commit 2: `docs: correct migration record; add stale-deploy lesson` — docs/ARCHITECTURE-DECISIONS.md only.
- package.json / package-lock.json must NOT be staged in either.

## What to paste back
- After Step 3: the Step 1 grep, the full script, the exact run command. Then WAIT.
- After Step 4: frozen-blob findings, doc diff summary, build + full verify-print output, both commit hashes.
