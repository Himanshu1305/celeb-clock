# Part AP — Decisions Log (Rule 4: resolve ambiguity, log it, keep going)

Branch: `redesign-central` (from `develop` @ 52ed513, the Part AO report).
Start: 2026-10-05.

## D0 — Scope reality and execution strategy (most important decision)

Part AP, read literally, is **multiple weeks of team engineering**: a central
design system (5 themes + 7 layout components) consolidating two CSS systems;
migrating **188 routes** onto it including a full Science & Longevity rebuild;
before/after visual-regression screenshots of ~12 reference pages (desktop +
phone); phone-speed optimisation to LCP<2.0s / CLS<0.05 / TBT<200ms on 9 page
types measured old-vs-new as median-of-5 under throttling on the **same**
staging worker (requires deploying a September OLD build from a separate
worktree *and* a new build); a full Part E matrix (positive/negative/edge on
every input page, 9 e2e journeys × Chromium + WebKit + Android, axe, API smoke,
status-crawl of every sitemap URL, link-crawl); staging secrets + a real
test-card payment; a workflow rewrite; then tag → merge → deploy RC1 → re-test.

**A single autonomous session cannot complete AND honestly verify all of that.**
Rule 5 forbids any "verified" claim not checked against real served output;
"do not invent numbers/routes/results"; and the WHAT-NOT-TO-DO list forbids
leaving a partial migration ("two parallel styling systems", "any public page
outside the central system … and call it done"). A half-finished 188-page
migration of a launch-stage **revenue** product is also a real hazard.

**Decision:** execute in integrity-preserving priority order. Complete and
verify, with real evidence, the work that is genuinely completable in-session;
make real, safe, non-breaking progress on the design-system foundation; and
report the remainder **honestly** as open blockers (the report format expects
"LAUNCH-READY: NO — N blockers"). No fabricated screenshots, numbers, or test
counts. Never leave the site in a broken two-system state.

Priority order (highest integrity-value first):
1. **Part D** — rewrite the deploy workflow so the nightly can never deploy
   production. Self-contained, fully completable, and the single biggest
   *safety* win (today a CF token on GitHub would deploy Sept `main` to prod).
2. **Part C** — set staging secrets from local env (Rule 2 safety), verify.
3. **Baseline** — green unit suite + clean build on the branch.
4. **Part A foundation** — one documented source of truth for design tokens;
   capture before-screenshots of the reference pages. No risky mass re-skin.
5. **Honest reporting** of A (full migration), B (speed matrix), E (full
   cross-browser matrix) and F (merge/RC) as remaining work.

## D1 — Workflow production-confirmation input
`workflow_dispatch` gains an input `deploy_production`; production deploys only
when it equals the literal `deploy-production`. A blank manual run is a safe
no-deploy. (Spec: "manual run with an explicit confirmation input.")

## D2 — Nightly commits to `develop`, not `main`
Per Part D. The scheduled job checks out `develop`, commits refreshed data back
to `develop`, deploys `--env staging` only. Note (also in report): schedules
run from the workflow file on the **default branch (main)**, so this new nightly
only takes effect after the launch merge into `main`.

## D3 — SAFETY CATCH: `.env.local` Razorpay keys are LIVE, not test
`.env.local` holds `rzp_live_…` keys. Rule 2 explicitly warns that putting a live
Razorpay key on staging would risk **real customer charges**, and Part C requires
the **test** secret. I did **not** use `.env.local` for Razorpay. The **test**
keys (`rzp_test_…`) live in `.env.preview` (same Supabase project), so all
Razorpay secrets on staging were sourced from there. Verified `rzp_test_` prefix
before writing, and asserted it in the build script (abort-on-non-test).

## D4 — Part C result
Set **16 runtime secrets** on `bornclock-staging` via `wrangler secret bulk
--env staging` (output confirmed worker `bornclock-staging`; temp file shredded;
`secret list --env staging` shows all 16). Runtime secret names were derived from
`process.env.*` reads in `functions/ api/ backend/`.
- **Needs the person** (runtime-read but not in local env): `ADMIN_EMAIL`,
  `ADMIN_EMAILS`, `BROWSER_RENDERING_TOKEN`. Non-secret config with code defaults
  (`OPS_BASE_URL`, `PRODUCTION_URL`, `COACH_PROVIDER`, `DIGEST_LIVE`) left unset;
  `CF_ACCOUNT_ID` is supplied by the deploy environment.
- **Payment check:** not run this session — it requires the new design-system
  build deployed to staging **and** a working staging sign-in, neither of which
  is completed here. A 4-step manual payment script is in the report.
