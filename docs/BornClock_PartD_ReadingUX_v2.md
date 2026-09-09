# BornClock — Part D: Reading & Prediction UX (v2 — with Playwright, touchpoint mapping, full-retest discipline)
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

This follows Part B (engine abstraction + integration) — complete, on
branch `feature/vedic-engine-integration-part-b`, 1,575 unit tests
passing, zero regressions. Not yet merged.

**The person running this session does not read code.** Every
verification must come back as something they can act on without
opening a file: real screenshots, real rendered page text, real
pass/fail counts described in plain language. "Tests pass" alone is not
sufficient — describe what a real user would actually see.

---

## PHASE 0 — MANDATORY: MAP TOUCHPOINTS BEFORE BUILDING

Do not write feature code until this is done and written up.

### 0.1 Find what this session's changes will touch
- Does the new reading-generation flow write to any table other than a new/dedicated readings-cache table? Check for overlap with `vedic_chart_cache` or any existing report-generation code.
- Does anything else in the codebase already call Gemini for chart-related text (check celebrity bio generation scripts, existing report PDF generation)? If so, could/should this session's Gemini prompt patterns be shared or kept separate? Decide and document why.
- Does the birthday PDF report (if one exists and is generated from chart data) need to incorporate this new reading content, or is it explicitly out of scope for this session? Decide and document.
- List every existing page/component that will need to link to or embed the new reading sections.

Write this to `docs/part-d-touchpoints.md`, committed to the repo. If
this reveals significantly more scope than expected (more than a
handful of integration points), stop and flag the person before
proceeding, the same way Part B's Phase 0 did.

---

## PART D1: BUILD THE READING/PREDICTION UX

(Reference `docs/vedic-integration-touchpoints.md` and
`calculateBirthChart()`'s JSDoc for what data is available and how
trustworthy each piece is, per the confidence table from Part B.)

### Design philosophy
- Plain language, not chart terminology (Career/Relationships/Health/Money/Family, not "9th house").
- Layered depth: short summary → fuller paragraph → optional technical detail behind a toggle.
- Never overclaim certainty: "this period is traditionally associated with..." never "you will...".
- Lower-confidence components (D60, Sthana Bala, Chesta Bala) get visibly softer language in the actual displayed text.

### Sections to build:
1. Snapshot summary (Rashi+Nakshatra+Lagna → short Gemini-generated text)
2. Life area breakdowns (Career, Relationships, Health, Money, Family)
3. "Right now for you" (current Dasha, plain language)
4. Doshas section (plain-language + remedies, calm non-fear-based tone — dosha stigma is a real documented harm, avoid alarming language)
5. Divisional chart highlights (2-3 most relevant, not all 16)

### Gemini prompt requirements:
- No medical claims, no definitive financial advice, no absolute predictions
- Doshas framed as "areas to be mindful of," never "curses"
- Warm, constructive tone even for difficult placements
- Store the exact prompt + input data alongside each cached reading

---

## PART D2: TESTING — BUILT INTO EVERY SECTION, NOT JUST THE END

### Unit/integration tests (extend existing suite — check current patterns first)

For each of the 5 sections, before moving to the next:

| Test type | What to check |
|---|---|
| Positive | Reference chart produces sensible, complete text — no placeholders, no broken formatting |
| Positive | A second, very different chart (different decade/hemisphere) also works |
| Negative | Gemini API failure (mock it) — page falls back gracefully, no crash, no blank section, no raw error shown to user |
| Negative | Malformed/missing chart data reaches this section — fails gracefully |
| Edge | Chart with a real dosha present — section reads calm/remedy-focused |
| Edge | Polar-latitude-flagged chart — section adapts sensibly or shows the warning clearly |
| Edge | D60/Sthana Bala/Chesta Bala content — softened-confidence language actually visible |
| Content safety | Scan actual generated text for "will", "definitely", "must", diagnosis terms, "invest"/"buy"/"sell" |

Report each row's REAL result — paste actual generated text, don't just say "passed."

**If a row fails, fix it, then re-run the FULL table again for that
section (all rows, not just the one that failed) before moving on.**

### Playwright E2E tests (extend the EXISTING suite — check
`playwright.config.ts` and current test file conventions first)

This is the actual "does a real user's browser show the real thing"
check — do not skip this, this is different from and in addition to the
unit tests above.

**Positive flow:**
- User completes the birth-details form → navigates to/views the reading page → all 5 sections render with real text (not stuck loading spinners, not empty divs) → take a screenshot and describe what it shows
- If a technical/advanced-view toggle exists, click it and confirm it reveals the underlying chart data correctly

**Negative flow:**
- Submit the form with missing fields → confirm a clear, friendly validation message appears (screenshot it)
- Simulate a backend/API failure (mock the network call at the Playwright level) → confirm the page shows a reasonable message, not a blank page or console-error-looking text (screenshot it)

**Edge flow:**
- A birth location that triggers the polar-latitude warning → confirm the warning is visibly rendered in the actual DOM the user sees, not just present in an API response never surfaced (screenshot it)
- A chart with multiple doshas present → screenshot the doshas section and read through it for tone
- Very old (1901) and very recent birth dates both render correctly (screenshot both)

Run these against a local preview build unless the existing Playwright
setup requires staging — check the current config rather than assume;
if a staging deploy is required to run these, say so plainly and ask
whether to proceed with a deploy or defer E2E to after this session's
code is merged.

---

## PART D3: FULL SUITE RE-RUN — MANDATORY, NOT OPTIONAL

After ALL sections are built and ALL individual tests above pass:

1. Run the ENTIRE existing unit test suite (should be 1,575+ from Part B, plus everything new from this session). Confirm the exact before/after count and zero regressions.
2. Run the ENTIRE existing Playwright suite (the old 37+ plus new ones from this session). Confirm before/after count and zero regressions.
3. If anything that previously passed now fails, that's a regression from this session's changes — fix it, then re-run the ENTIRE suite again (not just the failing test) — repeat until fully green.

Do not report this session as complete with any red test, anywhere, old or new.

---

## FINAL CHECKPOINT — PLAIN-LANGUAGE SUMMARY REQUIRED

Produce a summary for someone who doesn't read code:

- What a user can now do that they couldn't before (one paragraph)
- The complete actual text of one full generated reading (reference chart), pasted in full
- Every negative/edge case tested, with the real observed outcome described in plain terms, including at least 3 actual screenshots from the Playwright runs described in words
- Anything that didn't work initially — what was wrong, what was changed, confirmed fixed by re-testing
- Exact test counts: unit tests before/after, Playwright tests before/after, confirming zero regressions in both
- What still needs a human's judgment before this goes live (e.g. "read 3-4 more sample readings for tone")
- Whether Phase 0's touchpoint mapping revealed anything requiring a scope decision from the person

## WHAT NOT TO DO

- Do not build the AI conversational chat agent (separate future session)
- Do not merge anything without being asked
- Do not skip Playwright — it is required this session since real UI now exists
- Do not mark any test "passed" without actually running it and observing/reporting the real result
- Do not move to the next section until the current section's full test table has real, specific results
- Do not consider a bug "fixed" without re-running the full relevant test set afterward, not just the one case that failed
- Use plain language in every summary — the person reading it does not read code
