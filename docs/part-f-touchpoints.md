# Part F (AI Astrologer + Guardrails) — Phase 0 Touchpoints & Scope

> Deliverable for `docs/BornClock_PartF_AIAgent_Guardrails.md` Phase 0. Written
> before feature code. Builds on Parts B/D/E. **Highest-risk session so far.**

## Where the birth data comes from (privacy)
- The chat reads the **Part E saved profile** (`useSavedProfile` / `savedProfile.ts`) — which is written **only on explicit user opt-in**. The chat therefore uses birth data the user already consented to save; it never silently pulls anything.
- If **no saved profile exists**, the chat does NOT guess a chart — it prompts the user to add their birth details first (links to `/kundali`), respecting Part E's opt-in model.
- Grounding: chart computation is Node-only (Part B engine), so the chat **endpoint** receives the saved birth params, computes the chart via `calculateBirthChart()`, and grounds every answer in the computed facts (reuses Part D's `extractReadingFacts`).

## Database / storage
- **No new table created.** Consistent with Parts B/D/E (migrations can't be reliably applied/verified from this environment).
- **Conversation history: session-only.** Held in the client's React state and passed to the stateless endpoint per request for context. Nothing is persisted server-side — this matches the existing `api/longevity-coach.ts` **zero-retention** guarantee and is *privacy-positive* (the "nobody else sees your conversation" value prop). Documented as the deliberate choice per Phase-0's defer-to-session guidance.
- **Rate-limit counts: client-side localStorage this session.** The counting + enforcement LOGIC is a pure, unit-tested module; its persistence is localStorage (per-day record). This is bypassable by a determined user (clearing storage) — durable, tamper-proof enforcement needs a server-side usage table + the payment system, both deferred. Flagged plainly.

## Existing patterns reused
- **AI endpoint:** `api/longevity-coach.ts` — Gemini via `systemInstruction` + `safetySettings` + graceful degradation + zero-retention. The chat endpoint extends this to **multi-turn** (a messages array) and adds chart grounding + guardrails.
- **Chat UI:** `src/components/LongevityCoachChat.tsx` — message list, suggestion chips, loading dots, markdown, error state. The astrologer chat mirrors this design (no new visual style).
- **Paid-tier gating:** `profile.premium_status` exists (`useAuth`). Used as the tier flag; the payment/subscription system is NOT built here (per spec) — paid access is a clearly-flagged stub.
- **Output safety scanner:** Part D's `scanForRedFlags` (`readingPrompts.ts`) is reused and extended (adds medical-diagnosis + definitive-financial patterns).

## ⚠️ Crisis-response copy — NONE EXISTS TO REUSE
- The spec says to **reuse existing crisis-resource copy** if the product has any. A thorough search (`crisis`, `self-harm`, `suicide`, `988`, `helpline`, `AASRA`, `iCall`, `Vandrevala`, `samaritans`, etc.) found **no existing crisis copy anywhere** in the codebase.
- Therefore this session must **author new crisis-support wording** (warm, non-astrological, with India + international resources). **This is safety-critical net-new copy that a human MUST read and approve before go-live.** Surfaced here and in the final summary; the exact words will be pasted for review.

## Guardrail architecture (defense in depth — the core of the session)
1. **Input pre-scan (deterministic, overrides everything):** before any AI call, scan the *user message* for crisis/self-harm signals. On a hit → return the crisis-support response directly, drop astrology entirely, do NOT call the model. This makes the crisis guardrail model-independent.
2. **System prompt:** encodes all 7 guardrail categories (health, crisis, major-decision, manipulation, financial, certainty/tone, grounding).
3. **Output post-scan:** the model's reply is scanned for red-flag/medical-diagnosis/financial-instruction language; a flagged reply is replaced with a safe fallback, never shown.
4. **Grounding log:** each response records which chart fields informed it (auditability, like Part D).

## New/edited touchpoints
| # | Item | New/edited |
|---|------|-----------|
| 1 | `src/lib/vedic/chatGuardrails.ts` — crisis detector, crisis copy, output scanner, system prompt | NEW |
| 2 | `src/lib/vedic/rateLimit.ts` — pure counting/enforcement (3 free / 15 paid, daily reset) | NEW |
| 3 | `api/vedic-chat.ts` — multi-turn Gemini + grounding + guardrails + rate-limit | NEW |
| 4 | route in `functions/_worker.ts` | edit |
| 5 | `src/services/chatService.ts` — client caller | NEW |
| 6 | `src/components/reading/AstrologerChat.tsx` + `src/pages/AstrologerPage.tsx` (`/astrologer`) | NEW |
| 7 | `src/components/KundaliTabs.tsx` — turn the "soon" placeholder into a real link | edit |
| 8 | unit + Playwright tests | NEW |

## Scope verdict
**Moderate (~7 integration points), comparable to Part D — not a scope surprise, so proceeding.** The genuinely elevated risk is *safety*, not size: it's handled by the defense-in-depth guardrails above, exhaustive safety tests with pasted real AI text, and a required human review of the authored crisis copy + several real conversations before go-live.
