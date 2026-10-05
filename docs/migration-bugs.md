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

## BIRTHDAY run

### BUG-B1 — `/family` rendered no central shell (theme=null, no site header/main)
- Where: `/family` (FamilyDashboard). The page is **feature-flag-disabled for launch**
  (`FAMILY_DASHBOARD_ENABLED = false`), so the ONLY reachable branch was a bare
  `min-h-screen` "coming soon" card with no `.paj` root — the Step-0 harness read
  `data-theme=null`, `hasSiteHeader=false`, `singleMain=0`. The migration had moved the
  deeper (auth/premium/loaded) branches onto `ToolLayout` but not this always-on one.
- Cause: the feature-flag early-return predates the migration and was the live path.
- Fix: migrated the feature-flag-disabled branch to `ToolLayout` (theme=birthday,
  eyebrow/h1/lead + breadcrumb + footer), coming-soon content kept as children. No flag
  logic changed (still disabled). `src/pages/FamilyDashboard.tsx`.
- Retest (fresh deploy): `/family` → 200 · single h1 · data-theme=birthday · site header +
  single `<main>` · 0 console errors on all 3 browsers.

### BUG-B2 — `/birthday-report` Country `<select>` had no accessible name (axe `select-name`, critical)
- Where: the gifter/report form Country `<select>` — visible `<label>` not associated.
  Pre-existing page content, surfaced by the Step-0 axe scan. Same class as VEDIC BUG-V1.
- Fix: `htmlFor="birthday-report-country"` on the label, `id` + `aria-label="Country"` on
  the select (`src/pages/BirthdayReport.tsx`). No logic/content/style change.
- Retest (fresh deploy): birthday-report axe no longer reports `select-name`.

### BUG-B3 — `/leaderboard` three filter dropdowns had no accessible name (axe `button-name`, critical, 3 nodes)
- Where: the Country / Age-group / Sort Radix `SelectTrigger`s (rendered as
  `role=combobox` buttons) had no label. Pre-existing content, surfaced by axe.
- Fix: added `aria-label` to each of the three `SelectTrigger`s
  (`src/pages/Leaderboard.tsx`). No logic/content change.
- Retest (fresh deploy): leaderboard axe no longer reports `button-name`.

### BUG-B4 — `/celebrity/:slug` scrollable table regions not keyboard-focusable (axe `scrollable-region-focusable`, serious, mobile only)
- Where: the "Birthday & Personal Facts" and "Planetary positions" `overflow-x-auto`
  table wrappers overflow at 390px with no focusable children, so they were not keyboard
  scrollable. Pre-existing content, surfaced at mobile viewport by the axe scan.
- Fix: added `tabIndex={0}` + `role="region"` + `aria-label` to both table wrappers
  (`src/pages/CelebrityPage.tsx`). No data/content change.
- Retest (fresh deploy): celebrity profile axe no longer reports
  `scrollable-region-focusable` (only the pre-existing INV-2 `color-contrast` remains).

### INV-3 — invalid BIRTHDAY generated routes return 200 (client `<Navigate>` soft-404), not a real 404 status
- Where: invalid `/born-on/:slug`, `/celebrity/:slug`, `/born-on/:m/:d` etc. The pages
  parse/validate params and, when invalid, do a client-side `<Navigate to="…" replace />`
  redirect (or a soft "not found" branch). This is PRE-EXISTING SPA behaviour: the
  Cloudflare worker serves 200 for every path and React decides what to render, so there
  is no real HTTP 404 for unknown template params.
- Status: documented honestly (Fifth Rule). The migration preserved the existing
  redirect/soft-404 logic byte-for-byte — it did not introduce or worsen this. Emitting a
  real 404 status for infinite generated templates requires worker-level route awareness
  (a server change), which is out of scope for a per-page layout migration and risky to
  the SPA. Flagged for the NEUTRAL/FINAL run (which owns 404/error states) to decide.
  Measured HTTP statuses for invalid routes are recorded in the BIRTHDAY report.

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
