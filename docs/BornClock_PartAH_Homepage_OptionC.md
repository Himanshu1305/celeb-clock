# BornClock — Part AH: Homepage Redesign (Option C — Animated Celestial Wheel)
## Single Claude Code session prompt. Builds the approved homepage direction. Standard flow: build → preview → stop for explicit go-ahead. This is the highest-traffic page on the site — no pre-authorized deploy this time.

---

## CONTEXT FOR CLAUDE CODE

This replaces the current homepage with the approved "Option C" design: an
animated celestial-wheel hero, four color-coded category showcases, a real
sub-tools row, an "Ask your chart anything" banner, and a full four-way footer
sitemap linking every category page and its real sub-pages — the actual fix for
the site-wide interlinking gap identified earlier.

**This is the highest-visibility page on the site.** Unlike the category pages,
do not treat this as low-risk. Build it, verify it thoroughly on an isolated
preview, and **stop there for explicit go-ahead** — no pre-authorized deploy for
this one, even though recent sessions have moved fast.

**Step 0 — before starting:** confirm `develop`'s current HEAD includes all four
live category pages (Vedic Astrology, Birthday & Celebrity, Mystic Corner,
Science & Longevity) — it should be at or past commit `b47002e`. If it looks
behind that, stop and report rather than proceeding.

**Branch:** create `part-ah-homepage-redesign` off `develop` HEAD.

---

## PART 1: The homepage rebuild

### 1. Hero
- Headline: *"Your birth date, mapped like the sky itself."* Subhead: *"Vedic astrology, numerology, celebrity twins, and longevity — one real, computed chart, not a generic horoscope."*
- **Animated elements (real CSS, not decorative-only descriptions):** a slowly rotating radial chart-wheel graphic (SVG, ~90s linear rotation), a slower counter-rotating star field with a gentle twinkle (opacity pulse) on individual stars.
- **Respect accessibility:** wrap all continuous animations (rotation, twinkle, float) in `@media (prefers-reduced-motion: no-preference)` so users who've set that OS/browser preference get a static version instead — this wasn't in the mockup but is a real accessibility requirement for production.
- **Real photo background:** source a genuine night-sky/stars photograph from Unsplash's or Pexels' free, commercial-use libraries (no API key needed for direct attribution-optional use on both) — darken it (~55-65% overlay) so the headline text stays readable. Note the actual image source/photographer in a code comment for the record. Do not use a placeholder or a generic gradient here — this is a real, sourced photo per the person's request.
- Reuse the real, existing DOB-entry input and its logic (don't rebuild it) — same "enter your birth date" mechanism already live on the current homepage.

### 2. Category orbit row — four color-coded, verified-real links
**First, find and remove the current homepage's existing "choose your path"
category-card section** — the new orbit row below replaces it entirely and
does the same job. Do not leave both on the page; that would read as two
different, confusing "pick a category" sections stacked on top of each other.

Four large circular tiles, each a gradient "planet," each linking to the real,
already-live category page:
- Vedic Astrology — gold gradient — links to `/vedic-astrology`
- Birthday & Celebrity — coral gradient — links to `/celebrity-birthday`
- Mystic Corner — teal gradient — links to `/mystic-corner`
- Science & Longevity — green gradient — links to `/life-expectancy`

**Verify all four resolve correctly before finalizing** — don't assume the
paths above are still exactly correct without checking, since routes can
change. Each tile floats gently (CSS animation, respecting reduced-motion) and
lifts slightly on hover.

### 3. Sub-tools row
Real links only, each verified to exist before including: Kundali Matching,
Muhurat Finder, Gemstones, AI Astrologer, Numerology. If any of these don't
have their own dedicated route (e.g. if "Gemstones" is actually a section
within `/vedic-astrology` rather than its own page), link to wherever the real
content actually lives — do not fabricate a route that doesn't exist.

### 4. "Ask your chart anything" banner
Headline, one-line description, a button linking to the real AI astrologer
chat, and a **real, sourced photo** (a warm, candid lifestyle image — someone
using their phone in a cozy setting) from Unsplash/Pexels, same sourcing
discipline as the hero photo — note the source in a comment.

### 5. Proof strip
Reuse the same honest three-part framing already established across every
other page this week: validated/computed data, personal to the exact birth
data entered, and honest about not inventing false certainty. Keep this
consistent in wording with what's already live on the category pages, not a
new version of the same idea.

### 6. Final CTA
Two cards: Kundali Report and Birthday Blueprint. **Verify the real current
prices before writing them** — don't assume ₹199 for both is still accurate;
check `src/lib/pricing.ts` or wherever the authoritative price lives, same as
was done for the Birthday Blueprint page.

### 7. Footer — full four-way sitemap (the actual interlinking fix)
List every category and its real sub-pages, verified working:
- Vedic Astrology: Kundli, Kundali Matching, Dasha Timing, Sade Sati, Muhurat Finder, Gemstones
- Birthday & Celebrity: Celebrity Birthday Twins, Today's Birthdays, Birthday Blueprint, Age Calculator
- Mystic Corner: Numerology, Western Zodiac, Chinese Zodiac, Tarot, Compatibility
- Science & Longevity: Life Expectancy, Biological Age
- Company: How It Works, Privacy, Contact

**Verify every single one of these resolves for real before shipping** — this
list is a starting point from prior build reports, not a guarantee; things may
have changed since. This footer, present on the homepage, is the actual
mechanism that closes the "pages don't link to each other" gap identified
earlier — get it right.

### On stats — no fabrication
Do not invent numbers (a made-up "500+ celebrities" style claim). If a genuine,
real count is available from real data (e.g., the actual length of
`celebrities.json`), it's fine to state it accurately. Otherwise, avoid numeric
claims entirely rather than estimating.

### SEO check before shipping
Check the current homepage's existing H1, meta title/description, and any
structured data (schema.org) before replacing them. The new hero headline
becomes the new H1, which is expected given this is an intentional redesign —
but make sure the meta title/description are thoughtfully updated to reflect
the new positioning, not left stale or accidentally blanked.

---

## PART 2 (small, optional — flag if it feels risky, skip rather than force it)

Carry a matching color-coded accent into each of the four category pages' hero
sections **only** — the same gold/coral/teal/green used for that category's
orbit tile on the homepage, as a small accent element (e.g. a subtle colored
glow or a small matching icon), for visual family resemblance between the
homepage and the page it links to. **This must not touch any other section or
content on those four already-shipped, tested pages** — hero-only, accent-only.
If this feels like it risks destabilizing any of those pages, skip it and
report that rather than forcing it in.

---

## TESTING REQUIREMENTS

- Every link verified resolving to a real page — the full footer sitemap list,
  the four orbit tiles, the sub-tools row, and the AI astrologer CTA.
- Mobile responsiveness: the four-tile orbit row and the multi-column footer
  need a sensible mobile layout (e.g. 2x2 grid or single column for the orbit
  row, stacked footer columns) — verify on a real mobile width, not just that
  nothing overflows.
- Confirm animations respect `prefers-reduced-motion`.
- **Real performance check, not just "it works" — this is the homepage:** run
  a Lighthouse/PageSpeed check on the preview, specifically on a simulated
  mobile connection, and report the real scores (especially Largest Contentful
  Paint and Cumulative Layout Shift) before and after this change. Serve the
  two sourced photos as optimized WebP, sized appropriately for where they're
  displayed (not full-resolution originals). If the continuous hero animations
  measurably hurt performance on mobile, scale them back for mobile specifically
  (e.g. a static hero image with no rotation/twinkle below a certain viewport
  width) rather than shipping a slower homepage for the sake of the animation —
  `prefers-reduced-motion` alone does not cover this, since most users won't
  have that preference set.
- Confirm both real photos are properly sourced (not placeholders), reasonably
  sized/compressed, and their source is noted in a code comment.
- Confirm the DOB entry still works end-to-end via the real, existing logic.
- Full existing test suite passes before and after.
- Use `wrangler versions upload` for an isolated preview — do not run a real
  `wrangler deploy`. Stop once the preview is fully verified and report back
  for explicit go-ahead before merging to `develop` or deploying for real.

---

## WHAT NOT TO DO
- Do not fabricate any statistic, count, or claim.
- Do not use a placeholder or generic gradient where a real, sourced photo was
  requested — source real images from Unsplash/Pexels.
- Do not link to any page/route that hasn't been verified to actually exist.
- Do not remove the real, working DOB-entry mechanism — reuse it.
- Do not touch `main`.
- Do not merge this branch or run a real `wrangler deploy` without explicit
  go-ahead — this is the homepage, treat it with more caution than a category
  page, not less.
