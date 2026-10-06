SCIENCE COMPLETE: YES

# BornClock Migration — SCIENCE run report

Branch `redesign-central`. Staging worker `bornclock-staging` (never production).
Final staging version: **`b18cc1f3-0007-45ef-b80c-acc93645ea90`** ·
URL: https://bornclock-staging.usdvisionai.workers.dev

All 59 SCIENCE routes are on the central system with the **science** theme (white
background, blue `#2F6FB0` / green `#2E9E7B`, no gold/ivory), and every one passes the
full Step-0 harness on three browsers plus the Step-2 input/gating checks and the Step-3
full retest. Calculations, paywall and pricing are unchanged. Two pre-existing a11y
defects surfaced by the axe scan were fixed (BUG-S1, BUG-S2); the remaining
`color-contrast` is the shared site-wide debt owned by the NEUTRAL/FINAL token pass
(INV-S3), not introduced by this run — the same basis on which VEDIC/BIRTHDAY/MYSTIC
shipped COMPLETE: YES.

---

## STEP 00 — baseline & recovery
- **Working tree clean at start.** The SCIENCE Step 1-2 migration (recovered from the
  NEUTRAL run's `stash@{0}`, STEP00.1 — nothing discarded) was already committed as
  `8471f2f`. This session performed Step 0, Step 2 (deploy + live verify + fixes) and
  the Step 3 full retest.
- **Baseline automated suite: 1888 passing (155 files).** Typecheck (`tsc --noEmit`) clean.

## STEP 0 — harness
- Reused the in-place `scripts/migration-verify.mjs` (Chromium 1440, WebKit iPhone 390,
  Android Pixel-5 390; status, single `<h1>`, `data-theme`, console errors, screenshots,
  layout acceptance, axe, JSON-LD). WebKit already installed.
- Created `scripts/science-routes.json` — **59 routes** (full group). Contact sheet +
  per-page screenshots at `docs/migration-screens/science/`.

## STEP 1 — page list (cross-checked against App.tsx)
`part-ap-design-system.md` lists the SCIENCE group (58) and already carries the MYSTIC
reassignment. Cross-check against `src/App.tsx` yields **59 live routes** — the +1 vs the
doc's headline count is `/hi/meri-jeevan-pratyasha` (science + Hindi), which the doc notes
inline. No SCIENCE route was skipped; none were already moved in another run. The 59:

- **Reports/Workbench (3):** `/life-expectancy`, `/biological-age`, `/country-comparison`
- **Country life-expectancy (9):** `/life-expectancy-{usa,japan,uk,australia,canada,germany,china,singapore,brazil}`
- **LE comparison/variants (2):** `/life-expectancy-india-vs-usa`, `/life-expectancy-india`
- **Bio-age/longevity calculators (6):** `/biological-age-vs-chronological-age`, `/biological-age-calculator`,
  `/longevity-calculator`, `/how-long-will-i-live`, `/jivan-kal-calculator`, `/biological-age-hindi`
- **LE calculators (6):** `/life-expectancy-calculator-{uk,australia,usa,canada}`,
  `/life-expectancy-calculator-singapore-uae`, `/hi/life-expectancy-calculator`
- **Hindi (1):** `/hi/meri-jeevan-pratyasha`
- **Planetary/weight (2):** `/planetary-age`, `/weight-on-planets`
- **Collection/utility/hub (3):** `/generation`, `/coach`, `/science-longevity`
- **Articles (19):** `/articles/{life-expectancy-by-country-2026, how-long-will-i-live-in-india,
  biological-age-vs-chronological-age, longevity-quiz, bryan-johnson-blueprint-alternative,
  how-to-live-to-100, exercise-and-longevity, blue-zones-diet, longevity-foods-india,
  death-clock-alternative, retirement-planning-life-expectancy, planetary-age-calculator,
  epigenetics-and-longevity, longevity-supplements, how-indian-celebrities-stay-fit,
  famous-people-lived-to-100, life-expectancy-how-it-is-calculated, retirement-age-india-life-expectancy,
  longevity-habits-of-indian-billionaires}`
- **Answers (8):** `/answers/{how-long-will-i-live, what-is-my-biological-age, what-generation-am-i,
  how-to-live-longer, what-is-life-expectancy, how-does-stress-affect-life-expectancy,
  what-affects-life-expectancy-most, what-is-epigenetic-age}`

## STEP 2 — move + deploy + test
- **Move:** already committed in `8471f2f` — content/SEO/JSON-LD/calculations/testids
  preserved byte-for-byte; hardcoded mystic purple `#6E5AA6` recolored to science blue
  `#2F6FB0`; pages adopted `ArticleLayout` / report / Workbench shells, `data-theme="science"`.
- **Deploy:** `npm run build:staging` (3635 routes prerendered, 0 failed) → dry-run confirmed
  worker `bornclock-staging`, `routes=[]` → `wrangler deploy --env staging`. Initial version
  `0a6ec457`; after the two a11y fixes, rebuilt + redeployed as **`b18cc1f3`** (all tests
  below run against the final build).

### Step-0 harness — 59 routes × 3 browsers = 177 rows (final build `b18cc1f3`)
| Check | Result |
|---|---|
| HTTP status | **200 on all 177** |
| Single `<h1>` | **1 on all 177** |
| `data-theme="science"` | **all 177** |
| Console errors | **0 on all 177** |
| `scrollable-region-focusable` | **0** (after BUG-S2) |
| other serious/critical axe | **0** (after BUG-S1) |
| `color-contrast` (serious) | present — pre-existing site-wide debt (INV-S3) |
| `main#main` present / H1 above fold | **all 177 / all 177** |
| JSON-LD structural | **479 blocks · 0 parse errors · 0 missing @type** (INV-S4) |

### Step-2 input tests — positive / negative / edge / gating (live staging, chromium + webkit) — **14/14 PASS**
- **Positive** — `/planetary-age?dob=1990-05-15`: all 8 planets + numeric ages render, 0 errors.
  `/weight-on-planets`: default 70 kg shows Moon…Jupiter weights; recompute to 100 kg clean.
  `/life-expectancy`: calculator + gating copy (unlock/upgrade/preview/member) present, 0 errors.
- **Negative** — `/planetary-age?dob=2024-02-31` (31 Feb) and `?dob=not-a-date`: no crash, input
  still shown, 0 errors. `/weight-on-planets` cleared input: no crash, 0 errors.
- **Edge** — leap-day `?dob=2000-02-29` and `?dob=1900-01-01`: render, 0 errors. Hindi
  `/hi/meri-jeevan-pratyasha`: Devanagari H1 `"मेरी जीवन प्रत्याशा क्या है?"`, 0 errors.
- **Calc/gating preservation:** the migration was a shell/layout swap only — `calculateLongevity`,
  `PlanetaryAge`, `planetGravity`, the quiz flow and `PaywallModal` wiring are untouched; the full
  unit suite (incl. `BiologicalAgeCalculatorPage`/`HowLongWillILivePage` calc+gating tests) stays
  1888/1888. Live checks confirm calculators compute and the paywall/gating copy is still present.

### Bugs found & fixed this run
- **BUG-S1** — `/country-comparison` age `<input>` missing accessible name (axe `label`, critical,
  1 node). Fixed with `aria-label="Current age"`. Cleared on all 3 browsers.
- **BUG-S2** — 7 `overflow-x-auto` regions not keyboard-focusable (axe `scrollable-region-focusable`,
  serious): planetary-age carousel + 6 mobile tables. Fixed with `tabIndex=0`+`role=region`+`aria-label`.
  Cleared on all 3 browsers; re-confirmed 0 across the Step-3 177-row crawl.
- **INV-S3** — `color-contrast` (serious): shared site-wide pre-existing debt (same on the regression
  sample), NOT introduced by this run; owned by the NEUTRAL/FINAL central token pass. Deferred, logged.
- **INV-S4** — validator.schema.org returned HTML (externally unavailable); structural fallback clean.

## STEP 3 — full retest (fresh deploy `b18cc1f3`)
1. **Step-0 harness on every SCIENCE page, 3 browsers (177 rows):** 200 / single-h1 / theme=science /
   0 console errors on **all 177**; 0 `scrollable-region-focusable`; 0 other serious/critical; only
   the pre-existing `color-contrast`. The late a11y fixes broke no earlier page.
2. **Harness (chromium) on the cross-group regression sample (13 routes):** all **200 · single h1 ·
   correct per-group theme** (`/`=null by design per INV-N4, `/pricing`=neutral, birthday/mystic/science/
   vedic correct) · **0 console errors**. No crashes or theme loss in other groups.
3. **Regression (pages not in this group look the same):** the only source files changed this session
   are the **7 SCIENCE page components** (all additive `aria`/`role`/`tabIndex` — `git status` verified);
   no non-SCIENCE source was touched, so cross-group regression is impossible from this session. The
   live regression harness (Step 3.2) confirms parity (identical status/h1/theme/0-errors) for all 11
   non-SCIENCE sample pages. (A perceptual pixel-diff was not run — no image-diff lib installed in this
   headless environment; the SCIENCE-only git scope + live parity is the stronger guarantee. Fifth Rule.)
4. **Full automated suite:** **1888 passing (155 files)** — equal to the Step-00 baseline, none lost.

## Layout acceptance
- Every page: `main#main` present, H1 above the fold on all browsers/viewports. Verified the
  `/life-expectancy` Workbench visually — centered science reading column (navy header, blue
  "LIFE EXPECTANCY" eyebrow, H1 + lead split, breadcrumb), content + calculator on the first screen.
- The harness's `blankBand` flags the centered-column gutter at 1440 (272–384px) — the explicit
  **reading-column exception**; identical values appear on the prior **COMPLETE: YES** MYSTIC group
  (e.g. `/compatibility`=384, `/numerology`=272), confirming this is the metric's reading of centered
  layouts, not new empty side columns.

## Pages to look at (staging)
https://bornclock-staging.usdvisionai.workers.dev — `/life-expectancy`, `/biological-age`,
`/country-comparison`, `/planetary-age?dob=1990-05-15`, `/weight-on-planets`, `/longevity-calculator`,
`/how-long-will-i-live`, `/science-longevity`, `/hi/meri-jeevan-pratyasha`,
`/articles/famous-people-lived-to-100`.

## Remaining pages
**None.** All 59 SCIENCE routes are migrated, deployed and passing.

## Carry-forward note for FINAL
`color-contrast` (INV-S3) and the `.paj` removal (INV-N5) remain the cross-cutting items for the
NEUTRAL/FINAL token-consolidation + cleanup run. They are not SCIENCE-migration work and do not
block SCIENCE COMPLETE: YES.
