# BornClock — Part AO: Launch-Ready Final Build
## One autonomous run. Every public page in the new design, no exceptions. Verified, then merged into `develop`. Production is never touched. Long run — keep going until done.

---

## THE GOAL, IN ONE SENTENCE

When this run ends, the person should be able to open the preview and the
new staging address, click anywhere on the site, and never see an
old-design page, an old-design component, or a broken flow — so the only
step left is their explicit "push to production."

The person's hard requirement: **no mix of new-design and old-design
pages.** Every public page must be in the new design language before
this run is considered complete.

---

## RULES (read these, then the referenced docs)

Read `docs/BornClock_PartAL_FullSiteRedesign_v2.md`,
`docs/BornClock_PartAM_ContentExpansion_SEOMagnets.md` and
`docs/BornClock_PartAN_Homepage.md`. Their rules apply, with the updates
below:

1. **Production is never touched.** Never `wrangler deploy` the
   production worker, never promote a production version, never change
   the production worker's routes or custom domains, never merge into
   `main`. Preview = isolated `wrangler versions upload` built with
   `--mode preview` (confirmed working in Part AN).
   **One explicit new permission in this run:** you may create and deploy
   a *separate, new* staging worker (Step 4) to its own `workers.dev`
   address. That worker must declare no custom domains and no routes.
2. **No stopping, no questions.** Resolve ambiguity yourself, log it in
   `docs/part-ao-decisions.md`, keep going.
3. **The Fifth Rule.** Every "verified" claim is checked against the real
   served output on a live URL, fetched fresh — never source code or a
   passing build alone.
4. **Structured data** only via the body-rendered `JsonLd.tsx`.
5. **Preserve every feature.** This is a visual/layout conversion. Never
   remove or change calculations, content, paid/premium gates, pricing,
   payment or entitlement logic. Restyle money-related screens without
   touching their logic.
6. **Commits:** one commit per global change and per page or page group,
   each independently revertable. Log progress per finished page/group in
   `docs/part-ao-progress.md`.
7. **Drift check:** before each page group, re-confirm rules 1, 3, 5 and
   the no-wasted-space layout rule (Step 3).
8. **Flaky commands:** retry a failed/hanging build, test or upload up to
   3 times; check for known-harmless patterns (cron exit-code-1) before
   treating it as real.
9. **Database writes are limited to test data.** The database is shared
   with production. Any direct write in this run (for example setting or
   removing paid status) may touch only the designated test account's own
   records — never any real user's data, never bulk updates, never schema
   changes (DDL goes to NOTES files per the standing codebase rule).

---

## STEP 0 — BASE CHECK

Confirm you are on `part-aj-four-page-redesign` with all of Parts AJ–AN
committed and the working tree clean (the regenerated `public/sitemap.xml`
build artifact may be present). Read the design references in
`docs/design-reference/` (the four category pages and `homepage-final`)
— they define the visual language. Use the Part AL page audit
(`docs/part-al-audit.md`) as the starting inventory of every page
component; re-check it against `App.tsx` so no route is missed.

---

## STEP 1 — GLOBAL SHARED RESTYLE (do this first — biggest impact)

Pages "finished" in earlier parts still look partly old because shared
building blocks were never restyled. Confirmed example: `/kundali` has a
new body but the old top navigation, old purple tabs and an old purple
submit button. Fix the shared layer once so every page changes at once:

- **Global Navigation (desktop + mobile menu)** and **footer**: restyle to
  the new system — navy bar, Fraunces wordmark, category-coloured labels,
  matching the homepage reference header. Keep every item, the order
  (Birthday first, Vedic second, Mystic, Science, More), the EN/हि
  language toggle, sign-in/join and upgrade functionality unchanged.
- **Remove the old purple brand colour from the entire site.** Find the
  old primary colour token(s) (theme variables, Tailwind config, shared
  component defaults) and replace them. New rules: primary buttons navy
  `#0E2238` with white text; upgrade/premium actions gold `#C6A15B`
  background with navy text; links and accents use the page's category
  colour, with accessible text shades — bronze `#806125`, coral text
  `#B5432A`, green text `#237A60`, amethyst `#6E5AA6`, blue `#2F6FB0`.
- **Shared components:** Button, Tabs, Input/Select/date and time pickers,
  Checkbox, Badge, Card, Dialog/Modal (including the checkout and
  region/GST modals — visual only), Toast, Tooltip, Accordion, progress
  bars, loading skeletons and empty states — all in the new tokens,
  Fraunces + Public Sans, hairline borders, compact padding, with clear
  visible keyboard focus states.
- **Page background:** ivory `#FAF7F0` for Vedic, Birthday and Mystic
  pages and shared/utility pages; white for Science & Longevity pages.
- Verify on the preview that `/kundali` and the nine earlier-redesigned
  pages no longer show any old component.

---

## STEP 2 — HOMEPAGE FIXES

**Replace the "Year N of your life — X% complete" bar** (people found it
confusing) with two real, computed facts:
- "You were born on a <weekday>." — the real weekday of the birth date.
- "Next milestone: <N,000> days old — on <date> · <X> days to go", with
  the animated bar now showing progress through the current 1,000-day
  block. On the exact milestone day show a short celebratory line
  instead.
Do the date maths on calendar dates (UTC) so daylight-saving changes
cannot cause off-by-one errors. Unit-test: weekday for 1869-10-02
(Saturday), 1973-04-24 (Tuesday), 1998-03-14 (Saturday); milestone maths
including leap years, the milestone day itself, and the day before. Keep
example-labelling (these lines read as an example until the visitor's own
date or saved profile is used).

**Fix the slow phone load (LCP regressed from ~3.0s to ~4.6s in Part AN).**
Self-host the fonts instead of loading them from Google Fonts: Fraunces
and Public Sans as Latin-subset `woff2`, only the weights actually used,
`font-display: swap`, and preload the Fraunces weight used by the
homepage `<h1>`. Neither font covers Devanagari, so also self-host one
Devanagari-capable font (e.g. Noto Sans Devanagari, subset, the weights
used) and apply it to the Hindi (`/hi/...`) pages and any Hindi text, so
Hindi never falls back to whatever font the visitor's device has.
Remove the Google Fonts requests (update the content-security policy if
needed). Measure the homepage before and after
with the same method as Part AN; the target is an LCP at or below
production's ~3.0s. Report both numbers.

---

## STEP 3 — CONVERT EVERY REMAINING PUBLIC PAGE

**Approach — this is how all pages get done in one run:** build or extend
a shared category page layout (breadcrumb, heading block, trust line,
input panel, results area, CTA band) and convert each page by adopting it.
Keep each page's existing content and logic; do not re-research or
rewrite copy. Template pages (one component rendering many routes) are
converted once and spot-checked across several routes.

**No-wasted-space layout rule (applies to every page):** no empty side
columns, no large blank areas, no content stretched thin to fill width.
Example to fix: `/kundali` has a "Birth details" label column with empty
space beside the form — use the full width for the form, or put genuinely
useful content alongside it (what you'll get, method/trust note). Dense,
edge-to-edge, hairline-divided, never cluttered.

**Order (highest-traffic and most-linked first):**
1. `/results` — the "full birthday profile" the homepage sends people to.
2. Every tool linked from the homepage directory and footer that is still
   old: zodiac, Chinese zodiac, tarot by birthday, name numerology (verify
   Part AM state), biorhythm, Today's Birthdays, age calculator,
   birthstone, Indian celebrities by date, `/sun-vs-moon-sign`,
   `/moon-sign`, `/astrologer`, `/nakshatra`, and any others found.
3. Money screens — pricing/upgrade, Birthday Blueprint (`/birthday-report`
   and its report view, including the locked preview), gift flows,
   checkout and region modals. Visual only; logic untouched.
4. **Science & Longevity full rebuild** (`/life-expectancy`,
   `/biological-age`, the longevity quiz, country comparison, planetary
   age and weight) — white background, blue/green accents, the
   honesty-forward Workbench structure from the reference. Carry forward
   every calculation, the paywall and pricing unchanged. This has been
   deferred three times; it is required now.
5. Birthday templates — `/born-on/[date]` (global and India), celebrity
   profile pages, `/birthday/[m]/[d]/`.
6. Remaining Vedic and Mystic pages, Hindi (`/hi/...`) pages, the
   country-specific life-expectancy pages.
7. Utility and content pages — articles/blog templates, `/answers/*`, How
   it works, About, Editorial policy, Privacy, Contact, sign-in/join,
   account, `/diwali-gift`, `/for-business`, `/coach`.
8. 404, error and loading states.
Internal admin pages only need to pick up the shared restyle from Step 1;
no layout work required.

Apply the correct category accent per page. Keep carry-forward of birth
details working everywhere it already exists. Every converted page keeps
its existing title, meta and structured data (fix any that are missing or
duplicated, as Part AM did).

---

## STEP 4 — SEPARATE STAGING WORKER (no domain changes)

Create a separate worker for staging (e.g. a wrangler environment
`[env.staging]` named `bornclock-staging`), deployed to its own
`workers.dev` address. It shares the same Supabase database.
- **Wrangler environment inheritance — critical.** An `[env.staging]`
  block automatically *inherits* some top-level keys — including routes /
  custom domains, scheduled triggers and `workers_dev` — and does *not*
  inherit others, such as `vars` and bindings (KV, R2, services, etc.).
  So in `[env.staging]`: explicitly set `routes = []` (no custom domain),
  explicitly set `triggers = { crons = [] }`, explicitly set
  `workers_dev = true`, and explicitly redeclare every `var` and binding
  the app needs. Check the current Wrangler documentation for the exact
  inheritance list rather than assuming.
- **Before the first staging deploy**, run `wrangler deploy --env staging
  --dry-run` and confirm the resolved config has no routes, no custom
  domains, no crons, and the expected bindings.
- **After deploying staging**, verify the production worker is
  untouched: `bornclock.com` and `staging.bornclock.com` still serve the
  production worker exactly as before (check response headers/bundle
  hash), and the production worker's routes, custom domains and cron
  triggers are unchanged. If anything about production changed, revert
  the staging change immediately and document it.
- Do not touch `staging.bornclock.com` or `bornclock.com` bindings —
  moving the staging domain is a separate step the person does later.
- **No emails to real users from staging:** add an environment flag that
  suppresses outbound email except to an allowlist of test addresses. The
  flag is set only in the staging environment; production's default
  behaviour must remain exactly as it is today.
- **Razorpay TEST keys only** on staging (build mode with the test key;
  test secret set via `wrangler secret put --env staging`). Confirm the
  served staging bundle contains `rzp_test_` and never `rzp_live_`.
- Other secrets: list the production worker's secret *names*
  (`wrangler secret list`), set the staging equivalents from values
  available in local env files. If a value isn't available locally,
  document it under "needs the person" and continue — never guess.
- Separate KV/R2/other bindings for staging wherever they store mutable
  user-facing state; read-only reference data may be shared. If unsure,
  separate.
- **Hidden from search engines — host-conditional only.** In the worker,
  decide by the request's hostname: for the staging worker and any
  `workers.dev` host, add `X-Robots-Tag: noindex` and serve a disallow-all
  `robots.txt` response. **Never edit the static `public/robots.txt`, and
  never add a `noindex` meta tag to page HTML** — both would ship to
  production at launch and tell Google to drop the real site. Canonical
  URLs keep pointing to `bornclock.com`.
- **No tracking on test addresses — hostname-conditional.** On the
  staging worker and every `workers.dev` host (previews included),
  disable analytics, ads and any third-party tracking tags, so automated
  testing in this run never pollutes production analytics and never
  generates automated ad views that could be flagged as invalid traffic.
  Production (`bornclock.com`, `www.bornclock.com`) behaviour stays
  exactly as it is. Do this before the screenshot audit in Step 6.
- **Prove production stays indexable:** unit-test the hostname check
  (`bornclock.com` and `www.bornclock.com` → no noindex, normal
  `robots.txt`; staging and `workers.dev` → noindex), and confirm the
  built `public/robots.txt` and the prerendered HTML contain no noindex or
  disallow-all.
- Add a `deploy:staging` script; make the production deploy command
  explicit and separate so the two can never be confused.
- Document the remaining domain step for the person in
  `docs/staging-setup.md`: detach `staging.bornclock.com` from the
  production worker in the Cloudflare dashboard, then attach it to the
  staging worker; plus adding the staging address to Supabase allowed
  redirect URLs and Google sign-in allowed origins.

---

## STEP 5 — REAL PAYMENT TEST ON STAGING (test mode only)

Only after confirming the staging bundle carries `rzp_test_`, and only
after this invoice check: find out what a completed purchase creates
(receipt or invoice records, invoice numbers, invoice emails). If it
assigns a sequential invoice number in the shared database, a test
purchase would consume a number from the real GST invoice series and
leave a gap. In that case, make test-mode payments skip real invoice
numbering (or use a clearly separate test series) without changing
production behaviour — or, if that can't be done safely, do not run the
test and document why. Then:
- Use a clearly named test account (not an admin-bypass account, so the
  paywall is genuinely exercised).
- Buy a paid product with Razorpay's published test card in test mode.
- Confirm the paid content unlocks; then remove the paid status and
  confirm it locks again.
- Clean up or clearly mark the test records in the shared database.
If any precondition fails (no test secret available, key mode unclear),
do not run it — document exactly what's missing under "needs the person."
Two specific blockers to handle:
- **Sign-in on the staging address** may be refused because Supabase and
  Google sign-in only accept approved addresses. If the purchase needs a
  signed-in user and sign-in is refused, document it (the person adds the
  staging address in Supabase Auth redirect URLs and Google sign-in
  allowed origins) rather than working around authentication.
- **If Razorpay's checkout window can't be completed by automation**,
  document what was tried and include a short manual test script in the
  report (open staging → buy with test card → confirm unlock → confirm
  re-lock) so the person can finish it in a few minutes.
Never run this test on the isolated preview: previews run on the
production worker with production server-side secrets.

---

## STEP 6 — FULL VERIFICATION (fix and retest until clean)

- **Visual audit of every public page/template**, desktop 1440 and mobile
  390, on the live preview: screenshot each, and programmatically flag
  old-design markers — any computed colour in the old purple range, old
  cosmic/gradient backgrounds, the old navigation, Google Fonts requests,
  missing new-design layout classes, empty side columns. Save screenshots
  to `docs/part-ao-screens/` with an `index.html` contact sheet the person
  can open; do not commit the images if they exceed ~50 MB total.
  **Target: zero flagged pages.** Write `docs/part-ao-visual-audit.md`
  (route → pass/fail → fix).
- **Every sitemap URL** returns 200 (or an intended redirect) on the
  preview — status crawl of all URLs at modest concurrency (no more than
  about 8 parallel requests).
- **Indexability:** fetch the preview with a `Host`/URL check — preview
  and staging send noindex; confirm the production code path does not
  (per Step 4's unit test).
- **Link crawl** of the homepage, the four category pages and every
  converted tool page: zero dead links.
- **Served output** on a sample of every template: correct title, single
  `<h1>`, JSON-LD valid on validator.schema.org (0 errors).
- **Functional checks:** every calculator produces correct output for the
  reference test charts used throughout the project; carry-forward works;
  `/results` renders from the homepage; payment test result from Step 5.
- **Edge cases:** empty, invalid and future dates; leap-day birth; unknown
  birth time; direct visits without carried data.
- **Reduced motion, zero console errors**, full automated test suite
  passing, and the homepage LCP comparison from Step 2.

---

## STEP 7 — ONLY IF STEPS 1–6 ARE CLEAN: ADDITIVE CONTENT

If and only if the visual audit has zero flagged pages and all checks
pass, build the four new pages identified in Part AM research
(`/manglik`, `/angel-numbers`, `/personal-year-number`,
`/kaal-sarp-dosha`) in the new design with full SEO, real interlinking
and the same content standards. Skip this step entirely rather than
compromise Steps 1–6.

---

## STEP 8 — SELF-VERIFICATION, MERGE, FINAL DEPLOYS

1. Self-verification pass: fresh test suite, fresh live fetches of a
   sample of pages, fresh validator run, fresh sitemap status crawl, real
   git timestamps for elapsed time. Fix anything that doesn't hold up.
2. **Before merging, tag the current `develop`** (e.g.
   `git tag pre-part-ao-merge develop`) as a rollback point. Then **merge
   `part-aj-four-page-redesign` into `develop`.** Do not merge into
   `main`. If conflicts arise: keep the branch's newer work, but preserve
   any `develop` commit that isn't on the branch (e.g. an earlier fix);
   never discard either side wholesale; log every resolution in
   `docs/part-ao-decisions.md`; run the full test suite after the merge
   and fix anything it breaks.
3. From `develop`: build and upload the final isolated preview, and
   deploy the staging worker. Confirm both serve the final build.

---

## FINAL REPORT

Write `docs/part-ao-report.md` and include it in full in your last
message. **Its first line states plainly: "LAUNCH-READY: YES" or
"LAUNCH-READY: NO — N blockers", followed by the blocker list.**
Blockers are: any public page still in old design, any broken page or
flow, any payment/entitlement regression, any console error that breaks
functionality. Then include:
- the visual audit summary (pages checked, pass count) and how to open
  the contact sheet;
- what the global restyle changed;
- the homepage milestone/weekday change and the before/after LCP numbers;
- the staging worker address, guardrails confirmed (no routes, no crons,
  no emails to real users, no tracking, noindex by hostname), the invoice
  check outcome, and the payment test result;
- the sitemap status crawl and link crawl results;
- anything in Step 7 built or skipped;
- the final preview URL and `develop` commit;
- **"Needs the person"** — the exact remaining steps: the staging domain
  move (from `docs/staging-setup.md`), approving the staging address in
  Supabase and Google sign-in if needed, any missing secret values, the
  manual payment-test script if automation couldn't finish it, and the
  production release on their explicit word;
- the rollback tag name and the commands to roll `develop` back to it.

---

## WHAT NOT TO DO
- Do not deploy, promote or re-route the production worker, and do not
  merge into `main`.
- Do not give the staging worker a custom domain or route in this run.
- Do not leave any public page in old design and call the run complete.
- Do not change calculations, content, pricing, payment or entitlement
  logic.
- Do not use live Razorpay keys anywhere except production.
- Do not let staging send email to real users or run scheduled jobs.
- Do not let Step 7 delay or weaken Steps 1–6.
- Do not invent routes, sources, numbers, or secret values.
- Do not edit `public/robots.txt` or add noindex to page HTML — staging
  hiding is hostname-based in the worker only.
- Do not rely on "declare no domains" for staging — explicitly clear
  inherited routes and crons, dry-run first, and verify production after.
- Do not run the payment test on the isolated preview.
- Do not write to any real user's database records — test account only.
- Do not let a test purchase consume a real GST invoice number.
- Do not let analytics or ad tags fire on preview or staging addresses.
