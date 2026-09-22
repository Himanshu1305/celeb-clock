# BornClock — Part U: Homepage & Navigation Restructure (Four Categories)
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

This restructures the homepage (`src/pages/Index.tsx`) and navigation
(`src/components/Navigation.tsx`) around four clearly separated
categories, decided after extensive research into brand architecture,
credibility separation, and SEO/internal-linking safety. **This is
explicitly a presentation-layer reorganization, NOT a URL/route
migration** — per direct research (including Google's own John Mueller
guidance) that structural rewrites carry real SEO risk while
presentation-layer reorganization does not, provided all existing
routes and internal links are preserved.

**The person does not read code.** Final summary must contain real
screenshots described in plain language and a clear before/after of
the nav structure and homepage layout.

Standing requirements apply: Phase 0 dependency mapping, full
positive/negative/edge testing, Playwright throughout (this is
fundamentally a UI/navigation session), mimic-manual-testing phase,
full regression suite at the end, stop and flag genuine surprises in
writing (`docs/part-u-flags.md`).

---

## THE HARD RULE — READ THIS FIRST, APPLIES TO EVERYTHING BELOW

**Every existing route/URL must be preserved exactly as it is today.**
Do not rename, move, or redirect any existing page. Do not remove any
existing internal link from the homepage — every tool/page currently
linked from Index.tsx must still be linked from Index.tsx after this
change, just reorganized into the new category grouping. This is a
relabeling and regrouping exercise, not a rebuild. Verify this
explicitly as part of testing (see Part 4).

---

## PHASE 0: CONFIRM CURRENT STATE BEFORE CHANGING ANYTHING

1. Re-read the current `src/components/Navigation.tsx` and `src/pages/Index.tsx` in full, confirming the structure already mapped: `navItems`, `exploreItems`, `astrologyItems` arrays, and the current homepage's ~19 sections.
2. Produce a complete "before" inventory in `docs/part-u-before-state.md`: every current route, every current homepage section, in order — this is the baseline the fix-then-full-retest discipline will compare against.
3. Confirm the exact current celebrity-count discrepancy the person flagged ("50,000+ celebrities" in the hero trust row vs. "598 Indian celebrities" elsewhere in the same file) — check whether this has already been fixed since it was last observed. Report the real current state plainly; fix it now if it's still inconsistent (use one accurate, real number consistently — check the actual celebrity data source for the true count rather than guessing which of the two existing numbers is correct).

---

## PART 1: THE FOUR CATEGORIES — EXACT, FINAL GROUPING

Reorganize navigation and homepage content into exactly these four
categories, using these exact names and this exact item assignment
(every item keeps its existing route):

### 1. Science & Longevity
Life Expectancy, Biological Age, Longevity Coach, Country Comparison
(and any other clearly science/actuarial tool found in the current
"More" or "Explore" lists during Phase 0 — e.g., Biorhythm-related
tools should be evaluated: if framed as genuine circadian/energy
science, consider here; if framed as fun/casual, keep in category 3 —
use judgment based on how each tool is currently described, and note
the decision).

### 2. Vedic Astrology
Free Kundali, Kundali Matching, Ask an Astrologer (AI), Sade Sati
Calculator, Muhurat Finder, Career Analysis (Vedic), Gemstone
Suggestions, Western Zodiac, Chinese Zodiac, Indian Zodiac (Vedic),
Moon Sign Calculator, Compatibility Calculator, Rashi Ratna, Sun Sign
vs Moon Sign.

### 3. Birthday Fun & Celebrity Twins
Age Calculator, Today's Birthdays, Celebrity Match, Birthday Report,
Planetary Age, Age in Days, Age in Seconds, Birthday Countdown,
Celebrity Birthday Profiles, Born in Each Month, Indian Celebrities by
Date, Weight on Planets, Gift a Report, Birthstone, Birthday
Personalities.

### 4. Mystic Corner
Numerology by Birthday, Name Numerology, Tarot by Birthday.

### Items not clearly fitting one of the four
Embed Our Widget, Articles, Answers, Leaderboard, Blog, Pricing —
these are utility/content pages, not category tools. Keep them in a
separate, small "Resources" or "More" grouping in the nav (not one of
the four main categories), exactly as a fifth, minimal group — do not
force them into the four categories.

---

## PART 2: NAVIGATION RESTRUCTURE

- Replace the current `navItems` / `exploreItems` / `astrologyItems` structure with four (plus the small fifth "Resources/More") clearly labeled dropdown groups, using the category names and exact item assignment from Part 1.
- Each dropdown should be visually organized as a proper mega-menu style dropdown (research-backed: this outperforms plain dropdowns for content-rich sites) — grouped, scannable, not just a long flat list, if the current dropdown component supports this; if it doesn't, evaluate whether extending it is proportionate for this session or should be flagged as a follow-up (a well-organized flat list within each category is an acceptable interim step if a full mega-menu redesign is too large — say so honestly).
- Fix the known duplication: "Compatibility" currently appears in both the old Astrology and Explore groupings — it belongs in Vedic Astrology only (per Part 1) in the new structure; do not duplicate it across categories now.
- Mobile menu: apply the same four-category (plus Resources) grouping, keeping the existing mobile-friendly expandable-section pattern already in place — do not build a new mobile pattern from scratch, adapt the existing one.
- Preserve the existing Admin link, Premium/Upgrade/Trial pill, and Home button behavior exactly as they currently work.

---

## PART 3: HOMEPAGE RESTRUCTURE

- Keep the hero section's existing mechanics (live counter, birthday input, "Reveal Everything" button, trust indicators) — only change the headline/tagline copy (below).
- **New hero tagline** (replace the current "Birthday intelligence from your date of birth — celebrity twins, zodiac, numerology, life path, and your longevity forecast."): "Your date of birth, fully explored — real longevity science, precisely computed Vedic astrology, and birthday fun, all in one place." Adjust minor phrasing only if needed for length/layout constraints, but preserve the core honest framing: "real" for science, "precisely computed" for astrology (never "scientific" for astrology, per the project's established positioning — see `docs/` for the finalized positioning statement if present).
- Add a clear "choose your path" section immediately after the hero: four (or five, including Resources if appropriate) large, clearly labeled cards — one per category — each linking to a natural landing point for that category (e.g., Vedic Astrology card links to `/kundali` as the flagship entry point, Science & Longevity links to `/life-expectancy`, etc.). This is a NEW section, additive, not replacing anything.
- Reorganize the EXISTING homepage sections (the ~19 already mapped in Phase 0) into grouped blocks by category, preserving every existing section and every existing internal link — move sections together rather than deleting or merging their content. For example: the "Science cards row," "EEAT Trust Section," and "More Ways to Know Yourself" (country comparison, biological age) sections move together into a "Science & Longevity" block; celebrity/birthday content sections move together into the "Birthday Fun" block; etc. Sections that don't cleanly belong to one category (Testimonials, FAQ, Articles, AuthorBio, Footer) stay as universal closing sections in their current position, unchanged.
- The imported child components (BirthdayReportShowcase, BentoGrid, TestimonialsSection, PageFAQ, AuthorBio) should be repositioned as whole units within the new grouped structure, not decomposed — check their content only if genuinely necessary to confirm correct category placement.

---

## PART 4: TESTING — VERIFY THE HARD RULE, THEN EVERYTHING ELSE

### The most important test: nothing was lost
Compare the "before" inventory (Phase 0.2) against the final "after" state — confirm every single route that was linked from the homepage before this change is STILL linked from the homepage after this change (even if in a different section/grouping). Confirm every nav item that existed before still exists and resolves to the same URL after. This is a literal diff, not a spot check — produce it and report it plainly.

### Standard positive/negative/edge/adversarial suite
- Positive: navigate through all four category dropdowns (desktop and mobile), confirm every item resolves correctly.
- Positive: click each of the four "choose your path" homepage cards, confirm they land on the right page.
- Negative: confirm no broken links, no 404s introduced by this reorganization.
- Edge: very narrow mobile viewport, confirm the four-category mobile menu doesn't break or become unusable. **Test at least 3 real breakpoints, not just one**: a narrow phone (e.g., ~360px), a common tablet width (e.g., ~768px), and a short/wide phone-landscape orientation — mega-menu-style structures are prone to breaking at specific in-between widths that a single narrow-viewport check would miss.
- Playwright: screenshot the new nav (desktop + all 3 mobile/tablet breakpoints, all four dropdowns open) and the new homepage (full-page, top to bottom) — this is the primary deliverable the person needs to actually review.

### Regression
Re-run the full existing test suite. **Existing navigation tests
(`e2e/navigation.spec.ts`, `e2e/prelaunch/navigation.spec.ts`) will
almost certainly assert specifics about the OLD nav structure (item
counts, specific dropdown contents/order) — these are expected to need
updating to reflect the new, intentional structure, not treated as
newly-broken regressions.** Update these tests to correctly verify the
NEW four-category structure (confirm each category's items are present
and correctly grouped, confirm the "Compatibility" de-duplication),
rather than either leaving them failing or deleting their coverage.
Confirm this distinction explicitly in the final report: which test
changes were "expected updates to match the new intentional design"
versus any genuine, unexpected regression found elsewhere.

Re-run the full existing test suite after these updates. Confirm exact
before/after counts, zero UNEXPECTED regressions (i.e., regressions
outside the navigation tests that were deliberately updated).

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: browse the site as a first-time visitor would, using only the new nav structure, no prior knowledge — confirm the four categories genuinely feel intuitive and discoverable.
- Adversarial: try to find any tool that seems to have gone missing or become harder to find compared to before.
- Honest self-critique: does the new structure genuinely resolve the "everything mixed together" problem this whole project identified, or does it just add a label on top of the same mixing? Give a real, critical read of the finished homepage and nav, not just confirmation the spec was followed.

---

## FULL REGRESSION + FINAL CHECKPOINT

Final plain-language summary: the before/after nav structure
(side-by-side), the before/after homepage layout (side-by-side),
confirmation of the "nothing lost" diff, real screenshots described,
the celebrity-count fix status, the mimic-testing findings and honest
self-critique, exact test counts, and anything flagged for the
person's review.

## WHAT NOT TO DO

- Do not change, remove, or redirect any existing URL/route
- Do not remove any existing internal link — reorganize, never delete
- Do not call astrology "science" anywhere in new copy — use "precisely computed" / "rigorously computed" / "classically grounded" per the established positioning
- Do not merge or deploy without being asked — this goes to staging first, per the standing decision that positioning/nav changes are too high-blast-radius for direct production changes
- Do not report this as done without the literal before/after link-preservation diff and real screenshots
