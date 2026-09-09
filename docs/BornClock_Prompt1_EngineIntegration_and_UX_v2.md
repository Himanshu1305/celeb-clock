# BornClock — Vedic Engine Integration + Reading/Prediction UX (v2)
## Single Claude Code session prompt. Read this fully before starting.
## This version adds: dependency mapping, full test coverage (unit +
## Playwright, positive/negative/edge), and a mandatory fix-then-full-
## retest discipline. Do not skip these — they are not optional polish,
## they are how real bugs get caught before users see them.

---

## CONTEXT

You are working on bornclock.com. Repo: `~/Development/celeb-clock`
(Mac). Stack: React/Vite/TypeScript/Tailwind, Supabase (project
`jwrpqiypvystivtqyhro`), Cloudflare Workers. The project already has
1,534 unit tests and Playwright E2E coverage (37/37 passing as of last
sprint) — **you must extend this existing suite, not build a parallel
one, and you must not leave the suite in a worse state than you found
it.**

A complete, extensively-validated Vedic astrology calculation engine was
built in `scripts/vedic-lab/` over a prior session — entirely isolated
from production, never connected to the live site. Your job: (1) map
every place in the codebase that touches birth-chart data, (2) integrate
the engine behind a clean abstraction layer with ProKerala as fallback,
(3) build the reading/prediction UX on top, and (4) test all of it
properly — positive, negative, and edge cases, with real fixes verified
by full re-runs, not spot-checks.

---

## PHASE 0 — MANDATORY: MAP EVERY TOUCHPOINT BEFORE CHANGING ANYTHING

Do not write any integration code until this phase is complete and you
have a written list to work from. This is the step that prevents
silently breaking something you never looked at.

### 0.1 Find every caller of birth-chart data

Search the entire codebase (not just `api/kundali.ts` and
`api/vedic-profile.ts`) for:
- Every file that imports or calls ProKerala endpoints directly
- Every file that reads from or writes to the `vedic_chart_cache` Supabase table
- Every page/component that displays Rashi, Nakshatra, Dasha, Lagna, or dosha data (check: birthday report flow, `/kundali`, `/kundali-match`, celebrity bio pages using `src/data/celebrity-bios.json`, any admin/accuracy dashboard pages, any PDF generation code for reports)
- Every place that reads `chart.warnings` or would need to if polar-latitude handling is added
- Any background/cron job that pre-computes or batch-processes chart data

Produce a written inventory (a markdown file, `docs/vedic-integration-touchpoints.md`, committed to the repo) listing every file found, what it currently calls, and whether this session's changes affect it. This is a deliverable, not a mental note — a future session needs to be able to read it.

### 0.2 Identify downstream consumers of generated content

Once Part C's Gemini-generated readings exist, what consumes them?
Check: does the birthday PDF report pull from the same data? Does any
existing celebrity bio generation script share code paths with the new
reading generator? If celebrity pages will eventually get AI-generated
readings too, does this session's Gemini prompt structure need to
account for that reuse now, or is it explicitly out of scope? Document
the decision either way in the touchpoints file.

### CHECKPOINT 0 — before writing integration code

The touchpoints inventory must be reviewed (by you, reading it back)
for completeness before Phase A begins. If you find more than ~15
touchpoints, flag this to the user before proceeding — it may mean the
scope needs to shrink for this session.

---

## PART A: WHAT ALREADY EXISTS (the validated engine)

All files are in `scripts/vedic-lab/` in the repo — lab/prototype files.
Turning them into production code is part of this session's job, not a
given.

### Files and what's proven:

- **`vedicEngineStage1b.cjs`** — main engine. Exports `generateFullChart(birthDateUTC, refDateUTC, latitude, longitude)`:
  ```
  {
    ayanamsa, lagna: {...}, planets: {Sun,Moon,Mars,...each with rashi,nakshatra,pada,house,retrograde,combust,navamsaSign,...},
    currentMahadasha: {lord,start,end}, doshas: {mangalDosha,kaalSarpDosha,saturnTransit},
    warnings: [] // populated for polar latitudes (>66.56deg)
  }
  ```
  Also exports: `getLahiriAyanamsa`, `getNavamsaSign`, `calculateLagna`,
  `checkKaalSarpDosha`, `calculatePlacidusCusps`, `getKPSubLord`, and all
  16 divisional chart functions (`getHoraSign`, `getDrekkanaSign`,
  `getChaturthamsaSign`, `getSaptamsaSign`, `getDwadasamsaSign`,
  `getDasamsaSign`, `getShodasamsaSign`, `getVimsamsaSign`,
  `getChaturvimsamsaSign`, `getSaptavimsamsaSign`, `getTrimsamsaSign`,
  `getKhavedamsaSign`, `getAkshavedamsaSign`, `getShastiamsaSign`).

- **`sthanaBala.cjs`, `kalaBalaFinal.cjs`, `chestaBala.cjs`, `drikBala.cjs`** — complete Shadbala implementation.

- **`kaalSarpComplete.cjs`** — full Kaal Sarp classification (full/partial, 12 types, direction). Exports `getKaalSarpDetails(chart)`.

### Validation status — confidence table (governs test expectations AND UI copy tone)

| Component | Confidence | Test as | UI tone |
|---|---|---|---|
| Rashi, Retrograde, Nakshatra, Pada, Dasha | 100% vs 2 independent providers | Exact-match assertions | Full confidence |
| Lagna, Houses (non-polar) | ~99.99%, 0.004deg precision | Exact-match assertions | Full confidence |
| Mangal Dosha (binary) | 99-100% vs 2 providers | Exact-match assertions | Full confidence |
| Sade Sati/Dhaiya | 100% vs ProKerala | Exact-match assertions | Full confidence |
| Kaal Sarp (full/partial/type/direction) | 96-100% | Exact-match, allow documented ~4% edge-case tolerance | Full confidence |
| Navamsa (D9), D10, D16, D20, D30, D45 | 100% or primary-text-verified | Exact-match assertions | Full confidence |
| D2,D3,D4,D7,D12,D24,D27,D40 | Multi-source verified, not live-API-checked | Exact-match against known test values | Full confidence |
| **D60** | **One of 3 documented competing methods** | Exact-match against OUR chosen method only | **MUST show "one interpretation" disclaimer in UI** |
| KP sub-lord/sub-sub-lord (planets + houses) | 100% vs 2 providers | Exact-match assertions | Full confidence |
| Placidus houses | 0.004deg precision, EXCEPT polar | Exact-match; separate test for polar warning | Full confidence (non-polar) |
| Shadbala: Naisargika, Dig Bala | 100% exact vs live data | Exact-match assertions | Full confidence |
| Shadbala: Sthana Bala | ~94% accurate, known small residual | Range/tolerance assertions, not exact | "Indicative strength," softened |
| Shadbala: Chesta Bala | ~80% accurate (modern-equivalent method) | Range/tolerance assertions | "Approximate," softened |
| Shadbala: Kala Bala, Drik Bala | Component-verified | Exact-match on sub-components | Full confidence |
| **Polar latitude (>66.56deg)** | **Known unreliable** | Must produce `warnings` array with `POLAR_LATITUDE` code | **Must surface warning banner, never show chart as normal** |

Ground truth credentials: ProKerala (`VITE_PROKERALA_CLIENT_ID`/`SECRET`
in `.env.local`), AstrologyAPI (`ASTROLOGYAPI_USER_ID`/`API_KEY`).

---

## PART B: BUILD THE ABSTRACTION LAYER

### B1. Engine-agnostic interface

Create `src/lib/vedic/calculateBirthChart.ts`:

```typescript
interface BirthChartInput {
  year: number; month: number; day: number;
  hour: number; minute: number;
  latitude: number; longitude: number; timezoneOffset: number;
}

interface BirthChartResult {
  lagna: {...}; planets: {...}; nakshatra: {...}; rashi: string;
  currentDasha: {...}; doshas: {...}; divisionalCharts: {...};
  shadbala?: {...};
  source: 'local' | 'prokerala'; // internal debugging only
  warnings: Array<{code: string; message: string}>;
}

async function calculateBirthChart(input: BirthChartInput, options?: {includeShadbala?: boolean}): Promise<BirthChartResult>
```

### B2. Port lab files to production code

Move (don't just require from `scripts/vedic-lab/`) validated engine
files into `src/lib/vedic/engine/`. Convert to TypeScript/ESM matching
codebase conventions. Add types. Add JSDoc referencing the confidence
table above.

### B3. Fallback logic

1. Try local engine first.
2. Polar latitude → still compute, pass `warnings` through untouched.
3. Only fall back to ProKerala on local engine error, or a feature not yet ported (should be none — build the path anyway).
4. Reuse the EXISTING `vedic_chart_cache` Supabase caching and the EXISTING rate-limit-error-detection fix in `api/kundali.ts` (`checkProKeralaStatus` pattern) — do not rebuild or remove these.

### B4. Update every touchpoint found in Phase 0

Using your Phase 0 inventory, update each caller. Do not rely on memory
of "the two files I know about" — work through the actual list.

### B5. D60 disclaimer

Anywhere D60 appears in UI, include a brief "one of several classical
traditions" note.

---

## PART C: TESTING — POSITIVE, NEGATIVE, EDGE CASES

**This is not optional polish. Do this before Checkpoint 1.**

### C1. Unit tests (extend existing suite, check current test file locations/patterns first)

**Positive cases:**
- Reference chart (1988-11-05, 12:30 IST, Delhi): assert exact values per confidence table (Rashi=Kanya, Nakshatra=Uttara Phalguni, Pada=2, Mahadasha=Rahu, Antardasha=Moon, MangalDosha=false, KaalSarp=false, Lagna=Makara)
- At least 5 additional charts spanning different decades/hemispheres with known-correct values (reuse the 100-chart test set already validated in `scripts/vedic-lab/` if still present — check for `all-100-charts.json` and its validated ProKerala/AstrologyAPI results before regenerating)

**Negative cases:**
- Missing/invalid date fields → should throw a clear, typed error, not a silent wrong chart
- Invalid latitude/longitude (e.g. lat > 90) → clear error
- Malformed timezone offset → clear error
- ProKerala fallback path when local engine is forced to fail (mock this) → confirm fallback actually fires and result is still usable

**Edge cases:**
- Polar latitude chart (e.g. 69.6°N) → confirm `warnings` contains `POLAR_LATITUDE`, confirm chart still returns *some* data rather than crashing
- Leap day birth (Feb 29)
- Exact midnight and one-minute-before/after midnight births
- A chart where Kaal Sarp is genuinely borderline (reuse the known ~4% residual test cases from prior validation if the files still exist in `scripts/vedic-lab/`)
- Cache behavior: same chart requested twice returns identical result on 2nd call with no new ProKerala call (mock/spy on the ProKerala call to confirm zero calls on cache hit)
- Gemini API failure during reading generation → page should degrade gracefully (show chart data without AI narrative, not crash or show a broken page)

### C2. Playwright E2E tests (extend existing suite)

Check the existing Playwright test structure/conventions first
(`playwright.config.ts`, existing test files) and match the pattern.

**Positive flow:**
- User enters valid birth details on the Kundali/birthday-report page → page loads → chart data displays correctly → reading sections render with generated text (not loading spinners stuck, not empty)
- Screenshot/visual check that D60 disclaimer is visible when D60 is shown

**Negative flow:**
- User submits the form with missing required fields → appropriate validation message shown, no crash
- Simulated API failure (mock the network call) → graceful error state shown to user, not a blank page or raw error stack

**Edge case flow:**
- Polar-latitude birth location entered → warning banner visibly rendered on the page (not just present in the API response — actually check it's in the rendered DOM)
- Very old birth date (e.g. 1901) and very recent (near "today") both render correctly

### CHECKPOINT 1 — run the FULL existing test suite, not just new tests

Run the complete unit test suite (`npx vitest run` or equivalent — check
existing package.json scripts) and the complete Playwright suite. Compare
pass count against the baseline (1,534 unit / 37 Playwright from before
this session). **If anything that previously passed now fails, that is
a regression you introduced — fix it before continuing, then re-run the
FULL suite again, not just the one test you fixed.** Repeat until the
full suite is green. Do not proceed to Part D with any red tests.

---

## PART D: READING & PREDICTION UX

### D1. Design philosophy

- Plain language over chart terminology. Organize by life area (Career, Relationships, Health, Money, Family), not by chart mechanics.
- Layer depth: 1-2 sentence summary → fuller paragraph → optional technical data behind a toggle.
- Never overclaim certainty: "this period is traditionally associated with..." not "you will...".
- Approximate-confidence components (D60, Sthana Bala, Chesta Bala) get visibly softer language than 100%-validated ones — this must be reflected in actual UI copy, not just code comments.

### D2. Build the reading experience

Check existing BornClock page structure/design system first — match it,
don't introduce a new visual style. Sections:

1. **Snapshot summary**: Rashi+Nakshatra+Lagna → 2-3 sentence Gemini-generated summary. Use existing `GEMINI_API_KEY` and reference existing prompt patterns (e.g. celebrity bio generation scripts) for tone. Cache generated text per unique chart alongside the chart cache.

2. **Life area breakdowns** (Career/Relationships/Health/Money/Family — align with what existing reports already cover): short paragraph per area, grounded in relevant chart data (house lords, planets in relevant houses, current Dasha) fed into the Gemini prompt. Log which chart fields fed each generated paragraph.

3. **Current period ("Right now for you")**: current Dasha translated to plain language. Prioritize quality here — most defensible prediction content.

4. **Doshas section**: plain-language explanation + remedies/context immediately alongside, not fear-based. Use computed Mangal Dosha severity label. Explicit de-stigmatization requirement — this is a known real-world harm area (marriage-market stigma).

5. **Divisional chart highlights**: 2-3 most relevant (Navamsa, Dasamsa) with brief explanations, not all 16. Full data behind an "advanced view" toggle.

### D3. Gemini prompt requirements

- Every generation prompt: no medical claims, no definitive financial advice, no absolute predictions, warm/constructive tone even for difficult placements, doshas framed as "areas needing attention" not "curses."
- Store the exact prompt + input chart data alongside each cached generated reading, for later quality debugging.

### CHECKPOINT 2 — manual + automated content review

Automated: add a test (unit or Playwright content-check) that scans
generated reading text for a blocklist of red-flag phrases ("you will",
"definitely", "must", specific medical/diagnosis terms, specific
financial instructions like "invest in", "buy", "sell"). Fail the test
if any appear.

Manual: a human reviews the full generated reading for the reference
chart on staging before this session is considered complete. Do not
mark this checkpoint done yourself — flag to the user that this review
is needed and wait.

---

## SESSION-END DELIVERABLE

Before ending this session, produce a short summary (in chat, not just
commits) covering:
- Full touchpoints inventory (from Phase 0) and what was changed at each
- Test suite status: before/after counts for both unit and Playwright, confirming no regressions
- Any component where confidence-table tolerances required non-exact-match test assertions, and why
- Explicit confirmation that Checkpoint 2's automated red-flag-phrase test is in place and passing
- What was deliberately deferred (e.g. the AI conversational agent — separate future session)

## WHAT NOT TO DO

- Do not build the AI chat/conversational agent (separate future prompt)
- Do not remove ProKerala fallback
- Do not change the Supabase cache schema without checking existing data compatibility
- Do not present Shadbala/Chesta Bala/D60 with the same confidence as 100%-validated components, in code OR copy
- Do not consider any phase done based on "no errors thrown" — check actual values and actual rendered UI
- Do not skip re-running the FULL test suite after each fix — spot-checking the one thing you fixed is how regressions slip through
