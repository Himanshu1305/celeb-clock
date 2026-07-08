import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema } from '@/components/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Generation {
  name: string;
  shortName: string;
  startYear: number;
  endYear: number;
  color: string;
  hexColor: string;
  tagline: string;
  description: string;
  definingEvents: string[];
  coreValues: string[];
  techRelationship: string;
  atWork: string;
  researchNote: string;
}

const GENERATIONS: Generation[] = [
  {
    name: 'The Silent Generation',
    shortName: 'Silent',
    startYear: 1928,
    endYear: 1945,
    color: 'bg-stone-100 dark:bg-stone-900/40',
    hexColor: '#78716C',
    tagline: 'Born between 1928 and 1945',
    description: 'The Silent Generation came of age during the Great Depression and World War II — two of the most destabilizing events in modern history. These formative experiences shaped a cohort defined by conformity, caution, and a deep respect for institutions. They were called "Silent" not because they lacked conviction but because the era demanded pragmatism over protest. They built families, built careers, and built the postwar economic infrastructure that the Baby Boomers would eventually inherit. The silents were the first generation to grow up with television, they created rock and roll, they produced Martin Luther King Jr., and they drove the civil rights movement of the 1950s and 1960s. The generational label has always been misleading: this was one of the most consequential generations in American history.',
    definingEvents: ['The Great Depression (1929–1939)', 'World War II (1939–1945)', 'The postwar economic expansion', 'The beginning of the Cold War', 'The GI Bill and mass college attendance'],
    coreValues: ['Loyalty to institutions', 'Work ethic and frugality', 'Conformity and social stability', 'Civic duty and patriotism', 'Delayed gratification'],
    techRelationship: 'Grew up with radio; adopted television as the dominant medium. Many later adopted computers and the internet in retirement, often becoming more digitally active than assumed.',
    atWork: 'Built the postwar corporate America. Known for loyalty to employers, deferred hierarchy, and a preference for stability over innovation. Many held single careers for 30–40 years.',
    researchNote: 'Pew Research Center notes significant variation in how generations are defined across researchers and cultures. The 1928–1945 range is the most commonly cited for the Silent Generation [Pew Research Center, "Defining Generations: Where Millennials end and Generation Z begins," 2019].',
  },
  {
    name: 'Baby Boomers',
    shortName: 'Boomers',
    startYear: 1946,
    endYear: 1964,
    color: 'bg-orange-50 dark:bg-orange-950/30',
    hexColor: '#EA580C',
    tagline: 'Born between 1946 and 1964',
    description: 'Baby Boomers were born into a postwar world of extraordinary economic expansion and optimism. Their name refers to the literal demographic boom in birth rates that followed the return of soldiers from World War II — 76 million Americans born in this 19-year window. They grew up in a time of growing prosperity, but they also lived through the assassination of JFK, the Vietnam War, the civil rights movement, Watergate, and the social upheaval of the 1960s and 70s. These contradictions define the generation: born into conformity but responsible for one of the most rebellious cultural periods in American history. Today, Boomers are the dominant economic and political force in most Western countries — they hold the majority of wealth, occupy most senior leadership positions, and vote at higher rates than any younger generation. [Pew Research Center, 2019]',
    definingEvents: ['The Kennedy assassination (1963)', 'Vietnam War and anti-war movement', 'Civil rights movement', 'Watergate', 'The moon landing (1969)', 'The sexual revolution and second-wave feminism'],
    coreValues: ['Optimism and ambition', 'Individual achievement and competition', 'Work ethic and career focus', 'Home ownership and economic security', 'Social change and activism (early Boomers)'],
    techRelationship: 'Adopted personal computers as adults; many became proficient with email and then smartphones. Largest Facebook demographic. More tech-capable than often portrayed.',
    atWork: 'Defined by the work-centric culture of the 1980s and 1990s. Long hours, hierarchical structures, loyalty rewarded over time. Many are now retiring — creating significant knowledge transfer challenges.',
    researchNote: 'The Boomer generational range (1946–1964) is the most consistently defined across research organizations, including Pew Research Center, the US Census Bureau, and the Brookings Institution.',
  },
  {
    name: 'Generation X',
    shortName: 'Gen X',
    startYear: 1965,
    endYear: 1980,
    color: 'bg-slate-50 dark:bg-slate-900/40',
    hexColor: '#475569',
    tagline: 'Born between 1965 and 1980',
    description: 'Generation X — the "latchkey kids" — grew up largely in the shadow of the Boomers and spent their adult lives in the shadow of Millennials. They were the first generation to experience widespread divorce, the AIDS crisis during their formative years, the collapse of corporate loyalty (as their parents\' jobs disappeared in the 1980s recessions), and the rise of MTV. Their cultural hallmarks — cynicism, irony, independence, self-reliance — are direct responses to institutions that failed their parents. Gen X gave the world grunge, hip-hop\'s golden age, independent film, and the early internet. Now in their 40s and 50s, they are quietly becoming the dominant generation in many leadership roles — often described as the "forgotten generation" sandwiched between two demographic giants, but forming the pragmatic, adaptable backbone of much of the current workforce. [Pew Research Center, 2019]',
    definingEvents: ['The AIDS crisis (1980s)', 'Challenger disaster (1986)', 'Fall of the Berlin Wall (1989)', 'The dot-com boom and bust', 'September 11, 2001', 'The 2008 financial crisis'],
    coreValues: ['Independence and self-reliance', 'Cynicism about institutions', 'Work-life balance (often in reaction to Boomer workaholism)', 'Pragmatism', 'Diversity and inclusion'],
    techRelationship: 'Digital immigrants who adopted the internet as young adults. Many Gen Xers were early adopters of email, personal computers, and the World Wide Web. Comfortable with technology without being defined by it.',
    atWork: 'Pragmatic, results-focused, and suspicious of corporate rhetoric. Gen X tends to judge by output rather than presence. Known for navigating bureaucracy efficiently and managing up effectively.',
    researchNote: 'Pew Research Center defines Generation X as born 1965–1980, though some researchers extend the end year to 1981 or 1982. The 1965–1980 range is used here as the most frequently cited. [Pew Research Center, 2019]',
  },
  {
    name: 'Millennials',
    shortName: 'Millennials',
    startYear: 1981,
    endYear: 1996,
    color: 'bg-blue-50 dark:bg-blue-950/30',
    hexColor: '#2563EB',
    tagline: 'Born between 1981 and 1996',
    description: 'Millennials — also called Generation Y — are the most studied, written about, and debated generation in modern history, which is fitting for a cohort that came of age with the internet and social media. They entered adulthood during the 2000s and 2010s, a period that included September 11, the longest war in American history, the 2008 financial crisis (which decimated early career prospects for many), and the rise of smartphones. They are the most educated generation in history by formal credential, and they entered a workforce that frequently didn\'t reward that education with the stability their parents had. This combination of high expectation and economic precarity explains much of Millennial psychology. They are delaying homeownership, marriage, and children not out of apathy but out of genuine economic constraints and shifting values around work and life. As of 2024, Millennials are now the largest living adult generation and are increasingly in positions of organizational and political leadership. [Pew Research Center, 2019]',
    definingEvents: ['September 11, 2001', '2008 global financial crisis', 'Rise of social media (Facebook, Instagram, Twitter)', 'The smartphone era (iPhone launched 2007)', 'Climate change becoming a defining political issue'],
    coreValues: ['Purpose over paycheck', 'Work-life integration', 'Diversity and social justice', 'Experiences over material possessions', 'Transparency and authenticity in leadership'],
    techRelationship: 'Digital natives in the truest sense — grew up with internet access as a constant. First generation to experience both pre-smartphone and post-smartphone adolescence. Most comfortable with digital communication.',
    atWork: 'Job-hop more frequently than previous generations, often because loyalty was not reciprocated. Value purpose-driven work, feedback, and flexibility. Major force behind remote work normalization.',
    researchNote: 'Pew Research Center uses 1981–1996 as the Millennial range, which is the most widely cited definition. [Pew Research Center, "Defining Generations," 2019]. Some earlier definitions started at 1980; Pew\'s 1981 cutoff is used here.',
  },
  {
    name: 'Generation Z',
    shortName: 'Gen Z',
    startYear: 1997,
    endYear: 2012,
    color: 'bg-violet-50 dark:bg-violet-950/30',
    hexColor: '#7C3AED',
    tagline: 'Born between 1997 and 2012',
    description: 'Generation Z is the first generation to have grown up with smartphones from early childhood — the iPhone launched in 2007, meaning the oldest Gen Zers were 10, and the youngest were only 5 by the time touchscreen devices became ubiquitous. This has created a fundamentally different relationship with communication, information, and attention compared to every previous generation. Gen Z is also the most diverse generation in American history by ethnicity and gender identity, and the most globally connected cohort of young people ever measured. They are entering adulthood during climate crisis, pandemic aftermath, and extraordinary economic uncertainty. Early research — notably Jonathan Haidt\'s work on adolescent mental health [Haidt, J. & Lukianoff, G., 2018. The Coddling of the American Mind] — suggests that social media exposure during adolescence correlates with elevated rates of anxiety and depression in this cohort, a finding that has generated significant ongoing debate among researchers.',
    definingEvents: ['September 11, 2001 (early childhood for oldest)', 'COVID-19 pandemic (formative adolescent years for many)', 'Climate change as existential concern', 'School shootings and active shooter drills', 'Black Lives Matter movement', '#MeToo'],
    coreValues: ['Mental health awareness', 'Authenticity over perfection', 'Social justice and intersectionality', 'Financial pragmatism (partly a reaction to Millennial precarity)', 'Climate action'],
    techRelationship: 'True digital natives — no memory of a pre-internet world. TikTok as primary content format; preference for video over text. Sophisticated media consumers who distrust overly polished content.',
    atWork: 'Beginning to enter the workforce in meaningful numbers. Value stability and pay transparency (a reaction to Millennial experience). Expect mental health support and social purpose from employers. Bring digital fluency and comfort with ambiguity.',
    researchNote: 'Pew Research Center uses 1997–2012 as the Gen Z range [Pew Research Center, 2019]. The end year is preliminary — the generation is still being born and the youngest Gen Zers (born 2012) were entering adolescence as of 2024.',
  },
  {
    name: 'Generation Alpha',
    shortName: 'Alpha',
    startYear: 2013,
    endYear: 2025,
    color: 'bg-emerald-50 dark:bg-emerald-950/30',
    hexColor: '#059669',
    tagline: 'Born from 2013 onwards',
    description: 'Generation Alpha — a term coined by social researcher Mark McCrindle — comprises children born from 2013 onward. The oldest members of Generation Alpha are only entering their teenage years as of 2024; the youngest members of this cohort haven\'t been born yet (researchers typically project the generation\'s end around 2025). What we know about Alpha is necessarily preliminary. They are being raised entirely in the age of artificial intelligence, social media algorithms, and climate uncertainty. They are exposed to screens from infancy in ways that no previous generation has been. Early childhood education researchers are tracking this cohort with particular attention, but the bulk of what will be said about Generation Alpha — their values, their political tendencies, their relationship with technology — remains to be written. [McCrindle Research, 2021. "Generation Alpha: Understanding Our Children and Helping Them Thrive."]',
    definingEvents: ['COVID-19 pandemic (early childhood)', 'Rise of AI as a daily tool', 'Climate change as present reality, not future concern', 'Social media algorithms from birth'],
    coreValues: ['Still being shaped — preliminary indicators suggest: environmental concern, digital fluency as baseline, mental health awareness'],
    techRelationship: 'Born entirely after the smartphone became ubiquitous. Will likely never know a world without AI assistants. Screen time in early childhood is a significant concern among child development researchers.',
    atWork: 'Not yet in the workforce. Projected to be the most educated and longest-living generation, potentially working well into their 70s if current life expectancy trends continue.',
    researchNote: 'The term "Generation Alpha" was coined by Mark McCrindle and is increasingly used by researchers, though its boundaries are not yet standardized. [McCrindle, M., 2021. "Generation Alpha." Hachette Australia.] Pew Research Center has not yet formally defined this generation.',
  },
];

function getGenerationForYear(year: number): Generation | undefined {
  return GENERATIONS.find(g => year >= g.startYear && year <= g.endYear);
}

function GenerationSection({ gen }: { gen: Generation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white text-sm text-center leading-tight"
            style={{ backgroundColor: gen.hexColor }}>
            {gen.startYear}<br />–{gen.endYear}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{gen.name}</p>
            <p className="text-muted-foreground text-sm">{gen.tagline}</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        }
      </button>
      {open && (
        <div className={`border-t border-border p-6 space-y-6 ${gen.color}`}>
          <p className="text-muted-foreground leading-relaxed">{gen.description}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Defining Events</h3>
              <ul className="space-y-1">
                {gen.definingEvents.map(e => (
                  <li key={e} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 shrink-0">•</span>{e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Core Values</h3>
              <ul className="space-y-1">
                {gen.coreValues.map(v => (
                  <li key={v} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 shrink-0">•</span>{v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-background/60 border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">Relationship with Technology</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{gen.techRelationship}</p>
            </div>
            <div className="bg-background/60 border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">At Work</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{gen.atWork}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-300">
            <strong>Research note:</strong> {gen.researchNote}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GenerationPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nameParam = params.get('name');
  const yearParam = params.get('year');

  const targetYear = yearParam ? parseInt(yearParam, 10) : undefined;
  const userGen = targetYear ? getGenerationForYear(targetYear) : undefined;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What are the dates for each generation?', acceptedAnswer: { '@type': 'Answer', text: 'Silent Generation: 1928–1945. Baby Boomers: 1946–1964. Generation X: 1965–1980. Millennials: 1981–1996. Generation Z: 1997–2012. Generation Alpha: 2013 onwards. [Pew Research Center, 2019]' } },
      { '@type': 'Question', name: 'What generation am I if I was born in 1990?', acceptedAnswer: { '@type': 'Answer', text: 'If you were born in 1990, you are a Millennial (Generation Y), born 1981–1996.' } },
      { '@type': 'Question', name: 'What generation am I if I was born in 1985?', acceptedAnswer: { '@type': 'Answer', text: 'If you were born in 1985, you are a Millennial (Generation Y), born 1981–1996.' } },
      { '@type': 'Question', name: 'What generation is someone born in 2000?', acceptedAnswer: { '@type': 'Answer', text: 'Someone born in 2000 is Generation Z, born 1997–2012 according to Pew Research Center.' } },
      { '@type': 'Question', name: 'Are generational definitions scientifically proven?', acceptedAnswer: { '@type': 'Answer', text: 'Generational categories are sociological constructs, not biological facts. The exact cutoff years vary by researcher and organization. Pew Research Center cautions that generations are one lens through which to understand social change, not rigid categories that determine individual behavior. [Pew Research Center, 2019]' } },
      { '@type': 'Question', name: 'Who coined the term Generation Alpha?', acceptedAnswer: { '@type': 'Answer', text: 'The term Generation Alpha was coined by Australian social researcher and demographer Mark McCrindle around 2010. [McCrindle Research, 2021]' } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Which Generation Are You? — Complete Generational Guide | BornClock"
        description="Find out which generation you belong to — Silent Generation, Boomers, Gen X, Millennials, Gen Z, or Alpha. Dates, defining events, values, and research citations from Pew Research Center."
        keywords="what generation am I, generational guide, millennial gen z baby boomer gen x generation alpha, pew research generations"
        canonicalUrl="/generation"
      />
      <WebApplicationSchema
        name="Generation Calculator"
        description="Free generation calculator — find out if you're Gen Z, Millennial, Gen X, Boomer or another generation with Pew Research-based dates and defining events."
        url="/generation"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Which Generation Are You? — Complete Guide
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            From the Silent Generation to Generation Alpha — dates, defining events, values, and what the research actually says about each cohort.
          </p>
        </div>

        {/* User's generation (if year param provided) */}
        {userGen && (
          <div className="mb-10 p-6 rounded-xl border-2 border-primary bg-primary/5">
            <p className="text-sm font-medium text-primary mb-1">
              {nameParam ? `${nameParam}, you are` : 'Born in ' + targetYear + ' — you are'}
            </p>
            <p className="text-3xl font-bold text-foreground mb-2">{userGen.name}</p>
            <p className="text-muted-foreground">{userGen.tagline}</p>
          </div>
        )}

        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What Are Generational Categories?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Generational categories are a sociological tool — a way of grouping people born during a similar historical period who shared formative experiences during their youth. The basic premise is that the events, technologies, and cultural conditions you experience between the ages of roughly 5 and 25 have an outsized influence on your values, behaviors, and worldview compared to events you experience later in life.
            </p>
            <p>
              The most important thing to understand about generations is that they are constructs, not laws. They describe tendencies in large populations — they don't determine individual behavior. Two people born in the same year can have radically different experiences, values, and outlooks. Generational data describes averages, not destinies. With that caveat clearly stated, the patterns are real enough to be useful: research by Pew Research Center, Brookings Institution, and others consistently finds meaningful differences in attitudes, behaviors, and values across generational cohorts when controlling for age effects.
            </p>
          </div>
        </section>

        {/* Generations */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">All 6 Generations Explained</h2>
          <div className="space-y-4">
            {GENERATIONS.map(gen => (
              <GenerationSection key={gen.name} gen={gen} />
            ))}
          </div>
        </section>

        {/* What Research Says */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What the Research Actually Says</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Pew Research Center, which produces some of the most rigorous generational research, regularly cautions that generations should be used as "analytical constructs" — tools for identifying broad patterns, not rigid categories. Their 2019 report "Defining Generations" notes that the specific cutoff years are somewhat arbitrary, and that researchers at different institutions use different ranges.
            </p>
            <p>
              The most consistent finding across generational research is that <strong className="text-foreground">major economic disruptions during early adulthood</strong> — recessions, wars, pandemics — have lasting effects on the attitudes and behaviors of the cohort that experiences them. This is why the 2008 financial crisis is such a defining event for Millennials, why the Great Depression shaped the Silent Generation's frugality, and why Gen Z's relationship with stability was shaped by graduating into pandemic conditions.
            </p>
            <p>
              What the research does not support is the popular narrative of generational conflict — the idea that one generation is somehow failing another. Each generation responds rationally to the economic and cultural conditions it actually faces. Understanding that is more useful than the generational stereotypes that dominate popular discussion.
            </p>
          </div>
        </section>

        {/* Quick Reference Table */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Quick Reference: Generation Years</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold text-foreground">Generation</th>
                  <th className="text-left py-3 pr-4 font-semibold text-foreground">Birth Years</th>
                  <th className="text-left py-3 font-semibold text-foreground">Current Age (2024)</th>
                </tr>
              </thead>
              <tbody>
                {GENERATIONS.map((gen, i) => (
                  <tr key={gen.name} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <td className="py-3 pr-4 text-foreground font-medium">{gen.shortName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{gen.startYear}–{gen.endYear}</td>
                    <td className="py-3 text-muted-foreground">
                      {gen.endYear < 2024
                        ? `${2024 - gen.endYear}–${2024 - gen.startYear}`
                        : `0–${2024 - gen.startYear}`} years old
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2">Source: Pew Research Center (2019), McCrindle Research (2021)</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What are the dates for each generation?', a: 'Silent: 1928–1945 · Boomers: 1946–1964 · Gen X: 1965–1980 · Millennials: 1981–1996 · Gen Z: 1997–2012 · Alpha: 2013+ [Pew Research Center, 2019; McCrindle, 2021]' },
              { q: 'What generation is someone born in 1990?', a: 'Born in 1990: Millennial (Generation Y), born 1981–1996.' },
              { q: 'What generation is someone born in 2000?', a: 'Born in 2000: Generation Z, born 1997–2012 according to Pew Research Center.' },
              { q: 'What generation is someone born in 1975?', a: 'Born in 1975: Generation X, born 1965–1980.' },
              { q: 'Are generational definitions scientifically proven?', a: 'No — they are sociological constructs. The cutoff years vary by researcher. Pew Research Center cautions that generations are one lens for understanding social change, not rigid categories. [Pew Research Center, 2019]' },
              { q: 'Who coined the term Generation Alpha?', a: 'The term Generation Alpha was coined by Australian demographer and social researcher Mark McCrindle around 2010. [McCrindle Research, 2021]' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">Find out more about yourself</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="inline-block bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              Calculate My Age
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/zodiac" className="text-primary hover:underline">Zodiac Signs</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/numerology" className="text-primary hover:underline">Numerology</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/birthstone" className="text-primary hover:underline">Birthstone Finder</Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>Sources:</strong> Pew Research Center (2019), "Defining Generations: Where Millennials end and Generation Z begins." McCrindle Research (2021), "Generation Alpha." Jonathan Haidt & Greg Lukianoff (2018), "The Coddling of the American Mind." Brookings Institution generational research series.
        </div>
      </div>

      <Footer />
    </div>
  );
}
