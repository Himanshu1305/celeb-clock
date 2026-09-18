# Part W — Phase 0 Dependency Map (Vedic Astrology landing page)

## 14 Vedic tool routes — ALL confirmed present in `src/App.tsx`
/kundali · /kundali-match · /astrologer · /sade-sati · /muhurat · /career-report ·
/gemstones · /zodiac · /chinese-zodiac · /vedic-zodiac · /moon-sign · /compatibility ·
/rashi-ratna · /sun-vs-moon-sign → **14 confirmed.**

## REAL stat numbers (verified from the engine — prompt's 11/16 were BOTH wrong)

### Classical yogas detected: **5** (NOT 11)
The engine's yoga catalog (`src/lib/vedic/yogas.ts`) contains exactly 5 detectable
yogas: **Raj Yoga, Dhana Yoga, Gaja Kesari Yoga, Budha-Aditya Yoga, Chandra-Mangal
Yoga.** Verified by extracting every `name:` in the detector. → use **5**.

### Divisional charts computed: **8** (NOT 16)
A standard `calculateBirthChart` run genuinely computes these divisional charts with
real varga transforms:
- Reading-surfaced (buildDivisionalCharts + validated in engine.test.ts): **D9 Navamsa,
  D10 Dasamsa, D60 Shashtiamsa** (3).
- Computed internally for Saptavargaja Bala (calculateBirthChart.ts:250–258): **D1 Rasi,
  D2 Hora, D3 Drekkana, D7 Saptamsa, D12 Dwadasamsa** (+D9 already counted).
- Union of genuinely-computed, real-transform charts: **D1, D2, D3, D7, D9, D10, D12,
  D60 = 8.**
- EXCLUDED as not honestly "computed": D30 Trimsamsa (code uses a rasi proxy, comment
  says "D30 sign not exposed as index; rasi proxy"), and ~7 varga functions that EXIST
  in vedicEngine (D4, D16, D20, D24, D27, D40, D45) but are never called in the pipeline.
→ use **8** ("divisional charts computed"), with the exact list above as proof. The
most conservative alternative is **3** (only the reading-surfaced/validated set) — see
flags for the decision.

### Vedic tools: **14** (accurate as given).

## Route-collision check — `/vedic-astrology` vs existing routes
- `/vedic-astrology` is **FREE** — no exact route exists (grep of App.tsx).
- Similar existing routes: `/vedic-zodiac` (+`/vedic-zodiac/:rashi`) — the Indian-zodiac
  RASHI tool; `/articles/vedic-astrology-birth-chart`; `/answers/what-is-vedic-astrology`.
- **Confusion assessment:** `/vedic-astrology` = the CATEGORY LANDING hub; `/vedic-zodiac`
  = ONE tool inside it (linked from the landing as "Indian Zodiac (Vedic)"). The
  distinction is hub-vs-tool, which is conventional and clear. No rename needed. To make
  the difference explicit on-page, the landing labels the tool "Indian Zodiac (Vedic)"
  (not "Vedic Zodiac"). Flagged for awareness, proceeding with `/vedic-astrology`.

## SEO/AEO precedent (Part 1.5)
- `src/components/SEO.tsx`: `<SEO title description keywords canonicalUrl noindex=false>`
  — sets title/meta/canonical; `noindex` defaults FALSE (so indexable by default).
- `WebApplicationSchema({name, description, url})` already exported — reuse for the
  service/webapp schema (matches site precedent; no new pattern invented).
- **CRITICAL (memory):** crawled/prerendered title+meta come from
  `scripts/prerender-titles.mjs`, NOT the React SEO component. Must add a
  `/vedic-astrology` entry there too, plus add the route to `scripts/prerender-routes.mjs`
  `STATIC_ROUTES` (line ~186) so it's prerendered AND in the sitemap.

## Saved-profile integration (Part 3)
- `useSavedProfile()` → `{ profile, save, loaded, isFull }` (same hook /kundali uses).
- `/kundali` already auto-reuses a saved full profile. The landing's "Free Kundali" card
  will surface, when a saved profile exists, that saved details will be reused, and link
  to `/kundali` — consistent behavior, no new logic.

## Container / density convention (Part 2)
- Site uses `container mx-auto px-4` (Index.tsx:79; KundaliPage `max-w-3xl`). Content
  sections often narrow to `max-w-4xl`. For the edge-to-edge requirement, the landing
  uses the full `container mx-auto` width with grids that fill the row (no narrow
  centered `max-w-3xl` column), minimal vertical padding between sections.

## Hindi infrastructure
- i18n exists (en/hi) but this page's content is English-only for this session. The
  language selector is built as real UI; Hindi shows an honest "coming soon" state (no
  silent fail). Full Hindi translation of this page = flagged follow-up.

## Nav destination (Part 1.5)
- The "Vedic Astrology" nav trigger is a DROPDOWN (opens the 14 tools), so it can't
  itself navigate. The landing is made discoverable by adding it as the FIRST item in
  the Vedic dropdown ("Vedic Astrology — overview") — additive, no existing item removed.
  Nav spec EXPECTED.vedic updated accordingly (expected test update).
