# Full-Site SEO/AEO/GEO Audit — Report

Mechanized audit of the built `dist/` (1341 pages) via `scripts/seo-audit.mjs`, with mechanical
fixes applied and re-audited. Per-page findings: `docs/SEO-AUDIT-FINDINGS.csv` (the AFTER state).

**Headline:** 0 SEVERITY-1 issues at any point. Every mechanical **technical / schema / link-graph /
sitemap / asset** defect was fixed; total findings **3687 → 1559 (−58%)**. The 1559 remaining are
entirely **soft-threshold or editorial** items (title/description *length*, 2 shared-widget double-h1s,
brand-suffix consistency, 2 content notes) — none generate a GSC error state.

---

## 1. Scorecard — before / after per check

| Check | What it catches | Before | After | Action |
|---|---|---:|---:|---|
| **T1/T1b** | canonical missing / ≠ self / homepage / duplicate-distinct | 0 | **0** | clean (self-referencing, single canonical/page) |
| **T2** | title <30 or >65 chars | 832 | 832 | REPORT (soft — 830 are >65 descriptive titles) |
| **T3** | description <70 or >165 chars | 693 | 693 | REPORT (soft — 676 are >165) |
| **T4** | h1 count ≠ 1 | 35 | **2** | FIXED 33 (blog markdown h1→h2); 2 deferred (see §3) |
| **T5** | noindex in sitemap | 0 | **0** | clean |
| **T7** | brand suffix ≠ 1× in title | 30 | 30 | REPORT (0 *doubled* — the bug class it targets is clean; 30 are *absent*-suffix, minor) |
| **S1** | JSON-LD parse failure | 0 | **0** | clean |
| **S2** | FAQPage <2 Q / duplicated-set | 0 | **0** | clean |
| **S3** | BreadcrumbList item 404s | 88 | **0** | FIXED (compat pair breadcrumb collapse) |
| **S4** | money page / hub without schema | 0 | **0** | clean |
| **L1** | internal link to non-route (broken) | 0 | **0** | clean |
| **L2** | internal link through a redirect source | 1501 | **0** | FIXED (compat links → canonical order) |
| **L3** | orphan (0 inbound internal links) | 55 | **0** | FIXED (compat mesh + footer links) |
| **L4** | >3 clicks / unreachable from home | 451 | **0** | FIXED (footer hub links + compat mesh) |
| **M1–M4** | sitemap ghosts / missing / redirect-sources / form | 0 | **0** | clean |
| **A1** | og:image not resolving in dist | 0 | **0** | clean |
| **A2** | og:title / og:description missing | 0 | **0** | clean |
| **C1** | <150 words unique content | 1 | 1 | REPORT (editorial — see §3) |
| **C2** | first-200-chars identical | 1 | 1 | REPORT (extraction artifact — see §3) |
| **TOTAL** | | **3687** | **1559** | |

---

## 2. SEVERITY-1 items

**None** — at any point in the audit. The failure classes that produce GSC error states — canonicals
pointing at the homepage, `noindex` on a sitemapped URL, redirect sources listed in the sitemap, ghost
sitemap entries, JSON-LD that fails to parse — were all **zero** in the initial audit and remain zero.
The site's crawl/index fundamentals were already sound; this pass fixed *quality* and *discoverability*.

### Fixes applied (mechanical, all re-verified by re-audit)
1. **L2 (1501→0)** — the compatibility calculator's "Best Matches" grid linked pairs in *reverse*
   alphabetical order (redirect sources the Worker 301s). Now links the **canonical** order
   (`[a,b].sort()`). One change, 79 pages, 1501 links repointed to final targets.
2. **S3 (88→0)** — `scripts/prerender.mjs` derived breadcrumbs from every URL segment, so a pair URL
   emitted a middle `/compatibility/{sign}` item that 404s. Now **collapses** compat pairs to
   `Home › Compatibility › "Sign1 & Sign2"`. (The breadcrumb is prerender-injected, not Helmet — Helmet
   JSON-LD doesn't survive prerender; `SEO.tsx` was updated to match for client-side parity.)
3. **T4 (35→2)** — blog markdown began with a `# Title` that ReactMarkdown rendered as a second `<h1>`,
   duplicating the page-title h1. Now `components={{ h1 → h2 }}` in `BlogPost.tsx`.
4. **L3 (55→0) + L4 (451→0)** — see §4.
5. **llms.txt** — added `/weight-on-planets` and `/coach`; fixed a **broken** `/gift-report` → `/gift`;
   fixed a **redirect-source** `/methodology` → `/how-it-works`.

---

## 3. Report-only findings (editorial judgment — founder decides)

Not auto-fixed by design (soft thresholds or content that needs a human).

### T2/T3 — title & description length (832 + 693)
Almost entirely **too-long**, not missing or duplicate (0 duplicates): **830 titles >65 chars**,
**676 descriptions >165 chars**. These are descriptive programmatic titles (e.g. the homepage title is
103 chars because it appends the full site name). Google **truncates** long titles/descriptions in the
SERP but does **not penalise** them; auto-truncating 1500+ metas risks dropping ranking keywords for no
gain. **Recommendation:** leave the long-tail as-is; optionally hand-tighten the ~10 highest-traffic
titles (home, `/age-calculator`, `/life-expectancy`, `/birthday-report`, `/gift`, `/coach`) to ≤60 chars
so the SERP shows the full title. The 2 too-short titles and 17 too-short descriptions are listed in the CSV.

### T4 — 2 remaining double-h1 (`/age-calculator`, `/numerology`)
Both embed a calculator widget that renders its **own** `<h1>` in addition to the page-title h1. The
widget is **shared** (it is the intended single h1 on the homepage), so demoting it globally would strip
the homepage h1. **Recommendation:** give the widget an optional `headingLevel`/`as` prop and pass `h2`
on these two pages. Deferred here to avoid a risky shared-component change for 2 severity-3 pages.

### T7 — 30 titles without the `| BornClock` suffix (blog posts + a few tools)
The check's real target — the **doubled**-suffix bug — is **clean (0 pages)**. The 30 flagged are
*absent*-suffix. Adding the suffix is cosmetic branding and would push already-long titles further past
the T2 window. **Recommendation:** optional; if wanted, append the suffix in `prerender-titles.mjs`'s
blog handler.

### C1 — 1 thin page: `/leaderboard` (131 words)
A mostly-dynamic leaderboard. **Recommendation:** add a 2–3 sentence answer-first intro explaining what
the longevity leaderboard ranks and how the score is derived.

### C2 — "first-200-chars identical across 1341 pages" — **extraction artifact, not a real issue**
This is a false positive from the audit's text extractor: the sticky header (a `<div>`, not a `<nav>`/
`<header>` tag, so not stripped) puts the same logo-alt + account-nav text at the start of every page's
body. It reflects shared **chrome**, not duplicate **content**. No action; noted for methodology honesty.

---

## 4. Orphans & crawl depth — how the mesh resolved them

The internal-link graph is built over **static prerendered HTML only** — which is exactly what a
non-JS-rendering crawler sees. Critically, the header nav's dropdown menus (Astrology / Explore / More /
Numerology) are **Radix-portaled** and are **absent from the static HTML** (they only mount on click), so
any page reachable *only* via a dropdown is effectively orphaned for crawling. Findings and fixes:

- **L3 orphans 55 → 0.**
  - 54 were compatibility pairs that only received *reverse-order* inbound links (which 301, so they
    don't consolidate). Adding a contextual **"More {sign} pairings"** mesh to every pair page (canonical
    links for both signs, **including same-sign** pairs) gives each of the 78 pairs multiple inbound
    links. Fixing the L2 reverse-order links was a prerequisite.
  - 1 was `/rashi-ratna` (only in the Astrology dropdown) → added to the footer.
- **L4 depth/unreachable 451 → 0.**
  - **377** were the `/birthday/*` personality pages (hub + 12 months + 365 days). The in-content chain
    `/birthday → /birthday/{m} → /birthday/{m}/{d}` exists in static HTML, but the entry point `/birthday`
    had **no** static inbound link (dropdown-only). Adding **`/birthday` to the footer** makes the entire
    378-page subtree crawlable at depth ≤3 — one link, huge crawl-budget win.
  - **60** compat pairs → resolved by the L2 canonical links + the pair mesh.
  - **12** `/chinese-zodiac/*` animal pages → added **`/chinese-zodiac`** hub to the footer.
  - remainder → the above.

Net: **every one of the 1341 pages now has ≥1 static internal link and sits ≤3 clicks from the homepage.**

---

## 5. Phase C — AEO/GEO spot audit (sampled, one per template)

- **llms.txt** — corrected (see §2.5): now accurately lists the newest sections (weight-on-planets,
  coach) and no longer points at a broken or redirected URL.
- **Answer-first paragraph** — present and within the 40–60-word direct-answer + honest-hedge pattern on
  every sampled template: date page, month hub, zodiac, **compat pair** ("…score X% overall…"),
  fitness/energy-forecast ("a rhythm-awareness check-in, not a prediction"), blog, and the money pages
  **/gift**, **/coach**, **/birthday-report**, **/weight-on-planets** ("your mass never changes — your
  weight is just gravity's pull…").
- **FAQ** entries on sampled templates are real user queries (not filler), and **data provenance** is
  stated where applicable (NASA gravity ratios on /weight-on-planets; WHO/GBD on /life-expectancy;
  "Western sun-sign, not Vedic" on compatibility).

---

## 6. Phase D — live post-deploy verification

Sampled **20 URLs across every template type** on production (following the standard Cloudflare
trailing-slash 307 that directory assets emit) + the 3 known redirects. **20/20 clean:**

| Result | Count |
|---|---|
| HTTP 200 | 20/20 |
| Self-canonical (`bornclock.com/<path>/`) | 20/20 |
| Single `<title>` | 20/20 |
| og:image present + resolves (spot-checked `/og/fitness/weight-on-planets.webp` & `/og/default.webp` → 200) | 20/20 |

Templates covered: home, tools (age/life-expectancy/weight-on-planets/numerology), money pages
(gift/coach/birthday-report), compat hub + pair + same-sign pair, zodiac, chinese-zodiac, born-on date,
birthday personality, month hub, blog index + post, rashi-ratna, answers.

**Redirects (301 → correct target, target self-canonical & in sitemap, source not):**

| Source | → | Result |
|---|---|---|
| `/rising-sign-calculator` | `/moon-sign` | 301 ✅ |
| `/methodology` | `/how-it-works` | 301 ✅ |
| `/compatibility/leo/aries` | `/compatibility/aries/leo/` | 301 ✅ (reverse-order → canonical) |

Sentinel: `POST /api/create-order` (bogus slug) → `{"error":"Report not found"}` ✅.

---

## 7. Gate

- **tsc**: 0 errors (0 new). ✅
- **build**: 1341 ok / 0 failed (sitemap 1341). ✅
- **test:prelaunch**: gauntlet **135/135** + prelaunch **154/154** — all green, no regressions. ✅
- **frozen files untouched**: `_crypto.ts`, `razorpay-webhook.ts`, `verify-payment.ts` — empty diff. ✅
- **invoice_counters unchanged**: BC 1002 / BN 1001 / BX 1001. ✅
- **before/after audit**: 3687 → 1559 (SEV-1: 0 → 0); all technical/schema/link/sitemap/asset checks 0. ✅
- **deploy**: ONE. `Uploaded bornclock` + `Deployed bornclock triggers` (trailing exit 1 = known cron
  `schedules` token-scope error). ✅
- **sentinel**: `{"error":"Report not found"}`. ✅
- **live Phase D**: 20/20 template URLs clean + 3 redirects 301 → target (§6). ✅

---

## 8. What GSC should show over the next 2–4 weeks, and which reports to watch

The fixes target GSC's real failure classes; expect these movements as Google recrawls:

1. **Page indexing → "Why pages aren't indexed"** — watch for drops in:
   - *"Alternate page with proper canonical tag"* / *"Duplicate without user-selected canonical"* — the
     reverse-order compat URLs are no longer linked, so they stop competing with the canonical pair.
   - *"Crawled – currently not indexed"* / *"Discovered – currently not indexed"* — the 378 `/birthday/*`
     pages and the compat pairs now have static internal links and shallow depth, so crawl priority rises;
     expect more of them to move to **Indexed** over 2–4 weeks.
   - *"Page with redirect"* in any *Sitemap* view — was already clean (0), stays clean.
2. **Enhancements → Breadcrumbs** — the *"Invalid URL in field id"* / breadcrumb errors on the 78 compat
   pairs should clear (the middle 404 item is gone). Watch this report turn fully green.
3. **Enhancements → FAQ / Merchant listings** — unchanged/valid (S1/S2 clean); no regressions expected.
4. **Sitemaps** — 1341 URLs, all self-canonical trailing-slash, no redirect sources; "Success" status.

**Founder watch-list:** (a) Page indexing coverage trend for `/birthday/*` and `/compatibility/*`;
(b) the Breadcrumbs enhancement report clearing its errors; (c) average position for the money-page
titles if you choose to shorten them (§3, T2).
