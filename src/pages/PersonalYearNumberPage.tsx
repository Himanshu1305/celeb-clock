/**
 * Personal Year Number Calculator (Backlog-1, Route /personal-year-number).
 *
 * Rule 13 (date-dependent): the personal year depends on the CURRENT calendar year,
 * so the number is computed in the browser at view time — never baked in at
 * build/prerender. The static explanation renders on first paint; the computed
 * year numbers fill only after the user submits the form.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { TrustStrip } from '@/components/paj/TrustStrip';
import {
  computePersonalYear,
  getPersonalYearMeaning,
  reduceToSingleDigit,
} from '@/lib/personalYear';

const TITLE = 'Personal Year Number Calculator — Numerology Cycle | BornClock';
const DESCRIPTION =
  'Personal year number calculator — numerology cycle for this year and next. Enter birth day and month; no birth year needed. Pythagorean method, honestly framed.';

const FAQ_ITEMS = [
  {
    question: 'What is a personal year number?',
    answer:
      'A personal year number is a concept in Pythagorean numerology that assigns a number from 1 to 9 to each calendar year of your life. It is calculated from your birth month, birth day, and the current calendar year. Each number is said to carry a different symbolic theme — beginnings, patience, expression, foundations, change, responsibility, reflection, ambition, or completion — making the nine-year cycle a framework for reflection, not a prediction of events.',
  },
  {
    question: 'How is the personal year number calculated?',
    answer:
      'Reduce your birth month to a single digit (e.g. November = 11 → 1 + 1 = 2). Reduce your birth day to a single digit (e.g. 29 → 2 + 9 = 11 → 1 + 1 = 2). Reduce the current year to a single digit (e.g. 2026 → 2 + 0 + 2 + 6 = 10 → 1 + 0 = 1). Add the three reduced numbers and reduce the sum to a single digit 1–9. That final number is your personal year for that calendar year.',
  },
  {
    question: 'What does each personal year number mean?',
    answer:
      'Each of the nine numbers carries a traditional theme: 1 = new beginnings; 2 = patience and partnership; 3 = expression and creativity; 4 = foundations and hard work; 5 = change and freedom; 6 = home and responsibility; 7 = reflection and depth; 8 = ambition and results; 9 = completion and release. These are symbolic themes for reflection — not predictions about what will happen.',
  },
  {
    question: 'Is numerology scientific?',
    answer:
      'No. Numerology is a symbolic tradition rooted in ancient number mysticism — it is not a scientific discipline and has no validated predictive power. The meanings associated with numbers are cultural and philosophical conventions, not empirical findings. BornClock presents personal year numbers as a framework for personal reflection, not as forecasts of events or advice on decisions.',
  },
];

interface YearResult {
  month: number;
  day: number;
  currentYear: number;
  nextYear: number;
  currentResult: ReturnType<typeof computePersonalYear>;
  nextResult: ReturnType<typeof computePersonalYear>;
}

function WorkedExample({ month, day, year }: { month: number; day: number; year: number }) {
  const m = reduceToSingleDigit(month);
  const d = reduceToSingleDigit(day);
  const y = reduceToSingleDigit(year);
  const sum = m + d + y;
  const final = reduceToSingleDigit(sum);
  return (
    <div className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/10 p-4 text-sm text-foreground space-y-1">
      <div className="font-semibold text-[#6E5AA6] mb-2">How this was worked out ({year})</div>
      <div>Birth month: {month} → reduced: <strong>{m}</strong></div>
      <div>Birth day: {day} → reduced: <strong>{d}</strong></div>
      <div>Current year: {year} → reduced: <strong>{y}</strong></div>
      <div className="border-t border-[#6E5AA6]/20 mt-2 pt-2">Sum: {m} + {d} + {y} = {sum} → reduced: <strong>{final}</strong></div>
    </div>
  );
}

function YearCard({ result, label }: { result: ReturnType<typeof computePersonalYear>; label: string }) {
  const meaning = getPersonalYearMeaning(result.number);
  return (
    <div className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/5 p-5">
      <div className="text-xs font-semibold text-[#6E5AA6]/70 uppercase tracking-wide mb-1">{label}</div>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-5xl font-black text-[#6E5AA6]">{result.number}</span>
        <span className="text-xl font-bold text-foreground">{meaning.title}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-1">{meaning.essence}</p>
      <p className="text-xs text-muted-foreground"><strong className="text-foreground">Focus themes:</strong> {meaning.focus}</p>
      <p className="text-xs text-[#6E5AA6]/60 mt-2">Universal year for {result.year}: {result.universalYear}</p>
    </div>
  );
}

export default function PersonalYearNumberPage() {
  // Controlled form state — only month+day are needed; year is read from Date at submit time.
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<YearResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (!m || m < 1 || m > 12) { setError('Please enter a valid month (1–12).'); return; }
    if (!d || d < 1 || d > 31) { setError('Please enter a valid day (1–31).'); return; }

    // Rule 13: read the current year from the browser clock at submit time.
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    setResult({
      month: m,
      day: d,
      currentYear,
      nextYear,
      currentResult: computePersonalYear(m, d, currentYear),
      nextResult: computePersonalYear(m, d, nextYear),
    });
  };

  return (
    <PajPage
      theme="mystic"
      variant="editorial"
      testId="personal-year-number-page"
      seo={(
        <SEO
          title={TITLE}
          description={DESCRIPTION}
          canonicalUrl="/personal-year-number"
          ogType="website"
        />
      )}
      breadcrumb={{
        trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }],
        current: 'Personal Year Number',
        edition: 'Pythagorean · Nine-year cycle',
      }}
      footer={{
        tagline: 'Personal year numbers from the Pythagorean method — computed in your browser at view time.',
        nav: [
          { label: 'Numerology', to: '/numerology' },
          { label: 'Life Path 7', to: '/numerology/7' },
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'How It Works', to: '/how-it-works' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Symbolic tradition, presented honestly.',
      }}
    >
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Pythagorean · Nine-year cycle</span>
            <h1>Personal Year Number Calculator.</h1>
          </div>
          <p>
            Enter your birth day and month — no birth year needed. The calculator derives
            your Personal Year Number for this year and next using the standard Pythagorean
            method: reduce your month, day, and the current calendar year each to a single
            digit, add them, and reduce again to 1–9.
          </p>
        </div>

        <TrustStrip claim="Worked out in your browser from today's date — so it's always current, never baked in months ago." href="/how-it-works#numerology" />

        {/* Honest framing — renders on first paint */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
          <strong>Honest framing:</strong> Numerology is a symbolic tradition for self-reflection, not a predictive science. Personal year numbers are prompts for thinking about where you are in a cycle — they are not forecasts of events or advice on decisions. The nine-year cycle (1–9) does not preserve master numbers, which is the common and internally consistent choice for this particular calculation.
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 mb-6" aria-label="Personal year number calculator">
          <h3 className="font-semibold text-foreground mb-1">Your birth day and month</h3>
          <p className="text-xs text-muted-foreground mb-4">Only month and day are used — your birth year is not needed for this calculation.</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="pyn-month" className="block text-sm font-semibold text-foreground mb-1">
                Birth month <span className="font-normal text-muted-foreground">(1–12)</span>
              </label>
              <input
                id="pyn-month"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 7"
                maxLength={2}
                value={month}
                onChange={e => setMonth(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E2238]"
                aria-label="Birth month"
              />
            </div>
            <div>
              <label htmlFor="pyn-day" className="block text-sm font-semibold text-foreground mb-1">
                Birth day <span className="font-normal text-muted-foreground">(1–31)</span>
              </label>
              <input
                id="pyn-day"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 14"
                maxLength={2}
                value={day}
                onChange={e => setDay(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E2238]"
                aria-label="Birth day"
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-600 mb-3" role="alert">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#0E2238] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a3450] transition-colors"
          >
            Calculate my personal year →
          </button>
        </form>

        {/* Result — only rendered after user submits; fixed layout prevents shift */}
        {result && (
          <div data-testid="pyn-result" className="space-y-4 mb-8">
            <YearCard result={result.currentResult} label={`This year (${result.currentYear})`} />
            <YearCard result={result.nextResult} label={`Next year (${result.nextYear})`} />
            <WorkedExample month={result.month} day={result.day} year={result.currentYear} />
            <p className="text-xs text-muted-foreground">
              These themes are symbolic prompts for reflection — not predictions. The same number means different things in different people's lives.
            </p>
          </div>
        )}

        {/* Static explanatory content — renders on first paint / prerenderable */}
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">The nine-year cycle</h2>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              In Pythagorean numerology, the personal year follows a nine-year cycle. Year 1 marks a new beginning; Year 9 closes the cycle with completion and release. Each year in between carries its own symbolic quality — from the relational patience of Year 2 to the ambitious push of Year 8. The cycle then repeats.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Unlike Life Path numbers — where master numbers (11, 22, 33) are sometimes preserved — the personal year calculation conventionally reduces all the way to 1–9. This is the standard forecasting approach and what this calculator applies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">All nine personal years at a glance</h2>
            <div className="grid gap-2">
              {([1,2,3,4,5,6,7,8,9] as const).map(n => {
                const m = getPersonalYearMeaning(n);
                return (
                  <div key={n} className="flex gap-3 items-start rounded-lg border border-border p-3">
                    <span className="text-lg font-black text-[#6E5AA6] w-6 shrink-0">{n}</span>
                    <div>
                      <span className="font-semibold text-foreground">{m.title}</span>
                      <span className="text-muted-foreground text-xs"> · </span>
                      <span className="text-sm text-muted-foreground">{m.focus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">How the calculation works</h2>
            <ol className="list-decimal pl-5 text-sm text-foreground space-y-2 leading-relaxed">
              <li>Reduce your <strong>birth month</strong> to a single digit by summing its digits (e.g. November = 11 → 1+1 = 2).</li>
              <li>Reduce your <strong>birth day</strong> to a single digit (e.g. 29 → 2+9 = 11 → 1+1 = 2).</li>
              <li>Reduce the <strong>current calendar year</strong> to a single digit (e.g. 2026 → 2+0+2+6 = 10 → 1+0 = 1).</li>
              <li>Add the three reduced numbers and reduce the total to a single digit 1–9 — that is your personal year.</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">Note: master numbers are not preserved in this calculation. The cycle uses 1–9 exclusively.</p>
          </div>

          {/* Interlinking */}
          <div className="rounded-xl border border-border p-4">
            <div className="font-semibold text-foreground mb-2">Continue exploring</div>
            <ul className="text-sm space-y-1">
              <li><Link to="/numerology" className="text-[#6E5AA6] hover:underline">Numerology overview</Link> — Life Path, Expression and other core numbers</li>
              <li><Link to="/numerology/7" className="text-[#6E5AA6] hover:underline">Life Path 7</Link> — example of a life path number reading</li>
              <li><Link to="/angel-numbers" className="text-[#6E5AA6] hover:underline">Angel Numbers</Link> — meaning of repeating sequences like 111, 222, 333</li>
              <li><Link to="/mystic-corner" className="text-[#6E5AA6] hover:underline">Mystic Corner</Link> — all symbolic tools on BornClock</li>
              <li><Link to="/how-it-works" className="text-[#6E5AA6] hover:underline">How it works</Link> — our methodology and data sources</li>
            </ul>
          </div>
        </div>

        {/* JSON-LD — FAQPage only (BreadcrumbList is emitted automatically by <SEO/>) */}
        <JsonLd
          id="faq"
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map(f => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }}
        />
      </section>
    </PajPage>
  );
}
