# BornClock — Part G: Classical Yoga Detection Engine
## Single Claude Code session prompt.

---

## PHASE -1: MAP TOUCHPOINTS BEFORE BUILDING (same discipline as Parts B/D/E/F)

Before Part 0, spend a short amount of time mapping what this session
will actually touch, and write it to `docs/part-g-touchpoints.md`:

- Which existing files/functions currently generate the reading sections (Career, Money, etc. from D-Fix2) that will need to cite Yogas/Nakshatra meanings as new evidence?
- Does the Part F astrologer chat share the same underlying generation code as the Part D/D-Fix2 readings, or separate code paths? If separate, does this session need to update both, or just the readings (confirm scope: the user's original request was about readings citing Yogas/meanings — if the chat should ALSO gain this capability, that's worth confirming rather than assuming, since it doubles the integration surface).
- Where does the "Show chart details (advanced)" view's code live, since Part G adds new sections to it (Yoga list, and this was also where Shadbala numbers moved to in the D-Fix session)?
- If this reveals significantly more integration surface than expected, flag it as its own decision point before proceeding, same as every prior session.

---

## SESSION STRUCTURE — LONG-RUNNING, COMMIT PER PART

This session is expected to run over multiple hours given its real
scope. Work through the parts in order (0 through 5). **Commit after
each part completes and its own tests pass** (not one giant commit at
the end) — this gives natural checkpoints and means partial progress is
never lost or hard to review. Use clear commit messages identifying
which part each commit covers (e.g., "Part G.0: Nakshatra/Yoga meanings
layer, verified and tested" / "Part G.1-2: Yoga detection engine,
verified against worked examples"). Continue to flag and stop for a
real decision if Phase-0-style scope surprises come up within any part,
the same as every prior session — long-running does not mean
uninterruptible if something genuinely needs the person's input.

---

## CONTEXT FOR CLAUDE CODE

This follows Parts B, D, D-Fix, D-Fix2, E, F — a validated calculation
engine, a decisive-but-not-guaranteed reading system, a saved profile,
and an AI astrologer agent, all tested and on staging.

**The person running this session does not read code.** All
verification must come back as real, readable output — actual computed
results for real charts, not just "tests pass."

### What this session builds

Classical Vedic astrology recognizes specific, named planetary
combinations ("Yogas") — Raj Yoga (authority/success), Dhana Yoga
(wealth), Gaja Kesari (wisdom/reputation), the five Pancha Mahapurusha
Yogas (Ruchaka/Bhadra/Hamsa/Malavya/Sasa — one per classical planet),
Neecha Bhanga Raja Yoga (debilitation reversal), Budha-Aditya
(intelligence), and Chandra-Mangal (wealth through bold action). This
session builds a detection engine for these, using the already-
validated planetary positions, houses, strengths (Shadbala), and
divisional charts (Navamsa) from Parts B onward.

**This is not a simple yes/no per Yoga.** Real research confirms
professional astrology treats Yoga formation as graded: a formation
condition being technically met does not mean the Yoga "delivers" at
full strength — delivery depends on additional factors (planetary
strength, house significance, Navamsa confirmation, Dasha timing). This
session must build that grading in from the start, not bolt it on later.

---

## PART 0: NAKSHATRA MEANINGS LAYER (folded into this session per user request)

### The gap this addresses

Right now, when a reading names a Nakshatra ("your Moon is in Pushya") or a
Yoga ("you have Gaja Kesari Yoga"), it states the technical term but
doesn't explain what that term traditionally MEANS to someone who
doesn't already know Vedic astrology. This is a real, separate gap from
the Yoga-detection work below — build both together since they're
naturally related ("what does this classical term signify").

### 0.1 Build a Nakshatra meanings reference

For all 27 Nakshatras, compile (from multiple independent sources, the
same verification standard as everything else in this project):
deity, symbol, ruling planet, and a genuinely informative 1-2 sentence
plain-language meaning that captures what's DISTINCTIVE about that
Nakshatra — not a generic "this Nakshatra brings good qualities"
template, but the specific real characterization (e.g., Pushya:
verified across 8+ independent sources as "the King of Nakshatras" —
considered the most universally auspicious Nakshatra, a rare "triple
benefic" combination of Saturn's discipline, Cancer's nurturing, and
Jupiter/Brihaspati as its presiding deity, traditionally favored for
starting important ventures).

For each Nakshatra, verify the claimed "significance level" (is it
genuinely considered especially auspicious/inauspicious/notable, or is
it a fairly neutral one) against real sources — do NOT inflate every
Nakshatra to sound equally special; that would be the same "uniform
confidence" dishonesty problem already flagged for Shadbala and Yoga
grading. Some Nakshatras are classically considered more neutral than
others — say so plainly where that's the case, rather than manufacturing
false significance for every one.

### 0.2 Build a Yoga meanings reference

For each Yoga detected by Part 1 below, compile a genuinely informative
plain-language explanation of what it traditionally signifies (Gaja
Kesari = wisdom, lasting good reputation; Dhana Yoga = financial
prosperity and steady wealth accumulation; Raj Yoga = authority,
recognition, career elevation; etc.) — reusing the research already
done for Part 1's formation rules, since the "Promises" column was
already gathered there.

### 0.3 Wire both into the reading system

When a reading names a specific Nakshatra or a detected Yoga, it should
draw on this meanings layer to explain WHY that placement matters, not
just state the technical name. This directly serves the D-Fix2 "explain
the logic" requirement — a reading that says "your Moon is in Pushya,
traditionally considered one of the most auspicious Nakshatras due to
its rare combination of Saturn's discipline and Jupiter's wisdom" is
both more informative AND more specific than either the bare technical
name or a generic description alone.

### 0.4 Testing for this part specifically

- Verify at least 5 Nakshatra meanings and all Yoga meanings against multiple independent sources before trusting them (same standard as Part 2 below).
- Confirm the "don't inflate every Nakshatra to sound special" check: test that a genuinely neutral/unremarkable Nakshatra's description doesn't get artificially dramatized to match Pushya's level of significance.
- Confirm this integrates cleanly with the existing hallucination/accuracy checker — a claimed Nakshatra MEANING doesn't need fact-checking the way a claimed PLACEMENT does (meanings are traditional/interpretive, not computed facts), but the reading must not misstate which Nakshatra the person actually has (that IS a checkable fact, already covered by existing accuracy checks).

---

## PART 1: THE YOGAS TO DETECT, WITH EXACT FORMATION RULES

For each Yoga below, implement detection using the EXACT rule as
researched (verified against multiple independent sources — do not
invent or approximate a rule; if genuinely uncertain about a detail,
research it the same way prior sessions researched Kaal Sarp/Mangal
Dosha conventions, and document the source/confidence level).

### 1.1 Raj Yoga (and Yogakaraka)
Formed when the lord of a Kendra house (1st, 4th, 7th, 10th) associates
with the lord of a Trikona house (1st, 5th, 9th) — via conjunction
(same house), mutual aspect, or Parivartana (sign exchange). A single
planet that rules BOTH a Kendra and a Trikona for the specific Lagna is
a Yogakaraka — an especially strong, built-in Raj Yoga. Note: the 1st
lord counts as both Kendra and Trikona.

### 1.2 Dhana Yoga (wealth)
Formed when lords of wealth-significant houses (2nd, 5th, 9th, 11th —
research confirms 2nd/11th as the core pair, with 5th/9th as
additional/stronger variants) associate via conjunction or mutual
aspect. More participating wealth-lords in the combination = stronger
classical Dhana Yoga (this graded strength must be computed and stated,
not just present/absent).

### 1.3 Gaja Kesari Yoga
Formed when Jupiter occupies a Kendra house (1st, 4th, 7th, 10th)
counted FROM THE MOON (not from Lagna). Per research: this condition is
common (occurs in a meaningful percentage of charts) because of
Jupiter's and the Moon's orbital periods — the detection must note this
explicitly rather than treating mere formation as automatically
"powerful." Full delivery additionally requires: both planets connect
to (rule or occupy) houses 9, 10, or 11; check Shadbala strength of
both Jupiter and Moon; note the Mahadasha/Antardasha combination that
would activate it (Jupiter Dasha/Moon Bhukti or Moon Dasha/Jupiter
Bhukti are the peak windows, per research).

### 1.4 Pancha Mahapurusha Yogas (5 total, one per planet)
Each forms when the named planet is in its OWN sign or EXALTED, AND
placed in a Kendra house (1st, 4th, 7th, 10th) from the Lagna:
- **Ruchaka**: Mars — courage, command, physical strength
- **Bhadra**: Mercury — intelligence, eloquence, learning
- **Hamsa**: Jupiter — wisdom, faith, respected character
- **Malavya**: Venus — grace, refinement, comfort
- **Sasa**: Saturn — discipline, earned authority

### 1.5 Neecha Bhanga Raja Yoga (debilitation cancellation)
This is the most complex Yoga in this set — build it carefully, with
multiple checkable conditions, and grade the result (per research's own
"Full" vs "Strong" vs "not cancelled" tiers):

For a debilitated planet, check ALL of these conditions (the MORE that
are true, the STRONGER the cancellation — this is explicitly a counted,
graded result per research, not a single boolean):
1. The dispositor (lord) of the debilitation sign is in a Kendra (1,4,7,10) from Lagna OR from Moon.
2. The lord of the sign where this planet would be EXALTED is in a Kendra from Lagna OR Moon.
3. The debilitated planet is itself placed in a Kendra house.
4. The debilitated planet is conjunct or aspected by its own dispositor.
5. Sign exchange (Parivartana) between the debilitated planet and its dispositor.
6. Check the SAME planet's placement in the Navamsa (D9) — if it is ALSO debilitated there, this weakens/negates the cancellation regardless of Rashi-chart conditions (research explicitly flags this as a common thing "most readings ignore" — do not skip it).
7. Check if the cancelling/supporting planet (the dispositor from condition 1, or exaltation-lord from condition 2) is itself weak, debilitated, or badly placed — if so, the cancellation is weak even if technically present (research: "a debilitated Mars trying to cancel Saturn's debilitation carries very little corrective force").

Grade the result: 0 conditions met = no cancellation (planet remains
simply debilitated, state this plainly). 1 condition = weak/partial
cancellation. 2-3 conditions = strong cancellation. 4+ conditions AND
not negated by condition 6/7 = full Neecha Bhanga Raja Yoga. State the
exact conditions met/not met for transparency (this is exactly the
"show your reasoning" requirement from the D-Fix2 session — reuse that
same principle here).

### 1.6 Budha-Aditya Yoga
Sun and Mercury in the same house/sign (note: since Mercury is never
more than ~28 degrees from the Sun astronomically, this is a
geometrically common combination — the detection should note this, and
grade strength by whether Mercury is combust (too close to the Sun,
which research and this project's own combustion module already
compute) — combustion typically weakens the intellectual-brightness
promise of this Yoga even though the conjunction is present).

### 1.7 Chandra-Mangal Yoga
Moon and Mars in conjunction (same house/sign) OR mutual aspect —
traditionally indicates wealth through bold, decisive action or
business acumen specifically (directly relevant to the "will my
business succeed" theme from the D-Fix2 session — this Yoga is a
legitimate, real piece of evidence to cite in money/business-themed
readings when present).

---

## PART 2: BUILD AND VERIFY AGAINST WORKED EXAMPLES

Before wiring this into any reading, verify EACH Yoga's detection logic
against at least one independently-sourced worked example (the same
research already done for this prompt contains some — e.g., the Sun-
debilitated-in-Libra/Venus-in-kendra example for Neecha Bhanga). Where
a clean worked example wasn't found in initial research, search for one
specifically before trusting the implementation — do not ship a Yoga
detector that has only been checked against invented test data.

### 2.1 Handle genuine source disagreement explicitly — do not silently pick one

Real research already surfaced genuine disagreement between sources on
some rule details (e.g., Dhana Yoga's exact participating house list
varies: some sources say 2nd+11th only, others include 5th+9th; Neecha
Bhanga's "aspected by own dispositor" is treated as a full condition by
some sources and a weaker supplementary one by others). For EVERY such
disagreement encountered:
1. Search for at least 2 more independent sources to see if a majority position exists (same method used for Kaal Sarp/Mangal Dosha conventions in prior sessions).
2. If a clear majority exists, use it and document the choice + the minority view in a code comment.
3. If genuinely split with no clear majority, implement the MORE CONSERVATIVE interpretation (the one requiring more conditions / producing fewer false positives) and explicitly flag this as a documented judgment call in both the code and the final summary — the same way D60 was flagged as "one of several traditions" rather than presented as settled.
4. Do NOT silently choose one interpretation without documenting that a real disagreement existed — this must be visible to the person reviewing, not buried.

Additionally, run EVERY Yoga detector against the reference chart
(1988-11-05, 12:30, Delhi) and the existing validated test-chart set
from earlier sessions (check `scripts/vedic-lab/` for the surviving
chart-generation scripts). Report which Yogas are present in which
charts, with the full reasoning shown, so a human can sanity-check the
output makes sense (e.g., does the reference chart's Gaja Kesari
detection — if present — correctly identify Jupiter's real house count
from the real Moon position, both already validated in Part B).

---

## PART 3: INTEGRATE INTO THE READING SYSTEM

- Add detected Yogas as a NEW data field returned by `calculateBirthChart()` (or a related function) — a list of {yogaName, present, strength/gradeLevel, conditionsShown, relevantHouses/planets}.
- Update the Part D/D-Fix2 reading generation prompts to actively use detected Yogas as additional evidence when relevant — e.g., if Dhana Yoga is present, the Money section's reasoning should name it explicitly alongside the existing house-lord/Dasha reasoning, using the same "multiple evidence sources, explicit reasoning, real conclusion, calibrated confidence" method already built in D-Fix2. A strong, multi-condition-verified Yoga is exactly the kind of additional evidence that should INCREASE confidence/decisiveness in a section, per the D-Fix2 design.
- Extend the "Show chart details (advanced)" view to list detected Yogas with their grade and the conditions that were checked (mirroring how Shadbala numbers were moved there, not deleted, in the earlier fix).

---

## PART 4: TESTING — ACCURACY IS EVERYTHING HERE

Yoga detection is a NEW hallucination risk surface — a wrongly-detected
Yoga is exactly the kind of "confidently wrong specific claim" the
existing accuracy checker was built to catch. Extend that checker to
cover Yoga claims:

1. Unit tests for EACH Yoga's detection logic against the worked examples from Part 2, with exact expected present/absent and grade-level assertions.
2. Extend the existing hallucination/accuracy checker (from D-Fix) so that if a reading's generated text claims a Yoga is present, this is cross-checked against the actual computed Yoga-detection result — same "0 wrong claims tolerated, retry on failure" standard already established.
3. Edge cases: a chart with NO significant Yogas present (confirm the reading doesn't fabricate one to sound more impressive — this is a real, specific risk given the "be more decisive" direction from tonight's conversation, and needs an explicit test); a chart with MULTIPLE strong Yogas present (confirm the reading synthesizes them coherently, doesn't just list them robotically); a chart where a Yoga's formation condition is met but delivery conditions are NOT (confirm the reading states this nuance — "formed but not fully activated" — rather than treating mere formation as a full promise, per the Gaja Kesari commonality warning in Part 1.3).
4. Re-run the full existing test suite (specificity, accuracy, safety, D-Fix2 hard-boundary check). Confirm zero regressions.
5. If anything fails and gets fixed, re-run everything together again, not just the failing piece.

### Playwright E2E check for this addition

- Load the Kundali page for the reference chart, click "Show chart details (advanced)," screenshot the new Yoga section — confirm it renders fully, readably, with grade levels visible, no truncation or layout breakage.
- Load a reading where a detected Yoga is cited in the narrative text (e.g., Money section citing Dhana Yoga) — screenshot the rendered section to confirm the longer/denser text still displays correctly.

### Cost and performance impact — report plainly

- How much additional computation time does running all 11 Yoga detectors add per chart (should be fast — this is straightforward rule-checking on already-computed data, not new AI calls — confirm and report the actual measured time, don't assume).
- How much does citing Yogas in reading prompts increase prompt size / generation time / retry rate compared to the current D-Fix2 baseline? Report actual before/after numbers, the same way the D-Fix session reported its 2.7x prompt size increase.

---

## PART 5: MIMIC-MANUAL-TESTING PHASE (standing requirement, all future sessions)

Automated tests only catch what someone thought to check for in
advance. This phase exists to catch what a real, curious, occasionally
adversarial human tester would find that a scripted test would not.
Do this in addition to, not instead of, Parts 1-4.

### 5.1 Exploratory click-paths
Try several realistic but non-obvious user journeys through this
session's new feature, not just the one "happy path" already tested:
- Generate a Yoga-heavy chart's reading, then immediately go back and change one birth detail slightly (e.g., time by 10 minutes) — confirm Yogas that depend on exact house cusps update correctly, and ones that don't remain stable.
- View the advanced Yoga details, close it, reopen it, navigate away and back — confirm state doesn't break or show stale data.
- Trigger a Yoga-citing conversation in the Part F astrologer chat, then ask a skeptical follow-up ("how do you know that Yoga is really there?") — confirm the agent can explain its reasoning coherently rather than repeating itself or contradicting the original claim.

### 5.2 Adversarial/confused-user input
Deliberately try to break or confuse this session's feature the way a
real unpredictable user might:
- Ask the astrologer chat a leading question designed to get it to overstate a Yoga's importance ("so this Raj Yoga means I'll definitely become rich, right?") — confirm it holds the line from the D-Fix2 hard boundary even when pushed.
- Ask about a Yoga that doesn't exist ("do I have Surya Kesari Yoga?") — confirm it doesn't fabricate an answer to seem helpful, and instead says plainly that this isn't a combination it checks for or that it doesn't recognize the term.
- Try nonsensical or edge-case input in any new form field this session touches.

### 5.3 Honest self-critique, done separately from the build itself
After building and testing per Parts 1-4, take on the role of a
skeptical, demanding user (not the role of the developer confirming
their own work) and critique the actual output fresh:
- Read 2-3 real generated outputs from this session's feature as if seeing them for the first time, with no context on how they were built.
- Name anything that feels overclaimed, confusing, robotic, repetitive, or like it's technically correct but not actually satisfying to a real person.
- Do not soften this critique to make the session look more successful — the value of this step is entirely in catching what the build-and-test process itself couldn't see.

Report the results of 5.1, 5.2, and 5.3 in the final summary alongside
the standard checkpoint items — real observations, not "no issues
found" unless genuinely nothing came up after actually trying.

---

## FINAL CHECKPOINT — PLAIN-LANGUAGE SUMMARY REQUIRED

- For each of the 7 Yoga categories (11 total including the 5 Mahapurusha): confirm implemented, confirm verified against a real worked example, state the confidence level plainly
- The Nakshatra and Yoga meanings layer: confirm built, confirm at least 5 Nakshatra meanings + all Yoga meanings verified against multiple sources, confirm the "don't inflate neutral Nakshatras" check passed
- Any genuine source disagreements encountered (Part 2.1), what was chosen, and why — do not omit these even if resolved
- The reference chart's full Yoga detection results, pasted in full, with reasoning shown
- At least one example of a reading section that now cites a detected Yoga as evidence, before/after, so the improvement is visible
- The "no fabricated Yoga on a Yoga-less chart" test result
- The "formed but not fully activated" nuance test result — paste the actual generated text
- The Playwright screenshots described in plain language
- The cost/performance numbers (detector speed, prompt size/retry impact)
- Exact test counts before/after, zero regressions
- Your honest assessment: is this genuinely rigorous, evidence-based astrology, or does any part of it feel like it's overclaiming confidence beyond what the classical texts themselves would support?

## WHAT NOT TO DO

- Do not implement a Yoga as simply "present/absent" without the graded strength assessment — this was explicitly required, not optional
- Do not skip the Navamsa cross-check for Neecha Bhanga — research explicitly flagged this as commonly, wrongly skipped
- Do not let Yoga citations in readings cross into literal yes/no predictions — the D-Fix2 hard boundary applies equally here
- Do not merge or deploy without being asked
- Do not report any Yoga as "verified" without having actually checked it against a real worked example
