# Overnight Batch 2 — Report

Execution of `docs/OVERNIGHT-2-PROMPT.md`. Local commits only, not pushed. One deploy at the end.
Frozen files (`api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts`) untouched.

## FINDINGS FIRST — product bugs the new tests / build caught

- **Tailwind dynamic-class bug (caught during build of Phase B).** The reusable
  `RhythmWidget` initially built class names dynamically (`bg-${accent}-50`). Tailwind's
  JIT can't see constructed class names, so those styles would have been purged and the
  widget would render unstyled in production. Fixed to a static palette before shipping.
- **DOB validation was inline + untestable.** Extracted `validateDob` into
  `src/data/rhythmFraming.ts` (exported) so the widget and the test suite share one
  implementation; the negative/edge cases (Feb 30, future, non-leap Feb 29, pre-1900,
  DOB=today, >100y) are now unit-tested.
- **Prerender bug (caught by the build): month hubs blocked `networkidle0`.** MonthHub
  fired a Supabase query on mount, so under the prerenderer each of the 12 hubs waited on
  the network; a burst of these `.like` month-queries stalled `networkidle0`, ballooned the
  build past its 25-minute budget, and the (appended-at-the-end) growth routes were skipped.
  Two fixes: (1) the 18 growth routes moved to the **front** of `prerender-routes.mjs` so
  they're always in-budget; (2) MonthHub **skips the celeb fetch during prerender**
  (`navigator.webdriver`) — its SEO content is fully static, so `networkidle0` settles
  instantly and real users still get the list. Result: full build went from ~1500s /
  hundreds-skipped to **623s, 1330 ok, 1 failed, 0 skipped**, all 18 growth pages
  prerendered. (Also bounded the month query with `AbortSignal.timeout(8000)`.)
- No product bugs surfaced in the existing suite from these changes (see GATE).

---

## Phase A — 12 "Born in {Month}" hub pages ✅

- **URLs (12):** `/born-in-january` … `/born-in-december`.
- **Component:** `src/pages/MonthHub.tsx` (routes generated in `src/App.tsx` from
  `MONTH_HUB_DATA`). Per month: AEO answer paragraph ("What does being born in {month}
  mean?"), top celebrities of the month (new `getRankedMonthCelebrities` in
  `BirthdaySearchService`, `birth_month_day LIKE 'MM-%'`), the two zodiac signs (linked to
  `/zodiac/{slug}`), birthstone (from `birthstoneData`), birth flowers + lore, a linked
  grid of every date page in the month (`/born-on/{month}-{d}`, incl. Feb 29), season note,
  visible FAQ, and a **currency-aware** Birthday Report CTA (`useReportPrice`).
- **Data:** new `src/data/monthHubData.ts` (birth flowers, zodiac spans, answer paragraph,
  4 FAQs, seasonal note per month).
- **SEO/AEO:** unique title/description, canonical, auto **BreadcrumbList** (SEO component)
  matching the date pages, **FAQPage JSON-LD** (`FAQSchema`), ItemList JSON-LD for celebs.
- **Prerender/sitemap:** `scripts/prerender-routes.mjs` (+12) and title branch in
  `scripts/prerender-titles.mjs`.
- **Nav:** Explore dropdown entry "Born in Each Month" + Footer Explore link.

## Phase B — 6 fitness & rhythm SEO pages ✅

- **URLs (6):** `/biorhythm-workout-calculator` (anchor), `/best-day-to-start-a-habit`,
  `/cycle-syncing-for-men`, `/why-am-i-tired-some-days`, `/best-time-to-work-out`,
  `/energy-forecast`.
- **Reuse, not reimplement:** all pages reuse the existing biorhythm engine
  (`calculateBiorhythm` etc. from `src/data/biorhythmData.ts`) via a new shared
  `src/components/RhythmWidget.tsx` (DOB → today's 3 cycles + 7-day outline + habit
  "next upswing"). Config-driven: `src/data/fitnessPages.ts` + renderer
  `src/pages/FitnessRhythmPage.tsx`.
- **MANDATORY HONESTY FRAMING (centralised in `src/data/rhythmFraming.ts`):** every page
  renders the same science note ("the three-cycle model dates from the early 20th century,
  and controlled research has not found it predictive…") near the top, uses the check-in
  register ("may", "many people find", "a prompt to check in") throughout, and ends with
  the standard disclaimer. **Zero claims** of performance, injury prevention,
  medical/hormonal effects, or weight loss. Where real science exists (consistency beats
  timing, chronotype, sleep) it is stated plainly and kept separate from the rhythm layer.
- **SEO/AEO/GEO:** direct answer under each H1, question-form H2s, FAQPage JSON-LD (4 Qs),
  WebApplication schema on the two genuine "app" pages (anchor + energy-forecast), canonical,
  unique meta, internal links to `/birthday-report`, `/biorhythm`, the born-on page for the
  entered DOB, and each other.
- **Nav:** Explore entries "Biorhythm Workout" + "Energy Forecast" + Footer links.

## Phase C — Independence / national days on the 366 date pages ✅

- **Data:** new `src/data/nationalDays.ts` — **124 date keys, 165 country entries**, curated
  for accuracy (movable/lunar observances like Israel, Nepal, Thailand, Netherlands
  King's Day, and the UK deliberately omitted rather than guessed). Spot-checked: Aug 15
  India Independence Day, Jan 26 India Republic Day + Australia Day, Jul 4 USA, Jul 14
  France Bastille Day, Oct 1 China/Nigeria/Cyprus, Jun 2 Italy Republic Day — all correct.
- **Date pages (`BornOnDay.tsx`):** a compact "National days on {date}" block (flag +
  country + official day name + one-line note) rendered **only when the date has entries**
  (no empty shell otherwise); a national-day line appended to the answer paragraph and meta
  where a major day exists.
- **Prerender count unchanged** (enrichment, not new pages) — verified 366 born-on routes
  still build.

## Phase D — Email polish batch ✅ (D2 skipped, D4 already done)

- **D1 — logo + tagline header.** The logo URL `https://bornclock.com/bornclock-logo.png`
  **resolves (HTTP 200)**. `api/_email.ts` already wraps every customer-facing template in
  `baseTemplate()` (logo + "Know your time. Live it well."): welcome, trial_expiry,
  payment_confirmation, cancellation, nudge_free/premium, premium_activated, payment_receipt,
  report_locked, report_created, account_deleted. **Added** the same logo + tagline to the
  two templates that lacked it — the **invoice email** (`api/_invoice-email.ts`) and the
  **delete-account** confirmation email (edge function). (The internal `data_deletion_request`
  ops notification is left plain — internal-only.)
- **D2 — merge payment-confirmed + invoice → SKIPPED,** same reason as PDF-INVOICE Phase 3:
  both sends originate in `api/verify-payment.ts`, a frozen file for this batch. Documented.
- **D3 — Admin System tab:** replaced "Vercel — Live ✅" and the Vercel quick-link with
  "Cloudflare Workers — Live ✅", the Cloudflare dashboard link, and the workers.dev link.
- **D4 — /pricing + /upgrade free tier:** already currency-aware (`currency === 'INR' ? '₹0'
  : '$0'`) in both pages — no change needed.

## Phase E — Weekly digest: template only, NO live send ✅

- **Content ("Your Week Ahead")** built in `api/weekly-digest.ts`: greeting, a **7-day rhythm
  outline** (same biorhythm engine), **one gentle fitness/habit prompt in the honesty
  register**, one discovery link (this week's notable birthdays → `/born-on`), plus the
  logo + tagline header.
- **Gated:** real (non-test) sends now **no-op behind `DIGEST_LIVE`** (default off) — the
  handler returns `{skipped:true}` with a log line unless `DIGEST_LIVE=true`. The Sunday
  cron (`0 9 * * 0` in `functions/_worker.ts scheduled()`) logs a no-op line until the flag
  is flipped. `DIGEST_LIVE` added to the Worker bridge keys.
- **Test render:** one sample sent to `ADMIN_EMAIL` via `POST /api/weekly-digest {test:true}`
  after deploy — see GATE. Test sends are NOT gated, so the founder can review a real sample.
- **To go live:** `printf 'true' | ./node_modules/.bin/wrangler secret put DIGEST_LIVE`
  (and wire the subscriber broadcast — intentionally a follow-up, not sent by the cron yet).

## Phase F — Admin revenue split by currency ✅

- New **"GST Invoices — Revenue by Currency"** card in Admin → System, from the
  **invoices** table (authoritative): INR revenue + count, USD revenue + count, **Export
  invoice count (GSTR-1 Table 6A)**, and **this month vs last month (INR)**. Existing card
  style, no charts.
- **RLS:** invoices default to owner-read, so the session-based admin client can't read all
  invoices. Added `supabase/migrations/NOTES-admin-invoice-read.sql` (admin `has_role`
  SELECT policy). Until applied, the card **degrades gracefully** with an amber note.
- **Live numbers it renders:** _to confirm at runtime_ — with the owner-read policy the card
  shows the amber "apply NOTES" note (or, if the admin owns BC/26-27/1001, INR ₹199.00 · 1
  invoice · 0 export). After the NOTES policy is applied it shows the true all-account split
  (currently INR ₹199.00 / 1 invoice / 0 export).

## Phase G — Tests ✅

- New suite `e2e/prelaunch/growth-pages.spec.ts`: all 18 pages 200 + unique title +
  canonical≠home + FAQPage JSON-LD; month hubs single-currency + Feb-29 link; widget renders
  for a valid DOB; every fitness page carries the science note + disclaimer; Aug 15 national
  block present, a dateless day shows none; new Explore entries visible; `validateDob` and
  `getNationalDays` unit cases (future/Feb 30/non-leap/pre-1900/today/>100y/leap); future-DOB
  widget shows a clean error with no crash; Feb 29 date page loads.
- Fix policy honoured (classify → fix product bug → re-run, never weaken). _Results in GATE._

---

## GATE

1. **tsc** — 0 errors (0 new). ✓
2. **build** — `npm run build` exit 0, **sitemap 1331 URLs**, prerender **1330 ok / 1
   failed / 0 skipped** (623s) — all 18 growth pages prerendered. ✓
3. **test:prelaunch + growth-pages** — gauntlet **135 passed**; prelaunch **63 passed**
   (all 10 new growth-pages tests green). One failure during the run —
   `navigation.spec.ts` "Explore ∩ (main ∪ More) = ∅" — was the **anticipated** nav-set
   assertion; updated to the new Explore set (still exact-membership + disjoint, not
   weakened) and re-ran `navigation.spec.ts` → **5/5 passed**. ✓
4. **Frozen files untouched** — `api/_crypto.ts`, `api/razorpay-webhook.ts`,
   `api/verify-payment.ts`: empty diff. ✓
5. **invoice_counters untouched** — queried before/after the suite, identical:
   `BC/26-27=1002, BN/26-27=1001, BX/26-27=1001` (BC/26-27/1001 already issued; no test
   created invoices). ✓
6. **Live smoke sentinel** — `{"error":"Report not found"}` post-deploy. ✓ New pages served
   with prerendered HTML (e.g. `/born-in-august`, `/biorhythm-workout-calculator`).
7. **One deploy** — `wrangler deploy` succeeded (Worker + full prerendered dist live).
   Same known cron-schedule token-scope warning (triggers unchanged, schedules persist). ✓
8. **Digest test render** — `POST /api/weekly-digest {test:true}` → sent to `ADMIN_EMAIL`
   (subject "Your week ahead — … days to your birthday"). The `DIGEST_LIVE` gate is live: a
   non-test send returns `{skipped:true, reason:"DIGEST_LIVE not enabled"}`. ✓

**Prerender-infra note:** the prerender has a 25-min budget and, on a loaded machine,
network-heavy routes (born-on/india) can time out and fall back to SPA. The clean run above
finished in ~10 min with 1330/1331 ok. If a future build times out, it's environmental
(machine load / Supabase burst), not a code defect — the growth pages are pinned to the
front of the route list so they always prerender.

## Founder morning checklist

1. **Review the digest sample** in `ADMIN_EMAIL`; when happy, go live:
   `printf 'true' | ./node_modules/.bin/wrangler secret put DIGEST_LIVE` (then wire the
   subscriber broadcast — a deliberate follow-up).
2. **Apply NOTES SQL in Studio:** `supabase/migrations/NOTES-admin-invoice-read.sql`
   (admin invoice-read policy for the revenue card). No other NOTES SQL this batch.
3. **Redeploy the delete-account edge function** to pick up the logo/tagline + copy:
   `npx supabase functions deploy delete-account --project-ref jwrpqiypvystivtqyhro`.
4. **Spot-check:** 2 month pages (e.g. `/born-in-january`, `/born-in-august`), 2 fitness
   pages (`/biorhythm-workout-calculator`, `/best-time-to-work-out`), and `/born-on/august-15`
   (national-days block shows India's Independence Day).
