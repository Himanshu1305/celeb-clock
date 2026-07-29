# Launch Final — Consolidated Prompt
# REPLACES docs/LAUNCH-ADDENDUM-PROMPT.md (which was never run).
# Save as docs/LAUNCH-FINAL-PROMPT.md, then: "Read docs/LAUNCH-FINAL-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/LAUNCH-FINAL-REPORT.md at the end.

Context: docs/LAUNCH-BATCH-REPORT.md shipped 8 fixes. Founder re-tested all of them.
Fixes 3,5,6,7,8 PASSED. Fix 2 (phase rendering) FAILED. Fix 4 (counts) was WRONG.
New findings below. This prompt closes everything remaining before production cutover.

HARD RULES: never modify api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts.
./node_modules/.bin/wrangler only. DDL → NOTES-*.sql, never executed here. Read before write.

---

# PART 1 — BLOCKERS (must ship before cutover)

## B1 — EMAIL FLOOD (highest priority: deliverability risk)

REPRODUCED: a new signup received the confirm email at 12:46, then THREE more at 12:47:
  "Kamlesh, your birthday just revealed something"
  "Your clock is ticking, Kamlesh — in the best way"
  "BornClock is live for you, Kamlesh ☀️"

Three near-identical marketing emails inside one minute from a young sending domain is a
spam-filter trigger. If bornclock.com's reputation degrades, GST invoice emails — a legal
requirement under Rule 46 — stop being delivered. This is not cosmetic.

1. grep -rn "sendWelcome\|welcome\|nurture\|drip\|sequence\|onboarding" src/ api/ --include="*.ts" --include="*.tsx"
   Read EmailService and every email-sending call site. Identify exactly which three
   templates fired and what triggered each.
2. Determine whether this is (a) one sequence intended to be spaced but firing at once,
   (b) three independent triggers all keyed to the same event, or (c) the Fix-3 welcome
   change now firing alongside pre-existing sends. Report the finding explicitly.
3. Fix so that AT MOST ONE email is sent per user event. On confirmed signup: exactly one
   welcome email. Any further onboarding messages must be scheduled (day 2, day 4, etc.)
   via the existing cron infrastructure, not fired inline. If scheduling infrastructure
   does not exist for this, DISABLE the extra sends rather than shipping the flood, and
   note it as deferred work in the report.
4. Add a guard: a per-user, per-template send-once check so a re-render or repeated
   SIGNED_IN event cannot re-trigger. Same discipline as the credit idempotency fix.

## B2 — PHASE-AWARE RENDERING STILL BROKEN (Fix 2 regression)

Founder confirms: after generating a report, "A peek inside" and the "A birthday gift
they'll actually keep" gift strip are STILL VISIBLE. The previous fix claimed to gate
these on phase !== 'success'.

Read src/pages/BirthdayReport.tsx fully. Find why the gate is not applying — likely the
phase variable is not what the gate checks, or the sections render outside the gated
block, or they live in a child component that does not receive phase.

Post-generation the page must show the success block ONLY: report link, Copy / Open /
WhatsApp / Email, "Generate another report". No pricing card, no "A peek inside", no gift
strip, no lock icon.

Verify by actually rendering the success phase and listing every section present.

## B3 — STALE ENTITLEMENT AFTER "GENERATE ANOTHER REPORT"

REPRODUCED: trial user generates their one free report, clicks "Generate another report",
and the card still reads "1 free report" — but the server correctly issues a LOCKED report.
A hard refresh then correctly shows ₹199. The card is lying until reload.

Fix: "Generate another report" must re-fetch /api/report-entitlement (built in the last
batch) before re-rendering the pricing card, so the state machine reflects the consumed
trial report. Do not cache the entitlement across generations.

## B4 — ONE CURRENCY, NOT BOTH

The card currently renders "₹199 / $6.99" simultaneously. A user should see ONE price in
their own currency.

See Part 2 (C1/C2) for the full currency work — this display bug is fixed as part of it,
but call it out separately in the report because it is founder-visible.

## B5 — SECTION COUNT IS 9, NOT 10

The last batch set REPORT_SECTION_COUNT=10. The actual generated PDF contains NINE
numbered sections: 01 TWINS, 02 ASTROLOGY, 03 NUMBERS, 04 NAME, 05 ARCANA, 06 TALISMAN,
07 COSMOS, 08 ERA, 09 CYCLES. The cover is not a section.

Read the report renderer, count the sections it actually emits, and set the constant to
the true value. Paste the enumerated list as evidence in the report. Then confirm every
surface referencing it updates (pricing card, showcase, /pricing, both nudge emails, FAQ).

## B6 — PLANET COUNT: INCLUDE EARTH, SAY 8

FOUNDER DECISION: the Solar System Ages section currently renders 7 planets (Mars, Venus,
Saturn, Uranus, Jupiter, Mercury, Neptune) while some copy says 8.

Resolve by ADDING Earth to the section — the user's Earth age already exists on the cover
(e.g. "43 Years Old"), so the data is available. Render Earth as the first card so the
section reads as a complete tour starting from home. Set PLANET_COUNT=8 and align all copy.
Also fix the standalone Planetary Age tool the same way so the two agree.

---

# PART 2 — PRICING, CURRENCY, NAVIGATION

## C1 — PRICING PARITY: ONE SOURCE OF TRUTH

Founder found /upgrade and /pricing showing DIFFERENT prices, and /upgrade omitting annual
plans entirely.

1. grep -rn "299\|2499\|2,499\|39.99\|4.99\|6.99\|199\|plan_T" src/ api/ --include="*.tsx" --include="*.ts"
   Read every file found; map where each number lives today.
2. Create src/lib/pricing.ts as the SINGLE source:
   - Subscription monthly: INR 299 / USD 4.99
   - Subscription annual:  INR 2499 / USD 39.99
   - One-time report:      INR 199 / USD 6.99  (label: "Launch price")
   - Credits: 3/month, cap 9, carry-forward
   - Razorpay plan IDs (live dashboard):
       plan_T7ppISx7AUnHVE  Premium Monthly        INR 299
       plan_T7pqpODIo107Bp  Premium Annual         INR 2499
       plan_T9K6U90fwpqrIg  Premium Monthly Global USD 4.99
       plan_T9K7XDk2tx8Q0h  Premium Annual Global  USD 39.99
     If these already live in env vars (VITE_RAZORPAY_PLAN_*), REFERENCE those rather
     than duplicating.
   - Derived helpers: annual saving vs monthly, per-month equivalent of annual
3. Refactor every pricing surface to read from it: /pricing, /upgrade, upgrade modal,
   BirthdayReportShowcase, BirthdayReport card, ReportView paywall, Profile, FAQs, emails.
4. /upgrade MUST show annual alongside monthly with the saving stated, matching /pricing
   exactly.
5. Re-grep afterwards and report any hardcoded prices that survived.

## C2 — CURRENCY: ONE CURRENCY, OVERRIDE, CONSISTENCY, VISIBILITY

The founder is in India and can never see USD pricing, so the entire global revenue path
is untested.

**C2a — Investigate first.** grep -rn "currency\|ipapi\|country_code\|bc_country_code" src/ api/
Document in the report exactly where currency is decided, what drives it, and how it
reaches create-order.

**C2b — Display ONE currency.** Never render "₹199 / $6.99" together. Show the price for
the user's resolved region only.

**C2c — Override for testing.** Add `?currency=USD` / `?currency=INR` forcing display AND
checkout currency for the session (persist in sessionStorage, works on every priced page).
Additionally, for admin-role users, a small currency toggle so pricing can be reviewed in
both currencies without a VPN. Admin-only, never visible to normal users.

**C2d — Region is authoritative at checkout.** Currently ipapi picks currency while
CheckoutRegionModal separately asks country. These can disagree, producing e.g. a USD
payment carrying a CGST/SGST Telangana invoice — a broken invoice AND a wrong tax
treatment. Make the confirmed region selection drive BOTH:
    India      → INR, taxMode CGST_SGST (Telangana) or IGST
    not India  → USD, taxMode EXPORT
ipapi may PRE-SELECT the modal; the user's confirmed choice wins. If the confirmed region
implies a different currency than was displayed, the modal must show the corrected price
before Razorpay opens.

**C2e — Track it.** Add `currency` and `tax_mode` as properties on the existing funnel
events checkout_opened and purchase_completed (analytics_events / useAnalytics.trackFunnel).
Then add to the admin Business Metrics tab: revenue and purchase counts split by currency,
and a count of EXPORT-mode invoices. This is how a broken global checkout gets noticed in
days rather than months.

## C3 — NAVIGATION: REMOVE DUPLICATION FROM EXPLORE

1. Read src/components/Navigation.tsx fully; enumerate in the report every link in the
   main bar, More, Explore, and the footer Explore block.
2. Explore keeps ONLY destinations appearing nowhere else in the header — hub/discovery
   pages: /born-on/india, /answers, zodiac hubs, born-on date pages, compatibility.
3. Remove from Explore anything duplicated in the main bar or More.
4. Leave the footer Explore block as-is (footer duplication is normal and SEO-useful).
5. Report before/after link lists per menu.

## C4 — /birthday-report INTO THE MAIN NAV

- Add "Birthday Report" to the MAIN nav bar (it is the paid product and is currently buried).
- Remove "Planetary Age" from the main bar; relocate to More or Explore (no duplication).
- Mirror the change in mobile nav. Confirm no internal links to /planetary-age break.

---

# PART 3 — SMALLER ITEMS

## D1 — FREE-USER CREDIT ROW SHOULD UPSELL

/profile currently shows a free user "Report credits: 0 of 9 · 3 added monthly · unused
credits carry forward · max 9". Showing a zero balance with mechanics they do not have is
confusing.

For users WITHOUT an active subscription, replace that row with an upsell:
  "Premium members get 3 report credits every month — unused credits carry forward, up to 9."
  with the existing Upgrade CTA.
Keep the numeric balance row for active subscribers only.

## D2 — SIGN-OUT SCOPE

Founder reports signing out in one browser signs him out everywhere. Supabase signOut()
defaults to scope 'global', revoking refresh tokens on all devices.

Read the signOut call in useAuth.ts. Change to `signOut({ scope: 'local' })` so sign-out
affects only the current device — the expected consumer behaviour. Note in the report that
a global sign-out remains available for a future "sign out everywhere" feature.

## D3 — PDF LAYOUT: INDENTATION CHECK

The founder flagged inconsistent indentation in the generated PDF. Inspect the rendered
report — particularly the Moon Sign and Nakshatra sections, where body paragraphs appear
indented relative to their section headings and to other sections' body text.

Render a real report, examine the section body alignment across ALL nine sections, fix any
inconsistency, and report which sections were misaligned and what the fix was.

---

## GATE
1. tsc -p tsconfig.app.json --noEmit → 46 baseline, 0 new
2. npm run build → 1313+ ok, 0 failed
3. launch gauntlet if runnable; else note skipped
4. git diff: _crypto.ts, razorpay-webhook.ts, verify-payment.ts ALL untouched
5. Live smoke: create-order report_slug "zzzzzzzz" → {"error":"Report not found"}
6. Deploy once

## REPORT
docs/LAUNCH-FINAL-REPORT.md must include:
- B1: which three emails fired, what triggered each, and the exact fix
- B2: why the previous phase gate failed, and the full list of sections rendered in success phase
- B5: the enumerated true section list
- C2a: the currency-decision findings
- C3/C4: before/after nav link lists
- D3: which sections were misaligned
- Founder re-test checklist

Commit: "feat: launch final — email throttle, phase gate, pricing single-source, currency, nav"
