/**
 * Angel Numbers Hub Page (Backlog-1, Route /angel-numbers).
 *
 * An explanatory hub — no engine, no birth data, no calculation from a birthday.
 * Angel numbers are a modern spiritual/synchronicity belief based on noticing
 * repeating number sequences. This is NOT astronomy, NOT numerology-from-birth,
 * and NOT scientifically validated. Presented honestly, per Rule 6.
 */
import { Link, useNavigate } from 'react-router-dom';
import { PageFAQ } from '@/components/PageFAQ';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { ANGEL_NUMBERS } from '@/data/angelNumbers';

const TITLE = 'Angel Numbers — Meanings of 111, 222, 333 & More | BornClock';
const DESCRIPTION =
  'Angel number meanings: 111, 222, 333, 444, 777, 888, 999, 1111, 1212 and more. Honest guide — modern spiritual belief, not science, not birthday numerology.';

const FAQ_ITEMS = [
  {
    question: 'What are angel numbers?',
    answer:
      'Angel numbers are a modern spiritual belief centred on noticing repeating number sequences — such as glancing at a clock showing 11:11, seeing 222 on a receipt, or 333 on a license plate. Believers interpret these as meaningful signs or messages, often from angels, the universe, or their higher self. The idea was popularised by author Doreen Virtue in the early 2000s and has spread widely through social media. There is no scientific evidence that repeating numbers carry objective meaning — the perception of significance is a well-documented cognitive pattern called apophenia (finding patterns in random data).',
  },
  {
    question: 'What does 111 or 1111 mean?',
    answer:
      'In angel number belief, 111 and 1111 are among the most commonly cited sequences. They are traditionally associated with new beginnings, alignment with your intentions, and the idea that your thoughts are manifesting quickly — a prompt to focus on what you want rather than what you fear. Some interpret 1111 as a "portal" or moment of heightened awareness. These are symbolic associations within a spiritual tradition, not scientifically validated meanings.',
  },
  {
    question: 'Are angel numbers real or scientific?',
    answer:
      'Angel numbers are not scientifically validated. The experience of noticing repeating sequences is real — our brains are pattern-recognition machines, and when we assign significance to a number, we notice it more (the Baader-Meinhof effect / frequency illusion). Whether those sequences carry messages is a matter of personal spiritual belief, not an empirical claim. BornClock presents angel number meanings as they exist within this spiritual tradition — for reflection and curiosity, not as fact or prediction.',
  },
];

export default function AngelNumbersPage() {
  const navigate = useNavigate();

  return (
    <PajPage
      theme="mystic"
      variant="editorial"
      testId="angel-numbers-page"
      seo={(
        <SEO
          title={TITLE}
          description={DESCRIPTION}
          canonicalUrl="/angel-numbers"
          ogType="website"
        />
      )}
      breadcrumb={{
        trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }],
        current: 'Angel Numbers',
        edition: 'Modern spiritual belief · No birth data',
      }}
      footer={{
        tagline: 'Angel numbers explained honestly — a modern spiritual belief, not numerology from a birthday.',
        nav: [
          { label: 'Numerology', to: '/numerology' },
          { label: 'Personal Year Number', to: '/personal-year-number' },
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
            <span className="eyebrow">Modern spiritual belief · Synchronicity</span>
            <h1>Angel Numbers.</h1>
          </div>
          <p>
            A guide to the popular meanings behind repeating number sequences — 111, 222, 333
            and more. Angel numbers are a modern spiritual / synchronicity belief: noticing a
            sequence is the experience; what it means is a matter of personal interpretation
            within that tradition. No birth data is involved — this is not numerology from a
            birthday, not astronomy, and not scientifically validated.
          </p>
        </div>

        <TrustStrip claim="Meanings are presented as they exist within this spiritual tradition — not as facts or predictions." href="/how-it-works#numerology" />

        {/* Honest framing — first paint */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
          <strong>Important:</strong> Angel numbers are a <strong>modern spiritual belief</strong> — they are
          not scientifically validated, not derived from a birth date, and not the same as
          numerology-from-birth. The experience of noticing repeated sequences is real; the
          Baader-Meinhof effect (frequency illusion) explains why we notice patterns we have
          assigned significance to. BornClock presents the traditional meanings for curiosity
          and reflection, not as fact or prediction.
        </div>

        {/* Where this idea comes from */}
        <div className="rounded-xl border border-border p-5 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Where this idea comes from</h2>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            The term "angel numbers" was defined by the self-help author Doreen Virtue and
            Lynnette Brown in their book <em>Angel Numbers</em> (Hay House, 2005), followed by
            Virtue's <em>Angel Numbers 101</em> (2008). It draws on older number symbolism,
            including Pythagorean numerology, and frames repeating sequences as messages from angels.
          </p>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            The idea has since spread widely through social media and popular magazines. The
            11:11 wish is older still: its exact origin is unknown, but it was popularised in
            part by a New Age group founded in 1986 — years before the term "angel numbers" existed.
          </p>
          <p className="text-sm text-muted-foreground">
            It is worth noting that Doreen Virtue announced in 2017 that she had renounced her
            New Age beliefs after becoming a Christian, and in a 2024 interview said she regretted
            creating angel numbers. The idea continues independently as a popular spiritual belief.
          </p>
          {/* Sources (opened 25 Oct 2026): en.wikipedia.org/wiki/Angel_number,
              en.wikipedia.org/wiki/Doreen_Virtue, mentalfloss.com/random-facts/meaning-of-angel-number-1111 */}
        </div>

        {/* Quick navigator dropdown */}
        <div className="mb-6">
          <label htmlFor="angel-selector" className="block text-sm font-semibold text-foreground mb-2">
            What number do you keep seeing?
          </label>
          <div className="flex gap-3 items-center">
            <select
              id="angel-selector"
              defaultValue=""
              onChange={e => { if (e.target.value) navigate(`/angel-numbers/${e.target.value}`); }}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E2238] bg-white"
              aria-label="Select a number sequence to open its meaning"
            >
              <option value="">Choose a sequence…</option>
              {ANGEL_NUMBERS.map(a => (
                <option key={a.sequence} value={a.sequence}>{a.sequence} — {a.theme}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">or pick one below</span>
          </div>
        </div>

        {/* One card per number → its own page. The old #a111-style anchor ids are kept
            on the cards so links to /angel-numbers#a111 still land on the right card. */}
        <h2 className="text-lg font-bold text-foreground mb-3">Angel number meanings, one by one</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-10" data-testid="angel-grid">
          {ANGEL_NUMBERS.map(a => (
            <Link
              key={a.sequence}
              id={`a${a.sequence}`}
              to={`/angel-numbers/${a.sequence}`}
              className="rounded-xl border border-border bg-background p-5 scroll-mt-20 hover:border-[#6E5AA6] transition-colors block"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-black text-[#6E5AA6]">{a.sequence}</span>
                <span className="text-sm font-semibold text-foreground">{a.theme}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{a.answer.split('. ')[0]}.</p>
              <span className="text-xs font-semibold text-[#6E5AA6] mt-2 inline-block">Love, career, twin flame &amp; what to do →</span>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground -mt-8 mb-10">
          What people commonly associate with each sequence — paraphrased from popular sources named on each page. A symbolic interpretation within angel-number belief, not a prediction.
        </p>

        {/* Angel numbers vs numerology disambiguation */}
        <div className="rounded-xl border border-border p-5 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Angel numbers vs. numerology from a birthday</h2>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            These are different frameworks. <strong>Numerology from a birthday</strong> — like Life Path numbers
            or Personal Year numbers — involves a specific calculation from your date of birth. It produces a number
            unique to you.
          </p>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            <strong>Angel numbers</strong> are based on <em>noticing</em> sequences in the world around you — on clocks,
            receipts, license plates, and elsewhere. No calculation from your birth data is involved. The same sequence
            means the same thing for everyone who looks it up (within this framework), regardless of when they were born.
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            Both are symbolic traditions. Neither is predictive science. The distinction matters because combining them
            can mislead people into thinking there is a personalised calculation happening when there is not.
          </p>
        </div>

        {/* Interlinking */}
        <div className="rounded-xl border border-border p-4 mb-8">
          <div className="font-semibold text-foreground mb-2">Continue exploring</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/numerology" className="text-[#6E5AA6] hover:underline">Numerology overview</Link> — Life Path and other numbers calculated from your birthday</li>
            <li><Link to="/personal-year-number" className="text-[#6E5AA6] hover:underline">Personal Year Number Calculator</Link> — your nine-year cycle from birth month and day</li>
            <li><Link to="/mystic-corner" className="text-[#6E5AA6] hover:underline">Mystic Corner</Link> — all symbolic tools on BornClock</li>
            <li><Link to="/how-it-works" className="text-[#6E5AA6] hover:underline">How it works</Link> — our methodology and data sources</li>
          </ul>
        </div>
      </section>
      {/* Batch 10: FAQPage Q&As shown on the page (PageFAQ also emits the JSON-LD). */}
      <PageFAQ variant="plain" title="Common questions" items={FAQ_ITEMS} />
    </PajPage>
  );
}
