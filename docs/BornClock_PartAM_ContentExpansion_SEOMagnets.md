# BornClock — Part AM: Finish Remaining Pages + Content-Gap Research + New SEO/AEO Magnet Pages
## Continues Part AL directly. Every rule in Part AL (the Hard Rule, the Second/Third/Fourth Rules) remains fully in force for this session — read Part AL first, in full, before starting. This file only adds new scope on top of it. Long, substantial autonomous session — work through the full backlog below, don't stop early.

---

## READ PART AL FIRST — ITS RULES GOVERN THIS SESSION TOO

Before doing anything else, read `docs/BornClock_PartAL_FullSiteRedesign_v2.md`
in full. Every rule in it applies here without modification:
- **The Hard Rule**: never a real `wrangler deploy` or version promotion —
  "staging" means an isolated `wrangler versions upload` preview, always.
- **The Second Rule**: no stopping, no flags, no approval gate — resolve
  ambiguity yourself and keep going.
- **The Third Rule**: commit granularity matches the real unit of work — one
  commit per fully completed page (or, in this session, per fully completed
  new content page), not one commit per step.
- **The Fourth Rule**: process one page at a time, in depth, completing
  theme + density + carry-forward + feature-preservation + trust-strip +
  SEO/AEO together before moving to the next — never a shallow pass across
  many pages.

Do not re-litigate or soften any of these. This file adds new work on top,
it does not replace anything already established.

**Branch:** continue on `part-aj-four-page-redesign` — same branch as
Part AJ/AK/AL, not a new one.

**Scale, stated explicitly:** this is meant to be a long, substantial
working session on Claude Code's own continuous working time — not bounded
by a literal clock, and not something to treat as complete after a small
amount of work. Keep working through the prioritized backlog below — both
finishing remaining old-design pages and the new research/content-creation
work — for as long as there is real, valid work left to do, applying the
same per-page commit discipline and incremental logging as Part AL.

**Homepage:** still explicitly out of scope. The homepage redesign is the
deliberate next phase after this entire body of work (Parts AJ through AM)
is complete and has been reviewed once by the person. Do not touch it.

---

## THE FIFTH RULE: VERIFY REAL SERVED OUTPUT — NEVER SOURCE CODE OR BUILD SUCCESS ALONE

**This rule exists because of a real bug found after the last session:** a
page's source code contained the right structured-data components, the
build succeeded, and the test suite passed — but the actual live page was
missing that structured data entirely, because of a rendering/injection
failure the compile-time checks could not see. "The code has it" and "the
build works" are not proof that something is actually correct on the real
page. **For every claim of correctness in this entire session — schema
validity, computed chart/numerology/longevity values, carry-forward data,
trust-strip text, link targets, mobile layout — the verification must be
against the real, live, served output on the actual preview URL, fetched
fresh, not inferred from source code or a passing build.**

Concretely, this means: for any page displaying computed data (a Kundli
chart, a numerology result, a longevity estimate), fetch the real rendered
page for a known reference input and confirm the actual displayed numbers
are correct — a passing unit test on the underlying function is necessary
but not sufficient, since it doesn't prove the UI is correctly wired to
that function. Apply the same standard everywhere else this file or Part AL
claims something is "verified" or "confirmed."

**On reporting real elapsed time specifically:** a prior session's report
described its own duration in a way that turned out to be misleading (a
non-wall-clock number quoted where real elapsed time was expected). When
reporting how long any operation took (a build, a test run, a crawl), use
real timestamps (e.g. from `git log`, or the actual start/end of a tracked
command) — never a vague or convenient-sounding estimate.

---

## REAL BUG ALREADY FOUND AND FIXED — USE THIS PATTERN, DON'T REDISCOVER IT

Before starting Part A, check whether this has already been addressed in a
prior commit on this branch: a real bug was found where `react-helmet-async`
-injected JSON-LD doesn't reliably survive into the prerendered HTML,
because `scripts/prerender.mjs` captures `outerHTML` before Helmet flushes,
and only manually re-injects a hand-picked subset (title/description/
canonical/BreadcrumbList) — never the richer schema (WebApplication,
FAQPage, WebPage). The fix is a body-rendered component (`JsonLd.tsx`) that
renders structured data directly into the DOM, bypassing the Helmet race
entirely — verified to actually survive prerendering, unlike the old
Helmet-based approach.

**Use `JsonLd.tsx` (or whatever it's named on this branch) for ALL
structured data on every page touched in Part A and every page created in
Part C.** Do not use the old Helmet-based schema injection for any new or
redesigned page — it has a known, confirmed rendering bug.

**Also explicitly decide, don't silently skip:** a related sitewide gap was
found — `WebPage` schema missing from the live output on multiple existing
pages beyond what's already been fixed. Check whether this is still open;
if so, either fix it now as part of Part A (cheap, since the correct
pattern now exists) or defer it with clearly documented reasoning in the
report — don't leave it unaddressed without a stated decision either way.

---

## PART A — FINISH THE REMAINING OLD-DESIGN PAGES (continuing the Fourth Rule)

Per Part AL's own audit, 108 old-design pages were found; 2
(`/numerology`, `/compatibility`) were completed last session. **Continue
exactly the same Fourth-Rule process — one page at a time, full depth, one
commit each — through the remaining ~106 pages across all four categories**,
not just Mystic. Use the same priority ordering already established
(pages already identified in this project's research as realistically
winnable now, before pages competing head-on with entrenched competitors on
head-terms), applied across all four categories this time, not just Mystic:

- **Vedic:** `/career-report`, `/sun-vs-moon-sign`, `/moon-sign`,
  `/astrologer`, `/nakshatra`, and any others found in the audit.
- **Birthday:** the `/born-on/[date]` template, the celebrity-profile
  template, `/todays-birthdays`, `/age-calculator`, and others found.
- **Mystic:** `/zodiac`, `/chinese-zodiac`, `/name-numerology`,
  `/tarot-card-by-birthday`, and others found.
- **Science:** the full `/life-expectancy` + `/biological-age` + longevity
  quiz rebuild, deferred twice now — do it this session, carrying forward
  every real calculation, the paywall, and all pricing logic unchanged
  (per the Second Rule's resolved decision).
- **Shared Navigation/Footer restyle** — also deferred twice (risk of
  regressing 100+ unconverted pages). Now that a large share of pages will
  be on the new system after this session, re-assess whether it's safe to
  restyle the shared shell; if confident, do it; if still genuinely risky
  given real remaining old pages, defer again with the same documented
  reasoning as before — don't flip this decision without real justification.

---

## PART B — COMPETITIVE/KEYWORD-GAP RESEARCH (new, across all four categories)

This project already has extensive real competitive research (the
three-way Gemini/ChatGPT/Claude analysis, the Priority A/B/C page lists,
specific keyword findings for numerology, Sade Sati, Muhurat, gemstones).
**Use that as a starting baseline, then do fresh, live research to find
real gaps — topics and keywords a real user would search globally that
BornClock does not currently have a page for, across all four categories:**

- **Vedic:** additional divisional charts, dosha types, or remedy topics
  real competitors cover that BornClock doesn't yet address.
- **Mystic:** additional numerology systems, Western-zodiac crossover
  topics, compatibility angles not yet covered.
- **Birthday:** birthday-personality angles, historical/cultural
  birth-date content patterns real competitors use.
- **Science:** additional longevity/biological-age sub-topics with real
  research backing.
- **General, across all four:** "People Also Ask"-style question clusters
  related to each major existing page that could reasonably become their
  own dedicated article/FAQ content.

**Do not fabricate search-volume or competitive data** — if a specific
number can't be verified through real search, describe the opportunity
qualitatively rather than inventing a precise figure, same discipline as
every prior research pass in this project. Write findings to
`docs/part-am-content-gap-research.md`, then immediately proceed to Part C
— this is not a checkpoint to wait on.

---

## PART C — CREATE NEW SEO/AEO/GEO MAGNET PAGES FOR THE REAL GAPS FOUND

For the highest-value gaps found in Part B, create new pages — built right
the first time, not redesigned later:

- The correct category's finalized theme and the shared edge-to-edge
  density system, from the start.
- The same content standards already established project-wide: impact-first
  writing (plain-language impact stated first), every technical term run
  through the shared glossary/tooltip mechanism, real computed examples
  only (never fabricated), honest framing with no overclaiming — identical
  standard to every redesigned page, not a lesser bar for new content.
- Full SEO/AEO compliance from the start (see Part D below for the
  strengthened validation bar) — unique meta title/description, OG/Twitter
  tags, correct heading hierarchy, real JSON-LD, real image alt text.
- A real trust-strip claim (Step 9a's pattern) specific and accurate to
  what that new page actually computes or sources — never copy a claim
  from another page without verifying it's true for this one.
- Real interlinking into the existing four-category structure — a new page
  should never be an orphan; link it from and to relevant existing pages.

Same commit discipline as Part A: one commit per fully completed new page.

---

## PART D — STRENGTHENED SEO/AEO VALIDATION (a real correction from last session)

**Last session's Step 10 testing claimed "JSON-LD validated" when what was
actually done was confirming the schema serializes through the build and
checking for a single `<h1>` — that is not the same thing, and the gap was
caught afterward.** A malformed JSON-LD block can serialize cleanly through
TypeScript/the build and still fail a real structured-data validator.

**For every page touched or created in this session (Parts A and C both):**
run the actual content through a real structured-data validation method —
either a real external validator if reachable from this environment
(Google's Rich Results Test, schema.org's own validator), or, if neither is
reachable, write and run a real programmatic check against the actual
schema.org specification for each schema type used (required fields
present, correct types, no structural errors) — not just "it didn't crash
the build." State plainly in the report which method was used and show real
output, not a restated claim.

---

## PART E — PAYMENT TEST: ONE MORE REAL ATTEMPT TO RESOLVE THE AMBIGUITY

Last session conservatively deferred the real payment transaction test
because the active Razorpay key mode (test vs. live) couldn't be confirmed
from the committed `.env` files alone, and the preview shares the production
Supabase database. **Before defaulting to the same conservative omission
again, make one more real, concrete attempt to resolve the key-mode
question** — check whether the actual deployed Worker's runtime environment
(not just committed env files, which may not reflect the real active
secret) can be queried or inferred with genuine confidence, e.g. via a safe
read-only check against the Razorpay API itself (test and live keys often
behave observably differently against a harmless read-only endpoint,
without needing to push a real charge).

- **If this resolves to genuinely confirmed test-mode**, proceed with the
  real transaction test exactly as Part AL originally specified (create/
  reuse a test user, run the real payment, confirm paid content unlocks
  and locks again on downgrade).
- **If it remains genuinely ambiguous even after this real attempt**,
  fall back to the same conservative, read-only verification Part AL used
  (confirm no paywalled file was touched, confirm the gating logic is
  intact) — but only after actually trying harder this time, not reusing
  last session's conclusion by default without a fresh real check.
- **"Try harder" never means "take more risk."** If at any point the safety
  of the check itself (not just the key-mode answer) is unclear, stop that
  specific check and fall back to conservative omission immediately — the
  Hard Rule's "if ever unsure, pick the safer path" governs this too.

---

## THIS SESSION IS UNUSUALLY LONG — GUARD AGAINST INSTRUCTION DRIFT

This session is meant to run far longer than a typical session in this
project, governed by five rules across two files (Part AL's Hard/Second/
Third/Fourth Rules, this file's Fifth Rule), read once at the start.
Long autonomous sessions are exactly where instructions read early can
quietly stop being followed precisely, not from carelessness but from
sheer session length. **Before starting each new page in Part A and before
starting Part B, Part C, and Part E, briefly re-confirm to yourself (no
need to re-read the full files each time) that you are still following:
the Fifth Rule (real served output, not source/build), the per-page commit
discipline (one commit per finished page, not per step), and the
conservative-omission principle (skip and document what can't be verified,
never guess).** This is a real check against drift, not a formality.

---

## TESTING — SAME EXHAUSTIVE STANDARD AS PART AL, APPLIED TO ALL NEW WORK

Every page touched in Part A and every page created in Part C gets the
full testing treatment already specified in Part AL: positive and negative/
edge cases, the regression check against all previously-redesigned pages,
mobile verification, zero console errors, full automated test suite passing
before and after, and the strengthened real structured-data validation from
Part D. **Per the Fifth Rule, every page with computed data (charts,
numerology, longevity estimates) must be checked against its real live
rendered output for a known reference input — confirm the actual displayed
numbers are correct, not just that the underlying function's unit test
passes.** Fix anything broken and re-test before moving on — the same
fix-and-retest loop, not a logged-and-moved-on note.

---

## INCREMENTAL PROGRESS LOGGING

Continue appending to `docs/part-al-progress.md` (the same log file, not a
new one) — one line per finished page in Part A, one line per completed
research category in Part B, one line per new page created in Part C — so
real progress across this long session stays visible throughout.

---

## SELF-VERIFICATION PASS — DO THIS BEFORE WRITING THE FINAL REPORT

Before writing the final report, independently re-check your own major
claims with raw evidence, the same way an external skeptical review would —
don't just report what you attempted, confirm it actually holds:

- Fetch the real live preview URL (not local dev) for a sample of pages
  touched/created this session and confirm the structured data, computed
  values, and trust-strip text are actually present in the real served
  output — per the Fifth Rule.
- Run the real structured-data validator (Part D) against a sample of new/
  touched pages, not just the ones already checked mid-session — confirm
  nothing regressed.
- Re-run the full automated test suite fresh, right before writing the
  report, and quote the real, current result and real elapsed time — not a
  number from earlier in the session.
- Check real git commit timestamps (`git log`) and report genuine elapsed
  time for the session — per the Fifth Rule's note on honest duration
  reporting.
- Re-run the link crawl against the live preview fresh, not from memory of
  an earlier crawl.

If this self-check finds something that doesn't hold up, fix it before
writing the report — don't report a claim you've just found reason to doubt.

---

## FINAL REPORT

Write to `docs/part-am-report.md` and include in full in your final
message, extending Part AL's report format with:
- How many of the ~106 remaining old-design pages were fully completed
  this session, with the same real before/after evidence standard as before.
- The complete Part B content-gap research findings.
- Every new page created in Part C, with its real SEO/AEO validation
  evidence from Part D (not just "serializes").
- The real outcome of Part E's payment-key resolution attempt — whether it
  was resolved this time, and if not, what was actually tried.
- An updated launch-readiness checklist reflecting the new total page
  coverage.
- The final isolated preview URL.

State plainly what was done, tested, and verified — not something awaiting
approval. Nothing is merged to `develop` or deployed to production.

---

## WHAT NOT TO DO
- Everything in Part AL's "What Not To Do" still applies.
- Do not fabricate search-volume, competitive, or ranking data in Part B —
  describe qualitatively if a real number can't be verified.
- Do not create a new page in Part C without full SEO/AEO compliance and
  the same content-quality standard as every redesigned page — no shortcuts
  for new content.
- Do not claim structured data is "validated" based on build serialization
  alone — Part D's real validation is required.
- Do not reuse last session's payment-ambiguity conclusion without making
  a genuine fresh attempt to resolve it per Part E.
- Do not touch the homepage.
