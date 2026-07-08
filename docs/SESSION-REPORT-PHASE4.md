# Session Report — Phase 4 (SEO Overhaul + Born-On Pages)

**Date:** 2026-07-09  
**Branch:** develop  
**Commits this session:** 0f60249 → 28840db  
**Final gauntlet:** 43/43 ✓

---

## Part A — CF Worker env binding fix

**Root cause identified:** CF Worker `env` object is a Proxy — `Object.entries(env)` returns `[]` even when secrets exist. Prior `bridgeEnv()` used enumeration which silently yielded nothing.

**Fix applied (commit 5439bf4):** Replaced enumeration with explicit `BRIDGE_KEYS` array in `functions/_worker.ts`:
```ts
const BRIDGE_KEYS = ['VITE_RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', ...];
for (const key of BRIDGE_KEYS) {
  const value = (env as Record<string, unknown>)[key];
  if (typeof value === 'string' && value !== '' && !process.env[key])
    process.env[key] = value;
}
```

**Remaining blocker (requires manual action):** Debug endpoint (`/api/debug-env`) confirmed ALL CF env keys are missing — secrets were never added to the CF dashboard. The code is correct; adding the secrets to the CF Workers dashboard will make payments work. The debug endpoint should be removed after secrets are confirmed working (see `api/debug-env.ts`).

---

## Part B — Per-route meta + JSON-LD

**Routes covered:** All public routes enumerated and given unique `<title>` (≤60 chars), `<description>` (≤155 chars), `canonical`, OG, `twitter:card`.

**JSON-LD types added:**
- `WebSite` + `Organization` → homepage (`/`)
- `WebApplication` → 10 calculator pages
- `Article` → zodiac sign + numerology number + birthstone pages
- `BlogPosting` → blog posts
- `FAQPage` → pages with real Q&A sections
- `ItemList` → `/born-on/:slug` pages (celebrities by birth date)

**SEO component changes:** Added `WebSiteSchema` and `WebApplicationSchema` named exports to `src/components/SEO.tsx`. Existing `SEO` component unchanged.

---

## Part C — Build-time prerender pipeline

**Files:** `scripts/prerender.mjs`, `scripts/prerender-routes.mjs`

**Key technical decisions:**
- `CONCURRENCY = 1` (sequential) — with concurrent rendering, react-helmet-async defers title DOM updates; only the first page in each batch received the correct `<title>`. Sequential rendering fixes this.
- SPA fallback static server reads `dist/index.html` for all non-asset routes
- Chromium launch: tries `@sparticuz/chromium` first (Linux CI), falls back to macOS Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- After `networkidle0`: 500ms extra wait + `document.title` extraction and patching of the `<title>` tag
- Root route (`/`) rendered LAST to avoid overwriting `dist/index.html` with home page
- 12-minute total guard; exit 0 on any chromium failure so build doesn't break on CF

**Local result:** 469/514 routes prerendered in ~12 minutes (time guard hit; Chinese-zodiac routes near the tail were skipped — these are SEO-nice-to-have, not critical). Titles verified correct on `/numerology/7` and `/zodiac/leo`.

---

## Part D — robots.txt + sitemap

**robots.txt:** AI crawler opt-in blocks added for GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Bingbot. Private paths disallowed (`/report/`, `/api/`, `/admin`, `/account`, `/profile`).

**sitemap.xml (`scripts/generate-sitemap.mjs`):**
- Writes to both `dist/sitemap.xml` (served by CF Workers) and `public/sitemap.xml`
- Priority logic: `/` = 1.0, calculator hubs = 0.9, zodiac/numerology/birthstone pages = 0.8, blog/born-on pages = 0.7, individual birthday dates = 0.6
- Total URLs with born-on routes: **881**

---

## Part E — 366 /born-on/:slug programmatic pages

**Slug format:** `january-1` through `december-31`, including `february-29` = 367 routes (index + 366 day pages).

**Pages created:**

### `src/pages/BornOnDay.tsx`
- Queries `celebrity_sitelinks` via `getRankedBirthdayCelebrities(monthDay, null, 12)` (MM-DD format)
- Renders up to 12 celebrities in 2-column grid using existing `CelebrityCard` component
- Shows: Western zodiac sign (via `getZodiacSign(month, day)`) with link to zodiac guide, Chinese zodiac note, birthstone (`BIRTHSTONE_DATA[month-1].primaryStone`) with link
- CTA pre-fills homepage birthday form via `/?day=${day}&month=${month}`
- Prev/next day navigation (wraps Jan 1 ↔ Dec 31)
- Per-page SEO: title uses top 3 celebrity names in description; JSON-LD `ItemList` of celebrities

### `src/pages/BornOnIndex.tsx`
- Calendar grid: 12 months, each showing numbered day links
- CTA to homepage report generator

**Routing:** Added `<Route path="/born-on" element={<BornOnIndex />} />` and `<Route path="/born-on/:slug" element={<BornOnDay />} />` to `src/App.tsx`.

**TodaysBirthdaysPage link:** Added `Born-on deep dive →` link to `/born-on/${todaySlug}` alongside existing birthday link.

---

## Gauntlet fix — `api/create-order.ts` validation order

Input validation was occurring AFTER the Razorpay credentials check, causing `bogus product`, `invalid currency`, and `missing report_slug` to return 500 ("Payment not configured") instead of 400. Moved input validation + DB report lookup BEFORE the Razorpay credentials check. This aligns the endpoint with the gauntlet spec and is the correct API design (fail fast on bad input before touching external services).

---

## Deployed checks (https://bornclock.usdvisionai.workers.dev)

| Route | HTTP | Notes |
|-------|------|-------|
| `/` | 200 | ✓ |
| `/zodiac/leo` | 200 | ✓ (SPA title; prerendered title in CI build) |
| `/born-on/july-9` | 200 | ✓ (new route, SPA fallback) |
| `/robots.txt` | 200 | ✓ AI opt-in blocks visible |
| `/sitemap.xml` | 200 | ✓ |
| `/api/create-order` (POST) | 500 | "Payment not configured" — CF secrets not in dashboard |

---

## Outstanding action required (manual)

**CF Dashboard → celeb-clock Worker → Settings → Variables and Secrets:**

Add the following secrets (values from `.env.local`):
- `VITE_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `VITE_CRON_SECRET`
- `ADMIN_SECRET_KEY`
- `VITE_RAZORPAY_PLAN_INDIA_MONTHLY`, `VITE_RAZORPAY_PLAN_INDIA_ANNUAL`
- `VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY`, `VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL`

After adding: trigger a re-deploy, then verify `/api/create-order` returns 404 for a nonexistent slug (instead of 500).

Once confirmed working, delete `api/debug-env.ts` and push.

---

## Total route count

| Category | Count |
|----------|-------|
| Static pages | ~40 |
| Zodiac signs | 12 |
| Birthstone months | 12 |
| Numerology numbers | 12 |
| Chinese zodiac | 12 |
| Vedic zodiac | 12 |
| Birthday month/day | 365 (non-leap) |
| Birthday months | 12 |
| Blog posts | 33 |
| Answer pages | 12 |
| Born-on pages | 367 (index + 366 days) |
| **Total** | **881** |
