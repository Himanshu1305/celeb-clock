# Vedic Engine Integration — Phase 0 Touchpoints Inventory

> Deliverable for `docs/BornClock_Prompt1_EngineIntegration_and_UX_v2.md` Phase 0.
> Produced before any integration code was written. This is the authoritative
> list Part B4 ("update every touchpoint") must work through.
>
> **Legend for "Session impact":**
> - **AFFECTED** — this session's abstraction-layer / reading-UX changes must update this file.
> - **REVIEW** — touches chart data but may not need changes; must be checked before Checkpoint 1.
> - **NOT AFFECTED** — displays static/derived Vedic content, no live chart computation; listed for completeness so a future session need not re-discover it.

---

## 0.1 — Callers of birth-chart data

### A. Backend / API (ProKerala + cache)

| # | File | What it currently does | Session impact |
|---|------|------------------------|----------------|
| 1 | `api/kundali.ts` | Main chart handler. OAuth to ProKerala `/token`; parallel fetch of `planet-position`, `birth-details`, `kundli/advanced` (ayanamsa=1). Validates each with `checkProKeralaStatus` + a ≥9-planet / Ascendant-present / non-null-nakshatra completeness gate. Reads/writes `vedic_chart_cache` via inline `getCachedChart`/`setCachedChart` (`cache_key = [y,m,d,h,min,lat.toFixed(4),lon.toFixed(4),tz].join('-')`, `source:'prokerala'`). Returns `{lagna, planets[], nakshatra, rashi, dasha, requires_birth_time, _cache}`. | **AFFECTED** — becomes a consumer of the new abstraction layer; local engine first, ProKerala fallback. Keep cache + `checkProKeralaStatus` exactly. |
| 2 | `api/vedic-profile.ts` | Lighter date-first handler. Always calls `birth-details`; calls `kundli/advanced` only when birth time present. Cache key prefixed `vp`, time→`x` when no birth time. Returns `{nakshatra, rashi, lagna:null, dasha, requires_birth_time, input_summary, _cache}`. **Does NOT call `checkProKeralaStatus`** — latent silent-failure bug (rate-limit/error responses can be cached with null fields). | **AFFECTED** — rewire to abstraction layer; add the missing completeness guard. |
| 3 | `functions/_worker.ts` | Cloudflare Worker router; maps `/api/kundali` and `/api/vedic-profile` to their handlers. `bridgeEnv()`/`BRIDGE_KEYS` (lines ~49-58) does **not** bridge `VITE_PROKERALA_*` into `process.env`. | **AFFECTED/REVIEW** — confirm engine (astronomy-engine, no network) works in the Worker runtime; ensure any new env keys bridged. |

### B. Client services / utils

| # | File | What it currently does | Session impact |
|---|------|------------------------|----------------|
| 4 | `src/services/kundaliService.ts` | `fetchKundali()` → `GET /api/kundali` (y/m/d/h/min/lat/lon/tz); `buildInterpretation()` prose; `hasProkeralaKey()`. | **AFFECTED** — consumes `/api/kundali` result shape; must tolerate new fields (`source`, `warnings`, divisional charts, shadbala). |
| 5 | `src/utils/vedicCalculations.ts` | Client-side ephemeris via `@fusionstrings/panchangam` (Swiss Eph WASM). `isNearNakshatraBoundary()`; `tryProkeralaBoundary()` is a **stub returning null**. | **REVIEW** — may be superseded by the local engine; do not remove without checking callers. |

### C. UI consumers that display chart data

| # | File | Displays | Session impact |
|---|------|----------|----------------|
| 6 | `src/pages/KundaliPage.tsx` | Full chart: Lagna, Rashi, Nakshatra, Dasha, planets/houses. | **AFFECTED** — primary home for reading UX, D60 disclaimer, polar warning banner. |
| 7 | `src/components/KundaliChart.tsx` | North-Indian diamond SVG (houses, rashi, planets). | **REVIEW** — rendering only; check field compatibility. |
| 8 | `src/components/BirthTimeVedicSection.tsx` | Nakshatra (+pada/devanagari), Rashi, Lagna, Dasha; boundary warning. | **AFFECTED** — consumes `/api/vedic-profile`; add polar warning surface. |
| 9 | `src/pages/KundaliMatchPage.tsx` | Ashtakoota 36-point match; Nadi/Bhakoot dosha warnings. Calls `/api/vedic-profile` twice. | **AFFECTED** (data source) — behaviour must be preserved. |
| 10 | `src/pages/BabyNamesPage.tsx` | Nakshatra → auspicious name syllables. Calls `/api/vedic-profile`. | **AFFECTED** (data source). |
| 11 | `src/pages/admin/AccuracyDashboard.tsx` (`/admin/accuracy`) | Batch-tests `/api/vedic-profile` nakshatra vs 5 celebrity ground-truths. | **AFFECTED** — now exercises the local engine; ground-truth expectations still valid, becomes a live accuracy check. |
| 12 | `src/pages/BirthdayReport.tsx` | Collects DOB/time/city/gender/country; embeds `BirthTimeVedicSection`; calls `generateReportData()`. | **AFFECTED** — entry point for reading UX. |
| 13 | `src/services/BirthdayReportService.ts` | `generateReportData()`/`getReport()`/`saveReport()`; `vedicRashi` field via `getVedicRashi()`. | **AFFECTED** — where generated readings would be threaded/cached. |
| 14 | `src/pages/ReportView.tsx` | Renders report incl. Zodiac Profile (Western/Chinese/Vedic), Rashi essence, Nakshatra placeholder. | **AFFECTED** — reading sections render here (locked/unlocked). |
| 15 | `src/pages/CelebrityPage.tsx` | Rashi from DOB (static `calculateVedicRashi`, **no API**); bio from `celebrity-bios.json`; Nakshatra intentionally omitted (no birth time). | **REVIEW** — AI readings for celebrities explicitly OUT OF SCOPE this session (see 0.2). |

### D. Static / educational (NOT AFFECTED — no live chart computation)

`src/pages/VedicZodiac.tsx`, `src/pages/VedicZodiacSign.tsx`, `src/pages/MoonSignPage.tsx`,
`src/pages/RashiRatnaPage.tsx`, `src/components/NakshatraPlaceholder.tsx`,
`src/pages/articles/VedicAstrologyArticle.tsx`, `src/pages/articles/NakshatraArticle.tsx`,
`src/pages/articles/KundaliCompatArticle.tsx`, `src/pages/answers/WhatIsVedicAstrology.tsx`,
`src/pages/BirthdayReportGiftPage.tsx`, `src/pages/DiwaliGiftPage.tsx`.

### E. `chart.warnings` readers

No generalized `chart.warnings` consumer exists today. Warning-style UI is bespoke:
`KundaliMatchPage.tsx` (Nadi/Bhakoot dosha) and `BirthTimeVedicSection.tsx` (nakshatra boundary).
A `POLAR_LATITUDE` warning banner is **net-new UI** to be added at touchpoints 6 & 8.

### F. Background / cron chart precompute

**None.** `wrangler.toml` crons are email/ops digests; `.github/workflows/deploy.yml` nightly job runs
celebrity-bio auto-fill only. No chart batch/precompute job exists. All charts are on-demand.

---

## 0.2 — Downstream consumers of generated reading content

- **Birthday PDF report:** `src/pages/LifeExpectancy.tsx` + `src/pages/longevityBlueprintHtml.ts` produce a
  **longevity** blueprint only — **no** Vedic chart data today. Vedic readings would need explicit wiring to
  appear in a PDF; **deferred** this session.
- **Celebrity bio generation** (`scripts/generate-celebrity-bios.ts`, `scripts/auto-bio-fill.ts`,
  `scripts/fill-bios-celebrities.ts`) shares **no** code path with a chart-reading generator. They use Gemini
  (`gemini-flash-latest` / `gemini-2.0-flash`) for 130-180-word encyclopedic bios — a useful **tone reference**
  for the reading prompts, not a shared module.
- **Decision:** AI-generated *readings for celebrity pages* are **explicitly OUT OF SCOPE** this session. The
  Gemini reading-prompt structure will be built as a standalone, reusable module (input: chart fields → output:
  life-area text) so a future session can point celebrity pages at it, but no celebrity reuse is wired now.

---

## Discrepancies found vs. the prompt's assumptions (surface before proceeding)

1. **`all-100-charts.json` does not exist.** No validated JSON test data persists in `scripts/vedic-lab/`
   (only `.cjs` scripts). Part C's "reuse the 100-chart validated set" and "known ~4% Kaal Sarp residual test
   cases" cannot be reused as written — they would have to be regenerated (needs live ProKerala/AstrologyAPI
   calls, which cost rate-limit budget).
2. **No AstrologyAPI code** exists in the repo — it's named only as a ground-truth credential.
3. **Playwright targets remote `https://staging.bornclock.com`**, not localhost. The new polar-banner /
   reading-UX E2E tests can only pass after a deploy to staging (~11 min build) OR by using
   `playwright.local.config.ts` against a local preview.
4. **`api/vedic-profile.ts` lacks the `checkProKeralaStatus` completeness guard** that `api/kundali.ts` has —
   an existing latent silent-failure bug to fix during rewire.
5. **Engine `warnings`/`POLAR_LATITUDE` MUST is satisfiable** — verified `vedicEngineStage1b.cjs` emits
   `{code:'POLAR_LATITUDE', message}` above ~66.56°. Good.

---

## Touchpoint count

**~15 AFFECTED + ~4 REVIEW core files, plus ~11 static files and a large volume of net-new code**
(abstraction layer, engine port of 6 `.cjs` modules → TS, 5-section reading UX, Gemini reading generator +
cache, and two extended test suites). This exceeds the Checkpoint-0 "~15 touchpoint" threshold, which per the
prompt requires flagging the user to consider shrinking scope before Phase A.

---

## Session changes log (what was actually done)

**Scope decision (flagged & confirmed by user):** this session did **Part B** (abstraction + engine port +
fallback + touchpoint rewire) + **Part C unit tests** + **Checkpoint 1**. **Part D (reading/prediction UX +
Gemini) and all new Playwright/E2E are deferred** to a follow-up, per the user's call to not write E2E before
the UI exists. Ground truth for Part C uses the prompt's reference chart + the validated `scripts/vedic-lab`
`.cjs` engine (since `all-100-charts.json` is gone) — **no live ProKerala calls**.

### New code
- `src/lib/vedic/engine/vedicEngine.ts` — ported `vedicEngineStage1b.cjs` (main chart, 16 divisionals, KP,
  Placidus, Mangal severity). Added nested **Antardasha** (Vimshottari) not present in the lab engine.
- `src/lib/vedic/engine/kaalSarp.ts`, `sthanaBala.ts`, `kalaBala.ts`, `chestaBala.ts`, `drikBala.ts` — ports.
- `src/lib/vedic/calculateBirthChart.ts` — engine-agnostic `calculateBirthChart(input, options)`; local-first,
  injected ProKerala fallback, warnings passthrough, typed `BirthChartInputError`, optional Shadbala assembly,
  D60 disclaimer in data.
- `src/lib/vedic/legacyAdapters.ts` — maps `BirthChartResult` → the exact `/api/kundali` & `/api/vedic-profile`
  JSON shapes (short-form Rashi naming preserved) so cache + all consumers stay unchanged.
- Tests: `src/lib/vedic/__tests__/{calculateBirthChart,engine,apiHandlers}.test.ts` (+41 tests).

### Touchpoints updated
- **#1 `api/kundali.ts`** — added `computeChart()`: local engine first via `calculateBirthChart` +
  `toKundaliLegacy`, ProKerala fallback on local error. Cache + `checkProKeralaStatus` kept; `setCachedChart`
  now records real `source`. Response shape unchanged (additive `warnings`/`source`).
- **#2 `api/vedic-profile.ts`** — same local-first rewire via `toVedicProfileLegacy`; **added the missing
  `checkProKeralaStatus` completeness guard** (closes the latent silent-failure bug). With birth time it now
  also returns `lagna` (non-breaking improvement).
- **#11 `AccuracyDashboard`** — now exercises the local engine through `/api/vedic-profile` (no code change;
  becomes a live local-engine accuracy check).
- Touchpoints **#4–#10, #12–#14**: unchanged — they consume the API JSON, whose shape was deliberately
  preserved, so no edits were required. Verified compatible (response shape asserted in tests + manual probes).
- **#15 `CelebrityPage`** and all Section-D static pages: unchanged (out of scope / no live chart calc).

### Deferred to a follow-up session (Part D)
- Reading/prediction UX (Snapshot, life-area breakdowns, "Right now for you", Doshas, Divisional highlights).
- Gemini reading generator + per-chart reading cache + red-flag-phrase blocklist test (Checkpoint 2).
- Polar-warning banner + D60 disclaimer *rendering* in the UI (the data/flags are already produced by the
  engine and surfaced through the API; only the visual surface is deferred).
- New Playwright E2E (deferred until the above UI exists).

### Not done / cannot be satisfied as written (surfaced, not worked around)
- `all-100-charts.json` regeneration — skipped intentionally (no live-API spend); used the lab `.cjs` as truth.
- Pre-existing `functions/_worker.ts` duplicate `kundali`/`vedicProfile` imports (lines ~21-24) — left as-is
  (pre-existing, out of scope; flagged to the user).
