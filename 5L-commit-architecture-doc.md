# Prompt 5-L — Commit the architecture decisions document
DO NOT ask for approval.

The user will place a file named ARCHITECTURE-DECISIONS.md alongside this prompt (it was authored outside Claude Code, from full session context — the reasoning in it is authoritative; do not rewrite it).

## Step 1 — Place it

Copy the provided ARCHITECTURE-DECISIONS.md to `docs/ARCHITECTURE-DECISIONS.md` (create the docs/ directory if it doesn't exist).

## Step 2 — Fact-check ONLY the verifiable anchors (do not touch the reasoning)

Verify against the repo and fix in place if wrong:

```bash
# 1. Commit hashes and messages match
git log --oneline -20

# 2. File paths referenced exist
ls scripts/verify-print.mjs scripts/migrate-indian-celebs.mjs src/data/indianCelebrities.ts src/components/CelebrityCard.tsx src/services/WikipediaImageService.ts 2>&1

# 3. IndianCelebrityService.ts is really deleted
ls src/services/IndianCelebrityService.ts 2>&1   # should error

# 4. The open-item questions that a grep can answer NOW — answer them and update the doc's §8:
#    a. CelebrityMatch data source:
grep -n "supabase\|birthdays/\|birthdayData\|celebrity_sitelinks" src/pages/CelebrityMatch.tsx src/components/CelebrityMatch.tsx 2>/dev/null | head -10
#    b. TodaysBirthdays country-gate mechanism:
grep -n "country\|locale\|geo\|IN'" src/pages/TodaysBirthdays.tsx | head -10
#    c. The Indian tag in the print card — emoji flag or text?
grep -n "🇮🇳\|Indian" src/pages/ReportView.tsx | head -5
```

For 4a/4b/4c: replace the corresponding "confirm X" open items in §8 with the actual answer (one line each, keep the item if follow-up work remains). This is the only content editing permitted — converting open questions the code can answer into answers.

## Step 3 — Commit

Stage docs/ARCHITECTURE-DECISIONS.md ONLY. package.json/package-lock.json NOT staged.

Commit: `docs: architecture decisions and maintenance log (sessions 1-5)`

## What to paste back
1. Results of the fact-checks (any corrections made)
2. The answers to 4a/4b/4c and how §8 was updated
3. Commit hash
