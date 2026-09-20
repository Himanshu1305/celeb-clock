# BornClock — Part M: Matching PDF Fix + Narrative Synthesis
## Single Claude Code session prompt.

---

## CONTEXT FOR CLAUDE CODE

**Do not start this session until Part L (account sync + novelty tools
+ Playwright triage) is fully complete and committed.** Confirm the
working tree is clean and Part L's commits are in place before
beginning — running concurrent sessions against the same repo risks
git conflicts.

The person tested the Kundali Matching report on staging and found two
issues:

1. **The PDF export is blank.** This is a real, functional bug — the "Download/Print PDF" button produces no content. Priority: fix this first.
2. **The report is "too basic" despite showing real, specific per-Koota data.** On closer analysis, the actual problem is NOT missing specificity (each Koota's explanation is genuinely computed and specific — e.g., "Person A is Jalachara, Person B is Manava. Different but compatible groups") — it's missing SYNTHESIS. The report lists 8 correct, specific facts but never connects them into an overall narrative or conclusion, the same gap the Kundali reading itself had before the D-Fix2 session fixed it. This session applies that same proven method to Matching.

**The person does not read code.** All verification must come back as
real, readable examples — actual PDF output described/confirmed working,
actual generated narrative text pasted in full.

---

## PART 1 (PRIORITY): FIX THE BLANK PDF BUG

1. Reproduce the bug first — generate a real Matching report on staging or locally and confirm the PDF is genuinely blank (confirm the exact failure: is it truly empty, does it error silently, does it only render some content, does it exist but fail to open).
2. Find the root cause — check what changed recently in the Matching report structure (Part I built the original deeper report, Part K/L may have touched related code) that could have broken PDF generation. Specifically check git history/blame on the relevant PDF-generation code to determine whether this bug is NEWLY introduced by recent work (Part I, K, or L) or whether it's an older, pre-existing issue only now noticed — this matters for knowing whether to also spot-check other recently-touched pages for the same class of issue (Part L's own session found and fixed a similar "hand-edit introduced a missing import" bug on an unrelated page — check whether a comparable mistake exists here). Check whether PDF generation for Matching reuses the same infrastructure as the Birthday Report's PDF export (mentioned in earlier sessions) or has its own separate implementation — if separate, check whether it was ever actually updated to match the deeper Ashtakoota report structure Part I built, or whether it's still generating from an older, simpler report shape that no longer matches.
3. Fix the root cause. The PDF must include: the full 8-Koota breakdown, the doshas with cancellation notes, the methodology disclosure, and the marriage-timing windows — everything currently shown on the live page, not a subset.
4. Test: generate the PDF for at least 2 real different pairings (reuse the same test pairings from Part I if still available) and confirm real, complete, readable content — not just "a file downloads," actually verify the file's content matches what the live page shows.
5. Playwright: take an actual screenshot/visual capture of the generated PDF's rendered output (not just checking the underlying text/DOM) — a "blank PDF" bug is specifically a rendering problem, so the fix must be visually confirmed, not just confirmed at the data level.

---

## PART 2: ADD NARRATIVE SYNTHESIS TO THE MATCHING REPORT

### The method to apply (same as D-Fix2, applied to a new context)

The current report states 8 correct, individually-computed facts in
isolation. Add a synthesis layer that:

1. **Identifies which factors matter most and why** — Nadi and Bhakoot are already correctly flagged as "high weight" on the page; the narrative should explicitly reason from this (e.g., "both of the two most heavily-weighted factors are fully satisfied, which matters more than the total score alone might suggest").
2. **Explicitly connects multiple Kootas together**, the same "multiple evidence sources, explicit reasoning" requirement from D-Fix2 — e.g., if Graha Maitri is weak but Gana, Bhakoot, and Nadi are all strong, say so as a real, reasoned trade-off, not just adjacent bullet points.
3. **Lands on an actual, real conclusion about the pairing** — calibrated to the actual evidence (a genuinely strong pairing should read as confidently positive; a genuinely mixed one should say so plainly, including which specific factor needs attention and why) — using the same decisive-but-not-guaranteed standard as every other reading in this project. Never a literal prediction about the relationship's success or failure as a certainty — describe compatibility patterns and areas of ease/effort, the same honest framing already used throughout.
4. **Cites the real marriage-timing windows** (already computed and shown) as part of the synthesis where relevant — e.g., connecting a strong compatibility score with the actual favorable timing overlap already shown on the page.

### Where this narrative appears
Add this as a new "Overall reading" or similarly-named section, positioned near the top of the report (after the headline Guna score, before or alongside the detailed Koota-by-koota breakdown) — the same "short synthesis first, details available below" structure already used successfully in the Kundali reading (Snapshot → life areas → deeper layers).

### Accuracy requirement — same zero-tolerance standard as everything else
Every specific claim in the new narrative (which Kootas are weak/strong, which timing window, which doshas are present/cancelled) must be cross-checked against the real computed report data for that exact pairing — extend the existing accuracy-checking pattern (from D-Fix, Part G, D-Fix3) to this new narrative content. Zero tolerance for a claim that doesn't match the real computed Ashtakoota result.

### Testing
- Positive: generate the synthesis for a genuinely strong pairing (high score, no major dosha) and a genuinely mixed pairing (lower score, at least one uncancelled dosha) — paste both in full so the person can read the real difference.
- Negative: a pairing where the underlying report generation fails/times out — confirm graceful fallback (show the factual Koota breakdown without the narrative, never a broken page), same pattern as the Kundali reading's degraded-mode fallback.
- Edge: a pairing with an EXACT tie or borderline total score — confirm the narrative doesn't force an artificially confident verdict where the real data is genuinely mixed.
- Accuracy check: extend the existing checker, report real numbers (claims checked, claims correct) for at least 3 test pairings.
- Re-run the full existing test suite (all prior safety/specificity/accuracy checks) — confirm this doesn't weaken anything, and specifically confirm the new narrative respects the same non-fear-based dosha framing already established project-wide.
- Confirm the PDF (Part 1's fix) includes this new narrative section too, not just the original Koota breakdown — **re-verify the PDF fix and the new narrative TOGETHER, not as two independently-tested pieces that were never confirmed to work in combination.** Generate a fresh PDF after Part 2's narrative work is complete and re-screenshot it, even though Part 1 already tested the PDF once — the two pieces must be proven to work together, not just separately.

---

## MIMIC-MANUAL-TESTING PHASE (standing requirement)

- Exploratory: generate reports for several different real pairings in a row, confirm the narrative genuinely differs each time (not a reworded template) — the same "prove it's chart-specific" check used throughout this project.
- Adversarial: a pairing with a real, uncancelled Nadi Dosha (the most serious classical concern) — confirm the narrative handles this with the same calm, non-fear-based framing as every other dosha in this project, while still being honest that it's the most significant classical concern present.
- Honest self-critique: read 2-3 real generated narratives fresh, as the person who filed this exact complaint would. Does this now read as a real, synthesized assessment rather than a list of facts? Name anything that still feels like separate bullet points wearing narrative clothing.

---

## FULL REGRESSION + FINAL CHECKPOINT

Run the complete test suite. Confirm exact before/after counts, zero
regressions. Final plain-language summary: confirmation the PDF bug is
fixed with real evidence (describe the actual working PDF content),
real narrative examples for a strong and a mixed pairing pasted in full,
the accuracy-check numbers, the mimic-testing findings including the
honest self-critique, and anything flagged for the person's review.

## WHAT NOT TO DO

- Do not report the PDF as fixed without actually verifying its real content matches the live page
- Do not add narrative synthesis that overstates certainty beyond what the D-Fix2 boundary already established project-wide
- Do not weaken the existing calm, non-fear-based dosha framing while adding more decisive synthesis language
- Do not merge or deploy without being asked
- Do not report any part as done without pasting real, specific generated examples
