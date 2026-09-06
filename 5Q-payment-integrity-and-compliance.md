# Prompt 5-Q — Payment integrity, deletion compliance, lifecycle emails, policy amendments
DO NOT ask for approval for code. STOP only at the marked checkpoints. This touches PAYMENT CODE — maximum read-before-write discipline. Read docs/ARCHITECTURE-DECISIONS.md §2 lessons AND the full 5-P audit findings before any edit. Every task = its own commit. package.json/package-lock.json never staged. You have NO database credentials and NO Razorpay secrets locally — anything requiring them becomes a generated artifact (SQL file / test instruction) for the user.

PRE-MORTEM (write your own before starting, per our standing practice): list ways each task could silently produce wrong results and what surfaces each. Include at minimum: HMAC computed over a transformed body; idempotency key chosen wrong (event id vs payment id); RLS lockdown accidentally blocking legitimate server-role writes; deletion cascade order hitting FKs; grant-premium endpoint callable without a valid signature.

## PREFLIGHTS (paste raw outputs before any edit)
P1. Re-confirm from 5-P: file:line of (a) client-side premium grant, (b) webhook body handling, (c) deletion FK failure point.
P2. Subscription plan amounts: grep the pricing UI for displayed prices AND check whether plan amounts appear anywhere in code. Report what you find; anything not in code = NEEDS-USER (dashboard: Subscriptions → Plans). Also report the Birthday report's displayed price(s) and currency logic (₹199/$2.99 per audit).
P3. Verify or refute two policy claims: does any code transmit longevity quiz/health inputs to Supabase (grep quiz writes / health field inserts)? Is any analytics SDK actually integrated?
P4. Read the email templates inventory from 5-P; list which templates exist as code and their exact send functions.

═══════════════════════════════════════════
TASK 1 — payments table + RLS lockdown (SQL artifact for the user)
═══════════════════════════════════════════
Generate supabase/migrations/2026-07-payments-and-rls.sql containing, as INDIVIDUALLY RUNNABLE statements (user runs them ONE AT A TIME in Studio — write a comment header on each; our Studio lessons forbid multi-statement pastes):
1. CREATE TABLE payments: id, user_id (nullable — gift buyers may be anonymous later), razorpay_payment_id UNIQUE, razorpay_order_id, razorpay_subscription_id nullable, amount, currency, status, product ('birthday_report'|'subscription'), report_slug nullable, created_at. Plus an index on user_id.
2. CREATE TABLE webhook_events: event_id (Razorpay's id) PRIMARY KEY, event_type, payload jsonb, processed_at — the idempotency ledger.
3. RLS: payments + webhook_events — service role only (no anon/authenticated policies at all).
4. RLS LOCKDOWN on profiles: revoke the client's ability to write premium/subscription columns. Read the existing profiles policies FIRST (instruct the user to paste `select * from pg_policies where tablename='profiles';` output at the checkpoint) — then generate a column-safe approach: either (a) move premium_status/subscription_* to a new service-role-only table, or (b) a BEFORE UPDATE trigger rejecting changes to those columns when auth.role() != 'service_role'. Prefer (b) — smaller blast radius; justify if you choose otherwise.
⛔ CHECKPOINT A: hand the SQL + the pg_policies request to the user. Wait for "ran, verified" + the policies output before Task 3+ code assumes the new tables exist. (Tasks can be WRITTEN meanwhile; nothing merges to a state that requires the tables until confirmed.)

═══════════════════════════════════════════
TASK 2 — server-side payment verification endpoint
═══════════════════════════════════════════
New api/verify-payment endpoint: receives razorpay_payment_id/order_id/signature from the client checkout callback; verifies HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET); on success, using the service role: writes the payments row, grants the entitlement (premium flag or report unlock — parameterized by product), returns result. On failure: 403, log loudly, grant NOTHING. Client code: remove ALL client-side premium/entitlement writes (P1a) — the client now only calls this endpoint and reflects its answer. This is the core G1 fix paired with Task 1's lockdown.

═══════════════════════════════════════════
TASK 3 — webhook hardening
═══════════════════════════════════════════
1. RAW BODY: fix HMAC to compute over the raw request bytes (framework-specific — read how api/ functions receive bodies on this host and disable auto-parse for this route or use the raw payload; paste the mechanism you used).
2. IDEMPOTENCY: insert event_id into webhook_events before processing; on conflict → 200 and skip.
3. EVENTS: handle subscription.halted and subscription.paused (revoke/flag premium) alongside existing events. NEEDS-USER note: add these two events to the dashboard webhook subscription.
4. On subscription.activated/charged → send the premium-activated email (move the trigger here from wherever it currently fires). On cancelled/halted → cancellation/problem email.
5. Every handled event also upserts a payments row where applicable.

═══════════════════════════════════════════
TASK 4 — account deletion compliance
═══════════════════════════════════════════
Order of operations, all server-side (service role), in ONE endpoint: (1) fetch active razorpay_subscription_id if any → call Razorpay cancel-subscription API (tolerate already-cancelled); (2) delete reports (fixes the G8 FK by deleting children first — map the actual FK graph before coding); (3) delete email prefs/other child rows; (4) delete profile; (5) auth user deletion; (6) payments rows are RETAINED but user_id is set NULL + a deleted_user marker (legal retention with de-identification); (7) send deletion-confirmation email (to the address, post-deletion — compose before deleting). Update the deletion UI to warn about subscription cancellation.

═══════════════════════════════════════════
TASK 5 — transactional emails
═══════════════════════════════════════════
Using the existing Resend templates/pattern (P4): (a) payment receipt email — sent by api/verify-payment on success: product, amount+currency (fix the G4 hardcoded-₹ bug — use the payment's actual currency), date, and for report purchases the report link; (b) report-created email (the user's requirement) — on report generation, send the link; (c) wire premium-activated to the webhook (Task 3.4). Confirm the from-domain matches what Resend has verified (NEEDS-USER if not in code).

═══════════════════════════════════════════
TASK 6 — privacy policy amendments (content, precise)
═══════════════════════════════════════════
Amend the privacy page component (grep it):
1. "What We Do NOT Store → Saved forecasts or reports": reword to — life-expectancy calculations/results are never stored; Birthday Blueprint reports ARE stored (name, date of birth, generated content) because storage is required to deliver the shareable report and PDF; deleted with your account or on request.
2. NEW subsection "Gift recipients' data": when a user creates a report about another person, we store that person's name and date of birth solely to generate and deliver the report, on the purchaser's instruction; recipients may request deletion via privacy@bornclock.com.
3. "Deletion / Right to Erasure": add — transaction records are retained as required by tax and accounting law, de-identified from your profile.
4. Third-party table: add Resend (Purpose: transactional email; Data shared: name, email address).
5. Adjust the P3 findings if needed (analytics claim, health-inputs claim) to match verified reality.
6. Bump the "Last updated" date. NOTE in your summary that the user should have the final text professionally reviewed before scale — do not add that caveat to the page itself.

═══════════════════════════════════════════
TASK 7 — PDF download tracking (the small roadmap item)
═══════════════════════════════════════════
Add to the Task 1 SQL: a report_downloads table (report_slug, downloaded_at, user_id nullable) OR a downloads_count column on the reports table — choose based on the actual reports schema, justify. Wire the PDF export button to record it (fire-and-forget; must never block the export).

═══════════════════════════════════════════
VERIFICATION + ⛔ CHECKPOINT B
═══════════════════════════════════════════
npm run build clean; node scripts/verify-print.mjs 10/10 (report page changed — prove print unharmed). Then produce a MANUAL TEST CHECKLIST for the user against Razorpay TEST MODE (note: requires test-mode keys in env — spell out exactly which env vars to set where, and that the dashboard webhook needs a test-mode counterpart or use the Razorpay CLI/dashboard test-webhook feature): subscription purchase → premium via webhook only; tampered signature → 403, nothing granted; duplicate webhook delivery → single effect; halted event → premium revoked; deletion of a subscribed test user → cancelled at Razorpay + rows gone + payments row de-identified; receipt email received with correct currency. STOP after handing over this checklist; the user executes it and reports.

## WHAT TO PASTE BACK
Pre-mortem; all preflight outputs (incl. plan prices found or NEEDS-USER); per-task diffs summary; the SQL file; commit hashes; the manual test checklist.
