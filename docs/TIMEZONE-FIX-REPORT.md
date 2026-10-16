# Birth timezone + place accuracy — report (branch `fix-timezone-accuracy`)

Status: **fixed on staging, not merged, not deployed to production.**
Staging: https://bornclock-staging.usdvisionai.workers.dev — worker `bornclock-staging`, version `bc9248af-d413-4b07-8eb0-e40cd52bb5ea`.

## 1. Root cause (from evidence)

Reproduced on the unchanged code (local `wrangler dev`, and identically on bornclock.com today):

```
GET /api/geocode?q=Pontiac
Pontiac, Michigan  → timezone "Asia/Kolkata", utcOffset 5.5
Pontiac, Illinois  → timezone "Asia/Kolkata", utcOffset 5.5
Pontiac, Québec    → timezone "Asia/Kolkata", utcOffset 5.5   (every result)
```

1. **`api/geocode.ts` (old lines 51–66)** — every OpenStreetMap/Nominatim result was given
   `timezone: 'Asia/Kolkata', utcOffset: 5.5` ("we don't run a tz database in the worker, so default to IST").
2. **`src/services/geocoding.ts` (old lines 77–89 `mapRows`, 117–121 `viaNominatim`)** — the browser did the
   same (`r.timezone || 'Asia/Kolkata'`, `utcOffset ?? 5.5`) and cached those answers in localStorage for 30 days.
3. **`src/data/cityDataset.ts`** — bundled world cities carried a fixed *standard* offset (New York −5 all year),
   so every DST-season birth in the US/UK/Europe/Australia was 1 hour off.
4. **Forms** (`BirthDetailsForm.tsx:61`, `KundaliMatchPage.tsx:69`, `BirthTimeVedicSection.tsx`, `MuhuratPage.tsx`)
   saved `tz: c.utcOffset` from those results; **every API** (`kundali-match.ts:46`, `kundali.ts:215`,
   `vedic-reading.ts:216`, `vedic-profile.ts:179`, `career-report.ts:17`, `life-report.ts:17`, `gemstones.ts:16`,
   `sade-sati.ts:21`, `chart-events.ts:33`, `vedic-chat.ts:213`, `muhurat.ts:20`) trusted that numeric `tz`
   and the engine converted with it (`calculateBirthChart.ts:203 toBirthDateUTC`).
5. **`BabyNamesPage.tsx:32`** hard-coded Delhi + IST for every baby.

So Sukriti's 11:03 in Pontiac was computed as 11:03 IST = 05:33 UTC instead of 16:03 UTC → Moon 174.9° Kanya
instead of 180.3° Tula. The place picked was right (Michigan was the first result); the zone was not.

Date order: no DD/MM ↔ MM/DD bug. `DobInput` parses DD/MM/YYYY in that order; Vedic forms use
`<input type="date">` (ISO); APIs take separate y/m/d. The only M/D parse (`functions/_worker.ts:187`) is a
legacy `/?birthDate=M/D` SEO redirect (no year, not chart input). Hardened: carried `?dob=` must be ISO.

## 2. Fix — one shared function, every call site

`src/lib/timezone/birthTimezone.ts → resolveBirthTimezone()` — (lat, lon, local date, local time [, manual IANA zone])
→ IANA zone + offset in force at that place on that date + UTC instant. lat/lon → zone with
`@photostructure/tz-lookup@11.7.0` (maintained CC0 fork of tz-lookup, ~70 KB data); offsets from the runtime
IANA database (Intl — browsers and Workers). DST overlap → first occurrence; DST gap → offset before the change
(RFC 5545 / Temporal "compatible"); both show a note. Never defaults to IST.

Server (authoritative — the client's numeric `tz` is no longer trusted, so old clients/saved links are fixed too):
`api/_birthParams.ts resolveRequestBirthTz()` used by `kundali`, `kundali-match`, `vedic-profile`, `vedic-reading`,
`vedic-chat` (AI astrologer), `career-report`, `life-report`, `gemstones`, `sade-sati`, `chart-events`, `muhurat`;
`api/geocode.ts` now derives the zone from coordinates.

Client: `src/lib/timezone/clientBirth.ts birthQuery()` used by `KundaliMatchPage`, `KundaliPage` (via
`kundaliService`, `readingService`), `CareerReportPage`, `LifeReportPage`, `ChildKundliPage`, `DoshaCheckPage`,
`GemstonePage`, `KaalSarpDoshaPage`, `ManglikPage`, `SadeSatiPage`, `DashaCalculatorPage`, `DashboardPage`,
`VedicAstrologyLanding`, `BirthTimeVedicSection` (birthday report), `BabyNamesPage`, `chartNotifications`,
`chatService` (AI chat), `MuhuratPage`; `savedProfile` gains optional `timezone` / `manualTimezone`
(old profiles stay valid; their stored `tz` is ignored and recomputed).

Caches: Supabase `vedic_chart_cache` keys versioned `tz2` + IANA zone in `kundali`, `vedic-profile`, `vedic-reading`
(old rows bypassed, never edited/deleted); browser HTTP cache busted with `tzv=2`; localStorage geocode cache
renamed `-v2` (v1 held IST answers). No KV in use; no CDN caching of API responses. Reading-history and
notification logs in localStorage are past snapshots, not calculation inputs — left as is (listed by the SQL).

## 3. Before / after — the repro

| | Before (prod today) | After (staging) |
|---|---|---|
| Girl place | Pontiac, Michigan (42.6389, −83.2910) | Pontiac, Michigan, USA (same coords, picked explicitly) |
| Girl zone / offset | Asia/Kolkata, UTC+05:30 (wrong) | America/Detroit, UTC−05:00 |
| Girl UTC birth | 1999-12-03 05:33 | 1999-12-03 16:03 |
| Girl Moon | Kanya 174.90°, Chitra p1 | **Tula 0.28° (180.28°), Chitra p3** + boundary note |
| Girl Lagna | Simha | Makara 3.18° |
| Boy (Lucknow, IST) | Meena 19.55°, Revati p1, Lagna Vrischika 19.73° | unchanged |
| Varna / Vashya / Tara / Yoni | 1 / 1 / 1.5 / 2 | 1 / 1 / 1.5 / 2 |
| Graha Maitri / Gana / Bhakut / Nadi | 0.5 / 1 / **7** / 8 | 0.5 / 1 / **0** / 8 |
| Total | **22** | **15** |

Independent check (Python + IANA tzdata + exact Lahiri) confirms the background: girl 180.2787° Tula / Chitra p3;
boy 349.5411° Meena / Revati p1.

## 4. Koota rule differences (NOT changed — your decision)

Feeding the engine the correct Moons directly gives 15, not Astrotalk's 13.5. Five kootas already agree;
three differ only because of the engine's rule tables (`src/lib/vedic/matchmaking.ts`):

| Koota | Engine | Astrotalk | Engine rule | Classical/Astrotalk rule |
|---|---|---|---|---|
| Vashya | 1 | 1.5 | simplified symmetric: same group 2, Vanachara–Chatushpada 0, every other pair 1 (line 66–69) | full 5×5 directional group matrix with fractional cells (Jalachara boy × Manava girl = 1.5 in Astrotalk's table); I could not find a citable source for the exact matrix offline |
| Yoni | 2 | 1 | 3-tier simplification: same 4 / sworn enemy 0 / everything else 2 (line 84) | full 14×14 yoni matrix: Elephant (Revati) × Tiger (Chitra) = 1 |
| Gana | 1 | 0 | symmetric: Deva–Rakshasa = 1 either way (line 101–107) | directional: boy Deva × girl Rakshasa = 0 (boy Rakshasa × girl Deva = 1) |

Also noted (not changed): the engine's Lahiri is an approximation (23.853222° at J2000 + linear precession, no
nutation; `vedicEngine.ts:40–46`) — ≤ ~0.01° from the exact definition, far below anything that changed results here.

## 5. Tests

Unit suite (`npx vitest run`): **before 2134 passed / 1 failed** (pre-existing 5 s timeout in
`CelebrityPage.test.tsx`); **after 2190 passed / 0 failed** on one run and 2189 / 1 on the final run — the
same pre-existing `CelebrityPage` timeout, which passes 73/73 when run alone. Includes 55 new tests.
New: `src/lib/timezone/__tests__/birthTimezone.test.ts`, `api/__tests__/geocodeTimezone.test.ts`.
Browser (staging, `npx playwright test --config playwright.tz.config.ts`): **18/18** (6 scenarios × Chromium,
Firefox, WebKit).

| Case | Expected (independent) | Got (engine) | |
|---|---|---|---|
| Suchit (repro boy) | UTC+05:30 · Meena 19.54° · Revati p1 | UTC+05:30 · Meena 19.55° · Revati p1 | PASS |
| Sukriti (repro girl) | UTC−05:00 · Tula 0.28° · Chitra p3 | UTC−05:00 · Tula 0.28° · Chitra p3 | PASS |
| New York, July (EDT) | UTC−04:00 · Meena 29.82° · Revati p4 | UTC−04:00 · Meena 29.83° · Revati p4 | PASS |
| Chicago, January (CST) | UTC−06:00 · Makara 8.32° · Uttara Ashadha p4 | UTC−06:00 · Makara 8.32° · Uttara Ashadha p4 | PASS |
| Phoenix, July (no DST) | UTC−07:00 · Kanya 6.79° · Uttara Phalguni p4 | UTC−07:00 · Kanya 6.80° · Uttara Phalguni p4 | PASS |
| Toronto, January (EST) | UTC−05:00 · Kumbha 25.72° · Purva Bhadrapada p2 | UTC−05:00 · Kumbha 25.73° · Purva Bhadrapada p2 | PASS |
| London, July (BST) | UTC+01:00 · Tula 14.13° · Swati p3 | UTC+01:00 · Tula 14.13° · Swati p3 | PASS |
| London, January (GMT) | UTC+00:00 · Kumbha 28.41° · Purva Bhadrapada p3 | UTC+00:00 · Kumbha 28.41° · Purva Bhadrapada p3 | PASS |
| Berlin, July (CEST) | UTC+02:00 · Kumbha 9.27° · Shatabhisha p1 | UTC+02:00 · Kumbha 9.28° · Shatabhisha p1 | PASS |
| Sydney, January (AEDT) | UTC+11:00 · Dhanu 2.26° · Mula p1 | UTC+11:00 · Dhanu 2.26° · Mula p1 | PASS |
| Brisbane, January (no DST) | UTC+10:00 · Dhanu 2.82° · Mula p1 | UTC+10:00 · Dhanu 2.82° · Mula p1 | PASS |
| Dubai | UTC+04:00 · Tula 28.92° · Vishakha p3 | UTC+04:00 · Tula 28.91° · Vishakha p3 | PASS |
| Singapore 1979 (+7:30 era) | UTC+07:30 · Meena 24.68° · Revati p3 | UTC+07:30 · Meena 24.68° · Revati p3 | PASS |
| Kathmandu (+5:45) | UTC+05:45 · Vrishabha 27.87° · Mrigashira p2 | UTC+05:45 · Vrishabha 27.87° · Mrigashira p2 | PASS |
| Mumbai 1943 (wartime +6:30) | UTC+06:30 · Mesha 13.91° · Bharani p1 | UTC+06:30 · Mesha 13.91° · Bharani p1 | PASS |
| New York 2021-11-07 01:30 (ambiguous) | UTC−04:00 (first occurrence) · Vrischika 23.75° · Jyeshtha p3 | same + note | PASS |
| New York 2021-03-14 02:30 (doesn't exist) | UTC−05:00 (= 03:30 EDT) · Meena 9.85° · Uttara Bhadrapada p2 | same + note | PASS |
| Repro on staging UI (3 browsers) | Pontiac MI picked, Tula/Chitra 3, table shown | 15/36, every row as above | PASS (13.5 needs the koota-rule change in §4) |
| Sydney × Brisbane on UI | +11:00 / +10:00, Dhanu/Mula | as expected, 28/36 | PASS |
| London × Berlin on UI | +01:00 / +02:00, Tula/Swati 3 · Kumbha/Shatabhisha 1 | as expected, 20/36 | PASS |
| Kundali New York on UI | place, America/New_York UTC−04:00, Lagna Simha 2.0° | as expected + boundary note | PASS |
| Date format 03/12/1999 | 3 December | 3 December (DobInput, birthQuery, resolver) | PASS |

Kundali check (Lagna sign + degree ±0.1°, all 9 planet signs + houses, current Maha/Antar at 2026-10-16) — all PASS:
repro girl Makara 3.18°, Jupiter/Mercury · New York Simha 2.01°, Moon/Jupiter · London Dhanu 8.67°, Saturn/Rahu ·
Sydney Vrishabha 21.69°, Sun/Saturn · Dubai Mesha 18.20°, Mercury/Mercury.

## 6. Past data (read-only, you run it)

`docs/past-data-check.sql` — one SELECT over `profiles.birth_profile`, `profiles.reading_history`,
`birthday_reports`, `vedic_chart_cache`. Validated against stub tables in an in-memory Postgres (PGlite); never run
against Supabase. Matches are never stored server-side, so none can be listed.

## 7. Other findings

- The production JS bundle ships a Razorpay **test** key (`rzp_test_…`) as `VITE_RAZORPAY_KEY_ID`.
- The paid birthday report's Moon sign (`src/data/moonSignData.ts:203`, used by `ReportView.tsx:1403` and
  `MoonSignPage`) is a date-only mean-cycle approximation (no time/place) — separate accuracy issue, not changed.
- India births 1941-10 → 1945-10 now use the tz-database wartime offset (+6:30), as most Indian software does.
- Two different "Pontiac, Quebec, Canada" towns appear with identical labels (OSM data); coordinates differ.
- Staging is redeployed nightly from `develop` at 02:30 UTC (`.github/workflows/deploy.yml`), which will replace
  this build; redeploy the branch with `npm run deploy:staging` if needed.
- Prerender is skipped on this laptop (Chromium for the prerenderer won't launch); staging serves client-rendered HTML.
- Staging shares the production Supabase DB: chart requests on staging can upsert rows into `vedic_chart_cache`
  if the staging worker has the service key (existing behaviour; nothing I ran wrote to it directly).
