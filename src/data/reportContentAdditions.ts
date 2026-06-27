// Vedic birthstone by birth month, section explainers, and closing section content

interface VedicBirthstone {
  stone: string;
  vedicName: string;
  planet: string;
  metal: string;
  finger: string;
  day: string;
  purpose: string;
  note: string;
}

const VEDIC_BIRTHSTONES: Record<number, VedicBirthstone> = {
  1: {
    stone: 'Garnet',
    vedicName: 'Gomed (Red)',
    planet: 'Sun (Surya)',
    metal: 'Gold',
    finger: 'Ring finger, right hand',
    day: 'Sunday at sunrise',
    purpose: 'Strengthens vitality, leadership, and solar confidence. Aligns personal will with dharmic purpose.',
    note: 'January-born carry the Sun\'s midwinter strength — the light that persists without fanfare.',
  },
  2: {
    stone: 'Amethyst',
    vedicName: 'Chandramani',
    planet: 'Moon (Chandra)',
    metal: 'Silver',
    finger: 'Little finger or ring finger',
    day: 'Monday at moonrise',
    purpose: 'Soothes the lunar mind, deepens intuition, and supports emotional balance and receptivity.',
    note: 'February-born carry the Moon\'s contemplative quality — the inward knowing that arrives in stillness.',
  },
  3: {
    stone: 'Aquamarine',
    vedicName: 'Pukhraj (light)',
    planet: 'Jupiter (Guru)',
    metal: 'Gold or yellow metal',
    finger: 'Index finger, right hand',
    day: 'Thursday morning',
    purpose: 'Amplifies wisdom, learning, and the expansive Jupiterian quality of finding the larger meaning.',
    note: 'March-born arrive with Jupiter\'s optimism — the philosophical mind that sees the horizon even in difficulty.',
  },
  4: {
    stone: 'Diamond',
    vedicName: 'Heera',
    planet: 'Venus (Shukra)',
    metal: 'White gold or platinum',
    finger: 'Middle finger, right hand',
    day: 'Friday at dawn',
    purpose: 'Channels Venusian grace, aesthetic sensitivity, and the capacity for deep, devoted love.',
    note: 'April-born arrive under Venus\'s first fire — beauty with backbone, love with direction.',
  },
  5: {
    stone: 'Emerald',
    vedicName: 'Panna',
    planet: 'Mercury (Budha)',
    metal: 'Gold or silver',
    finger: 'Little finger, right hand',
    day: 'Wednesday morning',
    purpose: 'Sharpens Mercury\'s gifts: communication, intelligence, adaptability, and the quickness of mind.',
    note: 'May-born carry Mercury\'s restless intelligence — the mind that finds connections others miss.',
  },
  6: {
    stone: 'Pearl',
    vedicName: 'Moti',
    planet: 'Moon (Chandra)',
    metal: 'Silver',
    finger: 'Little finger or ring finger',
    day: 'Monday at moonrise',
    purpose: 'Nurtures the lunar qualities of emotional depth, intuition, and the healing power of receptivity.',
    note: 'June-born arrive at the cusp of summer\'s turning — the Moon\'s depth in the year\'s longest light.',
  },
  7: {
    stone: 'Ruby',
    vedicName: 'Manik',
    planet: 'Sun (Surya)',
    metal: 'Gold',
    finger: 'Ring finger, right hand',
    day: 'Sunday at sunrise',
    purpose: 'Amplifies solar courage, authority, and the vitality that makes genuine leadership possible.',
    note: 'July-born arrive under the summer Sun\'s peak — the year\'s fullest expression of solar confidence.',
  },
  8: {
    stone: 'Peridot',
    vedicName: 'Zabarjad',
    planet: 'Mercury (Budha)',
    metal: 'Gold',
    finger: 'Little finger, right hand',
    day: 'Wednesday morning',
    purpose: 'Supports Mercurian clarity and the ability to discriminate — to perceive what is genuinely useful.',
    note: 'August-born carry the harvest-mind: the intelligence that knows when something is ready.',
  },
  9: {
    stone: 'Blue Sapphire',
    vedicName: 'Neelam',
    planet: 'Saturn (Shani)',
    metal: 'Iron, silver, or white gold',
    finger: 'Middle finger, right hand',
    day: 'Saturday at dusk',
    purpose: 'Channels Saturnine discipline, karmic understanding, and the patient authority of earned wisdom.',
    note: 'September-born carry Saturn\'s harvest energy — the serious, thorough mind that does the work.',
  },
  10: {
    stone: 'Opal',
    vedicName: 'Dudhiya Patthar',
    planet: 'Venus (Shukra)',
    metal: 'Silver or white gold',
    finger: 'Middle finger, right hand',
    day: 'Friday at dawn',
    purpose: 'Opens Venusian creativity, beauty, and the gift for seeing the extraordinary in the ordinary.',
    note: 'October-born arrive under Venus\'s autumnal grace — the beauty that comes after summer\'s fullness.',
  },
  11: {
    stone: 'Yellow Topaz',
    vedicName: 'Pukhraj',
    planet: 'Jupiter (Guru)',
    metal: 'Gold',
    finger: 'Index finger, right hand',
    day: 'Thursday morning',
    purpose: 'Expands Jupiterian wisdom and the philosophical depth that finds meaning in all experience.',
    note: 'November-born carry Jupiter\'s deep-autumn wisdom — the understanding that arrives after the leaves have fallen.',
  },
  12: {
    stone: 'Blue Zircon',
    vedicName: 'Zarcon',
    planet: 'Jupiter (Guru)',
    metal: 'Gold',
    finger: 'Index finger, right hand',
    day: 'Thursday morning',
    purpose: 'Supports Jupiterian expansion and the winter-born quality of carrying light into darkness.',
    note: 'December-born arrive at the year\'s returning light — the Jupiterian optimism that sees spring from midwinter.',
  },
};

export function getVedicBirthstone(birthMonth: number): VedicBirthstone {
  return VEDIC_BIRTHSTONES[birthMonth] || VEDIC_BIRTHSTONES[1];
}

// ---------------------------------------------------------------------------

export const SECTION_EXPLAINERS = {
  gematria: `Gematria is the ancient practice of assigning numerical values to letters — a method that appears in Hebrew Kabbalah, Greek Pythagorean tradition, and Vedic Sanskrit scholarship. The underlying idea is that language is not arbitrary: the letters and sounds that form a name carry a vibrational signature, and when those signatures are summed and reduced, they reveal something real about the soul that has chosen to be known by that name.

Your name numerology is calculated using the Pythagorean system (A=1 through Z=26, reduced to a single digit or master number). Three distinct calculations are made: your Expression number (all letters), your Soul Urge (vowels only, reflecting the inner longing), and your Personality number (consonants only, reflecting the outer face you present).`,

  biorhythmCycles: [
    {
      name: 'Physical Cycle',
      period: '23 days',
      description: 'Governs physical energy, stamina, strength, coordination, and resistance. When high, physical output is at its best. When low, rest and recovery are the body\'s priority.',
    },
    {
      name: 'Emotional Cycle',
      period: '28 days',
      description: 'Governs mood, emotional sensitivity, creativity, and interpersonal attunement. High phases bring warmth and creative flow; low phases call for solitude and emotional replenishment.',
    },
    {
      name: 'Intellectual Cycle',
      period: '33 days',
      description: 'Governs analytical thinking, problem-solving capacity, memory, and logical clarity. High phases are ideal for complex decisions; low phases favour intuition over analysis.',
    },
  ],

  biorhythmHonesty: `A note on biorhythm science: the three-cycle model was popularised in the early 20th century and has been a subject of both serious study and scepticism. Controlled research has found that biorhythm cycles do not predict performance or accidents at statistically significant levels. What the model does offer is a rhythm-awareness practice — a daily prompt to check in with your physical, emotional, and mental states rather than running on autopilot. Use these readings as a contemplative tool rather than a predictive one: the question "what does my body actually need today?" is worth asking regardless of what the chart says.`,

  nameNumbersLegend: `Three numbers, three perspectives on the same name:\n\n**Expression** — the sum of all letters — describes the full potential encoded in your name: the complete set of gifts, tendencies, and challenges you carry as this named self in the world.\n\n**Soul Urge** — the sum of vowels only — describes the deep interior longing: what you are driven by beneath conscious awareness, what your soul is reaching toward.\n\n**Personality** — the sum of consonants only — describes the face you present before people know your depths: your first impression, your social interface, the self others encounter before they discover the rest.`,
};

// ---------------------------------------------------------------------------

export const CLOSING_SECTION = {
  signoff: `Every number, nakshatra, and zodiac placement in this report is a lens — a way of focusing attention on a particular dimension of who you are. No single lens captures the whole. What this report offers is a set of perspectives, each with genuine historical and cultural depth, that taken together may illuminate something about your particular configuration of gifts, challenges, and potential that you can use.`,

  tagline: `Born on purpose. Built for this moment.`,

  recipientCta: `The deepest use of a chart like this is not to read it once but to return to it — to bring the questions of your actual life to the frameworks it offers, and to notice which descriptions feel alive and which feel like costumes. What resonates is data. What doesn't is equally instructive. Use this as a conversation starter with yourself.`,

  dailyReadingNote: `Your biorhythm chart changes daily. Your personal year energy shifts each January. Your transits move continuously. This report captures a single moment — your birth — but you are a living system in constant motion. The most accurate reading of your chart is always the one you do in relationship with your actual experience right now.`,

  disclaimer: `This report is created for celebratory and reflective purposes. Astrological, numerological, and biorhythm frameworks are cultural and philosophical traditions rather than predictive sciences. Nothing in this report constitutes medical, psychological, financial, or legal advice. The historical events, celebrity connections, and cultural references are provided for context and enjoyment.`,
};
