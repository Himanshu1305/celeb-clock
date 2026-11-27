# B20 — Malayalam review + Kerala porutham, Holi & Diwali 2027, Swiss Ephemeris accuracy

Repo: Himanshu1305/celeb-clock (BornClock, bornclock.com). Work on branch `b20` from `origin/main`.
Do all three parts, then one integration branch, then deploy. Read this whole file first.

## Standing rules (apply to every part)

- Verify every fact yourself before using it. Dates, times and rules come from the code's own
  engines, cross-checked against a named reference (Drik Panchang for New Delhi, ProKerala,
  Swiss Ephemeris). If a reference disagrees, record the difference — never hide it, never hand-edit
  a number to make it match.
- No invented rituals, quotes, statistics, testimonials or user counts. Cite sources in code comments
  (URL + date fetched).
- Tone: plain, warm, no fear words (dosha "danger", "bad luck", etc.). Same rules as existing pages.
- Every new page: prerendered, in the sitemap, canonical + hreflang, breadcrumb, FAQ schema,
  share image `https://bornclock.com/og/vedic.png`, no hard-coded hex colours, mobile at 375px.
- Tests for everything new. `npm run typecheck` and the full `npx vitest run` must pass.
- Do not touch Resend, email, DNS, payments, Gemini keys or the nightly workflow.

---

## Part 1 — Malayalam review sheet + Kerala-rules porutham

### 1a. Review sheet for a native Malayalam speaker

Build `scripts/export-ml-review.mjs` that writes `docs/review/malayalam-review.xlsx` (and a `.csv`
copy). One row per user-visible Malayalam string on the site:

| Column | Content |
|---|---|
| ID | stable key (file + path, e.g. `copy/ml.ts:south.papa.title`) |
| Page | the live URL(s) where it appears |
| Malayalam (current) | the exact text |
| English meaning | what it is meant to say, in plain English |
| Context | where on the page (heading, button, FAQ answer, table label…) |
| Correct? (Y/N) | blank — for the reviewer |
| Suggested Malayalam | blank — for the reviewer |
| Notes | blank — for the reviewer |

Sources: `src/lib/lang/copy/ml.ts`, `src/lib/lang/vocab/ml.js`, and any Malayalam strings in
`src/pages/lang/**`, plus generated strings (nakshatra/rashi/porutham names) as they render.
Freeze the header row, wrap text, set sensible column widths, one sheet per page group
(Kundali, Matching, Rashifal, Panchang, Common). Add a first "How to review" sheet in simple
English (5 lines). Also write `scripts/import-ml-review.mjs` that reads the filled sheet back and
prints a diff of suggested changes (do not auto-apply).

### 1b. Kerala-rules porutham on the Malayalam matching page

Today the Malayalam page uses the Tamil 10-porutham rules plus Kerala Papasamyam, and its method
note says Kerala rules differ. Add a real Kerala mode.

- Ground truth: `src/lib/vedic/__tests__/golden/prokeralaKerala.json` — 13 couples run through
  ProKerala's **Kerala** porutham calculator (fetched 23 Nov 2026).
  Format per couple: `g` = boy birth [Y,M,D,h,m,am/pm], `b` = girl birth, `nak` = [boy, girl]
  nakshatra, `por` = ProKerala's score per porutham (1 = full, 0.5 = partial/medium, 0 = not),
  `papa` = 8 rows `planet,houseFromLagna,counted,houseFromMoon,counted,houseFromVenus,counted`
  (first 4 rows boy, last 4 girl), `pv` = whose papa is higher. Births are in IST; use the same
  place the existing ProKerala porutham test uses (check `prokeralaPorutham.test.ts`).
- Research the Kerala rules from at least two published sources (e.g. ProKerala's Kerala porutham
  help page, Kerala jyotisha texts summarised by reputable sites). Key known differences to check,
  not assume: partial (0.5) results for Dina, Yoni, Rajju, Rasi, Stree Deergha; Rasi counted with
  6-8 / 2-12 exceptions when lords are friends; Vasya table; Mahendra and Stree Deergha counts.
- Implement `src/lib/vedic/poruthamKerala.ts` (`calculatePoruthamKerala(boy, girl)`), returning per
  porutham: met / partial / not, plus a total out of 10 with halves.
- Target: match ProKerala on all 130 porutham checks (13 × 10). If a rule cannot be pinned down,
  list the remaining differences in the test and on the accuracy page — never tune to the fixture
  without a written rule behind it.
- Also re-check our Papasamyam against the `papa` rows (houses, counted flags, and `pv`).
- UI: on `/ml/` matching, show Kerala results by default with a small toggle "Tamil rules";
  Tamil page unchanged. Update the Malayalam method note and FAQ (remove "Kerala rules differ"
  once Kerala mode is live). Test IDs: `lkm-porutham-kerala`, `data-score` on each row.
- Accuracy page: new row `porutham-kerala` with the real agreement count vs ProKerala Kerala.

---

## Part 2 — Holi 2027 and Diwali 2027 pages (English + Hindi)

Expand `/festivals/2027/holi/` and `/festivals/2027/diwali/` (and their `/hi/` versions) into the
best pages on the web for "holi 2027 date", "holika dahan 2027 muhurat", "diwali 2027 date",
"lakshmi puja muhurat 2027". Keep the existing URL, H1 pattern and Event schema.

Holi page must add, all computed by our engine for New Delhi then cross-checked against Drik Panchang:
- Holika Dahan date and muhurat (Pradosh kaal while Purnima lasts, avoiding Bhadra; show Bhadra
  start/end, Bhadra Punchha / Mukha if the engine supports it — otherwise say what rule is used).
- Rangwali Holi (Dhulandi) date; Purnima start/end.
- City table: Holika Dahan muhurat for New Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad,
  Ahmedabad, Pune, Jaipur, Lucknow (each with its own sunset).
- Short, sourced sections: what Holika Dahan marks, regional names (Dol Jatra, Basant Utsav,
  Lathmar Holi, Shigmo, Phagwah) with dates where they differ, how to play safely (natural colours).

Diwali page must add:
- Five-day table: Dhanteras, Narak Chaturdashi, Lakshmi Puja, Govardhan Puja, Bhai Dooj — date +
  tithi start/end each.
- Lakshmi Puja muhurat = Pradosh kaal overlapping Sthir lagna (Vrishabha); also Pradosh kaal,
  Vrishabha lagna window, Nishita kaal and Mahanishita (Simha lagna) times. If the Vrishabha-lagna
  calculation does not exist, build it from the ascendant engine and test it against Swiss.
- City table of Lakshmi Puja muhurat for the same 10 cities.
- Dhanteras purchase muhurat (Pradosh with Trayodashi) on that section.
- Sourced short sections: meaning of each day, regional differences (Kali Puja in Bengal the same
  night, South India Naraka Chaturdashi as main day).

Both: an "Add to calendar" (.ics) link for the main muhurat; FAQ 6–8 questions answered with the
computed values (no hard-coded dates — use `{d:slug}` style fillers); internal links to the
Panchang, Hindu calendar 2027, Pradosh Vrat 2027, Diwali gift report.

Verification: fetch Drik Panchang 2027 Holi and Diwali pages for New Delhi; every time we show
must be within 2 minutes or explained. Save the reference values in
`src/lib/year2027/__tests__/golden/holiDiwali2027Drik.json` with fetch date, and test against it.

---

## Part 3 — Swiss Ephemeris accuracy for Panchang and Varshphal

Kundali, dasha, vargas, moon sign and Sade Sati are already checked against Swiss Ephemeris
(see `src/lib/accuracy/evidence.ts`). Two engines are not yet:

3a. **Panchang at scale.** For New Delhi, every day of 2027 (365 days): sunrise, sunset, and the
end time of tithi, nakshatra, yoga and karana. Reference: pyswisseph (pin the version, SIDM_LAHIRI,
same ayanamsa mode the app uses; sunrise = upper limb with refraction — match the app's
convention and state it). Write the reference generator as `golden/panchangSwiss_ref.py`
(like `skySwiss_ref.py`) and its output `golden/panchangSwiss2027.json`. Test: count how many of
the 365 × 6 values are within 1 minute and 2 minutes; report the worst 5 with dates.

3b. **Varshphal (Tajik annual chart).** For the 22 births already in `goldenCharts.json`, years
2026 and 2027: the solar-return instant (Sun back to its natal sidereal longitude), annual
ascendant, and Muntha sign. Reference: pyswisseph. Target: return instant within 1 minute,
ascendant and Muntha sign identical.

Publish both on `/accuracy`: new rows `panchang-swiss` and `varshphal`, real counts in `COUNTS`,
test month updated, and the existing `accuracyEvidence.test.ts` pattern re-running them. If any
value fails, show the real number; fix the engine only if the cause is a genuine bug, and say so
in the report.

---

## Integration, deploy, report

1. Merge parts into `b20`, run typecheck + full vitest + `npm run build:app`, then the prerender
   for the changed routes, and check them in Playwright at 375px and 1280px (screenshots in
   `docs/b20/`).
2. Fast-forward `main` to `b20`, push, watch the GitHub Action to green, then sync `develop`
   (`git checkout --detach origin/develop && git merge origin/main && git push origin HEAD:refs/heads/develop`).
3. Live check: the four festival URLs, `/ml/` matching (Kerala default + Tamil toggle),
   `/accuracy` new rows, `/og/vedic.png` returns `image/png`.
4. Write `docs/B20-REPORT.md`: what shipped, every reference comparison with counts, any open
   differences, the review-sheet location, and the 3 things the owner must do (send the sheet to
   the reviewer, request indexing for the four festival URLs, nothing else).
