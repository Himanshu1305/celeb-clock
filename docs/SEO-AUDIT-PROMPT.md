# Full-Site SEO/AEO/GEO Audit + Mechanical Fixes
# Save as docs/SEO-AUDIT-PROMPT.md → "Read docs/SEO-AUDIT-PROMPT.md and execute"
# RUN ONLY AFTER BATCH-7B COMPLETES (the audit must cover the final ~1419-page set).

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/SEO-AUDIT-REPORT.md + docs/SEO-AUDIT-FINDINGS.csv.

GROUND RULES: frozen files never touched (api/_crypto.ts, api/razorpay-webhook.ts,
api/verify-payment.ts). tsc 45 baseline 0 new. Fix-loop policy binding (classify /
fix product bugs / re-run / never weaken). ONE deploy at the end IF fixes were made.

PURPOSE: every page must be able to be discovered, crawled, indexed and served
cleanly by Google — and cited by AI engines. The audit is MECHANIZED (scripted
over the built output), not sampled vibes. GSC's real failure classes drive it:
sitemaps containing redirected/404/non-canonical URLs, duplicate-without-canonical,
Google-chose-different-canonical, orphan pages, thin/overlapping content, and
invalid structured data.

---

## PHASE A — BUILD THE AUDIT SCRIPT (scripts/seo-audit.mjs) AND RUN IT

Run a FULL production build first so dist/ reflects the complete route set.
Then iterate EVERY dist/**/index.html and extract: URL (from path), <title>,
meta description, canonical href, count of <h1>, all JSON-LD blocks, og:image /
twitter:image URLs, og:title, all internal <a href> targets, robots meta,
word count of main content.

Emit docs/SEO-AUDIT-FINDINGS.csv (one row per page per issue) checking:

TECHNICAL
 T1  canonical missing, empty, or ≠ the page's own URL (self-referencing rule);
     canonical pointing at the homepage on any non-home page is SEVERITY-1
 T2  duplicate <title> across pages (exact); title <30 or >65 chars
 T3  meta description missing, duplicate across pages, <70 or >165 chars
 T4  h1 count ≠ 1
 T5  robots meta accidentally noindexing anything in the sitemap
 T6  trailing-slash consistency: pick the canonical form and flag mixed usage
 T7  brand suffix appears ≠ 1 time in the title (the past doubled-title bug class)

STRUCTURED DATA
 S1  any JSON-LD block that fails JSON.parse
 S2  FAQPage blocks with <2 questions, or duplicate identical FAQ sets across
     many pages (thin-schema signal)
 S3  BreadcrumbList item URLs that 404 against the route set
 S4  pages that plausibly warrant schema but have none (money pages, hubs) — list

LINK GRAPH
 L1  internal links pointing at URLs NOT in the route set (broken)
 L2  internal links pointing at known REDIRECT sources (e.g. the old rising-sign
     URL, reverse-order compatibility URLs, old compat scheme) — links must point
     at final targets, never through redirects; Google treats your internal links
     as the stronger canonical signal
 L3  ORPHANS: pages with in-degree 0 in the internal link graph (sitemap-only
     discovery = low crawl priority). Every page needs ≥1 contextual internal link
 L4  pages >3 clicks from the homepage (BFS depth over the link graph)

SITEMAP HYGIENE (GSC's most-cited sitemap sins)
 M1  sitemap URLs not present in dist/ (ghost entries)
 M2  dist/ pages missing from the sitemap
 M3  sitemap URLs that are redirect SOURCES (must be removed — sitemaps list
     final canonical URLs only)
 M4  sitemap URL form vs canonical form mismatch (trailing slash, https, www)

ASSETS / SOCIAL
 A1  og:image URL that doesn't resolve to a real file in dist/ (or the live og
     route for report cards)
 A2  og:title/description missing on any page type

CONTENT SIGNALS
 C1  pages with <150 words of unique main content (thin — list, don't auto-fix)
 C2  pages whose first 200 chars are byte-identical to another page's
     (template-dominance signal for Crawled-not-indexed risk)

## PHASE B — MECHANICAL FIXES (fix-loop applies)

Fix everything mechanical the audit surfaces: canonicals, duplicate/missing
metas (generate page-specific ones from page data, not boilerplate), h1
structure, sitemap cleanup (remove redirect sources + ghosts, add missing),
internal links re-pointed to final targets, orphans linked via the existing mesh
system (data-driven, not hand edits), schema parse errors, og gaps.
DO NOT auto-rewrite content for C1/C2 — report those as findings with a
recommendation each (they need editorial judgment).
Re-run the audit script after fixes; the report shows BEFORE and AFTER counts
per check.

## PHASE C — AEO/GEO SPOT AUDIT (judgment layer, sampled)

For one page per template type (date page, month hub, zodiac, compat pair,
fitness, blog, money pages /gift /coach /birthday-report, tools): verify the
answer-first paragraph exists and follows the 40-60-word direct-answer pattern
with the honest hedge; FAQ questions are real queries not filler; data
provenance stated where applicable; llms.txt still accurately describes the
site including the newest sections. Fix gaps on the TEMPLATE level where
mechanical; report editorial gaps.

## PHASE D — LIVE VERIFICATION (production, post-deploy)

Sample 25 URLs across all types on https://bornclock.com: expect 200, correct
self-canonical, single title, og:image resolving. Include the known redirect
URLs: expect 301 to the right target and the TARGET in the sitemap, source not.
Paste the table.

## GATE
tsc 45/0 · full build 0 failed · test:prelaunch green · frozen untouched ·
invoice_counters unchanged (paste) · before/after audit counts · ONE deploy if
fixes made · sentinel OK.

## REPORT — docs/SEO-AUDIT-REPORT.md
1. Scorecard: total pages audited, issues found/fixed/remaining per check ID
2. SEVERITY-1 items first (anything that would generate a GSC error state)
3. The C1/C2 editorial list with per-page recommendations (founder decides)
4. The orphan/depth findings and how the mesh resolved them
5. What GSC should now show over the next 2-4 weeks, and which GSC reports the
   founder should watch (Page indexing "Why pages aren't indexed" table;
   Enhancements per schema type)
