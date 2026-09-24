# Part AG — Overnight Morning Report (Mystic Corner + Science & Longevity)

_Incremental log — appended at each checkpoint so partial progress is visible if interrupted._

## Step 0 — CONFIRMED ✅
- develop HEAD `e7e1c7d` (at/past required `e7e1c7d`; includes Vedic + Birthday & Celebrity pages).
- Branch `part-ag-mystic-science-pages` created off develop.
- Working tree clean. main will NOT be touched.

## Scope verification (what's real — checked in App.tsx, before writing any copy)
**Mystic Corner tools — ALL REAL routes:** `/numerology`, `/name-numerology`, `/zodiac`,
`/chinese-zodiac`, `/tarot-card-by-birthday`, `/compatibility`.
- Note: the brief flagged Tarot and a compatibility calculator as "unconfirmed." Both ARE
  real routes (`/tarot-card-by-birthday`, `/compatibility`) — verified present and will be
  render-checked on the preview before shipping links to them.

**Science & Longevity tools — ALL REAL routes:** `/life-expectancy`, `/biological-age`,
`/biological-age-calculator`, `/articles/longevity-quiz`.

**Mystic hero deep-link decision (conservative call, documented):** `/numerology` has NO
`?dob=`-style deep-link — `BirthDateContext` does not read the URL and deliberately does
NOT persist DOB (privacy). Rather than modify a shared context or duplicate calculation
logic on the hub, the Mystic hero reuses the VERIFIED `/birthday-report?dob=YYYY-MM-DD`
deep-link (same one the Birthday & Celebrity page uses), which genuinely computes Life Path
numerology + Western zodiac from the DOB — delivering the hero's promise via a real,
already-working flow. Safer than building a new deep-link into a shared context tonight.

## §5 "real example" data (verified, not fabricated)
**Mystic Corner:** Sachin Tendulkar, born 24 April 1973 (real DOB, present in
`src/data/celebrities.json`) → Western zodiac **Taurus ♉** (`calculateWesternZodiac(24,4)`),
**Life Path 3** (`calculateLifePathNumber(24,4,1973)`). Both computed via the project's real
functions.
_Science & Longevity has no "real example" section per the brief (deliberately lighter)._

---
_(further checkpoints appended below as reached)_

## Part 1 (Mystic Corner) — BUILT ✅
- `/mystic-corner` rebuilt as a bespoke navy/gold/ivory hub (was the shared-template page).
- Homepage "Mystic" card (`path-card-mystic`) now → `/mystic-corner` (was `/numerology`). Card ORDER unchanged (vedic, birthday, mystic, science); other cards untouched.
- Prerender title/meta for `/mystic-corner` updated (≤70 chars).
- Hero → `/birthday-report?dob=` deep-link (documented conservative call).

## Part 2 (Science & Longevity) — BUILT ✅
- `/life-expectancy` enhanced ADDITIVELY (one self-contained section after the hero; calculator untouched): brief's headline/subhead framing, the mandatory prominent honesty box (exact required copy), an "in this vertical" strip (Life Expectancy #calculator, Biological Age /biological-age, Longevity Quiz /articles/longevity-quiz — all real), a compact FAQ ("Is this medical advice?" → No, + accuracy + what it can't account for), and one soft cross-link line (→ /vedic-astrology, /celebrity-birthday).
- CONSERVATIVE CALLS documented: (a) kept the existing SEO-optimized H1 rather than replacing it (protects existing rankings on a real-traffic page); (b) styled the band to match the existing page's own theme, not the navy/gold system, to avoid a clashing mid-page band on an existing differently-themed page. The page already had multiple prominent medical disclaimers.

## Test checkpoints so far
- Full unit suite BEFORE Part 1: 1855 passed (develop baseline).
- Full unit suite AFTER Part 1 + Part 2 built: **1855 passed** (151 files).
- tsc: no NEW errors in Part AG files (the 3 LifeExpectancy.tsx errors at 232/367/804 are PRE-EXISTING — 804 is the pre-existing 753 shifted by the additive insertion).

## Preview verified ✅ (wrangler versions upload — prod untouched)
Preview URL: https://5c32ffbc-bornclock.usdvisionai.workers.dev
- Direct-load /mystic-corner → 200, real page (not soft-404); /life-expectancy → 200, honesty + enhancement present.
- Homepage `path-card-mystic` href = /mystic-corner ✓.
- All 14 links resolve HTTP 200 (both pages) with distinct real titles.
- Mobile (iPhone 13, 390px): both pages no horizontal overflow, correct h1, 0 console errors.
- Mystic hero deep-link: filled 7/11/1988 → /birthday-report?dob=1988-11-07, prefilled day=7/month=11.
