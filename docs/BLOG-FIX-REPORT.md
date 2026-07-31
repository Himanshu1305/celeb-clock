# BLOG-FIX — Execution Report

Blog 404 investigation · the status-only test flaw · raw-HTML article formatting ·
"Life Path" → "Birth Day Number" rename. Local commits only, one deploy.

---

## PHASE 1 — The "6 articles 404" — root cause

**Finding: the six articles are correctly wired and are live-verified working on the
current deploy.** They are NOT 404ing now. Evidence gathered before changing anything:

- **Data wiring is intact.** `src/data/blogPostsExtra.ts` exports the 6 posts;
  `src/data/blogPosts.ts` does `import { EXTRA_POSTS }` and spreads `...EXTRA_POSTS`
  into the array; `getPostBySlug(slug)` finds by `post.slug`. All 6 slugs match the
  sitemapped/IndexNow'd URLs exactly.
- **Prerendered production HTML is correct** — for all 6, the `<title>`, the single
  `<link rel="canonical">` (pointing at the article, NOT the homepage) and the article
  `<h1>` in the body are all present.
- **Client hydration is correct** — headless-Chrome render of all 6 live URLs: body does
  NOT contain "Article Not Found", `<h1>` is the real article title, canonical is the
  article. The `/blog` index lists all 6.

**Why the founder saw "Article Not Found / canonical = homepage":** the most likely
explanation is a DOM/tooling artifact rather than a missing page. On the client SPA the
static `index.html` canonical (which points at the homepage) is emitted FIRST, and
react-helmet then appends the article's own canonical (`data-rh="true"`). An inspection
that reads the *first* canonical reports the homepage even though the article rendered.
The production prerender rewrites this to a *single* correct canonical (verified live).
A stale Cloudflare edge copy from before full propagation, since purged by the
SEO-MAGNET-3 redeploy, is the other plausible trigger. Either way the durable safeguard
is Phase 2 — content-level tests that fail if a route ever does fall through to the shell.

- **Trailing slash:** `/blog/{slug}` → `301` → `/blog/{slug}/` (canonical, trailing
  slash), which serves the prerendered article. Both forms reach the article.

Live-verified titles are pasted in the GATE section below.

## PHASE 2 — The status-only test flaw (process fix)

**The flaw:** the SPA `not_found_handling = single-page-application` returns HTTP **200
for any path**. So any page test that asserts only on `status().toBe(200)` — or even on
"an `<h1>` is visible" / "title length > 10" — cannot fail when a route falls through to
the shell or renders its client-side not-found state (both have an h1 and a 200). The
batch-2 "all 6 return 200" check was structurally blind for exactly this reason.

**Audit (page-route tests):** most `status().toBe(200)` assertions in the suite are on
**assets/APIs** (robots.txt, sitemap.xml, llms.txt, og png, `/api/*` endpoints) where
status is the correct signal — those are fine. The page-route tests already assert some
content (`01-public-pages` checks a route-specific `titleContains`; `growth-pages` checks
h1 + unique title + canonical≠home + FAQPage; `ops-seo` checks unique title + canonical≠
home). The gap they shared: none asserted that the **body is the real page** (route-
specific h1 text) rather than a shell/not-found — a prerender-injected title is unique
even on a broken body.

**What changed (spec strengthening, not weakening):**
- **New `e2e/prelaunch/blog-integrity.spec.ts`:** for the 6 new posts + a control, assert
  the `<h1>` CONTAINS the article's own title text, the body does NOT contain "Article
  Not Found", and the react-helmet canonical contains the slug. These FAIL if a post is
  missing — i.e. they would have caught the reported bug.
- **Fallback-detection guard:** `/blog/this-does-not-exist-xyz-9999` MUST render the
  not-found state. This proves the suite can still distinguish a real page from a
  fallback (if it couldn't, the positive tests would be meaningless).
- **`growth-pages.spec.ts` strengthened:** the 18-page loop now also asserts the body is
  not a not-found/error shell.

## PHASE 3 — Raw HTML tags rendering as text

- **Affected posts (audited all 39):** exactly **1** —
  `birthday-traditions-around-the-world-unique-celebrations`. Its `content` used literal
  `<h2>`/`<p>`/`<em>` tags; the other 38 use Markdown.
- **Renderer:** `BlogPost.tsx` renders `content` with `ReactMarkdown + remarkGfm` and NO
  `rehype-raw`, so embedded HTML is shown as escaped text.
- **Decision:** convert the 1 outlier's content to **Markdown** (the format 38/39 posts
  already use) rather than add `rehype-raw` globally — no XSS surface, no behaviour change
  for the other 38, formatting-only (no content rewriting). `<h2>`→`##`, `<p>`→paragraph,
  `<em>`→`*…*`.
- **Verify:** the post now has 10 `##` headings, zero raw tags; the blog-integrity Phase-3
  test asserts ≥3 real `<h2>` DOM elements and that the rendered text contains no literal
  `<h2>`/`<p>`.

## PHASE 4 — "Life Path" → "Birth Day Number" on day-derived pages

The `/birthday/{m}/{d}` and `/birthday` pages derive a number from the **day of the month
only** (`calculateLifePath(day)` in `birthdayPersonality.ts`) but labelled it "Life Path",
contradicting the paid Blueprint (whose Life Path uses the **full birth date**). Renamed
every day-derived label to **"Birth Day Number"** and added the clarifying line + Blueprint
CTA. Genuine full-date Life Path usages were read in context and **left untouched**.

### Occurrence audit
| Location | Number source | Action |
|---|---|---|
| `src/data/birthdayPersonality.ts` | day-only (`calculateLifePath(day)`) | **renamed** 92 → "Birth Day Number" |
| `src/pages/BirthdayDatePage.tsx` (`/birthday/{m}/{d}`) | day-only | **renamed** 8 + clarifying line |
| `src/pages/BirthdayHub.tsx` (`/birthday`) | day-only | **renamed** 10 |
| `numerologyData.ts`, `NumerologyPage`, `NumerologyNumber`, `numerologyLifePathData.ts`, `NumerologyLifePath.tsx` | full date (numerology feature) | left — genuine |
| `ReportView.tsx` | full date (`getLifePath` from `numerologyLifePathData`) | left — genuine |
| `BirthdayResults.tsx`, `CelebritySearch.tsx`, `ShareableCard.tsx`, `ZodiacAndFacts.tsx` | full date (YYYYMMDD, master numbers kept) | left — genuine |
| `TarotByBirthday.tsx`, `tarotData.ts` | full-date Life Path → tarot card | left — genuine |
| `BornOnDay.tsx` | genuine cross-ref ("your full Life Path … in the Blueprint") | left — correct (SEO-MAGNET-3) |
| `blogPosts.ts`, `pageFaqs.ts`, `FAQ.tsx`, `Methodology.tsx`, `answers/WhatIsMyLifePathNumber.tsx`, `EmailService.ts`, `AnswersIndex.tsx` | editorial/feature copy about the full-date Life Path | left — genuine |

Only `birthdayPersonality.ts`, `BirthdayDatePage.tsx` and `BirthdayHub.tsx` compute from
the day; every other "Life Path" in `src/` is genuinely full-date derived. Verified live
render: `/birthday/1/1` shows "Birth Day Number" ×13 and zero "Life Path {n}" mislabels
(1 genuine "full Life Path" cross-ref); `/birthday` shows "Birth Day Number" ×6, zero
mislabels.

---

## GATE
- **tsc:** app 0 errors (baseline 45 / 0 new).
- **build:** **1338 ok / 0 failed / 0 skipped** (browser recycled 304/600/904/1200).
- **test:prelaunch:** launch-gauntlet **135 passed** · prelaunch **105 passed**, 0 failed
  (+ new `blog-integrity.spec.ts`: 6 posts content-level + control, fallback-detection
  guard, Phase-3 real-`<h2>`; strengthened `growth-pages` not-found-shell check).
- **frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`,
  `api/verify-payment.ts` — no diff. ✔
- **invoice_counters (unchanged):**
  ```
  BC/26-27  next_value 1002
  BN/26-27  next_value 1001
  BX/26-27  next_value 1001
  ```
- **deploy:** one `wrangler deploy` — Worker + assets uploaded, `bornclock` deployed
  (trailing `schedules` error is the known non-fatal cron token-scope issue).
- **live-verified article titles** (headless-Chrome hydration, all 6 `Article Not Found`=false):
  ```
  Best Month to Be Born? The Data | BornClock
  Biorhythm Workouts: An Honest Guide | BornClock
  Born on a National Holiday | BornClock
  Cycle Syncing for Men | BornClock
  How We Rank Celebrity Birthdays | BornClock
  The 7-Day Energy Forecast Explained | BornClock
  ```
  Also live: `birthday-traditions` post renders 12 real `<h2>`; `/birthday/7/15/` shows
  "Birth Day Number" ×12 with 0 "Life Path {n}" mislabels.
- **IndexNow:** re-pinged the 6 URLs post-deploy — IndexNow HTTP 200, Yandex 202. ✔

## Founder spot-check list
1. Open each of the 6 article URLs (below) — real article, not "Article Not Found".
2. `/blog/birthday-traditions-around-the-world-unique-celebrations/` — headings render as
   real headings, no literal `<h2>` text.
3. `/birthday/7/15/` and `/birthday/` — the day number reads "Birth Day Number", and the
   line clarifying that the full Life Path is in the Blueprint.
4. `/blog/this-does-not-exist-xyz` — shows the not-found state (proves fallback handling).
