# BornClock — Part AK: Deep-Tool Page Redesign, DOB Carry-Forward, Inline Teaser, Color Fix
## Continues directly on the Part AJ branch (not develop, not a new branch). No merge, no deploy — build, test, commit, update the preview, and report. Time-boxed to roughly 2 hours — work in strict priority order so whatever's done when time runs out is clean and complete, not half-finished.

---

## CONTEXT — READ FULLY BEFORE STARTING

Last night's Part AJ redesigned the four category hub pages (Vedic, Birthday,
Mystic — Science deferred). Reviewing the live preview surfaced a real,
larger problem: **the hub pages link out to many deeper tool/report pages
that were never redesigned** — confirmed example: `/vedic-astrology`'s "See
your full chart" flow lands on `/kundali`, which still has the old design
(not edge-to-edge, old colors, inconsistent with everything built this week).
This is very likely not an isolated case — it needs a real audit, not an
assumption that `/kundali` is the only one.

**Also confirmed, two smaller but real bugs:**
1. The background color on the three redesigned hub pages may not actually
   match the reference tokens — reference files use a warm ivory `#FAF7F0`
   as the dominant canvas color; the live build reads as closer to plain
   white. Verify the actual CSS against the reference files and fix any drift.
2. Users are asked for their birth details on `/vedic-astrology`, then asked
   again on `/kundali` — no DOB carry-forward exists. This needs fixing using
   the same pattern already proven on Birthday (`?dob=` deep-link), plus a
   fuller fix for logged-in users with a saved profile.

**Step 0 — critical, do not get this wrong:** this work continues on the
**existing `part-aj-four-page-redesign` branch** — do NOT create a new
branch, and do NOT branch from `develop`. Part AJ's work (and the base-branch
situation from FLAG 1, where `develop` is missing Parts AH/AI) is still
unmerged and awaiting the person's review from the previous session. Continue
committing on the same branch so all of this stays together as one reviewable
unit. **Do not merge anything, and do not run a real `wrangler deploy`,
under any circumstance in this session** — this is additive build work only,
ending in an updated preview, same as before.

**Time-box:** the person is away for roughly 2 hours. Work through the tiers
below in strict priority order. If time runs out partway through Tier 2,
stop cleanly after whatever page you're currently working on is fully
tested and committed — never leave a page half-redesigned or half-tested.
Report exactly where you stopped and what's left.

---

## PART 0: Audit (do this first, before fixing anything)

From all four category hub pages (`/vedic-astrology`, `/celebrity-birthday`,
`/mystic-corner`, `/life-expectancy`), trace every real link to a deeper
tool/report page. For each one found, check: does it use the new design
system (edge-to-edge density, the finalized color tokens, Fraunces/Public
Sans) or the old site design? Produce a clear list, e.g.:

```
Vedic Astrology hub links to:
- /kundali — OLD DESIGN
- /kundali-match — OLD DESIGN
- /sade-sati — OLD DESIGN
- /muhurat — OLD DESIGN
- /career-report — OLD DESIGN
- /gemstones — OLD DESIGN
- /rashi-ratna — OLD DESIGN
- /sun-vs-moon-sign — OLD DESIGN
- (any others found)
Mystic Corner hub links to:
- (list whatever is found)
```

Do not assume the list above is complete or correct — it's a starting
expectation based on prior sessions' work, not a confirmed inventory. Use
your real audit results to build the priority order for Part 2 below.

Write this audit to `docs/part-ak-audit.md` before proceeding.

---

## TIER 1 — do these fully, in order, before anything else (non-negotiable)

### 1. Fix the background color token drift
Compare the live CSS actually shipped for Vedic, Birthday, and Mystic against
the real token values in `docs/design-reference/*.html` (`--bg: #FAF7F0` for
the warm ivory canvas, `#FFFFFF` only for alternating/surface sections, not
the dominant background). Find and fix wherever the implementation diverged
from this. Verify visually on the preview afterward — the pages should read
as warm ivory, not plain white, matching the reference files.

### 2. Build the birth-details carry-forward mechanism

**Important — this is NOT identical to Birthday's case.** Birthday's
`?dob=` pattern only needs a date. A real Kundli needs **date, time, AND
place of birth** — all three, since Dasha/Lagna accuracy depends on exact
birth time and place, not just date. Reuse the same *pattern* (URL
parameters, not a new mechanism) but extend it to carry all three fields
`/kundali?dob=...&time=...&place=...` (or equivalent) — carrying only the
date and still asking the user to re-enter time and place would not actually
fix the problem you flagged; it would just move where the re-entry happens.

Apply this so `/vedic-astrology`'s hero form passes all three fields forward
to `/kundali` (and, as you redesign further pages in Tier 2, to those as
well) without the user re-entering anything in the same session.

**Additionally, for logged-in users with a saved profile:** if the user is
authenticated and has a saved birth profile (the existing saved-profile
infrastructure from earlier work), skip asking for birth details entirely —
go straight to their chart. This is the fuller, better version of the fix;
build both, don't settle for just the URL-parameter version if the saved-
profile infrastructure is reasonably reachable.

**Precedence rule for a real conflict case:** if a logged-in user has a saved
profile AND has just typed different details into the hero form in this
session, the freshly-entered form data must win — never silently show a
chart for stale saved data when the user just deliberately typed something
different. Only fall back to the saved profile when nothing was freshly
entered this session.

### 3. Add the inline teaser section to `/vedic-astrology`
After the hero form is submitted, show a light, real preview directly on the
landing page — Lagna, Rashi, Nakshatra, and one genuinely computed headline
fact (reuse the real engine output, not placeholder data) — with a clear
"See your full chart →" button leading into the now-redesigned `/kundali`.
This should feel like the free, instant payoff Birthday's page already gives,
not a dead-end form.

### 4. Redesign `/kundali` to the new design system
Full edge-to-edge density, the correct ivory/navy/gold tokens (post-fix from
step 1), Fraunces/Public Sans — matching the reference file's visual
language. Carry forward every real piece of existing functionality on this
page (the full chart display, Dasha, Yoga detection, doshas, remedies, the
glossary/tooltip mechanism, Pratyantardasha, the Yoga-grade legend) — this is
a visual redesign of an existing real page, not a rebuild from scratch. Wire
it to receive the DOB carry-forward from step 2.

**Test Tier 1 completely — full suite, manual click-through of the real
flow (enter details on `/vedic-astrology` → see the inline teaser → click
through to `/kundali` with no re-entry required → see the full real chart in
the new design), mobile check, before moving to Tier 2.**

**Also explicitly test these edge cases, not just the happy path:**
- A direct visit to `/kundali` with no carried-forward data at all (not
  logged in, no URL parameters, user typed the URL directly) — confirm its
  own standalone form still works correctly and isn't broken by this change.
- The precedence conflict case above (saved profile exists, but different
  details were just typed this session) — confirm the freshly-typed data wins.
- An unknown/missing birth time — confirm the carry-forward and the chart
  page both handle this gracefully (a real, common case for this product),
  not just the case where all three fields are present.

---

## TIER 2 — work through the audited list in priority order, as time allows

Using Part 0's real audit results, redesign the remaining old-design tool
pages to the new system, applying the same DOB carry-forward pattern where
each page needs birth details. Prioritize by likely real-world importance —
Kundali Matching and Sade Sati are reasonable first guesses given they're
core, frequently-linked Vedic tools, but **let the actual audit traffic/
linking patterns guide the real order, not this assumption alone.**

For each page in this tier: full redesign to the new system, carry forward
all real existing functionality (don't drop anything), wire DOB carry-forward
if applicable, full test suite, manual click-through, mobile check, commit
individually — before moving to the next page in the list.

**If time runs out mid-tier:** stop after the current page is fully done and
committed. Do not leave a page partially redesigned.

---

## RESOURCE SAFETY NET

If any single page in Tier 2 turns out to be significantly more complex than
expected (e.g., has its own complicated state/paywall logic the way Science
did), flag it in `docs/part-ak-flags.md` and move to the next page in
priority order rather than getting stuck. Note it clearly in the final report
as deferred, the same way Science's full rebuild was deferred last night.

---

## HANDLING BUILD/DEPLOY COMMAND FLAKINESS
If a build, test, or deploy command fails or appears to hang, retry up to 3
times before treating it as a genuine failure, and check for known-harmless
patterns (like the cron exit-code-1 case from earlier sessions) before
concluding it's real.

## INCREMENTAL PROGRESS LOGGING
Append a status update to `docs/part-ak-progress.md` after each major
checkpoint (audit complete, each Tier 1 item complete, each Tier 2 page
complete) — so partial progress is visible even if the session is
interrupted before finishing everything.

---

## TESTING REQUIREMENTS (apply to every page touched)
- Full existing test suite passes before and after each page.
- Manually verify the real DOB carry-forward flow end-to-end with a real
  test case — confirm no re-entry is required.
- Confirm all real existing functionality on each redesigned page still
  works (don't just check it visually matches the new design — confirm the
  actual computations/features are intact).
- Mobile check for every page touched — edge-to-edge density holds, nothing
  overflows.
- Confirm the color token fix (Tier 1, item 1) is visually correct on the
  preview, not just correct in code.

---

## FINAL REPORT
Write to `docs/part-ak-report.md` and include in full in your final message:
the complete Part 0 audit results, confirmation of all four Tier 1 fixes with
real before/after evidence, the list of Tier 2 pages completed (with the same
evidence) and any deferred/flagged, real test results at every checkpoint,
and the updated preview URL. State clearly that nothing was merged or
deployed — this stacks on top of last night's still-pending Part AJ review.

---

## WHAT NOT TO DO
- Do not create a new branch or branch off `develop` — continue on
  `part-aj-four-page-redesign`.
- Do not merge anything or run a real `wrangler deploy` — this session ends
  at an updated preview, same as last night.
- Do not drop any existing real functionality while redesigning a page.
- Do not leave a page half-redesigned when time runs out — stop cleanly
  after the current page is fully done.
- Do not invent a new DOB-passing mechanism — reuse Birthday's proven
  `?dob=` pattern.
- Do not resolve or act on last night's three open flags (FLAG 1/2/3) —
  those are still awaiting the person's explicit review separately.
