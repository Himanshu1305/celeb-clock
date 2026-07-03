# BornClock — Architecture Decisions & Maintenance Log

> Purpose: capture WHAT was built, WHY it was built that way, what failed before it, and what remains open — so future sessions don't re-derive this from scratch. Update this file whenever a significant decision lands.
> Last updated: 2026-07-03 (session 5).

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

**Meta-lesson (earned twice, expensively):** when something works elsewhere in the codebase, DIFF AGAINST IT and replicate. Do not theorize new architecture. Validate print-CSS candidates in headless Chromium before committing. Prefer tools the repo already has (e.g. the Supabase JS client) over external tooling (psql, Studio mega-pastes).

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

`scripts/verify-print.mjs` (9c491dd, kept in sync at 84700c2) renders the real Neeraj report headlessly (Playwright + Chromium) and asserts on the printed PDF:
- running header on every content page; footer on every page; cover bare
- no dialog-furniture strings; page count; clipping check (content vs reserved bands)
- **sparse-page report** — pages with fill < ~0.55 are LISTED FOR REVIEW, not asserted. Green assertions ≠ blank-space resolved; read the list.
- **faithfulness self-check runs first** (header must repeat on pages 2 AND 3); if it fails, the print CSS wasn't applied and the run aborts rather than asserting against a bogus PDF.

Notes: headless PDF generation never adds dialog furniture, so the no-furniture assertion validates content/CSS only. Known issue: a full run took ~28 min at one point — **runtime trim is an open task** (suspects: dev-server start, networkidle hang, PNG step).

Test reference person: **Neeraj, born June 25, 1966** — Cancer / Horse / Mithuna / Sagittarius Moon / Purva Ashadha / Life Path 8 / Strength tarot. Every before/after uses this report.

---

## 5. Celebrity data model

### The table (the big discovery of session 5)
`celebrity_sitelinks` is a **pre-existing Wikidata bulk seed of 25,952 rows** — not a hand-curated table. Columns: `id, name, birth_date, birth_month_day (text, zero-padded 'MM-DD'), death_date, sitelinks (int — count of Wikipedia language editions; the notability/ranking proxy), nationality, nationality_code, occupation, wikidata_id, wikipedia_url, created_at`, plus `known_for` and `tier` (added 2026-07).

Before session 5: `occupation`, `wikipedia_url`, `nationality*` were NULL for essentially all rows. Rich display data came from client-side overlays, not the DB.

### The Indian celebrity migration (e57b0e0 → ccfbf4f → executed via Node script)
- `src/data/indianCelebrities.ts` (598 entries, hand-curated: occupation, known_for, tier) used to be injected client-side by `mergeWithIndianCelebrities()` on top of DB results. This was **enrichment of stub Wikidata rows**, not duplicate injection — the reason the merge existed.
- Migration history: an INSERT-based SQL file was wrong (all 598 people already existed as Wikidata rows; the WHERE NOT EXISTS guard correctly rejected everything → count 0). Rewritten as UPDATEs matching `lower(name) + birth_month_day`. An 8,559-line paste into Supabase Studio **silently rolled back** (whole-file transaction; no error surfaced). Final, working approach: `scripts/migrate-indian-celebs.mjs` — Node script using the Supabase JS client with the service-role key; per-row errors, partial progress preserved. **Use this pattern for all future bulk data work. Never paste large SQL into Studio.**
- Result: 598 rows enriched with `nationality='Indian'`, `nationality_code='IN'`, `occupation` (COALESCE-preserving), `known_for`, `tier`.
- Part C (a75dff3): merge removed from all call sites; `IndianCelebrityService.ts` deleted; `indianCelebrities.ts` kept on disk with a MIGRATED header as the curation backup — nothing imports it.
- Indian-first ordering preserved in code: ReportView sorts `nationality_code === 'IN'` first unconditionally; TodaysBirthdays **country-gates** the boost. This divergence was introduced by Claude Code, judged sensible (global SEO page shouldn't boost Indian rows for non-Indian visitors), but the gate mechanism needs confirming — see open items.

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
| Unified two-line card | See §6 | 5d789f5 |
| PDF: no photos, no raw URLs, single attribution line | Low-res inconsistent thumbnails; URLs are dead weight on paper | 5d789f5 |
| Server-side PDF rendering | REJECTED — client-side proven sufficient, no backend cost | — |

---

## 8. Open items & follow-ups (with context — the section that saves the next session)

**Data**
- **Stage 2 enrichment (highest-leverage task):** for all 25,952 rows, pull the Wikidata short **description** and **wikipedia_url** using the existing `wikidata_id` column. NOT an import — the seed already exists; this fills two fields. Reuse the `migrate-indian-celebs.mjs` pattern (batch, per-row errors, summary). Rate-limit Wikidata politely. Do NOT write hooks in this pass.
- Four non-Indian June-25 rows may still have NULL occupation (George Michael, Bourdain, Abrikosov, Jensen) unless the manual UPDATEs were run in Studio — verify; Stage 2 covers them regardless.
- **CelebrityMatch.tsx (/age-calculator) still uses static `@/data/celebrities` (~50 entries) — Supabase not connected.** People shown on /age-calculator can diverge from /results; gap remains. The `birthdayData.ts` / month files are used by TodaysBirthdays as a <20-results fallback only — decide whether to retire them once Stage 2 enrichment fills occupation/sitelinks for more rows.
- **TodaysBirthdays country-gate uses `profile?.country` (Supabase auth profile field, not real-time geo/locale).** Typically IP-detected at signup. NRIs who signed up outside India won't get the Indian-first boost; NRIs who signed up in India will. Likely correct for SEO; document product intent if NRI precision matters.

**Print/report**
- **Print Indian tag confirmed in code as `🇮🇳 Indian` (ReportView.tsx:703).** Visual render in Chromium headless PDF still unverified — flag emoji are the least portable class; verify-print doesn't currently assert on Twins section content. Prior safe fallback was plain gold "Indian" text if emoji fails.
- verify-print.mjs runtime trim (~28 min observed once).
- Sparse-page list review on next export; standing decision: continuous flow vs section-per-page.
- Content pass: replace standalone plural "Cancers" with "Cancer natives"/"Cancerians" in zodiac prose (research: both are industry-standard; ours collides visually with the disease).
- Optional parked: monochrome emoji brand restyle (⭐→★ model).

**Phase 3 (pre-launch)**
1080×1080 shareable card (ShareableCard.tsx exists) · Supabase column for PDF download tracking · Razorpay webhook verification · Search Console DNS staging→prod · celebrity-surface architecture already unified (was a Phase 3 item; done early).

**Operational**
- Staging must be redeployed to ≥ a75dff3 / 5d789f5 to reflect session-5 work (KINDRED sighting on staging was a stale build).
- Console `moz-extension://...content-end.ts.js` TypeError = Firefox extension noise; ignore.

---

## 9. Maintenance runbook

- **Verify print:** `node scripts/verify-print.mjs` — read the sparse list, not just the pass/fail.
- **Add/edit a celebrity:** edit the row in Supabase `celebrity_sitelinks` (occupation = descriptor, known_for = hook, nationality_code for boosting). No deploy needed. For bulk work, copy the `migrate-indian-celebs.mjs` pattern; never paste large SQL into Studio.
- **Add a curated hook to a global celebrity:** set `known_for` on their row; the card picks it up everywhere automatically.
- **Print CSS changes:** validate in headless Chromium BEFORE writing the commit; keep print-only geometry inside the pageStyle string, never in screen CSS.
- **New print sections:** must live inside the existing tbody cell; respect the break policy in §3.
