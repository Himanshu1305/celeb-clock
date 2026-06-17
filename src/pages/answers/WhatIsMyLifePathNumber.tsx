import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function WhatIsMyLifePathNumber() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is my Life Path number?", "acceptedAnswer": { "@type": "Answer", "text": "Your Life Path number is calculated by reducing your full date of birth to a single digit (or master number 11, 22, 33). Add all digits of your birth month, day, and year together, then reduce to a single digit." } },
      { "@type": "Question", "name": "How do I calculate my Life Path number?", "acceptedAnswer": { "@type": "Answer", "text": "Example: July 14, 1990. Month: 7. Day: 1+4=5. Year: 1+9+9+0=19→1+9=10→1. Total: 7+5+1=13→1+3=4. Life Path 4." } },
      { "@type": "Question", "name": "What do the Life Path numbers mean?", "acceptedAnswer": { "@type": "Answer", "text": "Life Path 1=Leader, 2=Diplomat, 3=Creator, 4=Builder, 5=Explorer, 6=Nurturer, 7=Seeker, 8=Achiever, 9=Humanitarian. Master numbers 11=Intuitive Visionary, 22=Master Builder, 33=Master Teacher." } },
      { "@type": "Question", "name": "What are master numbers in numerology?", "acceptedAnswer": { "@type": "Answer", "text": "Master numbers (11, 22, 33) are not reduced further. They carry amplified energy: 11 is the Intuitive Visionary, 22 is the Master Builder with capacity to manifest grand visions, and 33 is the rare Master Teacher associated with unconditional service." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Is My Life Path Number and What Does It Mean? | BornClock"
        description="Your Life Path number is calculated from your full date of birth and reveals your core purpose. Calculate yours free and get your 2026 Personal Year forecast."
        canonicalUrl="/answers/what-is-my-life-path-number"
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
            <span className="text-gray-600">What is my Life Path number?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is My Life Path Number and What Does It Mean?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your Life Path number is calculated by reducing your full date of birth to a single digit (or master number 11, 22, 33). It represents your core purpose, the challenges you're here to master, and the strengths you were born with. It is the most important number in numerology.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">How to Calculate Your Life Path Number</h2>
            <p>The Pythagorean method reduces your full date of birth to a single digit by adding all digits together repeatedly. Example: <strong>July 14, 1990 = 07/14/1990</strong></p>
            <p>Step 1: Reduce each component: Month: 0+7 = 7 · Day: 1+4 = 5 · Year: 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1</p>
            <p>Step 2: Add the results: 7 + 5 + 1 = 13 → 1+3 = <strong>4</strong></p>
            <p>Note: If at any stage you reach 11, 22, or 33 before reducing further, stop — these are Master Numbers with special significance.</p>

            <h2 className="text-xl font-bold text-gray-900">What Each Life Path Number Means</h2>
            <p><strong>1 — The Leader:</strong> Independent, pioneering, and driven to create something original. Life path 1s are born initiators who thrive when they're the first to do something. Famous 1s: Steve Jobs, Martin Luther King Jr., Lady Gaga.</p>
            <p><strong>2 — The Diplomat:</strong> Sensitive, cooperative, and gifted at bringing people together. 2s are natural peacemakers who excel in partnerships. Famous 2s: Barack Obama, Jennifer Aniston.</p>
            <p><strong>3 — The Creator:</strong> Expressive, optimistic, and creative. 3s communicate with unusual flair and often excel in the arts, writing, or speaking. Famous 3s: David Bowie, Celine Dion.</p>
            <p><strong>4 — The Builder:</strong> Practical, disciplined, and focused on creating lasting foundations. 4s work methodically and are reliable to a fault. Famous 4s: Oprah Winfrey, Bill Gates.</p>
            <p><strong>5 — The Explorer:</strong> Freedom-loving, versatile, and magnetic. 5s crave change and experience, and often lead unconventional lives. Famous 5s: Beyoncé, Abraham Lincoln.</p>
            <p><strong>6 — The Nurturer:</strong> Responsible, caring, and devoted to family and community. 6s are natural healers and teachers. Famous 6s: Michael Jackson, Albert Einstein.</p>
            <p><strong>7 — The Seeker:</strong> Analytical, introspective, and drawn to the mysteries of existence. 7s are researchers and truth-seekers. Famous 7s: Elon Musk, Marilyn Monroe.</p>
            <p><strong>8 — The Achiever:</strong> Ambitious, authoritative, and driven to manifest abundance. 8s understand power and often achieve great material or institutional success. Famous 8s: Warren Buffett, Nelson Mandela.</p>
            <p><strong>9 — The Humanitarian:</strong> Compassionate, visionary, and idealistic. 9s are old souls with a calling to serve humanity. Famous 9s: Gandhi, Mother Teresa.</p>

            <h2 className="text-xl font-bold text-gray-900">Master Numbers: 11, 22, 33</h2>
            <p><strong>11</strong> is the intuitive visionary — highly sensitive, spiritually aware, and often called to inspire large numbers of people. The shadow side is anxiety and self-doubt. Famous 11s: Emma Watson, Bill Clinton.</p>
            <p><strong>22</strong> is the master builder — combines the intuition of 11 with the practical ability of 4, giving them rare capacity to turn big visions into reality. Famous 22s: Will Smith, Oprah Winfrey (born with a 22 birth day).</p>
            <p><strong>33</strong> is the master teacher — the most spiritually evolved number, associated with unconditional love and selfless service. True 33s are exceptionally rare.</p>

            <h2 className="text-xl font-bold text-gray-900">Your Personal Year Number for 2026</h2>
            <p>Your Personal Year number changes every calendar year and reflects the energy theme of the 12 months ahead. Calculate it: <strong>add your birth month + birth day + 2026</strong>, then reduce to a single digit.</p>
            <p>Example: Born July 14 → 7+14+2026 = 2047 → 2+0+4+7 = 13 → 1+3 = 4. Personal Year 4 in 2026 is a year of building foundations, practical effort, and establishing order.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Calculate My Life Path Number</p>
            <p className="text-sm text-gray-500 mb-4">Instant calculation · All 9 numbers + Master Numbers + 2026 forecast</p>
            <Link to="/numerology"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate My Life Path Number →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my zodiac sign?</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ Who shares my birthday?</Link>
              <Link to="/answers/how-to-calculate-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to calculate my exact age</Link>
              <Link to="/answers/what-generation-am-i" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What generation am I?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
