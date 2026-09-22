# BornClock — Part AD: Technical SEO Fixes (Canonicalization, Duplicate URLs, Indexing)
## Single Claude Code session prompt. Fixes real, data-confirmed problems found in a live Search Console export (2026-09-22). Branch off current production, test on staging, stop before touching production.

---

## CONTEXT FOR CLAUDE CODE

A real Google Search Console export was analyzed (Performance + Coverage, both dated
2026-09-22). It found concrete, fixable technical SEO problems currently live on
production bornclock.com, unrelated to the feature work happening on other branches
(Part AC, etc.). This work should proceed independently and in parallel — it does not
depend on Part AC finishing first, since these are live production bugs.

**Branch:** create `part-ad-seo-fixes` off the current production-deployed commit.
Verify what's actually live via the real deployed state — `wrangler deployments
list` or the Cloudflare dashboard, or by comparing live site behavior against
branch content — do not assume the `main` branch's latest commit is what's running,
since production can also be updated by a manual `wrangler deploy` that doesn't
require a `main` merge. If this is genuinely unclear from what's available, stop
and ask the person rather than guessing.

**The person does not read code.** Final summary must contain real, verifiable
before/after evidence for every fix — actual URLs, actual `curl -I` header output,
actual canonical tag contents — not just "done."

**Standing rule, unchanged:** do not deploy to production without being asked. Get
this fully tested on staging and report back for review first.

---

## THE DATA THAT MOTIVATES THIS (for reference while working)

- 852 pages indexed vs. **3,580 not indexed**. Of the not-indexed pages, **2,857** are
  "Discovered – currently not indexed" (Google found them but hasn't bothered crawling/
  indexing them — usually a sign of thin/duplicate content or wasted crawl budget),
  340 are "Alternate page with proper canonical tag" (a duplicate correctly pointing
  elsewhere), 319 are "Page with redirect," 26 are "Duplicate without user-selected
  canonical."
- The crawl sample shows large numbers of query-parameter URLs being crawled:
  `/?day=4&month=9`, `/?birthDate=9/12`, etc. — these look like duplicate/near-duplicate
  content of the canonical `/born-on/[date]/` or `/birthday/[date]` pages.
- `/born-on/august-6/india/` (trailing slash) and `/born-on/august-6/india` (no
  trailing slash) appear as **two separate rows** in the Performance report — 18
  clicks/1,995 impressions vs. 7 clicks/764 impressions — for what should be one page.
  This is real, measurable split authority on your single best-performing page.
- The query `aries+date` (literal plus sign) has **1,938 impressions** — one of the
  highest in the entire export — but 0 clicks and position 91. This looks like a
  broken link, malformed parameter, or leaked raw query string somewhere.
- Large numbers of `/blog/?tag=X` archive pages (autophagy, gut health, blue zones,
  chronotype, etc.) are being crawled — these are typically thin, near-duplicate
  listing pages that compete for crawl budget against real content.

---

## PART 1: Fix trailing-slash / URL canonicalization inconsistency

### What to do
1. Audit the codebase for every route pattern that can be reached both with and
   without a trailing slash (start with `/born-on/[date]/india` since it's confirmed,
   but check systematically — likely the same routing config affects other dynamic
   routes too, e.g. `/birthday/[date]`, `/celebrity-birthday/`, etc.).
2. Pick ONE canonical form site-wide (recommend: no trailing slash, but match
   whatever the framework's existing convention mostly already is — check first
   rather than assuming) and configure the router/redirect layer to 301-redirect
   the non-canonical variant to the canonical one.
3. Ensure every page emits a correct `<link rel="canonical">` tag pointing to its own
   canonical URL (the trailing-slash-consistent version), not just relying on
   redirects — redirects and canonical tags should agree, not just one or the other.
4. Update internal links sitewide (nav, related-content links, sitemap generation)
   to only ever generate the canonical form — fix at the source, don't just redirect
   after the fact.

### Testing for Part 1
- `curl -I` both variants of `/born-on/august-6/india` (with and without trailing
  slash) on staging and paste the real response headers — confirm a 301 to the
  canonical form.
- Fetch the canonical tag from the rendered HTML of the canonical URL and paste it.
- Confirm at least 3 other route families (not just `/born-on/`) were audited and
  either confirmed clean or fixed the same way — list which ones were checked.
- Confirm no internal link on the live staging site still points to a non-canonical
  variant (spot-check the homepage, a `/born-on/` page, and the celebrity-birthday
  hub page for outgoing links).

---

## PART 2: Eliminate query-parameter duplicate URLs

### Background
`/?day=4&month=9`, `/?birthDate=9/12`, and similar query-string URLs are being
crawled and indexed as if they were distinct pages, when they're near-duplicates of
canonical `/born-on/[date]/` or `/birthday/[date]` content.

### What to do
1. **First, verify what each query-parameter pattern actually is before assuming
   anything about it.** `/?day=X&month=Y` and `/?birthDate=X/Y` are NOT necessarily
   duplicates of the `/born-on/[date]/` celebrity-list pages — `/born-on/` is a
   public database page (celebrities born on a given date), whereas these
   query-parameter URLs on the bare homepage may instead be the personal
   "enter your own birthday" tool's result state, which looks like it already has
   its own separate canonical pattern (`/birthday/[month]/[day]/` — confirmed real
   and indexed, e.g. `/birthday/1/1`). Load/inspect actual examples of each
   query-parameter pattern on staging or production and determine, for each one,
   which existing canonical page family (if any) it actually duplicates — do not
   assume it's `/born-on/` by default. Report this finding explicitly before
   proceeding, since it determines the correct redirect target.
2. Find where these query-parameter URLs are being generated — almost certainly a
   date-picker or calendar widget on the homepage or elsewhere that builds a link
   like `?day=X&month=Y` or `?birthDate=X/Y` instead of navigating to the correct
   canonical route identified in step 1. Fix the widget/component itself to link
   to (or client-side route to) the canonical URL, so these URLs stop being newly
   created/discovered going forward.
3. For any such URL that has real, matching canonical content (per step 1), add a
   `<link rel="canonical">` on the query-parameter version pointing to the correct
   canonical page, AND set up a 301 redirect to that same correct target.
4. If any query-parameter pattern doesn't cleanly map to an existing canonical page,
   decide case-by-case: either build the mapping so it does, or add `noindex` to
   that specific pattern so it stops competing for crawl budget without breaking
   the actual user-facing feature.
5. Remove any query-parameter URLs from `sitemap.xml` if present — the sitemap
   should only ever list canonical URLs.

### Testing for Part 2
- Report which canonical page family each query-parameter pattern actually
  corresponds to (`/born-on/`, `/birthday/[month]/[day]/`, or something else) —
  this must be a verified finding, not an assumption.
- Identify and fix the actual source component generating these URLs — name the
  file/component in the report.
- `curl -I` at least 3 real examples of query-parameter URLs from the crawl sample
  (e.g. `/?day=4&month=9`, `/?birthDate=9/12`) on staging and paste the real
  response — confirm redirect or correct canonical tag.
- Confirm the sitemap no longer contains query-parameter URLs — paste a grep/count
  before and after.
- Confirm the underlying user-facing feature (date picker / birthday lookup) still
  works correctly end-to-end after the fix — this must not become a functional
  regression.

---

## PART 3: Reduce crawl weight of thin blog tag archive pages

### Background
Large numbers of `/blog/?tag=X` pages (one per tag: autophagy, gut health, blue
zones, chronotype, exercise science, etc.) are being crawled. These are typically
thin listing/archive pages that add little unique value per page and compete for
crawl budget against real content.

### What to do
1. Add `noindex, follow` (not a full `disallow` in robots.txt — that would also
   block link-equity flow to the linked articles) to `/blog/?tag=X` archive pages
   specifically, leaving the underlying blog articles themselves fully indexable.
2. Confirm this doesn't affect the main `/blog/` index or individual article pages —
   only the tag-filtered archive views.
3. Remove any `/blog/?tag=X` URLs from `sitemap.xml` if present.

### Testing for Part 3
- Fetch the rendered HTML of a `/blog/?tag=X` page on staging and confirm the
  `noindex` meta tag is present.
- Confirm a real blog article page (not a tag archive) still has no `noindex` and
  is fully indexable.
- Confirm the sitemap no longer lists tag-archive URLs.

---

## PART 4: Investigate the `aries+date` anomaly

### Background
The query `aries+date` (literal plus sign, not a space) shows 1,938 impressions —
one of the highest in the entire export — 0 clicks, position 91. This pattern
(a `+` character in what Google reports as a search query) usually means either a
broken/malformed link somewhere sending a raw URL-encoded parameter into a page
Google is indexing, or a genuine artifact of how a page's title/URL is being
generated.

### What to do
1. Search the codebase, sitemap, and any internal links for anything that could
   produce a URL or page title containing a literal `aries+date` string — check
   zodiac-related pages (e.g. `/zodiac/aries/`, `/aries-dates/`, or similar) for a
   broken link, malformed parameter, or an old redirect that's leaking this pattern.
2. Trace it to its actual root cause — do not guess or assume it's benign without
   checking.
3. Fix the root cause: correct the broken link/parameter, or redirect it properly
   to the real, correct Aries zodiac dates page if one exists.

### Testing for Part 4
- Report exactly what was found and where it originates — with the specific
  file/URL — before and after the fix.
- Confirm the fix doesn't break the legitimate Aries zodiac page if one exists.

---

## PART 5: Sitemap audit

### What to do
1. After Parts 1–4, regenerate or audit `sitemap.xml` end-to-end: confirm it
   contains only canonical, indexable URLs — no query-parameter duplicates, no
   trailing-slash-inconsistent duplicates, no `noindex`-tagged tag-archive pages.
2. Spot-check that every canonical page that SHOULD be discoverable actually is
   reachable via internal links from somewhere crawlable (no orphaned pages).

### Testing for Part 5
- Paste a real before/after count of total sitemap URLs, and a real before/after
  spot-check of the specific problem patterns from Parts 1–3 (should be zero after).

---

## RESOURCE SAFETY NET

If Part 4's root-cause investigation stalls without a clear answer after a
reasonable effort, document what was checked and ruled out in
`docs/part-ad-flags.md` and move on to finishing Parts 1, 2, 3, and 5 — don't let
one unresolved mystery block the parts that have clear, mechanical fixes.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the full existing test suite before and after these changes — this is a
technical/routing change, so regressions here would be routing/redirect bugs, not
feature bugs, but the suite should still pass. Deploy `part-ad-seo-fixes` to
staging and verify end-to-end: the homepage, a `/born-on/` page, a `/blog/` article,
and the date-picker/birthday-lookup feature all still work correctly.

Final plain-language summary must include: every fix made, with real before/after
URLs and header/tag evidence (not just "fixed"); the Part 4 root-cause finding;
the sitemap before/after counts; and confirmation that `part-ad-seo-fixes` is
tested and staged, left unmerged for review — do not merge to develop or main, and
do not deploy to production, without explicit go-ahead.

---

## WHAT NOT TO DO

- Do not `noindex` anything that currently has real, converting traffic — the
  `/born-on/` pages and `/blog/` articles themselves must remain fully indexable;
  only query-parameter duplicates and tag-archive pages get touched.
- Do not use a robots.txt `disallow` for the blog tag archives — use `noindex,
  follow` instead, so link equity still flows to the real articles.
- Do not remove or alter any actual content — this is a technical delivery/
  indexing fix only.
- Do not merge this branch into develop or main, and do not deploy to production,
  under any circumstance without explicit go-ahead.
- Do not guess at the `aries+date` root cause without actually checking — report
  what was found, not a plausible-sounding assumption.
