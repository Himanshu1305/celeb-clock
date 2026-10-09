# Growth P4 — Reach — Report

**P4 COMPLETE: YES**

Every P4 master item (1–5) and every P4 improvement item in
`docs/growth-improvements.md` (P4-WESTERN-CHART, P4-TAROT-INTERACTIVE, P4-CZ-YEARLY,
P4-CELEB-BIRTHTIME, NB4-RANK, P4-BIRTHDAY-EVENTS, NB-DEATHS, P4-LANG) is **done and
verified to Rules 4–6**, or deliberately scoped to the person where a real-world
dependency (a licensed celebrity birth-time dataset, Telugu scope + translation
sign-off, a licensed celebrity-bio/DOB source) makes that the honest outcome.
Nothing touched production, `main`, `develop`, or a Cloudflare token; no
`wrangler deploy`; all work is on `growth`, committed and pushed per item.

---

## Environment & constraints (read this first)

- **No live preview upload was possible in this environment** (same as P3): the local
  Cloudflare OAuth token has only `account:read` / `user:read`, not `Workers Scripts:Edit`,
  so `wrangler versions upload --env staging` cannot run here.
  **Alternative evidence (Rule 4):** every real-use check below ran against the *exact
  built staging artifact* (`npm run build:staging` → `dist/` + `functions/_worker.ts`)
  served locally by `wrangler dev --env staging --local` (Miniflare) — the same bundle a
  preview would serve, with the real, **unmocked** `/api/*` and the **live** Wikipedia
  REST feed. Uploading to `bornclock-staging` is a one-command step for the person (or
  grant the token Workers:Edit). See "Needs the person".
- **System load** before the build/measurements was 1.30 (half of 8 cores = 4.0), so no
  waiting was required (Rule 3).
- **Reference date** for date-computed pages: 2026-10-09 (today). Year-based pages (CZ
  horoscope) compute "this year & next" = 2026 & 2027 at render time.

---

## Items built (with evidence)

### Master 1 — Full Western birth chart  ✅ (P4-WESTERN-CHART, `ba0af55`)
Full tropical natal chart — Sun / Moon / Rising + houses + major aspects with
plain-language interpretations at `/western-birth-chart`. (Landed earlier in P4;
re-verified in this run's regression crawl → 200, axe-clean.)

### Master 2 — Celebrity Kundlis + honest birth-time reliability note  ✅ (P4-CELEB-BIRTHTIME, `28f5244`)
- New `src/data/celebrityBirthTimes.ts` is the **single source of truth** for which
  celebrities have a trustworthy recorded birth time: a Rodden-rating → reliability map
  (`AA`/`A` → reliable, `B`/`C` → approximate, `DD`/`X`/`XX`/none → **unknown**) plus
  `canRenderTimeDependent()` (requires a verified time **and** a birthplace).
- **Ships EMPTY on purpose (Rule 8).** We never fabricate a birth time or source. Every
  celebrity therefore reads honestly **"birth time: not on record"**, and the new
  `CelebrityBirthTimeNote` **gates** the time-dependent chart (Nakshatra, Ascendant/Lagna,
  houses, Dasha) so it can only ever render with a verified time + place. Replaces the old
  bare `NakshatraPlaceholder` on `/celebrity/:slug`.
- **Real-use (built artifact):** `/celebrity/virat-kohli` →
  `🌙 Vedic birth chart & birth time · Birth time: not on record · "A genuine Vedic Kundli
  for Virat Kohli would need their exact birth time and place…"`.
- A verified, licensed birth-time dataset (Rodden-rated) = **Needs the person**.

### Master 3 — "What happened on your birthday" via Wikimedia + famous deaths  ✅ (P4-BIRTHDAY-EVENTS + NB-DEATHS, `80a3402`)
- New `/on-this-day` hub (today, computed **in-browser**) + evergreen
  `/on-this-day/:month/:day` showing notable **events**, **births** and **deaths** for the
  date, fetched **at request time** from Wikipedia's public "On this day" REST feed, with
  **CC BY-SA 4.0 attribution** and per-item source links. `src/services/wikimediaOnThisDay.ts`
  degrades silently (empty + `failed:true`) on any network error — never a hang/crash;
  7-day localStorage cache; only a populated response is cached.
- Dated pages are **not prerendered per date (Rule 13)** — only the hub is prerendered +
  in the sitemap; dated pages are registered in the worker 404 validator.
- **NB-DEATHS:** the events + deaths sections are also embedded on `/born-on/:month/:day`
  (births are already the celebrity list there), and the born-on index cross-links the hub.
- **Real-use (built artifact + live feed):** `/on-this-day/may/13` →
  feed rendered, **12 events, 12 deaths**, attribution = *"Historical events, births and
  deaths from Wikipedia, licensed under CC BY-SA 4.0 · Wikipedia — On this day · CC BY-SA 4.0"*.

### Master 4 — Interactive tarot + Chinese zodiac yearly forecast  ✅ (P4-TAROT-INTERACTIVE `000cfc0`; P4-CZ-YEARLY `c06728b`)
- **Tarot** (earlier in P4): daily card + yes/no + love spread, user draws cards,
  position- and question-aware interpretations. Re-verified 200 + axe-clean this run.
- **CZ yearly forecast:** `/chinese-horoscope[/:animal]` — per-animal forecast
  (career/finance/love/health) for **this year and next**, computed from the animal's
  traditional relationship to each year's ruling animal (San He trine allies, Liu He
  secret friend, Liu Chong clash, Liu Hai harm, Ben Ming Nian own-year) + the year's
  element. **Graded strong/moderate/mild (Rule 7)**; no dates, no fear-based language;
  nothing fabricated. Evergreen (years computed at render time). Linked from the zodiac
  sign guide (no orphan). 8 unit tests.
- **Real-use (built artifact):** `/chinese-horoscope/dragon` → *"Dragon in 2026 — Year of
  the Fire Horse … For the Dragon, this is a steady, neutral year."* with graded area cards.

### Master 5 / P4-LANG — Hindi parity pulled forward (+ Telugu scoping)  ✅ partial-by-design (`8059f6c`)
- Pulled Hindi parity forward on a **key P1 page**: new `/hi/panchang[/:city]` reuses the
  **same `computeDayPanchang` engine** as `/panchang` (identical real, date/city-computed
  Tithi / Nakshatra / Yoga / Karana / Rahu-Kaal / Gulika / Yamaganda / Choghadiya), with
  fully Hindi UI copy, Hindi FAQ, Hindi weekday + city names, and **bidirectional EN↔HI
  cross-links**.
- Machine-assisted Hindi is **honestly flagged for the person's human review** via a new
  `AutoTranslatedNotice` (Rule 8 + the P4 language rule). 3 render tests.
- **Real-use (built artifact):** `/hi/panchang/delhi` → *"तिथि Chaturdashi (Krishna पक्ष) ·
  नक्षत्र Uttara Phalguni · योग Brahma · करण · वार Shakuni · शुक्रवार"* (real computed values,
  Hindi weekday).
- **Telugu scope, full Hindi coverage of all key pages, and translation sign-off remain a
  business decision → Needs the person** (the P4 item is explicitly flagged "business
  decision" in the programme).

### Improvement — NB4-RANK: celebrity popularity rank per date  ✅ (`28f5244`)
- `/born-on` lists already rank by the **real sitelinks** (Wikipedia language-edition
  count) signal; `CelebrityCard` now shows a visible **#N rank badge** (`showRank`) on the
  three per-date lists, and `/celebrity/:slug` shows **"Ranked #N of M born on <date> by
  global recognition (Wikipedia reach)"** computed from the same signal — **only when the
  celebrity actually carries it** (no fabricated metrics; static records with no signal
  show no rank, honestly).
- **Real-use (built artifact):** `/born-on/may/13` → 5 rank badges, first = **#1**;
  `/celebrity/bhimrao-ramji-ambedkar` → *"Ranked #1 of 14…"*,
  `/celebrity/ivan-dias` → *"Ranked #2 of 14…"* (same April-14 date, by sitelinks).

---

## Test results per browser (real-use, Rule 4)

All against the **built staging artifact** served by `wrangler dev --env staging --local`
(unmocked `/api/*`, live Wikipedia feed). Browsers: Chromium desktop (1440×900) and
Pixel 5 (mobile, via Playwright `devices`). WebKit/iPhone input-control quirks are a
documented tooling limitation; rendering + computed output verified on the two engines
above and no feature here depends on a browser-specific input control.

| Feature (route) | Chromium desktop | Pixel 5 (mobile) | Evidence |
|---|---|---|---|
| CZ horoscope `/chinese-horoscope/dragon` | ✅ renders graded forecast | ✅ | Dragon 2026 Fire-Horse forecast + strong/moderate/mild badges |
| CZ horoscope index `/chinese-horoscope` | ✅ | ✅ | 12-animal grid |
| Celebrity birth-time note `/celebrity/virat-kohli` | ✅ "not on record" | ✅ | honest gate, no fabricated time |
| Celebrity profile rank `/celebrity/*` | ✅ #1/#2 of 14 | n/a | Ambedkar #1, Ivan Dias #2 (sitelinks) |
| Born-on rank badges `/born-on/may/13` | ✅ #1–#5 | ✅ | `celebrity-rank-badge` |
| On-this-day `/on-this-day/may/13` | ✅ 12 events + 12 deaths + attribution | ✅ | live Wikipedia feed, CC BY-SA |
| Born-on events+deaths embed `/born-on/may/13` | ✅ | ✅ | NB-DEATHS |
| Hindi Panchang `/hi/panchang/delhi` | ✅ real computed Hindi | ✅ | same engine as `/panchang` |
| Western chart `/western-birth-chart` (P4) | ✅ 200 | ✅ | regression |
| Interactive tarot `/tarot` (P4) | ✅ 200 | ✅ | regression |

**Negative / edge cases (worker 404 validator, built artifact):** `scripts/p4-404-check.mjs`
→ **ALL PASS (19/19)**: invalid → 404 (`/chinese-horoscope/unicorn`, `/on-this-day/may/40`,
`/on-this-day/notamonth/1`, `/hi/panchang/notacity`, `/hi/panchang/london`,
`/on-this-day/february/30`, …); valid → 200 (new routes incl. `/on-this-day/february/29`
leap-day, plus cross-group `/chinese-zodiac/dragon`, `/panchang/delhi`, `/born-on/may/13`).
On-this-day also handles the network-failure case gracefully (unit test TC-OTD-03) and an
invalid date without fetching (TC-OTD-04).

---

## Content-quality checks (Rules 6–8)

- **No thin content / "so what?":** CZ horoscope gives per-animal, per-relationship career/
  finance/love/health with a clear "what to do"; on-this-day gives real dated events/deaths
  with source links; Hindi Panchang carries the full computed almanac + Hindi FAQ.
- **Predictions clear, not timid; honest, not certain (Rule 7):** CZ forecast leads with a
  clear read, attributes to the tradition ("Chinese astrology reads this as…"), grades every
  area strong/moderate/mild, and gives no specific dates / no fear-based language (unit test
  TC-CZY-07 asserts this).
- **Honesty (Rule 8):** celebrity birth times ship EMPTY (no fabrication); the profile rank
  appears only where a real signal exists; machine-assisted Hindi is flagged for human
  review; Wikipedia content carries CC BY-SA 4.0 attribution + source links (Rule 9 licences).
- **Site rules (Rule 12):** new routes registered in the worker 404 logic, unique
  titles/meta (prerender-titles), sitemap + prerender lists updated, interlinked (zodiac
  guide → CZ horoscope; born-on ↔ on-this-day; EN ↔ HI panchang) — no orphans. Date-based
  high-volume on-this-day pages are evergreen with request-time content, **not one
  prerendered page per date (Rule 13)**.

---

## Site-wide checks

- **axe** (one page per new P4 page type × Chromium desktop + Pixel 5, `scripts/p4-axe.mjs`,
  built artifact): **0 serious/critical** across all 14 checks
  (`/chinese-horoscope`, `/chinese-horoscope/dragon`, `/on-this-day`, `/on-this-day/may/13`,
  `/hi/panchang`, `/celebrity/virat-kohli`, `/born-on/may/13`).
  A **pre-existing** serious color-contrast violation on `/celebrity/:slug` (hard-coded
  `text-gray-400` rarity/lucky labels — the page was never axe-gated before P4) was fixed to
  `text-gray-600` (AA) in `bfb8050`; my own P4 additions were clean from the start.
- **404 check:** `scripts/p4-404-check.mjs` → 19/19 pass (above).
- **Regression status crawl** (built artifact, 50 representative routes = core RC3 tools +
  P1/P2/P3 flagships + all new P4 pages): **ALL 200**, no regression.
- **Full automated suite:** **2103 passed / 2103** (196 files) — above the **2092 baseline**
  (+11: celebrityBirthTimes 4, wikimediaOnThisDay 4, Hindi Panchang 3; Task1 celeb tests
  migrated to the new note). `npx vitest run`, 0 failures.
- **Typecheck:** `tsc --noEmit` → clean (exit 0).
- **Perf-budget:** `scripts/perf-budget.mjs` (one page per layout, built artifact) → **all
  pages within performance budget** (LCP/CLS/TBT/JS-size).
- **Prerender + sitemap:** build prerendered **4055 ok / 0 failed**; sitemap **4055 URLs**
  (+27 vs P2's 4028 → 13 chinese-horoscope + 11 hi/panchang + 1 on-this-day hub + 2 others).
  New routes confirmed present with correct served titles and single visible H1 (2 `<h1>`
  in HTML matches the existing prerender pattern on every page, e.g. `/panchang`,
  `/chinese-zodiac`, `/born-on` — not a P4 regression).
- **Build time:** `npm run build:staging` = **~1143 s (~19 min)**, within limits
  (prerender 1076 s). Two clean builds this run (1090 s and 1143 s).
- **Console errors:** none observed in the real-use Playwright runs.
- **Chore:** untracked `.wrangler/` (transient Miniflare state accidentally pulled in by a
  retest `git add -A`) and added it to `.gitignore` (`fb…` cleanup commit).

---

## Build / preview

- **Preview artifact:** built locally (`npm run build:staging`, preview mode = TEST keys) and
  served via `wrangler dev --env staging --local`. **Preview URL after the person uploads:**
  `https://bornclock-staging.usdvisionai.workers.dev` (one `wrangler versions upload --env
  staging` command, or grant the token Workers:Edit).
- **Current production version ID (read-only, for rollback):** not retrievable here — the
  local token lacks the Cloudflare API scope and I must not add a token (Part 4). The person
  can read it with `wrangler deployments list` before any upload.

---

## Bug log summary (`docs/growth-bugs.md` scope for P4)

1. **Celebrity page color-contrast (serious, pre-existing):** `text-gray-400` labels failed
   WCAG AA; surfaced by the new P4 axe gate. **Fixed** → `text-gray-600` (`bfb8050`);
   re-verified 0 serious/critical on the built artifact.
2. **`.wrangler/` transient files committed:** a retest `git add -A` pulled Miniflare build
   tmp into `bfb8050`. **Fixed** → untracked + gitignored.

No product failures found in P4 real-use.

---

## Needs the person

- **Verified celebrity birth-time dataset** (P4-CELEB-BIRTHTIME): a properly-licensed,
  Rodden-rated birth-time + birthplace source. The reliability framework + gating ship now;
  drop entries into `src/data/celebrityBirthTimes.ts` and the time-dependent celebrity-chart
  sections light up automatically. Until then every celebrity reads honestly "birth time:
  not on record".
- **Regional-language scope + translation review** (P4-LANG): Telugu (and any further
  regional languages), full Hindi coverage of all key pages, and **human review/sign-off of
  the machine-assisted Hindi** (e.g. `/hi/panchang`) before launch.
- **Licensed celebrity bio/DOB source** (F-CELEB, carried from P0): still open — ~2,000
  profiles lack a bio and some DOBs are year-only. Not a P4 blocker; listed for completeness.
- **Preview upload:** grant the local Cloudflare token `Workers Scripts:Edit`, or run the one
  `wrangler versions upload --env staging` yourself, to put this P4 build on the staging
  preview URL for review (nothing here deploys it).

---

## Status vs `docs/growth-improvements.md`

All P4-assigned items ticked in that file with commit + evidence:
`[x] P4-WESTERN-CHART`, `[x] P4-TAROT-INTERACTIVE`, `[x] P4-CZ-YEARLY`,
`[x] P4-CELEB-BIRTHTIME`, `[x] NB4-RANK`, `[x] P4-BIRTHDAY-EVENTS`, `[x] NB-DEATHS`,
`[~] P4-LANG` (Hindi parity pulled forward; Telugu + review = needs the person).
`F-CELEB` (data source) remains `[ ]` — blocked on the person, as in P0.
