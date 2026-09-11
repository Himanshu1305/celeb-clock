# Part J — Phase 0 Touchpoints (dependency map)

Branch: `feature/gemstone-chat-profile-part-j` (off `feature/overnight-batch-part-i`).

## 1. Gemstone feature (Part I) — `src/lib/vedic/gemstones.ts`
- `buildGemstoneReport(chart)` → `{ primary (Lagna-lord stone), supportive[], methodology, disclaimer }`.
- Already Lagna-lord-based (good), but: no **Yogakaraka** flagging, no **Dasha-relevance**, no
  **functional-malefic avoidance table**, and the methodology note is generic, not generated
  from the real computed factors. → Part 1 REBUILDS this with the full hierarchy + a real
  per-chart methodology note (accuracy-checked). Endpoint `api/gemstones.ts`, page `GemstonePage.tsx`.

## 2. Astrologer chat — `src/lib/vedic/chatGuardrails.ts` + `api/vedic-chat.ts`
- `buildChatSystemPrompt(facts)` builds context: placements, dasha, doshas, and (D-Fix3) a
  COMPUTED TIMING WINDOWS block. **It does NOT yet expose the detected Yogas (with grades +
  conditions) or the Nakshatra meaning as citable facts** — but `facts.yogas` (name/grade/
  summary/note/conditions) and `facts.nakshatra.meaning/significance` ARE already on ReadingFacts
  (Part G/D-Fix3), so no new data plumbing is needed — Part 2 just surfaces them + guards them.
- Guardrails live as 8 numbered SAFETY RULES in the prompt; `scanChatResponse()` post-scans for
  banned language; `verifyTimingClaims()` (readingSpecificity.ts) is the date accuracy guard;
  `buildChatReply()` (api/vedic-chat.ts) runs the 3-attempt retry loop that gates BOTH banned
  language AND fabricated dates. → Part 2's Yoga-citation guard sits in the SAME loop, reusing
  the SAME `verifyReadingClaims` yoga-claim logic (extract → cross-check vs facts.yogas → retry).

## 3. Saved-profile store (Part E) — `src/services/savedProfile.ts` + `useSavedProfile`
- Schema `{ dob, time, city:{name,lat,lon,tz}, savedAt? }` — **all of dob+time+city currently
  REQUIRED** (`isValidProfile` rejects partial). → Part 3 relaxes this to progressive:
  **dob required; time & city optional** (validated if present); add `isFullVedicProfile()` +
  `mergeProfile()`. Opt-in + device-only localStorage is UNCHANGED (privacy model preserved).
- Direct `profile.time` / `profile.city.*` consumers to guard behind "is it full?":
  `KundaliPage` (banner + `usingSaved`), `KundaliMatchPage` (saved-A + coordsA), `AstrologerChat`
  (city.name label), `BirthTimeVedicSection`, `chatService.ts`, and the 4 Part I tool pages
  (pass profile as `initial` — partial is fine for pre-fill).

## 4. Birth-data collection points (full list)
- **Vedic cluster (already share `useSavedProfile` + `BirthDetailsForm`)** → progressive-wire these:
  Kundali, Kundali Matching, Astrologer chat, Sade Sati, Muhurat, Career Report, Gemstones,
  Baby Names, birthday-report Vedic section (`BirthTimeVedicSection`).
- **Birthday Report** (`BirthdayReport.tsx`) — uses its own form; date-centric.
- **Age Calculator** — see below.

## 5. Age Calculator — RISK ASSESSMENT → **DEFER integration** (per Phase 0 caution)
- `src/pages/AgeCalculatorPage.tsx` uses `useBirthDate` from `@/context/BirthDateContext` +
  the `<AgeCalculator>` component + `useAgeCalculator` hook — a **separate, pre-existing state
  mechanism**, NOT `useSavedProfile`/`BirthDetailsForm`. First committed 2026-03-05 ("Changes"),
  predating the Vedic engine work; it's a working feature unrelated to the Vedic cluster.
- Per the spec's explicit permission: modifying it is **higher-risk** and the core progressive
  win (Kundali ↔ Matching ↔ chat ↔ Part I tools) does not depend on it. → **Age Calculator
  progressive integration is DEFERRED** and flagged. A future low-risk option: a read-only
  "use your saved birth date?" banner that calls the existing `BirthDateContext` setter, without
  touching the calculator's core.

## Not built (per WHAT NOT TO DO): gemstone sales flow; changing the opt-in/device-only model;
## weakening any existing guardrail; merge/deploy.
