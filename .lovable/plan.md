

## Restructure Homepage: 3 Clear Feature Pillars with Premium Life Expectancy CTA

### Problem
The homepage has a flat "Explore More" grid with 4 equal cards (Life Expectancy, Zodiac, Birthstone, Celebrity Match). Life Expectancy -- the premium feature -- looks identical to the free Zodiac/Birthstone pages. There's no visual hierarchy communicating the app's 3 core features, and no premium upsell moment.

### New Homepage Structure

Replace the current 4-card grid with a **3 Feature Pillars** section that clearly communicates the app's value hierarchy:

```text
┌──────────────────────────────────────────────────┐
│  Hero + Age Calculator (unchanged)               │
├──────────────────────────────────────────────────┤
│  Celebrity Match results (unchanged, after DOB)  │
├──────────────────────────────────────────────────┤
│  Zodiac & Facts (unchanged, after DOB)           │
├──────────────────────────────────────────────────┤
│  ★ LIFE EXPECTANCY PREMIUM CTA (NEW)            │
│  Full-width standout card with gradient border,  │
│  Crown icon, preview stats teaser, and           │
│  "Unlock Your Life Report" CTA button            │
│  Shows after birthDate is entered                │
├──────────────────────────────────────────────────┤
│  "Our 3 Core Features" section (NEW)             │
│  3-column layout (not 4), each feature gets      │
│  a distinct visual identity:                     │
│  1. Age Calculator - primary color, free badge   │
│  2. Celebrity Match - accent color, free badge   │
│  3. Life Expectancy - gold/amber, premium badge  │
│     with Crown icon + "Premium" tag              │
├──────────────────────────────────────────────────┤
│  Zodiac & Birthstone moved to a smaller          │
│  "Also Explore" row (2-col, secondary)           │
├──────────────────────────────────────────────────┤
│  Testimonials, About, Review (unchanged)         │
└──────────────────────────────────────────────────┘
```

### Key Changes

**1. Premium Life Expectancy CTA Card** (after Zodiac/Facts, only when birthDate exists)
- Full-width card with a gold/amber gradient border and subtle glow
- Teaser copy: "How long will you live? Based on your habits, health, and lifestyle -- discover your projected lifespan."
- Preview stats: "Covers 15+ health factors", "Personalized What-If scenarios", "Actionable recommendations"
- CTA button: "Unlock Your Life Report" with Crown icon
- If user is premium, button says "View My Life Report" instead

**2. Replace 4-card grid with 3 Feature Pillars**
- 3-column grid (`lg:grid-cols-3`) instead of 4
- Each card is taller with more description and a clear action button
- Life Expectancy card gets a distinct gold/amber theme with "Premium" badge and Crown icon
- Age Calculator and Celebrity Match cards get "Free" badges

**3. Zodiac & Birthstone become secondary**
- Moved to a smaller "Also Explore" 2-column row below the 3 pillars
- Smaller cards, less visual weight -- they're supplementary features, not core

**4. Navigation update**
- Add a Crown icon or "Premium" text next to "Life Expectancy" in the nav bar

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Replace 4-card grid with 3 Feature Pillars + secondary row; add premium CTA card after zodiac section |
| `src/components/Navigation.tsx` | Add Crown/Premium indicator next to Life Expectancy nav link |

