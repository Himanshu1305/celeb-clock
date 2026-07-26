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
