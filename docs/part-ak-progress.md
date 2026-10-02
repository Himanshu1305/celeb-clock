# Part AK — Deep Pages & Fixes — Progress Log

Continues on `part-aj-four-page-redesign` (no new branch, no develop). No merge, no deploy. Flags 1/2/3 untouched.

## Part 0 — Audit ✅ (CHECKPOINT)
- Wrote docs/part-ak-audit.md. Result: EVERY deeper tool/report page is OLD design (none use `paj`).
- Tier 2 priority derived: kundali-match → sade-sati → muhurat → gemstones/rashi-ratna → career-report → sun-vs-moon/moon-sign → shared tools.

## Tier 1.1 — Background color / variant-layout fix ✅ (CHECKPOINT)
- ROOT CAUSE found (bigger than a color token): the CSS generator scoped the design-variant
  classes as descendants (`.paj .editorial …`) but editorial/atlas/field-guide/workbench live on
  the SAME element as `.paj` (`class="paj editorial"`). So EVERY variant layout rule silently never
  matched — the editorial 2-col hero collapsed to a stacked full-width WHITE chart panel (the
  "reads white" symptom), and atlas/field-guide heroes likewise fell back.
- Fix: `scripts/build-paj-css.mjs` now attaches the four variant classes to `.paj` with no space
  (`.paj.editorial …`). Regenerated `src/styles/part-aj.css`.
- Verified: `--bg` is #FAF7F0 ivory (was already correct as a token); after the fix the editorial
  (Vedic), field-guide (Birthday) and atlas (Mystic) hero layouts render correctly and the ivory
  canvas now dominates (white is only the surface cards), matching the references. Desktop screenshots confirmed.
