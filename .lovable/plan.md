

## Implement Home Page Redesign

The approved plan will be implemented with these specific changes:

### 1. Update Navigation (`src/components/Navigation.tsx`)

Remove the dropdown menu approach entirely. Replace with flat top-level nav buttons for all pages: Life Expectancy, Celebrity Match, Zodiac, Birthstone, Blog. Remove the `NavigationMenu` import since it's no longer needed.

### 2. Restructure Index Page (`src/pages/Index.tsx`)

**Add imports:**
- `CelebrityMatch` from `@/components/CelebrityMatch`
- `ZodiacAndFacts` from `@/components/ZodiacAndFacts`

**After the AgeCalculator section, add (when birthDate is set):**
1. Celebrity Match section showing instant local database results
2. Zodiac and Facts section showing zodiac sign, birthstone, and month facts
3. A CTA button: "Search for more celebrity matches on Wikipedia" linking to `/celebrity-birthday`

**Remove:**
- The duplicate "About" section (lines 121-132 — first copy) since lines 134-175 has the fuller version
- Keep the Quick Links section but move it below the new results sections

**Result flow after entering a birth date:**
1. Age breakdown (existing calculator)
2. Celebrity birthday matches (instant, from local DB)
3. Zodiac sign + birthstone + fun facts
4. "Want more?" CTA to celebrity search page
5. Quick links to other tools
6. Testimonials
7. About section (single copy)
8. Review form

