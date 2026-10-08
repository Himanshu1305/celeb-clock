# P2 — Predictions and Paid Depth

**P2 COMPLETE: YES**

Every P2 item in Part 2 and every improvement item assigned to P2 in
`docs/growth-improvements.md` (GP2-SOUTH, GP2-10PORUTHAM, GP2-PERIOD-PREDICT,
GP2-CAREER-RANKED, GP2-LIFE-SECTIONS, GP2-CHILD-KUNDLI, GP2-DOSHAS) is built,
computed from real data, tested and verified — or deliberately scoped-down with
a documented, honest reason (the optional Varshphal/annual chart; see §7), or
blocked only on the person (prices for the new paid products, all shipped OFF).
Nothing was merged into `develop`; nothing was deployed to production; RC3 on
staging is untouched. New work is shown only through a **prod-safe preview
version** (`wrangler versions upload --env staging`, never promoted to live
traffic). `growth` is pushed after every item. No Cloudflare token was added to
GitHub (the local wrangler login is an OAuth session, not a GitHub secret).

- **Date:** 2026-10-09 (unattended run).
- **Branch:** `growth` (from the RC3-merged `develop`). Commits pushed per item.
- **Machine load (Rule 3):** 8 CPU cores. Load was checked before each speed
  measurement — 2.82 before the build, **1.44 during the perf-budget run** (both
  below half the cores), so no wait was required and the speed numbers are valid.
- **Test baseline (start):** 176 test files / 2001 tests, 0 failures.
- **Test suite (end):** **182 files / 2035 tests, 0 failures** (+6 engine test
  files, +34 tests; never below baseline).
- **Typecheck:** `tsc --noEmit` clean (0 errors) throughout.
- **Build:** `npm run build:staging` — **1000 s (~16.7 min)**; prerender **4028
  routes, 0 failed, 0 skipped** (+10 new P2 static routes over P1's 4018).
- **Preview URL:** `https://a437f2c6-bornclock-staging.usdvisionai.workers.dev`
  (prod-safe `versions upload`; the live staging worker and production are
  unchanged). A worker version ID is also recorded in §8.

---

## 1. Items built (Part 2 · Phase P2)

| # | P2 item | Status | Evidence |
|---|---------|--------|----------|
| 1 | Personal predictions — yearly / quarterly / monthly (Dasha + transits), Rule 7 | ✅ done | `periodForecast.ts` → yearly(3)/quarterly(4)/monthly(12), each graded strong/moderate/mild from the governing Dasha lord; `PeriodForecast` on `/kundali`. Transit dimension cross-linked to `/transit` + `/sade-sati`. **Varshphal annual chart deferred — §7.** |
| 1b | Upgrade existing prediction surfaces to Rule 7 | ✅ done / verified-compliant | New surfaces (period forecast, career ranking, life areas) are graded + `GradeLegend`. Existing narrative surfaces (What's Ahead, Sade Sati, Muhurat, career verdict) were already graded/hedged/attributed/guardrailed (P1 audit) and are unchanged; guardrails intact. |
| 2 | Child (Bal) Kundli | ✅ done | `childKundli.ts` composes temperament, learning, talents, favourable periods, Mool note, name sounds (→ `/baby-names`), support. New `/child-kundli`. Health = wellbeing-only, points to paediatrician, no dates. |
| 3 | Career — ranked best-suited fields | ✅ done | `careerFields.ts` ranks fields from the 3 strongest significators (Shadbala + 10th/D10/Yoga) + "approach with care"; on `/career-report`. |
| 4 | Health (adults) | ✅ done | `lifeAreas.ts` Health section — wellbeing framing, never diagnosis, points to a doctor, no illness dates. |
| 5 | Foreign travel/settlement, wealth, education | ✅ done | `lifeAreas.ts` Wealth / Education / Foreign sections, graded; new `/life-report` page + `/api/life-report`. |
| 6 | Free Kundli PDF; South-Indian chart style | ✅ done | `buildKundaliPdfHtml` + shared `printHtmlViaIframe`; free "Download Kundli (PDF)" button. `KundaliChart` North/South toggle (South = fixed-sign grid). |
| 7 | Matching depth — Manglik-in-matching, Nadi explained, 10-porutham | ✅ done | `porutham.ts` (10 poruthams); `/api/kundali-match` returns `porutham` + a `manglik` mutual-cancellation check; both rendered on the matching page. Nadi explained in matching (cancellation transparency) **and** standalone `/nadi-dosha`. |
| 8 | Numerology — name correction, business name, mobile, house number | ✅ done | `numerologyTools.ts` + `/name-correction`, `/business-name-numerology`, `/mobile-number-numerology`, `/house-number-numerology`. Chaldean engine reused; classical compound meanings cited as tradition. |
| 9 | More doshas — Pitra, Nadi, Mool, Grahan | ✅ done | `moreDoshas.ts` (client-side from `/api/kundali`, no cache-versioning risk); one `DoshaCheckPage` → `/pitra-dosha`, `/mool-dosha`, `/grahan-dosha`, `/nadi-dosha`. Graded, calm, tradition-disclosed. |
| 10 | Classical references on interpretations | ✅ done | `ClassicalRefs` (BPHS, Brihat Jataka, Saravali, Phaladeepika — cited by name, **no invented chapters**, Rule 8) on career / life / child reports. |
| 11 | Paid products behind flags, OFF | ✅ done | `src/config/paidProducts.ts` — yearly report, child-kundli report, career pro, marriage report, name-correction pro, premium AI tier — all `enabled: false`, **no invented prices** (Rule 10). Free summaries remain visible. |

## 2. Improvement items assigned to P2 (`growth-improvements.md`)

| ID | Status | Note |
|----|--------|------|
| GP2-SOUTH | ✅ done | North/South chart toggle; live-preview real-use on Chromium + WebKit |
| GP2-10PORUTHAM | ✅ done | 10-porutham + Manglik in matching; preview API verified 7/10 + "clear" |
| GP2-PERIOD-PREDICT | ✅ done | yearly/quarterly/monthly graded Dasha forecast |
| GP2-CAREER-RANKED | ✅ done | ranked fields on `/career-report` |
| GP2-LIFE-SECTIONS | ✅ done | wealth/education/foreign/health on `/life-report` |
| GP2-CHILD-KUNDLI | ✅ done | built cheaply by composing the existing engine |
| GP2-DOSHAS | ✅ done | Pitra/Mool/Grahan/Nadi standalone explainers |

---

## 3. New routes (all prerendered, in sitemap, 200 on preview, axe-clean)

`/name-correction`, `/business-name-numerology`, `/mobile-number-numerology`,
`/house-number-numerology`, `/pitra-dosha`, `/mool-dosha`, `/grahan-dosha`,
`/nadi-dosha`, `/life-report`, `/child-kundli` — plus the North/South chart
toggle, period forecast, Manglik + 10-porutham in matching, and the free Kundli
PDF button added to existing pages. New endpoint `/api/life-report` (registered
in the worker — see §6 bug).

## 4. Accuracy & honesty (Rules 7–8)

- **No fabricated numbers/citations.** Classical texts cited by name only;
  chapters omitted unless verified. Chaldean compound meanings disclosed as the
  Cheiro/Chaldean tradition.
- **Graded, not timid; honest, not certain.** Every new prediction surface
  grades strong/moderate/mild and attributes to the tradition ("Vedic astrology
  reads this as…"). A "mild" grade is a gentler/consolidating phase, never "bad".
- **Guardrails intact.** No specific dates for marriage/illness/death (asserted
  by a unit test on the period engine and the life-areas engine). Marriage stays
  favourable-windows-only. **Children's health:** the Child Kundli and the adult
  Health section are "areas to care for" wellbeing guidance only — never "your
  child will be ill", never anything that could sway a medical decision; both
  point to the paediatrician/doctor (asserted by unit tests).
- **Money (Rule 10):** no existing price, paywall or entitlement changed; the
  six new paid products ship OFF with no invented prices.

## 5. Test results per browser (Rule 4)

- **Client-side numerology suite** (name correction, business, mobile, house) —
  real input entered, real result rendered: **8/8 passing on Chromium (desktop)
  and WebKit (iPhone 13)** via `vite preview` (`tests/p2-numerology.spec.ts`).
- **Kundli page on the live preview worker** (real, unmocked `/api/kundali`),
  reference chart 1978-05-13 19:30 Jammu, via carry-forward params:
  **South-Indian chart toggle, period forecast (monthly tab) and the free PDF
  button all render — 2/2 passing on Chromium + WebKit**
  (`tests/p2-vedic-preview.spec.ts`).
- **Real unmocked API verified by direct calls on the preview** (reference
  inputs): `/api/kundali` (planets+signIndex, nakshatra, dashaTimeline, doshas);
  `/api/kundali-match` (porutham **7/10 Average**, manglik **clear**);
  `/api/career-report` (ranked fields — Government/Leadership/Medicine [strong]
  for the Simha 10th-house / Sun-lord reference chart); `/api/life-report` (all
  four areas graded; health wellbeing-framed, mentions a doctor, no dates).
- **axe** on all 10 new pages × Chromium-desktop + Pixel-5: **0 serious/critical**.
- **404 check** (extended with the 10 new routes) on the preview: **62 checks,
  0 failures** — new routes → 200, invalid → 404, dynamic → 200.
- **Perf-budget:** **PASS** — every sampled layout within budget (sample LCP
  ~130–140 ms, CLS 0, TBT 0).
- **Tooling limitations (not product failures, alternative evidence given):**
  (a) **Android Chrome** is not available in this headless environment; Chromium
  desktop (same Blink engine) + WebKit (iPhone) are used, and the API data is
  verified unmocked. (b) The **matching page's** porutham/Manglik UI depends on
  the OpenStreetMap Nominatim city geocode (rate-limited, flaky headless), so it
  is verified at the real `/api/kundali-match` layer rather than by a form click-
  through.

## 6. Bug log (Rule 5)

- **P2-BUG-1** — `/api/life-report` returned 404 on the preview (new endpoint
  created but not registered in the worker route map). **Fixed** — registered in
  `functions/_worker.ts`; re-uploaded the preview and re-verified (4 graded
  areas, health framing correct). See `docs/growth-bugs.md`. No other open
  product-failure bugs from P2.

## 7. Deliberately scoped-down / deferred (Rule 6)

- **Varshphal / annual (Tajika) chart** — P2 item 1 lists this as *optional*
  ("add a Varshphal/annual chart **if it can be computed and validated**"). It is
  **deferred**, not shipped: a Tajika annual-chart engine (year-lord, Muntha,
  Sahams) is a separate, independently-validatable build, and the required
  yearly/quarterly/monthly **period structure is already delivered** by the
  Dasha-plus-transit `periodForecast`. Building it to the accuracy bar (Rule 8)
  is a worthwhile future item; shipping it unvalidated would breach honesty.
  Recommended for a later run or FINAL if desired.
- **"Rewrite" of the already-compliant narrative surfaces** (Sade Sati, Muhurat,
  What's Ahead) — these were already graded/calm/attributed/guardrailed from
  prior parts; P2 added graded surfaces around them rather than rewording
  compliant copy, to avoid regression risk.

## 8. Build time & preview (Rules 13, 2)

- `npm run build:staging`: **1000 s (~16.7 min)**, well within the build limit;
  prerender 4028/4028 ok, 0 failed, homepage prerendered (not skipped).
- Preview: `wrangler versions upload --env staging` (dry-run inspected first;
  worker confirmed `bornclock-staging`, env `BORNCLOCK_ENV=staging`). **Worker
  Version ID `a437f2c6-7124-47b0-ba80-9ffc31a660e7`**, Preview URL
  `https://a437f2c6-bornclock-staging.usdvisionai.workers.dev`. This is a
  **preview version only — not promoted to live traffic** (that would need
  `wrangler versions deploy`, which was NOT run).

## 9. Needs the person

- **Prices** for the six new paid products (all shipped OFF behind
  `src/config/paidProducts.ts`; no price invented) — the owner sets them.
- **Android Chrome** live real-use pass (device/BrowserStack not available to
  this unattended run) — if wanted, run the same specs against the preview URL on
  a real Android device.
- Carried over from P1 (unchanged): a **licensed celebrity bio/DOB dataset**
  (F-CELEB, P4); regional-language scope (P4-LANG).
- Nothing in P2 required a schema change, an email send, or a new secret.

---

*All P2 work is on `growth` (pushed). RC3 on staging is untouched; `develop`,
`main` and production are untouched; no Cloudflare token was added to GitHub.*
