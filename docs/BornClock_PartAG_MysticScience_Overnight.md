# BornClock — Part AG: Mystic Corner + Science & Longevity, Overnight, End-to-End
## Single Claude Code session. Build both pages, verify, merge, and deploy for real — unattended, no pause for approval. Runs overnight; person is asleep.

---

## CONTEXT FOR CLAUDE CODE — read this whole section before starting

This is an explicit, deliberate exception to the usual "stop and wait for
go-ahead before deploying" rule. The person has explicitly authorized a full,
unattended run through to a real production deploy tonight, because they will be
asleep and want both remaining category pages live by morning. **This
authorization covers deploying `develop` to production once everything below is
verified — it does not cover skipping verification.** The floor that stays in
place: never deploy something you couldn't actually verify is correct. If a
specific piece fails verification, that piece gets held back and documented —
the rest proceeds.

**Step 0 — before starting:** confirm `develop`'s current HEAD is at or past
`e7e1c7d` (includes the merged Vedic Astrology and Birthday & Celebrity pages).
If it's behind that, stop and write this to `docs/part-ag-flags.md` rather than
guessing — do not proceed on an unexpected base.

**Branch:** create `part-ag-mystic-science-pages` off `develop` HEAD.

**On not fabricating anything, especially tonight:** both design briefs below
explicitly require verifying that certain pages/features exist before linking to
them (Tarot, a compatibility calculator, Biological Age, a longevity quiz).
Tonight, with no one to ask, the rule is simple: **if you can't confirm
something is real, leave it out — do not include it, do not guess, do not
invent placeholder content.** A shorter, fully-honest page beats a fuller page
with anything fabricated in it. This applies with full force to any "real
example" section in either brief — those values must be genuinely verified
correct, not estimated, given no one is awake to catch an error tonight.

---

## PART 1: Mystic Corner (`/mystic-corner`)

Read the full brief at `docs/BornClock_MysticCorner_PageDesign.md` and build to
that spec in full, including:
- New dedicated `/mystic-corner` hub page (not repurposing `/numerology`).
- Verify which of Numerology, Western Zodiac, Chinese Zodiac, Tarot, and a
  compatibility calculator actually exist as real pages before writing any
  linking copy — only include confirmed-real ones. Document what's missing in
  your final report as a future opportunity, don't fabricate it.
- Hero deep-links into the real numerology flow (check for an existing `?dob=`
  or equivalent deep-link pattern, matching how `/birthday-report` and the
  Birthday & Celebrity page already do this) — do not duplicate calculation
  logic on the hub page itself.
- Update the homepage's "Mystic" card to point to `/mystic-corner` instead of
  `/numerology`.
- §5's real example must be a genuinely verified, correctly-computed fact.
- Confirm what monetized product actually applies to the final CTA before
  writing it — verify, don't assume a numerology-specific product exists.

### Testing for Part 1
- Verify every link resolves to a real page, direct-load the page fresh to
  confirm it's not a soft-404, check mobile responsiveness.
- Full test suite passes.

---

## PART 2: Science & Longevity (`/life-expectancy` enhancement)

Read the full brief at `docs/BornClock_ScienceLongevity_PageDesign.md` and build
to that spec in full, including:
- Enhance the **existing** `/life-expectancy` page — do not build a new hub.
- Verify Biological Age and any longevity quiz actually exist as real
  pages/features before including them — same no-fabrication rule as Part 1.
- The medical/YMYL disclaimer section is mandatory, not optional.
- Keep this page genuinely shorter than Mystic Corner and the other two
  category pages — this matches the deliberate lower-effort allocation for this
  vertical, it is not something to "fix" by padding it out.
- No aggressive monetization funnel — at most one soft cross-link line to Vedic
  Astrology or Birthday content.

### Testing for Part 2
- Same verification discipline as Part 1: every link real and resolving, direct
  URL load check, mobile responsiveness, full test suite.

---

## PART 3: Consolidate, verify, and deploy for real

1. After both pages are built and individually tested on the
   `part-ag-mystic-science-pages` branch, run the full test suite once more for
   the combined branch and confirm green.
2. Use `wrangler versions upload` for an isolated preview and verify BOTH pages
   on it: every link, both direct-URL loads, both pages' mobile behavior, and
   the homepage Mystic card's new destination.
3. **Only if everything above verifies cleanly:** merge
   `part-ag-mystic-science-pages` into `develop`, run the full suite once more
   post-merge, then build and run a real `wrangler deploy` to production. This
   is the explicitly pre-authorized real deploy — proceed with it once, and
   only once, verification is clean.
4. After deploying, verify directly on live `bornclock.com` (not the preview):
   both pages load correctly with real content, the homepage Mystic card
   navigates to `/mystic-corner`, and the `/life-expectancy` enhancements are
   live. Use real evidence (actual page loads, actual rendered content) — the
   same discipline used for every prior page this week, not just a bundle-hash
   check.

### If something can't be cleanly verified
If either page (or a specific section within one) fails verification and you
cannot resolve it confidently on your own — a real merge conflict, a broken
link with no sensible real destination, a calculation you can't confirm is
correct — **do not deploy that piece.**

**Important technical note on what "holding back" actually means:** a single
Cloudflare Worker deploy ships one bundle — there is no way to partially deploy
"page A but not page B" from one build. So if Mystic Corner verifies cleanly but
Science & Longevity doesn't (or vice versa), the correct way to hold the failed
one back is to **exclude its route from this deploy entirely** — comment out or
remove its route registration so it isn't reachable (returns a clean 404 or
falls through to an existing page, not a broken half-built page), rebuild, and
deploy only the verified page live. Do not attempt to ship a page you know has
an unverified or broken section just because "most of it works."

Document exactly what's uncertain and why in `docs/part-ag-flags.md`, and
proceed with whatever did verify cleanly. It is far better to wake up to "one
page is live, one was excluded and needs a decision from you" than to a broken
page live on production with no one awake to notice.

## HANDLING BUILD/DEPLOY COMMAND FLAKINESS

This exact project has already hit background build/wait commands failing
transiently twice this week (an exit-code-144 timeout during a build, and a
harmless exit-code-1 from an unrelated cron trigger during a deploy). Overnight,
with no one to notice a stuck step and re-trigger it, apply this rule: if a
build, test, or deploy command fails or appears to hang, **retry it up to 3
times** before treating it as a genuine failure. If it's still failing after 3
attempts, check whether the failure is a known-harmless pattern (like the cron
exit-code-1 case) before concluding it's real. If it's a genuine, unresolved
failure after retries, stop that specific part, document it clearly in
`docs/part-ag-flags.md` with what was tried, and move on to whatever can still
proceed — don't let one stuck command silently end the entire overnight run.

## INCREMENTAL PROGRESS LOGGING

Don't wait until the very end to write the report. Append a status update to
`docs/part-ag-morning-report.md` immediately after each major checkpoint
(Step 0 confirmed, Part 1 built, Part 1 tested, Part 2 built, Part 2 tested,
merge complete, preview verified, real deploy complete, live verification
complete) — so if this session is interrupted for any reason before finishing,
there is still real partial progress visible in the morning instead of nothing.

---

 (write this to `docs/part-ag-morning-report.md` AND include it
## in your final message, since the person will read this first thing tomorrow)

Must include, in plain language:
- Step 0 confirmation.
- What was verified real vs. left out as unconfirmed, for both pages.
- The exact real example data used for each page's §5, and where it came from.
- Full link list for both pages with real resolution confirmation.
- Test suite results at each checkpoint (before Part 1, after Part 1, after
  Part 2, after merge, after deploy).
- Whether the real production deploy happened, and if so, the live evidence
  confirming both pages actually work on bornclock.com.
- If anything was held back per the "can't verify" rule above: exactly what,
  why, and what the person needs to decide when they wake up.
- The final `develop` commit hash and the live production bundle identifier.

---

## WHAT NOT TO DO
- Do not fabricate any linked page, feature, or "real example" fact — leave it
  out and document it instead.
- Do not deploy a page or section that failed verification — hold it back per
  the process above.
- Do not touch `main` — this workflow only involves `develop` and production
  via the worker deploy, as established all week.
- Do not skip the pre-deploy preview verification step, even though the final
  deploy itself is pre-authorized — verification is not the part being skipped
  tonight, only the manual pause between verification and deploy.
