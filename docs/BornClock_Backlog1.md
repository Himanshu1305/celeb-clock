# BornClock — Backlog Batch 1
## New branch `backlog-1` (from `develop` at RC2, `054fcee`). Unattended run, may be restarted automatically. No stopping, no questions.

**This work must not affect Release Candidate 2 or the launch.** Staging
keeps serving RC2 for the person's review and payment test. Do not merge
into `develop` or `main`, and do not deploy to the staging worker itself.

---

## RULES

1. **Production is never touched:** no production deploy or promotion,
   no route or domain changes, never push or merge `main`, never add a
   Cloudflare token to GitHub.
2. **Do not touch RC2:** never merge into `develop`; never
   `wrangler deploy` (staging stays on RC2). Previews only, via
   `wrangler versions upload --env staging` (creates a preview URL on the
   staging worker without promoting it). Dry-run/inspect first and confirm
   the worker is `bornclock-staging`. Never run `wrangler` from an older
   checkout. Any `wrangler secret` command includes `--env staging`.
3. **Unattended headless mode:** no background notifications — never end
   your turn to wait for a build or test. Run long commands in the
   foreground (time limit raised to 60 minutes) or keep polling until they
   finish.
4. **Verify on the live preview URL (Fifth Rule);** never report a test as
   done that wasn't run. Test, fix, retest; log bugs in
   `docs/backlog1-bugs.md`.
5. **Preserve existing features:** calculations, prices, paywall gating,
   payment and entitlement logic unchanged. Content changes only where an
   item below requires them.
6. **Honesty standard:** no fabricated numbers, sources or predictions;
   impact-first plain-language writing; every technical term through the
   shared glossary/tooltip mechanism; trust claims only where true for that
   page. If something can't be built on genuinely real computed data, omit
   it and document why — never ship a templated or guessed version.
7. **New pages are built right the first time:** central design system
   (correct theme and layout), layout acceptance rules, H1 and lead in
   prerendered HTML, unique title and meta, Open Graph, JSON-LD via
   `JsonLd.tsx` (FAQPage only for real Q&A), single `<h1>`, alt text, added
   to the sitemap and prerender list, interlinked from relevant existing
   pages (no orphans).
8. **Commit per item; push `backlog-1`** after each item.
9. Never edit `public/robots.txt`; no `noindex` on normal pages.
10. **Speed must not regress:** the perf-budget check (`scripts/perf-budget`)
    passes after each item.
11. **Database writes are test-only.** The database is shared with
    production: write only to a designated test account's own records; no
    real user data, no bulk updates, no schema changes (any DDL goes to a
    NOTES file for the person).
12. **New routes must be registered with the worker's "not found"
    logic.** RC2 made the worker return 404 for invalid addresses using
    enumerated valid patterns. Every new route — especially ones with
    parameters (e.g. `/angel-numbers/:number`) — must be added to that
    logic so valid addresses return 200 and invalid ones 404. Test both.
13. **Date-dependent values are computed in the visitor's browser, not at
    build time** (e.g. the personal year number, "next 1 month / 6 months
    / 1 year" windows). Pages are prerendered, so baked-in values would
    show the build day's results to everyone. Prerender the static
    explanation and fill date-based values after load in fixed-size space.

---

## STEP 0 — START OF EVERY ATTEMPT

1. If `backlog-1` doesn't exist, create it from `develop`. If it exists,
   switch to it.
2. **Leftovers:** if the working tree isn't clean, finish and test changes
   belonging to an unfinished item, otherwise `git stash` them with a
   clear message and log it.
3. **Resume, don't redo:** check commits, the bug log and any partial
   `docs/backlog1-report.md`; continue from the first unfinished item.
4. Record the full test-suite count as the baseline.

---

## ITEMS (in this order — finish each completely before the next)

### Item A — Biological-age wording (task 15)
The biological-age page references epigenetic-clock science (e.g. the
Horvath clock, which uses DNA-methylation lab measurements), while the
tool itself is a lifestyle questionnaire. Rewrite only the wording so it
is unmistakably an **estimate based on lifestyle factors, not a lab
measurement** — mention epigenetic clocks only as background on how
biological age is studied. Keep the search terms the page already ranks
for (title, H1, meta) wherever they remain accurate — make the wording
honest without discarding its search value. Keep the calculation, quiz,
paywall and pricing exactly as they are. Check every page that describes
this tool.

### Item B — "How we calculate" methodology page (task 14)
First confirm no such page exists. Then build one (neutral theme, Article
layout), linked from every trust strip and the footer, covering — only
what is genuinely true in the codebase: the astronomical engine and
settings (e.g. Swiss Ephemeris, Lahiri ayanamsa), how calculations were
cross-checked, what the Vedic tools can and cannot predict (including the
honest position on marriage timing: favourable windows, never a specific
date), numerology and zodiac methods, the longevity data sources (WHO,
Harvard, NIH, UN WPP 2024, NASA Planetary Fact Sheet 2023 — only those
actually used), and where celebrity data comes from. Verify every claim
against the code before writing it.

### Item C — Remove dead code (task 20)
Remove the orphaned `CelebrityBirthday.tsx` (imported but never routed)
and move `FamilyDashboard`'s error-fallback off the old cosmic style onto
the central system. Then look for other unused page components or
old-design leftovers — but remove something **only when it is proven
unused**: no static or dynamic import (including `React.lazy`, string
paths and route tables), no use in scripts, prerender, sitemap
generation or tests, and the build and full suite pass without it. List
every removal with its evidence; when in doubt, keep it and list it.

### Item D — Branch cleanup (task 21)
List all local and remote branches. Delete **only** branches whose
commits are fully contained in `develop` (`git branch --merged develop`),
never `main`, `develop`, `redesign-central` or `backlog-1`. Before
deleting each, create an archive tag `archive/<branch-name>` and **push
the tags to GitHub before deleting any remote branch**, so nothing is
lost. (Deleting branches triggers no deploy — the workflow deploys only on
pushes to `main` — but re-check the workflow triggers first.) Do not
delete any unmerged branch — list those in the report with what they
contain.

### Item E — Four new SEO pages (task 11, part 1)
**First check for existing coverage:** search the site's pages, articles
and answers for each topic (e.g. an existing Manglik or Kaal Sarp article,
or the Kundli page's dosha section). If a page already targets the same
topic, don't create a competing page — strengthen the existing one, or
make the new page clearly distinct and cross-link both, and document the
decision. Then build `/manglik`, `/angel-numbers`,
`/personal-year-number`, `/kaal-sarp-dosha` using
`docs/part-am-content-gap-research.md`, with real
computation where the topic allows it (e.g. Manglik and Kaal Sarp from the
existing Vedic engine for entered birth details; personal year number from
date of birth; angel numbers as honest explanatory content). Correct theme
per category (Vedic for Manglik and Kaal Sarp; Mystic for angel numbers
and personal year). Calm, non-fear-based tone for doshas, with free
remedies consistent with existing pages. Full Rule 7 compliance.

### Item F — Deeper Dasha levels (task 13)
Extend Dasha timing from three levels (Maha, Antar, Pratyantar) to five
(adding Sookshma and Prana) using the existing validated engine.
- Validate: each level's sub-periods sum exactly to the parent period and
  follow Vimshottari proportions; cross-check sample values for the
  project's reference charts against an independent reference if one is
  reachable — otherwise state that only mathematical consistency was
  verified.
- Explain clearly that these deeper levels last days to hours, so they are
  very sensitive to birth-time accuracy; show them with that caveat and
  only when a birth time is given.
- Present them collapsed by default so the Kundli page doesn't become
  cluttered, and keep the Kundli page within the speed budget.
- **Compute on demand:** five levels across a full lifetime is tens of
  thousands of periods. Calculate deeper levels only for the periods the
  person opens (e.g. the current Antardasha), not the whole tree up front.
- Add glossary entries for the new terms (Sookshma, Prana).

### Item G — "What's Ahead" and time-horizon views (task 12)
Using only real data the engine already computes (Dasha periods at every
level, house lords, detected Yogas, transits where already computed):
- **What's Ahead by life area:** career, relationships/marriage, home and
  property, health and energy, travel — the same data re-presented by
  life area instead of by mechanism.
- **Time horizons:** next 1 month, 6 months, 1 year, and a lifetime
  overview — real periods and themes at each horizon.
- **Marriage-timing guardrail (non-negotiable):** "traditionally
  favourable window" framing only — never a specific date, never certainty
  — exactly matching the existing AI-astrologer and report guardrails,
  including tense awareness and never volunteering second-marriage
  combinations to someone already married. If this can't be verified to
  hold, omit the relationship area and document why.
- Consistency: every window shown must match the same underlying Dasha
  data displayed elsewhere on the chart.
- Reuse the existing birth-details carry-forward and saved-profile
  pattern (fresh input beats saved data), so nobody re-enters details.
- Decide placement (Kundli report section and/or its own page) using the
  central layouts. Do not change what is already paid. **For this new
  feature, build it free by default but make free/paid a single,
  clearly-named setting**, and list "free or paid?" under "Needs the
  person" — that's a business decision for them.

### Item H — More content-gap pages (task 11, part 2)
With items A–G complete, build further pages from the content-gap
research in priority order, to the same standard. Build as many as can be
fully finished and verified; list the remainder in the report.

---

## TESTING FOR EVERY ITEM

On the live preview: positive, negative and edge cases for any input
(empty, impossible dates, future dates, unknown city, leap-day birth,
unknown or midnight birth time, 1900, Hindi pages where relevant);
Chromium, WebKit (iPhone) and Android; axe (zero serious/critical);
JSON-LD validation; served output (title, single `<h1>`, prerendered H1
and lead); zero console errors; perf-budget passing. Regression after each
item: full test suite (never below baseline) and a Chromium check of the
13 cross-group routes from the FINAL report. At the end: re-test pages
touched by earlier items, run a status crawl of the full updated sitemap
(all 200), and run the RC2 404 check script extended with the new routes
(valid → 200, invalid → 404).

---

## REPORT

Write `docs/backlog1-report.md` and include it in full in your last
message. **First line: "BACKLOG-1 COMPLETE: YES" or "BACKLOG-1 COMPLETE:
NO — reasons".** YES means items A–G are done and verified (item H is
best-effort: list what was built and what remains). Items deliberately
omitted under Rule 6, with documented reasons, do not make it NO; broken,
unverified or unfinished work does. Then: each item with evidence, test
results per browser, the Dasha validation method and results, the
marriage-guardrail verification, branches deleted (with archive tags) and
branches kept, the preview URL, the bug-log summary, and "Needs the
person". Confirm RC2 on staging and `develop` were not changed. Finally,
explain how `backlog-1` should join the live site after launch: merge into
`develop` for the next release, noting any expected conflicts if
`develop` receives launch-day fixes in the meantime.
