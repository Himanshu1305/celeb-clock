import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { AnswerLayout } from '@/components/AnswerLayout';

const CANONICAL = 'https://bornclock.com/answers/what-is-my-moon-sign';

const MOON_SIGNS = [
  ['Aries Moon', 'emotionally direct, quick to react, needs independence to feel secure. Processes feelings through action, not conversation.'],
  ['Taurus Moon', 'emotionally stable and comfort-seeking, deeply loyal once attached. Needs physical security and routine to feel settled.'],
  ['Gemini Moon', 'emotionally curious, processes feelings through talking and writing. Needs variety and mental stimulation to feel at ease.'],
  ['Cancer Moon', "deeply empathetic, home-oriented, highly intuitive about others' emotional states. Feels things profoundly and remembers everything."],
  ['Leo Moon', 'needs warmth, recognition, and genuine affection. Generous emotionally, loyal, and occasionally dramatic in equal measure.'],
  ['Virgo Moon', 'processes emotions through analysis rather than expression. Shows care through practical help rather than words.'],
  ['Libra Moon', 'needs harmony and partnership. Emotionally uncomfortable with conflict, sometimes to the point of avoiding necessary confrontations.'],
  ['Scorpio Moon', 'emotionally intense, private, and deeply perceptive. Slow to trust but, once trust is established, loyal in a way few other signs match.'],
  ['Sagittarius Moon', 'needs freedom and optimism. Emotionally expansive and resistant to heaviness, sometimes avoiding difficult feelings through distraction.'],
  ['Capricorn Moon', 'emotionally self-contained, expresses care through responsibility and reliability. Needs structure and purpose to feel secure.'],
  ['Aquarius Moon', 'emotionally detached but deeply humanitarian. Needs intellectual connection rather than emotional intensity.'],
  ['Pisces Moon', "deeply empathetic, emotionally porous, absorbs others' feelings easily. Needs solitude to recover from the emotional weight of the world."],
];

const RELATED = [
  { path: '/moon-sign', label: 'Moon Sign Calculator' },
  { path: '/zodiac', label: 'Zodiac Signs' },
  { path: '/compatibility', label: 'Compatibility' },
  { path: '/sun-vs-moon-sign', label: 'Sun vs Moon Sign' },
  { path: '/vedic-zodiac', label: 'Vedic Zodiac' },
  { path: '/answers/what-is-vedic-astrology', label: 'What Is Vedic Astrology?' },
];

export default function WhatIsMyMoonSign() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is my moon sign?", "item": CANONICAL } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is My Moon Sign — and Why It's Probably More 'You' Than Your Sun Sign", "description": "Your moon sign is where the Moon was when you were born — and it changes every 2.5 days, making it far more personal than your sun sign. Find yours free on BornClock.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-08-06", "dateModified": "2026-08-06", "mainEntityOfPage": CANONICAL };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Do I need my birth time to find my moon sign?", "acceptedAnswer": { "@type": "Answer", "text": "Usually your birth date is enough. If you were born on a day when the Moon changed signs, birth time helps. BornClock flags when this applies. If you don't know your time and you're in a transitional window, read both candidate sign descriptions — your gut will usually know which one is right." } },
      { "@type": "Question", "name": "Is my moon sign the same as my rising sign?", "acceptedAnswer": { "@type": "Answer", "text": "No — these are calculated differently. Your moon sign comes from the Moon's position at your birth. Your rising sign (ascendant) comes from which zodiac sign was rising on the eastern horizon at your exact birth time and location. They can be the same sign coincidentally, but they're independent calculations." } },
      { "@type": "Question", "name": "Can two people born on the same day have different moon signs?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — if they were born on a day when the Moon changed signs. Someone born at 3am may have a different moon sign than someone born at 11pm on the same date." } },
      { "@type": "Question", "name": "What if I don't know my birth time?", "acceptedAnswer": { "@type": "Answer", "text": "For most birth dates, the moon sign is determinable from the date alone. If you were born during a transition and don't know your time, read both candidate signs — most people find one feels obviously right and one doesn't." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Is My Moon Sign? How to Find It by Date of Birth | BornClock"
        description="Your moon sign is where the Moon was when you were born — and it changes every 2.5 days, making it far more personal than your sun sign. Find yours free on BornClock."
        canonicalUrl="/answers/what-is-my-moon-sign"
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
            <span className="text-gray-600">What is my moon sign?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is My Moon Sign — and Why It's Probably More "You" Than Your Sun Sign</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your moon sign is the zodiac sign the Moon was passing through at the moment of your birth. The Moon moves through all 12 signs every 27.3 days — roughly 2.5 days per sign — so it's far more individual than your sun sign, which one-twelfth of the population shares. In most cases, your birth date alone is enough to find it. Most people who discover their moon sign for the first time say the same thing: "that's actually me."
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">What the moon sign reveals</h2>
            <p>Your sun sign describes how you present yourself to the world — your public personality, your ambitions, your conscious identity. Your moon sign describes what happens underneath: your emotional responses, your instincts under pressure, what you need to feel safe, and how you behave when you're completely at ease.</p>
            <p>Think of the sun sign as your daytime self — the one colleagues and acquaintances see. The moon sign is your 2am self — the one that surfaces when you're tired, stressed, or fully relaxed with someone you trust completely.</p>
            <p>This is why so many people feel their moon sign describes them more accurately than their sun sign. Most of our inner life happens in moon sign territory: processing emotion, navigating intimacy, reacting instinctively before our rational, public sun sign personality has a chance to catch up.</p>

            <h2 className="text-xl font-bold text-gray-900">How to find your moon sign</h2>
            <p>BornClock's calculator identifies which sign the Moon was in on your birth date. For most dates, this is sufficient — the Moon spends about 2.5 days in each sign, so on most days it's clearly in one sign throughout the day.</p>
            <p>If you were born on a day when the Moon was transitioning between signs, birth time improves accuracy. BornClock will flag this when it applies. If you don't know your birth time and you're in that transitional window, the practical approach is to read both candidate sign descriptions — most people find one resonates clearly and the other feels like a stranger.</p>
            <p>The Moon changes signs roughly every 2.5 days, which means even siblings born a few days apart can have different moon signs — giving them meaningfully different emotional personalities despite sharing the same family, the same home, and much of the same environment.</p>

            <h2 className="text-xl font-bold text-gray-900">The 12 moon signs — what they feel like from the inside</h2>
            <ul className="list-disc pl-6 space-y-2">
              {MOON_SIGNS.map(([sign, desc]) => (
                <li key={sign}><strong>{sign}</strong> — {desc}</li>
              ))}
            </ul>

            <h2 className="text-xl font-bold text-gray-900">Why it matters for relationships</h2>
            <p>In relationship astrology, the moon sign is considered more important than the sun sign for long-term compatibility — because it governs emotional needs, intimacy patterns, and what each person requires to feel safe and understood.</p>
            <p>Two people with compatible moon signs will often intuitively understand each other's emotional language, even if their sun signs would traditionally clash. Two people with incompatible moon signs may struggle with sustained intimacy regardless of how well their surface personalities get along — because they need different things at the emotional core.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Find My Moon Sign</p>
            <p className="text-sm text-gray-500 mb-4">Discover the sign the Moon was in when you were born</p>
            <Link to="/moon-sign"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Find my moon sign →
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
