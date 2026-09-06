# Batch 7 — Content Depth, Compatibility Pages, Admin Fixes, Reminders, Feedback
# Save as docs/BATCH-7-PROMPT.md → "Read docs/BATCH-7-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/BATCH-7-REPORT.md.

## GROUND RULES

CONTEXT: BornClock is LIVE with paying customers.
FROZEN: api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts — never
touched, no exceptions in this batch.
DDL → NOTES-*.sql only. ./node_modules/.bin/wrangler only. tsc 45 baseline, 0 new.
ONE deploy at the end.

FIX-LOOP POLICY (binding): classify every failure — (a) PRODUCT BUG → fix, re-run
that suite, then the full set; (b) TEST BUG → fix the test, justify with evidence;
(c) FROZEN-FILE → blocker finding, leave red; (d) ENVIRONMENT → retry, note flaky.
Max 3 iterations per failure. NEVER weaken an assertion, broaden a selector, add
a sleep, or delete a test to go green.

CONTENT-ASSERTION RULE: the SPA fallback returns 200 for any path — page tests
assert route-specific CONTENT (title/h1) and canonical ≠ homepage. A GATE claim
that pages exist MUST be backed by the build count arithmetic: state expected
count, achieved count, and reconcile any difference explicitly. (A prior batch
claimed 78 pages that were never prerendered; the count mismatch went uncaught.)

EMAIL SAFETY: no test emails real users — *@bornclock-test.invalid or ADMIN_EMAIL
only.

TRIAGE ORDER if the session runs long (drop from the bottom):
 P1 (redirect fix) > P2 (admin fixes) > P3 (compatibility pages) > P4 (/gift
 redo) > P5 (/coach redo) > P6 (months hub) > P7 (renewal reminders) > P8
 (feedback system) > P9 (energy-forecast + blog spacing) > P10 (planets weight).
Finish or skip cleanly; never ship a half-done phase.

WRITING QUALITY BAR (applies to P3, P4, P5, P9, P10): the founder rejected the
previous /gift and /coach pages as "too thin, too bad." Before writing ANY page
copy in this batch, use WebSearch to study 2-3 strong references for that page
type (named in each phase). Every content page must have: a 40-60 word direct
answer under the H1 (specific, honest hedge in the same breath); 600+ words of
genuinely page-specific prose (not templated filler); question-form H2s; 5-6
real FAQPage entries; emotional or practical stakes appropriate to the page;
internal mesh links; share bar; one clear CTA. Thin pages will be rejected again.

---

## P1 — /rising-sign-calculator REDIRECT IS BROKEN (founder-verified 404)

Batch 5 claimed a Worker 301 → /moon-sign tested green; live returns 404. The
URL is in Google's index and was IndexNow-pinged — a 404 wastes that signal.
Find why the redirect isn't firing in production (route order in the Worker?
asset-first handling swallowing it?), fix, and add a LIVE assertion (fetch the
production URL post-deploy, expect 301 + location /moon-sign) so a passing test
means the real thing.

## P2 — ADMIN DATA-ACCESS FIXES (two founder-verified issues)

Context: RLS admin-read policies EXIST and are applied for both invoices
(invoices_admin_read) and profiles (profiles_admin_read) — verified in Studio;
the data is present. Yet:
 (a) The Users section of /admin shows 6 users but NO details.
 (b) The GST revenue card (batch-2 overnight, Phase F) is not visible anywhere
     on /admin — founder checked.
Read the admin page's data fetching end to end. Likely suspects: querying
profiles on the wrong key (id vs user_id — a known past trap), using a client
without the user's JWT (RLS sees anon), or the card component never mounted on
a rendered tab. Fix both; assert: an admin sees email/status/created for all
users, and the GST card renders the real numbers (1 purchase / ₹199 / INR).
State the root cause of each plainly in the report.

## P3 — 78 REAL COMPATIBILITY PAIR PAGES (they do not exist)

SEO-MAGNET-3 reported these shipped; the build count (+1 that batch) proves they
were never prerendered as pages. Build them properly now:
- /compatibility/{signA}-{signB} for the 78 unordered canonical pairs; Worker
  301s for the 66 reverse orders → canonical.
- Generated from ONE data module (zodiac traits/elements/modalities + a curated
  per-pair overrides layer) so a change to any sign propagates to all its pair
  pages on rebuild — zero hand maintenance. State this architecture in the report.
- Each page (quality bar applies): overall score answered in the first sentence;
  love / friendship / work sections with pair-specific composed prose (element ×
  modality reasoning, not adjectives); "(Western Zodiac)" labelling + the
  Western-vs-Vedic clarifier + that FAQ entry (carry over from the calculator);
  links to both zodiac hubs, the calculator, /birthday-report.
- Thin-content guard: diff two same-element pairs in the report; they must
  differ meaningfully.
- WebSearch references first: study how 2-3 leading compatibility pages
  structure pair content (e.g. Cafe Astrology-class) — structure only, never
  copy text.
- Sitemap + prerender + IndexNow. Build count +78; reconcile in the gate.

## P4 — /gift FULL REDO (founder rejected the current page)

The business truth this page must embody: people gift a Birthday Blueprint to
SHOW love, care and genuine knowing — that is the only reason it sells. The
current page has none of that.
- WebSearch first: study 2-3 strong emotional-gifting product pages (personalised
  gift brands, e.g. Birthdate Co-class landing pages, premium personalised-book
  sellers) for how they sell the FEELING, not the object. Structure and
  psychology only — never copy text.
- Rebuild on the conversion skeleton (hero with emotional hook + price + CTA →
  the "gift cards say I remembered; this says I know you" problem → what the
  recipient receives, plainly → visual/sample → occasions (milestone birthdays,
  parents, partners, long-distance) → testimonial placeholder (clearly marked,
  DO NOT invent) → objections: instant delivery, 7-day guarantee, permanent
  access → repeat CTA → FAQ) — but the COPY must carry real emotional weight:
  specific moments (a father reading his own story, a friend abroad opening it
  on the day), warm and sincere, never saccharine or manipulative.
- Honest framing intact: a keepsake and conversation starter, never prediction.
- Add "Gift a Report" to the nav (More menu at minimum) and the footer — the
  page is currently unreachable by menu.

## P5 — /coach FULL REDO (founder rejected the current page)

Intent: motivate action on health, with gentle urgency about the unknowns —
never fear-mongering — and show concretely what the Coach helps with: making
sense of YOUR numbers, everyday food choices, exercise timing, habit building.
Plus the privacy guarantee, prominently: conversations are never stored — close
the tab and it's gone (this is true; the zero-retention contract is in code).
- WebSearch first: study 2-3 AI health-coach landing pages for structure and
  what claims they make vs what we honestly can (we explain and encourage; we
  never diagnose — say so as a trust feature, not fine print).
- Who gets it (trial + Premium), currency-aware pricing, CTA into the
  life-expectancy flow, FAQ, share bar.
- Add /coach to the nav (More menu) and footer — currently unreachable.

## P6 — MONTHS HUB + DISCOVERABILITY

The 12 /born-in-{month} pages exist but nothing links to the set. Build
/born-in (or /birthday-months — pick the better slug, justify): a hub listing
all 12 months (birthstone, zodiac span, one-line hook each), answer-first intro,
FAQ schema. Link it from Explore + footer; link each month page back to the hub.
Build count +1.

## P7 — SUBSCRIPTION RENEWAL REMINDERS (deferred from batch 6 — full spec in
docs/BATCH-6-REPORT.md; implement as specced there)
Key points binding: next-charge date from the Razorpay API
(GET /v1/subscriptions/{id} → current_end), premium_until only as marked
fallback; annual 7d / monthly 2d before, IST date-only; visible manage/cancel
link; daily-cron with a cheap pre-filter (premium_until within ~9 days) before
API calls; SEND-ONCE via reminder_sends (DDL → NOTES-renewal-reminders.sql,
tolerate-absent → cron no-ops with a log); active subscribers only; mock
Razorpay in tests.

## P8 — FEEDBACK & RATING SYSTEM (deferred from batch 6 — full spec in
docs/BATCH-6-REPORT.md; implement as specced there)
Key points binding: reuse/extend user_reviews (read schema first; new columns →
NOTES-feedback.sql); engagement-gated prompt after unlock (≥50% scroll OR ≥45s
dwell), once per report, dismissal persisted server-side; 5 stars + optional
comment + consent checkbox DEFAULT UNCHECKED; idempotent upsert; admin Feedback
section with consented-only filter; NOTHING public this batch.

## P9 — TWO SMALL CONTENT FIXES
 (a) /energy-forecast: founder says too thin — bring it to the quality bar
     (it already has the honesty framing; deepen the explanation, the 7-day
     reading guidance, FAQs).
 (b) Blog post layout: excessive vertical padding between the share bar and the
     article start — tighten to match the rest of the site's rhythm; verify on
     2 posts.

## P10 — "HOW HEAVY ARE YOU ON OTHER PLANETS?" (fun page)

New page /weight-on-planets (or better slug): enter weight (kg/lb toggle) →
your weight on all 8 planets + the Moon, computed from surface gravity ratios
(real physics — cite the gravity values used). Make it FUN: playful copy,
share-worthy framing ("You're 38 kg on Mars"), share bar wired to share the
result, OG card, and a soft link to the planetary-age tool + /birthday-report.
Client-side only; nothing stored. Quality bar applies (this one's tone is
playful, not emotional). Build count +1. FAQ schema (real questions: why does
weight change, mass vs weight — a genuine AEO opportunity for a school-query
keyword space).

---

## GATE
1. tsc 45 baseline, 0 new
2. npm run build → expected 1339 + 78 + 1 + 1 = 1419 ok, 0 failed — state
   expected vs achieved and reconcile ANY difference (see CONTENT-ASSERTION
   RULE). Retry /todays-birthdays once if it flakes.
3. npm run test:prelaunch → gauntlet 135 + prelaunch (127 + new) all green
   under the fix-loop policy
4. LIVE post-deploy assertions: /rising-sign-calculator → 301 /moon-sign;
   /compatibility/aries-leo → 200 with pair h1; /gift and /coach reachable
   from nav; admin users show details (manual founder check listed)
5. Frozen files empty diff · invoice_counters unchanged (paste — expect
   BC 1002 / BN 1001 / BX 1001)
6. ONE deploy · sentinel {"error":"Report not found"} · IndexNow ping all new
   URLs

## REPORT — docs/BATCH-7-REPORT.md, in this order
1. FINDINGS: root causes for P1 and both P2 issues, plainly stated
2. Build-count reconciliation table
3. P3: the data-module architecture + the two-pair diff evidence
4. P4/P5: the reference pages studied (URLs) + what was borrowed structurally
5. P7: Razorpay-API happy-path evidence + NOTES SQL
6. P8: prompt UX + NOTES SQL + admin view
7. All NOTES-*.sql files listed prominently for ONE Studio session
8. Founder task list: apply DDL, editorial pass on /gift and /coach copy
   (the two pages he personally rejected — his sign-off required), spot-checks

---

# AMENDMENT — TEST MATRIX (binding; the gate is not green without these)

## T1 — DISCOVERABILITY SWEEP (one test, all new surfaces)
A single navigation.spec addition asserting every new/redone surface is reachable
from the UI, desktop AND 390px mobile: /gift (nav + footer), /coach (nav +
footer), the months hub (Explore + footer) and hub → each month → hub backlinks,
/compatibility → at least one pair page via a real link, /weight-on-planets
(place it under Explore or More — state where). No page in this batch may exist
only as a URL.

## T2 — PER-PHASE NEGATIVE + EDGE CASES
P3 compatibility:
 - same-sign pairs (aries-aries) render with sensible content — all 12 exist in
   the 78
 - /compatibility/leo-aries → 301 → /compatibility/aries-leo (test 3 reverse
   orders)
 - invalid slug (/compatibility/aries-dragon) → not-found state, NOT the SPA
   shell (content assertion)
P7 renewal reminders:
 - renewal date = today → no reminder (window already passed) — no crash
 - premium_until in the past but status active (drifted data) → no reminder, log
   line, no crash
 - Razorpay API 500/timeout → fallback path used AND marked; email still correct
 - user cancels between pre-filter and send → excluded (re-check status at send)
 - IST boundary: renewal at 00:30 IST relative to a UTC cron run — window math
   correct
P8 feedback:
 - rating then account deletion → delete flow unaffected (FK/cascade verified
   against the delete-account hardening)
 - dismiss → new session → still dismissed (server-side, not localStorage)
 - comment at max length; comment with HTML/script content → stored inert,
   rendered escaped in admin (XSS negative)
 - consent unchecked → row excluded from the admin consented-only filter
P10 weight page:
 - 0, negative, and absurd (10,000 kg) inputs → clean validation, no NaN render
 - kg↔lb toggle: one known value asserted both ways (70 kg ↔ 154.3 lb) and one
   planet result verified against the cited gravity ratio (Mars 0.379 → 26.5 kg)
 - decimal input; empty input + submit
P2 admin (security negative):
 - a NON-admin authenticated user must NOT receive other users' profile details
   or the GST card data — assert the fetch returns empty/denied, not data. This
   is the most important test in the batch.
P1 redirect:
 - /rising-sign-calculator/ WITH trailing slash also 301s (both forms)

## T3 — GATE ADDITION
The report's test section must present the matrix as a table: phase → positive /
negative / edge → pass. Any cell not implemented is listed as SKIPPED with a
reason — silent omission of a listed case counts as a gate failure.
