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

<!-- Items 2-7 flags appended as they complete. -->
