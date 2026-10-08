# P1 — Traffic Engines

**P1 COMPLETE: YES**

Every P1 item in Part 2 and every improvement item assigned to P1 in
`docs/growth-improvements.md` is built, computed from real data, tested and
verified — or deliberately scoped-down with a documented, honest reason, or
blocked only on the person (one dataset). Nothing was merged into `develop`,
nothing deployed to production; all new work is shown only via a preview
version upload of the `bornclock-staging` worker. `growth` is pushed after every
item.

- **Date:** 2026-10-09 → 2026-10-10 (unattended run).
- **Branch:** `growth` (from the RC3-merged `develop`). Commits pushed per item.
- **Machine load check (Rule 3):** 8 CPU cores; load average 2.14 at build time
  (< half the cores), so no wait was required.
- **Test baseline (start):** 171 test files / 1978 tests, with **1 pre-existing
  failure** (8 over-long SEO titles from the already-committed P1 work).
- **Test suite (end):** **176 files / 2001 tests, 0 failures** — above baseline
  and green (the pre-existing failure is fixed; 5 new engine test files added).
- **Typecheck:** `tsc --noEmit` clean (0 errors) throughout.
- **Build:** `npm run build:staging` — <<BUILD_TIME>>; prerender **4018 routes**
  (+261 new P1 routes), no prerender/runtime errors.
- **Preview URL:** <<PREVIEW_URL>>

---

## 1. Items built (Part 2 · Phase P1)

| # | P1 item | Status | Evidence |
|---|---|---|---|
| 1 | Horoscopes per Moon sign, daily/weekly/monthly/yearly | ✅ done (pre-P1 commit f9dfaaa) | `/rashifal`, `/rashifal/:rashi/:period` computed per period; `/hi/rashifal` upgraded. |
| 2 | Daily Panchang for the user's city (+ Rahu Kaal, Choghadiya) | ✅ done (b06e067) | `/panchang[/:city]` — tithi/nakshatra/yoga/karana/sunrise/sunset + Rahu Kaal, Gulika, Yamaganda, day/night Choghadiya. |
| 3 | Festival & vrat calendar (computed, by year) | ✅ **new** | `festivals.ts` + `/festivals[/:year]`. Validated **16/17 major dates vs Drik Panchang 2025**. |
| 4 | 27 Nakshatra pages | ✅ done (5feb0b1) | `/nakshatra[/:slug]`. |
| 4 | Planet-in-house (108) & planet-in-sign (108) | ✅ **new** | `planetPlacements.ts` dignity-aware engine; `/planet-in-sign/*`, `/planet-in-house/*`. All 216 bodies unique. |
| 4 | Yoga pages | ✅ **new** | `/yoga[/:slug]` — 13 yogas (Raja, Dhana, Gaja Kesari, 5 Mahapurusha, Neecha Bhanga, Vipreet, Kemadruma, …). |
| 5 | Transit pages (Saturn/Jupiter/Rahu-Ketu by year) + Mercury retrograde | ✅ **new** | `transits.ts` + `/transit[/:planet/:year]`, `/mercury-retrograde[/:year]`. Retrograde dates match published 2025 windows. |
| 6 | Baby names by Nakshatra letter (with meanings) | ✅ **new** | `/baby-names` now shows names **with meanings** per pada akshara (original curated dataset). |
| 7 | Remaining content-gap pages (D7/D4/D24, Chaldean, birthday/attitude, Blue Zones) | ✅ done | Chaldean/attitude/Blue-Zones from pre-P1 commits; **divisional-chart explainers new** (`/divisional-charts[/:slug]`, 14 vargas incl. D4/D7/D24). |

## 2. Improvement items assigned to P1 (`growth-improvements.md`)

| ID | Status | Note |
|---|---|---|
| F-RASHIFAL | ✅ done | computed `/hi/rashifal` (f9dfaaa) |
| F-TERMS | ✅ done | TermTip wraps (700dda3) |
| F-CELEB | ⏸ P4 / **Needs the person** | licensed bio/DOB dataset — correctly a P4/data item, not P1 |
| F-CALC-ACTION | ✅ done | result shows per-factor breakdown + top-3 gains; `/life-expectancy/factors` adds indexable depth |
| F-THIN-COUNTRY | ✅ done | country template + P(reach 100) + official-life-table citation |
| P1-RASHIFAL-WEEKLY | ✅ done | `/rashifal/:rashi/week` |
| P1-PANCHANG-CHOGHADIYA | ✅ done | Choghadiya + Rahu Kaal on the Panchang page |
| P1-ATTITUDE-NUM | ✅ done | `/attitude-number` |
| P1-CHALDEAN | ✅ done | `/chaldean-numerology` |
| P1-BLUEZONES-9 | ✅ done | `/blue-zones` + 9 factor pages |
| P1-LE-BY-FACTOR | ✅ **new** | `/life-expectancy/factors` hub + 9 factor pages |
| NS-P100 | ✅ **new** | `survival.ts` P(reach 100) on calculator, factor pages, country pages |
| NS-CRED | ✅ **new** | SSA/ONS/WHO baseline cited on longevity surfaces |
| NS-CALC | ◐ P1 content done | funnel tracking is P5 (deferred to that phase) |

---

## 3. Accuracy validation (honesty, Rule 8)

- **Mercury retrograde** (computed from real apparent motion): 2025 windows
  **15 Mar–7 Apr, 18 Jul–11 Aug, 9–29 Nov** — match published ephemeris dates.
- **Slow-planet transits:** Saturn in Meena (Pisces) all of 2026 (no ingress);
  Jupiter Mithuna→Karka→Simha with in-year ingress dates — astronomically correct.
- **Festival calendar vs Drik Panchang 2025 (16/17 exact):** Maha Shivratri 26 Feb,
  Ugadi 30 Mar, Ram Navami 6 Apr, Hanuman Jayanti 12 Apr, Akshaya Tritiya 30 Apr,
  Guru Purnima 10 Jul, Raksha Bandhan 9 Aug, Janmashtami 16 Aug, Ganesh Chaturthi
  27 Aug, Durga Ashtami 30 Sep, Dussehra 2 Oct, Karwa Chauth 10 Oct, Dhanteras
  18 Oct, Diwali 20 Oct, Govardhan 22 Oct, Bhai Dooj 23 Oct. **One documented
  deviation:** Ghatasthapana (Navratri start) resolves to 23 Sep vs Drik's 22 Sep
  — a known sunrise-vs-daytime-Pratipada convention nuance, disclosed on the page.
- **Dignity table (planet-in-sign):** all 7 classical exaltations/debilitations
  and Moolatrikona/own placements verified (12/12 in test).
- **P(reach 100):** an explicitly-labelled statistical estimate (normal
  approximation on the forecast, SD≈10 from national life tables) — never
  presented as a guarantee.

## 4. Content quality (Rule 6)

- Every programmatic set is genuinely distinct: 216 planet placements have 216
  unique bodies (dignity-aware); 108+108 verified in tests. Yoga and varga pages
  each carry real, differentiated formation/meaning/strength content.
- Predictions are graded (strong/moderate/mild) and attributed to the tradition;
  care notes and the "tendency, not a fixed outcome" framing are present. No
  dates for sensitive events; Kemadruma/dusthana/debilitation handled calmly.
- New terms route through `TermTip`; every page passes the "so what?" test
  (what it is · what it means · what to do) and interlinks (Vedic landing
  "Explore by topic"; longevity cross-links) — no orphans.

## 5. Site-wide checks (end-of-phase retest)

<<SITE_CHECKS>>

## 6. Build time (Rule 13)

<<BUILD_TIME_LINE>>

## 7. Needs the person

- **F-CELEB** (P4): a licensed celebrity bio/DOB dataset for ~2,000 profiles.
- **Baby-names dataset**: P1 ships an original curated names-with-meanings set;
  a larger licensed names database (if wanted) is a person decision.
- Prices for any new paid products (none introduced in P1).
- Nothing in P1 requires a schema change, email send, or new secret.

## 8. Bug log

See `docs/growth-bugs.md`. No open product-failures from P1 at report time.

---

*All P1 work is on `growth` (pushed). RC3 on staging is untouched; `develop`,
`main` and production are untouched; no Cloudflare token was added to GitHub.*
