

## Expand Internal Celebrity Database

### Current State

The app has two data sources that need expansion:

1. **`birthdayData.ts`** - Only **25 dates** covered with ~50 people and ~8 events. That means 340 out of 365 days have NO local data, forcing a Wikipedia lookup every time.

2. **`celebrities.ts`** - Only **20 celebrities**, and uses generic Unsplash stock photos (not actual celebrity images). Several entries also have incorrect date placements (e.g., Steve Jobs listed under Oct 5 but his actual birthday is Feb 24).

### Issues to Fix

- **Data errors**: Steve Jobs (birth: Feb 24) is filed under `10-05`. Mark Zuckerberg (birth: May 14) is filed under `05-21`. George Clooney (birth: May 6) is filed under `05-04`.
- **Low coverage**: Most days of the year have zero entries, meaning every search triggers a slow Wikipedia API call.
- **Duplicate data**: Some people exist in both files (e.g., Elon Musk, Emma Watson) with slightly different data.

### Plan

#### 1. Massively expand `birthdayData.ts`

Add entries to cover **all 365 days** of the year with at least 3-5 notable people per day across these categories:

- **Politicians/Leaders**: Presidents, Prime Ministers, world leaders
- **Scientists**: Nobel laureates, inventors, mathematicians
- **Actors/Actresses**: Oscar winners, Hollywood icons, international stars
- **Musicians/Singers**: Grammy winners, legendary performers
- **Sports Stars**: Olympic champions, football/cricket/basketball legends
- **Entrepreneurs**: Tech founders, business moguls
- **Artists/Writers**: Painters, authors, poets

Each entry will include: name, accurate birthDate, profession, category, description, and Wikipedia URL.

Also add more historical events per date where notable ones exist.

#### 2. Fix data errors in existing entries

- Move Steve Jobs to `02-24`
- Move Mark Zuckerberg to `05-14`
- Move George Clooney to `05-06`

#### 3. Consolidate `celebrities.ts` into `birthdayData.ts`

Merge the 20 celebrities from `celebrities.ts` into `birthdayData.ts` (adding their funFacts as descriptions). Keep the `celebrities.ts` file functional but have it reference the main database, avoiding duplicate maintenance.

#### 4. Target coverage

Aim for approximately **1,500-2,000 notable people** across all 365 days, ensuring:
- Every day has at least 3 entries
- Popular dates (holidays, famous birthdays) have 5-8 entries
- Good category diversity (not just actors)
- Global representation (not just American celebrities)

### Technical Details

**Files to modify:**
- `src/data/birthdayData.ts` - Major expansion with 365-day coverage
- `src/data/celebrities.ts` - Fix errors, remove duplicates already in birthdayData

**No database or API changes needed** - this is purely static data expansion.

Due to the massive size of this change, the implementation will be done in batches (e.g., Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec) to keep edits manageable.

