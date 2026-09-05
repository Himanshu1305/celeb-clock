import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = "Blue Zones Diet — What the World's Longest-Lived Eat | BornClock";
const DESC = 'The Blue Zones diet — how Okinawa, Sardinia, Ikaria, Nicoya and Loma Linda eat to reach 100. The Power 9, plant-slant rules, and Indian equivalents.';

const ZONES = [
  {
    name: 'Okinawa',
    country: 'Japan',
    eats: 'Purple sweet potato was historically the calorie base — not rice. Okinawans built meals around bitter melon (goya), tofu and other soy foods, seaweed, turmeric, and a rainbow of vegetables, with pork and fish reserved for festivals. They practise "hara hachi bu" — stopping when the stomach is 80% full.',
  },
  {
    name: 'Sardinia',
    country: 'Italy',
    eats: "Nuoro province holds the world's highest concentration of male centenarians. Shepherds walk kilometres of hilly terrain daily and eat a lean, plant-heavy diet: sourdough carta di musica bread, chickpeas and fava beans, garden vegetables, pecorino from grass-fed sheep, and a daily glass or two of local Cannonau red wine.",
  },
  {
    name: 'Ikaria',
    country: 'Greece',
    eats: 'On this Aegean island "people forget to die." Ikarians follow a Mediterranean pattern built on wild foraged greens (horta), olive oil, beans and lentils, potatoes, and herbal teas of rosemary, sage and oregano. Meat and refined sugar are rare, and daily naps are the norm.',
  },
  {
    name: 'Nicoya',
    country: 'Costa Rica',
    eats: 'On this peninsula elders keep a strong "plan de vida" — a reason to live. The traditional "three sisters" trio of beans, squash and corn tortillas, prepared with calcium-rich local water, provides a complete, low-cost, nutrient-dense diet that supports exceptional longevity.',
  },
  {
    name: 'Loma Linda',
    country: 'United States',
    eats: "A community of Seventh-day Adventists in California who live roughly a decade longer than the average American. Their faith encourages a largely plant-based diet — legumes, nuts, whole grains, fruit and vegetables — with no smoking or alcohol, plenty of water, and a weekly day of rest.",
  },
];

const POWER_9 = [
  { name: 'Move Naturally', note: 'The longest-lived people do not run marathons or lift weights — they live in environments that nudge them into constant movement: gardening, walking, kneading dough, and doing chores by hand.' },
  { name: 'Purpose', note: 'Okinawans call it "ikigai" and Nicoyans call it "plan de vida" — a clear reason to wake up. Knowing your sense of purpose is worth up to seven extra years of life expectancy.' },
  { name: 'Downshift', note: 'Everyone experiences stress, which drives chronic inflammation linked to major age-related disease. Centenarians have daily rituals to shed it — prayer, napping, or happy hour.' },
  { name: '80% Rule', note: '"Hara hachi bu" — the Okinawan reminder to stop eating when the stomach is 80% full. That small gap between "not hungry" and "full" can be the difference between losing weight and gaining it.' },
  { name: 'Plant Slant', note: 'Beans — fava, black, soy, and lentils — are the cornerstone of every centenarian diet. Meat is eaten in small amounts, roughly five times a month, as a celebration rather than a staple.' },
  { name: 'Wine at 5', note: 'People in most Blue Zones drink alcohol moderately and regularly — one to two glasses a day, with friends and food. (The habit is optional; Loma Linda thrives without any alcohol.)' },
  { name: 'Belong', note: 'Almost all centenarians in the original study belonged to a faith-based community. Attending services regularly is associated with an estimated four to fourteen extra years of life.' },
  { name: 'Loved Ones First', note: 'Successful centenarians keep ageing parents nearby, commit to a life partner, and invest in their children — a family-first structure that protects health at every stage of life.' },
  { name: 'Right Tribe', note: "The world's longest-lived people belonged to social circles that reinforced healthy behaviours. Okinawans form lifelong \"moai\" — small groups committed to one another for decades." },
];

const FAQS = [
  {
    q: 'What is the Blue Zones diet?',
    a: 'The Blue Zones diet is the common eating pattern shared by the five regions where people live measurably longer and reach 100 at the highest rates: Okinawa (Japan), Sardinia (Italy), Ikaria (Greece), Nicoya (Costa Rica) and Loma Linda (California). It is roughly 90–100% plant-based, built on beans, whole grains, vegetables, tubers and nuts, with meat eaten only a few times a month and food stopped at about 80% fullness.',
  },
  {
    q: 'What is the number one longevity food in the Blue Zones?',
    a: 'Beans and legumes. Researcher Dan Buettner calls them "the cornerstone of every longevity diet in the world." Every Blue Zone eats at least a cup of beans, lentils, soy or chickpeas most days — fava and chickpeas in Sardinia, soy in Okinawa, black beans in Nicoya, lentils in Ikaria. They deliver protein, fibre and slow-release carbohydrate without the saturated fat of meat.',
  },
  {
    q: 'What is the 95/5 plant-slant rule?',
    a: 'It describes the ratio of the typical Blue Zones plate: about 95% of calories come from plants — vegetables, beans, whole grains, fruit, tubers and nuts — and only about 5% from animal foods. Meat appears roughly five times a month in portions of 60 grams or less, treated as a garnish or celebration food rather than the centre of the meal.',
  },
  {
    q: 'What is the 80% rule (hara hachi bu)?',
    a: 'Hara hachi bu is a 2,500-year-old Confucian mantra Okinawans say before meals, reminding themselves to eat until they are 80% full rather than stuffed. Because it takes about 20 minutes for the brain to register fullness, stopping at "80%" often leaves you comfortably satisfied. Okinawans also eat their smallest meal in the late afternoon or early evening and nothing more for the rest of the day.',
  },
  {
    q: 'Does the traditional Indian diet match the Blue Zones diet?',
    a: 'A traditional vegetarian Indian thali maps remarkably well onto the Blue Zones pattern. Daily dal (lentils) satisfies the beans-first rule; millets, brown rice and whole-wheat rotis provide whole grains; a generous helping of sabzi covers vegetables; and turmeric, curry leaves and other spices add anti-inflammatory value. Reducing refined sugar, deep-fried snacks and ghee-heavy sweets — and adding more legumes and greens — brings an everyday Indian diet very close to how the world\'s longest-lived people actually eat.',
  },
];

export function BlueZonesDietArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: "Blue Zones Diet — What the World's Longest-Lived People Eat",
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/blue-zones-diet/',
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
      <SEO title={TITLE} description={DESC} canonicalUrl="/articles/blue-zones-diet" ogType="article" />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="blue-zones-diet-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            The Blue Zones Diet — What the World's Longest-Lived People Eat
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            A Blue Zone is a region where people live measurably longer than anywhere
            else on Earth and reach 100 at extraordinary rates. Author and researcher
            Dan Buettner identified five: <strong>Okinawa</strong> in Japan,{' '}
            <strong>Sardinia</strong> in Italy, <strong>Ikaria</strong> in Greece,{' '}
            <strong>Nicoya</strong> in Costa Rica, and <strong>Loma Linda</strong> in
            California. Despite being separated by oceans and cultures, the people in
            these places eat in strikingly similar ways — and their diets look far more
            like a traditional Indian thali than a modern Western plate.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The headline is simple: the world's longest-lived people eat mostly plants,
            centre their meals on beans, rarely eat meat, and stop before they are full.
            Below is what each Blue Zone actually eats, the nine habits behind their
            longevity, the core dietary rules — and how an everyday Indian diet already
            aligns with most of them. If you want to see how these habits translate into
            years, try our{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">
              free longevity calculator
            </a>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">What Each Blue Zone Eats</h2>
          {ZONES.map(z => (
            <section key={z.name} className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {z.name} <span className="text-base font-semibold text-gray-500">— {z.country}</span>
              </h3>
              <p className="text-gray-700 leading-relaxed">{z.eats}</p>
            </section>
          ))}

          <h2 className="text-2xl font-black text-gray-900 mb-3 mt-10">The Power 9 — The Habits Behind Blue Zones Longevity</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Buettner's team distilled the shared behaviours of all five regions into nine
            evidence-based lessons known as the <strong>Power 9</strong>. Diet is only part
            of the picture — movement, purpose and community matter just as much.
          </p>
          <div className="space-y-3 mb-6">
            {POWER_9.map((p, i) => (
              <div key={p.name} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-1">{i + 1}. {p.name}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{p.note}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 mt-10">The Core Dietary Rules</h2>

          <h3 className="text-xl font-black text-gray-900 mb-1">The 95/5 Plant-Slant Rule</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            The single clearest dietary signature of the Blue Zones is that roughly{' '}
            <strong>95% of calories come from plants</strong> and only about{' '}
            <strong>5% from animal foods</strong>. Vegetables, beans, whole grains, fruit,
            tubers and nuts fill the plate. Meat is eaten on average five times a month, in
            portions of 60 grams or less — treated as a garnish or a celebration food, never
            the centre of the meal. Fish appears occasionally in the Mediterranean zones; in
            Loma Linda many Adventists are fully vegetarian.
          </p>

          <h3 className="text-xl font-black text-gray-900 mb-1">Beans First — The #1 Longevity Food</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If there is one food common to every Blue Zone, it is the{' '}
            <strong>bean</strong>. Buettner calls legumes "the cornerstone of every
            longevity diet in the world." Fava beans and chickpeas in Sardinia, soy in
            Okinawa, black beans in Nicoya, lentils in Ikaria, and a wide mix in Loma Linda —
            centenarians eat at least a cup of beans most days. Legumes deliver protein and
            fibre with slow-release energy and none of the saturated fat that comes with
            relying on meat.
          </p>

          <h3 className="text-xl font-black text-gray-900 mb-1">The 80% Rule — Hara Hachi Bu</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Okinawans recite <em>hara hachi bu</em>, a 2,500-year-old Confucian mantra,
            before eating — a reminder to stop when the stomach is <strong>80% full</strong>{' '}
            rather than stuffed. Because the brain takes about 20 minutes to register
            fullness, this simple pause naturally trims calories without hunger or dieting.
            Okinawans also eat their smallest meal in the late afternoon and nothing more
            afterwards, a mild form of daily calorie restriction linked to longer life.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h2 className="text-2xl font-black text-indigo-900 mb-2">The Indian Blue Zones Plate</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              A traditional vegetarian Indian diet is, in many ways, already a Blue Zones
              diet. The overlap is remarkable:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li>
                <strong>Dal for the beans-first rule.</strong> Daily lentils — toor,
                moong, masoor, chana and rajma — put India ahead of almost every country
                on the world's single most important longevity food.
              </li>
              <li>
                <strong>Millets and whole grains.</strong> Bajra, ragi, jowar, brown rice
                and whole-wheat roti supply the fibre-rich complex carbohydrates that
                Sardinian sourdough and Nicoyan corn tortillas provide.
              </li>
              <li>
                <strong>A plate of vegetables.</strong> A generous sabzi, saag or a mound
                of foraged and seasonal greens mirrors Ikaria's wild horta and Okinawa's
                rainbow of vegetables.
              </li>
              <li>
                <strong>Anti-inflammatory spices.</strong> Turmeric, curry leaves, ginger
                and garlic add the same protective, inflammation-lowering value that olive
                oil and herbs bring in the Mediterranean zones.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To move even closer, cut refined sugar, deep-fried snacks and ghee-heavy
              sweets, load half the plate with vegetables and legumes, and practise{' '}
              <em>hara hachi bu</em> — stop at 80% full. For a deeper India-specific guide,
              see our companion article on the longevity foods of India.
            </p>
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

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">How Long Could You Live?</h2>
            <p className="text-indigo-200 mb-6">
              Eating like the Blue Zones is one of the biggest levers you can pull. See how
              your diet, movement and habits add up in years with our science-based tool.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Try the Free Longevity Calculator →
            </a>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/longevity-foods-india" className="text-indigo-600 font-semibold underline">
                  Longevity Foods of India — What to Eat to Live Longer
                </a>
              </li>
              <li>
                <a href="/articles/how-to-live-to-100" className="text-indigo-600 font-semibold underline">
                  How to Live to 100 — Blue Zones & Science-Backed Habits
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default BlueZonesDietArticle;
