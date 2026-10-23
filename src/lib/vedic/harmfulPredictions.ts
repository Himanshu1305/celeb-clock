/**
 * Audit K8 — harmful-prediction rephraser for AI output (chat + reading).
 *
 * The old output scanner let through statements like "your spouse is likely to pass
 * away early", "a major accident is indicated", "your child faces serious illness",
 * and every Hindi/Hinglish line ("mrityu ka yog hai", "shaadi pakka").
 *
 * FOUNDER DECISION (23 Oct 2026): do NOT block or silently drop these. Rephrase each
 * harmful sentence into caring, practical caution so the user keeps the useful signal:
 *   - accident        → "Take extra care while travelling and driving in this period."
 *   - own danger/death/illness → "This is a sensitive period — take good care of your
 *                       health, avoid unnecessary risks, and don't skip check-ups."
 *   - spouse / parent / relative → "Elders or family members may need more of your time
 *                       and support in this period — stay close and keep an eye on their health."
 *   - child           → routine health care + "regular check-ups are a good idea"
 *   - marriage certainty ("pakka", "definitely") → a window of possibility, not a promise
 *   - divorce / separation → patience and open communication
 * Never state death, a fatal outcome, a specific disease, or certainty. Keep the timing
 * window if one was given. Same language as the original (English / Hindi / Hinglish).
 *
 * Deterministic and sentence-level: everything that is not harmful is left untouched.
 */

export type HarmDomain = 'death' | 'accident' | 'illness' | 'marriage-certainty' | 'divorce';
export type HarmSubject = 'self' | 'partner' | 'child' | 'parent';
export type HarmLang = 'en' | 'hi' | 'hinglish';

export interface HarmFinding {
  domain: HarmDomain;
  subject: HarmSubject;
  lang: HarmLang;
  sentence: string;
}

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';

// ── Term lists ───────────────────────────────────────────────────────────────
// English harm terms need a PREDICTIVE cue in the same clause (so "the 8th house is
// traditionally linked with transformation" or "see a doctor" pass untouched).
const DEATH_EN = /\b(die|dies|dying|death|dead|pass(?:es|ing)? away|demise|short (?:life|lifespan|life ?span)|lifespan|early grave|widow\w*|vaidhavya|lose (?:your|their|his|her) (?:husband|wife|spouse|partner|father|mother|parents?|child|son|daughter|baby|life)|fatal)\b/i;
const ACCIDENT_EN = /\b(accidents?|injur(?:y|ies|ed)|mishaps?|crash(?:es)?)\b/i;
const ILLNESS_EN = /\b(serious(?:ly)? ill(?:ness)?|ill(?:ness|nesses)?|fall(?:s)? ill|sick(?:ness)?|diseases?|cancer|terminal|chronic|tumou?rs?|infertil\w*|barren|miscarriage|hospitali[sz]\w*|surgery|health (?:problems?|issues?|crisis|troubles?))\b/i;
const CUE_EN = /\b(will|going to|likely|probabl\w*|indicat\w*|shows?|showing|suggest\w*|points? to|yoga|risk|danger\w*|faces?|facing|suffer\w*|chances?|possib\w*|predict\w*|destined|fated|in store|ahead|soon|early|before you|antardasha|mahadasha|dasha|expect\w*|may|might|could|brings?|cause[sd]?|written)\b|'ll\b|\b(?:in|by|around) (?:19|20)\d{2}\b/i;

// Hindi (Devanagari) — \b does not work on Devanagari, so no word boundaries here.
const DEATH_HI = /(मृत्यु|मौत|मरण|मर जा|मरने|अल्पायु|अकाल|विधवा|वैधव्य)/;
const ACCIDENT_HI = /(दुर्घटना|एक्सीडेंट|हादसा|चोट)/;
const ILLNESS_HI = /(गंभीर बीमारी|बीमार|बीमारी|रोग|कैंसर|ऑपरेशन)/;
const MARRIAGE_HI = /(शादी|विवाह)/;
const CERTAIN_HI = /(पक्का|पक्की|निश्चित|ज़रूर|जरूर|अवश्य|गारंटी|तय है|कभी नहीं)/;

// Hinglish (romanised Hindi).
const DEATH_HG = /\b(mrityu|mirtyu|maut|marne|mar jaa?\w*|maran|alpayu|akaal|vidh[wv]a|vaidhavya)\b/i;
const ACCIDENT_HG = /\b(durghatna|hadsa|haadsa|chot)\b/i;
const ILLNESS_HG = /\b(bimar\w*|beemar\w*|rog|kasht)\b/i;
const MARRIAGE_HG = /\b(shaadi|shadi|vivah|vivaah|byah|biyah)\b/i;
const CERTAIN_HG = /\b(pakka|pakki|zaroor|zarur|jaroor|jarur|nishchit|guarantee|tay hai|hi hogi|kabhi nahi|kabhi nahin)\b|100 ?%/i;
const HINGLISH_MARKERS = /\b(hai|hain|hoga|hogi|honge|ka|ki|ke|mein|aap|aapka|aapki|aapke|aapko|yog|shaadi|shadi|rahenge|rahega|rahegi|zaroor|pakka|baad|nahi|bachche|pati|patni)\b/gi;

// Marriage certainty / divorce (English). `GAP` refuses to cross a negation so
// "many people marry outside these windows — nothing here is certain" passes.
const GAP = String.raw`(?:(?!\b(?:not|no|nothing|never|cannot|can't|isn't|won't|without)\b)[^.!?।]){0,40}?`;
const MARRIAGE_CERTAIN_EN: RegExp[] = [
  new RegExp(String.raw`\b(certain(?:ly)?|surely|definitely|guaranteed?|for sure|no doubt|without (?:a )?doubt|bound to)\b${GAP}\b(marr\w*|wedding)\b`, 'i'),
  new RegExp(String.raw`\b(marr\w*|wedding)\b${GAP}\b(?:is|are|will be|is going to be)\s+(certain|guaranteed|sure|fixed|confirmed|definite|inevitable)\b`, 'i'),
  /\b(?:will|'ll|going to)\s+(?:definitely |surely |certainly )?(?:get )?marr(?:y|ied)\b/i,
  /\b(?:will|'ll)\s+never\s+(?:get\s+)?marr(?:y|ied)\b|\bnever (?:get )?married\b|\bno (?:chance|yoga|possibility) of marriage\b/i,
  /\b100 ?%[^.!?]{0,30}\b(marr\w*|wedding)\b/i,
];
const DIVORCE_EN: RegExp[] = [
  /\b(divorce|separation)\b[^.!?]{0,30}\b(?:is |are )?(certain|indicated|likely|inevitable|on the cards|in store|written)\b/i,
  /\b(?:will|'ll|going to)\s+(?:get\s+)?(divorc\w*|separat\w*)\b/i,
];

// A sentence that DISCLAIMS prediction ("Astrology can't predict death or accidents")
// is exactly what we ask the model to say — never rewrite it.
const DISCLAIMER_EN = /\b(can'?t|cannot|can not|won'?t|will not|never|do not|don'?t|doesn'?t|does not|isn'?t|is not|not able to|no one|no technique|no chart|nothing (?:here|in (?:your|the) chart|in astrology))\b[^.!?]{0,40}\b(predict\w*|foretell\w*|forecast\w*|determin\w*|say|tell|know|promise\w*|guarantee\w*)\b/i;
const DISCLAIMER_HI = /(भविष्यवाणी|predict|bata|बता)\S*\s*(नहीं|nahi|nahin)|(नहीं|nahi|nahin)\s*(कर|kar|bata|बता)\s*(सकत|sakt)/i;

const SUBJECT_CHILD = /\b(child|children|son|daughter|baby|kids?|bachch\w*|bacch\w*|beta|beti|santan|santaan)\b|बच्च|संतान|बेटा|बेटी/i;
const SUBJECT_PARTNER = /\b(spouse|partner|husband|wife|widow\w*|vaidhavya|vidh[wv]a|pati|patni|jeevansathi|jivansathi)\b|पति|पत्नी|जीवनसाथी|विधवा|वैधव्य/i;
const SUBJECT_PARENT = /\b(mother|father|parents?|mom|dad|maa|pita|mata)\b|माता|पिता|माँ/i;

function langOf(s: string): HarmLang {
  if (/[ऀ-ॿ]/.test(s)) return 'hi';
  return (s.match(HINGLISH_MARKERS) || []).length >= 2 ? 'hinglish' : 'en';
}

function subjectOf(s: string): HarmSubject {
  if (SUBJECT_CHILD.test(s)) return 'child';
  if (SUBJECT_PARTNER.test(s)) return 'partner';
  if (SUBJECT_PARENT.test(s)) return 'parent';
  return 'self';
}

/** Classify one clause; null when it is not a harmful prediction. */
function classify(clause: string): HarmDomain | null {
  const s = clause;
  if (DISCLAIMER_EN.test(s) || DISCLAIMER_HI.test(s)) return null;
  // Hindi / Hinglish — the terms are specific enough to need no extra cue.
  if (ACCIDENT_HI.test(s) || ACCIDENT_HG.test(s)) return 'accident';
  if (DEATH_HI.test(s) || DEATH_HG.test(s)) return 'death';
  if (ILLNESS_HI.test(s) || ILLNESS_HG.test(s)) return 'illness';
  if ((MARRIAGE_HI.test(s) && CERTAIN_HI.test(s)) || (MARRIAGE_HG.test(s) && CERTAIN_HG.test(s))) return 'marriage-certainty';
  // English.
  if (DIVORCE_EN.some(re => re.test(s))) return 'divorce';
  if (MARRIAGE_CERTAIN_EN.some(re => re.test(s))) return 'marriage-certainty';
  const cue = CUE_EN.test(s) || langOf(s) === 'hinglish';
  if (!cue) return null;
  if (ACCIDENT_EN.test(s)) return 'accident';
  if (DEATH_EN.test(s)) return 'death';
  if (ILLNESS_EN.test(s)) return 'illness';
  return null;
}

/** The timing window mentioned in the sentence, if any (kept in the rephrase). */
function windowOf(s: string, lang: HarmLang): string {
  const range = s.match(new RegExp(`\\b(${MONTHS})\\s+(\\d{4})\\s*(?:to|–|-|until|till|se)\\s*(${MONTHS})\\s+(\\d{4})`, 'i'));
  if (range) {
    const a = `${range[1]} ${range[2]}`, b = `${range[3]} ${range[4]}`;
    return lang === 'en' ? `from ${a} to ${b}` : lang === 'hinglish' ? `${a} se ${b} tak` : `${a} से ${b} तक`;
  }
  const dasha = s.match(/((?:\b[A-Z][a-z]+[\s–-]){0,2})\b([Aa]ntar ?dasha|[Mm]aha ?dasha|[Pp]ratyantardasha|[Dd]asha)\b/);
  if (dasha) {
    const lords = dasha[1].replace(/\b(Your|The|In|During|This|That|A|An|Aapki|Aapke)\b[\s–-]*/g, '');
    const d = `${lords}${dasha[2]}`.trim();
    return lang === 'en' ? `during your ${d}` : d;
  }
  const year = s.match(/\b((?:19|20)\d{2})\b/);
  if (year) return lang === 'en' ? `in ${year[1]}` : year[1];
  return '';
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * The caring, practical rephrase for one harmful sentence — FOUNDER-APPROVED wording
 * (23 Oct 2026). Own danger period → sensitive-period care; spouse / parent / relative
 * → elders & family need your time and support; accident → travel & driving care;
 * child → routine health care + check-ups; marriage certainty → a window of
 * possibility; divorce → patience and communication. The timing window, if one was
 * given, is kept in brackets.
 */
export function cautionFor(f: Pick<HarmFinding, 'domain' | 'subject' | 'lang'>, window = ''): string {
  const { domain, subject, lang } = f;
  const w = window ? ` (${window})` : '';
  const family = subject === 'partner' || subject === 'parent';
  if (lang === 'en') {
    const when = window || 'in this period'; // "in this period" becomes the real window when one was given
    if (domain === 'accident') return `Take extra care while travelling and driving ${when}.`;
    if (domain === 'marriage-certainty') {
      const lead = /^in \d{4}$/.test(window) ? window.slice(3) : window.startsWith('during your ') ? `Your ${window.slice(12)}` : `The window ${window}`;
      return window
        ? `${lead} is a supportive time for marriage matters — a period of possibility, not a promise; much depends on your own choices and circumstances.`
        : `Marriage timing varies a lot from person to person — your chart shows windows of possibility, not a set outcome; much depends on your own choices and circumstances.`;
    }
    if (domain === 'divorce') return `Your relationship asks for extra patience and open, honest communication ${when}.`;
    if (subject === 'child') return `Keep an eye on your child's routine health care ${when}; regular check-ups are a good idea.`;
    if (family) return `Elders or family members may need more of your time and support ${when} — stay close and keep an eye on their health.`;
    return `This is a sensitive period${w} — take good care of your health, avoid unnecessary risks, and don't skip check-ups.`;
  }
  if (lang === 'hinglish') {
    if (domain === 'accident') return `Is samay${w} yatra aur driving mein savdhani rakhein.`;
    if (domain === 'marriage-certainty') return `${window ? `${window} ka samay` : 'Yeh samay'} shaadi ke liye anukool hai — yeh sambhavna ka samay hai, baaki aapke faislon aur paristhitiyon par nirbhar karta hai.`;
    if (domain === 'divorce') return `Is samay${w} rishte mein dhairya aur khulkar baat-cheet par dhyan dein.`;
    if (subject === 'child') return `Is samay${w} bachche ki routine health care par nazar rakhein; regular check-up karwana achha rahega.`;
    if (family) return `Is samay${w} parivaar ke badon aur apno ko aapke samay aur saath ki zaroorat ho sakti hai — unke paas rahein aur unki sehat ka dhyan rakhein.`;
    return `Is samay${w} apni sehat ka khaas dhyan rakhein, bina wajah jokhim na lein aur check-up na chhodein.`;
  }
  if (domain === 'accident') return `इस समय${w} यात्रा और गाड़ी चलाते समय विशेष सावधानी रखें।`;
  if (domain === 'marriage-certainty') return `${window ? `${window} का समय` : 'यह समय'} विवाह के लिए अनुकूल है — यह संभावना का समय है; बाकी आपके फैसलों और परिस्थितियों पर निर्भर करता है।`;
  if (domain === 'divorce') return `इस समय${w} रिश्ते में धैर्य और खुलकर बातचीत पर ध्यान दें।`;
  if (subject === 'child') return `इस समय${w} बच्चे की नियमित स्वास्थ्य देखभाल पर ध्यान रखें; समय-समय पर जाँच करवाना अच्छा रहेगा।`;
  if (family) return `इस समय${w} परिवार के बड़ों का विशेष ध्यान रखें — उन्हें आपके समय और साथ की आवश्यकता हो सकती है।`;
  return `इस समय${w} अपनी सेहत का विशेष ध्यान रखें, अनावश्यक जोखिम से बचें और नियमित जाँच न छोड़ें।`;
}

/** Split into sentences, keeping the trailing punctuation/whitespace of each. */
function sentences(text: string): string[] {
  return text.match(/[^.!?।\n]+(?:[.!?।]+|$)\s*|\n+/g) || [];
}

/** Find the harmful-prediction sentences in a text (no rewriting). */
export function findHarmfulPredictions(text: string): HarmFinding[] {
  if (!text) return [];
  const out: HarmFinding[] = [];
  for (const sent of sentences(text)) {
    // Check each clause so "Astrology can't predict this, but your chart shows an early
    // death" is still caught after the disclaimer clause.
    const clauses = sent.split(/,?\s+\b(?:but|however|although|yet|lekin|par|magar)\b\s+|;\s+|\s+—\s+|लेकिन|परंतु/i);
    for (const c of clauses) {
      const domain = classify(c);
      if (domain) { out.push({ domain, subject: subjectOf(sent), lang: langOf(sent), sentence: sent.trim() }); break; }
    }
  }
  return out;
}

/** Labels for the safety scanners ("harmful prediction: death", …). */
export function harmfulPredictionLabels(text: string): string[] {
  return [...new Set(findHarmfulPredictions(text).map(f => `harmful prediction: ${f.domain}`))];
}

/**
 * Rewrite every harmful-prediction sentence into a caring caution (same language,
 * timing window kept). Returns the new text and what was rephrased. Identical
 * cautions are not repeated.
 */
export function rephraseHarmfulPredictions(text: string): { text: string; rephrased: HarmFinding[] } {
  if (!text) return { text, rephrased: [] };
  const rephrased: HarmFinding[] = [];
  const used = new Set<string>();
  const parts = sentences(text).map(sent => {
    const [f] = findHarmfulPredictions(sent);
    if (!f) return sent;
    rephrased.push(f);
    const caution = cautionFor(f, windowOf(sent, f.lang));
    if (used.has(caution)) return '';
    used.add(caution);
    const trailing = sent.match(/\s*$/)?.[0] || ' ';
    return caution + (trailing || ' ');
  });
  if (!rephrased.length) return { text, rephrased };
  return { text: parts.join('').replace(/[ \t]+\n/g, '\n').trim(), rephrased };
}
