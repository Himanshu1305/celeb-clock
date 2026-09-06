DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.

You are working on the BornClock project at /Users/hidixit/Development/celeb-clock on branch develop.

Before writing any code, read these files completely:
- src/pages/AgeCalculatorPage.tsx (page structure template)
- src/pages/answers/WhatIsMyBiologicalAge.tsx (answer page template)
- src/components/SEO.tsx (SEO component interface)
- src/components/AnswerLayout.tsx (answer layout wrapper)
- src/App.tsx (add all new routes here)

Then implement ALL pages below exactly as specified. The content is final and approved — do not rewrite, summarize, or paraphrase any of it. Implement it exactly as written. Your job is coding, not content generation.

---

GLOBAL IMPLEMENTATION RULES:
- Use Navigation, AuthNav, Footer, SEO, AnswerLayout, EEATBadges, PageFAQ, RelatedTools, FAQSchema, WebApplicationSchema exactly as used in existing pages
- All new routes must be added to src/App.tsx
- tsc must remain 0 errors after every commit
- For calculator pages: follow AgeCalculatorPage.tsx structure exactly
- For answer pages: follow WhatIsMyBiologicalAge.tsx structure exactly — breadcrumb schema, article schema, FAQ schema inline as JSON-LD script tags, AnswerLayout wrapper, indigo highlight box for direct answer, prose sections, RelatedTools at bottom
- The indigo highlight box pattern is: <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8"><p className="text-base font-semibold text-indigo-900 leading-relaxed">[answer text]</p></div>
- RelatedTools links must point to real existing routes only — verify each route exists in App.tsx before linking
- Commit after each GROUP, not each file

---

GROUP 1 — CALCULATOR PAGES
Implement these 3 calculator pages. Follow AgeCalculatorPage.tsx exactly.

---

PAGE 1: src/pages/AgeInDays.tsx
Route: /age-in-days
SEO title: "Age in Days Calculator — How Many Days Old Are You?"
SEO description: "Find out exactly how many days old you are — updated live, including leap years. Most people are surprised how large the number is. Free, instant, no sign-up."
SEO keywords: "age in days, how many days old am I, age calculator days, days old calculator"
Canonical: /age-in-days
OG image: https://bornclock.com/og/calculator.png

WebApplicationSchema: name="Age in Days Calculator" description="Find your exact age in days, updated live. Accounts for leap years automatically." url="/age-in-days"

FAQSchema items:
Q: How do I calculate my age in days?
A: Multiply your completed years by 365, add one day for each leap year within your lifetime, then add the days elapsed since your last birthday. BornClock's calculator does all of this automatically and updates live every midnight.

Q: How many days old is a 30-year-old?
A: Typically between 10,957 and 10,988 days — the exact number depends on how many leap years fall within their lifetime and whether their birthday has already occurred this year.

Q: What is the 10,000-day milestone?
A: The 10,000-day milestone falls at approximately 27 years and 4–5 months old. It's one of the most significant numerical milestones in a human life that almost nobody notices — because we don't count age in days. Check when yours falls.

Q: Does the age-in-days calculation include the day you were born?
A: Yes — your birth date is counted as day one. BornClock follows this convention, which is also how age in days is counted medically.

H1: How Many Days Old Are You?

Direct answer box content:
Here's something most people never think to check: a 30-year-old has been alive for somewhere between 10,957 and 10,988 days — the exact number depends on leap years and whether their birthday has passed this year. Your age in days is the total calendar days elapsed since your birth date, recalculated every midnight. Enter your date of birth above and see yours now.

After calculator, include these sections as prose with h2 headings:

SECTION: Why your age in days is more interesting than it sounds
When you find out you're 11,000 days old, something quietly shifts. That number has weight in a way "30 years" doesn't. Many people describe it as both sobering and motivating — each day becomes a unit with meaning, not just a fraction of something larger.

There's also a milestone dimension that years miss entirely. Turning 10,000 days old is a genuine life event — it falls at around age 27 and a half and passes completely unnoticed by most people. The 5,000-day mark arrives at roughly 13 years and 8 months. The 20,000-day mark, if you reach it, lands at about 54 years and 9 months. These are real thresholds in a human life, hiding in plain sight because nobody's counting.

Note on birth time: your age in days is based on your date of birth, not the exact hour. If you were born at 11pm, the first hour of your life is still counted as day one — a rounding difference that becomes meaningless within days and doesn't affect the day count at all.

SECTION: How the calculation works
Calculating age in days sounds simple — just multiply years by 365 — but that gives you only an approximation. The accurate method accounts for:

Leap years — one extra day every four years (with exceptions for century years not divisible by 400). If you were born in February or March, this matters more than you'd think.
Whether your birthday has passed this year — if it hasn't, you're technically still in your previous year of life, which affects the total day count.
The current date — your age in days changes every midnight, so the number is always moving.

BornClock's calculator handles all of this automatically and gives you a live figure that updates as each new day begins.

SECTION: Day milestones worth knowing
Render this as an HTML table:
Milestone | Age in Years
1,000 days | 2 years, 8–9 months
5,000 days | 13 years, 8 months
10,000 days | 27 years, 4–5 months
15,000 days | 41 years, 1 month
20,000 days | 54 years, 9–10 months
25,000 days | 68 years, 6 months
30,000 days | 82 years, 2 months

Most people hit the 10,000-day mark completely unaware. It's worth knowing when yours falls — and maybe marking it.

SECTION: Why some people track age in days
Doctors and researchers often use days rather than years when precision matters. In neonatal medicine, a premature baby's age is tracked in days and weeks — the difference between day 180 and day 200 can be clinically significant. In oncology research, treatment outcomes are measured in days of survival. In developmental psychology, cognitive milestones are tracked by day ranges, not birth years.

Outside medicine, endurance athletes sometimes track their age in days as a motivational frame. Each day is a unit of training, not a fraction of a year. When you're 11,432 days old, day 11,433 feels distinct in a way that "30 years, 3 months" never quite does.

EEATBadges sources: ['ISO 8601', 'WHO Health Metrics']
RelatedTools links: /age-calculator, /age-in-hours, /age-in-weeks, /birthday-countdown
PageFAQ: use the 4 FAQ items from FAQSchema above

---

PAGE 2: src/pages/AgeInSeconds.tsx
Route: /age-in-seconds
SEO title: "Age in Seconds Calculator — How Many Seconds Have You Been Alive?"
SEO description: "Calculate exactly how many seconds old you are — live, updating every second. Most 30-year-olds have passed 946 million seconds. Free, instant, no sign-up."
SEO keywords: "age in seconds, how many seconds old am I, seconds old calculator, how many seconds have I lived"
Canonical: /age-in-seconds

WebApplicationSchema: name="Age in Seconds Calculator" description="Find your exact age in seconds, updating live every second. Includes leap year calculation." url="/age-in-seconds"

FAQSchema items:
Q: How many seconds old am I if I'm 25?
A: Approximately 788 million seconds (25 × 365.25 × 86,400). The exact figure depends on your birth date and the leap years within your lifetime — BornClock calculates this precisely.

Q: What is 1 billion seconds in years?
A: Approximately 31 years and 251 days — about 31.7 years. Most people cross the 1-billion-second threshold in their early thirties, usually without knowing it.

Q: Why does the seconds counter update live?
A: Because your age in seconds changes every second. BornClock recalculates continuously so the number reflects the exact elapsed time right now — not a rounded estimate from earlier today.

Q: Is the calculation affected by time zones?
A: The calculation is based on your date of birth, not the exact hour — so time zones don't affect the result in any meaningful way for most people. If you were born very close to midnight and want precision to the hour, birth time matters more, but for day-level accuracy, the date alone is sufficient.

H1: You've Been Alive for This Many Seconds

Direct answer box content:
Take a breath. In the time it took to read that, three seconds passed — and your counter just went up by three. A 30-year-old has lived approximately 946 million seconds. Watch yours tick upward live above. Most people find the number simultaneously larger and smaller than they expected.

After calculator, include these sections:

SECTION: Why seconds change how you think about time
A billion seconds sounds abstract until you realize it's only 31.7 years. Most people alive today will live through two billion seconds. Some will reach three billion. Very few reach four.

Framed in seconds, time stops feeling infinite. It becomes countable — and that changes something.

Researchers at the University of Pennsylvania have documented what they call temporal landmarks — moments where an unusual framing of time prompts genuine reflection and behavior change. People are measurably more likely to start new habits, make significant decisions, and reset old patterns at temporal landmarks: birthdays, new years, the start of a week. Knowing you're about to cross 500 million seconds, or 1 billion, creates exactly this kind of landmark. One that years would never trigger, because "turning 31" sounds ordinary and "crossing a billion seconds" doesn't.

SECTION: How the calculation works
The formula is straightforward: Age in seconds = Age in days × 86,400

But getting the age in days right requires accounting for leap years, the current date, and whether your birthday has occurred this year. BornClock handles all of this and updates the counter live — so you can watch the number tick upward in real time, one second at a time.

One nuance worth knowing: this calculation counts elapsed seconds from the start of your birth date, not from the exact moment of birth. If you were born at 11:47pm, the very first hours of your life add up to only about 780 seconds — a rounding difference that becomes meaningless within days and has no practical effect on the total.

SECTION: Seconds milestones in a human life
Render as HTML table:
Milestone | Approximate Age
100 million seconds | 3 years, 2 months
500 million seconds | 15 years, 10 months
1 billion seconds | 31 years, 8 months
1.5 billion seconds | 47 years, 6 months
2 billion seconds | 63 years, 4 months
2.5 billion seconds | 79 years, 2 months
3 billion seconds | 95 years

The 1-billion-second birthday falls at exactly 31 years, 251 days, 13 hours, 34 minutes and 54 seconds old. Some people actually celebrate it. If you haven't crossed it yet, check how far away yours is.

SECTION: What a second is worth
Your heart beats roughly once per second at rest. That means your age in seconds is also approximately the number of times your heart has beaten while you were resting — though during exercise, stress, or deep sleep, the rate shifts considerably.

Think about that for a moment. A billion seconds isn't just time. It's a billion heartbeats. A billion moments of your body choosing, without any instruction from you, to keep going.

Take a breath right now. That's one more second. That's the counter you're watching.

EEATBadges sources: ['ISO 8601', 'University of Pennsylvania Research']
RelatedTools: /age-calculator, /age-in-minutes, /age-in-hours, /age-in-days
PageFAQ: use the 4 FAQ items from FAQSchema above

---

PAGE 3: src/pages/BirthdayCountdown.tsx
Route: /birthday-countdown
SEO title: "Birthday Countdown — How Many Days Until Your Next Birthday?"
SEO description: "Find out exactly how many days until your next birthday — down to the day. See what day of the week it falls on and who shares it. Free, no sign-up."
SEO keywords: "birthday countdown, days until my birthday, how many days until my birthday, birthday timer"
Canonical: /birthday-countdown

WebApplicationSchema: name="Birthday Countdown Calculator" description="Count down the exact days until your next birthday. Shows day of week, season, and celebrity birthday twins." url="/birthday-countdown"

FAQSchema items:
Q: How do I calculate days until my birthday?
A: Find the next occurrence of your birth date (this year if it hasn't passed, next year if it has), then count every calendar day between today and that date. BornClock does this automatically, accounting for leap years.

Q: What if my birthday is tomorrow?
A: The countdown shows 1 day. On your birthday itself, the counter resets to 365 (or 366 in a leap year) and begins counting down to the following year's birthday immediately.

Q: What day of the week will my birthday fall on?
A: BornClock shows the day of the week for your upcoming birthday alongside the countdown. The day shifts by one each year, or two after a leap year — so it rotates through the week over a 5–6 year cycle.

Q: What if I was born on February 29?
A: Leap day birthdays are counted to the next February 29. BornClock notes how many years until your next technical birthday and indicates the conventional celebration date (February 28 or March 1) for non-leap years.

H1: How Many Days Until Your Next Birthday?

Direct answer box content:
Your birthday countdown is the exact number of calendar days between today and your next birthday — whether that's this year or next, depending on whether it's already passed. Enter your date of birth above and see your count now, along with what day of the week it falls on.

After calculator, include these sections:

SECTION: Why knowing your exact countdown matters
Birthdays have an outsized effect on human psychology — not just culturally, but measurably. A 2012 study in Psychological Science found that people are significantly more likely to make major life decisions — starting a business, ending a relationship, beginning a fitness habit — in the window surrounding their birthday. Researchers called this the fresh start effect: birthdays function as personal new years, prompting reflection and intention-setting in ways that arbitrary dates don't.

Knowing exactly how many days you have until your next birthday turns a vague future event into a concrete anchor. "My birthday is in a few months" produces no particular response. "My birthday is in 47 days" does something different — it makes the transition feel real and close enough to actually prepare for.

And if you're someone who dreads a particular birthday — turning 30, 40, 50 — knowing the exact countdown can paradoxically help. Rather than a looming abstract event, it becomes a specific date with a specific number of days. That specificity makes it manageable. It also gives you time to decide how you want to meet it: passively, or with intention.

SECTION: What the countdown tells you
Beyond the day count itself, your birthday countdown surfaces several useful things:

Day of the week — whether your birthday falls on a weekend or weekday shapes what kind of celebration is even possible.
Season — a winter birthday and a summer birthday have entirely different planning considerations.
Your half-birthday — the midpoint between two birthdays, increasingly recognised as its own occasion, particularly for children whose birthdays fall close to major holidays.
Your age on the next birthday — which is the number that matters for reflection, not the current one.

SECTION: Not all birthdays land the same way
September is the most common birth month in the US and UK — more people celebrate in September than any other month. If yours falls there, you share it with more people than almost anyone else born in the year.

February 29 birthdays only occur every four years. Leap day babies (called leaplings) technically have a real birthday once every four years — though most celebrate on February 28 or March 1 in non-leap years, depending on personal preference.

December 25 is statistically the rarest birthday in the US — hospitals schedule fewer births on Christmas Day, making it the least common date of the year. If you're a December 25 birthday, you're genuinely uncommon.

SECTION: Using the countdown as a personal reset
Some people use their birthday countdown as a planning anchor rather than waiting for January 1st — a cultural new year that may have no personal significance. The logic is simple: it's your year turning over, not the world's. Forty-seven days out from your birthday is a natural time to ask what you want the next 365 days to look like — before the noise of the day itself arrives.

This approach has real precedent. Several cultures treat the birthday as the more significant annual marker for exactly this reason: it's personal, not collective.

EEATBadges sources: ['Psychological Science Journal', 'Pew Research']
RelatedTools: /age-calculator, /days-until-birthday, /todays-birthdays, /celebrity-birthday
PageFAQ: use the 4 FAQ items from FAQSchema above

---

Commit after Group 1 with message: "feat(P1-A): age-in-days, age-in-seconds, birthday-countdown pages"

---

GROUP 2 — VS COMPARISON PAGES
Implement these 2 comparison pages. Follow AgeCalculatorPage.tsx structure but with comparison layout instead of calculator embed — structured prose sections, milestone tables where specified, no calculator component needed.

---

PAGE 4: src/pages/BiologicalAgeVsChronologicalAge.tsx
Route: /biological-age-vs-chronological-age
SEO title: "Biological Age vs Chronological Age — Which One Actually Matters?"
SEO description: "Chronological age counts the years. Biological age measures how your body is actually aging. The two can differ by over a decade — and only one of them can change."
SEO keywords: "biological age vs chronological age, biological age difference, what is biological age, chronological age meaning"
Canonical: /biological-age-vs-chronological-age

FAQSchema items:
Q: Can biological age be lower than chronological age?
A: Yes — and it's a good sign. A biological age lower than your chronological age means your body is aging more slowly than average for your birth year. It's associated with lower disease risk, better cognitive function, and longer healthy lifespan.

Q: How much can the two differ?
A: Studies show differences of 10–15 years in either direction are possible in healthy adult populations. Between an elite athlete and a long-term heavy smoker of the same chronological age, the gap can exceed 20 years.

Q: Is biological age testing accurate?
A: It depends on the method. Epigenetic clock testing has a margin of error of roughly 3–5 years. Lifestyle-based assessments like BornClock's are less precise but still useful for identifying areas for improvement and tracking change over time.

Q: At what age does the gap typically widen most?
A: Research suggests the gap widens most between ages 35 and 60 — when lifestyle choices have had the most cumulative time to affect cellular aging. After 70, genetic factors play a relatively larger role.

H1: Biological Age vs Chronological Age — Only One of These Can Change

Direct answer box content:
Your chronological age is fixed — it's simply the number of years since you were born, and it only moves forward. Your biological age is different: it measures how efficiently your body's cells, organs, and systems are functioning compared to population averages for your birth year. The two can differ by 10 years or more in either direction. And unlike your chronological age, your biological age can actually go down.

Page body sections — implement exactly as written below:

SECTION: The core difference — and why it matters
Chronological age is a calendar fact. It tells you how long you've existed. It says nothing about how well your body is doing the job of existing.

Biological age is a physiological reality. It reflects the actual state of your cardiovascular system, your metabolic function, your cellular integrity, your inflammatory burden. Two people born on the same day can have biological ages a decade apart — depending entirely on how they've lived.

This distinction matters enormously in medicine. A 60-year-old with the biological age of a 45-year-old has fundamentally different health risks, medication tolerances, and recovery capacity than a 60-year-old with a biological age of 70. Treating them identically because they share a birth year is, medically speaking, a mistake — and increasingly, clinicians are moving away from chronological age as the primary number in health assessments.

SECTION: How each is measured
Chronological age requires only your date of birth. No ambiguity, no measurement error. Simply the elapsed time since you were born.

Biological age has several measurement methods:
- Epigenetic clocks (most accurate) — measure DNA methylation patterns that change predictably with aging. Steve Horvath's 2013 epigenetic clock and the newer DunedinPACE clock are the gold standards. Available through commercial testing for $200–$500.
- Biomarker panels — assess blood markers (inflammatory proteins, glucose, lipid profiles, organ function) against age-matched population norms. Used in clinical settings.
- Lifestyle-based assessments (most accessible) — use validated inputs (BMI, blood pressure, exercise, sleep, diet, smoking, stress) to estimate biological age. Less precise than epigenetic clocks but free, immediate, and still directionally accurate. This is BornClock's approach.

SECTION: A note on finding out your biological age is higher than expected
If you test your biological age and the number comes back higher than your chronological age — maybe 5 years higher, maybe 10 — the first reaction for many people is something close to alarm. That's understandable.

But here's the important context: biological age is information, not a verdict. It's one of the few health numbers you can actually change. Unlike your chronological age, which only moves forward, your biological age can move backward. The research on this is now substantial — multiple intervention studies have found measurable reductions in biological age within weeks to months of lifestyle changes. The number exists so you can do something with it, not so you can feel helpless.

If your biological age is higher than expected, the question isn't "what does this mean about me?" It's "what do I want to do about it starting now?"

SECTION: Which one matters more — and when
For social purposes — birthdays, legal thresholds, retirement planning — chronological age is the relevant number.

For health purposes — understanding disease risk, planning preventive interventions, understanding why you feel the way you feel — biological age is far more meaningful. A 2021 study in Nature Aging found that biological age acceleration predicted all-cause mortality independently of chronological age, smoking status, and socioeconomic factors.

The gender dimension is worth noting here too. Women consistently have lower biological ages than men of the same chronological age across multiple measurement methods — a pattern that mirrors the well-documented female longevity advantage seen in life expectancy data globally.

SECTION: Can you change your biological age?
Chronological age moves in only one direction. Biological age can move both ways — and the evidence for lifestyle-driven reduction is now substantial.

A 2023 study in Aging Cell found that an 8-week intensive lifestyle intervention reduced biological age by an average of 2.5 years. A 2021 study found that diet alone — specifically a plant-rich diet high in folate, polyphenols, and fiber — reduced epigenetic age within 8 weeks. Blue Zone research consistently shows that lifestyle can produce biological ages 10–15 years younger than chronological peers by midlife.

The interventions with the strongest evidence: stopping smoking, improving sleep quality, regular vigorous exercise, reducing chronic stress, and shifting toward a predominantly plant-based diet.

EEATBadges sources: ['Nature Aging', 'Aging Cell Journal', 'WHO']
RelatedTools: /biological-age, /life-expectancy, /coach, /country-comparison
PageFAQ: use the 4 FAQ items above

---

PAGE 5: src/pages/LifeExpectancyIndiaVsUsa.tsx
Route: /life-expectancy-india-vs-usa
SEO title: "Life Expectancy India vs USA — The 6.6-Year Gap Explained"
SEO description: "India's life expectancy is 70.9 years; the USA's is 77.5. The gap has specific causes — and India is closing it faster than most people realize."
SEO keywords: "life expectancy India vs USA, India life expectancy 2026, USA life expectancy comparison, India USA health comparison"
Canonical: /life-expectancy-india-vs-usa

FAQSchema items:
Q: What is India's current life expectancy?
A: Approximately 70.9 years (UN World Population Prospects, 2023). Women average 72.3 years; men average 69.5 years.

Q: Why does the USA have higher life expectancy than India?
A: The primary drivers are healthcare infrastructure, lower rates of cardiovascular disease at young ages, better air quality in most regions, and lower road traffic mortality. However, the USA's advantage is shrinking — driven by the opioid crisis, gun violence, and high chronic disease rates.

Q: Is India's life expectancy improving?
A: Significantly. India has gained nearly 30 years of life expectancy since 1960 — one of the largest improvements of any nation in that period. The trend continues, driven by better maternal and infant care, expanded vaccination coverage, and economic development.

Q: Which Indian states have the highest life expectancy?
A: Kerala consistently leads with approximately 75–77 years — comparable to several European countries — driven by high literacy rates, better healthcare infrastructure, and lower infant mortality. Bihar and Uttar Pradesh have the lowest state-level figures.

H1: Life Expectancy in India vs USA — Why the Gap Exists and What's Changing

Direct answer box content:
India's average life expectancy is approximately 70.9 years (UN World Population Prospects, 2023). The USA's is approximately 77.5 years — a difference of 6.6 years. But here's the context that matters: in 1960, India's life expectancy was 41.4 years. It has nearly doubled in six decades — one of the most dramatic public health achievements of the 20th and 21st centuries. The gap is real, but the trajectory tells a different story.

Page body sections — implement exactly as written:

SECTION: Why the 6.6-Year Gap Exists
The difference between India and the USA isn't random or inevitable. Researchers point to several specific, measurable causes:

Healthcare access — India has approximately 0.7 hospital beds per 1,000 people; the USA has 2.9. Rural India in particular has significant gaps in emergency care, maternal health services, and chronic disease management. These gaps disproportionately affect life expectancy through higher infant and maternal mortality rates — deaths that pull the population average down significantly.

Cardiovascular disease at younger ages — India has one of the world's highest rates of cardiovascular disease mortality, and it strikes younger here than in Western populations. Indians are genetically predisposed to higher insulin resistance and central adiposity at lower BMI thresholds. The Indian Heart Association has documented that Indians experience heart attacks an average of 10 years earlier than Western populations — a profound difference in years of life lost.

Air quality — India has 9 of the world's 20 most polluted cities by PM2.5 concentration. The Energy Policy Institute at the University of Chicago estimated in 2023 that air pollution reduces average life expectancy across India by 2.6 years. That single factor accounts for a meaningful portion of the total gap.

Road traffic mortality — India's road traffic death rate is approximately 15.6 per 100,000 people, compared to 12.7 in the USA. Because road deaths disproportionately affect young adults — who have the most years of life remaining — the impact on average life expectancy is outsized.

SECTION: The gender dimension
In both countries, women outlive men — but the gap looks different in each.

In the USA, women live approximately 5.7 years longer than men (80.5 vs 74.8 years). In India, the gap is smaller but still present: women average 72.3 years, men 69.5 — a difference of about 2.8 years. India's gender gap in life expectancy is actually narrower than in most developed countries, partly because historical inequities in healthcare access and nutrition have disproportionately affected women — a gap that is gradually closing as female literacy, education, and economic participation improve.

SECTION: Where India is actually ahead
The comparison isn't entirely in the USA's favour.

Social connection — India's multigenerational family structures and strong community networks provide a protective effect that Western individualism often doesn't. US Surgeon General Vivek Murthy declared loneliness a public health epidemic in 2023. Social isolation is now classified as a cardiovascular risk factor comparable to smoking 15 cigarettes a day.

Traditional diet — Traditional South Indian vegetarian diets align remarkably closely with what longevity researchers describe as ideal: high legume intake, plant diversity, low ultra-processed food, fermented foods. The Blue Zone dietary pattern and a traditional South Indian thali look more similar than different.

Substance-related mortality — The USA's opioid crisis has meaningfully dragged down national life expectancy, particularly among working-age men. India has significantly lower rates of opioid addiction and alcohol-related mortality than the USA.

The USA's recent decline — US life expectancy fell from 78.8 years in 2019 to 76.1 years in 2021, driven by COVID-19, the opioid crisis, and gun violence. It has partially recovered since, but the USA's advantage over comparable wealthy nations has been shrinking for two decades.

SECTION: What this means for you personally
National life expectancy averages are population statistics. They describe the average, not your individual trajectory. An Indian with excellent lifestyle habits, access to good healthcare, and low environmental pollution exposure will likely outlive the national average significantly. An American with poor lifestyle habits and limited healthcare access may not reach the US average.

Your biological age, lifestyle choices, and healthcare access matter far more than your nationality for predicting your personal lifespan.

EEATBadges sources: ['UN World Population Prospects', 'WHO', 'Indian Heart Association', 'University of Chicago EPIC']
RelatedTools: /life-expectancy, /country-comparison, /biological-age, /coach
PageFAQ: use the 4 FAQ items above

---

Commit after Group 2 with message: "feat(P1-C): biological-age-vs-chronological-age, life-expectancy-india-vs-usa pages"

---

GROUP 3 — SUN VS MOON SIGN PAGE

PAGE 6: src/pages/SunVsMoonSign.tsx
Route: /sun-vs-moon-sign
SEO title: "Sun Sign vs Moon Sign — Which One Actually Describes You?"
SEO description: "Your sun sign is your public face. Your moon sign is your 2am self. Most people find their moon sign more accurate once they discover it. Here's why."
SEO keywords: "sun sign vs moon sign, difference between sun and moon sign, moon sign more accurate, sun moon sign astrology"
Canonical: /sun-vs-moon-sign

FAQSchema items:
Q: Can your sun and moon sign be the same?
A: Yes — this happens when the Moon is passing through the same sign as the Sun on your birthday, which occurs roughly once a month. People with matching sun and moon signs are said to have a particularly unified personality — their outward and inner selves are in close alignment.

Q: Which is more important — sun or moon sign?
A: They describe different things, so neither is universally more important. The sun sign describes your public self and conscious identity; the moon sign describes your emotional inner world. Most astrologers consider both equally important, alongside the rising sign, for a full picture.

Q: Do I need my birth time to find my moon sign?
A: Usually your birth date is sufficient. If the Moon was changing signs on your birth day, birth time helps narrow it down. BornClock will flag when this situation applies — and if it does, reading both candidate sign descriptions usually makes the right one obvious.

Q: Why do I feel my moon sign describes me better?
A: Many people do — particularly those who are more emotionally self-aware or introverted. The moon sign describes your private emotional world rather than your public face, which is often felt more personally than the sun sign's outward-facing personality traits.

H1: Sun Sign vs Moon Sign — Which One Is Actually You?

Direct answer box content:
Your sun sign is determined by where the Sun was on your birthday — it changes roughly every 30 days and represents your core identity and the self you show the world. Your moon sign is determined by where the Moon was at your birth — it changes every 2.5 days and represents your emotional inner world, your instincts, and the self you are when nobody's watching. If you've ever read your sun sign and thought "that's not quite me," your moon sign is usually the explanation.

Page body sections — implement exactly as written:

SECTION: Why most people only know their sun sign
Sun signs became the public face of astrology largely because of newspaper horoscope columns, which began in the 1930s. Horoscopes needed to apply to one-twelfth of all readers at once — so they used the sun sign, which only requires knowing your birth month. Simple, scalable, and ultimately reductive.

Professional astrologers consider the full birth chart — moon sign, rising sign, and planetary placements — to be far more descriptive of an individual than the sun sign alone. The sun sign is the broad stroke. The moon sign is where the portrait gets specific.

If you've never felt quite captured by your sun sign description, you're not unusual. Many people — particularly those who are introverted or emotionally self-aware — find their moon sign describes their inner experience far more accurately than the outward-facing sun sign personality.

SECTION: How each is calculated
Sun sign — The Sun takes approximately 365 days to travel through all 12 signs, spending roughly 30 days in each. Your sun sign is determined simply by your birth date. The boundaries are fixed and consistent year to year, with minor variation of a day or two for cusp births.

Moon sign — The Moon is much faster. It travels through all 12 signs in approximately 27.3 days, spending only about 2.5 days in each. Two people born in the same week can have different moon signs — and knowing your birth date alone isn't always enough if the Moon was changing signs on your birth day. For most dates, though, the birth date is sufficient.

SECTION: What each sign governs
Your sun sign governs: core identity and sense of self, ego and conscious personality, how you present yourself to the world, your relationship with ambition and recognition, long-term direction and life goals.

Your moon sign governs: emotional responses and instincts, what makes you feel safe and nurtured, subconscious patterns and habitual reactions, how you behave in close relationships, what you need to feel emotionally secure, your 2am self — the one that surfaces when the performance of day is over.

SECTION: The most common experience
Astrologers frequently note that people identify more with their sun sign in professional settings and their moon sign in personal ones. A Capricorn sun — ambitious, disciplined, status-aware — with a Pisces moon — sensitive, emotionally fluid, quietly empathetic — will present very differently at work than at home. They may feel that the Pisces moon describes their inner life more honestly than the Capricorn sun ever has.

This split is why "I don't relate to my sign" is such a consistent experience. If you only know your sun sign, you're only seeing the public layer.

EEATBadges sources: ['Astrology tradition', 'Psychological research on personality']
RelatedTools: /moon-sign, /zodiac, /compatibility, /vedic-zodiac
PageFAQ: use the 4 FAQ items above

---

Commit after Group 3 with message: "feat: sun-vs-moon-sign page"

---

GROUP 4 — ANSWER PAGES
Implement these 4 answer pages. Follow WhatIsMyBiologicalAge.tsx exactly — breadcrumb schema, article schema, FAQ schema as inline JSON-LD script tags, AnswerLayout wrapper, indigo highlight box, prose sections with h2 headings, RelatedTools at bottom.

For datePublished and dateModified use "2026-08-06" for all pages.

---

ANSWER PAGE 1: src/pages/answers/WhatIsMyMoonSign.tsx
Route: /answers/what-is-my-moon-sign
SEO title: "What Is My Moon Sign? How to Find It by Date of Birth | BornClock"
SEO description: "Your moon sign is where the Moon was when you were born — and it changes every 2.5 days, making it far more personal than your sun sign. Find yours free on BornClock."
Canonical: /answers/what-is-my-moon-sign

Breadcrumb schema: Home > FAQ > What is my moon sign?
Article schema headline: "What Is My Moon Sign — and Why It's Probably More 'You' Than Your Sun Sign"

FAQ schema:
Q: Do I need my birth time to find my moon sign?
A: Usually your birth date is enough. If you were born on a day when the Moon changed signs, birth time helps. BornClock flags when this applies. If you don't know your time and you're in a transitional window, read both candidate sign descriptions — your gut will usually know which one is right.

Q: Is my moon sign the same as my rising sign?
A: No — these are calculated differently. Your moon sign comes from the Moon's position at your birth. Your rising sign (ascendant) comes from which zodiac sign was rising on the eastern horizon at your exact birth time and location. They can be the same sign coincidentally, but they're independent calculations.

Q: Can two people born on the same day have different moon signs?
A: Yes — if they were born on a day when the Moon changed signs. Someone born at 3am may have a different moon sign than someone born at 11pm on the same date.

Q: What if I don't know my birth time?
A: For most birth dates, the moon sign is determinable from the date alone. If you were born during a transition and don't know your time, read both candidate signs — most people find one feels obviously right and one doesn't.

H1: What Is My Moon Sign — and Why It's Probably More "You" Than Your Sun Sign

Direct answer box:
Your moon sign is the zodiac sign the Moon was passing through at the moment of your birth. The Moon moves through all 12 signs every 27.3 days — roughly 2.5 days per sign — so it's far more individual than your sun sign, which one-twelfth of the population shares. In most cases, your birth date alone is enough to find it. Most people who discover their moon sign for the first time say the same thing: "that's actually me."

Body sections — implement exactly:

SECTION: What the moon sign reveals
Your sun sign describes how you present yourself to the world — your public personality, your ambitions, your conscious identity. Your moon sign describes what happens underneath: your emotional responses, your instincts under pressure, what you need to feel safe, and how you behave when you're completely at ease.

Think of the sun sign as your daytime self — the one colleagues and acquaintances see. The moon sign is your 2am self — the one that surfaces when you're tired, stressed, or fully relaxed with someone you trust completely.

This is why so many people feel their moon sign describes them more accurately than their sun sign. Most of our inner life happens in moon sign territory: processing emotion, navigating intimacy, reacting instinctively before our rational, public sun sign personality has a chance to catch up.

SECTION: How to find your moon sign
BornClock's calculator identifies which sign the Moon was in on your birth date. For most dates, this is sufficient — the Moon spends about 2.5 days in each sign, so on most days it's clearly in one sign throughout the day.

If you were born on a day when the Moon was transitioning between signs, birth time improves accuracy. BornClock will flag this when it applies. If you don't know your birth time and you're in that transitional window, the practical approach is to read both candidate sign descriptions — most people find one resonates clearly and the other feels like a stranger.

The Moon changes signs roughly every 2.5 days, which means even siblings born a few days apart can have different moon signs — giving them meaningfully different emotional personalities despite sharing the same family, the same home, and much of the same environment.

SECTION: The 12 moon signs — what they feel like from the inside
Render as a styled list:
- Aries Moon — emotionally direct, quick to react, needs independence to feel secure. Processes feelings through action, not conversation.
- Taurus Moon — emotionally stable and comfort-seeking, deeply loyal once attached. Needs physical security and routine to feel settled.
- Gemini Moon — emotionally curious, processes feelings through talking and writing. Needs variety and mental stimulation to feel at ease.
- Cancer Moon — deeply empathetic, home-oriented, highly intuitive about others' emotional states. Feels things profoundly and remembers everything.
- Leo Moon — needs warmth, recognition, and genuine affection. Generous emotionally, loyal, and occasionally dramatic in equal measure.
- Virgo Moon — processes emotions through analysis rather than expression. Shows care through practical help rather than words.
- Libra Moon — needs harmony and partnership. Emotionally uncomfortable with conflict, sometimes to the point of avoiding necessary confrontations.
- Scorpio Moon — emotionally intense, private, and deeply perceptive. Slow to trust but, once trust is established, loyal in a way few other signs match.
- Sagittarius Moon — needs freedom and optimism. Emotionally expansive and resistant to heaviness, sometimes avoiding difficult feelings through distraction.
- Capricorn Moon — emotionally self-contained, expresses care through responsibility and reliability. Needs structure and purpose to feel secure.
- Aquarius Moon — emotionally detached but deeply humanitarian. Needs intellectual connection rather than emotional intensity.
- Pisces Moon — deeply empathetic, emotionally porous, absorbs others' feelings easily. Needs solitude to recover from the emotional weight of the world.

SECTION: Why it matters for relationships
In relationship astrology, the moon sign is considered more important than the sun sign for long-term compatibility — because it governs emotional needs, intimacy patterns, and what each person requires to feel safe and understood.

Two people with compatible moon signs will often intuitively understand each other's emotional language, even if their sun signs would traditionally clash. Two people with incompatible moon signs may struggle with sustained intimacy regardless of how well their surface personalities get along — because they need different things at the emotional core.

CTA link after body: Link to /moon-sign with text "Find my moon sign →"
RelatedTools: /moon-sign, /zodiac, /compatibility, /sun-vs-moon-sign, /vedic-zodiac

---

ANSWER PAGE 2: src/pages/answers/WhatAffectsLifeExpectancyMost.tsx
Route: /answers/what-affects-life-expectancy-most
SEO title: "What Affects Life Expectancy Most? What a Harvard Study Found | BornClock"
SEO description: "A Harvard study of 123,000 people found 5 habits that add up to 14 extra years of life. Genetics matters less than you think. Here's what the evidence actually shows."
Canonical: /answers/what-affects-life-expectancy-most

Breadcrumb: Home > FAQ > What affects life expectancy most?
Article headline: "What Affects Life Expectancy the Most? The Answer Might Surprise You"

FAQ schema:
Q: How much does genetics affect life expectancy?
A: Studies of identical twins raised apart suggest genetics accounts for approximately 20–30% of lifespan variation. For most people, lifestyle choices have a larger influence on longevity than inherited genes.

Q: What is the single most impactful change for life expectancy?
A: If you smoke, stopping is the highest-impact single change available. For non-smokers, regular physical activity has the strongest and most consistent evidence across the largest number of studies.

Q: Does stress affect life expectancy?
A: Yes — chronic stress is associated with accelerated cellular aging (measured through telomere length), higher cardiovascular disease risk, and impaired immune function. A study in PLOS Medicine found that high perceived stress levels were associated with a 2.8-year reduction in life expectancy.

Q: How much does diet matter compared to exercise?
A: Both matter significantly, and they interact — combining them is more protective than either alone. Diet has a somewhat larger effect on chronic disease risk overall, while exercise has particularly strong effects on cardiovascular health, cognitive function, and all-cause mortality. Neither replaces the other.

H1: What Affects Life Expectancy the Most? The Answer Might Surprise You

Direct answer box:
The five factors that most affect individual life expectancy are smoking status, physical activity, diet quality, body weight, and alcohol consumption. Harvard researchers tracked 123,000 Americans over three decades and found that people who maintained all five healthy habits by age 50 lived an average of 14 years longer (women) and 12 years longer (men) than those with none. Genetics, by contrast, accounts for only about 20–30% of how long you live. The rest is largely within your control.

Body sections — implement exactly:

SECTION: What Harvard found when they tracked 123,000 people for 30 years
The study, published in Circulation in 2018, was one of the largest long-term examinations of lifestyle and mortality ever conducted. Researchers followed participants from the Health Professionals Follow-Up Study and the Nurses' Health Study — tracking their habits, health events, and deaths over three decades.

The finding was striking: five specific lifestyle factors accounted for the majority of premature deaths in the United States. People who maintained all five healthy habits had 74% fewer cardiovascular deaths and 65% fewer cancer deaths compared to those who maintained none. The researchers estimated that if Americans broadly adopted these habits, half of all premature deaths could be prevented.

Half. That's not a marginal improvement — it's a restructuring of what human lifespan looks like in practice.

SECTION: The five factors — what the evidence actually shows
Implement each as a bold sub-heading followed by paragraph:

1. Smoking — the single largest modifiable factor
Smoking is the leading cause of preventable death globally, killing more than 8 million people per year according to the WHO. Heavy smokers lose an average of 10 years of life expectancy compared to non-smokers. The recovery timeline after quitting is genuinely encouraging: within 20 minutes, heart rate drops; within a year, cardiovascular risk halves; within 15 years, risk approaches that of a lifelong non-smoker. The body forgives faster than most people expect.

2. Physical activity — the closest thing medicine has to a longevity drug
A 2022 analysis in the British Journal of Sports Medicine found that 150–300 minutes of moderate aerobic activity per week was associated with a 21% lower risk of all-cause mortality. More is better up to a point, but the biggest gains come from moving from sedentary to any regular activity at all. Even 10–15 minutes of daily walking, consistently sustained, shows meaningful mortality risk reduction in large studies. The barrier is lower than people think.

3. Diet — patterns over decades, not individual foods
No single food is the key to longevity, and no single food is the villain. What matters is the long-term dietary pattern sustained over years. The strongest evidence points to diets rich in vegetables, legumes, whole grains, nuts, and fish — and lower in ultra-processed foods, added sugar, and processed meat. The Mediterranean diet and DASH diet have the most robust longevity evidence. Blue Zone populations eat diets that are 90–95% plant-based — but they also share meals socially, eat until only 80% full, and treat food as pleasure rather than optimization.

4. Body weight — specifically where fat is stored
Obesity is associated with significantly increased risk of cardiovascular disease, type 2 diabetes, several cancers, and sleep apnea. But BMI alone is an imperfect measure — it doesn't distinguish between muscle and fat, or between subcutaneous fat and visceral fat around organs. Waist-to-height ratio — your waist circumference divided by your height — is a better predictor of cardiovascular risk. A ratio below 0.5 is associated with meaningfully lower metabolic disease risk.

5. Alcohol — the most nuanced factor, and the most misunderstood
Earlier research suggested moderate drinking was protective for cardiovascular health — the so-called J-curve effect. More recent and methodologically rigorous studies have significantly weakened this finding. The current WHO position is that no level of alcohol consumption is definitively safe from a cancer risk perspective. Moderate drinking appears to have a small net effect on lifespan — neither dramatically harmful nor clearly beneficial. Heavy drinking, consistently, reduces lifespan. And longevity is built on patterns over decades, not on any single habit in isolation.

SECTION: A word on genetics
Many people assume their genes largely determine how long they live. Twin studies — which separate genetic from environmental factors by comparing identical twins raised in different environments — consistently find that genetics accounts for only about 20–30% of variation in lifespan. The environment and lifestyle choices account for the remaining 70–80%.

Even people with strong family histories of cardiovascular disease or cancer can significantly modify their personal risk through lifestyle. Genes load the gun; lifestyle largely decides whether it fires.

CTA link: Link to /life-expectancy with text "Calculate my life expectancy →"
RelatedTools: /life-expectancy, /biological-age, /coach, /country-comparison

---

ANSWER PAGE 3: src/pages/answers/WhatIsEpigeneticAge.tsx
Route: /answers/what-is-epigenetic-age
SEO title: "What Is Epigenetic Age? The Science of Biological Aging | BornClock"
SEO description: "Epigenetic age measures biological aging at the DNA level — and it can be reduced. Here's how it works, what it predicts, and what the latest research shows."
Canonical: /answers/what-is-epigenetic-age

Breadcrumb: Home > FAQ > What is epigenetic age?
Article headline: "What Is Epigenetic Age — and Why It's the Most Honest Number About How You're Aging"

FAQ schema:
Q: How is epigenetic age different from biological age?
A: Epigenetic age is one specific method of measuring biological age — currently the most scientifically accurate one available. Biological age is the broader concept; epigenetic age is the DNA methylation-based measurement of that concept.

Q: How do I find out my epigenetic age?
A: Commercial tests are available from companies including TruDiagnostic and Elysium Health, typically costing $200–$500 for a blood or saliva sample. BornClock's biological age calculator offers a lifestyle-based estimate using 12 validated biomarkers — less precise, but free and immediately accessible.

Q: Is epigenetic aging reversible?
A: The evidence increasingly suggests yes — to a meaningful degree. Multiple intervention studies have found 2–5 year reductions in epigenetic age within weeks to months of lifestyle changes. The DunedinPACE clock can show whether your current pace of aging is actually slowing in response to what you're doing.

Q: Can stress change your epigenetic age?
A: Yes — significantly. Chronic psychological stress is one of the most consistent drivers of epigenetic age acceleration. Long-term caregiving stress, in particular, has been associated with measurably faster biological aging in multiple studies.

H1: What Is Epigenetic Age — and Why It's the Most Honest Number About How You're Aging

Direct answer box:
Epigenetic age is a measure of biological aging based on DNA methylation — chemical changes to your DNA that accumulate in predictable patterns as you age. It was pioneered by UCLA geneticist Steve Horvath in 2013 and is currently the most scientifically validated way to measure how fast your body is aging at a cellular level. Unlike your chronological age, which only moves forward, epigenetic age can — with the right interventions — actually go down.

Body sections — implement exactly:

SECTION: A useful way to think about it
Think of your DNA sequence as a computer's hardware — the fixed physical architecture you were born with. The epigenome is the software: it decides which programs (genes) actually run, when they run, and at what intensity. The hardware doesn't change much over a lifetime. The software changes constantly — shaped by what you eat, how you sleep, how much you move, what you're exposed to, and how much stress you carry.

DNA methylation is one of the most studied of these software changes. It involves the attachment of small chemical tags — methyl groups — to specific locations on the DNA strand. As you age, the pattern of methylation at thousands of specific sites across your genome shifts in ways that scientists have now mapped in detail.

Steve Horvath discovered that by measuring the methylation status at 353 carefully chosen sites, he could estimate a person's biological age with an accuracy of roughly 3–5 years — using only a blood or saliva sample. The clock works across almost every tissue type in the body, which is what made it so significant.

SECTION: The major epigenetic clocks
Horvath Clock (2013) — The original, trained on 51 tissue types. Measures accumulated biological aging across most cell types in the body.

Hannum Clock (2013) — Developed simultaneously and independently. Trained specifically on blood samples; slightly better for blood-based aging estimates.

PhenoAge Clock (2018) — Developed by Morgan Levine. Combines methylation data with clinical biomarkers and is better at predicting age-related diseases and mortality than the original Horvath clock.

DunedinPACE Clock (2022) — Currently considered the gold standard for tracking lifestyle interventions. Rather than measuring accumulated aging, it measures the pace of aging right now — how fast you're aging per calendar year. A score above 1.0 means you're aging faster than one year per year; below 1.0 means you're aging more slowly. This makes it particularly useful for seeing whether lifestyle changes are actually working.

SECTION: What epigenetic age predicts
Epigenetic age acceleration — when your biological age runs ahead of your chronological age — is associated with: higher all-cause mortality independently of chronological age, increased cardiovascular disease risk, higher cancer risk, faster cognitive decline and earlier dementia onset, and reduced physical capacity and earlier frailty.

A 2016 study in Aging found that epigenetic age acceleration predicted time to death more accurately than 14 other established biomarkers combined. That's not a small finding.

SECTION: Can epigenetic age actually go down?
Yes — and this is where the research gets genuinely exciting.

A 2021 randomized controlled trial by researcher Kara Fitzgerald found that an 8-week diet and lifestyle intervention — involving a specific plant-rich diet, targeted supplementation, exercise, sleep optimization, and stress management — reduced epigenetic age by an average of 3.23 years compared to the control group. The intervention group got measurably biologically younger. The control group got older.

Factors consistently associated with lower epigenetic age in large studies: regular vigorous exercise, plant-rich diet, not smoking, quality sleep, and maintaining social connections. Factors associated with higher epigenetic age: smoking, obesity, chronic stress, heavy alcohol use, social isolation, and caregiving stress. A 2020 study found that people caring for chronically ill spouses showed significantly accelerated epigenetic aging compared to age-matched controls.

CTA link: Link to /biological-age with text "Test my biological age →"
RelatedTools: /biological-age, /life-expectancy, /coach, /biological-age-vs-chronological-age

---

ANSWER PAGE 4: src/pages/answers/WhatIsVedicAstrology.tsx
Route: /answers/what-is-vedic-astrology
SEO title: "What Is Vedic Astrology? Why Your Sign Is Probably Different | BornClock"
SEO description: "Vedic astrology uses a different zodiac than Western — which is why your Vedic sign is usually one sign behind. Plus what Vedic astrology actually emphasizes that Western doesn't."
Canonical: /answers/what-is-vedic-astrology

Breadcrumb: Home > FAQ > What is Vedic astrology?
Article headline: "What Is Vedic Astrology — and Why Are You Probably a Different Sign?"

FAQ schema:
Q: Why is my Vedic sign different from my Western sign?
A: Because the two systems use different zodiacs. Western uses the tropical zodiac (anchored to seasons); Vedic uses the sidereal zodiac (anchored to actual star positions). Due to 2,000 years of drift in Earth's axis (precession of the equinoxes), the two are now about 23–24 degrees apart — enough to shift most people one sign back in the Vedic system.

Q: Which is more accurate — Vedic or Western astrology?
A: Neither has been validated as predictively accurate by peer-reviewed science. Within their respective traditions, both are considered complete systems. Vedic has a stronger predictive tradition through the dasha system; Western has a stronger psychological focus. Many people find one resonates more than the other — and some use both.

Q: What is the most important sign in Vedic astrology?
A: The moon sign (Rashi) is considered primary — more important than the sun sign for personality. The birth nakshatra is considered even more fundamental by many Vedic astrologers.

Q: Is kundali matching still used for marriages in India?
A: Yes — widely. Kundali milan involves matching 36 qualities (gunas) between prospective couples' charts, with 18 or more considered the minimum for compatibility. It remains standard practice across much of India, including in educated urban families.

H1: What Is Vedic Astrology — and Why Are You Probably a Different Sign?

Direct answer box:
Vedic astrology (Jyotisha — Sanskrit for "science of light") is an ancient Indian system with roots stretching back over 5,000 years. It differs from Western astrology primarily in the zodiac it uses: Vedic astrology uses the sidereal zodiac, based on the actual positions of constellations as observed from Earth. Western astrology uses the tropical zodiac, anchored to the seasons. Because of a phenomenon called the precession of the equinoxes, the two zodiacs have drifted about 23–24 degrees apart — enough to shift most people back one full sign. If you've always been a Western Scorpio, you're probably a Vedic Libra.

Body sections — implement exactly:

SECTION: The identity moment
For many people, discovering their Vedic sign triggers something unexpected: a quiet identity crisis. You've spent years — maybe decades — reading about your Western sign, identifying with its traits, explaining yourself through it. And now someone is telling you that you're actually something else.

Here's the thing: you're not. Both are right, and both describe something real about you. They're just measuring different things.

Your Western sign tells you about your relationship to the seasons — specifically, the season in which your life began. Your Vedic sign tells you about your relationship to the actual star constellations visible in the sky at your birth. Neither is the "true" sign. They're two different lenses on the same person. Many people find that once they let go of the identity attachment, both signs describe something real — one more outward, one more deep.

SECTION: Why the signs are different — the actual explanation
The Western tropical zodiac is anchored to the seasons. Aries begins at the spring equinox (around March 21) regardless of where the Aries constellation physically is in the sky. This system was standardized roughly 2,000 years ago — when the equinox point did align with the Aries constellation. But Earth's axis wobbles over time, in a cycle called the precession of the equinoxes, causing the equinox point to drift slowly backward through the constellations at about 1 degree every 72 years.

Over 2,000 years, that drift adds up to approximately 23–24 degrees — just enough to shift most people back one zodiac sign in the Vedic sidereal system, which tracks the actual constellations rather than the seasonal calendar.

This is not a mistake in either system. It's a difference in what each system is measuring.

SECTION: What Vedic astrology actually emphasizes
The moon sign is primary — In Vedic astrology, the moon sign (Rashi) is considered more important than the sun sign for understanding personality and making predictions. When an Indian says "my sign is Scorpio," they almost always mean their moon sign, not their sun sign.

Nakshatras (lunar mansions) — The zodiac is divided into 27 nakshatras, each spanning 13°20'. Your birth nakshatra — determined by the Moon's exact position — is considered your most fundamental astrological signature in the Vedic tradition. It's more specific and personal than either sun or moon sign.

Dashas (planetary time periods) — Vedic astrology uses a sophisticated system of planetary periods called dashas, predicting which planetary influence will dominate different phases of your life. This predictive dimension has no real equivalent in Western astrology and is one of the reasons Vedic astrology has remained a living, widely practiced tradition in India.

Karma and dharma — Vedic astrology is philosophically embedded in Hindu concepts of karma and dharma. It's traditionally understood as a tool for understanding one's karmic path — not just personality, but purpose, timing, and the lessons a particular lifetime is meant to offer.

SECTION: Vedic astrology in everyday Indian life
Vedic astrology remains genuinely integrated into daily life across India in ways that Western astrology is not. Marriage compatibility checks (kundali milan) are still conducted before many weddings, including in educated urban families. Auspicious timing (muhurta) is consulted for business launches, house purchases, and major surgeries. Naming ceremonies traditionally use the birth nakshatra as a guide for the first syllable of a child's name.

Several Indian universities offer postgraduate degrees in Jyotisha. It is taught alongside Ayurveda in some traditional educational institutions. This is not a fringe practice — it's a living tradition with millions of active practitioners.

CTA link: Link to /vedic-zodiac with text "Find my Vedic sign →"
RelatedTools: /vedic-zodiac, /moon-sign, /compatibility, /sun-vs-moon-sign

---

Commit after Group 4 with message: "feat(P1-B): 4 answer pages — moon sign, life expectancy, epigenetic age, vedic astrology"

---

FINAL STEPS:
1. Add all new routes to src/App.tsx — verify every route is present:
   /age-in-days, /age-in-seconds, /birthday-countdown,
   /biological-age-vs-chronological-age, /life-expectancy-india-vs-usa,
   /sun-vs-moon-sign,
   /answers/what-is-my-moon-sign, /answers/what-affects-life-expectancy-most,
   /answers/what-is-epigenetic-age, /answers/what-is-vedic-astrology

2. Run tsc — must be 0 errors

3. Run npm run build — must complete successfully

4. Run: npx playwright test e2e/gauntlet/ e2e/prelaunch/ --reporter=line
   Fix any failures. Never weaken assertions. Fix product bugs only.

5. Verify build page count has increased from previous count

6. Final commit if any fixes needed: "fix: post-SEO-batch-1 test fixes"

7. Report back:
   - All 10 routes confirmed working (list them)
   - tsc status
   - Test results
   - Build page count before and after
   - Any issues found

DO NOT PUSH. Manual push only.
