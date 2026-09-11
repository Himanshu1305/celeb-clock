> ⚠️ SUPERSEDED — see the consolidated docs/vedic-integration-touchpoints.md (Part K). Kept for history.

# Part G (Classical Yoga Detection) — Phase -1 Touchpoints

> Deliverable for `docs/BornClock_PartG_YogaDetection.md` Phase -1. Written before
> any Part 0-5 code. Builds on Parts B/D/D-Fix/E/F.

## What currently generates the readings (that will cite Yogas/Nakshatra meanings)
- **`src/lib/vedic/readingPrompts.ts`** — `extractReadingFacts(chart)` (the shared fact
  layer), `buildReadingSystemPrompt()`, `buildReadingUserPrompt(facts)`, the JSON schema,
  and the safety scanner (`scanForRedFlags`). This is where Nakshatra meanings + detected
  Yogas must be surfaced to the model.
- **`api/vedic-reading.ts`** — the reading endpoint. Calls `calculateBirthChart(..., {includeShadbala:true})`,
  builds the prompt, runs the up-to-3-attempt gate (safety + accuracy + specificity), caches
  under a versioned key (`READING_VERSION`, currently `v3`).
- **`src/lib/vedic/readingSpecificity.ts`** — the anti-hallucination accuracy checker
  (`verifyReadingClaims`) + specificity scorer + prose metric. **Part 4 extends this** so a
  claimed Yoga is cross-checked against the real detection result.

## ⚠️ Correction to the spec's assumption: there is no "D-Fix2" framework in the code
The spec repeatedly cites a "D-Fix2" session with an explicit *decisiveness / calibrated-
confidence / hard-boundary* framework. The real history is **Part D → D-Fix (specificity +
anti-hallucination) → warmth pass**. What actually exists:
- **Explicit reasoning / "show your logic":** the prompt already requires each section to name
  the specific houses/lords/placements/Dasha it draws on (D-Fix).
- **Anti-hallucination gate:** `verifyReadingClaims` — 0 wrong claims tolerated, retry then degrade.
- **The "hard boundary" against literal predictions:** the safety scanner already bans
  `will / definitely / must / guaranteed` (Part D), and the astrologer chat additionally has a
  deterministic crisis + health pre-scan (Part F).
- **Calibrated confidence:** strength is stated in words (strong/moderately strong), D60/Shadbala
  hedged as "indicative / one interpretation".

**Decision:** I will map D-Fix2's *intent* onto this existing system — a strong, multi-condition-
verified Yoga becomes an additional piece of cited evidence that lets a section speak a little more
firmly (still hedged, never "will"). I will NOT invent a new confidence framework. Flagged here so
the reviewer knows the spec's premise was slightly ahead of the codebase.

## Where detected Yogas attach
- **`src/lib/vedic/calculateBirthChart.ts`** — `BirthChartResult`. Part 3 adds a `yogas` field
  (list of `{name, present, grade, conditionsShown, planets/houses}`). Yoga grading needs house
  lords (derivable, whole-sign), exaltation/debilitation, Navamsa (`divisionalCharts.d9`), and
  Shadbala (`shadbala`, only when `includeShadbala:true`). The reading endpoint already passes
  `includeShadbala:true`, so grading works there; without it, grades degrade gracefully.
- **`src/components/reading/VedicReading.tsx`** — advanced "Show chart details" view
  (`reading-advanced`, already hosts the `reading-shadbala` table). Part 3 adds a `reading-yogas`
  section mirroring that pattern. Needs the yogas surfaced through `ReadingFactsClient`
  (`src/services/readingService.ts`), same as the Shadbala numbers were.
- **`scripts/vedic-lab/generate-charts.cjs`** exists for generating test charts (Part 2).

## THE FLAGGED DECISION — should the Part F astrologer CHAT also cite Yogas?
This is the scope surprise the spec's Phase -1 and the user both asked me to confirm, not assume.

- **Shared:** `api/vedic-chat.ts` already imports `extractReadingFacts`, so adding Yogas +
  Nakshatra meanings to the fact layer makes them *available* to the chat for free.
- **NOT shared:** the chat has its **own** system prompt (`buildChatSystemPrompt` in
  `chatGuardrails.ts`) and — critically — the chat does **NOT** run the anti-hallucination
  accuracy checker (`verifyReadingClaims`); it only runs the safety scanner + crisis/health
  pre-scans. So making the chat *cite* Yogas safely means: (a) wiring Yogas into the chat system
  prompt, and (b) adding a Yoga-accuracy guard to the chat path so it can't fabricate a Yoga.
- **Tension in the spec itself:** the user's *original* request was about **readings** citing
  Yogas. But **Part 5.1/5.2 explicitly test the chat** citing a Yoga, handling "how do you know
  that Yoga is really there?", refusing to overstate a Raj Yoga, and refusing a fake Yoga
  ("Surya Kesari"). So Part 5 assumes the chat has this ability.
- **Cost of including the chat:** roughly doubles the prompt-wiring + accuracy-guard + test
  surface for the citation feature (the detection engine itself is shared and unaffected).

**This needs the person's decision before I wire citations** (Parts 0.3 / 3). The detection
engine, meanings layer, grading, tests, and advanced-view UI (Parts 0-2, 4) are unaffected by
this choice and I can build them regardless.
