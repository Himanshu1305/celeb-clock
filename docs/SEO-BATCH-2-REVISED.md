DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.

Read docs/PROJECT_CONTEXT.md first. Then read these files completely before writing any code:
- src/pages/AgeInDays.tsx (calculator page pattern — inline RELATED array)
- src/pages/answers/WhatIsMyBiologicalAge.tsx (answer page pattern)
- src/pages/EditorialPolicy.tsx (editorial policy current state)
- src/pages/LifeExpectancy.tsx (longevity cluster reference + CountryComparison import pattern)
- src/pages/BiologicalAge.tsx (biological age page structure)
- src/pages/MoonSignPage.tsx (astrology page structure)
- src/pages/CountryComparison.tsx (CountryComparison component usage)
- src/App.tsx (routing — read ALL existing routes before adding new ones)
- src/components/Navigation.tsx (exploreItems array — count existing items before adding)
- src/context/BirthDateContext.tsx (context provider — needed for widget)
- functions/_worker.ts (routing and headers — check for X-Frame-Options)
- e2e/prelaunch/batch-9.spec.ts (test pattern to follow for new tests)
- e2e/gauntlet/gauntlet.spec.ts (gauntlet pattern)

Execute ALL groups in sequence. Commit after each GROUP with the specified message.
After every commit: run tsc --noEmit and confirm 0 errors before proceeding to next group.

---

GLOBAL RULES:
- Follow AgeInDays.tsx structure exactly for all calculator/content pages
- Use inline RELATED array pattern: const RELATED = [{ path: '...', label: '...' }]
- All new routes must be added to src/App.tsx — verify no conflict with existing routes first
- tsc must be 0 errors after every commit
- Never use: "comprehensive", "dive into", "delve", "groundbreaking", "revolutionize", "leverage"
- Content must be humanized — not AI-patterned. Match the voice of existing pages exactly.
- "built" ≠ "run and passed" — every page must be prerendered and title-verified
- DO NOT PUSH

---

GROUP 1 — COUNTRY LONGEVITY PAGES (P1-D)
10 new pages. Each targets "life expectancy in [country]" queries.

BEFORE WRITING ANY PAGE:
1. Read how CountryComparison component is imported and used in src/pages/CountryComparison.tsx
2. Count current exploreItems in Navigation.tsx — note the number
3. Verify /life-expectancy-india-vs-usa already exists in App.tsx (it does — do not duplicate)

Page structure for each:
- Navigation + AuthNav header
- SEO component (unique title/description/keywords/canonicalUrl per page)
- WebApplicationSchema
- FAQSchema (4 real questions, country-specific)
- H1
- Direct answer paragraph (key stat upfront, 2-3 sentences)
- 4 prose sections with h2 headings (genuine country-specific content, not generic)
- CountryComparison component embedded
- RELATED array: [/life-expectancy, /country-comparison, /biological-age, /coach]
- Footer

All life expectancy figures from UN World Population Prospects 2023.

─────────────────────────────────────────────
PAGE 1: src/pages/LifeExpectancyIndia.tsx
Route: /life-expectancy-india
SEO title: "Life Expectancy in India — 2026 Data, Causes & How to Beat the Average"
SEO description: "India's life expectancy is 70.9 years (2023). Here's what drives it, how it compares globally, and what Indian adults can do to outlive the national average."
SEO keywords: "life expectancy India, India life expectancy 2026, average lifespan India, how long do Indians live"
H1: Life Expectancy in India — What the Numbers Actually Mean
Direct answer: India's average life expectancy is 70.9 years as of 2023 (UN World Population Prospects). Women average 72.3 years; men average 69.5 years. India has gained nearly 30 years of life expectancy since 1960 — one of the fastest improvements of any large nation in history.
Section 1 h2: Why 70.9 Years — The Key Drivers
Content: Healthcare access gap (India 0.7 hospital beds per 1,000 vs global average 2.7); cardiovascular disease strikes Indians 10 years earlier than Western populations (Indian Heart Association); air pollution costs 2.6 years per EPIC 2023; road traffic mortality 15.6 per 100,000.
Section 2 h2: Where India Is Closing the Gap Fast
Content: Kerala at 75-77 years matches European countries; female literacy correlation with health outcomes; vaccination coverage improvement; maternal mortality decline from 556 in 1990 to 97 in 2023 per WHO.
Section 3 h2: Where India Punches Above Its Weight
Content: Multigenerational family structures protect against loneliness — now a WHO-classified mortality risk comparable to smoking 15 cigarettes daily; traditional plant-rich diets in South India align with Blue Zone research; lower substance-related mortality than USA.
Section 4 h2: What This Means for You Personally
Content: National averages describe populations not individuals; lifestyle factors account for 70-80% of lifespan variation per twin studies; your biological age and habits matter more than your nationality; link to /biological-age and /life-expectancy tools.
FAQs:
Q: What is India's life expectancy in 2026?
A: Based on UN World Population Prospects 2023 data, India's life expectancy is approximately 70.9 years. Women average 72.3 years and men 69.5 years. This is expected to continue rising as healthcare access expands.
Q: Which Indian state has the highest life expectancy?
A: Kerala consistently leads with approximately 75-77 years — comparable to several European countries — driven by high female literacy rates, better healthcare infrastructure, and lower infant mortality. Bihar and Uttar Pradesh have the lowest figures at around 64-66 years.
Q: Why do Indians get heart attacks earlier than Western populations?
A: Indians are genetically predisposed to higher insulin resistance and central adiposity at lower BMI thresholds. The Indian Heart Association has documented that Indians experience heart attacks an average of 10 years earlier than Western populations — making cardiovascular health particularly important for Indian adults from their 30s onwards.
Q: How has India's life expectancy changed over time?
A: India's life expectancy has nearly doubled since 1960, when it stood at just 41.4 years. The improvement is driven by better maternal and infant care, expanded vaccination coverage, reduced infectious disease burden, and economic development — one of the most dramatic public health achievements of the 20th and 21st centuries.

─────────────────────────────────────────────
PAGE 2: src/pages/LifeExpectancyUSA.tsx
Route: /life-expectancy-usa
SEO title: "Life Expectancy in the USA — 2026 Data, the Decline & What It Means"
SEO description: "US life expectancy is 77.5 years — but it fell sharply in 2020-21 and hasn't fully recovered. Here's why, and what Americans can do about it."
SEO keywords: "life expectancy USA, US life expectancy 2026, American lifespan, average life expectancy United States"
H1: Life Expectancy in the USA — Why It Fell and Where It Stands Now
Direct answer: The United States life expectancy is approximately 77.5 years as of 2023. Women average 80.5 years; men average 74.8 years. US life expectancy fell from 78.8 years in 2019 to 76.1 years in 2021 — driven by COVID-19, the opioid crisis, and gun violence — and has only partially recovered.
Section 1 h2: The Dramatic Fall — What Happened Between 2019 and 2021
Content: COVID-19 direct deaths; opioid crisis killing 80,000+ per year; gun violence mortality 12.2 per 100,000; these three factors account for most of the 2.7-year drop — unprecedented for a wealthy nation in peacetime.
Section 2 h2: Why the USA Underperforms vs Comparable Wealthy Nations
Content: USA spends more per capita on healthcare than any other country yet ranks 40th+ in life expectancy; lack of universal coverage creates mortality gaps; higher obesity rates (36%) vs France (17%); food environment dominated by ultra-processed products.
Section 3 h2: Where the USA Does Well
Content: Medical innovation; cancer survival rates among highest globally; access to specialist care for insured patients; strong emergency medicine infrastructure.
Section 4 h2: The State-by-State Gap Is Enormous
Content: Hawaii leads at approximately 81 years; Mississippi trails at approximately 71 years — a 10-year gap within one country; zip code is one of the strongest predictors of lifespan in the USA; income and race compound geography.
FAQs:
Q: What is the current US life expectancy?
A: Approximately 77.5 years as of 2023. Women average 80.5 years and men 74.8 years. This is below the OECD average for wealthy nations, which sits around 80 years.
Q: Why did US life expectancy drop so sharply?
A: US life expectancy fell from 78.8 years in 2019 to 76.1 years in 2021 — the largest two-year drop since World War II. The primary causes were COVID-19 deaths, the opioid epidemic (80,000+ deaths per year), and gun violence. It has partially recovered since but has not returned to pre-pandemic levels.
Q: Which US state has the highest life expectancy?
A: Hawaii leads with approximately 81 years, followed by California, Minnesota, and Massachusetts. Mississippi has the lowest at around 71 years — a 10-year gap that reflects dramatic differences in healthcare access, poverty rates, and lifestyle factors across states.
Q: How does US life expectancy compare to other wealthy countries?
A: The USA spends more per capita on healthcare than any other country but ranks below most comparable wealthy nations in life expectancy. Japan (84.3), Switzerland (83.4), Australia (83.2), and most of Western Europe all have higher life expectancy despite lower healthcare spending.

─────────────────────────────────────────────
PAGE 3: src/pages/LifeExpectancyJapan.tsx
Route: /life-expectancy-japan
SEO title: "Life Expectancy in Japan — Why Japan Lives Longest & What We Can Learn"
SEO description: "Japan's life expectancy is 84.3 years — the highest of any large nation. The reasons are specific, evidence-based, and partially replicable anywhere."
SEO keywords: "life expectancy Japan, why does Japan live longest, Japanese longevity, Japan average lifespan"
H1: Life Expectancy in Japan — Why the Japanese Live Longest and What Science Says About It
Direct answer: Japan's average life expectancy is 84.3 years — the highest of any large nation on Earth (UN World Population Prospects 2023). Women average 87.1 years; men average 81.1 years. Japan has held this position for decades, and the reasons are specific and well-studied.
Section 1 h2: The Japanese Diet — What Actually Drives Longevity
Content: High fish consumption; fermented foods (miso, natto, pickles); plant diversity; low ultra-processed food intake; small portion sizes — ichiju sansai meal structure (one soup, three sides); the Okinawa diet specifically studied in Blue Zone research with 90%+ plant-based intake.
Section 2 h2: Social and Cultural Factors
Content: Ikigai — sense of purpose linked to lower dementia and mortality; strong community bonds; lower social isolation than Western nations; walking as default transport; active aging culture where elderly remain socially engaged longer; moai social support groups in Okinawa.
Section 3 h2: The Healthcare System's Role
Content: Universal coverage since 1961; emphasis on preventive care and regular screening; lower rates of obesity — 4.3% vs 36% in USA; low smoking rates after decades of public health campaigns; high hospital density.
Section 4 h2: What Anyone Can Take From the Japanese Model
Content: The specific replicable habits — walking more, eating more fish and fermented foods, maintaining strong social connections, having a clear sense of purpose — these work regardless of nationality. Hara hachi bu (eat until 80% full) is achievable anywhere. The lifestyle, not the genetics, is the primary driver.
FAQs:
Q: What is Japan's life expectancy?
A: Japan's average life expectancy is 84.3 years as of 2023. Women average 87.1 years — the highest female life expectancy of any country — and men average 81.1 years. Japan has consistently ranked among the top countries for longevity for over 40 years.
Q: Why do Japanese people live so long?
A: Research points to several converging factors: a diet high in fish, vegetables, and fermented foods with low ultra-processed content; strong social connections and sense of purpose (ikigai); universal healthcare with prevention emphasis; very low obesity rates (4.3%); and high physical activity through daily walking.
Q: What is the Okinawa longevity secret?
A: Okinawa — Japan's southernmost prefecture — is a Blue Zone with one of the world's highest concentrations of centenarians. Traditional Okinawan diet is 90%+ plant-based, very low in calories, and high in sweet potato, tofu, and bitter melon. Okinawans also practice hara hachi bu — eating until 80% full — and maintain moai social support groups throughout life.
Q: Is Japan's longevity advantage declining?
A: Somewhat. As younger Japanese generations adopt more Westernized diets and lifestyles, the longevity advantage is narrowing slightly. Okinawa in particular has shifted away from traditional eating patterns partly due to US military base influence. However, Japan still holds the global top position.

─────────────────────────────────────────────
PAGE 4: src/pages/LifeExpectancyUK.tsx
Route: /life-expectancy-uk
SEO title: "Life Expectancy in the UK — 2026 Data, Regional Gaps & Key Drivers"
SEO description: "UK life expectancy is 81.3 years, but there's a 10-year gap between the healthiest and least healthy regions. Here's what the data shows."
SEO keywords: "life expectancy UK, United Kingdom life expectancy 2026, British lifespan, average life expectancy England"
H1: Life Expectancy in the UK — The National Average and the Regional Reality
Direct answer: The United Kingdom's average life expectancy is approximately 81.3 years as of 2023. Women average 83.1 years; men average 79.4 years. The UK has some of the most dramatic regional life expectancy gaps of any wealthy nation — up to 12 years between the healthiest and least healthy areas.
Section 1 h2: The North-South Divide
Content: Glasgow male life expectancy 73 years vs Kensington & Chelsea 85 years — a 12-year gap within one country; poverty, unemployment, diet, and healthcare access all contribute; the 'Glasgow effect' — worse health outcomes than comparable European cities even after controlling for deprivation is a documented phenomenon researchers are still studying.
Section 2 h2: How the NHS Affects Longevity
Content: Universal coverage since 1948 ensures basic access; strong preventive care programs; but growing waiting times and declining GP access post-COVID affecting outcomes; NHS backlog now considered a secondary mortality risk.
Section 3 h2: UK vs Comparable European Nations
Content: UK (81.3) sits below France (82.3), Spain (83.3), Switzerland (83.4); higher obesity rates than most of Western Europe; higher alcohol consumption in some regions; historically higher smoking rates now declining.
Section 4 h2: What's Actually Improving
Content: Smoking rates at historic lows; cancer survival improving significantly; cardiovascular mortality declining; life expectancy at 65 is competitive with European peers — the gap is mainly in younger age mortality driven by avoidable causes.
FAQs:
Q: What is the UK's life expectancy in 2026?
A: Approximately 81.3 years based on 2023 UN data. Women average 83.1 years and men 79.4 years. England has slightly higher figures than Scotland, Wales, and Northern Ireland.
Q: Why is there such a big regional gap in UK life expectancy?
A: The gap between healthiest and least healthy UK regions reaches 10-12 years. Main drivers are deprivation, unemployment, diet quality, housing conditions, and healthcare access. Scotland — particularly Glasgow — has historically had worse outcomes than comparable European cities even after controlling for socioeconomic factors.
Q: How does UK life expectancy compare to Europe?
A: The UK sits below the Western European average. France (82.3), Spain (83.3), Italy (82.9), and Switzerland (83.4) all have higher life expectancy. The gap is attributed to higher UK obesity rates, higher alcohol consumption in some regions, and historically higher smoking rates.
Q: Did COVID significantly affect UK life expectancy?
A: Yes — UK life expectancy fell by approximately 1.3 years between 2019 and 2021. It has largely recovered since, though NHS waiting list backlogs are now considered a secondary mortality risk affecting tens of thousands of patients annually.

─────────────────────────────────────────────
PAGE 5: src/pages/LifeExpectancyAustralia.tsx
Route: /life-expectancy-australia
SEO title: "Life Expectancy in Australia — 2026 Data & Why Australians Live So Long"
SEO description: "Australia's life expectancy is 83.2 years — among the highest in the world. Here's what drives it and where the gaps remain."
SEO keywords: "life expectancy Australia, Australian lifespan 2026, how long do Australians live, Australia longevity"
H1: Life Expectancy in Australia — Why Australians Are Among the World's Longest-Lived
Direct answer: Australia's average life expectancy is approximately 83.2 years as of 2023 — one of the highest of any nation. Women average 85.2 years; men average 81.2 years. Australia has maintained this position for decades through universal healthcare, outdoor lifestyle culture, and strong public health investment.
Section 1 h2: What Drives Australian Longevity
Content: Universal Medicare since 1984; high outdoor physical activity; strong food safety standards; lower smoking rates than most comparable nations; diverse immigration bringing dietary variety including Mediterranean and Asian food cultures in urban centres.
Section 2 h2: The Indigenous Health Gap
Content: Aboriginal and Torres Strait Islander Australians have life expectancy approximately 8 years lower than non-Indigenous Australians — one of the largest such gaps of any wealthy nation; driven by poorer healthcare access in remote communities, socioeconomic disadvantage, and long-term health impacts of historical policies; closing this gap is a stated national priority.
Section 3 h2: Australia vs Comparable Nations
Content: Ranks alongside Switzerland, Japan, and Spain at the top of global longevity tables; outperforms UK (81.3) and USA (77.5) significantly; comparable to Scandinavian countries; consistently in top 10 globally for both male and female life expectancy.
Section 4 h2: Australian Lifestyle Factors Researchers Study
Content: Outdoor culture and high sun exposure — though skin cancer risk is a countervailing factor requiring attention; Mediterranean-influenced diet in urban populations; strong social networks; relatively low work stress compared to East Asian economies; high walkability in coastal cities.
FAQs:
Q: What is Australia's life expectancy?
A: Approximately 83.2 years as of 2023. Women average 85.2 years and men 81.2 years. Australia consistently ranks in the top 5-10 countries globally for life expectancy.
Q: Why do Australians live so long?
A: Several factors contribute: universal Medicare providing healthcare access to all residents; high rates of outdoor physical activity; strong food safety regulation; relatively low smoking rates; and a diverse diet influenced by Mediterranean and Asian food cultures in major cities.
Q: Is there a life expectancy gap between Indigenous and non-Indigenous Australians?
A: Yes — a significant one. Aboriginal and Torres Strait Islander Australians have a life expectancy approximately 8 years lower than non-Indigenous Australians, attributed to higher rates of chronic disease, poorer healthcare access in remote communities, and socioeconomic disadvantage. Closing this gap is a stated priority of the Australian government.
Q: How does Australian life expectancy compare to the UK and USA?
A: Australia (83.2) significantly outperforms both UK (81.3) and USA (77.5) — a gap of nearly 6 years over the USA. The difference is attributed to universal healthcare, lower obesity rates, more active lifestyles, and stronger social safety nets.

─────────────────────────────────────────────
PAGE 6: src/pages/LifeExpectancyCanada.tsx
Route: /life-expectancy-canada
SEO title: "Life Expectancy in Canada — 2026 Data, Provincial Differences & Key Factors"
SEO description: "Canada's life expectancy is 82.3 years. Here's what drives it, how provinces compare, and why Canada outperforms the USA by nearly 5 years."
SEO keywords: "life expectancy Canada, Canadian lifespan 2026, how long do Canadians live, Canada longevity"
H1: Life Expectancy in Canada — Why Canadians Outlive Americans by 5 Years
Direct answer: Canada's average life expectancy is approximately 82.3 years as of 2023. Women average 84.6 years; men average 80.1 years. Canada consistently outperforms the United States by approximately 5 years — largely due to universal healthcare, lower gun violence, lower opioid mortality, and stronger social safety nets.
Section 1 h2: Canada vs USA — Why the 5-Year Gap Exists
Content: Universal healthcare since 1966 eliminates financial barriers; gun violence mortality Canada 2.1 per 100,000 vs USA 12.2; lower opioid death rates; lower obesity rates; stronger social safety nets reducing poverty-related mortality. The gap has widened over the past two decades as the US opioid crisis worsened.
Section 2 h2: Provincial Differences
Content: British Columbia leads followed closely by Ontario; Quebec and Alberta slightly below national average; rural and remote provinces face access challenges; Indigenous communities face significant health gaps similar to Australia — a national priority.
Section 3 h2: What Canada Does Well
Content: Strong public health infrastructure; high vaccination rates consistently among OECD leaders; effective cancer screening programs; relatively low air pollution in most regions; high levels of education correlated with health literacy and preventive behavior.
Section 4 h2: Challenges Ahead
Content: Aging population putting pressure on healthcare system; opioid crisis has worsened particularly in BC; mental health service gaps widening; climate change affecting northern communities with extreme weather and food security implications.
FAQs:
Q: What is Canada's life expectancy?
A: Approximately 82.3 years as of 2023. Women average 84.6 years and men 80.1 years. Canada ranks among the top 20 countries globally for life expectancy.
Q: Why does Canada have higher life expectancy than the USA?
A: The primary factors are universal healthcare (eliminating financial barriers to treatment), significantly lower gun violence mortality, lower opioid death rates, lower obesity rates, and stronger social safety nets that reduce poverty-related mortality.
Q: Which Canadian province has the highest life expectancy?
A: British Columbia consistently leads, followed closely by Ontario. Both benefit from large urban populations with good healthcare access, lower smoking rates, and diverse populations. Rural and remote provinces, as well as Indigenous communities, face significantly lower life expectancy.
Q: How does Canada compare to other G7 nations on life expectancy?
A: Canada (82.3) ranks in the middle of G7 nations — below Japan (84.3), France (82.7), and Italy (82.9), but above Germany (80.6), the UK (81.3), and significantly above the USA (77.5).

─────────────────────────────────────────────
PAGE 7: src/pages/LifeExpectancyGermany.tsx
Route: /life-expectancy-germany
SEO title: "Life Expectancy in Germany — 2026 Data, East-West Gap & Key Drivers"
SEO description: "Germany's life expectancy is 80.6 years — below most Western European neighbours. Here's why, including the persistent east-west divide."
SEO keywords: "life expectancy Germany, German lifespan 2026, how long do Germans live, Germany longevity"
H1: Life Expectancy in Germany — Strong Healthcare, But Below Its European Neighbours
Direct answer: Germany's average life expectancy is approximately 80.6 years as of 2023. Women average 83.2 years; men average 78.2 years. Despite having one of the world's most advanced healthcare systems, Germany ranks below most Western European neighbours — largely due to higher smoking rates, higher alcohol consumption, and a rising obesity rate.
Section 1 h2: Why Germany Underperforms vs France, Spain, and Italy
Content: Higher smoking prevalence than southern European neighbours; higher alcohol consumption; rising obesity — 25% of adults obese vs 17% in France; less Mediterranean dietary pattern; more sedentary urban lifestyles in northern regions.
Section 2 h2: The East-West Divide
Content: Former East Germany still shows lower life expectancy than former West Germany — a gap that persisted for decades after 1990 reunification; now mostly closed but still visible in rural eastern states; attributed to higher unemployment, economic stress, and historically different healthcare infrastructure.
Section 3 h2: Where Germany Excels
Content: World-class hospitals and specialist care; strong occupational health and safety standards; statutory health insurance coverage for all residents; excellent emergency medicine; among the world's lowest wait times for specialist care.
Section 4 h2: Improving Trends
Content: Smoking rates declining; cancer screening uptake increasing; cardiovascular mortality declining significantly since 1990; life expectancy at 65 is competitive with European peers — the underperformance is concentrated in working-age mortality from preventable causes.
FAQs:
Q: What is Germany's life expectancy?
A: Approximately 80.6 years as of 2023. Women average 83.2 years and men 78.2 years. Germany ranks in the middle of Western European nations — below France, Spain, and Italy but above Central and Eastern European neighbours.
Q: Why is German life expectancy lower than France or Spain?
A: The primary factors are higher smoking rates, higher alcohol consumption, and a rising obesity rate. Germany also has a less Mediterranean dietary pattern than southern European nations — research consistently links Mediterranean diet to lower cardiovascular disease mortality.
Q: Is there still a life expectancy difference between East and West Germany?
A: The gap has nearly closed since reunification in 1990, but some difference persists in rural eastern states. At peak, East Germans lived 3-4 years less than West Germans. The remaining gap is attributed to higher unemployment rates and historically different healthcare infrastructure in some eastern regions.
Q: How does Germany's healthcare system compare globally?
A: Germany has one of the world's most comprehensive healthcare systems — universal coverage through statutory health insurance, very high hospital density, and among the lowest wait times of any universal system. Despite this, life expectancy outcomes rank below expectation because lifestyle factors dominate population-level longevity more than healthcare quality alone.

─────────────────────────────────────────────
PAGE 8: src/pages/LifeExpectancyChina.tsx
Route: /life-expectancy-china
SEO title: "Life Expectancy in China — 2026 Data, the Dramatic Rise & Regional Gaps"
SEO description: "China's life expectancy is 78.2 years — up from 43 in 1960. Here's one of history's most dramatic health transformations and what still drives gaps."
SEO keywords: "life expectancy China, Chinese lifespan 2026, how long do Chinese live, China longevity"
H1: Life Expectancy in China — One of History's Most Dramatic Health Transformations
Direct answer: China's average life expectancy is approximately 78.2 years as of 2023. Women average 81.1 years; men average 75.5 years. China has gained over 34 years of life expectancy since 1960 — from 43.7 years to 78.2 — one of the most rapid improvements ever recorded for a large population.
Section 1 h2: The Extraordinary Rise
Content: From 43.7 in 1960 to 78.2 in 2023 — driven by economic growth, improved nutrition, expanded healthcare access, vaccination programs, and reduced infectious disease; China now approaches Western European levels in life expectancy and has higher figures than many middle-income countries.
Section 2 h2: The Urban-Rural Divide
Content: Shanghai and Beijing residents have life expectancy above 83 years — comparable to Japan; rural inland provinces remain 10+ years behind; healthcare access, income, and pollution exposure all contribute to this internal gap which mirrors global inequality patterns.
Section 3 h2: The Smoking Challenge
Content: China has the world's largest tobacco market — 300+ million smokers, predominantly male; this is the primary driver of the 5.6-year gender gap; male smoking rates remain above 50%; projected to cause 1 million additional deaths annually by 2030 if rates do not decline.
Section 4 h2: Air Pollution's Toll and Improvement
Content: China's rapid industrialization created severe air quality challenges; PM2.5 exposure estimated to reduce life expectancy by 2-3 years in heavily polluted areas; improving since 2015 as clean air policies take effect — Beijing's PM2.5 levels have fallen over 50% since 2013 per Chinese environmental data.
FAQs:
Q: What is China's life expectancy?
A: Approximately 78.2 years as of 2023. Women average 81.1 years and men 75.5 years — a 5.6-year gender gap largely driven by very high male smoking rates.
Q: How fast has China's life expectancy improved?
A: Extremely fast. China went from 43.7 years in 1960 to 78.2 years in 2023 — a gain of 34.5 years in 63 years. This is one of the most rapid life expectancy improvements ever recorded for a large population.
Q: Why is life expectancy so different between Shanghai and rural China?
A: Shanghai and Beijing residents have life expectancy above 83 years — comparable to Japan. Rural inland provinces average 10+ years less. The gap is driven by dramatically different healthcare access, income levels, air quality, diet, and occupational risk.
Q: Does smoking significantly affect Chinese life expectancy?
A: Yes — substantially. China has the world's largest tobacco market with over 300 million smokers, predominantly male. Male smoking rates above 50% are the primary driver of the large gender gap in life expectancy and are projected to cause 1 million additional deaths annually by 2030 if rates do not decline.

─────────────────────────────────────────────
PAGE 9: src/pages/LifeExpectancySingapore.tsx
Route: /life-expectancy-singapore
SEO title: "Life Expectancy in Singapore — Why This City-State Ranks Among the World's Best"
SEO description: "Singapore's life expectancy is 83.5 years — one of the highest globally. Here's how a city-state with no natural resources built one of the world's healthiest populations."
SEO keywords: "life expectancy Singapore, Singapore lifespan 2026, how long do Singaporeans live, Singapore longevity"
H1: Life Expectancy in Singapore — How a City-State Built One of the World's Healthiest Populations
Direct answer: Singapore's average life expectancy is approximately 83.5 years as of 2023 — one of the highest of any nation. Women average 85.9 years; men average 81.2 years. Singapore achieved this with no natural resources and a population of only 5.9 million — through deliberate, evidence-based public health policy sustained over 60 years.
Section 1 h2: How Singapore Built Its Health System
Content: Mandatory health savings accounts (Medisave) since 1984 ensuring everyone has funds for care; universal primary care; highly regulated food environment with strict safety standards; anti-smoking laws since 1970 among the world's earliest; strong investment in public housing with walkable design reducing sedentary behavior.
Section 2 h2: Diet and Lifestyle Factors
Content: Singapore's multicultural population — Chinese, Malay, Indian — brings dietary diversity; hawker centre culture emphasizes freshly cooked food over ultra-processed; high walkability in urban design; low car dependency in a city-state where public transport is the default; active commuting built into daily life.
Section 3 h2: Preventive Healthcare Emphasis
Content: Regular health screening subsidized by government; strong maternal and infant care; very low infant mortality — 2.2 per 1,000 births; proactive chronic disease management; high vaccination rates; health literacy programs in schools sustained over decades.
Section 4 h2: What Singapore Shows About Intentional Public Health
Content: Life expectancy doesn't require natural wealth or large land area — it requires consistent, evidence-based policy sustained over decades; Singapore's experience is studied globally as a model for what deliberate health investment can achieve regardless of starting conditions.
FAQs:
Q: What is Singapore's life expectancy?
A: Approximately 83.5 years as of 2023. Women average 85.9 years and men 81.2 years. Singapore consistently ranks in the top 5 globally — extraordinary for a nation with no natural resources and a population under 6 million.
Q: Why does Singapore have such high life expectancy?
A: Singapore's longevity results from deliberate policy sustained over 60 years: mandatory health savings (Medisave), strong preventive healthcare, strict anti-smoking laws since 1970, highly regulated food safety, walkable urban design, and universal primary care access.
Q: How does Singapore compare to Japan on life expectancy?
A: Singapore (83.5) and Japan (84.3) both rank among the world's longest-lived populations and often trade the top positions. Japan's advantage comes from dietary tradition and culture; Singapore's from deliberate health policy and urban design. Both demonstrate that high life expectancy at scale is achievable.
Q: Is Singapore's model replicable for larger countries?
A: Partially. Singapore benefits from its small size — policy changes can be implemented rapidly across 5.9 million people in a single urban area. Scaling to India or the USA with diverse geography, politics, and income levels is far harder. But specific elements — preventive savings, walkable design, strong food regulation — are studied and adapted globally.

─────────────────────────────────────────────
PAGE 10: src/pages/LifeExpectancyBrazil.tsx
Route: /life-expectancy-brazil
SEO title: "Life Expectancy in Brazil — 2026 Data, Inequality & Regional Gaps"
SEO description: "Brazil's life expectancy is 74.6 years. Here's how inequality, violence, and regional gaps shape Brazilian longevity — and what's improving."
SEO keywords: "life expectancy Brazil, Brazilian lifespan 2026, how long do Brazilians live, Brazil longevity"
H1: Life Expectancy in Brazil — Progress, Inequality, and the Regional Divide
Direct answer: Brazil's average life expectancy is approximately 74.6 years as of 2023. Women average 78.5 years; men average 70.9 years — a large 7.6-year gender gap driven significantly by high male homicide and accident rates. Brazil has improved substantially since 1960 (when life expectancy was 54 years) but inequality remains the central challenge.
Section 1 h2: The Inequality Dimension
Content: Brazil has one of the world's highest income inequality measures; wealthy São Paulo neighborhoods have life expectancy above 80 years; poor northeastern regions average 10-12 years less; race compounds this — Afro-Brazilian populations face significantly higher mortality at younger ages reflecting historical inequities in education, income, and healthcare access.
Section 2 h2: Violence as a Health Crisis
Content: Brazil has one of the world's highest homicide rates at 22.4 per 100,000; this disproportionately kills young men and is the primary driver of the 7.6-year gender gap; road accident mortality is also among the highest in Latin America; these are structural causes, not individual lifestyle choices.
Section 3 h2: SUS — Brazil's Universal Health System
Content: Sistema Único de Saúde provides universal coverage to all Brazilians since 1988; one of the world's largest public health systems; the Família Saúde community health program — putting health workers directly into communities — is credited with reducing infant mortality by 75% in the northeast and is studied globally as a model.
Section 4 h2: What's Actually Improving
Content: Childhood immunization rates among the highest globally; HIV treatment program internationally recognized; infant mortality fell from 60 per 1,000 in 1990 to 13 in 2023; cardiovascular mortality declining; diabetes management improving in urban areas; cancer screening expanding.
FAQs:
Q: What is Brazil's life expectancy?
A: Approximately 74.6 years as of 2023. Women average 78.5 years and men 70.9 years. Brazil has improved significantly from 54 years in 1960 but faces persistent inequality challenges that create large gaps between regions and income groups.
Q: Why is there such a large gender gap in Brazilian life expectancy?
A: The 7.6-year gap between women and men is primarily driven by high male homicide rates and road accident mortality. Brazil has one of the world's highest homicide rates at 22.4 per 100,000, with young men disproportionately affected. Workplace accident rates and higher male smoking rates also contribute.
Q: How does inequality affect life expectancy in Brazil?
A: Dramatically. Wealthy neighborhoods in São Paulo have life expectancy above 80 years — comparable to Western Europe. Poor northeastern regions average 10-12 years less. Race compounds this: Afro-Brazilian populations face significantly higher mortality rates at every age compared to white Brazilians.
Q: What is Brazil's SUS healthcare system?
A: SUS (Sistema Único de Saúde) is Brazil's constitutional universal health system providing free healthcare to all Brazilians since 1988. The Família Saúde community health program — which places health workers directly in communities — is credited with dramatically reducing infant mortality in the northeast and is studied as a model globally.

─────────────────────────────────────────────
After completing all 10 pages:
1. Add all 10 routes to src/App.tsx — verify no conflicts
2. Add to exploreItems in Navigation.tsx (append after existing items — count first, flag if total exceeds 15):
   { path: '/life-expectancy-india', label: 'Life Expectancy in India', emoji: '🇮🇳' },
   { path: '/life-expectancy-usa', label: 'Life Expectancy in USA', emoji: '🇺🇸' },
   { path: '/life-expectancy-japan', label: 'Life Expectancy in Japan', emoji: '🇯🇵' },
   { path: '/life-expectancy-uk', label: 'Life Expectancy in UK', emoji: '🇬🇧' },
   { path: '/life-expectancy-australia', label: 'Life Expectancy in Australia', emoji: '🇦🇺' },
   { path: '/life-expectancy-canada', label: 'Life Expectancy in Canada', emoji: '🇨🇦' },
   { path: '/life-expectancy-germany', label: 'Life Expectancy in Germany', emoji: '🇩🇪' },
   { path: '/life-expectancy-china', label: 'Life Expectancy in China', emoji: '🇨🇳' },
   { path: '/life-expectancy-singapore', label: 'Life Expectancy in Singapore', emoji: '🇸🇬' },
   { path: '/life-expectancy-brazil', label: 'Life Expectancy in Brazil', emoji: '🇧🇷' },
3. Run tsc --noEmit — 0 errors required
4. Verify all 10 new routes exist in App.tsx (grep to confirm)
5. Commit: "feat(P1-D): 10 country longevity pages"

---

GROUP 2 — HINDI LANDING PAGES (P1-G)
5 new pages targeting India vernacular search.
All TSX files must be saved as UTF-8. Devanagari text must be inline string literals, not escaped Unicode.
After creating each file, verify the file contains actual Devanagari characters (not \u0000 sequences) by running: head -5 src/pages/[filename].tsx
Embed the most relevant existing calculator component. Wrap in BirthDateContext provider if needed (check if AgeCalculator requires it by reading its source first).

─────────────────────────────────────────────
PAGE 1: src/pages/HindiAgeCalculator.tsx
Route: /meri-umar-kitni-hai
SEO title: "मेरी उम्र कितनी है — Age Calculator in Hindi | BornClock"
SEO description: "अपनी सटीक उम्र जानें — साल, महीने, दिन, घंटे और सेकंड में। BornClock का मुफ्त age calculator हिंदी में।"
SEO keywords: "meri umar kitni hai, age calculator hindi, meri age kya hai, umar calculator"
H1: मेरी उम्र कितनी है?
Direct answer paragraph (Hindi): आपकी उम्र सिर्फ साल में नहीं मापी जाती। BornClock आपको बताता है कि आप कितने दिन, कितने घंटे और कितने सेकंड जी चुके हैं। अपनी जन्म तिथि डालें और तुरंत जानें।
Section 1 h2: उम्र कैसे calculate होती है?
Content: उम्र calculate करने के लिए आपकी जन्म तिथि से आज की तारीख घटाई जाती है। इसमें leap years को भी गिना जाता है — हर 4 साल में एक extra दिन आता है। BornClock यह सब automatically करता है और हर सेकंड आपकी उम्र update करता है।
Section 2 h2: दिनों में उम्र क्यों जानें?
Content: 30 साल का इंसान लगभग 10,957 दिन जी चुका होता है। यह संख्या देखकर अहसास होता है कि समय कितना कीमती है। कई लोगों को पता नहीं होता कि वे अपने 10,000वें दिन को बिना celebrate किए गुजर देते हैं।
Section 3 h2: BornClock क्या-क्या बताता है?
Content: उम्र के अलावा BornClock आपको biological age, life expectancy, zodiac sign, numerology, और celebrity birthday twin भी बताता है — सिर्फ आपकी जन्म तिथि से। सब कुछ मुफ्त, कोई sign-up नहीं।
Embed: AgeCalculator component
RELATED: /age-calculator, /age-in-days, /biological-age, /life-expectancy

─────────────────────────────────────────────
PAGE 2: src/pages/HindiLifeExpectancy.tsx
Route: /jivan-kal-calculator
SEO title: "जीवन काल Calculator — Life Expectancy in Hindi | BornClock"
SEO description: "आप कितने साल जिएंगे? BornClock का मुफ्त life expectancy calculator आपकी lifestyle के आधार पर आपका जीवन काल बताता है।"
SEO keywords: "jivan kal calculator, life expectancy hindi, kitne saal jienge, umra calculator hindi"
H1: आप कितने साल जिएंगे?
Direct answer paragraph: आपका जीवन काल आपकी जन्म तिथि नहीं, आपकी lifestyle तय करती है। Harvard के एक अध्ययन में 1.23 लाख लोगों को 30 साल तक track किया गया। नतीजा: 5 healthy habits अपनाने वाले लोग औसतन 14 साल ज्यादा जीते हैं।
Section 1 h2: जीवन काल क्या होता है?
Content: Life expectancy वह औसत उम्र है जितनी एक इंसान जीने की उम्मीद कर सकता है। भारत में यह 70.9 साल है (2023)। लेकिन यह एक औसत है — आपकी personal life expectancy आपकी habits पर निर्भर करती है।
Section 2 h2: भारत में औसत जीवन काल
Content: Kerala में life expectancy 75-77 साल है जो कई European देशों जितनी है। Bihar और UP में यह 64-66 साल है। यह फर्क genetics में नहीं, healthcare access और lifestyle में है।
Section 3 h2: जीवन काल बढ़ाने के 5 तरीके
Content: Harvard research के अनुसार: (1) smoking न करें, (2) रोज 30 मिनट exercise करें, (3) healthy diet लें, (4) healthy weight बनाए रखें, (5) alcohol सीमित रखें। इन पांचों को अपनाने से 14 साल ज्यादा जीने की संभावना बढ़ती है।
Embed: LifeExpectancy component
RELATED: /life-expectancy, /biological-age, /life-expectancy-india, /coach

─────────────────────────────────────────────
PAGE 3: src/pages/HindiNumerology.tsx
Route: /numerology-hindi
SEO title: "Numerology in Hindi — अंक ज्योतिष by Date of Birth | BornClock"
SEO description: "अपना life path number जानें। BornClock का मुफ्त numerology calculator हिंदी में — जन्म तिथि से अपना अंक ज्योतिष जानें।"
SEO keywords: "numerology hindi, ank jyotish, life path number hindi, numerology by date of birth hindi"
H1: अंक ज्योतिष — अपना Life Path Number जानें
Direct answer paragraph: अंक ज्योतिष (Numerology) में माना जाता है कि आपकी जन्म तिथि के अंक आपके स्वभाव और जीवन के उद्देश्य के बारे में बताते हैं। सबसे महत्वपूर्ण है आपका Life Path Number — यह वैसे ही है जैसे astrology में sun sign।
Section 1 h2: Life Path Number क्या होता है?
Content: Life Path Number आपकी पूरी जन्म तिथि के अंकों को जोड़कर निकाला जाता है। यह 1 से 9 के बीच होता है (कुछ systems में 11, 22, 33 को master numbers माना जाता है)। यह number आपके core personality और जीवन की दिशा बताता है।
Section 2 h2: अपना Life Path Number कैसे निकालें?
Content: उदाहरण: जन्म तिथि 15 अगस्त 1990। 1+5 = 6, 8 = 8, 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1। अब 6+8+1 = 15 → 1+5 = 6। तो Life Path Number = 6। BornClock यह calculation automatically करता है।
Section 3 h2: सभी Life Path Numbers का अर्थ (संक्षेप में)
Content: 1-Leader, 2-Diplomat, 3-Creative, 4-Builder, 5-Freedom-seeker, 6-Nurturer, 7-Seeker (analytical), 8-Achiever, 9-Humanitarian। (Brief Hindi description for each.)
Embed: NumerologyPage component
RELATED: /numerology, /zodiac, /moon-sign, /compatibility

─────────────────────────────────────────────
PAGE 4: src/pages/HindiZodiac.tsx
Route: /rashifal-by-date-of-birth
SEO title: "राशिफल by Date of Birth — Zodiac Sign in Hindi | BornClock"
SEO description: "अपनी राशि जानें जन्म तिथि से। BornClock का मुफ्त zodiac calculator हिंदी में — Western और Vedic दोनों।"
SEO keywords: "rashifal by date of birth, rashi by date of birth, apni rashi jane, zodiac hindi"
H1: अपनी राशि जानें — Zodiac by Date of Birth
Direct answer paragraph: आपकी राशि आपकी जन्म तिथि से तय होती है। Western astrology में 12 राशियाँ हैं जो सूर्य की स्थिति पर आधारित हैं। Vedic astrology में चंद्रमा की स्थिति (moon sign या rashi) को ज्यादा महत्वपूर्ण माना जाता है।
Section 1 h2: Western और Vedic राशि में क्या फर्क है?
Content: Western astrology tropical zodiac use करती है जो seasons पर आधारित है। Vedic (Indian) astrology sidereal zodiac use करती है जो actual star positions पर आधारित है। इसलिए अक्सर आपकी Vedic राशि Western राशि से एक पीछे होती है।
Section 2 h2: 12 राशियाँ और उनके गुण
Content: मेष (Aries) — साहसी, नेतृत्व; वृष (Taurus) — स्थिर, विश्वसनीय; मिथुन (Gemini) — जिज्ञासु, बुद्धिमान; कर्क (Cancer) — भावनात्मक, देखभाल करने वाले; सिंह (Leo) — आत्मविश्वासी, उदार; कन्या (Virgo) — विश्लेषणात्मक, व्यवहारिक; तुला (Libra) — संतुलित, न्यायप्रिय; वृश्चिक (Scorpio) — गहन, रहस्यमय; धनु (Sagittarius) — स्वतंत्र, आशावादी; मकर (Capricorn) — महत्वाकांक्षी, अनुशासित; कुम्भ (Aquarius) — नवाचारी, मानवतावादी; मीन (Pisces) — संवेदनशील, कल्पनाशील।
Section 3 h2: Moon Sign क्यों ज्यादा important है?
Content: Indian astrology में moon sign (rashi) को sun sign से ज्यादा महत्वपूर्ण माना जाता है। Moon sign आपकी भावनाओं, आंतरिक स्वभाव और relationships को दर्शाती है। जब कोई भारतीय "मेरी राशि मेष है" कहता है, तो वे अक्सर अपनी moon sign की बात कर रहे होते हैं।
Embed: Zodiac component
RELATED: /zodiac, /vedic-zodiac, /moon-sign, /compatibility

─────────────────────────────────────────────
PAGE 5: src/pages/HindiBiologicalAge.tsx
Route: /biological-age-hindi
SEO title: "Biological Age in Hindi — आपका शरीर कितना पुराना है? | BornClock"
SEO description: "आपकी biological age आपकी असली उम्र से 10 साल कम या ज्यादा हो सकती है। BornClock का मुफ्त test हिंदी में।"
SEO keywords: "biological age hindi, body age calculator hindi, jism ki umar, biological age test hindi"
H1: आपकी Biological Age क्या है?
Direct answer paragraph: Biological age वह उम्र है जो आपका शरीर actually जी रहा है — आपके जन्म प्रमाण पत्र की उम्र नहीं। दो लोग जो एक ही दिन पैदा हुए हों, उनकी biological age 10 साल तक अलग हो सकती है — उनकी lifestyle के आधार पर।
Section 1 h2: Biological Age और Chronological Age में क्या फर्क है?
Content: Chronological age वह है जो आपके birth certificate पर लिखी है। Biological age वह है जो आपके cells, organs और body systems की actual condition बताती है। एक 50 साल का व्यक्ति जो अच्छी lifestyle जीता है, उसकी biological age 40 हो सकती है।
Section 2 h2: Biological Age क्या तय करती है?
Content: नींद की गुणवत्ता, खान-पान, exercise, stress level, smoking, alcohol — ये सब मिलकर आपकी biological age तय करते हैं। Harvard research के अनुसार genetics केवल 20-30% role play करती है। बाकी 70-80% आपके हाथ में है।
Section 3 h2: क्या Biological Age कम हो सकती है?
Content: हाँ — और इसके वैज्ञानिक प्रमाण हैं। 2023 में Aging Cell journal में published एक study में पाया गया कि 8 हफ्तों के lifestyle intervention से biological age औसतन 2.5 साल कम हुई। सबसे असरदार बदलाव: smoking छोड़ना, नींद सुधारना, regular exercise।
Embed: BiologicalAge component
RELATED: /biological-age, /life-expectancy, /biological-age-vs-chronological-age, /coach

─────────────────────────────────────────────
After completing all 5 Hindi pages:
1. For each file, verify Devanagari renders correctly by running:
   grep -c "[\u0900-\u097F]" src/pages/HindiAgeCalculator.tsx
   (Each should return a number > 0, not 0)
   If any return 0, the file has encoding issues — re-save as UTF-8.
2. Add all 5 routes to src/App.tsx
3. Run tsc --noEmit — 0 errors required
4. Commit: "feat(P1-G): 5 Hindi landing pages"

---

GROUP 3 — INTERNAL LINKING UPGRADE (P1-H)
Read each target file completely before editing. Add only the specified RELATED routes.
Do not remove any existing related links. Do not change any prose content.
After each file edit, run tsc --noEmit to catch errors immediately.

CRITICAL: Before adding any path to a RELATED array, verify that path exists in src/App.tsx.
If a path does not exist yet, skip it and note it in the commit message.

LONGEVITY CLUSTER:
Edit src/pages/LifeExpectancy.tsx — add to RELATED (verify each exists first):
/biological-age, /country-comparison, /coach, /life-expectancy-india, /life-expectancy-usa, /life-expectancy-japan, /how-it-works

Edit src/pages/BiologicalAge.tsx — add to RELATED:
/life-expectancy, /country-comparison, /coach, /biological-age-vs-chronological-age, /answers/what-is-my-biological-age

Edit src/pages/CountryComparison.tsx — add to RELATED:
/life-expectancy, /biological-age, /coach, /life-expectancy-india, /life-expectancy-usa, /life-expectancy-japan

ASTROLOGY CLUSTER:
Edit src/pages/MoonSignPage.tsx — add to RELATED:
/zodiac, /compatibility, /vedic-zodiac, /sun-vs-moon-sign, /answers/what-is-my-moon-sign, /answers/what-is-vedic-astrology

Edit src/pages/Zodiac.tsx — add to RELATED:
/moon-sign, /compatibility, /vedic-zodiac, /sun-vs-moon-sign, /numerology

Edit src/pages/CompatibilityPage.tsx — add to RELATED:
/zodiac, /moon-sign, /vedic-zodiac, /numerology, /moon-sign-compatibility

AGE CLUSTER:
Edit src/pages/AgeCalculatorPage.tsx — add to RELATED:
/age-in-days, /age-in-seconds, /birthday-countdown, /biological-age, /life-expectancy

Edit src/pages/AgeInDays.tsx — add to RELATED:
/age-calculator, /age-in-seconds, /birthday-countdown

Edit src/pages/AgeInSeconds.tsx — add to RELATED:
/age-calculator, /age-in-days, /birthday-countdown

ANSWERS CLUSTER:
Edit src/pages/answers/WhatIsMyBiologicalAge.tsx — add to RELATED:
/biological-age, /life-expectancy, /biological-age-vs-chronological-age, /answers/what-is-epigenetic-age

Edit src/pages/answers/WhatIsMyMoonSign.tsx — add to RELATED:
/moon-sign, /zodiac, /sun-vs-moon-sign, /answers/what-is-vedic-astrology

Edit src/pages/answers/WhatAffectsLifeExpectancyMost.tsx — add to RELATED:
/life-expectancy, /biological-age, /coach, /answers/what-is-epigenetic-age

After all edits:
1. Run tsc --noEmit — 0 errors
2. List any RELATED paths that were skipped because they don't exist in App.tsx yet
3. Commit: "feat(P1-H): internal linking upgrade across topic clusters"

---

GROUP 4 — SITE-WIDE UPGRADES (P4-A, P4-B, P4-C)

4a. SOURCE BOXES (P4-A)
Read each target file first. Add this source box pattern just above the Footer component on each page:

```tsx
<div className="max-w-3xl mx-auto mt-12 px-4 mb-8">
  <div className="p-4 rounded-xl border border-border bg-muted/30">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources & Methodology</p>
    <ul className="text-xs text-muted-foreground space-y-1 list-none">
      {/* page-specific sources */}
    </ul>
  </div>
</div>
```

src/pages/LifeExpectancy.tsx — sources:
- WHO Global Health Observatory — life tables and mortality data, 2023
- UN World Population Prospects 2023 — demographic projections
- Harvard T.H. Chan School of Public Health — Li et al., Circulation, 2018 (lifestyle and mortality)
- The Lancet — Global Burden of Disease Study 2023

src/pages/BiologicalAge.tsx — sources:
- WHO health assessment frameworks — validated biomarker set
- Horvath S. (2013) — DNA methylation age of human tissues and cell types, Genome Biology
- Fitzgerald et al. (2021) — Potential reversal of epigenetic age using diet and lifestyle, Aging Cell
- National Institute on Aging, NIH — biological aging research

src/pages/MoonSignPage.tsx — sources:
- NASA JPL Horizons System — lunar ephemeris data
- US Naval Observatory Astronomical Almanac

src/pages/AgeCalculatorPage.tsx — sources:
- ISO 8601 Date and Time Standard
- Gregorian Calendar — leap year rules (divisible by 4, except centuries unless divisible by 400)

src/pages/CountryComparison.tsx — sources:
- UN World Population Prospects 2023
- WHO Global Health Observatory
- World Bank Health Nutrition and Population data

4b. REVIEWED/UPDATED TIMESTAMPS (P4-B)
Add just above Footer on each page listed:

```tsx
<p className="text-center text-xs text-muted-foreground mt-8 mb-4 px-4">
  Last reviewed: August 2026 · Sources verified by BornClock Editorial Team
</p>
```

Add to: LifeExpectancy.tsx, BiologicalAge.tsx, MoonSignPage.tsx, AgeCalculatorPage.tsx, CountryComparison.tsx, NumerologyPage.tsx, BiorhythmPage.tsx, CompatibilityPage.tsx

4c. EDITORIAL POLICY UPGRADE (P4-C)
Read src/pages/EditorialPolicy.tsx completely first.
Add these 4 new sections inside the existing Card, after the "Independence" section:

Section: "Data sources"
Content: BornClock uses primary data sources exclusively: WHO Global Health Observatory, UN World Population Prospects, NASA JPL Horizons (astronomical calculations), US Naval Observatory Astronomical Almanac, peer-reviewed journals (The Lancet, Genome Biology, Circulation, Aging Cell), and official national statistics agencies. We do not aggregate from secondary sources without citing the original.

Section: "AI and automated content"
Content: Some BornClock pages use AI-assisted drafting, reviewed and verified by our editorial team before publication. All factual claims — statistics, research citations, historical dates — are independently verified against primary sources. AI is a writing tool here, not a fact source.

Section: "Calculator methodology"
Content: Every calculator on BornClock has a dedicated methodology page explaining the data sources, calculation method, and known limitations. We publish our methodology so users can evaluate our approach. Calculators are tested against known cases before launch and re-verified when underlying data sources update. See /how-it-works for full methodology details.

Section: "Update policy"
Content: Pages are reviewed when: (1) an underlying data source publishes updated figures, (2) a reader submits a correction that is confirmed, or (3) our annual content audit identifies a material change. The "Last reviewed" date shown on each page reflects the most recent review, not the original publication date.

After all upgrades:
1. Run tsc --noEmit — 0 errors
2. Commit: "feat(P4): source boxes, timestamps, editorial policy upgrade"

---

GROUP 5 — EMBEDDABLE WIDGET (P2-C)

BEFORE WRITING ANY CODE for this group:
1. Read src/context/BirthDateContext.tsx completely — understand the provider pattern
2. Read src/components/AgeCalculator.tsx — check if it requires BirthDateContext
3. Read functions/_worker.ts — check for any X-Frame-Options or CSP frame-ancestors headers
4. If _worker.ts has X-Frame-Options: SAMEORIGIN, add an exception for /widget/* paths

5a. Create src/pages/Widget.tsx
Route: /widget/age-calculator
This IS the widget — renders in an iframe on other websites.
CRITICAL requirements:
- NO Navigation component
- NO Footer component
- NO AuthNav component
- Wrap in its own BirthDateContext provider (do not rely on parent App context)
- noindex: true in SEO component
- Clean white background (bg-white), no gradient-cosmic
- Mobile responsive, works at any width from 300px up

Design:
- Small BornClock logo top-right (use existing logo asset path)
- DOB input (use AgeCalculator component or a simplified version)
- Live age display showing years, months, days, seconds
- "Powered by BornClock" link bottom-right (text-xs, links to bornclock.com)
- No other UI elements — keep it minimal

```tsx
// Widget.tsx structure:
import { BirthDateProvider } from '@/context/BirthDateContext';
// wrap everything in BirthDateProvider
// no Navigation, no Footer, no AuthNav
```

5b. Create src/pages/EmbedPage.tsx
Route: /embed
This is the page website owners visit to get their embed code.

Content:
- Navigation + AuthNav (this page IS navigable, unlike the widget itself)
- SEO: title "Free Age Calculator Widget for Your Website | BornClock"
- H1: "Free Age Calculator Widget for Your Website"
- Intro: "Embed BornClock's live age calculator on your website in 30 seconds. Copy one line of code. We handle updates, hosting, and accuracy — forever free."
- Live preview section: show the widget in an iframe
  ```tsx
  <iframe
    src="/widget/age-calculator"
    width="100%"
    height="220"
    frameBorder="0"
    style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
    title="BornClock Age Calculator Widget"
  />
  ```
- Embed code section with copy-to-clipboard button:
  The code to copy:
  ```html
  <iframe src="https://bornclock.com/widget/age-calculator" width="100%" height="220" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb;" title="Age Calculator"></iframe>
  ```
  Use a simple copy button that copies to clipboard and shows "Copied!" confirmation.
- Attribution note: "Free forever. No API key needed. 'Powered by BornClock' link included."
- RELATED: /age-calculator, /age-in-days, /birthday-countdown
- Footer

5c. Add both routes to src/App.tsx:
/widget/age-calculator → Widget
/embed → EmbedPage

5d. Add to exploreItems in Navigation.tsx:
{ path: '/embed', label: 'Embed Our Widget', emoji: '🔗' }

5e. Widget-specific verification (run after creating the files):
- Open dist/widget/age-calculator/index.html after build — confirm no Navigation or Footer HTML present
- Confirm BirthDateContext provider wraps the widget component
- Check _worker.ts for X-Frame-Options — if SAMEORIGIN is set, add /widget/* exception

Run tsc --noEmit — 0 errors
Commit: "feat(P2-C): embeddable age calculator widget and embed page"

---

FINAL STEPS — COMPLETE VERIFICATION SUITE

Run these in order. Do not skip any step. Report results for each.

STEP 1 — TypeScript
tsc --noEmit
Required: 0 errors. Fix all errors before proceeding.

STEP 2 — Build
npm run build
Required: clean build. Note the page count in the prerender output.
Note the count before this batch (1,351) and compare after.

STEP 3 — New page title verification
For every new route created in this batch, verify the prerendered HTML has a correct unique title.
Run this for each new page (replace [route] with actual path):
grep -o "<title>[^<]*</title>" dist/[route]/index.html

Flag any page where the title is:
- Missing entirely
- Generic ("BornClock" only, no page-specific text)
- Identical to another page's title

STEP 4 — Broken link audit
Run this to find any RELATED links pointing to non-existent routes:
grep -r "path: '/" src/pages/ --include="*.tsx" | grep -oP "path: '[^']+'" | sort -u > /tmp/related_paths.txt
Then for each path found, verify it exists in src/App.tsx.
List any that don't exist — these are broken internal links.

STEP 5 — Hindi encoding verification
For each Hindi page, verify Devanagari characters are present:
grep -c $'[\u0900-\u097F]' src/pages/HindiAgeCalculator.tsx
grep -c $'[\u0900-\u097F]' src/pages/HindiLifeExpectancy.tsx
grep -c $'[\u0900-\u097F]' src/pages/HindiNumerology.tsx
grep -c $'[\u0900-\u097F]' src/pages/HindiZodiac.tsx
grep -c $'[\u0900-\u097F]' src/pages/HindiBiologicalAge.tsx
Each must return a number greater than 0.

STEP 6 — Navigation overflow check
Count total items across exploreItems, astrologyItems, and moreItems in Navigation.tsx.
Report the count. If exploreItems exceeds 18 items, flag it — mobile dropdown will become unwieldy.

STEP 7 — Widget isolation check
After build, run:
grep -i "navigation\|footer\|authnav" dist/widget/age-calculator/index.html | head -5
If Navigation or Footer HTML is present in the widget page, the isolation failed — fix before committing.

STEP 8 — Playwright test suite
npx playwright test e2e/gauntlet/ e2e/prelaunch/ --reporter=line
Fix any failures per fix-loop policy: classify, fix product bugs, never weaken assertions.

STEP 9 — New smoke tests
Add a new test file: e2e/prelaunch/batch-10-smoke.spec.ts
Follow the exact pattern from e2e/prelaunch/batch-9.spec.ts.
Add one test per new route that:
- Navigates to the route
- Waits for networkidle
- Asserts the <h1> is visible and not empty
- Asserts the page title contains expected text (not just "BornClock")
- Asserts no console errors of type 'pageerror'

Cover these routes:
/life-expectancy-india, /life-expectancy-usa, /life-expectancy-japan,
/life-expectancy-uk, /life-expectancy-australia, /life-expectancy-canada,
/life-expectancy-germany, /life-expectancy-china, /life-expectancy-singapore,
/life-expectancy-brazil, /meri-umar-kitni-hai, /jivan-kal-calculator,
/numerology-hindi, /rashifal-by-date-of-birth, /biological-age-hindi,
/embed, /widget/age-calculator

Run the new test file:
npx playwright test e2e/prelaunch/batch-10-smoke.spec.ts --reporter=line
All must pass.

STEP 10 — Final report
Write a report covering:
- Total new routes added (list all)
- tsc status
- Build page count: before → after
- Sitemap URL count
- Results of Steps 3-9
- Any broken links found and removed
- Any Hindi encoding issues found and resolved
- Widget isolation: pass/fail
- Navigation item count
- Any routes skipped in Group 3 because they don't exist yet (list them)
- Any issues that need follow-up

STEP 11 — Final commit (only if all tests pass)
git add (only changed and new files — never git add -A)
Commit: "fix: post-batch-2 verification and smoke tests"

DO NOT PUSH. Manual push only.
