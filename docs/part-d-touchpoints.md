# Part D (Reading & Prediction UX) — Phase 0 Touchpoints & Scope Decision

> Deliverable for `docs/BornClock_PartD_ReadingUX_v2.md` Phase 0. Written before
> any feature code. Builds on Part B (`feature/vedic-engine-integration-part-b`).

## 0.1 — What this session's changes touch

### Does reading generation write to any table besides a dedicated readings cache?
- **No new table needed / none created.** `vedic_chart_cache` exists in Supabase
  but has **no migration file in the repo** (created out-of-band), so this
  session cannot reliably provision a brand-new table. Decision: **reuse
  `vedic_chart_cache`** with a namespaced `cache_key` (prefix `reading-…`) and
  `source: 'gemini-reading'`. The `chart_data` JSON column stores the generated
  readings **plus the exact prompt and input chart data** (spec requirement).
  This is additive — **no schema change** (consistent with Part B's rule), and
  no overlap/collision with the chart cache keys (`kundali` uses raw params,
  `vp-…` for profiles; readings use `reading-…`).
- No overlap with existing report-generation code (`BirthdayReportService`
  writes reports to its own `reports` path, unrelated to the chart cache).

### Does anything else already call Gemini for chart-related text?
- **Celebrity bios** (`scripts/generate-celebrity-bios.ts`, `auto-bio-fill.ts`)
  — Gemini for 130-180-word encyclopedic bios. Different purpose/tone.
- **Longevity coach** (`api/longevity-coach.ts`) — Gemini
  (`systemInstruction` + `safetySettings` + graceful degradation), a live
  client→server AI call. This is the **structural pattern** the reading endpoint
  will follow.
- **Decision: keep the reading prompt SEPARATE** (its own module) — astrology
  readings need confidence-aware softening (D60/Sthana/Chesta), life-area
  framing, and dosha de-stigmatization that neither the bio nor coach prompt
  has. But **reuse the coach's proven request shape** (safety settings, block/
  empty → friendly fallback) so we don't re-solve graceful degradation.

### Does the birthday PDF report need this reading content?
- **Out of scope this session.** The only PDF (`longevityBlueprintHtml.ts`) is
  longevity-focused and carries **no** Vedic chart data (confirmed in Part B's
  inventory). Wiring readings into a PDF is a separate future task.

### Every page/component that links to or embeds the new reading sections
1. **`src/pages/KundaliPage.tsx`** — primary home. Already has the birth-details
   form + chart render; the 5 reading sections embed directly below the chart.
   (1 file edited.)

## Integration points (the full list)
| # | Item | New/edited |
|---|------|-----------|
| 1 | `api/vedic-reading.ts` — reading endpoint (chart → Gemini → cache) | NEW |
| 2 | `functions/api/vedic-reading.ts` wrapper + route in `functions/_worker.ts` | NEW/edit |
| 3 | `src/services/readingService.ts` — client caller | NEW |
| 4 | `src/lib/vedic/readingPrompts.ts` — prompt builders + safety guardrails | NEW |
| 5 | `src/components/reading/VedicReading.tsx` (+5 section sub-components) | NEW |
| 6 | `src/pages/KundaliPage.tsx` — embed reading | EDIT (1) |
| 7 | Reuse `vedic_chart_cache` (namespaced key) | no schema change |
| 8 | Unit tests + Playwright specs | NEW |

## Scope decision
**A handful of integration points (≈6), one existing page edited.** This is
**within** Phase 0's "don't stop" threshold (it says stop only if scope is
"significantly more than a handful of integration points"). So I am **proceeding
in this session**, not splitting.

Two honest execution notes (not blockers, surfaced plainly):
- **Gemini key works locally** — verified a live call: model `gemini-flash-latest`
  returns text; `gemini-2.0-flash` is now 404. So **real generated readings can
  be produced and pasted** for the deliverable. Unit tests **mock** Gemini for
  determinism (a live call in CI would be flaky/costly); a **separate live run**
  produces the real pasted text the reviewer asked for.
- **Playwright** runs against a **local `vite preview` (:4173)** via
  `playwright.local.config.ts`; `/api/*` calls are **route-mocked** at the
  Playwright level (the spec explicitly endorses this) so no staging deploy or
  local worker runtime is required.
