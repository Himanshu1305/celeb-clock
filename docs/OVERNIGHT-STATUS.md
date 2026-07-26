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
