import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

type Evidence = 'Strong' | 'Moderate' | 'Emerging';

interface Food {
  name: string;
  local?: string;
  mechanism: string;
  evidence: Evidence;
}

const FOODS: Food[] = [
  {
    name: 'Turmeric',
    local: 'Haldi',
    mechanism:
      'Contains curcumin, a polyphenol studied for its anti-inflammatory and antioxidant activity. Chronic low-grade inflammation is one of the recognised drivers of age-related disease, and turmeric has been a staple of Indian cooking and Ayurveda for centuries.',
    evidence: 'Moderate',
  },
  {
    name: 'Dal & Lentils',
    local: 'Dal, Toor, Moong, Masoor',
    mechanism:
      'Legumes are the single most reliable dietary marker of longevity in Blue Zones research — populations that eat the most beans tend to live the longest. Dal delivers plant protein, fibre and slow-release carbohydrate that supports stable blood sugar and gut health.',
    evidence: 'Strong',
  },
  {
    name: 'Amla',
    local: 'Indian Gooseberry',
    mechanism:
      'One of the richest natural sources of vitamin C, amla is a potent antioxidant used in Ayurveda as a rasayana (rejuvenator). Antioxidants help the body manage oxidative stress, which accumulates with age.',
    evidence: 'Moderate',
  },
  {
    name: 'Ghee',
    local: 'Clarified Butter',
    mechanism:
      'Used in small amounts, ghee supplies fat-soluble vitamins (A, E, K) and butyrate, a short-chain fatty acid that supports gut lining health. The key word is moderation — a teaspoon or two, not spoonfuls.',
    evidence: 'Emerging',
  },
  {
    name: 'Millets',
    local: 'Bajra, Ragi, Jowar',
    mechanism:
      'Ancient Indian grains with a low glycaemic index and high fibre, millets help keep blood sugar steady and support cardiovascular health. Ragi is also notably rich in calcium — useful for bone strength in later life.',
    evidence: 'Moderate',
  },
  {
    name: 'Leafy Greens',
    local: 'Palak, Methi, Sarson',
    mechanism:
      'Dark leafy greens are dense in folate, vitamin K, nitrates and antioxidants. Higher leafy-green intake is consistently linked in observational studies with slower cognitive decline and better heart health.',
    evidence: 'Strong',
  },
  {
    name: 'Curd / Yogurt',
    local: 'Dahi',
    mechanism:
      'A traditional fermented food that delivers live probiotic cultures supporting a diverse gut microbiome. A healthy microbiome is increasingly linked with immune function and metabolic health.',
    evidence: 'Moderate',
  },
  {
    name: 'Green Tea',
    local: 'Green Tea',
    mechanism:
      'Rich in catechins such as EGCG, green tea is one of the most-studied beverages for cardiovascular and metabolic markers. Regular, unsweetened consumption is associated in large cohort studies with lower cardiovascular mortality.',
    evidence: 'Moderate',
  },
  {
    name: 'Nuts',
    local: 'Almonds, Walnuts, Badam, Akhrot',
    mechanism:
      'A small daily handful of nuts is one of the best-evidenced longevity habits, associated with reduced heart-disease risk. Walnuts supply plant omega-3s; almonds add vitamin E and healthy monounsaturated fat.',
    evidence: 'Strong',
  },
  {
    name: 'Garlic',
    local: 'Lehsun',
    mechanism:
      'Contains allicin and sulphur compounds studied for modest effects on blood pressure and cholesterol. A cornerstone aromatic in Indian tadka, garlic contributes flavour and cardiovascular support at once.',
    evidence: 'Moderate',
  },
  {
    name: 'Ginger',
    local: 'Adrak',
    mechanism:
      'Contains gingerols with anti-inflammatory and digestive properties. Long used in Indian kitchens and Ayurveda, ginger supports digestion and may help manage nausea and inflammation.',
    evidence: 'Emerging',
  },
  {
    name: 'Spinach',
    local: 'Palak',
    mechanism:
      'A standout leafy vegetable rich in iron, folate, lutein and nitrates. Its lutein and zeaxanthin content supports eye health, while nitrates support healthy blood-vessel function.',
    evidence: 'Moderate',
  },
  {
    name: 'Beans',
    local: 'Rajma, Chana, Chickpeas',
    mechanism:
      'Like dal, rajma and chana are fibre- and protein-rich legumes tied to longevity in Blue Zones populations. They promote fullness, feed beneficial gut bacteria and help maintain steady blood sugar.',
    evidence: 'Strong',
  },
  {
    name: 'Whole Grains',
    local: 'Brown Rice, Whole Wheat, Oats',
    mechanism:
      'Replacing refined grains with whole grains is linked in large studies to lower risk of heart disease, type 2 diabetes and premature death. The intact bran and germ supply fibre, B vitamins and minerals.',
    evidence: 'Strong',
  },
  {
    name: 'Seasonal Fruits',
    local: 'Guava, Papaya, Mango, Banana',
    mechanism:
      'Whole seasonal fruit delivers fibre, potassium and a wide spectrum of antioxidants. Higher fruit intake is consistently associated with lower cardiovascular risk — whole fruit, not juice, is the goal.',
    evidence: 'Strong',
  },
];

const EVIDENCE_STYLES: Record<Evidence, string> = {
  Strong: 'bg-green-100 text-green-800',
  Moderate: 'bg-amber-100 text-amber-800',
  Emerging: 'bg-blue-100 text-blue-800',
};

const FAQS = [
  {
    q: 'What are the best longevity foods in India?',
    a: 'The most evidence-backed longevity foods in the Indian diet are legumes (dal, rajma, chana), leafy greens (palak, methi), whole grains, nuts and seasonal fruit — the same plant-forward patterns seen in the world\'s longest-lived Blue Zones. Spices such as turmeric, garlic and ginger add anti-inflammatory support on top of a plant-rich base.',
  },
  {
    q: 'Is turmeric actually good for longevity?',
    a: 'Turmeric contains curcumin, which has been studied for anti-inflammatory and antioxidant effects. Because chronic inflammation is a recognised driver of age-related disease, turmeric is a sensible everyday spice. Evidence in humans is still developing, so it is best treated as one helpful part of a varied diet rather than a cure-all.',
  },
  {
    q: 'How much ghee is healthy for a long life?',
    a: 'Ghee is best used in moderation — around a teaspoon or two a day. It supplies fat-soluble vitamins and butyrate, but it is calorie-dense and high in saturated fat, so large amounts are not helpful. Small, mindful quantities within an otherwise plant-forward diet are the balanced approach.',
  },
  {
    q: 'Are Indian foods better than a Western diet for living longer?',
    a: 'A traditional Indian diet built on dal, vegetables, whole grains and modest dairy shares many features with the longevity-linked diets of the Blue Zones. The problems come from refined flour, deep-fried snacks, excess sugar and ultra-processed foods. Returning to a whole-food, home-cooked Indian plate is the practical longevity strategy.',
  },
  {
    q: 'What should I eat every day for a longer, healthier life?',
    a: 'A simple daily template: a serving of dal or beans, two portions of vegetables including leafy greens, a whole grain such as millet or whole wheat, a small handful of nuts, a bowl of curd, and seasonal fruit — flavoured with turmeric, garlic and ginger. This is affordable, familiar and aligns with what longevity research supports.',
  },
];

export function LongevityFoodsIndiaArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Longevity Foods in India — 15 Foods for a Longer Life',
    description:
      '15 Indian longevity foods backed by evidence — turmeric, dal, amla, ghee, millets and more, with the mechanism and evidence level for each.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/longevity-foods-india/',
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
        title="Longevity Foods in India — 15 Foods for a Longer Life | BornClock"
        description="15 Indian longevity foods backed by evidence — turmeric, dal, amla, ghee, millets and more. What to eat for a longer, healthier life, the Indian way."
        canonicalUrl="/articles/longevity-foods-india"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="longevity-foods-india-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Longevity Foods in India — 15 Foods for a Longer, Healthier Life
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            You do not need imported superfoods or expensive supplements to eat for a longer
            life. Some of the most evidence-backed longevity foods in the world are already
            sitting in the Indian kitchen — in the dal pot, the spice box, and the vegetable
            basket. The world's longest-lived communities, studied by longevity researchers as
            the "Blue Zones", share a strikingly simple pattern: mostly plants, plenty of beans
            and whole grains, modest dairy, and very little ultra-processed food. A traditional
            Indian thali, when built from whole ingredients, maps onto that pattern remarkably well.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Below are 15 well-established Indian foods and the longevity mechanism behind each
            one. To keep things honest, every food carries an evidence label —
            <strong> Strong</strong> (backed by large human studies), <strong>Moderate</strong>
            (promising human evidence, still developing), or <strong>Emerging</strong> (early or
            mostly traditional evidence). We avoid invented percentages and miracle claims:
            food supports health, it does not guarantee it.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-black text-emerald-900 mb-2">How to read the evidence labels</h2>
            <ul className="text-sm text-emerald-900 space-y-1">
              <li><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${EVIDENCE_STYLES.Strong}`}>Strong</span> — consistent evidence from large human population studies.</li>
              <li><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${EVIDENCE_STYLES.Moderate}`}>Moderate</span> — promising human evidence that is still building.</li>
              <li><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${EVIDENCE_STYLES.Emerging}`}>Emerging</span> — early research and long traditional use.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">15 Indian Longevity Foods</h2>
          <div className="space-y-5 mb-10">
            {FOODS.map((food, i) => (
              <section
                key={food.name}
                data-testid="longevity-food-item"
                className="border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-xl font-black text-gray-900">
                    {i + 1}. {food.name}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${EVIDENCE_STYLES[food.evidence]}`}>
                    {food.evidence} evidence
                  </span>
                </div>
                {food.local && (
                  <div className="text-xs text-gray-500 mb-2">{food.local}</div>
                )}
                <p className="text-gray-700 text-sm leading-relaxed">{food.mechanism}</p>
              </section>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Putting it on your plate</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            No single food extends life. What the research consistently rewards is the overall
            pattern: a plant-forward plate, eaten mostly at home, with legumes and vegetables at
            the centre and treats kept occasional. The good news for anyone in India is that this
            plate is not foreign — it is the home-cooked dal-sabzi-roti-dahi meal that predates
            the arrival of packaged snacks and sugary drinks. Small, sustainable habits beat
            dramatic diets: swap refined grains for millets or whole wheat, add a handful of nuts,
            finish meals with seasonal fruit, and let turmeric, garlic and ginger do the seasoning.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Curious how your own habits and birth date stack up against a longer life expectancy?
            Try our <a href="/longevity-calculator" className="text-emerald-700 font-semibold underline">free longevity calculator</a> to
            get a personalised estimate and see where small changes could add the most healthy years.
          </p>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white mt-10 mb-10">
            <h2 className="text-2xl font-black mb-2">How long could you live?</h2>
            <p className="text-emerald-100 mb-6">
              Diet is one lever. Enter your details in the BornClock longevity calculator to see a
              personalised life-expectancy estimate and the habits that move it most.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-emerald-700 font-black px-8 py-3 rounded-full text-lg hover:bg-emerald-50 transition-colors">
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
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <a href="/articles/blue-zones-diet"
               className="block border border-gray-200 rounded-xl p-4 hover:border-emerald-400 transition-colors">
              <div className="font-bold text-gray-900">The Blue Zones Diet</div>
              <div className="text-sm text-gray-600">What the world's longest-lived people eat every day.</div>
            </a>
            <a href="/articles/how-to-live-to-100"
               className="block border border-gray-200 rounded-xl p-4 hover:border-emerald-400 transition-colors">
              <div className="font-bold text-gray-900">How to Live to 100</div>
              <div className="text-sm text-gray-600">Habits and lifestyle factors linked with a very long life.</div>
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default LongevityFoodsIndiaArticle;
