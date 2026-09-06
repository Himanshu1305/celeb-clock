# Product Batch 4 — AI Coach, Longevity Blueprint SKU, Occasion Emails, Referrals
# Save as docs/PRODUCT-BATCH-4-PROMPT.md → "Read docs/PRODUCT-BATCH-4-PROMPT.md and execute"
# RUN ONLY AFTER SEO-MAGNET-3 COMPLETES. This batch touches money/credits — maximum care.

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/PRODUCT-BATCH-4-REPORT.md.

FOUNDER DECISIONS (locked — do not re-litigate; values may be amended by a
DECISIONS section appended below before running):
- Coach: free users 5 messages/month; unlimited folded into existing Premium
  (₹299/$4.99). No new tier.
- Longevity Blueprint: ₹299 / $9.99 one-time, "Launch price" label, 7-day
  money-back guarantee, GST-invoiced like the Birthday report.
- Referral: 1 report credit to BOTH sides; credited only after the referred user
  confirms email AND generates their first report; cap 5 referral credits/month
  per referrer.
- Occasion emails: 10 days and 2 days before saved birthdays; only to users with
  email_notifications enabled; one email per occasion per window (send-once).

HARD RULES: api/_crypto.ts and api/razorpay-webhook.ts NEVER touched.
api/verify-payment.ts: ONE narrow exception — a new product branch for
'longevity_blueprint' may be ADDED alongside the existing branches; the HMAC
check, existing branches, and the invoice block's existing behaviour remain
byte-identical except the minimal addition; paste the diff hunks in the report.
All credit grants/decrements go through service-role Postgres functions
(the redeem_report_credit / issue_invoice discipline). DDL → NOTES-*.sql.
Every money-adjacent path: idempotent, non-fatal where it must never block,
tested positive/negative/edge. ONE deploy at the end.

## PHASE A — UNIFIED BORNCLOCK COACH
Read the existing AI Longevity Coach implementation fully (entitlement gating,
API call pattern, ANTHROPIC_API_KEY is already a Worker secret). Build one
"BornClock Coach" surfaced in four contexts, each priming the model with that
context: (1) longevity results (existing, refactored in), (2) birthday
report/chart chat on unlocked reports, (3) rhythm/fitness check-in on
/energy-forecast + /my-rhythm-adjacent surfaces, (4) a general /coach page.
Metering: server-side counter (profiles column or small table — DDL via NOTES;
tolerate-absent pattern until applied): free = 5 messages/calendar-month,
Premium/trial = unlimited. Counter check is atomic server-side (the welcomed_at
claim pattern) — client cannot bypass. At limit: friendly upsell inline
(currency-aware, links /upgrade). System prompts: honesty register mandatory —
Coach never makes medical/predictive claims; carries the same disclaimers as the
report; refuses medical diagnosis gracefully. Log token usage per message
(analytics event) so cost is observable in admin later. Tests: metering
decrement, limit block, premium bypass, refusal framing smoke.

## PHASE B — LONGEVITY BLUEPRINT (paid SKU #2)
Read how Birthday Blueprint works end to end first (generation, storage/unlock
on birthday_reports.is_paid, paywall, verify-payment branch, invoice line item,
PDF email). Mirror the pattern with maximum reuse:
- Content: 6-8 sections from EXISTING engines only (bio-age estimate, life
  expectancy drivers, What-If scenarios summary, 57-country comparison, habit
  plan in the honesty register, rhythm outline). No new science claims;
  estimates framed as estimates; report-footer disclaimer.
- Storage/unlock: prefer reusing the birthday_reports table with a report_type
  column (DDL via NOTES, tolerate-absent) over a new table — read and decide;
  justify in the report. Slug-shareable with preview-lock like Birthday.
- Pricing: create-order gets product 'longevity_blueprint' (29900 paise /
  999 cents) from src/lib/pricing.ts (single source — add the constant).
- verify-payment: the narrow-exception branch unlocks it and the invoice block
  invoices it (line item "BornClock — Longevity Blueprint"). Region modal same
  flow. Subscriber credits: DECISION — credits apply to Birthday reports only
  for now (do not extend redeem to the new SKU); paywall copy must not promise
  credits for it.
- Surfaces: /longevity-blueprint landing (SEO'd, share bar, honest), CTA from
  life-expectancy results + /pricing third card area (read layout, integrate
  without crowding), nav under More.
- Tests: paywall shows, order amount correct both currencies, unlock on
  simulated success path stops AT the region modal in e2e (never complete a
  payment; counters must stay untouched — paste proof).

## PHASE C — OCCASION EMAILS (birthday reminders)
Sources of birthdays: family_members table + subjects of the user's own saved
reports (read schemas). Daily cron branch (existing 6am scheduled()) computes
upcoming birthdays at exactly 10 and 2 days out for users with
email_notifications=true; sends "{Name}'s birthday is in 10 days" with a warm
gifting CTA (currency-aware price, their report link if one exists for that
person). SEND-ONCE per (user, person, birthday-year, window) via a small
occasion_sends table (DDL NOTES, tolerate-absent → cron no-ops with log until
applied). Unsubscribe honours existing preferences; every email includes the
standard footer. Test: the window math (10d/2d boundaries, year rollover,
Feb 29 → Feb 28/Mar 1 policy — pick one, state it), send-once idempotency.

## PHASE D — REFERRAL PROGRAM
Give-get per the locked decision. Mechanics: referral code = short slug per
user (profiles column, DDL NOTES); share surfaces on /profile + post-purchase
success + report success block (reuse SharePageBar). Attribution: ?ref= captured
at signup, stored on the referred profile. GRANTING: a service-role Postgres
function grant_referral_credits(referred_user_id) — atomic, idempotent (unique
constraint on referred_user_id: one referral reward ever per referred user),
enforces: referred email confirmed + first report generated + referrer under
the 5/month cap + no self-referral (same email/user). Called from save-report's
server path on first report (non-fatal). Credits granted via the same guarded
column-update discipline as get-credits (respect cap 9 total). UI: referral
card on /profile with code, link, count, credits earned. Tests: happy path,
self-referral blocked, second-report no double grant, monthly cap, cap-9
interaction.

## GATE
tsc 45/0 · build (report exact count; +~2 pages) 0 failed · test:prelaunch
green + all new suites · frozen files: _crypto + webhook empty diff;
verify-payment diff hunks pasted showing ONLY the additive branch ·
invoice_counters untouched (paste) · ONE deploy · sentinel OK.

## REPORT
Diff hunks first · every NOTES-*.sql for Studio (list prominently) · Coach
metering + refusal evidence · Longevity Blueprint storage decision · occasion
window policy · referral guard evidence · founder task list: apply DDL, review
Coach tone in 3 sample chats, review Blueprint landing copy, test referral
end-to-end with two accounts, and the standing re-tests.

## AMENDMENTS (binding — apply throughout)

A1 — FIX-LOOP POLICY: identical to docs/TEST-SUITE-PROMPT.md — classify, fix
product bugs, re-run affected then full suites, max 3 iterations, never weaken
an assertion. Money-adjacent phases (A, B, D) additionally re-run their own
suite AFTER the final full-set run as a last check.

A2 — PHASE A COST & ABUSE GUARDS: per-message max_tokens cap (~700 output),
input truncation for pasted walls of text, rate limit ~10 messages/minute per
user server-side, and a per-day hard cap even for Premium (e.g. 200/day) as a
runaway guard — generous enough that no real user hits it. Choose the
cost-appropriate Claude model for chat (not the largest); state the choice and
estimated cost/message in the report. Log tokens per message to analytics.

A3 — PHASE B PRICING PAGE LAYOUT: /pricing currently shows 3 cards. Integrate
the Longevity Blueprint without crowding — either a 2x2 grid or a "One-time
Reports" row holding both Blueprints; choose what matches the existing design
system, show both report SKUs with equal visual weight, and keep the free/
premium comparison table untouched.

A4 — PHASE C DATE POLICY: all occasion-window math in IST (Asia/Kolkata) on
date-only values — the user base is India-first and birthdays are date-only
facts. State this in code comments and the report. Feb 29 policy: remind on
Feb 28 in non-leap years.

A5 — PHASE D CAPTURE POINT: the ?ref= code must survive the email-confirmation
round-trip (capture to localStorage at first visit AND pass through the signup
call server-side; attribute on the server at account creation, never from
client claims post-hoc).
