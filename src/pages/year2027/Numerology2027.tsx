/**
 * B14 — /numerology-2027: the universal year 2027 (2+0+2+7 = 11, a master number, → 2) and
 * the personal year 2027 for every number 1–9, with a calculator. Same method as
 * /personal-year-number (src/lib/personalYear.ts): reduce birth month, birth day and the
 * year to single digits, add, reduce to 1–9.
 */
import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { computePersonalYear, getPersonalYearMeaning, reduceToSingleDigit } from '@/lib/personalYear';
import { p2027, year2027Meta } from '@/lib/year2027/meta.js';
import { H2, Card, FaqList, LinkChips, YearJsonLd } from './parts';

const YEAR = 2027;
const DIGIT_SUM = String(YEAR).split('').reduce((s, d) => s + Number(d), 0); // 11
const UNIVERSAL = reduceToSingleDigit(YEAR); // 2

/** Practical 2027 outlook for each personal year (reflection prompts, not predictions). */
const OUTLOOK: Record<number, { work: string; money: string; love: string; tip: string }> = {
  1: { work: 'Start the project, course or role you have been circling — 2027 is the first year of a new nine-year cycle for you.', money: 'Set up the savings or income habit you want for the next nine years.', love: 'Say clearly what you want; independence and honesty set the tone.', tip: 'Write three goals for the cycle and take the first step on one by March.' },
  2: { work: 'Progress comes through partnership: collaborate, listen and let plans mature.', money: 'Patience pays; avoid forcing deals and keep records tidy.', love: 'A relationship year — attention to the people close to you is repaid.', tip: 'Choose one important relationship and give it regular, unhurried time.' },
  3: { work: 'Communicate: write, present, teach, network — visibility helps.', money: 'Enjoy yourself, but budget for the social spending this year invites.', love: 'Lighter and more playful; good for meeting people.', tip: 'Finish one creative thing you started rather than starting five.' },
  4: { work: 'Build systems and foundations; steady effort beats shortcuts.', money: 'Consolidate: clear debts, organise paperwork, plan long term.', love: 'Show care through reliability more than grand gestures.', tip: 'Fix one routine — sleep, exercise or finances — and keep it all year.' },
  5: { work: 'Change and movement: new roles, travel or a change of direction are common themes.', money: 'Keep a cushion; flexibility costs money.', love: 'Variety and freedom matter — talk about needs openly.', tip: 'Say yes to one genuinely new experience each quarter.' },
  6: { work: 'Responsibility grows — at work and at home; service is noticed.', money: 'Home and family spending rises; plan it.', love: 'A home-and-commitment year — good for deepening a bond.', tip: 'Balance caring for others with caring for yourself.' },
  7: { work: 'Study, research and skill-building suit 2027 better than big launches.', money: 'Be analytical; research before you commit.', love: 'Quality over quantity; quieter time together helps.', tip: 'Take one course or read deeply in one subject.' },
  8: { work: 'Ambition and results: a strong year to ask for responsibility and reward.', money: 'Financial decisions carry weight — plan, invest carefully, keep records.', love: 'Make time; work can crowd relationships out.', tip: 'Set one measurable target and review it monthly.' },
  9: { work: 'Completion: finish, hand over, and let go of what no longer fits.', money: 'Clear out and simplify before the new cycle in 2028.', love: 'Forgive, close old chapters and make room.', tip: 'Declutter one area of life each month.' },
};

export default function Numerology2027() {
  const path = p2027.numerology;
  const meta = year2027Meta(path)!;
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const m = Number(month), d = Number(day);
  const valid = m >= 1 && m <= 12 && d >= 1 && d <= 31;
  const result = valid ? computePersonalYear(m, d, YEAR) : null;
  const faq = [
    { question: 'What is the universal year number for 2027?', answer: `2 + 0 + 2 + 7 = ${DIGIT_SUM}. Eleven is a master number in Western numerology; reduced to one digit it is ${UNIVERSAL}. So 2027 is read as an 11/${UNIVERSAL} year — partnership and patience (2), with the heightened intuition and inspiration associated with 11.` },
    { question: 'How do I calculate my personal year number for 2027?', answer: `Reduce your birth month and birth day to single digits, add the universal year (${UNIVERSAL}), and reduce the total to 1–9. Example: born 13 May → 5 + (1+3=4) + ${UNIVERSAL} = ${reduceToSingleDigit(5 + 4 + UNIVERSAL)}, so 2027 is personal year ${reduceToSingleDigit(5 + 4 + UNIVERSAL)}.` },
    { question: 'Does the personal year start on 1 January or on my birthday?', answer: 'Both conventions exist. We use the calendar year (1 January), the most common method; some numerologists start it on your birthday.' },
    { question: 'Is numerology a prediction?', answer: 'No. Numerology is a symbolic tradition; the personal year themes are prompts for reflection and planning, not forecasts of events.' },
  ];
  const crumbs = [{ name: 'Numerology 2027', path }];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="numerology-2027"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png" breadcrumbItems={crumbs} articleSchema={false} />}
      breadcrumb={{ trail: [{ label: 'Numerology', to: '/numerology/' }], current: 'Numerology 2027', edition: 'Universal year 11/2' }}
      footer={{ tagline: 'Numerology for 2027 — reflection, not prediction.', nav: [{ label: 'Personal year number', to: '/personal-year-number/' }, { label: 'Numerology', to: '/numerology/' }, { label: 'Rashifal 2027', to: '/rashifal-2027/' }], note: 'Numerology is a symbolic tradition; nothing here predicts events.' }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang="en" />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Numerology 2027</span><h1 data-testid="num2027-h1">{meta.h1}</h1></div>
          <p>2 + 0 + 2 + 7 = <strong>{DIGIT_SUM}</strong>, a master number, which reduces to <strong>{UNIVERSAL}</strong>. Find your personal year for 2027 below, then read its practical outlook.</p>
        </div>

        <Card testId="num2027-calc">
          <div className="font-semibold text-brand-ink mb-2">Your personal year 2027</div>
          <form className="flex flex-wrap items-end gap-3" onSubmit={e => e.preventDefault()}>
            <label className="text-sm text-brand-ink">Birth month (1–12)
              <input aria-label="Birth month" inputMode="numeric" value={month} onChange={e => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))} className="block mt-1 w-24 rounded-lg border border-brand-line px-3 py-2 text-brand-ink bg-brand-paper" />
            </label>
            <label className="text-sm text-brand-ink">Birth day (1–31)
              <input aria-label="Birth day" inputMode="numeric" value={day} onChange={e => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))} className="block mt-1 w-24 rounded-lg border border-brand-line px-3 py-2 text-brand-ink bg-brand-paper" />
            </label>
          </form>
          {result ? (
            <p className="mt-3 text-brand-ink" data-testid="num2027-result">Your personal year in 2027 is <strong className="text-2xl">{result.number}</strong> — {getPersonalYearMeaning(result.number).title}. <a href={`#py-${result.number}`} className="underline">Read your outlook ↓</a></p>
          ) : (
            <p className="mt-3 text-sm text-brand-muted">Enter your birth month and day to see your number.</p>
          )}
        </Card>

        <H2 id="universal">What a universal year 11/2 means</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed">
          <p>In numerology every calendar year carries a collective “universal year” number. 2027 adds up to 11 — one of the master numbers in Western numerology — and reduces to 2. Two is the number of partnership, patience, diplomacy and quiet progress; 11 adds intuition, ideals and inspiration.</p>
          <p>Read practically: 2027 rewards cooperation over solo pushes, careful listening over loud debate, and steady groundwork over quick wins. Indian (Vedic) numerology reduces every number to 1–9, so there 2027 is simply a “2” year, ruled by the Moon; the Western reading keeps the 11 as well — both are shown.</p>
        </div>

        <H2 id="personal">Personal year 2027 for numbers 1 to 9</H2>
        <div className="grid md:grid-cols-2 gap-3" data-testid="num2027-years">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
            const meaning = getPersonalYearMeaning(n);
            const o = OUTLOOK[n];
            return (
              <Card key={n}>
                <h3 id={`py-${n}`} className="font-semibold text-brand-ink scroll-mt-24">Personal year {n} — {meaning.title}</h3>
                <p className="text-sm text-brand-ink mt-1">{meaning.essence}</p>
                <ul className="text-sm text-brand-ink-soft mt-2 space-y-1">
                  <li><strong className="text-brand-ink">Work:</strong> {o.work}</li>
                  <li><strong className="text-brand-ink">Money:</strong> {o.money}</li>
                  <li><strong className="text-brand-ink">Relationships:</strong> {o.love}</li>
                  <li><strong className="text-brand-ink">One practical step:</strong> {o.tip}</li>
                </ul>
              </Card>
            );
          })}
        </div>

        <H2 id="faq">Numerology 2027 — questions</H2>
        <FaqList items={faq} testId="num2027-faq" />
        <H2 id="more">More numerology</H2>
        <LinkChips items={[{ label: 'Personal year number calculator', to: '/personal-year-number/' }, { label: 'Life path number', to: '/numerology/' }, { label: 'Chinese horoscope 2027', to: '/chinese-horoscope-2027/' }, { label: 'Rashifal 2027', to: '/rashifal-2027/' }]} />
        <p className="text-sm text-brand-muted mt-4"><Link to="/editorial-policy/" className="underline">How we write about numerology →</Link></p>
      </section>
    </PajPage>
  );
}
