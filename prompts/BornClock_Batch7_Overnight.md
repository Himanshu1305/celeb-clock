# BornClock — Batch 7 overnight sprint (26 Oct 2026)

You are working on BornClock (bornclock.com), repo `Himanshu1305/celeb-clock`.
Stack: React + Vite + TypeScript, prerendered pages (`scripts/prerender.mjs`, 4 shards,
coverage gate ≥98% in `scripts/prerender-merge.mjs`), sitemap from `generate-sitemap`,
Cloudflare Worker (`functions/_worker.ts`), Supabase (project `jwrpqiypvystivtqyhro`),
GitHub Actions `deploy.yml` (push to `main` = production deploy; nightly 02:30 UTC job
refreshes `develop` → staging only).

The founder is non-technical. Work through all 8 workstreams below, overnight, without
asking questions. Where something is unclear, take the most reasonable reading, note it
in the final report, and keep going.

## How to run this (order, priority, safety)

0. FIRST check the last production deploy (batch 6, commit 3f0581e) finished green
   (`gh run list --branch main`), and spot-check live: `/celebrity/mahatma-gandhi/`
   meta says "aged 78"; `/born-on/may/13` 301s to `/born-on/may-13/india/`. If either
   fails, stop and report that first — do not build on a broken base.
1. Run workstreams in parallel (one sub-agent + worktree each), but merge in this
   priority order, so if time runs out the most valuable work is done:
   W1 daily Rashifal → W7 Panchang by city → W3 divisional charts → W6 angel numbers →
   W5 tarot → W2 Western daily → W8 nakshatra names + CDC check → W4 transit emails.
2. Only merge a workstream whose own tests, typecheck and build pass. A failing or
   half-done workstream is left on its branch, unmerged, and explained in the report.
3. Before writing ANY new page, check `src/App.tsx`, the prerender route list and the
   sitemap for an existing page with the same intent and extend it instead. Batch 6
   just removed 1,111 duplicate pages — do not create new ones. Add a test that no two
   sitemap URLs share the same title.
4. After merging, a separate reviewer sub-agent that did not write the code checks
   every new page type in a local prerender (title, H1, canonical, meta, JSON-LD,
   no noindex, mobile layout, plain-language explanations, tone rules) and spot-checks
   5 astronomical values per workstream against Swiss Ephemeris / Drik. Fix what it finds.

## Daily-changing pages: one shared design (W1, W2, W7)

Production rebuilds only when `main` is pushed, so a normal prerendered page goes stale.
Use ONE shared mechanism for all daily pages:
- At build time, precompute the content for every page for the next 400 days
  (India dates) with our engine into compact JSON files (e.g. `dist/daily/<kind>/<slug>.json`,
  one file per page, split by month if large).
- The Worker serves the prerendered shell and injects that day's precomputed text into the
  HTML (title, meta description, H1 date, main content, JSON-LD dateModified), cached
  until India midnight. The client reads the same JSON, so server and client always
  match. No engine calls at request time.
- If the JSON for today is missing (deploy older than 400 days), fall back to computing
  in the browser and log it in the ops monitor.
- Tests: for a fixed date, the Worker HTML contains that date and that day's text; the
  next day's HTML differs; the client renders identical text.
- Answer-first layout for Google AI Overviews: a 2–3 sentence direct answer at the
  top, then details; FAQ JSON-LD; visible date.

---

## Standing rules (must follow — no exceptions)

1. Branch off the latest `origin/main`. One git worktree + branch per workstream
   (`b7-<name>`), then merge all into `release-batch7-2026-10-26`. Never use `git stash`.
2. Do NOT push to `main`, do NOT deploy, do NOT run `wrangler deploy`. Push only the
   `b7-*` and `release-batch7-*` branches. The founder says "deploy" himself.
3. No database writes. Read-only SQL is fine. Schema changes go in a new
   `supabase/migrations/` file, listed as "needs founder approval".
4. Never `git add -A` / `git add .` — add explicit paths only.
5. Never edit `public/robots.txt`. Never add `noindex` to normal pages.
6. No fabricated numbers, facts, quotes, meanings, reviews or sources. Every fact you
   add must come from (a) our own engine, (b) Swiss Ephemeris via the audit venv, or
   (c) a page you actually opened with WebFetch — cite it in a code comment. If you
   cannot source something, leave it out and list it in the report.
7. Astrology tone: calm, practical, no fear. Never predict death, specific disease,
   accidents or certainty. Difficult periods are phrased as care ("take extra care on
   the road", "elders may need more of your support"). Marriage timing only as windows.
   Remedies free first; no selling of pujas or gems.
8. Every astrology term shown to users gets a plain-language explanation (use the
   existing `TermTip` component and term list).
9. Keep the existing new design language; no old-style pages.
10. Before finishing: `npx tsc --noEmit -p .`, full `npx vitest run`, and
    `npm run build:app` must all pass on the release branch. Run a local prerender of a
    sample of every new page type and check title, H1, canonical and that the page is
    not noindex. Any new route must be in the prerender list and sitemap, and the
    coverage gate must still pass.
11. Accuracy checks: wherever a workstream shows astronomical values (planet signs,
    tithi, nakshatra, Rahu Kaal, sunrise), add vitest regression tests with reference
    values from Swiss Ephemeris (venv) or Drik Panchang pages opened with WebFetch, and
    say which in a comment.

---

## Workstream 1 — Daily Vedic Rashifal (12 rashis, English + Hindi)

Goal: rank for "aaj ka rashifal", "[rashi] rashifal today", "mesh rashifal" etc.

- One page per rashi that always shows TODAY's horoscope (India date, Asia/Kolkata),
  at a fixed URL (reuse/extend `/rashifal/:rashi` and `/hi/rashifal/:rashi`; check
  `src/pages/RashifalSign.tsx` and `RashifalPage` first and extend, don't duplicate).
- Content must be computed from that day's real sky with our engine, counted from the
  Moon sign (the Vedic convention): Moon's transit house and nakshatra (Tarabala,
  Chandrabala), plus slow-planet context (Saturn, Jupiter, Rahu/Ketu house from the
  rashi; Sade Sati/Dhaiya status). Build a deterministic rules table that maps these
  factors to short, varied, plain sentences for: overall, love/relationships,
  career/money, health (care only), lucky colour/number/time (lucky time from that
  day's Choghadiya/Hora for a default city, labelled with the city). Same input must
  always give the same text; different days must read differently.
- Show "Why today": the 2–3 factors used, each explained in one plain line.
- The date must be visible on the page and in the title/meta ("26 October 2026").
- Freshness: use the shared daily-page design above (precomputed 400 days, Worker
  injects today's text). Build this mechanism in W1 first; W2 and W7 reuse it.
- Add weekly and monthly views only if they already exist; keep them consistent with
  the daily text (same factors).
- Hindi pages: same content in natural Hindi (not word-by-word translation).
- Link from the homepage Vedic pillar and from each rashi page to the others.

## Workstream 2 — Daily Western horoscope (12 sun signs)

- One page per sun sign (extend `/zodiac/:sign` or add `/horoscope/:sign/today` — check
  existing routes and pick one without creating a duplicate of an existing page) with
  TODAY's horoscope from real tropical transits (Moon sign and aspects to the sign,
  Sun/Mercury/Venus/Mars ingresses and retrogrades), same deterministic rules approach,
  same "Why today", same shared daily-page design (reuse W1's mechanism).
- Clearly labelled "Western (tropical) astrology" so it is not confused with the Vedic
  rashifal; cross-link the two ("Your Vedic rashi may differ — find it here").

## Workstream 3 — All 16 divisional charts in the Kundali

- The engine already computes the vargas (see `src/lib/vedic/engine/vedicEngine.ts`);
  the UI shows only D9 and D10 highlights (`src/components/reading/VedicReading.tsx`).
- Add a "Divisional charts (Shodashvarga)" section: a chart selector for D1, D2, D3, D4,
  D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60, rendered in the user's chosen
  chart style (North/South), each with a one-line plain meaning of what that chart is
  about (e.g. D10 = career) and the classical source (BPHS chapter).
- Show a gentle note that D27 and above (and especially D60) need an exact birth time;
  if the birth time is unknown or the varga sign would change within ±5 minutes of the
  given time, say so on that chart.
- Tests: varga signs for 3 test charts from round2 CONTEXT (P1–P10 panel) against Swiss
  Ephemeris (venv) using the standard BPHS varga formulas.

## Workstream 4 — Transit alert emails (build only, keep OFF)

- Make sure transit alert emails (Saturn/Jupiter/Rahu-Ketu sign change, Sade Sati
  start, retrograde of the user's key planet) are complete and tested in
  `api/_notify.ts` / `api/cron-dispatch.ts`, behind the existing `NOTIFY_LIVE` flag.
- The flag stays OFF. Do not send any email. Add a dry-run test that renders one email
  of each kind for a test chart.

## Workstream 5 — Tarot: 78 card pages + yes/no tarot

- 78 pages, one per card (22 Major + 56 Minor Arcana), e.g. `/tarot/cards/the-fool`,
  with: upright meaning, reversed meaning, love, career, money, yes/no lean, keywords,
  symbolism, and links to related cards. Base meanings on A. E. Waite, "The Pictorial
  Key to the Tarot" (1910, public domain) — open it via WebFetch (e.g. sacred-texts.com)
  and paraphrase in plain modern English; do not copy long passages.
- Card images: only public-domain Rider–Waite–Smith (1909) scans from Wikimedia Commons
  with the licence noted, or no image. Check licence on the file page via WebFetch.
- A yes/no tarot tool (one card draw, explained), and an index page of all 78 cards.
- Link from the existing tarot pages (`TarotReading.tsx`, `TarotByBirthday.tsx`).

## Workstream 6 — Angel number pages

- Extend the existing `AngelNumbersPage.tsx` into an index + one page per number:
  000, 111, 222, 333, 444, 555, 666, 777, 888, 999, 1010, 1111, 1212, 1234, 2222.
- Each page: meaning, love/relationships, career, twin flame (framed as a popular
  belief), what to do, and how it relates to numerology (use our one Life Path/numerology
  method). Be clear this is a popular belief, not a prediction. No made-up statistics.
- FAQ schema on each page; link to the numerology calculator.

## Workstream 7 — Panchang for any city and date (+ Rahu Kaal, Choghadiya)

- The city picker is already built (batch 5); `PANCHANG_CITIES` in
  `src/lib/vedic/panchangDay.ts` has about 10 fixed cities. Let the Panchang page work for
  any city from the picker and any date (date selector, previous/next day).
- Prerender city pages for the 50 most-populated Indian cities (take the list from a
  source you open with WebFetch, e.g. the Census of India / Wikipedia list) plus the
  existing ones: `/panchang/:city`, `/rahu-kaal/:city`, `/choghadiya/:city` — each shows
  TODAY via the shared daily-page design (reuse W1's mechanism). No page explosion:
  dated views are reachable via the date selector, not separate sitemap URLs. Each
  city page must be genuinely different (its own sunrise/sunset-based times, local
  festivals only if sourced), not a template with only the city name swapped.
- Keep the existing `/hi/panchang/:city` Hindi pages and link them to the English ones.
- Add the missing muhurtas: Brahma Muhurta, Amrit Kalam, Dur Muhurtam, Varjyam,
  Gulika, Yamaganda, Abhijit (already), and round all times to the nearest minute
  (current code truncates seconds).
- Tests: 5 cities × 3 dates vs Drik Panchang (WebFetch) for sunrise, tithi, nakshatra,
  Rahu Kaal; times within 1 minute.

## Workstream 8 — Baby names by nakshatra (27 pages) + US life-expectancy check

- 27 pages, one per nakshatra (e.g. `/baby-names/nakshatra/rohini`): its 4 pada
  syllables (from the existing nakshatra akshara data), the nakshatra's deity and
  meaning (sourced), and a short list of names per syllable with meaning and gender.
  Only include names whose meaning you can source (opened page or an existing sourced
  list in the repo); keep lists short and correct rather than long. Reuse the existing
  142 names. No generic giant name list.
- Link from the Kundali / birth-chart results: "Your nakshatra is X → name letters …".
- US life expectancy: the kept country page shows state figures (e.g. Hawaii ~81,
  Mississippi ~71) that disagree with the retired page (82.3 / 74.4). Check them against
  the latest CDC / NCHS state life-expectancy table (WebFetch) and correct them with
  the source and year shown on the page.

---

## Final report (write it to `prompts/BornClock_Batch7_Report.md` and also print it)

Short and plain, for a non-technical founder:
1. What each workstream delivered (one or two lines each), with 1–2 sample URLs, and
   whether it is merged or left unmerged (and why).
2. Test / typecheck / build / prerender-gate results, and the sitemap URL count before
   and after.
3. Anything not done, not verified, or decided on your own, and why.
4. Branch name and final commit hash of `release-batch7-2026-10-26`.
Do not deploy.
