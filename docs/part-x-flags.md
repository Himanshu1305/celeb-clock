# Part X/Y/Z/AA — Combined session flags

## Combined dependency check (shared components)
Landing pages (Part W `VedicAstrologyLanding` + new Y/Z/AA) import only generic layout/
util components: **Navigation, AuthNav, Footer, SEO, useSavedProfile**. The Kundali
reading pipeline (Part X target) touches **readingPrompts.ts, the Dasha engine
(vedicEngine.ts), VedicReading.tsx, api/vedic-reading.ts, the accuracy/safety checkers,
PDF, reading-history, chat** — and NONE of the shared layout components. There is **no
cross-import** between landing pages and reading components.

**Conclusion:** Part X (reading rewrite) and Parts Y/Z/AA (landing pages) do not share
any component that either modifies. Cross-contamination risk between X and Y/Z/AA is
effectively nil.

**Within Y/Z/AA:** to satisfy the cross-page "one coherent family" requirement, a shared
`CategoryLandingPage` component will be extracted in Part Y and Part W refactored to use
it (same rendered output), so all four landing pages share one template. Because that
shared component IS touched by each landing part, Part W's page will be re-tested after
the refactor (its e2e spec + screenshots), and each new page re-verified. Noted here per
the session's shared-component discipline.

## (further Part X / Y / Z / AA flags appended below as found)

## Part X — test results & decisions
- **Structure**: four-part (verdict → plain impact → "this comes from…" evidence →
  forward-looking timing close) landed on every section. BEFORE led with mechanism;
  AFTER leads with meaning. Real before/after in docs/part-x-before-after.md.
- **Accuracy (zero-tolerance)**: AFTER REF 57/57, CH2 47/47, SS 48/48 — 0 wrong, none
  degraded. (BEFORE REF 61/61, CH2 67/67.)
- **Safety**: banned-word sweep CLEAN on all 3 charts × 9 sections. Health stays
  theme-only (no diagnosis), Doshas calm/non-fear (CH2 Kaal Sarp framed as structural,
  SS active Sade Sati framed as a reflective checkpoint), no literal yes/no.
- **Adversarial (mixed signals)**: CH2 (Kaal Sarp present) verdict honestly says
  "manageable… no urgent afflictions to fear" and names the present dosha calmly — not
  forced positive/negative. SS (active Sade Sati) verdict: "generally clean… with one
  active cycle to navigate mindfully" — honest mixed.
- **LLM variance note**: the active-Sade-Sati chart degraded on 2 of 3 attempts (once on
  safety, once on an accuracy miss) before a clean 48/48 run — the existing 3-attempt +
  degrade-to-facts guardrail worked correctly (never shipped wrong/unsafe). REF/CH2 came
  clean first try. Not a prompt regression (same prompt produces clean REF/CH2); it's
  temperature-0.6 variance on a harder chart, handled gracefully by design.
- **Pratyantardasha**: computed (3rd level, same validated proportional math), internally
  consistent (falls within the current Antardasha, contains now — unit-tested). Exposed
  ONLY in the advanced view (reading-pratyantardasha testid) and the chat grounding;
  NOT referenced in any narrative section (carried as a separate `pratyantardasha` fact,
  never printed into buildReadingUserPrompt). READING_VERSION bumped v10→v11.
- **Reading-history (Part P)**: `changeSince` compares the computed `dasha` string, not
  prose — unaffected by the rewrite; plus v11 regenerates old cached readings, so no
  old-vs-new structural comparison occurs. Handled.
- **Chat consistency**: DECISION — the chat is wired WITH Pratyantardasha in its grounding
  facts, so it answers a direct Pratyantardasha question accurately (rather than a broken/
  invented answer). Live-verified on staging post-deploy.
- **PDF (Part M)**: there is NO Kundali-reading PDF export path (the reading is on-screen
  only); the invoice/matching PDF generators are untouched by Part X — confirmed unchanged
  and covered by the regression suite. Nothing to re-verify for the reading itself.
- **Part R tone**: reflection copy ("no right or wrong answer", "That's completely
  normal", "thank you for sharing") is already warm/reassuring — consistent with the new
  reading tone. Spot check passed; no change made.
- **Length**: AFTER sections 98–150 words (5–8 short sentences) — richer but still tight,
  not a wall of text.

## Deploy strategy (X/Y/Z/AA) — honest note
Each part is committed SEPARATELY (X = 8f3d8c0; Y/Z/AA to follow). Because all four
target ONE staging environment and each build takes ~11 min, the staging DEPLOY is done
ONCE after all parts are built, then serving is verified for EACH part's distinct marker
(v11 reading + Pratyantardasha advanced line for X; each new /slug for Y/Z/AA). Part X's
environment-dependent checks (Playwright reading-page screenshot, live chat Pratyantardasha
answer, live reading generation) are performed against that deployed staging. Part X's
content testing (before/after, accuracy, safety, adversarial, structure) was already done
live via the generation harness and is complete.

## Parts Y/Z/AA — build + commit notes
- Extracted shared `src/components/landing/CategoryLandingPage.tsx`; refactored Part W's
  /vedic-astrology to use it (same output), then built /science-longevity (Y),
  /birthday-fun (Z), /mystic-corner (AA) as thin configs → all four read as ONE coherent
  family (verified by the "same template family" e2e test).
- COMMIT DECISION: Y/Z/AA committed together as one cohesive unit (X remains a separate
  commit). They share one extracted template + one Navigation array + one nav spec + one
  landing e2e file, so 3 separate commits would create broken intermediate states (a nav
  item / spec entry pointing at a page not yet committed). Honest deviation from strict
  per-part commits, per the session's "use judgment, document it" discipline.
- Verified real stats (Phase 0, not assumed): Science 15+ health factors (model uses 20
  inputs / 14 surfaced factors), **54 countries** (BIRTH_BASELINES — the site's other
  "57 countries" copy is STALE/inaccurate, flagged below), 3 sources (UN/WHO/GBD).
  Birthday **3,000+** celebrities (celebrities.json=3,107; NOT the stale "50,000+"),
  7 tools, 366 days. Mystic 3 tools / 9 Life Path numbers (tarot tool maps 12 life-path
  cards, so NO "78 cards" overclaim).
- Copy guardrails verified by e2e: NO "waste your time" framing on Birthday Fun; NO
  "precisely computed"/"rigorously verified" on Mystic Corner (reserved for Vedic).
- SEO/AEO: all 4 pages prerendered with ≤70-char titles, meta, direct-answer opening,
  WebApplication schema (rendered INLINE in the body — fixed a react-helmet-async rAF
  race that was intermittently dropping the schema from the prerendered HTML), indexable
  (noindex=0), in sitemap; each added as first item in its nav dropdown.
- Density: full container width (100% at desktop), grids fill rows, 0px horizontal
  overflow at desktop + 3 breakpoints (narrow-360, tablet-768, landscape-844x390).

## FLAG for user: site-wide "57 countries" is inaccurate (real = 54)
BIRTH_BASELINES has 54 countries, but existing copy says "57 countries" in Index.tsx,
PaymentSuccessModal.tsx and blogPosts.ts. The NEW /science-longevity page uses the
honest 54. → USER: consider correcting the other "57" occurrences site-wide (out of this
session's scope, same pattern as Part V's off-homepage "50,000+" flag).
