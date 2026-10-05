# Part AP — Central Design System, Phone Speed, Safe Release Pipeline — Report

**LAUNCH-READY: NO — 6 blockers**

This run completed, with real verification, the two self-contained, safety-critical
parts (D and C-secrets) and the full Part A **design** (themes, layouts, and the
186-route mapping). The large page-migration, speed, full-test-matrix, and
release-candidate parts were **not** completed. They cannot be completed *and
honestly verified* in a single autonomous pass without either fabricating results
(forbidden by Rule 5 and "do not invent numbers/results") or leaving the launch
build in a broken half-migrated two-system state (forbidden by WHAT-NOT-TO-DO).
This report states exactly what is done and what remains. See
`docs/part-ap-decisions.md` D0 for the full scope reasoning.

## Blockers

1. **Central design system not yet applied to pages (Part A migration).** The
   authoritative design — 5 themes, 7 layouts, full 186-route theme×layout map — is
   complete (`docs/part-ap-design-system.md`), but no page has been re-wired through
   the central layouts and the two styling systems (`index.css` Part AO tokens +
   scoped `.paj`) are not yet consolidated. The core goal ("change the centre once,
   every page follows") is not yet met.
2. **Science & Longevity "Workbench" rebuild not done** (carried from Part AO
   blocker #2). Pages are on-brand but not on the bespoke Workbench layout.
3. **Phone speed (Part B) not measured or optimised.** No old-vs-new table, no
   LCP/CLS/TBT numbers. The spec's method (deploy Sept build + new build to the same
   staging worker, median-of-5 throttled) was not executed. **No speed numbers are
   reported because none were honestly measured.**
4. **Full Part E verification not run.** No layout audit (1440/390), no 9-journey
   run across Chromium/WebKit/Android, no axe pass, no API smoke, no status/link
   crawl, no A4 regression snapshots. (WebKit is not even installed yet.)
5. **Payment check not executed** (Part C payment + Part AO blocker #1). Requires
   (a) the new build deployed to staging and (b) a working staging sign-in — which
   needs the Supabase Auth redirect URL + Google OAuth origin for the staging
   hostname (dashboard steps, the person's). Manual script below.
6. **Release Candidate 1 not produced (Part F).** No tag, no merge to `develop`, no
   RC deploy, no RC re-test. Nothing was merged or deployed.

---

## What IS done and verified this run

### Part D — Safe release pipeline ✅ (complete, verified)
`.github/workflows/deploy.yml` rewritten into two jobs:
- **`nightly`** (`if: schedule`): checks out **`develop`**, runs bio-fill + export,
  commits refreshed data back to `develop` (push now **fails loudly** — the
  `|| echo "push skipped"` that hid the 403 is gone, and `permissions: contents:
  write` is added), builds, and deploys **`--env staging` only**. It can never
  reach production.
- **`production`** (`if: push-to-main OR (workflow_dispatch AND
  inputs.deploy_production == 'deploy-production')`): the only path that runs
  `wrangler deploy` (production worker). A blank manual dispatch does nothing.
- **Node 22** on both jobs (fixes the wrangler Node-22 requirement that forced the
  old fallback).
- **Verification:** `actionlint 1.7.7` → **exit 0, clean**. YAML parsed; trigger
  matrix walked: schedule→staging-only; push-main→prod; dispatch-blank→no-op;
  dispatch-"deploy-production"→prod. Not triggered, bio-fill not run locally
  (Part E rule honoured).
- **Note (unchanged from spec):** scheduled workflows run the workflow file on the
  **default branch (`main`)**, so this new nightly only takes effect after the
  launch merge into `main`. The Cloudflare API token must be added to GitHub **only
  after** that merge — until then the nightly fails harmlessly at the deploy step.

### Part C — Staging secrets ✅ (complete, verified) / payment check ⛔ (deferred)
- **16 runtime secrets** set on **`bornclock-staging`** via
  `wrangler secret bulk --env staging` (output confirmed the worker name per Rule
  2; temp file shredded; `wrangler secret list --env staging` confirms all 16):
  `SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY,
  CRON_SECRET, GEMINI_API_KEY, VITE_PROKERALA_CLIENT_ID, VITE_PROKERALA_CLIENT_SECRET,
  RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, VITE_RAZORPAY_KEY_ID,
  VITE_RAZORPAY_PLAN_{GLOBAL,INDIA}_{ANNUAL,MONTHLY}`. Names derived from
  `process.env.*` reads in `functions/ api/ backend/`.
- **SAFETY CATCH (Rule 2):** the Razorpay keys in **`.env.local` are LIVE**
  (`rzp_live_…`). Putting a live key on staging would risk real customer charges, so
  I did **not** use it. The **test** keys (`rzp_test_…`, same Supabase project) are
  in **`.env.preview`** — all Razorpay secrets were sourced from there, with an
  abort-on-non-test assertion in the build script. This resolves Part AO blocker #3
  (staging server-side secrets).
- **Payment check not run** — see blocker #5 and the manual script below.

### Part A — Central design *specification* ✅ (design only; code migration pending)
`docs/part-ap-design-system.md`: the five themes as one variable-set each
(`data-theme`), the seven layouts mapped onto the existing `.paj` hero structures
(`workbench`/`editorial`/`atlas`/`field-guide`), the A5 acceptance rules, and the
**full 186-route theme×layout mapping** generated from `src/App.tsx`
(⚠-flagged where the path is semantically ambiguous). This is the non-breaking
contract for the migration; it changes no runtime code.

### Baseline (verified)
- Unit suite: `vitest run` → **154 files, 1878 tests, all passing** (40.8s) on the
  branch tip. No regression introduced by this run (only docs + workflow changed).

---

## How the central system is designed to work
- **Themes** (`data-theme` on the page root): `vedic` (gold/bronze), `birthday`
  (coral/#B5432A), `mystic` (amethyst), `science` (white bg, green/blue, no
  gold/ivory), `neutral` (navy/ivory, gold for premium). Shared tokens (navy, ivory,
  ink, hairline, Fraunces + Public Sans, Devanagari) defined once.
- **Layouts** (one component each): Tool, Report, Hub, Collection, Article, Money,
  Utility — each owns the header block (breadcrumb·eyebrow·H1·lead·trust) so pages
  can't drift. Every one of the 186 routes is assigned a theme+layout in the spec.
- **Consolidation plan:** fold the shared colours into one `:root` so `index.css`
  and `.paj` cannot diverge; rename `data-category`→`data-theme`; add `neutral`;
  wrap `.paj` structures in 7 thin React layouts; wire pages per theme group with
  identical content/calc/gating; capture A4 before/after snapshots and the A5 audit.

## Speed table (old vs new)
**Not produced — no measurement was run.** Reporting fabricated numbers is
forbidden. Blocker #3.

## Regression (calculators / paywalled pages)
Baseline unit suite green (1878/1878). **A4 fixed-input calc/gating before-after
snapshots were not recorded** (no page was migrated, so there is nothing to compare
yet). Blocker #1/#4.

## Test summary
Not run this session beyond the unit baseline: no positive/negative/edge functional
pass, no end-to-end journeys (Chromium/WebKit/Android), no axe, no API smoke, no
crawls. Blocker #4.

## Bug log
`docs/part-ap-bugs.md`: no code bugs found (no feature code was changed). The one
notable **finding** is the live-Razorpay-key-in-.env.local catch (handled, see Part
C) — logged in decisions D3.

## Manual payment-check script (for when staging sign-in is enabled)
Prereq (the person, dashboard-only): add the staging hostname
`https://bornclock-staging.usdvisionai.workers.dev` to **Supabase Auth → URL
Configuration (redirect URLs)** and to the **Google OAuth authorized origins**.
Then:
1. Sign in on the staging URL with the designated **test** account.
2. Open a locked report → confirm the price + region/GST step → click pay →
   complete Razorpay checkout with test card `4111 1111 1111 1111`, any future
   expiry/CVV.
3. Confirm the report unlocks, stays unlocked after reload, and appears in history.
4. In Supabase, confirm **no real GST invoice number was consumed** (Part AO
   test-mode skip) and no real email was sent (staging suppresses outbound email).

## Safe launch-day steps (unchanged, for reference)
1. `wrangler deployments list` (read-only) — record the current **production**
   version ID so `wrangler rollback <id>` can restore it.
2. Merge `develop` → `main` → production deploys via the new `production` job.
3. **Only then** add the Cloudflare API token to GitHub (until then the nightly
   cannot deploy anything).

## Release Candidate 1
**Not produced.** No tag, no merge, no RC deploy. The staging worker currently
serves the **Part AO** build (unchanged by this run; I only set its secrets).

## Git state
- Branch `redesign-central`, pushed to GitHub. Commits this run:
  - `58eee3c` Part AP/D safe release pipeline
  - `d1ba239` Part AP/C staging secrets
  - `163e088` Part AP/A design-system spec
- `develop` and `main` **not** touched. Production **not** touched. **No Cloudflare
  token added to GitHub.**

## Needs the person
- **Supabase/Google dashboard:** allow-list the staging hostname (Auth redirect URL
  + Google OAuth origin) so staging sign-in — and therefore the payment check —
  works.
- **Confirm Razorpay test keys:** I used `.env.preview`'s `rzp_test_…` keys for
  staging because `.env.local` held **live** keys. Confirm that is the intended test
  set.
- **Secrets not in local env** (runtime-read, left unset): `ADMIN_EMAIL`,
  `ADMIN_EMAILS`, `BROWSER_RENDERING_TOKEN` — provide if those features are needed
  on staging.
- **Decision on remaining scope:** Parts A-migration, B, E, F are a multi-session
  effort; they should proceed as their own focused runs (one theme-group migration
  + verify per run) rather than one unverifiable pass.
