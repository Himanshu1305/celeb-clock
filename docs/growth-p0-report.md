# P0 — Competitor Comparison & Gap Verification

**P0 is a read-only research phase.** No application code was changed; the test
suite and build are unaffected (baseline: 76 Playwright e2e specs on `growth`,
unchanged — RC3's full automated baseline was 163 test files / 1940 tests, also
untouched). Deliverables: this report and `docs/growth-improvements.md`.

- **Date of all competitor evidence:** 2026-10-09.
- **Method:** light, polite public browsing only (a few fetches per competitor,
  no logins, no purchases, no aggressive scraping). Where a feature sits behind
  a paywall or a form that could not be submitted via fetch, it is described
  from public pages / marketing / visible samples and **explicitly flagged** as
  "from public info", per the honesty rule. No search-volume or ranking numbers
  are invented. Scores (1–5) are evidence-backed editorial judgements.
- **Reference inputs** (same on each competitor): Vedic/astro chart —
  1978-05-13, 19:30, Jammu, India; birthday/celebrity — born 1978-05-13 /
  date May 13; longevity — a ~48-year-old adult DOB 1978-05-13. Many competitor
  forms could not be submitted headlessly; those results are as-advertised from
  public pages, flagged per competitor.
- **BornClock under test:** RC3 on `https://bornclock-staging.usdvisionai.workers.dev`
  (homepage returned 200 during this run), cross-referenced against the `growth`
  codebase (source of truth for which sections a visitor receives free).

---

## 0. Executive summary

BornClock's **core Vedic tool depth is already competitive-to-leading** for
single-chart tools (Kundli, matching, Sade Sati, Muhurat, gemstones, Manglik,
Kaal Sarp, Dasha) — every one is fully computed, free, and now carries a
site-wide plain-language glossary (`TermTip`), which most competitors lack.
Where BornClock is clearly behind is **recurring / SEO "traffic-engine" content**
that every Vedic competitor ships free: daily/weekly/monthly/yearly **rashifal**,
**daily Panchang** for the user's city, a **festival/vrat calendar**, **27
Nakshatra pages**, **transit-by-year pages**, and **baby-names-by-Nakshatra** —
all confirmed as table-stakes and all already planned for **P1**. In Western
mystic, the biggest free-feature gap is a **full Western natal chart** (houses +
rising + aspects) and **interactive tarot** — both planned for **P4**. In
birthday/celebrity, competitors win on **celebrity popularity ranking**, **"#1
song on your birthday"**, **famous deaths on a date**, and a **"what happened on
your birthday" events feed** — partly planned (P3/P4), partly missing (ranking,
#1 song). In science/longevity, no competitor dominates the planned content
pages (Blue-Zones Power-9, by-condition, by-habit), but government calculators
(SSA/ONS) set a **credibility bar** BornClock should cite/match, and Living-to-100
beats BornClock's calculator on **actionable "years added/lost + to-do list"**
output.

**Net:** the existing P1–P5 gap list is largely **confirmed and correctly
phased**. P0 adds a short set of **new/sharpened items** (see
`docs/growth-improvements.md`): celebrity popularity ranking, #1-song-on-your-
birthday, famous-deaths, weekly rashifal, Choghadiya/Rahu-Kaal wired into the
Panchang, South-Indian chart raised in priority, calculator "years-delta +
to-do" output, "probability of reaching 100", and a few re-framings (Chaldean
numerology is whitespace not catch-up; child-Kundli is a paid/low-traffic tail;
Wikimedia attribution is a differentiator, not a match).

---

## 1. BornClock baseline self-scores (the "before" column for FINAL)

Same 1–5 criteria used for competitors, scored from the `growth` codebase
catalog (what a free visitor actually receives). FINAL will re-score after
P1–P5 to show before → after.

| Category | #sections | quality | depth | thin-content (5=none) | terms-explained | user-perspective | prediction-clarity | recurring/periodic content | notes |
|---|---|---|---|---|---|---|---|---|---|
| **Vedic (single-chart tools)** | 5 | 5 | 4 | 4 | **5** | 4 | 3 | **1** | Tool depth leading; glossary best-in-class; **no** rashifal/panchang/festival/nakshatra/transit pages. |
| **Mystic** | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 2 | Numerology/compatibility/zodiac data-rich; **no** full Western chart, interactive tarot, Chinese yearly forecast. |
| **Birthday & celebrity** | 4 | 4 | 3 | 3 | 4 | 4 | n/a | 3 | Celeb profiles computed but ~2,000 bio-less; no ranking, no #1-song, no deaths/events feed. |
| **Science & longevity** | 5 | 4 | 4 | 4 | 4 | 4 | n/a | n/a | Calculators + ~12 country pages + longevity articles; calculator output less actionable than Living-to-100; no P(reach 100). |

**Glossary correction (supersedes the 2026-09-26 content-feature audit and a
stale memory note):** a site-wide term-definition mechanism **now exists** —
`TermTip` (`src/components/vedic/TermTip.tsx`) backed by `VEDIC_TERMS`
(`src/lib/vedic/termDefinitions.ts`, 37 terms) — and is applied across the
Vedic tool pages. The earlier "no glossary mechanism exists" finding is no
longer true. **Engine-honesty correction:** no user-facing page claims "Swiss
Ephemeris" any more; `/vedic-astrology` and `/sun-vs-moon-sign` correctly cite
`astronomy-engine` with Lahiri sidereal (the only remaining "Swiss Ephemeris"
string is in the internal `admin/AccuracyDashboard.tsx`).

---

## 2. Vedic — AstroSage, ProKerala, Astrotalk, Drik Panchang, Clickastro

**Evidence note:** forms could not be submitted headlessly; section lists are
as-advertised from public landing pages, FAQs and visible structure (flagged),
not live chart submissions. All URLs viewed 2026-10-09.

| Competitor | #sect | quality | depth | thin(5=none) | terms-expl | user-persp | pred-clarity | yearly/monthly | child-kundli | career | health |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **AstroSage** | 5 | 4 | **5** | 4 | 3 | 3 | 3 | 5 | 4 (paid) | 4 (paid) | 4 (paid) |
| **ProKerala** | 4 | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 3 |
| **Astrotalk** | 5 | 4 | 4 | 4 | 2 | 3 | 3 | 5 | 2 | 4 | 4 |
| **Drik Panchang** | 4 | **5** | 4 | **5** | 3 | 3 | 3 | 2 | 1 | 2 | 2 |
| **Clickastro** | 5 | 4 | 4 | 3 | 3 | 4 | **4** | 4 | 3 (paid) | 4 | 4 |

**Key specifics (dated 2026-10-09):**
- **AstroSage** — deepest free Kundli (16 divisional charts, multi-level
  Vimshottari + Yogini dasha, Shadbala, Ashtakvarga, Bhava Chalit;
  astrosage.com/kundli/). Huge free SEO hubs: all 27 Nakshatra pages
  (/nakshatra/), dated transit pages (/2026/saturn-transit-2026.asp),
  baby-names-by-nakshatra subdomain. Dated daily horoscope per sign in 14
  languages. Deep reports (marriage/career/finance/health, Child Kundli) are
  **paid** (from public shop).
- **ProKerala** — free birth chart in **North + South Indian** styles + Western
  natal; free standalone Mangal Dosha & Sade-Sati tools; free **10-porutham**
  (South-Indian) matching alongside Guna Milan; regional language versions.
  Weaker free dasha depth / yearly predictions.
- **Astrotalk** — free 50+ page Kundli PDF (12 divisional charts incl. D7/D24,
  doshas incl. **Pitra**, yogas); full free horoscope set **today + weekly +
  monthly + yearly** for all 12 signs; free Panchang, Muhurat, numerology,
  tarot. Heavy jargon, no glossary; strong funnel to paid astrologer chat.
- **Drik Panchang** — category authority for **free Panchang** (city-based
  tithi/nakshatra/yoga/karana, Choghadiya, Rahu Kaal, sunrise/sunset),
  **festival/vrat calendar**, Muhurat tools, Nakshatra pages, baby-name
  calculator; strongest regional/Panjika coverage; almost no thin content. Not
  a predictions engine (no yearly reports/child kundli).
- **Clickastro** — most prediction-forward free tier (markets career / marriage
  / health / wealth / education + favourable periods, "300+ pages"), 5 chart
  styles (incl. East/Kerala/Sri Lankan), 76 yogas, free matching + rashifal +
  panchang, 11 languages. Real depth partly gated behind paid reports (the
  "300+ pages free" is marketing).

**Where competitors beat BornClock (→ phase):**
- Daily/weekly/monthly/yearly **rashifal per moon sign, dated** — AstroSage,
  Astrotalk, Clickastro, Drik, all free → **P1**.
- **Daily Panchang for the user's city** (+ Choghadiya + Rahu Kaal) — Drik,
  Astrotalk, Clickastro → **P1**.
- **Festival/vrat calendar** — Drik (comprehensive, regional) → **P1**.
- **27 individual Nakshatra pages** as a free hub — AstroSage, Drik → **P1**.
- **Baby names by Nakshatra** — AstroSage, Drik → **P1**.
- **Transit-by-year pages** (Saturn 2026 / Sade Sati per sign) — AstroSage → **P1**.
- **South Indian chart style** — ProKerala, Astrotalk, Clickastro (BornClock has
  none) → **P2** (raise priority — see improvements GP2-SOUTH).
- **Career/health/wealth/education/foreign prediction sections** — Clickastro
  (free), AstroSage/Astrotalk (reports) → **P2**.
- **Child/Bal Kundli** — AstroSage, Clickastro, Astrotalk (mostly **paid**) → **P2**.
- **Period-structured yearly/monthly predictions** — universal; BornClock's
  "What's Ahead" is not period-structured → **P2**.
- **Standalone Pitra/Nadi/Mool dosha** — Astrotalk flags Pitra → **P2**.

**Gap-list corrections (Vedic):**
- **Confirmed table-stakes (keep, high priority):** daily Panchang, rashifal
  (add **weekly** explicitly — Astrotalk has it), South-Indian chart, Nakshatra
  pages, festival/vrat calendar, baby-names-by-nakshatra, Saturn/Sade-Sati
  transit pages.
- **Lower-priority than the plan implies:** Child (Bal) Kundli is almost always
  **paid** and low-traffic — build only if cheap (P2 tail, not a must). Extra
  divisional charts (D7/D4/D24 beyond D9/D10/D60) are a **credibility** signal,
  not a traffic play. Standalone Pitra/Mool/Nadi explainers are lightly covered
  by competitors — medium priority.
- **Missing from the plan:** wire **Choghadiya + Rahu Kaal into the daily
  Panchang** page (Drik/Astrotalk bundle them); consider the **10-porutham**
  South-Indian matching option for South-Indian traffic (ProKerala); every
  competitor ships **Hindi + ≥3 regional languages free** — if P1 ships
  English-only that is a structural disadvantage to flag.

---

## 3. Mystic — Cafe Astrology, Astrology.com, Numerology.com, ChinaHighlights (Chinese zodiac), tarot (BestDailyTarot/Evatarot)

| Competitor | #sect | quality | depth | thin(5=none) | terms-expl | user-persp | pred-clarity | interactivity | numerology-depth | free generosity |
|---|---|---|---|---|---|---|---|---|---|---|
| **Cafe Astrology** | 5 | 4 | **5** | **5** | **5** | 4 | 4 | 4 | 3 | **5** |
| **Astrology.com** | 5 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 2 | 4 |
| **Numerology.com** | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 2 | 4 | 2 |
| **ChinaHighlights (CZ)** | 4 | 4 | 4 | **5** | 4 | 4 | 4 | 3 | — | **5** |
| **Tarot (BestDailyTarot/Evatarot)** | 3 | 4 | 4 | **5** | **5** | **5** | 4 | **5** | — | **5** |

**Key specifics (dated 2026-10-09):**
- **Cafe Astrology** — free natal chart with rising sign, all planets by sign +
  house, and aspects, with written interpretations, no email required; free
  numerology (Life Path, Lucky, Soul, Karmic — Pythagorean); free compatibility
  grid + "Love Oracle". No Chinese zodiac / real tarot free.
- **Astrology.com** — free birth chart (planets/signs/houses) with pro-written
  interpretations (noon default if no time); free daily/weekly/yearly
  horoscopes (several thin "bonus" dailies); free Yes/No + Daily Tarot,
  numerology, Chinese horoscopes + compatibility.
- **Numerology.com** — free intro articles (Life Path, Birthday, Expression);
  Soul Urge / Personal Year / Attitude pushed to **paid**; least generous of the
  five. No Chaldean, no name-correction/business/mobile tools free.
- **ChinaHighlights** — fully free Chinese zodiac: sign-by-year, **2026/2027
  per-sign forecasts** (~100–150 words, career/finance/love/health),
  compatibility %, lucky elements, 12 animal pages, regional variants.
- **Tarot (BestDailyTarot, Evatarot)** — fully free **interactive** spreads
  (daily, yes/no, love, Celtic Cross, career/health), real card-picking, plain
  responsive interpretations; BestDailyTarot **also** has tarot-by-birthday
  (so BornClock's existing feature is table-stakes, not a differentiator).

**Where competitors beat BornClock (→ phase):**
- **Full Western natal chart** (houses + rising + aspects, free, with
  interpretations) — Cafe Astrology, Astrology.com → **P4** (biggest Western gap).
- **Interactive tarot** (daily / yes-no / love, draw-your-own) — BestDailyTarot,
  Evatarot → **P4** (now effectively table-stakes; ship daily+yes/no+love together).
- **Chinese zodiac yearly forecast** — ChinaHighlights (~100–150 words/sign/year
  + compatibility %) → **P4**.
- **Birthday number** (free at Numerology.com / Cafe) → **P1** catch-up.

**Gap-list corrections (Mystic):**
- **Re-frame P2 numerology (Chaldean + name-correction/business/mobile/house)**
  as **whitespace, not catch-up** — zero of the five Western competitors offer
  it; it targets the Indian/Chaldean-numerology audience.
- **Birthday vs Attitude numbers (P1):** Birthday is table-stakes (common);
  **Attitude** is offered by none of the five → treat as a differentiator.
- **P4 interactive tarot** is stronger than planned (two dedicated free sites) —
  prioritize the bundle, not piecemeal.
- **Free-generosity benchmark:** tarot sites and ChinaHighlights are 100% free;
  Numerology.com's hard paywall "reads uncompetitive". BornClock's preview-lock
  monetization should keep generous free summaries visible (already the model).

---

## 4. Birthday & celebrity — Famous Birthdays, OnThisDay, Timeanddate

**Evidence note:** Famous Birthdays & OnThisDay fetched directly; timeanddate
403-blocked headless fetch — its tool set / On-This-Day structure is from search
+ public tool index, flagged. All dated 2026-10-09.

| Criterion | Famous Birthdays | OnThisDay | Timeanddate |
|---|---|---|---|
| Number of sections | 4 | 5 | 5 |
| Quality | 4 | 4 | **5** |
| Depth | 3 | 4 | 4 |
| Thin-content (5=none) | 3 | 4 | **5** |
| Terms explained | 2 | 3 | **5** |
| User-perspective | 4 | 4 | 4 |
| Celebrity breadth | **5** | 4 | 2 |
| Historical-events depth | 1 | **5** | 4 |
| Birthday-facts richness | 3 | **5** | 4 |
| Freshness | 5 | 5 | 4 |

**Key specifics (dated 2026-10-09):**
- **Famous Birthdays** — /may13.html lists 48 celebrities with thumbnail + age
  and a **numbered popularity rank 1–48**; profiles carry multi-axis rankings
  ("#1 born May 13", "#12 movie actors"), Before Fame / Family Life. **No birth
  time, no reliability note; no historical events; no #1-song.** Skews young /
  social-media. Thin on explanation.
- **OnThisDay** — deepest free history: /events/may/13 (~100+ events 535 AD–2026
  with photos, cited to Encyclopedia.com/NYT/institutions — **not Wikimedia**);
  /birthdays/date/1978/may/13 computes day-of-week, elapsed time, Generation X,
  Chinese zodiac, astrology sign, **#1 songs US+UK**, famous births + deaths —
  the richest free birthday-facts bundle.
- **Timeanddate** — best explanatory copy / term definitions and tool accuracy
  (duration, weekday, countdown); curated On-This-Day (events+births+deaths+fun
  holidays). Weak celebrity breadth (utility brand, no profiles/ranking).

**Where competitors beat BornClock (→ phase):**
- **Celebrity popularity ranking per date** (Famous Birthdays' core hook) →
  **P4** (BornClock /born-on appears unranked; a sitelinks/relevance sort exists
  in the curated set to drive this).
- **"#1 song on your birthday"** (OnThisDay US+UK) → add to birthday report +
  **P3** shareable card (high-virality, cheap).
- **Famous deaths on a date** (OnThisDay, timeanddate) → **P4** (BornClock is
  births-only).
- **"What happened on your birthday" events feed** → **P4** (planned via
  Wikimedia On-This-Day + CC BY-SA).

**Gap-list corrections (birthday/celebrity):**
- **Birth-time reliability note (P4): CONFIRMED differentiator** — none of the
  three show celebrity birth *time* at all; white-space for the celebrity-Kundli
  angle.
- **Wikimedia attribution (P4): correct the framing** — OnThisDay does *not* use
  Wikimedia (uses Encyclopedia.com/NYT). CC BY-SA Wikimedia is fine and
  differentiating; don't frame it as matching a competitor's Wikimedia feed.
- **Shareable cards (P3): CONFIRMED green-field** — no competitor has a strong
  equivalent.
- **Missing from the plan:** celebrity **popularity ranking** and
  **#1-song-on-your-birthday** are not in the stated feature set → add
  (improvements NB4-RANK, NB3-SONG). Day-of-week / zodiac / generation /
  birthstone / countdown are table-stakes **already matched** by BornClock.

---

## 5. Science & longevity — Living to 100, SSA, ONS, Rejuvenation Olympics, PhenoAge quizzes, InsideTracker, Blue Zones

| Competitor | #sect | quality | depth | thin(5=none) | terms-expl | user-persp | sci-cred | actionability | input-rich | free generosity |
|---|---|---|---|---|---|---|---|---|---|---|
| **Living to 100 (Perls)** | 3 | 4 | 4 | 4 | 4 | **5** | 4 | **5** | **5** | 4 |
| **US SSA actuarial** | 1 | 3 | 1 | 5 | 2 | 2 | **5** | 1 | 1 | **5** |
| **UK ONS** | 2 | 4 | 2 | 5 | 3 | 3 | **5** | 1 | 1 | **5** |
| **Rejuvenation Olympics** | 2 | 3 | 2 | 4 | 3 | 2 | 3 | 2 | 1 | 2 (view free; test paid) |
| **PhenoAge quizzes** | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 4 | 4 |
| **InsideTracker InnerAge** | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **5** | **5** | 1 (no free tier) |
| **Blue Zones (Power 9)** | **5** | **5** | **5** | **5** | 4 | 4 | 4 | 4 | n/a | **5** |

**Key specifics (dated 2026-10-09):**
- **Living to 100** — 40-question, ~10-min quiz (lifestyle/nutrition/medical/
  attitude); output = life-expectancy estimate + "years you're taking off / can
  add" + a physician to-do list. Built on the Perls/New England Centenarian
  Study. Strong actionable loop; free (account to save).
- **US SSA** — sex + DOB only → average additional years; max credibility, min
  richness; no lifestyle, no guidance (ssa.gov returned 403 to fetch; from SSA
  summaries).
- **UK ONS** — age + sex → average cohort life expectancy **plus P(reach 100)**
  — a percentile output SSA lacks; cohort life tables.
- **Rejuvenation Olympics** — free public DunedinPACE/epigenetic **leaderboard**
  (viral hook); entry needs a **paid** TruDiagnostic epigenetic test.
- **PhenoAge quizzes** (AgelessRx etc.) — free bio-age calculators from blood
  biomarkers; a non-blood 19-question habit variant is closest to BornClock's
  quiz model.
- **InsideTracker InnerAge** — 20-biomarker bio-age + personalized action plan;
  **no free tier** (from public pricing).
- **Blue Zones** — deepest free longevity **content**: 5 regions + **Power 9**
  factors each with mechanism + quantified claims; no calculator.

**Where competitors beat BornClock (→ phase):**
- **Blue-Zones Power-9 per-factor pages** — Blue Zones out-depths a generic
  article; 9 clean indexable long-tail pages → **P1** (highest-value content gap).
- **Life-expectancy-by-condition / bio-age-by-habit indexable pages** — no
  strong incumbent (SSA/ONS disclaim lifestyle; Living-to-100 hides it behind a
  quiz) → **P1** (open territory).
- **Actionable "years added/lost + to-do list" calculator output** —
  Living-to-100 beats BornClock's calculator → sharpen calculator output
  (improvements NS-CALC).
- **P(reach 100) output** — ONS; cheap, credible, shareable → add to the
  life-expectancy calculator & country pages (improvements NS-P100).
- **Public leaderboard / "where do you rank"** — Rejuvenation Olympics;
  BornClock's free bio-age quiz is already more generous — borrow the comparison
  framing (extend country comparison to bio-age-vs-peers).

**Gap-list corrections (science/longevity):**
- **Confirm P1** Blue-Zones Power-9, by-condition, by-habit pages — low
  competition, high intent.
- **Add a calculator-output item** (not just content): per-input year-deltas +
  a to-do list, and a **P(reach 100)** figure — currently a competitor
  advantage, not on the stated plan.
- **Government calculators set a credibility bar:** cite SSA/ONS/WHO actuarial
  data as the baseline BornClock's lifestyle adjustments modify (extends the
  RC3 "how we test" honesty push to the longevity side).
- **Bio-age positioning sound:** keep the free questionnaire model and lead on
  generosity vs the paid blood/epigenetic leaders.

---

## 6. BornClock's thin pages (consolidated, from the `growth` codebase)

Ranked by impact; **fix-at-source** level named (the shared template/data, never
page-by-page edits):

1. **/celebrity/:slug for bio-less / year-only celebrities** — DB has ~3,107
   celebrities but only ~1,058 bios (`src/data/celebrity-bios.json`); ~2,000
   profiles render with no bio paragraph, and year-only DOBs lose Western zodiac,
   Life Path and birthday-twins (`CelebrityPage.tsx` ~lines 85, 104–110). **Fix:
   data** — populate bios / full DOBs. (→ P4 celebrity work / improvements F-CELEB.)
2. **/hi/rashifal (+/:rashi)** — **static**, undated, identical for every
   visitor despite "आज का राशिफल" (`src/pages/hi/RashifalPage.tsx` reading a
   hardcoded `src/data/rashifalData.ts`). **Fix: template/data** → P1 replace with
   computed rashifal (improvements F-RASHIFAL / P1 item 1).
3. **/angel-numbers** — explanatory hub, no engine/birth input (13 hardcoded
   entries); thin but honestly disclaimed. **Fix: content** if more depth wanted.
4. **/born-on/:month/:day (+/india)** — depends on celebrity coverage per date;
   sparse dates show little. **Fix: data** (celebrity coverage) → ties to F-CELEB.
5. **/rashi-ratna** — static per-sign lookup (not from a birth chart), honestly
   cross-references /gemstones. Mild. **Fix: data** if expansion wanted.
6. **Country life-expectancy pages** — one shared `LifeExpectancyCountryTemplate.tsx`
   with per-country props; risk of near-duplicate at scale. **Fix: shared
   template + per-country data depth.**
7. **/birthstone/:month** — static per-month data; low concern.

(Verified **not** thin: all 9 Vedic tool pages, numerology family, compatibility
— 78 generated pair pages, zodiac/:sign, chinese-zodiac/:animal, tarot.)

---

## 7. BornClock's unexplained technical terms (consolidated)

A site-wide `TermTip` glossary now covers 37 terms and is widely applied.
Remaining places a term is **shown but not wrapped** (small, precise):

- **"Virupas"** — `src/components/reading/VedicReading.tsx:76,79` (strength-table
  header); defined only inside the `shadbala` tooltip, not where the number shows.
- **8 Koota names** (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot,
  Nadi) — `src/pages/KundaliMatchPage.tsx:259–272` render with per-koota prose
  but no `TermTip` on the names; "Ashtakoota" (meta term) unwrapped on-page.
- **"Dasamsa (D10)"** heading — `src/pages/CareerReportPage.tsx:129` not wrapped
  (explained in adjacent prose).
- **D9/D10/D60 fallback prose** — `VedicReading.tsx:206` bare, but only renders
  if the LLM reading fails (primary path lines 67–69 are wrapped).
- **"Paksha"** — `MuhuratPage.tsx:157` / `SadeSatiPage.tsx` shown bare (low-risk).

All feed the P1 "fixes to existing pages" backlog (improvements F-TERMS).

---

## 8. P1–P5 gap-list verification (confirm / correct)

| Planned item | Phase | Verdict | Refinement from P0 evidence |
|---|---|---|---|
| Rashifal daily/weekly/monthly/yearly per sign | P1 | **Confirm (table-stakes)** | Add **weekly** explicitly (Astrotalk). Replace static `/hi/rashifal`. Consider Hindi + regional parity. |
| Daily Panchang for user's city | P1 | **Confirm (table-stakes)** | Wire **Choghadiya + Rahu Kaal** into the same page (Drik/Astrotalk bundle them). |
| Festival & vrat calendar | P1 | **Confirm** | Drik sets the bar (regional, dated). |
| Planet-in-house/sign, 27 Nakshatra, Yoga pages | P1 | **Confirm** | Nakshatra pages confirmed (AstroSage/Drik). Keep Rule-6 distinctiveness; build fewer-better if needed. |
| Transit pages (Saturn/Jupiter/Rahu), Mercury retro | P1 | **Confirm** | AstroSage's dated `/2026/...` pattern validated. |
| Baby names by Nakshatra | P1 | **Confirm** | AstroSage dedicated hub; needs a properly-licensed dataset. |
| Remaining content-gap pages (D7/D4/D24, Chaldean, birthday/attitude #, Blue-Zones) | P1 | **Confirm w/ re-frame** | Chaldean = **whitespace** not catch-up; Blue-Zones **Power-9 per-factor** = top content gap; Attitude number = differentiator. |
| Personal predictions yearly/quarterly/monthly + upgrade existing surfaces to Rule 7 | P2 | **Confirm** | Period-structured predictions are universal; BornClock's "What's Ahead" needs period structure. |
| Child (Bal) Kundli | P2 | **Confirm but de-prioritise** | Mostly **paid**/low-traffic at competitors — build only if cheap. |
| Career (ranked fields) | P2 | **Confirm** | Clickastro surfaces free; extend BornClock's career report. |
| Health (adults) | P2 | **Confirm** | Wellbeing framing (Rule 7). |
| Foreign travel/settlement, wealth, education | P2 | **Confirm** | Clickastro markets these free. |
| Free Kundli PDF; South Indian chart style | P2 | **Confirm + raise South-Indian priority** | ProKerala/Astrotalk/Clickastro all have S-Indian; move earlier in P2. |
| Matching depth (Manglik-in-matching, Nadi, 10-porutham) | P2 | **Confirm** | Add **10-porutham** (ProKerala) for S-Indian traffic. |
| Numerology name/business/mobile/house correction | P2 | **Confirm (whitespace)** | Position as differentiator, not catch-up. |
| More doshas (Pitra/Nadi/Mool/Grahan) | P2 | **Confirm (medium)** | Lightly covered by competitors; calm tone. |
| Classical references | P2 | **Confirm** | Honesty Rule 8 (cite text, chapter only if verified). |
| Paid products behind flags OFF | P2 | **Confirm** | Keep generous free summaries (tarot/CZ free-tier benchmark). |
| Fix scheduled jobs | P3 | **Confirm** | Infra (Cloudflare cron broken). |
| Personal dashboard / email opt-in / family profiles / PWA / shareable cards / reviews / reviewer support | P3 | **Confirm** | Shareable cards = green-field; add **#1-song** to cards. |
| Full Western birth chart | P4 | **Confirm (biggest Western gap)** | Cafe Astrology / Astrology.com free with interpretations. |
| Celebrity Kundlis + birth-time reliability note | P4 | **Confirm (differentiator)** | No competitor shows celeb birth time; add **popularity ranking** + **famous deaths**. |
| "What happened on your birthday" (Wikimedia) | P4 | **Confirm (correct attribution framing)** | Differentiator, not a competitor match; add **#1-song**. |
| Interactive tarot / Chinese yearly forecast | P4 | **Confirm (table-stakes now)** | Ship tarot daily+yes/no+love together; CZ ~100–150 words/sign/year + compat %. |
| Languages (Hindi complete, then Telugu) | P4 | **Confirm (structural)** | Competitors ship Hindi + regional free; consider pulling some language parity earlier. |
| Robust city lookup / conversion tracking / server-side AI limit / born-today photos | P5 | **Confirm** | Infra/measurement; unchanged. |

**New items surfaced by P0** (full detail + acceptance checks in
`docs/growth-improvements.md`): celebrity popularity ranking (NB4-RANK),
#1-song-on-your-birthday (NB3-SONG), famous-deaths on a date (NB-DEATHS),
calculator "years-delta + to-do" output (NS-CALC), P(reach 100) (NS-P100),
Choghadiya/Rahu-Kaal in Panchang (refines P1-2), weekly rashifal (refines P1-1),
10-porutham matching (refines P2-7), South-Indian chart priority (GP2-SOUTH),
and the existing-page fixes (F-CELEB, F-RASHIFAL, F-TERMS, F-THIN).

---

## 9. Needs the person
- **Baby-names-by-Nakshatra dataset** (P1): must be properly licensed or
  original — the person to confirm the source (never scraped from competitors).
- **Regional-language scope** (P4 / earlier): competitors ship Hindi + 3+ regional
  languages free; decide how much language parity to pull forward vs launch.
- **Prices** for any new paid products (built OFF) — the person sets them.
- **Celebrity bio/DOB data source** (F-CELEB): confirm a licensed source to
  populate ~2,000 missing bios.

---

## 10. Evidence URLs (all viewed 2026-10-09)
Vedic: astrosage.com/kundli/, /horoscope/daily-horoscope.asp, /nakshatra/,
/2026/saturn-transit-2026.asp, babynames.astrosage.com/nakshatra/,
prokerala.com/astrology/kundli/, /astrology/porutham/, astrotalk.com/freekundli,
astrotalk.com, drikpanchang.com, clickastro.com/free-kundli.
Birthday/celebrity: famousbirthdays.com/may13.html, /people/robert-pattinson.html,
onthisday.com/events/may/13, /birthdays/may/13, /birthdays/date/1978/may/13,
timeanddate.com (tool index + on-this-day; headless fetch 403, search-sourced).
Mystic: cafeastrology.com/astrologyreportsfree.html, astrology.com/birth-chart,
/horoscope/daily/taurus.html, numerology.com/articles/your-numerology-chart/,
chinahighlights.com/travelguide/chinese-zodiac/, bestdailytarot.com, evatarot.net.
Science/longevity: livingto100.com, bumc.bu.edu/centenarian,
ssa.gov/OACT/population/longevity.html (403, SSA-summary-sourced),
ons.gov.uk life expectancy calculator, rejuvenationolympics.com,
agelessrx.com/biological-age-calculator, store.insidetracker.com,
bluezones.com/2016/11/power-9/, health.harvard.edu.
