const RECORDS = [
  {
    emoji: '👩‍🦳',
    name: 'Jeanne Calment',
    stat: '122 years, 164 days',
    location: 'Arles, France',
    years: '1875–1997',
    detail: 'The longest verified human lifespan ever recorded. Calment walked and cycled regularly until her 100s, ate a Mediterranean diet rich in olive oil, drank port wine, and credited her stress-free temperament. She took up fencing at 85 and continued to live independently until age 110.',
    learn: 'Moderate activity, Mediterranean diet, low stress, and an optimistic temperament are associated with exceptional longevity.',
  },
  {
    emoji: '👴',
    name: 'Jiroemon Kimura',
    stat: '116 years, 54 days',
    location: 'Kyotango, Japan',
    years: '1897–2013',
    detail: 'The longest verified male lifespan. Kimura worked as a postal worker until 90, ate small portions (practising the Okinawan "hara hachi bu" 80% rule), read newspapers daily for mental engagement, and maintained a purposeful daily routine throughout his life.',
    learn: 'Caloric moderation, continued mental engagement, purposeful routine, and natural daily activity are key male longevity drivers.',
  },
  {
    emoji: '🇯🇵',
    name: 'Japan: 90,000+ Centenarians',
    stat: 'World-leading centenarian density',
    location: 'Japan (national)',
    years: '2023 census',
    detail: "Japan has the world's highest concentration of centenarians — over 90,000 people aged 100+, led by Okinawa. This is attributed to a national culture of plant-heavy diet (miso, seaweed, tofu), strong social structures, universal healthcare access, and a deep sense of ikigai (life purpose).",
    learn: 'National diet culture, universal healthcare, and community purpose-structures create population-level longevity effects that transcend individual willpower.',
  },
  {
    emoji: '🏃',
    name: 'Fauja Singh',
    stat: 'Completed marathon at age 100',
    location: 'Toronto, Canada',
    years: 'Born 1911',
    detail: 'Singh began marathon running at age 89 after the death of his wife, completing the Toronto Waterfront Marathon at 100 years old. A lifelong vegetarian and tea drinker, he credits his longevity to simple food, regular walking, mental positivity, and his Sikh faith community.',
    learn: 'It is never too late to start exercising. Plant-based diet, faith community, and mental resilience can sustain extraordinary physical performance into the 10th decade.',
  },
  {
    emoji: '👵',
    name: 'Maria Branyas Morera',
    stat: "117 years (world's oldest living person as of 2024)",
    location: 'Catalonia, Spain',
    years: '1907–2024',
    detail: 'The world\'s oldest verified living person until her passing in 2024. Branyas attributed her longevity to "order, tranquility, and good connection with family and friends." She avoided toxic people, maintained a positive outlook, and spent decades in a care home with close family ties.',
    learn: 'Emotional environment and the intentional avoidance of chronic stress and negative relationships may be as important as physical health habits.',
  },
  {
    emoji: '🏝️',
    name: 'Sardinia Blue Zone',
    stat: 'Highest male centenarian rate globally',
    location: 'Nuoro Province, Sardinia',
    years: 'Ongoing',
    detail: "Sardinia's mountainous Nuoro province has the world's highest known concentration of male centenarians. The terrain requires daily steep walking, the diet is heavy in goat's milk, flat bread, and local vegetables, and multigenerational family households are the norm — with grandparents playing active roles into their 90s.",
    learn: 'Incidental physical activity built into geography, whole-food local diet, and intergenerational family bonds form a powerful longevity triangle.',
  },
  {
    emoji: '🎿',
    name: 'Oscar Swahn',
    stat: 'Oldest Olympic medalist — gold at age 60, silver at 72',
    location: 'Stockholm, Sweden',
    years: '1847–1927',
    detail: 'Swedish sport shooter Oscar Swahn remains the oldest Olympic gold medalist (1908, age 60) and oldest Olympic medalist overall (1920, age 72). He continued competitive athletic participation into his 70s and lived to age 80 — nearly double the male life expectancy of his era.',
    learn: 'Continued purposeful competition, physical engagement, and active community participation can dramatically extend healthy function well beyond typical population norms.',
  },
  {
    emoji: '🧬',
    name: 'Most Verified Longevity Case',
    stat: 'Jeanne Calment — most rigorously authenticated supercentenarian',
    detail: "Jeanne Calment's 122-year lifespan has been independently verified by multiple researchers using birth certificates, census records, and family documents — the most rigorously authenticated extreme longevity case in scientific history.",
    learn: 'Extreme longevity is not mythological — it is documentable, reproducible in certain conditions, and increasingly understood at the molecular level.',
  },
] as const;

export const WorldLongevityRecords = () => (
  <div className="space-y-4">
    <div>
      <h2 className="text-2xl font-bold text-foreground">🏆 The Limits of Human Longevity</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Verified records showing what is biologically possible — proof that the human body can achieve extraordinary things with the right conditions.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 gap-3">
      {RECORDS.map(record => (
        <div key={record.name} className="flex gap-3 bg-muted/30 border rounded-xl p-4">
          <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{record.emoji}</span>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start gap-2 flex-wrap">
              <p className="text-xs font-bold text-foreground">{record.name}</p>
              {'stat' in record && record.stat && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {record.stat}
                </span>
              )}
            </div>
            {'location' in record && record.location && 'years' in record && record.years && (
              <p className="text-[10px] text-muted-foreground/70">{record.location} · {record.years}</p>
            )}
            <p className="text-[10px] text-muted-foreground leading-snug">{record.detail}</p>
            {'learn' in record && record.learn && (
              <p className="text-[10px] font-semibold text-foreground leading-snug">What we can learn: {record.learn}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
