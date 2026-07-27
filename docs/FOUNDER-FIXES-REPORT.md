# Founder Fixes Report

Branch `founder-fixes` → merged to `develop` → pushed → deployed once.
**Deployed staging version: `6eb1f225-21aa-4b17-bf3e-46f347e00b90`**
(bornclock.usdvisionai.workers.dev + staging.bornclock.com). Generated 2026-07-27.

**Step 0 (merge stack):** `develop` fast-forwarded `overnight-batch` then `seo-content`
(both clean, no conflicts) and pushed (`b697322..d32c389`) before this work began.

**Gate:** `git diff develop..founder-fixes --name-only | grep -E "razorpay-webhook|verify-payment|_crypto"` → **EMPTY** (no payment files touched). Typecheck **47 = baseline, 0 new**. Build **1310 ok, 0 failed**. Gauntlet **135/135**. Smoke test: create-order → `{"error":"Report not found"}` ✓.

---

## FIX 1A — Life Expectancy PDF blank pages

- **Root cause:** every section was a `<div class="page page-break">` forced onto its
  own physical page (`page-break-after: always`); short sections left huge voids
  ("content-then-void"). The overnight "0 blank" check measured TEXT length, not ink,
  so it missed sparse pages.
- **Change:** content-flow model — removed forced per-section breaks (content flows,
  new page only when the next block doesn't fit); per-page margins via `@page`;
  relaxed `break-inside:avoid` on tall containers so they split instead of jumping;
  hid the repeated per-section footer.
- **Evidence** (mobile 390px / dSF3, `scripts/verify-pdf-coverage.mjs`):

  | | Pages | Non-last pages < threshold |
  |---|---|---|
  | BEFORE | 15 | **14/15** sparse (ink 11–48%; content-then-void) |
  | AFTER | 11 | **0** void — every non-last page fills **91–96%** down |

  Visual spot-check (rendered PNGs) confirmed pages 1/8/9 are full; the "~40% blank
  before the title" on page 1 is gone. (Ink density stays 25–58% because the design
  is text-on-white/airy — VERTICAL FILL is the true no-void measure.)

## FIX 1B — Birthday Blueprint PDF (the paid product)

- **Pipeline (resolved with evidence):** CLIENT-SIDE via `react-to-print`
  (`useReactToPrint`, ReportView.tsx) on the live DOM. No server-side PDF exists
  (grep of `api/`+`functions/` = none). The native-table thead/tfoot running header
  lives in the React tree, printed client-side. The ops audit's "client-side only"
  was correct.
- **Changes & evidence:**
  - **(i) Page-1 header-in-body + stray `·LIVE·` + gap:** cover `break-after` is flaky
    on mobile Safari → added legacy `page-break-after: always`. The `·LIVE·`/`·FROZEN·`
    source marker (a verify-print artifact) was shipping in the paid PDF; its
    extractable text now emits only under `window.__VERIFY_PRINT__` (set by
    verify-print.mjs) so customers get an empty span. (0 gate refs in public pages.)
  - **(ii) Solar System Ages ~90% blank:** the planet layout is a CSS Grid, which
    **cannot fragment across print pages** — the whole grid jumped, orphaning the
    heading. In print the cards now render as inline-blocks (`.planet-grid`) so they
    flow; relaxed inherited `.dark-section` break-inside; trimmed padding so
    heading + 7 cards + Neptune fit ONE page. Verified: Solar page now full.
  - **(iii) Cosmic/Ruby ~60% trailing whitespace:** removed the discretionary
    `break-before: page` on `.solar-section` and the numerology section so content
    flows (no-blank-pages mandate).
  - **(iv) Copy:** `Famous {card.name} Personalities` → strip leading "The " →
    "Famous Hermit Personalities".
- **Evidence** (mobile 390px / dSF3):

  | | Pages | Blank/void pages |
  |---|---|---|
  | BEFORE | 24 | Solar page **~4% ink** (heading only), plus a Cosmic-tail void |
  | AFTER | 21 | **0** — Solar page full (all cards + Neptune), no void pages |

  `scripts/verify-print.mjs`: **10/10 assertions pass** (running header per page,
  live-fetch guard, no furniture, no clipping).

## FIX 2 — Tab truncation (portrait)

- **Root cause:** the pillar `TabsList` inherited `justify-center` from the Radix base
  (via `cn`); with `overflow-x-auto` an overflowing centered flex row clips both ends,
  so at ~360–390px the first tab read "ical Blueprint".
- **Change:** added `justify-start` (tailwind-merge drops the base `justify-center`).
- **Evidence:** rendered with the real built CSS at **360px AND 390px** — first tab
  at x=8 (left edge), full "Biological Blueprint" label visible; scroll reaches the rest.

## FIX 3 — Premium action buttons unstyled

- **Root cause:** "Export Longevity Blueprint" and "Copy Summary" were both
  `variant="outline"`, so Export looked unstyled next to filled buttons.
- **Change:** Export → `variant="default"` (primary filled); Copy stays `outline`.
- **Evidence:** rendered with real CSS — Export filled primary (blue), Copy bordered outline.

## FIX 4 — Paywall swap (AUDIT — VERDICT: WORKING CORRECTLY)

- **(a) Keyed off real premium state, not a timer:**
  `isPremium = !cancelledAndExpired && (profile?.premium_status || isInTrial || isPromoActive)`
  (useAuth.ts:247). The Unlock↔Export swap (LifeExpectancy.tsx:738 `{isPremium ? …}`)
  uses this. **The founder's "Unlock CTA disappears after load" is the CORRECT swap** —
  his cancelled-grace account has `premium_status=true`, so once auth resolves,
  isPremium flips true. Not a bug.
- **(b) Free / logged-out gating (all locked, not readable):** Personal Longevity
  Coach → `!isPremium` blur overlay + Upgrade CTA + disabled inputs
  (LongevityCoachChat.tsx:90); 90-Day Plan → `blur-sm select-none pointer-events-none`
  content + "unlock to view" (LifeExpectancy.tsx:884). Unlock CTA persists (isPremium
  stays false; the 1.5s timer only opens the paywall *modal*, never flips premium).
- **Bottom Unlock CTA:** already present — "Unlock Your Full 90-Day Plan" gradient CTA
  at the end of the last locked section (line 906). Both conditions TRUE → **no code
  change required.**

## FIX 5 — Answers pages: layout + inbound links

- **Root cause:** the `/answers/*` pages rendered only a breadcrumb — none used the
  shared `Navigation`/`Footer`, so they looked orphaned (no way back into the site).
- **Change:** new `AnswerLayout` (site nav + AuthNav + Footer) applied to all **13**
  answer pages. Added key answer links to the global Footer (site-wide, incl. home +
  age-calculator); a contextual Related-Questions block on the age-calculator page;
  a Popular-Questions strip on the home page.
- **Evidence (inbound audit, excluding the App.tsx route registration):** every
  `/answers/*` route now has **≥2 real inbound links (3–10 each)**. The countdown
  page: **6** inbound, incl. home ✓, age-calculator ✓, footer ✓.

## FIX 6 — Celebrity-birthday search + India

- **Root cause:** the search queried the tiny static `@/data/birthdayData` via
  `searchCelebrities`, so almost every name returned nothing and the category filtered
  an empty set (felt broken).
- **Change:** rewired `CelebritySearch` to query `celebrity_sitelinks` (28k rows) via
  the Supabase client — name `ilike`, optional category via `occupation`/`known_for`,
  top 20 by sitelinks, **debounced 400ms**. Mounted `CountryExtrasSection` on the page
  (below the featured grid, same props as TodaysBirthdays).
- **birthdayData consumers checked before changing:** `searchCelebrities` was used ONLY
  by CelebritySearch (now unused, left in place). `birthdayData` / `getBirthdayData` /
  `birthdayDatabase` remain used by `celebrities.ts`, `WikimediaService`,
  `CelebrityLongevityService`, `BirthdaySearchService` — untouched, nothing removed.
- **Evidence (390px):** input visible + typeable; "Tendulkar"→Sachin, "Kohli"→Virat;
  category filter changes results (James all=20 → Scientists=16). CountryExtras mounts
  with the selected date's month-day.

---

## Founder re-test checklist (phone, on staging)

staging.bornclock.com or bornclock.usdvisionai.workers.dev — version `6eb1f225…`:

1. **Life Expectancy PDF** — download on your phone: pages should be full, no blank
   regions before/after content; page 1 has no big gap before the title.
2. **Birthday Blueprint PDF (paid)** — download: (a) page 1 header sits at the top of
   each page, no stray "·LIVE·"; (b) the **Solar System Ages** page shows the heading +
   all planet cards + Neptune on one page (not blank); (c) less trailing whitespace on
   the Cosmic/Ruby page; (d) tarot reads "Famous Hermit Personalities".
3. **Pillar tabs** (longevity report) — in portrait at ~360–390px, the first tab reads
   the full "Biological Blueprint" (not "ical Blueprint").
4. **Premium buttons** — "Export Longevity Blueprint" is a filled button; "Copy Summary"
   is outlined.
5. **Paywall** (working as designed) — logged out, the Longevity Coach + 90-Day Plan are
   blurred/teased with Unlock CTAs top and bottom; logged in (premium), they unlock and
   the buttons swap to Export/Copy.
6. **Answers pages** — /answers/how-many-days-until-my-birthday now has the site
   header/logo + footer; reachable from the home "Popular Questions", the age-calculator
   "Related Questions", and the footer.
7. **Celebrity search** — /celebrity-birthday: type a name (e.g. "Kohli") → results
   appear; change the category → results change; pick a date → the "From India" section
   shows for IN visitors.
