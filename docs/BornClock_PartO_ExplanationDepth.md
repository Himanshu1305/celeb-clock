# BornClock — Part O: Explanation Depth + Data Check + Test Config
## Single Claude Code session prompt. Designed to run without the person's intervention.

---

## CONTEXT FOR CLAUDE CODE

The person tested the live Kundali page, the astrologer chat, and
Kundali Matching, and found a single recurring pattern across all
three: **every technical fact is stated correctly, but with only one
sentence of explanation where real astrology content and real
competitor products provide multiple dimensions of depth.** This is
confirmed by fresh research (see below) — this is not a request to
invent more content, it's a request to bring existing, accurate
computation up to the explanatory depth the underlying facts already
support.

**This session covers 3 items, run without stopping for the person's
input except where a genuine, real blocker requires it** (same
standing exception as every prior unattended session — document and
make the conservative choice, then continue, don't stall).

**The person does not read code.** Final summary must contain real,
readable before/after examples.

---

## RESEARCH FINDING THAT SHAPES THIS SESSION

Real astrology reference sources and real competitor products
consistently explain each concept across FOUR distinct dimensions, not
one sentence:
1. **What it is** (a clear, plain-language definition)
2. **Why it matters** (what area of life or the chart it actually governs)
3. **What it means for THIS specific person** (grounded in their real computed data — already a strength of this project, just needs more room)
4. **How it connects to other placements** (e.g., Lagna vs. Rashi work together; a Koota score's real-world implication alongside other Kootas)

Real competitor products explicitly cited as doing this well include
answers structured like: "Your chart suggests this question should be
answered through the 7th house, Venus, and the current dasha sequence
rather than a generic marriage forecast" — naming which specific chart
factors an answer draws from BEFORE giving the answer, not just
asserting a conclusion.

Apply this four-dimension structure consistently across all three items
below. This does NOT mean writing generic filler to pad length — every
added sentence must still be tied to real computed data for that
specific chart, same zero-tolerance accuracy standard as everything
already built in this project.

---

## ITEM 1: DEEPEN EXPLANATIONS — KUNDALI PAGE, CHAT, AND MATCHING

### 1.1 Kundali page (Lagna, Rashi, Nakshatra, Dasha, doshas, Yogas)

For each of these concepts as they currently appear (in the "Your chart,
interpreted" summary and throughout the personal reading sections),
expand using the four-dimension structure:
- Add a brief "what this actually is" framing the first time a concept is introduced (e.g., Lagna: not just naming it, but noting briefly what it governs — physical presence/personality/life direction — before diving into this person's specific Lagna).
- Explicitly connect Lagna and Rashi/Moon sign together where both are discussed (research confirms they're meant to be read together — outer self vs. inner self), rather than presenting them as two disconnected facts.
- For Nakshatra, include the deity/core quality/significance (reuse Part G's already-built Nakshatra meanings layer — this data likely already exists, just needs to be surfaced more fully in this context) rather than just naming the Nakshatra and pada.
- For Dasha periods, connect the current period to a concrete "what to expect / what this period tends to bring" framing already partially present — extend it with the "why" (which house/planet is active and what that governs) more fully.

### 1.2 Astrologer chat responses

Update the chat's response-generation prompt/instructions to structure
answers the way the research shows works best: name which specific
chart factors the answer will draw from BEFORE giving the substantive
answer (e.g., "This is best understood through your 7th house, Venus,
and your current Dasha period — here's what each tells us..."), then
give the grounded, decisive-but-bounded answer as already built in
D-Fix2/D-Fix3. This is a structural change to HOW answers are organized,
not a loosening of any existing safety/accuracy guardrail — all
existing rules (crisis, health, financial, D-Fix2 hard boundary, Yoga
accuracy checks) remain fully in force.

### 1.3 Kundali Matching — per-Koota depth

For each of the 8 Kootas, extend the current one-line explanation to
include (reusing already-computed real data, not inventing anything
new):
- The actual named category involved where relevant (e.g., for Tara Koota, name the actual Tara type per research — Janma/Sampat/Kshema/Sadhaka/Mitra/Parama Mitra as favorable, Vipat/Pratyari/Vadha as unfavorable — not just "auspicious/inauspicious").
- A brief note on what a strong vs. weak score in THIS specific Koota practically means for the relationship (e.g., Graha Maitri weak = "the mental/psychological rapport may take more conscious effort," already partially present in the synthesis section from Part M — extend this same quality into the individual Koota cards too, not just the overall synthesis).
- Keep the existing "high weight" emphasis on Nadi/Bhakoot and the existing calm, non-fear-based dosha framing fully intact.

### Testing for Item 1
- Positive: generate the Kundali page, a chat conversation, and a Matching report for the reference chart and at least one different chart — paste real before/after text for each of the three surfaces so the depth increase is directly visible.
- Accuracy: extend/re-run the existing zero-tolerance accuracy checkers across all three surfaces — every new sentence of explanation must still only state facts that match the real computed data. Report real numbers.
- Safety: re-run the full existing safety suite (crisis/health/financial/D-Fix2 boundary/Yoga accuracy) — confirm added depth doesn't weaken any guardrail.
- Playwright: screenshot the Kundali page and Matching report with the deepened content, confirm no layout breakage from the additional length (this project has hit this exact issue twice before — Part D-Fix and Part G both needed rendering fixes after adding length).
- Content-quality self-check: read the new explanations fresh — do they add real, specific value, or do they read as padding/filler? If any section reads as filler, revise it before considering this item done.

---

## ITEM 2: NAVAMSA MOON DATA-CONSISTENCY CHECK

The person's live testing found what looks like a possible inconsistency:
the "Deeper chart layers" narrative stated a specific Navamsa Moon sign
in prose, but the "Divisional highlights" line in the advanced view
showed a blank value for Navamsa Moon.

1. Reproduce this on the reference chart or the specific chart from the screenshot (Vrischika Lagna, Karka Rashi, Pushya Nakshatra pada 2, Venus/Saturn Dasha — reconstruct the birth details if needed, or use the reference chart if this reproduces there too).
2. Determine the root cause: is the narrative citing a real, correctly-computed value that the advanced-view display component simply fails to render (a display bug), or is there a genuine data mismatch between what the narrative-generation step receives and what the advanced-view step receives (a real data bug)?
3. Fix the actual root cause — if it's a display bug, fix the rendering; if it's a data pipeline mismatch, fix that, and add a test that would have caught this specific case (e.g., a test asserting the advanced-view's divisional highlights are never blank when the corresponding narrative text cites a specific value).
4. Verify the fix on the same chart, confirm the narrative and advanced view now agree.

---

## ITEM 9: PLAYWRIGHT CONFIG — STOP LOCAL-ONLY SPECS FROM RUNNING AGAINST STAGING

The launch-gauntlet/* and some prelaunch/* specs are designed to run
locally (against localhost:3001 and .env.local secrets) and will always
"fail" when the full suite is pointed at remote staging — this has been
correctly identified as environmental noise in Parts K and L, not a
real product issue, but it clutters every future triage.

1. Update the Playwright configuration so these local-only spec folders are excluded by default when running against a staging/remote target, and only run when explicitly targeting a local environment.
2. Confirm this doesn't accidentally exclude any test that SHOULD run against staging — check each excluded spec file's actual purpose before excluding it, don't exclude by folder name alone if a folder contains a mix.
3. Re-run the full suite against staging after this change and confirm the failure count drops by removing only genuine environmental noise, with no change to any real pass/fail result for tests that should run against staging.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite (unit + Playwright) after all three items.
Confirm exact before/after counts, zero regressions. Final plain-
language summary: real before/after examples for Item 1 across all
three surfaces, the Item 2 root-cause finding and fix confirmation, the
Item 9 before/after failure count, and anything flagged for the
person's review.

## WHAT NOT TO DO

- Do not weaken any existing safety/accuracy guardrail while deepening explanations
- Do not add generic filler text — every new sentence must tie to real computed data
- Do not exclude a Playwright spec from staging runs without confirming it genuinely shouldn't run there
- Do not merge or deploy without being asked
- Do not report any item as done without pasting real, specific before/after examples
