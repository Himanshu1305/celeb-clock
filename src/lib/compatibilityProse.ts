/**
 * Compatibility composed prose — the ONE data module that drives the pair-specific
 * Love / Friendship / Work sections on all 78 /compatibility/{a}/{b} pages.
 *
 * Architecture (stated for the report): every pair page's three long-form sections are
 * COMPOSED at render time from a sign's four astrological primitives below —
 * element, modality, ruling planet, polarity — plus the sign-distance ASPECT between the
 * two. Change a sign's primitive here (e.g. re-rule Scorpio) and every one of its pair
 * pages regenerates on the next build. Zero per-pair hand maintenance.
 *
 * The three sections are deliberately driven by DIFFERENT primitives so they read as
 * genuinely distinct for the SAME pair (the anti-thin-content rule):
 *   • Love      → ruling planets (desire/affection) + element heat + polarity
 *   • Friendship→ element affinity + aspect ease (planets muted, ego stakes low)
 *   • Work      → modality (who initiates/sustains/adapts) + polarity as conflict engine
 */

export type Sign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export const SIGN_ORDER: Sign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const ELEMENT: Record<Sign, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

export const MODALITY: Record<Sign, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

// Traditional + modern co-ruler in parentheses where it adds colour.
export const RULING_PLANET: Record<Sign, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'the Moon',
  Leo: 'the Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto & Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

// One-line desire/affection signature of each ruler — the LOVE-section engine.
const PLANET_DESIRE: Record<Sign, string> = {
  Aries: 'Mars-driven pursuit and heat',
  Taurus: 'Venus-ruled sensuality and steady devotion',
  Gemini: 'Mercury’s flirtation, banter and mental spark',
  Cancer: 'the Moon’s tenderness and need for emotional safety',
  Leo: 'the Sun’s warmth, romance and need to be adored',
  Virgo: 'Mercury’s attentive, quietly devoted care',
  Libra: 'Venus-ruled romance, charm and craving for harmony',
  Scorpio: 'Pluto’s all-or-nothing intensity and depth',
  Sagittarius: 'Jupiter’s adventurous, freedom-loving affection',
  Capricorn: 'Saturn’s slow-burn, deeply committed loyalty',
  Aquarius: 'Uranus’ unconventional, friendship-first attachment',
  Pisces: 'Neptune’s dreamy, romantic, self-sacrificing love',
};

// Polarity: Fire & Air are Yang (outgoing/initiating); Earth & Water are Yin (receptive).
const POLARITY: Record<Sign, 'Yang' | 'Yin'> = {
  Aries: 'Yang', Leo: 'Yang', Sagittarius: 'Yang', Gemini: 'Yang', Libra: 'Yang', Aquarius: 'Yang',
  Taurus: 'Yin', Virgo: 'Yin', Capricorn: 'Yin', Cancer: 'Yin', Scorpio: 'Yin', Pisces: 'Yin',
};

const ELEMENT_HEAT: Record<string, string> = {
  Fire: 'fast, passionate and combustible',
  Earth: 'sensual, physical and slow to ignite but slow to cool',
  Air: 'playful and verbal, needing conversation to feel close',
  Water: 'deep, intuitive and emotionally immersive',
};

/** Sign distance 0..6 on the wheel (0 = same sign, 6 = opposite). */
export function signDistance(a: Sign, b: Sign): number {
  const i = SIGN_ORDER.indexOf(a), j = SIGN_ORDER.indexOf(b);
  const raw = Math.abs(i - j);
  return Math.min(raw, 12 - raw);
}

export function aspectName(a: Sign, b: Sign): string {
  return ['conjunction', 'semi-sextile', 'sextile', 'square', 'trine', 'quincunx', 'opposition'][signDistance(a, b)];
}

// How the aspect FEELS — the friendship-section engine (ease vs friction).
const ASPECT_EASE: Record<number, string> = {
  0: 'You share the same sign, so being together feels like looking in a mirror — instant recognition, with the catch that you also double each other’s blind spots.',
  1: 'You sit side by side on the zodiac wheel (a semi-sextile), which means neighbouring but different tempos — there’s something to learn from each other, though it rarely feels effortless at first.',
  2: 'You form a sextile (two signs apart) — one of the easiest, most cooperative angles, where each of you gently draws the other out without pressure.',
  3: 'You form a square (three signs apart), the zodiac’s classic friction angle — the tension is real, but it’s also the aspect that pushes you both to grow rather than stagnate.',
  4: 'You form a trine (four signs apart, same element) — the smoothest angle there is, where understanding is so natural you rarely have to explain yourselves.',
  5: 'You form a quincunx (five signs apart), an awkward-angle pairing of signs with almost nothing structurally in common — it works only through deliberate, ongoing adjustment.',
  6: 'You sit directly opposite each other on the wheel — the axis of magnetic attraction, where you’re each other’s missing half and, at your worst, each other’s mirror-opposite frustration.',
};

const MODALITY_ROLE: Record<string, string> = {
  Cardinal: 'an initiator who starts things and sets direction',
  Fixed: 'a sustainer who holds the vision and sees things through',
  Mutable: 'an adapter who stays flexible and smooths the path',
};

function polarityLoveNote(s1: Sign, s2: Sign): string {
  const p1 = POLARITY[s1], p2 = POLARITY[s2];
  if (p1 === p2 && p1 === 'Yang') return 'Both are Yang (outgoing) signs, so both instinctively want to lead the dance — electric when aimed at the world together, a contest when aimed at each other.';
  if (p1 === p2 && p1 === 'Yin') return 'Both are Yin (receptive) signs, so the bond is tender and safe — the risk is that each waits for the other to make the first move.';
  return 'One of you is Yang (initiating) and the other Yin (receptive), which sets up a natural pursuer-and-receiver rhythm — usually the easiest polarity balance in romance.';
}

function polarityWorkNote(s1: Sign, s2: Sign): string {
  const p1 = POLARITY[s1], p2 = POLARITY[s2];
  if (p1 === p2 && p1 === 'Yang') return 'With two assertive Yang signs, the failure mode at work is a turf war — agree who owns which call before egos collide.';
  if (p1 === p2 && p1 === 'Yin') return 'With two steady Yin signs, the risk is that decisions stall while you both wait for consensus — appoint a tie-breaker in advance.';
  return 'The Yang–Yin balance helps here: one of you pushes and the other absorbs, so friction rarely escalates as long as both feel heard.';
}

/** LOVE — driven by ruling planets + element heat + polarity. */
export function loveProse(s1: Sign, s2: Sign): string {
  const heat1 = ELEMENT_HEAT[ELEMENT[s1]], heat2 = ELEMENT_HEAT[ELEMENT[s2]];
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const elLine = sameEl
    ? `Romantically you speak the same language — both ${heat1} — so attraction is instant and the heat is easy to sustain; the work is keeping enough contrast alive to stay intrigued.`
    : `In romance ${s1} runs ${heat1} while ${s2} is ${heat2}, so the spark comes from difference — learning to want in each other’s register is the whole art of it.`;
  return `${s1} brings ${PLANET_DESIRE[s1]}; ${s2} brings ${PLANET_DESIRE[s2]}. ${elLine} ${polarityLoveNote(s1, s2)}`;
}

/** FRIENDSHIP — driven by element affinity + aspect ease (planets muted). */
export function friendshipProse(s1: Sign, s2: Sign): string {
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const elLine = sameEl
    ? `As friends you share the ${ELEMENT[s1]} temperament — you recharge the same way and rarely have to translate yourselves to each other.`
    : `${ELEMENT[s1]} and ${ELEMENT[s2]} approach downtime differently, so a ${s1}–${s2} friendship widens both your worlds rather than echoing them back.`;
  return `Strip away romance and the ego stakes drop, which is why many ${s1}–${s2} pairs are better friends than the love scores suggest. ${elLine} ${ASPECT_EASE[signDistance(s1, s2)]}`;
}

/** WORK — driven by modality roles + polarity as the conflict engine. */
export function workProse(s1: Sign, s2: Sign): string {
  const m1 = MODALITY[s1], m2 = MODALITY[s2];
  const roleLine = m1 === m2
    ? `Both are ${m1} signs, so you’re each ${MODALITY_ROLE[m1]} — powerful when you’re rowing the same way, gridlocked when you’re not, because neither naturally yields the role the other also wants.`
    : `${s1} is ${m1} (${MODALITY_ROLE[m1]}) and ${s2} is ${m2} (${MODALITY_ROLE[m2]}), a genuinely complementary split — one of you gets the project moving and the other carries it home.`;
  return `At work the story is about roles, not romance. ${roleLine} ${polarityWorkNote(s1, s2)}`;
}

/** Fast top-of-page verdict — where you click / where you clash. */
export function clicksAndClashes(s1: Sign, s2: Sign): { click: string; clash: string } {
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const dist = signDistance(s1, s2);
  const click = sameEl
    ? `A shared ${ELEMENT[s1]} wavelength — you get each other without explaining.`
    : dist === 6
      ? 'Opposite-sign magnetism — you each supply what the other lacks.'
      : dist === 2 || dist === 4
        ? 'An easy, low-friction angle that makes cooperation feel natural.'
        : 'Real difference that keeps things interesting when you respect it.';
  const clash = MODALITY[s1] === MODALITY[s2]
    ? `Two ${MODALITY[s1]} signs digging in — compromise is the muscle to train.`
    : dist === 3
      ? 'A square’s built-in friction — pace and priorities need negotiating.'
      : POLARITY[s1] === POLARITY[s2]
        ? `Same-polarity ${POLARITY[s1]} signs both wanting the same role.`
        : 'Different speeds — patience is the price of the balance.';
  return { click, clash };
}

// ── Depth v2 — day-to-day, friction, making-it-work, and summary lists ──────────
// Each composed from a DIFFERENT driver so two same-element pairs still read apart:
// day-to-day = element pace × modality decisions; friction = "the strength over-applied"
// (shared element/planet/polarity/aspect); making-it-work = the antidote to that friction.

const ELEMENT_PACE: Record<string, string> = {
  Fire: 'move fast and figure it out on the way',
  Earth: 'move deliberately and want a plan before you commit',
  Air: 'live in ideas, options and conversation',
  Water: 'move by feeling and read the emotional weather first',
};
const ELEMENT_HOME: Record<string, string> = {
  Fire: 'a household that’s always doing something',
  Earth: 'a settled home with comfortable, dependable routines',
  Air: 'a home full of talk, plans and half-open browser tabs',
  Water: 'a private, emotionally attuned nest',
};
const MODALITY_DECISION: Record<string, string> = {
  Cardinal: 'wants to make the call and get moving',
  Fixed: 'wants to lock in what already works',
  Mutable: 'is happy to keep the options open a little longer',
};
// Ruling planets that two different signs can share — the "doubled trait" driver.
const SHARED_RULER_NOTE: Record<string, string> = {
  Mercury: 'you both live in your heads and talk everything to pieces — analysis can outrun feeling',
  Venus: 'you both want beauty, comfort and harmony — so nobody wants to be the one to raise the hard thing',
  Mars: 'you both run on drive and want — two accelerators and no brake when tempers spike',
};

function baseRuler(s: Sign): string {
  const r = RULING_PLANET[s];
  if (r.startsWith('Pluto')) return 'Mars';
  if (r === 'Uranus') return 'Saturn'; // classical co-ruler, for shared-ruler pairing only
  if (r === 'Neptune') return 'Jupiter';
  return r.replace('the ', '');
}

/** DAY-TO-DAY — element pace × modality decision-making × home rhythm. */
export function dayToDayProse(s1: Sign, s2: Sign): string {
  if (s1 === s2) {
    return `Two ${s1}s keep the same clock — you both ${ELEMENT_PACE[ELEMENT[s1]]}, so the everyday rhythm feels effortless and you rarely have to explain why you do things the way you do. The catch is that no one plays a different role: with both of you ${MODALITY_DECISION[MODALITY[s1]].replace('wants', 'wanting').replace('is happy', 'happy')}, the small decisions — what to eat, whose plan wins — either sail through or stall in a standoff, and the household chores neither ${s1} enjoys tend to sit undone. You build ${ELEMENT_HOME[ELEMENT[s1]]}; just agree who owns the jobs you both instinctively dodge.`;
  }
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const paceLine = sameEl
    ? `You keep a similar pace — both of you ${ELEMENT_PACE[ELEMENT[s1]]} — so mornings and weekends rarely need negotiating.`
    : `${s1} tends to ${ELEMENT_PACE[ELEMENT[s1]]}, while ${s2} tends to ${ELEMENT_PACE[ELEMENT[s2]]}, so the daily tempo is the first thing you’ll learn to sync.`;
  const decisionLine = MODALITY[s1] === MODALITY[s2]
    ? `On decisions you’re alike — each of you ${MODALITY_DECISION[MODALITY[s1]]} — which is smooth until you disagree, and then neither backs down.`
    : `When it’s time to decide, ${s1} ${MODALITY_DECISION[MODALITY[s1]]} and ${s2} ${MODALITY_DECISION[MODALITY[s2]]}, so you naturally split the work: one of you starts and steers, the other refines or keeps it flexible.`;
  return `${paceLine} ${decisionLine} Left to your own devices you’d each build a different home — ${ELEMENT_HOME[ELEMENT[s1]]} for ${s1}, ${ELEMENT_HOME[ELEMENT[s2]]} for ${s2} — and the shared version is the quiet, ongoing negotiation of this match.`;
}

// Modality-specific friction — this is what keeps two same-element (hence same-polarity)
// pairs reading differently: Aries-Leo (Cardinal-Fixed) vs Leo-Sagittarius (Fixed-Mutable).
const MODALITY_FRICTION: Record<string, string> = {
  'Cardinal-Cardinal': 'you both want to kick things off and steer, so you butt heads over whose direction wins',
  'Fixed-Fixed': 'you both dig in and wait for the other to bend first, so small standoffs harden into cold wars',
  'Mutable-Mutable': 'you both keep the plan open and adapt, so nothing holds still and decisions quietly never get made',
  'Cardinal-Fixed': 'the initiator wants to move now while the anchor won’t be rushed — momentum against immovability',
  'Cardinal-Mutable': 'the initiator drives hard while the adapter keeps changing lanes, so follow-through is the weak point',
  'Fixed-Mutable': 'the anchor digs into what works while the wanderer wants to change it — "settle down" versus "shake it up"',
};
const modalityKey = (s1: Sign, s2: Sign) => [MODALITY[s1], MODALITY[s2]].sort().join('-');

const ASPECT_FRICTION: Record<number, string> = {
  1: 'And sitting one sign apart, you run at subtly different tempos — it feels a touch off until you stop expecting the other to match your pace.',
  2: 'Your sextile keeps things gentle, so the real risk isn’t conflict — it’s coasting, letting an easy thing quietly drift.',
  3: 'You also sit at a square — the zodiac’s built-in friction angle — where the same wants arrive on different timelines, so urgency to one reads as reckless or slow to the other.',
  4: 'And because you form a trine, everything comes so easily that complacency, not conflict, is the threat — ease slides into taking each other for granted.',
  5: 'Five signs apart, you’re a genuinely mismatched angle that only works through constant small adjustments.',
  6: 'As opposite signs you also want different things — what’s essential to one is optional to the other — so it’s two halves of one axis, or a tug-of-war.',
};

/** WHERE IT GETS HARD — composed from polarity/planet OPENER + modality clause + aspect. */
export function frictionProse(s1: Sign, s2: Sign): string {
  const dist = signDistance(s1, s2);
  if (s1 === s2) {
    return `The hard part with two ${s1} is that there’s no counterweight. Every ${s1} strength is doubled — and so is every ${s1} blind spot, with no one in the room wired to balance it. When you’re both low you amplify rather than steady each other, and because you sit at the very same point on the wheel there’s no built-in tension to keep things charged, so passion can flatten into routine. Whatever ${s1} finds hardest, expect to do it on purpose — neither of you will by instinct.`;
  }
  const r1 = baseRuler(s1), r2 = baseRuler(s2);
  const opener = (r1 === r2 && SHARED_RULER_NOTE[r1])
    ? `${s1} and ${s2} share a ruling planet (${r1}), so ${SHARED_RULER_NOTE[r1]} — the wiring that bonds you is the wiring you both over-use.`
    : (POLARITY[s1] === POLARITY[s2] && POLARITY[s1] === 'Yang')
      ? `Both ${s1} and ${s2} are assertive Yang signs, so the core tension is command: two people who want to lead, neither wired to yield.`
      : (POLARITY[s1] === POLARITY[s2] && POLARITY[s1] === 'Yin')
        ? `${s1} and ${s2} are both receptive Yin signs, so the gentleness that makes you safe can curdle into avoidance — the hard thing sits unsaid for weeks.`
        : `${ELEMENT[s1]} and ${ELEMENT[s2]} read the world differently — ${s1} leads with ${ELEMENT[s1] === 'Fire' || ELEMENT[s1] === 'Air' ? 'action and logic' : 'feeling and steadiness'}, ${s2} with ${ELEMENT[s2] === 'Fire' || ELEMENT[s2] === 'Air' ? 'action and logic' : 'feeling and steadiness'}, so misread signals escalate until you learn each other’s language.`;
  const modLine = MODALITY[s1] === MODALITY[s2]
    ? `Being two ${MODALITY[s1]} signs sharpens it: ${MODALITY_FRICTION[modalityKey(s1, s2)]}.`
    : `The ${MODALITY[s1]}–${MODALITY[s2]} pairing shapes it — ${MODALITY_FRICTION[modalityKey(s1, s2)]}.`;
  return `${opener} ${modLine} ${ASPECT_FRICTION[dist]}`;
}

/** MAKING IT WORK — antidotes tied to this pair's polarity, aspect AND modality split. */
export function makingItWorkProse(s1: Sign, s2: Sign): string[] {
  const dist = signDistance(s1, s2);
  const tips: string[] = [];
  if (s1 === s2) {
    tips.push(`Manufacture the contrast the zodiac didn’t give you: take turns leading, keep separate interests, and protect some autonomy so there’s something to miss.`);
    tips.push(`Because your shared blind spot has no counterweight, one of you has to consciously develop the trait neither ${s1} does naturally — usually ${ELEMENT[s1] === 'Fire' ? 'patience' : ELEMENT[s1] === 'Earth' ? 'spontaneity' : ELEMENT[s1] === 'Air' ? 'emotional follow-through' : 'objectivity'}.`);
    tips.push(`Name the chores and hard conversations you both avoid and assign them on purpose, before resentment does it for you.`);
    return tips;
  }
  // polarity tip
  if (POLARITY[s1] === POLARITY[s2] && POLARITY[s1] === 'Yang') {
    tips.push(`Divide the territory in advance — agree who has the final call on money, plans, home and work — so a normal decision doesn’t become a duel.`);
  } else if (POLARITY[s1] === POLARITY[s2] && POLARITY[s1] === 'Yin') {
    tips.push(`Appoint a standing time to raise what you’re both too gentle to bring up, so the unsaid thing doesn’t fester in the quiet.`);
  } else {
    tips.push(`Lean into the pursuer-and-receiver rhythm instead of fighting it: let the initiator initiate and the responder genuinely respond, and both of you feel wanted.`);
  }
  // aspect tip
  if (dist === 4 || dist === 2) tips.push(`Your angle is easy — almost too easy — so deliberately introduce novelty (new places, new challenges) before comfort tips into complacency.`);
  else if (dist === 3) tips.push(`Treat the square as a training ground, not a scoreboard: when pace and priorities clash, ask "what is the other pace protecting?" rather than who’s right.`);
  else if (dist === 6) tips.push(`Read your differences as one shared axis — ${s1}’s strength covers ${s2}’s blind spot and vice versa — and borrow from each other instead of competing.`);
  else tips.push(`Translate before you react: assume good intent and check what the other actually meant before a small mismatch becomes a fight.`);
  // modality role tip — correctly names the split for THIS pair
  const cardinal = MODALITY[s1] === 'Cardinal' ? s1 : MODALITY[s2] === 'Cardinal' ? s2 : null;
  const fixed = MODALITY[s1] === 'Fixed' ? s1 : MODALITY[s2] === 'Fixed' ? s2 : null;
  const mutable = MODALITY[s1] === 'Mutable' ? s1 : MODALITY[s2] === 'Mutable' ? s2 : null;
  if (cardinal && fixed) tips.push(`Play the roles: let ${cardinal} start what ${fixed} will see through, so momentum and staying-power pull the same way instead of grinding.`);
  else if (cardinal && mutable) tips.push(`Play the roles: let ${cardinal} set the direction and ${mutable} keep it adaptable — just protect the follow-through neither of you loves.`);
  else if (fixed && mutable) tips.push(`Play the roles: let ${mutable} bring the new ideas and ${fixed} decide which ones stick, so "change it" and "keep it" become a workflow, not a fight.`);
  else tips.push(`Since you’re the same modality, appoint who leads which domain outright — otherwise you’ll both reach for (or both dodge) the same role.`);
  return tips;
}

/** Composed strengths / challenges bullet summary (pair-specific). */
export function strengthsList(s1: Sign, s2: Sign): string[] {
  const out: string[] = [];
  const dist = signDistance(s1, s2);
  if (ELEMENT[s1] === ELEMENT[s2]) out.push(`Instant ${ELEMENT[s1]}-element understanding — you rarely have to explain yourselves`);
  else out.push(`Complementary elements — ${s1} and ${s2} each supply what the other runs short on`);
  if (dist === 4) out.push('A harmonious trine angle that makes cooperation feel natural');
  else if (dist === 6) out.push('Opposite-sign magnetism — strong attraction and mutual fascination');
  else if (dist === 2) out.push('An easy sextile — low-friction, genuinely enjoyable company');
  if (MODALITY[s1] !== MODALITY[s2]) out.push(`A natural division of labour: one of you starts things, the other finishes them`);
  else out.push(`Shared ${MODALITY[s1]} drive — when you’re aligned you’re unstoppable`);
  if (s1 === s2) return ['Effortless mutual understanding — you truly get each other', 'Shared values, pace and priorities', 'Deep loyalty once you commit', 'No translation needed — you speak the same language'];
  return out;
}
export function challengesList(s1: Sign, s2: Sign): string[] {
  const dist = signDistance(s1, s2);
  if (s1 === s2) return [`Doubled blind spots with no counterweight`, `Little built-in tension — passion needs manufacturing`, `Stand-offs when two ${MODALITY[s1]} signs both dig in`, `The chores and hard talks you both avoid`];
  const out: string[] = [];
  if (POLARITY[s1] === POLARITY[s2] && POLARITY[s1] === 'Yang') out.push('Two leaders, no natural follower — power struggles');
  else if (POLARITY[s1] === POLARITY[s2] && POLARITY[s1] === 'Yin') out.push('Both too gentle to raise the hard thing — avoidance');
  else out.push('Different speeds that need patience to sync');
  if (dist === 3) out.push('A square’s friction over pace and priorities');
  else if (dist === 6) out.push('Opposite priorities — what’s essential to one is optional to the other');
  else if (ELEMENT[s1] === ELEMENT[s2]) out.push(`A shared ${ELEMENT[s1]}-element rut, amplified not balanced`);
  else out.push('Signals that are easy to misread across different elements');
  if (MODALITY[s1] === MODALITY[s2]) out.push(`Neither ${MODALITY[s1]} sign wants to yield the role`);
  else out.push('One starts, one finishes — but only if egos allow the handoff');
  return out;
}
