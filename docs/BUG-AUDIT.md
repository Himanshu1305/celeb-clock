# BornClock — Page Sweep Audit (Phase 3c)

Runtime render sweep of 57 routes against the dev server (:3000). Generated: 2026-07-27.

**Scope:** uncaught page errors, console.error (env noise filtered), literal undefined/NaN/null in visible text, empty renders. Title/meta uniqueness is audited in Phase 4 against prerendered dist/ output (dev SPA titles are not representative).

## Summary

- Routes swept: **57**
- Clean: **57**
- Flagged: **0**

## All routes

| Route | Status | Body chars | OK |
|---|---|---|---|
| `/` | 200 | 7972 | ✅ |
| `/about` | 200 | 4666 | ✅ |
| `/age-calculator` | 200 | 2638 | ✅ |
| `/auth` | 200 | 738 | ✅ |
| `/biological-age` | 200 | 4223 | ✅ |
| `/biorhythm` | 200 | 4726 | ✅ |
| `/birthday-report` | 200 | 3379 | ✅ |
| `/birthday` | 200 | 4968 | ✅ |
| `/birthstone` | 200 | 10475 | ✅ |
| `/blog` | 200 | 14376 | ✅ |
| `/born-on` | 200 | 2652 | ✅ |
| `/celebrity-birthday` | 200 | 4436 | ✅ |
| `/chinese-zodiac` | 200 | 4029 | ✅ |
| `/compatibility` | 200 | 4351 | ✅ |
| `/contact` | 200 | 1922 | ✅ |
| `/country-comparison` | 200 | 13662 | ✅ |
| `/editorial-policy` | 200 | 2456 | ✅ |
| `/family` | 200 | 522 | ✅ |
| `/faq` | 200 | 3608 | ✅ |
| `/generation` | 200 | 5879 | ✅ |
| `/gift` | 200 | 3379 | ✅ |
| `/leaderboard` | 200 | 1698 | ✅ |
| `/life-expectancy` | 200 | 3078 | ✅ |
| `/methodology` | 200 | 12031 | ✅ |
| `/moon-sign` | 200 | 4902 | ✅ |
| `/name-numerology` | 200 | 5066 | ✅ |
| `/numerology` | 200 | 9891 | ✅ |
| `/planetary-age` | 200 | 6295 | ✅ |
| `/privacy` | 200 | 14925 | ✅ |
| `/profile` | 200 | 738 | ✅ |
| `/results` | 200 | 472 | ✅ |
| `/tarot-card-by-birthday` | 200 | 4099 | ✅ |
| `/terms` | 200 | 2615 | ✅ |
| `/todays-birthdays` | 200 | 6276 | ✅ |
| `/upgrade` | 200 | 3997 | ✅ |
| `/vedic-zodiac` | 200 | 4375 | ✅ |
| `/zodiac` | 200 | 12161 | ✅ |
| `/answers/how-does-stress-affect-life-expectancy` | 200 | 5866 | ✅ |
| `/answers/how-long-will-i-live` | 200 | 4435 | ✅ |
| `/answers/how-old-am-i-on-mars` | 200 | 3473 | ✅ |
| `/answers/how-to-calculate-age` | 200 | 3793 | ✅ |
| `/answers/how-to-live-longer` | 200 | 4314 | ✅ |
| `/answers/what-generation-am-i` | 200 | 4445 | ✅ |
| `/answers/what-is-bmi` | 200 | 3780 | ✅ |
| `/answers/what-is-life-expectancy` | 200 | 4438 | ✅ |
| `/answers/what-is-my-biological-age` | 200 | 4531 | ✅ |
| `/answers/what-is-my-life-path-number` | 200 | 4151 | ✅ |
| `/answers/what-is-my-zodiac-sign` | 200 | 4216 | ✅ |
| `/answers/who-shares-my-birthday` | 200 | 4074 | ✅ |
| `/zodiac/leo` | 200 | 7517 | ✅ |
| `/chinese-zodiac/rat` | 200 | 6421 | ✅ |
| `/numerology/7` | 200 | 5201 | ✅ |
| `/born-on/july-15` | 200 | 4259 | ✅ |
| `/birthday/6/25` | 200 | 7210 | ✅ |
| `/birthstone/april` | 200 | 8208 | ✅ |
| `/vedic-zodiac/mesha` | 200 | 4375 | ✅ |
| `/compatibility/aries/leo` | 200 | 5208 | ✅ |

## Manual findings (Phase 3)

1. **Malformed report payload → ReportView crash (caught).** A `birthday_reports`
   row created via `/api/save-report` with an INCOMPLETE `reportData` (missing the
   computed fields `generateReportData()` produces) makes `/report/[slug]` throw
   `Cannot read properties of undefined (reading 'toLocaleString')`. It is caught
   by the report error boundary ("Something went wrong loading this report" +
   "Create a New Report"), so it is not a white-screen. The real form always sends
   complete data, so this only manifests with malformed direct API calls.
   RECOMMENDATION (safe, not done tonight to avoid API-file scope creep):
   `save-report` should reject `reportData` lacking required top-level fields; or
   ReportView should guard `?.toLocaleString()`. Documented, not launch-blocking.

2. **DOB rollover accepted — FIXED (Phase 3b).** `/birthday-report` built the DOB
   from DD/MM/YYYY and validated with `isNaN(new Date(dob))`, which accepted
   impossible dates JS rolls over (29 Feb non-leap → 1 Mar, day 31 of a 30-day
   month). Added strict round-trip validation in `BirthdayReport.handleSubmit`.

3. **`/results` thin render (472 chars) is EXPECTED.** Direct navigation with no
   `BirthDateContext` shows the "No Birthday Selected → Go to Homepage" empty
   state. Not a bug.

4. **`/birthday/:month/:day` expects a NUMERIC month** (`/birthday/6/25`). An
   alpha month (`/birthday/june/25`) is an invalid URL and renders a graceful
   "Date not found" page. The canonical alpha-slug date pages live at
   `/born-on/june-25`. No internal links point to `/birthday/:month/:day` with an
   alpha month, so this is correct handling, not a defect.

5. **Title/meta uniqueness** is audited in Phase 4 against prerendered `dist/`
   output — dev-server SPA titles are runtime-set and unrepresentative.
