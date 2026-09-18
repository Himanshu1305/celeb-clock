# Part V — "Before" State (what Part U actually shipped)

Verified by reading `src/components/Navigation.tsx` and `src/pages/Index.tsx` directly.

## Nav category order (Part U, current)
`science → vedic → birthday → mystic → more`
**Part V target:** `vedic → birthday → mystic → science → more`. → REORDER needed.

## "Choose your path" cards (Part U, current order + copy)
1. Science & Longevity (`/life-expectancy`, 🔬) — "Real, research-backed life-expectancy and biological-age tools."
2. Vedic Astrology (`/kundali`, 🪔) — "Precisely computed birth chart, matching and AI astrologer."
3. Birthday Fun & Celebrity Twins (`/todays-birthdays`, 🎂) — "Your celebrity birthday twin, age tools and birthday reports."
4. Mystic Corner (`/numerology`, 🔢) — "Numerology, name numerology and tarot by your birthday."

**Part V target:** reorder to Vedic → Birthday → Mystic → Science, and rewrite each
card to the finalized Part 2 copy (real birth chart; live heartbeats + age; Life Path N;
"See what adds or costs you years" + years + UN/WHO/GBD sourcing line). → REORDER + REWRITE.

## Homepage block order (Part U, current)
1. Hero (Part U tagline)
2. `choose-your-path` (4 cards, order above)
3. `block-birthday` heading → BirthdayReportShowcase, BentoGrid, Planetary Weight Teaser,
   "Explore BornClock" (6 discovery cards + 12 zodiac chips), Featured Celebrities
4. `block-science` heading → More Ways to Know Yourself, Science cards row,
   "The science behind BornClock", EEAT Trust Section
5. Closers: Testimonials, FAQ, Articles, Popular Questions, AuthorBio, Footer

**Part V target:** choose-your-path → **Vedic block (NEW — none existed)** → Birthday block
→ **Mystic block (NEW grouping)** → Science block → closers. Science already last. → ADD
Vedic block, ADD Mystic block, insert in the new sequence.

## Positioning-statement doc
**NOT FOUND.** Searched `docs/` for filenames containing "positioning" and grepped for
"positioning statement"/"positioning:" — the only hits are the Part U/V prompt files and
BATCH-5-PROMPT.md mentioning the word in passing. No dedicated positioning document
exists. → Flagged in `docs/part-v-flags.md`; using the Part 3 fallback language for the
Vedic block's verification note (honest framing: "precisely computed" / verified accuracy,
never "scientific" for astrology).

## Link baseline (hard-rule diff target — from current Index.tsx)
Captured to `/tmp/v-index-before.txt` at execution time; the AFTER set must contain every
BEFORE link (superset; new Vedic/Mystic preview links may be added).
