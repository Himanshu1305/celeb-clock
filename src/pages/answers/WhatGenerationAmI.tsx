import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function WhatGenerationAmI() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What generation am I?", "acceptedAnswer": { "@type": "Answer", "text": "Gen Alpha: 2013+. Gen Z: 1997–2012. Millennials: 1981–1996. Gen X: 1965–1980. Baby Boomers: 1946–1964. Silent Generation: 1928–1945. Your generation is determined by your birth year." } },
      { "@type": "Question", "name": "Am I a Millennial or Gen Z?", "acceptedAnswer": { "@type": "Answer", "text": "If you were born between 1981–1996, you're a Millennial. If born 1997–2012, you're Gen Z. People born 1995–1998 are sometimes called 'Zillennials' — the micro-generation at the cusp of both." } },
      { "@type": "Question", "name": "What are the Gen Z birth years?", "acceptedAnswer": { "@type": "Answer", "text": "Gen Z birth years are 1997–2012 (Pew Research definition). Gen Z came of age with smartphones, social media, and the climate crisis as defining features of their formative years." } },
      { "@type": "Question", "name": "What is Gen Alpha?", "acceptedAnswer": { "@type": "Answer", "text": "Gen Alpha (2013–present) are the first generation born entirely in the 21st century. They are true digital natives who have grown up with tablets, AI assistants, and social media from birth." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Generation Am I? Gen Z, Millennial, Gen X, Boomer Explained | BornClock"
        description="Find out which generation you belong to based on your birth year. Gen Z, Millennials, Gen X, Baby Boomers, Silent Generation and Gen Alpha — years and traits explained."
        canonicalUrl="/answers/what-generation-am-i"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">What generation am I?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Generation Am I? Gen Z, Millennial, Gen X, Boomer Explained</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your generation is determined by your birth year. Gen Alpha: 2013+. Gen Z: 1997–2012. Millennials: 1981–1996. Gen X: 1965–1980. Baby Boomers: 1946–1964. Silent Generation: 1928–1945. Each generation was shaped by the technology, world events, and cultural forces of their formative years.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">Generation Alpha (2013–present) 🤖</h2>
            <p>The first generation to be born entirely in the 21st century. Gen Alpha are true digital natives — many received tablet devices before they could read. They are growing up amid AI, climate consciousness, and unprecedented technological change. This generation will be the most educated and longest-lived in history. Defining events: COVID-19 pandemic (their early childhood), AI revolution, climate activism mainstreaming.</p>

            <h2 className="text-xl font-bold text-gray-900">Generation Z (1997–2012) ⚡</h2>
            <p>Gen Z came of age with smartphones, social media, and the 2008 recession's aftermath shaping their parents' financial anxieties. They are the most diverse, most educated, and most anxious generation yet measured. They value authenticity over aspiration, and mental health over career prestige. Defining events: social media explosion, climate crisis, Black Lives Matter, COVID-19, economic precarity. Famous Gen Z: Billie Eilish, Olivia Rodrigo, Greta Thunberg.</p>

            <h2 className="text-xl font-bold text-gray-900">Millennials (1981–1996) 🌐</h2>
            <p>Millennials bridged the analogue and digital worlds — they remember life before the internet and smartphones, but have adopted digital life fully. Defined by student debt, delayed life milestones (marriage, home ownership), and purpose-driven careers. They are now the largest generation in the workforce. Defining events: 9/11, 2008 financial crisis, rise of social media, smartphones. Famous Millennials: Mark Zuckerberg, Emma Watson, Drake.</p>

            <h2 className="text-xl font-bold text-gray-900">Generation X (1965–1980) 🎸</h2>
            <p>The "latchkey generation" — often overlooked between the cultural dominance of Boomers and Millennials. Gen X is self-reliant, sceptical of authority, and pragmatic. They lived through the AIDS crisis, the Cold War's end, and the early internet. They entered the workforce during a strong economy and largely built good financial foundations. Famous Gen X: Jeff Bezos, Elon Musk, Barack Obama.</p>

            <h2 className="text-xl font-bold text-gray-900">Baby Boomers (1946–1964) ✌️</h2>
            <p>Born in the post-World War II economic boom, Boomers enjoyed unprecedented prosperity, social upheaval, and counterculture revolution. They defined the 1960s and 70s culturally and politically. Now aged 60–78, Boomers are retiring in large numbers, reshaping healthcare and social systems. Famous Boomers: Bill Gates, Steve Jobs, Oprah Winfrey, Bill Clinton.</p>

            <h2 className="text-xl font-bold text-gray-900">Silent Generation (1928–1945) 📻</h2>
            <p>Named for their tendency to work within systems rather than protest against them, the Silent Generation grew up through the Great Depression and WWII. They value discipline, loyalty, and conformity. Many are now in their 80s and 90s. Famous Silents: Martin Luther King Jr., Elvis Presley, Marilyn Monroe.</p>

            <h2 className="text-xl font-bold text-gray-900">How Generations Are Defined</h2>
            <p>Generation boundaries are not scientifically precise — they're sociological constructs. Pew Research, the most cited source, defines generations based on shared formative experiences rather than arbitrary cutoffs. The year ranges above reflect Pew Research 2023 definitions, which are the most widely used in academic and popular contexts.</p>

            <h2 className="text-xl font-bold text-gray-900">Why Generation Matters for Longevity Research</h2>
            <p>Generational cohorts experience different environmental exposures that affect health outcomes. Baby Boomers had higher smoking rates in their youth; Gen X faced the peak of fast food culture. Millennials and Gen Z have higher rates of anxiety and depression but lower rates of smoking and drunk driving. Each generation's health trajectory reflects the society they were raised in.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Find My Generation and Birthday Insights</p>
            <p className="text-sm text-gray-500 mb-4">Instant · Celebrity twins · Zodiac · Live age countdown</p>
            <Link to="/age-calculator"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Find My Generation and Birthday Insights →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-to-calculate-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to calculate my exact age</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ Who shares my birthday?</Link>
              <Link to="/answers/how-long-will-i-live" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How long will I live?</Link>
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my zodiac sign?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
