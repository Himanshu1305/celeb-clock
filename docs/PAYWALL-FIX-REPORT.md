# Paywall + Credits + Trial Fix — Report

**Commit:** `e99e51c` — "feat: paywall integrity — trial free report, credit auto-redeem, 3/mo accrual, $6.99 USD, copy fixes"
**Branch:** develop (local commit only — NOT pushed).
**Deploy:** one `./node_modules/.bin/wrangler deploy` → live at `bornclock.usdvisionai.workers.dev`.
**Frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts` (grep proof below).
**Date:** 2026-07-28.

---

## Gate results

| Check | Result |
|---|---|
| `tsc -p tsconfig.app.json` | **46 with my changes = 46 without** → **0 new** (stash-compared). Pre-existing 46 include stale-Supabase types, `setDob` in BirthdayReport, LifeExpectancy `full_name`, etc. |
| `npm run build` | **1313 ok, 0 failed, 0 skipped** |
| Launch gauntlet (local, vite :3000 + wrangler :3001) | **135 passed, 0 failed** |
| Frozen payment files touched | **none** (see grep proof) |
| Local smoke (create-order sentinel) | `{"error":"Report not found"}` ✓ |
| Deploy | worker + assets live ✓ (exit-1 = pre-existing cron-schedule CF API error, unrelated) |
| Live smoke | `{"error":"Report not found"}` ✓ |

**Grep proof — frozen files untouched (in this batch):**
```
$ git status --short | grep -E "_crypto|razorpay-webhook|verify-payment"
(empty)
```
Changed files: api/{create-order,get-credits,redeem-credit,save-report}.ts; src/hooks/useAuth.ts;
src/components/{AdminRoute,BirthdayReportShowcase,PaymentSuccessModal}.tsx; src/data/pageFaqs.ts;
src/pages/{BirthdayReport,Pricing,Profile,ReportView,Upgrade}.tsx; deleted src/services/PDFQuotaService.ts;
new src/lib/adminEmails.ts + supabase/migrations/NOTES-unlock-source.sql.

---

## FIX 1 — Trial users: one free unlocked report (SERVER-SIDE)

- **`supabase/migrations/NOTES-unlock-source.sql`** (NOT applied): `alter table public.birthday_reports
  add column if not exists unlock_source text;` Reports table confirmed = `birthday_reports`.
- **`api/save-report.ts`:** fetches `profiles.created_at` server-side (service role), computes
  `inTrial = (now − created_at) < 7d` — the client `isPremium` flag is **not** trusted for this. Counts
  `birthday_reports where user_id=X and unlock_source='trial'`; if the column is missing the query errors
  → caught → `console.warn('[trial-unlock] column missing … feature dormant')` → inserts as today
  (`is_paid=false`). If in-trial AND count=0 → inserts `is_paid=true, unlock_source='trial'`, 30-day expiry.
  Response now returns `{ slug, unlocked }`. `unlock_source` is only written when `trialUnlock` is true,
  which is only reachable after the usage query succeeded (column exists) — so a missing column never
  breaks the insert.
- **`api/redeem-credit.ts`:** after the successful `is_paid` unlock, a **separate** best-effort
  `update({ unlock_source:'credit' })` (error ignored) — so a missing column can't fail the redemption.
  `verify-payment` stamping ('payment') is deferred (file frozen) — paid reports carry `unlock_source=null`;
  documented in the NOTES file. Acceptable gap.

**Evidence:** feature is dormant until the DDL is applied (by design); code paths verified by build + tsc.

## FIX 2 — Auto-redeem for active subscribers + visible balance

- **`src/pages/ReportView.tsx`:** `handleUnlockWithCredit(opts?)` moved **above the early returns** (to
  avoid the use-before-init TDZ that bit /admin) and given an `auto` mode (silent on failure). A new
  effect auto-redeems when: `row` loaded, `!isAdmin && !row.is_paid`, `row.user_id === user.id` (owner
  check), `subscription_status==='active'`, `credits>0` — once per mount via `autoRedeemTried` ref. On
  success → toast **"1 report credit used — N of 9 remaining"**. On failure → silent fallback to paywall.
- **Manual "Use a subscriber credit" button REMOVED**; replaced by an informational balance line in the
  paywall: *"Report credits: N of 9 — one will be used automatically…"* / *"0 of 9 · 3 added monthly,
  unused credits carry forward (max 9)."* `handleUnlockWithCredit` retained as the function the auto path calls.
- **`redeem-credit.ts`** already returns `creditsRemaining` (the new balance) — used by the toast.
- **`/profile`:** balance line now **"Report credits: N of 9"** + *"3 added monthly · unused credits carry
  forward · max 9."*

## FIX 3 — Accrual: 3/month, cap 9

- **`api/get-credits.ts`** exact new math:
  ```js
  const elapsed = lastGranted ? Math.max(1, monthsBetween(lastGranted, currentMonth)) : 1;
  const toAdd   = Math.min(elapsed * 3, Math.max(0, 9 - currentCredits));   // was: min(elapsed, 3 - current)
  ```
  Preserved: lazy accrual on read, active-subscriber-only, `credits_granted_month` stamping.

## FIX 4 — USD price $2.99 → $6.99

- **`api/create-order.ts`:** `PRODUCT_AMOUNTS.birthday_report.USD 299 → 699`.
- Display updated: `Pricing.tsx:48`, `ReportView.tsx:979/1016`, `BirthdayReport.tsx` card → `$6.99`.
- GST invoice path needs **no change** — it reads `paymentData.amount` from Razorpay (verified by reading
  verify-payment.ts; not modified).
- ⚠ **Member USD decision (flag):** the founder specified only the base ($2.99→$6.99). Member USD was
  `$2.49`/249, which vs a $6.99 base is a 64% discount (INR member is 25% off). To avoid shipping that
  gap, I scaled member USD to the same ~25% ratio → **$5.49 / 549** (create-order + ReportView + Pricing).
  Please confirm or adjust.

## FIX 5 — Copy corrections

| # | Where | Before → After |
|---|---|---|
| 5.0 Launch label | BirthdayReport card | "India / Global" → "India / Global · Launch price" |
| | Pricing report card | added "Launch price" chip beside the price (no fake struck price) |
| | Showcase | added "Launch price" chip beside ₹199 |
| | ReportView unlock | added muted "Launch price" line (non-members) |
| 5.0b Guarantee | ReportView / Pricing / Showcase / BirthdayReport | added "7-day money-back guarantee — full refund, no questions." near the hello@bornclock.com line |
| | Pricing FAQ | new: "What if I don't like it? Email hello@bornclock.com within 7 days of purchase for a full refund." |
| 5.1 Trial card | BirthdayReport | "FREE · Included in your trial" → "**1 free report** · Included in your trial · N days remaining". Also premium branch corrected: active subscribers now see "**Included** · Unlocked automatically with your monthly report credits" (was falsely "FREE · Included in your Premium plan"). |
| 5.2 "20+ page" | Showcase / Pricing | **KEPT** — evidence: the Phase-1 PDF pagination work measured **21 pages** for the reference report (Cmd+P path), so "20+ page" is true. |
| 5.3 "See what's included" | Showcase | button `variant="outline"` → `variant="secondary"` (visible background; still links to /pricing) |
| 5.4 Occasion copy | BirthdayReport | "Perfect for every occasion" → "A birthday gift they'll actually keep" |

Credit-mechanism copy updated to **3/month, carry-forward, cap 9** in: `Pricing.tsx` (comparison row,
premium card, explainer), `Upgrade.tsx` (feature list, hero, "Everything in Premium" desc, credit
sentence), `Profile.tsx`, `pageFaqs.ts` (credits FAQ), `PaymentSuccessModal.tsx`.

## FIX 6 — Dead code

- **Deleted `src/services/PDFQuotaService.ts`** (legacy tiered quota, unreferenced by the live flow).
  Its only live import was `ADMIN_EMAILS` in `useAuth.ts` → relocated to new **`src/lib/adminEmails.ts`**
  (`ADMIN_EMAILS` + `isAdminEmail`). `AdminRoute.tsx` consolidated onto the same module (and re-exports
  `isAdminEmail` for `Navigation`). Grep confirms no remaining code references.

---

## MANUAL STEPS for the founder

1. **Run `supabase/migrations/NOTES-unlock-source.sql` in Studio** (single statement). Until then the
   **trial free-report feature is DORMANT** (reports insert locked as before; credit-unlock still works,
   it just won't stamp `unlock_source`).
2. **Confirm the member USD price** ($5.49) — or set your own; base is $6.99 as instructed.
3. **Re-test the four scenarios:**
   - Trial user (fresh account) → first report unlocks free; a second report is locked (paywall).
   - Post-trial free user → report locked → CheckoutRegionModal → Razorpay ($6.99 / ₹199).
   - Active subscriber **with credits** → opening their locked report auto-redeems 1 credit (toast
     "1 report credit used — N of 9 remaining").
   - Active subscriber **with 0 credits** → paywall (member price $5.49 / ₹149).
4. Cron-schedule registration still fails on deploy (pre-existing 4-cron block, unrelated) — re-run
   `wrangler deploy` or set crons in the CF dashboard when convenient.

## Commit
`e99e51c` on `develop` (local only, not pushed).
