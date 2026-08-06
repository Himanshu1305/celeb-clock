import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { AuthorBio } from '@/components/AuthorBio';

const FAQ_ITEMS = [
  { question: 'Can biological age be lower than chronological age?', answer: "Yes — and it's a good sign. A biological age lower than your chronological age means your body is aging more slowly than average for your birth year. It's associated with lower disease risk, better cognitive function, and longer healthy lifespan." },
  { question: 'How much can the two differ?', answer: 'Studies show differences of 10–15 years in either direction are possible in healthy adult populations. Between an elite athlete and a long-term heavy smoker of the same chronological age, the gap can exceed 20 years.' },
  { question: 'Is biological age testing accurate?', answer: "It depends on the method. Epigenetic clock testing has a margin of error of roughly 3–5 years. Lifestyle-based assessments like BornClock's are less precise but still useful for identifying areas for improvement and tracking change over time." },
  { question: 'At what age does the gap typically widen most?', answer: 'Research suggests the gap widens most between ages 35 and 60 — when lifestyle choices have had the most cumulative time to affect cellular aging. After 70, genetic factors play a relatively larger role.' },
];

const RELATED = [
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/coach', label: 'Longevity Coach' },
  { path: '/country-comparison', label: 'Country Comparison' },
];

const BiologicalAgeVsChronologicalAge = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Biological Age vs Chronological Age — Which One Actually Matters?"
        description="Chronological age counts the years. Biological age measures how your body is actually aging. The two can differ by over a decade — and only one of them can change."
        keywords="biological age vs chronological age, biological age difference, what is biological age, chronological age meaning"
        canonicalUrl="/biological-age-vs-chronological-age"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Biological Age vs Chronological Age — Only One of These Can Change
          </h1>
          <EEATBadges sources={['Nature Aging', 'Aging Cell Journal', 'WHO']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your chronological age is fixed — it's simply the number of years since you were born, and it only moves forward. Your biological age is different: it measures how efficiently your body's cells, organs, and systems are functioning compared to population averages for your birth year. The two can differ by 10 years or more in either direction. And unlike your chronological age, your biological age can actually go down.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The core difference — and why it matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Chronological age is a calendar fact. It tells you how long you've existed. It says nothing about how well your body is doing the job of existing.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Biological age is a physiological reality. It reflects the actual state of your cardiovascular system, your metabolic function, your cellular integrity, your inflammatory burden. Two people born on the same day can have biological ages a decade apart — depending entirely on how they've lived.</p>
            <p className="text-muted-foreground leading-relaxed">This distinction matters enormously in medicine. A 60-year-old with the biological age of a 45-year-old has fundamentally different health risks, medication tolerances, and recovery capacity than a 60-year-old with a biological age of 70. Treating them identically because they share a birth year is, medically speaking, a mistake — and increasingly, clinicians are moving away from chronological age as the primary number in health assessments.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How each is measured</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Chronological age requires only your date of birth. No ambiguity, no measurement error. Simply the elapsed time since you were born.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Biological age has several measurement methods:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Epigenetic clocks (most accurate)</strong> — measure DNA methylation patterns that change predictably with aging. Steve Horvath's 2013 epigenetic clock and the newer DunedinPACE clock are the gold standards. Available through commercial testing for $200–$500.</li>
              <li><strong className="text-foreground">Biomarker panels</strong> — assess blood markers (inflammatory proteins, glucose, lipid profiles, organ function) against age-matched population norms. Used in clinical settings.</li>
              <li><strong className="text-foreground">Lifestyle-based assessments (most accessible)</strong> — use validated inputs (BMI, blood pressure, exercise, sleep, diet, smoking, stress) to estimate biological age. Less precise than epigenetic clocks but free, immediate, and still directionally accurate. This is BornClock's approach.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">A note on finding out your biological age is higher than expected</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">If you test your biological age and the number comes back higher than your chronological age — maybe 5 years higher, maybe 10 — the first reaction for many people is something close to alarm. That's understandable.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">But here's the important context: biological age is information, not a verdict. It's one of the few health numbers you can actually change. Unlike your chronological age, which only moves forward, your biological age can move backward. The research on this is now substantial — multiple intervention studies have found measurable reductions in biological age within weeks to months of lifestyle changes. The number exists so you can do something with it, not so you can feel helpless.</p>
            <p className="text-muted-foreground leading-relaxed">If your biological age is higher than expected, the question isn't "what does this mean about me?" It's "what do I want to do about it starting now?"</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Which one matters more — and when</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">For social purposes — birthdays, legal thresholds, retirement planning — chronological age is the relevant number.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">For health purposes — understanding disease risk, planning preventive interventions, understanding why you feel the way you feel — biological age is far more meaningful. A 2021 study in Nature Aging found that biological age acceleration predicted all-cause mortality independently of chronological age, smoking status, and socioeconomic factors.</p>
            <p className="text-muted-foreground leading-relaxed">The gender dimension is worth noting here too. Women consistently have lower biological ages than men of the same chronological age across multiple measurement methods — a pattern that mirrors the well-documented female longevity advantage seen in life expectancy data globally.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Can you change your biological age?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Chronological age moves in only one direction. Biological age can move both ways — and the evidence for lifestyle-driven reduction is now substantial.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">A 2023 study in Aging Cell found that an 8-week intensive lifestyle intervention reduced biological age by an average of 2.5 years. A 2021 study found that diet alone — specifically a plant-rich diet high in folate, polyphenols, and fiber — reduced epigenetic age within 8 weeks. Blue Zone research consistently shows that lifestyle can produce biological ages 10–15 years younger than chronological peers by midlife.</p>
            <p className="text-muted-foreground leading-relaxed">The interventions with the strongest evidence: stopping smoking, improving sleep quality, regular vigorous exercise, reducing chronic stress, and shifting toward a predominantly plant-based diet.</p>
          </section>
        </article>

        <PageFAQ items={FAQ_ITEMS} title="Biological vs Chronological Age FAQs" />

        <section className="max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED.map((t) => (
              <Link key={t.path} to={t.path} className="block rounded-xl border border-border p-4 font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {t.label} →
              </Link>
            ))}
          </div>
        </section>

        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default BiologicalAgeVsChronologicalAge;
