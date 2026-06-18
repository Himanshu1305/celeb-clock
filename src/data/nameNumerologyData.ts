const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8
};
const VOWELS = new Set(['a','e','i','o','u']);

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

export function calculateAllNameNumbers(fullName: string) {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, '');
  const allSum = letters.split('').reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  const vowelSum = letters.split('').filter(l => VOWELS.has(l)).reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  const consonantSum = letters.split('').filter(l => !VOWELS.has(l)).reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return {
    expression: reduce(allSum),
    soulUrge: reduce(vowelSum),
    personality: reduce(consonantSum),
  };
}

export function getLetterBreakdown(fullName: string): Array<{ letter: string; value: number; isVowel: boolean }> {
  return fullName.toLowerCase().split('').filter(c => /[a-z]/.test(c)).map(l => ({
    letter: l.toUpperCase(),
    value: LETTER_VALUES[l] || 0,
    isVowel: VOWELS.has(l),
  }));
}

export interface NameNumberMeaning {
  title: string;
  expression: string;
  soulUrge: string;
  personality: string;
  bestCareers: string[];
  famousNames: string[];
}

export const NAME_NUMBER_MEANINGS: Record<number, NameNumberMeaning> = {
  1: {
    title: 'The Pioneer',
    expression: "Your name vibrates with the energy of original leadership. You are here to pioneer new paths, to initiate what others only contemplate. Your Expression 1 means your name carries a frequency of independence, courage, and the drive to be first.",
    soulUrge: "Your soul yearns for independence, recognition, and the freedom to follow your own vision without compromise. At your deepest level, you desire to stand alone at the front — not from arrogance but from a genuine inner drive toward self-determination.",
    personality: "You come across as confident, direct, and capable. Others see someone who knows where they're going. Your name's consonants project an aura of authority that often precedes the actual establishment of your position.",
    bestCareers: ['Entrepreneurship', 'Executive leadership', 'Innovation', 'Politics', 'Pioneering research'],
    famousNames: ['Steve Jobs', 'Elon Musk', 'Indira Gandhi'],
  },
  2: {
    title: 'The Diplomat',
    expression: 'Your name vibrates with the energy of cooperation and sensitivity. You are here to bring people together, to sense what others miss, and to create harmony where there was discord. Your Expression 2 gives your name a frequency of empathy, partnership, and intuitive intelligence.',
    soulUrge: 'Your soul yearns for genuine connection, peace, and the feeling of being truly understood. You desire partnership at the deepest level — not dependency, but the profound satisfaction of two people meeting authentically.',
    personality: 'You come across as gentle, approachable, and deeply caring. Others sense that you will listen without judgment. Your name projects an energy of safety that makes people want to confide in you.',
    bestCareers: ['Counselling', 'Diplomacy', 'Teaching', 'Healing', 'Human resources', 'Partnership-based businesses'],
    famousNames: ['Barack Obama', 'Diana (Princess)', 'Bill Clinton'],
  },
  3: {
    title: 'The Creator',
    expression: 'Your name vibrates with creative expression, joy, and the gift of communication. You are here to express, to inspire, and to make the world more beautiful and meaningful through your creative contribution.',
    soulUrge: 'Your soul yearns for creative self-expression and the freedom to share your inner world with others. You desire to be heard, to create, and to bring joy to those around you through your unique perspective.',
    personality: 'You come across as charismatic, expressive, and uplifting. Others sense your creative energy and find themselves energised by your presence. Your name projects warmth and the promise of something interesting.',
    bestCareers: ['Writing', 'Performing arts', 'Design', 'Teaching', 'Marketing', 'Coaching', 'Any creative field'],
    famousNames: ['Beyoncé', 'Walt Disney', 'Rabindranath Tagore'],
  },
  4: {
    title: 'The Builder',
    expression: 'Your name vibrates with the energy of structure, discipline, and lasting achievement. You are here to build — businesses, families, systems, knowledge — and to do so with the patient craftsmanship that creates things that endure.',
    soulUrge: 'Your soul yearns for security, order, and the satisfaction of work done well. You desire to create something lasting — a foundation that will serve not just you but those who come after you.',
    personality: 'You come across as reliable, methodical, and trustworthy. Others sense that your word means something, that you will do what you say. Your name projects stability and competence.',
    bestCareers: ['Engineering', 'Architecture', 'Finance', 'Project management', 'Law', 'Medicine', 'Systems design'],
    famousNames: ['Warren Buffett', 'Angela Merkel', 'Narendra Modi'],
  },
  5: {
    title: 'The Freedom Seeker',
    expression: 'Your name vibrates with freedom, versatility, and the love of experience. You are here to taste life fully, to adapt with extraordinary flexibility, and to show others how to embrace change rather than resist it.',
    soulUrge: 'Your soul yearns for freedom above all — freedom of movement, thought, experience, and expression. You desire a life that never becomes a cage, where possibility always remains open.',
    personality: "You come across as dynamic, adventurous, and interesting. Others sense that you've lived and that there is always more to you than first appears. Your name projects an energy of aliveness that draws people in.",
    bestCareers: ['Travel', 'Media', 'Sales', 'Entrepreneurship', 'Adventure tourism', 'Foreign affairs', 'Any fast-moving field'],
    famousNames: ['Mick Jagger', 'Angelina Jolie', 'Abraham Lincoln'],
  },
  6: {
    title: 'The Nurturer',
    expression: 'Your name vibrates with responsibility, love, and service. You are here to care for others — family, community, students, clients — and you do it with a warmth and devotion that creates genuine healing.',
    soulUrge: 'Your soul yearns to love and be loved, to create beauty, and to feel genuinely needed by those you care for. You desire deep, committed relationships where your gift of care is received and returned.',
    personality: 'You come across as warm, responsible, and genuinely interested in others. People sense that you actually care — not as performance but as a fundamental orientation. Your name projects a quality of safe, nurturing warmth.',
    bestCareers: ['Healthcare', 'Education', 'Social work', 'Counselling', 'Arts', 'Hospitality', 'Family law'],
    famousNames: ['Mother Teresa', 'John Lennon', 'Princess Diana'],
  },
  7: {
    title: 'The Seeker',
    expression: 'Your name vibrates with wisdom, analysis, and the search for deeper truth. You are here to investigate, to understand, and to bring rare insight to the questions that matter most.',
    soulUrge: 'Your soul yearns for truth, understanding, and solitude in which to think deeply. You desire wisdom — not information, but genuine understanding that comes from sustained, rigorous inquiry.',
    personality: 'You come across as intelligent, private, and somewhat mysterious. Others sense depths they cannot quite access. Your name projects a quality of quiet authority — someone who thinks before speaking and means what they say.',
    bestCareers: ['Research', 'Science', 'Philosophy', 'Writing', 'Psychology', 'Spiritual teaching', 'Analysis'],
    famousNames: ['Albert Einstein', 'Nikola Tesla', 'Marie Curie'],
  },
  8: {
    title: 'The Powerhouse',
    expression: 'Your name vibrates with ambition, authority, and the capacity for material achievement. You are here to master the material world and to use that mastery with wisdom and purpose.',
    soulUrge: 'Your soul yearns for achievement, recognition, and the satisfaction of genuine power earned through effort and excellence. You desire to build something that demonstrates the full extent of your capacity.',
    personality: 'You come across as capable, authoritative, and someone to be reckoned with. Others sense your ambition and tend to respond either with respect or competitive wariness. Your name projects an energy of someone who gets things done.',
    bestCareers: ['Business', 'Finance', 'Law', 'Executive leadership', 'Real estate', 'Medicine', 'Politics'],
    famousNames: ['Mukesh Ambani', 'Serena Williams', 'Pablo Picasso'],
  },
  9: {
    title: 'The Humanitarian',
    expression: 'Your name vibrates with compassion, completion, and universal love. You are here to serve something larger than yourself — a cause, a community, a global vision.',
    soulUrge: 'Your soul yearns to give — to contribute to the wellbeing of many, to leave the world better than you found it. You desire meaningful work that serves a purpose larger than personal success.',
    personality: 'You come across as compassionate, wise, and oriented toward something beyond the immediate. Others sense that you care about more than yourself and are drawn to that quality.',
    bestCareers: ['Humanitarian work', 'Healing arts', 'Teaching', 'Arts', 'Activism', 'International work', 'Spiritual leadership'],
    famousNames: ['Mahatma Gandhi', 'Mother Teresa', 'Nelson Mandela'],
  },
  11: {
    title: 'The Inspirational Messenger',
    expression: 'Your name carries master number energy — heightened sensitivity, extraordinary intuition, and the potential to inspire on a scale that ordinary numbers cannot reach.',
    soulUrge: 'Your soul yearns to illuminate — to bring light to what was dark, to inspire what was dormant, to show what is possible. You desire to be a genuine channel for something beyond your personal self.',
    personality: 'You come across as unusually perceptive and somewhat otherworldly. Others sense that you see what they cannot and often seek your insight instinctively.',
    bestCareers: ['Spiritual leadership', 'Counselling', 'Healing', 'Arts', 'Visionary entrepreneurship', 'Psychology'],
    famousNames: ['Nikola Tesla', 'Jacinda Ardern', 'Barack Obama'],
  },
  22: {
    title: 'The Master Builder',
    expression: 'Your name carries the most powerful master number energy — the capacity to turn the largest visions into concrete reality that serves many.',
    soulUrge: 'Your soul yearns to build something that matters on the largest scale — an organisation, a movement, a body of work that outlasts you.',
    personality: 'You come across as unusually capable and far-seeing. Others sense that you are operating at a level they cannot quite access.',
    bestCareers: ['Large-scale project leadership', 'International business', 'Humanitarian organisations', 'Architecture', 'Global initiatives'],
    famousNames: ['Elon Musk', 'Bill Gates', 'Michelangelo'],
  },
  33: {
    title: 'The Master Teacher',
    expression: 'Your name carries the rarest master number — unconditional love, healing, and the capacity to teach through the quality of your being rather than just your words.',
    soulUrge: 'Your soul yearns to love and heal without condition — to be a genuine embodiment of compassion in action.',
    personality: 'You come across as unusually compassionate and spiritually mature. Others sense a quality of genuine wisdom earned through depth of experience.',
    bestCareers: ['Spiritual teaching', 'Healing arts', 'Counselling', 'Humanitarian leadership', 'Arts'],
    famousNames: ['Dalai Lama', 'Rumi', 'Francis of Assisi'],
  },
};
