# VEDIC — Migration Run Report

**VEDIC COMPLETE: YES** — all 20 VEDIC routes (plus 2 adjacent Vedic-themed routes,
22 total) are on the central system and pass the full Step-0 + Step-3 matrix on live
staging across Chromium, WebKit (iPhone Safari) and Android Chrome emulation.

Staging: **https://bornclock-staging.usdvisionai.workers.dev** · worker
`bornclock-staging` · version **`021246c3-a438-4416-be2d-c347d4535260`**.
Production, `main` and `develop` were untouched; no Cloudflare token added to GitHub.

---

## Scope & correction (Step 1)

VEDIC had 27 candidate routes in `docs/part-ap-design-system.md`. Per the run's Step-1
correction, the western/Chinese-zodiac routes (and their articles/answers) were
reassigned to **MYSTIC**, leaving **20 VEDIC routes**. The mapping doc reflects this.

- Reassigned VEDIC→MYSTIC (not touched here): `/zodiac`, `/zodiac/:sign`,
  `/chinese-zodiac`, `/chinese-zodiac/:animal`, `/answers/what-is-my-zodiac-sign`,
  `/articles/zodiac-compatibility`, `/articles/chinese-zodiac-by-year`.

The 20 canonical VEDIC routes, plus `/astrologer` and `/career-report` (Vedic-themed,
migrated and verified alongside this group), make up the **22 routes** verified below
(`scripts/vedic-routes.json`).

---

## Pages finished this run (22) — before/after

Every page was moved onto `@/components/central` with `theme="vedic"` (gold `#C6A15B`).
For pages already on the `.paj` system the migration swapped the hand-rolled shell
(outer div + `<header>` + breadcrumb + `<footer>` + font `<Helmet>`) for `PajPage`,
leaving every inner section, calculation, birth-detail carry-forward, glossary term,
paid-report block and `data-testid` unchanged — so output and gating are identical
(proven by the unchanged unit suite + the live journey tests below). Pages not yet on
`.paj` adopted the layout's header block, content grid and spacing properly.

**After (live staging, fresh deploy `021246c3`): all 22 → HTTP 200 · single `<h1>` ·
`data-theme="vedic"` · 0 console errors, on Chromium + WebKit + Android.**

| # | Route | Layout | Live-staging result (all 3 browsers) |
|---|---|---|---|
| 1 | /vedic-astrology (hub) | Hub/editorial | 200 · h1=1 · vedic · 0 err |
| 2 | /kundali | Report | 200 · h1=1 · vedic · 0 err |
| 3 | /muhurat | Tool | 200 · h1=1 · vedic · 0 err |
| 4 | /sade-sati | Tool | 200 · h1=1 · vedic · 0 err |
| 5 | /gemstones | Tool | 200 · h1=1 · vedic · 0 err |
| 6 | /kundali-match | Report | 200 · h1=1 · vedic · 0 err |
| 7 | /rashi-ratna | Tool | 200 · h1=1 · vedic · 0 err |
| 8 | /rashifal-by-date-of-birth | Tool | 200 · h1=1 · vedic · 0 err |
| 9 | /sun-vs-moon-sign | Tool | 200 · h1=1 · vedic · 0 err |
| 10 | /moon-sign | Tool | 200 · h1=1 · vedic · 0 err |
| 11 | /vedic-zodiac | Collection | 200 · h1=1 · vedic · 0 err |
| 12 | /vedic-zodiac/:rashi (mesha) | Collection | 200 · h1=1 · vedic · 0 err |
| 13 | /hi/rashifal | Tool/Hindi | 200 · h1=1 · vedic · 0 err |
| 14 | /hi/rashifal/:rashi (mesh) | Tool/Hindi | 200 · h1=1 · vedic · 0 err |
| 15 | /answers/what-is-my-moon-sign | Tool | 200 · h1=1 · vedic · 0 err |
| 16 | /answers/what-is-vedic-astrology | Tool | 200 · h1=1 · vedic · 0 err |
| 17 | /articles/moon-sign-by-date-of-birth | Article | 200 · h1=1 · vedic · 0 err |
| 18 | /articles/vedic-astrology-birth-chart | Article | 200 · h1=1 · vedic · 0 err |
| 19 | /articles/nakshatra-by-date-of-birth | Article | 200 · h1=1 · vedic · 0 err |
| 20 | /articles/kundali-compatibility | Report | 200 · h1=1 · vedic · 0 err |
| 21 | /astrologer | Tool | 200 · h1=1 · vedic · 0 err |
| 22 | /career-report | Report | 200 · h1=1 · vedic · 0 err |

**Layout acceptance rules (hydrated DOM, chromium 1440):** single `<h1>` and the
layout's header block on every page; H1 above the fold on all 22; H1 + lead present in
the prerendered HTML before JS (verified in `dist`). Three pages flag a side band
>160px in the automated heuristic — `/rashi-ratna` (310px), `/vedic-zodiac` and
`/vedic-zodiac/:rashi` (208px) — all three are the **reading-column / centered-form
exception**: Rashi Ratna is an editorial reading column (the band is its right margin),
and Vedic Zodiac has a two-column header (H1 + lead) over a centered DOB form with a
full-width 12-rashi grid below (the band is the form's side margin). Visually confirmed
acceptable, not empty side columns — screenshots in the contact sheet.

**JSON-LD:** validated via validator.schema.org (chromium) — **0 errors on all 22
routes**; every page's structured-data blocks parse with no missing `@type`.

---

## Test results (per browser)

Harness: `scripts/migration-verify.mjs` (Chromium 1440, WebKit/iPhone 13 390, Android
Chrome/Pixel 5 390). Raw: `docs/migration-screens/vedic/verify.json`; contact sheet:
`docs/migration-screens/vedic/index.html`.

| Check | Chromium | WebKit (iPhone) | Android |
|---|---|---|---|
| HTTP 200 | 22/22 | 22/22 | 22/22 |
| Single `<h1>` | 22/22 | 22/22 | 22/22 |
| `data-theme=vedic` | 22/22 | 22/22 | 22/22 |
| 0 console/page errors | 22/22 | 22/22 | 22/22 |
| axe serious/critical (excl. pre-existing `color-contrast`) | 0 | 0 | 0 |
| JSON-LD errors (validator.schema.org) | 0/22 | — | — |

**Positive / negative / edge / journey** (live, real browser — `scripts/vedic-journey.mjs`,
`docs/migration-screens/vedic/journey/`): **13/13 passed** on the fresh deploy.

- **Positive:** `/vedic-zodiac` DOB 15/08/1990 → correct sidereal Rashi result renders
  (pure client calc), 0 errors.
- **Negative:** `/kundali` empty submit → generate button disabled + validation hint,
  no crash; `/kundali` future DOB 2099 → handled, no crash; `/muhurat` unknown city
  ("zzzznotacity") → no options, Find button stays disabled, no crash. (Native date
  inputs structurally prevent impossible dates like 31 Feb — the "clear message, never
  a crash" outcome.)
- **Edge:** leap-day 29/02/2000 → result, no crash; year 1900 → result, no crash;
  Hindi `/hi/rashifal` renders Devanagari with 0 errors.
- **Journeys (carry-forward & gating):** with a full saved birth profile seeded,
  `/kundali` shows the saved-profile banner, `/kundali-match` pre-fills person A,
  `/astrologer` passes the no-profile gate into the chat UI (suggested prompts + the
  "reflection and entertainment, not medical/legal/financial" guardrail visible), and
  `/career-report` renders the premium-depth report with birth details carried
  (15/08/1990, 10:30, Delhi), no crash. **Without** a profile, `/astrologer` shows the
  add-details prompt and `/career-report` shows its form/paywall — gating preserved.
  (Verified visually: `05c`, `05d`, `06a`, `06b` screenshots.)

---

## Step 3 — full retest + regression

On the fresh staging deploy `021246c3` (after the only fix, BUG-V1):

1. **Step-0 harness re-run on all 22 finished pages × 3 browsers** → all pass (table
   above). The 5 earlier-run (Run-1) pages — `/vedic-astrology`, `/kundali`,
   `/muhurat`, `/sade-sati`, `/gemstones` — are included and pass on all 3 browsers.
2. **Journey re-run** → 13/13 pass.
3. **Regression (pages NOT in this group) before vs after** — `scripts/regression-compare.mjs`
   pixel-diff of 8 non-group routes × 2 browsers (16 shots) vs the Step-00
   `regression-before` baseline: **13 SAME, 3 MINOR (<2.8%), 0 CHANGED.** The 3 minor
   diffs (`/` chromium, `/numerology` webkit, `/biological-age` webkit) are live
   real-time counter values and mobile anti-aliasing, not layout changes — confirmed by
   eyeballing `/` before/after (identical layout; only the day/age counters differ).
   `docs/migration-screens/regression-after/regression-diff.json`.
4. **Full automated unit suite** → `vitest run` = **155 files / 1888 tests pass**, equal
   to the Step-00 baseline (no fewer passing tests).

---

## Suite count vs baseline

Baseline (Step 00): **155 files / 1888 tests pass.**
After the run (incl. the BUG-V1 fix): **155 files / 1888 tests pass.** No change.

---

## Bugs found & fixed

- **BUG-V1 — `/muhurat` two `<select>` with no accessible name** (axe `select-name`,
  critical, 2 nodes). Fixed by adding `id` + `aria-label` to each select and `htmlFor`
  to each label (`src/pages/MuhuratPage.tsx`) — no logic/content/style change. Retested
  on fresh deploy: cleared (muhurat axe now only `color-contrast`). Logged in
  `docs/migration-bugs.md`.
- **INV-2 — `color-contrast` serious (pre-existing, project-wide)** — present on every
  page including non-migrated regression pages, from the shared shadcn
  `muted-foreground`/accent tokens. Not introduced by this run; it is a central
  design-token change affecting all themes, deferred to the NEUTRAL/FINAL
  token-consolidation run. Tracked in `docs/migration-bugs.md`.

---

## Staging URL & pages to look at

**https://bornclock-staging.usdvisionai.workers.dev** (worker `bornclock-staging`,
version `021246c3-a438-4416-be2d-c347d4535260`). Suggested:
`/vedic-astrology` (hub) → `/kundali` → `/kundali-match` → `/sade-sati` → `/muhurat`;
`/vedic-zodiac`, `/rashi-ratna`, `/hi/rashifal`, `/astrologer`, `/career-report`.
Contact sheet: `docs/migration-screens/vedic/index.html`.

## Remaining pages

**None for VEDIC.** All 20 canonical VEDIC routes (plus `/astrologer`,
`/career-report`) are migrated and verified. Next group (MYSTIC) picks up the 7
western/Chinese-zodiac routes reassigned out of VEDIC.
