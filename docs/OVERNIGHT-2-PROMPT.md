# Overnight Batch 2 — Growth Surfaces + Polish + Tests
# Save as docs/OVERNIGHT-2-PROMPT.md, then: "Read docs/OVERNIGHT-2-PROMPT.md and execute"
# RUN ONLY AFTER docs/PDF-INVOICE-PROMPT.md HAS FULLY COMPLETED (one session per repo).

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/OVERNIGHT-2-REPORT.md.

CONTEXT: BornClock is LIVE with real paying customers. Nothing here may touch the
payment path. HARD RULES: api/_crypto.ts, api/razorpay-webhook.ts,
api/verify-payment.ts never touched. ./node_modules/.bin/wrangler only.
DDL → NOTES-*.sql only. Read before write. tsc 45 baseline, 0 new.

Phases are ordered BY VALUE. If time/stability forces triage, later phases are the
ones to leave unfinished — never ship a half-done phase; finish or skip cleanly.
Each phase must pass tsc + build before the next. ONE deploy at the very end.

---

## PHASE A — 12 "BORN IN [MONTH]" HUB PAGES

/born-in-january … /born-in-december — the hub layer between the homepage and the
366 existing /born-on date pages.

1. Read how the born-on date pages + /born-on/india hub are built (component,
   data source, prerender registration, sitemap script). Follow that pattern.
2. Per month, from data already in the codebase/DB: birthstone + lore snippet,
   birth flower, zodiac spans (linked to zodiac hubs), top celebrities born that
   month (existing fame ranking + card component), linked grid of the month's
   date pages, currency-aware Birthday Report CTA from pricing.ts.
3. SEO/AEO: unique title/description, canonical, BreadcrumbList JSON-LD matching
   the date pages, an opening paragraph that directly answers "what does being
   born in {month} mean" in 2-3 sentences (answer-engine snippet), FAQPage
   JSON-LD with 3-4 real questions per month.
4. Nav: Explore dropdown entry + footer Explore block. Sitemap updated.

## PHASE B — FITNESS & RHYTHM SEO PAGES (Phase 1 of the fitness strategy)

Six new prerendered pages. FIRST read the existing /biorhythm CTA page and the
report's Biorhythm section (09 · CYCLES) — the new pages must complement, not
duplicate, and must reuse the existing biorhythm calculation code, not reimplement.

Pages (adjust slugs to the site's conventions):
1. /biorhythm-workout-calculator — the anchor page. DOB input → today's three
   cycles + a 7-day mini forecast + plain-English training suggestion per day.
2. /best-day-to-start-a-habit — habit-timing angle; widget shows the user's next
   physical+emotional upswing date.
3. /cycle-syncing-for-men — the underserved gender-neutral rhythm angle: what
   cycle syncing is, why the timing instinct applies to everyone, biorhythm as
   the birth-date version. Widget included.
4. /why-am-i-tired-some-days — question-led; explains rhythm variation honestly,
   widget shows the reader their current phase.
5. /best-time-to-work-out — covers the real science (chronotype, consistency)
   AND the rhythm-awareness layer; widget.
6. /energy-forecast — "when will I have energy this week": 7-day forecast widget.

MANDATORY HONESTY FRAMING on every page (this is non-negotiable brand policy):
- Each page carries the same science note as the report's Biorhythm section:
  the three-cycle model dates from the early 20th century and controlled research
  has not found it predictive; frame everything as a rhythm-awareness practice /
  daily check-in prompt, never a prescription.
- ZERO claims of: performance improvement, injury prevention, medical or
  hormonal effects, weight-loss outcomes. Words like "may", "many people find",
  "use as a prompt to check in with your body" are the register.
- Where real science exists (consistency beats timing; chronotype; sleep),
  state it plainly and let the rhythm layer sit alongside it honestly.
- Every page ends with the standard disclaimer line used in the report footer.

SEO/AEO/GEO per page: question-form H2s that mirror actual queries, a direct
2-3 sentence answer under the H1 (snippet target), FAQPage JSON-LD (4-6 Qs),
HowTo or SoftwareApplication schema for the widget where it genuinely fits (no
schema spam), canonical, unique meta, internal links to /birthday-report,
/biorhythm, the born-on page for the entered DOB, and each other. Added to
sitemap + Explore.

## PHASE C — INDEPENDENCE DAYS ON THE 366 DATE PAGES

Enrich every /born-on date page with national days that fall on that date.
1. Create src/data/nationalDays.ts: a curated static dataset of independence /
   national days for ~150-200 countries (date, country, official day name,
   one-line note). Generate from well-established knowledge; flag any date you
   are less than certain about with a comment and EXCLUDE it rather than guess —
   accuracy over coverage.
2. On each date page: a compact "National days on {date}" block (flag emoji,
   country, day name) rendered only when the date has entries. India's Aug 15,
   Republic Day Jan 26 etc. must be present and correct.
3. Add one line to the page's answer-paragraph/meta where a major national day
   exists ("...also India's Independence Day").
4. Prerender count is unchanged by this phase (enrichment, not new pages) —
   verify the 366 pages still all build.

## PHASE D — EMAIL POLISH BATCH

1. Logo + tagline "Know your time. Live it well." in a consistent header across
   every transactional template we control (enumerate them in the report). Logo
   inlined or at https://bornclock.com/bornclock-logo.png — verify the URL
   resolves on the live domain first; if not, inline base64 like the invoice.
2. Merge "Payment confirmed" + invoice emails into ONE — CHECK
   docs/PDF-INVOICE-REPORT.md first; if its Phase 3 already merged them, skip.
3. Admin System tab: replace stale "Vercel — Live" + Vercel quick-links with
   Cloudflare Workers equivalents.
4. /pricing + /upgrade free tier: currency-aware $0 / ₹0.

## PHASE E — WEEKLY DIGEST: TEMPLATE ONLY, NO LIVE SEND

Build the "Your Week Ahead" digest content: greeting, the subscriber's 7-day
rhythm outline (same engine as Phase B widgets), one gentle fitness/habit prompt
in the honesty register, one discovery link (this week's notable birthdays).
- Wire it into the existing weekly-digest path BUT gate real sending behind an
  explicit flag/env (DIGEST_LIVE=false default): the Sunday cron must NO-OP with
  a log line until the founder flips it after reviewing a test render.
- Send ONE test render to ADMIN_EMAIL only, as part of this phase, so the
  founder wakes up to a reviewable sample. Report how to flip it live.

## PHASE F — ADMIN REVENUE SPLIT BY CURRENCY (deferred C2e)

From the INVOICES table (authoritative), not analytics events:
- Revenue + purchase count split INR vs USD; EXPORT-invoice count (the GSTR-1
  Table 6A number); this month vs last month. Existing card style, no charts.
- If admin cannot read all invoices under RLS (policy is owner-read), write
  NOTES-admin-invoice-read.sql with a has_role(auth.uid(),'admin') SELECT policy
  for Studio, and degrade gracefully until applied.
- The card should show the real current numbers (1 purchase, ₹199, INR) —
  state what it renders in the report.

## PHASE G — TESTS FOR EVERYTHING NEW (fix-loop policy applies)

Extend e2e/prelaunch with a new suite growth-pages.spec.ts. Same fix policy as
docs/TEST-SUITE-PROMPT.md: classify failures (product bug / test bug / frozen /
env), FIX product bugs and re-run, never weaken an assertion, max 3 iterations
per failure then report.

Positive: all 12 month pages + 6 fitness pages return 200 with unique <title>,
canonical ≠ home, FAQPage JSON-LD present, exactly one currency in any price
string; widgets render a result for a valid DOB; a date page with national days
(Aug 15) shows the block, one without shows no empty shell.
Negative: widget rejects future DOB and impossible dates (Feb 30) with a clean
message, no crash; nationalDays lookup for a dateless day returns nothing.
Edge: Feb 29 works in widgets and on its date page; DOB = today; DOB > 100
years ago; month pages for Feb link 29 date pages.
Also update the existing nav suite expectations for the new Explore entries
(legitimate spec update — document it as such).

---

## GATE
1. tsc 45 baseline, 0 new
2. npm run build → expected 1331+ ok (1313 + 12 months + 6 fitness), 0 failed
3. npm run test:prelaunch + the new suite: all green under the fix-loop policy
4. Frozen files untouched (empty diff)
5. invoice_counters untouched (query and paste — no test may create invoices)
6. Live smoke sentinel after deploy: {"error":"Report not found"}
7. ONE deploy at the end

## REPORT — docs/OVERNIGHT-2-REPORT.md
- FINDINGS FIRST: any product bugs the new tests caught and their fixes
- Phase-by-phase: URLs shipped, sitemap delta, nav placement, templates touched,
  the digest test-render confirmation, the revenue card's live numbers, any
  NOTES SQL for Studio
- Phases skipped (if triage was needed) stated plainly with reason
- Founder morning checklist: review digest sample → flip DIGEST_LIVE when happy;
  apply any NOTES SQL; spot-check 2 month pages + 2 fitness pages + Aug 15 page

Commit: "feat: month hubs, fitness rhythm pages, national days, email polish, digest template, revenue split + tests"
