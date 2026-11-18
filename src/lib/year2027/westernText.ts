/** B14 — Western-framed wording for /horoscope/:sign/2027 (solar houses, tropical zodiac). */
import type { Tone } from '../vedic/rashifal';
import type { YPlanet } from './sky';
import type { Domain } from './text';

export const WESTERN_AREA = ['',
  'self-image, health and fresh starts',
  'money, possessions and self-worth',
  'communication, learning, siblings and your neighbourhood',
  'home, family and roots',
  'romance, creativity, children and fun',
  'daily work, routines and wellbeing',
  'partnerships, marriage and contracts',
  'shared money, intimacy and deep change',
  'travel, study, publishing and beliefs',
  'career, ambition and public standing',
  'friends, networks, groups and hopes',
  'rest, solitude, endings and the inner life',
];

export const WESTERN_LENS: Record<YPlanet, Record<Tone, string>> = {
  Sun: { favourable: 'visibility, confidence and a chance to shine', challenging: 'tiredness and ego friction — pace yourself', mixed: 'attention that rewards honest effort' },
  Mercury: { favourable: 'sharp ideas, useful conversations and smooth paperwork', challenging: 'crossed wires and missed details — double-check', mixed: 'a busy mind and a full inbox' },
  Venus: { favourable: 'charm, affection, pleasure and good taste', challenging: 'over-indulgence and touchy feelings', mixed: 'sweetness with a side of distraction' },
  Mars: { favourable: 'drive, courage and the push to get things done', challenging: 'impatience and short fuses — take care on the road and with tools', mixed: 'energy that needs a clear outlet' },
  Jupiter: { favourable: 'growth, luck, generosity and open doors', challenging: 'overdoing it and promising too much', mixed: 'steady expansion if you stay realistic' },
  Saturn: { favourable: 'discipline that pays off and lasting results', challenging: 'pressure, delays and lessons in patience', mixed: 'hard work and slow but real progress' },
  Rahu: { favourable: 'new appetites and opportunities', challenging: 'restlessness', mixed: 'unusual turns' },
  Ketu: { favourable: 'release and insight', challenging: 'detachment', mixed: 'reflection' },
};

export const WESTERN_TIP: Record<number, Record<Tone, string>> = {
  1: { favourable: 'Put yourself forward — start the personal project you keep postponing.', mixed: 'Look after your energy and update how you present yourself.', challenging: 'Protect your energy: sleep, simple food and fewer commitments.' },
  2: { favourable: 'Grow your savings and ask to be paid what you are worth.', mixed: 'Track spending and keep purchases purposeful.', challenging: 'Hold off on big purchases and keep a buffer.' },
  3: { favourable: 'Write, pitch, learn — your words carry weight.', mixed: 'Say it clearly and follow up in writing.', challenging: 'Slow down before you hit send; re-read the details.' },
  4: { favourable: 'A good time to improve your home or reconnect with family.', mixed: 'Balance home duties with your own downtime.', challenging: 'Give home and family patience, and check property papers twice.' },
  5: { favourable: 'Date, create, play — joy is productive now.', mixed: 'Have fun, but keep risks small.', challenging: 'Keep romance light and gambles off the table.' },
  6: { favourable: 'Build routines that last and fix what is broken at work.', mixed: 'Keep your schedule realistic and your health habits steady.', challenging: 'Don’t overload your calendar; rest is part of the work.' },
  7: { favourable: 'Commit, collaborate and sign good deals.', mixed: 'Meet others halfway and spell out expectations.', challenging: 'Read contracts carefully and talk things through calmly with your partner.' },
  8: { favourable: 'Sort out shared money, debts and taxes.', mixed: 'Be open about money with the people it affects.', challenging: 'Avoid risky loans and joint financial leaps.' },
  9: { favourable: 'Travel, study or teach — widen your world.', mixed: 'Plan trips and courses properly before you commit.', challenging: 'Double-check bookings and don’t take advice on faith alone.' },
  10: { favourable: 'Go for the promotion, launch or public step.', mixed: 'Let your track record speak; stay consistent.', challenging: 'Stay professional under pressure and keep good relations with bosses.' },
  11: { favourable: 'Network, join groups and chase the long-term goal.', mixed: 'Invest in the friendships that invest in you.', challenging: 'Be choosy about commitments to groups and favours.' },
  12: { favourable: 'Rest, reflect and finish what is behind the scenes.', mixed: 'Build quiet time into your week.', challenging: 'Guard your sleep and avoid hidden costs.' },
};

export const WESTERN_IMPACT: Record<Domain, Record<Tone, string>> = {
  love: { favourable: 'Love has a warm tailwind in 2027.', mixed: 'Love in 2027 has its sweet spells and its testing ones.', challenging: 'Love in 2027 asks for patience and honest conversations.' },
  career: { favourable: 'Career momentum is strong in 2027 — visibility and progress come together.', mixed: 'Career in 2027 moves in waves: push in the strong windows, consolidate in the slow ones.', challenging: 'Career in 2027 is about endurance: more responsibility, slower rewards, lasting results.' },
  money: { favourable: 'Money looks healthy in 2027 if you plan.', mixed: 'Money in 2027 is steady but uneven — budget for both gains and outflows.', challenging: 'Money in 2027 needs discipline: outflows and commitments run high.' },
  health: { favourable: 'Energy is good in 2027 — a great year to build habits.', mixed: 'Energy in 2027 has peaks and dips; routine keeps you steady.', challenging: 'Energy in 2027 needs care: pace yourself and keep routines and check-ups regular.' },
};

export const WESTERN_TODO: Record<Domain, Record<Tone, string>> = {
  love: { favourable: 'Make plans together and say what matters; if single, say yes to introductions.', mixed: 'Save big talks for the warm windows and keep hard conversations calm.', challenging: 'Listen first, keep promises realistic and don’t decide things in a temper.' },
  career: { favourable: 'Ask for more, show your work and take the well-judged opportunity.', mixed: 'Launch in the strong windows; use slow weeks to train and tidy up.', challenging: 'Document your work, stay on good terms with your manager and avoid rash exits.' },
  money: { favourable: 'Automate savings and invest only after research.', mixed: 'Keep an emergency fund and time big purchases well.', challenging: 'Budget monthly and avoid new debt and speculation.' },
  health: { favourable: 'Start a routine you can keep: sleep, movement and simple food.', mixed: 'Keep sleep and meals regular and don’t ignore small niggles.', challenging: 'Book routine check-ups, rest properly and travel with ordinary care.' },
};
