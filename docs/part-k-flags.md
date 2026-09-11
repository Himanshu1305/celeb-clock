# Part K — Flags for the person's review

Judgment calls and deferrals made during this session, per the "stop and flag in
writing" rule. Updated as items complete.

## Item 1 — Age Calculator progressive-profile integration → BUILT (not deferred)
Re-examined `BirthDateContext` on closer inspection: it is a tiny, in-memory-only
context (it deliberately does NOT persist DOB) and the `<AgeCalculator>` component
already takes an `initialDate` prop + `onBirthDateChange` callback. So a clean,
ADDITIVE bridge is achievable **at the page level without modifying BirthDateContext
or the AgeCalculator component at all** — the original "touching a separate pre-existing
mechanism" risk is avoided. Built: an opt-in "use your saved birth date?" banner and an
opt-in "save this date for other tools?" offer. A user with no saved profile sees the
page exactly as before (both offers render nothing). No defer needed.

## Item 4 — Account-level profile sync → DEFERRED again (migration still not applicable here), but sync CODE is written + tested

Re-examined honestly. The blocker genuinely still applies from this environment:
- There is **no Supabase CLI** installed, and migrations follow the manual
  `supabase/NOTES-*.sql` "run this in the dashboard yourself" pattern.
- The **service-role key in the local env is invalid** ("Invalid API key"), so I
  cannot even connect to the DB from here — no reliable apply path AND no reliable
  verify path. Per Item 4.3, I did NOT attempt the migration.

**What's real vs prepared (Item 4.4):**
- REAL + TESTED (against a mocked schema, 5 tests): `src/services/profileSync.ts` —
  `syncProfileToAccount`, `loadProfileFromAccount`, `resolveProfile`. Every function
  degrades gracefully if the column is missing (Postgres 42703) → the app keeps
  working device-only exactly as today. Opt-in/device-only consent unchanged.
- NOT DONE: the live migration, and wiring the sync into `useSavedProfile` (left
  dormant so no untested auth path ships against a non-existent column).

**Concrete, ready-to-execute unblock (for the person, ~2 minutes in the Supabase dashboard):**
1. Supabase dashboard → SQL editor, run:
   ```sql
   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_profile jsonb;
   ```
2. Verify it took (run this; it should return rows with a null column, not an error):
   ```sql
   SELECT id, birth_profile FROM public.profiles LIMIT 1;
   ```
3. Then the small enable step (a future session, ~30 min): add `birth_profile: Json | null`
   to the `profiles` Row type in `src/integrations/supabase/types.ts`, and call
   `resolveProfile(...)` / `syncProfileToAccount(...)` from `useSavedProfile` for
   logged-in users (falling back to device-only for anonymous users — already the
   default). The tested code is ready; only this wiring remains.

## Item 6 — site-wide profile extension: integrated vs deliberately excluded
- **Birthday Report (`/birthday-report`) → deliberately EXCLUDED (documented).** It collects a
  recipientName + gifterName + the *recipient's* DOB — a GIFT report about ANOTHER person, not
  the user's own chart. Offering "use my saved birth date" would be wrong. Same structural
  reasoning as Baby Names. (Its embedded Vedic section already offers the saved profile for the
  self-use case, gated on a full profile in Part J.)
- **Baby Names → confirmed EXCLUDED** (checks a different child each time; correct per Part E).
- **Moon Sign (`/moon-sign`) → NEWLY INTEGRATED** via a reusable `SavedDateOffer` component
  (opt-in offer-reuse + offer-save, device-only) — a concrete date-only example proving the
  pattern generalises beyond the Age Calculator.
- **Other single-date novelty tools** (Chinese/Vedic Zodiac, Planetary Age, Biorhythm, Tarot,
  Life Expectancy) → NOT integrated this session (documented, not silently skipped): one-shot
  entertainment calculators with bespoke inputs, predating the saved-profile design, that don't
  produce a reusable profile. `SavedDateOffer` makes adding them a clean mechanical follow-up
  if desired — a low-value/bounded item deferred rather than forced across ~6 varied pages.
