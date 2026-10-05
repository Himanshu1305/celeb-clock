# BornClock — Migration Run (reusable for every remaining run)
## Branch `redesign-central`. The person's message names the GROUP for this run. No stopping, no questions.

GROUP is one of: **VEDIC**, **BIRTHDAY**, **MYSTIC**, **SCIENCE**,
**NEUTRAL**, **FINAL**. Do only that group's work.

---

## RULES (every run)

1. **Production is never touched:** no production deploy or promotion,
   no route or domain changes, no Cloudflare token added to GitHub. Never
   push or merge `main`. Do not touch `develop` except in the FINAL run.
2. **Staging deploy safety:** `wrangler deploy --env staging` only;
   dry-run first and confirm the worker is exactly `bornclock-staging`;
   never run `wrangler` from an older checkout; every `wrangler secret`
   command includes `--env staging`.
3. **Preserve every feature:** calculations, content, prices, paywall
   gating, payment and entitlement logic stay exactly as they are.
4. **Verify real output (Fifth Rule):** checks run against the live
   staging URL, fetched fresh. Never report a test as done that wasn't run.
5. **Finish pages completely, in order:** a page counts only when it is
   moved *and* passes every test below. If the session can't finish the
   whole group, stop after the last fully finished page and list the rest
   — the next run with the same GROUP continues from there.
6. **Test, fix, retest;** log every bug in `docs/migration-bugs.md`
   (group, page, what broke, cause, fix, retest result).
7. Never edit `public/robots.txt` or add `noindex` to page HTML.
   Structured data only via `JsonLd.tsx`. Keep every page's title, meta
   and structured data.
8. **Commit per page; push `redesign-central`** after every few pages and
   at the end.
9. **No regressions elsewhere:** pages outside this run's group must look
   and behave exactly as before.

---

## STEP 00 — START OF EVERY RUN

1. **Recover from an interrupted run:** if the working tree is not clean,
   review the changes. If they belong to this group's work and can be
   finished, finish and test them; otherwise `git stash` them with a clear
   message and log it in `docs/migration-bugs.md`. Never discard work
   silently.
2. **Baseline:** run the full automated test suite and record the result.
   Screenshot a fixed regression sample at 1440 and 390 — the homepage,
   two pages from every group other than this one, and every page already
   moved in earlier runs — for before/after comparison at the end.

## STEP 0 — TEST HARNESS (once; skip if already in place)

Extend `scripts/run1-verify.mjs` (or a shared successor) so one command
runs, against staging, for a given list of routes: Chromium desktop
1440, WebKit (iPhone Safari) 390 and Android Chrome 390 emulation —
status, single `<h1>`, correct `data-theme`, zero console errors,
screenshots, the layout acceptance rules, an axe accessibility scan
(zero serious/critical), and JSON-LD validation via validator.schema.org
(0 errors). Run `npx playwright install webkit` if needed. Write a
contact sheet to `docs/migration-screens/<group>/index.html` (don't
commit images over ~50 MB).

---

## STEP 1 — THE GROUP'S PAGE LIST

Take the routes for this GROUP from `docs/part-ap-design-system.md` and
cross-check against `App.tsx`. **Correction to apply:** Western zodiac,
Chinese zodiac, tarot, numerology (life path and name), compatibility,
biorhythm, and their articles and answers pages belong to **MYSTIC**, not
VEDIC. Update the mapping document accordingly. Skip any route already
moved in an earlier run (check the bug log, run reports and code).

---

## STEP 2 — FOR EACH PAGE

1. **Before:** screenshots (1440 and 390); record outputs for fixed inputs
   (the reference charts/dates used throughout the project) and what is
   locked/unlocked.
2. **Move it** onto its layout from `@/components/central` with this
   group's theme. For pages already on the `.paj` system, use the proven
   recipe from `docs/run1-report.md` (swap the shell for `PajPage`,
   content untouched). For pages not yet on `.paj`, adopt the layout
   properly: its header block, content grid and spacing.
3. **Layout acceptance rules:** no empty side columns or blank bands
   wider than ~160px; main action or content visible on the first screen;
   long reading text at a readable width (about 65–75 characters) with
   side space used for useful content (contents, key facts, related
   tools); H1 and lead present in the prerendered HTML before JavaScript.
4. **After:** screenshots compared with before — already-redesigned pages
   the same or better; outputs and gating identical.
5. **Deploy to staging, then test the page.** Build, dry-run, confirm
   `bornclock-staging`, deploy (pages can be batched into one deploy).
   After any fix, redeploy before retesting — never test a stale build.
   Then: the Step 0 harness on all three browsers; inputs —
   positive (correct results), negative (empty, 31 Feb, future dates,
   unknown city → clear message, never a crash), edge (leap-day birth,
   unknown or midnight birth time, 1900, Hindi pages); interactive pieces
   (tabs, modals, tooltips/glossary, date and time pickers) by mouse,
   touch and keyboard.

---

## STEP 3 — END OF EVERY RUN: FULL RETEST

After the last page and the last fix, on a fresh staging deploy:
1. Re-run the Step 0 harness on **every page finished in this run**, on
   all three browsers — a late fix must not have broken an earlier page.
2. Re-run the harness (Chromium) on **every page moved in earlier runs**.
3. Compare the Step 00 regression screenshots before vs after — pages not
   in this group must look the same.
4. Run the full automated test suite — it must pass, with no fewer passing
   tests than the Step 00 baseline.
Fix and retest anything that fails before writing the report.

---

## GROUP-SPECIFIC NOTES

- **VEDIC:** finish the remaining Vedic routes listed in
  `docs/run1-report.md` (minus those reassigned to MYSTIC). Journeys: hub
  → Kundli with birth details carried → matching → Sade Sati → Muhurat;
  paid Kundli report up to checkout opening; AI astrologer answers and
  its guardrails respond.
- **BIRTHDAY:** includes the templates that generate most URLs —
  `/born-on/[date]` (global and India), celebrity index and profiles,
  `/birthday/[m]/[d]/`, Today's Birthdays, age calculator, birthstone,
  `/results`, `/birthday-report` and its report view (visual only).
  Spot-check several generated routes per template. Journeys: arriving on
  a born-on page and a celebrity profile from search → onward navigation;
  WhatsApp share and link previews. **Invalid generated routes** (e.g. a
  born-on page for 30 February, an unknown celebrity slug, a nonexistent
  zodiac pair) must return a real 404 status with the styled not-found
  page — never a crash, a blank page, or a 200 "soft 404".
- **MYSTIC:** includes the routes reassigned from VEDIC. Journeys: hub →
  numerology → compatibility → zodiac; carry-forward where it exists.
- **SCIENCE:** full Workbench rebuild per the Science design reference
  (white background, blue/green): `/life-expectancy`, `/biological-age`,
  longevity quiz, country comparison, planetary age and weight, country
  life-expectancy pages. Calculations, paywall and pricing unchanged —
  prove it with the before/after output and gating records.
- **NEUTRAL:** homepage (keep its approved design; connect it to the
  central system), pricing/upgrade, checkout and region modals, gift
  flows, sign-in/join, account, legal, about/editorial, contact,
  `/answers` index, articles index, 404 and error states. Then, once no
  page uses it, **remove the old `.paj` styling system** so one system
  remains.

---

## FINAL RUN (GROUP = FINAL)

1. **Coverage:** confirm every public route is on the central system and
   `.paj` is gone; finish anything left.
2. **Phone speed, measured fairly:** old production build vs new build on
   the same staging worker (build the old commit in a separate worktree;
   deploy its output with the current `wrangler.toml` and `--env staging`
   per Rule 2; if that can't be done safely, use production's numbers as
   a clearly-labelled reference). Warm cache, median of 5, mid-range phone
   emulation, one page per layout type. Targets: LCP under 2.0s, CLS
   under 0.05, TBT under 200ms. Fix: above-the-fold content visible
   without JavaScript, split code and defer below-the-fold sections, ads
   and analytics after the page is usable with reserved space, sized and
   lazy images. Report real numbers; never loosen the method. Add the
   performance budget check (pull-request workflow, never deploys) and
   real-visitor speed tracking on the production hostname only.
3. **Full journeys across all browsers:** search arrival, homepage →
   `/results`, Vedic flow, paid flow on staging (test mode; full purchase
   if staging sign-in works, otherwise up to checkout opening), sign-in
   and saved profiles, AI astrologer, sharing, EN/हि toggle and phone menu,
   all interactive components. API smoke tests on staging (no real user
   data, no real email). Status crawl of all sitemap URLs (≤8 parallel).
4. **Merge and release candidate:** tag `develop`
   (`pre-redesign-merge`), merge `redesign-central` into `develop`, run the
   full suite, push both branches (re-check workflow triggers first),
   deploy `develop` to staging as Release Candidate 1, and re-test it.
5. **Launch-day steps in the report:** record the current production
   version ID for one-command rollback; merge `develop` into `main` →
   production deploys; only then add the Cloudflare token to GitHub.

---

## REPORT (every run)

Write `docs/migration-<group>-report.md` and include it in full in your
last message. **First line: "<GROUP> COMPLETE: YES" or "<GROUP> COMPLETE:
NO — N pages remaining"**, then: pages finished with before/after notes,
test results per browser (positive, negative, edge), the Step 3 full
retest and regression results, the test suite count vs baseline, bugs
found and fixed, the staging URL and pages
to look at, and the exact remaining pages (if any). For FINAL, the first
line is "LAUNCH-READY: YES" or "LAUNCH-READY: NO — blockers".
