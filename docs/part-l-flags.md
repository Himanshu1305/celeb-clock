# Part L — Flags for the person's review

## Item 1 — Account-level profile sync → ACTIVATED
- Verified via a REAL query that `profiles.birth_profile` (jsonb) exists (you ran the SQL). Confirmed
  before doing anything.
- Found + fixed a real bug in the Part K sync code: it matched the profile row by `id`, but the app
  keys a user's row by **`user_id`** (= auth user id, same as `useAuth`). Corrected to `user_id`.
- **Conflict resolution (designed, not discovered):** when a device has a local profile and the
  account has a DIFFERENT synced profile, the **account copy takes precedence** (the cross-device
  source of truth) AND a clear notice is surfaced (`ProfileConflictNotice`) letting the user one-tap
  **switch to this device's details** (which re-syncs). Never a silent overwrite. Unit-tested +
  UI-tested.
- **Genuine cross-session proof:** a live two-client round-trip against the REAL database (client A
  saves → a fresh client B loads the same profile), with the original row value restored afterward.
- Anonymous users are untouched (device-only, unchanged); all sync failures fall back to device-only.

<!-- Items 2, 3 flags appended as they complete. -->

## Item 2 — novelty single-date tools wired to the shared profile
Confirmed the remaining list from the consolidated map, then wired all 6 via the reusable
`SavedDateOffer` (offer-reuse + offer-save, opt-in, no change for users without a profile):
`/chinese-zodiac`, `/vedic-zodiac`, `/biorhythm`, `/tarot-card-by-birthday`, `/planetary-age`,
`/life-expectancy`. None had a structural reason to be excluded (all are self-use date tools).
Baby Names and Birthday Report remain excluded (they're about a different person). Consolidated
touchpoint map updated to match.
