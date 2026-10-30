import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { chaldeanName, pythagoreanName, CHALDEAN_LETTER_TABLE } from '@/lib/numerologyExtra';
import { COMPOUND_MEANINGS, CHEIRO_COMPOUND_MAX, compoundReading } from '@/lib/numerologyTools';
import { TermTip } from '@/components/vedic/TermTip';

/**
 * Batch 9 — /chaldean-numerology is now the Chaldean CHART explainer (letter table and
 * how compound numbers work). The calculator lives on /name-numerology, so the two
 * pages no longer compete for the same search (and can no longer disagree: both call
 * chaldeanName() / pythagoreanName() in src/lib/numerologyExtra.ts).
 */

// Worked examples are computed live from the shared functions, never typed by hand.
const SRK = chaldeanName('Shah Rukh Khan');
const SRK_PARTS = ['Shah', 'Rukh', 'Khan'].map(w => ({ w, r: chaldeanName(w) }));
const SRK_PY = pythagoreanName('Shah Rukh Khan');
const HIGH_EXAMPLE = compoundReading(61);

export default function ChaldeanNumerologyPage() {
  const faqItems = [
    { question: 'What is the Chaldean numerology chart?', answer: 'It is the letter-to-number table of the Chaldean system: A, I, J, Q, Y = 1; B, K, R = 2; C, G, L, S = 3; D, M, T = 4; E, H, N, X = 5; U, V, W = 6; O, Z = 7; F, P = 8. No letter is given 9. It is the chart most Indian numerologists use for name numbers.' },
    { question: 'How is Chaldean different from Pythagorean?', answer: 'Pythagorean numbers the alphabet in order (A=1 … I=9, then J=1 again). Chaldean assigns 1–8 by the sound of the letter and never uses 9 for a letter. The two usually give different totals for the same name — for Shah Rukh Khan, Chaldean gives ' + SRK.total + ' and Pythagorean gives ' + SRK_PY.total + '.' },
    { question: 'What is a compound number?', answer: 'The total of the letter values before you reduce it to one digit. In Cheiro\'s "Book of Numbers" (1926) each compound from 10 to 52 has its own traditional meaning, separate from the single digit it reduces to.' },
    { question: 'What happens if my name total is above 52?', answer: 'Cheiro\'s list stops at 52. Inside that list he gives many numbers "the same meaning as" the number 9 below them in the same series (33 = 24, 42 = 24, 48 = 30). For a higher total we apply that same series rule — subtract 9 until the number is 52 or less — and label the result as an extension of his method, not a meaning he wrote.' },
    { question: 'Is numerology scientific?', answer: 'No — it is a symbolic tradition, not a science. Treat the result as a prompt for reflection, not a fact about you or a basis for important decisions.' },
  ];

  const compounds = Object.entries(COMPOUND_MEANINGS).map(([n, m]) => ({ n: Number(n), ...m })).sort((a, b) => a.n - b.n);

  return (
    <ToolLayout
      theme="mystic"
      testId="chaldean-page"
      seo={<SEO
        title="Chaldean Numerology Chart — Letters & Compound Numbers | BornClock"
        description="The Chaldean numerology chart explained: letter values 1–8, how to add a name, and what the compound numbers 10–52 mean in Cheiro's tradition. Free calculator linked."
        keywords="chaldean numerology chart, chaldean letter values, chaldean compound numbers, cheiro compound number meanings"
        canonicalUrl="/chaldean-numerology"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Numerology', to: '/numerology/' }], current: 'Chaldean Numerology Chart' }}
      footer={{ tagline: 'The Chaldean letter chart and Cheiro\'s compound numbers, explained.', nav: [{ label: 'Numerology', to: '/numerology/' }, { label: 'Name numerology calculator', to: '/name-numerology/' }, { label: 'Name correction', to: '/name-correction/' }] }}
      eyebrow="Numerology"
      h1="Chaldean Numerology Chart — Letter Values & Compound Numbers"
      lead="How the Chaldean system turns letters into numbers, how a name total becomes a compound and a single name number, and what Cheiro's compound numbers mean. To work out your own, use the name calculator."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-8 text-center">
            <p className="text-foreground mb-3">Want your own number? The calculator does the adding for you.</p>
            <Link to="/name-numerology/" data-testid="chaldean-cta" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Name number calculator →</Link>
          </div>

          <div className="rounded-xl border border-border p-4 mb-8" data-testid="chaldean-table">
            <h2 className="font-semibold text-foreground mb-2">The <TermTip id="chaldean">Chaldean</TermTip> letter chart</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {CHALDEAN_LETTER_TABLE.map(row => (
                <div key={row.value} className="rounded-lg border border-border px-3 py-2">
                  <div className="font-semibold text-primary">{row.value}</div>
                  <div className="text-muted-foreground">{row.letters}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">No letter is ever given 9 — in the tradition 9 stands apart. The same chart is used by Indian name-number calculators (e.g. astromedha.in and astrosight.ai list exactly these values).</p>
          </div>

          <div className="rounded-xl border border-border p-4 mb-8" data-testid="chaldean-example">
            <h2 className="font-semibold text-foreground mb-2">Worked example: Shah Rukh Khan</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              {SRK_PARTS.map(({ w, r }) => (
                <li key={w}><strong className="text-foreground">{w.toUpperCase()}</strong>: {r.letters.map(l => `${l.ch.toUpperCase()}=${l.value}`).join(' + ')} = {r.total}</li>
              ))}
            </ul>
            <p className="text-sm text-foreground mt-2">
              Total {SRK_PARTS.map(p => p.r.total).join(' + ')} = <strong>{SRK.total}</strong> (the <TermTip id="compoundNumber">compound number</TermTip>) → {String(SRK.total).split('').join(' + ')} = <strong>{SRK.root}</strong> (the name number).
            </p>
          </div>

          <div className="rounded-xl border border-border p-4 mb-8">
            <h2 className="font-semibold text-foreground mb-2">How compound numbers work</h2>
            <p className="text-sm text-muted-foreground mb-2">
              The single name number (1–9) gives the broad nature; the compound — the full total before reducing — adds a finer, traditional meaning. Cheiro's "Book of Numbers" (1926) lists meanings for every compound from 10 to {CHEIRO_COMPOUND_MAX}. Many of them carry "the same meaning as" the number 9 below in the same series — 33 reads like 24, 42 like 24, 48 like 30.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Two Indian conventions sit alongside: the name number is always reduced to 1–9 (so a total of 33 gives 6), and where a total passes through 11, 22 or 33 the Western convention calls that a master number. BornClock shows both, each labelled.
            </p>
            {HIGH_EXAMPLE && (
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Totals above {CHEIRO_COMPOUND_MAX}:</strong> Cheiro's list stops at {CHEIRO_COMPOUND_MAX}. We apply his same-series rule (subtract 9 until the number is {CHEIRO_COMPOUND_MAX} or less) and say so: a total of {HIGH_EXAMPLE.total} is read as {HIGH_EXAMPLE.lookup}. This is an extension of his method, not a meaning he wrote for {HIGH_EXAMPLE.total}; the single name number does not change.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border p-4 mb-8" data-testid="compound-list">
            <h2 className="font-semibold text-foreground mb-3">Compound numbers 10–{CHEIRO_COMPOUND_MAX} (Cheiro, paraphrased)</h2>
            <div className="space-y-2">
              {compounds.map(c => (
                <div key={c.n} className="text-sm">
                  <span className="font-semibold text-foreground">{c.n} — {c.name}.</span>{' '}
                  <span className="text-muted-foreground">{c.text}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Source: Cheiro, "Cheiro's Book of Numbers" (London: Herbert Jenkins, 1926), chapter on the compound numbers. Paraphrased in plain language; cautionary wording is given as care, not prediction.</p>
          </div>

          <PageFAQ items={faqItems} />

          <div className="grid sm:grid-cols-2 gap-3 text-sm mt-6">
            <Link to="/name-numerology/" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Name number calculator (Chaldean + Western)</Link>
            <Link to="/name-correction/" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Compare spelling variants (name correction)</Link>
            <Link to="/numerology/" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Mulank & Bhagyank calculator</Link>
            <Link to="/business-name-numerology/" className="rounded-lg border border-border px-3 py-2 hover:border-primary">Business name numerology</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
