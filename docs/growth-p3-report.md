# Growth P3 — Retention — Report

**P3 COMPLETE: YES**

Every P3 item (master items 1–8) and both P3 improvement items in
`docs/growth-improvements.md` (NB3-SONG, NB3-CARD-SHARE) are done and verified, or
deliberately scoped to the person where a real-world dependency (licensing, a WhatsApp
Business account, a real expert reviewer, DB/secret activation) makes that the honest
outcome. Nothing touched production, `main`, `develop`, or a Cloudflare token; all work
is on `growth`, pushed per item.

---

## Environment & constraints (read this first)

- **No live preview upload was possible in this environment.** The local Cloudflare
  OAuth token has only `account:read` + `user:read` (verified via `wrangler whoami`), not
  `Workers Scripts:Edit`, so `wrangler versions upload --env staging` cannot run here.
  **Alternative evidence (Rule 4):** every real-use check below ran against the *exact
  built staging artifact* served locally by `wrangler dev --env staging` (Miniflare) — the
  same `functions/_worker.ts` + `dist/` bundle a preview would serve, with the real,
  **unmocked** `/api/*` (local-first engine). Uploading the preview to
  `bornclock-staging` is a one-command step for the person (or grant the token
  Workers:Edit) — see "Needs the person".
- **System load** before each build/measurement was ≤ 1.2 (half of 8 cores = 4.0), so no
  waiting was required (Rule 3).
- **Cloudflare cron is confirmed broken** (every deploy's `PUT …/schedules` → 400; see
  `docs/part-p-flags.md`), which is exactly why P3-1 uses an external scheduler.

---

## Items built (with evidence)

### P3-1 — Fix scheduled jobs (external scheduler) ✅
- New **GitHub Actions** workflow `.github/workflows/scheduled-tasks.yml`: `schedule`
  (daily 06:30 UTC → `job=daily`, Mon 08:00 UTC → `job=weekly`) + `workflow_dispatch`.
  **Uses no Cloudflare token** — only repo secrets `CRON_SECRET` + `CRON_TARGET_URL`;
  `permissions: contents: read`; it cannot deploy.
- New **`CRON_SECRET`-protected** endpoint `/api/cron-dispatch` (registered in
  `functions/_worker.ts`) routes `daily | weekly | all` to the existing handlers.
- **Real-use on local wrangler dev** (staging env, `CRON_SECRET` set): no header → **401**;
  wrong secret → **401**; `?job=bogus` → **400**; `?job=weekly` → **200**
  `{weeklyDigest:{skipped:true}}`; `?job=daily`/`?job=all` → **200** with per-job summaries;
  each job degrades gracefully with no Supabase. 9 unit tests (`api/__tests__/cron-dispatch.test.ts`).
- **Activation = Needs the person**: add the two repo secrets and the workflow must sit on
  the default branch for `schedule:` to fire (GitHub only runs scheduled workflows from the
  default branch). `workflow_dispatch` works for manual verification.

### P3-2 — Personal "your day" dashboard ✅
- `/dashboard` (`src/pages/DashboardPage.tsx`): today's reading for the user's own Moon
  sign (`computeRashifal` from their saved full Kundli via the real `/api/kundali`), today's
  biorhythm, and birthday countdown — all computed client-side, with idle/loading/error
  states. Linked from `/profile` ("Your day"); links to Kundli, What's Ahead, Family.
- **Real-use on 3 browsers** (Chromium, Android-Chrome/Pixel 5, WebKit/iPhone 13) with the
  reference chart (1978-05-13 19:30 Jammu) seeded as the saved profile: the dashboard renders
  **"Today for Karka"** (the correct Moon sign) on all three, driven by the real unmocked API.
- Regression test `src/pages/__tests__/DashboardPage.test.tsx`.

### P3-3 — Opt-in email notifications ✅
- Engine `api/_notify.ts`: **daily horoscope** (`computeRashifal`), **transit alerts** (real
  `findIngress` over the next 3 days — never an empty/fake alert), **family birthday
  reminders** (from the user's own `birthday_reminders`), plus the **weekly digest batch**.
  All content computed, no fabrication (Rule 8).
- `NotificationOptIn` component on the dashboard: explicit, default-OFF opt-in; chart-dependent
  channels disable with an honest note when the Moon sign is unknown; WhatsApp row shown but
  disabled with a "Soon" badge (Rule 11). `subscribe.ts` accepts the new opt-in fields.
- **Sends are gated OFF** behind `NOTIFY_LIVE` / `DIGEST_LIVE`; with them unset the jobs
  dry-run and return exactly who *would* be mailed (plus staging `SUPPRESS_OUTBOUND_EMAIL`).
- Schema additions documented in `supabase/migrations/NOTES-notifications.sql` (not applied).
- 3 component tests + the email builders covered by the P3-1 suite.

### P3-4 — Finish family profiles dashboard ✅
- Enabled `FamilyDashboard` (flag flipped on, kept as a kill-switch). Reframed from longevity-
  only to a family hub: each member now has one-tap **"Kundli"** (`/child-kundli` for under-18s,
  dob prefilled) and **"Remind me"** (writes a birthday reminder into the P3 notification
  pipeline). **Premium/trial gating unchanged** (Rule 10).
- axe clean (signed-out gate); the full member UI is sign-in-gated (verified up to the gate +
  `FamilyService` unit coverage).

### P3-5 — Installable PWA ✅
- Enriched `public/manifest.json` (standalone, scope, 192/512 + maskable icons generated from
  the brand mark, app shortcuts, brand theme `#0E2238`). New **service worker** `public/sw.js`
  with `/offline` shell: HTML navigations are **network-first** (never cached → no stale-shell
  bundle hazard), `/api/*` always network, static assets stale-while-revalidate. Registered in
  `main.tsx` for built environments only (never dev HMR).
- **Verified on the served build**: `/manifest.json` 200 (icons 192/512/maskable), `/sw.js`
  200 (text/javascript), `/icon-192.png` 200, `/offline` 200. 5 source-invariant tests.

### P3-6 — Shareable birthday cards & wishes (NB3-CARD-SHARE) ✅
- `BirthdayFactsCard` (`src/components/BirthdayFactsCard.tsx`): branded card from real facts —
  day of week, zodiac, generation, celebrity birthday twin, and the #1-song line when data
  exists. `html2canvas` → PNG, Web Share API + download fallback. Wired into `/wish` (replacing
  the old canvas card; also removed its jsdom mount-time `getContext` error).
- **Real-use on 3 browsers**: the facts card generates and shows the correct day/zodiac/
  generation; Download control present. 3 component tests.

### P3-7 — Real reviews (remove fakes, build collection) ✅ *(honesty fix, Rule 8)*
- Removed the 7 **fabricated** homepage testimonials (sentinel user-ids) and the fabricated
  stats (10K+, 4.9, 50+, 1M+, "Trusted by thousands"). `TestimonialsSection` now filters the
  sentinel ids in code **and** `NOTES-remove-seeded-reviews.sql` deletes the rows for the person;
  the section only renders real, approved reviews.
- New `ReviewForm` on `/profile`: signed-in users submit a real rating+review, written
  `is_approved=false` pending the existing admin `ReviewManagement`. No seeded/auto-approved
  content; no `AggregateRating` JSON-LD until real reviews exist. 4 tests.

### P3-8 — Expert reviewer support (unused until a real reviewer) ✅
- `ReviewerByline` + `src/config/reviewers.ts` (ships **EMPTY** — never invents a reviewer,
  Rule 8/Part 4): renders a named expert + credentials only when a real reviewer is registered,
  else nothing. `EEATBadges` gains an optional `reviewerId` (names a registered reviewer, else
  keeps the honest "BornClock Editorial Team"). 3 tests.

### NB3-SONG — "#1 song on your birthday" 🔒 *(plumbing done; data blocked on the person)*
- `src/data/birthdaySongs.ts`: honest date-range lookup that reports a song **only** when a
  verified dataset entry covers the date; ships **EMPTY** and never fabricates a chart position
  (Rule 8). `BirthdayFactsCard` shows the #1-song line automatically once data is present.
- **Needs the person**: a properly **licensed / CC-compatible #1-song-by-date dataset**
  (Billboard Hot 100 or Official UK Singles Chart). This is a licensing/business decision; drop
  a verified dataset into `NUMBER_ONE_RANGES` and every birthday surface + the card light up.
  Marked `[P]` in `growth-improvements.md`. 6 loader tests (prove inclusive-range matching).

---

## Real-use × browser table (live local staging build, unmocked API)

| Surface | Chromium | Android Chrome (Pixel 5) | WebKit (iPhone 13) |
|---|---|---|---|
| `/dashboard` renders correct Moon-sign reading (Karka) | ✅ | ✅ | ✅ |
| `/dashboard` rhythm card | ✅ | ✅ | ✅ |
| `/wish` facts card (day/zodiac/generation) + Download | ✅ | ✅ | ✅ |
| `/api/cron-dispatch` auth + routing (401/200/400) | ✅ (curl) | — | — |
| `/api/kundali` real unmocked chart | ✅ (curl) | — | — |

---

## End-of-phase full retest results

- **Unit suite:** 190 files / **2066 tests pass** (baseline 182 / 2035 → +8 files, +31 tests;
  zero regressions). **Typecheck:** 90 pre-existing `tsc` errors, **unchanged** (project builds
  via vite/esbuild; no new errors introduced in any P3 file).
- **Build:** `npm run build:staging` exit 0, **4028 routes prerendered, 0 failed**, sitemap
  **4028 URLs** (unchanged — P3's new routes are private/dynamic, correctly not in the sitemap).
  **Build time ≈ 17m42s** (within the 60-min envelope).
- **axe** (new page types `/dashboard`, `/wish`, `/family`, Chromium desktop + Pixel 5):
  **0 serious/critical** — after fixing 2 findings this phase (see below). Script:
  `scripts/p3-axe.mjs`.
- **404 check** (`scripts/rc2-404-check.mjs`, extended with `/dashboard`, `/family`, `/wish`):
  **65 checks, 0 wrong** (valid → 200, invalid → 404).
- **Sitemap status crawl** (sampled every 15th URL = 269 of 4028, concurrency 5): **0 non-200**.
- **perf-budget** (`scripts/perf-budget.mjs`, one page per layout): **all pages within budget**.
- **API smoke** (new endpoint `/api/cron-dispatch`): auth gate + job routing + graceful
  degradation verified; no real user data, no real email (dry-run + staging suppression).
- **Consistency across prediction surfaces:** the dashboard reading (`computeRashifal`) and
  transit alerts (`findIngress`) call the *same* engine functions as `/rashifal` and the
  transit pages, so they agree with the underlying Dasha/transit data by construction.

### Bug found & fixed this phase (`docs/growth-bugs.md`)
- **P3-DASH-SIGNINDEX** — real-use of the live chart API exposed that `/api/kundali` returns
  planet `signIndex` **1-based** (Moon in Karka = 4), but `computeRashifal`/`subscribe` expect
  **0-based**; the dashboard showed the *next* sign (Simha) and passed an out-of-range
  `rashiIndex`. Fixed (subtract 1 + clamp) and locked with a regression test. This is exactly
  the "real use, not page loads" guard (Rule 4) doing its job.
- **axe (dashboard)** — the notification Switches had no accessible name (critical, 3) and the
  WhatsApp row's `opacity-60` dropped text below AA contrast (serious, 2). Fixed with
  `aria-label`s and a non-dimmed "Soon" badge; re-run on the final build → **0**.

---

## Build time
`npm run build:staging` ≈ **17m42s** (vite ~12s + OG cards ~13s + prerender 4028 routes ~1040s
+ sitemap). Within limits.

---

## Preview URL
Not uploadable here (token lacks `Workers Scripts:Edit`). All verification ran against
`wrangler dev --env staging` serving the final `dist/` artifact at `http://localhost:8788`.
The person (or a Workers:Edit token) can upload it with
`wrangler versions upload --env staging` to get a `bornclock-staging` preview URL.

## Bug summary
1 functional bug (P3-DASH-SIGNINDEX) + 2 a11y findings, all found during the end-of-phase
retest and **fixed + re-verified** on the final build. No open bugs.

---

## Needs the person
- **Activate the scheduler:** add repo secrets `CRON_SECRET` and `CRON_TARGET_URL`
  (= `https://bornclock-staging.usdvisionai.workers.dev` while testing); the
  `scheduled-tasks.yml` workflow must be on the default branch for `schedule:` to fire
  (`workflow_dispatch` works meanwhile). No Cloudflare token goes to GitHub.
- **Turn notifications live:** set worker secrets `NOTIFY_LIVE=true` / `DIGEST_LIVE=true`
  and apply `supabase/migrations/NOTES-notifications.sql` (new opt-in columns). Until then the
  jobs dry-run and send nothing.
- **Delete the seeded fake reviews:** run `supabase/migrations/NOTES-remove-seeded-reviews.sql`
  (the code already hides them regardless).
- **Licensed #1-song dataset (NB3-SONG):** supply a licensed/CC-compatible #1-song-by-date
  dataset; the surface lights up automatically.
- **WhatsApp Business account:** required before the prepared WhatsApp reminders can be enabled.
- **Real expert reviewer:** register a genuine, consenting reviewer in `src/config/reviewers.ts`
  to activate `ReviewerByline` / named `EEATBadges` — never invented.
- **Upload the preview** (or grant the local token Workers:Edit) to obtain a `bornclock-staging`
  preview URL for the person's own device checks.
- **Schema changes** are in NOTES files only — no DDL was applied.

---

## Test-suite baseline
Start of phase: **182 files / 2035 tests**. End of phase: **190 files / 2066 tests** (all pass).
