# BornClock — Content & Feature Audit (read-only)

_Evidence-based audit. Every claim is backed by a verbatim quote + file:line. No code was changed; no branch/commit/deploy. Date: 2026-09-26._

---

## PART 1 — Jargon / technical-term audit

### Step 0 — Does a glossary / tooltip / "what does this mean" mechanism already exist?

**Verdict: There is NO astrology-term glossary or hover-definition system.** What exists:

- **Generic UI primitives** `src/components/ui/tooltip.tsx` and `src/components/ui/hover-card.tsx` (shadcn) exist, but grep shows they are used only in **Science/admin/chart** contexts (`EnhancedLifeExpectancyReport.tsx`, `WhatIfSimulator.tsx`, `LifeExpectancyCalculator.tsx`, `Methodology.tsx`, `Admin.tsx`, chart components). **They are not used on any Vedic astrology page to define a term.** The only `title=` attributes on the audited pages are decorative (e.g. `title="Heaviest kootas"` on the ★ icon, `KundaliMatchPage.tsx:247`) or on `<SEO>`/`<PageFAQ>` — not term definitions.
- **One real "definition layer" exists but is narrow:** `NAKSHATRA_MEANINGS` (`src/lib/vedic/nakshatraMeanings.ts:36`) — deity / shakti / meaning per nakshatra. It is consumed by exactly one place: `kundaliService.ts:6,95-99` (the Kundali birth-star interpretation block). It is nakshatra-only, not a general term dictionary, and not surfaced as tooltips.
- **No `/glossary` route, no `TERM_DEFS`/definitions map** anywhere.

**Implication for the fix:** because no reusable term-definition mechanism exists, the "apply it everywhere" shortcut is **not** available — a real fix means either (a) building a small shared glossary/tooltip component and wiring it in, or (b) writing inline explanations. The one asset that could be generalized is the `NAKSHATRA_MEANINGS` pattern (a keyed data layer of definitions).

### Which pages use the four-dimension standard well, and where the complaint is accurate

The four-dimension standard is: **(a)** what it is · **(b)** why it matters · **(c)** what it means for THIS reader · **(d)** how it connects to other placements.

**The "too technical, not explained" complaint is accurate in specific, identifiable places — not uniformly.** The deterministic "Your chart, interpreted" block on `/kundali`, all of `/kundali-match`, `/sade-sati`, and `/gemstones` are actually strong. The weak spots are concentrated: **`/muhurat`**, the **`/kundali` advanced view (divisional-chart abbreviations)**, **`/sun-vs-moon-sign`** (rising sign/cusp), and a recurring **"ayanamsa / sidereal / Lahiri"** blind spot on every Vedic page.

### Per-page term counts (explained on first use = ≥1 of the 4 dimensions present)

| Page | Distinct jargon terms | Explained on first use | Ratio | Weakest term |
|---|---|---|---|---|
| `/kundali-match` | ~14 | ~12 | **~0.85** (best) | Brihat Parashara Hora Shastra / Lahiri ayanamsa |
| `/sade-sati` | ~7 | ~6 | **~0.86** | Lahiri ayanamsa |
| `/gemstones` | ~11 | ~9 | **~0.82** | Kendra / Trikona (in the primary card) |
| `/rashi-ratna` | 6 | ~5 | ~0.83 | "malefic" |
| `/career-report` | ~8 core (+8 named Yogas) | ~6 core | 0.75 core / **~0.38** incl. named Yogas | named Yoga + `[grade]` chip |
| `/kundali` | ~17 | ~11 | **~0.65** | "sidereal (Lahiri ayanamsa)" + D9/D10/D60 cluster |
| `/sun-vs-moon-sign` | 5 | ~3 | **0.60** | "cusp" / "rising sign" |
| `/muhurat` | 12 core (+9 Tithi sub-names) | ~6–7 core | **~0.50 core / ~0.33** incl. sub-names (worst) | "Yoga" (0/4) |

**Worst offenders: `/muhurat` (~0.33–0.50) and `/sun-vs-moon-sign` (0.60); the `/kundali` advanced view drags an otherwise-strong page down to ~0.65.**

---

### `/kundali` — ratio ~11/17 ≈ 0.65

Strong deterministic block, weak advanced view. Uses `NAKSHATRA_MEANINGS`. **No tooltip layer.**

**Well-explained (4 of 4 dimensions)** — from `kundaliService.ts` `buildInterpretationBlocks`:
- **Lagna** (`:89-90`): _"The Lagna is the sign that was rising on the eastern horizon at your birth; it governs your outward personality, physical presence and overall approach to life — the "you" the world meets first. Yours is ${k.lagna.sign}… Read this together with your Moon sign (${k.rashi}): the Lagna is your outer self… the Moon is your inner, emotional self — the two are meant to be read as a pair…"_ → a✓ b✓ c✓ d✓.
- **Rashi / Moon sign** (`:96`): _"Your Moon sign (Rashi) is where the Moon sits, and it shapes your emotional nature, instincts and inner life — in Vedic astrology the Moon-sign matters at least as much as the Sun-sign…"_ → 4/4.
- **Nakshatra** (`:98-99`): _"the Moon occupies the ${…} Nakshatra (lunar mansion), pada ${…}. …'s presiding deity is ${nak.deity} and its classical "shakti" (special power) is ${nak.shakti} — ${nak.meaning}"_ → 4/4 (via `NAKSHATRA_MEANINGS`).
- **Vimshottari Dasha / Mahadasha / Antardasha** (`:125-126`): _"The Vimshottari Dasha is the timing system that divides life into planetary periods… You are in your ${maha} Mahadasha (the broad chapter)… with a ${antar} Antardasha (the sub-chapter within it)…"_ → 4/4, with Mahadasha/Antardasha glossed inline.

**Unexplained (0 of 4):**
- **Pada** (`kundaliService.ts:98`) — only the number is shown; "pada" never defined.
- **Sidereal / Lahiri ayanamsa** (`:132`) — see weakest, below.
- **Navamsa (D9), Dasamsa (D10), Shashtiamsa (D60)** — advanced view names them with abbreviations only, e.g. `VedicReading.tsx:166`: _"In-depth divisional charts add nuance: Navamsa (D9) points to ${d9Moon}, Dasamsa (D10) to ${d10Sun}."_ (three terms, zero definitions). D60 carries a confidence disclaimer but no "what it is."
- **Virupas** (`VedicReading.tsx:74`) — unit named, never defined (rides on Shadbala's "Planetary strength" gloss).
- Individual **Mangal Dosha / Kaal Sarp / Sade Sati** in the deterministic doshas text (`VedicReading.tsx:163-165`) — named as "traditional patterns", not individually defined (the section title "Doshas — areas to be mindful of" gives ~1 dimension).

**Partially explained (~1–2 of 4):** Pratyantardasha (`VedicReading.tsx:41`, glossed "sub-sub-period"); Shadbala (`:74`, "Planetary strength… indicative"); Yogas (`:96`, "graded — formation does not guarantee full delivery" — a caveat, no definition of what a Yoga is).

**Weakest explanation (verbatim), `kundaliService.ts:132`:**
> "This is a computed sidereal (Lahiri ayanamsa) reading. These layers are meant to be read together…"

Two technical terms (sidereal, Lahiri ayanamsa) with **zero** of the four dimensions.

**Structure note:** the deterministic block walks through what/why/for-you/connection in full paragraphs (good). The advanced view is terse label:value fragments (e.g. "Navamsa (D9) Moon: Simha") with no prose — that is where the terseness/jargon complaint is accurate on this page.

---

### `/kundali-match` — ratio ~12/14 ≈ 0.85 (strongest-explained page)

Every scored Koota carries "what it is + what a strong/weak score practically means" via inline `explanation` strings + `practicalNote` (`matchmaking.ts:73-79`) + a re-gloss in `matchSynthesis.ts`. **No tooltip layer; does not use NAKSHATRA_MEANINGS.**

Examples (all ~4/4):
- **Nadi** (`matchmaking.ts:167`): _"Health & constitutional compatibility (the single heaviest Koota, worth 8 of the 36 points) — Person A is ${na} Nadi, Person B is ${nb} Nadi. …Same Nadi = Nadi Dosha — classically the most significant single concern, framed calmly here as an area to approach consciously, not a verdict…"_
- **Bhakoot** (`:160`), **Tara** (`:122`, names all favourable/inauspicious Taras), **Gana** (`:151`, "Temperament class"), **Graha Maitri** (`:141`), **Varna** (`:102`), **Vashya** (`:109`), **Yoni** (`:128`) — each states what it is, why, the couple's real values, and practical meaning.
- **Dosha cancellation** (`:184`, `:201`) is the best-explained jargon on any page — it spells out _why_ a dosha is cancelled ("same Nakshatra but different padas", "friendly sign-lords"), covering all 4 dimensions.

**Unexplained (0/4):** "Brihat Parashara Hora Shastra" and "Lahiri ayanamsa" in the methodology `<details>`.

**Weakest (verbatim), `matchmaking.ts:205`:**
> "Computed by the classical Ashtakoota (Guna Milan) system of the Brihat Parashara Hora Shastra, using the Lahiri ayanamsa."

Two named-but-undefined terms in a source-citation register; every other term on the page is glossed.

---

### `/sade-sati` — ratio ~6/7 ≈ 0.86

Verdict-first, warm, dates inline. **No tooltip layer.**

- **Sade Sati** (`SadeSatiPage.tsx:47`): _"Sade Sati refers to the roughly seven-and-a-half years when Saturn transits the signs before, on, and after your Moon sign. Saturn's themes are discipline, patience, and long-term reward — many people look back on their Sade Sati as the period that built their strongest foundations…"_ → 4/4.
- **Dhaiya / small Panoti / Kantaka / Ashtama** (`:136-141`): _"A 2.5-year Saturn transit (the 4th or 8th from your Moon), traditionally a lighter version of Sade Sati's themes."_ → 4/4.
- Three phases each get a real effect (see Part 2).

**Unexplained (0/4):** "Lahiri-ayanamsa" only.

**Weakest (verbatim), `SadeSatiPage.tsx:149`:**
> "Dates are computed from Saturn's real transit through the signs, using the same Lahiri-ayanamsa engine as the rest of BornClock."

---

### `/gemstones` — ratio ~9/11 ≈ 0.82 (most rigorous single tool)

Deliberately glosses jargon in plain words (text generated by `src/lib/vedic/gemstones.ts`, rendered in `GemstonePage.tsx`). **No tooltip layer.**

- **Ascendant / Lagna** (`gemstones.ts:138`): _"This recommendation is based on your Ascendant (Lagna) — your rising sign — which multiple classical sources identify as the correct foundation for gemstone selection, rather than your Moon sign (Rashi) alone, which is a common but less precise shortcut."_ → 4/4 (best single explanation in the whole audit).
- **Yogakaraka** (`:139`): _"your Yogakaraka ${planet} — the single most beneficial planet for your rising sign, since it governs both an "angle" and a "trine" house…"_ → 4/4.
- **Shadbala** (`:139`), **Dasha** (`:139`, "the planetary period you're currently in"), **functional benefic/malefic** (via classificationNote `:163`) — all explained.

**Weak spots:** the **primary result card** (`gemstones.ts:101`) uses **"Kendra"** and **"Trikona"** raw: _"${yk.planet} is your Yogakaraka — it rules both a Kendra and a Trikona (houses …)…"_ — the plain-word gloss ("angle"/"trine") only appears later in the methodology string (`:139`). "kendradhipati" (`:163`) sits inside a collapsed `<details>`. **Antardasha** is shown as `–{antarLord}` but never named.

**Weakest (verbatim), `gemstones.ts:101`** (this is the most prominent card):
> "${yk.planet} is your Yogakaraka — it rules both a Kendra and a Trikona (houses ${yk.houses.join(', ')}) for ${chart.lagna.sign} rising…"

---

### `/rashi-ratna` — ratio ~5/6 ≈ 0.83

Static per-sign lookup (`RashiRatnaPage.tsx` + `rashiRatnaData.ts`). **No tooltip layer.** Rashi/Rashi Ratna/Navratna/ruling planet all glossed with a worked example (`:17`: "because Leo is ruled by the Sun, Leo's Rashi Ratna is Ruby").

**Weakest (verbatim), `RashiRatnaPage.tsx:56`:**
> "…to strengthen planetary energies, protect against malefic influences, and bring prosperity, health, and clarity."

"malefic" used with no definition anywhere on the page.

---

### `/sun-vs-moon-sign` — ratio ~3/5 ≈ 0.60

Pure static explainer, almost no Vedic jargon. Sun sign (`:65`) and Moon sign (`:50`) are each 4/4. But:
- **rising sign** (`:12`, `:59`) — named as essential ("Most astrologers consider both equally important, alongside the rising sign") but **never defined** and **not linked to any tool** (~1/4).
- **cusp** (`:65`) — 0/4.

**Weakest (verbatim), `SunVsMoonSign.tsx:65`:**
> "…with minor variation of a day or two for cusp births."

---

### `/muhurat` — ratio ~6–7/12 ≈ 0.50 (0.33 counting Tithi sub-names) — WORST PAGE

Text partly generated by `panchang.ts` `muhuratMethodology()`, rendered `MuhuratPage.tsx`. **No tooltip layer.**

- **Panchang** (`panchang.ts:92`, "the five classical 'limbs'"), **Tithi** ("lunar day…"), **Nakshatra** ("birth star of the day"), **Pushya** — each partly glossed (~2–3/4).
- **"Yoga" (0/4)** — listed as a Panchang limb with no definition while its siblings get parentheticals: `panchang.ts:92`: _"…the Nakshatra (birth star of the day…) … the Yoga, and the weekday…"_
- **Paksha** (`MuhuratPage.tsx:86`, shown raw), **Chaughadia / Hora / Chandrashtama** (`:95`, named only as "a planned expansion"), and **9 Tithi sub-names** (Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Trayodashi, "Rikta", Amavasya, `panchang.ts:92`) are all 0/4.

**Weakest (verbatim), `panchang.ts:92`:**
> "…the Yoga, and the weekday — then we flag the Rahu Kalam window to avoid within the day."

("Yoga" listed with zero definition; also fully undefined: Chaughadia/Hora/Chandrashtama at `MuhuratPage.tsx:95`.)

---

### `/career-report` — ratio 6/8 core ≈ 0.75 (0.38 incl. named Yogas)

Deterministic (`careerReport.ts`). 10th house, 10th lord, Dasamsa/D10, Shadbala, Vimshottari Dasha, significator all ~4/4. **No tooltip layer.**

**Weak spot:** the word **"Yoga"** as a category is never defined, and named Yogas render bare with a `[grade]` chip and no legend.

**Weakest (verbatim), `CareerReportPage.tsx:84`:**
> "{y.name} [{y.grade}] — {y.summary}"

(e.g. "Budha-Aditya [strong] — …": the yoga name, and what `[full]`/`[strong]`/`[partial]` mean, are undefined.)

---

### Part 1 cross-page conclusions

1. **The complaint is real but localized.** Four surfaces are genuinely under-explained: **`/muhurat`** (worst), the **`/kundali` advanced view** (D9/D10/D60/virupas/pada), **`/sun-vs-moon-sign`** (rising sign, cusp), and the **`/career-report` Yoga names + grade chip**.
2. **One term is unexplained on EVERY Vedic page:** "ayanamsa / sidereal / Lahiri" — always the weakest quote (`kundaliService.ts:132`, `matchmaking.ts:205`, `SadeSatiPage.tsx:149`).
3. **The four-dimension standard IS present and strong** on `/kundali` (deterministic block), `/kundali-match`, `/sade-sati`, `/gemstones` — so a rewrite is about **extending an existing in-house standard to the weak pages**, not inventing one.
4. **No reusable glossary/tooltip mechanism exists** — so "apply it everywhere" requires first building the mechanism (or generalizing the `NAKSHATRA_MEANINGS` data-layer pattern).

---

## PART 2 — Feature-depth inventory (six flagged tools + Career dropdown)

### Kundali (`/kundali`)
Sections actually rendered (`KundaliPage.tsx`): North-Indian **KundaliChart**; summary cards **Lagna / Rashi (+Devanagari) / Nakshatra (+pada) / Dasha**; **planetary-positions table** (sign/house/degrees/retrograde); **"Your chart, interpreted"** deterministic blocks; **"Your personal reading"** (AI, 5 life areas + snapshot + right-now + doshas + deeper layers); **advanced view** (placements, **Pratyantardasha**, divisional D9/D10/D60, **Shadbala** table, **Yogas** list); **Past-Period Reflection**, **Reading History**, WhatsApp/Gift, paid-report upsell.
- **Kaal Sarp Dosha:** mentioned only inside the general Doshas narrative/fallback (`VedicReading.tsx:164-165`); **no dedicated section/detection UI.**
- **Ashtakvarga-equivalent strength view:** **absent** (grep for "ashtakvarga" = zero hits). The strength view present is **Shadbala** (`VedicReading.tsx:72-90`), not Ashtakvarga.
- **Remedies section:** **does not exist.** "remedies" appears only in the upsell CTA — `KundaliPage.tsx:285`: _"Want the full {price} Vedic report with remedies and predictions?"_ No gemstone/mantra/upay content is rendered.

### Sade Sati (`/sade-sati`)
- **Three phases each with real life-area effects:** **YES** (`SadeSatiPage.tsx:34-40`) — Rising: _"the first pressures that set the stage for what follows"_; Peak: _"the most demanding but also where the deepest growth happens"_; Setting: _"where earlier effort starts paying off."_ Caveat: only the **currently-active** phase's line is shown to a given user; the other two descriptions exist in code but aren't all shown at once.
- **Real start/end dates:** **YES** — current cycle (`:121-127`), next cycle (`:129-134`), Dhaiya end (`:139`); computed from real Saturn ingress scanning (`sadeSati.ts:38-73`), explicitly "not an estimate."
- **Remedies/upay section:** **NO** — none anywhere; the page is deliberately reassurance-only (`:44`: _"…that's genuinely nothing to worry about."_).

### Muhurat (`/muhurat`)
- **Occasion types (exact):** only **3** — `MuhuratPage.tsx:15`: `business` "Start a business / venture", `travel` "Travel / journey", `general` "General auspicious start". (API validates the same three, `api/muhurat.ts:16`.) No marriage / griha pravesh / vehicle / naming.
- **Location/city asked?** **NO** — the form has only Purpose + Look-ahead; no city/lat/lon. The API accepts `tz` but the page never sends it (`:28` fetch is `?purpose=&days=` only), so it defaults to IST 5.5 (`api/muhurat.ts:18`). Rahu Kalam is labelled "(approx, local)" despite no location.
- **Lookahead options:** **fixed 30 / 60 / 90 only** in the UI (`:59`). The API could clamp to 7–90 (`api/muhurat.ts:17`) but **no custom range is exposed**.

### Gemstones (`/gemstones`)
- **Basis:** **Lagna/Ascendant-based** with Yogakaraka + functional-benefic + Shadbala-weakness + Dasha reasoning (`gemstones.ts:99-130`, `:138-139`), explicitly not Rashi-based ("Moon sign (Rashi) alone… a common but less precise shortcut"). A RASHI-only alternative is shown as a labelled lesser option (`:184`).
- **Wearing-ritual detail (metal/finger/day/sizing):** **NONE.** The only ritual-adjacent line is `GemstonePage.tsx:31`: _"A powerful stone — traditionally worn on a short trial before regular wear."_

### Rashi Ratna (`/rashi-ratna`)
- **Basis:** **Moon-sign / Rashi (ruling-planet) based**, static 12-sign lookup, no chart/API (`RashiRatnaPage.tsx:56`: _"determined not by your birth month but by your Rashi (zodiac sign) and its ruling planet"_).
- **Wearing ritual:** **present** — wearingDay, fingerToWear, metalToUse per stone (`:126-134`); **no sizing/carat** field.
- **Relationship to `/gemstones`:** **none — presented as a separate, unrelated tool.** It never mentions `/gemstones` or the Lagna-vs-Rashi distinction; Related Tools (`:187-198`) link to /birthstone, /vedic-zodiac, /moon-sign, /numerology — **not** /gemstones. The two tools can recommend different stones for the same person, with zero cross-reference (and `/gemstones` itself calls the Rashi-only method "less precise").

### Sun vs Moon Sign (`/sun-vs-moon-sign`)
- **Two-way or third element?** **Two-way (Sun/Moon).** Rising sign/Ascendant is named as a needed third element (`:12`, `:59`) but **not covered or computed.**
- **Links to `/vedic-astrology` or a Kundli tool?** **NO** — Related Tools = /moon-sign, /zodiac, /compatibility, /vedic-zodiac (`:17-22`). Despite stressing rising sign matters, it links to no Ascendant/Kundli/birth-chart tool.

### Career Analysis (Vedic) — dropdown item
- **Dropdown label (verbatim):** `Navigation.tsx:61`: `{ path: '/career-report', label: 'Career Analysis (Vedic)', emoji: '💼' }`.
- **Destination:** `/career-report` → `CareerReportPage` (`App.tsx:399`). **Destination H1:** `CareerReportPage.tsx:57`: `"Career Analysis"` (+ "Premium depth" badge); SEO title "Career Analysis Report (Vedic) — 10th House, D10 & Timing".
- **Same feature as any "Career Report" page?** It **is** the career report — there is no separate "Career Report" page; `/career-report` is the one and only. **No mismatch, no broken link.** (Minor cosmetic: dropdown says "Career Analysis (Vedic)", page H1 says "Career Analysis" without "(Vedic)".) It computes 10th house + lord placement/strength, Dasamsa (D10), career Yogas, and real Vimshottari Dasha timing windows — fully deterministic (`careerReport.ts:8`: _"Fully DETERMINISTIC — no LLM — so every fact and date is exact by construction."_).

---

## PART 3 — General route/feature inventory (durable reference)

Source of truth: `<Route>` entries in `src/App.tsx`. Data-backing legend: **Vedic engine** = `/api/*` (Swiss-Ephemeris / Lahiri); **celebrities.json** = static ~3,107-entry dataset; **client compute** = pure JS from the entered date; **static content** = hand-written copy/tables.

### Vedic Astrology
- `/vedic-astrology` — category landing; hero form → `/kundali`; §5 fetches a **live computed** sample chart (Vedic engine).
- `/kundali` — full sidereal birth chart + interpretation (Vedic engine); preview-locked/monetized.
- `/kundali-match` — Ashtakoota Guna Milan compatibility X/36 + doshas (Vedic engine + geocoding).
- `/astrologer` — AI Vedic chat grounded in saved chart, daily-limited (LLM endpoint; auth + admin bypass).
- `/sade-sati` — Saturn Sade Sati windows from real transit (Vedic engine).
- `/muhurat` — auspicious-timing finder by purpose/days (Vedic engine; 3 purposes, no location).
- `/career-report` — deterministic career reading: 10th house, D10, yogas, Dasha timing (Vedic engine).
- `/gemstones` — Lagna-based gemstone suggestion (Vedic profile endpoint + BirthDetailsForm).
- `/rashi-ratna` — **static** Rashi→gemstone tables (no computation).
- `/moon-sign` — Moon sign + nakshatra calculator (**client compute**).
- `/vedic-zodiac` (+`/vedic-zodiac/:rashi`) — sidereal Rashi calculator (solar only; per-rashi pages **static**).
- `/zodiac` (+`/zodiac/:sign`) — Western sun-sign calculator/index (**client compute**; per-sign **static**).
- `/chinese-zodiac` (+`/chinese-zodiac/:animal`) — Chinese zodiac by year (**client compute** + static).
- `/compatibility` (+`/compatibility/:sign1/:sign2`) — Western sun-sign compatibility (**client compute**; explicitly NOT Vedic).
- `/sun-vs-moon-sign` — **static** explainer (two-way).
- `/baby-names` — nakshatra→syllable name suggestions (Vedic engine `/api/vedic-profile` + static tables).
- `/hi/rashifal` (+`/:rashi`) — Hindi daily horoscope (**static**, canned text — see stubs).
- `/diwali-gift` — festive gift landing (**static** + pricing).

### Birthday & Celebrity
- `/celebrity-birthday` — category landing (Part AF; DOB → `/birthday-report?dob=`; celebrities.json).
- `/celebrity`, `/celebrity/{bollywood|cricket|politics|business|music|sports}`, `/celebrity/:slug` — directory + category hubs + profiles (**celebrities.json** + client compute).
- `/birthday`, `/birthday/:month/:day`, `/birthday/:month`, `/birthday/:date` — birthday hub + date/month pages (celebrities + client compute).
- `/todays-birthdays` — celebrities born today (celebrities.json).
- `/born-on`, `/born-on/:slug`, `/born-on/:month/:day` (+`/personality`), `/born-on/india`, `/born-on/:slug/india` — born-on date pages (celebrities.json + static + client compute).
- `/born-in`, `/born-in-<month>`, `/born-in-<sign>` (36 generated) — month/zodiac hubs (celebrities.json + client compute).
- `/age-calculator`, `/age-in-days`, `/age-in-seconds`, `/birthday-countdown`, `/planetary-age`, `/weight-on-planets` — client-compute calculators.
- `/birthstone` (+`/:month`) — **static**.
- `/gift`, `/birthday-report`, `/birthday-report/gift`, `/birthday-report/sample`, `/report/:slug`, `/results`, `/wish` — report builder + purchase + rendered saved report (Supabase entitlement + celebrities + client compute).

### Mystic Corner
- `/mystic-corner` — category landing (Part AG bespoke hub).
- `/numerology` (+`/:number`) — numerology calculator (**client compute**; per-number **static**).
- `/name-numerology` — name→number (**client compute**).
- `/tarot-card-by-birthday` — birth-card from date/life-path (**client compute** + static tables).
- `/numerology-hindi`, `/rashifal-by-date-of-birth` — Hindi variants (**client compute**).
- (`/biorhythm` also exists; grouped by the engine under Science but is mystic-adjacent.)

### Science & Longevity
- `/science-longevity` — category landing (**static**).
- `/life-expectancy` — main multi-factor calculator (**client compute**; large model + country baselines).
- `/longevity-calculator`, `/how-long-will-i-live`, `/biological-age`, `/biological-age-calculator`, `/biological-age-vs-chronological-age` — longevity/bio-age tools (**client compute**).
- `/coach` — Blueprint/coach landing (**static**).
- `/country-comparison` — country LE comparison (**static baselines**, ~54 countries).
- `/generation` — generation-by-year (**client compute**).
- `/biorhythm`, `/biorhythm-workout-calculator`, `/best-day-to-start-a-habit`, `/cycle-syncing-for-men`, `/why-am-i-tired-some-days`, `/best-time-to-work-out`, `/energy-forecast` — biorhythm/rhythm tools (**client compute**).
- Per-country LE landings: `/life-expectancy-{india|usa|japan|uk|australia|canada|germany|china|singapore|brazil}`, `/life-expectancy-india-vs-usa`, `/life-expectancy-calculator-{uk|usa|canada|australia}`, `/life-expectancy-calculator-singapore-uae` — **static** country pages (thin — see stubs).
- Hindi: `/meri-umar-kitni-hai`, `/jivan-kal-calculator`, `/biological-age-hindi`, `/hi/life-expectancy-calculator`, `/hi/numerology-by-date-of-birth`, `/hi/meri-jeevan-pratyasha` — localized wrappers.

### Other / Uncategorized
- `/` (homepage), `/about`, `/pricing`, `/upgrade`, `/auth`, `/profile`, `/admin` (+`/admin/accuracy`), `/how-it-works`, `/methodology` (**redirect** → /how-it-works), `/editorial-policy`, `/privacy`, `/terms`, `/faq`, `/contact`, `/for-business`, `/blog` (+`/:slug`), `/articles` (+~40 SEO articles), `/answers` (+17 Q&A pages), `/leaderboard`, `/family`, `/reminders`, `/embed`, `/widget/age-calculator`, `*` (404).
- `/birthday-fun` — live category landing (belongs under Birthday & Celebrity; shares the `CategoryLandingPage` template).

### Pages that are stubs / placeholders / thinner than peers
- **`/rashi-ratna`** — pure static tables, no computation; thinner than its Vedic-engine peers.
- **`/hi/rashifal` (+`/:rashi`)** — daily "rashifal" is **static canned text** (`rashifalData.ts`), not date-computed; both routes render the same component.
- **`/life-expectancy-calculator-{uk|usa|canada|australia}`** (~2.4–2.6 KB each) — trivial wrappers over `LifeExpectancyCountryTemplate`; near-duplicate SEO pages differing only in country stats.
- **`/diwali-gift`** — static seasonal marketing page, no tool.
- **`/for-business`** — static B2B pitch; CTA is a `mailto:`, no signup flow.
- **`/coach`** — marketing landing only; no calculator.
- **`/vedic-zodiac`** — self-limits to solar rashi only (a lighter `/moon-sign`).
- **`/answers/*`** (17 pages) — static FAQ/schema pages, thinnest content tier (funnel to real calculators).
- **Hindi calculators** (`HindiAgeCalculator`/`HindiBiologicalAge`/`HindiLifeExpectancy`/`HindiNumerology`/`HindiZodiac`) — thin localized wrappers of the English tools.
- Note: `/astrologer`, `/muhurat`, `/career-report`, `/gemstones` are thin *page shells* (real logic in child components/`/api`) — functional, but visibly lighter than `/kundali` and `/kundali-match`.

---

## Highest-leverage findings for the follow-up rewrite
1. **Build (or generalize) one shared term-definition mechanism** — none exists today; the `NAKSHATRA_MEANINGS` keyed-data pattern is the model to extend into a general glossary/tooltip.
2. **Fix the four localized weak spots first:** `/muhurat` (define Yoga/Paksha/Tithi sub-names/Chaughadia), `/kundali` advanced view (D9/D10/D60/pada/virupas), `/sun-vs-moon-sign` (define rising sign + link to a real Ascendant/Kundli tool), `/career-report` (define "Yoga" + add a grade legend).
3. **Define "ayanamsa/sidereal/Lahiri" once, everywhere** — it's the single term unexplained on every Vedic page.
4. **Reconcile `/rashi-ratna` ↔ `/gemstones`** — they silently disagree (Rashi vs Lagna) with no cross-reference.
5. **Feature gaps confirmed for the six tools:** Kundali has no Kaal Sarp section / no Ashtakvarga / no remedies; Sade Sati has no upay; Muhurat has 3 occasions, no location, fixed 30/60/90; Gemstones has no wearing-ritual detail; Sun-vs-Moon omits Ascendant and any Kundli link.

_No files were changed in this audit._
