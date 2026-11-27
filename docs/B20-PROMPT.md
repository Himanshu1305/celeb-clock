# B20 — Malayalam review + Kerala porutham · Holi & Diwali 2027 · Swiss Ephemeris accuracy (Panchang, Varshphal)

Repo: Himanshu1305/celeb-clock (BornClock, bornclock.com). Read this whole file before writing code.
Branches: one per part (`b20-ml`, `b20-festivals`, `b20-accuracy`) from `origin/main`, merged into `b20`.
The owner is non-technical: he must never be the first real test. Everything below is verified by you
before it reaches production.

---

## 0. Standing rules (every part)

1. **Facts.** Dates, times and rules come from the app's own engines and are cross-checked against a
   named reference: Drik Panchang (New Delhi), ProKerala, or Swiss Ephemeris (pyswisseph, pinned
   version). Store every reference value in a golden JSON with source URL and fetch date. If the
   reference disagrees, record it — never hand-edit a number or tune a rule to pass a fixture
   without a written, sourced rule behind it.
2. **No invention.** No made-up rituals, quotes, statistics, testimonials, user counts or reviews.
   Cultural/ritual text cites a source in a code comment (URL + date fetched).
3. **Tone.** Plain, warm, short sentences; no fear words ("danger", "bad luck", "deadly dosha").
   Match the existing festival and matching pages.
4. **Pages.** Prerendered; in the sitemap; canonical + hreflang (en/hi, or ml/ta as relevant);
   breadcrumb; FAQ schema; share image `https://bornclock.com/og/vedic.png`; no hard-coded hex
   colours; works at 375px and 1280px; no layout shift from late-loading tables.
5. **Don't touch:** Resend/email, DNS, payments, Gemini keys, auth, the nightly workflow,
   celebrity data.
6. **Quality gate (each part and at the end):** `npm run typecheck` = 0 errors;
   full `npx vitest run` green; `npm run build:app` succeeds; prerender of changed routes succeeds.

---

## Part 1 — Malayalam review sheet + Kerala-rules porutham

### 1a. Review sheet for a native Malayalam speaker

`scripts/export-ml-review.mjs` → `docs/review/malayalam-review.xlsx` (+ `.csv`). One row per
user-visible Malayalam string:

| ID | Page URL(s) | Malayalam (current) | English meaning | Context | Correct? (Y/N) | Suggested Malayalam | Notes |

- Sources: `src/lib/lang/copy/ml.ts`, `src/lib/lang/vocab/ml.js`, Malayalam strings in
  `src/pages/lang/**`, and generated labels (rashi, nakshatra, porutham names, table headers) as
  rendered on the live `/ml/` pages.
- First sheet "How to review": 5 short lines in English. Then one sheet per group: Kundali,
  Matching, Rashifal, Panchang, Common. Header row frozen, text wrapped, sensible widths.
- `scripts/import-ml-review.mjs` reads the filled sheet back and prints a diff of suggestions.
  It must not change any file.

### 1b. Kerala-rules porutham on the Malayalam matching page

Today `/ml/` matching uses the Tamil 10-porutham rules plus Kerala Papasamyam, with a method note
saying Kerala rules differ. Add a real Kerala mode.

**Ground truth:** `src/lib/vedic/__tests__/golden/prokeralaKerala.json` — 13 couples from
ProKerala's Kerala calculator (`/astrology/jathaka-porutham.php`), 23 Nov 2026. Per couple:
- `g` = **girl** birth `[Y,M,D,h,m,am/pm]`, `b` = **boy** birth. Both born in **Ujjain**
  (lat 23.1765, lon 75.7885, IST) — same as `prokeralaPorutham.json`.
- `nak` = the two nakshatras (confirm which is girl/boy by recomputing).
- `por` = ProKerala score per porutham: 1 full, 0.5 partial/medium, 0 not.
- `papa` = 8 rows `planet,houseFromLagna,counted,houseFromMoon,counted,houseFromVenus,counted`
  (confirm which 4 rows are girl vs boy by recomputing); `pv` = whose papa is higher.

**Work:**
1. Research the Kerala rules from at least two published sources (ProKerala's Kerala porutham
   help, and reputable Kerala jyotisha summaries). Check — do not assume — the partial (0.5)
   cases for Dina, Gana, Yoni, Rasi, Rasiyathipathi, Rajju, Vedha, Vasya, Mahendra, Stree Deergha.
2. `src/lib/vedic/poruthamKerala.ts` → `calculatePoruthamKerala(girl, boy)` returning per
   porutham `{ key, score: 0 | 0.5 | 1, reason }` and `total` out of 10.
3. Target: agree with ProKerala on all 130 scores (13 × 10). Remaining differences are listed in
   the test and shown on `/accuracy` with the rule each school uses.
4. Re-check Papasamyam against the `papa` rows (houses, counted flags, `pv`).
5. UI on the Malayalam matching page: Kerala results by default, a toggle "തമിഴ് രീതി" (Tamil
   rules). Tamil page unchanged. Remove "Kerala rules differ" from the method note and FAQ once
   live; add one FAQ explaining partial scores.
6. `/accuracy`: new row `porutham-kerala` with real counts in `COUNTS`.

---

## Part 2 — Holi 2027 and Diwali 2027 (English + Hindi)

Expand `/festivals/2027/holi/`, `/festivals/2027/diwali/`, `/hi/festivals/2027/holi/`,
`/hi/festivals/2027/diwali/`. Keep URLs, H1 pattern and Event schema (now with image + free offer).
Search targets: "holi 2027 date", "holika dahan 2027 muhurat", "diwali 2027 date",
"lakshmi puja muhurat 2027", "dhanteras 2027 muhurat".

**Holi** (engine values for New Delhi, cross-checked with Drik Panchang):
- Holika Dahan date + muhurat (Pradosh kaal while Purnima lasts, avoiding Bhadra). Show Bhadra
  start/end and Bhadra Punchha/Mukha if supported; otherwise state the rule used.
- Rangwali Holi (Dhulandi) date; Purnima start/end.
- City table (own sunset each): New Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad,
  Ahmedabad, Pune, Jaipur, Lucknow.
- Short sourced sections: what Holika Dahan marks; regional names and dates (Dol Jatra, Basant
  Utsav, Lathmar Holi, Shigmo, Phagwah); playing safely with natural colours.

**Diwali:**
- Five-day table: Dhanteras, Narak Chaturdashi, Lakshmi Puja, Govardhan Puja, Bhai Dooj —
  date + tithi start/end.
- Lakshmi Puja muhurat = Pradosh kaal ∩ Sthir lagna (Vrishabha). Also show Pradosh kaal,
  Vrishabha lagna window, Nishita kaal, Mahanishita (Simha lagna). If no lagna-window helper
  exists, build it on the ascendant engine and test it against Swiss Ephemeris.
- Same 10-city Lakshmi Puja muhurat table; Dhanteras purchase muhurat (Pradosh + Trayodashi).
- Sourced short sections: meaning of each day; regional differences (Kali Puja in Bengal the same
  night; Naraka Chaturdashi as the main day in much of South India).

**Both:** an "Add to calendar" `.ics` for the main muhurat (correct IST → UTC, 1 VEVENT);
6–8 FAQs filled from computed values via `{d:slug}`-style fillers (no hard-coded dates);
internal links to Panchang, Hindu calendar 2027, Pradosh Vrat 2027, Diwali gift report.

**Reference file:** fetch Drik Panchang's 2027 Holi and Diwali pages for New Delhi (and 3 other
cities for the city tables) and save to `src/lib/year2027/__tests__/golden/holiDiwali2027Drik.json`.

---

## Part 3 — Swiss Ephemeris accuracy: Panchang and Varshphal

Already Swiss-checked (see `src/lib/accuracy/evidence.ts`): Kundali, dasha, vargas, Moon sign,
Sade Sati. Add the two engines that are not:

**3a. Panchang at scale.** New Delhi, all 365 days of 2027: sunrise, sunset, end times of tithi,
nakshatra, yoga, karana. Reference generator `golden/panchangSwiss_ref.py` (pattern of
`skySwiss_ref.py`; pyswisseph pinned; SIDM_LAHIRI or the app's exact ayanamsa; sunrise convention
matched to the app's and stated) → `golden/panchangSwiss2027.json`.

**3b. Varshphal.** The 22 births in `goldenCharts.json`, years 2026 and 2027: solar-return instant
(Sun back to natal sidereal longitude), annual ascendant, Muntha sign.

Publish on `/accuracy`: rows `panchang-swiss` and `varshphal`, real counts in `COUNTS`, test month
updated, re-run by `accuracyEvidence.test.ts`. Fix an engine only for a genuine bug, and say so.

---

## 4. Testing scenarios (all must be written and passing)

### Unit / data tests (vitest)

**Kerala porutham** (`poruthamKerala.test.ts`, `prokeralaKerala.test.ts`)
- K1 All 13 couples × 10 poruthams vs ProKerala: report agree count; expect = `COUNTS`.
- K2 Each porutham with at least one 0, one 0.5 (where the rule allows) and one 1 case.
- K3 Same nakshatra couple (e.g. couple 12, Chitra–Chitra): Dina/Rajju/Vedha handled per rule.
- K4 Girl/boy swap gives the documented result (direction-sensitive poruthams change; symmetric
  ones don't).
- K5 Total is always 0–10 in 0.5 steps; never NaN.
- K6 Papasamyam vs `papa` rows: all 8 planet rows × 3 references match; `pv` matches.
- K7 Tamil `calculatePorutham` results are byte-for-byte unchanged (regression).

**Malayalam sheet**
- M1 Export covers every key in `copy/ml.ts` and `vocab/ml.js` (count = row count).
- M2 No row has empty Malayalam or empty English meaning; IDs unique.
- M3 Import of an untouched export reports 0 changes; a sheet with one edited cell reports exactly 1.

**Holi / Diwali**
- F1 Every displayed time vs `holiDiwali2027Drik.json`: within 2 minutes, or listed as a known
  convention difference with reason.
- F2 Holika Dahan muhurat never overlaps Bhadra and lies inside Purnima.
- F3 Lakshmi Puja muhurat ⊆ Pradosh kaal ∩ Vrishabha lagna; Mahanishita ⊆ Simha lagna.
- F4 Vrishabha/Simha lagna windows vs Swiss Ephemeris ascendant: start/end within 1 minute.
- F5 Five-day table dates in strictly increasing order and match the existing festival engine.
- F6 City tables: 10 rows, each sunset differs, Mumbai later than Kolkata.
- F7 `.ics`: valid VCALENDAR, one VEVENT, DTSTART/DTEND in UTC equal to the IST muhurat.
- F8 No literal `{d:` left in rendered text; Hindi pages are Devanagari with `lang="hi"`.
- F9 FAQ schema present and its answers equal the visible FAQ text.

**Accuracy**
- A1 Panchang: 365 × 6 values compared; counts within 1 and 2 minutes = `COUNTS`; worst 5 logged.
- A2 Day with a skipped tithi and a day with a repeated (vriddhi) tithi in 2027 handled correctly.
- A3 Varshphal: 44 solar returns within 1 minute; ascendant and Muntha signs identical.
- A4 `/accuracy` rows render with the counts from `COUNTS` (no hard-coded numbers in JSX).

### End-to-end (Playwright, new spec `e2e/b20.spec.ts`, run on staging AND local prerender)

Run in Chromium, Firefox and WebKit, at 375×812 and 1280×800:
- E1 `/ml/` matching: enter a couple from the fixture → Kerala scores shown and equal the
  fixture; toggle to Tamil → Tamil scores shown; toggle back; reload keeps Kerala default.
- E2 `/ml/` matching with invalid input (missing time, future date): friendly error, no crash.
- E3 `/festivals/2027/holi/` and `/diwali/`: H1, muhurat block, 5-day table (Diwali), 10-row city
  table, FAQ open/close, `.ics` download returns `text/calendar`.
- E4 Same for both `/hi/` pages; hreflang pair present both ways.
- E5 `/accuracy`: the four new rows visible with numbers.
- E6 No console errors; no 404 network requests; `og:image` → `/og/vedic.png` returns `image/png`.
- E7 Lighthouse (mobile) on the two English festival pages: SEO ≥ 95, Accessibility ≥ 95,
  CLS ≤ 0.1.
- E8 Google Rich Results check of each festival URL (or its local HTML): Event + FAQ + Breadcrumb
  valid; record any warnings.

### Live checks after deploy (production)
- L1 The four festival URLs return 200, show the new sections, and match staging.
- L2 `/ml/` matching shows Kerala by default; Tamil page `/ta/` unchanged (compare with a
  pre-deploy screenshot).
- L3 `/accuracy` shows the new rows; `sitemap.xml` lists the four festival URLs.
- L4 One full E1 run against production.

---

## 5. Integration, deploy, report

1. Merge the three part branches into `b20`; run the full quality gate + all of section 4 except
   L-checks; save screenshots to `docs/b20/`.
2. Fast-forward `main` to `b20`, push, watch the GitHub Action to green, then sync `develop`:
   `git checkout --detach origin/develop && git merge origin/main && git push origin HEAD:refs/heads/develop`.
3. Run L1–L4 on production.
4. `docs/B20-REPORT.md`: what shipped; a table of every test scenario ID with pass/fail; every
   reference comparison with counts; open differences and why; the review-sheet path; and the
   owner's 2 actions (send the sheet to the Malayalam reviewer; request indexing for the four
   festival URLs in Search Console).

**Done means:** every scenario in section 4 passes (or a difference is documented with its rule),
production checks L1–L4 pass, and the report is committed.
