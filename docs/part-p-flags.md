# Part P — flags for the person's review

## ✅ DEPLOYMENT BLOCKER — RESOLVED (Cloudflare cache purge)
The blocker below was fixed by a **zone-wide "Purge Everything"** on the Cloudflare
dashboard, then re-deploying. After the purge, `/api/chart-events` responds correctly on
both `staging.bornclock.com` and `workers.dev`, `/kundali` (→ `/kundali/`) serves the new
bundle `index-CRLHVn82.js`, and all three Part P features verified live on staging:
- Kundali heading "Priya's chart, interpreted" (named) / "Your chart, interpreted" (unnamed).
- Matching "Arjun (Kanya/Hasta) × Meera (Kanya/Uttara Phalguni)", Koota text uses the names.
- Notifications: opted-in shows the notice (2 events), opted-out shows nothing.
- Reading history: shows dated snapshots + "↳ Your Dasha period has since moved from Venus /
  Mercury to Rahu / Mars."
Root cause was a stale Cloudflare edge cache serving an older worker/bundle despite
successful deploys. **Takeaway for future staging deploys: if a deploy doesn't appear to
take effect, Purge Everything on the zone and re-deploy.** (The stored wrangler OAuth token
is expired, so I can't purge from the CLI — it's a dashboard action for now.)

Staging regression after Part P: 755 passed / 54 (vs Part O baseline 767/41). ZERO Part-P
surfaces failed. ~24 of the failures were transient `net::ERR_INTERNET_DISCONNECTED` blips on
the LOCAL test-runner (confirmed: `pdf-content` re-ran 20/0 clean once the local network
recovered); the remainder are the same documented environmental set (local-only mixed specs,
born-on dropdown, 429 flakiness, forms/birthday-report). No regression attributable to Part P.

---
## (historical) 🚩🚩 DEPLOYMENT BLOCKER (found while deploying Part P to staging)
**Staging is NOT serving Part P despite `wrangler deploy` reporting success.** New worker
versions upload and are reported "active (100%)" by `wrangler deployments list`, and the
built bundle demonstrably contains the new code (`--dry-run` shows `/api/chart-events` in
`_worker.js`) — but the edge keeps serving an OLDER worker version:
- `GET /api/chart-events` (new Part P route) returns the worker's own `{"error":"Not found"}`
  — on BOTH `staging.bornclock.com` AND the uncached `bornclock.usdvisionai.workers.dev`.
- `/kundali` HTML references the OLD entry bundle `index-VKsZaCGZ.js` (with `cf-cache-status:
  HIT`), while the NEW `index-CRLHVn82.js` is uploaded and reachable (200) but unreferenced.
- Meanwhile Part M's `/api/kundali-match` (with `synthesis`) DOES work — so the served worker
  is an earlier version (Part M/O-era), not broken.

Tried, without success: re-deploy (×2), a fully CLEAN deploy with the `[triggers]` block
temporarily removed (deploy then succeeded with NO error, yet the old version still served),
`--dry-run` bundle verification, `wrangler versions list` / `deployments list` (newest version
shows as promoted at 100%). A read-only Cloudflare API re-verify/purge was NOT possible — the
stored wrangler OAuth token is expired.

**Most likely causes (need Cloudflare dashboard access to resolve — I don't have it):**
1. A stuck Cloudflare **edge cache** on the zone serving old HTML + old worker responses →
   fix: Caching → **Purge Everything** for `staging.bornclock.com`, then re-deploy/re-test.
2. A **gradual-deployment / version-pin** keeping traffic on an old version → fix: in the
   Workers dashboard, set the latest version to 100% (or delete the pin) and re-deploy.

**Impact:** Part P is fully built, unit-tested (1803/145), locally Playwright-verified for all
three features, and committed — but I could NOT verify it live on staging because staging isn't
serving the new version. Staging itself is UP and functional on the prior version (no outage).
Nothing was deployed to production/main (confirmed: only `staging.bornclock.com` is a route;
I was on the feature branch throughout). Please purge the cache / fix the version pin (or
provide a fresh Cloudflare API token) and I'll immediately re-deploy and run the full
on-staging verification.

## 🚩 scheduled triggers (cron) are genuinely broken — NOT harmless
The recurring "schedules failed to deploy" message, dismissed as harmless in prior
sessions, was investigated for real this time. The worker HAS a proper `scheduled()`
handler and 4 crons in `wrangler.toml`, but **every deploy's `PUT …/schedules` call
returns `400 Bad Request`** (confirmed in the wrangler deploy logs), so **the cron
schedules are rejected and never registered** — the daily job does not reliably fire.
(A read-only API re-verify was attempted but the stored wrangler OAuth token is expired;
the 400 across multiple deploy logs is conclusive on its own. The exact 400 body is
sanitized in the logs — most likely the Workers-with-Static-Assets + custom-domain deploy
model rejecting triggers.)

**Impact:** any feature that depends on a background daily job (including the "existing"
daily-email-cron and weekly-digest) is NOT actually running on schedule in this
environment. Worth a dedicated fix if scheduled email matters — likely needs an external
scheduler (GitHub Action / external cron hitting the existing `POST /api/daily-email-cron`
manual endpoint) rather than Cloudflare cron triggers.

**Consequence for Part 2:** per the prompt's explicit instruction, Part 2 does NOT build a
cron-dependent job. See Part 2 below.

## Part 1 — optional name field (display/identification ONLY)
- Added an OPTIONAL `name` to the saved profile (`SavedBirthProfile.name`) + the shared
  birth form. It is **never** sent to any astrological calculation — purely headings/labels.
- **Consent:** the name lives in the SAME opt-in structure already consented to (device
  localStorage; account `birth_profile` jsonb via Part L). No new storage/consent surface,
  no DB migration. A user who doesn't save a profile stores no name.
- **Kundali:** results heading reads "Priya's chart, interpreted" when a name is given,
  else "Your chart, interpreted".
- **Matching:** "Person A / Person B" become the entered names throughout the report
  (score line, synthesis, Koota text, doshas, timing) via a pure display-time transform;
  falls back to "Person A / Person B" when no name is given. Names are NOT sent to the API.
- **Gift-a-Kundali separation:** the Kundali page's "Gift a Kundali" is a link to a
  SEPARATE page (`BirthdayReportGiftPage`) with its own `recipientName`/`giverName` state
  that never reads the saved profile — so the user's saved name can NOT leak into a gift
  recipient field. Verified by inspection.
- **Adversarial handling:** `sanitizeName` trims, collapses whitespace, strips control
  characters, and caps length at 60; unicode/accented names (Zoë, कृष्णा, 李明) are kept.
- Real examples (Playwright): Kundali "Priya's chart, interpreted" vs "Your chart,
  interpreted"; Matching "Arjun (Kanya/Hasta) × Meera (Kanya/Uttara Phalguni)" with the
  Koota text using the names and zero "Person A/B" remnants, vs the neutral unnamed case.

## Part 2 — chart-event notifications (opt-in, NOT cron-dependent)
- **Delivery decision (because cron is broken):** per the prompt's explicit instruction,
  Part 2 does NOT build a Cloudflare-cron daily job. Instead the deterministic detection
  runs server-side (`/api/chart-events`) and is surfaced **in-app, opportunistically when
  an opted-in user visits** the Kundali page. This channel needs neither cron nor email,
  so it actually works in this environment today. `/api/chart-events` is also directly
  hittable by an external scheduler later to drive email.
- **Detection engine** (`notificationTriggers.ts`, fully unit-tested) reuses already-computed
  data — a Dasha sub/main-period ending within 45 days, active Sade Sati (calm, non-fear
  framing), and an upcoming favourable window (D-Fix3) starting soon. No new astronomy.
- **Opt-in (hard gate):** nothing is checked, fetched, or shown unless the saved profile
  has `notifyOptIn === true` (a checkbox on the Kundali page). Stored in the same
  consented saved-profile structure — no DB migration. Verified: an un-opted-in user
  never even calls the API.
- **Frequency / retention bound:** each event has a transition-specific key; a per-device
  last-shown store enforces a **30-day cooldown per event** (so the same transition can't
  re-notify within a month). Dismissing starts the cooldown.
- **Real example (1964-03-15, Delhi):** "Your Venus sub-period is changing soon — Around
  October 2026 your current Venus Antardasha moves on…" and "Your Sade Sati is currently
  active — Saturn is in its Peak phase… a period of consolidation and patience". Opted-out:
  no notice at all.
- **Email + unsubscribe status (honest):** real EMAIL delivery is NOT built this session
  (the in-app channel is the working first version). The project already has `api/send-email`
  + a working tokened `api/unsubscribe` to reuse when email delivery is added; per the
  prompt, the unsubscribe requirement attaches to real email delivery when it's built, not
  to the in-app notice (whose "stop" is simply un-ticking the opt-in). The detection engine
  is delivery-agnostic and ready for that channel.

## Part 3 — saved reading history
- **What & where:** a lightweight per-reading snapshot (when + Rashi/Lagna/Nakshatra/
  current Dasha — reusing computed facts, no new calc, no reading prose), stored
  device-local in localStorage. Shown on the Kundali page as "Your reading history" with a
  "what's changed since" note between snapshots.
- **Consent:** recorded ONLY for a user who has SAVED their profile (already opted into
  on-device storage of birth data). No saved profile → nothing retained and the section is
  cleanly absent (verified), not broken. Same "on this device only" posture; disclosed in
  the UI ("Kept on this device only… Not synced to your account").
- **Retention bound:** most recent **10** entries; older dropped. Chosen to show years of
  Dasha evolution without unbounded growth on a small device store.
- **Account-sync interaction (deliberate, tested — Part 3.5):** history is DEVICE-LOCAL,
  keyed to the birth date, with NO account/auth concept in the store — so logging in or out
  does NOT wipe, merge, or sync it; on a device it simply persists (same birth date → same
  history). It does NOT transfer across devices. This is an explicit scope bound (a full
  account-synced history is a documented future step), chosen to avoid bloating the Part L
  account jsonb and to keep the privacy surface minimal. Unit-tested.
- **Real example:** after generating with the reference profile over seeded prior snapshots,
  the list showed 3 dated entries with the note "↳ Your Dasha period has since moved from
  Venus / Mercury to Rahu / Mars." A user with no saved profile sees no history section.
- De-dupe: re-opening an unchanged chart refreshes the newest entry's timestamp instead of
  adding a duplicate row.
