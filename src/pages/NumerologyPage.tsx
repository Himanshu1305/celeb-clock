import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { NumerologyLifePath } from '@/components/NumerologyLifePath';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { AgeCalculator } from '@/components/AgeCalculator';
import { NUMEROLOGY_DATA, ALL_LIFE_PATH_NUMBERS } from '@/data/numerologyData';

const FAQ_ITEMS = [
  { q: 'What is numerology?', a: 'Numerology is a system of belief that assigns symbolic meaning to numbers — particularly numbers derived from one\'s name and date of birth. The most widely used system in the West is Pythagorean numerology, attributed to the ancient Greek philosopher Pythagoras, who taught that numbers are the fundamental building blocks of reality. While the philosophical connection to Pythagoras is historical tradition rather than documented fact, the system bearing his name has been used for self-reflection and personality interpretation for centuries.' },
  { q: 'How is the Life Path Number calculated?', a: 'Sum all the individual digits of your full birth date (day + month + full year). Keep reducing two-digit totals until you reach a single digit — unless the sum is 11, 22, or 33, which are Master Numbers preserved without further reduction. Example: Albert Einstein, March 14, 1879 → 0+3+1+4+1+8+7+9 = 33. Master Number 33 — preserved.' },
  { q: 'What are Master Numbers in numerology?', a: 'Master Numbers (11, 22, and 33) are special designations in Pythagorean numerology. They are preserved rather than reduced because they are said to carry a higher vibration and potential than single-digit numbers. 11 is the Illuminator, 22 is the Master Builder, and 33 is the Master Teacher — the rarest of all.' },
  { q: 'Is numerology scientifically proven?', a: 'No. Numerology is not a scientifically validated system. No peer-reviewed research has demonstrated that life path numbers reliably predict personality or life outcomes. BornClock presents numerology as a cultural and symbolic tradition — a framework for self-reflection, not a predictive science. The famous calculations shown use each person\'s verified birth date and the standard Pythagorean method.' },
  { q: 'What is the difference between Life Path Number and Destiny Number?', a: 'The Life Path Number (calculated from birth date) represents your core life purpose and personality. The Destiny Number (or Expression Number, calculated from the numerical values of all letters in your full birth name) represents the talents and challenges you\'ll encounter in life. BornClock focuses on the Life Path Number as the primary numerological indicator.' },
  { q: 'What if my birth date calculation results in a Master Number?', a: 'If your birth date digit sum reaches 11, 22, or 33 at any point in the reduction, you have a Master Number life path. You carry both the Master Number energy and the reduced digit energy (11 → 2, 22 → 4, 33 → 6). Most numerologists advise working with the Master Number vibration as a calling, while acknowledging that the reduced digit represents the more easily expressed baseline.' },
  { q: 'How accurate is the BornClock numerology calculator?', a: 'BornClock uses the standard Pythagorean digit-sum method — the most widely used numerology calculation system. The celebrity examples shown in each life path number page are independently verified using each person\'s documented birth date. The calculation is accurate; what varies is how much personal meaning you assign to the result.' },
  { q: 'What is the most common Life Path Number?', a: 'Research on Life Path distribution suggests that numbers 1, 3, 5, and 7 occur somewhat more frequently than others, simply because of how the arithmetic of birth date distribution across the year works. Master Numbers (11, 22, 33) are the rarest, occurring in approximately 3–5% of the population combined.' },
];

export default function NumerologyPage() {
  const { birthDate, setBirthDate } = useBirthDate();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Numerology Calculator — Find Your Life Path Number | BornClock"
        description="Free numerology calculator using the Pythagorean method. Find your Life Path Number, explore all 12 numbers including Master Numbers 11, 22, 33 — with verified celebrity examples."
        keywords="numerology calculator, life path number, pythagorean numerology, master numbers 11 22 33, numerology calculator free"
        canonicalUrl="/numerology"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Numerology Calculator — Your Life Path Number
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Enter your date of birth to calculate your Life Path Number using the classical Pythagorean method — then explore what it means, which famous people share it, and how the system works.
          </p>
        </div>

        {/* Calculator */}
        {!birthDate && (
          <section className="mb-12">
            <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="mb-12 animate-fade-in-up">
            <NumerologyLifePath birthDate={birthDate} />
          </section>
        )}

        {/* What Is Numerology */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What Is Numerology?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Numerology is the study of the symbolic significance of numbers in human life. The most widely practiced system in the Western world is Pythagorean numerology, attributed to the ancient Greek philosopher Pythagoras (c. 570–495 BCE), who taught that numbers are the fundamental reality underlying all of existence. The Pythagorean school believed that each number from 1 to 9 carries a distinct vibrational quality that influences the character and destiny of people born under its influence.
            </p>
            <p>
              The Life Path Number is the central calculation in Pythagorean numerology. It is derived by summing all the individual digits of your complete birth date and reducing the result to a single digit — or to one of three Master Numbers (11, 22, 33) that are considered too significant to reduce further. The result is said to represent your core life purpose: the themes, talents, and challenges that will be most consistently present throughout your life.
            </p>
          </div>
        </section>

        {/* History */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">A Brief History of Numerology</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The belief that numbers carry meaning beyond their mathematical function appears across virtually every major human civilization. Ancient Babylonians used numerical systems to interpret omens. The ancient Hebrews developed gematria — a practice of assigning numerical values to letters to find hidden meanings in sacred texts. In China, certain numbers are considered lucky or unlucky based on phonetic associations. In India, Vedic numerology (Jyotish) uses birth name and date in a different but parallel tradition.
            </p>
            <p>
              The specific Western numerology system used today — nine core numbers, letter-to-number equivalences, life path calculation — was codified largely in the 19th and 20th centuries, drawing on earlier Pythagorean and Kabbalistic traditions. The work of Luo Clement, L. Dow Balliet, and particularly Florence Campbell in the early 20th century established the frameworks that modern numerologists still follow.
            </p>
          </div>
        </section>

        {/* How to Calculate */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">How to Calculate Your Life Path Number</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Sum every individual digit of your full date of birth, then reduce to a single digit (stopping at 11, 22, or 33 — Master Numbers).</p>
            <div className="bg-slate-900 dark:bg-slate-950 text-green-400 rounded-xl px-5 py-4 font-mono text-sm leading-relaxed">
              <p className="text-muted-foreground text-xs mb-2"># Example: Albert Einstein, born March 14, 1879</p>
              <p>Date: 0 3 · 1 4 · 1 8 7 9</p>
              <p>Sum: 0+3+1+4+1+8+7+9 = 33</p>
              <p className="text-amber-400">Result: Master Number 33 — The Master Teacher</p>
              <p className="text-muted-foreground text-xs mt-2"># 33 is a Master Number → preserved, not reduced further</p>
            </div>
            <div className="bg-slate-900 dark:bg-slate-950 text-green-400 rounded-xl px-5 py-4 font-mono text-sm leading-relaxed">
              <p className="text-muted-foreground text-xs mb-2"># Example: Taylor Swift, born December 13, 1989</p>
              <p>Date: 1 2 · 1 3 · 1 9 8 9</p>
              <p>Sum: 1+2+1+3+1+9+8+9 = 34</p>
              <p>34 → 3+4 = 7</p>
              <p className="text-green-400">Result: Life Path 7 — The Seeker</p>
            </div>
          </div>
        </section>

        {/* All Life Path Numbers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">All Life Path Numbers — Quick Guide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_LIFE_PATH_NUMBERS.map(n => {
              const nd = NUMEROLOGY_DATA.find(d => d.number === n);
              if (!nd) return null;
              return (
                <Link key={n} to={`/numerology/${n}`}
                  className="block rounded-xl border border-border bg-card hover:shadow-md transition-all hover:scale-[1.01] p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: nd.hexColor }}>
                      {n}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{nd.name}</p>
                      {nd.isMasterNumber && (
                        <span className="text-xs text-amber-500">Master Number</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {nd.keywords.slice(0, 2).map(k => (
                      <span key={k} className="text-xs text-muted-foreground">{k}</span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Science Perspective */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">The Science Perspective</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Like astrology, numerology is not a scientifically validated predictive system. No peer-reviewed research has demonstrated that life path numbers reliably predict personality traits or life outcomes beyond chance. The psychological phenomenon most relevant here is the Barnum/Forer effect — the tendency to accept generic personality descriptions as uniquely accurate self-descriptions [Forer, B.R., 1949. The Fallacy of Personal Validation. Journal of Abnormal and Social Psychology].
            </p>
            <p>
              Where numerology has genuine value is as a framework for self-reflection. The life path number descriptions are detailed enough to prompt meaningful self-examination — to ask whether the themes described resonate with your experience, and why. Used this way, numerology functions similarly to any other structured self-reflection tool: not as prediction but as a mirror.
            </p>
          </div>
        </section>

        {/* Master Numbers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Master Numbers — 11, 22, and 33</h2>
          <div className="space-y-4">
            {NUMEROLOGY_DATA.filter(d => d.isMasterNumber).map(d => (
              <Link key={d.number} to={`/numerology/${d.number}`}
                className="block bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                    style={{ backgroundColor: d.hexColor }}>
                    {d.number}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.masterNumberMeaning?.split('.')[0]}.</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center mb-8">
          <p className="text-muted-foreground text-sm mb-4">Explore more BornClock tools</p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/zodiac" className="text-primary hover:underline">Zodiac Signs</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/birthstone" className="text-primary hover:underline">Birthstone Finder</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/generation" className="text-primary hover:underline">Which Generation Are You?</Link>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>About This Content:</strong> BornClock uses the classical Pythagorean digit-sum method. Life path numbers are a cultural and symbolic tradition, not a scientifically validated system. Celebrity calculations are independently verified using documented birth dates. Forer (1949) citation: <em>The Fallacy of Personal Validation</em>, Journal of Abnormal and Social Psychology.
        </div>
      </div>

      <Footer />
    </div>
  );
}
