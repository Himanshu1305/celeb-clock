# Overnight Batch — Status Log

Branch: `overnight-batch` (off develop @ 05265d9 origin sync). Local commits only, no push.
Started: 2026-07-26.

Morning source of truth. One entry appended per phase.

---

## Phase 1 — Geo Flash Bug

**Root cause (confirmed by static trace):**
`src/hooks/useCountryCode.ts:57` returns `profile?.country ?? detected`. But `profile.country`
holds a **full country display name** ("India"), not a 2-letter ISO code — it is set at signup
from `ipapi.co json.country_name` and the full-name `@/data/countries` dropdown
(`src/pages/Auth.tsx:36-37`, `useAuth.signUp`). `CountryExtrasSection` keys its `COUNTRY_LABEL`
map by 2-letter ISO ('IN') (`CountryExtrasSection.tsx:7-9,54,64`).

Timeline of the mobile flash:
1. First paint (auth still loading): `profile === null` → hook returns `detected` = `'IN'`
   (2-letter, seeded synchronously from the `bc_country_code` cache) → `COUNTRY_LABEL['IN']`
   exists → section renders. **VISIBLE.**
2. `useAuth` `onAuthStateChange`/`getSession` resolves the profile after first paint
   (`useAuth.ts:35-52,61-80`, mobile token-refresh fires this again) → hook returns
   `profile.country` = `'India'` (full name) → `COUNTRY_LABEL['India']` is `undefined`
   → `label` null → section returns null. **VANISHES.** = the flash.

Secondary vector (same family): empty-string `profile.country` → `'' ?? detected` returns `''`
(`??` does not coalesce empty string) → falsy → section hidden.

Desktop "stays visible": founder tested desktop logged-out (profile null → detected 'IN' stays)
or desktop auth resolved pre-paint; the code defect is device-independent.

**1a evidence (deployed bundle):** `curl https://bornclock.usdvisionai.workers.dev/` →
`/assets/index-B3B0npb6.js`; grep of that asset returns `bc_country_code` (the b697322 fix
is live) but NOT `bc_country_code_v2` — confirms the insufficient prior fix is deployed and
tonight's fix is new/undeployed.

**Fix applied (`src/hooks/useCountryCode.ts`):**
1. `isValidCode()` guard — accept a value only if it matches `/^[A-Za-z]{2}$/` (ISO2). This
   rejects both the full-name `profile.country` ("India") AND empty string, so neither can
   override the correctly-resolved ipapi ISO2 code. No name→code normalizer built (scope note).
2. LATCH via `useRef`: once a valid code resolves from any source it is held; the return value
   only transitions null→code or code→code, never code→null. Mid-session re-renders
   (token-refresh, tab focus) can no longer collapse it.
3. Cache key bumped `bc_country_code` → `bc_country_code_v2` to invalidate stale mobile caches
   that may hold a non-ISO2 / empty value.

Typecheck: geo files clean (`tsc -p tsconfig.app.json` — only pre-existing stale-Supabase-type
errors in BirthdaySearchService/PromoCodeService, unrelated).

Status: DONE. Commit: (see git log — fix(geo): latch resolved country...).

---

## Phase 2 — Founder-Reported Bugs

**2b PDF calc bug — DONE (commit 3fa9703).** "With Optimized Lifestyle 70.2 yrs
(51.5 yrs remaining)" at age 44: remaining was computed from
`result.controllablePotential` (theoretical ceiling ≈95.5) while the age shown was
`displayedOptimized` (70.2). 44+51.5=95.5≠70.2. Fixed all three render sites to use
`displayedOptimized − currentAge` (→26.2): LongevityHeroCard.tsx:15,
EnhancedLifeExpectancyReport.tsx:126, LifeExpectancy.tsx:169 (copy-summary).
`result.yearsRemaining` (finalForecast−age) was already correct, untouched.

**2c Tab overlap — DONE (commit 6384046).** `EnhancedLifeExpectancyReport.tsx:279`
TabsList used `grid grid-cols-3 w-full`; at ~360–380px each ~120px cell was too
narrow for the whitespace-nowrap labels → overlap. Switched to the codebase's
mobile-scroll idiom (HealthGuideSection): `flex + overflow-x-auto` mobile,
`grid-cols-3` sm+. Triggers now `shrink-0 min-h-[44px] px-4 text-sm`; active tab =
primary text + bold + primary/5 bg + underline. Horizontal scroll instead of
truncation at 360px. (Visual 360px assertion deferred to Phase 3 mobile Playwright.)

**2a Longevity PDF blank pages — DONE (commit 2a507b0).**
- ROOT CAUSE (mobile, not reproducible in headless page.pdf): print iframe was
  1px×1px. Mobile browsers lay iframe content out at the iframe viewport before
  printing → 1px column wrap → exploded height → many broken/near-blank pages.
  Fixed: iframe now real off-screen A4 (210mm×297mm).
- Print-CSS hardening: `.page` inset moved from block `margin:1.2cm` into padding
  under `@page margin:0` (block margins leak onto next page at forced breaks);
  `.page:last-of-type` no longer forces a trailing break (killed guaranteed
  trailing blank).
- Extracted print-HTML builder → `src/pages/longevityBlueprintHtml.ts` (pure fn);
  added `scripts/verify-longevity-print.mjs` headless harness.
- EVIDENCE (harness, age-44): OLD & FIXED both 15 pages, 0 blank, 2 sparse
  (p9 41%, p13 38%) in faithful + mobile-margin modes → geometry preserved, no
  regression. Fully-blank symptom is a real-mobile-print-dialog artifact the
  1px→A4 iframe change targets; Chromium page.pdf cannot emulate it.

Status: DONE.

---

## Phase 3 — Full-Site Bug Hunt

**3a — DONE.** Initial gauntlet run: 40 pass / 36 fail, ALL failures
`connect ECONNREFUSED :3001` (no API backend; vercel CLI unavailable). Brought
up the backend locally via `wrangler dev --port 3001` (local-only `.dev.vars`
from `.env.local`, never committed; scheduled worker NOT auto-triggered — Rule 4
safe). Re-ran: **84/84 pass.** Tonight's changes caused ZERO regressions.

**3b — DONE (commit 871ef66).** New `e2e/launch-gauntlet/12-edge-cases.spec.ts`
(51 tests): invalid DOB (empty/future/impossible-date), leap-day + Dec-31 date
pages, 37-route static-nav sweep (non-empty + no undefined/NaN/null + no uncaught
error), **mobile-390px CountryExtrasSection for a mocked IN visitor + no-flash
latch re-check (validates Phase 1)**, life-expectancy Previous-disabled-on-step-1,
biological-age load, guest report locked-preview (real form flow), 404 + garbage
report/route slug handling. Full suite now **135/135 pass.**

**3c — DONE.** `scripts/page-sweep.mjs` → `docs/BUG-AUDIT.md`: 57 routes swept
runtime, **57/57 clean** (no console errors after env-noise filter, no
undefined/NaN/null, no empty renders). Findings documented: (1) malformed
save-report payload → ReportView toLocaleString crash (error-boundary-caught,
real form unaffected) — documented, not fixed (API scope); (2) DOB rollover —
FIXED in BirthdayReport; (3) `/results` thin render is the expected empty state;
(4) `/birthday/:month/:day` expects numeric month (alpha → graceful "Date not
found"); (5) title/meta uniqueness deferred to Phase 4 (prerendered output).

**3d — DONE.** Full gauntlet green: **135 passed** (84 original + 51 new).

Status: DONE.

---

## Phase 4 — Technical SEO (commit 905d4c8)

**4a — DONE.** Sitemap URLs now trailing-slash (Worker 307s non-slash→slash;
verified live with curl). robots.txt verified: GPTBot/ClaudeBot/Claude-Web/
PerplexityBot/Google-Extended/Bingbot all Allow /, Sitemap directive present,
private paths disallowed. llms.txt intact.

**4b — DONE.** Static WebSite+SearchAction+Organization present site-wide (base
index.html); homepage adds FAQPage (helmet). Added per-route BreadcrumbList
JSON-LD injection in prerender (truthful, path-derived) — now on all 880 deep
pages. No fabricated Person/ratings markup.

**4c — DONE.** Meta audit of all 881 prerendered pages: 0 missing titles, 0
missing descriptions, **0 duplicate titles/descriptions** after fixes. Fixed
malformed /birthday/{1-12} month titles (off-by-one slice → empty month; 12
duplicates → 0). (313 titles >70 chars / 312 desc >165 chars are SERP-truncation
only, not penalties — not individually rewritten.)

**4d — DONE (canonical) / DOCUMENTED (orphans).** ROOT FIX: helmet per-route
canonical/og:url/twitter:url were not captured in prerender → every page's
canonical pointed at home. Prerender now injects correct per-route trailing-slash
canonical + og/twitter url + og/twitter title. Verified: **0 home-canonical leaks
across 881 pages.** Orphans (<=1 internal inlink): 18/881 (16 blog posts + 1
compatibility + 1 rashi-ratna) — blog cross-linking noted for Phase 6.

**4e — DONE.** `npm run build`: **881 ok, 0 failed prerenders.** Spot-checked 5
pages (born-on/july-15, age-calculator, birthday/9, zodiac/leo, a blog post):
correct unique titles, per-route trailing-slash canonical, BreadcrumbList + 3
JSON-LD blocks each.

Status: DONE.

---

## Phase 5 — Keyword + Competitor Research

**DONE (commit: see git log for docs/SEO-STRATEGY.md).** Delivered
`docs/SEO-STRATEGY.md`. Competitor teardown from ACTUALLY-FETCHED pages:
famousbirthdays.com (home + /june25.html + a profile), cafeastrology.com,
calculator.net/age-calculator.html, livingto100.com, thefamouspeople.com.
onthisday.com and astro-seek.com returned HTTP 403 to automated fetch — recorded
as blocked, NOT characterised from memory (Rule 7). Includes: keyword map by
intent×difficulty mapped to existing routes; AEO/GEO section (the FAQ/answer-block
lane is uncontested — no fetched competitor had structured Q&A); prioritised
90-day action list. Key wedges identified: India nationality facet (famousbirthdays
has no nationality dimension), utility+identity+longevity fusion, and AEO blocks.

Status: DONE.

---

## Phase 6 — Content: New Pages + Existing-Page Edits (commit 7ffcbe0)

**6a — DONE (1 new page, quality over quantity).**
`/answers/how-many-days-until-my-birthday` — targets the cluster-(a) tool-intent
keyword "how many days until my birthday" (SEO-STRATEGY §2a). All claims are
computational/definitional (countdown method, 365 vs 366, Gregorian leap rule,
half-birthday) — NO external science claims, so Rule-7-clean by construction (no
fabricated citations possible). Full SEO wiring: unique title+desc in
prerender-titles map; registered in prerender-routes + sitemap; Breadcrumb +
Article + FAQPage JSON-LD; concise AEO answer block + question-shaped H2s.
Inbound internal links from 3 pages (HowToCalculateAge, WhoSharesMyBirthday, FAQ).

**6b — DONE.** Fixed 3 DEAD FAQ internal links (soft-404s to non-existent
/answers routes): 'How old am I in days?' → /answers/how-to-calculate-age;
'What is my birthstone?' → /birthstone; 'numerology life path' →
/answers/what-is-my-life-path-number. (FAQ already referenced the new countdown
page — dead until this page shipped, now live.) Blog posts already have a
category-based Related Articles section; the 16 low-inlink posts are reachable
via /blog + related blocks (left as documented in Phase 4).

**6c — DONE.** `npm run build`: **882 ok, 0 failed prerenders** (was 881). New
page verified: correct title, trailing-slash canonical, sitemap entry present.

Status: DONE.
