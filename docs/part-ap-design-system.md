# Part AP — Central Design System: Authoritative Specification

Status: **design + full route mapping complete; code migration NOT yet applied.**
This is the single central definition the migration must implement (Part A goal:
"change the centre once, every page follows"). It is non-breaking — it changes no
runtime code — and is the contract for the remaining Part A work.

## 1. Five themes (one variable set each, selected by `data-theme`)

The existing scoped `.paj` system (`src/styles/part-aj.css`) already encodes four
of these via `data-category`; the central system renames the selector to
`data-theme` on the page root and adds **neutral**. Shared tokens
(navy `#0E2238`, ivory `#FAF7F0`, ink `#1A2230`, hairline `#E4DCC8`,
Fraunces + Public Sans, Devanagari for Hindi) live once at the root; each theme
overrides only its accents.

| Theme | Decorative accent | Text accent | Background | Notes |
|---|---|---|---|---|
| **vedic** | gold `#C6A15B` | bronze `#806125` | ivory | matches `.paj[data-category=vedic]` |
| **birthday** | coral `#F0715A` | `#B5432A` | ivory | matches `.paj[data-category=birthday]` (text accent deepened from navy to #B5432A per A1) |
| **mystic** | amethyst `#6E5AA6` | amethyst `#6E5AA6` | ivory | matches `.paj[data-category=mystic]` |
| **science** | green `#2E9E7B` / blue `#2F6FB0` | `#237A60` | **white** `#FFFFFF`, line `#DDE4EA` | **no gold/ivory** |
| **neutral** | gold (premium only) | navy | navy/ivory | homepage, pricing/checkout, legal, sign-in, account, 404 |

The matching change needed in code: `src/index.css` (Part AO global shadcn tokens)
and `src/styles/part-aj.css` must derive the **shared** colours from one `:root`
block so the two systems cannot drift (Part A3 consolidation). The `.paj` tokens
already equal the index.css accent values — this is a rename + single-source, not
a recolour.

## 2. Seven page layouts (one central component each)

Each layout owns the page-header block (breadcrumb · eyebrow · H1 · lead · trust
line), the content grid, spacing, and responsive behaviour. The `.paj` CSS
already ships four hero structures that map directly to these layouts:

| # | Layout | `.paj` structure | For |
|---|---|---|---|
| 1 | **Tool** | `.paj.workbench` (input→result hero) | most calculators |
| 2 | **Report** | `.paj.editorial` + `.result-layout` | /kundali, /results, blueprint, career |
| 3 | **Hub** | `.paj.field-guide` / `.paj.atlas` | 4 category landings + home |
| 4 | **Collection** | `.paj.atlas` (index + rows) | born-on, celebrity index/profiles, zodiac pairs, /birthday/[m]/[d] |
| 5 | **Article** | `.paj.editorial` (reading column) | blog, /answers/*, how-it-works |
| 6 | **Money** | `.paj.editorial` + `.report` band | pricing, checkout, locked preview, gift |
| 7 | **Utility** | minimal `.paj` + `.section` | legal, sign-in/join, account, 404 |

Acceptance (A5), checked at 1440 + 390 on every page: no empty side column / blank
band >~160px (exception: reading text keeps 65–75ch and fills side space with
contents/key-facts/related, not blank); main action/content on first screen;
header block from the layout; correct theme; single `<h1>`; no old-design markers.

## 3. Full route → theme → layout mapping (186 routes)

Generated from `src/App.tsx` and classified by URL semantics. Cells marked ⚠ need
a human eyeball during migration (semantics ambiguous from the path alone).

### neutral (35)
- **hub:** `/`
- **utility (7):** /embed, /auth, /profile, /admin, /admin/accuracy, /privacy, /terms
- **money (4):** /upgrade, /pricing, /gift, /diwali-gift
- **article (8):** /blog, /blog/:slug, /about, /faq, /contact, /how-it-works, /methodology, /editorial-policy
- **tool (13):** /articles, /hi/meri-jeevan-pratyasha ⚠(science+hi), /mystic-corner ⚠(mystic), /answers, /answers/how-old-am-i-on-mars, /answers/how-to-calculate-age, /answers/what-is-bmi, /wish, /for-business, /astrologer, /baby-names, /reminders, `*` (404→utility)
- **report (2):** /report/:slug, /career-report ⚠(science)

### vedic (27)
- **tool (13):** /rashifal-by-date-of-birth, /sun-vs-moon-sign, /vedic-astrology, /answers/what-is-my-zodiac-sign, /answers/what-is-my-moon-sign, /answers/what-is-vedic-astrology, /moon-sign, /sade-sati, /muhurat, /gemstones, /hi/rashifal/:rashi, /hi/rashifal, /rashi-ratna
- **collection (6):** /zodiac, /zodiac/:sign, /chinese-zodiac, /chinese-zodiac/:animal, /vedic-zodiac, /vedic-zodiac/:rashi
- **article (5):** /articles/moon-sign-by-date-of-birth, /articles/vedic-astrology-birth-chart, /articles/nakshatra-by-date-of-birth, /articles/zodiac-compatibility, /articles/chinese-zodiac-by-year
- **report (3):** /kundali, /kundali-match, /articles/kundali-compatibility ⚠(article vs report)

### birthday (52)
- **report (4):** /results, /birthday-report/sample, /birthday-report, /birthday-report/gift
- **tool (17):** /age-calculator, /age-in-days, /age-in-seconds, /birthday-countdown, /meri-umar-kitni-hai, /celebrity-birthday, /family, /born-on/:month/:day, /birthday-fun, /answers/who-shares-my-birthday, /answers/how-many-days-until-my-birthday, /born-on/:month/:day/personality, /born-in, /born-on, /born-on/india, /born-on/:slug/india, /born-on/:slug
- **utility (1):** /widget/age-calculator
- **collection (16):** /todays-birthdays, /birthstone, /birthstone/:month, /celebrity, /celebrity/{bollywood,cricket,politics,business,music,sports}, /celebrity/:slug, /birthday, /birthday/:month/:day, /birthday/:month, /birthday/:date, /leaderboard
- **article (14):** /articles/birth-month-personality, /articles/famous-indians-born-in-{january…december}, /articles/age-in-days-hours-minutes

### mystic (14)
- **tool (9):** /numerology-hindi, /numerology/:number, /hi/numerology-by-date-of-birth, /answers/what-is-my-life-path-number, /tarot-card-by-birthday, /name-numerology, /biorhythm, /compatibility, /compatibility/:sign1/:sign2
- **collection (1):** /numerology
- **article (4):** /articles/numerology-by-date-of-birth, /articles/life-path-number-compatibility, /articles/biorhythm-calculator, /articles/tarot-card-by-date-of-birth

### science & longevity (58) — included, not deferred
- **tool (30):** /biological-age-vs-chronological-age, /life-expectancy-{india-vs-usa,india,usa,japan,uk,australia,canada,germany,china,singapore,brazil}, /jivan-kal-calculator, /biological-age-hindi, /planetary-age, /weight-on-planets, /longevity-calculator, /biological-age-calculator, /how-long-will-i-live, /life-expectancy-calculator-{uk,australia,usa,canada}, /hi/life-expectancy-calculator, /life-expectancy-calculator-singapore-uae, /science-longevity, /answers/{how-long-will-i-live,how-to-live-longer,what-affects-life-expectancy-most,what-is-epigenetic-age}
- **collection (2):** /generation, /answers/what-generation-am-i
- **report (9):** /life-expectancy, /biological-age, /country-comparison, /articles/bryan-johnson-blueprint-alternative, /articles/retirement-planning-life-expectancy, /articles/retirement-age-india-life-expectancy, /answers/what-is-my-biological-age, /answers/what-is-life-expectancy, /answers/how-does-stress-affect-life-expectancy
- **utility (1):** /coach
- **article (16):** /articles/{life-expectancy-by-country-2026, how-long-will-i-live-in-india, biological-age-vs-chronological-age, longevity-quiz, how-to-live-to-100, exercise-and-longevity, blue-zones-diet, longevity-foods-india, death-clock-alternative, planetary-age-calculator, epigenetics-and-longevity, longevity-supplements, how-indian-celebrities-stay-fit, famous-people-lived-to-100, life-expectancy-how-it-is-calculated, longevity-habits-of-indian-billionaires}

Science & Longevity uses the **Workbench** structure from `docs/design-reference/
science-final.html`; calculations, paywall and pricing stay exactly as-is.

## 4. Migration method (the remaining Part A work)

1. Consolidate tokens: one `:root` for shared colours; `.paj` and index.css both
   read them. Verify zero visual change on the 12 reference pages (before/after
   screenshots at 1440 + 390) — Part A3.
2. Rename `data-category`→`data-theme`, add `neutral`.
3. Build 7 thin React layout wrappers over the existing `.paj` structures; each
   owns the header block.
4. Per theme group, wire pages through their layout; keep content, calc,
   carry-forward, titles, meta, JsonLd identical. Record calc/gating snapshots
   for fixed inputs before & after (Part A4 regression tests).
5. Run A5 acceptance audit (1440 + 390) until zero failures.

The redesigned pages already on `.paj` (hubs, Kundli, matching, Sade Sati,
Muhurat, gemstones, Rashi Ratna, numerology, compatibility, career, name
numerology, homepage) are the **visual standard** and must look identical after
the move.
