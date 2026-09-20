# BornClock — Part T: Pre-Launch Forensic End-to-End Audit
## Single Claude Code session prompt. Treat this as the final QA pass before launch.

---

## CONTEXT FOR CLAUDE CODE

This is explicitly the final, comprehensive testing pass before launch,
intended to substantially reduce the person's own manual testing burden.
It must be genuinely thorough — mimicking a real, skeptical, thorough
human QA tester going through the entire product methodically — not a
quick smoke test.

**Given the scale of this site (dozens of pages across the Vedic
cluster, birthday/age tools, celebrity content, and multiple languages),
start with Phase 0's mapping before assuming the full scope is
achievable in one sitting.** If the true scope is large enough that
completing it with genuine forensic depth in one session isn't
realistic, say so plainly with real numbers (e.g., "47 distinct pages
× 3 languages × positive/negative/edge = X test scenarios, estimated
Y hours") and propose a sensible way to stage it (e.g., by section:
Vedic cluster first, then birthday/age tools, then static/content
pages) — do not silently cut corners to appear to finish everything.

**The person does not read code.** The final report must be organized
so a non-technical person can act on it directly — a clear pass/fail
per area, plain-language descriptions of any real bug found, and an
honest list of what still needs the person's own manual review.

Standing requirements apply: sequential sections with separate commits
for any fixes made, full positive/negative/edge testing, Playwright
throughout (this is fundamentally a Playwright-heavy session), the
mimic-manual-testing discipline applied as the PRIMARY method here (not
just a final phase), fix-then-full-retest for any bug found, stop and
flag genuine surprises in writing (`docs/part-t-flags.md`) and continue
rather than stall on any single blocked item.

---

## PHASE 0: MAP THE FULL SURFACE AREA BEFORE TESTING

Before running any tests, produce a complete inventory in
`docs/part-t-audit-scope.md`:

1. **Every distinct page/route on the site** — pull this from the actual routing configuration, not assumptions. Include the full Vedic cluster (Kundali, Matching, Astrologer, Career Report, Gemstones, Sade Sati, Muhurat), the birthday/age tools (Age Calculator, Birthday Report, Life Expectancy, Days Until My Birthday, etc.), all "Explore" celebrity/content pages, all "Tools" pages, all "Company" pages (About, Pricing, Privacy Policy, Terms, FAQ, Contact, etc.), and anything else found.
2. **Every language variant that exists** (English, Hindi per prior sessions, and confirm if Telugu/others exist yet or are still pending).
3. **Every place a logo/brand mark should appear** — header/nav, footer, favicon, any social-share preview image, PDF exports (Kundali/Matching reports), email templates if any exist, the admin panel if distinct.
4. Based on this inventory, give an honest estimate of total scope (page count × language count × test-case depth) and propose how to stage the work if it's too large for one sitting, per the instruction above.

### Hard boundary — real-money and real-third-party actions

- **Never trigger a real payment, real charge, or real money movement of any kind**, even partially, even accidentally. If a real, live payment gateway exists (not a sandbox/test mode), do NOT proceed past the point of entering payment details — stop, document what was and wasn't testable, and flag this clearly rather than attempting to "test as far as safely possible" without a hard stop defined. If a sandbox/test-mode payment flow exists, use only that.
- **Never send a real email, SMS, or other real-world notification to a real third party** (this includes not triggering the Part P notification system's real delivery path if one now exists, and not using any real customer-facing contact form in a way that would notify a real person) — use test/mock identities and test-mode integrations wherever the codebase supports them, and if a flow cannot be tested without a real-world side effect, stop and flag it rather than proceeding.
- If genuinely uncertain whether an action is safe (sandboxed) or real, treat it as real and do not proceed — document the uncertainty in `docs/part-t-flags.md` instead.

### Astrologer chat cost awareness

Exhaustive positive/negative/edge/adversarial testing of the chat (as
required in Part 3) will generate many real Gemini API calls. Use the
admin bypass (Part N) for this testing rather than exhausting a normal
free-tier allocation, and report the approximate real cost/call-volume
incurred by this session's chat testing specifically, the same
cost-awareness standard already applied in Parts F, D-Fix3, and J.

### The known, already-diagnosed cron issue

Cloudflare scheduled triggers are already confirmed broken (documented
in `docs/part-p-flags.md` and earlier sessions) — this is a KNOWN issue,
not something to re-discover or re-diagnose in this audit. If this
audit's testing surfaces symptoms of it (e.g., a scheduled feature not
firing), note it as the already-known issue with a pointer to the
existing documentation, rather than spending audit time re-investigating
something already understood. Do not attempt to fix it in this session
— that remains its own separate, dedicated task.

---

## PART 1: LOGO AND BRAND-MARK AUDIT

For every location identified in Phase 0.3:
- Confirm the logo actually renders (not a broken image icon, not a missing-alt-text blank space).
- Confirm it renders correctly across at least 2 different viewport sizes (mobile, desktop) — logos are a common casualty of responsive-design bugs.
- Confirm the favicon appears correctly in a real browser tab.
- Confirm PDF exports (Kundali, Matching) include the logo/branding correctly (Part M's PDF fix already addressed rendering — this is a final confirmation, not a re-investigation).
- Report a clear checklist: location → present/absent → renders correctly/broken, for every location checked.

---

## PART 2: FULL PAGE-LOAD AUDIT — EVERY PAGE, EVERY LANGUAGE

For every page identified in Phase 0.1, across every language variant identified in Phase 0.2:
1. Confirm the page loads successfully (real HTTP 200, not a soft-404 or blank render).
2. Confirm there are no browser console errors on load.
3. Confirm no obviously broken layout (overlapping text, cut-off content, missing images) — screenshot a representative sample across page types, not necessarily every single page individually if the volume is very large (use judgment per Phase 0's scope estimate, and say plainly how much visual coverage was achieved vs. spot-checked).
4. For Hindi (and any other non-English) pages specifically: confirm text actually renders in the correct language (not falling back to English due to a missing translation key) and that no obvious encoding issues appear (mojibake/garbled characters).

Report results as a clear table: page → language → load status → console errors → visual check result.

---

## PART 3: END-TO-END FUNCTIONAL TESTING — MIMICKING A REAL TESTER, POSITIVE/NEGATIVE/EDGE

This is the core of the session. For EACH major user flow (not every
static content page — focus this deep functional testing on the
interactive features), run a full positive/negative/edge suite as a
real tester would, not just re-confirming existing automated tests
already pass:

### Flows to cover
- Kundali generation (with and without saved profile, with and without a name, across multiple real birth-detail combinations spanning different decades/hemispheres)
- Kundali Matching (both people's full details, with and without names, various compatibility outcomes)
- Astrologer chat (a full conversation, the crisis/health/financial guardrails, the Yoga-citation accuracy, the timing-question handling, the rate limit and admin bypass)
- Career Report, Gemstones, Sade Sati, Muhurat (each generated end to end)
- The saved-profile system across the whole site (opt-in save, reuse, "use different details," account sync if applicable, the progressive-profile behavior on Age Calculator and other tools)
- The new Part R past-period reflection question (if that session has been completed) — confirm it appears appropriately and the "once ever" tracking holds
- Payment/pricing pages if any real checkout flow exists (test as far as is safely possible without making a real purchase, if a real payment gateway is live)

### For each flow, test explicitly:
- **Positive**: the intended, correct use case, multiple times with different real data.
- **Negative**: invalid input (malformed dates, empty required fields, absurd values like a birth year of 3000), simulated backend/API failures, network interruption mid-flow.
- **Edge**: extreme but valid input (very old birth dates, extreme latitudes, leap days — reuse the known edge-case charts from earlier sessions if still available), rapid repeated interaction (double-clicking submit, navigating away mid-generation), browser back/forward through a multi-step flow.
- **Adversarial**: attempts to break something intentionally (SQL-injection-style strings in text fields, extremely long input, trying to access another user's data, trying to bypass the chat rate limit as a normal user).

For every bug found: document it clearly, fix it, then RE-RUN THE FULL RELEVANT TEST SET (not just the one failing case) to confirm the fix and that nothing else broke — the same fix-then-full-retest discipline as every prior session, applied with extra rigor here since this is the final pre-launch pass.

---

## PART 4: CROSS-CUTTING FORENSIC CHECKS

- **Broken links**: crawl the site for internal links that lead to 404s or dead ends.
- **Accessibility basics**: images have alt text, forms have labels, basic keyboard navigability on key flows (not a full WCAG audit, but a genuine basic check).
- **Mobile responsiveness**: spot-check the major flows (Kundali, Matching, Astrologer) on a mobile viewport specifically, not just desktop.
- **Performance red flags**: any page that loads unusually slowly, any obvious unoptimized asset — flag for awareness, not a full performance audit.
- **Security basics relevant to launch**: confirm no API keys or secrets are exposed in client-side bundles (extend the check already done in Part N for the admin bypass to a general sweep), confirm HTTPS is enforced everywhere, confirm the admin bypass from Part N genuinely cannot be triggered by a normal user (re-verify this specific adversarial test as part of this final pass, given its importance).

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete existing test suite (unit + Playwright) in addition to
everything built in this session. Confirm exact before/after counts.

### Final report structure (plain language, organized for direct action)
1. **Executive summary**: overall health assessment — is this genuinely ready for launch, or are there real blockers?
2. **Logo/brand audit results** (Part 1) — clear pass/fail table.
3. **Page-load audit results** (Part 2) — clear pass/fail table, broken down by language.
4. **Functional testing results** (Part 3) — every bug found, whether fixed and re-verified, or still open with a clear reason.
5. **Forensic checks** (Part 4) — results and any flagged concerns.
6. **What still needs the person's own manual review** — stated honestly and specifically (e.g., "read 3-5 real Kundali/Matching/chat outputs yourself for tone, since automated testing cannot judge whether content feels trustworthy and warm — this has been the one category of issue automated testing has never caught in this entire project").
7. **Any scope that had to be deferred or staged**, per Phase 0's honest scope assessment, clearly listed for a follow-up session.

## WHAT NOT TO DO

- Do not claim full completion if the true scope required staging — report honestly what was covered vs. deferred
- Do not skip the fix-then-full-retest discipline for any bug found, however small
- Do not claim to have verified "tone" or "trustworthiness" of generated content — that is explicitly the person's own job, state this plainly rather than overclaiming automated coverage
- Do not merge or deploy without being asked
- Do not report any section as passed without real, specific evidence (screenshots described, real test counts, real examples)
