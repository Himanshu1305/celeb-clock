# Part AH — Homepage redesign (Option C) flags

Step 0 confirmed: develop at b47002e (all four category pages present). Branch part-ah-homepage-redesign.

## Part 2 — SKIPPED (optional; flagged per the "skip rather than force" instruction)
The category-page hero color accents were NOT applied. Reasons:
- Explicitly optional in the brief ("skip rather than force it in").
- Full application requires touching /life-expectancy's hero — a complex 1158-line YMYL page — right before a cautious homepage preview; that's avoidable risk.
- Doing only the 3 easy bespoke pages (vedic/celebrity-birthday/mystic) and skipping life-expectancy would create INCONSISTENT family resemblance, defeating the point.
- It's purely cosmetic; a clean, low-risk dedicated follow-up. No page was destabilized.

## Real photos sourced (Unsplash, free/commercial-use, served as optimized WebP)
- Hero night sky: Tobias Rademacher — https://unsplash.com/photos/oQR1B87HsNs → public/images/hero-nightsky.webp (WebP, w1280 q52, ~199KB), darkened ~62-82% overlay for text legibility.
- AI banner (cozy, person on phone): Vitaly Gariev — https://unsplash.com/photos/qAuSGkePHV0 → public/images/ai-cozy.webp (WebP, w900 q65, ~46KB).
Both noted in Index.tsx comments. No placeholders/gradients used where a photo was requested.

## Animations / performance
- Continuous rotation (wheel 90s), counter-rotation (starfield 160s), twinkle, and tile float are gated behind `@media (prefers-reduced-motion: no-preference) and (min-width: 768px)` — so reduced-motion users get a static hero, AND mobile (≤767px) is static regardless (perf). Hover lift on tiles only.
- Lighthouse mobile numbers reported in the morning report / final message.

## Removed (not duplicated) + intentional homepage changes
- Old "choose your path" card section REMOVED, replaced by the orbit row (single category picker).
- Old homepage content blocks (block-vedic/birthday/mystic/science, science-card-row, homepage-articles) removed — replaced by orbit row + footer sitemap.
- Two minor science links (/country-comparison, /energy-forecast) dropped from the homepage (still reachable via nav + /science-longevity). e2e specs (navigation, batch-9, batch-9-logic) updated to match.
- Removed the fabricated "birthdays decoded" live counter and "42+ insights" claim (no invented stats).
- Footer "Dasha Timing" → /kundali (no dedicated /dasha page; Dasha timing lives in the Kundali).

## Prices (verified real, src/lib/pricing.ts REPORT_PRICE)
Kundali Report ₹199, Birthday Blueprint ₹199 (INR). Both correct.
