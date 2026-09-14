# Part S — Full-Reading Consistency Audit

Standard being audited against (from earlier sessions, not re-invented here):
- **D-Fix2** — decisive, multi-evidence reasoning (house + lord + Dasha + divisional),
  landing on a real conclusion; never a bare yes/no, never vague.
- **D-Fix3** — real, computed date-range predictions from the actual Dasha timeline,
  cited alongside the reasoning.

The reading prose is LLM-generated from `buildReadingUserPrompt` (per-section
instructions + supplied facts) and gated by the deterministic checkers in
`readingSpecificity.ts`. So a section's rating reflects what its prompt instruction
REQUIRES and what facts it is GIVEN. Ratings below were confirmed against real
generated output for the reference chart and one additional chart (Tula lagna,
1978-03-22) — see the before/after text in the Part S report.

## Checklist (per section)
1. Names specific real chart facts (house/lord/sign/strength)?
2. Connects MULTIPLE evidence sources together (D-Fix2)?
3. Lands on a real, decisive conclusion?
4. Cites a real, computed TIMING window where a timing claim applies?
5. Respects existing safety boundaries for its topic?

## BEFORE audit table

| Section | 1 Facts | 2 Multi-evidence | 3 Decisive | 4 Timing | 5 Safety | Verdict |
|---|---|---|---|---|---|---|
| Snapshot | Pass | Pass | Pass | N/A (identity, no timing claim) | Pass | **Pass** |
| Career | Pass | Pass | Pass | Pass (Career window) | Pass | **Pass** |
| Relationships | Pass | Pass | Pass | Pass (Marriage window) | Pass (Mangal calm) | **Pass** |
| Health | Pass | Pass | Pass | N/A (theme-only by safety design) | Pass (no diagnosis) | **Pass** |
| Money | Pass | Pass | Pass | Pass (Wealth window) | Pass | **Pass** |
| **Family** | Pass | **Partial** (4th+9th lords named, but not tied to Dasha; thinner synthesis than Career/Money) | **Partial** (mild implication, not a decisive conclusion) | **Fail** (a genuine timing angle exists via the 4th/9th lords' periods; none cited) | Pass | **Partial → fix** |
| Right Now | Pass | Pass | Pass | Pass (next window) | Pass | **Pass** |
| **Doshas** | Pass | **Partial** (dosha-causing planet+house named, not tied to Dasha) | Pass (calm presence/absence) | **Fail** (no "when strongest/weakest": Mangal has Mars-period timing, Sade Sati has phase timing, Kaal Sarp is structural — none stated) | Pass (calm) | **Partial → fix** |
| **Deeper Chart Layers (Divisional)** | Pass | **Partial** (D9/D10/D60 placements listed in isolation) | **Partial** | **Fail** (no timing dimension at all — the specific concern raised) | Pass (D60 hedged) | **Partial → fix** |

### Confirming the person's specific suspicions
- **Family**: confirmed weaker — it reads as a list of two house/lord facts with a mild
  implication, without the Dasha connection and decisive real-world conclusion that
  Career/Money already have.
- **Doshas timing**: confirmed missing. Mangal Dosha's expression is classically
  time-bound to **Mars** Maha/Antar periods (verified: "Manglik Dosha stays dormant
  outside Mars periods"); Sade Sati already has genuine **phase** timing; **Kaal Sarp
  is structural/permanent** — it does NOT have Sade-Sati-style phase timing, though it
  is traditionally most felt during **Rahu/Ketu** periods. The before output stated
  none of this.
- **Deeper Chart Layers timing**: confirmed absent. Divisional placements were named
  but never connected to any timing dimension. Verified classical basis for the fix:
  "Varga results only activate during supportive Maha/Antar periods — a beautiful D10
  without an activating Dasha stays theoretical."

## Fixes applied (Part 1) — reusing D-Fix2 / D-Fix3 only, no new method

- **Family**: prompt now requires the full D-Fix2 treatment — synthesise 4th + 9th
  houses with their lords' placements AND the current Dasha lord where relevant, and
  land on a decisive real-world conclusion (same bar as Career/Money). Where a family
  timing angle applies, cite the computed **Family** timing window (4th/9th-lord
  periods), reusing the D-Fix3 activation engine.
- **Doshas**: prompt now states WHEN each present dosha is most pronounced, reusing the
  activation-window engine: **Mangal → Mars periods**; **Sade Sati → its phase**;
  **Kaal Sarp → structural/permanent, most felt in Rahu/Ketu periods** (explicitly not
  phase-timed). A structural feature is described as permanent, never given a fake
  window.
- **Deeper Chart Layers**: prompt now requires connecting at least one divisional
  placement (D10 career-varga / D9 dharma-varga) to its ruling planet's activation
  window, reusing the same engine — "your Dasamsa promise is most likely to express
  during your [ruling planet] period, [real dates]".

New timing facts are added to `buildTimingFacts` (`family`, `doshaTiming`,
`divisionalTiming`) and their dates folded into the accuracy checker's valid-date set,
so every new date still passes zero-tolerance verification. `READING_VERSION` bumped
so stale cached readings are not served.

## AFTER audit table (verified against regenerated readings)

Regenerated for the reference chart (Makara) and the additional chart (Tula,
1978-03-22) with the live model. Accuracy (zero-tolerance checker): **REF 54/54,
CH2 58/58 correct, 0 wrong, not degraded** — and the checked-claim count *rose*
(44→54, 46→58), i.e. more specific verifiable claims, all correct. Safety suite: full
unit suite (148 files / 1823 tests) green, including the crisis/health/dosha guardrails.

| Section | 1 Facts | 2 Multi-evidence | 3 Decisive | 4 Timing | 5 Safety | Verdict |
|---|---|---|---|---|---|---|
| Snapshot | Pass | Pass | Pass | N/A | Pass | **Pass** |
| Career | Pass | Pass | Pass | Pass | Pass | **Pass** |
| Relationships | Pass | Pass | Pass | Pass | Pass | **Pass** |
| Health | Pass | Pass | Pass | N/A (theme-only) | Pass | **Pass** |
| Money | Pass | Pass | Pass | Pass | Pass | **Pass** |
| **Family** | Pass | **Pass** (4th+9th+lords synthesised + Dasha) | **Pass** (decisive conclusion) | **Pass** (Family window cited) | Pass | **Pass** |
| Right Now | Pass | Pass | Pass | Pass | Pass | **Pass** |
| **Doshas** | Pass | **Pass** | Pass | **Pass** (Mangal→Mars, Sade Sati phase, Kaal Sarp structural + Rahu/Ketu) | Pass (calm) | **Pass** |
| **Deeper Chart Layers** | Pass | **Pass** | Pass | **Pass** (divisional placement → ruling-planet window) | Pass (D60 hedged) | **Pass** |

Layout: the full reading page renders cleanly with the grown content (screenshot
`e2e-reading/__screens_s__/reading-grown-content.png`; e2e-reading suite 53/53 green,
including the progressive-disclosure collapse/expand test).

## Real before/after text (additional chart — Tula, 1978-03-22)

### Family
**BEFORE:** "Your 4th house of home and roots is Makara, guided by Saturn which is
strong and retrograde in the 11th house in Simha. This placement suggests a domestic
foundation built on patience, structure, and enduring principles. Your 9th house of
fortune and fatherly guidance sits in Mithuna, ruled by a moderately strong Mercury
located in Meena. In that 6th house, Mercury joins the Sun to form a moderate
Budha-Aditya Yoga, reflecting thoughtful learning passed down through family guidance."
*(house + lord facts, but no Dasha connection, no timing, no decisive conclusion)*

**AFTER:** "Your 4th house (home and mother) is Makara, guided by a strong, retrograde
Saturn placed in your 11th house in Simha. This placement suggests an organized home
life marked by traditional values and occasional emotional restraint. Your 9th house
(father and higher guidance) is Mithuna, ruled by Mercury, which sits in Meena in your
6th house. Together, these placements suggest parental figures who instilled a strong
sense of responsibility and practical service. You are currently navigating your
Saturn Antardasha from November 2025 to September 2028, making this the most active
classical period for handling foundational family and property matters. The subsequent
Mercury Antardasha running from September 2028 to March 2031 brings another supportive
opening for family ties." *(synthesises both houses into a decisive conclusion + two
real Dasha windows — full D-Fix2/D-Fix3)*

### Doshas
**BEFORE:** "A full Kaal Sarp (Sheshnag) pattern appears in your chart, with Rahu
placed in Kanya in the 12th house and Ketu in Meena in the 6th house. This simply
indicates an area to be mindful of… Mars causes no Mangal Dosha… You are also free from
Sade Sati at present." *(names the dosha calmly, but no timing dimension at all)*

**AFTER:** "…Your chart does contain a full Sheshnag Kaal Sarp pattern, formed because
all classical planets sit framed between Rahu in Kanya in your 12th house and Ketu in
Meena in your 6th house. It is helpful to understand that this is a permanent
structural pattern in your chart rather than a temporary phase, so it has no start or
end dates. Traditionally, its lessons emerge most clearly during periods governed by
the nodal axes. Within your ongoing Rahu Mahadasha, the Ketu Antardasha running from
March 2031 to April 2032 marks the period where this alignment is classically felt most
deeply." *(honestly states it is structural/permanent — no fake window — then adds the
one legitimate timing angle, Rahu/Ketu periods)*

### Deeper Chart Layers (Divisional)
**BEFORE:** "Turning to the Navamsa (D9), your Moon rests in Simha while your Mars is
placed in Karka… Your Navamsa Lagna settles in Meena… In the Dasamsa (D10), the Sun is
placed in Makara… the Shashtiamsa (D60) shows your Moon in Vrischika." *(placements
listed in isolation, no timing)*

**AFTER:** "…In your Dasamsa (D10, professional life), your Sun rests in Makara, which
is ruled by Saturn. In one classical reading, your Shashtiamsa (D60) shows the Moon in
Vrischika as an indicative strength. The promise of your Dasamsa Sun is traditionally
tied to Saturn's governance. Because of this link, your current Saturn Antardasha
running from November 2025 to September 2028 offers a natural classical period for
those career potentials to steadily surface." *(connects a divisional placement to its
ruling planet's real activation window)*

## Flagged: where a timing dimension genuinely does NOT apply (left as structural, honestly)
- **Kaal Sarp** — a permanent/structural pattern; correctly described as having no
  phase timing (only the Rahu/Ketu "most felt" angle), never a fabricated start/end.
- **Health** — kept theme-only by safety design; no timing/diagnosis added.
- **Snapshot** — an identity frame; no timing claim is made, so none is forced.

