import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { AnswerLayout } from '@/components/AnswerLayout';

const CANONICAL = 'https://bornclock.com/answers/what-is-vedic-astrology';

const RELATED = [
  { path: '/vedic-zodiac', label: 'Vedic Zodiac' },
  { path: '/moon-sign', label: 'Moon Sign Calculator' },
  { path: '/compatibility', label: 'Compatibility' },
  { path: '/sun-vs-moon-sign', label: 'Sun vs Moon Sign' },
];

export default function WhatIsVedicAstrology() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is Vedic astrology?", "item": CANONICAL } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is Vedic Astrology — and Why Are You Probably a Different Sign?", "description": "Vedic astrology uses a different zodiac than Western — which is why your Vedic sign is usually one sign behind. Plus what Vedic astrology actually emphasizes that Western doesn't.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-08-06", "dateModified": "2026-08-06", "mainEntityOfPage": CANONICAL };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Why is my Vedic sign different from my Western sign?", "acceptedAnswer": { "@type": "Answer", "text": "Because the two systems use different zodiacs. Western uses the tropical zodiac (anchored to seasons); Vedic uses the sidereal zodiac (anchored to actual star positions). Due to 2,000 years of drift in Earth's axis (precession of the equinoxes), the two are now about 23–24 degrees apart — enough to shift most people one sign back in the Vedic system." } },
      { "@type": "Question", "name": "Which is more accurate — Vedic or Western astrology?", "acceptedAnswer": { "@type": "Answer", "text": "Neither has been validated as predictively accurate by peer-reviewed science. Within their respective traditions, both are considered complete systems. Vedic has a stronger predictive tradition through the dasha system; Western has a stronger psychological focus. Many people find one resonates more than the other — and some use both." } },
      { "@type": "Question", "name": "What is the most important sign in Vedic astrology?", "acceptedAnswer": { "@type": "Answer", "text": "The moon sign (Rashi) is considered primary — more important than the sun sign for personality. The birth nakshatra is considered even more fundamental by many Vedic astrologers." } },
      { "@type": "Question", "name": "Is kundali matching still used for marriages in India?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — widely. Kundali milan involves matching 36 qualities (gunas) between prospective couples' charts, with 18 or more considered the minimum for compatibility. It remains standard practice across much of India, including in educated urban families." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Is Vedic Astrology? Why Your Sign Is Probably Different | BornClock"
        description="Vedic astrology uses a different zodiac than Western — which is why your Vedic sign is usually one sign behind. Plus what Vedic astrology actually emphasizes that Western doesn't."
        canonicalUrl="/answers/what-is-vedic-astrology"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AnswerLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">What is Vedic astrology?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is Vedic Astrology — and Why Are You Probably a Different Sign?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Vedic astrology (Jyotisha — Sanskrit for "science of light") is an ancient Indian system with roots stretching back over 5,000 years. It differs from Western astrology primarily in the zodiac it uses: Vedic astrology uses the sidereal zodiac, based on the actual positions of constellations as observed from Earth. Western astrology uses the tropical zodiac, anchored to the seasons. Because of a phenomenon called the precession of the equinoxes, the two zodiacs have drifted about 23–24 degrees apart — enough to shift most people back one full sign. If you've always been a Western Scorpio, you're probably a Vedic Libra.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">The identity moment</h2>
            <p>For many people, discovering their Vedic sign triggers something unexpected: a quiet identity crisis. You've spent years — maybe decades — reading about your Western sign, identifying with its traits, explaining yourself through it. And now someone is telling you that you're actually something else.</p>
            <p>Here's the thing: you're not. Both are right, and both describe something real about you. They're just measuring different things.</p>
            <p>Your Western sign tells you about your relationship to the seasons — specifically, the season in which your life began. Your Vedic sign tells you about your relationship to the actual star constellations visible in the sky at your birth. Neither is the "true" sign. They're two different lenses on the same person. Many people find that once they let go of the identity attachment, both signs describe something real — one more outward, one more deep.</p>

            <h2 className="text-xl font-bold text-gray-900">Why the signs are different — the actual explanation</h2>
            <p>The Western tropical zodiac is anchored to the seasons. Aries begins at the spring equinox (around March 21) regardless of where the Aries constellation physically is in the sky. This system was standardized roughly 2,000 years ago — when the equinox point did align with the Aries constellation. But Earth's axis wobbles over time, in a cycle called the precession of the equinoxes, causing the equinox point to drift slowly backward through the constellations at about 1 degree every 72 years.</p>
            <p>Over 2,000 years, that drift adds up to approximately 23–24 degrees — just enough to shift most people back one zodiac sign in the Vedic sidereal system, which tracks the actual constellations rather than the seasonal calendar.</p>
            <p>This is not a mistake in either system. It's a difference in what each system is measuring.</p>

            <h2 className="text-xl font-bold text-gray-900">What Vedic astrology actually emphasizes</h2>
            <p><strong>The moon sign is primary</strong> — In Vedic astrology, the moon sign (Rashi) is considered more important than the sun sign for understanding personality and making predictions. When an Indian says "my sign is Scorpio," they almost always mean their moon sign, not their sun sign.</p>
            <p><strong>Nakshatras (lunar mansions)</strong> — The zodiac is divided into 27 nakshatras, each spanning 13°20'. Your birth nakshatra — determined by the Moon's exact position — is considered your most fundamental astrological signature in the Vedic tradition. It's more specific and personal than either sun or moon sign.</p>
            <p><strong>Dashas (planetary time periods)</strong> — Vedic astrology uses a sophisticated system of planetary periods called dashas, predicting which planetary influence will dominate different phases of your life. This predictive dimension has no real equivalent in Western astrology and is one of the reasons Vedic astrology has remained a living, widely practiced tradition in India.</p>
            <p><strong>Karma and dharma</strong> — Vedic astrology is philosophically embedded in Hindu concepts of karma and dharma. It's traditionally understood as a tool for understanding one's karmic path — not just personality, but purpose, timing, and the lessons a particular lifetime is meant to offer.</p>

            <h2 className="text-xl font-bold text-gray-900">Vedic astrology in everyday Indian life</h2>
            <p>Vedic astrology remains genuinely integrated into daily life across India in ways that Western astrology is not. Marriage compatibility checks (kundali milan) are still conducted before many weddings, including in educated urban families. Auspicious timing (muhurta) is consulted for business launches, house purchases, and major surgeries. Naming ceremonies traditionally use the birth nakshatra as a guide for the first syllable of a child's name.</p>
            <p>Several Indian universities offer postgraduate degrees in Jyotisha. It is taught alongside Ayurveda in some traditional educational institutions. This is not a fringe practice — it's a living tradition with millions of active practitioners.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Find My Vedic Sign</p>
            <p className="text-sm text-gray-500 mb-4">See your Rashi, nakshatra, and Vedic zodiac profile</p>
            <Link to="/vedic-zodiac"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Find my Vedic sign →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Tools</p>
            <div className="space-y-2">
              {RELATED.map((t) => (
                <Link key={t.path} to={t.path} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ {t.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </AnswerLayout>
    </>
  );
}
