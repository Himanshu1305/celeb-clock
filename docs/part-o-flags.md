# Part O — Explanation depth + Navamsa fix + test config

## Item 1 — deeper explanations (four-dimension structure)

Every surface now explains each concept across the four research-backed dimensions —
WHAT it is, WHY it matters, what it means for THIS chart, and HOW it connects to
another placement — with every person-specific line still tied to real computed data.

### 1.1 Kundali page
- **"Your chart, interpreted"** (deterministic, so 100% accurate by construction) went
  from 6 one-line sentences to a structured set of blocks: Lagna, Moon-sign & birth
  star, Sun, Moon, current Dasha, and "how to read this". It now frames what each piece
  is, connects Lagna (outer self) with the Moon sign (inner self), surfaces the Part G
  Nakshatra meaning (deity + shakti + significance), and gives the Dasha "why" (which
  planet, what it governs). Reference tables added: sign element/modality, house themes,
  planet karakas — standard classical reference, not per-person fabrication.
- **LLM reading snapshot** — instruction changed from "name them" to "read them together,
  outer self vs inner self, and say how they harmonise or contrast". All accuracy/safety
  guardrails unchanged. Cache version bumped **v8 → v9** so deployed users get the deeper
  reading (and the Item 2 fix), not a stale cache.

### 1.2 Astrologer chat
- Added a STRUCTURE instruction: name which chart factors the answer draws on BEFORE the
  answer ("This is best read through your 7th house, Venus, and your Dasha period — …").
  It is an ORDER change only; all 10 guardrails (crisis, health, financial, certainty,
  grounding, timing/D-Fix3, Yoga accuracy, gemstone) remain fully in force.

### 1.3 Kundali Matching — per-Koota depth
- **Tara** now names the actual Taras (Janma/Sampat/Kshema/Sadhaka/Mitra/Parama Mitra
  favourable; Vipat/Pratyari/Vadha inauspicious) per direction, not just "auspicious".
- Every Koota gets a calm, practical "what a strong/weak score means for the couple"
  note. Nadi/Bhakoot keep their heavy-weight emphasis and non-fear dosha framing.

### Real before/after (reference chart 1988-11-05, Delhi)
**Reading snapshot — BEFORE (v8):** "Your rising sign is Kumbha (Aquarius)… Your emotional
life rests in Kanya (Virgo) under the Uttara Phalguni birth star…" (facts listed).
**AFTER (v9):** "Your **outer approach** to the world is guided by Kumbha rising… **In
contrast**, your **inner emotional world** is shaped by Kanya Moon… born under Uttara
Phalguni, ruled by the Sun, associated with Aryaman, it signifies reliable friendship,
dignified contracts and prosperity through partnership…" (framed, connected, deeper).

**Chat — BEFORE:** jumps into the answer. **AFTER:** "…this timing is primarily read
through your **7th house** (Ketu in Simha), your **Yogakaraka Venus** (in Kanya, 8th
house), **Jupiter**, and your **Vimshottari Dasha periods** — …" then the grounded answer.

**Matching Tara — BEFORE:** "Auspicious one way only." **AFTER:** "From Person A to Person
B the Tara is **Mitra** (favourable); from B to A it is **Vipat** (inauspicious). In
practice, health/fortune between the two birth stars is partly supported — workable, with
a little conscious care."

### Testing
- Accuracy: deepened reading scored **43/43 claims correct** by the existing checker;
  Matching is deterministic (accuracy by construction).
- Safety: full unit suite **1777/141 green** — every crisis/health/financial/D-Fix2/Yoga
  checker intact (no guardrail weakened).
- Layout (Playwright, the length-regression risk from D-Fix/Part G): Kundali page renders
  6 interpretation blocks + the full reading with **no horizontal overflow**; Matching
  shows 8 named-Tara/practical Koota notes, no overflow. Screenshots captured.
- Filler self-check: every added line names a real placement, house, deity, Tara or
  connection — no generic padding.

## Item 2 — Navamsa Moon blank in advanced view (ROOT CAUSE FOUND, FIXED)
- **Reproduced** on the reference chart: the "Deeper chart layers" narrative cited a
  Navamsa Moon sign ("Makara"), but the advanced "Divisional highlights" line was blank.
- **Root cause (data, not display):** the server produced `facts.divisional.navamsaMoon`
  and `d9.Moon`, but the client (advanced view + degraded fallback) reads
  `facts.divisional.d9Moon` — a field the server never populated → `undefined` → blank.
  The LLM narrative looked correct only because it's built from the full `d9` map. This is
  a server↔client field-name mismatch, confirmed by inspecting the real facts object
  (`d9Moon = undefined` while `navamsaMoon = "Makara"`).
- **Fix:** populate `divisional.d9Moon` (alias of `d9.Moon`) in `extractReadingFacts`,
  and add it to the facts type. Now advanced view = narrative = **"Makara"**.
- **Regression test added:** `vedicReading.test.ts` asserts, for 3 charts, that
  `d9Moon` is non-blank and equals `d9.Moon`/`navamsaMoon` (and d10Sun/d60Moon non-blank)
  — exactly the assertion that would have caught this.
- Verified live (local v9 fresh generation): advanced `d9Moon = "Makara"`, narrative says
  "your Moon is placed in Makara" — they agree.

## Item 9 — stop local-only specs cluttering staging runs
- **Investigated each file, did NOT exclude by folder** (the spec's caution): a full
  staging JSON run showed the launch-gauntlet/ and prelaunch/ folders contain **291 tests
  that PASS on staging** (public pages, SEO, mobile, smoke) — folder exclusion would have
  wrongly dropped real coverage.
- Excluded **exactly the 7 files that have ZERO passing tests on staging** and fail purely
  on a local dependency (localhost:3001 API, .env.local service-role via helpers/db, or
  reading local dist/ build files). They have their own configs (gauntlet.config.ts /
  prelaunch.config.ts, baseURL localhost:3000) and were only swept in by testDir.
- Config: a per-file `testIgnore` list, gated by `E2E_LOCAL` — excluded by default
  (staging), fully restored with `E2E_LOCAL=1`. Verified via `--list`: default = 841
  tests (0 excluded specs); `E2E_LOCAL=1` = 891 (the 50 restored).
- Removes 50 environmental-noise failures, loses 0 passing tests. (Mixed files that carry
  both real staging tests and some local-only sub-tests are deliberately kept, so their
  real coverage keeps running — a small amount of mixed-file noise remains by design.)

## Flagged / honest notes
- **Not deployed** (per standing instruction). The reading-depth + Navamsa fix reach users
  only after deploy; the v9 cache bump ensures stale v8 readings aren't served then.
- LLM before/after was produced by comparing **staging (old prompt) vs local wrangler dev
  (new prompt)** — a genuine A/B without reverting code.
