import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { AuthorBio } from '@/components/AuthorBio';

const FAQ_ITEMS = [
  { question: 'Can your sun and moon sign be the same?', answer: 'Yes — this happens when the Moon is passing through the same sign as the Sun on your birthday, which occurs roughly once a month. People with matching sun and moon signs are said to have a particularly unified personality — their outward and inner selves are in close alignment.' },
  { question: 'Which is more important — sun or moon sign?', answer: 'They describe different things, so neither is universally more important. The sun sign describes your public self and conscious identity; the moon sign describes your emotional inner world. Most astrologers consider both equally important, alongside the rising sign, for a full picture.' },
  { question: 'Do I need my birth time to find my moon sign?', answer: 'Usually your birth date is sufficient. If the Moon was changing signs on your birth day, birth time helps narrow it down. BornClock will flag when this situation applies — and if it does, reading both candidate sign descriptions usually makes the right one obvious.' },
  { question: 'Why do I feel my moon sign describes me better?', answer: "Many people do — particularly those who are more emotionally self-aware or introverted. The moon sign describes your private emotional world rather than your public face, which is often felt more personally than the sun sign's outward-facing personality traits." },
];

const RELATED = [
  { path: '/moon-sign', label: 'Moon Sign Calculator' },
  { path: '/zodiac', label: 'Zodiac Signs' },
  { path: '/compatibility', label: 'Compatibility' },
  { path: '/vedic-zodiac', label: 'Vedic Zodiac' },
];

const SunVsMoonSign = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Sun Sign vs Moon Sign — Which One Actually Describes You?"
        description="Your sun sign is your public face. Your moon sign is your 2am self. Most people find their moon sign more accurate once they discover it. Here's why."
        keywords="sun sign vs moon sign, difference between sun and moon sign, moon sign more accurate, sun moon sign astrology"
        canonicalUrl="/sun-vs-moon-sign"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Sun Sign vs Moon Sign — Which One Is Actually You?
          </h1>
          <EEATBadges sources={['Astrology tradition', 'Psychological research on personality']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your sun sign is determined by where the Sun was on your birthday — it changes roughly every 30 days and represents your core identity and the self you show the world. Your moon sign is determined by where the Moon was at your birth — it changes every 2.5 days and represents your emotional inner world, your instincts, and the self you are when nobody's watching. If you've ever read your sun sign and thought "that's not quite me," your moon sign is usually the explanation.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why most people only know their sun sign</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Sun signs became the public face of astrology largely because of newspaper horoscope columns, which began in the 1930s. Horoscopes needed to apply to one-twelfth of all readers at once — so they used the sun sign, which only requires knowing your birth month. Simple, scalable, and ultimately reductive.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Professional astrologers consider the full birth chart — moon sign, rising sign, and planetary placements — to be far more descriptive of an individual than the sun sign alone. The sun sign is the broad stroke. The moon sign is where the portrait gets specific.</p>
            <p className="text-muted-foreground leading-relaxed">If you've never felt quite captured by your sun sign description, you're not unusual. Many people — particularly those who are introverted or emotionally self-aware — find their moon sign describes their inner experience far more accurately than the outward-facing sun sign personality.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How each is calculated</h2>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Sun sign</strong> — The Sun takes approximately 365 days to travel through all 12 signs, spending roughly 30 days in each. Your sun sign is determined simply by your birth date. The boundaries are fixed and consistent year to year, with minor variation of a day or two for cusp births.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Moon sign</strong> — The Moon is much faster. It travels through all 12 signs in approximately 27.3 days, spending only about 2.5 days in each. Two people born in the same week can have different moon signs — and knowing your birth date alone isn't always enough if the Moon was changing signs on your birth day. For most dates, though, the birth date is sufficient.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What each sign governs</h2>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Your sun sign governs:</strong> core identity and sense of self, ego and conscious personality, how you present yourself to the world, your relationship with ambition and recognition, long-term direction and life goals.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Your moon sign governs:</strong> emotional responses and instincts, what makes you feel safe and nurtured, subconscious patterns and habitual reactions, how you behave in close relationships, what you need to feel emotionally secure, your 2am self — the one that surfaces when the performance of day is over.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The most common experience</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Astrologers frequently note that people identify more with their sun sign in professional settings and their moon sign in personal ones. A Capricorn sun — ambitious, disciplined, status-aware — with a Pisces moon — sensitive, emotionally fluid, quietly empathetic — will present very differently at work than at home. They may feel that the Pisces moon describes their inner life more honestly than the Capricorn sun ever has.</p>
            <p className="text-muted-foreground leading-relaxed">This split is why "I don't relate to my sign" is such a consistent experience. If you only know your sun sign, you're only seeing the public layer.</p>
          </section>
        </article>

        <PageFAQ items={FAQ_ITEMS} title="Sun vs Moon Sign FAQs" />

        <section className="max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED.map((t) => (
              <Link key={t.path} to={t.path} className="block rounded-xl border border-border p-4 font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {t.label} →
              </Link>
            ))}
          </div>
        </section>

        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default SunVsMoonSign;
