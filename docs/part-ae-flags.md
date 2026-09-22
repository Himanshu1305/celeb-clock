# Part AE — /vedic-astrology rebuild: flags, link map, decisions

Branch `part-ae-vedic-astrology-page` off develop **05dd6d0** (B→X + Part AC + Part AD, all merged — Step 0 confirmed). Rebuilds the existing `/vedic-astrology` (was the Part W shared-template page) into the bespoke approved Part AE design. Left unmerged for review.

## 🔶 GLOBAL NAV ORDER CHANGE (needs its own go-ahead — affects every page)
`src/components/Navigation.tsx` `NAV_CATEGORIES` reordered: **Birthday Fun first, Vedic Astrology second** (then Mystic, Science, More), superseding the earlier Part V "Vedic first" order. This changes the nav dropdown order on **every page of the site** (desktop + mobile). The homepage "choose your path" cards were left as-is (not in scope). Flagged here for explicit, separate review from the page content.

## §5 sample chart — where the REAL values come from (hard accuracy requirement)
Values are the project's reference test chart **5 Nov 1988, 12:30, New Delhi** (the one used throughout development / the test suite), computed via the real Swiss-Ephemeris engine (`calculateBirthChart` → `extractReadingFacts`), verified 2026-09-23:
- Lagna **Makara (Capricorn)** · Rashi **Kanya (Virgo)** · Nakshatra **Uttara Phalguni (pada 2)** · Current Dasha **Rahu / Mars** · Active Yoga **Raj Yoga (strong)**
- Consistent with the existing suite (chatGuardrails.test asserts this chart is Kanya / Uttara Phalguni).
- The panel also **fetches the live value** from `/api/vedic-reading` (same reference chart) on mount and falls back to these pre-computed real values — so the on-page claim "This is real, computed output… not a sample template" is literally true whether served live or prerendered. NO fabricated placeholders (the design-review Aries/Rohini/Gaja-Kesari values were NOT used).

## Verified link map (every link → real route)
Dedicated pages exist for most tools. Concepts computed WITHIN the Kundali (no standalone page) link to their genuine home rather than a dead link — flagged **[equiv]**:

| On-page link | Destination | Note |
|---|---|---|
| Hero "birthday says about you" | /todays-birthdays | |
| Hero form submit | /kundali (auto-generates) | reuses KundaliPage.generate via router state |
| Kundli | /kundali | |
| Dasha Timing | /kundali | **[equiv]** computed in Kundali |
| Yoga Detection | /kundali | **[equiv]** detected in Kundali |
| Kundali Matching | /kundali-match | |
| AI Astrologer | /astrologer | |
| Sade Sati | /sade-sati | |
| Muhurat Finder | /muhurat | |
| Career Report | /career-report | |
| Gemstone Recommendation | /gemstones | |
| Nakshatra | /articles/nakshatra-by-date-of-birth | |
| Rashi | /moon-sign | Rashi = Moon sign |
| Lagna | /kundali | **[equiv]** Lagna computed in Kundali (no standalone page) |
| Dasha | /kundali | **[equiv]** |
| Manglik | /kundali-match | **[equiv]** Manglik/Mangal-dosha checked in matching (no standalone page) |
| §9 Celebrity twins | /celebrity | (avoids the /celebrity-birthday → /celebrity 301 hop) |
| §9 Today's birthdays | /todays-birthdays | |
| §9 Numerology | /numerology | |
| §11 Kundali Report ₹199 | /kundali | real existing Kundali generate→report flow |
| §11 Combo Report ₹299 | /birthday-report/gift | real existing combo purchase (report+kundali, ₹299) |
| §12 Methodology | /how-it-works | (/methodology 301s here) |
| §12 Privacy | /privacy | |
| §12 Contact | /contact | |

**No dedicated pages exist for Lagna, Dasha, Manglik, Navamsa** — they are features of the Kundali. They are NOT linked to dead URLs; they point to /kundali or /kundali-match. If you want standalone /lagna, /dasha, /manglik pages, that's a separate build.

## Design / scope
- Bespoke navy #0E2238 / gold #C6A15B / ivory #FAF7F0, Fraunces + Public Sans (loaded via page-local Helmet), dense hairline-divided layout — **scoped to this page only** (arbitrary Tailwind values + inline styles; no global theme change). Homepage/other pages untouched.
- Responsive: hero 2-col, what-you-get/go-deeper rows, how-it-works 3-col, and the §5 five-field panel all stack to single column at mobile (`grid-cols-1` base, `md:`/`sm:` multi-col).
- Standard global `<Navigation>` + `<AuthNav>` header (with the new order); bespoke §12 footer per spec.

## Tests / status
- Full unit suite: 1855 → 1855 (no regressions).
- Verification (links resolve, direct-URL load is real not soft-404, mobile, form→Kundli, pricing) done on the `wrangler versions upload` preview — see final report. NOT deployed to production.
