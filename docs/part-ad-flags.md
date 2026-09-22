# Part AD — flags, findings & rollback plan (branch `part-ad-seo-fixes`, off develop a3ef8e7)

## 🔴 CRITICAL infra finding (verified 2026-09-22): `wrangler deploy` = production
`wrangler.toml` lists only `staging.bornclock.com`, but the production domain
`bornclock.com` is attached to the **same `bornclock` worker** via the Cloudflare
dashboard. So **`wrangler deploy` publishes to BOTH staging AND production at once.**
The old memory note ("deploy → staging only") was WRONG; it has been corrected in
`~/.claude/.../memory/project_deploy_target.md`, `MEMORY.md`, and `wrangler.toml`.

Proof: prod + staging served the identical hashed bundle `index-LJyk96_u.js` (a local
part-ac build); `bornclock.com/api/vedic-reading` (a worker route) returned 200; the
part-ac deploy at 2026-09-20T06:17Z was the latest live version (354ddc73).

**Consequence:** the develop merge and part-ac were unintentionally deployed to prod.
**For Part AD, staging testing was done via `wrangler versions upload` (preview URL) —
NOT `wrangler deploy` — so production was never touched.**

## Production safety assessment (walked bornclock.com as a visitor, 2026-09-22)
Production (running unreviewed part-ac) is **functioning correctly for real users — a
process/review problem, not a live incident.** All core pages 200 + render with 0 JS
console errors (homepage, /kundali/, /born-on/august-6/india/, /blog/, /compatibility/);
worker APIs 200; the part-ac chat marriage path returns correct guarded output live; the
account-history sync degrades gracefully (reading_history column absent) with no user
impact. **Rollback not warranted on safety grounds.**

## Rollback plan (DOCUMENTED — do NOT run without explicit go-ahead)
NOTE: `5b5cfa3` (pre-Part-B) is the WRONG target — it predates the entire live Vedic
feature set (Kundali/chat/matching/born-on Vedic data) and would remove weeks of working,
traffic-serving functionality. The correct "last reviewed" target is **develop `a3ef8e7`**.

Option A — redeploy the reviewed develop build (guaranteed correct):
```
git checkout develop && npm run build && npx wrangler deploy
```
Option B — Cloudflare version rollback (faster, if the develop build's version is known).
Current live version: 354ddc73 (part-ac). Prior version c35dc96a (2026-09-20T04:05) is
LIKELY the develop deploy — CONFIRM its bundle before using:
```
npx wrangler deployments list          # identify the develop version id
npx wrangler rollback <develop-version-id>
```
Either way this touches PRODUCTION — requires explicit go-ahead.

## Part 4 root-cause finding (aries+date) — evidence-based, not a guess
- **No code, sitemap, or URL contains the literal `aries+date`** (grep-verified); no
  `+` appears in any sitemap `<loc>`. The `+` is the export-encoded SPACE — the real
  query is **"aries date" / "aries dates"** (a high-volume zodiac query).
- The page that correctly targets it, **`/zodiac/aries/`**, EXISTS and is healthy: HTTP
  200, self-canonical, indexable, title "Aries Zodiac Sign — Dates, Traits…", with an
  on-page "What are the Aries dates?" section. Its position 91 / 0 clicks is a content/
  ranking opportunity, not a technical bug.
- **Genuine technical hazard discovered:** plausible variants `/aries`, `/aries-dates`,
  `/zodiac/aries-dates` returned **soft-404s** — the SPA fallback serves HTTP 200 +
  homepage content that is still indexable. Any such URL, if discovered, can accrue
  impressions for "aries date" at a poor position without being a real page.
- **Fix:** 301-redirect all bare-sign and `[sign]-date(s)` variants → canonical
  `/zodiac/[sign]/` (all 12 signs) in `functions/_worker.ts`.

## Fixes made (all on `part-ad-seo-fixes`, off develop; NOT deployed to prod)
- **Part 1** — `functions/_worker.ts`: the asset layer's trailing-slash normalization
  redirect upgraded from **307 (temporary) → 301 (permanent)** so split authority
  consolidates. Canonical tags + sitemap were already trailing-slash-consistent (verified).
- **Part 2** — homepage query-param dupes: source CTAs in `BornOnDay.tsx`,
  `BornOnDayGlobal.tsx`, `BornOnDayIndia.tsx`, `BirthdayDatePage.tsx` re-linked from
  `/?day=&month=` / `/?birthDate=` (which the homepage IGNORES) to the canonical
  `/birthday/[m]/[d]/` (and the born-on page for BirthdayDatePage); worker 301s the legacy
  query-param URLs to `/birthday/[m]/[d]/`. VERIFIED these render the bare homepage, NOT
  /born-on/ — the real matching family is `/birthday/[month]/[day]/`.
- **Part 3** — blog tag archives: `SEO.tsx` gains a `noindexFollow` variant
  (`noindex, follow`, not nofollow); `Blog.tsx` now reads `?tag=` (previously ignored) and
  marks tag views noindex,follow + canonical `/blog`; worker adds `X-Robots-Tag:
  noindex, follow` header for `/blog?tag=` (crawl-reliable). Articles + /blog index stay indexable.
- **Part 4** — zodiac soft-404 redirects (above).
- **Part 5** — sitemap audited: already contained 0 query-param URLs, 0 blog-tag URLs,
  and all 3630 URLs trailing-slash-consistent. No sitemap change needed; re-verified.

## Tests
- `e2e/prelaunch/part-ad-seo.spec.ts` — new: asserts every redirect + the noindex header.
- Full unit suite: 1831 → 1831 (unchanged; these are routing/SEO changes).
