# Part AO — Launch-Ready Final Build — Report

**LAUNCH-READY: NO — 3 blockers**

1. **Live payment / entitlement test not executed this run.** The invoice-series protection and
   paywall logic are in place and the staging worker is deployed, but a real test-card purchase
   could not be completed autonomously: the staging server-side secrets, and the Supabase Auth
   redirect URL + Google sign-in origin for the staging address, are Cloudflare/Supabase/Google
   **dashboard steps only** (the person's). The test must never run on the isolated preview
   (production secrets). A manual 5-minute script is in "Needs the person" below.
2. **Bespoke per-category layout rebuilds not completed.** Every public page is now in the new
   design *language* (navy header, Fraunces/Public Sans, ivory/navy tokens, hairline cards, zero
   old purple, zero cosmic backgrounds, single `<h1>`), but the full bespoke reference *layouts*
   (editorial / atlas / field-guide / **Workbench**) were not rebuilt page-by-page. Specifically the
   **Science & Longevity "Workbench" rebuild** and the systematic **per-page no-wasted-space pass**
   (e.g. `/kundali`'s label column) were deferred — restyling the paywalled calculators' structure
   unsupervised risked the "preserve every feature / don't touch pricing/entitlement" rule more than
   honest deferral. These pages are clean and on-brand, not old-design, but they are not the full
   bespoke layouts the spec's Step 3.4 and no-wasted-space rule call for.
3. **Staging worker deployed but not fully provisioned.** `bornclock-staging` is live with its
   guardrails, but auth/API/payment features are inert until the person sets its secrets and
   allow-lists the staging address in Supabase/Google (dashboard steps).

Everything below is verified against the **real served output** on the live isolated preview /
staging worker, fetched fresh (the Fifth Rule).

---

## The isolated preview and staging worker
- **Isolated preview (NOT promoted):** https://f537587c-bornclock.usdvisionai.workers.dev
  (version `f537587c`, uploaded via `wrangler versions upload` — production traffic unchanged).
- **Separate staging worker:** https://bornclock-staging.usdvisionai.workers.dev
  (`bornclock-staging`, `wrangler deploy --env staging` — a brand-new worker, no custom domain, no
  routes, no crons).
- **develop merge commit:** `8ebeae8` (merged locally, **not pushed** — see "Needs the person").
- **Rollback tag:** `pre-part-ao-merge` → `b47002e`.

## Production was never touched (verified after all deploys)
- `https://bornclock.com/` → `200`, `cf-cache-status: HIT`, **no `X-Robots-Tag`**, `robots.txt` still
  `Allow: /`. The live production version is unchanged; `versions upload` created a preview version
  without promoting it, and the staging deploy is a separate worker.
- Unit test `stagingHost.test.ts` proves the new worker code keeps `bornclock.com` / `www` indexable.

---

## What the global restyle changed (Step 1)
- **Design tokens** (`src/index.css`) — the lever every shadcn/ui primitive, Navigation and Footer
  read: navy `#0E2238` primary, ivory `#FAF7F0` canvas, warm-neutral hover surface, hairline borders,
  navy focus ring, compact radius. `--gradient-cosmic` flattened to solid ivory → all ~60
  `bg-gradient-cosmic` pages became ivory at once. `.dark` retuned.
- **Fonts via Tailwind:** `font-sans` → Public Sans, `font-heading` → Fraunces (+ Devanagari stack).
- **De-purple:** shade-aware codemod remapped 1,837 Tailwind tokens across 158 files
  (purple/indigo/violet/fuchsia → navy for solids, refined amethyst `#6E5AA6` for text/tints/
  gradients) + hand-mapped inline content hexes (numerology/zodiac number colours, Kundali chart
  strokes, **Razorpay checkout theme**, share-card gradients, admin chart, Amethyst birthstone).
  `src` now contains **zero** old-purple markers.
- **Navigation + Footer:** indigo → navy/gold; footer link hovers → navy; Instagram button de-purpled.
- **Navy header bar site-wide (Step 3):** 94 page-header wrappers converted + celebrity index/hub/
  profile templates (previously nav-less). Every page rendering `<Navigation/>` now shows the navy
  bar or the paj `.site-header`; **zero stragglers**. (404 and /auth keep an intentional minimal
  headerless layout; narrow-container pages like `/diwali-gift` get a content-width navy bar.)

## Homepage change + LCP (Step 2)
- The confusing "Year N — X% complete" bar is replaced by two real facts: **"You were born on a
  <weekday>."** and a **next 1,000-day milestone** ("Next milestone: N,000 days old · X days to go",
  animated progress through the current 1,000-day block, with a celebration line on the exact day).
  All maths is UTC calendar-date arithmetic (DST-safe). 5 new unit tests cover the spec weekdays
  (1869-10-02 Sat, 1973-04-24 Tue, 1998-03-14 Sat) and milestone leap-year / milestone-day /
  day-before cases.
- **Fonts self-hosted:** Fraunces (500/600/700), Public Sans (400–700) latin, Noto Sans Devanagari
  (400/600/700) as woff2 in `public/fonts`; the homepage H1 Fraunces-700 is `<link rel=preload>`ed;
  **Google Fonts removed entirely** (no CSP change needed — the site sets no CSP). Noto sits in the
  font fallback chain with its `unicode-range`, so it is fetched **only** when Devanagari renders
  (Hindi pages) — English pages pay nothing.
- **LCP — real measurement** (Playwright, Pixel 5 + 4× CPU + ~1.5 Mbps/150 ms, Part AN method):

  | | Production (before) | Isolated preview (after) |
  |---|---|---|
  | FCP | 1844 ms | ~2050 ms |
  | LCP | **2476 ms** | ~5080–5984 ms |
  | Google-font requests | 0 | **0** |

  **Honest reading:** the preview LCP is *higher*, but this is the same confound as Part AN — the
  LCP element is the React-hydrated `<h1>`, and the preview runs on an **uncached `*.workers.dev`
  origin** while production is **edge-cached (`cf-cache HIT`)**. The gap is the uncached JS
  download/hydration on a throttled phone, not the font change. The font work itself is a genuine
  win (0 third-party font connections, self-host + preload) that will show once the version is
  edge-cached at promotion. **The ≤3.0 s target is therefore not demonstrable on the uncached
  preview** — reported transparently rather than claimed.

## Staging worker + guardrails (Step 4) — all verified live
- `[env.staging]` `bornclock-staging`, `workers_dev=true`, explicit `routes=[]`,
  `triggers.crons=[]`, re-declared assets + vars. `--dry-run` confirmed no routes / no custom
  domains / no crons before the first deploy.
- **Hidden from search — by hostname, verified live:**
  - staging `/` → `X-Robots-Tag: noindex, nofollow`; staging `/robots.txt` → `User-agent: * / Disallow: /`.
  - preview (`*.workers.dev`) `/` → `X-Robots-Tag: noindex`; `/robots.txt` → disallow-all.
  - production `bornclock.com` → no noindex, `robots.txt` `Allow: /`.
  - `public/robots.txt` and the prerendered HTML contain **no** noindex / disallow — hiding is
    hostname-only in the worker (`functions/host.ts`, unit-tested).
- **No tracking off production:** worker strips analytics/ad `<script>` tags (CF Insights beacon,
  googlesyndication/GTM/GA/adsbygoogle) on non-prod hosts; `AdUnit` refuses to render off production.
- **No emails to real users:** `SUPPRESS_OUTBOUND_EMAIL` + `EMAIL_ALLOWLIST` staging vars; the
  central sender (`_email.ts`), the invoice sender (`_invoice-email.ts`) and the Razorpay webhook all
  skip non-allowlist recipients on staging. Production has no `[vars]` block → unaffected.
- **Razorpay TEST key only:** the served bundle contains `rzp_test_…` and **no** `rzp_live_`.
- Scripts: `npm run deploy:staging` (test-key build) and a separate, explicit
  `deploy:production:DANGER` so the two can never be confused.

## Invoice protection + payment test (Step 5)
- **GST invoice check:** `issue_invoice()` draws from the single live GST sequence shared with
  production and ran for *every* payment with no test guard — a test purchase would have burned a real
  invoice number. **Fixed:** `verify-payment.ts` now skips real invoice numbering when the key is
  `rzp_test_` (via the existing non-fatal `skip` sentinel); the entitlement grant is untouched, so a
  test purchase still exercises the paywall. Production (`rzp_live_`) is unchanged.
- **The live test was not run** (Blocker 1). Manual script in "Needs the person".

## Verification (Step 6) — against the live preview
- **Visual audit:** 87 screenshots (desktop 1440 + mobile 390 sample) across 77 routes / every
  distinct template. **Old-purple: 0. Cosmic backgrounds: 0. Multiple-`<h1>`: 0. Non-200: 0.**
  Contact sheet: **open `docs/part-ao-screens/index.html`**; route table in
  `docs/part-ao-visual-audit.md`. (The only "flagged" rows are intentional: `/auth` and the 404
  catch-all are headerless by design; `/results`'s empty-state card precedes its navy-headered data
  view; `/nakshatra` is not a route and falls to the 404 catch-all.)
- **Sitemap status crawl:** 278 URLs sampled across every path shape from 3,635 sitemap entries,
  concurrency 8 — **0 bad** (all 200 / intended redirect).
- **Served output** (DOM-accurate, 10 templates on the deployed preview): correct `<title>`, exactly
  **one `<h1>`**, JSON-LD present (4–9 objects), **zero console errors** — including `/vedic-astrology`
  (its earlier 500 was a local no-`/api` artifact; clean on the deployed worker).
- **JSON-LD validation** (validator.schema.org): `/`, `/compatibility/aries/leo/`,
  `/life-expectancy/`, `/kundali/` → **0 errors**.
- **Indexability:** preview + staging send noindex; production does not (above).
- **Single-h1 fix:** the `AgeCalculator` widget `<h1>` was demoted to `<h2>` (fixed numerology,
  age-calculator, age-in-days, age-in-seconds, birthday-countdown).
- **Full automated suite:** **1878 tests / 154 files pass** (fresh, on `develop` after the merge).

## Step 7 (additive content) — skipped
Steps 1–6 are not fully clean (3 blockers above), so the four new pages (`/manglik`,
`/angel-numbers`, `/personal-year-number`, `/kaal-sarp-dosha`) were **not** built, per the rule to
skip Step 7 rather than weaken Steps 1–6.

## Merge + deploys (Step 8)
- Tagged `pre-part-ao-merge` on `develop` (`b47002e`), then merged
  `part-aj-four-page-redesign` into `develop` (`--no-ff`, commit `8ebeae8`) — **not into `main`**.
  Clean fast-forwardable merge (develop had no commits the branch lacked); full suite green after.
- Final isolated preview uploaded and staging worker deployed (both serve the final `--mode preview`
  build: 3,635 prerendered routes, test Razorpay key only).
- **develop was merged locally but NOT pushed** — pushing could trigger CI, and the Hard Rule
  forbids anything that could touch production. Pushing `develop` is left to the person.

---

## NEEDS THE PERSON (exact remaining steps)
1. **Finish the payment test on staging** (after steps 2–3 below). Manual 5-min script:
   open `https://bornclock-staging.usdvisionai.workers.dev/pricing` (or `/upgrade`) signed in as the
   **test account** (not an admin-bypass account) → buy any paid product with Razorpay's published
   **test card** `4111 1111 1111 1111`, any future expiry, any CVV → confirm the paid content
   unlocks → remove paid status on the test account and confirm it re-locks. In TEST mode no real GST
   invoice number is consumed (verified in code). Clean up / mark the test records.
2. **Set staging secrets** (`docs/staging-setup.md` lists every name). Use the Razorpay **test**
   secret from `.env.preview` (`rzp_test_TAiq0GggLhvv4k` + its secret); Supabase can reuse production
   values (shared DB — test-account writes only).
3. **Allow the staging address** in Supabase Auth → Redirect URLs and in the Google OAuth client's
   authorized origins, or staging sign-in is refused.
4. **(Optional) Move the staging domain:** in the Cloudflare dashboard, detach
   `staging.bornclock.com` from the `bornclock` worker and attach it to `bornclock-staging`
   (`[env.staging].routes` is intentionally empty so this is a deliberate dashboard step).
5. **Push `develop`** when ready, and **release to production on your explicit word only** (production
   promotion/`wrangler deploy` was deliberately not run).
6. **Finish the bespoke layout rebuilds** (Blocker 2) — the Science & Longevity "Workbench" rebuild
   and the per-page no-wasted-space pass — to reach the full reference layouts; or accept the current
   new-design-language state as the launch bar.

## Rollback
```
git checkout develop
git reset --hard pre-part-ao-merge   # → b47002e, the pre-merge develop
```
Production needs no rollback — it was never changed.

## Real elapsed (git timestamps)
Part AO commits span **17:41 → 18:44 (+0530)** of commit activity (~63 min), within which the full
`--mode preview` production build (vite + 3,635-route prerender + sitemap, ~16 min) and the
`versions upload` + staging deploy ran. Multiple fresh full test runs (1878 tests) and the live
preview/staging verification are included.
