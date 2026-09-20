# BornClock — Part L: Account Sync + Novelty Tools + Playwright Triage
## Single Claude Code session prompt. Three sequential items, separate commits.

---

## CONTEXT FOR CLAUDE CODE

Three remaining, concrete engineering items, all with clear paths
forward already documented in `docs/part-k-flags.md`. Standing
requirements from every prior session apply: dependency check where
relevant, full positive/negative/edge testing, Playwright where UI is
touched, mimic-manual-testing phase, full regression suite at the end,
separate commit after each item passes its own tests, stop and flag
genuine surprises in writing rather than guessing.

**The person does not read code.** Final summary must contain real,
readable examples.

---

## ITEM 1: ACTIVATE ACCOUNT-LEVEL PROFILE SYNC

`docs/part-k-flags.md` documents the exact ready-to-run SQL and a ~30
minute enable step. **Before this session starts, the person will have
already run this SQL directly in the Supabase dashboard**:
`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_profile jsonb;`
(plus the documented verify query). Confirm this has actually been
done and the column is genuinely present before proceeding — query it
directly to verify, do not assume. If it has NOT been done yet, stop
this item specifically, document that it's still waiting on the manual
step, and move to Item 2 rather than attempting the migration yourself
(the same reliable-verification concern from every prior session on
this topic still applies to actually creating the column — only
proceed with using an ALREADY-CREATED column, confirmed via a real
query).

If confirmed present:
1. Enable the already-written, already-unit-tested `profileSync.ts` (from Part K, currently tested only against a mocked schema) against the real column.
2. Wire it so logged-in users' saved profile syncs to their account; anonymous users continue exactly as today (device-only, unchanged).
3. Test for real against the actual database, using a genuine two-context simulation (e.g., two separate Playwright browser contexts/sessions, or two separate manual test runs with cleared local state in between) both authenticated as the same test account — not just calling the sync function twice within one test file, which would not actually prove cross-device behavior. Confirm a profile saved in context A is genuinely retrievable in context B.
4. **Explicitly design and test the conflict case, not just discover it afterward**: what happens when a device already has its own local (unsynced) profile, and the user then logs into an account that has a DIFFERENT profile already synced from elsewhere? Decide a clear, sensible resolution (e.g., prompt the user to choose which to keep, or a documented default such as "the account's synced profile takes precedence, with a clear notice") — do not leave this as an accidental, untested behavior. Document the chosen behavior plainly and test it directly.
5. Test the fallback path still works correctly for anonymous users (no regression to existing behavior).
6. Test what happens if sync fails (network issue, etc.) — should gracefully fall back to device-only for that session, not break the user's experience.

---

## ITEM 2: NOVELTY SINGLE-DATE TOOLS — SavedDateOffer WIRING

Part K's consolidated touchpoint map lists the remaining single-date
novelty tools not yet wired to the shared profile (low-value, explicitly
optional). Using the same reusable `SavedDateOffer` component Part K
built for Moon Sign:

1. Confirm the exact list of remaining tools from the current `docs/vedic-integration-touchpoints.md` (Item 7's consolidated map) — do not rely on memory of the original list, it may have changed.
2. Wire each one using the same proven pattern: offer to reuse a saved date, offer to contribute an entered date, respect existing opt-in consent, zero change to behavior for a user with no saved profile.
3. This should be fast and low-risk since the pattern and component are already built and tested — if any individual tool turns out to have a structural reason it shouldn't participate (similar to Baby Names/Birthday Report's exclusion), document that specifically rather than forcing it.

Test: for each newly-wired tool, the same regression/reuse/contribute
test pattern already proven for Moon Sign and Age Calculator.

---

## ITEM 3: PLAYWRIGHT SUITE — DEPLOY + REAL TRIAGE

Part K found the main e2e suite (891 tests/71 files) runs against
remote staging and couldn't be meaningfully triaged without the actual
current branch deployed there first.

1. Before deploying, confirm what's currently live on staging — if Part K's work isn't already deployed there, this session's deploy should include everything through Part K plus this session's own Items 1-2, so the triage reflects one accurate, current baseline rather than a partial or stale one.
2. Deploy the current full stack to staging — confirm the deploy succeeds cleanly, same verification standard as every prior staging deploy this project (real smoke test, not just "deploy command exited 0").
2. Run the full existing Playwright suite against this now-current staging deployment.
3. Get a genuine, current, accurate failure count and categorize every failure by root cause: stale selector needing an update, genuine remote-timing flakiness, pre-existing/unrelated issue reproducing on production too (per the established "check if it also fails on production" verification method from Part D/H), or something new this project's work may have introduced.
4. Fix what has a clean, low-risk, high-confidence solution (stale selectors matching genuinely-changed elements, adding retry/wait logic for genuine flakiness where appropriate).
5. For anything genuinely ambiguous or requiring a real judgment call, do NOT guess — document clearly in `docs/part-l-flags.md` with the specific test name and why it needs human judgment.
6. Report a clear, honest before/after count — this may not reach "190 fixed," and that's fine; report the real number achieved and explain what's left and why.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: test account sync across a real multi-session flow; navigate through newly-wired novelty tools in an unplanned order.
- Adversarial: try to break account sync with a sync-then-immediately-edit-elsewhere race condition; try corrupting synced data.
- Honest self-critique: does account sync genuinely solve the "why do I have to re-enter this on a new device" problem cleanly, or are there rough edges (e.g., confusing behavior when a device-only profile and an account profile disagree)? Name them plainly.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite (unit + Playwright, now including the
freshly-triaged main suite from Item 3) after all three items. Confirm
exact before/after counts, zero regressions from this session's changes
specifically (distinguishing from Item 3's own separate before/after
triage numbers). Final plain-language summary: real examples of account
sync actually working across sessions, the list of newly-wired novelty
tools with real examples, the honest Playwright triage results, and
everything flagged in `docs/part-l-flags.md`.

## WHAT NOT TO DO

- Do not attempt to create the database column yourself — only proceed with Item 1 if it's already confirmed present via a real query
- Do not force a novelty tool integration that has a genuine structural reason not to participate
- Do not guess at ambiguous Playwright failures — document them for human review instead
- Do not report any item as done without pasting real, specific examples
- Do not merge to main/develop without being asked (staging deploy for Item 3's testing purposes is expected and fine)
