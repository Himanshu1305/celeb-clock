import { Link } from 'react-router-dom';
import { AgeCalculator } from '@/components/AgeCalculator';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ShareableCard } from '@/components/ShareableCard';
import { CelebrityMatch } from '@/components/CelebrityMatch';
import { ZodiacAndFacts } from '@/components/ZodiacAndFacts';
import { LifeExpectancyCTA } from '@/components/LifeExpectancyCTA';
import { GenerationLabel } from '@/components/GenerationLabel';
import { FeedbackPrompt } from '@/components/FeedbackPrompt';
import { ReaderComments } from '@/components/ReaderComments';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';
import { useState } from 'react';
import { useSavedProfile } from '@/hooks/useSavedProfile';

/**
 * Progressive-profile bridge for the Age Calculator (Part K, Item 1).
 *
 * DELIBERATELY NON-INVASIVE: this sits at the PAGE level and only uses the existing
 * `setBirthDate` the page already passes into <AgeCalculator>, plus the shared saved
 * profile. It NEVER modifies BirthDateContext (in-memory, non-persisting by design)
 * or the AgeCalculator component. So a user with no saved profile sees the exact same
 * page as before (both offers render nothing). Both offers are opt-in, never forced.
 */
function AgeCalcProfileBridge({ birthDate, onUseSaved }: { birthDate: Date | null; onUseSaved: (d: Date) => void }) {
  const { profile, save } = useSavedProfile();
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedDob = profile?.dob || null;

  // Offer to REUSE a saved date (only if one exists and the calc is still empty).
  if (savedDob && !birthDate && !dismissed) {
    const [y, m, d] = savedDob.split('-').map(Number);
    return (
      <div data-testid="agecalc-use-saved" className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/10 px-4 py-3 text-sm">
        <span className="text-[#6E5AA6]">★ Use your saved birth date — <strong>{savedDob}</strong>?</span>
        <span className="flex gap-3">
          <button type="button" data-testid="agecalc-use-saved-btn" onClick={() => onUseSaved(new Date(y, m - 1, d))}
                  className="text-[#6E5AA6] underline hover:text-[#6E5AA6]">Use it</button>
          <button type="button" onClick={() => setDismissed(true)} className="text-[#6E5AA6] hover:text-[#6E5AA6]">No thanks</button>
        </span>
      </div>
    );
  }

  // Offer to CONTRIBUTE the entered date to the shared profile (only if none saved yet).
  if (birthDate && !profile && !saved) {
    const iso = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    return (
      <div data-testid="agecalc-save-offer" className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/10 px-4 py-3 text-sm">
        <span className="text-[#6E5AA6]">Save this birth date on this device so BornClock’s other tools (Kundali, Sade Sati…) can reuse it?</span>
        <button type="button" data-testid="agecalc-save-btn" onClick={() => { if (save({ dob: iso })) setSaved(true); }}
                className="text-[#6E5AA6] underline hover:text-[#6E5AA6]">Save my date</button>
      </div>
    );
  }
  if (saved) {
    return <div data-testid="agecalc-saved-confirm" className="max-w-4xl mx-auto mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">✓ Saved. Your other tools can now offer to reuse this date (you can change it any time).</div>;
  }
  return null;
}

const AgeCalculatorPage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Best Age Calculator Online — Exact Age in Seconds (Free)"
        description="You're not just 30 years old. You've lived 10,957 days. 946 million seconds. Find your exact age — live, free."
        keywords="best age calculator, age calculator online, exact age, age in days, age in seconds, free age calculator, birthday calculator"
        canonicalUrl="/age-calculator"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Age Calculator"
        description="Free online age calculator — find your exact age in years, months, days, hours, minutes and seconds. Live countdown, no sign-up required."
        url="/age-calculator"
      />
      <FAQSchema items={[
        { question: 'How do I calculate my exact age?', answer: 'Enter your date of birth and the calculator subtracts it from the current date, giving your exact age in years, months, days, hours, minutes and seconds — updated live.' },
        { question: 'Is this age calculator free?', answer: 'Yes. It is completely free, requires no sign-up, and runs entirely in your browser — your date of birth is never stored on a server.' },
        { question: 'How do I calculate age in days or seconds?', answer: 'The calculator shows your total age in days, hours, minutes and seconds automatically once you enter your birth date, alongside the standard years/months/days breakdown.' },
        { question: 'How accurate is the age calculation?', answer: 'It accounts for leap years and exact time elapsed, so the years/months/days figure matches how age is counted officially. The live seconds counter updates every second.' },
      ]} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center gap-3 flex-wrap -mx-4 -mt-8 mb-8 px-4 md:px-6 py-3 bg-[#0E2238] text-white sticky top-0 z-50">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Best Age Calculator — Your Exact Age, Live to the Second
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your date of birth and instantly see your precise age in years, months, days, hours, minutes and seconds — calculated live in your browser and never stored.
          </p>
          <EEATBadges sources={['ISO 8601', 'JavaScript Date Spec']} />
        </section>

        <AgeCalcProfileBridge birthDate={birthDate} onUseSaved={setBirthDate} />

        <section id="calculator" className="max-w-4xl mx-auto mb-16">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        {birthDate && (
          <section className="max-w-md mx-auto mb-16 animate-fade-in-up">
            <GenerationLabel birthYear={birthDate.getFullYear()} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-6xl mx-auto mb-16 animate-fade-in-up">
            <CelebrityMatch birthDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <ZodiacAndFacts birthDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <ShareableCard birthDate={birthDate} />
          </section>
        )}

        {birthDate && <LifeExpectancyCTA />}

        {/* BATCH-9 P3 — batch-8 feedback (stars-only valid, comment optional, two-key),
            result-gated: shown only once the user has an age result. */}
        <section className="max-w-xl mx-auto mb-16">
          <FeedbackPrompt contentType="tool" slug="age-calculator" variant="tool" resultReady={!!birthDate} />
          <ReaderComments contentType="tool" slug="age-calculator" />
        </section>

        <PageFAQ slug="age-calculator" title="Age Calculator FAQs" />

        {/* Related questions — contextual internal links to /answers hub */}
        <section className="max-w-3xl mx-auto mb-12 px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Related Questions</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            <Link to="/answers/how-many-days-until-my-birthday" className="text-sm text-primary hover:underline">→ How many days until my birthday?</Link>
            <Link to="/answers/how-to-calculate-age" className="text-sm text-primary hover:underline">→ How do I calculate my exact age?</Link>
            <Link to="/answers/how-old-am-i-on-mars" className="text-sm text-primary hover:underline">→ How old am I on Mars?</Link>
            <Link to="/answers/who-shares-my-birthday" className="text-sm text-primary hover:underline">→ Which famous people share my birthday?</Link>
          </div>
        </section>

        {/* P1-H internal linking */}
        <section className="max-w-3xl mx-auto mb-12 px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { path: '/age-in-days', label: 'Age in Days' },
              { path: '/age-in-seconds', label: 'Age in Seconds' },
              { path: '/birthday-countdown', label: 'Birthday Countdown' },
              { path: '/biological-age', label: 'Biological Age Test' },
              { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
            ].map((t) => (
              <Link key={t.path} to={t.path} className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground transition-colors">{t.label}</Link>
            ))}
          </div>
        </section>

        <RelatedTools currentSlug="age" />
        <AuthorBio />
      </div>

      <div className="max-w-3xl mx-auto mt-12 px-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources &amp; Methodology</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-none">
            <li>ISO 8601 Date and Time Standard</li>
            <li>Gregorian Calendar — leap year rules (divisible by 4, except centuries unless divisible by 400)</li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-8 mb-4 px-4">
        Last reviewed: August 2026 · Sources verified by BornClock Editorial Team
      </p>

      <Footer />
    </div>
  );
};

export default AgeCalculatorPage;
