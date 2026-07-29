// Single source of truth for the report's factual counts, so every marketing
// surface agrees with what the renderer actually produces. Hand-written numbers
// had drifted apart ("11 sections" vs "10-section", "7 planets" vs "8 planets",
// "20+ page" vs a real ~19-page PDF). Derive here, reference everywhere.
//
// EVIDENCE (read to derive these — keep in sync if the renderer changes):
//
// REPORT_SECTION_COUNT — distinct titled sections a reader scrolls through in
//   src/pages/ReportView.tsx (each its own <h2>): Celebrity Twins, Zodiac
//   Profile, Moon Sign & Nakshatra, Numbers & Life Path, Name Numerology,
//   Birthday Tarot, Cosmic Connections, Solar System Ages, Generation Portrait,
//   Biorhythm = 10.
export const REPORT_SECTION_COUNT = 10;

// PLANET_COUNT — the Solar System Ages section maps Object.entries(planetaryAges),
//   which is built from ORBITAL_PERIODS in src/services/BirthdayReportService.ts:
//   Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune = 7. Earth is the
//   baseline ("N years old on Earth"), not one of the seven cards.
export const PLANET_COUNT = 7;

// Human-facing strings — reference these, never re-type the numbers.
export const SECTIONS_LABEL = `${REPORT_SECTION_COUNT} personalised sections`;
export const PLANETS_LABEL = `all ${PLANET_COUNT} planets`;

// A real generated PDF measured ~19 pages, so we deliberately do NOT promise
// "20+ pages". The section count is exact and always true — prefer it in copy.
export const KEEPSAKE_LABEL = `${REPORT_SECTION_COUNT}-section keepsake report`;
