# Final Fixes — Report

Execution of `docs/FINAL-FIXES-PROMPT.md`. Local commits only, not pushed.

## Summary

| Fix | Status | Files touched |
|-----|--------|---------------|
| F1a — capture region at /upgrade | ✅ | `src/pages/Upgrade.tsx`, `src/services/RazorpayService.ts`, `src/components/CheckoutRegionModal.tsx`, `api/create-subscription.ts` |
| F1b — persist place-of-supply on profile | ✅ | `api/verify-payment.ts` (invoice block), `supabase/migrations/NOTES-subscription-invoicing.sql` |
| F1c — invoice the first subscription payment | ✅ | `api/verify-payment.ts` (invoice block) |
| F1d — renewal daily sweep | ✅ | `api/invoice-sweep.ts` (new), `functions/_worker.ts` |
| F2 — welcome email server-side send-once | ✅ | `api/send-email.ts`, `src/services/EmailService.ts`, `src/hooks/useAuth.ts`, DDL |
| F3 — delete-account confirmation email | ✅ | `supabase/functions/delete-account/index.ts` |
| F4 — stale "$9.99 lifetime" on /auth | ✅ | `src/pages/Auth.tsx` |
| F5 — /pricing annual + upsell copy | ✅ | `src/pages/Pricing.tsx`, `src/pages/Profile.tsx`, `src/pages/ReportView.tsx` |
| F6 — PDF solar-system pagination | ✅ (break-before only; residual accepted) | `src/pages/ReportView.tsx` (inline print `<style>`) |

---

## F1 — Subscriptions are now invoiced

### How the region reaches verify-payment for subscriptions

Investigated the subscription checkout path. Unlike one-time orders (which carry the
GST declaration in the **Razorpay order notes**, read back server-side from the fetched
order), the subscription checkout object does **not** reliably forward its `notes` onto
the *payment* entity that `verify-payment` fetches. Rather than depend on that, the
confirmed region travels through **two** channels, notes-first with a body fallback:

1. **Subscription notes** — `create-subscription.ts` now accepts `billing`,
   `buyer_country`, `buyer_state`, `buyer_state_code`, `tax_mode` and stamps them on the
   Razorpay subscription `notes` (best-effort / reconciliation).
2. **verify-payment request body (authoritative)** — `RazorpayService.initiateSubscription`
   posts the same fields in the `/api/verify-payment` body. Inside the non-fatal invoice
   block, `verify-payment` reads `orderNotes.* || body.* ` so the order flow keeps using
   notes and the subscription flow uses the body.

`CheckoutRegionModal` now opens **before** Razorpay on `/upgrade` (mirrors the report
flow). Its confirmed currency drives **both** the plan selection (INR vs USD, via
`RAZORPAY_PLANS[billing][currency]` from `pricing.ts`) **and** the tax mode — so a
USD-detected user who declares India gets the INR plan and a CGST/SGST invoice.

### F1b — place-of-supply persisted on the profile

New nullable columns (`NOTES-subscription-invoicing.sql`): `profiles.buyer_state`,
`buyer_state_code`, `buyer_country`. On the **first** subscription payment,
`verify-payment` (inside the invoice block only) writes them, keyed on
`profiles.user_id` — the auth link (`profiles.id` is a random PK, confirmed by the
`delete-account` "Bug 1" comment). These are the authoritative place-of-supply for every
future renewal. The write is non-fatal and tolerates the column not existing yet.

### F1c — first subscription payment invoiced

The old `if (product !== 'birthday_report') throw 'skip'` guard is removed; both product
types are invoiced. Line item description reads the cadence from notes/body:
`"BornClock Premium — Monthly subscription"` / `"— Annual subscription"`. Same
GST-inclusive back-calculation, same `issue_invoice()` RPC (idempotent on `payment_id`),
same email attachment path. A subscription with a non-resolvable amount (Razorpay payment
fetch failed → amount 0) is skipped rather than issuing a zero-value invoice. Everything
remains non-fatal — a failed invoice never blocks the premium grant.

**₹299 split verification** (unit calc, GST-inclusive 18%, SGST plugged):

```
gross    = 299.00
taxable  = round(299 / 1.18)      = 253.39
totalTax = round(299 - 253.39)    = 45.61
cgst     = round(253.39 * 0.09)   = 22.81
sgst     = totalTax - cgst (plug) = 22.80
foots    = 253.39 + 22.81 + 22.80 = 299.00 ✓
```

Matches the handoff figures exactly; the `invoices_foots` constraint is satisfied.

### F1d — renewal sweep (webhook is frozen)

**Evidence of where the webhook records payments** (read-only, `razorpay-webhook.ts`
lines 126–136): on `subscription.activated` / `subscription.charged` it upserts into
`public.payments` with `onConflict: 'razorpay_payment_id'`:
`user_id, razorpay_payment_id, razorpay_subscription_id, amount, currency, status,
product:'subscription'`. So renewal charges **are** recorded in a readable table — no
blocker.

**Design** (`api/invoice-sweep.ts`, new): reads all `product='subscription'` payments and
the set of `invoices.payment_id`, computes the anti-join (payments with no invoice), and
for each: reads the profile's persisted place-of-supply (keyed on `user_id`), derives the
tax mode with the **same** rule as verify-payment, does the **same** GST math, calls
`issue_invoice()` (idempotent on `payment_id`), and emails via `sendInvoiceEmail`.
Idempotent twice over: the anti-join skips already-invoiced payments (incl. the first
payment invoiced inline by verify-payment), and `issue_invoice()` dedupes on
`payment_id`. De-identified rows (`user_id` null after account deletion) and zero-amount
rows are skipped and logged. Capped at 200/run; the tail rolls into the next daily run.

**Wiring**: extended the existing daily ops cron in `functions/_worker.ts scheduled()`
(`'10 6 * * *'`) with a second `ctx.waitUntil(fetch(base + '/api/invoice-sweep', {POST}))`
alongside the ops-monitor call, and registered `/api/invoice-sweep` in the route table.
No new wrangler cron needed.

---

## F2 — Welcome email: server-side send-once

**Root cause** (as diagnosed in the prompt): the confirmation link opens a **new tab** →
two browser contexts → the module-level `Set` and the `localStorage` guard are
per-context and race across tabs. A client-side guard cannot close this.

**Implementation** (atomic claim, same discipline as credit idempotency): `send-email.ts`,
before sending `type:'welcome'`, runs
`update profiles set welcomed_at = now() where user_id = X and welcomed_at is null
returning user_id` (via PostgREST: `.update().eq('user_id',X).is('welcomed_at',null).select()`).
Exactly one caller gets a row back and owns the send; the other sees no row and returns
`200 {deduped:true}` silently. `EmailService.sendWelcome` and `useAuth` now pass the
`userId`. DDL: `profiles.welcomed_at timestamptz` in the same NOTES file. The client
`Set`/`localStorage` guards are kept as a first line; the DB claim is the authority.
Until the founder applies the column, the claim returns `'noguard'` (catching Postgres
`42703`), logs `[welcome] column missing`, and falls back to the prior client-guard
behaviour.

**Other client-triggered per-user-once emails found**: grep of `EmailService.ts` shows
only `welcome` is per-user-once. The rest are per-event, not per-user-once —
`trial_expiry`/`nudge_*` are time/window based, `payment_confirmation`/`payment_receipt`
are per-payment, `cancellation` per-cancellation, `report_locked`/`report_created`
per-report. None need the once-per-user claim. (`premium_activated` is sent server-side
from the frozen webhook, not client-triggered.)

---

## F3 — Delete-account confirmation email

**Root cause**: the edge function POSTed to `${SITE_URL}/api/send-email` on the Worker.
`SITE_URL` is **not** set as a secret on the function, so it defaulted to
`https://bornclock.com`, and — critically — **the fetch result was never inspected**. A
request that hit the wrong origin or returned a non-2xx failed **silently**. The deletion
runs *before* the send and still succeeded, which is exactly the observed symptom:
"deletion works, but the confirmation email never arrives." (Auth was ruled out —
`/api/send-email` requires no auth; CORS was ruled out — server-to-server fetch; the
`account_deleted` template exists in `_email.ts`.)

**Fix**: send **directly via Resend** from the edge runtime (`RESEND_API_KEY` is now a
Supabase secret; the env var name the code reads matches). This removes the cross-service
origin dependency entirely. Both sends (user confirmation + internal notification) now go
through a `sendViaResend` helper that **logs the response body on any non-2xx**
(`console.error('[delete-account] Resend non-2xx', status, body)`) so the Supabase
function logs show the reason if it ever fails again. Both remain non-fatal.

**Log evidence to expect after redeploy**: on success, no error lines; on failure, a
`[delete-account] Resend non-2xx <status> for <subject> → <body>` line (or
`RESEND_API_KEY not set` / `Resend fetch threw`). This is the diagnostic the prompt asked
for.

> Manual step (CLI not available here): redeploy the edge function —
> `npx supabase functions deploy delete-account --project-ref jwrpqiypvystivtqyhro`

---

## F4 — Stale "$9.99 lifetime" on /auth

`src/pages/Auth.tsx` showed `One-time payment • $9.99 lifetime access` — no such plan
exists. Replaced with truthful, currency-aware copy sourced from `pricing.ts`:
`7-day free trial · then from {subscriptionPrice('monthly', currency)}/mo · cancel anytime`
(via `useResolvedCurrency`). Swept the rest of the page — no other stale price/plan claims
in the rendered `/auth` view. (Note: the unused legacy templates under `src/emails/*.tsx`
still contain old "Cosmic Age"/`$29.99` copy, but they are **not** used by the live email
path — `EmailService → /api/send-email → api/_email.ts` — so they were left out of scope.)

---

## F5 — /pricing annual + upsell copy

- **/pricing Premium card**: now shows both cadences —
  `{monthly}/month · cancel anytime` plus a second line
  `or {annual}/yr (save {annualSaving})`, all from `pricing.ts` constants
  (`subscriptionPrice`, `annualSaving`, `formatMoney`); USD equivalents in USD mode. CTA
  routing to `/upgrade` unchanged.
- **Profile upsell row (free users)**: copy upgraded to state the mechanics —
  `Premium: 3 report credits every month — unused credits carry forward, up to 9. One
  report alone costs {reportPrice}.` (currency-aware via `useReportPrice`). Upgrade CTA
  unchanged.
- **Paywall (ReportView, at the decision point)**: one inline, currency-aware comparison
  line added just above "Launch price" —
  `{reportPrice} for this report · or Premium at {subscriptionPrice('monthly')}/mo
  includes {CREDITS.perMonth} reports every month`. No tooltip, no new page.

---

## F6 — PDF: Solar System Ages pagination

The **authoritative** print CSS for the birthday report is the inline `<style>` in
`ReportView.tsx` (the pagination home that overrides the `index.css` block), not
`index.css` alone — editing only `index.css` would have had no effect because the inline
rule wins the cascade.

History (documented in-place): forcing the whole section together stranded the heading and
pushed all cards to the next page (~90% blank), and CSS-grid containers can't fragment, so
the grid was already switched to inline-block flow with per-card no-split protection.

**Applied**: added `break-before: page` (+ legacy `page-break-before: always`) to
`.solar-section` so the 07·COSMOS section starts on a **fresh page** and no longer
straddles a page boundary mid-content. **Kept** internal flow (`page-break-inside: auto`)
and did **not** add `break-inside: avoid` to the card grid — the content (8 planet cards +
Neptune box) is genuinely taller than one page, so grid-level avoid recreates the
documented ~90% blank page.

**Residual (accepted, per the prompt's fallback)**: some trailing whitespace can remain on
the page **before** the section — this is the lesser evil versus a mid-section split, and
grid-level "hold together" is impossible without a large void because the section is taller
than one printable page.

---

## GATE

1. **tsc** — 0 errors (baseline was quoted as 45; the repo currently type-checks clean, so
   0 new). ✓
2. **npm run build** — exit 0; sitemap **1313 URLs** written. ✓
3. **npm run test:prelaunch** — _see result below._
4. **verify-payment diff confined to the invoice block** — all hunks fall within lines
   271–342 (the `try { … } catch` block that starts at 270); `api/_crypto.ts` and
   `api/razorpay-webhook.ts` show **no diff**. Hunk headers:
   ```
   @@ -271,6 +271,12 @@   @@ -279,3 +285,4 @@   @@ -284 +291 @@
   @@ -288,0 +296,16 @@   @@ -310,0 +334,3 @@   @@ -313 +339 @@   @@ -316 +342 @@
   ```
   ✓
5. **Local + live smoke** — create-order sentinel returns `{"error":"Report not found"}`
   both locally (`:3001` and via the `:3000` Vite proxy) and live
   (`bornclock.usdvisionai.workers.dev`). ✓
6. **Deploy** — `wrangler deploy` succeeded: Worker + 1315 assets live at
   `bornclock.usdvisionai.workers.dev` and `staging.bornclock.com`. Post-deploy live
   sentinel still returns `{"error":"Report not found"}`; the new `/api/invoice-sweep`
   route is live (PUT → 405, i.e. route exists / method rejected — verified without
   triggering the sweep). **Caveat**: the cron **schedule re-registration** returned a
   Cloudflare API error (the wrangler OAuth token is missing a scope; `wrangler whoami`
   warns to `wrangler login`). The Worker **code** deployed fine and `[triggers]` in
   `wrangler.toml` is **unchanged**, so the already-registered schedules persist and the
   sweep runs under the existing `10 6 * * *` handler. If the founder wants wrangler to
   re-apply schedules cleanly, run `wrangler login` then `wrangler deploy` (or
   `wrangler triggers deploy`) once. ⚠️

### test:prelaunch result

Ran the full suite against a local stack (`wrangler dev :3001` + Vite `:3000`, env sourced
from `.env.local`; ephemeral `.dev.vars` created for wrangler dev and removed afterwards).

- **launch-gauntlet: 135/135 passed** (2.2m).
- **prelaunch: 51 passed, 1 flaky, 1 failed → fixed → re-run green.**
  - Flaky: `auth.spec.ts:53 sign-out clears the session` — failed once, **passed on
    retry #1**; unrelated to these changes (pre-existing sign-out timing).
  - Failed: `profile.spec.ts:22` asserted the **pre-F5** upsell string
    (`/Premium members get 3 report credits every month/`). F5 intentionally changed that
    copy, so the assertion was realigned to the new copy
    (`/Premium: 3 report credits every month/` **and** `/One report alone costs/`) — this
    updates the expectation to the new spec, it does **not** weaken it (still asserts the
    upsell is visible, now with two checks). Re-ran `profile.spec.ts` → **3/3 passed**.

No assertions were weakened. Net: suite green after the one expected copy-assertion update.
Notably `currency.spec.ts:75/89` (`/upgrade lists monthly+annual+saving; /pricing monthly
matches`, INR+USD) and `paywall-modal.spec.ts` (region modal before Razorpay) and
`pricing-card-states.spec.ts` all passed — direct coverage of the F5 changes.

---

## Founder manual steps

1. **Apply `supabase/migrations/NOTES-subscription-invoicing.sql`** in Supabase Studio (one
   statement at a time): 2 ALTERs adding `profiles.buyer_state / buyer_state_code /
   buyer_country`, plus `profiles.welcomed_at`. Until then: renewals won't invoice and the
   welcome guard falls back to the client guard (both tolerated in code).
2. **Redeploy the delete-account edge function**:
   `npx supabase functions deploy delete-account --project-ref jwrpqiypvystivtqyhro`
   (CLI not available in this repo). Confirm `RESEND_API_KEY` is set as a function secret.
3. **Re-test list**:
   - Subscribe (₹299) → premium granted **and** a GST invoice email arrives (BC/26-27 series).
   - New signup, open the confirmation link → exactly **one** welcome email (open it in a
     second tab too — still one).
   - Delete account → the "account has been deleted" confirmation email arrives; the
     internal `ACCOUNT DELETED —` notification lands in the inbox.
   - A renewal charge (or the next daily 06:10 UTC sweep) → a renewal invoice email.

## Deferred / notes

- **`profiles.id` vs `user_id`**: all *new* profile reads/writes (place-of-supply,
  `welcomed_at`, sweep lookup) key on `user_id`, the trigger-guaranteed auth link. The
  pre-existing premium-grant paths in `verify-payment` and the frozen webhook use
  `.eq('id', user_id)`; those are out of scope (premium-grant logic must stay
  byte-identical / webhook frozen) and were left untouched.
- The renewal sweep emails only invoices it issues this run; the first payment (already
  invoiced + emailed inline by verify-payment) is excluded by the anti-join, so no
  double-email.
- **Sweep is intentionally conservative**: it **skips + logs** any payment with no
  persisted place-of-supply (legacy payments, or before the DDL is applied) rather than
  guessing a CGST/SGST-vs-IGST split. So the founder's **already-charged ₹299** (made
  before this fix, with no region captured) will **not** be auto-invoiced by the sweep —
  it has no persisted region. Issue that one invoice manually via `issue_invoice()` in
  Studio with the correct place-of-supply if a formal invoice is required. Go-forward
  subscriptions capture region at checkout, persist it on the first payment, and their
  renewals invoice automatically.
- **Apply the DDL before relying on the daily sweep.** Until
  `NOTES-subscription-invoicing.sql` runs, the sweep skips all INR payments (no persisted
  region) and the welcome guard falls back to the client guard — both safe, just not yet
  active.
- The Code changes are deployed; the **`delete-account` edge function is NOT** (separate
  Supabase deploy, listed as a manual step). Until it is redeployed, delete confirmations
  still use the old silent path.
