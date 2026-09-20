# BornClock — Part AB: Transit-Based Timing Engine (Proof of Concept)
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

Extensive real testing (four separate natal-only methods, tested
against two real charts with known marriage dates) established that
natal-chart-only analysis cannot reliably identify WHEN a specific life
event occurred or will occur. Every method either missed the real
period, buried it among 29 equally-ranked candidates, or excluded it
entirely.

Research into how professional Vedic astrologers and major Indian
platforms (AstroSage, Astrotalk) actually do this confirmed the missing
piece: transits — specifically Jupiter's and Saturn's transits
activating the natal 7th house, the 7th lord, or Venus. The natal chart
indicates WHETHER and WHICH planets; the transit indicates WHEN. This
project has the raw ephemeris (a chart can be computed for any date)
but has NO transit-analysis module anywhere.

This session builds that missing layer as a validated proof of
concept — NOT a user-facing feature yet. The goal is to determine
honestly whether transit-based timing actually works against real,
known outcomes before any decision to build it into the product.

The person does not read code. Report findings in plain language
with real numbers.

Standing requirements: Phase 0 dependency mapping, honest grading (no
stretching to find fits), stop-and-flag for genuine blockers, no
user-facing changes in this session.

---

## PHASE 0: DEPENDENCY MAPPING

Document in `docs/part-ab-touchpoints.md`:
- Confirm exactly how a chart for an arbitrary past/future date is currently computed (the ephemeris capability already demonstrated when June 2006 positions were computed) — what function, what inputs, what it returns.
- Confirm what natal data is already available to compare transits against (7th house cusp/sign, 7th lord and its natal position, Venus's natal position) — all should already exist.
- Estimate the computational cost of computing planetary positions repeatedly across a date range (e.g., monthly positions across 40 years = ~480 chart computations) — is this fast enough to be viable, or would it need optimization/caching? Report real measured timing, don't estimate.

---

## PART 1: BUILD THE TRANSIT-TIMING MODULE (computation only, no UI)

Build a module that, given a natal chart and a date range, identifies
periods where classical marriage-timing transit rules are satisfied.

### The rules to implement (from real research into professional practice)

A date/period is a marriage-timing candidate when transit Jupiter does
ANY of the following:
1. Transits through the natal 7th house
2. Transits through the sign of the natal 7th lord
3. Aspects the natal 7th house (using classical Jupiter aspects: 5th, 7th, 9th from its position)
4. Aspects or conjuncts the natal position of the 7th lord
5. Aspects or conjuncts natal Venus

Additionally, compute Saturn's transit relationship to the same points
(7th house, 7th lord, Venus) — professional practice treats Saturn as
a secondary confirming/stabilizing indicator, and classical sources
describe the strongest timing as when BOTH Jupiter and Saturn activate
marriage-significant points (the "double transit" principle).

Grading requirement: for each candidate window found, grade it
honestly:
- STRONG: Jupiter directly transiting the 7th house or conjunct the 7th lord/Venus, AND Saturn also activating one of these points
- MODERATE: Jupiter activating one of these points via aspect, or Jupiter direct but no Saturn support
- WEAK: only indirect/distant connections

Do NOT relax these definitions later to produce better-looking results.

---

## PART 2: VALIDATE AGAINST THE TWO REAL KNOWN CASES

This is the entire point of the session — does this actually work?

Chart 1: himanshu1305@gmail.com's saved profile (1978-05-13, 19:30, Jammu). Real marriage: June 2006.
Chart 2: 1981-07-09, 04:30 AM, Patna. Real marriage: June 2006.

For each chart:
1. Run the transit-timing module across that person's adult life (age 18 to present, roughly 1996-2026 for Chart 1, 1999-2026 for Chart 2).
2. List every candidate window found, with its grade and real dates.
3. Report how many total candidate windows the method produces across that whole span (this is the critical number — if it produces 40 windows, it's another floodlight; if it produces 3-5, it may be genuinely discriminating).
4. State explicitly whether June 2006 falls within a candidate window, and if so, what grade that window received and where it ranks among all candidates.

### Honest reporting requirements
- If June 2006 is NOT identified for one or both charts, say so plainly. Do not adjust rules to make it fit.
- If the method produces too many candidates to be useful, say so plainly with the real count.
- If it produces a genuinely small, accurate candidate list that includes June 2006 highly-ranked for BOTH charts, that is a real positive result worth reporting clearly.
- Include the same sample-size caveat as before: two charts cannot prove generalization, only indicate whether the approach is worth pursuing further.

### CRITICAL: false-positive count (freely available, directly measures precision)
Both test subjects married exactly once, in June 2006. Therefore EVERY
other candidate window the method flags for them is, by definition, a
false positive — a period the method says was marriage-favorable where
no marriage occurred. Report this explicitly for each chart: total
candidate windows found, minus the one true positive, equals the false
positive count. A method producing 1 true positive and 15 false
positives is not useful, even though it "found" the right answer.

### CRITICAL: baseline control test (guards against a new floodlight)
Jupiter completes a full zodiac cycle in roughly 12 years, so it
necessarily transits through or aspects any given natal point on a
regular, predictable schedule regardless of whose chart it is. This
means SOME number of "hits" is guaranteed by orbital mechanics alone,
not by anything meaningful about the person.

To establish whether the result is genuinely discriminating, run the
SAME transit rules against 3-5 randomly-generated control charts
(different birth dates, times, and locations — any plausible values)
across the same ~30-year span, and report the average candidate-window
count those controls produce. Then compare:
- If the two real charts produce roughly the SAME number of candidate windows as random control charts, the method is not discriminating — it's detecting Jupiter's orbit, not anything about the person. Say this plainly.
- If the real charts produce meaningfully fewer/more concentrated windows than controls, that's a genuine signal worth reporting.

This control test is not optional — without it, a "promising" candidate
count cannot be distinguished from orbital mechanics producing the same
count for everyone.

---

## PART 3: HONEST VERDICT AND COST ASSESSMENT

Report plainly:
1. Does transit-based timing genuinely discriminate better than the four natal-only methods already tested? Give the real comparison numbers.
2. What is the real computational cost of running this per user query (measured, not estimated)? Is it fast enough for a live chat response, or would it need pre-computation/caching?
3. If it works: what would be required to make this a real, user-facing feature (UI, integration with the chat, caching, testing against more charts)?
4. If it doesn't work: state that clearly, and note that the honest conclusion from all approaches tested (four natal-only + this transit method) is that precise event timing should not be attempted, and the chat should stay at the level of broad themes.

## WHAT NOT TO DO

- Do not build any user-facing feature in this session — computation and validation only
- Do not adjust the grading criteria after seeing results to produce a better-looking outcome
- Do not report success if the candidate count is too large to be useful, even if June 2006 appears somewhere in the list
- Do not overstate what two charts can establish
- Do not merge or deploy anything
