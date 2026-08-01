# BATCH-7B — compatibility depth · gift/coach rewrites · energy-forecast · weight-on-planets

Executed phases: **P3, P4, P5, P9a, P10**. Skipped per instruction: P1, P2, P6, P9b, P7, P8.

---

## ⚠️ FOUNDER EDITORIAL SIGN-OFF REQUIRED — two URLs

The /gift and /coach copy is the pair you personally rejected before. It's rewritten here to carry
real weight, but it needs your read before it's "done":

- **https://bornclock.com/gift** — now leads with concrete emotional moments (a father reading his own
  story; a friend abroad opening it on the day; a partner seeing you noticed their birth flower).
- **https://bornclock.com/coach** — now has a prominent zero-retention privacy panel, four concrete
  "what it helps with" scenarios, gentle-urgency framing, and currency-aware Premium pricing.

Read both, tweak the voice to yours, and sign off (or send edits).

---

## 1. Build-count reconciliation (the headline finding)

**The prompt's premise for P3 was stale.** It said the 78 compatibility pages "do not exist / were never
prerendered," and the expected math was `1340 + 78 + 1 = 1419`. Ground-truth check of the current tree:

```
getAllRoutes() → 1340 total, of which 79 are /compatibility routes (78 pairs + hub)
dist/compatibility/aries/leo/index.html … → 78 pair pages ALREADY prerendered (slash form)
```

A prior batch already built and prerendered all 78 pairs (as `/compatibility/{a}/{b}`, slash-separated).
So the `+78` was **already banked in the 1340 baseline** — counting it again would double-count (the exact
trap the CONTENT-ASSERTION RULE warns about). Net-new routes this batch = **P10 only (+1)**.

| Item | Prompt expected | Reality | Achieved |
|---|---|---|---|
| Baseline | 1339/1340 | 1340 (already includes 79 compat routes) | 1340 |
| P3 — 78 compatibility pairs | +78 (assumed new) | **already prerendered in baseline** | +0 |
| P10 — /weight-on-planets | +1 | new | +1 |
| P6 — months hub | +1 | **skipped this run** | +0 |
| **Total** | 1419 | — | **1341** |

**Expected (corrected) = 1341. Achieved = 1341** (`Prerender complete: 1341 ok, 0 failed`; sitemap 1341 URLs).
The 78-page gap vs the prompt's 1419 is fully explained: they were pre-existing, not lost.

### P3 URL-scheme decision (documented deviation)
The prompt specced hyphenated `/compatibility/aries-leo`; the live site uses slash `/compatibility/aries/leo`.
I **kept slash** deliberately:
- The 78 slash URLs are already prerendered, IndexNow-pinged and indexed. Migrating to hyphen would orphan
  78 indexed URLs — the exact "wasted indexed-URL signal" the prompt itself flags in P1 (rising-sign 404).
- The Worker already 301s reverse slash-order (`/compatibility/leo/aries` → `/compatibility/aries/leo`).
- batch-6 asserts the slash pages; keeping slash keeps it green (no assertion weakened).
The prompt's hyphen preference stemmed from its false "they don't exist yet" premise. Slash is canonical.

---

## 2. P3 — what actually shipped (quality-bar upgrade, not new pages)

The pages existed but were **thin** (love/friendship/work were only score bars + one shared description;
~150–250 words of page-specific prose). Real P3 value = bring them to the quality bar.

**Architecture — one data module drives all 78 pages:** `src/lib/compatibilityProse.ts` composes each pair's
long-form sections at render time from four per-sign primitives (element, modality, ruling planet, polarity)
plus the sign-distance **aspect**. Change a sign's primitive once (e.g. re-rule Scorpio) and all of its pair
pages regenerate on the next build. Zero per-pair hand maintenance.

The three sections are driven by **different** primitives so they read as genuinely distinct for the same pair
(per the Cafe-Astrology-class reference structure studied):
- **Love** → ruling planets (desire/affection) + element heat + polarity
- **Friendship** → element affinity + aspect ease (planets muted, ego stakes low)
- **Work** → modality roles (initiator/sustainer/adapter) + polarity as the conflict engine

Also added: a top-of-page **"Where you click / Where you clash"** verdict, and an explicit **not-found** state
for bogus slugs (`/compatibility/aries/dragon` → noindex not-found, never the calculator shell).

### Two-pair diff evidence (thin-content guard — both Fire×Fire)
Real generated output proving same-element pairs differ meaningfully:

> **Aries × Leo — LOVE:** *Aries brings **Mars-driven pursuit and heat**; Leo brings the **Sun's warmth,
> romance and need to be adored**…*
> **Aries × Leo — WORK:** *Aries is **Cardinal (an initiator…)** and Leo is **Fixed (a sustainer…)**, a
> complementary split…*

> **Leo × Sagittarius — LOVE:** *Leo brings the **Sun's warmth…**; Sagittarius brings **Jupiter's
> adventurous, freedom-loving affection**…*
> **Leo × Sagittarius — WORK:** *Leo is **Fixed (a sustainer…)** and Sagittarius is **Mutable (an adapter…)**…*

The LOVE sections diverge on **ruling planets** (Mars+Sun vs Sun+Jupiter); the WORK sections diverge on
**modality roles** (Cardinal+Fixed vs Fixed+Mutable). Not templated-identical — asserted in
`batch-7b.spec.ts` (`workProse(Aries,Leo) !== workProse(Leo,Sagittarius)`).

---

## 3. P4 /gift + P5 /coach — reference pages studied + what was borrowed structurally

WebSearch reference study (structure & psychology only, no copied text):

| Page | Reference | Borrowed structurally |
|---|---|---|
| /gift | **Birthdate Co.** (birthdate candle) — https://birthdate.co/products/the-birthdate-candle | "made for 1 of 365" made-for-you scarcity; emotional-ownership-before-features |
| /gift | **Under Lucky Stars** (star map) — https://www.underluckystars.com/en | sell the *moment* (impermanent memory vs permanent keepsake); proof-as-artifact ladder |
| /coach | **HUMANITY AI Health Coach** — https://apps.apple.com/us/app/humanity-ai-health-coach/id1519091344 | "one number → one next step"; scope-boundary stated early as a value, not fine print |
| /coach | **Vora AI Longevity Coach** — https://askvora.com | honesty-as-a-feature; privacy/data handling as a trust signal; facts-not-fear urgency |

**P4 changes:** three concrete emotional-moment vignettes (father/friend-abroad/partner) — the reference's #1
lever ("sell the feeling, not the object"). Kept the honest "keepsake, never a prediction" framing and the
un-invented testimonial placeholder. Added **/gift to nav (More) + footer** (footer "Gift a Report" repointed
from /birthday-report → /gift). Was previously unreachable by menu.

**P5 changes:** prominent **zero-retention privacy panel** ("close the tab and it's gone" — the contract is
real in code); four concrete **"what it helps with"** scenarios (your numbers / food choices / exercise timing
/ habit building) with example questions; **gentle-urgency** paragraph (facts, no fear); **currency-aware
pricing** via the pricing single-source (`subscriptionPrice`/`annualPerMonth`). Added **/coach to nav (More) +
footer**. Was previously unreachable by menu.

---

## 4. P9a /energy-forecast — deepened to the quality bar

Data-driven page (`src/data/fitnessPages.ts`, slug `energy-forecast`). Added three substantial sections —
**"How to read your 7 days"** (peak / low / critical-day interpretation with one honest action each),
**"The three cycles, and why those lengths"** (23/28/33-day mechanics, stated as arithmetic not biology), and
**"Turn the week into a check-in you'll keep"** (journaling/reflection reframe) — plus two FAQs (critical-day,
weekly planning). Honesty framing (reflection, not prediction) preserved throughout, per the biorhythm brief.

---

## 5. P10 /weight-on-planets — new fun page (+1 route)

Client-side only, nothing stored. Physics in `src/lib/planetGravity.ts` (unit-tested), gravity ratios from
**NASA NSSDCA Planetary Fact Sheet**: `nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html`. Two
fun-page conventions cited on the page: Mars 0.379 (widely-taught) and Jupiter 2.53 cloud-top (it has no solid
surface). 9 bodies (8 planets + the Moon). kg/lb toggle, share-your-result bar, OG card, FAQ schema (mass vs
weight — a real AEO/school-query opportunity), CTA to /planetary-age + /birthday-report. Wired into
router, prerender-routes, prerender-titles, OG cards, and nav (Explore) + footer.

---

## 6. Test matrix (T3)

| Phase | Positive | Negative / Edge | Status |
|---|---|---|---|
| P3 compat (prose) | 3 sections distinct per pair; substantial | two same-element pairs differ (thin guard); same-sign = conjunction; aspect↔distance | ✅ `batch-7b.spec` (unit) |
| P3 compat (render) | same-sign `/aries/aries` renders pair content | invalid `/aries/dragon` → not-found, NOT calculator shell | ✅ `batch-7b.spec` (browser) |
| P3 reverse redirect | — | `/compatibility/leo/aries` → 301 `/aries/leo` (×3 reverse orders) | ✅ LIVE post-deploy (slash form — see §7) |
| P10 weight (logic) | Mars 0.379→26.5kg; kg↔lb 70↔154.3 | 0/neg/absurd(10000)/NaN/empty → clean, no NaN; decimals | ✅ `weight-on-planets.spec` |
| P10 weight (render) | page renders + computes default result | — | ✅ `batch-7b.spec` (browser) |
| T1 discoverability | /gift+/coach in nav More; /weight-on-planets in Explore; footer links; /compatibility→pair link | 390px mobile parity for all three | ✅ `batch-7b.spec` |
| P4/P5 content | /gift + /coach prerendered title/answer/FAQ/placeholder | — | ✅ existing `batch-5.spec` (still green) |

No cell silently omitted. The P3 reverse-redirect is a Worker behavior (not exercised by the vite dev server),
so it's a LIVE post-deploy assertion rather than a prelaunch spec — noted, not skipped.

---

## 7. Gate

- **tsc**: 0 errors (0 new baseline). ✅
- **build**: **1341 ok / 0 failed** (reconciled in §1). ✅
- **test:prelaunch**: gauntlet **135/135** ✅ + prelaunch **154/154** ✅ (132 baseline + admin-fix 5 + weight 6 +
  batch-7b 11). Initial run showed 2 batch-7b failures — classified **TEST-BUG** (strict-mode locator
  ambiguity: the page rendered correctly per the Playwright snapshot; the FAQ accordion renders the pair
  question as an `<h3>` heading and "Jupiter"/"Are Aries…" appeared twice). Fixed the locators (pinned
  heading level / used a unique result string) — re-ran green. No product change, no assertion weakened.
  - One updated assertion: `navigation.spec.ts` Explore exact-set now includes `/weight-on-planets` (TEST-BUG
    class — the batch legitimately adds it to Explore; not a weakening).
- **frozen files untouched**: `_crypto.ts`, `razorpay-webhook.ts`, `verify-payment.ts` — empty diff. ✅
- **invoice_counters unchanged**: BC 1002 / BN 1001 / BX 1001. ✅
- **deploy**: ONE. `Uploaded bornclock` + `Deployed bornclock triggers`; trailing exit 1 = known non-fatal
  cron `schedules` token-scope error. ✅
- **live sentinel**: `{"error":"Report not found"}`. ✅
- **live post-deploy**: `/weight-on-planets` → 200 ✅; reverse redirects 301 → canonical (tested 3:
  `leo/aries`→`aries/leo`, `virgo/gemini`→`gemini/virgo`, `pisces/aries`→`aries/pisces`) ✅; `aries/leo` → 200 ✅.
- **IndexNow**: `/weight-on-planets` pinged — IndexNow 200, Yandex 202. ✅

---

## 8. Founder task list

1. **Editorial sign-off** on /gift and /coach copy (the two pages you rejected — your read required; §top).
2. **Spot-check** a few compatibility pairs for tone — e.g. /compatibility/aries/leo (trine),
   /compatibility/aries/libra (opposition), /compatibility/taurus/taurus (same-sign). Confirm the new
   Love/Friendship/Work sections read well.
3. **P3 scheme note**: confirm you're happy keeping the slash URL scheme (kept for indexed-URL safety; see §1).
   If you truly want hyphen, that's a separate migration with 78 × 301s — flag it and I'll do it deliberately.
4. No DDL in this batch (P7/P8 skipped) — nothing to apply in Studio.
