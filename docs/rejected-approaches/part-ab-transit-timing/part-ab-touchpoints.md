# Part AB — Phase 0 dependency map (transit-timing PoC)

## Arbitrary-date chart computation (the ephemeris)
- `calculateBirthChart(input, { includeShadbala:false, refDate })` — the SAME function
  used site-wide. Passing any date as the birth `input` returns that date's **sidereal
  planetary positions** (it's an ephemeris call). For transits we compute a chart *for
  the transit date* and read the slow planets.
- Per-planet fields returned (confirmed): `name, sign, signIndex (1-based), house,
  longitude (sidereal deg), degreeInSign, nakshatra, retrograde, combust`. Transit
  analysis needs only `signIndex`/`longitude`.
- `includeShadbala:false` skips the heavy strength math — transits only need longitudes.

## Natal data available to compare against (all already present)
- Natal Lagna: `chart.lagna.rashiIndex` (0-based sign of the 1st house → whole-sign houses).
- Natal 7th house = whole-sign 7th from Lagna (always house 7).
- Natal 7th lord = `SIGN_LORDS[(lagnaIdx+6)%12]`; its natal position via `chart.planets`
  (`signIndex`, `house`).
- Natal Venus position via `chart.planets`.
All derivable from one natal `calculateBirthChart` call — nothing new needed.

## Measured cost (REAL, not estimated)
- **480 full chart computations (monthly × 40 years) = 121 ms total → 0.25 ms each.**
- A per-user 30-year monthly transit scan ≈ 360 computations ≈ **~90 ms**. Fast enough
  for a live chat response; **no caching or optimization required.** (`includeShadbala:false`.)

## Conclusion
Ephemeris + natal comparison points all exist; cost is negligible. The only missing
piece is the transit-analysis logic itself (built in Part 1 as `src/lib/vedic/
transitTiming.ts` — a pure module, NOT imported anywhere/user-facing this session).
