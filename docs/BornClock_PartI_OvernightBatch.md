# BornClock — Part I: Overnight Batch — Matching Enhancement + New Features
## Single Claude Code session prompt. Designed to run unattended overnight.

---

## CONTEXT FOR CLAUDE CODE

This is a large, multi-hour overnight session covering 12 items across
Matching fixes/enhancements and new standalone features. The person
will review results in the morning, not during the run — so this
session must be MORE self-sufficient and MORE conservative about
scope-creep than prior sessions, since there's no one to ask mid-run.

**Two items were deliberately EXCLUDED from this batch and must NOT be
attempted**: Yoga/Nakshatra citations in the astrologer chat (needs
dedicated safety review the person does personally, like Part F's
crisis wording), and account-level profile sync (needs a Supabase
migration previously found unsafe to apply/verify from this
environment). Do not attempt either, even if you find a clean path to
do so partway through — they stay deferred for the person's direct
involvement, not because they're technically impossible tonight.

**The person does not read code.** Every result must come back in the
final summary as real, readable text/examples — real generated content,
real screenshots described, real numbers — not just "implemented."

### Standing requirements carried over from every prior session

- **Sequential parts, commit after each passes its own tests.** Do not wait until the end to commit. This is especially important for an unattended overnight run — if something goes wrong deep into the session, earlier completed work must already be safely committed.
- **Mimic-manual-testing phase** (exploratory, adversarial, honest self-critique) for the batch as a whole at the end, not just per-item.
- **Stop and flag, in writing, in a clearly-named file** (`docs/part-i-flags.md`) for anything that would normally warrant stopping to ask the person — since no one is available to answer overnight, document the issue clearly, make the most conservative reasonable choice, note it as needing review, and continue with the rest of the batch rather than stalling entirely on one blocked item.
- **Full regression suite run after the ENTIRE batch, not just per-item** — in addition to per-part testing, run everything together at the very end to catch any cross-item interaction issues.

---

## PHASE 0: MAP DEPENDENCIES BEFORE BUILDING ANYTHING

Before Part 1, spend time mapping what already exists across the whole
batch, and write findings to `docs/part-i-touchpoints.md`:

- The current Kundali Matching form's actual fields and code location.
- Whether PDF generation infrastructure already exists (birthday-report flow is the likely candidate) — its exact location and whether it's genuinely reusable for Matching/career reports, or whether reuse would require significant adaptation. If significant adaptation is needed, scope Part 2.6's PDF export to a SIMPLER first version (even a clean printable page/browser-print-to-PDF style output) rather than open-ended new PDF engineering — document this decision if made.
- Where existing Panchang infrastructure lives (needed for Part 9's Muhurat finder) and its exact output shape.
- Where the existing Sade Sati/Dhaiya computation lives within the engine (needed for Part 10) and confirm its exact output shape.
- Where the D-Fix3 timing-activation engine lives (needed for Part 2.5 and Part 12) and confirm it can be called for an arbitrary pair of house-lord/planet significators, not just the specific Yoga categories it was originally built for — if it can't be generalized cleanly, note this and scope Part 2.5/Part 12's timing features to what's actually reusable rather than forcing a fit.

If this reveals significantly more integration complexity than expected
anywhere, note it in `docs/part-i-flags.md` per the standing "stop and
flag in writing, then continue" rule below, and adjust that specific
part's scope down to something achievable rather than abandoning it
silently or overrunning on it.

---

## PRIORITY ORDER IF TIME RUNS SHORT

This is a large batch. If the full set cannot reasonably complete by
morning, protect items in this order (do not sacrifice an earlier item
to attempt a later one):

1. Part 1 (urgent Matching bug fix) — highest priority, always complete this
2. Parts 2-7 (Matching depth) — the paid-feature centerpiece of this batch
3. Part 21 (small cleanup) — quick, low-risk, worth finishing
4. Part 10 (Sade Sati standalone) — smallest new-feature build, high confidence (pure reuse of validated data)
5. Part 18 (progressive disclosure) — UI-only, contained risk
6. Part 9 (Muhurat finder) — larger new build
7. Part 12 (career report) — larger, depends on Part 2.5's timing-generalization work
8. Part 11 (gemstones) — explicitly the most contested/lowest-confidence item; acceptable to defer entirely if time is short, document as deferred rather than rushed

Part 22 (documentation only, no code) should be done regardless of time,
since it costs almost nothing.

---

## RESOURCE/TIME SAFETY NET FOR THIS UNATTENDED RUN

If any single part is taking dramatically longer than its apparent
complexity warrants (e.g., stuck in a repeated failure loop, a search
or research step not converging, a test hanging) for an extended period:
stop attempting that specific part, document exactly what was tried and
why it didn't resolve in `docs/part-i-flags.md`, and move to the next
part per the priority order above. Do not let one stuck item consume
the remaining available time — a partially-complete batch with clean,
working, committed items is a far better morning outcome than a stalled
session stuck on one unresolved item all night.

---

## PART 1 (URGENT): FIX MISSING BIRTH TIME/PLACE IN KUNDALI MATCHING

This is a real accuracy bug. If Kundali Matching currently only collects
birth date (not time and place) for one or both people, it is silently
defaulting to some fixed time/location — producing wrong Lagna, houses,
and Nakshatra-boundary results for anyone not actually born at that
default. This directly contradicts the validated-accuracy standard the
entire engine was built to deliver.

1. Confirm the current Matching form's actual fields (map this before assuming).
2. Add full date + time + place collection for BOTH people if not already present.
3. Confirm the saved profile (Part E) correctly pre-fills the user's own details including time/place, and only prompts for the second person's full details.
4. Test: generate a match using two real, different birth times/places, and confirm the underlying chart calculations for BOTH people are genuinely distinct and correct (not defaulting) — verify against the already-validated engine's known-correct output for those exact inputs.

---

## PART 2-7: DEEPER MATCHING ANALYSIS (items 2-7 from the roadmap, treated as one connected feature build)

### 2.1 Full 8-Koota breakdown
Show each of the 8 Kootas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana,
Bhakoot, Nadi) individually: its score, maximum possible points, and a
plain-language explanation of what it measures — not just a single
total number. Research the exact point allocations and calculation
rules for each from multiple independent sources before implementing,
the same rigor as every calculation built this project (verify against
at least one worked example per Koota).

### 2.2 Dosha cancellation transparency
For Nadi Dosha and Gana Dosha specifically (the two most consequential,
per research), if a cancellation rule applies (e.g., Gana Dosha
cancelled when sign lords are friends), show the reasoning explicitly —
not just pass/fail. Research the real, standard cancellation rules
first; if genuine source disagreement exists, use the same "flag it
honestly" discipline as every prior contested-convention decision
tonight (Kaal Sarp, Neecha Bhanga, etc.) rather than silently picking one.

### 2.3 Nadi and Bhakoot emphasis
These are flagged by multiple independent sources as the two heaviest,
most consequential Kootas (often treated as near-disqualifying if
failed without cancellation). Give them clearly distinguished visual/
textual emphasis in the output rather than treating all 8 Kootas as
equally weighted in presentation.

### 2.4 Methodology disclosure
Add a brief, honest methodology note to the Matching results (mirroring
the credibility language already drafted earlier this project): name
the Lahiri ayanamsa, the Ashtakoota/Brihat Parashara Hora Shastra
classical basis, and — where real implementation variance exists across
different software (research confirmed this for Varna/Vashya
specifically) — a plain, honest note that mainstream convention is used.

### 2.5 Marriage-timing extension
Reuse the Dasha-activation-timing engine built in Part D-Fix3. Extend it
to the Matching context: identify favorable classical timing windows
(from EITHER person's chart, or ideally where both charts' favorable
windows overlap) for marriage specifically, using the same real,
computed date-range approach (never a bare guaranteed date) already
proven and tested in D-Fix3. This is a genuine differentiator — verify
research confirms no major competitor offers this within a matching
report specifically.

### 2.6 PDF export
Check whether PDF generation already exists elsewhere in the codebase
(the birthday-report flow likely has this) and reuse that
infrastructure rather than building new PDF logic from scratch. Export
should include the full 8-Koota breakdown, doshas with cancellation
notes, the methodology disclosure, and the timing-window analysis.

### Testing for Parts 2-7
- Verify each Koota's calculation against a real worked example from research.
- Test the full matching report end-to-end for at least 2 different real pairings (one with a high compatibility score, one with a lower score including at least one uncancelled dosha) — paste the actual full generated output for both so the person can read real examples.
- Extend the existing accuracy checker to cover Koota scores and cited dates in this context, same zero-tolerance standard as every other computed claim in this project.
- Playwright: screenshot the full Matching results page (including the new detailed breakdown) for both test pairings, confirm no layout breakage from the additional content, confirm the PDF export produces a real, readable file.

---

## PART 9: MUHURAT (AUSPICIOUS TIMING) FINDER

A standalone tool, following the existing site's page/routing
conventions (check how Kundali/Matching are structured as pages and
match that pattern). Research the real classical basis for Muhurat
selection (Panchang elements — Tithi, Nakshatra, Yoga, Karana, and
avoiding specific inauspicious combinations like Rahu Kalam) before
implementing. Given the site already has Panchang infrastructure
(confirmed in touchpoints from earlier sessions), reuse it rather than
rebuilding. Scope this to a genuinely useful first version — e.g.,
"find auspicious dates in the next N days/months for [common purpose:
starting a venture, travel, etc.]" — rather than the full breadth of
every classical Muhurat category, and document what's included vs.
deferred for a future expansion.

Test: generate Muhurat results for a real date range, verify against
independently-computed Panchang data (the same cross-checking discipline
as the rest of this project) for at least a few sample dates.

## PART 10: SADE SATI CALCULATOR — STANDALONE PAGE

The engine already computes Sade Sati/Dhaiya status (validated in
earlier sessions) as part of the full chart. Extract this into its own
standalone, shareable, discoverable page — following the same
"reuse validated engine output, build a focused UI around it" pattern
as every other standalone tool. Should show: current status (active/
not), which phase if active (Rising/Peak/Setting per the already-
validated logic), and real computed start/end dates for the current
and next Sade Sati cycle (reusing Dasha/transit calculation, not new
astronomy).

Test: verify against the reference chart and at least one chart
currently in an active Sade Sati phase (check if one exists in the
existing validated test-chart set), confirm dates match already-
validated output exactly.

## PART 11: GEMSTONE/REMEDY RECOMMENDATION FEATURE

Research the real, classical basis for gemstone recommendations
(typically tied to strengthening a weak-but-beneficial planet, or the
Lagna lord, per Shadbala — already computed and validated). This is
a genuinely more contested and commercially-sensitive area than most
of this project's calculations (real disagreement exists across
traditions on gemstone-planet mappings, and there are real, documented
concerns about gemstone-selling scams in the astrology industry more
broadly) — build this CAUTIOUSLY:
- Recommend based on Shadbala-weak-but-classically-beneficial placements, using the already-validated strength data.
- Frame recommendations as traditional/classical association, explicitly not medical or guaranteed-effect claims (same rigor as every other guardrail in this project).
- Do NOT build any purchase/sales flow or partner-linking in this session — informational only.
- If significant source disagreement is found on gemstone-planet mappings, flag it plainly in `docs/part-i-flags.md` rather than picking one silently, and consider this feature lower-confidence/more clearly caveated than the rest of the product's output.

## PART 12: DEEPER CAREER ANALYSIS REPORT (PAID FEATURE)

Extend the existing D-Fix2 decisive-analysis method and the Yoga/timing
engines specifically for career: 10th house + lord + Dasamsa (D10) +
career-relevant Yogas (Raj Yoga, Budha-Aditya, etc. from Part G) +
career-timing windows (from D-Fix3's method, extended to career
specifically) — combined into a longer, dedicated report (similar
depth/structure to the Matching enhancement in Parts 2-7), gated as a
paid feature the same way Matching's detailed breakdown is.

Test: generate the full career report for the reference chart and one
other, paste real output, verify against the accuracy checker.

---

## PART 18: READING PROGRESSIVE DISCLOSURE

The existing full reading (Snapshot + 5 life areas + Right Now + Doshas
+ Deeper layers) renders as one long block, flagged in Part H's honest
self-critique as "a wall of text on first view... not skimmable."
Redesign the presentation (not the underlying content/generation logic
— this is a UI/UX change only) to show the Snapshot + a collapsed/
summary view of each section by default, with a clear "read more" or
expand interaction per section. Preserve full content and all existing
accuracy/safety guarantees exactly as-is — this only changes how much
is visible without user interaction. Test: Playwright screenshot the
collapsed default view and the expanded view, confirm smooth interaction,
confirm no content was lost or altered.

## PART 21: SMALL CLEANUP — PLAYWRIGHT SUITE + WORKER IMPORT

- Re-verify whether the duplicate import in `functions/_worker.ts` still exists on whatever branch this session starts from (it may already be resolved per Part H's finding that stacked branches naturally fixed it) — fix only if genuinely still present, don't invent a no-op change.
- For the ~190 pre-existing Playwright failures: do NOT attempt to fix all of them in this session (that's a separate, larger cleanup effort). Instead, spend a bounded amount of time (document how long) on the SPECIFIC, already-diagnosed cookie-consent-banner issue (Part D/H's finding that it overlaps content site-wide) — if a single, clean, low-risk fix exists (e.g., a "dismiss cookie banner" step added to the shared Playwright test setup/fixture), apply it and re-run the suite to see how many of the 190 failures it resolves. If it's not a clean, quick fix, document why and leave the rest of the 190 for a dedicated future cleanup session — do not spend more than a bounded, reasonable portion of this session's time on this item.

## PART 22: DOCUMENT THE 3-QUESTION CHAT CAP DECISION POINT

This is a product decision for the person, not something to change
unilaterally. Simply ensure `docs/part-i-flags.md` includes a clear,
one-paragraph summary of the tradeoff already identified (tight for a
"try it" first impression vs. right for monetization) so it's visible
and ready for the person's decision, alongside the other flagged items.
No code change for this item in this session.

---

## FINAL: FULL BATCH REGRESSION + MIMIC-MANUAL-TESTING + SUMMARY

After all parts complete:
1. Run the complete full test suite (unit + Playwright) — confirm exact before/after counts, zero regressions across the ENTIRE batch, not just per-part.
2. Mimic-manual-testing phase for the batch as a whole: exploratory (try the new Matching depth, Muhurat, Sade Sati, and career report pages in an unplanned order), adversarial (malformed inputs across the new features), and an honest, unsoftened self-critique of the batch as a whole — does it feel like a coherent expansion of the product, or a pile of separately-bolted-on features? Say so plainly either way.
3. Produce `docs/part-i-flags.md` with every item that needed a judgment call made conservatively on the person's behalf (per the "stop and flag in writing" rule), including the gemstone-mapping disagreement if found, the chat-cap decision point, and anything else that came up.
4. Produce a final plain-language summary for the person covering: what was built, real examples/screenshots for each major new feature, the regression results, the self-critique, and a clear list of what's flagged for their review in the morning.

## WHAT NOT TO DO

- Do NOT build Yoga/Nakshatra chat citation or account sync — explicitly excluded, stays for the person's dedicated attention
- Do NOT build any gemstone purchase/sales flow
- Do NOT attempt to fix all 190 pre-existing Playwright failures — bounded attempt at the cookie-banner issue only, per Part 21
- Do NOT silently resolve genuine source disagreements (gemstone mappings, Koota calculation variants) — flag them in writing
- Do NOT skip committing after each part — this protects the whole night's work if something goes wrong partway through
- Do NOT report anything as done without pasting real, specific generated examples in the final summary
