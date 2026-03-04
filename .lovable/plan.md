

## Four Growth Features: Planetary Age, Numerology, Today's Birthdays, Shareable Card

### 1. Age on Other Planets (Fun/Virality)

**New component**: `src/components/PlanetaryAge.tsx`
- Shows user's age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune using orbital period ratios (e.g., Mercury year = 87.97 Earth days)
- Visual cards with planet emojis/icons, each showing the calculated age rounded to 2 decimals
- Fun taglines per planet (e.g., "On Jupiter, you're basically a toddler!")
- Renders below the age breakdown on the homepage when `birthDate` is set

**Edit**: `src/pages/Index.tsx` — add `<PlanetaryAge birthDate={birthDate} />` section after the age calculator

### 2. Numerology / Life Path Number (Audience Expansion)

**New component**: `src/components/NumerologyLifePath.tsx`
- Calculates Life Path Number by reducing birth date digits (e.g., 1990-03-15 → 1+9+9+0+0+3+1+5 = 28 → 2+8 = 10 → 1+0 = 1), preserving master numbers 11, 22, 33
- Displays the number prominently with its meaning, personality traits, and famous people with the same number
- Data for all 9 numbers + 3 master numbers stored inline in the component

**Edit**: `src/pages/Index.tsx` — add section after ZodiacAndFacts when `birthDate` is set

### 3. Today's Birthdays Section (Retention)

**New component**: `src/components/TodaysBirthdays.tsx`
- Uses existing `getBirthdayData()` from `src/data/birthdayData.ts` to fetch today's date celebrities
- Shows a card with "Born Today" header, lists 5-8 notable people with name, profession, and category icon
- Always visible on homepage (no birth date required) — gives users a reason to return daily
- Links to `/celebrity-birthday` for more

**Edit**: `src/pages/Index.tsx` — add section before FeaturePillars (always visible)

### 4. Visual Shareable Card (Growth)

**New component**: `src/components/ShareableCard.tsx`
- Generates a styled card (fixed 1200x630 dimensions for social media) containing: user's age, total days lived, zodiac sign, life path number, and top celebrity match
- Uses `html2canvas` (already installed) to render the card to an image
- "Download as Image" button saves as PNG; "Share" button uses Web Share API with the image file
- Gradient background, bold typography — designed to look good on Instagram/Twitter

**Edit**: `src/pages/Index.tsx` — replace or augment the existing ShareAndExport section with this visual card option when birth date is entered

### Files

| File | Action |
|------|--------|
| `src/components/PlanetaryAge.tsx` | Create — planet age calculator UI |
| `src/components/NumerologyLifePath.tsx` | Create — life path number calculator |
| `src/components/TodaysBirthdays.tsx` | Create — daily celebrity birthdays |
| `src/components/ShareableCard.tsx` | Create — visual shareable image card |
| `src/pages/Index.tsx` | Edit — integrate all four new sections |

