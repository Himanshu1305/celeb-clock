import React, { useState, type CSSProperties } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { DobInput, toISODate } from '@/components/DobInput';
import { SavedDateOffer } from '@/components/SavedDateOffer';
import { SEO, FAQSchema, WebApplicationSchema } from '@/components/SEO';
import { getTarotBirthCards, MAJOR_ARCANA, type TarotCard } from '@/data/tarotData';
import { useReportPrice } from '@/hooks/useCurrency';
import { describeBirthCardWorking } from '@/lib/tarot/birthCard';
import { TermTip } from '@/components/vedic/TermTip';
import { TAROT_CARDS, tarotCardPath } from '@/data/tarotCards';
import { ui } from '../theme/palette';

// Batch 7 / W5: link a Major Arcana birth card to its full meaning page.
const cardPageFor = (name: string) => {
  const c = TAROT_CARDS.find(t => t.arcana === 'major' && t.name === name);
  return c ? tarotCardPath(c.slug) : '/tarot/cards';
};

type TabKey = 'meaning' | 'love' | 'career' | 'health' | 'spirituality';

// Card back design — mystical purple/indigo pattern
const CardBack = () => (
  <div
    className="w-full h-full flex items-center justify-center relative overflow-hidden"
    style={{ background: `linear-gradient(135deg, ${ui.indigo950} 0%, ${ui.indigo900} 50%, ${ui.indigo950} 100%)` }}
  >
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 8px,
          rgba(255,255,255,0.1) 8px,
          rgba(255,255,255,0.1) 9px
        )`,
      }}
    />
    <div className="relative z-10 text-center">
      <div className="text-3xl mb-1">✦</div>
      <div className="text-xs text-brand-purple-light font-medium tracking-widest uppercase">BornClock</div>
    </div>
    <div className="absolute top-2 left-2 text-brand-purple-light text-xs">✦</div>
    <div className="absolute top-2 right-2 text-brand-purple-light text-xs">✦</div>
    <div className="absolute bottom-2 left-2 text-brand-purple-light text-xs">✦</div>
    <div className="absolute bottom-2 right-2 text-brand-purple-light text-xs">✦</div>
    <div className="absolute inset-0 tarot-card-shimmer" />
  </div>
);

// Card front — revealed Major Arcana
const CardFront = ({ card }: { card: TarotCard }) => (
  <div
    className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
    style={{ background: `linear-gradient(135deg, ${ui.tarotNight1} 0%, ${ui.tarotNight2} 50%, ${ui.tarotNight3} 100%)` }}
  >
    <p className="text-xs text-brand-purple-light mb-1 tracking-wider">Card {card.number}</p>
    <div className="text-4xl mb-2">{card.emoji}</div>
    <p className="text-white font-black text-sm leading-tight">{card.name}</p>
    <div className="w-8 h-px bg-brand-navy my-2" />
    <div className="flex flex-wrap justify-center gap-1">
      {card.keywords.slice(0, 2).map(kw => (
        <span key={kw} className="text-brand-purple-light text-xs">{kw}</span>
      ))}
    </div>
  </div>
);

interface InteractiveTarotDrawProps {
  onCardDrawn: (card: TarotCard) => void;
  drawnCard: TarotCard | null;
}

function InteractiveTarotDraw({ onCardDrawn, drawnCard }: InteractiveTarotDrawProps) {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [assignedCards] = useState<TarotCard[]>(() => {
    const allCards = Object.values(MAJOR_ARCANA);
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleCardClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (flippedIndex !== null || isDrawing) return;

    setIsDrawing(true);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newStars = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + Math.random() * rect.width,
      y: rect.top + Math.random() * rect.height,
    }));
    setStars(newStars);
    setTimeout(() => setStars([]), 1000);

    setTimeout(() => {
      setFlippedIndex(index);
      onCardDrawn(assignedCards[index]);
      setIsDrawing(false);
    }, 200);
  };

  const getCardStyle = (index: number, total: number): CSSProperties => {
    const spreadAngle = 60;
    const startAngle = -spreadAngle / 2;
    const angleStep = spreadAngle / (total - 1);
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    const radius = 280;
    const x = Math.sin(radian) * radius * 0.4;
    const y = -Math.cos(radian) * radius * 0.08 + 20;

    return {
      position: 'absolute',
      transform: `translateX(${x}px) translateY(${y}px) rotate(${angle}deg)`,
      transformOrigin: 'bottom center',
      transition: 'all 0.3s ease',
      left: '50%',
      marginLeft: '-36px',
      bottom: '0',
      width: '72px',
      height: '110px',
      zIndex: index,
    };
  };

  if (drawnCard) {
    return (
      <div className="text-center py-4">
        <div
          className="inline-block w-32 h-48 rounded-xl overflow-hidden shadow-2xl mx-auto"
          style={{ background: `linear-gradient(135deg, ${ui.tarotNight1} 0%, ${ui.tarotNight2} 50%, ${ui.tarotNight3} 100%)` }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-brand-purple-light mb-2 tracking-wider">Card {drawnCard.number}</p>
            <div className="text-5xl mb-3">{drawnCard.emoji}</div>
            <p className="text-white font-black text-base leading-tight">{drawnCard.name}</p>
            <div className="w-10 h-px bg-brand-navy my-2" />
            <div className="flex flex-wrap justify-center gap-1">
              {drawnCard.keywords.slice(0, 2).map(kw => (
                <span key={kw} className="text-brand-purple-light text-xs">{kw}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-brand-purple-light font-medium mt-3 italic">
          You drew {drawnCard.name} ✨
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-gray-600 hover:text-gray-600 underline"
        >
          Draw again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {stars.map(star => (
        <div
          key={star.id}
          className="star-particle fixed text-yellow-400 text-lg"
          style={{ left: star.x, top: star.y }}
        >
          ✦
        </div>
      ))}

      <p className="text-center text-sm text-gray-500 mb-6 italic">
        {isDrawing
          ? 'Revealing your card...'
          : 'Hover over the cards and choose one — trust your instinct'}
      </p>

      <div
        className="relative mx-auto"
        style={{ height: '160px', width: '100%', maxWidth: '400px' }}
      >
        {assignedCards.map((card, index) => (
          <div
            key={index}
            className={`tarot-card-container ${flippedIndex === index ? 'flipped' : ''}`}
            style={getCardStyle(index, assignedCards.length)}
            onClick={e => handleCardClick(index, e)}
          >
            <div className="tarot-card-inner w-full h-full">
              <div className="tarot-card-front w-full h-full">
                <CardBack />
              </div>
              <div className="tarot-card-back w-full h-full">
                <CardFront card={card} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 mt-4">
        Each card is unique — no two draws are the same
      </p>
    </div>
  );
}

export default function TarotByBirthday() {
  const reportPriceLabel = useReportPrice();
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [dob, setDob] = useState('');
  const [birthdayResult, setBirthdayResult] = useState<{
    /** Audit N7: Mary K. Greer birth card — first card, then its pair (19 → 10 → 1; 22 → 0 + 4). */
    card: TarotCard;
    pair: TarotCard[];
    working: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('meaning');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCalculate = () => {
    if (!dob) return;
    const [year, month, day] = dob.split('-').map(Number);
    const r = getTarotBirthCards(day, month, year);
    setBirthdayResult({
      card: r.cards[0],
      pair: r.cards.slice(1),
      working: describeBirthCardWorking(day, month, year),
    });
  };

  const getCombinationReading = (drawn: TarotCard, birthday: TarotCard): string => {
    if (drawn.name === birthday.name) {
      return `Remarkable — you drew your own birthday card. The universe is confirming your path with unusual clarity. ${birthday.name} appears twice in your reading, amplifying its message: ${birthday.keywords.slice(0, 3).join(', ')}.`;
    }
    return `Your drawn card (${drawn.name}) and your birthday card (${birthday.name}) together suggest a tension between ${drawn.keywords[0]} and ${birthday.keywords[0]}. The ${drawn.name} represents what you're reaching toward right now; ${birthday.name} represents your deeper, permanent nature. When these energies align, you become someone who ${drawn.keywords[1] || 'transforms'} through the lens of ${birthday.keywords[1] || 'wisdom'}.`;
  };

  const faqItems = [
    {
      question: 'How is my tarot card determined by birthday?',
      answer:
        "BornClock uses the standard tarot birth card method popularised by Mary K. Greer: add your birth month, day and full year as numbers (for 31 August 1996: 8 + 31 + 1996 = 2035), then add the digits of the total until you reach 22 or less (2 + 0 + 3 + 5 = 10). That number is your birth card (10 = Wheel of Fortune). Reduce it once more for its paired card (1 + 0 = 1, The Magician). A total of 22 is The Fool, paired with The Emperor (4); 19 gives three cards (The Sun, Wheel of Fortune and The Magician).",
    },
    {
      question: 'What are the Major Arcana tarot cards?',
      answer:
        'The Major Arcana are the 22 trump cards in a tarot deck, numbered 0 (The Fool) through 21 (The World). Unlike the Minor Arcana which reflect everyday events, the Major Arcana represent significant life themes, soul lessons, and archetypal forces that shape a person\'s entire journey.',
    },
    {
      question: 'Can my tarot card change?',
      answer:
        'No. Your tarot birth cards come from your date of birth, so they stay the same for life. Some readers also use a year card, which changes each year, but BornClock shows only your fixed birth cards here.',
    },
    {
      question: 'Which tarot card is the most powerful?',
      answer:
        'No card is better than another. The World (XXI) is the card of completion and The Fool (0) the card of pure potential, but every Major Arcana card describes a different archetype with its own strengths and challenges.',
    },
  ];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'meaning', label: '✨ Meaning' },
    { key: 'love', label: '❤️ Love' },
    { key: 'career', label: '💼 Career' },
    { key: 'health', label: '🌿 Health' },
    { key: 'spirituality', label: '🕯️ Spirit' },
  ];

  return (
    <ToolLayout
      theme="mystic"
      seo={(
        <>
          <SEO
            title="Tarot Card by Birthday — Draw Your Card & Find Your Major Arcana | BornClock"
            description="Draw your tarot card interactively — then discover your permanent Major Arcana card from your date of birth. Free animated tarot card reading with full interpretations."
            keywords="tarot card by birthday, birthday tarot card, tarot birth card calculator, major arcana calculator, tarot by date of birth"
            canonicalUrl="/tarot-card-by-birthday"
          />
          <WebApplicationSchema
            name="Tarot Card by Birthday Calculator"
            description="Free interactive tarot card reading by birthday — discover your permanent Major Arcana card from your date of birth with full interpretations."
            url="/tarot-card-by-birthday"
          />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }], current: 'Tarot Card by Birthday' }}
      footer={{
        tagline: 'Draw your card, then discover the permanent Major Arcana card written into your birthday.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner/' },
          { label: 'Numerology', to: '/numerology/' },
          { label: 'Zodiac', to: '/zodiac/' },
          { label: 'Compatibility', to: '/compatibility/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Tarot"
      h1="Your Tarot Card by Birthday"
      lead={(
        <>
          Your tarot birth card comes from the standard method used by most tarot
          calculators (Mary K. Greer's birth cards): add your birth month, day and year,
          then reduce the total to a Major Arcana number of 22 or less. Most people have a
          pair of cards — a birth card and the card it reduces to.
        </>
      )}
    >
      <FAQSchema items={faqItems} />
      <section className="section">
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* SECTION 1: Interactive card draw */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">🃏 Draw Your Card</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Ten cards are spread before you. One is calling to you right now.
            </p>
            <InteractiveTarotDraw onCardDrawn={setDrawnCard} drawnCard={drawnCard} />
          </div>

          {/* SECTION 2: Birthday card */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">🎂 Your <TermTip id="birthCard">Birthday Card</TermTip></h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Month + day + year, reduced to 22 or less — the standard tarot birth card method.
            </p>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <SavedDateOffer dobIso={dob} onUseSaved={setDob} prefix="tarot" />
              <DobInput label="" value={dob ? { day: dob.slice(8, 10), month: dob.slice(5, 7), year: dob.slice(0, 4) } : undefined} onValidChange={d => setDob(d ? toISODate(d) : '')} />
              </div>
              <button
                onClick={handleCalculate}
                className="bg-brand-navy text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-navy transition-colors whitespace-nowrap"
              >
                Find My Card →
              </button>
            </div>
          </div>

          {/* Birthday card result */}
          {birthdayResult && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-brand-purple to-brand-purple rounded-2xl p-8 text-white text-center mb-6">
                <p className="text-sm text-white/90 mb-1">
                  Your tarot birth card is
                </p>
                <div className="text-7xl mb-3">{birthdayResult.card.emoji}</div>
                <p className="text-sm font-semibold text-white/90 mb-1">
                  Card {birthdayResult.card.number}
                </p>
                <h2 className="text-3xl font-black text-white mb-4">{birthdayResult.card.name}</h2>
                {birthdayResult.pair.length > 0 && (
                  <p className="text-sm text-white mb-3" data-testid="birth-card-pair">
                    Paired with {birthdayResult.pair.map(c => `${c.name} (${c.number})`).join(' and ')}
                  </p>
                )}
                <p className="text-xs text-white/90 mb-4" data-testid="birth-card-working">
                  {birthdayResult.working}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {birthdayResult.card.keywords.map(kw => (
                    <span key={kw} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
                <Link to={cardPageFor(birthdayResult.card.name)} className="inline-block text-sm text-white underline" data-testid="birth-card-meaning-link">
                  Full {birthdayResult.card.name} meaning — upright, reversed &amp; yes/no →
                </Link>
              </div>

              <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-white text-brand-purple shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                {activeTab === 'meaning' && (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {birthdayResult.card.upright}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {birthdayResult.card.deepMeaning}
                    </p>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Shadow side</p>
                      <p className="text-sm text-gray-700">{birthdayResult.card.reversed}</p>
                    </div>
                  </>
                )}
                {activeTab === 'love' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{birthdayResult.card.love}</p>
                )}
                {activeTab === 'career' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{birthdayResult.card.career}</p>
                )}
                {activeTab === 'health' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{birthdayResult.card.health}</p>
                )}
                {activeTab === 'spirituality' && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {birthdayResult.card.spirituality}
                  </p>
                )}

                <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-semibold text-green-700 mb-1">✨ Your Affirmation</p>
                  <p className="text-sm text-gray-700 italic">"{birthdayResult.card.affirmation}"</p>
                </div>

                {birthdayResult.card.famousPeople.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Famous people with this card
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {birthdayResult.card.famousPeople.map(p => (
                        <span
                          key={p}
                          className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-brand-navy rounded-2xl p-6 mt-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get the complete Birthday Intelligence Report</p>
                <p className="text-brand-purple-light text-sm mb-4">
                  Your tarot card + moon sign + nakshatra + name numerology + 12 more sections —
                  personalised to your exact birthday.
                </p>
                <Link
                  to="/birthday-report/"
                  className="inline-block bg-white text-brand-purple px-8 py-3 rounded-xl font-semibold hover:bg-brand-purple/10 transition-colors"
                >
                  Generate My Report → {reportPriceLabel}
                </Link>
              </div>
            </div>
          )}

          {/* SECTION 3: Combination reading — only when both present */}
          {drawnCard && birthdayResult && (
            <div className="bg-gradient-to-br from-brand-purple to-brand-purple rounded-2xl p-6 mb-8 text-white">
              <h2 className="text-lg font-bold text-center mb-4">✨ Your Combined Reading</h2>
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-1">{drawnCard.emoji}</div>
                  <p className="text-xs text-white/90">Drawn card</p>
                  <p className="text-sm font-bold text-white">{drawnCard.name}</p>
                </div>
                <div className="text-2xl self-center text-white/90">+</div>
                <div className="text-center">
                  <div className="text-3xl mb-1">{birthdayResult.card.emoji}</div>
                  <p className="text-xs text-white/90">Birthday card</p>
                  <p className="text-sm font-bold text-white">{birthdayResult.card.name}</p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed text-center">
                {getCombinationReading(drawnCard, birthdayResult.card)}
              </p>
            </div>
          )}

          {/* Educational content: all 22 Major Arcana cards */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">The 22 <TermTip id="majorArcana">Major Arcana</TermTip> Cards</h2>
            <p className="text-gray-500 text-sm mb-6">
              Each card represents a universal archetype. Your birth date points to one of them
              as your birth card, usually paired with a second.
            </p>
            <div className="space-y-2">
              {Object.entries(MAJOR_ARCANA).map(([num, card]) => {
                const isOpen = expandedCard === card.name;
                return (
                  <div
                    key={num}
                    className={`border rounded-xl transition-colors ${isOpen ? 'border-brand-purple/30 bg-brand-purple/40' : 'border-gray-200 hover:border-brand-purple/30 hover:bg-brand-purple/20'}`}
                  >
                    <button
                      className="w-full text-left p-4 flex items-center gap-3"
                      onClick={() => setExpandedCard(isOpen ? null : card.name)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-2xl shrink-0">{card.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-600 font-medium">Card {card.number}</span>
                          <span className="font-bold text-gray-900">{card.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {card.keywords.slice(0, 3).map(kw => (
                            <span key={kw} className="text-xs text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">{kw}</span>
                          ))}
                        </div>
                      </div>
                      <span className={`text-gray-600 text-sm transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-4 border-t border-brand-purple/30 pt-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{card.deepMeaning}</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                            <p className="text-xs font-bold text-rose-700 mb-1">❤️ Love</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{card.love}</p>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-xs font-bold text-blue-700 mb-1">💼 Career</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{card.career}</p>
                          </div>
                          <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                            <p className="text-xs font-bold text-green-700 mb-1">🌿 Health</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{card.health}</p>
                          </div>
                          <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-lg p-3">
                            <p className="text-xs font-bold text-brand-purple mb-1">🕯️ Spirituality</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{card.spirituality}</p>
                          </div>
                        </div>
                        {card.affirmation && (
                          <div className="bg-brand-navy text-brand-purple-light rounded-lg p-3 text-center">
                            <p className="text-xs font-medium italic">"{card.affirmation}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                { text: 'Interactive Tarot Reading', href: '/tarot-reading/' },
                { text: 'All 78 Tarot Card Meanings', href: '/tarot/cards/' },
                { text: 'Moon Sign Calculator', href: '/moon-sign/' },
                { text: 'Numerology Calculator', href: '/numerology/' },
                { text: 'Name Numerology', href: '/name-numerology/' },
              ].map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-brand-purple/30 hover:bg-brand-purple/10 text-sm text-gray-700 hover:text-brand-purple transition-colors"
                >
                  → {item.text}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </ToolLayout>
  );
}
