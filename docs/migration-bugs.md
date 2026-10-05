# Migration — Bug Log (Rule 6)

Format: group · page · what broke · cause · fix · retest.
Supersedes `docs/run1-bugs.md` (carried over below).

## VEDIC run

_(bugs logged here as found during Step 2/3 verification)_

### INV-2 — axe `color-contrast` serious violations (investigated)
- Where: present on the already-migrated run-1 page `/kundali` (6 nodes) and on
  non-migrated regression pages alike — i.e. pre-existing, project-wide, from the
  shared shadcn `muted-foreground` / accent tokens, NOT introduced by this run.
- Status: tracked. A site-wide token contrast fix is a central design-system change
  (affects every theme/page), out of scope for a per-page layout migration; logged
  here so the NEUTRAL/FINAL token-consolidation run can address it once centrally.

## Carried over from run 1 (`docs/run1-bugs.md`)

### INV-1 — Prerendered HTML shows two `<h1>` (investigated — NOT a bug)
- Non-migrated AND migrated pages alike show 2 `<h1>` in the static prerendered HTML
  — the pre-existing Part AO prerender LCP-h1 technique, project-wide. The hydrated
  DOM has a single `<h1>` on every migrated page (verified live). No fix needed.
