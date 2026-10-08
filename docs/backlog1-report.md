BACKLOG-1 COMPLETE: NO — in progress (Items A–D done & verified; E–H pending)

> This line is updated to YES only when Items A–G are done and verified.
> Branch: `backlog-1` (from `develop` @ RC2 `054fcee`). Not merged to develop/main; staging untouched (RC2 preserved).

---

## Environment & baseline
- CPU cores: 8 (`sysctl -n hw.ncpu`). Half-core perf gate threshold = 4.0 load avg.
- Baseline test suite (recorded 2026-10-08 on backlog-1): **155 files / 1888 tests passing**.
- A second project was building on this Mac during the run; load spiked to 18.68 during the full build. Per instructions, all perf measurements were deferred until the 1-min load average dropped below 4.0 (polled in ~1-min steps). The A–D perf-budget run was taken at load **2.51**.

---

## Item A — Biological-age wording ✅ DONE & VERIFIED
Reframed every page that describes the biological-age tool so it is unmistakably an **estimate from lifestyle factors, not a lab/DNA measurement**. Epigenetic clocks (Horvath, DunedinPACE, DNA methylation) retained only as background science. SEO keywords preserved (title, H1, "Biological Age Calculator" all unchanged). Calculation, quiz, paywall, pricing untouched.

Files: `src/content/biologicalAgeContent.ts` (meta/OG/schema/hero badge/subtitle/trust), `src/pages/BiologicalAge.tsx` (FAQ "test"→"estimate", "measures"→"estimates", share text, result copy), `answers/WhatIsMyBiologicalAge.tsx`, `answers/WhatIsEpigeneticAge.tsx` (CTA "Test"→"Estimate"), `articles/EpigeneticsArticle.tsx` ("measures"→"assesses" lifestyle factors), Hindi pages, `Footer.tsx`, `Index.tsx`, related-tool labels ("Biological Age Test"→"Calculator"), plus leftover label in `Methodology.tsx`.

Verification: tsc clean; 123 bio-age unit tests pass; content length validators (title ≤70, desc ≤160, og ≤200) pass at import; full suite 1888 pass; perf-budget pass.

## Item B — "How we calculate" methodology page ✅ DONE & VERIFIED
**A methodology page already existed** at `/how-it-works` (`Methodology.tsx`, neutral theme + ArticleLayout; `/methodology` 301s to it). Decision (per Rule 7 — don't duplicate, strengthen): added the **missing Vedic Astrology & Kundli section** rather than build a competing page.

Every claim verified against `src/lib/vedic/*`:
- Engine: `astronomy-engine` (VSOP87/ELP2000-grade), sidereal **Lahiri ayanamsa** (J2000 23.853° + precession). Explicitly NOT Swiss Ephemeris — `@fusionstrings/panchangam` (Swiss-Eph WASM) is a legacy dependency; the live panchang reuses the same astronomy-engine longitudes (`panchang.ts` header).
- Cross-check table vs ProKerala + 2nd provider, exact rates from `vedicEngine.ts:7-12`: Rashi/Nakshatra/Pada/Dasha 100%; Lagna ~99.99% (0.004°); Manglik 99–100%; Sade Sati 100%; Kaal Sarp 96–100% (±4% edge). Local-first; provider fallback only on local failure.
- What Vedic can/cannot predict; marriage-timing guardrail (favourable window only, never a date, tense-aware, no unsolicited second-marriage) mirroring `chatGuardrails.ts`.
- Doshas framed calmly with classical cancellations; free remedies only.

Also: TOC entry added; SEO description/keywords + intro bullets updated; inbound link added from `/vedic-astrology` (anti-orphan). The page is linked from the footer (SiteFooter + Footer) and Index/LifeExpectancy/FAQ/About/EditorialPolicy.

Note on "linked from every trust strip": `TrustStrip` is a text-only `claim` component (no link support), so retrofitting links into it would be a risky sitewide sweep touching every page/test. Satisfied the intent via the footer + contextual links instead; documented here.
Follow-up: Manglik/Kaal Sarp references temporarily point to `/kundali`; repointed to the dedicated pages in Item E.

Verification: tsc clean; methodology + career-methodology tests pass; full suite 1888 pass; perf-budget pass.

## Item C — Remove dead code ✅ DONE & VERIFIED
- **Deleted** `src/pages/CelebrityBirthday.tsx` + its lazy import in `App.tsx`. Evidence: referenced only at `App.tsx:33`, never routed (no `<Route element={<CelebrityBirthday/>}>`); zero refs across scripts/prerender/sitemap/tests/e2e/functions (all other "CelebrityBirthday*" hits are the unrelated `CelebrityBirthdayResult` type / `CelebrityBirthdayLanding` page).
- **FamilyDashboard error-fallback** moved off `bg-gradient-cosmic` onto the central system (`UtilityLayout`, theme=birthday). `bg-gradient-cosmic` class is now unused anywhere in src/.
- Systematic orphan scan of all 116 page components (Python, exact-word match across src/scripts/e2e/functions): **0 further orphans** — every other page is referenced. Nothing else removed.
- **Kept (listed, proven still live):** `--gradient-cosmic` CSS var + its tailwind token — still applied to `body{}` at `index.css:140` (a solid-cream gradient). Only the utility *class* is now unused; the token stays.

Verification: tsc clean; full prod build passes (**3635 routes prerendered, 0 failed**) confirming nothing broke without the removed page; full suite 1888 pass; perf-budget pass.

## Item D — Branch cleanup ✅ DONE & VERIFIED
Re-checked CI: `deploy.yml` deploys only on `push: branches:[main]` (+ gated dispatch + nightly staging schedule); `perf-budget.yml` is PR-only. **Branch deletion and tag pushes trigger no deploy.**

Archived (tag `archive/<branch>`) then deleted **only** branches fully merged into `develop` (`git branch --merged develop`). Protected (never touched): `main`, `develop`, `redesign-central`, `backlog-1`, and the active worktree branch `worktree-agent-a8290049702571238`.

**22 archive tags pushed to GitHub BEFORE any remote branch deletion** (verified 22 on origin).

Deleted — 21 local + 3 remote (all merged into develop):
`access/dixisurabhi-unlimited`, `feature/ai-astrologer-guardrails-part-f` (local 83a44c6 + remote cfc92b2 differed → both archived: `archive/…` and `archive/…-remote`), `feature/gemstone-chat-profile-part-j`, `feature/overnight-batch-part-i`, `feature/saved-profile-nav-part-e`, `feature/timing-calculation-dfix3`, `feature/vedic-engine-integration-part-b` (local+remote), `feature/vedic-reading-ux-part-d` (local+remote), `feature/yoga-detection-part-g`, `founder-fixes`, `integration/part-h-full-stack`, `overnight-batch`, `part-ac`, `part-ad-seo-fixes`, `part-ae-vedic-astrology-page`, `part-af-birthday-celebrity-page`, `part-ag-mystic-science-pages`, `part-ai-content-depth-fix`, `part-aj-four-page-redesign`, `product-polish`, `seo-content`. (Remote set = the 3 that existed on origin.)

**Kept — unmerged (NOT deleted), with contents:**
- `part-ah-homepage-redesign` (local) — 1 commit not in develop: `6735b1b Part AH: homepage redesign (Option C — animated celestial wheel)`.
- `origin/conflict_120226_1954` (remote) — 3 commits not in develop: `80679af`, `b2f2bcf`, `ce26b31` (all "Auto-generated changes").

All local deletions used `git branch -d` (safe; refused if not merged) — all succeeded.

---

## Items E–H — PENDING
- E — Four new SEO pages (/manglik, /angel-numbers, /personal-year-number, /kaal-sarp-dosha)
- F — Deeper Dasha levels (Sookshma, Prana)
- G — "What's Ahead" and time-horizon views
- H — More content-gap pages (best-effort)

## Perf-budget (A–D), load 2.51
```
PASS /age-calculator/   LCP 164  CLS 0  TBT 0  JS 391/547kB
PASS /kundali/          LCP 172  CLS 0  TBT 6  JS 318/410kB
PASS /                  LCP 148  CLS 0  TBT 9  JS 295/371kB
PASS /celebrity/        LCP 184  CLS 0  TBT 0  JS 333/547kB
PASS /blog/             LCP 192  CLS 0  TBT 3  JS 440/547kB
PASS /pricing/          LCP 140  CLS 0  TBT 0  JS 301/547kB
PASS /privacy/          LCP 144  CLS 0  TBT 0  JS 304/547kB
```

## RC2 safety confirmation
No `wrangler deploy`, no staging deploy, no merge to `develop`/`main`, no production touch, no Cloudflare token added to GitHub. `develop` and `redesign-central` remain at `054fcee`.
