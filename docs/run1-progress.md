# Run 1 — Progress Log

Branch `redesign-central` from `3cd3579`.

## Vedic route set (29 routes to move in Step 2)
report: /kundali, /kundali-match, /articles/kundali-compatibility, /career-report
tool: /vedic-astrology(hub), /sade-sati, /muhurat, /gemstones, /rashi-ratna,
  /moon-sign, /sun-vs-moon-sign, /rashifal-by-date-of-birth, /hi/rashifal,
  /hi/rashifal/:rashi, /answers/what-is-my-zodiac-sign, /answers/what-is-my-moon-sign,
  /answers/what-is-vedic-astrology, /astrologer
collection: /zodiac, /zodiac/:sign, /chinese-zodiac, /chinese-zodiac/:animal,
  /vedic-zodiac, /vedic-zodiac/:rashi
article: /articles/moon-sign-by-date-of-birth, /articles/vedic-astrology-birth-chart,
  /articles/nakshatra-by-date-of-birth, /articles/zodiac-compatibility,
  /articles/chinese-zodiac-by-year

## Step 1 — Build the central system
- [x] themes.ts (5-theme single source) + themes.css ([data-theme] incl. neutral)
- [x] SiteHeader, Breadcrumb, SiteFooter, PageHeader, PajPage shell
- [x] 7 layout components (Tool/Report/Hub/Collection/Article/Money/Utility)
- [x] unit tests: theme selection + each layout's header block — **10/10 pass**

## Step 2 — Move every Vedic page onto it
- [ ] in progress

## Step 3 — Test the Vedic group
- [ ] pending

## Step 4 — Deploy staging + push
- [ ] pending
