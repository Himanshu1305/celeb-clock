# BornClock — Overnight: Mystic Corner + Science & Longevity, Build Through Deploy
## Single self-contained file. Everything needed is inline below — no other files to read. Runs unattended overnight, ends in a real production deploy, no pause for approval.

---

## CONTEXT — read this whole section before starting anything

This is an explicit, deliberate exception to the usual "stop and wait for
go-ahead before deploying" rule. The person is asleep and wants both remaining
category pages live by morning. **This authorization covers deploying `develop`
to production once everything below is verified — it does not cover skipping
verification.** The floor that stays in place: never deploy something you
couldn't actually verify is correct. If a specific piece fails verification,
that piece gets held back and documented — the rest proceeds.

**Step 0 — before starting:** confirm `develop`'s current HEAD is at or past
`e7e1c7d` (includes the merged Vedic Astrology and Birthday & Celebrity pages).
If it's behind that, stop and write this to `docs/part-ag-flags.md` rather than
guessing — do not proceed on an unexpected base.

**Branch:** create `part-ag-mystic-science-pages` off `develop` HEAD.

**On not fabricating anything, especially tonight:** if you can't confirm a
page/feature actually exists, or can't confirm a fact/calculation is genuinely
correct, **leave it out — do not guess, do not invent placeholder content.** A
shorter, fully-honest page beats a fuller page with anything fabricated in it.
This applies with full force to both pages' "real example" sections — those
values must be genuinely verified correct, not estimated, given no one is awake
to catch an error tonight.

---

## PART 1: Mystic Corner (`/mystic-corner`) — full brief

### The job this page does
This is the umbrella for everything personality/divination-based that isn't
classical Vedic astrology and isn't birthday-specific: numerology, Western
zodiac, Chinese zodiac, and any compatibility/tarot content that actually
exists. Tone: somewhere between Vedic (rigor) and Birthday (fun) — engaging, but
with real computed substance, since numerology has actual math behind it worth
being credible about.

### Architecture decision (made, not open)
Build a **new dedicated hub page** at `/mystic-corner` — do not repurpose the
existing `/numerology` page, since Mystic Corner's real scope is broader
(numerology + Western zodiac + Chinese zodiac). `/numerology` stays as its own
real deep-tool page, linked from this hub — same pattern as `/vedic-astrology`
linking out to `/kundali`, `/sade-sati`, etc. **Update the homepage's "Mystic"
card to point to `/mystic-corner` instead of
`/numerology`** — this is a real, global-ish change, note it clearly in the
report.

### Verification requirement — do not guess at scope
Before writing any copy, confirm which of these actually exist as real pages:
Numerology (`/numerology`, confirmed real), Western Zodiac (`/zodiac`,
confirmed real), Chinese Zodiac (`/chinese-zodiac`, confirmed real), a
standalone Tarot page (referenced inside `/born-on/` page content per earlier
research, but NOT confirmed as its own standalone page), a standalone
Love/Compatibility calculator (researched as an opportunity, NOT confirmed
built). If Tarot or a compatibility calculator don't exist as real pages, do
not fabricate links to them — build with what's real, note what's missing as a
future opportunity in the report.

### Section-by-section
1. **Hero.** Headline: *"The mystical side of your birth date."* Subhead: *"Numerology, your zodiac sign, and more — multiple systems, each one actually computed, not copy-pasted from a generic horoscope."* Input: DOB only. On submit, deep-link into the real numerology flow (check for an existing `?dob=`-style deep-link pattern, matching `/birthday-report` and the Birthday & Celebrity page) — do not duplicate calculation logic on the hub page itself.
2. **What you get** — only real, verified tools: Numerology (Life Path + Name Numerology), Western Zodiac, Chinese Zodiac, plus any additional confirmed-real tool.
3. **Go deeper** — whatever confirmed-real deeper tools exist beyond the basics. If there's genuinely nothing more, keep this thin rather than padding it.
4. **How it works** — same three-step pattern as the other category pages.
5. **See a real example** — a real, independently-verifiable fact (e.g. a well-known public figure's correctly-computed Life Path number and zodiac sign). Verify the computation is actually correct before shipping it.
6. **Proof of substance** — lighter tone: *"Real calculations, not templated horoscopes — your numerology is computed from your actual birth date, every time."*
7. **Common questions** — include: how numerology is calculated, whether Western and Vedic zodiac signs are the same thing (they're not — worth clarifying honestly), how this differs from a generic daily horoscope.
8. **Explore by topic** — dense link row to every real tool this hub covers.
9. **Cross-links both directions** — to Vedic Astrology ("want the classical, computed version?") and to Birthday ("curious who shares your birthday?").
10. **Final CTA** — verify what monetized product actually applies (likely the existing Birthday Blueprint or Kundali report funnel) rather than assuming a numerology-specific product exists.

### Visual direction
Same navy `#0E2238` / gold `#C6A15B` / ivory `#FAF7F0` / Fraunces + Public Sans
system already shipped on `/vedic-astrology` and the Birthday & Celebrity page —
same dense, edge-to-edge, hairline-divided layout philosophy, for consistency.

### Testing for Part 1
Every link verified resolving to a real page (not assumed); direct-load the
page fresh to confirm it's not a soft-404; mobile responsiveness checked; full
test suite passes.

---

## PART 2: Science & Longevity (`/life-expectancy` enhancement) — full brief

### The job this page does, and why it's different
This vertical is explicitly demoted — ~5% of effort, an experimental secondary
product, not a growth pillar — because it sits in YMYL (health) territory and
doesn't naturally funnel into paid monetization. **This brief is deliberately
lighter than Mystic Corner** — fewer sections, less funnel engineering, more
focus on honesty and clear scope. This is intentional, not something to "fix"
by padding it out.

### Architecture decision (made, not open)
Enhance the **existing** `/life-expectancy` page as the hub — do not build a
new dedicated page like the other categories got. This matches the actual
lower-effort allocation already decided for this vertical.

### Verification requirement
Confirm which of these actually exist before writing copy: Life Expectancy
Calculator (`/life-expectancy`, confirmed real), a Biological Age calculator
(referenced in earlier research — confirm it's real and find its actual URL
before linking), a standalone longevity quiz (referenced in earlier crawl
findings — confirm before linking). Only link to what's verified real.

### Section-by-section (short, on purpose)
1. **Hero.** Headline: *"How long could you live — and what actually moves the number."* Subhead: *"Real, research-backed longevity factors — for information and curiosity, not a diagnosis."* Reuse the existing `/life-expectancy` calculator's real inputs/logic — don't rebuild it.
2. **What you get** — 2-3 items only: Life Expectancy Estimate, Biological Age (only if confirmed real), a longevity quiz (only if confirmed real).
3. **The honesty section — not optional.** Must include, visually present (not buried in fine print): *"This is a statistical estimate based on population research — not a medical prediction, and not a substitute for a real doctor. Genetics, healthcare access, and factors we can't measure all matter more than any single number here."*
4. **Common questions** — must include "Is this medical advice?" (answer: no, clearly), "How accurate is this really?", and one honest question about what the estimate can't account for.
5. **Light cross-links, not a heavy funnel** — one soft line: *"Curious about the rest of your birth date? See your Vedic chart or find your celebrity birthday twins."*
6. **No dedicated monetization push.** At most one soft mention of a paid product, if genuinely relevant — this page's job is to exist credibly and cheaply, not to convert.

### Visual direction
Same visual system as the other pages, but the page itself should be
noticeably shorter than Mystic Corner and the other two category pages —
matching the actual effort level this vertical is supposed to receive.

### Testing for Part 2
Same discipline as Part 1: every link real and resolving, direct-URL load
check, mobile responsiveness, full test suite.

---

## HANDLING BUILD/DEPLOY COMMAND FLAKINESS

This exact project has already hit background build/wait commands failing
transiently twice this week (an exit-code-144 timeout during a build, and a
harmless exit-code-1 from an unrelated cron trigger during a deploy). Overnight,
with no one to notice a stuck step and re-trigger it: if a build, test, or
deploy command fails or appears to hang, **retry it up to 3 times** before
treating it as a genuine failure. If still failing after 3 attempts, check
whether it's a known-harmless pattern (like the cron exit-code-1 case) before
concluding it's real. If it's a genuine, unresolved failure after retries, stop
that specific part, document it clearly in `docs/part-ag-flags.md` with what
was tried, and move on to whatever can still proceed — don't let one stuck
command silently end the entire overnight run.

## INCREMENTAL PROGRESS LOGGING

Don't wait until the very end to write the report. Append a status update to
`docs/part-ag-morning-report.md` immediately after each major checkpoint (Step
0 confirmed, Part 1 built, Part 1 tested, Part 2 built, Part 2 tested, merge
complete, preview verified, real deploy complete, live verification complete)
— so if this session is interrupted for any reason before finishing, there is
still real partial progress visible in the morning instead of nothing.

---

## PART 3: Consolidate, verify, and deploy for real

1. After both pages are built and individually tested on
   `part-ag-mystic-science-pages`, run the full test suite once more for the
   combined branch and confirm green.
2. Use `wrangler versions upload` for an isolated preview and verify BOTH pages
   on it: every link, both direct-URL loads, both pages' mobile behavior, and
   the homepage Mystic card's new destination.
3. **Only if everything above verifies cleanly:** merge
   `part-ag-mystic-science-pages` into `develop`, run the full suite once more
   post-merge, then build and run a real `wrangler deploy` to production. This
   is the explicitly pre-authorized real deploy — proceed with it once, and
   only once, verification is clean.
4. After deploying, verify directly on live `bornclock.com` (not the preview):
   both pages load correctly with real content, the homepage Mystic card
   navigates to `/mystic-corner`, and the `/life-expectancy` enhancements are
   live. Use real evidence (actual page loads, actual rendered content) — not
   just a bundle-hash check.

### If something can't be cleanly verified
If either page (or a specific section within one) fails verification and you
cannot resolve it confidently on your own — a real merge conflict, a broken
link with no sensible real destination, a calculation you can't confirm is
correct — **do not deploy that piece.**

**Important technical note on what "holding back" actually means:** a single
Cloudflare Worker deploy ships one bundle — there is no way to partially deploy
"page A but not page B" from one build. So if one page verifies cleanly but the
other doesn't, the correct way to hold the failed one back is to **exclude its
route from this deploy entirely** — comment out or remove its route
registration so it isn't reachable (clean 404 or falls through to an existing
page, not a broken half-built page), rebuild, and deploy only the verified page
live. Do not ship a page you know has an unverified or broken section just
because "most of it works."

Document exactly what's uncertain and why in `docs/part-ag-flags.md`, and
proceed with whatever did verify cleanly. It is far better to wake up to "one
page is live, one was excluded and needs a decision from you" than to a broken
page live on production with no one awake to notice.

---

## FINAL REPORT
## (write to `docs/part-ag-morning-report.md` AND include the full thing in
## your final message — the person reads this first thing tomorrow with no
## other context in front of them)

Must include, in plain language:
- Step 0 confirmation.
- What was verified real vs. left out as unconfirmed, for both pages.
- The exact real example data used for each page's §5-equivalent section, and
  where it came from.
- Full link list for both pages with real resolution confirmation.
- Test suite results at each checkpoint (before Part 1, after Part 1, after
  Part 2, after merge, after deploy).
- Whether the real production deploy happened, and if so, the live evidence
  confirming both pages actually work on bornclock.com.
- If anything was excluded per the "can't verify" rule above: exactly what,
  why, and what the person needs to decide when they wake up.
- The final `develop` commit hash and the live production bundle identifier.

---

## WHAT NOT TO DO
- Do not fabricate any linked page, feature, or "real example" fact — leave it
  out and document it instead.
- Do not deploy a page or a section that failed verification — exclude its
  route per the process above rather than shipping it anyway.
- Do not touch `main` — this workflow only involves `develop` and production
  via the worker deploy, as established all week.
- Do not skip the pre-deploy preview verification step, even though the final
  deploy itself is pre-authorized — verification is not what's being skipped
  tonight, only the manual pause between verification and deploy.
