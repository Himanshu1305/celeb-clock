# B20 report — 27 November 2026

Prompt: `docs/B20-PROMPT.md`. Branches `b20-ml`, `b20-festivals`, `b20-accuracy` → `b20` → `main` (deployed as 3539395; `develop` synced).

## What shipped

1. **Malayalam review sheet + Kerala porutham**
   - `docs/review/malayalam-review.xlsx` (and `.csv`): 600 Malayalam strings, each with its English meaning, on sheets Kundali, Matching, Rashifal, Panchang and Common. The reviewer marks Y/N and writes corrections. `scripts/import-ml-review.py` reads the sheet back.
   - Kerala Dashakoota scoring (`src/lib/vedic/poruthamKerala.ts`). Scores are 1, ½ or 0 per porutham; the rules were mapped from ProKerala's Kerala calculator.
   - `/ml/jathaka-porutham/` now shows Kerala by default, with a Kerala/Tamil toggle. The Tamil page and the Tamil scoring are unchanged.
   - `/api/kundali-match` also returns `poruthamKerala`.
2. **Holi and Diwali 2027** (English + Hindi), shown on the holi, holika-dahan, diwali and dhanteras pages:
   - Holika Dahan muhurat with Bhadra Punchha and Mukha.
   - Lakshmi Puja: Pradosh ∩ Vrishabha ∩ Amavasya. Mahanishita: Nishita ∩ Simha ∩ Amavasya.
   - Dhanteras muhurat.
   - A table of the five days of Diwali.
   - Tables for 10 cities.
   - `.ics` calendar links.
   - Computed FAQs.
   - The values are precomputed into `muhurat2027.data.json` (a test keeps that file in sync with the engine).
3. **Swiss Ephemeris accuracy**
   - Panchang for New Delhi, every day of 2027.
   - Varshphal for 24 charts × 2026 and 2027.
   - Both are published on `/accuracy` as rows `panchang-swiss` and `varshphal`, next to `porutham-kerala`.
4. **Share card.** The prerender used to replace every page's share image with the default card. It now keeps the image the page asks for (e.g. `/og/vedic.png`) when the route has no card of its own and the file exists. This applies to all vedic pages, not only the new ones.

## Reference comparisons

| Check | Reference | Compared | Result |
|---|---|---|---|
| Kerala porutham | ProKerala Kerala calculator | 12 couples × 10 | **120 / 120** same score |
| Kerala porutham sweep | ProKerala | 223 pairs × 10 (every star and sign) | **2230 / 2230** |
| Papasamyam | ProKerala | 12 couples, 8 planet rows each, plus verdict | all match |
| Holika Dahan 2027 | Drik Panchang (New Delhi) + city table via hindutone | 9 cities | within 1–2 min |
| Dhanteras 2027 | Drik Panchang | muhurat, Pradosh, Vrishabha | within 1 min |
| Lakshmi Puja 2027 | AstroSage (Drik's page could not be read) | muhurat, Pradosh, Vrishabha, Nishita, Simha | within 3 min; AstroSage's convention runs about 2 min later |
| Panchang 2027, New Delhi | Swiss Ephemeris (Drik ayanamsa) | 365 days × 6 times = 2190 | **2190 / 2190 within 1 min** (worst 1 min) |
| Kshaya and vriddhi tithis 2027 | Swiss Ephemeris | every such day | same days |
| Varshphal | Swiss Ephemeris | 24 charts × 2 years = 48 | **48 / 48** same yearly Lagna and Muntha; year start within 1 s (worst 0.98 s) |

### Open differences

- **Lakshmi Puja vs AstroSage:** about +2 min, because AstroSage uses a different lagna-boundary convention. This is documented in the reference file; F1 allows it with that reason.
- **Mumbai, Pune and Ahmedabad Lakshmi Puja:** Amavasya ends at 19:06, so the Pradosh + Vrishabha window is short or empty there. The city table shows a "Pradosh while Amavasya lasts" column instead of inventing a window.
- **No engine was changed** for parts 1 or 3; none was needed.

## Test scenarios

| ID | Scenario | Result |
|---|---|---|
| K1 | 12 couples × 10 vs ProKerala | Pass (120/120) |
| K2 | each porutham has 0 / ½ / 1 cases | Pass |
| K3 | same-star couple | Pass |
| K4 | girl/boy swap | Pass |
| K5 | total 0–10 in ½ steps, never NaN | Pass |
| K6 | Papasamyam rows and verdict | Pass |
| K7 | Tamil porutham unchanged | Pass |
| M1 | export covers every Malayalam key (600 rows) | Pass |
| M2 | no empty Malayalam or English, IDs unique | Pass |
| M3 | untouched import = 0 changes; one edit = 1 change | Pass |
| F1 | times vs Drik / AstroSage | Pass (differences listed above) |
| F2 | Holika muhurat inside Purnima, outside Bhadra | Pass |
| F3 | Lakshmi Puja ⊆ Pradosh ∩ Vrishabha; Mahanishita ⊆ Simha | Pass |
| F4 | lagna windows vs Swiss | Pass |
| F5 | five-day table in order, same as festival engine | Pass |
| F6 | 10 city rows, distinct sunsets, Mumbai later than Kolkata | Pass |
| F7 | `.ics` valid, UTC times equal the IST muhurat | Pass |
| F8 | no template leftovers; Hindi pages `lang="hi"` | Pass |
| F9 | FAQ schema equals the visible FAQ | Pass |
| A1 | Panchang 2190 times | Pass |
| A2 | kshaya and vriddhi tithis | Pass |
| A3 | Varshphal counts equal `COUNTS` | Pass (48 charts within 1 s, not just 44 within 1 min as the prompt asked) |
| A4 | `/accuracy` rows read `COUNTS` | Pass |
| E1 | `/ml/` couple → Kerala scores equal fixture; Tamil toggle; reload keeps Kerala | Pass (375 and 1280) |
| E1b | Tamil page has no Kerala toggle | Pass |
| E2 | missing time or future date: button stays disabled, no errors | Pass |
| E3 | Holi and Diwali EN: H1, muhurat, 5-day table, 10 cities, FAQ toggle, `.ics` | Pass |
| E4 | same for `/hi/`, hreflang both ways | Pass |
| E5 | `/accuracy` new rows with numbers | Pass (3 new rows; the prompt said four, but only three were specified) |
| E6 | no first-party console errors or 404s; og:image `/og/vedic.png` is `image/png` | Pass. Found and fixed the og:image bug (see "Share card" above). |
| E7 | Lighthouse mobile, Holi and Diwali | Pass: SEO 100, Accessibility 100, CLS 0 / 0.04 |
| E8 | structured data in prerendered HTML | Event, FAQPage and BreadcrumbList present. The live Rich Results Test is for the owner, because Google's tool can't be reached from here. |
| L1–L4 | production | see below |

### Test runs

- **Full suite:** vitest 350 files, 5335 tests passed. App typecheck is clean; the only type errors are in `guideMeta.test.ts`, which already had them on `main`. `build:app` passes.
- **Browsers and widths:** E1–E7 ran in Chromium at 375 and 1280 px against a local served copy (`scripts/b20-local-serve.mts`, which uses the real API handler). Firefox and WebKit are not installed in this environment, so they did not run.
- **Prerender:** only the 9 B20 routes were prerendered locally; the full prerender runs in the deploy Action.
- **Screenshots:** `docs/b20/`.

To run the end-to-end tests again:

```
npx tsx scripts/b20-local-serve.mts 4321 &
BASE_URL=http://localhost:4321 npx playwright test -c playwright.b20.config.ts
BASE_URL=https://bornclock.com npx playwright test -c playwright.b20.config.ts   # production
```

## Live checks

Checked on bornclock.com on 27 Nov 2026, after deploy run 45987341250 went green.

- **First deploy attempt:** it failed on M3, because the deploy runner has no `openpyxl`. Production stayed on the old version. M3 now skips when that library is missing, and the second run deployed.

| ID | Result |
|---|---|
| L1 | Pass. All four festival URLs (plus holika-dahan and dhanteras) return 200 with the muhurat section, the city table, Event, FAQPage and BreadcrumbList data, and `og:image` set to `/og/vedic.png`. `/og/vedic.png` returns 200 `image/png` (149,882 bytes). |
| L2 | Pass. `/ml/jathaka-porutham/` opens on Kerala; the Tamil toggle shows the Tamil card and switches back. `/ta/jathaga-porutham/` has no Kerala toggle. |
| L3 | Pass. `/accuracy/` (updated 27 November 2026) shows the `porutham-kerala`, `panchang-swiss` and `varshphal` rows. The sitemaps list all four festival URLs. |
| L4 | Pass. Couple 1 entered in the production form (groom 8 Jul 1992 18:15, bride 14 Mar 1995 10:30, both Ujjain) gave Kerala total 2.5. All 10 scores match ProKerala: Dina 0, Gana 0, Mahendra 1, Stree Deergha 0, Yoni 0, Vedha 1, Rajju ½, Rasi 0, Rasiyathipathi 0, Vasya 0. |

- **Re-check:** `/accuracy/` serves `og:image` `/og/vedic.png` on production. The earlier default-card reading came from a cached copy.

## Owner's actions

1. Send `docs/review/malayalam-review.xlsx` to the Malayalam reviewer. When it comes back, `python3 scripts/import-ml-review.py <file>` lists the changes.
2. In Search Console, request indexing for:
   - https://bornclock.com/festivals/2027/holi/
   - https://bornclock.com/festivals/2027/diwali/
   - https://bornclock.com/hi/festivals/2027/holi/
   - https://bornclock.com/hi/festivals/2027/diwali/
