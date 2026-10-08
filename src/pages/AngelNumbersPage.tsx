/**
 * Angel Numbers Hub Page (Backlog-1, Route /angel-numbers).
 *
 * An explanatory hub — no engine, no birth data, no calculation from a birthday.
 * Angel numbers are a modern spiritual/synchronicity belief based on noticing
 * repeating number sequences. This is NOT astronomy, NOT numerology-from-birth,
 * and NOT scientifically validated. Presented honestly, per Rule 6.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { TrustStrip } from '@/components/paj/TrustStrip';

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

interface AngelEntry {
  sequence: string;
  id: string;
  theme: string;
  meaning: string;
}

const ANGEL_NUMBERS: AngelEntry[] = [
  {
    sequence: '000',
    id: 'a000',
    theme: 'Infinite potential / Reset',
    meaning:
      'Often associated with the concept of infinite potential or a complete reset — a moment of standing at the threshold before something new. Some traditions link it to the idea that everything is possible and no path is yet closed.',
  },
  {
    sequence: '111',
    id: 'a111',
    theme: 'New beginnings / Intentions',
    meaning:
      'One of the most widely recognised sequences. Commonly associated with alignment, new beginnings, and the idea that your intentions have power right now. Seen as a prompt to pay attention to your thoughts and what you are moving toward.',
  },
  {
    sequence: '222',
    id: 'a222',
    theme: 'Balance / Trust the process',
    meaning:
      'Associated with balance, patience, and trusting that things are unfolding as they should — even if you cannot see the outcome yet. Linked in the tradition to relationships, cooperation, and the middle path.',
  },
  {
    sequence: '333',
    id: 'a333',
    theme: 'Creativity / Expression',
    meaning:
      'Linked with creativity, self-expression, and support from whatever the believer considers a guiding force. Sometimes described as a sign that creative energy is available and should be used.',
  },
  {
    sequence: '444',
    id: 'a444',
    theme: 'Foundations / Stability',
    meaning:
      'Associated with stability, hard work, and the idea of building something solid. Often interpreted as reassurance that effort is supported and that foundations being laid now will last.',
  },
  {
    sequence: '555',
    id: 'a555',
    theme: 'Change / Movement',
    meaning:
      'One of the change-associated sequences — linked to significant transitions, movement, and the release of what no longer fits. Sometimes seen as a sign that a shift is underway or approaching.',
  },
  {
    sequence: '666',
    id: 'a666',
    theme: 'Rebalance / Inner focus',
    meaning:
      'Despite its cultural baggage in Western tradition, 666 in angel number belief is typically associated with a prompt to rebalance — to turn attention away from external noise or material worry and back toward what actually matters. It is not interpreted negatively in this framework.',
  },
  {
    sequence: '777',
    id: 'a777',
    theme: 'Spiritual depth / Reflection',
    meaning:
      'One of the most positively regarded sequences — associated with spiritual awareness, good fortune, and deep reflection. Linked to the themes of the number 7 across many traditions: study, inner wisdom, and the search for meaning.',
  },
  {
    sequence: '888',
    id: 'a888',
    theme: 'Abundance / Cycles completing',
    meaning:
      'Associated with abundance, the meeting of effort and reward, and cycles completing. The number 8 is linked with material success, karma, and return in several traditions — seeing 888 is often interpreted as a sign that what has been invested is coming back.',
  },
  {
    sequence: '999',
    id: 'a999',
    theme: 'Completion / Release',
    meaning:
      'Linked with endings, completion, and the closing of a chapter. Associated with the idea of releasing what is finished and making space for the next cycle — the angel number equivalent of a Year 9 in personal year numerology.',
  },
  {
    sequence: '1010',
    id: 'a1010',
    theme: 'New cycle / Awakening',
    meaning:
      'A mirror/clock number. Often interpreted as a sign of awakening to new possibilities — the 1 (beginnings) and 0 (infinite potential) combined and mirrored. Associated with staying present and noticing what is opening up.',
  },
  {
    sequence: '1111',
    id: 'a1111',
    theme: 'Alignment / Gateway',
    meaning:
      'Perhaps the most widely recognised angel number sequence of all, largely because 11:11 appears twice daily on digital clocks. Traditionally associated with a powerful moment of alignment, the idea that thoughts are manifesting, or a "portal" of heightened awareness. Some make a wish at 11:11 — a folk tradition that pre-dates the angel number framework.',
  },
  {
    sequence: '1212',
    id: 'a1212',
    theme: 'Positive path / Encouragement',
    meaning:
      'Associated with staying on a positive path, encouragement, and the idea that growth is happening even when it is not obvious. Linked with 12 as a complete cycle number (12 months, 12 zodiac signs) and seen as a prompt toward optimism.',
  },
];

export default function AngelNumbersPage() {
  const [selected, setSelected] = useState<string>('');

  const scrollToSequence = (id: string) => {
    setSelected(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

        <TrustStrip claim="Meanings presented as they exist within this spiritual tradition — not as facts or predictions." />

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
            The term "angel numbers" was popularised by Doreen Virtue, a self-help author who
            published <em>Angel Numbers</em> in 2005 and a series of related books throughout the
            2000s. She drew on older number symbolism — including Pythagorean numerology and
            the significance of numbers in various religious traditions — and framed repeating
            sequences as messages from angels.
          </p>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            The idea spread rapidly through social media in the 2010s, becoming one of the
            most widely shared concepts in popular spirituality. The cultural reach is
            significant: 11:11 wishes are made worldwide, and the sequences appear in art,
            music, and everyday conversation far beyond their numerological origins.
          </p>
          <p className="text-sm text-muted-foreground">
            It is worth noting that Doreen Virtue publicly distanced herself from her own
            earlier work after a religious conversion in 2017. The angel number framework
            she built continues independently as a popular spiritual tradition.
          </p>
        </div>

        {/* Quick navigator dropdown */}
        <div className="mb-6">
          <label htmlFor="angel-selector" className="block text-sm font-semibold text-foreground mb-2">
            What number do you keep seeing?
          </label>
          <div className="flex gap-3 items-center">
            <select
              id="angel-selector"
              value={selected}
              onChange={e => { if (e.target.value) scrollToSequence(e.target.value); }}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0E2238] bg-white"
              aria-label="Select a number sequence to jump to its meaning"
            >
              <option value="">Choose a sequence…</option>
              {ANGEL_NUMBERS.map(a => (
                <option key={a.id} value={a.id}>{a.sequence} — {a.theme}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">or scroll through all below</span>
          </div>
        </div>

        {/* Sequence sections — anchor-linked, deep-linkable */}
        <div className="space-y-4 mb-10">
          {ANGEL_NUMBERS.map(a => (
            <div
              key={a.id}
              id={a.id}
              className={`rounded-xl border p-5 scroll-mt-20 transition-colors ${
                selected === a.id
                  ? 'border-[#6E5AA6] bg-[#6E5AA6]/10'
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-black text-[#6E5AA6]">{a.sequence}</span>
                <span className="text-sm font-semibold text-foreground">{a.theme}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{a.meaning}</p>
              <p className="text-xs text-muted-foreground mt-2">
                What people commonly associate with this sequence — a symbolic interpretation within angel number belief, not a prediction.
              </p>
            </div>
          ))}
        </div>

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
