# BornClock — Fix Run: Release Candidate 2
## Branch `redesign-central` (identical to `develop` at `ff5e272`). Small, focused run. No stopping, no questions.

Read `docs/migration-FINAL-report.md` and `docs/migration-bugs.md` first.
This run closes the launch blockers listed there and produces Release
Candidate 2 on staging.

---

## RULES

1. **Production is never touched:** no production deploy or promotion,
   no route or domain changes, never push or merge `main`, never add a
   Cloudflare token to GitHub.
2. **Staging safety:** `wrangler deploy --env staging` only; dry-run first
   and confirm the worker is exactly `bornclock-staging`; never run
   `wrangler` from an older checkout; any `wrangler secret` command
   includes `--env staging`.
3. **Preserve every feature:** calculations, content, prices, paywall
   gating, payment and entitlement logic unchanged.
4. **Unattended headless mode:** there are no background notifications —
   never end your turn to wait for a build or test. Run long commands in
   the foreground (time limit raised to 60 minutes), or keep polling
   anything you background until it finishes.
5. **Verify on the live staging URL;** never report a test as done that
   wasn't run. Test, fix, retest; log bugs in `docs/migration-bugs.md`.
6. Never edit `public/robots.txt`. Never add `noindex` to normal pages;
   it is allowed only on genuine not-found states (including the existing
   invalid-pair page).
7. Commit per fix; push `redesign-central` after each fix.

---

## STEP 0 — START OF EVERY ATTEMPT

This run may be restarted automatically if it gets cut off.
1. **Leftovers:** if the working tree isn't clean, review the changes —
   finish and test them if they belong to an unfinished fix, otherwise
   `git stash` them with a clear message and log it. Never discard work
   silently.
2. **Resume, don't redo:** check commits on `redesign-central`, the bug
   log and any partial `docs/fix-rc2-report.md`. Skip fixes already
   completed and verified; continue from the first unfinished one.
3. Record the full test suite count as the baseline.

---

## FIX 1 — Colour contrast, centrally

Fix the serious axe `color-contrast` findings at the source: the cookie
banner ("Accept All" button and legal links — currently around 1.04:1,
effectively invisible), the navigation search box, the brand wordmark,
and the shared muted/tinted text tokens across all five themes. Target:
at least 4.5:1 for normal text, 3:1 for large text and UI borders.
- Screenshot the homepage and each theme's hub page plus one tool page per
  theme at 1440 and 390 **before** and **after**: the approved look must
  be preserved — colours may only darken or lighten enough to pass, never
  change character.
- Run axe across the regression sample (the 13 cross-group routes from
  the FINAL report plus one page per layout type): **zero serious or
  critical issues.**
- Because this change touches every page, re-run the FINAL report's
  Chromium crawl of all previously moved pages (the 161 routes): every
  page 200, single `<h1>`, zero console errors.

## FIX 2 — Tap responsiveness (TBT) on the homepage and Kundli

Same method as the FINAL report (`scripts/final-speed.mjs`: Pixel 5
emulation, 4× CPU, warm cache, median of 5, staging).
- **Homepage (363ms):** load below-the-fold sections (directory, Born
  today, footer extras) after the first screen; defer non-critical
  scripts.
- **Kundli (326ms):** split the chart bundle and load it when needed,
  without changing chart output.
- **Keep the content in the prerendered HTML.** Delay only JavaScript
  (hydration, interactive widgets, chart code, images) — never remove
  text or links from the prerendered page. The homepage directory's links
  to every tool must stay in the prerendered HTML for search engines.
  Confirm by checking `dist/index.html` and the served HTML before and
  after: same headings, text and internal links.
- Target **TBT under 200ms** on both, with LCP and CLS staying within
  target (LCP < 2.0s, CLS < 0.05). Re-measure all 7 layout pages. Report
  real numbers; never loosen the method.

## FIX 3 — Real "not found" responses

Invalid generated addresses must return a real **404 status** with the
styled not-found page, never a 200 that shows other content (a "soft
404"): e.g. a born-on page for 30 February, an unknown celebrity slug, an
invalid compatibility pair (keep its noindex and copy).

**Safety — this must never turn a valid page into a 404.** Many valid
pages are not in the sitemap or the prerendered list: `/results`,
account and saved-profile pages, the report view, sign-in/auth callback
routes, payment return routes, upgrade/checkout, admin, and any address
with query parameters. So:
- Return 404 **only for explicitly validated patterns** — an impossible
  date, an invalid zodiac pair, a celebrity slug — never for "not in the
  prerendered list."
- **Celebrities:** profiles may come from the full database (around
  28,000 people), not only the 598 curated ones. Judge a slug invalid
  using exactly the same data source and logic the page uses to render
  it. If the page could render it, it's valid. If invalidity can't be
  determined reliably at the edge, don't return 404 for it — leave it as
  is, and note it in the report.
- Build a list of every valid route in `App.tsx`, including the
  non-sitemap ones above, with sample addresses (including query
  parameters), and confirm each still returns 200 and renders.
- Confirm with a status crawl of all sitemap URLs (all 200), the
  valid non-sitemap list (all 200), and a list of invalid samples (all
  404).

## FIX 4 — Monetisation blocker: establish the facts

The FINAL report lists "carried Part-AO monetisation blockers
(preview-lock, subscriber credits, member pricing)". Part AO's own report
listed different blockers (payment test, layout polish, staging
provisioning). From evidence only — reports, decisions files, git
history, the code — determine which monetisation items are genuinely
open today. Do not change pricing, payment or entitlement logic. For each
item, state: what it is, evidence, whether it blocks launch. If the only
open item is the payment test: run one test-mode purchase on staging if
staging sign-in works (Razorpay test keys only; designated test account;
confirm unlock, then re-lock; confirm no real GST invoice number is
consumed); otherwise include a 4-step manual script for the person.

## FIX 5 — Speed check and real-visitor tracking

- A performance-budget check as a GitHub workflow that runs **only on
  pull requests** and never deploys (LCP/TBT and initial JavaScript size
  limits for the homepage and Kundli).
- Real-visitor speed tracking (`web-vitals`: LCP, CLS, INP) sent to the
  site's existing analytics, **active only on the production hostname**
  (`bornclock.com` / `www.bornclock.com`), inactive on staging/previews,
  and **only after the visitor has accepted analytics in the cookie
  banner** — if they decline, nothing is sent. Add no new third-party
  service.

## RETEST, DEPLOY, MERGE

1. Full automated suite (must not drop below 1888 passing) and typecheck.
2. Deploy to staging (dry-run → `bornclock-staging`) as **Release
   Candidate 2**, then on RC2: axe sample (zero serious), the 7-page speed
   table, the full status crawl, the valid non-sitemap list (all 200),
   invalid-address 404 samples, and the Vedic, Birthday, Mystic (hub →
   numerology → compatibility → zodiac; use the Mystic harness if no
   journey script exists), Neutral and Science journeys on Chromium,
   WebKit (iPhone) and Android.
3. Tag `develop` first (`pre-rc2-merge`) as an undo point, then merge
   `redesign-central` into `develop` (fast-forward if possible, otherwise
   a normal merge) and push both plus the tag (re-check workflow triggers
   first). Never `main`.

## REPORT

Write `docs/fix-rc2-report.md` and include it in full in your last
message. **First line: "RC2 READY: YES" or "RC2 READY: NO — reasons".**

**What YES means:** all five fixes are done and verified, RC2 is
deployed and re-tested, nothing is broken, and the merge is pushed. Items
that genuinely need the person's decision (e.g. a monetisation question
from Fix 4), and a speed target narrowly missed after genuine effort with
the page no worse than current production, do **not** make it NO — list
them plainly under "Needs the person" or "Open items". **NO** is only for
something broken, unverified, or a fix not finished.
Then: each fix with before/after evidence; the speed table; axe results;
404 results; the monetisation findings (what's genuinely open, with
evidence); test and journey results; a bug-log summary (found, fixed,
retested); the RC2 staging version; the undo tag; the current production
version ID (read-only, for rollback on launch day); and a short **"Needs
the person"** list.
