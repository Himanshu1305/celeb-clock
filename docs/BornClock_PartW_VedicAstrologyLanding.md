# BornClock — Part W: Vedic Astrology Landing Page
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

This builds the first of four planned category landing pages (Vedic
Astrology, with Science & Longevity, Birthday Fun & Celebrity Twins,
and Mystic Corner to follow in later sessions once this one is
reviewed). This is a genuinely NEW page — not a regrouping of existing
homepage content like Parts U/V, though it links into and reuses
existing tool pages.

**The person does not read code.** Final summary must include full
real screenshots (desktop and mobile) and confirmation every design
decision below was implemented as specified.

Standing requirements apply: Phase 0 dependency mapping, full
positive/negative/edge testing, Playwright, mimic-manual-testing phase,
full regression at the end, staging only.

---

## PHASE 0: DEPENDENCY MAPPING

Document in `docs/part-w-touchpoints.md`:
- Confirm the exact current routes for all 14 Vedic Astrology tools (from the real nav dropdown Part U/V confirmed): Free Kundali (/kundali), Kundali Matching (/kundali-match), Ask an Astrologer (/astrologer), Sade Sati Calculator (/sade-sati), Muhurat Finder (/muhurat), Career Analysis (/career-report), Gemstone Suggestions (/gemstones), Western Zodiac (/zodiac), Chinese Zodiac (/chinese-zodiac), Indian Zodiac (/vedic-zodiac), Moon Sign Calculator (/moon-sign), Compatibility Calculator (/compatibility), Rashi Ratna (/rashi-ratna), Sun Sign vs Moon Sign (/sun-vs-moon-sign).
- Confirm the exact real counts to use in the stats strip: number of classical Yogas actually detected by the engine (Part G — verify the real number, do not assume 11), number of divisional charts actually computed (verify 16), and confirm 14 is accurate for "Vedic tools" (adjust if Phase 0 finds the real count differs).
- Confirm whether a positioning-statement document now exists in docs/ (per Part V's flag that one wasn't found) — if the person has since added one, use its exact language; if still absent, use the language given in this prompt as the approved fallback.
- Confirm the saved-profile mechanism's integration pattern (Part E/J/K/L) so this new page can offer/reuse a saved profile the same way /kundali does today.
- Check whether Hindi content infrastructure (confirmed to exist elsewhere on the site) could support a Hindi version of this specific page, or whether that's out of scope for this session (likely out of scope — flag it as a follow-up rather than attempting a full translation now; this session builds the language selector UI and English content only, wired to switch if/when Hindi content for this page exists).

- Confirm this exact hero subheading language ("cross-verified against independent professional platforms for accuracy") is the intended, approved final phrasing — this is a softer version of language that was explicitly rejected elsewhere in this project ("cross-checked against 2 independent platforms" was rejected as confusing/thin on the homepage card) for being the same underlying claim. If genuinely uncertain whether this softer phrasing is still approved, use it as written here (it was reviewed favorably in this session's planning) but flag it for the person's final confirmation rather than silently assuming.
- Search specifically for any existing route, page, or content that could collide or overlap with a new /vedic-astrology slug — the site already has /vedic-zodiac as an existing, similarly-named route. Confirm there is no confusion risk (in navigation, in search indexing, or in the person's own mental model) between /vedic-astrology (this new landing page) and /vedic-zodiac (an existing, different tool). If any risk is found, flag it and propose the clearest resolution rather than proceeding with two similarly-named, easily-confused routes.

If this reveals significantly more complexity than expected, flag it
in writing and scope accordingly rather than stalling or cutting corners
silently.

---

## PART 1: PAGE STRUCTURE AND CONTENT — EXACT SPECIFICATION

Build a new page at /vedic-astrology (confirm this exact slug doesn't
conflict with anything existing; if it does, propose the closest
sensible alternative and flag it).

### Hero section
- Category badge: "Vedic astrology" with a moon-stars icon, small pill style.
- Headline: "Most Kundali generators guess. Ours computes." (the second sentence should use the site's accent color, matching the pattern already established in Part U/V's hero treatment).
- Subheading: "Real sidereal astronomy, rigorously tested against birth charts spanning over a century, cross-verified against independent professional platforms for accuracy."
- Primary CTA button: "Get my free Kundali" linking to /kundali.
- Subtle background treatment: faint, slow orbital-ring decoration behind the headline (thin circles, low opacity, suggesting planetary orbits) — tasteful and understated, not a literal cartoon zodiac wheel. If an animation library is already in use elsewhere on the site, prefer reusing it; otherwise implement as simple CSS.
- Language selector (English / Hindi) in the top-right of this section — for this session, build the UI control; wire it to switch only if Hindi content for this specific page exists or is trivially addable, otherwise the Hindi option can be present but marked/behave as "coming soon" (do not silently fail — show a clear, honest state).

### Stats strip (animated count-up)
Three stat cards, numbers animate from 0 to their real value on page load (or on scroll into view, whichever fits the existing site's animation conventions better — check for precedent before deciding):
1. [Real Yoga count from Phase 0] — "Classical yogas detected"
2. [Real divisional chart count from Phase 0] — "Divisional charts computed"
3. [Real tool count from Phase 0] — "Vedic tools, all in one place"

### "Your core chart" section (3 flagship tools, larger visual treatment)
Free Kundali, Kundali Matching, Ask an Astrologer — each a card with an
icon, tool name, and a gentle hover lift/shadow interaction. These link
to their real, existing pages.

### "Timing and life guidance" section (4 tools)
Sade Sati Calculator, Muhurat Finder, Career Analysis, Gemstone
Suggestions — smaller card treatment than the flagship tier, still
clearly clickable, linking to real existing pages.

### "Signs and compatibility" section (7 tools)
Western Zodiac, Chinese Zodiac, Indian Zodiac, Moon Sign Calculator,
Compatibility Calculator, Sun Sign vs Moon Sign, Rashi Ratna — smallest,
densest card treatment, linking to real existing pages.

### Closing "what makes this different" section
Callout box: "We detect real classical planetary combinations (yogas),
compute your exact Dasha timing down to the month, and never guess
where a shortcut would do. This isn't a horoscope. It's your actual
birth chart, done right."

---

## PART 1.5: SEO/AEO TECHNICAL REQUIREMENTS — THE ACTUAL POINT OF A SEPARATE PAGE

Building this as its own page (rather than a homepage section) was
specifically motivated by SEO/AEO/GEO benefit. Without the following,
that benefit is not actually realized — this is not optional polish:

- **Page title and meta description**: write a specific, accurate title tag and meta description for this page focused on "Vedic astrology" / "free Kundali" / "birth chart" — not a generic site-wide template.
- **A tight, direct-answer opening** (40-60 words) near the very top of the page content (can be the hero subheading if it fits this length, or a dedicated short paragraph immediately after) that plainly answers "what is this page/service" — written so it could be lifted directly as a featured snippet or an AI-search citation, per the AEO research already applied elsewhere in this project.
- **Structured data (schema markup)**: add appropriate schema (e.g., Service or WebApplication schema, consistent with whatever pattern — if any — the rest of the site already uses; check for precedent before inventing a new approach) identifying this as a Vedic astrology service page.
- **Real internal linking**: this page should be linked from the site's main navigation (already true, per the existing "Vedic Astrology" nav dropdown — confirm this new page becomes the dropdown's actual destination/landing target where appropriate) and should itself link out clearly to each of the 14 tools, which it already does per Part 1.
- Confirm this page is included in the site's sitemap and is NOT accidentally set to noindex.

---

## PART 2: LAYOUT DENSITY REQUIREMENT — EXPLICIT AND NON-NEGOTIABLE

The person has explicitly required: edge-to-edge content, no
unnecessary padding, no wasted whitespace, optimum use of horizontal
and vertical space. This applies to the ENTIRE page, not just the
sections above. Concretely:
- Use the page's full available width (matching the site's existing max-width/container convention — check what Index.tsx and other pages actually use, don't invent a narrower one for this page specifically).
- Minimize excess vertical padding between sections — sections should feel connected and purposeful, not separated by large empty gaps.
- Card grids should use the available width fully (responsive column counts that fill the row, not cards floating in a narrower centered column with side margins).
- This does not mean cramped or cluttered — maintain the existing site's spacing/breathing-room conventions for elements themselves (text line-height, card internal padding), but eliminate excess structural whitespace at the page/section level specifically.
- Verify this explicitly in testing (Part 4) with real screenshots showing the page actually uses available width — this is a specific, checkable requirement, not a vague aesthetic preference.

---

## PART 3: SAVED PROFILE INTEGRATION

This page should behave consistently with /kundali for a user with a
saved profile: offer to reuse it when clicking into the "Free Kundali"
card, rather than always requiring fresh entry. Use the existing
progressive-profile mechanism — do not build new logic for this.

---

## PART 4: TESTING

- Positive: load the page, confirm all 14 tool links resolve to their correct real destinations. Confirm the stats animate correctly with the REAL numbers from Phase 0 (not placeholder 11/16/14 if those turn out to be inaccurate).
- Positive: confirm the saved-profile reuse behavior works correctly from this new page.
- Negative: confirm graceful behavior if a stat count fails to load (should show the real number without a broken animation, or a sensible static fallback).
- Edge: test the language selector's "coming soon" or actual-switch behavior — confirm no silent failure either way.
- Edge: confirm the hover animations don't cause layout shift or janky behavior.
- Playwright: screenshot the full page (desktop, and at least 3 breakpoints: narrow phone, tablet, phone-landscape) — confirm the edge-to-edge, minimal-whitespace requirement is visibly met at each width, not just desktop.
- Accessibility: confirm the animated stat numbers have appropriate aria-live or equivalent handling so screen readers get a sensible final value, not a rapidly-changing announcement; confirm the language selector is a real, labeled form control.
- Full regression suite — confirm zero regressions to any existing page or link (this is a new page, so the main risk is whether adding it breaks any existing nav/routing logic).

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: click through all 14 tool links in different orders, confirm each one works and the "back" experience returns cleanly to this landing page.
- Adversarial: rapidly toggle the language selector, rapidly hover/unhover multiple tool cards — confirm no broken state.
- Honest self-critique: does the page genuinely feel dense and space-efficient as required, or does it still feel like it has awkward gaps anywhere? Does the three-tier tool grouping (core / timing / signs) feel clear, or confusing? Give a real, critical read, including checking the page against the specific edge-to-edge requirement rather than just assuming it was met.

---

## FULL REGRESSION + FINAL CHECKPOINT

Final plain-language summary: real full-page screenshots at all tested
breakpoints, confirmation of the real stat numbers used, confirmation
of the space-density requirement being met (with screenshots as proof,
not just a claim), the saved-profile integration working, test counts,
and anything flagged for review.

## WHAT NOT TO DO

- Do not use placeholder stat numbers if Phase 0 finds the real counts differ from 11/16/14 — use the real, verified numbers
- Do not leave large unexplained whitespace anywhere on the page — this was an explicit, repeated requirement
- Do not silently fail the language selector — show an honest "coming soon" state if Hindi content isn't ready
- Do not merge or deploy to production — staging only
- Do not report this as done without real screenshots proving the space-density requirement was met
