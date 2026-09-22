# BornClock — Part V: Homepage Content Redesign (Final Copy + Sequence)
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

Part U already restructured the navigation into four categories and did
an initial homepage regroup (Phase 0 mapping, hero rewrite, "choose
your path" cards, category-grouped sections, the hard link-preservation
rule). This session refines that work with FINAL, specific content
decisions made after extensive review — updated card copy, a specific
category sequence backed by cognitive-psychology research, and full
preservation of every real existing section.

**The person needs to see the ACTUAL, COMPLETE, real homepage on
staging after this change — not a partial view.** Every one of the
~19 existing homepage sections (BentoGrid, BirthdayReportShowcase,
Planetary Weight Teaser, EEAT Trust Section, "Explore BornClock,"
"More Ways to Know Yourself," Science cards row, Featured Celebrities,
"The science behind BornClock," Testimonials, FAQ, Articles, Popular
Questions, AuthorBio, Footer) must still be present and reachable —
this is a refinement of Part U's regrouping, not a new rebuild, and
the same hard rule applies.

**The person does not read code.** Final summary must include full
real screenshots of the ENTIRE homepage, top to bottom, not partial
sections — the previous session's screenshots were flagged as
insufficient for exactly this reason.

Standing requirements apply: Phase 0 dependency check against Part U's
current state, full positive/negative/edge testing, Playwright
throughout, mimic-manual-testing phase, full regression at the end,
staging only.

---

## THE HARD RULE (unchanged from Part U, restated)

Every existing route/URL must be preserved. Every existing homepage
section and internal link must remain present and reachable. This
session changes CONTENT (copy, sequence, grouping refinement) within
Part U's existing structure — it does not remove any section.

---

## PHASE 0: VERIFY PART U'S ACTUAL CURRENT STATE FIRST

Before applying any changes, confirm what Part U actually shipped —
do not assume. Read the current `Navigation.tsx` and `Index.tsx`
directly and document in `docs/part-v-before-state.md`:
- The actual current category order in the nav dropdowns and the homepage "choose your path" section (compare against Part 1's target sequence below — only reorder what's actually different).
- The actual current copy on each of the four "choose your path" cards (compare against Part 2's finalized copy below — only rewrite what's actually different).
- Whether a positioning statement document exists anywhere in `docs/` (search for it explicitly — check filenames containing "positioning"). If found, use its exact language for the Vedic Astrology block's verification note. If genuinely not found after a real search, do NOT silently skip this — flag it in `docs/part-v-flags.md` and use the language given directly in Part 3 below as the fallback, noting that the source document wasn't located.

---

## PART 1: FINAL CATEGORY SEQUENCE (research-backed, specific)

Per the serial position effect (primacy/recency research — people
recall the first and last items in a sequence far better than the
middle ones), use this EXACT order everywhere a category sequence
appears (nav dropdown order, "choose your path" cards, and the grouped
homepage section order):

1. Vedic Astrology (first — primacy position, your most differentiated asset)
2. Birthday Fun & Celebrity Twins
3. Mystic Corner
4. Science & Longevity (last — recency position, closes on your most evidence-based content)

Apply this order consistently in Navigation.tsx's dropdown groups AND
in the homepage's "choose your path" section AND in the order the
grouped content blocks appear on the page. If Part U left these in a
different order, update them now to this final sequence.

---

## PART 2: FINAL CARD COPY — "CHOOSE YOUR PATH" SECTION

Update the four category cards to this exact, finalized copy (adjust
minor phrasing only for length/technical constraints, but preserve the
core claims and honest framing exactly):

Vedic Astrology card:
- Featured item: Free Kundali
- Headline: "Your real birth chart"
- Subtext: "The depth of a professional reading, backed by verified accuracy."

Birthday Fun & Celebrity Twins card:
- Featured item: Age Calculator
- Headline: "1.1 billion heartbeats" (or the real, live-computed equivalent for a representative age — this should use the SAME live-counting mechanic already present in the existing Age Calculator card, not a static number)
- Show the age in years as a supporting stat

Mystic Corner card:
- Featured item: Numerology
- Headline: "Life Path [N]" using a representative example, styled consistently with the existing Numerology card's number display

Science & Longevity card:
- Featured item: Life Expectancy
- Headline: "See what adds or costs you years"
- Supporting stat: the estimated years figure, styled consistently with the existing Life Expectancy card's colored gradient bar
- Include the sourcing/limitation line: "Sourced from UN, WHO & GBD data — an estimate, not a guarantee." This must be visible on this card, not just deeper in the page — per the near-universal pattern found across every real competitor life-expectancy tool researched, and per the Stanford Web Credibility Project finding that sourcing/limitation transparency matters more than visual polish for health-adjacent content specifically.

Important accuracy note: Do NOT use the phrase "cross-checked against 2 independent platforms" or similar specific-count validation language on the Vedic Astrology card — this was explicitly reviewed and rejected as confusing, thin-sounding copy. Use the "depth of a professional reading, backed by verified accuracy" framing instead, which is the finalized, approved language.

---

## PART 3: FULL HOMEPAGE ASSEMBLY — EVERY REAL SECTION, IN ORDER

Reorganize the homepage into this structure, preserving every existing
section's actual content:

1. Hero (Part U's copy, unchanged from that session)
2. "Choose your path" — 4 cards, in the Part 1 sequence, with Part 2's finalized copy
3. Vedic Astrology block — this was flagged as a genuine content gap in Part U (no Vedic content existed on the homepage before). Build real, substantive content here now: a preview card for Free Kundali, Kundali Matching, and Ask an Astrologer, matching the visual style of the existing BentoGrid cards. Include a brief note on real verification/accuracy, consistent with the finalized positioning statement (if a positioning document exists in the repo docs, use its exact language).
4. Birthday Fun & Celebrity Twins block — group the EXISTING BentoGrid, BirthdayReportShowcase, Planetary Weight Teaser, and Featured Celebrities sections here, in their current internal form, under this heading.
5. Mystic Corner block — group the existing Numerology and Zodiac-adjacent content here (check Phase 0 for exactly which existing cards/sections fit, per Part U's original item-to-category mapping).
6. Science & Longevity block — group the existing "Science cards row," "More Ways to Know Yourself," EEAT Trust Section, and "science behind BornClock" sections here, under this heading, with the sourcing/limitation framing prominent.
7. Universal closing sections, unchanged, in current relative order: Testimonials, FAQ, Articles, Popular Questions, AuthorBio, Footer.

---

## PART 4: TESTING

- Re-run the literal link-preservation diff from Part U's methodology — confirm zero links lost through this content refinement.
- Positive: verify the exact new sequence renders correctly (Vedic first, Science last) in both the nav dropdowns and the homepage "choose your path" section.
- Positive: verify the finalized card copy renders exactly as specified in Part 2.
- Positive: verify the live/dynamic elements (age counter, life expectancy estimate) still function correctly within the new card designs — this is real computed data, not static text, and must remain accurate.
- Negative/edge: confirm the new Vedic Astrology homepage block gracefully handles a user with no saved profile (should not attempt to show personalized data, should show the general feature preview).
- Accessibility check: confirm each category's color-coding is not the ONLY way the category is distinguished — category names must also be present as real text (not just conveyed by color), icons decorative to screen readers must be properly marked, and any live/dynamic stat (age counter, life expectancy figure) must have appropriate labels for assistive technology, consistent with the basic accessibility check already established in Part T's forensic audit.
- Playwright: screenshot the ENTIRE homepage, full page, top to bottom, in one continuous capture or a clearly-ordered sequence of captures covering every single section — this is the primary deliverable. Also screenshot the same at 3 real breakpoints (narrow phone, tablet, phone-landscape) per Part U's established testing pattern.
- Full regression suite, confirm zero unexpected regressions, using the same "expected test updates vs. genuine regressions" distinction established in Part U.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: scroll through the entire real homepage as a first-time visitor, confirm the new sequence and grouping feel coherent end to end, not just in the "choose your path" section alone.
- Adversarial: check that the sourcing/limitation text on the Science card is not truncated, hidden, or removed at any tested viewport width.
- Honest self-critique: does the complete, real page — not just the top section — now feel like a genuinely differentiated, trustworthy, well-organized product? Does the new Vedic Astrology homepage block feel substantive, or thin compared to the well-established BentoGrid content? Give a real, critical assessment.

---

## FULL REGRESSION + FINAL CHECKPOINT

Final plain-language summary must include: the complete, full-page
screenshots (described in enough detail that the person understands
exactly what's visible at every point in the scroll, not just the top),
confirmation of the exact final sequence and copy, the link-preservation
diff, test counts, and anything flagged for review. Do not summarize
only the top section — the person has explicitly said a partial view is
not acceptable.

## WHAT NOT TO DO

- Do not remove or fail to preserve any existing section or link
- Do not use "cross-checked against 2 independent platforms" language — use the finalized "depth of a professional reading" copy instead
- Do not present only the top-of-page in screenshots — full page, every section, required
- Do not merge or deploy to production — staging only
- Do not report this as done without full-page real screenshots
