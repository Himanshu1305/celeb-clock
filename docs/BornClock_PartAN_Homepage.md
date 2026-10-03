# BornClock — Part AN: Build the Finalized Homepage
## Continues on branch `part-aj-four-page-redesign`. Fully autonomous, no stopping to ask. Ends at a verified isolated preview. Production is never touched.

---

## RULES THAT GOVERN THIS SESSION (read first)

Read `docs/BornClock_PartAL_FullSiteRedesign_v2.md` and
`docs/BornClock_PartAM_ContentExpansion_SEOMagnets.md`. These rules from
them apply here unchanged:

- **The Hard Rule:** never run a plain `wrangler deploy` or promote any
  version to live traffic. Staging means an isolated
  `wrangler versions upload` preview. Try building that preview with
  `--mode preview` (Part AM found that the default build loads
  `.env.local`, which carries live keys). This flag has not yet been
  tested with the full build + prerender pipeline: if it breaks or is
  ignored by the build, document what happened and use the standard
  build instead. The homepage has no payment logic, so this is hygiene,
  not a blocker — never let it stall the session.
- **No stopping, no approval gates:** resolve ambiguity yourself, log the
  decision in `docs/part-an-decisions.md`, keep going.
- **The Fifth Rule:** every claim of correctness is verified against the
  real served output on the live preview URL, fetched fresh — never
  inferred from source code or a passing build.
- **Structured data** goes through the body-rendered `JsonLd.tsx`
  component, never Helmet (the Helmet/prerender race found in Part AM).

**Do not merge to `develop` or `main`. Do not deploy to production.**
The homepage goes live only when the person explicitly says so in a
later message.

---

## STEP 0 — BASE CHECK

Confirm you are on `part-aj-four-page-redesign` with the Part AM commits
present (including the in-body JSON-LD fix and the generic-`<title>`
fix). Read the design reference in full:
`docs/design-reference/homepage-final.dc.html`. It is the approved
design. Treat its structure, copy, colors, layout and animations as the
spec; replace its vanilla JS and sample data with the site's real React
components, real data and real functions.

---

## STEP 1 — AUDIT THE CURRENT HOMEPAGE (before changing anything)

Read the current homepage component (`src/pages/Index.tsx` and its
children) and list:
- every section and feature it renders;
- every internal link it contains (articles, celebrity profiles,
  calculators, category pages, "Explore" grids, zodiac chips, etc.);
- its current `<title>`, meta description, `<h1>`, and structured data;
- what its current date-of-birth entry does and where it navigates.

Write `docs/part-an-homepage-audit.md` with a mapping table:
**old element → where it lives in the new design.** Rule: anything
reachable from the homepage today must remain reachable from the new
homepage — through the hero category doors, the directory, a compact
additional row, or the footer. If old content (for example a row of
article links or featured celebrity profiles) has no slot in the
reference design, add a compact, dense row for it below the directory in
the same visual system rather than dropping it. Never silently remove an
internal link.

---

## STEP 2 — BUILD THE HOMEPAGE TO THE REFERENCE

Section by section, top to bottom:

**Header and footer.** Use the same redesigned site header/footer the
other redesigned pages already use. Do not restyle the shared global
Navigation component (still deferred, for the reasons documented in
Parts AL/AM).

**Hero (ivory).**
- Eyebrow: "Rigorously calculated birth intelligence"
- H1, exactly: **"Everything your birth date reveals."**
- Subline, exactly: "Your Vedic birth chart, the celebrities who share
  your birthday, your numerology and zodiac, and what longevity science
  says — all from one date."
- A labelled date-of-birth input and a "Decode my date" button. Entry
  stays client-side on the homepage — do not put the date in the
  homepage URL (Part AD redirects `/?day=` and `/?birthDate=` variants;
  do not reintroduce them).
- Four category doors directly under the input, each in its category
  accent with real example tools, linking to the matching category
  column further down the page.
- Live clock panel: years, days, hours, minutes, seconds (seconds
  ticking), total seconds, estimated heartbeats, days to next birthday,
  and the "Year N of your life — X% complete" progress bar, plus the
  disclosure line ("Heartbeats estimated at an average 72 bpm. Clock
  assumes a 00:00 birth time.").
- When today is the visitor's birthday, replace "next birthday in 365
  days" with a short, warm birthday message.

**Default date behaviour — important.** Never present a sample person's
numbers as if they were the visitor's. If the visitor is logged in with a
saved birth profile, use that date. Otherwise show the sample values
clearly labelled as an example (e.g. "Example: 14 March 1998 — enter
yours") until they enter their own date. This applies to the live clock
too: while the example date is showing, the clock heading must read as
an example (e.g. "Example: alive for…"), not "You've been alive for" —
switch to the "you" wording only once the visitor has entered their own
date or a saved profile is in use.

**Accessibility of the live clock.** Do not mark the ticking clock (or
any per-second updating element) as an ARIA live region — screen readers
would announce it every second. If an announcement is useful, make it a
single polite announcement when the visitor's decoded results first
appear, not on every tick.

**Keep today's primary flow.** The current homepage's date entry leads
to an existing full results experience (confirm the real destination in
the Step 1 audit). That flow must stay reachable from the new homepage —
after a date is decoded, show a clear "See your full birthday profile →"
link that carries the entered date to that existing destination. Inline
decoding is an addition, not a replacement for it.

**"Your date, decoded" strip.** Western sign, Life Path, birthstone, age
on Mars, weight on Mars (stated per 70 kg on Earth, labelled as such),
and the Vedic chart as a free next step. The Vedic link carries the
entered date into `/kundali` using the existing carry-forward parameters
(time and place are then asked on that page). If the visitor's saved
profile already includes birth time and place, carry all of them so the
chart generates immediately with no re-entry, exactly as the existing
carry-forward pattern does elsewhere. Where other links lead to a
tool that accepts a date (e.g. `/birthday-report?dob=`), carry the date
forward the same way.

**Computation — use the site's own functions, not the mockup's.** Use the
site's existing zodiac, Life Path and birthstone functions so the
homepage always agrees with `/numerology` and the other tool pages. If
no birthstone function exists, use the same month-to-stone data the
site's birthstone feature already displays (so the homepage can never
disagree with it); only if no such data exists anywhere, add a small
shared lookup and document it.
Check them against these verified expected values:
- 1869-10-02 → Libra, Life Path 9
- 1973-04-24 → Taurus, Life Path 3
- 1998-01-01 → Capricorn, Life Path 11
- 1998-03-14 → Pisces, Life Path 8
- boundary dates: Jan 19 Capricorn / Jan 20 Aquarius; Dec 21
  Sagittarius / Dec 22 Capricorn; Mar 20 Pisces / Mar 21 Aries
If a site function disagrees with any of these, investigate which is
right and report it — do not silently pick one. Mars age uses a Mars year
of 1.8808 Earth years; Mars weight uses 0.38× Earth gravity.

**Trust strip.** The three lines from the reference (cross-checked;
36-point Ashtakoota per the Brihat Parashara Hora Shastra; WHO, Harvard,
NIH, UN WPP 2024 and NASA Planetary Fact Sheet 2023). Confirm each source
named is genuinely used somewhere on the site before shipping it.

**Born today band.** Real celebrities born on the visitor's local date,
from the existing Today's Birthdays data, with real photos from the
existing celebrity image source (initials only as a last-resort fallback
for an entry with no photo), the real count for the day, and a link to
`/todays-birthdays`. This must render client-side for the visitor's
actual date — the homepage is prerendered at build time, so a prerendered
list would show the build day's celebrities to everyone. Prerender a
fixed-size placeholder and fill it after load.

**Directory (four columns).** Column headings exactly as in the
reference: "Traditional systems, computed." / "Specific beats generic." /
"Many symbols. Different rules." / "Numbers with a source trail." —
with the live teasers tied to the entered date. List every real tool with
its short tag. Verify every tag is true for the real tool (e.g. "Dasha
Timing · to Pratyantar", "Muhurat Finder · by city", "Planetary Weight ·
NASA 2023", "Country Comparison · 57 countries"); correct or drop any tag
that isn't. Every link must go to a real, existing route — find the real
route for each tool; if a tool has no dedicated route, link to where it
actually lives. Never invent a route.

**Footer sitemap.** All four categories and their real sub-pages, plus
How it works, Answers, Privacy, Contact — all real routes.

**Animations (all purposeful, all switched off under
`prefers-reduced-motion: reduce`).** Decoded values count up / slide in
when a date is entered; the life-progress bar fills; the North-Indian
Kundli frame draws itself in with House 1 at the top; the Mars ring fills
to the visitor's real progress through their current Mars year; the
Born-today entries arrive staggered. Nothing loops continuously except
the clock itself.

**Colors and contrast.** Use the finalized tokens. Text uses the
accessible shades: bronze `#806125` (not gold), `#B5432A` (not coral
`#F0715A`), `#237A60` (not green `#2E9E7B`); the bright versions are for
borders, fills and decoration only.

**Mobile.** Hero columns stack; the four doors become a 2×2 grid; the
decoded strip wraps; directory columns go 2-up then 1-up; footer columns
wrap. Real decisions at 390px width, not just "nothing overflows."

---

## STEP 3 — SEO / AEO / GEO

- Title and meta description that lead with the new positioning but keep
  the key terms the current homepage ranks for (e.g. the current title's
  "Birthday, Zodiac & Longevity Calculator" terms) — fold them in rather
  than dropping them.
- Open Graph and Twitter tags with a real image.
- JSON-LD through `JsonLd.tsx`: Organization, WebSite, WebPage. No
  FAQPage unless a genuine Q&A section is on the page. No fabricated
  ratings or counts.
- Exactly one `<h1>`; logical `<h2>`/`<h3>` order; real alt text on every
  image.
- Static content is prerendered; live and date-dependent parts (clock,
  decoded values, Born today) fill in client-side inside fixed-size
  containers so nothing shifts.

---

## STEP 4 — TESTING (exhaustive; fix and retest anything that fails)

- **Unit tests** for any new homepage logic, including the verified
  expected values above and edge cases: leap-day birth (Feb 29), birthday
  today, birthday tomorrow, new-year boundary, a future date, an empty
  input, an invalid date.
- **Routes:** every link on the homepage resolves to a real page (crawl
  the live preview; 0 dead links).
- **Served output (Fifth Rule):** fetch the live preview homepage and
  confirm the real `<title>`, meta description, single `<h1>`, and JSON-LD
  are in the served HTML; run the JSON-LD through validator.schema.org
  (0 errors).
- **Real browser on the preview:** entering a date updates every decoded
  value and teaser; the clock ticks; the progress bar and Mars ring fill;
  Born today shows real names and real photos for the actual current date;
  the Vedic link carries the date into `/kundali`; zero console errors.
- **Mobile at 390px** and **reduced-motion emulation** (all animation
  off, values shown immediately).
- **Example-date labelling:** with no saved profile and no date entered,
  every value and the clock heading read as an example; after entering a
  date, they switch to the visitor's own.
- **Primary flow:** "See your full birthday profile →" carries the entered
  date to the existing results destination and that page renders it.
- **Screen reader sanity:** the clock is not a live region (inspect the
  served DOM).
- **Performance:** Lighthouse (or the equivalent real measurement used in
  earlier sessions) on mobile for the current production homepage vs the
  new preview homepage — report LCP, CLS and TBT for both. Fix any
  regression (lazy-load below-the-fold photos, reserve image sizes,
  avoid layout shift).
- **Regression:** the other redesigned pages are unaffected; full
  automated test suite passes.

**Self-verification pass before the report:** re-run the test suite
fresh, re-fetch the live preview homepage, re-run the validator and the
link crawl, and use real git timestamps for elapsed time. Fix anything
that doesn't hold up before reporting it.

---

## STEP 5 — PREVIEW AND REPORT

Build with `--mode preview`, upload with `wrangler versions upload`
(never promote). Commit the homepage work on the branch with clear,
separate commits (audit doc; homepage build; any SEO/test fixes).

Write `docs/part-an-report.md` and include it in full in your final
message: the audit mapping (what moved where; anything added to keep
links reachable), any function disagreements found and how they were
resolved, real test evidence for every item in Step 4, the before/after
performance numbers, real elapsed time from git timestamps, and the
preview URL. State plainly that nothing was merged or deployed.

---

## WHAT NOT TO DO
- Do not deploy to production or promote a version.
- Do not merge to `develop` or `main`.
- Do not drop any link or feature reachable from the current homepage.
- Do not present sample-date numbers as the visitor's own.
- Do not prerender time-dependent content (clock, Born today, decoded
  values).
- Do not use the mockup's copies of the zodiac / Life Path logic — use the
  site's own functions.
- Do not invent a route, a source, a tag, or a number.
- Do not restyle the shared global Navigation component.
- Do not mark the ticking clock as an ARIA live region.
- Do not let an untested build flag stall the session — fall back and
  document.
