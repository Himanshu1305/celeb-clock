BACKLOG-1 COMPLETE: YES

Items A–G are done and verified. Item H (best-effort) delivered one fully-verified page (/dasha-calculator); the remaining content-gap pages are listed below. No broken, unverified or unfinished work. Nothing was omitted under Rule 6 except where documented.

Branch: `backlog-1` (from `develop` @ RC2 `054fcee`). Not merged into `develop`/`main`; the staging worker's **active** version is still RC2 (untouched). A non-promoting preview version was uploaded for review (URL below).

---

## Preview URL (non-promoting — RC2 stays active)
**https://f590b14d-bornclock-staging.usdvisionai.workers.dev**
(Worker `bornclock-staging`, Version ID `f590b14d-8563-44fd-9907-a304b6f8d84f`, uploaded via `wrangler versions upload --env staging` from a `build:staging` bundle. This is a versioned preview URL only — it does NOT serve staging.bornclock.com or production; the active deployed version remains RC2. Verified live: the 5 new pages + /how-it-works return 200, invalid routes return 404, and the main staging URL still serves RC2.)

## Environment & load discipline
- CPU cores: 8 (`sysctl -n hw.ncpu`); half-core perf gate = load avg 4.0.
- A second project was building on this Mac throughout; load spiked to **18.68** during builds. Per instructions, every perf measurement was deferred until the 1-min load average dropped below 4.0 (polled in ~1-min steps). Recorded loads: A–D perf-budget @ **2.51**; final perf-budget @ **2.90**. Builds (not measurements) were run regardless of load.
- Baseline test suite (start of run): **155 files / 1888 tests**. Final: **161 files / 1936 tests** (+6 files / +48 tests, all added by this work; never below baseline).

---

## Item A — Biological-age wording ✅ DONE & VERIFIED
Reframed every page describing the biological-age tool so it is unmistakably an **estimate from lifestyle factors, not a lab/DNA measurement**. Epigenetic clocks (Horvath, DunedinPACE, DNA methylation) kept only as background science. Search value preserved: `<title>`, `<h1>`, and the "Biological Age Calculator" keyword are unchanged. Calculation, quiz, paywall, pricing untouched.
- `src/content/biologicalAgeContent.ts` — meta/OG/schema/hero badge/subtitle/trust chips reframed.
- `src/pages/BiologicalAge.tsx` — FAQ "test"→"estimate", "measures"→"estimates", share + result copy.
- `answers/WhatIsMyBiologicalAge.tsx`, `answers/WhatIsEpigeneticAge.tsx` — CTA "Test"→"Estimate".
- `articles/EpigeneticsArticle.tsx` — "measures"→"assesses" lifestyle factors.
- Hindi pages, `Footer.tsx`, `Index.tsx`, `Methodology.tsx`, related-tool labels — "Biological Age Test"→"Calculator".
- **Checked every page describing the tool** (grep sweep over src/). Evidence: tsc clean; 123 bio-age unit tests pass; content length validators pass at import; perf-budget PASS.

## Item B — "How we calculate" methodology page ✅ DONE & VERIFIED
**A methodology page already existed** at `/how-it-works` (`Methodology.tsx`, neutral theme + ArticleLayout; `/methodology` 301s to it). Decision (Rule 7 — don't duplicate, strengthen): added the **missing Vedic Astrology & Kundli section** instead of a competing page.
Every claim verified against `src/lib/vedic/*`:
- Engine: `astronomy-engine` (VSOP87/ELP2000-grade), sidereal **Lahiri ayanamsa** (J2000 23.853° + precession). Explicitly **not** Swiss Ephemeris — `@fusionstrings/panchangam` (Swiss-Eph WASM) is legacy; `panchang.ts` reuses the same astronomy-engine longitudes.
- Cross-check table vs ProKerala + a 2nd provider (exact rates from `vedicEngine.ts:7-12`): Rashi/Nakshatra/Pada/Dasha 100%; Lagna ~99.99% (0.004°); Manglik 99–100%; Sade Sati 100%; Kaal Sarp 96–100% (±4% edge). Local-first, provider fallback only on local failure.
- What Vedic can/cannot predict; marriage-timing guardrail (favourable window only, never a date, tense-aware, no unsolicited second-marriage) mirroring `chatGuardrails.ts`. Doshas framed calmly with classical cancellations; free remedies only.
- TOC entry; SEO description/keywords + intro updated; inbound link added from `/vedic-astrology` (anti-orphan). Linked from the footer (SiteFooter + Footer) and Index/LifeExpectancy/FAQ/About/EditorialPolicy.
- Note on "every trust strip": `TrustStrip` is a text-only `claim` component (no link slot); a sitewide retrofit would touch every page/test, so the intent was met via footer + contextual links. Documented.
- Evidence: tsc clean; methodology + career-methodology tests pass; perf-budget PASS.

## Item C — Remove dead code ✅ DONE & VERIFIED
- **Deleted** `src/pages/CelebrityBirthday.tsx` + its lazy import in `App.tsx`. Evidence: referenced only at `App.tsx:33`, never routed; zero refs in scripts/prerender/sitemap/tests/e2e/functions (all other "CelebrityBirthday*" hits are the unrelated `CelebrityBirthdayResult` type / `CelebrityBirthdayLanding`). Build (3635→ routes, 0 failed) and full suite pass without it.
- **FamilyDashboard error-fallback** moved off `bg-gradient-cosmic` onto the central system (`UtilityLayout`, theme=birthday). `bg-gradient-cosmic` class is now unused anywhere in src/.
- Systematic orphan scan of all 116 page components (exact-word match across src/scripts/e2e/functions): **0 further orphans**. Nothing else removed.
- **Kept (proven still live):** `--gradient-cosmic` CSS var + its tailwind token — still applied to `body{}` at `index.css:140`. Only the utility class is unused; the token stays.

## Item D — Branch cleanup ✅ DONE & VERIFIED
Re-checked CI: `deploy.yml` deploys only on `push: branches:[main]` (+ gated dispatch + nightly staging schedule); `perf-budget.yml` is PR-only. **Branch deletion and tag pushes trigger no deploy.**
Archived then deleted **only** branches fully merged into `develop`. Protected (untouched): `main`, `develop`, `redesign-central`, `backlog-1`, and the active worktree branch `worktree-agent-a8290049702571238`.
**22 archive tags `archive/<branch>` pushed to GitHub BEFORE any remote branch deletion** (verified 22 on origin).
Deleted — **21 local + 3 remote** (all merged into develop): `access/dixisurabhi-unlimited`, `feature/ai-astrologer-guardrails-part-f` (local 83a44c6 + remote cfc92b2 differed → both archived, incl. `archive/…-remote`), `feature/gemstone-chat-profile-part-j`, `feature/overnight-batch-part-i`, `feature/saved-profile-nav-part-e`, `feature/timing-calculation-dfix3`, `feature/vedic-engine-integration-part-b`, `feature/vedic-reading-ux-part-d`, `feature/yoga-detection-part-g`, `founder-fixes`, `integration/part-h-full-stack`, `overnight-batch`, `part-ac`, `part-ad-seo-fixes`, `part-ae-vedic-astrology-page`, `part-af-birthday-celebrity-page`, `part-ag-mystic-science-pages`, `part-ai-content-depth-fix`, `part-aj-four-page-redesign`, `product-polish`, `seo-content`.
**Kept — unmerged (NOT deleted), with contents:**
- `part-ah-homepage-redesign` (local) — 1 commit not in develop: `6735b1b Part AH: homepage redesign (Option C — animated celestial wheel)`.
- `origin/conflict_120226_1954` (remote) — 3 commits not in develop: `80679af`, `b2f2bcf`, `ce26b31` (all "Auto-generated changes").
All local deletions used `git branch -d` (safe; refuses if not merged) — all succeeded.

## Item E — Four new SEO pages ✅ DONE & VERIFIED
Checked existing coverage first (route scan + research doc): none of the four had a dedicated page. Built all four to Rule 7 standard (central design, H1+lead in prerendered HTML, unique title/meta/canonical/OG, single `<h1>`, one real FAQPage via `JsonLd.tsx`, sitemap + prerender list, interlinked).
- **/manglik** (Vedic) & **/kaal-sarp-dosha** (Vedic) — real computation via the existing `/api/kundali` engine (`doshas.mangalDosha` / `doshas.kaalSarp`). Calm, non-fear tone; classical cancellations; free optional remedies. Mirror the shipped `SadeSatiPage` template.
- **/personal-year-number** (Mystic) — client-side numerology via new `src/lib/personalYear.ts` (6 unit tests). **Date-dependent (Rule 13):** computed in-browser from `new Date()`; static explanation prerenders. Honest "not a predictive science" framing.
- **/angel-numbers** (Mystic) — honest explanatory hub (13 sequences); explicitly a modern spiritual belief, not birthday numerology, not science.
- Wiring: App routes + lazy imports; prerender-routes (static routes — no force404 enum needed); prerender-titles (unique title+meta each); sitemap auto. Interlinked: Vedic landing chips, Mystic corner chips, and Methodology dosha links repointed from `/kundali` to the new pages.
- Removed the subagents' duplicate page-level BreadcrumbList (SEO.tsx already emits one) — served HTML confirms exactly 1 BreadcrumbList + 1 FAQPage per page.
- Evidence: tsc clean; 20 smoke tests; build 0 failed; served-HTML title/h1/meta/FAQPage/canonical verified; perf-budget PASS; axe 0 serious/critical; 0 console errors; live preview 200.

## Item F — Deeper Dasha levels (5 total: + Sookshma & Prana) ✅ DONE & VERIFIED
- Core: `src/lib/vedic/dashaDeep.ts` — pure Vimshottari subdivision (lord sequence + year weights identical to the validated engine). `subPeriods(parentLord,start,end)` → the 9 children; applied recursively gives Maha→Antar→Pratyantar→**Sookshma→Prana**. No ephemeris → runs **client-side and ON DEMAND** (a level is computed only when the user expands its parent; never the whole tree up front).
- UI: `src/components/vedic/DashaDeepDive.tsx` — collapsible 5-level tree, **collapsed by default**, prominent **birth-time-sensitivity caveat** (deeper levels last days→hours). Integrated on KundaliPage below the chart (which always has a birth time). Tiny + renders only after chart generation → Kundli page stays within the speed budget (perf: /kundali JS 318→323kB of a 410kB ceiling).
- Glossary: added **sookshma** + **prana** to `termDefinitions.ts`.

### Dasha validation — method & results
`src/lib/vedic/__tests__/dashaDeep.test.ts` (6 tests, all pass):
1. **Sum-to-parent, exact:** children are contiguous (`child[i].start === child[i-1].end`) and the last child is pinned to the parent end, so the segments sum exactly to the parent duration (asserted to the millisecond).
2. **Vimshottari proportions:** each child's duration fraction equals `years[childLord]/120` (asserted within 1e-6).
3. **Sequence:** 9 children starting at the parent's lord in Vimshottari order.
4. **Nesting:** Sookshma sums to its Pratyantar; Prana sums to its Sookshma; deeper = shorter.
5. **Cross-check vs the validated engine:** for 2 reference charts (Makara 1988-11-05, Dhanu 1992-01-15), this util reproduces the engine's own `dashaTimeline` Antardashas — **lords exact, dates within 1 day**. The engine itself is validated 100% vs 2 providers for Dasha.
**Independent external reference:** an external live provider for the 4th/5th (Sookshma/Prana) levels was **not reachable in this environment**, so — per the backlog's allowed fallback — only (a) exact mathematical consistency and (b) exact parity with the project's validated engine were verified. Stated honestly on the page too.
- Also fixed a Rule-6 honesty bug found here: KundaliPage + its served `/kundali` meta claimed "Swiss Ephemeris"; corrected to "accurate sidereal (Lahiri) astronomy" (the live engine is astronomy-engine).

## Item G — "What's Ahead" & time-horizon views ✅ DONE & VERIFIED
Re-presents **only data the engine already computes** (Dasha timeline + house lords).
- `src/lib/vedic/whatsAhead.ts` (client-safe, date-dependent in-browser per Rule 13): mirrors the engine's `windowsForSignificators` + `SIGN_LORDS` house-lord mapping; **5 life areas** (career, relationships, home & property, health & energy, travel) from real house lords + classical karakas; **time horizons** (now / +1 month / +6 months / +1 year) + lifetime Maha overview.
- `src/components/vedic/WhatsAhead.tsx` — collapsible, two tabs (by area / by horizon), integrated on KundaliPage reusing the already-generated chart (**no re-entry** — carry-forward satisfied).
- **Consistency:** windows are the same `dashaTimeline` shown elsewhere on the chart (same data source).

### Marriage-timing guardrail — verification
Held **by construction** and asserted in `WhatsAhead.test.tsx`:
- Relationship windows are shown only as **month-year RANGES**, never a single day. Test asserts no day-precision date pattern appears (`\d{1,2} <Month>` / `<Month> \d{1,2}`).
- Fixed framing "a traditionally favourable window — a period of heightened possibility, not a fixed date and not a certainty." Test asserts this phrasing is present.
- **Never** says marriage will/won't happen; **never** mentions "second marriage"/"remarry"; **never** "guarantee" — all asserted absent.
- **Gender-neutral significators** (Venus + Jupiter + 7th lord) — matches the engine's documented gender-neutral choice; no gender is collected or assumed. **Never assumes marital status.**
- This matches the existing AI-astrologer/report guardrails (`chatGuardrails.ts`: windows are "heightened possibility, not a fixed certainty"; `readingPrompts.ts:212`: forward windows as "worth knowing", never a guarantee). The guardrail was verified to hold, so the relationship area was **kept** (not omitted). Parity of the underlying windows with the engine is unit-tested (career + marriage significators, 2 charts — exact).

### Free/paid setting
Single, clearly-named switch: `src/config/whatsAheadAccess.ts` → `WHATS_AHEAD_IS_FREE = true`. Ships **FREE**; flipping to `false` shows a locked teaser (tested) and changes nothing else. See "Needs the person".

## Item H — More content-gap pages (best-effort) ✅ ONE BUILT & VERIFIED; rest listed
Built the highest-reuse, fully-real page:
- **/dasha-calculator** (Vedic) — standalone Vimshottari timeline (a distinct query per the research doc). Reuses the validated engine end-to-end: BirthDetailsForm + carry-forward → `/api/kundali` → current Maha/Antar + the Item F `DashaDeepDive` (5 levels) + the Item G `WhatsAhead`. Full Rule 7 compliance; verified (served HTML, axe 0 serious/critical, 0 console errors, live preview 200).
**Remaining content-gap pages (NOT built — listed for a future block), from `docs/part-am-content-gap-research.md`:**
- Vedic: divisional charts D7 (Saptamsa)/D4 (Chaturthamsa)/D24; Pitra/Nadi Dosha explainers.
- Mystic: Chaldean numerology; Birthday number / Attitude number; element/Venus-sign compatibility angles.
- Birthday: per-day personality; "what happened on your birthday" (**omitted under Rule 6** — no genuine historical-events dataset is available; a templated/guessed version would violate the no-fabrication rule); birthday-number meaning; decade culture pages.
- Science: life expectancy by condition/profession; biological age by habit; Blue-Zones Power-9 pages; more country comparisons.

---

## Testing summary (per the TESTING-FOR-EVERY-ITEM section)
- **Unit/component suite:** 161 files / **1936 tests pass** (baseline 155/1888; +48 all new, incl. personalYear 6, dashaDeep 6 w/ engine cross-check, whatsAhead 7 w/ engine parity, DashaDeepDive 4, WhatsAhead 5 w/ guardrail assertions, NewSeoPages 20). tsc clean throughout.
- **Build/prerender:** full production build **3640 routes, 0 failed**; staging build 0 failed. Served HTML verified for all 5 new pages: unique `<title>`, single real `<h1>`, meta description, canonical, exactly 1 BreadcrumbList + 1 FAQPage each.
- **perf-budget (`scripts/perf-budget`):** PASS on all 7 budget pages after each build (final @ load 2.90): LCP ≤188ms, CLS 0, TBT ≤14ms; /kundali JS 323/410kB after adding the Item F+G components.
- **Cross-browser / a11y:** axe (Chromium desktop @1440 + Pixel 5 mobile) on all 5 new pages → **0 serious/critical** (only minor `region`/`heading-order`, matching the site-wide RC2 pattern). **0 console errors** on the new pages + /how-it-works.
- **JSON-LD:** FAQPage (real Q&A only) + the SEO-emitted BreadcrumbList render in the prerendered body (verified counts; JsonLd serialises objects so output is well-formed).
- **Full sitemap status crawl:** all **3640** sitemap URLs crawled against the built output → **0 non-200**. Spot-checked cross-group routes (zodiac/chinese-zodiac/vedic-zodiac/numerology/birthstone + the 5 new) → 200.
- **RC2 404 check (extended), run against a local `wrangler dev` of the real worker:** **52/52 PASS** — invalid parameterized routes → 404, all valid → 200 (incl. the 5 new static routes added to the VALID list), non-sitemap/dynamic → 200. The new routes are static (no params) so they add no force404 enum entries; they return 200 by construction (prerendered + not force-404'd). `functions/_worker.ts` force404 logic was NOT modified.
- **Live preview:** the 5 new pages + /how-it-works return 200 and invalids 404 on the uploaded preview URL; the main staging URL still serves RC2.

## Bug-log summary (`docs/backlog1-bugs.md`)
No functional defects were shipped. Issues found and fixed in-flight (not separate bugs): (1) subagent-added duplicate page-level BreadcrumbList on the 4 new pages → removed (SEO.tsx already emits one); (2) Kaal Sarp meta description 164→149 chars; (3) a flaky en-dash codepoint in a test regex → made the marriage-guardrail assertion robust (now asserts *no* day-precision date). (4) Rule-6 honesty bug: "Swiss Ephemeris" on `/kundali` → corrected to astronomy-engine wording.

## RC2 safety confirmation
No `wrangler deploy`; no staging **deploy/promotion** (only a non-promoting `versions upload`); no merge to `develop`/`main`; no production touch; no Cloudflare token added to GitHub; no route/domain changes; `public/robots.txt` untouched; no `noindex` on normal pages; no DB writes. `develop` and `redesign-central` remain at `054fcee`; the staging worker's active version is still RC2 (verified: main staging URL 200, unchanged).

## Needs the person (business/decisions — not code)
1. **"What's Ahead" free vs paid.** It ships FREE (`src/config/whatsAheadAccess.ts` → `WHATS_AHEAD_IS_FREE`). Flip to `false` to gate it behind the report; nothing else changes. Your call.
2. **`/vedic-astrology` still claims "Swiss Ephemeris (2.10.03, Moshier mode)"** in its copy, FAQ, share text, and served meta (`prerender-titles.mjs`), but the live birth-chart engine is **astronomy-engine** (sidereal Lahiri), not Swiss Ephemeris (that lib is a legacy/panchang-only dependency). I corrected `/kundali` (the page I was working through) but left `/vedic-astrology` untouched as out of Item F's scope. Recommend an honesty pass to reconcile these specific claims (and `src/components/BirthTimeVedicSection.tsx`, `src/services/kundaliService.ts`, `src/utils/vedicCalculations.ts` where the term appears) — verify per surface which engine actually runs before editing.
3. **Angel numbers / Manglik–Kaal Sarp remedies tone** — reviewed as calm/non-fear and free-remedy-only; confirm it matches your brand voice.
4. **Remaining content-gap pages** (Item H list above) — prioritise which to build next; note "what happened on your birthday" needs a real historical-events dataset before it can be built honestly.

## How `backlog-1` should join the live site after launch
Merge `backlog-1` into `develop` for the next release (do NOT merge to `main` directly — production deploys only on push to `main`, after the launch merge). `develop` is still at RC2 `054fcee`, so `backlog-1` is a clean fast-forward-style set of 8 commits on top of it — **no conflicts expected today**. If `develop` receives launch-day hotfixes before this merges, the likely conflict points are: `src/App.tsx` (route table — additive, easy), `scripts/prerender-routes.mjs` / `scripts/prerender-titles.mjs` (additive list entries), `src/pages/KundaliPage.tsx` and `src/pages/Methodology.tsx` (if launch fixes also touch them), and `src/lib/vedic/termDefinitions.ts` (additive). All are additive edits and should resolve trivially. After merging to `develop`, the normal pipeline (PR → perf-budget gate → merge to `main` → production deploy) applies. The 22 `archive/*` tags preserve every deleted branch if anything needs recovering.
