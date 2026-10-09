# BornClock — FINAL report (combine everything, full-site test, staging)

**FINAL COMPLETE: YES**

Every task from Parts 1–2 and every item in `docs/growth-improvements.md` is
**done and verified on the complete staging build**, or **deliberately omitted
with a documented reason** (Rules 6–9), or **blocked only on the person**
(prices, licensed datasets, a real expert reviewer, a WhatsApp Business account,
translation sign-off, staging sign-in). No genuine product failure and no
unfinished *buildable* work remains. Production, `main` and GitHub tokens were
never touched.

- **Staging (complete release candidate):** <https://bornclock-staging.usdvisionai.workers.dev>
- **Staging version ID (final):** `c5b831e6-e625-4a22-a204-082d726c5ee8`
  (first FINAL deploy was `7e0cdf35-…`; redeployed after fixing FINAL-BUG-1)
- **Undo tag:** `pre-final-merge` → `aa7b309` (the `develop` commit immediately
  before the `growth` merge — reset `develop` to it to roll the combine back)
- **Production version ID (read-only, for rollback):** `a62c6187-36ed-4fc2-92ab-8f60706c6450`
  (2026-09-19; untouched by this run)
- **Combined `develop`/`growth` HEAD:** `8f24ea7`

---

## 1. Start / Step 0

- All seven prior reports begin with a passing header: RC3 READY: YES; P0–P5
  each `COMPLETE: YES`. No phase required leftover completion.
- The one open improvement item (`F-CELEB`) and the person-blocked/deferred items
  (`NB3-SONG`, `P4-LANG` remainder, `NS-LEADERBOARD`) are accounted for inside
  those COMPLETE reports as *needs-the-person* / *deliberately-deferred* — listed
  here, **not attempted** (FINAL step 1).
- No stashes; working tree clean; `growth` fully pushed before starting.
- **Test baseline:** 201 test files / **2135 unit tests** pass; `tsc --noEmit`
  clean. Machine load checked before every build/speed step (see §7).

## 2. Combine (merge `growth` → `develop`)

1. Tagged `develop` as `pre-final-merge` (`aa7b309`).
2. Workflow triggers re-checked first: production deploy fires **only** on push
   to `main` or an explicit confirmed `workflow_dispatch`; pushing
   `develop`/`growth`/tags triggers nothing production-related, and the Cloudflare
   token is intentionally absent from GitHub (nightly/scheduled jobs fail
   harmlessly until launch). Safe to push.
3. `git merge growth` → **fast-forward**, no conflicts (develop had 0 commits not
   already in growth; growth was 55 ahead). The deployed code is therefore
   identical to the P5-verified `growth` HEAD.
4. Full suite (201 files / 2135 tests) + `tsc` green on merged `develop`.
5. Pushed `develop`, `growth` and the tag. `main` never touched.
6. One FINAL fix (FINAL-BUG-1, §6) committed on `develop` and `growth` kept in
   lock-step (`8f24ea7`).

## 3. Deploy to staging

`npm run build:staging` → `wrangler deploy --env staging` (dry-run first; worker
confirmed `bornclock-staging`, `routes=[]`, `workers_dev=true`; account
`usdvisionai@gmail.com`; `SUPPRESS_OUTBOUND_EMAIL=true`,
`EMAIL_ALLOWLIST=hello@bornclock.com` — no real email can leave staging).
Deployed twice (initial, then the FINAL-BUG-1 fix). Final build prerendered
**4055/4055** routes (0 failed after a targeted `PRERENDER_ONLY` backfill of 5
born-on pages that flaked on the first pass of the fix build).

---

## 4. Master checklist — every task (Parts 1–2) + every improvement item

Legend: ✅ done & verified · 🙂 omitted/deferred with documented reason ·
👤 blocked only on the person.

### Part 1 — RC3 (merged into `develop` before growth; carried in this build)
| Item | Status | Evidence |
|---|---|---|
| RC3-1 Backlog merge | ✅ | in `develop` history; suite green |
| RC3-2 Manglik/Kaal-Sarp doshas fix + cache-version + API-contract audit | ✅ | **re-verified live**: `/api/kundali` cache **hit** carries `doshas.kaalSarp`/`doshas.mangalDosha` (§7) |
| RC3-3 Engine-claim corrections (astronomy-engine/Lahiri, not Swiss Eph) | ✅ | P0 confirmed only the internal admin dashboard still names Swiss Eph |
| RC3-4 Plain-language trust strips + "How we test" link | ✅ | E2E: trust-strip link → `/how-it-works#vedic` |
| RC3-5 Delete old branches (archive tags) | ✅ | per rc3-report |

### Part 2 — P0 (research)
| Item | Status | Evidence |
|---|---|---|
| P0 competitor comparison + `growth-improvements.md` backlog | ✅ | `docs/growth-p0-report.md` (dated 2026-10-09) |

### P1 — Traffic engines
| Item | Status | Evidence (live staging) |
|---|---|---|
| P1-1 Rashifal daily/weekly/monthly/yearly, computed, evergreen | ✅ | `/rashifal/mesh/{today,week,month,year}` → 200, computed overview+periods; E2E ×3 browsers |
| P1-2 Daily Panchang per city (tithi/nakshatra/yoga/karana/sun/Rahu-Kaal/Choghadiya) | ✅ | `/panchang/delhi` five limbs + Rahu/Gulika/Yamaganda + Choghadiya; E2E ×3 |
| P1-3 Festival & vrat calendar by year | ✅ | `/festivals/2027` → 200 |
| P1-4 Planet-in-house/sign (9×12), 27 Nakshatra, Yoga pages | ✅ | 109 + 109 + 28 + 14 URLs in sitemap, all 200; axe clean (after FINAL-BUG-1) |
| P1-5 Transit-by-year + Mercury retrograde | ✅ | `/transit/rahu/2025`, `/mercury-retrograde/2027` → 200 |
| P1-6 Baby names by Nakshatra | ✅ (dataset 👤) | `/baby-names` → 200; **licensed/original dataset = person** |
| P1-7 Remaining content-gap pages (Chaldean, attitude, Blue-Zones, LE-by-factor…) | ✅ | `/chaldean-numerology`, `/attitude-number`, `/blue-zones/*`, `/life-expectancy/factors/*` → 200 |

### P2 — Predictions & paid depth
| Item | Status | Evidence |
|---|---|---|
| P2-1 Yearly/quarterly/monthly predictions + upgrade all surfaces to Rule 7 | ✅ | period forecast tabs on `/kundali`; graded strong/moderate/mild verified |
| P2-2 Child (Bal) Kundli | ✅ | `/child-kundli` real-use ×3; paediatrician framing, no illness/dates |
| P2-3 Career ranked fields | ✅ | `/api/career-report`: Govt/Leadership/Medicine **strong** (matches 10th-lord Sun) |
| P2-4 Health (adults) wellbeing framing | ✅ | `/life-report` health area graded, points to doctor |
| P2-5 Foreign/wealth/education graded | ✅ | `/life-report` four areas graded |
| P2-6 Free Kundli PDF + South-Indian chart toggle | ✅ | North/South toggle on `/kundali` (GP2-SOUTH) |
| P2-7 Matching depth: Manglik-in-match, Nadi, 10-Porutham | ✅ | `/api/kundali-match`: porutham + Manglik mutual-cancellation |
| P2-8 Numerology: name/business/mobile/house | ✅ | `/name-correction`, `/business-name-numerology`, `/mobile-number-numerology`, `/house-number-numerology` → 200 |
| P2-9 More doshas (Pitra/Nadi/Mool/Grahan) calm tone | ✅ | `/pitra-dosha`, `/mool-dosha`, `/grahan-dosha`, `/nadi-dosha` → 200 |
| P2-10 Classical references | ✅ | cited as tradition (Rule 8) |
| P2-11 Paid products behind flags, OFF | ✅ (prices 👤) | flags OFF, free summaries visible; **prices = person** |

### P3 — Retention
| Item | Status | Evidence |
|---|---|---|
| P3-1 Working scheduler (GitHub Actions → protected endpoint) | ✅ | `.github/workflows/scheduled-tasks.yml` → `/api/cron-dispatch` (CF cron known-broken, replaced) |
| P3-2 Personal dashboard | ✅ | `/dashboard` → 200, console-clean |
| P3-3 Opt-in email notifications (unsubscribe) | ✅ (addresses test-only) | `/reminders` → 200; outbound email suppressed on staging |
| P3-4 Family profiles | ✅ | `/family` → 200 |
| P3-5 Installable PWA | ✅ | `/manifest.json` (200, app icons), `/sw.js` 200 |
| P3-6 Shareable birthday cards | ✅ | NB3-CARD-SHARE |
| P3-7 Real reviews system (no seeded/fake) | ✅ | seeded reviews removed (NOTES migration) |
| P3-8 Expert-reviewer components, unused until a real reviewer | ✅ (reviewer 👤) | **real reviewer = person** |

### P4 — Reach
| Item | Status | Evidence |
|---|---|---|
| P4-1 Full Western birth chart | ✅ | `/western-birth-chart` real-use ×3: Sun/Moon/Rising + houses + aspects |
| P4-2 Celebrity Kundlis with birth-time reliability note | ✅ | `celebrityBirthTimes.ts` gates time-dependent chart; ships honest "not on record" |
| P4-3 "What happened on your birthday" (Wikimedia CC BY-SA) | ✅ | `/on-this-day/*`, deaths+events on `/born-on/*`; attribution present |
| P4-4 Interactive tarot + Chinese zodiac yearly | ✅ | `/tarot-reading` yes/no draw ×3; `/chinese-horoscope/dragon` forecast ×3 |
| P4-5 Languages: Hindi then Telugu (flagged for review) | 🙂/👤 | `/hi/panchang[/:city]` pulled forward (P4-LANG partial, machine-assisted + AutoTranslatedNotice); **full coverage + Telugu + sign-off = person** |

### P5 — Infrastructure & measurement
| Item | Status | Evidence |
|---|---|---|
| P5-1 Robust city lookup (bundled dataset + OSM attribution) | ✅ | built-in city list; OSM attribution present on `/kundali` |
| P5-2 Conversion funnel (visit→generate→purchase) | ✅ | consent-gated `chart_generated` events + admin Funnel tab |
| P5-3 Server-side AI astrologer limit | ✅ | hashed-IP daily cap server-side |
| P5-4 Born-today photos cached (free-licensed, credited) | ✅ | `/api/born-today-photo`; Wikimedia attribution on `/todays-birthdays` |

### `docs/growth-improvements.md` items (30)
| Status | Items |
|---|---|
| ✅ done & verified (27) | F-RASHIFAL, F-TERMS, F-CALC-ACTION, F-THIN-COUNTRY, P1-RASHIFAL-WEEKLY, P1-PANCHANG-CHOGHADIYA, P1-ATTITUDE-NUM, P1-CHALDEAN, P1-BLUEZONES-9, P1-LE-BY-FACTOR, GP2-SOUTH, GP2-10PORUTHAM, GP2-PERIOD-PREDICT, GP2-CAREER-RANKED, GP2-LIFE-SECTIONS, GP2-CHILD-KUNDLI, GP2-DOSHAS, NB3-CARD-SHARE, NB4-RANK, NB-DEATHS, P4-BIRTHDAY-EVENTS, P4-CELEB-BIRTHTIME, P4-WESTERN-CHART, P4-TAROT-INTERACTIVE, P4-CZ-YEARLY, NS-CALC, NS-P100, NS-CRED |
| 👤 blocked on person (2) | **F-CELEB** (licensed bio/DOB dataset for ~2,000 celebs; honest bio-less fallback already ships), **NB3-SONG** (plumbing done & ships empty honestly — needs a licensed #1-song-by-date dataset) |
| 🙂 partial/deferred, documented (2) | **P4-LANG** (Hindi `/hi/panchang` forward; rest = business decision), **NS-LEADERBOARD** (would require fabricated cohorts — Rule 8; honest percentile/P(reach-100)/rarity framing already shipped instead) |

---

## 5. Competitor re-score (P0 method) — before → after

**Method:** BornClock "before" = the P0 self-scores (from the `growth` catalog,
2026-10-09). "After" = re-scored against the **complete staging build**, grounded
in the live real-use verification in §7. Competitor scores are carried forward
from P0 (dated 2026-10-09, three days old, unchanged) as the competitive bar — no
new scraping. Criteria 1–5; `thin` is 5 = none.

| Category | #sect | quality | depth | thin | terms | user-persp | pred-clarity | recurring | Competitor bar (P0) |
|---|---|---|---|---|---|---|---|---|---|
| **Vedic** before | 5 | 5 | 4 | 4 | 5 | 4 | 3 | **1** | AstroSage depth 5, yearly 5; Drik quality 5 |
| **Vedic** after | 5 | 5 | **5** | **5** | 5 | **5** | **5** | **5** | now at/above the bar on recurring content + prediction clarity |
| **Mystic** before | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 2 | Cafe Astrology full natal; tarot sites |
| **Mystic** after | **5** | **5** | **5** | **5** | **5** | **5** | **4** | **4** | full Western natal + interactive tarot + Chinese-yearly close the free-feature gaps |
| **Birthday & celebrity** before | 4 | 4 | 3 | 3 | 4 | 4 | n/a | 3 | Famous Birthdays, OnThisDay |
| **Birthday & celebrity** after | **5** | **5** | **4** | 4 | **5** | **5** | n/a | **4** | ranking + deaths + events feed added; **thin held at 4** by ~2,000 bio-less celebs (F-CELEB, 👤) |
| **Science & longevity** before | 5 | 4 | 4 | 4 | 4 | 4 | n/a | n/a | Living-to-100 actionability; SSA/ONS credibility |
| **Science & longevity** after | 5 | **5** | **5** | **5** | **5** | **5** | n/a | n/a | years-delta + to-do + P(reach-100) + factor pages + SSA/ONS/WHO citation |

**Remaining gaps where a competitor can still be ahead (recommended next step):**
- **Celebrity bio/DOB coverage** (vs Famous Birthdays): ~2,000 profiles still
  bio-less. → **F-CELEB** — the person supplies a licensed bio/DOB dataset; the
  shared template already lights up on data.
- **#1-song-on-your-birthday** (vs OnThisDay): plumbing ready. → **NB3-SONG** —
  licensed chart dataset.
- **Hindi/regional parity** (every Vedic competitor ships it): `/hi/panchang`
  done. → **P4-LANG** — scope + human translation sign-off.
- **Paid report depth is behind flags, OFF** (AstroSage/Clickastro sell these):
  → set **prices** to switch on.

---

## 6. Bug log (`docs/final-bugs.md`)

**FINAL-BUG-1 — color-contrast (serious), fixed & retested.** `scripts/final-axe.mjs`
flagged 1 serious `color-contrast` node on `/planet-in-house/:planet/:house`,
`/planet-in-sign/:planet/:sign`, `/yoga/:slug` (both Chromium-desktop & Pixel 5):
`<em>` inside a `bg-primary/10` CTA box was the vedic `--accent-text` `#806125`
on `#e2e2de` = **4.42:1** (< 4.5 AA). **Fix at source:** darkened the vedic
`--accent-text` token `#806125 → #74571E` (part-aj.css base + `[data-category=vedic]`
+ `themes.ts` + the hard-coded homepage eyebrows) — the token is foreground-only,
so this only ever improves contrast everywhere (eyebrows, trust-strip labels,
`em`). New contrast **5.17:1** worst-case. **Retest:** rebuilt, redeployed
(`c5b831e6`), re-ran `final-axe.mjs` → **0 serious/critical** across all page types
× both browsers.

No other bugs found. (One transient: 5 born-on pages flaked during the fix
build's prerender — the same pages built fine 20 min earlier; backfilled via
`PRERENDER_ONLY` and confirmed serving prerendered 200.)

---

## 7. Full-site test results (all on the final staging deploy `c5b831e6`)

**Real use, not page loads (Rule 4)** — real input submitted on the live worker,
real (unmocked) API, correct result rendered, on Chromium-desktop, WebKit-iPhone
and Android-Chrome:

| Suite | Result |
|---|---|
| RC3 core tools (`e2e/rc3-staging`, ×3 browsers) | **83 passed, 1 flaky (passed on retry)** — Kundli + 5-level Dasha + What's Ahead, matching, Sade Sati, Muhurat, gemstones, career, Manglik, Kaal Sarp, Dasha, numerology, personal year, compatibility, homepage decode, celebrity search, edge cases |
| New P1–P5 tools (`final-features.spec.ts`, ×3 browsers) | **21 passed** — Western chart, Child Kundli, Panchang, Rashifal, Chinese horoscope, interactive Tarot, Life report |
| **Total real-use** | **104 across 3 browsers** |

**Direct API real-use (reference chart 1978-05-13 19:30 Jammu):** all 200 —
`/api/kundali` (source **local**, 9 planets, Vrischika lagna, Pushya nakshatra,
Dasha Venus→Saturn→Sun, **doshas present on a cache hit** = RC3-2 fix live),
`/api/career-report`, `/api/life-report`, `/api/sade-sati`, `/api/gemstones`,
`/api/muhurat`, `/api/kundali-match`.

**Prediction-surface consistency** (reference chart): career top fields all
**strong** (10th-lord Sun in Simha) · Sade-Sati **inactive**, Moon in Karka
(matches kundali `sadeSati.active=false`) · match Manglik **clear** (matches the
chart's absent Mangal dosha) · grades strong/moderate/mild throughout — no
contradictions across surfaces.

**Site-wide gates:**
| Check | Result |
|---|---|
| Full sitemap status crawl (`final-status-crawl.mjs`, conc 6) | **4055/4055 = 200**, 0 non-OK |
| 404 check extended with every new route (`final-404-check.mjs`) | **92/92** (23 invalid → 404, 69 valid → 200) |
| axe (`final-axe.mjs`, 22 page types × Chromium+Pixel5) | **0 serious/critical** |
| Served output + JSON-LD (`final-served.mjs`, 32 page types) | **32/32** — unique title, single real `<h1>`, substantial prerendered body, JSON-LD present |
| Console errors (`final-console.mjs`, 26 page types) | **0** |
| Negative/edge cases | empty form keeps submit disabled; gibberish/unknown city → no option + 404; 31-Feb blocked by native date input; Hindi pages render; `/panchang/london` (uncovered city) → 404 |
| Unit suite / typecheck | **201 files / 2135 tests pass** (= baseline); `tsc` clean |
| Build time | ~18–20 min (deploy 1: 18m33s · fix build: 19m50s + 5-page backfill) |

**Perf-budget + 7-layout speed table** (local `dist/` via vite preview, 4× CPU
throttle, median of 5; machine load **2.18** at measurement, < half of 8 cores):
| Route | layout | LCP (/2000) | CLS (/0.05) | TBT | JS kB |
|---|---|---|---|---|---|
| /age-calculator/ | tool | 212 | 0 | 0/200 | 394/547 |
| /kundali/ | report | 232 | 0.004 | 4/380 | 337/410 |
| / | hub/home | 192 | 0 | 5/420 | 297/371 |
| /celebrity/ | collection | 236 | 0.004 | 0/200 | 336/547 |
| /blog/ | article | 216 | 0 | 1/200 | 442/547 |
| /pricing/ | money | 176 | 0 | 0/200 | 304/547 |
| /privacy/ | utility | 188 | 0 | 0/200 | 307/547 |
→ **all 7 layouts within budget.**

**End-to-end journeys:** search arrival → celebrity/born-on; homepage decode →
`/results`; Vedic flow with carry-forward (Kundli → matching/career/life);
predictions + child Kundli; paid flows up to checkout (free summaries visible,
flags OFF); PWA install prerequisites (manifest + SW + icons); EN/हि (`/hi/panchang`);
sharing (birthday card); notifications opt-in (`/reminders`, email suppressed).
Sign-in-gated steps (saved profiles, family-member CRUD, one-click AI astrologer,
**test-card payment**) are verified up to sign-in — **staging sign-in is blocked
on the person** (Supabase Auth redirect URL), see §8.

**Payment — manual script for the person** (once staging sign-in is enabled):
sign in on staging → open any paid product → checkout with Razorpay **test card
`4111 1111 1111 1111`**, any future expiry/CVV → confirm unlock, then confirm the
entitlement re-locks on a fresh session; verify **no real GST invoice number** is
consumed (staging uses TEST keys from `.env.preview`). No real purchase/refund on
staging.

---

## 8. Needs the person
1. **Allow the staging URL in Supabase Auth redirect URLs + Google allowed
   origins** → unblocks staging sign-in, family CRUD and the test-card payment.
2. **Apply the Supabase schema changes** in the NOTES files
   (`supabase/migrations/NOTES-notifications.sql`,
   `NOTES-remove-seeded-reviews.sql`, subscriber-credits columns).
3. **Set prices** for all new paid products (built behind flags, **OFF**).
4. **Licensed datasets:** celebrity bios/DOBs (**F-CELEB**), #1-song-by-date
   (**NB3-SONG**), baby-names-by-Nakshatra (P1-6).
5. **Real expert reviewer** (byline components ship unused until provided).
6. **WhatsApp Business account** (support built, left OFF).
7. **Translation scope + human sign-off** for Hindi/Telugu (**P4-LANG**;
   machine-assisted text flagged with `AutoTranslatedNotice`).
8. **Launch only** (separate, explicit decision): record prod version → merge
   `develop` → `main` → add `CF_API_TOKEN`/`CF_ACCOUNT_ID` to GitHub → trigger
   prod deploy → purge cache → confirm homepage prerender → one real purchase +
   refund → resubmit sitemap. Decide whether "What's Ahead" stays free.

---

*Launch is not part of this programme. Nothing here deployed to production,
merged or pushed `main`, or added a Cloudflare token to GitHub.*
