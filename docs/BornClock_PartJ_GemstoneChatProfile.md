# BornClock — Part J: Gemstone Rebuild + Chat Citations + Unified Profile
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

This session covers three researched, evidence-backed improvements:
1. Rebuilding the gemstone feature to use the methodologically correct approach (research found this is NOT a genuine 50/50 disagreement — it's a clear hierarchy, detailed below)
2. Extending Yoga/Nakshatra citation into the Part F astrologer chat, with its own dedicated accuracy guard (previously deferred specifically to get this exact careful treatment)
3. A progressive, "ask only what's needed, offer to reuse what's known" unified profile across the whole site, not a single one-size-form

**Standing requirements, unchanged from every prior session:**
- Phase 0 dependency mapping before building anything
- Sequential parts, commit after each passes its own tests
- Full positive/negative/edge case testing per part, Playwright E2E included
- Mimic-manual-testing phase (exploratory, adversarial, honest self-critique) at the end
- Full regression suite at the very end, zero-regression standard
- Stop and flag genuine scope surprises or design decisions in writing

**The person does not read code.** Every result must come back as real,
readable text/examples.

### New standing requirement for this session: methodology transparency

For EVERY computed result across this whole project — not just this
session's three items — there should be a clear, honest, brief note
showing what was actually considered/compared/computed to reach that
result, so the user can see this isn't a guess or a template. This
builds real trust the same way disclosed methodology already works for
D60 ("one of several traditions") and the "cross-verified against
multiple independent platforms" credibility line. Apply this principle
specifically to the three items below, and note in the final summary
if there are other existing features that would benefit from the same
treatment (for a future pass, not necessarily built now).

---

## PHASE 0: DEPENDENCY MAPPING

Before building anything, map and document in `docs/part-j-touchpoints.md`:

- The current gemstone feature's code (from the overnight batch) — exact current logic, so this session extends/replaces it correctly rather than duplicating.
- The Part F astrologer chat's current architecture — how it currently accesses chart data, where its existing accuracy/safety guard logic lives (the crisis/health/financial guardrails), so the new Yoga-citation guard follows the same pattern and sits alongside them correctly, not as a separate bolted-on system.
- Every place across the site that currently collects a birth date/time/place (the full list from Part E's original mapping, plus anything added since — Age Calculator, Birthday Report, Kundali, Matching, the five new Part I tools, Astrologer chat).
- **Specifically for the Age Calculator**: confirm whether this is code built/touched by this project (lower risk to modify) or older, pre-existing, unrelated code (higher risk — a change here could destabilize a working feature that has nothing to do with the Vedic engine work). If it's the latter, treat integration with the Age Calculator specifically as lower-priority/optional for this session — the core progressive-profiling win (Kundali ↔ Matching ↔ chat ↔ Part I tools, all already-related Vedic-cluster code) does not depend on also touching the Age Calculator, and that specific integration can be deferred if it looks risky once actually inspected.
- The current saved-profile storage mechanism (Part E's opt-in, device-only localStorage) and its exact schema, to confirm the progressive-profiling extension builds on it rather than replacing it.

If any of this reveals significantly more complexity than expected, flag it in writing per the standing rule and adjust scope for that specific item, not the whole session.

---

## PART 1: REBUILD GEMSTONE RECOMMENDATIONS — LAGNA-BASED, NOT RASHI-BASED

### The research finding (why this isn't a 50/50 judgment call)

Multiple independent sources, including ones explicitly written to correct
common bad practice, converge clearly: recommending a gemstone based only
on Rashi (Moon sign) is the corner-cutting, low-effort method — one
source describes it as what "eight out of ten sellers" do because "it
takes thirty seconds and requires no real analysis." The methodologically
correct approach, described consistently across sources, is:

1. **Lagna (Ascendant) and its lord** — the actual foundation, not Rashi.
2. **Yogakaraka identification** — for Lagnas that have one (Taurus, Cancer, Leo, Libra, Capricorn, Aquarius per research), this single planet is the most powerful, specific recommendation.
3. **Planetary strength** (already computed via Shadbala) — a functional benefic that is WEAK is the clearest candidate; a planet that's already strong doesn't need reinforcement.
4. **Current Dasha/Antardasha** (already computed via the D-Fix3 timing engine) — a functional benefic currently running its own period is the most time-relevant, urgent recommendation.
5. **What to explicitly avoid**: functional malefics for that specific Lagna (research provided a real reference table of benefic/malefic-by-Lagna to verify against).

### Build this properly
- Rebuild the gemstone logic to follow this real hierarchy: Lagna lord first, Yogakaraka flagged specifically when present, cross-checked against Shadbala strength (favor weak-but-benefic planets) and current Dasha relevance (favor currently-active periods) — reusing all already-validated engine data, no new astronomy needed.
- Research and verify the functional benefic/malefic table for all 12 Lagnas from at least 2 independent sources before implementing (the same "verify before trusting" discipline as every calculation in this project) — flag if genuine disagreement exists on any specific Lagna's classification.
- **Explicit user-facing methodology note, worded honestly per the person's specific request**: something like — "This recommendation is based on your Ascendant (Lagna), which multiple classical sources identify as the correct foundation for gemstone selection — not your Moon sign (Rashi) alone, which is a common but less precise shortcut. We considered: your Lagna lord [X], your Yogakaraka [Y, if applicable], [X]'s current strength ([strong/weak] per Shadbala), and your current planetary period ([Dasha lord])." This must be factually accurate to what was actually computed for that specific chart — do not write generic methodology text; generate it from the real computed factors for that real chart, using the same accuracy-checking discipline as every other generated claim in this project. Keep the critique aimed at the METHODOLOGY (Rashi-only vs. Lagna-based), not at any named or implied competitor, product, or seller — the point being made is "here is the more rigorous approach and why," not "other apps/sellers are wrong or untrustworthy."
- Keep everything from the overnight batch's cautious framing intact: informational only, no sales/purchase flow, non-medical/non-guaranteed-effect language.

### Testing
- Positive: verify recommendations against the Lagna-based reference table for at least 4 different Lagnas (including at least one with a Yogakaraka and one without).
- Negative: a chart with no functional benefic currently weak (all functional benefics already strong) — confirm the system says so honestly rather than forcing a recommendation that doesn't fit the data.
- Edge: a Lagna where research found genuine disagreement on a specific planet's classification (if any was found in Phase research) — confirm this is flagged, not silently resolved.
- Extend the accuracy checker to verify the methodology note's stated facts (Lagna lord, Yogakaraka, strength, Dasha) match the real computed chart data — zero tolerance, same as every other claim in this project.
- Playwright: screenshot the updated gemstone page, confirm the methodology note renders clearly and doesn't feel like a wall of jargon — check it reads well to a non-astrologer.

---

## PART 2: YOGA/NAKSHATRA CITATIONS IN THE ASTROLOGER CHAT — WITH DEDICATED ACCURACY GUARD

This was deferred twice specifically to get careful, dedicated
attention — give it that now, with the same rigor as Part F's original
crisis/health/financial guardrails.

### Architecture guidance from research
Recent research found that naive retrieval-augmented approaches can
*increase* hallucination in high-stakes domains (one study found an
8.7x increase), while structured, verified data with explicit
provenance tracking substantially reduced it. This validates continuing
with this project's existing pattern (the deterministic accuracy
checkers already used in Part D-Fix, Part G, Part D-Fix3) rather than
introducing a different architecture for chat specifically — extend
the same pattern, don't invent a new one.

### Build
- Wire the chat's context-building step to include the user's detected Yogas (with grades) and relevant Nakshatra meanings, the same real computed data already used in readings.
- When the chat cites a Yoga or Nakshatra meaning in a response, apply the SAME zero-tolerance accuracy check already proven in Part D-Fix/G/D-Fix3: extract the specific claim, cross-check against the real computed chart data, retry on mismatch, fall back to a safe deterministic response if repeated attempts fail — do not let an unverified claim reach the user.
- The chat should also be able to explain WHY a Yoga is present when asked a follow-up ("how do you know I have this Yoga?") — citing the actual conditions checked (per Part G's graded, condition-transparent design), not just asserting it again.
- If asked about a Yoga that doesn't exist (a fabricated name), the chat must say so plainly rather than inventing an answer to seem helpful — test this explicitly.

### Cost/latency impact — report plainly
Adding Yoga/Nakshatra context plus the new accuracy-guard retry loop
increases chat prompt size and potentially retry rate, the same
tradeoff measured for every prior chat/context expansion in this
project (D-Fix3's timing integration, Part F's original build). Measure
and report: prompt size before/after, retry rate before/after, and
typical response latency before/after, for a representative set of test
conversations. This is not a reason to avoid the feature — it's
information the person needs, the same standard applied every other
time chat context grew.

### Testing (per Part F's original safety-testing standard)
- Positive: ask about a real, present Yoga — confirm accurate citation with correct grade and reasoning.
- Negative: ask about a Yoga the chart does NOT have — confirm honest "you don't have this" response, not a fabrication.
- Negative: ask about a nonexistent/fake Yoga name — confirm honest "I don't recognize that" response.
- Edge: ask a skeptical follow-up ("prove it," "how do you know") — confirm the chat can explain its reasoning using the real condition data, not just repeat itself.
- Edge: ask a leading question trying to get the chat to overstate a Yoga's importance ("so this means I'll definitely be rich, right?") — confirm the existing D-Fix2 hard boundary against literal yes/no still holds even when a real Yoga is being discussed.
- Re-run the FULL existing test suite (all prior safety/accuracy/specificity/timing checks) to confirm this addition doesn't weaken anything already built.

---

## PART 3: UNIFIED PROGRESSIVE PROFILE (NOT A SINGLE FORM)

### The right pattern, per research
"Progressive profiling" — ask for the minimum a given tool actually
needs, check if a relevant saved profile already covers it, offer to
reuse rather than re-ask, and offer to extend the saved profile when a
richer tool needs more detail than what's currently saved. This is NOT
the same as forcing every tool to collect full Vedic-depth birth data
regardless of whether it needs it.

### Build
- Extend Part E's existing saved-profile mechanism (still opt-in, still device-only per the standing privacy decision — do not silently change that) to be genuinely progressive:
  - If a tool needs ONLY a birth date (e.g., Age Calculator) and a saved profile exists with at least a date, offer to use it — don't force re-entry.
  - If a tool needs full date+time+place (Vedic tools) and only a partial profile exists (e.g., date-only from the Age Calculator), offer to use what's known and prompt ONLY for the missing pieces (time, place) — never re-ask for what's already saved.
  - When a user completes a richer entry (e.g., enters full Vedic details), offer to update/extend the saved profile so future date-only tools benefit too.
- Confirm this respects the same explicit opt-in consent model from Part E — no silent expansion of what's stored without the user's continued, clear consent as the profile grows richer.
- Wire this into: Age Calculator, Birthday Report, Kundali, Matching, the five Part I tools (Sade Sati, Muhurat, Career Report, Gemstones, plus Matching already covered), and the Astrologer chat.

### Testing
- Positive: a new user enters full details on Kundali; later visits Age Calculator — confirm it offers/uses the saved date without re-asking for time/place it doesn't need.
- Positive: a new user enters only a date on Age Calculator first; later visits Kundali — confirm it offers to reuse the date and prompts ONLY for time/place, not the full form again.
- Negative: corrupted/partial saved profile — confirm graceful fallback to asking for whatever's missing, no crash.
- Edge: user wants to check a different person's chart entirely (e.g., a friend's) on a tool that normally uses their own saved profile — confirm there's a clear way to do this without overwriting their own saved profile (same protection as Part E's original "use different details" flow).
- Playwright: screenshot the cross-tool flow (enter partial data on one tool, confirm it's offered/reused correctly on another) for at least 2 real tool pairs.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: use the three new/changed features in an unplanned order (ask the chat about Yogas before ever generating a reading; check gemstones before ever setting a saved profile; navigate between tools in a non-obvious sequence).
- Adversarial: try to get the chat to overstate a Yoga's guarantee; try to get the gemstone feature to recommend based on Rashi alone by asking a leading question; try corrupting a partial saved profile mid-flow.
- Honest self-critique: read the actual gemstone methodology note and a real chat Yoga-citation exchange fresh, as a skeptical user — does the methodology transparency actually build confidence, or does it read as jargon-dropping? Say so plainly either way, and revise if it reads as the latter.

---

## FULL REGRESSION + FINAL CHECKPOINT

- Run the complete test suite (unit + Playwright), confirm exact before/after counts, zero regressions across the whole session.
- Final plain-language summary: real examples of the new gemstone methodology note (at least 2 different charts), real chat transcripts showing Yoga citation + the skeptical-follow-up handling + the fabricated-Yoga-name handling, real examples of the progressive-profile flow across at least 2 tool pairs, the mimic-testing findings and self-critique, exact test counts, and anything flagged for the person's review.

## WHAT NOT TO DO

- Do not add any gemstone purchase/sales flow
- Do not silently change the opt-in, device-only nature of the saved profile — progressive profiling extends WHAT can be reused, not the consent model
- Do not weaken any existing guardrail (D-Fix2 hard boundary, crisis/health/financial guardrails, existing accuracy checks) while adding the new Yoga-citation capability
- Do not report any part as done without pasting real, specific generated examples
- Do not merge or deploy without being asked
