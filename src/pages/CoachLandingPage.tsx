import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { PageFAQ } from '@/components/PageFAQ';
import { SharePageBar } from '@/components/SharePageBar';
import { postsForTags } from '@/lib/mesh';
import { Bot, Check, X, ArrowRightCircle } from 'lucide-react';

const CAN_DO = [
  'Explain what each factor in your forecast means and why it moved your number',
  'Point to your single biggest opportunity to add years, using your actual data',
  'Translate the science — sleep, exercise, stress, diet, BMI — into plain language',
  'Suggest specific, evidence-based next steps you can act on today',
];
const CANNOT_DO = [
  'Diagnose a condition or interpret your symptoms, medications or test results',
  'Replace a doctor who can examine you and knows your history',
  'Predict how long you will actually live — the forecast is a statistical estimate',
  'See anything you did not enter — it only knows your forecast inputs',
];

// In-body WebApplication schema (Helmet-injected JSON-LD does not survive prerender).
const WEBAPP_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BornClock Longevity Coach',
  description: 'A personal AI longevity coach that explains your life-expectancy forecast and health factors in plain language, with evidence-based next steps — never a diagnosis.',
  url: 'https://bornclock.com/coach/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Included with the free trial and BornClock Premium' },
};

export default function CoachLandingPage() {
  const meshPosts = postsForTags(['life expectancy', 'longevity', 'health', 'stress', 'sleep'], 2);

  const faqs = [
    { question: 'What is the BornClock Longevity Coach?', answer: 'It is an AI coach built into your life-expectancy results. It reads your own forecast — your factor breakdown, genetic score and bonuses — and answers questions about them in plain language, with practical, evidence-based next steps. It explains your data; it never diagnoses.' },
    { question: 'Can the Coach give medical advice?', answer: 'No. It is not a clinician. It will explain what a factor means and what the general evidence says, but it will not interpret your symptoms, medications or test results, and it will point you to a healthcare professional for anything that needs one.' },
    { question: 'Who can use it?', answer: 'The Coach is part of the Premium experience and is available during your free trial. You reach it inside the Life Expectancy results, once you have generated a forecast.' },
    { question: 'Does it predict how long I will live?', answer: 'No. Your forecast is a statistical estimate from self-reported factors and population data — not a clinical measurement or a prediction. The Coach uses that estimate to explain patterns and options; it never tells you a date.' },
    { question: 'Is my health data stored?', answer: 'Your Coach conversation is processed transiently to generate a reply — the message content and your forecast data are not persisted or logged.' },
    { question: 'How do I start using it?', answer: 'Generate your Life Expectancy forecast, then open the Coach panel in your results to ask your first question.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="AI Longevity Coach — Understand Your Life-Expectancy Forecast | BornClock"
        description="A personal AI longevity coach that explains your life-expectancy forecast and health factors in plain language, with evidence-based next steps. It explains your data — it never diagnoses."
        keywords="ai longevity coach, ai health coach, longevity coach, personalised health guidance, life expectancy coach, understand my health score"
        canonicalUrl="/coach"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_LD) }} />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-5">
          <Bot className="w-4 h-4" /> Longevity Coach
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          A coach that explains your forecast — not a doctor that diagnoses you
        </h1>
        {/* Answer-first (AEO) */}
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
          The BornClock Longevity Coach is an AI advisor built into your life-expectancy results. It
          reads your own forecast — your factor breakdown, genetic score and bonuses — and answers
          questions about them in plain language, with evidence-based next steps. It explains your data
          and points you toward what you can change; it never diagnoses, and never predicts a date.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link to="/life-expectancy" className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-indigo-700 transition-colors">
            <ArrowRightCircle className="w-5 h-5" /> Get your forecast & meet the Coach
          </Link>
          <Link to="/upgrade" className="inline-flex items-center gap-2 border border-gray-300 rounded-xl px-6 py-3 font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors">
            See Premium pricing
          </Link>
        </div>
        <div className="mt-6"><SharePageBar path="/coach" title="AI Longevity Coach" text="An AI coach that explains your life-expectancy forecast in plain language — never a diagnosis" className="justify-center" /></div>
      </section>

      {/* Can / cannot — the honest register */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-green-200 bg-green-50 rounded-xl p-5">
            <p className="font-bold text-green-800 mb-3">What it can do</p>
            <ul className="space-y-2">
              {CAN_DO.map(x => <li key={x} className="flex items-start gap-2 text-sm text-green-900"><Check className="w-4 h-4 mt-0.5 shrink-0" />{x}</li>)}
            </ul>
          </div>
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
            <p className="font-bold text-amber-800 mb-3">What it will not do</p>
            <ul className="space-y-2">
              {CANNOT_DO.map(x => <li key={x} className="flex items-start gap-2 text-sm text-amber-900"><X className="w-4 h-4 mt-0.5 shrink-0" />{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Who gets it */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Who gets the Coach</h2>
          <p className="text-gray-700 leading-relaxed">
            The Coach is part of the Premium experience and is available during your{' '}
            <strong>free trial</strong>. It lives inside your{' '}
            <Link to="/life-expectancy" className="text-indigo-600 hover:underline">Life Expectancy results</Link>{' '}
            — generate a forecast, then open the Coach panel to ask your first question. See{' '}
            <Link to="/upgrade" className="text-indigo-600 hover:underline">Premium pricing</Link> for details.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 pb-4">
        <PageFAQ title="Longevity Coach — FAQ" items={faqs} />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {meshPosts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ {p.title}</Link>
          ))}
          <Link to="/life-expectancy" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Life Expectancy Calculator</Link>
          <Link to="/biological-age" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Biological Age</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
