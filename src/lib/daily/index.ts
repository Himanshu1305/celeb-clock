/**
 * Daily-changing pages — ONE shared mechanism (Batch 7: daily Rashifal, Western
 * horoscope, Panchang by city).
 *
 * WHY: production rebuilds only when `main` is pushed, so a normally prerendered page
 * goes stale. Instead:
 *   1. BUILD — `scripts/gen-daily.mts` (run by `npm run build:app` / `build` after
 *      `vite build`) precomputes every registered page for the next 400 India dates
 *      with our own engine into `dist/daily/<kind>/<slug>/<YYYY-MM>.json`
 *      (DailyMonthFile), plus `dist/daily/manifest.json` (first/last date).
 *   2. WORKER — `functions/daily.ts` (called from functions/_worker.ts) matches the
 *      request path against the registry, fetches that month's JSON from the static
 *      assets, and injects today's entry (Asia/Kolkata date) into the prerendered
 *      shell: <title>, meta/og/twitter description + title, H1, visible date, the main
 *      content block and the JSON-LD (WebPage dateModified + FAQPage) — see ./inject.ts.
 *      Nothing is computed at request time.
 *   3. BROWSER — the page component uses `useDailyEntry(kind, slug)` (./useDailyEntry.ts):
 *      it reads the entry the Worker embedded (<script id="daily-data">), else the same
 *      month JSON, and renders it with the SAME renderer (./render.ts via ./DailyParts.tsx),
 *      so server HTML and client DOM always match. If the day is missing (deploy older
 *      than 400 days) it computes in the browser (./compute.ts) and warns; the ops
 *      monitor (api/ops-monitor.ts, check "daily_pages") alarms before the window runs out.
 *
 * HOW TO REGISTER A PAGE KIND (e.g. Panchang by city):
 *   a) ./registry.ts — add to DAILY_PAGES:
 *        { kind: 'panchang', lang: 'en', slugs: CITY_SLUGS, path: s => `/panchang/${s}` }
 *      (routes only, no engine imports — the Worker imports this file).
 *   b) ./compute.ts — add `panchang: (dateIST, slug) => DailyEntry` to DAILY_COMPUTERS.
 *      compute(dateIST 'YYYY-MM-DD', slug) must be pure + deterministic and return a
 *      DailyEntry (./types.ts): { date, lang, title, description, h1, dateLabel,
 *      answer (2–3 sentences, answer-first), why[] (2–3 factors, one plain line each),
 *      sections[] ({id, heading, text?, items?[{label,value,note?}], tone?}), faq[] }.
 *      Share one per-day sky across slugs (see ./kinds/vedicSky.ts) to keep the build fast.
 *   c) The page component renders, inside its layout:
 *        const { entry } = useDailyEntry('panchang', slug);
 *        h1={<DailyH1 entry={entry} fallback="Panchang for Delhi" />}
 *        <DailyDate entry={entry} /> … <DailyBody entry={entry} /> <DailyJsonLd entry={entry} path={path} />
 *      Static explanations (TermTip glossary chips, links) go OUTSIDE <DailyBody>.
 *   d) Make sure the route is in scripts/prerender-routes.mjs (and so the sitemap),
 *      with a static title in scripts/prerender-titles.mjs (the Worker replaces it daily),
 *      and add its pattern to DAILY_ROUTE in scripts/generate-sitemap.mjs (changefreq daily).
 *
 * COMPACT "DATA + RENDER" VARIANT (batch 7, used by every kind now): give the def a
 *   `data: { kind, slug }` (./registry.ts). The build then stores small per-day DATA in
 *   /daily/<data kind>/<data slug>/<YYYY-MM>.json ({ data: { [date]: … } }) — one file can
 *   serve many pages (e.g. one sky for all 12 rashis) — computed by
 *   DAILY_DATA_COMPUTERS[data kind] (./compute.ts), and the entry is built from it by the
 *   pure DAILY_TEMPLATES[kind] (./templates.ts) in the Worker AND the browser, so both show
 *   the same text. Month files with finished `days` (the original format) still work.
 *
 * PERIOD PAGES (batch 8 — weekly Mon–Sun / monthly / yearly rashifal): add `period: 'week' |
 *   'month' | 'year'` to the def's `data`. The data then changes once per period and is
 *   stored once per period key (week → its Monday, month → YYYY-MM, year → YYYY) in
 *   /daily/<data kind>/<data slug>/<period key>.json ({ data: { [period key]: … } });
 *   dailyFileKey / dailyDataKey (./registry.ts) map a date to that file + key for the build,
 *   the Worker and the browser alike. The data computer gets any date in the period.
 *   An entry may set `labels` to retitle the "Today in brief" / "Why today" / FAQ blocks.
 *
 * Files: types.ts · templates.ts · dates.ts · registry.ts · render.ts · inject.ts · DailyParts.tsx ·
 *        useDailyEntry.ts · compute.ts · kinds/* · scripts/gen-daily.mts · functions/daily.ts
 */
export * from './types';
export * from './dates';
export * from './registry';
export * from './render';
export * from './inject';
