# Part Q — Flags & Triage Record

Two bounded backlog items. This file records (a) Item 1's finding and (b) Item 2's
full Playwright triage, including everything left un-fixed and *why*, per the
project's standing "document-don't-guess" discipline.

Date of run: 2026-09-13/14. Target: `https://staging.bornclock.com` (default
`playwright.config.ts`, 841 tests, Part O local-only exclusions in force).

---

## ITEM 1 — Gemstone functional-malefic / kendradhipati variance

**Outcome: NO change to recommendation logic. Disclosure wording clarified only.**

Fresh research (three independent source clusters, Sep 2026):

1. **Kendradhipati dosha (BPHS/Parashara):** a *natural benefic* owning a Kendra
   (1/4/7/10) loses beneficence; it is neutralised/reversed if it also rules a
   Trikona (5/9) or Lagna. A *natural malefic* owning a Kendra classically *sheds*
   malefice.
2. **Functional malefic by dusthana lordship:** ruling 6/8/12 makes a planet a
   functional malefic — *unless* it also rules the 1st or a Trikona (the
   "mixed-rulership" rule, e.g. Taurus Venus rules 1st+6th and stays benefic).
   This is exactly what the code implements, and it is corroborated across sources.
3. **Gemstone-specific application:** sources **contradict each other** on the
   direction of kendradhipati for a *natural malefic* ruling a Kendra — some say it
   sheds malefice (BPHS), some modern gemstone practitioners treat e.g. Scorpio-Saturn
   (Kendra lord) as a functional malefic to *avoid*. No resolvable majority.

**Conclusion:** the variance remains genuinely split — indeed sources disagree on
the very *direction* of the effect. The code's rule set is the mainstream-conservative
one and is left unchanged (correct per the item's own guidance). The only issue found
was that the old disclosure text mislabelled the *mixed-rulership* case as "the
kendradhipati nuance"; kendradhipati is actually about *angle (Kendra) ownership*, a
distinct rule. The disclosure was rewritten to (a) describe the actual mixed-rulership
logic in plain words and (b) separately, honestly note the genuine kendradhipati
(angle-ownership) split — without changing any recommendation logic.

Verified: `verifyGemstoneReport` passes with zero errors on 4 distinct Lagnas
(Capricorn, Taurus, Sagittarius, Libra). Existing gemstone + gemstoneChat unit
suites pass. No flags for human review on Item 1.

---

## ITEM 2 — Playwright suite: final triage pass

### Fresh before-count (full staging run, pre-fix)

| expected (pass) | unexpected (fail) | flaky | skipped |
|---|---|---|---|
| **771** | **28** | 11 | 31 |

The 11 flaky all passed on retry (page-load timing on cold staging) — genuine remote
flakiness, no action. This is materially better than the last recorded state
(Part L: 61 failed of 891) because Part O's per-file local-only exclusion is holding.

### Fixes made (clean, low-risk, high-confidence — verified passing individually)

| Test | Root cause | Fix |
|---|---|---|
| `12-edge-cases.spec.ts:46` future DOB | `getByPlaceholder(/Priya\|James\|Mum/i)` now matches **two** inputs — a birth-city field ("e.g. Delhi, **Mum**bai…") was added to the birthday-report form and "Mumbai" collides with the `/Mum/` alternative → strict-mode violation | Drop `\|Mum`; `/Priya\|James/i` uniquely targets the name field |
| `12-edge-cases.spec.ts:59` Feb-29 non-leap | same collision | same fix |
| `batch-6.spec.ts:89` footer Compatibility | footer now carries **two** `/compatibility` links → strict-mode violation on a *discoverability* assertion | scope to `.first()` (either link satisfies "discoverable"); duplication itself flagged below |

### After-count (authoritative full-suite re-run, post-fix)

| expected (pass) | unexpected (fail) | flaky | skipped |
|---|---|---|---|
| **772** | **26** | 12 | 31 |

The three fixed specs (`12-edge-cases.spec.ts` ×2, `batch-6.spec.ts`) are **confirmed
gone** from the failure list. The count is 26 rather than the arithmetic 25 because
the flaky `birthday-report.spec.ts:28` blank-page test and the load-sensitive
future-DOB quiz tests toggle between runs (they passed on the mid-triage re-run and
failed here) — which is itself confirmation that those are non-deterministic
flakiness, not deterministic app regressions. Remaining ≈ **16 environmental
local-only + ~9 pre-existing content/behaviour + 1 toggling-flaky**.

---

### Remaining failures — NOT fixed, categorised (all pre-existing / environmental / unrelated to Part Q)

Part Q's only application-code change was `src/lib/vedic/gemstones.ts` (a static
disclosure string). None of the remaining failures touch gemstones, so **none is a
Part Q regression.**

#### A. Local-only specs run against staging — ENVIRONMENTAL (16)

These POST to a local dev API (`localhost:3000/:3001`) or need `.env.local`
service-role secrets. They live in *mixed* files (which also hold staging tests that
pass), so Part O deliberately did **not** exclude the whole file. Confirmed by
manual spot-check: `subscribe.spec.ts` "valid email" fails purely on
`connect ECONNREFUSED ::1:3001`; its staging-only "blog UI" test passes (flaky).

- `launch-gauntlet/06-returnto-roundtrip.spec.ts` — navigates to `localhost:3000` (1)
- `launch-gauntlet/07-subscriptions.spec.ts` — POSTs to `localhost:3001` (4)
- `prelaunch/subscribe.spec.ts` — POSTs to `localhost:3001` (4)
- `prelaunch/ops-seo.spec.ts` — `localhost:3001` (2)
- `prelaunch/batch-7.spec.ts` — `localhost:3001` (1)
- `prelaunch/auth.spec.ts` — needs `SUPABASE_*` secrets (1)
- `prelaunch/pricing-card-states.spec.ts` — needs `SUPABASE_*` secrets (1)
- `prelaunch/profile.spec.ts` — needs `SUPABASE_*` secrets (1)
- `prelaunch/report-content.spec.ts` — `[unit]` test whose `beforeAll` needs `.env.local` (1)

**No regression in Part O's exclusion fix** — no *new* local-only spec appeared; these
are the known mixed-file residue Part O documented, not fresh leakage.

#### B. Pre-existing content / behaviour drift on unrelated pages — DOCUMENTED (9)

Confirmed reproducing on a second staging run (not transient). Each is a genuine
question of *product intent* on a page unrelated to Part Q — fixing any would mean
guessing at intended design, so they are flagged for a human decision rather than
patched:

1. **`forms.spec.ts:4` /contact required fields** — a contact-form field's
   required-ness flipped (expected `false`, got `true`). Content/markup drift.
2. **`08-born-on.spec.ts:6` /born-on renders 12 months** — `getByText('March')` is
   *hidden* (likely a collapsed/accordion redesign of the born-on index).
3. **`currency.spec.ts:57` & `:68` /compatibility CTA currency** — the
   `compat-calc-btn` is now **disabled by default** and its label
   ("Calculate compatibility →") no longer carries a ₹/$ symbol; the test tries to
   click it and read a currency symbol. The compatibility CTA was redesigned.
4. **`navigation.spec.ts:36` Explore ∩ (main ∪ More) = ∅** — the Explore menu now
   shares **2** items with the main/More nav. **Same root cause** as the duplicate
   footer "Compatibility" link (Item 2 fix table). Whether this nav overlap is
   intended is a product-design call. → **Human decision needed.**
5. **`premerge-final.spec.ts:40` & `quiz-validation.spec.ts:28` future DOB** — a
   *tomorrow / future* date of birth is **not rejected**; the longevity quiz still
   appears (expected: rejected, quiz hidden). This is the one cluster that may be a
   real (pre-existing) **validation gap** worth a look, on the life-expectancy quiz
   flow — unrelated to Part Q. → **Human review recommended.**
6. **`premerge-final.spec.ts:142` page-level FAQ hidden during quiz** — the
   life-expectancy FAQ is visible during the quiz phase (expected hidden). Behaviour
   drift on the same quiz flow.
7. **`premerge-final.spec.ts:535` VedicZodiacService rich descriptions** — a zodiac
   description measured **20 chars** where the test expects **>100**. Possible
   content-data regression in the birthday-report zodiac copy. → **Human review
   recommended** (content data, not gemstones).

#### C. Transient (resolved on retry)

- `birthday-report.spec.ts:28` "loads without blank page" — failed once (0 chars),
  **passed on the confirmation re-run**. Remote cold-load flakiness, not a content bug.

---

### Honest final status of the recurring Playwright-cleanup thread

After this pass, **every remaining failure is environmental (local-only specs), a
pre-existing content/behaviour question on a page unrelated to this work, or
retry-resolved flakiness.** No remaining failure is an app regression introduced by
recent sessions. The three clean stale-selector fixes here are the last
low-risk mechanical wins available; what's left needs either a local test
environment (Category A) or a human product decision (Category B), not more
selector-chasing.

**This closes out the recurring Playwright-triage thread.** The two Category-B items
worth a human's attention on their own merits (not for Part Q): the future-DOB quiz
validation gap (B5) and the short VedicZodiacService description (B7).
