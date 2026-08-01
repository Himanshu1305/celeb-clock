import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { PageFAQ } from '@/components/PageFAQ';
import { SharePageBar } from '@/components/SharePageBar';
import { postsForTags } from '@/lib/mesh';
import { PLANETS, weightOn, kgToLb, lbToKg, isValidWeight, displayWeight, type Planet } from '@/lib/planetGravity';
import { Globe, ArrowRightCircle } from 'lucide-react';

type Unit = 'kg' | 'lb';

export default function WeightOnPlanetsPage() {
  const [raw, setRaw] = useState('70');
  const [unit, setUnit] = useState<Unit>('kg');
  const meshPosts = postsForTags(['planet', 'space', 'age', 'birthday'], 2);

  const parsed = parseFloat(raw);
  const valid = isValidWeight(parsed);
  const w = (p: Planet) => `${displayWeight(weightOn(parsed, p.gravity))} ${unit}`;

  // Toggling units converts the number so the same body-weight is preserved.
  const switchUnit = (next: Unit) => {
    if (next === unit) return;
    if (valid) {
      const converted = next === 'lb' ? kgToLb(parsed) : lbToKg(parsed);
      setRaw((Math.round(converted * 10) / 10).toString());
    }
    setUnit(next);
  };

  const moon = PLANETS.find(p => p.key === 'moon')!;
  const mars = PLANETS.find(p => p.key === 'mars')!;
  const jupiter = PLANETS.find(p => p.key === 'jupiter')!;
  const shareText = valid
    ? `On the Moon I'd weigh just ${displayWeight(weightOn(parsed, moon.gravity))} ${unit}, but ${displayWeight(weightOn(parsed, jupiter.gravity))} ${unit} on Jupiter! What's your weight across the solar system?`
    : 'Find out how much you\'d weigh on every planet — from the Moon to Jupiter.';

  const faqs = [
    { question: 'Why does my weight change on other planets?', answer: 'Because each world pulls on you with a different amount of gravity. Your weight is that gravitational pull (weight = mass × gravity), so it changes from planet to planet even though the amount of “you” stays exactly the same.' },
    { question: 'What is the difference between mass and weight?', answer: 'Your mass — the amount of matter you are made of — never changes, anywhere in the universe. Your weight is the force of gravity acting on that mass, which is why you weigh different amounts on different worlds but are still the same person.' },
    { question: 'Do I really weigh more on Jupiter?', answer: 'Yes — about 2.5 times your Earth weight at Jupiter’s cloud tops, because Jupiter is by far the most massive planet. Jupiter has no solid surface, so this is the gravity you’d feel floating at its visible cloud layer.' },
    { question: 'Would I weigh less on the Moon?', answer: 'Much less — only about one-sixth (0.166×) of your Earth weight. That weak pull is exactly why the Apollo astronauts could bounce and leap across the surface.' },
    { question: 'Why is Mars’ gravity so low?', answer: 'Mars is smaller and about ten times less massive than Earth, so its surface gravity is only about 0.38× Earth’s — roughly a third of what you feel here.' },
    { question: 'Is there really no gravity in space?', answer: 'There is still gravity in space. Astronauts float because they are in continuous free fall as they orbit — that is weightlessness, not the absence of gravity.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="How Much Would You Weigh on Other Planets? — Free Calculator | BornClock"
        description="Enter your weight and instantly see it on all 8 planets and the Moon, from bouncy Moon gravity to crushing Jupiter — computed from NASA surface-gravity data. Fun, free, nothing stored."
        keywords="weight on other planets, how much would i weigh on mars, weight on the moon, weight on jupiter, planet weight calculator, gravity on other planets"
        canonicalUrl="/weight-on-planets"
      />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <section className="max-w-2xl mx-auto px-4 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-5">
          <Globe className="w-4 h-4" /> Cosmic weigh-in
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          How much would you weigh on other planets?
        </h1>
        {/* Answer-first (AEO) */}
        <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
          Your <strong>mass</strong> never changes — but your <strong>weight</strong> is just gravity’s pull on
          that mass, and every world pulls differently. Type your weight below and watch it swing from featherweight
          on the Moon to crushing on Jupiter, all computed from NASA surface-gravity data.
        </p>
      </section>

      {/* Calculator */}
      <section className="max-w-2xl mx-auto px-4 pb-4">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="weight" className="text-sm font-semibold text-gray-700 mb-1 block">Your weight on Earth</label>
              <input
                id="weight"
                type="number"
                inputMode="decimal"
                value={raw}
                min="0"
                onChange={e => setRaw(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="inline-flex rounded-xl border border-gray-300 overflow-hidden">
              {(['kg', 'lb'] as Unit[]).map(u => (
                <button
                  key={u}
                  onClick={() => switchUnit(u)}
                  className={`px-5 py-3 text-sm font-bold transition-colors ${unit === u ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {!valid && (
            <p className="text-sm text-rose-600 mt-3" role="alert">
              Enter a weight between 0 and 2000 {unit} to see your cosmic weigh-in.
            </p>
          )}
        </div>
      </section>

      {/* Results grid */}
      {valid && (
        <section className="max-w-2xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANETS.map(p => (
              <div key={p.key} className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{p.emoji}</span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-900">{p.name}</span>
                    <span className="text-lg font-black text-indigo-600">{w(p)}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{p.fact}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <SharePageBar path="/weight-on-planets" title="My weight across the solar system" text={shareText} className="justify-center" />
          </div>
        </section>
      )}

      {/* The science, briefly */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Why your weight changes but you don’t</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Step on a scale and it reads your <strong>weight</strong> — the force with which Earth’s gravity pulls you
          down. Fly to Mars and the scale reads about a third of that, because Mars pulls far more gently. But you
          haven’t shrunk: your <strong>mass</strong>, the actual amount of matter in your body, is identical on Mars,
          the Moon, or Jupiter. Weight is <em>mass × gravity</em>, so only the gravity part travels.
        </p>
        <p className="text-gray-700 leading-relaxed">
          That’s why you’d weigh most on <strong>Jupiter</strong> (~2.5× Earth) and least on the <strong>Moon</strong>
          {' '}(~1/6). It’s also behind two great space-trivia curveballs: <strong>Saturn</strong> is 95 times Earth’s
          mass yet its gravity is almost identical to ours, because it’s so enormous and low-density that its cloud
          tops sit far from its centre — and <strong>Uranus</strong>, though bigger than Earth, would leave you
          slightly <em>lighter</em>. Bigger planet doesn’t always mean heavier you.
        </p>
      </section>

      {/* CTA to sister tools */}
      <section className="max-w-2xl mx-auto px-4 py-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-center text-white">
          <p className="text-lg font-bold mb-1">Loved this? See your age on every planet</p>
          <p className="text-indigo-100 text-sm mb-4">You’re a different number of years old on Mercury, Mars and Jupiter too — find out in seconds.</p>
          <Link to="/planetary-age" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
            <ArrowRightCircle className="w-5 h-5" /> Try the Planetary Age calculator
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <PageFAQ title="Weight on other planets — FAQ" items={faqs} />
      </div>

      {/* Sources + mesh */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <p className="text-xs text-gray-400 mb-6">
          Gravity values from NASA’s NSSDCA Planetary Fact Sheet (ratio to Earth). Jupiter is “cloud-top” gravity, since
          it has no solid surface. This is a fun science tool — nothing you enter is stored or sent anywhere.
        </p>
        <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Keep exploring</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {meshPosts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ {p.title}</Link>
          ))}
          <Link to="/planetary-age" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Your age on every planet</Link>
          <Link to="/birthday-report" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Your Birthday Report</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
