# Part AK — Deep Pages, DOB Carry-Forward, Teaser, Color Fix — Final Report

**Branch:** `part-aj-four-page-redesign` (continued — NO new branch, NO branch from develop).
**This stacks on top of last night's still-pending Part AJ review.** Nothing merged, no real
`wrangler deploy` — ends at an updated preview, same as before. **The three Part AJ flags
(FLAG 1/2/3) were left untouched**, as instructed.

**Preview URL:** **https://0e6dc74c-bornclock.usdvisionai.workers.dev** (Worker Version
`0e6dc74c-e617-40ab-b7d8-d08448eb4cb3`). Prod-safe `wrangler versions upload` — **NOT** promoted
to live. Full build: 3630 routes prerendered, sitemap 3630 URLs, assets uploaded.

---

## Part 0 — Audit (full results)
Traced every internal link from the four hub pages, mapped each to its component, and classified
its design. **Result: every deeper tool/report page is OLD design — none used the `paj` system.**
Full list in `docs/part-ak-audit.md`. Derived Tier-2 priority: the core Vedic tools reached from
the Vedic hub's toolkit/go-deeper grids first (kundali-match → sade-sati → muhurat →
gemstones/rashi-ratna → career-report → sun-vs-moon/moon-sign → shared/Mystic/Birthday tools).

| Hub | Deep pages (all OLD at audit time) |
|---|---|
| Vedic | /kundali, /kundali-match, /sade-sati, /muhurat, /career-report, /gemstones, /rashi-ratna, /sun-vs-moon-sign, /moon-sign, /astrologer |
| Birthday | /celebrity, /todays-birthdays, /born-on, /age-calculator, /numerology, /zodiac, /chinese-zodiac, /birthday-report (paid) |
| Mystic | /numerology, /name-numerology, /zodiac, /chinese-zodiac, /compatibility, /tarot-card-by-birthday |
| Science (deferred hub) | /biological-age, /country-comparison, /coach, /upgrade, 10× /life-expectancy-<country>, /birthday-report |

---

## Tier 1 — all four fixes done (with evidence)

### 1.1 Background color / variant-layout — FIXED ✅
**Root cause (bigger than a token):** the CSS generator scoped the four design-variant classes
(editorial/atlas/field-guide/workbench) as **descendants** (`.paj .editorial …`), but they live on
the **same element** as `.paj` (`class="paj editorial"`). So **every variant layout rule silently
never matched** — the editorial 2-column hero collapsed to a **stacked full-width white chart
panel** (exactly the "reads white" symptom), and atlas/field-guide heroes fell back too.
- **Before:** `--bg` was already `#FAF7F0` (token correct), but the white hero-visual spanned full
  width → page read as mostly white.
- **Fix:** `scripts/build-paj-css.mjs` now attaches the variant classes with no space
  (`.paj.editorial …`); regenerated `src/styles/part-aj.css`.
- **After:** verified `.paj` computes to `rgb(250,247,240)`; the editorial (Vedic), field-guide
  (Birthday) and atlas (Mystic) heroes now render in their intended multi-column layouts and the
  **ivory canvas dominates** (white only on surface cards), matching the reference files. Desktop
  screenshots confirmed on all three. Commit `aa85f68`.

### 1.2 Birth-details carry-forward — BUILT ✅ (date + time + place, not just date)
Extended Birthday's `?dob=` pattern (NOT a new mechanism) to carry **all three** fields a real
chart needs: `/kundali?dob=…&time=…&place=…&lat=…&lon=…&tz=…[&name=…]` (coordinates included,
since Lagna/Dasha need the exact place, not a name).
- `/vedic-astrology`'s hero now builds this URL and hands it forward (see 1.3).
- `/kundali` parses it on mount and **auto-generates with zero re-entry**.
- **Logged-in / saved full profile:** `/kundali` auto-generates straight from the saved profile
  (skip asking entirely) via the existing `useSavedProfile` infra.
- **Precedence rule (verified):** fresh carried URL details > in-app router state > saved profile.
  A saved profile never overrides details the user just entered this session.
- **Unknown/missing birth time:** handled gracefully — partial params pre-fill the standalone form
  instead of auto-running (no crash).
- **Edge cases verified (local):** (a) bare `/kundali` with no params / not logged in → its own
  standalone form still works; (b) carried params → form pre-filled + auto-run + "using the details
  you just entered" banner; (c) no mobile overflow. Commit `527d9e2`.

### 1.3 Inline teaser on `/vedic-astrology` — BUILT ✅
On hero submit, a real computed preview now renders **on the landing page** — Lagna, Rashi,
Nakshatra (with glossary tooltips) + the current **Dasha** headline fact, from the same engine —
with a **"See your full chart →"** button carrying the details forward to `/kundali` (no re-entry).
If the engine is briefly unreachable, the carry-forward link still works. Commit `527d9e2`.

### 1.4 `/kundali` redesigned to the new system — DONE ✅
Full paj editorial (ivory/navy/gold, Fraunces, edge-to-edge, breadcrumb, `chart-stats`,
`data-table`). **Every real feature carried forward:** full chart (`KundaliChart`), planet table,
interpretation blocks, the personal reading (`VedicReading` — which includes Pratyantardasha and
the yoga grade), reading history, saved-profile banner + "use different details", chart-event
notices + notify opt-in, WhatsApp share, gift/report CTAs. Added `TermTip` glossary on
Lagna/Rashi/Nakshatra/Dasha/ayanamsa. All `data-testid`s preserved. Commit `527d9e2`.

**Tier 1 testing:** full unit suite **1860/1860 pass** (before and after); `tsc` 0 errors; `vite
build` OK; local flow verified (enter on /vedic-astrology → inline teaser → carry-forward to
/kundali with no re-entry → chart in new design); all three edge cases pass; no mobile overflow.

---

## Tier 2 — pages redesigned this session (in audited priority order)
Each: full paj conversion, all real functionality + `data-testid`s preserved, full suite green,
desktop screenshot + mobile overflow check, committed individually.

1. **/kundali-match** (Guna Milan) ✅ — two-person forms + real birthplace geocoding, saved-profile
   reuse for Person A + "use different details", optional names, full 36-point result (8-koota
   breakdown, dosha cancellation, marriage-timing windows, methodology), print/PDF. Commit — see log.
2. **/sade-sati** ✅ — BirthDetailsForm + saved-profile prefill, active/phase verdict, impact-first
   narrative, current/next cycle dates, Dhaiya, methodology, calm non-fear-based upay/remedies.
3. **/muhurat** ✅ — occasion list, required-location geocoding, custom start + look-ahead range,
   auspicious-day Panchang results (Tithi/Nakshatra/Yoga/weekday + Rahu Kalam), methodology, glossary.
4. **/gemstones** ✅ — Ascendant-lord suggestion, primary/additional cards, methodology-first,
   wearing ritual + sizing, Rashi Ratna cross-reference, avoid list, heavy honest disclaimer.
5. **/rashi-ratna** ✅ — 12-Rashi gemstone selector grid, Navratna info, FAQ + FAQSchema, glossary,
   Gemstone cross-reference (completes the gemstone pair).

**Deferred to a future session (time-box):** remaining old-design deep pages not reached —
`/career-report`, `/sun-vs-moon-sign`, `/moon-sign`, `/astrologer`, and the shared/Mystic/Birthday
tools (`/numerology`, `/zodiac`, `/chinese-zodiac`, `/name-numerology`, `/compatibility`,
`/tarot-card-by-birthday`, `/celebrity`, `/todays-birthdays`, `/born-on`, `/age-calculator`) plus
the Science-hub sub-pages (tied to the still-deferred FLAG 3). None left half-done — every page
touched is fully converted, tested, and committed.

**No page hit the resource safety net this session** (none proved Science-level complex);
`docs/part-ak-flags.md` is therefore empty of new blockers.

---

## Testing summary (every checkpoint)
- Unit suite: **1860/1860 pass** after every page (Tier 1 and each Tier 2 page).
- `tsc --noEmit`: **0 errors** throughout. `vite build`: OK throughout.
- Carry-forward flow verified end-to-end locally (prefill + auto-run + precedence banner; bare form
  works; unknown-time graceful).
- Mobile: no horizontal overflow on `/kundali`, `/kundali-match`, `/sade-sati`, `/muhurat`,
  `/rashi-ratna`; no page JS errors.
- Color fix verified visually (ivory dominant) on the redesigned hubs.
- **Final preview verification (against the preview URL specifically):**
  - **Carry-forward end-to-end:** `/kundali?dob=1990-03-14&time=10:30&place=New Delhi&lat=…&lon=…&tz=…&name=Asha`
    → shows the "birth details you just entered" banner, auto-computes a **real 9-planet chart**
    from the live engine (Lagna Vrishabha/Taurus), WhatsApp share present. Zero re-entry. No JS errors.
  - **Color fix:** `.paj` computes to `rgb(250,247,240)` (ivory) and the editorial hero renders
    **two columns** (`646px 633px`) — confirming the variant-scoping fix on the live preview.
  - **All six redesigned deep pages** (`/kundali`, `/kundali-match`, `/sade-sati`, `/muhurat`,
    `/gemstones`, `/rashi-ratna`): HTTP 200, `.paj` active, **no mobile overflow, no JS errors.**
  - Prerendered new H1s confirmed for the prerendered routes (`/kundali` "Your Kundali, computed.",
    `/kundali-match` "Kundali Matching.", `/rashi-ratna` "Rashi Ratna — Indian Vedic Birthstones");
    `/sade-sati`, `/muhurat`, `/gemstones` are client-rendered SPA routes (pre-existing — not in the
    prerender list — they render the new design via React at load, verified above).

## Commits this session (on `part-aj-four-page-redesign`)
`aa85f68` audit + variant-scoping/ivory fix · `527d9e2` DOB carry-forward + teaser + /kundali ·
then /kundali-match, /sade-sati, /muhurat, /gemstones, /rashi-ratna (one commit each) · final
report + preview.

## Not done (unchanged guardrails)
No merge; no real `wrangler deploy` / `versions deploy` / rollback. No change to `/birthday-report`
paid logic, the longevity engine, paywall, or pricing. **FLAG 1/2/3 untouched.**
