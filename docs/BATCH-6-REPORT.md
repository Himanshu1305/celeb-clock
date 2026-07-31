# BATCH-6 — Execution Report

Delivered Phases **1 (month-hub Indians), 2 (purchase-email merge), 5 (compatibility
nav + Western label)**. Deferred Phases **3 (renewal reminders) and 4 (feedback)** per
the triage rule — implementation plans below. Local commits only, one deploy.

## 1. FINDINGS (bugs caught + fixed)
- **Phase 1 (founder-verified):** month hubs showed almost no Indians (only Nehru) —
  `getRankedMonthCelebrities` pulls the GLOBAL top-N, where Indians lose to global
  historical figures. Fixed by adding a nationality-filtered section (same fix class as
  the Jan-1 date page). Evidence in §2.
- **Phase 5 (not a bug):** the prompt expected Compatibility to be missing from the
  Explore dropdown AND the footer. It is already present in **both** (`Navigation.tsx`
  `exploreItems` + `astrologyItems`, and `Footer.tsx` Explore column) — verified, no nav
  change needed. The remaining Phase-5 work (Western labelling) was done.

## 2. PHASE 1 — Month-hub Indian celebrities
Added `getRankedMonthCelebritiesByCountry(month, 'IN', 12)` (query-FILTER by
`nationality_code`, rank among nationals by sitelinks) and an "🇮🇳 Indian celebrities born
in {month}" section on `MonthHub`, rendered only when ≥3 exist, reusing `CelebrityCard`
with each card linking to its `/born-on` date page (new optional `dateHref` prop — additive,
no change to existing usage). The global section is byte-identical (standing policy).

**/born-in-May top-12 (live query):**
```
1. Rabindranath Tagore    5. Madhuri Dixit        9. Zail Singh
2. Satyajit Ray           6. Gukesh D            10. Fakhruddin Ali Ahmed
3. Jiddu Krishnamurti     7. Ram Mohan Roy       11. Kazi Nazrul Islam
4. Tenzing Norgay         8. Anushka Sharma      12. Neelam Sanjiva Reddy
```
Recognisable Indians well beyond Nehru. **Spot-checks:** October → **Mahatma Gandhi** (#1),
**Amitabh Bachchan** (#3), APJ Abdul Kalam, Sardar Patel. November → **Shah Rukh Khan** (#3),
Indira Gandhi, Aishwarya Rai Bachchan, CV Raman.

**Per-month Indian counts (all ≥3, every month renders the section):**
```
Jan 200  Feb 174  Mar 176  Apr 179  May 186  Jun 198
Jul 200  Aug 198  Sep 199  Oct 200  Nov 200  Dec 200
```
Note: the section is client-fetched (matching the existing month-hub global-list pattern,
which is also client-fetched to keep prerender fast); the 12 hubs were re-prerendered.

## 3. PHASE 2 — One merged purchase email
Both purchase types (one-time report AND first subscription payment) now send **one** email
= confirmation/receipt + the GST invoice attached. The two prior sends (`payment_receipt`
via `_email.ts`, and `sendInvoiceEmail`) were replaced by a single `sendPurchaseEmail` call
dispatched AFTER the invoice block so it can include the PDF.

- **Subjects:** report → `Payment confirmed — your BornClock invoice {no}`; subscription →
  `Welcome to Premium — your BornClock invoice {no}`.
- **Attachment reuse:** `sendPurchaseEmail` and the untouched sweep `sendInvoiceEmail` now
  share one `buildInvoiceAttachment()` helper (renderPdfFromHtml → PDF, HTML fallback) — the
  logic is defined once, not duplicated.
- **FAILURE ISOLATION:** the merged send sits AFTER the invoice `try/catch`. If invoicing
  fails, `invoiceForEmail` stays `null`, and `sendPurchaseEmail` is still called with
  `invoiceNo`/`invoiceHtml` undefined → it sends a confirmation with **no attachment** and a
  "your invoice will follow shortly" line. Invoice failure never suppresses confirmation.
- **Sweep untouched:** `api/invoice-sweep.ts` still uses `sendInvoiceEmail` for renewals.

**Exception boundary — diff confined to email-call sites** (`git diff api/verify-payment.ts`):
the HMAC check, unlock, premium grant, and the `issue_invoice` RPC do **not** appear in the
diff (byte-identical). Hunks:
```
- import { sendEmailDirect } from './_email.js';           - import { sendInvoiceEmail } ...
+ import { sendPurchaseEmail } from './_invoice-email.js';
  (receipt block) await sendEmailDirect({type:'payment_receipt',...})  →  receipt = {...}   // capture only
  (invoice block) await sendInvoiceEmail(row.buyer_email, row.invoice_no, invoiceHTML)  →  invoiceForEmail = {...}  // capture only
+ (after invoice) try { if (receipt) await sendPurchaseEmail({...receipt, invoiceNo, invoiceHtml}); } catch {...}
```
`api/_crypto.ts` and `api/razorpay-webhook.ts`: **empty diff**.

**Email safety:** the Phase-2 tests exercise only the PURE exported helpers
(`purchaseEmailSubject`, `purchaseEmailHasAttachment`) — no Resend call is made, so no test
can email anyone. (No merged email was sent to a real address during development either.)

## 4. PHASE 3 — Renewal reminders — DEFERRED
Not implemented. Plan for the founder / a follow-up batch:
- New daily job in the existing cron (`api/daily-email-cron.ts`, invoked by
  `functions/_cron/daily-email.ts`). Pre-filter `profiles` where `subscription_status='active'`
  and `premium_until` within ~9 days.
- Per candidate: `GET https://api.razorpay.com/v1/subscriptions/{subscription_id}` (Basic auth
  `base64(RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET)`) → `current_end` as the source of truth;
  fall back to `premium_until` only if the API fails (mark fallback in the log line).
- Timing: annual → 7 days before `current_end`, monthly → 2 days, computed IST date-only.
- Send-once via a `reminder_sends(user_id, current_end, window)` unique key →
  `NOTES-renewal-reminders.sql` (tolerate-absent: cron no-ops + logs until applied).
- Email: plan name, currency-aware amount (`src/lib/pricing.ts` SUBSCRIPTION, currency from
  `profiles.buyer_country`), renewal date, and a one-click manage/cancel link.
- Tests: window math (7d/2d, IST rollover), send-once idempotency, cancelled excluded,
  fallback marked — Razorpay mocked.

## 5. PHASE 4 — Feedback & rating — DEFERRED
Not implemented. Plan: extend the existing `user_reviews` table (columns:
`report_slug`, `consent_public boolean default false`, `comment text`, `dismissed boolean`)
via `NOTES-feedback.sql` (tolerate-absent). Engagement-gated prompt in `ReportView` (shown
once `!isLocked` AND scrolled ≥50% OR ≥45s dwell), 5 stars + optional one-line comment +
default-unchecked "feature my comment publicly", server-persisted idempotent upsert keyed on
(user, report_slug), never localStorage. A read-only Feedback section in `Admin.tsx`
(filterable to consented-only). Nothing public this batch.

## 6. PHASE 5 — Compatibility Western labelling
- **Nav:** already present in the Explore dropdown, the Astrology dropdown, and the footer
  Explore column (desktop + mobile, via the shared `exploreItems`/`astrologyItems` + Footer) —
  verified, no change needed.
- **Labelling rule (one consistent rule):** the **hub** `<title>` gains "Western"
  (`Western Zodiac Compatibility Calculator …`); **pair** `<title>`s keep their existing form
  (adding "Western" would exceed a sensible length), and instead carry the Western clarifier
  in-body. Both the calculator and every pair page render: the "(Western Zodiac)" H1 tag, a
  one-line clarifier ("this uses the Western sun-sign tradition; Vedic Ashta Koota / Guna
  Milan is a different system based on Moon nakshatras"), and a new FAQPage entry "Is this
  Western or Vedic compatibility?". No Vedic system built; no placeholder links.

## 7. NOTES-*.sql for the Studio session
**None this batch.** Phases 1, 2, 5 need no DDL. The DDL-bearing phases (3 renewal-reminders,
4 feedback) were deferred, so their NOTES files were not created.

## GATE
- **tsc:** app 0 errors (baseline 45 / 0 new). Worker bundles clean.
- **build:** **1339 ok / 0 failed / 0 skipped** (no new routes this batch).
- **test:prelaunch:** launch-gauntlet **135** · prelaunch **127** passed, 0 failed (batch-6: 7/7).
  - **Fix-loop note (test bug):** the first Phase-1 browser test failed because MonthHub
    deliberately skips its client-side celebrity fetch when `navigator.webdriver` is true
    (a prerender optimisation) and Playwright reasserts `webdriver` beyond an init-script
    override — so the client-rendered Indian section can't be observed in automation. Classified
    a TEST BUG and replaced the browser render assertion with a DATA-LAYER assertion (the exact
    nationality-filtered query returns ≥3 Indians incl. Tagore for May). Not weakened — it still
    asserts the named Indians. The live UI render was verified separately (puppeteer + production:
    the section shows Tagore, Madhuri Dixit, Anushka Sharma).
- **frozen:** `api/_crypto.ts`, `api/razorpay-webhook.ts` — empty diff. `verify-payment.ts` —
  email-call sites only (hunks above); HMAC/unlock/grant/issue_invoice byte-identical.
- **invoice_counters unchanged:** BC/26-27=1002, BN/26-27=1001, BX/26-27=1001.
- **email safety:** enforced by construction — Phase-2 tests call pure helpers only, never Resend.
- **deploy:** one `wrangler deploy` (trailing `schedules` error is the known non-fatal cron
  issue). Live: `/born-in-may` Indian section renders (Tagore, Madhuri Dixit, Anushka Sharma);
  compat pages carry the Western label; sentinel `{"error":"Report not found"}`.

## 8. Founder task list
1. No DDL to apply this batch.
2. On the next real sale (report AND a first subscription), confirm exactly ONE email arrives
   with the invoice attached (and the right subject).
3. Review the merged email copy (subject + body) in `api/_invoice-email.ts`.
4. Spot-check `/born-in-may` live — the Indian section should list Tagore, Satyajit Ray,
   Madhuri Dixit, Anushka Sharma, etc.
5. Prioritise the deferred Phases 3 (renewal reminders — chargeback reduction) and 4 (feedback
   → testimonials) for a follow-up batch.
