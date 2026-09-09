# Part E (Saved Birth Profile + Navigation) — Phase 0 Touchpoints & Scope

> Deliverable for `docs/BornClock_PartE_SavedProfile_Navigation.md` Phase 0.
> Written before any feature code. Builds on Parts B + D.

## 0.1 — Every birth-details form

### A. Vedic birth-profile forms (date + time + PLACE — the profile this feature is about)
| Page/Component | Fields collected | Calls | Persists today? |
|---|---|---|---|
| `src/pages/KundaliPage.tsx` | dob (date), time, **city** (geocoded → lat/lon/tz) | `/api/kundali`, `/api/vedic-reading` | No |
| `src/pages/KundaliMatchPage.tsx` | Person A + Person B: dob + time each; **NO city — hardcodes Delhi (28.6139/77.209/5.5)** | `/api/vedic-profile` ×2 (`profileFor`) | No |
| `src/pages/BabyNamesPage.tsx` | dob + time; **NO city — hardcodes Delhi** | `/api/vedic-profile` | No |
| `src/components/BirthTimeVedicSection.tsx` (embedded in BirthdayReport) | time + **city** | `/api/vedic-profile` | No |

### B. Birthday-report flow (date + gender + country; Vedic section optional)
| `src/pages/BirthdayReport.tsx` | dob (via `DobInput`), gender, country; embeds `BirthTimeVedicSection` | `generateReportData` → `/api/save-report` | Saves the *report* to Supabase `birthday_reports`, but NOT the user's birth details as a reusable profile |

### C. Non-Vedic date-of-birth tools (date-only; use the ephemeral BirthDateContext)
~20 components collect a birth **date** for age/longevity/numerology/biorhythm (e.g. `AgeCalculator`, `LifeExpectancyCalculator`, `NumerologyLifePath`, `PlanetaryAge`, `BiorhythmPage`, `CompatibilityPage`, `DobCompatibility`). They read/write **`BirthDateContext`** (a single `Date`, in-memory) and have **no** birth time or place. These are a different concept from the Vedic profile.

### Reusable building blocks that already exist (reuse, don't rebuild)
- **`src/components/DobInput.tsx`** — polished DD/MM/YYYY entry (validation, paste, calendar). Reuse.
- **`src/components/BirthTimeVedicSection.tsx`** — time + city → vedic profile. Reuse/extend.
- **`src/services/geocoding.ts`** (`geocodeCity` → `GeoResult{lat,lon,utcOffset,...}`) — 24 Indian cities cached + Nominatim fallback.
- **`src/context/BirthDateContext.tsx`** — a shared Date context, but **deliberately non-persistent** (see below).

## 0.2 — Storage mechanism findings
- **Accounts exist** (Supabase auth: `useAuth`, `Auth`, `Profile`). But the **`profiles` table has NO birth column** (no `date_of_birth`/time/place). A `family_members` table has `date_of_birth`/`gender`/`country` (family dashboard), unrelated.
- **Existing storage pattern is deliberately anti-persistence for DOB.** `BirthDateContext` runs `localStorage.removeItem('bornclock-birthdate')` on mount, with the comment *"we no longer store health data in localStorage."* Introduced by commit `0d847c3` (*"…DOB privacy"*).
- **Privacy policy (`src/pages/Privacy.tsx`) is explicit:**
  - *"We do not store your health inputs, date of birth, or calculation results on our servers."*
  - *"Date of birth — used to calculate your real-time age… **Stored only if you explicitly save your profile.**"*
  - *"Correction — update your… date of birth from your Profile page."*

## 0.3 — What breaks / needs updating + the conflict to resolve
Updating the Vedic forms (0.1.A/B) to check-a-saved-profile / pre-fill / edit / save is the buildable core, and modest in size (~4-5 forms + nav + a storage hook + a shared form).

**BUT two decisions must be made before building — this is the Phase-0 "stop and flag":**

1. **Privacy vs. the spec's "silently save to cookie".** The spec says persist birth details automatically. The codebase *deliberately* removed DOB-in-localStorage, and the policy says DOB is *"stored only if you explicitly save your profile."* Silently persisting DOB (let alone time + place) would contradict a deliberate privacy decision and the written policy — a "do not silently change existing behaviour" violation. **Needs the owner's call** (explicit opt-in save vs. silent auto-save-with-policy-update vs. session-only).

2. **Account sync isn't cleanly buildable this session.** No birth column on `profiles`, and (per Parts B/D) Supabase migrations can't be reliably applied/verified from here. So "tie to account" would need an unverifiable DB migration. Realistic path: browser storage now, account-sync deferred.

3. **Scope of "every form".** Wiring the persistent profile into the ~20 non-Vedic date tools (0.1.C) would both balloon scope and re-persist DOB across the whole site (worsening #1). Recommend scoping the saved *profile* to the Vedic features (date+time+place); leave the age/longevity date-only tools on their existing ephemeral context.

## Navigation (Part E2) findings
- `src/components/Navigation.tsx` is dropdown-based (Explore / Astrology / More). **`/kundali-match` is not in the nav at all** today (only linked from an article + `DobCompatibility`). `/kundali` does not link to `/kundali-match`.
- Adding tabs/links from `/kundali` → `/kundali-match` (+ a documented placeholder slot for a future "Ask your personal astrologer" AI chat) is straightforward and matches the design system.

## Scope verdict
Build size is **moderate (~5 forms + nav + storage hook + shared form + tests)** — comparable to Part D and doable in one session **once decisions 1-3 are made**. Flagging now per the spec's Phase-0 discipline, because #1 is a privacy conflict I must not resolve silently.
