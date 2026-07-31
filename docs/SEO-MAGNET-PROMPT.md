# SEO Magnet Batch — Subscribe Fix, Performance, Share Cards, Mesh, GEO, Blog
# Save as docs/SEO-MAGNET-PROMPT.md, then: "Read docs/SEO-MAGNET-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/SEO-MAGNET-REPORT.md.

CONTEXT: BornClock is LIVE with paying customers. Frozen files untouched
(api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts). DDL → NOTES-*.sql.
tsc 45 baseline 0 new. Phases ordered by value; finish or skip cleanly, never half.
ONE deploy at the end.

## PHASE 1 — FIX: /blog SUBSCRIBE BUTTON DOES NOTHING (founder-reproduced bug)
Entering an email and clicking subscribe on /blog produces no action, no response,
no error. Diagnose properly: read the blog subscribe component + api/subscribe.ts
(built in product-polish; email_subscribers table IS applied in the DB). Find
whether the button handler is unwired, the fetch fails silently, CORS/route
mismatch, or the response is swallowed. Fix so that: valid email → success state
("You're subscribed") + row in email_subscribers (verify via the PostgREST
service-role pattern); duplicate email → idempotent friendly success; invalid
email → inline validation message; network failure → visible error, no dead
button. Add tests to the prelaunch suite: positive, duplicate, invalid, and the
DB row assertion. Check whether the /results soft-capture uses the same component
and inherits the same bug — if yes fix both, report both.

## PHASE 2 — PERFORMANCE: SPLIT THE 4.35MB BUNDLE (biggest CWV lever)
dist/assets/index-*.js is 4,350 kB — every one of 1,331 pages pays it. Add
build.rollupOptions.output.manualChunks in vite.config: separate vendor chunks
(react/router, recharts/charts, supabase, UI kit) and route-level dynamic imports
for the heaviest non-critical pages (Admin, report view internals, invoice
generator is already lazy). Resolve the existing dynamic/static double-import
warning for BirthdayReportService. Target: initial JS < 1.5MB (report the exact
before/after per chunk). DO NOT change behaviour — pure splitting. Full build +
prelaunch suite must stay green; spot-check 5 page types render (home, date page,
month hub, fitness page, report view). This phase has the highest regression
surface — if the suite shows breakage you cannot fix cleanly in 2 iterations,
REVERT the phase entirely and report it as deferred with findings.

## PHASE 3 — PER-PAGE-TYPE OG SHARE CARDS
Today every page shares one generic og/default.png. Generate static branded OG
images at build time (script, not runtime): one template per page type — born-on
date ("Born on January 1" + birthstone colourway), month hubs, zodiac signs,
fitness pages, blog posts (title on brand card). Use the design tokens
(ink/navy/gold) and the logo. Wire og:image + twitter:image per page in the
prerender path. ~400+ images: generate into dist/og/ via a node canvas/sharp
script during build; keep total added weight reasonable (JPEG/WebP ~<60KB each).
Report the template set + 3 sample URLs to eyeball.

## PHASE 4 — INTERNAL LINKING MESH
The clusters are islands. Add consistent, crawlable link blocks: date pages →
their month hub + zodiac sign + "rhythm for this date" fitness link; month hubs →
all their dates (exists) + zodiac spans (exists) + 2 relevant blog posts; fitness
pages → each other (exists) + relevant blog posts + /birthday-report; blog posts →
the relevant hub/tool pages (add a "Tools mentioned" block driven by tags, not
hand-edited); zodiac hubs → their date ranges' month hubs. Every page ends within
2 clicks of a money page (/birthday-report, /upgrade, /life-expectancy). Report
the mesh as a small adjacency table.

## PHASE 5 — SCHEMA + TITLE AUDIT ON LEGACY TOOL PAGES
The prerender warns of "generic" titles on /age-calculator, /life-expectancy and
~25 blog posts (they have titles; the warn heuristic may be matching the base
title — investigate and either fix real gaps or fix the heuristic, say which).
Bring legacy tool pages to the new standard: answer-first opening paragraph,
FAQPage JSON-LD (real questions), WebApplication schema on calculators,
BreadcrumbList. No schema spam — only types that genuinely apply.

## PHASE 6 — GEO PLUMBING
- /llms.txt describing the site, key tools, data provenance (28K celebrities via
  Wikidata, honesty policy on biorhythm) — model on usdvisionai.com's if readable,
  else standard llms.txt conventions.
- Verify robots.txt allows AI crawlers we want (GPTBot, ClaudeBot, PerplexityBot)
  — deliberate choice, report current state and what you set.
- IndexNow: generate a key file + a small post-deploy ping script (Bing/Yandex);
  document how the founder submits to Bing Webmaster (manual step — cannot be
  done from here).

## PHASE 7 — SIX BLOG ARTICLES SERVING THE NEW CLUSTERS
Follow the established content standards (read 3 existing posts first for voice,
structure, length; honesty framing mandatory on anything rhythm/health):
1. "Best Month to Be Born? What Data Actually Says" → links all 12 month hubs
2. "Biorhythm Workouts: An Honest Guide to Training by Your Cycles" → fitness anchor
3. "Born on a National Holiday: What Your Birthday Shares With History" → date pages
4. "Cycle Syncing for Men: The Gender-Neutral Version" → fitness page 3
5. "How We Rank 28,000 Celebrity Birthdays (And Why Sitelinks Beat Fame Lists)" →
   transparency/data story — this one doubles as digital-PR material
6. "The 7-Day Energy Forecast: Using Rhythm Awareness Without the Pseudoscience" →
   energy-forecast page + digest
Each: answer-first paragraph, FAQ schema, mesh links per Phase 4, added to the
blog index + sitemap + prerender. Founder reviews live after deploy (two-stage
workflow: these publish as normal posts; flag them at the top of the report for
his morning read-through).

## GATE
tsc 45/0 new · build 1331+6 blog = 1337+ ok, 0 failed (retry /todays-birthdays
once if it flakes) · test:prelaunch green incl. new Phase-1 tests · frozen files
untouched · invoice_counters untouched (paste) · bundle before/after table ·
ONE deploy · live sentinel OK.

## REPORT
Findings first (the subscribe root cause; the title-warn verdict) · bundle table ·
OG samples · mesh adjacency · article URLs for founder review · manual steps
(Bing Webmaster submit; and the standing two: Vercel deletion + GSC sitemap).
