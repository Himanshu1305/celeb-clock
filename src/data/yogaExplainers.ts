/**
 * Yoga explainer content — Growth P1. Descriptive, chart-independent pages for
 * the well-known Vedic yogas (planetary combinations). The live detector in
 * src/lib/vedic/yogas.ts computes whether each is actually present in a user's
 * Kundli; these pages explain what each is and link to that computation.
 *
 * Formation rules mirror the detector (Parashari tradition). Honesty: where a
 * yoga is commonly over-hyped (e.g. Gaja Kesari) or sounds alarming (Kemadruma),
 * the note says so plainly. No fabricated classical citations.
 */
export interface YogaExplainer {
  slug: string;
  name: string;
  sanskrit?: string;
  category: 'Raja (power)' | 'Dhana (wealth)' | 'Pancha Mahapurusha' | 'Intellect' | 'Challenging' | 'Special';
  oneLine: string;        // what it gives, in a line
  howItForms: string;     // the real combination
  signifies: string;      // what the tradition reads into it
  strengthNote: string;   // honesty: commonness / what makes it actually deliver
  care: string;           // care point / balanced reading
}

export const YOGAS: YogaExplainer[] = [
  {
    slug: 'raja-yoga',
    name: 'Raja Yoga', sanskrit: 'राज योग', category: 'Raja (power)',
    oneLine: 'Authority, status and worldly success.',
    howItForms: 'A lord of a Kendra (quadrant — 1st, 4th, 7th, 10th) joins or exchanges with a lord of a Trikona (trine — 1st, 5th, 9th), by conjunction, mutual aspect or sign exchange. A single planet that owns both a Kendra and a Trikona (a Yogakaraka) forms a built-in, especially strong Raja Yoga.',
    signifies: 'Rise in status, leadership, recognition and the ability to command resources and people. It is the classic "king-making" combination.',
    strengthNote: 'Most charts carry at least one Raja Yoga in some form, so the combination alone is not remarkable — what matters is whether the planets forming it are strong (dignity, freedom from combustion/affliction) and whether their Dasha period runs during your working years. A Raja Yoga delivers most during the Dasha-Bhukti of its planets.',
    care: 'Raja Yoga describes opportunity and capacity, not a guaranteed throne. Read it alongside the strength of the planets and the running Dasha; it is a tendency to build on, not a fixed destiny.',
  },
  {
    slug: 'dhana-yoga',
    name: 'Dhana Yoga', sanskrit: 'धन योग', category: 'Dhana (wealth)',
    oneLine: 'Accumulation of wealth.',
    howItForms: 'The lords of the wealth houses — the 2nd (savings), 11th (gains), 5th and 9th (fortune) — connect with one another by conjunction, aspect or exchange. The more of these lords that link, and the stronger they are, the clearer the wealth potential.',
    signifies: 'Capacity to earn, save and grow money — often through more than one income stream when the 11th is involved.',
    strengthNote: 'Wealth potential still needs an active Dasha of the involved planets and real-world effort; a Dhana Yoga on paper with weak, afflicted lords underdelivers.',
    care: 'The yoga shows potential for wealth, not a lottery result. It never names an amount or a date.',
  },
  {
    slug: 'gaja-kesari-yoga',
    name: 'Gaja Kesari Yoga', sanskrit: 'गजकेसरी योग', category: 'Intellect',
    oneLine: 'Wisdom, good reputation and respect.',
    howItForms: 'Jupiter sits in a Kendra (1st, 4th, 7th or 10th) from the Moon.',
    signifies: 'Intelligence, sound judgement, a good name and the respect of others — the "elephant-and-lion" strength of character.',
    strengthNote: 'This is a COMMON yoga — Jupiter falls in a Kendra from the Moon in roughly a fifth to a third of all charts — so its mere presence is not special. It delivers meaningfully only when Jupiter and the Moon are themselves strong (good dignity, unafflicted), and it peaks in Jupiter/Moon (or Moon/Jupiter) Dasha periods.',
    care: 'Be wary of apps that announce Gaja Kesari as if it were rare and extraordinary. Judge it by the real strength of Jupiter and the Moon.',
  },
  {
    slug: 'budha-aditya-yoga',
    name: 'Budha-Aditya Yoga', sanskrit: 'बुधादित्य योग', category: 'Intellect',
    oneLine: 'Sharp intellect and clear communication.',
    howItForms: 'Mercury and the Sun are together in the same sign (conjunction).',
    signifies: 'Intelligence, analytical skill, good speech and writing, and success in fields that reward the mind.',
    strengthNote: 'Because Mercury never strays far from the Sun, this conjunction is frequent — and Mercury close to the Sun can become combust (burnt), which weakens rather than helps. The yoga is strong when Mercury is far enough from the Sun to avoid deep combustion and is otherwise well placed.',
    care: 'Check for combustion before celebrating a Budha-Aditya Yoga; a combust Mercury dilutes the benefit.',
  },
  {
    slug: 'chandra-mangal-yoga',
    name: 'Chandra-Mangal Yoga', sanskrit: 'चंद्र-मंगल योग', category: 'Dhana (wealth)',
    oneLine: 'Wealth through enterprise and bold action.',
    howItForms: 'The Moon and Mars are together or in mutual aspect.',
    signifies: 'Drive to earn, a head for money-making ventures, and material gain through initiative — often in business or trade.',
    strengthNote: 'The combination of Mars’s drive with the Moon’s mind is genuinely money-oriented, but the same heat can make for an impatient, risk-taking temperament; its benefit depends on the dignity of both planets.',
    care: 'Pair the enterprise it gives with patience — the wealth comes through effort, not luck.',
  },
  {
    slug: 'ruchaka-yoga',
    name: 'Ruchaka Yoga', sanskrit: 'रुचक योग', category: 'Pancha Mahapurusha',
    oneLine: 'Courage, leadership and a commanding presence.',
    howItForms: 'Mars occupies a Kendra (1st, 4th, 7th, 10th) from the Ascendant while in its own sign (Aries/Scorpio) or exalted (Capricorn). One of the five Pancha Mahapurusha ("great person") yogas.',
    signifies: 'A brave, disciplined, athletic and commanding nature — a natural leader, soldier, surgeon or entrepreneur.',
    strengthNote: 'Mahapurusha yogas are real strength-markers because they require genuine dignity in an angle; Ruchaka works best when Mars is otherwise unafflicted.',
    care: 'The same martial energy can tip into aggression or a short temper — the mature expression is courage, not combativeness.',
  },
  {
    slug: 'bhadra-yoga',
    name: 'Bhadra Yoga', sanskrit: 'भद्र योग', category: 'Pancha Mahapurusha',
    oneLine: 'Keen intellect, eloquence and business acumen.',
    howItForms: 'Mercury in a Kendra from the Ascendant, in its own sign (Gemini/Virgo) or exalted (Virgo). A Pancha Mahapurusha yoga.',
    signifies: 'A sharp, articulate, learned and adaptable mind — gifted in communication, trade, writing and analysis.',
    strengthNote: 'Strongest when Mercury is free of combustion and heavy affliction; then it gives lasting intellectual and commercial success.',
    care: 'Channel the restless mental energy into depth as well as breadth.',
  },
  {
    slug: 'hamsa-yoga',
    name: 'Hamsa Yoga', sanskrit: 'हंस योग', category: 'Pancha Mahapurusha',
    oneLine: 'Wisdom, virtue and a respected, principled life.',
    howItForms: 'Jupiter in a Kendra from the Ascendant, in its own sign (Sagittarius/Pisces) or exalted (Cancer). A Pancha Mahapurusha yoga.',
    signifies: 'A wise, ethical, learned and spiritually inclined nature; respect, good fortune and a teacher-like role.',
    strengthNote: 'One of the most benefic Mahapurusha yogas when Jupiter is strong and unafflicted.',
    care: 'Its optimism and generosity are gifts; guard only against over-extending or moralising.',
  },
  {
    slug: 'malavya-yoga',
    name: 'Malavya Yoga', sanskrit: 'मालव्य योग', category: 'Pancha Mahapurusha',
    oneLine: 'Beauty, comfort, art and refined relationships.',
    howItForms: 'Venus in a Kendra from the Ascendant, in its own sign (Taurus/Libra) or exalted (Pisces). A Pancha Mahapurusha yoga.',
    signifies: 'Charm, artistic talent, material comfort, happy relationships and an eye for beauty and luxury.',
    strengthNote: 'Delivers refined comforts and creative success when Venus is strong and well placed.',
    care: 'Balance the love of comfort and pleasure with discipline so it builds rather than indulges.',
  },
  {
    slug: 'shasha-yoga',
    name: 'Shasha Yoga', sanskrit: 'शश योग', category: 'Pancha Mahapurusha',
    oneLine: 'Authority, discipline and power earned over time.',
    howItForms: 'Saturn in a Kendra from the Ascendant, in its own sign (Capricorn/Aquarius) or exalted (Libra). A Pancha Mahapurusha yoga.',
    signifies: 'Organisational power, endurance, leadership through structure, and authority — often over large systems or many people.',
    strengthNote: 'Saturn rewards slowly; Shasha Yoga gives power that is earned and durable rather than sudden, strongest when Saturn is dignified.',
    care: 'The Saturnine drive for control needs fairness; its best expression is just, patient authority.',
  },
  {
    slug: 'neecha-bhanga-raja-yoga',
    name: 'Neecha Bhanga Raja Yoga', sanskrit: 'नीचभंग राज योग', category: 'Special',
    oneLine: 'A rise to success from humble or difficult beginnings.',
    howItForms: 'A debilitated (neecha) planet has its debilitation cancelled (bhanga) — for example, the lord of its debilitation sign, or the planet that would be exalted there, sits in a Kendra from the Ascendant or the Moon. The cancelled debilitation can then act like a Raja Yoga.',
    signifies: 'Turning a weakness into a strength; success that arrives after early struggle, often making the person self-made.',
    strengthNote: 'Not every debilitation cancels, and the degree of cancellation matters — a partial bhanga gives a partial result. This is one of the most misread yogas, so judge the specific cancellation condition rather than assuming it applies.',
    care: 'Read it as hope and resilience, not as a promise that every hardship becomes a crown.',
  },
  {
    slug: 'vipreet-raja-yoga',
    name: 'Vipreet Raja Yoga', sanskrit: 'विपरीत राज योग', category: 'Special',
    oneLine: 'Unexpected rise through adversity.',
    howItForms: 'The lords of the dusthanas (6th, 8th, 12th — the houses of difficulty) sit in each other’s dusthana houses or associate among themselves. The "harm" turns inward and produces gain.',
    signifies: 'Benefit that comes out of crisis, competition or loss — doing well precisely where others struggle; strength in fields linked to the 6th/8th/12th (medicine, research, insurance, foreign lands, crisis management).',
    strengthNote: 'It typically activates during the Dasha of the involved dusthana lords, often after a testing phase rather than smoothly from the start.',
    care: 'The gain usually follows a struggle — the yoga reframes difficulty as a doorway, not as an easy ride.',
  },
  {
    slug: 'kemadruma-yoga',
    name: 'Kemadruma Yoga', sanskrit: 'केमद्रुम योग', category: 'Challenging',
    oneLine: 'A sense of isolation or ups and downs of mind — and how it is often cancelled.',
    howItForms: 'No planet (other than the Sun) sits in the 2nd or 12th from the Moon, and no planet joins or aspects the Moon, leaving it "unsupported".',
    signifies: 'Traditionally read as emotional isolation, instability or struggle for support. Importantly, it is frequently CANCELLED (Kemadruma Bhanga) — for example when a planet is in a Kendra from the Moon or Ascendant, or the Moon is aspected by a benefic — so a genuine, uncancelled Kemadruma is uncommon.',
    strengthNote: 'Because cancellations are so common, most charts that "have" Kemadruma do not actually carry its effect. This is one of the most over-flagged yogas in apps.',
    care: 'This is explained for completeness, calmly. It is never a verdict on your life or mental health, and it is not a substitute for real support — read it as a nudge to build steady relationships, and talk to a professional for any genuine wellbeing concern.',
  },
];

export function yogaBySlug(slug: string): YogaExplainer | undefined {
  return YOGAS.find(y => y.slug === slug);
}
export const YOGA_SLUGS = YOGAS.map(y => y.slug);
