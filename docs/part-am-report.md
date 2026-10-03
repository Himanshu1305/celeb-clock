# Part AM — Content Expansion + SEO/AEO Magnets — Report

**Branch:** `part-aj-four-page-redesign` (continued; not develop, not a new branch).
**Hard Rule honored:** no real `wrangler deploy`, no version promoted. Preview = isolated
`wrangler versions upload`. **Nothing merged, nothing deployed, homepage untouched.**
**Final isolated preview:** **https://d7dd234e-bornclock.usdvisionai.workers.dev** (version
`d7dd234e-7c4f-452b-af2a-72e7a1324741`).

This states what was actually done and **verified against real served output** (Fifth Rule) — and,
plainly, what was **not** reached. It is deliberately honest about scope: the Part AM backlog
(~106 old-design pages + Science rebuild + new magnet pages + nav/footer) is far larger than one
working block, and per the Fourth Rule I finished a smaller number of things completely and verified,
rather than claiming broad coverage.

## Drift-check (re-confirmed before each part, per Part AM's anti-drift rule)
Operated throughout under: Hard Rule (no promotion), per-page commits, conservative-omission, and the
**Fifth Rule — verify real served output, fetched fresh, never source/build alone.** The Fifth Rule
earned its keep this session (caught two real bugs invisible to tsc/build — see below).

## Upfront decisions (required by the spec)
1. **All structured data → body-rendered `src/components/JsonLd.tsx`**, never Helmet (known prerender race). Applied to every page touched.
2. **Sitewide `WebPage`-schema gap → FIXED now, not deferred:** `scripts/prerender.mjs` now injects a per-route `WebPage` (from the real title/description/canonical) right after its existing BreadcrumbList injection, deduped so pages already carrying one don't double up.

## Global fixes (committed independently)
- **JSON-LD in-body fix** (`ba4fca5`, from AM-prep): root cause was the prerender capturing `outerHTML`
  before react-helmet-async flushes. Verified live this session.
- **`WebPage` prerender injection** (`b1b13f6`): decided + implemented.
- **Generic-title bug fix** (`<title>` — a real Fifth-Rule catch, `#commit` below): `/sade-sati`,
  `/muhurat`, `/gemstones`, `/astrologer` had been added to the prerender list in AL Step 7 but had
  **no `prerender-titles` entry**, so they served the **generic homepage `<title>`** and got no
  WebPage schema. AL's checks only looked at the `<h1>` (from the React body), not `<title>`, so it
  was missed. Added real per-page title/description entries (also career-report, name-numerology).
  **Verified in the final prerendered output:** all six now carry correct unique titles + WebPage=1.

## Part A — old-design pages completed this session (Fourth Rule, one commit each)
Priority order (winnable-first, across categories):
1. **`/career-report`** (Vedic) — paj editorial theme, trust strip ("actual 10th house and
   career-timing periods"), **DOB carry-forward** (`?dob&time&place&lat&lon&tz`, auto-generate, fresh
   beats saved profile), in-body WebApplication JSON-LD. All report sections + GradeLegend preserved.
2. **`/name-numerology`** (Mystic) — paj atlas theme, trust strip, in-body WebApplication + FAQPage
   JSON-LD (replacing the broken Helmet versions). Calculator + breakdown + FAQ preserved.

**Verified live (Fifth Rule)** on the final preview: career-report = 6 schema objects / 0 errors,
carry-forward renders a real computed report; name-numerology = 6 objects / 0 errors; both single-`<h1>`,
no JS errors.

**Honest scope statement:** that is **2 of the ~106** remaining old-design pages this block (on top of
AL's 2). The structural global fixes above (JSON-LD, WebPage, titles) also improved the 9 previously-
redesigned pages' real served schema — but the large Part A backlog remains (see "Not done").

## Part B — content-gap research ✅ (`docs/part-am-content-gap-research.md`)
Qualitative, grounded in the existing SEO-MAGNET baseline + the real route inventory + known competitor
clusters; **no fabricated search-volume numbers.** Top Part C candidates identified: `/manglik`
(reuses the dosha engine), `/angel-numbers`, `/personal-year-number`, `/kaal-sarp-dosha`.

## Part C — NEW magnet pages: NOT built this session (honest)
Research (Part B) is done and actionable, but no new page was created this block. Deferred rather than
ship a rushed/under-verified new page (each needs full theme + glossary + real computed example + SEO +
its own build/validate cycle). This is the primary next-block work.

## Part D — strengthened structured-data validation (real validator, not "serializes")
Ran the actual content through **`validator.schema.org`** (real external validator) on the live preview:

| Page | Objects | Errors | Warnings |
|---|---|---|---|
| `/career-report/` | 6 | 0 | 0 |
| `/name-numerology/` | 6 | 0 | 0 |
| `/compatibility/` | 6 | 0 | 0 |
| `/numerology/` | 7 | 0 | 0 |
| `/sade-sati/` | 4 | 0 | 0 |
| `/muhurat/` | 4 | 0 | 0 |
| `/gemstones/` | 4 | 0 | 0 |

## Part E — payment key resolution (genuine fresh attempt, not last session's default)
Tried harder than last session (which only read `.env` files): checked the **actual served preview
bundle**. Finding — the uploaded preview **ships the LIVE Razorpay key** (`rzp_live_***`), because
`npm run build` (vite mode=production) loads `.env.local` (live key); `.env.preview`'s test key is
only used with `--mode preview`, which the build didn't use. **So the preview checkout is live mode.**
Per the Hard Rule ("if unsure / unsafe, pick the safer path"), a real transaction was **NOT run** —
this is now an **evidence-based** decision, not ambiguity. Fallback verification (read-only): **no
paywalled/payment file was modified this session** (`git diff` over the whole AM session touched zero
of ReportView/BirthdayReport/Upgrade/Pricing/entitlement/Razorpay), and the gating logic is intact.
**Real finding + recommendation:** the preview build should be run with `--mode preview` (test key)
before any future payment test; as built today, "staging" payment would hit the live gateway.

## Self-verification pass (fresh, right before this report)
- **Full test suite (fresh):** 152 files / **1860 passed**, **26.3s real** elapsed.
- **Live validator:** table above — 0 errors across the sample (incl. pages not checked mid-session).
- **Live link crawl (fresh):** 128 unique internal links across touched + AL pages → **0 dead**.
- **Computed output (Fifth Rule):** career-report carry-forward produces a real report on the live page.
- **Real elapsed (git timestamps):** AM session commits span `07:20:32 → ~08:40` (~80 min of commit
  activity); three full production builds this session measured at **957s, 924s** (~15–16 min each) via
  real start/end timestamps — not estimated.

## NOT done this session (plain backlog — the honest part)
- **Most of Part A (~104 pages):** `/sun-vs-moon-sign`, `/moon-sign`, `/astrologer` (full theme — only
  its prerender title/schema was fixed, it is still old cosmic design), `/zodiac`, `/chinese-zodiac`,
  `/tarot-card-by-birthday`, the Birthday templates (`/born-on/[date]`, celebrity profile,
  `/todays-birthdays`, `/age-calculator`), and the long tail.
- **Science & Longevity full rebuild** (`/life-expectancy` + `/biological-age` + quiz) — deferred a
  third time; a 1,200-line paywalled app, not safely finishable in the remaining block without risking
  a half-done revenue-critical page. Its H1/SEO were already handled in Part AJ; it still works.
- **Part C new magnet pages** — research done, build deferred.
- **Shared Navigation/Footer restyle** — deferred again (same documented reason: shared by 100+ still-
  old pages; restyling now risks visual regressions across them). Redesigned pages use the paj shell.

## LAUNCH-READINESS CHECKLIST (updated)
- **Structured data correct on real output:** YES for all pages touched/validated (0 errors) + the
  WebPage/title global fixes. The old generic-title bug on 4 pages is **fixed**.
- **Every feature working (pages touched):** YES — career-report, name-numerology, and the AL set
  verified live; computations intact.
- **Every link working:** YES across the redesigned surface (128 checked, 0 dead); full 3,635-route
  crawl not done individually (template-level, per the prompt).
- **Payment flow verified:** gating intact (YES); live transaction NOT run (evidence: preview ships
  live key) — conservative, documented.
- **All pages visually consistent:** PARTIAL — the redesigned set is consistent; ~100 old-design pages
  remain (unchanged, not broken).

## Commits this session
`ba4fca5` JSON-LD in-body fix · `d350934` live-validation record · `b1b13f6` WebPage global fix ·
`6bdbd10` /career-report · `9ae2d76` /name-numerology · `5ae9516` Part B research · (title-fix) ·
this report.
