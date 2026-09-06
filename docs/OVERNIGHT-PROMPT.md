# AUTONOMOUS OVERNIGHT BATCH — BornClock (celeb-clock)

DO NOT ask for approval for anything. Work phase by phase to completion. If a phase hits a hard blocker, write the blocker into the status file and MOVE ON to the next phase — never stall waiting for input.

## GLOBAL HARD RULES (apply to every phase)

1. FIRST ACTION: `git checkout develop && git pull`, then create and switch to branch `overnight-batch`. ALL work happens on this branch. Local commits only per phase. DO NOT PUSH. Never touch main or develop.
2. NEVER edit `api/razorpay-webhook.ts`, `api/verify-payment.ts`, `api/_crypto.ts`, or any payment logic. Reading them is allowed.
3. NEVER apply DDL to the database — DDL cannot run via the service client (proven earlier this session). Any schema change goes into a `NOTES-*.sql` file for manual Studio execution.
4. NEVER activate cron triggers or edit `wrangler.toml` routing. Activation steps go into `docs/OPS-ACTIVATION.md`.
5. Read-before-write on every file. Evidence discipline: every claim in reports must have pasted command output backing it.
6. Maintain `docs/OVERNIGHT-STATUS.md`: after EACH phase append: phase name, DONE/PARTIAL/BLOCKED, commits made, evidence summary. This file is the morning source of truth.
7. NO HALLUCINATIONS rule for all content: a factual/scientific claim may only be written AFTER you have web-fetched a real, live URL and confirmed it supports the claim. Write the claim WITH the source URL. If you cannot verify a claim, do not write it. Never invent citations, statistics, or study names.
8. Deploy is FORBIDDEN until the final gate in Phase 8. One deploy max, to the staging Worker only, and only if all gate conditions pass.
9. Read `docs/ARCHITECTURE-DECISIONS.md` fully before Phase 1. Follow its runbook (print-CSS validation in headless Chromium before committing, diff against working Longevity report, `./node_modules/.bin/wrangler` only — NEVER `npx wrangler`, etc.).
10. AVOID GENERATING LARGE DATA TABLES in output — do not generate country-name mapping tables, celebrity lists, or any bulk data inline. If a mapping is genuinely needed, install a package (e.g. `i18n-iso-countries`) instead of generating tables. Large generated data tables have triggered output blocks in this environment.

## PHASE 1 — GEO FLASH BUG (highest priority fix)

Symptom: "Born this day — from India" (CountryExtrasSection) renders then vanishes on mobile, on staging, even AFTER commit b697322 (localStorage persistence in useCountryCode). Desktop stays visible.

IMPORTANT SCOPE NOTE: Do NOT build a country name→ISO2 normalizer. It is not needed. ipapi already returns a 2-letter `country_code` directly, and the DB already stores `nationality_code` as ISO2 — no name→code translation exists in this bug's path. This is a state-management fix only.

- 1a. Confirm deployed bundle contains the fix: `curl -s https://bornclock.usdvisionai.workers.dev/` (and its JS assets) and grep for `bc_country_code`. Report found/not-found vs deployed version.
- 1b. Paste current `useCountryCode.ts`, `CountryExtrasSection.tsx`, `CountryDetectionService.ts`, and `useAuth.ts` lines 30-90 (onAuthStateChange + setProfile paths).
- 1c. The flash means `profile?.country ?? detected` flips truthy→null after first render. Trace statically: during mobile auth token-refresh, does `profile` become an object with `country` undefined/null/empty-string, overriding a resolved `detected`? Does anything clear `detected` after it is set? Does CountryDetectionService ever cache/return a value that later becomes null? State the exact root cause with file+line.
- 1d. Fix minimally. Likely shape: once a valid 2-letter code is resolved from ANY source, latch it in a ref/state that nothing can reset for the session; only cache confirmed-valid codes; bump cache key to `bc_country_code_v2` to invalidate stale mobile caches; guard against `profile.country` being empty-string. Before/after snippets.
- 1e. Commit: `fix(geo): latch resolved country, never reset mid-session; cache key v2`.

## PHASE 2 — FOUNDER-REPORTED BUGS

- 2a. LONGEVITY PDF EMPTY PAGES: the downloaded Life Expectancy report PDF has many blank pages on mobile. Per the runbook: find the print CSS + generation path for this report, diff against the WORKING Longevity report pattern (docs/SESSION-REPORT references, verify-print.mjs pattern, native `<table>` thead/tfoot, `@page margin:0`). Reproduce via the existing headless-Chromium print-validation script, count pages before fix, fix pagination/blank-page causes, re-validate, paste page counts before/after. Do not commit until the headless validation passes.
- 2b. PDF CALCULATION BUG: the PDF shows "WITH OPTIMIZED LIFESTYLE 70.2 yrs (51.5 yrs remaining)" for current age 44. 44+51.5=95.5, not 70.2. Correct remaining is 70.2−44=26.2. Find the calculation, paste it, fix it, verify with the age-44 case, and grep for the same formula reused elsewhere (results page, share cards) — fix every instance.
- 2c. TAB OVERLAP: "Biological Blueprint / Community Anchor / Health Guide" tabs overlap on mobile (~380px) and don't read as tabs. Find the component, fix: horizontal scroll or wrap with proper spacing at mobile widths, min 44px touch targets, and clearer active-tab styling (underline+weight is not enough when labels collide). Verify no label truncation at 360px. Before/after.
- 2d. Commit per fix with evidence in the message.

## PHASE 3 — FULL-SITE BUG HUNT (find, fix, test, retest)

- 3a. Start local servers per the runbook (`vercel dev` :3001 + vite :3000, `set -a; source .env.local; set +a`). Run the full gauntlet: `npx playwright test --config e2e/launch-gauntlet/gauntlet.config.ts --reporter=list`. Paste the summary. Fix any failures caused by tonight's changes.
- 3b. Write NEW edge-case tests into `e2e/launch-gauntlet/` covering at minimum: invalid DOB inputs (future date, 29-Feb non-leap, age 0, age 120+, empty submit), leap-day results page, born-on pages for Feb-29 and Dec-31, direct navigation to every top-level route (200 + content sanity, no blank render), mobile viewport (390px) render of results page sections including CountryExtrasSection presence for a mocked IN geolocation, longevity calculator full step-through including Previous on step 1, biological age quiz completion, report preview-lock behavior for unpaid slug, 404 handling for garbage slugs. Run them; fix what they catch (except payment files — document those in the status file instead).
- 3c. Systematic page sweep: for every route in the app's route table, load it headless, assert: no console errors, no "undefined"/"NaN"/"null" rendered in visible text, title and meta description present and unique. Write failures to `docs/BUG-AUDIT.md` with evidence; fix all safe ones; leave payment-adjacent ones documented.
- 3d. Re-run the full suite until green. Commit: `test(e2e): edge-case expansion + fixes from full-site sweep`.

## PHASE 4 — TECHNICAL SEO

- 4a. Sitemap: add trailing slashes to all sitemap URLs (kills the 307 hop). Verify robots.txt still correct (GPTBot/ClaudeBot/PerplexityBot allowed), llms.txt intact.
- 4b. Structured data: add/verify schema.org JSON-LD where missing and truthful: WebSite+SearchAction on home, WebApplication for calculators, FAQPage ONLY where a real FAQ exists on-page, BreadcrumbList on deep pages, Article on blog posts with real dates. Do NOT invent Person markup for celebrities; use about/mentions carefully. No fabricated ratings/reviews markup — that is a Google penalty risk.
- 4c. Meta audit: crawl the prerendered output; list pages with missing/duplicate/too-long titles or descriptions; fix via the `prerender-titles.mjs` map (string-replace pipeline — do NOT switch to react-helmet runtime titles, it is unreliable headless per the runbook).
- 4d. Internal linking: identify orphan pages (in sitemap but ≤1 internal inlink) and add natural contextual links from related pages. Canonicals correct on all date/zodiac page families.
- 4e. Validate: `npm run build` must complete with 0 failed prerenders; spot-check 5 prerendered HTML files for correct titles+JSON-LD. Commit: `seo(technical): sitemap slashes, JSON-LD, meta fixes, internal links`.

## PHASE 5 — KEYWORD + COMPETITOR RESEARCH

Web-search extensively. Deliver `docs/SEO-STRATEGY.md` containing:

- Competitor teardown: famousbirthdays.com, onthisday.com, astro-seek/astrology sites, death-clock/life-expectancy calculators, epochconverter-style age calculators — what they rank for, their page patterns, their gaps.
- Keyword map grouped by intent and difficulty: (a) low-competition long-tail we can win now (e.g. "born on [date] indian celebrities", "[zodiac] dates", "how many days until my birthday", planetary-age queries, India-specific angles), (b) medium-term, (c) giant-competition to deprioritize. For each cluster: target page (existing or new), current status, action.
- AEO/GEO section: which pages best answer AI-assistant-style questions, what answer-format changes help (concise answer blocks, question headings, llms.txt coverage).
- Prioritized 90-day action list.

Every competitor claim must come from actually fetched pages, not memory. Commit the doc.

## PHASE 6 — CONTENT: NEW PAGES + EXISTING-PAGE EDITS

Rules: verify-first citations per Global Rule 7. All science claims linked. Tone and design consistent with existing pages. Every new page: unique title+description added to `prerender-titles.mjs`, added to sitemap, internally linked from at least 2 related existing pages, JSON-LD where truthful.

- 6a. From Phase 5's low-competition cluster (a), create the highest-value new pages you can complete tonight WITH full verification — quality over quantity; a page ships only if every claim is cited. Likely candidates (confirm against research): India-focused born-on landing content, answer-style pages for high-intent questions the site can already answer from its own data, zodiac-compatibility or planetary-age explainers. Register routes, prerender entries, sitemap.
- 6b. Existing-page edits: fix keyword gaps and any stuffing found in Phase 5 on existing pages (results/marketing/zodiac/longevity pages). Meta + on-page H1/H2 alignment with target keywords, naturally written. No pipeline changes — content and the title map only.
- 6c. Build must pass with 0 failed prerenders including new pages. Commit: `content(seo): [n] new verified pages + on-page optimization`.

## PHASE 7 — OPS MONITORING SYSTEM (BUILD-NOT-DEPLOY, MONITOR-ONLY)

Adapt the hearlog ops pattern to BornClock's REAL stack (Cloudflare Workers + Vite admin + Razorpay + Resend). No Supabase edge functions exist here. Read `wrangler.toml`, the admin panel (`grep -rn "admin" src/ -l`), and `verify-payment.ts` (READ ONLY) for the Resend pattern first.

- 7a. `supabase/migrations/NOTES-ops-inbox.sql` (FILE ONLY, statement-by-statement, do not apply): `pending_reviews` table (id, created_at, reviewed_at, reviewed_by, category, severity check in urgent/warning/info, title, body, action_steps, auto_resolved, auto_resolution_note, extra jsonb); RLS enabled; REVOKE INSERT/UPDATE/DELETE from anon+authenticated; admin-appropriate SELECT (match how the real admin reads data); SECURITY DEFINER `mark_review_reviewed(p_id)` gated to the admin email allowlist; index (reviewed_at, auto_resolved, severity).
- 7b. `api/_ops.ts` (Web APIs only, Workers-compatible): `writeReview` (dedupe by category — update existing unreviewed row), `autoResolve`, `sendOpsAlert` (reuse verify-payment's exact Resend pattern; fires only urgent/warning; ADMIN_EMAIL secret, fallback himanshu1305@gmail.com).
- 7c. `api/ops-monitor.ts` route handler (built, NOT registered in routing): checks = (1) payment liveness via the create-order sentinel (expect `{"error":"Report not found"}`; fail→retry 10s→urgent+alert; pass→autoResolve), (2) PDF generation health — first READ code to find the real path (grep puppeteer/chromium/sparticuz/playwright/verify-print); if not Worker-callable, documented no-op, do not invent endpoints, (3) celebrity_sitelinks integrity: total>=27000 (baseline 28,148), nationality_code='IN'>=300, zero rows with birth_date set but birth_month_day null — paste actual counts, (4) dependency reachability: ipapi.co ping + presence (not values) of RESEND_API_KEY and Razorpay env vars, (5) error-rate ONLY if an error-logs table actually exists (grep first; else skip and say so).
- 7d. `api/ops-digest.ts`: unreviewed non-auto-resolved rows → one mobile-readable Resend email with link to /admin; zero rows → send nothing.
- 7e. Admin "Ops" tab, placed first: red badge (unreviewed urgent+warning count), severity chips, action_steps monospace, "Mark reviewed" via the RPC only, collapsed Auto-resolved section, green All-clear state. Reuse existing admin CSS.
- 7f. `docs/OPS-ACTIVATION.md`: exact wrangler.toml `[triggers]` crons block (daily 06:00 UTC monitor, Mon 07:00 UTC integrity, Sun 09:00 UTC digest), `scheduled()` dispatch wiring for `_worker.ts`, ops-monitor route registration line, Studio steps for the SQL, ADMIN_EMAIL secret command. DO NOT APPLY ANY OF IT.
- 7g. Update `docs/ARCHITECTURE-DECISIONS.md` (Ops section, explicitly MONITOR-ONLY). Commits per sub-part.

## PHASE 8 — FINAL VERIFICATION + SINGLE GATED DEPLOY

- 8a. Typecheck clean. Full `npm run build` — 0 failed prerenders (page count may exceed 881 with new pages; 0 failures is the bar). Full gauntlet green (original + new tests). Paste all.
- 8b. GATE: only if 8a is fully green AND no payment file was modified (verify: `git diff develop..overnight-batch --name-only | grep -E "razorpay-webhook|verify-payment|_crypto"` must be EMPTY — paste it): deploy ONCE with `./node_modules/.bin/wrangler deploy` (NEVER npx). Paste version id. Smoke test: `curl -s -X POST https://bornclock.usdvisionai.workers.dev/api/create-order -H "Content-Type: application/json" -d '{"product":"birthday_report","report_slug":"zzzzzzzz","userId":"test-user","currency":"INR"}'` → must return `{"error":"Report not found"}`. If the gate fails, DO NOT deploy — record why in the status file.
- 8c. FINAL REPORT → `docs/OVERNIGHT-REPORT.md`: per phase DONE/PARTIAL/BLOCKED with commit hashes; bug list found vs fixed vs documented-only; new pages created with their citation counts; SEO changes summary; ops build summary incl. real PDF path found and DB counts; deployed version or gate-failure reason; MORNING CHECKLIST in exact order: (1) review `git log overnight-batch`, (2) phone-test geo fix + PDF + tabs on staging, (3) paste NOTES-ops-inbox.sql in Studio, (4) apply OPS-ACTIVATION.md steps, (5) review new content pages before merge, (6) merge overnight-batch → develop when satisfied.
