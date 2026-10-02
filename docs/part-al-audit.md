# Part AL — Full Site Audit (Step 1) + Stub/Duplicate Decisions (Step 2)

Branch: `part-aj-four-page-redesign` (continued; NOT develop, NOT a new branch). 117 page
components. Design status markers: **NEW** = `paj` system; **OLD-cosmic** = `bg-gradient-cosmic`;
**OLD-plain** = legacy Tailwind.

**Totals at session start:** 9 NEW (Parts AJ/AK), 59 OLD-cosmic, 49 OLD-plain.

## Already redesigned & re-verified (Parts AJ/AK) — 9
`/vedic-astrology`, `/celebrity-birthday`, `/mystic-corner`, `/kundali`, `/kundali-match`,
`/sade-sati`, `/muhurat`, `/gemstones`, `/rashi-ratna` — all render the fixed `paj` CSS
(Step 2.5 fix already in place from Part AK commit `aa85f68`; re-verified this session, §Step 2.5).

## Categorized inventory (design status in brackets)
- **Vedic (13):** AstrologerPage[OLD-cosmic], CareerReportPage[OLD-cosmic], GemstonePage[NEW],
  KundaliMatchPage[NEW], KundaliPage[NEW], MoonSignPage[OLD-plain], MuhuratPage[NEW],
  RashiRatnaPage[NEW], SadeSatiPage[NEW], SunVsMoonSign[OLD-cosmic], VedicAstrologyLanding[NEW],
  VedicZodiac[OLD-cosmic], VedicZodiacSign[OLD-cosmic]
- **Mystic (13):** MysticCornerLanding[NEW], NumerologyPage[OLD-plain], NumerologyNumber[OLD-plain],
  NameNumerologyPage[OLD-plain], Zodiac[OLD-plain], ZodiacSign[OLD-plain], ChineseZodiac[OLD-cosmic],
  ChineseZodiacSign[OLD-cosmic], CompatibilityPage[OLD-plain], TarotByBirthday[OLD-plain],
  BiorhythmPage[OLD-plain], BabyNamesPage[OLD-cosmic], HindiNumerology/HindiZodiac[OLD-cosmic]
- **Birthday (30):** BirthdayCelebrityLanding[NEW], BirthdayReport[OLD-plain], BornOnDay*[OLD-cosmic],
  CelebrityPage/CelebrityIndexPage/CelebrityHubPage[OLD-plain], TodaysBirthdaysPage[OLD-cosmic],
  AgeCalculatorPage[OLD-cosmic], Birthstone*, BirthdayResults/Date/Month/Hub, Generation, … (full list below)
- **Science (28):** LifeExpectancy[OLD-cosmic], BiologicalAge[OLD-plain], CoachLandingPage[OLD-plain],
  CountryComparison[OLD-cosmic], LongevityCalculatorPage[OLD-plain], 10× country pages, LE-calculator
  wrappers, Hindi variants, PlanetaryAge/WeightOnPlanets/BMI etc.
- **Utility (18):** About, Contact[OLD-cosmic], Privacy[OLD-plain], FAQ, Pricing, Upgrade, Auth,
  Profile, Admin, Terms[OLD-cosmic], EditorialPolicy, AnswersIndex, Leaderboard, Reminders, Embed,
  SampleReport, DiwaliGift, ForBusiness
- **Article/Home (4):** Index[Home — EXCLUDED body/hero], Blog, BlogPost, ArticlesIndexPage
- **Shared infra (in scope):** `components/Navigation.tsx`, `components/Footer.tsx`

## Priority order used this session (Fourth Rule + earlier research = same list)
Realistically-winnable-now first, then hubs' key linked tools, then head-term pages last:
1. **Science & Longevity full rebuild** `/life-expectancy` (explicitly required this session; carry
   forward calc + paywall + pricing unchanged).
2. **Mystic winnable calculators:** `/numerology`, `/compatibility`, `/zodiac`, `/chinese-zodiac`.
3. **Vedic remaining tools:** `/career-report`, `/sun-vs-moon-sign`, `/moon-sign`, `/astrologer`.
4. Birthday templates (`/born-on/[date]`, celebrity profile, `/todays-birthdays`, `/age-calculator`),
   then utility pages (shared shell only), then head-term/long-tail remainder.
Global: trust-strip component (9a), prerender additions (Step 7), Step 8 launch pass, apply to the
9 already-redesigned result pages too.

**Transparency:** 108 pages are old-design; a single overnight session cannot fully finish all of
them to the per-page standard (theme+density+carry-forward+features+trust+SEO). Per the Fourth
Rule, pages are finished completely in priority order; whatever is not reached is listed in the
final report as conservatively deferred (shared nav/footer still give them baseline consistency).

## Step 2 — stub/duplicate decisions (conservative under the no-review autonomous constraint)
Consolidation + 301 redirects are destructive, SEO-sensitive, indexed-URL-affecting changes. Under
"no review / no stopping / conservative-omission," making them unsupervised is the riskier path, so:

- **`/life-expectancy-calculator-{uk|usa|canada|australia|singapore-uae}`** (thin 45–49-line
  wrappers, Singapore-UAE richer at 223): **KEEP — do NOT consolidate/redirect.** Country-specific
  life-expectancy is genuinely distinct search intent (different underlying country data), and
  removing indexed URLs unsupervised risks real traffic loss. Apply shared-shell consistency if
  reached; otherwise they inherit the updated nav/footer. (Conservative keep.)
- **Hindi wrappers + `/hi/rashifal`:** **Do NOT alter their compute logic** (verification of
  static-vs-computed was inconclusive this pass; changing computation unsupervised is risky). Leave
  functionally intact; a deeper static-vs-computed verification is conservatively deferred + noted.
- **`/vedic-zodiac` (solar-only):** **DECISION — leave as a clearly-labeled simpler solar tool**
  this session (do not rebuild the sidereal engine unsupervised). Explicit, not silent.
- **`/diwali-gift`, `/for-business`, `/coach`:** routes exist and load (not broken); **light
  shared-shell treatment only if reached; do not over-invest** relative to core category pages.

Every decision above is intentional and logged here per Step 2's requirement.
