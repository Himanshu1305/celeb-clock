# Product-Polish Batch — Status Log

Branch: `product-polish` (off develop, up to date w/ origin). Local commits per phase.
No push until final gate. Started 2026-07-27.

Morning source of truth. One entry appended per phase.

Payment files NEVER edited: api/razorpay-webhook.ts, api/verify-payment.ts, api/_crypto.ts.

---

## Phase 0 — Ops Activation (code side)

Applied `docs/OPS-ACTIVATION.md` Steps 3-5 (code only; founder does Step 1 SQL + Step 2
secret + Step 6 deploy manually).

- **Step 3 (routes):** registered `import { POST as opsMonitor } from '../api/ops-monitor.js'`
  and `opsDigest` from `../api/ops-digest.js`; added `'/api/ops-monitor'` + `'/api/ops-digest'`
  to `apiRoutes` in `functions/_worker.ts`.
- **Step 4 (scheduled dispatch):** replaced the single `cronHandler.scheduled` call with a
  `switch (event.cron)` branching exactly per doc — `0 6 * * *`→daily email,
  `10 6 * * *`→ops-monitor, `0 7 * * 1`→ops-monitor (integrity), `0 9 * * 0`→ops-digest,
  default→daily email. `base = process.env.OPS_BASE_URL || workers.dev`.
- **Step 5 (crons):** `wrangler.toml [triggers]` expanded from `["0 6 * * *"]` to the 4-cron
  block, verbatim from the doc (no invented schedules).
- **Extra (required for correctness):** added `ADMIN_EMAIL`, `OPS_BASE_URL` to `BRIDGE_KEYS`
  so those secrets reach `process.env` through the CF Proxy-env shim (ops handlers read
  `process.env.ADMIN_EMAIL` / `OPS_BASE_URL`; without bridging they'd silently fall back).

Schedules NOT activated in production (deploy is founder Step 6 / final gate only).
Evidence: `git diff functions/_worker.ts wrangler.toml` pasted in session — matches doc.

Status: DONE. Commit: chore(ops): wire ops-monitor/digest routes + scheduled dispatch + crons.

---

## Phase 1 — PDF Pagination, Round 3

**1a — PDF production paths enumerated:**
- **Birthday Blueprint:** `ReportView.tsx:336` `useReactToPrint({ contentRef, pageStyle })` — the
  in-app "⬇ Download PDF" button. Prints the live `#birthday-report-print` DOM; react-to-print
  injects the `pageStyle` string into its print iframe.
- **Birthday via browser:** Ctrl/Cmd+P → Save-as-PDF on `/report/[slug]`. Gets ONLY the bundled
  `src/index.css` `@media print` rules — NOT the react-to-print `pageStyle`. The founder's filename
  "Ss_s_Birthday_Report___BornClock.PDF" is title-derived ⇒ this is the founder's path.
- **Longevity Blueprint:** `LifeExpectancy.tsx:202 handleDownloadBlueprint` → off-screen A4 iframe +
  `doc.write(buildLongevityBlueprintHtml(...))` + `iframe.contentWindow.print()`. The iframe writes
  its OWN document with its own inline `<style>`; `index.css` does NOT apply to it.
- **Harness coverage BEFORE:** `verify-pdf-coverage.mjs` *injected* `BIRTHDAY_PAGE_STYLE` before
  `page.pdf()`, so it validated ONLY the react-to-print path. The browser Cmd+P path was untested.

**1b — reproduction (mobile 390px / dSF3, page.pdf = browser-print equiv):**
- Added `--cmdp` harness flag (skips the injected pageStyle → only index.css applies = Cmd+P path).
- **Birthday Cmd+P BEFORE:** page-1 PNG dump showed the cover, THEN the running header
  "BornClock Birthday Blueprint / Neeraj" as in-body text mid-page-1, THEN Twins on the same page —
  the founder's exact defect. Root cause: `.report-cover-section { break-after: page }` and the whole
  pagination block lived ONLY in `pageStyle`, absent from `index.css`, so the cover never forced a
  break and the `<thead>` painted at the table's first in-flow position. (Ink/fill metric was BLIND
  to this — native thead/tfoot keep fill ~99%; added a text-position `layoutAudit`.)
- **Longevity:** headless page.pdf does NOT reproduce the founder's "page-2 85% blank" — 11 pages,
  0 void, page 2 fill 95.8%. The builder already uses the content-flow model (no forced breaks;
  `.page-break` is a 14px margin, not `page-break-before`). Void is real-mobile-print-dialog specific;
  the iframe is already full-A4 (prior fix). Documented, no speculative regression-risking change.

**1c — fixes (all in `src/index.css @media print`, so EVERY print path gets them):**
(i) Promoted the full pagination block from `pageStyle` into `index.css`: `@page{margin:0;size:A4}`,
`.report-cover-section{break-after:page;min-height:297mm;…}`, `.report-print-cell`/thead/tfoot insets,
`.report-running-header` + `.report-print-footer` styling, `.print-break-before`, `.zodiac-tab-panel`.
(ii) Orphaned-heading guard: `break-after:avoid` chained across the heading cluster
(`.bb-rule/.bb-eyebrow/.bb-h2` + `h2/h3`) so a heading never strands at a page foot.
(iii) Trailing near-empty page: closing block's `py-10` padding spilled its copyright line to a lone
footer page. Added `.report-closing` class + print rule (trim padding, `break-inside:avoid`).
(iv) Longevity: no change (harness-clean; see 1b).

**1d — re-validation (both paths, mobile 390px):**
- Birthday **react-to-print:** 21 pages, 0 void, layout audit ✅ (header top-band only, no orphans).
- Birthday **Cmd+P:** 21 pages, 0 void, layout audit ✅. Page-1 PNG AFTER = clean cover only.
- Trailing page removed: 22→21 pages, last page ink 2.2%→21%.
- Longevity: 11 pages, 0 void (unchanged, index.css doesn't reach its iframe).
- New harness assertions (`layoutAudit`): running header absent on cover, present only in top band on
  content pages; no section heading in the bottom-15% band. Both paths pass.

Status: DONE (Birthday: all 4 defects). Longevity void documented as non-reproducible in browser-print
equivalent — founder to re-test on-device post-deploy.

---

## Phase 2 — Celebrity-Birthday Page Layout

**Before:** `/celebrity-birthday` had a big hero + CTA "Find My Celebrity Match" scroll-button, then a
calendar card, then results/zodiac, and only THEN `<CelebritySearch />` buried at line 209 — below the
fold, invisible on mobile (the founder's complaint).

**After:** search joins the hero as one of two equal paths.
- New H1: "Find Your Celebrity Twin — by Birthday or by Name" + concise subhead.
- Two-path grid (`md:grid-cols-2`, stacks on mobile): **Path A "Search by name"** = `<CelebritySearch/>`
  (now first, right under the hero) · **Path B "Pick a birth date"** = the calendar card. Each labelled.
- Removed the buried duplicate search section + its separator, and the scroll-CTA button.
- `CelebritySearch` input upgraded (kept all functionality): search icon INSIDE a full-width bordered
  `h-12` input, responsive row (`flex-col sm:flex-row`) so on ~380px the input is full-width and the
  category+button drop below; no autofocus (mobile keyboard stays closed); aria-label added.

**Verified:** 390px screenshot (`scripts/shot.mjs`) — headline + EEAT + subhead + prominent search input
all within the first screenful; calendar path immediately below (2nd screenful). `npx vite build` exit 0,
tsc clean for both files.

Status: DONE. Commit: fix(celebrity-birthday): search into hero as equal path + prominent input.

---

## Phase 3 — Monetization Surfaces

Real facts used (grepped, not invented): report ₹199 / member ₹149 (api/create-order.ts
PRODUCT_AMOUNTS + MEMBER_AMOUNTS); credits **1/month, carry-forward, cap 3** (api/get-credits.ts lazy
accrual); premium/free feature lists mirror src/pages/Upgrade.tsx; report = 11 sections
(prerender-titles.mjs canonical copy), 21 printed pages (Phase-1 harness) → "20+ page".

⚠ **CREDITS COPY DISCREPANCY (founder decision needed):** the prompt says "3 birthday report credits
per month WITH carry-forward", but the CODE grants **1 credit/month, capped at 3 total via
carry-forward** (get-credits.ts). Per Global Rule "do not invent benefits", ALL surfaces state the
true mechanism ("1 per month, rolls over, up to 3"). To actually deliver 3/month, change get-credits.ts
accrual — payment-adjacent, left for founder.

**3a — homepage showcase (DONE):** new `BirthdayReportShowcase.tsx` — "A birthday gift that's actually
about them", 3 styled section mockups (Cover/Twins/Zodiac in the report's navy+gold; no fabricated
screenshots), ₹199 (member ₹149), CTAs to /birthday-report + /pricing, hello@bornclock.com trust line.
Mounted in Index.tsx between the calculator hero and `<BentoGrid/>`. Verified via 390px screenshot.

**3b — /pricing page (DONE):** new indexable `Pricing.tsx` (distinct from login-gated noindex /upgrade):
3-offer grid (Free / Premium / one-time Blueprint), full Free-vs-Premium comparison table (13 real
features), credits explainer, 7-day money-back + hello@bornclock.com. Registered: App.tsx route +
import, STATIC_ROUTES, prerender-titles.mjs, generate-sitemap.mjs (priority 0.9), Footer (Company col),
Navigation (navItems → desktop More + mobile). Verified via 1000px screenshot.

**3c — credits visibility (DONE):** Profile "Account Status" card now shows the live credit balance
(fetch /api/get-credits, lazy accrual) + roll-over explanation + "Use" CTA. Home FAQ gains a "How do
birthday report credits work?" Q&A and the "Is BornClock free?" answer corrected (Premium is a
subscription, not one-time; the one-time item is the ₹199 report). Upgrade hero credit line strengthened
to state roll-over/stack-to-3.

**3d — trust layer (DONE):** "Questions? hello@bornclock.com" adjacent to every buy point — homepage
showcase, /pricing (+ money-back), /upgrade (existing money-back), and the ReportView unlock CTA (added).

Typecheck: 0 NEW errors (47 total = pre-existing stale-Supabase baseline, identical on develop; no Phase-3
file appears in tsc output). `npx vite build` exit 0.

Status: DONE (credits copy = truthful; 3/month vs 1/month flagged for founder).

---

## Phase 4 — Navigation + Discovery

**4a — hub pages (DONE):**
- `/born-on/india` (`BornOnIndiaIndex.tsx`) — indexes `src/data/indiaBornOnDates.json` (350 dates,
  real per-date counts + top-3 tooltip), grouped by month, chips → `/born-on/{slug}/india`. Route added
  BEFORE `/born-on/:slug` (else 'india' would match the slug param). Registered: App.tsx route+import,
  STATIC_ROUTES, prerender-titles, sitemap 0.9.
- `/answers` (`AnswersIndex.tsx`) — indexes all 13 answer pages, grouped by theme (question labels
  mirror the ANSWERS map). Registered: App.tsx route+import (before the individual answer routes),
  STATIC_ROUTES, prerender-titles, sitemap 0.9.
- BreadcrumbList JSON-LD is auto-injected per-route by the prerender pipeline (prior batch), so both hubs
  get it automatically once prerendered; each page also renders a visible breadcrumb.

**4b — footer Explore block (DONE):** Explore column now leads with "Indian Celebrities by Date" and adds
Compatibility + Answers (Today's Birthdays, Zodiac, Numerology, Birthstone already present); Life
Expectancy/Planetary Age/Biological Age/Country Comparison live in the Tools column; Pricing in Company.

**4c — header Explore dropdown (DONE):** new `exploreItems` group + `Compass` "Explore" dropdown
(desktop) and a mobile "Explore" menu section: Indian Celebrities by Date, Today's Birthdays, Answers,
Compatibility, Planetary Age, Biological Age, Life Expectancy, Pricing. Grouped, not enumerated.

**4d — homepage discovery grid (DONE):** "Explore BornClock" section on Index — 6 hub cards (Born Today,
Indian Celebrities by Date, Planetary Age, Biological Age, Compatibility, Answers) + a 12-sign zodiac
chip row → `/zodiac/[sign]`.

Verified: `/born-on/india` and `/answers` screenshots render correctly (months+counts / themed answer
grid); Explore dropdown + updated footer visible. tsc 0 new errors; `npx vite build` exit 0.

Status: DONE.

---

## Phase 5 — /methodology → /how-it-works

- **Route rename:** `/how-it-works` → Methodology component (H1 already "How BornClock Works").
  SEO title + `canonicalUrl` updated to `/how-it-works`.
- **301 redirect (Worker):** `functions/_worker.ts` returns 301 `/methodology`(+trailing slash) →
  `/how-it-works` BEFORE the ASSETS/SPA fallback (no redirect file existed; this is the new pattern).
  Client `<Route path="/methodology" element={<Navigate to="/how-it-works" replace/>}>` added as a
  dev/SPA fallback so it never 404s.
- **Content refresh:** added a "What BornClock offers" overview box covering the Birthday Blueprint,
  life expectancy suite, celebrity matching + the Indian-celebrities-by-date facet, and the Answers
  library (all internally linked) — KEEPING every science-citation section intact.
- **Registration:** STATIC_ROUTES `/methodology`→`/how-it-works`; titles-map key swapped; sitemap
  regenerates from getAllRoutes (old path drops out; 301 preserves external equity).
- **Internal links (grep-verified 0 remaining):** Footer, AuthorBio, FAQ, About → `/how-it-works`.

Verified: `/how-it-works` screenshot renders overview + preserved citations. tsc 0 new errors;
`npx vite build` exit 0.

Status: DONE.

---

## Phase 6 — Email Capture Audit + Retention Foundation

**6a — AUDIT (evidence-based map):**
| Capture point | Where | Stored | Consent flag |
|---|---|---|---|
| Account signup | `useAuth.signUp` (Auth.tsx) → Supabase auth + `profiles` | `profiles.email`, `.blog_subscription`, `.email_notifications` | `blog_subscription` bool (signup checkbox, default true); `email_notifications` bool |
| Homepage "Save your results" banner | Index.tsx | — (links to `/auth?signup=true`) | funnels to signup |
| Blog "Never Miss an Article" box | Blog.tsx:322 | **NOT WIRED** — bare `<Input>`, no handler/insert (dead) | none |
| Contact form | Contact.tsx | email (support, not marketing) | n/a |
Storage = `profiles` ONLY. No anon/soft capture, no dedicated subscribers table, no
marketing/weekly-digest flag. Admin `BlogSubscribers` reads `profiles WHERE blog_subscription != false`.

**6b — soft capture (DONE, build-only):**
- `supabase/migrations/NOTES-email-subscribers.sql` (NOT applied): `email_subscribers` table
  (email unique, source, consent_marketing, weekly_digest, dob, country_code, unsubscribe_token,
  unsubscribed_at) + RLS locked (service-role only) + `profiles.weekly_digest` column (the audit's
  account-holder storage location).
- `api/subscribe.ts` — anon soft capture, explicit consent required, idempotent upsert-by-email,
  tolerates the table not existing yet (ok:false, never 500s). Routed in `_worker.ts`.
- `SaveResultsCapture.tsx` mounted on `/results` (BirthdayResults) — "Save my results + get my weekly
  reading", NOT a hard wall (free calc stays open → SEO funnel intact), unsubscribe promise.

**6c — weekly digest (DONE, build-not-cron):**
- `api/weekly-digest.ts` — composes a personalised email from REAL data: days-until-birthday,
  biorhythm (23/28/33-day sines), and celebrities born in the next 7 days (global + India) from
  `celebrity_sitelinks`. Reuses the Resend direct-fetch pattern (api/_email.ts). Tokened unsubscribe link.
- `api/unsubscribe.ts` — one-click tokened flag-flip (`weekly_digest=false` + `unsubscribed_at`), HTML page.
- Both routed in `_worker.ts`. NOT added to cron — activation documented in docs/OPS-ACTIVATION.md
  (table SQL, Mon 08:00 UTC cron line, scheduled() branch, batch-path note).
- **TEST SEND (single, to ADMIN fallback himanshu1305@gmail.com):** Resend HTTP 200,
  id `6ef488fc-2796-4cfd-98f0-dc40d31e25c2`, 3 global + 3 India celebrities pulled live from the DB.
  (ADMIN_EMAIL unset locally → fallback; run via scripts/test-digest.mjs mirroring the endpoint.)

tsc 0 new errors; `npx vite build` exit 0.

Status: DONE (capture inert until NOTES SQL applied; digest built, not scheduled).

---

## Phase 7 — Sharing + Funnel Events

**7a — sharing (DONE):**
- New `NativeShareButton.tsx` — `navigator.share` (OS sheet incl. WhatsApp on mobile) with a
  copy-link fallback (and WhatsApp deep-link last resort) on desktop/unsupported browsers.
- Mounted on **/results** (share `/?dob=YYYY-MM-DD`, WhatsApp-friendly text) and on the **report
  preview header** (replaced the raw 💬 WhatsApp link; fires `report_shared`).
- **OG verification (verify, not rebuild):** homepage/`/` (the results share target) has complete
  OG — og:title/description/image (og/default.png 1200×630) + twitter summary_large_image (verified
  in built dist/index.html). The **report page** had only title+description+noindex → added
  name-appropriate `og:title`/`og:description`/`og:type`/`og:url`. NOTE: og:image still falls back to
  the branded default card — there is no per-report dynamic OG image (larger build, out of scope);
  flagged for founder.

**7b — funnel events (DONE, reuses existing infra):**
No new table needed — the repo already has an `analytics_events` table + `useAnalytics` hook. Added
`trackFunnel(name, meta)` (event_type='funnel', consent-gated). CF Web Analytics is commented-out in
index.html and doesn't support custom events anyway, so first-party is correct.
| Event | Fires where |
|---|---|
| `report_preview_viewed` | ReportView effect, once, when a locked preview renders |
| `checkout_opened` | ReportView unlock button onClick; Upgrade `handleSubscribe` (product+plan) |
| `purchase_completed` | ReportView order `onSuccess` — CLIENT confirmation only (webhook/verify untouched) |
| `upgrade_modal_opened` | Upgrade page mount |
| `report_shared` (bonus) | NativeShareButton onShared (native/copy) |

tsc 0 new errors (only pre-existing LifeExpectancy:734 baseline); `npx vite build` exit 0.
No payment files modified.

Status: DONE.

---

## FINAL GATE

- Payment files touched: **EMPTY** ✓ (`git diff develop..product-polish` grep clean).
- tsc: 47 = develop baseline, **0 new** ✓.
- `npm run build`: **1313 ok, 0 failed** prerenders; sitemap 1313 URLs ✓.
- Gauntlet: **135 passed, 0 failed** ✓ (vite :3000 + wrangler dev :3001 via local .dev.vars, removed after).
- Merged product-polish → develop (dcf5715), pushed.
- Deploy: ONE `./node_modules/.bin/wrangler deploy` → worker + 1317 assets live at
  bornclock.usdvisionai.workers.dev + staging.bornclock.com. ⚠ cron-schedule registration hit a CF API
  error (code live; crons unregistered — founder re-run/dashboard).
- Smoke: create-order `{"error":"Report not found"}` ✓; `/methodology`→301→`/how-it-works` ✓;
  `/pricing/ /answers/ /born-on/india/ /how-it-works/` all 200 with correct titles ✓.

Full write-up: docs/PRODUCT-POLISH-REPORT.md.
