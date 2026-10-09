# FINAL — bug log (combined staging release candidate)

Bugs found during the FINAL full-site test on `bornclock-staging` and their fixes.

## FINAL-BUG-1 — color-contrast (serious) on `.paj em` in tinted CTA boxes
- **Found:** `scripts/final-axe.mjs` on the combined staging deploy (version 7e0cdf35).
  `/planet-in-house/:planet/:house`, `/planet-in-sign/:planet/:sign`, `/yoga/:slug`
  each reported 1 serious `color-contrast` node on Chromium-desktop AND Pixel 5.
- **Element:** `<em>your</em>` inside a `bg-primary/10` CTA box
  (e.g. `YogaPage.tsx:115`). `.paj em` (`src/styles/part-aj.css:29`) recolours `<em>`
  to the vedic `--accent-text` (`#806125`). On the `bg-primary/10` background
  (`#e2e2de`) that is **4.42:1**, just below the 4.5:1 WCAG AA threshold.
- **Fix (source, one place):** darkened the vedic `--accent-text` token from
  `#806125` → `#74571E` (part-aj.css base + `[data-category="vedic"]`, and the
  matching `accentText` in `src/components/central/themes.ts`; the hard-coded
  homepage eyebrows in `Index.tsx` updated to the same shade for consistency).
  New contrast: **5.17:1** on `#e2e2de`, **6.28:1** on the `#FAF7F0` paper — the
  token is only ever a foreground accent, so darkening only ever improves contrast
  everywhere it is used (eyebrows, trust-strip labels, `em`).
- **Retest:** rebuilt, redeployed to `bornclock-staging`, re-ran `final-axe.mjs`
  — 0 serious/critical across all page types × both browsers. (see below)
