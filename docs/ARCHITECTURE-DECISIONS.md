# BornClock — Architecture Decisions & Maintenance Log

> Purpose: capture WHAT was built, WHY it was built that way, what failed before it, and what remains open — so future sessions don't re-derive this from scratch. Update this file whenever a significant decision lands.
> Last updated: 2026-07-05 (session 5-Q — payment integrity, deletion compliance, lifecycle emails, privacy policy, dormancy runbook).

---

## 1. Product context

Two products, one science-first brand:
- **Longevity Blueprint** (`LifeExpectancy.tsx`) — the science core.
- **Birthday Blueprint** (`ReportView.tsx`, at `/report/[slug]`) — paid gift report; zodiac/numerology/tarot/nakshatra/biorhythm as labeled-fun novelty under the science spine.

Stack: Vite + React + TS + Tailwind + shadcn + Supabase + Vercel + Razorpay + Resend. Work happens on `develop`; `main` is never touched directly.

---

## 2. Working conventions (do not violate)

- `package.json` / `package-lock.json` are **permanently dirty** from an aborted session-10a chromium install. They must NEVER be staged. Never `git add .`.
- Every change ships as a focused commit; unrelated fixes are separate commits.
- **Read before write**: grep real code, anchor edits to real strings. Code snippets in prompts are patterns to adapt, never paste-ins.
- `npm run build` is necessary but not sufficient for print work — **the exported PDF (or `scripts/verify-print.mjs`) is the only proof of print layout.**
- SYSTEM FONTS only. Google Fonts caused glyph corruption in print (historical incident).
- Design tokens: ink `#0C1A2B`, navy `#103A5C`, blue `#1E6FB8`, gold `#B8862F`, gold-soft `#F5EAD2`, gold-tint `#FBF6EA`. Birthday report = navy + gold.

**Meta-lessons (earned expensively):**
- When something works elsewhere in the codebase, DIFF AGAINST IT and replicate. Do not theorize new architecture.
- Validate print-CSS candidates in headless Chromium before committing.
- Prefer tools the repo already has (e.g. the Supabase JS client) over external tooling (psql, Studio mega-pastes).
- **A stale deploy can make removed code look like working data — verify against the DB, not a rendered page.** (Staging showed rich Indian cards after Part C removed the client-side merge; this was misread as migration success. In reality the build was stale and the merge was still running. The DB was unenriched throughout.)
- **Supabase Studio silently rolls back large multi-statement pastes** — no error shown, zero rows changed, row count in Studio shows 0 affected. Use Node scripts for all bulk work; Studio SQL only for single-statement manual surgery.
- **Multi-statement pastes in Studio abort on the first failing statement and surface only the last error message** — intermediate errors are hidden. If a paste has 500 statements and statement 3 fails, you see one message and nothing ran. Consequence: never diagnose a paste failure by reading the Studio error alone; the error may not point at the real problem. Single statements for surgical fixes; scripts for everything else.

---

## 3. Print architecture (Birthday report)

### How it works today
- Both reports print **client-side**; there is no PDF backend (server-side rendering was proposed and rejected — Longevity proves client-side is furniture-free; hosting is Cloudflare free tier).
- **Longevity**: iframe + `doc.write(html)` + `print()`; builds discrete `.page` divs each carrying its own header/footer copy.
- **Birthday**: `react-to-print` on the live DOM, continuous flow. A prior attempt (session 10b) to move Birthday to the iframe pipeline was fully reverted — do not revisit.

### The core mechanism (commit 281c681)
Everything after the cover is wrapped in a **native HTML `<table>`**: running header in `<thead><tr><td>`, all sections in one `<tbody><tr><td>`, running footer in `<tfoot><tr><td>`. Blink repeats native thead/tfoot on every printed page AND reserves their space. The cover sits OUTSIDE the table with `break-after: page`, so page 1 stays bare.

### What failed before it (do not retry)
- `position: fixed` print chrome (f725c43): reserves no per-page space (content slides under → clipping) and cannot be suppressed on the cover. Superseded.
- CSS `display: table-header-group` on **divs**: renders once, does not repeat across pages in Blink. Must be real `<table>/<thead>/<tfoot>` elements. Verified by rendering both.

### Page geometry (b7964c4, e8c9257, 3b3d797)
- `@page { margin: 0; size: A4 }` — matches Longevity; suppresses Chrome's print-dialog furniture at default settings. The "about:srcdoc / N of 24" strings some manual exports showed are **dialog furniture from the 'Headers and footers' checkbox**, not our code.
- Insets baked into cells: `.report-print-cell { padding: 0 1.5cm }`, thead cell `padding-top: 1.5cm`, tfoot cell `padding-bottom: 1.5cm`.
- Cover: `.report-cover-section { padding: 1.5cm !important; break-after: page; display: flex; flex-direction: column; min-height: 297mm; box-sizing: border-box }` — all inside the **pageStyle string**, which only applies in the print context. `min-height: 297mm` exists so `margin-top: auto` on the decorative gold-rules + tagline block lands it in the lower third of the A4 cover. Do NOT move these rules to screen CSS.
- The `!important`s exist because Tailwind utility classes (`px-4 pt-10 pb-8`) and `.print-only { display:block !important }` were winning specificity races (3b3d797 diagnosis).

### Break policy
- `break-inside: avoid` was **relaxed** on `.report-section`, large prose panels, numerology panels, famous-member chips (eb10876) — a ~1.5-page section jumping whole was the main blank-space cause.
- KEPT on: `.dark-section` (Tarot, Solar hero), `.solar-section`, `.neptune-fact-card`, `.generation-section`, all card grids, Tarot panels, celebrity cards (splitting these looks broken).
- Numerology section (03) additionally has `break-before: page` (778b365) — it starts on a fresh page. Other sections flow continuously; **strict section-per-page vs continuous flow remains a standing product decision** (continuous currently chosen; one-line flip either way).
- Headings carry `break-after: avoid` to prevent orphaned headings.

---

## 4. Verification tooling

`scripts/verify-print.mjs` (9c491dd, kept in sync at f810fe5) renders the real Neeraj report headlessly (Playwright + Chromium) and asserts on the printed PDF:
- running header on every content page; footer on every page; cover bare
- no dialog-furniture strings; page count; clipping check (content vs reserved bands)
- **live-fetch guard (assertion 5f, f810fe5):** an invisible 1px white span `·LIVE·` / `·FROZEN·` is rendered in the Twins section of ReportView based on whether `liveCelebrities` is non-null (live Supabase fetch) or null (frozen-blob fallback). pdfjs reliably extracts 1px white text from Chromium's PDF content stream. The assertion fires — and the run fails — if the frozen blob was served instead of a live fetch, ensuring all layout assertions are against real data. Without this guard a silent Supabase failure returns `[]` → frozen blob → all 9 layout assertions pass, but celebrity data is untested.
- **sparse-page report** — pages with fill < ~0.55 are LISTED FOR REVIEW, not asserted. Green assertions ≠ blank-space resolved; read the list.
- **faithfulness self-check runs first** (header must repeat on pages 2 AND 3); if it fails, the print CSS wasn't applied and the run aborts rather than asserting against a bogus PDF.

Notes: headless PDF generation never adds dialog furniture, so the no-furniture assertion validates content/CSS only. **Runtime trim RESOLVED (session 5-O, 79e31cd):** switched from `npm run dev` (cold compilation, 90s timeout) to `vite preview` (serves pre-built dist, ready in ~1s); replaced `waitUntil: 'networkidle'` with `waitForSelector('[data-celeb-source]')` (live-fetch guard selector). New total runtime: **~4s** (down from ~2-3 minutes). Pass `--rebuild` to force a fresh build before the preview run.

Test reference person: **Neeraj, born June 25, 1966** — Cancer / Horse / Mithuna / Sagittarius Moon / Purva Ashadha / Life Path 8 / Strength tarot. Every before/after uses this report.

---

## 5. Celebrity data model

### The table (the big discovery of session 5)
`celebrity_sitelinks` is a **pre-existing Wikidata bulk seed of 25,952 rows** — not a hand-curated table. Columns: `id, name, birth_date, birth_month_day (text, zero-padded 'MM-DD'), death_date, sitelinks (int — count of Wikipedia language editions; the notability/ranking proxy), nationality, nationality_code, occupation, wikidata_id, wikipedia_url, created_at`, plus `known_for` and `tier` (added 2026-07).

**Table constraints:** `UNIQUE(name, birth_date)` is enforced at DB level (`celebrity_sitelinks_name_birth_date_key`). This surfaces during deduplication when an UPDATE would move a row onto an already-occupied `(name, birth_date)` slot — the constraint fires and blocks the write. Two safe orderings: (1) DELETE the occupant first, then UPDATE the survivor onto the freed slot; (2) invert — keep the colliding fresh row, copy `sitelinks` (and any other fields to preserve) from the original, DELETE the original. Use (2) when the fresh row is already enriched (has `nationality_code`, `known_for`, etc.) and you'd have to re-copy too many fields the other way.

**Critical (confirmed 2026-07-03): `wikidata_id` is NULL for every row in the seed — the column was never populated at seed time.** This invalidates Stage 2's plan to key Wikidata API lookups on `wikidata_id`. Stage 2 will instead need `name + birth_date` matching against the Wikidata search API (see §8).

### January date corrections (2026-07-04)

`scripts/fix-january-dates.mjs` disambiguated 48 fresh IN inserts (44 non-`01-01` + 4 `01-01` entries that Phase 3 of the dedupe script had excluded). The script queries Wikidata using a four-stage pipeline:

| Stage | Filter | Notes |
|---|---|---|
| **A** | exact `rdfs:label@en` + `P27=Q668` + exact birth year + precision ≥ 11 | Baseline: high confidence |
| **A2** | exact `rdfs:label@en` + **no P27** + exact birth year + precision ≥ 11 | Covers Wikidata citizenship gaps — e.g. Diljit Dosanjh is listed as `P27=Q30` (US) not `Q668` (India); Stage A returns 0; A2 finds him via exact label + year |
| **B** | `wbsearchentities` alias search + `P27=Q668` + **±2 year tolerance** | Handles: (1) alias spellings (Amisha/Ameesha Patel); (2) Wikidata year errors (Shilpa Shetty: Wikipedia=1975, Wikidata=1976 — ±1 year tolerated) |
| **B2** | `wbsearchentities` with transliteration variant + `P27=Q668` + ±2 year | Handles name transliteration variants — "E. Sridharan" → search "E. Sreedharan" to find `Q1273577` |

Precision < 11 (year-only) cannot confirm a month-day and always results in EXCEPTION regardless of stage.

**Outcome (2026-07-04):** 18 fixes applied, 23 confirmed (genuine January birthdays), 7 exceptions left for manual-when-convenient review:
- **Byju Raveendran** — Wikidata P569 precision = 9 (year-only); cannot confirm day
- **Deep Kalra** — no P569 birth claim in Wikidata
- **Chanakya** — ancient figure; precision < 11
- **Mirabai** — medieval figure; precision < 11
- **Tantia Tope** — 19th-century figure; precision < 11
- **Raghav Juyal** — 0 Wikidata candidates found (name/label mismatch)
- **Ilayaraja** — manually resolved in Studio (06-02; two-candidate conflict in Stage B)

**Corruption stat:** 18 of 48 January dates (38%) were wrong. The month-corruption pattern extends beyond the documented June→January case — at least some were other months. This means non-January corruptions are likely present in the full 25,952-row seed; they are invisible until someone searches a specific date. Stage 2's Wikidata matcher will inherit the A/A2/B/B2 approach for all rows.

**Stage 2 requirements inherited from this work:**
1. Log which stage (A/A2/B/B2) and which tolerance (exact vs ±year) produced each match — A2 and ±year matches are lower-confidence and should be routed to a review queue at 25K scale.
2. Do not auto-apply A2 or ±year matches to `birth_date` without a separate review pass; use them to populate `wikidata_id` and `wikipedia_url` only.
3. Keep the precision ≥ 11 gate — year-only Wikidata records cannot correct month-day data.

Before session 5: `occupation`, `wikipedia_url`, `nationality*` were NULL for essentially all rows. Rich display data came from client-side overlays, not the DB.

### The Indian celebrity migration — full (corrected) history

**What the data was:** `src/data/indianCelebrities.ts` (598 entries, hand-curated: occupation, known_for, tier) was injected client-side by `mergeWithIndianCelebrities()` on top of DB results. This was **enrichment of stub Wikidata rows**, not duplicate injection — the reason the merge existed.

**Attempt 1 — INSERT SQL (e57b0e0):** all 598 people already existed as Wikidata rows; the `WHERE NOT EXISTS` guard correctly rejected everything → count 0.

**Attempt 2 — UPDATE SQL (ccfbf4f):** an 8,559-line paste into Supabase Studio **silently rolled back** (whole-file transaction; Studio showed no error). Zero rows enriched.

**False positive:** staging showed rich Indian cards after Part C (a75dff3) removed the client-side merge. This was misread as migration success. In reality, staging was running a **stale build** that still contained the old merge code. The DB was unenriched throughout. (See §2 meta-lesson.)

**Compounding error:** commit 5d789f5 (Prompt 5-K) added `known_for` to the Supabase SELECT before the column existed. This caused `getRankedBirthdayCelebrities` to silently return `[]` (Supabase error → swallowed), so all verify-print runs from 5-K onwards were rendering the **frozen report blob**, not live-fetched data. Layout assertions still held; data assertions were not against live data.

**Actual migration (2026-07-03):** user ran `ALTER TABLE celebrity_sitelinks ADD COLUMN IF NOT EXISTS known_for TEXT, ADD COLUMN IF NOT EXISTS tier TEXT` in Studio (verified). `scripts/migrate-indian-celebs.mjs` was written as the definitive approach — Node script using the Supabase JS client with the service-role key, sequential per-row UPDATEs, per-row error reporting, partial-progress-preserved. **This is the pattern for all future bulk data work. Never paste large SQL into Studio.**

- Part C (a75dff3): merge removed from all call sites; `IndianCelebrityService.ts` deleted; `indianCelebrities.ts` kept on disk with a MIGRATED header as the curation backup — nothing imports it.
- Indian-first ordering in code: ReportView sorts `nationality_code === 'IN'` first unconditionally; TodaysBirthdays country-gates the boost (see §8).

### Indian celebrity dedupe (2026-07-03)

`scripts/migrate-indian-celebs.mjs` inserted 381 fresh rows for TS entries that had no `(name, birth_month_day)` match in the Wikidata seed. ~26 of those were date-conflict duplicates — the same person as an existing Wikidata row but on a different date, so the UPDATE missed them and INSERT created a twin instead.

**Classifier used by `scripts/dedupe-indian-celebs.mjs`:**
- Fresh row: `nationality_code = 'IN'` AND `created_at ∈ [2026-07-03T00:00:00Z, 2026-07-04T00:00:00Z)` (hardcoded migration date, not 'today')
- Original row: any row with `created_at < 2026-07-03T00:00:00Z` that matches the fresh row's name via `ilike`
- `wikidata_id` is NOT used — it is NULL for all rows table-wide

**Standing date policy (user-approved):** Wikidata date wins, EXCEPT when the Wikidata `birth_month_day` is `'01-01'` (unknown-day placeholder) — then the curated TS date wins. If TS date wins, `birth_date` is also updated (original may hold a `YYYY-01-01` placeholder).

**Results:**
- 23 pairs resolved by the script: surviving original row updated with `nationality='Indian'`, `nationality_code='IN'`, `known_for`, `tier`, winning `birth_month_day`; fresh duplicate deleted.
- 3 pairs (Aryabhata, Sai Baba of Shirdi, Sarvepalli Radhakrishnan) hit the `celebrity_sitelinks_name_birth_date_key` unique constraint — the UPDATE would have placed the original onto a `(name, birth_date)` slot already occupied by the fresh row. Resolution: inverted strategy in Studio — kept the fresh enriched row (already had `nationality_code`, `known_for`, `tier`), manually copied `sitelinks` from the bare original (83 / 95 / 42 respectively), then deleted the original. Verified: zero IN duplicates remain, all three on correct dates.

### Images
No image column. `WikipediaImageService.fetchCelebrityImage()` hits the Wikipedia pageimages API client-side at render, 7-day localStorage cache, initials-avatar fallback.

---

## 6. Celebrity card spec (5d789f5)

**Design rationale:** the descriptor answers "who is this?"; the hook answers "why do I care?" Competitors show one line because Wikidata is all they have. Our curated `known_for` (film names, quotes) creates recognition a category label can't — it is a differentiator, especially for Indian users. Presentation discipline, not deletion, is what prevents clutter.

**Screen card (shared `CelebrityCard.tsx`, all web surfaces):**
photo (Wikipedia, initials fallback) · name · descriptor (occupation, quiet gray) · hook (`known_for`, hard-capped ONE line, CSS ellipsis, full text in `title` attr, rendered only when non-null) · years (`1951 – 2025` deceased / `Born 1980 · Age 46` living) · Wikipedia link.
The dark tooltip bubbles and StarIcon on /age-calculator were removed as part of this.

**Print card (markup lives in ReportView — deliberately NOT extracted; it's embedded in the print table with sort/icon logic):**
star · name · `b. 1963 †` · descriptor · hook at FULL length up to 3 lines (print is read slowly) · Indian tag. NO photos, NO URLs. One attribution line after the grid: "Biographical details from Wikipedia."

**Rules:** hooks are CURATED ONLY (currently the 598 Indian rows). Never auto-generate hooks from Wikidata — that produces descriptor-repeated-twice cards. Rows without a hook render as single-descriptor cards; that is correct. Two-line status is contingent on hook quality; revisit with post-launch click data (Wikipedia CTR, twins-section dwell).

---

## 7. Decision log (chronological, with commits)

| Decision | Why | Commit(s) |
|---|---|---|
| Native table thead/tfoot for print chrome | Only mechanism Blink repeats per-page with space reservation | 281c681 |
| @page margin:0 + baked insets | Matches Longevity; suppresses dialog furniture | b7964c4 |
| Relax break-inside on prose sections | Whole-section jumps caused near-blank pages | eb10876 |
| Headless PDF verification script | Manual export/upload loop was the bottleneck | 9c491dd |
| Header name right-aligned; specificity fixes | Match Longevity; `.print-only` cascade race | 3b3d797 |
| Longevity: DOB on cover, buttons to bottom + no-print | Recipient trust; buttons broke reading flow | cc992cd |
| Cover: flex column + min-height 297mm + gold rules/tagline | Fill 60% blank cover (option B chosen over accept/promote-content) | e8c9257 |
| KINDRED → TWINS; numerology break-before; Cosmic intro; biorhythm note moved above chart | Label clarity; orphan prevention; context before content; disclaimer before consumption | 778b365 |
| Indian data: UPDATE-not-INSERT migration; Node script over SQL paste | Rows pre-existed in Wikidata seed; Studio silently rolls back big pastes | ccfbf4f + script |
| Remove client-side merge | DB now holds the enriched data; one source of truth | a75dff3 |
| Indian celebrity dedupe: script (23) + Studio inverse (3) | 26 date-conflict twins from migration; UNIQUE(name,birth_date) forced 3 manual inverts | dedupe script |
| Unified two-line card | See §6 | 5d789f5 |
| PDF: no photos, no raw URLs, single attribution line | Low-res inconsistent thumbnails; URLs are dead weight on paper | 5d789f5 |
| Server-side PDF rendering | REJECTED — client-side proven sufficient, no backend cost | — |
| Storage posture (2026-07-05) | **Longevity/health inputs = browser-only, never server-side, by design and policy.** Do not add server-side health storage; monthly-comparison features use browser localStorage; any future cross-device sync requires explicit opt-in. **Birthday Blueprint reports = stored for delivery** (recipient can't otherwise access), 12-month dormancy auto-deletion, recipient deletion rights via privacy@bornclock.com. Payments de-identified (user_id SET NULL) on account deletion — retained for tax/legal per GDPR Art. 17(3)(e). Rationale: GDPR minimisation + no sensitive data at rest. | 5Q session |

---

## 8. Open items & follow-ups (with context — the section that saves the next session)

**Data**
- **~~Stage 2 enrichment~~ CLOSED 2026-07-06:** 24,567 / 26,307 rows enriched (93.4%). Sweep rescued 3,256 transient failures (rate-limit retries + partial SPARQL timeouts). 1,740 hard exceptions remain — stored as name + years only by design (obscure historical figures with no Wikidata entity; forcing a match would introduce false data). 30-row human validation passed. `@/data/celebrities` static fallback can now be retired when convenient (Stage 2 fills sitelinks for enough rows); until then the <20-results path still uses it. **Scripts remain in repo** (`scripts/enrich-celebrities.mjs`, `scripts/lib/wikidata-match.mjs`) for incremental re-runs as Wikidata gains coverage.
- **~~44-name January review list~~ RESOLVED (2026-07-04):** `scripts/fix-january-dates.mjs` resolved 18 fixes + 23 confirmed from 48 rows (Phase 3's 44 + 4 `01-01` entries). 7 exceptions remain for manual-when-convenient (see §5). Ilayaraja manually resolved in Studio (06-02). 38% of the January rows had wrong dates; non-January corruptions are inherited by Stage 2.
- **Four non-Indian June-25 rows have confirmed NULL occupation** (George Michael, Bourdain, Abrikosov, Jensen) — DB is unenriched. Stage 2 covers them. Until then they render as single-descriptor cards with "Celebrity" as fallback.
- **~~CelebrityMatch.tsx (/age-calculator) uses static file~~ RESOLVED (d83e1d7):** CelebrityMatch now calls `getRankedBirthdayCelebrities` (same Supabase path as /results, `userCountry='IN'`, limit=12). `/age-calculator` and `/results` now show the same ranked celebrity data. `@/data/celebrities` is deprecated — still imported by `BirthdaySearchService.searchLocalDatabase()` for the <20-results static fallback; do not delete until Stage 2 fills sitelinks for enough rows to retire that path.
- **TodaysBirthdays country-gate uses `profile?.country` (Supabase auth profile field, not real-time geo/locale).** Typically IP-detected at signup. NRIs who signed up outside India won't get the Indian-first boost; NRIs who signed up in India will. Likely correct for SEO; document product intent if NRI precision matters.

**Print/report**
- **~~verify-print live-fetch guard missing~~ RESOLVED (f810fe5):** invisible 1px white span `·LIVE·`/`·FROZEN·` in the Twins section; assertion 5f in verify-print.mjs confirms live Supabase fetch on every run. See §4 for the mechanism.
- **Print Indian tag confirmed in code as `🇮🇳 Indian` (ReportView.tsx:703).** Visual render in Chromium headless PDF still unverified — flag emoji are the least portable class; verify-print doesn't currently assert on Twins section content. Prior safe fallback was plain gold "Indian" text if emoji fails.
- **~~verify-print.mjs runtime trim~~ RESOLVED (79e31cd):** `vite preview` + `waitForSelector('[data-celeb-source]')` → ~4s total. See §4.
- Sparse-page list review on next export; standing decision: continuous flow vs section-per-page.
- **~~Cancer plural content pass~~ RESOLVED (7d91742):** "Cancers" → "Cancer natives"/"Cancerians" in 5 files (zodiacData, birthdayMonthContent, birthdayPersonality, compatibilityData, blogPosts). Other 11 signs confirmed clean.
- Optional parked: monochrome emoji brand restyle (⭐→★ model).

**Phase 3 (pre-launch)**
1080×1080 shareable card (ShareableCard.tsx exists) · Supabase column for PDF download tracking · Razorpay webhook verification · Search Console DNS staging→prod · celebrity-surface architecture already unified (was a Phase 3 item; done early).

**Operational**
- Staging must be redeployed to ≥ a75dff3 / 5d789f5 to reflect session-5 work (KINDRED sighting on staging was a stale build).
- Console `moz-extension://...content-end.ts.js` TypeError = Firefox extension noise; ignore.

---

## 9. Maintenance runbook

- **Verify print:** `node scripts/verify-print.mjs` — read the sparse list, not just the pass/fail.
- **Payment flow testing:** must be done in a clean browser with no content-blocking extensions (uBlock, Privacy Badger, Ghostery, etc.). Content blockers mangle Razorpay checkout: they suppress the phone-collection step, show wrong amounts (₹5 instead of ₹299), and cause spurious "input_validation_failed" errors that have nothing to do with the code. Confirmed via Safari control test (2026-07-06): checkout showed ₹299 correctly and rendered the phone step that Firefox with content filtering never showed. Use Safari, a clean Chrome profile, or an incognito window with extensions disabled. Do not diagnose payment failures observed in a content-filtered browser.
- **Payment diagnosis script:** `node --env-file=.env.local scripts/diagnose-razorpay.mjs --latest` (inspect newest sub) or `--sub <id>` for a specific one. Requires a flag — no-arg invocation errors. `--create-fresh` calls the local endpoint and checks server-side success criteria; `--cancel-orphans` cancels inert "created"-state test subs from the last 24 h.
- **Dormancy sweep:** Run `scripts/sweep-dormant-reports.sql` manually in Studio (two statements — SELECT first to review, then DELETE). No scheduler exists by design. Run quarterly or before any GDPR audit. Policy: reports unviewed for 12 months are deleted (see §7 storage posture entry and Privacy Policy Amendment 5).
- **Add/edit a celebrity:** edit the row in Supabase `celebrity_sitelinks` (occupation = descriptor, known_for = hook, nationality_code for boosting). No deploy needed. For bulk work, use `scripts/migrate-indian-celebs.mjs` as the pattern template (Supabase JS client, sequential per-row updates, per-row error reporting); never paste large SQL into Studio.
- **Add a curated hook to a global celebrity:** set `known_for` on their row; the card picks it up everywhere automatically.
- **Print CSS changes:** validate in headless Chromium BEFORE writing the commit; keep print-only geometry inside the pageStyle string, never in screen CSS.
- **New print sections:** must live inside the existing tbody cell; respect the break policy in §3.

---

## 10. Phase 4 — Post-launch growth roadmap (researched 2026-07-03, pre-launch)

> Purpose: decisions and research made BEFORE launch about what comes AFTER launch, so the growth phase starts from conclusions, not from scratch. Priority order within this section is deliberate.

### 10.1 The strategic frame (decided)

- **1M monthly visitors target:** not achievable in 6 months (new-domain trust period; realistic month-6 ceiling ~50–100K even with good execution). Achievable in ~12 months ONLY via programmatic SEO at scale. Set expectations accordingly.
- **Revenue model reality (researched, blunt):** Indian entertainment-niche display RPM is $0.50–$1.50; a US visitor is worth 5–10× an Indian one for ads. At every modeled traffic level, the PAID REPORT is 70–85% of revenue; ads are found money. Projections modeled 2026-07: month 6 realistic total ₹15K–70K/mo; month 12 good-execution ₹1.5–4.5L/mo; month 12 if 1M traffic with 20–30% tier-1 share ₹3.5–10L/mo. Conversion assumption 0.1–0.2% visitor→purchase on cold SEO traffic; gift-intent pages convert better than celebrity-page traffic.
- **Geography strategy (decided):** one site, geo-adaptive, not geo-split. India = report revenue + volume base + content moat (Indian celebrity depth). Tier-1 (US/UK/CA/AU) = ad revenue + brand authority + eventual $-priced report. The traffic product and the revenue product have different geographies by design (FamousBirthdays pattern: US/UK/Brazil audience).
- **Ads sequencing (decided):** do NOT enable display ads at launch. Enable when tier-1 share crosses ~20–25% of meaningful volume. Never on the paid report flow.
- **Cultural content (decided):** do not strip Vedic depth for tier-1; use section EMPHASIS by audience — tier-1 marketing leads with Western zodiac/numerology/tarot, India leads with the full trio. Landing-page decision, not a product rebuild.

### 10.2 Priority 1 — Programmatic SEO (the 1M engine)

Competitive basis: FamousBirthdays = 9.5–22M visits/mo, ~70% organic, 4.2M ranking keywords via ~150K celebrity profile pages + date pages. The model is one page per entity at scale, each answering a query pattern ("[name] age/birthday/zodiac").

Our asset: the enriched celebrity_sitelinks table (25,952 rows post-Stage-2) IS the programmatic dataset. Stage 2 is therefore a growth prerequisite, not just report polish.

Build order:
1. **Celebrity pages** `/celebrity/[slug]`: photo, LIVE age ticker (our differentiator vs static competitors), birthday, zodiac trio, Life Path, birthday twins, days-until-birthday, CTA into the paid report. Anti-thin-page requirement: every page must be a mini-product (computed live content), not a data stub — 60% of programmatic implementations fail on thinness; ours must not. Rollout in tiers: top ~2,000 by sitelinks first, watch Search Console, then expand.
2. **366 date pages** `/born-on/[month-day]`: who was born, zodiac, the date's stats. Generalization of /todays-birthdays; all data exists.
3. **Year/generation pages** `/born-in-[year]`: age now, generation portrait, Chinese zodiac year. ~100+ pages.
4. **Calculator-variant landing pages**: "how old am I if born in [year]", half-birthday, birthday compatibility — separate pages per query pattern around the existing calculator.
5. **Hindi versions** of top pages (FamousBirthdays got +15% traffic from Spanish alone; our Indian celebrity depth is the moat in Hindi queries).

Programmatic pages are ALSO the tier-1 vehicle: global celebrity pages compete in US/UK search with the same template that owns Indian search for Indian celebrities.

### 10.3 Priority 2 — Birth-framed population page + homepage ticker (user idea, validated 2026-07-03)

Reference: worldometers.info/world-population. Design decisions made: (a) no live API exists or is needed — all population clocks are algorithmic (UN World Population Prospects baseline + rate × elapsed seconds, client-side); ship a static UN WPP JSON (world + top ~15 countries), refresh annually; (b) reuse the existing "Total Seconds Alive" ticker component from /results; (c) frame around BIRTHS to fit the brand ("N babies born since you opened this page", "~385,000 people share today as their birthday", "you were roughly the X-billionth person born"), top-countries table as supporting content; (d) SEO: do not chase head terms (owned by Worldometer/UN/Census); target long-tail question queries ("how many people are born every day", "how many people share my birthday") with H2-question structure + FAQ schema + cited-methodology line for AEO; every answer routes into the birthday product. Effort ~1 session.

### 10.4 Priority 3 — International payments (the tier-1 revenue unlock)

Razorpay alone cannot take most international cards. When tier-1 traffic shows purchase intent (watch for non-IN sessions reaching the paywall): add a second processor (Stripe/PayPal) + $-denominated pricing + geo-adaptive currency display. Until then, tier-1 monetization = ads + brand only. Related geo-adaptive items: date-format localization (June 25 vs 25 June), country-driven celebrity ordering (built — profile.country gate), IP-based geo for anonymous visitors (not built).

### 10.5 Existing features that carry the growth phase

/todays-birthdays (already SEO-structured: reviewed-by + sources markup), the age calculator (huge evergreen head-term volume), the zodiac/numerology content depth (unusually rich vs competitors — prime AEO material), the shareable 1080×1080 card (Phase 3 item — the only non-SEO acquisition channel), and above all the enriched celebrity DB. Framing to remember: **the report is the revenue product; the database is the traffic product.**

### 10.6 Supporting research anchors (for future reference)

- FamousBirthdays traffic/keyword figures: SimilarWeb/Semrush/Clicks.so estimates 2024–2026, Digiday & dot.LA profiles (programmatic-ads business model, editorial staff, +15% from Spanish version).
- India AdSense RPM ranges: entertainment ₹40–₹165 RPM (upGrowth 2026 benchmarks); US 5–10× multiplier (multiple publisher sources).
- Programmatic SEO failure modes: ~60% fail on thin/undifferentiated pages; mitigation = every page a mini-product with unique computed data.
