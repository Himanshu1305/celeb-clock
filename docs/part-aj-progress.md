# Part AJ — Four-Page Redesign — Progress Log

Session start. Branch: `part-aj-four-page-redesign`. Operating unattended per owner instruction; stop at preview.

## Step 0 — base verification ✅ (CHECKPOINT)
- **Finding:** `develop` HEAD only contains Parts AE–AG. Parts AH (homepage redesign)
  and AI (content-depth / glossary / Rashi Ratna) are NOT on `develop` — they live on
  `part-ai-content-depth-fix`, which is the branch that was checked out at session start.
- Verified `develop` IS an ancestor of `part-ai-content-depth-fix` (current = develop + AH + AI).
- Verified Part AI features present on current HEAD: `VEDIC_TERMS`/`termDefinitions.ts`,
  `TermTip.tsx` (glossary/tooltip mechanism), `rashiRatnaData.ts` + Rashi Ratna ↔ Gemstones
  cross-reference.
- **Decision:** The doc says "branch off develop HEAD" AND "base must contain AE–AI". Those
  conflict given the real repo state. Resolved in favour of the stronger, repeated requirement
  (do not lose AH/AI functionality) → branched `part-aj-four-page-redesign` off the current
  HEAD (`part-ai-content-depth-fix`), NOT off `develop`. Documented in flags doc for morning review.
- Reference files confirmed present: docs/design-reference/{vedic,birthday,mystic,science}-final.html.
- Route map confirmed: /vedic-astrology→VedicAstrologyLanding, /celebrity-birthday→BirthdayCelebrityLanding,
  /mystic-corner→MysticCornerLanding, /life-expectancy→LifeExpectancy.

(Next checkpoints appended below as reached.)

## Part 1 — Vedic Astrology (/vedic-astrology) ✅ (CHECKPOINT: build complete + tested)
- Rebuilt to Editorial reference. Commit c315541.
- Shared scoped design system `src/styles/part-aj.css` created (generator `scripts/build-paj-css.mjs`); `.paj` scope verified non-leaking; per-category accents set (vedic gold, birthday coral, mystic violet, science teal/blue).
- Carried forward & verified working: real Kundli entry (BirthDetailsForm → /kundali autoGenerate), all real internal links (kundali, kundali-match, astrologer, sade-sati, muhurat, career-report, gemstones, rashi-ratna, sun-vs-moon-sign, moon-sign, nakshatra article), cross-category links (celebrity-birthday, mystic-corner, life-expectancy), honesty framing, FAQ, priced report flow.
- Added: Part AI glossary (TermTip) on ayanamsa/lagna/nakshatra/dasha/mahadasha/rashi/yoga; yoga GradeLegend; WhatsApp share (reused WhatsAppShareButton) at the real-example moment.
- Real example: live /api/vedic-reading re-compute of the reference chart (14 Mar 1990) with verified Swiss-Ephemeris static fallback (table of 9 real placements + North-Indian chart). Honest either way.
- Tests: `vitest run` → 152 files / 1860 tests PASS. `tsc --noEmit` → 0 errors. `vite build` OK.
- Visual: desktop (1280) + mobile (390) screenshots verified — editorial layout, edge-to-edge, stacks cleanly, no overflow, no JS errors. WhatsApp btn + 4 glossary tooltips + 9 table rows render.
- NOTE/interpretation (for report): current live /vedic-astrology is a LANDING page; Kaal Sarp / free remedies / Pratyantardasha are NOT sections on it — they live on deeper linked pages (/kundali, /sade-sati). The Editorial reference is likewise a landing structure. Carried these forward as preserved linked features, not as new landing sections (neither current page nor reference has them as sections). Documented in flags.

## Part 2 — Birthday & Celebrity (/celebrity-birthday) ✅ (CHECKPOINT: build complete + tested)
- Rebuilt to Field Guide reference. Commit 779374b. Architecture decision made + flagged (FLAG 2).
- Free interactive results INLINE: twins grid (getRankedBirthdayCelebrities), name search (celebrity_sitelinks), today's birthdays, computed snapshot (zodiac/life-path/weekday). /birthday-report kept as paid flow (linked only, not modified).
- Real images via fetchCelebrityImage (Wikipedia, cached) with initials fallback; real source links; WhatsApp share at twins moment.
- Tests: tsc 0 errors; internalLinking + routesWired green (16/16); vite build OK.
- Visual: desktop + mobile verified — 15 real person cards, 15 real Wikipedia photos actually render in preview; snapshot computed correctly for today (Libra / Life path 4 / Friday); no JS errors; edge-to-edge, stacks on mobile.

## Part 3 — Mystic Corner (/mystic-corner) ✅ (CHECKPOINT: build complete + tested)
- Rebuilt to Atlas reference. Commit e2b709b.
- Three tools COMPUTED ON-PAGE from entered DOB: Numerology life-path (with workings shown, e.g. 1+9+9+0+0+3+1+4=27→9 + LIFE_PATH_TRAITS title/traits), Western zodiac (calculateWesternZodiac + browsable 12-sign selector), Chinese zodiac (calculateChineseZodiac animal+element). Default sample 14 Mar 1990 recalculates live as the date changes.
- Honest "different systems, not a generic horoscope" framing preserved (4 honesty items incl. "different systems stay distinct"); cross-links to /vedic-astrology + /celebrity-birthday; carry-forward explore links (/numerology, /name-numerology, /zodiac, /chinese-zodiac, /tarot-card-by-birthday, /compatibility); WhatsApp share at result moment.
- Verified: lifePath=9, calc string exactly matches reference, Western=Pisces, Chinese=Horse/Metal for 14 Mar 1990. No JS errors.
- Also fixed a mobile horizontal-overflow bug affecting ALL THREE redesigned pages (duplicate brand + non-collapsing AuthNav in a no-wrap navy bar). Header now wraps; scrollWidth==390 confirmed on vedic/birthday/mystic at mobile width.
- Tests: `vitest run` 1860 PASS; tsc 0; vite build OK; desktop+mobile screenshots verified.

## Part 4 — Science & Longevity (/life-expectancy) ◻ PARTIAL (CHECKPOINT) — H1/SEO done, Workbench deferred
- H1/SEO decision DONE + committed (416f11f): H1 → "How long could you live — and why."; exact head term kept as H2 + title tag unchanged; calculator + honesty intact; tsc 0; build OK; no JS errors.
- Full Workbench VISUAL rebuild DEFERRED via resource safety net (FLAG 3) — 1,209-line interactive app w/ paywall + premium + phases + highest traffic → too risky to rewrite unattended before review. Honesty-forward content + disclaimers + sources already present (Part AG) and carried forward.
- Carry-forward confirmed intact: calculateLongevity/score/recalcWithOverrides untouched; all 5 disclaimer blocks; country-page grid; cross-links to /vedic-astrology + /celebrity-birthday; citations/sources.
