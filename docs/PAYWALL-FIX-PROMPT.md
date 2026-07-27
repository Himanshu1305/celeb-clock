# Paywall + Credits + Trial Fix — Claude Code Prompt
# Save as docs/PAYWALL-FIX-PROMPT.md, then: "Read docs/PAYWALL-FIX-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.

Produce docs/PAYWALL-FIX-REPORT.md at the end: every file changed, evidence per fix,
gate results, anything needing manual attention.

---

## CONTEXT — decisions made by the founder (do not re-litigate)

1. Trial users (first 7 days) get exactly ONE free unlocked report. After that, paywall.
2. Active subscribers: credits AUTO-REDEEM on their locked reports (no manual button hunt),
   with the remaining balance always visible ("2 of 3 left this month" style).
3. Credit accrual changes from 1/month to 3/MONTH. Carry-forward stays. New cap: 9.
4. One-time report USD price: $6.99 (currently wrongly displayed as $2.99).
5. Everyone else — free users post-trial, trial users who used their free report,
   subscribers with 0 credits — hits the CheckoutRegionModal → Razorpay paywall.

Your own prior investigation (the read-only audit) is the map. Key facts from it:
- Gate: ReportView.tsx:477 `isLocked = !isAdmin && !row.is_paid`
- is_paid set only by verify-payment.ts and redeem-credit.ts
- save-report.ts:59-75 inserts rows, never sets is_paid
- Accrual: get-credits.ts:57-67 (1/mo, cap 3, active-only)
- Redeem: redeem-credit.ts (server-side, compensating restore)
- Trial: trialUtils.ts, pure client calc from profile.created_at
- Messaging bug: BirthdayReport.tsx:254 promises FREE to trial users; gate disagrees
- Dead code: PDFQuotaService.ts tiered quotas unreferenced

HARD RULES (unchanged):
- NEVER modify api/_crypto.ts or api/razorpay-webhook.ts
- api/verify-payment.ts: do not touch (the invoice hook from the GST build stays as-is)
- DDL cannot run here — any new DDL goes to supabase/migrations/NOTES-*.sql for Studio
- ./node_modules/.bin/wrangler only, never npx wrangler
- Read-before-write on every file

---

## FIX 1 — Trial users: one free unlocked report (SERVER-SIDE enforced)

The client's isPremium flag must NOT be trusted for this. Enforce in api/save-report.ts:

1. Read api/save-report.ts fully first.
2. Add a small DDL file supabase/migrations/NOTES-unlock-source.sql (for manual Studio run):
   ```sql
   -- Statement 1: track how a report got unlocked ('trial' | 'payment' | 'credit')
   alter table public.birthday_reports
     add column if not exists unlock_source text;
   ```
   (Confirm the actual reports table name by reading save-report.ts — adjust if it
   differs. Also add a backfill comment: existing is_paid=true rows can stay null.)
3. In save-report.ts, AFTER reading the existing insert logic:
   - Fetch the user's profile server-side (service role): created_at, subscription_status.
   - Compute trial server-side: (now - created_at) < 7 days. Do NOT use a client flag.
   - Check trial-report-already-used server-side:
     count reports where user_id = X and unlock_source = 'trial'.
     (Until the DDL is applied this column won't exist — wrap in try/catch and
     treat a missing column as "feature off": insert as today, is_paid=false.
     Log '[trial-unlock] column missing, feature dormant'.)
   - If in-trial AND count = 0: insert with is_paid=true, unlock_source='trial'.
   - Else: insert exactly as today (is_paid default false).
4. verify-payment.ts is NOT touched, but redeem-credit.ts SHOULD also stamp
   unlock_source='credit' when it unlocks (same try/catch tolerance), and add
   a NOTES comment that verify-payment stamping ('payment') is deferred to avoid
   touching that file — acceptable gap.

## FIX 2 — Auto-redeem for active subscribers + visible balance

Read ReportView.tsx fully around the isLocked branch and handleUnlockWithCredit.

1. When a locked report is viewed AND user is an active subscriber AND credits > 0:
   auto-call the existing redeem-credit endpoint ONCE (useRef guard against
   double-fire in strict mode / re-renders; only for the report's owner —
   confirm ownership check exists, add if missing: row.user_id === user.id).
2. On success: toast/banner "1 report credit used — N remaining" (N from the
   redeem response; if the endpoint doesn't return the new balance, extend
   redeem-credit.ts to return it — read it first).
3. On failure: fall back to the normal paywall silently (log, no error wall).
4. Show the credit balance in the paywall area AND on /profile:
   "Report credits: N of 9" with a one-line explainer
   "3 added monthly · unused credits carry forward · max 9".
5. REMOVE the now-redundant manual "Use a subscriber credit" button (the auto
   path replaces it). Keep handleUnlockWithCredit as the function the auto path calls.

## FIX 3 — Accrual: 3/month, cap 9

Read api/get-credits.ts fully. Change:
- monthly grant: 1 → 3 (elapsed months × 3)
- cap: 3 → 9  (toAdd = min(elapsed * 3, max(0, 9 - currentCredits)))
Preserve: lazy accrual on read, active-only, credits_granted_month stamping.
Update every UI surface that states the credit mechanism (grep for "1 credit",
"cap 3", "carry", "credits" across src/ — the product-polish batch added copy on
/pricing, upgrade modal, FAQ, profile): all must now say 3/month, carry-forward, cap 9.

## FIX 4 — USD price: $2.99 → $6.99 everywhere

grep -rn "2.99\|2\.99" src/ api/ --include="*.tsx" --include="*.ts"
- Update the DISPLAY price everywhere it appears (BirthdayReport.tsx:263-271,
  /pricing, showcase, anywhere else the grep finds).
- Read api/create-order.ts and find where the USD amount for birthday_report is
  set (likely 299 cents or similar). Change to 699. If the amount lives in a
  shared constants file, change it there once.
- Confirm the GST invoice path needs NO change (it reads paymentData.amount —
  verify this by reading, do not modify verify-payment.ts).

## FIX 5 — Copy corrections (from founder review)

0. LAUNCH-PRICE LABEL: everywhere the report price is displayed (₹199 and $6.99 —
   BirthdayReport.tsx pricing card, /pricing, BirthdayReportShowcase, any grep hits),
   add a small muted "Launch price" label adjacent to the amount. Plain text label
   ONLY — do NOT add a struck-through higher anchor price (never sold at a higher
   price; fake reference pricing is prohibited). Keep India and global consistent.

0b. 7-DAY GUARANTEE: at every buy point (report unlock CTA, pricing card, /pricing
   page, showcase) add: "7-day money-back guarantee — full refund, no questions."
   Place it with/near the existing hello@bornclock.com trust line. Also add one FAQ
   entry on /pricing: "What if I don't like it? Email hello@bornclock.com within 7
   days of purchase for a full refund." Do NOT build any self-serve refund flow —
   refunds are processed manually via the Razorpay dashboard for now.

1. BirthdayReport.tsx trial card: "FREE · Included in your trial" →
   "1 free report included in your trial".
2. The "20+ page keepsake report" claim (BirthdayReportShowcase and anywhere else —
   grep "20+"): verify the real typical page count from the PDF pagination work
   (the Cmd+P path produced 21 pages — so "20+ page" is actually TRUE; if evidence
   confirms 21 pages typical, KEEP the claim and note the evidence in the report;
   if shorter for typical inputs, soften to "multi-page").
3. "See what's included" button on the showcase: give it a visible secondary-button
   background (it currently looks like dead text). It may keep linking to /pricing.
4. grep -rn "Perfect for every occasion" src/ — replace with birthday-appropriate
   copy, e.g. "A birthday gift they'll actually keep" (match surrounding tone).

## FIX 6 — Dead code

Delete PDFQuotaService.ts and any imports of it (grep first, confirm truly
unreferenced, then remove).

---

## GATE (all must pass before commit)

1. tsc -p tsconfig.app.json --noEmit → 46 baseline (post-Admin-fix), 0 new
2. npm run build → 1313+ ok, 0 failed
3. Launch gauntlet if runnable locally; else note skipped
4. git diff review: confirm _crypto.ts, razorpay-webhook.ts, verify-payment.ts ALL untouched
5. Local smoke: create-order sentinel → {"error":"Report not found"}
6. Deploy once: ./node_modules/.bin/wrangler deploy
7. Live smoke: same sentinel check

## REPORT

docs/PAYWALL-FIX-REPORT.md with per-fix evidence, the exact new accrual math,
every copy string changed (before → after), the grep proof that payment files
are untouched, and the reminder list of MANUAL steps for the founder:
- Run NOTES-unlock-source.sql in Studio (until then, trial free-report is dormant)
- Re-test as: trial user (fresh account), post-trial free user, active subscriber
  with credits, subscriber with 0 credits

Commit message: "feat: paywall integrity — trial free report, credit auto-redeem, 3/mo accrual, $6.99 USD, copy fixes"
