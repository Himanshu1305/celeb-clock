# BornClock — Part AI: Content Clarity + Depth Fix
## Single Claude Code session prompt. Fixes every finding from the read-only audit (docs/content-feature-audit.md), plus two relevant backlog items. Standard flow: build → preview → stop for explicit go-ahead.

---

## CONTEXT

The audit found the "too technical, not explained" complaint is real but
localized — a small number of specific, quoted weak spots, not a sitewide
rewrite. Fix those specific spots, build the missing shared infrastructure
that makes future fixes cheap, and close the confirmed feature-depth gaps.

**Read `docs/content-feature-audit.md` first** — every instruction below
references specific findings in it. Don't re-derive what it already found.

**The governing writing method for every fix in this prompt: impact-first.**
This was already decided after real user testing: state the plain-language
impact first, the reasoning second, the practical guidance third — not
term-then-definition. This is not a new content standard; apply it
consistently, especially to the weak spots below.

**Branch:** create `part-ai-content-depth-fix` off `develop` HEAD (confirm
this includes the live Part AF/AG work — Birthday, Mystic, Science pages —
before starting; if unsure, check rather than assume).

---

## PART 1: Build the shared term-definition mechanism (do this first — everything else depends on it)

No sitewide glossary/tooltip system exists. One narrow version does:
`NAKSHATRA_MEANINGS` (`nakshatraMeanings.ts`), used in exactly one place.

Generalize this pattern into a shared, reusable term-definition system
(keyed data, not hardcoded per-page prose) covering at minimum: Lagna, Rashi,
Nakshatra, Dasha, Antardasha, Pratyantardasha, Yoga, Dosha, Ashtakoota,
Navamsa, Kendra, Trikona, Yogakaraka, Shadbala, Kaal Sarp, Manglik/Kuja Dosha,
and — the term missing on every single Vedic page per the audit —
**ayanamsa/sidereal/Lahiri**. Each entry should give a short, plain-language
definition usable inline or as a tooltip/hover-card (the shadcn
`tooltip.tsx`/`hover-card.tsx` components already exist in the codebase but
are never used for this — use them here).

Define "ayanamsa/sidereal/Lahiri" once, well, and reuse it everywhere it
currently appears unexplained (`/kundali`, `/kundali-match`, `/sade-sati` at
minimum, per the audit's quoted instances).

---

## PART 2: Fix the four confirmed weak spots (use Part 1's mechanism + impact-first)

Rewrite these exact quoted weak spots, in order of severity per the audit:

1. **`/muhurat`** (worst, 0.33 including sub-names) — `panchang.ts:92`'s
   "Yoga" with zero definition, and the undefined Choghadiya/Hora/
   Chandrashtama terms at `MuhuratPage.tsx:95`.
2. **`/kundali` advanced view** — `VedicReading.tsx:166`'s "Navamsa (D9)...
   Dasamsa (D10)" with no definitions, and the "sidereal (Lahiri ayanamsa)"
   line at `kundaliService.ts:132`.
3. **`/sun-vs-moon-sign`** — `SunVsMoonSign.tsx:65`'s "cusp" and the "rising
   sign" mentioned at `:12`/`:59` but never defined or linked anywhere.
4. **`/career-report`**'s yoga-name chips — `CareerReportPage.tsx:84`'s bare
   `{y.name} [{y.grade}]` pattern with no legend explaining what
   full/strong/partial actually means for the reader.

Apply the same impact-first fix to the other quoted weak spots too
(`/kundali-match`, `/sade-sati`, `/gemstones`, `/rashi-ratna`) even though
their ratios are better — every quoted instance in the audit should end up
using Part 1's mechanism consistently, not just the worst four pages.

---

## PART 3: Close the confirmed feature-depth gaps

### Kundali
- **Kaal Sarp Dosha**: currently only mentioned inside the general Doshas
  narrative — give it its own clearly-labeled section, same standard as the
  existing Manglik/Kuja Dosha treatment.
- **Ashtakvarga vs. Shadbala**: the audit found Shadbala already exists and
  serves a planetary-strength function, but Ashtakvarga (what competitors
  typically show) doesn't. **Before building a second, redundant
  strength-view system**, check whether Shadbala genuinely serves the same
  reader-facing purpose Ashtakvarga would — if so, the fix is making Shadbala
  more visible and better-explained (via Part 1's mechanism), not building
  Ashtakvarga from scratch. Report which conclusion you reached and why.
- **Remedies section**: currently only exists inside the paid upsell CTA
  (`KundaliPage.tsx:285`). Add a real, free remedies section for the doshas
  already detected — this is standard across every competitor audited.
- **Dasha depth (backlog item)**: competitor research found market-standard
  depth is 5 levels (Mahadasha, Antardasha, Pratyantardasha, Sookshmadasha,
  Pranadasha) vs. BornClock's current 2. Extending to all 5 may not be
  practical or genuinely useful for a free consumer report — at minimum, add
  **Pratyantardasha** (the 3rd level) where the underlying engine can support
  it, and report on the real feasibility/value of going further before doing
  so, rather than building all 5 levels by default.

### Sade Sati
Add a real remedies/upay section — currently deliberately reassurance-only
with none. Follow the same honest, non-fear-based tone already established
elsewhere on the site; do not add remedies framed as urgent/necessary in a
way that induces anxiety.

### Muhurat
- Expand occasion types from the current 3 (business, travel, general) to at
  least the competitor-standard set: Marriage/Vivah, Griha Pravesh, Business
  Launch, Travel, Naming/Namkaran, Vehicle/Property Purchase — add Engagement
  and Vidyarambh (education start) if feasible.
- Add location/city as a required input — currently defaults to IST 5.5,
  which is a real accuracy gap since Rahu Kaal and sunrise/sunset genuinely
  shift by 15-30 minutes between cities.
- Replace or supplement the fixed 30/60/90-day UI buttons with an actual
  custom date-range picker — the audit found the API may already support a
  wider range than the UI exposes; confirm and use that if so, rather than
  rebuilding the underlying logic. **Cap the custom range at a reasonable
  maximum (90-180 days)** — even the most generous competitor found in
  research caps this at 60 days; an unbounded range risks real performance
  problems calculating Panchang data over a very long window.

### Gemstones
Add real wearing-ritual detail — metal, finger, day, and the traditional
sizing formula (1 Ratti per 10kg body weight) — alongside the existing
trial-first caution, which stays.

### Rashi Ratna ↔ Gemstones — reconcile the silent disagreement
These two tools currently use different methods (Rashi vs. Lagna) and can
recommend **different, conflicting gemstones** for the same person with zero
acknowledgment either exists. Add an explicit, honest cross-reference on both
pages: Rashi Ratna should state plainly it's a general Moon-sign-based
starting point, and link to Gemstones for the precise, full-chart-based
recommendation. This is a real trust issue, not a cosmetic one — a user who
finds both pages independently currently has no way to know why they might
disagree.

### Sun vs Moon Sign
Extend to a third dimension — Ascendant/Lagna, which the Vedic engine already
computes — matching the strongest competitor pattern ("the Big Three").
Link explicitly to `/vedic-astrology` or the Kundli tool, since the audit
found zero cross-link currently exists despite Lagna being directly relevant.

### Career Analysis (Vedic) — cosmetic fix
The dropdown label includes "(Vedic)"; the page's H1 doesn't. Align them —
either add it to the H1 or drop it from the dropdown label, whichever reads
better in context.

---

## PART 4: Stub/thin pages — flag, don't fix in this pass

The audit found several thin/stub pages (`/rashi-ratna`'s static lookup —
already addressed above for its cross-link issue, not its computation method;
`/life-expectancy-calculator-{uk|usa|canada|australia}` near-duplicate
wrappers; `/diwali-gift`; `/for-business`; `/coach`; `/vedic-zodiac`; the 17
static `/answers/*` pages; the Hindi calculator wrappers). **Do not rebuild or
consolidate these in this session** — that's a separate scope/priority
decision. Just confirm none of them are actually broken or erroring, and
include a short prioritized list of which ones seem most worth a future
decision (fix, consolidate, or deprioritize) in your final report.

---

## RESOURCE SAFETY NET

Part 3 has seven independent feature additions across different pages. If any
one of them (e.g. the Dasha-depth extension, or the Ashtakvarga-vs-Shadbala
investigation) turns out to be significantly more involved than expected,
**flag it clearly in `docs/part-ai-flags.md` and move on to the rest** rather
than letting it stall the whole session or degrade the quality of the other
six items. A session that cleanly finishes six of seven Part 3 items plus all
of Parts 1-2 is a far better outcome than one that rushes all seven.

---

## TESTING REQUIREMENTS
- Every rewritten section verified against the impact-first structure and
  Part 1's definition mechanism — quote real before/after examples for each
  of the four weak spots in Part 2, not just "fixed."
- Confirm the Shadbala-vs-Ashtakvarga decision is documented with real
  reasoning, not just an assumption either way.
- Confirm the Rashi Ratna ↔ Gemstones cross-reference actually appears on
  both live pages.
- Confirm the Muhurat location input, expanded occasion list, and the capped
  custom date range all work end-to-end with a real test case.
- Confirm the Kundali remedies section, the Sade Sati upay section, the
  Gemstone wearing-ritual detail, and the Sun-vs-Moon Ascendant addition each
  render real, correct content — quote a real example from each, not just a
  pass/fail note.
- Full existing test suite passes before and after.
- Use `wrangler versions upload` for an isolated preview — do not run a real
  `wrangler deploy`. Stop there and report back for explicit go-ahead before
  merging to `develop` or deploying for real.

---

## WHAT NOT TO DO
- Do not skip Part 1 and write one-off explanations per page instead — the
  whole point is a reusable mechanism, not six more bespoke fixes.
- Do not build a redundant Ashtakvarga system without first checking whether
  Shadbala already serves the purpose.
- Do not rebuild or consolidate the Part 4 stub pages in this session.
- Do not add remedies content that reads as fear-inducing or urgent-sounding
  — match the site's existing calm, honest tone.
- Do not merge to `develop` or deploy for real without explicit go-ahead.
