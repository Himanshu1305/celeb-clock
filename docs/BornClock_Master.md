# BornClock — Master Programme (all open items, in order)
## One file, run stage by stage. The person's message names the STAGE: RC3, P0, P1, P2, P3, P4, P5 or FINAL. Execute ONLY that stage's section below. No stopping, no questions.

**Goal: complete every open task, then combine everything into one fully
tested version on staging for the person's single round of testing.**
Launch is not part of this programme.

**Order and gating:** RC3 first (the launch candidate). Growth stages
P0–P5 start only after `docs/rc3-report.md` begins "RC3 READY: YES" and
RC3 is merged into `develop`. Nothing in any stage deploys to production,
merges into `main`, or adds a Cloudflare token to GitHub — launch is the
person's explicit decision, done separately.

- For **STAGE = RC3**: follow PART 1 (the RC3 instructions) exactly.
- For **STAGE = P0…P5**: follow PART 2 (the Growth programme) for that
  PHASE exactly; "PHASE" in Part 2 means the STAGE named.
- For **STAGE = FINAL**: follow PART 3 (finish leftovers, combine,
  full-site test, deploy to staging). FINAL always proceeds: if any phase
  report is not COMPLETE: YES, FINAL first finishes that phase's remaining
  items (same rules and testing), then continues.

Each part has its own rules, Step 0, testing and report format. Do not
mix them: Part 1's rules govern RC3; Part 2's rules govern P0–P5.

---

# PART 1 — STAGE RC3 (launch candidate)

## BornClock — Release Candidate 3
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


---

# PART 2 — STAGES P0–P5 (Growth programme)

## BornClock — Growth Programme (multi-phase, multi-night)
## Branch `growth` from `develop` (after RC3 is merged). The person's message names the PHASE for this run: P0, P1, P2, P3, P4 or P5. Unattended, may be restarted. No stopping, no questions.

**This work must never affect the launch.** RC3 on staging is the launch
candidate. Never merge into `develop` or `main`; never `wrangler deploy`.
New work is shown only through preview versions.

---

## RULES (every phase)

1. **Production untouched:** no production deploy or promotion, no route or
   domain changes, never push or merge `main`, never add a Cloudflare token
   to GitHub.
2. **RC3 untouched:** never merge into `develop`; never `wrangler deploy`.
   Previews only: `wrangler versions upload --env staging` (dry-run/inspect
   first; worker must be `bornclock-staging`). Never run `wrangler` from an
   older checkout; any `wrangler secret` command includes `--env staging`.
3. **Unattended:** never end your turn to wait for a build or test; run long
   commands in the foreground (60-minute limit) or keep polling. Another
   project may share this Mac: before speed measurements check `uptime`;
   above half the CPU cores, wait in 5-minute steps (max 60 min).
4. **Real use, not page loads:** a tool counts as verified only when real
   input is submitted on the live preview and the correct result renders
   from the real (unmocked) API. Pace requests (staging rate-limits; city
   lookup uses OpenStreetMap Nominatim, ~1 request/second — prefer
   built-in cities). Tooling limits are recorded with alternative evidence;
   sign-in-gated parts are verified up to sign-in.
5. **Test, fix, retest;** log bugs in `docs/growth-bugs.md`. Positive,
   negative and edge cases for every input (empty, 31 Feb, future dates,
   unknown city, leap-day birth, unknown/midnight birth time, 1900, Hindi);
   Chromium, WebKit (iPhone) and Android; axe zero serious/critical; served
   output (title, single `<h1>`, prerendered H1 and lead); zero console
   errors; perf-budget passing; full test suite never below baseline.
6. **Content quality — no thin content.** Every page and result section
   gives real, page-specific substance computed for that page (not a
   template with words swapped). Every section passes the **"so what?"
   test**: what it is, what it means for the reader, what to do or expect.
   Plain, impact-first language; every technical term through the
   glossary. Programmatic pages (e.g. planet-in-house) must each be
   genuinely distinct and useful; if a set can't meet this bar, build fewer,
   better pages.
7. **Predictions — clear, not timid; honest, not certain.** Lead with a
   clear answer, show the reason from the chart, say what it means, and
   grade every indication **strong / moderate / mild**. Attribute readings
   to the tradition ("Vedic astrology reads this as…"). Never: specific
   dates for marriage, illness or death; guarantees; fear-based or paid
   remedies pushed through fear. Marriage timing keeps the existing
   guardrail (favourable windows only, tense-aware, never volunteer
   second-marriage combinations). **Children's health:** "areas to care
   for" with gentle practical guidance only — never "your child will be
   ill", never anything that could influence medical decisions; always
   point to the paediatrician.
8. **Honesty:** no fabricated numbers, sources, citations, reviews, people
   or credentials. Classical text references (e.g. Brihat Parashara Hora
   Shastra) only where the citation is verified; otherwise cite the text
   without a chapter. Content written with AI from computed data must be
   grounded in real computed values, and disclosed where appropriate.
9. **Licences:** Wikimedia content (CC BY-SA, attribution), OpenStreetMap
   (attribution), any names/places dataset must be properly licensed —
   never scraped from competitors. Never copy competitor wording.
10. **Money:** do not change existing prices, paywall gating, payment or
    entitlement logic. **New paid products are built behind feature flags,
    switched OFF**, with no invented prices — the person sets prices.
11. **Data and privacy:** database writes test-only (designated test
    account); schema changes go to a NOTES file for the person. Emails only
    to users who opt in, with unsubscribe; no WhatsApp messaging without a
    WhatsApp Business account and explicit consent.
12. **Site rules:** central design system (correct theme and layout),
    layout acceptance rules, JSON-LD via `JsonLd.tsx` (FAQPage only for real
    Q&A), unique titles/meta, sitemap and prerender lists, interlinking (no
    orphans), new routes registered with the worker's not-found logic,
    date-dependent values computed in the browser or at the edge, never
    baked in at build time. Never edit `public/robots.txt`.
13. **Build time:** the full build must stay within its limits (the
    homepage prerenders last and can be skipped if the build is slow).
    High-volume, date-based pages (daily horoscope, daily Panchang) use
    evergreen URLs with date-based content computed at request time — never
    one prerendered page per date. Report build time after each phase.
14. **Commit per item; push `growth`** after each item.

---

## STEP 0 — START OF EVERY ATTEMPT

1. Create `growth` from `develop` if missing (only after RC3 is merged —
   `develop` must contain the RC3 merge); otherwise switch to it and merge
   in any newer `develop` commits.
2. Leftovers: finish and test, or `git stash` with a clear message and log.
3. Resume from the first unfinished item of this PHASE (commits, bug log,
   partial `docs/growth-<phase>-report.md`).
4. Record the test-suite baseline.
5. For P1–P5: read `docs/growth-p0-report.md` first and apply its verified
   refinements (competitor section lists, corrected gaps) to this phase's
   items. Then read `docs/growth-improvements.md`: **every improvement item
   assigned to this phase is part of this phase's work**, held to the same
   quality and testing rules, and ticked off in that file with evidence when
   done.

---

## PHASE P0 — Competitor comparison and gap verification (read-only research + report)

Compare BornClock (RC3 on staging) with competitors **per category**, using
the same birth details on each and comparing what a visitor actually
receives for free (paid reports: describe from public information, and say
so):
- Vedic: AstroSage, ProKerala, Astrotalk, Drik Panchang, Clickastro
- Birthday & celebrity: Famous Birthdays, OnThisDay, Timeanddate
- Mystic: Cafe Astrology, Astrology.com, leading numerology, Chinese
  zodiac and tarot sites
- Science & longevity: Living to 100, government life-expectancy
  calculators, biological-age tools
Score 1–5 per criterion with dated evidence: number of sections, quality,
depth, thin content, technical terms explained, user perspective ("so
what?"), prediction clarity, yearly/monthly predictions, child Kundli,
career and health sections. State plainly where competitors are better.
List BornClock's thin pages and unexplained terms. Confirm or correct the
gap list in Phases P1–P5 and refine each item's design from what
competitors include. Light, polite browsing only — no aggressive scraping.
Output: `docs/growth-p0-report.md`.

**Also produce `docs/growth-improvements.md`** — a prioritised, actionable
backlog that later phases must work through:
- **(a) Fixes to existing BornClock pages:** every thin page, every
  unexplained technical term, every section failing the "so what?" test,
  and every section where a competitor is clearly better — each with the
  specific change needed. Assign these to **P1** by default.
- **(b) New gaps** found in competitors that aren't already in P1–P5 —
  each assigned to the most suitable phase (P1 traffic, P2 predictions/paid,
  P3 retention, P4 reach, P5 infrastructure), with why it matters. Items
  too large or needing a business decision go under "Needs the person".
Each item has an ID, its assigned phase, and an acceptance check.
**Fix at the source:** when a problem affects many generated pages (e.g.
celebrity profiles, born-on dates, zodiac pairs), the item is a fix to the
shared template or data that builds them — never hundreds of page-by-page
edits. Order items by impact (traffic, trust, revenue) so the most
valuable fixes land first.

## PHASE P1 — Traffic engines

1. **Horoscopes per Moon sign and Sun sign:** daily, weekly, monthly,
   yearly — computed from real planetary positions for that period, with
   real ingress dates; evergreen URLs (e.g. `/rashifal/mesh/today`,
   `/monthly`, `/2027`) with content generated and cached per period at
   request time. Replace or upgrade the static `/hi/rashifal`.
2. **Daily Panchang for the user's city** (tithi, nakshatra, yoga, karana,
   sunrise/sunset, Rahu Kaal, Choghadiya) using the existing engine;
   validate sample dates and cities against an established Panchang
   source and report agreement.
3. **Festival and vrat calendar** (Ekadashi, Purnima, Amavasya, Sankranti,
   major festivals, Karwa Chauth moonrise, Diwali muhurat), computed, by
   year.
4. **Planet-in-house and planet-in-sign pages** (9 × 12 each), **27
   Nakshatra pages**, **Yoga pages** — each genuinely distinct (Rule 6).
5. **Transit pages:** Saturn, Jupiter, Rahu–Ketu transits by year with
   per-sign effects; Mercury retrograde dates.
6. **Baby names by Nakshatra letter** with meanings, from a properly
   licensed or original dataset.
7. **Remaining content-gap pages** from `docs/part-am-content-gap-research.md`
   that meet Rule 6 (e.g. D7/D4/D24 explainers, Chaldean numerology,
   birthday and attitude numbers, Blue-Zones and longevity-by-habit pages).

## PHASE P2 — Predictions and paid depth

1. **Personal predictions:** yearly (Dasha plus major transits relative to
   the chart; add a Varshphal/annual chart if it can be computed and
   validated), quarterly and monthly (using the Pratyantar and Sookshma
   levels already built) — Rule 7 throughout.
   **Also upgrade the existing prediction surfaces to Rule 7** — What's
   Ahead, the career report, Kundli and report interpretations, Sade Sati,
   Muhurat explanations — replacing timid, hedged wording with clear,
   graded (strong / moderate / mild), reasoned readings, while keeping
   every guardrail (marriage windows, children's health, no dates for
   illness or death, no fear-based remedies) and the AI astrologer's
   existing guardrails unchanged.
2. **Child (Bal) Kundli:** temperament, learning and education strengths,
   natural talents and likely career inclinations, health and wellbeing
   care areas (Rule 7), favourable periods through childhood, Nakshatra
   name letters (link to the baby-names pages), doshas calmly (incl. Mool
   Nakshatra), and "how to support your child" guidance for parents.
3. **Career:** a ranked list of best-suited fields with reasons (10th house
   and lord, D10, strongest planets), fields to approach with care, and
   growth periods.
4. **Health (adults):** classical associations and periods for extra care —
   wellbeing framing, never diagnosis.
5. **Foreign travel and settlement**, **wealth and finances**, **education**
   sections with graded indications.
6. **Free downloadable Kundli PDF**; **South Indian chart style** (toggle,
   alongside North Indian).
7. **Matching depth:** Manglik check inside matching, Nadi dosha explained,
   South Indian 10-Porutham option.
8. **Numerology:** name correction, business name, mobile number, house
   number.
9. **More doshas:** Pitra, Nadi, Mool Nakshatra, Grahan — calm tone.
10. **Classical references** on interpretations (Rule 8).
11. **Paid products behind flags, OFF (Rule 10):** Yearly Report, Child
    Kundli Report, detailed Career Report, Marriage Compatibility Report,
    name correction, premium AI astrologer tier — with free summaries
    visible.

## PHASE P3 — Retention

1. **Fix scheduled jobs:** Cloudflare cron is known broken — implement a
   working scheduler (e.g. a GitHub Actions schedule calling a protected
   endpoint, or a verified Cloudflare cron on the staging worker), test it
   on staging only.
2. **Personal dashboard:** "your day" from the user's own chart.
3. **Opt-in email notifications:** daily horoscope, transit alerts, family
   birthday reminders (Rule 11). Prepare WhatsApp support but leave it off
   until the person has a Business account.
4. **Family profiles:** finish the family dashboard for parents managing
   children's Kundlis.
5. **Installable app (PWA):** manifest, icons, offline shell.
6. **Shareable birthday cards and wishes.**
7. **Real reviews:** a review/rating collection system for real users only
   — no seeded or fake reviews.
8. **Expert reviewer support:** reviewer byline/credentials components,
   unused until the person provides a real reviewer — never invent one.

## PHASE P4 — Reach

1. **Full Western birth chart** (Sun, Moon, Rising, houses) for the global
   audience.
2. **Celebrity Kundlis** with an honest birth-time reliability note per
   celebrity.
3. **"What happened on your birthday"** using Wikimedia's "On this day"
   feed, with CC BY-SA attribution.
4. **Interactive tarot** (daily card, love, yes/no) and **Chinese zodiac
   yearly forecast**.
5. **Languages:** complete Hindi coverage of key pages, then add Telugu;
   machine-assisted translation is allowed but flagged for the person's
   human review before launch.

## PHASE P5 — Infrastructure and measurement

1. **Robust city lookup:** reduce dependence on the public Nominatim
   service (e.g. a bundled, properly licensed city dataset plus caching),
   with OpenStreetMap attribution where still used.
2. **Conversion tracking:** visit → generate chart → purchase funnel events
   (consent-respecting, existing analytics only).
3. **Server-side AI astrologer limit** (today it's browser-only).
4. **Born-today photos cached** through BornClock: freely licensed images
   only, credits shown, periodic refresh.

---

## END OF EVERY PHASE — FULL RETEST (before writing the report)

On a fresh preview upload of the phase's final build:
1. Re-test **every item in this phase** after the last fix (real use per
   Rule 4, all three browsers) — a late fix must not have broken an
   earlier item.
2. **Cumulative regression:** real-use spot checks of every feature from
   earlier phases and of the core RC3 tools (Kundli with the 5-level Dasha
   and What's Ahead, matching, Sade Sati, Muhurat, Manglik, Kaal Sarp,
   numerology, birthday tools, life expectancy).
3. **Consistency across features:** for the reference charts, every
   prediction surface (What's Ahead, yearly/quarterly/monthly
   predictions, child Kundli, career ranking, transit pages) must agree
   with the same underlying Dasha and transit data — no contradictions.
4. **Site-wide checks:** full sitemap status crawl (all 200, modest
   concurrency), the 404 check script extended with every new route
   (valid → 200, invalid → 404), axe on one page per new page type, API
   smoke tests of any new endpoints (no real user data, no real email),
   full automated suite (never below baseline), typecheck, perf-budget,
   and build time.
Fix and retest anything that fails before reporting.

---

## REPORT (every phase)

Write `docs/growth-<phase>-report.md` and include it in full in your last
message. **First line: "<PHASE> COMPLETE: YES" or "<PHASE> COMPLETE: NO —
N items remaining".** YES means every item in the phase — including the
improvement items assigned to it in `docs/growth-improvements.md` — is done
and verified to Rules 4–6, or deliberately omitted with documented reasons
(Rules 6–9), or blocked only on the person. List: items built with
evidence, test results per browser, content-quality checks, build time,
the preview URL, bug summary, and "Needs the person" (prices, a real expert
reviewer, a WhatsApp Business account, translation review, schema changes).
If not complete, list remaining items — the next run with the same PHASE
continues from there.


---

# PART 3 — STAGE FINAL (combine everything, full-site test, staging)

**Rules:** all Part 2 rules apply, except these two explicit changes for
this stage only: merging `growth` into `develop` is allowed, and deploying
`develop` to the staging worker (`wrangler deploy --env staging`, dry-run
first, worker must be `bornclock-staging`) is allowed. Production, `main`
and GitHub tokens remain untouched.

1. **Start:** check the RC3 and P0–P5 reports; resume if interrupted
   (leftovers finished or stashed with a note); record the test baseline.
   **Finish leftovers first:** for any phase not reporting COMPLETE: YES,
   complete its remaining items and assigned improvement items (on
   `growth`, same rules and testing), and update that phase's report.
   Items blocked only on the person are listed, not attempted.
2. **Combine:** tag `develop` as `pre-final-merge`, merge `growth` into
   `develop` (resolve conflicts keeping both sides' intent; log each), run
   the full suite and typecheck. Push `growth`, `develop` and the tag
   (re-check workflow triggers first; never `main`).
3. **Deploy** `develop` to staging as the **complete release candidate**.
4. **Full-site test on staging** (all three browsers):
   - real use of **every** tool and feature on the site — RC3's full list
     plus everything added in P1–P5 — with positive, negative and edge
     cases;
   - every end-to-end journey: search arrival, homepage → results, Vedic
     flow with carry-forward, predictions and child Kundli, paid flows up
     to checkout (full test-mode purchase if staging sign-in works),
     sign-in and family profiles, notifications opt-in (test addresses
     only), sharing, EN/हि and other languages, phone menu, PWA install;
   - consistency of all prediction surfaces for the reference charts;
   - full sitemap status crawl, the 404 check, axe across every page type
     and theme (zero serious/critical), served output and JSON-LD on a
     sample of every page type, perf-budget and the 7-layout speed table,
     zero console errors, full suite and typecheck, build time.
   Fix, redeploy and retest until clean. Log bugs in `docs/final-bugs.md`.
   - **Competitor re-score:** repeat the P0 comparison method on the
     complete staging version and report before → after scores per
     category and criterion, plus any remaining gaps where competitors are
     still better (with a recommended next step for each).
5. **Report:** write `docs/final-report.md` and include it in full in your
   last message. **First line: "FINAL COMPLETE: YES" or "FINAL COMPLETE:
   NO — reasons".** Include a single master checklist of **every task**
   from Parts 1–2 and every item in `docs/growth-improvements.md` marked
   **done**, **omitted (with reason)** or **needs the person**; the
   competitor before → after scores; the full test results; the staging version; the undo tag; and
   the "Needs the person" list.

---

# PART 4 — ITEMS ONLY THE PERSON CAN DO (do not attempt; list them in reports where relevant)

1. Allow `https://bornclock-staging.usdvisionai.workers.dev` in Supabase
   Auth redirect URLs and Google sign-in allowed origins (unblocks staging
   sign-in and the test payment).
2. Review and apply the subscriber-credits database change
   (`report_credits`, `credits_granted_month`) in Supabase.
3. Review RC3 on staging (laptop and phone) and confirm the Manglik /
   Kaal Sarp remedies tone.
4. Launch, later, only on their explicit word: record the production version ID;
   merge `develop` into `main` (its deploy fails harmlessly without the
   token); add `CF_API_TOKEN` / `CF_ACCOUNT_ID` to GitHub; trigger the
   production deploy manually; purge the Cloudflare cache; confirm the
   homepage is prerendered; one real purchase and refund; resubmit the
   sitemap in Google Search Console.
5. After launch: move `staging.bornclock.com` to the staging worker in the
   Cloudflare dashboard.
6. Set prices for new paid products (built switched OFF); provide a real
   expert reviewer if wanted; open a WhatsApp Business account if WhatsApp
   notifications are wanted; review machine-assisted translations.
7. Decide later whether "What's Ahead" stays free (currently free).
