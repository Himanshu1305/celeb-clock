export interface TarotCard {
  name: string;
  number: string;
  emoji: string;
  keywords: string[];
  upright: string;
  reversed: string;
  affirmation: string;
  deepMeaning: string;
  love: string;
  career: string;
  health: string;
  spirituality: string;
  famousPeople: string[];
}

export const MAJOR_ARCANA: Record<number, TarotCard> = {
  0: {
    name: 'The Fool', number: '0', emoji: '🌟',
    keywords: ['beginnings', 'innocence', 'adventure', 'potential', 'spontaneity'],
    upright: 'The Fool represents infinite potential and the courage to begin. This is the card of the eternal optimist — someone who leaps into life without fear, trusting that the universe will catch them. It is not naivety; it is the wisdom to know that every great journey starts with a single step into the unknown.',
    reversed: "Guard against recklessness. The Fool reversed asks you to look before you leap — not to stop leaping, but to be conscious of what you're stepping into.",
    affirmation: 'I trust the journey. I am open to infinite possibility. Every beginning is sacred.',
    deepMeaning: "The Fool is card zero — not because it is nothing, but because it contains everything. In the Tarot's story, The Fool is the soul before it enters the material world, full of wonder and unwritten. This energy follows people with Life Path 22 (or those whose numbers reduce to zero through special calculation). You carry the energy of pure potential. The challenge — and the gift — is learning to channel that energy without being overwhelmed by the infinite choices before you.",
    love: "In love, The Fool brings fresh energy and childlike joy. You approach relationships with openness and without the baggage of past disappointments — a rare and beautiful quality. Be careful not to rush in without seeing clearly.",
    career: 'The Fool in career speaks to entrepreneurship, new ventures, and the courage to try something completely new. You are not meant for a predictable path. Your greatest professional successes will come from leaps others considered too risky.',
    health: 'The Fool energy calls for physical adventure — movement, exploration, time in nature. Your health thrives when life feels like an adventure rather than a routine.',
    spirituality: "The Fool is the most spiritually significant card in the deck — the soul before experience, pure and unbounded. Your spiritual path is one of direct experience rather than doctrine.",
    famousPeople: ['Charlie Chaplin', 'Robin Williams', 'Amelia Earhart'],
  },
  1: {
    name: 'The Magician', number: 'I', emoji: '🪄',
    keywords: ['willpower', 'skill', 'manifestation', 'resourcefulness', 'action'],
    upright: 'The Magician is the master of will and manifestation. Every tool needed for success is already in your hands — the question is whether you have the focus and intention to use them. You can turn thought into reality. You can make things happen through sheer concentrated will.',
    reversed: "Guard against manipulation — of yourself or others. The Magician reversed warns against using your considerable skills for deception or shortcuts that undermine your integrity.",
    affirmation: 'I have everything I need. I create my reality with focused intention and skill.',
    deepMeaning: "The Magician stands between heaven and earth — one hand pointing up, one pointing down. As above, so below. This card belongs to Life Path 1s: natural leaders and initiators who translate vision into reality. Your superpower is your ability to make things happen through will, intelligence, and resourcefulness. The Magician's table holds all four suits — cups, wands, swords, pentacles — meaning you have access to emotional, creative, intellectual, and material power simultaneously.",
    love: "In love, you are magnetic and deliberately charming. You know how to create romantic experiences that feel magical. Be careful to ensure you're being authentically yourself rather than performing a version of yourself.",
    career: 'The Magician thrives in roles where individual initiative and skill determine outcomes — entrepreneurship, sales, innovation, leadership. You are most powerful when you have autonomy and clear goals.',
    health: "Your health responds powerfully to your mindset. The Magician's mental focus can be directed toward healing — visualisation and intentional lifestyle changes work especially well for you.",
    spirituality: 'Your spiritual path involves active engagement with the divine — ritual, intention-setting, and the belief that you co-create your reality with the universe.',
    famousPeople: ['Steve Jobs', 'Oprah Winfrey', 'Nikola Tesla'],
  },
  2: {
    name: 'The High Priestess', number: 'II', emoji: '🌙',
    keywords: ['intuition', 'mystery', 'inner knowledge', 'patience', 'subconscious'],
    upright: 'The High Priestess is the keeper of hidden wisdom. She sits between the known and the unknown, between the conscious and the unconscious, and she trusts both equally. You know things without knowing how you know them. This is not a flaw — it is your greatest gift. Trust it.',
    reversed: 'You may be ignoring your intuition in favour of logic, or keeping secrets that need to be voiced. The High Priestess reversed asks you to listen inward before acting outward.',
    affirmation: 'I trust my inner knowing. My intuition is always guiding me toward what is true.',
    deepMeaning: 'The High Priestess is associated with the moon, with water, with the deep feminine principle of receptivity and inner knowing. Life Path 2s carry this energy — they are the most intuitively gifted in the numerological system. The High Priestess holds a scroll (the Torah in traditional decks) that is partially hidden — she knows more than she reveals. Your wisdom is deep and often hard to explain. You understand people and situations at a level that others find uncanny.',
    love: "In love, you are deeply intuitive about your partner's needs and emotions. You often sense what they need before they articulate it. You need a partner who appreciates depth and is not threatened by your emotional perceptiveness.",
    career: 'The High Priestess excels in roles that require insight, research, counselling, or working with the hidden dimensions of reality. Psychology, research, spiritual guidance, and healing are natural domains.',
    health: 'Your health is deeply connected to your emotional and spiritual state. Practices that quiet the mind — meditation, time near water, journaling — have an outsized positive impact on your physical wellbeing.',
    spirituality: 'The High Priestess is the most spiritually advanced card in the Major Arcana. Your spiritual path is one of direct inner knowing rather than external authority. You access the divine through silence and stillness.',
    famousPeople: ['Malala Yousafzai', 'Mother Teresa', 'Barack Obama'],
  },
  3: {
    name: 'The Empress', number: 'III', emoji: '🌿',
    keywords: ['abundance', 'creativity', 'nurturing', 'nature', 'fertility'],
    upright: 'The Empress is the embodiment of creative abundance and nurturing love. She is Venus in her fullest expression — generative, beautiful, life-giving. You carry the capacity to create, to grow, and to make whatever you touch flourish. Abundance is your natural state when you are aligned.',
    reversed: 'You may be neglecting your own needs while nurturing everyone else. Creative blocks may signal a need to reconnect with nature and your own sensory experience.',
    affirmation: 'I am creative, abundant, and deeply connected to the flow of life. Beauty surrounds me.',
    deepMeaning: "The Empress is ruled by Venus and sits in a lush garden — the natural world responds to her presence by becoming more beautiful. Life Path 3s carry this energy. The number 3 in numerology represents the child born from the union of 1 and 2 — it is pure creative expression, the manifestation of joy. You are here to create and to make the world more beautiful through your creative contribution, whether that's art, family, business, or simply the way you inhabit a room.",
    love: 'In love, you are deeply giving, sensual, and devoted. You express love through acts of beauty — cooking, creating, making your partner feel cherished. You need a partner who can receive this abundance without taking it for granted.',
    career: 'The Empress thrives in creative, nurturing, or nature-related fields. Arts, gardening, culinary arts, beauty, childcare, healing — anywhere that creation and growth are the primary currency.',
    health: 'Your health flourishes with time in nature, sensory pleasure, and creative expression. A lifestyle that includes beauty — in your environment, your food, your movement — is genuinely medicinal for you.',
    spirituality: 'Your spiritual path runs through the natural world. The divine speaks to you through seasons, through bodies, through creative acts. Rituals involving earth, plants, and sensory experience connect you to the sacred.',
    famousPeople: ['Beyoncé', 'Pablo Picasso', 'Frida Kahlo'],
  },
  4: {
    name: 'The Emperor', number: 'IV', emoji: '👑',
    keywords: ['authority', 'structure', 'stability', 'discipline', 'leadership'],
    upright: 'The Emperor is the builder of systems and the keeper of order. He creates structure from chaos so that others can flourish within it. Your discipline, reliability, and long-term thinking are not limitations — they are the foundations upon which remarkable things are built.',
    reversed: 'Rigid control becomes tyranny. The Emperor reversed asks whether your need for control is serving you and others, or merely protecting you from the discomfort of uncertainty.',
    affirmation: 'I build with purpose and wisdom. My structure creates freedom and safety for those I lead.',
    deepMeaning: 'The Emperor sits on a stone throne adorned with ram heads — Aries energy, Mars energy, the force of will applied to material reality. Life Path 4s carry this archetype. The number 4 represents the four directions, the four seasons, the four elements — the fundamental structure of reality. You are someone who understands that freedom requires structure; that the most creative people often have the most disciplined routines; that rules, when wisely created, serve life rather than constraining it.',
    love: 'In love, you are loyal, protective, and deeply committed. You express love through provision and stability — ensuring your partner is safe and cared for. You need a partner who appreciates your steadiness rather than seeing it as emotional restraint.',
    career: 'The Emperor thrives in leadership, management, finance, law, engineering, or any field where building reliable systems is the core competency. You are at your best when you have a clear domain to govern.',
    health: 'Consistent routine is your health superpower. The Emperor energy responds well to structured exercise, regular sleep schedules, and systematic nutrition. What you do consistently matters far more than occasional heroic efforts.',
    spirituality: 'Your spiritual path involves embodied practice rather than abstract belief. You find the sacred in discipline, in mastery, in the satisfaction of work done well and structures built to last.',
    famousPeople: ['Angela Merkel', 'Elon Musk', 'Warren Buffett'],
  },
  5: {
    name: 'The Hierophant', number: 'V', emoji: '🔑',
    keywords: ['tradition', 'spiritual wisdom', 'teaching', 'conformity', 'institutions'],
    upright: "The Hierophant is the bridge between the divine and the human — the teacher, the spiritual guide, the keeper of meaningful tradition. You carry the wisdom of those who came before, and the responsibility to pass it forward. Teaching, guiding, and translating complex truth into accessible wisdom is your calling.",
    reversed: 'Question inherited beliefs rather than accepting them without examination. The Hierophant reversed asks whether the traditions you uphold truly serve life, or merely serve the institution.',
    affirmation: "I honour wisdom while remaining open to new truth. I teach what I know and learn what I don't.",
    deepMeaning: "The Hierophant holds the keys to the sacred — two keys, one gold (solar, conscious) and one silver (lunar, unconscious). Life Path 5s carry this archetype at their best: the teacher who translates ancient wisdom into contemporary relevance. The number 5 sits at the centre of 1–9, mediating between the lower numbers (personal development) and the higher (spiritual development). You are a natural bridge-builder — between ideas, between people, between the material and the spiritual.",
    love: 'In love, you seek meaningful partnership with shared values at its foundation. Shallow relationships do not sustain you. You are most yourself with a partner who engages you on a philosophical level.',
    career: 'The Hierophant excels in teaching, spiritual guidance, counselling, medicine, law, and any role where accumulated wisdom is applied to help others navigate complexity.',
    health: 'Traditional approaches to health — Ayurveda, TCM, well-established nutritional wisdom — often resonate more strongly for you than cutting-edge biohacking. Your body responds to time-tested practices.',
    spirituality: 'Your spiritual path moves through structure — whether a traditional religion, a meditation lineage, or a philosophical tradition. You need a framework through which to understand the sacred, then you transcend it.',
    famousPeople: ['Dalai Lama', 'Rumi', 'Carl Jung'],
  },
  6: {
    name: 'The Lovers', number: 'VI', emoji: '❤️',
    keywords: ['love', 'harmony', 'relationships', 'values alignment', 'choice'],
    upright: "The Lovers is fundamentally about alignment — between your values and your actions, between who you are and how you live, between yourself and the people you love. When you are in alignment, everything flows. When you are not, everything resists. This card asks you to choose from your deepest truth.",
    reversed: "Choices made from fear, obligation, or others' expectations rather than from authentic values. The Lovers reversed asks: what would you choose if you weren't afraid?",
    affirmation: 'I choose love. I choose alignment. I live in accordance with my deepest truth.',
    deepMeaning: "The Lovers card traditionally shows Adam and Eve in the Garden — the moment of conscious choice, the birth of free will. Life Path 6s carry this energy: their lives are fundamentally shaped by the quality of their relationships and their ability to make choices that align love with responsibility. The number 6 in numerology is the number of beauty, harmony, and devotion. You are someone for whom love is not a luxury but a necessity — and whose greatest achievements are most often relational.",
    love: 'In love, you are one of the most devoted partners in the numerological system. You take relationships seriously and give yourself completely. You need genuine soul-level connection, not just compatibility.',
    career: 'The Lovers thrives in roles involving relationships, counselling, the arts, beauty, or any work that requires integration of opposing forces. You do your best work when you genuinely love what you do.',
    health: 'Your health is deeply influenced by the quality of your relationships. Conflict and disconnection manifest physically for you more than for other numbers. Nurturing your key relationships is literally health-preserving.',
    spirituality: 'Love is your spiritual path. Not romantic love exclusively, but love as a practice — the choice to see the divine in others, to remain open-hearted in a world that often rewards closing down.',
    famousPeople: ['Princess Diana', 'John Lennon', 'Frida Kahlo'],
  },
  7: {
    name: 'The Chariot', number: 'VII', emoji: '⚡',
    keywords: ['willpower', 'determination', 'control', 'victory', 'direction'],
    upright: 'The Chariot is willpower in motion — focused, controlled, unstoppable. The charioteer holds no reins; he controls two sphinxes of opposing nature through pure mental concentration. You win not through brute force but through focused will and the mastery of your own contradictory impulses.',
    reversed: 'Aggression without direction. The Chariot reversed warns against forcing outcomes through sheer will when wisdom, patience, or a change of direction is what is actually needed.',
    affirmation: 'I direct my energy with purpose. I master myself before mastering circumstances.',
    deepMeaning: "The Chariot's two sphinxes — one black, one white — represent the opposing forces that every Life Path 7 must learn to harness: logic and intuition, solitude and connection, the desire for certainty and the reality of mystery. The number 7 is the number of the seeker, the analyst, the philosopher. You are driven by an inner need to understand — to penetrate beneath the surface of things until you reach bedrock truth. Your willpower is formidable when properly directed, but it requires a worthy destination.",
    love: 'In love, you need a partner who can engage you intellectually and who gives you the solitude you need to recharge. You are deeply loyal but may struggle to verbalise your feelings — actions matter more to you than words.',
    career: 'The Chariot excels in roles requiring focused expertise, strategic thinking, and the ability to maintain direction under pressure. Research, analysis, strategy, science, and philosophy are natural domains.',
    health: 'Your health benefits from physical activities that also engage your mind — martial arts, chess-boxing, trail running, yoga — anything that requires simultaneous physical and mental focus.',
    spirituality: 'Your spiritual path is fundamentally intellectual — you arrive at faith through rigorous examination, not surrender. Philosophy, sacred texts, and meditation traditions that value questioning over doctrine speak to you most.',
    famousPeople: ['Nikola Tesla', 'Bruce Lee', 'Marie Curie'],
  },
  8: {
    name: 'Strength', number: 'VIII', emoji: '🦁',
    keywords: ['inner strength', 'courage', 'patience', 'compassion', 'influence'],
    upright: "Strength shows a woman calmly closing a lion's mouth — not through force, but through love and quiet confidence. True strength, this card teaches, is the capacity to face what frightens you without being consumed by it. You tame the wild not by fighting it, but by understanding it, accepting it, and gently redirecting it.",
    reversed: 'Self-doubt masquerading as humility. The Strength reversed asks whether you are genuinely being compassionate or merely avoiding conflict because you do not trust your own power.',
    affirmation: 'My true strength comes from love, patience, and inner knowing. I am powerful and gentle in equal measure.',
    deepMeaning: "Life Path 8s carry the Strength archetype at its most evolved — the understanding that material power and spiritual power are most potent when combined, not separated. The number 8 turned on its side is the infinity symbol — limitless potential, the continuous exchange of energy between the material and the spiritual. You are someone who can move mountains — but your greatest achievements come when you move them with care for those who live on them.",
    love: 'In love, you are powerfully devoted and deeply loyal. You have the strength to hold space for your partner\'s weaknesses without being consumed by them. You need a partner who can stand beside you rather than behind you.',
    career: 'The Strength energy thrives in leadership, medicine, social justice, therapy, animal care, and any role where inner courage and compassion for others are the primary requirements.',
    health: 'Your physical body is typically robust and resilient. The greater health challenge for Strength energy is burnout from carrying too much. Learning to receive care as well as give it is your health imperative.',
    spirituality: 'Your spiritual path involves the integration of power and love — the understanding that true spiritual maturity is the ability to be fully powerful and fully tender simultaneously.',
    famousPeople: ['Nelson Mandela', 'Serena Williams', 'Malala Yousafzai'],
  },
  9: {
    name: 'The Hermit', number: 'IX', emoji: '🕯️',
    keywords: ['soul searching', 'introspection', 'inner guidance', 'wisdom', 'solitude'],
    upright: 'The Hermit stands alone on a mountaintop in winter, holding a lantern. He is not lost — he is found. The lantern contains a Star of David: he carries the light of wisdom, earned through long inner search, and now offers it to those who seek him. You are here to find truth and share it.',
    reversed: 'Isolation confused with wisdom. The Hermit reversed asks whether your withdrawal is genuinely restorative or whether it has become avoidance of the very connections that would enrich you.',
    affirmation: 'My inner light guides me and illuminates the path for those who follow. Solitude is sacred, not separate.',
    deepMeaning: "Life Path 9s carry the Hermit's archetype — the wise elder who has lived fully, learned deeply, and now exists to serve others with the accumulated wisdom of that experience. The number 9 contains all other numbers (9+1=10=1, 9+2=11=2, and so on) — it is the number of completion, of universal compassion, of the gift that comes from having truly suffered and truly healed. Your wisdom is not theoretical; it has been earned.",
    love: 'In love, you are selectively but deeply devoted. You need a partner who understands that your solitude is not rejection but renewal. You are one of the wisest partners in any relationship — when you speak about love, listen.',
    career: 'The Hermit thrives in roles involving guidance, research, spiritual teaching, writing, psychology, and philosophy. Anything where depth of understanding is more valued than speed of execution.',
    health: 'Regular solitude is not a luxury for you — it is a biological necessity. Your nervous system requires periods of quiet and withdrawal to function optimally. Protect your alone time as you would any other health practice.',
    spirituality: 'You are one of the most naturally spiritual of all the Life Paths. Your spiritual life is rich, personal, and constantly evolving. You likely have insights that are ahead of collective spiritual understanding.',
    famousPeople: ['Mahatma Gandhi', 'Albert Einstein', 'Jiddu Krishnamurti'],
  },
  11: {
    name: 'Justice', number: 'XI', emoji: '⚖️',
    keywords: ['justice', 'truth', 'cause and effect', 'law', 'clarity'],
    upright: 'Justice holds scales in one hand and a sword in the other — perfect balance between reason and action. This card does not promise fairness; it promises accuracy. Cause and effect operate with mathematical precision. You carry a heightened sensitivity to truth and an inability to pretend otherwise.',
    reversed: 'Dishonesty, either with yourself or others. The Justice reversed asks whether you are applying your considerable capacity for clear seeing to your own life as honestly as you apply it elsewhere.',
    affirmation: 'I stand for truth. My actions align with my deepest values. What I put into the world returns to me.',
    deepMeaning: 'Master Number 11 is the most intuitive number in numerology — the number of the spiritual messenger, the one who sees what others cannot yet see. Justice as a card represents the cosmic law that underlies all apparent randomness. Life Path 11s often feel acutely the gap between how the world is and how it should be. This sensitivity is your gift and sometimes your burden. You are here to be a light — to show others what accuracy, fairness, and genuine truth look like in action.',
    love: 'In love, you need absolute honesty and emotional precision. You are deeply sensitive to imbalance and injustice within relationships. You thrive with a partner who values truth over comfort.',
    career: 'Justice energy thrives in law, mediation, journalism, counselling, spiritual leadership, and any field where precision, truth, and the protection of the vulnerable are core values.',
    health: 'Your health is deeply affected by situations of injustice or dishonesty in your environment. Removing yourself from contexts of chronic dishonesty — at work or at home — may be the most important health intervention available to you.',
    spirituality: 'Your spiritual path involves the integration of cosmic law with human compassion — understanding that the universe operates with perfect justice, even when human perception cannot see it clearly.',
    famousPeople: ['Michelle Obama', 'Leonardo da Vinci', 'Nikola Tesla'],
  },
  22: {
    name: 'The World', number: 'XXI', emoji: '🌍',
    keywords: ['completion', 'integration', 'accomplishment', 'wholeness', 'travel'],
    upright: "The World is the final card of the Major Arcana — the soul's journey completed, the circle closed. But this is not the end; it is the glorious moment before the next beginning. You carry the energy of masterful completion — the capacity to bring ambitious projects, visions, and cycles to their full and magnificent conclusion.",
    reversed: 'Stagnation at the threshold of completion. The World reversed asks why you have not allowed yourself to finish — to claim the victory that is genuinely yours.',
    affirmation: 'I am whole. I complete what I begin. My work in the world is meaningful and lasting.',
    deepMeaning: 'Master Number 22 is the most powerful number in numerology — the Master Builder who turns vision into concrete reality on the largest possible scale. The World card captures this: it shows a figure dancing within a laurel wreath (victory, completion) surrounded by the four fixed signs of the zodiac (Taurus, Leo, Scorpio, Aquarius) — the full spectrum of human experience mastered. Life Path 22s are here to build something that will outlast them. The challenge is that the vision must be worthy of the extraordinary capacity you carry.',
    love: 'In love, you need a partner who can comprehend the scale of your vision and who draws genuine meaning from being part of something larger than the relationship itself. Small-scale love does not sustain you.',
    career: 'The World energy is destined for large-scale impact — founding organisations, leading movements, creating systems that change how many people live. Architecture, international business, humanitarian leadership, and any field requiring the coordination of many elements toward a single magnificent goal.',
    health: 'Your health requires that you feel you are making progress toward something meaningful. Meaningless work is more toxic for your health than almost any other factor. Protect your sense of purpose as zealously as your physical health.',
    spirituality: 'Your spiritual path involves manifestation at the largest scale — the embodiment of spiritual principles in material reality. You are here not to transcend the world but to transform it.',
    famousPeople: ['Elon Musk', 'Marie Curie', 'Michelangelo'],
  },
};

export function getTarotCardByLifePath(lifePathNumber: number): TarotCard {
  if (lifePathNumber === 11) return MAJOR_ARCANA[11];
  if (lifePathNumber === 22) return MAJOR_ARCANA[22];
  if (lifePathNumber === 33) return MAJOR_ARCANA[6];
  return MAJOR_ARCANA[lifePathNumber] || MAJOR_ARCANA[1];
}

export function getTarotCardByNumber(cardNumber: number): TarotCard {
  return MAJOR_ARCANA[cardNumber] || MAJOR_ARCANA[1];
}

export function getAllMajorArcana(): TarotCard[] {
  return Object.values(MAJOR_ARCANA);
}
