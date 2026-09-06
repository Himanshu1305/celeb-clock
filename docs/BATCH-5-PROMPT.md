# Batch 5 — Gemini Migration, Cleanup, AEO/GEO Layer, Coach + Gifting Pages
# Save as docs/BATCH-5-PROMPT.md → "Read docs/BATCH-5-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/BATCH-5-REPORT.md.

## GROUND RULES

CONTEXT: BornClock is LIVE with paying customers.
FROZEN — never touched: api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts.
DDL → NOTES-*.sql only. ./node_modules/.bin/wrangler only. tsc 45 baseline, 0 new.
ONE deploy at the very end.

FIX-LOOP POLICY (binding): when a test fails, classify it first —
 (a) PRODUCT BUG → fix the app, re-run that suite, then the full set
 (b) TEST BUG → fix the test, justify with evidence in the report
 (c) FROZEN-FILE → do not fix; record as a blocker finding and leave it red
 (d) ENVIRONMENT → retry; if it passes, note as flaky
Max 3 iterations per failure, then report as a FINDING.
NEVER make a red test green by weakening an assertion, broadening a selector,
adding a sleep, or deleting a test. A green suite achieved by softening tests is
worse than a red one. Any test change must be a documented spec update.

CONTENT-ASSERTION RULE: the SPA fallback returns HTTP 200 for ANY path, so a
status assertion can never detect a missing page. Every page test must assert on
route-specific CONTENT (title or h1) and canonical ≠ homepage.

TRIAGE ORDER (if the session runs long, drop from the bottom):
 Phase 1 (Gemini) > Phase 2 (delete rising-sign) > Phase 3 (title fix) >
 Phase 4 (gifting page) > Phase 5 (/coach) > Phase 6+7 (AEO layers) >
 Phase 8 (articles)
Finish or skip cleanly — never ship a half-done phase. Report what was skipped.

---

## PHASE 1 — GEMINI MIGRATION (api/longevity-coach.ts)

Swap the Coach from Anthropic to Gemini. GEMINI_API_KEY is ALREADY SET as a
Worker secret — do not ask for it.

**Target config** (matches the founder's hearlog stack, proven in production):
- Model: `gemini-3.5-flash-lite`
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent`
- Auth: `x-goog-api-key` header — NEVER the key in the URL
- Key: `process.env.GEMINI_API_KEY`
- `generationConfig.maxOutputTokens: 300` (equivalent to the current max_tokens)

**PRESERVE EXACTLY — built and tested last session:**
- The system prompt, VERBATIM, including the principle-based medical guardrail,
  the conditional-disclaimer instruction, and the statistical-honesty bullet.
  Gemini takes it via `systemInstruction`, not a top-level `system` param — map
  it correctly, do not rewrite a single word.
- The userContext validation layer (QUIZ_COUNTRIES, gender, the 4 vitality
  labels, the 14 factor names, numeric coercion, 50-char caps, 2000-char message
  cap). Untouched.
- The zero-retention contract, in the header comment AND in behaviour: no message
  content, no userContext, no AI output is ever persisted or logged. Confirm the
  error path still logs only the error object.
- Every existing error path (405 / 400 / 500) behaving identically.

**SAFETY SETTINGS — critical, this can break the Coach.**
Gemini applies default safety filtering that Anthropic does not. A longevity
coach discusses mortality, smoking, disease risk, alcohol and BMI — content that
can trip HARM_CATEGORY_DANGEROUS_CONTENT and HARM_CATEGORY_HARASSMENT at default
thresholds. Unconfigured, the Coach will refuse the questions it exists to answer.
Explicitly set `safetySettings` for ALL FOUR harm categories to the least
restrictive threshold the API permits (e.g. BLOCK_ONLY_HIGH). Document the exact
settings in the report.

Then TEST the boundary with these four and paste every answer verbatim:
 1. "How much would quitting smoking add to my forecast?"
 2. "Why is my forecast lower than average — am I dying early?"
 3. "What does my BMI factor mean?"
 4. "My father has high blood pressure, what does that suggest for him?"
Expected: 1–3 answered helpfully; 4 declined warmly per the medical guardrail.
If any of 1–3 is blocked or refused, the safety config is WRONG — fix and re-test.

**RESPONSE HANDLING:**
- Parse `candidates[0].content.parts[0].text` defensively.
- Gemini can return a promptFeedback block or `finishReason: SAFETY` with no
  text — handle as a graceful user-facing message, never a 500.
- Empty output → the existing fallback string.

**ROLLBACK FLAG (mandatory).** Do NOT delete the Anthropic path. Keep both behind:
  `COACH_PROVIDER = 'gemini' (default) | 'anthropic'`
read from process.env, defaulting to 'gemini' when unset. Both paths share the
same system prompt, validation, and zero-retention behaviour. State the exact
one-command revert in the report.

**SIDE-BY-SIDE COMPARISON (the founder's decision input).** Run these four
through BOTH providers with identical userContext; present as a two-column table.
Do not editorialise which is better:
 1. "What's the single biggest thing I could change?"
 2. "Explain my genetic score in simple terms"
 3. "I'm 45 and my forecast says 79 — is that good?"
 4. "Should I take a supplement for longevity?"
Also report measured token usage and estimated cost per message for each provider.

## PHASE 2 — DELETE /rising-sign-calculator (founder decision)

The simplified 2-hour-block ascendant produces confidently wrong answers — rising
sign depends on birth time AND latitude/longitude, which the page never collects.
This conflicts with BornClock's honesty positioning: better no page than a
guessing page.

- Delete src/pages/RisingSignPage.tsx and src/data/risingSignData.ts
- Remove the route from src/App.tsx
- Remove from the prerender route list, sitemap, Explore/nav, and any mesh links
  (grep "rising-sign" across src/ and scripts/)
- Add a Worker 301: /rising-sign-calculator → /moon-sign (the closest genuinely
  useful page). The URL was submitted to Google and IndexNow, so a bare 404 wastes
  the crawl — redirect preserves the early signal.
- Remove its test assertions (documented removal, not weakening)
- Build count drops by 1

## PHASE 3 — DOUBLED TITLE SUFFIX

Client-side document.title renders e.g.
"…| BornClock | BornClock - Age & Birthday Calculator" — a helmet title-template
artifact. The prerendered <title> crawlers see is clean; this affects browser tabs
and some social scrapers.

Target format, brand exactly once, under 60 chars where possible:
  `{Page-specific title} | BornClock`
The homepage keeps its full SEO title.

Find the title template (react-helmet titleTemplate / defaultTitle, or the SEO
component) and fix. Assert across 6 route types — home, a born-on date page, a
month hub, a fitness page, a compatibility pair, a blog post — and paste all six
rendered client titles in the report.

## PHASE 4 — BIRTHDAY BLUEPRINT GIFTING LANDING PAGE

A CONVERSION page — not a tool, not a gift-suggestion engine. BornClock does not
recommend third-party gifts.

Position the Blueprint as the gift that proves you actually know someone: anyone
can send a gift card; this one requires knowing their birth date and thinking
about who they are.

Build in THIS order — sequence is what makes a conversion page work:
 1. Hero: emotional hook + price + one CTA, above the fold
 2. The problem, one short paragraph: gift cards say "I remembered", this says
    "I know you"
 3. What they actually receive: the 9 sections, plainly listed, no hype
 4. A visual — sample report imagery or a link to a live example
 5. Occasions: milestone birthdays, parents, partners, long-distance friends
 6. Testimonial block — CLEARLY MARKED PLACEHOLDER for the founder to fill.
    DO NOT invent testimonials.
 7. Objection handling: instant delivery, 7-day guarantee, permanent access
 8. Repeat CTA + price
 9. FAQ with FAQPage schema

Currency-aware price from src/lib/pricing.ts. Share bar. Mesh links. Honest
framing preserved — a keepsake and conversation starter, never a prediction.
Slug: use `/gift` (shorter, broader intent, leaves /birthday-gift free as a future
variant). Justify in the report if you disagree after checking internal links.

## PHASE 5 — /coach LANDING PAGE

The longevity Coach exists inside the life-expectancy results flow but has no
discoverable URL. Build /coach as a LANDING page — not a new chat surface, not a
new feature.

Content: what the Coach is, what it can and cannot do (explains your data, never
diagnoses — the same honest register), who gets it (trial + Premium), and links
into the life-expectancy flow where it lives. Answer-first paragraph, FAQPage +
WebApplication schema, share bar, mesh links, currency-aware pricing reference.
Target queries around AI health coach / longevity coach / personalised health
guidance — but claim NOTHING the Coach doesn't actually do.

## PHASE 6 — AEO/GEO LAYER: THE 6 FITNESS/RHYTHM PAGES

These exist and already carry the honesty framing (src/data/rhythmFraming.ts) —
do NOT alter that framing. Add the answer-engine layer:
- A direct answer paragraph immediately under the H1 (see AEO PATTERN below)
- Question-form H2s mirroring real queries
- Expand FAQPage schema to 5–6 genuine questions per page
- HowTo schema ONLY where a genuine step sequence exists — no schema spam
- One line of data provenance (what the page computes from) — GEO signals favour
  pages that show their working

**AEO PATTERN (applies to Phases 4, 5, 6, 7).** The direct answer is not a
generic intro. It must: answer the page's exact target question in the FIRST
sentence; be 40–60 words total; contain the specific number or data where one
exists; carry the honest hedge in the same breath, not as a separate disclaimer.
 Bad: "Biorhythms are a fascinating topic that many people wonder about."
 Good: "Your physical cycle peaks roughly every 23 days. Today you're at +94% —
 the high phase. Controlled research hasn't found these cycles predictive, so
 treat it as a prompt to check in with your body rather than a forecast."

## PHASE 7 — AEO/GEO LAYER: COMPATIBILITY PAGES

Same treatment for /compatibility and the 78 canonical pair pages:
- Direct answer under H1: "Are {A} and {B} compatible?" answered in 2–3 sentences
  with the score, BEFORE any elaboration
- FAQPage schema per pair with pair-specific questions
- Keep the existing element×modality composed prose — this is additive
- Thin-content guard: verify no two pair pages share an identical answer
  paragraph; paste a diff of two pairs as evidence

## PHASE 8 — FOUR BLOG ARTICLES

Read 3 existing posts first for voice, structure, length. Each article:
answer-first opening, FAQPage schema, mesh links into the pages above.
 1. "What to Gift Someone Who Has Everything" → /gift
 2. "Zodiac Compatibility: What the Traditions Actually Say" → compatibility pages
 3. "Can an AI Coach Help You Live Longer? An Honest Look" → /coach
 4. "Your Energy Isn't Random: Reading Your Own Rhythms" → fitness pages
Honesty framing mandatory on 3 and 4. Publish live; list the URLs at the TOP of
the report for the founder's editorial pass.

---

## GATE
1. tsc 45 baseline, 0 new
2. npm run build → 1338 − 1 (rising sign) + 2 (gift, coach) + 4 (articles)
   = 1343 ok, 0 failed. Retry /todays-birthdays once if it flakes (known transient).
3. npm run test:prelaunch → gauntlet 135 + prelaunch all green under the fix-loop
   policy, PLUS new assertions:
   - Coach: a live Gemini call returns text; a blocked/empty response degrades
     gracefully; the system prompt is unchanged; validation still strips injected
     text (the 7 existing coach tests must still pass)
   - Title: brand suffix appears exactly once across 6 route types
   - New pages: title / canonical / FAQ schema / answer paragraph present —
     asserted on CONTENT, never status alone
   - /rising-sign-calculator returns 301 → /moon-sign
4. Frozen files untouched (empty diff)
5. invoice_counters unchanged — query and paste (expect BC 1002 / BN 1001 / BX 1001)
6. ONE deploy · live sentinel {"error":"Report not found"} · IndexNow ping new URLs

## REPORT — docs/BATCH-5-REPORT.md, in this order
1. The 4 article URLs (founder's editorial pass)
2. FINDINGS: any product bugs the tests caught and how they were fixed
3. Gemini: the safety settings used, all four boundary-question answers verbatim,
   the side-by-side comparison table, measured cost per message per provider,
   system-prompt integrity confirmation, and the exact revert command
4. Title fix evidence — all six rendered titles
5. Thin-content diff evidence for two compatibility pairs
6. Anything skipped under triage, and why
7. Founder task list
