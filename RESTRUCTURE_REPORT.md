# Birthday Blueprint 9f — Restructure Report

## Git Hashes

| Checkpoint | Hash |
|---|---|
| Phase 1 base | 88319ad966fb3c44c29898452c497c7b058dbbd1 |
| Phase 1 commit | _pending_ |
| Phase 2 base | _pending_ |
| Phase 2 commit | _pending_ |

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
_pending_

---

## Phase 2 — Restructure

### 2A — De-duplicate Nakshatra (remove thin §2 copy)
_pending_

### 2B — Consolidate Vedic: move §8 Lunar adjacent to §2 Vedic Rashi
_pending_

### 2C — Reconcile compatibility (two renderings → one)
_pending_

### 2D — Compact 3-up summary strip
_pending_

### 2E — Reorder into four clusters
_pending_

### 2F — Soul Urge de-dup
_pending_

### 2G — Break-inside polish
_pending_

### Phase 2 build/test result
_pending_

---

## Final Section Order — Dark/Light Alternation
_pending_

---

## Anchors That Did Not Match
_pending_

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
_pending_
