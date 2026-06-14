export interface NumerologyPersonData {
  name: string;
  born: string;
  calculation: string;
  result: number;
}

export interface NumerologyNumberData {
  number: number;
  name: string;
  isMasterNumber: boolean;
  masterNumberMeaning?: string;
  color: string;
  hexColor: string;
  planet: string;
  element: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  personality: string;
  inLove: string;
  career: string;
  masteryLesson: string;
  famousPeople: NumerologyPersonData[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

function calcLP(dob: string): string {
  const digits = dob.replace(/\D/g, '');
  let parts: string[] = [];
  let sum = digits.split('').reduce((a, d) => a + parseInt(d), 0);
  const rawSum = sum;

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((a, d) => a + parseInt(d), 0);
  }
  parts.push(`${rawSum}`);
  return parts.join(' → ') + ` → ${sum}`;
}

export const NUMEROLOGY_DATA: NumerologyNumberData[] = [
  {
    number: 1,
    name: 'The Leader',
    isMasterNumber: false,
    color: 'Red',
    hexColor: '#DC2626',
    planet: 'Sun',
    element: 'Fire',
    keywords: ['Leadership', 'Independence', 'Originality', 'Courage', 'Drive'],
    strengths: ['Natural leadership ability', 'Independent thinking', 'Strong determination', 'Original and creative', 'Self-reliant'],
    challenges: ['Can be self-centered', 'Stubbornness', 'Difficulty accepting help', 'Tendency toward arrogance', 'Impatience'],
    personality: 'Life Path 1 individuals are born leaders — independent, pioneering, and driven by a strong desire to forge their own path. In Pythagorean numerology, 1 is the beginning of all things, the number of creation and initiation. People with this life path tend to be original thinkers who prefer doing things their way. They thrive when given autonomy and struggle when micromanaged. Their courage makes them natural entrepreneurs and innovators. The shadow side is a tendency toward self-centeredness — the same independence that drives their success can make them resistant to collaboration. The lesson of Life Path 1 is to lead without dominating: to harness their considerable willpower in service of something larger than individual success. When 1s find that purpose, they become the pioneers others follow.',
    inLove: 'Life Path 1s need a partner who respects their independence and is confident enough to stand on their own. They are attracted to strength and directness. They can struggle with compromise, but when they commit, they commit fully. Best compatibility with 3s (who bring creativity to balance the 1\'s drive) and 5s (whose love of freedom matches the 1\'s need for space).',
    career: 'Natural fit for entrepreneurship, leadership positions, politics, military, and any role requiring initiative and self-direction. 1s excel as founders, CEOs, directors, and independent contractors. They are less suited to roles requiring constant teamwork or subordination.',
    masteryLesson: 'To lead through inspiration rather than force. The fully integrated 1 channels individual will into collective purpose — a pioneer who opens paths for others to follow.',
    famousPeople: [
      { name: 'Steve Jobs', born: 'February 24, 1955', calculation: '0+2+2+4+1+9+5+5 = 28 → 10 → 1', result: 1 },
      { name: 'Martin Luther King Jr.', born: 'January 15, 1929', calculation: '0+1+1+5+1+9+2+9 = 28 → 10 → 1', result: 1 },
      { name: 'Lady Gaga', born: 'March 28, 1986', calculation: '0+3+2+8+1+9+8+6 = 37 → 10 → 1', result: 1 },
      { name: 'Nikola Tesla', born: 'July 10, 1856', calculation: '0+7+1+0+1+8+5+6 = 28 → 10 → 1', result: 1 },
    ],
    seoTitle: 'Life Path Number 1 — The Leader: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 1 — The Leader. Personality, love, career, strengths, challenges, and famous people with verified calculations.',
    seoKeywords: 'life path number 1, numerology 1 meaning, life path 1 personality, numerology leader',
  },
  {
    number: 2,
    name: 'The Peacemaker',
    isMasterNumber: false,
    color: 'Orange',
    hexColor: '#EA580C',
    planet: 'Moon',
    element: 'Water',
    keywords: ['Diplomacy', 'Cooperation', 'Sensitivity', 'Partnership', 'Balance'],
    strengths: ['Exceptional empathy', 'Natural mediator', 'Diplomatic skill', 'Loyalty and devotion', 'Attention to detail'],
    challenges: ['Over-sensitivity', 'Indecisiveness', 'Difficulty with confrontation', 'Dependent tendencies', 'Can absorb others\' emotions'],
    personality: 'Life Path 2 is the number of duality, partnership, and the space between opposing forces. Where 1 acts, 2 relates. Where 1 leads, 2 supports. This is not weakness — it is a different kind of power. Twos are exquisitely sensitive to the emotional environment around them; they pick up on nuances that others miss, and they have a natural gift for finding common ground between conflicting parties. In Pythagorean numerology, 2 represents the Moon — intuitive, reflective, and deeply connected to the rhythms of feeling. The challenge for 2s is avoiding the passivity that sensitivity can become when it isn\'t paired with boundaries. The fully realized 2 is a powerful mediator and connector — someone who creates the conditions for others to thrive.',
    inLove: 'Life Path 2s are devoted, attentive partners who invest deeply in relationships. They need to feel genuinely valued and heard. They can give too much of themselves and may need to learn to assert their own needs. Best compatibility with 8s (who provide the decisive leadership 2 can rely on) and 9s (whose humanitarian values resonate with 2\'s empathy).',
    career: 'Natural fit for counseling, diplomacy, social work, teaching, healthcare, administration, and any collaborative role. 2s excel in supporting roles and partnerships, including as executive assistants, therapists, mediators, and behind-the-scenes strategists.',
    masteryLesson: 'To give without losing self. The integrated 2 offers genuine partnership and empathy from a place of inner security rather than need for approval.',
    famousPeople: [
      { name: 'Barack Obama', born: 'August 4, 1961', calculation: '0+8+0+4+1+9+6+1 = 29 → 11 (Master)', result: 11 },
      { name: 'Ronald Reagan', born: 'February 6, 1911', calculation: '0+2+0+6+1+9+1+1 = 20 → 2', result: 2 },
      { name: 'Jennifer Aniston', born: 'February 11, 1969', calculation: '0+2+1+1+1+9+6+9 = 29 → 11 (Master)', result: 11 },
      { name: 'Diana, Princess of Wales', born: 'July 1, 1961', calculation: '0+7+0+1+1+9+6+1 = 25 → 7', result: 7 },
    ],
    seoTitle: 'Life Path Number 2 — The Peacemaker: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 2 — The Peacemaker. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 2, numerology 2 meaning, life path 2 personality, numerology peacemaker',
  },
  {
    number: 3,
    name: 'The Creator',
    isMasterNumber: false,
    color: 'Yellow',
    hexColor: '#CA8A04',
    planet: 'Jupiter',
    element: 'Fire',
    keywords: ['Creativity', 'Expression', 'Joy', 'Communication', 'Optimism'],
    strengths: ['Naturally creative', 'Excellent communicator', 'Optimism and enthusiasm', 'Magnetic personality', 'Versatility'],
    challenges: ['Scattered energy', 'Superficiality', 'Emotional swings', 'Difficulty with commitment', 'Self-doubt beneath optimism'],
    personality: 'Life Path 3 is the number of creative expression — joy in its most vital, communicative form. Threes have a natural ability to express themselves across multiple channels: language, music, art, performance. They are the storytellers and entertainers, the people who make the world feel more colorful and alive simply by being present in it. In Pythagorean numerology, 3 represents Jupiter\'s expansiveness — big personality, big dreams, big voice. The challenge is that the same creative energy that gives 3s their magnetism can scatter when not directed. Ideas come easily; follow-through is harder. The fully integrated 3 channels creative gifts into sustained, meaningful work — not just performance, but the communication of something true.',
    inLove: 'Life Path 3s are romantic, expressive, and deeply charming. They fall in love with enthusiasm and need a partner who appreciates their need for creative expression and social connection. They can struggle with consistency. Best compatibility with 1s (who provide the steady direction 3 sometimes lacks) and 5s (who match their spontaneity).',
    career: 'Natural fit for writing, performing arts, music, comedy, design, marketing, teaching, and any role involving communication and creativity. 3s excel wherever they can express themselves publicly — authors, musicians, actors, public speakers, journalists.',
    masteryLesson: 'To channel joy into depth. The integrated 3 brings not just sparkle but substance — creative work that actually moves people because it communicates genuine truth.',
    famousPeople: [
      { name: 'John Travolta', born: 'February 18, 1954', calculation: '0+2+1+8+1+9+5+4 = 30 → 3', result: 3 },
      { name: 'David Bowie', born: 'January 8, 1947', calculation: '0+1+0+8+1+9+4+7 = 30 → 3', result: 3 },
      { name: 'Celine Dion', born: 'March 30, 1968', calculation: '0+3+3+0+1+9+6+8 = 30 → 3', result: 3 },
      { name: 'Snoop Dogg', born: 'October 20, 1971', calculation: '1+0+2+0+1+9+7+1 = 21 → 3', result: 3 },
    ],
    seoTitle: 'Life Path Number 3 — The Creator: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 3 — The Creator. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 3, numerology 3 meaning, life path 3 personality, numerology creator',
  },
  {
    number: 4,
    name: 'The Builder',
    isMasterNumber: false,
    color: 'Green',
    hexColor: '#16A34A',
    planet: 'Uranus',
    element: 'Earth',
    keywords: ['Stability', 'Discipline', 'Hard work', 'Practicality', 'Reliability'],
    strengths: ['Exceptional work ethic', 'Highly reliable', 'Systematic thinker', 'Strong foundations', 'Integrity'],
    challenges: ['Rigidity', 'Resistance to change', 'Tendency toward workaholism', 'Difficulty with spontaneity', 'Can be overly cautious'],
    personality: 'Life Path 4 is the builder of the numerological world — steady, disciplined, and committed to creating things that last. Where 3 dreams, 4 constructs. The 4 energy is fundamentally about applying sustained effort to build solid foundations: a business, a family, a body of knowledge, a community institution. In Pythagorean numerology, 4 represents the four elements, the four cardinal directions — the stable structure on which the world rests. The challenge for 4s is that their strength — commitment to order — can become a limitation when life requires flexibility. Fours can mistake their plan for reality and their structure for certainty. The integrated 4 builds not just structures but adaptable systems — things that are solid because they are well-made, not merely because they are rigid.',
    inLove: 'Life Path 4s are loyal, devoted partners who take commitment seriously. They express love through reliability and practical support. They can struggle to express emotion verbally but show it through consistent action. Best compatibility with 2s (whose warmth softens 4\'s practicality) and 8s (who share the drive to build).',
    career: 'Natural fit for architecture, engineering, accounting, finance, law, project management, and any role requiring precision, planning, and execution. 4s excel wherever methodical thinking and reliability are valued — building contractors, surgeons, programmers, military officers.',
    masteryLesson: 'To build with wisdom rather than control. The integrated 4 creates structures that serve others — acknowledging that the best foundations are flexible enough to grow.',
    famousPeople: [
      { name: 'Oprah Winfrey', born: 'January 29, 1954', calculation: '0+1+2+9+1+9+5+4 = 31 → 4', result: 4 },
      { name: 'Clint Eastwood', born: 'May 31, 1930', calculation: '0+5+3+1+1+9+3+0 = 22 (Master)', result: 22 },
      { name: 'Arnold Schwarzenegger', born: 'July 30, 1947', calculation: '0+7+3+0+1+9+4+7 = 31 → 4', result: 4 },
      { name: 'Bill Gates', born: 'October 28, 1955', calculation: '1+0+2+8+1+9+5+5 = 31 → 4', result: 4 },
    ],
    seoTitle: 'Life Path Number 4 — The Builder: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 4 — The Builder. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 4, numerology 4 meaning, life path 4 personality, numerology builder',
  },
  {
    number: 5,
    name: 'The Freedom Seeker',
    isMasterNumber: false,
    color: 'Turquoise',
    hexColor: '#0891B2',
    planet: 'Mercury',
    element: 'Air',
    keywords: ['Freedom', 'Adventure', 'Adaptability', 'Versatility', 'Experience'],
    strengths: ['Highly adaptable', 'Natural adventurer', 'Excellent with people', 'Quick learner', 'Magnetic charisma'],
    challenges: ['Commitment issues', 'Restlessness', 'Risk of addiction or excess', 'Scattered energy', 'Difficulty with routine'],
    personality: 'Life Path 5 is the freest number — curious, adaptable, and forever seeking new experience. Fives are the travelers, the experimenters, the people who need to taste everything life offers before they can truly understand it. In Pythagorean numerology, 5 represents Mercury — quick, versatile, communicative, and always in motion. The 5 energy is at its best when learning something new, meeting someone interesting, or moving through unfamiliar territory. The challenge is that this same love of freedom can become escape: the 5 who never commits, never builds, never goes deep enough to find what they are actually seeking. The integrated 5 uses the experience of many paths to arrive at something genuinely wise — freedom not from responsibility but within it.',
    inLove: 'Life Path 5s are exciting, passionate partners who bring adventure to relationships. They need genuine space and resist feeling caged. They commit when they feel truly free to stay. Best compatibility with 1s (who give them space while having their own direction) and 7s (who are interesting enough to hold the 5\'s attention).',
    career: 'Natural fit for travel, sales, journalism, public relations, entrepreneurship, acting, and any role with variety and human contact. 5s wilt in routine desk jobs and thrive in fields where every day is different — sales reps, journalists, entertainers, guides, startup founders.',
    masteryLesson: 'To experience deeply rather than merely widely. The integrated 5 has the courage to go deep into chosen commitments, finding that true freedom lies in mastery, not just motion.',
    famousPeople: [
      { name: 'Angelina Jolie', born: 'June 4, 1975', calculation: '0+6+0+4+1+9+7+5 = 32 → 5', result: 5 },
      { name: 'Mick Jagger', born: 'July 26, 1943', calculation: '0+7+2+6+1+9+4+3 = 32 → 5', result: 5 },
      { name: 'Abraham Lincoln', born: 'February 12, 1809', calculation: '0+2+1+2+1+8+0+9 = 23 → 5', result: 5 },
      { name: 'Beyoncé', born: 'September 4, 1981', calculation: '0+9+0+4+1+9+8+1 = 32 → 5', result: 5 },
    ],
    seoTitle: 'Life Path Number 5 — The Freedom Seeker: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 5 — The Freedom Seeker. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 5, numerology 5 meaning, life path 5 personality, numerology freedom seeker',
  },
  {
    number: 6,
    name: 'The Nurturer',
    isMasterNumber: false,
    color: 'Pink',
    hexColor: '#DB2777',
    planet: 'Venus',
    element: 'Earth',
    keywords: ['Responsibility', 'Nurturing', 'Harmony', 'Family', 'Service'],
    strengths: ['Deeply caring', 'Natural healer', 'Strong sense of justice', 'Creating beautiful environments', 'Reliable and devoted'],
    challenges: ['Martyrdom tendencies', 'Difficulty setting limits', 'Over-controlling', 'Self-sacrifice to the point of resentment', 'Perfectionism'],
    personality: 'Life Path 6 is the caretaker of humanity — devoted to family, community, and the healing of what is broken. Six is the number of Venus — beauty, love, harmony, and the responsibility that comes with deep caring. People with this life path have a natural pull toward taking care of others: family members, students, clients, communities. They often end up in helping professions not because they chose them analytically but because that\'s where they feel most like themselves. The challenge of the 6 is the shadow of every strength: care becomes control, service becomes martyrdom, responsibility becomes resentment when the 6 forgets that others\' wellbeing is not their burden alone. The integrated 6 gives generously from a full cup — caring that heals rather than depletes.',
    inLove: 'Life Path 6s are deeply devoted, romantic partners who invest everything in the people they love. They create beautiful homes and warm relationships. They can become possessive when anxious. Best compatibility with 2s (who appreciate and reciprocate 6\'s devotion) and 9s (who share the humanitarian heart).',
    career: 'Natural fit for medicine, teaching, counseling, social work, interior design, parenting, hospitality, and any role centered on service and care. 6s thrive in positions where their contribution directly improves others\' lives — doctors, nurses, teachers, social workers, restaurant owners.',
    masteryLesson: 'To serve from strength, not obligation. The integrated 6 discovers that setting healthy limits actually increases capacity for genuine service — that boundaries make better care possible.',
    famousPeople: [
      { name: 'Michael Jackson', born: 'August 29, 1958', calculation: '0+8+2+9+1+9+5+8 = 42 → 6', result: 6 },
      { name: 'John Lennon', born: 'October 9, 1940', calculation: '1+0+0+9+1+9+4+0 = 24 → 6', result: 6 },
      { name: 'Jessica Simpson', born: 'July 10, 1980', calculation: '0+7+1+0+1+9+8+0 = 26 → 8', result: 8 },
      { name: 'Bruce Willis', born: 'March 19, 1955', calculation: '0+3+1+9+1+9+5+5 = 33 (Master)', result: 33 },
    ],
    seoTitle: 'Life Path Number 6 — The Nurturer: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 6 — The Nurturer. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 6, numerology 6 meaning, life path 6 personality, numerology nurturer',
  },
  {
    number: 7,
    name: 'The Seeker',
    isMasterNumber: false,
    color: 'Violet',
    hexColor: '#7C3AED',
    planet: 'Neptune',
    element: 'Water',
    keywords: ['Analysis', 'Introspection', 'Wisdom', 'Spirituality', 'Solitude'],
    strengths: ['Exceptional analytical mind', 'Deep thinker', 'Strong intuition', 'Natural researcher', 'Wisdom and discernment'],
    challenges: ['Isolation', 'Aloofness', 'Difficulty with emotional expression', 'Skepticism that blocks growth', 'Perfectionism'],
    personality: 'Life Path 7 is the philosopher and the mystic — the number that seeks to understand the invisible architecture beneath visible reality. Sevens are the most introspective of all life paths. They need solitude the way others need social interaction. They are at their best when they are investigating something deeply: a scientific question, a spiritual text, a historical mystery, a complex system. In Pythagorean numerology, 7 is the number of divine completion — the seven days of creation, the seven notes of the musical scale, the seven visible planets of the ancient world. The challenge of the 7 is the shadow of deep thought: the tendency to retreat from the imperfect world into the perfect idea of it. The integrated 7 shares their understanding with others — wisdom communicated becomes wisdom fulfilled.',
    inLove: 'Life Path 7s are selective in relationships and need a partner who can match their intellectual depth without demanding constant emotional display. They show love through loyalty and genuine attention. Best compatibility with 4s (who provide grounding structure) and 5s (whose curious minds keep 7 engaged).',
    career: 'Natural fit for scientific research, philosophy, psychology, writing, analysis, technology, and any field requiring deep investigation and expertise. 7s thrive as researchers, analysts, scientists, writers, academics, and strategic consultants.',
    masteryLesson: 'To bring wisdom down to earth. The integrated 7 learns that understanding held privately is incomplete — the true seeker eventually becomes a teacher who shares what they have found.',
    famousPeople: [
      { name: 'Stephen Hawking', born: 'January 8, 1942', calculation: '0+1+0+8+1+9+4+2 = 25 → 7', result: 7 },
      { name: 'Taylor Swift', born: 'December 13, 1989', calculation: '1+2+1+3+1+9+8+9 = 34 → 7', result: 7 },
      { name: 'Keira Knightley', born: 'March 26, 1985', calculation: '0+3+2+6+1+9+8+5 = 34 → 7', result: 7 },
      { name: 'Jerry Seinfeld', born: 'April 29, 1954', calculation: '0+4+2+9+1+9+5+4 = 34 → 7', result: 7 },
    ],
    seoTitle: 'Life Path Number 7 — The Seeker: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 7 — The Seeker and Philosopher. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 7, numerology 7 meaning, life path 7 personality, numerology seeker',
  },
  {
    number: 8,
    name: 'The Powerhouse',
    isMasterNumber: false,
    color: 'Gold',
    hexColor: '#B45309',
    planet: 'Saturn',
    element: 'Earth',
    keywords: ['Power', 'Abundance', 'Achievement', 'Authority', 'Material mastery'],
    strengths: ['Natural executive ability', 'Financial intelligence', 'Strategic thinking', 'Resilience', 'Organizational skill'],
    challenges: ['Materialism', 'Workaholism', 'Control issues', 'Difficulty delegating', 'Can suppress emotions for achievement'],
    personality: 'Life Path 8 is the executive of the numerological world — oriented toward power, achievement, and the material plane of reality. Eights are strategic, decisive, and driven by a deep need to build something significant. In Pythagorean numerology, 8 represents Saturn — discipline, karma, and the law of cause and effect. The 8 understands intuitively that material outcomes are the result of disciplined effort over time. They build businesses, accumulate resources, and exercise authority with a natural confidence that others often find magnetic. The challenge is the shadow of power: the tendency to measure worth in material achievement, to become so focused on the goal that the people and moments along the way are missed. The integrated 8 wields power in service of something meaningful — recognizing that what is built is only as valuable as what it enables.',
    inLove: 'Life Path 8s are devoted, protective partners who express love through provision and security. They can be emotionally reserved and may prioritize work over relationship. Best compatibility with 2s (who provide emotional depth) and 4s (who match the commitment to building something lasting).',
    career: 'Natural fit for business, finance, law, politics, medicine, management, and any field requiring executive decision-making and organizational leadership. 8s thrive as CEOs, investors, attorneys, surgeons, and entrepreneurs in capital-intensive fields.',
    masteryLesson: 'To build not for personal power but for collective good. The integrated 8 uses material mastery as a tool for creating lasting value — understanding that the greatest achievement is what you enable others to do.',
    famousPeople: [
      { name: 'Pablo Picasso', born: 'October 25, 1881', calculation: '1+0+2+5+1+8+8+1 = 26 → 8', result: 8 },
      { name: 'Nelson Mandela', born: 'July 18, 1918', calculation: '0+7+1+8+1+9+1+8 = 35 → 8', result: 8 },
      { name: 'Sandra Bullock', born: 'July 26, 1964', calculation: '0+7+2+6+1+9+6+4 = 35 → 8', result: 8 },
      { name: 'Naomi Campbell', born: 'May 22, 1970', calculation: '0+5+2+2+1+9+7+0 = 26 → 8', result: 8 },
    ],
    seoTitle: 'Life Path Number 8 — The Powerhouse: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 8 — The Powerhouse. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 8, numerology 8 meaning, life path 8 personality, numerology powerhouse',
  },
  {
    number: 9,
    name: 'The Humanitarian',
    isMasterNumber: false,
    color: 'Deep Blue',
    hexColor: '#1E40AF',
    planet: 'Mars',
    element: 'Fire',
    keywords: ['Compassion', 'Humanitarianism', 'Wisdom', 'Completion', 'Service to all'],
    strengths: ['Universal compassion', 'Wisdom born of experience', 'Artistic depth', 'Natural healer and teacher', 'Selflessness'],
    challenges: ['Difficulty letting go', 'Scattered energy across too many causes', 'Emotional detachment as protection', 'Idealism vs. reality', 'Resentment when unappreciated'],
    personality: 'Life Path 9 is the last single-digit life path and carries the cumulative wisdom of 1 through 8. Nine is the number of completion, of universal love, of the humanitarian impulse that sees beyond tribe, nation, and personal interest to the whole of humanity. Nines are old souls — people who seem to have seen more of life than their years account for, who respond to suffering with genuine compassion rather than managed sympathy. In Pythagorean numerology, 9 is the number of Mars and of divine completion — after 9, everything begins again at 1. The 9\'s deepest challenge is attachment: they must learn to give without expecting specific returns and to complete chapters before new ones begin. The integrated 9 gives from abundance, serves from strength, and releases outcomes with genuine grace.',
    inLove: 'Life Path 9s are romantic idealists who love deeply and universally. They can struggle with relationships when real people fail to match their ideal. They need a partner who shares their values. Best compatibility with 3s (who bring joyful creative energy) and 6s (who share the humanitarian heart).',
    career: 'Natural fit for medicine, law, non-profit leadership, ministry, teaching, art, music, and any field involving service to humanity or the expression of universal themes. 9s excel as doctors, lawyers, artists, spiritual teachers, philanthropists, and activists.',
    masteryLesson: 'To serve without martyrdom. The integrated 9 gives in a way that is sustainable — understanding that universal love begins with a healthy relationship to one\'s own life and needs.',
    famousPeople: [
      { name: 'Mahatma Gandhi', born: 'October 2, 1869', calculation: '1+0+0+2+1+8+6+9 = 27 → 9', result: 9 },
      { name: 'Mother Teresa', born: 'August 26, 1910', calculation: '0+8+2+6+1+9+1+0 = 27 → 9', result: 9 },
      { name: 'Morgan Freeman', born: 'June 1, 1937', calculation: '0+6+0+1+1+9+3+7 = 27 → 9', result: 9 },
      { name: 'Jim Carrey', born: 'January 17, 1962', calculation: '0+1+1+7+1+9+6+2 = 27 → 9', result: 9 },
    ],
    seoTitle: 'Life Path Number 9 — The Humanitarian: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Numerology Life Path 9 — The Humanitarian. Personality, love, career, and famous people with verified Life Path calculations.',
    seoKeywords: 'life path number 9, numerology 9 meaning, life path 9 personality, numerology humanitarian',
  },
  {
    number: 11,
    name: 'The Illuminator',
    isMasterNumber: true,
    masterNumberMeaning: 'Master Number 11 carries the sensitivity of 2 elevated to a higher frequency. It is the number of spiritual illumination — the channel between the human and the divine. 11s carry a calling to inspire large numbers of people, often through creative or spiritual gifts, and must balance extraordinary intuitive power with the grounded practicality of 2.',
    color: 'Silver',
    hexColor: '#6B7280',
    planet: 'Moon / Uranus',
    element: 'Air',
    keywords: ['Spiritual illumination', 'Inspiration', 'Vision', 'Intuition', 'Duality'],
    strengths: ['Extraordinary intuition', 'Inspirational presence', 'Deep empathy', 'Visionary thinking', 'Artistic and spiritual gifts'],
    challenges: ['Nervous energy and anxiety', 'The gap between vision and execution', 'Sensitivity that overwhelms', 'Fear of own power', 'Extreme highs and lows'],
    personality: 'Master Number 11 is one of the most powerful — and most demanding — of all life paths. It carries the sensitivity and relational awareness of 2 amplified to a spiritual frequency. Elevens often have a quality of light about them — people are drawn to them without being able to fully explain why. Their intuition borders on the psychic; they pick up on emotional undercurrents, collective moods, and spiritual energies that others miss entirely. The challenge of 11 is that the same sensitivity that makes them inspiring is also a source of profound vulnerability. Elevens can experience anxiety, nervous exhaustion, and a paralyzing gap between the visions they hold and their ability to manifest them in the material world. The integrated 11 learns to ground their spiritual gifts in practical action — to bring light to earth through the specific, embodied work of their chosen field.',
    inLove: 'Life Path 11s are deeply intuitive partners who often know what their partner feels before it is expressed. They need relationships with genuine emotional depth and spiritual compatibility. Best compatibility with 2s (for deep emotional resonance) and 6s (for warmth and devotion).',
    career: 'Natural fit for spiritual leadership, counseling, music, art, writing, teaching, and any field that involves inspiring or healing others. 11s often find their greatest success in creative or humanitarian work where their visionary qualities can be expressed authentically.',
    masteryLesson: 'To illuminate without burning out. The integrated 11 learns to ground spiritual sensitivity in practical discipline — to channel vision through the work of daily life without being consumed by it.',
    famousPeople: [
      { name: 'Barack Obama', born: 'August 4, 1961', calculation: '0+8+0+4+1+9+6+1 = 29 → 11', result: 11 },
      { name: 'Jennifer Aniston', born: 'February 11, 1969', calculation: '0+2+1+1+1+9+6+9 = 29 → 11', result: 11 },
      { name: 'Kobe Bryant', born: 'August 23, 1978', calculation: '0+8+2+3+1+9+7+8 = 38 → 11', result: 11 },
      { name: 'Prince William', born: 'June 21, 1982', calculation: '0+6+2+1+1+9+8+2 = 29 → 11', result: 11 },
    ],
    seoTitle: 'Master Number 11 — The Illuminator: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Master Number 11 — The Illuminator. Spiritual gifts, challenges, personality, and famous people with verified Life Path 11 calculations.',
    seoKeywords: 'master number 11, life path 11, numerology 11 meaning, master number illuminator',
  },
  {
    number: 22,
    name: 'The Master Builder',
    isMasterNumber: true,
    masterNumberMeaning: 'Master Number 22 carries the practical discipline of 4 elevated to a global frequency. Called the "Master Builder," 22 has both the vision of 11 and the practical capacity to manifest it at scale. 22s are born to build institutions, movements, and structures that outlast individual lifetimes.',
    color: 'Gold / White',
    hexColor: '#D97706',
    planet: 'Saturn / Uranus',
    element: 'Earth',
    keywords: ['Manifestation', 'Vision at scale', 'Master builder', 'Practical idealism', 'Legacy'],
    strengths: ['Extraordinary capacity to manifest vision', 'Organizational genius', 'Global thinking', 'Disciplined and reliable', 'Inspires others to build'],
    challenges: ['Overwhelming pressure of potential', 'Fear of failure on a large scale', 'Can suppress sensitivity for achievement', 'Perfectionism', 'Difficulty with vulnerability'],
    personality: 'Master Number 22 is considered the most powerful number in Pythagorean numerology — the "Master Builder." It combines the visionary intuition of 11 with the practical, material focus of 4, creating an individual who is uniquely capable of turning inspired ideas into concrete, lasting structures. Where 11 inspires and 4 builds, 22 builds at a scale that changes the world. The pressure of this potential is real: 22s often feel the weight of what they are capable of, and the gap between their vision and their current reality can be a source of deep frustration. The 22 who operates at their highest vibration works deliberately and patiently, building institutions, organizations, and movements designed to outlast their creator. The integrated 22 builds not monuments to themselves but structures that serve.',
    inLove: 'Life Path 22s are devoted, reliable partners who bring the same dedication to relationships that they bring to their work. They need a partner who understands and supports their larger mission. Best compatibility with 4s (who share the commitment to building) and 8s (who match the drive for significant achievement).',
    career: 'Natural fit for architecture, urban planning, institutional leadership, politics, large-scale entrepreneurship, and any field involving the creation of systems that serve many people. 22s thrive where their capacity for large-scale, long-term thinking can be fully expressed.',
    masteryLesson: 'To build in service. The integrated 22 channels their extraordinary capacity for manifestation into structures that serve collective human wellbeing — recognizing that the most enduring monuments are those that make other people\'s lives better.',
    famousPeople: [
      { name: 'Bill Gates', born: 'October 28, 1955', calculation: '1+0+2+8+1+9+5+5 = 31 → 4 (not 22)', result: 4 },
      { name: 'Clint Eastwood', born: 'May 31, 1930', calculation: '0+5+3+1+1+9+3+0 = 22', result: 22 },
      { name: 'Leonardo da Vinci', born: 'April 15, 1452', calculation: '0+4+1+5+1+4+5+2 = 22', result: 22 },
      { name: 'Paul McCartney', born: 'June 18, 1942', calculation: '0+6+1+8+1+9+4+2 = 31 → 4 (carries 22 energy)', result: 4 },
    ],
    seoTitle: 'Master Number 22 — The Master Builder: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Master Number 22 — The Master Builder. Vision at scale, manifestation, challenges, and famous people with verified Life Path calculations.',
    seoKeywords: 'master number 22, life path 22, numerology 22 meaning, master builder numerology',
  },
  {
    number: 33,
    name: 'The Master Teacher',
    isMasterNumber: true,
    masterNumberMeaning: 'Master Number 33 is the rarest master number — called the "Master Teacher." It combines the nurturing of 6 with the inspiration of 11 and the building capacity of 22. Those with a true 33 life path (not simply a 6 that sums through 33) carry a calling to heal and uplift humanity through compassionate teaching at the highest level.',
    color: 'Golden White',
    hexColor: '#F59E0B',
    planet: 'Venus / Neptune',
    element: 'Fire / Water',
    keywords: ['Compassionate teaching', 'Healing', 'Self-sacrifice', 'Spiritual service', 'Universal love'],
    strengths: ['Extraordinary compassion', 'Healing presence', 'Inspiring teacher', 'Selfless service', 'Connecting the human and divine'],
    challenges: ['Tendency toward martyrdom', 'Overwhelming responsibility', 'Difficulty receiving', 'Emotional absorption of others\' suffering', 'Unrealistic idealism'],
    personality: 'Master Number 33 is the rarest and most demanding of all numerological life paths. It represents the complete integration of the nurturing principle (6) with the master vibrations (11 and 22) — a call to teach, heal, and serve humanity at the highest possible level. True 33s are extraordinarily rare; the number only applies when all digit-sum operations result in 33 before further reduction. 33s often experience their gifts as a weight: they feel the suffering of others acutely, they are drawn toward service in situations that would exhaust most people, and they carry the sense that they are here for a specific purpose that they must find and fulfill. The integrated 33 embodies compassionate teaching without martyrdom — they give from a place of genuine abundance, understanding that the most effective healing comes from the healer who is also whole.',
    inLove: 'Life Path 33s are the most devoted partners in all of numerology — deeply loving, attentive, and oriented toward the wellbeing of those they love. They must ensure that they receive as much care as they give. Best compatibility with 6s (for mutual devotion) and 9s (for shared universal love).',
    career: 'Natural fit for spiritual leadership, medicine, education, the arts, social reform, and any field involving compassionate teaching or healing at scale. 33s are teachers, healers, artists, spiritual leaders, and social reformers — people whose work touches many lives simultaneously.',
    masteryLesson: 'To teach through embodiment. The integrated 33 demonstrates the principles they teach through the quality of their own life — understanding that the most powerful teaching is always how you live.',
    famousPeople: [
      { name: 'Albert Einstein', born: 'March 14, 1879', calculation: '0+3+1+4+1+8+7+9 = 33', result: 33 },
      { name: 'Bruce Willis', born: 'March 19, 1955', calculation: '0+3+1+9+1+9+5+5 = 33', result: 33 },
      { name: 'Stephen King', born: 'September 21, 1947', calculation: '0+9+2+1+1+9+4+7 = 33', result: 33 },
      { name: 'Meryl Streep', born: 'June 22, 1949', calculation: '0+6+2+2+1+9+4+9 = 33', result: 33 },
    ],
    seoTitle: 'Master Number 33 — The Master Teacher: Meaning, Traits & Famous People | BornClock',
    seoDescription: 'Complete guide to Master Number 33 — The rarest life path, the Master Teacher. Compassionate service, healing, challenges, and famous people including Einstein.',
    seoKeywords: 'master number 33, life path 33, numerology 33 meaning, master teacher numerology, Einstein numerology',
  },
];

export function getNumerologyByNumber(n: number): NumerologyNumberData | undefined {
  return NUMEROLOGY_DATA.find(d => d.number === n);
}

export const ALL_LIFE_PATH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
