# Part AM — Part B: Content-Gap Research (across all four categories)

**Method + honesty note.** This builds on the project's existing competitive research baseline
(`docs/SEO-MAGNET-PROMPT.md` / `-2` / `-3` and their reports) and the Part AL audit of what
BornClock currently has a page for. Gaps below are derived from (a) that baseline, (b) the real
current route inventory, and (c) well-established topic clusters competitors in each vertical cover.
**No search-volume or ranking numbers are invented** — where I can't verify a precise figure from
real search data in this environment, the opportunity is described qualitatively (size expressed as
relative intent/breadth), exactly per the project's no-fabrication rule. This is a prioritized
opportunity list, not a claim of measured demand.

## Already-covered (so NOT gaps — confirmed from the route inventory)
Kundli, Kundali matching, Sade Sati, Muhurat, Gemstones, Rashi Ratna, Career report, Sun-vs-Moon,
Moon sign, Nakshatra (article), Numerology (life path), Name numerology, Compatibility, Western
zodiac, Chinese zodiac, Tarot-by-birthday, Life expectancy (+10 country pages), Biological age,
Longevity, Celebrity/born-on, Birthday report, Age calculators, Birthstone.

## Vedic — real gaps
1. **Mangal Dosha / Manglik calculator (standalone).** Manglik status is computed inside Kundali
   matching but there is no dedicated `/manglik` tool page — a high-intent standalone query with
   strong matrimonial search demand. Reuses the existing dosha engine; no new calculation needed.
2. **Kaal Sarp Dosha (standalone page).** Detected in the chart engine (`doshas.kaalSarp`) but not
   surfaced as its own tool/explainer — a well-known, frequently-searched dosha.
3. **Divisional charts beyond D10:** D9 (Navamsa) has partial coverage; **D7 (Saptamsa, children),
   D4 (Chaturthamsa, property), D24 (education)** are competitor-covered and absent here.
4. **Pitra Dosha / Nadi Dosha explainers** — Nadi is scored in matching but has no standalone page.
5. **Dasha calculator (standalone Vimshottari timeline)** — exists inside Kundali; a dedicated
   "Dasha periods calculator" page is a distinct query.

## Mystic — real gaps
1. **Chaldean numerology** (BornClock uses Pythagorean) — Chaldean is a distinct, searched system;
   a comparison/calculator page is a clean gap. The name-numerology engine could be extended.
2. **Personal year / personal month number** — forward-looking numerology, searched annually;
   not currently a page.
3. **Angel numbers (111/222/333…)** — very high-volume modern spiritual query cluster; no page.
4. **Birthday number / Attitude number** — adjacent numerology sub-numbers not yet broken out.
5. **Zodiac compatibility by element / Venus-sign / love-language crossover** — compatibility exists
   but element- and planet-specific angles are separate long-tail queries.

## Birthday — real gaps
1. **Birthday personality by exact day** ("born on March 14 personality") — the `/born-on/[date]`
   template exists for facts/celebrities; a dedicated *personality* angle per day is competitor-common.
2. **Historical events on your birthday / "what happened on this day"** — strong evergreen cluster.
3. **Birthday number meaning / lucky number by birthday** — numerology-birthday crossover.
4. **Generation + decade identity pages** (partly covered by `/generation`) — expandable to
   decade-specific culture pages.

## Science & Longevity — real gaps
1. **Life expectancy by specific condition/lifestyle** (smoker vs non-smoker, BMI band, by
   profession) — the calculator computes these deltas but there's no indexable explainer page per factor.
2. **Biological age by habit** (sleep, exercise, diet sub-pages) — research-backed, currently inside the quiz only.
3. **"How to add years to your life" evidence pages** per Blue-Zones Power-9 factor — cited in the
   report but not individual indexable pages.
4. **Country life-expectancy comparisons beyond the current 10** (e.g. by continent / by gender).

## General — "People Also Ask" question clusters (candidate FAQ/article content)
Each major existing page has a natural PAA cluster that could become dedicated FAQ/article content
(and FAQPage schema, now reliably rendered via `JsonLd.tsx`): e.g. around Sade Sati ("Sade Sati
remedies", "Sade Sati good or bad", "which phase is worst"); around numerology ("is life path 11
rare", "master number meaning"); around life expectancy ("is the calculator accurate", "what lowers
life expectancy most"). Several of these Q&As already exist on-page and should be captured as
FAQPage schema during each page's Part A pass.

## Prioritization for Part C (highest-value, lowest-build-cost first)
Ranked by (reuses-existing-engine × clear-standalone-intent), winnable-first per Part AL's order:
1. **/manglik** (Vedic) — dedicated Mangal Dosha tool; reuses the dosha engine; high matrimonial intent.
2. **/angel-numbers** (Mystic) — large modern query cluster; content + simple lookup; no heavy engine.
3. **/personal-year-number** (Mystic) — reuses numerology digit-reduction; forward-looking, annual demand.
4. **/kaal-sarp-dosha** (Vedic) — reuses `doshas.kaalSarp`; known dosha with steady search.
Lower priority / larger build: divisional-chart pages (D7/D4), Chaldean numerology, per-factor
longevity explainers.

**Status:** Part C (building these new pages) is **not completed in this session** — see the Part AM
report's honest backlog section. This research doc is the actionable input for the next working block.
