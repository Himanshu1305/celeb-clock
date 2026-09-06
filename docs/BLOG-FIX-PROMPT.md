# Blog Fixes + Life Path Rename — Priority Batch
# Save as docs/BLOG-FIX-PROMPT.md → "Read docs/BLOG-FIX-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/BLOG-FIX-REPORT.md.

CONTEXT: LIVE site, paying customers. Frozen: api/_crypto.ts,
api/razorpay-webhook.ts, api/verify-payment.ts. Fix-loop policy from
docs/TEST-SUITE-PROMPT.md applies to every phase (classify → fix product bugs →
re-run affected then full suite → max 3 iterations → NEVER weaken an assertion).
ONE deploy at the end.

## PHASE 1 — THE 6 NEW ARTICLES 404 IN PRODUCTION (highest priority)

FOUNDER-VERIFIED: all six batch-2 article URLs show "Article Not Found" live.
Verified independently: https://bornclock.com/blog/how-we-rank-celebrity-birthdays-sitelinks/
returns the HOMEPAGE shell (canonical = https://bornclock.com/), not the article.

ROOT CAUSE TO CONFIRM: the articles were prerendered/sitemapped but never wired
into the blog data source (src/data/blogPosts.ts or equivalent), so the client
route finds no post and renders the not-found state; the server returns the SPA
fallback (HTTP 200) for the path.

1. Read src/data/blogPosts.ts and src/pages/BlogPost.tsx. Determine exactly how a
   post is looked up by slug and whether the 6 new posts exist in that source.
2. Fix so all six render correctly, with the SAME slug as already sitemapped +
   IndexNow-pinged (do NOT change the URLs — they are already submitted):
   /blog/best-month-to-be-born-what-data-says/
   /blog/biorhythm-workouts-honest-guide-training-by-cycles/
   /blog/born-on-a-national-holiday-birthday-history/
   /blog/cycle-syncing-for-men-gender-neutral-version/
   /blog/how-we-rank-celebrity-birthdays-sitelinks/
   /blog/7-day-energy-forecast-rhythm-awareness/
3. Verify each: correct <title>, correct canonical (NOT the homepage), h1 matches
   the article, body content present, FAQPage schema present, mesh links present,
   share bar present, subscribe block present.
4. Trailing-slash behaviour: confirm both /slug and /slug/ resolve to the article
   (301 to one canonical form is fine — state which).

## PHASE 2 — THE TEST FLAW THAT LET THIS SHIP (critical process fix)

The batch-2 report claimed "all 6 return 200". The SPA fallback returns 200 for
ANY path, so a status assertion CANNOT detect a missing page on this
architecture. Every page test that asserts only on status is structurally
incapable of failing.

1. Audit ALL existing page tests (gauntlet + prelaunch) for status-only
   assertions on page routes. List them in the report.
2. Strengthen each to assert on CONTENT: a route-specific <title> or h1 string,
   and canonical ≠ homepage. A page test must fail when the route falls through
   to the SPA shell.
3. Add a dedicated guard test: request a deliberately bogus route
   (/blog/this-does-not-exist-xyz) and assert the app renders the not-found
   state — proving the suite can distinguish real pages from fallbacks.
4. This is a legitimate spec strengthening, not assertion-weakening — document it.

## PHASE 3 — RAW HTML TAGS RENDERING AS TEXT IN OLDER ARTICLES

FOUNDER-VERIFIED on /blog/birthday-traditions-around-the-world-unique-celebrations/:
the body contains literal <h2> and <p> tags rendered as visible text instead of
formatted headings/paragraphs.

1. Identify EVERY post whose content field contains raw HTML tags. List by slug.
2. Read how BlogPost renders content (markdown parser? dangerouslySetInnerHTML?
   plain text?) and determine the minimal correct fix: either render HTML
   properly (sanitised) or convert those posts' content to the format the
   renderer expects. Choose based on what the majority of posts use; state the
   decision and why.
3. Fix ALL affected posts — proper h2/h3 hierarchy, paragraphs, emphasis, lists.
   No content rewriting; formatting only.
4. Verify a sample of 3 fixed posts renders with real headings (assert the DOM
   contains <h2> elements, not escaped text).

## PHASE 4 — "LIFE PATH" MISLABEL ON /birthday/{m}/{d} (deferred from batch 3)

SEO-MAGNET-3 correctly flagged but deferred this: the BirthdayDatePage route
labels the day-only reduction as "Life Path", which CONTRADICTS the paid
Birthday Blueprint (whose Life Path uses the FULL birth date). A customer
reading the free page then buying the report sees two different Life Path
numbers — a refund-generating inconsistency.

1. Rename to "Birth Day Number" everywhere on that route and in the shared data
   module where it refers to the day-only reduction (~77 occurrences flagged).
   Be careful: do NOT rename genuine full-date Life Path usages (the report, the
   numerology pages) — read each occurrence's context before changing it.
2. Add the same clarifying line used on /born-on pages: the full Life Path, from
   the complete date, is in the Birthday Blueprint (natural CTA).
3. Audit for the same conflict anywhere else: grep "Life Path" across src/ and
   confirm every remaining usage is genuinely full-date derived. Table it in the
   report.

## GATE
tsc 45 baseline 0 new · build 1338 ok 0 failed (browser-recycling fix is in
place; retry once on a flake) · gauntlet 135 + prelaunch (96 + new) all green
under the fix-loop policy · frozen files untouched · invoice_counters untouched
(paste) · ONE deploy · live verification of all 6 article URLs with real titles
pasted in the report · IndexNow re-ping the 6 URLs after deploy.

## REPORT
Root cause of the 404s first · the status-only test audit list and what changed ·
posts fixed for HTML formatting · the Life Path → Birth Day Number occurrence
table · live-verified article titles · founder spot-check list.
