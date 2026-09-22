# BornClock — Part AE: Build /vedic-astrology (Category Landing Page)
## Single Claude Code session prompt. Builds the approved page design on staging. First real page of the positioning work — closes that open item once done.

---

## CONTEXT FOR CLAUDE CODE

This builds the `/vedic-astrology` category landing page — the first of four
category pages in the finalized site positioning (Vedic Astrology, Birthday Fun &
Celebrity Twins, Mystic Corner, Science & Longevity). The design has already been
through two rounds of review and is final. This prompt describes the approved
design in full; you do not need to see the visual mockup, just build to this spec.

**This page links to tools that must already exist** (Kundli, Kundali Matching,
Nakshatra, Rashi, Lagna, Dasha, Sade Sati, Manglik, Navamsa, Gemstone
Recommendation, Career Report, Muhurat Finder, and the AI Astrologer chat) —
these were built across the earlier B-through-X feature work.

**Hard stop before starting — Step 0:** confirm that Part AC's merge of the B-
through-X stack into `develop` actually completed successfully and cleanly (a
final report was received showing the merge finished, tests passed, and staging
was verified — not still mid-diagnosis of test failures). If that isn't
confirmed, **stop immediately and report this to the person rather than
proceeding** — do not build against a `develop` that might still be broken or
incomplete. This page depends entirely on that merge having landed.

Once Step 0 is confirmed: check that the routes/features below are actually
present and working on `develop` (check the merged branch, not old production —
production currently has none of these features live, confirmed by real Search
Console data showing zero query signal for any Vedic term). If any of the routes
above are missing or broken, **stop and report exactly what's missing** rather
than building links to pages that don't exist or guessing at route names.

**Note on scope:** this branches off `develop` (the B-through-X merge only), not
off the separate `part-ac` branch where the marriage-timing/explanation-depth
work sits unmerged and unreviewed. That means this page will use the base Vedic
tools as they exist today, without Part AC's depth improvements yet — that's
intentional, to avoid stacking this new page on top of not-yet-reviewed work.
Part AC's improvements can be layered in later once that branch is reviewed and
merged.

**Branch:** create `part-ae-vedic-astrology-page` off the current `develop` HEAD
(post the B-through-X merge). Test and deploy to staging. Leave unmerged for
review, per standing practice.

**The person does not read code.** Final summary must include a real staging URL
and confirmation that every link on the page actually resolves to a working page.

---

## DESIGN SPEC

### Visual direction (scoped to this page and future category pages — not a
### global site re-theme; the homepage and other existing pages are unaffected
### unless a later part explicitly says otherwise)

- **Palette:** deep navy `#0E2238` (headers, nav, footer, primary buttons), warm
  gold `#C6A15B` (accents, active states, secondary CTA), warm ivory `#FAF7F0`
  (alternating section background), white (alternating section background),
  body text `#1A2230` / `#3E4759`, muted labels `#5B6472` / `#8B93A0`, hairline
  dividers `#E4DCC8`.
- **Typography:** display/headline font **Fraunces** (serif, weights 500/600/700),
  body font **Public Sans** (weights 400–700). Load both via Google Fonts.
- **Layout philosophy — this is a deliberate, explicit requirement, not a
  default:** dense and edge-to-edge. Minimal padding (16–32px section padding,
  not 60–120px). No individually-boxed cards with their own background +
  border-radius + generous internal padding — use hairline dividers (thin
  left-borders or vertical rules) to separate items within a row instead.
  Sections butt directly against each other; alternate ivory/white/navy
  backgrounds (plus a 1px divider) do the visual separation, not empty vertical
  space. This mirrors an established internal mockup — build to this density
  level, not a more generously-spaced default.
- Real `<button>`, `<a href>`, and `<input>` + `<label>` elements throughout —
  never a styled `<div>` standing in for an interactive element. `aria-label`
  on any icon-only control (there shouldn't be any on this page as designed).

### Page structure, top to bottom

**1. Hero.** Two-column: left is eyebrow label "VEDIC ASTROLOGY", headline "Your
birth chart, computed — not guessed.", one short paragraph, and a text link to
`/celebrity-birthday/` or the current day's birthday page ("See what your
birthday says about you →"). Right column is the actual, working birth-detail
entry form (date, time, place) that submits into the real, existing Kundli
generation flow — reuse that flow's actual logic, don't rebuild it. Button:
"Generate My Kundli — Free".

**2. What you get.** Five items in one dense row, separated by gold left-borders,
not individual card boxes: Kundli, Dasha Timing, Yoga Detection, Kundali
Matching, AI Astrologer. Each: title, one-line description, a real link to that
actual existing tool page.

**3. Go deeper.** Same treatment, second row: Sade Sati, Muhurat Finder, Career
Report, Gemstone Recommendation — each linking to its real existing page.

**4. How it works.** Three numbered steps in a row (Enter your birth details →
Get your computed chart → Go deeper, or ask), each with a one-line description.
Purely explanatory, no interactive elements needed.

**5. See a real example.** A compact chart-summary panel showing Lagna, Rashi,
Nakshatra, Current Dasha, and an Active Yoga.

**IMPORTANT — accuracy requirement, not optional:** the copy under this panel
says *"This is real, computed output for a real birth chart — not a sample
template."* That sentence must be literally true. Do not fabricate placeholder
values (Aries/Taurus/Rohini/Jupiter/Gaja Kesari were illustrative only, used
during design review — not verified real output). Pull the actual computed
output for the existing reference test chart already used throughout this
project's development (the admin test account's saved birth chart) through the
real engine, and use those real values here. If you cannot cleanly pull a real
reference chart's output for this purpose, stop and ask rather than inventing
numbers — a false "this is real" claim on a page whose entire pitch is honesty
and rigor would be a serious, self-defeating mistake.

**6. Proof of rigor.** One thin three-column strip, hairline-divided, not boxed:
"Validated data" / "Graded, not templated" / "Honest, on purpose" — each a short
inline label + one sentence. Use the exact honesty framing already established
in the chat engine's guardrails (no invented dates, classical association
labeled as exactly that) — this section should accurately reflect real product
behavior, not aspirational copy.

**7. Common questions.** Five real Q&A pairs, compact (question bold inline,
answer follows on the same line), not an expandable accordion for this version:
- Is this really computed, or a template?
- Do you predict exactly what will happen to me?
- What if I don't know my exact birth time?
- How is this different from a generic horoscope app?
- Is my birth data private?

Use the answers already drafted in the design review, but verify each answer is
actually true of the real product before shipping it (e.g. the birth-time-unknown
behavior, the privacy claim) — don't ship a plausible-sounding FAQ answer that
doesn't match real behavior.

**8. Explore by topic.** A single dense inline link row (not pill buttons),
separated by `·`: Kundli, Kundali Matching, Nakshatra, Rashi, Lagna, Dasha, Sade
Sati, Manglik, Gemstone Recommendation, Career Report, Muhurat Finder — each a
real link.

**9. Already checked your birthday?** Birthday-tie-in section: heading, one
paragraph, three links/buttons to `/celebrity-birthday/`, today's birthday page,
and the numerology page.

**10. Ask your chart anything.** Full-width navy banner: heading, one paragraph,
button linking to the real AI astrologer chat.

**11. Want the full picture?** Final CTA: two side-by-side blocks (Kundali
Report ₹199, Combo Report ₹299), each linking to the real, existing purchase
flow for that product — reuse the actual monetization flow already built,
don't create a new checkout path.

**12. Footer.** Copyright line + Methodology/Privacy/Contact links (link these
to real existing pages if they exist; if any don't exist yet, use a sensible
existing equivalent rather than a dead link, and note which in your report).

### Additional requirement not covered by the desktop mockup: responsive/mobile
The design was reviewed at desktop width (1440px). Build this responsively —
preserve the dense, low-padding philosophy at mobile widths too (this is not an
excuse to fall back to generous default spacing), but stack columns that don't
fit (hero's two columns, the how-it-works steps, the sample chart panel's five
fields) into a single column at mobile breakpoints. Verify it actually looks
right at a real mobile width, not just that it doesn't break.

### Navigation
Per the resolved positioning decision: update the site's nav order to lead with
**Birthday & Celebrity** first, **Vedic Astrology** second — this is a real,
site-wide navigation change, not scoped to just this page. Confirm this is what's
intended before changing the global nav (it affects every page on the site); if
there's any doubt, build this page with the nav order as specified and flag it
clearly in your report as a global change made, so it can be reviewed
specifically.

---

## TESTING REQUIREMENTS

- Every link on the page must be verified to actually resolve on staging —
  paste a real list of every link and its destination, confirmed working, not
  assumed.
- The birth-detail form must actually trigger the real Kundli generation flow —
  demonstrate this end-to-end on staging with real input.
- The §5 sample chart values must be traced to real engine output for the
  reference test chart — show the real values and where they came from.
- The two pricing buttons must link to the real, working purchase flow for each
  product — verify, don't assume.
- Mobile responsiveness: paste a description or check of how the page behaves
  at a real mobile width (which sections stack, that nothing overflows or
  breaks).
- Full existing test suite passes before and after.
- Deploy to staging and give a real, working staging URL.

---

## WHAT NOT TO DO

- Do not fabricate the §5 sample chart values — this is a hard requirement, not
  a style preference, given the page's own honesty claim.
- Do not introduce this navy/gold/Fraunces treatment anywhere outside this page
  without being asked — the homepage and other existing pages stay as they are.
- Do not build a new checkout/payment flow for the final CTA — reuse the real,
  existing one.
- Do not link to a tool page that doesn't actually exist — verify first, per
  the hard stop condition at the top.
- Do not merge this branch into `develop` or `main`, and do not deploy to
  production, without explicit go-ahead.
- Do not silently change the global nav order without flagging it clearly as a
  site-wide change in your report.
