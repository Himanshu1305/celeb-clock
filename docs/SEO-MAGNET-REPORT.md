# SEO Magnet Batch — Report

Execution of `docs/SEO-MAGNET-PROMPT.md`. Local commits only, not pushed. One deploy.
Frozen files untouched (`api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts`).

## FINDINGS FIRST

### Phase 1 — the /blog subscribe root cause (TWO bugs)
1. **The Blog form was completely inert.** `src/pages/Blog.tsx` rendered
   `<Input … /><Button>Subscribe</Button>` with **no `value`/`onChange` and no
   `onClick`** — clicking did literally nothing. (`/results` uses a *different*,
   correctly-wired component, `SaveResultsCapture`, so they don't share code — only Blog
   was inert.)
2. **A deeper, silent bug in `api/subscribe.ts`: nothing was ever stored.** The handler
   did `.upsert({…}, { onConflict: 'email' })`, but the table's unique index is on
   **`lower(email)` — an expression index** — which PostgREST's `onConflict` cannot target.
   Every call failed with *"no unique or exclusion constraint matching the ON CONFLICT
   specification"* and returned `{ok:false}`. So **both** the (now-wired) blog form **and
   the existing `/results` capture** were silently failing to persist. Fixed with an
   explicit **check-then-write** (idempotent by `ilike(email)`; 23505 race → success).
   Verified: valid email → `{ok:true}` **and a real row** in `email_subscribers`.
   - New `src/components/BlogNewsletter.tsx`: valid → "You're subscribed"; duplicate →
     same friendly success; invalid → inline validation; network failure → visible error.
   - Tests (`e2e/prelaunch/subscribe.spec.ts`, 6): positive **+ DB-row assertion**,
     duplicate (idempotent, exactly 1 row), invalid → 400, missing-consent → 400, blog UI
     success, blog UI inline-validation. Uses the `.invalid` test domain (no real email);
     rows cleaned up in afterAll.

### Phase 5 — the title-warn verdict
The prerender's "title may be missing or generic" heuristic was
`!title.includes('BornClock')` — a **brand-presence check mislabelled as generic-ness**,
a **false positive**. The 29 flagged routes (`/age-calculator` →
"Best Age Calculator Online — Exact Age in Seconds (Free)", `/life-expectancy`, and ~27
blog posts) all have **strong, unique, keyword-led titles** that deliberately omit the
brand word to stay within the ~60-char limit. **Verdict: heuristic bug, not a title gap.**
Fixed the heuristic to warn only on a *genuinely* generic title (empty, < 12 chars, or
equal to the site's default/home title). Legacy tool pages already had `<SEO>` (auto
BreadcrumbList) + `WebApplicationSchema`; **added FAQPage** (`FAQSchema`, real questions) to
`/age-calculator` and `/life-expectancy` to bring them fully to the new standard.

## Phase 2 — bundle split (before / after)

Pure splitting — no behaviour change. Fixed the `BirthdayReportService`
dynamic/static double-import (ReportView now uses the static `getReport`). Added vendor
`manualChunks` (react-vendor / charts / supabase / ui) and lazy-loaded **every route
except the home page** (`React.lazy` + `<Suspense>`).

| Chunk | Before | After |
|-------|-------:|------:|
| **main `index-*.js`** | **4,250 KB** | **283 KB** |
| charts (recharts, lazy) | (in main) | 374 KB |
| blogPosts (lazy, Blog only) | (in main) | 347 KB |
| ReportView (lazy) | (in main) | 337 KB |
| LifeExpectancy (lazy) | (in main) | 332 KB |
| supabase (vendor) | (in main) | 209 KB |
| html2canvas (lazy, report export) | (in main) | 198 KB |
| react-vendor | (in main) | 182 KB |
| ui (radix + lucide) | (in main) | 167 KB |

**Home initial JS ≈ index(283) + react-vendor(182) + supabase(209) + ui(167) ≈ 841 KB raw
(~250 KB gzip)** — down from a single 4,250 KB chunk. Under the 1.5 MB target. Charts,
blogPosts, report internals, and every heavy page now load only on their own route.
Spot-checked 6 page types render with 0 page errors (home, date page, month hub, fitness
page, blog, life-expectancy).

## Phase 6 — GEO plumbing

- **robots.txt:** already opts AI crawlers in — GPTBot, ClaudeBot, Claude-Web,
  PerplexityBot, Google-Extended, Bingbot all `Allow: /`; private paths (`/report/`,
  `/admin`, `/profile`, `/api/`) disallowed; sitemap declared. **No change needed** — verified
  and reported as the deliberate current state.
- **llms.txt:** already comprehensive; **updated** to add the 12 "Born in {Month}" hubs and a
  new **"Rhythm and Fitness (rhythm-awareness, NOT medical advice)"** section listing the 6
  fitness pages with the biorhythm honesty policy stated inline.
- **IndexNow:** generated key file `public/45894fcfd9f370d9927aaa9bfdf01d65.txt` (served at
  `https://bornclock.com/45894fcfd9f370d9927aaa9bfdf01d65.txt` after deploy) + a
  post-deploy ping script `scripts/indexnow-ping.mjs` (Bing + Yandex; core pages by default,
  `--all` for the full sitemap). Run after deploy.

## GATE

- tsc — 0 errors (0 new).
- build — _see below (1331; Phase 7's +6 blog posts deferred, so 1331 not 1337)._
- test:prelaunch (+ 6 new subscribe tests) — _see below._
- Frozen files untouched — empty diff. ✓
- **invoice_counters untouched** — `BC/26-27=1002, BN/26-27=1001, BX/26-27=1001` (no DB
  writes touch it; subscribe test rows cleaned up). ✓
- Live sentinel — _see below._ · One deploy — _see below._

## Phases DEFERRED (finish-or-skip-cleanly; stated plainly)

Delivered the highest-value, lowest-regression phases first: **1 (the founder-reproduced
subscribe bug), 2 (the biggest CWV lever), 5 (title verdict + calculator schema), 6 (GEO)**.
Deferred cleanly, nothing half-shipped:

- **Phase 3 — per-page-type OG share cards.** `sharp` 0.34.5 **is** available, so this is
  feasible; deferred as a large asset-generation task (~400+ images + per-page-type templates
  + prerender wiring) that warrants its own focused run.
- **Phase 4 — internal linking mesh.** Deferred — a medium cross-cutting change across
  BornOnDay / MonthHub / FitnessRhythmPage / BlogPost.
- **Phase 7 — six blog articles.** Deferred — large content generation (6 long-form posts to
  the established voice/standards).

Recommend running these as a follow-up batch (3 → 4 → 7) on a fresh session.

## Manual steps for founder
- **Bing Webmaster Tools:** add/verify bornclock.com, then submit `https://bornclock.com/sitemap.xml`
  once. IndexNow pings (via `scripts/indexnow-ping.mjs`) keep Bing/Yandex fresh thereafter.
- **Standing two:** delete the old Vercel project; (re)submit the sitemap in Google Search Console.

## Article URLs for founder review
None this batch — Phase 7 (the six articles) was deferred.
