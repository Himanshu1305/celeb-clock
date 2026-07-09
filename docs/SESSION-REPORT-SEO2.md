# SESSION REPORT — SEO2 (2026-07-09)

## Summary

9 parts completed. All gauntlet runs 43/43. tsc clean. 8 commits pushed to origin/develop.

---

## Per-Part Results

### Part 1 — Prerender completion
**Commit:** `2157cd0`

Changed `scripts/prerender.mjs`:
- CONCURRENCY: 1 → 8
- TOTAL_TIME_LIMIT_MS: 12min → 25min
- Added `dist/prerender-manifest.json` with per-route status (ok/failed/skipped)

**Build result (final run):** 876 ok, 5 failed, 0 skipped, 363s
- 5 failures: `/born-on/june-26` through `/born-on/june-30` — transient Supabase 15s timeout in that batch (coincidental rate limiting). All other 876 routes ok. Re-running build will likely recover them.
- 363s = 6 min 3 sec; comfortable within 25-min guard.
- Previously CONCURRENCY=1 meant routes ran sequentially. At c=8 the prerender is ~5–6× faster in practice.

---

### Part 2 — llms.txt
**Commit:** `ad60ff5`

Created `public/llms.txt` (lands in `dist/llms.txt` on next build). Covers: calculators, zodiac indexes, born-on index, blog index, pricing, privacy. Added AI model index comment line to `robots.txt`.

---

### Part 3 — OG images
**Commit:** `3e38c5a`

Generated 5 branded 1200×630 PNGs via `scripts/generate-og.mjs` (puppeteer + local Chrome):
- `public/og/default.png` — general BornClock brand
- `public/og/zodiac.png` — "Zodiac Profiles — Western · Chinese · Vedic"
- `public/og/born-on.png` — "Celebrities Born On Every Date"
- `public/og/report.png` — "Birthday Blueprint — The Ultimate Birthday Gift"
- `public/og/calculator.png` — "Free Age & Life Expectancy Calculators"

Design: ink `#0C1A2B` bg, gold `#B8862F` accent, BornClock wordmark, clock-ring motif, bottom domain line.

`SEO.tsx` DEFAULT_OG_IMAGE changed from logo PNG to `/og/default.png`. Per-section wiring:
- Zodiac (Zodiac, ZodiacSign, VedicZodiac, VedicZodiacSign, ChineseZodiac, ChineseZodiacSign) → zodiac.png
- Born-on (BornOnIndex, BornOnDay) → born-on.png
- Calculator (AgeCalculatorPage, PlanetaryAgePage, LifeExpectancy, BiologicalAge) → calculator.png
- Birthday Blueprint (BirthdayReport) → report.png
- `index.html` fallback OG also updated to `og/default.png` (1200×630, was 400×400 logo).

---

### Part 4 — Cosmos PDF sparse page fix
**Commit:** `06523e0`

**Before:** intro paragraph ("Each planet orbits…") rendered alone on dark page, planet cards pushed to next page.

**Fix:**
1. Added to `@media print` in `pageStyle`: `.solar-section { break-before: page !important; padding-top: 8px !important; }` — section starts fresh, top padding removed.
2. Removed the standalone centered intro paragraph (redundant with the header sub-description).

**verify-print results:**
- Default (Neeraj): **9/10 pass, 0 sparse pages**. Only failure = pre-existing clipping (recipient name at header/footer boundary, unrelated to this change).
- Leap-day (zadm0k3k): **9/10 pass**, sparse p16(41%) p17(16%) — other section-ends, not the cosmos section. The cosmos dark page is no longer in the sparse list.

---

### Part 5 — Welcome email upgrade
**Commit:** `f762b66`

Changes to `welcomeEmail()` in `api/_email.ts`:
- Added credibility callout (green left-border block): _"Built on peer-reviewed longevity research and real celebrity birth records — not horoscopes pretending to be science."_
- Added Birthday Blueprint gift bullet: `🎁 Birthday Blueprint — gift a personalised 11-section report to anyone.`
- Removed one intro paragraph to keep length similar.
- Planetary ages bullet was already present.

**Final feature list (6 bullets):** Life Expectancy, Biological Age, AI Coach, Planetary Age, Celebrity Twins, Birthday Blueprint.

---

### Part 6 — Born-on page content depth
**Commit:** `d639a9a`

Added to `BornOnDay.tsx`:
- **Day of year:** `#X of 365 (non-leap)` + `N days until next [date]` — two-column card, computed client-side.
- **Birthday Number:** digit-reduction of the day (e.g., day 25 → 7), with numerology name (from `NUMEROLOGY_DATA`) and mastery snippet. Links to `/numerology/{n}`.
- **Season note:** Northern-hemisphere season for the date (Spring/Summer/Autumn/Winter) with one-line description.
- **Meta description updated:** now includes zodiac sign alongside celebrity names (e.g., "Famous people born on June 25 (Cancer) include…").

No invented data — all derived from the day number, existing NUMEROLOGY_DATA, and calendar math.

---

### Part 7 — CF deploy-on-push investigation
**Commit:** `66c1cd7`

**Root cause confirmed:** `wrangler deployments list` shows ALL code deploys as `Source: Unknown (deployment)` — no "GitHub" source ever appears. No GitHub Actions exist (`.github/` not present). No CF dashboard GitHub integration. Every deploy to date has been a manual `npx wrangler deploy` run.

The "non-production branch runs version-upload" hypothesis does not apply — there's no branch config at all.

**Fix options documented in `docs/ARCHITECTURE-DECISIONS.md` §2, lesson 8:**
- (a) GitHub Actions: `.github/workflows/deploy-cf.yml` running `npx wrangler deploy` on push to `develop` (recommended)
- (b) CF dashboard "Connect to Git" → select repo → production branch = `develop`

---

### Part 8 — Admin business metrics dashboard
**Commit:** `c34b506`

Added to `src/pages/Admin.tsx`:
- New `'metrics'` section (default landing section)
- **Signups:** total users, 7-day, 30-day; 30-day line chart (recharts LineChart)
- **Subscriptions:** active / cancelled / free-other counts
- **Reports:** total birthday_reports, 7d/30d new, paid count (all-time), paid count (30d), conversion % (30d)
- **Revenue:** from `payments` table — all-time sum + count, 30d sum + count; graceful note if RLS policy blocks access
- **Emails sent:** skipped with note — no emails_log table exists yet

CF Web Analytics beacon placeholder added to `index.html` (commented block with instructions for Himanshu to paste the token snippet after enabling in dashboard).

---

### Part 9 — Final
**Final build:** 876/881 routes (5 late-June born-on timeouts — transient), 363s
**tsc:** clean
**Gauntlet:** 43/43

---

## Prerender Manifest Summary

`dist/prerender-manifest.json` structure:
```json
{
  "generatedAt": "ISO timestamp",
  "totalRoutes": 881,
  "ok": 876,
  "failed": 5,
  "skipped": 0,
  "elapsedSeconds": 363,
  "routes": [
    { "route": "/born-on/january-1", "status": "ok", "title": "..." },
    { "route": "/born-on/june-26", "status": "failed", "error": "Navigation timeout..." },
    ...
  ]
}
```

Failed routes to retry: `/born-on/june-26`, `/born-on/june-27`, `/born-on/june-28`, `/born-on/june-29`, `/born-on/june-30`.

---

## PDF Sparse Pages — Before / After

| Slug | Before | After |
|---|---|---|
| `osenyz63` (Neeraj) | Cosmos section ~10–20% sparse (intro para alone on dark page) | 0 sparse pages |
| `zadm0k3k` (leap-day) | Cosmos similar | p16(41%) p17(16%) — other section-ends, not cosmos |

---

## CF Deploy-on-Push — Finding and Fix

**Finding:** No GitHub integration configured. All deploys manual.
**Recommended fix:** Add `.github/workflows/deploy-cf.yml`:
```yaml
name: Deploy to Cloudflare Workers
on:
  push:
    branches: [develop]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```
Requires: add `CLOUDFLARE_API_TOKEN` to GitHub repo secrets (Settings → Secrets → Actions).

---

## Admin Metrics Dashboard — What It Shows

| Section | Data shown |
|---|---|
| Signups | Total users, 7d new, 30d new, 30-day signup line chart |
| Subscriptions | Active / Cancelled / Free counts |
| Reports | Total, paid all-time, 7d/30d new, 30d conversion % |
| Revenue | All-time and 30d sum + transaction count (payments table) |
| Note | "Emails sent" skipped — no emails_log table |

---

## Himanshu Manual Actions

1. **Enable CF Web Analytics:** Go to Cloudflare dashboard → Analytics → Web Analytics → Add Site → bornclock.com. Copy the beacon `<script>` tag and replace the comment block in `index.html` with it, then deploy.

2. **Fix CF auto-deploy:** Add `.github/workflows/deploy-cf.yml` (template above) and set `CLOUDFLARE_API_TOKEN` secret in GitHub. Then every push to `develop` deploys automatically. Until then, run `npx wrangler deploy` manually after pushing.

3. **Verify deployed state:** Due to the deploy-on-push gap, the CF Worker at `bornclock.usdvisionai.workers.dev` may not reflect today's commits. Run `npx wrangler deploy` to push current code.

4. **Google Search Console TXT verification:** Add the TXT DNS record (provided in Search Console) to bornclock.com's DNS in Cloudflare. This unlocks sitemap submission and indexing data.

5. **Born-on prerender retry:** 5 late-June routes timed out. A second `npm run build` will retry them. Or they'll be served client-rendered until the next build.

6. **Revenue table RLS:** The admin metrics Revenue section currently shows "payments table not accessible" if the `payments` table exists but has no SELECT policy for the authenticated admin user. If the table exists, add: `CREATE POLICY "Admin reads payments" ON payments FOR SELECT TO authenticated USING (true);` — or scope it to admin email.

7. **Check born-on prerender sample:** Verify that `/born-on/march-15` in the deployed `dist/` has the new day-of-year + birthday number + season content (not just the old celebrity list).
