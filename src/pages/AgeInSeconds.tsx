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
  { question: "How many seconds old am I if I'm 25?", answer: 'Approximately 788 million seconds (25 × 365.25 × 86,400). The exact figure depends on your birth date and the leap years within your lifetime — BornClock calculates this precisely.' },
  { question: 'What is 1 billion seconds in years?', answer: 'Approximately 31 years and 251 days — about 31.7 years. Most people cross the 1-billion-second threshold in their early thirties, usually without knowing it.' },
  { question: 'Why does the seconds counter update live?', answer: 'Because your age in seconds changes every second. BornClock recalculates continuously so the number reflects the exact elapsed time right now — not a rounded estimate from earlier today.' },
  { question: 'Is the calculation affected by time zones?', answer: 'The calculation is based on your date of birth, not the exact hour — so time zones don’t affect the result in any meaningful way for most people. If you were born very close to midnight and want precision to the hour, birth time matters more, but for day-level accuracy, the date alone is sufficient.' },
];

const RELATED = [
  { path: '/age-calculator', label: 'Age Calculator' },
  { path: '/age-in-days', label: 'Age in Days' },
];

const AgeInSeconds = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Age in Seconds Calculator — How Many Seconds Have You Been Alive?"
        description="Calculate exactly how many seconds old you are — live, updating every second. Most 30-year-olds have passed 946 million seconds. Free, instant, no sign-up."
        keywords="age in seconds, how many seconds old am I, seconds old calculator, how many seconds have I lived"
        canonicalUrl="/age-in-seconds"
      />
      <WebApplicationSchema
        name="Age in Seconds Calculator"
        description="Find your exact age in seconds, updating live every second. Includes leap year calculation."
        url="/age-in-seconds"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            You've Been Alive for This Many Seconds
          </h1>
          <EEATBadges sources={['ISO 8601', 'University of Pennsylvania Research']} />
        </section>

        <section id="calculator" className="max-w-4xl mx-auto mb-12">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Take a breath. In the time it took to read that, three seconds passed — and your counter just went up by three. A 30-year-old has lived approximately 946 million seconds. Watch yours tick upward live above. Most people find the number simultaneously larger and smaller than they expected.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why seconds change how you think about time</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">A billion seconds sounds abstract until you realize it's only 31.7 years. Most people alive today will live through two billion seconds. Some will reach three billion. Very few reach four.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Framed in seconds, time stops feeling infinite. It becomes countable — and that changes something.</p>
            <p className="text-muted-foreground leading-relaxed">Researchers at the University of Pennsylvania have documented what they call temporal landmarks — moments where an unusual framing of time prompts genuine reflection and behavior change. People are measurably more likely to start new habits, make significant decisions, and reset old patterns at temporal landmarks: birthdays, new years, the start of a week. Knowing you're about to cross 500 million seconds, or 1 billion, creates exactly this kind of landmark. One that years would never trigger, because "turning 31" sounds ordinary and "crossing a billion seconds" doesn't.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How the calculation works</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The formula is straightforward: Age in seconds = Age in days × 86,400</p>
            <p className="text-muted-foreground leading-relaxed mb-4">But getting the age in days right requires accounting for leap years, the current date, and whether your birthday has occurred this year. BornClock handles all of this and updates the counter live — so you can watch the number tick upward in real time, one second at a time.</p>
            <p className="text-muted-foreground leading-relaxed">One nuance worth knowing: this calculation counts elapsed seconds from the start of your birth date, not from the exact moment of birth. If you were born at 11:47pm, the very first hours of your life add up to only about 780 seconds — a rounding difference that becomes meaningless within days and has no practical effect on the total.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Seconds milestones in a human life</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="text-left p-3 border border-border text-foreground">Milestone</th>
                    <th className="text-left p-3 border border-border text-foreground">Approximate Age</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ['100 million seconds', '3 years, 2 months'],
                    ['500 million seconds', '15 years, 10 months'],
                    ['1 billion seconds', '31 years, 8 months'],
                    ['1.5 billion seconds', '47 years, 6 months'],
                    ['2 billion seconds', '63 years, 4 months'],
                    ['2.5 billion seconds', '79 years, 2 months'],
                    ['3 billion seconds', '95 years'],
                  ].map(([m, a]) => (
                    <tr key={m}>
                      <td className="p-3 border border-border">{m}</td>
                      <td className="p-3 border border-border">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed">The 1-billion-second birthday falls at exactly 31 years, 251 days, 13 hours, 34 minutes and 54 seconds old. Some people actually celebrate it. If you haven't crossed it yet, check how far away yours is.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What a second is worth</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Your heart beats roughly once per second at rest. That means your age in seconds is also approximately the number of times your heart has beaten while you were resting — though during exercise, stress, or deep sleep, the rate shifts considerably.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Think about that for a moment. A billion seconds isn't just time. It's a billion heartbeats. A billion moments of your body choosing, without any instruction from you, to keep going.</p>
            <p className="text-muted-foreground leading-relaxed">Take a breath right now. That's one more second. That's the counter you're watching.</p>
          </section>
        </article>

        <PageFAQ items={FAQ_ITEMS} title="Age in Seconds FAQs" />

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

export default AgeInSeconds;
