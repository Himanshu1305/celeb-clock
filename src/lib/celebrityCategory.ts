/**
 * B24 — a real category for every celebrity profile. The Supabase import stored 1,779 profiles with
 * the generic category "Celebrity" (and a few with raw descriptions such as "Indian actress"), which
 * kept them out of the category hubs and gave pages the vague job title "Celebrity". The Wikidata
 * description (known_for / occupation, e.g. "Indian sport shooter", "3rd President of India
 * (1897-1969)") says what they do: the role named FIRST in the description wins ("Indian actor and
 * politician" → Actor), ties going to the earlier rule below. Unmatched stays "Celebrity".
 * Used by scripts/export-celebrities.ts (new exports) and scripts/normalize-celebrity-categories.mts
 * (the committed src/data/celebrities.json).
 */
const RULES: Array<[RegExp, string]> = [
  [/\bcricket/, 'Cricketer'],
  [/\b(president|prime minister|vice[- ]president) of india\b|\bchief minister\b|\bpolitician\b|\bmember of (parliament|the lok sabha|the rajya sabha)\b|\bminister\b|\bgovernor\b|\bdiplomat\b/, 'Politician'],
  [/\bfreedom fighter\b|\bindependence activist\b|\brevolutionary\b/, 'Freedom Fighter'],
  [/\bsocial reformer\b|\breformer\b/, 'Social Reformer'],
  [/\bplayback singer\b|\bsinger\b|\bvocalist\b|\brapper\b|\brecording artist\b/, 'Singer'],
  [/\bcomposer\b|\bmusic director\b/, 'Music Composer'],
  [/\blyricist\b/, 'Lyricist'],
  [/\bmusician\b|\b(sitar|tabla|sarod|sarangi|santoor|flute|violin|veena|shehnai|mridangam)\b|\bguitarist\b|\bdrummer\b|\bpercussionist\b/, 'Musician'],
  [/\bchoreographer\b/, 'Choreographer'],
  [/\bactress\b/, 'Actress'],
  [/\bactor\b|\bcomedian\b/, 'Actor'],
  [/\bfilm ?maker\b|\bfilm director\b|\bdirector\b|\bscreenwriter\b|\bcinematographer\b/, 'Director'],
  [/\bproducer\b/, 'Producer'],
  [/\bdancer\b/, 'Dancer'],
  [/\bfashion designer\b/, 'Fashion Designer'],
  [/\bfootball|\bathlete\b|\bboxer\b|\bwrestler\b|\bshooter\b|\bbadminton\b|\btennis\b|\bhockey\b|\bchess\b|\bsprinter\b|\brunner\b|\bweightlifter\b|\bswimmer\b|\bkabaddi\b|\bgolfer\b|\barcher\b|\bcyclist\b|\bracing driver\b|\bmountaineer\b|\bjavelin\b|\bsports?(man|woman|person)?\b|\bolympi|\bgymnast\b|\bsquash\b|\btable tennis\b|\bpara-?athlete\b/, 'Athlete'],
  [/\bbusiness(man|woman|person)?\b|\bindustrialist\b|\bentrepreneur\b|\bchief executive\b|\bceo\b|\bbanker\b|\binvestor\b|\bfounder\b|\bphilanthropist\b/, 'Business Leader'],
  [/\beconomist\b/, 'Economist'],
  [/\bmathematician\b/, 'Mathematician'],
  [/\bscientist\b|\bphysicist\b|\bchemist\b|\bastronomer\b|\bagronomist\b|\bbiologist\b|\bastrophysicist\b|\bgeneticist\b|\bbotanist\b|\bengineer\b|\bastronaut\b|\bphysician\b|\bsurgeon\b|\bdoctor\b/, 'Scientist'],
  [/\bjournalist\b|\bnews anchor\b|\btelevision presenter\b|\bbroadcaster\b/, 'Journalist'],
  [/\bpoet\b/, 'Poet'],
  [/\bwriter\b|\bnovelist\b|\bauthor\b|\bessayist\b/, 'Author'],
  [/\bspiritual\b|\bguru\b|\bsaint\b|\bmonk\b|\byogi\b|\bphilosopher\b|\breligious leader\b/, 'Spiritual Leader'],
  [/\bpainter\b|\bsculptor\b|\bartist\b|\bcartoonist\b|\bphotographer\b/, 'Artist'],
  [/\bactivist\b|\benvironmentalist\b|\bsocial worker\b/, 'Activist'],
  [/\bhistorian\b|\blinguist\b|\bindologist\b|\bscholar\b|\bacademic\b|\bprofessor\b|\btheorist\b|\btheosophist\b/, 'Scholar'],
  [/\b(bio)?chemist\b|\bmeteorologist\b|\bimmunologist\b|\bornithologist\b|\bpsychologist\b|\bneuroscientist\b|\barchitect\b/, 'Scientist'],
  [/\bjumper\b|\bthrower\b|\bclimber\b|\bhurdler\b|\bmarathon\b|\bpara\b/, 'Athlete'],
  [/\bcardinal\b|\bbishop\b|\barchbishop\b|\bpriest\b|\bmissionary\b|\bimam\b|\bcatholicos\b|\bpatriarch\b|\bmeditation\b|\bsarsanghchalak\b/, 'Spiritual Leader'],
  [/\bfield marshal\b|\bair marshal\b|\barmy\b|\bnavy\b|\bair force\b|\bchief of defence staff\b|\bparam vir chakra\b|\bsoldier\b|\bmilitary\b/, 'Military Officer'],
  [/\bking\b|\bqueen\b|\bmaharaja\b|\bmaharani\b|\bnizam\b|\bprince(ss)?\b|\bemperor\b|\bsultan\b/, 'Royalty'],
  [/\bjustice\b|\bjudge\b|\blawyer\b|\bjurist\b|\badvocate\b/, 'Jurist'],
  [/\bphotojournalist\b/, 'Journalist'],
  [/\bparty\b|\bopposition\b|\blegislative\b|\bspeaker of the lok sabha\b|\bnational (indian )?congress\b|\bnational security advisor\b|\bpresident of (trinidad|guyana|mauritius|fiji|singapore)/, 'Politician'],
  [/\bathletics\b|\bbilliards\b|\bsnooker\b|\bskier\b|\bjudoka\b|\bplayer\b|\beverest\b|\bformula one driver\b/, 'Athlete'],
  [/\bisro\b|\bspace research\b/, 'Scientist'],
  [/\bbillionaire\b|\bexecutive\b/, 'Business Leader'],
  [/\bchef\b/, 'Chef'],
  [/\bpilot\b/, 'Military Officer'],
  [/\bsociologist\b|\brationalist\b/, 'Scholar'],
  [/\bcommentator\b|\bpolitical consultant\b/, 'Journalist'],
  [/\bsuffragist\b|\bfeminist\b|\bhuman rights\b|\bcampaigner\b/, 'Activist'],
  [/\bmodel\b|\bbeauty pageant\b|\bmiss (india|world|universe)\b/, 'Model'],
  [/\byoutuber\b|\binfluencer\b|\bcontent creator\b/, 'Content Creator'],
];

/** True when a stored category is the generic placeholder or a raw description, not a category. */
const KNOWN = new Set([...RULES.map(r => r[1]), 'Business Leader', 'Businessman', 'Engineer', 'Cultural Figure', 'Historical', 'Philosopher', 'Spiritual Leader']);
export function isGenericCategory(category: string | null | undefined): boolean {
  return !KNOWN.has(String(category ?? '').trim());
}

/** The category for a profile from its Wikidata description(s); "Celebrity" when nothing matches. */
export function deriveCategory(...texts: Array<string | null | undefined>): string {
  const t = texts.filter(Boolean).join(' · ').toLowerCase().replace(/\([^)]*\)/g, ' ');
  let best: { at: number; cat: string } | null = null;
  for (const [re, cat] of RULES) {
    const m = re.exec(t);
    if (m && (!best || m.index < best.at)) best = { at: m.index, cat };
  }
  return best ? best.cat : 'Celebrity';
}
