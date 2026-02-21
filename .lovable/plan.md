

## Fix Celebrity Birthday Search: Prioritize Local Database and Fix Wikipedia Timeouts

### Problem

1. **Wikipedia (Wikidata) requests never finish** -- The app fires repeated SPARQL queries to `query.wikidata.org` that all abort after 3 seconds, then get rate-limited (429 errors), creating an infinite-feeling loading state. The network logs show 30+ failed requests in rapid succession.

2. **No clear progress indication** -- Users don't see which step the search is on (local vs. Wikipedia), so it feels like the app is stuck.

### Root Cause

The `searchBirthdayMatches` function in `BirthdaySearchService.ts` does check local data first, but:
- For dates not in the local database, it immediately hits Wikidata with a complex SPARQL query that consistently times out
- There's no retry limit or backoff -- multiple components may trigger simultaneous searches
- The `WikiBirthdayMatches` component re-renders and re-triggers searches due to the `useCallback` dependency chain

### Solution

#### 1. Add retry limits and caching to `BirthdaySearchService.ts`

- Add a **single-attempt limit** for Wikidata (no retries on failure)
- Add **localStorage caching** for successful API results (24-hour TTL)
- Increase the timeout from 3s to 8s for a single attempt (better chance of success)
- If Wikidata fails, gracefully fall back to nearby dates or show "no results" immediately

#### 2. Add step-by-step progress messages in `WikiBirthdayMatches.tsx`

Update the loading UI to show clear phases:
- Phase 1: "Searching our database..." (with a checkmark when done)
- Phase 2: "No local matches. Searching Wikipedia..." (only if Phase 1 found nothing)
- Phase 3: "Checking nearby dates..." (only if Wikipedia also failed)

Show each step with visual indicators so users understand what's happening.

#### 3. Prevent duplicate/concurrent searches

- Add a search abort mechanism using `AbortController` so that if the user changes the date, the previous search is cancelled
- Add a `useRef` flag in `WikiBirthdayMatches.tsx` to prevent overlapping searches

---

### Technical Details

**File: `src/services/BirthdaySearchService.ts`**

Changes:
- Add `getCachedResult()` and `setCachedResult()` helpers using `localStorage` with 24-hour expiry
- Modify `queryWikidata()`: increase timeout to 8s, add a single-attempt-only approach (remove any implicit retries)
- Modify `searchBirthdayMatches()`: check cache first, add an `AbortSignal` parameter, update progress messages to be more descriptive ("Searching our celebrity database...", "No local matches found. Checking Wikipedia...", etc.)

**File: `src/components/WikiBirthdayMatches.tsx`**

Changes:
- Store an `AbortController` ref to cancel in-flight searches when the date changes or component unmounts
- Update the loading state to show a multi-step progress indicator with checkmarks for completed steps
- Stabilize the `handleSearch` callback to prevent unnecessary re-triggers
- Add a timeout fallback: if the total search exceeds 15 seconds, stop and show whatever results were found

