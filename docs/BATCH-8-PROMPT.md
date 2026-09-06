# Batch 8 — Content Depth v2, Feedback System, DOB Component, Nav, SEO Editorial
# Save as docs/BATCH-8-PROMPT.md → "Read docs/BATCH-8-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/BATCH-8-REPORT.md.

## GROUND RULES

CONTEXT: BornClock is LIVE with paying customers.
FROZEN — never touched: api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts.
DDL → NOTES-*.sql only. ./node_modules/.bin/wrangler only. tsc 45 baseline, 0 new.
ONE deploy at the end.

FIX-LOOP POLICY (binding): classify every failure — (a) PRODUCT BUG → fix, re-run
that suite then the full set; (b) TEST BUG → fix the test, justify with evidence;
(c) FROZEN-FILE → blocker finding, leave red; (d) ENVIRONMENT → retry, note flaky.
Max 3 iterations per failure. NEVER weaken an assertion, broaden a selector, add
a sleep, or delete a test to go green.

CONTENT-ASSERTION RULE: SPA fallback returns 200 for any path — page tests assert
route-specific CONTENT + canonical ≠ homepage. BUILD-COUNT RECONCILIATION: state
expected vs achieved and reconcile any gap (expected: 1341 + 1 possible browse
additions = report exact; no new routes are planned except as noted in P6).

EMAIL SAFETY: tests never email real users (*@bornclock-test.invalid / ADMIN_EMAIL).

TRIAGE ORDER (drop from the bottom if the session runs long):
 P1 (compat depth v2) > P2 (/gift + /coach redo) > P3 (DOB component) >
 P4 (feedback+ratings) > P5 (nav changes) > P6 (calculator routing + grid) >
 P7 (SEO editorial pass). Finish or skip cleanly.

---

## P1 — COMPATIBILITY PAGES: CONTENT DEPTH v2 (founder verdict: still thin)

The founder reviewed the 7b deepening and finds the 78 pages still thin and
unimpressive. This pass makes each pair page genuinely substantial and
SEO-aligned.

1. WebSearch FIRST: study 2-3 leading compatibility pair pages (Cafe
   Astrology-class, Astrology-Zodiac-Signs-class) for structure, depth, and the
   sections users expect. Structure only — never copy text.
2. Target per page: 700+ words of pair-specific composed content. Extend
   compatibilityProse.ts (one data module, changes propagate to all pages):
   - The existing Love/Friendship/Work + verdict stays
   - ADD: a "How {A} and {B} actually work day-to-day" section (element+modality
     composed), "Where it gets hard" (honest friction, specific), "Making it
     work" (2-3 concrete composed suggestions), and a strengths/challenges
     summary pair
   - Per-pair FAQPage grows to 5 questions incl. "Is {A}-{B} a good marriage
     match?" and "Are {A} and {B} compatible as friends?" (real query forms)
3. Honesty register: compatibility framed as the Western sun-sign tradition's
   view — cultural lens, not prediction; the existing Western-vs-Vedic clarifier
   stays.
4. Thin-content proof: diff TWO same-element pairs AND two different-element
   pairs in the report; each must read as its own page.
5. Same-sign pairs (aries-aries) get their own composed treatment (mirror
   dynamics), not the generic template.

## P2 — /gift + /coach COPY REDO (care-centred angle, founder-directed)

The founder rejected "The gift that proves you actually know them" — the frame
must centre CARE and the recipient FEELING SEEN, not a test of the giver.
Research basis (already gathered): meaningful-gift psychology = recipient feels
noticed, valued, understood; personalised gifts read as more thoughtful and are
remembered longer.

/gift:
1. WebSearch: study 2-3 emotional gifting landing pages (personalised-gift
   brands) for how they sell the feeling. Structure/psychology only.
2. Rewrite around care + being seen. Draft the hero around candidate directions
   and PICK THE STRONGEST, listing the alternatives in the report for the
   founder's final swap:
   - "The gift that shows how much you care"
   - "A gift that makes them feel truly seen"
   - "Anyone can buy a present. This one says: I pay attention to you."
   - "The 21st-century keepsake — made from the one date that's entirely theirs"
3. Keep the conversion skeleton (hero+price+CTA → problem → what they receive →
   sample visual → occasions → testimonial placeholder (DO NOT invent) →
   objections: instant delivery / 7-day guarantee / permanent access → repeat
   CTA → FAQ). The COPY inside it must carry specific, warm, sincere moments —
   a daughter gifting her father his own story; a friend abroad opening it on
   the morning of their birthday. Never saccharine, never manipulative.
/coach:
4. Apply the founder's earlier direction fully: motivation + gentle urgency
   about the unknowns (never fear-mongering), concrete scenarios (making sense
   of your numbers, food choices, exercise timing, habit building), the privacy
   guarantee prominent ("your conversation isn't stored — close the tab and
   it's gone"), who gets it, honest limits as a trust feature.
5. Both pages keep FAQPage schema, share bar, mesh links, currency-aware
   pricing from pricing.ts.

## P3 — SHARED DOB INPUT COMPONENT (founder-specced, sitewide)

Build ONE DobInput component and replace every DOB entry surface (homepage
hero, birthday report form, calculators, fitness/rhythm widgets — grep for
every current DOB entry and list the surfaces converted in the report).

Spec (locked):
- Three labeled fields, DD / MM / YYYY order
- Hard input caps: Day 2, Month 2, Year 4 digits — a further keystroke does not
  register; non-digits filtered; paste of digits handled sanely
- type="text" inputmode="numeric" pattern="[0-9]*" (mobile numeric keyboard;
  never type="number")
- AUTO-ADVANCE: on 2 digits entered, OR immediately when the first digit makes
  a longer value impossible (Day first digit 4-9 → advance; Month first digit
  2-9 → advance). Ambiguous single digits (Day 1-3, Month 0-1) wait.
- Single digit + Tab is fully valid: value normalised internally, field
  visually zero-pads on blur (5 → 05)
- Backspace on an EMPTY field moves focus to the previous field with its value
  intact for editing
- Tab/Shift-Tab always work normally; clicking a field selects its content;
  focus NEVER moves on an error; values retained on return
- Helper text under the group as an EXAMPLE, not a rule: "DD · MM · YYYY —
  e.g. 02 · 05 · 1985"
- Trio validation inline at the group: impossible dates (Feb 30, month 13),
  future dates, >120 years ago — clear message, no focus theft
TESTS (positive/negative/edge): auto-advance on 05; smart-advance on 7 in Day;
no advance on 1 in Month; single digit + Tab normalises; year hard-stops at 4
digits (5th keystroke ignored); backspace-on-empty returns; Feb 29 valid in
leap years and rejected otherwise; Feb 30 rejected; future date rejected;
paste "02051985"-style behaviour defined and tested; all converted surfaces
still submit correctly end-to-end.

## P4 — FEEDBACK & RATING SYSTEM (founder-locked spec)

Applies to REPORTS and BLOG ARTICLES.
1. Read the existing user_reviews schema first; extend via
   NOTES-feedback.sql (tolerate-absent: UI hides gracefully until applied).
   Needs: content_type + slug, rating, comment, consent flag, approved flag
   (default false), dismissed tracking, one row per user per content item
   (idempotent upsert).
2. Reports: prompt after unlock, engagement-gated (≥50% scroll OR ≥45s),
   once per report, dismissal persisted server-side.
3. Blogs: lighter inline widget at article end, same engagement gating, same
   table.
4. Sentiment routing: 4-5 stars → show the consent checkbox ("You may feature
   my comment publicly", DEFAULT UNCHECKED); 1-3 stars → no consent checkbox,
   instead "What would have made this better?" — private feedback.
5. TWO-KEY PUBLICATION: nothing displays publicly unless consent=true AND
   approved=true (founder toggles approval in admin). No exceptions, high
   ratings included.
6. Public display: the rating widget everywhere now; average stars on a page
   only when that item has ≥5 ratings; approved comments in a "Reader
   comments" block. (With zero data today, nothing public will render yet —
   assert the thresholds work.)
7. Admin: Feedback section — all rows, filters (content type, low-rating
   queue, consented-only), approve/unapprove toggle, average. Follow existing
   admin data-access patterns incl. the session-gating fix; any RLS policy →
   the NOTES file.
8. XSS negative: hostile comment content stored inert, rendered escaped
   everywhere. Delete-account: feedback rows must not block deletion (verify
   against the FK hardening; add to NOTES if a constraint is needed).
TESTS: gate timing, once-only, dismissal persistence, sentiment routing, two-key
display logic (consent without approval → hidden; approval without consent →
hidden), threshold (4 ratings → no stars shown; 5 → shown), XSS, delete-account
compatibility, admin toggle.

## P5 — NAV CHANGES (founder-decided)

Main bar becomes: Home · Age Calculator · Today's Birthdays · Celebrity Match ·
Birthday Report · Life Expectancy · Astrology · Explore · More · Upgrade.
- ADD "Life Expectancy" as a direct main-bar item
- MOVE "Numerology" into Explore
- MOVE the /gift entry into Explore (label "Gift a Report") — it currently sits
  under More from batch 7b; Birthday Report remains the single money item on
  the bar
- Footer blocks updated to match. Mobile nav mirrors all changes.
- Update nav test expectations (documented spec update, not weakening).
- Verify no overflow at 1280px and 1024px widths; report if the bar wraps.

## P6 — COMPATIBILITY CALCULATOR ROUTING + BROWSE GRID (founder-verified flaw)

Users currently regenerate results inline every time; the 78 pages are
invisible to them.
1. Calculator: selecting two signs NAVIGATES to the canonical
   /compatibility/{a}/{b} page (canonical order — never through a redirect).
   The inline result rendering is removed or becomes a brief loading state.
2. Browse grid on /compatibility: pick-your-sign → its 12 pairings as links
   (canonical order), plus a full A-Z pairs index section (78 links) for
   crawl + user browsing.
3. Back-navigation sane: pair page → calculator link to try another.
TESTS: selection lands on the canonical URL (3 samples incl. a reverse-order
selection routing to canonical without a client-side 301 hop), grid links all
canonical (no redirect sources — the audit's L2 class), invalid selection
handled.

## P7 — SEO EDITORIAL PASS (docs/SEO-AUDIT-FINDINGS.csv)

Work the 1,559 soft findings:
1. Title/description lengths: fix per-page via the page-data generators
   (template-level where possible). PRESERVE primary keywords — shortening must
   never drop the head term; the audit report warned rewriting risks keyword
   loss, so each template change lists before/after for one example.
2. Brand-suffix consistency: apply the "| BornClock" rule to the 30 absent
   pages unless length would overflow (rule from the title fix batch).
3. /leaderboard thin content: add explanatory content (what it ranks, how,
   provenance) to a non-thin standard.
4. The C2 extraction artifact: investigate, fix or document as false positive.
5. Re-run scripts/seo-audit.mjs; report the new findings count (target: soft
   findings materially reduced; SEVERITY-1 stays 0).

---

## GATE
1. tsc 45/0 · full build 0 failed, count reconciled · gauntlet 135 + prelaunch
   (154 + new) green under fix-loop
2. Frozen empty diff · invoice_counters unchanged (paste; expect BC 1002 /
   BN 1001 / BX 1001)
3. Live post-deploy: /compatibility/aries/leo shows v2 depth · calculator
   navigation works on production · nav shows Life Expectancy · DOB
   auto-advance works on the homepage · sentinel OK
4. seo-audit.mjs before/after counts
5. ONE deploy · IndexNow ping changed URLs

## REPORT — docs/BATCH-8-REPORT.md, in this order
1. The /gift hero chosen + the alternatives (founder may swap)
2. FINDINGS from the fix-loop
3. P1 diff evidence (two pair-diffs) + reference URLs studied
4. P3: surfaces converted to DobInput
5. P4: NOTES-feedback.sql prominently + the two-key logic evidence
6. P5: the final nav at 3 widths
7. P7: audit count before/after + one before/after title example per template
8. Founder task list: apply DDL · editorial pass on /gift + /coach + 3 compat
   pages · try the DOB input personally · approve first feedback rows when
   they arrive

---

# AMENDMENTS (binding — override anything above that conflicts)

## A1 — COMPLETE ALL PHASES (replaces the TRIAGE ORDER)
The founder's instruction: do not stop; complete all seven phases. The triage
order above now defines only the SEQUENCE, not permission to drop. No phase may
be skipped for time or length. A phase may halt ONLY on a hard blocker after 3
documented fix iterations (per the fix-loop policy) — and even then, all
remaining phases must still be completed. Work in as many passes as needed;
long runtime is acceptable, incompleteness is not. If the session is at genuine
risk of ending, commit completed phases locally, write docs/BATCH-8-REPORT.md
with exact resume instructions for the remaining work, and say so plainly —
never a silent partial.

## A2 — TEST MATRIX FOR THE PHASES MISSING ONE
P1 (compat depth v2):
 - positive: 3 pair pages render every new section (day-to-day, friction,
   making-it-work, strengths/challenges) with non-empty composed text; FAQ
   count = 5
 - negative: bogus pair slug → not-found state (content-asserted)
 - edge: a same-sign pair (aries-aries) renders the mirror-dynamics treatment,
   not the generic template; the two-pair diffs from the report backed by an
   automated near-duplicate check (first 300 chars of each section differ)
P2 (/gift + /coach):
 - positive: hero renders the chosen headline; price is currency-aware (INR and
   USD modes both asserted); FAQ schema parses; testimonial placeholder present
   and clearly non-fake; CTA link resolves
 - negative: no invented testimonial text anywhere (assert the placeholder
   marker, assert no quote-styled content outside it)
 - edge: both pages reachable from their new nav locations (ties to P5 tests)
P5 (nav):
 - positive: desktop 1280px shows the exact final bar order; Explore contains
   Numerology + Gift a Report; mobile 390px menu contains all moved items
 - negative: no nav link points at a redirect source or a removed location
 - edge: 1024px width — bar must not wrap/overflow (assert layout height)
P6 (routing + grid):
 - positive: 3 selections land on canonical URLs; grid renders 12 pairings per
   sign; A-Z index has exactly 78 links, all canonical
 - negative: reverse-order selection routes client-side to canonical (no 301
   hop); invalid/incomplete selection blocked with a message
 - edge: same-sign selection routes to its canonical page; grid on 390px mobile
P7 (SEO editorial):
 - positive: re-run seo-audit.mjs — T2/T3 length findings materially reduced;
   SEVERITY-1 remains 0
 - negative: spot-assert 5 changed titles still contain their primary keyword
   (list them)
 - edge: the /leaderboard page passes the C1 threshold after the content add

## A3 — RESULTS TABLE (gate requirement)
The report must include the full matrix as a table: phase → scenario
(positive/negative/edge) → pass/fail/SKIPPED-with-reason. A listed scenario
silently omitted counts as a gate failure. SKIPPED is permitted only with a
stated technical reason, never for time.
