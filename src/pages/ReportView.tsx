import { useEffect, useState, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { getReport } from '@/services/BirthdayReportService';
import type { BirthdayReportData } from '@/services/BirthdayReportService';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import { getTarotCardByLifePath } from '@/data/tarotData';
import { getChineseZodiacDescription } from '@/data/chineseZodiacDescriptions';
import { getVedicContext } from '@/data/birthdayPersonality';
import { RASHI_RATNA_DATA } from '@/data/rashiRatnaData';
import { calculateMoonSignAndNakshatra } from '@/data/moonSignData';
import { calculateAllNameNumbers, NAME_NUMBER_MEANINGS } from '@/data/nameNumerologyData';
import { calculateBiorhythm, getBiorhythmStatus } from '@/data/biorhythmData';
import { getTopCompatibleSigns } from '@/data/compatibilityData';
import { useReactToPrint } from 'react-to-print';
import { getLifePath } from '@/data/numerologyLifePathData';
import { getNakshatra } from '@/data/nakshatraData';
import { getRashi } from '@/data/rashiData';
import { getRashiEssence } from '@/data/rashiEssence';
import { getNakshatraEssence } from '@/data/nakshatraEssence';
import { getMoonSignEssence, MOON_SIGN_EXPLAINER } from '@/data/moonSignEssence';
import { getSoulUrge, getPersonality } from '@/data/numerologyNameData';
import { getVedicBirthstone, SECTION_EXPLAINERS, CLOSING_SECTION } from '@/data/reportContentAdditions';

// ── Helper ─────────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('en-IN');

// ── Birthstone gem colors + birth flowers ──────────────────────────────────────

const BIRTHSTONE_META: Record<number, { color: string; hex: string; flower: string; lore: string }> = {
  1:  { color: 'Deep Red',        hex: '#b91c1c', flower: 'Carnation & Snowdrop',
        lore: 'Garnet has been treasured for over 5,000 years. Ancient Egyptians used garnets as inlaid gemstones in pharaohs\' jewellery and buried them with their mummified dead for protection in the afterlife. The name comes from the Latin "granatum" (pomegranate seed) — early red garnets resembled the jewel-like seeds of the fruit. Medieval warriors wore garnets believing they lit the night and ensured a safe return home.' },
  2:  { color: 'Violet Purple',   hex: '#7c3aed', flower: 'Violet & Primrose',
        lore: 'Amethyst was once considered as precious as ruby and emerald — the ancient Greeks believed it prevented intoxication (amethystos means "not drunk"). Leonardo da Vinci wrote that amethyst could dissipate evil thoughts and quicken intelligence. Until the 18th century, only royalty could wear amethyst; the discovery of large deposits in Brazil made it widely available. It remains one of the most spiritually revered stones across virtually every culture.' },
  3:  { color: 'Pale Blue',       hex: '#0369a1', flower: 'Daffodil & Jonquil',
        lore: 'Aquamarine was once believed to be the treasure of mermaids — Roman sailors wore aquamarine amulets engraved with the god Neptune for protection at sea. Its name comes from the Latin "aqua marina" (sea water). Ancient seers used aquamarine as a fortune-telling medium, and it was thought to restore youth and happiness to married couples. The finest aquamarines come from Brazil\'s Minas Gerais state; the largest ever found, the "Dom Pedro," weighs 10,363 carats.' },
  4:  { color: 'Brilliant White', hex: '#D9DCE1', flower: 'Daisy & Sweet Pea',
        lore: 'Diamond is the hardest natural substance on Earth — the name comes from the Greek "adamas" (unconquerable). Ancient Hindus believed diamonds were created when lightning struck rocks, and used them as the eyes of devotional statues. The Golconda mines in India produced the world\'s most famous diamonds, including the Koh-i-Noor and the Hope Diamond. A diamond\'s carbon atoms were likely formed in supernova explosions billions of years before our solar system existed.' },
  5:  { color: 'Forest Green',    hex: '#15803d', flower: 'Lily of the Valley',
        lore: 'Emerald is among humanity\'s oldest known gemstones — Egyptian mines date to 330 BCE and Cleopatra was famous for her emerald collection. The Incas worshipped emeralds as sacred stones. The finest emeralds in the world come from Colombia\'s Muzo region, where they have been mined since pre-Columbian times. Spanish conquistadors who tried to shatter Colombian emeralds (believing them fake because the stones weren\'t diamonds) unknowingly destroyed some of history\'s most extraordinary gemological treasures.' },
  6:  { color: 'White / Cream / Iridescent', hex: '#E8E2D0', flower: 'Rose & Honeysuckle',
        lore: 'Pearl is humanity\'s oldest gem — it is the only gem created by a living organism and requires no cutting or polishing. The earliest written record of pearl trading appears in Chinese literature from 2206 BCE. Julius Caesar passed a law restricting pearl jewelry to the ruling classes; Cleopatra famously dissolved a pearl in vinegar and drank it to win a bet with Mark Antony about who could host the most expensive banquet. The cultured pearl industry, pioneered by Mikimoto Kōkichi in Japan in 1893, made pearl accessible to the world.' },
  7:  { color: 'Blood Red',       hex: '#dc2626', flower: 'Larkspur & Water Lily',
        lore: 'Ruby is known as the "King of Gems" in Sanskrit ("ratnaraj"). Ancient Burmese warriors inserted rubies beneath their skin before battle, believing they made them invincible. The finest rubies come from the Mogok valley in Burma and glow with fluorescence under ultraviolet light — a quality that makes them appear to generate their own inner fire. Ruby is rarer than diamond; large rubies consistently sell for more per carat than any other gemstone at major auctions.' },
  8:  { color: 'Olive Green',     hex: '#65a30d', flower: 'Poppy & Gladiolus',
        lore: 'Peridot is one of the few gemstones that exists in only one colour — it owes its distinctive lime-green to iron. Ancient Egyptians called it "the gem of the sun" and mined it on the remote Red Sea island of Zabargad (also called Topazios) for over 3,500 years. Some peridot reaches Earth from space — it has been found in meteorites and in comet dust collected by NASA\'s Stardust mission. The "crusader\'s emeralds" adorning the shrine of the Three Kings in Cologne Cathedral are actually large peridots.' },
  9:  { color: 'Deep Blue',       hex: '#1d4ed8', flower: 'Aster & Morning Glory',
        lore: 'Sapphire has been associated with the heavens and divine favour across virtually every major civilization. Ancient Persians believed the earth rested on a giant sapphire that painted the sky blue. Medieval clergy wore sapphires because they symbolised heaven. The Star of India — the world\'s largest sapphire at 563 carats — was donated to the American Museum of Natural History by J.P. Morgan. The engagement ring that belonged to Princess Diana and is now worn by Catherine, Princess of Wales, features a 12-carat Ceylon sapphire.' },
  10: { color: 'Multi-colour',    hex: '#d97706', flower: 'Marigold & Cosmos',
        lore: 'Opal is the most optically complex gemstone — its play of colour (called opalescence) is caused by light diffracting through microscopic silica spheres. The Romans called it "opalus" (precious stone) and considered it the most powerful gem because it contained the colours of all other stones. Aboriginal Australians believe opals were created when the Creator came to Earth on a rainbow. Australia produces over 95% of the world\'s precious opal. A rare "black opal" from Lightning Ridge, Australia sold for $1 million per carat.' },
  11: { color: 'Golden Yellow',   hex: '#b45309', flower: 'Chrysanthemum',
        lore: 'Topaz in its most coveted "imperial" orange-pink form was once confused with ruby and sapphire, which is why many "famous rubies" in museum collections were later identified as topaz. The ancient Egyptians believed topaz was coloured by the golden glow of the sun god Ra. The word "topaz" possibly derives from Topazios — the ancient name for St. John\'s Island in the Red Sea. The Braganza Diamond in the Portuguese Crown Jewels, once thought to be the world\'s largest diamond, is now believed to be a colourless topaz.' },
  12: { color: 'Sky Blue',        hex: '#0e7490', flower: 'Holly & Narcissus',
        lore: 'Tanzanite was only discovered in 1967 — making it geologically unique as one of the youngest gemstones in the market. Found only in a small area near Mount Kilimanjaro in Tanzania, scientists estimate the conditions that created tanzanite were so unique they are unlikely to be replicated anywhere else on Earth in the next 585 million years. The stone was named by Tiffany & Co., who first commercialised it. Unlike traditional December stones, tanzanite is considered a thousand times rarer than diamond.' },
};

// ── Birthstone images — Wikimedia Commons public domain photographs ────────────

const BIRTHSTONE_IMAGES: Record<number, string> = {
  1:  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/GarnetUSGOV.jpg/320px-GarnetUSGOV.jpg',
  2:  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Amethyst._Magaliesburg%2C_South_Africa.jpg/320px-Amethyst._Magaliesburg%2C_South_Africa.jpg',
  3:  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Aquamarine_on_muscovite.jpg/320px-Aquamarine_on_muscovite.jpg',
  4:  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Rough_diamond.jpg/320px-Rough_diamond.jpg',
  5:  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Gachalaemerald.jpg/320px-Gachalaemerald.jpg',
  6:  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Pearl_and_shell.jpg/320px-Pearl_and_shell.jpg',
  7:  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Ruby_cristal.jpg/320px-Ruby_cristal.jpg',
  8:  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Peridot_gem.JPG/320px-Peridot_gem.JPG',
  9:  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Sapphire_gem.jpg/320px-Sapphire_gem.jpg',
  10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Opale_precious.JPG/320px-Opale_precious.JPG',
  11: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Topaz_cut.jpg/320px-Topaz_cut.jpg',
  12: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Tanzanite_gem.jpg/320px-Tanzanite_gem.jpg',
};

function GemImage({ month, size = 80 }: { month: number; size?: number }) {
  const meta = BIRTHSTONE_META[month] ?? BIRTHSTONE_META[1];
  const src = BIRTHSTONE_IMAGES[month];
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        style={{ width: size, height: size, borderRadius: '50%', backgroundColor: meta.hex, opacity: 0.85 }}
        className="shadow-lg"
      />
    );
  }

  return (
    <img
      src={src}
      alt={`${meta.color} birthstone`}
      width={size}
      height={size}
      onError={() => setImgError(true)}
      className="rounded-2xl shadow-lg object-cover"
      style={{ width: size, height: size }}
    />
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
  famousMembers: string[];
}> = {
  'Silent Generation': {
    emoji: '🎖️',
    worldEvents: ['World War II', 'The Great Depression aftermath', 'Korean War', 'Birth of television', 'Cold War begins'],
    technology: 'Grew up as radio ruled the home. Witnessed the arrival of television, and later adapted to computers in the workplace — each new device felt like science fiction made real.',
    culture: 'Defined by deference to authority, hard work, and community sacrifice. The phrase "waste not, want not" was lived, not quoted. Swing music, bebop jazz, and the first Hollywood golden age shaped this generation\'s emotional landscape.',
    work: 'Loyalty defined the career. A 40-year tenure with one company was the aspiration and often the reality. Institutional trust was high — you followed the rules and the system rewarded you.',
    superpower: 'Resilience. Having survived economic collapse and world war, this generation\'s default mode is quiet perseverance. They do not panic; they endure.',
    famousMembers: ['Audrey Hepburn', 'Martin Luther King Jr.', 'Marilyn Monroe', 'Neil Armstrong', 'Clint Eastwood', 'Sidney Poitier'],
  },
  'Baby Boomer': {
    emoji: '📺',
    worldEvents: ['Moon landing (1969)', 'Vietnam War', 'Civil Rights Movement', 'Assassination of JFK and MLK', 'Woodstock and counterculture'],
    technology: 'Witnessed the dawn of the personal computer, the birth of the internet, and the explosion of cable television. Many became early adopters of email and mobile phones in middle age.',
    culture: 'Rock and roll, civil rights, and radical optimism. Boomers came of age believing they could change the world — many did. They invented youth culture as a force and never entirely grew out of it.',
    work: 'Hard work and long hours were the path to success. Boomers largely built the 9-to-5 work culture, the corner office aspiration, and the company loyalty model — even as they began questioning it.',
    superpower: 'Drive. Boomers are among the most competitive and achievement-oriented cohorts in history. Their ambition rebuilt post-war economies and produced some of the most impactful careers of the 20th century.',
    famousMembers: ['Steve Jobs', 'Bill Gates', 'Barack Obama', 'Oprah Winfrey', 'Meryl Streep', 'Bruce Springsteen'],
  },
  'Generation X': {
    emoji: '📼',
    worldEvents: ['Fall of the Berlin Wall', 'AIDS epidemic', 'Gulf War', 'End of the Cold War', 'Rise of MTV'],
    technology: 'The original digital immigrants. Grew up with Atari and VCRs, graduated into the internet age, and built or shaped many of the tech companies that define the modern world.',
    culture: 'Grunge, hip-hop, and cynicism as an art form. Gen X was the first generation to be called "slackers" — a label they wore as a badge of independence. They distrusted institutions before it was fashionable.',
    work: 'Gen X bridged the loyalty era and the gig economy. They were the first to job-hop strategically, and the first to balance work-life boundaries as a conscious choice rather than a luxury.',
    superpower: 'Adaptability. Gen X has reinvented themselves multiple times — analogue to digital, corporate to entrepreneurial, employee to founder. No generation has navigated more paradigm shifts with less fanfare.',
    famousMembers: ['Elon Musk', 'Jeff Bezos', 'Jay-Z', 'Sheryl Sandberg', 'Tiger Woods', 'Keanu Reeves'],
  },
  'Millennial': {
    emoji: '💻',
    worldEvents: ['9/11', 'The 2008 Financial Crisis', 'Rise of social media', 'Global War on Terror', 'Obama presidency'],
    technology: 'The first digital natives. Millennials built the social internet, invented the app economy, and normalised smartphones as extensions of the self. They were the first to experience always-on connectivity.',
    culture: 'Harry Potter, Y2K anxiety, reality TV, and the permanent connectivity of social media. Millennials grew up expecting the world to be more equal and more connected — and spent much of adulthood reckoning with the gap.',
    work: 'Purpose over paycheck. Millennials drove the rise of remote work, side hustles, and the demand for meaningful employment. They were also the first generation to enter the workforce during a global financial collapse.',
    superpower: 'Collaboration. Millennials are the most educated and networked generation in history. Their instinct to share, connect, and co-create has driven some of the most significant cultural and technological shifts of the last two decades.',
    famousMembers: ['Mark Zuckerberg', 'Malala Yousafzai', 'Adele', 'LeBron James', 'Emma Watson', 'Lin-Manuel Miranda'],
  },
  'Generation Z': {
    emoji: '📱',
    worldEvents: ['COVID-19 pandemic', 'Climate crisis awareness', 'Black Lives Matter movement', 'Rise of AI', 'Social media as politics'],
    technology: 'True digital natives — born into smartphones, social algorithms, and streaming. Gen Z treats technology as invisible infrastructure rather than a novelty. They are the first generation where the internet was always already there.',
    culture: 'TikTok, mental health awareness, fluid identity, and radical pragmatism. Gen Z has the most nuanced and intersectional understanding of identity of any prior generation — and the least patience for inauthenticity.',
    work: 'Entrepreneurial and non-linear. Gen Z entered a post-pandemic labour market and chose agency over security. Creator economy, freelancing, and multiple income streams are the default, not the exception.',
    superpower: 'Authenticity. Gen Z has a finely tuned radar for what is genuine versus performative — and they reward the former with loyalty while dismissing the latter instantly. In a world of noise, they cut through it.',
    famousMembers: ['Billie Eilish', 'Greta Thunberg', 'Timothée Chalamet', 'Olivia Rodrigo', 'Simone Biles', 'Zendaya'],
  },
  'Generation Alpha': {
    emoji: '🤖',
    worldEvents: ['COVID-19 childhood', 'Rise of generative AI', 'Climate crisis as lived reality', 'Remote learning', 'Mars exploration era begins'],
    technology: 'Born into AI, voice assistants, and augmented reality. For Generation Alpha, ChatGPT is not a revolution — it is just another tool, like a calculator or a search engine. They will be the first to grow up with AI tutors from childhood.',
    culture: 'Roblox, YouTube Shorts, and a world where digital and physical reality are indistinguishable. Gen Alpha\'s play, friendships, and identity formation happen as much in virtual worlds as in physical ones.',
    work: 'The jobs Gen Alpha will do largely do not exist yet. They are being raised for a world of accelerating automation, climate adaptation, and human-AI collaboration. Creativity and emotional intelligence will be their most valuable skills.',
    superpower: 'Imagination. Growing up when the boundary between what is possible and impossible is dissolving daily, Generation Alpha approaches the world with an openness to entirely new realities that no prior generation has had from birth.',
    famousMembers: ['Blue Ivy Carter', 'North West', 'Ryan Kaji (Ryan\'s World)', 'Archie Harrison Mountbatten-Windsor'],
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

// ── Error boundary ─────────────────────────────────────────────────────────────

class ReportBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[BirthdayReport] render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong loading this report</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            {(this.state.error as Error).message}
          </p>
          <Link to="/birthday-report" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl">
            Create a New Report
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

const ReportView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeZodiacTab, setActiveZodiacTab] = useState('western');
  const [liveCelebrities, setLiveCelebrities] = useState<any[] | null>(null);

  const reportPrintRef = useRef<HTMLDivElement>(null);
  const handleDownloadReport = useReactToPrint({
    contentRef: reportPrintRef,
    documentTitle: `Birthday Report — BornClock`,
    pageStyle: `
      @page {
        margin: 0;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-size: 12px;
        line-height: 1.5;
        font-variant-ligatures: none;
        font-feature-settings: "liga" 0, "clig" 0;
      }
      .zodiac-tab-panel {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
      }
      .report-print-table { width: 100%; border-collapse: collapse; }
      .report-print-cell          { padding: 0 1.5cm; }
      thead .report-print-cell    { padding-top: 1.5cm; }
      tfoot .report-print-cell    { padding-bottom: 1.5cm; }
      .report-running-header {
        display: flex !important;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--hairline);
        padding: 9px 0;
        font-size: 9px;
        letter-spacing: .16em;
        text-transform: uppercase;
        color: var(--muted);
        background: white;
      }
      thead .report-print-cell .report-running-header { display: flex !important; }
      .report-cover-section {
        padding: 1.5cm !important;
        break-after: page;
        display: flex;
        flex-direction: column;
        min-height: 297mm;
        box-sizing: border-box;
      }
      .report-print-footer {
        display: flex !important;
        align-items: center;
        justify-content: center;
        padding: 8px 0;
        border-top: 1px solid var(--hairline);
        font-size: 9px;
        color: var(--muted);
        letter-spacing: 0.3px;
        background: #fff;
      }
      .print-break-before { break-before: page; }
      .report-section h2, .report-section h3 { break-after: avoid; }
    `,
  });

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getReport(slug).then(data => {
      if (!data) setNotFound(true);
      else setRow(data);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!row?.report_data?.recipientDob) return;
    const dob = new Date((row.report_data as any).recipientDob + 'T12:00:00');
    const mm = String(dob.getMonth() + 1).padStart(2, '0');
    const dd = String(dob.getDate()).padStart(2, '0');
    getRankedBirthdayCelebrities(`${mm}-${dd}`, null, 6)
      .then(results => { if (results?.length) setLiveCelebrities(results); })
      .catch(() => {});
  }, [row]);

  if (loading) return <LoadingScreen />;
  if (notFound || !row || !row.report_data) return <ExpiryPage />;

  const rd: BirthdayReportData = row.report_data;
  const {
    recipientName: recipientNameRaw, gifterName, personalMessage, celebrities, historicalEvents,
    westernZodiac, chineseZodiac, vedicRashi, zodiacComparison, compatibility,
    lifePathNumber, lifePathData, personalYear2026, personalYearMeaning,
    birthstone, generation, planetaryAges, planetaryFacts,
    age, daysSinceBirth, daysUntilNextBirthday, nextBirthdayDate, dayOfWeekBorn,
  } = rd;
  const recipientName = (recipientNameRaw || '').replace(/\b\w/g, c => c.toUpperCase());

  const lpData = getLifePath(Number(lifePathNumber || 1));

  const dob = new Date(rd.recipientDob + 'T12:00:00');
  const monthName = dob.toLocaleString('default', { month: 'long' });

  const reportMonth = dob.getMonth() + 1;
  const reportDay = dob.getDate();
  const celebsSource = (liveCelebrities ?? celebrities ?? []) as any[];
  const celebSource = liveCelebrities != null ? 'live' : 'frozen';
  const reportUrl = `${window.location.origin}/report/${slug}`;

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
    <div ref={reportPrintRef} id="birthday-report-print" className="min-h-screen bg-white">
      <Helmet>
        <title>{recipientName}'s Birthday Report | BornClock</title>
        <meta name="description" content={`${recipientName}'s Birthday Blueprint — celebrity twins, zodiac, numerology, birthstone, tarot, and more. A personalised gift from BornClock.`} />
        <meta name="robots" content="noindex" />
        <style>{`
          :root {
            --ink:#0C1A2B; --ink-soft:#3A4A5A; --muted:#6B7A89;
            --hairline:#D7E1EA; --panel:#F1F6FA; --panel-2:#FAFCFE; --paper:#FFFFFF;
            --navy:#103A5C; --blue:#1E6FB8;
            --gold:#B8862F; --gold-soft:#F5EAD2; --gold-tint:#FBF6EA;
            --dark:#0C1A2B;
          }
          .bb-eyebrow { font-size:10.5px; letter-spacing:.22em; text-transform:uppercase; font-weight:700; color:var(--gold); }
          .bb-h2 { font-size:22px; font-weight:700; color:var(--navy); letter-spacing:-.01em; margin:4px 0 0; }
          .bb-sub { font-size:12.5px; color:var(--muted); margin:5px 0 0; }
          .bb-rule { height:1px; background:var(--hairline); margin-bottom:11px; }
          .bb-code { float:right; font-size:10px; letter-spacing:.18em; color:#9DB0BF; font-weight:600; }
          .bb-chip { display:inline-block; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid var(--hairline); color:var(--ink-soft); background:var(--panel-2); }
          .bb-chip.gold { border-color:var(--gold-soft); color:var(--gold); background:var(--gold-tint); }
          .bb-num { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-feature-settings:"tnum" 1, "liga" 0, "calt" 0; letter-spacing:-.01em; }
          @media print {
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-variant-ligatures: none; }
            .print-expand { max-height: none !important; overflow: visible !important; }
            .dark-section { background: var(--dark) !important; color-scheme: dark; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            h2, h3 { page-break-after: avoid; }
            .dark-section { page-break-inside: avoid; }
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
              onClick={handleDownloadReport}
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
      <div className="report-cover-section report-section bg-white px-4 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Top lockup row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <img src="/bornclock-logo.png" alt="BornClock" style={{ height: '40px', width: 'auto' }} />
              <div>
                <div className="font-black text-sm" style={{ color: 'var(--navy)' }}>BornClock</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Know your time. Live it well.</div>
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
                Birthday Blueprint
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>bornclock.com</div>
            </div>
          </div>

          {/* 2px navy rule */}
          <div style={{ height: '2px', background: 'var(--navy)', marginBottom: '28px' }} />

          {/* Gold eyebrow + name */}
          <div className="mb-2">
            <div className="bb-eyebrow mb-2">A Birthday Blueprint for</div>
            <h1 className="font-black leading-none" style={{ fontSize: '42px', color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              {recipientName}
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Born on a {dayOfWeekBorn} · {dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Personal message */}
          {personalMessage && (
            <blockquote className="my-5 px-5 py-4 text-sm italic leading-relaxed" style={{ borderLeft: '3px solid var(--gold)', background: 'var(--gold-tint)', borderRadius: '0 8px 8px 0', color: 'var(--ink-soft)' }}>
              "{personalMessage}"
              {gifterName && (
                <footer className="mt-2 not-italic text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                  — A gift from {gifterName}
                </footer>
              )}
            </blockquote>
          )}

          {/* Vitals strip — 4 hairline-divided cells */}
          <div className="mt-6 grid grid-cols-4" style={{ border: '1px solid var(--hairline)', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { label: 'Years Old',          value: String(age),                                feature: true  },
              { label: 'Days Lived',         value: fmt(daysSinceBirth),                        feature: false },
              { label: 'Born on a',          value: dayOfWeekBorn || '—',                       feature: false },
              { label: 'Next Birthday',      value: (nextBirthdayDate || '').replace(/,.*/, ''), feature: false },
            ].map((stat, i) => (
              <div key={stat.label} className="px-4 py-3 text-center bb-num" style={{ borderLeft: i > 0 ? '1px solid var(--hairline)' : undefined, background: 'var(--panel-2)' }}>
                <div className="text-lg font-black" style={{ color: stat.feature ? 'var(--gold)' : 'var(--navy)' }}>{stat.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative cover fill — gold rules + tagline in lower portion of A4 page */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          width: '100%',
          paddingBottom: '1cm',
        }}>
          <div style={{ width: '38%', height: '1px', backgroundColor: 'var(--gold)', opacity: 0.6 }} />
          <p style={{
            fontStyle: 'italic',
            fontSize: '13px',
            color: 'var(--muted)',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: '340px',
            letterSpacing: '0.01em',
          }}>
            Every detail of the moment you arrived tells a story.
          </p>
          <div style={{ width: '38%', height: '1px', backgroundColor: 'var(--gold)', opacity: 0.6 }} />
        </div>
      </div>

      <table className="report-print-table"><thead><tr><td className="report-print-cell">
      {/* ── Print running header — appears from page 2 onward ───────────── */}
      <div className="print-only report-running-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <img src="/bornclock-logo.png" alt="" style={{ height: '13px', width: 'auto', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          BornClock Birthday Blueprint
        </span>
        <span style={{ fontWeight: 700 }}>{recipientName}</span>
      </div>
      </td></tr></thead><tbody><tr><td className="report-print-cell">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — CELEBRITY TWINS + HISTORICAL EVENTS                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="report-section py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="bb-rule"><span className="bb-code">01 · TWINS</span></div>
            <div className="bb-eyebrow">Born the Same Day</div>
            <h2 className="bb-h2">Celebrity Birthday Twins</h2>
            <p className="bb-sub">Famous people born on {monthName} {dob.getDate()}, ranked by global recognition</p>
          </div>

          {/* invisible source marker — extracted by pdfjs; asserted in verify-print */}
          <span data-celeb-source={celebSource} aria-hidden="true" style={{ fontSize: '1px', color: 'white', lineHeight: 1, userSelect: 'none' }}>{celebSource === 'live' ? '·LIVE·' : '·FROZEN·'}</span>

          {celebsSource.length > 0 ? (() => {
            const getCelebYear = (c: any): number =>
              c.birth_year ?? (c.birthDate ? new Date(c.birthDate + 'T12:00:00').getFullYear() : 0);
            const sortedCelebrities = [...celebsSource].sort((a: any, b: any) => {
              if (a.nationalityCode === 'IN' && b.nationalityCode !== 'IN') return -1;
              if (b.nationalityCode === 'IN' && a.nationalityCode !== 'IN') return 1;
              const yearA = getCelebYear(a);
              const yearB = getCelebYear(b);
              if (yearA >= 1940 && yearB < 1940) return -1;
              if (yearB >= 1940 && yearA < 1940) return 1;
              if (yearA >= 1900 && yearB < 1900) return -1;
              if (yearB >= 1900 && yearA < 1900) return 1;
              return yearB - yearA;
            });
            return (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {sortedCelebrities.slice(0, 6).map((c: any, i: number) => {
                const year = getCelebYear(c) || null;
                const desc = (c.known_for || c.occupation || '').toLowerCase();
                const occ = (c.occupation || c.known_for || (c as any).profession || '').toLowerCase();
                const catIcon = occ.includes('actor') || occ.includes('actress') || occ.includes('film') || occ.includes('bollywood') ? '🎬' :
                  occ.includes('music') || occ.includes('singer') || occ.includes('song') || occ.includes('band') || occ.includes('rapper') ? '🎵' :
                  occ.includes('athlete') || occ.includes('player') || occ.includes('sport') || occ.includes('tennis') || occ.includes('cricket') || occ.includes('football') || occ.includes('basketball') ? '⚽' :
                  occ.includes('politic') || occ.includes('president') || occ.includes('minister') || occ.includes('freedom') ? '🏛️' :
                  occ.includes('scientist') || occ.includes('physicist') || occ.includes('inventor') || occ.includes('mathematician') ? '🔬' : '★';
                const catLabel = occ.includes('actor') || occ.includes('actress') || occ.includes('film') || occ.includes('bollywood') ? 'Actor/Director' :
                  occ.includes('music') || occ.includes('singer') || occ.includes('song') || occ.includes('band') || occ.includes('rapper') ? 'Musician' :
                  occ.includes('athlete') || occ.includes('player') || occ.includes('sport') || occ.includes('tennis') || occ.includes('cricket') || occ.includes('football') || occ.includes('basketball') ? 'Athlete' :
                  occ.includes('politic') || occ.includes('president') || occ.includes('minister') || occ.includes('freedom') ? 'Politician' :
                  occ.includes('scientist') || occ.includes('physicist') || occ.includes('inventor') || occ.includes('mathematician') ? 'Scientist' : null;
                const isDeceased = c.death_year != null || c.deathDate != null || c.isLiving === false;
                const hook = c.knownFor ?? c.known_for ?? null;
                const descriptor = c.occupation ?? (c as any).profession ?? null;
                return (
                  <div key={i} className="border rounded-2xl p-5 hover:shadow-md transition-shadow bg-white border-gray-100" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-3xl">{catIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm leading-tight">{c.name}</div>
                        <div className="text-xs mt-0.5 bb-num" style={{ color: 'var(--muted)' }}>
                          {year ? `b. ${year}${isDeceased ? ' †' : ''}` : ''}
                          {descriptor ? <span style={{ color: 'var(--ink-soft)' }}>{year ? '  ·  ' : ''}{descriptor}</span> : null}
                        </div>
                      </div>
                    </div>
                    {hook && (
                      <div className="text-xs text-gray-500 leading-snug mb-2"
                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {hook}
                      </div>
                    )}
                    {(c.nationalityCode === 'IN' || (c as any).nationality_code === 'IN') && (
                      <span className="text-[10px] text-orange-500 font-medium">🇮🇳 Indian</span>
                    )}
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

          <p className="text-[10px] text-gray-400 text-right mt-2 mb-6">Biographical details from Wikipedia.</p>

          {/* Historical Events */}
          {historicalEvents.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">📜 Historical Events on This Day</h3>
              <div className="space-y-4">
                {historicalEvents.map((evt: { year: number; event: string }, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-sm font-black bb-num" style={{ color: 'var(--gold)' }}>{evt.year}</span>
                    </div>
                    <div className="flex-1 pl-4 pb-4" style={{ borderLeft: '2px solid var(--gold-soft)' }}>
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
      <div className="report-section py-12 px-4" style={{ background: 'var(--panel)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="bb-rule"><span className="bb-code">02 · ASTROLOGY</span></div>
            <div className="bb-eyebrow">Three Traditions</div>
            <h2 className="bb-h2">Zodiac Profile</h2>
            <p className="bb-sub">Western, Chinese &amp; Vedic — one person, three lenses</p>
          </div>

          {/* 3-card summary strip — click to switch tab */}
          <div className="grid md:grid-cols-3 print:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Western Zodiac', value: westernZodiac?.name ?? '—', sub: westernZodiac?.element ?? '', icon: westernZodiac?.unicode ?? '♈︎', tab: 'western' },
              { label: 'Chinese Zodiac', value: `${chineseZodiac?.animal ?? '—'} ${chineseZodiac?.emoji ?? ''}`, sub: `${chineseZodiac?.element ?? ''} ${chineseZodiac?.yin_yang ?? ''}`, icon: '', tab: 'chinese' },
              { label: 'Vedic Rashi', value: vedicRashi?.name ?? '—', sub: vedicRashi?.english ?? '', icon: vedicRashi?.symbol ?? '', tab: 'vedic' },
            ].map(card => (
              <button
                key={card.label}
                onClick={() => setActiveZodiacTab(card.tab)}
                className={`bg-white rounded-xl p-3 shadow-sm text-center w-full transition-all ${activeZodiacTab === card.tab ? 'shadow-md' : 'hover:shadow-md'}`} style={activeZodiacTab === card.tab ? { outline: '2px solid #B8862F', outlineOffset: '0px' } : undefined}
              >
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-tight">{card.label}</div>
                <div className="font-black text-gray-900 text-base">{card.value}</div>
                <div className="text-xs text-gray-500">{card.sub}</div>
              </button>
            ))}
          </div>

          {/* Tabs deep dive */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className={`space-y-4 print-expand ${activeZodiacTab === 'western' ? '' : 'hidden'} print:block`}>
              <div className="hidden print:block mb-3 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--navy)' }}>{'♈︎'} Western Zodiac</span>
              </div>
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
                    {westernZodiac.element && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{westernZodiac.element}</span>}
                    {westernZodiac.modality && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">⚡ {westernZodiac.modality}</span>}
                    {westernZodiac.rulingPlanet && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#F5EAD2', color: '#B8862F' }}>🪐 {westernZodiac.rulingPlanet}</span>}
                  </div>
                  <div className="space-y-3">
                    {westernZodiac.fullDescription
                      .split(/(?<=\.)\s+(?=[A-Z])/)
                      .reduce((acc: string[], sentence: string, i: number) => {
                        const paraIdx = Math.floor(i / 3);
                        if (!acc[paraIdx]) acc[paraIdx] = '';
                        acc[paraIdx] += (acc[paraIdx] ? ' ' : '') + sentence;
                        return acc;
                      }, [])
                      .map((para: string, i: number) => (
                        <p key={i} className="text-gray-700 text-sm leading-relaxed">{para}</p>
                      ))
                    }
                  </div>
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
                      <p className="text-sm text-gray-600">{((westernZodiac as any).famousPeople ?? []).map((p: any) => p.name || p).join(' · ')}</p>
                    </div>
                  )}
                  {/* Top compatible signs (rich, with score + reason) */}
                  {(() => {
                    const topMatches = getTopCompatibleSigns(westernZodiac.name);
                    if (!topMatches.length) return null;
                    return (
                      <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Compatible Signs</div>
                        <div className="grid grid-cols-3 gap-3">
                          {topMatches.slice(0, 3).map(({ sign, score, reason }) => (
                            <Link key={sign} to={`/compatibility/${westernZodiac.name.toLowerCase()}/${sign.toLowerCase()}`}
                              className="rounded-xl p-3 text-center transition-colors no-print-link" style={{ border: '1px solid var(--hairline)', background: 'var(--panel)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-soft)'; (e.currentTarget as HTMLElement).style.background = 'var(--gold-tint)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline)'; (e.currentTarget as HTMLElement).style.background = 'var(--panel)'; }}>
                              <div className="text-2xl mb-1">
                                {{'Aries':'♈︎','Taurus':'♉︎','Gemini':'♊︎','Cancer':'♋︎','Leo':'♌︎','Virgo':'♍︎','Libra':'♎︎','Scorpio':'♏︎','Sagittarius':'♐︎','Capricorn':'♑︎','Aquarius':'♒︎','Pisces':'♓︎'}[sign] || '★'}
                              </div>
                              <div className="font-bold text-sm" style={{ color: 'var(--navy)' }}>{sign}</div>
                              <div className="text-xs font-semibold bb-num" style={{ color: 'var(--gold)' }}>{score}%</div>
                              <div className="text-xs mt-1 leading-tight" style={{ color: 'var(--muted)' }}>{reason}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </div>

            <div className={`space-y-4 print-expand ${activeZodiacTab === 'chinese' ? '' : 'hidden'} print:block print:mt-8 print:pt-6 print:border-t print:border-gray-200`}>
              <div className="hidden print:block mb-3 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--navy)' }}>🐉 Chinese Zodiac</span>
              </div>
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
                    {chineseZodiac.yin_yang && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#F5EAD2', color: '#B8862F' }}>{chineseZodiac.yin_yang}</span>}
                    {czd && <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">{czd.years}</span>}
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
                    <div className="rounded-xl p-4" style={{ background: 'var(--gold-tint)', border: '1px solid var(--gold-soft)' }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>❤️ Love &amp; Relationships</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{czd.loveStyle}</p>
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
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Career Paths</div>
                      <p className="text-sm text-blue-900">{czd.careerPaths.join(' · ')}</p>
                    </div>
                  )}
                  {(czd?.famousPeople ?? chineseZodiac.famous ?? []).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Famous {chineseZodiac.animal}s</div>
                      <p className="text-sm text-gray-600">{(czd?.famousPeople ?? chineseZodiac.famous ?? []).map((p: any) => p.name || p).join(' · ')}</p>
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
            </div>

            <div className={`space-y-4 print-expand ${activeZodiacTab === 'vedic' ? '' : 'hidden'} print:block print:mt-8 print:pt-6 print:border-t print:border-gray-200`}>
              <div className="hidden print:block mb-3 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--navy)' }}>{'🕉︎'} Vedic Rashi</span>
              </div>
              {vedicRashi ? (() => {
                const vedicCtx = getVedicContext(dob.getMonth() + 1, dob.getDate(), vedicRashi.english ?? westernZodiac?.name ?? 'Aries');
                const rashiRatna = RASHI_RATNA_DATA.find(r => r.rashiEnglish === vedicRashi.name);
                const rashiEntry = getRashi(vedicRashi.name) || getRashi(vedicRashi.english);
                const richRashiEssence = getRashiEssence(vedicRashi.name) || getRashiEssence(vedicRashi.english);
                return (
                <>
                  <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-5xl">{vedicRashi.symbol}</span>
                    <div>
                      <h3 className="font-black text-2xl text-gray-900">{vedicRashi.name}</h3>
                      <p className="text-sm text-gray-400">{vedicRashi.english} · Ruled by {vedicRashi.ruling_planet}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {vedicRashi.element && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{vedicRashi.element}</span>}
                    {vedicRashi.ruling_planet && <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#F5EAD2', color: '#B8862F' }}>🪐 {vedicRashi.ruling_planet}</span>}
                    {vedicCtx.rashiSanskrit && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{'🕉︎'} {vedicCtx.rashiSanskrit} — {vedicCtx.rashiMeaning}</span>}
                  </div>
                  </div>
                  {/* Rich essence (multi-paragraph from rashiEssence.ts, fallback to rashiData.ts) */}
                  {richRashiEssence ? (
                    <div className="space-y-3 mb-3">
                      {richRashiEssence.split('\n\n').map((para, i) => (
                        <p key={i} className="text-gray-700 text-sm leading-relaxed">{para}</p>
                      ))}
                    </div>
                  ) : rashiEntry ? (
                    <div className="space-y-3 mb-3">
                      {rashiEntry.essence.split('\n\n').map((para, i) => (
                        <p key={i} className="text-gray-700 text-sm leading-relaxed">{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">{vedicRashi.description}</p>
                  )}
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
                          <span key={t} className="bb-chip">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rich life domains from rashiData */}
                  {rashiEntry && (
                    <div className="grid sm:grid-cols-3 gap-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      {[
                        { label: 'Career', text: rashiEntry.career },
                        { label: 'Relationships', text: rashiEntry.relationships },
                        { label: 'Spiritual', text: rashiEntry.spiritual },
                      ].map(({ label, text }) => (
                        <div key={label} className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                          <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--navy)' }}>{label}</div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Favorable attributes */}
                  {rashiEntry && (rashiEntry.favorableColors.length > 0 || rashiEntry.favorableNumbers.length > 0) && (
                    <div className="rounded-xl px-4 py-3" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)' }}>
                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--ink-soft)' }}>
                        {rashiEntry.favorableColors.length > 0 && (
                          <span><span className="font-semibold" style={{ color: 'var(--navy)' }}>Colors:</span> {rashiEntry.favorableColors.join(', ')}</span>
                        )}
                        {rashiEntry.favorableNumbers.length > 0 && (
                          <span><span className="font-semibold" style={{ color: 'var(--navy)' }}>Numbers:</span> {rashiEntry.favorableNumbers.join(', ')}</span>
                        )}
                        {rashiEntry.gemstone && (
                          <span><span className="font-semibold" style={{ color: 'var(--navy)' }}>Gemstone:</span> {rashiEntry.gemstone}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rashi Ratna (Vedic gemstone) */}
                  {rashiRatna && (
                    <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--gold-tint)', border: '1px solid var(--gold-soft)' }}>
                      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>Rashi Ratna — Vedic Birthstone</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: rashiRatna.hex }} />
                        <div>
                          <div className="font-black" style={{ color: 'var(--navy)' }}>{rashiRatna.primaryStone} ({rashiRatna.primaryStoneHindi})</div>
                          <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>Alt: {rashiRatna.secondaryStone} · Metal: {rashiRatna.metalToUse}</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{rashiRatna.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {rashiRatna.benefits.slice(0, 4).map(b => (
                          <span key={b} className="bb-chip">{b}</span>
                        ))}
                      </div>
                      <div className="text-xs italic" style={{ color: 'var(--muted)' }}>Wear on {rashiRatna.wearingDay} · {rashiRatna.fingerToWear}</div>
                    </div>
                  )}
                </>
                );
              })() : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </div>
          </div>

          {/* ── Moon Sign & Nakshatra (consolidated into §2 ASTROLOGY) ──────── */}
          {(() => {
            const moonResult = calculateMoonSignAndNakshatra(dob);
            const richNakshatra = getNakshatra(moonResult.nakshatraNumber);
            const richNakshatraEssence = getNakshatraEssence(moonResult.nakshatraNumber);
            const richMoonEssence = getMoonSignEssence(moonResult.moonSign);
            return (
              <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--hairline)' }}>
                <div className="mb-6">
                  <div className="bb-eyebrow">Vedic Astrology</div>
                  <h2 className="bb-h2">Moon Sign &amp; Nakshatra</h2>
                  <p className="bb-sub">Where the Moon resided at the moment of birth</p>
                </div>

                {/* Moon sign explainer */}
                <div className="rounded-xl p-4 mb-4 text-xs leading-relaxed" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)', color: 'var(--ink-soft)' }}>
                  <strong style={{ color: 'var(--navy)' }}>What is a Moon Sign?</strong>{' '}{MOON_SIGN_EXPLAINER.whatIsIt}{' '}{MOON_SIGN_EXPLAINER.whyMoon}
                </div>

                {/* Moon sign identity */}
                <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)' }}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl">{moonResult.moonSignData.symbol}</div>
                    <div>
                      <p className="font-black text-xl" style={{ color: 'var(--navy)' }}>{moonResult.moonSign} Moon</p>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{moonResult.moonSignData.element} · Ruled by {moonResult.moonSignData.rulingPlanet}</p>
                    </div>
                  </div>
                  {richMoonEssence ? (
                    <div className="space-y-3">
                      {richMoonEssence.split('\n\n').map((para, i) => (
                        <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{moonResult.moonSignData.personality}</p>
                  )}
                </div>

                {/* Nakshatra identity */}
                <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--gold-tint)', border: '1px solid var(--gold-soft)' }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--gold)' }}>Birth Nakshatra #{moonResult.nakshatraNumber}</div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl">{richNakshatra.symbol}</div>
                    <div>
                      <p className="font-black text-xl" style={{ color: 'var(--navy)' }}>{richNakshatra.name}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{richNakshatra.meaning} · {richNakshatra.deity}</p>
                    </div>
                  </div>
                  {richNakshatraEssence ? (
                    richNakshatraEssence.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--ink)' }}>{para}</p>
                    ))
                  ) : (
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--ink)' }}>{richNakshatra.essence}</p>
                  )}
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--gold-soft)' }}>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                      <span className="font-semibold" style={{ color: 'var(--navy)' }}>Shakti:</span> {richNakshatra.shakti}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                      <span className="font-semibold" style={{ color: 'var(--navy)' }}>Ruler:</span> {richNakshatra.ruler} &nbsp;·&nbsp; <span className="font-semibold" style={{ color: 'var(--navy)' }}>Gemstone:</span> {richNakshatra.gemstone}
                    </p>
                  </div>
                </div>

                {/* Nakshatra life domains */}
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Career', text: richNakshatra.career },
                    { label: 'Relationships', text: richNakshatra.relationships },
                    { label: 'Spiritual', text: richNakshatra.spiritual },
                  ].map(({ label, text }) => (
                    <div key={label} className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>{label}</div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{text}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs italic text-center mb-4" style={{ color: 'var(--muted)' }}>Nakshatra approximated from lunar cycle position at date of birth.</p>
                <div className="text-center no-print">
                  <Link to="/moon-sign" className="text-xs underline" style={{ color: 'var(--navy)' }}>
                    Full moon sign interpretation →
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — NUMEROLOGY BLUEPRINT                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="report-section print-break-before py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="bb-rule"><span className="bb-code">03 · NUMBERS</span></div>
            <div className="bb-eyebrow">Your Numerology Blueprint</div>
            <h2 className="bb-h2">Numbers &amp; Life Path</h2>
            <p className="bb-sub">Calculated from the exact date of birth</p>
          </div>

          {/* Numerology intro */}
          <div className="mb-8 p-5 bg-[#F1F6FA] border border-[#D7E1EA] rounded-lg">
            <p className="text-sm font-semibold tracking-widest text-[#B8862F] uppercase mb-2">What Is Numerology?</p>
            <p className="text-[#3A4A5A] text-sm leading-relaxed mb-3">
              Numerology is the ancient study of the relationship between numbers and life events. Its modern form — Pythagorean numerology — reduces names and birth dates to single digits (or the master numbers 11, 22, 33) and reads the vibrational meaning of each. Every number in your chart reveals a different dimension of who you are.
            </p>
            <div className="grid grid-cols-1 gap-3 mt-4 text-xs text-[#3A4A5A]">
              <div className="flex gap-3"><span className="font-bold text-[#103A5C] min-w-[110px]">Life Path</span><span>Your core life purpose. Reduce the full birth date to one digit — e.g. 25 Jun 1966 → 2+5+6+1+9+6+6 = 35 → 3+5 = <strong>8</strong>. Master numbers (11, 22, 33) are kept, not reduced.</span></div>
              <div className="flex gap-3"><span className="font-bold text-[#103A5C] min-w-[110px]">Soul Urge</span><span>Your heart's deepest desire. Built from the <em>vowels</em> of your full birth name (A=1, E=5, I=9, O=6, U=3).</span></div>
              <div className="flex gap-3"><span className="font-bold text-[#103A5C] min-w-[110px]">Personality</span><span>How others perceive you. Built from the <em>consonants</em> of your birth name on the same Pythagorean table.</span></div>
              <div className="flex gap-3"><span className="font-bold text-[#103A5C] min-w-[110px]">Personal Year</span><span>Your current annual cycle. Add birth month + birth day + this calendar year, reduce to a digit. Resets each birthday.</span></div>
            </div>
          </div>

          {/* Life path number */}
          <div className="text-center mb-8">
            <div className="bb-num font-black leading-none mb-2" style={{ fontSize: '96px', color: 'var(--gold)' }}>{lifePathNumber}</div>
            <div className="text-xl font-bold text-gray-900">{lpData.archetype}</div>
            <div className="text-gray-500 text-sm mt-1">{lpData.keywords.slice(0, 3).join(' · ')}</div>
          </div>

          {/* 2-number summary grid (date-derived only; Soul Urge moved to §9 NAME) */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { label: 'Life Path', value: lifePathNumber, gold: true,  desc: 'Your core life purpose' },
              { label: 'Personal Year', value: personalYear2026 ?? '—', gold: false, desc: 'Your 2026 energy' },
            ].map(({ label, value, gold, desc }) => (
              <div key={label} className="rounded-xl p-4 text-center bb-num" style={{ background: gold ? 'var(--gold-tint)' : 'var(--panel)', border: `1px solid ${gold ? 'var(--gold-soft)' : 'var(--hairline)'}` }}>
                <div className="text-3xl font-black mb-1" style={{ color: gold ? 'var(--gold)' : 'var(--navy)' }}>{value}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>{label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Personality</h3>
              <div className="space-y-3">
                {lpData.personality.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-700 text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className="bg-green-50 rounded-2xl p-5">
                <h3 className="font-bold text-green-800 mb-2 text-sm">Strengths</h3>
                <ul className="space-y-1">
                  {lpData.strengths.slice(0, 4).map((s: string) => (
                    <li key={s} className="text-xs text-green-700">✓ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-2xl p-5">
                <h3 className="font-bold text-amber-800 mb-2 text-sm">Growth Areas</h3>
                <ul className="space-y-1">
                  {lpData.growthAreas.slice(0, 4).map((s: string) => (
                    <li key={s} className="text-xs text-amber-700">→ {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

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
                    <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>❤️ Love &amp; Relationships</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{pyc.love}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">Career &amp; Money</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{pyc.career}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold text-green-500 uppercase tracking-wide mb-1">🌿 Health &amp; Energy</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{pyc.health}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--navy)' }}>Key Months</div>
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

      {/* ── Name Numerology ───────────────────────────────────────────────── */}
      {(() => {
        const nums = calculateAllNameNumbers(recipientName || '');
        const exprMeaning = NAME_NUMBER_MEANINGS[nums.expression];
        const soulUrgeEntry = getSoulUrge(nums.soulUrge);
        const personalityEntry = getPersonality(nums.personality);
        return (
          <div className="py-10 px-4" style={{ background: 'var(--paper)', borderTop: '1px solid var(--hairline)' }}>
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="bb-rule"><span className="bb-code">04 · NAME</span></div>
                <div className="bb-eyebrow">Gematria</div>
                <h2 className="bb-h2">Name Numerology</h2>
                <p className="bb-sub">The numbers encoded in {recipientName}'s name</p>
              </div>

              {/* Gematria explainer */}
              <div className="rounded-xl p-4 mb-5 text-xs leading-relaxed" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)', color: 'var(--ink-soft)' }}>
                {SECTION_EXPLAINERS.gematria.split('\n\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Expression', value: nums.expression, desc: 'Who you are destined to be', gold: true },
                  { label: 'Soul Urge', value: nums.soulUrge, desc: "What your heart desires", gold: false },
                  { label: 'Personality', value: nums.personality, desc: 'How others perceive you', gold: false },
                ].map(({ label, value, desc, gold }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={gold ? { background: 'var(--gold-tint)', border: '1px solid var(--gold-soft)' } : { background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                    <div className="text-3xl font-black mb-1 bb-num" style={{ color: gold ? 'var(--gold)' : 'var(--navy)' }}>{value}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</div>
                  </div>
                ))}
              </div>

              {/* Expression meaning */}
              {exprMeaning && (
                <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--navy)' }}>Expression {nums.expression} — {exprMeaning.title}</p>
                  <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{exprMeaning.expression}</p>
                </div>
              )}

              {/* Soul Urge meaning */}
              {soulUrgeEntry && (
                <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--navy)' }}>Soul Urge {nums.soulUrge} — {soulUrgeEntry.title}</p>
                  {soulUrgeEntry.text.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--ink-soft)' }}>{para}</p>
                  ))}
                </div>
              )}

              {/* Personality meaning */}
              {personalityEntry && (
                <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--navy)' }}>Personality {nums.personality} — {personalityEntry.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{personalityEntry.text}</p>
                </div>
              )}

              <div className="text-center no-print">
                <Link to="/name-numerology" className="text-xs underline" style={{ color: 'var(--navy)' }}>
                  Calculate with full birth name →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Tarot Card ────────────────────────────────────────────────────── */}
      {(() => {
        const lp = Number(lifePathNumber || 1);
        const card = getTarotCardByLifePath(lp);
        return (
          <div className="py-12 px-4" style={{ background: 'var(--dark)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Clinical header */}
              <div className="mb-6">
                <div className="bb-rule" style={{ background: 'rgba(255,255,255,.12)' }}><span className="bb-code" style={{ color: '#9DB0BF' }}>05 · ARCANA</span></div>
                <div className="bb-eyebrow" style={{ color: 'var(--gold)' }}>Major Arcana</div>
                <h2 className="bb-h2" style={{ color: '#FFFFFF' }}>Birthday Tarot Card</h2>
                <p style={{ fontSize: '12.5px', color: '#9DB0BF', marginTop: '5px' }}>Your Life Path {lp} maps to the {card.name} of the Major Arcana</p>
              </div>

              {/* Card identity */}
              <div className="text-center">
                <div className="text-6xl mb-3">{card.emoji}</div>
                <h3 className="text-3xl font-black text-white mb-1">{card.name}</h3>
                <p className="text-xs" style={{ color: '#9DB0BF' }}>Life Path {lp} · Card {card.number}</p>
                <p className="text-xs mt-2 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,.5)' }}>
                  In traditional tarot, your birthday's Life Path number ({lp}) corresponds to a card
                  of the Major Arcana — the 22 cards representing life's greatest themes and forces.
                  This is your card.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {card.keywords.map((kw: string) => (
                    <span key={kw} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)' }}>{kw}</span>
                  ))}
                </div>
              </div>

              {/* Full upright meaning */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.07)', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>Upright Meaning</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.9)' }}>{card.upright}</p>
              </div>

              {/* Deep meaning */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.07)', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>Deep Meaning for Life Path {lp}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.9)' }}>{card.deepMeaning}</p>
              </div>

              {/* 4-quadrant life areas */}
              <div className="grid grid-cols-2 gap-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className="rounded-2xl p-4" style={{ background: '#1A2B3C', border: '1px solid #2A3B4C', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Love</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.8)' }}>{card.love}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#1A2B3C', border: '1px solid #2A3B4C', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Career</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.8)' }}>{card.career}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#1A2B3C', border: '1px solid #2A3B4C', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Health</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.8)' }}>{card.health}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#1A2B3C', border: '1px solid #2A3B4C', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Spirituality</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.8)' }}>{card.spirituality}</p>
                </div>
              </div>

              {/* Affirmation */}
              <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(184,134,47,.15)', border: '1px solid rgba(184,134,47,.3)' }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>Your Daily Affirmation</div>
                <p className="text-white font-medium text-base italic">"{card.affirmation}"</p>
              </div>

              {/* Famous people with this card */}
              {card.famousPeople && card.famousPeople.length > 0 && (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,.05)' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#9DB0BF' }}>Famous {card.name} Personalities</div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,.7)' }}>{card.famousPeople.map((p: any) => p.name || p).join(' · ')}</p>
                </div>
              )}

              <div className="text-center no-print">
                <Link to="/tarot-card-by-birthday" className="text-xs underline" style={{ color: 'var(--gold)' }}>
                  Explore more tarot interpretations →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — COSMIC CONNECTIONS (BIRTHSTONE)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="report-section py-12 px-4" style={{ background: 'var(--gold-tint)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="bb-rule"><span className="bb-code">06 · TALISMAN</span></div>
            <div className="bb-eyebrow">Your Birthstone &amp; Flower</div>
            <h2 className="bb-h2">Cosmic Connections</h2>
            <p className="bb-sub">The gem and flower of {monthName}</p>
          </div>

          {/* Cosmic connections explainer */}
          <div className="rounded-xl p-4 mb-6 text-xs leading-relaxed" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)', color: 'var(--ink-soft)' }}>
            <strong style={{ color: 'var(--navy)' }}>What are Cosmic Connections?</strong>{' '}Every culture has associated the moment of birth with particular gems, flowers, and talismans — objects believed to carry the energy of the time you arrived. This section draws from two traditions: the Western birthstone tradition, which ties a gem to your birth month, and Jyotish Ratna Shastra, the Vedic science of planetary gemstones. Together they offer a material connection to the cosmic signature of your birth.
          </div>

          {birthstone ? (() => {
            const bsMeta = BIRTHSTONE_META[dob.getMonth() + 1] ?? BIRTHSTONE_META[1];
            return (
            <div className="bg-white rounded-xl p-8 space-y-6" style={{ border: '1px solid var(--hairline)' }}>
              {/* Header */}
              <div className="flex flex-col items-center gap-3">
                <GemImage month={dob.getMonth() + 1} size={100} />
                <div className="text-center">
                  <h3 className="text-3xl font-black" style={{ color: 'var(--navy)' }}>{birthstone.primaryStone}</h3>
                  <p className="text-sm font-medium mt-1" style={{ color: bsMeta.hex }}>{bsMeta.color}</p>
                  {birthstone.alternateStones?.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--gold)' }}>Alternate: {birthstone.alternateStones.join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Birth flower */}
              <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: '#FBF6EA', border: '1px solid var(--gold-soft)' }}>
                <span className="text-2xl">🌸</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: '#B8862F' }}>Birth Flower</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{bsMeta.flower}</div>
                </div>
              </div>

              {/* Vedic Birthstone */}
              {(() => {
                const vbs = getVedicBirthstone(dob.getMonth() + 1);
                return (
                  <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                    <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Vedic Ratna — {vbs.stone}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
                      <div><span className="font-semibold" style={{ color: 'var(--navy)' }}>Planet:</span> {vbs.planet}</div>
                      <div><span className="font-semibold" style={{ color: 'var(--navy)' }}>Metal:</span> {vbs.metal}</div>
                      <div><span className="font-semibold" style={{ color: 'var(--navy)' }}>Wear on:</span> {vbs.finger}</div>
                      <div><span className="font-semibold" style={{ color: 'var(--navy)' }}>Best day:</span> {vbs.day}</div>
                    </div>
                    <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--ink-soft)' }}>{vbs.purpose}</p>
                    <p className="text-xs italic" style={{ color: 'var(--muted)' }}>{vbs.note}</p>
                  </div>
                );
              })()}

              {/* ── Jyotish Prescription ── */}
              {(() => {
                const vbs = getVedicBirthstone(dob.getMonth() + 1);
                return (
                  <>
                    {vbs.jyotishRationale && (
                      <div className="rounded-xl p-4" style={{ background: '#F1F6FA', border: '1px solid #D7E1EA' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Jyotish Prescription</div>
                        <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{vbs.jyotishRationale}</p>
                      </div>
                    )}

                    {/* ── Wearing Ritual ── */}
                    {vbs.ritual && (
                      <div className="rounded-xl p-4" style={{ background: '#FBF6EA', border: '1px solid rgba(184,134,47,0.2)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#B8862F' }}>Wearing Ritual — Dharana Vidhi</div>
                        <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{vbs.ritual}</p>
                      </div>
                    )}

                    {/* ── Chandra Beej Mantra ── */}
                    {vbs.mantra && (
                      <div className="rounded-xl p-5 text-center" style={{ background: 'var(--ink)', border: '1px solid rgba(184,134,47,0.3)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--gold)' }}>Chandra Beej Mantra</div>
                        <div className="text-xl font-bold mb-2 leading-relaxed print:hidden" style={{ color: 'var(--gold)', fontFamily: 'inherit' }}>{vbs.mantra.devanagari}</div>
                        <div className="text-sm font-medium mb-1 print:text-base print:font-semibold" style={{ color: '#E8D5A3' }}>{vbs.mantra.transliteration}</div>
                        <div className="text-xs italic" style={{ color: 'rgba(255,255,255,0.5)' }}>Pronunciation: {vbs.mantra.pronunciation}</div>
                        <div className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Chant 108 times at the time of wearing · Repeat 11 times each Monday</div>
                      </div>
                    )}

                    {/* ── Weight & Quality ── */}
                    {vbs.weightAndQuality && (
                      <div className="rounded-xl p-4" style={{ background: '#F1F6FA', border: '1px solid #D7E1EA' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Weight &amp; Quality — Maan aur Gunvatta</div>
                        <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{vbs.weightAndQuality}</p>
                      </div>
                    )}

                    {/* ── Jyotish Benefits ── */}
                    {vbs.benefits && vbs.benefits.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--navy)' }}>Jyotish Benefits — Chandra Balavardhan</div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {vbs.benefits.map((b: string, i: number) => (
                            <div key={i} className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: '#FBF6EA', color: '#3A4A5A', border: '1px solid rgba(184,134,47,0.15)' }}>
                              <span style={{ color: '#B8862F' }}>● </span>{b}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Ayurvedic Properties ── */}
                    {vbs.ayurveda && (
                      <div className="rounded-xl p-4" style={{ background: '#F1F6FA', border: '1px solid #D7E1EA' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Ayurvedic Properties — Dravyaguna</div>
                        <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{vbs.ayurveda}</p>
                      </div>
                    )}

                    {/* ── Cautions ── */}
                    {vbs.cautions && (
                      <div className="rounded-xl p-4" style={{ background: '#FFF8E7', borderLeft: '3px solid var(--gold)', border: '1px solid rgba(184,134,47,0.35)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#B8862F' }}>Cautions &amp; Contraindications</div>
                        <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{vbs.cautions}</p>
                      </div>
                    )}

                    {/* ── Stone note (gemstone duality bridge) ── */}
                    {vbs.stoneNote && (
                      <div className="rounded-lg p-3" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                        <p className="text-xs italic leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{vbs.stoneNote}</p>
                      </div>
                    )}
                  </>
                );
              })()}

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
                <div className="rounded-lg p-4 mt-4" style={{ background: '#F1F6FA', border: '1px solid #D7E1EA' }}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B7A89' }}>History</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{birthstone.history}</p>
                </div>
              )}

              {birthstone.careInstructions && (
                <div className="rounded-lg p-4 mt-4" style={{ background: '#FBF6EA', border: '1px solid rgba(184,134,47,0.2)' }}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#B8862F' }}>Care Instructions</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#3A4A5A' }}>{birthstone.careInstructions}</p>
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
      <div className="dark-section solar-section py-12 px-4" style={{ background: 'var(--dark)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div style={{ height: '1px', background: 'rgba(215,225,234,.18)', marginBottom: '11px' }}>
              <span style={{ float: 'right', fontSize: '10px', letterSpacing: '.18em', color: '#9DB0BF', fontWeight: 600 }}>07 · COSMOS</span>
            </div>
            <div style={{ fontSize: '10.5px', letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold)' }}>Your Age Across the Solar System</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-.01em', margin: '4px 0 0' }}>Solar System Ages</h2>
            <p style={{ fontSize: '12.5px', color: '#9DB0BF', marginTop: '5px' }}>{recipientName} is {age} years old on Earth — here is their age across each planet</p>
          </div>
          <p className="text-center text-slate-500 text-xs mb-8 max-w-lg mx-auto leading-relaxed">
            Each planet orbits the Sun at a different speed. Mercury completes a year in just 88 Earth days; Neptune takes 165 Earth years. These numbers show how many full planetary years you would have lived if you had been born on that planet.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(planetaryAges).map(([planet, pAge]) => {
              const SYMBOLS: Record<string, string> = {
                Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆',
              };
              return (
                <div
                  key={planet}
                  className="rounded-xl p-5 bb-num"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(215,225,234,.15)', borderLeft: `3px solid ${planet === 'Neptune' ? 'var(--blue)' : 'var(--gold)'}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl" style={{ color: '#9DB0BF' }}>{SYMBOLS[planet]}</span>
                    <span className="font-bold text-white text-sm">{planet}</span>
                  </div>
                  <div className="text-2xl font-black" style={{ color: 'var(--gold)' }}>{pAge}</div>
                  <div className="text-xs" style={{ color: '#9DB0BF' }}>years on {planet}</div>
                </div>
              );
            })}
          </div>

          {/* Neptune special card */}
          <div className="neptune-fact-card rounded-xl p-6 text-center" style={{ background: 'rgba(30,111,184,.12)', border: '1px solid rgba(30,111,184,.3)' }}>
            <div className="text-3xl mb-3">♆</div>
            <h3 className="font-black text-white text-lg mb-2">The Neptune Number</h3>
            <p className="text-2xl font-black bb-num mb-2" style={{ color: 'var(--gold)' }}>{planetaryAges['Neptune']} years</p>
            <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: '#9DB0BF' }}>
              {planetaryFacts?.Neptune ?? 'It rains diamonds on Neptune.'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — GENERATION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="report-section generation-section py-14 px-4" style={{ background: 'var(--panel)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="bb-rule"><span className="bb-code">08 · ERA</span></div>
            <div className="bb-eyebrow">Your Generation</div>
            <h2 className="bb-h2">Generation Portrait</h2>
            <p className="bb-sub">Where {recipientName} fits in history</p>
          </div>

          {generation && (() => {
            // Normalise generation name to match GENERATION_CONTENT keys
            const genNameMap: Record<string, string> = {
              'Gen X': 'Generation X',
              'Gen Z': 'Generation Z',
              'Gen Alpha': 'Generation Alpha',
            };
            const genKey = genNameMap[generation.name] ?? generation.name;
            const gc = GENERATION_CONTENT[genKey];
            return (
              <div className="bg-white rounded-xl border p-8 mb-8 space-y-6 text-left" style={{ borderColor: 'var(--hairline)' }}>
                {/* Header */}
                <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <div className="text-5xl mb-3">{gc?.emoji ?? '🎖️'}</div>
                  <h3 className="text-3xl font-black" style={{ color: 'var(--navy)' }}>{generation.name}</h3>
                  <div className="font-semibold text-sm mt-1" style={{ color: 'var(--gold)' }}>{generation.range}</div>
                </div>

                {/* Summary */}
                <p className="leading-relaxed text-center max-w-lg mx-auto" style={{ color: 'var(--ink-soft)' }}>{generation.desc}</p>

                {gc && (
                  <>
                    {/* Defining world events */}
                    <div className="rounded-xl p-5" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                      <div className="bb-eyebrow mb-3">Defining World Events</div>
                      <div className="flex flex-wrap gap-2">
                        {gc.worldEvents.map(e => (
                          <span key={e} className="bb-chip">{e}</span>
                        ))}
                      </div>
                    </div>

                    {/* Tech, Culture, Work */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Technology</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{gc.technology}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Culture</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{gc.culture}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--navy)' }}>Work Style</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{gc.work}</p>
                      </div>
                    </div>

                    {/* Superpower */}
                    <div className="rounded-xl p-5" style={{ background: 'var(--gold-tint)', border: '1px solid var(--gold-soft)' }}>
                      <div className="bb-eyebrow mb-2">Generational Superpower</div>
                      <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>{gc.superpower}</p>
                    </div>

                    {/* Famous members */}
                    {gc.famousMembers.length > 0 && (
                      <div className="rounded-xl p-5 pb-10" style={{ background: 'var(--panel)', border: '1px solid var(--hairline)' }}>
                        <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>Famous Members of {generation.name}</div>
                        <div className="flex flex-wrap gap-2">
                          {gc.famousMembers.map(name => (
                            <span key={name} className="bb-chip">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* Longevity CTA */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 no-print">
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

      {/* ── Biorhythm ──────────────────────────────────────────────────────── */}
      {(() => {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const bio = calculateBiorhythm(dob, today);
        const physStatus = getBiorhythmStatus(bio.physical);
        const emoStatus = getBiorhythmStatus(bio.emotional);
        const intStatus = getBiorhythmStatus(bio.intellectual);
        return (
          <div className="py-10 px-4" style={{ background: 'var(--panel)', borderTop: '1px solid var(--hairline)' }}>
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="bb-rule"><span className="bb-code">09 · CYCLES</span></div>
                <div className="bb-eyebrow">Biological Rhythms</div>
                <h2 className="bb-h2">Biorhythm</h2>
                <p className="bb-sub">Physical · Emotional · Intellectual cycles based on {fmt(daysSinceBirth)} days since birth</p>
              </div>
              {/* Science note — shown before the cycle data */}
              <div className="rounded-xl p-4 mb-4 text-xs leading-relaxed" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)', color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--navy)' }}>A note on the science: </strong>the three-cycle biorhythm model dates from the early 20th century, and controlled research has not found it predictive at statistically significant levels. Treat what follows as a rhythm-awareness practice — a daily prompt to check in with your physical, emotional, and mental state — rather than a prediction. The question "what does my body actually need today?" is worth asking regardless of what the chart says.
              </div>
              {/* Per-cycle definitions */}
              <div className="rounded-xl p-4 text-xs leading-relaxed mb-4" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)' }}>
                <p className="font-bold mb-2" style={{ color: 'var(--navy)' }}>The Three Cycles</p>
                <div className="space-y-2">
                  {SECTION_EXPLAINERS.biorhythmCycles.map(c => (
                    <div key={c.name}>
                      <span className="font-semibold" style={{ color: 'var(--navy)' }}>{c.name} ({c.period}):</span>{' '}
                      <span style={{ color: 'var(--ink-soft)' }}>{c.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 mb-1">
                {[
                  { label: '🏃 Physical',    value: bio.physical,    status: physStatus },
                  { label: '💙 Emotional',   value: bio.emotional,   status: emoStatus  },
                  { label: '🧠 Intellectual', value: bio.intellectual, status: intStatus },
                ].map(({ label, value, status }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs font-semibold min-w-[116px]" style={{ color: '#0C1A2B' }}>{label}</span>
                    <div className="flex-1 relative h-4 rounded overflow-hidden" style={{ background: '#F1F6FA', border: '1px solid #D7E1EA' }}>
                      {/* Center axis line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px z-10" style={{ background: '#9FB2C2' }} />
                      {value >= 0 ? (
                        <div className="absolute top-0 bottom-0" style={{ left: '50%', width: `${value / 2}%`, background: '#B8862F' }} />
                      ) : (
                        <div className="absolute top-0 bottom-0" style={{ right: '50%', width: `${Math.abs(value) / 2}%`, background: 'rgba(192,57,43,0.7)' }} />
                      )}
                    </div>
                    <div className="min-w-[90px] text-right">
                      <span className="text-xs font-bold font-mono bb-num" style={{ color: value >= 0 ? '#B8862F' : '#C0392B' }}>{value >= 0 ? '+' : ''}{value}%</span>
                      <span className="text-xs ml-1" style={{ color: '#6B7A89' }}>{status.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-4 px-[120px]" style={{ fontSize: '9px', color: '#6B7A89' }}>
                <span>−100%</span><span>0</span><span>+100%</span>
              </div>
              <div className="rounded-xl p-4 text-xs leading-relaxed mb-3" style={{ background: 'var(--panel-2)', border: '1px solid var(--hairline)', color: 'var(--ink-soft)' }}>
                <strong>Today's reading:</strong>{' '}
                {physStatus.label === 'Peak' || physStatus.label === 'Rising'
                  ? '🏃 Physical energy is elevated — a good day for exercise, sport, and physical challenges.'
                  : physStatus.label === 'Low' || physStatus.label === 'Recovery'
                  ? '🏃 Physical energy is in a low phase — prioritise rest and recovery over intense exertion.'
                  : '🏃 Physical energy is at a transitional point — unexpected fluctuations are possible.'
                }{' '}
                {emoStatus.label === 'Peak' || emoStatus.label === 'Rising'
                  ? '💙 Emotional well-being is flourishing — ideal for social connections and creative expression.'
                  : emoStatus.label === 'Low' || emoStatus.label === 'Recovery'
                  ? '💙 Emotional energy is in a deep recovery phase — the body\'s reset cycle. Rest, don\'t push.'
                  : '💙 Emotional energy is at a transitional point — practise self-compassion and avoid high-stakes decisions.'
                }{' '}
                {intStatus.label === 'Peak' || intStatus.label === 'Rising'
                  ? '🧠 Mental clarity is sharp — an excellent time for study, problem-solving, and strategic decisions.'
                  : intStatus.label === 'Low' || intStatus.label === 'Recovery'
                  ? '🧠 Intellectual energy is in a low phase — favour routine tasks over complex analytical work.'
                  : '🧠 Intellectual energy is in transition — double-check important mental work today.'
                }
              </div>
              <div className="text-center no-print">
                <Link to="/biorhythm" className="text-xs text-teal-500 hover:text-teal-700 underline">
                  See 30-day biorhythm chart →
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Closing Section ──────────────────────────────────────────────── */}
      <div className="py-10 px-4" style={{ background: 'var(--panel-2)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div style={{ borderTop: '2px solid var(--navy)', paddingTop: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src="/bornclock-logo.png" style={{ width: '36px', height: '36px', objectFit: 'contain' }} alt="BornClock" />
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)' }}>BornClock</div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Know your time. Live it well.</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>bornclock.com · Your story, written in stars</div>
          </div>
          <p className="text-xl font-black mb-2" style={{ color: 'var(--navy)' }}>{CLOSING_SECTION.tagline}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ink-soft)' }}>{CLOSING_SECTION.signoff}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ink-soft)' }}>{CLOSING_SECTION.recipientCta}</p>
          <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--ink-soft)' }}>{CLOSING_SECTION.dailyReadingNote}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{CLOSING_SECTION.disclaimer}</p>
          <p style={{ fontSize: '10px', color: '#b0b5bf', marginTop: '8px' }}>&copy; {new Date().getFullYear()} BornClock</p>
        </div>
      </div>

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
          Made with BornClock · <Link to="/birthday-report" className="hover:underline" style={{ color: 'var(--gold)' }}>Create another report</Link>
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl text-sm transition-colors"
          >
            ⬇ Download PDF
          </button>
        </div>
      </div>

      </td></tr></tbody><tfoot><tr><td className="report-print-cell">
      <div className="report-print-footer no-screen">BornClock Birthday Blueprint &nbsp;&middot;&nbsp; {recipientName} &nbsp;&middot;&nbsp; bornclock.com</div>
      </td></tr></tfoot></table>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

const ReportViewWithBoundary = () => (
  <ReportBoundary>
    <ReportView />
  </ReportBoundary>
);

export default ReportViewWithBoundary;
