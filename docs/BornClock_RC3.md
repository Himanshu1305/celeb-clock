# BornClock — Release Candidate 3
## New branch `rc3` from `develop` (RC2). Unattended run, may be restarted automatically. No stopping, no questions.

RC3 combines RC2 with the verified backlog work, fixes what's broken,
corrects inaccurate claims, and replaces RC2 on staging as the single
version the person will review and launch.

---

## RULES

1. **Production is never touched:** no production deploy or promotion,
   no route or domain changes, never push or merge `main`, never add a
   Cloudflare token to GitHub.
2. **Staging:** deploying RC3 to the staging worker is allowed (it replaces
   RC2) — `wrangler deploy --env staging` only, dry-run first, confirm the
   worker is exactly `bornclock-staging`. Never run `wrangler` from an
   older checkout. Any `wrangler secret` command includes `--env staging`.
3. **Unattended headless mode:** no background notifications — never end
   your turn to wait for a build or test; run long commands in the
   foreground (time limit raised to 60 minutes) or keep polling. Another
   project may be building on this Mac: before any speed measurement,
   check `uptime`; if the load is above half the CPU cores
   (`sysctl -n hw.ncpu`), wait in 5-minute steps (up to 60 minutes) and
   note the load in the report.
4. **Real use, not page loads (new — critical).** The last run reported
   two calculators "verified" because their pages loaded and their unit
   tests passed against mocked API responses, while every real submission
   failed. From now on a tool counts as verified **only** when, on the
   live staging URL, real birth details are entered, the real form is
   submitted, the real API responds (not mocked), and the correct result
   renders. Mocked tests are still welcome but never count as verification.
5. **Test, fix, retest;** log every bug in `docs/rc3-bugs.md`. Never report
   a test as done that wasn't run.
   - **Pace the tests.** Staging rate-limits rapid requests (HTTP 429), and
     city lookup uses OpenStreetMap's public Nominatim service (usage policy
     ≈ 1 request per second). Space requests out, use cities already in the
     built-in list (e.g. Delhi, Mumbai) for most runs and an uncached city
     (e.g. Jammu) sparingly, and on a 429 wait and retry — never count a
     rate-limit as a product failure.
   - **Tooling limits vs product failures.** If the test tool can't operate
     a control in one browser (e.g. WebKit's date input) but the product
     works, record it as a tooling limitation with alternative evidence (a
     different input method, a direct API call, screenshots). Only genuine
     product failures count against the run.
   - **Sign-in-gated tools** (e.g. AI astrologer, saved profiles): if
     staging sign-in isn't available, verify everything up to the sign-in
     step and list the rest under "Needs the person" — this is not a
     failure.
6. **Preserve features:** calculations, prices, paywall gating, payment and
   entitlement logic unchanged. Content changes only where an item
   requires them. "What's Ahead" stays free (`WHATS_AHEAD_IS_FREE = true`).
7. **Honesty standard:** no fabricated numbers, sources or claims; every
   claim checked against the code; plain-language, impact-first wording;
   technical terms through the glossary.
8. **Database writes are test-only** (designated test account's own
   records); no schema changes (DDL goes to a NOTES file).
9. Never edit `public/robots.txt`; `noindex` only on genuine not-found
   states. Structured data only via `JsonLd.tsx`.
10. New routes must be registered with the worker's not-found logic; date-
    dependent values are computed in the browser, not at build time; the
    perf-budget check must pass.
11. **Commit per item; push `rc3`** after each item.

---

## STEP 0 — START OF EVERY ATTEMPT

1. If `rc3` doesn't exist, create it from `develop`; otherwise switch to it.
2. Leftovers: finish and test changes belonging to an unfinished item,
   otherwise `git stash` with a clear message and log it.
3. Resume from the first unfinished item (check commits, bug log, any
   partial `docs/rc3-report.md`).
4. Record the full test-suite count as the baseline.

---

## ITEMS (in order)

### Item 1 — Bring in the backlog work
Merge `backlog-1` into `rc3` (expected clean; resolve any conflict
keeping both sides' intent, log it). Full suite and typecheck pass.

### Item 2 — Fix the Manglik / Kaal Sarp failure, then audit every API contract
- **Fix:** `toKundaliLegacy()` (`src/lib/vedic/legacyAdapters.ts`) drops
  `doshas`, which the engine already computes. Pass `doshas` through so
  `/manglik` and `/kaal-sarp-dosha` receive `doshas.mangalDosha` and
  `doshas.kaalSarp`. Confirm with a real request that the field now
  appears, and that existing consumers of `/api/kundali` are unaffected.
- **Saved results:** `/api/kundali` caches responses (responses carry
  `_cache: hit/miss`). Entries cached before this fix lack `doshas`, so
  previously computed birth details would still fail. Make sure every
  response includes `doshas` — e.g. version the cache key, or recompute
  when a cached entry lacks `doshas` — without deleting real user data.
  Verify with a birth input known to be cached (a cache hit) as well as a
  fresh one.
- **Audit:** for every page that calls an API, list the fields the page
  requires and confirm each is present in the real (unmocked) response.
  Fix any other gap the same way, and log each.
- **Graceful fallback:** the ProKerala subscription has ended. The engine
  is local-first and ProKerala is only a fallback; make sure that if the
  local engine ever fails and the fallback is unavailable, the visitor
  sees a clear, honest message and the failure is logged — never a hang
  or a confusing error. Do not remove the local engine path.

### Item 3 — Correct the calculation-engine claims
The live chart engine is `astronomy-engine` with Lahiri ayanamsa — not
Swiss Ephemeris (that library is a legacy/panchang-only dependency).
Search the whole codebase and served meta (including `/vedic-astrology`
copy, FAQ, share text, `prerender-titles.mjs`,
`BirthTimeVedicSection.tsx`, `kundaliService.ts`, `vedicCalculations.ts`,
and any trust strip) for "Swiss Ephemeris", "Swiss-Eph", "Moshier" and
similar. For each surface, verify which engine actually runs there, and
correct only claims that are inaccurate. Keep the accurate accuracy
claims (cross-check results) intact.

### Item 4 — Plain-language trust strips with a "How we test" link
Rewrite every trust strip into plain, impact-first language: no
unexplained jargon (e.g. "Lahiri ayanamsa"), and every number says what
it measures. Pattern:
> ✓ Calculated from your exact birth date, time and place — not a generic
> table. In our tests, our Manglik results matched a leading Vedic
> astrology service in 99–100% of charts. How we test →
- Add an optional link to the `TrustStrip` component and point every strip
  to the relevant section of `/how-it-works`.
- Name the comparison service (ProKerala) and full figures on
  `/how-it-works`, stated as results of past testing, not in the strips.
- Each strip's claim must be true for that page; verify against the code.

### Item 5 — Delete the two remaining old branches
`part-ah-homepage-redesign` (local) and `origin/conflict_120226_1954`
(remote). Create archive tags (`archive/<branch>`), push the tags to
GitHub first, then delete both. Re-check workflow triggers first.

---

## TESTING (all on the live staging URL after deploying RC3)

1. **Real use of every tool (Rule 4)** — on Chromium desktop, WebKit
   (iPhone Safari) and Android Chrome. For each tool, enter real details
   (reference input: 1978-05-13, 19:30, Jammu; plus the project's other
   reference charts), submit, and confirm a correct result renders:
   Kundli (incl. the 5-level Dasha deep-dive and What's Ahead), Kundali
   matching, Sade Sati, Muhurat, gemstones, Rashi Ratna, career report,
   Manglik, Kaal Sarp, Dasha calculator, AI astrologer (one question),
   numerology, name numerology, personal year number, compatibility,
   Western and Chinese zodiac, tarot by birthday, biorhythm and the fitness
   rhythm pages, age calculator, homepage date decode and `/results`,
   Birthday Blueprint up to checkout, celebrity search, life expectancy,
   biological age quiz, planetary age and weight, country comparison.
   Record each tool × browser result in the report.
2. **Negative and edge cases** on every tool: empty fields, 31 February,
   future dates, unknown city, leap-day birth, unknown or midnight birth
   time, 1900, Hindi pages — clear messages, never a crash.
3. **Payment:** if staging sign-in works, one test-card purchase with the
   test account (unlock, re-lock, no real GST invoice number consumed);
   otherwise a short manual script for the person.
4. axe on one page per layout and theme plus all new pages (zero
   serious/critical); served output (title, single `<h1>`, prerendered H1
   and lead) on a sample of every layout; zero console errors; perf-budget
   passing; full sitemap status crawl (all 200); the 404 check script
   extended with the new routes (valid → 200, invalid → 404); the 13
   cross-group regression routes; full automated suite (never below
   baseline) and typecheck.
5. **OpenStreetMap attribution:** confirm the site shows the credit OSM's
   licence requires where city lookup is used (e.g. "© OpenStreetMap
   contributors" near the city field or in the footer); add it if missing.

---

## MERGE AND DEPLOY

1. Tag `develop` as `pre-rc3-merge`, merge `rc3` into `develop`, run the
   full suite, push `rc3`, `develop` and the tag (re-check workflow
   triggers; never `main`).
2. Deploy `develop` to staging as **RC3** (dry-run first →
   `bornclock-staging`) and run the full Testing section against it.
   Fix, redeploy and retest anything that fails.

---

## REPORT

Write `docs/rc3-report.md` and include it in full in your last message.
**First line: "RC3 READY: YES" or "RC3 READY: NO — reasons".** YES means
every item is done, every tool passes real use on all three browsers,
RC3 is deployed and re-tested, and the merge is pushed. Items needing the
person's decision or sign-in, and documented tooling limitations with
alternative evidence, don't make it NO; genuine product failures, or
anything unverified or unfinished, do. Include: each item with evidence, the tool × browser
real-use table, the API-contract audit results, every engine-claim
correction (before → after), the rewritten trust strips, branches
deleted with archive tags, the payment result or manual script, the bug
log summary, the RC3 staging version, the current production version ID
(read-only, for rollback), and "Needs the person".
