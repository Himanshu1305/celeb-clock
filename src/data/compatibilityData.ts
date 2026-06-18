export interface CompatibilityResult {
  overall: number;
  love: number;
  friendship: number;
  work: number;
  description: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

export const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

const ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const ELEMENT_SCORE: Record<string, number> = {
  'Fire-Fire': 82, 'Earth-Earth': 80, 'Air-Air': 78, 'Water-Water': 85,
  'Fire-Air': 83, 'Air-Fire': 83,
  'Earth-Water': 82, 'Water-Earth': 82,
  'Fire-Earth': 62, 'Earth-Fire': 62,
  'Fire-Water': 58, 'Water-Fire': 58,
  'Air-Water': 65, 'Water-Air': 65,
  'Air-Earth': 60, 'Earth-Air': 60,
};

const COMPATIBILITY_MATRIX: Partial<Record<string, CompatibilityResult>> = {
  'Aries-Aries': { overall: 82, love: 85, friendship: 80, work: 78,
    description: "Two Aries together create an explosive, passionate, and occasionally combustible partnership. You understand each other's drive and ambition completely — which is both your greatest strength and your greatest challenge.",
    strengths: ['Shared energy and ambition', 'Mutual understanding of need for independence', 'Exciting, never boring'],
    challenges: ['Both want to lead', 'Arguments can be fierce', 'Need for dominance from both sides'],
    advice: 'Channel your combined energy toward shared goals rather than competing with each other. Decide who leads in which domain and respect those boundaries.' },

  'Aries-Taurus': { overall: 68, love: 72, friendship: 65, work: 70,
    description: "Fire meets Earth — Aries' impulse collides with Taurus' deliberation. This can be deeply complementary or deeply frustrating, depending on whether you learn to value what the other brings.",
    strengths: ['Aries initiates, Taurus sustains', "Taurus grounds Aries' scattered energy", 'Physical chemistry is often strong'],
    challenges: ['Aries finds Taurus too slow', 'Taurus finds Aries too reckless', 'Different relationship with security'],
    advice: "Aries — let Taurus finish what you start. Taurus — let Aries open doors you wouldn't have knocked on." },

  'Aries-Gemini': { overall: 85, love: 82, friendship: 90, work: 80,
    description: "Fire and Air — Aries' energy feeds on Gemini's ideas, and Gemini's curiosity is endlessly stimulated by Aries' boldness. This is one of the more naturally compatible pairings in the zodiac.",
    strengths: ['Intellectual and physical excitement', 'Never boring', 'Aries gives direction, Gemini gives ideas'],
    challenges: ['Both can be inconsistent with follow-through', 'Gemini may find Aries too direct', 'Need to build stability intentionally'],
    advice: 'You have the ingredients for an extraordinary partnership — add structure and you have something rare.' },

  'Aries-Cancer': { overall: 60, love: 62, friendship: 58, work: 60,
    description: "Aries' fire and Cancer's water are fundamentally different in how they process the world. Aries acts first; Cancer feels first. The gap can be bridged with patience and genuine curiosity about how the other experiences life.",
    strengths: ['Aries protects Cancer', 'Cancer nurtures Aries', 'Complementary energies when balanced'],
    challenges: ["Aries can wound Cancer's sensitivity unintentionally", "Cancer's moodiness frustrates Aries", 'Very different needs in conflict'],
    advice: "Aries — slow down before you speak. Cancer — say what you need rather than expecting it to be intuited." },

  'Aries-Leo': { overall: 90, love: 92, friendship: 88, work: 85,
    description: "Two fire signs — the spark of Aries meets the sustained flame of Leo. This is one of the most passionate and energising combinations in the zodiac. You bring out the best in each other's confidence.",
    strengths: ['Mutual admiration and excitement', 'Both are natural leaders who respect strength', 'Incredible physical and creative chemistry'],
    challenges: ['Two egos requiring recognition', 'Competition rather than collaboration', 'Drama potential is high'],
    advice: "Celebrate each other genuinely — two fires that burn together rather than fighting for the same oxygen." },

  'Aries-Virgo': { overall: 62, love: 60, friendship: 65, work: 68,
    description: "Aries' boldness and Virgo's precision are rarely natural partners. But when the relationship works, Aries benefits from Virgo's detail-orientation and Virgo benefits from Aries' momentum.",
    strengths: ["Virgo refines Aries' raw energy", 'Complementary skills in work settings', 'Both are highly capable'],
    challenges: ["Virgo's criticism lands hard on Aries", "Aries' impulsiveness frustrates Virgo", 'Very different pacing'],
    advice: 'See each other as complements rather than opponents. Virgo: your precision is a gift, not a weapon.' },

  'Aries-Libra': { overall: 72, love: 78, friendship: 70, work: 65,
    description: "Opposites on the zodiac wheel — Aries acts alone while Libra seeks partnership. The attraction is real and magnetic, but the differences in approach require genuine effort to navigate.",
    strengths: ['Magnetic attraction of opposites', 'Balance each other beautifully when aligned', "Libra softens Aries, Aries motivates Libra"],
    challenges: ["Aries' directness vs Libra's diplomacy creates friction", 'Different decision-making speeds', 'Libra can trigger Aries\' impatience'],
    advice: "You each have what the other lacks — the secret is seeing that as a gift rather than an irritant." },

  'Aries-Scorpio': { overall: 68, love: 72, friendship: 62, work: 65,
    description: "Two intensely powerful signs — Aries driven by desire, Scorpio by depth. The initial attraction is explosive. The sustained relationship requires both to develop emotional maturity.",
    strengths: ['Extraordinary passion and intensity', 'Both are fearless and driven', 'Genuine respect for each other\'s strength'],
    challenges: ['Power struggles are inevitable', "Scorpio's secrecy frustrates transparent Aries", "Aries' impulsiveness triggers Scorpio's control needs"],
    advice: "Direct your shared intensity toward shared goals rather than testing each other's limits." },

  'Aries-Sagittarius': { overall: 88, love: 87, friendship: 92, work: 82,
    description: "Two fire signs moving in the same direction — Aries initiates and Sagittarius explores. This combination has a natural joy and freedom that others rarely achieve so effortlessly.",
    strengths: ['Shared love of adventure and independence', 'Deep mutual understanding', 'Genuine friendship at the core'],
    challenges: ['Both may avoid emotional depth', 'Neither excels at practical follow-through', 'Competition for the spotlight'],
    advice: "You are one of the zodiac's great matches — trust it enough to also build something that lasts." },

  'Aries-Capricorn': { overall: 63, love: 60, friendship: 65, work: 72,
    description: "Aries' fire and Capricorn's earth have different timescales — Aries lives in the present moment, Capricorn in the long term. Understanding this difference transforms frustration into complementarity.",
    strengths: ["Capricorn gives Aries' vision structure", "Aries gives Capricorn's plan momentum", 'Both are driven achievers'],
    challenges: ['Very different speeds', "Capricorn's caution frustrates Aries", "Aries' impulsiveness unnerves Capricorn"],
    advice: "Your different timescales are a strength in business. In love, you both need to move toward the middle." },

  'Aries-Aquarius': { overall: 82, love: 80, friendship: 88, work: 78,
    description: "Fire and Air — Aries' energy is amplified by Aquarius' original thinking. This is a partnership of genuine mutual respect between two independent spirits who value autonomy equally.",
    strengths: ['Mutual respect for independence', "Aquarius' ideas ignite Aries' action", 'Neither tries to possess the other'],
    challenges: ["Aquarius' emotional detachment can wound Aries", "Aries' need for recognition meets Aquarius' indifference to hierarchy", ''],
    advice: "Give each other genuine freedom and this partnership can last a lifetime." },

  'Aries-Pisces': { overall: 65, love: 70, friendship: 62, work: 58,
    description: "The warrior and the dreamer — Aries and Pisces have a natural tenderness that surprises both of them. Aries protects Pisces; Pisces opens Aries to emotional depths they rarely access.",
    strengths: ["Aries protects Pisces' sensitive nature", "Pisces opens Aries to emotional wisdom", 'Complementary strengths'],
    challenges: ["Aries' directness can wound Pisces deeply", "Pisces' evasiveness frustrates Aries", 'Different realities'],
    advice: "Aries: be gentler than you think you need to be. Pisces: be clearer than feels comfortable." },

  'Taurus-Taurus': { overall: 80, love: 84, friendship: 78, work: 75,
    description: "Two Taureans together create a relationship of deep comfort, shared values, and genuine stability. The risk is stagnation — you are both so comfortable that growth requires conscious effort.",
    strengths: ['Total mutual understanding', 'Extraordinary physical and sensory compatibility', 'Rock-solid loyalty'],
    challenges: ['Both stubborn to a fault when in conflict', 'Risk of comfortable rut', 'Both may avoid necessary change'],
    advice: "Build intentional novelty into your relationship — comfort is your superpower, but you need challenge too." },

  'Taurus-Gemini': { overall: 62, love: 60, friendship: 65, work: 62,
    description: "Earth meets Air — Taurus values permanence and Gemini values variety. This can be enriching when both appreciate what the other brings, or frustrating when each sees the other's nature as a flaw.",
    strengths: ['Gemini brings freshness to Taurus\' world', "Taurus grounds Gemini's scattered energy", 'Complementary social styles'],
    challenges: ["Taurus finds Gemini too changeable", "Gemini finds Taurus too slow", 'Different relationship with commitment'],
    advice: "Taurus: not every interest Gemini has is a threat to stability. Gemini: not all of Taurus' consistency is boring." },

  'Taurus-Cancer': { overall: 88, love: 90, friendship: 85, work: 80,
    description: "Earth and Water — two of the most security-oriented and home-loving signs. This is one of the most naturally compatible pairings in the zodiac for building a life together.",
    strengths: ['Shared values around home and family', 'Deep emotional and physical compatibility', 'Both deeply loyal'],
    challenges: ["Both can hold onto past hurts too long", "Cancer's moods can unsettle Taurus' need for stability", 'Over-attachment possible'],
    advice: "You have the ingredients for a lasting, nourishing partnership — water the garden regularly and it blooms." },

  'Taurus-Leo': { overall: 65, love: 68, friendship: 62, work: 63,
    description: "Two fixed signs with very different expressions — Taurus' quiet power and Leo's theatrical dominance can clash over who sets the tone. But the shared love of luxury and quality creates surprising common ground.",
    strengths: ['Both appreciate beauty and quality', 'Stubborn loyalty from both sides', 'Strong physical attraction'],
    challenges: ["Leo's drama irritates Taurus", "Taurus' understatement feels like withholding to Leo", 'Both are extraordinarily fixed in position'],
    advice: "Appreciate how differently you shine. Taurus: let Leo have the spotlight sometimes. Leo: let Taurus set the pace sometimes." },

  'Taurus-Virgo': { overall: 87, love: 85, friendship: 88, work: 90,
    description: "Two Earth signs — a deeply natural compatibility built on shared values of practicality, loyalty, and quality. This is one of the most naturally functional partnerships in the zodiac.",
    strengths: ['Shared practicality and work ethic', 'Genuine mutual respect', 'Both value loyalty above almost everything'],
    challenges: ["Virgo's criticism can wound Taurus' pride", 'Both can be inflexible', 'May lack spontaneity'],
    advice: "You are one of the zodiac's most compatible pairs — but make room for joy and playfulness alongside your shared diligence." },

  'Taurus-Libra': { overall: 72, love: 75, friendship: 70, work: 68,
    description: "Both ruled by Venus — both love beauty, pleasure, and harmony. The difference is that Taurus is earth-bound and Libra is air-driven. The shared aesthetic creates connection; the different priorities create friction.",
    strengths: ['Shared appreciation for beauty and comfort', 'Both are naturally diplomatic', 'Strong aesthetic compatibility'],
    challenges: ["Taurus finds Libra too indecisive", "Libra finds Taurus too stubborn", 'Different social needs'],
    advice: "Your Venus connection is a genuine gift — the challenge is learning each other's different expressions of it." },

  'Taurus-Scorpio': { overall: 75, love: 80, friendship: 70, work: 72,
    description: "Opposites on the zodiac wheel — Taurus holds on, Scorpio transforms. The attraction is often powerful and the relationship can be profoundly meaningful, if both can tolerate the intensity.",
    strengths: ['Extraordinary loyalty when bonded', 'Deep physical and emotional intensity', "Scorpio's depth enriches Taurus' world"],
    challenges: ['Both are enormously fixed and stubborn', "Scorpio's secretiveness unsettles Taurus", 'Power struggles can be prolonged'],
    advice: "Trust is the foundation of this pairing — build it carefully and protect it fiercely." },

  'Taurus-Sagittarius': { overall: 60, love: 58, friendship: 62, work: 60,
    description: "Earth meets Fire — Taurus needs roots while Sagittarius needs wings. This is one of the more challenging element combinations, but mutual respect for each other's nature can create genuine complementarity.",
    strengths: ["Sagittarius expands Taurus' horizons", "Taurus grounds Sagittarius' wandering energy", 'Each brings what the other lacks'],
    challenges: ["Taurus finds Sagittarius unreliable", "Sagittarius finds Taurus too limiting", 'Fundamentally different needs'],
    advice: "Taurus: not all movement is instability. Sagittarius: not all roots are cages." },

  'Taurus-Capricorn': { overall: 88, love: 85, friendship: 88, work: 92,
    description: "Two Earth signs with complementary ambitions — Taurus builds beauty and Capricorn builds empires. This is one of the most naturally compatible and productively powerful pairings in the zodiac.",
    strengths: ['Shared values around stability and achievement', 'Deep mutual respect', 'Extraordinary work compatibility'],
    challenges: ['Both can be too serious', 'Neither is naturally emotionally expressive', 'Risk of prioritising achievement over connection'],
    advice: "Make sure you build a life together, not just a lifestyle. The warmth is there — let it show." },

  'Taurus-Aquarius': { overall: 55, love: 52, friendship: 58, work: 60,
    description: "One of the more challenging pairings — Taurus values tradition and Aquarius values revolution. The gap between their worldviews requires significant mutual respect to bridge.",
    strengths: ['Both are fixed and committed when bonded', "Aquarius can introduce Taurus to new worlds", 'Stubborn loyalty from both'],
    challenges: ["Taurus finds Aquarius too unpredictable", "Aquarius finds Taurus too conventional", 'Very different visions of life'],
    advice: "This relationship is a genuine growth challenge. If you choose it, choose it with eyes open." },

  'Taurus-Pisces': { overall: 85, love: 88, friendship: 82, work: 78,
    description: "Earth and Water — Taurus provides the security and stability that Pisces needs to thrive; Pisces provides the emotional depth and spiritual richness that Taurus secretly craves. A beautiful pairing.",
    strengths: ['Deep mutual nourishment', "Taurus grounds Pisces' drifting energy", "Pisces enriches Taurus' emotional world"],
    challenges: ["Pisces' evasiveness frustrates Taurus", "Taurus' materialism can seem cold to Pisces", 'Different engagement with reality'],
    advice: "Taurus: believe in what you can't touch. Pisces: trust the ground beneath your feet." },

  'Gemini-Gemini': { overall: 78, love: 75, friendship: 88, work: 72,
    description: "Two Geminis together create an endlessly stimulating, sometimes chaotic partnership. You understand each other completely — which means you also understand each other's avoidances.",
    strengths: ['Extraordinary intellectual connection', 'Never a dull moment', 'Deep mutual understanding'],
    challenges: ['Who grounds whom?', 'Both can avoid emotional depth', 'Commitment can feel elusive'],
    advice: "Give yourselves permission to go deep as well as wide. Your connection is rare — let it become substantial." },

  'Gemini-Cancer': { overall: 65, love: 68, friendship: 63, work: 60,
    description: "Air meets Water — Gemini processes the world intellectually, Cancer processes it emotionally. The gap can produce beautiful complementarity or persistent misunderstanding.",
    strengths: ["Gemini's wit lightens Cancer's emotional world", "Cancer's warmth anchors Gemini", 'Complementary social styles'],
    challenges: ["Cancer finds Gemini emotionally shallow", "Gemini finds Cancer too clingy", 'Very different processing styles'],
    advice: "Gemini: not every emotion needs to be explained. Cancer: not every silence means disconnection." },

  'Gemini-Leo': { overall: 84, love: 85, friendship: 87, work: 78,
    description: "Air feeds Fire — Gemini's ideas ignite Leo's ambition, and Leo's confidence draws out Gemini's best performance. This is a naturally energising and fun combination.",
    strengths: ['Mutual inspiration and admiration', "Gemini's variety keeps Leo entertained", "Leo's confidence grounds Gemini's choices"],
    challenges: ["Leo needs consistent admiration that Gemini forgets to give", "Gemini's changeability can unsettle Leo", 'Social dynamics can create tension'],
    advice: "Leo: appreciate Gemini's mind, not just their attention. Gemini: acknowledge Leo's need for recognition — it costs you nothing." },

  'Gemini-Virgo': { overall: 65, love: 62, friendship: 68, work: 70,
    description: "Two Mercury-ruled signs — both highly analytical, both communicative. The shared intellectual ground is real, but Virgo's precision and Gemini's flexibility create friction.",
    strengths: ['Both are highly intelligent and communicative', 'Shared love of information', 'Work well as intellectual partners'],
    challenges: ["Virgo's criticism exhausts Gemini", "Gemini's changeability frustrates Virgo", "Both can be 'in the head' rather than the heart"],
    advice: "Use your shared Mercury energy to build genuine understanding rather than winning arguments." },

  'Gemini-Libra': { overall: 90, love: 88, friendship: 93, work: 85,
    description: "Two Air signs — Gemini and Libra have a natural intellectual and social harmony that makes this one of the easiest and most enjoyable pairings in the zodiac.",
    strengths: ['Extraordinary intellectual and social compatibility', 'Mutual understanding of how the other thinks', 'Genuine friendship at the core'],
    challenges: ['Both avoid confrontation and difficult conversations', 'Neither is naturally grounding', 'Decisions can be endlessly deferred'],
    advice: "You are naturally suited — trust yourselves enough to also be honest when honesty is needed." },

  'Gemini-Scorpio': { overall: 60, love: 62, friendship: 58, work: 62,
    description: "Air and Water at their most different — Gemini keeps everything light and mobile; Scorpio goes deep and stays there. The attraction can be real, but the communication styles are fundamentally different.",
    strengths: ["Scorpio's depth fascinates Gemini", "Gemini's lightness intrigues Scorpio", 'Each sees a world the other hasn\'t accessed'],
    challenges: ["Scorpio finds Gemini superficial", "Gemini finds Scorpio too heavy", 'Very different emotional needs'],
    advice: "This relationship teaches both of you something important — Gemini to go deeper, Scorpio to go lighter." },

  'Gemini-Sagittarius': { overall: 82, love: 80, friendship: 88, work: 75,
    description: "Opposites on the zodiac wheel — both mutable, both in love with ideas and experience. This is a relationship of genuine intellectual adventure and expansive possibility.",
    strengths: ['Shared love of learning, travel, and ideas', "Sagittarius gives Gemini's curiosity direction", "Gemini gives Sagittarius' adventures context"],
    challenges: ['Both are commitment-ambivalent', 'Neither is naturally grounding', 'Too much variety, not enough depth'],
    advice: "You understand each other's need for freedom — use that understanding to build something that actually endures." },

  'Gemini-Capricorn': { overall: 58, love: 55, friendship: 60, work: 65,
    description: "Air meets Earth in one of the more unlikely combinations — Gemini's versatility and Capricorn's structure rarely speak the same language naturally. But mutual respect can create genuine complementarity.",
    strengths: ["Capricorn gives Gemini's ideas structure", "Gemini introduces Capricorn to new perspectives", 'Strong work partnership potential'],
    challenges: ["Capricorn finds Gemini flighty", "Gemini finds Capricorn too rigid", 'Very different social styles'],
    advice: "In work, you complement each other brilliantly. In love, you both need to move significantly toward the middle." },

  'Gemini-Aquarius': { overall: 90, love: 87, friendship: 95, work: 88,
    description: "Two Air signs at their most harmonious — Gemini and Aquarius have a natural intellectual kinship that makes this one of the zodiac's most genuinely friendly and stimulating pairings.",
    strengths: ['Extraordinary intellectual connection', 'Mutual respect for independence', 'Both love ideas and people'],
    challenges: ['Both can emotionally detach under pressure', 'Neither is naturally grounding for the other', 'May avoid intimacy'],
    advice: "You are genuinely well-suited — the work is to let the intellectual become emotional as well." },

  'Gemini-Pisces': { overall: 65, love: 68, friendship: 63, work: 58,
    description: "Air and Water — Gemini's analytical mind and Pisces' intuitive heart approach the world from completely different directions, but each has something the other needs.",
    strengths: ["Pisces opens Gemini to emotional depth", "Gemini helps Pisces articulate their inner world", 'Creative potential is high'],
    challenges: ["Gemini's rationalism misses Pisces' emotional signals", "Pisces finds Gemini cold", 'Very different processing styles'],
    advice: "Meet each other where you are rather than where you wish the other was." },

  'Cancer-Cancer': { overall: 82, love: 86, friendship: 80, work: 72,
    description: "Two Cancers together create a home of extraordinary emotional depth and nurturing warmth. The risk is over-sensitivity — two deeply feeling people need clear communication to avoid mutual hurt.",
    strengths: ['Total emotional understanding', 'Deep domestic harmony', 'Extraordinary loyalty and care'],
    challenges: ['Double the moodiness', 'Both can retreat into emotional shells simultaneously', 'Codependency risk'],
    advice: "Your emotional attunement is rare — protect it by communicating clearly rather than expecting to be understood intuitively." },

  'Cancer-Leo': { overall: 70, love: 73, friendship: 68, work: 65,
    description: "Water meets Fire — Cancer's nurturing and Leo's warmth create a relationship of genuine tenderness and protection. Leo's light can illuminate Cancer's world; Cancer's care can sustain Leo's need for love.",
    strengths: ["Leo's warmth melts Cancer's protective shell", "Cancer nurtures Leo's emotional needs", 'Both are deeply loyal when committed'],
    challenges: ["Leo's need for public recognition conflicts with Cancer's privacy preference", "Cancer's moods can dampen Leo's energy", 'Different social styles'],
    advice: "Cancer: let Leo shine publicly. Leo: make Cancer feel cherished privately." },

  'Cancer-Virgo': { overall: 80, love: 78, friendship: 82, work: 78,
    description: "Water and Earth — Cancer's emotional depth and Virgo's practical care combine to create a relationship of genuine mutual service. Both show love through care; they simply do it differently.",
    strengths: ['Both deeply devoted and service-oriented', "Virgo's practicality calms Cancer's emotional storms", "Cancer's warmth softens Virgo's critical edge"],
    challenges: ["Virgo's analysis can feel cold to Cancer", "Cancer's moodiness frustrates Virgo's order-seeking", 'Both can be self-critical'],
    advice: "You both want to take care — of each other and of the world. Let that shared impulse be your foundation." },

  'Cancer-Libra': { overall: 62, love: 65, friendship: 60, work: 58,
    description: "Water and Air — Cancer feels and Libra thinks. Both seek harmony, but through very different means. Building this relationship requires genuine curiosity about how the other's world works.",
    strengths: ['Both seek harmony and peace', 'Each can appreciate the other\'s sensitivity', 'Complementary social gifts'],
    challenges: ["Cancer finds Libra emotionally unavailable", "Libra finds Cancer's emotions overwhelming", 'Different relationship with conflict'],
    advice: "Cancer: not all of Libra's distance is rejection. Libra: not all of Cancer's emotion is demand." },

  'Cancer-Scorpio': { overall: 92, love: 95, friendship: 88, work: 82,
    description: "Two Water signs at their most profound — Cancer and Scorpio have a depth of emotional understanding that few other combinations achieve. This is one of the zodiac's great love matches.",
    strengths: ['Extraordinary emotional depth and understanding', 'Deep loyalty and commitment', 'Intuitive understanding of each other'],
    challenges: ["Both carry emotional wounds that can reopen", "Scorpio's intensity can overwhelm Cancer", 'Both can hold onto pain too long'],
    advice: "You have the capacity for one of the most profound connections in the zodiac — protect it by healing individually as well as together." },

  'Cancer-Sagittarius': { overall: 58, love: 60, friendship: 57, work: 55,
    description: "Water meets Fire in one of the more challenging combinations — Cancer needs roots and Sagittarius needs wings. The gap between their fundamental needs requires significant effort to bridge.",
    strengths: ["Sagittarius expands Cancer's emotional world", "Cancer nurtures what Sagittarius can't maintain alone", 'Each has what the other lacks'],
    challenges: ["Cancer's need for security conflicts with Sagittarius' need for freedom", "Sagittarius' directness wounds Cancer", 'Very different home relationships'],
    advice: "Cancer: not all adventure destroys security. Sagittarius: not all commitment destroys freedom." },

  'Cancer-Capricorn': { overall: 75, love: 78, friendship: 72, work: 78,
    description: "Opposites on the zodiac wheel — Cancer represents home and Capricorn represents ambition. The attraction of opposites creates a relationship where each provides what the other needs but struggles to give themselves.",
    strengths: ['Deeply complementary strengths', "Capricorn provides security Cancer needs", "Cancer provides warmth Capricorn lacks"],
    challenges: ["Capricorn's emotional reserve can hurt Cancer", "Cancer's emotional demands can overwhelm Capricorn", 'Very different expressive styles'],
    advice: "Capricorn: let Cancer teach you to feel. Cancer: let Capricorn teach you to achieve." },

  'Cancer-Aquarius': { overall: 55, love: 52, friendship: 58, work: 57,
    description: "Water and Air in one of the zodiac's most challenging combinations — Cancer's deep emotional world and Aquarius' intellectual detachment speak entirely different languages.",
    strengths: ["Aquarius' originality intrigues Cancer", "Cancer's depth can ground Aquarius", 'Each can learn enormously from the other'],
    challenges: ["Aquarius' emotional detachment wounds Cancer", "Cancer's emotional intensity overwhelms Aquarius", 'Fundamentally different needs'],
    advice: "This relationship is a profound teacher for both — but it requires both to grow significantly." },

  'Cancer-Pisces': { overall: 90, love: 93, friendship: 88, work: 78,
    description: "Two Water signs — Cancer and Pisces speak the same emotional language with extraordinary fluency. This is one of the most naturally harmonious combinations in the zodiac.",
    strengths: ['Deep emotional attunement', 'Mutual care and nurturing', 'Shared spiritual and creative sensibility'],
    challenges: ['Both can be evasive about practical matters', 'Boundaries can blur in unhealthy ways', 'Need to build real-world structure'],
    advice: "Your emotional connection is a gift — ground it in practical reality and it becomes a lasting partnership." },

  'Leo-Leo': { overall: 80, love: 82, friendship: 80, work: 75,
    description: "Two Leos together create a relationship of extraordinary warmth, generosity, and theatrical delight — and a competition for the spotlight that requires conscious management.",
    strengths: ['Mutual generosity and warmth', 'Genuine understanding of each other', 'Life together is never dull'],
    challenges: ['Both need to be the sun — a system needs only one', 'Pride makes apology very difficult', 'Drama can escalate'],
    advice: "There is enough spotlight for both of you. Celebrate each other as your greatest audience." },

  'Leo-Virgo': { overall: 63, love: 62, friendship: 65, work: 68,
    description: "Fire and Earth in an unlikely pairing — Leo's theatre meets Virgo's precision. The differences are significant, but each has something the other genuinely needs.",
    strengths: ["Virgo's attention improves Leo's work", "Leo's confidence lifts Virgo's self-worth", 'Complementary in shared projects'],
    challenges: ["Virgo's criticism devastates Leo's pride", "Leo's ego irritates Virgo's modesty preference", 'Very different styles of giving care'],
    advice: "Virgo: deliver your precision as admiration, not correction. Leo: receive Virgo's care as love, not criticism." },

  'Leo-Libra': { overall: 85, love: 87, friendship: 85, work: 80,
    description: "Fire and Air — Leo's confidence and Libra's charm create one of the most naturally charismatic and socially brilliant combinations in the zodiac.",
    strengths: ['Both love beauty, socialising, and romance', 'Mutual admiration and appreciation', 'Leo leads, Libra refines'],
    challenges: ["Libra's indecision frustrates Leo", "Leo's ego can overshadow Libra's needs", 'Both can avoid necessary confrontations'],
    advice: "You look extraordinary together — make sure you're also real with each other beneath the performance." },

  'Leo-Scorpio': { overall: 68, love: 72, friendship: 62, work: 65,
    description: "Two fixed signs with fierce energies — Leo's warmth and Scorpio's intensity create a relationship of remarkable power and passion that can be either profoundly bonding or explosive.",
    strengths: ['Extraordinary passion and intensity', 'Both are deeply loyal when committed', 'Genuine mutual respect for strength'],
    challenges: ["Scorpio's secrecy frustrates transparent Leo", "Leo's need for public admiration conflicts with Scorpio's privacy", 'Power struggles are inevitable'],
    advice: "Both of you are used to being the most powerful person in the room. Find out what happens when you combine forces instead." },

  'Leo-Sagittarius': { overall: 88, love: 88, friendship: 90, work: 82,
    description: "Two fire signs in a partnership of extraordinary energy, optimism, and joy. This is one of the most naturally compatible pairings — two people who make each other more fully themselves.",
    strengths: ['Shared optimism and love of life', 'Genuine mutual admiration', 'Both are generous and warm'],
    challenges: ['Neither is naturally grounding', 'Both can avoid emotional depth', 'Too much together-time can become overwhelming'],
    advice: "You are one of the zodiac's most naturally joyful pairings — protect it by also building depth together." },

  'Leo-Capricorn': { overall: 63, love: 60, friendship: 63, work: 72,
    description: "Fire and Earth — Leo's theatricality and Capricorn's reserve seem unlikely partners, but shared ambition and genuine mutual respect for achievement can create a surprisingly powerful bond.",
    strengths: ['Both are ambitious and driven', "Capricorn's structure supports Leo's vision", "Leo's warmth thaws Capricorn's reserve"],
    challenges: ["Capricorn's emotional restraint disappoints Leo", "Leo's dramatic style makes Capricorn uncomfortable", 'Very different social presentations'],
    advice: "You both want to achieve — let that shared drive be your foundation and let difference be your enrichment." },

  'Leo-Aquarius': { overall: 72, love: 72, friendship: 73, work: 70,
    description: "Opposites on the zodiac wheel — Leo's individual star power meets Aquarius' collective vision. The attraction between opposite archetypes is real; the relationship requires genuine mutual respect.",
    strengths: ['Magnetic attraction of opposites', 'Leo brings personal warmth to Aquarius\' ideals', "Aquarius broadens Leo's vision"],
    challenges: ["Leo's need for personal recognition clashes with Aquarius' egalitarianism", "Aquarius' detachment wounds Leo", 'Different definitions of loyalty'],
    advice: "Leo: not all of Aquarius' independence is rejection. Aquarius: personalise your love — Leo needs to feel chosen, not just included." },

  'Leo-Pisces': { overall: 67, love: 70, friendship: 65, work: 60,
    description: "Fire and Water — Leo's boldness and Pisces' sensitivity require careful handling. But when Leo's warmth meets Pisces' depth, the result can be a relationship of remarkable tenderness and beauty.",
    strengths: ["Leo's warmth makes Pisces feel safe enough to open fully", "Pisces' appreciation fulfills Leo's need for recognition", 'Both are romantic and generous'],
    challenges: ["Pisces' evasiveness frustrates Leo", "Leo's dominance can overwhelm sensitive Pisces", 'Different realities'],
    advice: "Leo: be gentle with what Pisces shows you. Pisces: be clear about your needs — Leo responds to directness." },

  'Virgo-Virgo': { overall: 78, love: 75, friendship: 80, work: 85,
    description: "Two Virgos together create a relationship of extraordinary functionality, shared standards, and mutual understanding. The risk is mutual criticism creating a self-reinforcing cycle.",
    strengths: ['Total mutual understanding', 'Exceptional practical compatibility', 'Shared standards and values'],
    challenges: ['Double the self-criticism and mutual criticism', "Neither may know how to turn the analytical mind off", 'Risk of neglecting emotional needs'],
    advice: "You understand each other completely — now use that understanding to be gentler with each other than you are with yourselves." },

  'Virgo-Libra': { overall: 68, love: 65, friendship: 70, work: 72,
    description: "Earth and Air — Virgo's precise analysis and Libra's balanced aestheticism share a love of beauty but express it very differently. Building this relationship requires mutual appreciation of different perfectionism.",
    strengths: ['Both love beauty and refinement', "Libra's social ease complements Virgo's depth", 'Both are thoughtful and considerate'],
    challenges: ["Virgo finds Libra too indecisive and superficial", "Libra finds Virgo too critical", 'Different engagement with imperfection'],
    advice: "Virgo: beauty comes in more forms than precision. Libra: depth requires moving through discomfort sometimes." },

  'Virgo-Scorpio': { overall: 85, love: 85, friendship: 83, work: 85,
    description: "Earth and Water — Virgo's analytical precision and Scorpio's emotional depth create a partnership of remarkable intelligence and intensity. Both are private, perceptive, and devoted.",
    strengths: ['Deep mutual respect for intelligence', 'Both are intensely private and loyal', 'Complementary analytical and intuitive gifts'],
    challenges: ["Scorpio's intensity can overwhelm Virgo", "Virgo's criticism can trigger Scorpio's sting", 'Both can hold onto grudges'],
    advice: "You are one of the zodiac's most intelligent and capable pairings — build trust slowly and it will last." },

  'Virgo-Sagittarius': { overall: 58, love: 55, friendship: 60, work: 60,
    description: "Earth meets Fire in a pairing of genuine but challenging differences. Virgo's precision and Sagittarius' breadth create friction, but also genuine learning opportunities.",
    strengths: ["Sagittarius expands Virgo's world", "Virgo brings structure to Sagittarius' vision", 'Each learns from the other'],
    challenges: ["Virgo finds Sagittarius reckless", "Sagittarius finds Virgo too limiting", 'Very different relationships with detail'],
    advice: "Virgo: not all of Sagittarius' leaps end in disaster. Sagittarius: not all of Virgo's caution is fear." },

  'Virgo-Capricorn': { overall: 90, love: 87, friendship: 90, work: 95,
    description: "Two Earth signs in one of the zodiac's most naturally compatible pairings — Virgo's precision and Capricorn's ambition are made for each other. This is a relationship of deep mutual respect and shared purpose.",
    strengths: ['Extraordinary practical compatibility', 'Deep mutual respect for diligence and capability', 'Shared values around quality and integrity'],
    challenges: ['Both may prioritise work over relationship', 'Neither is naturally emotionally expressive', 'Risk of the relationship becoming transactional'],
    advice: "You are one of the zodiac's great power couples — make sure you're building a relationship, not just an enterprise." },

  'Virgo-Aquarius': { overall: 58, love: 55, friendship: 60, work: 63,
    description: "Earth and Air in a pairing of significant intellectual compatibility but very different approaches to life. Virgo's practical precision and Aquarius' visionary idealism require genuine effort to bridge.",
    strengths: ['Both are highly intelligent and analytical', "Aquarius' vision meets Virgo's execution", 'Strong intellectual respect'],
    challenges: ["Virgo finds Aquarius too abstract", "Aquarius finds Virgo too narrow", 'Different relationships with tradition vs. innovation'],
    advice: "In work you can achieve remarkable things together. In love, both need to meet in the emotional middle." },

  'Virgo-Pisces': { overall: 78, love: 80, friendship: 75, work: 72,
    description: "Opposites on the zodiac wheel — Virgo's practical precision and Pisces' fluid intuition are complementary when respected. Virgo grounds Pisces; Pisces opens Virgo to what analysis cannot reach.",
    strengths: ["Virgo provides structure Pisces needs", "Pisces teaches Virgo to trust beyond the visible", 'Both are genuinely caring and devoted'],
    challenges: ["Virgo's criticism wounds sensitive Pisces", "Pisces' evasiveness frustrates systematic Virgo", 'Very different realities'],
    advice: "Virgo: not everything can be improved. Pisces: not everything can remain undefined." },

  'Libra-Libra': { overall: 78, love: 80, friendship: 80, work: 72,
    description: "Two Libras together create a relationship of extraordinary beauty, charm, and social grace — and a potentially paralysing inability to make decisions or navigate conflict.",
    strengths: ['Total aesthetic and social harmony', 'Deep mutual understanding', 'Genuinely beautiful together'],
    challenges: ['No one to make the difficult decisions', 'Conflict avoidance can build resentment', 'Both may prioritise the appearance of harmony over its reality'],
    advice: "Practice being honest with each other — two people who know diplomacy can surely find a kind way to say the hard thing." },

  'Libra-Scorpio': { overall: 65, love: 68, friendship: 62, work: 63,
    description: "Air and Water — Libra's lightness and Scorpio's depth create a relationship of genuine fascination and significant friction. Each is drawn to what the other has, but each also challenges the other fundamentally.",
    strengths: ["Scorpio's depth fascinates Libra", "Libra's lightness intrigues Scorpio", 'Strong intellectual and physical chemistry'],
    challenges: ["Scorpio finds Libra superficial", "Libra finds Scorpio too intense", "Libra's social nature conflicts with Scorpio's need for exclusivity"],
    advice: "Libra: go deeper than you're comfortable with. Scorpio: come lighter than you prefer." },

  'Libra-Sagittarius': { overall: 85, love: 83, friendship: 88, work: 78,
    description: "Air and Fire — Libra's harmony and Sagittarius' adventure create a naturally joyful and expansive partnership. Both love ideas, socialising, and the good things in life.",
    strengths: ['Shared love of ideas, travel, and beauty', 'Both are naturally social and charming', "Sagittarius' energy animates Libra's vision"],
    challenges: ["Sagittarius' directness conflicts with Libra's diplomacy", "Libra's indecision frustrates Sagittarius", 'Neither is naturally grounding'],
    advice: "You bring out each other's best social selves — make sure you're also real with each other in private." },

  'Libra-Capricorn': { overall: 60, love: 58, friendship: 60, work: 68,
    description: "Air and Earth — Libra's social grace and Capricorn's ambition work well in professional contexts but require more effort in intimate ones. Both appreciate status but express it very differently.",
    strengths: ['Both appreciate quality and status', "Capricorn's structure complements Libra's vision", 'Strong professional compatibility'],
    challenges: ["Capricorn's seriousness weighs on Libra", "Libra's lightness irritates Capricorn", 'Very different social styles'],
    advice: "Libra: respect Capricorn's seriousness as depth, not heaviness. Capricorn: let Libra's lightness teach you to enjoy what you've built." },

  'Libra-Aquarius': { overall: 88, love: 85, friendship: 93, work: 85,
    description: "Two Air signs — Libra and Aquarius have a natural intellectual and social kinship. This is one of the zodiac's most naturally harmonious and friendship-based pairings.",
    strengths: ['Extraordinary intellectual and social compatibility', 'Both value fairness and progressive ideas', "Aquarius' originality meets Libra's refinement"],
    challenges: ['Neither is naturally emotionally deep under pressure', 'May prioritise the ideal over the real', 'Both can avoid intimacy'],
    advice: "You are genuinely well-suited — let the friendship become full emotional intimacy as well." },

  'Libra-Pisces': { overall: 70, love: 73, friendship: 68, work: 62,
    description: "Air and Water — Libra's harmony-seeking and Pisces' dream-weaving create a relationship of beauty and sensitivity that is genuinely lovely when it works.",
    strengths: ['Both are sensitive, gentle, and romantic', "Pisces' depth enriches Libra's world", "Libra's clarity helps Pisces define their dreams"],
    challenges: ["Neither is naturally decisive", "Both avoid conflict in ways that build resentment", "Pisces' emotional world can overwhelm Libra"],
    advice: "Beautiful intentions need practical follow-through. This relationship needs someone to make decisions — take turns." },

  'Scorpio-Scorpio': { overall: 82, love: 86, friendship: 78, work: 78,
    description: "Two Scorpios together create a relationship of extraordinary intensity, depth, and loyalty — and a power struggle that requires both to have done significant inner work.",
    strengths: ['Total emotional understanding', 'Extraordinary loyalty when truly bonded', 'Deep shared passion and intensity'],
    challenges: ['Power struggles can be devastating', 'Both can weaponise emotional knowledge of the other', 'Intensity can become destructive without self-awareness'],
    advice: "Two Scorpios who have done their own work can create one of the most profound partnerships in the zodiac. Two who have not can wound each other deeply. Do the work first." },

  'Scorpio-Sagittarius': { overall: 60, love: 62, friendship: 58, work: 58,
    description: "Water meets Fire — Scorpio's depth and Sagittarius' expansiveness are fundamentally different. The attraction can be real and strong, but the fundamental needs are in tension.",
    strengths: ["Sagittarius' optimism can lift Scorpio's intensity", "Scorpio's depth gives Sagittarius' adventures meaning", 'Both are intensely alive'],
    challenges: ["Scorpio finds Sagittarius too shallow", "Sagittarius finds Scorpio too heavy", "Scorpio's need for exclusivity conflicts with Sagittarius' freedom"],
    advice: "Scorpio: not all of Sagittarius' lightness is avoidance. Sagittarius: not all of Scorpio's depth is demand." },

  'Scorpio-Capricorn': { overall: 85, love: 83, friendship: 85, work: 88,
    description: "Water and Earth — Scorpio's emotional depth and Capricorn's ambition create a relationship of remarkable power, loyalty, and achievement. Both are private, driven, and intensely capable.",
    strengths: ['Deep mutual respect for capability and strength', 'Both are intensely loyal when committed', 'Extraordinary work compatibility'],
    challenges: ["Both are emotionally reserved, making vulnerability difficult", 'Power dynamics need conscious management', 'Both can be unforgiving'],
    advice: "You are one of the zodiac's power pairings. Let yourselves be vulnerable with each other — your strength can hold it." },

  'Scorpio-Aquarius': { overall: 55, love: 52, friendship: 57, work: 60,
    description: "Two fixed signs with radically different approaches — Scorpio goes deep and holds on; Aquarius goes wide and releases. The fundamental orientations are in tension.",
    strengths: ['Both are intensely fixed and committed when bonded', "Aquarius' independence intrigues Scorpio", "Scorpio's depth fascinates Aquarius"],
    challenges: ["Scorpio's need for exclusivity conflicts with Aquarius' freedom", "Aquarius' detachment activates Scorpio's insecurity", 'Very different emotional needs'],
    advice: "This relationship challenges both at their core. If you choose it, choose it as a growth practice." },

  'Scorpio-Pisces': { overall: 92, love: 95, friendship: 88, work: 80,
    description: "Two Water signs at their most profound — Scorpio and Pisces have an emotional and intuitive understanding so deep it can feel like telepathy. This is one of the zodiac's most powerful love matches.",
    strengths: ['Extraordinary emotional and intuitive attunement', 'Mutual understanding without explanation', "Pisces' compassion softens Scorpio's intensity"],
    challenges: ["Scorpio's possessiveness can overwhelm Pisces", 'Both can avoid practical reality', 'Shared emotional depth can amplify pain as well as joy'],
    advice: "You have one of the most profound connections possible. Ground it in practical reality and protect it from your shared tendency toward emotional intensity." },

  'Sagittarius-Sagittarius': { overall: 83, love: 82, friendship: 90, work: 75,
    description: "Two fire signs with the same love of adventure, ideas, and freedom. The connection is immediate and joyful. The challenge is building something that lasts when both are always looking at the horizon.",
    strengths: ['Genuine mutual understanding and freedom', 'Joyful, adventurous, never boring', 'Deep intellectual and philosophical connection'],
    challenges: ['Neither is naturally grounding', 'Commitment can feel threatening to both', "Who comes back when both are adventuring?"],
    advice: "Give yourselves the gift of a base — somewhere to return to that is yours together." },

  'Sagittarius-Capricorn': { overall: 62, love: 60, friendship: 63, work: 68,
    description: "Fire and Earth — Sagittarius' expansiveness and Capricorn's structure create a relationship of genuine complementarity when both respect what the other brings.",
    strengths: ["Capricorn gives Sagittarius' vision structure", "Sagittarius gives Capricorn's achievement meaning", 'Complementary skills'],
    challenges: ["Capricorn finds Sagittarius irresponsible", "Sagittarius finds Capricorn too restrictive", 'Very different timescales'],
    advice: "Sagittarius: not all structure is a cage. Capricorn: not all freedom is irresponsibility." },

  'Sagittarius-Aquarius': { overall: 87, love: 85, friendship: 92, work: 82,
    description: "Fire and Air — Sagittarius' exploration and Aquarius' innovation create a naturally progressive, freedom-loving partnership of genuine intellectual kinship.",
    strengths: ['Shared love of ideas, freedom, and progress', 'Mutual respect for independence', 'Both are genuinely forward-thinking'],
    challenges: ['Neither is naturally grounding', 'Emotional depth may be avoided', 'Both need to build intimate connection intentionally'],
    advice: "You are naturally aligned on values and vision. Let yourselves also be aligned emotionally." },

  'Sagittarius-Pisces': { overall: 67, love: 70, friendship: 65, work: 60,
    description: "Two mutable signs with shared idealism but different orientations — Sagittarius seeks truth in the external world, Pisces in the internal. The connection is real; the bridge requires building.",
    strengths: ['Shared idealism and spiritual sensitivity', "Sagittarius gives Pisces' dreams direction", "Pisces gives Sagittarius' adventures emotional meaning"],
    challenges: ["Sagittarius' directness wounds Pisces", "Pisces' evasiveness frustrates Sagittarius", 'Both can avoid grounded reality'],
    advice: "You dream in compatible languages. Build something real together with those shared visions." },

  'Capricorn-Capricorn': { overall: 80, love: 78, friendship: 82, work: 90,
    description: "Two Capricorns together create a relationship of extraordinary shared purpose, achievement, and reliability. The risk is building a business partnership rather than a romantic one.",
    strengths: ['Total mutual understanding of ambition and work ethic', 'Deep shared values', 'Remarkable practical partnership'],
    challenges: ['Both may deprioritise emotional intimacy', 'Emotional expression is difficult for both', 'Risk of a cold but functional dynamic'],
    advice: "You understand each other completely on the practical level — now learn to understand each other emotionally as well." },

  'Capricorn-Aquarius': { overall: 60, love: 57, friendship: 62, work: 68,
    description: "Two very different takes on authority — Capricorn respects established structures, Aquarius challenges them. The common ground is a shared sense of purpose and the patience to do things well.",
    strengths: ['Both are serious and capable', "Aquarius' innovation meets Capricorn's implementation", 'Strong work partnership potential'],
    challenges: ["Capricorn finds Aquarius too rebellious", "Aquarius finds Capricorn too conventional", 'Different relationships with authority'],
    advice: "Capricorn: not all tradition deserves preservation. Aquarius: not all structure deserves destruction." },

  'Capricorn-Pisces': { overall: 83, love: 85, friendship: 80, work: 78,
    description: "Earth and Water — Capricorn's reliability and Pisces' sensitivity create a relationship of genuine mutual nourishment. Capricorn grounds Pisces; Pisces opens Capricorn to what lies beyond achievement.",
    strengths: ["Capricorn provides the security Pisces needs to flourish", "Pisces teaches Capricorn what achievement is ultimately for", "Both are deeply loyal when committed"],
    challenges: ["Capricorn's emotional reserve can hurt sensitive Pisces", "Pisces' evasiveness frustrates systematic Capricorn", 'Different relationships with reality'],
    advice: "Capricorn: let Pisces' world teach you something. Pisces: let Capricorn's world hold you." },

  'Aquarius-Aquarius': { overall: 80, love: 78, friendship: 87, work: 82,
    description: "Two Aquarians together create a relationship of genuine intellectual freedom, mutual independence, and shared progressive vision. The challenge is building emotional intimacy alongside the intellectual bond.",
    strengths: ['Total intellectual understanding and mutual respect', 'Genuine freedom and independence for both', 'Shared values and vision'],
    challenges: ['Both may struggle with emotional intimacy', 'The relationship can be more companionship than passion', 'Who leads when decisions need making?'],
    advice: "You understand each other's minds perfectly. Now understand each other's hearts." },

  'Aquarius-Pisces': { overall: 65, love: 67, friendship: 65, work: 60,
    description: "Air and Water — Aquarius' idealism and Pisces' compassion share a love of humanity but express it very differently. The connection is often spiritual before it is practical.",
    strengths: ['Shared idealism and care for the collective', "Aquarius' clarity can help Pisces articulate their inner world", "Pisces' compassion warms Aquarius' sometimes cold idealism"],
    challenges: ["Aquarius' detachment wounds sensitive Pisces", "Pisces' emotionality overwhelms Aquarius", 'Very different engagement with feelings'],
    advice: "You share a love of humanity — find each other in that space and let it become personal love too." },

  'Pisces-Pisces': { overall: 82, love: 85, friendship: 80, work: 70,
    description: "Two Pisceans together create a relationship of extraordinary emotional depth, creativity, and spiritual attunement. The risk is that neither is naturally grounding, and shared evasion can allow problems to fester.",
    strengths: ['Deep mutual understanding without words', 'Extraordinary creative and spiritual compatibility', 'Both are genuinely compassionate and caring'],
    challenges: ['Neither is naturally practical', 'Shared tendency toward evasion', 'May create a world together that is beautiful but not sustainable'],
    advice: "Your emotional world is extraordinary together. Add one practical discipline to it and it becomes unassailable." },
};

function generateCompatibility(sign1: string, sign2: string): CompatibilityResult {
  const el1 = ELEMENTS[sign1] || 'Fire';
  const el2 = ELEMENTS[sign2] || 'Fire';
  const base = ELEMENT_SCORE[`${el1}-${el2}`] || 70;
  return {
    overall: base,
    love: Math.min(100, Math.max(40, base + Math.floor(Math.sin(sign1.length + sign2.length) * 8))),
    friendship: Math.min(100, Math.max(40, base + Math.floor(Math.cos(sign1.length * sign2.length) * 7))),
    work: Math.min(100, Math.max(40, base + Math.floor(Math.sin(sign1.length * 2) * 6))),
    description: `${sign1} and ${sign2} — ${el1} and ${el2} energy — create a relationship that ${base > 75 ? 'flows naturally and builds on mutual strengths' : 'requires conscious effort to bridge different fundamental natures'}.`,
    strengths: [`${el1} brings ${el1 === 'Fire' ? 'passion' : el1 === 'Earth' ? 'stability' : el1 === 'Air' ? 'ideas' : 'depth'}`, `${el2} brings ${el2 === 'Fire' ? 'enthusiasm' : el2 === 'Earth' ? 'reliability' : el2 === 'Air' ? 'perspective' : 'feeling'}`, 'Mutual growth potential'],
    challenges: ['Different elemental priorities', 'Communication style differences', 'Requires conscious bridging'],
    advice: `Learn to value what the other element brings. ${sign1}'s ${el1} nature and ${sign2}'s ${el2} nature are complementary when respected.`,
  };
}

export function getCompatibility(sign1: string, sign2: string): CompatibilityResult {
  if (!sign1 || !sign2) return generateCompatibility('Aries', 'Aries');
  const cap1 = sign1.charAt(0).toUpperCase() + sign1.slice(1).toLowerCase();
  const cap2 = sign2.charAt(0).toUpperCase() + sign2.slice(1).toLowerCase();
  const key1 = `${cap1}-${cap2}`;
  const key2 = `${cap2}-${cap1}`;
  return COMPATIBILITY_MATRIX[key1] || COMPATIBILITY_MATRIX[key2] || generateCompatibility(cap1, cap2);
}

const TOP_MATCHES: Record<string, Array<{ sign: string; reason: string }>> = {
  Aries: [
    { sign: 'Leo', reason: 'Fire meets fire — mutual passion, confidence, and drive' },
    { sign: 'Sagittarius', reason: 'Adventure and freedom define both — natural soulmates' },
    { sign: 'Gemini', reason: 'Air feeds your fire — intellectual excitement and shared energy' },
  ],
  Taurus: [
    { sign: 'Virgo', reason: 'Earth to earth — shared practicality, loyalty, and quality' },
    { sign: 'Capricorn', reason: 'Two builders — stability, ambition, and deep mutual respect' },
    { sign: 'Cancer', reason: 'Earth and water — security, home, and profound devotion' },
  ],
  Gemini: [
    { sign: 'Libra', reason: 'Two air signs — intellectual harmony and social brilliance' },
    { sign: 'Aquarius', reason: 'Ideas, freedom, and mutual respect — natural partners' },
    { sign: 'Sagittarius', reason: 'Opposite energies that spark — adventure meets curiosity' },
  ],
  Cancer: [
    { sign: 'Scorpio', reason: 'Water to water — emotional depth that transforms both' },
    { sign: 'Pisces', reason: 'Two water signs — intuitive understanding and shared compassion' },
    { sign: 'Taurus', reason: 'Earth anchors water — security, home, and lasting loyalty' },
  ],
  Leo: [
    { sign: 'Aries', reason: 'Fire meeting fire — passion, confidence, and mutual admiration' },
    { sign: 'Sagittarius', reason: 'Joy, warmth, and shared love of life — natural partners' },
    { sign: 'Libra', reason: 'Air feeds your fire — beauty, romance, and social magic' },
  ],
  Virgo: [
    { sign: 'Taurus', reason: 'Earth to earth — shared values, loyalty, and practical excellence' },
    { sign: 'Capricorn', reason: 'Two achievers — deep mutual respect and extraordinary compatibility' },
    { sign: 'Scorpio', reason: 'Both analytical and private — deep trust and shared intensity' },
  ],
  Libra: [
    { sign: 'Gemini', reason: 'Air to air — harmony, ideas, and natural intellectual kinship' },
    { sign: 'Aquarius', reason: 'Both love people and progress — genuine friendship and romance' },
    { sign: 'Leo', reason: 'Fire energises air — warmth, beauty, and social brilliance' },
  ],
  Scorpio: [
    { sign: 'Cancer', reason: 'Water to water — emotional depth and profound understanding' },
    { sign: 'Pisces', reason: 'Two water signs — spiritual attunement and intense love' },
    { sign: 'Capricorn', reason: 'Depth meets ambition — powerful, loyal, and transformative' },
  ],
  Sagittarius: [
    { sign: 'Aries', reason: 'Fire to fire — adventure, passion, and mutual freedom' },
    { sign: 'Leo', reason: 'Joy, generosity, and shared love of life — natural partners' },
    { sign: 'Aquarius', reason: 'Freedom, ideas, and shared progressive vision' },
  ],
  Capricorn: [
    { sign: 'Taurus', reason: 'Earth to earth — shared ambition, reliability, and deep respect' },
    { sign: 'Virgo', reason: 'Two achievers — practical brilliance and extraordinary compatibility' },
    { sign: 'Pisces', reason: 'Earth grounds water — security, depth, and mutual nourishment' },
  ],
  Aquarius: [
    { sign: 'Gemini', reason: 'Air to air — ideas, freedom, and natural intellectual kinship' },
    { sign: 'Libra', reason: 'Both love people and fairness — harmonious and progressive' },
    { sign: 'Sagittarius', reason: 'Freedom, vision, and shared progressive values' },
  ],
  Pisces: [
    { sign: 'Cancer', reason: 'Water to water — intuitive understanding and shared compassion' },
    { sign: 'Scorpio', reason: 'Two water signs — spiritual depth and transformative love' },
    { sign: 'Capricorn', reason: 'Earth holds water — security, loyalty, and mutual enrichment' },
  ],
};

export function getTopCompatibleSigns(sign: string): Array<{ sign: string; score: number; reason: string }> {
  const cap = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  const matches = TOP_MATCHES[cap] || TOP_MATCHES.Aries;
  return matches.map(m => ({
    sign: m.sign,
    score: getCompatibility(cap, m.sign).overall,
    reason: m.reason,
  }));
}
