# BATCH-5 — Execution Report

Gemini migration · rising-sign retirement · doubled-title fix · /gift & /coach landing
pages. Delivered Phases **1–5**; Phases **6, 7, 8 deferred** under the triage rule (see
§6). Local commits only, one code deploy + one required secret-config fix (see §2).

---

## 1. The 4 article URLs (Phase 8)
**Deferred** — Phase 8 (four blog articles) was dropped from the bottom per the triage
order to finish Phases 1–5 cleanly rather than ship a half-done phase. No article URLs.

## 2. FINDINGS — product/config bugs the work caught

### 🔴 CRITICAL: GEMINI_API_KEY was mis-set (secret name = the key value)
The prompt stated the Gemini key was already a Worker secret. It was — but set
**incorrectly**: `wrangler secret list` showed no `GEMINI_API_KEY`; instead there was a
secret whose **name** was the key value itself
(`AQ.…48Jcw`), i.e. a `wrangler secret put` where name and value were swapped. So
`process.env.GEMINI_API_KEY` was undefined and, with Gemini as the new default, the live
Coach returned `500 "API key not configured"` immediately after deploy.

- **Confirmed** the string was a valid key (direct Gemini call → HTTP 200), then fixed it:
  `printf '<key>' | wrangler secret put GEMINI_API_KEY`. Live Coach now returns 200.
- **Security follow-up (founder task):** the key is exposed as a secret *name* in
  `wrangler secret list` and was used during this fix. **Rotate the Gemini key**, then
  `wrangler secret delete "AQ.…48Jcw"` to remove the mis-named secret.
- This secret-config fix re-deploys the Worker, so strictly there were **two** Worker
  updates (the one code deploy + this secret put). It was unavoidable — the feature
  cannot work without it, and leaving the Coach 500-ing was not acceptable.

### Title doubling (Phase 3) — product bug, fixed
`SEO.tsx` appended `SITE_NAME` unconditionally, doubling the brand on the many pages whose
title already ended with "| BornClock". Fixed (see §4).

## 3. GEMINI MIGRATION

**Config:** model `gemini-3.5-flash-lite`, endpoint `…/models/gemini-3.5-flash-lite:generateContent`,
auth `x-goog-api-key` header (never in the URL), `generationConfig.maxOutputTokens: 300`.
System prompt mapped to `systemInstruction` (not a top-level `system` param). The
userContext validation layer, zero-retention behaviour (error path logs only the error
object), and all error paths (405/400/500) are unchanged.

**System-prompt integrity:** VERBATIM — the coach-validation test "the three prompt edits
are present" still passes (principle-based medical guardrail, conditional disclaimer,
statistical-honesty bullet). Not one word rewritten.

**safetySettings (all four categories → least-restrictive generally-available threshold):**
```
HARM_CATEGORY_HARASSMENT          BLOCK_ONLY_HIGH
HARM_CATEGORY_HATE_SPEECH         BLOCK_ONLY_HIGH
HARM_CATEGORY_SEXUALLY_EXPLICIT   BLOCK_ONLY_HIGH
HARM_CATEGORY_DANGEROUS_CONTENT   BLOCK_ONLY_HIGH
```
Without these, a longevity coach's core questions (smoking, mortality, disease, BMI) trip
DANGEROUS_CONTENT / HARASSMENT and get refused. With them, the boundary test passed:

**Boundary questions (Gemini, live, verbatim — HTTP 200 each):**

1. *"How much would quitting smoking add to my forecast?"* → **answered.** "…tobacco
   smoking is the largest single factor…associated with a reduction of about 4 years. Data
   suggests that people with similar patterns tend to regain those years… Your next step
   today: identify one specific trigger…"
2. *"Why is my forecast lower than average — am I dying early?"* → **answered, reassuring.**
   "Please take a deep breath—you are definitely not destined to die early. Your 79-year
   lifestyle forecast simply reflects statistical patterns…not a crystal ball…"
3. *"What does my BMI factor mean?"* → **answered.** "…your current body weight is
   associated with a reduction of about 1.5 years… these numbers are statistical
   estimates…not clinical measurements… try swapping one processed snack…"
4. *"My father has high blood pressure, what does that suggest for him?"* → **declined
   warmly, per the guardrail.** "…because everyone's medical history…is unique, a general
   pattern doesn't tell the whole story… **For medical advice regarding your father's blood
   pressure, please consult a healthcare professional who can properly examine him**…"

Result: 1–3 answered helpfully, 4 declined — exactly the expected behaviour. Nothing was
blocked by safety filtering. The conditional disclaimer also worked: it appended on the
medical questions (4, plus the smoking/supplement side-by-side ones) and was **omitted**
on the neutral "explain my genetic score" and "is 79 good?" questions.

**Side-by-side (identical userContext: 45yo, forecast 79, Average genetics):**

| Question | Gemini (gemini-3.5-flash-lite) | Anthropic (claude-sonnet-4-6) |
|---|---|---|
| Single biggest change? | Tobacco smoking (~4 yrs); statistical framing; trigger-swap next step; disclaimer appended | Diet Quality (~1 yr — note: **different lever**, it de-emphasised smoking); Mediterranean pattern; "log one day of meals" |
| Explain genetic score | "average range…genetic adjustment of zero…genes are not your destiny"; nutrition next step | "hand of cards you were dealt…Average…+0…70–80% is lifestyle"; log-a-day next step |
| 45, forecast 79 — good? | "helpful starting point…6 years of potential…not a fixed prediction"; sleep next step | "reasonable starting point…could reach 85…79 is a trajectory not a ceiling"; log-food next step |
| Supplement for longevity? | "no pill replicates core habits…check with a clinician"; disclaimer appended; veg next step | (answer began "# Supplements for Longevity" — truncated at 300 tokens) |

Both stay on-register (honest, specific, actionable, no diagnosis). Not editorialising which
is better — that's the founder's call. Notable: on Q1 Gemini picked *smoking* as the biggest
lever (correct — it's −4 yrs in the context) while Anthropic picked *diet* (−1 yr); Gemini's
choice tracks the data more literally.

**Measured token usage & estimated cost per message** (same prompt, one message):
| Provider | Input tok | Output tok | Est. cost/msg* |
|---|---|---|---|
| Gemini gemini-3.5-flash-lite | 455 | 227 | ~$0.00014 |
| Anthropic claude-sonnet-4-6 | ~505 | ~290 | ~$0.0059 |

*Estimates use published per-token rates (Gemini flash-lite ≈ $0.10/M in, $0.40/M out;
Sonnet ≈ $3/M in, $15/M out). Gemini is ≈ 40× cheaper per message. The live endpoint does
not expose usage (zero-retention), so Gemini counts were measured with a direct API call.

**ROLLBACK (one command):** the Anthropic path is intact behind `COACH_PROVIDER`.
```
printf 'anthropic' | ./node_modules/.bin/wrangler secret put COACH_PROVIDER
```
(To return to Gemini: `wrangler secret delete COACH_PROVIDER`, since it defaults to gemini when unset.)

## 4. TITLE FIX — six rendered titles (brand exactly once)
Fix: `SEO.tsx` now appends `SITE_NAME` only when the page title isn't already branded;
branded titles are used as-is. Client `document.title` on the dev SPA, brand-once verified
by `batch-5.spec.ts`:
```
Home        Best Age Calculator, Celebrity Birthday Match & Life Expectancy | BornClock - Age & Birthday Calculator
Born-on     Born on January 1 — Famous Birthdays | BornClock
Month hub   Born in August — Zodiac, Birthstone & Famous Birthdays | BornClock
Fitness     Energy Forecast — Your 7-Day Rhythm Check-In | BornClock
Compat pair Aries & Leo Compatibility — Love, Friendship & Work Match | BornClock
Blog post   Best Month to Be Born? The Data | BornClock
```
Each contains "BornClock" exactly once; the homepage keeps its full SEO title.

## 5. Thin-content diff (Phase 7) — **deferred** (see §6).

## 6. Skipped under triage, and why
Per the triage order (drop from the bottom) and "finish or skip cleanly", I completed
Phases 1–5 and deferred:
- **Phase 6 — AEO on the 6 fitness pages.** (Note: these already have a `directAnswer`
  snippet block + question-form H2s + FAQPage from earlier batches; the incremental AEO
  work is smaller than the prompt assumes.)
- **Phase 7 — AEO on the 78 compatibility pairs.** (They already carry an answer-first
  "Are {A} and {B} compatible?" block with the score + the element×modality prose from
  BATCH-3; again the delta is smaller than assumed.)
- **Phase 8 — four blog articles.**
Rationale: two full landing pages + Gemini migration + the critical key-config fix
consumed the session; shipping 6–8 half-done would violate the "never ship a half-done
phase" rule. Build count therefore = 1338 − 1 (rising) + 2 (gift, coach) = **1339**, not
the 1343 the gate assumed (which included the 4 articles).

### /gift slug decision (Phase 4)
`/gift` already existed as a thin client-redirect to `/birthday-report` (not prerendered).
I **repurposed** it into the real conversion landing page (no slug conflict; the old
redirect is superseded). Agreed with the prompt's `/gift` choice.

## GATE
- **tsc:** app 0 errors (baseline 45 / 0 new). Worker bundles clean.
- **build:** **1339 ok / 0 failed / 0 skipped** (1338 − rising-sign + gift + coach).
- **test:prelaunch:** launch-gauntlet **135** · prelaunch **120** passed, 0 failed —
  includes: 7 coach-validation (prompt/validation preserved), the title brand-once ×6
  route types, /gift + /coach content (title/canonical/FAQ/answer), and
  `/rising-sign-calculator → 301 /moon-sign`. Rising-sign assertions were **removed**
  (documented), not weakened.
- **frozen files untouched** · **invoice_counters unchanged:** BC/26-27=1002, BN/26-27=1001, BX/26-27=1001.
- **deploy:** one `wrangler deploy` (+ the one required `secret put GEMINI_API_KEY` config
  fix, §2). Live: Coach (Gemini) 200; `/gift` + `/coach` 200; `/rising-sign-calculator`
  301 → `/moon-sign`; sentinel `{"error":"Report not found"}`.
- **IndexNow:** pinged `/gift/` + `/coach/` (200/202). Rising-sign is a 301, so its earlier
  crawl signal is preserved without a re-ping.

## 7. Founder task list
1. **Rotate the Gemini API key** — it was exposed as a secret name and used during this fix.
   Then `wrangler secret delete "AQ.…48Jcw"` (the mis-named secret) and `wrangler secret put
   GEMINI_API_KEY` with the new key.
2. Review the Gemini vs Anthropic answers above and decide the provider (default is Gemini;
   one-command rollback in §3).
3. Fill the **testimonial placeholder** on `/gift` with real customer quotes.
4. Editorial pass on `/gift` and `/coach` copy.
5. Decide whether to schedule the deferred Phases 6–8 (AEO layers + 4 articles).
