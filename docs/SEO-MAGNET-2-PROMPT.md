# SEO Magnet Batch 2 — OG Cards, Internal Mesh, Six Articles
# Save as docs/SEO-MAGNET-2-PROMPT.md, then: "Read docs/SEO-MAGNET-2-PROMPT.md and execute"
# These are Phases 3, 4, 7 deferred from docs/SEO-MAGNET-REPORT.md — read that
# report first for context and any groundwork already laid (sharp is available).

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/SEO-MAGNET-2-REPORT.md.

CONTEXT: LIVE site, paying customers. Frozen files untouched (api/_crypto.ts,
api/razorpay-webhook.ts, api/verify-payment.ts). DDL → NOTES-*.sql. tsc 45
baseline 0 new. Finish or skip cleanly. ONE deploy at the end.

## PHASE A — PER-PAGE-TYPE OG SHARE CARDS (was Phase 3)
Build-time static generation with sharp into dist/og/ (and public/og/ so the
worker serves them): one branded template per page type using the design tokens
(ink #0C1A2B, navy #103A5C, gold #B8862F) + logo + tagline.
Templates: born-on date ("Born on January 1" + birthstone colour accent),
month hub, zodiac sign, fitness/rhythm page, blog post (title on card),
plus a refreshed default. 1200x630, WebP or JPEG ≤60KB each, ~420 images total.
Wire og:image + twitter:image per page through the prerender path (absolute
https://bornclock.com/og/... URLs). Keep build-time impact sane (parallelise;
report added build seconds). Evidence: 5 sample image URLs in the report.

## PHASE B — INTERNAL LINKING MESH (was Phase 4)
Consistent crawlable link blocks, driven by data not hand-edits:
- date pages → their month hub + zodiac sign for that date + the energy/rhythm
  fitness link
- month hubs → 2 relevant blog posts (tag-driven)
- fitness pages → relevant blog posts + /birthday-report (cross-links exist)
- blog posts → a "Tools mentioned" block from post tags → hub/tool pages
- zodiac hubs → the month hubs their date-range spans
Rule: every page within 2 clicks of a money page (/birthday-report, /upgrade,
/life-expectancy). Report the mesh as an adjacency table. No layout redesign —
match existing footer/section styles.

## PHASE C — SIX BLOG ARTICLES (was Phase 7)
Read 3 existing posts first for voice/structure/length; honesty framing
mandatory on rhythm/health content; answer-first paragraph + FAQPage schema +
Phase-B mesh links on each; added to blog index, sitemap, prerender.
1. "Best Month to Be Born? What the Data Actually Says" → links all 12 month hubs
2. "Biorhythm Workouts: An Honest Guide to Training by Your Cycles"
3. "Born on a National Holiday: What Your Birthday Shares With History"
4. "Cycle Syncing for Men: The Gender-Neutral Version"
5. "How We Rank 28,000 Celebrity Birthdays (And Why Sitelinks Beat Fame Lists)"
   — data/transparency story, doubles as digital-PR material
6. "The 7-Day Energy Forecast: Using Rhythm Awareness Without the Pseudoscience"
Publish live (founder reviews after deploy — flag all 6 URLs at the top of the
report for his read-through).

## GATE
tsc 45/0 new · build 1337 ok 0 failed (1331 + 6 posts; retry /todays-birthdays
once if it flakes) · test:prelaunch green (extend: og:image present + resolving
on one page per type; mesh block renders on one page per type) · frozen files
untouched · invoice_counters untouched (paste) · ONE deploy · sentinel OK ·
run the IndexNow ping script post-deploy for the 6 new URLs.

## REPORT
The 6 article URLs first (founder editorial pass) · 5 OG samples · mesh
adjacency table · build-time delta from image generation · anything deferred.
