# BornClock — Growth Improvements Backlog (produced by P0)

Prioritised, actionable backlog that later phases **must work through**. Each
item has an **ID**, an **assigned phase**, the **specific change**, a **why**,
and an **acceptance check**. P1–P5 runs must tick items off here (with evidence)
when done; `docs/growth-<phase>-report.md` reports which items assigned to that
phase are done / omitted-with-reason / blocked-on-the-person.

**Fix at the source.** Where a problem affects many generated pages (celebrity
profiles, born-on dates, rashifal, country pages), the item is a fix to the
**shared template or data** — never hundreds of page-by-page edits. The source
file is named in each item.

Ordered **by impact** (traffic / trust / revenue) within each group. Date:
2026-10-09. Evidence: see `docs/growth-p0-report.md`.

Legend: **[ ]** open · **[x]** done (phase run adds commit/evidence) ·
**[~]** partial · **[P]** blocked on the person.

---

## GROUP A — Fixes to existing BornClock pages (default phase: P1)

These are thin pages, unexplained terms, and "so what?" / competitor-beaten
sections found in the `growth` codebase + P0 research.

### [x] F-RASHIFAL — Replace static `/hi/rashifal` with computed rashifal  · **P1**
<!-- DONE f9dfaaa: new src/lib/vedic/rashifal.ts gochar engine; /hi/rashifal/:rashi now computed+dated (no fixed "today" string); static rashifalData.ts deleted. Content differs by date AND sign. Task16 8/8 + rashifal.test.ts 7/7 green. -->

- **Problem:** `/hi/rashifal` (+/:rashi) is static and undated — it reads a
  hardcoded `src/data/rashifalData.ts` yet claims "आज का राशिफल" (today's). Every
  Vedic competitor ships dated, computed rashifal free.
- **Fix (source):** build the computed rashifal engine (P1 item 1) and point
  `src/pages/hi/RashifalPage.tsx` at it; retire/repurpose `rashifalData.ts`.
- **Acceptance:** `/hi/rashifal/<rashi>/today` shows content that genuinely
  differs by date and sign, computed from real planetary positions; no hardcoded
  "today" string that never changes; real-use verified on 3 browsers.

### [ ] F-CELEB — Populate celebrity bios / full DOBs (fix at data source)  · **P4** (data), partial relief possible in P1
- **Problem:** ~3,107 celebrities but only ~1,058 bios (`src/data/celebrity-bios.json`);
  ~2,000 `/celebrity/:slug` pages render with no bio; year-only DOBs lose Western
  zodiac, Life Path and birthday-twins (`CelebrityPage.tsx` ~85, 104–110). This
  also thins `/born-on/:month/:day` on sparse dates.
- **Fix (source):** populate `celebrity-bios.json` and full DOBs in
  `src/data/celebrities.json` from a **licensed** source; improve the bio-less
  fallback so a profile still passes the "so what?" test.
- **Acceptance:** a random sample of 20 `/celebrity/:slug` pages each show a real
  bio + the full computed block; bio coverage materially up; no "accomplished
  Indian personality" canned fallback on celebrities that have data.
- **Needs the person:** confirm a licensed bio/DOB data source.

### [x] F-TERMS — Wrap the last unexplained terms in `TermTip`  · **P1**
<!-- DONE 700dda3: added VEDIC_TERMS entries (virupas, paksha, varna, vashya, tara, yoni, grahaMaitri, gana, bhakoot, nadi) and wrapped at VedicReading.tsx:76/79 (Virupas), KundaliMatchPage.tsx 8 koota labels + Ashtakoota header, CareerReportPage.tsx:129 (Dasamsa D10), MuhuratPage.tsx:157 (Paksha). termDefinitions.test.ts 5/5 green; tsc clean for these files. -->

- **Problem:** a few terms render unwrapped: **Virupas** (`VedicReading.tsx:76,79`),
  the **8 Koota names + Ashtakoota** (`KundaliMatchPage.tsx:259–272`), **Dasamsa
  (D10)** heading (`CareerReportPage.tsx:129`), D9/D10/D60 fallback prose
  (`VedicReading.tsx:206`), **Paksha** (`MuhuratPage.tsx:157`).
- **Fix (source):** add/confirm `VEDIC_TERMS` entries and wrap at these sites
  (reuse the existing `TermTip` mechanism — do not build a new one).
- **Acceptance:** each listed term is wrapped or explained inline on first use;
  no regression to existing tooltips; axe clean.

### [x] F-CALC-ACTION — Make the life-expectancy & bio-age calculators actionable  · **P1** (see NS-CALC)
<!-- DONE (P1 longevity): the calculator result (EnhancedLifeExpectancyReport) already shows a per-factor contribution chart + top-3 potential-gain actions (which answers add/subtract years). P1 added the indexable /life-expectancy/factors pages: per-factor year-delta + mechanism + evidence + 3–5 actions. -->

- **Problem:** Living-to-100 beats BornClock by returning per-factor "years
  added/lost" + a physician to-do list; BornClock returns a result but less
  actionable per-input delta.
- **Fix (source):** in the life-expectancy / bio-age result builders, surface
  per-input year-deltas and a short, honest "what to do" list (wellbeing framing,
  cite the evidence baseline — see NS-CRED).
- **Acceptance:** completing the quiz shows which answers added/subtracted years
  and 3–5 evidence-based actions; no fabricated numbers; honest framing.

### [x] F-THIN-COUNTRY — Deepen the shared country life-expectancy template  · **P1**
<!-- DONE (P1 longevity): LifeExpectancyCountryTemplate already carries per-country avg/men/women, official source, world rank, regional splits and FAQs; P1 added a per-country modelled P(reach 100) stat and an explicit official-life-table baseline citation (source + WHO GHO). -->

- **Problem:** country LE pages share `LifeExpectancyCountryTemplate.tsx`; risk
  of near-duplicate/thin at scale.
- **Fix (source):** add genuinely per-country substance (official source cited,
  gender/urban-rural splits, "so what?") to the template's per-country data, not
  page edits.
- **Acceptance:** 3 sampled country pages each carry distinct, sourced data that
  passes the "so what?" test; no templated-duplicate feel.

---

## GROUP B — New gaps found in competitors (assigned to the best phase)

### P1 — Traffic engines (refinements to planned items + new)

### [x] P1-RASHIFAL-WEEKLY — Include **weekly** rashifal in the period set  · **P1**
<!-- DONE f9dfaaa: /rashifal/:rashi/week (plus today/month/year) evergreen URLs, computed per period at request time. -->

- **Why:** Astrotalk ships today+weekly+monthly+yearly; the plan lists
  daily/weekly/monthly/yearly but ensure **weekly** is actually built.
- **Acceptance:** `/rashifal/<sign>/weekly` (or equivalent) exists, computed per
  week, evergreen URL cached at request time.

### [x] P1-PANCHANG-CHOGHADIYA — Wire Choghadiya + Rahu Kaal into the daily Panchang page  · **P1**
<!-- DONE b06e067: /panchang[/:city] shows tithi/nakshatra/yoga/karana/sunrise/sunset + Rahu Kaal, Gulika, Yamaganda and day/night Choghadiya, computed from real sunrise/sunset. -->

- **Why:** Drik/Astrotalk bundle Choghadiya + Rahu Kaal into the free Panchang;
  BornClock has a Muhurat tool but should surface these on the Panchang page.
- **Acceptance:** the daily-Panchang-for-city page shows tithi/nakshatra/yoga/
  karana/sunrise/sunset **plus** Rahu Kaal and Choghadiya for that city/date,
  validated against an established Panchang source.

### [x] P1-ATTITUDE-NUM — Attitude number (differentiator) + Birthday number (catch-up)  · **P1**
<!-- DONE 9620321: /attitude-number computes Birthday + Attitude numbers from DOB with plain-language meanings and the 'not science' caveat. -->

- **Why:** Birthday number is table-stakes (Numerology.com/Cafe); **Attitude**
  number is offered by none of the five Western competitors → differentiator.
- **Fix (source):** extend the numerology engine (`lib/` numerology) + add
  page(s); reuse digit-reduction.
- **Acceptance:** both numbers computed from DOB with plain-language meaning and
  worked example; "so what?" passes; honest "not science" caveat retained.

### [x] P1-CHALDEAN — Chaldean numerology as whitespace (not catch-up)  · **P1**
<!-- DONE 9620321: /chaldean-numerology computes the Chaldean name number with a Pythagorean-vs-Chaldean explainer and the full Chaldean letter table. -->

- **Why:** zero Western competitors offer it; it targets the Indian/Chaldean
  audience. (Larger name-correction/business/mobile/house tooling stays P2.)
- **Acceptance:** a Chaldean calculator + Pythagorean-vs-Chaldean explainer,
  computed, distinct from the existing Pythagorean pages.

### [x] P1-BLUEZONES-9 — Blue-Zones Power-9 per-factor pages (top content gap)  · **P1**
<!-- DONE 653151f: /blue-zones hub + 9 per-factor pages (move-naturally, purpose, downshift, 80-percent-rule, plant-slant, wine-at-5, belong, loved-ones-first, right-tribe), each distinct with cited sources. -->

- **Why:** Blue Zones is the category content leader; the Power 9 decomposes into
  9 indexable long-tail pages with mechanism + quantified, **cited** claims.
- **Acceptance:** 9 distinct pages (move naturally, purpose/ikigai, downshift,
  80% rule, plant slant, wine@5, belong, loved-ones-first, right-tribe), each
  Rule-6 distinct, citing bluezones.com / Harvard Health (no invented figures).

### [x] P1-LE-BY-FACTOR — Life-expectancy-by-condition & bio-age-by-habit indexable pages  · **P1**
<!-- DONE (P1 longevity): /life-expectancy/factors hub + 9 indexable factor pages (smoking, exercise, diet, bmi, sleep, alcohol, hypertension, diabetes, social-connection), each with the cited year-delta, mechanism, evidence and actions. Rule-6 distinct. -->

- **Why:** no strong incumbent (SSA/ONS disclaim lifestyle; Living-to-100 hides
  it behind a quiz). Open SEO territory; the calculator already computes deltas.
- **Acceptance:** a set of indexable explainer pages (e.g. smoker vs non-smoker,
  BMI band, exercise, sleep), each with a real computed delta and honest framing;
  Rule-6 distinct, not template-with-words-swapped.

### P2 — Predictions & paid depth (refinements + new)

### [x] GP2-SOUTH — Raise South-Indian chart style earlier in P2  · **P2**
<!-- DONE 3509402: KundaliChart gained a style='north'|'south' prop (South = fixed-sign 4x4 grid, Lagna marked); North/South toggle on /kundali. Real-use verified on the live preview worker (Chromium desktop + WebKit iPhone) with the Jammu reference chart — south chart renders on toggle. -->

- **Why:** ProKerala/Astrotalk/Clickastro all offer South-Indian free; BornClock
  has none — a visible parity gap for South-Indian traffic.
- **Acceptance:** a North/South toggle on the Kundli chart; South-Indian layout
  renders correctly for the reference charts on 3 browsers.

### [x] GP2-10PORUTHAM — Add the 10-porutham South-Indian matching option  · **P2**
<!-- DONE a06c64e: porutham.ts (Dina/Gana/Mahendra/Stree-Deergha/Yoni/Rasi/Rasyadhipathi/Vasya/Rajju/Vedha); /api/kundali-match returns porutham + a Manglik mutual-cancellation check; KundaliMatchPage renders a collapsible 10-porutham view + Manglik block. Live preview API verified: 7/10 Average, manglik 'clear' for the reference pair. 5 unit tests. -->

- **Why:** ProKerala offers the Tamil/Kerala 10-porutham system alongside Guna
  Milan; relevant for South-Indian matrimonial traffic.
- **Acceptance:** matching offers a 10-porutham view (dinam, gana, yoni, rajju,
  etc.) alongside the 36-guna Ashtakoota; computed, explained (Rule 6/7).

### [x] GP2-PERIOD-PREDICT — Period-structure the prediction surfaces  · **P2**
<!-- DONE 5341056: periodForecast.ts re-presents the Vimshottari Dasha as yearly(3)/quarterly(4)/monthly(12) views, each graded strong/moderate/mild from the governing lord + naming the life area; PeriodForecast component (tabs) on /kundali. Live-preview real-use verified (Chromium+WebKit): monthly tab renders. Transit dimension cross-linked to /transit + /sade-sati. Guardrails: no dates for marriage/illness/death. 4 unit tests. -->

- **Why:** yearly/monthly predictions are universal; BornClock's "What's Ahead"
  is not period-structured.
- **Acceptance:** yearly / quarterly / monthly prediction views exist (Dasha +
  transits), Rule 7 (graded strong/moderate/mild, reasoned), guardrails intact.

### [x] GP2-CAREER-RANKED — Ranked best-suited career fields  · **P2**
<!-- DONE 96f69ee: careerFields.ts ranks fields from the 3 strongest career significators (Shadbala + 10th house/D10/Yoga involvement) + an 'approach with care' list; surfaced on /career-report. Live-preview API verified: top fields Government/Leadership/Medicine [strong] for the reference chart (10th lord Sun in Simha). -->

- **Why:** Clickastro surfaces career fields free; BornClock's career report is
  narrative, not a ranked field list.
- **Acceptance:** a ranked list of fields with reasons (10th house/lord, D10,
  strongest planets), fields-to-approach-with-care, and growth periods.

### [x] GP2-LIFE-SECTIONS — Health / foreign-travel / wealth / education sections  · **P2**
<!-- DONE 96f69ee (+ worker fix for /api/life-report, see P2-BUG-1): lifeAreas.ts grades Wealth/Education/Foreign/Health from house-lord strength + benefic/malefic occupants (strong/moderate/mild). New /life-report page + /api/life-report. Health = wellbeing-only, points to doctor, no dates. Live-preview API verified: all 4 areas graded, health framing correct. -->

- **Why:** Clickastro markets these free; competitor-common prediction surfaces.
- **Acceptance:** each section present with graded indications (Rule 7), health
  in wellbeing framing (never diagnosis), no dates for illness.

### [x] GP2-CHILD-KUNDLI — Child (Bal) Kundli (build only if cheap)  · **P2** (tail)
<!-- DONE b769c53: built cheaply by composing the existing /api/kundali response (childKundli.ts) — temperament, learning, talents, favourable periods, Mool note, name sounds (links to /baby-names), support. New /child-kundli page. Health = wellbeing-only, points to paediatrician, no illness/dates (Rule 7). 4 unit tests incl. guardrail. -->

- **Why:** present at AstroSage/Clickastro/Astrotalk but mostly **paid** and
  low-traffic → de-prioritised; build if it reuses the engine cheaply.
- **Acceptance (if built):** temperament/learning/talents/care-areas/favourable
  periods/Nakshatra name letters, Rule 7 children's-health guardrail, points to
  the paediatrician.

### [x] GP2-DOSHAS — Standalone Pitra / Nadi / Mool / Grahan dosha explainers  · **P2** (medium)
<!-- DONE c89aa5b: moreDoshas.ts computes Pitra/Mool/Grahan + standalone Nadi from the /api/kundali response (client-side, no cache-versioning risk), graded strong/moderate/mild; one DoshaCheckPage → /pitra-dosha, /mool-dosha, /grahan-dosha, /nadi-dosha. Calm tone (Rule 7); Mool page states no medical meaning + see paediatrician; cited as tradition (Rule 8). 9 unit tests. -->

- **Why:** lightly covered by competitors (Astrotalk flags Pitra); useful SEO.
- **Acceptance:** calm-tone explainers, computed where the engine supports it,
  Rule 7/8.

### P3 — Retention (new)

### [P] NB3-SONG — "#1 song on your birthday" (+ optional #1 movie)  · **P3** (+ birthday report)
<!-- PLUMBING DONE 0914f61: src/data/birthdaySongs.ts — honest date-range lookup that
only reports a song when a verified dataset entry covers the date; ships EMPTY and never
fabricates a chart position (Rule 8). BirthdayFactsCard shows the #1-song line
automatically when data is present. BLOCKED ON PERSON: a licensed/CC-compatible
#1-song-by-date dataset (Billboard Hot 100 / Official UK Singles Chart) — a
licensing/business decision. Drop a verified dataset into NUMBER_ONE_RANGES and it lights
up everywhere. See "Needs the person" in docs/growth-p3-report.md. -->
- **Why:** OnThisDay shows US+UK #1 songs; high-virality, cheap; BornClock's
  birthday report lacks it.
- **Fix (source):** a licensed/evergreen chart dataset keyed by date, surfaced in
  the birthday report and the shareable card.
- **Acceptance:** entering a birthday shows the #1 song(s) for that date; sourced
  honestly; appears on the shareable card.

### [x] NB3-CARD-SHARE — Shareable birthday cards (green-field)  · **P3**
<!-- DONE 0914f61: BirthdayFactsCard (src/components/BirthdayFactsCard.tsx) — polished
branded card built from real facts (day of week, zodiac, generation, celebrity birthday
twin, + #1-song line when NB3-SONG data present). html2canvas → PNG with Web Share API +
download fallback (Chromium/WebKit/Android). Wired into /wish with a best-effort
celebrity twin. Verified via unit tests + local build; real-use noted in P3 report. -->
- **Why:** no competitor has a strong equivalent — differentiator; pairs with
  NB3-SONG and the birthday-facts bundle.
- **Acceptance:** a polished shareable card generated from birthday facts (day of
  week, zodiac, generation, #1 song, celebrity twins), image shareable on 3
  browsers.

### P4 — Reach (refinements + new)

### [ ] NB4-RANK — Celebrity popularity ranking per date & multi-axis profile ranking  · **P4**
- **Why:** Famous Birthdays' core hook (rank 1–N per date, "#1 born May 13",
  "#12 movie actors"); BornClock `/born-on` appears unranked.
- **Fix (source):** rank using the existing curated sitelinks/relevance signal in
  `src/data/celebrities.json`; apply in the `/born-on` + celebrity templates.
- **Acceptance:** `/born-on/:month/:day` lists celebrities in a sensible
  popularity order; profiles show at least a per-date rank; no fabricated metrics
  (use the real sitelinks/relevance signal and say what it is).

### [ ] NB-DEATHS — Famous **deaths** on a date (not just births)  · **P4**
- **Why:** OnThisDay + timeanddate list deaths; BornClock is births-only.
- **Acceptance:** the on-this-day / born-on surface includes notable deaths for
  the date, from the same licensed source, attributed.

### [ ] P4-BIRTHDAY-EVENTS — "What happened on your birthday" via Wikimedia (correct framing)  · **P4**
- **Why:** planned; confirmed gap. **Correction:** OnThisDay does NOT use
  Wikimedia — CC BY-SA Wikimedia is a differentiator, not a competitor match.
- **Acceptance:** an events feed for the user's birthday with correct CC BY-SA
  attribution; evergreen URL, content at request time.

### [ ] P4-CELEB-BIRTHTIME — Celebrity Kundlis with a birth-time reliability note  · **P4**
- **Why:** no competitor shows celebrity birth **time** → white-space; needed for
  an honest celebrity-Kundli angle.
- **Acceptance:** per-celebrity reliability label (e.g. "birth time: reliable /
  approximate / unknown") driving whether time-dependent sections render.

### [ ] P4-WESTERN-CHART — Full Western natal chart (houses + rising + aspects)  · **P4**
- **Why:** Cafe Astrology / Astrology.com give this free with interpretations —
  BornClock's biggest Western gap.
- **Acceptance:** Sun/Moon/Rising + houses + major aspects computed with
  plain-language interpretations; real-use verified.

### [ ] P4-TAROT-INTERACTIVE — Interactive tarot (daily / yes-no / love)  · **P4**
- **Why:** BestDailyTarot/Evatarot ship free interactive spreads — now
  table-stakes. Ship the bundle together, not piecemeal.
- **Acceptance:** daily card + yes/no + love spread, user draws cards, position-
  and question-aware interpretations.

### [ ] P4-CZ-YEARLY — Chinese zodiac yearly forecast  · **P4**
- **Why:** ChinaHighlights ~100–150 words/sign/year + compatibility %.
- **Acceptance:** per-animal yearly forecast (career/finance/love/health) for the
  current + next year, evergreen URL, content at request time.

### [ ] P4-LANG — Pull some Hindi/regional language parity forward  · **P4** (business decision)
- **Why:** every Vedic competitor ships Hindi + 3+ regional languages free; an
  English-only P1 is a structural disadvantage.
- **Acceptance:** key P1 pages available in Hindi; machine-assisted translation
  flagged for the person's human review before launch.
- **Needs the person:** scope of regional languages (e.g. Telugu) and translation
  review.

### P5 — Infrastructure & measurement (new/refinements)

### [~] NS-CALC — Calculator "years-delta + to-do" output  · **P1/P5** (content P1, infra P5)
<!-- P1 content side DONE via F-CALC-ACTION + /life-expectancy/factors. Funnel/conversion tracking is P5 (deferred to that phase). -->

- **Why:** Living-to-100's actionable output beats BornClock. (Content side =
  F-CALC-ACTION in P1; any tracking of the funnel = P5 conversion tracking.)
- **Acceptance:** see F-CALC-ACTION; funnel events (consent-respecting) land in
  the existing analytics.

### [x] NS-P100 — "Probability of reaching 100" output  · **P1**
<!-- DONE (P1 longevity): survival.ts computes an honest P(reach 100) from the forecast (normal approx, SD~10 from national life tables), shown on the calculator result, the /life-expectancy/factors pages and every country page, clearly labelled an estimate. -->

- **Why:** ONS surfaces P(reach 100) alongside the point estimate — cheap,
  credible, shareable.
- **Acceptance:** the life-expectancy calculator + country pages show an honest
  P(reach 100) figure derived from the model/actuarial baseline (no fabrication).

### [x] NS-CRED — Cite SSA/ONS/WHO actuarial baseline on longevity surfaces  · **P1**
<!-- DONE (P1 longevity): LONGEVITY_BASELINE_NOTE cites US SSA period life tables, UK ONS and WHO GHO as the baseline the lifestyle adjustments modify; shown on the calculator result, factor pages and country template. -->

- **Why:** government calculators are the trust anchors; citing the baseline the
  lifestyle adjustments modify extends the RC3 "how we test" honesty push.
- **Acceptance:** longevity pages state the official-life-table baseline + the
  nature of the adjustments, with real citations.

### [ ] NS-LEADERBOARD — "Where do you rank" comparison framing (optional)  · **P5**
- **Why:** Rejuvenation Olympics' leaderboard is a viral hook; BornClock's free
  bio-age quiz is already more generous — borrow the framing (extend country
  comparison to bio-age-vs-peers). Optional; no fake/seeded data.
- **Acceptance:** an honest peer-comparison view from real, consented aggregates
  only (or clearly-labelled reference cohorts) — never invented leaderboards.

---

## NEEDS THE PERSON (too large or a business decision)
- **Baby-names-by-Nakshatra dataset** (P1-6): licensed or original source.
- **Celebrity bio/DOB data source** (F-CELEB): licensed source for ~2,000 bios.
- **Regional-language scope + translation review** (P4-LANG).
- **Prices** for all new paid products (built behind flags, OFF).
- **Real expert reviewer** (P3) and **WhatsApp Business account** (P3) — never
  invented.
- **Schema changes** (any new tables) → NOTES file for the person.

---

## Acceptance-tracking note for phase runs
When a phase run completes an item here, change its `[ ]` to `[x]`, append the
commit hash + one line of real-use evidence (which browser(s), which reference
chart), and mirror it in that phase's report. Items deliberately omitted get
`[~]`/`[P]` with the documented reason (Rules 6–9) so FINAL's master checklist
can mark every item done / omitted-with-reason / needs-the-person.
