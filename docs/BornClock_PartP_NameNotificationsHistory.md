# BornClock — Part P: Name Field + Notifications + Reading History
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

Research on astrology-app personalization found two distinct things
worth separating clearly:
1. **Name fields are a display/identification convenience** (every competitor's Matching tool uses "Boy name / Girl name" instead of "Person A/B") — genuinely worth adding, but this alone does NOT meaningfully increase perceived personalization; it just fixes a real, minor impersonal-feeling gap.
2. **Real personalization drivers**, per research, are: depth of analysis (already built extensively this project), timed/event-based engagement (push notifications tied to real chart events), and continuity (a saved-reading history showing how things evolve over time). These are the actual levers worth building.

This session covers all three, in order of increasing scope. **The
person does not read code.** Final summary must contain real, readable
examples and screenshots described in plain language.

Standing requirements apply throughout: Phase 0 dependency mapping,
sequential parts with separate commits, full positive/negative/edge
testing, Playwright where UI is touched, mimic-manual-testing phase,
full regression at the end, stop and flag genuine surprises in writing
(`docs/part-p-flags.md`) and continue rather than stall, given this is
intended to run largely unattended.

---

## PHASE 0: DEPENDENCY MAPPING

Document in `docs/part-p-touchpoints.md`:
- Current Kundali and Matching forms' exact fields and where names (if any) are currently handled.
- Whether the saved-profile mechanism (Parts E/J/K/L) has a name field already, or would need one added — if adding, confirm this stays consistent with the existing opt-in, privacy-conscious consent model (a name is arguably MORE sensitive to associate with birth data than the birth data alone, per the privacy research found earlier this project — treat it with the same care).
- Whether any push-notification infrastructure already exists anywhere in the codebase (check for any existing notification/email-sending system from other BornClock products or features) that Item 2 could reuse, rather than building new infrastructure from scratch.
- Whether any reading-storage/history mechanism already exists (the reading cache from Part D onward stores generated readings per chart — check whether this could be extended into a user-facing history, or whether it's structured in a way that makes that difficult).

If any of these reveal significantly more complexity than expected
(e.g., building notification infrastructure from zero, no existing
reading-storage pattern to build on), flag it clearly and scope that
specific item down to something achievable, rather than either
abandoning it or quietly overrunning — same discipline as every prior
session.

---

## PART 1: ADD NAME FIELD — KUNDALI AND MATCHING

1. Add an optional (not required — some users may not want to provide a name, and the chart works fully without one) name field to the Kundali generation form and to the saved profile.
2. In Kundali Matching, replace "Person A / Person B" labeling with the actual entered names where provided (falling back to "Person A/B" or similar neutral labels if a name wasn't given) — matching the universal "Boy name / Girl name" pattern found in every competitor researched.
3. Use the name for DISPLAY/IDENTIFICATION purposes only (page headers, PDF titles, distinguishing the two people in a Matching report) — do NOT use it as an input to any astrological calculation (name-based numerology matching is a separate, distinct technique not being built here; do not conflate the two).
4. Respect the existing privacy/consent model: name storage in the saved profile follows the same explicit opt-in rule already established (Part E) — do not silently start collecting/storing names where the existing consent flow doesn't already cover new fields being added to what's saved.
5. **Check the "Gift a Kundali" flow explicitly** (visible on the live Kundali page) — gifting is specifically about someone else's chart, the same "different person" pattern Part E deliberately excluded Baby Names and Birthday Report from participating in the saved profile. Confirm the new name field doesn't get wired into the gift flow in a way that could confuse whose name belongs to whom (e.g., accidentally pre-filling the gift recipient's name field with the logged-in user's own saved name). Document how this was handled.

### Testing
- Positive: generate a Kundali and a Matching report with names provided — confirm they display correctly throughout (page, PDF, any narrative that references "you"/"Person A" — check these don't read awkwardly once a real name could be used instead).
- Negative: generate without providing a name — confirm graceful fallback to neutral labels, no broken text.
- Playwright: screenshot both the named and unnamed cases for Kundali and Matching.

---

## PART 2: NOTIFICATIONS TIED TO REAL CHART EVENTS

Research confirms this is a genuine, real personalization/retention
driver (e.g., "your favorable Dasha window opens next month").
BornClock already computes all the underlying timing data needed
(D-Fix3's Dasha-activation engine, Sade Sati phase transitions, Part I's
Muhurat finder) — this session wires notification delivery, not new
astronomy.

1. **First, verify whether scheduled/cron execution is actually reliable in this environment.** Multiple prior sessions (Parts I, L) noted a recurring "schedules failed to deploy" message during deploys, documented as "known-harmless" without ever being deeply investigated — that assumption needs verifying now, since this feature's entire delivery mechanism depends on it. Test whether a Cloudflare Workers scheduled trigger genuinely fires reliably in this project's actual deployed environment (not just that the deploy command doesn't error) before building Part 2's daily-check logic on top of it. If scheduled execution is NOT reliably verifiable, do not build a cron-dependent daily job — instead, scope this down further (e.g., a manually-triggerable check, or a check that runs opportunistically when a user visits the site, rather than a true background schedule) and document clearly why.
2. Based on Phase 0's findings, either reuse existing notification infrastructure or build the SIMPLEST reasonable version if none exists (e.g., email-based, using whatever email-sending capability already exists in the codebase for other purposes — do not build a new push-notification/mobile-infra system from scratch, that's out of proportion for this session; email is a reasonable, bounded first version).
2. Identify genuinely meaningful trigger events from already-computed data: a Dasha period changing soon, a Sade Sati phase transitioning, an upcoming favorable timing window (from D-Fix3) starting soon.
3. Require explicit opt-in — a user must actively choose to receive these (checkbox, not default-on) — consistent with the project's consistent privacy-conscious design throughout.
4. **If real email delivery is built, it MUST include a working unsubscribe mechanism** — this is not optional polish, it's a real compliance requirement for automated email in most jurisdictions. Do not build one-way notification sending without an easy, working way to stop it.
5. Build this as a scheduled/periodic check (e.g., a daily job that checks which opted-in users have a relevant upcoming event and sends one) rather than real-time — this is proportionate for a first version.
6. **State a clear retention/frequency bound** — e.g., at most one notification per user per event type per time period, so this can't become a spam-like flood if multiple events happen to align. Document the chosen bound plainly.
7. If no existing email/notification infrastructure exists and building one from scratch would be substantial: scope this down to the simplest achievable version (e.g., generating the notification content and logging/storing it as "ready to send" without actually wiring real delivery yet) and document clearly what's built vs. what still needs real delivery infrastructure — do not silently skip this item, and do not force disproportionate new infrastructure either. If delivery is stubbed rather than real, the unsubscribe requirement in point 4 applies once real delivery is eventually built, not to the stub — state this clearly.

### Testing
- Test the trigger-detection logic against real chart data (reference chart plus at least one chart with an upcoming Sade Sati transition or Dasha change) — confirm it correctly identifies who should be notified and why.
- Test the opt-in requirement — confirm a user who hasn't opted in never receives/generates a notification.
- If real delivery is built: test it actually sends (or confirm exactly what's stubbed if it isn't, per point 5 above).

---

## PART 3: SAVED READING HISTORY

1. For a user with an account (per Part L's account sync) or a persistent saved profile, allow them to see previously generated readings over time, not just the latest one — reusing the existing reading-cache storage if its structure allows, extending it if needed.
2. This should show: when a reading was generated, and ideally a brief note on what's changed since (e.g., "your Dasha period has since moved to X" if it has) — reusing already-computed data, not new calculation.
3. Respect the same consent/privacy model — this is additional data retention, so confirm it's consistent with what a user has already agreed to (per Part E's saved-profile consent), or add clear disclosure if this is new retention beyond what was previously agreed.
4. **State and implement a clear retention bound** — do not silently store readings forever by default; document a reasonable limit (e.g., most recent N readings, or a time-based window) and the reasoning for it.
5. **Check the interaction with Part L's account sync explicitly.** If a user generates readings on a device-only saved profile and later logs into an account (or vice versa), define and test what happens to reading history in that transition — does it carry over, merge, or start fresh? This must be a deliberate, tested decision, not an accidental side effect discovered later, the same standard already required for Part L's device-vs-account profile conflict.

### Testing
- Generate multiple readings over simulated time for one profile, confirm history displays correctly and in order.
- Test that a user without a saved profile/account doesn't see a broken or confusing history feature — it should be clearly absent or clearly explained as requiring a saved profile.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: try adding a name mid-way through an existing saved profile that didn't have one; try viewing reading history with zero, one, and several past readings.
- Adversarial: try an extremely long or unusual name (special characters, very long strings) — confirm graceful handling, no broken display or crash.
- Honest self-critique: does the name field genuinely make the product feel more personal, or does it feel like a small, disconnected addition? Does the notification feature feel genuinely valuable, or contrived? Name any part that feels like it doesn't earn its place.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite. Confirm exact before/after counts, zero
regressions. Final plain-language summary: real examples of the name
field in use (Kundali and Matching, with and without a name), the
notification system's real trigger-detection results and honest
delivery-infrastructure status, the reading-history feature with a real
example, the mimic-testing findings, and everything flagged for the
person's review.

## WHAT NOT TO DO

- Do not use the name field as an astrological calculation input — display/identification only
- Do not silently expand what's stored/retained beyond the existing consent model without clear disclosure
- Do not build new push-notification/mobile infrastructure from scratch — email or a simpler proportionate first version only
- Do not merge or deploy without being asked
- Do not report any part as done without pasting real, specific examples
