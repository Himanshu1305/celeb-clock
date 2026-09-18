# Part V — Flags

## Positioning-statement doc: NOT FOUND (Phase 0.3)
Searched `docs/` for filenames containing "positioning" and grepped for "positioning
statement"/"positioning:". Only matches are the Part U/V prompt files and
BATCH-5-PROMPT.md using the word in passing — no dedicated positioning document exists.
Per Part V's instruction, NOT silently skipped: using the Part 3 fallback language for
the new Vedic block's verification note, and keeping the project's established honest
framing (astrology = "precisely computed" / "classically grounded", NEVER "scientific").

## Hard rule
Link-preservation diff produced at end (before/after). No section removed; content
regrouped only.

## Deploy + regression (Part V)
- Deployed to STAGING only (wrangler deploy succeeded on attempt 1; only the KNOWN cron
  /schedules trigger failed — harmless, pre-existing, docs/part-p-flags.md). Verified live:
  new copy present, nav + choose-your-path order = Vedic→Birthday→Mystic→Science, staging
  bundle == local build. Production untouched.
- Full staging regression: 792 passed / 23 unexpected / 2 flaky / 31 skipped.
  The 23 = 16 environmental local-only + 7 pre-existing content drift — IDENTICAL to the
  Part T/U baseline. ZERO unexpected regressions, ZERO nav-coupled failures (the Part U
  nav-test updates + new order tests all pass on live staging).
- Full-page staging screenshots (desktop + 3 breakpoints, 0px overflow, sourcing line
  visible at all): docs/part-v-screens/staging/.
