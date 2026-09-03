/**
 * Complete astrological lookup data.
 * ALL values are authoritative — do not modify without verification.
 * Tarot: standard Rider-Waite tradition.
 * Vedic stones: by ruling planet (Mangal=Red Coral, Shukra=Diamond,
 *   Budha=Emerald, Chandra=Pearl, Surya=Ruby, Guru=Yellow Sapphire, Shani=Blue Sapphire)
 * Mantras: Om Ang Angarakaya Namah (Mars), Om Shum Shukraya Namah (Venus),
 *   Om Bum Budhaya Namah (Mercury), Om Som Somaya Namah (Moon),
 *   Om Hrim Hraum Suryaya Namah (Sun), Om Brim Brihaspataye Namah (Jupiter),
 *   Om Sham Shanaischaraya Namah (Saturn)
 */

export interface WesternZodiacProfile {
  sign: string; symbol: string; element: string; modality: string;
  ruling_planet: string; date_range: string;
  tarot_card: string; tarot_meaning: string;
  lucky_color: string; lucky_colors: string[];
  lucky_day: string; lucky_stone: string; lucky_stones: string[];
  lucky_numbers: number[]; body_part: string;
  strengths: string[]; weaknesses: string[];
  love_compatibility: string[]; challenging_signs: string[];
  career_strengths: string; personality_summary: string;
}

export interface VedicRashiProfile {
  rashi: string; rashi_devanagari: string; western_equivalent: string;
  lord: string; lord_devanagari: string; element: string;
  quality: string; symbol: string;
  lucky_stone: string; lucky_stone_hindi: string;
  lucky_colors: string[]; lucky_day: string;
  lucky_number: number; lucky_numbers: number[];
  lucky_direction: string; lucky_metal: string;
  ruling_deity: string; mantra: string; body_part: string;
  strengths: string[]; challenges: string[];
  career_strengths: string; personality_summary: string;
  compatible_rashis: string[]; health_tendencies: string;
}

export interface ChineseZodiacProfile {
  animal: string; emoji: string; element_fixed: string; yin_yang: string;
  lucky_numbers: number[]; lucky_colors: string[];
  lucky_flowers: string[]; lucky_directions: string[];
  unlucky_colors: string[]; unlucky_numbers: number[];
  personality_summary: string; strengths: string[]; weaknesses: string[];
  best_match: string[]; worst_match: string[]; career_strengths: string;
}

export interface NakshatraProfile {
  nakshatra: string; number: number; lord: string;
  symbol: string; deity: string; quality: string; gana: string;
  personality_summary: string; strengths: string[]; challenges: string[];
}

export interface LifePathProfile {
  number: number; title: string; ruling_planet: string; element: string;
  traits: string; strengths: string[]; challenges: string[];
  love_style: string; career_paths: string[];
  spiritual_lesson: string; lucky_color: string; lucky_stone: string;
}

// ── WESTERN ZODIAC ────────────────────────────────────────────
export const WESTERN_ZODIAC_PROFILES: Record<string, WesternZodiacProfile> = {
  Aries: {
    sign: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal',
    ruling_planet: 'Mars', date_range: 'Mar 21 – Apr 19',
    tarot_card: 'The Emperor', tarot_meaning: 'Authority, structure, and leadership through discipline',
    lucky_color: 'Red', lucky_colors: ['Red','Scarlet','Carmine'],
    lucky_day: 'Tuesday', lucky_stone: 'Diamond', lucky_stones: ['Diamond','Ruby','Red Jasper'],
    lucky_numbers: [1,8,17], body_part: 'Head and face',
    strengths: ['Courageous','Determined','Confident','Enthusiastic','Optimistic'],
    weaknesses: ['Impatient','Moody','Short-tempered','Impulsive','Aggressive'],
    love_compatibility: ['Leo','Sagittarius','Gemini'], challenging_signs: ['Cancer','Capricorn'],
    career_strengths: 'Natural leaders who excel in entrepreneurship, military, sports, and any field requiring initiative and courage under pressure.',
    personality_summary: 'Aries is the first sign of the zodiac and the most direct. Bold, ambitious, and driven by a need to be first, Aries dives headfirst into even the most challenging situations with infectious energy and inspiring confidence.',
  },
  Taurus: {
    sign: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed',
    ruling_planet: 'Venus', date_range: 'Apr 20 – May 20',
    tarot_card: 'The Hierophant', tarot_meaning: 'Tradition, spiritual wisdom, and established institutions',
    lucky_color: 'Green', lucky_colors: ['Green','Pink','White'],
    lucky_day: 'Friday', lucky_stone: 'Emerald', lucky_stones: ['Emerald','Rose Quartz','Sapphire'],
    lucky_numbers: [2,6,9], body_part: 'Throat and neck',
    strengths: ['Reliable','Patient','Practical','Devoted','Responsible'],
    weaknesses: ['Stubborn','Possessive','Uncompromising','Materialistic'],
    love_compatibility: ['Virgo','Capricorn','Cancer'], challenging_signs: ['Leo','Aquarius'],
    career_strengths: 'Exceptional in finance, banking, real estate, art, music, and any field requiring patience and persistent attention to quality.',
    personality_summary: 'Taurus is the most grounded sign of the zodiac. Patient and reliable, they value security, beauty, and the finer things in life. Their persistence is unmatched — once a Taurus sets a goal, they pursue it with quiet, unshakeable determination.',
  },
  Gemini: {
    sign: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable',
    ruling_planet: 'Mercury', date_range: 'May 21 – Jun 20',
    tarot_card: 'The Lovers', tarot_meaning: 'Choice, meaningful connections, and integration of opposites',
    lucky_color: 'Yellow', lucky_colors: ['Yellow','Light Green','Peach'],
    lucky_day: 'Wednesday', lucky_stone: 'Agate', lucky_stones: ['Agate','Pearl','Citrine'],
    lucky_numbers: [5,7,14], body_part: 'Arms, lungs, and nervous system',
    strengths: ['Gentle','Affectionate','Curious','Adaptable','Quick-witted'],
    weaknesses: ['Nervous','Inconsistent','Indecisive','Superficial'],
    love_compatibility: ['Libra','Aquarius','Aries'], challenging_signs: ['Virgo','Pisces'],
    career_strengths: 'Thrives in communication, journalism, teaching, sales, and technology. Versatility and ability to see multiple perspectives makes them outstanding negotiators.',
    personality_summary: 'Gemini is the most versatile and adaptable sign. Represented by the twins, they have a dual nature — intellectual yet playful, serious yet light-hearted. Their curiosity is boundless and their communication skills unmatched.',
  },
  Cancer: {
    sign: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal',
    ruling_planet: 'Moon', date_range: 'Jun 21 – Jul 22',
    tarot_card: 'The Chariot', tarot_meaning: 'Willpower, determination, and victory through inner control',
    lucky_color: 'Silver', lucky_colors: ['Silver','White','Sea Green'],
    lucky_day: 'Monday', lucky_stone: 'Pearl', lucky_stones: ['Pearl','Moonstone','Ruby'],
    lucky_numbers: [2,7,11], body_part: 'Chest and stomach',
    strengths: ['Tenacious','Imaginative','Loyal','Emotional','Sympathetic'],
    weaknesses: ['Moody','Pessimistic','Suspicious','Manipulative','Insecure'],
    love_compatibility: ['Scorpio','Pisces','Taurus'], challenging_signs: ['Aries','Libra'],
    career_strengths: 'Excels in healthcare, social work, education, real estate, and culinary arts. Deep empathy makes them exceptional caregivers and community builders.',
    personality_summary: 'Cancer is the most emotionally intelligent sign of the zodiac. Deeply intuitive and sentimental, they are fiercely protective of those they love. Their connection to home and family gives them an emotional depth few signs match.',
  },
  Leo: {
    sign: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed',
    ruling_planet: 'Sun', date_range: 'Jul 23 – Aug 22',
    tarot_card: 'Strength', tarot_meaning: 'Inner courage, patience, and mastery of raw instinct',
    lucky_color: 'Gold', lucky_colors: ['Gold','Orange','Yellow'],
    lucky_day: 'Sunday', lucky_stone: 'Ruby', lucky_stones: ['Ruby','Peridot','Onyx'],
    lucky_numbers: [1,3,10], body_part: 'Heart and spine',
    strengths: ['Creative','Passionate','Generous','Warm-hearted','Humorous'],
    weaknesses: ['Arrogant','Stubborn','Self-centred','Inflexible','Lazy'],
    love_compatibility: ['Aries','Sagittarius','Gemini'], challenging_signs: ['Taurus','Scorpio'],
    career_strengths: 'Born performers who excel in entertainment, politics, and leadership. Their charisma and natural authority make them compelling leaders and inspiring role models.',
    personality_summary: 'Leo is the most magnetic sign of the zodiac. Ruled by the Sun, they radiate warmth, confidence, and creativity. Their generosity is legendary and their presence commands every room they enter.',
  },
  Virgo: {
    sign: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable',
    ruling_planet: 'Mercury', date_range: 'Aug 23 – Sep 22',
    tarot_card: 'The Hermit', tarot_meaning: 'Introspection, soul-searching, and inner guidance',
    lucky_color: 'White', lucky_colors: ['White','Grey','Pale Yellow'],
    lucky_day: 'Wednesday', lucky_stone: 'Sapphire', lucky_stones: ['Sapphire','Carnelian','Jade'],
    lucky_numbers: [5,14,23], body_part: 'Digestive system',
    strengths: ['Loyal','Analytical','Kind','Hardworking','Practical'],
    weaknesses: ['Shyness','Worry','Overly critical','Perfectionist'],
    love_compatibility: ['Taurus','Capricorn','Cancer'], challenging_signs: ['Gemini','Sagittarius'],
    career_strengths: 'Masters of detail who excel in medicine, research, accounting, writing, and data analysis. Precision and dedication produce work of exceptional standard.',
    personality_summary: 'Virgo is the most meticulous sign of the zodiac. Deeply analytical and practical, they have an eye for detail that borders on superhuman. Their dedication to improvement of themselves and the world is a quiet form of devotion.',
  },
  Libra: {
    sign: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal',
    ruling_planet: 'Venus', date_range: 'Sep 23 – Oct 22',
    tarot_card: 'Justice', tarot_meaning: 'Fairness, truth, cause and effect, and karmic balance',
    lucky_color: 'Pink', lucky_colors: ['Pink','Light Blue','Lavender'],
    lucky_day: 'Friday', lucky_stone: 'Opal', lucky_stones: ['Opal','Peridot','Sapphire'],
    lucky_numbers: [6,15,24], body_part: 'Kidneys and lower back',
    strengths: ['Cooperative','Diplomatic','Gracious','Fair-minded','Social'],
    weaknesses: ['Indecisive','Avoids confrontations','Carries grudges','Self-pity'],
    love_compatibility: ['Gemini','Aquarius','Leo'], challenging_signs: ['Cancer','Capricorn'],
    career_strengths: 'Natural mediators who excel in law, diplomacy, public relations, design, and the arts. Their sense of fairness and aesthetic sensibility make them outstanding judges of quality.',
    personality_summary: 'Libra is the most balanced sign of the zodiac. Ruled by Venus, they are drawn to beauty, harmony, and fairness in all things. Their social intelligence is extraordinary — they can adapt to any personality and find middle ground.',
  },
  Scorpio: {
    sign: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed',
    ruling_planet: 'Pluto', date_range: 'Oct 23 – Nov 21',
    tarot_card: 'Death', tarot_meaning: 'Transformation, endings and new beginnings — not literal death',
    lucky_color: 'Dark Red', lucky_colors: ['Dark Red','Black','Maroon'],
    lucky_day: 'Tuesday', lucky_stone: 'Topaz', lucky_stones: ['Topaz','Garnet','Obsidian'],
    lucky_numbers: [8,11,18], body_part: 'Reproductive organs',
    strengths: ['Resourceful','Brave','Passionate','Loyal','Determined'],
    weaknesses: ['Distrusting','Jealous','Secretive','Manipulative','Controlling'],
    love_compatibility: ['Cancer','Pisces','Virgo'], challenging_signs: ['Leo','Aquarius'],
    career_strengths: 'Exceptional investigators, researchers, surgeons, and psychologists. Ability to see beneath the surface and relentless determination make them formidable in any competitive field.',
    personality_summary: 'Scorpio is the most intense and transformative sign of the zodiac. Ruled by Pluto, they are drawn to the depths — of emotion, knowledge, and experience. Their loyalty is absolute, their focus unbreakable.',
  },
  Sagittarius: {
    sign: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable',
    ruling_planet: 'Jupiter', date_range: 'Nov 22 – Dec 21',
    tarot_card: 'Temperance', tarot_meaning: 'Balance, moderation, patience, and higher purpose',
    lucky_color: 'Purple', lucky_colors: ['Purple','Blue','Plum'],
    lucky_day: 'Thursday', lucky_stone: 'Turquoise', lucky_stones: ['Turquoise','Topaz','Amethyst'],
    lucky_numbers: [3,7,9], body_part: 'Hips and thighs',
    strengths: ['Generous','Idealistic','Great sense of humor','Adventurous','Honest'],
    weaknesses: ['Promises more than can deliver','Impatient','Tactless','Restless'],
    love_compatibility: ['Aries','Leo','Libra'], challenging_signs: ['Virgo','Pisces'],
    career_strengths: 'Natural philosophers and explorers who excel in travel, education, law, writing, and international business. Optimism and big-picture thinking inspire teams.',
    personality_summary: 'Sagittarius is the most adventurous and freedom-loving sign. Ruled by Jupiter, they are eternal seekers of truth, experience, and wisdom. Their enthusiasm is contagious and their optimism — even in adversity — is their defining quality.',
  },
  Capricorn: {
    sign: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal',
    ruling_planet: 'Saturn', date_range: 'Dec 22 – Jan 19',
    tarot_card: 'The Devil', tarot_meaning: 'Material attachment, restriction, and shadow self to integrate',
    lucky_color: 'Brown', lucky_colors: ['Brown','Black','Dark Green'],
    lucky_day: 'Saturday', lucky_stone: 'Garnet', lucky_stones: ['Garnet','Onyx','Ruby'],
    lucky_numbers: [4,8,13], body_part: 'Knees, joints, and skeletal system',
    strengths: ['Responsible','Disciplined','Self-controlled','Good manager','Ambitious'],
    weaknesses: ['Know-it-all','Unforgiving','Condescending','Pessimistic'],
    love_compatibility: ['Taurus','Virgo','Scorpio'], challenging_signs: ['Aries','Libra'],
    career_strengths: 'Masters of long-term strategy who excel in business, politics, finance, engineering, and management. Discipline and ambition build empires patiently.',
    personality_summary: 'Capricorn is the most disciplined and ambitious sign. Ruled by Saturn, they are driven by a deep need to achieve and be respected. Their patience is extraordinary — they will work for decades toward a goal others would have abandoned.',
  },
  Aquarius: {
    sign: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed',
    ruling_planet: 'Uranus', date_range: 'Jan 20 – Feb 18',
    tarot_card: 'The Star', tarot_meaning: 'Hope, inspiration, serenity, and renewed faith in the universe',
    lucky_color: 'Electric Blue', lucky_colors: ['Electric Blue','Turquoise','Silver'],
    lucky_day: 'Saturday', lucky_stone: 'Amethyst', lucky_stones: ['Amethyst','Garnet','Moss Agate'],
    lucky_numbers: [4,7,11], body_part: 'Ankles and circulatory system',
    strengths: ['Progressive','Original','Independent','Humanitarian','Visionary'],
    weaknesses: ['Runs from emotional expression','Temperamental','Uncompromising','Aloof'],
    love_compatibility: ['Gemini','Libra','Sagittarius'], challenging_signs: ['Taurus','Scorpio'],
    career_strengths: 'Revolutionary thinkers who excel in technology, science, social reform, and any field requiring innovation. Ability to see decades ahead makes them invaluable visionaries.',
    personality_summary: 'Aquarius is the most innovative and forward-thinking sign. Ruled by Uranus, they see the world not as it is but as it could be. Their humanitarian instincts and intellectual independence make them the true originals of the zodiac.',
  },
  Pisces: {
    sign: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable',
    ruling_planet: 'Neptune', date_range: 'Feb 19 – Mar 20',
    tarot_card: 'The Moon', tarot_meaning: 'Illusion, fear, the subconscious, and depth of imagination',
    lucky_color: 'Sea Green', lucky_colors: ['Sea Green','Lavender','Purple'],
    lucky_day: 'Thursday', lucky_stone: 'Aquamarine', lucky_stones: ['Aquamarine','Amethyst','Bloodstone'],
    lucky_numbers: [3,9,12], body_part: 'Feet and lymphatic system',
    strengths: ['Compassionate','Artistic','Intuitive','Gentle','Wise'],
    weaknesses: ['Fearful','Overly trusting','Sad','Desire to escape reality'],
    love_compatibility: ['Cancer','Scorpio','Taurus'], challenging_signs: ['Gemini','Sagittarius'],
    career_strengths: 'Born artists and healers who excel in music, film, writing, medicine, and spiritual service. Extraordinary empathy allows connection at a level other signs cannot reach.',
    personality_summary: 'Pisces is the most empathetic and spiritually attuned sign. Ruled by Neptune, they live with one foot in the material world and one in the realm of spirit. Their creativity and compassion are boundless gifts to the world.',
  },
};

// ── VEDIC RASHI ───────────────────────────────────────────────
export const VEDIC_RASHI_PROFILES: Record<string, VedicRashiProfile> = {
  Mesha: {
    rashi: 'Mesha', rashi_devanagari: 'मेष', western_equivalent: 'Aries',
    lord: 'Mangal', lord_devanagari: 'मंगल', element: 'Agni (Fire)', quality: 'Chara (Cardinal)', symbol: 'Ram',
    lucky_stone: 'Red Coral', lucky_stone_hindi: 'Moonga',
    lucky_colors: ['Red','Scarlet','Orange'], lucky_day: 'Tuesday',
    lucky_number: 9, lucky_numbers: [9,18,27], lucky_direction: 'South', lucky_metal: 'Copper',
    ruling_deity: 'Lord Kartikeya', mantra: 'Om Ang Angarakaya Namah', body_part: 'Head and brain',
    strengths: ['Courageous','Dynamic','Pioneering','Enthusiastic','Confident'],
    challenges: ['Impatience','Aggression','Impulsiveness','Short temper'],
    career_strengths: 'Military, police, sports, surgery, engineering, and entrepreneurship. Mars energy gives unmatched drive and courage in competitive fields.',
    personality_summary: 'Mesha natives are born leaders with the energy of a warrior. Ruled by Mars (Mangal), they charge forward with confidence and rarely look back. Their directness and courage are their greatest assets.',
    compatible_rashis: ['Simha','Dhanu','Mithuna'],
    health_tendencies: 'Prone to headaches, fevers, and injuries to the head and face. Should manage anger as it directly impacts blood pressure.',
  },
  Vrishabha: {
    rashi: 'Vrishabha', rashi_devanagari: 'वृषभ', western_equivalent: 'Taurus',
    lord: 'Shukra', lord_devanagari: 'शुक्र', element: 'Prithvi (Earth)', quality: 'Sthira (Fixed)', symbol: 'Bull',
    lucky_stone: 'Diamond', lucky_stone_hindi: 'Heera',
    lucky_colors: ['Green','White','Pink'], lucky_day: 'Friday',
    lucky_number: 6, lucky_numbers: [6,15,24], lucky_direction: 'South East', lucky_metal: 'Silver',
    ruling_deity: 'Goddess Lakshmi', mantra: 'Om Shum Shukraya Namah', body_part: 'Throat and neck',
    strengths: ['Patient','Reliable','Practical','Devoted','Stable'],
    challenges: ['Stubbornness','Possessiveness','Resistance to change','Materialistic'],
    career_strengths: 'Finance, banking, music, arts, real estate, and agriculture. Venus gives an eye for beauty and a talent for creating lasting value.',
    personality_summary: 'Vrishabha natives are the pillars of stability. Ruled by Venus (Shukra), they appreciate beauty, comfort, and the finer things in life. Their patience is legendary — they build slowly but build to last.',
    compatible_rashis: ['Kanya','Makara','Karka'],
    health_tendencies: 'Prone to throat problems, thyroid issues, and neck pain. Tendency to gain weight if lifestyle is not active.',
  },
  Mithuna: {
    rashi: 'Mithuna', rashi_devanagari: 'मिथुन', western_equivalent: 'Gemini',
    lord: 'Budha', lord_devanagari: 'बुध', element: 'Vayu (Air)', quality: 'Chara (Cardinal)', symbol: 'Twins',
    lucky_stone: 'Emerald', lucky_stone_hindi: 'Panna',
    lucky_colors: ['Yellow','Green','Light Blue'], lucky_day: 'Wednesday',
    lucky_number: 5, lucky_numbers: [5,14,23], lucky_direction: 'North', lucky_metal: 'Bronze',
    ruling_deity: 'Lord Vishnu', mantra: 'Om Bum Budhaya Namah', body_part: 'Arms, shoulders, and lungs',
    strengths: ['Adaptable','Versatile','Intellectual','Communicative','Witty'],
    challenges: ['Inconsistency','Indecisiveness','Nervousness','Superficiality'],
    career_strengths: 'Journalism, writing, teaching, sales, IT, media, and public relations. Mercury blesses them with extraordinary communication abilities.',
    personality_summary: 'Mithuna natives are the most intellectually agile of all rashis. Ruled by Mercury (Budha), they can master multiple subjects simultaneously and adapt to any situation with ease.',
    compatible_rashis: ['Tula','Kumbha','Mesha'],
    health_tendencies: 'Prone to respiratory problems, nervous disorders, and shoulder injuries. Mental exhaustion from overwork is a common concern.',
  },
  Karka: {
    rashi: 'Karka', rashi_devanagari: 'कर्क', western_equivalent: 'Cancer',
    lord: 'Chandra', lord_devanagari: 'चंद्र', element: 'Jala (Water)', quality: 'Chara (Cardinal)', symbol: 'Crab',
    lucky_stone: 'Pearl', lucky_stone_hindi: 'Moti',
    lucky_colors: ['White','Silver','Sea Green'], lucky_day: 'Monday',
    lucky_number: 2, lucky_numbers: [2,7,11], lucky_direction: 'North West', lucky_metal: 'Silver',
    ruling_deity: 'Lord Shiva', mantra: 'Om Som Somaya Namah', body_part: 'Chest and stomach',
    strengths: ['Nurturing','Intuitive','Loyal','Protective','Empathetic'],
    challenges: ['Moodiness','Over-sensitivity','Clinginess','Pessimism'],
    career_strengths: 'Healthcare, social work, hospitality, real estate, and education. The Moon gives deep empathy and an instinct for nurturing others.',
    personality_summary: 'Karka natives are the most emotionally intelligent of all rashis. Ruled by the Moon (Chandra), their emotions ebb and flow like the tides. Their loyalty to family is absolute.',
    compatible_rashis: ['Vrischika','Meena','Vrishabha'],
    health_tendencies: 'Prone to digestive issues, chest problems, and emotional eating. Mental health is closely tied to the home environment.',
  },
  Simha: {
    rashi: 'Simha', rashi_devanagari: 'सिंह', western_equivalent: 'Leo',
    lord: 'Surya', lord_devanagari: 'सूर्य', element: 'Agni (Fire)', quality: 'Sthira (Fixed)', symbol: 'Lion',
    lucky_stone: 'Ruby', lucky_stone_hindi: 'Manikya',
    lucky_colors: ['Golden','Orange','Yellow'], lucky_day: 'Sunday',
    lucky_number: 1, lucky_numbers: [1,4,10], lucky_direction: 'East', lucky_metal: 'Gold',
    ruling_deity: 'Lord Rama', mantra: 'Om Hrim Hraum Suryaya Namah', body_part: 'Heart and spine',
    strengths: ['Generous','Charismatic','Creative','Confident','Loyal'],
    challenges: ['Arrogance','Stubbornness','Laziness','Need for recognition'],
    career_strengths: 'Politics, entertainment, management, and education. The Sun gives natural authority and the magnetism to inspire others.',
    personality_summary: 'Simha natives carry the energy of royalty. Ruled by the Sun (Surya), they radiate warmth, confidence, and creative power. They are natural leaders who inspire loyalty without demanding it.',
    compatible_rashis: ['Mesha','Dhanu','Mithuna'],
    health_tendencies: 'Prone to heart conditions, spinal problems, and fevers. Should guard against excessive pride causing chronic stress.',
  },
  Kanya: {
    rashi: 'Kanya', rashi_devanagari: 'कन्या', western_equivalent: 'Virgo',
    lord: 'Budha', lord_devanagari: 'बुध', element: 'Prithvi (Earth)', quality: 'Dvisvabhava (Mutable)', symbol: 'Maiden',
    lucky_stone: 'Emerald', lucky_stone_hindi: 'Panna',
    lucky_colors: ['Green','White','Grey'], lucky_day: 'Wednesday',
    lucky_number: 5, lucky_numbers: [5,14,23], lucky_direction: 'South', lucky_metal: 'Bronze',
    ruling_deity: 'Lord Vishnu', mantra: 'Om Bum Budhaya Namah', body_part: 'Digestive system and intestines',
    strengths: ['Analytical','Meticulous','Helpful','Reliable','Hardworking'],
    challenges: ['Overcritical','Worry','Perfectionism','Shyness'],
    career_strengths: 'Medicine, accounting, research, writing, data analysis, and quality control. Mercury gives an extraordinary eye for detail and drive toward perfection.',
    personality_summary: 'Kanya natives are the most precise and service-oriented of all rashis. Ruled by Mercury (Budha), they apply sharp intellect to practical problems and derive deep satisfaction from doing things correctly.',
    compatible_rashis: ['Vrishabha','Makara','Karka'],
    health_tendencies: 'Prone to digestive disorders, anxiety, and skin problems. Over-analysis and excessive worry are their biggest health challenges.',
  },
  Tula: {
    rashi: 'Tula', rashi_devanagari: 'तुला', western_equivalent: 'Libra',
    lord: 'Shukra', lord_devanagari: 'शुक्र', element: 'Vayu (Air)', quality: 'Chara (Cardinal)', symbol: 'Scales',
    lucky_stone: 'Diamond', lucky_stone_hindi: 'Heera',
    lucky_colors: ['White','Light Blue','Pink'], lucky_day: 'Friday',
    lucky_number: 6, lucky_numbers: [6,15,24], lucky_direction: 'West', lucky_metal: 'Silver',
    ruling_deity: 'Goddess Lakshmi', mantra: 'Om Shum Shukraya Namah', body_part: 'Kidneys and lower back',
    strengths: ['Diplomatic','Fair-minded','Social','Gracious','Balanced'],
    challenges: ['Indecisiveness','Avoidance of conflict','Superficiality','Self-pity'],
    career_strengths: 'Law, diplomacy, design, fashion, and public relations. Venus gives an unerring sense of beauty and fairness that excels in any field requiring aesthetic judgment.',
    personality_summary: 'Tula natives are the most socially gifted of all rashis. Ruled by Venus (Shukra), they seek beauty, harmony, and fairness in all things. Their charm and diplomatic intelligence make them outstanding in roles requiring human connection.',
    compatible_rashis: ['Mithuna','Kumbha','Simha'],
    health_tendencies: 'Prone to kidney problems, lower back pain, and hormonal imbalances. Emotional imbalance directly affects physical wellbeing.',
  },
  Vrischika: {
    rashi: 'Vrischika', rashi_devanagari: 'वृश्चिक', western_equivalent: 'Scorpio',
    lord: 'Mangal', lord_devanagari: 'मंगल', element: 'Jala (Water)', quality: 'Sthira (Fixed)', symbol: 'Scorpion',
    lucky_stone: 'Red Coral', lucky_stone_hindi: 'Moonga',
    lucky_colors: ['Red','Maroon','Dark Red'], lucky_day: 'Tuesday',
    lucky_number: 9, lucky_numbers: [9,18,27], lucky_direction: 'South West', lucky_metal: 'Iron',
    ruling_deity: 'Lord Kartikeya', mantra: 'Om Ang Angarakaya Namah', body_part: 'Reproductive organs and pelvis',
    strengths: ['Determined','Brave','Passionate','Loyal','Intuitive'],
    challenges: ['Jealousy','Secrecy','Resentment','Obsessiveness','Controlling'],
    career_strengths: 'Research, medicine, surgery, investigation, psychology, and any field requiring depth and persistence. Mars gives unmatched determination and ability to uncover hidden truths.',
    personality_summary: 'Vrischika natives possess the most intense and transformative energy of all rashis. Ruled by Mars (Mangal) in its deep expression, they combine emotional depth with warrior strength. Their loyalty is absolute — as is their memory of betrayal.',
    compatible_rashis: ['Karka','Meena','Kanya'],
    health_tendencies: 'Prone to reproductive issues, urinary problems, and piles. Emotional intensity if unmanaged manifests as psychosomatic illness.',
  },
  Dhanu: {
    rashi: 'Dhanu', rashi_devanagari: 'धनु', western_equivalent: 'Sagittarius',
    lord: 'Guru', lord_devanagari: 'गुरु', element: 'Agni (Fire)', quality: 'Dvisvabhava (Mutable)', symbol: 'Archer',
    lucky_stone: 'Yellow Sapphire', lucky_stone_hindi: 'Pukhraj',
    lucky_colors: ['Yellow','Orange','Purple'], lucky_day: 'Thursday',
    lucky_number: 3, lucky_numbers: [3,12,21], lucky_direction: 'North East', lucky_metal: 'Gold',
    ruling_deity: 'Lord Brahma', mantra: 'Om Brim Brihaspataye Namah', body_part: 'Hips, thighs, and liver',
    strengths: ['Optimistic','Honest','Philosophical','Adventurous','Generous'],
    challenges: ['Overconfidence','Tactlessness','Restlessness','Irresponsibility'],
    career_strengths: 'Philosophy, law, travel, publishing, education, and international business. Jupiter expands their vision to a global scale and blesses them with extraordinary luck.',
    personality_summary: 'Dhanu natives are the seekers of the zodiac. Ruled by Jupiter (Guru), the great benefic, they are forever searching for truth, wisdom, and adventure. Their optimism is their superpower.',
    compatible_rashis: ['Mesha','Simha','Tula'],
    health_tendencies: 'Prone to hip and thigh injuries, liver problems, and weight gain from overindulgence. Excess in all things is their primary health challenge.',
  },
  Makara: {
    rashi: 'Makara', rashi_devanagari: 'मकर', western_equivalent: 'Capricorn',
    lord: 'Shani', lord_devanagari: 'शनि', element: 'Prithvi (Earth)', quality: 'Chara (Cardinal)', symbol: 'Sea-goat',
    lucky_stone: 'Blue Sapphire', lucky_stone_hindi: 'Neelam',
    lucky_colors: ['Black','Dark Blue','Dark Green'], lucky_day: 'Saturday',
    lucky_number: 8, lucky_numbers: [8,17,26], lucky_direction: 'West', lucky_metal: 'Iron',
    ruling_deity: 'Lord Yama', mantra: 'Om Sham Shanaischaraya Namah', body_part: 'Knees, joints, and bones',
    strengths: ['Disciplined','Ambitious','Patient','Practical','Responsible'],
    challenges: ['Pessimism','Condescension','Rigidity','Coldness','Workaholism'],
    career_strengths: 'Business, politics, engineering, architecture, and government. Saturn rewards patience with eventual mastery and authority.',
    personality_summary: 'Makara natives are the architects of the zodiac. Ruled by Saturn (Shani), they understand that great things require time, discipline, and perseverance. They are often late bloomers whose greatest achievements come after 35.',
    compatible_rashis: ['Vrishabha','Kanya','Vrischika'],
    health_tendencies: 'Prone to knee problems, arthritis, bone disorders, and depression. The weight of Saturn\'s discipline must be balanced with genuine rest.',
  },
  Kumbha: {
    rashi: 'Kumbha', rashi_devanagari: 'कुंभ', western_equivalent: 'Aquarius',
    lord: 'Shani', lord_devanagari: 'शनि', element: 'Vayu (Air)', quality: 'Sthira (Fixed)', symbol: 'Water-bearer',
    lucky_stone: 'Blue Sapphire', lucky_stone_hindi: 'Neelam',
    lucky_colors: ['Electric Blue','Turquoise','Violet'], lucky_day: 'Saturday',
    lucky_number: 8, lucky_numbers: [8,17,26], lucky_direction: 'West', lucky_metal: 'Iron',
    ruling_deity: 'Lord Shiva', mantra: 'Om Sham Shanaischaraya Namah', body_part: 'Ankles, calves, and circulatory system',
    strengths: ['Progressive','Original','Humanitarian','Visionary','Independent'],
    challenges: ['Aloofness','Emotional detachment','Rebelliousness','Impracticality'],
    career_strengths: 'Technology, science, social activism, astrology, and any field where innovation meets service to humanity. Their unique mind sees solutions others cannot imagine.',
    personality_summary: 'Kumbha natives are the visionaries of the zodiac. Ruled by Saturn (Shani) in its humanitarian expression, they are dedicated to the collective good. They are often decades ahead of their time.',
    compatible_rashis: ['Mithuna','Tula','Dhanu'],
    health_tendencies: 'Prone to ankle injuries, circulation problems, and nervous system disorders. Emotional detachment can manifest as physical numbness if left unaddressed.',
  },
  Meena: {
    rashi: 'Meena', rashi_devanagari: 'मीन', western_equivalent: 'Pisces',
    lord: 'Guru', lord_devanagari: 'गुरु', element: 'Jala (Water)', quality: 'Dvisvabhava (Mutable)', symbol: 'Two fish',
    lucky_stone: 'Yellow Sapphire', lucky_stone_hindi: 'Pukhraj',
    lucky_colors: ['Sea Green','Lavender','Purple'], lucky_day: 'Thursday',
    lucky_number: 3, lucky_numbers: [3,7,12], lucky_direction: 'North East', lucky_metal: 'Gold',
    ruling_deity: 'Lord Vishnu', mantra: 'Om Brim Brihaspataye Namah', body_part: 'Feet and lymphatic system',
    strengths: ['Compassionate','Intuitive','Artistic','Wise','Gentle'],
    challenges: ['Escapism','Over-trusting','Martyr complex','Boundary issues'],
    career_strengths: 'Arts, music, cinema, healing, spirituality, and counselling. Jupiter blesses them with extraordinary creative gifts and spiritual wisdom.',
    personality_summary: 'Meena natives are the most spiritually evolved of all rashis. Ruled by Jupiter (Guru), they exist at the intersection of the material and spiritual worlds. Their compassion is their greatest gift and greatest vulnerability.',
    compatible_rashis: ['Karka','Vrischika','Vrishabha'],
    health_tendencies: 'Prone to foot problems, immune disorders, and addiction. Porous boundaries make them susceptible to absorbing the illnesses and energies of others.',
  },
};

// ── CHINESE ZODIAC ────────────────────────────────────────────
export const CHINESE_ZODIAC_PROFILES: Record<string, ChineseZodiacProfile> = {
  Rat:     { animal:'Rat',     emoji:'🐀', element_fixed:'Water', yin_yang:'Yang', lucky_numbers:[2,3], lucky_colors:['Blue','Gold','Green'], lucky_flowers:['Lily','African Violet'], lucky_directions:['West','North West','South West'], unlucky_colors:['Yellow','Brown'], unlucky_numbers:[5,9], personality_summary:'Quick-witted and resourceful, Rats are the survivors of the zodiac. Their intelligence and adaptability allow them to navigate any situation while their charm makes them beloved collaborators.', strengths:['Intelligent','Adaptable','Quick-witted','Charming','Resourceful'], weaknesses:['Stubborn','Stingy','Overcritical','Anxious'], best_match:['Dragon','Monkey','Ox'], worst_match:['Horse','Rooster'], career_strengths:'Business, finance, writing, research, and any field requiring quick thinking and the ability to spot opportunities before others.' },
  Ox:      { animal:'Ox',      emoji:'🐂', element_fixed:'Earth', yin_yang:'Yin',  lucky_numbers:[1,4], lucky_colors:['White','Yellow','Green'], lucky_flowers:['Tulip','Evergreen'], lucky_directions:['South East'], unlucky_colors:['Blue'], unlucky_numbers:[3,4], personality_summary:'Patient and dependable, the Ox is the most hardworking sign of the Chinese zodiac. They achieve great things through steady effort and unwavering determination rather than clever shortcuts.', strengths:['Diligent','Dependable','Strong','Determined','Honest'], weaknesses:['Stubborn','Narrow-minded','Materialistic','Rigid'], best_match:['Rat','Snake','Rooster'], worst_match:['Tiger','Dragon','Horse','Goat'], career_strengths:'Agriculture, manufacturing, construction, medicine, and any field requiring sustained effort and reliability.' },
  Tiger:   { animal:'Tiger',   emoji:'🐅', element_fixed:'Wood',  yin_yang:'Yang', lucky_numbers:[1,3,4], lucky_colors:['Blue','Grey','Orange'], lucky_flowers:['Yellow Lily','Cineraria'], lucky_directions:['East','North','South'], unlucky_colors:['Brown','Gold'], unlucky_numbers:[6,7,8], personality_summary:'Brave and competitive, Tigers never back down from a challenge. Their magnetic personality and natural leadership inspire fierce loyalty. They live life at full intensity.', strengths:['Brave','Confident','Competitive','Energetic','Charismatic'], weaknesses:['Arrogant','Reckless','Impatient','Sensitive to criticism'], best_match:['Horse','Dog'], worst_match:['Ox','Tiger','Snake','Monkey'], career_strengths:'Military, politics, management, advertising, and any field requiring boldness and charisma.' },
  Rabbit:  { animal:'Rabbit',  emoji:'🐇', element_fixed:'Wood',  yin_yang:'Yin',  lucky_numbers:[3,4,9], lucky_colors:['Red','Pink','Purple','Blue'], lucky_flowers:['Plantain Lily','Jasmine'], lucky_directions:['East','South East','South'], unlucky_colors:['Dark Brown','Dark Yellow'], unlucky_numbers:[1,7,8], personality_summary:'Gentle and elegant, Rabbits move through the world with a grace that disarms hostility. Their quiet confidence and keen eye for beauty produce remarkable artistic and diplomatic achievements.', strengths:['Gentle','Elegant','Alert','Quick','Kind'], weaknesses:['Superficial','Stubborn','Melancholic','Overly cautious'], best_match:['Goat','Monkey','Dog','Pig'], worst_match:['Snake','Rooster'], career_strengths:'Art, design, law, diplomacy, and any field requiring sensitivity and refined taste.' },
  Dragon:  { animal:'Dragon',  emoji:'🐉', element_fixed:'Earth', yin_yang:'Yang', lucky_numbers:[1,6,7], lucky_colors:['Gold','Silver','Grayish White'], lucky_flowers:['Bleeding Heart Vine','Larkspur','Petunia'], lucky_directions:['East','North','South'], unlucky_colors:['Blue','Green'], unlucky_numbers:[3,8], personality_summary:'The most auspicious sign in the Chinese zodiac, Dragons are energetic, charismatic, and destined for greatness. They pursue perfection relentlessly and inspire everyone around them to aim higher.', strengths:['Confident','Intelligent','Enthusiastic','Ambitious','Charismatic'], weaknesses:['Arrogant','Impatient','Intolerant','Uncompromising'], best_match:['Rooster','Rat','Monkey'], worst_match:['Ox','Sheep','Dog'], career_strengths:'Politics, entertainment, business leadership, and any field where vision and charisma drive exceptional results.' },
  Snake:   { animal:'Snake',   emoji:'🐍', element_fixed:'Fire',  yin_yang:'Yin',  lucky_numbers:[2,8,9], lucky_colors:['Black','Red','Yellow'], lucky_flowers:['Orchid','Cactus'], lucky_directions:['South East','South','North East'], unlucky_colors:['White','Golden','Brown'], unlucky_numbers:[1,6,7], personality_summary:'Wise and enigmatic, Snakes possess a depth of insight that few other signs can match. They observe more than they reveal, and their decisions — though slow to form — are invariably correct.', strengths:['Intelligent','Wise','Intuitive','Elegant','Attentive'], weaknesses:['Jealous','Suspicious','Snobbish','Secretive to a fault'], best_match:['Ox','Rooster'], worst_match:['Tiger','Rabbit','Snake','Sheep','Pig'], career_strengths:'Philosophy, science, writing, finance, psychology, and any field requiring deep analytical thinking.' },
  Horse:   { animal:'Horse',   emoji:'🐎', element_fixed:'Fire',  yin_yang:'Yang', lucky_numbers:[2,3,7], lucky_colors:['Yellow','Green'], lucky_flowers:['Calla Lily','Jasmine','Marigold'], lucky_directions:['East','West'], unlucky_colors:['Blue','White'], unlucky_numbers:[1,5,6], personality_summary:'Animated and energetic, Horses live for freedom and adventure. Their enthusiasm is infectious and their ability to energise a crowd unmatched. They are born performers who need open space to feel alive.', strengths:['Animated','Active','Energetic','Passionate','Adventurous'], weaknesses:['Selfish','Too much talk','Cannot keep secrets','Lack of perseverance'], best_match:['Tiger','Goat','Dog'], worst_match:['Rat','Ox','Rabbit','Horse'], career_strengths:'Politics, travel, sports, journalism, performance, and any field requiring energy and the magnetic personality of a natural showperson.' },
  Goat:    { animal:'Goat',    emoji:'🐐', element_fixed:'Earth', yin_yang:'Yin',  lucky_numbers:[2,7], lucky_colors:['Brown','Red','Purple'], lucky_flowers:['Carnation','Primrose'], lucky_directions:['North','North West'], unlucky_colors:['Golden','Brown'], unlucky_numbers:[4,9], personality_summary:'Gentle and creative, Goats are the artists of the Chinese zodiac. They have a deep appreciation for beauty and a natural talent for creating it. Their compassion is genuine and profound.', strengths:['Gentle','Mild-mannered','Stable','Sympathetic','Creative'], weaknesses:['Indecisive','Timid','Vain','Pessimistic','Too dependent'], best_match:['Rabbit','Horse','Pig'], worst_match:['Ox','Dog'], career_strengths:'Arts, music, writing, gardening, healing, and any field requiring creativity and empathy.' },
  Monkey:  { animal:'Monkey',  emoji:'🐒', element_fixed:'Metal', yin_yang:'Yang', lucky_numbers:[1,7,8], lucky_colors:['White','Blue','Gold'], lucky_flowers:['Chrysanthemum'], lucky_directions:['North','North West'], unlucky_colors:['Red','Pink'], unlucky_numbers:[2,5,9], personality_summary:'Clever and mischievous, Monkeys are the most versatile and innovative sign. Their problem-solving abilities are extraordinary and their creativity boundless. They can talk their way into — or out of — any situation.', strengths:['Sharp','Smart','Curious','Innovative','Sociable'], weaknesses:['Manipulative','Jealous','Trickster','Lack of persistence'], best_match:['Ox','Rabbit'], worst_match:['Tiger','Pig'], career_strengths:'Technology, business, advertising, science, entertainment, and any field requiring creativity and quick thinking.' },
  Rooster: { animal:'Rooster', emoji:'🐓', element_fixed:'Metal', yin_yang:'Yin',  lucky_numbers:[5,7,8], lucky_colors:['Gold','Brown','Yellow'], lucky_flowers:['Gladiola','Cockscomb','Impatiens'], lucky_directions:['West','South West','North East'], unlucky_colors:['White','Green'], unlucky_numbers:[1,3,9], personality_summary:'Hardworking and observant, Roosters notice details others miss. Their confidence can tip into bluntness, but their honesty is always in service of doing things properly. They are the zodiac\'s perfectionists.', strengths:['Observant','Hardworking','Courageous','Talented','Honest'], weaknesses:['Critical','Impatient','Selfish','Vain'], best_match:['Ox','Snake'], worst_match:['Rat','Rabbit','Horse','Rooster'], career_strengths:'Banking, entertainment, journalism, fashion, medicine, and any field requiring precision and presentation.' },
  Dog:     { animal:'Dog',     emoji:'🐕', element_fixed:'Earth', yin_yang:'Yang', lucky_numbers:[3,4,9], lucky_colors:['Green','Red','Purple'], lucky_flowers:['Rose','Cymbidium Orchid'], lucky_directions:['East','South East','North West'], unlucky_colors:['Blue','Gold'], unlucky_numbers:[1,6,7], personality_summary:'Loyal and sincere, Dogs are the most trustworthy sign of the zodiac. They devote themselves completely to those they love and will fight for justice and fairness. Their moral compass is unshakeable.', strengths:['Loyal','Honest','Amiable','Kind','Cautious','Responsible'], weaknesses:['Anxious','Stubborn','Sensitive','Eccentric','Critical'], best_match:['Rabbit','Tiger','Horse'], worst_match:['Dragon','Sheep','Rooster'], career_strengths:'Law, medicine, social work, teaching, police, and any field where integrity and genuine service to others matter most.' },
  Pig:     { animal:'Pig',     emoji:'🐖', element_fixed:'Water', yin_yang:'Yin',  lucky_numbers:[2,5,8], lucky_colors:['Yellow','Grey','Brown','Gold'], lucky_flowers:['Hydrangea','Pitcher Plant','Marguerite'], lucky_directions:['East','South West','North East'], unlucky_colors:['Red','Blue'], unlucky_numbers:[1,7,8], personality_summary:'Compassionate and generous, Pigs are the most giving sign of the zodiac. They see the best in everyone, enjoy life\'s pleasures with genuine appreciation, and bring warmth wherever they go.', strengths:['Compassionate','Generous','Diligent','Sincere','Sociable'], weaknesses:['Naive','Gullible','Self-indulgent','Over-reliant'], best_match:['Tiger','Rabbit','Goat'], worst_match:['Snake','Monkey'], career_strengths:'Healthcare, hospitality, entertainment, and any field requiring genuine warmth and dedication to others\' wellbeing.' },
};

// ── NAKSHATRA (27 lunar mansions) ────────────────────────────
export const NAKSHATRA_PROFILES: Record<string, NakshatraProfile> = {
  Ashwini:          { nakshatra:'Ashwini',          number:1,  lord:'Ketu',   symbol:'Horse\'s head',          deity:'Ashwini Kumaras', quality:'Swift, healing, pioneering',          gana:'Deva',     personality_summary:'Born healers with remarkable speed and energy. Ashwini natives begin everything quickly and have a youthful, pioneering spirit throughout life.',                                                              strengths:['Quick','Healing ability','Pioneering','Energetic'], challenges:['Impatience','Difficulty completing what they begin'] },
  Bharani:          { nakshatra:'Bharani',          number:2,  lord:'Shukra', symbol:'Yoni',                   deity:'Yama',             quality:'Creative, transformative, intense',  gana:'Manushya', personality_summary:'Bearing the responsibility of creation, Bharani natives are deeply connected to the cycle of life. They carry significant karmic responsibility with grace and strength.',                                    strengths:['Creative','Responsible','Determined','Sensual'], challenges:['Impatience','Stubbornness','Over-burdening themselves'] },
  Krittika:         { nakshatra:'Krittika',         number:3,  lord:'Surya',  symbol:'Razor or flame',         deity:'Agni',             quality:'Purifying, sharp, determined',        gana:'Rakshasa', personality_summary:'Krittika natives are the purifiers of the zodiac. Their sharp intellect and high standards cut through pretence to reveal truth. They can be harsh but are always honest.',                                 strengths:['Sharp intellect','High standards','Courageous','Determined'], challenges:['Overcritical','Perfectionism','Harshness'] },
  Rohini:           { nakshatra:'Rohini',           number:4,  lord:'Chandra',symbol:'Chariot',                deity:'Brahma',           quality:'Fertile, growth-oriented, nurturing', gana:'Manushya', personality_summary:'The most beloved of all Nakshatras, Rohini natives possess extraordinary beauty, creativity, and magnetism. Blessed with material abundance and an eye for beauty in all things.',                         strengths:['Beautiful','Creative','Nurturing','Magnetic','Talented'], challenges:['Possessiveness','Indulgence','Attracting jealousy'] },
  Mrigashira:       { nakshatra:'Mrigashira',       number:5,  lord:'Mangal', symbol:'Deer\'s head',           deity:'Soma',             quality:'Gentle, searching, curious',          gana:'Deva',     personality_summary:'Eternally searching and curious, Mrigashira natives are the seekers of wisdom. Their gentle nature and keen intellect draw them toward learning, spirituality, and creative exploration.',                    strengths:['Curious','Gentle','Intelligent','Versatile'], challenges:['Restlessness','Indecisiveness','Difficulty committing'] },
  Ardra:            { nakshatra:'Ardra',            number:6,  lord:'Rahu',   symbol:'Teardrop',               deity:'Rudra',            quality:'Stormy, transformative, sharp',       gana:'Manushya', personality_summary:'Ardra natives undergo profound transformation through hardship. Like the storm that renews the earth, their greatest difficulties become the source of their greatest strengths.',                             strengths:['Resilient','Analytical','Transformative','Sharp mind'], challenges:['Emotional turbulence','Destructive tendencies when stressed'] },
  Punarvasu:        { nakshatra:'Punarvasu',        number:7,  lord:'Guru',   symbol:'Quiver of arrows',       deity:'Aditi',            quality:'Restoring, returning, expansive',     gana:'Deva',     personality_summary:'Punarvasu means return of the light. These natives have extraordinary resilience and always find their way back to joy and abundance after difficult periods.',                                               strengths:['Optimistic','Philosophical','Generous','Resilient'], challenges:['Overoptimism','Lack of focus','Idealism outpacing reality'] },
  Pushya:           { nakshatra:'Pushya',           number:8,  lord:'Shani',  symbol:'Flower or cow udder',    deity:'Brihaspati',       quality:'Nourishing, protective, spiritual',   gana:'Deva',     personality_summary:'The most auspicious of all Nakshatras, Pushya natives are natural nurturers and deeply spiritual beings. They nourish everyone they encounter and carry a profound sense of dharma.',                         strengths:['Nurturing','Spiritual','Devoted','Wise','Ethical'], challenges:['Rigid in beliefs','Too self-sacrificing','Risk of fanaticism'] },
  Ashlesha:         { nakshatra:'Ashlesha',         number:9,  lord:'Budha',  symbol:'Serpent',                deity:'Nagas',            quality:'Mystical, entwining, perceptive',     gana:'Rakshasa', personality_summary:'Ashlesha natives possess the wisdom and power of the serpent. Their insight into human psychology is extraordinary and their ability to transform through crisis is their defining strength.',               strengths:['Psychologically astute','Mystical','Perceptive','Transformative'], challenges:['Manipulative tendencies','Secrecy','Unpredictability'] },
  Magha:            { nakshatra:'Magha',            number:10, lord:'Ketu',   symbol:'Royal throne',           deity:'Pitrs',            quality:'Regal, ancestral, powerful',          gana:'Rakshasa', personality_summary:'Magha natives carry the energy of royalty and ancestral power. They are born leaders with an innate sense of dignity and authority that commands respect without demanding it.',                               strengths:['Regal bearing','Leadership','Traditional values','Honourable'], challenges:['Arrogance','Elitism','Rigid attachment to tradition'] },
  PurvaPhalguni:    { nakshatra:'Purva Phalguni',   number:11, lord:'Shukra', symbol:'Hammock',                deity:'Bhaga',            quality:'Creative, indulgent, joyful',         gana:'Manushya', personality_summary:'Purva Phalguni natives are the joy-bringers of the zodiac. They possess extraordinary creative talent and a love of pleasure, beauty, and celebration that lifts everyone around them.',                   strengths:['Creative','Artistic','Magnetic','Generous','Joyful'], challenges:['Indulgence','Laziness','Vanity'] },
  UttaraPhalguni:   { nakshatra:'Uttara Phalguni', number:12, lord:'Surya',  symbol:'Bed',                    deity:'Aryaman',          quality:'Service, commitment, helpful',        gana:'Manushya', personality_summary:'Uttara Phalguni natives are the servers of humanity. Their commitment to others is sincere and their capacity for hard work in service of a worthy cause is extraordinary.',                                strengths:['Service-oriented','Reliable','Generous','Strong character'], challenges:['Overgiving to depletion','Can be taken advantage of'] },
  Hasta:            { nakshatra:'Hasta',            number:13, lord:'Chandra',symbol:'Hand or open palm',      deity:'Savitar',          quality:'Skilled, resourceful, witty',         gana:'Deva',     personality_summary:'Hasta natives are the most practically skilled of all Nakshatras. Their hands hold extraordinary talent — whether for healing, crafting, or creating — and their wit is sharp and quick.',                   strengths:['Skilled','Witty','Resourceful','Adaptable','Practical'], challenges:['Cunning when stressed','Nervous energy','Restlessness'] },
  Chitra:           { nakshatra:'Chitra',           number:14, lord:'Mangal', symbol:'Bright jewel or pearl',  deity:'Vishwakarma',      quality:'Beautiful, artistic, dynamic',        gana:'Rakshasa', personality_summary:'Chitra natives are the artists and architects of the zodiac. Their eye for beauty, symmetry, and design is extraordinary — everything they create carries a unique aesthetic brilliance.',                   strengths:['Artistic','Beautiful presence','Perceptive','Dynamic'], challenges:['Vanity','Perfectionism','Drawn to superficiality'] },
  Swati:            { nakshatra:'Swati',            number:15, lord:'Rahu',   symbol:'Sword or young shoot',   deity:'Vayu',             quality:'Independent, flexible, diplomatic',   gana:'Deva',     personality_summary:'Swati natives are the free spirits of the zodiac. Like a young plant bending in the wind but never breaking, they possess remarkable flexibility and an independent spirit that cannot be contained.',          strengths:['Independent','Flexible','Diplomatic','Business-minded'], challenges:['Restlessness','Scattered energy','Indecisiveness at key moments'] },
  Vishakha:         { nakshatra:'Vishakha',         number:16, lord:'Guru',   symbol:'Triumphal arch',         deity:'Indra-Agni',       quality:'Purposeful, ambitious, focused',      gana:'Rakshasa', personality_summary:'Vishakha natives are driven by a singular, burning purpose. They are the most goal-oriented of all Nakshatras — once they identify their mission, nothing can stop their pursuit of it.',                    strengths:['Purposeful','Determined','Focused','Persuasive'], challenges:['Fanaticism when goal-focused','Jealousy','Can be domineering'] },
  Anuradha:         { nakshatra:'Anuradha',         number:17, lord:'Shani',  symbol:'Lotus flower',           deity:'Mitra',            quality:'Devoted, balanced, organised',        gana:'Deva',     personality_summary:'Anuradha natives are the lotus of the zodiac — they rise through difficulty and darkness to bloom in extraordinary beauty. Their devotion and ability to maintain balance through adversity is their defining quality.', strengths:['Devoted','Balanced','Friendly','Organised','Spiritually aware'], challenges:['Feeling unappreciated','Can be too accommodating'] },
  Jyeshtha:         { nakshatra:'Jyeshtha',         number:18, lord:'Budha',  symbol:'Umbrella or amulet',     deity:'Indra',            quality:'Protective, responsible, eldest',     gana:'Rakshasa', personality_summary:'Jyeshtha natives carry the energy of the eldest and most powerful. They feel a deep responsibility to protect others and to earn their seniority through genuine achievement.',                                    strengths:['Responsible','Protective','Courageous','Intelligent'], challenges:['Arrogance','Jealousy','Burdened by responsibility'] },
  Mula:             { nakshatra:'Mula',             number:19, lord:'Ketu',   symbol:'Tied roots',             deity:'Nirriti',          quality:'Investigative, rooted, transformative',gana:'Rakshasa', personality_summary:'Mula natives are the investigators of the zodiac. Their need to understand the root of everything drives them to profound discoveries — though the process often requires dismantling what came before.',           strengths:['Investigative','Philosophical','Energetic','Pioneering'], challenges:['Destructive tendency in transformation','Radical changes causing instability'] },
  PurvaAshadha:     { nakshatra:'Purva Ashadha',    number:20, lord:'Shukra', symbol:'Elephant tusk or fan',   deity:'Apas',             quality:'Invincible, purifying, proud',        gana:'Manushya', personality_summary:'Purva Ashadha natives are the invincible ones. Once they set a goal, no obstacle can deter them. Their purifying energy and philosophical nature lead them to profound truths.',                                  strengths:['Invincible will','Philosophical','Proud','Energetic'], challenges:['Pride that resists correction','Inflexibility','Overconfidence'] },
  UttaraAshadha:    { nakshatra:'Uttara Ashadha',   number:21, lord:'Surya',  symbol:'Elephant tusk',          deity:'Vishwadevas',      quality:'Victorious, universal, ethical',      gana:'Manushya', personality_summary:'Uttara Ashadha natives are the universal victors. Their victories are permanent and ethical — they win through virtue and dedication. Their achievements benefit all of humanity.',                                strengths:['Ethical','Patient','Victorious','Universal appeal'], challenges:['Slow to begin','Overly idealistic about human nature'] },
  Shravana:         { nakshatra:'Shravana',         number:22, lord:'Chandra',symbol:'Ear or three footprints', deity:'Vishnu',          quality:'Listening, learning, connecting',     gana:'Deva',     personality_summary:'Shravana natives are the listeners and connectors of the zodiac. They process the world primarily through sound and have extraordinary memory for what they hear.',                                                  strengths:['Attentive','Learning-oriented','Wise','Good organiser'], challenges:['Over-analytical','Gossip tendencies','Difficulty with quick decisions'] },
  Dhanishtha:       { nakshatra:'Dhanishtha',       number:23, lord:'Mangal', symbol:'Drum or flute',          deity:'Ashta Vasus',      quality:'Wealthy, musical, brave, social',     gana:'Rakshasa', personality_summary:'Dhanishtha natives are the most musically gifted of all Nakshatras. Blessed with wealth, social charm, and a rhythm for life that makes everything they do feel like a beautiful, purposeful dance.',              strengths:['Musical','Wealthy','Social','Brave','Charitable'], challenges:['Materialistic','Delays in marriage','Can be egoistic'] },
  Shatabhisha:      { nakshatra:'Shatabhisha',      number:24, lord:'Rahu',   symbol:'100 stars or empty circle', deity:'Varuna',        quality:'Healing, secretive, independent',     gana:'Rakshasa', personality_summary:'Shatabhisha natives are the healers who work in solitude. Their understanding of medicine, astrology, and hidden sciences is extraordinary. They prefer to work alone and protect their inner world.',         strengths:['Healing ability','Scientific mind','Independent','Unique insight'], challenges:['Isolation','Stubbornness','Difficulty trusting others'] },
  PurvaBhadrapada:  { nakshatra:'Purva Bhadrapada', number:25, lord:'Guru',   symbol:'Swords or two-faced man', deity:'Aja Ekapad',      quality:'Fiery, transformative, mystical',     gana:'Manushya', personality_summary:'Purva Bhadrapada natives are the mystics who see beyond ordinary reality. Their fire transforms everything it touches — they are capable of extraordinary spiritual elevation or profound earthly achievement.',    strengths:['Mystical insight','Philosophical depth','Passionate','Eccentric brilliance'], challenges:['Extreme tendencies','Eccentricity that alienates'] },
  UttaraBhadrapada: { nakshatra:'Uttara Bhadrapada',number:26, lord:'Shani',  symbol:'Twins or funeral cot back', deity:'Ahirbudhnya',   quality:'Deep, wise, compassionately restrained',gana:'Manushya',personality_summary:'Uttara Bhadrapada natives are the deepest wisdom-holders of the zodiac. Their understanding of karma, depth of compassion, and ability to restrain their extraordinary power marks them as true sages.',        strengths:['Deep wisdom','Compassionate','Spiritually evolved','Restrained power'], challenges:['Difficulty expressing their depth','Withdrawn','Often misunderstood'] },
  Revati:           { nakshatra:'Revati',           number:27, lord:'Budha',  symbol:'Fish or drum',           deity:'Pushan',           quality:'Nourishing, wealthy, completing',      gana:'Deva',     personality_summary:'Revati natives carry the completion of the cosmic cycle. The last Nakshatra, they hold the wisdom of the entire zodiac. Their gentleness, generosity, and spiritual depth makes them beloved by all.',                strengths:['Gentle','Wealthy','Nourishing','Spiritually gifted','Generous'], challenges:['Overly idealistic','Difficulty in harsh material world','Over-generous'] },
};

// ── LIFE PATH EXTENDED ────────────────────────────────────────
export const LIFE_PATH_EXTENDED: Record<number, LifePathProfile> = {
  1:  { number:1,  title:'The Leader',               ruling_planet:'Sun',           element:'Fire',  traits:'Independent, ambitious, pioneering, and self-reliant. Natural leaders who forge their own path.',           strengths:['Natural leadership','Originality','Determination','Courage'],          challenges:['Stubbornness','Arrogance','Difficulty accepting help'],             love_style:'Passionate and loyal; needs a partner who respects their independence.',     career_paths:['CEO','Entrepreneur','Politician','Military officer','Inventor'],     spiritual_lesson:'Leading with humility and accepting that true strength includes vulnerability.', lucky_color:'Red and Orange', lucky_stone:'Ruby' },
  2:  { number:2,  title:'The Diplomat',              ruling_planet:'Moon',          element:'Water', traits:'Cooperative, sensitive, peaceful, and empathetic. The great peacemakers who thrive through collaboration.',  strengths:['Diplomacy','Intuition','Patience','Sensitivity'],                      challenges:['Over-sensitivity','Indecisiveness','Fear of confrontation'],         love_style:'Devoted and caring; partnership is their most natural state of being.', career_paths:['Diplomat','Counsellor','Musician','Mediator','Social worker'],       spiritual_lesson:'Standing firm in their own truth while honouring others.',             lucky_color:'Orange and White', lucky_stone:'Pearl' },
  3:  { number:3,  title:'The Creative',              ruling_planet:'Jupiter',       element:'Fire',  traits:'Expressive, optimistic, social, and artistic. Natural communicators who bring joy and inspiration.',        strengths:['Creativity','Communication','Optimism','Charisma'],                   challenges:['Scattered energy','Superficiality','Lack of sustained focus'],       love_style:'Romantic and expressive; keeps relationships vibrant with creativity.', career_paths:['Artist','Actor','Writer','Teacher','Motivational speaker'],          spiritual_lesson:'Channelling creative energy into sustained, purposeful work.',         lucky_color:'Yellow and Gold', lucky_stone:'Topaz' },
  4:  { number:4,  title:'The Builder',               ruling_planet:'Uranus',        element:'Earth', traits:'Practical, disciplined, hardworking, and reliable. Methodical achievers who build lasting legacies.',       strengths:['Practicality','Reliability','Discipline','Organisation'],              challenges:['Rigidity','Resistance to change','Workaholic tendencies'],          love_style:'Stable and devoted; shows love through acts of service and loyalty.',   career_paths:['Engineer','Architect','Accountant','Project manager','Builder'],     spiritual_lesson:'Rest and play are as essential as work.',                              lucky_color:'Blue and Grey', lucky_stone:'Sapphire' },
  5:  { number:5,  title:'The Adventurer',            ruling_planet:'Mercury',       element:'Air',   traits:'Free-spirited, versatile, curious, and adaptable. Seekers of experience who embrace change and freedom.',   strengths:['Adaptability','Versatility','Curiosity','Resourcefulness'],            challenges:['Restlessness','Impulsiveness','Difficulty committing'],              love_style:'Exciting partners who need freedom within relationship to thrive.',      career_paths:['Journalist','Salesperson','Actor','Explorer','Entrepreneur'],        spiritual_lesson:'True freedom comes from mastery, not from avoiding commitment.',       lucky_color:'Turquoise and Sky Blue', lucky_stone:'Turquoise' },
  6:  { number:6,  title:'The Nurturer',              ruling_planet:'Venus',         element:'Earth', traits:'Responsible, caring, family-oriented, and harmonious. Natural caregivers devoted to community wellbeing.',  strengths:['Nurturing','Responsibility','Compassion','Artistic sense'],            challenges:['Self-sacrificing','Controlling','Perfectionism'],                    love_style:'Devoted and protective; creates beautiful, nurturing homes and bonds.', career_paths:['Doctor','Teacher','Counsellor','Interior designer','Social worker'], spiritual_lesson:'Caring for themselves as generously as they care for others.',          lucky_color:'Green and Pink', lucky_stone:'Emerald' },
  7:  { number:7,  title:'The Seeker',                ruling_planet:'Neptune',       element:'Water', traits:'Analytical, introspective, spiritual, and perceptive. Deep thinkers who pursue wisdom and inner truth.',    strengths:['Analytical mind','Spiritual depth','Intuition','Research ability'],   challenges:['Isolation','Secretiveness','Difficulty trusting others'],            love_style:'Deep and mystical; needs intellectual and spiritual connection above all.', career_paths:['Scientist','Philosopher','Researcher','Psychologist','Spiritual teacher'], spiritual_lesson:'Trusting others enough to share their extraordinary inner world.', lucky_color:'Purple and Violet', lucky_stone:'Amethyst' },
  8:  { number:8,  title:'The Achiever',              ruling_planet:'Saturn',        element:'Earth', traits:'Powerful, authoritative, business-minded, and goal-oriented. Natural executives who manifest success.',      strengths:['Ambition','Authority','Financial intelligence','Determination'],       challenges:['Workaholism','Materialism','Control issues'],                        love_style:'Powerful and protective; must learn emotional vulnerability over time.', career_paths:['Business executive','Judge','Banker','Politician','Property developer'], spiritual_lesson:'True power comes from service rather than control.',              lucky_color:'Dark Brown and Black', lucky_stone:'Garnet' },
  9:  { number:9,  title:'The Humanitarian',          ruling_planet:'Mars',          element:'Fire',  traits:'Compassionate, idealistic, generous, and wise. Visionaries dedicated to serving the greater good.',         strengths:['Compassion','Generosity','Wisdom','Global consciousness'],             challenges:['Over-giving','Martyrdom complex','Idealism vs reality'],             love_style:'Passionate and giving; needs a partner who shares their vision for a better world.', career_paths:['Humanitarian','Artist','Healer','Diplomat','Spiritual leader'], spiritual_lesson:'Releasing what no longer serves while embracing the eternal.', lucky_color:'Gold and Rose', lucky_stone:'Bloodstone' },
  11: { number:11, title:'The Visionary (Master 11)', ruling_planet:'Moon and Sun',  element:'Air',   traits:'Highly intuitive, inspirational, and spiritually aware. Master number with heightened sensitivity.',          strengths:['Extraordinary intuition','Inspiration','Spiritual awareness','Vision'],challenges:['Nervous tension','Extremes of emotion','Self-doubt'],               love_style:'Deeply sensitive; experiences love at an almost spiritual level.',       career_paths:['Spiritual teacher','Inventor','Visionary leader','Philosopher','Artist'], spiritual_lesson:'Grounding extraordinary vision in practical reality.',           lucky_color:'Silver and Ivory', lucky_stone:'Moonstone' },
  22: { number:22, title:'The Master Builder (22)',   ruling_planet:'Uranus and Saturn', element:'Earth', traits:'Exceptionally capable, disciplined, and visionary. Most powerful number — turns ambitious dreams into reality.', strengths:['Extraordinary capability','Vision at scale','Practical idealism'], challenges:['Overwhelming pressure','Perfectionism','Difficulty delegating'],  love_style:'Devoted but simultaneously driven; life work always competes for attention.', career_paths:['Visionary architect','Global leader','Pioneer','Master builder','Innovator'], spiritual_lesson:'Greatest structures are built on love, not just ambition.', lucky_color:'Coral and Sand', lucky_stone:'Coral' },
  33: { number:33, title:'The Master Teacher (33)',   ruling_planet:'Jupiter and Venus', element:'Water', traits:'Rarest number — pure compassion, completely devoted to the service of others.',                         strengths:['Unconditional love','Healing presence','Teaching ability','Selfless service'], challenges:['Self-neglect','Martyrdom','Difficulty with boundaries'], love_style:'Most selfless and devoted partner; must guard against losing themselves.', career_paths:['Healer','Spiritual master','Compassionate leader','Teacher of teachers','Guide'], spiritual_lesson:'Embodying unconditional love while maintaining boundaries that sustain service.', lucky_color:'Indigo and Crimson', lucky_stone:'Sapphire' },
};

// ── RUNTIME VALIDATION (runs at import time) ─────────────────
const _SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const _RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const _ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];

_SIGNS.forEach(s => { if (!WESTERN_ZODIAC_PROFILES[s]) throw new Error(`Missing Western: ${s}`); const p = WESTERN_ZODIAC_PROFILES[s]; if (!p.tarot_card) throw new Error(`Missing tarot: ${s}`); if (!p.lucky_stone) throw new Error(`Missing stone: ${s}`); if (p.strengths.length < 3) throw new Error(`${s} needs 3+ strengths`); });
_RASHIS.forEach(r => { if (!VEDIC_RASHI_PROFILES[r]) throw new Error(`Missing Rashi: ${r}`); const p = VEDIC_RASHI_PROFILES[r]; if (!p.lucky_stone_hindi) throw new Error(`Missing Hindi stone: ${r}`); if (!p.mantra) throw new Error(`Missing mantra: ${r}`); if (!p.rashi_devanagari) throw new Error(`Missing Devanagari: ${r}`); });
_ANIMALS.forEach(a => { if (!CHINESE_ZODIAC_PROFILES[a]) throw new Error(`Missing Chinese: ${a}`); });
if (Object.keys(NAKSHATRA_PROFILES).length < 27) throw new Error(`Only ${Object.keys(NAKSHATRA_PROFILES).length}/27 Nakshatras`);
[1,2,3,4,5,6,7,8,9,11,22,33].forEach(n => { if (!LIFE_PATH_EXTENDED[n]) throw new Error(`Missing Life Path: ${n}`); });

console.log('✅ astrologicalData.ts validation passed — all 12+12+12+27+13 profiles present');
