# Part AK — Part 0 Audit: deep tool/report pages linked from the four hubs

Method: extracted every internal route linked from the four hub pages, mapped each to its
component in `src/App.tsx`, and classified its design by scanning for new-system markers
(`part-aj.css` / `className="paj"` / Fraunces) vs old-system markers (`bg-gradient-cosmic`,
`glass-card`, plain legacy Tailwind).

**Headline result: NONE of the deeper tool/report pages use the new `paj` design system — every
one is OLD design.** (The only `paj` pages are the three hubs redesigned in Part AJ; Science hub
deferred.) So the Part AJ redesign currently "dead-ends" into old-design pages everywhere.

## Vedic Astrology hub → deeper pages
- `/kundali` — **OLD** (KundaliPage, cosmic) ← Tier 1 target (core "full chart" destination)
- `/kundali-match` — **OLD** (KundaliMatchPage, cosmic)
- `/sade-sati` — **OLD** (SadeSatiPage, cosmic)
- `/muhurat` — **OLD** (MuhuratPage, cosmic)
- `/career-report` — **OLD** (CareerReportPage, cosmic)
- `/gemstones` — **OLD** (GemstonePage, cosmic)
- `/rashi-ratna` — **OLD** (RashiRatnaPage, plain legacy)
- `/sun-vs-moon-sign` — **OLD** (SunVsMoonSign, cosmic)
- `/moon-sign` — **OLD** (MoonSignPage, plain legacy)
- `/astrologer` — **OLD** (AstrologerPage, cosmic)
- `/articles/nakshatra-by-date-of-birth` — OLD (article template; lower priority, content page)

## Birthday & Celebrity hub → deeper pages
- `/birthday-report` — **OLD** (BirthdayReport, plain legacy) — the PAID flow (per FLAG 2, deliberately separate)
- `/celebrity` — OLD (CelebrityIndexPage) · `/todays-birthdays` — OLD (TodaysBirthdaysPage, cosmic)
- `/born-on` — OLD (BornOnIndex, cosmic) · `/age-calculator` — OLD (AgeCalculatorPage, cosmic)
- `/numerology` — OLD (NumerologyPage) · `/zodiac` — OLD (Zodiac) · `/chinese-zodiac` — OLD (ChineseZodiac, cosmic+glass)

## Mystic Corner hub → deeper pages
- `/numerology` — OLD (NumerologyPage) · `/name-numerology` — OLD (NameNumerologyPage)
- `/zodiac` — OLD (Zodiac) · `/chinese-zodiac` — OLD (ChineseZodiac)
- `/compatibility` — OLD (CompatibilityPage) · `/tarot-card-by-birthday` — OLD (TarotByBirthday)

## Science & Longevity hub → deeper pages (hub itself deferred — FLAG 3)
- `/biological-age` — OLD (BiologicalAge) · `/country-comparison` — OLD (CountryComparison, cosmic+glass)
- `/coach` — OLD (CoachLandingPage) · `/upgrade` — OLD (paywall) · 10× `/life-expectancy-<country>` — OLD
- `/birthday-report` — OLD (paid flow)

## Priority order for Tier 2 (derived from this audit)
Vedic tools are the most numerous and most directly tied to the "computed chart" promise of the
redesigned Vedic hub, and `/kundali` is the explicit Tier-1 target. So after Tier 1 (`/kundali`),
priority is the **core, frequently-linked Vedic tools reached straight from the Vedic hub's
"toolkit" + "go deeper" grids**:
1. `/kundali-match` (Kundali Matching) — core, in the toolkit grid
2. `/sade-sati` — core "go deeper" tool, frequently linked
3. `/muhurat` — "go deeper" tool
4. `/gemstones` + `/rashi-ratna` (related pair) — "go deeper"
5. `/career-report` — "go deeper"
6. `/sun-vs-moon-sign`, `/moon-sign` — explore-row Vedic tools
7. (then shared/Mystic/Birthday tools: `/numerology`, `/zodiac`, `/chinese-zodiac`, etc.)

NOTE: `/birthday-report` (paid) and the Science sub-pages are intentionally lower priority —
`/birthday-report` is tied to FLAG 2 (paid flow) and Science to FLAG 3 (deferred), neither to be
resolved this session.
