# Migration — Bug Log (Rule 6)

Format: group · page · what broke · cause · fix · retest.
Supersedes `docs/run1-bugs.md` (carried over below).

## VEDIC run

### BUG-V1 — `/muhurat` two `<select>` with no accessible name (axe `select-name`, critical)
- Where: `/muhurat` — the "Occasion" and "Look ahead" `<select>` elements. Their
  visible `<label>`s were not programmatically associated (no `htmlFor`/`id`), so axe
  flagged a **critical** `select-name` violation (2 nodes) on live staging. Pre-existing
  in the page content; surfaced by the Step-0 axe scan during this run.
- Cause: the labels lacked `htmlFor`, and the selects lacked `id`/`aria-label` — unlike
  the sibling date/city inputs on the same form, which already use `htmlFor`+`id`.
- Fix: added `id` + `aria-label` to each `<select>` and `htmlFor` to each `<label>`
  (`src/pages/MuhuratPage.tsx`). No logic, content or styling change.
- Retest (fresh deploy `021246c3`, chromium/webkit/android): `/muhurat` axe now reports
  only `color-contrast` (INV-2), **no `select-name`** — critical cleared. Muhurat still
  200 · single h1 · theme=vedic · 0 console errors; unknown-city negative path still
  blocks submit with no crash; full unit suite unchanged (1888/1888).

_(other bugs logged here as found during Step 2/3 verification)_

## BIRTHDAY run

### BUG-B1 — `/family` rendered no central shell (theme=null, no site header/main)
- Where: `/family` (FamilyDashboard). The page is **feature-flag-disabled for launch**
  (`FAMILY_DASHBOARD_ENABLED = false`), so the ONLY reachable branch was a bare
  `min-h-screen` "coming soon" card with no `.paj` root — the Step-0 harness read
  `data-theme=null`, `hasSiteHeader=false`, `singleMain=0`. The migration had moved the
  deeper (auth/premium/loaded) branches onto `ToolLayout` but not this always-on one.
- Cause: the feature-flag early-return predates the migration and was the live path.
- Fix: migrated the feature-flag-disabled branch to `ToolLayout` (theme=birthday,
  eyebrow/h1/lead + breadcrumb + footer), coming-soon content kept as children. No flag
  logic changed (still disabled). `src/pages/FamilyDashboard.tsx`.
- Retest (fresh deploy): `/family` → 200 · single h1 · data-theme=birthday · site header +
  single `<main>` · 0 console errors on all 3 browsers.

### BUG-B2 — `/birthday-report` Country `<select>` had no accessible name (axe `select-name`, critical)
- Where: the gifter/report form Country `<select>` — visible `<label>` not associated.
  Pre-existing page content, surfaced by the Step-0 axe scan. Same class as VEDIC BUG-V1.
- Fix: `htmlFor="birthday-report-country"` on the label, `id` + `aria-label="Country"` on
  the select (`src/pages/BirthdayReport.tsx`). No logic/content/style change.
- Retest (fresh deploy): birthday-report axe no longer reports `select-name`.

### BUG-B3 — `/leaderboard` three filter dropdowns had no accessible name (axe `button-name`, critical, 3 nodes)
- Where: the Country / Age-group / Sort Radix `SelectTrigger`s (rendered as
  `role=combobox` buttons) had no label. Pre-existing content, surfaced by axe.
- Fix: added `aria-label` to each of the three `SelectTrigger`s
  (`src/pages/Leaderboard.tsx`). No logic/content change.
- Retest (fresh deploy): leaderboard axe no longer reports `button-name`.

### BUG-B4 — `/celebrity/:slug` scrollable table regions not keyboard-focusable (axe `scrollable-region-focusable`, serious, mobile only)
- Where: the "Birthday & Personal Facts" and "Planetary positions" `overflow-x-auto`
  table wrappers overflow at 390px with no focusable children, so they were not keyboard
  scrollable. Pre-existing content, surfaced at mobile viewport by the axe scan.
- Fix: added `tabIndex={0}` + `role="region"` + `aria-label` to both table wrappers
  (`src/pages/CelebrityPage.tsx`). No data/content change.
- Retest (fresh deploy): celebrity profile axe no longer reports
  `scrollable-region-focusable` (only the pre-existing INV-2 `color-contrast` remains).

### INV-3 — invalid BIRTHDAY generated routes return 200 (client `<Navigate>` soft-404), not a real 404 status
- Where: invalid `/born-on/:slug`, `/celebrity/:slug`, `/born-on/:m/:d` etc. The pages
  parse/validate params and, when invalid, do a client-side `<Navigate to="…" replace />`
  redirect (or a soft "not found" branch). This is PRE-EXISTING SPA behaviour: the
  Cloudflare worker serves 200 for every path and React decides what to render, so there
  is no real HTTP 404 for unknown template params.
- Status: documented honestly (Fifth Rule). The migration preserved the existing
  redirect/soft-404 logic byte-for-byte — it did not introduce or worsen this. Emitting a
  real 404 status for infinite generated templates requires worker-level route awareness
  (a server change), which is out of scope for a per-page layout migration and risky to
  the SPA. Flagged for the NEUTRAL/FINAL run (which owns 404/error states) to decide.
  Measured HTTP statuses for invalid routes are recorded in the BIRTHDAY report.

### INV-2 — axe `color-contrast` serious violations (investigated)
- Where: present on the already-migrated run-1 page `/kundali` (6 nodes) and on
  non-migrated regression pages alike — i.e. pre-existing, project-wide, from the
  shared shadcn `muted-foreground` / accent tokens, NOT introduced by this run.
- Status: tracked. A site-wide token contrast fix is a central design-system change
  (affects every theme/page), out of scope for a per-page layout migration; logged
  here so the NEUTRAL/FINAL token-consolidation run can address it once centrally.

## MYSTIC run

### BUG-M1 — `/compatibility` two sign `<select>` had no accessible name (axe `select-name`, critical, 2 nodes)
- Where: `CompatibilityPage` — the "Sign 1" / "Sign 2" `<select>` dropdowns. Their visible
  labels are plain `<p>` text (not `<label htmlFor>`), so axe flagged a **critical**
  `select-name` violation (2 nodes) on live staging, on both `/compatibility` and every
  `/compatibility/:s1/:s2` pair page, all three browsers. Pre-existing page content, surfaced
  by the Step-0 axe scan during this run (same class as VEDIC BUG-V1 / BIRTHDAY BUG-B2).
- Fix: added `aria-label={label}` (label = "Sign 1"/"Sign 2") to each `<select>`
  (`src/pages/CompatibilityPage.tsx`). No logic/content/style change.
- Retest (fresh deploy, chromium/webkit/android): `/compatibility` + `/compatibility/aries/leo`
  axe no longer reports `select-name` — critical cleared. Only pre-existing INV-2
  `color-contrast` remains.

### BUG-M2 — `/articles/tarot-card-by-date-of-birth` scrollable table regions not keyboard-focusable (axe `scrollable-region-focusable`, serious, mobile)
- Where: `TarotByDateOfBirthArticle` — the "tarot by zodiac sign" and "life path tarot" tables
  sit in `overflow-x-auto` wrappers that overflow at 390px with no focusable children, so they
  were not keyboard scrollable. Pre-existing content, surfaced at mobile viewport by the axe
  scan (same class as BIRTHDAY BUG-B4).
- Fix: added `tabIndex={0}` + `role="region"` + `aria-label` to both table wrappers
  (`src/pages/articles/TarotByDateOfBirthArticle.tsx`). No data/content change.
- Retest (fresh deploy): tarot article axe no longer reports `scrollable-region-focusable`.

### BUG-M3 — `ChineseZodiacArticle` JSX shell mismatch after migration (build-time, caught pre-deploy)
- Where: during the shell swap the old `</main>` closing tag and a stray `</>` fragment were
  left in place while the opener became `<ArticleLayout><section>`, producing an unclosed-tag
  parse error. Caught by the post-migration unit run (`vitest` esbuild transform) BEFORE any
  deploy — 1 test file failed, total dropped 1888→1874.
- Fix: closed with `</section></ArticleLayout>` (`src/pages/articles/ChineseZodiacArticle.tsx`).
- Retest: unit suite back to **1888/1888**; typecheck clean; page renders 200 · h1=1 ·
  theme=mystic on all three browsers on live staging.

### INV-M4 — validator.schema.org returned HTML, not JSON (external tool unavailable)
- The Step-0 harness posts each live URL to `https://validator.schema.org/validate`; this run
  the endpoint responded with an HTML document (`<!DOCTYPE …`) instead of JSON for every route,
  so the online JSON-LD validation could not run (not a page defect). The harness's **structural
  JSON-LD fallback** (parse every `application/ld+json` block, check `@type`) ran on all 21
  routes × 3 browsers: **0 parse errors, 0 missing @type** (7–9 valid blocks per page). JSON-LD
  integrity verified locally; the online validator is flagged as externally unavailable, per the
  Fifth Rule (not reported as "validated" when it did not run).

### INV-M5 — transient HTTP 429 on an external resource during the rapid 3-browser crawl
- A few rows logged one console error: `Failed to load resource: 429` on `/compatibility`,
  `/compatibility/aries/leo` and `/tarot-card-by-birthday` — intermittent (different browser each
  pass), a rate-limit from hammering staging with 63 fast page loads, not a page error. Re-verified
  on a fresh deploy: see MYSTIC report for the clean re-run.

## Carried over from run 1 (`docs/run1-bugs.md`)

### INV-1 — Prerendered HTML shows two `<h1>` (investigated — NOT a bug)
- Non-migrated AND migrated pages alike show 2 `<h1>` in the static prerendered HTML
  — the pre-existing Part AO prerender LCP-h1 technique, project-wide. The hydrated
  DOM has a single `<h1>` on every migrated page (verified live). No fix needed.

## NEUTRAL run (docs/migration-neutral-report.md)

### STEP00 — interrupted SCIENCE work stashed (not discarded)
- Working tree at run start had 17 uncommitted modified files, all SCIENCE-group pages
  (LifeExpectancy, BiologicalAge*, CountryComparison, PlanetaryAge, WeightOnPlanets,
  Longevity*, Generation, Hindi*, CoachLandingPage, CategoryLandingPage, WhatGenerationAmI).
  Per STEP 00.1 they belong to the SCIENCE run, not NEUTRAL → `git stash push -u` with a clear
  message (`stash@{0}`). To be resumed in the SCIENCE run. Nothing discarded.

### BUG-N1 — AuthNav "Sign In" button invisible on the navy site-header (axe color-contrast, FIXED)
- Where: `src/components/AuthNav.tsx` signed-out state. `.paj .site-header` sets `color:#FFFFFF`
  on descendants; the shadcn `<Button variant="outline">` ("Sign In") renders `bg-background`
  (ivory) → white text on ivory = contrast 1.06 (confirmed visually in the captured header
  screenshot: an invisible white pill before "Join Free"). **Pre-existing and site-wide** — the
  same component renders on every group's pages (old raw pages used the same navy `<header>` +
  AuthNav) and the same violation is present right now on prior-migrated pages
  (/numerology, /kundali, /zodiac, /life-expectancy).
- Fix: explicit navy-header styling on the Sign In button — `bg-transparent border-white/50
  text-white hover:bg-white/10 hover:text-white`. Restores the obviously-intended outlined
  look; benefits all groups. Retest after fresh deploy below.

### INV-N2 — remaining color-contrast is pre-existing, site-wide a11y debt (NOT cleared this run)
- The Step-0 axe scan reports `color-contrast` (serious) on the neutral routes, but the SAME
  violations exist on every previously-"passed" group page on this same staging build
  (/numerology 12 nodes, /kundali 6, /zodiac 10, /life-expectancy 7). Sources are SHARED global
  components and pre-existing page content, NOT this run's shell swap:
  • CookieConsent banner (`.bg-accent` "Accept All" ~1.04; legal links `.text-accent[href$=privacy]`/
    `a[href$=terms]` ~1.04) — global overlay on every page.
  • Navigation search box (`.border-input.bg-background`, light text on ivory) and brand wordmark
    (`.font-heading` gradient, ~1.5).
  • Page content: muted helper text on ivory/tinted boxes (`text-muted-foreground`, `text-slate-400`,
    `text-gray-400`), category chips (blog `text-pink-600`/`text-teal-600`/… on /10 tints, 3.0–4.1),
    in-page `/auth?signup=true` CTA (navy-on-navy 1.03). Heaviest on /blog (78 nodes), /pricing (13).
- Decision: a correct fix is a dedicated CENTRAL a11y pass (CookieConsent + Navigation + shadcn
  token contrast + per-page content colours) verified across ALL groups — it changes shared chrome
  on ~180 routes, so it must not be done blind in a headless run (Rule 9: no regressions elsewhere;
  keep approved design). Logged honestly rather than reported as cleared (Fifth Rule). This is the
  primary reason NEUTRAL is COMPLETE: NO.

### INV-N3 — transient HTTP 429 during the rapid 3-browser crawl (not a page defect)
- 3 rows logged one console error `Failed to load resource: 429` (webkit /auth, android /gift,
  android /auth) — intermittent rate-limit from hammering staging with 75 fast loads. Same class
  as MYSTIC INV-M5. Re-verified on the fresh deploy below.

### INV-N4 — homepage `data-theme` not on a `.paj` root (by design)
- The harness reads `data-theme` from `document.querySelector('.paj')`; the homepage keeps its
  approved bespoke `.hp` shell (NEUTRAL note: "keep its approved design"), so it reports theme=null.
  It IS connected to the central system via `data-theme="neutral"` on its own root + the central
  themes.css import. Not a defect; the generic harness just looks for `.paj` specifically.

### INV-N5 — `.paj` removal deferred (blocked by SCIENCE)
- The NEUTRAL note ends with "once no page uses it, remove the old `.paj` styling system." The
  central layouts THEMSELVES render on `.paj` (coexistence design), and SCIENCE pages are not yet
  migrated (stashed at STEP00). `.paj` cannot be removed until the SCIENCE (and FINAL) runs are done.
  Deferred, not attempted. Second reason NEUTRAL is COMPLETE: NO.

## SCIENCE run (docs/migration-science-report.md)

### STEP00 — resumed the NEUTRAL-stashed SCIENCE work (nothing discarded)
- The SCIENCE Step 1-2 migration (recovered from NEUTRAL's `stash@{0}`, STEP00.1) was already
  committed as `8471f2f` before this session. Working tree was clean at run start. This run did
  Step 0 (routes harness), Step 2 (live-staging deploy + 3-browser verify + input/gating tests),
  the two a11y fixes below, and the Step 3 full retest. Baseline unit suite: 1888/1888.

### BUG-S1 — `/country-comparison` "Current age" `<input type=number>` had no accessible name (axe `label`, critical, 1 node)
- Where: `CountryComparison` controls bar — the age `<input type="number">` has a visible
  `<span>Current age:</span>` beside it but no programmatic association, so axe flagged a
  **critical** `label` violation (1 node) on live staging, all three browsers. Pre-existing page
  content, surfaced by the Step-0 axe scan (same class as VEDIC BUG-V1 / BIRTHDAY BUG-B2 / MYSTIC BUG-M1).
- Fix: added `aria-label="Current age"` to the `<input>` (`src/pages/CountryComparison.tsx`).
  No logic/content/style change.
- Retest (fresh deploy `b18cc1f3`, chromium/webkit/android): `/country-comparison` axe no longer
  reports `label` — critical cleared. Only pre-existing INV-S3 `color-contrast` remains.

### BUG-S2 — scrollable overflow regions not keyboard-focusable (axe `scrollable-region-focusable`, serious)
- Where: `overflow-x-auto` wrappers that overflow their viewport with no focusable children, so
  they were not keyboard scrollable. On `/planetary-age` the "Facts that will break your brain"
  carousel (all 3 browsers); and at 390px mobile the data tables on `/biological-age-calculator`,
  `/how-long-will-i-live`, `/articles/bryan-johnson-blueprint-alternative`,
  `/articles/longevity-supplements`, `/articles/famous-people-lived-to-100`. Pre-existing content,
  surfaced by the axe scan (same class as BIRTHDAY BUG-B4 / MYSTIC BUG-M2).
- Fix: added `tabIndex={0}` + `role="region"` + descriptive `aria-label` to each of the 7 wrappers
  (`PlanetaryAgePage.tsx`, `BiologicalAgeCalculatorPage.tsx`, `HowLongWillILivePage.tsx`,
  `articles/BryanJohnsonArticle.tsx`, `articles/LongevitySupplementsArticle.tsx`,
  `articles/FamousPeopleLivedTo100Article.tsx`). No data/content/style change. Unit tests for the
  two calculator pages (testid wrappers) still 60/60 green.
- Retest (fresh deploy `b18cc1f3`, chromium/webkit/android): all 7 pages — `scrollable-region-focusable`
  gone. Confirmed again on the Step-3 full 177-row crawl: 0 `scrollable-region-focusable` across the group.

### INV-S3 — axe `color-contrast` (serious) is the same site-wide pre-existing debt (NOT cleared this run)
- The Step-0 axe scan reports `color-contrast` (serious) on every SCIENCE page (typically 3–5 nodes
  on simple pages; more where there is denser tinted content). The SAME violations are present on the
  cross-group regression sample on this same staging build (/numerology, /kundali, /compatibility, /pricing,
  homepage, etc.), i.e. it is pre-existing, project-wide, from the shared chrome (CookieConsent "Accept
  All"/legal links, Navigation search box, brand wordmark) and pre-existing page content — identical to
  VEDIC INV-2 / NEUTRAL INV-N2. NOT introduced by this run: the science recolor `#6E5AA6`→`#2F6FB0`
  (blue on white ≈ 5.25:1) passes AA for normal text, so it did not add contrast failures; the flagged
  nodes are the shared overlays/chrome, not the recolored elements.
- Decision: a correct fix is the dedicated CENTRAL a11y / token-consolidation pass that NEUTRAL/FINAL
  already owns (INV-N2), affecting ~180 routes across every theme — it must not be done blind in a
  headless per-group migration (Rule 9). Logged honestly rather than reported as cleared (Fifth Rule).
  This is cross-cutting debt carried by the FINAL run, not SCIENCE-migration work — so it does not block
  SCIENCE COMPLETE: YES (same precedent as VEDIC/BIRTHDAY/MYSTIC, which shipped YES with this same debt).

### INV-S4 — validator.schema.org returned HTML, not JSON (external tool unavailable)
- Same as MYSTIC INV-M4: the Step-0 harness posts each live URL to `https://validator.schema.org/validate`;
  it responded with an HTML document (`<!DOCTYPE …`) instead of JSON for all 59 routes, so the online
  JSON-LD validation could not run (not a page defect). The harness's **structural JSON-LD fallback**
  (parse every `application/ld+json` block, check `@type`) ran on all 59 routes: **479 blocks, 0 parse
  errors, 0 missing @type**. JSON-LD integrity verified locally; the online validator flagged as
  externally unavailable, per the Fifth Rule.
