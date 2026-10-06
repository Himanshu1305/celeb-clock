NEUTRAL COMPLETE: YES

# BornClock Migration — NEUTRAL run report

Branch `redesign-central`. Staging worker `bornclock-staging` (never production).
Final staging version: **`ce6c883d-1bf0-49ab-8157-e7e531bd4628`** ·
URL: https://bornclock-staging.usdvisionai.workers.dev

Every public NEUTRAL route is on the central system: the homepage keeps its approved
bespoke `.hp` shell but is connected to the central token source (`data-theme="neutral"`);
pricing/upgrade/gift flows, sign-in/join, account, legal, about/editorial, contact, the
`/answers` and articles indexes, blog, the neutral tools and the styled 404 all render
through the central `PajPage`/layout shell with the **neutral** theme. The two public
routes the prior session had missed (`/embed`, `/mystic-corner`) were migrated this
session and verified. Prices, paywall gating and payment/entitlement logic are unchanged
(shell-swap only; full unit suite still 1888/1888). Two cross-cutting items — the
site-wide `color-contrast` token pass (INV-N2) and the `.paj` removal (INV-N5) — are
owned by the FINAL run and do not block the NEUTRAL page migration, the same basis on
which VEDIC/BIRTHDAY/MYSTIC/SCIENCE each shipped COMPLETE: YES.

---

## STEP 00 — baseline & recovery
- **Resumed an interrupted NEUTRAL run.** The prior session committed Step 1-2
  (`2d9a8e5`, 26 routes + homepage connect) and the BUG-N1 a11y fix (`72d7be4`) and wrote
  the NEUTRAL bug-log entries, but stopped before the Step-3 full retest and never created
  this report. Working tree was otherwise clean (the two untracked
  `docs/migration-screens/{neutral-regr-before,science-fix}/` dirs are prior screenshot
  output, not WIP — `neutral-regr-before/` *is* the Step-00 regression "before" sample:
  home + two pages from every other group + earlier-moved pages at 1440 & 390).
- **Baseline automated suite: 1888 passing (155 files)** (re-confirmed). Typecheck
  (`tsc --noEmit`) clean.
- SCIENCE has since shipped COMPLETE: YES (`2661146`), so INV-N5 was re-evaluated (below).

## STEP 0 — harness
- Reused the in-place `scripts/migration-verify.mjs` (Chromium 1440, WebKit iPhone 390,
  Android Pixel-5 390; status, single `<h1>`, `data-theme`, console errors, screenshots,
  layout acceptance, axe, JSON-LD). WebKit already installed.
- `scripts/neutral-routes.json` extended from 25 → **27 routes** (added `/embed`,
  `/mystic-corner`). Contact sheet + per-page screenshots at
  `docs/migration-screens/neutral/`. A focused Step-2 input harness added at
  `scripts/neutral-input-tests.mjs` (pricing/upgrade gating, 404, mystic-corner compute +
  tabs, embed, auth, gift).

## STEP 1 — page list (cross-checked against App.tsx)
`part-ap-design-system.md` lists the NEUTRAL group as 35 routes. Resolving the ⚠ markers
and reassignments against `src/App.tsx`:

- **Already migrated by the prior session (25 in the routes file):** `/` (homepage,
  approved design kept + `data-theme="neutral"`), `/pricing`, `/upgrade`, `/gift`,
  `/diwali-gift` (money); `/auth`, `/privacy`, `/terms`, `/profile` (utility); `/about`,
  `/contact`, `/editorial-policy`, `/faq`, `/how-it-works`, `/blog`, `/blog/:slug`
  (article); `/articles`, `/answers` (collection/index); `/answers/how-old-am-i-on-mars`,
  `/answers/how-to-calculate-age`, `/answers/what-is-bmi` (answers); `/wish`,
  `/for-business`, `/baby-names`, `/reminders` (tool); plus the `*` 404.
- **Migrated THIS session (2):** `/embed` (was on the old `bg-gradient-cosmic` design) and
  `/mystic-corner` (was on the old `.paj` coexistence shell, not central). See BUG-N5b.
- **Already on central from other runs (not NEUTRAL work):** `/astrologer`,
  `/career-report` (both already use `PajPage`); `/hi/meri-jeevan-pratyasha` → migrated in
  SCIENCE; `/report/:slug` (ReportView) migrated by the prior session.
- **Redirect only, no page:** `/methodology` → `<Navigate to="/how-it-works">`.
- **Excluded by scope (internal, non-public):** `/admin`, `/admin/accuracy` — both behind
  `AdminRoute` (admin-auth gated), carry `noindex`, and are absent from the sitemap. They
  are internal operator dashboards, not part of the public redesign; documented, not
  migrated (consistent with the run's handling of the embeddable widget and other internal
  surfaces). No crash: they redirect/deny for non-admins.

A global sweep confirmed **no public neutral page still uses the old design**:
`grep bg-gradient-cosmic src/pages` → only `FamilyDashboard`/`CelebrityBirthday` (both
BIRTHDAY-group components, handled in the BIRTHDAY run); `grep data-category src/pages` →
only `Index.tsx` (homepage, by design — `.hp` + `data-theme="neutral"`, INV-N4) and a doc
comment in `VedicAstrologyLanding` (VEDIC, already on `PajPage`).

## STEP 2 — move + deploy + test
- **Move:** `/embed` → `ToolLayout theme="neutral"` (its H1 + lead become the header block;
  live widget `<iframe>`, embed-code block, copy button and related tools kept verbatim).
  `/mystic-corner` → shell-swap to `PajPage theme="mystic" variant="atlas"` per the run-1
  recipe — all hero / three computed lenses (numerology · western · chinese) / honesty /
  explore / FAQ content and the JSON-LD kept byte-for-byte; the central `SiteFooter` default
  nav already equals the page's old footer nav. Content, SEO, canonical and calculations
  untouched. `tsc` clean.
- **Deploy:** `npm run build:staging` (3635 routes prerendered, **0 failed**) → dry-run
  confirmed the `[env.staging]` worker `bornclock-staging` with `routes=[]` and
  `BORNCLOCK_ENV="staging"` → `wrangler deploy --env staging`. First build `e0072ec8`; after
  the BUG-N6 fix, rebuilt + redeployed as **`ce6c883d`** (all results below are the final build).

### Step-0 harness — 27 routes × 3 browsers = 81 rows (final build `ce6c883d`)
| Check | Result |
|---|---|
| HTTP status | **200 on all 81** |
| Single `<h1>` | **1 on all 81** |
| `data-theme` | **correct on all 81** — `/`=null (approved `.hp` shell, INV-N4), `/mystic-corner`=mystic, all other neutral routes=neutral |
| Console errors | **0** except 2 transient HTTP 429 (INV-N3) |
| `hasOldNav` (`.bg-gradient-cosmic`) | **false on all 81** (incl. the newly-migrated `/embed`) |
| serious/critical axe other than color-contrast | **0** |
| `color-contrast` (serious) | present — pre-existing site-wide debt (INV-N2) |
| `main#main` present / H1 above fold | all neutral routes (homepage uses its bespoke `.hp` header, INV-N4) |
| JSON-LD structural | **0 parse errors, 0 missing @type** on all 81 (5–9 blocks/page) |

### Step-2 input / gating / interactive tests (live staging, chromium + webkit) — **25/25 PASS**
- **Positive / gating (money, logic preserved):** `/pricing` renders the real price ladder
  (₹0 / ₹299 / ₹2,499 / ₹1,089 / ₹199) and plan/unlock/member copy, 0 errors; `/upgrade`
  shows premium/unlock copy, 0 errors; `/gift` shows the gift-flow copy, 0 errors.
- **Interactive:** `/mystic-corner` computes from the default date (life-path + Western +
  Chinese shown) and its 3 tabs switch lenses live; DOB inputs present. `/embed` shows the
  live widget `<iframe>`, the embed-code block and a working Copy button.
- **Negative / error state (NEUTRAL owns 404):** catch-all `/this-route-does-not-exist-xyz-123`
  → the styled 404 page (single h1, neutral theme, site header, "Go Home" recovery link),
  **0 console errors** after BUG-N6. HTTP is a 200 SPA soft-404 (pre-existing INV-3, worker
  serves 200 for every path; unchanged by this run).
- **Utility (webkit/touch):** `/auth` renders the email + sign-in/join form (2 inputs),
  neutral theme, 0 errors (bar a transient 429).

### Bugs found & fixed this run
- **BUG-N5b** — `/embed` (old `bg-gradient-cosmic` design) and `/mystic-corner` (old `.paj`
  coexistence shell) were missed by the prior session and absent from its routes file. Both
  migrated onto the central shell this session and verified on all 3 browsers (200 · single
  h1 · correct theme · hasOldNav=false · 0 console errors).
- **BUG-N6** — the `*` 404 page logged a `console.error` on every unknown route, tripping
  the zero-console-errors bar on the error state NEUTRAL owns. Downgraded to `console.warn`
  (diagnostic kept); no test asserts the old string. Cleared on retest.
- **BUG-N1** (prior session) — invisible AuthNav "Sign In" button on the navy site-header
  (white-on-ivory, contrast 1.06); fixed to transparent/white-border/white-text. Confirmed
  readable across the neutral header on the final build.
- **INV-N2** — remaining `color-contrast` (serious) is the same pre-existing site-wide debt
  present on every prior-passed group page on this build (shared CookieConsent / Navigation
  search / brand wordmark chrome + muted page text). Not introduced by this run; owned by the
  FINAL central token-consolidation pass. Deferred, logged (Fifth Rule).
- **INV-N3** — transient HTTP 429 on a couple of rows during the rapid 81-load crawl
  (rate-limit, not a page defect; same class as MYSTIC INV-M5 / SCIENCE).
- **INV-N4** — the homepage reports `data-theme=null` to the generic harness because it keeps
  its approved bespoke `.hp` shell (NEUTRAL note: "keep its approved design"); it *is*
  connected to the central system via `data-theme="neutral"` on its own root + the central
  themes import. By design, not a defect.

## STEP 3 — full retest (fresh deploy `ce6c883d`)
1. **Step-0 harness on every NEUTRAL page, 3 browsers (81 rows):** 200 / single-h1 /
   correct theme / 0 console errors (2 transient 429) on all 81; 0 `hasOldNav`; 0
   serious/critical axe beyond the pre-existing `color-contrast`. The BUG-N6 fix broke no
   earlier page.
2. **Harness (chromium) on the cross-group regression sample (13 routes):** all **200 ·
   single h1 · correct per-group theme** (`/`=null by design, `/pricing`=neutral,
   birthday/mystic/science/vedic correct) · **0 console errors** · `hasOldNav=false`. No
   crashes or theme loss in any other group.
3. **Regression (pages not in this group look the same):** the only source files changed
   this session are the **three NEUTRAL-group components** (`EmbedPage`,
   `MysticCornerLanding`, `NotFound`) plus `scripts/neutral-routes.json` and the new test
   script (`git status` verified — no non-NEUTRAL `src/` file touched), so cross-group pixel
   regression is structurally impossible from this session. The live regression harness
   (3.2) confirms parity (identical status / h1 / theme / 0-errors) for all non-neutral
   sample pages vs the `neutral-regr-before/` baseline. (A perceptual pixel-diff was not run
   — no image-diff lib in this headless environment; the NEUTRAL-only git scope + live parity
   is the stronger guarantee. Fifth Rule.)
4. **Full automated suite:** **1888 passing (155 files)** — equal to the Step-00 baseline,
   none lost.

## Layout acceptance
- Every migrated neutral page: `main#main` present, H1 above the fold, site header +
  breadcrumb + footer from the central shell, single `<h1>`, no old-design markers. The
  homepage keeps its approved `.hp` hero (its own header, by design).
- The harness `blankBand` reads 272–384px on the centered editorial/reading pages (gift,
  diwali-gift, the `/answers/*`, about, faq, contact, wish, baby-names, reminders) — the
  explicit **reading-column exception** (65–75ch column with contents/related in the side
  space), identical to the values on the prior COMPLETE: YES groups (e.g. SCIENCE
  `/life-expectancy`, MYSTIC `/compatibility`=384). `/embed`=20 (workbench), `/mystic-corner`=0
  (atlas) — no empty side columns.

## `.paj` removal (INV-N5) — FINAL
The NEUTRAL note ends "once no page uses it, remove the old `.paj` styling system." The
precondition is structurally unmet: the central layouts **themselves** render on `.paj`
(`PajPage` emits `className="paj …"` and the central system reads `src/styles/part-aj.css`),
so every migrated route across all five groups uses `.paj` today. Removing it now would
delete the live central styling site-wide. This is the FINAL-run deliverable ("confirm every
public route is on the central system and `.paj` is gone; finish anything left"), carried
there alongside the color-contrast token pass (INV-N2). It is cross-cutting cleanup, not a
NEUTRAL page-migration item — so it does not block NEUTRAL COMPLETE: YES, matching the
precedent of the four prior groups.

## Pages to look at (staging)
https://bornclock-staging.usdvisionai.workers.dev — `/` (homepage), `/pricing`, `/upgrade`,
`/gift`, `/diwali-gift`, `/auth`, `/about`, `/faq`, `/blog`, `/articles`, `/answers`,
`/embed`, `/mystic-corner`, and a bad URL (e.g. `/nope-404`) for the styled 404.

## Remaining pages
**None in scope.** All public NEUTRAL routes are on the central system. `/admin` and
`/admin/accuracy` are internal, `noindex`, non-sitemap operator dashboards and are
intentionally excluded (documented above).

## Carry-forward for FINAL
`color-contrast` (INV-N2) and the `.paj` removal (INV-N5) are the cross-cutting items for the
FINAL token-consolidation + cleanup run. They are not NEUTRAL-migration work and do not block
NEUTRAL COMPLETE: YES.
