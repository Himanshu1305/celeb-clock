# SEO Magnet Batch 3 — Share Buttons, Personality Layer, Compatibility Pages, Rising Sign, Report OG Cards
# Save as docs/SEO-MAGNET-3-PROMPT.md → "Read docs/SEO-MAGNET-3-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/SEO-MAGNET-3-REPORT.md.

CONTEXT: LIVE site, paying customers. Frozen: api/_crypto.ts, api/razorpay-webhook.ts,
api/verify-payment.ts. DDL → NOTES-*.sql. tsc 45 baseline 0 new. Finish or skip
phases cleanly. ONE deploy at the end. This batch is PURE GROWTH SURFACE — nothing
touches payments, credits, or entitlements.

## PHASE 1 — SHARE BUTTONS ON ALL CONTENT PAGES
Founder-verified gap: born-on, month-hub, zodiac, fitness, and blog pages have NO
share options. A NativeShareButton component already exists (read it — built in
product-polish for reports). Build one reusable SharePageBar: WhatsApp, X,
Facebook, Copy link, and native share on mobile — compact, style-matched, placed
consistently (below the answer paragraph or at content end — pick one and apply
everywhere). Share text per page type ("People born on January 1 are… — see who
shares this birthday"). The OG cards from batch 2 make every share branded.
Add to: BornOnDay, MonthHub, ZodiacSign, FitnessRhythmPage, BlogPost. Test: bar
renders on one page per type; links contain correct encoded URL.

## PHASE 2 — PERSONALITY LAYER ON THE 366 DATE PAGES (F1 remainder)
The single biggest keyword gap: "[date] birthday personality". Enrich the EXISTING
/born-on pages — do NOT create new /birthday routes (would cannibalise).
Founder-supplied trait engine exists in the old plan: zodiac × ruling-number trait
matrix, strengths by element, challenges, lucky day/colour, compatible signs,
headline generator. Implement as src/data/birthdayPersonality.ts using that
matrix content (adapt to codebase conventions; the matrix text itself is approved
copy). On each date page add a "Born on {date}: Personality" section: answer-first
sentence (feeds the snippet), core traits chips, strengths, growth areas, lucky
day/colour, compatible signs (linked to zodiac hubs + compatibility pages from
Phase 3). Extend the page's FAQPage schema with the personality Q&A. Titles/meta:
work "personality" into the date-page title if length allows without truncation.
Prerender count unchanged; verify a sample of 6 dates renders (incl. Feb 29).

## PHASE 3 — 144 COMPATIBILITY PAIR PAGES (F3 remainder)
/compatibility exists (read it). Add /compatibility/{sign1}-{sign2} for all 144
ordered pairs (or 78 unordered with canonical redirects from the reverse order —
choose the cleaner-for-SEO option and justify in the report). Each page: overall
score + love/friendship/work breakdown (derive from a single data module with
per-pair copy — element/modality logic + a curated overrides table for the
famous pairs like Aries-Leo; no thin duplicate text: minimum 300 words of
pair-specific content via composition), FAQPage schema ("Are Aries and Leo
compatible?"), links: both zodiac hubs, the calculator, /birthday-report CTA,
mesh links. Sitemap + prerender + Explore ("Compatibility" entry if absent).

## PHASE 4 — RISING SIGN CALCULATOR (F2 remainder)
New page /rising-sign-calculator: inputs birth date + birth TIME (+ optional
city/timezone offset). Use a simplified ascendant table (sun-sign + birth-hour
grid — the standard 2-hour-block approximation). MANDATORY honesty framing, same
register as moon-sign: "approximate — exact ascendant needs precise birth time
and location; this uses the standard simplified table." All 12 rising-sign
descriptions, sun-vs-moon-vs-rising explainer, FAQPage + WebApplication schema,
mesh links, share bar. Birth time is used in-browser only — do NOT store it
anywhere; state that on the page (privacy point + honesty).

## PHASE 5 — PERSONALISED REPORT OG CARDS
The gifting loop's share card: when a report is shared, the preview should read
"{Name}'s Birthday Blueprint" on the branded card, not the generic default.
Reports are dynamic (not prerendered), so generate at request time: a Worker
route /og/report/{slug}.png|webp that renders the card (name + date + brand) —
use the same sharp/canvas approach IF it runs on Workers; if sharp cannot run in
the Worker runtime (likely), use SVG-composited-to-image via a pure-JS path, or
Cloudflare Browser Rendering (token + account id secrets already exist) with
aggressive caching (Cache-Control immutable, cache API). Fallback: the static
default card on any failure — never a broken image. Wire og:image on the report
route's HTML response. Privacy check: the card shows first name + date only —
nothing else from the report. Test: fetch the OG route for an existing slug →
valid image; bogus slug → default card, 200.

## GATE
tsc 45/0 · build 1337 + 144 + 1 = 1482 ok, 0 failed (retry /todays-birthdays
once if it flakes) · test:prelaunch green + new assertions (share bar per type,
personality section renders, one compat page schema, rising-sign validation
negative cases, report-OG route) · frozen files untouched · invoice_counters
untouched (paste) · ONE deploy · sentinel OK · IndexNow ping for new URL sets.

## REPORT
Phase-by-phase evidence · the ordered-vs-unordered compatibility decision ·
report-OG implementation path chosen · founder spot-check list (one date page
personality section, aries-leo compat page, rising sign with a fake time,
share a report link to WhatsApp).

## AMENDMENTS (binding — apply throughout)

A1 — FIX-LOOP POLICY: the full policy from docs/TEST-SUITE-PROMPT.md applies to
every phase: classify each failure (product bug / test bug / frozen-file /
environment), FIX product bugs and re-run the affected suite then the full set,
max 3 iterations per failure then report as FINDING. NEVER weaken an assertion,
broaden a selector, add sleeps, or delete a test to go green; any test change
must be justified as a documented spec update.

A2 — PHASE 2 NAMING (correctness trap): the day-derived number MUST be labelled
"Birth Day Number" everywhere — NEVER "Life Path". The paid report's Life Path
uses the full date; a conflicting label on free pages contradicts paying
customers. Add one clarifying line on the page ("your full Life Path, from the
complete date, is in the Birthday Blueprint") — which is also a natural CTA.

A3 — PHASE 2 THIN-CONTENT GUARD: 12 signs × 9 numbers = 108 trait combos across
366 pages. Each date's personality section must interleave that date's UNIQUE
data (top celebrity of the date by name, national day if any, birthstone) into
the rendered personality prose so no two dates read as duplicates. Verify by
diffing the rendered section of two same-sign-same-number dates — they must
differ meaningfully; paste the diff evidence.

A4 — PHASE 5 QUOTA GUARD: report OG route must be cache-first (Cache API +
immutable headers), render ONLY for slugs that exist in the DB, hard daily
budget counter (e.g. 200 renders/day, then serve the static default), and
rate-limit per IP. Crawler storms must never exhaust the Browser Rendering
free quota that the invoice PDFs depend on — invoices have priority.
