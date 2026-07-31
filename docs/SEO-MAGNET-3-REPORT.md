# SEO-MAGNET-3 — Execution Report

Share buttons · personality layer on the 366 date pages · compatibility pair pages ·
rising-sign calculator · personalised report OG cards. Pure growth surface — nothing
touches payments, credits or entitlements. Local commits only, one deploy.

---

## Founder spot-check list (do these after deploy)
1. **Date-page personality** — open https://bornclock.com/born-on/january-1/ → scroll to
   "Born on January 1: Personality" (traits, strengths, growth areas, lucky day/colour,
   compatible signs, Birth Day Number + Blueprint CTA).
2. **Compatibility pair** — https://bornclock.com/compatibility/aries/leo/ → score
   breakdown, composed element×modality paragraph, both zodiac-hub links, share bar.
   Also try https://bornclock.com/compatibility/leo/aries → should 301 to aries/leo.
3. **Rising sign** — https://bornclock.com/rising-sign-calculator/ → enter a date + a
   fake time (e.g. 08:30) → get a rising sign; confirm the honesty box and "birth time
   never stored" note.
4. **Share a report to WhatsApp** — open any report you own, tap WhatsApp share → the
   preview card should read "{FirstName}'s Birthday Blueprint" (falls back to the default
   card if the render budget is hit or the card can't render — never a broken image).

---

## PHASE 1 — Share buttons on all content pages
Reusable `src/components/SharePageBar.tsx`: WhatsApp / X / Facebook as real anchors
(crawlable, testable hrefs), Copy (clipboard), and a native OS-sheet button on mobile.
Share links always target the canonical `https://bornclock.com/…/` URL so the batch-2
OG card renders in the preview. Placed consistently **below the answer paragraph** on
BornOnDay, MonthHub, ZodiacSign, FitnessRhythmPage, and (under the article header) on
BlogPost. Verified per type by `seo-magnet-3.spec.ts` (bar renders + encoded URL).

## PHASE 2 — Personality layer on the 366 date pages
Enriched the EXISTING `/born-on/{date}` pages (no new `/birthday` routes — no
cannibalisation). Wired the existing `getBirthdayPersonality()` trait matrix into a
"Born on {date}: Personality" section: answer-first sentence (snippet target), core-trait
chips, strengths, growth areas, lucky day/colour, compatible signs (linked to both the
zodiac hub and the canonical compatibility pair), plus an in-body **FAQPage** schema.

- **A2 (correctness):** the day-derived number is labelled **"Birth Day Number"**,
  never "Life Path". A clarifying line states the full Life Path (from the complete date)
  is in the Birthday Blueprint — a natural CTA. The A2-violating `personalityBlurb` in
  the data module (which says "Life Path N") is **not rendered** here; the section
  composes its own A2-compliant prose. *(Finding: `/birthday/{m}/{d}` — BirthdayDatePage —
  still renders the data module's "Life Path" label for the day reduction. Left untouched
  this batch to avoid a risky 77-occurrence rename; flagged for a follow-up.)*
- **A3 (thin-content guard):** each date interleaves its UNIQUE data — the top celebrity
  of the date, the national day (if any), and the birthstone — into the personality
  prose, so two same-sign/same-number dates never read identically. Diff evidence below.
- FAQPage rendered **in-body** (not via Helmet), because Helmet-injected JSON-LD does not
  survive the prerender capture (verified: the existing Helmet ItemList does not appear in
  prerendered born-on HTML; in-body PageFAQ schema does).

### A3 diff evidence (two same-sign Aries dates)
Both March 28 and April 2 are Aries; their rendered personality sections diverge because
each date's own top celebrity, birthstone and Birth Day Number are woven into the prose:
```
March 28: "People born on March 28 are fearless trailblazer, fiercely independent,
  bold decision-maker — Aries (Fire) energy carried through Birth Day Number 1.
  For March 28 specifically, Lady Gaga shares this birthday, the birthstone is Aquamarine."

April 2:  "People born on April 2 are competitive but considerate, leads through
  partnership, passionate negotiator — Aries (Fire) energy carried through Birth Day
  Number 2. For April 2 specifically, Hans Christian Andersen shares this birthday,
  the birthstone is Diamond."
```
Different traits (Birth Day Number 1 vs 2), different celebrity (Lady Gaga vs Hans
Christian Andersen) and different birthstone (Aquamarine vs Diamond) — no duplication.

## PHASE 3 — Compatibility pair pages — the ordered-vs-unordered decision
**Chosen: 78 unordered canonical pairs + reverse-order 301 redirects** (not 144 ordered).

Justification: the app already serves `/compatibility/{s1}/{s2}` and prerenders the 78
unordered pairs in **alphabetical (canonical) order**; the page's canonical tag already
points reverse-order URLs at the sorted pair. Creating 144 ordered pages would publish
`aries/leo` and `leo/aries` as two indexable URLs with identical content — textbook
duplicate content that splits link equity. The SEO-correct move is to keep one canonical
URL per pair and **301 the reverse order to it**, which I added in the Worker
(`/compatibility/leo/aries` → `301` → `/compatibility/aries/leo/`). This consolidates
ranking signals onto a single URL. Net indexable pair pages: **78** (unchanged count;
they already existed and are in the sitemap + Explore/Astrology nav).

Content depth: each pair now renders the curated score breakdown + a **composed
element × modality paragraph** (unique per pair), strengths/challenges/advice, a 3-item
pair FAQ (FAQPage schema), links to **both zodiac hubs** + the calculator, and a share
bar — comfortably >300 words of pair-specific content with no thin duplication.

> Build-count note: the gate's "1337 + 144 + 1 = 1482" assumed the compatibility pages
> did not exist yet. They did (78 pairs, already inside the 1337). The only NEW route
> this batch is the rising-sign calculator, so the real build count is **1338**.

## PHASE 4 — Rising sign calculator
New page `/rising-sign-calculator` (`RisingSignPage.tsx` + `risingSignData.ts`). Inputs:
birth date + birth **time** (local birth-place time). Uses the standard simplified
2-hour-block ascendant table (Sun sign at ~6am, advancing one sign every two hours). All
12 rising-sign descriptions, a sun-vs-moon-vs-rising explainer, FAQPage + WebApplication
schema, share bar, mesh links, and added to the Astrology nav. **Honesty framing** is
mandatory and prominent ("approximation — exact ascendant needs precise birth time and
location"). **Privacy:** birth time is used only in-browser, never stored — stated on the
page. Registered in App.tsx + prerender routes/titles + sitemap.

## PHASE 5 — Personalised report OG cards — implementation path
**Chosen path: Cloudflare Browser Rendering `/screenshot`, cache-first, with hard guards.**
`functions/og-report.ts` adds two Worker pieces, both wired in `functions/_worker.ts`:

- `GET /og/report/{slug}.png` — renders "{FirstName}'s Birthday Blueprint" (first name +
  formatted birth date only — privacy) on the brand card via Browser Rendering. **A4
  guards:** Cache API + `immutable` headers (each slug renders at most once, then served
  from edge cache for a year); render only for slugs that exist in `birthday_reports`
  (service-role lookup, expiry-checked); a **hard daily render budget** (200/day) and a
  **per-IP rate limit** (8/min); ANY miss/failure/over-budget serves the static default
  card (200 image) — never a broken image, never a 5xx, and it reuses the same Browser
  Rendering infra as invoices without competing (invoices are a separate code path;
  OG failures never touch them).
- Report-HTML rewrite — for `/report/{slug}`, the Worker injects the per-slug `og:image` +
  `twitter:image` (and `noindex`) into the SPA shell so social crawlers (which don't run
  JS) see the personalised preview. On any error it returns the untouched shell, so a
  report view can never break.

> A4 durability note: the daily budget + per-IP limit are in-memory (no KV namespace is
> provisioned). Combined with immutable edge caching and the fact that report slugs are
> random and `noindex` (never crawled in bulk), real Browser Rendering calls stay minimal.
> A fully durable cross-isolate cap would use a KV binding — noted as future hardening.
> No new DB tables were added, so there is no DDL / NOTES-*.sql for this batch.

---

## GATE
- **tsc:** app 0 errors (baseline 45 / 0 new). Worker (`functions/`, `api/`) is bundled by
  esbuild/wrangler, not the app tsconfig; the worker bundle compiles clean.
- **build:** **1338 ok / 0 failed / 0 skipped** (1337 + rising-sign; the 78 compat pairs
  already existed). Sitemap 1338 URLs.
- **prerender resilience (fix):** the first full run crashed at ~1100/1338 (a fatal
  `TimeoutError` from a browser OOM over 1000+ heavier date pages aborted every remaining
  route). Hardened `scripts/prerender.mjs` to **recycle the browser every 300 routes** and
  to **relaunch + retry a batch** if the browser dies, so a crash costs one batch, not the
  tail. Re-run: 1338 ok / 0 failed, browser recycled at 304/600/904/1200.
- **test:prelaunch:** launch-gauntlet **135 passed** · prelaunch **96 passed**, 0 failed (incl. the
  14 new `seo-magnet-3` assertions: share bar × 5 types, personality + A2 + A3, compat pair
  schema + reverse-order 301, rising-sign validation + WebApplication schema, report-OG
  default-card fallback, report-HTML og:image injection).
- **frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`,
  `api/verify-payment.ts` — no diff. ✔
- **invoice_counters (unchanged):**
  ```
  BC/26-27  next_value 1002
  BN/26-27  next_value 1001
  BX/26-27  next_value 1001
  ```
- **deploy:** one `wrangler deploy` — Worker + assets uploaded, `bornclock` deployed
  (the trailing `schedules` API error is the known non-fatal cron token-scope issue).
  Verified live: `/rising-sign-calculator/` 200; `/compatibility/leo/aries` → 301 →
  `/compatibility/aries/leo/`; `/og/report/{bogus}` → 200 `image/png` (default card);
  `/report/{slug}/` HTML carries the injected per-slug `og:image`; `/born-on/january-1/`
  shows the personality section + Birth Day Number; share bar renders on content pages.
- **sentinel:** create-order → `404 {"error":"Report not found"}` (ops-seo spec, green). ✔
- **IndexNow:** pinged the rising-sign page + compatibility hub + representative enriched
  pairs — IndexNow HTTP 200, Yandex 202 (12 URLs). ✔

## Deferred / findings
- `/birthday/{m}/{d}` (BirthdayDatePage) still labels the day-reduction "Life Path" via
  the shared data module — pre-existing A2 conflict, flagged for a scoped follow-up.
