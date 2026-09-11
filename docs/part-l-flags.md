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
