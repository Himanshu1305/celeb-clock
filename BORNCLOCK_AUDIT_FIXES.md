# BornClock — Payments / Invoicing / Email Audit Fixes

**Date:** 2026-08-28 · **Branch:** `develop` · **Project:** Supabase `jwrpqiypvystivtqyhro` ("Lifespan")
**Method:** Live-DB + live-Razorpay verification (read-only) **before** any code change, then fixes.
All verification scripts are read-only and committed under `scripts/audit-*.mjs`.

---

## PART 1 — What was verified against the LIVE database

### 1.1 Does the invoicing DDL exist? — **YES. Hypothesis NOT confirmed.**
The audit hypothesised the invoicing DDL (only present in `supabase/migrations/NOTES-invoicing.sql`)
had never been applied. **It had been applied.** Live query results:

| Object | Result |
|---|---|
| `invoices` table | exists, **1 row** |
| `invoice_counters` table | exists, rows: `BC/26-27 → 1002`, `BX/26-27 → 1001`, `BN/26-27 → 1001` |
| `credit_notes` table | exists, 0 rows |
| `issue_invoice()` function | exists (probed safely with `p:null` → rolled back on NOT-NULL, no number burned) |

So invoicing works. The single issued invoice `BC/26-27/1001` foots exactly (168.64 + 15.18 + 15.18 = 199.00).

### 1.2 Is `profiles.id == user_id`? — **NO. CONFIRMED BROKEN (worse than feared).**
**All 8 of 8** profile rows have `id != user_id`. `profiles.id` is a random synthetic PK
(`handle_new_user` inserts `(user_id,…) VALUES (NEW.id,…)` and lets `id` default `gen_random_uuid()`).
The premium grant keyed on `.eq('id', user_id)` (`verify-payment.ts`) and `.eq('id', userId)`
(`razorpay-webhook.ts`) therefore matched **zero rows** — a paying subscriber would never be flipped
to premium. The read side (`useAuth.ts`) and the invoice block already key on `user_id`.

### 1.3 Payments vs invoices — **10 of 11 captured payments have no invoice, but this is TEST data.**
The DB holds 11 captured payments (8 `birthday_report`, 3 `subscription`); only 1 has an invoice.
The gap looked alarming, but the live Razorpay account (`rzp_live`) contains **exactly one payment** —
`pay_TJo5iW…` (₹199 report, 2026-07-30) — and **it is already invoiced** (`BC/26-27/1001`).
Every other DB payment returns *"the id does not exist"* under the live keys: they are **test-mode
transactions** written to the shared Supabase project by staging/preview (which uses `rzp_test_`
keys — see PROJECT_CONTEXT §3, single project for dev+prod).

**Conclusion: there is ZERO real revenue without a GST invoice.** No compliance gap on real money.

---

## PART 2 — Fixes

| # | Issue | Confirmed? | Action |
|---|---|---|---|
| 2.1 | Invoicing DDL only in NOTES | **Not** the feared "missing" — but DDL was unversioned | Captured as a proper idempotent timestamped migration; built a safe backfill tool |
| 2.2 | Premium grant on wrong key column | **YES** (id != user_id for all rows) | Grant now keys on `user_id`; invariant test added |
| 2.3 | Webhook double-process window | **YES** (code path real) | Non-`23505` record failure now returns 5xx so Razorpay retries |
| 2.4 | Dead / mislabelled email code | **YES** | Removed dead templates + router cases; Admin label corrected |
| 2.5 | PDF fallback is silent | **YES** | Ops alert on genuine render outages (throttled) |
| 2.6 | Hardcoded FX rate presented as current | **YES** (theoretical — 0 export invoices exist) | Record FX rate + source date + provenance on the invoice |
| 2.7 | Renewal invoices skipped for regionless subscribers | Mechanism real; **0 real subscribers affected** | Reported; verify-payment already persists region for future real subs |

### 2.1 Invoicing DDL + backfill
- **`supabase/migrations/20260828120000_invoicing_schema_and_fx_provenance.sql`** — captures the
  applied invoicing schema (`invoice_counters`, `invoices`, `issue_invoice()`, RLS + owner-read
  policy) as version-controlled, fully **idempotent** DDL (`create … if not exists`,
  `insert … on conflict do nothing`, `create or replace`, `drop policy if exists`). Safe to re-run
  against the live DB — it is a no-op there except adding the two FX-provenance columns (2.6). Because
  PostgREST cannot run DDL, this was **not** re-applied programmatically; the live DB already has the
  schema (verified in 1.1). The value is that a rebuild-from-migrations can never silently omit it.
- **`scripts/backfill-invoices.mjs`** — issues invoices for past real payments that have none.
  Defaults to **`--dry-run`**, requires **`--apply`**, is **idempotent** (skips already-invoiced ids;
  `issue_invoice()` dedupes on `payment_id`), and uses the **atomic counter RPC** rather than
  reimplementing numbering. It **verifies each payment exists in the live Razorpay account before
  issuing**, so a test-mode row can never receive a real GST invoice. It reconstructs place-of-supply
  from authoritative Razorpay notes and **skips (logs) rather than guessing** a tax split when region
  is unknown.

**Backfill results**
```
DRY-RUN : candidates=10, would-issue=0, skipped=10
          (all 10 skipped: "not found in live Razorpay account — TEST/foreign, not invoiced")
APPLY   : before → invoices=1, BC/26-27 next=1002
          issued=0 (all 10 skipped, same reason)
          after  → invoices=1, BC/26-27 next=1002   (unchanged — nothing fabricated)
```
**Idempotency proof** (re-calling `issue_invoice` for the already-invoiced real payment):
returned the **same** `BC/26-27/1001`, counter stayed at **1002**, invoice rows stayed at **1**,
and the row foots exactly (199 == 199). No second row, no burned number.

### 2.2 Premium grant keyed on `user_id`
- `api/verify-payment.ts` — subscription grant `.eq('id', user_id)` → **`.eq('user_id', user_id)`** with an invariant comment.
- `api/razorpay-webhook.ts` — activated/charged grant `.eq('id', userId)` → **`.eq('user_id', userId)`** with a comment.
  The cancelled/expired/halted handlers were **left unchanged**: they select by `subscription_id`
  first and correctly update by that row's real `id` PK.
- Test: `api/__tests__/audit-fixes-invariants.test.ts` asserts the grant and the read use the **same
  column** (positive, negative, and the edge case that the by-PK handlers stay by-PK).
- **Affected customers:** none. The only real premium user is the founder (premium via the
  `20250922062441` seed migration, not via a payment grant). No real subscriber has ever paid (the one
  real payment is a one-time report). Nothing to correct; the fix prevents the **next** real
  subscriber from silently failing to receive premium.

### 2.3 Webhook records-or-retries
- `api/razorpay-webhook.ts` — a non-`23505` `webhook_events` insert failure now returns **500** so
  Razorpay retries, instead of the old "Proceed anyway" fall-through that could double-apply the
  (non-idempotent) `profiles` premium/`premium_until` update on a later re-delivery. The `23505`
  duplicate path still returns 200 unchanged.

### 2.4 Dead email code removed, Admin label fixed
- Removed unused `paymentConfirmationEmail` and `paymentReceiptEmail` templates + their router cases
  (`api/_email.ts`), their `VALID_TYPES` entries (`api/send-email.ts`), `EmailService.sendPaymentConfirmation`
  (`src/services/EmailService.ts`), and the now-unused destructured payload fields.
- `src/pages/Admin.tsx` — the misleading "Payment Confirmation — After Razorpay success" row now reads
  **"Premium Activated — Subscription activated (webhook)"** (`premium_activated`), which is an email
  that actually sends. (The one-time purchase confirmation + invoice is sent directly by
  `sendPurchaseEmail` and is not a `send-email` type.)

### 2.5 Ops alert on PDF render fallback
- `api/_pdf.ts` — `renderPdfFromHtml` now fires `sendOpsAlert({severity:'warning', …})` the first
  time Browser Rendering fails **at runtime** (HTTP error, non-PDF body, timeout/exception),
  throttled to once per isolate so a 200-invoice sweep can't storm the inbox. It does **not** alert on
  the expected missing-credentials path (preview/local have no `BROWSER_RENDERING_TOKEN`); a prod
  misconfig is caught by the post-deploy smoke test. Invoice delivery still falls back to HTML and is
  never blocked.

### 2.6 FX rate provenance on invoices
- New columns `fx_rate_date`, `fx_rate_source` on `invoices` (in the 2.1 migration) + `issue_invoice()`
  updated to store them.
- `api/verify-payment.ts` and `api/invoice-sweep.ts` now pass the rate's capture date and a source
  label (`"Fixed fallback rate (₹87.20; no live FX feed yet)"`).
- `src/lib/invoice-generator.ts` renders the provenance under the FX rate ("1 USD = ₹87.20 · as of
  28 Aug 2026 · Fixed fallback rate …"), and is fully back-compatible with rows that lack the columns.
- **Current impact: zero** — no export/USD invoice has ever been issued (`BX/26-27` still at 1001).
- See **Open items** for the live-FX integration.

### 2.7 Regionless subscribers
- `api/invoice-sweep.ts:100-104` skips renewals whose payer has no persisted place-of-supply. Counted
  against the live DB: **0 real subscribers affected** (the only real transaction is a one-time
  report). `verify-payment.ts` already persists place-of-supply on the first subscription payment
  (keyed `user_id`), so future real subscribers are covered. If real regionless legacy subscribers
  ever appear, the recommended capture is a one-time place-of-supply prompt at next login before the
  next renewal; not built now because the count is zero.

---

## PART 3 — Verification
- `npx tsc --noEmit` — **0 errors**.
- `npx vite build` — **clean** (code-compile phase of `npm run build`; the OG/prerender/sitemap steps
  are content generation untouched by these changes — no routes or prerender scripts were modified).
- `npx vitest run` — **221 passing** across 11 files (incl. the two new test files). `vitest.config.ts`
  was scoped to exclude the Playwright `e2e/**` suites and `.claude/**` worktree copies, so a bare
  `vitest run` no longer mis-collects them (this is why the count reads 221 unique vs. the previously
  double-counted 398).
- New tests:
  - `api/__tests__/audit-fixes-invariants.test.ts` — source invariants for 2.2 (grant column, incl.
    edge case), 2.3 (5xx guard), 2.4 (dead code gone, live type kept), 2.5 (alert on outages only).
  - `src/lib/__tests__/invoice-generator.test.ts` — 2.6 FX provenance (with/without columns), domestic
    has no FX row, and CGST_SGST/EXPORT footing.

---

## Open items (logged, not built this session)
1. **Live FX integration.** Replace the fixed ₹87.20 fallback with a live/reference rate (e.g. RBI
   reference rate) and set `fx_rate` + `fx_rate_source` from it. The provenance columns are now in
   place to record it honestly. Zero current impact (no export invoice exists yet).
2. **Test-mode rows in the production DB.** 10 test payments live in the prod `payments` table because
   staging/preview shares the Supabase project. Consider tagging or segregating test transactions so
   audits aren't misled (the backfill guards against invoicing them, but the rows remain).
3. **Regionless-subscriber capture flow** — build only if/when a real regionless subscriber appears.
