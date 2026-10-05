# Migration — Bug Log (Rule 6)

Format: group · page · what broke · cause · fix · retest.
Supersedes `docs/run1-bugs.md` (carried over below).

## VEDIC run

### BUG-V1 — `/muhurat` two `<select>` with no accessible name (axe `select-name`, critical)
- Where: `/muhurat` — the "Occasion" and "Look ahead" `<select>` elements. Their
  visible `<label>`s were not programmatically associated (no `htmlFor`/`id`), so axe
  flagged a **critical** `select-name` violation (2 nodes) on live staging. Pre-existing
  in the page content; surfaced by the Step-0 axe scan during this run.
- Cause: the labels lacked `htmlFor`, and the selects lacked `id`/`aria-label` — unlike
  the sibling date/city inputs on the same form, which already use `htmlFor`+`id`.
- Fix: added `id` + `aria-label` to each `<select>` and `htmlFor` to each `<label>`
  (`src/pages/MuhuratPage.tsx`). No logic, content or styling change.
- Retest (fresh deploy `021246c3`, chromium/webkit/android): `/muhurat` axe now reports
  only `color-contrast` (INV-2), **no `select-name`** — critical cleared. Muhurat still
  200 · single h1 · theme=vedic · 0 console errors; unknown-city negative path still
  blocks submit with no crash; full unit suite unchanged (1888/1888).

_(other bugs logged here as found during Step 2/3 verification)_

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
