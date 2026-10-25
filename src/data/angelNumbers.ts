/**
 * Angel numbers — one entry per page at /angel-numbers/:number (Batch 7, W6).
 *
 * WHAT THIS IS: a modern popular spiritual belief, not numerology from a birth date,
 * not astronomy and not a prediction. Every meaning below is a PARAPHRASE of what the
 * popular sources say (opened with WebFetch on 25 Oct 2026 — URLs in SOURCES and each
 * entry's `sources`). Nothing here is BornClock's own claim about the future; the page
 * wraps every section in "in popular belief" framing. No statistics are given anywhere.
 *
 * Background facts (hub + FAQ) and where they come from:
 *  - Term defined by Doreen Virtue & Lynnette Brown, "Angel Numbers" (Hay House, 2005);
 *    Virtue's "Angel Numbers 101" (Hay House, 2008); she was baptised in Feb 2017 and
 *    later that year announced she had renounced New Age beliefs; in a 2024 interview
 *    with The Cut she said of angel numbers "I regret it".
 *    — en.wikipedia.org/wiki/Angel_number, en.wikipedia.org/wiki/Doreen_Virtue
 *  - Frequency illusion (Baader–Meinhof): noticing something more often after first
 *    becoming aware of it; selective attention + confirmation bias (Arnold Zwicky, 2005).
 *    — en.wikipedia.org/wiki/Frequency_illusion
 *  - Apophenia: perceiving meaningful connections between unrelated things (Klaus
 *    Conrad, 1958). — en.wikipedia.org/wiki/Apophenia
 *  - 11:11 wish: exact origin unknown; popularised in part by Solara Antara Amaa-Ra
 *    (Star-Borne Unlimited, founded 1986). — mentalfloss.com/random-facts/meaning-of-angel-number-1111
 *
 * Numerology on these pages is COMPUTED, never written by hand: the digit sum and its
 * reduction use the one sitewide function (reduceKeepingMaster in src/lib/lifePath.ts),
 * and the Life Path checker uses lifePathWorking from the same module.
 */
import seo from './angelNumbersSeo.json';
import { digitSum, reduceKeepingMaster, MASTER_NUMBERS } from '@/lib/lifePath';
import { getNumerologyByNumber } from './numerologyData';

export interface AngelSource { label: string; url: string }

/** The popular sources we paraphrase (all opened with WebFetch, 25 Oct 2026). */
export const SOURCES = {
  today: { label: 'TODAY — A guide to angel numbers and their meanings', url: 'https://www.today.com/today/amp/rcna32058' },
  rd: { label: "Reader's Digest — What do angel numbers mean?", url: 'https://www.rd.com/?p=1792047' },
  cosmoGuide: { label: 'Cosmopolitan — Your full guide to angel numbers', url: 'https://www.aol.com/lifestyle/everything-know-angel-numbers-144700592.html' },
  cosmo111: { label: 'Cosmopolitan — Angel number 111', url: 'https://www.aol.com/articles/angel-number-111-yes-different-174100449.html' },
  cosmo333: { label: 'Cosmopolitan — Angel number 333', url: 'https://www.aol.com/lifestyle/lets-talk-angel-number-333-214200914.html' },
  cosmo666: { label: 'Cosmopolitan — Angel number 666', url: 'https://www.aol.com/articles/let-talk-angel-number-666-213500552.html' },
  cosmo888: { label: 'Cosmopolitan — Angel number 888', url: 'https://www.aol.com/lets-talk-angel-number-888-201800946.html' },
  wh2222: { label: "Women's Health — Angel number 2222", url: 'https://www.aol.com/keep-seeing-number-2222-youre-123000033.html' },
  bustle111: { label: 'Bustle — 111 angel number meaning', url: 'https://www.bustle.com/life/111-angel-number-spiritual-meaning' },
  bustle222: { label: 'Bustle — 222 angel number meaning', url: 'https://www.bustle.com/life/222-angel-number-spiritual-meaning' },
  bustle444: { label: 'Bustle — 444 angel number meaning', url: 'https://www.bustle.com/life/444-angel-number-spiritual-meaning' },
  bustle555: { label: 'Bustle — 555 angel number meaning', url: 'https://www.bustle.com/life/555-angel-number-spiritual-meaning' },
  bustle777: { label: 'Bustle — 777 angel number meaning', url: 'https://www.bustle.com/life/777-angel-number-spiritual-meaning' },
  bustle999: { label: 'Bustle — 999 angel number meaning', url: 'https://www.bustle.com/life/999-angel-number-spiritual-meaning' },
  bustle1010: { label: 'Bustle — 1010 angel number meaning', url: 'https://www.bustle.com/life/angel-number-1010-meaning' },
  bustle1111: { label: 'Bustle — The spiritual meaning of 11:11', url: 'https://www.bustle.com/life/spiritual-meaning-11-11-numerologists' },
  bustle1212: { label: 'Bustle — 1212 angel number meaning', url: 'https://www.bustle.com/life/1212-angel-number-meaning' },
  mbg1010: { label: 'mindbodygreen — 1010 angel number', url: 'https://www.mindbodygreen.com/articles/1010-angel-number' },
  astro000: { label: 'Astrology.com — 000 angel number meaning', url: 'https://www.astrology.com/numerology/angel-numbers/000-meaning' },
  astro999: { label: 'Astrology.com — 999 angel number meaning', url: 'https://www.astrology.com/numerology/angel-numbers/999-meaning' },
  astro1111: { label: 'Astrology.com — 1111 angel number meaning', url: 'https://www.astrology.com/numerology/angel-numbers/1111-meaning' },
  astro1234: { label: 'Astrology.com — 1234 angel number meaning', url: 'https://www.astrology.com/numerology/angel-numbers/1234-meaning' },
  marriageTf: { label: 'Marriage.com — Twin flame numbers explained', url: 'https://www.marriage.com/advice/relationship/twin-flame-numbers-explained/' },
  newsweek222: { label: 'Newsweek — What 222 means for your love life', url: 'https://newsweek.com/what-does-soul-mate-number-222-mean-love-life-1705160' },
  mentalFloss1111: { label: 'Mental Floss — The meaning of 1111', url: 'https://www.mentalfloss.com/random-facts/meaning-of-angel-number-1111' },
} satisfies Record<string, AngelSource>;

export interface AngelNumber {
  sequence: string;
  /** Short theme label, e.g. "New beginnings". */
  theme: string;
  /** 2–3 sentence direct answer shown first (answer-first layout). */
  answer: string;
  /** "What people believe it means" — a paraphrase of the sources. */
  meaning: string;
  love: string;
  career: string;
  twinFlame: string;
  /** Practical, calm suggestions — reflection, not ritual. */
  whatToDo: string[];
  /** One fact or angle only this page has (e.g. the 11:11 wish, 666's reputation). */
  extra?: { heading: string; text: string };
  related: string[];
  sources: AngelSource[];
}

const S = SOURCES;

export const ANGEL_NUMBERS: AngelNumber[] = [
  {
    sequence: '000',
    theme: 'A clean slate',
    answer: 'In popular angel-number belief, 000 stands for a clean slate — a fresh start and open-ended possibility, like a blank canvas. Believers read it as a moment to pause and choose a direction, not as a forecast of what will happen.',
    meaning: 'Writers on angel numbers describe 000 as a sign of new beginnings and wholeness. Zero is linked with infinity and wholeness — the sense that everything is still possible. One spiritual writer adds that a pause before a change is perfectly fine — 000 does not ask you to rush.',
    love: 'Read in love, 000 is said to be about unconditional love and seeing your partner\'s worth — good communication and a sense of being on the same side. For someone single, it is read as room to start fresh without carrying old patterns.',
    career: 'For work, popular sources link 000 with opportunity and with using your talents in work that fits your purpose. It is usually read as "you can begin again", not as a promise of a particular job or income.',
    twinFlame: 'In twin-flame belief (the idea that two souls are mirror halves of one another), 000 is described as an awakening and a coming-together of "masculine and feminine" energies — with the emphasis on self-love and feeling whole on your own first.',
    whatToDo: [
      'Pause before a big decision — sources stress that a pause before change is fine.',
      'Write down one thing you would start if you could begin from zero.',
      'Notice what you were thinking about when you saw 000; that is usually the "fresh start" people connect it with.',
    ],
    extra: { heading: 'Why zero is different', text: 'Zero is not one of the numerology Life Path numbers (1–9, 11, 22, 33), so 000 has no matching Life Path page. That is one reason believers treat it as a "reset" rather than a theme.' },
    related: ['111', '1010', '999'],
    sources: [S.today, S.rd, S.astro000, S.cosmoGuide],
  },
  {
    sequence: '111',
    theme: 'New beginnings',
    answer: 'In popular belief, 111 is a "new beginnings" number: a nudge to notice your thoughts and take the first step on something you have been putting off. It is usually read as a process that is still unfolding — 1111 is seen as the "it\'s here" version.',
    meaning: 'In numerology the number one stands for beginnings, independence and initiative, and repeating it is said to amplify that — so 111 is read as a fresh chapter or a new mindset. Writers describe it as a sign that things are coming into alignment and that you are heading in the right direction.',
    love: 'In love, 111 is read as a cue to take the initiative — asking someone out, or speaking up for what you need in a relationship. Some writers connect it with a new relationship beginning, and advise acting with integrity and trusting the timing.',
    career: 'For work, popular guides read 111 as a good moment to begin: applying for a role you want, asking about a promotion or starting a side project. On money, one guide frames it as investing — including in yourself, for example by learning a new skill.',
    twinFlame: 'In twin-flame belief, 111 is described as reassurance that the connection is supported, or as the start of a new phase. If the two people are apart, the reading is to focus on personal growth.',
    whatToDo: [
      'Make the decision you have been circling — one numerologist quoted by Bustle reads 111 as "make a decision".',
      'Check that your priorities still match your goals.',
      'Take one small first step today rather than waiting for a perfect moment.',
    ],
    extra: { heading: '111 vs 1111', text: 'Cosmopolitan\'s guide separates the two by their digit sums: 111 adds up to 3 (growth and change — "it\'s on the way"), while 1111 adds up to 4 (stability — "it\'s here").' },
    related: ['1111', '1010', '000'],
    sources: [S.bustle111, S.cosmo111, S.cosmoGuide, S.today],
  },
  {
    sequence: '222',
    theme: 'Balance & partnership',
    answer: 'In popular belief, 222 is the balance-and-partnership number: a cue to restore equilibrium, be patient and work with others. Many writers call it the "soul mate" number — but that is a belief about meaning, not a forecast about your love life.',
    meaning: 'The number two is linked with the balance between opposites and with cooperation, so 222 is read as a sign to find your equilibrium again. Writers also describe it as hope, harmony and trust that things are unfolding, and — because 2 + 2 + 2 = 6 — some connect it with home, family and caring for others.',
    love: '222 appears so often in love readings that it is nicknamed the "soul mate" number. The common reading is cooperation, balance and diplomacy: appreciate a loyal partner, work through problems together if you both want to, and for someone single, stay open to the right person.',
    career: 'At work, 222 is read as collaboration — a project that goes better with another person. One numerologist ties it to steady dedication toward goals. On money, the same source\'s reading is cautious: avoid impulse purchases and keep to a budget.',
    twinFlame: 'In twin-flame belief, 222 is described as "the gentle balance" — a number that turns up when the connection is in a quiet phase and needs patience and grounding rather than pushing.',
    whatToDo: [
      'Re-set one boundary that has slipped, so your energy is back in balance.',
      'Be the peacemaker: take the first step to mend a strained relationship.',
      'Move "slow and steady" toward a goal rather than forcing it.',
    ],
    related: ['2222', '1212', '444'],
    sources: [S.bustle222, S.newsweek222, S.rd, S.today, S.marriageTf],
  },
  {
    sequence: '333',
    theme: 'Creativity & support',
    answer: 'In popular belief, 333 is about creativity, self-expression and feeling supported. It is read as a nudge to stop overthinking and express yourself — and, as one numerology writer quoted by TODAY puts it, "The only thing that luck can build on is action."',
    meaning: 'The number three is linked with creativity, communication, curiosity and optimism, and 333 triples it. Writers describe it as a joyful sign tied to creativity and growth, to intuition, and to taking charge of how you express yourself.',
    love: 'In love, 333 is read as a reminder to relax and trust how things unfold, with an emphasis on socialising and being open to new connections. Some readers connect it with good news in a relationship.',
    career: 'For work, 333 is read as progress toward goals when you use your creativity and intuition and are not afraid of hard work — letting your passion show in projects, at work or outside it.',
    twinFlame: 'In twin-flame belief, 333 is described as "the presence of support": both people are said to be guided, and it is read as a time to lean on each other.',
    whatToDo: [
      'Pause and notice what you were thinking or feeling when you saw 333.',
      'Start — or finish — one creative thing: a sketch, a post, a recipe, a plan.',
      'Say the thing you have been holding back, kindly and clearly.',
    ],
    related: ['111', '777', '1234'],
    sources: [S.cosmo333, S.today, S.rd, S.cosmoGuide, S.marriageTf],
  },
  {
    sequence: '444',
    theme: 'Stability & foundations',
    answer: 'In popular belief, 444 is the stability number — a reassurance that you are safe, and a cue that steady work on your foundations (home, routine, money, health habits) is the right focus now. It is read as encouragement for patient, practical effort — not as a sign that something is about to happen.',
    meaning: 'In numerology four stands for stability, practicality and hard work — "the practical planner", as one master numerologist puts it. Writers read 444 as building something solid, attention to home and family, gratitude, and a reminder that you are protected and supported.',
    love: 'In love, 444 is read as security: working together on a solid foundation for the future, perhaps a sign to commit more deeply. For someone single, it is read as looking for a steady, reliable partner.',
    career: 'For work, a spiritual teacher quoted by Bustle reads 444 as "something steady and long-lasting" on its way — a fit for anyone hoping for stable work rather than a quick win.',
    twinFlame: 'In twin-flame belief, 444 alone is not treated as proof of a twin flame. It is described as "the emotional foundation" — a time for self-care and rebuilding, which may or may not mean reunion — and one medium stresses that shared goals matter most.',
    whatToDo: [
      'Build a simple daily routine: movement, regular meals and good sleep.',
      'If life has been hectic, stay put and get grounded for a while.',
      'Say no to one commitment that is stretching you too thin.',
    ],
    related: ['1234', '222', '888'],
    sources: [S.bustle444, S.today, S.rd, S.cosmoGuide, S.marriageTf],
  },
  {
    sequence: '555',
    theme: 'Change & transition',
    answer: 'In popular belief, 555 is the change number: it is read as a sign that a shift you may have felt building is arriving, and that change can lead to growth. It is not a warning of anything bad — writers stress that change does not mean things are getting worse.',
    meaning: 'Five stands for freedom, independence and self-sufficiency, so 555 is read as a transition — freeing yourself from fears and moving into something new. Writers note these changes can feel sudden, but are usually described as positive in the end.',
    love: 'In love, 555 is read as a relationship changing shape — for example moving from casual to committed, or two partners growing together. If a relationship is struggling, one spiritual coach suggests talking to a counsellor; another reading is that it can be time to part kindly if something has run its course.',
    career: 'At work, 555 is read as a role or plan changing — sometimes stepping away from a job with poor work–life balance. A transformation coach quoted by Bustle frames it as "bigger and better opportunities" ahead.',
    twinFlame: 'Many believers link 555 with twin flames: it is described as "the turning point" in a connection, or as a sign that you are growing into the person you need to be before meeting someone important.',
    whatToDo: [
      'Practise non-attachment: stay open and let go of forcing one outcome.',
      'Journal about the change you sense coming and what you want from it.',
      'Talk it through with a friend or partner — change is easier shared.',
    ],
    related: ['999', '1010', '111'],
    sources: [S.bustle555, S.today, S.rd, S.cosmoGuide, S.marriageTf],
  },
  {
    sequence: '666',
    theme: 'Refocus & rebalance',
    answer: 'In angel-number belief, 666 is not an evil or unlucky sign. It is read as a gentle prompt to refocus — to stop over-worrying about small or material things and come back to balance, self-care and what actually matters to you.',
    meaning: 'Despite the number\'s stigma in Western culture, writers on angel numbers describe 666 as "an encouragement to refocus" — a nudge of redirection. It is linked with compassion and self-love, with inner focus and clarity of purpose, and with the steady consistency of the number six.',
    love: 'In love, 666 is read as a sign not to get lost in romantic fantasy or drama, and to put in steady, everyday care instead of fixating on the past or future. One numerology writer turns it inward: how kind is your relationship with yourself?',
    career: 'For work, 666 is read as "back to basics": remember your goals and the skills that make you good at what you do, and stop comparing yourself with others or spiralling about money.',
    twinFlame: 'In twin-flame belief, 666 is read as a sign it may be time to take some space — slow down and look at the foundation of the connection, because outside distractions may be pulling you both off course.',
    whatToDo: [
      'Slow down and look at where your time and energy are really going.',
      'List three things you value and appreciate right now.',
      'Let go of one worry you cannot control, and rest.',
    ],
    extra: { heading: 'Why 666 is read differently here', text: 'Outside angel-number belief, 666 carries a heavy cultural reputation. Within angel-number writing it is deliberately read in a calm, practical way — a redirection, not a threat. BornClock follows that framing and never treats any number as a bad omen.' },
    related: ['222', '999', '888'],
    sources: [S.cosmo666, S.today, S.rd, S.cosmoGuide],
  },
  {
    sequence: '777',
    theme: 'Luck & reflection',
    answer: 'In popular belief, 777 is a lucky and deeply spiritual number. Unlike many angel numbers that ask you to act, it is read as a signal to pause, reflect and trust your inner voice.',
    meaning: 'Seven is linked with spiritual wisdom, so tripling it is read as a strong spiritual message — sometimes described as the most "mystical" angel number. Writers connect it with luck and good fortune, with saying yes to things just outside your comfort zone, and with spiritual awakening.',
    love: 'An astrologer quoted by Bustle links 777 to Libra, the seventh zodiac sign, and so to partnership. It is read as a hopeful sign for anyone looking for love, and as a prompt to ask whether a person supports your growth.',
    career: 'For work, 777 is read as a chance to slow down and check whether your job nourishes you, not just pays you. Popular writing links it with good fortune and prosperity — a hope, not a guarantee.',
    twinFlame: 'In twin-flame belief, seven is tied to karma, so 777 is read as a cue to revisit a lesson in a relationship cycle — for example, noticing if you keep returning to the same kind of situation.',
    whatToDo: [
      'Turn inward before searching online: journal or sit quietly with the question.',
      'Say yes to one small thing just outside your comfort zone.',
      'Notice a pattern you keep repeating — such as going back to an ex — and choose differently.',
    ],
    related: ['333', '111', '999'],
    sources: [S.bustle777, S.today, S.rd, S.cosmoGuide],
  },
  {
    sequence: '888',
    theme: 'Abundance & reward',
    answer: 'In popular belief, 888 is the abundance number — linked with money, reward for effort and the endless loop of the figure 8. Believers read it as encouragement that effort is paying off, while the sources themselves note the hard work still has to be done.',
    meaning: 'Eight is linked with business sense, power and wealth, so 888 is read as a "harvest" — a sign that work you have put in is coming back to you. Writers also connect it with intuition and good fortune, and with making room for abundance rather than clinging to it.',
    love: 'In love, 888 is read as attracting a healthy, respectful relationship — Cosmopolitan\'s guide calls it a "power couple" number for people already together.',
    career: 'For work and money, 888 is read as growing influence and a cue to be more confident about your goals. Popular guides frame it as a time to share or invest money rather than hoard it. A number is not financial advice — any money decision should rest on your own figures, not on a sign.',
    twinFlame: 'In twin-flame belief, 888 is tied to the infinity symbol and read as coming closer to union — with the advice to focus first on inner balance, self-acceptance and healing.',
    whatToDo: [
      'Share some of what you have — time, help or money — with someone else.',
      'Help a colleague or friend succeed.',
      'Balance material goals with what feeds you in other ways.',
    ],
    related: ['444', '2222', '777'],
    sources: [S.cosmo888, S.today, S.rd, S.cosmoGuide],
  },
  {
    sequence: '999',
    theme: 'Completion & release',
    answer: 'In popular belief, 999 marks completion — the end of a chapter and the space that opens for the next one. It is read as a cue to let go of what is finished, not as a sign of loss.',
    meaning: 'Nine is the last single-digit number, so it stands for a full cycle — "a full cycle of experience that teaches us to go beyond ourselves", in one master numerologist\'s words. Writers read 999 as endings and transitions, healing as a chapter closes, and turning negativity into positivity.',
    love: 'In love, 999 is read as the close of a pattern — sometimes an old habit, sometimes a relationship that has run its course. For someone single, it is read as letting go of limiting beliefs about love, and the ideal is described as a bond free of unhealthy attachment.',
    career: 'For work, 999 is read as a shift — for example leaving a role that no longer fits, or starting something that matches your purpose better.',
    twinFlame: 'In twin-flame belief, 999 is described as the end of a major cycle in the connection, after which a deeper phase can begin.',
    whatToDo: [
      'Release one old resentment or piece of emotional baggage.',
      'Give something back: volunteer or support a cause you care about.',
      'Trust that endings make room for new growth.',
    ],
    related: ['000', '555', '111'],
    sources: [S.bustle999, S.astro999, S.today, S.rd, S.cosmoGuide],
  },
  {
    sequence: '1010',
    theme: 'Attitude check & fresh start',
    answer: 'In popular belief, 1010 is an "attitude check" and a fresh-start number: a cue to clear your thinking, back yourself and step through a new door. It pairs 1 (beginnings) with 0 (open potential), twice over.',
    meaning: 'One master numerologist calls ten "the number of perfection — it combines the unity of 1 with the all-encompassing, never-ending zero". Writers read 1010 as a crossroads where a clear decision sets a new path, and as a reminder to be deliberate about what you are trying to create.',
    love: 'For someone single, a medium quoted by mindbodygreen suggests changing your approach — saying yes to an introduction or an event you have been avoiding. For couples, it is read as a cue to reconnect: gratitude, a planned evening together. Bustle adds: keep your own sense of self.',
    career: 'Most guides keep 1010 general rather than career-specific. The nearest work reading is to take charge of your next step and act on opportunities rather than wait for them.',
    twinFlame: 'In twin-flame belief, 1010 is described as speeding up personal growth within the connection — with the practical advice of "keeping one foot on the ground".',
    whatToDo: [
      'Notice one negative thought or limiting belief about your goal, and question it.',
      'Watch for a habit of self-sabotage and interrupt it once this week.',
      'Note what you were doing when you saw 1010 — that context is what believers say shapes its meaning.',
    ],
    related: ['111', '000', '1111'],
    sources: [S.mbg1010, S.bustle1010, S.cosmoGuide, S.rd],
  },
  {
    sequence: '1111',
    theme: 'Alignment & intention',
    answer: '1111 — often seen as 11:11 on a clock — is the best-known angel number. In popular belief it signals alignment and a new beginning: that you are on the right path, and that this is a moment to set a clear intention. Many people make a wish at 11:11.',
    meaning: 'Writers describe 1111 as new beginnings, potential and the start of a new era, and as a sign that you are protected and on the right path. Because 11 is a numerology master number, the doubled 11 is read as growth and spiritual awakening. Cosmopolitan\'s guide reads it as confirmation — a celebration that something has arrived.',
    love: 'In love, 1111 is read as staying hopeful and believing you deserve love; aligning your mindset is said to attract a partner on the same wavelength.',
    career: 'For work, Astrology.com calls the person seeing 1111 "a powerful creator" — the reading is to stay focused on your goals and act on inspiration when it comes.',
    twinFlame: 'In twin-flame belief, 1111 is "the awakening" — the start of a connection or a deep inner change. Some sites go further and call a reunion near; we treat that as hope, not a forecast.',
    whatToDo: [
      'Set one clear intention and write it down.',
      'Jot down ideas that come to you — believers say 11:11 is a good moment to notice them.',
      'Start something new you have been meaning to try.',
    ],
    extra: { heading: 'Where the 11:11 wish comes from', text: 'Mental Floss notes that the exact origin of wishing at 11:11 is not known; it was popularised in part by the New Age writer Solara Antara Amaa-Ra, who founded a group called Star-Borne Unlimited in 1986 — years before the term "angel numbers" appeared. It is also an easy time to notice on any digital clock.' },
    related: ['111', '1212', '1010'],
    sources: [S.mentalFloss1111, S.astro1111, S.bustle1111, S.cosmo111, S.marriageTf, S.rd],
  },
  {
    sequence: '1212',
    theme: 'Relationships & balance',
    answer: 'In popular belief, 1212 is about relationships and balance — the 1 (a new start) paired with the 2 (partnership). It is read as a cue to nurture the people close to you, and to look after yourself as well as you look after others.',
    meaning: 'A spiritual coach quoted by Bustle calls 1212 a "spiritual symbol of duality" — balance between your inner and outer worlds. It is read as a sign that a relationship needs nurturing, someone needs support, or a disagreement needs resolving. Reader\'s Digest adds that you are on the right track to self-fulfilment.',
    love: 'In love, 1212 is read as a deepening connection with a partner. For someone single, it is read as focusing on yourself while staying open — and sometimes as a new relationship or a reunion.',
    career: 'Most guides we checked keep 1212 about relationships rather than work. If you want a work reading, the same balance applies: who on your team needs support, and where is a disagreement worth settling?',
    twinFlame: 'In twin-flame belief, 1212 is read as a connection deepening, with balance, honest communication and quality time described as essential.',
    whatToDo: [
      'Ask yourself whether you feel supported — and how you could support someone else.',
      'Spend real time with someone you love, or help a friend through something hard.',
      'Practise self-compassion: a solo outing, or a kinder inner voice.',
    ],
    related: ['222', '1111', '2222'],
    sources: [S.bustle1212, S.rd],
  },
  {
    sequence: '1234',
    theme: 'Step-by-step progress',
    answer: 'In popular belief, 1234 is the step-by-step number: one, two, three, four in order, read as a sign that you are moving forward and building something in stages. The message is progress through simple next steps.',
    meaning: 'Writers read 1234 as heading in a positive direction, with each number a stepping stone. Astrology.com blends the four digits: 1 for beginnings, 2 for partnership, 3 for creativity and 4 for stability — together, a period of growth. Cosmopolitan\'s guide calls it a "building phase".',
    love: 'In love, 1234 is read as working on your bond with balance and harmony — talking openly with your partner — while also making time for self-love.',
    career: 'For work, 1234 is read as new opportunities and a cue to make an organised plan, including for money goals.',
    twinFlame: 'In twin-flame belief, 1234 is described as the connection being closer than you expect, with the advice to trust the timing and keep working on your own growth.',
    whatToDo: [
      'Write down the next four small steps toward one goal — and do the first.',
      'Picture the finished result clearly before you start.',
      'Take quiet time outdoors, in prayer or meditation, to reset.',
    ],
    related: ['444', '111', '333'],
    sources: [S.astro1234, S.rd, S.cosmoGuide],
  },
  {
    sequence: '2222',
    theme: 'Partnership & patience',
    answer: 'In popular belief, 2222 is a stronger form of 222: partnership, teamwork and patience. It is read as reassurance that the relationships and collaborations you are investing in are on the right track.',
    meaning: 'Two is described as the energy of "all things partnership", and 2222 as harmony, diplomacy and compassion. A numerologist quoted by Women\'s Health points out that 2 + 2 + 2 + 2 = 8, a number linked in that reading with time and karma. Cosmopolitan\'s guide calls 2222 a sign of steady, hard-won progress.',
    love: 'In a relationship, 2222 is read as a cue to give it attention — open communication and appreciation. For someone single, it is read as patience and a good time to get clear on your values; after a break-up, as a reminder that endings lead to fresh starts.',
    career: 'For work, 2222 is read as teamwork and good relationships with colleagues — perhaps a useful new connection. If work feels stuck, it is read as untapped potential worth pursuing.',
    twinFlame: 'In twin-flame belief, 2222 is described as a reunion being within reach — though the same source notes a separation is sometimes part of the lesson. We treat this as a belief, not a prediction.',
    whatToDo: [
      'Pause and check in with how you are feeling when you notice 2222.',
      'If something feels out of balance, name it and look at it honestly.',
      'Put time into one relationship or working partnership this week.',
    ],
    related: ['222', '1212', '888'],
    sources: [S.wh2222, S.cosmoGuide],
  },
];

export const ANGEL_SEQUENCES: string[] = ANGEL_NUMBERS.map(a => a.sequence);

export function angelBySequence(seq: string | undefined): AngelNumber | undefined {
  return seq ? ANGEL_NUMBERS.find(a => a.sequence === seq) : undefined;
}

export const ANGEL_SEO = seo as Record<string, string>;

export function angelTitle(seq: string): string {
  return `Angel Number ${seq} Meaning — Love, Career & Twin Flame | BornClock`;
}

export interface AngelNumerology {
  digits: number[];
  sum: number;
  /** Reduced with the sitewide rule (keeps 11/22/33); 0 for 000. */
  root: number;
  /** The working shown on the page, e.g. "1 + 2 + 3 + 4 = 10 → 1". */
  working: string;
  /** True when the root is a Life Path number (1–9, 11, 22, 33). */
  isLifePathNumber: boolean;
  /** Distinct non-zero digits in the sequence (for "the energy of 1 and 2" links). */
  baseDigits: number[];
  /** True when the sequence contains the master number 11 or 22 as a repeated pair. */
  containsMaster: number[];
}

/** Numerology of a sequence, using the ONE sitewide reduction (src/lib/lifePath.ts). */
export function angelNumerology(seq: string): AngelNumerology {
  const digits = seq.split('').map(Number);
  const sum = digits.reduce((s, d) => s + d, 0);
  const root = reduceKeepingMaster(sum);
  const chain: number[] = [];
  let x = sum;
  while (x > 9 && !MASTER_NUMBERS.includes(x)) { x = digitSum(x); chain.push(x); }
  const working = `${digits.join(' + ')} = ${sum}${chain.length ? ' → ' + chain.join(' → ') : ''}`;
  const baseDigits = [...new Set(digits.filter(d => d !== 0))];
  const containsMaster = [11, 22].filter(m => seq.includes(String(m)) && seq.length >= 4 && seq === String(m).repeat(seq.length / 2));
  return { digits, sum, root, working, isLifePathNumber: root >= 1, baseDigits, containsMaster };
}

/** "Life Path 1 — The Leader" (names from the existing numerology data). */
export function lifePathLabel(n: number): string {
  const d = getNumerologyByNumber(n);
  return d ? `Life Path ${n} — ${d.name}` : `Life Path ${n}`;
}

/** Plain-language numerology line for a sequence (page section + FAQ). */
export function numerologyText(a: AngelNumber): string {
  const n = angelNumerology(a.sequence);
  if (!n.isLifePathNumber) {
    return `The digits of ${a.sequence} add up to 0. Zero is not one of the numerology Life Path numbers (1–9, 11, 22 and 33), so ${a.sequence} has no matching Life Path — believers read it as a reset rather than a theme.`;
  }
  const reduces = n.root !== n.sum ? `${n.sum}, which reduces to ${n.root}` : `${n.sum}`;
  const master = n.containsMaster.length
    ? ` It is also the master number ${n.containsMaster[0]} repeated, which numerology treats as a "double-strength" number.`
    : '';
  return `The digits of ${a.sequence} add up to ${reduces}, so in numerology it shares the theme of ${lifePathLabel(n.root)}.${master} Angel numbers themselves are not calculated from a birth date — this only shows which number theme the digits share.`;
}
