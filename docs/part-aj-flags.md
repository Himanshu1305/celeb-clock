# Part AJ — Flags for Morning Review

Open questions / decisions made under autonomy that the owner should review.

## FLAG 1 — Base branch (resolved, needs awareness) — Step 0
The spec said "create `part-aj-four-page-redesign` off `develop` HEAD" but also required the
base to contain Parts AE–AI. **`develop` only has AE–AG**; Parts AH + AI are on
`part-ai-content-depth-fix` (the checked-out branch at session start), which is a descendant of
`develop`. Branching off `develop` would have silently dropped AH (homepage redesign) and AI
(glossary/tooltip + Rashi Ratna cross-ref) — exactly the "quietly losing real functionality"
risk the spec warns against.

**Decision:** branched off current HEAD (`part-ai-content-depth-fix`) so all of AE–AI is present.
**Implication for merge:** when approving, this branch should merge into `develop` *after*
AH+AI are also on `develop` (or AH/AI get merged as part of this), otherwise develop will not
have the prerequisite work. Worth confirming the intended develop lineage before any merge.

(Additional flags appended as encountered — see Part 2 architecture and Part 4 H1/SEO below once reached.)

## FLAG 2 — Part 2 architecture decision (MADE under autonomy — please review) — Part 2
**Question (from brief):** should `/celebrity-birthday` render free interactive results directly,
with `/birthday-report` narrowing to the paid report — or keep the Part AF deep-link pattern?

**Decision made:** YES — `/celebrity-birthday` is now the home for FREE interactive results.
- The hero DOB computes the **birthday-twins grid + the date snapshot INLINE** (it no longer
  navigates away to `/birthday-report?dob=`).
- A **name search** (real `celebrity_sitelinks`, 28k rows) and **today's-birthdays** grid are
  also on the page.
- `/birthday-report` is **unchanged** — still the paid "Birthday Blueprint" report/checkout.
  It is only *linked* from the new page (report banner + explore row), never duplicated.

**Why this is safe / correct:**
- Reuses existing, battle-tested services (`getRankedBirthdayCelebrities`, `fetchCelebrityImage`,
  calc utils, Supabase client) — no new engines, no change to `/birthday-report`'s logic.
- Resolves (not reintroduces) the Part AF duplicate-content concern: the two pages now have a
  clean, non-overlapping split — free interactive results here, paid personalised report there.
- Real data + real photos confirmed loading in preview (15 cards, 15 Wikipedia photos).

**Risk / what to check in the morning:** (1) the free twins grid overlaps thematically with
`/born-on/` and `/todays-birthdays` — not duplicate (different surface/intent), but worth a
canonical/interlinking sanity check. (2) `/celebrity-birthday`'s SEO intent shifts from
"redirect/deep-link" to "interactive hub"; the title/description were kept keyword-aligned.
(3) The twins/search depend on Supabase at runtime (client-side); honest empty states are shown
if it's unreachable. No `/birthday-report` regression (not modified).

## FLAG 3 — Part 4 (Science & Longevity) — H1/SEO decision MADE + Workbench rebuild DEFERRED
**Context:** `/life-expectancy` (`src/pages/LifeExpectancy.tsx`, 1,209 lines) is NOT a landing
page like the other three — it is a full interactive application: a `phase: 'quiz'|'result'|'report'`
state machine, a paywall (`PaywallModal`, entitlement API, premium-gated report/action-plan),
a What-If simulator, an AI coach, and many child components (`LifeExpectancyCalculator` ~1,577
lines, `WhatIfSimulator`, `EnhancedLifeExpectancyReport`, `LongevityCountdown`, …) all styled in
the page's OWN cosmic theme (`bg-gradient-cosmic`, `glass-card`, `gradient-text-*`), not the
navy/gold category system. It is also the highest organic-traffic / revenue-sensitive page.

### H1/SEO decision — DONE (safe, surgical, reversible) ✅
- **On-page H1 changed** to the finalized headline **"How long could you live — and why."**
- **Keyword value preserved** two ways, deliberately:
  1. The exact head term **"Life Expectancy Calculator — how long will you live…"** is now the
     **H2 directly beneath the H1** (kept on-page in a heading tag, not lost).
  2. The **`<title>` tag is UNCHANGED** — still `Life Expectancy Calculator — How Long Will I
     Live? Death Clock & Lifespan Test` (the strongest ranking signal). Canonical/URL unchanged.
- **Why this is the right call:** the brief finalized the new H1; a real-traffic page should not
  lose its exact-match head term, so it was folded into the title tag (retained) + an on-page H2
  (added). The change is isolated to the always-rendered hero (not phase-gated) — low regression
  risk. Verified: calculator + honesty box intact, tsc 0, build OK, no JS errors.
- **I could not access live GSC/analytics** to confirm current ranking/traffic, so the
  conservative keyword-preserving approach above was chosen rather than dropping the term.
  **Recommendation:** after any real deploy, watch GSC for the bare `/life-expectancy/` slug for
  a few weeks; the title tag is unchanged so impact should be minimal. Fully reversible.

### Full Workbench VISUAL rebuild — DEFERRED (resource safety net) ⚠️
The brief asks to rebuild the page to the "Workbench" reference visual (navy/teal, honesty-forward
order, metrics/sliders/sources presentation). I did **not** do the full visual conversion unattended
because:
- The Workbench reference is a *landing* structure; `/life-expectancy` is a working *application*.
  Re-skinning it to Workbench means restyling the entire calculator + simulator + report + paywall
  UI (several thousand lines across child components), each currently on the cosmic theme.
- Highest regression surface on the site (paywall/premium/entitlement + phases + the live calc
  engine) + highest organic traffic → not appropriate to rewrite overnight before your review.
- A *partial* restyle (Workbench hero over a cosmic calculator) would read as a visual clash —
  worse than either doing it fully or not at all.
- The honesty-forward content the brief calls for **already leads the page** (Part AG: the
  `le-honesty` amber box + "In this vertical" + common-questions block sit right under the hero),
  and all disclaimers + the Sources/Methodology + citations are present and carried forward.

**Recommended approach when you approve it (morning):** treat it as its own focused task —
(1) port the cosmic child components (`LifeExpectancyCalculator`, `WhatIfSimulator`, result/report
cards) onto the `.paj` science theme incrementally with the calc/paywall logic untouched, OR
(2) wrap the page in `.paj[data-category="science"]` and translate section-by-section (hero →
honesty-forward order → quiz → result metrics → What-If sliders → sources → disclaimer → country
grid), verifying the paywall + premium + phase transitions after each. Budget it as a standalone
session with the preview + E2E paywall checks, not a tail-end of this one.
