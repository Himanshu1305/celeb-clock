# SESSION REPORT — OPTION C (Celebrity Personalization + Gauntlet Expansion)

**Date**: 2026-07-15  
**Branch**: develop  
**Total commits this session**: 9 (416ecc4 → 4c4a0ec)

---

## Per-Part Results

### FIX 3 — Single canonical celebrity ranking (`416ecc4`)
- Removed `TIER_ORDER` secondary sort from `CelebrityMatch.tsx`
- Fixed `TodaysBirthdays.tsx` redundant sort
- Fixed `ReportView.tsx` country param passed to ranking service
- **Result**: All surfaces now call `getRankedBirthdayCelebrities(date, null, n)` — identical global ranking everywhere

### FIX 4 — Mobile navigation menu (`65f4b01`, `a8204a3`)
- Rewrote `Navigation.tsx` with hamburger pattern: `md:hidden` button, fixed overlay at `top: 56px`
- Four section groups: Popular / Numerology / Astrology / More Tools
- Touch targets: `min-h-[44px] py-3.5` on all mobile link items
- Hamburger button bumped to `p-3 min-h-[44px] min-w-[44px]` (was 32px, now 44px — WCAG compliant)
- Desktop nav unchanged (`hidden md:flex`)

### Part 1 — Global canonical celebrity list (`7681575`)
- `CelebrityMatch.tsx`: `getRankedBirthdayCelebrities(date, null, 12)` — removed `profile?.country`
- `TodaysBirthdays.tsx`: `getRankedBirthdayCelebrities(monthDay, null, 50)` — removed userCountry
- `ReportView.tsx`: `getRankedBirthdayCelebrities(date, null, 6)` — removed country param
- **July 15 top-6**: Richard Branson, Rembrandt, Arianna Huffington, Linda Ronstadt, Forest Whitaker, Kim Alexis

### Part 2 — Mobile menu verification (via Part FIX 4)
- Before: overflow, clumped items, no structure
- After: clean fixed overlay, section labels, scroll support, touch targets ≥44px

### Part 3 — "From India" additive section (`fc99bef`)
- New: `src/hooks/useCountryCode.ts` — `profile?.country` → `detectCountry()` → null
- New: `src/services/BirthdaySearchService.ts#getCountryExtras()` — top 200 from DB, filter by `CELEBRITY_NATIONALITY` map (since `nationality_code` is NULL in DB)
- New: `src/components/CountryExtrasSection.tsx` — renders below global list; exits early if `window.__PRERENDER__`, no IN celebs, or not loaded
- Added `CountryExtrasSection` to: CelebrityMatch, TodaysBirthdays, BornOnDay
- **July 15 India extras = 0** — expected; no IN celebs for that date in the nationality map
- PDF/ReportView personalization deliberately deferred

### Part 4 — Architecture docs (`35b2b47`)
- `ARCHITECTURE-DECISIONS.md` §2: "Celebrity list ordering — industry pattern (NEVER violate)"
- `ARCHITECTURE-DECISIONS.md` §8: Country extras via COUNTRY_LABEL map, future country landing pages, PDF deferred

### Part 5 — Prerender fix + deploy (`54c2e81`)
- **Bug caught**: prerender was running on Indian machine → ipapi.co returned IN → `CountryExtrasSection` rendered in prerendered HTML → India extras appeared in static snapshot for all users
- **Fix**: `page.evaluateOnNewDocument(() => { window.__PRERENDER__ = true; })` before each `goto()` in `scripts/prerender.mjs`. Component guards on `window.__PRERENDER__`.
- **Note**: First attempt used `page.addInitScript()` (Playwright API) but prerender uses puppeteer-core → correct call is `page.evaluateOnNewDocument()`
- Deploy: `./node_modules/.bin/wrangler deploy` — deployed version `54c2e81`

### Part 6 — Gauntlet expansion (`4c4a0ec`)
**New spec files (41 new tests; total 84/84 green):**
- `07-subscriptions.spec.ts` — upgrade page 3 tiers + create-subscription API validation (5 tests)
- `08-born-on.spec.ts` — index 12 months, july-15 title+cards, feb-29, invalid slug redirect, canonical order stability, prev/next links (6 tests)
- `09-mobile.spec.ts` — 390×844 no-overflow (4 routes), hamburger visible/open/close/backdrop, touch targets (10 tests)
- `10-emails-and-reports.spec.ts` — send-email (missing fields, unknown type→400), save-report (GET 405, missing body, future DOB→400, valid anon→200+slug) (8 tests)
- `11-seo-surface.spec.ts` — robots.txt (GPTBot, Sitemap), sitemap.xml >800 entries, llms.txt header, OG PNG valid, 3 distinct born-on titles, canonical link (9 tests)
- `scripts/test-subscription-lifecycle.mjs` — HMAC baseline, forged/empty/missing sig → 403, subscription.cancelled/halted routing → 200; DB-state checks marked TODO (not fake)

**API fixes caught by new tests:**
- `api/save-report.ts`: future `recipientDob` now returns 400 (was silently inserting)
- `api/send-email.ts`: unknown email type now returns 400 (was returning 500 via `sendEmailDirect` returning false)
- `Navigation.tsx`: hamburger 32px → 44px (WCAG touch target caught by spec 09)

### Part 7 — This report

---

## Commit Hashes

| Commit | Description |
|--------|-------------|
| `416ecc4` | FIX 3: single canonical celebrity ranking |
| `65f4b01` | FIX 4: mobile navigation menu layout |
| `7681575` | Part 1: global celebrity list (null country everywhere) |
| `a8204a3` | Part 2: mobile navigation and layout |
| `fc99bef` | Part 3: additive "From India" celebrity section |
| `35b2b47` | Part 4: celebrity personalization policy + roadmap docs |
| `54c2e81` | Part 5: suppress CountryExtrasSection from prerendered HTML |
| `4c4a0ec` | Part 6: gauntlet expansion (84 tests) |

---

## Deployed Version

**Deployed commit**: `54c2e81` (Part 5 — last build+deploy in this session)  
**Part 6 changes** (API fixes, new spec files, Navigation hamburger size) are committed but not deployed. Next deploy will include them.

---

## Bugs Caught by New Tests

1. **save-report future DOB** — No validation existed. A future birth date would silently insert into the DB. Fixed with a 400 gate before the Supabase insert.
2. **send-email unknown type → 500** — `sendEmailDirect` returns `false` for unknown types, which the handler converted to 500. Fixed with an explicit type whitelist returning 400.
3. **hamburger touch target 32px** — Gauntlet spec 09 caught that the hamburger button was 32px, below WCAG 44px minimum. Fixed with `p-3 min-h-[44px] min-w-[44px]`.

---

## TODOs and Skipped Items

- **PDF/ReportView personalization** — Deferred. CountryExtrasSection is suppressed in prerender; PDF is static so personalization needs different approach.
- **DB-state checks in subscription lifecycle** — Webhook routing confirmed (200 on valid HMAC for subscription.cancelled/halted). DB-state verification (confirming `premium_status` cleared in profiles table) requires seeded test user in staging environment. Marked TODO in `scripts/test-subscription-lifecycle.mjs`, not faked.
- **Country landing pages** (`/born-on/{date}/india`) — Future SEO work, documented in ARCHITECTURE-DECISIONS §8.
- **`COUNTRY_LABEL` expansion** — Currently only `IN` is enabled. Adding more countries is additive: add to the map and the `getCountryExtras` filter uses `CELEBRITY_NATIONALITY`.

---

## Himanshu Mobile Test Checklist

Manual checks to run on a real device (iOS/Android):

1. Open `https://bornclock.com` on mobile  
2. ✅ Hamburger button is visible and easily tappable (≥44px)  
3. ✅ Menu opens and shows: Popular / Numerology / Astrology / More Tools sections  
4. ✅ Tap a menu item — menu closes, page navigates  
5. ✅ Backdrop tap (behind menu) closes it  
6. ✅ No horizontal scrollbar on any page  
7. ✅ `/born-on/july-15` — celebrity grid loads without jank  
8. ✅ If in India: "Born this day — from India 🇮🇳" section appears below global list (for dates where Indian celebrities exist in the nationality map)  
9. ✅ Upgrade page: 3 pricing cards visible, no overflow  
10. ✅ Birthday report form: DOB picker usable with thumb
