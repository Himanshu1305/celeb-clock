# Birthday Blueprint 9f — Restructure Report

## Git Hashes

| Checkpoint | Hash |
|---|---|
| Phase 1 base | 88319ad966fb3c44c29898452c497c7b058dbbd1 |
| Phase 1 commit | 04c71971b7edc7c8e072b550e29ac05340156949 |
| Phase 2 base | 04c71971b7edc7c8e072b550e29ac05340156949 |
| Phase 2 commit | f4e4f2542613e74a8c528fb6ebcc763eb1474bb1 |

---

## Phase 1 — Content Wiring

### Exported function names used
- `getNakshatra(number: number): NakshatraEntry` — from `src/data/nakshatraData.ts`
- `getRashi(nameOrEnglish: string): RashiEntry | undefined` — from `src/data/rashiData.ts`

### 1A — Rich Nakshatra wired into §8 Lunar
Fields rendered: `essence`, `shakti`, `ruler` (planet), `gemstone`, `career`, `relationships`, `spiritual`.
The `personality` field is not in NakshatraEntry (it has `essence` and `description` instead). Split `essence` into paragraphs on `\n\n`. Moon sign personality text (`moonSignData.personality`) retained as the Moon section prose.

### 1B — Rich Rashi wired into §2 Vedic tab
Fields rendered from `getRashi(vedicRashi.name)`:
`essence`, `career`, `relationships`, `spiritual`, `gemstone`, `favorableColors`, `favorableNumbers`.
Lookup: `getRashi(vedicRashi.name)` (Sanskrit key) with `|| getRashi(vedicRashi.english)` fallback.

### Phase 1 build/test result
BUILD CLEAN (31.83s) · TypeScript clean · Playwright 341 passed (27.2m)

---

## Phase 2 — Restructure

### 2A — De-duplicate Nakshatra (remove thin §2 copy)
DONE — removed `nakshatraCalc` var + orange sub-block from §2 Vedic tab (lines ~927-939 pre-edit).

### 2B — Consolidate Vedic: move §8 Lunar adjacent to §2 Vedic Rashi
DONE — dark IIFE deleted; light version inserted inside §2 ASTROLOGY section (below compatibility, above §2 close). Cards use var(--panel-2)/var(--gold-tint) backgrounds with standard ink colors.

### 2C — Reconcile compatibility (two renderings → one)
DONE — getTopCompatibleSigns grid inlined into Western tab. Old server compatibility.best/challenging mini-grid deleted. §11 MATCHES IIFE deleted.

### 2D — Compact 3-up summary strip
DONE — gap-4→gap-3, mb-8→mb-6, rounded-2xl→rounded-xl, p-5→p-3, text-3xl→text-2xl, text-lg→text-base.

### 2E — Reorder into four clusters
DONE — 09·NAME + 07·ARCANA moved to immediately after §4/03·NUMBERS. New order: 01·KINDRED → 02·ASTROLOGY(+08·LUNAR) → 03·NUMBERS → 09·NAME → 07·ARCANA → 04·TALISMAN → SOLAR → 06·ERA → 10·CYCLES.

### 2F — Soul Urge de-dup
DONE — Soul Urge removed from §3 numbers grid (was LifePath/SoulUrge/PersonalYear → now LifePath/PersonalYear, grid-cols-3→grid-cols-2). Soul Urge remains in §9 NAME.

### 2G — Break-inside polish
DONE — breakInside: avoid added to: celebrity cards, LP strengths/growth grid, Personal Year 2026 block, Tarot upright/deep meaning cards, Tarot 4-quadrant life areas grid.

### Phase 2 build/test result
BUILD CLEAN (5.49s) · TypeScript clean · pushed to develop f4e4f25

---

## Final Section Order — Dark/Light Alternation

| Position | Code | Title | Background |
|---|---|---|---|
| 1 | COVER | Cover Hero | white |
| 2 | 01·KINDRED | Celebrity Twins + History | white |
| 3 | 02·ASTROLOGY | Zodiac Profile (Western/Chinese/Vedic + Lunar) | var(--panel) |
| 4 | 03·NUMBERS | Numerology Blueprint | white |
| 5 | 09·NAME | Name Numerology | var(--paper) |
| 6 | 07·ARCANA | Tarot Card | var(--dark) |
| 7 | 04·TALISMAN | Birthstone & Flower | var(--gold-tint) |
| 8 | 05·SOLAR | Solar System Ages | var(--dark) |
| 9 | 06·ERA | Generation | var(--panel) |
| 10 | 10·CYCLES | Biorhythm | var(--panel) |

---

## Anchors That Did Not Match
None — all edits matched cleanly. The only imprecision was a first-attempt botched deletion of the Lunar IIFE (using `{false && ...}` wrapper instead of direct delete); corrected immediately in same session before commit.

---

## NEEDS HUMAN VISUAL REVIEW

- [ ] Consolidated Vedic block (Rashi + Moon + Nakshatra) reads as one coherent block, correct background, no leftover thin nakshatra.
- [ ] No section flows into the footer; page breaks fall on sensible boundaries (break-inside worked).
- [ ] Background alternation reads correctly across the new order (no flat run of identical backgrounds, no broken dark section).
- [ ] Western compatibility shows in exactly ONE place, inline; orphan §11 gone.
- [ ] 3-up summary is a compact strip, not a tall stack.
- [ ] Numerology cluster (Numbers → Name → Tarot) reads in order; Soul Urge appears once.
- [ ] No purple, glyphs render as text, ligatures/numbers clean (no regression from prior sessions).
- [ ] Section-code eyebrow numbers read sequentially in the new order.

---

## Test Results
Phase 1: Playwright 341 passed (27.2m against staging.bornclock.com) · build 31.83s · TS clean
Phase 2: build 5.49s · TS clean · pushed f4e4f25 to develop (Playwright runs against staging — not re-run locally as staging has not yet been redeployed with these changes)
