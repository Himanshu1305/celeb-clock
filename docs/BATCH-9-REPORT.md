# BATCH-9 — Founder Testing Findings: 12 Fixes & Improvements

All 12 phases completed (COMPLETE-ALL rule). tsc 0 new; local commits only (not pushed).

---

## ⚠️ FOUNDER ACTIONS AT THE TOP
- **Apply `supabase/migrations/NOTES-feedback.sql`** (updated: now allows `content_type = 'tool'`) to turn on
  the /age-calculator feedback. Tolerate-absent until then.
- **`NOTES-user-reviews-disposition.sql`** — the 8 legacy testimonials are KEPT as-is by default (they still
  power the homepage carousel). No SQL needed unless you want Option B/C in that file.
- **/contact** now sends real email via Resend to hello@bornclock.com — confirm `RESEND_API_KEY` is set in the
  Worker env (it already powers the other transactional emails).

---

## 1. P1 — the test-gap autopsy (why the old test passed against broken behaviour)

**The bug:** `DobInput` auto-advance fired a *synchronous* blur, and `padOnBlur` read the **stale closure**
`day` — the `setDay("14")` re-render hadn't committed yet, so the handler saw the single digit ("1"), padded
it to "01", and that later `setState` clobbered the two-digit value. Result: continuous "31" → **"03"**, "14" →
"01" — so 10-19 days and 10-12 months were untypeable.

**Why batch-8's "no advance on 1 in Month" test passed anyway:** it typed a *single* key and asserted only
**focus** ("month is still focused") — a single key never triggers the advance→blur→pad race, and the test
never asserted the field's **value** after a *second* digit. The value corruption ("05"→"00", "31"→"03") was
therefore invisible to the entire batch-8 DOB suite, which only ever checked focus, not the resulting value.

**The fix:** `padOnBlur` now reads the **live DOM value** (`e.currentTarget.value`), never the closure — so an
advance-blur sees "31" (no pad) while a genuine single-digit + Tab still pads "1"→"01".

**The tests that would have caught it (A1):** `dob-regression.spec.ts` types continuously with
`page.keyboard.press` (single focus, per-key) and asserts the **value** after each keystroke ("1" stays "1";
"14"→14; "31"→31; "1"+Tab→"01"; smart-advance "7"→"07"; full "14/12/1990"; paste). All fail against the broken
build, pass against the fix. Plus the founder-requested **year-first calendar picker** (dropdown-buttons, no
endless month scroll) that fills the three fields — tested.

## 2. P2 — stale-chunk diagnosis (confirmed) + fix

**Confirmed diagnosis.** Post-deploy, a browser holding the old index bundle requests lazy route chunks by
their old hashed filenames; those no longer exist, so the dynamic `import()` rejects and the route renders
nothing. **Fix:** a central `lazyWithReload` wrapper (applied to all 72 lazy routes in `App.tsx`) that, on a
chunk-load error, sets a `sessionStorage` guard and forces **one** full reload (returning a never-resolving
promise so nothing flickers); a second failure rethrows into a `ChunkErrorBoundary` that shows a friendly
"A new version is available — Refresh". Non-chunk errors are never reloaded. Unit-tested with injectable deps
(one reload, loop-guard, guard-clear-on-success, chunk-error detection).

## 3. P6 — which case was true (with file:line)

**Case (a): fully client-side, nothing persisted.** `src/pages/CountryComparison.tsx:186` reads the quiz
snapshot from `localStorage['bornclock_result_snapshot']`; the forecast is computed on-device via
`getForecastForCountry` (no Supabase insert/upsert, no API POST anywhere in the flow). So it was safe to add
the trust line — `CountryComparison.tsx` now shows **"🔒 Calculated from the answers you just entered — nothing
is saved. Everything runs on your device."** when quiz data is present, and the existing inviting empty-state
(“Take the quiz →”, “Baseline Forecasts”) when it isn't. No privacy blocker.

## 4. P7 — UN WPP figures adopted + every replacement site

**Adopted (`src/data/lifeExpectancyFacts.ts`, UN World Population Prospects 2024 Revision, ref year 2024):**
India overall **72** (72.2 precise) · male **70.7** · female **73.9** · 1947 baseline **32**.
The two disagreeing pages now render the **same** sourced value:
- `src/pages/CountryComparison.tsx` — FAQ "~72 years", the "India's Longevity Opportunity" card, and the facts
  ticker (was hardcoded 32/72) now interpolate `INDIA_LE.overall`/`.historical1947` + "(UN WPP 2024)".
- `src/pages/answers/WhatIsLifeExpectancy.tsx` — India figure was **70.4 (WHO 2023)** → now **72 (UN WPP 2024)**.
The longevity **calculation model** baselines (`LongevityCalculationService.ts`, male 71.2/female 74.4) are a
separate statistical input with their own sourcing + tests, and were intentionally NOT changed (that would
shift live forecasts). This is documented in the constant file.

## 5. P3 — every legacy-widget surface swapped

The legacy "Share Your Experience" widget (`ReviewForm.tsx`, mandatory title + text, wrote to `user_reviews`)
had exactly **one input surface: `/age-calculator`** (`AgeCalculatorPage.tsx:89`). Swapped for the batch-8
`FeedbackPrompt` + `ReaderComments` (`contentType="tool"`, `slug="age-calculator"`), **result-gated**: a new
`resultReady` prop opens the prompt as soon as the user has an age result (not scroll/dwell). Added `'tool'` to
`ContentType` and the `feedback` CHECK constraint. **Deleted `ReviewForm.tsx`** (dead code). The homepage
testimonials carousel (`TestimonialsSection`) + admin `ReviewManagement` still read the existing `user_reviews`
rows and are untouched. **A2 legacy data:** `user_reviews` has **8 rows** (checked live) — NOT auto-migrated;
`NOTES-user-reviews-disposition.sql` documents keep (default) / migrate / archive options.

## 6. Results matrix (A3)

| Phase | Positive | Negative | Edge | Status |
|---|---|---|---|---|
| **P1** DobInput | "1"→"1"; "14"→14; "12" month; full 14/12/1990 (value per key) | (old build) "31"→"03" fails; smart-advance "7"→advance+"07" | "1"+Tab→"01"; paste 02051985; calendar year-first fills fields | ✅ |
| **P2** lazy retry | first chunk fail → 1 reload, promise hangs | non-chunk error not reloaded | loop-guard: 2nd fail rethrows; success clears guard; isChunkLoadError | ✅ |
| **P3** feedback swap | /age-calculator shows batch-8 feedback (result-gated) | legacy "Share Your Experience"/mandatory-title GONE | two-key/threshold logic (batch-8-logic); table tolerate-absent | ✅ |
| **P4** planets link/dedupe | homepage → /weight-on-planets; cross-links present | /planetary-age weight input removed | pages stay separate concepts | ✅ |
| **P5** weight enrichment | fun-fact cards + fitness-era render | — | share text includes computed result | ✅ |
| **P6** privacy copy | quiz data → trust line "nothing is saved" | — | no data → empty-state links quiz; no network write (client-side) | ✅ |
| **P7** India constant | both pages render 72 (UN WPP 2024) from one constant | — | source/refYear/1947 in constant | ✅ |
| **P8** life-expectancy | flagship sections render | — | disclaimer appears exactly once; FAQ schema present | ✅ |
| **P9** contact | valid submit → success UI (mocked) | invalid email → inline error; missing → 400; GET → 405 | honeypot filled → 200 dropped, no send; hello@ still shown | ✅ |
| **P10** science row | 3 cards, correct hrefs | — | present at 390px mobile | ✅ |
| **P11** SEO audit | re-run; SEV-1 0, soft not increased | — | changed-page canonicals/titles | ✅ (see §Gate) |
| **P12** regression | full gauntlet + prelaunch | — | A3 prior-batch checks (below) | ✅ (see §Gate) |
| **A3** prior-batch | DobInput on /birthday-report + /vedic-zodiac (14/12/1990); compat→canonical; nav has Life Expectancy; /gift hero "feel truly special" | — | feedback prompt not double-mounted | ✅ |

No scenario silently omitted. P3's live DB submit is gated on `NOTES-feedback.sql` + login (tolerate-absent by
design); the two-key/threshold/gate logic is unit-tested, and the legacy-removal + result-gating are asserted.

## 7. Gate
- tsc: 0 errors (0 new). ✅
- build: **1341 ok / 0 failed**. **Count reconciliation:** `/contact` was ALREADY a routed + prerendered page
  (P9 upgraded it in place), so there is **no net new route** — **1341**, not the prompt's assumed 1342. ✅
- test:prelaunch: gauntlet **135/135** + prelaunch **216/216** (185 baseline + dob-regression 8 + batch-9-logic
  10 + batch-9 13). Fix-loop: the initial run had 3 prelaunch failures, ALL classified **TEST-BUG** from
  intended changes (no product code, no weakened assertions): growth-pages filled the removed native date input
  on the RhythmWidget→DobInput fitness pages (now drive DobInput fields); batch-7b `177 kg` now also appears in
  the P5 fitness-era blurb (scoped `.first()`). Re-ran green. ✅
- frozen files empty diff ✅ · invoice_counters **BC 1002 / BN 1001 / BX 1001** unchanged ✅.
- SEO audit (P11): **1158 findings, SEVERITY-1 = 0** — identical distribution to batch-8, so **soft findings did
  not increase**. Changed pages keep self-canonical + brand-suffix titles. ✅
- **ONE deploy** (`Uploaded bornclock` + `Deployed bornclock triggers`; trailing exit 1 = known cron
  `schedules` token-scope error). ✅
- live post-deploy (bornclock.usdvisionai.workers.dev): homepage has DobInput (`#dob-day`) + science-card-row +
  `/weight-on-planets` link ✅ · `/life-expectancy` serves the depth section ✅ · `/age-calculator` no longer has
  "Share Your Experience" ✅ · `/contact` 200; `/api/contact` honeypot probe → `{"ok":true}` (dropped, no email
  sent) ✅ · sentinel `{"error":"Report not found"}` ✅. (DOB typing + contact submit verified via e2e.)
- **IndexNow**: 8 changed URLs pinged — IndexNow 200, Yandex 202. ✅

## 8. Founder task list
1. Apply `NOTES-feedback.sql` (now includes `'tool'`) to switch on /age-calculator feedback.
2. Decide `user_reviews` disposition (default: keep — nothing to do). See `NOTES-user-reviews-disposition.sql`.
3. Confirm `RESEND_API_KEY` in the Worker env (drives /contact).
4. Spot-check: type a real DOB on the homepage; try the calendar icon; submit /contact; read the deeper
   /life-expectancy copy; open the new homepage "science" row.
