# BornClock — Overnight Batch Report

Branch: `overnight-batch` (off `develop`). Local commits only; **deployed once to
the staging Worker** at the Phase-8 gate. Generated: 2026-07-27.

Deployed staging version: **`391cbc7c-a549-4ac7-87af-7bdfe387ae03`**
(https://bornclock.usdvisionai.workers.dev + staging.bornclock.com).

---

## Per-phase status

| Phase | Status | Key commits |
|---|---|---|
| 1 — Geo flash bug | **DONE** | `ed91e60` |
| 2 — Founder bugs (calc, tabs, PDF) | **DONE** | `3fa9703`, `6384046`, `2a507b0` |
| 3 — Full-site bug hunt + e2e | **DONE** | `871ef66` |
| 4 — Technical SEO | **DONE** | `905d4c8` |
| 5 — Keyword + competitor research | **DONE** | `98dd6ad` |
| 6 — Content: new page + edits | **DONE** | `7ffcbe0` |
| 7 — Ops monitoring (monitor-only, inert) | **DONE (built, not activated)** | `d130623`, `e28f40e`, `d781604` |
| 8 — Final verification + gated deploy | **DONE (deployed)** | version `391cbc7c…` |

---

## Bugs: found vs fixed vs documented-only

**Fixed:**
1. **Geo flash (P1)** — `useCountryCode` returned `profile?.country ?? detected`, but
   `profile.country` is a full display name ("India"), not ISO2; once the auth profile
   resolved it overrode the correct ipapi ISO2 → `COUNTRY_LABEL['India']` undefined →
   section vanished. Now: shape-validate to ISO2 (rejects full name + empty string),
   latch the first valid code in a ref, cache key `bc_country_code_v2`. **Verified live**
   (deployed bundle contains `bc_country_code_v2`).
2. **PDF "years remaining" mismatch (P2b)** — "70.2 yrs (51.5 remaining)" at age 44;
   remaining was from `controllablePotential` (≈95.5) not the displayed forecast.
   Fixed all 3 sites → `displayedOptimized − currentAge` (26.2).
3. **Report pillar tabs overlap on mobile (P2c)** — `grid-cols-3` too narrow at 360px;
   switched to flex+overflow-x-auto mobile / grid sm+, 44px targets, stronger active state.
4. **Longevity PDF "blank pages on mobile" (P2a)** — root cause: 1px×1px print iframe
   (mobile lays out at the iframe viewport before print → 1px-column reflow). Fixed to
   real off-screen A4. Plus CSS hardening (page inset margin→padding, no trailing
   forced break). Headless harness: 15 pages, 0 blank, geometry preserved.
5. **DOB rollover accepted (P3b)** — birthday form accepted 29-Feb-non-leap etc. (JS
   `new Date` rolls over). Added strict round-trip validation.
6. **Duplicate/empty month titles (P4)** — `/birthday/{1-12}` had empty-month titles
   (off-by-one slice). Fixed → unique "September Birthdays" etc. Site duplicate-title
   count 12 → 0.
7. **Canonical pointed at home on ALL 881 pages (P4)** — helmet per-route canonical not
   captured in prerender. Injected correct per-route trailing-slash canonical +
   og/twitter url/title. Verified: 0 home-canonical leaks across 882 pages.
8. **3 dead FAQ internal links (P6b)** — pointed at non-existent `/answers/*` routes;
   repointed to existing pages.

**Documented-only (not fixed, safe/non-blocking):**
- **Malformed report payload → ReportView `toLocaleString` crash** — a `save-report`
  row with incomplete `reportData` crashes the report view (caught by an error
  boundary; the real form always sends complete data). See `docs/BUG-AUDIT.md`.
  Recommendation: validate `reportData` in save-report, or guard the render.
- **16 orphan blog posts** (≤1 internal inlink) — reachable via /blog + related blocks;
  noted for future cross-linking.

**Page sweep (P3c):** 57/57 routes clean (no console errors, no undefined/NaN/null,
no empty renders). `docs/BUG-AUDIT.md`.

---

## New pages created (with citation posture)

- **`/answers/how-many-days-until-my-birthday`** — targets cluster-(a) tool-intent
  keyword. **Citations: 0 required** — every claim is computational/definitional
  (countdown math, Gregorian leap rule, half-birthday), so Rule-7-clean by
  construction (no external science claims that could be fabricated). Full SEO:
  unique title+desc in the title map, prerendered, in sitemap, Breadcrumb+Article+
  FAQPage JSON-LD, concise AEO answer block, 3 inbound internal links.

---

## SEO changes summary (P4 + P6)

- Sitemap: all URLs now trailing-slash (kills the 307 hop; Worker 307s non-slash→slash).
- Per-route canonical + og:url + twitter:url + og/twitter title injected in prerender
  (were all home-pointing).
- Per-route BreadcrumbList JSON-LD injected on every deep page.
- Fixed empty-month `/birthday/{1-12}` titles.
- robots.txt (GPTBot/ClaudeBot/PerplexityBot/Google-Extended allowed) + llms.txt verified.
- Meta audit: 0 missing, 0 duplicate titles/descriptions across 882 prerendered pages.
- `docs/SEO-STRATEGY.md`: fetched-evidence competitor teardown + keyword map + AEO +
  90-day plan.

---

## Ops build summary (P7 — MONITOR-ONLY, inert)

Built (not activated): `NOTES-ops-inbox.sql` (pending_reviews + RLS + has_role SELECT +
email-gated mark-reviewed RPC), `api/_ops.ts`, `api/ops-monitor.ts`, `api/ops-digest.ts`,
admin **Ops** tab, `docs/OPS-ACTIVATION.md`, ARCHITECTURE-DECISIONS §11.

- **Real PDF path found:** NONE — both reports print **client-side via an iframe**;
  no server-side PDF (`grep` of api/ + functions/ finds no puppeteer/sparticuz/
  chromium/playwright). The monitor's PDF check is a documented no-op.
- **DB integrity counts (live):** celebrity_sitelinks total **28,148**, nationality_code
  IN **2,627**, rows with birth_date set but birth_month_day null **0** — all healthy.
- **Rule 4:** `wrangler.toml` and `functions/_worker.ts` were NOT modified
  (git-verified). Nothing is routed or scheduled; activation is manual per OPS-ACTIVATION.

---

## Deploy (P8)

- Gate: build **882 ok / 0 failed**; gauntlet **135/135 pass**; typecheck = pre-existing
  errors only (stale Supabase generated types + inherited `quiz.dob` type gap — 0 new
  regressions; vite build is the real gate). Payment-file diff vs develop: **EMPTY**.
- Deployed once: `./node_modules/.bin/wrangler deploy` → version
  **`391cbc7c-a549-4ac7-87af-7bdfe387ae03`**.
- Smoke test: `create-order` sentinel → **`{"error":"Report not found"}`** ✓.
  Geo fix (`bc_country_code_v2`), new page (200), trailing-slash canonical — all live.

---

## MORNING CHECKLIST (in order)

1. **Review the work:** `git log overnight-batch` (17 commits: `ed91e60` → `0868365`,
   + this report). Skim the diffs.
2. **Phone-test on staging** (staging.bornclock.com or bornclock.usdvisionai.workers.dev):
   (a) geo — the "Born this day — from India 🇮🇳" section stays visible on mobile after
   auth resolves (no flash); (b) download the Life Expectancy PDF on a phone — check the
   blank-page count; (c) the report pillar tabs (Biological Blueprint / Community Anchor
   / Health Guide) don't overlap at ~360–390px; (d) the "years remaining" number matches
   the optimized age.
3. **Apply the ops SQL:** paste `supabase/migrations/NOTES-ops-inbox.sql` in Supabase
   Studio **one statement at a time** (confirm the BornClock project breadcrumb first).
4. **Activate ops** (optional, when ready): follow `docs/OPS-ACTIVATION.md` — set
   ADMIN_EMAIL secret, register the two routes + scheduled() dispatch in
   `functions/_worker.ts`, add the crons to `wrangler.toml`, redeploy. Then check
   `/admin` → Ops.
5. **Review the new content page** before merge: `/answers/how-many-days-until-my-birthday`.
6. **Merge `overnight-batch` → `develop`** when satisfied.
