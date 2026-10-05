# Run 1 of 6 — Central Design System + Vedic Pages — Report

**RUN 1 COMPLETE: NO — reasons**

The central design system is **built and verified**, and the migration recipe is
**proven and verified on live staging** — but Run 1's scope ("move *every* Vedic
page" + the full Step-3 test matrix) was not finished in-session:

1. **5 of 29 Vedic routes moved** (the core standard pages). The other 24 remain on
   the old `.paj` system — which is valid coexistence, but Run 1 requires all of them.
2. **Test matrix partial:** verified on **Chromium** (live staging) with the full
   unit suite; **WebKit (iPhone Safari) and Android emulation were not run**, nor
   **axe accessibility**, **validator.schema.org JSON-LD validation**, or the full
   **positive/negative/edge input** and **journey** scripts. Reporting those as done
   without running them would violate the Fifth Rule, so they are listed as not done.

Nothing was faked: every "verified" claim below is from the live staging worker
(`scripts/run1-verify.mjs`, `docs/run1-screens/verify.json`) or the test run output.
Production, `main` and `develop` were untouched; no Cloudflare token added to GitHub.

---

## What the central system contains (Step 1 — DONE, 10/10 unit tests)

`src/components/central/` + `src/styles/central/themes.css` + `src/components/central/themes.ts`:

- **Five themes**, one variable-set each, selected by `data-theme` on the `.paj`
  root: **vedic** (gold `#C6A15B` / bronze `#806125`), **birthday** (coral `#F0715A`
  / `#B5432A`), **mystic** (amethyst `#6E5AA6`), **science** (white bg, blue `#2F6FB0`
  / green `#2E9E7B` / `#237A60`), **neutral** (navy/ivory, gold for premium). Shared
  tokens (navy, ivory, ink, hairline, Fraunces + Public Sans) stay central;
  `themes.ts` is the single source and a unit test guards that `themes.css` matches.
  The shell sets **both** `data-theme` (canonical) and `data-category` (so the proven
  generated `.paj` CSS still themes the page during coexistence).
- **Seven layout components** (`layouts.tsx`), each owning the header block
  (breadcrumb + eyebrow · H1 · lead · trust) over a central **`PajPage`** shell
  (`SiteHeader` + `Breadcrumb` + `<main>` + `SiteFooter` + font preload):
  **Tool** (workbench), **Report** (editorial), **Hub** (editorial hero slot),
  **Collection** (atlas), **Article** (editorial), **Money** (editorial),
  **Utility** (plain). Unit tests assert each produces a themed root, a single
  `<h1>`, the breadcrumb, eyebrow and lead.
- **Layout acceptance rules** are enforceable centrally (single H1, header block from
  the layout, correct theme) and checked live below.

## Every Vedic route — moved vs pending

**Moved onto the central system (5), verified on live staging — before/after note:**
each was already a redesigned `.paj` page (the approved look); the migration swapped
its hand-rolled shell (outer div + `<header>` + breadcrumb + `<footer>` + font
`<Helmet>`) for `PajPage`, leaving every inner section, calculation, birth-detail
carry-forward, glossary term, paid-report block and test-id **byte-for-byte the same**
— so they look identical and behave identically (proven: their existing test suites
still pass, and the live render matches the approved design — see the hub + Kundali
screenshots in `docs/run1-screens/`).

| Route | Layout | Status (live staging) |
|---|---|---|
| /vedic-astrology (hub) | Hub/editorial | 200 · h1=1 · theme=vedic · 0 console errors |
| /kundali | Report | 200 · h1=1 · theme=vedic · 0 console errors |
| /muhurat | Tool | 200 · h1=1 · theme=vedic · 0 console errors |
| /sade-sati | Tool | 200 · h1=1 · theme=vedic · 0 console errors |
| /gemstones | Tool | 200 · h1=1 · theme=vedic · 0 console errors |

The Kundali "Birth details" form band keeps a filled left column (heading + hint),
so it does not fail the empty-column rule; no further fix was needed there.

**Pending (24) — still on old `.paj` via `data-category` (coexistence, working):**
/kundali-match, /rashi-ratna, /moon-sign, /sun-vs-moon-sign,
/rashifal-by-date-of-birth, /hi/rashifal, /hi/rashifal/:rashi,
/answers/what-is-my-zodiac-sign, /answers/what-is-my-moon-sign,
/answers/what-is-vedic-astrology, /zodiac, /zodiac/:sign, /chinese-zodiac,
/chinese-zodiac/:animal, /vedic-zodiac, /vedic-zodiac/:rashi,
/articles/moon-sign-by-date-of-birth, /articles/vedic-astrology-birth-chart,
/articles/nakshatra-by-date-of-birth, /articles/zodiac-compatibility,
/articles/chinese-zodiac-by-year, /articles/kundali-compatibility, /career-report,
/astrologer.

## Test results

- **Unit suite:** `vitest run` → **155 files / 1888 tests pass** (includes the new
  central suite and the unchanged Kundali `TC-KUNDALI` regression tests — strong
  evidence the migration preserved behaviour).
- **Central unit tests:** 10/10 — theme selection (all 5 themes, css-in-sync,
  dual-attribute) and each layout's header block (single h1 + breadcrumb + eyebrow +
  lead).
- **Served output (Chromium, live staging, hydrated DOM):** all 5 migrated pages →
  HTTP 200, correct `<title>`, **single `<h1>`**, `data-theme=vedic`, site header +
  footer + single `<main id="main">`, JSON-LD present, **zero console errors**. The 4
  non-migrated regression pages (`/`, `/zodiac`, `/numerology`, `/life-expectancy`)
  still serve 200 with a single h1 and zero errors (`/numerology` still on
  `data-category=mystic` — coexistence confirmed).
- **Speed (prerender):** every migrated page's H1 + lead are in the prerendered HTML
  (verified in `dist/*/index.html`), so the above-the-fold content is present before
  JS runs.
- **Screenshots:** 1440 + 390 for all 9 pages in `docs/run1-screens/` (2.3 MB) —
  open `docs/run1-screens/index.html` for the contact sheet.
- **NOT run this session (hence RUN 1 COMPLETE: NO):** WebKit (iPhone Safari) &
  Android emulation; axe accessibility; validator.schema.org JSON-LD validation;
  the positive/negative/edge input matrix; the Vedic end-to-end journeys
  (hub→Kundli→matching→Sade Sati→Muhurat, paid flow to checkout, AI astrologer);
  interactive-piece touch/keyboard pass.

## Bug log (`docs/run1-bugs.md`)
No bugs. One investigation (**INV-1**): prerendered HTML shows two `<h1>`, but this is
pre-existing project-wide (identical on non-migrated pages — the Part AO LCP-h1
technique); the hydrated DOM has a single `<h1>` on every migrated page (verified
live). No fix needed.

## Staging URL to look at
**https://bornclock-staging.usdvisionai.workers.dev** (worker `bornclock-staging`,
version `a9bd5bbe-b489-40c3-b38a-a5a613da9bbf`). Try `/vedic-astrology`, `/kundali`,
`/muhurat`, `/sade-sati`, `/gemstones`.

## Ready for Run 2 (Birthday & Celebrity) to reuse
- **The whole central layer** is built and theme-agnostic: import `{ PajPage,
  ToolLayout, ReportLayout, HubLayout, CollectionLayout, ArticleLayout, MoneyLayout,
  UtilityLayout }` from `@/components/central` and pass `theme="birthday"`. The
  **birthday theme is already defined** (`data-theme="birthday"`, coral `#F0715A` /
  `#B5432A`) in `themes.css` + `themes.ts`.
- **The proven migration recipe** (per page, ~3 small edits, zero content change):
  1. imports: drop `Navigation`/`AuthNav`/`'@/styles/part-aj.css'` (+ unused `Link`),
     add `import { PajPage } from '@/components/central'`;
  2. replace the opening `<div className="paj …">…<header>…breadcrumb…</div>` +
     `<main id="main">` with `<PajPage theme=… variant=… testId=… seo={…}
     breadcrumb={…} footer={…}>`;
  3. replace the closing `</main>…<footer>…</footer></div>` with `</PajPage>`.
- **The verification harness** `scripts/run1-verify.mjs` (point `BASE` at staging,
  edit the route list) gives the 200 / single-h1 / theme / console-error / screenshot
  report in one command.
- **Recommended for Run 2 to also add** (deferred here): install Playwright WebKit
  (`npx playwright install webkit`) for the iPhone-Safari pass, and wire axe +
  validator.schema.org into the verify script so each run clears the full matrix.
