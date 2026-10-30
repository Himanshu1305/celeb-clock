/**
 * /lo-shu-grid-calculator — Lo Shu grid from a date of birth (Batch 10).
 * Method + sources: src/lib/loShuGrid.ts.
 */
import { useMemo, useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import { loShuGrid, LO_SHU_LAYOUT, missingNumberNote } from '@/lib/loShuGrid';
import { NUMBER_PLANET } from '@/lib/numerologyTools';

export const LO_SHU_PATH = '/lo-shu-grid-calculator';
export const LO_SHU_META = {
  title: 'Lo Shu Grid Calculator — Missing Numbers & Planes | BornClock',
  description: 'Make your Lo Shu grid from your date of birth: which numbers you have, which are missing, repeated numbers and the complete planes (Mind, Emotional, Practical, Thought, Will, Action).',
};

const FAQ = [
  { q: 'How is the Lo Shu grid made from a date of birth?', a: 'Write your full date of birth — day, month and year — and leave out every zero. Count how often each digit 1 to 9 appears and write it in that digit’s fixed cell of the Lo Shu square: 4 9 2 on top, 3 5 7 in the middle, 8 1 6 at the bottom. Every row, column and diagonal of that square adds up to 15.' },
  { q: 'What do missing numbers mean?', a: 'A missing number is read as a quality that does not come automatically and grows with conscious practice — a pointer, not a defect. Everyone has at least one missing number: a date has at most eight digits, and there are nine numbers.' },
  { q: 'What are the planes?', a: 'A plane is a full line of the grid. The rows are the Mind (4-9-2), Emotional (3-5-7) and Practical (8-1-6) planes; the columns are Thought (4-3-8), Will (9-5-1) and Action (2-7-6); the diagonals are 4-5-6 and 2-5-8. A complete line is read as a ready-made strength in that area.' },
  { q: 'What does a repeated number mean?', a: 'It means that digit appears more than once in your date, so its quality is emphasised. The sources we checked do not agree on separate meanings for two, three or four repeats, so we show the count rather than invent a reading.' },
  { q: 'Is the Lo Shu grid the same as my Mulank and Bhagyank?', a: 'No. Mulank (birth day number) and Bhagyank (whole-date number) reduce your date to single numbers; the Lo Shu grid keeps every digit and looks at their pattern. They are different lenses on the same date.' },
];

export default function LoShuGridPage() {
  const [dob, setDob] = useState('');
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob >= '1900-01-01';
  const r = useMemo(() => (valid ? loShuGrid(dob) : null), [dob, valid]);

  return (
    <ToolLayout
      theme="mystic"
      testId="lo-shu-page"
      seo={<SEO title={LO_SHU_META.title} description={LO_SHU_META.description}
        keywords="lo shu grid calculator, loshu grid, lo shu grid missing numbers, lo shu planes, numerology grid date of birth"
        canonicalUrl={LO_SHU_PATH} />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Numerology', to: '/numerology/' }], current: 'Lo Shu grid' }}
      footer={{ tagline: 'The Lo Shu grid, for reflection only.', nav: [{ label: 'Numerology', to: '/numerology/' }, { label: 'Kua number', to: '/kua-number-calculator/' }, { label: 'Mobile number', to: '/mobile-number-numerology/' }] }}
      eyebrow="Numerology"
      h1="Lo Shu Grid Calculator"
      lead={<>Your <TermTip id="loShuGrid">Lo Shu grid</TermTip> shows which numbers appear in your date of birth — the ones you have come naturally, the missing ones are qualities to build on purpose.</>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <label className="text-sm block">
              <span className="block text-muted-foreground mb-1">Date of birth</span>
              <input data-testid="ls-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full sm:w-auto rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
            </label>
          </div>

          {r && (
            <div data-testid="ls-result" className="mb-8">
              <p className="text-foreground mb-4" data-testid="ls-answer">
                {r.completePlanes.length
                  ? <>You have <strong>{r.completePlanes.length} complete {r.completePlanes.length === 1 ? 'line' : 'lines'}</strong> ({r.completePlanes.map(p => p.name).join(', ')}) — natural strengths to lean on. </>
                  : <>You have no complete line — usual for a short date; your strengths sit in the single numbers you have. </>}
                {r.missing.length ? <>Missing: <strong>{r.missing.join(', ')}</strong> — qualities to practise on purpose.</> : <>No number is missing.</>}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                <table className="border-collapse mx-auto sm:mx-0" data-testid="ls-grid" aria-label="Your Lo Shu grid">
                  <tbody>
                    {LO_SHU_LAYOUT.map((row, i) => (
                      <tr key={i}>
                        {row.map(n => (
                          <td key={n} data-testid={`ls-cell-${n}`} className={`w-20 h-20 text-center border-2 border-border align-middle ${r.counts[n] ? 'bg-primary/10' : 'bg-muted/30'}`}>
                            <div className={`text-2xl font-bold ${r.counts[n] ? 'text-primary' : 'text-muted-foreground/40'}`}>{r.counts[n] ? String(n).repeat(r.counts[n]) : n}</div>
                            <div className="text-[10px] text-muted-foreground">{r.counts[n] ? `×${r.counts[n]}` : 'missing'}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-sm text-muted-foreground flex-1">
                  <p className="mb-2"><strong className="text-foreground">Digits used:</strong> {r.digits.join(' ')} (zeros left out)</p>
                  {r.repeated.length > 0 && <p className="mb-2" data-testid="ls-repeated"><strong className="text-foreground">Repeated:</strong> {r.repeated.map(x => `${x.n} ×${x.count}`).join(', ')} — that number’s quality is emphasised.</p>}
                  <p>Grid order 4 9 2 / 3 5 7 / 8 1 6: every row, column and diagonal adds up to 15.</p>
                </div>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2"><TermTip id="loShuPlane">Planes</TermTip> (lines) in your grid</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" data-testid="ls-planes">
                {r.planes.map(p => (
                  <div key={p.id} className={`rounded-lg border p-3 text-sm ${p.status === 'complete' ? 'border-primary/50 bg-primary/5' : 'border-border'}`} data-testid={`ls-plane-${p.id}`}>
                    <div className="font-semibold text-foreground">{p.name} <span className="text-xs text-muted-foreground">({p.numbers.join('-')})</span></div>
                    <p className="text-muted-foreground">{p.reading}</p>
                  </div>
                ))}
              </div>

              {r.missing.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-foreground mb-2">Missing numbers — what to practise</h2>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-6 list-disc pl-5" data-testid="ls-missing">
                    {r.missing.map(n => <li key={n}>{missingNumberNote(n)}</li>)}
                  </ul>
                </>
              )}
              <p className="text-xs text-muted-foreground mb-6">Planet links (1 Sun, 2 Moon … 9 {NUMBER_PLANET[9]}) follow the same Chaldean table as our other <TermTip id="chaldean">numerology</TermTip> tools. Numerology is a symbolic tradition for reflection — not a prediction.</p>
            </div>
          )}

          <ToolFaq items={FAQ} title="Questions about the Lo Shu grid" testId="ls-faq" />
          <ToolSources testId="ls-sources" items={[
            { label: 'astromedha.in — The Lo Shu Grid', href: 'https://astromedha.in/insights/lo-shu/grid', note: 'layout, “strike out every zero”, the six planes, missing numbers as “a pointer, not a curse”' },
            { label: 'astroarunpandit.org — Lo Shu grid planes', href: 'https://astroarunpandit.org/lo-shu-grid-planes-numerology/', note: 'the 4-5-6 and 2-5-8 lines' },
          ]} />
          <p className="text-sm text-muted-foreground mb-8">More from your date: <Link to="/numerology/" className="underline">Mulank &amp; Bhagyank</Link> · <Link to="/kua-number-calculator/" className="underline">Kua number &amp; lucky directions</Link>.</p>
        </div>
      </section>
    </ToolLayout>
  );
}
