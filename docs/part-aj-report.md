# Part AJ — Four-Page Redesign — Final Report

**Branch:** `part-aj-four-page-redesign`
**Session:** unattended overnight build, per owner instruction. Stopped at preview; **no real
`wrangler deploy` was run, nothing merged.** Awaiting explicit go-ahead before any merge/deploy.

**Outcome in one line:** Parts 1–3 (Vedic, Birthday, Mystic) fully redesigned to the finalized
reference designs, wired to real data/engines, tested, and preview-verified. Part 4 (Science) —
the explicitly-requested **H1/SEO decision is done**; the **full Workbench visual rebuild is
deliberately deferred** via the resource safety net (it's a 1,200-line revenue/SEO-critical
*application*, not a landing page — too risky to rewrite unattended before your review). This is
the "ship three cleanly, flag one well" outcome the brief explicitly prefers.

---

## 0. Step 0 — base-branch finding (please read first)

The brief said "branch off `develop` HEAD" **and** "the base must contain Parts AE–AI." Those
conflict in the real repo: **`develop` only contains AE–AG**; Parts AH (homepage redesign) and
AI (glossary/TermTip + Rashi Ratna cross-ref) live on `part-ai-content-depth-fix` (the branch
checked out at session start, a descendant of `develop`).

**Decision:** branched `part-aj-four-page-redesign` off the current HEAD
(`part-ai-content-depth-fix`), so all of AE–AI is present. Branching off `develop` would have
silently dropped AH + AI — exactly the "quietly losing real functionality" failure the brief
warns against. Verified present on the base: `termDefinitions.ts` (`VEDIC_TERMS`), `TermTip.tsx`,
`rashiRatnaData.ts` + Rashi Ratna ↔ Gemstones cross-ref. **See FLAG 1** — this has a merge
implication: this branch should only merge to `develop` after (or together with) AH + AI.

---

## 1. The shared design system (how the redesign is implemented)

- `docs/design-reference/{vedic,birthday,mystic,science}-final.html` carry an **identical** CSS
  design system; only the `body` class (`editorial`/`field-guide`/`atlas`/`workbench`),
  `data-category`, and `--accent` differ.
- Generated **one scoped stylesheet** `src/styles/part-aj.css` from that CSS via
  `scripts/build-paj-css.mjs`, which prefixes **every** selector under `.paj` so the generic
  class names (`.section`, `.btn`, `.field`, `.hero`, `.feature`…) **cannot leak** into the other
  ~120 site pages. Per-category accents appended (vedic gold `#C6A15B`, birthday coral `#F0715A`,
  mystic violet `#6E5AA6`, science teal/blue `#2F6FB0`). Verified non-leaking.
- Each page renders `<div className="paj {variant}" data-category="…">` and reuses the real site
  `Navigation` + `AuthNav`, `SEO`, forms, calc utils, services, glossary, and share components.

---

## 2. Per-page results

### Part 1 — Vedic Astrology (`/vedic-astrology`) — Editorial — ✅ complete (commit `c315541`)
**Hero headline (as finalized):** "Your birth chart, computed — not guessed. / Every detail matters."

**Carried forward from the live page & confirmed working:**
- Real Kundli-generation entry — `BirthDetailsForm` → `/kundali` `autoGenerateBirth` flow (unchanged engine).
- Every real internal link: `/kundali`, `/kundali-match`, `/astrologer`, `/sade-sati`, `/muhurat`,
  `/career-report`, `/gemstones`, `/rashi-ratna`, `/sun-vs-moon-sign`, `/moon-sign`, the Nakshatra article.
- Honesty framing, FAQ, and the real priced report flow (₹199 Kundali / ₹299 combo links).
- **Interpretation (documented):** the current `/vedic-astrology` is a *landing/hub* page; Kaal Sarp /
  free remedies / Pratyantardasha are **not** sections on it today — they live on the deeper pages it
  links to (`/kundali`, `/sade-sati`). The Editorial reference is likewise a landing structure, so those
  were carried forward as **preserved, linked** features (unchanged on their own pages), not invented as
  new landing sections. This matches both the current page and the reference.

**Added per brief:**
- **Glossary (Part AI `TermTip`)** on technical terms: ayanamsa, lagna, nakshatra, dasha,
  mahadasha, rashi, yoga — + the yoga **`GradeLegend`**.
- **WhatsApp share** at the real-example moment (reused `WhatsAppShareButton`).

**Real example = genuinely computed** (not the reference's placeholder): renders the full 9-planet
placements table + a North-Indian chart built from real house data for the reference chart
(14 Mar 1990, 10:30 IST, New Delhi — verified Swiss-Ephemeris values), and **re-computes it live**
via `/api/vedic-reading` with the verified values as the offline fallback. Honest either way.

### Part 2 — Birthday & Celebrity (`/celebrity-birthday`) — Field Guide — ✅ complete (commit `779374b`)
**Hero headline:** "Everything your birthday reveals. / Made for your story."

**Architecture decision (FLAG 2 — resolved, please review):** `/celebrity-birthday` is now the
**home for FREE interactive results**. The hero DOB computes the **birthday-twins grid + the date
snapshot INLINE** (it no longer navigates to `/birthday-report?dob=`). `/birthday-report` is
**unchanged** — still the paid "Birthday Blueprint" report/checkout, only linked, never duplicated.
This **resolves** (not reintroduces) the Part AF duplicate-content concern: free interactive results
here, paid personalised report there — a clean, non-overlapping split. Chosen because it reuses
existing, battle-tested services (no new engines, `/birthday-report` logic untouched) and it is what
the reference design intends.

**Real data + real images — before/after evidence (verified in preview):**
- *Before:* the live page's "real example" was **hard-coded** (Oct 2 / Gandhi / Libra / Life Path 9
  as static strings); hero only navigated away.
- *After:* twins + today's-birthdays from `getRankedBirthdayCelebrities` (Supabase
  `celebrity_sitelinks`, ranked by recognition); a name search over the same table (28k+ rows);
  **15 person cards rendering 15 real Wikipedia photos** via `fetchCelebrityImage` (cached), with
  two-letter initials only as a genuine last-resort fallback; each card links to its **real
  Wikipedia source** ("View profile & source ↗"); the snapshot (zodiac / life path / weekday) is
  **computed** from the real calc utils (verified correct for today's date). **WhatsApp share** at
  the twins result moment composes a note with the top real twins.

### Part 3 — Mystic Corner (`/mystic-corner`) — Atlas — ✅ complete (commit `e2b709b`)
**Hero headline:** "The mystical side of your birth date. / Numerology, zodiac, and more — actually computed."

**Carried forward + made genuinely interactive:** all three tools are now **computed on-page** from
the entered date — Numerology life-path (with the workings shown, e.g. `1 + 9 + 9 + 0 + 0 + 3 + 1 + 4
= 27 → 9` + `LIFE_PATH_TRAITS` title/traits), Western zodiac (`calculateWesternZodiac` + a browsable
12-sign selector), Chinese zodiac (`calculateChineseZodiac` animal + element). Verified for 14 Mar
1990: Life Path 9, Pisces, Horse·Metal — matching the reference sample exactly. The honest "different
systems, not a generic horoscope" framing is preserved (4 honesty items incl. "different systems stay
distinct"), cross-links to Vedic + Birthday + the carry-forward explore links (`/numerology`,
`/name-numerology`, `/zodiac`, `/chinese-zodiac`, `/tarot-card-by-birthday`, `/compatibility`), and a
**WhatsApp share** at the result moment are all present.

### Part 4 — Science & Longevity (`/life-expectancy`) — Workbench — ◻ partial (commits `416f11f`, `72bcddf`)
**Hero headline (finalized, applied):** "How long could you live — and why."

**H1/SEO decision — DONE (FLAG 3), safe + reversible:**
- On-page **H1 changed** to the finalized headline.
- **Keyword value preserved deliberately:** the exact head term "Life Expectancy Calculator — how
  long will you live…" is now the **H2 directly beneath** (kept on-page in a heading), and the
  **`<title>` tag is UNCHANGED** (still `Life Expectancy Calculator — How Long Will I Live? Death
  Clock & Lifespan Test` — the strongest ranking signal). No URL/canonical change.
- I could not access live GSC/analytics, so chose the conservative keyword-preserving approach rather
  than dropping the term. **Recommendation:** after any real deploy, watch GSC for the bare
  `/life-expectancy/` slug for a few weeks; impact should be minimal since the title tag is unchanged.
  Fully reversible. The change is isolated to the always-rendered hero (not phase-gated), low risk;
  verified the calculator + honesty box remain intact.

**Full Workbench VISUAL rebuild — DEFERRED (resource safety net, FLAG 3):** `/life-expectancy` is a
1,209-line interactive **application** (phase machine `quiz|result|report` + paywall + premium-gated
report/action-plan + What-If simulator + AI coach + many cosmic-themed child components) and the
site's highest-traffic/revenue-sensitive page. Re-skinning it to Workbench means restyling the whole
calculator/simulator/report/paywall UI — thousands of lines — with high regression risk on revenue +
SEO. The brief explicitly offered the safety net here, and prefers "three clean + one well-flagged"
over rushing all four. The honesty-forward content the brief wants **already leads the page** (Part
AG) and all disclaimers + Sources/Methodology + citations are present and carried forward. A concrete
recommended approach for when you approve it is in `docs/part-aj-flags.md`.

---

## 3. Cross-category interlinking — ✅ confirmed (all four mutually link)
Verified each page links to the other three:
- Vedic → Birthday, Mystic, Science ✓ (footer + cross-link cards)
- Birthday → Vedic, Mystic, Science ✓
- Mystic → Vedic, Birthday, Science ✓
- Science → Vedic, Birthday, Mystic ✓ (added the missing `/mystic-corner` link, commit `72bcddf`)

---

## 4. Test results (at every checkpoint)
- **Unit suite (`vitest run`):** 152 files / **1860 tests PASS** — after Part 1, after Part 3, and
  on the combined branch. (The `HTMLCanvasElement.getContext` console noise is pre-existing jsdom
  noise from an unrelated page, not a failure.)
- **Typecheck (`tsc --noEmit`):** **0 errors** at every step (project memory notes `vite build`
  skips typecheck, so this was run explicitly each time).
- **`internalLinking` + `routesWired`:** 16/16 PASS (run specifically after the link changes).
- **`vite build`:** OK at every step.
- **Visual verification:** desktop (1280) + mobile (390) screenshots for all three redesigned pages
  + the Science hero; no page JS errors on any; edge-to-edge density holds; everything stacks on
  mobile; **no horizontal overflow** (scrollWidth == viewport on all three).

## 5. Performance — real Lighthouse-style numbers (Birthday page, mobile)
Lighthouse CLI hit `NO_FCP` in this headless environment (a known SPA/headless limitation — the page
paints fine, proven by screenshots), so metrics were measured with **Playwright under Pixel-5 + 4×
CPU throttle + ~Slow 4G**:
- **FCP ≈ 2.7s, LCP ≈ 2.7s.** LCP is the **hero text**, not an image — the real celebrity photos are
  below the fold, lazy-loaded, and in fixed-size containers, so **they do not hurt LCP** (this was
  the brief's specific concern about real images at scale).
- **CLS: 0.173 → fixed to 0.049** (and 0 in a second run), well within the "good" <0.1 threshold.
  Root cause was **not** images — it was the real `Navigation`+`AuthNav` header wrapping to two rows
  and growing after first paint. **Fixes applied:** reserve the header's final height on mobile
  (`min-height:104px`) + fixed-height skeleton cards for the async people grids. All three redesigned
  pages: CLS ≤ 0.05, no overflow.

## 6. Preview (prod-safe, no deploy)
- Built with the full production pipeline (`npm run build` — vite + celebrity slugs + OG cards +
  prerender + sitemap), then **`npx wrangler versions upload`** (creates a preview URL **without**
  promoting to live). **No `wrangler deploy` was run.**
- **Preview URL:** **https://3046ba0c-bornclock.usdvisionai.workers.dev** (Worker Version ID
  `3046ba0c-4976-40d7-a610-9554eaf9345d`). This is a prod-safe preview — **not** promoted to live.
  (Full build: 3630 routes prerendered, sitemap 3630 URLs, 3834 assets uploaded.)
- **Preview verification (against the preview URL specifically, not local):**
  - All four pages: **HTTP 200**, correct prerendered H1s
    (Vedic "Your birth chart, computed — not guessed."; Birthday "Everything your birthday reveals.";
    Mystic "The mystical side of your birth date."; Science "How long could you live — and why.").
  - Live engine on preview: `/api/vedic-reading` returns real output (Lagna Vrishabha/Taurus, Rashi
    Tula/Libra, Chitra pada 3) — and the Vedic page shows the **"✓ re-computed live — engine agrees"** badge.
  - **Birthday:** 15 person cards with **15 real Wikipedia photos**, WhatsApp share present, snapshot
    computed (♎ Libra / Life path 4 / Friday). No JS errors.
  - **Vedic:** live badge present, 9-row real placements table, WhatsApp share, 4 glossary tooltips. No JS errors.
  - **Mystic:** life path 9, workings `1 + 9 + 9 + 0 + 0 + 3 + 1 + 4 = 27 → 9`, WhatsApp share. No JS errors.
  - **Mobile (Pixel 5): no horizontal overflow on any of the four pages.**

---

## 7. What I did NOT do (awaiting your go-ahead)
- No merge to `develop`. No `wrangler deploy` / `wrangler versions deploy` / rollback (nothing promoted to live).
- No change to `/birthday-report`'s paid logic, the longevity calc engine, the paywall, or any pricing.
- Did not force the full Workbench rebuild of `/life-expectancy` unattended (deferred, FLAG 3).

## 8. Decisions needing your review (all in `docs/part-aj-flags.md`)
1. **FLAG 1** — base branched off `part-ai-content-depth-fix` (not `develop`) so AH+AI aren't lost; merge-order implication.
2. **FLAG 2** — `/celebrity-birthday` is now free interactive results; `/birthday-report` stays the paid flow.
3. **FLAG 3** — `/life-expectancy` H1 changed with keyword preservation; full Workbench visual rebuild deferred.

**Commits on the branch:** `c315541` (Part 1) · `779374b` (Part 2) · `e2b709b` (Part 3 + header fix)
· `416f11f` (Part 4 H1/SEO) · `72bcddf` (interlinking) · `05cbba8` (CLS/perf).
