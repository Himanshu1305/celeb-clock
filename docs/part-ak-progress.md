# Part AK — Deep Pages & Fixes — Progress Log

Continues on `part-aj-four-page-redesign` (no new branch, no develop). No merge, no deploy. Flags 1/2/3 untouched.

## Part 0 — Audit ✅ (CHECKPOINT)
- Wrote docs/part-ak-audit.md. Result: EVERY deeper tool/report page is OLD design (none use `paj`).
- Tier 2 priority derived: kundali-match → sade-sati → muhurat → gemstones/rashi-ratna → career-report → sun-vs-moon/moon-sign → shared tools.

## Tier 1.1 — Background color / variant-layout fix ✅ (CHECKPOINT)
- ROOT CAUSE found (bigger than a color token): the CSS generator scoped the design-variant
  classes as descendants (`.paj .editorial …`) but editorial/atlas/field-guide/workbench live on
  the SAME element as `.paj` (`class="paj editorial"`). So EVERY variant layout rule silently never
  matched — the editorial 2-col hero collapsed to a stacked full-width WHITE chart panel (the
  "reads white" symptom), and atlas/field-guide heroes likewise fell back.
- Fix: `scripts/build-paj-css.mjs` now attaches the four variant classes to `.paj` with no space
  (`.paj.editorial …`). Regenerated `src/styles/part-aj.css`.
- Verified: `--bg` is #FAF7F0 ivory (was already correct as a token); after the fix the editorial
  (Vedic), field-guide (Birthday) and atlas (Mystic) hero layouts render correctly and the ivory
  canvas now dominates (white is only the surface cards), matching the references. Desktop screenshots confirmed.

## Tier 1.2/1.3/1.4 ✅ (CHECKPOINT) — commit 527d9e2
- 1.2 DOB carry-forward: ?dob&time&place&lat&lon&tz[&name] on /kundali → auto-generate, zero re-entry. Precedence: fresh URL > router state > saved full profile. Saved full profile auto-generates (skip asking). Unknown/partial → graceful form prefill. Bare /kundali form still works.
- 1.3 inline teaser on /vedic-astrology: real Lagna/Rashi/Nakshatra + Dasha computed inline on submit + "See your full chart →" carry-forward link.
- 1.4 /kundali redesigned to paj editorial; ALL functionality carried forward (chart, planet table, interpretation, VedicReading incl. Pratyantardasha + yoga grade, reading history, saved-profile banners, chart-event notices, WhatsApp share, CTAs); TermTip glossary added; testids preserved.
- Tests: 1860 pass; tsc 0; build OK. Local verify: prefill+auto-run+precedence banner; bare form; no mobile overflow. (Full engine flow to be verified on the real preview at session end.)

## Tier 2 — in audited priority order
- ✅ /kundali-match (Guna Milan) → paj editorial. All logic/testids preserved (two-person forms + geocoding, saved-profile reuse, full 36-pt result, doshas, timing, methodology, print). 1860 tests pass. Commit pending list below.

- ✅ /sade-sati → paj (commit). /muhurat → paj (commit). /gemstones → paj (commit). /rashi-ratna → paj (commit). All: logic/testids preserved, 1860 tests, no mobile overflow.
- Tier 2 completed this session (in priority order): kundali-match, sade-sati, muhurat, gemstones, rashi-ratna (5 pages). Remaining old-design deep pages (career-report, sun-vs-moon-sign, moon-sign, astrologer, and the shared/Birthday/Mystic/Science deep pages) NOT yet converted — time-boxed; next session.

## Preview + report ✅ (SESSION COMPLETE)
- Final full build OK (3630 routes prerendered, sitemap 3630). `wrangler versions upload` → prod-safe preview (NO deploy). Version 0e6dc74c-e617-40ab-b7d8-d08448eb4cb3.
- Preview URL: https://0e6dc74c-bornclock.usdvisionai.workers.dev
- Verified on preview: carry-forward → real 9-planet chart (zero re-entry) + "just entered" banner; .paj bg ivory rgb(250,247,240) + editorial hero 2-col; all 6 redesigned deep pages 200 + paj + no mobile overflow + no JS errors.
- Report: docs/part-ak-report.md. STOPPED — no merge, no deploy. FLAG 1/2/3 untouched.
