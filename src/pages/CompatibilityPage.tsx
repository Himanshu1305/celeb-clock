import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO, FAQSchema, WebApplicationSchema } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import PageTagline from '@/components/PageTagline';
import { getCompatibility, ZODIAC_SIGNS } from '@/data/compatibilityData';
import { useReportPrice } from '@/hooks/useCurrency';
import { SharePageBar } from '@/components/SharePageBar';
import {
  loveProse, friendshipProse, workProse, clicksAndClashes,
  dayToDayProse, frictionProse, makingItWorkProse, strengthsList, challengesList,
  aspectName, RULING_PLANET, type Sign,
} from '@/lib/compatibilityProse';

// Element × modality composition — adds pair-specific prose (beyond the curated
// description) so every one of the 78 pages carries unique, non-thin content.
const ELEMENT: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};
const MODALITY: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};
const ELEMENT_PAIR_NOTE: Record<string, string> = {
  'Air-Fire': 'and Air feeds Fire — ideas spark action, which makes this an energising, forward-moving match.',
  'Earth-Water': 'and Water softens Earth while Earth grounds Water — a naturally nurturing, stabilising pairing.',
  'Earth-Fire': 'which can grind: Fire wants to move now while Earth wants a plan, so respecting each other’s pace is essential.',
  'Fire-Water': 'the zodiac’s trickiest mix — Fire’s heat can boil Water’s depth and Water can dampen Fire’s spark, so emotional attunement matters most.',
  'Air-Water': 'mind meets emotion — Air rationalises where Water feels, so translating between logic and feeling is the ongoing work.',
  'Air-Earth': 'Air brings the ideas and Earth brings the follow-through — complementary in theory but different in speed.',
};
const MODALITY_WORD: Record<string, string> = { Cardinal: 'an initiator', Fixed: 'a stabiliser', Mutable: 'an adapter' };
const MODALITY_SAME: Record<string, string> = {
  Cardinal: 'they both like to initiate and drive things forward, so the risk is a tug-of-war over who sets the direction.',
  Fixed: 'they both value loyalty and staying power, so the risk is digging in when compromise is what’s needed.',
  Mutable: 'they both adapt easily and go with the flow, so the risk is that neither one holds the course.',
};

function elementModalityProse(s1: string, s2: string): string {
  const e1 = ELEMENT[s1], e2 = ELEMENT[s2], m1 = MODALITY[s1], m2 = MODALITY[s2];
  const elLine = e1 === e2
    ? `${s1} and ${s2} are both ${e1} signs, so they instinctively understand each other’s tempo — the challenge is adding enough contrast to stay interesting rather than amplifying the same habits.`
    : `${s1} leads with ${e1} energy and ${s2} with ${e2}, ${ELEMENT_PAIR_NOTE[[e1, e2].sort().join('-')] ?? 'and blending the two elements is the heart of the relationship.'}`;
  const modLine = m1 === m2
    ? `Both are ${m1} signs, meaning ${MODALITY_SAME[m1]}`
    : `${s1} is ${m1} (${MODALITY_WORD[m1]}) and ${s2} is ${m2} (${MODALITY_WORD[m2]}), so they naturally take on different roles — one sets things in motion, holds them steady, or adapts them, while the other supplies what’s missing.`;
  return `${elLine} ${modLine}`;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const SIGN_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const BEST_MATCHES: Record<string, string[]> = {
  Aries: ['Leo', 'Sagittarius', 'Gemini'],
  Taurus: ['Virgo', 'Capricorn', 'Cancer'],
  Gemini: ['Libra', 'Aquarius', 'Aries'],
  Cancer: ['Scorpio', 'Pisces', 'Taurus'],
  Leo: ['Aries', 'Sagittarius', 'Libra'],
  Virgo: ['Taurus', 'Capricorn', 'Scorpio'],
  Libra: ['Gemini', 'Aquarius', 'Leo'],
  Scorpio: ['Cancer', 'Pisces', 'Capricorn'],
  Sagittarius: ['Aries', 'Leo', 'Aquarius'],
  Capricorn: ['Taurus', 'Virgo', 'Pisces'],
  Aquarius: ['Gemini', 'Libra', 'Sagittarius'],
  Pisces: ['Cancer', 'Scorpio', 'Capricorn'],
};

export default function CompatibilityPage() {
  const reportPriceLabel = useReportPrice();
  const navigate = useNavigate();
  const { sign1: paramSign1, sign2: paramSign2 } = useParams<{ sign1?: string; sign2?: string }>();

  const [sign1, setSign1] = useState('');
  const [sign2, setSign2] = useState('');
  const [result, setResult] = useState<ReturnType<typeof getCompatibility> | null>(null);
  const [calcSigns, setCalcSigns] = useState<{ s1: string; s2: string } | null>(null);
  // True when the URL carries two path params but at least one is NOT a real sign
  // (e.g. /compatibility/aries/dragon) — we render an explicit not-found, never the
  // calculator shell, so a bogus slug can't masquerade as a valid page.
  const [invalidPair, setInvalidPair] = useState(false);
  const [browseSign, setBrowseSign] = useState<string>('Aries'); // P6 browse-grid picker

  useEffect(() => {
    if (paramSign1 && paramSign2) {
      const s1 = paramSign1.charAt(0).toUpperCase() + paramSign1.slice(1).toLowerCase();
      const s2 = paramSign2.charAt(0).toUpperCase() + paramSign2.slice(1).toLowerCase();
      if (ZODIAC_SIGNS.includes(s1 as typeof ZODIAC_SIGNS[number]) && ZODIAC_SIGNS.includes(s2 as typeof ZODIAC_SIGNS[number])) {
        setInvalidPair(false);
        setSign1(s1);
        setSign2(s2);
        setResult(getCompatibility(s1, s2));
        setCalcSigns({ s1, s2 });
      } else {
        setInvalidPair(true);
        setResult(null);
        setCalcSigns(null);
      }
    }
  }, [paramSign1, paramSign2]);

  // P6: selecting two signs NAVIGATES to the canonical (alphabetical) pair page rather
  // than rendering inline — so the 78 pages are reachable and never served through a redirect.
  const handleCalculate = () => {
    if (!sign1 || !sign2) return;
    const [a, b] = [sign1, sign2].map(s => s.toLowerCase()).sort();
    navigate(`/compatibility/${a}/${b}`);
  };

  const overallColor = (s: number) =>
    s >= 85 ? 'text-green-600' : s >= 70 ? 'text-blue-600' : s >= 55 ? 'text-amber-600' : 'text-orange-600';

  const overallLabel = (s: number) =>
    s >= 85 ? 'Excellent Match' : s >= 70 ? 'Good Match' : s >= 55 ? 'Moderate Match' : 'Challenging Match';

  const faqItems = [
    { question: 'Is this Western or Vedic compatibility?',
      answer: 'This calculator uses Western (sun-sign) astrology — it compares the two signs by element, modality and ruling planet. It is not Vedic compatibility: Vedic matching (Ashta Koota / Guna Milan) is a separate system based on the Moon nakshatras of both people, and it is not what this tool computes.' },
    { question: 'How does zodiac compatibility work?',
      answer: 'Zodiac compatibility is assessed by comparing the elements (Fire, Earth, Air, Water), modalities (Cardinal, Fixed, Mutable), and ruling planets of two signs. Signs sharing the same element typically have natural understanding. Complementary elements (Fire-Air, Earth-Water) often balance each other. Opposite signs (six signs apart on the wheel) can be intensely attracted while also challenging.' },
    { question: 'Can incompatible signs have great relationships?',
      answer: "Absolutely. Zodiac compatibility reflects natural tendencies and potential areas of friction — it does not determine whether a relationship succeeds. Many deeply loving partnerships exist between traditionally 'incompatible' signs. Personal growth, communication skills, shared values, and life experience matter far more than sun sign compatibility." },
    { question: 'Should I use sun sign or moon sign for compatibility?',
      answer: "Both are valuable but reveal different things. Sun sign compatibility shows how your core identities and life purposes align. Moon sign compatibility shows how your emotional worlds resonate — often considered more important for long-term intimate relationships. For the deepest reading, a full synastry chart comparing all planetary positions is used." },
    { question: 'Which zodiac sign is the best match overall?',
      answer: "There is no single 'best match' for everyone. Each sign has multiple highly compatible partners. Generally, same-element signs share natural understanding, and complementary-element signs provide enriching balance. The key is understanding your own needs and communicating them clearly to any partner." },
  ];

  const seoTitle = calcSigns
    ? `${calcSigns.s1} and ${calcSigns.s2} Compatibility — ${getCompatibility(calcSigns.s1, calcSigns.s2).overall}% Match | BornClock`
    : 'Western Zodiac Compatibility Calculator — How Compatible Are You? | BornClock';

  // Canonical = the alphabetical pair (both URL orders point to one page), so
  // aries/leo and leo/aries don't compete as duplicate content.
  const canonicalUrl = calcSigns
    ? `/compatibility/${[calcSigns.s1, calcSigns.s2].map(s => s.toLowerCase()).sort().join('/')}`
    : '/compatibility';

  // Invalid pairing (bogus sign in the URL) → explicit not-found content, not the SPA
  // calculator shell. Distinct <title> + noindex so search engines don't index junk URLs.
  if (invalidPair) {
    return (
      <div className="min-h-screen bg-white">
        <SEO
          title="Zodiac pairing not found | BornClock"
          description="That is not a valid zodiac pairing. Pick two of the twelve zodiac signs to see their compatibility."
          canonicalUrl="/compatibility"
          noindex
        />
        <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Navigation />
            <AuthNav />
          </div>
        </div>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-6xl mb-4">🔭</p>
          <h1 className="text-3xl font-black text-gray-900 mb-3">That zodiac pairing doesn’t exist</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            “{paramSign1}” and “{paramSign2}” aren’t both zodiac signs. Compatibility is calculated between two of
            the twelve signs — Aries through Pisces. Head back to the calculator and pick a real pair.
          </p>
          <Link to="/compatibility" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors">
            Open the Compatibility Calculator →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={seoTitle}
        description={calcSigns
          ? `${calcSigns.s1} and ${calcSigns.s2} compatibility (Western zodiac): their love, friendship and work match with pair-specific strengths, challenges and advice — element, modality and ruling-planet reasoning.`
          : "Calculate zodiac compatibility for any two signs. Free love, friendship, and work compatibility calculator for all 144 sign combinations."}
        keywords="zodiac compatibility, are aries and leo compatible, horoscope compatibility, birthday compatibility calculator, love compatibility zodiac"
        canonicalUrl={canonicalUrl}
      />
      <WebApplicationSchema
        name="Zodiac Compatibility Calculator"
        description="Free zodiac compatibility calculator for all 144 sign combinations — love, friendship, and work compatibility across every pairing."
        url="/compatibility"
      />
      <FAQSchema items={faqItems} />

      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Navigation />
            <AuthNav />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-10">

          <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <span className="text-gray-600">Compatibility Calculator</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Zodiac Compatibility Calculator <span className="text-lg font-semibold text-gray-500">(Western Zodiac)</span></h1>
          <PageTagline />

          <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-5 mb-4">
            <p className="text-base font-semibold text-rose-900 leading-relaxed">
              Zodiac compatibility is assessed by comparing elements, modalities, and planetary energies. Select two signs to see how they align in love, friendship, and work — with full descriptions of strengths, challenges, and practical advice.
            </p>
          </div>
          {/* Western vs Vedic clarifier (shown on the calculator and every pair page) */}
          <p className="text-xs text-gray-500 leading-relaxed mb-8">
            This uses the <strong>Western</strong> sun-sign tradition (element &amp; modality). Vedic matching
            (Ashta Koota / Guna Milan) is a different system based on Moon nakshatras and is not what this
            calculator computes.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">Select two zodiac signs</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{ value: sign1, setter: setSign1, label: 'Sign 1' }, { value: sign2, setter: setSign2, label: 'Sign 2' }].map(({ value, setter, label }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <select
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Choose sign...</option>
                    {ZODIAC_SIGNS.map(s => (
                      <option key={s} value={s}>{SIGN_EMOJIS[s]} {s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={handleCalculate}
              disabled={!sign1 || !sign2}
              className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              Check Compatibility →
            </button>
          </div>

          {result && calcSigns && (
            <div className="mb-10">
              {/* Concise answer block (AEO) */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Are {calcSigns.s1} and {calcSigns.s2} compatible?</h2>
              <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-5 mb-6">
                <p className="text-base font-medium text-gray-900 leading-relaxed">
                  {calcSigns.s1} and {calcSigns.s2} score {result.overall}% overall — {overallLabel(result.overall).toLowerCase()} — with {result.love}% for love, {result.friendship}% for friendship and {result.work}% at work. {result.strengths.filter(Boolean)[0]}.
                </p>
              </div>

              {/* Clicks & Clashes — fast scannable verdict (element/aspect/modality/polarity) */}
              {(() => {
                const cc = clicksAndClashes(calcSigns.s1 as Sign, calcSigns.s2 as Sign);
                return (
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-green-700 mb-1">✨ Where you click</p>
                      <p className="text-sm text-green-900 leading-relaxed">{cc.click}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-amber-700 mb-1">⚡ Where you clash</p>
                      <p className="text-sm text-amber-900 leading-relaxed">{cc.clash}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 text-white text-center mb-6">
                <div className="flex justify-center items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-5xl mb-1">{SIGN_EMOJIS[calcSigns.s1]}</div>
                    <p className="font-bold">{calcSigns.s1}</p>
                  </div>
                  <div className="text-3xl">💕</div>
                  <div className="text-center">
                    <div className="text-5xl mb-1">{SIGN_EMOJIS[calcSigns.s2]}</div>
                    <p className="font-bold">{calcSigns.s2}</p>
                  </div>
                </div>
                <div className={`text-7xl font-black mb-2 ${overallColor(result.overall).replace('text-', 'text-white')} text-white`}>{result.overall}%</div>
                <p className="text-xl font-bold text-white">{overallLabel(result.overall)}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                <ScoreBar label="❤️ Love & Romance" score={result.love} color="bg-rose-400" />
                <ScoreBar label="🤝 Friendship" score={result.friendship} color="bg-blue-400" />
                <ScoreBar label="💼 Work & Collaboration" score={result.work} color="bg-amber-400" />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{result.description}</p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-700 mb-2">✓ Strengths</p>
                    <ul className="space-y-1">
                      {result.strengths.filter(Boolean).map(s => (
                        <li key={s} className="text-xs text-green-800">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 mb-2">⚠ Challenges</p>
                    <ul className="space-y-1">
                      {result.challenges.filter(Boolean).map(c => (
                        <li key={c} className="text-xs text-amber-800">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-blue-700 mb-1">💡 Relationship Advice</p>
                  <p className="text-sm text-blue-900">{result.advice}</p>
                </div>

                {/* Composed element × modality prose — pair-specific, non-thin */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {elementModalityProse(calcSigns.s1, calcSigns.s2)}
                </p>

                {/* Links to both zodiac hubs (Phase 3 requirement) */}
                <div className="flex flex-wrap gap-2">
                  <Link to={`/zodiac/${calcSigns.s1.toLowerCase()}`} className="text-sm text-indigo-600 hover:underline">Full {calcSigns.s1} guide →</Link>
                  <span className="text-gray-300">·</span>
                  <Link to={`/zodiac/${calcSigns.s2.toLowerCase()}`} className="text-sm text-indigo-600 hover:underline">Full {calcSigns.s2} guide →</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/compatibility" className="text-sm text-indigo-600 hover:underline">Check another pair →</Link>
                </div>
              </div>

              {/* Composed, pair-specific long-form — Love (planets) · Friendship (element+aspect) · Work (modality) */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{calcSigns.s1} &amp; {calcSigns.s2}: the full reading</h2>
                <p className="text-xs text-gray-400 mb-5">
                  {calcSigns.s1} is ruled by {RULING_PLANET[calcSigns.s1 as Sign]}, {calcSigns.s2} by {RULING_PLANET[calcSigns.s2 as Sign]} — and on the zodiac wheel they form a {aspectName(calcSigns.s1 as Sign, calcSigns.s2 as Sign)}.
                </p>

                <h3 className="text-base font-bold text-rose-700 mb-1">❤️ How {calcSigns.s1} and {calcSigns.s2} do love</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{loveProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign)}</p>

                <h3 className="text-base font-bold text-blue-700 mb-1">🤝 As friends</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{friendshipProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign)}</p>

                <h3 className="text-base font-bold text-amber-700 mb-1">💼 Working together</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{workProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign)}</p>

                <h3 className="text-base font-bold text-gray-900 mb-1">🏠 How {calcSigns.s1} and {calcSigns.s2} work day-to-day</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{dayToDayProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign)}</p>

                <h3 className="text-base font-bold text-gray-900 mb-1">⚠️ Where it gets hard</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{frictionProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign)}</p>

                <h3 className="text-base font-bold text-gray-900 mb-2">✅ Making it work</h3>
                <ul className="space-y-2 mb-5">
                  {makingItWorkProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign).map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2"><span className="text-green-600 shrink-0">→</span><span>{tip}</span></li>
                  ))}
                </ul>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-700 mb-2">Strengths of a {calcSigns.s1}–{calcSigns.s2} match</p>
                    <ul className="space-y-1">
                      {strengthsList(calcSigns.s1 as Sign, calcSigns.s2 as Sign).map(s => (
                        <li key={s} className="text-xs text-green-800">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 mb-2">Challenges to watch</p>
                    <ul className="space-y-1">
                      {challengesList(calcSigns.s1 as Sign, calcSigns.s2 as Sign).map(c => (
                        <li key={c} className="text-xs text-amber-800">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <SharePageBar
                path={`/compatibility/${[calcSigns.s1, calcSigns.s2].map(s => s.toLowerCase()).sort().join('/')}`}
                title={`${calcSigns.s1} & ${calcSigns.s2} Compatibility`}
                text={`${calcSigns.s1} & ${calcSigns.s2} are a ${result.overall}% match — see the love, friendship & work breakdown`}
                className="mb-6"
              />

              {/* Pair-specific FAQ (visible accordion + in-body FAQPage JSON-LD) */}
              <PageFAQ
                title={`${calcSigns.s1} & ${calcSigns.s2} — Compatibility FAQ`}
                items={[
                  { question: `Are ${calcSigns.s1} and ${calcSigns.s2} compatible?`, answer: `${calcSigns.s1} and ${calcSigns.s2} have an overall compatibility of ${result.overall}% (${overallLabel(result.overall).toLowerCase()}). ${result.description}` },
                  { question: `Is ${calcSigns.s1} and ${calcSigns.s2} a good marriage match?`, answer: `For the long haul, ${calcSigns.s1} and ${calcSigns.s2} do best when they respect the differences the daily rhythm surfaces. ${dayToDayProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign)} In the Western sun-sign tradition this is a starting point, not a verdict — a full birth-chart comparison refines it, and shared values and communication matter more than sun signs alone.` },
                  { question: `Are ${calcSigns.s1} and ${calcSigns.s2} compatible as friends?`, answer: friendshipProse(calcSigns.s1 as Sign, calcSigns.s2 as Sign) },
                  { question: `What are the strengths and challenges of a ${calcSigns.s1}–${calcSigns.s2} relationship?`, answer: `Strengths: ${strengthsList(calcSigns.s1 as Sign, calcSigns.s2 as Sign).join('; ')}. Challenges: ${challengesList(calcSigns.s1 as Sign, calcSigns.s2 as Sign).join('; ')}.` },
                  { question: `Is ${calcSigns.s1} and ${calcSigns.s2} compatibility Western or Vedic?`, answer: `This is Western (sun-sign) compatibility — ${calcSigns.s1} and ${calcSigns.s2} compared by element, modality and ruling planet as a cultural lens, never a prediction. Vedic matching (Ashta Koota / Guna Milan) uses Moon nakshatras instead and is a different system.` },
                ]}
              />

              {/* Contextual mesh — link every other pairing for both signs (canonical order),
                  so no pair page is an orphan and each is ≤2 clicks from the hub. */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                {(calcSigns.s1 === calcSigns.s2
                  ? [[calcSigns.s1, calcSigns.s2]]
                  : [[calcSigns.s1, calcSigns.s2], [calcSigns.s2, calcSigns.s1]]
                ).map(([sign, partner]) => (
                  <div key={sign} className="mb-4 last:mb-0">
                    <p className="text-sm font-bold text-gray-900 mb-2">More {sign} pairings</p>
                    <div className="flex flex-wrap gap-2">
                      {/* All pairings for this sign EXCEPT the current partner — includes the
                          same-sign pairing so those pages aren't orphaned. */}
                      {ZODIAC_SIGNS.filter(o => o !== partner).map(other => (
                        <Link
                          key={other}
                          to={`/compatibility/${[sign, other].map(s => s.toLowerCase()).sort().join('/')}`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          {SIGN_EMOJIS[other]} {sign} & {other}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-rose-600 rounded-2xl p-6 text-center text-white">
                <p className="text-lg font-bold mb-1">See your compatibility profile in your Birthday Report</p>
                <p className="text-rose-200 text-sm mb-4">Your top compatible signs + moon sign + tarot card + name numerology + more.</p>
                <Link to="/birthday-report" className="inline-block bg-white text-rose-600 px-8 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-colors">
                  Generate My Report → {reportPriceLabel}
                </Link>
              </div>
            </div>
          )}

          {/* P6 — BROWSE GRID (hub only): pick a sign → its 12 canonical pairings, plus a
              full A-Z index of all 78 pairs (static links for crawl + browsing). */}
          {!calcSigns && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse compatibility by sign</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {ZODIAC_SIGNS.map(s => (
                  <button
                    key={s}
                    onClick={() => setBrowseSign(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${browseSign === s ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300'}`}
                  >
                    {SIGN_EMOJIS[s]} {s}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-10">
                {ZODIAC_SIGNS.map(other => (
                  <Link
                    key={other}
                    to={`/compatibility/${[browseSign, other].map(s => s.toLowerCase()).sort().join('/')}`}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    {SIGN_EMOJIS[browseSign]} {browseSign} & {other} {SIGN_EMOJIS[other]}
                  </Link>
                ))}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3">All 78 zodiac pairings (A–Z)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                {ZODIAC_SIGNS.flatMap((a, i) =>
                  ZODIAC_SIGNS.slice(i).map(b => {
                    const [ca, cb] = [a, b].map(s => s.toLowerCase()).sort(); // canonical (alphabetical) order
                    return (
                      <Link
                        key={`${a}-${b}`}
                        to={`/compatibility/${ca}/${cb}`}
                        className="text-xs text-indigo-600 hover:underline py-0.5"
                      >
                        {a} & {b}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Matches for Every Sign</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ZODIAC_SIGNS.map(sign => (
                <div key={sign} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{SIGN_EMOJIS[sign]}</span>
                    <span className="font-bold text-gray-900 text-sm">{sign}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {(BEST_MATCHES[sign] || []).map(match => (
                      // Link to the CANONICAL (alphabetical) pair URL, never the reverse order —
                      // the Worker 301s reverse pairs, and internal links must point at final targets.
                      <Link key={match} to={`/compatibility/${[sign, match].map(s => s.toLowerCase()).sort().join('/')}`}
                        className="text-xs text-indigo-600 hover:underline">
                        {SIGN_EMOJIS[match]} {match}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How Element Compatibility Works</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: '🔥 Fire + Air', score: '83%', desc: 'Air feeds fire — ideas ignite action. Natural synergy between Fire (Aries, Leo, Sagittarius) and Air (Gemini, Libra, Aquarius) signs.' },
                { title: '🌊 Water + Earth', score: '82%', desc: 'Earth holds water — structure and feeling complement each other. Water (Cancer, Scorpio, Pisces) and Earth (Taurus, Virgo, Capricorn) often thrive together.' },
                { title: '🔥 Fire + Fire', score: '82%', desc: 'Mutual passion and understanding. Both speak the same language — challenge is channelling all that energy without competing.' },
                { title: '🌊 Water + Water', score: '85%', desc: 'Deep emotional resonance. The most intuitive pairings in the zodiac — danger is becoming too insular or emotionally intense.' },
                { title: '🔥 Fire + Water', score: '58%', desc: 'The most challenging combination — fire and water instinctively dampen or scorch each other. Requires significant conscious effort and genuine mutual respect.' },
                { title: '🌍 Air + Earth', score: '60%', desc: 'Ideas meet practicality — can be complementary but often frustrating. Air moves fast; Earth moves methodically. Requires patience from both.' },
              ].map(({ title, score, desc }) => (
                <div key={title} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 text-sm">{title}</span>
                    <span className="text-sm font-bold text-gray-500">{score}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map(({ question, answer }) => (
                <div key={question} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">{question}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { text: 'Western Zodiac', href: '/zodiac' },
                { text: 'Vedic Zodiac', href: '/vedic-zodiac' },
                { text: 'Moon Sign Calculator', href: '/moon-sign' },
                { text: 'Tarot by Birthday', href: '/tarot-card-by-birthday' },
                { text: 'Numerology Calculator', href: '/numerology' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-sm text-gray-700 hover:text-rose-700 transition-colors">
                  → {item.text}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8 mb-4">
            Last reviewed: August 2026 · Sources verified by BornClock Editorial Team
          </p>

        </div>
      </div>
    </>
  );
}
