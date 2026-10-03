# BornClock — Part AL: Complete Site-Wide Redesign + Launch Readiness
## Fully autonomous. No stopping, no flags, no approval gate. One hard rule overrides everything below: production is never touched. Single agenda: the app must be launch-ready when this session ends — every feature working, every link working, every page consistent.

---

## THE ONE HARD RULE — READ FIRST, NOT NEGOTIABLE

**Never run a plain `wrangler deploy`, `wrangler deploy --env production`, or
anything that promotes a version to live traffic, at any point, for any
reason.** `staging.bornclock.com` and production `bornclock.com` are served
by the same Cloudflare Worker — a normal deploy publishes both at once.
**"Staging" in this entire prompt means an isolated preview version, created
with `wrangler versions upload`** — a real, fully-functional URL that is
never promoted. All work, all testing, the real payment test — all against
this isolated preview. If ever unsure whether something would touch
production, don't do it; pick the safer path and continue.

## THE SECOND RULE: NO STOPPING, NO FLAGS, NO APPROVAL GATE

No pause for review, no report awaiting a decision. Prior sessions' open
questions are resolved below. Any new ambiguous case: make the most
reasonable call yourself, log it briefly, keep going. Nothing stops this
session except genuine completion or a real, hard technical blocker —
never a judgment call.

**Resolved decisions, carried in:**
- Birthday's architecture (free results live on `/celebrity-birthday`,
  `/birthday-report` is the paid flow) — confirmed, keep as built.
- Science & Longevity's full visual rebuild — do it now, in this session.
  Carry forward every real calculation, the paywall, and all pricing logic
  unchanged.

---

## THE THIRD RULE: COMMIT GRANULARITY MATCHES THE REAL UNIT OF WORK

**This rule is superseded in part by the Fourth Rule below — read both
together, they are not in conflict once you have both.** Steps 0, 1, 2, 2.5,
and 8 are genuinely global, one-time, whole-site actions — each of these is its
own separate, independently revertable commit, in that order (2.5 commits
after 2, before per-page work begins).

Steps 3 through 7, 9, and 10 are NOT done as separate global passes (see the
Fourth Rule) — they are applied together, per page, as each page is fully
completed. So the actual commit unit for this work is **one commit per fully
completed page** (containing that page's theme, density, carry-forward,
feature-preservation, trust-strip, and SEO work together) — not one commit
per step. The goal is the same as before (any single unit of work can be
reverted independently without affecting others) — it's just that the real
independent unit is "one finished page," not "one step applied everywhere."

Within Step 9 specifically, 9a/9b/9c remain conceptually distinct pieces of
that page's commit — if one of the three is conservatively omitted for a
given page (per Step 9's own rules), that omission is simply reflected in
that page's single commit, not a separate commit of its own.

---

## STEP 0 — BASE VERIFICATION (do this first, do not skip)

Confirm you are continuing on the existing `part-aj-four-page-redesign`
branch (not a new branch, not `develop` — `develop` is missing Parts AH/AI,
a mixup that has already happened once in this project). Confirm the nine
pages already redesigned in Parts AJ/AK are present and intact on this
branch before adding more work on top. If the branch state looks wrong,
pick the safer interpretation (continue on the branch with the most prior
work present) and proceed — do not stop to ask.

---

## SCOPE AND SCALE — READ BEFORE STARTING THE AUDIT

This site has roughly 3,600 sitemap routes, but the large majority are
generated from a small number of shared templates — one component renders
all 365 `/born-on/[date]` pages, another renders every celebrity profile,
etc. **Redesign at the template/component level, not by visiting individual
generated routes one at a time.** Spot-check a handful of generated
instances per template to confirm the fix applies correctly across all of
them, rather than treating this as 3,600 separate pages.

**Homepage boundary, stated explicitly:** the homepage's own body content
and hero are out of scope for this session. Shared components used by every
page — the global Navigation and Footer — ARE in scope and should be
updated for sitewide consistency; updating them is not "touching the
homepage," since they're shared infrastructure, not homepage-specific content.

**Non-category utility pages** (Privacy, Contact, How It Works, and similar)
don't belong to one of the four categories, but they share the sitewide
nav/footer with everything else. Apply the shared shell (navy/ivory,
Fraunces/Public Sans, edge-to-edge density) to these — no category accent
color, just visual consistency with the rest of the now-redesigned site.

---

## STEP 2.5 — FIX THE SHARED CSS SCOPING BUG (global, one-time, before per-page work starts)

This is a global code fix, not per-page work — do it once, here, before
starting the Fourth Rule's per-page processing below. The real bug found in
an earlier session: the CSS generator scoped variant classes as a descendant
selector (`.paj .editorial`), but they sit on the same element as `.paj`
(`class="paj editorial"`), so the rule never matched — this silently broke
layouts and made ivory read as white wherever it occurred. Fix the shared
generator so variant classes apply correctly (`.paj.editorial`, same
element, not descendant). Once fixed here, every page processed afterward
under the Fourth Rule automatically benefits from the corrected generator —
there is nothing left to redo per page for this specific bug.

---

## THE FOURTH RULE: PROCESS PAGE-BY-PAGE IN DEPTH, NOT STEP-BY-STEP ACROSS THE WHOLE SITE

**This is the most important structural rule in this prompt — read it
before starting Step 1.** Steps 0, 1, 2, and 2.5 happen once, globally,
first (base check, audit, stub/duplicate decisions, the shared CSS fix).
After that, **do not redesign the
entire site's visual theme first and circle back for trust/SEO work
afterward.** Instead, for each individual page/template, in priority order
(below), complete ALL applicable work for that one page — Step 3's theme,
Step 4's density, Step 5's carry-forward, Step 6's feature-preservation,
Step 7's prerendering fix if applicable, Step 9's trust-strip/What's-Ahead/
time-horizon work if applicable, and Step 10's SEO/AEO compliance — before
moving to the next page.

**Why:** this is a single, time-boxed overnight session covering a very
large site. If time runs out partway through, the goal is a smaller number
of pages that are completely finished — redesigned, trustworthy, and
SEO-ready — not a large number of pages that are visually redesigned but
missing the trust and SEO work entirely.

**Priority order for which pages get this full treatment first:** the pages
already identified in this project's own earlier research as realistically
winnable now (numerology/compatibility calculators, specific long-tail
Vedic tool pages) and the already-redesigned hub pages' most important
linked tools, before pages competing head-on with entrenched competitors on
head-terms. Use this same ordering for Step 10's own prioritization note —
they are the same priority list, not two separate ones.

Step 8 (the full-site launch-readiness pass — dead links, dead buttons,
sitemap accuracy) still runs as its own global pass at the end, since it
checks the whole site's consistency, not individual pages in isolation.

---

## STEP 1 — FULL SITE AUDIT

List every real page/template on the site. Classify each as: belongs to one
of the four categories (which one), is a shared utility page, is the
homepage (excluded), or is a candidate stub/duplicate page (see the list
below). Note current design status. Write to `docs/part-al-audit.md` and
proceed immediately — this is a record, not a checkpoint.

**Also in this audit, re-verify the nine pages already redesigned in
Parts AJ/AK** (`/vedic-astrology`, `/celebrity-birthday`, `/mystic-corner`,
`/kundali`, `/kundali-match`, `/sade-sati`, `/muhurat`, `/gemstones`,
`/rashi-ratna`) are still correctly rendering the fixed CSS/tokens after
any sitewide fix applied in this session — a sitewide fix is exactly the
kind of change that could accidentally regress pages that were already
correct.

---

## STEP 2 — RESOLVE THE KNOWN STUB/DUPLICATE PAGES (decide, don't just re-skin)

These were identified in an earlier audit and explicitly deferred. Since
this session already touches the whole site, decide and act on each now,
rather than silently applying a fresh coat of paint to a page that should
arguably be merged or removed:
- The `/life-expectancy-calculator-{uk|usa|canada|australia}` near-duplicate
  wrapper pages — consolidate into the main calculator with proper
  redirects, unless each genuinely serves distinct, real search intent.
- The Hindi calculator wrapper pages and `/hi/rashifal` — confirm these
  render real, correctly-computed content (not static canned text) before
  redesigning; fix if they're static when they should be computed.
- `/vedic-zodiac` — currently solar-only; decide whether to compute properly
  now or leave as a clearly-labeled simpler tool, and make that decision
  explicit rather than silent.
- `/diwali-gift`, `/for-business`, `/coach` — confirm these aren't broken,
  apply the shared-shell consistency treatment, but don't over-invest
  redesign effort here relative to the core category pages.

Log every decision made here in `docs/part-al-audit.md` alongside the page
list.

---

## STEP 3 — APPLY THE CORRECT CATEGORY THEME TO EVERY PAGE/TEMPLATE IN SCOPE

- **Vedic Astrology** → gold `#C6A15B` (decorative) / bronze `#806125`
  (any text on light backgrounds, for WCAG contrast) — covers the already-
  redesigned Vedic pages plus every other Vedic-category page/template found
  in the audit (`/career-report`, `/sun-vs-moon-sign`, `/moon-sign`,
  `/astrologer`, `/nakshatra`, and any others).
- **Birthday & Celebrity** → coral `#F0715A` — covers `/celebrity-birthday`,
  `/birthday-report`, the `/born-on/[date]` template, the celebrity-profile
  template, `/todays-birthdays`, `/age-calculator`, and others found.
- **Mystic Corner** → amethyst `#6E5AA6` — `/mystic-corner`, `/numerology`,
  `/name-numerology`, `/zodiac`, `/chinese-zodiac`, `/tarot-card-by-birthday`,
  `/compatibility`, and others found.
- **Science & Longevity** → white background (not ivory), blue `#2F6FB0` +
  green `#2E9E7B`, no gold/ivory anywhere — `/life-expectancy`,
  `/biological-age`, the longevity quiz, and others found.
- Shared shell everywhere: navy `#0E2238` nav/footer, ivory `#FAF7F0` as the
  dominant background for the three warm categories, Fraunces + Public Sans.

(The shared CSS scoping bug that caused this is fixed once, globally, in
Step 2.5 below — not repeated per page.)

---

## STEP 4 — EDGE-TO-EDGE DENSITY, APPLIED CORRECTLY

Minimal padding, hairline dividers instead of heavily-padded boxed cards,
sections butting directly against each other. **This does not mean
stretching sparse content to fill space, and does not mean leaving genuinely
empty areas either.** Where real empty space remains after correct density:
add real, relevant supplementary content — a small bento-style grouping of
related sub-features, a cross-link cluster, an additional real data point
the engine already computes but doesn't yet surface. A page should feel
complete and substantial — never sparse, never artificially padded.

---

## STEP 5 — CARRY-FORWARD AND INTERLINKING, EVERYWHERE IT APPLIES

Extend the birth-detail carry-forward pattern
(`?dob=&time=&place=&lat=&lon=&tz=`, saved-profile auto-fill, fresh input
takes precedence over stale saved data) to every page in scope that asks for
birth details and links onward to a page that also needs them. Check and
complete the four-way category interlinking across the full site, not just
the original four hub pages.

---

## STEP 6 — PRESERVE EVERY EXISTING REAL FEATURE

Before changing any page, note its real functionality (calculations,
paid/premium gates, content-depth work — the glossary mechanism, Kaal Sarp,
remedies, cross-references, honesty sections). After redesigning, confirm
every one still works. Do not drop anything.

---

## STEP 7 — FIX THE KNOWN PRERENDERING/CRAWLER-VISIBILITY GAP

Several pages (`/kundali`, `/muhurat`, `/astrologer`, `/sade-sati`,
`/career-report`, `/gemstones`) serve a bare SPA shell to crawlers before
React hydrates, meaning search engines may not see their real content on
first load. This was flagged as a future fix in an earlier session — since
this session is already rebuilding these exact pages' markup, add them to
the prerendered-pages list now (matching how `/vedic-astrology` and the
other hub pages are already prerendered), rather than leaving this gap for
a future session that may never come.

---

## STEP 8 — FULL-SITE LAUNCH-READINESS PASS

This is the actual point of the whole session, not an afterthought — the app
needs to be genuinely ready to launch when this finishes:

- **Crawl every real internal link site-wide** — every nav item, every
  footer link, every cross-category link, every in-page CTA button. Confirm
  none are dead/404/broken. Fix any found.
- **Confirm every button/CTA does something real** — no leftover placeholder
  handlers, no dead links styled as buttons.
- **Confirm `sitemap.xml` accurately reflects the real, live post-redesign
  site** — no stale entries for anything consolidated/removed in Step 2, no
  missing entries for anything that should be indexed.
- **Zero console/JS errors anywhere** across the full site, desktop and
  mobile.

---

## STEP 9 — TRUST, VALUE, AND PREDICTIVE DEPTH (new work, not a visual task)

This step is about making real, already-true things visible to the user —
it is not about adding unverified superiority claims. **Hard rule: every
trust statement added in this step must be specific and checkable (what was
computed, cross-checked, or sourced) — never a vague superiority claim like
"the best in the world" or "better than everyone else." Unverifiable
boasts are a real liability, not a trust signal, and conflict with this
project's own established honesty standard (e.g. the marriage-timing
research, which earns trust specifically by admitting what can't be
predicted).**

**How this step stays safe while staying fully autonomous — read this
before starting 9a/9b/9c:** this is the one part of the whole session
touching new, trust-sensitive, user-facing claims rather than visual
redesign of already-working pages. Since there is no pause for review here
either, the default behavior when something can't be fully verified is
**conservative omission, not a guess and not a stop:**
- 9a, 9b, and 9c are independent pieces of work with no dependency between
  them — but per the Third Rule, they are bundled into that page's single
  commit, not committed separately. If one of the three is conservatively
  omitted for a given page, that's simply reflected in what that page's
  commit contains, not a missing separate commit.
- Within 9a specifically: if a given page's trust-strip claim cannot be
  confidently verified as accurate against that page's real engine
  behavior, **omit the trust strip for that one page** rather than ship an
  unverified or generic claim there. Apply it everywhere it IS verified;
  skip it, documented, wherever it isn't.
- Within 9b specifically: if the marriage-timing honesty guardrail cannot
  be confidently verified to hold in the new life-area view, **omit the
  marriage/relationship life-area from this view** (keep career, property,
  health, travel) rather than risk shipping a version that doesn't meet the
  established standard. Note this clearly in the report.
- Within 9c specifically: if time-horizon predictions cannot be built on
  genuinely real computed data with confidence, **do not ship a templated
  or best-guess version** — log it as not built, with the real reason, and
  move on.
This way the autonomous run never has to choose between stopping and
guessing on the sensitive piece — it simply ships what it can verify, and
documents what it conservatively left out, exactly like the resource
safety net already used elsewhere in this project.

### 9a. Build one reusable trust-strip component
A single, consistent component (same visual treatment sitewide), placed near
the top of every result/report page — not buried in a footer. One honest,
specific, service-appropriate line per page, for example:
- Kundli/Dasha: "Cross-checked against independent reference calculations —
  not a template."
- Sade Sati: "Computed from your real planetary transit, not a lookup table."
- Muhurat: "Your Panchang, computed for your exact location — timing shifts
  by city, so we don't guess."
- Kundali Matching: "The classical 36-point Ashtakoota system, per the
  Brihat Parashara Hora Shastra."
- Gemstones/Rashi Ratna: "We tell you which method we used, and why."
- Numerology/Zodiac: "Calculated from your actual birth date, every time —
  not a generic daily horoscope."
- Science & Longevity: "A real population-research estimate — we tell you
  what it can't measure, too."
- Career Report: "Based on your actual 10th house and career-timing
  periods — not a generic trait list."
Apply the real, correct claim to each page based on what that page's engine
actually does — verify each claim against the real underlying computation
before writing it; do not copy a claim onto a page where it isn't accurate.

### 9b. Build a "What's Ahead" life-area view
Users think in terms of life areas (career/promotion timing, marriage,
property purchase, health, travel), not astrological mechanisms (which
Dasha, which house lord). Build a view that takes the same real computed
data already available (Dasha periods, house lords, detected Yogas) and
re-presents it grouped by life area instead of by mechanism — this is a new
presentation layer over existing real data, not a new calculation.

**Non-negotiable guardrail, carried from established project history:** for
marriage-timing specifically, this must stay within the honesty standard
already locked in after real testing (five methods tried, none reliably
predicted a specific date) — use "traditionally favorable window" framing
only, never a specific promised date or confident single answer. Reverting
to specific-date framing here would reintroduce something already proven
unreliable.

### 9c. Add time-horizon prediction views (1 month / 6 months / 1 year / lifetime)
Verify first whether this already exists anywhere in the codebase before
assuming it needs to be built from scratch. If it doesn't exist: build these
views reusing the real, existing Dasha/transit engine — real computed
windows at each horizon, not fabricated or templated content. Apply the same
honesty standard as 9b: themes and windows, not manufactured certainty.

**Testing for Step 9:** verify each trust-strip claim is factually accurate
for that page's real engine behavior; verify the What's Ahead view's data
matches the same underlying Dasha/Yoga data already shown elsewhere on that
chart (no inconsistency between the two presentations); verify the
marriage-timing guardrail holds in the new view exactly as it does in the
existing chat/report flows; verify time-horizon views use real computed
data at each horizon, not placeholder content.

---

## STEP 10 — SEO/AEO/GEO TECHNICAL COMPLIANCE (the machine-readable layer)

Everything else in this prompt makes pages good for a human reader. This
step makes them legible to search engines and AI answer engines — without
this, none of the content/honesty work above becomes discoverable. For
every page/template touched in this session:

- **Unique, accurate meta title and meta description** — no two pages
  sharing identical metadata, no stale titles left over from the old design.
- **Open Graph and Twitter Card tags** — correct title, description, and a
  real image, so the WhatsApp share feature (already added this session)
  actually produces a proper link preview instead of a blank one.
- **JSON-LD structured data, applied honestly** — `FAQPage` schema for any
  real Q&A section already on the page (do not invent questions that aren't
  genuinely there), `WebPage`/`Article` schema, `BreadcrumbList` reflecting
  the real interlinking structure. Never fabricate a rating/review schema
  that doesn't reflect real data.
- **Correct heading hierarchy** — exactly one real `<h1>` per page, logical
  `<h2>`/`<h3>` nesting (an easy regression risk during a visual redesign).
- **Image alt text** — real, descriptive, not empty or generic, for every
  image including the celebrity photos added this session.

**Priority order for this step, tied to the project's own existing
research:** if time constraints mean this can't be completed on every page,
apply it first to the pages already identified in earlier research as
realistically winnable now — numerology/compatibility calculators and
specific long-tail Vedic tool pages — before spending time on pages
competing head-on with entrenched competitors (e.g. generic "kundli" or
"astrology" head-term pages), which are a longer-term fight regardless of
on-page SEO quality. Document the actual priority order used in the report.

**Testing for Step 10:** validate the JSON-LD on a sample of pages actually
parses as valid structured data (no malformed schema); spot-check that OG
tags render a real preview (not a broken image) when shared; confirm no
page is missing a meta title/description; confirm heading hierarchy has no
regressions from the visual redesign work in Steps 1-9.

---

## TESTING — EXHAUSTIVE, NOT A FORMALITY

For every page/template touched:

**Positive:** real valid input produces a correct, fully-rendered result
with every section present and accurate against the real engine.

**Negative/edge cases:** invalid input (malformed date, missing field,
unsupported location) handled gracefully, no crash, clear real error.
Unknown/missing birth time handled gracefully. A direct visit to any
carry-forward destination with no carried data — confirm its standalone form
still works.

**Payment — a real test, but only after verifying it's actually safe to run:**

**Before creating any test user or running any transaction, verify two
things explicitly, the same way the shared-Worker issue was discovered
earlier in this project — don't assume either is safe:**

1. **Confirm the preview environment is using Razorpay TEST-mode credentials,
   not live keys.** If there is any ambiguity about which keys are active,
   do NOT run a real transaction — fall back to verifying the paid/free gating
   logic by directly setting the test user's paid-status flag in the database
   (simulating a successful payment's end state) rather than pushing an
   actual charge through a potentially-live gateway.
2. **Confirm whether the preview environment uses a separate database or the
   same production Supabase instance as the live site.** If it's the same
   database, do not create ambiguous new-looking real data — reuse the
   existing designated test/admin account already used for testing elsewhere
   in this project (`hello@bornclock.com`) if it fits this purpose, and
   clearly mark or clean up any test records created afterward rather than
   leaving real-looking data in a shared production database.

Only once both are confirmed safe: create or reuse a test user, run the
payment flow, confirm paid-only content unlocks, then confirm that removing
this user's paid status correctly locks that content again. Skip
re-validating the payment gateway plumbing itself if already verified
earlier — focus on whether the redesigned pages correctly respect paid/free
state.

**Competitive/content-depth check:** for each major page, compare section
count and explanation depth against the project's own earlier competitor
research; confirm every technical term uses the shared glossary mechanism.

**Regression check:** the nine already-redesigned pages from Parts AJ/AK
still render correctly after this session's sitewide changes.

**Mechanical, every page:** full automated test suite passes; mobile
verified at a real width — density holds, nothing overflows or looks empty/
stretched; no console errors; WhatsApp share opens with a correct message
where applicable.

**If a bug is found: fix it, then re-run the relevant checks — a real
fix-and-retest loop, not a logged-and-moved-on note.**

---

## HANDLING BUILD/DEPLOY COMMAND FLAKINESS
Retry a failed/hanging build, test, or deploy command up to 3 times before
treating it as genuine; check for known-harmless patterns (a cron
exit-code-1) before concluding it's real.

## INCREMENTAL PROGRESS LOGGING
Append to `docs/part-al-progress.md` after each of the global steps (0, 1,
2, 2.5, 8) completes, AND after each individual page's full commit (theme +
density + carry-forward + feature-preservation + trust-strip + SEO) is
done — one log line per finished page, not a batch summary per category —
so if this session is interrupted at any point, exactly which pages are
genuinely finished is visible, not just which category was in progress.

---

## FINAL OUTPUT: A LAUNCH-READINESS REPORT, NOT A REVIEW REQUEST

Write to `docs/part-al-report.md` and include in full in your final message:
the audit, every Step 2 decision made, confirmation Step 2.5's shared CSS
fix was applied and verified, every page/template themed with
its category, the real payment test results, the competitive/depth check
results, the link-crawl and sitemap-accuracy results, the prerendering fix
confirmation, the trust-strip claims actually applied per page (9a), the
What's Ahead view's real output on the reference test chart (9b) with
confirmation the marriage-timing guardrail held, whether time-horizon views
already existed or were built new (9c), the Step 10 SEO/AEO compliance
results with the real priority order used, and the final isolated preview URL.
**State plainly what was
done, tested, and verified — not something awaiting approval.** Close with
an explicit launch-readiness checklist: every feature working (yes/no per
major area), every link working (yes/no), payment flow verified (yes/no),
all pages visually consistent (yes/no). Nothing is merged to `develop` or
deployed to production in this session.

---

## WHAT NOT TO DO
- Never run a real `wrangler deploy` or promote a version — the one hard
  rule, throughout.
- Do not stop to ask a question or flag a decision for review.
- Do not remove or break any existing real feature, calculation, or
  paid-content gate.
- Do not leave genuinely empty space, and do not artificially stretch sparse
  content either — add real supplementary content instead.
- Do not skip the real payment test by only reading code.
- Do not touch the homepage's own body/hero content (shared nav/footer
  components are fine).
- Do not visit 3,600 routes individually — fix at the template level.
