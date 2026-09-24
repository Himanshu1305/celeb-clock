# Part AG — flags (Mystic Corner + Science & Longevity)

Step 0 confirmed (develop e7e1c7d). Branch `part-ag-mystic-science-pages`.

## Nothing fabricated; nothing excluded (as of build)
Every linked tool is a confirmed-real route (verified in App.tsx): /numerology, /name-numerology,
/zodiac, /chinese-zodiac, /tarot-card-by-birthday, /compatibility (Mystic); /life-expectancy,
/biological-age, /articles/longevity-quiz (Science). The brief flagged Tarot and a compatibility
calculator as "unconfirmed" — both turned out to be REAL routes, so they're included.

## Conservative calls made (no one awake to ask)
1. Mystic hero deep-link → /birthday-report?dob= (not /numerology): /numerology has no ?dob=
   deep-link and BirthDateContext deliberately doesn't persist DOB. Reused the verified
   /birthday-report?dob= flow (computes Life Path + zodiac) rather than modify a shared context
   or duplicate calc logic on the hub.
2. /life-expectancy: kept the existing SEO H1 ("Best Life Expectancy Calculator…") rather than
   replacing it with the brief's headline (protects existing search rankings on a real-traffic
   page); the brief's headline/subhead framing is added prominently in the enhancement band.
3. /life-expectancy enhancement band styled to match the existing page's theme, NOT the
   navy/gold category system — injecting navy/gold mid-page into an existing differently-themed
   page would clash. Documented as an intentional deviation from the "same visual system" note.

## Future opportunities (not built — not fabricated)
- A dedicated standalone Tarot deep-page beyond /tarot-card-by-birthday, and a numerology-native
  ?dob= deep-link, could be added later; neither was needed for real, working links tonight.
