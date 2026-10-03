# Part AI — Flags, Decisions & Deferrals

Companion to `docs/BornClock_PartAI_ContentDepthFix.md`. Records the two
investigation decisions the spec asked for, the Part 4 stub triage (flag-only,
not fixed), and anything deferred under the resource safety net.

---

## Decision 1 — Ashtakvarga vs Shadbala (DO NOT BUILD Ashtakvarga)

**Spec ask:** "pay real attention to the Shadbala-vs-Ashtakvarga decision — don't
build a redundant system without checking first."

**What exists today (verified):**
- `grep -rniE "ashtakvarga|bhinnashtaka|sarvashtaka|bav|sav"` across `src/`,
  `functions/`, `api/` → **zero** hits in engine/app code. Ashtakvarga is **not**
  implemented anywhere.
- Shadbala **is** implemented and validated: `calculateBirthChart.ts:246`
  (`buildShadbala`), surfaced through the reading facts (`ReadingFactsClient.planets[].shadbala`)
  and consumed by `gemstones.ts`, `careerReport.ts`, `yogas.ts`, `readingSpecificity.ts`.

**Decision: do NOT build an Ashtakvarga engine.** Reasoning:
1. **Same user-facing question.** Both systems answer "which planets / areas are
   strong?" Shadbala does it via six strength sources (Sthana, Dig, Kala, Cheshta,
   Naisargika, Drik); Ashtakvarga does it via bindu tallies (BAV/SAV). For the
   reader-facing "how strong is this planet / this house" purpose they are
   **overlapping**, so a second system is redundant depth, not new capability.
2. **Cost is a full new subsystem.** A correct Ashtakvarga needs the eight
   contributor tables per planet, BAV per planet, SAV aggregation, and a UI to
   make 8×12 bindu grids legible — a large astronomical + UX build for marginal
   added insight over the strength signal we already show.
3. **Better ROI in visibility, not duplication.** The real gap the audit found was
   that Shadbala was present but **unexplained**. Part AI fixes that instead:
   Shadbala now carries a plain-language `TermTip` gloss in the Kundali advanced
   view (`VedicReading.tsx`), so the existing, validated data becomes readable.

**If revisited later:** Ashtakvarga's genuinely distinct value is *transit* timing
(Gochar) — "is Saturn's transit through this house supported?" That is a different
product surface from birth-chart strength and would be the only non-redundant
reason to build it. Scope it as a transit feature, not a second natal-strength
engine.

---

## Decision 2 — Dasha depth (Pratyantardasha shipped; 5 levels feasible, deferred)

**Spec ask:** "add Pratyantardasha where the engine supports it, and report the
feasibility of going to 5 levels."

**Current state (verified):** the engine computes **3 levels** —
Mahadasha → Antardasha → Pratyantardasha (`calculateBirthChart.ts:359-361`,
`currentPratyantardasha`). Pratyantardasha is already **displayed** in the Kundali
advanced view (`VedicReading.tsx` `reading-pratyantardasha`) and used by the chat
guardrails (`chatGuardrails.ts:337`). So the "add where supported" part is already
satisfied — no new work was needed here.

**5-level feasibility (Sookshma = 4th, Prana = 5th):**
- **Mechanically: straightforward.** Vimshottari is a recursive proportional
  subdivision — every level splits its parent by `lord_years / 120` in the fixed
  Ketu→Venus sequence. Levels 4 and 5 are the *same* rule applied twice more, so
  it is a small extension of the existing nesting, not a new algorithm.
- **Precision caveat:** Prana-dashas are only **hours** long. At that resolution
  the exact birth minute, timezone, and ephemeris rounding start to dominate the
  result, so a 5-level readout implies more precision than a typed birth time
  usually justifies.
- **Value caveat:** a 5th level changes every few hours — high noise, low
  decision value for a natal reading.

**Recommendation: DEFERRED, not built.** Ship at 3 levels (done). If added later,
gate levels 4–5 behind an explicit "exact birth time" confidence flag and label
them clearly as fine-grained/indicative.

---

## Part 4 — Stub / thin pages (FLAGGED ONLY — not fixed, per spec)

All routes below were verified present in `src/App.tsx` and resolve to real
components; `tsc --noEmit` and the build pass, so **none are broken** — they are
"thin vs peers," not defective. Prioritized by leverage (SEO reach × fixability).

**Priority 1 — real tools hiding behind thin content (highest ROI):**
1. `/rashi-ratna` — pure static tables, no computation. Part AI already added the
   `/gemstones` cross-reference; a future pass could make it compute from the Moon
   sign instead of a lookup table.
2. `/vedic-zodiac` (+`/:rashi`) — solar-rashi only; lighter than `/moon-sign`.
   Could compute the sidereal Sun sign from a DOB instead of static text.

**Priority 2 — near-duplicate SEO landings (mechanical, low risk):**
3. `/life-expectancy-calculator-{uk|usa|canada|australia}` and
   `/life-expectancy-calculator-singapore-uae` — trivial wrappers over
   `LifeExpectancyCountryTemplate`, differing only in country stats. Consolidate or
   enrich with country-specific data to avoid thin-content dilution.
4. Hindi calculators (`HindiAgeCalculator`, `HindiBiologicalAge`,
   `HindiLifeExpectancy`, `HindiNumerology`, `HindiZodiac`) — thin localized
   wrappers; fine as-is, but candidates for real localized copy.

**Priority 3 — static marketing / FAQ (intentionally thin, lowest urgency):**
5. `/hi/rashifal` (+`/:rashi`) — static canned "rashifal" text, not date-computed;
   both routes render the same component.
6. `/answers/*` (17 pages) — static FAQ/schema funnel pages (thinnest tier by
   design; they exist to funnel to real calculators).
7. `/diwali-gift`, `/for-business`, `/coach` — static marketing landings, no tool.
   `/for-business` CTA is a `mailto:` with no signup flow.

**Note (not stubs):** `/astrologer`, `/muhurat`, `/career-report`, `/gemstones`
are thin *page shells* whose real logic lives in child components / `/api` — fully
functional, just visually lighter than `/kundali` and `/kundali-match`. Part AI
deepened `/muhurat`, `/gemstones`, and the Kundali reading directly.

---

## Safety-net / deferrals used in Part AI

- **Muhurat location accuracy:** Part AI makes location **required** and computes
  the Panchang in the chosen location's **timezone** (real improvement over the
  previous hardcoded IST default). Full **lat/lon-accurate sunrise & Rahu Kalam**
  (vs the current ~06:00-local + weekday-window approximation) is **deferred** — it
  needs sunrise/sunset astronomy in the engine and is documented in the page's
  scope note. This kept the occasion + location + range work from ballooning.
- **Intraday Muhurta categories** (Choghadiya / Hora / exact-minute windows /
  personal-chart Chandrashtama) remain deferred and are now at least *defined*
  inline via `TermTip` so the scope note is no longer jargon.
- No other Part 3 item exceeded scope; nothing else was dropped.
