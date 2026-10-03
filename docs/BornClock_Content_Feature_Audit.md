# BornClock — Content & Feature Audit (Read-Only, No Changes)
## Single Claude Code session. This is an information-gathering prompt only — no code changes, no branch, no deploy. Output is a written report.

---

## CONTEXT

Two real problems need real evidence before anyone rewrites anything:

1. A recurring complaint that BornClock's astrology content uses technical/
   jargon terms without explaining what they mean or why they matter to the
   reader. This may mean the "four-dimension" explanation standard (what it
   is / why it matters / what it means for this person / how it connects to
   other placements) — already used successfully elsewhere on the site — was
   never applied to some pages, or was applied inconsistently.
2. Six specific pages need their current real state documented before any
   depth or content work happens on them: Kundali, Sade Sati, Muhurat,
   Gemstones, Rashi Ratna, and Sun-vs-Moon-Sign, plus the "Career Analysis
   (Vedic)" dropdown item's actual destination.

**Do not fix anything in this session.** Read, extract, and report only. A
follow-up session will use this report to plan the actual content rewrite.

---

## PART 1: Jargon/technical-term audit (the core content-quality question)

For each of these pages — `/kundali`, `/sade-sati`, `/muhurat`, `/gemstones`,
`/rashi-ratna`, `/sun-vs-moon-sign`, `/career-report` (or wherever "Career
Analysis (Vedic)" actually links, per Part 3 below), `/kundali-match` — do the
following:

0. **First, check whether a sitewide glossary, tooltip, or "what does this
   mean" mechanism already exists anywhere in the codebase** — a shared
   component, a hover-definition system, a glossary page, anything of that
   kind. This matters a lot for what the fix should look like: if something
   like this already exists but isn't used consistently, the real
   recommendation is "apply it everywhere," a much smaller job than writing
   new inline explanations from scratch on every page. Report clearly whether
   this exists, and if so, which pages currently use it and which don't.

1. Read the actual live page content (component source, not just a
   description of it).
2. **List every technical/Vedic-astrology term that appears** — e.g. Lagna,
   Nakshatra, Dasha, Antardasha, Yoga, Dosha, Dhaiya, Ashtakoota, Navamsa,
   Ratna, Yogakaraka, or any other term specific to this domain.
3. For each term found, quote the exact sentence(s) it appears in, and judge
   it against the same four-dimension standard already used successfully
   elsewhere on the site: does the surrounding text cover (a) what the term
   is, (b) why it matters, (c) what it means for this specific reader, and
   (d) how it connects to other placements? Report which of the four
   dimensions are present and which are missing for each term — not just a
   yes/no "explained."
4. Produce a simple count per page: total jargon terms found vs. terms
   actually explained on first use. This ratio is the real evidence for
   whether the "too technical, not explained" complaint is accurate, and
   where it's worst.
5. Note paragraph length and structure per page — are explanations one-line
   fragments, or do they walk through what/why/meaning-for-you/connection?
   Quote a representative example of the weakest explanation found on each
   page, verbatim.

**Do not summarize or characterize the writing generally — quote the actual
text.** The report needs to show real evidence, not an impression.

---

## PART 2: Current feature-depth inventory for the six flagged tools

For each of the following, report the real, current state — verified by
reading the actual code/data, not assumed:

### Kundali (`/kundali`)
List every section currently present (e.g. Lagna, Rashi, Nakshatra, planetary
positions, Dasha, Yoga detection, Navamsa). Confirm whether Kaal Sarp Dosha,
an Ashtakvarga-equivalent planetary-strength view, and a remedies section
exist or don't.

### Sade Sati (`/sade-sati`)
Confirm whether the three phases (rising/peak/setting) are each explained with
real life-area effects, whether real start/end dates are shown, and whether a
remedies/upay section exists.

### Muhurat (`/muhurat`)
Report the exact current list of occasion types offered, whether location/city
is currently asked for at all, and the exact current lookahead-period options
(confirm if it's really fixed at 30/60/90 days only, or if a custom range
exists that isn't obvious in the UI).

### Gemstones (`/gemstones`)
Report the actual current basis for the recommendation shown — is it Lagna-
based with functional-benefic/weak-planet/Dasha reasoning, or Rashi-based, or
something else? Report whether any wearing-ritual detail (metal, finger, day,
sizing) is currently shown.

### Rashi Ratna (`/rashi-ratna`)
Report its current actual basis (confirm it's Moon-sign-based) and whether it
currently explains its relationship to `/gemstones` at all, or presents as an
apparently separate, unrelated tool.

### Sun vs Moon Sign (`/sun-vs-moon-sign`)
Report the current actual content — confirm whether it's a two-way (Sun/Moon)
or already covers a third element (Ascendant/Lagna), and whether it currently
links to `/vedic-astrology` or the Kundli tool at all.

### Career Analysis (Vedic) dropdown item
Find the actual dropdown/nav component, identify exactly which URL "Career
Analysis (Vedic)" links to, and confirm whether that destination is the same
feature as any existing "Career Report" page, or something distinct. Report
the dropdown's exact label text and the destination page's actual H1/heading,
so any mismatch between the two is visible.

---

## PART 3: General codebase/feature inventory (for future reference)

Produce a plain-language inventory of:
- Every real, live route/page on the site, grouped by the four categories
  (Vedic Astrology, Birthday & Celebrity, Mystic Corner, Science & Longevity)
  plus anything that doesn't fit those groups.
- For each, one line on what it actually does and what real data/computation
  backs it (not a guess — check the actual component).
- Any page that appears to be a stub, placeholder, or significantly thinner
  than its peers in the same category.

This is meant to be a durable reference document, not a one-time list — write
it clearly enough that a future session can use it without re-auditing from
scratch.

---

## OUTPUT

Write the full findings to `docs/content-feature-audit.md`, organized exactly
by the Parts above, and include the complete report in your final message as
well. Every claim must be backed by an actual quoted excerpt or a specific
file/line reference — no summarizing without evidence, per the standing
no-fabrication discipline on this project.

---

## WHAT NOT TO DO
- Do not change any code, content, or configuration — this is read-only.
- Do not create a branch — there's nothing to commit.
- Do not characterize the writing quality in vague terms ("the copy could be
  clearer") without a verbatim quote backing it up.
- Do not guess at the Career Analysis dropdown's destination — trace it in
  the actual code.
