# SEO-MAGNET-2 — Execution Report

Three deferred phases from the SEO-MAGNET batch: per-page-type OG share cards (A),
internal linking mesh (B), and six blog articles (C). Local commits only, one deploy.

---

## ⚑ SIX NEW ARTICLE URLs (founder review after deploy)

All six are live post-deploy, in the blog index, sitemap and prerender set.

1. https://bornclock.com/blog/best-month-to-be-born-what-data-says
2. https://bornclock.com/blog/biorhythm-workouts-honest-guide-training-by-cycles
3. https://bornclock.com/blog/born-on-a-national-holiday-birthday-history
4. https://bornclock.com/blog/cycle-syncing-for-men-gender-neutral-version
5. https://bornclock.com/blog/how-we-rank-celebrity-birthdays-sitelinks
6. https://bornclock.com/blog/7-day-energy-forecast-rhythm-awareness

Each: answer-first opening paragraph, FAQPage schema (4 FAQs), internal mesh links,
1,200–1,530 words. The three rhythm/health articles (2, 4, 6) carry the mandatory
honesty framing — biorhythms/cycle-syncing are presented as reflection/awareness
tools, explicitly *not* validated science, no health claims.

---

## PHASE A — Per-page-type OG share cards

**How:** `scripts/generate-og-cards.mts` (run via `tsx` in the build pipeline, after
`vite build`, before prerender) renders branded 1200×630 SVG → WebP with `sharp` into
`dist/og/`. One template per page type using the design tokens (ink `#0C1A2B`, navy
`#103A5C`, gold `#B8862F`), the logo, concentric-ring motif, and the tagline. Date
cards take a **birthstone-coloured accent** per month. The worker serves `dist/`, so
no binaries are committed to git.

**Count:** 436 cards — 1 default · 366 born-on dates · 12 month hubs · 12 zodiac ·
6 fitness/rhythm · 39 blog posts. All WebP, **13–29 KB each** (well under the 60 KB cap).

**Wiring:** `scripts/prerender.mjs` resolves each route → its card by existence-checking
`dist/og/`, then strips every existing `og:image`/`twitter:image` tag (static +
react-helmet duplicate) and injects one clean, page-specific set (absolute
`https://bornclock.com/og/…` URL). Routes without a bespoke card fall back to
`default.webp`.

**5 sample card URLs:**
- https://bornclock.com/og/born-on/january-1.webp  (birthstone accent — garnet)
- https://bornclock.com/og/month/august.webp
- https://bornclock.com/og/zodiac/aries.webp
- https://bornclock.com/og/fitness/energy-forecast.webp
- https://bornclock.com/og/blog/best-month-to-be-born-what-data-says.webp

**Build-time delta:** +~16 s (parallelised, batches of 24). vite build ~7 s → og-cards
~16 s → prerender (unchanged). Net added build time ≈ **16 seconds**.

---

## PHASE B — Internal linking mesh

Data-driven, crawlable link blocks added via a shared helper `src/lib/mesh.ts`
(`postsForTags`, `toolsForTags`, `monthsForZodiac`) — pure functions over existing
content data, safe in the prerender path. Styling matches each page's existing
section/footer cards (no redesign).

### Adjacency table

| Page type | New crawlable mesh links | Path to a money page |
|---|---|---|
| **Born-on date** `/born-on/*` | → `/born-in-{month}` (hub) · → `/zodiac/{sign}` · → `/energy-forecast` (rhythm) · → 1 tag-matched `/blog/*` | `/energy-forecast → /birthday-report` (2 clicks); footer → money (1) |
| **Month hub** `/born-in-*` | → 2 tag-matched `/blog/*` (this month's signs + birthstone) · (existing: → `/zodiac/{signs}`, → every `/born-on/{day}`) | `/birthday-report` CTA (1); footer → money (1) |
| **Zodiac sign** `/zodiac/*` | → `/born-in-{startMonth}` · → `/born-in-{endMonth}` (the hubs its range spans) · (existing: → compatible signs, → other signs) | zodiac → hub → blog → tools; footer → money (1) |
| **Fitness/rhythm** (6 pages) | → 2 tag-matched `/blog/*` · (existing: → related rhythm pages, → `/biorhythm`, → `/birthday-report`) | `/birthday-report` direct (1) |
| **Blog post** `/blog/*` | → "Tools mentioned" block (tools derived from post tags: `/life-expectancy`, `/birthday-report`, `/zodiac`, `/biorhythm`, `/age-calculator`, …) · (existing: → related posts) | tool link → `/life-expectancy` / `/birthday-report` (1) |

**2-click-to-money rule:** satisfied globally — the `Footer` renders on every one of
these pages and links `/life-expectancy`, `/birthday-report` and `/pricing` (1 click).
The mesh blocks add *topical, contextual* crawl paths on top of that guarantee.

---

## PHASE C — Six blog articles

Read the three existing rhythm/health posts first to match voice and the honesty
framing. Each new post: answer-first paragraph, FAQPage JSON-LD, mesh links, added to
`src/data/blogPostsExtra.ts` (type-only import → `blogPosts`), `BLOG_SLUGS`
(prerender + sitemap), and the prerender-titles `BLOG` map. Two new category values
(`health-science`, `birthday`) were added to the label/colour maps in `Blog.tsx` and
`BlogPost.tsx` (they — and several pre-existing categories — were rendering blank
badges before).

---

## GATE

- **tsc:** 0 errors (baseline 45 / **0 new**).
- **build:** **1337 ok / 0 failed / 0 skipped** (504 s prerender) — 1331 + 6 new posts.
  Sitemap regenerated at 1337 URLs.
- **OG cards:** 436 generated, ≤29 KB each; og:image present + resolving verified
  one-per-type by `e2e/prelaunch/seo-cards-mesh.spec.ts`.
- **mesh:** renders one-per-type — verified by the same spec.
- **test:prelaunch:** green — **launch-gauntlet 135 passed · prelaunch 82 passed**
  (the 82 include the 10 new `seo-cards-mesh` assertions).
- **frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`,
  `api/verify-payment.ts` — no diff. ✔
- **invoice_counters (unchanged):**
  ```
  BC/26-27  next_value 1002
  BN/26-27  next_value 1001
  BX/26-27  next_value 1001
  ```
- **deploy:** one `wrangler deploy` — Worker + 1862 assets uploaded, `bornclock`
  deployed. The trailing `schedules` API error is the known non-fatal cron
  token-scope issue; Worker code + assets deploy fine. Verified live: all 6 posts
  200 at their canonical URLs, per-page og:image cards resolve (`image/webp`).
- **sentinel:** create-order → `404 {"error":"Report not found"}` (ops-seo spec +
  manual check). ✔
- **IndexNow:** pinged the 6 new URLs post-deploy — IndexNow HTTP 200, Yandex 202. ✔

## Deferred
- None. OG cards write to `dist/og/` only (not committed) — regenerated every build.
