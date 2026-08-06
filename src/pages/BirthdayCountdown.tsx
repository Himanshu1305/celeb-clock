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
  { question: 'How do I calculate days until my birthday?', answer: "Find the next occurrence of your birth date (this year if it hasn't passed, next year if it has), then count every calendar day between today and that date. BornClock does this automatically, accounting for leap years." },
  { question: 'What if my birthday is tomorrow?', answer: 'The countdown shows 1 day. On your birthday itself, the counter resets to 365 (or 366 in a leap year) and begins counting down to the following year’s birthday immediately.' },
  { question: 'What day of the week will my birthday fall on?', answer: 'BornClock shows the day of the week for your upcoming birthday alongside the countdown. The day shifts by one each year, or two after a leap year — so it rotates through the week over a 5–6 year cycle.' },
  { question: 'What if I was born on February 29?', answer: 'Leap day birthdays are counted to the next February 29. BornClock notes how many years until your next technical birthday and indicates the conventional celebration date (February 28 or March 1) for non-leap years.' },
];

const RELATED = [
  { path: '/age-calculator', label: 'Age Calculator' },
  { path: '/todays-birthdays', label: "Today's Birthdays" },
  { path: '/celebrity-birthday', label: 'Celebrity Birthday Match' },
];

const BirthdayCountdown = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Birthday Countdown — How Many Days Until Your Next Birthday?"
        description="Find out exactly how many days until your next birthday — down to the day. See what day of the week it falls on and who shares it. Free, no sign-up."
        keywords="birthday countdown, days until my birthday, how many days until my birthday, birthday timer"
        canonicalUrl="/birthday-countdown"
      />
      <WebApplicationSchema
        name="Birthday Countdown Calculator"
        description="Count down the exact days until your next birthday. Shows day of week, season, and celebrity birthday twins."
        url="/birthday-countdown"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            How Many Days Until Your Next Birthday?
          </h1>
          <EEATBadges sources={['Psychological Science Journal', 'Pew Research']} />
        </section>

        <section id="calculator" className="max-w-4xl mx-auto mb-12">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your birthday countdown is the exact number of calendar days between today and your next birthday — whether that's this year or next, depending on whether it's already passed. Enter your date of birth above and see your count now, along with what day of the week it falls on.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why knowing your exact countdown matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Birthdays have an outsized effect on human psychology — not just culturally, but measurably. A 2012 study in Psychological Science found that people are significantly more likely to make major life decisions — starting a business, ending a relationship, beginning a fitness habit — in the window surrounding their birthday. Researchers called this the fresh start effect: birthdays function as personal new years, prompting reflection and intention-setting in ways that arbitrary dates don't.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Knowing exactly how many days you have until your next birthday turns a vague future event into a concrete anchor. "My birthday is in a few months" produces no particular response. "My birthday is in 47 days" does something different — it makes the transition feel real and close enough to actually prepare for.</p>
            <p className="text-muted-foreground leading-relaxed">And if you're someone who dreads a particular birthday — turning 30, 40, 50 — knowing the exact countdown can paradoxically help. Rather than a looming abstract event, it becomes a specific date with a specific number of days. That specificity makes it manageable. It also gives you time to decide how you want to meet it: passively, or with intention.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What the countdown tells you</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Beyond the day count itself, your birthday countdown surfaces several useful things:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Day of the week</strong> — whether your birthday falls on a weekend or weekday shapes what kind of celebration is even possible.</li>
              <li><strong className="text-foreground">Season</strong> — a winter birthday and a summer birthday have entirely different planning considerations.</li>
              <li><strong className="text-foreground">Your half-birthday</strong> — the midpoint between two birthdays, increasingly recognised as its own occasion, particularly for children whose birthdays fall close to major holidays.</li>
              <li><strong className="text-foreground">Your age on the next birthday</strong> — which is the number that matters for reflection, not the current one.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Not all birthdays land the same way</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">September is the most common birth month in the US and UK — more people celebrate in September than any other month. If yours falls there, you share it with more people than almost anyone else born in the year.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">February 29 birthdays only occur every four years. Leap day babies (called leaplings) technically have a real birthday once every four years — though most celebrate on February 28 or March 1 in non-leap years, depending on personal preference.</p>
            <p className="text-muted-foreground leading-relaxed">December 25 is statistically the rarest birthday in the US — hospitals schedule fewer births on Christmas Day, making it the least common date of the year. If you're a December 25 birthday, you're genuinely uncommon.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Using the countdown as a personal reset</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Some people use their birthday countdown as a planning anchor rather than waiting for January 1st — a cultural new year that may have no personal significance. The logic is simple: it's your year turning over, not the world's. Forty-seven days out from your birthday is a natural time to ask what you want the next 365 days to look like — before the noise of the day itself arrives.</p>
            <p className="text-muted-foreground leading-relaxed">This approach has real precedent. Several cultures treat the birthday as the more significant annual marker for exactly this reason: it's personal, not collective.</p>
          </section>
        </article>

        <PageFAQ items={FAQ_ITEMS} title="Birthday Countdown FAQs" />

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

export default BirthdayCountdown;
