

## Add 5 Research-Backed Health & Wellness Blog Articles

### Articles to Create

1. **"The Hidden Cost of Chronic Stress: How It Rewires Your Brain and Body"** (lifestyle)
   - References: McEwen (2007) allostatic load theory, Epel et al. (2004) telomere shortening study, Kivimäki et al. (2012) BMJ meta-analysis on stress and cardiovascular disease
   - Covers cortisol cascade, HPA axis, gut-brain connection, practical de-stress protocols

2. **"Why Loneliness Is as Deadly as Smoking 15 Cigarettes a Day"** (life-expectancy)
   - References: Holt-Lunstad et al. (2010) meta-analysis (308,849 participants), Cacioppo & Cacioppo (2014) social neuroscience research, UK Campaign to End Loneliness data
   - Covers inflammation pathways, immune suppression, practical community-building steps

3. **"The 5-Minute Morning Routine That Could Add Years to Your Life"** (lifestyle)
   - References: Kabat-Zinn MBSR research, Creswell et al. (2014) mindfulness and cortisol, Emmons & McCullough (2003) gratitude journaling study, Huberman Lab cold exposure protocols
   - Covers morning cortisol awakening response, micro-habits, breath work (physiological sigh)

4. **"How Ultra-Processed Foods Are Quietly Shortening Your Lifespan"** (life-expectancy)
   - References: Monteiro NOVA classification, Hall et al. (2019) NIH randomized controlled trial, Srour et al. (2019) French NutriNet-Santé cohort, Juul et al. (2021) US mortality data
   - Covers industrial additives, gut microbiome disruption, practical whole-food swaps

5. **"Walking vs. Running: Which Exercise Actually Helps You Live Longer?"** (lifestyle)
   - References: Lee et al. (2014) JACC running and mortality study, Wen et al. (2011) Lancet 15-min exercise study from Taiwan, Williams & Thompson (2013) walking vs running comparison
   - Covers MET calculations, dose-response curves, Zone 2 training, practical weekly plans

### Implementation

**File: `src/data/blogPosts.ts`**
- Add 5 new `BlogPost` objects with IDs 15-19 to the `blogPosts` array
- Each post: 1500-2000 words of markdown content
- Each includes real study citations (authors, journals, years) that are independently verifiable
- Written in first-person-plural conversational tone with anecdotes, rhetorical questions, and varied sentence structure to read naturally
- Categories: mix of `lifestyle` and `life-expectancy`
- Each includes 3 FAQs, SEO metadata, tags, and keywords
- Internal links to `/life-expectancy` calculator and other site tools

No other files need changes -- the Blog page and BlogPost page automatically pick up new entries from the array.

