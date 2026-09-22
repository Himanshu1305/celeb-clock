# BornClock — Part X: Impact-First Kundali Reading Rewrite
## Single Claude Code session prompt.

---

## SESSION STRUCTURE — FOUR DISTINCT PARTS, SEQUENTIAL, SEPARATE COMMITS

This is now a large, combined session covering four genuinely distinct
pieces of work: Part X (Kundali reading rewrite), and Parts Y, Z, AA
(three new landing pages, reusing Part W's proven template). Given the
real size of this combined session, follow this discipline strictly:

- **Start with a brief combined dependency check**: before Part X begins, confirm whether the Kundali reading page and the four category landing pages (Vedic Astrology from Part W, plus Y/Z/AA here) share any common components (e.g., a shared "tool card" style, a shared hero component) that could be affected by changes in more than one part of this session. If shared components exist, note this in `docs/part-x-flags.md` and take extra care that a change made for Part X's purposes doesn't silently break Y/Z/AA's use of the same component, or vice versa — re-test the other parts' pages if a shared component is touched.
- Complete Part X FULLY (including all its testing) and commit before starting Part Y.
- Complete each of Parts Y, Z, AA fully and commit separately before starting the next.
- If at any point a genuine, real blocker or scope surprise is found in any part, stop that part, document it clearly in `docs/part-x-flags.md`, and move to the next part rather than letting one blocked item stall the entire session — same standing discipline as every large session in this project.
- Do not let time pressure from covering four parts cause any part's testing or the mimic-manual-testing phase to be shortened — each part gets its full, real testing regardless of how long the overall session runs.
- **Honest scope fallback**: if, after completing Part X properly with full testing, the remaining time/complexity genuinely doesn't allow the same full-quality treatment for all three landing pages, it is better to complete Part X and as many of Y/Z/AA as can be done properly (in the order Y, then Z, then AA) than to rush all three and compromise their quality or testing. If this happens, state plainly in the final summary which parts were completed to full standard and which were deferred, and why — do not silently cut corners to appear to finish everything.
- **After deploying any part to staging, explicitly verify staging is actually serving the new code** (e.g., check that a new/changed element is genuinely visible via a real request, not just that the deploy command reported success) — this project has previously hit a real issue where a "successful" deploy did not actually update what staging served, due to Cloudflare edge caching. If this happens again, the fix is to note it clearly and ask the person to purge the Cloudflare cache (the same fix used successfully before), rather than assuming the deploy worked based on the command's exit status alone.

---

## CONTEXT FOR CLAUDE CODE

Real user testing found the Kundali reading — despite extensive prior
accuracy and specificity work (D-Fix, D-Fix2, D-Fix3, Part O) — still
reads as too technical: it states facts (a Dasha period, a Yoga name)
without leading with what that actually MEANS for the person, and
without clear positive/negative/mixed framing.

This session applies ONE exact, pre-designed structure to every
section of the Kundali reading — the structure below was already
designed and approved by the person, not left to be invented tonight.
Implement it precisely, do not deviate from the pattern.

The person does not read code. Final summary must include full
before/after text for every section changed.

Standing requirements apply: Phase 0 dependency check, full
positive/negative/edge testing, Playwright, mimic-manual-testing
phase, full regression at the end, staging only, separate commit per
section changed.

---

## THE EXACT STRUCTURE — APPLY THIS PATTERN TO EVERY SECTION

Every section of the reading must follow this four-part order:

1. Verdict line — one plain-language sentence stating whether this is broadly positive, negative, mixed, or neutral for the person, with NO numeric score (explicitly rejected — a "78/100" style score creates false precision and was flagged as a real risk by independent review).
2. Plain-language impact — 1-2 sentences on what this actually means for the person's real life, in the specific life area, written as if explaining to someone with zero astrology knowledge.
3. Evidence, one level in — the actual chart facts (house, lord, Yoga, Dasha) that support the verdict, phrased as "this comes from..." — present so the reading remains traceable and grounded (this is the existing accuracy-verification layer's job — it must still check every fact here), but positioned AFTER the plain-language meaning, never before it.
4. Practical/forward-looking close — where relevant, a real, computed timing window (reusing the existing Dasha-activation engine — no new timing math) framed as "worth knowing" guidance, not a command.

### Two exact, approved worked examples — match this tone precisely

Career (approved example):
"A generally favorable period for career growth, with one thing to
watch. Your current work life is shaped by two things pulling in a
good direction: Saturn's steady, structure-building influence in your
career house, and a real classical marker (a moderate Raj Yoga) linked
to recognition and rising status. Together, these suggest that
consistent, patient effort right now is more likely to pay off than a
sudden leap. This reading comes from your 10th house of career sitting
in [sign], ruled by [planet] (currently [strength]), with [planet]
also present there — and your Raj Yoga forming because your chart's
angle and fortune houses are connected through [planets]. Your
strongest window for a real career move opens in your [Dasha lord]
Antardasha, from [real date] to [real date] — worth having any big
plans ready to act on by then."

Sade Sati (approved example, for the inactive case):
"Good news — you're not in a Sade Sati period right now. Traditionally,
Sade Sati periods bring pressure toward restructuring, added
responsibility, or slower, harder-won progress. Since you're outside
one currently, your day-to-day life isn't carrying that particular
weight. Your last Sade Sati ran from [real date] to [real date] — if
that stretch felt like a time of consolidation or slow, deliberate
change, that lines up with the classical pattern. Your next one begins
in [real date], lasting until [real date] — that's [X] years away, so
there's no reason for concern now, just something to keep in mind well
ahead of time."

Build the equivalent structure, in this same tone, for the ACTIVE Sade
Sati case, using this exact approved example as the template:

"You're currently in a Sade Sati period — and that's genuinely nothing
to worry about. Despite its reputation, this is one of the most
misunderstood periods in Vedic astrology, and for good reason: it's far
more often a season of real, lasting growth than the hardship people
fear. Sade Sati refers to the roughly seven-and-a-half years when
Saturn transits the signs before, on, and after your Moon sign.
Saturn's themes are discipline, patience, and long-term reward — many
people look back on their Sade Sati as the period that built their
strongest foundations: real maturity, financial discipline, or a
career that held up long after the effort of building it. You're
specifically in the [Rising/Peak/Setting] phase, which began [real
date] and runs until [real date]. [Phase-specific note: e.g., the
Rising phase often brings the first pressures that set the stage for
what follows; the Peak phase is typically the most demanding but also
where the deepest growth happens; the Setting phase is where earlier
effort starts paying off.] This phase ends on [real date]. There's no
need to brace for anything — just know that what you build now tends
to last."

And for every other Kundali reading section: Relationships,
Health (verdict/impact/evidence/guidance structure applies, but stay
strictly theme-level, never a diagnosis — this existing safety rule is
unchanged and non-negotiable), Money, Family, "Right now for you,"
Doshas (apply the SAME calm, non-fear-based framing already established
— this structure supports that, it doesn't replace it), and Deeper
Chart Layers.

---

## PART 1: EXTEND PRATYANTARDASHA — COMPUTED, BUT ADVANCED-VIEW ONLY

Per independent research consensus: Pratyantardasha (the 3rd Dasha
level) is worth computing, but should NOT be woven into the main
narrative yet — the specific user task it serves hasn't been validated.

1. Extend the existing Dasha engine (already computing Mahadasha and Antardasha) to also compute Pratyantardasha, reusing the exact same validated proportional-math approach already proven for the existing two levels — do not build new astronomical logic.
2. Expose this ONLY in the "Show chart details (advanced)" section, as raw data (the current Pratyantardasha period and its dates) — do NOT reference it in the main plain-language reading sections yet.
3. Verify the new Pratyantardasha calculation against the same validated reference chart(s) used for the existing Mahadasha/Antardasha — confirm internal consistency (e.g., the current Pratyantardasha period falls within the current Antardasha period's date range) as a sanity check.

---

## PART 2: APPLY THE STRUCTURE — EVERY KUNDALI READING SECTION

Rewrite each section's generation logic (prompt/instructions) to
produce output in the exact four-part structure above. This is a
structural and tonal change, not a new accuracy standard — the
existing zero-tolerance accuracy checker, the D-Fix2 hard boundary
against literal yes/no predictions, and all existing safety rules
(Health theme-only, Doshas non-fear-based) remain fully in force and
must be re-verified explicitly for every section touched.

Sections to rewrite: Snapshot, Career, Relationships, Health, Money,
Family, "Right now for you," Doshas, Sade Sati (as its own dedicated
page, using the exact approved example above as the template for both
the active and inactive cases).

---

## PART 3: TESTING

- Positive: regenerate the full reading for the reference chart and at least 2 other real charts (including one with an active Sade Sati) — paste the complete before/after for every section.
- Accuracy: re-run and extend the existing zero-tolerance accuracy checker across all rewritten sections — report real numbers (claims checked, claims correct).
- Safety: re-run the full safety suite explicitly — confirm Health stays theme-only with no diagnosis language, confirm Doshas stay calm and non-fear-based, confirm the D-Fix2 hard boundary against literal yes/no still holds under the new structure.
- Pratyantardasha: verify it appears ONLY in the advanced view, confirm it does NOT leak into any main narrative section, confirm its computed dates are internally consistent with the existing validated Antardasha data.
- **Reading-history compatibility (Part P)**: confirm the "what's changed since your last reading" comparison logic still produces sensible output when comparing an OLD-style (pre-rewrite) cached reading against a NEW-style (post-rewrite) one — if this produces confusing or broken output, either handle it gracefully (e.g., skip the comparison for mismatched structure versions) or bump the reading cache version (as done in Part O) so old readings are regenerated fresh rather than compared against structurally.
- **AI astrologer chat consistency**: decide and test explicitly whether the chat should be able to answer a direct question about Pratyantardasha now that it's computed (even though hidden from the main narrative) — either wire the chat to have access to it and answer accurately if asked, or confirm the chat gives an honest "that's not something I currently discuss" rather than a broken or inconsistent answer. Do not leave this undefined — pick one, implement it, test it.
- **PDF re-verification (Part M)**: regenerate the Kundali PDF after this rewrite and confirm it renders the new four-part structure completely and correctly — this project has had a real blank/broken PDF bug before after a content structure change, so this must be explicitly re-checked, not assumed to inherit correctly.
- **Part R tonal consistency**: read the existing Part R "past-period reflection" question and response-handling text alongside the newly rewritten reading sections — confirm the tone (warmth, reassurance) is now consistent across both, and lightly adjust Part R's wording ONLY if it now reads as jarringly more clinical than the rest of the page; do not do a deep rewrite of Part R, just a tone-consistency spot check.
- **Length/density check**: the new four-part structure is naturally longer per section than the prior version. Confirm the full reading page doesn't tip back into feeling like "too much text" — check total word count per section against a reasonable range, and confirm the mimic-testing self-critique (below) explicitly addresses whether length feels appropriate, not just whether tone is right.
- Playwright: screenshot the full reading page after changes — confirm no layout/length issues, confirm the new structure reads cleanly (verdict line visually distinct if reasonable, e.g., bolded, without over-engineering new UI).
- Re-run the full existing test suite — confirm zero regressions.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: generate the reading for 3-4 different real charts, confirm each section's verdict/impact genuinely differs based on real chart data — not a templated verdict regardless of input.
- Adversarial: a chart with strongly mixed signals in one life area (some Yogas favorable, a Dosha present) — confirm the verdict line honestly reflects "mixed," not forced into false positive or negative.
- Honest self-critique: read 2-3 complete, real, regenerated readings fresh, as the person who raised this exact complaint would. Does this now genuinely read as answering "what does this mean for me" before diving into mechanism? Does any section still feel like it's leading with jargon? Name anything that falls short, do not just confirm the spec was followed.

---

## FULL REGRESSION + FINAL CHECKPOINT

Final plain-language summary: complete before/after text for every
section of the reading (at least 2 full real chart examples), the
Pratyantardasha implementation confirmation (advanced-view only), the
accuracy/safety re-verification results, the honest self-critique,
exact test counts, and anything flagged for review.

## WHAT NOT TO DO (Part X — Kundali reading rewrite)

- Do not invent a numeric score anywhere — explicitly rejected
- Do not let Pratyantardasha appear in any main narrative section — advanced view only, for this session
- Do not weaken the Health theme-only rule, the Doshas non-fear-based framing, or the D-Fix2 hard boundary while restructuring
- Do not merge or deploy to production — staging only
- Do not report this as done without pasting real, complete before/after text for every section

---

# PART Y — SCIENCE & LONGEVITY LANDING PAGE

Build a new page at /science-longevity (or the closest non-conflicting
slug — check for collisions the same way Part W required for
/vedic-astrology), following the exact structure proven in Part W
(hero, stats strip, tool groupings, SEO/AEO requirements, edge-to-edge
density requirement) but with this category's own finalized content.

## Hero section — exact approved copy

Headline: "Not a guess. Not a horoscope."
Subheading: "A real statistical model, built the way actuaries do it —
factoring in your exercise habits, stress levels, diet, sleep, and 15+
other real health variables, benchmarked against population data from
the UN, WHO, and global health studies covering millions of real lives
across 57 countries. Exercise regularly? That's +2.3 years. Chronic
stress? That's real too, and we'll show you the number. See exactly
which factors move your life expectancy — and exactly where every
number comes from."
Primary CTA: "See my life expectancy" linking to /life-expectancy.

## Stats strip (animated count-up, verify real numbers in Phase 0)

Three real, verified stats — e.g., "15+ health factors considered,"
"57 countries in the comparison data," "UN/WHO/GBD real data sources."
Verify these exact numbers against the real, current implementation —
do not assume the numbers used in planning conversation are still
accurate.

## Tool groupings

Core tools: Life Expectancy, Biological Age.
Supporting tools: Longevity Coach, Country Comparison (57-country
data).

## Closing "what makes this different" section

Callout box using the approved copy: sourcing and limitation framing
should be prominent here too, consistent with the Stanford Web
Credibility Project finding (already applied elsewhere in this
project) that sourcing/limitation transparency matters more than
visual polish specifically for health-adjacent content.

Apply the SAME density requirement, SEO/AEO requirements (title, meta
description, direct-answer opening, schema markup), animation
treatment (stats count-up, tool-card hover), language selector, and
saved-profile integration pattern as Part W. Do not re-derive these
requirements from scratch — reuse Part W's exact specification for all
of them, substituting only this category's content.

---

# PART Z — BIRTHDAY FUN & CELEBRITY TWINS LANDING PAGE

Build a new page at /birthday-fun (or closest non-conflicting slug),
same Part W structure.

## Hero section — exact approved copy

Headline: "3,000+ celebrities, and real depth most sites skip."
Subheading: "Not just who shares your birthday — their actual
Nakshatra, their zodiac sign, their numerology. See who's celebrating
today, check back daily, and discover connections nobody else shows
you. Your age, down to the second. Your birthday twin, waiting to be
found."
Primary CTA: "Find my birthday twin" linking to /celebrity-birthday.

IMPORTANT: do not use any "waste your time" or similarly self-
deprecating framing anywhere on this page — this was explicitly
reviewed and rejected earlier in this project's planning.

## Stats strip

Real, verified counts — e.g., real celebrity database count (verify
the true current number the same way the earlier "50,000+ vs 598"
inconsistency was resolved in Part V — do not reintroduce a wrong or
inconsistent number here), number of tools in this category.

## Tool groupings

Core tools: Age Calculator, Celebrity Match, Today's Birthdays.
Supporting tools: Birthday Countdown, Age in Days, Age in Seconds,
Planetary Age.

Apply the SAME density requirement, SEO/AEO requirements, animation
treatment, language selector, and saved-profile integration pattern as
Part W.

---

# PART AA — MYSTIC CORNER LANDING PAGE

Build a new page at /mystic-corner (or closest non-conflicting slug),
same Part W structure.

## Hero section — exact approved copy (this was rebuilt once after an earlier draft was rejected as poor — use this exact final version)

Headline: "Your birthday carries a number. Your name carries a code."
Subheading: "For thousands of years, cultures across the world have
found meaning in exactly these patterns — long before charts and
algorithms existed. Discover your Life Path number, your birthday's
tarot card, and what centuries of tradition say about who you are.
Curious what yours reveals?"
Primary CTA: "Discover my Life Path number" linking to /numerology.

IMPORTANT tone note: this page is deliberately lighter-weight and
honestly framed as tradition/reflection, not computed rigor — do NOT
use "precisely computed," "rigorously verified," or similar language
here, which is reserved for the Vedic Astrology page specifically. Keep
this page's confidence framed around cultural longevity and tradition,
not computational precision.

## Tool groupings

Core tools: Numerology, Name Numerology, Tarot by Birthday.

This is the smallest of the four categories — do not artificially pad
it with unrelated tools to make it feel larger; a smaller, honest page
is preferable to a padded one.

Apply the SAME density requirement, SEO/AEO requirements, animation
treatment, language selector, and saved-profile integration pattern as
Part W.

---

# CROSS-PAGE TESTING (Parts Y, Z, AA)

- Follow Part W's exact testing requirements (positive/negative/edge, Playwright at 3 breakpoints, accessibility, saved-profile integration) for each of the three new pages independently.
- Additionally: confirm all four landing pages (the existing Vedic Astrology page from Part W, plus these three) share a visually and structurally consistent template — same header/hero pattern, same stats-strip style, same tool-card style — so they read as one coherent family of pages, not four separately-designed one-offs.
- Confirm no slug collisions between any of the four pages and any existing site route.
- Full regression suite across all three new pages plus the Part X reading rewrite together — confirm zero regressions, and confirm nothing about adding three new pages in the same session as the reading rewrite caused any cross-contamination (e.g., a shared component being modified for one purpose breaking the other).

## MIMIC-MANUAL-TESTING (Parts Y, Z, AA)

Same standard as every prior session: exploratory click-throughs of
each new page, adversarial edge cases, and an honest self-critique of
each page's copy and density — specifically confirm Mystic Corner
doesn't feel padded or forced, and confirm Science & Longevity's
sourcing/limitation framing is genuinely prominent, not buried.

## WHAT NOT TO DO (Parts Y, Z, AA)

- Do not use "wasting time" framing on the Birthday Fun page — explicitly rejected
- Do not use "precisely computed" or similar rigor-language on Mystic Corner — reserved for Vedic Astrology
- Do not pad Mystic Corner with unrelated tools to make it feel bigger
- Do not use a wrong or re-inconsistent celebrity count on the Birthday Fun page — verify the real number
- Do not merge or deploy to production — staging only for all four pages
- Do not report any of the three new pages as done without real, full-page screenshots at all required breakpoints

