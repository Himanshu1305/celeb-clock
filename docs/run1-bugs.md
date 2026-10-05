# Run 1 — Bug Log (Rule 5)

Format: what broke · where · cause · fix · retest.

_No bugs yet._

## INV-1 — Prerendered HTML shows two `<h1>` (investigated — NOT a bug)
- Where: dist/*/index.html for migrated AND non-migrated pages alike.
- Finding: non-migrated pages (/zodiac, /numerology, /life-expectancy, /age-calculator)
  show the same 2 `<h1>` in the static prerendered HTML — it is the pre-existing
  Part AO prerender LCP-h1 technique, present project-wide, not introduced by this run.
- Hydrated DOM: the live staging check (scripts/run1-verify.mjs) shows **h1Count=1**
  on every migrated page, and the central unit tests assert exactly one `<h1>` per
  layout. No fix needed.
