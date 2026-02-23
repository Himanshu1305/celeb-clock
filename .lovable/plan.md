
## Wire Up the Expanded Birthday Database

The 12 monthly data files (january.ts through december.ts) have been created with 1,000+ celebrity entries covering all 365 days, but they are not yet connected to the app. Here's what needs to happen:

### Step 1: Create `src/data/birthdays/index.ts` (barrel file)

Create a new file that imports all 12 monthly databases and merges them into a single `BirthdayDatabase` object using the spread operator:

```typescript
import { januaryBirthdays } from './january';
import { februaryBirthdays } from './february';
// ... all 12 months
export const allBirthdays = {
  ...januaryBirthdays, ...februaryBirthdays, ... // etc
};
```

### Step 2: Rewrite `src/data/birthdayData.ts`

Replace all the inline data (the old 25-date `birthdayDatabase` object) with a simple import from the new barrel file. Keep the helper functions (`getBirthdayData`, `getCategoryIcon`, `searchCelebrities`) intact but have them read from the merged database.

- Remove the ~200 lines of inline data
- Add `import { allBirthdays } from './birthdays'`
- Set `export const birthdayDatabase = allBirthdays`

### Step 3: Update `src/data/celebrities.ts`

Update `findCelebrityByBirthday` to pull from the main `birthdayDatabase` instead of maintaining a separate list. Keep the `Celebrity` interface and `celebrities` array (used by `CelebrityMatch.tsx`) but fix the incorrect dates:

- Steve Jobs: keep only in `02-24` (already correct in february.ts)
- Mark Zuckerberg: keep only in `05-14` (already correct in may.ts)
- George Clooney: keep only in `05-06` (already correct in may.ts)

### Step 4: No other files need changes

`BirthdaySearchService.ts` already imports from `birthdayData.ts` and `celebrities.ts`, so it will automatically pick up the expanded data. `CelebritySearch.tsx` and `CelebrityMatch.tsx` also import from these files and will work without changes.

### Result

- Every day of the year will have 3-5 instant local matches
- Wikipedia API calls will rarely be needed
- Search will feel near-instant for most dates
