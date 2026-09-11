# BornClock — Part H: Merge Full Stack + Complete Product Verification
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

Six sessions have been built and individually staging-verified, stacked
in this order: B (engine integration) → D (reading UX) → D-Fix
(specificity/accuracy) → D-Fix2 (decisive analysis) → E (saved profile +
nav) → F (AI astrologer + guardrails) → G (Yoga detection + meanings).
Each was tested on its own; **nobody has yet tested the fully combined
product as one coherent experience.**

**The person running this session does not read code.** All
verification must come back as real, readable descriptions — actual
page-by-page walkthroughs, actual screenshots described in plain
language — because the goal of this session is specifically to let
them use and evaluate the complete product themselves afterward.

### The goal of this session

1. Merge all six branches together cleanly (they're already stacked, so this should be straightforward, but verify — don't assume).
2. Deploy the fully merged result to staging.
3. Do a genuine, holistic, first-time-user walkthrough of the ENTIRE product — not re-testing each feature in isolation again, but checking that the pieces work together as one coherent journey.
4. Produce a clear, organized summary of exactly what exists and how to test it, so the person can compare it against competitor products and form their own opinion on what to improve next.

---

## PART 1: MERGE THE STACK

- Merge branches B → D → D-Fix → D-Fix2 → E → F → G in order into a single integration branch (do not merge to main/develop yet — this stays for review, same as every prior session).
- Resolve any merge conflicts carefully — if a conflict involves a genuine design decision (not just a mechanical text conflict), stop and flag it rather than resolving it silently, the same discipline as every previous session's Phase 0.
- **If the merge proves genuinely messy** (extensive conflicts, unclear how to reconcile two branches' changes to the same logic) rather than a few clean, mechanical conflicts: stop, do not force it through, and report back plainly what's tangled and why, rather than pushing through a merge that might silently drop or corrupt one branch's work. This is a real, higher-stakes operation than prior sessions' individual builds — treat it with proportional caution.
- Before merging, note the current staging deployment's state (e.g., which commit/branch is live) so there's a clear, documented way back to the last-known-good staging state if this session's merged result needs to be rolled back after deployment.
- Run the full existing test suite immediately after merging, before any further work — confirm the merge itself didn't break anything, using the same "compare against the known baseline, distinguish pre-existing unrelated failures from new ones" method established in Parts D/E/F/G.

---

## PART 1.5: TWO SMALL FIXES BEFORE THE FULL WALKTHROUGH

These are small, low-risk, and genuinely needed to test a truly complete
product — unlike the other pending items (chat Yoga citations, account
sync, the 190 pre-existing Playwright failures), which stay deferred as
their own separate, more substantial sessions for good reasons already
documented elsewhere.

### 1.5.1 Complete the navigation bar
Confirm every major feature (Kundali, Kundali Matching, Astrologer Chat,
Birthday Report if it has its own entry point) is clearly and
consistently represented in the site navigation. Part E added some
navigation as part of the saved-profile work — check what's there now
and complete anything missing so a user can actually discover and reach
every feature without needing a direct link. Match the existing design
system.

### 1.5.2 Fix the pre-existing duplicate import in functions/_worker.ts
This has been flagged as pre-existing and unrelated across multiple
prior sessions (~lines 21-24, duplicate kundali/vedicProfile imports).
Fix it now since this session is already touching related integration
code. Confirm the fix doesn't change any actual behavior (it should be
a pure cleanup) — re-run the relevant tests after the fix to confirm.

---

## PART 2: FULL PRODUCT SMOKE TEST — DOES EVERYTHING STILL WORK TOGETHER

This is different from re-running each part's own tests (do that too,
per Part 1). This is a genuine, fresh, whole-journey test:

1. **New user, full journey**: land on the Kundali page with no saved profile → enter birth details → tick save → generate → read the full reading (snapshot, life areas with Yoga citations, doshas, deeper layers) → open the advanced view (confirm Shadbala words in narrative, virupas in advanced view, Yogas listed with grades) → navigate to Kundali Matching (confirm own details pre-filled) → navigate to the astrologer chat (confirm it recognizes the saved profile) → have a real conversation → deliberately test the crisis and health guardrails once more in this fully-merged context (not because they should have changed, but because merging is exactly when unexpected interactions can appear).

2. **Returning user, second session**: simulate closing and reopening (or a fresh browser context with the same storage) → confirm the saved profile still loads correctly with all downstream features (reading, matching, chat) still finding it.

3. **Visual/layout check across the whole journey**: take screenshots at each major step and confirm nothing looks broken, overlapping, or inconsistent in styling now that multiple sessions' UI additions (saved-profile banner, longer Yoga-citing reading text, advanced view, chat interface) all coexist on the same pages.

4. **Cross-feature data consistency check**: generate a reading for a chart, note its stated Yogas/doshas, then check the same chart via the astrologer chat and confirm it doesn't contradict the reading (e.g., doesn't claim a different Dasha lord or dispute a dosha the reading stated) — since both now draw from the same underlying engine, but through different generation paths, this consistency isn't automatically guaranteed and is worth checking for real.

5. **Real-usage cost/rate-limit check**: the person testing this themselves will likely generate multiple readings and have several chat exchanges in one sitting — more intensive than any single automated test run. Confirm this realistic level of use doesn't trip Gemini API rate limits or produce unexpectedly high cost/latency. If there's a known safe usage ceiling before hitting a rate limit, state it plainly in the final product map (Part 4) so the person knows what to expect if they test heavily in one session.

---

## PART 3: MIMIC-MANUAL-TESTING PHASE (standing requirement)

- **Exploratory**: try the journey in a different order than the obvious one (e.g., start at the astrologer chat before ever visiting Kundali — confirm it prompts sensibly for missing birth details rather than breaking).
- **Adversarial**: try to break the combined product with unexpected actions — rapid repeated form submissions, navigating away mid-generation, using browser back/forward through the whole flow.
- **Honest self-critique**: after the walkthrough, critique the COMBINED product fresh, as if evaluating it as a competitor product for the first time — not re-confirming each individual feature works, but judging whether the whole thing feels coherent, polished, and comparable to a real commercial astrology app. Name anything that feels disjointed, inconsistent in tone/style between sections, or like separate features bolted together rather than one product.

---

## PART 4: PRODUCE A COMPLETE, ORGANIZED PRODUCT MAP FOR THE PERSON TO TEST THEMSELVES

This is the actual deliverable the person asked for — not just "it
works," but a clear guide they can use to explore and evaluate everything.

Produce a document (in the final chat summary, not just a file) covering:

- **A short "new visitor" narrative** — not just a checklist, but a brief, honest first-person-style account of what it's actually like to discover and use this product for the first time (what stands out, what feels smooth, what feels rough) — written to genuinely support competitive comparison, not to sell the product to the person reading it.
- **The direct staging link(s)** for every major page/feature (Kundali, Matching, Astrologer Chat).
- **A recommended test sequence** — the order that best shows off the complete product, from a first-time visitor's perspective.
- **A feature checklist** — a plain-language list of everything that currently exists and works (saved profile, decisive-but-bounded readings, Yoga detection with grading, dosha explanations, KP/divisional chart data available in advanced view, the AI chat with guardrails), organized so it's easy to compare feature-by-feature against a competitor product.
- **Known limitations to keep in mind while testing** — the things already honestly documented throughout this project (D60 being one of several traditions, Sthana Bala/Chesta Bala being approximate, the Kaal Sarp ~4% residual, the chat not yet citing Yogas, account sync being device-only for now) — so the person doesn't mistake a known, documented limitation for a new bug while testing.

---

## FINAL CHECKPOINT — PLAIN-LANGUAGE SUMMARY REQUIRED

- Confirmation the merge completed cleanly, or a clear description of any conflict that needed a decision
- Full test suite results post-merge: before/after counts, zero regressions confirmed
- The whole-journey walkthrough described in plain language, with real screenshots described
- The cross-feature consistency check result
- Anything found during the mimic-manual-testing phase, including the honest self-critique of the COMBINED product
- The complete product map / test guide for the person to use themselves
- What still needs a human's judgment (this is now the biggest, most consequential product review point in the whole project — flag this plainly)

## WHAT NOT TO DO

- Do not merge to main/develop — this stays on its own integration branch, staging only
- Do not build any NEW features beyond the two small fixes in Part 1.5 (nav completion, the _worker.ts cleanup) — no other new functionality in this session
- Do not silently resolve a genuine merge conflict that reflects a real design decision
- Use plain language throughout — the deliverable is specifically meant for the person to use directly
