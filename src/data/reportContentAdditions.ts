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
  // Optional Jyotish deep-content — populate per stone as warranted
  jyotishRationale?: string;
  ritual?: string;
  mantra?: { devanagari: string; transliteration: string; pronunciation: string; };
  weightAndQuality?: string;
  benefits?: string[];
  ayurveda?: string;
  cautions?: string;
  stoneNote?: string;
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

    jyotishRationale: `Moti (Pearl) is the ratna of Chandra — the Moon — the graha that governs manas (mind), emotional body, memory, intuition, and the relationship with the mother figure. June-born receive Pearl as a rare dual prescription: it is both the Western birthstone of their birth month and the Vedic ratna of Chandra, two traditions converging on the same gem. Pearl is prescribed in Jyotish during Chandra Mahadasha and Chandra Antardasha, and for charts where the Moon is the Lagna lord, Atmakaraka, or placed in a sensitive house. It is one of the nine Navgraha ratnas and among the most universally benign, with few contraindications for most charts.`,

    ritual: `Day: Monday (Somavar) — Chandra's own day. Time: Within the first hour after sunrise on a Monday in Shukla Paksha (the waxing fortnight, when the Moon is growing in light). Finger: Kanishtha (little finger) of the right hand. Some traditions prescribe the Anamika (ring finger); consult your Jyotishi if uncertain. Metal: Silver (Chandi) only — silver is Chandra's metal and amplifies the stone's lunar resonance. Gold is the Sun's metal and dilutes Chandra's energy; panchdhatu is acceptable if silver is unavailable. Purification (Shodhan): Place the set ring in a small bowl with raw cow's milk or Ganga jal to submerge it, a few drops of honey, and two or three tulsi leaves. Leave for 20–30 minutes, rinse gently, pat dry. Then recite the Chandra Beej Mantra 108 times while wearing the ring for the first time.`,

    mantra: {
      devanagari: 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः',
      transliteration: 'Om Shrāṃ Shrīṃ Shrauṃ Saḥ Chandrāya Namaḥ',
      pronunciation: 'Om — SHRAAM — SHREEM — SHROWM — Sah — CHUN-dra-ya — NA-ma-ha',
    },

    weightAndQuality: `Minimum 2 Ratti for perceptible effect; 4–6 Ratti is ideal for most adults (1 Ratti ≈ 0.91 carats — the traditional Indian gem unit, based on the Abrus precatorius seed). Quality tiers: Basra (Persian Gulf) — finest for Jyotish prescription, dense nacre, increasingly rare. South Sea & Japanese Akoya — natural saltwater, high lustre, widely accepted. Freshwater (Chinese) — affordable and acceptable, considered less potent by most practitioners. Synthetic or composite pearls — not accepted for Jyotish; no natural nacre, no planetary resonance. Look for sharp lustre, unblemished nacre, natural colour (white, cream, or pinkish-silver), and a round or near-round shape. Request natural-origin certification from GIA, IGI, or the Gemmological Institute of India.`,

    benefits: [
      'Manas (mind): Calms mental restlessness, reduces anxiety and chronic overthinking',
      'Memory & learning: Sharpens retention; traditionally prescribed for students and scholars',
      'Emotional stability: Reduces mood swings, emotional reactivity, and absorption of others’ states',
      'Sleep: Improves sleep quality; placing pearl near the pillow is a classical Jyotish recommendation',
      'Maternal bonds: Chandra governs the mother figure — Pearl strengthens this relationship',
      'Creativity & intuition: Enhances imaginative faculty and the quality of inner listening',
      'For women: Supports hormonal balance and reproductive wellbeing in Ayurvedic tradition',
    ],

    ayurveda: `Sheetal (cooling) in potency — Pearl pacifies Pitta, the fire-water principle. Mukta Pishti (pearl powder) and Mukta Bhasma (purified pearl ash) are classical Ayurvedic formulations prescribed for pitta disorders: chronic fever, gastric acidity, burning sensations, palpitations, and nervous agitation. The gem's calming action on the mind mirrors its physical cooling — both governed by the Moon's watery, receptive nature.`,

    cautions: `Pearl is among the safest Navgraha ratnas for most charts. However: those with Saturn (Shani) aspecting the Moon, or with Rahu or Ketu conjunct the Moon, should consult a qualified Jyotishi before wearing. Remove during solar or lunar eclipses (Grahan kaal) and cleanse with milk or Ganga jal before re-wearing. If you experience unusual emotional agitation or disturbed sleep within the first three days of wearing, remove the stone and consult a Jyotishi — individual chart factors vary and can override general prescription.`,

    stoneNote: `On gemstone layering: in Jyotish, multiple ratnas can be worn simultaneously for different planetary purposes. Your Vedic Rashi has its own ruling planet and corresponding ratna (shown above in the Zodiac section). Pearl serves a separate function — strengthening Chandra for emotional depth, mental calm, and intuitive receptivity — and the two complement rather than conflict.`,
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
