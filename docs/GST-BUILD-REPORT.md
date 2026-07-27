# GST Invoicing Build — Report

**Commit:** `1580938` — "feat: GST invoicing — state capture, issue_invoice hook, PDF, email, profile download"
**Branch:** develop (local commit only — NOT pushed, per instructions).
**Deploy:** one `./node_modules/.bin/wrangler deploy` → worker live at `bornclock.usdvisionai.workers.dev`.
**Date:** 2026-07-27.
**Payment integrity:** `api/_crypto.ts` and `api/razorpay-webhook.ts` NEVER touched. `api/verify-payment.ts`
changed ONLY by the appended non-fatal invoice block + its imports + one hoisted variable.

---

## Files created / modified

**Created**
- `src/lib/invoice-logo.ts` — BornClock logo inlined as base64 (see Logo below).
- `src/lib/invoice-generator.ts` — `generateInvoiceHTML(inv: InvoiceRecord): string`. Web-APIs-only,
  runs in browser AND Workers. Renders the STORED invoice values (never recomputes tax). Supplier
  constants, 3-column parties, mode-dependent tax columns (CGST/SGST | IGST | export=0), totals,
  amount-in-words (Indian numbering), domestic/export declarations, LUT block, signature, footer.
- `src/data/indiaStates.ts` — 36 states/UTs with **official GST codes** + `taxModeFor()`.
- `src/components/CheckoutRegionModal.tsx` — pre-checkout region/state capture (Phase 3).
- `src/components/InvoicesCard.tsx` — /profile invoice list + download (Phase 5).
- `api/_invoice-email.ts` — `sendInvoiceEmail(to, invoiceNo, html)` via Resend, .html attachment,
  UTF-8-safe base64.

**Modified**
- `api/verify-payment.ts` — imports (`generateInvoiceHTML`, `sendInvoiceEmail`), hoisted `orderNotes`,
  captured notes in both product branches, and the non-fatal GST-invoice block before the success return.
- `api/create-order.ts` — reads `buyer_country/buyer_state/buyer_state_code/tax_mode` from the body and
  bakes them into the Razorpay order `notes` (as strings).
- `src/services/RazorpayService.ts` — `OrderPaymentOptions` gains the buyer/tax fields; forwarded to
  `/api/create-order`.
- `src/pages/ReportView.tsx` — unlock button now opens `CheckoutRegionModal`; on confirm →
  `startOrderPayment(sel)` → `initiateOrderPayment(...)` with the region declaration.
- `src/pages/Profile.tsx` — mounts `<InvoicesCard>` in the right column.

---

## Logo

Found at **`public/bornclock-logo.png`** (734×708, 171 KB — too heavy to inline raw). Downscaled to 140px
wide via `sips` (→ ~24 KB PNG) and inlined as **base64** (`BORNCLOCK_LOGO_B64`, 33 KB data URI). No external
URL is referenced anywhere in the invoice path. On the client it lives in a lazy chunk (InvoicesCard
dynamic-imports the generator), so it does not bloat the main bundle.

## State-capture UI

`CheckoutRegionModal` opens when a logged-in user clicks **Unlock** on `/report/[slug]`, BEFORE Razorpay.
Step 1: India | Outside India (pre-filled from ipapi but requires active confirm — it's a legal
declaration). Step 2: India → state/UT dropdown (36 entries, GST code shown); Outside → country dropdown
(export, zero-rated note). On confirm it computes `taxMode` (Telangana→CGST_SGST, other IN→IGST,
outside→EXPORT) and threads `{buyerCountry, buyerState, buyerStateCode, taxMode}` → create-order notes →
verify-payment.

## verify-payment.ts hook

Inserted **immediately before** the final `return json({ success: true, product })` (after payment record +
entitlement grant). Imports at the top of the file. The block is a self-contained `try/catch` that never
fails the response. Reads buyer/tax from `orderNotes`, back-calculates GST (inclusive), calls
`db.rpc('issue_invoice', { p: {...} })`, then `generateInvoiceHTML` + `sendInvoiceEmail`.

### paymentData deltas from the prompt's assumptions
The prompt assumed a `paymentData` object and an `env` param — the real code has neither:
- **No `env`** — the codebase uses `process.env` directly (nodejs_compat shim). `sendInvoiceEmail` takes
  no env; reads `process.env.RESEND_API_KEY`.
- **No `paymentData`** — used `orderNotes` (from `orderData.notes` for reports / `pmtData.notes` for subs),
  `paymentAmount` (paise/cents), `paymentCurrency`.
- **Buyer identity** via `db.auth.admin.getUserById(user_id)` → `user.email` / `user_metadata` (not
  `paymentData.email`).
- **RPC form** is `db.rpc('issue_invoice', {p})` — the prompt's `.from('invoices').rpc(...)` is not valid.
- **Razorpay note values are strings** ('' when absent) → read with `||`, not `??`, so an empty tax_mode
  doesn't slip through.
- `order_id` for the invoice: `razorpay_order_id ?? razorpay_subscription_id ?? razorpay_payment_id`
  (invoices.order_id is NOT NULL; subscriptions have no order id).

---

## Verification

- **Typecheck:** `tsc -p tsconfig.app.json` → **47 errors = pre-existing baseline, 0 new** (the two initial
  new errors, from `invoices` not being in the generated types, were fixed with a scoped `(supabase as any)`
  cast in InvoicesCard).
- **Build:** `npm run build` → **1313 ok, 0 failed, 0 skipped** prerenders.
- **Worker bundle:** `wrangler dev` came up clean with the new `../src/lib/invoice-generator.js` import in
  the worker (proves the cross-dir import + Web-API-only constraint hold).
- **Smoke (local + live):** create-order sentinel → `{"error":"Report not found"}` = **OK** both on
  `localhost:3001` and live `bornclock.usdvisionai.workers.dev`.
- **Generator render test** (esbuild-bundled, `/tmp/inv-*.html` + PNG): DOMESTIC invoice has TAX INVOICE /
  BC-series no / CGST 9% + SGST 9% / ₹199.00 / "Rupees One Hundred Ninety Nine Only" / supplier GSTIN /
  SAC 998439 / inline logo / place of supply. EXPORT invoice has BX-series / "US Dollars…" / $2.99 / LUT ARN
  AD360726011878N / "Zero-rated supply" / FX 1 USD = ₹87.20 / **no CGST**. GST foots exactly
  (168.64 + 15.18 + 15.18 = 199.00). Visual layout confirmed against the spec.

---

## Needs manual attention

1. **⚠ State codes corrected vs the prompt.** The prompt's state-code list had duplicate/incorrect GST codes
   (e.g. Bihar:04, Punjab:03, Jammu&Kashmir:01, Chandigarh:04). Since the invoice is a legal document,
   `src/data/indiaStates.ts` uses the **official GST state codes** instead. Telangana=36 (the only code that
   drives the CGST/SGST split for this supplier) is correct in both. Please confirm you're happy with the
   authoritative codes.
2. **Invoice issued for BOTH products.** The hook sits after the shared success return, so subscriptions get
   an invoice too (product-aware line item). BUT Phase 3 only wired the region modal into the **report**
   checkout — subscription checkout does NOT capture state, so subscription invoices fall back to **IGST**
   (INR) with no state, or EXPORT (USD). If you want correct CGST/SGST on Telangana subscriptions, wire the
   same modal into the /upgrade flow (create-subscription notes). Alternatively, gate the invoice block to
   `product === 'birthday_report'` if subscriptions shouldn't be invoiced here yet.
3. **fx_rate is a fixed fallback (87.20)** for exports — a live FX lookup is a future enhancement (flagged in
   code).
4. **Invoice = HTML attachment, not PDF.** Resend free tier: the invoice is sent as an `.html` file that
   opens in any browser and prints cleanly to PDF (matches the prompt). If you later want a true PDF
   attachment, add a headless-render step.
5. **Rare duplicate email on Razorpay retry.** `issue_invoice` is idempotent (returns the existing row by
   payment_id), but the hook re-sends the email on a retry. Harmless; add a "was newly created" check if you
   want to suppress it.
6. **Cron-schedule registration failed on deploy** (`/workers/scripts/bornclock/schedules` CF API error) —
   this is the pre-existing 4-cron block from the earlier product-polish batch, unrelated to GST. The worker
   code deployed and is live; re-run `wrangler deploy` or set crons in the dashboard when convenient.
7. **`invoices` not in generated types** — `src/integrations/supabase/types.ts` predates the table.
   Regenerate types when convenient to drop the `(supabase as any)` cast in InvoicesCard.
8. **Live modal not exercised end-to-end** (needs a logged-in session on a locked report + a real payment).
   Component typechecks + builds + renders; recommend one real test purchase to confirm the modal → notes →
   invoice email chain, then check `/profile` → Invoices → Download.

---

## Commit
`1580938` on `develop` (local only, not pushed).
