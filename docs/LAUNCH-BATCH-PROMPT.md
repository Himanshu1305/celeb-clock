# Launch Batch Fix — Claude Code Prompt
# Save as docs/LAUNCH-BATCH-PROMPT.md, then: "Read docs/LAUNCH-BATCH-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.

Produce docs/LAUNCH-BATCH-REPORT.md at the end: every file changed, evidence per fix,
before/after for every copy string, gate results, anything needing manual attention.

Context: four-persona paywall testing is complete and the gate logic is correct.
Everything below is UX, copy accuracy, and one invoice tweak — deferred deliberately
during testing and now batched. Read docs/PAYWALL-FIX-REPORT.md and
docs/GST-BUILD-REPORT.md first for what already exists.

HARD RULES (unchanged):
- NEVER modify api/_crypto.ts, api/razorpay-webhook.ts, or api/verify-payment.ts
- ./node_modules/.bin/wrangler only, never npx wrangler
- DDL goes to supabase/migrations/NOTES-*.sql, never executed here
- Read-before-write on every file; grep first

---

## FIX 1 — THE PRICING CARD IS A STATE MACHINE (highest value fix)

The card on /birthday-report currently shows near-static content regardless of who
is looking at it. It must show the user their actual position BEFORE they fill in
the form, so they can decide. A transient toast after the fact is not this.

Read src/pages/BirthdayReport.tsx fully, plus useAuth.ts and trialUtils.ts for the
state inputs, and api/get-credits.ts for the balance.

Implement exactly five states. Compute trial status and free-report-used from the
SERVER where possible (a client-only flag must never gate money); for display it may
read the client state, but the actual grant remains server-enforced in save-report.ts.

| State | Card headline | Sub-line | CTA |
|---|---|---|---|
| Trial, free report unused | "1 free report" | "Included in your trial · N days remaining" | Create Now |
| Trial, free report USED | "₹199 / $6.99" | "Launch price · your free trial report has been used" | Create & unlock |
| Active subscriber, credits > 0 | "N report credits available" | "This report uses 1 · N−1 remaining after" | Create Now |
| Active subscriber, 0 credits | "₹199 / $6.99" | "Launch price · no credits left this month" | Create & unlock |
| Free / post-trial | "₹199 / $6.99" | "Launch price" | Create & unlock |

To know whether a trial user has used their free report, add a lightweight read:
count birthday_reports where user_id = X and unlock_source = 'trial'. Reuse the
existing get-credits endpoint shape or add a small api/report-entitlement.ts that
returns { trialReportUsed, credits, isTrial, trialDaysRemaining } in one call —
prefer ONE endpoint over several client round-trips.

Keep the success toast on redemption (it is good confirmation), but the balance must
also be visible on the card before generating, and in the report header.

## FIX 2 — PHASE-AWARE RENDERING ON /birthday-report

The page stacks every phase in one scroll: pricing card, marketing sections, form,
and success block, none conditional. After generating, the user still sees a sales
pitch for the thing they just made, plus a lock icon reading "Generate a report to
unlock the full view".

Restructure to phases driven by existing component state:
- PRE-GENERATION: pricing card (Fix 1) → form → "A peek inside" → "A birthday gift
  they'll actually keep"
- POST-GENERATION: success block (report link, Copy/Open/WhatsApp/Email, "Generate
  another report") ONLY. Hide the pricing card, "A peek inside", and the gift-occasion
  strip entirely.

Do not delete those sections — gate them on the phase.

## FIX 3 — WELCOME EMAIL FIRES TOO EARLY

Reproduced: signup sends BOTH "Your BornClock account is one tap away" (confirm) and
"Welcome to BornClock" simultaneously. The user is welcomed, then refused at login
with "Email not confirmed".

grep for the welcome email trigger (likely EmailService / useAuth.signUp / a Supabase
auth hook). Move it to fire on the CONFIRMATION event, not on signup. If Supabase
handles confirmation server-side and no app-side hook exists, trigger it on first
successful post-confirmation session instead, guarded by a flag so it sends once.

Do NOT remove email confirmation — it is load-bearing: it gates the trial free report
against throwaway-address abuse, and invoices are emailed to that address.

## FIX 4 — COUNTS DISAGREE ACROSS SURFACES (derive, don't hand-write)

Three different numbers are stated in three places and they conflict:
- pricing card: "11 personalised sections", "Age on all 7 planets"
- nudge email (report-locked): "full 10-section Blueprint", "Planetary ages across all 8 planets"
- showcase: "20+ page keepsake report" — a real generated PDF measured ~19 pages

Establish single constants (e.g. src/lib/reportFacts.ts): REPORT_SECTION_COUNT,
PLANET_COUNT, and an honest page descriptor. Determine the TRUE values by reading the
report renderer — count the actual rendered sections and the actual planets in the
Solar System Ages section (evidence: a real PDF rendered Mars, Venus, Saturn, Uranus,
Jupiter, Mercury, Neptune = 7). Then reference the constants from every surface:
pricing card, showcase, /pricing, nudge email, any FAQ.

For page count, stop claiming "20+" unless the renderer guarantees it. Prefer the
section count, which is exact and always true.

## FIX 5 — MOON SIGN OVERCLAIMS PRECISION

In the report, the Moon Sign explainer states the moon sign is "determined by the
position of the Moon at the exact moment of your birth — not just the date, but the
hour", then confidently outputs a moon sign from a DATE-ONLY input. No birth time is
collected anywhere in the product.

The Nakshatra section already handles this honestly: "Nakshatra approximated from
lunar cycle position at date of birth."

Apply the same treatment to Moon Sign: add an equivalent approximation caveat AND
soften the explainer so it does not promise hour-level precision the product cannot
deliver. Read both sections and match the existing tone.

## FIX 6 — PLURALISATION BUG IN ZODIAC COPY

"FAMOUS SAGITTARIUSS" appears in the report (Western Zodiac section). Find the
pluralisation logic — likely `${sign}S` or similar naive concatenation — and fix it
for ALL TWELVE signs. Check each: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra,
Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Several are irregular. Prefer an
explicit map over a rule. Paste the rendered label for all twelve as evidence.

## FIX 7 — INVOICE: DROP THE DUPLICATED ADDRESS

src/lib/invoice-generator.ts renders the registered office address TWICE — in the
SUPPLIER block and again in the footer. Remove it from the SUPPLIER block; keep the
footer line only. The supplier block keeps: legal name, GSTIN, LLPIN, State (36),
"Registered with limited liability".

Rule 46 and LLP Act s.21 are both satisfied by the footer occurrence.

## FIX 8 — HANDLE THE NEW not_owner RESULT

public.redeem_report_credit() now returns { ok:false, error:'not_owner' } when a
user tries to spend a credit on a report they do not own (report links are public
and shareable). Read api/redeem-credit.ts and handle this case explicitly: return a
clean 403-shaped response, and on the client fall through to the normal paywall
WITHOUT logging it as an unexpected error.

---

## GATE (all must pass before commit)

1. tsc -p tsconfig.app.json --noEmit → 46 baseline, 0 new
2. npm run build → 1313+ ok, 0 failed
3. launch gauntlet if runnable locally, else note skipped
4. git diff: confirm _crypto.ts, razorpay-webhook.ts, verify-payment.ts ALL untouched
5. Local + live smoke: /api/create-order with report_slug "zzzzzzzz"
   → MUST return {"error":"Report not found"}. A prior report described this
   response changing shape — verify and report the exact body.
6. Deploy once: ./node_modules/.bin/wrangler deploy

## REPORT

docs/LAUNCH-BATCH-REPORT.md with: per-fix evidence, the five pricing-card states
screenshotted or described with the exact strings rendered, all twelve zodiac plural
labels, before/after for every copy string, the true section/planet counts with the
file evidence they were derived from, and the founder re-test list.

Commit message: "feat: launch batch — entitlement-aware pricing card, phase rendering, copy accuracy, invoice dedupe"
