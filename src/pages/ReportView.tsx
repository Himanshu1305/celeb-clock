import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getReport } from '@/services/BirthdayReportService';
import type { BirthdayReportData } from '@/services/BirthdayReportService';
import { getTarotCardByLifePath } from '@/data/tarotData';
import { getChineseZodiacDescription } from '@/data/chineseZodiacDescriptions';
import { getVedicContext } from '@/data/birthdayPersonality';
import { RASHI_RATNA_DATA } from '@/data/rashiRatnaData';
import { calculateMoonSignAndNakshatra } from '@/data/moonSignData';
import { calculateAllNameNumbers, NAME_NUMBER_MEANINGS } from '@/data/nameNumerologyData';
import { calculateBiorhythm, getBiorhythmStatus } from '@/data/biorhythmData';
import { getTopCompatibleSigns } from '@/data/compatibilityData';

// ── Helper ─────────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('en-IN');

// ── Birthstone gem colors + birth flowers ──────────────────────────────────────

const BIRTHSTONE_META: Record<number, { color: string; hex: string; flower: string; lore: string }> = {
  1:  { color: 'Deep Red',        hex: '#b91c1c', flower: 'Carnation & Snowdrop',    lore: 'Garnet has been exchanged as a talisman between travellers since the Middle Ages — it was believed to light up the night and protect against accident.' },
  2:  { color: 'Violet Purple',   hex: '#7c3aed', flower: 'Violet & Primrose',       lore: 'Ancient Greeks believed amethyst prevented intoxication. Goblets were carved from it and wine mixed with water to mimic its colour at feasts.' },
  3:  { color: 'Pale Blue',       hex: '#0369a1', flower: 'Daffodil & Jonquil',      lore: 'Aquamarine was carried by sailors as a lucky charm and protection against seasickness — its name comes from the Latin for "seawater".' },
  4:  { color: 'Brilliant White', hex: '#6b7280', flower: 'Daisy & Sweet Pea',       lore: 'Diamond is the hardest natural substance on Earth. Ancient Indians believed it could only be formed by lightning striking rocks.' },
  5:  { color: 'Forest Green',    hex: '#15803d', flower: 'Lily of the Valley',      lore: 'Emeralds were mined in Ancient Egypt as early as 330 BC. Cleopatra was famously obsessed with them and claimed emerald mines as royal property.' },
  6:  { color: 'Rose Pink',       hex: '#be185d', flower: 'Rose & Honeysuckle',      lore: 'Pearl is the only gem created by a living organism. In ancient Rome, pearls were considered the ultimate symbol of wealth and social standing.' },
  7:  { color: 'Blood Red',       hex: '#dc2626', flower: 'Larkspur & Water Lily',   lore: 'Ruby was called the "king of gems" in ancient Sanskrit texts. Warriors in Burma implanted rubies beneath their skin for invincibility in battle.' },
  8:  { color: 'Olive Green',     hex: '#65a30d', flower: 'Poppy & Gladiolus',       lore: 'Ancient Egyptians called peridot the "gem of the sun." Some peridot on Earth arrived via meteorite — it has been found in pallasite meteorites.' },
  9:  { color: 'Deep Blue',       hex: '#1d4ed8', flower: 'Aster & Morning Glory',   lore: 'Sapphires were prized by medieval clergy as symbols of heaven. The British Crown Jewels contain multiple historic sapphires including the Stuart Sapphire.' },
  10: { color: 'Multi-colour',    hex: '#d97706', flower: 'Marigold & Cosmos',       lore: 'Opal\'s shifting colours were described by the Romans as "the fire of the carbuncle, the purple of the amethyst, and the sea-green of the emerald." Each opal is unique.' },
  11: { color: 'Golden Yellow',   hex: '#b45309', flower: 'Chrysanthemum',           lore: 'Topaz was believed to cool boiling water and calm sudden passions. The ancient Egyptians said it was coloured by the golden glow of the sun god Ra.' },
  12: { color: 'Sky Blue',        hex: '#0e7490', flower: 'Holly & Narcissus',       lore: 'Turquoise is one of the oldest gemstones worn by humans — found in 5,000-year-old Egyptian tombs. The Aztecs used it to decorate ceremonial masks of their gods.' },
};

// ── Inline gem SVG ─────────────────────────────────────────────────────────────

function GemSVG({ month, size = 64 }: { month: number; size?: number }) {
  const meta = BIRTHSTONE_META[month] ?? BIRTHSTONE_META[1];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,4 56,22 48,60 16,60 8,22" fill={meta.hex} fillOpacity="0.85" />
      <polygon points="32,4 56,22 32,28" fill="white" fillOpacity="0.35" />
      <polygon points="32,28 56,22 48,60 16,60 8,22" fill={meta.hex} fillOpacity="0.6" />
      <polygon points="32,4 8,22 32,28" fill="white" fillOpacity="0.15" />
      <polygon points="32,4 56,22 48,60 16,60 8,22" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    </svg>
  );
}

// ── Generation rich content ────────────────────────────────────────────────────

const GENERATION_CONTENT: Record<string, {
  emoji: string;
  worldEvents: string[];
  technology: string;
  culture: string;
  work: string;
  superpower: string;
}> = {
  'Silent Generation': {
    emoji: '🎖️',
    worldEvents: ['World War II', 'The Great Depression aftermath', 'Korean War', 'Birth of television', 'Cold War begins'],
    technology: 'Grew up as radio ruled the home. Witnessed the arrival of television, and later adapted to computers in the workplace — each new device felt like science fiction made real.',
    culture: 'Defined by deference to authority, hard work, and community sacrifice. The phrase "waste not, want not" was lived, not quoted. Swing music, bebop jazz, and the first Hollywood golden age shaped this generation\'s emotional landscape.',
    work: 'Loyalty defined the career. A 40-year tenure with one company was the aspiration and often the reality. Institutional trust was high — you followed the rules and the system rewarded you.',
    superpower: 'Resilience. Having survived economic collapse and world war, this generation\'s default mode is quiet perseverance. They do not panic; they endure.'
  },
  'Baby Boomer': {
    emoji: '📺',
    worldEvents: ['Moon landing (1969)', 'Vietnam War', 'Civil Rights Movement', 'Assassination of JFK and MLK', 'Woodstock and counterculture'],
    technology: 'Witnessed the dawn of the personal computer, the birth of the internet, and the explosion of cable television. Many became early adopters of email and mobile phones in middle age.',
    culture: 'Rock and roll, civil rights, and radical optimism. Boomers came of age believing they could change the world — many did. They invented youth culture as a force and never entirely grew out of it.',
    work: 'Hard work and long hours were the path to success. Boomers largely built the 9-to-5 work culture, the corner office aspiration, and the company loyalty model — even as they began questioning it.',
    superpower: 'Drive. Boomers are among the most competitive and achievement-oriented cohorts in history. Their ambition rebuilt post-war economies and produced some of the most impactful careers of the 20th century.'
  },
  'Generation X': {
    emoji: '📼',
    worldEvents: ['Fall of the Berlin Wall', 'AIDS epidemic', 'Gulf War', 'End of the Cold War', 'Rise of MTV'],
    technology: 'The original digital immigrants. Grew up with Atari and VCRs, graduated into the internet age, and built or shaped many of the tech companies that define the modern world.',
    culture: 'Grunge, hip-hop, and cynicism as an art form. Gen X was the first generation to be called "slackers" — a label they wore as a badge of independence. They distrusted institutions before it was fashionable.',
    work: 'Gen X bridged the loyalty era and the gig economy. They were the first to job-hop strategically, and the first to balance work-life boundaries as a conscious choice rather than a luxury.',
    superpower: 'Adaptability. Gen X has reinvented themselves multiple times — analogue to digital, corporate to entrepreneurial, employee to founder. No generation has navigated more paradigm shifts with less fanfare.'
  },
  'Millennial': {
    emoji: '💻',
    worldEvents: ['9/11', 'The 2008 Financial Crisis', 'Rise of social media', 'Global War on Terror', 'Obama presidency'],
    technology: 'The first digital natives. Millennials built the social internet, invented the app economy, and normalised smartphones as extensions of the self. They were the first to experience always-on connectivity.',
    culture: 'Harry Potter, Y2K anxiety, reality TV, and the permanent connectivity of social media. Millennials grew up expecting the world to be more equal and more connected — and spent much of adulthood reckoning with the gap.',
    work: 'Purpose over paycheck. Millennials drove the rise of remote work, side hustles, and the demand for meaningful employment. They were also the first generation to enter the workforce during a global financial collapse.',
    superpower: 'Collaboration. Millennials are the most educated and networked generation in history. Their instinct to share, connect, and co-create has driven some of the most significant cultural and technological shifts of the last two decades.'
  },
  'Generation Z': {
    emoji: '📱',
    worldEvents: ['COVID-19 pandemic', 'Climate crisis awareness', 'Black Lives Matter movement', 'Rise of AI', 'Social media as politics'],
    technology: 'True digital natives — born into smartphones, social algorithms, and streaming. Gen Z treats technology as invisible infrastructure rather than a novelty. They are the first generation where the internet was always already there.',
    culture: 'TikTok, mental health awareness, fluid identity, and radical pragmatism. Gen Z has the most nuanced and intersectional understanding of identity of any prior generation — and the least patience for inauthenticity.',
    work: 'Entrepreneurial and non-linear. Gen Z entered a post-pandemic labour market and chose agency over security. Creator economy, freelancing, and multiple income streams are the default, not the exception.',
    superpower: 'Authenticity. Gen Z has a finely tuned radar for what is genuine versus performative — and they reward the former with loyalty while dismissing the latter instantly. In a world of noise, they cut through it.'
  },
  'Generation Alpha': {
    emoji: '🤖',
    worldEvents: ['COVID-19 childhood', 'Rise of generative AI', 'Climate crisis as lived reality', 'Remote learning', 'Mars exploration era begins'],
    technology: 'Born into AI, voice assistants, and augmented reality. For Generation Alpha, ChatGPT is not a revolution — it is just another tool, like a calculator or a search engine. They will be the first to grow up with AI tutors from childhood.',
    culture: 'Roblox, YouTube Shorts, and a world where digital and physical reality are indistinguishable. Gen Alpha\'s play, friendships, and identity formation happen as much in virtual worlds as in physical ones.',
    work: 'The jobs Gen Alpha will do largely do not exist yet. They are being raised for a world of accelerating automation, climate adaptation, and human-AI collaboration. Creativity and emotional intelligence will be their most valuable skills.',
    superpower: 'Imagination. Growing up when the boundary between what is possible and impossible is dissolving daily, Generation Alpha approaches the world with an openness to entirely new realities that no prior generation has had from birth.'
  },
};

// ── Expiry page ─────────────────────────────────────────────────────────────────

const ExpiryPage = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm no-print">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Navigation />
        <AuthNav />
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="text-6xl mb-6">🔒</div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">This Report Has Expired</h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        Birthday reports are available for 7 days (30 days for premium accounts). This report's link has
        expired or may not exist. Create a new one for free!
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/birthday-report"
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
        >
          Create a New Report 🎂
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          Back to BornClock
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

// ── Loading skeleton ────────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Navigation />
        <AuthNav />
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🎂</div>
        <p className="text-gray-500">Loading birthday report...</p>
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const ReportView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeZodiacTab, setActiveZodiacTab] = useState('western');

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getReport(slug).then(data => {
      if (!data) setNotFound(true);
      else setRow(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (notFound || !row) return <ExpiryPage />;

  const rd: BirthdayReportData = row.report_data;
  const {
    recipientName, gifterName, personalMessage, celebrities, historicalEvents,
    westernZodiac, chineseZodiac, vedicRashi, zodiacComparison, compatibility,
    lifePathNumber, lifePathData, personalYear2026, personalYearMeaning,
    birthstone, generation, planetaryAges, planetaryFacts,
    age, daysSinceBirth, daysUntilNextBirthday, nextBirthdayDate, dayOfWeekBorn,
  } = rd;

  const dob = new Date(rd.recipientDob + 'T12:00:00');
  const monthName = dob.toLocaleString('default', { month: 'long' });
  const reportUrl = `${window.location.origin}/report/${slug}`;

  const handlePrint = () => {
    setTimeout(() => window.print(), 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  function getPersonalYearContent(num: number) {
    const content: Record<number, { theme: string; love: string; career: string; health: string; keyMonths: string[]; closing: string }> = {
      1: {
        theme: "Personal Year 1 is the year of new beginnings. The 9-year cycle resets here — old chapters close and fresh ones open. This is your year to plant seeds, launch projects, and step into a new version of yourself. The energy favours bold, independent action over waiting for permission.",
        love: "In relationships, this year rewards authenticity. If you're single, your magnetism increases — new connections made this year often carry long-term significance. In partnerships, fresh energy enters; it's an ideal time to redefine the relationship's direction or create new shared goals.",
        career: "Career-wise, this is your launch year. New jobs, businesses, or projects started in a Personal Year 1 tend to gain strong momentum. Trust your instincts over consensus — your independent judgment is unusually sharp this year.",
        health: "Physically, prioritize building new habits rather than maintaining old ones. Your body responds well to new exercise routines this year. Watch for a tendency to overdo it in the excitement of fresh starts.",
        keyMonths: ["January (double 1 energy)", "May (transition point)", "October (harvest early seeds)"],
        closing: "The seeds you plant in a Personal Year 1 grow for the next 9 years. Choose them wisely and plant with intention."
      },
      2: {
        theme: "Personal Year 2 is the year of patience, partnership, and inner development. After the bold launches of Year 1, Year 2 asks you to slow down, nurture what you've started, and build deep connections. Progress feels slower than you'd like — trust the process.",
        love: "This is one of the most powerful years for love and relationships. Existing partnerships deepen significantly; new relationships formed this year tend toward long-term commitment. Your emotional sensitivity is heightened — use it to truly listen and connect.",
        career: "Collaboration trumps solo effort this year. Partnerships, joint ventures, and teamwork yield better results than independent action. This is a year for gathering information, building alliances, and preparing — not for major launches.",
        health: "Your nervous system needs care this year. Prioritize rest, meditation, and gentle exercise over intense workouts. Emotional health is the foundation of physical health in a Personal Year 2.",
        keyMonths: ["February (peak relationship energy)", "June (midpoint reassessment)", "November (partnership decisions)"],
        closing: "What you build in Year 2 — in relationships, skills, and inner foundations — becomes your greatest asset in the years ahead."
      },
      3: {
        theme: "Personal Year 3 is your year to express, create, and celebrate. After the patience of Year 2, life opens up with creative energy, social opportunities, and joyful expansion. This is a year to say yes — to invitations, creative projects, and experiences that light you up.",
        love: "Your social magnetism peaks in a Personal Year 3. Romance flourishes; existing relationships become more playful and joyful. Single? This is your year — connections come easily when you're in environments you love.",
        career: "Creative work, communication, writing, speaking, and artistic projects shine this year. If your career involves expression of any kind, lean in hard. Visibility and recognition come naturally. Avoid scattering energy across too many exciting opportunities.",
        health: "Joy is medicine in a Personal Year 3. Activities that make you laugh and feel alive — dancing, playing, social sports — are exactly what your body needs. Watch for overindulgence.",
        keyMonths: ["March (peak creative energy)", "July (social peak)", "December (joyful celebration and reflection)"],
        closing: "In a world that often asks you to be serious, a Personal Year 3 gives you permission to play. Take it."
      },
      4: {
        theme: "Personal Year 4 is the year of building, structure, and foundations. This is the year to do the unglamorous, essential work — the planning, organizing, and consistent daily effort that creates lasting results. Hard work put in now pays dividends for years.",
        love: "Relationships in a Personal Year 4 become more serious and grounded. This is a year for building stability, having honest conversations about the future, and making commitments. Less spontaneity, more depth.",
        career: "This is the year to establish systems, routines, and structures that will support your work long-term. Start that habit, build that process, take that course. Promotions and stability come to those who show up consistently.",
        health: "Your body rewards routine this year. Consistent sleep schedules, regular exercise, and structured nutrition work especially well in a Personal Year 4. Bone and skeletal health deserve attention.",
        keyMonths: ["April (major building phase)", "August (test of commitment)", "January of next year (harvest of effort)"],
        closing: "No glamour, no shortcuts — just building. The discipline of a Personal Year 4 creates foundations that all future success rests on."
      },
      5: {
        theme: "Personal Year 5 is the year of change, freedom, and expansion. After the disciplined building of Year 4, life accelerates. Unexpected opportunities appear, plans shift, and the universe moves faster than you planned. Embrace adaptability as your greatest skill.",
        love: "Relationships either evolve significantly or end in a Personal Year 5. The status quo rarely survives this year's energy. This can be exhilarating (new love, deepened passion) or challenging (outgrown connections surfacing). Change here is necessary.",
        career: "Career changes, new opportunities, and unexpected pivots characterize this year. You may receive an offer you didn't expect, change industries, or discover a completely new direction. Say yes to exploration — the risk is lower than it appears.",
        health: "Your body craves variety in a Personal Year 5. Switch up your exercise, try new foods, explore new wellness modalities. Avoid overextending — the excitement of change can lead to burnout.",
        keyMonths: ["May (peak change energy)", "September (major pivot point)", "March (unexpected opening)"],
        closing: "In a Personal Year 5, the only mistake is holding on to what no longer fits. Let change be your compass."
      },
      6: {
        theme: "Personal Year 6 is the year of home, family, love, and responsibility. After the wild ride of Year 5, life asks you to settle, nurture, and give back. This is a year of beautiful obligations — the kind that fill rather than drain you.",
        love: "This is among the most romantic years in the 9-year cycle. Relationships are warm, deep, and committed. Marriage, proposals, and significant relationship milestones often cluster in Personal Year 6. Family bonds strengthen.",
        career: "Work that involves service, healing, teaching, and helping others thrives this year. Your leadership takes a nurturing quality that others respond to deeply. Business built around service or community flourishes.",
        health: "Take care of your physical home — your body. This is an excellent year for health investments: medical check-ups, nutrition improvements, and stress management. The well-being of those you love also directly affects your own energy.",
        keyMonths: ["June (family and relationship peak)", "February (love energy strong)", "October (responsibilities clarify)"],
        closing: "A Personal Year 6 teaches you that giving — of time, love, and care — returns to you multiplied. Service is your superpower this year."
      },
      7: {
        theme: "Personal Year 7 is the year of inner growth, wisdom, and spiritual deepening. Life slows down externally so it can speed up internally. This is a year for solitude, study, reflection, and understanding yourself at a deeper level. External results come later — trust the inner work.",
        love: "Relationships this year ask for depth over surface. Superficial connections naturally fall away; deep ones intensify. If single, you may feel content with solitude — this is healthy, not concerning. Relationships that begin in a Personal Year 7 tend to be profoundly spiritual connections.",
        career: "Analytical, research, and specialist work shines this year. This is the year to develop expertise, pursue mastery, and deepen your knowledge. Avoid major career launches — this year is for preparation and internal development.",
        health: "Mind and body connection is central to health in a Personal Year 7. Meditation, yoga, sleep quality, and mental wellness need attention. Unexplained physical symptoms may have emotional or spiritual roots.",
        keyMonths: ["July (peak introspection)", "November (spiritual insights)", "April (important realizations)"],
        closing: "The wisdom gained in a Personal Year 7 quietly transforms everything. What looks like stillness from the outside is the most significant growth of the 9-year cycle."
      },
      8: {
        theme: "Personal Year 8 is the year of abundance, achievement, and power. The inner work of Year 7 now manifests in the physical world — as career success, financial gain, recognition, and tangible results. This is a year to step into leadership and claim what you've built.",
        love: "Relationships take on a more serious, ambitious quality in a Personal Year 8. Power dynamics surface — look for partnerships of equals. This is a year for elevating partnerships, not starting casual ones.",
        career: "This is your power year. Career milestones, promotions, business success, and financial abundance concentrate in Year 8. Ask for what you want, negotiate boldly, and step visibly into leadership roles you've been preparing for.",
        health: "Physical energy is high, but ambition can push it beyond its limits. Structured, high-intensity exercise suits this year well. Don't sacrifice sleep for achievement — rest is what allows you to sustain your peak performance.",
        keyMonths: ["August (peak success energy)", "April (financial opportunities)", "December (year-end achievement)"],
        closing: "A Personal Year 8 is your harvest. Everything you've built, learned, and become across the previous seven years is ready to bear fruit. Step forward."
      },
      9: {
        theme: "Personal Year 9 is the year of completion, release, and preparation for new beginnings. The 9-year cycle closes here — what no longer serves you falls away to make space for the entirely new cycle beginning next year. Endings are rarely losses; they're makeovers.",
        love: "Relationships reach natural completion points in a Personal Year 9. Some end gracefully; others transform into something entirely new. Forgiveness — of yourself and others — is the most powerful relationship act of this year.",
        career: "Wrap up projects, tie loose ends, and let go of roles or directions that have run their course. Don't start major new projects — this is a year to complete and clear. Career wisdom gained this year becomes the foundation of next year's entirely new chapter.",
        health: "Release is the health theme of Year 9 — release of tension, old patterns, held emotions, and excess weight in all its forms. Detox practices, letting go of unhealthy habits, and processing old emotional material all resonate with this year's energy.",
        keyMonths: ["September (major releases)", "March (clearing phase)", "December (completion and reflection)"],
        closing: "Everything that ends in a Personal Year 9 is clearing the way for something more aligned to your truest self. Trust the completion."
      }
    };
    return content[num] || content[1];
  }

  return (
    <div id="birthday-report-print" className="min-h-screen bg-white">
      <Helmet>
        <title>{recipientName}'s Birthday Report | BornClock</title>
        <meta name="description" content={`A personalised birthday intelligence report for ${recipientName} — celebrity twins, zodiac, numerology, birthstone and more.`} />
        <meta name="robots" content="noindex" />
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-expand { max-height: none !important; overflow: visible !important; }
            .dark-section { background: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 1cm; }
            .report-section { page-break-inside: avoid; }
            h2, h3 { page-break-after: avoid; }
          }
        `}</style>
      </Helmet>

      {/* ── Site nav ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* ── Sticky report header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-[57px] z-40 shadow-sm no-print">
        <div className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <span className="font-bold text-gray-900">{recipientName}'s Birthday Report</span>
            {gifterName && (
              <span className="text-gray-400 text-sm ml-2">· A gift from {gifterName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
            >
              {copied ? '✓ Copied' : '🔗 Copy Link'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors"
            >
              ⬇ Download PDF
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${recipientName}'s Birthday Report! 🎂\n${reportUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              💬
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — COVER HERO                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-rose-100 via-amber-50 to-purple-100 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8 text-center">
            <img
              src="/bornclock-logo.png"
              alt="BornClock"
              className="h-12 w-auto mb-2"
              style={{ height: '48px', width: 'auto' }}
            />
            <p className="text-sm text-indigo-500 italic font-medium">
              Know your time. Live it well.
            </p>
            <p className="text-xs text-gray-400 mt-1">bornclock.com</p>
          </div>
          <div className="text-6xl mb-4">🎂</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
            {recipientName}'s Birthday<br />Intelligence Report
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Born on a {dayOfWeekBorn} · {dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Personal message */}
          {personalMessage && (
            <blockquote className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm border-l-4 border-rose-400 rounded-r-2xl px-6 py-4 text-gray-700 italic text-lg mb-8 text-left">
              "{personalMessage}"
              {gifterName && <footer className="text-sm text-gray-400 mt-2 not-italic">— {gifterName}</footer>}
            </blockquote>
          )}

          {/* Quick stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Years Old', value: String(age), icon: '🎈' },
              { label: 'Days Lived', value: fmt(daysSinceBirth), icon: '📅' },
              { label: 'Days to Birthday', value: String(daysUntilNextBirthday), icon: '⏳' },
              { label: 'Next Birthday', value: nextBirthdayDate.replace(/,.*/, ''), icon: '🎁' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl font-black text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — CELEBRITY TWINS + HISTORICAL EVENTS                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">🌟 Celebrity Birthday Twins</h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Famous people born on {monthName} {dob.getDate()}, ranked by global recognition
          </p>

          {celebrities.length > 0 ? (() => {
            const sortedCelebrities = [...celebrities].sort((a: any, b: any) => {
              const yearA = a.birthDate ? new Date(a.birthDate + 'T12:00:00').getFullYear() : 0;
              const yearB = b.birthDate ? new Date(b.birthDate + 'T12:00:00').getFullYear() : 0;
              if (yearA >= 1940 && yearB < 1940) return -1;
              if (yearB >= 1940 && yearA < 1940) return 1;
              if (yearA >= 1900 && yearB < 1900) return -1;
              if (yearB >= 1900 && yearA < 1900) return 1;
              return yearB - yearA;
            });
            return (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {sortedCelebrities.slice(0, 6).map((c: any, i: number) => {
                const year = c.birthDate ? new Date(c.birthDate + 'T12:00:00').getFullYear() : null;
                const occ = (c.occupation || '').toLowerCase();
                const catIcon = occ.includes('actor') || occ.includes('actress') || occ.includes('film') ? '🎬' :
                  occ.includes('music') || occ.includes('singer') || occ.includes('band') || occ.includes('rapper') ? '🎵' :
                  occ.includes('athlete') || occ.includes('player') || occ.includes('sport') || occ.includes('tennis') || occ.includes('cricket') || occ.includes('football') || occ.includes('basketball') ? '⚽' :
                  occ.includes('politic') || occ.includes('president') || occ.includes('minister') ? '🏛️' :
                  occ.includes('scientist') || occ.includes('physicist') || occ.includes('inventor') ? '🔬' : '⭐';
                const catLabel = occ.includes('actor') || occ.includes('actress') || occ.includes('film') ? 'Actor/Director' :
                  occ.includes('music') || occ.includes('singer') || occ.includes('band') || occ.includes('rapper') ? 'Musician' :
                  occ.includes('athlete') || occ.includes('player') || occ.includes('sport') || occ.includes('tennis') || occ.includes('cricket') || occ.includes('football') || occ.includes('basketball') ? 'Athlete' :
                  occ.includes('politic') || occ.includes('president') || occ.includes('minister') ? 'Politician' :
                  occ.includes('scientist') || occ.includes('physicist') || occ.includes('inventor') ? 'Scientist' : 'Notable Person';
                return (
                  <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{catIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm leading-tight">{c.name}</div>
                        {year && <div className="text-xs text-rose-400 mt-0.5">b. {year}{c.isLiving === false ? ' †' : ''}</div>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 line-clamp-2">{c.occupation || 'Notable person'}</div>
                    <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-xs font-medium">{catLabel}</span>
                  </div>
                );
              })}
            </div>
            );
          })() : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl mb-6">
              <p className="text-gray-400 text-sm">No celebrity data found for this date</p>
            </div>
          )}

          {/* Historical Events */}
          {historicalEvents.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">📜 Historical Events on This Day</h3>
              <div className="space-y-4">
                {historicalEvents.map((evt: { year: number; event: string }, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-sm font-black text-rose-500">{evt.year}</span>
                    </div>
                    <div className="flex-1 border-l-2 border-rose-100 pl-4 pb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{evt.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — ZODIAC PROFILE                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">♈ Zodiac Profile</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Three tradition systems, one person</p>

          {/* 3-card overview — click to switch tab */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Western Zodiac', value: westernZodiac?.name ?? '—', sub: westernZodiac?.element ?? '', icon: westernZodiac?.unicode ?? '♈', tab: 'western' },
              { label: 'Chinese Zodiac', value: `${chineseZodiac?.animal ?? '—'} ${chineseZodiac?.emoji ?? ''}`, sub: `${chineseZodiac?.element ?? ''} ${chineseZodiac?.yin_yang ?? ''}`, icon: '', tab: 'chinese' },
              { label: 'Vedic Rashi', value: vedicRashi?.name ?? '—', sub: vedicRashi?.english ?? '', icon: vedicRashi?.symbol ?? '', tab: 'vedic' },
            ].map(card => (
              <button
                key={card.label}
                onClick={() => setActiveZodiacTab(card.tab)}
                className={`bg-white rounded-2xl p-5 shadow-sm text-center w-full transition-all ${activeZodiacTab === card.tab ? 'ring-2 ring-rose-400 shadow-md' : 'hover:shadow-md'}`}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">{card.label}</div>
                <div className="font-black text-gray-900 text-lg">{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.sub}</div>
              </button>
            ))}
          </div>

          {/* Tabs deep dive */}
          <Tabs value={activeZodiacTab} onValueChange={setActiveZodiacTab} className="bg-white rounded-3xl shadow-sm p-6">
            <TabsList className="sr-only">
              <TabsTrigger value="western">Western</TabsTrigger>
              <TabsTrigger value="chinese">Chinese</TabsTrigger>
              <TabsTrigger value="vedic">Vedic</TabsTrigger>
            </TabsList>

            <TabsContent value="western" className="space-y-4 print-expand">
              {westernZodiac ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-5xl">{westernZodiac.unicode}</span>
                    <div>
                      <h3 className="font-black text-2xl text-gray-900">{westernZodiac.name}</h3>
                      <p className="text-sm text-gray-400">{westernZodiac.dateRange}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {westernZodiac.element && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">🔥 {westernZodiac.element}</span>}
                    {westernZodiac.modality && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">⚡ {westernZodiac.modality}</span>}
                    {westernZodiac.rulingPlanet && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">🪐 {westernZodiac.rulingPlanet}</span>}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{westernZodiac.fullDescription}</p>
                  {(westernZodiac.coreTraits ?? []).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Strengths</div>
                      <div className="flex flex-wrap gap-2">
                        {(westernZodiac.coreTraits ?? []).map((t: string) => (
                          <span key={t} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {((westernZodiac as any).challenges ?? []).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Growth Areas</div>
                      <div className="flex flex-wrap gap-2">
                        {((westernZodiac as any).challenges ?? []).map((t: string) => (
                          <span key={t} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {((westernZodiac as any).famousPeople ?? []).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Famous {westernZodiac.name}s</div>
                      <p className="text-sm text-gray-600">{((westernZodiac as any).famousPeople ?? []).join(' · ')}</p>
                    </div>
                  )}
                </>
              ) : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </TabsContent>

            <TabsContent value="chinese" className="space-y-4 print-expand">
              {chineseZodiac ? (() => {
                const czd = getChineseZodiacDescription(chineseZodiac.animal);
                return (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-5xl">{chineseZodiac.emoji}</span>
                    <div>
                      <h3 className="font-black text-2xl text-gray-900">{chineseZodiac.animal}</h3>
                      <p className="text-sm text-gray-400">Year {chineseZodiac.year} · Cycle repeats every 12 years</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {chineseZodiac.element && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">五行 {chineseZodiac.element}</span>}
                    {chineseZodiac.yin_yang && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{chineseZodiac.yin_yang}</span>}
                    {czd && <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">🗓 {czd.years}</span>}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{czd?.fullDescription ?? chineseZodiac.description}</p>
                  {czd?.personalityDepth && (
                    <p className="text-gray-600 text-sm leading-relaxed">{czd.personalityDepth}</p>
                  )}
                  {(czd?.strengths ?? chineseZodiac.traits ?? []).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Strengths</div>
                      <div className="flex flex-wrap gap-2">
                        {(czd?.strengths ?? chineseZodiac.traits ?? []).map((t: string) => (
                          <span key={t} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {czd?.challenges && czd.challenges.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Growth Areas</div>
                      <div className="flex flex-wrap gap-2">
                        {czd.challenges.map(c => (
                          <span key={c} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {czd?.loveStyle && (
                    <div className="bg-rose-50 rounded-xl p-4">
                      <div className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-1">❤️ Love &amp; Relationships</div>
                      <p className="text-sm text-rose-900 leading-relaxed">{czd.loveStyle}</p>
                    </div>
                  )}
                  {czd?.compatibility && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">💚 Most Compatible</div>
                        <p className="text-sm text-green-700">{czd.compatibility.best.join(' · ')}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4">
                        <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">⚡ Challenging Match</div>
                        <p className="text-sm text-red-700">{czd.compatibility.avoid.join(' · ')}</p>
                      </div>
                    </div>
                  )}
                  {czd?.careerPaths && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">💼 Career Paths</div>
                      <p className="text-sm text-blue-900">{czd.careerPaths.join(' · ')}</p>
                    </div>
                  )}
                  {(czd?.famousPeople ?? chineseZodiac.famous ?? []).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Famous {chineseZodiac.animal}s</div>
                      <p className="text-sm text-gray-600">{(czd?.famousPeople ?? chineseZodiac.famous ?? []).join(' · ')}</p>
                    </div>
                  )}
                  {czd?.lifeAdvice && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <p className="text-sm font-medium text-amber-900 italic">"{czd.lifeAdvice}"</p>
                    </div>
                  )}
                </>
                );
              })() : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </TabsContent>

            <TabsContent value="vedic" className="space-y-4 print-expand">
              {vedicRashi ? (() => {
                const vedicCtx = getVedicContext(dob.getMonth() + 1, dob.getDate(), westernZodiac?.name ?? vedicRashi.name);
                const rashiRatna = RASHI_RATNA_DATA.find(r => r.rashiEnglish === vedicRashi.name);
                return (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-5xl">{vedicRashi.symbol}</span>
                    <div>
                      <h3 className="font-black text-2xl text-gray-900">{vedicRashi.name}</h3>
                      <p className="text-sm text-gray-400">{vedicRashi.english} · Ruled by {vedicRashi.ruling_planet}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {vedicRashi.element && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">🔥 {vedicRashi.element}</span>}
                    {vedicRashi.ruling_planet && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">🪐 {vedicRashi.ruling_planet}</span>}
                    {vedicCtx.rashiSanskrit && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">🕉 {vedicCtx.rashiSanskrit} — {vedicCtx.rashiMeaning}</span>}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{vedicRashi.description}</p>
                  {zodiacComparison && (
                    <div className="bg-amber-50 rounded-xl px-4 py-3 text-xs text-amber-800">
                      <strong>Western vs Vedic: </strong>{zodiacComparison.note}
                    </div>
                  )}
                  {(vedicRashi.traits ?? []).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Core Traits</div>
                      <div className="flex flex-wrap gap-2">
                        {(vedicRashi.traits ?? []).map((t: string) => (
                          <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full text-xs font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nakshatra subsection */}
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">🌙 Birth Nakshatra</div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">⭐</span>
                      <div>
                        <div className="font-black text-orange-900 text-lg">{vedicCtx.nakshatra}</div>
                        <div className="text-xs text-orange-600">Meaning: {vedicCtx.nakshatraMeaning} · Deity: {vedicCtx.nakshatraDeity}</div>
                      </div>
                    </div>
                    <p className="text-sm text-orange-800 leading-relaxed">
                      The Nakshatra of <strong>{vedicCtx.nakshatra}</strong> brings the quality of <em>{vedicCtx.nakshatraQuality}</em>. In Vedic astrology, your Nakshatra is considered more precise than your Rashi — it reveals the exact lunar mansion your Sun occupied at birth, carrying specific energetic signatures that shape your intuitive nature, karmic path, and deepest motivations.
                    </p>
                  </div>

                  {/* Rashi Ratna (Vedic gemstone) */}
                  {rashiRatna && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
                      <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide">💎 Rashi Ratna — Vedic Birthstone</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: rashiRatna.hex }} />
                        <div>
                          <div className="font-black text-indigo-900">{rashiRatna.primaryStone} ({rashiRatna.primaryStoneHindi})</div>
                          <div className="text-xs text-indigo-600">Alt: {rashiRatna.secondaryStone} · Metal: {rashiRatna.metalToUse}</div>
                        </div>
                      </div>
                      <p className="text-sm text-indigo-800 leading-relaxed">{rashiRatna.description.slice(0, 300)}</p>
                      <div className="flex flex-wrap gap-2">
                        {rashiRatna.benefits.slice(0, 4).map(b => (
                          <span key={b} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">{b}</span>
                        ))}
                      </div>
                      <div className="text-xs text-indigo-500 italic">Wear on {rashiRatna.wearingDay} · {rashiRatna.fingerToWear}</div>
                    </div>
                  )}
                </>
                );
              })() : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </TabsContent>
          </Tabs>

          {/* Compatibility */}
          {(compatibility.best.length > 0 || compatibility.challenging.length > 0) && (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-2xl p-5">
                <div className="font-semibold text-green-800 mb-2 text-sm">💚 Most Compatible</div>
                <div className="flex flex-wrap gap-2">
                  {compatibility.best.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 rounded-2xl p-5">
                <div className="font-semibold text-red-800 mb-2 text-sm">⚠️ Challenging Match</div>
                <div className="flex flex-wrap gap-2">
                  {compatibility.challenging.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — NUMEROLOGY BLUEPRINT                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">🔢 Numerology Blueprint</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Calculated from their exact date of birth</p>

          {/* Life path number */}
          <div className="text-center mb-8">
            <div className="text-9xl font-black text-rose-500 leading-none mb-2">{lifePathNumber}</div>
            <div className="text-xl font-bold text-gray-900">{lifePathData?.name ?? `Life Path ${lifePathNumber}`}</div>
            <div className="text-gray-500 text-sm mt-1">{lifePathData?.keywords?.slice(0, 3).join(' · ')}</div>
          </div>

          {/* 3-number summary grid */}
          {(() => {
            const nameNums = calculateAllNameNumbers(recipientName || '');
            return (
              <div className="grid grid-cols-3 gap-3 mb-10">
                {[
                  { label: 'Life Path', value: lifePathNumber, color: 'bg-rose-50 text-rose-700', desc: 'Your core life purpose' },
                  { label: 'Soul Urge', value: nameNums.soulUrge, color: 'bg-indigo-50 text-indigo-700', desc: "Your heart's desire" },
                  { label: 'Personal Year', value: personalYear2026 ?? '—', color: 'bg-amber-50 text-amber-700', desc: 'Your 2026 energy' },
                ].map(({ label, value, color, desc }) => (
                  <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
                    <div className="text-3xl font-black mb-1">{value}</div>
                    <div className="text-xs font-semibold">{label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {lifePathData && (
            <div className="space-y-6 mb-10">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Personality</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{lifePathData.personality?.slice(0, 400)}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-2 text-sm">Strengths</h3>
                  <ul className="space-y-1">
                    {(lifePathData.strengths ?? []).slice(0, 4).map((s: string) => (
                      <li key={s} className="text-xs text-green-700">✓ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-2 text-sm">Growth Areas</h3>
                  <ul className="space-y-1">
                    {(lifePathData.challenges ?? []).slice(0, 4).map((s: string) => (
                      <li key={s} className="text-xs text-amber-700">→ {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Personal Year 2026 */}
          {personalYear2026 && (() => {
            const pyc = getPersonalYearContent(personalYear2026);
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4 pb-2 border-b border-amber-200">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl font-black text-white flex-shrink-0">
                    {personalYear2026}
                  </div>
                  <div>
                    <div className="font-black text-amber-900 text-lg">Personal Year {personalYear2026} in 2026</div>
                    {personalYearMeaning?.title && <div className="text-sm text-amber-700 font-medium">{personalYearMeaning.title}</div>}
                  </div>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">{pyc.theme}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">❤️ Love &amp; Relationships</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{pyc.love}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">💼 Career &amp; Money</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{pyc.career}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold text-green-500 uppercase tracking-wide mb-1">🌿 Health &amp; Energy</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{pyc.health}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-1">📅 Key Months</div>
                    <ul className="space-y-0.5">
                      {pyc.keyMonths.map((m, i) => (
                        <li key={i} className="text-xs text-gray-700">· {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-amber-100 rounded-xl px-4 py-3 text-sm font-medium text-amber-900 italic">
                  "{pyc.closing}"
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — COSMIC CONNECTIONS (BIRTHSTONE)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-purple-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">💎 Cosmic Connections</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Birthstone of {monthName}</p>

          {birthstone ? (() => {
            const bsMeta = BIRTHSTONE_META[dob.getMonth() + 1] ?? BIRTHSTONE_META[1];
            return (
            <div className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col items-center gap-3">
                <GemSVG month={dob.getMonth() + 1} size={80} />
                <div className="text-center">
                  <h3 className="text-3xl font-black text-gray-900">{birthstone.primaryStone}</h3>
                  <p className="text-sm font-medium mt-1" style={{ color: bsMeta.hex }}>{bsMeta.color}</p>
                  {birthstone.alternateStones?.length > 0 && (
                    <p className="text-xs text-purple-500 mt-1">Alternate: {birthstone.alternateStones.join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Birth flower */}
              <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-4">
                <span className="text-2xl">🌸</span>
                <div>
                  <div className="text-xs font-bold text-pink-700 uppercase tracking-wide mb-0.5">Birth Flower</div>
                  <div className="text-sm font-semibold text-pink-900">{bsMeta.flower}</div>
                </div>
              </div>

              {/* Lore */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">💡 Did You Know?</div>
                <p className="text-sm text-purple-900 leading-relaxed">{bsMeta.lore}</p>
              </div>

              {/* Meaning & Properties */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Meaning &amp; Symbolism</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{birthstone.meaning}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Properties</h4>
                  <ul className="space-y-1">
                    {(birthstone.properties ?? []).slice(0, 5).map((p: string) => (
                      <li key={p} className="text-xs text-gray-600 flex items-start gap-1">
                        <span style={{ color: bsMeta.hex }}>●</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {birthstone.history && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-1">History</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{birthstone.history.slice(0, 500)}</p>
                </div>
              )}

              {birthstone.careInstructions && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-1">Care Instructions</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{birthstone.careInstructions}</p>
                </div>
              )}
            </div>
            );
          })() : (
            <div className="text-center text-gray-400 text-sm">Birthstone data unavailable</div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — SOLAR SYSTEM AGES (dark)                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="dark-section py-14 px-4" style={{ background: '#0f172a' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-2 text-center">🪐 Solar System Ages</h2>
          <p className="text-center text-slate-400 text-sm mb-10">
            {recipientName} is {age} years old on Earth — here's their age across the solar system
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(planetaryAges).map(([planet, pAge]) => {
              const SYMBOLS: Record<string, string> = {
                Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆',
              };
              return (
                <div
                  key={planet}
                  className="bg-slate-800 border border-slate-700 border-l-4 rounded-2xl p-5"
                  style={{ borderLeftColor: planet === 'Neptune' ? '#818cf8' : '#f43f5e' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl text-slate-300">{SYMBOLS[planet]}</span>
                    <span className="font-bold text-white text-sm">{planet}</span>
                  </div>
                  <div className="text-2xl font-black text-rose-400">{pAge}</div>
                  <div className="text-xs text-slate-500">years on {planet}</div>
                </div>
              );
            })}
          </div>

          {/* Neptune special card */}
          <div className="bg-indigo-950 border border-indigo-800 rounded-3xl p-6 text-center">
            <div className="text-3xl mb-3">♆</div>
            <h3 className="font-black text-white text-lg mb-2">The Neptune Number</h3>
            <p className="text-2xl font-black text-indigo-300 mb-2">{planetaryAges['Neptune']} years</p>
            <p className="text-sm text-indigo-400 max-w-lg mx-auto leading-relaxed">
              {planetaryFacts?.Neptune ?? 'It rains diamonds on Neptune.'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — GENERATION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-amber-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">👥 Generation Portrait</h2>
          <p className="text-gray-500 text-sm mb-8">Where {recipientName} fits in history</p>

          {generation && (() => {
            const gc = GENERATION_CONTENT[generation.name];
            return (
              <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 space-y-6 text-left">
                {/* Header */}
                <div className="text-center pb-4 border-b border-gray-100">
                  <div className="text-5xl mb-3">{gc?.emoji ?? '🎖️'}</div>
                  <h3 className="text-3xl font-black text-gray-900">{generation.name}</h3>
                  <div className="text-rose-500 font-semibold text-sm mt-1">{generation.range}</div>
                </div>

                {/* Summary */}
                <p className="text-gray-600 leading-relaxed text-center max-w-lg mx-auto">{generation.desc}</p>

                {gc && (
                  <>
                    {/* Defining world events */}
                    <div className="bg-slate-50 rounded-2xl p-5">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">🌍 Defining World Events</div>
                      <div className="flex flex-wrap gap-2">
                        {gc.worldEvents.map(e => (
                          <span key={e} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-medium">{e}</span>
                        ))}
                      </div>
                    </div>

                    {/* Tech, Culture, Work */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">💻 Technology</div>
                        <p className="text-xs text-blue-900 leading-relaxed">{gc.technology}</p>
                      </div>
                      <div className="bg-rose-50 rounded-2xl p-4">
                        <div className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2">🎨 Culture</div>
                        <p className="text-xs text-rose-900 leading-relaxed">{gc.culture}</p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">💼 Work Style</div>
                        <p className="text-xs text-green-900 leading-relaxed">{gc.work}</p>
                      </div>
                    </div>

                    {/* Superpower */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">⚡ Generational Superpower</div>
                      <p className="text-sm text-amber-900 leading-relaxed font-medium">{gc.superpower}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Longevity CTA */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <h4 className="font-bold text-green-900 mb-2">Want to know how long they could live?</h4>
            <p className="text-sm text-green-700 mb-4">Calculate a personalised life expectancy based on lifestyle, country, and health factors.</p>
            <Link
              to="/life-expectancy"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              🧬 Try Life Expectancy Calculator
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tarot Card ────────────────────────────────────────────────────── */}
      {(() => {
        const lp = Number(lifePathNumber || 1);
        const card = getTarotCardByLifePath(lp);
        return (
          <div className="py-12 px-4 bg-gradient-to-br from-indigo-950 to-purple-950">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">{card.emoji}</div>
                <div className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Your Birthday Tarot Card</div>
                <h3 className="text-2xl font-black text-white mb-1">{card.name}</h3>
                <p className="text-xs text-indigo-300">Life Path {lp} · Card {card.number}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {card.keywords.slice(0, 4).map((kw: string) => (
                  <span key={kw} className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full">{kw}</span>
                ))}
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed text-center mb-4">{card.upright.slice(0, 200)}...</p>
              <div className="bg-white/10 rounded-2xl p-4 text-center mb-4">
                <p className="text-xs font-semibold text-indigo-300 mb-1">Your Affirmation</p>
                <p className="text-white italic text-sm">"{card.affirmation}"</p>
              </div>
              <div className="text-center">
                <Link to="/tarot-card-by-birthday" className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                  Explore your full tarot reading →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Moon Sign ─────────────────────────────────────────────────────── */}
      {(() => {
        const moonResult = calculateMoonSignAndNakshatra(dob);
        return (
          <div className="py-10 px-4 bg-gradient-to-br from-blue-950 to-slate-900">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-4">
                <div className="text-xs text-blue-400 uppercase tracking-widest mb-2">Moon Sign & Nakshatra</div>
                <div className="flex justify-center gap-6 mb-3">
                  <div className="text-center">
                    <div className="text-4xl mb-1">{moonResult.moonSignData.symbol}</div>
                    <p className="font-black text-white text-lg">{moonResult.moonSign} Moon</p>
                    <p className="text-xs text-blue-300">{moonResult.moonSignData.element} · {moonResult.moonSignData.rulingPlanet}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-1">{moonResult.nakshatraData.symbol}</div>
                    <p className="font-black text-white text-lg">{moonResult.nakshatraData.name}</p>
                    <p className="text-xs text-purple-300">Nakshatra #{moonResult.nakshatraNumber}</p>
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed text-center mb-4">{moonResult.moonSignData.personality.slice(0, 200)}...</p>
              <div className="text-center">
                <Link to="/moon-sign" className="text-xs text-blue-400 hover:text-blue-300 underline">
                  Full moon sign interpretation →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Name Numerology ───────────────────────────────────────────────── */}
      {(() => {
        const nums = calculateAllNameNumbers(recipientName || '');
        const exprMeaning = NAME_NUMBER_MEANINGS[nums.expression];
        return (
          <div className="py-10 px-4 bg-white border-t border-gray-100">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-5">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Name Numerology</div>
                <h3 className="text-xl font-black text-gray-900">The Numbers in Your Name</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Expression', value: nums.expression, color: 'bg-indigo-50 text-indigo-700', desc: 'Who you are destined to be' },
                  { label: 'Soul Urge', value: nums.soulUrge, color: 'bg-rose-50 text-rose-700', desc: "What your heart desires" },
                  { label: 'Personality', value: nums.personality, color: 'bg-emerald-50 text-emerald-700', desc: 'How others perceive you' },
                ].map(({ label, value, color, desc }) => (
                  <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
                    <div className="text-3xl font-black mb-1">{value}</div>
                    <div className="text-xs font-semibold">{label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
              {exprMeaning && (
                <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-indigo-700 mb-1">Expression {nums.expression} — {exprMeaning.title}</p>
                  <p className="text-sm text-gray-700">{exprMeaning.expression.slice(0, 180)}...</p>
                </div>
              )}
              <div className="text-center">
                <Link to="/name-numerology" className="text-xs text-indigo-500 hover:text-indigo-700 underline">
                  Calculate with full birth name →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Biorhythm ──────────────────────────────────────────────────────── */}
      {(() => {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const bio = calculateBiorhythm(dob, today);
        const physStatus = getBiorhythmStatus(bio.physical);
        const emoStatus = getBiorhythmStatus(bio.emotional);
        const intStatus = getBiorhythmStatus(bio.intellectual);
        return (
          <div className="py-10 px-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-5">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Today's Biorhythm</div>
                <h3 className="text-xl font-black text-gray-900">Physical · Emotional · Intellectual Cycles</h3>
                <p className="text-xs text-gray-500 mt-1">Based on {bio.daysSinceBirth.toLocaleString()} days since birth</p>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { label: '🏃 Physical', value: bio.physical, status: physStatus, color: 'bg-rose-400' },
                  { label: '💙 Emotional', value: bio.emotional, status: emoStatus, color: 'bg-blue-400' },
                  { label: '🧠 Intellectual', value: bio.intellectual, status: intStatus, color: 'bg-amber-400' },
                ].map(({ label, value, status, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{label}</span>
                      <span className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                        <span className="font-bold text-gray-900">{value > 0 ? '+' : ''}{value}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${50 + value / 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/biorhythm" className="text-xs text-teal-500 hover:text-teal-700 underline">
                  See 30-day biorhythm chart →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Compatibility ──────────────────────────────────────────────────── */}
      {(() => {
        const signName = westernZodiac?.name || '';
        if (!signName) return null;
        const topMatches = getTopCompatibleSigns(signName);
        return (
          <div className="py-10 px-4 bg-white border-t border-gray-100">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-5">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Zodiac Compatibility</div>
                <h3 className="text-xl font-black text-gray-900">Top Matches for {signName}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {topMatches.slice(0, 3).map(({ sign, score, reason }) => (
                  <Link key={sign} to={`/compatibility/${signName.toLowerCase()}/${sign.toLowerCase()}`}
                    className="border border-gray-200 hover:border-rose-300 hover:bg-rose-50 rounded-2xl p-3 text-center transition-colors">
                    <div className="text-2xl mb-1">
                      {{'Aries':'♈','Taurus':'♉','Gemini':'♊','Cancer':'♋','Leo':'♌','Virgo':'♍','Libra':'♎','Scorpio':'♏','Sagittarius':'♐','Capricorn':'♑','Aquarius':'♒','Pisces':'♓'}[sign] || '⭐'}
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{sign}</div>
                    <div className="text-xs font-semibold text-rose-600">{score}%</div>
                    <div className="text-xs text-gray-500 mt-1 leading-tight">{reason.slice(0, 50)}</div>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link to={`/compatibility`} className="text-xs text-rose-500 hover:text-rose-700 underline">
                  Check compatibility with any sign →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <div className="py-12 px-4 bg-white text-center no-print">
        <div className="flex justify-center mt-6 mb-2">
          <img
            src="/bornclock-logo.png"
            alt="BornClock"
            className="h-10 w-auto opacity-70"
          />
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Made with BornClock · <Link to="/birthday-report" className="text-rose-500 hover:underline">Create another report</Link>
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl text-sm transition-colors"
          >
            ⬇ Download PDF
          </button>
        </div>
      </div>

      <div className="report-print-footer no-screen">BornClock · Know your time. Live it well. · bornclock.com</div>

      <Footer />
    </div>
  );
};

export default ReportView;
