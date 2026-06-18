import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Globe, FlaskConical, HeartHandshake } from 'lucide-react';
import PageTagline from '@/components/PageTagline';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About BornClock — Built in India, Designed for the World | BornClock"
        description="BornClock is a free birthday and longevity tool built by an independent team in India. Learn about our mission, the science behind our calculators, and how to reach us."
        keywords="about BornClock, BornClock team, about bornclock.com"
        canonicalUrl="/about"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About BornClock
          </h1>
          <PageTagline />
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            We believe everyone deserves to understand their own timeline — not just in years, months, and days, but in the full cosmic and biological richness of what a human life actually is.
          </p>
          <div className="mt-8 pl-6 border-l-4 border-primary">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              "Know your time. Live it well."
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This is what BornClock is built around. Life expectancy, birthday insights, and the science of a longer life — all from your date of birth.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What We Do</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              BornClock gives you a handful of simple, beautiful tools built around one input: your date of birth. From that single number, you can find out your exact age to the second, how old you are on every planet in the solar system, which celebrities share your birthday, what your zodiac sign and birthstone are, your numerology life path number, and a science-grounded estimate of how long you might live — and what you can do to change it.
            </p>
            <p>
              Everything runs instantly, in your browser, without requiring an account. The data we need stays on your device. The result you get is yours to keep, share, or explore.
            </p>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">The Science Behind BornClock</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            The Life Expectancy Calculator — our most complex tool — is built on three independently validated pillars. We don't just hand you a number; we show you every factor that went into it and let you explore what changes.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Pillar 0 — Where You Start</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Age-conditional baselines from UN World Population Prospects 2024, specific to your country, age, and sex. The same tables actuaries and governments use.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Pillar 1 — Your Genes</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Family longevity adjustments derived from heritability research (Polderman et al., Nature Genetics, 2015). Because your parents' and grandparents' ages tell a story.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Pillar 2 — Your Choices</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Twelve modifiable lifestyle factors — from sleep to community bonds — each calibrated from peer-reviewed studies (GBD 2019, Lancet, NEJM). You have more control than you think.
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            Every source and formula is publicly documented on our{' '}
            <a href="/methodology" className="text-blue-500 hover:underline">Methodology page</a>.
          </p>
        </section>

        {/* Built in India */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Built in India, Designed for the World</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              BornClock was started by an independent team in India who wanted to build something both rigorous and accessible — a tool that respects your intelligence, cites its sources, and doesn't treat you as an advertising target.
            </p>
            <p>
              We support 54 countries with country-specific life expectancy baselines, including detailed data for India (sourced from WHO and the UN). We are deeply aware that longevity research has historically over-represented Western populations, and we are committed to expanding our regional data as better sources become available.
            </p>
            <p>
              Our tools are used by people who are curious about science, fascinated by space, planning their health, or simply want to know which Bollywood star shares their birthday. We don't think those are different kinds of people. Curiosity is curiosity.
            </p>
          </div>
        </section>

        {/* Explore Our Tools */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Explore Our Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: '⏱️', label: 'Age Calculator', to: '/age-calculator' },
              { icon: '🔬', label: 'Life Expectancy', to: '/life-expectancy' },
              { icon: '🧬', label: 'Biological Age', to: '/biological-age' },
              { icon: '🪐', label: 'Planetary Age', to: '/planetary-age' },
              { icon: '⭐', label: 'Zodiac Signs', to: '/zodiac' },
              { icon: '🔢', label: 'Numerology', to: '/numerology' },
              { icon: '💎', label: 'Birthstone', to: '/birthstone' },
              { icon: '🌍', label: 'Country Comparison', to: '/country-comparison' },
              { icon: '🎂', label: 'Celebrity Birthdays', to: '/celebrity-birthday' },
            ].map(tool => (
              <Link
                key={tool.to}
                to={tool.to}
                className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium text-foreground"
              >
                <span className="text-lg">{tool.icon}</span>
                <span>{tool.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Get in Touch */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Get in Touch</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We are a small team and we read every email. Whether you've found a data error, have a feature idea, or just want to say hello — we'd genuinely like to hear from you.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'General enquiries', email: 'hello@bornclock.com', desc: 'Questions, feedback, feature requests' },
              { label: 'Privacy requests', email: 'privacy@bornclock.com', desc: 'Data access, deletion, GDPR, DPDP' },
              { label: 'Press & partnerships', email: 'press@bornclock.com', desc: 'Media, collaborations, API enquiries' },
            ].map(({ label, email, desc }) => (
              <div key={email} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
                <a href={`mailto:${email}`} className="text-blue-500 hover:underline text-sm block mb-2">{email}</a>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
