# BornClock — Part N: Admin/Testing Bypass for Rate Limits
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

The person building this product is themselves currently bound by the
3-question/day free-tier cap on the astrologer chat (and any other
usage limits that may exist, e.g., Matching/Career report generation
if those ever get capped). They need a way to test the product
extensively — many readings, many chats, many Matching pairings — without
hitting consumer-facing limits, without this becoming a security hole
or silently skewing product analytics.

**The person does not read code.** All verification must come back as
real, readable confirmation — actual test showing the bypass works,
actual test showing it CANNOT be triggered by a normal user.

---

## PHASE 0: MAP EVERY EXISTING RATE LIMIT / CAP

Before building anything, find and document in `docs/part-n-touchpoints.md`
every place a usage limit currently exists or could exist:
- The astrologer chat's 3/day free, 15/day paid cap (built in Part F, referenced throughout).
- Any cap on Matching report generation, Career report generation, or other Part I/J/K/L features.
- Confirm exactly HOW the existing chat cap is implemented (client-side localStorage counter, per Part I's earlier finding — "the counter is per-device in local storage") — this matters a lot for how a real admin bypass should work, since a purely client-side cap is trivially different from a server-enforced one.

---

## PART 1: DESIGN THE ADMIN/TESTING BYPASS — SECURITY-CONSCIOUS

This must be genuinely safe, not just convenient. Design principles:

1. **Identity-based, not a guessable secret in client code.** Do NOT implement this as a hardcoded bypass token, magic query parameter, or anything that could be discovered by inspecting client-side JavaScript or network requests — that would let ANY user bypass their limit, not just the admin. If the existing chat cap is client-side (localStorage), a bypass needs to be handled carefully so it can't just be replicated by any user opening dev tools and copying whatever mechanism grants the bypass.
2. **Tie the bypass to the person's actual identity**, using whatever authentication mechanism already exists in the codebase (check if there's an existing admin/owner account concept, or logged-in user identification) — the bypass should apply ONLY when the request is genuinely authenticated as the site owner/admin, verified server-side, not just claimed by the client.
3. **If no server-side authentication currently exists for this purpose**, the simplest genuinely safe option is: a small, server-side allowlist of specific identifiers (e.g., a specific email address if accounts exist, or a specific device/browser fingerprint set manually once by the person, or an environment-variable-controlled admin flag checked server-side) that grants unlimited access ONLY when the request can be verified against that allowlist server-side — never trust a client-side claim of "I'm the admin."
4. **Should NOT skew product analytics/testing data.** If the product tracks usage metrics, ensure admin/testing traffic can be identified and excluded from real user analytics (e.g., tagged distinctly in logs), so testing doesn't contaminate real usage numbers later.
5. **Should be easy for the person to actually use** — once built, getting into "unlimited testing mode" should be a simple, one-time or low-friction setup (e.g., logging into a specific admin account, or a one-time local configuration step), not something that requires touching code every time.
6. **Tier interaction — be explicit about where this sits relative to free/paid.** The existing code has (at minimum) a free tier (3/day) and a paid tier (15/day) check. Adding an admin/unlimited tier means deciding, explicitly and clearly: is this checked BEFORE the free/paid logic (short-circuiting it entirely for the admin identity), or does it sit alongside as a third real tier? Document the chosen approach clearly in code comments and in the final summary — do not let this be an implicit side effect of however the code happened to get structured.
7. **Revocability.** Whatever mechanism is chosen (allowlist entry, admin account flag, etc.) must be easy for the person to turn OFF later — e.g., if using an allowlist, it should be trivial to remove an entry; if using an account flag, trivial to unset it. This matters especially if the person ever shares any device/credential access with someone else (e.g., family helping with content, per this project's known pattern of family involvement in other products) — there must be a clear, simple way to revoke admin/testing access without needing another full engineering session to do it.
8. **Check interaction with Part L's account sync.** If the chosen mechanism ties to a logged-in account, and that account also has (or could have) a saved birth profile that syncs per Part L's work, confirm whether "the admin/testing account" and "the person's own personal saved profile for real use" should be the same account or intentionally kept separate — this is a real design question, not an incidental detail, given Part L's account-sync feature now exists. Make a deliberate choice and document it.

If, on closer inspection, no clean way to do this safely exists without
building more (e.g., a full admin-authentication system) than is
proportionate for a testing-convenience feature, stop and propose the
simplest safe alternative to the person rather than building an unsafe
shortcut — document this clearly rather than choosing convenience over
security silently.

---

## PART 2: IMPLEMENT

Based on Part 1's design (adjust to whatever's actually found/decided):
- Apply the bypass to the chat's 3/day (free) cap.
- Apply it consistently to any other found caps from Phase 0 (Matching, Career report, etc.) if they exist.
- Ensure the bypass is OFF by default for everyone else — this is the most important property to get right.

---

## PART 3: TESTING — POSITIVE, NEGATIVE, AND SPECIFICALLY ADVERSARIAL

This feature's entire purpose is a security boundary, so testing must
be adversarial-first, not an afterthought:

1. **Positive**: confirm the actual admin/testing identity genuinely gets unlimited access — generate more than 3 chat questions in a day using the real bypass mechanism, confirm no block occurs.
2. **Negative**: confirm a normal, non-admin user is completely unaffected — still capped at exactly 3/day, exactly as before this session.
3. **Adversarial (the most important tests)**:
   - Attempt to trigger the bypass AS a normal user by inspecting/copying whatever client-side code exists — confirm this is NOT possible (e.g., try manually setting whatever localStorage value or client flag might superficially resemble the bypass, confirm the server still enforces the real cap because the bypass is server-verified, not client-claimed).
   - Attempt to replay or forge whatever identifier the bypass checks (if it's a specific value) — confirm the server-side check genuinely can't be spoofed with a guessed or copied value.
   - Confirm the bypass mechanism itself is not visible/discoverable in any client-side bundle, network request, or public-facing code in a way that would let someone else find and use it.
4. Re-run the full existing test suite — confirm zero regressions to the existing, working rate-limit behavior for normal users.

---

## FINAL CHECKPOINT — PLAIN-LANGUAGE SUMMARY REQUIRED

- Exactly how the person enables/uses their unlimited testing access, in plain, step-by-step instructions (not code) — e.g., "log into this account" or "here's the one-time setup step."
- Confirmation, with real test results, that normal users are completely unaffected.
- Confirmation, with real test results, that the bypass cannot be discovered or replicated by inspecting client-side code.
- Any limitation or caveat in the chosen approach, stated honestly (e.g., if the safest available option is slightly less convenient than a magic switch, say so and explain why that tradeoff was made deliberately).
- How to revoke this access later, in plain steps, and whether it's tied to or separate from the person's own personal saved birth profile (per the Part L account-sync interaction check).

## WHAT NOT TO DO

- Do not implement any bypass mechanism that is discoverable or repeatable by a normal user inspecting client-side code or network requests
- Do not hardcode a bypass secret directly into client-side JavaScript
- Do not weaken the existing rate-limit enforcement for normal users in any way
- Do not merge or deploy without being asked
- Do not report this as secure without actually attempting to break it adversarially and showing the real result
