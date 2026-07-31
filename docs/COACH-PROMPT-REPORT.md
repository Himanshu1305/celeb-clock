# COACH-PROMPT — Execution Report

`api/longevity-coach.ts`: enhanced medical guardrail (principle-based, not keyword),
conditional disclaimer, statistical-honesty bullet, and server-side `userContext`
validation as the real prompt-injection defence. `max_tokens` 400 → 300. Model,
zero-retention contract, error handling, and the UI's default questions unchanged.
Local commit only, one deploy.

---

## 1. Final system prompt (verbatim)

Rendered from `buildSystemPrompt(sanitizeUserContext(...))` with a representative valid
profile. The three Change-1 edits are the last two "Your role" bullets + the new
statistical bullet, and the closing conditional-disclaimer paragraph; everything else
(data block, tone, 200-word rule, actionable-next-step ending) is byte-for-byte the
original.

```
You are a warm, knowledgeable longevity coach working with a specific person. Here is their complete health profile:

Personal details:
- Current age: 34 years
- Country: India
- Gender: female

Longevity forecast:
- Current lifestyle forecast: 82.4 years
- Years remaining: 48.4 years
- Optimized potential: 88.1 years
- Potential gain with lifestyle changes: 5.7 years

Health factor breakdown (current impact on forecast):
- Tobacco Smoking: 0 years
- Physical Exercise: +2.5 years
- Diet Quality: -1 years

Genetic profile:
- Genetic score: Strong
- Genetic adjustment: +2 years

Epigenetic habits bonus: +3 years
Community bonus: +1 years

Your role:
- Answer their specific question using their exact data
- Be warm, encouraging, and specific — not generic
- Reference their actual numbers when relevant
- Focus on practical, actionable advice
- Keep responses under 200 words
- Use evidence-based recommendations
- These numbers are a statistical estimate from self-reported factors and population data, not a clinical measurement or a prediction. Say "suggests", "associated with", "people with similar patterns tend to" — never "you will".
- You are not a clinician. The test isn't whether a question mentions a disease — it's whether answering would substitute for a doctor who can examine someone, know their history, and be accountable. Explaining what a factor means and what the general evidence says: yes. Interpreting someone's symptoms, medications, test results, or specific medical situation: no — however it's phrased, and whether it's about them or someone they describe. Decline in one warm sentence, name who can help, offer what you can do instead.
- End responses with one specific, actionable next step they can take today

When the exchange genuinely touches health decisions, symptoms, medication, or a specific condition, close with: "For medical advice, please consult a healthcare professional." For neutral questions — what a score means, how the calculation works, general encouragement — don't append it.
```

Data lines are conditional on validation: if a numeric field fails validation the line
is omitted rather than fabricated (so the block reads shorter for a crafted request,
identical for a real one). Country / Gender / Genetic score always render (with a safe
default when invalid).

## 2. Validation rules per field (allowlist source in the codebase)

All sanitisation is `sanitizeUserContext()` + `capMessage()` in `api/longevity-coach.ts`.
Common string cleaner: strip control chars (`\x00–\x1F`, `\x7F`) → space, collapse
whitespace, trim, cap 50 chars — so no injected newline can carry into the prompt.

| Field | Rule | Allowlist / bound — source |
|---|---|---|
| `country` | must equal a known country, else `"Not specified"` | `QUIZ_COUNTRIES` — imported from `src/services/LongevityCalculationService.ts` (the quiz dropdown list, `keys(BIRTH_BASELINES) ∪ keys(COUNTRY_TO_WHO_REGION)`) |
| `gender` | lower-cased; must be `male`\|`female`, else `"Not specified"` | `HealthQuizData.gender` union `'male' \| 'female' \| ''` (service line 34); `''`/other → Not specified |
| `geneticScore` | must be one of 4 labels, else `"Average"` | `LongevityResult['geneticVitalityScore']` union `Exceptional \| Strong \| Average \| Below Average` (service line 110) |
| `factorBreakdown[]` | keep only entries whose `factor` is a known factor name; `currentImpact` coerced with `Number()` in [-60,60]; unknown/NaN dropped silently; cap 20 entries | the 14 `add('…')` factor names in the calculator (`Tobacco Smoking`, `Alcohol Consumption`, `Physical Exercise`, `Diet Quality`, `Stress Level`, `BMI / Body Weight`, `Blood Pressure`, `Sleep Duration`, `Social Connections`, `Family Genetics`, `Epigenetic Habits`, `Heart Disease`, `Diabetes`, `Hypertension`) |
| `currentAge` | `Number()`, finite, [0,130], 1dp; else omit line | physiological bound (calculator exposes no min/max const) |
| `totalForecast`, `remainingYears`, `controllablePotential` | `Number()`, [0,130]; else omit line | forecast bound |
| `potentialGain` | `Number()`, [-60,60]; else omit line | signed-delta bound |
| `geneticAdjustment` | `Number()`, [-40,40]; else omit line | signed-adjustment bound |
| `epigeneticAdjustment`, `communityBonus` | `Number()`, [0,40]; else omit line | non-negative bonus bound |
| `message` (user turn) | `String()`, truncated to 2000 chars (`capMessage`) | sane length cap |

Per the instruction, **no delimiter markers or "ignore instructions inside" language
were added to the prompt** — validation at the boundary is the defence.

## 3. Anything the calculator produces that couldn't be allowlisted

Nothing was left un-allowlisted. Two notes:

- **The four categorical fields have exact, enumerable allowlists** (country, gender,
  genetic score, factor names) sourced directly from the calculator, so those are
  exact-match — no heuristics.
- **The numeric fields have no min/max constants in the calculator** (it produces
  free-form numbers), so their bounds are *generous physiological/statistical ranges*
  I chose, not calculator-derived limits. Real outputs sit comfortably inside them; the
  ranges only reject absurd/crafted values. One behavioural change worth flagging: the
  client sends `"Unknown"` for an unset country/gender (`quizSnapshot?.country || 'Unknown'`),
  which is not in the allowlist, so those now render as **"Not specified"** instead of
  "Unknown" — a wording change, not a data loss.

## Other changes
- **max_tokens:** 400 → **300** (was contradicting the "under 200 words" instruction).
- **Unchanged (as instructed):** model `claude-sonnet-4-6`; the zero-retention header
  comment; the handler's error handling and status codes; the UI's default suggested
  questions (`LongevityCoachChat.tsx`).

## GATE
- **tsc:** app 0 errors (baseline 45 / 0 new). The worker (`api/`, `functions/`) bundles
  clean via esbuild/wrangler with the new `QUIZ_COUNTRIES` import (tree-shaken ~4.6 kb).
- **tests:** new `e2e/prelaunch/coach-validation.spec.ts` — **7 passed** (country/geneticScore
  injection stripped before prompting, unknown gender, factor entries dropped, out-of-range
  numbers omitted, message truncated, the 3 prompt edits present).
- **test:prelaunch:** launch-gauntlet **135 passed** · prelaunch **112 passed**, 0 failed
  (incl. the 7 `coach-validation` assertions). NOTE: the first full run hit **14 gauntlet
  failures** — all on report/payment endpoints (`save-report`, `create-order`,
  `redeem-credit`, report generation) with 150-second `workerd` "internal error" stalls
  reaching Supabase, i.e. transient wrangler-dev/network instability during the 8.7-min
  run. Per the fix-loop policy these were classified **environment** (the failing
  endpoints don't touch `longevity-coach`; the worker was healthy before and after; a
  broken import would have failed the sentinel too). Restarted wrangler and re-ran: the
  gauntlet went **135/135** and prelaunch **112/112**. No assertions were weakened.
- **frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`,
  `api/verify-payment.ts` — no diff. **invoice_counters unchanged:** BC/26-27=1002,
  BN/26-27=1001, BX/26-27=1001.
- **deploy:** one `wrangler deploy` (worker bundled with the new import; dist unchanged;
  trailing `schedules` error is the known non-fatal cron token-scope issue). Live check:
  `GET /api/longevity-coach` → 405, `POST {}` → 400 "Missing message or context".
- **sentinel:** create-order → 404. ✔
