import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import {
  birthdayNumber, attitudeNumber, BIRTHDAY_MEANINGS, ATTITUDE_MEANINGS,
} from '@/lib/numerologyExtra';

export default function AttitudeNumberPage() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [result, setResult] = useState<{ bday: ReturnType<typeof birthdayNumber>; att: ReturnType<typeof attitudeNumber> } | null>(null);
  const [error, setError] = useState('');

  const calc = () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    if (!(d >= 1 && d <= 31) || !(m >= 1 && m <= 12)) {
      setError('Enter a valid day (1–31) and month (1–12).');
      setResult(null);
      return;
    }
    setError('');
    setResult({ bday: birthdayNumber(d), att: attitudeNumber(d, m) });
  };

  const faqItems = [
    { question: 'What is the Birthday number?', answer: 'Your Birthday number is simply the day of the month you were born, reduced to a single digit (master numbers 11/22/33 are kept). It is one of the easiest numbers to read and describes a specific natural talent you carry.' },
    { question: 'What is the Attitude (or Sun) number?', answer: 'The Attitude number is your birth day plus your birth month, reduced to a single digit. It describes your "first-impression" reflex — how you tend to react to a situation before your fuller Life Path nature takes over.' },
    { question: 'Is this the same as my Life Path number?', answer: 'No. The Life Path uses your full date (day, month and year). The Birthday number uses only the day; the Attitude number uses the day and month. They are complementary layers, not the same figure.' },
    { question: 'Is numerology scientific?', answer: 'No. Numerology is a symbolic tradition, not a science. Treat these as prompts for reflection about tendencies you may recognise — not predictions or instructions.' },
  ];

  return (
    <ToolLayout
      theme="mystic"
      testId="attitude-number-page"
      seo={<SEO
        title="Birthday Number & Attitude Number Calculator — Free Numerology | BornClock"
        description="Free calculator for your Birthday number and Attitude (Sun) number from your date of birth, with plain-language meanings. Part of BornClock's numerology toolkit."
        keywords="birthday number, attitude number, sun number numerology, numerology by date of birth"
        canonicalUrl="/attitude-number"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Birthday & Attitude Number' }}
      footer={{ tagline: 'Birthday and Attitude numbers from your date of birth.', nav: [{ label: 'Numerology', to: '/numerology' }, { label: 'Name numerology', to: '/name-numerology' }, { label: 'Personal year', to: '/personal-year-number' }] }}
      eyebrow="Numerology"
      h1="Birthday &amp; Attitude Number"
      lead="Two quick numbers from your date of birth: your Birthday number (a natural talent) and your Attitude number (your first-impression reflex)."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Day</span>
                <input data-testid="att-day" inputMode="numeric" value={day} onChange={e => setDay(e.target.value)} placeholder="13" className="w-24 rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Month</span>
                <input data-testid="att-month" inputMode="numeric" value={month} onChange={e => setMonth(e.target.value)} placeholder="5" className="w-24 rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="att-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Calculate</button>
            </div>
            {error && <p className="text-sm text-rose-600 mt-2" data-testid="att-error">{error}</p>}
          </div>

          {result && (
            <div className="grid sm:grid-cols-2 gap-4 mb-8" data-testid="att-result">
              <div className="rounded-2xl border border-border p-5 bg-gradient-to-br from-card to-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Birthday number</div>
                <div className="text-4xl font-black text-primary mb-2">{result.bday.number}{result.bday.isMaster && <span className="text-sm font-semibold ml-2 align-middle text-amber-600">master</span>}</div>
                <div className="font-semibold text-foreground">{BIRTHDAY_MEANINGS[result.bday.number]?.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{BIRTHDAY_MEANINGS[result.bday.number]?.text}</p>
                <p className="text-xs text-muted-foreground mt-2">From the day you were born ({result.bday.day}).</p>
              </div>
              <div className="rounded-2xl border border-border p-5 bg-gradient-to-br from-card to-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Attitude (Sun) number</div>
                <div className="text-4xl font-black text-primary mb-2">{result.att.number}</div>
                <div className="font-semibold text-foreground">{ATTITUDE_MEANINGS[result.att.number]?.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{ATTITUDE_MEANINGS[result.att.number]?.text}</p>
                <p className="text-xs text-muted-foreground mt-2">Working: {result.att.working}.</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border p-4 mb-8">
            <h2 className="font-semibold text-foreground mb-1">How these differ from your Life Path</h2>
            <p className="text-sm text-muted-foreground">Your <Link to="/numerology" className="underline">Life Path number</Link> uses your whole date of birth and is the headline number. The Birthday number (day only) adds one clear, specific gift; the Attitude number (day + month) describes your reflex reaction before the Life Path takes over. Read together they give a fuller, more honest picture than any single number.</p>
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Go deeper with your full numerology chart.</p>
            <Link to="/numerology" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Life Path number →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
