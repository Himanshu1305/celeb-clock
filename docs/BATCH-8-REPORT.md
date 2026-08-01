# BATCH-8 — Content Depth v2 · Feedback System · DOB Component · Nav · SEO Editorial

All seven phases (P1–P7) completed per amendment A1. tsc 0 new; local commits only (not pushed).

---

## ⚠️ FOUNDER SIGN-OFF / ACTION AT THE TOP
- **Apply `supabase/migrations/NOTES-feedback.sql` in Studio** to switch the feedback system on
  (it's tolerate-absent — the UI hides until applied; nothing public renders with zero data).
- **/gift** and **/coach** copy is refreshed (care-centred) — a quick read is welcome, but not blocking.
- After feedback rows arrive, **approve the first ones** in Admin → Feedback (two-key: needs consent AND approval).

---

## 1. /gift hero — chosen + alternatives (founder may swap)

**Chosen:** **"A gift that makes them feel truly seen."** — it centres the RECIPIENT feeling seen and
cared-for (the founder's reframe), not a test of the giver. The problem block reinforces it:
*"Most gifts are about the occasion. This one is about them… so what they feel when they open it isn't
'nice, a gift,' but 'someone really sees me.'"*

Alternatives drafted (swap the H1 string in `src/pages/GiftReport.tsx` if you prefer one):
1. "The gift that shows how much you care"
2. "Anyone can buy a present. This one says: I pay attention to you."
3. "The 21st-century keepsake — made from the one date that's entirely theirs"

Reference pages studied (structure/psychology only): **Storyworth** (welcome.storyworth.com — recipient-as-
honoured-subject, the strongest match for the care reframe) and **Birthdate Co** (birthdate.co). The kept
skeleton: hero+price+CTA → problem → what they receive → sample → occasions → **un-invented testimonial
placeholder** → objections (instant delivery / 7-day guarantee / permanent access) → repeat CTA → FAQ.
**/coach** already carried the founder's full direction from batch-7b (prominent zero-retention privacy panel,
concrete scenarios, gentle urgency, honest limits, currency-aware pricing) — verified against P2, unchanged.

---

## 2. Findings from the fix-loop
- **P1 thin-content self-catch (the important one):** the first depth-v2 pass made two *same-element* pairs
  read almost identically in the FRICTION/MAKING-IT-WORK sections — because same-element ⟹ same-polarity, so
  every same-element pair collapsed into one "Yang command" / "Yin avoidance" branch. Classified as a PRODUCT
  quality bug (the exact "still thin" complaint), fixed by **composing** friction from *polarity opener +
  modality clause + aspect clause* and the fix-tips from *polarity + aspect + the correct modality role split*.
  Now Aries-Leo (Cardinal-Fixed, "momentum vs immovability") reads distinctly from Leo-Sagittarius
  (Fixed-Mutable, "settle vs shake it up"). Re-verified (§3).
- **P4 unit-testability:** `feedback.ts` imported the Supabase client (which touches `localStorage` at load),
  breaking Node unit tests. Extracted the pure logic to `src/lib/feedbackLogic.ts` (no Supabase/DOM), which
  `feedback.ts` re-exports. TEST-BUG-adjacent refactor; no behaviour change.
- **P5 nav test:** updated the `navigation.spec` Explore exact-set to the new 10-item set (Numerology ×2 + Gift
  moved in) — a documented spec update, not a weakening.

---

## 3. P1 — compat depth v2: two-pair diff evidence

Each pair page now has **7 composed sections** — verdict (clicks/clashes), Love, Friendship, Work, **Day-to-day**,
**Where it gets hard**, **Making it work** — plus a strengths/challenges summary and a **5-question** FAQ (incl.
"Is {A}-{B} a good marriage match?" and "Are {A} and {B} compatible as friends?"). 700+ pair-specific words.
Composition engine (one data module, `compatibilityProse.ts`): each section is driven by a *different* primitive
(Love→planets, Friendship→element+aspect, Work+Day-to-day→modality, Friction→polarity×modality×aspect).
References studied: AstroStyle, ZodiacSign.com, Astrology.com, InstaAstro (structure only).

**SAME element (both Fire) — Where it gets hard:**
> **Aries × Leo:** *…The **Cardinal–Fixed** pairing shapes it — the initiator wants to move now while the anchor
> won't be rushed — momentum against immovability. And because you form a **trine**, complacency, not conflict,
> is the threat…*
> **Leo × Sagittarius:** *…The **Fixed–Mutable** pairing shapes it — the anchor digs into what works while the
> wanderer wants to change it — "settle down" versus "shake it up"…*

**DIFFERENT element — Where it gets hard:**
> **Aries × Cancer (Fire+Water, square):** *…sit at a square — the zodiac's built-in friction angle — where the
> same wants arrive on different timelines…*
> **Taurus × Gemini (Earth+Air, semi-sextile):** *Earth and Air read the world differently — Taurus leads with
> feeling and steadiness, Gemini with action and logic…*

**SAME-SIGN mirror (Aries × Aries):** own treatment — *"there's no counterweight… every strength is doubled and
so is every blind spot… manufacture the contrast the zodiac didn't give you."* (Not the generic template.)

Automated near-duplicate guard (`batch-8-logic.spec`): first-300-chars of each new section differ across both
same-element and different-element pairs; same-sign asserts mirror language.

---

## 4. P3 — surfaces converted to DobInput

One shared `src/components/DobInput.tsx` (DD/MM/YYYY text fields, `inputmode="numeric"`, hard digit caps,
auto- + smart-advance, backspace-return, blur zero-pad, digit paste, inline trio validation). **13 DOB entry
surfaces converted** (every one found; 2 read-only report views and the chronological-age BiologicalAge page are
not DOB inputs):

| # | Surface | File |
|---|---|---|
| 1 | Homepage hero | `src/pages/Index.tsx` |
| 2 | Birthday Report form | `src/pages/BirthdayReport.tsx` |
| 3 | Age Calculator | `src/components/AgeCalculator.tsx` |
| 4 | Planetary Age | `src/pages/PlanetaryAgePage.tsx` |
| 5 | Biorhythm page | `src/pages/BiorhythmPage.tsx` |
| 6 | Moon Sign | `src/pages/MoonSignPage.tsx` |
| 7 | Chinese Zodiac | `src/pages/ChineseZodiac.tsx` |
| 8 | Vedic Zodiac | `src/pages/VedicZodiac.tsx` |
| 9 | Rhythm widget | `src/components/RhythmWidget.tsx` |
| 10 | Birthday Hub | `src/pages/BirthdayHub.tsx` |
| 11 | Tarot by Birthday | `src/pages/TarotByBirthday.tsx` |
| 12 | Life Expectancy | `src/pages/LifeExpectancy.tsx` |
| 13 | Family Dashboard (feature-flagged off) | `src/pages/FamilyDashboard.tsx` |

Behaviour verified in `batch-8.spec` (auto-advance on 05, smart-advance on 7, no-advance on 1 in Month, single
digit+Tab→05, year hard-stop at 4 digits, backspace-return, paste "02051985") and validation in `batch-8-logic`
(Feb 29 leap vs non-leap, Feb 30, month 13, future, >120y, single-digit normalise).

---

## 5. P4 — feedback system + two-key evidence

**`NOTES-feedback.sql`** (apply in Studio) creates `public.feedback` (content_type ∈ report|blog, slug, rating,
comment, **consent**, **approved** default false, **dismissed**, `unique(user_id,content_type,slug)`,
`user_id … on delete cascade`) with RLS: user-own insert/update/select, **public select only when
`approved AND consent AND rating>0`**, admin read/update/delete. Tolerate-absent everywhere (UI hides until applied).

**TWO-KEY publication (no exceptions, incl. 5★):** `isPubliclyVisible = consent === true && approved === true`.
Asserted in `batch-8-logic`: consent-without-approval → hidden; approval-without-consent → hidden. The admin
Approve button is even **disabled when a row has no consent** (approval alone can never publish it).

Other P4 logic (unit-tested): engagement gate (≥50% scroll OR ≥45s), sentiment routing (4-5★→consent comment
with checkbox DEFAULT UNCHECKED; 1-3★→private "what would have made this better?"), average shown only at ≥5
ratings (4→no stars, 5→shown), publicComments = two-key survivors with non-empty text. XSS: comments render as
plain React children (auto-escaped) in both public display and admin. Delete-account: explicit tolerate-absent
feedback delete added + FK CASCADE. Wired into `BlogPost` (article end) and `ReportView` (after unlock, never on
the locked preview or PDF). Admin → **Feedback** section (filters: all / low-rating queue / consented / report /
blog · approve-toggle · average), following the session-gating admin pattern.

---

## 6. P5 — final nav at three widths

**Main bar (desktop):** Home · Age Calculator · Today's Birthdays · Celebrity Match · Birthday Report ·
**Life Expectancy** · Astrology · Explore · More · Upgrade. **Numerology (both) and Gift a Report moved into
Explore**; the standalone Numerology dropdown is removed; Birthday Report remains the single money item on the bar.
Footer already surfaces all moved items. Verified in `batch-8.spec`: bar shows Life Expectancy, Explore has
Numerology + Gift, no Numerology dropdown; **no wrap/overflow at 1280 or 1024px** (nav height < 80px = single row);
**390px** mobile menu contains `/life-expectancy`, `/numerology`, `/gift`.

---

## 7. P7 — SEO editorial: audit before/after + example titles

Re-ran `scripts/seo-audit.mjs`. SEVERITY-1 stays **0**. Soft findings **1559 → 1158** (−401): the T2
title bucket dropped **830 → 438** (the compat + birthday/:m/:d shortenings), all link-graph/schema checks
stay 0. The remaining T2/T3 are the `/born-on/:slug/india` name-hook titles (intentional keywords) + a
handful of others; T4 = the 2 shared-widget double-h1s (reported); C2 = the documented artifact.
Keyword-preserving, template-level title shortenings (head term kept; verified 5 still contain their primary
keyword in the audit):

| Template | Before (chars) | After (chars) | Head keyword kept |
|---|---|---|---|
| `/compatibility/:a/:b` | `Aquarius & Aries Compatibility — Love, Friendship & Work Match \| BornClock` (74) | `Aquarius & Aries Compatibility \| BornClock` (42) | "{A} & {B} Compatibility" ✓ |
| `/birthday/:m/:d` | `March 21 Birthday — Personality, Zodiac & Famous People \| BornClock` (67) | `March 21 Birthday — Personality & Famous People \| BornClock` (58) | "{Month} {d} Birthday", "Personality", "Famous People" ✓ |

Brand-suffix: `| BornClock` appended to blog titles **only where it doesn't push past 65 chars** (per the rule) —
most article titles keep their natural form. The `/born-on/:slug/india` titles keep their celebrity-name hooks
(the names ARE the keywords) and are documented as intentional, not shortened.

**/leaderboard** (was 131 words, C1): added a "How the Longevity Leaderboard works" section (what it ranks, how
the score is derived, WHO/GBD provenance, the "estimates not predictions" honesty) — now well over the 150-word
threshold. **C2** ("first-200-chars identical across all pages") is confirmed an **extraction artifact** of the
audit script (the shared sticky-header chrome, a `<div>` not stripped as `<nav>`), not real duplicate content —
documented, no code change.

---

## 8. Results matrix (A3)

| Phase | Positive | Negative | Edge | Status |
|---|---|---|---|---|
| **P1** compat depth | 3 pair pages render all 4 new sections + FAQ=5 (`batch-8.spec`) | bogus slug → not-found, not calculator | same-sign mirror; near-dup guard on same- & diff-element diffs (`batch-8-logic`) | ✅ |
| **P2** gift/coach | care hero renders; ₹/$ currency-aware; testimonial placeholder present | no invented testimonial (placeholder marker asserted) | reachable from nav (P5 tests) | ✅ |
| **P3** DobInput | auto-advance 05; single+Tab→05; behaviour suite | year hard-stop; backspace-return | Feb29 leap/non-leap; Feb30; month13; future; >120y; paste | ✅ |
| **P4** feedback | gate/sentiment/threshold/two-key/publicComments logic | consent-w/o-approval hidden; approval-w/o-consent hidden; 4→no stars | XSS escaped (React); delete-account tolerate-absent; admin approve disabled w/o consent | ✅ (logic; live DB gated on NOTES) |
| **P5** nav | 1280 bar shows Life Expectancy; Explore has Numerology+Gift | no Numerology dropdown; Explore∩(main∪More)=∅ | 1024 no overflow; 390 mobile parity | ✅ |
| **P6** routing+grid | selection → canonical URL; A-Z ≥78 links | every grid link canonical (a≤b, no redirect source) | reverse-order selection → canonical (no 301 hop); same-sign | ✅ |
| **P7** SEO editorial | audit re-run, soft findings reduced, SEV-1=0 | 5 changed titles keep primary keyword | /leaderboard passes C1 | ✅ |

No scenario silently omitted. P4's live DB paths (real upsert / admin toggle against Supabase) are gated on
`NOTES-feedback.sql` being applied — until then the table is absent by design (tolerate-absent); the two-key /
threshold / gate LOGIC is fully unit-tested, which is the deterministic core.

---

## 9. Gate
- tsc: 0 errors (0 new). ✅
- build: **1341 ok / 0 failed** — count reconciled: **no new routes** vs the 1341 baseline (P4/DOB/nav are
  component changes; P1/P2/P7 are content/title changes on existing pages). ✅
- test:prelaunch: gauntlet **135/135** + prelaunch **185/185** (154 baseline + batch-8-logic 14 + batch-8 17). ✅
  - Fix-loop: 11 failures were all TEST-BUGs from intended changes, updated as documented spec changes (no
    product code, no weakened assertions): `09-mobile` Numerology→Explore section label; `12-edge-cases` +
    `currency` drive the new DobInput fields instead of the removed native date input; `batch-7b` /gift now
    under Explore (P5). Also self-caught + fixed the P1 same-element thin-content issue (§2).
- frozen files empty diff · invoice_counters **BC 1002 / BN 1001 / BX 1001** unchanged. ✅
- live post-deploy: <FILL>
- ONE deploy · IndexNow ping changed URLs — <FILL>.

---

## 10. Founder task list
1. **Apply `NOTES-feedback.sql`** in Supabase Studio (turns the feedback system on).
2. **Editorial pass** on /gift + /coach + spot-check 3 compat pages (e.g. /compatibility/aries/leo trine,
   /compatibility/aries/libra opposition, /compatibility/taurus/taurus same-sign).
3. **Try the DOB input** personally on the homepage — the auto/smart-advance + zero-pad flow.
4. **Approve the first feedback rows** when they arrive (Admin → Feedback; needs consent + approval).
5. Optional: swap the /gift hero for one of the §1 alternatives if you prefer.
