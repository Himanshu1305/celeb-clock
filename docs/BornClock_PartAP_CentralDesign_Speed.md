# BornClock — Part AP: Central Design System, Phone Speed, Safe Release Pipeline
## One autonomous run on branch `redesign-central`. No stopping, no questions. Ends merged into `develop`, pushed to GitHub, with a release candidate on the staging worker. Production and `main` are never touched.

---

## THE GOAL

1. **Every page gets its look and structure from one central place** —
   category themes plus a small set of page layouts. Change the centre
   once, and every page follows. Every public page ends up in the new look
   *and* a polished new layout: no exceptions, Science & Longevity included.
2. **Phone speed at the level of the best sites**, proven by fair
   measurement.
3. **A release pipeline that can never deploy old code to production by
   accident.**

---

## RULES

1. **Production is never touched.** Never deploy the production worker
   (`wrangler deploy` without `--env staging`), never promote a production
   version, never change production routes or custom domains, never push
   or merge into `main`, and **never add a Cloudflare API token to GitHub**.
   Today the nightly GitHub job fails only because that token is missing;
   if it were added now, the nightly would deploy `main`'s old September
   code to bornclock.com.
2. **Staging deploys are allowed**, only to the separate staging worker:
   `wrangler deploy --env staging` (worker `bornclock-staging`, no routes,
   no custom domains, no crons). Isolated previews via
   `wrangler versions upload` built with `--mode preview` remain allowed.
   **Wrangler safety — every time, no exceptions:**
   - Before **every** staging deploy, run it with `--dry-run` first and
     confirm the resolved worker name is exactly `bornclock-staging`. If it
     shows `bornclock` or anything else, do not deploy.
   - **Every** `wrangler secret put` / `secret delete` / `secret bulk`
     command must include `--env staging`, and you must confirm the target
     worker in the command output is `bornclock-staging`. Never run a
     secret command that could reach the production worker — overwriting
     a production secret (e.g. the live Razorpay key) would break real
     customers' payments.
   - **Never run any `wrangler` command from an older checkout or
     worktree.** Older commits' `wrangler.toml` has no `[env.staging]`
     section, and Wrangler can fall back to the top-level (production)
     settings when the named environment is missing. Always deploy with the
     current branch's `wrangler.toml`.
3. **Pushing to GitHub:** you may push `redesign-central` and `develop`.
   Confirmed in the previous session: the only workflow
   (`.github/workflows/deploy.yml`) deploys on pushes to `main` only, plus
   its nightly schedule and manual dispatch — pushes to other branches
   trigger nothing. Re-check the workflow triggers before each push in case
   you changed them in Part D.
4. **No stopping, no questions.** Resolve ambiguity yourself, log it in
   `docs/part-ap-decisions.md`, keep going.
5. **The Fifth Rule.** Every "verified" claim is checked against the real
   served output on a live URL, fetched fresh — never source code or a
   passing build alone.
6. **Preserve every feature.** Visual and layout work only. Never change
   calculations, content, prices, paywall/premium gating, payment or
   entitlement logic. The Razorpay flow was tested end-to-end earlier and
   must behave exactly as before.
7. **Database writes** are limited to a designated test account's own
   records. No real user data, no bulk updates, no schema changes.
8. **Search engines:** never edit `public/robots.txt` and never add
   `noindex` to page HTML. Staging/preview hiding stays hostname-based in
   the worker (built in Part AO).
9. **Structured data** only via the body-rendered `JsonLd.tsx`.
10. **Commits** per central component and per page group, each
    independently revertable. Log progress in `docs/part-ap-progress.md`.
    **Push `redesign-central` to GitHub after each part (A–D)** so the work
    is always backed up.
11. **Drift check** before each part: re-confirm rules 1, 5, 6 and the
    layout acceptance rules (Part A).
12. **Flaky commands:** retry up to 3 times; check known-harmless patterns
    before treating a failure as real.
13. **Test, fix, retest after every part — not only at the end.** After
    each of Parts A–D, run the relevant tests from Part E for what that
    part touched, fix every failure, and re-run until clean before moving
    on. Never carry a known bug forward. Record every bug found in
    `docs/part-ap-bugs.md`: what broke, where, the cause, the fix, and the
    retest result.

---

## STEP 0 — BASE CHECK

Confirm you are on `redesign-central`, at or after commit `52ed513` (the
Part AO report), working tree clean. Read `docs/part-ao-report.md`,
`docs/part-ao-visual-audit.md`, `docs/part-al-audit.md` and the design
references in `docs/design-reference/` (four category pages +
`homepage-final`). Re-check every route in `App.tsx` so no page is missed.

---

## PART A — THE CENTRAL DESIGN SYSTEM, CONNECTED TO EVERY PAGE

### A1. Five themes (one central definition each)
- **Vedic** — gold `#C6A15B` decorative, bronze `#806125` for text
- **Birthday & Celebrity** — coral `#F0715A` decorative, `#B5432A` for text
- **Mystic** — amethyst `#6E5AA6`
- **Science & Longevity** — white background, blue `#2F6FB0`, green
  `#2E9E7B` decorative / `#237A60` for text, no gold or ivory
- **Neutral** — for the homepage, pricing/checkout, legal, sign-in,
  account, 404: navy/ivory, gold for premium actions
Shared everywhere: navy `#0E2238`, ivory `#FAF7F0`, ink `#1A2230`,
hairline `#E4DCC8`, Fraunces + Public Sans (self-hosted, Devanagari font
for Hindi). Each theme is one set of variables, selected by a single page
attribute (e.g. `data-theme="vedic"`).

### A2. Seven page layouts (one central component each)
1. **Tool page** — input → result (most calculators)
2. **Report page** — long results (`/kundali`, `/results`, the Birthday
   Blueprint report view, career report)
3. **Hub page** — the four category landing pages
4. **Collection page** — lists and templates that generate many URLs
   (born-on dates, celebrity index and profiles, Today's Birthdays, zodiac
   pairs, `/birthday/[m]/[d]/`)
5. **Article page** — blog posts, `/answers/*`, how-it-works, editorial
6. **Money page** — pricing/upgrade, checkout, the locked report preview,
   gift flows (visual only; logic untouched)
7. **Utility page** — legal, sign-in/join, account, 404/error

Each layout owns the page header block (breadcrumb, eyebrow, H1, lead,
trust line), the content grid, spacing and responsive behaviour, so pages
cannot drift apart.

### A3. Consolidate into one system
Earlier parts left two styling systems: the scoped `part-aj.css` (`.paj`)
used by the redesigned pages, and the retuned global tokens from Part AO.
Merge them into the single central theme/layout system above, so there is
one source of truth. The redesigned pages (hubs, Kundli, matching, Sade
Sati, Muhurat, gemstones, Rashi Ratna, numerology, compatibility, career,
name numerology, homepage) must keep their current look after the move —
they are the visual standard. **Prove it:** screenshot each of these
pages (desktop and phone) before the consolidation, again after, and
compare; fix any unintended visual change before moving on.

### A4. Connect every public page
Every page declares its theme and layout and renders through them —
including all pages Part AO only recoloured. Template pages are connected
once and spot-checked across several generated routes. Keep each page's
content, calculations, carry-forward of birth details, titles, meta and
structured data exactly as they are.

**Science & Longevity is included, not deferred:** `/life-expectancy`,
`/biological-age`, the longevity quiz, country comparison, planetary age
and planetary weight move onto the central system using the Workbench
structure from the Science design reference. Its calculations, paywall
and pricing stay exactly as they are.

**Regression safety, so no page is skipped out of caution:** before
moving any calculator or report page, record its output for fixed inputs
(the reference charts used throughout the project, plus a few dates) and
what is locked/unlocked; after moving it, confirm identical output and
gating. Keep these as automated tests.

### A5. Layout acceptance rules ("polished", measurable)
Checked automatically on every page at 1440px and 390px:
- no empty side column or blank band larger than ~160px of unused width
  next to content, and no large empty vertical gaps. **Exception for long
  reading text** (articles, answers, report narrative): keep a readable
  line length (about 65–75 characters) rather than stretching text across
  the screen — and use the side space for genuinely useful content
  (contents list, key facts, related tools/links), not blank space;
- the page's main action or main content is visible on the first screen;
- the header block comes from the layout (consistent on every page);
- correct theme for the page's category; single `<h1>`; no old-design
  markers (old purple, cosmic backgrounds, old components).
Example to fix: `/kundali`'s empty "Birth details" label column — use the
full width or place genuinely useful content beside the form.

---

## PART B — PHONE SPEED

### B1. Measure fairly first
Production is served from Cloudflare's edge cache and the preview is not,
so earlier comparisons were not like-for-like. Measure both builds on the
**same staging worker**. For the old build: confirm which commit
production was built from (the Part AO rollback tag `pre-part-ao-merge`
points to `b47002e`), build that commit's site in a separate worktree,
then deploy that build output **using the current branch's
`wrangler.toml` with `--env staging`** (per Rule 2 — dry-run, confirm
`bornclock-staging`). If the old build cannot be deployed that way safely,
skip the old-build measurement and use production's own numbers as a
clearly-labelled, non-like-for-like reference instead. Then deploy the new
build to staging the same way and measure. Each page: warm the cache first, then
take the median of 5 runs, mobile emulation (mid-range phone, 4× CPU
slowdown, slow-4G network). Measure one representative page of each
layout type: homepage, a hub, `/kundali`, `/results`, a calculator, a
born-on page, a celebrity profile, `/life-expectancy`, an article. Report
FCP, LCP, CLS and TBT for old vs new.

### B2. Targets (match the best sites)
- **LCP under 2.0s** on every measured page type
- **CLS under 0.05**
- **TBT under 200ms**
If a page type cannot reach a target, report its real number and the
specific cause — never loosen the measurement method to make a target
look met. Note that staging has ads and analytics switched off
(hostname-based, from Part AO), so production may be somewhat slower than
staging; say so in the report.

### B3. Fixes, in order of likely impact
1. **Main content visible without JavaScript:** the H1, lead text and
   above-the-fold content must be in the prerendered HTML and visible
   before the app's JavaScript runs (Part AO found the homepage LCP element
   is the H1 waiting on hydration). Only interactive parts (live clock,
   decoded values, Born today) may fill in afterwards, in fixed-size space.
2. **Less JavaScript up front:** split code per route and per section;
   load below-the-fold sections (directory, Born today, footer extras)
   after the first screen; remove unused libraries from the initial bundle.
3. **Ads and analytics after the page is usable,** with their space
   reserved so nothing jumps. Production behaviour of ads/analytics is
   otherwise unchanged.
4. **Images:** correct sizes, modern formats where possible, lazy-load
   below the fold, explicit dimensions; Born-today photos small and lazy.
5. **Fonts:** keep self-hosting; preload only the one weight the H1 uses.
6. **Caching:** long-cache hashed assets; sensible caching for prerendered
   HTML.

### B4. Keep it fast permanently
Add a performance budget check (a script, plus a GitHub workflow that runs
only on pull requests and never deploys) that fails if homepage LCP or
the initial JavaScript size grows past set limits. Also add real-visitor
speed tracking (the standard `web-vitals` measurements — LCP, CLS, INP —
sent to the site's existing analytics) that runs on the production
hostname only, so after launch the real numbers Google uses are visible.

---

## PART C — STAGING: KEYS AND A QUICK PAYMENT CHECK

- Set the staging worker's secrets yourself from local env files
  (`wrangler secret put --env staging`), using the Razorpay **test** secret.
  List any secret whose value isn't available locally under "needs the
  person."
- If sign-in works on the staging address, make one test-card purchase
  with the designated test account to confirm the earlier-tested flow
  still works after the restyle, and confirm the GST invoice series is not
  consumed (Part AO's test-mode skip). If sign-in is refused (the staging
  address not yet approved in Supabase/Google), skip it and include a
  4-step manual script in the report.

---

## PART D — SAFE RELEASE PIPELINE (edit the workflow; deploy nothing)

Rewrite `.github/workflows/deploy.yml` so that:
- **The nightly job never deploys production.** It checks out `develop`
  explicitly, runs the bio fill and export, commits refreshed data to
  `develop`, and deploys only to staging (`--env staging`).
- **Production deploys only** on a push to `main` or a manual run with an
  explicit confirmation input — nothing else.
- **The data commit fails loudly:** add `permissions: contents: write`,
  remove the `|| echo "push skipped"` that hid the 403 error.
- **Node 22** for wrangler compatibility.
Note in the report: scheduled workflows run from the workflow file on the
default branch (`main`), so the new nightly takes effect only after the
launch merge into `main`. The Cloudflare API token must be added to GitHub
**only after** that merge.

---

## PART E — VERIFICATION (fix and retest until clean)

On the isolated preview and staging:
- **Layout audit:** every public page and template at 1440 and 390
  against the Part A5 acceptance rules — zero failures. Screenshots in
  `docs/part-ap-screens/` with an `index.html` contact sheet (do not
  commit images if they exceed ~50 MB). Write `docs/part-ap-layout-audit.md`.
- **Speed:** the Part B1 old-vs-new table, every page type meeting the
  Part B2 targets.
- **Regression:** all Part A4 calculation/gating tests identical; full
  automated test suite passing.
- **Served output:** title, single `<h1>`, valid JSON-LD (validator.schema.org,
  0 errors) on a sample of every layout type; production-hostname code
  path still indexable (Part AO unit tests pass).
- **Status crawl** of all sitemap URLs (modest concurrency, ≤8 parallel)
  and a **link crawl** of homepage, hubs and tool pages: zero failures.
- **Zero console errors**, reduced-motion respected.

### Functional scenarios — positive, negative and edge cases
For every page with an input (all calculators, Kundli, matching, Muhurat,
Sade Sati, gemstones, numerology, compatibility, birthday tools, Science
tools):
- **Positive:** valid inputs produce correct, complete results (match the
  Part A4 recorded outputs).
- **Negative:** empty fields, invalid dates (e.g. 31 Feb), future dates,
  malformed or unknown city, non-numeric input — each shows a clear
  message, never a crash, blank page or console error.
- **Edge:** leap-day birth (29 Feb), birthday today, birthday tomorrow,
  new-year boundary, very old dates (e.g. 1900), unknown birth time,
  midnight birth times, Hindi page input.

### End-to-end journeys (upstream and downstream touch points)
Run each journey as a real user would, in a real browser:
1. **Arriving from search:** land directly on a born-on page, a celebrity
   profile, a zodiac-pair page and an article → navigate onward via menu,
   cross-links and footer.
2. **Homepage flow:** enter a date → decoded values → "See your full
   birthday profile" → `/results` renders the same date.
3. **Vedic flow:** hub → Kundli with carried birth details (no re-entry)
   → full chart → matching → Sade Sati → Muhurat, details carried where
   applicable.
4. **Paid flow (on staging, test mode):** tool → locked preview → price
   and region/GST step → Razorpay checkout → unlocked report → report
   still unlocked after reload and in history. (Covered by Part C when
   staging sign-in works; otherwise verify everything up to the checkout
   window opening.)
5. **Account:** sign up / sign in / sign out, saved profiles load and
   pre-fill, reading history, premium state shown correctly; admin-bypass
   accounts keep working.
6. **AI astrologer:** a normal question gets an answer grounded in the
   chart; the existing guardrails (crisis, health, financial, marriage
   timing) still respond correctly.
7. **Sharing:** WhatsApp share buttons open with the correct page-specific
   message; shared links show a correct preview (Open Graph title, text,
   image).
8. **Language and navigation:** EN/हि toggle on every layout type; phone
   menu opens, closes, and every item works; footer links work.
9. **Interactive components after the restyle:** modals open and close
   (including checkout and region modals), tabs switch, accordions,
   tooltips/glossary terms, date and time pickers, toasts — by mouse, touch
   and keyboard (visible focus, Escape closes modals).

### Browsers and devices
Run the journeys in **Chromium (desktop)**, **WebKit (iPhone Safari
emulation)** and **Chrome on Android emulation**. Safari treats date and
time inputs differently — test those specifically on WebKit.

### Accessibility
Automated accessibility scan (axe) on one page of every layout type and
every theme: zero serious or critical issues; text colour contrast meets
WCAG AA.

### APIs and back end (non-destructive)
Smoke-test each API the pages use on staging — chart/reading generation,
AI chat, order creation (test mode), and any celebrity/data endpoints —
confirming correct responses and sensible errors for bad input. Do not
trigger anything that writes real user data or sends real email.

### Release pipeline (Part D)
Validate the rewritten workflow file (YAML syntax and a GitHub Actions
linter such as `actionlint`) and walk through each trigger to confirm the
intended behaviour. Do not trigger the workflow, and do not run the
nightly bio-fill locally (it writes to the real database).

---

## PART F — MERGE, PUSH, RELEASE CANDIDATE

1. Self-verification pass: fresh test suite, fresh live fetches, fresh
   validator run, real git timestamps for elapsed time.
2. Tag `develop` before merging (e.g. `pre-part-ap-merge`), merge
   `redesign-central` into `develop`, run the full test suite. Resolve any
   conflicts by keeping the newer work while preserving any `develop`
   commit not on the branch; for refreshed data files (celebrity JSON),
   keep the newest data. Log resolutions.
3. Push `redesign-central` and `develop` to GitHub (re-check triggers
   first, per Rule 3). Do not push or merge `main`.
4. Deploy `develop` to the staging worker as **Release Candidate 1**, and
   upload a matching isolated preview. Confirm both serve the final build.
5. **Re-test the release candidate itself** — the merged build, not just
   the branch: re-run the end-to-end journeys, the functional scenarios on
   a sample of tools, the status crawl and the layout audit on a sample of
   every layout type. Fix, redeploy and retest anything that fails.

---

## FINAL REPORT

Write `docs/part-ap-report.md` and include it in full in your last
message. **First line: "LAUNCH-READY: YES" or "LAUNCH-READY: NO — N
blockers"**, then the blockers. Then:
- how the central system works (the themes, the layouts, which pages use
  which) and confirmation that every public page is connected to it;
- layout audit results and how to open the contact sheet;
- the speed table (old vs new, every page type) against the targets;
- regression results for calculators and paywalled pages;
- a test summary: scenarios run (positive, negative, edge), each
  end-to-end journey's result per browser, accessibility results, API
  smoke results, and the Release Candidate re-test;
- the bug log summary from `docs/part-ap-bugs.md` (bugs found, fixed,
  retested, and anything still open);
- staging keys set, payment check result or manual script;
- the new workflow behaviour and the exact launch-day steps: first record
  the current production worker version ID (`wrangler deployments list`,
  read-only) so one command (`wrangler rollback <id>`) can restore it;
  then merge `develop` into `main` → production deploys; only then add the
  Cloudflare token to GitHub;
- Release Candidate 1 staging URL, preview URL, `develop` commit, rollback
  tag;
- "Needs the person" — only what genuinely requires them.

---

## WHAT NOT TO DO
- Do not deploy production, push or merge `main`, or add a Cloudflare
  token to GitHub.
- Do not deploy anywhere except the staging worker and isolated previews.
- Do not leave any public page outside the central system, or with a
  layout failing the acceptance rules, and call it done.
- Do not keep two parallel styling systems.
- Do not change calculations, content, prices, gating, payment or
  entitlement logic.
- Do not defer Science & Longevity.
- Do not compare speed across different origins — same staging worker,
  warm cache, median of 5.
- Do not edit `public/robots.txt` or add `noindex` to page HTML.
- Do not invent numbers, routes, sources or secret values.
- Do not run any `wrangler secret` command without `--env staging`, and
  never deploy without a dry-run confirming `bornclock-staging`.
- Do not run `wrangler` from an older checkout or worktree.
- Do not stretch long reading text across the full screen to satisfy the
  no-wasted-space rule.
- Do not move to the next part with a known failing test or open bug.
- Do not test in one browser only — include iPhone Safari (WebKit).
