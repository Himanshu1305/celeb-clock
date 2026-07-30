# Final Fixes — Claude Code Prompt
# Save as docs/FINAL-FIXES-PROMPT.md, then: "Read docs/FINAL-FIXES-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/FINAL-FIXES-REPORT.md. If the test suite from docs/TEST-SUITE-PROMPT.md
exists, run `npm run test:prelaunch` as part of the gate and fix any regressions.

HARD RULES:
- api/_crypto.ts and api/razorpay-webhook.ts: NEVER touched, no exceptions.
- api/verify-payment.ts: ONE narrowly-scoped exception granted in F1 below — changes
  allowed ONLY inside the existing non-fatal invoice try/catch block. The HMAC check
  and premium-grant logic remain byte-identical. Show the diff boundaries in the report.
- DDL → supabase/migrations/NOTES-*.sql for Studio, never executed here.
- ./node_modules/.bin/wrangler only. Read before write.

---

## F1 — SUBSCRIPTIONS MUST BE INVOICED (compliance gap, highest priority)

Founder subscribed at ₹299: premium granted, "Payment confirmed" email sent, NO GST
invoice. Currently by design (the `product !== 'birthday_report' → skip` guard), but
every taxable supply legally requires an invoice. Fix in three parts:

### F1a — Capture region at /upgrade
Wire the existing CheckoutRegionModal into the subscription flow exactly as it works
for the report: modal BEFORE Razorpay opens, confirmed region drives currency AND
taxMode, values travel via order/subscription notes. Read how /upgrade opens Razorpay
first (subscriptions use a different Razorpay flow than one-time orders — subscription
checkout may not accept notes the same way; investigate and report how region reaches
verify-payment; if notes are impossible on the subscription object, pass region in the
verify-payment request body from the client AND persist it).

### F1b — Persist place-of-supply on the profile
New DDL file supabase/migrations/NOTES-subscription-invoicing.sql:
  alter table public.profiles
    add column if not exists buyer_state text,
    add column if not exists buyer_state_code text,
    add column if not exists buyer_country text;
verify-payment (inside the invoice block only) writes these on first subscription
payment. They are the authoritative place-of-supply for all future renewals.

### F1c — Invoice the first subscription payment
Inside the existing non-fatal invoice block in verify-payment.ts:
- Replace the skip-guard: subscriptions are now invoiced too.
- line_items desc: "BornClock Premium — Monthly subscription" or "— Annual
  subscription" (read the plan from the payment/subscription object).
- Same GST-inclusive math, same issue_invoice() rpc, same email attachment.
- Confirm the ₹299 split: taxable 253.39, cgst 22.81, sgst 22.80 (plug) = 299.00 —
  the plug rule already guarantees this; just verify with a unit calc in the report.
- Everything stays non-fatal; a failed invoice never blocks premium.

### F1d — RENEWALS: daily sweep (webhook is frozen)
Renewal charges arrive via razorpay-webhook (frozen — cannot add invoicing there).
Instead: extend the existing daily ops cron (scheduled() in the Worker) with an
invoice sweep:
- Find subscription payments recorded by the webhook that have no matching row in
  invoices (join on payment_id). Read the webhook handler READ-ONLY to learn exactly
  where/how it records payments (payments table / profiles update) and use that.
- For each: issue_invoice() using the profile's persisted buyer_state/country
  (F1b) and the payment amount; email the invoice.
- Idempotent by construction (issue_invoice dedupes on payment_id).
- If the webhook does NOT record renewal payment rows anywhere readable, STOP,
  report this as a BLOCKER FINDING with the evidence, and do not improvise.

## F2 — WELCOME EMAIL: SERVER-SIDE SEND-ONCE (third recurrence, kill it properly)

Two welcome emails again, simultaneous, different random subjects. Root cause: the
confirmation link opens a NEW TAB → two browser contexts → the module-level Set and
the localStorage guard are per-context and race across tabs. A client-side guard
cannot close this.

Fix server-side, same discipline as credit idempotency:
- In the Worker /api/send-email path (or a thin wrapper the client calls for
  welcome), before sending template 'welcome': atomically claim it. Use profiles:
    update profiles set welcomed_at = now()
    where user_id = X and welcomed_at is null returning user_id
  → row returned = you own the send; no row = already sent, return 200 silently.
- DDL to the SAME NOTES-subscription-invoicing.sql file:
    alter table public.profiles add column if not exists welcomed_at timestamptz;
- Apply the identical pattern to ANY other client-triggered per-user-once email
  (grep the email service for other candidates and list them in the report).
- Keep the client guards as a first line; the DB claim is the authority.
- Until the founder applies the DDL, tolerate the missing column (try/catch → fall
  back to current client-guard behaviour, log '[welcome] column missing').

## F3 — DELETE-ACCOUNT CONFIRMATION EMAIL NEVER ARRIVES

Deletion works (user gone from auth.users); the email doesn't arrive. Investigate the
actual send path in supabase/functions/delete-account/index.ts:
- Does it call the Worker /api/send-email or Resend directly? If the Worker: the call
  happens AFTER deleteUser — does /api/send-email require auth that the deleted user
  no longer has? Does CORS/URL point at the right origin from the edge runtime?
- Add explicit logging around the send (console.error on non-2xx with response body)
  so the Supabase function logs show the reason.
- Fix the root cause. If it calls Resend directly, RESEND_API_KEY is now set as a
  Supabase secret — verify the env var name the code reads matches.
- Redeploy note for founder: npx supabase functions deploy delete-account
  --project-ref jwrpqiypvystivtqyhro (CLI not available here — list as manual step).

## F4 — STALE "$9.99 LIFETIME" OFFER ON /auth

The auth page shows "One-time payment • $9.99 lifetime access" — no such plan exists.
grep -rn "9.99\|lifetime" src/ --include="*.tsx" --include="*.ts"
Remove or replace with truthful copy sourced from src/lib/pricing.ts (e.g. the trial
line: "7-day free trial · then from ₹299/mo"). Check the whole /auth page for any
other stale claims while there.

## F5 — /pricing: SHOW ANNUAL; PROFILE + PAYWALL UPSELL COPY

- /pricing Premium card: display both cadences from pricing.ts — "₹299/mo · or
  ₹2,499/yr (save ₹1,089)" (compute the saving from the constants; USD equivalents in
  USD mode). CTA continues to /upgrade (the cadence chooser) — do not change routing.
- Profile upsell row (free users): upgrade the copy to state the mechanics:
  "Premium: 3 report credits every month — unused credits carry forward, up to 9.
  One report alone costs ₹199." with the Upgrade CTA.
- Paywall (ReportView + CheckoutRegionModal area): add ONE inline comparison line at
  the decision point: "₹199 for this report · or Premium at ₹299/mo includes 3
  reports every month" (currency-aware from pricing.ts). No tooltip, no new page.

## F6 — PDF: SOLAR SYSTEM AGES SPLITS ACROSS PAGES

The 07·COSMOS section (dark background, 8 cards + Neptune box) breaks across two
pages. In the print CSS (index.css @media print — the pagination home per the
product-polish fix): give the Solar System Ages section container
break-before: page and break-inside: avoid on the card grid so the section starts
fresh and holds together. Verify with the --cmdp harness / text-position audit that
this does not create a new void elsewhere. If avoiding the split is impossible
without a large void (content genuinely taller than one page), keep break-before:
page only and report the residual split as accepted.

---

## GATE
1. tsc 45 baseline, 0 new
2. npm run build 1313+ ok
3. npm run test:prelaunch (if present): all green, fix regressions per the
   TEST-SUITE fix policy (never weaken assertions)
4. git diff api/verify-payment.ts: changes confined to the invoice block — paste the
   hunk headers as proof; _crypto.ts and razorpay-webhook.ts untouched
5. Local + live smoke: create-order sentinel → {"error":"Report not found"}
6. Deploy once

## REPORT — docs/FINAL-FIXES-REPORT.md
- F1: how region reaches verify-payment for subscriptions; the renewal-sweep design
  and evidence of where the webhook records payments; the ₹299 split verification
- F2: the atomic-claim implementation; other per-user-once emails found
- F3: root cause of the missing delete email, with the log evidence
- Founder manual steps: apply NOTES-subscription-invoicing.sql (2 ALTERs + welcomed_at);
  redeploy the delete-account edge function; re-test list (subscribe → invoice email,
  new signup → exactly one welcome, delete → confirmation email)
- Anything deferred, stated explicitly

Commit: "fix: subscription invoicing + renewal sweep, server-side email idempotency, delete email, stale copy, pricing display, pdf break"
