DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.

Read docs/PROJECT_CONTEXT.md first.
Then read scripts/generate-og-cards.mts completely.
Then read scripts/prerender.mjs lines 85-110 (the ogImageForRoute function).

The problem and the fix:
The prerender script's ogImageForRoute() function resolves OG images by checking if
files exist in dist/og/. For single-segment routes like /life-expectancy, it tries
dist/og/fitness/life-expectancy.webp — but that file doesn't exist so it falls back
to default.webp. For multi-segment routes like /life-expectancy-india, the function
has no matching regex so it also falls back to default.webp.

Two changes needed:
1. Generate the missing OG card files (in generate-og-cards.mts)
2. Add regex cases for multi-segment routes (in prerender.mjs ogImageForRoute)

No changes to page SEO components needed — the prerender injection is route-based,
not prop-based.

---

CHANGE 1 — generate-og-cards.mts: add named cards for calculator pages

In the main() function, after the blog posts section and before runBatched,
add these jobs using the existing svg() helper. Match existing style exactly.

Single-segment routes use path prefix "fitness/" because that's what ogImageForRoute
already tries for single-segment routes. No prerender.mjs change needed for these.

```typescript
// ── Single-segment calculator pages (fitness/ prefix = auto-detected by prerender) ──

jobs.push({ rel: 'fitness/age-calculator.webp', markup: svg({
  eyebrow: 'Age Calculator',
  title: 'How old are you — really?',
  sub: 'Years · months · days · hours · seconds · live',
  titleSize: 72
})});

jobs.push({ rel: 'fitness/life-expectancy.webp', markup: svg({
  eyebrow: 'Life Expectancy',
  title: 'How long will you live?',
  sub: 'Science-based longevity estimate · 15 lifestyle factors · WHO data',
  titleSize: 68
})});

jobs.push({ rel: 'fitness/biological-age.webp', markup: svg({
  eyebrow: 'Biological Age',
  title: 'Your body may be younger than your birthday.',
  sub: '12 WHO-validated biomarkers · Free · No sign-up needed',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/moon-sign.webp', markup: svg({
  eyebrow: 'Moon Sign Calculator',
  title: "Your moon sign is probably more 'you' than your sun sign.",
  sub: 'Find yours free — by date of birth',
  titleSize: 54
})});

jobs.push({ rel: 'fitness/compatibility.webp', markup: svg({
  eyebrow: 'Compatibility Calculator',
  title: 'Are you compatible?',
  sub: 'Zodiac · numerology · Western & Vedic — by date of birth',
  titleSize: 72
})});

jobs.push({ rel: 'fitness/numerology.webp', markup: svg({
  eyebrow: 'Numerology',
  title: 'Your life path number reveals more than you think.',
  sub: 'Free numerology calculator · by date of birth',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/country-comparison.webp', markup: svg({
  eyebrow: 'Life Expectancy by Country',
  title: 'How does where you live affect how long you live?',
  sub: 'Compare 50+ countries · WHO 2023 data · Free',
  titleSize: 58
})});

jobs.push({ rel: 'fitness/biorhythm.webp', markup: svg({
  eyebrow: 'Biorhythm Calculator',
  title: 'Your physical, emotional & mental cycles — mapped.',
  sub: 'Free biorhythm calculator · by date of birth',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/generation.webp', markup: svg({
  eyebrow: 'Generation Finder',
  title: "Gen Z? Millennial? Boomer? Find out what shaped you.",
  sub: 'Your generation · defining events · cultural identity',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/planetary-age.webp', markup: svg({
  eyebrow: 'Planetary Age',
  title: 'How old are you on Mars?',
  sub: 'Your age on every planet in the solar system · NASA data',
  titleSize: 68
})});

jobs.push({ rel: 'fitness/birthday-report.webp', markup: svg({
  eyebrow: 'Birthday Report',
  title: 'The most meaningful birthday gift — their complete story.',
  sub: '9-section personalised report · from their date of birth',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/coach.webp', markup: svg({
  eyebrow: 'Longevity Coach',
  title: 'Add years to your life. Start with your birthday.',
  sub: 'Personalised longevity plan · science-backed · free',
  titleSize: 64
})});

jobs.push({ rel: 'fitness/celebrity-birthday.webp', markup: svg({
  eyebrow: 'Celebrity Birthday Twin',
  title: 'Who shares your birthday?',
  sub: '50,000+ celebrities · actors · athletes · leaders · scientists',
  titleSize: 64
})});

jobs.push({ rel: 'fitness/todays-birthdays.webp', markup: svg({
  eyebrow: "Today's Famous Birthdays",
  title: 'Who is celebrating today?',
  sub: 'Famous birthdays updated daily · worldwide',
  titleSize: 68
})});

jobs.push({ rel: 'fitness/zodiac.webp', markup: svg({
  eyebrow: 'Zodiac Calculator',
  title: 'More than your sun sign.',
  sub: 'Western · Vedic · Chinese · Moon sign · by date of birth',
  titleSize: 72
})});

jobs.push({ rel: 'fitness/birthstone.webp', markup: svg({
  eyebrow: 'Birthstone Finder',
  title: 'Your birth month gem — and what it means.',
  sub: 'History · healing properties · how to wear it',
  titleSize: 64
})});

jobs.push({ rel: 'fitness/biological-age-vs-chronological-age.webp', markup: svg({
  eyebrow: 'Biological vs Chronological Age',
  title: 'Only one of these can change.',
  sub: 'Which one is actually you? The science explained.',
  titleSize: 68
})});

jobs.push({ rel: 'fitness/sun-vs-moon-sign.webp', markup: svg({
  eyebrow: 'Sun Sign vs Moon Sign',
  title: 'Which one actually describes you?',
  sub: 'Most people identify more with their moon sign once they find it.',
  titleSize: 56
})});

jobs.push({ rel: 'fitness/answers.webp', markup: svg({
  eyebrow: 'BornClock Answers',
  title: 'Birthday questions. Science-backed answers.',
  sub: 'Age · longevity · astrology · numerology',
  titleSize: 68
})});

jobs.push({ rel: 'fitness/embed.webp', markup: svg({
  eyebrow: 'Free Widget',
  title: 'Embed BornClock on your website — free.',
  sub: 'Age calculator widget · one line of code · always up to date',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/age-in-days.webp', markup: svg({
  eyebrow: 'Age in Days',
  title: 'How many days old are you?',
  sub: 'A 30-year-old has lived 10,957 days. What about you?',
  titleSize: 68
})});

jobs.push({ rel: 'fitness/age-in-seconds.webp', markup: svg({
  eyebrow: 'Age in Seconds',
  title: 'You have lived this many seconds.',
  sub: 'A 30-year-old has passed 946 million seconds. Watch it tick.',
  titleSize: 60
})});

jobs.push({ rel: 'fitness/birthday-countdown.webp', markup: svg({
  eyebrow: 'Birthday Countdown',
  title: 'How many days until your next birthday?',
  sub: 'Exact countdown · day of week · celebrity twins',
  titleSize: 60
})});

// Shared card for all country longevity pages (multi-segment — needs prerender fix too)
jobs.push({ rel: 'fitness/country-longevity.webp', markup: svg({
  eyebrow: 'Life Expectancy',
  title: 'What does where you were born mean for how long you live?',
  sub: 'WHO 2023 data · country comparison · personalised estimate',
  titleSize: 56
})});

// Shared card for Hindi pages (multi-segment — needs prerender fix too)
jobs.push({ rel: 'fitness/hindi.webp', markup: svg({
  eyebrow: 'BornClock \u0939\u093f\u0902\u0926\u0940',
  title: '\u0905\u092a\u0928\u0940 \u091c\u0928\u094d\u092e \u0924\u093f\u0925\u093f \u0938\u0947 \u0938\u092c \u0915\u0941\u091b \u091c\u093e\u0928\u0947\u0902\u0964',
  sub: 'Age \u00b7 life expectancy \u00b7 zodiac \u00b7 numerology \u2014 free',
  titleSize: 60
})});
```

---

CHANGE 2 — prerender.mjs: add regex cases for multi-segment routes

Read scripts/prerender.mjs ogImageForRoute function (lines 85-110).
Add these new regex cases BEFORE the single-segment catch-all
`if ((m = route.match(/^\/([a-z0-9-]+)$/)))` line:

```javascript
// Country longevity pages (multi-segment)
if (route.match(/^\/life-expectancy-(india|usa|japan|uk|australia|canada|germany|china|singapore|brazil)$/))
  candidates.push('fitness/country-longevity.webp');

// Hindi pages (multi-segment)
if (route.match(/^\/(meri-umar-kitni-hai|jivan-kal-calculator|numerology-hindi|rashifal-by-date-of-birth|biological-age-hindi)$/))
  candidates.push('fitness/hindi.webp');

// Life expectancy India vs USA comparison page
if (route === '/life-expectancy-india-vs-usa')
  candidates.push('fitness/country-longevity.webp');

// Biological age vs chronological (multi-segment)
if (route === '/biological-age-vs-chronological-age')
  candidates.push('fitness/biological-age-vs-chronological-age.webp');

// Sun vs moon sign (multi-segment)
if (route === '/sun-vs-moon-sign')
  candidates.push('fitness/sun-vs-moon-sign.webp');

// Best X calculator pages
if (route.match(/^\/(best-age-calculator|best-life-expectancy-calculator|best-birthday-calculator|best-biological-age-calculator|best-numerology-calculator)$/))
  candidates.push('fitness/answers.webp');
```

Add these lines BEFORE the existing single-segment catch-all line, not after.
The existing catch-all stays exactly where it is — only new lines are added above it.

---

CHANGE 3 — Improve og:description for high-value pages

The SEO component's description prop flows into the prerendered og:description.
Update the description prop in these specific pages to be WhatsApp-optimised
(punchy, specific, creates curiosity — what someone sees as preview text):

src/pages/LifeExpectancy.tsx — find the SEO component, update description:
"Harvard tracked 123,000 people for 30 years. 5 habits add 14 years to life. Find out where you stand — free."

src/pages/BiologicalAge.tsx:
"Your body may be 10 years younger — or older — than your birthday says. Find out in 2 minutes. Free."

src/pages/GiftReport.tsx:
"A 9-section personalised birthday report built from their date of birth. The most thoughtful gift they'll get this year."

src/pages/CoachLandingPage.tsx:
"Your personalised longevity plan — built from your birthday and your habits. Start adding years today. Free."

src/pages/CelebrityBirthday.tsx:
"50,000+ celebrities in our database. Find out which famous actor, athlete, or scientist shares your exact birthday."

src/pages/Generation.tsx:
"Gen Z, Millennial, Gen X, Boomer — find out which generation you belong to and what shaped the way you see the world."

src/pages/AgeCalculatorPage.tsx:
"You're not just 30 years old. You've lived 10,957 days. 946 million seconds. Find your exact age — live, free."

For each file: read it completely first, find the SEO component's description prop,
replace only the description value. Do not change any other props or content.

---

VERIFICATION:

1. tsc --noEmit — 0 errors

2. npm run build
   During build the OG card generation step runs first.
   Count new cards: ls dist/og/fitness/ | wc -l
   Should be significantly more than before (was 6 fitness cards, now ~29).

3. Verify single-segment route injection:
   grep "og:image" dist/life-expectancy/index.html
   Must show: https://bornclock.com/og/fitness/life-expectancy.webp
   NOT: default.webp

4. Verify multi-segment route injection:
   grep "og:image" dist/life-expectancy-india/index.html
   Must show: https://bornclock.com/og/fitness/country-longevity.webp
   NOT: default.webp

5. Verify description injection:
   grep "og:description" dist/life-expectancy/index.html
   Must show the new compelling description, not the old generic one.

6. Run test suite:
   npx playwright test e2e/gauntlet/ e2e/prelaunch/ --reporter=line
   Fix any failures — never weaken assertions.

7. Report:
   - Total new OG cards generated (count in dist/og/fitness/)
   - Verify results for steps 3, 4, 5
   - Test results
   - Any issues

Commit: "feat: named OG cards for all pages — WhatsApp sharing fix"
DO NOT PUSH.
