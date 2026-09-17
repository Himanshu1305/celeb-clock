# Part U — "Before" State Inventory (baseline for the "nothing lost" diff)

Captured from `src/components/Navigation.tsx` and `src/pages/Index.tsx` before any change.

## A. Current navigation structure (3 arrays)

### `navItems` (first 5 = visible bar; rest = "More")
Visible bar: Age Calculator (`/age-calculator`), Today's Birthdays (`/todays-birthdays`),
Celebrity Match (`/celebrity-birthday`), Birthday Report (`/birthday-report`),
Life Expectancy (`/life-expectancy`, PRO).
More: Planetary Age (`/planetary-age`), Birthstone (`/birthstone`), Leaderboard
(`/leaderboard`), Blog (`/blog`), Biological Age (`/biological-age`), Biorhythm
Calculator (`/biorhythm`), Longevity Coach (`/coach`), Pricing (`/pricing`).

### `exploreItems` (Explore dropdown, 18)
`/celebrity`, `/born-in`, `/born-on/india`, `/numerology`, `/name-numerology`,
`/biorhythm-workout-calculator`, `/energy-forecast`, `/articles`, `/answers`,
`/compatibility`, `/weight-on-planets`, `/gift`, `/age-in-days`, `/age-in-seconds`,
`/birthday-countdown`, `/biological-age-vs-chronological-age`, `/country-comparison`,
`/embed`.

### `astrologyItems` (Astrology dropdown, 16)
`/kundali`, `/kundali-match`, `/astrologer`, `/sade-sati`, `/muhurat`,
`/career-report`, `/gemstones`, `/zodiac`, `/chinese-zodiac`, `/vedic-zodiac`,
`/moon-sign`, `/tarot-card-by-birthday`, `/compatibility`, `/birthday`,
`/rashi-ratna`, `/sun-vs-moon-sign`.

**Known duplication:** `/compatibility` appears in BOTH `exploreItems` and
`astrologyItems`.

Also present (unchanged, to preserve): Home button (hidden on `/`), Admin link
(admin only), Premium/Upgrade/Trial pill, mobile hamburger with sections
Popular / Explore / Astrology / More Tools.

## B. Current homepage sections (`Index.tsx`), top to bottom (19)
1. Header (Navigation + AuthNav)
2. Welcome-back line (logged-in + named users)
3. Hero (social-proof counter, headline, tagline, DOB input + "Reveal Everything",
   trust indicators, "Get your full Birthday Report" CTA, "who's celebrating today" CTA)
4. Sign-up banner (logged-out only)
5. `<BirthdayReportShowcase />`
6. `<BentoGrid />`
7. Planetary Weight Teaser
8. EEAT Trust Section ("Built on Trust & Accuracy")
9. Explore BornClock (6 cards + 12 zodiac chips)
10. More Ways to Know Yourself (3 cards)
11. Science cards row (7 cards)
12. Featured Indian Celebrity Profiles (8 celebs)
13. The science behind BornClock (3 cards)
14. `<TestimonialsSection />`
15. `<PageFAQ slug="home" />`
16. Explore Articles (6 links)
17. Popular Questions (4 links)
18. `<AuthorBio />`
19. `<Footer />`

## C. Homepage internal-link baseline (the HARD-RULE diff target)
Every distinct internal path linked from `Index.tsx` today (static roots):

```
/answers
/answers/how-long-will-i-live
/answers/how-many-days-until-my-birthday
/answers/what-is-my-zodiac-sign
/answers/who-shares-my-birthday
/articles
/articles/blue-zones-diet
/articles/how-to-live-to-100
/articles/longevity-quiz
/articles/moon-sign-by-date-of-birth
/articles/nakshatra-by-date-of-birth
/articles/numerology-by-date-of-birth
/auth (?signup=true)
/biological-age
/biological-age-calculator
/biorhythm
/birthday-report
/born-on/india
/celebrity/
/compatibility
/contact
/country-comparison
/energy-forecast
/how-long-will-i-live
/longevity-calculator
/planetary-age
/results
/todays-birthdays
/weight-on-planets
/zodiac/
```
Plus dynamic templates: `/zodiac/${sign}` (12 signs) and `/celebrity/${slug}/`
(8 featured celebs). **30 static roots + 2 dynamic bases.** After the restructure,
re-extract the same way and diff — the AFTER set must be a superset (nothing removed;
the new "choose your path" cards may add `/kundali` etc.).

Note: `BirthdayReportShowcase`, `BentoGrid`, `TestimonialsSection`, `PageFAQ`,
`AuthorBio` are imported child components repositioned as whole units — their internal
links are preserved by keeping the components mounted (not decomposed).

## D. Celebrity-count discrepancy (Phase 0.3) — REAL current state
- `indianCelebrities.length` = **598** (exact). → the two "598 Indian celebrities"
  references in `Index.tsx` (science card + "See all 598 profiles") are ACCURATE, and
  `CelebrityIndexPage.tsx` already renders this count dynamically.
- **"50,000+ celebrities" is NOT backed by any data source.** The real celebrity
  database (`src/data/celebrities.json`, which powers CelebritySearch / birthday-twin /
  Today's Birthdays) has **3,107** entries; `celebrity-bios.json` has 1,058. Nothing has
  50,000. The "50,000+" claim appears 4×: `Index.tsx:155` (hero) and `BentoGrid.tsx:463`
  (both on the homepage), plus `CelebrityBirthday.tsx:90` and `blogPosts.ts:5421` (off
  the homepage).
- **Fix (this session):** the two HOMEPAGE occurrences (Index hero + BentoGrid) →
  "3,000+ celebrities" (honest, backed by celebrities.json's 3,107). The two
  off-homepage occurrences are flagged in `docs/part-u-flags.md` as the same inaccurate
  claim, out of Part U's homepage/nav scope.
