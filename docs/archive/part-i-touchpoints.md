> ⚠️ SUPERSEDED — see the consolidated docs/vedic-integration-touchpoints.md (Part K). Kept for history.

# Part I — Phase 0 Touchpoints (dependency map)

Branch: `feature/overnight-batch-part-i` (off `feature/timing-calculation-dfix3`, which
carries the D-Fix3 timing engine needed for Parts 2.5 & 12).

## Kundali Matching form — `src/pages/KundaliMatchPage.tsx`
- Fields TODAY: Person A `dobA`+`timeA` (or saved profile), Person B `dobB`+`timeB`.
  **NO birthplace field for Person B, and none for Person A on the "use different" path.**
- `coordsB` is hardcoded `DELHI`; non-saved `coordsA` is hardcoded `DELHI`. → **Part 1 bug confirmed.**
- Match calc: `profileFor()` → `/api/vedic-profile` → returns `{nakshatra, rashiIndex}` only;
  `calculateAshtakoota(nak1, nak2, rashi1, rashi2)`.
- **Accuracy nuance (documented honestly):** the 8-koota score uses only Moon **Nakshatra +
  Moon sign**, which are ~location-independent (Moon longitude shifts <0.01° with birthplace).
  So the missing-place bug has negligible effect on the *koota number itself*, but a real
  effect on anything Lagna/house-based — the marriage-timing extension (2.5, needs the 7th
  lord) and general correctness. Part 1 still collects place for both (correctness + 2.5).

## Ashtakoota engine — `src/utils/ashtakoota.ts`
- **Varna=1, Vashya=2, Graha Maitri=3 are HARDCODED STUBS**, not computed. Tara/Yoni/Gana/
  Nadi computed; Bhakoot via sign distance. → Parts 2.1 needs a genuine full 8-koota rewrite
  with per-koota breakdown + cancellation rules.

## Reusable birth-details form — `src/components/BirthDetailsForm.tsx`
- Props: `testIdPrefix`, `initial`, `submitLabel`, `onSubmit({dob,time,city:{name,lat,lon,tz}})`,
  city geocoding via `geocodeCity` (`@/services/geocoding`). Reusable for Part 1 (add place).

## PDF infrastructure — `api/_pdf.ts`
- `renderPdfFromHtml(html)` via Cloudflare Browser Rendering REST — **server-side, needs
  BROWSER_RENDERING creds**, used by invoices. Reuse from the client-side Matching page would
  need a new server endpoint + creds plumbing. **DECISION (per spec's "scope down if
  significant adaptation"): Part 2.6 PDF export = browser print-to-PDF** (a print-optimized
  view + `window.print()`), not new server PDF engineering. Documented in flags.

## Panchang / planet positions — `src/lib/vedic/engine/vedicEngine.ts`, `src/utils/vedicCalculations.ts`
- The engine computes sidereal planet longitudes for any date. Tithi/Yoga/Karana/Rahu-Kalam
  are derivable from Sun/Moon longitudes + weekday (pure math). → Part 9 Muhurat builds on the
  existing position calc; no new astronomy. Scope: "auspicious dates in next N days for a
  purpose", avoiding Rahu Kalam + inauspicious Tithi/Nakshatra.

## Sade Sati — `src/lib/vedic/engine/vedicEngine.ts` (lines ~222-230)
- Output: `sadeSati { active, phase, houseOfSaturnFromMoon }`; phases: 'Rising (12th from
  Moon)', 'Peak (on Moon sign)', '2nd from Moon'. **CURRENT status only — no start/end dates.**
  → Part 10 needs Saturn sign-ingress dates: reuse the engine's Saturn-position calc, sampled
  forward/back, to find when Saturn enters the 12th-from-Moon sign and exits the 2nd-from-Moon
  sign (the cycle bounds). No new astronomy (same position function), just sampling.

## D-Fix3 timing engine — `src/lib/vedic/yogaTiming.ts`
- `windowsForSignificators(timeline, significators[], now)` takes **arbitrary significators** →
  **fully generalizable.** Parts 2.5 (marriage, either/both charts) and 12 (career) can call it
  with any significator set. `buildTimingFacts`/`describeWindow` reusable for prose.

## Excluded (must NOT build): chat Yoga/Nakshatra citation; account-level profile sync.
