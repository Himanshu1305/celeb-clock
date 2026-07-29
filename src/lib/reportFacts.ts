// Single source of truth for the report's factual counts, so every marketing
// surface agrees with what the renderer actually produces. Hand-written numbers
// had drifted apart ("11 sections" vs "10-section", "7 planets" vs "8 planets",
// "20+ page" vs a real ~19-page PDF). Derive here, reference everywhere.
//
// EVIDENCE (read to derive these — keep in sync if the renderer changes):
//
// REPORT_SECTION_COUNT — the NUMBERED sections the report actually emits (the
//   cover is not a section). Enumerated from src/pages/ReportView.tsx section
//   banners: 01 Twins, 02 Astrology, 03 Numbers, 04 Name, 05 Arcana,
//   06 Talisman, 07 Cosmos, 08 Era, 09 Cycles = 9. (Moon Sign & Nakshatra is
//   part of 02 Astrology, not its own numbered section.)
export const REPORT_SECTION_COUNT = 9;

// PLANET_COUNT — the Solar System Ages section renders one card per planet.
//   Earth is now included as the first card (its age is on the cover), so the
//   section is a complete tour: Earth, Mercury, Venus, Mars, Jupiter, Saturn,
//   Uranus, Neptune = 8. Driven by ORBITAL_PERIODS in BirthdayReportService.ts.
export const PLANET_COUNT = 8;

// Human-facing strings — reference these, never re-type the numbers.
export const SECTIONS_LABEL = `${REPORT_SECTION_COUNT} personalised sections`;
export const PLANETS_LABEL = `all ${PLANET_COUNT} planets`;

// A real generated PDF measured ~19 pages, so we deliberately do NOT promise
// "20+ pages". The section count is exact and always true — prefer it in copy.
export const KEEPSAKE_LABEL = `${REPORT_SECTION_COUNT}-section keepsake report`;
