# RC3 — Release Candidate 3 Report

**RC3 READY: YES**

Every RC3 item (1–5) is done and verified; the four critical Item-2 bugs are
confirmed fixed on the live staging URL with real, unmocked submissions; every
tool passes real use on all three browsers (Chromium desktop, WebKit iPhone,
Android Chrome); the full site-wide check suite is green; `rc3` is merged into
`develop` and both are pushed; and RC3 is deployed to `bornclock-staging` and
re-tested. Items that genuinely need the person (staging sign-in, the test-card
purchase, the AI-astrologer question behind sign-in) are listed under "Needs the
person" and — per the RC3 rules — do not make this NO.

- **Baseline automated suite:** 163 test files / 1940 tests passing; typecheck clean.
  Re-run after every change — never below baseline.
- **System load during the run:** load avg 2.06–2.79 on 8 cores (threshold = 4);
  no waiting required. Perf measured at load 2.79.
- **RC3 staging version (rc3 build):** `c0e24548-2894-4acf-a15f-545d46025fbb`
- **RC3 staging version (develop build, final — LIVE):** `6477b279-76b3-47fa-831b-9df9e4ea913b`
- **Current PRODUCTION version (read-only, for rollback):** `3b1808cb-80fc-4baf-bc5e-dbd49303fa2c` (created 2026-10-07; untouched)
- **Staging URL:** https://bornclock-staging.usdvisionai.workers.dev

---

## Items — evidence

### Item 1 — Bring in the backlog work ✅
`backlog-1` (items A–H) was merged into `rc3` (commits `f746c71`, `01ea201`);
full suite + typecheck pass. Verified present on `rc3`/`develop`.

### Item 2 — Manglik / Kaal Sarp failure fixed + API-contract audit ✅
Root fix in `src/lib/vedic/legacyAdapters.ts` (commit `46a72a5`): `toKundaliLegacy()`
now passes `doshas` and `dashaTimeline` through, the `lagna` crash is fixed
(object rendered as `result.lagna.sign`), and `/api/kundali` treats a cached row
missing those fields as a miss and recomputes (`_cache:'refreshed'`), without
deleting user data.

**Confirmed on live staging with a real, unmocked API call** (reference input
1978-05-13 19:30 Jammu, `/api/kundali`):
```
keys: _cache, dasha, dashaTimeline, doshas, lagna, nakshatra, planets, rashi, ...
_cache: hit            ← a CACHED row now carries the fields (stale-cache fix works)
doshas present: true   mangalDosha: true   kaalSarp: true
dashaTimeline present: true
lagna: { sign: 'Vrischika', degrees: 211.77, signIndex: 8 }  ← object, no crash
```
The `_cache: hit` proves the previously-cached-entry case (bug #4) is fixed: a
cache hit still returns `doshas`/`dashaTimeline`. A fresh (uncached) input returns
the same shape.

**API-contract audit** (each page's required fields confirmed present in the real
response, verified via the E2E real-use suite rendering the gated sections):

| Page / tool | Required field(s) | Present in real response | Evidence |
|---|---|---|---|
| `/manglik` | `doshas.mangalDosha` | ✅ | E2E renders Manglik result (3 browsers) |
| `/kaal-sarp-dosha` | `doshas.kaalSarp` | ✅ | E2E renders Kaal Sarp result (3 browsers) |
| `/kundali` | `lagna` (obj), `planets`, `dashaTimeline` | ✅ | chart + 5-level Dasha + What's Ahead all render |
| `/dasha-calculator` | `dashaTimeline` | ✅ | Dasha tree renders |
| `/birth-time` Vedic section | `lagna.sign` | ✅ | profile renders, zero page errors (lagna crash gone) |
| `/sade-sati`, `/gemstones`, `/career-report` | `planets`, `dasha` | ✅ | each renders its result |
| `/kundali-match` | both charts, Guna score | ✅ | Guna Milan score renders |

**Graceful fallback:** the engine is local-first; ProKerala is only a fallback
(its subscription has ended). The local astronomy-engine path is unchanged and
handled every request in testing (no ProKerala call needed). Invalid input returns
a clear `400` with a readable message (`"Invalid birth date (month/day out of range)"`)
— never a hang or 500.

### Item 3 — Correct the calculation-engine claims ✅ (commit `db2305d`)
The live chart engine is **astronomy-engine (Lahiri sidereal)**, not Swiss
Ephemeris. Inaccurate user-facing/served claims were corrected; accurate
cross-check and panchang references were kept.

| Surface | Before → After |
|---|---|
| `prerender-titles.mjs` `/vedic-astrology` meta | "computed with the Swiss Ephemeris" → "Your real Vedic birth chart, computed" |
| `VedicAstrologyLanding` body | "Node + Swiss Ephemeris" → "Node + astronomy-engine, Lahiri sidereal" |
| Breadcrumb editions (`KundaliPage`, landing) | "Sidereal · Lahiri · Swiss Ephemeris" → "Sidereal · Lahiri" |
| Trust strip (vedic landing) | "Computed with the Swiss Ephemeris…" → "Calculated from your exact birth date, time and place (sidereal · Lahiri)…" |
| "This record is generated with Swiss Ephemeris 2.10.03 (Moshier mode)" + astro.com link | → "generated with the open-source **astronomy-engine** library (v2.1)" + github.com/cosinekitty/astronomy link |
| FAQ "example chart calculated?" | "using Swiss Ephemeris (Moshier mode)" → "using the astronomy-engine library" |
| Share text | "Swiss Ephemeris, nothing templated" → "genuinely calculated, nothing templated" |
| `kundaliService.ts` header comment | "Node + Swiss Ephemeris" → "Node + astronomy-engine, Lahiri sidereal" |
| `BirthTimeVedicSection` sample-data comment | "Real Swiss-Ephemeris 2.10.03 output" → "Real astronomy-engine output" |

**Kept (accurate, verified which engine runs there):**
- `src/utils/vedicCalculations.ts` — a `@fusionstrings/panchangam` (Swiss-Eph WASM)
  panchang module; **test-only, not imported by any served page**, and the comment
  is accurate for that module.
- `admin/AccuracyDashboard.tsx` and `scripts/verify-nakshatra-accuracy.ts` — use
  Swiss Ephemeris as the **cross-check ground truth** (admin/script only). The doc
  says keep accurate cross-check claims; retained.

Grep of served `src/`, `scripts/`, `api/` confirms no inaccurate public "Swiss
Ephemeris"/"Moshier" claim remains.

### Item 4 — Plain-language trust strips with a "How we test" link ✅ (commit `1583f89`)
`TrustStrip` gained an optional `href` ("How we test →") threaded through
`PageHeader`/`layouts`; every strip was rewritten into plain, impact-first language
(no unexplained jargon) and points to the relevant `/how-it-works` section. On
`/how-it-works` (Methodology), the comparison service (**ProKerala**) and full
figures are named as past-testing results:

- **Mangal Dosha (Manglik, Lagna rule): 99–100%**
- **Kaal Sarp (whole-sign method): 96–100% (documented ~4% edge tolerance)**

Anchors `#vedic`, `#numerology`, `#celebrity-birthday` exist on the page.

Rewritten strips (samples, each true for its page, verified against the code):
- **Manglik:** "Your Mars placement is worked out from your real birth chart, not guessed from your star sign. In our tests, our Manglik result matched a leading Vedic astrology service in 99–100% of charts." → `/how-it-works#vedic`
- **Kaal Sarp:** "Every planet's position is worked out from your real birth chart. In our tests, our Kaal Sarp result matched a leading Vedic astrology service in 96–100% of charts (a few borderline charts can differ)." → `/how-it-works#vedic`
- **Kundali:** "Calculated from your exact birth date, time and place — not a template — and cross-checked against a leading Vedic astrology service before launch." → `/how-it-works#vedic`
- **Career:** "Built from your actual career house (the 10th) and your real planetary periods — not a generic trait list." → `/how-it-works#vedic`
- **Compatibility:** "Calculated from both people's actual birth dates — star sign, Moon sign, Life Path number and birth star — not a generic pairing table." → `/how-it-works#vedic`
- **Gemstone:** "We show you the method — the ruler of your rising sign and your chart's computed planetary strengths — and why each stone is suggested." → `/how-it-works#vedic`
- **Numerology/mystic:** "Meanings are presented as they exist within this spiritual tradition — not as facts or predictions." → `/how-it-works#numerology`
- **Celebrity:** "Real people from our database, ranked by how widely recognised they are — and each card links to its source." → `/how-it-works#celebrity-birthday`

Live-staging E2E confirmed the Manglik strip link resolves to `/how-it-works#vedic`.

### Item 5 — Delete the two remaining old branches ✅ (already done in backlog Item D)
Both branches are gone and both archive tags exist **and are pushed to GitHub**:
- `part-ah-homepage-redesign` (local) — absent; `archive/part-ah-homepage-redesign` on origin (`fa6c8da`).
- `origin/conflict_120226_1954` (remote) — absent; `archive/conflict_120226_1954` on origin (`40f3fed`).

Workflow triggers re-checked first: `deploy.yml` fires only on push to `main` /
schedule / manual dispatch; `perf-budget.yml` only on PRs. Neither fires on tag
push or on `rc3`/`develop` push — safe.

---

## Tool × browser real-use table (live staging, Rule 4)

**84/84 E2E tests passed** across all three browsers (`e2e/rc3-staging/`, real
submissions, unmocked API). "✅ = real input entered, submitted, correct result
rendered." WebKit iPhone drove the native date inputs without issue — **no
WebKit date-input tooling limitation materialised.**

| Tool | Chromium desktop | WebKit iPhone | Android Chrome |
|---|---|---|---|
| Kundli (chart + 5-level Dasha deep-dive + What's Ahead) | ✅ | ✅ | ✅ |
| Kundali matching (Guna Milan) | ✅ | ✅ | ✅ |
| Sade Sati | ✅ | ✅ | ✅ |
| Muhurat (+ methodology) | ✅ | ✅ | ✅ |
| Gemstones | ✅ | ✅ | ✅ |
| Career report | ✅ | ✅ | ✅ |
| Manglik | ✅ | ✅ | ✅ |
| Kaal Sarp | ✅ | ✅ | ✅ |
| Dasha calculator | ✅ | ✅ | ✅ |
| Birth-time Vedic section (lagna, no crash) | ✅ | ✅ | ✅ |
| Numerology (Life Path) | ✅ | ✅ | ✅ |
| Personal year number | ✅ | ✅ | ✅ |
| Compatibility | ✅ | ✅ | ✅ |
| Life expectancy | ✅ | ✅ | ✅ |
| Chinese zodiac | ✅ | ✅ | ✅ |
| Planetary age & weight | ✅ | ✅ | ✅ |
| Biorhythm (fitness rhythm) | ✅ | ✅ | ✅ |
| Tarot by birthday | ✅ | ✅ | ✅ |
| Age calculator | ✅ | ✅ | ✅ |
| Name numerology | ✅ | ✅ | ✅ |
| Homepage date decode | ✅ | ✅ | ✅ |
| `/results` | ✅ | ✅ | ✅ |
| Celebrity search | ✅ | ✅ | ✅ |
| Trust-strip "How we test" link | ✅ | ✅ | ✅ |

Additional real-use checks (Chromium; logic is browser-independent and the
engine matrix is already proven on 3 browsers):
- **Rashi Ratna** — pick a Rashi → correct gemstone renders ✅
- **Country comparison** — age + two countries → comparison renders ✅
- **Biological-age quiz** — fill health inputs + compute → result renders ✅
- **Western zodiac** — static `/zodiac/:sign` pages (all 200 in crawl) + homepage decode ✅

**Sign-in / payment gated (verified up to the gate; see "Needs the person"):**
- **AI astrologer** (`/astrologer`) — page + H1 load; the question box only appears
  after sign-in (no box/send without sign-in). Verified up to sign-in.
- **Birthday Blueprint** (`/birthday-report`) — page + H1 load; reaches the
  checkout/preview gate; full checkout needs staging sign-in.

---

## Negative / edge cases (Testing §2)

UI (`edge-cases.spec.ts`, all 3 browsers): empty Manglik form keeps submit
**disabled**; a gibberish city yields no pickable option and submit stays disabled
(no crash); native date input rejects **31 February**; Hindi numerology page
renders with a heading (no crash).

Live-API edge handling (`/api/kundali`): **future date (2099)**, **1900**,
**leap-day (2000-02-29)** and **midnight (00:00)** all compute correctly (200,
valid lagna); **invalid month=13/day=45** returns a clear **400** ("Invalid birth
date (month/day out of range)") — never a hang or 500.

---

## Site-wide checks (live staging)

| Check | Result |
|---|---|
| Full sitemap status crawl | **3640 / 3640 → 200**, 0 bad (`final-status-crawl.json`) |
| 404 check (extended with the 5 new routes) | **52 checks, 0 wrong** — invalid→404, valid→200, non-sitemap→200 |
| axe (serious/critical) | **0** across 17 routes × {Chromium desktop, Pixel 5} = 34 checks |
| Served output | single `<h1>` + unique title + real prerendered lead on every layout sampled (neutral/article/utility/birthday/mystic/science/vedic + new page) |
| Console errors | **0** app-level across 18 sampled pages |
| perf-budget | **all pages within budget** (LCP/CLS/TBT/jsKB) |
| 13 cross-group regression routes | all 200 (subset of the all-200 crawl; axe-clean) |
| Automated suite | **163 files / 1940 tests passing** (baseline held after every change) |
| Typecheck | clean (exit 0) |
| OpenStreetMap attribution (Testing §5) | **added** — "© OpenStreetMap contributors" under all four city-search fields (the only Nominatim consumers): BirthDetailsForm, BirthTimeVedicSection, KundaliMatchPage, MuhuratPage (commit `95e5ea5`) |

---

## Payment (Testing §3)

Staging sign-in is **not currently available** (needs Supabase Auth redirect-URL
allowlisting + Google sign-in origin — a "Needs the person" item), so a live
test-card purchase could not be run. Manual script for the person, once sign-in
is enabled on staging:

1. Open `https://bornclock-staging.usdvisionai.workers.dev`, sign in with the
   designated **test account**.
2. Go to a paid surface (e.g. `/birthday-report` → checkout, or `/upgrade`).
3. Pay with a Razorpay **TEST** card (staging uses `.env.preview` TEST keys —
   never live keys): card `4111 1111 1111 1111`, any future expiry, any CVV.
4. Confirm the entitlement unlocks the report, then confirm re-lock on a fresh
   session / after refund. Verify **no real GST invoice number** is consumed
   (test mode).
5. Prices, paywall gating and entitlement logic are unchanged by RC3; "What's
   Ahead" remains free (`WHATS_AHEAD_IS_FREE = true`).

---

## Bug log summary (`docs/rc3-bugs.md`)

All four logged bugs are Item-2 and are now **verified fixed on live staging**:

| # | Severity | Symptom | Fix | Verified |
|---|---|---|---|---|
| 1 | Critical | `/manglik` & `/kaal-sarp-dosha` failed on every real submission | pass `doshas` through the adapter | ✅ real API + E2E (3 browsers) |
| 2 | High | 5-level Dasha deep-dive + What's Ahead silently never rendered | pass `dashaTimeline` through | ✅ sections render (3 browsers) |
| 3 | Critical | `/birth-time` Vedic profile crashed when birth time entered | fix `lagna` type to object; render `.sign` | ✅ renders, zero page errors |
| 4 | Medium | an input cached before the fix would still fail | recompute a cached row missing the fields (`_cache:'refreshed'`), no data deleted | ✅ `_cache:'hit'` returns the fields |

No new bugs were found during RC3 testing.

---

## Merge and deploy

1. `develop` tagged **`pre-rc3-merge`** (pushed); `rc3` merged into `develop`
   (merge commit `10c163e`), full suite + typecheck green on `develop`; `rc3`,
   `develop` and the tag pushed. Workflow triggers re-checked (never `main`).
2. **Final deploy:** `develop` rebuilt (`build:staging`), dry-run confirmed the
   worker is `bornclock-staging`, deployed with `wrangler deploy --env staging`,
   and smoke re-tested (see "Final deploy" below). `develop`'s tree is identical
   to the fully-tested `rc3` tree.

### Final deploy
`develop` built with `build:staging` (3640 routes prerendered, sitemap 3640),
dry-run confirmed `bornclock-staging`, deployed with `wrangler deploy --env staging`.

- **LIVE staging version (develop):** `6477b279-76b3-47fa-831b-9df9e4ea913b`
- **URL:** https://bornclock-staging.usdvisionai.workers.dev
- **Smoke re-test on the develop deploy:**
  - `/api/kundali` real call (Jammu reference) → `doshas` + `dashaTimeline` +
    `lagna.sign = Vrischika`, `_cache: hit` (stale-cache fix holds). ✅
  - Core Vedic-tools E2E **24/24 passed** across Chromium desktop, WebKit iPhone,
    Android Chrome (Manglik, Kaal Sarp, Kundali 5-level Dasha + What's Ahead,
    Dasha calc, Sade Sati, gemstone, career, trust-strip link). ✅

`develop`'s tree is identical to the fully-tested `rc3` tree, so the exhaustive
suite run against the `rc3` build (84 E2E + crawl + axe + 404 + perf + console +
served output, all green above) applies unchanged to this deploy.

---

## Needs the person

1. **Enable staging sign-in** — allow `https://bornclock-staging.usdvisionai.workers.dev`
   in Supabase Auth redirect URLs + Google sign-in allowed origins. Unblocks: the
   test-card purchase, saved profiles, family dashboard, and the AI-astrologer
   question (all verified up to the sign-in step).
2. **Run the test-card purchase** using the manual script above once sign-in works.
3. **Review** RC3 on staging (laptop + phone) and confirm the Manglik / Kaal Sarp
   remedies tone.
4. **Launch is separate and explicit** — not part of RC3. Production is untouched
   (current prod version `3b1808cb-…` recorded above for rollback).

---

## Production safety (confirmed)

No production deploy or promotion; `main` never pushed or merged; no Cloudflare
token added to GitHub; wrangler ran only with `--env staging` after a dry-run
confirming `bornclock-staging`; the only DB touch would be the (not-yet-run)
test-account purchase. Prices, paywall gating, payment/entitlement logic and
calculations are unchanged; "What's Ahead" stays free.
