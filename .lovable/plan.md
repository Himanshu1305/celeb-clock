

## Redesign Home Page: Show Celebrity Matches Immediately After Date Entry

### Problem

Currently, when a user enters their birth date on the home page, they only see the age breakdown (years, months, days, etc.). To see celebrity matches, they must click "Celebrity Match" in the quick links section and navigate to a completely separate page (`/celebrity-birthday`). This is confusing because:

1. The celebrity match is a free feature but feels hidden behind an extra navigation step
2. After entering a birth date, the page shows only numbers — no engaging content
3. The "Explore More" quick links section competes with the actual results area
4. There's duplicated "About" content on the home page (two nearly identical sections)

### Solution

Restructure the Index page so that after a user enters their birth date, the page immediately shows:
1. Age breakdown (existing)
2. Celebrity birthday matches (from internal database — instant, no Wikipedia delay)
3. Zodiac sign and fun facts
4. A link/button to explore more on the dedicated Celebrity Birthday page for Wikipedia-powered deeper search

### Changes

#### File: `src/pages/Index.tsx`

- Import `CelebrityMatch` component (uses local database, instant results)
- Import `ZodiacAndFacts` component
- After the AgeCalculator section, add a `CelebrityMatch` section that renders when `birthDate` is set
- Add a `ZodiacAndFacts` section below that
- Add a "Want more? Search Wikipedia for celebrity matches" CTA button linking to `/celebrity-birthday`
- Remove the duplicate "About" section (lines 122-175 — there are two nearly identical blocks)
- Keep the quick links section but move it below the results

#### File: `src/components/Navigation.tsx`

- Move "Celebrity Match" out of the Calculators dropdown and into the top-level nav bar so it's more visible and accessible (same level as Zodiac, Birthstone, Blog)

### What stays the same

- The `/celebrity-birthday` page remains as-is for deeper Wikipedia-powered search
- The AgeCalculator component is unchanged
- The BirthDateContext sharing between pages continues working
- The CelebritySearch component on the celebrity-birthday page stays

### Result

- Users see celebrity matches immediately after entering their birth date — no extra clicks
- The home page becomes more engaging with rich content (age + celebrities + zodiac)
- The dedicated celebrity page serves as an advanced search for power users
- Celebrity Match is visible in the main nav for easy access

