# Batch 9 — Founder Testing Findings: 12 Fixes & Improvements
# Save as docs/BATCH-9-PROMPT.md → "Read docs/BATCH-9-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/BATCH-9-REPORT.md.

## GROUND RULES
LIVE site, paying customers. FROZEN: api/_crypto.ts, api/razorpay-webhook.ts,
api/verify-payment.ts. DDL → NOTES-*.sql. ./node_modules/.bin/wrangler only.
tsc 45 baseline 0 new. ONE deploy at the end.

FIX-LOOP POLICY (binding): classify (product bug / test bug / frozen / env),
fix product bugs, re-run affected then full suite, max 3 iterations, NEVER
weaken an assertion. CONTENT-ASSERTION RULE: assert title/h1 + canonical, never
status alone. BUILD-COUNT RECONCILIATION: expected 1341 + 1 (/contact page) =
1342; reconcile any difference. EMAIL SAFETY: test sends only to
*@bornclock-test.invalid or ADMIN_EMAIL.

COMPLETE-ALL RULE: all 12 phases must be completed — the order below is
sequence, not permission to drop. A phase may halt only on a hard blocker after
3 documented fix iterations; the rest must still complete. If session end
threatens, commit finished work + write exact resume instructions. Never a
silent partial.

---

## P1 — DOB INPUT REGRESSION (critical — core input broken sitewide)
Founder-verified: typing ONE digit instantly zero-pads and advances — so 10-19
(days) and 10-12 (months) are UNTYPEABLE. This violates the built spec:
- Zero-pad happens ON BLUR ONLY, never mid-typing
- Auto-advance ONLY on: two digits entered, OR an unambiguous first digit
  (Day 4-9, Month 2-9). Day 1-3 and Month 0-1 WAIT for a second digit or Tab.
Fix the shared DobInput component (repairs all 13 surfaces at once). Then fix
the TEST that claimed to cover this: "no advance on 1 in Month" passed while
the behaviour was broken — find why (wrong event simulation? asserting the
wrong thing?) and make it fail against the broken build before fixing.
NEW TESTS: type "14" digit-by-digit lands 14 (no premature pad/advance); "12"
in Month works; "1" alone + Tab → 01 on blur; "31" in Day; paste "02051985";
existing edge set re-run (Feb 29/30, year 4-digit hard cap, backspace-return).
CALENDAR (founder request, secondary affordance): add a small calendar icon
beside the fields opening a date-picker with YEAR-FIRST navigation (year
dropdown/typeahead, then month, then day — never endless month-scrolling for
birthdates). Typing remains the primary path; picker fills the three fields.
Test: pick a 1985 date via the picker → fields populate → validation passes.

## P2 — STALE-CHUNK LOAD FAILURE (critical — /life-expectancy blank until refresh)
Diagnosis to verify: post-deploy, browsers holding the old index chunk request
lazy route chunks whose hashed filenames no longer exist → dynamic import
rejects → route renders nothing. With frequent deploys this hits real users on
every lazy route.
Fix: a lazy-import error boundary/retry — on chunk-load failure, force ONE full
reload (guard against reload loops via sessionStorage flag); if it fails again,
show a friendly "refresh to update" message. Apply to ALL lazy routes centrally
(the lazy() wrapper), not per-page.
Test: simulate a failing dynamic import (mock reject) → assert the one-time
reload path triggers, the loop-guard prevents a second, and the fallback
message renders on repeat failure.

## P3 — REPLACE THE OLD REVIEW WIDGET (founder re-verified: still broken UX)
"Share Your Experience" on /age-calculator is a PRE-batch-8 legacy widget
(mandatory title + text; button disabled without both). Grep for every instance
of this legacy widget/user_reviews form across src/. REPLACE all with the
batch-8 feedback component (stars-only valid, comment optional, sentiment
routing, two-key publication, engagement gating appropriate to a tool page —
on tool pages trigger after the user has a RESULT, not scroll depth). Remove
the legacy component + its dead code. List every surface swapped.
Tests: stars-only submits; the legacy mandatory-fields behaviour is GONE from
/age-calculator; a swapped surface writes to public.feedback.

## P4 — HOMEPAGE PLANETS SECTION LINK + DEDUPE
The "⚖️ How Heavy Are You on Other Planets?" homepage section links
/planetary-age; point it at /weight-on-planets. Then check /planetary-age for a
duplicated weight section — remove ONLY weight content there (its planetary AGE
content stays; the two pages remain separate concepts). Cross-link the two
pages to each other. Tests: homepage section href; no weight section on
/planetary-age; cross-links present.

## P5 — /weight-on-planets ENRICHMENT (fun register)
Add: per-planet fun-fact cards (Neptune diamond rain, Jupiter 2.4× crush, Moon
bounce, Mercury sprint-years...), a playful "which planet matches your fitness
era" bit, kid-friendly comparisons. Keep NASA-cited gravity values + the
mass-vs-weight FAQ. This page's job is SHARES: strengthen the share-result copy.
Quality bar applies; tone = witty, never snarky. Test: new sections render;
share text includes the computed result.

## P6 — COUNTRY-COMPARISON PRIVACY COPY (verify, then fix truthfully)
"Your Personalized Forecast — How Your Health Profile Plays Out in 57
Countries": READ the code first. Expected: it computes client-side from quiz
answers in session — nothing stored. Whichever is true:
(a) if client-side: the section renders ONLY when quiz data exists in-session;
    add one trust line: "Calculated from the answers you just entered — nothing
    is saved." If no quiz data: show an inviting empty-state linking the quiz.
(b) if anything IS persisted: STOP, report as a privacy blocker finding with
    file:line — do not ship copy claiming otherwise.
Tests: with mock quiz data the section renders with the trust line; without it,
the empty-state; assert no network write occurs on render.

## P7 — INDIA LIFE-EXPECTANCY: ONE SOURCED CONSTANT
Two pages disagree (72 vs 74). Create a single exported constant module (e.g.
src/data/lifeExpectancyFacts.ts): INDIA current value(s) — overall and by sex —
with source + year in the object (UN World Population Prospects 2024 edition;
use WebSearch to confirm the current published figures before hardcoding).
Replace EVERY hardcoded India figure (grep "72 years", "74", "32 years in
1947" etc.) with the constant + an inline "(UN WPP 2024)" citation. List every
site replaced. Test: the two founder-named pages now render the same sourced
value.

## P8 — /life-expectancy DEPTH + LAYOUT
Founder: too little content, excessive empty padding around the disclaimer.
Bring to the quality bar: answer-first paragraph, how-it-works (WHO life
tables + factor model in plain language), what the result does/doesn't mean
(honest register), 5-6 FAQ (schema), tighten the padding. This page is now on
the MAIN NAV — it should read like a flagship. Tests: sections render;
disclaimer present exactly once; FAQ schema parses.

## P9 — REAL /contact PAGE
Currently a mailto link. Build /contact: short form (name, email, message,
topic select) → a Worker endpoint → Resend → hello@bornclock.com; success
state; hello@ still displayed for direct writers. Anti-spam: honeypot field +
minimal rate limit; NO captcha. Route +1, sitemap, footer/nav links point at
the page (grep every mailto: usage and route them here where appropriate).
Tests: valid submit → 200 + success UI (send mocked/intercepted — email safety
rule); honeypot filled → silently dropped; invalid email inline error.

## P10 — HOMEPAGE SCIENCE CARD ROW (covers founder items 4, 5, 12)
One compact row of THREE small cards (same size as the two existing small
sections the founder likes): Biological Age → /biological-age · Compare 57
Countries → /country-comparison · Today's Energy (biorhythm) → /energy-forecast.
One-line honest hook each. Placement: after the articles box (the space the
founder identified). This row is the science-not-just-astrology signal — copy
should reflect that. Tests: three cards render with correct hrefs; row present
on 390px mobile without breaking.

## P11 — SEO/AEO TOUCH-UP ON CHANGED PAGES
For every page touched in this batch (/weight-on-planets, /life-expectancy,
/contact, /country-comparison, /planetary-age, homepage): verify after changes —
canonical self, title 30-65 with single brand suffix, meta description, FAQ
schema where present parses, answer-first paragraph intact. Run
scripts/seo-audit.mjs at the end; SEVERITY-1 must remain 0 and soft findings
must not increase.

## P12 — REGRESSION SWEEP
Full gauntlet + prelaunch (fix-loop applies). Manual-equivalent live checks
post-deploy: homepage DOB typing "14/12/1990" works end-to-end · /life-expectancy
loads cold (fresh incognito profile) · /contact submits · /age-calculator shows
the new feedback widget · homepage card row live · sentinel
{"error":"Report not found"} · invoice_counters unchanged (paste — expect
BC 1002 / BN 1001 / BX 1001) · IndexNow ping changed URLs.

## REPORT — docs/BATCH-9-REPORT.md
1. P1: why the old test passed against broken behaviour (the test-gap autopsy)
2. P2: confirmation of the stale-chunk diagnosis (or the real cause found)
3. P6: which case was true, with file:line
4. P7: the UN WPP figures adopted + every replacement site
5. P3: every legacy-widget surface swapped
6. Full A3-style results table (phase → positive/negative/edge → pass/SKIPPED
   with reason; silent omission = gate failure)
7. Founder task list

---

# AMENDMENTS (binding)

## A1 — P1 REALISTIC-TYPING TESTS
Event-simulated tests missed this regression once. Add cadence-realistic tests
using page.type() with per-key delay (~80ms), NOT fill(): type "1","4" into Day
→ assert after EACH keystroke (after "1": field shows "1", focus unchanged, no
pad); same for "1","2" in Month; and "1"+Tab → blur-pad to "01". These
keystroke-granular assertions are the ones that would have caught the bug.

## A2 — P3 LEGACY DATA DISPOSITION
If the legacy widget wrote to a separate table (user_reviews or similar): count
existing rows. If >0, do NOT migrate automatically — report the count and a
recommended disposition (migrate to feedback / archive / drop) for the founder
to decide; write the migration as a NOTES-*.sql option either way. If 0 rows,
note it and mark the table as a candidate for removal in a future cleanup.

## A3 — P12 PRIOR-BATCH REGRESSION CHECKS (explicit, not implied)
Because this batch edits the homepage, a sitewide component, and test files,
re-verify batch-8's acceptance surfaces explicitly (live or e2e):
- Feedback prompt still appears on a report after engagement (and the new P3
  swap didn't double-mount widgets anywhere)
- Compatibility calculator still navigates to the canonical pair page
- Nav bar order unchanged (Life Expectancy present; Numerology + Gift under
  Explore); /gift hero still "A gift that makes them feel truly special"
- DobInput on /birthday-report and /vedic-zodiac (founder-named surfaces)
  works end-to-end, not just the homepage
Add these as assertions to the results table.
