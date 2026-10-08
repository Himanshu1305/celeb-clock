# RC3 — Bug Log

Every bug found during RC3 test/fix/retest is logged here.

| # | Item | Severity | Symptom | Root cause | Fix | Verified |
|---|------|----------|---------|------------|-----|----------|
| 1 | 2 | Critical | `/manglik` & `/kaal-sarp-dosha` fail on every real submission ("service temporarily unavailable") | `toKundaliLegacy()` dropped `doshas`, which pages read as `data.doshas.mangalDosha` / `.kaalSarp` | Pass `r.doshas` through the adapter (`legacyAdapters.ts`) | Pending staging |
| 2 | 2 | High | KundaliPage/DashaCalculator 5-level Dasha deep-dive AND "What's Ahead" silently never render | `toKundaliLegacy()` dropped `dashaTimeline`; both sections are gated on `data.dashaTimeline` | Pass `r.dashaTimeline` through the adapter | Pending staging |
| 3 | 2 | Critical | `/birth-time` Vedic profile crashes (blank/React error) whenever birth time is entered | `BirthTimeVedicSection.tsx` rendered `lagna` (an object `{sign,…}`) directly as a React child; local type wrongly said `string` | Fix type to object shape; render `result.lagna.sign` | Pending staging |
| 4 | 2 | Medium | A birth input cached before the fix would still fail (stale cache hit lacks `doshas`/`dashaTimeline`) | `/api/kundali` served any cached row verbatim | Treat a cached row missing `doshas`/`dashaTimeline` as a miss: recompute & overwrite same row (`_cache:'refreshed'`), no data deleted | Pending staging |
