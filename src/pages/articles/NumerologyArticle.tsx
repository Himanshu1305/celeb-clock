import React from 'react';
import { ArticleLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { LIFE_PATH_EXTENDED } from '@/data/astrologicalData';
import { famousForLifePath } from '@/data/famousLifePaths';
import { mulank, bhagyank } from '@/lib/numerologyExtra';
import { lifePathWorking } from '@/lib/lifePath';
import { Link } from 'react-router-dom';

// Batch 9 (cannibalisation): this article is the INDIA GUIDE — what Mulank, Bhagyank and
// the Western Life Path are and why they can differ. The calculator lives on /numerology,
// the short answer on /answers/what-is-my-life-path-number, and the per-number pages on
// /numerology/:n. Every worked example below is computed by the shared functions.
const EX = { mul: mulank(28), bh: bhagyank(28, 3, 1973), lp: lifePathWorking(28, 3, 1973) };
// A date whose Western Life Path is a master number (Meryl Streep, 22 June 1949 — the
// example /numerology uses): Bhagyank 6, Western master number 33.
const MASTER_EX = { mul: mulank(22), bh: bhagyank(22, 6, 1949), lp: lifePathWorking(22, 6, 1949) };

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Indian examples, GENERATED from the one shared Life Path function over a dated list
// (src/data/famousLifePaths.ts) so no one is filed under a number their date doesn't give.
const CELEB_EXAMPLES: Record<number, string> = Object.fromEntries(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map(n => [
    n,
    famousForLifePath(n, { indianOnly: true, limit: 2 }).map(e => `${e.name} (${e.born})`).join(', '),
  ]),
);

const FAQS = [
  {
    q: 'What is the difference between Mulank, Bhagyank and Life Path?',
    a: 'Mulank uses only your birth day, reduced to 1–9 (28 → 10 → 1). Bhagyank adds every digit of your full date of birth and reduces to 1–9 (28-03-1973 → 33 → 6). The Western Life Path reduces the day, month and year separately and keeps the master numbers 11, 22 and 33. Bhagyank and Life Path always end on the same single digit; they only look different when the Western method stops at a master number.',
  },
  {
    q: 'Which number matters more in Indian numerology — Mulank or Bhagyank?',
    a: 'Indian numerologists read them together: Mulank is usually described as your natural temperament (from the day you were born), Bhagyank as the broader direction of your life (from the whole date). Neither is "better"; they answer different questions.',
  },
  {
    q: 'Why does one site say my number is 11 and another says 2?',
    a: 'Indian Mulank and Bhagyank calculators reduce every total to a single digit, so 11 becomes 2. Western Life Path calculators keep 11, 22 and 33 as master numbers. Both are following their own convention correctly. BornClock shows the Indian number first and the Western master number separately, each labelled.',
  },
  {
    q: 'Is numerology accurate for predicting the future?',
    a: 'Numerology is a system of self-understanding and reflection, not fortune-telling. It describes tendencies, strengths and challenges — it does not predict specific events. BornClock presents numerology as cultural insight and a tool for self-reflection, never as a guaranteed forecast.',
  },
  {
    q: 'Where can I calculate all three numbers?',
    a: 'Use the free BornClock numerology calculator at /numerology — enter your date of birth (and, optionally, your name) to see your Mulank, Bhagyank, Western Life Path and Chaldean name number, with the working shown.',
  },
];

export function NumerologyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Mulank, Bhagyank & Life Path — Numerology by Date of Birth (India Guide)',
    description: 'What Mulank, Bhagyank and the Western Life Path are, how each is calculated from your date of birth, and why they can show different numbers.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/numerology-by-date-of-birth/',
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
    <ArticleLayout
      theme="mystic"
      testId="numerology-article"
      seo={(
        <SEO
          title="Mulank vs Bhagyank vs Life Path — India Numerology Guide | BornClock"
          description="Numerology by date of birth, explained for India: what Mulank, Bhagyank and the Western Life Path are, how each is worked out, and why 11 can become 2."
          canonicalUrl="/articles/numerology-by-date-of-birth"
          ogType="article"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Articles', to: '/articles' }], current: 'Numerology by Date of Birth' }}
      footer={{
        tagline: 'Mulank, Bhagyank and the Western Life Path — three numbers from one date of birth, explained.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Numerology', to: '/numerology' },
          { label: 'Zodiac', to: '/zodiac' },
          { label: 'Compatibility', to: '/compatibility' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Numerology"
      h1="Mulank vs Bhagyank vs Life Path — Numerology by Date of Birth (India Guide)"
      lead={(
        <>
          In India, "numerology by date of birth" usually means two numbers — your
          Mulank and your Bhagyank — while most Western sites talk about a single
          Life Path number. This guide explains all three, shows how each is worked out
          from the same date, and why one site may call you an 11 while another says 2.
        </>
      )}

    >
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <section className="section" data-testid="numerology-article">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <div className="bg-[#6E5AA6]/10 border-2 border-[#6E5AA6]/30 rounded-2xl p-5 mb-8" data-testid="article-calc-cta">
            <p className="text-gray-800 mb-3">Just want your numbers? The free calculator shows your Mulank, Bhagyank, Western Life Path and name number with the working.</p>
            <Link to="/numerology" className="inline-block bg-[#0E2238] text-white font-bold px-5 py-2.5 rounded-full text-sm">Open the numerology calculator →</Link>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Three numbers from one birth date</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Take <strong>28 March 1973</strong>:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2" data-testid="article-three-numbers">
            <li><strong>Mulank (Indian, birth day only):</strong> {EX.mul.working} → <strong>Mulank {EX.mul.number}</strong>. Read as your natural temperament.</li>
            <li><strong>Bhagyank (Indian, every digit of the date):</strong> {EX.bh.working} → <strong>Bhagyank {EX.bh.number}</strong>. Read as the broad direction of your life.</li>
            <li><strong>Western Life Path (day, month, year reduced separately):</strong> {EX.lp.steps} → <strong>Life Path {EX.lp.number}</strong>.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            Bhagyank and Life Path always end on the same single digit — adding the digits all at
            once or in three groups gives the same remainder. They look different only when the
            Western method stops at a <strong>master number</strong> (11, 22 or 33), which Indian
            calculators always reduce further.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">When the answers seem to differ: master numbers</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Take <strong>22 June 1949</strong>:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2" data-testid="article-master-example">
            <li><strong>Mulank:</strong> {MASTER_EX.mul.working} → {MASTER_EX.mul.number}</li>
            <li><strong>Bhagyank:</strong> {MASTER_EX.bh.working} → {MASTER_EX.bh.number}</li>
            <li><strong>Western Life Path:</strong> {MASTER_EX.lp.steps} → <strong>{MASTER_EX.lp.number}</strong>{MASTER_EX.lp.isMaster ? ' (master number, kept)' : ''}</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            Both are right within their own tradition: the Indian Bhagyank is {MASTER_EX.bh.number}; the
            Western Life Path is the master number {MASTER_EX.lp.number}, whose single digit is also {MASTER_EX.bh.number}.
            BornClock shows the Indian number first and the Western master number separately, each labelled.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">And your name number</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Indian numerologists also read a <strong>name number</strong>, using the Chaldean letter chart
            (values 1–8, no letter given 9). See the <Link to="/chaldean-numerology" className="text-[#6E5AA6] underline">Chaldean chart</Link> or
            work yours out on the <Link to="/name-numerology" className="text-[#6E5AA6] underline">name number calculator</Link>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-2">The Western Life Path numbers, with Indian examples</h2>
          <p className="text-sm text-gray-600 mb-4">Each number has its own page with Mulank and name-number readings too — follow the links.</p>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map(n => {
            const p = LIFE_PATH_EXTENDED[n];
            if (!p) return null;
            return (
              <section key={n} id={`life-path-${n}`} className="mb-10">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  <Link to={`/numerology/${n}`} className="hover:underline">Life Path {n} — {p.title}</Link>
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  Ruling Planet: {p.ruling_planet} · Element: {p.element}
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{p.traits}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-green-700 mb-1">Strengths</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {p.strengths.map(s => <li key={s}>• {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-700 mb-1">Challenges</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {p.challenges.map(c => <li key={c}>• {c}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Love: </strong>{p.love_style}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Career paths: </strong>{p.career_paths.join(', ')}.
                </p>
                <p className="text-sm text-[#6E5AA6] mb-3 italic">
                  <strong>Spiritual lesson: </strong>{p.spiritual_lesson}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Famous Indians with Life Path {n}: </strong>
                  {CELEB_EXAMPLES[n] || 'Examples being added.'}
                </p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#6E5AA6] to-[#6E5AA6] rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Want the complete birthday report?</h2>
            <p className="text-[#6E5AA6] mb-6">
              Your Life Path is just one piece. BornClock also shows your Vedic Rashi,
              Western zodiac, Nakshatra, lucky stone, and more — all from your date of birth. Your
              Mulank, Bhagyank and Life Path stay free on the numerology calculator.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-[#6E5AA6] font-black px-8 py-3
                          rounded-full text-lg hover:bg-[#6E5AA6]/10 transition-colors">
              See the full Birthday Report →
            </a>
          </div>

        </article>
      </section>
    </ArticleLayout>
  );
}

export default NumerologyArticle;
