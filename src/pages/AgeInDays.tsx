import { Link } from 'react-router-dom';
import { AgeCalculator } from '@/components/AgeCalculator';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { AuthorBio } from '@/components/AuthorBio';

const FAQ_ITEMS = [
  { question: 'How do I calculate my age in days?', answer: "Multiply your completed years by 365, add one day for each leap year within your lifetime, then add the days elapsed since your last birthday. BornClock's calculator does all of this automatically and updates live every midnight." },
  { question: 'How many days old is a 30-year-old?', answer: 'Typically between 10,957 and 10,988 days — the exact number depends on how many leap years fall within their lifetime and whether their birthday has already occurred this year.' },
  { question: 'What is the 10,000-day milestone?', answer: "The 10,000-day milestone falls at approximately 27 years and 4–5 months old. It's one of the most significant numerical milestones in a human life that almost nobody notices — because we don't count age in days. Check when yours falls." },
  { question: 'Does the age-in-days calculation include the day you were born?', answer: 'Yes — your birth date is counted as day one. BornClock follows this convention, which is also how age in days is counted medically.' },
];

const RELATED = [
  { path: '/age-calculator', label: 'Age Calculator' },
  { path: '/birthday-countdown', label: 'Birthday Countdown' },
];

const AgeInDays = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Age in Days Calculator — How Many Days Old Are You?"
        description="Find out exactly how many days old you are — updated live, including leap years. Most people are surprised how large the number is. Free, instant, no sign-up."
        keywords="age in days, how many days old am I, age calculator days, days old calculator"
        canonicalUrl="/age-in-days"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Age in Days Calculator"
        description="Find your exact age in days, updated live. Accounts for leap years automatically."
        url="/age-in-days"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            How Many Days Old Are You?
          </h1>
          <EEATBadges sources={['ISO 8601', 'WHO Health Metrics']} />
        </section>

        <section id="calculator" className="max-w-4xl mx-auto mb-12">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Here's something most people never think to check: a 30-year-old has been alive for somewhere between 10,957 and 10,988 days — the exact number depends on leap years and whether their birthday has passed this year. Your age in days is the total calendar days elapsed since your birth date, recalculated every midnight. Enter your date of birth above and see yours now.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why your age in days is more interesting than it sounds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">When you find out you're 11,000 days old, something quietly shifts. That number has weight in a way "30 years" doesn't. Many people describe it as both sobering and motivating — each day becomes a unit with meaning, not just a fraction of something larger.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">There's also a milestone dimension that years miss entirely. Turning 10,000 days old is a genuine life event — it falls at around age 27 and a half and passes completely unnoticed by most people. The 5,000-day mark arrives at roughly 13 years and 8 months. The 20,000-day mark, if you reach it, lands at about 54 years and 9 months. These are real thresholds in a human life, hiding in plain sight because nobody's counting.</p>
            <p className="text-muted-foreground leading-relaxed">Note on birth time: your age in days is based on your date of birth, not the exact hour. If you were born at 11pm, the first hour of your life is still counted as day one — a rounding difference that becomes meaningless within days and doesn't affect the day count at all.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How the calculation works</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Calculating age in days sounds simple — just multiply years by 365 — but that gives you only an approximation. The accurate method accounts for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
              <li><strong className="text-foreground">Leap years</strong> — one extra day every four years (with exceptions for century years not divisible by 400). If you were born in February or March, this matters more than you'd think.</li>
              <li><strong className="text-foreground">Whether your birthday has passed this year</strong> — if it hasn't, you're technically still in your previous year of life, which affects the total day count.</li>
              <li><strong className="text-foreground">The current date</strong> — your age in days changes every midnight, so the number is always moving.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">BornClock's calculator handles all of this automatically and gives you a live figure that updates as each new day begins.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Day milestones worth knowing</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="text-left p-3 border border-border text-foreground">Milestone</th>
                    <th className="text-left p-3 border border-border text-foreground">Age in Years</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ['1,000 days', '2 years, 8–9 months'],
                    ['5,000 days', '13 years, 8 months'],
                    ['10,000 days', '27 years, 4–5 months'],
                    ['15,000 days', '41 years, 1 month'],
                    ['20,000 days', '54 years, 9–10 months'],
                    ['25,000 days', '68 years, 6 months'],
                    ['30,000 days', '82 years, 2 months'],
                  ].map(([m, a]) => (
                    <tr key={m}>
                      <td className="p-3 border border-border">{m}</td>
                      <td className="p-3 border border-border">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed">Most people hit the 10,000-day mark completely unaware. It's worth knowing when yours falls — and maybe marking it.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why some people track age in days</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Doctors and researchers often use days rather than years when precision matters. In neonatal medicine, a premature baby's age is tracked in days and weeks — the difference between day 180 and day 200 can be clinically significant. In oncology research, treatment outcomes are measured in days of survival. In developmental psychology, cognitive milestones are tracked by day ranges, not birth years.</p>
            <p className="text-muted-foreground leading-relaxed">Outside medicine, endurance athletes sometimes track their age in days as a motivational frame. Each day is a unit of training, not a fraction of a year. When you're 11,432 days old, day 11,433 feels distinct in a way that "30 years, 3 months" never quite does.</p>
          </section>
        </article>

        <PageFAQ items={FAQ_ITEMS} title="Age in Days FAQs" />

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

export default AgeInDays;
