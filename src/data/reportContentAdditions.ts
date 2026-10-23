// Section explainers and closing section content for the Birthday Report

// Audit S2 (23 Oct 2026): the month-based "Vedic birthstone" table was removed — in
// Jyotish a ratna is chosen from the birth chart (Ascendant / Moon-sign lord), never by
// Gregorian month, and several of its planet pairings were wrong (e.g. Gomed labelled
// the Sun's stone). The paid report now uses src/lib/reportVedic.ts + /api/gemstones.

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

  biorhythmHonesty: `the three-cycle model was popularised in the early 20th century and has been a subject of both serious study and scepticism. Controlled research has found that biorhythm cycles do not predict performance or accidents at statistically significant levels. What the model does offer is a rhythm-awareness practice — a daily prompt to check in with your physical, emotional, and mental states rather than running on autopilot. Use these readings as a contemplative tool rather than a predictive one: the question "what does my body actually need today?" is worth asking regardless of what the chart says.`,

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
