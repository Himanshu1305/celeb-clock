import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Biological Age vs Chronological Age — The Science | BornClock';
const DESC = 'Biological age vs chronological age explained — Horvath epigenetic clock, 5 proven ways to lower your biological age, and how to measure it.';

const FAQS = [
  {
    q: 'What is the difference between biological age and chronological age?',
    a: 'Chronological age is simply the number of calendar years since you were born — it moves forward at exactly one year per year for everyone. Biological age is an estimate of how old your body actually is on a cellular and physiological level, based on markers such as DNA methylation, telomere length, and fitness. Two people who are both 45 chronologically can have biological ages a decade apart depending on genetics and lifestyle.',
  },
  {
    q: 'What is the Horvath epigenetic clock?',
    a: 'The Horvath clock is a biological-age estimator published by Steve Horvath in 2013 (Genome Biology). It measures DNA methylation — chemical tags on your DNA — at 353 specific sites and uses them to predict age with remarkable accuracy across almost every human tissue. It is the most validated of the epigenetic clocks and is the reason DNA methylation is considered the gold-standard biomarker of ageing.',
  },
  {
    q: 'Can you actually lower your biological age?',
    a: 'Evidence suggests you can slow, and in some cases modestly reverse, biological age through lifestyle. Sleep optimisation, caloric restriction, high-intensity exercise, stress reduction, and a plant-heavy diet are the five best-supported levers. These changes influence DNA methylation, inflammation, and metabolic health. Results are gradual and individual — think of it as bending the trajectory of ageing rather than turning back a clock overnight.',
  },
  {
    q: 'Did Bryan Johnson really reverse his biological age?',
    a: 'Bryan Johnson, through his Blueprint project, has publicly claimed a roughly five-year reduction in his biological age across several epigenetic markers. This figure is self-reported and comes from his own extremely intensive and expensive protocol, so it should be treated as an individual anecdote rather than proven, generalisable science. It is a useful illustration of what people are attempting, not a guaranteed outcome.',
  },
  {
    q: 'How does BornClock estimate my biological age?',
    a: 'BornClock estimates biological age from 8 lifestyle factors — including sleep, exercise, diet, smoking, alcohol, stress, and body composition — mapped against population health research. It is an illustrative estimate designed to show how your habits push your biological age above or below your chronological age. It is not a clinical DNA methylation test, but it highlights the same levers the science points to.',
  },
];

const MARKERS = [
  {
    name: 'DNA methylation (epigenetic clocks)',
    detail: 'The most validated biological-age marker. Horvath\'s 2013 clock reads methylation at 353 DNA sites and predicts age across nearly all tissues. Later clocks (PhenoAge, GrimAge) refine this to predict disease and mortality risk.',
    strength: 'Gold standard',
  },
  {
    name: 'Telomere length',
    detail: 'Telomeres are protective caps on the ends of chromosomes that shorten each time a cell divides. Shorter telomeres correlate with ageing and disease, though they are noisier and less precise than epigenetic clocks.',
    strength: 'Well studied',
  },
  {
    name: 'VO2 max & grip strength',
    detail: 'Functional markers of physiological age. VO2 max (peak oxygen uptake) and grip strength both decline with age and strongly predict longevity — cheap, non-invasive proxies for how well the body is holding up.',
    strength: 'Functional proxy',
  },
];

const LEVERS = [
  {
    name: 'Sleep optimisation',
    detail: 'Consistent 7–9 hours of quality sleep supports DNA repair, hormonal balance, and lower inflammation — all linked to slower epigenetic ageing.',
  },
  {
    name: 'Caloric restriction',
    detail: 'Moderate, sustained calorie reduction (without malnutrition) is one of the most reproducible interventions to extend healthspan in animal studies, and shifts human metabolic ageing markers.',
  },
  {
    name: 'High-intensity exercise',
    detail: 'Vigorous cardio and resistance training raise VO2 max, preserve muscle and grip strength, and are associated with favourable methylation patterns.',
  },
  {
    name: 'Stress reduction',
    detail: 'Chronic stress accelerates cellular ageing. Practices such as meditation, breathwork, and better work-life boundaries reduce cortisol load and inflammation.',
  },
  {
    name: 'Plant-heavy diet',
    detail: 'Diets rich in vegetables, legumes, and whole foods — and lower in ultra-processed food — support the microbiome, lower inflammation, and correlate with younger biological age.',
  },
];

function BioAgeCalculator() {
  const [chrono, setChrono] = React.useState('');
  const [sleepsWell, setSleepsWell] = React.useState(false);
  const [exercises, setExercises] = React.useState(false);
  const [eatsPlants, setEatsPlants] = React.useState(false);

  const age = parseInt(chrono, 10);
  const valid = !isNaN(age) && age > 0 && age < 120;

  // Illustrative delta only. Each positive habit shaves ~2 years off the estimate.
  const goodHabits = [sleepsWell, exercises, eatsPlants].filter(Boolean).length;
  const delta = valid ? (goodHabits * 2) - ((3 - goodHabits) * 1.5) : 0;
  const bioAge = valid ? Math.max(1, Math.round(age - delta)) : 0;
  const deltaLabel = delta > 0 ? `${delta} years younger` : delta < 0 ? `${Math.abs(delta)} years older` : 'about the same';

  return (
    <div data-testid="bio-age-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Estimate Your Biological Age (Illustrative)
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Enter your chronological age and toggle three lifestyle factors to see a rough,
        illustrative biological-age delta. This is a simplified demo — not a clinical test.
      </p>

      <label className="block text-sm font-semibold text-indigo-900 mb-1" htmlFor="chrono-age">
        Your chronological age
      </label>
      <input
        id="chrono-age"
        type="number"
        min={1}
        max={119}
        value={chrono}
        onChange={(e) => setChrono(e.target.value)}
        placeholder="e.g. 42"
        className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                   text-base focus:outline-none focus:border-indigo-500 bg-white mb-4"
        aria-label="Enter your chronological age in years"
      />

      <div className="space-y-2 mb-4">
        {[
          { label: 'I sleep 7–9 hours most nights', val: sleepsWell, set: setSleepsWell },
          { label: 'I exercise vigorously several times a week', val: exercises, set: setExercises },
          { label: 'I eat a mostly plant-based, whole-food diet', val: eatsPlants, set: setEatsPlants },
        ].map((t) => (
          <label key={t.label}
                 className="flex items-center gap-3 bg-white border-2 border-indigo-200
                            rounded-xl px-4 py-3 text-sm text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={t.val}
              onChange={(e) => t.set(e.target.checked)}
              className="w-5 h-5 accent-indigo-600"
            />
            {t.label}
          </label>
        ))}
      </div>

      {valid && (
        <div data-testid="bio-age-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center
                            justify-center text-2xl font-black text-white flex-shrink-0">
              {bioAge}
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">
                Estimated biological age: {bioAge}
              </div>
              <div className="text-indigo-600 font-semibold text-sm">
                Roughly {deltaLabel} than your calendar age
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Illustrative only. BornClock&apos;s full estimate uses 8 lifestyle factors and
            population health research. For a proper reading, use the calculator below.
          </p>
          <a href="/biological-age-calculator"
             className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            Get my full biological age estimate →
          </a>
        </div>
      )}
    </div>
  );
}

export function BiologicalAgeArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Biological Age vs Chronological Age — The Science',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/biological-age-vs-chronological-age/',
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title={TITLE}
        description={DESC}
        canonicalUrl="/articles/biological-age-vs-chronological-age"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="biological-age-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Biological Age vs Chronological Age — The Real Science
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            You have two ages, and they rarely match. Your <strong>chronological age</strong> is
            the easy one: the number of calendar years since the day you were born. It ticks up
            by exactly one year every year, for everyone, no exceptions. Your{' '}
            <strong>biological age</strong> is the interesting one — an estimate of how old your
            body actually is, measured at the level of your cells, tissues, and physiology. Two
            people born on the same day can have biological ages a decade apart, and that gap is
            where nearly all of the modern longevity science lives.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            This guide explains how biological age is measured, why the Horvath epigenetic clock
            changed the field, which markers actually matter, and the five lifestyle changes with
            the strongest evidence for lowering your biological age. If you want a quick,
            illustrative estimate right now, you can try the mini-calculator further down, or use
            the full <a href="/biological-age-calculator" className="text-indigo-600 font-semibold underline">biological age calculator</a>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Chronological Age vs Biological Age, Side by Side
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">Chronological age</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Calendar years since birth. Fixed, universal, and completely outside your
                control. A 50th birthday means exactly 50 years have elapsed — nothing more,
                nothing less.
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <h3 className="font-bold text-indigo-900 mb-2">Biological age</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                How old the body is, estimated from biomarkers of ageing. It can run younger or
                older than your calendar age, and it responds — slowly — to how you live.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The Horvath Epigenetic Clock
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The single biggest breakthrough in measuring biological age came in 2013, when
            Steve <strong>Horvath</strong> published his epigenetic clock in the journal Genome
            Biology. Instead of guessing age from wrinkles or fitness, the Horvath clock reads{' '}
            <strong>DNA methylation</strong> — small chemical tags that attach to your DNA and
            switch genes on or off over the course of a lifetime. By measuring methylation at 353
            carefully chosen sites, the clock can predict a person&apos;s age with striking accuracy
            across almost every human tissue.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            What made the Horvath clock so influential is that DNA methylation turned out to be
            the <strong>most validated marker of biological age</strong> we have. When your
            methylation-predicted age runs ahead of your chronological age, that gap — sometimes
            called age acceleration — is associated with higher risk of disease and earlier
            mortality. Later clocks such as PhenoAge and GrimAge built on Horvath&apos;s work to
            predict health outcomes even more sharply, but they all trace back to the same 2013
            foundation.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">
            The Main Ways Biological Age Is Measured
          </h2>
          {MARKERS.map((m) => (
            <div key={m.name} className="mb-5 border-l-4 border-indigo-200 pl-4">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100
                                 rounded-full px-2 py-0.5 flex-shrink-0 whitespace-nowrap">
                  {m.strength}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{m.detail}</p>
            </div>
          ))}
          <p className="text-gray-700 leading-relaxed mb-6">
            In short: the DNA methylation clock is the gold standard, telomere length is a
            well-studied but noisier signal, and functional measures like VO2 max and grip
            strength are cheap, powerful proxies you can improve directly through training.
          </p>

          <BioAgeCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            5 Proven Ways to Lower Your Biological Age
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You cannot change your chronological age, but the evidence suggests you can bend your
            biological age. These are the five lifestyle levers with the strongest support in the
            longevity literature. None of them is magic in isolation — the effect comes from doing
            several, consistently, for years.
          </p>
          <ol className="space-y-4 mb-6">
            {LEVERS.map((l, i) => (
              <li key={l.name} className="flex gap-4 items-start bg-gray-50
                         border border-gray-200 rounded-xl p-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white
                                rounded-full flex items-center justify-center font-black text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{l.name}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{l.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The Bryan Johnson Example (Self-Reported)
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <p className="text-gray-700 leading-relaxed mb-3">
              The most famous attempt to reverse biological age is Bryan Johnson&apos;s Blueprint
              project. Johnson has publicly reported a roughly <strong>five-year reduction</strong>{' '}
              in his biological age across several epigenetic markers, achieved through an
              extraordinarily intensive protocol of measured diet, exercise, sleep, and dozens of
              tracked interventions.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Important caveat: this figure is <strong>self-reported</strong> and comes from a
              single individual running an expensive, unusual regimen. It is best read as an
              interesting anecdote about what people are trying — not as proven, generalisable
              science. The underlying levers he uses (sleep, diet, exercise, stress control) are
              the same well-supported ones above.
            </p>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            How BornClock Estimates Your Biological Age
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            BornClock does not run a laboratory DNA methylation test. Instead, it estimates your
            biological age from <strong>8 lifestyle factors</strong> — including sleep, exercise,
            diet quality, smoking, alcohol, stress, and body composition — mapped against
            large-scale population health research. The result is an illustrative estimate that
            shows how your habits push your biological age above or below your chronological age,
            and which levers would move it most.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            It is a starting point, not a diagnosis. But it points at exactly the same
            interventions the epigenetic science highlights, in a form you can act on today. To
            see your own number, use the{' '}
            <a href="/biological-age-calculator" className="text-indigo-600 font-semibold underline">biological age calculator</a>{' '}
            — and to see how those habits translate into a projected lifespan, try the{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">longevity calculator</a>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <section className="mb-10 bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="/articles/epigenetics-and-longevity"
                 className="block p-4 bg-white rounded-xl border border-gray-200
                            hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="font-semibold text-sm text-gray-900 mb-0.5">
                  Epigenetics and Longevity
                </div>
                <div className="text-xs text-gray-500">
                  How your genes are switched on and off — and what it means for how long you live.
                </div>
              </a>
              <a href="/articles/how-to-live-to-100"
                 className="block p-4 bg-white rounded-xl border border-gray-200
                            hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="font-semibold text-sm text-gray-900 mb-0.5">
                  How to Live to 100
                </div>
                <div className="text-xs text-gray-500">
                  The habits, science, and lessons from the world&apos;s longest-lived people.
                </div>
              </a>
            </div>
          </section>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Find Out Your Biological Age — Free</h2>
            <p className="text-indigo-200 mb-6">
              See how your lifestyle stacks up against the science, and get a personalised
              estimate of your biological age in a few minutes.
            </p>
            <a href="/biological-age-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Calculate My Biological Age →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default BiologicalAgeArticle;
