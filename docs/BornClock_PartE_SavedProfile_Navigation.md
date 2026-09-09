# BornClock — Part E: Saved Birth Profile + Navigation Restructure
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

This follows Part B (engine integration, branch
`feature/vedic-engine-integration-part-b`) and Part D (reading UX, branch
`feature/vedic-reading-ux-part-d`, deployed and verified on staging).
Both are complete and tested but not yet merged to main/develop.

**The person running this session does not read code.** Every
verification must come back as something they can act on without
opening a file: real screenshots, real page-by-page walkthroughs
described in plain language, real pass/fail counts.

### The problem being solved

Right now, a user has to re-enter their birth date/time/place separately
on different pages (birthday report, `/kundali`, `/kundali-match`, etc).
Competitor research (AstroSage, ClickAstro, TimePassages, CafeAstrology,
Astrolink) converges on a consistent pattern: **save the birth details
once, reuse them across every feature** — not a single mega-page, and
not just "better navigation links" without a shared profile underneath.

### The direction (already decided, do not redesign this)

1. A **saved birth profile**: entered once, stored (cookie for anonymous users; if the site has accounts, tie to account for logged-in users), reused automatically by every feature that needs birth details.
2. Kundali, Kundali-Match, and any future AI-chat feature **remain separate, focused pages** (matches every competitor) — not merged into one giant page.
3. The `/kundali` page becomes the **natural anchor/hub** a user returns to, with clear navigation (tabs or equivalent) to Matching and other features, rather than a brand-new landing page.
4. When a feature needs a *second* person's details (Matching), only ask for the second person — reuse the saved profile for the first.

---

## PHASE 0 — MANDATORY: MAP EVERY TOUCHPOINT BEFORE BUILDING

This is a change that touches many existing forms. Do not write
integration code until this is done and written up in
`docs/part-e-touchpoints.md`.

### 0.1 Find every existing birth-details form
- List every page/component with a birth date/time/place input: birthday report flow, `/kundali`, `/kundali-match`, any others found in the codebase.
- For each, note: what fields it currently collects, what it currently does with them (calls which API), and whether it currently persists anything anywhere.

### 0.2 Decide the storage mechanism
- Check whether the site already has a concept of logged-in users/accounts. If yes: does the saved profile belong to the account, or should it work for anonymous users too (likely both — profile in cookie/localStorage for anonymous, synced to account if one exists)?
- Check existing cookie/storage usage in the codebase for a consistent pattern to follow, rather than introducing a new one.
- Decide: one saved profile only ("my birth details"), or the ability to save multiple named profiles (self, partner, family member) — check what Part D's reading feature and the Matching feature would each need, and document the decision with reasoning.

### 0.3 Map what breaks or needs updating
- Every one of the forms found in 0.1 needs to: (a) check for an existing saved profile and pre-fill/skip the form if one exists, (b) offer a clear "use different details" or "edit" option, (c) save/update the profile when new details are entered.
- Does anything currently rely on the user re-entering details every time as a feature (e.g. comparing two different charts for the same logged-in user without overwriting a saved profile)? Flag this if found — don't silently break an existing workflow.

If this reveals significantly more scope than expected (a large number of
forms, complex existing account logic, etc.), stop and flag the person
before proceeding, the same discipline as Parts B and D.

---

## PART E1: BUILD THE SAVED PROFILE SYSTEM

- Build the storage layer (cookie/localStorage + account sync if applicable) per the Phase 0 decision.
- Build a shared, reusable birth-details form component if one doesn't already exist in a reusable form — check for an existing one before building a new one, since Part D's work likely already has a form for the reading feature.
- Every existing touchpoint from Phase 0.1 must be updated to: check for a saved profile first, pre-fill/skip if found, allow editing, save on new entry.

## PART E2: RESTRUCTURE NAVIGATION AROUND THE KUNDALI PAGE

- Add clear navigation from `/kundali` to `/kundali-match` and any other relevant features (tabs, a nav bar section, or prominent links — match the existing site's design system, don't introduce a new visual pattern).
- Confirm `/kundali-match` and other features, once a profile is saved, open with the user's own details pre-filled (only asking for the second person's details where relevant).
- Leave a clear, documented placeholder/slot for a future "Ask your personal astrologer" (AI chat) entry point in the navigation, without building the chat feature itself (that remains a separate future session).

---

## PART E3: TESTING — POSITIVE, NEGATIVE, EDGE CASES, BUILT IN THROUGHOUT

Test after each touchpoint is updated, not just at the end. For each
form/page updated in Phase E1:

| Test type | What to check |
|---|---|
| Positive | First-time user with no saved profile sees the normal form, fills it, it saves correctly |
| Positive | Returning user with a saved profile sees it pre-filled/skipped automatically on a DIFFERENT page than where they entered it |
| Positive | User navigates from Kundali to Matching — their own details carry over, only asked for the second person |
| Negative | Saved profile data is corrupted/malformed (simulate this) — falls back to asking the user again, doesn't crash or show wrong data |
| Negative | User clears cookies/storage mid-session — falls back gracefully, doesn't break |
| Edge | User wants to check a DIFFERENT birth chart than their saved one (e.g. checking a friend's) — confirm there's a clear "use different details" option that doesn't overwrite their own saved profile unless they mean to |
| Edge | Logged-in vs anonymous user behavior, if accounts exist — confirm both paths work |

Report each row's real result — describe what actually appears, don't just say "passed."

**If a row fails, fix it, then re-run the full table again for that
touchpoint before moving to the next one.**

### Playwright E2E tests (extend the existing suite)

- Full walkthrough: enter details on `/kundali` → navigate to `/kundali-match` → confirm own details are pre-filled, only prompted for the second person. Screenshot each step.
- Full walkthrough: return to the site (simulate a new session with existing cookie/storage) → confirm the saved profile loads automatically without re-entering. Screenshot.
- Negative: corrupted storage → confirm graceful fallback to the form. Screenshot.

Run against local preview unless existing Playwright conventions require
staging — check current config, don't assume. If a staging deploy is
needed to fully verify, say so plainly and ask before deploying.

---

## PART E4: FULL SUITE RE-RUN — MANDATORY

After all touchpoints are updated and individually tested:

1. Run the entire existing unit test suite. Confirm exact before/after count and zero regressions from this session's changes specifically (note: the existing suite has known pre-existing failures unrelated to prior sessions' work — per Part D's findings, distinguish clearly between "failure pre-exists and is unrelated" versus "failure is new and caused by this session").
2. Run the relevant Playwright suite (local or staging per the decision above). Same distinction.
3. Fix any regression actually caused by this session's changes, then re-run the FULL suite again, not just the fixed case.

---

## FINAL CHECKPOINT — PLAIN-LANGUAGE SUMMARY REQUIRED

- What a user can now do that they couldn't before (one paragraph)
- A real walkthrough described in plain language: "a user fills the form once on page X, then visits page Y and sees..."
- Every negative/edge case tested, with real observed outcomes
- Anything that didn't work initially — what was wrong, what was changed, confirmed fixed by re-testing
- Exact test counts before/after, confirming zero regressions caused by this session
- What still needs a human's judgment before this goes live
- Whether Phase 0 revealed any scope surprises requiring a decision

## WHAT NOT TO DO

- Do not build the AI chat feature itself — only leave a navigation placeholder for it
- Do not merge anything without being asked
- Do not silently change how any existing feature currently behaves for users who don't have a saved profile yet
- Do not skip Playwright — real UI/navigation changes need real browser verification
- Do not mark any test "passed" without actually running it and reporting the real, specific result
- Use plain language in all summaries — the person reading them does not read code
