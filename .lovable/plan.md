

## 1. Generation Label for Age Calculator (New Component)

**New file**: `src/components/GenerationLabel.tsx`

A component that takes a birth year and determines the user's generation with traits:
- **Gen Alpha** (2013–present): "Digital natives, tech-fluent, socially aware"
- **Gen Z** (1997–2012): "Entrepreneurial, diverse, digitally savvy"
- **Millennial** (1981–1996): "Adaptable, purpose-driven, tech-comfortable"
- **Gen X** (1965–1980): "Independent, resourceful, work-life balanced"
- **Baby Boomer** (1946–1964): "Optimistic, competitive, team-oriented"
- **Silent Generation** (1928–1945): "Disciplined, loyal, traditional"

Displays as a shareable badge card with generation name, year range, emoji, and 3-4 personality traits. Includes a "Share your generation" button using Web Share API.

**Edit**: `src/pages/AgeCalculatorPage.tsx` — add `<GenerationLabel birthYear={birthDate.getFullYear()} />` after the age breakdown section.

## 2. Homepage Content Rewrite

**Rewrite**: `src/pages/Index.tsx`

Replace the current generic hero + card grid with a content-rich landing page that explains each feature with descriptions and CTAs. Structure:

1. **Header** (Nav + AuthNav — unchanged)
2. **Welcome message** (logged-in users only — unchanged)
3. **Hero** — "Your Birthday, Decoded" with a 2-line value prop and primary CTA
4. **"What Can You Do?" section** — 6 content blocks, each with an icon, heading, 2-3 sentence description of the feature, and a CTA button:
   - **Age Calculator**: "Calculate your exact age in days, hours, minutes, and seconds — updated live in real-time. Find out your generation (Boomer, Millennial, Gen Z…) and share your results." → CTA: "Calculate My Age"
   - **Celebrity Birthday Match**: "Enter your date of birth and discover which celebrities, scientists, athletes, and world leaders share your birthday. We match your DOB against thousands of verified famous birthdays." → CTA: "Find My Celebrity Twins"
   - **Zodiac & Birthstone**: "Discover your zodiac sign with detailed personality traits, compatibility insights, and your birth month's gemstone with its meaning and history." → CTA: "Explore My Zodiac"
   - **Celebrity Birthday Search**: "Search for any celebrity's birthday. Find out when your favorite stars were born — results open via our comprehensive celebrity database." → CTA: "Search Celebrity Birthdays"
   - **Life Expectancy Report**: "Get a personalized life expectancy estimate based on 15+ factors including smoking, drinking, diabetes, cardiac health, exercise habits, and stress levels. See how many years you could gain by changing habits." → CTA: "Get My Report" (Premium badge)
   - **What-If Scenarios**: "Already have your report? See the real-time impact of lifestyle changes — quit smoking, exercise more, reduce stress — and watch your projected lifespan increase instantly." → CTA: "Try What-If Scenarios" (Premium badge)
5. **Secondary tools row** — compact cards for Numerology, Planetary Age, Today's Birthdays (same pattern as current "Also Explore")
6. **Today's Birthdays Preview** — compact daily retention hook (unchanged)
7. **Sign Up CTA** (non-authenticated only)
8. **EEAT Trust Section** — brief paragraph about verified algorithms, scientific backing, and content standards
9. **Testimonials**
10. **Footer**

**Edit**: `src/components/FeaturePillars.tsx` — rewrite to render the 6 detailed content blocks described above instead of the current icon-only card grid. Each block will be a horizontal card (icon left, content right) on desktop, stacking vertically on mobile.

### Files Changed

| File | Action |
|------|--------|
| `src/components/GenerationLabel.tsx` | Create — generation badge with traits and share button |
| `src/pages/AgeCalculatorPage.tsx` | Edit — add GenerationLabel after age results |
| `src/pages/Index.tsx` | Rewrite — content-rich landing with feature descriptions and CTAs |
| `src/components/FeaturePillars.tsx` | Rewrite — detailed feature blocks with descriptions instead of icon-only cards |

