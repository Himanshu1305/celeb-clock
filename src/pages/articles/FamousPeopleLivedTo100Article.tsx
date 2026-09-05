import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface Centenarian {
  name: string;
  country: string;
  lived: string;
  age: number;
  note: string;
}

// Real, verifiable centenarians. No invented data.
const CENTENARIANS: Centenarian[] = [
  {
    name: 'Bob Hope',
    country: 'USA',
    lived: '1903–2003',
    age: 100,
    note: 'Comedian and entertainer; played golf almost daily well into his 90s.',
  },
  {
    name: 'Olivia de Havilland',
    country: 'USA / France',
    lived: '1916–2020',
    age: 104,
    note: 'Two-time Oscar-winning actress; stayed sharp with reading and crossword puzzles.',
  },
  {
    name: 'Henry Allingham',
    country: 'UK',
    lived: '1896–2009',
    age: 113,
    note: 'World War I veteran; one of the last surviving founding members of the Royal Air Force.',
  },
  {
    name: 'Kane Tanaka',
    country: 'Japan',
    lived: '1903–2022',
    age: 119,
    note: 'Verified oldest person ever from Japan; loved board games, green tea, and time with family.',
  },
  {
    name: 'Susannah Mushatt Jones',
    country: 'USA',
    lived: '1899–2016',
    age: 116,
    note: 'Once the world\'s oldest living person; credited family, faith, and plenty of sleep.',
  },
];

const TRAITS = [
  {
    title: 'Strong social connections',
    body: 'Nearly every long-lived person stayed embedded in family and community. Kane Tanaka relished visits from relatives and games with the people around her; Susannah Mushatt Jones lived surrounded by nieces and nephews. Loneliness is now considered a genuine health risk, and consistent human contact appears again and again among centenarians.',
  },
  {
    title: 'A clear sense of purpose',
    body: 'Whether it was Bob Hope entertaining troops for decades or Henry Allingham keeping the memory of his generation alive, having a reason to get up in the morning — what Okinawans call ikigai — is one of the most consistent threads across people who reach 100.',
  },
  {
    title: 'Moderate, regular activity',
    body: 'Centenarians rarely trained like athletes, but they kept moving. Bob Hope walked the golf course almost daily; many others gardened, walked, or did daily chores well into old age. Gentle, consistent movement beats intense but occasional exercise for long-term health.',
  },
  {
    title: 'Stress resilience',
    body: 'Living a century means outliving spouses, friends, and often children. The people who endured it tended to be adaptable and even-tempered, able to process loss without being consumed by it. A calm relationship with stress protects the heart and the mind alike.',
  },
  {
    title: 'Mostly plant-based eating',
    body: 'Diets varied by culture, but a common pattern emerges: modest portions, plenty of vegetables, beans, and whole grains, and meat treated as a flavouring rather than the centrepiece. Kane Tanaka favoured simple food and green tea; the world\'s longevity hotspots share a largely plant-forward plate.',
  },
  {
    title: 'Faith or spiritual practice',
    body: 'A regular spiritual life — prayer, worship, meditation, or belonging to a faith community — recurs among centenarians such as Susannah Mushatt Jones. Beyond belief itself, it provides routine, community, and a framework for meaning that supports emotional wellbeing.',
  },
];

const FAQS = [
  {
    q: 'Who is the oldest verified person to ever live to 100 and beyond?',
    a: 'Among the people covered here, Kane Tanaka of Japan is the oldest, living to 119 (1903–2022) and recognised as the verified oldest person ever from Japan. The oldest verified human of all time remains Jeanne Calment of France, who reached 122. Verification of these ages is rigorous, which is why the confirmed list is short.',
  },
  {
    q: 'What did famous people who lived to 100 have in common?',
    a: 'Across figures like Kane Tanaka, Bob Hope, Olivia de Havilland, Henry Allingham, and Susannah Mushatt Jones, six traits recur: strong social connections, a clear sense of purpose, moderate regular activity, stress resilience, mostly plant-based eating, and a faith or spiritual practice. No single habit guarantees a long life, but these patterns appear again and again.',
  },
  {
    q: 'Is living to 100 mostly genetics or lifestyle?',
    a: 'Researchers estimate that genetics accounts for roughly a quarter of longevity, while lifestyle and environment shape the rest. That means daily habits — how you eat, move, connect with others, and manage stress — have a large influence on your odds of a long, healthy life, especially before the very oldest ages.',
  },
  {
    q: 'Are there many centenarians in India?',
    a: 'Yes, and their numbers are rising as life expectancy improves. Within India, Kerala has the country\'s highest density of centenarians, often attributed to better healthcare access, high literacy, strong family structures, and a largely plant-based coastal diet. It offers an Indian parallel to the world\'s well-known longevity hotspots.',
  },
  {
    q: 'How can I apply the habits of centenarians to my own life?',
    a: 'Start with the habits that are within your control today: nurture close relationships, find a sense of purpose, move your body gently but regularly, eat more plants and smaller portions, and build routines that calm rather than stress you. You can estimate how these choices shape your own outlook using BornClock\'s free longevity calculator.',
  },
];

export function FamousPeopleLivedTo100Article() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Famous People Who Lived to 100 — Centenarian Secrets',
    description: 'Famous people who lived to 100+ — Kane Tanaka, Bob Hope, Olivia de Havilland and more, and what the world\'s centenarians had in common.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/famous-people-lived-to-100/',
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
        title="Famous People Who Lived to 100 — Centenarian Secrets | BornClock"
        description="Famous people who lived to 100+ — Kane Tanaka, Bob Hope, Olivia de Havilland and more. What the world's centenarians had in common, and how to apply it."
        canonicalUrl="/articles/famous-people-lived-to-100"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="famous-centenarians-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Famous People Who Lived to 100 — Centenarian Secrets
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Reaching your 100th birthday is still rare enough to make headlines — and for
            good reason. Only a tiny fraction of people ever join the centenarian club, and
            the handful who go well beyond it, into their 110s, are rarer still. Yet the
            famous people who lived to 100 are more than a curiosity. Studied together, they
            reveal a surprisingly consistent set of habits and circumstances that anyone can
            learn from.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Below is a table of real, verified centenarians — from the Japanese
            supercentenarian Kane Tanaka to Hollywood's Olivia de Havilland — followed by
            the six traits they most had in common, and how you can apply those lessons to
            your own life. Curious where you stand? You can estimate your own outlook with our
            free <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">longevity calculator</a>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Real Centenarians Who Lived to 100 and Beyond</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 pr-4 font-black text-gray-900">Name</th>
                  <th className="py-2 pr-4 font-black text-gray-900">Country</th>
                  <th className="py-2 pr-4 font-black text-gray-900">Lived</th>
                  <th className="py-2 pr-4 font-black text-gray-900">Age</th>
                  <th className="py-2 font-black text-gray-900">Notable habit / note</th>
                </tr>
              </thead>
              <tbody>
                {CENTENARIANS.map(c => (
                  <tr key={c.name} className="border-b border-gray-200 align-top">
                    <td className="py-3 pr-4 font-semibold text-gray-900">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-700">{c.country}</td>
                    <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{c.lived}</td>
                    <td className="py-3 pr-4 text-gray-700">{c.age}</td>
                    <td className="py-3 text-gray-600">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Indian Centenarian Story</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Longevity is not only a Western or Japanese phenomenon. India's centenarian
            population is growing steadily, and within the country <strong>Kerala has the
            highest density of centenarians</strong>. Researchers link this to a combination
            of strong healthcare access, exceptionally high literacy, tight-knit family
            structures, and a largely plant-based coastal diet rich in vegetables, fish, and
            rice. In many ways Kerala functions as an Indian counterpart to the world's famous
            longevity hotspots — proof that the ingredients for a long life travel well across
            cultures.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">What They Had in Common: 6 Traits of People Who Live to 100</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            No two centenarians lived identical lives. But when you line up their stories, the
            same threads keep reappearing. These six traits are the closest thing we have to a
            shared blueprint for a very long life.
          </p>
          <div className="space-y-6 mb-8">
            {TRAITS.map((t, i) => (
              <div key={t.title} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-black text-gray-900 mb-2">
                  {i + 1}. {t.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">How Long Might You Live?</h2>
            <p className="text-indigo-200 mb-6">
              The habits of centenarians are within your reach. See how your own lifestyle
              shapes your outlook with BornClock's free, private longevity estimate.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Try the Longevity Calculator →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Related Articles</h2>
          <div className="grid gap-3 mb-10">
            <a href="/articles/how-to-live-to-100"
               className="block bg-white border-2 border-gray-200 rounded-xl p-4
                          hover:border-indigo-400 transition-colors">
              <span className="font-bold text-indigo-700">How to Live to 100 →</span>
              <span className="block text-sm text-gray-600">The evidence-based habits that add healthy years to your life.</span>
            </a>
            <a href="/articles/blue-zones-diet"
               className="block bg-white border-2 border-gray-200 rounded-xl p-4
                          hover:border-indigo-400 transition-colors">
              <span className="font-bold text-indigo-700">The Blue Zones Diet →</span>
              <span className="block text-sm text-gray-600">What the world's longest-lived communities actually eat.</span>
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default FamousPeopleLivedTo100Article;
