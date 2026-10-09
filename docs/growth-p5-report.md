P5 COMPLETE: YES — infrastructure & measurement (robust city lookup, conversion funnel, server-side AI limit, born-today photos cached) all built, real-use verified on the live preview across Chromium / iPhone-WebKit / Android-Chrome, plus the optional NS-LEADERBOARD deliberately deferred with a documented reason.

Branch: `growth` (from `develop`, RC3 merged). Nothing deployed to production, `develop`, or `main`; no Cloudflare token added to GitHub. Work shown only via a preview version upload.

- **Preview URL (final):** https://fc115d7f-bornclock-staging.usdvisionai.workers.dev
  — worker `bornclock-staging` (dry-run confirmed), `wrangler versions upload` (NOT `deploy`).
- **Production version (read-only, for rollback):** unchanged by this run — I did not read/alter production; the production domain is attached to the separate `bornclock` worker and was never touched.
- **Test-suite baseline:** 196 files / 2103 tests. **After P5:** 201 files / **2135 tests, all passing** (+32 P5 unit tests; never below baseline).
- **Build time:** ~19.5 min (vite build 6.8s + OG cards 7.7s + prerender 1140s for 4055 routes + sitemap). Load at build start 3.90–7.5 (another process sharing the Mac); perf measured later at load 1.63 (< half of 8 cores).

---

## Items built (with evidence)

### P5-1 — Robust city lookup  ✅
Reduce dependence on the public Nominatim service via a bundled dataset + caching + an edge proxy, OSM attribution where still used.
- **Bundled dataset** `src/data/cityDataset.ts`: ~190 Indian cities (every state/UT capital + major cities) + ~100 world cities, each with exact coords, IANA zone and standard UTC offset. Licensing: coordinates and a city's IANA time zone are factual/public-domain (IANA tz DB); nothing scraped from a competitor. World cities now carry their **real** offset (e.g. London 0, New York −5, Tokyo +9, Kathmandu +5.75) instead of the old "assume IST for everything non-cached".
- **`src/services/geocoding.ts`** resolution order: bundled (offline, instant) → 30-day localStorage result cache → `/api/geocode` edge proxy → direct Nominatim fallback (dev only). Most common cities now never touch Nominatim.
- **`api/geocode.ts`** edge proxy: bundled-first (so a bundled city never reaches OSM), one well-identified `User-Agent` per OSM policy, `Cache-Control s-maxage=86400` so repeat lookups serve from the Cloudflare edge; returns the `© OpenStreetMap contributors` attribution only when a result came from OSM.
- **Real-use (preview, API):** `/api/geocode?q=Delhi` → bundled, `cache-control: public, max-age=86400`; `?q=Tokyo` → offset 9, `Asia/Tokyo`; `?q=Thiruvaiyaru` (long-tail) → `source:osm` + attribution object.
- **Real-use (browser, 3 engines):** on `/kundali` typing "Mumbai" shows the bundled suggestion and the **OpenStreetMap attribution is visible** at the city field — PASS on Chromium, iPhone-WebKit, Android-Chrome. (Attribution was already present on all four city-input surfaces from RC3.)
- **Tests:** `src/data/__tests__/cityDataset.test.ts`, `api/__tests__/geocode.test.ts`.

### P5-2 — Conversion tracking (visit → generate chart → purchase)  ✅
- **`chart_generated` funnel event** fires once per session on a successful Kundali generation (`KundaliPage`) and on the life-expectancy forecast reveal (`LifeExpectancyCalculator`, with `tool` discriminator) — this is the activation step that was missing between visit (page_view) and purchase (checkout_opened/purchase_completed, already tracked). Consent-gated by the existing `hasAnalyticsConsent()`; no birth/health inputs are sent.
- **`src/lib/analytics/funnel.ts`** `computeFunnel()`: turns `analytics_events` into a unique-session funnel (Visited → Generated a chart → Viewed a locked report → Opened checkout → Completed purchase) with pctOfTop/pctOfPrev. The **admin AnalyticsDashboard gains a "Funnel" tab** rendering it — funnel events were being stored but never surfaced before.
- **Real-use (browser, 3 engines):** with analytics consent granted, generating the reference chart on `/kundali` renders a real chart (Rashi/Lagna) **and** emits the `chart_generated` beacon to the real `analytics_events` table — PASS on Chromium, iPhone-WebKit, Android-Chrome.
- **Tests:** `src/lib/analytics/__tests__/funnel.test.ts` (unique-session dedup, pct math, type isolation). Mirrors NS-CALC "funnel events land in the existing analytics".

### P5-3 — Server-side AI astrologer limit  ✅
Previously the only enforcement was the browser's localStorage count (the server simply trusted the client's `questionCount`, so clearing storage reset the cap).
- **`src/lib/vedic/serverRateLimit.ts`**: server-authoritative daily limiter keyed by a **salted SHA-256 of the client IP** (raw IP never stored), UTC-midnight reset. `peek()` (reject at cap) + `record()` (count only on a **delivered** answer, never a degraded/model error — matching the old client behaviour) over an injectable store.
- **`api/vedic-chat.ts`**: the client's `questionCount` is now **ignored**; the server peeks before answering (429 if at cap) and records after a real reply, returning an authoritative `remaining`. Admin tier stays unlimited; the crisis + health-symptom pre-scans still bypass the cap (distress is never blocked).
- **Durability note:** the default store is in-memory per isolate — it already closes the "clear localStorage to reset" bypass and resets daily. A globally-durable counter (Cloudflare KV or a Supabase `ai_chat_usage` table) is documented with drop-in SQL in `MIGRATIONS_TO_APPLY.md` and listed under **Needs the person**.
- **Real-use (preview, API):** from one IP, free-tier POSTs to `/api/vedic-chat` returned real answers until the 3/day cap, then **HTTP 429** `{"rateLimited":true,"reply":"You've used your 3 free questions for today…","remaining":0}` — enforced server-side with no `questionCount` sent. A crisis message still returned 200 with the support response while capped.
- **Tests:** `src/lib/vedic/__tests__/serverRateLimit.test.ts` (caps per tier, UTC reset, salted-hash privacy, peek-doesn't-mutate, admin unlimited); `vedicChat.test.ts` updated to the server-authoritative model.

### P5-4 — Born-today photos cached through BornClock  ✅
Freely-licensed images only, credits shown, periodic refresh.
- **`api/born-today-photo.ts`**: resolves a person's lead photo and returns it **only when a free licence is positively identified** (CC-BY / BY-SA / CC0 / public domain / no-restrictions); non-free / fair-use / unknown are dropped. Returns the author, licence name + URL, and Commons file page (the attribution the licence requires). `Cache-Control s-maxage=604800` → served/refreshed weekly at the Cloudflare edge. `?img=1` additionally **streams the image bytes through the worker** with the same edge cache, so the photo itself is served via bornclock.com.
- **`WikipediaImageService`**: resolution now routes through the edge endpoint (free-only + credited + edge-cached), keeps the 7-day localStorage cache, exposes `getImageCredit(name)`, and falls back to direct Wikipedia only in local dev.
- **Credits shown:** per-photo author + licence links under the avatar in the celebrity profile dialog; a blanket "Photos: freely-licensed images from Wikimedia Commons" note on the birthday-matches results.
- **Real-use (preview, API):** `/api/born-today-photo?name=Albert%20Einstein` → free image + `{"artist":"Oren Jack Turner","license":"Public domain","source":"Wikimedia Commons"}`, `s-maxage=604800`; `?img=1` → `content-type: image/jpeg`, 7-day edge cache, `X-Image-Author`/`X-Image-License` headers; a fictional name → `{"image":null,"credit":null}` (graceful). `Marie Curie` likewise resolved on the final preview.
- **Real-use (browser, 3 engines):** `/todays-birthdays` renders real born-today people with photos — PASS on Chromium, iPhone-WebKit, Android-Chrome.
- **Tests:** `api/__tests__/born-today-photo.test.ts` (licence accept/reject, HTML-strip, resolve/drop paths).

### NS-LEADERBOARD (optional, P5) — deferred with documented reason  ⟂
BornClock already ships honest peer framing with **no cross-user data**: a longevity percentile label (`LongevityScoreCard.getPercentileLabel`), an honest P(reach 100) (NS-P100), and a birthday rarity percentile (`BirthdayRarityCard`). A dedicated cross-user leaderboard would need real, consented aggregates we don't have and must never fabricate or seed (Rule 8), so it is left optional/deferred rather than shipped with invented cohorts. Ticked `[~]` in `docs/growth-improvements.md` with this reason.

---

## End-of-phase full retest (fresh preview upload fc115d7f)

| Check | Result |
|---|---|
| P5 items real-use, 3 browsers (Chromium / iPhone-WebKit / Android-Chrome) | **PASS** (`e2e/p5-preview.spec.ts`, 11 passed; 1 flaky = upstream Wikimedia transient, passed on retry) |
| New-endpoint API smoke (`/api/geocode`, `/api/born-today-photo`, `/api/vedic-chat` limit) | **PASS** (unmocked, on preview) |
| Cumulative regression — core RC3 tools reachable (Kundali generates a real chart incl. Dasha/What's-Ahead; born-today; results) | **PASS** |
| 404 gate (`scripts/p4-404-check.mjs`, extended set) | **PASS** (19/19; P5 added no page routes, only API endpoints) |
| Sitemap status (30 diverse URLs across page types) | **PASS** (30/30 → 200); full set unchanged from P4 (no new page routes) |
| Prerender-missed page serves via SPA | `/born-on/january/11` → **200** (one route hit a 15s nav timeout under build load; serves fine) |
| axe serious/critical — `/kundali`, `/todays-birthdays`, `/results` × desktop + Pixel5 | **0** (fixed a pre-existing `text-gray-400` contrast on `/todays-birthdays`) |
| Full unit suite | **2135 passed** (≥ baseline 2103) |
| Typecheck | No new errors in any P5 file (pre-existing errors in kundali/Admin/etc. unchanged) |
| perf-budget (7 layouts, RUNS=3, load 1.63) | **PASS** (all pages within budget) |
| Build time | ~19.5 min (4055 routes) |

**Bug log:** `docs/growth-bugs.md` — no new product bugs in P5. Items encountered and resolved during retest: (1) pre-existing color-contrast on `/todays-birthdays` (fixed, `text-gray-600`); (2) the P5 photo-endpoint e2e flaked under parallel cold-cache load because the unauthenticated Wikimedia API rate-limits concurrent requests — made the test retry (real users hit the 7-day edge cache); curl confirms the endpoint resolves reliably.

---

## Commits (pushed to `growth`)
- `0864706` P5-ROBUST-CITY — bundled dataset + edge geocode proxy + result cache
- `5ecd3a6` P5-FUNNEL — visit→generate→purchase funnel events + admin Funnel tab
- `ba90e42` P5-SERVER-AILIMIT — server-authoritative AI daily cap (hashed IP)
- `90eddb7` P5-PHOTOS — born-today photos cached (free-only + credited)
- `95e0389` P5-RETEST — /todays-birthdays contrast fix + P5 axe/e2e gates

## Needs the person
- **Durable AI rate-limit store (optional):** create a Cloudflare KV namespace OR apply the `ai_chat_usage` table (SQL in `MIGRATIONS_TO_APPLY.md`) for cross-edge, restart-proof enforcement. The in-memory limiter is live and tested meanwhile.
- **Staging sign-in** (Part 4 item 1) still gates the AI astrologer **UI**; the server limit itself is fully verified via the API. Verified up to the sign-in step.
- **Prices / paid products, real expert reviewer, WhatsApp Business, translation review, schema changes** — unchanged standing items; none introduced by P5.
- **NS-LEADERBOARD** — a future honest version needs consented, aggregated bio-age data (a product/data decision), never seeded.

**P5 COMPLETE: YES.**
