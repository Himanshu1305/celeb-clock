# BornClock — Vedic Integration Touchpoint Map (CONSOLIDATED, current as of Part K)

This is the single, current source of truth for where birth-chart data and the saved
profile live and connect. It supersedes the per-session touchpoint files (Parts B, D,
E, F, G, I, J), which are archived under `docs/archive/` for history. Verified against
the actual codebase at the end of Part K.

## 1. The engine (deterministic, Swiss-Ephemeris / Lahiri ayanamsa)
- `src/lib/vedic/engine/vedicEngine.ts` — `generateFullChart(birthUTC, refUTC, lat, lon)`:
  planets, Lagna, houses, Vimshottari Mahadasha + **full-life dasha timeline**, doshas,
  Sade Sati status. Helpers: `getSaturnSignIndex(date)`, `getSiderealLongitude(planet, date)`,
  `SIGN_LORDS`, `RASHI_NAMES`.
- `src/lib/vedic/calculateBirthChart.ts` — `calculateBirthChart(input, {includeShadbala, refDate})`
  → `BirthChartResult` (adds Navamsa/Dasamsa/D60, Shadbala, KP, `dashaTimeline`, `yogas`).
  100%-validated against `scripts/vedic-lab/*.cjs` (see `engine.test.ts`).
- `src/lib/vedic/yogas.ts` — `detectYogas(chart)` → graded Yogas with participating planets + conditions.
- `src/lib/vedic/yogaTiming.ts` — activation timing: `windowsForSignificators`, `categoryTiming`,
  `allCategoryTimings`, `buildTimingFacts`, `currentDashaTag` (cache-staleness key).

## 2. Feature engines (all reuse §1)
| Feature | Module | Key fn | Endpoint | Page |
|---|---|---|---|---|
| Reading (LLM + checkers) | `readingPrompts.ts` + `readingSpecificity.ts` | `extractReadingFacts`, `verifyReadingClaims`/`verifyTimingClaims`/`verifyYogaClaims` | `/api/vedic-reading` | `/kundali` |
| Astrologer chat (LLM + guards) | `chatGuardrails.ts` + `api/vedic-chat.ts` | `buildChatSystemPrompt(facts, gemstone?)`, `buildChatReply` (3-attempt guard: safety+date+yoga) | `/api/vedic-chat` | `/astrologer` |
| Matching (Guna Milan) | `matchmaking.ts` | `calculateGunaMilan(a, b)` | `/api/kundali-match` | `/kundali-match` |
| Gemstones (Lagna-based) | `gemstones.ts` | `buildGemstoneReport(chart)`, `gemstoneChatContext(chart)`, `verifyGemstoneReport` | `/api/gemstones` | `/gemstones` |
| Sade Sati / Dhaiya | `sadeSati.ts` | `computeSadeSati(moonSign, now, saturnSignAt)` | `/api/sade-sati` | `/sade-sati` |
| Muhurat / Panchang | `panchang.ts` | `computePanchang`, `findMuhurats`, `muhuratMethodology` | `/api/muhurat` | `/muhurat` |
| Career report | `careerReport.ts` | `buildCareerReport(chart)` | `/api/career-report` | `/career-report` |

All feature endpoints are registered in `functions/_worker.ts`. Chat/reading use Gemini
with deterministic accuracy checkers; every other feature is fully deterministic (no LLM).
Every feature now carries a real, chart-specific **methodology note** (reading, matching,
gemstone, career, Sade Sati, Muhurat).

## 3. Saved profile (opt-in, device-only) — PROGRESSIVE
- `src/services/savedProfile.ts` — `SavedBirthProfile { dob; time?; city?; savedAt? }`
  (**dob required; time/city optional** since Part J). `isValidProfile` (partial-tolerant),
  `isFullVedicProfile`, `mergeProfile`. localStorage key `bornclock-birth-profile`.
- `src/hooks/useSavedProfile.ts` — `{ profile, loaded, isFull, save, clear, refresh }`.
- `src/components/BirthDetailsForm.tsx` — shared date+time+city form (pre-fills partial `initial`).
- `src/components/SavedDateOffer.tsx` — reusable offer-reuse/offer-save bridge for date-only tools.
- `src/services/profileSync.ts` — account-level sync (`syncProfileToAccount`, `loadProfileFromAccount`,
  `resolveWithConflict`, `resolveAccountProfile`, `sameProfile`). **ACTIVE (Part L):** the
  `profiles.birth_profile` (jsonb) column exists; a logged-in user's profile syncs to their account
  row (matched by `user_id`) and follows them across devices; anonymous users stay device-only. On a
  device-vs-account conflict the account wins and `ProfileConflictNotice` surfaces a one-tap switch.
- `src/components/ProfileConflictNotice.tsx` — global notice for the device-vs-account conflict case.

## 4. Where the saved profile is integrated (current)
- **Full Vedic profile (date+time+place)** — reused, prompting only for missing pieces:
  `/kundali`, `/kundali-match`, `/astrologer`, `/sade-sati`, `/career-report`, `/gemstones`,
  and the birthday-report Vedic section (`BirthTimeVedicSection`).
- **Date-only reuse** (offer-reuse + offer-save via `SavedDateOffer`): `/age-calculator` (page-level
  bridge, Part K.1), `/moon-sign` (Part K.6), and — **added in Part L Item 2** — `/chinese-zodiac`,
  `/vedic-zodiac`, `/biorhythm`, `/tarot-card-by-birthday`, `/planetary-age`, `/life-expectancy`.
- **Account sync (Part L Item 1):** for logged-in users, all of the above reuse the account-synced
  profile across devices via `profileSync` + `useSavedProfile`.

## 5. Deliberately EXCLUDED from the self-profile (by design, documented)
- **Baby Names** — checks a different child each time.
- **Birthday Report (`/birthday-report`)** — a GIFT report about a *recipient* (recipientName +
  gifterName + recipient DOB), not the user's own chart.
(As of Part L, the previously-deferred single-date novelty tools are now integrated — see §4.)

## 6. Deeper detail / history
Per-session touchpoint files (Parts D, E, F, G, I, J) are in `docs/archive/`. Session flag files:
`docs/part-i-flags.md`, `docs/part-j-flags.md`, `docs/part-k-flags.md`. Deferred: account-level
profile sync (column not yet added — ready-to-run SQL in part-k-flags.md).
