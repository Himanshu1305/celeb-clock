# BornClock — Fix Run RC2 report

**RC2 READY: YES**

All five fixes are done and verified on the live staging worker **bornclock-staging**,
RC2 is deployed and re-tested, the automated suite and all journeys are green, and
`redesign-central` is merged (fast-forward) into `develop` and pushed. Production
(`bornclock`) was never touched; no Cloudflare token was added to GitHub.

Two items genuinely need the person (they are dashboard-only and do **not** gate this
release candidate per the run's YES criteria) — the one-time staging test-mode payment
run and the Supabase credits DDL apply. See **Needs the person** at the end.

- **RC2 staging version:** `da27edae-ec32-4ee8-b09c-c0be65f3c410`
  (`https://bornclock-staging.usdvisionai.workers.dev`)
- **Undo tag (pre-merge `develop`):** `pre-rc2-merge` → `2352e3c`
- **Current production version (read-only, rollback record):**
  `79be8c6c-2505-4156-9f18-b140ad3dfbe8` (deployed 2026-10-06; this *supersedes* the
  FINAL report's `e88b74d3`, which production has since replaced). **Re-capture this ID
  immediately before launch** — it changes on any production redeploy. One-command
  rollback after launch: `npx wrangler rollback 79be8c6c-2505-4156-9f18-b140ad3dfbe8`.

---

## STEP 0 — resume / baseline
- Leftovers from an interrupted RC2 attempt were found in the tree and belonged to
  unfinished fixes, so they were finished (not stashed): `CookieConsent.tsx` (Fix 1
  start), `scripts/perf-budget.{mjs,json}` + `.github/workflows/perf-budget.yml` (Fix 5
  start), `scripts/_earlier-moved-routes.json` (the 161-route list).
- Baseline automated suite at start: **1888 passed / 1888** (vitest, 155 files); it
  stayed **1888/1888** after every fix and `tsc --noEmit` was clean throughout.

---

## FIX 1 — Colour contrast, centrally ✅

**What changed.** A central darken-only token pass plus the element-level colours the
tokens didn't reach, and the real root cause of the dark-on-dark buttons:
- **Central tokens** (`src/index.css`, `src/styles/central/themes.css`): shadcn
  `--muted-foreground` `#5B6472→~#3A4452`; `.paj --muted` `#5B6472→#434C59`; per-theme
  `--accent-text` darkened (mystic `#6E5AA6→#4C3E78`, vedic `#806125→#6B4F1E`); gold
  bronze ink darkened. `--accent` (brand colour for borders/dots/fills, a UI/3:1 role)
  is unchanged, so the approved look is preserved.
- **Cookie banner** (`CookieConsent.tsx`): "Accept All" → navy primary button; legal
  links → navy underlined (was accent-on-ivory ~1.04:1).
- **The dark-on-dark buttons' root cause:** `part-aj.css` sets `.paj a{color:inherit}`
  **and** `.paj button{color:inherit}`, which stripped the explicit `text-white` /
  `text-primary-foreground` off filled button-links (shadcn `Button asChild` + hand-styled
  `bg-* text-white` CTAs) → navy-on-navy / dark-on-rose. `themes.css` now restores them by
  specificity (`.paj a.text-white`, `.paj button.text-primary-foreground`, …).
- **Element-level** (darken-only): `text-muted-foreground/70`→full; `text-gray-400/500`→`600`;
  `text-amber-500/600`→`700`; `text-red-600`→`700` on red-100; numerology master-badge
  hexColors + dark-code-box captions; WhatsApp buttons `#25D366→#15803D`; LanguageToggle
  inactive → `white/75` on the navy header; Navigation gold buttons force navy text;
  biorhythm `teal-600→700`; compatibility pair "unlock" CTA `rose-600→700`.

**Evidence (live staging axe, axe-core 4.10.2).**
- **Before (start of run / FINAL state):** serious `color-contrast` on ~42 of 48
  regression-sample rows (effectively every page) + the cookie banner.
- **After (RC2):** regression sample — **13 cross-group routes + one page per layout
  type = 16 routes × 3 browsers (chromium 1440 / WebKit iPhone 390 / Android Pixel5 390)
  = 48 rows → 0 serious/critical, 0 console errors, 0 non-200, single `<h1>` everywhere.**
- Mystic harness (the hub→numerology→compatibility→zodiac set, 21 routes × 3 browsers =
  63 rows) → **0 serious**, surfacing and clearing a few non-sample pages too.
- Because the change touches every page, the FINAL **161-route Chromium re-crawl** of all
  previously-moved routes was repeated → **161 × 200, single `<h1>`, 0 real console
  errors** (2 transient HTTP 429s on different routes per pass = staging rate-limiting
  under a rapid crawl, same class as FINAL INV-M5/N3, not page defects).
- Contact sheets + raw axe JSON: `docs/migration-screens/rc2/`, `.../rc2-mystic/`,
  `.../rc2-161/`.

## FIX 2 — Tap responsiveness (TBT) on homepage and Kundli ✅

**What changed (JS deferred only; no prerendered text/links removed).**
- **Homepage** (`Index.tsx`): the below-the-fold "Born today" band (celebrity ranking +
  a Supabase count + Wikipedia image fetches) now defers its work behind an
  IntersectionObserver until it nears the viewport. The band is client-only (never
  prerendered); the static directory and H1/lead stay in the prerendered HTML.
- **Kundali** (`KundaliPage.tsx`): the chart + the written reading (`KundaliChart`,
  `VedicReading`, `PastPeriodReflection`) are code-split with `React.lazy` and load on
  demand — they only render after the visitor generates a chart. The eager intro/form/tabs
  (the prerendered content) are untouched; chart output is unchanged.
- **Prerendered-HTML preservation confirmed** in `dist/index.html`: 49 internal links
  (full 4-column directory + footer) and `<h1>Everything your birth date reveals.</h1>`
  present before any JS.

**Speed table — staging RC2, `scripts/final-speed.mjs` (Pixel 5 + 4× CPU, warm cache,
median of 5). Load average at measurement: 1.40** (1-min; well under the 4.0 = half-of-8
gate). Targets: LCP < 2000ms / CLS < 0.05 / TBT < 200ms.

| Layout | Route | LCP | CLS | TBT | FINAL TBT → RC2 | Targets |
|---|---|---|---|---|---|---|
| tool | /age-calculator | 384 | 0 | 29 | 141 → 29 | ✅ ✅ ✅ |
| report | /kundali | 424 | 0 | **102** | **326 → 102** | ✅ ✅ ✅ |
| hub/home | / | 416 | 0 | **101** | **363 → 101** | ✅ ✅ ✅ |
| collection | /celebrity | 392 | 0 | 44 | 189 → 44 | ✅ ✅ ✅ |
| article | /blog | 400 | 0 | 48 | 195 → 48 | ✅ ✅ ✅ |
| money | /pricing | 328 | 0 | 14 | 131 → 14 | ✅ ✅ ✅ |
| utility | /privacy | 328 | 0 | 27 | 142 → 27 | ✅ ✅ ✅ |

**TBT is now under 200ms on all 7 layouts** — the two FINAL-run misses are fixed
(/ 363→101, /kundali 326→102). LCP < 2.0s and CLS < 0.05 everywhere. Raw:
`docs/migration-screens/final-speed-rc2.json`.

## FIX 3 — Real "not found" responses ✅

**What changed** (`functions/_worker.ts`): the worker (which runs before asset serving)
now returns a real **HTTP 404** for *provably-invalid* generated addresses while still
serving the styled page body — fixing the soft-200. Only FINITE, immutable,
fully-enumerated param spaces are judged, derived from `scripts/prerender-routes.mjs`
(the same source that generates the real pages): impossible calendar dates
(`/born-on/…`, `/birthday/…`, using Feb=29 so only *impossible* dates are rejected), the
12 zodiac signs, invalid `/compatibility` pairs, 12 Chinese animals, 12 Vedic rashis, the
numerology set, the 12 birthstone months.

**Safety — a valid page can never become a 404.** Celebrity slugs (the ~3,107-entry DB,
not just the curated subset) and blog slugs are **never** judged at the edge — their
validity can't be determined reliably there, so (per the brief) they are left exactly as
they are. Query-param, `/results`, `/report`, `/auth`, `/profile`, `/admin`, upgrade/
checkout and every other non-enumerated route are untouched. 404 responses are
`noindex` (a genuine not-found state, allowed by Rule 6).

**Evidence** (`scripts/rc2-404-check.mjs`, final RC2): **47/47 correct** —
- 18 invalid samples → **404** (e.g. `/born-on/february-30`, `/birthday/13/40`,
  `/compatibility/aries/dragon`, `/zodiac/dragon`, `/numerology/10`, `/birthstone/decembr`).
- 19 valid samples → **200**, including the cross-system guard `/chinese-zodiac/dragon`
  (200, dragon *is* a Chinese animal) vs `/zodiac/dragon` (404, not a zodiac sign), leap
  `/born-on/february-29` (200), and `/compatibility/leo/aries` (301→200 canonical).
- 10 valid non-sitemap routes → **200** (`/results`, `/results?day=1&month=1`, `/auth`,
  `/profile`, `/admin`, `/upgrade`, `/report/<slug>`, `/celebrity?q=…`, `/blog?tag=…`,
  `/?utm_source=…`).
- **Status crawl of all 3,635 sitemap URLs → 3,635 × 200, 0 non-OK** — no valid page
  regressed to a 404. (`docs/migration-screens/final-status-crawl.json`.)
- Confirmed in the birthday journey: `/born-on/february-30` now returns httpStatus 404
  with the styled page and no JS crash (the journey assertion was updated from the old
  soft-200 expectation).

## FIX 4 — Monetisation blocker: the facts ✅ (one person-gated item open)

Established from evidence only (reports, decisions, git history, code); no pricing,
payment or entitlement logic was changed. The FINAL report's "carried Part-AO
monetisation blockers (preview-lock, subscriber credits, member pricing)" is a
**mis-attribution** — those are *feature names* from the July monetisation-model work, not
Part AO's blockers (Part AO's real blockers were: live payment test, per-category layout
polish, staging provisioning). Current state of each:

- **Preview-lock (content gating)** — **IMPLEMENTED, not a blocker.** `ReportView.tsx:537`
  `isLocked = !isAdmin && !row.is_paid`; locked sections render inspect-safe placeholders
  (no real data in the DOM). Verified live (paywall surface opens, 0 errors).
- **Subscriber credits** — **IMPLEMENTED, not a code blocker.** `api/get-credits.ts` does
  full lazy accrual (`toAdd = min(elapsed·3, 9−current)`); `api/redeem-credit.ts` +
  auto-redeem in `ReportView.tsx`. API smoke green. *Standing dependency:* the Supabase
  columns `report_credits` / `credits_granted_month` must be applied in Studio, else
  credits read 0 (dormant by design) — a person-run SQL step, not a code gap.
- **Member pricing** — **NOT OPEN; deliberately removed** in commit `0edf8a5` ("drop member
  cash price — two prices only"). `api/create-order.ts` hardcodes a single price
  `{ INR: 19900, USD: 699 }` ("Single price for everyone"); grep finds no member-price
  remnants. (The ₹299/mo · ₹2,499/yr *subscription* tiers are a separate, implemented
  thing and render live.)
- **Payment test** — **the one genuinely-open monetisation item.** A single end-to-end
  test-mode purchase on staging has never been run. The code + invoice protection are
  ready (`verify-payment.ts` throws a `skip` sentinel in TEST mode so no real GST invoice
  number is consumed), but the run needs **dashboard steps only the owner can do**
  (staging sign-in did not work headless this run): set `bornclock-staging` secrets from
  **`.env.preview` (TEST keys only)**, and allow-list the staging URL in Supabase Auth +
  Google OAuth. So the 4-step manual script is provided below rather than executed.

**Manual test-mode purchase script (person):**
1. In Supabase Auth → URL config and Google OAuth origins, allow-list
   `https://bornclock-staging.usdvisionai.workers.dev`; set the `bornclock-staging` worker
   secrets from `.env.preview` (TEST keys, `rzp_test_…`) via `wrangler secret put … --env
   staging`.
2. Sign in on staging with the designated test account; open a locked report and start
   checkout; pay with Razorpay test card `4111 1111 1111 1111` (any future expiry/CVC).
   (For a recurring/subscription test use `5267 3181 8797 5449`.)
3. Confirm the report unlocks and the entitlement is granted; confirm **no real GST
   invoice number was consumed** (the TEST-mode skip) — check with the read-only
   `scripts/audit-razorpay.mjs`.
4. Re-lock: revoke the test entitlement row so staging returns to the locked state.

## FIX 5 — Speed check and real-visitor tracking ✅

- **Performance-budget CI** (`.github/workflows/perf-budget.yml` +
  `scripts/perf-budget.{mjs,json}`): runs **only on pull requests** (to `develop`/`main`)
  and on manual dispatch, has **no Cloudflare credentials and never deploys** — it builds,
  serves `dist/` with `vite preview`, and fails the check if the homepage/Kundli (and the
  other layout pages) exceed the LCP/CLS/TBT budget **or an initial-JavaScript-size
  ceiling** (`jsMax`, added this run). Ratchet ceilings are calibrated from the local
  `build:dev` measurement (home 295 kB, kundali 318 kB after the chart split, blog 440 kB)
  so the gate blocks a real regression. The gate runs green on the current build.
- **Real-visitor speed tracking** (`src/lib/web-vitals-rum.ts` + `WebVitalsReporter`):
  reports **LCP / CLS / INP** (the `web-vitals` package) to the site's **existing**
  Supabase `analytics_events` table — **no new third-party service**. Doubly gated: fires
  **only on the production hostname** (`bornclock.com` / `www.bornclock.com`) and **only
  after the visitor accepts analytics** in the cookie banner (`hasAnalyticsConsent()`); if
  they decline, nothing is sent. It is a no-op on staging/previews/localhost and during
  prerender.

---

## Retest, deploy, merge

1. **Automated suite:** **1888 passed / 1888** (re-run after the contrast changes — no
   regressions); `tsc --noEmit` clean.
2. **RC2 deployed to staging** (`wrangler deploy --env staging`; dry-run first confirmed
   the worker is `bornclock-staging`, `routes=[]`, workers.dev only) — version
   `da27edae-ec32-4ee8-b09c-c0be65f3c410`. Re-tested on RC2: axe sample (0 serious), the
   7-page speed table, the 3,635-URL status crawl (all 200), the valid-non-sitemap list
   (all 200), the invalid-address 404 samples (all 404), and the journeys below.
3. **Journeys on staging (Chromium / WebKit iPhone / Android where the script supports it):**
   - **Vedic** 13/13 · **Birthday** 7/7 · **Science** 14/14 (chromium + webkit) ·
     **Neutral** 25/25 · **Mystic** harness (hub→numerology→compatibility→zodiac, 3
     browsers) 0 serious / all 200 / single-h1.
   - **FINAL supplementary + API smoke** 6/8 scripted + **2 re-verified PASS by direct DOM**
     (the INV-F4 harness-selector false negatives): `/upgrade` surface opens (30 buttons +
     upgrade copy, 0 errors) and the mobile menu toggle reveals **126** nav links (0
     errors) — confirming Fix 1's Navigation changes didn't break the menu. API guards
     intact (400/405/400 on the negative paths; no mutation).
4. **Merge:** tagged `develop` as **`pre-rc2-merge`** (`2352e3c`) as the undo point, then
   **fast-forwarded `develop` ← `redesign-central`** (develop was a clean ancestor). Push
   targets re-checked first: `.github/workflows/deploy.yml` deploys production **only on
   push to `main`**; pushing `develop`/`redesign-central` triggers no deploy (the nightly
   schedule's CF step fails harmlessly with no token in GitHub). Pushed
   `redesign-central`, `develop`, and the tag — no force, never `main`.

## Bug / investigation log (this run)
- **Fix 1** reduced serious axe `color-contrast` from ~42/48 sample rows to **0**; root
  cause of the filled-button dark-on-dark was `.paj a/button{color:inherit}` (fixed
  centrally).
- **Fix 3** real-404: `/born-on/february-30` etc. now 404; one artifact slug typo
  (`/vedic-zodiac/mesha` → real slug `mesh`) in the stale 161-route list was corrected.
- **Build infra:** `scripts/prerender.mjs` gained `PRERENDER_ONLY` + an explicit
  `process.exit(0)` — a lingering keep-alive handle had been hanging the build chain after
  prerender (before `generate-sitemap`); the final build completed cleanly (3635 ok, 0
  failed, 0 skipped). The homepage is ordered last in the full run, so under heavy machine
  load (a concurrent build) the 25-min prerender cap can skip it — the final clean build
  prerendered it; `PRERENDER_ONLY=/` is the one-line backfill if it recurs.
- **Transient HTTP 429** on a few routes during rapid crawls = staging rate-limiting, not
  defects (FINAL INV-M5/N3 precedent).

## Test-suite count vs baseline
Baseline **1888/1888** → after Fix 1 **1888/1888** → after all fixes **1888/1888** → on
merged `develop` **1888/1888**. Typecheck clean throughout.

## Needs the person
1. **Staging test-mode payment run** (Fix 4) — provision `bornclock-staging` secrets from
   `.env.preview` (TEST keys) + allow-list the staging URL in Supabase Auth / Google OAuth,
   then run the 4-step script above. Dashboard-only; the code + invoice protection are
   ready.
2. **Supabase credits DDL** — apply the `report_credits` / `credits_granted_month` columns
   in Studio so subscriber credits activate (dormant-by-design until then).
3. **Launch day** (unchanged from FINAL): re-capture the production version ID immediately
   before launch; merge `develop`→`main` to trigger the production deploy; only then add
   `CF_API_TOKEN` / `CF_ACCOUNT_ID` to GitHub secrets.
