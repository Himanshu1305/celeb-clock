# Part R — Past-Period Reflection: Phase 0 Dependency Mapping

Everything this feature needs already exists and is reused; no new astronomy, no new
timing engine. This maps each dependency to the exact code it builds on.

## 1. Full-lifetime Dasha/Antardasha timeline (built D-Fix3)

- `BirthChartResult.dashaTimeline?: MahadashaPeriod[]`
  (`src/lib/vedic/calculateBirthChart.ts:118-119`).
- Shape: `MahadashaPeriod { lord, start, end, antardashas: AntardashaPeriod[] }`;
  `AntardashaPeriod { lord, start, end }` — all ISO date strings
  (`calculateBirthChart.ts:75-87`). Full lifetime = 9 Mahadashas × 9 Antardashas.
- Built by `generateFullChart()` (`engine/vedicEngine.ts`), validated 100% against
  ProKerala (Part B) and exercised by `yogaTiming.test.ts`.
- **This feature needs COMPLETED (past) periods relative to today.** We compare each
  Antardasha's `end` against `now`, and its `start` against the birth instant (the
  timeline includes the pre-birth *balance* of the first Mahadasha — we never ask about
  time before the person was born). See `selectReflectionQuestions` in
  `src/lib/vedic/reflection.ts`.

## 2. House-lordship data (needed for the sourced house-combination rules)

- `houseLordOf(chart, house)` — whole-sign lord of a house
  (`src/lib/vedic/yogaTiming.ts:61-65`, uses `SIGN_LORDS`).
- `planetsInHouse(chart, house)` — planets occupying a house
  (`yogaTiming.ts:66-68`).
- We define "a planet **signifies** a house" = it whole-sign-**lords** that house OR
  **occupies** it — the SAME deterministic definition already used by the D-Fix3 timing
  engine's `categorySignificators`. No new rule, reused engine data.

## 3. Saved-profile / reading-history mechanism (Parts E, P) — for "once ever" tracking

- Consent + persistence model mirrored from **reading history** (`readingHistory.ts`):
  device-local `localStorage`, **keyed by birth date (dob)**, **consent-gated by a saved
  profile** (Part E opt-in — birth data is only ever stored when the user explicitly
  saves it). Account-sync is a documented future bound, identical to reading history.
- New store: `src/services/reflectionResponses.ts`, key
  `bornclock-reflection-responses`. It records one immutable answer per (dob, theme),
  so each theme is asked **at most once, ever** — persistent, not per-session.
- **Robustness (adversarial):** the store has its OWN key and is dob-based, so
  regenerating the chart (same dob) still hides answered themes, and clearing a
  different piece of state (reading history `bornclock-reading-history`, or the saved
  profile `bornclock-birth-profile`) does not reset it. First answer is immutable, so
  rapid/careless taps cannot corrupt state.

## Where it computes / renders

- **Compute (server):** `api/vedic-reading.ts` calls `selectReflectionQuestions(chart,
  birthUTC, now)` and returns `reflections[]` in the reading payload — deterministic,
  computed fresh (never cached, since it depends on `now`).
- **Render (client):** `src/components/reading/PastPeriodReflection.tsx`, mounted in
  `src/pages/KundaliPage.tsx` after `<VedicReading>`, gated by saved-profile consent.
- **Type:** `ReflectionQuestionClient` in `src/services/readingService.ts`.

## What happens with the answer (Part 3 of the spec)

- Stored device-local against the profile (dob) for the person's own reference /
  analytics (`getReflectionResponses`).
- A "yes" is **NOT** used to make any other reading content more confident — that would
  be a separate, larger design conversation. This session only asks and acknowledges.
- Covered by the existing **Part E opt-in** consent (same gate as reading history); the
  reflection UI also states plainly that the reply is kept on-device, once per theme.
  No new category of data leaves the device.
