export interface MoonSignData {
  sign: string;
  symbol: string;
  element: string;
  rulingPlanet: string;
  emotionalNature: string;
  personality: string;
  instincts: string;
  inLove: string;
  shadow: string;
  compatible: string[];
  celebrities: string[];
}

export const MOON_SIGN_DATA: Record<string, MoonSignData> = {
  Aries: {
    sign: 'Aries', symbol: '♈', element: 'Fire', rulingPlanet: 'Mars',
    emotionalNature: 'Immediate, passionate, quick to forgive and quick to anger',
    personality: "Your emotional world moves at the speed of fire. You feel things immediately and completely — joy, frustration, love, and excitement all arrive at full intensity before the rational mind has a chance to process them. This is not immaturity; it is the gift of emotional authenticity. You cannot pretend to feel what you don't feel, and you cannot suppress what you do. Your emotional recovery is as fast as your emotional ignition — you burn hot and clear quickly.",
    instincts: 'To act immediately on what you feel, to protect those you love, to lead from the front even emotionally',
    inLove: 'You love passionately, directly, and without pretence. You pursue what you want and you give everything when committed. You need a partner who can match your energy without being overwhelmed by it — and who understands that your emotional intensity is love expressed at full volume.',
    shadow: 'Impatience with others\' slower emotional processing, saying things in heat that you later regret, difficulty sitting with uncomfortable feelings',
    compatible: ['Leo Moon', 'Sagittarius Moon', 'Gemini Moon'],
    celebrities: ['Lady Gaga', 'Angelina Jolie', 'Marlon Brando'],
  },
  Taurus: {
    sign: 'Taurus', symbol: '♉', element: 'Earth', rulingPlanet: 'Venus',
    emotionalNature: 'Steady, sensual, deeply loyal, slow to change once settled',
    personality: 'Your emotional world is built on security, beauty, and loyalty. You feel most alive when life is stable, beautiful, and deeply connected to the physical world — good food, comfortable environments, trusted relationships, the sensory pleasures that make existence feel worthwhile. You take time to open emotionally, but once you do, your devotion is one of the most reliable forces in anyone\'s life. You are the person others call when they need steadiness in a storm.',
    instincts: "To build security, to create beauty, to protect what you've invested in emotionally",
    inLove: "You are one of the most loyal and physically affectionate of all moon signs. You show love through presence, through creating comfort, through the patient accumulation of shared experience. You need a partner who understands that your steadiness is love — not boredom.",
    shadow: 'Stubbornness when emotionally threatened, material possessiveness extending to relationships, difficulty releasing what no longer serves',
    compatible: ['Virgo Moon', 'Capricorn Moon', 'Cancer Moon'],
    celebrities: ['Adele', 'Shah Rukh Khan', 'Michelle Obama'],
  },
  Gemini: {
    sign: 'Gemini', symbol: '♊', element: 'Air', rulingPlanet: 'Mercury',
    emotionalNature: 'Variable, curious, needs to verbalise feelings to understand them',
    personality: "Your emotional life is rich with variety and intellectual curiosity. You process feelings through conversation, writing, and mental exploration — you often don't know what you feel until you've talked or written about it. This is not emotional avoidance; it is your particular form of emotional intelligence. You are genuinely interested in how you feel and why, which makes you capable of remarkable emotional growth. You need mental stimulation to feel emotionally content.",
    instincts: 'To connect, to communicate, to keep options open, to understand your feelings rather than just experiencing them',
    inLove: "You need a partner who engages your mind as passionately as your heart. Intellectual connection is not secondary to emotional connection for you — they are the same thing. You are playful, communicative, and endlessly curious about your partner.",
    shadow: 'Inconsistency in emotional expression, intellectualising rather than feeling, difficulty with emotional depth when it cannot be explained',
    compatible: ['Libra Moon', 'Aquarius Moon', 'Aries Moon'],
    celebrities: ['Priyanka Chopra', 'Albert Einstein', 'Marilyn Monroe'],
  },
  Cancer: {
    sign: 'Cancer', symbol: '♋', element: 'Water', rulingPlanet: 'Moon',
    emotionalNature: 'Deeply feeling, highly intuitive, protective of those they love',
    personality: "Cancer is the home of the Moon — this is the moon sign of deepest emotional resonance. You feel everything at a depth that others rarely access. Your emotional memory is extraordinary — you remember exactly how things felt, not just what happened. Home, family, and belonging are your deepest emotional needs, and your intuition about others' emotional states is almost psychic. You are the person others instinctively turn to when they need to feel understood.",
    instincts: 'To nurture, to protect, to create emotional safety for yourself and those you love',
    inLove: 'You love with extraordinary depth and devotion. You are the partner who remembers every significant moment, who anticipates needs before they are expressed, who creates home wherever you are. You need emotional security in return — and a partner who can tolerate your occasional emotional tides without mistaking them for instability.',
    shadow: 'Moodiness tied to lunar cycles, emotional withdrawal when hurt, difficulty releasing old wounds, over-protectiveness',
    compatible: ['Scorpio Moon', 'Pisces Moon', 'Taurus Moon'],
    celebrities: ['Amitabh Bachchan', 'Princess Diana', 'Meryl Streep'],
  },
  Leo: {
    sign: 'Leo', symbol: '♌', element: 'Fire', rulingPlanet: 'Sun',
    emotionalNature: 'Warm, generous, needs appreciation, deeply loyal when loved well',
    personality: 'Your emotional world is radiant, generous, and pride-bearing. You feel most alive when you are loved, appreciated, and free to express your authentic self fully. Recognition matters to you — not from vanity, but because appreciation is how you experience love. When you feel unseen or taken for granted, your emotional world dims dramatically. When you feel celebrated, you give warmth and loyalty without limits. You are one of the most generous moon signs when your emotional needs are met.',
    instincts: 'To shine, to inspire, to protect your pride, to celebrate and be celebrated',
    inLove: 'You love boldly and generously. You create romance — grand gestures, memorable moments, loyalty that borders on ferocity. You need a partner who genuinely celebrates who you are and who is not threatened by your light.',
    shadow: "Pride making it difficult to apologise, needing to be the emotional centre, taking others' emotional withdrawal as rejection",
    compatible: ['Aries Moon', 'Sagittarius Moon', 'Libra Moon'],
    celebrities: ['Deepika Padukone', 'Will Smith', 'Celine Dion'],
  },
  Virgo: {
    sign: 'Virgo', symbol: '♍', element: 'Earth', rulingPlanet: 'Mercury',
    emotionalNature: 'Analytical, quietly devoted, expresses love through service and practical care',
    personality: 'Your emotional world is precise, analytical, and expressed most naturally through acts of service rather than words. You process feelings through logic — you want to understand your emotions, not just experience them. This gives you remarkable emotional intelligence over time, even if your emotional expression appears restrained to others. Your care for people shows in the details: remembering preferences, anticipating needs, fixing problems without being asked. To know you emotionally is to be quietly taken care of in a hundred small ways.',
    instincts: 'To improve, to help, to organise chaos, to express love through practical devotion',
    inLove: "You show love through attention to detail — the remembered coffee order, the fixed problem, the practical support given without fanfare. You need a partner who can appreciate this form of love and who doesn't mistake your emotional restraint for emotional absence.",
    shadow: 'Excessive self-criticism, critiquing loved ones as an expression of care that lands as criticism, difficulty receiving rather than giving',
    compatible: ['Taurus Moon', 'Capricorn Moon', 'Scorpio Moon'],
    celebrities: ['Beyoncé', 'Keanu Reeves', 'Narendra Modi'],
  },
  Libra: {
    sign: 'Libra', symbol: '♎', element: 'Air', rulingPlanet: 'Venus',
    emotionalNature: 'Harmony-seeking, relationship-oriented, deeply uncomfortable with conflict',
    personality: 'Your emotional wellbeing is inextricably tied to the quality of your relationships and the level of harmony in your environment. You are genuinely made for connection — you feel most yourself when in meaningful partnership, whether romantic, creative, or professional. Conflict and disharmony disturb you at a core level, which sometimes leads you to avoid necessary confrontations. Your gift is seeing all sides; your challenge is deciding which side you actually stand on.',
    instincts: 'To balance, to harmonise, to create beauty, to ensure fairness in all relationships',
    inLove: 'You are one of the most romantic and aesthetically sensitive moon signs. You create beautiful relational environments — thoughtful gestures, beautiful spaces, careful attention to how your partner feels. You need reciprocity — a partner who tends to the relationship as devotedly as you do.',
    shadow: 'People-pleasing that masks true feelings, difficulty making decisions when both options have merit, resentment building beneath harmonious surface',
    compatible: ['Gemini Moon', 'Aquarius Moon', 'Leo Moon'],
    celebrities: ['Katrina Kaif', 'Kim Kardashian', 'Bill Clinton'],
  },
  Scorpio: {
    sign: 'Scorpio', symbol: '♏', element: 'Water', rulingPlanet: 'Pluto',
    emotionalNature: 'Intensely deep, fiercely loyal, feels everything at full strength',
    personality: "Scorpio Moon is the most emotionally intense placement in the zodiac. You feel everything — joy, love, grief, betrayal, passion — at full depth, and you remember it all with crystalline clarity. Your emotional memory is your wisdom and sometimes your wound. You are extraordinarily perceptive about others' motivations and feelings, often seeing beneath surfaces that fool everyone else. You cannot do emotional shallow — you require depth, truth, and genuine vulnerability in your relationships.",
    instincts: "To penetrate beneath the surface, to protect your vulnerabilities ferociously, to transform what you encounter",
    inLove: "You love with a totality that can be overwhelming for those who don't match your depth. You are fiercely loyal, deeply sensual, and possessed of an emotional memory that means you never truly forget. You need a partner who can meet your intensity without being consumed by it.",
    shadow: 'Jealousy rooted in fear of abandonment, emotional manipulation when feeling threatened, difficulty forgiving real or perceived betrayals',
    compatible: ['Cancer Moon', 'Pisces Moon', 'Virgo Moon'],
    celebrities: ['Shahrukh Khan', 'Katy Perry', 'Pablo Picasso'],
  },
  Sagittarius: {
    sign: 'Sagittarius', symbol: '♐', element: 'Fire', rulingPlanet: 'Jupiter',
    emotionalNature: 'Optimistic, freedom-loving, philosophical about feelings',
    personality: 'Your emotional world is naturally optimistic, expansive, and philosophically oriented. You feel happiest when life is growing — new places, new ideas, new horizons, new experiences that expand your understanding of what existence can be. Emotional restriction or enforced routine makes you restless in ways that go bone-deep. You process difficult emotions by finding meaning in them — you need to understand why something happened before you can release it.',
    instincts: 'To expand, to find meaning, to maintain freedom, to see the bigger picture even in painful moments',
    inLove: 'You love with enthusiasm and generosity, but you need a partner who understands that your freedom is not negotiable. Love for you must be expansive — it should make your world bigger, not smaller. You are honest to a fault in relationships, sometimes tactlessly so.',
    shadow: 'Emotional restlessness that can look like commitment avoidance, overpromising in enthusiasm and underdelivering, glossing over emotional pain with premature optimism',
    compatible: ['Aries Moon', 'Leo Moon', 'Aquarius Moon'],
    celebrities: ['Taylor Swift', 'Sachin Tendulkar', 'Miley Cyrus'],
  },
  Capricorn: {
    sign: 'Capricorn', symbol: '♑', element: 'Earth', rulingPlanet: 'Saturn',
    emotionalNature: 'Reserved, disciplined, deeply feeling beneath a controlled exterior',
    personality: "Your emotional life is private, disciplined, and far deeper than your exterior suggests. You feel things profoundly but express them carefully — emotional exposure feels like vulnerability that must be earned. Responsibility, achievement, and integrity are emotionally meaningful to you: you feel most secure when you've worked hard for what you have and when your word means something. Beneath your reserved exterior is a capacity for loyalty and devotion that few people are privileged to experience.",
    instincts: 'To achieve, to build lasting things, to earn emotional security rather than assume it',
    inLove: 'You are one of the most quietly devoted of all moon signs. You show love through reliability, through showing up consistently, through building something lasting together. You need a partner who appreciates that your reserve is not coldness — it is the protection of something precious.',
    shadow: 'Emotional unavailability that can wound partners who need verbal expression, excessive self-criticism, difficulty receiving care',
    compatible: ['Taurus Moon', 'Virgo Moon', 'Pisces Moon'],
    celebrities: ['Ratan Tata', 'Indira Gandhi', 'David Bowie'],
  },
  Aquarius: {
    sign: 'Aquarius', symbol: '♒', element: 'Air', rulingPlanet: 'Uranus',
    emotionalNature: 'Intellectual, humanitarian, emotionally independent',
    personality: "Your emotional world is intellectually oriented and collectively focused. You feel deeply about ideas, causes, and humanity — individual emotional demands can sometimes feel more difficult to navigate than global ones. You are genuinely progressive in your emotional expression: you've often worked out healthy emotional patterns that others are still discovering. Your independence is not a defence mechanism — it is a genuine aspect of your nature that must be respected, not fixed.",
    instincts: 'To innovate, to liberate, to connect with those who share your vision rather than your geography',
    inLove: 'You need a partner who is also a genuine friend and intellectual companion. Love without friendship does not sustain you. You need space — not distance, but genuine independence maintained within the relationship. You love unconventionally and authentically.',
    shadow: 'Emotional detachment that can leave partners feeling unloved, difficulty with the irrational aspects of emotion, contrarianism as an emotional default',
    compatible: ['Gemini Moon', 'Libra Moon', 'Sagittarius Moon'],
    celebrities: ['Amitabh Bachchan', 'Elon Musk', 'Oprah Winfrey'],
  },
  Pisces: {
    sign: 'Pisces', symbol: '♓', element: 'Water', rulingPlanet: 'Neptune',
    emotionalNature: "Fluid, deeply empathetic, absorbs others' feelings like a sponge",
    personality: "Pisces Moon is the most emotionally permeable of all moon signs. You feel not just your own emotions but everyone else's as well — which makes you an extraordinary empath and an occasionally exhausted one. Your emotional world is fluid, creative, spiritually attuned, and often more comfortable in imagined worlds than harsh realities. This is not weakness; it is a form of consciousness that accesses dimensions of experience that others cannot reach. Your compassion is your superpower and your greatest vulnerability.",
    instincts: 'To merge, to heal, to dissolve boundaries, to connect with something larger than the individual self',
    inLove: "You love with extraordinary tenderness and spiritual depth. You see your partner's highest potential even when they cannot see it themselves. You need a partner who is emotionally stable enough to be your anchor — someone who appreciates your depth without drowning in it.",
    shadow: "Emotional boundaries that are too porous, escapism when reality becomes too painful, difficulty distinguishing your own feelings from others'",
    compatible: ['Cancer Moon', 'Scorpio Moon', 'Capricorn Moon'],
    celebrities: ['Lata Mangeshkar', 'Rumi', 'Albert Einstein'],
  },
};

export const NAKSHATRAS: Record<number, { name: string; meaning: string; deity: string; quality: string; symbol: string; description: string }> = {
  1:  { name: 'Ashwini', symbol: '🐎', meaning: 'Born of the Horse', deity: 'Ashwini Kumaras (divine physicians)', quality: 'Swift, pioneering, healing', description: 'Ashwini is the first nakshatra — it carries the energy of swift new beginnings and divine healing. People born under Ashwini have a natural healing ability and a pioneering spirit. The Ashwini Kumaras are the celestial physicians of the gods, which gives this nakshatra an association with miraculous healing and swift resolution.' },
  2:  { name: 'Bharani', symbol: '🌊', meaning: 'The Bearer', deity: 'Yama (god of death and dharma)', quality: 'Transformative, creative, intense', description: 'Bharani carries the energy of creative transformation. Yama as the ruling deity speaks to the power of discernment — knowing what must die so that what is truly alive can flourish. People born under Bharani often have unusual creative power and a fearlessness about endings and beginnings.' },
  3:  { name: 'Krittika', symbol: '🔥', meaning: 'The Cutter', deity: 'Agni (fire god)', quality: 'Sharp, purifying, determined', description: 'Krittika is ruled by Agni, the fire that burns away what is false to reveal what is true. This nakshatra gives a sharp, determined nature and the ability to cut through confusion to the essential. People with Krittika moon are often fiercely honest and have a natural capacity for leadership through clarity.' },
  4:  { name: 'Rohini', symbol: '🌺', meaning: 'The Red One / The Growing One', deity: 'Brahma (the creator)', quality: 'Fertile, beautiful, growth-oriented', description: "Rohini was said to be the Moon god's favourite wife — a nakshatra of extraordinary beauty, sensuality, and creative fertility. People with Rohini moon often have natural artistic gifts and an unusual capacity to attract what they desire. Growth and beauty characterise everything they touch." },
  5:  { name: 'Mrigashira', symbol: '🦌', meaning: "Deer's Head", deity: 'Soma (moon god)', quality: 'Searching, curious, gentle', description: 'Mrigashira carries the restless searching energy of the deer — always seeking, always curious, never quite settling. People with this nakshatra have sharp minds and a love of learning, but may find it difficult to feel fully satisfied. Their seeking is itself their gift — they ask the questions others have not thought to ask.' },
  6:  { name: 'Ardra', symbol: '⚡', meaning: 'The Moist One / The Storm', deity: 'Rudra (the storm god)', quality: 'Stormy, transformative, intense', description: 'Ardra is the nakshatra of the cosmic storm — intense, transformative, and ultimately clearing. Rudra as deity brings both destruction and renewal. People born under Ardra often go through powerful transformative experiences that ultimately deepen their wisdom and compassion. They have penetrating minds and emotional intensity.' },
  7:  { name: 'Punarvasu', symbol: '🏹', meaning: 'Good Again / Return of the Light', deity: 'Aditi (mother of the gods)', quality: 'Renewal, optimism, benevolence', description: 'Punarvasu means "becoming good again" — it carries the energy of return after difficulty. Aditi, the boundless mother, gives this nakshatra its quality of infinite renewal and optimism. People with Punarvasu moon often have a remarkable ability to recover from adversity and to help others find hope again.' },
  8:  { name: 'Pushya', symbol: '🪷', meaning: 'Nourisher', deity: 'Brihaspati (Jupiter / divine teacher)', quality: 'Nurturing, spiritual, protective', description: 'Pushya is considered the most auspicious of all nakshatras. Ruled by Brihaspati (Jupiter), it carries the energy of divine nourishment and wisdom. People with Pushya moon are naturally nurturing, spiritually attuned, and often serve as teachers or guides. They carry a quality of genuine goodness that others find comforting.' },
  9:  { name: 'Ashlesha', symbol: '🐍', meaning: 'The Embrace', deity: 'Naga (serpent deities)', quality: 'Penetrating, mystical, psychologically deep', description: 'Ashlesha is the nakshatra of the serpent — wisdom, penetrating insight, and the ability to see through illusions. People born under Ashlesha have extraordinary psychological insight and a capacity for deep transformation. They can see what others conceal, which makes them powerful healers when they direct this gift toward compassion.' },
  10: { name: 'Magha', symbol: '👑', meaning: 'The Great One', deity: 'Pitrs (ancestors)', quality: 'Regal, ancestral, authoritative', description: 'Magha carries the energy of the ancestors — the accumulated wisdom and dignity of all who came before. People born under Magha often have a naturally regal bearing and an instinctive connection to lineage, tradition, and inherited wisdom. They are natural leaders who draw authority from their roots.' },
  11: { name: 'Purva Phalguni', symbol: '🎭', meaning: 'Former Red One', deity: 'Bhaga (god of delight)', quality: 'Creative, pleasure-loving, generous', description: 'Purva Phalguni is the nakshatra of creative delight — ruled by Bhaga, the god of good fortune and enjoyment. People born here have a natural gift for creative expression and a genuine capacity for joy. They are generous, charismatic, and bring a quality of celebration to whatever they touch.' },
  12: { name: 'Uttara Phalguni', symbol: '🤝', meaning: 'Latter Red One', deity: 'Aryaman (god of patronage)', quality: 'Helpful, balanced, socially gifted', description: 'Uttara Phalguni brings the creative energy of Purva Phalguni into social service. Aryaman as deity governs contracts, partnerships, and mutual aid. People with this nakshatra moon have a gift for bringing people together and creating organisations that serve collective wellbeing.' },
  13: { name: 'Hasta', symbol: '✋', meaning: 'The Hand', deity: 'Savitar (the creative sun)', quality: 'Skillful, healing, resourceful', description: 'Hasta is the nakshatra of the skilled hand — it governs craftsmanship, healing through touch, and the ability to manifest ideas into physical reality. People born under Hasta have natural manual dexterity and healing abilities. They often work with their hands in ways that transform both themselves and others.' },
  14: { name: 'Chitra', symbol: '💎', meaning: 'The Brilliant One', deity: 'Tvashtr (divine architect)', quality: 'Artistic, creative, glamorous', description: 'Chitra is the nakshatra of the master craftsman and artist. Tvashtr, the divine architect, gives this nakshatra an association with extraordinary creative skill and the ability to make beautiful things. People with Chitra moon are often naturally gifted in aesthetic domains and have a magnetic personal presence.' },
  15: { name: 'Swati', symbol: '🌬️', meaning: 'The Sword / Independent One', deity: 'Vayu (wind god)', quality: 'Independent, flexible, diplomatic', description: 'Swati is associated with the wind — ever-moving, flexible, carrying seeds of new growth wherever it travels. People born under Swati have a natural independence and diplomatic skill. They are adept at navigating complex social situations and at moving through the world with flexibility and grace.' },
  16: { name: 'Vishakha', symbol: '⚡', meaning: 'Forked / Branching', deity: 'Indra-Agni (power and fire)', quality: 'Ambitious, goal-oriented, determined', description: "Vishakha is the nakshatra of determined purpose. Indra-Agni as dual deity brings both power and transformative fire to this nakshatra's energy. People born under Vishakha often have extraordinary focus and the ability to sustain effort toward a goal long after others have given up." },
  17: { name: 'Anuradha', symbol: '🌸', meaning: 'Following Radha / Success After Radha', deity: 'Mitra (god of friendship)', quality: 'Devoted, friendly, organisational', description: 'Anuradha carries the energy of devoted friendship and organisational excellence. Mitra as deity governs alliances and cooperative relationships. People with Anuradha moon often have a remarkable ability to build and sustain collaborative relationships and to create organisations that serve meaningful purposes.' },
  18: { name: 'Jyeshtha', symbol: '👆', meaning: 'The Eldest / The Chief', deity: 'Indra (king of the gods)', quality: 'Protective, courageous, responsible', description: 'Jyeshtha is the nakshatra of the elder — the one who bears responsibility for others. Indra as deity gives this nakshatra its association with leadership, courage, and protective power. People with Jyeshtha moon often feel a strong sense of responsibility for others and are naturally drawn to protective and leadership roles.' },
  19: { name: 'Mula', symbol: '🌿', meaning: 'The Root', deity: 'Nirriti (goddess of dissolution)', quality: 'Investigative, transformative, truth-seeking', description: 'Mula is the nakshatra of the root — it penetrates to the very foundation of things. Nirriti as deity governs dissolution and transformation. People born under Mula often feel compelled to go to the root of whatever they investigate, and they have an extraordinary capacity for profound transformation — both of themselves and of situations.' },
  20: { name: 'Purva Ashadha', symbol: '🏆', meaning: 'Former Invincible / Early Victory', deity: 'Apas (water goddess)', quality: 'Purifying, invincible, inspiring', description: 'Purva Ashadha carries the energy of the invincible — the tide that cannot be held back. Apas, the water deity, gives this nakshatra a purifying, cleansing quality. People born here often have a natural capacity to inspire others and to persist through obstacles with a fluid, adaptable determination.' },
  21: { name: 'Uttara Ashadha', symbol: '⚖️', meaning: 'Latter Invincible / Final Victory', deity: 'Vishvadevas (universal gods)', quality: 'Victorious, universal, ethical', description: 'Uttara Ashadha represents final, sustained victory achieved through universal principles and ethical action. The Vishvadevas govern universal order and collective wellbeing. People with this nakshatra moon often have a natural orientation toward what serves the collective good, and their victories tend to be lasting rather than temporary.' },
  22: { name: 'Shravana', symbol: '👂', meaning: 'Hearing / The Listener', deity: 'Vishnu (the preserver)', quality: 'Learning, connecting, preserving', description: 'Shravana is the nakshatra of deep listening — the capacity to hear what is truly being communicated, not just the words. Vishnu as deity governs preservation and cosmic order. People with Shravana moon are natural listeners and learners who preserve and transmit wisdom. They often have extraordinary memories.' },
  23: { name: 'Dhanishtha', symbol: '🎵', meaning: 'The Wealthiest / Most Famous', deity: 'Eight Vasus (gods of abundance)', quality: 'Musical, abundant, ambitious', description: 'Dhanishtha is the nakshatra of abundance and musical harmony. The Eight Vasus govern the abundance of the material and spiritual worlds. People born under Dhanishtha often have a natural musical ability and an instinct for creating prosperity in whatever domain they engage with.' },
  24: { name: 'Shatabhisha', symbol: '🔵', meaning: 'Hundred Healers / Hundred Stars', deity: 'Varuna (god of cosmic order)', quality: 'Healing, independent, mystical', description: 'Shatabhisha is the nakshatra of the cosmic healer — associated with a hundred healing stars and the capacity for profound spiritual and physical healing. Varuna as deity governs the cosmic order that underlies all healing. People born under Shatabhisha often have unusual healing abilities and a deeply independent, mystical nature.' },
  25: { name: 'Purva Bhadrapada', symbol: '⚔️', meaning: 'Former Happy Feet / Former Auspicious Steps', deity: 'Ajaikapada (serpent deity)', quality: 'Intense, transformative, spiritually powerful', description: 'Purva Bhadrapada carries intense transformative energy — associated with fire that purifies and the serpent that sheds its skin. People born under this nakshatra often go through dramatic inner transformations and have a capacity for spiritual insight that borders on visionary. Their intensity, properly directed, becomes extraordinary power.' },
  26: { name: 'Uttara Bhadrapada', symbol: '🐍', meaning: 'Latter Happy Feet / Latter Auspicious Steps', deity: 'Ahirbudhanya (serpent of the deep)', quality: 'Wise, compassionate, profoundly still', description: 'Uttara Bhadrapada brings the intensity of Purva Bhadrapada into deep wisdom and compassion. The deep serpent deity governs the mysteries of the unconscious. People with this nakshatra moon have extraordinary wisdom that has been earned through depth of experience, and a compassion that flows from having truly suffered and truly healed.' },
  27: { name: 'Revati', symbol: '🐟', meaning: 'The Wealthy / The Nourishing', deity: 'Pushan (god of journeys)', quality: 'Nurturing, completing, guiding', description: "Revati is the final nakshatra — the completion of the cosmic cycle. Pushan as deity guides travellers and nourishes all beings on their journey. People with Revati moon often have a gift for helping others complete important phases of their lives. They carry a quality of gentle wisdom and the capacity to make every person feel that they belong." },
};

export function calculateMoonSignAndNakshatra(birthDate: Date): {
  moonSign: string;
  nakshatraNumber: number;
  nakshatraData: typeof NAKSHATRAS[number];
  moonSignData: MoonSignData;
} {
  const referenceDate = new Date('2000-01-06');
  const daysDiff = (birthDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  const moonCycleDays = 27.3217;
  const cyclePosition = ((daysDiff % moonCycleDays) + moonCycleDays) % moonCycleDays;

  const nakshatraIndex = Math.floor(cyclePosition / (moonCycleDays / 27));
  const nakshatraNumber = (nakshatraIndex % 27) + 1;

  const signIndex = Math.floor(cyclePosition / (moonCycleDays / 12));
  const moonSigns = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const moonSign = moonSigns[signIndex % 12];

  return {
    moonSign,
    nakshatraNumber,
    nakshatraData: NAKSHATRAS[nakshatraNumber] || NAKSHATRAS[1],
    moonSignData: MOON_SIGN_DATA[moonSign] || MOON_SIGN_DATA.Aries,
  };
}
