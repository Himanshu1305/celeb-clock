

## Plan: Fun Homepage Redesign + Celebrity Images in Today's Birthdays

### 1. Homepage Overhaul — Make It Fun & Engaging

**File: `src/pages/Index.tsx`** — Full rewrite

Remove the "Your Birthday, Decoded" hero section entirely. Replace with a vibrant, party-themed landing page:

- **Animated hero** with floating emoji decorations (🎂🎉🎊✨🥳) using CSS `animate-float` with staggered delays, plus a gradient-animated headline like "Welcome to the Birthday Party!" or "Every Day is Someone's Birthday"
- **Confetti/sparkle CSS keyframes** added to `src/index.css` — floating particles and a shimmer effect on key elements
- **6 Feature showcase cards** in a 2x3 grid (mobile: 1 col), each with:
  - A large fun emoji or icon
  - Bold title + 2-3 sentence description of the feature
  - Hover animation (scale + glow)
  - CTA button linking to the tool page
  - The 6 features: Age Calculator (real-time seconds), Celebrity Match, Zodiac & Birthstone, Celebrity Search, Life Expectancy, What-If Scenarios
- **Secondary tools row** — Numerology, Planetary Age, Today's Birthdays as smaller animated cards
- **Today's Birthdays Preview** with celebrity images (see below)
- Sign-up CTA, EEAT section, Testimonials remain but get subtle party-themed styling

**File: `src/components/FeaturePillars.tsx`** — Rewrite with fun card design: gradient borders, hover glow effects, larger icons, playful descriptions

**File: `src/index.css`** — Add new keyframes:
- `sparkle` — rotating twinkle effect
- `confetti-fall` — particles drifting down
- `gradient-shift` — animated gradient background for hero
- `bounce-in` — bouncy entrance for cards with staggered delays

### 2. Celebrity Images in TodaysBirthdays

**File: `src/components/TodaysBirthdays.tsx`** — Major update

The birthday data has `wikipediaUrl` but no `image` field. Solution: Use the **Wikipedia API** to fetch thumbnail images dynamically.

- Extract the Wikipedia page title from the `wikipediaUrl` field (e.g., `Justin_Bieber` from `https://en.wikipedia.org/wiki/Justin_Bieber`)
- Call `https://en.wikipedia.org/w/api.php?action=query&titles=TITLE&prop=pageimages&pithumbsize=100&format=json&origin=*` to get thumbnails
- Cache results in component state (one batch request for all people)
- Display circular avatar images next to each person's name using the existing `Avatar` component
- Fallback to the category icon initials if no image is found
- Make each person card clickable — opens the `CelebrityProfileDialog` or navigates to their Wikipedia page

**Changes:**
- Add a `useEffect` that fetches Wikipedia thumbnails for all displayed people on mount
- Replace the plain icon circle with `<Avatar>` showing the fetched image
- Wrap each person card in a link/button that opens the celebrity detail or Wikipedia URL
- Show profession, birth year under the name

### 3. Today's Birthdays on Homepage — Enhanced Preview

The `TodaysBirthdays` component used on the homepage will automatically get the image treatment since we're updating the shared component.

### Files Changed

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Rewrite — fun party-themed landing with floating emojis, animated cards |
| `src/components/FeaturePillars.tsx` | Rewrite — playful feature cards with hover effects and gradient borders |
| `src/components/TodaysBirthdays.tsx` | Update — fetch & display Wikipedia celebrity images, clickable cards |
| `src/index.css` | Add — sparkle, confetti, gradient-shift, bounce-in keyframes |

