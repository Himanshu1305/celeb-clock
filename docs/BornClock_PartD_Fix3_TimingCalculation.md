# BornClock — Part D-Fix3: Real Yoga-Activation Timing
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

Prior sessions (D, D-Fix, D-Fix2, G) built specificity, accuracy, warmth,
decisive-but-bounded analysis, and graded Yoga detection. The person has
now tested it again with real, harder questions — "when will my Dhana
Yoga start," "when will I get rich," "when will I get a job," "when will
I get married" — and found the system still fails, because **it has
never computed WHEN a chart-based promise activates, only THAT it
exists.**

**This session builds real, new computation — not better writing.** The
underlying data (the full Vimshottari Dasha/Antardasha timeline, already
validated 100% in Part B; the Yoga detection engine with its
participating planets, already validated in Part G) already contains
everything needed to compute real activation windows. This has not been
built yet.

**The person running this session does not read code.** All
verification must come back as real, readable examples — actual
computed date ranges for real charts, actual reading/chat text, not
just "implemented."

### The exact standard to hit — read carefully, this is a real line, not hedging

**Target (what to build):**
> "Your Dhana Yoga is formed by your 2nd house lord Jupiter and 11th
> house lord Mercury. Classical timing indicates a Yoga activates most
> strongly during the Mahadasha or Antardasha of a planet directly
> involved in it. Your Jupiter Antardasha runs from March 2027 to
> August 2028, and your Mercury Antardasha runs from September 2029 to
> January 2031 — these two windows are your strongest periods for this
> Yoga's financial promise to manifest, according to classical timing
> principles."

This is decisive, specific, computed from real data, uses real classical
timing logic, and gives an actual actionable window (with real dates
from THIS person's real Dasha timeline) — while being honest that it's
describing when classical principles indicate likelihood is highest,
not manufacturing false certainty about a single guaranteed date. This
is not a hedge — this is what a rigorous, evidence-based answer to
"when" actually looks like, and it is the target for this whole session.

**Not acceptable (too vague, the current failure):**
> "Right now, you're in a period well-suited to nurturing this
> potential."

**Also not acceptable (false certainty, explicitly still rejected):**
> "You will become rich in March 2027."

---

## SESSION STRUCTURE — SEQUENTIAL PARTS, COMMIT AFTER EACH PASSES

This session covers two genuinely different kinds of work: new timing-
calculation logic (Parts 1-2), and a safety-sensitive live chat feature
citing real dates about someone's life (Part 3). Treat these as
sequential, independently-verified stages, not one continuous block:

**Commit after each part completes AND its own tests pass** — Part 1-2
(research + activation-window calculator, fully tested) gets committed
before Part 3 (readings + chat integration) begins. Part 3's readings-
citation and chat-citation pieces should also be committed separately
if useful. This ensures the calculation engine is locked in, verified,
and safe on its own before the chat-safety work begins — the chat work
must get the same unhurried rigor Part F's original guardrails
received, and must not be compressed just because it comes later in a
long session. If Part 3 needs substantially more time/care than
expected, that is fine — it is not competing with Part 1-2 for a shared
deadline, since Part 1-2 is already committed and done. Continue to
stop and flag any real scope surprise, the same as every previous
session.

---

## PHASE 0: MAP DEPENDENCIES BEFORE BUILDING

Before Part 1's research, briefly confirm and document (in the final
summary, a full separate file isn't necessary for a change this
contained, but be explicit):

- Where exactly does Part B's validated Dasha timeline live, and what is its exact output shape (function name, return type/fields) — confirm you're importing and reusing the real validated logic, not recomputing anything independently.
- Where exactly does Part G's Yoga detection engine live, and what is its exact output shape (which fields identify a Yoga's participating planets) — confirm this is directly usable as input to the activation-window calculator without needing to guess at its structure.
- Confirm whether the full-lifetime Dasha timeline (birth to ~100+ years) is already computed and available somewhere, or whether this session needs to extend the existing Dasha calculation to cover that full range (if the existing implementation only computes a few cycles ahead, as an example, this could be a real, separate piece of work worth flagging).

If either dependency's actual shape differs meaningfully from what this
prompt assumes, adapt accordingly and note the difference in the final
summary — do not silently guess if something doesn't match.

---

## PART 1: RESEARCH THE REAL CLASSICAL TIMING RULES

Before building anything, research and document (same rigor as the
Kaal Sarp/Mangal Dosha/Yoga conventions researched in prior sessions):

1. **The core Dasha-activation principle**: a Yoga/promise tends to manifest during the Mahadasha and/or Antardasha of a planet that is directly involved in forming it (as a participating planet, as a house lord connected to it, or — for some traditions — a planet that aspects it). Verify this against multiple independent sources.
2. **Antardasha vs. Mahadasha weight**: research whether classical sources treat Mahadasha-level activation as stronger/more likely than Antardasha-level, or the reverse, or whether both matter roughly equally with Antardasha giving more precise timing within a broader Mahadasha "supportive window."
3. **Multiple qualifying periods**: a person's life may have several Mahadasha/Antardasha combinations that qualify as activation windows for a given Yoga across their full timeline (birth to ~100+ years). Research whether classical practice emphasizes the NEXT upcoming qualifying window, or ALL qualifying windows across the lifetime, or specifically ones during commonly-relevant life-stage ages (e.g., timing marriage-related Yogas has different typical age-relevance than timing career Yogas) — document what's found, and if genuinely mixed practice exists across sources, document that honestly (same "flag genuine disagreement" discipline as the Yoga session).
4. **Also research the classical approach to the exact three life-question categories the person named**: wealth timing (Dhana Yoga/2nd-11th house lord periods), career/job timing (10th house lord periods, career-relevant Yogas), and marriage timing (7th house lord periods, Venus/Jupiter periods depending on gender per some traditions — research whether this gendered convention is still standard or considered outdated, and make a considered, documented choice either way).

---

## PART 2: BUILD THE ACTIVATION-WINDOW CALCULATOR

Using the research from Part 1 and the already-validated Dasha timeline
+ Yoga detection engine:

1. For each detected Yoga (from Part G), identify its participating planets and relevant house lords.
2. Compute the FULL Dasha/Antardasha timeline for the person's whole life (or a reasonable span, e.g., birth to 100 years, matching whatever range the existing Dasha calculation already supports).
3. Identify every Mahadasha/Antardasha period ruled by a participating planet — these are the "activation windows."
4. For each window, output: the planet, the exact date range (from the already-validated real Dasha calculation — this must be 100% accurate, reusing the same validated engine, not a new approximate calculation), and whether it's a Mahadasha-level or Antardasha-level window (and therefore its relative strength per Part 1's research).
5. Also build the same logic for the three specific categories named by the person: wealth timing, career/job timing, marriage timing — even where no specific named Yoga is present, these can be computed from the relevant house lords' Dasha periods per Part 1.4's research.
6. Sort/prioritize: when multiple windows exist across a lifetime, the NEXT upcoming window (relative to today's date) should be given primary emphasis in any reading/chat response, with other windows available as secondary detail — since "when will this happen" from a real person is almost always asking about their near-to-medium-term future, not their entire life history.

### Handling the case where no clear window exists soon
If a person's next qualifying window is many years away, or if they're currently past all major qualifying windows for a given theme, the system must state this honestly (e.g., "your strongest classical window for this already occurred during your Jupiter Mahadasha from [past dates]; based on your current chart, the next comparably strong window begins in [X years]") rather than forcing an artificially soon-sounding answer to seem more satisfying. This is a real hallucination-adjacent risk — inventing an appealing-sounding "soon" timeframe that doesn't match the real computed data — and must be caught by the accuracy checker (Part 4).

---

## PART 3: INTEGRATE INTO READINGS AND THE ASTROLOGER CHAT

- Update the "Right now for you" and Money/Career/Relationships reading sections (per D-Fix2's method) to cite the actual computed activation window(s) when relevant, using real dates/date-ranges — not just naming the Yoga, but stating WHEN it activates, per the target example in the context section above.
- Update the Part F astrologer chat: when a user asks a timing question ("when will I get rich," "when will my Dhana Yoga start," "when will I get married," "when will I get a job"), the response must use this new activation-window calculation and cite REAL computed dates from the person's actual chart — this directly fixes the exact failure the person just experienced.
- This chat integration was previously deferred (see `docs/part-g-chat-followup.md` for the earlier Yoga-citation deferral) — this session specifically DOES build chat-side timing citation, because it's the exact thing the person just asked for directly. Build the chat-side accuracy guard for this (Part 4) with the same rigor Part F's original guardrails received — do not skip this because it was previously deferred; this session explicitly picks it back up for the timing-question use case specifically.

---

## PART 3.5: CACHE STALENESS — A REAL, TIME-DEPENDENT BUG RISK

This is a genuinely important, non-obvious issue this feature
introduces: readings and chat context are cached per chart, but WHICH
Dasha/Antardasha period is "current" or "next upcoming" changes as real
time passes, independent of the birth chart itself. A reading generated
and cached today correctly says "your next window starts in March 2027"
— but if that same cached reading is still being served in, say,
mid-2027, the "next window" framing would be stale or wrong even though
the underlying date range itself doesn't change.

Handle this explicitly:
1. Check how the existing reading cache (from Part D onward) determines when to regenerate vs. serve a cached result. Does it already account for time-sensitive fields like "current Dasha" (which was already a time-dependent field before this session, so this may already be handled — check, don't assume)?
2. If the existing cache invalidation does NOT already account for time passing (e.g., it only invalidates when input chart data changes, not when relevant dates arrive/pass), extend it: any cached reading or chat context containing "current" or "next upcoming" activation-window language must be considered stale and regenerated once the real current date crosses a relevant boundary (e.g., once a previously-"upcoming" window's start date has passed).
3. Test this directly: generate a reading, artificially advance the treated "current date" past a stated window's start date (or use a test chart where a window is very close to the real current date), and confirm the system serves updated, correct timing language rather than stale cached text.
4. Report plainly whether this was already handled by the existing cache logic (if "current Dasha" was already time-aware) or whether this session had to add new invalidation logic for it.

---

## PART 4: TESTING — ACCURACY ON DATES IS ABSOLUTELY CRITICAL

A wrong date is arguably worse than a vague answer — it's a specific,
checkable, confidently-stated claim about someone's real future,
computed from their real chart. This needs the same "zero tolerance"
standard as the existing hallucination checker, extended to dates:

1. Unit tests: for the reference chart and at least 3 other test charts, manually verify the FULL Dasha timeline is correctly computed (reuse Part B's already-100%-validated Dasha logic — do not recompute this independently, import and reuse it) and that the activation-window identification correctly picks out periods ruled by the right planets.
2. Extend the accuracy checker: any date/date-range cited in generated reading or chat text must be cross-checked against the actual computed activation windows for that exact chart — if the AI states a date that doesn't match a real computed window, that's a failure, retry, same zero-tolerance standard as existing checks.
3. Test the "no clear window exists soon" honest-fallback case explicitly — confirm the system doesn't fabricate a falsely-soon window to seem more satisfying.
4. Test all three named categories directly with the same phrasing the person used: "when will I get rich," "when will I get a job," "when will I get married" — for a chart where clear windows exist for each, confirm the response gives a real, specific, computed answer citing actual dates. Paste the actual response text for each.
5. Re-run the FULL existing test suite (specificity, accuracy, safety, D-Fix2 hard boundary on literal yes/no, Yoga detection, Yoga meanings) — confirm this new capability doesn't weaken any existing guardrail. Citing a real date range is not the same as making a "yes/no" guarantee — the D-Fix2 boundary (no "you will definitely...") must still hold even as dates become more specific. Confirm this explicitly with a test.
6. If anything fails and changes are made, re-run everything together again, not just the failing piece.

### Playwright E2E check for this addition
- Load the Kundali page for the reference chart (and, if feasible, a chart where a Yoga-timing citation appears in a life-area section) and screenshot the rendered reading — confirm the added date-range text displays fully and readably, no truncation or layout breakage from the additional length.
- Load the astrologer chat, ask one of the three timing questions, and screenshot the response — confirm it renders cleanly in the chat interface.

---

## PART 5: MIMIC-MANUAL-TESTING PHASE (standing requirement)

- **Exploratory**: ask the chat the timing question in several different real phrasings a person might actually type ("when's my Dhana Yoga gonna kick in," "will I be rich soon," "good time to start a business?") — confirm the system recognizes these as timing questions and responds with real computed windows, not just the ones using exact expected phrasing.
- **Adversarial**: ask for an impossibly precise answer ("give me the exact day I'll get rich") — confirm the system gives the real precision it actually has (a date range from the Dasha calculation) rather than either fabricating false day-level precision or retreating into vagueness.
- **Honest self-critique**: read 2-3 real generated timing answers fresh, as the skeptical user who raised this exact complaint would. Does this genuinely answer "when will X happen" in a way that would satisfy someone asking in real distress or real hope, or does it still feel like it's dodging the question? Do not soften this critique.

---

## FINAL CHECKPOINT — PLAIN-LANGUAGE SUMMARY REQUIRED

- The exact research findings from Part 1, including any genuine disagreement found and how it was resolved
- Real computed activation windows for the reference chart, pasted in full, for at least one Yoga and all three named life categories (wealth, career, marriage)
- The three named test questions ("when will I get rich," "when will I get a job," "when will I get married") with actual real response text pasted for each, run against the astrologer chat
- The accuracy check results for dates specifically — how many date claims checked, how many correct
- The "no clear window soon" honest-fallback test result, with actual text
- Confirmation the D-Fix2 hard boundary against literal yes/no still holds even with real dates now being cited
- Exact test counts before/after, zero regressions
- Your honest, critical assessment: does this now actually answer the kind of question a real person under real stress would ask, with real computed specificity? This is the standard the person has now asked for twice — be honest about whether it's met.

## WHAT NOT TO DO

- Do not state a single date as a guaranteed certainty ("you will get married on X date") — cite real computed date RANGES tied to real Dasha periods, explained as classical timing indicators, not manufactured guarantees
- Do not fabricate a falsely-soon or falsely-appealing timeframe when the real computed data doesn't support one
- Do not weaken the existing D-Fix2 boundary against literal yes/no predictions — specific dates and "yes/no" are different things; both boundaries must hold simultaneously
- Do not merge or deploy without being asked
- Do not report this as fixed without pasting real computed dates and real generated text for the exact three question types the person asked about
