# BornClock — Part S: Merge, then Marriage Guardrails + Explanation Depth + Data Check + Account-Synced History
## Single Claude Code session prompt. Merge runs first as its own gated step. Feature work (Parts 2-6) only starts after the merge step reports a clean result.

---

## CONTEXT FOR CLAUDE CODE

This session closes out the remaining BornClock backlog. It has one
integration/merge step (Part 1) and five build items (2-6). The merge
runs FIRST, on its own, because it's the riskier and harder-to-undo
operation — bundling it under brand-new, untested feature work would
compound two different kinds of risk in one unattended run. Parts 2-6
then build on top of the clean, post-merge `develop` branch, so there
is no ambiguity about what base the new work sits on.

**The person does not read code.** Final summary must contain real,
readable before/after examples for every item, not just test counts.

**Standing rule, unchanged from every prior session:** do not merge
`develop` into `main`, and do not deploy to production, without being
asked. This session merges feature branches *into* `develop` only —
`main`/production stays untouched throughout.

---

## PART 1: Merge Parts B through R into `develop` — gated first step

### Hard stop conditions — read before starting
1. **Do not merge `develop` into `main`, and do not deploy to
   production, under any circumstance in this session.** Stop once
   `develop` is updated, tested, and deployed to staging, and report
   back for review before anything touches production.
2. **If any individual branch merge hits a real, non-trivial conflict**
   (not a clean fast-forward, not a mechanical/whitespace conflict) —
   **stop immediately, do not resolve it unattended.** Report exactly
   which branches conflict, on which files, and what the conflicting
   changes are, and wait. A judgment call on which of two real code
   changes should win, across this many stacked branches, on
   production-bound code, is not a call to make alone. Mechanical
   conflicts (e.g. two branches touching unrelated lines of the same
   file, import-order clashes) may be resolved normally — the stop
   condition is specifically for conflicts where two branches made
   real, substantive, competing changes to the same logic.

### What to do
1. Before merging anything, list every feature branch involved (B
   through R) with its last commit hash, so there's a clear rollback
   map. Confirm and record the current `develop` HEAD commit before
   starting.
2. Merge in original build order (the order the parts were built in)
   to minimize conflict surface — each part was built on top of the
   last, so a sequential merge should mostly be fast-forward, per the
   pattern already seen in this project (Part N era).
3. After each individual merge, run the full test suite and confirm
   no new regressions before merging the next branch. Report the real
   test count at each checkpoint, not just at the end.
4. Once all branches are merged into `develop` (or the process stops
   at a real conflict per the hard stop condition above), deploy
   `develop` to staging and run the complete regression suite
   (unit + Playwright) one final time.
5. Give a full plain-language report: what got merged, in what order,
   any conflicts and how they were resolved (or, if stopped, exactly
   where and why), the before/after test counts at every checkpoint,
   and the exact commit hash `develop` now points to.

### Explicit checkpoint before Part 2 starts
**Record the final post-merge `develop` commit hash here.** If Part 1
stopped early due to a real conflict, pause the whole session and
report back rather than building Parts 2-6 on an incomplete merge.

If Part 1 completed cleanly: create a single new branch, `part-s`,
off this confirmed post-merge `develop` HEAD (not off any pre-merge
branch or local working state). All of Parts 2-6 below happen on this
one `part-s` branch — same discipline as every prior part (B through
R): isolated branch, tested and deployed to staging on its own, and
left unmerged. Do NOT merge `part-s` into `develop` at the end of this
session — that merge is a separate, explicit decision for the person
to make after reviewing the work, exactly like every other part.

### Testing for Part 1
- Full test suite before the first merge (baseline), after each
  individual branch merge, and after the final staging deploy —
  report real numbers at every checkpoint.
- Confirm the live staging site (all features from Parts B-R) works
  end-to-end after the merge — the same kind of whole-journey
  walkthrough used for earlier integration merges.

---

## PART 2: Tense-aware marriage/relationship timing windows

### Background
The astrologer chat currently answers "when will/did I get married"
with a single window (or set of windows) at the Mahadasha level,
regardless of whether the question is past or future tense, and
regardless of the real server date relative to those windows. This
is imprecise in two ways: (a) windows should be computed at the
**Antardasha level**, not Mahadasha level — the classical
significator is Venus (as 7th-lord and/or occupant of the 7th house)
and its Antardasha sub-periods give real, checkably short windows
(months to a few years), not decade-spanning Mahadasha windows; (b)
the chat has no concept of "past" vs "future" relative to today's
real date, so a past-tense question can surface a future window and
vice versa.

### What to build
1. Detect question tense from the person's phrasing ("when did I get
   married" = past; "when will I get married" = future; ambiguous
   phrasing defaults to showing both, clearly labeled).
2. Compute the real Antardasha-level windows for the classical
   marriage significators (7th-lord, Venus, Venus occupying the 7th
   house, Jupiter as a secondary significator where applicable) using
   the existing validated Vimshottari engine — no new astronomy
   needed, just querying at the Antardasha level instead of Mahadasha.
3. Filter windows against the real current server date:
   - Past-tense question -> show only windows that have fully ended.
   - Future-tense question -> show only windows starting after today.
   - If today's date falls inside a qualifying window -> say so
     explicitly ("you're in one right now, running until [date]").
   - No qualifying windows in the requested direction -> say so
     honestly rather than omitting the answer silently (e.g. "you
     haven't yet passed through a significant Venus period, which is
     worth knowing in itself" for a past-tense question with none
     in the past).
4. Response framing (use verbatim structure, adapt wording only):
   - "Astrology can't pinpoint a specific date for a past event —
     I'd rather be straight with you than guess. What your chart
     shows is which shorter periods carry the strongest relationship
     significance..." followed by the filtered list of real windows,
     then "If your marriage falls in one of those, that's the
     classical pattern holding. If not, that's worth knowing too —
     I won't invent an explanation to make it fit afterward."
   - For future-tense: "Your upcoming [planet] sub-period runs
     [dates] — traditionally your next significant relationship
     window. Classical astrology treats this as a period of heightened
     possibility, not a guarantee."

### Testing for Part 2
- Verify against the two real test charts already used (himanshu's
  saved chart: 1978-05-13, Jammu; and the second chart: 1981-07-09,
  Patna — both married June 2006). Paste the real windows returned
  for both.
- Test past-tense phrasing, future-tense phrasing, and ambiguous
  phrasing ("tell me about my marriage timing") on both charts.
- Test a chart with no qualifying past windows (e.g. someone young)
  and confirm the honest "haven't yet passed through" message fires
  instead of an empty or broken response.
- Test a chart where today's date falls inside a qualifying window
  and confirm the "ongoing" framing fires correctly.
- Note: per the Part AB transit-timing research (rejected — see
  docs/rejected-approaches/ if relocated), do NOT attempt to validate
  these windows against "does it catch the real June 2006 event" as a
  pass/fail bar — that standard has already been shown unreachable by
  any tested method. The bar here is honest framing and correct
  tense/date filtering, not event-matching accuracy.

---

## PART 3: Already-married / multiple-marriage-yoga guardrail

### Background
If someone's phrasing implies they are already married (a past-tense
question, or explicit statement), the chat must never unprompted
surface a future relationship window in a way that reads as "you'll
marry again," and must never volunteer a classical multiple-marriage
combination. This is a real potential-harm case (unprompted, it could
cause real distress to someone in a stable marriage), not just a UX
polish item — treat it with the same seriousness as the existing
crisis/health/financial guardrails (D-Fix2).

### What to build
1. When a question's phrasing implies the person is already married
   (explicit past-tense marriage question, or an explicit statement
   like "my wife/husband and I..."), the chat must:
   - Show only past windows (per Part 2's logic) and stop there.
   - Never append a future window.
   - Never mention a multiple-marriage combination unprompted, even
     if the chart carries one.
2. If the person explicitly asks a direct question implying they want
   this information ("does my chart show a second marriage?", "am I
   likely to marry again?"), answer honestly but carefully:
   - Name the classical combination present, if any.
   - Explicitly frame it as traditional interpretation with no
     predictive evidence behind it (consistent with the research
     finding that no available technique reliably predicts specific
     events).
   - Never frame it as a prediction about their *current* relationship
     ending.
   - Never frame a future Venus/7th-lord window as "your next
     marriage" for someone already married — frame it only as "a
     relationship-significant period" in general, if it must be
     mentioned at all in that context.
3. Add this as an explicit rule in the chat's system prompt/response
   instructions, at the same priority level as the existing crisis/
   health/financial hard boundaries — not as a soft suggestion.

### Testing for Part 3
- Adversarial test: ask "when did I get married" on a chart that has
  a real future Venus/7th-lord window remaining — confirm the future
  window is NOT shown.
- Adversarial test: same chart, explicitly ask "will I marry again?"
  or "does my chart show a second marriage?" — confirm an honest,
  carefully-framed answer is given, including the "no predictive
  evidence" caveat.
- Confirm a chart with a genuine classical multiple-marriage
  combination (research and construct or identify one) is never
  volunteered when the question doesn't ask for it directly.
- Re-run the full existing safety suite (crisis/health/financial/
  D-Fix2 boundary) to confirm this addition doesn't interact badly
  with any existing guardrail.

---

## PART 4: Explanation depth — Kundali page, chat responses, Matching per-Koota

### Background (confirmed by prior research)
Real astrology reference content and real competitor products
consistently explain each concept across four distinct dimensions —
what it is, why it matters, what it means for this specific person,
and how it connects to other placements. BornClock currently gives
roughly one sentence per concept across three surfaces. This is
directly threatening trust and retention — not a research gap, a
well-precedented content-depth fix.

### 4.1 Kundali page
For Lagna, Rashi, Nakshatra, Dasha periods, and Doshas: extend each
from one sentence to the four-dimension structure above, reusing
already-computed real data (the Nakshatra meanings layer, the Dasha
engine, the Dosha detection) — do not invent new data. For Nakshatra
specifically, surface the deity/core quality/significance that
already exists in the data layer. For Dasha periods, extend the
existing "what to expect" framing with the "why" (which house/planet
is active and what it governs).

### 4.2 Astrologer chat responses
Update the response-generation prompt so answers name which specific
chart factors the answer draws from BEFORE giving the substantive
answer (e.g., "This is best understood through your 7th house, Venus,
and your current Dasha period — here's what each tells us..."), then
give the grounded, decisive-but-bounded answer as already built. This
is a structural reorganization, not a loosening of any existing
guardrail — all existing rules (crisis, health, financial, D-Fix2
boundary, Yoga accuracy checks, and the new Part 2/Part 3 marriage
rules above) remain fully in force.

### 4.3 Kundali Matching — per-Koota depth
For each of the 8 Kootas, extend the current one-line explanation to
include: the actual named category where relevant (e.g. for Tara
Koota, name the real Tara type — Janma/Sampat/Kshema/Sadhaka/Mitra/
Parama Mitra as favorable, Vipat/Pratyari/Vadha as unfavorable — not
just "auspicious/inauspicious"); and a brief note on what a strong vs.
weak score in that specific Koota practically means for the
relationship (extend the tone already used in the overall synthesis
section into the individual Koota cards). Keep the existing "high
weight" emphasis on Nadi/Bhakoot and the existing calm, non-fear-based
dosha framing fully intact.

### Testing for Part 4
- Positive: generate the Kundali page, a chat conversation, and a
  Matching report for the reference chart and at least one different
  chart — paste real before/after text for each of the three surfaces.
- Accuracy: re-run the existing zero-tolerance accuracy checkers
  across all three surfaces — every new sentence must only state
  facts matching the real computed data. Report real numbers.
- Safety: re-run the full existing safety suite — confirm added depth
  doesn't weaken any guardrail, including the new Part 2/3 rules.

---

## PART 5: Navamsa Moon data-consistency check

### Background
On the live Kundali page, the narrative text claimed a specific
Navamsa Moon sign ("Navamsa Moon is positioned in Kanya"), but the
advanced view's "Divisional highlights" field showed blank
(`Navamsa (D9) Moon: ;`). This needs a direct check, not an assumption.

### What to do
1. Trace both the narrative-generation code path and the advanced-view
   display code path back to the same underlying D9 calculation for
   the reference chart's Moon.
2. Determine which is correct: either the narrative is citing a
   real, correctly-computed value that the advanced-view display is
   failing to render (a display bug), or there's a genuine mismatch
   between what the AI-generated narrative said and what's actually
   stored (a generation/hallucination bug).
3. Fix the actual root cause found — do not paper over the symptom.
4. Re-check a second real chart's Navamsa Moon field to confirm the
   fix is general, not specific to the reference chart.

### Testing for Part 5
- Paste the real D9 Moon value from the underlying calculation, the
  narrative text, and the advanced-view display, for both charts,
  before and after the fix — all three must agree.

---

## PART 6: Account-synced reading history

### Background
Account-level saved-profile sync already exists (a logged-in user's
saved birth profile follows them across devices, with an existing
conflict-resolution pattern: account wins by default, but a one-tap
notice lets the user switch to the current device's version instead
of a silent overwrite). Reading history (past Kundali readings, chat
conversations, Matching reports generated) is currently device-local
only, by design at the time — this session extends the same sync
pattern to reading history.

### What to build
1. Sync a logged-in user's reading history (Kundali readings, saved
   chat conversations, generated Matching reports) to their account,
   following them across devices — same as the existing profile sync.
2. Anonymous users keep device-only history, unchanged.
3. Apply the same conflict-resolution pattern as the profile sync: on
   a device-vs-account conflict, the account's history is
   authoritative by default, with a clear, non-destructive way to
   see/keep device-only history that hasn't synced yet (never a
   silent overwrite or silent data loss).
4. Confirm this doesn't interact badly with admin-bypass testing
   identities — heavy testing under a shared testing account (e.g.
   hello@bornclock.com) should not pollute a real user's reading
   history, and vice versa.

### Testing for Part 6
- Live two-client round-trip test, the same way profile sync was
  proved: generate a reading on device/browser A while logged in,
  confirm it appears on device/browser B under the same account.
- Confirm anonymous (not-logged-in) reading history stays device-local
  and is unaffected.
- Confirm the conflict-resolution UI/notice fires correctly on a real
  device-vs-account mismatch, and that no history is silently lost.

---

## RESOURCE SAFETY NET (applies to Parts 2-6)

If any single item gets stuck for an extended period, stop, document
it plainly in `docs/part-s-flags.md`, and move on to the next item
rather than stalling the whole session on one unresolved item. A
partially-complete batch with clean, working, committed items is a
far better outcome than a stalled session. This does not apply to
Part 1's hard stop conditions above, which are deliberate stops, not
stalls.

---

## FULL REGRESSION + FINAL CHECKPOINT

After Part 1's merge is complete and deployed to staging, and after
all of Parts 2-6 are committed on the `part-s` branch, deploy `part-s`
to staging separately and run the complete test suite (unit +
Playwright) against it. Confirm exact before/after counts, zero
unexplained regressions. Final plain-language summary must include:
the Part 1 merge report in full (branch list, order, conflicts or
stop point, final `develop` commit hash, staging verification), the
`part-s` branch name and its own commit hash, and real before/after
examples for Parts 2-6 (each on at least the two real test charts
already used) including the Part 5 root-cause finding and fix
confirmation. State plainly that `part-s` is left unmerged, awaiting
review.

---

## WHAT NOT TO DO

- Do not build any of Parts 2-6 anywhere other than the single new
  `part-s` branch, created off the confirmed post-merge `develop`
  HEAD from Part 1.
- Do not merge `part-s` into `develop` — leave it unmerged for the
  person's review, same as every other part.
- Do not resolve a real, non-trivial merge conflict unattended in
  Part 1 — stop and report per the hard stop condition.
- Do not weaken any existing safety/accuracy guardrail (crisis,
  health, financial, D-Fix2 boundary, Yoga accuracy, or the new
  Part 2/3 marriage rules) while doing any of this work.
- Do not add generic filler text in Part 4 — every new sentence must
  tie to real computed data.
- Do not merge `develop` into `main`, and do not deploy to production,
  under any circumstance — stop after `develop` is staged and report
  back.
- Do not report any item as done without pasting real, specific
  before/after examples.
- Do not volunteer a multiple-marriage combination or a future
  relationship window to an already-married person's phrasing, per
  Part 3 — this is a hard rule, not a style preference.
