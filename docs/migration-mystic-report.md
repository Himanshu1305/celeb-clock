MYSTIC COMPLETE: YES

# BornClock Migration — MYSTIC run report

Branch `redesign-central`. Production, `main` and `develop` untouched; no Cloudflare
token added to GitHub. All checks below ran against the live staging worker
`bornclock-staging`, fetched fresh (Fifth Rule).

- **Staging URL:** https://bornclock-staging.usdvisionai.workers.dev
- **Staging version:** `de22cbfd-81c8-4409-b2b8-bc97f8a17ede` (worker `bornclock-staging`)
- **Unit suite:** baseline **155 files / 1888 tests pass** → after run **155 / 1888 pass**
  (no fewer passing than baseline).

---

## Scope — every MYSTIC route finished (21 routes / 20 page files)

Routes taken from `docs/part-ap-design-system.md` §mystic (21), cross-checked against
`App.tsx`. The mapping-document correction (Western/Chinese zodiac, tarot, numerology,
compatibility, biorhythm and their articles/answers belong to MYSTIC, not VEDIC) was
already applied in the design doc and is honoured here: the 7 routes reassigned out of
VEDIC are migrated in this run. All pages moved onto `@/components/central` layouts with
`theme="mystic"`; content, calculations, prices, paywall/report-price gating, SEO,
JSON-LD and every `data-testid` unchanged.

| # | Route | Page file | Layout | Before → After |
|---|---|---|---|---|
| 1 | /numerology | NumerologyPage.tsx | Collection | was `.paj atlas` (approved) → shell-swapped, identical look |
| 2 | /numerology/:number (e.g. /numerology/7) | NumerologyNumber.tsx | Tool | bg-background+Nav/Footer → ToolLayout; not-found branch wrapped too |
| 3 | /numerology-hindi | HindiNumerology.tsx | Tool | bg-gradient-cosmic → ToolLayout |
| 4 | /hi/numerology-by-date-of-birth | articles/HindiNumerologyArticle.tsx | Article | bg-white `<main>` → ArticleLayout |
| 5 | /name-numerology | NameNumerologyPage.tsx | Tool | was `.paj` (approved) → shell-swapped, identical |
| 6 | /biorhythm | BiorhythmPage.tsx | Tool | bg-white+Nav → ToolLayout |
| 7 | /compatibility | CompatibilityPage.tsx | Tool | was `.paj atlas` (approved) → shell-swapped |
| 8 | /compatibility/:s1/:s2 (e.g. /compatibility/aries/leo) | CompatibilityPage.tsx | Tool | same component; pair route + carry-forward intact |
| 9 | /tarot-card-by-birthday | TarotByBirthday.tsx | Tool | bg-white+Nav → ToolLayout |
| 10 | /zodiac | Zodiac.tsx | Collection | bg-background+Nav/Footer → CollectionLayout |
| 11 | /zodiac/:sign (e.g. /zodiac/aries) | ZodiacSign.tsx | Collection | both main + not-found branches wrapped |
| 12 | /chinese-zodiac | ChineseZodiac.tsx | Collection | bg-gradient-cosmic → CollectionLayout |
| 13 | /chinese-zodiac/:animal (e.g. /chinese-zodiac/dragon) | ChineseZodiacSign.tsx | Collection | invalid-slug `<Navigate>` preserved |
| 14 | /answers/what-is-my-zodiac-sign | answers/WhatIsMyZodiacSign.tsx | Article | AnswerLayout → ArticleLayout |
| 15 | /answers/what-is-my-life-path-number | answers/WhatIsMyLifePathNumber.tsx | Article | AnswerLayout → ArticleLayout |
| 16 | /articles/numerology-by-date-of-birth | articles/NumerologyArticle.tsx | Article | bg-white `<main>` → ArticleLayout |
| 17 | /articles/life-path-number-compatibility | articles/LifePathCompatibilityArticle.tsx | Article | bg-white `<main>` → ArticleLayout |
| 18 | /articles/biorhythm-calculator | articles/BiorhythmArticle.tsx | Article | bg-white `<main>` → ArticleLayout |
| 19 | /articles/tarot-card-by-date-of-birth | articles/TarotByDateOfBirthArticle.tsx | Article | bg-white `<main>` → ArticleLayout |
| 20 | /articles/zodiac-compatibility | articles/ZodiacCompatibilityArticle.tsx | Article | bg-white `<main>` → ArticleLayout |
| 21 | /articles/chinese-zodiac-by-year | articles/ChineseZodiacArticle.tsx | Article | bg-white `<main>` → ArticleLayout |

Recipe: swap the hand-rolled shell (outer `div`/`site-header`/`breadcrumb`/`site-footer`,
or `min-h-screen`+`Navigation`+`Footer`, or `AnswerLayout`, or a bare `<main>`) for the
central layout; lift the hero (eyebrow · H1 · lead) into layout props; keep all inner
sections, embedded calculators, schema `<script>`s and test-ids as children. The 3 pages
already on `.paj` (numerology, name-numerology, compatibility — the approved visual
standard) look identical after the swap (before/after screenshots in the contact sheet).

---

## Step-2 test results — Step-0 harness, 21 routes × 3 browsers (63 rows)

Chromium desktop 1440, WebKit (iPhone 13) 390, Android Chrome (Pixel 5) 390, on the fresh
deploy `de22cbfd`:

- **Status / structure:** 63/63 rows → HTTP **200**, exactly **one `<h1>`**,
  `data-theme=mystic` (and `data-category=mystic` for `.paj` coexistence), site header +
  single `<main id="main">` + footer. 0 structural failures.
- **Console errors:** 0 real errors. 5 rows intermittently logged one `429` from the
  third-party geolocation call `https://ipapi.co/json/` (currency/region) — reproduced to be
  a **rate-limit from the 63-page crawl**, not a page defect: loaded in isolation,
  `/compatibility`, `/compatibility/aries/leo` and `/tarot-card-by-birthday` are **CLEAN**
  (INV-M5). Pre-existing external dependency, not introduced by this run.
- **Accessibility (axe, serious/critical):** after fixes, **0** serious/critical violations
  other than the pre-existing project-wide `color-contrast` (INV-2 — shared shadcn tokens,
  present on migrated and non-migrated pages alike; a central token change, out of scope for
  a per-page layout migration). The two real criticals/serious surfaced by the scan were
  fixed (BUG-M1, BUG-M2) and re-verified cleared on the fresh deploy.
- **JSON-LD:** `validator.schema.org` was externally unavailable this run (returned an HTML
  page, not JSON) so the online validation could not run and is **not** reported as passed
  (INV-M4). The harness's structural fallback parsed every `application/ld+json` block on all
  21 routes × 3 browsers: **0 parse errors, 0 missing `@type`** (7–9 valid blocks per page).
- **Layout acceptance (chromium 1440):** single H1 + header block from the layout on every
  page; H1 + lead present in prerendered HTML before JS. The `blankBand` heuristic flags a
  side band >160px on 6 routes (208–384px) — these are the **centered-tool/reading-column
  exception** (the band is the calculator/reading column's side margin, with a full-width
  header block above and full-width content/grids below), the same triage accepted in the
  VEDIC (rashi-ratna 310px) and BIRTHDAY runs. Visually confirmed on the contact-sheet
  screenshots (e.g. `/name-numerology`, `/compatibility`): a correct centered form, not an
  empty side column.

### Positive / negative / edge inputs (live staging, chromium)
- **Positive:** `/numerology/7` → 200, H1 "The Seeker" (Life Path 7 profile). `/compatibility`
  interactive journey — selected Aries + Leo, clicked Check → result "Are Aries and Leo
  compatible?" rendered. `/compatibility/aries/leo` pair page renders the pair result.
- **Negative / invalid generated routes (no crash):** `/zodiac/notasign` → 200, styled
  "Sign Not Found" (mystic theme, site header), 0 page errors; `/numerology/99` → 200, styled
  "Number Not Found", 0 errors; `/chinese-zodiac/notanimal` → client `<Navigate>` to the
  Chinese Zodiac Calculator, 0 errors; `/compatibility/foo/bar` → 200, the pre-existing
  bespoke `invalidPair` not-found shell ("That zodiac pairing doesn't exist", noindex,
  intentionally left byte-for-byte), 0 errors. These soft-404s (200 status, styled content,
  never a crash/blank) are the pre-existing SPA behaviour documented as INV-3 in the BIRTHDAY
  run; the migration preserved it exactly.
- **Interactive pieces:** the two compatibility sign `<select>`s work by keyboard/mouse
  after the aria-label fix; the embedded calculators on the article pages (numerology, life-
  path compat, biorhythm, tarot) retain their state/test-ids unchanged.

---

## Step-3 full retest (fresh deploy `de22cbfd`)

1. **MYSTIC pages, all 3 browsers:** re-ran after the late a11y fixes — 63/63 rows 200 ·
   single h1 · theme=mystic · 0 real console errors · **0 non-color-contrast axe** · 0
   structural JSON-LD errors. A late fix did not break an earlier MYSTIC page.
2. **Earlier-moved pages (chromium):** VEDIC (22 routes) and BIRTHDAY (32 routes) re-run →
   **0 flagged** (excluding the pre-existing color-contrast and the external ipapi 429). No
   regression from the MYSTIC work.
3. **Cross-group regression (chromium, 13 routes incl. home/pricing/science/birthday/vedic):**
   0 flagged. **Code proof pages outside the group are unchanged:** `git diff ea192e1..HEAD`
   touches only the 20 MYSTIC page files under `src/` (plus docs/screens, `scripts/
   mystic-routes.json`, the bug log) — no non-MYSTIC source changed, so those pages are
   byte-for-byte identical and look the same.
4. **Full unit suite:** `vitest run` → **155 files / 1888 tests pass** — equal to the Step-00
   baseline (no fewer passing).

---

## Bugs found & fixed (full detail in `docs/migration-bugs.md`)

- **BUG-M1** (critical, fixed): `/compatibility` two sign `<select>` had no accessible name
  (axe `select-name`, 2 nodes, all browsers + pair pages). Added `aria-label`. Re-verified
  cleared. (Same class as VEDIC BUG-V1 / BIRTHDAY BUG-B2.)
- **BUG-M2** (serious, fixed): `/articles/tarot-card-by-date-of-birth` two `overflow-x-auto`
  table regions not keyboard-focusable on mobile (axe `scrollable-region-focusable`). Added
  `tabIndex`/`role`/`aria-label` to both. Re-verified cleared. (Same class as BIRTHDAY BUG-B4.)
- **BUG-M3** (build-time, fixed pre-deploy): `ChineseZodiacArticle` shell swap left an
  unclosed `</main>`/`</>` — caught by the post-migration unit run (1888→1874) BEFORE any
  deploy; closed with `</section></ArticleLayout>`; suite back to 1888/1888.
- **INV-M4** (external tool): validator.schema.org returned HTML, not JSON — online JSON-LD
  validation unavailable this run; structural fallback passed (0 errors). Reported honestly,
  not claimed as validated.
- **INV-M5** (external, transient): ipapi.co `429` under the rapid crawl; pages clean in
  isolation. Pre-existing geolocation dependency, not a migration defect.
- **INV-2** (pre-existing, out of scope): project-wide `color-contrast` from shared shadcn
  tokens — a central token fix for the NEUTRAL/FINAL consolidation run, not a per-page change.

---

## Pages to look at (staging)

https://bornclock-staging.usdvisionai.workers.dev — try `/numerology`, `/numerology/7`,
`/name-numerology`, `/compatibility`, `/compatibility/aries/leo`, `/biorhythm`,
`/tarot-card-by-birthday`, `/zodiac`, `/zodiac/aries`, `/chinese-zodiac`,
`/chinese-zodiac/dragon`, `/answers/what-is-my-life-path-number`, and the six
`/articles/*` numerology/zodiac/tarot/biorhythm pages. Contact sheet:
`docs/migration-screens/mystic/index.html`.

## Remaining in MYSTIC

**None.** All 21 MYSTIC routes are on the central system and verified. Remaining groups for
future runs: SCIENCE, NEUTRAL (then FINAL) — not part of this run.
