

## Redesign Homepage as a Hub + Add New Dedicated Pages

### Problem
The current homepage is a long, linear scroll that dumps everything (calculator, planetary age, celebrity match, zodiac, numerology, shareable card, testimonials, about section) onto one page. It feels cluttered and doesn't communicate what the app is about at a glance. Features like Numerology, Planetary Age, and Today's Birthdays are buried in the scroll rather than being discoverable as standalone tools.

### Recommendation: Today's Birthdays on Homepage
Keep a compact "Today's Birthdays" highlight on the homepage (top 4-5 people) as a retention hook -- it gives returning visitors something new every day. But also give it a dedicated page (`/todays-birthdays`) for users who want the full list. This is the best of both worlds: daily freshness on the homepage + a full experience on its own page.

### New Homepage Structure

The homepage becomes a **landing hub** that explains the app and links to features, rather than embedding every tool inline.

**Layout (top to bottom):**
1. **Header** (Navigation + AuthNav) -- updated nav with new routes
2. **Welcome message** (logged-in users only, unchanged)
3. **Hero Section** -- concise value proposition: "Your Birthday, Decoded" with a short description of what the app offers, plus a primary CTA to the Age Calculator
4. **Feature Grid** -- 6 feature cards in a responsive grid (2x3 on desktop, 1 column on mobile), each navigating to its dedicated page:
   - Calculate Your Age (`/age-calculator`) 
   - Today's Birthdays (`/todays-birthdays`)
   - Celebrity Match (`/celebrity-birthday`)
   - Numerology (`/numerology`)
   - Planetary Age (`/planetary-age`)
   - Life Expectancy (`/life-expectancy`) -- Premium badge
5. **Today's Birthdays Preview** -- compact card showing top 4-5 famous people born today with "See All" link (retention hook)
6. **Also Explore** -- Zodiac, Birthstone as smaller cards (existing pattern)
7. **Sign Up CTA** (non-authenticated only)
8. **Testimonials**
9. **About / EEAT Section** (trimmed down)
10. **Footer**

### New Dedicated Pages
- `/age-calculator` -- Move the AgeCalculator component + ShareableCard here. The birth date context persists across pages.
- `/todays-birthdays` -- Full-page TodaysBirthdays with expanded list, historical events, etc.
- `/numerology` -- NumerologyLifePath as a standalone page with its own SEO
- `/planetary-age` -- PlanetaryAge as a standalone page with its own SEO

Each new page will follow the existing page pattern: Navigation + AuthNav header, SEO component, main content, Footer.

### Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Rewrite as a hub landing page with feature grid |
| `src/pages/AgeCalculatorPage.tsx` | Create -- dedicated page for age calculator + shareable card |
| `src/pages/TodaysBirthdaysPage.tsx` | Create -- full today's birthdays page |
| `src/pages/NumerologyPage.tsx` | Create -- standalone numerology page |
| `src/pages/PlanetaryAgePage.tsx` | Create -- standalone planetary age page |
| `src/components/Navigation.tsx` | Update -- add new nav items (Age Calculator, Today's Birthdays, Numerology, Planetary Age) |
| `src/components/FeaturePillars.tsx` | Rewrite as 6-card feature grid for the homepage |
| `src/App.tsx` | Add routes for `/age-calculator`, `/todays-birthdays`, `/numerology`, `/planetary-age` |

### Technical Notes
- `BirthDateContext` already persists the birth date in localStorage, so users who enter their date on one page will see results on all other pages automatically
- Existing components (`AgeCalculator`, `PlanetaryAge`, `NumerologyLifePath`, `TodaysBirthdays`, `ShareableCard`) are already self-contained and just need a `birthDate` prop -- no refactoring needed, just wrapping in page layouts
- The homepage will no longer embed calculators directly -- it becomes a clean landing page that routes users to the right tool

