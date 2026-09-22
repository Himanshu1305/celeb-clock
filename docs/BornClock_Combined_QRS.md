# BornClock — Combined Session: Gemstone/Playwright + Past-Period Reflection + Consistency Audit
## ONE single Claude Code session prompt, covering three sequential parts.

---

## HOW TO WORK THROUGH THIS FILE

This file contains three parts, in order: PART Q, PART R, PART S.
Complete them in order, in this same session, without stopping between
them (this is meant to run start to finish in one continuous session,
not as three separate prompts). Commit separately after each part
passes its own tests, so progress is never lost, but do not wait for
further instructions between parts — proceed automatically from Q to R
to S.

Standing requirements apply throughout all three parts: full
positive/negative/edge testing, Playwright where UI is touched,
mimic-manual-testing phase per part, full regression suite at the very
end (after all three parts), and stop-and-flag-in-writing (rather than
stall) for any genuine surprise, per each part's own instructions below.

**The person does not read code.** The final summary, after all three
parts, must contain real, readable examples for everything — especially
Part R's exact question wording and Part S's full audit table.

---



# =========================
# PART Q — Gemstone Refinement + Playwright Final Cleanup
# =========================


---

## CONTEXT FOR CLAUDE CODE

Two low-urgency, bounded backlog items, unrelated to each other, safe to
run unattended. Standing requirements apply: dependency check where
relevant, full positive/negative/edge testing, mimic-manual-testing
phase, full regression at the end, separate commit after each item
passes its own tests, stop and flag genuine surprises in writing
(`docs/part-q-flags.md`) and continue rather than stall.

**The person does not read code.** Final summary must contain real,
readable examples.

---

## ITEM 1: GEMSTONE FUNCTIONAL-MALEFIC TRADITION VARIANCE — REVIEW AND REFINE IF WARRANTED

Part J's gemstone rebuild disclosed on-page that functional-malefic
classification has genuine tradition variance (the "kendradhipati
dosha" nuance — a Kendra-lord that would otherwise be a natural
malefic sometimes gets treated as neutral/beneficial by some
traditions). This is currently disclosed honestly, not hidden. No
action is required — this item exists only to check whether a
worthwhile refinement is available, not to force a change.

1. Research this specific variance again, freshly, from at least 3 independent sources — confirm whether it remains genuinely split (no resolvable majority) or whether further research turns up a clearer mainstream consensus than was found in Part J.
2. If a clear majority convention is found: update the classification to match it, and update the on-page disclosure to reflect the more precise finding (still disclosing any remaining minority-view nuance, same honesty standard as every disclosure in this project).
3. If it remains genuinely split with no resolvable majority: make NO change to the underlying logic. Optionally improve the CLARITY of the existing disclosure text if a clearer way to explain the nuance to a non-astrologer is found, but do not change the actual recommendation logic without a real, sourced reason to do so.
4. Either way, verify the current gemstone recommendations for at least 4 different Lagnas still pass the existing zero-tolerance accuracy checker (`verifyGemstoneReport`) after any change.

### Testing
- If logic changed: re-verify against the same worked-example standard used in Part J's original build (checked against multiple independent sources, verified per-Lagna).
- If logic unchanged: simply confirm the existing test suite for this feature still passes, and note plainly in the summary that no change was warranted and why.

---

## ITEM 2: PLAYWRIGHT SUITE — FINAL TRIAGE PASS

Parts I, K, L, and O have progressively reduced the pre-existing
Playwright failure count through several honest, bounded triage passes.
This item continues that same pattern one more time, not a fresh
investigation from scratch.

1. Run the full existing Playwright suite against the current staging deployment (the one already verified working after Part P's cache-purge fix) and get a fresh, current, accurate count — do not assume the last-reported numbers are still accurate, confirm freshly.
2. Categorize every failure using the same categories established in prior sessions: stale selector, genuine remote-timing/network flakiness, local-only spec incorrectly included (should already be excluded per Part O's config fix — if any reappear, that's worth investigating as a possible regression in that fix), pre-existing/unrelated content issue reproducing on production, or something new.
3. Fix what has a clean, low-risk, high-confidence solution, same bar as every prior triage pass in this project.
4. For anything genuinely ambiguous or requiring real judgment, document clearly in `docs/part-q-flags.md` rather than guessing — same discipline as every prior session.
5. If, after this pass, the remaining failures are ALL confirmed environmental/pre-existing/unrelated (the likely outcome given how much prior work has already gone into this), state that plainly as the honest final status of this recurring cleanup effort, rather than continuing to chip away indefinitely — this item is meant to be a natural stopping point for this particular thread of work, not another partial pass.
6. Report a clear, honest before/after count with the same rigor as every regression check in this project.

### Testing
This item's own work IS the testing — the deliverable is the triage
itself. No additional test suite beyond confirming the fixes made in
step 3 didn't break anything else (re-run the full suite once more
after any fixes).

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- For Item 1 (if changed): generate gemstone recommendations for a few different real Lagnas, read the disclosure text fresh as a non-astrologer — does it stay clear and honest, or does refining the logic accidentally make the explanation more confusing?
- For Item 2: spot-check a few of the "confirmed environmental" failures manually (e.g., actually try the local-only spec locally, actually check if a flagged rate-limit failure resolves on a retry) to confirm the categorization is genuinely correct, not just assumed based on pattern-matching to prior sessions' categories.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite (unit + Playwright) after both items.
Confirm exact before/after counts. Final plain-language summary: Item
1's finding (changed or confirmed-no-change-needed, with reasoning),
Item 2's final honest triage results and whether this closes out the
recurring Playwright-cleanup thread or what specifically remains and
why, and anything flagged for the person's review.

## WHAT NOT TO DO

- Do not change gemstone logic without a genuine, sourced reason — "no change needed" is an acceptable, complete outcome for Item 1
- Do not guess at ambiguous Playwright failures — document them for human review instead
- Do not report Item 2 as "fully resolved" if genuine environmental/unrelated failures remain — report the honest final state
- Do not merge or deploy without being asked
- Do not report either item as done without real, specific evidence


# =========================
# PART R — Past-Period Reflection Feature
# =========================


---

## CONTEXT FOR CLAUDE CODE

This builds a trust-building feature, carefully scoped after extensive
discussion to avoid a real risk: cold-reading-style vague claims that
could damage trust if wrong. The final design, agreed after that
discussion, is precise — implement EXACTLY this, not a looser or more
confident variation.

**The feature**: identify a small number of distinct, real, ALREADY-
COMPLETED past Dasha/Antardasha periods in the user's own chart,
selected using REAL, SOURCED classical house-signification rules (not
random or invented), and ask the user — as a genuine, low-pressure
question, never a confident assertion — whether a traditionally-
associated life theme matched their real experience during that period.

**This is NOT**: past-life content (explicitly rejected after research
showed it's unfalsifiable and adjacent to cold-reading technique — do
not build this). It is not a confident claim about what happened. It
is not shown as certain or "researched" in the scientific sense — it
is explicitly, honestly framed as classical astrological tradition, and
the user's own answer is what matters, not the system's assertion.

**The person does not read code.** Final summary must contain the real,
exact question text as it will appear to a user, and real generated
examples for at least 2 different charts.

---

## PHASE 0: DEPENDENCY MAPPING

Document in `docs/part-r-touchpoints.md`:
- Confirm the full-lifetime Dasha timeline exists and is accessible (built in D-Fix3, extended in later sessions) — this feature needs to identify COMPLETED (past) periods specifically, relative to today's real date.
- Confirm where house-lordship data is already computed (needed to apply the sourced house-combination rules below).
- Confirm the saved-profile/reading-history mechanism (Parts E, P) so this feature can track which specific questions have already been shown to a given user, ensuring true "each question once ever" behavior — this requires persistent, per-user tracking, not just per-session.

---

## PART 1: THE SOURCED CLASSICAL RULES (use exactly these, verified from research)

Use these specific, real, classically-sourced house-signification
combinations (from Jagannath Hora's documented Vimshottari Dasha timing
methodology and corroborated by multiple other sources) to select which
completed past period to ask about for each theme:

- Marriage/relationships: a completed period where the operating Dasha/Antardasha lords jointly signify houses 2, 7, and 11.
- Career/education: a completed period where the operating lords jointly signify houses 2, 6, 10, and 11 (career emphasis) — for an education-specific variant, prioritize periods signifying the 4th (foundational learning) or 9th (higher education) alongside 2/10/11 if research supports this distinction; verify this specific education-vs-career house split against at least one more source before finalizing, and document if it's more ambiguous than the general career rule.
- Foreign travel/major relocation: a completed period signifying houses 3, 9, and 12.

For each theme, if the person's chart genuinely has no clearly-qualifying completed period (this will happen for some charts/theme combinations), do not force a weaker match — simply don't offer that theme's question for that user.

---

## PART 2: THE EXACT QUESTION DESIGN — IMPLEMENT PRECISELY

### Exact wording template (fill in the real computed specifics per chart)

"A quick reflection — no right or wrong answer here. Looking at your
chart, your [Dasha lord] [Antardasha lord, if applicable] period ran
from [start date] to [end date]. In classical Vedic astrology, this
combination of periods is traditionally linked to themes of [theme
description, e.g., 'partnership, marriage, or significant relationships'
/ 'career changes, professional growth, or educational milestones' /
'travel, relocation, or connections abroad']. Did anything along those
lines happen for you during that time?"

Three response options, exactly: "Yes, that fits" / "Not really" /
"I don't remember"

### Exact response handling — implement precisely, tone matters
- "Yes, that fits" leads to: "That's good to know — thank you for sharing." (warm, not triumphant, no claim of proof)
- "Not really" leads to: "That's completely normal — not every classical pattern shows up the same way for everyone. Thanks for letting us know." (calm, never defensive, never re-explaining why it "should" have matched)
- "I don't remember" leads to: "No problem — thanks anyway." (simple, no pressure)

### Frequency rule — implement precisely
Each distinct theme-question (marriage, career/education, travel) may
be shown to a given user AT MOST ONCE, ever — track this persistently
per saved profile/account (per Phase 0's mapping), not per-session.
Different themes can each be shown once, so a user could see up to 3
total questions across their lifetime of using the product (one per
theme, if their chart qualifies for that theme), but never the same
theme's question twice.

### Where it appears
Shown on the Kundali page, after the main reading, in a clearly
distinct, low-key section (not urgent or attention-grabbing styling)
— present as an optional, skippable reflection, not a required step.

---

## PART 3: WHAT HAPPENS WITH THE ANSWER

- Store the user's response (yes/no/don't-remember) associated with their profile, for the person's own future reference/analytics — this is real, valuable, honestly-collected signal on which classical patterns resonate with real users.
- Do NOT use a "yes" answer to make future reading language more confident/assertive elsewhere in the product without a much larger, separate design conversation — this session's scope is asking and honestly acknowledging the answer, not building a feedback loop into other content yet.
- Confirm this data collection is covered by the existing consent model (Part E's opt-in) or add clear, specific disclosure if this is a new category of data being collected beyond what's already covered.

---

## TESTING — POSITIVE, NEGATIVE, EDGE, ADVERSARIAL

- Positive: for at least 2 different real charts with genuinely different Dasha histories, generate the actual question(s) that would be shown — paste the real, exact text for each.
- Negative: a chart with no qualifying completed period for a given theme — confirm that theme's question is correctly NOT shown, not forced.
- Edge: a very young chart (e.g., someone born recently, if the product could plausibly serve such a user) with few or no completed periods yet — confirm graceful "nothing to ask yet" handling.
- Edge: confirm the "once ever" tracking genuinely persists — simulate a user answering a question, then revisiting the Kundali page again, and confirm the SAME theme's question does not reappear, while a DIFFERENT theme's (not yet asked) question still can.
- Adversarial: confirm a user cannot somehow reset or bypass the "once ever" tracking through normal actions (e.g., regenerating their chart, clearing a different piece of state) — the tracking must be robust to normal user behavior.
- Accuracy: verify the selected past period and its dates, for each generated question, actually match the real computed Dasha timeline for that chart — zero tolerance, same standard as every other computed claim in this project.
- Tone/self-critique: read several real generated questions and response-acknowledgments fresh, as a skeptical user — do they feel genuinely low-pressure and honest, or do any read as presumptuous or leading? Revise if so.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: click through a full flow — see a question, answer "Not really," revisit the page, confirm it's gone and doesn't reappear.
- Adversarial: try to see if answering quickly/carelessly multiple times in different ways causes any inconsistent state.
- Honest self-critique: does this feature, as actually built and worded, feel meaningfully different from the "vague cold-reading" pattern the original research warned against, or does it risk sliding toward it? Give a genuine, critical assessment, not just confirmation that the spec was followed.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite. Confirm exact before/after counts, zero
regressions. Final plain-language summary: the real exact question text
for at least 2 different charts across the qualifying themes, the
full response-handling text, confirmation of the "once ever per theme"
tracking working correctly, the accuracy-check results, the honest
self-critique, and anything flagged for the person's review.

## WHAT NOT TO DO

- Do not build any past-life content — explicitly rejected
- Do not word the question with more confidence than "traditionally linked to" / "no right or wrong answer" — this hedging is load-bearing, not optional
- Do not show the same theme's question to the same user more than once, ever
- Do not force a theme's question onto a chart that doesn't genuinely qualify per the sourced house rules
- Do not use a "yes" answer to make other content elsewhere more confident without a separate future design conversation
- Do not merge or deploy without being asked
- Do not report this as done without pasting the real, exact question text for a human to judge directly


# =========================
# PART S — Full-Reading Consistency Audit
# =========================


---

## CONTEXT FOR CLAUDE CODE

This is NOT a new feature. Earlier sessions established a specific
standard for reading quality:
- D-Fix2: decisive, evidence-based reasoning across multiple chart
  sources (house + lord + Dasha + divisional chart), landing on a real
  conclusion — never a bare "yes/no" on a specific future event, but
  never vague either. Applied successfully to Career, Money,
  Relationships.
- D-Fix3: real, computed date-range predictions using the actual
  Dasha/Antardasha timeline, cited alongside the reasoning — "your
  strongest window is [real dates]," not "sometime in the future."
  Applied successfully to the astrologer chat's timing answers and
  several life-area sections.

This session's job: audit the ENTIRE reading (every section, not just
the ones already fixed) and identify where this same standard is
missing or weaker, then bring those sections up to the same level —
using the SAME methods already built and proven, not inventing a new
approach.

**The person does not read code.** Final summary must contain a
section-by-section audit table and real before/after text for anything
changed.

---

## PHASE 0: AUDIT — READ EVERYTHING FRESH, SECTION BY SECTION

Before changing anything, generate a complete reading for the reference
chart (and one additional different chart) and go through EVERY section
present, applying this checklist to each:

1. Does it name specific, real chart facts (house, lord, sign, strength) — or does it generalize?
2. Does it connect MULTIPLE evidence sources together (house + lord + Dasha + divisional chart), the way D-Fix2 requires — or does it list facts in isolation?
3. Does it land on a real, decisive conclusion — or does it stay non-committal?
4. Does it cite a real, computed TIMING window (specific dates) where a timing claim is being made — or does it say "in the future" / "eventually" / "at some point" without dates?
5. Does it respect existing safety boundaries appropriately for its topic (Health must stay theme-only, no diagnosis; Doshas must stay calm, non-fear-based; no literal yes/no anywhere) — improving decisiveness must never mean weakening these.

Produce a clear audit table in `docs/part-s-audit.md`: one row per
section (Snapshot, Career, Relationships, Health, Money, Family, Right
Now, Doshas, Deeper Chart Layers, and any others found), with a
pass/fail/partial rating against each of the 5 checklist items above,
and specific examples of what's currently missing.

Confirm the person's own suspicions directly: specifically check
Family, the Doshas section's timing (does it say WHEN a dosha's
influence is strongest/weakest, using Sade Sati-style phase timing
where applicable — e.g., Kaal Sarp doesn't have phase timing the way
Sade Sati does, so note where a timing dimension genuinely doesn't
apply vs. where it's just missing), and the Deeper Chart Layers section
(divisional charts) for whether they connect to any timing dimension at
all currently.

---

## PART 1: FIX WHAT THE AUDIT FOUND

For each section rated fail/partial, apply the EXISTING, proven
methods — do not invent new approaches:

- Apply D-Fix2's method (multiple evidence sources, explicit reasoning, calibrated confidence, real conclusion) to any section still reading as a list of isolated facts.
- Apply D-Fix3's timing-window computation to any section making a timing-relevant claim without real dates — reuse the existing Dasha-activation engine, do not build new timing logic.
- For Doshas specifically: where a dosha has a genuine timing dimension (Sade Sati's phase-based timing already exists; check whether Kaal Sarp, Mangal Dosha, or others have any legitimate timing angle per classical convention — e.g., "this Yoga/Dosha's effects are traditionally most and least pronounced during periods ruled by its participating planets," reusing the same activation-window logic as Yogas in D-Fix3/Part G) — apply timing where it genuinely, classically applies; do NOT force artificial timing onto something that doesn't have a real timing dimension (e.g., some structural chart features are permanent, not time-bound — say so honestly rather than inventing a fake window).
- For Deeper Chart Layers (divisional charts): where relevant, connect a divisional chart placement to timing (e.g., "your Dasamsa placement's promise is most likely to manifest during periods connected to its ruling planet") reusing the same activation-window logic, extended from Yogas to divisional-chart placements generally where the classical logic genuinely supports it — verify this extension against research the same way every prior timing rule in this project was verified, don't assume it transfers without checking.
- For Family: apply the full D-Fix2 method with the same rigor as Career/Money/Relationships already have — this section likely just needs the same treatment already proven elsewhere, not a new method.

### Accuracy and safety — non-negotiable
- Every new specific fact or date must pass the existing zero-tolerance accuracy checker.
- Every section must still pass the existing safety suite (crisis/health/financial guardrails, D-Fix2 hard boundary against literal yes/no, calm non-fear-based dosha framing) — re-verify this explicitly for every section touched, since this session specifically increases decisiveness and must not let that decisiveness slip into overclaiming.

---

## TESTING

- Re-generate the full reading for the reference chart and at least one different chart AFTER fixes — paste the complete before/after for every section that changed, so the person can see the real difference.
- Re-run the full accuracy checker across the entire reading (not just the previously-covered sections) — report real numbers.
- Re-run the full safety suite — confirm zero weakening.
- Playwright: screenshot the full reading page after changes, confirm no layout/length issues (this has come up multiple times when reading content grows).
- Re-audit against Phase 0's own checklist after fixes — confirm every previously-failing section now passes, and produce a final before/after audit table.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: generate the full reading for 3-4 different real charts, confirm the newly-fixed sections (Family, Dosha timing, divisional-layer timing) genuinely differ chart-to-chart, not templated.
- Adversarial: a chart where a dosha genuinely has NO legitimate timing dimension — confirm the system says so honestly rather than fabricating one.
- Honest self-critique: read the complete, fully-updated reading fresh, as the person who raised this consistency concern — does the ENTIRE reading now feel like one consistent standard of quality, or are there still sections that feel like an afterthought compared to Career/Money? Name anything that still falls short.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite. Confirm exact before/after counts, zero
regressions. Final plain-language summary: the complete audit table
(before and after), full before/after text for every section that
changed, the accuracy/safety re-verification results, the honest
self-critique, and anything flagged for the person's review (especially
any section where a genuine timing dimension doesn't classically apply
and was correctly left as a permanent/structural description rather
than forced into a timing frame).

## WHAT NOT TO DO

- Do not invent a new method — reuse D-Fix2 and D-Fix3 exactly as already proven
- Do not force artificial timing onto a permanent/structural chart feature that has no genuine classical timing dimension — say so honestly instead
- Do not weaken any existing safety guardrail while increasing decisiveness anywhere in the reading
- Do not merge or deploy without being asked
- Do not report any section as fixed without pasting real before/after text
