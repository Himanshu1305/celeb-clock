# Part AC — flags & notes (Part S Parts 2–6, built on branch `part-ac`)

Branch `part-ac` off the post-merge `develop` (full B→X stack). Part S's own Part 1
(the merge) was already executed as a separate gated step; this branch does Parts 2–6.

## Scope reality (important, honest)
The Part S spec was written BEFORE Parts O–X were built. Several Part S items were
already delivered by the O–X work that `develop` now contains. Verified, not rebuilt:

- **Part 4.1 (Kundali four-dimension depth)** — `buildInterpretationBlocks`
  (`src/services/kundaliService.ts`, "Part O Item 1.1") already gives Lagna, Rashi,
  Nakshatra, Sun, Moon and Dasha the what/why/for-you/how-it-connects structure,
  reusing the real Nakshatra-meanings layer and Dasha engine. Dosha depth is delivered
  by the reading's dedicated `doshas` section (AI + deterministic fallback in
  `VedicReading.tsx`) shown on the same page — not duplicated into a deterministic block.
- **Part 4.2 (chat names chart factors first)** — the `STRUCTURE` block in
  `buildChatSystemPrompt` already instructs a factor lead-in before the answer.
- **Part 4.3 (Matching per-Koota depth + named Tara types)** — `matchmaking.ts`
  ("Part O Item 1.3") already has all nine `TARA_NAMES`, per-Koota `practicalNote()`
  for strong/weak practical meaning, Nadi/Bhakoot heavy weight, and calm dosha framing.
- **Part 5 (Navamsa D9 Moon consistency)** — already fixed in Part O (Item 2):
  `readingPrompts.ts` sets `divisional.d9Moon` from `chart.divisionalCharts.d9.Moon`.
  VERIFIED on both real charts (see below): calc `d9.Moon` == advanced-view `d9Moon`
  == narrative-source `d9.Moon` == **Simha** for both. No residual mismatch.

## Genuinely new in Part AC
- **Part 2 — tense-aware marriage timing** (`chatGuardrails.ts`, `yogaTiming.ts`,
  `api/vedic-chat.ts`): `detectQuestionTense` (past/future/ambiguous); past-tense →
  ended windows only with the verbatim honest opener; future-tense → upcoming/ongoing
  with "heightened possibility, not a fixed certainty"; ambiguous → both directions.
  Windows are Antardasha-level Venus / 7th-lord / Jupiter, filtered against the real
  server date. Added `past` windows to `TimingFactCategory` + whitelisted their dates.
- **Part 3 — already-married / second-marriage guardrail**: `detectAlreadyMarried`,
  `detectSecondMarriageQuestion`, a system-prompt directive at the same priority as the
  crisis/health/financial rules, AND deterministic enforcement (`verifyMarriageGuardrail`
  wired into the chat retry loop) — an already-married/past question can never surface a
  future window and never volunteers a second marriage; a direct second-marriage question
  is answered with the "no predictive evidence" caveat.
- **Part 6 — account-synced reading history** (`readingHistorySync.ts`,
  `useReadingHistorySync.ts`, wired in `KundaliPage.tsx` + `ReadingHistory.tsx`): mirrors
  `profileSync.ts`. Non-destructive merge (union by dob+Dasha, most-recent-first, capped),
  account authoritative, device-only entries preserved and surfaced. Admin/testing
  identities are sync-ineligible (isolation); accounts are keyed by `user_id`.

## ⚠️ Manual step required for Part 6 live sync (one-time, like Part L's birth_profile)
The `profiles.reading_history` (jsonb) column does NOT exist yet, and the REST service
key cannot run DDL (no `exec_sql` RPC; confirmed `birth_profile` reachable → key/table OK).
Until the column is added, reading-history sync degrades gracefully to device-only
(exactly as before). To activate cross-device sync, run in Supabase SQL editor:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reading_history jsonb;
```

Then add `reading_history: Json | null` to the profiles Row type in
`src/integrations/supabase/types.ts` (optional; sync uses a loose cast and works without).
The live two-client round-trip test also needs a NON-admin account (admin identities are
deliberately sync-ineligible).

## Verified real windows (NOW = 2026-09-20; both people married June 2006)
- **Himanshu 1978-05-13 Jammu** — marriage significators Saturn (7th lord), Venus, Jupiter.
  Past: Venus antar Jun 2017–Oct 2020; Saturn antar May 2015–Jun 2016; Jupiter antar
  Jun 2014–May 2015. Current: Venus Maha 2017–2037. No listed window brackets June 2006 →
  the honest framing says so ("if not, that's worth knowing too") rather than forcing a fit.
- **Second 1981-07-09 Patna** — significators Jupiter, Venus. Past: Venus antar
  Jun 2013–Feb 2016; Jupiter Maha Jul 2005–Jul 2021; Jupiter antar Jul 2005–Sep 2007
  (this one DOES bracket June 2006). Upcoming: Venus antar May 2028–Jul 2031.

Per the Part AB research (rejected), these are NOT graded on event-matching accuracy —
the bar is honest framing + correct tense/date filtering, which holds for both charts.

## Tests
- `src/lib/vedic/__tests__/marriageTiming.test.ts` (Parts 2 & 3, 16 tests) — both real charts.
- `src/services/__tests__/readingHistorySync.test.ts` (Part 6, 8 tests).
- Full unit suite: 1831 → 1855 (24 new). Existing safety/timing/yoga suites unchanged.
