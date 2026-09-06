# Batch 6 — Email Merge, Renewal Reminders, Month-Hub Indians, Feedback, Compatibility Nav
# Save as docs/BATCH-6-PROMPT.md → "Read docs/BATCH-6-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/BATCH-6-REPORT.md.

## GROUND RULES

CONTEXT: BornClock is LIVE with paying customers.
FROZEN: api/_crypto.ts and api/razorpay-webhook.ts are NEVER touched.
api/verify-payment.ts: ONE narrow exception in Phase 2 — changes confined to the
email-sending call sites only; HMAC check, unlock logic, premium grant, and the
issue_invoice call stay byte-identical. Diff hunks in the report as proof.
DDL → NOTES-*.sql only. ./node_modules/.bin/wrangler only. tsc 45 baseline, 0 new.
ONE deploy at the end.

FIX-LOOP POLICY (binding): classify every failure —
 (a) PRODUCT BUG → fix the app, re-run that suite, then the full set
 (b) TEST BUG → fix the test, justify with evidence
 (c) FROZEN-FILE → do not fix; record as blocker finding, leave red
 (d) ENVIRONMENT → retry; note as flaky if it passes
Max 3 iterations per failure, then report as FINDING. NEVER weaken an assertion,
broaden a selector, add a sleep, or delete a test to go green.

CONTENT-ASSERTION RULE: the SPA fallback returns 200 for any path — page tests
assert on route-specific CONTENT (title/h1) and canonical ≠ homepage, never
status alone.

EMAIL SAFETY (gate rule): no test may email a real user. Test sends go only to
*@bornclock-test.invalid or ADMIN_EMAIL. State in the report how this was
enforced.

TRIAGE ORDER if the session runs long (drop from the bottom):
 Phase 1 (month-hub Indians) > Phase 2 (email merge) > Phase 3 (renewal
 reminders) > Phase 5 (compatibility nav+label) > Phase 4 (feedback system).
Finish or skip cleanly; never ship a half-done phase.

---

## PHASE 1 — MONTH-HUB PAGES MISSING INDIAN CELEBRITIES (founder-verified bug)

/born-in-may (and every month checked) shows no Indians except Nehru. Same root
cause class as the fixed Jan-1 date-page bug: getRankedMonthCelebrities pulls the
GLOBAL top N, where Indians lose to global historical figures.

1. Read getRankedMonthCelebrities in BirthdaySearchService.ts and MonthHub.tsx.
2. Keep the global section IDENTICAL for all users (standing policy — no
   per-user reshaping).
3. ADD an "Indian celebrities born in {month}" section: nationality-filtered
   query using the canonical IN representation established in the Jan-1 fix,
   ranked among Indians by sitelinks, cap 12, reusing the existing celebrity-card
   component, each card linking to its /born-on date page.
4. Render only when ≥3 Indians exist for the month (no thin shells). With the
   backfilled sitelinks data every month should clear this — report the
   per-month Indian counts.
5. ACCEPTANCE (named, not counted): /born-in-may shows recognisable Indians
   beyond Nehru — paste May's top-12. Spot-check October (expect Gandhi,
   Amitabh Bachchan) and November (expect Shah Rukh Khan).
6. Prerender: all 12 month hubs rebuild with the new section.

## PHASE 2 — PURCHASE-EMAIL MERGE (narrow verify-payment exception)

Every purchase currently sends TWO emails: "Payment confirmed" and the invoice
email (PDF attached). Merge into ONE — and this applies to BOTH purchase types:
 (a) one-time report purchases, and
 (b) FIRST subscription payments (the founder's own test subscription produced
     the two-email experience).

1. Read verify-payment.ts and map exactly where each send originates for both
   product types. Read api/_invoice-email.ts and the confirmation template(s).
2. One merged email per purchase:
   - Report: subject "Payment confirmed — your BornClock invoice {invoice_no}"
   - Subscription: subject "Welcome to Premium — your BornClock invoice
     {invoice_no}" (or closely equivalent; product-appropriate body)
   - Body: the confirmation/receipt content (what they bought, the report link
     or premium welcome), invoice referenced, PDF (HTML fallback) attached —
     REUSE the attachment logic in _invoice-email.ts, do not duplicate it.
   - Branding header (logo + tagline) like the other templates.
3. FAILURE ISOLATION preserved: if invoice issuance fails, the customer STILL
   receives a confirmation email (without attachment). Invoice failure must
   never suppress purchase confirmation. State exactly how this branch works.
4. The renewal sweep (api/invoice-sweep.ts) sends invoice emails for renewals
   with no separate confirmation — leave the sweep's send untouched.
5. Exception boundary: only email-call sites in verify-payment.ts change. HMAC,
   unlock, premium grant, issue_invoice: byte-identical. Diff hunks in report.
6. Tests: exactly one email per simulated purchase path (both product types);
   the isolation branch (invoice fails → confirmation still sends) covered.

## PHASE 3 — SUBSCRIPTION RENEWAL REMINDER EMAILS

Context: RBI e-mandate rules mean Razorpay/issuers already send a pre-debit
notification ~24h before charging. Ours is the branded, warmer layer that cuts
chargebacks and "I forgot I subscribed" refunds.

1. SOURCE OF TRUTH for the next charge date: the Razorpay API —
   GET /v1/subscriptions/{subscription_id} → current_end (epoch). The Worker
   already holds RAZORPAY_KEY_ID/SECRET server-side. Do NOT trust
   profiles.premium_until as primary — it can drift from billing reality
   (grace periods, retries). Use premium_until only as a fallback when the API
   call fails, and mark fallback-sourced reminders in the log line.
2. Timing: ANNUAL plans → 7 days before current_end. MONTHLY → 2 days before.
   Computed in IST, date-only.
3. Content: plan name, amount (currency-aware from pricing.ts), the renewal
   date, and a VISIBLE manage/cancel link to the profile subscription section.
   No dark patterns — cancel is one click from the email.
4. Delivery: extend the existing daily cron. Batch the Razorpay lookups (only
   active subscribers, only those whose premium_until lands within the next ~9
   days — cheap pre-filter before hitting the API). SEND-ONCE per (user,
   current_end, window) via a reminder_sends table — DDL to
   NOTES-renewal-reminders.sql, tolerate-absent (cron no-ops with a log until
   applied in Studio).
5. Only subscription_status='active'. Cancelled-grace users get nothing.
6. Tests: window math (7d/2d, IST boundaries, month/year rollover), send-once
   idempotency, cancelled excluded, the fallback path marked. Mock the Razorpay
   API in tests — never call the real one.

## PHASE 4 — FEEDBACK & RATING SYSTEM

Purpose: product signal + the permissioned-testimonial pipeline for Product Hunt
and the /gift placeholder.

1. Read the existing user_reviews table schema FIRST (it exists — seen in the
   delete-account audit). Reuse/extend rather than a parallel table; new columns
   via NOTES-feedback.sql (tolerate-absent).
2. Collection trigger — engagement-gated, not instant: after a report UNLOCK
   (paid, credit, or trial), show the rating prompt only once the reader has
   genuinely engaged — scrolled ≥50% of the report OR ≥45 seconds dwell,
   whichever first. A prompt on arrival collects noise; a prompt mid-read
   collects signal.
3. The prompt: 5 stars + optional one-line comment + checkbox "You may feature
   my comment publicly" — DEFAULT UNCHECKED. Dismissible; once rated or
   dismissed it never shows again for that report (persist server-side, not
   localStorage).
4. Storage: server-side, tied to user + report slug, one rating per report per
   user (idempotent upsert — a second submission updates, never duplicates).
5. Admin: a Feedback section in /admin — ratings, comments, consent flag,
   average, filterable to consented-only (the testimonial pull). Follow the
   existing admin data-access patterns; any RLS policy needed → the NOTES file.
6. NOTHING public in this batch: no reviews widget, no auto-filling /gift. The
   founder curates manually from the consented list.
7. Tests: prompt appears only after the engagement threshold; exactly once;
   rating persists; consent stored; dismissal survives sessions; re-rating
   updates in place.

## PHASE 5 — COMPATIBILITY: NAV + WESTERN LABELLING

1. Discoverability: add "Compatibility" to the Explore dropdown AND the footer
   Explore block (currently in neither — verify and fix both, mobile included).
2. Labelling — the calculator and all 78 pair pages are WESTERN zodiac
   (element/modality). Say so explicitly:
   - H1/context line carries "(Western Zodiac)" or an equivalent; page <title>
     includes "Western" only where it fits within sensible length — one
     consistent rule, stated in the report.
   - One clarifying line on the calculator and every pair page: this uses the
     Western sun-sign tradition; Vedic matching (Ashta Koota / Guna Milan) is a
     different system based on Moon nakshatras.
   - Do NOT build the Vedic system in this batch, and no placeholder links to
     pages that don't exist.
3. FAQPage schema on pair pages gains: "Is this Western or Vedic compatibility?"
   with the honest answer.
4. Tests: nav presence (desktop + 390px viewport), the Western label renders on
   the calculator and one sample pair page.

---

## GATE
1. tsc 45 baseline, 0 new
2. npm run build → 1339 ok, 0 failed (no new pages; retry /todays-birthdays once
   if it flakes — known transient)
3. npm run test:prelaunch → gauntlet 135 + prelaunch (120 + new) all green under
   the fix-loop policy
4. git diff: verify-payment.ts changes confined to email-call sites (hunks
   pasted); _crypto.ts and razorpay-webhook.ts empty diff
5. invoice_counters unchanged — query and paste (expect BC 1002 / BN 1001 / BX 1001)
6. Email safety enforced (see ground rules) — stated in the report
7. ONE deploy · live sentinel {"error":"Report not found"}

## REPORT — docs/BATCH-6-REPORT.md, in this order
1. FINDINGS: bugs caught and fixed under the fix-loop
2. Phase 1: May top-12, October/November spot-checks, per-month Indian counts
3. Phase 2: diff hunks + the failure-isolation branch, both product types
4. Phase 3: confirmation that current_end came from the Razorpay API in the
   happy path, the fallback behaviour, window policy, NOTES SQL
5. Phase 4: the engagement-gate implementation, prompt UX, schema changes,
   NOTES SQL, the admin view
6. Phase 5: nav placements + the labelling rule used
7. All NOTES-*.sql files listed prominently for one Studio session
8. Founder task list (apply DDL, verify one merged email on the next real sale,
   review the feedback prompt wording, spot-check /born-in-may live)
