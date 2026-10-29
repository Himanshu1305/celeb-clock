import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CollectionLayout } from '@/components/central';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { NumerologyLifePath } from '@/components/NumerologyLifePath';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, WebApplicationSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { NumerologyCalculator } from '@/components/numerology/NumerologyCalculator';
import { NUMEROLOGY_DATA, ALL_LIFE_PATH_NUMBERS } from '@/data/numerologyData';

const FAQ_ITEMS = [
  { q: 'What is the difference between Mulank, Bhagyank and Life Path?', a: 'Mulank (Indian method) uses only your birth day, reduced to 1–9: born on the 28th → 2 + 8 = 10 → 1. Bhagyank (Indian / Vedic method) adds every digit of your full date of birth and reduces to 1–9: 9 November 1988 → 9 + 1 + 1 + 1 + 9 + 8 + 8 = 37 → 10 → 1. The Western Life Path reduces the day, month and year separately and keeps the master numbers 11, 22 and 33. Bhagyank and Life Path always end on the same single digit; they differ only when the Western method stops at a master number, which we show separately as "Western master number".' },
  { q: 'Why do Indian calculators never show 11 or 22 as a Bhagyank?', a: 'Indian Mulank and Bhagyank calculators reduce every total to a single digit 1–9 — 29 → 11 → 2. Keeping 11, 22 and 33 is a Western (Pythagorean) convention. BornClock shows the Indian number first and, when your date gives a Western master number, shows that alongside with its own label.' },
  { q: 'What is my name number?', a: 'Type your name into the optional name box. We add the Chaldean letter values (A=1, B=2, C=3, D=4, E=5, U=6, O=7, F=8 and so on — no letter is given 9), show the compound total and reduce it to a single digit 1–9. Shah Rukh Khan → 14 + 15 + 13 = 42 → 4 + 2 = 6.' },
  { q: 'What is numerology?', a: 'Numerology is a system of belief that assigns symbolic meaning to numbers — particularly numbers derived from one\'s name and date of birth. The most widely used system in the West is Pythagorean numerology, attributed to the ancient Greek philosopher Pythagoras, who taught that numbers are the fundamental building blocks of reality. While the philosophical connection to Pythagoras is historical tradition rather than documented fact, the system bearing his name has been used for self-reflection and personality interpretation for centuries.' },
  { q: 'How is the Life Path Number calculated?', a: 'Reduce the day, the month and the full year separately (keeping the master numbers 11, 22 and 33), add the three results, then reduce the total to a single digit — again keeping 11, 22 or 33. Example: Meryl Streep, June 22, 1949 → day 22 (a master number, kept), month 6, year 1+9+4+9 = 23 → 5; 22 + 6 + 5 = 33 — Master Number 33, preserved. This is the method most public numerology calculators use.' },
  { q: 'What are Master Numbers in numerology?', a: 'Master Numbers (11, 22, and 33) are special designations in Pythagorean numerology. They are preserved rather than reduced because they are said to carry a higher vibration and potential than single-digit numbers. 11 is the Illuminator, 22 is the Master Builder, and 33 is the Master Teacher — the rarest of all.' },
  { q: 'Is numerology scientifically proven?', a: 'No. Numerology is not a scientifically validated system. No peer-reviewed research has demonstrated that life path numbers reliably predict personality or life outcomes. BornClock presents numerology as a cultural and symbolic tradition — a framework for self-reflection, not a predictive science. The famous calculations shown use each person\'s verified birth date and the standard Pythagorean method.' },
  { q: 'What is the difference between Life Path Number and Destiny Number?', a: 'The Life Path Number (calculated from birth date) represents your core life purpose and personality. The Destiny Number (or Expression Number, calculated from the numerical values of all letters in your full birth name) represents the talents and challenges you\'ll encounter in life. BornClock focuses on the Life Path Number as the primary numerological indicator.' },
  { q: 'What if my birth date calculation results in a Master Number?', a: 'If your final total is 11, 22, or 33, you have a Master Number life path. You carry both the Master Number energy and the reduced digit energy (11 → 2, 22 → 4, 33 → 6). Most numerologists advise working with the Master Number vibration as a calling, while acknowledging that the reduced digit represents the more easily expressed baseline.' },
  { q: 'How accurate is the BornClock numerology calculator?', a: 'BornClock uses the standard Pythagorean method — day, month and year reduced separately, master numbers 11/22/33 kept — the method most public numerology calculators use. The celebrity examples shown in each life path number page are independently verified using each person\'s documented birth date. The calculation is accurate; what varies is how much personal meaning you assign to the result.' },
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
    <CollectionLayout
      theme="mystic"
      testId="numerology-page"
      seo={(
        <SEO
          title="Numerology Calculator — Mulank, Bhagyank & Name Number | BornClock"
          description="Free numerology calculator: your Mulank and Bhagyank (Indian method), Chaldean name number and Western Life Path from your date of birth — with the working shown."
          keywords="numerology calculator, mulank calculator, bhagyank calculator, name number calculator, life path number, chaldean numerology"
          canonicalUrl="/numerology"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }], current: 'Numerology', edition: 'Mulank · Bhagyank · Name number · Life Path' }}
      footer={{
        tagline: 'Mulank, Bhagyank, name number and Western Life Path — computed from your actual birth date and name, with the working shown.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Name Numerology', to: '/name-numerology' },
          { label: 'Compatibility', to: '/compatibility' },
          { label: 'Zodiac', to: '/zodiac' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Numerology"
      h1="Numerology Calculator — Mulank, Bhagyank & Name Number"
      lead="Enter your date of birth (and, if you like, your name) to see your Mulank and Bhagyank the Indian way, your Chaldean name number, and your Western Life Path — each clearly labelled, with the working shown."
    >
      <WebApplicationSchema
        name="Numerology Calculator — Mulank, Bhagyank & Name Number"
        description="Free numerology calculator — Mulank and Bhagyank (Indian method), Chaldean name number and Western Life Path, with the working shown."
        url="/numerology"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <PageTagline />
      <TrustStrip claim="Calculated from your actual birth date and name — Indian and Western methods side by side, never a generic horoscope." href="/how-it-works#numerology" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Calculator — date input always visible and editable (Batch 9) */}
        <section className="mb-8">
          <NumerologyCalculator initialDate={birthDate} onDateChange={setBirthDate} />
          <p className="text-xs text-muted-foreground mt-3">
            Indian numbers (Mulank, Bhagyank, name number) are reduced to 1–9, as Indian calculators do; a Western master number (11, 22, 33) is shown separately and labelled. New to these terms? Read the <Link to="/articles/numerology-by-date-of-birth" className="text-primary hover:underline">India guide to Mulank, Bhagyank and Life Path</Link>, or use the <Link to="/name-numerology" className="text-primary hover:underline">full name calculator</Link>.
          </p>
        </section>

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
              The Life Path Number is the central calculation in Pythagorean numerology. It is derived by reducing the day, month and year of your birth separately, adding them, and reducing the total to a single digit — or to one of three Master Numbers (11, 22, 33) that are considered too significant to reduce further. The result is said to represent your core life purpose: the themes, talents, and challenges that will be most consistently present throughout your life.
            </p>
          </div>
        </section>

        {/* History */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">A Brief History of Numerology</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The belief that numbers carry meaning beyond their mathematical function appears across virtually every major human civilization. Ancient Babylonians used numerical systems to interpret omens. The ancient Hebrews developed gematria — a practice of assigning numerical values to letters to find hidden meanings in sacred texts. In China, certain numbers are considered lucky or unlucky based on phonetic associations. In India, numerology (Ank Shastra) uses the birth date and name in a different but parallel tradition — the Mulank and Bhagyank.
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
            <p>Reduce the day, the month and the full year separately (keeping the master numbers 11, 22 and 33), add the three results, then reduce the total to a single digit — again keeping 11, 22 or 33.</p>
            <div className="bg-slate-900 dark:bg-slate-950 text-green-400 rounded-xl px-5 py-4 font-mono text-sm leading-relaxed">
              <p className="text-slate-400 text-xs mb-2"># Example: Meryl Streep, born June 22, 1949</p>
              <p>Day 22 → 22 (Master Number, kept) · Month 6 · Year 1+9+4+9 = 23 → 5</p>
              <p>Total: 22 + 6 + 5 = 33</p>
              <p className="text-amber-400">Result: Master Number 33 — The Master Teacher</p>
              <p className="text-slate-400 text-xs mt-2"># 33 is a Master Number → preserved, not reduced further</p>
            </div>
            <div className="bg-slate-900 dark:bg-slate-950 text-green-400 rounded-xl px-5 py-4 font-mono text-sm leading-relaxed">
              <p className="text-slate-400 text-xs mb-2"># Example: Taylor Swift, born December 13, 1989</p>
              <p>Day 13 → 4 · Month 12 → 3 · Year 1+9+8+9 = 27 → 9</p>
              <p>Total: 4 + 3 + 9 = 16 → 1+6 = 7</p>
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
                        <span className="text-xs text-amber-700">Master Number</span>
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

        {/* Numerology tools */}
        <div className="rounded-xl border border-border p-6 mb-8">
          <p className="font-semibold text-foreground mb-3">More numerology tools</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link to="/name-numerology" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Name numerology (Expression & Soul Urge)</Link>
            <Link to="/chaldean-numerology" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Chaldean numerology</Link>
            <Link to="/name-correction" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Name correction (Chaldean)</Link>
            <Link to="/business-name-numerology" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Business name numerology</Link>
            <Link to="/mobile-number-numerology" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Mobile number numerology</Link>
            <Link to="/house-number-numerology" className="rounded-lg border border-border px-3 py-2 hover:border-primary">House number numerology</Link>
            <Link to="/attitude-number" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Birthday & attitude number</Link>
            <Link to="/personal-year-number" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Personal year number</Link>
          </div>
        </div>

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
          <strong>About This Content:</strong> BornClock uses the classical Pythagorean method (day, month and year reduced separately; master numbers kept). Life path numbers are a cultural and symbolic tradition, not a scientifically validated system. Celebrity calculations are independently verified using documented birth dates. Forer (1949) citation: <em>The Fallacy of Personal Validation</em>, Journal of Abnormal and Social Psychology.
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8 mb-4 px-4">
        Last reviewed: August 2026 · Sources verified by BornClock Editorial Team
      </p>
    </CollectionLayout>
  );
}
