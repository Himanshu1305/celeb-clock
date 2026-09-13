# Part P — Phase 0 dependency map

Verified against the actual code before building.

## Forms & where names live today
- **Kundali form** (`src/components/BirthDetailsForm.tsx`, prefix `kundali`): date + time + city only. **No name field.**
- **Matching form** (`src/pages/KundaliMatchPage.tsx`): Person A (saved profile or date/time/city) + Person B (date/time/city). Labels are literally **"Person A / Person B"** / "You" / "The other person". No names.
- **Saved profile** (`src/services/savedProfile.ts`): `SavedBirthProfile { dob; time?; city?; savedAt? }` — **no name field**. Opt-in + device-only localStorage (Part E), synced to `profiles.birth_profile` jsonb for logged-in users (Part L).
- **Gift a Kundali**: on the Kundali page it's a `<Link to="/birthday-report/gift">` — a **separate page** (`BirthdayReportGiftPage.tsx`) with its OWN `recipientName` / `giverName` state that does NOT read the saved profile. So the gift "different person" case is already isolated; Part 1 must simply not cross-wire the new saved name into it (it won't, since they're different components).

## Consent model (names are sensitive)
A name associated with birth data is arguably more sensitive than birth data alone. **Decision:** the name is stored in the SAME opt-in structure already consented to (the saved profile: localStorage device-only, and `profiles.birth_profile` jsonb for logged-in users via Part L). No new storage surface, no new consent surface, no DB migration. A user who never opts into saving their profile never has a name stored.

## Notification / email infrastructure (already exists — reuse, don't rebuild)
- `api/send-email.ts` (+ `_email.ts` templates), `EmailService` client wrapper (welcome/trial/nudge/etc.), `api/unsubscribe.ts` (tokened one-click unsubscribe flipping `email_subscribers.weekly_digest`), `api/weekly-digest.ts`, `api/daily-email-cron.ts`, `api/ops-digest.ts`.
- `profiles.email_notifications` (boolean) already exists (general toggle, edited in `Profile.tsx`). A *distinct* chart-notification opt-in would need a new column = a DB migration (the Part L `birth_profile` blocker pattern). **Decision:** store the chart-notification opt-in inside the existing `birth_profile` jsonb / saved profile (`notifyOptIn`), so no migration is needed and it's covered by the same consent.

## Reading storage (for Part 3 history)
- `api/vedic-reading.ts` caches readings in `vedic_chart_cache` (`cache_key`, `chart_data`, `last_accessed_at`) keyed **per-chart** (`reading-v9-<birth>-<dashaTag>`), **NOT per-user**. It's a shared compute cache, so it can't be a user's private history (no user link; entries shared across identical births; evictable). **Decision:** Part 3 stores a lightweight per-profile history (capped) in the saved-profile structure (localStorage device + `birth_profile` jsonb account), reusing already-computed snapshot facts, rather than repurposing the shared cache.

## CRITICAL: scheduled-trigger (cron) reliability — INVESTIGATED FOR REAL
The recurring "schedules failed to deploy" is **NOT harmless**. The worker HAS a real
`scheduled()` handler (`functions/_worker.ts:175`, dispatching by `event.cron`) and 4 crons
in `wrangler.toml`, plus a manual `POST /api/daily-email-cron` trigger. But every deploy's
`PUT …/workers/scripts/bornclock/schedules` returns **`400 Bad Request`** (confirmed in the
wrangler deploy logs, e.g. 2026-09-10), so **the cron schedules are rejected and never
registered** — the `scheduled()` handler will not reliably fire. (A read-only API re-verify
was attempted but the stored wrangler OAuth token is expired; the 400 across multiple deploy
logs is definitive on its own.) The exact 400 body is sanitized in the logs; likely the
Workers-with-Static-Assets + custom-domain deploy model rejecting the triggers.

**Consequence (per Part 2.1):** Part 2 does NOT build a cron-dependent daily job. Delivery is
**opportunistic / manually triggerable** instead — see part-p-flags.md.

## Scope decisions (proportionate, documented)
- **Part 1** — full build (optional name, display/identification only).
- **Part 2** — build + fully test the deterministic **trigger-detection** engine (the real value); deliver via an **in-app, opportunistic-on-visit** notification (opt-in, deduped) which needs neither cron nor email. Real email delivery + its (already-existing) unsubscribe is documented as the next channel once cron/delivery is reliable — the detection engine is delivery-agnostic and ready. This honours "do not build cron-dependent job", "opt-in", "retention bound", and "email unsubscribe requirement applies to real delivery when built".
- **Part 3** — per-profile capped reading history in the saved-profile structure, with an explicit, tested device↔account transition decision and a stated retention bound.
