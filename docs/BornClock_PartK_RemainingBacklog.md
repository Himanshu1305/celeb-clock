# BornClock — Part K: Remaining Engineering Backlog
## Single Claude Code session prompt. Six sequential items, separate commits.

---

## CONTEXT FOR CLAUDE CODE

This covers seven remaining backlog items, all low-to-moderate risk, done
in sequence with a separate commit after each passes its own tests.
Standing requirements from every prior session apply throughout:
Phase 0 dependency mapping per item where relevant, full positive/
negative/edge testing, Playwright where UI is touched, mimic-manual-
testing phase at the end, full regression suite at the end, stop and
flag genuine scope surprises in writing rather than guessing silently.

**The person does not read code.** Final summary must contain real,
readable examples — not just "implemented."

Do these in order. Commit after each passes its own tests before
starting the next.

---

## ITEM 1 (of this session): AGE CALCULATOR PROGRESSIVE-PROFILE INTEGRATION

Part J built and tested the progressive-profile mechanism (partial vs.
full profiles, `isFullVedicProfile()`, `mergeProfile()`) but deferred
wiring it into the Age Calculator specifically, since that page uses a
separate, pre-existing `BirthDateContext` mechanism unrelated to the
Vedic cluster, and touching it was flagged as higher-risk.

1. Re-examine `BirthDateContext` now, carefully. Confirm exactly how it currently stores/reads a birth date and whether it can be non-invasively bridged to the progressive-profile mechanism (e.g., the Age Calculator offers to use a saved Vedic-cluster date if one exists, and/or offers to save its own date-only entry into the shared profile) WITHOUT modifying `BirthDateContext`'s own internal behavior for its existing use case.
2. If a clean, additive bridge is genuinely achievable without risk to the Age Calculator's existing behavior, build it. If real risk remains even on closer inspection, do NOT force it — document exactly why in `docs/part-k-flags.md` and move to Item 2. This is explicitly allowed to stay deferred a second time if it's genuinely not safe; do not compromise the working Age Calculator to force this integration.
3. If built: test that the Age Calculator's existing behavior is completely unchanged for a user with no saved profile (regression protection for existing functionality), AND that a user with a saved Vedic profile is offered (not forced) to reuse the date, AND that a user completing the Age Calculator is offered to contribute their date to the shared profile if none exists yet.

---

## ITEM 2: METHODOLOGY-TRANSPARENCY PASS — SADE SATI, MUHURAT, CAREER REPORT

Bring these three pages up to the same "show your work" standard already
built for readings, Matching, and gemstones (Part D-Fix2's evidence-
based reasoning pattern, Part J's methodology-note pattern).

1. **Sade Sati page**: add a brief note on what was computed to determine the current phase and dates — which planet's transit, relative to which natal placement, using which classical rule (Rising/Peak/Setting from Moon sign).
2. **Muhurat finder**: add a brief note on which Panchang elements were checked (Tithi, Nakshatra, Yoga, Karana, Rahu Kalam) for each suggested date, so the user sees the real basis, not just a suggested date out of nowhere.
3. **Career report**: add a brief note on which specific chart elements were used (10th house + lord placement, Dasamsa, relevant Yogas, timing windows) — mirroring the gemstone page's "we considered..." structure.

Each note must be generated from the REAL computed data for that specific chart/date (same zero-tolerance accuracy standard as every other generated claim in this project) — not generic template text. Apply the same "plain language, not jargon-dense" self-critique discipline Part J applied to the gemstone note — read each note fresh as a non-astrologer would, and revise if it reads as jargon-dropping rather than confidence-building.

Test: generate each note for at least 2 different real charts/dates per page, confirm accuracy-checked, confirm Playwright screenshot shows clean rendering.

---

## ITEM 3: MINOR CONSISTENCY — CHAT GEMSTONE ANSWERS

Currently, if a user explicitly asks the astrologer chat for a
Moon-sign-based gemstone, it gives the classical Rashi association
(caveated) rather than pointing to the Lagna-based method used on the
dedicated gemstone page. Resolve this inconsistency: when the chat
discusses gemstones, it should default to citing the same Lagna-based
methodology as the dedicated page (reusing that computed result rather
than a separate calculation), while still being able to explain the
Rashi-based alternative if a user specifically asks about it or asks
why they differ — informative, not just silently overriding what the
user asked. Test both the default case and the explicit "what about my
moon sign stone" follow-up case, paste real transcripts.

---

## ITEM 4: ACCOUNT-LEVEL PROFILE SYNC — RE-EXAMINE THE MIGRATION BLOCKER

This has been deferred multiple times because a Supabase migration
could not be reliably applied/verified from this environment.
Re-examine this specifically rather than assuming the same conclusion:

1. Check current tooling/access — has anything changed that would allow a migration to be applied AND verified reliably now (e.g., a way to run a migration and immediately query the result to confirm it succeeded, rather than just running it and hoping)?
2. If a reliable verification path genuinely exists now: add the birth-profile column(s) to the relevant table, verify the change is actually present (query it back, don't just assume success), then wire the existing progressive-profile mechanism to sync to the account for logged-in users, falling back to device-only storage for anonymous users exactly as it works today.
3. If NO reliable verification path exists (the same fundamental blocker as before): do NOT attempt the migration. Document clearly in `docs/part-k-flags.md` exactly what would be needed to unblock this (e.g., "the person needs to add this specific column via the Supabase dashboard directly, then this session's already-written sync code can be enabled") so it's a concrete, ready-to-execute task for whenever the person does it themselves, rather than a vague "someday" item.
4. Either way: the sync CODE (reading/writing to an account-level field, falling back gracefully if the field doesn't exist) can be written and tested now using a mocked/simulated version of the expected schema, so that if the person adds the real column later, minimal further work is needed. Be explicit in the summary about what's real/tested vs. what's prepared-but-unverified-against-a-real-column.

---

## ITEM 5: PLAYWRIGHT SUITE CLEANUP — BOUNDED CONTINUATION

Part I fixed the site-wide cookie-consent-banner issue via a
`storageState` baseline, resolving some of the ~190 pre-existing
failures. Continue this cleanup with a similarly bounded, evidence-based
approach:

1. Re-run the full existing Playwright suite now and get a fresh, current failure count and categorization (some may have already resolved from Part I's fix or subsequent work — don't assume the old 190 number is still accurate).
2. Categorize remaining failures by root cause (stale selectors, genuine remote-flakiness/timeouts, the two special test-folder config issues identified in earlier sessions, anything else).
3. Fix the categories that have a clean, mechanical, low-risk solution (e.g., updating a stale selector to match a genuinely-changed page element) — do this for as many as can be resolved with real confidence in a bounded, reasonable amount of time.
4. For failures that would require deeper investigation or judgment calls (e.g., genuinely ambiguous whether an old test's expected behavior is still correct), do NOT guess — document them clearly in `docs/part-k-flags.md` as needing human review, with the specific test name and why it's ambiguous.
5. Report a clear before/after count with the same rigor as every other regression check in this project.

---

## ITEM 6: UNIFIED PROFILE — REMAINING SITE-WIDE EXTENSION

Part J wired the progressive profile into the Vedic cluster (Kundali,
Matching, Astrologer, Sade Sati, Muhurat, Career Report, Gemstones).
Item 1 above addresses the Age Calculator specifically. This item
covers whatever's left:

1. Confirm via Phase-0-style mapping: is the Birthday Report flow (mentioned throughout this project as a distinct, older flow) currently integrated with the saved profile, or does it still require full re-entry? If not integrated, apply the same progressive-profile pattern (offer to reuse a saved date/full profile, offer to save/extend after entry) — respecting the same opt-in consent model, same as every other integration.
2. Check for any other birth-date-collecting page found in Phase 0 mapping across this entire project (Part E's original list, Part I's new tools, anything else) that hasn't yet been integrated, and apply the same pattern.
3. If any page has a structural reason it genuinely shouldn't participate in the shared profile (e.g., it's specifically designed to check a DIFFERENT person's chart every time, like Baby Names was correctly excluded in Part E), confirm and document that reasoning explicitly rather than silently skipping it.

Test: for each newly-integrated page, the same positive/negative/edge
suite as Part J's original three integrations (offers reuse, prompts
only for missing pieces, respects consent, handles corrupted data
gracefully).

---

## ITEM 7: CONSOLIDATE TOUCHPOINT DOCUMENTATION INTO ONE CURRENT MAP

Multiple prior sessions each wrote their own touchpoint file
(`docs/vedic-integration-touchpoints.md` from Part B, plus separate
files from Parts E, G, H, I, J). These are now scattered and some may
be outdated relative to the current, actual state of the codebase after
all the work done since.

1. Read through all existing touchpoint/mapping docs across the project.
2. Cross-check each against the actual current codebase — confirm what's still accurate, what's changed since it was written, what's now redundant.
3. Produce ONE consolidated, current `docs/vedic-integration-touchpoints.md` (or a clearly-named replacement) that accurately reflects: every page/feature that touches birth-chart data, every place the saved profile is integrated (per Item 6's findings), the current shape of the engine's key functions, and pointers to where the deeper technical details live if needed.
4. Do not delete the old per-session files outright — either archive them (e.g., move to a `docs/archive/` folder) or clearly mark them as superseded, so the history isn't lost, but a future session's Phase 0 can rely on one current, trustworthy map instead of piecing together several possibly-stale ones.
5. This is documentation only — no code changes, no tests required beyond confirming the doc's claims are accurate against a quick spot-check of the actual code.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement, for the batch as a whole)

- Exploratory: navigate across all newly-touched pages in an unplanned order, confirm the profile behaves consistently everywhere.
- Adversarial: try corrupting the profile mid-flow on each newly-integrated page; try triggering the Age Calculator bridge (if built) with edge-case dates.
- Honest self-critique: read the new methodology notes (Item 2) fresh as a non-astrologer, and review the overall site-wide profile experience end-to-end — does it now feel genuinely coherent and consistent across every tool, or are there remaining rough edges? Name them plainly if so.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite (unit + Playwright) after all seven items.
Confirm exact before/after counts, zero regressions. Final plain-
language summary covering: what was built for each item (with real
examples — actual methodology notes, actual chat transcripts, actual
before/after Playwright counts), what was deferred and why (Age
Calculator and/or account sync, if either remains blocked), and
everything in `docs/part-k-flags.md` for the person's review.

Before finalizing, cross-check the final summary against Item 7's newly
consolidated touchpoint map — they should describe the same, consistent
current state. If anything differs (e.g., the summary mentions a page
as integrated that the consolidated map doesn't reflect, or vice versa),
resolve the inconsistency by updating whichever is stale, rather than
leaving two documents that disagree with each other.

## WHAT NOT TO DO

- Do not force the Age Calculator integration or the account-sync migration if genuine risk/blockers remain — document and defer cleanly instead, per each item's explicit instructions
- Do not silently change the opt-in, device-only consent model while extending profile coverage
- Do not attempt to fix Playwright failures that need real human judgment — document them instead
- Do not report any item as done without pasting real, specific examples
- Do not merge or deploy without being asked
