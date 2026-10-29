import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { ArticleLayout } from '@/components/central';
import { BIO_QUESTIONS } from '@/services/BiologicalAgeService';
import { WHAT_IS_BIO_AGE_DESC } from '@/content/biologicalAgeMeta';

export default function WhatIsMyBiologicalAge() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is my biological age?", "item": "https://bornclock.com/answers/what-is-my-biological-age" } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is My Biological Age? The Short Answer", "description": WHAT_IS_BIO_AGE_DESC, "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-06-17", "dateModified": "2026-10-29", "mainEntityOfPage": "https://bornclock.com/answers/what-is-my-biological-age" };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is biological age?", "acceptedAnswer": { "@type": "Answer", "text": "Biological age is an estimate of how well your body is working compared with what is typical for your calendar (chronological) age. Laboratory methods such as DNA methylation (epigenetic) clocks estimate it from a blood or saliva sample; simple quizzes like BornClock's give a rough lifestyle- and fitness-based estimate instead." } },
      { "@type": "Question", "name": "How is biological age different from chronological age?", "acceptedAnswer": { "@type": "Answer", "text": "Chronological age is simply the number of years since your birth. Biological age tries to capture how your body is doing — for example fitness, blood pressure and habits — compared with others of the same age." } },
      { "@type": "Question", "name": "Can you reduce your biological age?", "acceptedAnswer": { "@type": "Answer", "text": "Early research is encouraging but small. In a 2021 pilot trial in the journal Aging (Fitzgerald et al., 43 healthy men aged 50–72), an 8-week diet and lifestyle programme was linked to a 3.23-year lower Horvath DNA methylation age than the control group; larger trials are needed. Large cohort studies link not smoking, regular moderate exercise and limited alcohol with longer life expectancy." } },
      { "@type": "Question", "name": "What does BornClock's biological age calculator ask?", "acceptedAnswer": { "@type": "Answer", "text": "15 questions: resting heart rate, push-ups, one-leg balance, stair climbing, sleep, flexibility, memory, reaction speed, BMI, waist size, blood pressure, daily energy, smoking, alcohol and physical activity. It is a lifestyle- and fitness-based estimate built from published risk factors, not a lab test or epigenetic clock." } }
    ]
  };

  return (
    <ArticleLayout
      theme="science"
      testId="answer-what-is-my-biological-age"
      seo={(
        <SEO
          title="What Is My Biological Age? The Short Answer + Free Test | BornClock"
          description={WHAT_IS_BIO_AGE_DESC}
          canonicalUrl="/answers/what-is-my-biological-age"
          ogType="article"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Answers', to: '/answers' }], current: 'What is biological age?' }}
      eyebrow="Answers"
      h1={<>What Is My Biological Age? The Short Answer</>}
      lead={<>Know your time. Live it well.</>}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-[#2F6FB0]/10 border-l-4 border-[#2F6FB0]/30 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-[#2F6FB0] leading-relaxed">
              Biological age is an estimate of how well your body is working compared with what is typical for your calendar age (the years since you were born). Labs estimate it from blood or saliva samples using DNA methylation &ldquo;epigenetic clocks&rdquo;; free quizzes like ours give a rough estimate from your fitness, body measurements and habits instead.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">What Biological Age Actually Measures</h2>
            <p>Chronological age is simply a count of years since birth. &ldquo;Biological age&rdquo; is a broad idea: different researchers estimate it in different ways — from physical tests (such as balance, grip strength or walking speed), from blood tests, or from DNA methylation.</p>
            <p>The best-known laboratory method is the <strong>epigenetic clock</strong>, which reads DNA methylation patterns in a sample. Steve Horvath published a widely used version in <em>Genome Biology</em> in 2013. Epigenetic age is a specific lab measure — a quiz cannot tell you your epigenetic age.</p>

            <h2 className="text-xl font-bold text-gray-900">The {BIO_QUESTIONS.length} Questions BornClock&rsquo;s Calculator Asks</h2>
            <p>Our calculator is a lifestyle- and fitness-based estimate built from published risk factors — not a lab test or epigenetic clock. Each answer adds or removes a small number of years:</p>
            <ol className="list-decimal pl-6 space-y-1">
              {BIO_QUESTIONS.map(q => (
                <li key={q.id}><strong>{q.biomarkerName}</strong></li>
              ))}
            </ol>
            <p>Balance is compared with the average for your age group, and push-ups with a benchmark for your age and sex. BMI and waist use cut-offs suited to South Asians (WHO expert consultation, 2004; IDF, 2005).</p>

            <h2 className="text-xl font-bold text-gray-900">Can You Reduce Your Biological Age?</h2>
            <p>Many of the habits above can change. In one small pilot trial published in <em>Aging</em> in 2021, Kara Fitzgerald and colleagues gave 43 healthy men aged 50–72 an 8-week diet, sleep, exercise and relaxation programme with supplements. Their Horvath DNA methylation age was 3.23 years lower than the control group&rsquo;s at the end. The authors say larger and longer trials are needed to confirm this.</p>
            <p>Larger long-term studies of life expectancy point the same way: lifelong smokers died about 10 years earlier than non-smokers in a 50-year study of British doctors (Doll et al., BMJ 2004); about 15 minutes a day of moderate exercise was linked with about 3 extra years of life expectancy in 416,175 adults in Taiwan (Wen et al., Lancet 2011); and drinking more than about 100 g of alcohol a week was linked with shorter life expectancy (Wood et al., Lancet 2018).</p>

            <h2 className="text-xl font-bold text-gray-900">What a Higher or Lower Result Means</h2>
            <p><strong>If your estimate is higher than your calendar age:</strong> some of your answers added years. Look at which items did, and pick one small change. It is an estimate, not a diagnosis — talk to a doctor about anything that concerns you, such as a blood pressure of 140 or more.</p>
            <p><strong>If your estimate is lower than your calendar age:</strong> your answers point to fitness and habits that are better than typical for your age. Keep them up.</p>

            <h2 className="text-xl font-bold text-gray-900">Simple Steps That Move the Quiz Items</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stop smoking</strong> — quitting helps at every age (India&rsquo;s free National Tobacco Quitline: 1800-11-2356)</li>
              <li><strong>Move daily</strong> — start with 15 minutes of brisk walking and build towards 30</li>
              <li><strong>Sleep regularly</strong> — a fixed bedtime and wake-up time</li>
              <li><strong>Drink less alcohol</strong> — less is better</li>
              <li><strong>Know your blood pressure</strong> — a quick check at a pharmacy or with a home monitor</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Try the Biological Age Calculator</p>
            <p className="text-sm text-gray-500 mb-4">{BIO_QUESTIONS.length} questions · Free, no sign-up · A rough guide, not a lab test</p>
            <Link to="/biological-age"
              className="inline-block bg-[#0E2238] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0E2238] transition-colors">
              Estimate My Biological Age →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/biological-age-vs-chronological-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 transition-colors text-sm text-gray-700 hover:text-[#2F6FB0]">→ Biological vs chronological age: the full science</Link>
              <Link to="/answers/how-long-will-i-live" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 transition-colors text-sm text-gray-700 hover:text-[#2F6FB0]">→ How long will I live?</Link>
              <Link to="/answers/what-is-bmi" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 transition-colors text-sm text-gray-700 hover:text-[#2F6FB0]">→ What is BMI and what does my number mean?</Link>
              <Link to="/answers/how-to-live-longer" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 transition-colors text-sm text-gray-700 hover:text-[#2F6FB0]">→ How to live longer: what science actually says</Link>
              <Link to="/answers/how-does-stress-affect-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 transition-colors text-sm text-gray-700 hover:text-[#2F6FB0]">→ How does stress affect life expectancy?</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Tools</p>
            <div className="flex flex-wrap gap-2">
              {[
                { path: '/biological-age', label: 'Biological Age Calculator' },
                { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
                { path: '/biological-age-vs-chronological-age', label: 'Biological vs Chronological Age' },
                { path: '/answers/what-is-epigenetic-age', label: 'What Is Epigenetic Age?' },
              ].map((t) => (
                <Link key={t.path} to={t.path} className="text-sm px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 text-gray-700 hover:text-[#2F6FB0] transition-colors">{t.label}</Link>
              ))}
            </div>
          </div>
        </div>
    </ArticleLayout>
  );
}
